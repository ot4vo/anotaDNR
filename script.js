import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://jgckhnnvsmwvgxomhszm.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnY2tobm52c213dmd4b21oc3ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjQzNzcsImV4cCI6MjA4ODA0MDM3N30.V1npKabVkbR659Rfg-EW7aqq0BfnYHe5Nt_O5-3gsKY'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── STATE ───────────────────────────────────────────────────────────────────

let currentUser = null
let dados = {}
let diasAbertos = new Set()
let mapaLinhas = {}
let filtroAtivo = 'todos'

// ─── DOM CACHE ───────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id)
const ADMIN_EMAIL = 'ot4vo1@proton.me'
const dom = {
  telaLogin:      () => $('telaLogin'),
  topBar:         () => $('topBar'),
  conteudo:       () => $('conteudo'),
  userEmail:      () => $('userEmail'),
  inputPrincipal: () => $('inputPrincipal'),
  tabelaNotas:    () => $('tabelaNotas'),
  resumoGeral:    () => $('resumoGeral'),
  loginForm:      () => $('loginForm'),
  cadastroForm:   () => $('cadastroForm'),
}

// ─── TIPOS DE CLIENTE ────────────────────────────────────────────────────────

const TIPOS_CLIENTE = {
  merchant: { label: 'Merchant', cor: '#a78bfa' },
  mer:      { label: 'Merchant', cor: '#a78bfa' },
  merc:     { label: 'Merchant', cor: '#a78bfa' },
  point:    { label: 'Point',    cor: '#60a5fa' },
  p:        { label: 'Point',    cor: '#60a5fa' },
  consumer: { label: 'Consumer', cor: '#f97316' },
  con:      { label: 'Consumer', cor: '#f97316' },
  cons:     { label: 'Consumer', cor: '#f97316' },
  cc:       { label: 'Cartão',   cor: '#fb7185' },
  cartao:   { label: 'Cartão',   cor: '#fb7185' },
  cartão:   { label: 'Cartão',   cor: '#fb7185' },
}

const ERROS_AUTH = {
  'Invalid login':           'E-mail ou senha incorretos.',
  'User already registered': 'E-mail já cadastrado.',
  'Password should be':      'Senha deve ter mínimo 6 caracteres.',
}

// ─── TEMAS ───────────────────────────────────────────────────────────────────

const TEMA_KEY = 'anotadnr_tema'

const TEMAS = {
  neon:    { nome: 'Verde',         emoji: '', accent: '#00ffcc', accentDim: '#00ffcc55', accentGlow: '#00ffcc18', accentHover: '#00d9b0', accentText: '#0c0c10' },
  roxo:    { nome: 'Roxo',          emoji: '', accent: '#a78bfa', accentDim: '#a78bfa55', accentGlow: '#a78bfa18', accentHover: '#8b5cf6', accentText: '#0c0c10' },
  laranja: { nome: 'Vermelho Fogo', emoji: '', accent: '#c00000', accentDim: '#f9731655', accentGlow: '#f9731618', accentHover: '#ea6c0a', accentText: '#0c0c10' },
  azul:    { nome: 'Azul',          emoji: '', accent: '#3892f8', accentDim: '#38bdf855', accentGlow: '#38bdf818', accentHover: '#0ea5e9', accentText: '#0c0c10' },
  rosa:    { nome: 'Rosa',          emoji: '', accent: '#f472b6', accentDim: '#f472b655', accentGlow: '#f472b618', accentHover: '#ec4899', accentText: '#0c0c10' },
  amarelo: { nome: 'Amarelo',       emoji: '', accent: '#fbbf24', accentDim: '#fbbf2455', accentGlow: '#fbbf2418', accentHover: '#f59e0b', accentText: '#0c0c10' },
}

function aplicarTema(chave) {
  const tema = TEMAS[chave] || TEMAS.neon
  const s = document.documentElement.style
  s.setProperty('--accent',       tema.accent)
  s.setProperty('--accent-dim',   tema.accentDim)
  s.setProperty('--accent-glow',  tema.accentGlow)
  s.setProperty('--accent-hover', tema.accentHover)
  s.setProperty('--accent-text',  tema.accentText)

  let style = $('temaStyle')
  if (!style) {
    style = document.createElement('style')
    style.id = 'temaStyle'
    document.head.appendChild(style)
  }

  style.textContent = `
  .ex-parte { color: ${tema.accent}8f !important; }
  .ex-parte:hover { color: ${tema.accent}dd !important; background: ${tema.accentGlow} !important; }
  .ex-parte::after { border-color: ${tema.accentDim} !important; }
  #exemplo text { color: ${tema.accent}8f !important; }
  h1 {
    background-image: linear-gradient(135deg, ${tema.accent} 0%, #ffffff 40%, ${tema.accent} 100%) !important;
    background-size: 200% auto !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    background-clip: text !important;
    animation: shimmer 4s linear infinite, glowPulse 3s ease-in-out infinite !important;
  }
  h1::before {
    background-image: linear-gradient(135deg, ${tema.accent}, ${tema.accentHover}) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    background-clip: text !important;
  }
  h1::after {
    background: linear-gradient(90deg, transparent, ${tema.accent}, transparent) !important;
    box-shadow: 0 0 16px ${tema.accent}, 0 0 32px ${tema.accentDim} !important;
  }
  #btnAdicionar, #obBtnProx, #obBtnFim, #popupAnotacaoSalvar, #popupEditarSalvar {
    background: ${tema.accent} !important; color: ${tema.accentText} !important;
  }
  #btnAdicionar:hover, #obBtnProx:hover, #obBtnFim:hover,
  #popupAnotacaoSalvar:hover, #popupEditarSalvar:hover { background: ${tema.accentHover} !important; }
  .btn-pagar { background: ${tema.accent} !important; color: ${tema.accentText} !important; }
  .btn-pagar:hover { background: ${tema.accentHover} !important; }
  .btn-anotacao.tem-anotacao { color: ${tema.accent} !important; filter: drop-shadow(0 0 4px ${tema.accent}) !important; }
  th { color: ${tema.accent} !important; }
  .login-titulo { color: ${tema.accent} !important; }
  #btnLogin, #btnCadastrar { background: ${tema.accent} !important; color: ${tema.accentText} !important; }
  #btnLogin:hover, #btnCadastrar:hover { background: ${tema.accentHover} !important; }
  .login-box { border-color: ${tema.accentDim} !important; box-shadow: 0 0 40px ${tema.accentGlow} !important; }
  .login-box input:focus { border-color: ${tema.accentDim} !important; }
  #resumoGeral { border-color: ${tema.accentDim} !important; }
  #resumoGeral .cor-quitado { color: ${tema.accent} !important; }
  .semana-header { color: ${tema.accent} !important; }
  #onboardingTitulo { color: ${tema.accent} !important; }
  .ob-dot.ativo { background: ${tema.accent} !important; }
  .ob-dot.feito { background: ${tema.accentDim} !important; }
  .onboarding-destaque { outline-color: ${tema.accent} !important; }
  .filtro-btn.ativo { background: ${tema.accentDim} !important; border-color: ${tema.accent} !important; color: ${tema.accent} !important; }
  @keyframes onboardingPulse {
    0%, 100% { outline-color: ${tema.accent}; }
    50%       { outline-color: ${tema.accentDim}; }
  }
  `
  localStorage.setItem(TEMA_KEY, chave)
}

