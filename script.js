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

  /* ===== TOTAIS GERAIS ===== */

  const todosRegistros = Object.values(dados).flat();

  const totalAcordos = todosRegistros.length;

  const totalComPagamento = todosRegistros.filter(r => (r.valorPago || 0) > 0).length;

  const totalTotalmentePagos = todosRegistros.filter(r => (r.valorPago || 0) >= r.valor).length;

  const totalValor = todosRegistros.reduce((s, r) => s + r.valor, 0);

  const totalPago = todosRegistros.reduce((s, r) => s + (r.valorPago || 0), 0);

  const resumo = document.getElementById('resumoGeral');
  if(resumo) {
    resumo.innerHTML = `
      <span>📋 <strong>${totalAcordos} / ${totalComPagamento} / ${totalTotalmentePagos}</strong> P/V/Q</span>
      <span>💰 <strong>R$ ${totalValor.toFixed(2).replace('.',',')} / ${totalPago.toFixed(2).replace('.',',')}</strong></span>
    `;
  }

  /* ===== RESTANTE DO CÓDIGO CONTINUA IGUAL ===== */

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

    const tabelaWrapper = document.createElement("div");
    tabelaWrapper.classList.add("dia-tabela");
    if (diasAbertos.has(dia)) tabelaWrapper.classList.add("aberto");

    const tabela = document.createElement("table");

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
      const valorPago = reg.valorPago || 0;
      const acordoPago = valorPago >= reg.valor;

      if(acordoPago) row.classList.add("acordo-pago");

      row.insertCell(0).innerText = reg.dataAcordo || "-";

      const valorCell = row.insertCell(1);
      if(valorPago > 0) {
        valorCell.innerHTML = `R$ ${reg.valor.toFixed(2).replace('.',',')} / <span style="color:#00ffcc;">${valorPago.toFixed(2).replace('.',',')}</span>`;
      } else {
        valorCell.innerText = `R$ ${reg.valor.toFixed(2).replace('.',',')}`;
      }

      row.insertCell(2).innerText = reg.parcelas;
      row.insertCell(3).innerText = reg.dataFinal;
      row.insertCell(4).innerText = reg.pagamento;
      row.insertCell(5).innerText = reg.id;

      const acoesCell = row.insertCell(6);

      const btnPagar = document.createElement("button");
      btnPagar.innerText = "Pagar";
      btnPagar.classList.add("btn-pagar");
      btnPagar.onclick = function(e){
        e.stopPropagation();
        const valorPagar = prompt("Quanto foi pago? (use - para subtrair, 'tudo' para valor total)", "0");
        if(valorPagar !== null && valorPagar.trim() !== "") {

          let valorStr = valorPagar.trim().toLowerCase();

          if(valorStr === "tudo") {
            reg.valorPago = reg.valor;
            salvarDados();
            renderizar();
            return;
          }

          valorStr = valorStr.replace(',', '.');
          let valorNum = parseFloat(valorStr);

          if(!isNaN(valorNum)) {
            reg.valorPago = (reg.valorPago || 0) + valorNum;
            if(reg.valorPago < 0) reg.valorPago = 0;
            salvarDados();
            renderizar();
          } else {
            alert("Valor inválido!");
          }
        }
      };

      acoesCell.appendChild(btnPagar);

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
      };

      acoesCell.appendChild(btnExcluir);

    });

    header.onclick = function(){
      tabelaWrapper.classList.toggle("aberto");
      header.classList.toggle("aberto");

      if (tabelaWrapper.classList.contains("aberto")) {
        diasAbertos.add(dia);
      } else {
        diasAbertos.delete(dia);
      }
    }

    tabelaWrapper.appendChild(tabela);
    bloco.appendChild(header);
    bloco.appendChild(tabelaWrapper);
    container.appendChild(bloco);

  });
}

window.onload = function(){
  renderizar();
  inputLinha.focus();
};