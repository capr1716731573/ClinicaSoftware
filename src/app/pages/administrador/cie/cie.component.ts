import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../enviroments/enviroments';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CieService } from '../../../services/cie/cie.service';
declare var toastr: any;
declare var $: any;

// Fila tal como está en la tabla (incluye PK)
export interface Cie {
  pk_cie: number; // serial4 NOT NULL (PK)
  padre_cie: number; // int4 NOT NULL
  anio_cie: string; // text NOT NULL
  codigo_cie: string; // text NOT NULL
  desc_cie: string; // text NOT NULL
  observacion_cie: string | null; // text NULL
  estado_cie: boolean; // bool NOT NULL DEFAULT true
  version_cie: string | null; // text NULL
  ocupacion_hcu: string | null; // varchar NULL
}

@Component({
  selector: 'app-cie',
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './cie.component.html',
  styles: ``,
})
export class CieComponent {
  cieList: any[] = [];
  cieBody: Cie = {
    pk_cie: 0, // serial4 NOT NULL (PK)
    padre_cie: 0, // int4 NOT NULL
    anio_cie: '', // text NOT NULL
    codigo_cie: '', // text NOT NULL
    desc_cie: '', // text NOT NULL
    observacion_cie: '', // text NULL
    estado_cie: true, // bool NOT NULL DEFAULT true
    version_cie: '', // text NULL
    ocupacion_hcu: '', // varchar NULL
  };

  listPadres: any[] = [];
 

  bsqCie: string = '';
  opcion: string = 'I';
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;
  private _cieService = inject(CieService);

  constructor() {
    this.getAllCie();
    this.getAllCiePadres();
  }

  getAllCie() {
    this._cieService.getAllCie(this.desde, false).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          if (resp.rows.length > 0) {
            this.cieList = resp.rows;
          } else {
            this.desde -= this.intervalo;
            this.numeracion -= 1;
          }
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Cie - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getAllCiePadres() {
    this._cieService.getAllCiePadres(false).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          if (resp.rows.length > 0) {
            this.listPadres = resp.rows;
          }
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Cie Padres - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getAllCieBusqueda(bsq: string) {
    this._cieService.getBsqCie(bsq).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          if (resp.rows.length > 0) {
            this.cieList = resp.rows;
          }
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Cie - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  //Metodos auxiliares
  avanzar() {
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAllCie();
  }

  retoceder() {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getAllCie();
  }

  validarGuardar() {
    const b = this.cieBody;
    if (!b) return false;

    // permite 0 como valor válido
    if (b.padre_cie == null) return false; // null o undefined

    // anio_cie numérico; solo verifica null/undefined
    if (!b.anio_cie || b.anio_cie.trim() === '') return false;

    // strings no vacíos
    if (!b.codigo_cie || !b.codigo_cie.trim()) return false;
    if (!b.desc_cie || !b.desc_cie.trim()) return false;

    // boolean definido
    if (b.estado_cie == null) return false;

    return true;
  }

  nuevoCie(tipo: string) {
    this.opcion = 'I';
    this.cieBody = {
      pk_cie: 0, // serial4 NOT NULL (PK)
      padre_cie: null, // int4 NOT NULL
      anio_cie: '', // text NOT NULL
      codigo_cie: '', // text NOT NULL
      desc_cie: '', // text NOT NULL
      observacion_cie: '', // text NULL
      estado_cie: true, // bool NOT NULL DEFAULT true
      version_cie: '', // text NULL
      ocupacion_hcu: '', // varchar NULL
    };
    if (tipo === 'p') this.cieBody.padre_cie = 0;
    else if (tipo === 'h') this.cieBody.padre_cie = null;
    // ✅ Abre el modal con jQuery Bootstrap
    $('#cieModal').modal('show');
  }

  editarCie(id_cie: number) {
    this.opcion = 'U';
    this._cieService.getAllCieId(id_cie).subscribe({
      next: (resp) => {
        this.cieBody = resp.rows;
       
        $('#cieModal').modal('show');
      },
      error: (err) => {
        // manejo de error
        toastr.error('Error', `${err} - Datos no cargados del id ${id_cie}`);
      },
    });
  }

  buscarCie() {
    if (this.bsqCie.length >= 3) {
      this.getAllCieBusqueda(this.bsqCie);
      // tu lógica aquí
    } else if (this.bsqCie.length === 0) {
      this.desde = 0;
      this.numeracion = 1;
      this.getAllCie();
    }
  }

   eliminarCie(cie: any) {
      Swal.fire({
        title: 'Esta seguro?',
        text: 'Esta acción elimina el registro de Cie',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          this._cieService.guardarCie(cie, 'D').subscribe({
            next: (resp) => {
              if (resp.status && resp.status === 'ok') {
                Swal.fire({
                  title: 'Eliminado!',
                  text: 'Registro Eliminado.',
                  icon: 'success',
                });
                if (this.bsqCie.length >= 4) {
                  this.buscarCie();
                } else this.getAllCie();
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

  guardarCie() {
   
    this._cieService.guardarCie(this.cieBody, this.opcion).subscribe({
      next: (resp) => {
        this.opcion = `U`;
        if (resp.status && resp.status === 'ok') {
          this.cieBody = resp.data;
          toastr.success('Éxito', `Registro Guardado`);
          if (this.bsqCie.length >= 4) {
            this.buscarCie();
          } else this.getAllCie();
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
