import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { obtenerEntorno } from '../configuracion/validacion-entorno';
import { PublicadorEventos } from './publicador-eventos';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'COLA_PRODUCTOS',
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [obtenerEntorno().RABBITMQ_URL],
            queue: 'notificaciones_productos',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  providers: [PublicadorEventos],
  exports: [PublicadorEventos],
})
export class EventosModule {}
