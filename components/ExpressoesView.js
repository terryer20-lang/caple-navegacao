/**
 * components/ExpressoesView.js — Expressões: consulta c/ popup + definição completa
 */
const ExpressoesView = {
  template: `
    <div class="p-6 max-w-3xl mx-auto">
      <div class="mb-5">
        <h2 class="text-xl font-bold text-slate-800">Expressões</h2>
      </div>

      <!-- Search -->
      <div class="relative mb-5">
        <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
        <input v-model="query" type="text" placeholder="Pesquisar expressão ou palavra-chave..."
               class="w-full pl-9 pr-4 py-2.5 glass-input rounded-lg text-sm focus:outline-none"
               @input="showAll = false">
      </div>

      <!-- Results count -->
      <div v-if="query && filtered.length > 0" class="mb-3 text-xs text-slate-400">
        {{ filtered.length }} resultado{{ filtered.length !== 1 ? 's' : '' }}
      </div>

      <!-- Results -->
      <div v-if="query && filtered.length > 0" class="space-y-1">
        <div v-for="(item, i) in visibleResults" :key="item.pt + i"
             class="glass-card px-4 py-3 cursor-pointer transition hover:bg-slate-50 flex items-start gap-2 card-hover"
             :class="'anim-fade-in-up stagger-' + Math.min(i + 1, 8)"
             @click="openPopup(item)">
          <div class="flex-1 min-w-0">
            <span class="text-sm font-semibold text-azulejo break-all">{{ item.pt }}</span>
            <p class="text-sm text-slate-600 mt-1 leading-relaxed line-clamp-2">{{ item.zh }}</p>
          </div>
          <button @click.stop="toggleFav(item)"
                  class="shrink-0 p-1.5 rounded-lg transition mt-0.5"
                  :class="isFav(item) ? 'text-amber-400 hover:text-amber-500' : 'text-slate-200 hover:text-slate-400'">
            <i data-lucide="star" class="w-4 h-4" :fill="isFav(item) ? 'currentColor' : 'none'"></i>
          </button>
        </div>
      </div>

      <!-- Show more -->
      <div v-if="hasMore" class="text-center mt-4">
        <button @click="showAll = true"
                class="px-4 py-2 text-xs font-medium text-azulejo hover:bg-slate-100 rounded-lg transition">
          Mostrar mais {{ filtered.length - DISPLAY_LIMIT }} resultado{{ filtered.length - DISPLAY_LIMIT !== 1 ? 's' : '' }}
        </button>
      </div>

      <!-- Empty: no search -->
      <div v-if="!query" class="text-center py-8">
        <i data-lucide="message-square" class="w-10 h-10 text-slate-200 mx-auto mb-3"></i>
        <p class="text-sm text-slate-400">Pesquise uma expressão ou palavra-chave</p>
        <p class="text-xs text-slate-300 mt-1">{{ dataLength.toLocaleString() }} expressões</p>
      </div>

      <!-- Empty: no results -->
      <div v-if="query && filtered.length === 0" class="text-center py-12">
        <i data-lucide="file-x" class="w-12 h-12 text-slate-200 mx-auto mb-3"></i>
        <p class="text-sm text-slate-400">Sem resultados</p>
        <p class="text-xs text-slate-300 mt-1">Tente outro termo</p>
      </div>

      <!-- ═══ POPUP ═══ -->
      <div v-if="popupItem"
           class="fixed inset-0 z-50 flex items-center justify-center p-4"
           style="background:rgba(0,0,0,0.15)"
           @click.self="popupItem=null">
        <div class="bg-white w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
            <div>
              <p class="text-lg font-bold text-slate-800">{{ popupItem.pt }}</p>
              <p class="text-xs text-slate-400">Expressão idiomática / calão</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="speak(popupItem.pt)"
                      class="btn-click btn-glow p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition text-slate-500 hover:text-slate-700"
                      title="Ouvir pronúncia">
                <i data-lucide="volume-2" class="w-5 h-5"></i>
              </button>
              <button @click="popupItem=null" class="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 text-xl leading-none">&times;</button>
            </div>
          </div>
          <div class="px-5 py-4 overflow-y-auto text-sm text-slate-700 leading-relaxed">
            <div class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{{ popupItem.zh }}</div>
            <!-- Full definition -->
            <div v-if="popupItem.raw" class="mt-4 pt-4 border-t border-slate-200">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Definição completa</p>
              <p class="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{{ popupItem.raw }}</p>
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
      dataLength: 0,
      items: [],
      popupItem: null,
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
    openPopup(item) {
      this.popupItem = item
    },
    toggleFav(item) {
      PTStore.toggleFavorite({ type: 'expressao', pt: item.pt, zh: item.zh, src: 'Expressões' })
      this.$nextTick(() => lucide.createIcons())
    },
    isFav(item) {
      return PTStore.isFavorite({ pt: item.pt, src: 'Expressões' })
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
    this.loadData()
    this.$nextTick(() => lucide.createIcons())
  },
  updated() { this.$nextTick(() => lucide.createIcons()) },
}