function carregarTema() {
  const salvo = localStorage.getItem(TEMA_KEY)
  aplicarTema(salvo || 'neon')
}

function mostrarSeletorTema() {
  if (localStorage.getItem(TEMA_KEY)) return
  const overlay = document.createElement('div')
  overlay.id = 'temaOverlay'
  overlay.innerHTML = `
    <div id="temaBox">
      <div id="temaTitulo">🎨 Escolha seu tema</div>
      <div id="temaSubtitulo">Você pode mudar depois nas configurações</div>
      <div id="temaGrid">
        ${Object.entries(TEMAS).map(([chave, t]) => `
          <button class="tema-opcao" data-tema="${chave}" style="--cor:${t.accent}">
            <span class="tema-bolinha" style="background:${t.accent};box-shadow:0 0 12px ${t.accent}88"></span>
            <span class="tema-nome">${t.emoji} ${t.nome}</span>
          </button>
        `).join('')}
        <button class="tema-opcao" id="temaCustomBtn" style="--cor:#ffffff; grid-column: span 2;">
          <span class="tema-bolinha" id="temaCustomBolinha"
            style="background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red);box-shadow:none;"></span>
          <span class="tema-nome">🎨 Cor personalizada</span>
          <input type="color" id="temaColorPicker"
            style="position:absolute;opacity:0;width:0;height:0;pointer-events:none;">
        </button>
      </div>
    </div>
  `
  document.body.appendChild(overlay)

  overlay.querySelectorAll('.tema-opcao[data-tema]').forEach(btn => {
    btn.addEventListener('click', () => {
      aplicarTema(btn.dataset.tema)
      overlay.style.animation = 'fadeOutBg 0.3s ease forwards'
      setTimeout(() => overlay.remove(), 300)
    })
  })

  const customBtn = overlay.querySelector('#temaCustomBtn')
  const picker    = overlay.querySelector('#temaColorPicker')
  const bolinha   = overlay.querySelector('#temaCustomBolinha')

  customBtn.style.position = 'relative'
  customBtn.addEventListener('click', () => picker.click())

  picker.addEventListener('input', () => {
    bolinha.style.background = picker.value
    bolinha.style.boxShadow  = `0 0 12px ${picker.value}88`
    customBtn.style.setProperty('--cor', picker.value)
  })

  picker.addEventListener('change', () => {
    aplicarCorCustom(picker.value)
    overlay.style.animation = 'fadeOutBg 0.3s ease forwards'
    setTimeout(() => overlay.remove(), 300)
  })
}

carregarTema()

