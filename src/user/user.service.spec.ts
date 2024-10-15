// src/user/user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository, //  Мок TypeORM репозитория
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw if user exists', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce({} as User);
      await expect(
        service.register({
          username: 'test',
          email: 'test@test.com',
          password: 'password',
          age: 20,
          bio: 'Test user',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should hash password and save new user', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      const createSpy = jest
        .spyOn(repository, 'create')
        .mockReturnValue({} as User);
      const saveSpy = jest
        .spyOn(repository, 'save')
        .mockResolvedValue({ id: 1 } as User);
      const hashSpy = jest
        .spyOn(argon2, 'hash')
        .mockResolvedValueOnce('hashed_password');

      const userDto = {
        username: 'test',
        email: 'test@test.com',
        password: 'password',
        age: 20,
        bio: 'Test user',
      };

      const result = await service.register(userDto);

      expect(hashSpy).toHaveBeenCalledWith('password');
      expect(createSpy).toHaveBeenCalledWith({
        ...userDto,
        password: 'hashed_password',
      });
      expect(saveSpy).toHaveBeenCalled();
      expect(result.id).toEqual(1);
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      const user = { username: 'test' } as User;
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(user);

      const result = await service.findByUsername('test');
      expect(result).toEqual(user);
    });
  });

  describe('updateUser', () => {
    it('should throw if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.updateUser(1, {})).rejects.toThrow(
        NotFoundException
      );
    });

    it('should update user and save changes', async () => {
      const user = { id: 1, username: 'test' } as User;
      const saveSpy = jest.spyOn(repository, 'save').mockResolvedValue(user);
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);

      const result = await service.updateUser(1, { username: 'updated' });
      expect(saveSpy).toHaveBeenCalled();
      expect(result.username).toEqual('updated');
    });
  });

  describe('deleteUser', () => {
    it('should throw if user not found', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 0 });
      await expect(service.deleteUser(1)).rejects.toThrow(NotFoundException);
    });

    it('should delete user if found', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 });
      await expect(service.deleteUser(1)).resolves.toBeUndefined();
    });
  });
});
