-- CreateTable
CREATE TABLE "chamado_anexos" (
    "id" SERIAL NOT NULL,
    "chamado_id" INTEGER NOT NULL,
    "nome_original" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "tamanho_bytes" INTEGER NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chamado_anexos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chamado_anexos" ADD CONSTRAINT "chamado_anexos_chamado_id_fkey" FOREIGN KEY ("chamado_id") REFERENCES "chamados"("id") ON DELETE CASCADE ON UPDATE CASCADE;
