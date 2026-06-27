/**
 * components/ConfigModal.js — API Key + CEFR 等級設定 + 重置資料
 */
const ConfigModal = {
  template: `
    <transition name="scale">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 gpu-layer" style="background:rgba(0,0,0,0.08);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)" @click.self="$emit('close')">
        <div class="glass-card-strong rounded-glass-lg w-full max-w-md p-6 shadow-glass-lg card-hover-strong">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-bold text-slate-800">Configurações</h3>
            <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <!-- User name -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-600 mb-1">Nome de Utilizador</label>
            <input type="text" v-model="local.userName" class="w-full px-3 py-2 glass-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-azulejo focus:border-transparent" placeholder="O seu nome">
          </div>

          <!-- API Key -->
          <div class="mb-5">
            <label class="block text-sm font-medium text-slate-600 mb-1">Chave API DeepSeek</label>
            <input type="password" v-model="local.deepseekKey" class="w-full px-3 py-2 glass-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-azulejo focus:border-transparent" placeholder="sk-...">
            <p class="text-xs text-slate-400 mt-1">Armazenada localmente. Nunca enviada a terceiros.</p>
          </div>

          <!-- ═══ REPOR VOCABULÁRIO ═══ -->
          <div class="mb-5 p-4 rounded-lg border border-amber-200 bg-amber-50/40">
            <p class="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Vocabulário</p>
            <p class="text-xs text-amber-600 mb-3">Remove todas as palavras carregadas por CSV. Mantém o progresso e os dados de estudo.</p>
            <div v-if="!confirmVocabReset">
              <button @click="confirmVocabReset = true"
                      class="px-4 py-2 text-xs font-medium bg-lisboa text-white rounded-lg hover:bg-amber-600 transition btn-glow btn-magnetic">Repor vocabulário</button>
            </div>
            <div v-else class="flex items-center gap-2">
              <span class="text-xs text-amber-700 font-medium">Tem a certeza?</span>
              <button @click="resetVocab"
                      class="px-4 py-2 text-xs font-medium bg-lisboa text-white rounded-lg hover:bg-amber-600 transition btn-glow btn-magnetic">Sim, repor</button>
              <button @click="confirmVocabReset = false"
                      class="px-4 py-2 text-xs font-medium glass-btn text-slate-500 rounded-lg border hover:bg-slate-50 transition">Cancelar</button>
            </div>
          </div>

          <!-- ═══ RESET ALL DATA ═══ -->
          <div class="mb-5 p-4 rounded-lg border border-rose-200 bg-rose-50/40">
            <p class="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">Danger Zone</p>
            <p class="text-xs text-rose-600 mb-3">Apaga todos os dados de progresso, léxico, exames, ditados e leituras. Mantém o nome de utilizador e a chave API.</p>
            <div v-if="!confirmReset">
              <button @click="confirmReset = true"
                      class="px-4 py-2 text-xs font-medium bg-erro text-white rounded-lg hover:bg-rose-700 transition btn-glow btn-magnetic">Apagar todos os dados</button>
            </div>
            <div v-else class="flex items-center gap-2">
              <span class="text-xs text-erro font-medium">Tem a certeza?</span>
              <button @click="resetAllData"
                      class="px-4 py-2 text-xs font-medium bg-erro text-white rounded-lg hover:bg-rose-700 transition btn-glow btn-magnetic">Sim, apagar</button>
              <button @click="confirmReset = false"
                      class="px-4 py-2 text-xs font-medium glass-btn text-slate-500 rounded-lg border hover:bg-slate-50 transition">Cancelar</button>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex gap-3 justify-end">
            <button @click="$emit('close')" class="px-4 py-2 text-sm font-medium glass-btn rounded-lg">Cancelar</button>
            <button @click="guardar" class="px-4 py-2 text-sm font-medium glass-btn-primary rounded-lg btn-glow btn-magnetic">Guardar</button>
          </div>
        </div>
      </div>
    </transition>
  `,
  props: { show: { type: Boolean, default: false } },
  emits: ['close'],
  data() {
    return {
      local: { ...PTStore.data.config },
      confirmReset: false,
      confirmVocabReset: false,
    }
  },
  watch: {
    show(val) { if (val) { this.local = { ...PTStore.data.config }; this.confirmReset = false; this.confirmVocabReset = false } },
  },
  methods: {
    guardar() { PTStore.updateConfig(this.local); this.$emit('close') },
    resetVocab() {
      try {
        localStorage.removeItem('UPLOADED_VOCAB_DATA')
        this.confirmVocabReset = false
        this.$emit('close')
        location.reload()
      } catch (e) {
        alert('Erro ao repor vocabulário: ' + e.message)
      }
    },
    resetAllData() {
      const KEY = 'PT_LEARNING_DATA'
      try {
        const raw = localStorage.getItem(KEY)
        if (raw) {
          const data = JSON.parse(raw)
          const config = { deepseekKey: data.config?.deepseekKey || '', cefrLevel: data.config?.cefrLevel || 'C1', userName: data.config?.userName || 'Utilizador' }
          const defaults = {
            config,
            wrong_rewrites: [], favorite_connectors: [], exam_history: [],
            news_cache: { last_fetch: null, items: {} }, wrong_words: [],
            my_vocab_zh2pt: [], my_vocab_pt2zh: [], study_log: {},
            practice_log: [], favorites: [], dictation_history: [], leitura_history: [],
          }
          localStorage.setItem(KEY, JSON.stringify(defaults))
          // Refresh PTStore data
          Object.assign(PTStore.data, defaults)
          PTStore.save()
        }
        this.confirmReset = false
        this.$emit('close')
        // Force page reload to refresh all views
        location.reload()
      } catch (e) {
        alert('Erro ao apagar dados: ' + e.message)
      }
    },
  },
  mounted() { this.$nextTick(() => lucide.createIcons()) },
  updated() { this.$nextTick(() => lucide.createIcons()) },
}
