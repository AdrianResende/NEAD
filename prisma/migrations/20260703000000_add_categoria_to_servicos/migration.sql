-- Add categoria field to servicos for service grouping
ALTER TABLE "servicos"
  ADD COLUMN "categoria" VARCHAR(100);
