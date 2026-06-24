/**
 * components/AppShell.js — 外殼：7 視圖路由 + iframe 嵌入考試頁面
 */
const AppShell = {
  template: `
    <div class="flex h-screen overflow-hidden">
      <div v-if="isMobile && sidebarOpen"
           class="fixed inset-0 z-30 sidebar-overlay" @click="sidebarOpen = false"></div>
      <Sidebar :active-view="currentView" :sidebar-open="sidebarOpen" :is-mobile="isMobile"
               @navigate="navigateTo" @open-config="showConfig = true" />
      <div class="flex-1 flex flex-col min-w-0">
        <header class="h-14 glass-base border-b border-slate-200 flex items-center px-4 shrink-0">
          <div class="flex items-center gap-2">
            <button @click="sidebarOpen = !sidebarOpen"
                    class="btn-glow btn-magnetic p-1.5 rounded-lg">
              <i data-lucide="menu" class="w-5 h-5"></i>
            </button>
            <span class="text-sm font-medium text-slate-600">{{ userName }}</span>
          </div>
          <div class="flex-1 flex justify-center">
            <StudyStats />
          </div>
          <div v-if="examFrameUrl" class="flex items-center">
            <button @click="closeExamFrame"
                    class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition">
              <i data-lucide="x" class="w-3.5 h-3.5"></i> Fechar
            </button>
          </div>
        </header>
        <main class="flex-1 overflow-hidden relative">
          <iframe v-if="examFrameUrl" :src="examFrameUrl"
                  class="w-full h-full border-0 absolute inset-0"
                  allow="clipboard-write"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"></iframe>
          <div v-else class="h-full overflow-y-auto">
            <Transition name="view" mode="out-in">
              <component :is="currentComponent" :key="currentView" />
            </Transition>
          </div>
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
      examFrameUrl: null,
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
    navigateTo(viewId) { this.currentView = viewId; if (this.isMobile) this.sidebarOpen = false; window.__NAV__ = this.navigateTo.bind(this) },
    openExamFrame(url) { this.examFrameUrl = url },
    closeExamFrame() { this.examFrameUrl = null },
    _handleExamFrameClosed() { this.examFrameUrl = null },
    onResize() { this.isMobile = window.innerWidth < 768 },
  },
  mounted() {
    window.__NAV__ = this.navigateTo.bind(this)
    window.addEventListener('resize', this.onResize)
    this.onResize()
    this.$nextTick(() => lucide.createIcons())

    // Global exam frame API
    window.__OPEN_EXAM__ = (url) => { this.examFrameUrl = url }
    window.__CLOSE_EXAM__ = () => { this.examFrameUrl = null }

    // Listen for close messages from iframe (same-origin postMessage)
    window.addEventListener('message', (e) => {
      if (e.data === 'close' || e.data === 'exam-closed') {
        this.examFrameUrl = null
      }
    })

    window.addEventListener('open-config', () => { this.showConfig = true })
  },
  updated() { this.$nextTick(() => lucide.createIcons()) },
  beforeUnmount() { window.removeEventListener('resize', this.onResize) },
}
