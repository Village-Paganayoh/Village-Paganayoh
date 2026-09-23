# Arquitetura inicial da plataforma

Esta branch é o início da evolução do projeto Village Paganayoh para uma plataforma multiusuário e multi-imóvel.

## Princípios

- O site atual permanece preservado na branch `main`.
- Cada usuário poderá cadastrar um ou vários imóveis.
- Cada imóvel poderá operar como locação por temporada, locação anual ou ambos.
- Cada imóvel terá sua própria página pública.
- Fotos, vídeos, reservas, regras, FAQ, informações e calendário ficarão vinculados ao imóvel correto.
- O Village Paganayoh será o imóvel-piloto da migração.
- A estrutura deve servir tanto para web/PWA quanto para aplicativo mobile.

## Modalidades de locação

### Temporada
Calendário, reservas, disponibilidade, diária, mídia, página pública e sincronização externa.

### Anual
Locatários, contratos, valor mensal, vencimentos, caução, reajuste e cobranças.

A escolha da modalidade será feita por imóvel e a interface mostrará apenas os recursos pertinentes.

## Núcleo do produto

1. Conta do proprietário
2. Meus imóveis
3. Cadastro/edição de imóvel
4. Mídias
5. Reservas e disponibilidade
6. Regras e informações importantes
7. FAQ
8. Página pública automática
9. Compartilhamento por link
10. Futuramente: planos, assinatura, equipe, relatórios e marketplace

## Modelo de permissão

Um imóvel pode ter mais de um usuário associado:
- owner: proprietário
- manager: administrador/gestor
- staff: colaborador com acesso limitado

## Estratégia

A primeira etapa será montar o backend multi-tenant sem alterar o sistema de produção atual. Depois criaremos a interface do app e, por último, migraremos o Village como primeiro imóvel real.
