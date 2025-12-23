import { Component, inject, Input } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { LoginService } from '../../services/login.service';

import Swal from 'sweetalert2';
import { filter } from 'rxjs';
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

    // Mantener accordion sincronizado con la ruta actual
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.syncExpandedWithUrl(e.urlAfterRedirects));
  }

  getMenuByperfil(perfil: number) {
    this._sidebarService.getMenuByPerfil(perfil).subscribe({
      next: (resp) => {
        //console.info(JSON.stringify(resp));
        this.menuItems = resp.menu;
        // Inicializar estado accordion
        this.menuItems?.forEach((m) => (m.expanded = false));
        this.syncExpandedWithUrl(this.router.url);
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

  toggleMenu(item: any) {
    if (!this.menuItems || !item) return;

    const nextState = !item.expanded;
    this.menuItems.forEach((m) => (m.expanded = false));
    item.expanded = nextState;
  }

  activateParent(item: any) {
    if (!this.menuItems || !item) return;
    this.menuItems.forEach((m) => (m.expanded = false));
    item.expanded = true;
  }

  private syncExpandedWithUrl(url: string) {
    if (!this.menuItems?.length) return;

    const current = this.normalizeUrl(url);
    const parentMatch = this.menuItems.find((m) =>
      (m.submenu ?? []).some((s: any) => this.normalizeUrl(s?.ruta_menu) === current)
    );

    if (parentMatch) {
      this.menuItems.forEach((m) => (m.expanded = m === parentMatch));
    }
  }

  private normalizeUrl(url: string): string {
    if (!url) return '';
    const clean = url.split('?')[0].split('#')[0];
    return clean.startsWith('/') ? clean : `/${clean}`;
  }

  logoutComponent() {
    this._loginService.logout();
    this.router.navigateByUrl('/login');
  }


}
