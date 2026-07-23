import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ProductosService } from './productos.service';

describe('ProductosService', () => {
  let servicio: ProductosService;

  const prismaFalso = {
    producto: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const productoBase = {
    id: 1,
    nombre: 'Alambre de campo',
    descripcion: null,
    precio: 35000,
    creadoEn: new Date('2026-07-20'),
    actualizadoEn: new Date('2026-07-20'),
  };

  beforeAll(() => {
    process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test';
    process.env.PRECIO_USD = '1400';
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const modulo = await Test.createTestingModule({
      providers: [
        ProductosService,
        { provide: PrismaService, useValue: prismaFalso },
      ],
    }).compile();

    servicio = modulo.get(ProductosService);
  });

  describe('calculo de precio_usd', () => {
    it('divide el precio en pesos por la cotizacion', async () => {
      prismaFalso.producto.findUnique.mockResolvedValue(productoBase);

      const resultado = await servicio.buscarPorId(1);

      expect(resultado.precio_usd).toBe(25);
    });

    it('redondea a 2 decimales', async () => {
      prismaFalso.producto.findUnique.mockResolvedValue({
        ...productoBase,
        precio: 9999.99,
      });

      const resultado = await servicio.buscarPorId(1);

      // 9999.99 / 1400 = 7.14285 -> 7.14
      expect(resultado.precio_usd).toBe(7.14);
    });
  });

  describe('listar', () => {
    it('devuelve datos paginados con el total de paginas', async () => {
      prismaFalso.producto.findMany.mockResolvedValue([productoBase]);
      prismaFalso.producto.count.mockResolvedValue(23);

      const resultado = await servicio.listar({ page: 2, limit: 10 });

      expect(prismaFalso.producto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
      expect(resultado.total).toBe(23);
      expect(resultado.pagina).toBe(2);
      expect(resultado.totalPaginas).toBe(3);
      expect(resultado.datos[0].precio_usd).toBe(25);
    });

    it('usa pagina 1 y limite 10 si no llegan parametros', async () => {
      prismaFalso.producto.findMany.mockResolvedValue([]);
      prismaFalso.producto.count.mockResolvedValue(0);

      await servicio.listar({});

      expect(prismaFalso.producto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });
  });

  describe('buscarPorId', () => {
    it('tira 404 si el producto no existe', async () => {
      prismaFalso.producto.findUnique.mockResolvedValue(null);

      await expect(servicio.buscarPorId(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('crear', () => {
    it('guarda el producto y devuelve la respuesta con precio_usd', async () => {
      prismaFalso.producto.create.mockResolvedValue(productoBase);

      const resultado = await servicio.crear({
        nombre: 'Alambre de campo',
        precio: 35000,
      });

      expect(prismaFalso.producto.create).toHaveBeenCalledWith({
        data: { nombre: 'Alambre de campo', precio: 35000 },
      });
      expect(resultado.precio_usd).toBe(25);
    });
  });

  describe('actualizar', () => {
    it('tira 404 si el producto a actualizar no existe', async () => {
      prismaFalso.producto.findUnique.mockResolvedValue(null);

      await expect(servicio.actualizar(99, { precio: 1 })).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaFalso.producto.update).not.toHaveBeenCalled();
    });

    it('actualiza cuando el producto existe', async () => {
      prismaFalso.producto.findUnique.mockResolvedValue(productoBase);
      prismaFalso.producto.update.mockResolvedValue({
        ...productoBase,
        precio: 42000,
      });

      const resultado = await servicio.actualizar(1, { precio: 42000 });

      expect(resultado.precio_usd).toBe(30);
    });
  });

  describe('eliminar', () => {
    it('borra el producto existente', async () => {
      prismaFalso.producto.findUnique.mockResolvedValue(productoBase);
      prismaFalso.producto.delete.mockResolvedValue(productoBase);

      await servicio.eliminar(1);

      expect(prismaFalso.producto.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('no intenta borrar si el producto no existe', async () => {
      prismaFalso.producto.findUnique.mockResolvedValue(null);

      await expect(servicio.eliminar(99)).rejects.toThrow(NotFoundException);
      expect(prismaFalso.producto.delete).not.toHaveBeenCalled();
    });
  });
});
