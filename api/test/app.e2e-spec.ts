import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

// e2e de humo: la app levanta y responde el healthcheck (necesita mysql corriendo)
describe('Salud (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ??
      'mysql://root:root@localhost:3306/productos_test';
    process.env.PRECIO_USD = process.env.PRECIO_USD ?? '1400';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/salud (GET)', () => {
    return request(app.getHttpServer())
      .get('/salud')
      .expect(200)
      .expect({ estado: 'ok', baseDeDatos: 'ok' });
  });
});
