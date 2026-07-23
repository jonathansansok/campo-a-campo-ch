import { validarEntorno } from './validacion-entorno';

describe('validarEntorno', () => {
  const entornoOriginal = process.env;

  beforeEach(() => {
    process.env = {
      ...entornoOriginal,
      DATABASE_URL: 'mysql://test:test@localhost:3306/test',
      PRECIO_USD: '1400',
    };
  });

  afterAll(() => {
    process.env = entornoOriginal;
  });

  it('devuelve el entorno parseado cuando todo esta bien', () => {
    const entorno = validarEntorno();

    expect(entorno.PRECIO_USD).toBe(1400);
    expect(entorno.PORT).toBe(3000);
  });

  it('falla si falta PRECIO_USD', () => {
    delete process.env.PRECIO_USD;

    expect(() => validarEntorno()).toThrow(/PRECIO_USD/);
  });

  it('falla si PRECIO_USD no es un numero', () => {
    process.env.PRECIO_USD = 'mil cuatrocientos';

    expect(() => validarEntorno()).toThrow(/PRECIO_USD/);
  });

  it('falla si PRECIO_USD es cero o negativo', () => {
    process.env.PRECIO_USD = '0';

    expect(() => validarEntorno()).toThrow(/mayor a 0/);
  });

  it('falla si falta DATABASE_URL', () => {
    delete process.env.DATABASE_URL;

    expect(() => validarEntorno()).toThrow(/DATABASE_URL/);
  });
});
