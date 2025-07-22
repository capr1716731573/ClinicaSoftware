import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { ModuloService } from '../../../services/modulo.service';
import { PerfilService } from '../../../services/perfil.service';

declare var toastr: any;
declare var $: any;

interface PerfilBody {
  pk_perfil: number;
  nombre_perfil: string;
  fk_mod: number;
}

@Component({
  selector: 'app-perfiles',
  imports: [CommonModule, FormsModule,NgSelectModule],
  templateUrl: './perfiles.component.html',
  styles: ``,
})
export class PerfilesComponent {
  private _modulosService = inject(ModuloService);
  private _perfilService = inject(PerfilService);
  listModulos: any[] = [];
  listPerfiles: any[] = [];
  moduloSelect: any = {};
  idModulo: number = null;
  perfilBody: PerfilBody = {
    pk_perfil: 0,
    nombre_perfil: '',
    fk_mod: 0,
  };
  opcion: string = 'I';
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;

  inicializacion(){
    this.getModulos();
    this.idModulo=null;
    this.listPerfiles=[];
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

  avanzar() {
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getPerfiles(this.idModulo);
  }

  retoceder() {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getPerfiles(this.idModulo);
  }

  validarGuardar() {
    if (
      !this.perfilBody ||
      !this.perfilBody.nombre_perfil ||
      this.perfilBody.nombre_perfil === '' ||
      this.perfilBody.nombre_perfil === undefined ||
      this.perfilBody.fk_mod === undefined ||
      this.perfilBody.nombre_perfil === null ||
      this.perfilBody.fk_mod === null
    )
      return false;
    return true;
  }

  nuevoPerfil() {
    this.opcion = 'I';
    this.perfilBody = {
      pk_perfil: 0,
      nombre_perfil: '',
      fk_mod: this.idModulo,
    };
    // ✅ Abre el modal con jQuery Bootstrap
    $('#perfilModal').modal('show');
  }

  editarPerfil(id_perfil: number) {
    this.opcion = 'U';
    this._perfilService.getPerfilId(id_perfil).subscribe({
      next: (resp) => {
        this.perfilBody = resp.rows;
      },
      error: (err) => {
        // manejo de error
        toastr.error('Error', `${err} - Datos no cargados del id ${id_perfil}`);
      },
    });
  }

  eliminarPerfil(perfil: any) {
    Swal.fire({
      title: 'Esta seguro?',
      text: 'Esta acción elimina el registro del perfíl',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._perfilService.guardarperfil(perfil, 'D').subscribe({
          next: (resp) => {
            if (resp.status && resp.status === 'ok') {
              Swal.fire({
                title: 'Eliminado!',
                text: 'Registro Eliminado.',
                icon: 'success',
              });
              this.getPerfiles(this.idModulo);
            } else {
              // manejo de error
              toastr.error('Error', `Problema al eliminar registro`);
            }
          },
          error: (err) => {
            // manejo de error
            toastr.error('Error', `${err} - Problema al eliminar registro 2`);
          },
        });
      }
    });
  }

  guardarPerfil() {
    this._perfilService.guardarperfil(this.perfilBody, this.opcion).subscribe({
      next: (resp) => {
        this.opcion = `U`;
        if (resp.status && resp.status === 'ok') {
          this.perfilBody = resp.data;
          toastr.success('Éxito', `Registro Guardado`);
          this.getPerfiles(this.idModulo);
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
}
