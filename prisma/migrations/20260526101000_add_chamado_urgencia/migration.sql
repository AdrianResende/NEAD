-- Add urgency fields to chamados
ALTER TABLE "chamados"
  ADD COLUMN "urgente" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "urgencia_descricao" TEXT;
