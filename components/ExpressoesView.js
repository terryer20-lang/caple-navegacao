/**
 * components/ExpressoesView.js — Expressões: LEFT search | RIGHT saved list (numbered)
 */
const ExpressoesView = {
  template: `
    <div class="flex h-full min-h-0 anim-fade-in-up">
      <!-- ═══ LEFT: Search ═══ -->
      <div class="w-1/2 min-w-[300px] flex flex-col overflow-hidden border-r border-slate-200 bg-white">
        <!-- Header -->
        <div class="exam-header" style="padding:10px 20px;flex-direction:column;align-items:stretch;gap:4px">
          <h2 style="font-size:0.95rem;font-weight:700;color:var(--text-primary);text-transform:uppercase;letter-spacing:-0.01em">Expressões</h2>
          <p style="font-size:0.62rem;color:var(--text-muted)">{{ dataLength.toLocaleString() }} expressões</p>
        </div>
        <!-- Search bar -->
        <div class="shrink-0 px-5 py-3">
          <div class="relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"></i>
            <input v-model="query" type="text"
                   placeholder="Pesquisar expressão ou palavra-chave..."
                   class="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-azulejo focus:ring-1 focus:ring-azulejo/20 transition"
                   @input="showAll=false">
            <button v-if="query" @click="query=''; showAll=false" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 btn-click">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
        <!-- Results count -->
        <div v-if="query && filtered.length > 0" class="shrink-0 px-5 pb-2 text-xs text-slate-400">
          {{ filtered.length }} resultado{{ filtered.length !== 1 ? 's' : '' }}
        </div>
        <!-- Results list -->
        <div class="flex-1 overflow-y-auto px-5 pb-6">
          <div v-if="query && filtered.length > 0" class="space-y-1">
            <div v-for="(item, i) in visibleResults" :key="item.pt + i"
                 class="flex items-start gap-2 px-3 py-2.5 rounded cursor-pointer transition hover:bg-slate-50 border border-transparent hover:border-slate-200 list-item-enter"
                 :style="{ animationDelay: (i * 0.03) + 's' }"
                 @click="addToSaved(item)">
              <div class="flex-1 min-w-0">
                <span class="text-sm font-semibold text-azulejo break-all">{{ item.pt }}</span>
                <p class="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{{ item.raw || item.zh }}</p>
              </div>
              <button @click.stop="addToSaved(item)"
                      class="shrink-0 mt-0.5 p-1 rounded text-slate-300 hover:text-azulejo transition btn-click"
                      title="Adicionar à lista">
                <i data-lucide="plus-circle" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
          <!-- Show more -->
          <div v-if="hasMore" class="text-center mt-3">
            <button @click="showAll = true"
                    class="btn-click px-3 py-1.5 text-xs font-medium text-azulejo hover:bg-slate-50 rounded transition">
              Mostrar mais {{ filtered.length - DISPLAY_LIMIT }} resultado{{ filtered.length - DISPLAY_LIMIT !== 1 ? 's' : '' }}
            </button>
          </div>
          <!-- Empty: no search -->
          <div v-if="!query" class="text-center py-16 anim-fade-in">
            <i data-lucide="message-square" class="w-12 h-12 text-slate-200 mx-auto mb-3"></i>
            <p class="text-sm text-slate-400">Pesquise uma expressão ou palavra-chave</p>
          </div>
          <!-- Empty: no results -->
          <div v-if="query && filtered.length === 0" class="text-center py-16 anim-fade-in">
            <i data-lucide="file-x" class="w-12 h-12 text-slate-200 mx-auto mb-3"></i>
            <p class="text-sm text-slate-400">Sem resultados</p>
          </div>
        </div>
      </div>

      <!-- ═══ RIGHT: Saved List (numbered, persists until refresh) ═══ -->
      <div class="w-1/2 min-w-[300px] flex flex-col overflow-hidden bg-slate-50/50">
        <!-- Header -->
        <div class="exam-header" style="padding:10px 20px;flex-direction:column;align-items:stretch;gap:4px">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h2 style="font-size:0.95rem;font-weight:700;color:var(--text-primary);text-transform:uppercase;letter-spacing:-0.01em">Lista de expressões</h2>
            <div class="flex items-center gap-2">
              <span v-if="savedList.length" style="font-size:0.7rem;color:var(--text-muted)">{{ savedList.length }} expressão{{ savedList.length !== 1 ? 'ões' : '' }}</span>
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
            <p class="text-sm text-slate-400">Clique numa expressão à esquerda</p>
            <p class="text-xs text-slate-300 mt-1">para adicionar à lista</p>
          </div>
          <!-- Saved items -->
          <div v-for="(item, idx) in savedList" :key="item.id"
               class="flex items-start gap-3 px-4 py-3 mb-2 rounded-lg bg-white border border-slate-200 shadow-sm list-item-enter anim-fade-in-up"
               :style="{ animationDelay: (idx * 0.04) + 's' }">
            <span class="shrink-0 w-7 h-7 flex items-center justify-center rounded bg-azulejo/10 text-azulejo text-xs font-bold">{{ idx + 1 }}</span>
            <div class="flex-1 min-w-0">
              <span class="text-sm font-semibold text-slate-800 break-all">{{ item.pt }}</span>
              <p class="text-xs text-slate-600 mt-0.5 leading-relaxed">{{ item.raw || item.zh }}</p>
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
      dataLength: 0,
      items: [],
      savedList: [],
    }
  },

  computed: {
    filtered() {
      if (!this.query.trim()) return []
      const q = Diacritics.normalize(this.query)
      return this.items.filter(item =>
        Diacritics.normalize(item.pt).includes(q)
      )
    },
    visibleResults() {
      if (this.showAll) return this.filtered
      return this.filtered.slice(0, this.DISPLAY_LIMIT)
    },
    hasMore() {
      return !this.showAll && this.filtered.length > this.DISPLAY_LIMIT
    },
  },

  methods: {
    loadData() {
      try {
        if (typeof EXPRESSOES_DATA !== 'undefined' && Array.isArray(EXPRESSOES_DATA)) {
          this.items = EXPRESSOES_DATA.filter(e => e.pt && e.zh && e.pt.length > 1 && e.zh.length > 5)
          this.dataLength = this.items.length
        }
      } catch {}
    },
    /** Add expression to saved list (right panel), no duplicates */
    addToSaved(item) {
      const key = item.pt
      if (this.savedList.some(s => s.pt === key)) return
      this.savedList.push({
        id: 'exp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        pt: item.pt,
        zh: item.zh,
        raw: item.raw || '',
      })
      this._persist()
    },
    removeFromSaved(idx) {
      this.savedList.splice(idx, 1)
      this._persist()
    },
    /** Clear all saved expressions */
    clearAllSaved() {
      this.savedList = []
      this._persist()
    },
    /** Save to sessionStorage (persists until tab close / refresh) */
    _persist() {
      try { sessionStorage.setItem('SEMEDO_EXP_SAVED', JSON.stringify(this.savedList)) } catch {}
    },
    /** Load from sessionStorage */
    _load() {
      try {
        const raw = sessionStorage.getItem('SEMEDO_EXP_SAVED')
        if (raw) this.savedList = JSON.parse(raw)
      } catch {}
    },
  },

  mounted() {
    this.loadData()
    this._load()
    this.$nextTick(() => lucide.createIcons())
    this._keyHandler = (e) => { if (e.key === '1' && this.savedList.length) this.clearAllSaved() }
    document.addEventListener('keydown', this._keyHandler)
  },
  updated() { this.$nextTick(() => lucide.createIcons()) },
  /** Clear right panel data when leaving the section */
  beforeUnmount() {
    this.savedList = []
    try { sessionStorage.removeItem('SEMEDO_EXP_SAVED') } catch {}
    if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler)
  },
}
