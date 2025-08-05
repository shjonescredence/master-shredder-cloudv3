// Express type augmentation for req/res if needed
import type { Request, Response } from 'express';

declare global {
  // eslint-disable-next-line no-var
  var expressRequest: Request;
  // eslint-disable-next-line no-var
  var expressResponse: Response;
}
