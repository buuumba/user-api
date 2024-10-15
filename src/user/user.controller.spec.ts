import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            register: jest.fn(),
            findByUsername: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
            getAllUsers: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call UserService register method', async () => {
      const createUserDto: CreateUserDto = {
        username: 'test',
        email: 'test@test.com',
        password: 'password',
        age: 20,
        bio: 'Test bio',
      };

      await controller.register(createUserDto);
      expect(service.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  // допилить оставшиеся тесты по аналогии ...
});
