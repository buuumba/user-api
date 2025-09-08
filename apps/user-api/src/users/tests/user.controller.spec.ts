import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../users.controller';
import { UserService } from '../users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';

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

  describe('getProfile', () => {
    it('should return user profile for the authenticated user', async () => {
      const req = { user: { username: 'test' } };
      const user = { id: 1, username: 'test', email: 'test@test.com' };

      jest.spyOn(service, 'findByUsername').mockResolvedValue(user);

      const result = await controller.getProfile(req);
      expect(service.findByUsername).toHaveBeenCalledWith('test');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const req = { user: { username: 'test' } };
      jest.spyOn(service, 'findByUsername').mockResolvedValue(null);

      await expect(controller.getProfile(req)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const req = { user: { userId: 1 } };
      const updateUserDto: UpdateUserDto = { username: 'updatedUser' };
      const updatedUser = { id: 1, username: 'updatedUser' };

      jest.spyOn(service, 'updateUser').mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(req, updateUserDto);
      expect(service.updateUser).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteProfile', () => {
    it('should delete user profile', async () => {
      const req = { user: { userId: 1 } };
      jest.spyOn(service, 'deleteUser').mockResolvedValue();

      await expect(controller.deleteProfile(req)).resolves.toBeUndefined();
      expect(service.deleteUser).toHaveBeenCalledWith(1);
    });
  });

  describe('getAllUsers', () => {
    it('should return users with pagination', async () => {
      const users = [{ id: 1, username: 'test' }];
      const result = { total: 1, page: 1, limit: 10, data: users };

      jest.spyOn(service, 'getAllUsers').mockResolvedValue(result);

      const page = 1;
      const limit = 10;
      const response = await controller.getAllUsers(page, limit);

      expect(service.getAllUsers).toHaveBeenCalledWith(page, limit, undefined);
      expect(response).toEqual(result);
    });

    it('should return filtered users by username', async () => {
      const users = [{ id: 1, username: 'test' }];
      const result = { total: 1, page: 1, limit: 10, data: users };

      jest.spyOn(service, 'getAllUsers').mockResolvedValue(result);

      const page = 1;
      const limit = 10;
      const username = 'test';
      const response = await controller.getAllUsers(page, limit, username);

      expect(service.getAllUsers).toHaveBeenCalledWith(page, limit, username);
      expect(response).toEqual(result);
    });
  });
});
