/**
 * components/ErrosView.js — 錯題本入口
 * 選擇方向後開新視窗進行背誦
 */
const ErrosView = {
  template: `
    <div class="p-6 max-w-xl mx-auto">

      <!-- ═══ 無錯誤 ═══ -->
      <div v-if="totalCount === 0" class="glass-card-strong rounded-glass p-12 text-center anim-bounce-in">
        <i data-lucide="check-circle" class="w-16 h-16 mx-auto text-certo mb-4"></i>
        <p class="text-lg font-bold text-slate-800">Nenhum erro registado!</p>
        <p class="text-sm text-slate-500 mt-1">Os erros aparecerão aqui após as rondas de vocabulário.</p>
        <button @click="goToVocab"
                class="mt-6 px-5 py-2.5 glass-btn-primary font-medium rounded-lg transition inline-flex items-center gap-2 btn-glow btn-magnetic">
          <i data-lucide="book-open" class="w-4 h-4"></i>
          Ir para Vocabulário
        </button>
      </div>

      <!-- ═══ 有錯題 ═══ -->
      <div v-if="totalCount > 0" class="anim-fade-in-up">

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3 mb-6">
          <div class="glass-card rounded-glass p-4 text-center stat-fade-up">
            <p class="text-2xl font-bold text-slate-800">{{ totalCount }}</p>
            <p class="text-xs text-slate-500 mt-0.5">Total</p>
          </div>
          <div class="glass-card rounded-glass p-4 text-center stat-fade-up">
            <p class="text-2xl font-bold text-erro">{{ dueCount }}</p>
            <p class="text-xs text-slate-500 mt-0.5">Por rever</p>
          </div>
          <div class="glass-card rounded-glass p-4 text-center stat-fade-up">
            <p class="text-2xl font-bold text-azulejo">{{ myVocabCount }}</p>
            <p class="text-xs text-slate-500 mt-0.5">Já aprendidas</p>
          </div>
        </div>

        <!-- Mode Selector -->
        <div class="glass-card rounded-glass p-5 mb-5">
          <label class="block text-xs font-medium text-slate-500 mb-3">Direção de estudo</label>
          <div class="flex gap-2">
            <button @click="mode='zh2pt'"
                    :class="['flex-1 px-4 py-3 rounded-lg text-sm font-medium transition border btn-click',
                      mode==='zh2pt' ? 'bg-azulejo/8 border-azulejo/25 text-azulejo' : 'glass-btn text-slate-500 border-slate-200 hover:bg-slate-50']">
              <span class="block font-bold">Chinês → Português</span>
              <span class="text-[10px] opacity-70">Ver chinês, escrever português</span>
            </button>
            <button @click="mode='pt2zh'"
                    :class="['flex-1 px-4 py-3 rounded-lg text-sm font-medium transition border btn-click',
                      mode==='pt2zh' ? 'bg-azulejo/8 border-azulejo/25 text-azulejo' : 'glass-btn text-slate-500 border-slate-200 hover:bg-slate-50']">
              <span class="block font-bold">Português → Chinês</span>
              <span class="text-[10px] opacity-70">Ver português, autoavaliar</span>
            </button>
          </div>
        </div>

        <!-- Start button -->
        <button @click="startReview" :disabled="dueCount === 0"
                class="w-full px-6 py-3 glass-btn-primary font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-glow btn-magnetic">
          <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
          Iniciar revisão ({{ dueCount }} palavras)
        </button>
        <p v-if="dueCount === 0 && totalCount > 0" class="text-xs text-slate-400 mt-2 text-center">
          Todas as palavras foram revistas. Volte mais tarde para novas revisões.
        </p>
      </div>
    </div>
  `,

  data() {
    return {
      mode: 'pt2zh',
    }
  },

  computed: {
    totalCount() { return PTStore.data.wrong_words.length },
    dueCount() { return PTStore.getDueWrongWords().length },
    myVocabCount() { return PTStore.getMyVocabCount() },
  },

  methods: {
    startReview() {
      const due = PTStore.getDueWrongWords()
      if (due.length === 0) return
      PTStore.logActivity()
      // Save round data to localStorage and open new window
      const roundData = {
        words: due,
        mode: this.mode,
        timestamp: Date.now(),
      }
      try {
        localStorage.setItem('ERROS_CURRENT_ROUND', JSON.stringify(roundData))
        window.__OPEN_EXAM__('erros_exam.html')
      } catch (e) {
        console.warn('Erro ao abrir janela de erros:', e)
      }
    },
    goToVocab() {
      if (typeof window.__NAV__ === 'function') window.__NAV__('vocab')
    },
  },

  mounted() {
    this.$nextTick(() => lucide.createIcons())
  },
  updated() {
    this.$nextTick(() => lucide.createIcons())
  },
}
