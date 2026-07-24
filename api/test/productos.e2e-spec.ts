import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { FiltroExcepciones } from './../src/comunes/filtros/filtro-excepciones';
import { PrismaService } from './../src/prisma/prisma.service';

// CRUD completo contra una base mysql de prueba (productos_test).
// Antes de correr: levantar la base y aplicar las migraciones (ver README).
describe('Productos (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ??
      'mysql://root:root@localhost:3306/productos_test';
    process.env.PRECIO_USD = '1400';
    delete process.env.RABBITMQ_URL;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // misma config que main.ts, sin esto no se pueden probar los 400 de validacion
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new FiltroExcepciones());
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.producto.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /productos crea y devuelve el precio en dolares', async () => {
    const res = await request(app.getHttpServer())
      .post('/productos')
      .send({
        nombre: 'Alambre de campo',
        descripcion: 'Rollo de 500 metros',
        precio: 35000,
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.nombre).toBe('Alambre de campo');
    expect(res.body.precio).toBe(35000);
    expect(res.body.precio_usd).toBe(25);
    expect(res.body.created_at).toBeDefined();
    expect(res.body.updated_at).toBeDefined();
  });

  it('POST /productos rechaza un body sin nombre', async () => {
    const res = await request(app.getHttpServer())
      .post('/productos')
      .send({ precio: 100 })
      .expect(400);

    expect(res.body.statusCode).toBe(400);
    expect(res.body.message.join(' ')).toContain('nombre');
  });

  it('POST /productos rechaza precio negativo', () => {
    return request(app.getHttpServer())
      .post('/productos')
      .send({ nombre: 'Tranquera', precio: -50 })
      .expect(400);
  });

  it('POST /productos rechaza campos que no son del dto', () => {
    return request(app.getHttpServer())
      .post('/productos')
      .send({ nombre: 'Tranquera', precio: 50, precio_usd: 1 })
      .expect(400);
  });

  it('GET /productos lista paginado', async () => {
    for (let i = 1; i <= 12; i++) {
      await prisma.producto.create({
        data: { nombre: `Producto ${i}`, precio: 100 * i },
      });
    }

    const res = await request(app.getHttpServer())
      .get('/productos?page=2&limit=5')
      .expect(200);

    expect(res.body.total).toBe(12);
    expect(res.body.pagina).toBe(2);
    expect(res.body.totalPaginas).toBe(3);
    expect(res.body.datos).toHaveLength(5);
    expect(res.body.datos[0].precio_usd).toBeDefined();
  });

  it('GET /productos/:id devuelve el detalle con ambos precios', async () => {
    const creado = await prisma.producto.create({
      data: { nombre: 'Postes de quebracho', precio: 7000 },
    });

    const res = await request(app.getHttpServer())
      .get(`/productos/${creado.id}`)
      .expect(200);

    expect(res.body.nombre).toBe('Postes de quebracho');
    expect(res.body.precio).toBe(7000);
    expect(res.body.precio_usd).toBe(5);
  });

  it('GET /productos/:id da 404 si no existe', async () => {
    const res = await request(app.getHttpServer())
      .get('/productos/999999')
      .expect(404);

    expect(res.body.message).toContain('999999');
  });

  it('GET /productos/:id da 400 si el id no es numerico', () => {
    return request(app.getHttpServer()).get('/productos/abc').expect(400);
  });

  it('PUT /productos/:id actualiza y recalcula el precio en dolares', async () => {
    const creado = await prisma.producto.create({
      data: { nombre: 'Molino', precio: 1400 },
    });

    const res = await request(app.getHttpServer())
      .put(`/productos/${creado.id}`)
      .send({ precio: 2800 })
      .expect(200);

    expect(res.body.nombre).toBe('Molino');
    expect(res.body.precio).toBe(2800);
    expect(res.body.precio_usd).toBe(2);
  });

  it('PUT /productos/:id da 404 si no existe', () => {
    return request(app.getHttpServer())
      .put('/productos/999999')
      .send({ precio: 10 })
      .expect(404);
  });

  it('DELETE /productos/:id borra y el detalle pasa a dar 404', async () => {
    const creado = await prisma.producto.create({
      data: { nombre: 'Bebedero', precio: 500 },
    });

    const res = await request(app.getHttpServer())
      .delete(`/productos/${creado.id}`)
      .expect(204);
    expect(res.body).toEqual({});

    await request(app.getHttpServer())
      .get(`/productos/${creado.id}`)
      .expect(404);
  });

  it('DELETE /productos/:id da 404 si no existe', () => {
    return request(app.getHttpServer()).delete('/productos/999999').expect(404);
  });
});
