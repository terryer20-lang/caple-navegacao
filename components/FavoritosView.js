/**
 * components/FavoritosView.js — 收藏詞彙集中檢視
 */
const FavoritosView = {
  template: `
    <div class="p-6 max-w-3xl mx-auto anim-fade-in-up">

      <!-- ═══ HEADER ═══ -->
      <div class="mb-5">
        <h2 class="text-xl font-bold text-slate-800">Favoritos</h2>
      </div>

      <!-- ═══ FILTERS ═══ -->
      <div class="glass-card rounded-glass p-3 mb-4 card-hover-strong">
        <div class="flex flex-wrap gap-2">
          <button v-for="t in filterTypes" :key="t"
                  @click="fType = t"
                  :class="['btn-click px-4 py-2 rounded-lg text-sm font-medium transition border',
                    fType === t
                      ? 'bg-azulejo text-white border-azulejo'
                      : 'glass-btn text-slate-500 border-slate-200 hover:bg-slate-50']">
            {{ t === 'Todas' ? 'Todas' : t === 'dicionario' ? 'Dicionário' : 'Expressões' }}
          </button>
        </div>
      </div>

      <!-- ═══ SEARCH ═══ -->
      <div class="relative mb-5">
        <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
        <input v-model="query" type="text" placeholder="Pesquisar nos favoritos..."
               class="w-full pl-9 pr-4 py-2.5 glass-input rounded-lg text-sm focus:outline-none">
      </div>

      <!-- ═══ RESULTS ═══ -->
      <div v-if="filtered.length > 0" class="space-y-1">
        <div v-for="item in filtered" :key="item.pt + '|' + (item.src || '')"
             class="glass-card px-4 py-3 flex items-start gap-2 cursor-pointer transition hover:bg-slate-50 card-hover list-item-enter"
             :style="{ animationDelay: (filtered.indexOf(item) * 0.04) + 's' }"
             @click="openPopup(item)">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-azulejo break-all">{{ item.pt }}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    :class="sourceClass(item)">{{ item.type === 'dicionario' ? (item.src || 'Dicionário') : 'Expressões' }}</span>
            </div>
            <p class="text-sm text-slate-600 mt-1 leading-relaxed line-clamp-2">{{ item.zh }}</p>
          </div>
          <button @click.stop="removeFav(item)"
                  class="shrink-0 p-1.5 rounded-lg transition mt-0.5 text-amber-400 hover:text-amber-500 btn-click">
            <i data-lucide="star" class="w-4 h-4" fill="currentColor"></i>
          </button>
        </div>
      </div>

      <!-- ═══ POPUP ═══ -->
      <div v-if="popupItem"
           class="fixed inset-0 z-50 flex items-center justify-center p-4 anim-fade-in"
           style="background:rgba(0,0,0,0.15)"
           @click.self="popupItem=null">
        <div class="bg-white w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden anim-bounce-in">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
            <div>
              <p class="text-lg font-bold text-slate-800">{{ popupItem.pt }}</p>
              <p class="text-xs text-slate-400">Fonte: {{ popupItem.type === 'dicionario' ? (popupItem.src || 'Dicionário') : 'Expressões' }}</p>
            </div>
            <button @click="popupItem=null" class="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 text-xl leading-none btn-click btn-glow">&times;</button>
          </div>
          <div class="px-5 py-4 overflow-y-auto text-sm text-slate-700 leading-relaxed">
            <div class="whitespace-pre-line">{{ popupItem.zh }}</div>
          </div>
        </div>
      </div>

      <!-- ═══ EMPTY ═══ -->
      <div v-if="filtered.length === 0" class="glass-card-strong rounded-glass p-10 text-center card-hover-strong anim-fade-in-up relative">
        <div class="tile-corner tile-corner-br"></div>
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center">
          <i data-lucide="bookmark" class="w-8 h-8 text-amber-400"></i>
        </div>
        <p class="text-slate-600 font-medium text-lg">{{ query ? 'Sem resultados' : 'Nenhum favorito guardado' }}</p>
        <p v-if="!query" class="text-sm text-slate-400 mt-2 leading-relaxed max-w-xs mx-auto">
          Explore o <span class="text-azulejo font-medium cursor-pointer" @click="navegar('dicionario')">Dicionário</span>
          ou as <span class="text-azulejo font-medium cursor-pointer" @click="navegar('expressoes')">Expressões</span>
          e marque palavras com o ícone <i data-lucide="heart" class="w-3.5 h-3.5 inline text-rose-400"></i> para as guardar aqui.
        </p>
      </div>

    </div>
  `,

  data() {
    return {
      query: '',
      _reactiveTick: 0,
      fType: 'Todas',
      filterTypes: ['Todas', 'dicionario', 'expressao'],
      popupItem: null,
    }
  },

  computed: {
    allItems() {
      void this._reactiveTick
      return PTStore.getFavorites() || []
    },
    filtered() {
      let list = [...this.allItems]
      if (this.fType !== 'Todas') list = list.filter(i => i.type === this.fType)
      if (this.query.trim()) {
        const q = this.query.toLowerCase()
        list = list.filter(i =>
          (i.pt || '').toLowerCase().includes(q) ||
          (i.zh || '').includes(q)
        )
      }
      // Sort: newest first (most recently added at the end of array actually,
      // so reverse for new-first)
      return list.reverse()
    },
  },

  methods: {
    openPopup(item) {
      this.popupItem = item
    },
    removeFav(item) {
      PTStore.toggleFavorite(item)
      this._reactiveTick++
      this.$nextTick(() => lucide.createIcons())
    },
    sourceClass(item) {
      if (item.type === 'expressao') return 'bg-purple-50 text-purple-600'
      const colors = {
        '紅葡漢': 'bg-rose-50 text-rose-600',
        '葡漢漢葡': 'bg-blue-50 text-blue-600',
        '漢葡葡漢': 'bg-emerald-50 text-emerald-600',
        'Universitário': 'bg-purple-50 text-purple-600',
        'Priberam': 'bg-amber-50 text-amber-600',
      }
      return colors[item.src] || 'bg-slate-100 text-slate-500'
    },
    navegar(viewId) {
      if (window.__NAV__) window.__NAV__(viewId)
    },
  },

  mounted() {
    this.$nextTick(() => lucide.createIcons())
  },
  updated() { this.$nextTick(() => lucide.createIcons()) },
}
