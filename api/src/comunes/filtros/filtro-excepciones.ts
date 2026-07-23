import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class FiltroExcepciones implements ExceptionFilter {
  private readonly logger = new Logger(FiltroExcepciones.name);

  catch(excepcion: unknown, host: ArgumentsHost) {
    const respuesta = host.switchToHttp().getResponse<Response>();

    if (excepcion instanceof HttpException) {
      const estado = excepcion.getStatus();
      const cuerpo = excepcion.getResponse();
      respuesta
        .status(estado)
        .json(
          typeof cuerpo === 'string'
            ? { statusCode: estado, message: cuerpo }
            : cuerpo,
        );
      return;
    }

    // errores no controlados: log completo puertas adentro, respuesta generica afuera
    this.logger.error(
      excepcion instanceof Error ? excepcion.stack : String(excepcion),
    );
    respuesta.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor',
    });
  }
}
