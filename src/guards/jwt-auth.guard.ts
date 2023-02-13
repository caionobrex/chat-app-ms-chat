import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('test');
    if (context.getType() === 'ws') {
      const request = context.switchToHttp().getRequest();
      const token = request.handshake.headers.authorization;
      if (!token || !this.jwtService.verify(token)) return false;
      return true;
    }
    return false;
  }
}
