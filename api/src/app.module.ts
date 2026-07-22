import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductosModule } from './productos/productos.module';

@Module({
  imports: [PrismaModule, ProductosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
