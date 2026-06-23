/**
 * components/DitadoView.js — 精聽：上傳音頻 → 同頁聽寫 + 新視窗歷史
 */
const DitadoView = {
  template: `
    <div class="p-6 max-w-5xl mx-auto">

      <!-- ═══ HEADER ═══ -->
      <div class="mb-5">
        <h2 class="text-xl font-bold text-slate-800">Ditado</h2>
      </div>

      <!-- ═══ INPUT STATE: upload + history ═══ -->
      <div v-if="stage === 'input'" class="space-y-5">

        <!-- Upload card -->
        <div class="glass-card rounded-glass p-6 text-center card-hover">
          <i data-lucide="upload" class="w-10 h-10 text-slate-300 mx-auto mb-3"></i>
          <p class="text-sm font-medium text-slate-600 mb-2">Carregue um ficheiro de áudio</p>
          <p class="text-xs text-slate-400 mb-4">Formatos: MP3, WAV, M4A, OGG</p>
          <label class="inline-block btn-click btn-glow btn-magnetic px-6 py-2.5 bg-azulejo text-white text-sm font-medium rounded-lg hover:bg-blue-800 cursor-pointer transition">
            <i data-lucide="file-audio" class="w-4 h-4 inline mr-1"></i>Selecionar áudio
            <input type="file" accept="audio/*" @change="onFileSelect" class="hidden">
          </label>
        </div>

        <!-- History -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-bold text-slate-600 uppercase tracking-wider">Histórico</p>
            <span class="text-xs text-slate-400">{{ history.length }} ditado{{ history.length !== 1 ? 's' : '' }}</span>
          </div>
          <div v-if="history.length === 0" class="text-center py-8 text-sm text-slate-400">
            <i data-lucide="file-text" class="w-8 h-8 mx-auto text-slate-200 mb-2"></i>
            <p>Ainda sem ditados guardados.</p>
          </div>
          <div v-for="h in history" :key="h.id"
               class="glass-card rounded-glass p-4 mb-2 flex items-start gap-3 card-hover cursor-pointer"
               @click="openHistory(h)">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[10px] text-slate-400 font-mono">{{ h.id }}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="levelBadge(h.level)">{{ h.level }}</span>
                <span class="text-xs text-slate-400">{{ formatDate(h.date) }}</span>
                <span v-if="h.draft" class="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700">Rascunho</span>
              </div>
              <p class="text-xs text-slate-500 truncate">{{ h.audioName }}</p>
              <p v-if="h.transcript" class="text-xs text-slate-400 mt-1 line-clamp-2">{{ h.transcript.slice(0, 120) }}{{ h.transcript.length > 120 ? '...' : '' }}</p>
            </div>
            <button @click.stop="deleteHistory(h.id)"
                    class="shrink-0 p-1 rounded text-slate-300 hover:text-erro hover:bg-rose-50 transition">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- ═══ DICTATION: two columns ═══ -->
      <div v-if="stage === 'dictating'" class="-mx-6 -mb-6 flex min-h-[calc(100vh-8rem)]">
        <!-- LEFT: Audio -->
        <div class="w-1/2 border-r border-slate-200 bg-white flex flex-col p-6">
          <div class="flex items-center justify-between mb-4 shrink-0">
            <p class="text-xs font-bold text-slate-600 uppercase tracking-wider">Áudio</p>
            <span class="text-xs text-slate-400 truncate max-w-[200px]">{{ audioName }}</span>
          </div>

          <audio ref="audioEl" @timeupdate="onTimeUpdate" @loadedmetadata="onLoaded" @ended="onEnded" class="hidden"></audio>

          <!-- Visual track -->
          <div class="mb-4 shrink-0">
            <div class="audio-track" ref="trackEl" @click="seekTrack">
              <div v-for="t in 9" :key="t" class="audio-tick" :style="{ left: (t * 10) + '%' }"></div>
              <div class="audio-track-fill" :style="{ width: trackPct + '%' }"></div>
              <div class="audio-track-progress" :style="{ left: trackPct + '%' }"></div>
              <div v-if="!isPlaying && currentTime === 0"
                   class="absolute inset-0 flex items-center justify-center text-slate-300 pointer-events-none">
                <i data-lucide="play" class="w-8 h-8"></i>
              </div>
            </div>
            <div class="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>{{ fmtTime(currentTime) }}</span>
              <span>{{ fmtTime(duration) }}</span>
            </div>
          </div>

          <!-- Controls -->
          <div class="shrink-0">
            <div class="flex items-center justify-center gap-4 mb-4">
              <button @click="rewind(10)" class="glass-btn p-2 rounded-lg text-slate-500 hover:text-slate-700 transition"><i data-lucide="skip-back" class="w-5 h-5"></i></button>
              <button @click="togglePlay" class="p-3.5 rounded-full bg-azulejo text-white hover:bg-blue-700 transition shadow-md audio-play-btn">
                <i data-lucide="play" class="w-6 h-6" v-if="!isPlaying"></i>
                <i data-lucide="pause" class="w-6 h-6" v-else></i>
              </button>
              <button @click="forward(10)" class="glass-btn p-2 rounded-lg text-slate-500 hover:text-slate-700 transition"><i data-lucide="skip-forward" class="w-5 h-5"></i></button>
            </div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-[10px] text-slate-500 font-medium">Velocidade</span>
              <div class="flex gap-1">
                <button v-for="sp in [0.5,0.75,1,1.25,1.5]" :key="sp"
                        @click="playbackRate = sp; if($refs.audioEl) $refs.audioEl.playbackRate = sp"
                        :class="['px-2.5 py-1 rounded text-[10px] font-medium transition', playbackRate===sp ? 'bg-azulejo text-white' : 'glass-btn text-slate-500 hover:bg-slate-100']">{{ sp }}×</button>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button @click="rewind(5)" class="btn-click flex-1 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition">⏪ 5s</button>
              <button @click="rewind(3)" class="btn-click flex-1 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition">⏪ 3s</button>
              <button @click="rewind(1)" class="btn-click flex-1 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition">⏪ 1s</button>
            </div>
          </div>

          <div class="flex-1"></div>
          <button @click="backToInput" class="mt-4 text-xs text-slate-400 hover:text-slate-600 transition text-left shrink-0">← Voltar</button>
        </div>

        <!-- RIGHT: Typing -->
        <div class="w-1/2 flex flex-col p-6">
          <div class="flex items-center justify-between mb-3 shrink-0">
            <p class="text-xs font-bold text-slate-600 uppercase tracking-wider">Transcrição</p>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-400">{{ wordCount }} palavras</span>
              <button @click="saveDraft" class="btn-click btn-glow px-3 py-1.5 rounded-lg text-[10px] font-medium border border-slate-200 text-slate-500 hover:bg-slate-50 transition">Rascunho</button>
              <button @click="showSave = true" class="btn-click btn-glow btn-magnetic px-3 py-1.5 rounded-lg text-[10px] font-medium bg-azulejo text-white hover:bg-blue-800 transition">Guardar</button>
            </div>
          </div>
          <textarea ref="transcriptEl" v-model="transcript" rows="16"
                    class="flex-1 w-full px-4 py-3 glass-input rounded-lg text-sm leading-relaxed resize-none focus:outline-none"
                    placeholder="Escreva aqui o que ouve..."></textarea>
          <p class="text-[10px] text-slate-300 mt-2 text-center shrink-0">⌘+Enter = Play/Pause</p>
        </div>
      </div>

      <!-- ═══ SAVE MODAL ═══ -->
      <div v-if="showSave" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.15)" @click.self="showSave=false">
        <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
          <p class="text-sm font-bold text-slate-800 mb-4">Guardar ditado</p>
          <label class="block text-xs text-slate-500 font-medium mb-2">Nível QECR</label>
          <div class="flex flex-wrap gap-2 mb-5">
            <button v-for="lv in saveLevels" :key="lv.id"
                    @click="saveLevel = lv.id"
                    :class="['px-3 py-1.5 rounded-lg text-xs font-medium transition border', saveLevel === lv.id ? lv.cls : 'glass-btn text-slate-500 border-slate-200']">{{ lv.id }}</button>
          </div>
          <div class="flex gap-3 justify-end">
            <button @click="showSave=false" class="px-4 py-2 text-xs font-medium glass-btn rounded-lg">Cancelar</button>
            <button @click="finalSave" class="px-4 py-2 text-xs font-medium bg-azulejo text-white rounded-lg hover:bg-blue-800 transition">Guardar</button>
          </div>
        </div>
      </div>

    </div>
  `,

  data() {
    return {
      stage: 'input',        // input | dictating
      examReady: false,
      loading: false,
      /* audio */
      audioFile: null,
      audioName: '',
      audioUrl: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      playbackRate: 1,
      /* transcript */
      draftId: null,
      transcript: '',
      showSave: false,
      saveLevel: 'B1',
      saveLevels: [
        { id: 'A1', cls: 'bg-emerald-50 border-emerald-400 text-emerald-700' },
        { id: 'A2', cls: 'bg-teal-50 border-teal-400 text-teal-700' },
        { id: 'B1', cls: 'bg-sky-50 border-sky-400 text-sky-700' },
        { id: 'B2', cls: 'bg-indigo-50 border-indigo-400 text-indigo-700' },
        { id: 'C1', cls: 'bg-violet-50 border-violet-400 text-violet-700' },
        { id: 'C2', cls: 'bg-rose-50 border-rose-400 text-rose-700' },
      ],
    }
  },

  computed: {
    history() { return PTStore.getDictationHistory() || [] },
    trackPct() { return this.duration > 0 ? (this.currentTime / this.duration * 100) : 0 },
    wordCount() { return this.transcript.trim() ? this.transcript.trim().split(/\s+/).length : 0 },
    levelBadge() {
      return (lv) => ({ A1:'bg-emerald-50 text-emerald-700', A2:'bg-teal-50 text-teal-700', B1:'bg-sky-50 text-sky-700', B2:'bg-indigo-50 text-indigo-700', C1:'bg-violet-50 text-violet-700', C2:'bg-rose-50 text-rose-700' }[lv] || 'bg-slate-100 text-slate-500')
    },
  },

  methods: {
    /* ─── Upload ─── */
    onFileSelect(e) {
      const file = e.target.files?.[0]
      if (!file) return
      this.audioFile = file
      this.audioName = file.name
      if (this.audioUrl) URL.revokeObjectURL(this.audioUrl)
      this.audioUrl = URL.createObjectURL(file)
      this.draftId = null
      this.transcript = ''
      this.stage = 'dictating'
      this.$nextTick(() => {
        if (this.$refs.audioEl) {
          this.$refs.audioEl.src = this.audioUrl
          this.$refs.audioEl.playbackRate = this.playbackRate
        }
        this.$refs.transcriptEl?.focus()
      })
    },

    /* ─── Audio ─── */
    togglePlay() {
      const el = this.$refs.audioEl; if (!el) return
      if (el.paused) { el.play(); this.isPlaying = true }
      else { el.pause(); this.isPlaying = false }
    },
    rewind(s) { const el = this.$refs.audioEl; if (el) el.currentTime = Math.max(0, el.currentTime - s) },
    forward(s) { const el = this.$refs.audioEl; if (el) el.currentTime = Math.min(this.duration, el.currentTime + s) },
    seekTrack(e) {
      const el = this.$refs.audioEl; const tr = this.$refs.trackEl
      if (!el || !tr || !this.duration) return
      const r = tr.getBoundingClientRect(); const p = (e.clientX - r.left) / r.width
      el.currentTime = Math.max(0, Math.min(this.duration, p * this.duration))
    },
    onTimeUpdate() { const el = this.$refs.audioEl; if (el) this.currentTime = el.currentTime },
    onLoaded() { const el = this.$refs.audioEl; if (el) this.duration = el.duration },
    onEnded() { this.isPlaying = false },
    fmtTime(s) {
      if (!s || isNaN(s)) return '0:00'
      return Math.floor(s/60) + ':' + String(Math.floor(s%60)).padStart(2,'0')
    },

    /* ─── Save ─── */
    _genId() {
      const now = new Date()
      const ymd = now.getFullYear().toString() + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0')
      let seq = 1
      try { seq = (parseInt(localStorage.getItem('CAPLE_DIT_SEQ') || '0', 10)) + 1 } catch {}
      localStorage.setItem('CAPLE_DIT_SEQ', String(seq))
      return 'DIT_' + ymd + '_' + String(seq).padStart(2, '0')
    },
    saveDraft() {
      const id = this.draftId || this._genId()
      this.draftId = id
      PTStore.saveDictation({ id, date: new Date().toISOString(), level: '--', audioName: this.audioName, transcript: this.transcript, draft: true })
    },
    finalSave() {
      const id = this.draftId || this._genId()
      this.draftId = id
      PTStore.saveDictation({ id, date: new Date().toISOString(), level: this.saveLevel, audioName: this.audioName, transcript: this.transcript, draft: false })
      this.showSave = false
      this.backToInput()
    },
    backToInput() {
      if (this.audioUrl) { URL.revokeObjectURL(this.audioUrl); this.audioUrl = null }
      this.stage = 'input'
      this.isPlaying = false; this.currentTime = 0; this.duration = 0
      this.draftId = null; this.transcript = ''
      if (this.$refs.audioEl) this.$refs.audioEl.pause()
    },

    /* ─── History (opens new tab, no audio) ─── */
    openHistory(h) {
      try {
        localStorage.setItem('DIT_CURRENT_DICTATION', JSON.stringify({
          id: h.id, audioName: h.audioName, transcript: h.transcript || '', timestamp: Date.now(),
        }))
        window.location.href = 'ditado_exam.html'
      } catch (e) { console.warn(e) }
    },
    deleteHistory(id) { PTStore.deleteDictation(id) },
    formatDate(iso) {
      if (!iso) return '—'
      return new Date(iso).toLocaleDateString('pt-PT', { day:'2-digit', month:'2-digit', year:'numeric' })
    },

    _onKeyDown(e) {
      if (this.stage !== 'dictating') return
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        this.togglePlay()
      }
    },
  },

  mounted() {
    document.addEventListener('keydown', this._onKeyDown)
    this.$nextTick(() => lucide.createIcons())
  },
  updated() { this.$nextTick(() => lucide.createIcons()) },
  beforeUnmount() {
    document.removeEventListener('keydown', this._onKeyDown)
    if (this.audioUrl) URL.revokeObjectURL(this.audioUrl)
  },
}
