import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../../services/menu/menu.service';
import { SkeletonTableComponent } from '../../../componentes_reutilizables/skeleton/skeleton-table.component';
declare var toastr: any;
declare var $: any;
interface MenuBody {
  pk_menu: number;
  fkpadre_menu: number;
  desc_menu: string;
  ruta_menu: string;
  icono_menu: string;
}

@Component({
  selector: 'app-menu-perfil',
  imports: [CommonModule, FormsModule, SkeletonTableComponent],
  templateUrl: './menu-perfil.component.html',
  styles: ``,
})
export class MenuPerfilComponent {
  private _menuService = inject(MenuService);
  listMenuPadres: any[] = [];
  listMenuHijos: any[] = [];
  menuCabeceraBody: MenuBody = {
    pk_menu: 0,
    fkpadre_menu: 0,
    desc_menu: '',
    ruta_menu: '',
    icono_menu: '',
  };

  menuBody: MenuBody = {
    pk_menu: 0,
    fkpadre_menu: 0,
    desc_menu: '',
    ruta_menu: '',
    icono_menu: '',
  };

  opcion: string = 'I';
  loadingPadres: boolean = false;
  loadingHijos: boolean = false;

  constructor() {}

  inicializacion() {
    this.getMenuPadres();
    this.listMenuHijos = [];
    this.menuCabeceraBody = {
      pk_menu: 0,
      fkpadre_menu: 0,
      desc_menu: '',
      ruta_menu: '',
      icono_menu: '',
    };
  }

  getMenuPadres() {
    this.loadingPadres = true;
    this._menuService.getMenuByPadre(0).subscribe({
      next: (resp) => {
        this.loadingPadres = false;
        if (resp.status === 'ok') {
          this.listMenuPadres = resp.rows;
        }
      },
      error: (err) => {
        this.loadingPadres = false;
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

  getMenuHijos(padre: any) {
    this.menuCabeceraBody = padre;
    this.loadingHijos = true;
    this._menuService.getMenuByPadre(this.menuCabeceraBody.pk_menu).subscribe({
      next: (resp) => {
        this.loadingHijos = false;
        if (resp.status === 'ok') {
          this.listMenuHijos = resp.rows;
        }
      },
      error: (err) => {
        this.loadingHijos = false;
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
   
  nuevoMenuCabecera() {
    this.opcion = 'I';
    this.menuCabeceraBody = {
      pk_menu: 0,
      fkpadre_menu: 0,
      desc_menu: '',
      ruta_menu: '',
      icono_menu: '',
    };
    // ✅ Abre el modal con jQuery Bootstrap
    $('#menuCabeceraModal').modal('show');
  }

  nuevoMenu() {
    this.opcion = 'I';
    this.menuBody = {
      pk_menu: 0,
      fkpadre_menu: this.menuCabeceraBody.pk_menu,
      desc_menu: '',
      ruta_menu: '',
      icono_menu: '',
    };
    // ✅ Abre el modal con jQuery Bootstrap
    $('#menuModal').modal('show');
  }

  editarMenuCabecera(menuCabecera:MenuBody) {
    this.opcion='U';
    this.menuCabeceraBody=menuCabecera;
    this.getMenuHijos(this.menuCabeceraBody);
  }

  editarMenu(menu:MenuBody) {
    this.opcion='U';
    this.menuBody=menu;
  }

  guardarMenuCabecera() {
    this._menuService.guardarMenu(this.menuCabeceraBody, this.opcion).subscribe({
      next: (resp) => {
        this.opcion = `U`;
        if (resp.status && resp.status === 'ok') {
          this.menuCabeceraBody = resp.data;
          toastr.success('Éxito', `Registro Guardado`);
          this.getMenuPadres();
        } else {
          // manejo de error
          toastr.error('Error', `Problema al crear registro`);
        }
      },
      error: (err) => {
        // manejo de error
        toastr.error('Error', `${err} - Problema al crear registro 2`);
      },
    });
  }

  guardarMenuHijos() {
    this._menuService.guardarMenu(this.menuBody, this.opcion).subscribe({
      next: (resp) => {
        this.opcion = `U`;
        if (resp.status && resp.status === 'ok') {
          this.menuBody = resp.data;
          toastr.success('Éxito', `Registro Guardado`);
          this.getMenuHijos(this.menuCabeceraBody);
        } else {
          // manejo de error
          toastr.error('Error', `Problema al crear registro`);
        }
      },
      error: (err) => {
        // manejo de error
        toastr.error('Error', `${err} - Problema al crear registro 2`);
      },
    });
  }

  validarGuardar(tipoMenu:string){
    let activo:boolean;
    if(tipoMenu === 'cabecera'){
      if(
        !this.menuCabeceraBody ||
        !this.menuCabeceraBody.desc_menu ||
        !this.menuCabeceraBody.icono_menu ||
        this.menuCabeceraBody.desc_menu === undefined ||
        this.menuCabeceraBody.icono_menu === undefined ||
        this.menuCabeceraBody.desc_menu === null ||
        this.menuCabeceraBody.icono_menu === null
      ){
        activo=false;
      }else activo=true;
    }else if(tipoMenu === 'submenu'){
      if(
        !this.menuBody ||
        !this.menuBody.desc_menu ||
        !this.menuBody.ruta_menu ||
        this.menuBody.desc_menu === undefined ||
        this.menuBody.ruta_menu === undefined ||
        this.menuBody.desc_menu === null ||
        this.menuBody.ruta_menu === null
      ){
        activo=false;
      }else activo=true;
    }
   return activo;
  }
}
