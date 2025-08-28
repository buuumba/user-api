import { HttpException, HttpStatus } from "@nestjs/common";

export class JwtConfigException extends HttpException {
  constructor() {
    super(
      "JWT configuration error: SECRET is not defined",
      HttpStatus.UNAUTHORIZED,
    );
  }
}
