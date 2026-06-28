/**
 * components/DicionarioView.js — Dicionário multi-fontes
 * Left: search results | Right: saved word list (numbered, persists in sessionStorage)
 */
const DicionarioView = {
  template: `
    <div class="flex h-full min-h-0 anim-fade-in-up">
      <!-- ═══ LEFT: Search ═══ -->
      <div class="w-1/2 min-w-[300px] flex flex-col overflow-hidden border-r border-slate-200 bg-white">
        <!-- Header -->
        <div class="exam-header" style="padding:10px 20px;flex-direction:column;align-items:stretch;gap:4px">
          <h2 style="font-size:0.95rem;font-weight:700;color:var(--text-primary);text-transform:uppercase;letter-spacing:-0.01em">Dicionários</h2>
          <p style="font-size:0.62rem;color:var(--text-muted)">{{ totalEntries.toLocaleString() }} entradas no total</p>
        </div>
        <!-- Search bar -->
        <div class="shrink-0 px-5 py-3">
          <div class="relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"></i>
            <input v-model="query" type="text"
                   placeholder="Pesquisar em todos os dicionários..."
                   class="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-azulejo focus:ring-1 focus:ring-azulejo/20 transition"
                   @input="showAll=false">
            <button v-if="query" @click="query=''; showAll=false" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 btn-click">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
        <!-- Results count -->
        <div v-if="query && merged.length > 0" class="shrink-0 px-5 pb-2 text-xs text-slate-400">
          {{ merged.length }} resultado{{ merged.length !== 1 ? 's' : '' }}
        </div>
        <!-- Results list -->
        <div class="flex-1 overflow-y-auto px-5 pb-6">
          <div v-if="query && merged.length > 0" class="space-y-1">
            <div v-for="(item, i) in visibleMerged" :key="item.pt + i"
                 class="flex items-start gap-2 px-3 py-2.5 rounded cursor-pointer transition hover:bg-slate-50 border border-transparent hover:border-slate-200 list-item-enter"
                 :style="{ animationDelay: (i * 0.03) + 's' }"
                 @click="addToSaved(item)">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-azulejo break-all">{{ item.pt }}</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        :class="sourceClass(item.src)">{{ item.src }}</span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{{ item.zh }}</p>
              </div>
              <button @click.stop="addToSaved(item)"
                      class="shrink-0 mt-0.5 p-1 rounded text-slate-300 hover:text-azulejo transition btn-click"
                      title="Adicionar à lista">
                <i data-lucide="plus-circle" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
          <div v-if="hasMore" class="text-center mt-3">
            <button @click="showAll = true"
                    class="btn-click px-3 py-1.5 text-xs font-medium text-azulejo hover:bg-slate-50 rounded transition">
              Mostrar mais {{ merged.length - DISPLAY_LIMIT }} resultado{{ merged.length - DISPLAY_LIMIT !== 1 ? 's' : '' }}
            </button>
          </div>
          <div v-if="!query" class="text-center py-16 anim-fade-in">
            <i data-lucide="book-marked" class="w-12 h-12 text-slate-200 mx-auto mb-3"></i>
            <p class="text-sm text-slate-400">Pesquise uma palavra</p>
          </div>
          <div v-if="query && merged.length === 0" class="text-center py-16 anim-fade-in">
            <i data-lucide="file-x" class="w-12 h-12 text-slate-200 mx-auto mb-3"></i>
            <p class="text-sm text-slate-400">Sem resultados</p>
          </div>
        </div>
      </div>

      <!-- ═══ RIGHT: Saved Words (numbered, persists until refresh) ═══ -->
      <div class="w-1/2 min-w-[300px] flex flex-col overflow-hidden bg-slate-50/50">
        <!-- Header -->
        <div class="exam-header" style="padding:10px 20px;flex-direction:column;align-items:stretch;gap:4px">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h2 style="font-size:0.95rem;font-weight:700;color:var(--text-primary);text-transform:uppercase;letter-spacing:-0.01em">Lista de palavras</h2>
            <div class="flex items-center gap-2">
              <span v-if="savedList.length" style="font-size:0.7rem;color:var(--text-muted)">{{ savedList.length }} palavra{{ savedList.length !== 1 ? 's' : '' }}</span>
              <button v-if="savedList.length" @click="clearAllSaved"
                      class="btn-click p-1.5 rounded text-slate-300 hover:text-erro transition" title="Apagar tudo">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto px-5 py-4">
          <!-- Empty state -->
          <div v-if="savedList.length === 0" class="text-center py-16 anim-fade-in">
            <i data-lucide="list" class="w-12 h-12 text-slate-200 mx-auto mb-3"></i>
            <p class="text-sm text-slate-400">Clique numa palavra à esquerda</p>
            <p class="text-xs text-slate-300 mt-1">para adicionar à lista</p>
          </div>
          <!-- Saved items -->
          <div v-for="(item, idx) in savedList" :key="item.id"
               class="flex items-start gap-3 px-4 py-3 mb-2 rounded-lg bg-white border border-slate-200 shadow-sm list-item-enter anim-fade-in-up"
               :style="{ animationDelay: (idx * 0.04) + 's' }">
            <span class="shrink-0 w-7 h-7 flex items-center justify-center rounded bg-azulejo/10 text-azulejo text-xs font-bold">{{ idx + 1 }}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-slate-800 break-all">{{ item.pt }}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      :class="sourceClass(item.src)">{{ item.src }}</span>
              </div>
              <p class="text-xs text-slate-600 mt-1 leading-relaxed">{{ item.zh }}</p>
            </div>
            <button @click.stop="removeFromSaved(idx)"
                    class="shrink-0 mt-0.5 p-1 rounded text-slate-300 hover:text-erro transition btn-click"
                    title="Remover">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
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
      savedList: [],
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
  },

  methods: {
    /** Add word to saved list (right panel), no duplicates */
    addToSaved(item) {
      const key = item.pt + '|' + item.src
      if (this.savedList.some(s => (s.pt + '|' + s.src) === key)) return
      this.savedList.push({
        id: 'dic_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        pt: item.pt,
        zh: item.zh,
        src: item.src,
      })
      this._persist()
    },
    removeFromSaved(idx) {
      this.savedList.splice(idx, 1)
      this._persist()
    },
    /** Clear all saved words */
    clearAllSaved() {
      this.savedList = []
      this._persist()
    },
    /** Save to sessionStorage (persists until tab close / refresh) */
    _persist() {
      try { sessionStorage.setItem('SEMEDO_DIC_SAVED', JSON.stringify(this.savedList)) } catch {}
    },
    /** Load from sessionStorage */
    _load() {
      try {
        const raw = sessionStorage.getItem('SEMEDO_DIC_SAVED')
        if (raw) this.savedList = JSON.parse(raw)
      } catch {}
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
  },

  mounted() {
    this._load()
    this.$nextTick(() => lucide.createIcons())
    this._keyHandler = (e) => { if (e.key === '1' && this.savedList.length) this.clearAllSaved() }
    document.addEventListener('keydown', this._keyHandler)
  },
  updated() { this.$nextTick(() => lucide.createIcons()) },
  /** Clear right panel data when leaving the section */
  beforeUnmount() {
    this.savedList = []
    try { sessionStorage.removeItem('SEMEDO_DIC_SAVED') } catch {}
    if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler)
  },
}
