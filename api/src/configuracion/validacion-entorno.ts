import { z } from 'zod';

const esquemaEntorno = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),
  PRECIO_USD: z.coerce
    .number()
    .positive('PRECIO_USD debe ser un numero mayor a 0'),
  PORT: z.coerce.number().int().positive().default(3000),
});

export type Entorno = z.infer<typeof esquemaEntorno>;

// se corre antes de levantar Nest: si el entorno esta mal, la app no arranca
export function validarEntorno(): Entorno {
  const resultado = esquemaEntorno.safeParse(process.env);
  if (!resultado.success) {
    const detalle = resultado.error.issues
      .map((problema) => `${problema.path.join('.')}: ${problema.message}`)
      .join(' | ');
    throw new Error(`Entorno invalido -> ${detalle}`);
  }
  return resultado.data;
}
