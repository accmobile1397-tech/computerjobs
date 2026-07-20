export class NotificationGatewayError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "NotificationGatewayError";
  }
}
