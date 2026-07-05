# Handoff — como retomar este projeto em uma nova sessão do Claude Code

> Se você abriu uma nova sessão/janela do Claude Code para continuar este projeto, cole o
> conteúdo deste arquivo (ou só o caminho dele) na primeira mensagem. Ele te dá o contexto
> completo sem precisar reconstruir nada.

## Estado no momento em que este arquivo foi gerado (2026-07-05)

- Repositório: `C:\Users\Ronald Cussati\Desktop\nutriflow-main\nutriflow-main`
- Branch local: `main`, commits:
  - `a9e9fcf` — scaffold do projeto + spec de design + schema Supabase
  - `a17aaa0` — implementação completa do app React + Supabase + Gemini
- Remote `origin` configurado para `https://github.com/ronald-cussati/nutriflow.git`
  (branch remota `main` só tem o commit antigo do `index.html`; **nenhum push foi feito
  ainda** dos commits acima — precisa de autorização explícita do Ronald antes de fazer
  push, e as histórias são não-relacionadas então provavelmente vai precisar de
  `--force-with-lease` ou similar, combinar com ele antes).
- Prazo: apresentação da faculdade em ~2026-07-07 (2 dias a partir de 2026-07-05).

## O que já está pronto

Ver `ESCOPO_COMPLETO.md` (neste mesmo diretório) para o escopo completo do produto.
Resumo técnico:

- App React completo em `src/components/nutriflow/`, ligado ao Supabase via
  `src/lib/api.ts` e `src/lib/supabaseClient.ts`.
- Autenticação/contexto em `src/lib/authContext.tsx`.
- Server functions (rodam só no servidor, usam chaves secretas):
  `src/server/mealPlan.ts` (Gemini) e `src/server/users.ts` (criação/edição/remoção de
  usuários via service_role key do Supabase).
- Schema SQL completo com RLS em `supabase/migrations/0001_init.sql` (cópia em
  `0001_init.sql` nesta mesma pasta).
- `npm run build` e `npx tsc --noEmit` passam limpos. `npm run dev` sobe e faz SSR
  corretamente (testado nesta sessão).

## Atualização (mesmo dia, 2026-07-05, depois do handoff original)

- ✅ **Migration rodada** — Ronald confirmou que já executou `0001_init.sql` no SQL Editor
  do Supabase. Todas as tabelas e RLS já existem no banco real.
- ✅ **Admin criado** — rodei `scripts/bootstrap-admin.mjs` com sucesso para o email
  `ronaldcussati@gmail.com` (senha definida por ele na hora, não repetida aqui por
  segurança — ele sabe qual é). UID: `fdf80f35-2b84-4189-a627-98ed6280103a`.
- ✅ **Dev server testado rodando** (`npm run dev`, http://localhost:3000, HTTP 200,
  SSR conectado) e Ronald foi orientado a testar o login e as telas manualmente no
  navegador (cadastrar paciente de teste, tentar "Gerar com IA" em Planos Alimentares,
  criar os demais usuários pela tela Usuários). **Ainda não recebi confirmação dele sobre
  como foi esse teste manual** — se retomar a sessão, pergunte como foi antes de assumir
  que está tudo funcionando ponta a ponta (a integração do Gemini em particular ainda não
  foi validada com uso real, só revisada no código).

## Bloqueios pendentes (o que ainda falta)

1. ~~Rodar a migration~~ — **feito**.
2. ~~Criar o primeiro admin~~ — **feito** (ver acima).
3. **Validar manualmente no navegador** que login, CRUD de pacientes, geração de plano via
   IA (Gemini), fluxo de cozinha, estoque, feedbacks e a tela "Meu Plano" (paciente)
   funcionam de ponta a ponta com o banco real — só foi validado que o servidor sobe e
   responde HTTP 200, não que cada fluxo funciona.
4. **Deploy na Vercel ainda não foi feito.** Precisa da autorização/login do Ronald quando
   chegar a hora, e configurar lá as mesmas variáveis de ambiente do `.env`.
5. **Push para o GitHub ainda não foi feito** (remote configurado, commits prontos
   localmente, aguardando autorização explícita — histórias não-relacionadas entre local e
   remoto, avaliar `--force-with-lease` ou similar ao combinar com o Ronald).
6. **Rotacionar as chaves** de Supabase (service role) e Gemini depois que o projeto
   estabilizar, já que passaram pelo histórico do chat.

## Credenciais

Ficam em `.env` (na raiz do projeto, **não commitado**, já no `.gitignore`):
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`. Veja `env.example.txt` nesta pasta (ou
`.env.example` na raiz) para saber quais variáveis existem, sem os valores reais.

**Atenção:** as chaves reais (Supabase service role e Gemini) foram coladas diretamente no
chat pelo Ronald em algum momento desta sessão — ou seja, já ficaram registradas no
histórico da conversa. Vale sugerir a ele rotacionar essas chaves depois que o projeto
estabilizar (painel do Supabase → Settings → API; Google AI Studio para o Gemini).

## Projeto Supabase

- Project ref: `ezvcpvlsdmhbrkqnzgyp`
- URL: `https://ezvcpvlsdmhbrkqnzgyp.supabase.co`
- **Não está acessível via as ferramentas MCP do Supabase conectadas a esta sessão** (fica
  em conta/organização diferente da que a integração enxerga — só aparece o projeto
  "supabase saas" do Ronald, que é de outro produto e NÃO deve ser reaproveitado aqui).
  Qualquer alteração de schema precisa ser entregue como arquivo SQL para ele rodar
  manualmente, não dá pra aplicar direto via MCP.

## Como retomar

1. Pergunte ao Ronald se ele já rodou a migration e criou o primeiro admin (itens 1 e 2
   acima). Se não, oriente ele a fazer isso (ou rode o script de bootstrap se ele já tiver
   rodado a migration).
2. Depois disso, rode `npm run dev` e valide o login e as telas por papel.
3. Quando ele confirmar que está tudo certo, os próximos passos são: push pro GitHub
   (com autorização) e deploy na Vercel (com autorização, configurando as env vars lá).
4. Consulte `docs/superpowers/specs/2026-07-05-nutriflow-ai-design.md` para qualquer
   dúvida sobre decisões de arquitetura já tomadas — evite redecidir coisas que já foram
   acordadas com o Ronald nesta sessão (papéis, modelo de dados, escopo cortado por causa
   do prazo).
