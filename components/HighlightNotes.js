/**
 * components/HighlightNotes.js — Highlight + Notes + Palavras Desconhecidas
 *
 * Three highlight types:
 * - Destaque (yellow #fff7a0) — user highlights text
 * - Nota (blue #93c5fd) — user highlights with note intent
 * - Palavra Desconhecida (red #fca5a5) — single word marked as unknown
 *
 * Popup follows mouse cursor during selection. Shows "Destacar" and "Notar".
 * On cancel selection, popup hides immediately.
 *
 * Usage: <script src="components/HighlightNotes.js"></script>
 * Per-page: merge data() and methods() into Vue app.
 */

window.HighlightNotes = (() => {
  const COLORS = {
    DESTAQUE: '#fff7a0',  // yellow
    NOTA: '#93c5fd',      // blue
    PD: '#fca5a5',        // red (palavra desconhecida)
    ANSWER: '#86efac',    // green
  }
  const CSS_CLASSES = {
    [COLORS.DESTAQUE]: 'hl-yellow',
    [COLORS.NOTA]: 'hl-blue',
    [COLORS.PD]: 'hl-pd',
    [COLORS.ANSWER]: 'hl-green',
  }

  let _idCounter = Date.now()
  function uid() { return 'hl_' + (_idCounter++) }

  function data() {
    return {
      highlights: [],           // [{id, text, note, type, color, pos, createdAt}]
      palavrasDesconhecidas: [],// [{id, word, wordIdx, pos}]
      showHighlightPanel: true,
      showNotesPanel: true,
      showPDPanel: true,
      editingHighlightId: null,
      aiAnalysisLoading: false,
      aiAnalysisResults: [],
      notes: '',
      selectionPopup: {
        visible: false,
        top: 0,
        left: 0,
        text: '',
        containerEl: null,
        pageType: null,
        pos: null,
      },
      _selecting: false,
      _renderedHighlightsVersion: 0,
    }
  }

  function methods(pageType) {
    const storageKey = () => `SEMEDO_HL_${pageType.toUpperCase()}`
    const pdKey = () => `SEMEDO_PD_${pageType.toUpperCase()}`

    return {

      /* ═══ Selection tracking — mouse down ═══ */
      onTextMouseDown(containerEl, event, pType) {
        this._selecting = true
      },

      /* ═══ Selection tracking — mouse move (follow cursor) ═══ */
      onTextMouseMove(containerEl, event, pType) {
        if (!this._selecting) return
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed || !sel.rangeCount) {
          this.hidePopup()
          return
        }
        const range = sel.getRangeAt(0)
        const selectedText = sel.toString().trim()
        if (!selectedText || selectedText.length < 2) {
          this.hidePopup()
          return
        }
        if (!containerEl || !containerEl.contains(range.commonAncestorContainer)) return

        // Position popup above mouse cursor
        this.selectionPopup = {
          visible: true,
          top: event.clientY - 10,
          left: event.clientX,
          text: selectedText,
          containerEl: containerEl,
          pageType: pType,
          pos: null, // will be captured on mouseup
        }
      },

      /* ═══ Text Selection Handler — mouse up ═══ */
      onTextSelection(containerEl, event, pType) {
        this._selecting = false
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed || !sel.rangeCount) {
          this.hidePopup()
          return
        }

        const range = sel.getRangeAt(0)
        const selectedText = sel.toString().trim()
        if (!selectedText || selectedText.length < 2) {
          this.hidePopup()
          return
        }
        if (!containerEl || !containerEl.contains(range.commonAncestorContainer)) {
          this.hidePopup()
          return
        }

        const pos = this._capturePosition(containerEl, range, pType, selectedText)
        if (!pos) { this.hidePopup(); return }

        // Update popup with final position + text
        this.selectionPopup = {
          visible: true,
          top: event.clientY - 10,
          left: event.clientX,
          text: selectedText,
          containerEl: containerEl,
          pageType: pType,
          pos: pos,
        }
      },

      /* ═══ Create DESTAQUE (yellow) ═══ */
      popupHighlight() {
        const sp = this.selectionPopup
        if (!sp.visible || !sp.text || !sp.pos) return
        this._addHighlight(sp.text, sp.pos, sp.containerEl, sp.pageType, '', COLORS.DESTAQUE)
        this.hidePopup()
      },

      /* ═══ Create NOTA (blue) ═══ */
      popupNote() {
        const sp = this.selectionPopup
        if (!sp.visible || !sp.text || !sp.pos) return
        this._addHighlight(sp.text, sp.pos, sp.containerEl, sp.pageType, '', COLORS.NOTA)
        const newHL = this.highlights[this.highlights.length - 1]
        if (newHL) {
          this.editingHighlightId = newHL.id
          this.showNotesPanel = true
          this.$nextTick(() => {
            const el = document.getElementById('hl-note-' + newHL.id)
            if (el) setTimeout(() => el.focus(), 100)
          })
        }
        this.hidePopup()
      },

      /* ═══ Toggle Palavra Desconhecida (CL word click) ═══ */
      togglePD(wordText, wordIdx) {
        const idx = this.palavrasDesconhecidas.findIndex(pd => pd.wordIdx === wordIdx)
        if (idx >= 0) {
          this.palavrasDesconhecidas.splice(idx, 1)
        } else {
          this.palavrasDesconhecidas.push({
            id: uid(),
            word: wordText,
            wordIdx: wordIdx,
            createdAt: Date.now(),
          })
        }
        this._applyPD()
        this._savePD(pdKey())
      },

      isPD(wordIdx) {
        return this.palavrasDesconhecidas.some(pd => pd.wordIdx === wordIdx)
      },

      _applyPD() {
        this._renderedHighlightsVersion++
      },

      /* ═══ Internal: add a highlight ═══ */
      _addHighlight(text, pos, containerEl, pType, note, color) {
        const exists = this.highlights.some(h => {
          if (h.type !== 'user') return false
          if (h.pos.type === 'word_idx' && pos.type === 'word_idx')
            return h.pos.startIdx === pos.startIdx && h.pos.endIdx === pos.endIdx
          if (h.pos.type === 'char_offset' && pos.type === 'char_offset')
            return h.pos.start === pos.start && h.pos.end === pos.end
          return false
        })
        if (exists) return

        this.highlights.push({
          id: uid(),
          text: text,
          note: note,
          type: 'user',
          color: color,
          pos: pos,
          createdAt: Date.now(),
        })
        this._applyUserHighlights(containerEl, pType)
        this.saveHL(storageKey())
        window.getSelection()?.removeAllRanges()
      },

      /* ═══ Hide popup (immediate) ═══ */
      hidePopup() {
        this._selecting = false
        this.selectionPopup.visible = false
      },

      /* ═══ Capture selection position ═══ */
      _capturePosition(containerEl, range, pType, selectedText) {
        if (pType === 'leitura' || pType === 'cl') {
          // Use this.words array to get correct indices (matches v-for)
          const wordTokens = this.words || []
          // Find which word tokens are selected by DOM position
          const wordSpans = containerEl.querySelectorAll('.word-span, .word-cl, .word-space')
          const textNodes = []
          wordSpans.forEach(span => {
            if (span.childNodes.length > 0) {
              for (let n of span.childNodes) {
                if (n.nodeType === Node.TEXT_NODE) textNodes.push({ node: n, span: span })
              }
            }
          })
          let startIdx = -1, endIdx = -1
          const anchorNode = range.startContainer, focusNode = range.endContainer
          for (let i = 0; i < textNodes.length; i++) {
            if (textNodes[i].node === anchorNode || textNodes[i].span === anchorNode || textNodes[i].span.contains(anchorNode)) { startIdx = i; break }
          }
          for (let i = 0; i < textNodes.length; i++) {
            if (textNodes[i].node === focusNode || textNodes[i].span === focusNode || textNodes[i].span.contains(focusNode)) { endIdx = i; break }
          }
          if (startIdx < 0 || endIdx < 0) return null
          // Convert textNodes index to words array index by inserting newline gaps
          let wordStart = startIdx, wordEnd = endIdx
          // Count newlines in words array and adjust the DOM index
          let domIdx = 0
          for (let wi = 0; wi < wordTokens.length; wi++) {
            if (wordTokens[wi].isNewline) continue  // no span for this token
            if (domIdx === startIdx) { wordStart = wi; break }
            domIdx++
            if (domIdx > startIdx) break
          }
          domIdx = 0
          for (let wi = 0; wi < wordTokens.length; wi++) {
            if (wordTokens[wi].isNewline) continue
            if (domIdx === endIdx) { wordEnd = wi; break }
            domIdx++
            if (domIdx > endIdx) break
          }
          return { type: 'word_idx', startIdx: wordStart, endIdx: wordEnd, wordCount: wordTokens.length }
        } else {
          const fullText = containerEl.textContent || ''
          let charOffset = 0, foundStart = false, foundEnd = false, actualStart = 0, actualEnd = 0
          const walker = document.createTreeWalker(containerEl, NodeFilter.SHOW_TEXT)
          let node
          while ((node = walker.nextNode())) {
            const len = node.textContent.length
            if (!foundStart) { if (node === range.startContainer) { actualStart = charOffset + range.startOffset; foundStart = true } }
            if (!foundEnd) { if (node === range.endContainer) { actualEnd = charOffset + range.endOffset; foundEnd = true } }
            if (foundStart && foundEnd) break
            charOffset += len
          }
          if (!foundStart || !foundEnd) return null
          let containerId = null
          if (pType === 'pie') {
            let el = range.commonAncestorContainer
            if (el.nodeType === Node.TEXT_NODE) el = el.parentElement
            if (el) { const piePartEl = el.closest('[data-pie-part]'); if (piePartEl) containerId = piePartEl.dataset.piePart }
          }
          return { type: 'char_offset', start: actualStart, end: actualEnd, textLen: fullText.length, containerId }
        }
      },

      /* ═══ Apply user highlights visually ═══ */
      _applyUserHighlights(containerEl, pType) {
        if (pType === 'leitura') {
          containerEl.querySelectorAll('.word-span.highlight-user').forEach(el => el.classList.remove('highlight-user'))
          const wordSpans = containerEl.querySelectorAll('.word-span')
          for (const hl of this.highlights.filter(h => h.type === 'user')) {
            if (hl.pos.type === 'word_idx') {
              for (let i = hl.pos.startIdx; i <= hl.pos.endIdx && i < wordSpans.length; i++) {
                if (wordSpans[i]) wordSpans[i].classList.add('highlight-user')
              }
            }
          }
        } else {
          this._renderedHighlightsVersion++
        }
      },

      /* ═══ Color-to-class helper ═══ */
      _highlightClass(color) {
        return CSS_CLASSES[color] || 'hl-yellow'
      },

      /* ═══ Generate highlighted HTML (for PIE / CL fallback) ═══ */
      getHighlightedHtml(sourceText, pType, highlightType, containerId) {
        if (!sourceText) return ''
        void this._renderedHighlightsVersion
        let hls = highlightType ? this.highlights.filter(h => h.type === highlightType) : this.highlights
        if (containerId) hls = hls.filter(h => h.pos.containerId === containerId || !h.pos.containerId)
        if (hls.length === 0) return this._escapeHtml(sourceText)

        const markers = []
        for (const hl of hls) {
          if (hl.pos.type === 'char_offset') {
            markers.push({ start: hl.pos.start, end: hl.pos.end, cls: this._highlightClass(hl.color), id: hl.id, text: hl.text })
          }
        }
        markers.sort((a, b) => a.start - b.start)

        const merged = []
        for (const m of markers) {
          if (m.start < 0 || m.end > sourceText.length) continue
          if (merged.length > 0 && m.start <= merged[merged.length - 1].end) {
            const last = merged[merged.length - 1]
            if (m.end > last.end) last.end = m.end
            continue
          }
          merged.push({ ...m })
        }

        let result = '', pos = 0
        for (const m of merged) {
          if (m.start > pos) result += this._escapeHtml(sourceText.slice(pos, m.start))
          result += `<mark class="${m.cls}" data-hl-id="${m.id}">${this._escapeHtml(sourceText.slice(m.start, m.end))}</mark>`
          pos = m.end
        }
        if (pos < sourceText.length) result += this._escapeHtml(sourceText.slice(pos))
        return result
      },

      /* ═══ Get answer green highlights HTML ═══ */
      getAnswerHighlightedHtml(sourceText, answerPositions) {
        if (!sourceText || !answerPositions?.length) return this._escapeHtml(sourceText)
        const allHLs = [...this.highlights.filter(h => h.type === 'user')]
        for (const ap of answerPositions) {
          allHLs.push({ id: 'ans_' + ap.idx, text: ap.text, note: '', type: 'answer', color: COLORS.ANSWER, pos: { type: 'char_offset', start: ap.start, end: ap.end } })
        }
        const markers = []
        for (const hl of allHLs) {
          if (hl.pos.type === 'char_offset') {
            markers.push({ start: hl.pos.start, end: hl.pos.end, cls: this._highlightClass(hl.color), id: hl.id, text: hl.text })
          }
        }
        markers.sort((a, b) => a.start - b.start)
        const merged = []
        for (const m of markers) {
          if (m.start < 0 || m.end > sourceText.length) continue
          if (merged.length > 0 && m.start <= merged[merged.length - 1].end) {
            const last = merged[merged.length - 1]
            if (m.end > last.end) last.end = m.end
            if (m.cls === 'hl-green' && last.cls !== 'hl-green') last.cls = 'hl-green'
            continue
          }
          merged.push({ ...m })
        }
        let result = '', pos = 0
        for (const m of merged) {
          if (m.start > pos) result += this._escapeHtml(sourceText.slice(pos, m.start))
          result += `<mark class="${m.cls}" data-hl-id="${m.id}">${this._escapeHtml(sourceText.slice(m.start, m.end))}</mark>`
          pos = m.end
        }
        if (pos < sourceText.length) result += this._escapeHtml(sourceText.slice(pos))
        return result
      },

      /* ═══ Remove highlight ═══ */
      removeHL(id) {
        this.highlights = this.highlights.filter(h => h.id !== id)
        this.saveHL(storageKey())
      },

      /* ═══ Update note on highlight ═══ */
      updateHLNote(id, note) {
        const hl = this.highlights.find(h => h.id === id)
        if (hl) hl.note = note
        this.saveHL(storageKey())
      },

      /* ═══ Jump to text position ═══ */
      scrollToPosition(containerEl, hlId, pType) {
        if (!containerEl) return
        const hl = this.highlights.find(h => h.id === hlId)
        if (!hl) return

        if (hl.pos.type === 'word_idx') {
          // Stored index uses words array (with newline gaps). Find the DOM span
          let domIdx = -1
          for (let wi = 0; wi <= hl.pos.startIdx; wi++) {
            const w = this.words?.[wi]
            if (!w || w.isNewline) continue
            domIdx++
          }
          const spans = containerEl.querySelectorAll('.word-cl, .word-span, .word-space')
          let target = domIdx >= 0 ? spans[domIdx] : null
          // If it's a space, find nearest word-cl
          if (target && target.matches('.word-space')) {
            let el = target.nextElementSibling
            while (el && (el.matches('.word-space') || el.tagName === 'BR')) el = el.nextElementSibling
            if (el && el.matches('.word-cl')) target = el
          }
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
          }
        }

        // Try mark element
        const mark = containerEl.querySelector(`mark[data-hl-id="${hlId}"]`)
        if (mark) {
          mark.scrollIntoView({ behavior: 'smooth', block: 'center' })
          return
        }

        // Fallback
        if (containerEl.scrollTo) containerEl.scrollTo({ top: 0, behavior: 'smooth' })
      },

      scrollToPDWord(wordIdx, containerEl) {
        if (!containerEl) return
        const spans = containerEl.querySelectorAll('.word-cl, .word-span')
        if (spans[wordIdx]) {
          spans[wordIdx].scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (spans.length > 0) {
          // Fallback: scroll to first or last available
          const idx = Math.min(wordIdx, spans.length - 1)
          if (spans[idx]) spans[idx].scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      },
      /* ═══ Persistence ═══ */
      saveHL(key) { try { localStorage.setItem(key, JSON.stringify(this.highlights)) } catch {} },
      loadHL(key) { try { const r = localStorage.getItem(key); if (r) this.highlights = JSON.parse(r) } catch {} },
      _savePD(key) { try { localStorage.setItem(key, JSON.stringify(this.palavrasDesconhecidas)) } catch {} },
      loadPD(key) { try { const r = localStorage.getItem(key); if (r) this.palavrasDesconhecidas = JSON.parse(r) } catch {} },

      /* ═══ Notes persistence ═══ */
      saveNotes(key) { try { localStorage.setItem(key, this.notes) } catch {} },
      loadNotes(key) { try { const r = localStorage.getItem(key); if (r) this.notes = r } catch {} },

      /* ═══ Notes auto-numbered list ═══ */
      onNotesKeydown(e) {
        if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
          e.preventDefault()
          const el = e.target
          const start = el.selectionStart, before = this.notes.slice(0, start), after = this.notes.slice(el.selectionEnd)
          const lines = this.notes.split('\n')
          const pointMatch = lines[Math.min(before.split('\n').length - 1, lines.length - 1)]?.match(/^(\d+)\./)
          const nextNum = (pointMatch ? parseInt(pointMatch[1]) : 0) + 1
          const ins = '\n' + nextNum + '. '
          this.notes = before + ins + after
          this.$nextTick(() => { const p = start + ins.length; el.setSelectionRange(p, p); el.focus() })
        }
      },

      notesLineCount() { return this.notes ? this.notes.split('\n').length : 0 },

      /* ═══ Answer positions from CL questions ═══ */
      findAnswerPositions(sourceText, questions, userAnswers, graded) {
        const positions = []
        for (let i = 0; i < questions.length; i++) {
          if (graded[i]) continue
          const answerText = String(questions[i]?.answer || '')
          if (!answerText) continue
          const idx = sourceText.indexOf(answerText)
          if (idx >= 0) { positions.push({ idx: i, start: idx, end: idx + answerText.length, text: answerText }) }
          else {
            const words = answerText.split(/\s+/).filter(Boolean)
            if (words.length > 0) {
              const fIdx = sourceText.indexOf(words[0]), lWord = words[words.length - 1], lIdx = sourceText.lastIndexOf(lWord)
              if (fIdx >= 0 && lIdx >= 0) positions.push({ idx: i, start: fIdx, end: lIdx + lWord.length, text: answerText })
            }
          }
        }
        return positions
      },

      compareHighlightsWithAnswers(answerPositions) {
        if (!answerPositions?.length) return []
        const comparisons = []
        for (const hl of this.highlights.filter(h => h.type === 'user' && h.pos.type === 'char_offset')) {
          const overlaps = []
          for (const ap of answerPositions) {
            if (hl.pos.start < ap.end && hl.pos.end > ap.start) overlaps.push({ qIdx: ap.idx, text: ap.text })
          }
          if (overlaps.length) comparisons.push({ hlId: hl.id, hlText: hl.text, hlNote: hl.note, matches: overlaps })
        }
        return comparisons
      },

      /* ═══ AI Analysis for wrong answers ═══ */
      async analyzeWrongAnswers(sourceText, questions, userAnswers, graded) {
        const apiKey = this._getApiKey()
        if (!apiKey) { alert('Configure a chave DeepSeek nas Configurações primeiro.'); return }
        const wrongQuestions = []
        for (let i = 0; i < questions.length; i++) {
          if (!graded[i]) wrongQuestions.push({ idx: i, question: questions[i].question, userAnswer: userAnswers[i], correctAnswer: questions[i].answer })
        }
        if (!wrongQuestions.length) { this.aiAnalysisResults = []; return }
        this.aiAnalysisLoading = true
        const results = []
        for (const wq of wrongQuestions) {
          const relevantHLs = this.highlights.filter(h => h.type === 'user' && h.pos.type === 'char_offset' &&
            (h.text.toLowerCase().includes((wq.correctAnswer || '').toLowerCase()) || (wq.correctAnswer || '').toLowerCase().includes(h.text.toLowerCase())))
          const hlContext = relevantHLs.length ? relevantHLs.map(h => `- "${h.text}"${h.note ? ' (Nota: ' + h.note + ')' : ''}`).join('\n') : '- Nenhum destaque relacionado.'
          const pdWords = this.palavrasDesconhecidas?.length ? 'Palavras que o aluno não conhecia: ' + this.palavrasDesconhecidas.map(p => p.word).join(', ') : ''
          try {
            const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
              body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                  { role: 'system', content: `Tutor CAPLE PT-PT. Analisa erro de forma construtiva. JSON: {"analise":"...","dica":"..."}. Responde em português europeu.` },
                  { role: 'user', content: `TEXTO:\n${sourceText}\n\nPERGUNTA: ${wq.question}\nRESPOSTA: ${wq.userAnswer}\nCORRETA: ${wq.correctAnswer}\n\nDESTAQUES:\n${hlContext}\n\n${pdWords}` },
                ],
                temperature: 0.3, max_tokens: 1000,
              }),
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            const parsed = this._parseJSON(data.choices?.[0]?.message?.content || '{}')
            results.push({ qIdx: wq.idx, question: wq.question, userAnswer: wq.userAnswer, correctAnswer: wq.correctAnswer, analise: parsed.analise || parsed.analysis || 'Erro ao analisar.', dica: parsed.dica || '' })
          } catch (e) { results.push({ qIdx: wq.idx, question: wq.question, userAnswer: wq.userAnswer, correctAnswer: wq.correctAnswer, analise: 'Erro: ' + e.message, dica: '' }) }
        }
        this.aiAnalysisResults = results
        this.aiAnalysisLoading = false
      },

      _getApiKey() {
        try { const r = localStorage.getItem('PT_LEARNING_DATA'); if (!r) return null; return JSON.parse(r)?.config?.deepseekKey || null } catch { return null }
      },
      _escapeHtml(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML },
      _parseJSON(text) {
        let s = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '')
        const fb = s.indexOf('{'), fb2 = s.indexOf('[')
        const start = fb >= 0 && (fb2 < 0 || fb < fb2) ? fb : fb2
        if (start < 0) return {}
        const ec = s[start] === '{' ? '}' : ']'
        let d = 0, str = false, esc = false, end = -1
        for (let i = start; i < s.length; i++) {
          const c = s[i]
          if (esc) { esc = false; continue }
          if (c === '\\' && str) { esc = true; continue }
          if (c === '"' && !esc) { str = !str; continue }
          if (!str) { if (c === s[start]) d++; else if (c === ec) { d--; if (d === 0) { end = i; break } } }
        }
        if (end < 0) return {}
        s = s.slice(start, end + 1)
        for (const fn of [t => JSON.parse(t), t => JSON.parse(t.replace(/'/g, '"')), t => JSON.parse(t.replace(/,\s*([}\]])/g, '$1'))]) { try { return fn(s) } catch {} }
        return {}
      },
    }
  }

  function injectStyles() {
    const style = document.createElement('style')
    style.textContent = `
      /* ─── User highlights ─── */
      .word-span.hl-yellow, .word-cl.hl-yellow {
        background: ${COLORS.DESTAQUE} !important;
        padding: 1px 2px;
      }
      .word-span.hl-blue, .word-cl.hl-blue {
        background: ${COLORS.NOTA} !important;
        padding: 1px 2px;
      }
      .word-space.hl-yellow { background: ${COLORS.DESTAQUE} !important; padding: 1px 0; }
      .word-space.hl-blue { background: ${COLORS.NOTA} !important; padding: 1px 0; }

      /* ─── Palavra Desconhecida (red) ─── */
      .word-cl.hl-pd, .word-span.hl-pd {
        background: ${COLORS.PD} !important;
        padding: 1px 2px;
        cursor: pointer;
      }
      .word-cl.hl-pd:hover, .word-span.hl-pd:hover {
        background: #f87171 !important;
      }

      /* ─── Inline mark highlights ─── */
      mark.hl-yellow { background: ${COLORS.DESTAQUE}; color: inherit; padding: 1px 2px; cursor: pointer; }
      mark.hl-yellow:hover { background: #fce83a; }
      mark.hl-blue { background: ${COLORS.NOTA}; color: inherit; padding: 1px 2px; cursor: pointer; }
      mark.hl-blue:hover { background: #7dd3fc; }
      mark.hl-green { background: ${COLORS.ANSWER}; color: inherit; padding: 1px 2px; cursor: default; }
      mark.hl-green:hover { background: #6ee7a0; }
      mark.hl-pd { background: ${COLORS.PD}; color: inherit; padding: 1px 2px; cursor: pointer; }
      mark.hl-pd:hover { background: #f87171; }


      /* ─── Cards ─── */
      .hl-card { border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; transition: all 0.12s ease; position:relative; }
      .hl-card.hl-destaque { background: #fffdf0; border: 1px solid #fde68a; }
      .hl-card.hl-destaque:hover { border-color: #facc15; box-shadow: 0 1px 4px rgba(250,204,21,0.15); }
      .hl-card.hl-nota { background: #f0f9ff; border: 1px solid #bae6fd; }
      .hl-card.hl-nota:hover { border-color: #7dd3fc; box-shadow: 0 1px 4px rgba(59,130,246,0.15); }
      .hl-card.hl-pd { background: #fef2f2; border: 1px solid #fecaca; }
      .hl-card.hl-pd:hover { border-color: #f87171; box-shadow: 0 1px 4px rgba(239,68,68,0.15); }
      .hl-card .hl-num { font-size: 0.68rem; font-weight: 700; color: #94a3b8; margin-right: 6px; flex-shrink:0; min-width:1.2rem; }
      .hl-card .hl-text { font-size: 0.82rem; color: #334155; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .hl-card .hl-note-input { width:100%; border:none; border-bottom:1px solid #e2e8f0; background:transparent; font-size:0.78rem; color:#475569; padding:4px 0; outline:none; font-family:inherit; }
      .hl-card .hl-note-input:focus { border-bottom-color: #94a3b8; }
      .hl-card .hl-actions { display:flex; align-items:center; gap:6px; margin-top:4px; }
      .hl-card .hl-btn { border:none; background:transparent; cursor:pointer; font-size:0.72rem; color:#64748b; padding:2px 6px; border-radius:4px; transition:all 0.1s ease; }
      .hl-card .hl-btn:hover { background:#f1f5f9; color:#334155; }
      .hl-card .hl-btn.danger:hover { background:#fee2e2; color:#dc2626; }
      .hl-empty { font-size:0.78rem; color:#cbd5e1; text-align:center; padding:16px 0; }

      /* ─── Selection popup ─── */
      .hl-popup {
        position: fixed; z-index: 9999; transform: translateY(-100%);
        background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.1); padding: 3px;
        display: flex; gap: 1px; align-items: center; pointer-events: auto;
        animation: hl-popup-in 0.08s ease-out;
      }
      @keyframes hl-popup-in { from { opacity:0; transform:translateY(-90%); } to { opacity:1; transform:translateY(-100%); } }
      .hl-popup-btn { padding:5px 11px; border:none; border-radius:6px; font-size:0.78rem; font-weight:500; cursor:pointer; transition:all 0.1s ease; white-space:nowrap; }
      .hl-popup-btn:hover { opacity:0.85; }
      .hl-popup-btn.destacar { background:#fef3c7; color:#92400e; }
      .hl-popup-btn.destacar:hover { background:#fde68a; }
      .hl-popup-btn.notar { background:#e0f2fe; color:#075985; }
      .hl-popup-btn.notar:hover { background:#bae6fd; }

      /* ─── CL word spans ─── */
      .word-cl { cursor:pointer; padding:1px 2px; transition:all 0.12s ease; }
      .word-cl:hover { background:#f1f5f9; }

      /* ─── AI analysis ─── */
      .ai-ana-card { background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:12px 14px; margin-bottom:10px; }
      .ai-ana-card .ana-question { font-size:0.82rem; font-weight:600; color:#0369a1; margin-bottom:4px; }
      .ai-ana-card .ana-detail { font-size:0.78rem; color:#0c4a6e; line-height:1.5; margin-bottom:4px; }
      .ai-ana-card .ana-tip { font-size:0.78rem; color:#166534; background:#dcfce7; border-radius:4px; padding:4px 8px; margin-top:4px; }
    `
    document.head.appendChild(style)
  }

  return { data, methods, injectStyles, COLORS, uid }
})()
