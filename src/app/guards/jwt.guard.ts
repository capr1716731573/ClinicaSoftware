import { inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class JwtGuard implements CanActivate {
  private _router = inject(Router);
  private _tokenAdminService = inject(LoginService);
  constructor() {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const token = this._tokenAdminService.getLoginLocalStorage();
    //console.log(token);
    if (this._tokenAdminService.validarExpiracionToken(token)) {
      return true;
    } else {
      this._tokenAdminService.logout();
      this._router.navigateByUrl('/login');
      return false;
    }
  }
}
