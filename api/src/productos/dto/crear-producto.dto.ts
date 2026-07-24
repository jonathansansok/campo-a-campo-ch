import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearProductoDto {
  @ApiProperty({ example: 'Alambre de campo', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @ApiPropertyOptional({ example: 'Rollo de 500 metros', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiProperty({
    example: 35000,
    description: 'Precio en pesos, hasta 2 decimales',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  precio: number;
}
