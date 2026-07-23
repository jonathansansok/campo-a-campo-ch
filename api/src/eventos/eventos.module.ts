import { Module } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { EMPTY } from 'rxjs';
import { obtenerEntorno } from '../configuracion/validacion-entorno';
import { PublicadorEventos } from './publicador-eventos';

// Sin RABBITMQ_URL la mensajeria queda apagada: se inyecta un cliente nulo y
// los eventos se descartan en silencio. Permite correr la api en entornos sin
// broker (por ejemplo un deploy en la nube) sin tocar el resto del codigo.
const fabricaClienteCola = (): ClientProxy => {
  const url = obtenerEntorno().RABBITMQ_URL;
  if (!url) {
    return { emit: () => EMPTY } as unknown as ClientProxy;
  }
  return ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: [url],
      queue: 'notificaciones_productos',
      queueOptions: { durable: true },
    },
  });
};

@Module({
  providers: [
    { provide: 'COLA_PRODUCTOS', useFactory: fabricaClienteCola },
    PublicadorEventos,
  ],
  exports: [PublicadorEventos],
})
export class EventosModule {}
