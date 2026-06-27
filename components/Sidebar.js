/**
 * components/Sidebar.js — 6 視圖側欄導航，可拖移調整寬度
 */
const Sidebar = {
  template: `
    <aside class="h-screen flex flex-col shrink-0 relative"
           :class="{'hidden': !sidebarOpen, 'fixed inset-y-0 left-0 z-40 shadow-lg': sidebarOpen && isMobile}"
           :style="{ width: sidebarWidth + 'px' }">
      <div class="flex-1 flex flex-col glass-card-strong overflow-hidden relative">
        <div class="sidebar-header border-b border-slate-200">
          <div class="tile-corner tile-corner-tl"></div>
          <div class="tile-corner tile-corner-tr"></div>
          <h1 class="text-2xl font-serif tracking-normal leading-snug mb-1"
              style="font-family:'Times New Roman', Times, serif; color:#1a7bb5;">
            Tudo vale a pena
          </h1>
          <p class="text-sm text-slate-600 italic leading-relaxed"
             style="font-family:'Times New Roman', Times, serif;">
            Se a alma não é pequena
          </p>
          <div class="flex items-center gap-2 mt-3 mb-1">
            <span class="poem-diamond"></span>
            <span class="text-[10px] text-slate-400 tracking-widest uppercase">Fernando Pessoa</span>
            <span class="poem-diamond"></span>
          </div>
        </div>
        <nav class="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto gpu-blur">
          <button v-for="(item, ni) in navItems" :key="item.id"
                  @click="$emit('navigate', item.id)"
                  :class="['w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left nav-indicator btn-click nav-spring list-item-enter',
                    activeView === item.id ? 'glass-nav-active text-azulejo font-semibold' : 'glass-nav text-slate-600']"
                  :style="{ animationDelay: (ni * 0.04) + 's' }">
            <i :data-lucide="item.icon" class="w-5 h-5 shrink-0"></i>
            <span>{{ item.label }}</span>
          </button>
        </nav>
        <div class="px-3 py-3 border-t border-slate-200">
          <button @click="$emit('open-config')"
                  class="glass-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 btn-glow btn-magnetic card-hover-strong">
            <i data-lucide="settings" class="w-5 h-5 shrink-0"></i>
            <span>Configurações</span>
          </button>
        </div>
      </div>
      <!-- Resize handle -->
      <div class="absolute inset-y-0 right-0 w-1.5 cursor-col-resize z-50 group"
           @mousedown.prevent="startResize">
        <div class="w-0.5 h-full mx-auto transition-colors"
             :class="resizing ? 'bg-azulejo/40' : 'bg-transparent group-hover:bg-slate-300/50'"></div>
      </div>
    </aside>
  `,
  props: { activeView: String, sidebarOpen: Boolean, isMobile: Boolean },
  emits: ['navigate', 'open-config'],
  data() {
    return {
      navItems: [
        { id: 'myvocab',   label: 'Minha Conta',            icon: 'user' },
        { id: 'vocab',      label: 'Léxicos',                 icon: 'book-open' },
        { id: 'dicionario', label: 'Dicionários',             icon: 'book-marked' },
        { id: 'expressoes', label: 'Expressões',             icon: 'message-square' },
        { id: 'conectores', label: 'Conectores',             icon: 'link-2' },
        { id: 'favoritos',  label: 'Favoritos',              icon: 'star' },
        { id: 'leitura',    label: 'Leitura',                icon: 'book-open' },
        { id: 'ditado',     label: 'Ditado',                 icon: 'ear' },
        { id: 'exam',       label: 'CL', icon: 'file-text' },
        { id: 'pie',        label: 'PIE', icon: 'pen-tool' },
        { id: 'erros',      label: 'Palavras Erradas',       icon: 'alert-circle' },
        { id: 'exames',     label: 'Revisão',               icon: 'clock' },
      ],
      sidebarWidth: 240,
      resizing: false,
      startX: 0,
      startWidth: 0,
    }
  },
  methods: {
    startResize(e) {
      this.resizing = true
      this.startX = e.clientX
      this.startWidth = this.sidebarWidth
      document.addEventListener('mousemove', this.onResize)
      document.addEventListener('mouseup', this.stopResize)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    onResize(e) {
      if (!this.resizing) return
      const delta = e.clientX - this.startX
      this.sidebarWidth = Math.min(420, Math.max(180, this.startWidth + delta))
    },
    stopResize() {
      this.resizing = false
      document.removeEventListener('mousemove', this.onResize)
      document.removeEventListener('mouseup', this.stopResize)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      // Save to localStorage
      try { localStorage.setItem('SEMEDO_SIDEBAR_WIDTH', String(this.sidebarWidth)) } catch {}
    },
  },
  mounted() {
    // Restore saved width
    try {
      const saved = localStorage.getItem('SEMEDO_SIDEBAR_WIDTH')
      if (saved) {
        const w = parseInt(saved, 10)
        if (w >= 180 && w <= 420) this.sidebarWidth = w
      }
    } catch {}
    this.$nextTick(() => lucide.createIcons())
  },
  updated() { this.$nextTick(() => lucide.createIcons()) },
}
