const inputPrincipal = document.getElementById('inputPrincipal');
const container = document.getElementById('tabelaNotas');

let dados = JSON.parse(localStorage.getItem("acordosPorDia")) || {};
let diasAbertos = new Set();

function salvarDados() {
  localStorage.setItem("acordosPorDia", JSON.stringify(dados));
}

function getDataHora() {
  const agora = new Date();
  const dia    = String(agora.getDate()).padStart(2,'0');
  const mes    = String(agora.getMonth()+1).padStart(2,'0');
  const hora   = String(agora.getHours()).padStart(2,'0');
  const minuto = String(agora.getMinutes()).padStart(2,'0');
  return {
    dia: `${dia}/${mes}`,
    dataHora: `${dia}/${mes} ${hora}:${minuto}`
  };
}

// ===== PARSER DE VALOR =====
function parseValor(str) {
  const nPontos   = (str.match(/\./g) || []).length;
  const nVirgulas = (str.match(/,/g)  || []).length;

  if (nVirgulas === 1) {
    return parseFloat(str.replace(/\./g, '').replace(',', '.'));
  }
  if (nPontos >= 2) {
    const ultimo  = str.lastIndexOf('.');
    const inteiro = str.slice(0, ultimo).replace(/[.,]/g, '');
    const decimal = str.slice(ultimo + 1);
    return parseFloat(inteiro + '.' + decimal);
  }
  if (nPontos === 1) {
    const partes = str.split('.');
    if (partes[1].length <= 2) return parseFloat(str);
    return parseFloat(str.replace('.', ''));
  }
  return parseFloat(str.replace(/[.,]/g, ''));
}

// ===== TIPO DE CLIENTE =====
const tiposCliente = {
  'merchant': { label: 'Merchant', cor: '#a78bfa' },
  'mer':      { label: 'Merchant', cor: '#a78bfa' },
  'merc':     { label: 'Merchant', cor: '#a78bfa' },
  'point':    { label: 'Point',    cor: '#60a5fa' },
  'p':        { label: 'Point',    cor: '#60a5fa' },
  'consumer': { label: 'Consumer', cor: '#f97316' },
  'con':      { label: 'Consumer', cor: '#f97316' },
  'cons':     { label: 'Consumer', cor: '#f97316' },
  'cc':       { label: 'Cartão',   cor: '#fb7185' },
  'cartao':   { label: 'Cartão',   cor: '#fb7185' },
  'cartão':   { label: 'Cartão',   cor: '#fb7185' },
};

function detectarTipo(linha) {
  const sem = linha.replace(/\b(pix|boleto|deb(?:ito)?|débito|debito em conta|parc(?:ial|elado)?)\b/gi, '');
  const match = sem.match(/\b(merchant|consumer|cartao|cartão|point|mer|merc|cons|con|cc)\b|\bp\b/i);
  if (!match) return null;
  return tiposCliente[match[0].toLowerCase()] || null;
}

