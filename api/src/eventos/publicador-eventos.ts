import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

// Unico punto de contacto con rabbit. Si el broker esta caido, el evento se
// pierde y queda un warning: la api nunca tiene que fallar por mensajeria.
@Injectable()
export class PublicadorEventos {
  private readonly logger = new Logger(PublicadorEventos.name);

  constructor(
    @Inject('COLA_PRODUCTOS') private readonly cliente: ClientProxy,
  ) {}

  publicar(evento: string, datos: Record<string, unknown>) {
    try {
      this.cliente
        .emit(evento, { ...datos, fecha: new Date().toISOString() })
        .subscribe({
          error: (motivo: Error) =>
            this.logger.warn(
              `No se pudo publicar ${evento}: ${motivo.message}`,
            ),
        });
    } catch (motivo) {
      this.logger.warn(
        `No se pudo publicar ${evento}: ${(motivo as Error).message}`,
      );
    }
  }
}
