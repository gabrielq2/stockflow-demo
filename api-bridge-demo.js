// ═══════════════════════════════════════════════════════════════════
//  api-bridge-demo.js  —  Versão DEMO (dados simulados)
//  Este arquivo substitui o api-bridge.js original na versão web.
//  Nenhuma lógica de backend, banco de dados ou regra de negócio
//  real está exposta aqui. Tudo é simulado em memória.
// ═══════════════════════════════════════════════════════════════════

(function () {

  // ── ESTADO EM MEMÓRIA ──────────────────────────────────────────────
  // Simula o banco de dados SQLite localmente no browser.
  // Reseta toda vez que a página é recarregada (comportamento esperado).

  let estoque = [
    { id: 1, tipo: 'Cabo HDMI 2m',        quantidade: 34, valor: 29.90,  tags: ['Cabos', 'Eletrônico'] },
    { id: 2, tipo: 'Mouse sem fio',        quantidade: 12, valor: 89.90,  tags: ['Periférico'] },
    { id: 3, tipo: 'Teclado Mecânico',     quantidade: 7,  valor: 249.00, tags: ['Periférico', 'Importado'] },
    { id: 4, tipo: 'Suporte para Monitor', quantidade: 5,  valor: 119.90, tags: ['Acessório'] },
    { id: 5, tipo: 'Hub USB-C 7 em 1',    quantidade: 0,  valor: 149.00, tags: ['Cabos', 'Eletrônico'] },
    { id: 6, tipo: 'Webcam Full HD',       quantidade: 3,  valor: 199.90, tags: ['Periférico'] },
    { id: 7, tipo: 'Mousepad XL',          quantidade: 20, valor: 49.90,  tags: ['Acessório'] },
  ];

  let vendas = [
    { id: 1, produto_id: 2, tipo: 'Mouse sem fio',    quantidade: 2, valor_unitario: 89.90,  total: 179.80, nf: '000101', status: 'enviado',  data_hora: _dataHa(2) },
 { id: 2, produto_id: 1, tipo: 'Cabo HDMI 2m',     quantidade: 5, valor_unitario: 29.90,  total: 149.50, nf: null,     status: 'pendente', data_hora: _dataHa(1) },
 { id: 3, produto_id: 3, tipo: 'Teclado Mecânico', quantidade: 1, valor_unitario: 249.00, total: 249.00, nf: '000103', status: 'enviado',  data_hora: _dataHa(0) },
 { id: 4, produto_id: 7, tipo: 'Mousepad XL',      quantidade: 3, valor_unitario: 49.90,  total: 149.70, nf: null,     status: 'pendente', data_hora: _dataHa(0) },
  ];

  let nextEstoqueId = 8;
  let nextVendaId   = 5;

  // Gera data/hora simulada: "há N dias"
  function _dataHa(diasAtras) {
    const d = new Date();
    d.setDate(d.getDate() - diasAtras);
    return d.toISOString().replace('T', ' ').slice(0, 19);
  }

  // Simula latência de banco (deixa a UI mais realista)
  function delay(ms = 80) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ── API MOCK ───────────────────────────────────────────────────────

  window.api = {

    // Retorna todo o estoque
    getEstoque: async () => {
      await delay();
      return estoque.map(p => ({ ...p }));
    },

 // Retorna todas as tags únicas usadas no estoque
 getAllTags: async () => {
   await delay(40);
   return [...new Set(estoque.flatMap(p => p.tags || []))].sort();
 },

 // Cadastra nova peça
 cadastrarPeca: async ({ tipo, quantidade, valor, tags }) => {
   await delay();
   if (!tipo || quantidade == null || valor == null) return false;
   estoque.push({ id: nextEstoqueId++, tipo, quantidade, valor, tags: tags || [] });
   return true;
 },

 // Deleta uma peça pelo id
 deletarPeca: async (id) => {
   await delay();
   const idx = estoque.findIndex(p => p.id === id);
   if (idx === -1) return false;
   estoque.splice(idx, 1);
   return true;
 },

 // Atualiza quantidade de uma peça
 updateQuantidade: async ({ id, novaQuantidade }) => {
   await delay();
   const p = estoque.find(p => p.id === id);
   if (!p) return { success: false, error: 'Produto não encontrado' };
   p.quantidade = novaQuantidade;
   return { success: true };
 },

 // Registra uma venda
 registrarVenda: async ({ produto_id, quantidade, nf }) => {
   await delay(120);
   const produto = estoque.find(p => p.id === produto_id);
   if (!produto)              return { success: false, error: 'Produto não encontrado' };
   if (produto.quantidade < quantidade) return { success: false, error: 'Quantidade insuficiente em estoque' };

   const total = produto.valor * quantidade;
   const novaVenda = {
     id: nextVendaId++,
     produto_id,
     tipo: produto.tipo,
     quantidade,
     valor_unitario: produto.valor,
     total,
     nf: nf || null,
     status: 'pendente',
     data_hora: new Date().toISOString().replace('T', ' ').slice(0, 19),
   };
   vendas.unshift(novaVenda);
   produto.quantidade -= quantidade;
   return { success: true, venda_id: novaVenda.id };
 },

 // Retorna histórico de vendas (últimas 20)
 buscarVendas: async () => {
   await delay();
   return vendas.slice(0, 20).map(v => ({ ...v }));
 },

 // Retorna stats do dashboard
 buscarStatsVendas: async () => {
   await delay(60);
   const hoje = new Date().toISOString().slice(0, 10);
   const ha30 = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);

   const vendasHoje  = vendas.filter(v => v.data_hora.slice(0, 10) === hoje);
   const vendas30    = vendas.filter(v => v.data_hora.slice(0, 10) >= ha30);

   const somaHoje  = vendasHoje.reduce((s, v) => s + v.total, 0);
   const soma30    = vendas30.reduce((s, v) => s + v.total, 0);
   const media30   = vendas30.length ? soma30 / Math.max(1, new Set(vendas30.map(v => v.data_hora.slice(0, 10))).size) : 0;

   return { hoje: somaHoje, total30: soma30, media30 };
 },

 // Simula envio de NF (placeholder visual)
 enviarNFAPI: async ({ venda_id, nf }) => {
   await delay(400); // simula chamada de rede
   const venda = vendas.find(v => v.id === venda_id);
   if (venda) venda.status = 'enviado';
   return {
     success: true,
 message: '[DEMO] NF simulada — integração real disponível na versão desktop.',
 nf_validada: true,
   };
 },

 // Reverte uma venda (devolve ao estoque)
 reverterVenda: async (venda_id) => {
   await delay();
   const idx = vendas.findIndex(v => v.id === venda_id);
   if (idx === -1) return { success: false, error: 'Venda não encontrada' };
   const venda = vendas[idx];
   const produto = estoque.find(p => p.id === venda.produto_id);
   if (produto) produto.quantidade += venda.quantidade;
   vendas.splice(idx, 1);
   return { success: true, message: 'Venda revertida com sucesso' };
 },
  };

  // ── BANNER DEMO ────────────────────────────────────────────────────
  // Avisa o visitante que está vendo uma demo, sem expor nada técnico.

  document.addEventListener('DOMContentLoaded', () => {
    const banner = document.createElement('div');
    banner.style.cssText = [
      'position:fixed', 'bottom:16px', 'right:16px', 'z-index:99999',
      'background:#1e293b', 'color:#e2e8f0',
      'padding:10px 16px', 'border-radius:10px',
      'font:500 12px/1.5 sans-serif', 'box-shadow:0 4px 20px rgba(0,0,0,0.4)',
                            'max-width:260px', 'border:1px solid #334155',
    ].join(';');
    banner.innerHTML =
    '🧪 <strong>Versão Demo</strong> — dados simulados em memória.<br>' +
    'Alterações não são salvas ao recarregar.<br>' +
    '<span style="color:#94a3b8">A versão desktop usa banco de dados local.</span>';
    document.body.appendChild(banner);
  });

})();
