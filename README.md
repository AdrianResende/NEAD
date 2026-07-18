# NEAD - Sistema de Gestão de Chamados

## 1. Objetivo deste documento
Este README foi escrito para servir como handoff completo para design de produto/UI.
Ele descreve contexto do sistema, usuários, regras de negócio, fluxos, telas, dados e restrições.

Use este documento como base para pedir ao Claude:
- Redesign visual completo
- Definição de design system
- Propostas de UX para desktop e mobile
- Melhoria de legibilidade, hierarquia e estados de interface

## 2. Visão geral do produto
NEAD é um sistema interno de atendimento por chamados.

A aplicação permite:
- Cadastro e gestão de usuários
- Organização por setores e serviços
- Abertura e acompanhamento de chamados
- Atribuição de chamados para atendentes
- Conversa e anexos dentro de cada chamado
- Controle de status e histórico de atendimento

## 3. Público e perfis de acesso
### 3.1 Admin
Responsabilidades:
- Gerenciar usuários
- Gerenciar setores
- Gerenciar serviços
- Vincular atendentes a serviços
- Acompanhar e atuar em chamados
- Reatribuir atendente em chamados

### 3.2 Atendente
Responsabilidades:
- Atender chamados dos serviços aos quais está vinculado
- Atualizar status do chamado
- Conversar no chamado

Restrições:
- Só enxerga/interage em chamados dos serviços vinculados
- Não pode cancelar/fechar chamado (isso é do solicitante)

### 3.3 Solicitante
Responsabilidades:
- Abrir chamados
- Acompanhar seus chamados
- Enviar mensagens e anexos
- Cancelar, fechar ou reabrir chamado

Restrições:
- Só vê os próprios chamados

## 4. Regras de negócio críticas
### 4.1 Senha obrigatória no primeiro acesso
- Usuário nasce com mustChangePassword = true
- Após login, se mustChangePassword estiver ativo, é redirecionado para alterar senha
- Enquanto não trocar senha, rotas protegidas ficam bloqueadas (exceto login e alterar-senha)
- Ao alterar senha com sucesso, mustChangePassword vira false

### 4.2 Regra de vínculos no cadastro de usuários
- Solicitante: não possui setor obrigatório e não exige serviços
- Admin: pode ter setor e serviços, mas não é obrigatório
- Atendente: setor e serviço são obrigatórios

Observação técnica:
- O vínculo real de atuação do atendente é pela tabela de relação user <-> servico
- setor_id do usuário é usado como setor principal (quando houver)

### 4.3 Regras de chamados
- Solicitante abre chamado com título, descrição, urgência e serviço
- Pode anexar até 5 arquivos por chamado
- Tipos permitidos: PDF, PNG, JPG, JPEG, WEBP
- Limite por arquivo: 5 MB
- Se urgente = sim, justificativa de urgência é obrigatória

### 4.4 Atribuição automática de atendente
Ao abrir chamado:
- Se houver atendentes vinculados ao serviço, o sistema atribui automaticamente
- Primeira atribuição de um serviço: aleatória
- Próximas: rotação round-robin entre vinculados

### 4.5 Status de chamado
Status possíveis:
- aberto
- atribuido
- em_andamento
- resolvido
- fechado
- cancelado

Permissões de mudança:
- Solicitante: cancelar, fechar, reabrir (voltar para aberto)
- Atendente/Admin: aberto, atribuido, em_andamento, resolvido
- Somente admin pode alterar atendente atribuído

### 4.6 Fechamento automático
- Chamados resolvidos há 15 dias são fechados automaticamente
- O sistema registra histórico dessa transição

## 5. Arquitetura e stack
### 5.1 Stack principal
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma ORM
- PostgreSQL
- Vitest

### 5.2 Autenticação e sessão
- Login por credenciais (email/senha)
- Sessão persistida por cookie HTTP-only
- Tabela de sessões no banco
- Middleware de proteção de rotas

### 5.3 UI atual
- Componentes UI próprios em components/ui
- Layout com Header + Sidebar + conteúdo
- Navegação adaptada por perfil
- Tema claro/escuro disponível

## 6. Inventário de telas para redesign
### 6.1 Login
Rota: /login

Elementos atuais:
- Campo de e-mail
- Campo de senha
- Botão entrar
- Link cadastrar

Sugestões de foco de redesign:
- Melhor hierarquia visual
- Clareza de feedback de erro
- Identidade visual institucional

### 6.2 Alterar senha obrigatória
Rota: /alterar-senha

Elementos atuais:
- Senha atual
- Nova senha
- Confirmar senha
- Validações em tempo de submissão

### 6.3 Cadastro de usuários
Rota: /cadastro

Elementos atuais:
- Lista de usuários com busca e paginação
- Abas de ativos e desativados
- Modal de criação de usuário
- Modal de edição de perfil
- Modal de ativar/desativar

Regras UX importantes:
- Campos dinâmicos por perfil (solicitante/admin/atendente)
- Atendente exige setor e serviço
- Solicitante não exibe campos de setor/serviço

### 6.4 Gestão de setores
Rota: /admin/setores

Elementos atuais:
- Lista de setores
- Criar, editar e excluir setor
- Contadores de usuários e serviços por setor

### 6.5 Gestão de serviços por setor
Rota: /admin/setores/[id]/servicos

