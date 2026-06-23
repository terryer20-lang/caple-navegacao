/**
 * utils/api.js — DeepSeek API 封裝，CAPLE CL 格式
 */
/** JSON lenient parser — repara erros comuns do DeepSeek */
function parseJSON(text) {
  if (!text || !text.trim()) throw new Error('JSON vazio')
  let s = text.trim()

  // 0) Try full text directly first (fast path)
  try { return JSON.parse(s) } catch {}

  // 1) Strip markdown fences (handle ```json ... ```, ``` ... ```, etc.)
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
  try { return JSON.parse(s) } catch {}

  // 2) Find first { ... } or [ ... ] with balanced braces
  //    More robust: count all {} inside strings too (handle nested)
  const firstBrace = s.indexOf('{')
  const firstBracket = s.indexOf('[')
  const start = firstBrace >= 0 && (firstBracket < 0 || firstBrace < firstBracket) ? firstBrace : firstBracket
  if (start < 0) throw new Error('JSON não encontrado')
  const endChar = s[start] === '{' ? '}' : ']'

  // Smart brace matcher — handles escaped quotes, brackets in strings
  let depth = 0, inStr = false, esc = false, end = -1
  for (let i = start; i < s.length; i++) {
    const c = s[i]
    if (esc) { esc = false; continue }
    if (c === '\\' && inStr) { esc = true; continue }
    if (c === '"' && !esc) { inStr = !inStr; continue }
    if (!inStr) {
      if (c === '{' || c === '[') depth++
      else if (c === '}' || c === ']') {
        depth--
        if (depth === 0) { end = i; break }
      }
    }
  }
  if (end < 0) {
    // Fallback: try to find endChar after all braces
    // Maybe the response has trailing garbage after valid JSON
    const lastEnd = s.lastIndexOf(endChar)
    if (lastEnd > start) {
      depth = 0; inStr = false; esc = false; end = -1
      for (let i = start; i <= lastEnd; i++) {
        const c = s[i]
        if (esc) { esc = false; continue }
        if (c === '\\' && inStr) { esc = true; continue }
        if (c === '"' && !esc) { inStr = !inStr; continue }
        if (!inStr) {
          if (c === '{' || c === '[') depth++
          else if (c === '}' || c === ']') {
            depth--
            if (depth === 0) { end = i; break }
          }
        }
      }
    }
    if (end < 0) throw new Error('Parêntesis não fechado')
  }

  s = s.slice(start, end + 1)

  // 3) Progressive repair attempts
  const attempts = [
    (t) => JSON.parse(t),
    // Unquoted single-quoted
    (t) => JSON.parse(t.replace(/'/g, '"')),
    // Trailing commas
    (t) => JSON.parse(t.replace(/,\s*([}\]])/g, '$1')),
    // Both
    (t) => JSON.parse(t.replace(/'/g, '"').replace(/,\s*([}\]])/g, '$1')),
    // Unquoted keys
    (t) => JSON.parse(t.replace(/([{,]\s*)(\w[\w]*)\s*:/g, '$1"$2":').replace(/'/g, '"').replace(/,\s*([}\]])/g, '$1')),
    // Unquoted keys + trailing comma + single quotes — aggressive
    (t) => JSON.parse(
      t.replace(/([{,]\s*)(\w[\w]*)\s*:/g, '$1"$2":')
        .replace(/'/g, '"')
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/,\s*$/, '')
    ),
  ]
  for (const fn of attempts) {
    try { return fn(s) } catch {}
  }
  throw new Error('JSON inválido após tentativas de reparação')
}

const ExamAPI = (() => {
  const BASE = 'https://api.deepseek.com/v1/chat/completions'

  async function generateExam(text, level, apiKey) {
    if (!apiKey) throw new Error('Chave API DeepSeek não configurada')
    if (!text.trim()) throw new Error('Texto de origem vazio')

    const fmt = {
      A1: '20 perguntas. Parte1(15): correspondência 5frases/3textos + MC 5textos curtos + colunas 5afirmações/8opções. Parte2(5): MC texto longo.',
      A2: '20 perguntas. Parte1(15): correspondência 5frases/3textos + MC 5textos curtos + colunas 5afirmações/8opções. Parte2(5): MC texto longo.',
      B1: '30 perguntas. Parte1(10): MC 3textos. Parte2(10): correspondência parágrafos/conteúdos ou reconstrução textual. Parte3(10): preenchimento gaps MC.',
      B2: '30 perguntas. Parte1(10): MC 3textos. Parte2(10): correspondência parágrafos/conteúdos ou reconstrução textual. Parte3(10): preenchimento gaps MC.',
      C1: '60 perguntas. Parte1(10): MC 4opções 3-4textos. Parte2(10): correspondência 10advertências/5-8regras. Parte3(5): reconstrução 6parágrafos/5posições. Parte4(15): cloze MC. Parte5(20): open cloze 1palavra/gap.',
      C2: '70 perguntas. Parte1(15): MC 4opções 3-4textos. Parte2(10): correspondência. Parte3(5): reconstrução. Parte4(15): cloze MC. Parte5(25): open cloze 1palavra/gap.',
    }[level] || '30 perguntas. Parte1 MC. Parte2 correspondência. Parte3 preenchimento.'

    const commonRules = `- PT-PT. Respostas inequívocas baseadas no texto. Incluir explicação cada.\n- Gaps marcados "______". Opções plausíveis. Dificuldade progressiva.\n- ${['C1','C2'].includes(level)?'Vocabulário sofisticado, expressões idiomáticas, construções complexas':['B1','B2'].includes(level)?'Vocabulário variado, conectores complexos':'Vocabulário simples, frases curtas, situações quotidianas'}`

    const systemPrompt = `Especialista CAPLE CL. Gera exame nível ${level} do texto dado.\n\nESTRUTURA:\n${fmt}\n\nFORMATO JSON:\n{"questions":[\n  {"type":"choice","question":"...","options":["A","B","C"|"D"],"answer":"A","explanation":"..."},\n  {"type":"match","question":"...","items":[...],"options":["A","B",...],"pairs":{"0":"A"},"explanation":"..."},\n  {"type":"fill","question":"...","answer":"...","explanation":"..."},\n  {"type":"reorder","paragraphs":["A","B","C","D","E","F"],"order":[3,0,4,1,2],"explanation":"..."}\n]}\n\nREGRAS:\n${commonRules}`

    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Texto:\n${text}\nNível: ${level}` },
        ],
        temperature: 0.7,
        max_tokens: 8192,
      }),
    })

    if (!res.ok) throw new Error(`API erro ${res.status}: ${await res.text()}`)
    const data = await res.json()
    let content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Resposta vazia')
    const parsed = parseJSON(content)
    if (!parsed.questions) throw new Error('Campo "questions" não encontrado')
    return parsed.questions
  }

  return { generateExam }
})()
