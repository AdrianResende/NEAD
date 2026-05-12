-- CreateTable
CREATE TABLE "chamado_mensagens" (
    "id" SERIAL NOT NULL,
    "chamado_id" INTEGER NOT NULL,
    "autor_id" INTEGER NOT NULL,
    "mensagem" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chamado_mensagens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chamado_mensagens" ADD CONSTRAINT "chamado_mensagens_chamado_id_fkey" FOREIGN KEY ("chamado_id") REFERENCES "chamados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamado_mensagens" ADD CONSTRAINT "chamado_mensagens_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
