-- =====================================================
-- PLATAFORMA MULTIUSUÁRIO / MULTI-IMÓVEL
-- Estrutura inicial - não aplicar ainda no banco de produção
-- =====================================================

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  senha_hash TEXT,
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS imoveis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  cidade TEXT,
  estado TEXT,
  pais TEXT NOT NULL DEFAULT 'Brasil',
  endereco_publico TEXT,
  latitude REAL,
  longitude REAL,
  capacidade INTEGER,
  quartos INTEGER,
  suites INTEGER,
  banheiros INTEGER,
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
  papel TEXT NOT NULL DEFAULT 'owner',
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, imovel_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (imovel_id) REFERENCES imoveis(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS imovel_midias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  imovel_id INTEGER NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'imagem',
  categoria TEXT,
  titulo TEXT,
  legenda TEXT,
  url TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (imovel_id) REFERENCES imoveis(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS imovel_reservas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  imovel_id INTEGER NOT NULL,
  hospede_nome TEXT,
  hospede_telefone TEXT,
  data_inicio TEXT NOT NULL,
  data_fim TEXT NOT NULL,
  origem TEXT NOT NULL DEFAULT 'direta',
  status TEXT NOT NULL DEFAULT 'confirmada',
  observacoes TEXT,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (imovel_id) REFERENCES imoveis(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS imovel_regras (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  imovel_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  icone TEXT,
  destaque INTEGER NOT NULL DEFAULT 0,
  ativo INTEGER NOT NULL DEFAULT 1,
  ordem INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (imovel_id) REFERENCES imoveis(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS imovel_informacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  imovel_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  icone TEXT,
  destaque INTEGER NOT NULL DEFAULT 0,
  ativo INTEGER NOT NULL DEFAULT 1,
  ordem INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (imovel_id) REFERENCES imoveis(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS imovel_faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  imovel_id INTEGER NOT NULL,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  palavras_chave TEXT,
  destaque INTEGER NOT NULL DEFAULT 0,
  ativo INTEGER NOT NULL DEFAULT 1,
  ordem INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (imovel_id) REFERENCES imoveis(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usuarios_imoveis_usuario ON usuarios_imoveis(usuario_id, ativo);
CREATE INDEX IF NOT EXISTS idx_usuarios_imoveis_imovel ON usuarios_imoveis(imovel_id, ativo);
CREATE INDEX IF NOT EXISTS idx_imovel_midias ON imovel_midias(imovel_id, ativo, ordem);
CREATE INDEX IF NOT EXISTS idx_imovel_reservas_datas ON imovel_reservas(imovel_id, data_inicio, data_fim, status);
CREATE INDEX IF NOT EXISTS idx_imovel_regras ON imovel_regras(imovel_id, ativo, ordem);
CREATE INDEX IF NOT EXISTS idx_imovel_informacoes ON imovel_informacoes(imovel_id, ativo, ordem);
CREATE INDEX IF NOT EXISTS idx_imovel_faqs ON imovel_faqs(imovel_id, ativo, ordem);
