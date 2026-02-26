const form = document.getElementById('notaForm');
const inputLinha = document.getElementById('linha');
const container = document.getElementById('tabelaNotas');

let dados = JSON.parse(localStorage.getItem("acordosPorDia")) || {};
let diasAbertos = new Set();

function salvarDados() {
  localStorage.setItem("acordosPorDia", JSON.stringify(dados));
}

function getDataHora() {
  const agora = new Date();
  const dia = String(agora.getDate()).padStart(2,'0');
  const mes = String(agora.getMonth()+1).padStart(2,'0');
  const hora = String(agora.getHours()).padStart(2,'0');
  const minuto = String(agora.getMinutes()).padStart(2,'0');

  return {
    dia: `${dia}/${mes}`,
    dataHora: `${dia}/${mes} ${hora}:${minuto}`
  };
}

function renderizar() {
  container.innerHTML = "";
  const diasOrdenados = Object.keys(dados).sort().reverse();

  // ── TOTAIS GERAIS ──
  const totalAcordos = Object.values(dados).reduce((sum, regs) => sum + regs.length, 0);
  const totalValor = Object.values(dados).reduce((sum, regs) => sum + regs.reduce((s, r) => s + r.valor, 0), 0);
  const totalPago = Object.values(dados).reduce((sum, regs) => sum + regs.reduce((s, r) => s + (r.valorPago || 0), 0), 0);

  const resumo = document.getElementById('resumoGeral');
  if(resumo) {
    resumo.innerHTML = `
      <span>📋 <strong>${totalAcordos}</strong> acordos no total</span>
      <span>💰 <strong>R$ ${totalValor.toFixed(2).replace('.',',')} / ${totalPago.toFixed(2).replace('.',',')}</strong> Total/Pago</span>
    `;
  }

  diasOrdenados.forEach(dia => {
    const registros = dados[dia];
    let totalDia = registros.reduce((sum,r)=>sum+r.valor,0);
    let totalPagoDia = registros.reduce((sum,r)=>sum+(r.valorPago || 0),0);

    const bloco = document.createElement("div");
    bloco.classList.add("dia-bloco");

    const header = document.createElement("div");
    header.classList.add("dia-header");
    if (diasAbertos.has(dia)) header.classList.add("aberto");
    header.innerHTML = `
      <span>${dia}</span>
      <span>R$ ${totalDia.toFixed(2).replace('.',',')} / ${totalPagoDia.toFixed(2).replace('.',',')} | ${registros.length} acordos</span>
    `;

    const tabela = document.createElement("table");
    tabela.classList.add("dia-tabela");
    if (diasAbertos.has(dia)) tabela.classList.add("aberto");

    tabela.innerHTML = `
      <thead>
        <tr>
          <th>Data Acordo</th>
          <th>Valor</th>
          <th>Parcelas</th>
          <th>Data Final</th>
          <th>Pagamento</th>
          <th>ID</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = tabela.querySelector("tbody");
    registros.forEach((reg, index) => {
      const row = tbody.insertRow();
      
      // Verifica se o acordo está totalmente pago
      const valorPago = reg.valorPago || 0;
      const acordoPago = valorPago >= reg.valor;
      
      // Se estiver pago, adiciona classe especial
      if(acordoPago) {
        row.classList.add("acordo-pago");
      }
      
      row.insertCell(0).innerText = reg.dataAcordo || "-";
      
      // Exibir valor com formato total/pago
      const valorCell = row.insertCell(1);
      if(valorPago > 0) {
        valorCell.innerHTML = `R$ ${reg.valor.toFixed(2).replace('.',',')} / <span style="color: #00ffcc;">${valorPago.toFixed(2).replace('.',',')}</span>`;
      } else {
        valorCell.innerText = `R$ ${reg.valor.toFixed(2).replace('.',',')}`;
      }
      
      row.insertCell(2).innerText = reg.parcelas;
      row.insertCell(3).innerText = reg.dataFinal;
      row.insertCell(4).innerText = reg.pagamento;
      row.insertCell(5).innerText = reg.id;

      const acoesCell = row.insertCell(6);

      // Botão Pagar
      const btnPagar = document.createElement("button");
      btnPagar.innerText = "Pagar";
      btnPagar.classList.add("btn-pagar");
      btnPagar.onclick = function(e){
        e.stopPropagation();
        const valorPagar = prompt("Quanto foi pago? (use - para subtrair, ex: -100)", "0");
        if(valorPagar !== null && valorPagar.trim() !== "") {
          // Remove espaços e substitui vírgula por ponto
          let valorStr = valorPagar.trim().replace(',', '.');
          let valorNum = parseFloat(valorStr);
          
          if(!isNaN(valorNum)) {
            // Adiciona ou subtrai do valor pago
            reg.valorPago = (reg.valorPago || 0) + valorNum;
            
            // Garante que não fique negativo
            if(reg.valorPago < 0) reg.valorPago = 0;
            
            salvarDados();
            renderizar();
          } else {
            alert("Valor inválido!");
          }
        }
      }
      acoesCell.appendChild(btnPagar);

      // Botão Excluir
      const btnExcluir = document.createElement("button");
      btnExcluir.innerText = "Excluir";
      btnExcluir.classList.add("btn-excluir");
      btnExcluir.onclick = function(e){
        e.stopPropagation();
        registros.splice(index, 1);
        if(registros.length === 0){
          delete dados[dia];
          diasAbertos.delete(dia);
        }
        salvarDados();
        renderizar();
      }
      acoesCell.appendChild(btnExcluir);

      if(reg.novo) {
        row.classList.add("novo-registro");
        delete reg.novo;
        salvarDados();
        setTimeout(() => row.classList.remove("novo-registro"), 500);
      }
    });

    header.onclick = function(){
      if(tabela.classList.contains("aberto")) {
        tabela.classList.add("fechando");
        header.classList.remove("aberto");
        diasAbertos.delete(dia);
        setTimeout(() => {
          tabela.classList.remove("aberto");
          tabela.classList.remove("fechando");
        }, 280);
      } else {
        tabela.classList.add("aberto");
        header.classList.add("aberto");
        diasAbertos.add(dia);
      }
    }

    bloco.appendChild(header);
    bloco.appendChild(tabela);
    container.appendChild(bloco);
  });
}

form.addEventListener('submit', function(e){
  e.preventDefault();
  const linha = inputLinha.value.trim();
  if(!linha) return;

  const {dia: diaHoje, dataHora} = getDataHora();

  const linhaSemDatas = linha
    .replace(/\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/g, '')
    .replace(/\d+x/gi, '');
  const valorMatch = linhaSemDatas.match(/R?\$?\s?(\d+(?:[\.,]\d{3})*[\.,]\d{2}|\d+)/);
  if(!valorMatch) return alert("Valor inválido");
  let valorStr = valorMatch[1];
  const temVirgula = valorStr.includes(',');
  const pontos = (valorStr.match(/\./g) || []).length;
  if(!temVirgula && pontos === 1) {
    valorStr = valorStr.replace('.', '.');
  } else if(!temVirgula && pontos > 1) {
    const partes = valorStr.split('.');
    const decimal = partes.pop();
    valorStr = partes.join('') + '.' + decimal;
  } else {
    valorStr = valorStr.replace(/\./g,'').replace(',','.');
  }
  const valor = parseFloat(valorStr);

  const parcelasMatch = linha.match(/(\d+)x/i);
  const parcelas = parcelasMatch ? parcelasMatch[1]+"x" : "";

  const todasDatas = [...linha.matchAll(/(\d{1,2}\/\d{1,2})(?:\/\d{2,4})?/g)].map(m => m[0].split('/').slice(0,2).join('/'));
  if(todasDatas.length === 0) return alert("Data inválida");

  let dataAcordo = null;
  let dataFinal = null;

  if(todasDatas.length >= 2) {
    dataAcordo = todasDatas[0];
    dataFinal  = todasDatas[1];
  } else if(todasDatas.length === 1) {
    dataAcordo = diaHoje;
    dataFinal  = todasDatas[0];
  }

  const pagamentoMatch = linha.match(/(pix|boleto|deb|débito|debito em conta|parc|parcial|parcelado)/i);
  if(!pagamentoMatch) return alert("Pagamento inválido");
  const pagamento = pagamentoMatch[1];

  const idMatch = linha.match(/\b(\d{6,})\b/);
  if(!idMatch) return alert("ID inválido");
  const id = idMatch[0];

  const diaAgrupador = dataAcordo || diaHoje;
  if(!dados[diaAgrupador]) dados[diaAgrupador] = [];
  dados[diaAgrupador].push({ 
    dataAcordo, 
    valor, 
    valorPago: 0,
    parcelas, 
    dataFinal, 
    pagamento, 
    id, 
    novo: true 
  });

  diasAbertos.add(diaAgrupador);
  salvarDados();
  renderizar();

  inputLinha.value = "";
  inputLinha.focus();
});

window.onload = function(){
  renderizar();
  inputLinha.focus();
}