function aplicarCorCustom(hex) {
  const r = parseInt(hex.slice(1,3), 16)
  const g = parseInt(hex.slice(3,5), 16)
  const b = parseInt(hex.slice(5,7), 16)
  const escurecer = (c, pct) => Math.max(0, Math.floor(c * (1 - pct)))
  const rH = escurecer(r, 0.12), gH = escurecer(g, 0.12), bH = escurecer(b, 0.12)
  const hover = `#${rH.toString(16).padStart(2,'0')}${gH.toString(16).padStart(2,'0')}${bH.toString(16).padStart(2,'0')}`

  const t = { accent: hex, accentDim: hex+'55', accentGlow: hex+'18', accentHover: hover, accentText: '#0c0c10' }

  const s = document.documentElement.style
  s.setProperty('--accent',       t.accent)
  s.setProperty('--accent-dim',   t.accentDim)
  s.setProperty('--accent-glow',  t.accentGlow)
  s.setProperty('--accent-hover', t.accentHover)
  s.setProperty('--accent-text',  t.accentText)

  let style = document.getElementById('temaStyle')
  if (!style) { style = document.createElement('style'); style.id = 'temaStyle'; document.head.appendChild(style) }

  style.textContent = `
    .ex-parte { color: ${t.accent}8f !important; }
    .ex-parte:hover { color: ${t.accent}dd !important; background: ${t.accentGlow} !important; }
    h1 { background-image: linear-gradient(135deg, ${t.accent} 0%, ${t.accentHover} 35%, #ffffff 55%, ${t.accent} 100%) !important; background-size: 200% auto !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
    h1::after { background: linear-gradient(90deg, transparent, ${t.accent}, transparent) !important; box-shadow: 0 0 16px ${t.accent}, 0 0 32px ${t.accentDim} !important; }
    #btnAdicionar, #obBtnProx, #obBtnFim, #popupAnotacaoSalvar, #popupEditarSalvar { background: ${t.accent} !important; color: ${t.accentText} !important; }
    #btnAdicionar:hover, #obBtnProx:hover, #obBtnFim:hover, #popupAnotacaoSalvar:hover, #popupEditarSalvar:hover { background: ${t.accentHover} !important; }
    .btn-pagar { background: ${t.accent} !important; color: ${t.accentText} !important; }
    .btn-pagar:hover { background: ${t.accentHover} !important; }
    .btn-anotacao.tem-anotacao { color: ${t.accent} !important; filter: drop-shadow(0 0 4px ${t.accent}) !important; }
    th { color: ${t.accent} !important; }
    .login-titulo { color: ${t.accent} !important; }
    #btnLogin, #btnCadastrar { background: ${t.accent} !important; color: ${t.accentText} !important; }
    #btnLogin:hover, #btnCadastrar:hover { background: ${t.accentHover} !important; }
    .login-box { border-color: ${t.accentDim} !important; }
    #resumoGeral { border-color: ${t.accentDim} !important; }
    #resumoGeral .cor-quitado { color: ${t.accent} !important; }
    #onboardingTitulo { color: ${t.accent} !important; }
    .ob-dot.ativo { background: ${t.accent} !important; }
    .ob-dot.feito { background: ${t.accentDim} !important; }
    .filtro-btn.ativo { background: ${t.accentDim} !important; border-color: ${t.accent} !important; color: ${t.accent} !important; }
  `

  localStorage.setItem(TEMA_KEY, `custom:${hex}`)
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────

const ONBOARDING_KEY = 'anotadnr_onboarding_ok'

const STEPS = [
  { titulo: ' Bem-vindo ao AnotaDNR!',    texto: 'Este é seu sistema de gestão de acordos. Vamos te mostrar como usar em poucos passos.', destaque: null },
  { titulo: ' Adicionando um acordo',      texto: 'Digite no campo principal no formato:\n\nVALOR  PAGAMENTO  VENCIMENTO  ID\n\nExemplo: 250,00 pix 15/04 123456\n\nDepois pressione Enter ou clique em ADICIONAR.', destaque: '#barraAcoes' },
  { titulo: ' Buscando um cliente',        texto: 'Digite o ID do cliente no campo e clique na lupa 🔍 — o sistema vai rolar até o acordo e destacá-lo em verde.', destaque: '#btnBuscar' },
  { titulo: ' Anotações e edição',         texto: 'Clique no botão 📝 em qualquer acordo para adicionar anotações ou editar os dados do acordo.', destaque: null },
  { titulo: ' Registrando pagamento',      texto: 'Clique em "Pagar" para registrar um pagamento parcial ou total.\n\nDica: digite "A" para quitar o valor completo de uma vez.', destaque: null },
  { titulo: ' Painel de vencimentos',      texto: 'O painel no topo mostra todos os acordos que vencem nos próximos 7 dias — fique de olho!', destaque: '#painelSemana' },
  { titulo: ' Tudo pronto!',               texto: 'Agora você já sabe o básico. Qualquer dúvida, explore o sistema!\n\nBom trabalho! 🚀', destaque: null },
]

function iniciarOnboarding() {
  if (localStorage.getItem(ONBOARDING_KEY)) return
  mostrarStep(0)
}

function mostrarStep(index) {
  let overlay = $('onboardingOverlay')
  if (!overlay) {
    overlay = document.createElement('div')
    overlay.id = 'onboardingOverlay'
    document.body.appendChild(overlay)
  }

  const step     = STEPS[index]
  const total    = STEPS.length
  const ultimo   = index === total - 1
  const primeiro = index === 0

  document.querySelectorAll('.onboarding-destaque').forEach(el => el.classList.remove('onboarding-destaque'))
  if (step.destaque) {
    const el = document.querySelector(step.destaque)
    if (el) el.classList.add('onboarding-destaque')
  }

  overlay.innerHTML = `
    <div id="onboardingBox">
      <div id="onboardingProgress">
        ${STEPS.map((_, i) => `<div class="ob-dot ${i === index ? 'ativo' : i < index ? 'feito' : ''}"></div>`).join('')}
      </div>
      <div id="onboardingTitulo">${step.titulo}</div>
      <div id="onboardingTexto">${step.texto.replace(/\n/g, '<br>')}</div>
      <div id="onboardingBtns">
        ${!primeiro ? `<button id="obBtnVoltar">← Voltar</button>` : '<span></span>'}
        <span id="obContador">${index + 1} / ${total}</span>
        ${ultimo ? `<button id="obBtnFim">Começar! 🚀</button>` : `<button id="obBtnProx">Próximo →</button>`}
      </div>
    </div>
  `
  overlay.style.display = 'flex'
  if (!primeiro) $('obBtnVoltar').onclick = () => mostrarStep(index - 1)
  if (ultimo)    $('obBtnFim').onclick    = finalizarOnboarding
  else           $('obBtnProx').onclick   = () => mostrarStep(index + 1)
}

function finalizarOnboarding() {
  localStorage.setItem(ONBOARDING_KEY, '1')
  const overlay = $('onboardingOverlay')
  if (overlay) overlay.style.display = 'none'
  document.querySelectorAll('.onboarding-destaque').forEach(el => el.classList.remove('onboarding-destaque'))
  setTimeout(() => mostrarSeletorTema(), 300)
}

// ─── UTILITÁRIOS ─────────────────────────────────────────────────────────────

function traduzirErro(msg) {
  return Object.entries(ERROS_AUTH).find(([k]) => msg.includes(k))?.[1] ?? msg
}

function getDiaHoje() {
  const agora = new Date()
  return `${String(agora.getDate()).padStart(2,'0')}/${String(agora.getMonth()+1).padStart(2,'0')}`
}

function parseValor(str) {
  const nPontos   = (str.match(/\./g) || []).length
  const nVirgulas = (str.match(/,/g)  || []).length
  if (nVirgulas === 1) return parseFloat(str.replace(/\./g,'').replace(',','.'))
  if (nPontos >= 2) {
    const ultimo = str.lastIndexOf('.')
    return parseFloat(str.slice(0,ultimo).replace(/[.,]/g,'') + '.' + str.slice(ultimo+1))
  }
  if (nPontos === 1) {
    const partes = str.split('.')
    return partes[1].length <= 2 ? parseFloat(str) : parseFloat(str.replace('.',''))
  }
  return parseFloat(str.replace(/[.,]/g,''))
}

function formatBRL(value) {
  return value.toFixed(2).replace('.', ',')
}

function getStatus(dataFinal, acordoPago) {
  if (acordoPago) return { label: 'Pago', cor: '#3cff00' }
  const partes = dataFinal.split('/')
  if (partes.length < 2) return null
  const agora      = new Date()
  const hoje       = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
  const vencimento = new Date(agora.getFullYear(), parseInt(partes[1]) - 1, parseInt(partes[0]))
  if (vencimento < hoje) return { label: 'Quebra', cor: '#ff4d4d' }
  return { label: 'Em curso', cor: '#ffd700' }
}

function detectarTipo(linha) {
  const semPagamento = linha.replace(/\b(pix|boleto|deb(?:ito)?|débito|debito em conta|parc(?:ial|elado)?)\b/gi, '')
  const match = semPagamento.match(/\b(merchant|consumer|cartao|cartão|point|mer|merc|cons|con|cc)\b|\bp\b/i)
  return match ? (TIPOS_CLIENTE[match[0].toLowerCase()] ?? null) : null
}

function sortDias(dias) {
  return dias.sort((a, b) => {
    const toDate = str => { const [d, m] = str.split('/').map(Number); return new Date(new Date().getFullYear(), m-1, d) }
    return toDate(b) - toDate(a)
  })
}

// ─── FILTRO STATUS ───────────────────────────────────────────────────────────

function criarFiltroStatus() {
  if ($('filtroStatus')) return
  const filtros = [
    { key: 'todos',  label: 'Todos'       },
    { key: 'curso',  label: 'Em curso' },
    { key: 'quebra', label: 'Quebra'   },
    { key: 'pago',   label: 'Pagos'    },
  ]
  const wrap = document.createElement('div')
  wrap.id = 'filtroStatus'
  filtros.forEach(f => {
    const btn = document.createElement('button')
    btn.classList.add('filtro-btn')
    btn.dataset.filtro = f.key
    btn.innerText = f.label
    if (f.key === filtroAtivo) btn.classList.add('ativo')
    btn.addEventListener('click', () => {
      filtroAtivo = f.key
      document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'))
      btn.classList.add('ativo')
      renderizar()
    })
    wrap.appendChild(btn)
  })
  // insere logo após o painel semana (que é inserido antes de tabelaNotas)
  const ref = dom.tabelaNotas()
  ref.parentNode.insertBefore(wrap, ref)
}

function registroPassaFiltro(reg) {
  if (filtroAtivo === 'todos') return true
  const pago = (reg.valorPago || 0) >= reg.valor
  if (filtroAtivo === 'pago') return pago
  if (filtroAtivo === 'hoje') {
    if (pago) return false
    const agora = new Date(); agora.setHours(0,0,0,0)
    const [d, m] = reg.dataFinal.split('/').map(Number)
    const venc = new Date(agora.getFullYear(), m-1, d)
    return venc.getTime() === agora.getTime()
  }
  const status = getStatus(reg.dataFinal, pago)
  if (!status) return false
  if (filtroAtivo === 'curso')  return status.label === 'Em curso'
  if (filtroAtivo === 'quebra') return status.label === 'Quebra'
  return true
}

// ─── POPUP DE ANOTAÇÃO / EDITAR ──────────────────────────────────────────────

function criarPopupAnotacao() {
  if ($('popupAnotacao')) return
  const popup = document.createElement('div')
  popup.id = 'popupAnotacao'
  popup.innerHTML = `
    <div id="popupAnotacaoBox">
      <div id="popupAnotacaoTabs">
        <button class="popup-tab ativo" data-tab="anotacao">📝 Anotação</button>
        <button class="popup-tab" data-tab="editar">✏️ Editar</button>
      </div>
      <div id="popupTabAnotacao">
        <textarea id="popupAnotacaoTexto" placeholder="Escreva aqui..."></textarea>
        <div id="popupAnotacaoBtns">
          <button id="popupAnotacaoSalvar">Salvar</button>
          <button id="popupAnotacaoCancelar">Cancelar</button>
        </div>
      </div>
      <div id="popupTabEditar" style="display:none;">
        <div class="editar-grid">
          <label>Valor</label>       <input id="editValor"      type="text" placeholder="ex: 250,00">
          <label>Data acordo</label> <input id="editDataAcordo" type="text" placeholder="ex: 01/03">
          <label>Vencimento</label>  <input id="editDataFinal"  type="text" placeholder="ex: 15/04">
          <label>Parcelas</label>    <input id="editParcelas"   type="text" placeholder="ex: 3x">
          <label>Pagamento</label>   <input id="editPagamento"  type="text" placeholder="pix, boleto, deb...">
          <label>ID</label>          <input id="editId"         type="text" placeholder="ID do cliente">
        </div>
        <div id="popupEditarBtns">
          <button id="popupEditarSalvar">Salvar</button>
          <button id="popupEditarCancelar">Cancelar</button>
        </div>
      </div>
    </div>
  `
  document.body.appendChild(popup)
  popup.addEventListener('click', e => { if (e.target === popup) fecharPopup() })
  $('popupAnotacaoCancelar').addEventListener('click', fecharPopup)
  $('popupEditarCancelar').addEventListener('click', fecharPopup)
  popup.querySelectorAll('.popup-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      popup.querySelectorAll('.popup-tab').forEach(t => t.classList.remove('ativo'))
      tab.classList.add('ativo')
      const which = tab.dataset.tab
      $('popupTabAnotacao').style.display = which === 'anotacao' ? 'flex' : 'none'
      $('popupTabEditar').style.display   = which === 'editar'   ? 'flex' : 'none'
    })
  })
}

