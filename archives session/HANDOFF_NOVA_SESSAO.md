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

## Bloqueios pendentes (o que NÃO foi possível fazer sozinho)

1. **A migration SQL ainda não foi rodada no banco Supabase real.** Confirmado nesta sessão
   com uma query de teste (`select id from profiles limit 1` retornou
   "Could not find the table 'public.profiles'"). O Claude não tem acesso MCP a esse
   projeto Supabase específico (fica em uma organização/conta que a ferramenta MCP
   conectada não enxerga — `get_project`/`execute_sql` retornam "permission denied").
   **Ação necessária do Ronald:** copiar o conteúdo de `0001_init.sql` (nesta pasta ou em
   `supabase/migrations/0001_init.sql`) no SQL Editor do painel Supabase e rodar.

2. **Nenhum usuário existe ainda no Supabase Auth desse projeto**, então ninguém consegue
   logar no app até existir pelo menos 1 admin. Depois que a migration acima rodar, use o
   script pronto:
   ```
   node --env-file=.env scripts/bootstrap-admin.mjs "Nome do Ronald" email@exemplo.com senha123
   ```
   Esse script usa a `SUPABASE_SERVICE_ROLE_KEY` do `.env` para criar o usuário de auth E a
   linha correspondente em `profiles` com papel `admin`, tudo em um comando.

3. **Deploy na Vercel ainda não foi feito.** Precisa da autorização/login do Ronald quando
   chegar a hora.

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
