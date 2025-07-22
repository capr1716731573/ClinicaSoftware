import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { ModuloService } from '../../../services/modulo.service';
import { PerfilService } from '../../../services/perfil.service';
import { MenuService } from '../../../services/menu/menu.service';

declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-asignacion-menu-perfil',
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './asignacion-menu-perfil.component.html',
  styles: ``,
})
export class AsignacionMenuPerfilComponent {
  private _modulosService = inject(ModuloService);
  private _perfilService = inject(PerfilService);
  private _menuPerfilService = inject(MenuService);

  listModulos: any[] = [];
  listPerfiles: any[] = [];
  listMenuPerfilTodos: any[] = [];
  id_perfil = null;
  id_modulo = null;

  inicializacion() {
    this.getModulos();
    this.id_modulo = null;
    this.id_perfil = null;
    this.listPerfiles = [];
    this.listMenuPerfilTodos = [];
  }

  getModulos() {
    this._modulosService.getAllModulos().subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listModulos = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Módulo - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getPerfiles(idMod: number) {
    this._perfilService.getPerfilByModulo(idMod).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listPerfiles = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Perfíl - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getMenuPerfilTodos(idPerfil) {
    this._menuPerfilService.getMenuByPerfilTodos(idPerfil).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          console.log(resp)
          this.listMenuPerfilTodos = resp.menu;
          console.log(this.listMenuPerfilTodos);
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Menú Perfíl - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  guardarMenuPerfil(menuPerfil:any){

    this._menuPerfilService.guardarMenuPerfil(menuPerfil, 'U').subscribe({
      next: (resp) => {
        if (resp.status && resp.status === 'ok') {
          toastr.success('Éxito', `Registro (${menuPerfil.desc_menu}) Actualizado`);
        } else {
          // manejo de error
          toastr.error('Error', `Problema al actualizar registro (${menuPerfil.desc_menu})`);
        }
      },
      error: (err) => {
        // manejo de error
        toastr.error('Error', `${err} - Problema al actualizar registro 2`);
      },
    });
  }
}