function fecharPopup() {
  const popup = $('popupAnotacao')
  const box   = $('popupAnotacaoBox')
  if (!popup) return
  box.style.animation   = 'popupSair 0.2s cubic-bezier(0.4,0,1,1) forwards'
  popup.style.animation = 'fadeOutBg 0.2s ease forwards'
  setTimeout(() => {
    popup.style.display = 'none'
    box.style.animation   = ''
    popup.style.animation = ''
    $('popupTabAnotacao').style.display = 'flex'
    $('popupTabEditar').style.display   = 'none'
    popup.querySelectorAll('.popup-tab').forEach((t,i) => t.classList.toggle('ativo', i===0))
  }, 200)
}

function abrirPopupAnotacao(reg, callbackAnotacao, callbackEditar) {
  criarPopupAnotacao()
  const textarea  = $('popupAnotacaoTexto')
  const btnSalvar = $('popupAnotacaoSalvar')

  textarea.value            = reg.anotacao    || ''
  $('editValor').value      = reg.valor ? formatBRL(reg.valor) : ''
  $('editDataAcordo').value = reg.dataAcordo || ''
  $('editDataFinal').value  = reg.dataFinal  || ''
  $('editParcelas').value   = reg.parcelas   || ''
  $('editPagamento').value  = reg.pagamento  || ''
  $('editId').value         = reg.id         || ''

  $('popupAnotacao').style.display = 'flex'
  setTimeout(() => textarea.focus(), 50)

  const novoBtnSalvar = btnSalvar.cloneNode(true)
  btnSalvar.parentNode.replaceChild(novoBtnSalvar, btnSalvar)
  const salvarAnotacao = () => { callbackAnotacao(textarea.value.trim()); fecharPopup() }
  novoBtnSalvar.addEventListener('click', salvarAnotacao)
  textarea.onkeydown = e => {
    if (e.key === 'Enter' && e.ctrlKey) salvarAnotacao()
    if (e.key === 'Escape') fecharPopup()
  }

  const btnEditarSalvar = $('popupEditarSalvar')
  const novoBtnEditar   = btnEditarSalvar.cloneNode(true)
  btnEditarSalvar.parentNode.replaceChild(novoBtnEditar, btnEditarSalvar)
  novoBtnEditar.addEventListener('click', () => {
    const valorNum = parseValor($('editValor').value.trim())
    if (isNaN(valorNum) || valorNum <= 0) { alert('Valor inválido'); return }
    callbackEditar({
      valor:      valorNum,
      dataAcordo: $('editDataAcordo').value.trim(),
      dataFinal:  $('editDataFinal').value.trim(),
      parcelas:   $('editParcelas').value.trim(),
      pagamento:  $('editPagamento').value.trim(),
      id:         $('editId').value.trim(),
    })
    fecharPopup()
  })
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    currentUser = session.user
    mostrarApp()
    await carregarDados()
    renderizar()
  } else {
    mostrarLogin()
  }
}

function mostrarLogin() {
  dom.telaLogin().style.display = 'flex'
  dom.topBar().style.display    = 'none'
  dom.conteudo().style.display  = 'none'
}

function mostrarApp() {
  dom.telaLogin().style.display = 'none'
  dom.topBar().style.display    = 'flex'
  dom.conteudo().style.display  = 'contents'
  dom.userEmail().innerText     = currentUser.email
  setTimeout(() => dom.inputPrincipal().focus(), 100)
  setTimeout(() => iniciarOnboarding(), 800)
}

