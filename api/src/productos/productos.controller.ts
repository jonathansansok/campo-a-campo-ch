import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { PaginacionDto } from './dto/paginacion.dto';
import { ProductosService } from './productos.service';

@ApiTags('productos')
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista paginada de productos' })
  listar(@Query() paginacion: PaginacionDto) {
    return this.productosService.listar(paginacion);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un producto' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'No existe el producto' })
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.buscarPorId(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crea un producto' })
  @ApiResponse({ status: 201, description: 'Producto creado' })
  @ApiResponse({ status: 400, description: 'Datos invalidos' })
  crear(@Body() dto: CrearProductoDto) {
    return this.productosService.crear(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualiza un producto' })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  @ApiResponse({ status: 404, description: 'No existe el producto' })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarProductoDto,
  ) {
    return this.productosService.actualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Elimina un producto' })
  @ApiResponse({ status: 204, description: 'Producto eliminado' })
  @ApiResponse({ status: 404, description: 'No existe el producto' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.eliminar(id);
  }
}
