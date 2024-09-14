// Função para adicionar meses a uma data
function adicionarMeses(data, meses) {
    const novaData = new Date(data);
    novaData.setMonth(novaData.getMonth() + meses);
    return novaData.toISOString().split('T')[0]; // Retorna no formato YYYY-MM-DD
  }

  // Função principal para gerar as vigências e calcular
  function gerarVigencias() {
    const numVigencias = parseInt(document.getElementById('numVigencias').value);
    const dataInicial = document.getElementById('dataInicial').value;
    const fee = parseFloat(document.getElementById('fee').value);
    const ultimoDia = document.getElementById('ultimoDia').value;
    const feesPagos = parseInt(document.getElementById('feesPagos').value);
    const avisoPrevio = parseInt(document.getElementById('avisoPrevio').value);

    if (!numVigencias || !dataInicial || !fee || !ultimoDia || feesPagos === null || avisoPrevio === null) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    // Lista de vigências
    let vigencias = [];
    let dataInicioVigencia = dataInicial;

    // Gerar as vigências (cada uma com 30 dias)
    for (let i = 0; i < numVigencias; i++) {
      const dataFimVigencia = adicionarMeses(dataInicioVigencia, 1);
      const dataFimFormatada = new Date(dataFimVigencia);
      dataFimFormatada.setDate(dataFimFormatada.getDate() - 1); // Ajusta a data para o último dia do mês (ex: 09/10)
      vigencias.push({ inicio: dataInicioVigencia, fim: dataFimFormatada.toISOString().split('T')[0] });
      dataInicioVigencia = adicionarMeses(dataInicioVigencia, 1); // Próxima vigência começa no mesmo dia do mês
    }

    // Se aviso prévio de 30 ou 60 dias, adicionar mais 1 ou 2 vigências
    for (let i = 0; i < avisoPrevio / 30; i++) {
      const dataFimVigencia = adicionarMeses(dataInicioVigencia, 1);
      const dataFimFormatada = new Date(dataFimVigencia);
      dataFimFormatada.setDate(dataFimFormatada.getDate() - 1);
      vigencias.push({ inicio: dataInicioVigencia, fim: dataFimFormatada.toISOString().split('T')[0] });
      dataInicioVigencia = adicionarMeses(dataInicioVigencia, 1);
    }

    // Encontrar a vigência onde o último dia de prestação de serviço se encaixa
    let vigenciaCorrespondente = null;
    let indexUltimaVigencia = 0;
    for (let i = 0; i < vigencias.length; i++) {
      const vigencia = vigencias[i];
      if (ultimoDia >= vigencia.inicio && ultimoDia <= vigencia.fim) {
        vigenciaCorrespondente = vigencia;
        indexUltimaVigencia = i;
        break;
      }
    }

    // Exibir as vigências na tela e destacar a vigência correspondente
    let vigenciasHtml = '<ul class="vigencia-list">';
    vigencias.forEach((vigencia, index) => {
      const isCorrespondente = vigencia === vigenciaCorrespondente;
      vigenciasHtml += `<li class="${isCorrespondente ? 'highlight' : ''}">
                        Vigência ${index + 1}: ${formatarData(vigencia.inicio)} até ${formatarData(vigencia.fim)}
                      </li>`;
    });
    vigenciasHtml += '</ul>';
    document.getElementById('vigenciasResultado').innerHTML = vigenciasHtml;

    if (!vigenciaCorrespondente) {
      document.getElementById('resultado').innerText = "O último dia de prestação não se encaixa em nenhuma vigência.";
      return;
    }

    // Calcular o número de dias a serem cobrados na última vigência (vigência correspondente)
    const diasCobrados = (new Date(ultimoDia) - new Date(vigenciaCorrespondente.inicio)) / (1000 * 60 * 60 * 24);
    const valorParcial = (fee / 30) * diasCobrados; // Cálculo parcial para a vigência com prestação

    // Calcular o valor cobrado
    let valorCobradoDiasTrabalhados = 0;
    let feesEmAtraso = 0;
    let valorAvisoPrevio = 0;

    // Calcular os fees em atraso e dias trabalhados
    for (let i = feesPagos; i <= indexUltimaVigencia; i++) {
      if (i === indexUltimaVigencia) {
        valorCobradoDiasTrabalhados += valorParcial; // Cálculo parcial para a última vigência
      } else if (i >= feesPagos && i < indexUltimaVigencia) {
        feesEmAtraso += fee; // Soma dos fees em atraso
      }
    }

    // Adicionar o valor do aviso prévio ao valor total
    if (avisoPrevio === 30) {
      valorAvisoPrevio = fee; // Adiciona 1 fee se o aviso prévio for de 30 dias
    } else if (avisoPrevio === 60) {
      valorAvisoPrevio = fee * 2; // Adiciona 2 fees se o aviso prévio for de 60 dias
    }

    // Calcular valor total
    const valorTotal = valorCobradoDiasTrabalhados + feesEmAtraso + valorAvisoPrevio;

    // Exibir os resultados finais
    document.getElementById('resultado').innerHTML = `
    <p>Valor cobrado pelos ${diasCobrados} dias trabalhados: R$ ${valorCobradoDiasTrabalhados.toFixed(2)}</p>
    <p>Valor cobrado por fees em atraso: R$ ${feesEmAtraso.toFixed(2)}</p>
    <p>Valor cobrado referente ao aviso prévio de ${avisoPrevio} dias: R$ ${valorAvisoPrevio.toFixed(2)}</p>
    <p><strong>Valor total devido: R$ ${valorTotal.toFixed(2)}</strong></p>
  `;
  }

  // Função para formatar a data no formato dd/mm/aaaa
  function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }