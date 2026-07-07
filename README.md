# 🥗 NutriFlow AI

Sistema de gestão nutricional hospitalar com inteligência artificial — trabalho de
extensão interdisciplinar (PEI) que une prontuário clínico, fluxo de cozinha em
tempo real e geração de dietas por IA num único fluxo: **médico → nutricionista →
cozinha → paciente**.

🔗 **Demo ao vivo:** [nutriflow-main.vercel.app](https://nutriflow-main.vercel.app)

## O que o sistema faz

- **Prontuário clínico completo** — condições médicas, medicamentos em uso,
  alergias (a medicamentos e alimentares), tipo de dieta prescrita e classificação
  de risco nutricional.
- **Geração de dieta com IA** — monta o cardápio do dia com base apenas no que
  existe no estoque da cozinha, respeitando o quadro clínico do paciente
  (alergias, restrições, tipo de dieta). Funciona mesmo offline, com um gerador
  clínico local de reserva caso a IA não esteja disponível.
- **Cozinha em tempo real** — acompanhamento do preparo e entrega de cada
  refeição (Pendente → Em Preparo → Pronta → Entregue/Recusada).
- **Controle de estoque** com alerta de itens vencidos ou a vencer.
- **Feedback de aceitação alimentar** por refeição.
- **Painel de usuários e permissões** por papel.
- **Tema claro/escuro**, navegação totalmente acessível por teclado e menu
  mobile dedicado.

## Papéis do sistema

| Papel | Pode fazer |
|---|---|
| **Administrador** | Acesso total ao sistema |
| **Médico** | Cadastra/edita pacientes, dá alta, registra feedback |
| **Nutricionista** | Cria, edita e aprova planos alimentares (com IA) |
| **Enfermeiro** | Registra feedback de aceitação alimentar |
| **Cozinheiro** | Controla estoque e status de preparo/entrega das refeições |
| **Paciente** | Acompanha o próprio plano do dia e envia feedback |

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. O app é **self-contained para demonstração**:
os dados e as contas de login já vêm prontos (localStorage), sem precisar de
banco de dados configurado. Na tela de login, use os atalhos de "Acesso rápido"
para entrar direto com qualquer papel (qualquer senha é aceita).

### Outros comandos

```bash
npm run build      # build de produção
npm run test       # testes (Vitest)
```

## Stack técnica

- **React 19** + **TanStack Start** (SSR) + **TanStack Router**
- **TypeScript** estrito
- **Tailwind CSS v4** + CSS próprio (tema claro/escuro, glassmorfismo)
- **Vite** + **Nitro** (empacotamento para deploy na Vercel)
- **lucide-react** para ícones
- IA de dieta via **API do Gemini** (Google), chamada só em servidor

## Equipe

- Alvino Mainette Santos
- Amanda Marcarini Cezanhock
- Jordana Wantil Tomazeli
- Leonarda Candal de Carvalho
- Ronald Cussati Cesar da Fonseca
- Thalys Cestari Thouzo

---

Projeto acadêmico desenvolvido para a disciplina de Prática de Extensão
Interdisciplinar (PEI).
