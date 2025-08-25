import { Component, inject, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { LoginService } from '../../services/login.service';

import Swal from 'sweetalert2';
@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styles: ``,
})
export class SidebarComponent {
  @Input() collapsed: boolean = false;

  private router = inject(Router);
  private _loginService = inject(LoginService);
  public _sidebarService = inject(SidebarService);
  menuItems: any[];
  public perfil;
  constructor() {
    //this.menuItems = this._sidebarService.menu;

    //Extraigo el valor del perfil del localstorage
    this.perfil = this._loginService.getPerfilLocalStorage();

    //Aqui llamo al menu desplegado de la base de datos
    this.getMenuByperfil(this.perfil);
  }

  getMenuByperfil(perfil: number) {
    this._sidebarService.getMenuByPerfil(perfil).subscribe({
      next: (resp) => {
        //console.info(JSON.stringify(resp));
        this.menuItems = resp.menu;
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          text: 'Menu no cargado correctamente. - Component(Sidebar)',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  logoutComponent() {
    this._loginService.logout();
    this.router.navigateByUrl('/login');
  }


}
