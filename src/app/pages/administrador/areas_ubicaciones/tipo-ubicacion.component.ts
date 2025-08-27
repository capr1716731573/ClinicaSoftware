import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../../services/login.service';
import { TipoUbicacionService } from '../../../services/ubicaciones_camas/tipo_ubicacion.service';

declare var toastr: any;
declare var $: any;

export interface TipoUbicacion {
  pk_tipoubi: number; // serial4 (PK)
  tipo_tipoubi: ''; // CHECK: solo acepta estos valores
  desc_tipoubi: string; // text NOT NULL
  habilitado_tipoubi: boolean; // bool NOT NULL
  fecha_creacion_tipoubi: any; // json NOT NULL
  fecha_modificacion_tipoubi: any; // json NULL
  pk_usuario: number;
}

@Component({
  selector: 'app-tipo-ubicacion',
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './tipo-ubicacion.component.html',
  styles: ``,
})
export class TipoUbicacionComponent {
  private _tipoUbicacionService = inject(TipoUbicacionService);
  private _loginService = inject(LoginService);
  listTipoUbicacion: any[] = [];

  tipo: string = null;

  tipoUbicacionBody: TipoUbicacion = {
    pk_tipoubi: 0, // serial4 (PK)
    tipo_tipoubi: null, // CHECK: solo acepta estos valores
    desc_tipoubi: '', // text NOT NULL
    habilitado_tipoubi: true, // bool NOT NULL
    fecha_creacion_tipoubi: null, // json NOT NULL
    fecha_modificacion_tipoubi: null, // json NULL
    pk_usuario: 0,
  };

  bsqTipoUbicacion: string = '';
  opcion: string = 'I';
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;

  constructor() {
    this.getTipoUbicacion(this.tipo);
    this.opcion='I';
    this.desde=0;
    this.numeracion=1;
  }

  inicializacion() {
    this.getTipoUbicacion(this.tipo);
    this.opcion='I';
    this.desde=0;
    this.numeracion=1;
  }

  onTipoChange(valor: string | null) {
    this.getTipoUbicacion(valor);
  }

  getTipoUbicacion(tipo: string) {
    /* console.log(tipo) */
    this._tipoUbicacionService
      .getAllTipoUbicacion(this.desde, false, tipo)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            this.listTipoUbicacion = resp.rows;
          }
        },
        error: (err) => {
          // manejo de error
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Tipo Ubicación - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  getTipoUbicacionBusqueda(bsq: string, tipo: string) {
    this._tipoUbicacionService.getBsqTipoUbicacion(bsq, false, tipo).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          if (resp.rows.length > 0) {
            this.listTipoUbicacion = resp.rows;
          } else {
            this.listTipoUbicacion = [];
          }
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Tipo Ubicación - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  avanzar() {
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getTipoUbicacion(this.tipo);
  }

  retroceder() {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getTipoUbicacion(this.tipo);
  }

  validarGuardar() {
    if (
      !this.tipoUbicacionBody ||
      !this.tipoUbicacionBody.tipo_tipoubi ||
      this.tipoUbicacionBody.tipo_tipoubi === '' ||
      this.tipoUbicacionBody.tipo_tipoubi === undefined ||
      this.tipoUbicacionBody.desc_tipoubi === undefined ||
      this.tipoUbicacionBody.desc_tipoubi === null
    )
      return false;
    return true;
  }

  nuevoTipoUbicacion() {
    this.opcion = 'I';
    this.tipoUbicacionBody = {
      pk_tipoubi: 0, // serial4 (PK)
      tipo_tipoubi: null, // CHECK: solo acepta estos valores
      desc_tipoubi: '', // text NOT NULL
      habilitado_tipoubi: true, // bool NOT NULL
      fecha_creacion_tipoubi: null, // json NOT NULL
      fecha_modificacion_tipoubi: null, // json NULL
      pk_usuario: 0,
    };
    $('#tipoUbicacionModal').modal('show');
  }

  buscarTipoUbicacion() {
    if (this.bsqTipoUbicacion.length >= 4) {
      this.getTipoUbicacionBusqueda(this.bsqTipoUbicacion, this.tipo);
      // tu lógica aquí
    } else if (this.bsqTipoUbicacion.length === 0) {
      this.desde -= this.intervalo;
      this.numeracion -= 1;
      this.getTipoUbicacion(this.tipo);
    }
  }

  editarTipoUbicacion(id_tipo: number) {
    this.opcion = 'U';
    this._tipoUbicacionService.getAllTipoUbicacionId(id_tipo).subscribe({
      next: (resp) => {
        this.tipoUbicacionBody = resp.rows;

        // ✅ Abre el modal con jQuery Bootstrap
        $('#tipoUbicacionModal').modal('show');
      },
      error: (err) => {
        // manejo de error
        toastr.error('Error', `${err} - Datos no cargados del id ${id_tipo}`);
      },
    });
  }

  eliminarTipoUbicacion(tipoUbicacion: any) {
    Swal.fire({
      title: 'Esta seguro?',
      text: `Esta acción elimina el registro de Tipo de Ubicacion (Verifique que no tenga camas ancladas al Tipo de Ubicación asignada)`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        //Asingo el pk usuario para auditoria
        tipoUbicacion.pk_usuario =
          this._loginService.getUserLocalStorage().pk_usuario;
        this._tipoUbicacionService
          .guardarTipoUbicacion(tipoUbicacion, 'D')
          .subscribe({
            next: (resp) => {
              if (resp.status && resp.status === 'ok') {
                Swal.fire({
                  title: 'Eliminado!',
                  text: 'Registro Eliminado.',
                  icon: 'success',
                });
                if (this.bsqTipoUbicacion.length >= 4) {
                  this.buscarTipoUbicacion();
                } else this.getTipoUbicacion(this.tipo);
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

  guardarTipoUbicacion() {
    //Asingo el pk usuario para auditoria
    this.tipoUbicacionBody.pk_usuario =
      this._loginService.getUserLocalStorage().pk_usuario;

    this._tipoUbicacionService
      .guardarTipoUbicacion(this.tipoUbicacionBody, this.opcion)
      .subscribe({
        next: (resp) => {
          this.opcion = `U`;
          if (resp.status && resp.status === 'ok') {
            this.tipoUbicacionBody = resp.data;
            toastr.success('Éxito', `Registro Guardado`);
            if (this.bsqTipoUbicacion.length >= 4) {
              this.buscarTipoUbicacion();
            } else this.getTipoUbicacion(this.tipo);
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
