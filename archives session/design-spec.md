# NutriFlow AI — Design (React + Supabase enxuto)

Contexto: trabalho de extensão interdisciplinar (PAI) — sistema de gestão nutricional hospitalar
com IA. Une o conceito do protótipo Base44 (https://maiskicepei.base44.app/) com o app já existente
neste repositório (`index.html`, single-file, localStorage). Apresentação em ~2 dias a partir de
2026-07-05, então o escopo é deliberadamente mínimo viável.

## Arquitetura

- **Frontend:** scaffold TanStack Start (React 19) já presente em `src/`, Tailwind v4. Rotas
  protegidas por papel via `beforeLoad` (redireciona quem não tem permissão para a rota).
- **Backend:** Supabase (Postgres + Auth), projeto dedicado `ezvcpvlsdmhbrkqnzgyp` — não reaproveita
  o projeto Supabase existente do Ronald (que já roda outro SaaS em produção).
- **IA:** server function do TanStack Start (`generateMealPlan`) chama a API do **Gemini** com a
  chave em variável de ambiente do servidor (`GEMINI_API_KEY`) — nunca exposta no navegador. Corrige
  a falha do protótipo original, que chamava a API de IA direto do client sem chave.
- **Deploy:** Vercel, usando o adapter TanStack Start → Vercel.

## Modelo de dados

Ver `supabase/migrations/0001_init.sql` para o SQL completo. Tabelas: `profiles`, `patients`,
`meal_plans`, `daily_meals`, `stock`, `feedbacks`, `alerts`. RLS habilitada em todas, com uma função
`current_role()` (security definer) usada nas políticas para checar o papel do usuário logado via
`profiles`.

## Papéis

Seis papéis: `medico`, `nutricionista`, `enfermeiro`, `cozinheiro`, `admin`, `paciente` (novo). Login
de staff/paciente é criado pelo admin/médico via painel "Usuários", que por baixo chama uma server
function usando a `service_role` key do Supabase (só no servidor) para criar o usuário de Auth e a
linha em `profiles` (e, no caso de paciente, vincular `patients.user_id`).

Regras de acesso (refletidas nas políticas RLS):
- Staff (medico/nutricionista/enfermeiro/cozinheiro/admin) enxerga todos os pacientes/planos/refeições/estoque/feedbacks conforme a tela.
- `paciente` só enxerga os próprios dados (via `patients.user_id = auth.uid()`) e pode registrar seu
  próprio feedback.

## Páginas por papel

Herdadas do `index.html` atual: Dashboard, Pacientes, Planos Alimentares (com "Gerar com IA"
funcional de verdade), Cozinha (fluxo Pendente → Em Preparo → Pronta → Entregue), Estoque,
Feedbacks, Usuários. Nova página **"Meu Plano"**, exclusiva do papel `paciente`: mostra o plano
aprovado do dia e um formulário de feedback sobre as refeições.

## Fora do escopo (por causa do prazo)

Multi-hospital/tenant, recuperação de senha, notificações em tempo real (mantém polling simples como
no protótipo), suíte de testes automatizados abrangente. Foco: os 6 papéis funcionando ponta a ponta
+ geração de plano por IA de verdade, publicado na Vercel.

## Credenciais e segredos

`.env` local (gitignorado) contém `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`. `.env.example` documenta as chaves sem valores.
Essas mesmas variáveis precisam ser configuradas no painel da Vercel antes do deploy.
