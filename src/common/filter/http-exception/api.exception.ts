import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '../../enums/api-error-code.enum';

export class ApiException extends HttpException {
  private errorMessage: string;
  private errorCode: ApiErrorCode;
    /**
     * @param errorMessage - 错误信息
     * @param errorCode - 错误码
     * @param statusCode - HTTP状态码(默认为200)
     */
  constructor(
    errorMessage: string,
    errorCode: ApiErrorCode,
    statusCode: HttpStatus = HttpStatus.OK,
  ) {
    super(errorMessage, statusCode);
    this.errorMessage = errorMessage;
    this.errorCode = errorCode;
  }

  getErrorCode(): ApiErrorCode {
    return this.errorCode;
  }

  getErrorMessage(): string {
    return this.errorMessage;
  }
}