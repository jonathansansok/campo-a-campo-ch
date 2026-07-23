import { Module } from '@nestjs/common';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductosModule } from './productos/productos.module';
import { SaludModule } from './salud/salud.module';

@Module({
  imports: [PrismaModule, ProductosModule, SaludModule, NotificacionesModule],
})
export class AppModule {}
