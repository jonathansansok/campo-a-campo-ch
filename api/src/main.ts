import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { FiltroExcepciones } from './comunes/filtros/filtro-excepciones';
import { validarEntorno } from './configuracion/validacion-entorno';

async function bootstrap() {
  const entorno = validarEntorno();

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new FiltroExcepciones());

  const configDocs = new DocumentBuilder()
    .setTitle('API de Productos')
    .setDescription(
      'CRUD de productos con precio en pesos y su equivalente en dolares',
    )
    .setVersion('1.0')
    .build();
  const documento = SwaggerModule.createDocument(app, configDocs);
  SwaggerModule.setup('docs', app, documento);

  // el consumer de eventos escucha en la misma app solo si hay broker
  // configurado. El arranque no se espera: con rabbit caido el server RMQ
  // reintenta para siempre y bloquearia el listen. Mensajeria no critica.
  if (entorno.RABBITMQ_URL) {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [entorno.RABBITMQ_URL],
        queue: 'notificaciones_productos',
        queueOptions: { durable: true },
      },
    });
    app.startAllMicroservices().catch((motivo: Error) => {
      new Logger('Bootstrap').warn(
        `Sin conexion con rabbit, la api sigue sin eventos: ${motivo.message}`,
      );
    });
  }

  await app.listen(entorno.PORT);
}
bootstrap();
