import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class UserMatchGuard implements CanActivate {
    canActivate(context: ExecutionContext)  {
        const request = context.switchToHttp().getRequest()
        const id = request.params.id;
        const user = request.user;

        if (!user || !user.id) {
            throw new UnauthorizedException('User not found in the request.')
        }

        if (user.id !== Number(id)) {
            throw new ForbiddenException(
                'You are not allowed to perform this operation'
            );
        }

        return true;
    }
}