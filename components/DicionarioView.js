/**
 * components/DicionarioView.js — Dicionário multi-fontes c/ popup + listas
 */
const DicionarioView = {
  template: `
    <div class="p-6 max-w-3xl mx-auto anim-fade-in-up">
      <div class="mb-5">
        <h2 class="text-xl font-bold text-slate-800">Dicionários</h2>
      </div>

      <!-- Search -->
      <div class="relative mb-5">
        <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
        <input v-model="query" type="text"
               placeholder="Pesquisar em todos os dicionários..."
               class="w-full pl-9 pr-10 py-2.5 glass-input rounded-lg text-sm focus:outline-none"
               @input="showAll=false">
        <button v-if="query" @click="query=''; showAll=false" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 btn-click">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Results count -->
      <div v-if="query && merged.length > 0" class="mb-3 text-xs text-slate-400">
        {{ merged.length }} resultado{{ merged.length !== 1 ? 's' : '' }} em {{ totalEntries.toLocaleString() }} entradas
      </div>

      <div v-if="query && merged.length > 0" class="space-y-1">
        <div v-for="(item, i) in visibleMerged" :key="item.pt + i"
             class="glass-card px-4 py-3 cursor-pointer transition hover:bg-slate-50 flex items-start gap-2 card-hover list-item-enter"
             :class="'anim-fade-in-up stagger-' + Math.min(i + 1, 8)"
             :style="{ animationDelay: (i * 0.04) + 's' }"
             @click="openPopup(item)">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-azulejo break-all">{{ item.pt }}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    :class="sourceClass(item.src)">{{ item.src }}</span>
            </div>
            <p class="text-sm text-slate-600 mt-1 leading-relaxed line-clamp-2">{{ item.zh }}</p>
          </div>
          <button @click.stop="toggleFav(item)"
                  class="shrink-0 p-1.5 rounded-lg transition mt-0.5 btn-click"
                  :class="isFav(item) ? 'text-amber-400 hover:text-amber-500' : 'text-slate-200 hover:text-slate-400'">
            <i data-lucide="star" class="w-4 h-4" :fill="isFav(item) ? 'currentColor' : 'none'"></i>
          </button>
        </div>
      </div>

      <div v-if="hasMore" class="text-center mt-4">
        <button @click="showAll = true"
                class="btn-click px-4 py-2 text-xs font-medium text-azulejo hover:bg-slate-100 rounded-lg transition">
          Mostrar mais {{ merged.length - DISPLAY_LIMIT }} resultado{{ merged.length - DISPLAY_LIMIT !== 1 ? 's' : '' }}
        </button>
      </div>

      <div v-if="!query" class="text-center py-12 anim-fade-in">
        <i data-lucide="book-marked" class="w-12 h-12 text-slate-200 mx-auto mb-3"></i>
        <p class="text-sm text-slate-400">Pesquise uma palavra em todos os dicionários</p>
        <p class="text-xs text-slate-300 mt-1">{{ totalEntries.toLocaleString() }} entradas no total</p>
      </div>

      <div v-if="query && merged.length === 0" class="text-center py-12 anim-fade-in">
        <i data-lucide="file-x" class="w-12 h-12 text-slate-200 mx-auto mb-3"></i>
        <p class="text-sm text-slate-400">Sem resultados</p>
        <p class="text-xs text-slate-300 mt-1">Tente outro termo</p>
      </div>

      <!-- Popup -->
      <div v-if="popupItem"
           class="fixed inset-0 z-50 flex items-center justify-center p-4 anim-fade-in"
           style="background:rgba(0,0,0,0.15)"
           @click.self="popupItem=null">
        <div class="bg-white w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden anim-bounce-in">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
            <div>
              <p class="text-lg font-bold text-slate-800">{{ popupItem.pt }}</p>
              <p class="text-xs text-slate-400">Fonte: {{ popupItem.src }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="speak(popupItem.pt)"
                      class="btn-click btn-glow p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition text-slate-500 hover:text-slate-700 btn-magnetic"
                      title="Ouvir pronúncia">
                <i data-lucide="volume-2" class="w-5 h-5"></i>
              </button>
              <button @click="popupItem=null" class="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 text-xl leading-none btn-click">&times;</button>
            </div>
          </div>
          <div class="px-5 py-4 overflow-y-auto text-sm text-slate-700 leading-relaxed">
            <div v-html="formattedZh"></div>
            <div v-if="popupItem.zh" class="mt-4 pt-4 border-t border-slate-200">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Definição completa</p>
              <p class="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{{ popupItem.zh }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      query: '',
      DISPLAY_LIMIT: 50,
      showAll: false,
      popupItem: null,
      dictionaries: [
        { id: 'hong',    label: '紅葡漢', data: (typeof DICT_VOCAB_DATA !== 'undefined' ? DICT_VOCAB_DATA : []) },
        { id: 'pthp',    label: '葡漢漢葡', data: (typeof DICT_PTHP !== 'undefined' ? DICT_PTHP : []) },
        { id: 'hpph',    label: '漢葡葡漢', data: (typeof DICT_HPPH !== 'undefined' ? DICT_HPPH : []) },
        { id: 'univ',    label: 'Universitário', data: (typeof DICT_UNIV !== 'undefined' ? DICT_UNIV : []) },
        { id: 'priberam', label: 'Priberam', data: (typeof DICT_PRIBERAM !== 'undefined' ? DICT_PRIBERAM : []) },
      ],
    }
  },

  computed: {
    totalEntries() {
      let t = 0
      for (const d of this.dictionaries) if (Array.isArray(d.data)) t += d.data.length
      return t
    },
    merged() {
      if (!this.query.trim()) return []
      const q = Diacritics.normalize(this.query)
      const seen = new Set()
      const result = []
      for (const dic of this.dictionaries) {
        if (!Array.isArray(dic.data)) continue
        for (const item of dic.data) {
          const ptLo = Diacritics.normalize(item.pt || '')
          if (ptLo.includes(q)) {
            const key = ptLo
            if (!seen.has(key)) {
              seen.add(key)
              result.push({ pt: item.pt, zh: item.zh, pos: item.pos || '', src: dic.label })
            }
          }
        }
      }
      return result
    },
    visibleMerged() {
      if (this.showAll) return this.merged
      return this.merged.slice(0, this.DISPLAY_LIMIT)
    },
    hasMore() {
      return !this.showAll && this.merged.length > this.DISPLAY_LIMIT
    },
    formattedZh() {
      try {
        if (!this.popupItem) return ''
        let text = this.popupItem.zh || ''
        if (!text) return '<span class="text-slate-400">Sem definição</span>'

        const lines = []
        const posRe = /(v\.\s*(?:t\.|i\.|r\.|pron\.|aux\.|intr\.|tr\.)?\.?(?:\s*[,;]\s*v\.\s*(?:t\.|i\.|r\.|pron\.|aux\.)?\.?)*|adj\.|s\.\s*[mf]\.|adv\.|s\.\s*2\s*gén|conj\.|prep\.|pron\.(?:ome)?\.?|num\.|interj\.|art\.|loc\.|det\.)/gi

        const parts = text.split(posRe)
        const matches = text.match(posRe) || []

        if (matches.length === 0) {
          const defs = _extractNumberedDefs(text)
          for (const d of defs) lines.push(`<span class="text-slate-700 ml-3 block">${d}</span>`)
          return lines.join('')
        }

        for (let mi = 0; mi < matches.length; mi++) {
          const pos = matches[mi].trim()
          const defsText = (parts[mi * 2 + 2] || '').trim()
          lines.push(`<span class="font-semibold text-slate-600 italic mt-1 block">${pos}</span>`)
          if (defsText) {
            const defs = _extractNumberedDefs(defsText)
            for (const d of defs) lines.push(`<span class="text-slate-700 ml-3 block">${d}</span>`)
          }
        }
        if (lines.length === 0) return '<span class="text-slate-500">Sem divisão por categoria gramatical</span>'
        return lines.join('')
      } catch(e) {
        return '<span class="text-erro">Erro ao processar definição: ' + e.message + '</span>'
      }
    },
  },

  methods: {
    openPopup(item) {
      this.popupItem = item
    },
    sourceClass(src) {
      const colors = {
        '紅葡漢': 'bg-rose-50 text-rose-600',
        '葡漢漢葡': 'bg-blue-50 text-blue-600',
        '漢葡葡漢': 'bg-emerald-50 text-emerald-600',
        'Universitário': 'bg-purple-50 text-purple-600',
        'Priberam': 'bg-amber-50 text-amber-600',
      }
      return colors[src] || 'bg-slate-100 text-slate-500'
    },
    toggleFav(item) {
      PTStore.toggleFavorite({ type: 'dicionario', pt: item.pt, zh: item.zh, src: item.src })
      // Force Lucide re-render for star fill
      this.$nextTick(() => lucide.createIcons())
    },
    isFav(item) {
      return PTStore.isFavorite({ pt: item.pt, src: item.src })
    },
    speak(text) {
      if (!text || !window.speechSynthesis) return
      speechSynthesis.cancel()
      setTimeout(() => {
        const u = new SpeechSynthesisUtterance(text)
        u.lang = 'pt-PT'; u.rate = 0.85
        speechSynthesis.speak(u)
      }, 80)
    },
  },

  mounted() {
    this.$nextTick(() => lucide.createIcons())
  },
  updated() { this.$nextTick(() => lucide.createIcons()) },
}

/* Helper: extrair definições numeradas (standalone) */
function _extractNumberedDefs(text) {
  if (!text) return []
  const parts = text.split(/[;；]/).filter(Boolean)
  if (parts.length > 1) {
    return parts.map(p => {
      const clean = p.replace(/^\s*(?:\d+\s*[.．、]|\(\d+\)|\[\d+\])\s*/, '').trim()
      if (clean) return `<span class="block ml-2">• ${clean}</span>`
      return ''
    }).filter(Boolean)
  }
  const numbered = text.match(/(?:\d+\s*[.．、]|\(\d+\)|\[\d+\])\s*([^。]*?(?:[。]|$))/g)
  if (numbered) {
    return numbered.map(ni => {
      const clean = ni.replace(/^\s*(?:\d+\s*[.．、]|\(\d+\)|\[\d+\])\s*/, '').trim()
      if (clean) return `<span class="block ml-2">• ${clean}</span>`
      return ''
    }).filter(Boolean)
  }
  return [`<span class="block ml-2">• ${text}</span>`]
}
