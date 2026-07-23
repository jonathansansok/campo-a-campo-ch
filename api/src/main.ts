import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
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
    }),
  );
  app.useGlobalFilters(new FiltroExcepciones());

  await app.listen(entorno.PORT);
}
bootstrap();
