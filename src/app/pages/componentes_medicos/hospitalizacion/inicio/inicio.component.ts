import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../../../services/login.service';
import { Router } from '@angular/router';
import { MenuHospitalizacionComponent } from '../../../../componentes_reutilizables/menu_izq/menu.component';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule, FormsModule, MenuHospitalizacionComponent],
  templateUrl: './inicio.component.html',
  styles: ``,
})
export class InicioComponent {
  private _loginService = inject(LoginService);
  public _routerService = inject(Router);
  hcu: any;
  constructor() {
    this.hcu=this._loginService.getHcuLocalStorage();
  }
}
