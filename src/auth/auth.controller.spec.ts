import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return error if credentials are invalid', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      const result = await controller.login({
        username: 'test',
        password: 'wrong_password',
      });

      expect(result).toEqual({ error: 'Invalid credentials' });
      expect(service.validateUser).toHaveBeenCalledWith(
        'test',
        'wrong_password'
      );
    });

    it('should return token if credentials are valid', async () => {
      const user = { username: 'test', id: 1 };
      jest.spyOn(service, 'validateUser').mockResolvedValue(user);
      jest.spyOn(service, 'login').mockResolvedValue({ access_token: 'token' });

      const result = await controller.login({
        username: 'test',
        password: 'password',
      });

      expect(result).toEqual({ access_token: 'token' });
      expect(service.login).toHaveBeenCalledWith(user);
    });
  });
});
