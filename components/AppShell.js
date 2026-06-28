/**
 * components/AppShell.js — 外殼：登錄閘門 + 即時視圖切換 + Sync 指示器
 */
const AppShell = {
  template: `
    <!-- ═══ LOGIN GATE ═══ -->
    <div v-if="!loggedIn" class="h-screen flex items-center justify-center p-6"
         style="background:radial-gradient(ellipse 80% 60% at 50% 40%, rgba(212,168,67,0.10) 0%, transparent 60%),linear-gradient(165deg,#e8ddce,#d6dbe3)">
      <div class="glass-card-strong rounded-glass-lg w-full max-w-sm p-6 shadow-glass-lg text-center anim-fade-up">
        <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-azulejo/10 flex items-center justify-center">
          <i data-lucide="book-open" class="w-7 h-7 text-azulejo"></i>
        </div>
        <h2 class="text-lg font-bold text-slate-800 mb-1">Semedo</h2>
        <p class="text-xs text-slate-400 mb-5">Inicie sessão para sincronizar o seu progresso</p>

        <input type="email" v-model="loginEmail" placeholder="Email"
               class="w-full px-3 py-2.5 glass-input rounded-lg text-sm mb-2.5 focus:outline-none focus:ring-2 focus:ring-azulejo">
        <input type="password" v-model="loginPassword" placeholder="Password"
               class="w-full px-3 py-2.5 glass-input rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-azulejo"
               @keydown.enter="doLogin">

        <div class="flex gap-2 mb-2">
          <button @click="doLogin" :disabled="loginLoading"
                  class="flex-1 py-2.5 bg-azulejo text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition btn-glow disabled:opacity-50">
            {{ loginLoading ? 'A entrar…' : 'Entrar' }}
          </button>
          <button @click="doRegister" :disabled="loginLoading"
                  class="flex-1 py-2.5 glass-btn text-slate-600 text-sm font-medium rounded-lg border hover:bg-slate-50 transition disabled:opacity-50">
            Registar
          </button>
        </div>

        <input type="url" v-model="loginApiUrl" placeholder="API URL (opcional)"
               class="w-full px-3 py-2 glass-input rounded-lg text-xs mb-2 focus:outline-none focus:ring-1 focus:ring-azulejo">

        <p v-if="loginMsg" class="text-xs mt-2" :class="loginMsgType==='erro'?'text-erro':'text-certo'">{{ loginMsg }}</p>

        <p class="text-[10px] text-slate-400 mt-4">Os dados ficam guardados localmente e sincronizados na nuvem.</p>
      </div>
    </div>

    <!-- ═══ MAIN APP ═══ -->
    <div v-else class="flex h-screen overflow-hidden">
      <div v-if="isMobile && sidebarOpen"
           class="fixed inset-0 z-30 sidebar-overlay" @click="sidebarOpen = false"></div>
      <Sidebar :active-view="currentView" :sidebar-open="sidebarOpen" :is-mobile="isMobile"
               @navigate="navigateTo" @open-config="showConfig = true" />
      <div class="flex-1 flex flex-col min-w-0">
        <header class="h-14 glass-base border-b border-slate-200 flex items-center px-4 shrink-0 gap-3">
          <div class="flex items-center gap-2">
            <button @click="sidebarOpen = !sidebarOpen"
                    class="btn-glow btn-magnetic p-1.5 rounded-lg">
              <i data-lucide="menu" class="w-5 h-5"></i>
            </button>
            <span class="text-sm font-medium text-slate-600">{{ userName }}</span>
          </div>
          <div class="flex items-center gap-1.5 cursor-help" :title="syncTooltip" @click="syncNow">
            <span :class="['inline-block w-2 h-2 rounded-full transition-colors',
              syncStatus==='syncing'?'bg-amber-400 anim-pulse-soft':
              syncStatus==='error'?'bg-erro':
              syncStatus==='ok'?'bg-certo':'bg-slate-300']"></span>
            <span class="text-[10px] text-slate-400 font-medium hidden sm:inline">{{ syncLabel }}</span>
          </div>
          <div class="flex-1 flex justify-center">
            <StudyStats />
          </div>
        </header>
        <main class="flex-1 overflow-y-auto">
          <!-- 即時切換：無 Transition -->
          <component :is="currentComponent" :key="currentView" />
        </main>
      </div>
      <ConfigModal :show="showConfig" @close="showConfig = false" />
    </div>
  `,
  components: { Sidebar, ConfigModal, MeuLexicoView, VocabView, DitadoView, ExamView, LeituraView, PIEView, ConectoresView, ErrosView, ExamHistoryView, StudyStats, DicionarioView, ExpressoesView, FavoritosView },
  data() {
    return {
      currentView: 'vocab',
      sidebarOpen: true,
      showConfig: false,
      isMobile: window.innerWidth < 768,
      syncStatus: 'idle', syncLabel: '', syncTooltip: '', _syncTimer: null,
      loggedIn: false,
      loginEmail: '', loginPassword: '', loginApiUrl: '', loginMsg: '', loginMsgType: '', loginLoading: false,
    }
  },
  computed: {
    currentComponent() {
      return { myvocab:'MeuLexicoView', vocab:'VocabView', ditado:'DitadoView', dicionario:'DicionarioView', favoritos:'FavoritosView', expressoes:'ExpressoesView', exam:'ExamView', leitura:'LeituraView', pie:'PIEView', conectores:'ConectoresView', erros:'ErrosView', exames:'ExamHistoryView' }[this.currentView] || 'VocabView'
    },
    userName() { return PTStore.data?.config?.userName || 'Utilizador' },
  },
  methods: {
    navigateTo(viewId) { this.currentView = viewId; if (this.isMobile) this.sidebarOpen = false; window.__NAV__ = this.navigateTo.bind(this) },
    onResize() { this.isMobile = window.innerWidth < 768 },

    // ─── Auth ───
    async doLogin() {
      if (!this.loginEmail||!this.loginPassword) { this.loginMsg='Preencha email e password'; this.loginMsgType='erro'; return }
      this.loginLoading=true; this.loginMsg=''
      try {
        if (this.loginApiUrl) SyncManager.setApiUrl(this.loginApiUrl)
        await SyncManager.login(this.loginEmail, this.loginPassword)
        this.loggedIn = true
        this.loginPassword = ''
      } catch(e) { this.loginMsg=e.message; this.loginMsgType='erro'; this.loginLoading=false }
    },
    async doRegister() {
      if (!this.loginEmail||!this.loginPassword) { this.loginMsg='Preencha email e password'; this.loginMsgType='erro'; return }
      this.loginLoading=true; this.loginMsg=''
      try {
        if (this.loginApiUrl) SyncManager.setApiUrl(this.loginApiUrl)
        await SyncManager.register(this.loginEmail, this.loginPassword)
        this.loggedIn = true
        this.loginPassword = ''
      } catch(e) { this.loginMsg=e.message; this.loginMsgType='erro'; this.loginLoading=false }
    },

    // ─── Sync indicator ───
    updateSyncStatus() {
      if (!SyncManager||!SyncManager.isLoggedIn()) { this.syncStatus='idle'; this.syncLabel=''; this.syncTooltip=''; return }
      const lastSync=localStorage.getItem('SEMEDO_LAST_SYNC')
      if(lastSync){const ago=Math.floor((Date.now()-parseInt(lastSync))/60000);this.syncStatus=ago<5?'ok':'idle';this.syncLabel=ago<1?'agora':ago+'m';this.syncTooltip='Última: '+(ago<1?'agora':'há '+ago+'m')}
      else{this.syncStatus='idle';this.syncLabel='—';this.syncTooltip='Clique p/ sincronizar'}
    },
    async syncNow() {
      if(!SyncManager||!SyncManager.isLoggedIn())return
      this.syncStatus='syncing';this.syncLabel='…';this.syncTooltip='A sincronizar…'
      try{await SyncManager.sync();this.syncStatus='ok';this.syncLabel='OK';localStorage.setItem('SEMEDO_LAST_SYNC',String(Date.now()));this.syncTooltip='Sincronizado!'}
      catch(e){this.syncStatus='error';this.syncLabel='!';this.syncTooltip='Erro: '+e.message}
      clearTimeout(this._syncTimer);this._syncTimer=setTimeout(()=>this.updateSyncStatus(),3000)
    },
  },
  mounted() {
    // Check login state
    this.loggedIn = typeof SyncManager !== 'undefined' && SyncManager.isLoggedIn && SyncManager.isLoggedIn()

    window.__NAV__ = this.navigateTo.bind(this)
    window.addEventListener('resize', this.onResize); this.onResize()
    this.$nextTick(() => lucide.createIcons())
    window.addEventListener('open-config', () => { this.showConfig = true })
    this.updateSyncStatus()
    setInterval(() => this.updateSyncStatus(), 30000)

    if (SyncManager) {
      const origSync = SyncManager.sync.bind(SyncManager)
      SyncManager.sync = async()=>{
        if(this){this.syncStatus='syncing';this.syncLabel='…'}
        try{await origSync();if(this){this.syncStatus='ok';this.syncLabel='OK';localStorage.setItem('SEMEDO_LAST_SYNC',String(Date.now()))}}
        catch(e){if(this)this.syncStatus='error';this.syncLabel='!';throw e}
        if(this)setTimeout(()=>this.updateSyncStatus(),3000)
      }
    }
  },
  updated() { this.$nextTick(() => lucide.createIcons()) },
  beforeUnmount() { window.removeEventListener('resize', this.onResize); clearTimeout(this._syncTimer) },
}
