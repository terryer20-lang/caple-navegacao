/**
 * components/NewsView.js — 精讀區：上傳文章 → 左原文/右備註 + 點詞查字典
 */
const LeituraView = {
  template: `
    <div class="p-6 max-w-3xl mx-auto">

      <!-- Header -->
      <div class="mb-5">
        <h2 class="text-xl font-bold text-slate-800">Leitura Intensiva</h2>
      </div>

      <!-- ═══ INPUT STAGE ═══ -->
      <div class="space-y-4">
        <div class="glass-card rounded-glass p-5">
          <label class="text-xs text-slate-500 font-medium block mb-2">Texto original</label>
          <textarea v-model="sourceText" rows="10"
                    class="glass-input w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-y"
                    placeholder="Cole aqui um texto em português europeu para leitura intensiva..."></textarea>
        </div>

        <div class="text-center">
          <button @click="openReading"
                  :disabled="!sourceText.trim()"
                  class="btn-click btn-glow px-8 py-3 bg-azulejo text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-40 transition inline-flex items-center gap-2">
            <i data-lucide="book-open" class="w-4 h-4"></i>
            Abrir Leitura
          </button>
        </div>
      </div>
    </div>
  `,

  data() { return { sourceText: '' } },

  methods: {
    openReading() {
      if (!this.sourceText.trim()) return
      try {
        localStorage.setItem('LEITURA_TEXT', this.sourceText.trim())
        window.open('leitura_exam.html', '_blank')
      } catch (e) {
        alert('Erro ao abrir: ' + e.message)
      }
    },
  },

  mounted() { this.$nextTick(() => lucide.createIcons()) },
  updated() { this.$nextTick(() => lucide.createIcons()) },
}
