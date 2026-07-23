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

  // el consumer de eventos escucha en la misma app. Si rabbit esta caido la
  // api levanta igual: la mensajeria es una integracion no critica
  try {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [entorno.RABBITMQ_URL],
        queue: 'notificaciones_productos',
        queueOptions: { durable: true },
      },
    });
    await app.startAllMicroservices();
  } catch (motivo) {
    new Logger('Bootstrap').warn(
      `Sin conexion con rabbit, la api arranca sin eventos: ${(motivo as Error).message}`,
    );
  }

  await app.listen(entorno.PORT);
}
bootstrap();
