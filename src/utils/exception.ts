import ErrorResponse from "./errorResponse";

export class BadRequestException extends ErrorResponse {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

export class UnauthorizedException extends ErrorResponse {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenException extends ErrorResponse {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class ConflictException extends ErrorResponse {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

export class NotFoundException extends ErrorResponse {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

export class InternalServerErrorException extends ErrorResponse {
  constructor(message = "Internal Server Error") {
    super(message, 500);
  }
}