Elementos atuais:
- Lista de serviços do setor
- Criar, editar, excluir serviço
- Vincular/remover atendentes por serviço

### 6.6 Lista de chamados
Rota: /chamados

Varia por perfil:
- Solicitante: Meus Chamados + botão Solicitar Serviço
- Atendente/Admin: Chamados operacionais

Elementos atuais:
- Cards mobile
- Tabela desktop
- Status badge
- Prioridade badge
- Paginação

### 6.7 Novo chamado
Rota: /chamados/novo

Elementos atuais:
- Título
- Descrição
- Urgente (sim/não)
- Justificativa de urgência (condicional)
- Setor -> serviço
- Upload de anexos múltiplos

### 6.8 Detalhe do chamado
Rota: /chamados/[id]

Elementos atuais:
- Resumo do chamado
- Ações de status (por papel)
- Atribuição de atendente (admin)
- Painel de conversa
- Upload de anexo em mensagem
- Timeline de histórico de status

## 7. Navegação por perfil
### 7.1 Admin
Menu:
- Usuários
- Setores
- Chamados

### 7.2 Atendente
Menu:
- Chamados

### 7.3 Solicitante
Menu:
- Meus Chamados

## 8. Modelo de dados (resumo)
Entidades principais:
- User
- Setor
- Servico
- AtendenteServico (N:N entre user e servico)
- Chamado
- ChamadoMensagem
- ChamadoAnexo
- ChamadoStatusHistorico
- Session
- Account

Relações centrais:
- Setor 1:N Servico
- Setor 1:N User (setor principal opcional)
- User N:N Servico (atendente_servicos)
- Chamado pertence a Servico
- Chamado pertence a Solicitante (User)
- Chamado pode ter Atendente (User)
- Chamado possui mensagens, anexos e histórico

## 9. Endpoints e ações relevantes
### 9.1 API
- POST /api/auth/login
- POST /api/auth/logout
- /api/auth/[...nextauth] (integração NextAuth)

### 9.2 Server actions
- app/cadastro/actions.ts
- app/admin/setores/actions.ts
- app/admin/servicos/actions.ts
- app/chamados/novo/actions.ts
- app/chamados/[id]/actions.ts
- app/alterar-senha/actions.ts

## 10. Estrutura de pastas (alto nível)
- app: rotas, páginas e server actions
- components: layout, providers, UI compartilhada
- lib: auth, permissões, navegação, utilitários
- prisma: schema, migrations e seed
- public/uploads/chamados: anexos dos chamados

## 11. Setup de desenvolvimento
### 11.1 Pré-requisitos
- Node.js 20+
- PostgreSQL
- npm

### 11.2 Variáveis de ambiente (.env)
Mínimo necessário:
- DATABASE_URL
- DIRECT_URL
- NODE_ENV
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_ANEXOS_BUCKET (opcional, default `chamados-anexos`)

Ver `.env.example` para o formato completo. Os anexos de chamados são enviados para um
bucket do Supabase Storage (necessário em produção, já que a Vercel roda com filesystem
somente-leitura).

### 11.3 Instalação
1. npm install
2. npx prisma migrate dev
3. npx prisma db seed
4. npm run dev

### 11.4 Scripts úteis
- npm run dev
- npm run build
- npm run start
- npm run lint
- npm run test
- npm run prisma:generate
- npm run prisma:migrate
- npm run prisma:studio

Credencial seed inicial:
- email: admin@nead.com
- senha: admin123
- exige troca de senha no primeiro login

## 12. Estados e feedbacks de UX que o design deve cobrir
- Loading de formulários
- Erro de validação de campo
- Erro de permissão
- Lista vazia
- Upload inválido
- Sucesso de operação (toast)
- Bloqueio de acesso por sessão expirada

## 13. Requisitos para o redesign (pedido para Claude)
### 13.1 Objetivo
Criar uma nova experiência visual e de usabilidade para todo o sistema, preservando as regras de negócio e permissões atuais.

### 13.2 Entregáveis esperados
- Design system (cores, tipografia, espaçamentos, componentes e estados)
- Propostas de layout desktop e mobile
- Prototipação das telas principais
- Especificação de componentes reutilizáveis
- Guia de interação para modais, tabelas, filtros, formulários e timeline

### 13.3 Restrições funcionais
- Não alterar regras de permissão por perfil
- Não remover campos obrigatórios de fluxo
- Não quebrar lógica de status de chamado
- Não quebrar fluxo de troca de senha obrigatória

### 13.4 Prioridades de melhoria
1. Clareza visual e hierarquia
2. Produtividade em fluxos de atendimento
3. Facilidade de uso em mobile
4. Padronização de componentes
5. Acessibilidade e contraste

## 14. Checklist de validação pós-design
- O usuário entende claramente o que pode fazer no próprio perfil
- Os fluxos críticos têm caminho curto (abrir chamado, atualizar status, responder)
- Mensagens de erro e sucesso são visíveis e compreensíveis
- Tabelas e cards têm leitura rápida
- Formulários possuem validações claras
- A experiência mobile está completa e consistente

## 15. Observações finais
Se este documento for enviado para gerar proposta visual por IA, peça explicitamente:
- Mapa de telas
- Fluxo de navegação por perfil
- Variações de componentes com estados
- Sugestão de tokens de design
- Plano de implementação incremental no front-end
