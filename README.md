# StockFlow

> Sistema de gestão de estoque e vendas para pequenos e médios comércios.

**Status atual:** Em desenvolvimento ativo — versão alpha funcional.  
**Demo web:** [link da demo aqui]

---

## Sobre o projeto

StockFlow é uma aplicação desktop multiplataforma que resolve um problema comum em pequenos comércios: controlar estoque e registrar vendas de forma simples, rápida e sem depender de internet ou mensalidades de SaaS.

O app roda localmente na máquina do usuário, com banco de dados SQLite embutido, sem necessidade de servidor externo ou conta em nuvem.

---

## Estado atual (v1.0 alpha)

O que já está implementado e funcionando:

- **Gestão de estoque** — cadastro de produtos com nome, quantidade e preço unitário
- **Sistema de hashtags** — categorização livre por tags com sugestão automática e filtro combinado
- **Controle de quantidade** — incremento, decremento e edição direta na tabela
- **Dashboard de vendas** — total do dia, últimos 30 dias e média diária
- **Registro de vendas** — seleção de produto, quantidade e número de NF opcional
- **Histórico de vendas** — tabela com busca, status e reversão de transações
- **Reversão de venda** — devolve a quantidade ao estoque automaticamente
- **Badges de status** — indicadores visuais de estoque normal, baixo e esgotado

**Stack:**
- Frontend: HTML, CSS, JavaScript
- Desktop: [Tauri](https://tauri.app) (Rust)
- Banco de dados: SQLite via `better-sqlite3`

---

## Roadmap

### v1.1 — Estabilização
- [ ] Persistência de tags no banco de dados (atualmente descartadas no backend)
- [ ] Agrupamento de produtos por categoria além das tags
- [ ] Paginação no histórico de vendas

### v1.2 — Relatórios
- [ ] Exportação do histórico de vendas para CSV/Excel
- [ ] Gráfico de vendas por período
- [ ] Relatório de produtos com estoque crítico
- [ ] Filtros avançados no histórico (por data, status, produto)

### v2.0 — Integração Fiscal (lançamento comercial)
- [ ] Integração com API de emissão de Nota Fiscal Eletrônica (NF-e)
- [ ] Validação de NF em tempo real
- [ ] Armazenamento e consulta de notas emitidas
- [ ] Suporte a NFC-e (cupom fiscal para varejo)
- [ ] Configuração de dados da empresa emitente (CNPJ, IE, endereço)

### Futuro
- [ ] Múltiplos usuários com controle de acesso por perfil
- [ ] Modo multi-loja (sincronização entre unidades)
- [ ] App mobile companion para consulta de estoque

---

## Por que desktop e não web?

A maioria dos sistemas de gestão para pequenos comércios cobra mensalidade, exige internet estável e armazena dados do negócio em servidores de terceiros. StockFlow funciona offline, os dados ficam na máquina do próprio usuário, e o pagamento é único na compra da licença.

---

## Licença

Projeto proprietário — todos os direitos reservados.  
A versão demo disponível na web utiliza dados simulados e não representa o código de produção.
