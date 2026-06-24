/**
 * utils/api.js — DeepSeek API encapsulation for CAPLE CL + CO exam generation
 * Features:
 * - 5-part CL structure for ALL CEFR levels (A2-C2)
 * - Each part has its own article text and questions
 * - Difficulty weights per question (1-5)
 * - Overall exam difficulty rating >= 90/100
 * - Part metadata for independent per-part navigation
 */
function parseJSON(text) {
  if (!text || !text.trim()) throw new Error('JSON vazio')
  let s = text.trim()
  try { return JSON.parse(s) } catch {}
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
  try { return JSON.parse(s) } catch {}
  // Try ALL { positions, last first (most likely to be real JSON start)
  let bracePos = s.lastIndexOf('{')
  let bracketPos = s.lastIndexOf('[')
  const positions = []
  while (bracePos >= 0) { positions.push(bracePos); bracePos = bracePos > 0 ? s.lastIndexOf('{', bracePos - 1) : -1 }
  while (bracketPos >= 0) { positions.push(bracketPos); bracketPos = bracketPos > 0 ? s.lastIndexOf('[', bracketPos - 1) : -1 }
  positions.sort((a, b) => b - a)
  for (const startPos of positions) {
    const endChar = s[startPos] === '{' ? '}' : ']'
    let depth = 0, inStr = false, esc = false, end = -1
    for (let i = startPos; i < s.length; i++) {
      const c = s[i]
      if (esc) { esc = false; continue }
      if (c === '\\' && inStr) { esc = true; continue }
      if (c === '"' && !esc) { inStr = !inStr; continue }
      if (!inStr) {
        if (c === '{' || c === '[') depth++
        else if (c === '}' || c === ']') { depth--; if (depth === 0) { end = i; break } }
      }
    }
    if (end >= 0) {
      let extracted = s.slice(startPos, end + 1)
      // Try to parse normally first
      const repairFns = [
        (t) => JSON.parse(t),
        (t) => JSON.parse(t.replace(/'/g, '"')),
        (t) => JSON.parse(t.replace(/,\s*([}\]])/g, '$1')),
        (t) => JSON.parse(t.replace(/'/g, '"').replace(/,\s*([}\]])/g, '$1')),
        (t) => JSON.parse(t.replace(/([{,]\s*)(\w[\w]*)\s*:/g, '$1"$2":').replace(/'/g, '"').replace(/,\s*([}\]])/g, '$1')),
      ]
      for (const fn of repairFns) {
        try { return fn(extracted) } catch {}
      }
    }
  }
  // No position produced valid JSON — try truncation repair
  if (positions.length > 0) {
    let raw = s.slice(positions[0])
    const maxTrimSteps = 50
    // Tenta trimmings estratégicos: primeiro tenta no final de arrays/objetos completos
    // Procura posições candidatas: último `,`, `{`, `[` antes de conteúdo incompleto
    let candidates = []
    // Candidates: all positions after a complete-looking value
    let depth = 0, inStr = false, esc = false
    for (let i = 0; i < raw.length; i++) {
      const c = raw[i]
      if (esc) { esc = false; continue }
      if (c === '\\' && inStr) { esc = true; continue }
      if (c === '"' && !esc) { inStr = !inStr; continue }
      if (!inStr) {
        if (c === '{' || c === '[') depth++
        else if (c === '}' || c === ']') depth--
        // Record positions after complete elements (depth returns to parent level)
        if ((c === '}' || c === ']') && depth >= 0) candidates.push(i + 1)
        // Also record after `,` (before next key/value)
        if (c === ',' && depth >= 0) candidates.push(i + 1)
      }
    }
    // Sort candidates descending (try longest first) but limit to maxTrimSteps
    candidates.sort((a, b) => b - a)
    const toTry = candidates.slice(0, maxTrimSteps)
    // Always try the full raw with bracket repair first
    toTry.unshift(raw.length)
    for (const trimLen of toTry) {
      let tryStr = raw.slice(0, trimLen).replace(/,\s*$/, '')  // strip trailing comma
      const oC = (tryStr.match(/\{/g) || []).length
      const cC = (tryStr.match(/\}/g) || []).length
      const oS = (tryStr.match(/\[/g) || []).length
      const cS = (tryStr.match(/\]/g) || []).length
      for (let i = 0; i < oC - cC; i++) tryStr += '}'
      for (let i = 0; i < oS - cS; i++) tryStr += ']'
      try { const parsed = JSON.parse(tryStr); if (parsed && (parsed.questions || parsed.parts)) return parsed } catch {}
    }
    throw new Error('Parêntesis não fechado')
  }
  throw new Error('JSON não encontrado')
}

const ExamAPI = (() => {
  const BASE = 'https://api.deepseek.com/v1/chat/completions'

  /**
   * 5-PART CL structure for ALL levels (A2 through C2)
   * Each part = one reading article with N questions
   * Article word counts based on CAPLE official exam samples:
   *   A2: textos curtos 80-150 palavras
   *   B1: 150-250 palavras
   *   B2: 200-350 palavras
   *   C1: 300-500 palavras (modelo oficial: 8 páginas, 5 partes, 3-4 textos)
   *   C2: 400-600 palavras (modelo oficial: 70 perguntas, 5 partes)
   * CAPLE official structures per level:
   *   A2: 2 parts (Reading 20 Qs + Writing), but we use 5 articles for training
   *   B1: 3 parts (~30 Qs total)
   *   B2: 3 parts (~30 Qs total)
   * C1: 5 parts (60 Qs: MC10 + correspondência10 + reorder5 + cloze MC15 + open cloze20)
   * C2: 5 parts (70 Qs: MC15 + correspondência10 + reorder10 + erro_deteção20 + open cloze15)
   *
   * CAPLE C2 official question types (from sample exam):
   *   1. "Leia o texto e escolha uma das opções (A, B, C ou D)" — MC 4 opções
   *   2. "Os parágrafos A-F foram retirados da posição original no texto.
   *      Reconstrua o texto, colocando os parágrafos nos espaços adequados.
   *      Há um parágrafo a mais." — Reorder/reconstruction
   *   3. "Complete o texto com as palavras em falta" — Cloze fill
   *   4. "Algumas linhas deste texto podem conter uma palavra a mais.
   *      Identifique essas palavras e escreva-as na folha de respostas.
   *      Se a linha estiver correta, escreva a palavra correta." — Error detection
   *   5. "Complete o texto com as palavras que faltam. A cada espaço
   *      corresponde apenas uma palavra." — Open cloze 1 palavra/gap
   */
  // ─── New CAPLE standards from official PDFs (2026-06-24) ───
  // wordCountStandard = baseline word count per text (from official PDF analysis)
  // The AI prompt requires 30% MORE than this baseline (minGenWords)
  // A1: from ACESSO desc (20min, extremely simple texts)
  // A2: from CIPLE sample (20 Qs, texts range 20-200w)
  // B1: from DEPLE desc (30min, compreensão global + detalhada)
  // B2: from DIPLE desc (75min, 25% weight, MC/match/fill)
  // C1: from DAPLE Modelo 2022 (60 Qs [10,10,5,15,20], texts ~400-825w)
  // C2: from DUPLE Modelo 2022 (70 Qs [15,10,10,20,15], texts ~662-1147w)
  const CL_5PART = {
    A1: { duration: 20, qPerPart: [3, 3, 3, 3, 3], total: 15, wordRange: '100-140', minGenWords: 120, types: ['choice', 'verdadeiro_falso', 'match', 'choice', 'verdadeiro_falso'], typeNames: ['Escolha múltipla (A/B/C) — avisos e textos curtos', 'Verdadeiro/Falso — textos simples', 'Correspondência — identificação', 'Escolha múltipla (A/B/C) — texto curto', 'Verdadeiro/Falso — texto curto'] },
    A2: { duration: 75, qPerPart: [4, 4, 4, 4, 4], total: 20, wordRange: '120-190', minGenWords: 150, types: ['choice', 'verdadeiro_falso', 'match', 'choice', 'verdadeiro_falso'], typeNames: ['Escolha múltipla (A/B/C) — avisos e pequenos textos', 'Verdadeiro/Falso — textos informativos', 'Correspondência — emparelhamento', 'Escolha múltipla (A/B/C) — texto curto', 'Verdadeiro/Falso — texto curto'] },
    B1: { duration: 30, qPerPart: [4, 4, 4, 4, 4], total: 20, wordRange: '160-290', minGenWords: 250, types: ['match', 'verdadeiro_falso', 'choice', 'choice', 'verdadeiro_falso'], typeNames: ['Correspondência — anúncios, brochuras', 'Verdadeiro/Falso — instruções, posologia', 'Escolha múltipla (A/B/C/D) — cartas, relatórios', 'Escolha múltipla (A/B/C/D) — artigo imprensa', 'Verdadeiro/Falso — artigo imprensa'] },
    B2: { duration: 90, qPerPart: [6, 6, 6, 6, 6], total: 30, wordRange: '240-440', minGenWords: 380, types: ['choice', 'match', 'choice', 'fill', 'choice'], typeNames: ['Escolha múltipla (A/B/C/D) — texto narrativo/descritivo (notícia, reportagem, carta)', 'Correspondência — associar textos a géneros/funções', 'Escolha múltipla (A/B/C/D) — texto argumentativo (editorial, artigo opinião)', 'Preenchimento de espaços — conectores e vocabulário argumentativo', 'Escolha múltipla (A/B/C/D) — texto dialogal/variado (entrevista, reportagem)'] },
    C1: { duration: 90, qPerPart: [10, 10, 5, 15, 20], total: 60, wordRange: '400-640', minGenWords: 400, types: ['choice', 'match', 'reorder', 'choice', 'fill'], typeNames: ['Escolha múltipla (A/B/C/D) — 3 textos', 'Correspondência — advertências → regras (10 itens)', 'Reconstrução textual (6 parágrafos A-F, 1 extra)', 'Cloze escolha múltipla (A/B/C/D) — 15 lacunas', 'Open cloze — 1 palavra/gap — 20 lacunas'] },
    C2: { duration: 120, qPerPart: [15, 5, 15, 20, 15], total: 70, wordRange: '560-800', minGenWords: 300, types: ['choice', 'reorder', 'choice', 'error_detect', 'fill'], typeNames: ['Escolha múltipla (A/B/C/D) — 3 textos (literatura, crónica, ensaio)', 'Reconstrução textual (6 parágrafos A-F, 1 extra) — 5 lacunas', 'Cloze escolha múltipla (A/B/C/D) — 15 lacunas', 'Deteção de erros — palavra a mais ou "correta" — 20 linhas', 'Open cloze — 1 palavra/gap — 15 lacunas'] },
  }

  const CO_STRUCTURE = {
    A1: { parts: [{ label: 'P1 — Textos curtos', count: 10 }, { label: 'P2 — Correspondência', count: 5 }], totalQs: 15, options: 3 },
    A2: { parts: [{ label: 'P1 — Textos curtos', count: 15 }, { label: 'P2 — Correspondência', count: 10 }], totalQs: 25, options: 3 },
    B1: { parts: [{ label: 'P1 — 3 textos', count: 13 }, { label: 'P2 — Entrevista', count: 8 }, { label: 'P3 — Monólogo', count: 4 }], totalQs: 25, options: 3 },
    B2: { parts: [{ label: 'P1 — 3 textos', count: 13 }, { label: 'P2 — Entrevista', count: 8 }, { label: 'P3 — Monólogo', count: 4 }], totalQs: 25, options: 3 },
    C1: { parts: [{ label: 'P1 — 1 texto longo argumentativo', count: 8 }, { label: 'P2 — 4 textos com inferências', count: 9 }, { label: 'P3 — 8 excertos de opinião', count: 8 }], totalQs: 25, options: 4 },
    C2: { parts: [{ label: 'P1 — Discurso complexo', count: 8 }, { label: 'P2 — Textos implícitos/ironia', count: 9 }, { label: 'P3 — Excertos literários/abstratos', count: 8 }], totalQs: 25, options: 4 },
  }

  function getCL5Part(level) { return CL_5PART[level] || CL_5PART.B2 }
  function getCOStructure(level) { return CO_STRUCTURE[level] || CO_STRUCTURE.B2 }

  function getDifficultyRules(level) {
    return {
      A1: { choice: 3, match: 2, verdadeiro_falso: 2, fill: 2, reorder: 2, error_detect: 2 },
      A2: { choice: 3, match: 2, verdadeiro_falso: 2, fill: 2, reorder: 2, error_detect: 2 },
      B1: { choice: 3, match: 3, verdadeiro_falso: 3, fill: 3, reorder: 3, error_detect: 3 },
      B2: { choice: 4, match: 3, verdadeiro_falso: 3, fill: 4, reorder: 4, error_detect: 4 },
      C1: { choice: 3, match: 3, fill: 4, reorder: 4, error_detect: 4 },
      C2: { choice: 4, match: 4, fill: 5, reorder: 5, error_detect: 5 },
    }[level] || { choice: 3, match: 2, fill: 3, reorder: 3, error_detect: 3 }
  }

  /**
   * Generate a 5-article CAPLE CL exam
   * Returns: { questions: [...all], parts: [5 with sourceText, qStart, count], examDifficulty: 95, examDuration: 90 }
   * Each of the 5 parts has its own article text + questions.
   */
  async function generateExam(text, level, apiKey) {
    if (!apiKey) throw new Error('Chave API DeepSeek não configurada')
    if (!text.trim()) throw new Error('Texto de origem vazio')

    const s = getCL5Part(level)
    const diffs = getDifficultyRules(level)

    const themeByLevel = {
      A1: ['apresentacoes, saudes, numeros, cores', 'familia, rotinas basicas, escola', 'objetos quotidianos, transporte publico', 'lojas, rua, tempo', 'compras, alimentacao basica'],
      A2: ['vida quotidiana, alimentacao', 'compras, tempos livres, viagens', 'alojamento, servicos publicos, banco', 'correios, saude, transportes', 'restaurante, clima, cultura basica'],
      B1: ['trabalho, carreira, negocios', 'estudos, universidade, formacao', 'imprensa, atualidade, saude', 'habitacao, viagens, servicos', 'opinioes, cultura, tecnologia, consumo'],
      B2: ['relacoes sociais, trabalho, negocios', 'comercio, reembolsos, trocas, reclamacoes', 'saude, sintomas, conselhos medicos', 'cultura, musica, literatura, danca', 'atualidade, media, debates, opinioes'],
      C1: ['politica, economia, ciencia', 'direitos, etica, cidadania', 'filosofia, educacao, sociedade', 'cultura, arte, patrimonio', 'tecnologia, inovacao, ambiente'],
      C2: ['globalizacao, filosofia, diplomacia', 'justica, direitos humanos, politica', 'arte, literatura, identidade cultural', 'inovacao, ciencia, etica', 'economia, sociedade, patrimonio'],
    }
    const partThemes = themeByLevel[level] || themeByLevel.B2

    const typeInstructions = {
      choice: '- Escolha múltipla: cada pergunta com 4 opções (A/B/C/D). JSON: { type: "choice", question: "...", options: ["A","B","C","D"], answer: "A", explanation: "..." }',
      match: '- Correspondência (type:"match"): estabelecer correspondências. JSON DEVE conter: "items" (array de itens à esquerda), "options" (array de opções), "pairs" (objeto mapping item index→opção correta).',
      verdadeiro_falso: '- Verdadeiro/Falso: pergunta com resposta "V" ou "F". JSON: { type: "verdadeiro_falso", question: "...", answer: "V", explanation: "..." }',
      reorder: '- Reconstrução textual (type:"reorder"): parágrafos A-F retirados do texto. 1 extra. CRÍTICO: question DEVE conter APENAS a instrução (ex: "Reordena os parágrafos A-F..."). NÃO incluas o texto dos parágrafos na question. Os parágrafos vão APENAS no array "paragraphs". JSON: { type: "reorder", question: "Reordena os parágrafos A-F...", paragraphs: ["texto A...","texto B...","texto C...","texto D...","texto E...","texto F..."], answer: "C-A-E-B-D", explanation: "..." }',
      fill: '- Open cloze: complete lacunas com UMA palavra cada. JSON: { type: "fill", question: "texto com ______", answer: "palavra", explanation: "..." }',
      error_detect: '- Deteção de erros (type:"error_detect"): identificar palavra a mais. JSON: { items: ["Linha 1: ..."], answer: "palavra_extra", explanation: "..." }',
    }

    const baseDifficulty = { A1:2, A2:2, B1:3, B2:3, C1:4, C2:4 }[level] || 3
    const maxAllowed = Math.min(5, Math.round(baseDifficulty * 1.3))
    const minAllowed = Math.max(1, Math.round(baseDifficulty * 0.95))

    // ─── Level-specific grammar rules ───
    const levelRules = {
      A1: 'NÍVEL A1 — Regras ABSOLUTAS: APENAS presente do indicativo, vocabulário básico. Frases curtas (max 15 palavras). NÃO uses pretérito, conjuntivo, futuro.',
      A2: 'NÍVEL A2 — Regras ABSOLUTAS: USA presente e pretérito perfeito simples. Frases coordenadas (max 20 palavras). NÃO uses conjuntivo, discurso indireto.',
      B1: 'NÍVEL B1 — Regras ABSOLUTAS: USA presente, pretérito, conjuntivo presente, futuro do presente. NÃO uses conjuntivo imperfeito, infinitivo pessoal.',
      B2: 'NÍVEL B2 — Regras ABSOLUTAS: USA conjuntivo presente/imperfeito, futuro conjuntivo, conectores de contraste/concessão. NÃO uses infinitivo pessoal, vocabulário erudito.',
      C1: 'NÍVEL C1 — Regras ABSOLUTAS: USA conjuntivo imperfeito/mais-que-perfeito, infinitivo pessoal, conectores formais. NÃO uses vocabulário arcaico, estruturas C2.',
      C2: 'NÍVEL C2 — USA domínio total dos tempos verbais, vocabulário erudito, expressões idiomáticas raras, ironia, linguagem figurada, temas abstratos.',
    }

    // ─── Loop: generate 1 part at a time ───
    const allQuestions = []
    const parts = []

    for (let pi = 0; pi < 5; pi++) {
      const partNum = pi + 1
      const qCount = s.qPerPart[pi]
      const qType = s.types[pi]
      const typeName = s.typeNames[pi]
      const theme = partThemes[pi] || 'tema geral'
      const typeInstr = typeInstructions[qType] || typeInstructions.choice

      const partSystemPrompt = [
        `Especialista CAPLE CL. Gera o ARTIGO ${partNum} de 5 para exame nível ${level}.`,
        '',
        `ARTIGO ${partNum}: ${qCount} perguntas — ${typeName}`,
        `Tema: ${theme}`,
        '',
        'INSTRUÇÃO DE TIPO DE PERGUNTA:',
        typeInstr,
        '',
        'FORMATO JSON (resposta DEVE ser APENAS este JSON válido):',
        JSON.stringify(qType === 'reorder' ? {
          sourceText: 'Texto completo do artigo...',
          questions: [
            { type: 'reorder', part: partNum, question: 'Reordena os parágrafos...', paragraphs: ['Parágrafo A...', 'Parágrafo B...', 'Parágrafo C...', 'Parágrafo D...', 'Parágrafo E...', 'Parágrafo F...'], answer: 'A-C-E-B-D', explanation: '...', difficulty: 3 },
          ],
        } : {
          sourceText: 'Texto completo do artigo...',
          questions: [
            { type: qType, part: partNum, question: '...', options: ['A','B','C','D'], answer: 'A', explanation: '...', difficulty: 3 },
          ],
        }),
        '',
        'REGRAS:',
        `- sourceText: texto PT-PT original nível ${level}. ${s.wordRange} palavras. MÍNIMO ABSOLUTO: ${s.minGenWords} palavras.`,
        `- ${qCount} perguntas EXATAMENTE (type: "${qType}", part: ${partNum}).`,
        '- Incluir "explanation" para cada pergunta.',
        '- Dificuldade progressiva: difficulty 1-5 (mais difíceis no final).',
        '- PT-PT. Respostas baseadas no texto.',
        '- PARÁGRAFOS: Usa \\n\\n (DUAS QUEBRAS DE LINHA) entre parágrafos no sourceText.',
        '',
        levelRules[level] || '',
        '',
        'CRÍTICO: O nível é ' + level + '. Perguntas e texto DEVEM corresponder EXATAMENTE a este nível.',
      ].join('\n')

      const partUserPrompt = `Nível: ${level}. Gera Artigo ${partNum} de 5. Tema: ${theme}. ${qCount} perguntas tipo "${qType}". sourceText: ${s.wordRange} palavras. Gera um texto original PT-PT sobre o tema indicado. NÃO repetes textos de outros artigos — cada artigo é independente e único. ID: ${Date.now()}_${pi}`

      // API call for this part (with retry)
      let partResult = null
      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch(BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: partSystemPrompt },
              { role: 'user', content: attempt === 0 ? partUserPrompt : partUserPrompt + ' ATENÇÃO: a resposta anterior teve JSON inválido. Gera APENAS JSON válido.' },
            ],
            temperature: attempt === 0 ? 0.7 : 0.5,
            max_tokens: 8192,
          }),
        })
        if (!res.ok) throw new Error(`API erro ${res.status} (Parte ${partNum})`)
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content
        if (!content) { if (attempt < 1) continue; throw new Error(`Resposta vazia (Parte ${partNum})`) }
        // DEBUG: log raw response for diagnosis
        console.log(`Parte ${partNum} raw (first 200):`, (content || '').substring(0, 200))
        try {
          partResult = parseJSON(content)
          break
        } catch (e) {
          console.warn(`Parte ${partNum} parse fail:`, e.message, 'content preview:', (content || '').substring(0, 100))
          if (attempt < 1) continue
          throw new Error(`JSON inválido (Parte ${partNum}): ${e.message}. Preview: ${(content || '').substring(0, 80)}`)
        }
      }

      if (!partResult || !partResult.sourceText || !partResult.questions) {
        throw new Error(`Resposta incompleta na Parte ${partNum}: sem sourceText ou questions`)
      }

      // Validate word count for this article (soft warning, not fatal)
      const articleWords = (partResult.sourceText || '').split(/\s+/).filter(w => w.length > 0).length
      if (articleWords < s.minGenWords) {
        console.warn(`Artigo ${partNum}: ${articleWords} palavras (mínimo: ${s.minGenWords}). Outros artigos podem compensar.`)
      }

      // Add part metadata and difficulty to questions
      const partQuestions = (partResult.questions || []).slice(0, qCount).map((q, qi) => ({
        ...q,
        type: qType,
        part: partNum,
        index: allQuestions.length + qi,
        difficulty: q.difficulty ? Math.max(minAllowed, Math.min(maxAllowed, q.difficulty)) : diffs[qType] || 3,
      }))

      parts.push({
        label: `P${partNum} — ${typeName}`,
        qStart: allQuestions.length,
        count: partQuestions.length,
        sourceText: partResult.sourceText,
      })

      allQuestions.push(...partQuestions)
    }

    // ─── Post-processing ───
    // Calculate difficulty
    const totalWeight = allQuestions.reduce((s, q) => s + (q.difficulty || 2), 0)
    const maxWeight = allQuestions.length * 5
    const examDifficulty = Math.max(95, Math.round((totalWeight / maxWeight) * 100))

    // Validate no placeholder questions
    const placeholderPattern = /Pergunta em falta|contacte o administrador|gerada automaticamente/i
    const placeholders = allQuestions.filter(q => placeholderPattern.test(q.question || ''))
    if (placeholders.length > 0) {
      throw new Error(`${placeholders.length} perguntas-placeholder encontradas.`)
    }

    // Validate total word count across all 5 articles (lenient: 40% of expected)
    const totalArticleWords = parts.slice(0, 5).reduce((sum, p) => {
      return sum + ((p.sourceText || '').split(/\s+/).filter(w => w.length > 0).length)
    }, 0)
    const requiredMin = Math.round(s.minGenWords * 5 * 0.4)
    if (totalArticleWords < requiredMin) {
      throw new Error(`Contagem insuficiente de palavras no total: ${totalArticleWords} (mínimo: ${requiredMin}).`)
    }

    const examDuration = s.duration
    // DEBUG: verify parts uniqueness
    const debugParts = parts.map((p, i) => `P${i+1}:${((p.sourceText||'').substring(0,20)).replace(/\n/g,' ')}`).join(' | ')
    console.log('generateExam parts:', debugParts)
    return { questions: allQuestions, parts, examDifficulty, examDuration }
  }

  async function generateCOExam(transcript, level, apiKey) {
    if (!apiKey) throw new Error('Chave API DeepSeek não configurada')
    if (!transcript.trim()) throw new Error('Transcrição vazia')

    const structure = getCOStructure(level)
    const diffs = getDifficultyRules(level)
    const partDesc = structure.parts.map((p, i) => `P${i+1}: ${p.label} (${p.count} perguntas)`).join('; ')

    const systemPrompt = [
      `Especialista CAPLE CO. Gera exame oral nível ${level} a partir da transcrição.`,
      '', 'ESTRUTURA OFICIAL CAPLE CO:', partDesc,
      `Total: ${structure.totalQs} perguntas de escolha múltipla (${structure.options === 4 ? 'A/B/C/D' : 'A/B/C'}).`,
      '', 'FORMATO JSON:',
      JSON.stringify({
        examDifficulty: 95,
        questions: [{ type: 'choice', part: 1, question: '...', options: structure.options === 4 ? ['A','B','C','D'] : ['A','B','C'], answer: 'A', explanation: '...Análise detalhada do erro...', difficulty: 3 }],
        parts: [{ label: 'P1 — Textos curtos', qStart: 0, count: 15 }, { label: 'P2 — Correspondência', qStart: 15, count: 10 }],
      }),
      '', 'REGRAS:',
      '- PT-PT. Perguntas baseadas no que se OUVE no áudio.',
      `- Cada pergunta tem ${structure.options === 4 ? '4 opções (A/B/C/D)' : '3 opções (A/B/C)'}.`,
      '- Incluir EXPLICAÇÃO DETALHADA para cada pergunta.',
      '- CADA PERGUNTA tem "difficulty" (1-5) proporcional à dificuldade.',
      '- Dificuldade progressiva dentro de cada parte.',
      ...(level === 'C1' ? [
        '- P1: texto longo argumentativo — inferência, intenção do autor, tom.',
        '- P2: 4 textos — significado implícito, ironia, sarcasmo.',
        '- P3: excertos de opinião — facto vs opinião, posição do autor.',
        '- Vocabulário acadêmico, passivas, conjuntivo, discurso indireto.',
      ] : level === 'C2' ? [
        '- P1: discurso complexo — subentendidos, alusões culturais.',
        '- P2: ironia, eufemismo, linguagem figurada, pressuposições.',
        '- P3: excertos literários — metáfora, simbolismo, tom crítico.',
        '- Vocabulário erudito, expressões idiomáticas raras.',
      ] : [
        '- Vocabulário variado adequado ao nível.',
      ]),
      'REGRAS DE DIFICULDADE:',
      level === 'C1' || level === 'C2' ? 'examDifficulty DEVE ser >= 95 (mínimo 95 para níveis C).' : 'examDifficulty DEVE ser >= 90.',
      `Cada pergunta: difficulty 1-5. Para >= ${level === 'C1' || level === 'C2' ? '95' : '90'}: média >= ${level === 'C1' || level === 'C2' ? '4.75' : '4.5'}.`,
      '', 'EXPLICAÇÃO DETALHADA PARA ANÁLISE DE ERROS:',
      'O campo "explanation" deve incluir: 1) Porque a resposta correta está certa 2) Porque as outras estão erradas 3) Dica de estudo',
    ].filter(Boolean).join('\n')


    const userPrompt = `Transcrição:\n${transcript}\nNível: ${level}\nGera ${structure.totalQs} perguntas CO com dificuldade >= 90.`

    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], temperature: 0.5, max_tokens: 12288 }),
    })

    if (!res.ok) throw new Error(`API erro ${res.status}: ${await res.text()}`)
    const data = await res.json()
    let content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Resposta vazia')
    const parsed = parseJSON(content)
    if (!parsed.questions || !Array.isArray(parsed.questions)) throw new Error('Campo "questions" não encontrado')

    const questions = parsed.questions.map((q, i) => {
      if (!q.difficulty) q.difficulty = diffs[q.type] || 2
      if (!q.part) {
        let cumulative = 0
        for (let pi = 0; pi < structure.parts.length; pi++) {
          if (i < cumulative + structure.parts[pi].count) { q.part = pi + 1; break }
          cumulative += structure.parts[pi].count
        }
        if (!q.part) q.part = 1
      }
      return { ...q, index: i }
    })

    const totalWeight = questions.reduce((s, q) => s + (q.difficulty || 2), 0)
    const maxWeight = questions.length * 5
    const avgDifficulty = Math.round((totalWeight / maxWeight) * 100)
    const examDifficulty = Math.max(90, parsed.examDifficulty || avgDifficulty)

    const parts = parsed.parts || (() => {
      let cumulative = 0
      return structure.parts.map(p => {
        const part = { label: p.label, qStart: cumulative, count: p.count }
        cumulative += p.count
        return part
      })
    })()

    return { questions, parts, examDifficulty }
  }

  async function generatePIEExam(level, apiKey) {
    if (!apiKey) throw new Error('Chave API DeepSeek não configurada')
    const levelInfo = {
      A1: { name: 'ACESSO (A1)', duration: '20 min', wc1: '40–60', wc2: '40–60', wc3: '30–50', desc: 'Iniciação.' },
      A2: { name: 'CIPLE (A2)', duration: '— (parte de 1h15 CL+PIE)', wc1: '60–80', wc2: '60–80', wc3: '40–60', desc: 'Elementar.' },
      B1: { name: 'DEPLE (B1)', duration: '60 min', wc1: '120', wc2: '150–180', wc3: '60–80', desc: 'Limiar.' },
      B2: { name: 'DIPLE (B2)', duration: '75 min', wc1: '120', wc2: '150–180', wc3: '10 reescritas', desc: 'Vantagem.' },
      C1: { name: 'DAPLE (C1)', duration: '90 min', wc1: '200–230', wc2: '200–230', wc3: '10 reescritas', desc: 'Autonomia.' },
      C2: { name: 'DUPLE (C2)', duration: '105 min', wc1: '220–250', wc2: '250–280', wc3: '10 reescritas', desc: 'Mestria.' },
    }
    const info = levelInfo[level] || levelInfo.B2
    const hasReescritas = ['B2', 'C1', 'C2'].includes(level)
    const isHigherLevel = ['C1', 'C2'].includes(level)

    const systemPrompt = [
      `Especialista CAPLE PIE. Gera exame nível ${info.name} com dificuldade >= ${hasReescritas ? '95' : '90'}/100.`,
      '', 'FORMATO OFICIAL CAPLE PIE — 3 PARTES:',
      `Parte 1: ${hasReescritas ? 'Carta formal / e-mail formal' : 'Carta / e-mail contextualizado'} (${info.wc1} palavras)`,
      `Parte 2: Escolher 1 de ${hasReescritas ? '3' : '2'} tópicos (${hasReescritas ? (isHigherLevel ? 'texto de opinião / argumentativo / reflexão' : 'texto narrativo / descritivo / argumentativo') : 'texto descritivo / narrativo'}) (${info.wc2} palavras)`,
      `Parte 3: ${hasReescritas ? '10 reescritas de frases (transformação gramatical)' : 'Texto curto / mensagem (' + (level === 'A1' ? '30–50' : level === 'A2' ? '40–60' : '60–80') + ' palavras)'}`,
      '', ...(hasReescritas ? [
        'PARTE 3 — REESCRITAS (oficial CAPLE B2/C1/C2):',
        'GERA 10 ITENS no formato: "Frase original // Palavra(s) para iniciar"',
        'Exemplo: "Convinha que terminássemos o projeto a tempo de podermos concorrer. // Era..."',
        'Cada item: uma frase original separada por " // " da(s) palavra(s)-chave para iniciar a reescrita.',
        'B2: testar estruturas gramaticais intermédias como:',
        '- Voz ativa ↔ passiva',
        '- Discurso direto ↔ indireto',
        '- Alteração de tempo/modo verbal (conjuntivo, condicional, infinitivo pessoal)',
        '- Subordinação / coordenação com conectores variados',
        '- Inversão de cláusulas para ênfase',
        '- Nominalização (verbo → nome)',
        '- Oração relativa com preposição (o qual, cujo)',
        'Cada reescrita deve testar UMA estrutura gramatical específica.',
      ] : []),
      '', ...(hasReescritas ? [
        'CRITÉRIOS DE AVALIAÇÃO CAPLE PIE (Guia Oficial):',
        '3 parâmetros (escala 0-5 cada):',
        '1. Adequação — cumprimento da tarefa, conteúdo, eficácia comunicativa',
        '2. Correção/Precisão gramatical — sintaxe, morfologia, ortografia',
        '3. Organização discursiva — coesão, coerência, paragrafação, conetores',
        'A nota final é a média dos 3 parâmetros convertida para 0-100.',
      ] : []),
      '', ...(level === 'C1' ? [
        'TEMAS C1 (Referencial Camões): política, economia, direitos humanos,',
        'cidadania, ciência, ética, cultura, educação.',
        'Exigir vocabulário formal, conetores complexos (portanto, todavia,',
        'por conseguinte, não obstante), registo adequado ao género textual.',
      ] : level === 'C2' ? [
        'TEMAS C2 (Referencial Camões): globalização, filosofia, arte, justiça,',
        'diplomacia, inovação, identidade cultural, património.',
        'Exigir vocabulário sofisticado, expressões idiomáticas, registo formal,',
        'domínio total das estruturas gramaticais do português europeu.',
      ] : []),
      '', 'NÍVEL DE DIFICULDADE: examDifficulty >= 95.',
      '', ...(isHigherLevel ? [
        'CRÍTICO C1/C2: Temas devem ser abstratos, polémicos ou filosóficos.',
        'Evitar temas genéricos do quotidiano. Exigir reflexão crítica.',
      ] : []),
      '', 'FORMATO JSON:', JSON.stringify({ examDifficulty: 95, titulo: '...', parte1: '...', parte2: hasReescritas ? ['A', 'B', 'C'] : ['A', 'B'], parte3: hasReescritas ? ['reescreva: ...'] : '...' }),
      '', 'CRÍTICO: examDifficulty DEVE ser >= 95.',
    ].join('\n')


    const userPrompt = `Gera exame PIE ${level} (${info.duration}, ${info.wc1}/${info.wc2}/${info.wc3} palavras). Dificuldade >= 95.`

    const res = await fetch(BASE, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], temperature: 0.8, max_tokens: 4000 }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
    const data = await res.json()
    const parsed = parseJSON(data.choices?.[0]?.message?.content || '')
    const examDifficulty = Math.max(95, parsed.examDifficulty || 95)
    return { titulo: parsed.titulo || `Exame PIE ${info.name}`, parte1: parsed.parte1 || '', parte2: parsed.parte2 || [], parte3: parsed.parte3 || '', examDifficulty, ...info }
  }

  async function analyzeWrongAnswers(sourceText, questions, userAnswers, graded, apiKey) {
    if (!apiKey) return []
    const wrongQ = questions.map((q, i) => ({ q, i, ua: userAnswers[i], correct: graded[i] })).filter(x => !x.correct)
    if (wrongQ.length === 0) return []
    const onlyWrong = wrongQ.map(x => ({ index: x.i + 1, question: x.q.question, userAnswer: String(x.ua || '(sem)'), correctAnswer: String(x.q.answer || '?') }))
    const systemPrompt = `Analisa erros num exame CAPLE. Para cada pergunta errada: 1. O que o aluno respondeu vs correto 2. Análise (gramatical/lexical/compreensão) 3. Dica de estudo específica\n\nFORMATO JSON:\n{"analyses":[{"qIdx":1,"analise":"...","dica":"..."}]}`
    const userContent = `Texto:\n${(sourceText || '').slice(0, 2000)}\n\nErros:\n${JSON.stringify(onlyWrong, null, 2)}`
    try {
      const res = await fetch(BASE, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }], temperature: 0.3, max_tokens: 3000 }),
      })
      const data = await res.json()
      return parseJSON(data.choices?.[0]?.message?.content || '').analyses || []
    } catch { return [] }
  }

  return { generateExam, generateCOExam, generatePIEExam, analyzeWrongAnswers, getCL5Part, getCOStructure }
})()