$('btnLogin').addEventListener('click', async () => {
  const email = $('loginEmail').value.trim()
  const senha = $('loginSenha').value
  const erro  = $('loginErro')
  erro.innerText = ''
  if (!email || !senha) { erro.innerText = 'Preencha e-mail e senha.'; return }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) { erro.innerText = traduzirErro(error.message); return }
  currentUser = data.user
  mostrarApp()
  await carregarDados()
  renderizar()
})

$('btnCadastrar').addEventListener('click', async () => {
  const email  = $('cadEmail').value.trim()
  const senha  = $('cadSenha').value
  const senha2 = $('cadSenha2').value
  const erro   = $('cadErro')
  const btn    = $('btnCadastrar')
  erro.innerText = ''
  if (!email || !senha)  { erro.innerText = 'Preencha todos os campos.'; return }
  if (senha !== senha2)  { erro.innerText = 'As senhas não coincidem.'; return }
  if (senha.length < 6)  { erro.innerText = 'Senha deve ter mínimo 6 caracteres.'; return }

  btn.disabled  = true
  btn.innerText = 'Criando conta...'

  const { error } = await supabase.auth.signUp({ email, password: senha })

  btn.disabled  = false
  btn.innerText = 'Cadastrar'

  if (error) { erro.innerText = traduzirErro(error.message); return }

  dom.cadastroForm().innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:10px 0;text-align:center;">
      <div style="font-size:2.4em;">✅</div>
      <div style="color:var(--accent);font-weight:700;font-size:1.05em;">Conta criada!</div>
      <div style="color:#9898b0;font-size:0.85em;line-height:1.6;">
        Enviamos um e-mail de confirmação para<br>
        <strong style="color:#e2e2ee;">${email}</strong><br><br>
        Confirme seu e-mail antes de entrar.
      </div>
      <button id="btnVoltarLogin" style="margin-top:4px;">Ir para o login</button>
    </div>
  `
  $('btnVoltarLogin').addEventListener('click', () => {
    dom.cadastroForm().innerHTML = `
      <input type="email" id="cadEmail" placeholder="E-mail" autocomplete="email">
      <input type="password" id="cadSenha" placeholder="Senha (mín. 6 caracteres)" autocomplete="new-password">
      <input type="password" id="cadSenha2" placeholder="Confirmar senha" autocomplete="new-password">
      <button id="btnCadastrar">Cadastrar</button>
      <button id="btnIrLogin" class="btn-secundario">Já tenho conta</button>
      <p id="cadErro" class="erro-msg"></p>
    `
    $('btnIrLogin').addEventListener('click', () => {
      dom.cadastroForm().style.display = 'none'
      dom.loginForm().style.display    = 'flex'
    })
    dom.cadastroForm().style.display = 'none'
    dom.loginForm().style.display    = 'flex'
  })
})

$('btnSair').addEventListener('click', async () => {
  await supabase.auth.signOut()
  currentUser = null
  dados = {}
  mostrarLogin()
})

$('btnIrCadastro').addEventListener('click', () => {
  dom.loginForm().style.display    = 'none'
  dom.cadastroForm().style.display = 'flex'
})

$('btnIrLogin').addEventListener('click', () => {
  dom.cadastroForm().style.display = 'none'
  dom.loginForm().style.display    = 'flex'
})

document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return
  if (dom.telaLogin().style.display === 'none') return
  if (dom.loginForm().style.display !== 'none')         $('btnLogin').click()
  else if (dom.cadastroForm().style.display !== 'none') $('btnCadastrar').click()
})

// ─── SUPABASE — CRUD ─────────────────────────────────────────────────────────

async function carregarDados() {
  const { data, error } = await supabase.from('acordos').select('*').order('created_at', { ascending: true })
  if (error) { console.error('Erro ao carregar:', error); return }
  dados = data.reduce((acc, r) => {
    if (!acc[r.dia]) acc[r.dia] = []
    acc[r.dia].push(mapearRegistro(r))
    return acc
  }, {})
}

function mapearRegistro(r) {
  return {
    _dbId:      r.id,
    dataAcordo: r.data_acordo,
    valor:      parseFloat(r.valor),
    valorPago:  parseFloat(r.valor_pago) || 0,
    parcelas:   r.parcelas || '',
    dataFinal:  r.data_final,
    pagamento:  r.pagamento,
    id:         r.acordo_id,
    tipo:       r.tipo_label ? { label: r.tipo_label, cor: r.tipo_cor } : null,
    anotacao:   r.anotacao || '',
  }
}

async function salvarNovoAcordo(dia, reg) {
  const { data, error } = await supabase.from('acordos').insert({
    user_id:     currentUser.id,
    user_email:  currentUser.email,
    dia,
    data_acordo: reg.dataAcordo,
    valor:       reg.valor,
    valor_pago:  0,
    parcelas:    reg.parcelas,
    data_final:  reg.dataFinal,
    pagamento:   reg.pagamento,
    acordo_id:   reg.id,
    tipo_label:  reg.tipo?.label ?? null,
    tipo_cor:    reg.tipo?.cor   ?? null,
    anotacao:    '',
  }).select().single()
  if (error) { console.error('Erro ao salvar:', error); return }
  reg._dbId = data.id
}

async function atualizarCampo(reg, campos) {
  const { error } = await supabase.from('acordos').update(campos).eq('id', reg._dbId)
  if (error) console.error('Erro ao atualizar:', error)
}

const atualizarValorPago = reg => atualizarCampo(reg, { valor_pago: reg.valorPago })
const atualizarAnotacao  = reg => atualizarCampo(reg, { anotacao: reg.anotacao })

async function excluirAcordo(reg) {
  const { error } = await supabase.from('acordos').delete().eq('id', reg._dbId)
  if (error) console.error('Erro ao excluir:', error)
}

// ─── RENDERIZAR ──────────────────────────────────────────────────────────────

function renderizar() {
  mapaLinhas = {}
  const container = dom.tabelaNotas()
  container.innerHTML = ''
  const todosRegistros = Object.values(dados).flat()
  renderizarResumo(todosRegistros)

  const mesAtual = String(new Date().getMonth()+1).padStart(2,'0')
  const diasAtual = [], diasAnteriores = []
  sortDias(Object.keys(dados)).forEach(dia => {
    const mes = dia.split('/')[1]
    ;(mes === mesAtual ? diasAtual : diasAnteriores).push(dia)
  })

  atualizarPainelSemana()
  criarFiltroStatus()

  const filtrarDia = regs => regs.filter(registroPassaFiltro)

  const diasAtualFiltrados = diasAtual.filter(dia => filtrarDia(dados[dia]).length > 0)
  const diasAntFiltrados   = diasAnteriores.filter(dia => filtrarDia(dados[dia]).length > 0)

  diasAtualFiltrados.forEach(dia => container.appendChild(criarBlocoDia(dia, filtrarDia(dados[dia]))))
  if (diasAntFiltrados.length > 0) container.appendChild(criarBlocoMesAnterior(diasAntFiltrados, filtrarDia))
}

function criarBlocoMesAnterior(dias, filtrarFn = r => r) {
  const fragment = document.createDocumentFragment()

  const porMes = {}
  dias.forEach(dia => {
    const mes = dia.split('/')[1]
    if (!porMes[mes]) porMes[mes] = []
    porMes[mes].push(dia)
  })

  const MESES = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

  Object.keys(porMes).sort((a,b) => b - a).forEach(mes => {
    const diasDoMes    = porMes[mes]
    const regs         = diasDoMes.flatMap(d => filtrarFn(dados[d]))
    const totalAcordos = regs.length
    const totalValor   = regs.reduce((s,r) => s + r.valor, 0)
    const totalPago    = regs.reduce((s,r) => s + r.valorPago, 0)
    const nomeMes      = MESES[parseInt(mes)] || mes

    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'width:670px;margin:0 auto 15px auto;border-radius:12px;border:1px solid #ffd70033;overflow:hidden;'

    const chevronId = `chevron-mes-${mes}`
    const header = document.createElement('div')
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:#1a1710;padding:10px 20px;cursor:pointer;font-size:0.9em;font-weight:600;color:#ffd700;'
    header.innerHTML = `<span>🗂️ ${nomeMes}</span><span style="display:flex;gap:16px;align-items:center;font-size:0.88em">${totalAcordos} acordos · R$ ${formatBRL(totalValor)} / ${formatBRL(totalPago)}<span id="${chevronId}">▼</span></span>`

    const corpo = document.createElement('div')
    corpo.style.cssText = 'display:grid;grid-template-rows:0fr;transition:grid-template-rows 0.3s ease,opacity 0.3s ease;opacity:0;background:#13120e;'
    const inner = document.createElement('div')
    inner.style.cssText = 'overflow:hidden;padding:0 8px;'
    diasDoMes.forEach(dia => inner.appendChild(criarBlocoDia(dia, filtrarFn(dados[dia]))))
    corpo.appendChild(inner)

    let aberto = false
    header.onclick = () => {
      aberto = !aberto
      corpo.style.gridTemplateRows = aberto ? '1fr' : '0fr'
      corpo.style.opacity = aberto ? '1' : '0'
      document.getElementById(chevronId).textContent = aberto ? '▲' : '▼'
    }

    wrapper.append(header, corpo)
    fragment.appendChild(wrapper)
  })

  return fragment
}

function renderizarResumo(todos) {
  const resumo = dom.resumoGeral()
  if (!resumo) return

  const mesAtual = String(new Date().getMonth() + 1).padStart(2, '0')
  const doMes = todos.filter(r => {
    const partes = (r.dataAcordo || '').split('/')
    return partes.length >= 2 && partes[1] === mesAtual
  })

  const totalAcordos         = doMes.length
  const totalTotalmentePagos = doMes.filter(r => r.valorPago >= r.valor && r.valor > 0).length
  const totalComPagamento    = doMes.filter(r => r.valorPago > 0 && r.valorPago < r.valor).length
  const totalValor           = doMes.reduce((s, r) => s + r.valor, 0)
  const totalPago            = doMes.reduce((s, r) => s + r.valorPago, 0)

  resumo.innerHTML = `
    <span>
      📋
      <strong class="cor-total"     data-tooltip="Acordos este mês">${totalAcordos}</strong> /
      <strong class="cor-pagamento" data-tooltip="Com pagamento parcial">${totalComPagamento}</strong> /
      <strong class="cor-quitado"   data-tooltip="Totalmente quitados">${totalTotalmentePagos}</strong>
    </span>
    <div id="avisoInput" style="font-size:0.78em;min-height:18px;text-align:center;"></div>
    <span>
      💰
      <strong class="cor-total"   data-tooltip="Negociado este mês">R$ ${formatBRL(totalValor)}</strong> /
      <strong class="cor-quitado" data-tooltip="Recebido este mês">R$ ${formatBRL(totalPago)}</strong>
    </span>
  `
}

function criarBlocoDia(dia, registros) {
  const totalDia     = registros.reduce((s, r) => s + r.valor, 0)
  const totalPagoDia = registros.reduce((s, r) => s + r.valorPago, 0)
  const bloco  = document.createElement('div')
  bloco.classList.add('dia-bloco')
  const header = document.createElement('div')
  header.classList.add('dia-header')
  if (diasAbertos.has(dia)) header.classList.add('aberto')
  header.innerHTML = `<span>${dia}</span><span>R$ ${formatBRL(totalDia)} / ${formatBRL(totalPagoDia)} | ${registros.length} acordos</span>`
  const tabelaWrapper = document.createElement('div')
  tabelaWrapper.classList.add('dia-tabela')
  if (diasAbertos.has(dia)) tabelaWrapper.classList.add('aberto')
  tabelaWrapper.appendChild(criarTabela(dia, registros))
  header.onclick = () => {
    const aberto = tabelaWrapper.classList.toggle('aberto')
    header.classList.toggle('aberto', aberto)
    aberto ? diasAbertos.add(dia) : diasAbertos.delete(dia)
  }
  bloco.append(header, tabelaWrapper)
  return bloco
}

function criarTabela(dia, registros) {
  const tabela = document.createElement('table')
  tabela.innerHTML = `<thead><tr><th>Dia</th><th>Valor</th><th>Parcela</th><th>Vencimento</th><th>Pagamento</th><th>ID</th><th>Ações</th></tr></thead><tbody></tbody>`
  const tbody = tabela.querySelector('tbody')
  registros.forEach((reg, index) => tbody.appendChild(criarLinha(dia, registros, reg, index)))
  return tabela
}

function criarLinha(dia, registros, reg, index) {
  const row       = document.createElement('tr')
  const valorPago = reg.valorPago || 0
  const pago      = valorPago >= reg.valor
  if (pago) row.classList.add('acordo-pago')
  row.insertCell().innerText = reg.dataAcordo || '-'
  row.insertCell().innerHTML = montarHtmlValor(reg, valorPago, pago)
  row.insertCell().innerText = reg.parcelas
  const vencCell = row.insertCell()
  const status = getStatus(reg.dataFinal, pago)
  vencCell.innerHTML = reg.dataFinal + (status ? `<br><span class="badge-tipo" style="color:${status.cor};">${status.label}</span>` : '')
  row.insertCell().innerText = reg.pagamento

  // ── ID com copiar ao clicar ──
  const idCell = row.insertCell()
  idCell.innerText = reg.id
  idCell.style.cssText = 'cursor:pointer;user-select:none;'
  idCell.title = 'Clique para copiar'
  idCell.addEventListener('click', e => {
    e.stopPropagation()
    navigator.clipboard.writeText(reg.id).then(() => {
      const original = idCell.innerText
      idCell.innerText = '✓'
      idCell.style.color = 'var(--green)'
      setTimeout(() => { idCell.innerText = original; idCell.style.color = '' }, 1000)
    })
  })

  mapaLinhas[reg.id] = row
  const acoesCell = row.insertCell()
  acoesCell.append(criarBtnAnotacao(reg), criarBtnPagar(reg), criarBtnExcluir(dia, registros, reg, index, row))
  return row
}

function montarHtmlValor(reg, valorPago, pago) {
  let html = pago
    ? `<span style="color:#00ffcc;">R$ ${formatBRL(reg.valor)}</span>`
    : valorPago > 0
      ? `<span style="color:#ff4d4d;">R$ ${formatBRL(reg.valor)}</span><br><span style="color:#00ffcc;">${formatBRL(valorPago)}</span>`
      : `<span style="color:#ff4d4d;">R$ ${formatBRL(reg.valor)}</span>`
  if (reg.tipo) html += `<br><span class="badge-tipo" style="color:${reg.tipo.cor};">${reg.tipo.label}</span>`
  return html
}

// ─── BOTÕES DE AÇÃO ──────────────────────────────────────────────────────────

function criarBtnAnotacao(reg) {
  const btn = document.createElement('button')
  btn.innerText = '📝'
  btn.classList.add('btn-anotacao')
  if (reg.anotacao) btn.classList.add('tem-anotacao')
  btn.title = reg.anotacao || 'Anotação / Editar'
  btn.onclick = e => {
    e.stopPropagation()
    abrirPopupAnotacao(reg,
      async novaAnotacao => {
        reg.anotacao = novaAnotacao
        btn.title    = novaAnotacao || 'Anotação / Editar'
        btn.classList.toggle('tem-anotacao', !!novaAnotacao)
        await atualizarAnotacao(reg)
      },
      async campos => {
        Object.assign(reg, campos)
        await atualizarCampo(reg, { valor: campos.valor, data_acordo: campos.dataAcordo, data_final: campos.dataFinal, parcelas: campos.parcelas, pagamento: campos.pagamento, acordo_id: campos.id })
        renderizar()
      }
    )
  }
  return btn
}

function criarBtnPagar(reg) {
  const btn = document.createElement('button')
  btn.innerText = 'V'
  btn.classList.add('btn-pagar')
  btn.onclick = async e => {
    e.stopPropagation()
    const valorPagar = prompt("Quanto foi pago? (use - para subtrair, 'A' para valor total)", '0')
    if (valorPagar === null || valorPagar.trim() === '') return
    const valorStr = valorPagar.trim().toLowerCase()
    if (valorStr === 'a') {
      reg.valorPago = reg.valor
    } else {
      const valorNum = parseFloat(valorStr.replace(',', '.'))
      if (isNaN(valorNum)) { alert('Valor inválido!'); return }
      reg.valorPago = Math.max(0, Math.min((reg.valorPago || 0) + valorNum, reg.valor))
    }
    await atualizarValorPago(reg)
    renderizar()
  }
  return btn
}

function criarBtnExcluir(dia, registros, reg, index, row) {
  const btn = document.createElement('button')
  btn.innerText = 'X'
  btn.classList.add('btn-excluir')
  btn.onclick = async e => {
    e.stopPropagation()
    if (!confirm('Excluir este acordo?')) return
    await excluirAcordo(reg)
    dados[dia] = dados[dia].filter(r => r._dbId !== reg._dbId)
    
    if (dados[dia].length === 0) {
      delete dados[dia]
      diasAbertos.delete(dia)
    }
    
    renderizar()
  }
  return btn
}

// ─── ADICIONAR ───────────────────────────────────────────────────────────────

async function adicionar() {
  const inputEl = dom.inputPrincipal()
  const texto   = inputEl.value.trim()
  if (!texto) return

  const linhas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  if (linhas.length === 1) {
    const ok = await processarLinha(linhas[0], false)
    if (ok) { inputEl.value = ''; inputEl.focus() }
  } else {
    const resultados = linhas.map(linha => ({ linha, reg: tentarParseLinha(linha) }))
    const validos    = resultados.filter(r => r.reg)
    const invalidos  = resultados.filter(r => !r.reg)
    validos.forEach(({ reg }) => {
      if (!dados[reg.dataAcordo]) dados[reg.dataAcordo] = []
      dados[reg.dataAcordo].push(reg)
      diasAbertos.add(reg.dataAcordo)
    })
    renderizar()
    inputEl.value = ''
    inputEl.focus()
    if (invalidos.length > 0)
      alert(`✅ ${validos.length} acordos adicionados!\n\n❌ ${invalidos.length} com erro:\n${invalidos.map(r => r.linha).join('\n')}`)
    else
      alert(`✅ ${validos.length} acordos adicionados!`)
    for (const { reg } of validos) await salvarNovoAcordo(reg.dataAcordo, reg)
  }
}

function tentarParseLinha(linha) {
  const diaHoje = getDiaHoje()
  const primeiraPalavra = linha.trim().split(/\s/)[0]
  const pareceCodigo = /^\d{5,}$/.test(primeiraPalavra)
  const pareceValor  = /^R?\$?\d+[.,]\d+$/.test(primeiraPalavra) || /^R\$/.test(primeiraPalavra)
  if (pareceCodigo && !pareceValor) return null

  const linhaSemDatas = linha.replace(/\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/g,'').replace(/\d+x/gi,'')
  const valorMatch = linhaSemDatas.match(/R?\$?\s?(\d+(?:[.,]\d+)*)/)
  if (!valorMatch) return null
  const valor = parseValor(valorMatch[1])
  if (isNaN(valor) || valor <= 0) return null

  const parcelasMatch = linha.match(/(\d+)x/i)
  const parcelas = parcelasMatch ? `${parcelasMatch[1]}x` : ''

  const todasDatas = [...linha.matchAll(/(\d{1,2}\/\d{1,2})(?:\/\d{2,4})?/g)].map(m => m[0].split('/').slice(0,2).join('/'))
  if (todasDatas.length === 0) return null

  const dataAcordo = todasDatas.length >= 2 ? todasDatas[0] : diaHoje
  const dataFinal  = todasDatas.length >= 2 ? todasDatas[1] : todasDatas[0]

  const pagamentoMatch = linha.match(/(pix|boleto|deb|débito|debito em conta|parc|parcial|parcelado)/i)
  if (!pagamentoMatch) return null

  const linhaSemValorEDatas = linha.replace(/R?\$?\s?\d+(?:[.,]\d+)*/g,'').replace(/\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/g,'').replace(/\d+x/gi,'')
  const idMatch = linhaSemValorEDatas.match(/\b(\d{5,})\b/) ?? linha.match(/\b(\d{5,})\b/)
  if (!idMatch) return null

  return { dataAcordo, valor, valorPago: 0, parcelas, dataFinal, pagamento: pagamentoMatch[1], id: idMatch[0], tipo: detectarTipo(linha), anotacao: '' }
}

async function processarLinha(linha, silencioso) {
  const reg = tentarParseLinha(linha)
  if (!reg) {
    if (!silencioso) alert('❌ Linha inválida. Verifique o formato:\nVALOR PAGAMENTO DATA_VENC ID\n\nEx: 250,00 pix 15/04 123456')
    return false
  }
  if (!dados[reg.dataAcordo]) dados[reg.dataAcordo] = []
  dados[reg.dataAcordo].push(reg)
  diasAbertos.add(reg.dataAcordo)
  await salvarNovoAcordo(reg.dataAcordo, reg)
  if (!silencioso) renderizar()
  return true
}

// ─── BUSCA ────────────────────────────────────────────────────────────────────

function buscarPorId(id) {
  const idStr = String(id)
  const diaEncontrado = Object.keys(dados).find(dia => dados[dia].some(r => String(r.id).includes(idStr)))
  if (!diaEncontrado) { alert(`ID "${id}" não encontrado.`); return }
  diasAbertos.add(diaEncontrado)
  renderizar()
  setTimeout(() => {
    const regEncontrado = dados[diaEncontrado].find(r => String(r.id) === idStr) ?? dados[diaEncontrado].find(r => String(r.id).includes(idStr))
    if (!regEncontrado) return
    const row = mapaLinhas[regEncontrado.id]
    if (!row) return
    row.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const tds = [...row.querySelectorAll('td')]
    tds.forEach(td => { td.style.cssText = 'background-color:#00ff6644 !important; transition: background-color 0s;' })
    setTimeout(() => tds.forEach(td => { td.style.transition = 'background-color 1.5s ease'; td.style.backgroundColor = '' }), 5000)
    setTimeout(() => tds.forEach(td => td.removeAttribute('style')), 6500)
  }, 300)
}

// ─── EVENTOS PRINCIPAIS ──────────────────────────────────────────────────────

$('btnAdicionar').addEventListener('click', adicionar)

$('btnBuscar').addEventListener('click', () => {
  const busca = dom.inputPrincipal().value.trim()
  if (!busca) return
  buscarPorId(busca)
})

dom.inputPrincipal().addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); adicionar() }
})

dom.inputPrincipal().addEventListener('input', e => {
  const val    = e.target.value
  const ultima = val.split('\n').pop().trim()
  const aviso  = $('avisoInput')
  if (!aviso) return
  if (!ultima) { aviso.innerText = ''; return }

  const primeiraPalavra = ultima.split(/\s/)[0]
  if (/^\d{5,}$/.test(primeiraPalavra)) {
    aviso.innerText = '⚠️ Começa com ID? O valor deve vir primeiro.'
    aviso.style.color = '#ff4d4d'
    return
  }

  for (const match of [...ultima.matchAll(/\b(\d+)(?:[.,](\d+))?\b/g)]) {
    const numInteiro = match[1]
    if (match[2] !== undefined) continue
    if (ultima.includes(`${numInteiro}/`)) continue
    if (ultima.match(new RegExp(`${numInteiro}x`, 'i'))) continue
    if (numInteiro.length >= 6 || numInteiro.length <= 3) continue
    aviso.innerText = `💡 Valor sem vírgula? Ex: ${numInteiro.slice(0,-2)},${numInteiro.slice(-2)}`
    aviso.style.color = '#ffd700'
    return
  }
  aviso.innerText = ''
})

// ─── PAINEL SEMANA ───────────────────────────────────────────────────────────

function criarPainelSemana() {
  if ($('painelSemana')) return
  const painel = document.createElement('div')
  painel.id = 'painelSemana'
  const ref = dom.tabelaNotas()
  ref.parentNode.insertBefore(painel, ref)
}

function atualizarPainelSemana() {
  criarPainelSemana()
  const painel = $('painelSemana')
  const hoje   = new Date()
  hoje.setHours(0,0,0,0)
  const fimSemana = new Date(hoje)
  fimSemana.setDate(hoje.getDate() + 7)

  const todos = Object.values(dados).flat()
  const vencendo = todos
    .filter(r => {
      if ((r.valorPago || 0) >= r.valor) return false
      const partes = r.dataFinal.split('/')
      if (partes.length < 2) return false
      const venc = new Date(hoje.getFullYear(), parseInt(partes[1])-1, parseInt(partes[0]))
      return venc >= hoje && venc <= fimSemana
    })
    .sort((a, b) => {
      const toDate = str => { const [d,m] = str.split('/').map(Number); return new Date(2000, m-1, d) }
      return toDate(a.dataFinal) - toDate(b.dataFinal)
    })

  if (vencendo.length === 0) { painel.innerHTML = ''; return }

  const totalVencendo = vencendo.reduce((s, r) => s + (r.valor - (r.valorPago || 0)), 0)
  const aberto = painel.classList.contains('aberto')

  painel.innerHTML = `
    <div class="semana-header" id="semanaToggle">
      <span>⚠️ <strong>${vencendo.length}</strong> vence${vencendo.length > 1 ? 'm' : ''} em 7 dias</span>
      <span class="semana-header-right">
        <span style="color:#ff4d4d">R$ ${totalVencendo.toFixed(2).replace('.',',')}</span>
        <span class="semana-chevron">${aberto ? '▲' : '▼'}</span>
      </span>
    </div>
    <div class="semana-corpo ${aberto ? 'aberto' : ''}">
      <div>${vencendo.map(r => {
        const [d, m] = r.dataFinal.split('/').map(Number)
        const venc   = new Date(hoje.getFullYear(), m-1, d)
        const dias   = Math.round((venc - hoje) / (1000*60*60*24))
        const label  = dias === 0 ? '🔴 Hoje' : dias === 1 ? '🟠 Amanhã' : `🟡 ${dias}d`
        const pendente = r.valor - (r.valorPago || 0)
        return `<div class="semana-item">
          <span class="semana-id">#${r.id}</span>
          <span class="semana-venc">${r.dataFinal}</span>
          <span class="semana-valor">R$ ${pendente.toFixed(2).replace('.',',')}</span>
          ${r.tipo ? `<span class="badge-tipo" style="color:${r.tipo.cor}">${r.tipo.label}</span>` : ''}
          <span class="semana-dias">${label}</span>
        </div>`
      }).join('')}</div>
    </div>
  `

  $('semanaToggle').onclick = () => {
    const corpo   = painel.querySelector('.semana-corpo')
    const chevron = painel.querySelector('.semana-chevron')
    const estaAberto = corpo.classList.toggle('aberto')
    painel.classList.toggle('aberto', estaAberto)
    if (chevron) chevron.textContent = estaAberto ? '▲' : '▼'
  }
}

// ─── INIT ────────────────────────────────────────────────────────────────────

window.addEventListener('load', () => {
  initAuth()
  $('btnTema').addEventListener('click', () => {
    localStorage.removeItem(TEMA_KEY)
    mostrarSeletorTema()
  })
})