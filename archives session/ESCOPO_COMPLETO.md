# NutriFlow AI — Escopo Completo do Projeto

> Documento gerado em 2026-07-05 para a disciplina PAI (Prática de Extensão Interdisciplinar).
> Serve como escopo de produto + técnico e como material de apoio para a apresentação.

## 1. Contexto e objetivo

Trabalho de extensão interdisciplinar de faculdade: construir um sistema baseado em
inteligência artificial para uso hospitalar, que gera **prescrições/planos alimentares
personalizados para pacientes internados** usando IA, dentro de um fluxo real de trabalho
hospitalar (médico → nutricionista → cozinha → paciente).

O projeto nasceu da combinação de duas referências:
- **Base44** (https://maiskicepei.base44.app/) — protótipo mostrando o conceito de gestão
  nutricional hospitalar com IA gerando/validando/acompanhando planos alimentares.
- **Protótipo próprio** (https://github.com/ronald-cussati/nutriflow /
  https://ronald-cussati.github.io/nutriflow/) — um app completo em um único `index.html`
  (sem backend real, dados em localStorage), já com 5 papéis de usuário, CRUD de pacientes,
  planos alimentares, fluxo de cozinha, estoque e feedbacks.

O objetivo desta etapa foi unir os dois conceitos numa aplicação real (com backend, banco de
dados, autenticação e IA de verdade), pronta para apresentação e para deploy na Vercel.

## 2. Papéis de usuário (personas)

| Papel | O que faz no sistema |
|---|---|
| **Médico** | Cadastra/edita pacientes, dá alta médica, gerencia usuários |
| **Nutricionista** | Cria/edita planos alimentares, usa a IA para gerar sugestões, aprova planos |
| **Enfermeiro** | Registra feedback de aceitação alimentar dos pacientes |
| **Cozinheiro** | Controla estoque de ingredientes, atualiza status de preparo/entrega das refeições |
| **Admin** | Acesso total: gerencia usuários, pacientes, planos, tudo |
| **Paciente** *(novo, adicionado nesta etapa)* | Vê o próprio plano alimentar aprovado do dia e envia feedback sobre as refeições |

## 3. Funcionalidades por tela

- **Dashboard** — estatísticas gerais (pacientes internados, planos aprovados/rascunho,
  refeições do dia, itens em estoque) + lista de alertas recentes. Visível para
  médico/nutricionista/enfermeiro/admin.
- **Pacientes** — lista com busca, abas "Internados" / "Histórico e Alta", cadastro
  (nome, idade, quarto, sexo, condições médicas, restrições alimentares, notas), edição,
  alta médica, e modal de detalhe mostrando o plano alimentar vigente.
- **Planos Alimentares** — um plano por paciente com 6 refeições (café da manhã, lanche da
  manhã, almoço, lanche da tarde, jantar, ceia), status Rascunho/Aprovado, botão
  **"Gerar com IA"** que chama o Gemini com os dados clínicos do paciente + estoque
  disponível e preenche as 6 refeições automaticamente para revisão da nutricionista.
- **Cozinha** — painel com os pacientes internados e chips de status por refeição
  (Pendente → Em Preparo → Pronta → Entregue), com destaque visual da janela de horário de
  cada refeição (ex: almoço 11h–13h30).
- **Estoque** — CRUD de ingredientes (nome, quantidade, unidade, validade), com destaque
  visual para itens vencidos/a vencer.
- **Feedbacks** — registro de aceitação alimentar por refeição (nota de 1 a 5 estrelas +
  observações), visível para toda a equipe.
- **Usuários** — CRUD de contas do sistema (nome, email, senha, papel). Ao criar um usuário
  do tipo *paciente*, vincula-o a um registro de paciente existente sem login.
- **Meu Plano** *(exclusivo do papel paciente)* — mostra o plano alimentar aprovado do dia
  e permite enviar feedback diretamente sobre as próprias refeições.

## 4. Arquitetura técnica

- **Frontend:** React 19 + TanStack Start (SSR) + TanStack Router, Tailwind CSS v4 para o
  restante do app scaffold, mais um CSS próprio (`src/nutriflow.css`) reaproveitando
  integralmente o tema visual escuro do protótipo original (paleta hospitalar dark, cards,
  badges, modais, chips de cozinha).
- **Backend:** Supabase (Postgres + Auth). Projeto dedicado, isolado de outros produtos do
  autor.
- **IA:** integração com a **API do Gemini** (Google), chamada exclusivamente a partir de
  uma *server function* do TanStack Start — a chave de API nunca é exposta ao navegador
  (diferente do protótipo original, que chamava a API de IA direto do client, sem chave
  configurada).
- **Autenticação/autorização:** Supabase Auth (email/senha) + tabela `profiles` guardando o
  papel de cada usuário. Row Level Security (RLS) habilitada em todas as tabelas, com uma
  função auxiliar `current_role()` usada nas políticas.
- **Deploy:** Vercel (ainda não realizado nesta etapa — ver seção de pendências).

## 5. Modelo de dados

Tabelas (ver detalhes completos e SQL em `supabase/migrations/0001_init.sql`):

- `profiles` — id (= auth.users.id), nome, papel
- `patients` — dados clínicos e demográficos do paciente + `user_id` opcional (login do
  próprio paciente)
- `meal_plans` — status (Rascunho/Aprovado) + refeições em JSON
- `daily_meals` — instância diária de cada refeição, com status de preparo/entrega
- `stock` — ingredientes disponíveis no mês
- `feedbacks` — avaliações de aceitação alimentar
- `alerts` — eventos do sistema (novo paciente, plano aprovado, alta, etc.)

Regras de acesso (resumo): a equipe (médico/nutricionista/enfermeiro/cozinheiro/admin)
enxerga os dados operacionais conforme a tela em que está; o paciente só enxerga os
próprios dados, vinculados via `patients.user_id = auth.uid()`.

## 6. Fluxo principal (ponta a ponta)

1. Médico ou admin cadastra um paciente → sistema cria automaticamente um plano alimentar
   em rascunho e um alerta.
2. Nutricionista abre o plano do paciente e clica em "Gerar com IA" → a IA recebe idade,
   sexo, condições médicas, restrições alimentares, notas e o estoque disponível, e devolve
   uma sugestão para as 6 refeições do dia.
3. Nutricionista revisa/ajusta o texto gerado e aprova o plano → o sistema gera
   automaticamente as 6 refeições do dia na tela da Cozinha, com status "Pendente".
4. Cozinheiro acompanha os horários de cada refeição e vai avançando o status
   (Pendente → Em Preparo → Pronta → Entregue) conforme prepara e entrega.
5. Enfermeiro (ou o próprio paciente, pela tela "Meu Plano") registra o feedback de
   aceitação de cada refeição.
6. Médico/admin acompanha tudo pelo Dashboard e pode dar alta ao paciente quando apropriado
   (isso volta o plano para rascunho, encerrando o ciclo).

## 7. Segurança

- Nenhuma chave de API (Supabase service role, Gemini) é exposta no navegador — todas ficam
  em variáveis de ambiente do servidor, usadas apenas dentro de *server functions*.
- RLS habilitada em 100% das tabelas do banco.
- `.env` real nunca é commitado (está no `.gitignore`); `.env.example` documenta as
  variáveis esperadas sem valores.
- Chaves reais que passaram pelo histórico do chat (Supabase e Gemini) devem ser
  **rotacionadas** após o projeto estabilizar, por precaução — ver seção 9.

## 8. Fora do escopo desta etapa (por causa do prazo curto)

- Múltiplos hospitais/tenants
- Recuperação de senha por e-mail
- Notificações em tempo real (o app usa polling simples, herdado do protótipo original)
- Suíte de testes automatizados abrangente
- Otimização de performance/bundle (o build atual já funciona, mas não foi otimizado)

## 9. Pendências / próximos passos

1. **Rodar a migration SQL** (`supabase/migrations/0001_init.sql`) no SQL Editor do projeto
   Supabase — ainda não foi feito até o momento deste documento.
2. **Criar o primeiro usuário admin** — como o banco começa vazio, é necessário um bootstrap
   manual. Duas formas:
   - Rodar `node --env-file=.env scripts/bootstrap-admin.mjs "Nome" email senha` (script já
     pronto no repositório, faz tudo automaticamente via API do Supabase); ou
   - Criar manualmente pelo painel Supabase (Authentication → Add user) e inserir a linha
     correspondente em `profiles` via SQL Editor.
3. **Testar o app localmente** (`npm run dev`, http://localhost:3000) logando com esse
   admin e criando os demais usuários de teste pela tela Usuários.
4. **Deploy na Vercel** — conectar o repositório GitHub, configurar as variáveis de
   ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`) no painel do projeto Vercel, e publicar.
5. **Push para o GitHub** — o repositório local já tem o remote `origin` configurado e
   commits prontos, mas o push ainda não foi feito (aguardando autorização explícita).
6. **Rotacionar as chaves** de Supabase (service role) e Gemini depois da apresentação,
   já que passaram pelo histórico da conversa.

## 10. Onde encontrar cada coisa no repositório

- Design técnico detalhado: `docs/superpowers/specs/2026-07-05-nutriflow-ai-design.md`
- Schema SQL: `supabase/migrations/0001_init.sql`
- App React: `src/components/nutriflow/` (painéis em `panels/`, modais na raiz da pasta)
- Camada de acesso a dados: `src/lib/api.ts`
- Server functions (IA e criação de usuários): `src/server/mealPlan.ts`, `src/server/users.ts`
- Script de bootstrap do admin: `scripts/bootstrap-admin.mjs`
- Protótipo original (referência): `index.html` (mantido no repo só como histórico/referência)
