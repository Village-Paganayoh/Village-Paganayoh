-- =====================================================
-- TEMPORADA DIRETA - DETALHES DO IMÓVEL
-- Migration 002
-- =====================================================

ALTER TABLE imoveis ADD COLUMN endereco TEXT;
ALTER TABLE imoveis ADD COLUMN bairro TEXT;
ALTER TABLE imoveis ADD COLUMN cep TEXT;
ALTER TABLE imoveis ADD COLUMN capacidade INTEGER;
ALTER TABLE imoveis ADD COLUMN quartos INTEGER;
ALTER TABLE imoveis ADD COLUMN suites INTEGER;
ALTER TABLE imoveis ADD COLUMN banheiros INTEGER;
ALTER TABLE imoveis ADD COLUMN vagas INTEGER;
ALTER TABLE imoveis ADD COLUMN latitude REAL;
ALTER TABLE imoveis ADD COLUMN longitude REAL;
