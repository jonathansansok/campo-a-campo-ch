import { PartialType } from '@nestjs/swagger';
import { CrearProductoDto } from './crear-producto.dto';

// PartialType de swagger: hereda validaciones y ademas documenta los campos en /docs
export class ActualizarProductoDto extends PartialType(CrearProductoDto) {}