function renderizar() {
  container.innerHTML = "";
  const diasOrdenados = Object.keys(dados).sort().reverse();

  const todosRegistros      = Object.values(dados).flat();
  const totalAcordos        = todosRegistros.length;
  const totalTotalmentePagos= todosRegistros.filter(r => (r.valorPago || 0) >= r.valor && r.valor > 0).length;
  const totalComPagamento   = todosRegistros.filter(r => (r.valorPago || 0) > 0 && (r.valorPago || 0) < r.valor).length;
  const totalValor          = todosRegistros.reduce((s, r) => s + r.valor, 0);
  const totalPago           = todosRegistros.reduce((s, r) => s + (r.valorPago || 0), 0);

  const resumo = document.getElementById('resumoGeral');
  if (resumo) {
    resumo.innerHTML = `
      <span>📋 <strong class="cor-total">${totalAcordos}</strong> / <strong class="cor-pagamento">${totalComPagamento}</strong> / <strong class="cor-quitado">${totalTotalmentePagos}</strong></span>
      <span>💰 <strong class="cor-total">R$ ${totalValor.toFixed(2).replace('.',',')}</strong> / <strong class="cor-quitado">R$ ${totalPago.toFixed(2).replace('.',',')}</strong></span>
    `;
  }

  diasOrdenados.forEach(dia => {
    const registros   = dados[dia];
    const totalDia    = registros.reduce((s,r) => s + r.valor, 0);
    const totalPagoDia= registros.reduce((s,r) => s + (r.valorPago || 0), 0);

    const bloco = document.createElement("div");
    bloco.classList.add("dia-bloco");

    const header = document.createElement("div");
    header.classList.add("dia-header");
    if (diasAbertos.has(dia)) header.classList.add("aberto");
    header.innerHTML = `
      <span>${dia}</span>
      <span>R$ ${totalDia.toFixed(2).replace('.',',')} / ${totalPagoDia.toFixed(2).replace('.',',')} | ${registros.length} acordos</span>
    `;

    const tabelaWrapper = document.createElement("div");
    tabelaWrapper.classList.add("dia-tabela");
    if (diasAbertos.has(dia)) tabelaWrapper.classList.add("aberto");

    const tabela = document.createElement("table");
    tabela.innerHTML = `
      <thead>
        <tr>
          <th>Data</th>
          <th>Valor</th>
          <th>Parcelas</th>
          <th>Vencimento</th>
          <th>Pagamento</th>
          <th>ID</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = tabela.querySelector("tbody");

    registros.forEach((reg, index) => {
      const row       = tbody.insertRow();
      const valorPago = reg.valorPago || 0;
      const acordoPago= valorPago >= reg.valor;

      if (acordoPago) row.classList.add("acordo-pago");

      row.insertCell(0).innerText = reg.dataAcordo || "-";

      const valorCell = row.insertCell(1);
      let valorHtml = '';

      if (acordoPago) {
        valorHtml = `<span style="color:#00ffcc;">R$ ${reg.valor.toFixed(2).replace('.',',')}</span>`;
      } else if (valorPago > 0) {
        valorHtml = `<span style="color:#ff4d4d;">R$ ${reg.valor.toFixed(2).replace('.',',')}</span> / <span style="color:#00ffcc;">${valorPago.toFixed(2).replace('.',',')}</span>`;
      } else {
        valorHtml = `<span style="color:#ff4d4d;">R$ ${reg.valor.toFixed(2).replace('.',',')}</span>`;
      }

      if (reg.tipo) {
        valorHtml += `<br><span class="badge-tipo" style="color:${reg.tipo.cor};">${reg.tipo.label}</span>`;
      }

      valorCell.innerHTML = valorHtml;

      row.insertCell(2).innerText = reg.parcelas;
      row.insertCell(3).innerText = reg.dataFinal;
      row.insertCell(4).innerText = reg.pagamento;
      row.insertCell(5).innerText = reg.id;

      const acoesCell = row.insertCell(6);

      const btnPagar = document.createElement("button");
      btnPagar.innerText = "Pagar";
      btnPagar.classList.add("btn-pagar");
      btnPagar.onclick = function(e) {
        e.stopPropagation();
        const valorPagar = prompt("Quanto foi pago? (use - para subtrair, 'tudo' para valor total)", "0");
        if (valorPagar !== null && valorPagar.trim() !== "") {
          let valorStr = valorPagar.trim().toLowerCase();
          if (valorStr === "tudo") {
            reg.valorPago = reg.valor;
            salvarDados(); renderizar(); return;
          }
          valorStr = valorStr.replace(',', '.');
          const valorNum = parseFloat(valorStr);
          if (!isNaN(valorNum)) {
            reg.valorPago = (reg.valorPago || 0) + valorNum;
            if (reg.valorPago < 0) reg.valorPago = 0;
            salvarDados(); renderizar();
          } else { alert("Valor inválido!"); }
        }
      };
      acoesCell.appendChild(btnPagar);

      const btnExcluir = document.createElement("button");
      btnExcluir.innerText = "Excluir";
      btnExcluir.classList.add("btn-excluir");
      btnExcluir.onclick = function(e) {
        e.stopPropagation();
        registros.splice(index, 1);
        if (registros.length === 0) { delete dados[dia]; diasAbertos.delete(dia); }
        salvarDados(); renderizar();
      };
      acoesCell.appendChild(btnExcluir);

      if (reg.novo) {
        row.classList.add("novo-registro");
        delete reg.novo;
        salvarDados();
      }
    });

    header.onclick = function() {
      if (tabelaWrapper.classList.contains("aberto")) {
        tabelaWrapper.classList.add("fechando");
        header.classList.remove("aberto");
        diasAbertos.delete(dia);
        setTimeout(() => {
          tabelaWrapper.classList.remove("aberto");
          tabelaWrapper.classList.remove("fechando");
        }, 280);
      } else {
        tabelaWrapper.classList.add("aberto");
        header.classList.add("aberto");
        diasAbertos.add(dia);
      }
    };

    tabelaWrapper.appendChild(tabela);
    bloco.appendChild(header);
    bloco.appendChild(tabelaWrapper);
    container.appendChild(bloco);
  });
}

// ===== ADICIONAR =====
function adicionar() {
  const linha = inputPrincipal.value.trim();
  if (!linha) return;

  const { dia: diaHoje } = getDataHora();

  const linhaSemDatas = linha
    .replace(/\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/g, '')
    .replace(/\d+x/gi, '');

  const valorMatch = linhaSemDatas.match(/R?\$?\s?(\d+(?:[.,]\d+)*)/);
  if (!valorMatch) return alert("Valor inválido");

  const valor = parseValor(valorMatch[1]);
  if (isNaN(valor) || valor <= 0) return alert("Valor inválido");

  const parcelasMatch = linha.match(/(\d+)x/i);
  const parcelas = parcelasMatch ? parcelasMatch[1] + "x" : "";

  const todasDatas = [...linha.matchAll(/(\d{1,2}\/\d{1,2})(?:\/\d{2,4})?/g)]
    .map(m => m[0].split('/').slice(0,2).join('/'));

  if (todasDatas.length === 0) return alert("Data inválida");

  const dataAcordo = todasDatas.length >= 2 ? todasDatas[0] : diaHoje;
  const dataFinal  = todasDatas.length >= 2 ? todasDatas[1] : todasDatas[0];

  const pagamentoMatch = linha.match(/(pix|boleto|deb|débito|debito em conta|parc|parcial|parcelado)/i);
  if (!pagamentoMatch) return alert("Pagamento inválido");
  const pagamento = pagamentoMatch[1];

  const idMatch = linha.match(/\b(\d{6,})\b/);
  if (!idMatch) return alert("ID inválido");
  const id = idMatch[0];

  const tipo = detectarTipo(linha);

  if (!dados[dataAcordo]) dados[dataAcordo] = [];
  dados[dataAcordo].push({ dataAcordo, valor, valorPago: 0, parcelas, dataFinal, pagamento, id, tipo, novo: true });

  diasAbertos.add(dataAcordo);
  salvarDados();
  renderizar();
  inputPrincipal.value = "";
  inputPrincipal.focus();
}

// ===== BUSCA POR ID =====
function buscarPorId(id) {
  const h1 = document.querySelector('h1');

  document.querySelectorAll('.linha-destaque').forEach(el => el.classList.remove('linha-destaque'));

  for (const dia of Object.keys(dados)) {
    const registros = dados[dia];
    const found = registros.findIndex(r => String(r.id).includes(id));
    if (found !== -1) {
      diasAbertos.add(dia);
      renderizar();

      setTimeout(() => {
        for (const row of document.querySelectorAll('tbody tr')) {
          const cellId = row.cells[5];
          if (cellId && cellId.innerText.includes(id)) {
            row.classList.add('linha-destaque');
            setTimeout(() => row.classList.remove('linha-destaque'), 3200);
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });

            h1.classList.add('busca-achou');
            setTimeout(() => h1.classList.remove('busca-achou'), 4000);
            break;
          }
        }
      }, 100);
      return;
    }
  }
  alert(`ID "${id}" não encontrado.`);
}

// ===== EVENTOS =====
document.getElementById('btnAdicionar').addEventListener('click', adicionar);

document.getElementById('btnBuscar').addEventListener('click', function() {
  const busca = inputPrincipal.value.trim();
  if (busca) buscarPorId(busca);
});

inputPrincipal.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') adicionar();
});

window.onload = function() {
  renderizar();
  inputPrincipal.focus();
};