import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProductosModule } from './productos/productos.module';
import { SaludModule } from './salud/salud.module';

@Module({
  imports: [PrismaModule, ProductosModule, SaludModule],
})
export class AppModule {}
