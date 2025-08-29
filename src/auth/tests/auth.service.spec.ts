import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";

describe("AuthService", () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByUsername: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateUser", () => {
    it("should return null if user is not found", async () => {
      jest.spyOn(userService, "findByUsername").mockResolvedValue(null);
      const result = await service.validateUser("test", "password");
      expect(result).toBeNull();
    });

    it("should return null if password is incorrect", async () => {
      const user = { username: "test", password: "hashed_password" };
      jest.spyOn(userService, "findByUsername").mockResolvedValue(user as any);
      jest.spyOn(argon2, "verify").mockResolvedValue(false);
      const result = await service.validateUser("test", "wrong_password");
      expect(result).toBeNull();
    });

    it("should return user without password if password is correct", async () => {
      const user = { id: 1, username: "test", password: "hashed_password" };
      jest.spyOn(userService, "findByUsername").mockResolvedValue(user as any);
      jest.spyOn(argon2, "verify").mockResolvedValue(true);

      const result = await service.validateUser("test", "password");
      expect(result).toEqual({ id: 1, username: "test" });
    });
  });

  describe("login", () => {
    it("should return access token", async () => {
      const user = { id: 1, username: "test" };
      jest.spyOn(jwtService, "sign").mockReturnValue("token");

      const result = await service.login(user);
      expect(result).toEqual({ access_token: "token" });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: "test",
        sub: 1,
      });
    });
  });
});
