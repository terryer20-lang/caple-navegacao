/**
 * components/ConfigModal.js — API Key + CEFR 等級設定 + 重置資料
 */
const ConfigModal = {
  template: `
    <transition name="scale">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 gpu-layer" style="background:rgba(0,0,0,0.08);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)" @click.self="$emit('close')">
        <div class="glass-card-strong rounded-glass-lg w-full max-w-3xl p-6 shadow-glass-lg card-hover-strong">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-bold text-slate-800">Configurações</h3>
            <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <!-- ═══ HORIZONTAL LAYOUT ═══ -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Left Column -->
            <div class="space-y-4">

              <!-- User name -->
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Nome de Utilizador</label>
                <input type="text" v-model="local.userName" class="w-full px-3 py-2 glass-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-azulejo focus:border-transparent" placeholder="O seu nome">
              </div>

              <!-- API Key -->
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Chave API DeepSeek</label>
                <input type="password" v-model="local.deepseekKey" class="w-full px-3 py-2 glass-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-azulejo focus:border-transparent" placeholder="sk-...">
                <p class="text-xs text-slate-400 mt-1">Armazenada localmente. Nunca enviada a terceiros.</p>
              </div>

              <!-- ═══ REPOR VOCABULÁRIO ═══ -->
              <div class="p-4 rounded-lg border border-amber-200 bg-amber-50/40">
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

            </div>

            <!-- Right Column -->
            <div class="space-y-4">

              <!-- ═══ SYNC / CONTA ═══ -->
              <div class="p-4 rounded-lg border border-blue-200 bg-blue-50/40">
                <p class="text-xs font-bold text-azulejo uppercase tracking-wider mb-2">Sincronização</p>

                <template v-if="!syncLoggedIn">
                  <input type="email" v-model="syncEmail" placeholder="Email"
                         class="w-full px-3 py-2 glass-input rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-azulejo mb-2">
                  <input type="password" v-model="syncPassword" placeholder="Password"
                         class="w-full px-3 py-2 glass-input rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-azulejo mb-2"
                         @keydown.enter="doLogin">
                  <input type="url" v-model="syncApiUrl" placeholder="API URL"
                         class="w-full px-3 py-2 glass-input rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-azulejo mb-2">
                  <div class="flex gap-2">
                    <button @click="doLogin"
                            class="flex-1 px-4 py-2 text-xs font-medium bg-azulejo text-white rounded-lg hover:bg-blue-800 transition btn-glow btn-magnetic">Entrar</button>
                    <button @click="doRegister"
                            class="flex-1 px-4 py-2 text-xs font-medium glass-btn text-slate-600 rounded-lg border hover:bg-slate-50 transition">Registar</button>
                  </div>
                  <p v-if="syncMsg" class="text-xs mt-2" :class="syncMsgType === 'erro' ? 'text-erro' : 'text-certo'">{{ syncMsg }}</p>
                </template>

                <template v-else>
                  <p class="text-xs text-slate-600 mb-2">
                    <i data-lucide="check-circle" class="inline w-3.5 h-3.5 text-certo mr-1"></i>
                    {{ syncUser?.email }}
                  </p>
                  <div class="flex gap-2">
                    <button @click="doSync"
                            class="flex-1 px-4 py-2 text-xs font-medium bg-certo text-white rounded-lg hover:bg-green-800 transition btn-glow btn-magnetic">
                      <i data-lucide="refresh-cw" class="inline w-3.5 h-3.5 mr-1"></i>Sincronizar agora
                    </button>
                    <button @click="doLogout"
                            class="px-4 py-2 text-xs font-medium glass-btn text-slate-500 rounded-lg border hover:bg-slate-50 transition">Sair</button>
                  </div>
                  <p v-if="syncMsg" class="text-xs mt-2" :class="syncMsgType === 'erro' ? 'text-erro' : 'text-certo'">{{ syncMsg }}</p>
                </template>
              </div>

              <!-- ═══ RESET ALL DATA ═══ -->
              <div class="p-4 rounded-lg border border-rose-200 bg-rose-50/40">
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

            </div>
          </div>

          <!-- Bottom buttons -->
          <div class="flex gap-3 justify-end mt-5 pt-4 border-t border-slate-100">
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
      syncEmail: '',
      syncPassword: '',
      syncApiUrl: SyncManager ? SyncManager.getApiUrl() : '',
      syncMsg: '',
      syncMsgType: '',
    }
  },
  computed: {
    syncLoggedIn() { return SyncManager && SyncManager.isLoggedIn() },
    syncUser() { return SyncManager && SyncManager.getUser() },
  },
  watch: {
    show(val) { if (val) { this.local = { ...PTStore.data.config }; this.confirmReset = false; this.confirmVocabReset = false } },
  },
  methods: {
    guardar() { PTStore.updateConfig(this.local); this.$emit('close') },

    // ─── Sync Methods ───
    async doLogin() {
      this.syncMsg = ''
      this.syncMsgType = ''
      if (!this.syncEmail || !this.syncPassword) {
        this.syncMsg = 'Email e password são obrigatórios'; this.syncMsgType = 'erro'; return
      }
      try {
        if (this.syncApiUrl) SyncManager.setApiUrl(this.syncApiUrl)
        await SyncManager.login(this.syncEmail, this.syncPassword)
        this.syncMsg = 'Login efetuado com sucesso! A sincronizar...'
        this.syncMsgType = 'ok'
        this.syncPassword = ''
        // 登入後立即拉取數據
        await SyncManager.pullAll()
        this.syncMsg = 'Dados sincronizados!'
      } catch (e) {
        this.syncMsg = e.message; this.syncMsgType = 'erro'
      }
    },
    async doRegister() {
      this.syncMsg = ''
      this.syncMsgType = ''
      if (!this.syncEmail || !this.syncPassword) {
        this.syncMsg = 'Email e password são obrigatórios'; this.syncMsgType = 'erro'; return
      }
      try {
        if (this.syncApiUrl) SyncManager.setApiUrl(this.syncApiUrl)
        await SyncManager.register(this.syncEmail, this.syncPassword)
        this.syncMsg = 'Conta criada! Dados sincronizados.'
        this.syncMsgType = 'ok'
        this.syncPassword = ''
      } catch (e) {
        this.syncMsg = e.message; this.syncMsgType = 'erro'
      }
    },
    doLogout() {
      SyncManager.logout()
      this.syncMsg = 'Sessão terminada.'
      this.syncMsgType = 'ok'
    },
    async doSync() {
      this.syncMsg = 'A sincronizar...'
      this.syncMsgType = ''
      try {
        await SyncManager.sync()
        this.syncMsg = 'Sincronização completa!'
        this.syncMsgType = 'ok'
      } catch (e) {
        this.syncMsg = 'Erro: ' + e.message; this.syncMsgType = 'erro'
      }
    },
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
        // ─── Clear all SEMEDO exam records ───
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)
          if (k && (k.startsWith('SEMEDO_') || k === 'CL_CURRENT_EXAM' || k === 'PIE_CURRENT_EXAM')) {
            keysToRemove.push(k)
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k))
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
