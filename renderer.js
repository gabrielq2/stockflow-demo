// ─── UTILITÁRIOS ────────────────────────────────────────────────────────────

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function toast(title, msg, type = 'success') {
  if (typeof window.showToast === 'function') window.showToast(title, msg, type);
}

function badgeEstoque(qtd) {
  if (qtd <= 0)  return `<span class="badge badge-estoque-critico">Esgotado</span>`;
  if (qtd <= 5)  return `<span class="badge badge-estoque-baixo">Baixo</span>`;
  return `<span class="badge badge-estoque-ok">Normal</span>`;
}

function badgeStatus(status) {
  if (status === 'enviado')
    return `<span class="badge badge-enviado">Enviado</span>`;
  return `<span class="badge badge-pendente">Pendente</span>`;
}

// ─── ESTOQUE ─────────────────────────────────────────────────────────────────

async function carregarTabela() {
  let produtos;
  try {
    produtos = await window.api.getEstoque();
  } catch (e) {
    toast('Erro ao carregar estoque', e.message, 'error');
    return;
  }

  const tbody = document.getElementById('tbody-estoque');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!produtos.length) {
    tbody.innerHTML = `<tr><td colspan="8">
      <div class="empty-state"><div class="empty-icon">📦</div><p>Nenhuma peça cadastrada ainda.</p></div>
    </td></tr>`;
    if (typeof window.atualizarStatsEstoque === 'function') window.atualizarStatsEstoque([]);
    return;
  }

  produtos.forEach((produto) => {
    const total = produto.quantidade * produto.valor;
    const tags = produto.tags || [];
    const tagsHtml = tags.map(tag => {
      const color = typeof window.tagColor === 'function' ? window.tagColor(tag) : '#22c55e';
      return `<span class="tag-chip" style="--tc:${color}">${tag}</span>`;
    }).join('');
    const tr = document.createElement('tr');
    tr.dataset.tags = JSON.stringify(tags);
    tr.innerHTML = `
      <td class="td-mono" style="color:var(--text-muted)">${produto.id}</td>
      <td class="td-name">${produto.tipo}</td>
      <td><div class="tag-chip-list">${tagsHtml || '<span style="color:var(--text-muted);font-size:12px">—</span>'}</div></td>
      <td>
        <div class="qty-control">
          <button type="button" class="qty-btn btn-diminuir" data-id="${produto.id}" title="Diminuir">−</button>
          <input type="number" class="input-qtd" data-id="${produto.id}" value="${produto.quantidade}" min="0" />
          <button type="button" class="qty-btn btn-aumentar" data-id="${produto.id}" title="Aumentar">+</button>
        </div>
      </td>
      <td>${fmt.format(produto.valor)}</td>
      <td style="font-weight:600">${fmt.format(total)}</td>
      <td>${badgeEstoque(produto.quantidade)}</td>
      <td>
        <div class="action-group">
          <button type="button" class="btn btn-sm btn-danger btn-excluir" data-id="${produto.id}" data-nome="${produto.tipo}">
            🗑 Excluir
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (typeof window.atualizarStatsEstoque === 'function') {
    window.atualizarStatsEstoque(produtos);
  }
}

function inicializarEventos() {
  const tabela = document.querySelector('#tabela-estoque');
  if (!tabela) return;

  if (tabela._clickHandler) tabela.removeEventListener('click', tabela._clickHandler);
  if (tabela._changeHandler) tabela.removeEventListener('change', tabela._changeHandler);

  tabela._clickHandler = async (e) => {
    if (e.target.classList.contains('btn-aumentar')) {
      const id = e.target.dataset.id;
      const qtd = parseInt(document.querySelector(`input[data-id="${id}"]`).value) || 0;
      await alterarQtd(id, qtd + 1);
    } else if (e.target.classList.contains('btn-diminuir')) {
      const id = e.target.dataset.id;
      const qtd = parseInt(document.querySelector(`input[data-id="${id}"]`).value) || 0;
      await alterarQtd(id, qtd - 1);
    } else if (e.target.classList.contains('btn-excluir')) {
      await removerPeca(parseInt(e.target.dataset.id), e.target.dataset.nome);
    }
  };

  tabela._changeHandler = async (e) => {
    if (e.target.classList.contains('input-qtd')) {
      await alterarQtd(e.target.dataset.id, parseInt(e.target.value) || 0);
    }
  };

  tabela.addEventListener('click', tabela._clickHandler);
  tabela.addEventListener('change', tabela._changeHandler);
}

async function alterarQtd(id, novaQuantidade) {
  if (novaQuantidade < 0) return;
  try {
    await window.api.updateQuantidade({ id, novaQuantidade });
    await carregarTabela();
    inicializarEventos();
  } catch (e) {
    toast('Erro ao atualizar quantidade', e.message, 'error');
  }
}

// ─── VENDAS ──────────────────────────────────────────────────────────────────

async function carregarVendas() {
  let vendas;
  try {
    vendas = await window.api.buscarVendas();
  } catch (e) {
    toast('Erro ao carregar vendas', e.message, 'error');
    return;
  }

  const tbody = document.getElementById('tbody-vendas');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!vendas.length) {
    tbody.innerHTML = `<tr><td colspan="8">
      <div class="empty-state"><div class="empty-icon">🧾</div><p>Nenhuma venda registrada ainda.</p></div>
    </td></tr>`;
    const count = document.getElementById('count-vendas');
    if (count) count.textContent = '0 vendas';
    return;
  }

  vendas.forEach((venda) => {
    const tr = document.createElement('tr');
    const dataFormatada = new Date(venda.data_hora).toLocaleString('pt-BR');
    tr.innerHTML = `
      <td class="td-mono" style="font-size:12px;color:var(--text-secondary)">${dataFormatada}</td>
      <td class="td-name">${venda.tipo}</td>
      <td style="text-align:center">${venda.quantidade}</td>
      <td>${fmt.format(venda.valor_unitario)}</td>
      <td style="font-weight:600">${fmt.format(venda.total)}</td>
      <td class="td-mono" style="font-size:12px">${venda.nf || '—'}</td>
      <td>${badgeStatus(venda.status)}</td>
      <td>
        <div class="action-group">
          <button type="button" class="btn btn-sm btn-secondary btn-reverter" data-id="${venda.id}" data-peca="${venda.tipo}">
            ↩ Reverter
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const count = document.getElementById('count-vendas');
  if (count) count.textContent = vendas.length + ' venda' + (vendas.length !== 1 ? 's' : '');
}

function inicializarEventosVendas() {
  const tabela = document.querySelector('#tabela-vendas');
  if (!tabela) return;

  if (tabela._clickHandler) tabela.removeEventListener('click', tabela._clickHandler);

  tabela._clickHandler = async (e) => {
    const btn = e.target.closest('.btn-reverter');
    if (btn) await reverterVenda(parseInt(btn.dataset.id), btn.dataset.peca);
  };

  tabela.addEventListener('click', tabela._clickHandler);
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

async function atualizarDashboard() {
  try {
    const dados = await window.api.buscarStatsVendas();
    const el = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    el('venda-hoje',    fmt.format(dados.hoje));
    el('venda-30-dias', fmt.format(dados.total30));
    el('media-30-dias', fmt.format(dados.media30));
  } catch (e) {
    toast('Erro ao carregar dashboard', e.message, 'error');
    return;
  }

  await carregarPecas();
  await carregarVendas();
  inicializarEventosVendas();
}

async function carregarPecas() {
  let produtos;
  try {
    produtos = await window.api.getEstoque();
  } catch (e) {
    toast('Erro ao carregar peças', e.message, 'error');
    return;
  }

  const select = document.getElementById('select-peca');
  if (!select) return;

  select.innerHTML = '<option value="">— Selecione uma peça —</option>';
  produtos.forEach((p) => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.tipo} — ${fmt.format(p.valor)} (${p.quantidade} un)`;
    select.appendChild(opt);
  });
}

// ─── AÇÕES ───────────────────────────────────────────────────────────────────

async function registrarVenda() {
  const selectPeca = document.getElementById('select-peca');
  const inputQtd   = document.getElementById('input-qtd-venda');
  const inputNF    = document.getElementById('input-nf');

  if (!selectPeca.value || !inputQtd.value) {
    toast('Campos obrigatórios', 'Selecione uma peça e informe a quantidade.', 'error');
    return;
  }

  const quantidade = parseInt(inputQtd.value);
  if (quantidade <= 0) {
    toast('Quantidade inválida', 'A quantidade deve ser maior que zero.', 'error');
    return;
  }

  let resultado;
  try {
    resultado = await window.api.registrarVenda({
      produto_id: parseInt(selectPeca.value),
      quantidade,
      nf: inputNF.value || null,
    });
  } catch (e) {
    toast('Erro ao registrar venda', e.message, 'error');
    return;
  }

  if (resultado.success) {
    toast('Venda registrada!', `${quantidade} unidade(s) vendida(s) com sucesso.`);

    if (inputNF.value) {
      try {
        const resNF = await window.api.enviarNFAPI({ venda_id: resultado.venda_id, nf: inputNF.value });
        if (resNF.success) toast('NF enviada', resNF.message, 'info');
      } catch (_) {}
    }

    selectPeca.value = '';
    inputQtd.value   = '';
    inputNF.value    = '';

    await carregarPecas();
    await carregarVendas();
    await atualizarDashboard();
  } else {
    toast('Erro ao registrar', resultado.error, 'error');
  }
}

async function salvarNovaPeca() {
  const nome  = document.getElementById('input-nome').value.trim();
  const qtd   = document.getElementById('input-qtd').value;
  const valor = document.getElementById('input-valor').value;

  if (!nome || !qtd || !valor) {
    toast('Campos obrigatórios', 'Preencha nome, quantidade e preço.', 'error');
    return;
  }

  const tags = typeof window.getNewPecaTags === 'function' ? window.getNewPecaTags() : [];

  let sucesso;
  try {
    sucesso = await window.api.cadastrarPeca({
      tipo: nome,
      quantidade: parseInt(qtd),
      valor: parseFloat(valor),
      tags,
    });
  } catch (e) {
    toast('Erro ao cadastrar', e.message, 'error');
    return;
  }

  if (sucesso) {
    document.getElementById('input-nome').value  = '';
    document.getElementById('input-qtd').value   = '';
    document.getElementById('input-valor').value = '';
    if (typeof window.resetNewPecaTags === 'function') window.resetNewPecaTags();

    toast('Peça cadastrada!', `"${nome}" adicionada ao estoque.`);
    await carregarTabela();
    inicializarEventos();
  } else {
    toast('Erro ao cadastrar', 'O backend retornou falha. Tente novamente.', 'error');
  }
}

async function removerPeca(id, nome) {
  if (!confirm(`Remover "${nome}" do estoque permanentemente?`)) return;

  let sucesso;
  try {
    sucesso = await window.api.deletarPeca(id);
  } catch (e) {
    toast('Erro ao remover', e.message, 'error');
    return;
  }

  if (sucesso) {
    toast('Peça removida', `"${nome}" foi removida do estoque.`);
    await carregarTabela();
    inicializarEventos();
  } else {
    toast('Erro ao remover', 'O backend retornou falha.', 'error');
  }
}

async function reverterVenda(vendaId, peca) {
  if (!confirm(`Reverter a venda de "${peca}"?\nA quantidade será devolvida ao estoque.`)) return;

  let resultado;
  try {
    resultado = await window.api.reverterVenda(vendaId);
  } catch (e) {
    toast('Erro ao reverter', e.message, 'error');
    return;
  }

  if (resultado.success) {
    toast('Venda revertida', resultado.message);
    await carregarVendas();
    await atualizarDashboard();
  } else {
    toast('Erro ao reverter', resultado.error, 'error');
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  // Inicia na página de vendas
  atualizarDashboard();
  inicializarEventosVendas();
  // Pré-carrega o estoque (fica oculto até o usuário navegar)
  carregarTabela().then(() => inicializarEventos());
  if (typeof carregarTagsConhecidas === 'function') carregarTagsConhecidas();
});
