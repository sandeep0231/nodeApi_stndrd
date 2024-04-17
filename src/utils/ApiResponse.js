class ApiResponse {
  constructor(statusCode,data,message="success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.statusCode = statusCode<400; // true if the status code is under 4
  }
}
export {ApiResponse}
