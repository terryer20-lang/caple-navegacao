/**
 * components/AppShell.js — 外殼：7 視圖路由 + Sync 指示器
 * 動畫全部由 CSS 處理（.anim-fade-in-up），GSAP 不用於視圖切換
 */
const AppShell = {
  template: `
    <div class="flex h-screen overflow-hidden">
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
          <!-- Sync status indicator -->
          <div class="flex items-center gap-1.5 cursor-help" :title="syncTooltip"
               @click="syncNow">
            <span :class="['inline-block w-2 h-2 rounded-full transition-all duration-300',
              syncStatus === 'syncing' ? 'bg-amber-400 anim-pulse-soft' :
              syncStatus === 'error' ? 'bg-erro' :
              syncStatus === 'ok' ? 'bg-certo' :
              'bg-slate-300']"></span>
            <span class="text-[10px] text-slate-400 font-medium hidden sm:inline">{{ syncLabel }}</span>
          </div>
          <div class="flex-1 flex justify-center">
            <StudyStats ref="statsRef" />
          </div>
        </header>
        <main class="flex-1 overflow-y-auto">
          <Transition name="view" mode="out-in">
            <component :is="currentComponent" :key="currentView" />
          </Transition>
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
      syncStatus: 'idle',
      syncLabel: '',
      syncTooltip: '',
      _syncTimer: null,
    }
  },
  computed: {
    currentComponent() {
      return { myvocab:'MeuLexicoView', vocab:'VocabView', ditado:'DitadoView', dicionario:'DicionarioView', favoritos:'FavoritosView', expressoes:'ExpressoesView', exam:'ExamView', leitura:'LeituraView', pie:'PIEView', conectores:'ConectoresView', erros:'ErrosView', exames:'ExamHistoryView' }[this.currentView] || 'VocabView'
    },
    userName() {
      return PTStore.data?.config?.userName || 'Utilizador'
    },
  },
  methods: {
    navigateTo(viewId) {
      this.currentView = viewId
      if (this.isMobile) this.sidebarOpen = false
      window.__NAV__ = this.navigateTo.bind(this)
    },
    onResize() { this.isMobile = window.innerWidth < 768 },

    // ─── Sync indicator ───
    updateSyncStatus() {
      if (!SyncManager || !SyncManager.isLoggedIn()) {
        this.syncStatus = 'idle'
        this.syncLabel = ''
        this.syncTooltip = 'Não ligado à nuvem'
        return
      }
      const lastSync = localStorage.getItem('SEMEDO_LAST_SYNC')
      if (lastSync) {
        const ago = Math.floor((Date.now() - parseInt(lastSync, 10)) / 60000)
        this.syncStatus = ago < 5 ? 'ok' : 'idle'
        this.syncLabel = ago < 1 ? 'agora' : ago + 'm'
        this.syncTooltip = 'Última sincronização: ' + (ago < 1 ? 'agora mesmo' : 'há ' + ago + ' minuto' + (ago > 1 ? 's' : ''))
      } else {
        this.syncStatus = 'idle'
        this.syncLabel = '—'
        this.syncTooltip = 'Clique para sincronizar'
      }
    },
    async syncNow() {
      if (!SyncManager || !SyncManager.isLoggedIn()) return
      this.syncStatus = 'syncing'
      this.syncLabel = '…'
      this.syncTooltip = 'A sincronizar…'
      try {
        await SyncManager.sync()
        this.syncStatus = 'ok'
        this.syncLabel = 'OK'
        localStorage.setItem('SEMEDO_LAST_SYNC', String(Date.now()))
        this.syncTooltip = 'Sincronizado!'
      } catch (e) {
        this.syncStatus = 'error'
        this.syncLabel = '!'
        this.syncTooltip = 'Erro: ' + e.message
      }
      clearTimeout(this._syncTimer)
      this._syncTimer = setTimeout(() => this.updateSyncStatus(), 3000)
    },
  },
  mounted() {
    window.__NAV__ = this.navigateTo.bind(this)
    window.addEventListener('resize', this.onResize)
    this.onResize()
    this.$nextTick(() => lucide.createIcons())
    window.addEventListener('open-config', () => { this.showConfig = true })

    this.updateSyncStatus()
    setInterval(() => this.updateSyncStatus(), 30000)

    if (SyncManager) {
      const origSync = SyncManager.sync.bind(SyncManager)
      SyncManager.sync = async () => {
        if (this) {
          this.syncStatus = 'syncing'
          this.syncLabel = '…'
        }
        try {
          await origSync()
          if (this) {
            this.syncStatus = 'ok'
            this.syncLabel = 'OK'
            localStorage.setItem('SEMEDO_LAST_SYNC', String(Date.now()))
          }
        } catch (e) {
          if (this) {
            this.syncStatus = 'error'
            this.syncLabel = '!'
          }
          throw e
        }
        if (this) setTimeout(() => this.updateSyncStatus(), 3000)
      }
    }
  },
  updated() {
    this.$nextTick(() => lucide.createIcons())
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
    clearTimeout(this._syncTimer)
  },
}
