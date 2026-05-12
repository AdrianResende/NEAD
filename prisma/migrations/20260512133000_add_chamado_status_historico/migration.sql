-- CreateTable
CREATE TABLE "chamado_status_historico" (
    "id" SERIAL NOT NULL,
    "chamado_id" INTEGER NOT NULL,
    "de_status" TEXT NOT NULL,
    "para_status" TEXT NOT NULL,
    "autor_id" INTEGER,
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chamado_status_historico_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chamado_status_historico" ADD CONSTRAINT "chamado_status_historico_chamado_id_fkey" FOREIGN KEY ("chamado_id") REFERENCES "chamados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamado_status_historico" ADD CONSTRAINT "chamado_status_historico_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
