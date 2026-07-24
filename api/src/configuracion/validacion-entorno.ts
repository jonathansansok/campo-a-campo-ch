import { z } from 'zod';

const esquemaEntorno = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),
  PRECIO_USD: z.coerce
    .number()
    .positive('PRECIO_USD debe ser un numero mayor a 0'),
  PORT: z.coerce.number().int().positive().default(3000),
  // opcional: sin RABBITMQ_URL la mensajeria queda deshabilitada
  RABBITMQ_URL: z.string().optional(),
});

export type Entorno = z.infer<typeof esquemaEntorno>;

let entornoValidado: Entorno | undefined;

// se corre antes de levantar Nest: si el entorno esta mal, la app no arranca
export function validarEntorno(): Entorno {
  const resultado = esquemaEntorno.safeParse(process.env);
  if (!resultado.success) {
    const detalle = resultado.error.issues
      .map((problema) => `${problema.path.join('.')}: ${problema.message}`)
      .join(' | ');
    throw new Error(`Entorno invalido -> ${detalle}`);
  }
  entornoValidado = resultado.data;
  return entornoValidado;
}

// para leer el entorno ya validado desde cualquier lado sin volver a parsear
export function obtenerEntorno(): Entorno {
  return entornoValidado ?? validarEntorno();
}
