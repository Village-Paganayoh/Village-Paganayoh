-- TEMPORADA DIRETA - FUNDAÇÃO DA PLATAFORMA
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  senha_hash TEXT NOT NULL,
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS imoveis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tipo_locacao TEXT NOT NULL DEFAULT 'temporada'
    CHECK (tipo_locacao IN ('temporada','anual','ambos')),
  cidade TEXT,
  estado TEXT,
  pais TEXT NOT NULL DEFAULT 'Brasil',
  descricao TEXT,
  telefone_contato TEXT,
  whatsapp_contato TEXT,
  publicado INTEGER NOT NULL DEFAULT 0,
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios_imoveis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  imovel_id INTEGER NOT NULL,
  papel TEXT NOT NULL DEFAULT 'owner'
    CHECK (papel IN ('owner','manager','staff')),
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, imovel_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (imovel_id) REFERENCES imoveis(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessoes_usuario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expira_em TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_uso_em TEXT,
  revogada_em TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_imoveis_usuario ON usuarios_imoveis(usuario_id, ativo);
CREATE INDEX IF NOT EXISTS idx_usuarios_imoveis_imovel ON usuarios_imoveis(imovel_id, ativo);
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario ON sessoes_usuario(usuario_id, expira_em);
