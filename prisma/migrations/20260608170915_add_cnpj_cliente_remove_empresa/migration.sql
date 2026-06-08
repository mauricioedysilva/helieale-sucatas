/*
  Warnings:

  - You are about to drop the `Empresa` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "cnpj" TEXT;

-- DropTable
DROP TABLE "Empresa";
