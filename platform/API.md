# API inicial do app

Base prevista: Cloudflare Worker próprio da plataforma.

## Autenticação

### POST /auth/register
Cria usuário.

Body:
```json
{
  "nome":"Carlos",
  "email":"carlos@exemplo.com",
  "telefone":"71999999999",
  "senha":"senha-segura"
}
```

### POST /auth/login
Autentica e devolve token de sessão.

### POST /auth/logout
Revoga a sessão atual.

## Imóveis

### GET /app/imoveis
Lista apenas os imóveis aos quais o usuário autenticado tem acesso.

### POST /app/imoveis
Cria imóvel e vincula o usuário como `owner`.

Campos iniciais:
- nome
- slug
- cidade
- estado
- tipo_locacao: `temporada`, `anual` ou `ambos`

### GET /app/imoveis/{id}
Retorna o imóvel somente se o usuário possuir vínculo ativo.

### PUT /app/imoveis/{id}
Atualiza o imóvel respeitando permissões.

## Segurança

Todas as rotas `/app/*` exigem sessão válida. O backend nunca deve confiar em um `usuario_id` ou `imovel_id` enviado pelo cliente sem validar a associação em `usuarios_imoveis`.
