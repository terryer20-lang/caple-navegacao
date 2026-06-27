/**
 * components/ConectoresView.js — 連接詞庫 + 造句練習
 */
const ConectoresView = {
  template: `
    <div class="p-6 max-w-3xl mx-auto anim-fade-in-up">
      <!-- Header -->
      <div class="mb-5">
        <h2 class="text-xl font-bold text-slate-800">Conectores</h2>
      </div>

      <!-- Search -->
      <div class="relative mb-5">
        <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
        <input v-model="searchQuery" type="text" placeholder="Pesquisar conector..."
               class="w-full pl-9 pr-4 py-2.5 glass-input rounded-lg text-sm focus:outline-none">
      </div>

      <!-- Category Groups -->
      <div v-for="cat in filteredCategories" :key="cat.categoria" class="mb-4 list-item-enter">
        <div class="glass-card rounded-glass overflow-hidden card-hover-strong">
          <button @click="toggleCat(cat.categoria)"
                  class="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-100 transition text-left card-hover btn-glow btn-magnetic btn-click">
            <div>
              <h3 class="text-sm font-semibold text-slate-700">{{ cat.categoria }}</h3>
              <p class="text-xs text-slate-400">{{ cat.desc }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-300">{{ cat.items.length }}</span>
              <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 transition-transform"
                 :class="{'rotate-180': openCats[cat.categoria]}"></i>
            </div>
          </button>

          <div v-show="openCats[cat.categoria]" class="border-t border-slate-200">
            <div v-for="(item, i) in cat.items" :key="item.pt"
                 class="px-5 py-3 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition card-hover anim-slide-right list-item-enter" :style="{ animationDelay: (i * 0.02) + 's' }">
              <div class="flex items-start justify-between gap-3 mb-2">
                <div class="min-w-0">
                  <span class="text-sm font-semibold text-azulejo"
                        @click="copyToClipboard(item.pt)" :title="'Copiar: ' + item.pt"
                        style="cursor:pointer">{{ item.pt }}</span>
                  <span class="text-xs text-slate-400 ml-2">{{ item.zh }}</span>
                </div>
                <button @click="openPractice(item)"
                        class="shrink-0 btn-click btn-glow px-2.5 py-1 rounded text-[10px] font-medium glass-btn text-slate-500 hover:text-azulejo transition whitespace-nowrap">
                  ✍ Praticar
                </button>
              </div>
              <!-- Example sentences -->
              <div class="space-y-1.5">
                <div v-for="(ex, ei) in getExs(item)" :key="ei"
                     class="text-xs text-slate-500 italic pl-3 border-l-2 border-slate-200 leading-relaxed list-item-enter" :style="{ animationDelay: (ei * 0.03) + 's' }">
                  {{ ex }}
                </div>
              </div>

              <!-- Practice area -->
              <div v-if="practiceWord === item.pt" class="mt-3 pt-3 border-t border-slate-100 space-y-3">
                <textarea v-model="practiceInput" rows="3"
                          class="glass-input w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none"
                          placeholder="Escreva uma frase usando «{{ item.pt }}»..."></textarea>
                <div class="flex items-center gap-2">
                  <button @click="submitPractice(item)"
                          :disabled="!practiceInput.trim() || practiceLoading"
                          class="px-4 py-2 text-xs font-medium bg-azulejo text-white rounded-lg hover:bg-blue-800 disabled:opacity-40 transition btn-click btn-glow btn-magnetic">
                    {{ practiceLoading ? 'A avaliar...' : 'Submeter' }}
                  </button>
                  <button @click="closePractice" class="px-3 py-2 text-xs text-slate-400 hover:text-slate-600 transition btn-click">Cancelar</button>
                </div>

                <!-- Result -->
                <div v-if="practiceResult" class="p-3 rounded-lg text-sm space-y-2"
                     :class="practiceResult.erro ? 'bg-rose-50/80 border border-rose-200/50' : 'bg-slate-50/80 border border-slate-200/50'">
                  <div v-if="practiceResult.erro" class="text-erro text-xs">{{ practiceResult.erro }}</div>
                  <div v-else>
                    <div class="flex items-center gap-4 text-xs">
                      <span><strong>QECR:</strong> {{ practiceResult.nivel }}</span>
                      <span><strong>Pontuação:</strong>
                        <span :class="scoreColor(practiceResult.pontuacao)">{{ practiceResult.pontuacao }}</span>/100
                      </span>
                    </div>
                    <p class="text-xs text-slate-600 mt-2 leading-relaxed">{{ practiceResult.comentario }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredCategories.length === 0" class="glass-card-strong rounded-glass p-8 text-center card-hover-strong">
        <i data-lucide="search-x" class="w-10 h-10 mx-auto text-slate-300 mb-2"></i>
        <p class="text-slate-400 text-sm">Nenhum conector encontrado.</p>
      </div>
    </div>
  `,

  data() {
    return {
      categories: [],
      openCats: {},
      searchQuery: '',
      practiceWord: null,
      practiceInput: '',
      practiceLoading: false,
      practiceResult: null,
    }
  },

  computed: {
    filteredCategories() {
      let cats = this.categories.map(cat => {
        let items = cat.items
        if (this.searchQuery.trim()) {
          const q = this.searchQuery.toLowerCase()
          items = items.filter(i =>
            i.pt.toLowerCase().includes(q) ||
            i.zh.includes(q) ||
            this.getExs(i).some(ex => ex.toLowerCase().includes(q))
          )
        }
        return { ...cat, items }
      })
      return cats.filter(c => c.items.length > 0)
    },
  },

  methods: {
    getExs(item) {
      return item.exs || (item.ex ? [item.ex] : [])
    },

    toggleCat(name) {
      this.openCats[name] = !this.openCats[name]
    },

    openPractice(item) {
      this.practiceWord = item.pt
      this.practiceInput = ''
      this.practiceResult = null
      this.$nextTick(() => lucide.createIcons())
    },

    closePractice() {
      this.practiceWord = null
      this.practiceInput = ''
      this.practiceResult = null
    },

    async submitPractice(item) {
      if (!this.practiceInput.trim() || this.practiceLoading) return
      PTStore.logActivity()
      const apiKey = PTStore.data.config.deepseekKey
      if (!apiKey) {
        this.practiceResult = { erro: 'Configure a chave DeepSeek em Configurações.' }
        return
      }

      this.practiceLoading = true
      this.practiceResult = null

      try {
        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: 'Eres um avaliador especializado nos exames CAPLE (Português Europeu). Avalia a frase do aluno segundo os critérios oficiais do CAPLE para expressão escrita: competência gramatical, adequação vocabular, coerência discursiva e cumprimento da tarefa (uso correto do conector). Responde APENAS com JSON: {"nivel":"DAPLE","pontuacao":65,"comentario":"..."}. Níveis CAPLE: CIPLE (A2), DEPLE (B1/Elementar), DIPLE (B2/Limiar), DAPLE (C1/Avançado), DULPE (C2/Proficiente). Pontuação 0-100. comentario deve indicar pontos fortes/fracos e incluir sugestão de melhoria com exemplo concreto.' },
              { role: 'user', content: `Conector: "${item.pt}". Frase do aluno: "${this.practiceInput.trim()}"` },
            ],
            temperature: 0.3,
            max_tokens: 300,
          }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content || ''
        const jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
        this.practiceResult = JSON.parse(jsonStr)
      } catch (e) {
        this.practiceResult = { erro: e.message || 'Erro ao contactar a API' }
      } finally {
        this.practiceLoading = false
        this.$nextTick(() => lucide.createIcons())
      }
    },

    scoreColor(p) {
      const n = parseInt(p, 10)
      if (isNaN(n)) return ''
      if (n >= 80) return 'text-certo'
      if (n >= 60) return 'text-lisboa'
      return 'text-erro'
    },

    async copyToClipboard(text) {
      try { await navigator.clipboard.writeText(text) } catch {
        const el = document.createElement('textarea')
        el.value = text; document.body.appendChild(el); el.select()
        document.execCommand('copy'); document.body.removeChild(el)
      }
    },

    loadData() {
      try {
        if (typeof CONECTORES_DATA !== 'undefined') {
          this.categories = CONECTORES_DATA
          if (this.categories.length > 0)
            this.openCats[this.categories[0].categoria] = true
        }
      } catch (e) { console.error('Failed to load CONECTORES_DATA', e) }
    },
  },

  mounted() {
    this.loadData()
    this.$nextTick(() => lucide.createIcons())
  },
  updated() { this.$nextTick(() => lucide.createIcons()) },
}
