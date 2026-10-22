import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from '../../users/schemas/user.schema';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserDocument | null => {
    const request = ctx.switchToHttp().getRequest<{ user?: UserDocument }>();
    return request.user || null;
  },
);
