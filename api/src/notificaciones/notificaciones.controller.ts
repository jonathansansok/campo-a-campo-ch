import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

// Consumer de los eventos de productos. Aca solo se loguea, pero es el lugar
// donde colgaria un downstream real (auditoria, sincronizacion de catalogo).
@Controller()
export class NotificacionesController {
  private readonly logger = new Logger('Notificaciones');

  @EventPattern('producto.creado')
  productoCreado(@Payload() datos: Record<string, unknown>) {
    this.logger.log(`Producto creado: ${JSON.stringify(datos)}`);
  }

  @EventPattern('producto.actualizado')
  productoActualizado(@Payload() datos: Record<string, unknown>) {
    this.logger.log(`Producto actualizado: ${JSON.stringify(datos)}`);
  }

  @EventPattern('producto.eliminado')
  productoEliminado(@Payload() datos: Record<string, unknown>) {
    this.logger.log(`Producto eliminado: ${JSON.stringify(datos)}`);
  }
}
