import { Module } from '@nestjs/common';
import { EventosModule } from '../eventos/eventos.module';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';

@Module({
  imports: [EventosModule],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}
