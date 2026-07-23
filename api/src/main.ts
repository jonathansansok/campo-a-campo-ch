import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
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

  await app.listen(entorno.PORT);
}
bootstrap();
