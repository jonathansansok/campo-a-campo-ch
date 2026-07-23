import { Test } from '@nestjs/testing';
import { throwError } from 'rxjs';
import { PublicadorEventos } from './publicador-eventos';

describe('PublicadorEventos', () => {
  let publicador: PublicadorEventos;

  const clienteFalso = { emit: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const modulo = await Test.createTestingModule({
      providers: [
        PublicadorEventos,
        { provide: 'COLA_PRODUCTOS', useValue: clienteFalso },
      ],
    }).compile();

    publicador = modulo.get(PublicadorEventos);
  });

  it('emite el evento con la fecha agregada', () => {
    clienteFalso.emit.mockReturnValue({ subscribe: jest.fn() });

    publicador.publicar('producto.creado', { id: 1, nombre: 'Alambre' });

    expect(clienteFalso.emit).toHaveBeenCalledWith(
      'producto.creado',
      expect.objectContaining({ id: 1, nombre: 'Alambre' }),
    );
  });

  it('no explota si el broker rechaza el mensaje', () => {
    clienteFalso.emit.mockReturnValue(
      throwError(() => new Error('broker caido')),
    );

    expect(() =>
      publicador.publicar('producto.creado', { id: 1 }),
    ).not.toThrow();
  });

  it('no explota si emit tira una excepcion directa', () => {
    clienteFalso.emit.mockImplementation(() => {
      throw new Error('sin conexion');
    });

    expect(() =>
      publicador.publicar('producto.eliminado', { id: 2 }),
    ).not.toThrow();
  });
});
