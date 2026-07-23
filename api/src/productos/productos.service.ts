import { Injectable, NotFoundException } from '@nestjs/common';
import { Producto } from '@prisma/client';
import { obtenerEntorno } from '../configuracion/validacion-entorno';
import { PublicadorEventos } from '../eventos/publicador-eventos';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { PaginacionDto } from './dto/paginacion.dto';

@Injectable()
export class ProductosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventos: PublicadorEventos,
  ) {}

  async listar(paginacion: PaginacionDto) {
    const { page = 1, limit = 10 } = paginacion;
    const [productos, total] = await Promise.all([
      this.prisma.producto.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.producto.count(),
    ]);

    return {
      datos: productos.map((p) => this.conPrecioUsd(p)),
      total,
      pagina: page,
      totalPaginas: Math.ceil(total / limit),
    };
  }

  async buscarPorId(id: number) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) {
      throw new NotFoundException(`No existe un producto con id ${id}`);
    }
    return this.conPrecioUsd(producto);
  }

  async crear(dto: CrearProductoDto) {
    const creado = await this.prisma.producto.create({ data: dto });
    this.eventos.publicar('producto.creado', {
      id: creado.id,
      nombre: creado.nombre,
    });
    return this.conPrecioUsd(creado);
  }

  async actualizar(id: number, dto: ActualizarProductoDto) {
    const existente = await this.prisma.producto.findUnique({ where: { id } });
    if (!existente) {
      throw new NotFoundException(
        `El producto ${id} no se encuentra en la base`,
      );
    }
    const actualizado = await this.prisma.producto.update({
      where: { id },
      data: dto,
    });
    this.eventos.publicar('producto.actualizado', {
      id: actualizado.id,
      nombre: actualizado.nombre,
    });
    return this.conPrecioUsd(actualizado);
  }

  async eliminar(id: number) {
    const producto = await this.buscarPorId(id);
    await this.prisma.producto.delete({ where: { id } });
    this.eventos.publicar('producto.eliminado', {
      id: producto.id,
      nombre: producto.nombre,
    });
  }

  private conPrecioUsd(producto: Producto) {
    const cotizacion = obtenerEntorno().PRECIO_USD;
    // Decimal de prisma -> number, y el precio en dolares con 2 decimales
    const precio = Number(producto.precio);
    return {
      ...producto,
      precio,
      precio_usd: Number((precio / cotizacion).toFixed(2)),
    };
  }
}
