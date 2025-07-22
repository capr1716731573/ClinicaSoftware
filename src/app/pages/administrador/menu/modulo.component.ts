import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { ModuloService } from '../../../services/modulo.service';

declare var toastr: any;
declare var $: any;

interface moduloBody {
  pk_mod: number;
  nombre_mod: string;
  ruta_mod: string;
  estado_mod: boolean;
}

@Component({
  selector: 'app-modulo',
  imports: [CommonModule, FormsModule],
  templateUrl: './modulo.component.html',
  styles: ``,
})
export class ModuloComponent {
  /** Variables de Modulo */
  private _modulosService = inject(ModuloService);
  listModulos: any[] = [];
  moduloBody: moduloBody = {
    pk_mod: 0,
    nombre_mod: '',
    ruta_mod: '',
    estado_mod: true,
  };
  bsqModulo: string = '';
  opcion: string = 'I';
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;
  
  constructor() {
    this.getModulos();
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

  getAllModuloBusqueda(bsq: string) {
    console.log(bsq);
    this._modulosService.getBsqModulo(bsq).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          /* if (resp.rows.length > 0) { */
          this.listModulos = resp.rows;
          /* } */
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

  avanzar() {
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getModulos();
  }

  retoceder() {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getModulos();
  }

  validarGuardar() {
    if (
      !this.moduloBody ||
      !this.moduloBody.nombre_mod ||
      this.moduloBody.nombre_mod === '' ||
      this.moduloBody.nombre_mod === undefined ||
      this.moduloBody.estado_mod === undefined ||
      this.moduloBody.nombre_mod === null ||
      this.moduloBody.estado_mod === null
    )
      return false;
    return true;
  }

  nuevoModulo() {
    this.opcion = 'I';
    this.moduloBody = {
      pk_mod: 0,
      nombre_mod: '',
      ruta_mod: '',
      estado_mod: true,
    };
    // ✅ Abre el modal con jQuery Bootstrap
    $('#moduloModal').modal('show');
  }

  editarModulo(id_mod: number) {
    this.opcion = 'U';
    this._modulosService.getModuloId(id_mod).subscribe({
      next: (resp) => {
        this.moduloBody = resp.rows;
      },
      error: (err) => {
        // manejo de error
        toastr.error('Error', `${err} - Datos no cargados del id ${id_mod}`);
      },
    });
  }

  eliminarModulo(modulo: any) {
    Swal.fire({
      title: 'Esta seguro?',
      text: 'Esta acción elimina el registro del módulo',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._modulosService.guardarModulo(modulo, 'D').subscribe({
          next: (resp) => {
            if (resp.status && resp.status === 'ok') {
              Swal.fire({
                title: 'Eliminado!',
                text: 'Registro Eliminado.',
                icon: 'success',
              });
              if (this.bsqModulo.length >= 4) {
                this.buscarModulo();
              } else this.getModulos();
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

  guardarModulo() {
    this._modulosService.guardarModulo(this.moduloBody, this.opcion).subscribe({
      next: (resp) => {
        this.opcion = `U`;
        if (resp.status && resp.status === 'ok') {
          this.moduloBody = resp.data;
          toastr.success('Éxito', `Registro Guardado`);
          if (this.bsqModulo.length >= 4) {
            this.buscarModulo();
          } else this.getModulos();
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

  buscarModulo() {
    if (this.bsqModulo.length >= 4) {
      this.getAllModuloBusqueda(this.bsqModulo);
      // tu lógica aquí
    } else if (this.bsqModulo.length === 0) {
      this.desde = 0;
      this.numeracion = 1;
      this.getModulos();
    }
  }
}
