import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../../services/login.service';
import { TipoUbicacionService } from '../../../services/ubicaciones_camas/tipo_ubicacion.service';
import { CabeceraDetalleService } from '../../../services/cabecera_detalle/cabecera-detalle.service';
import { UbicacionService } from '../../../services/ubicaciones_camas/ubicacion.service';
import { AreasService } from '../../../services/ubicaciones_camas/areas.service';
import { CasasSaludService } from '../../../services/casas_salud/casas_salud.service';
import { SkeletonTableComponent } from '../../../componentes_reutilizables/skeleton/skeleton-table.component';
import { environment } from '../../../../environments/environment';

declare var toastr: any;
declare var $: any;

export interface Ubicacion {
  pk_ubi: number; // serial4 (PK)
  fecha_creacion_ubi: Record<string, any>; // json NOT NULL
  fecha_modificacion_ubi: Record<string, any> | null; // json NULL
  fk_torre: number; // FK -> tipo_ubicacion.pk_tipoubi
  fk_piso: number; // FK -> tipo_ubicacion.pk_tipoubi
  fk_sala: number; // FK -> tipo_ubicacion.pk_tipoubi
  fk_habitacion: number; // FK -> tipo_ubicacion.pk_tipoubi
  clase_ubicacion: number; // FK -> catalogo_detalle.pk_catdetalle
  descripcion_ubicacion: string; // text NOT NULL
  observacion_ubicacion: string | null; // text NULL
  estado_ubicacion: string; // CHECK: A/D/O
  areas_id_fk: number; // FK -> areas.areas_id_pk
  pk_usuario: number; // FK -> areas.areas_id_pk
}

@Component({
  selector: 'app-ubicacion',
  imports: [CommonModule, FormsModule, NgSelectModule, SkeletonTableComponent],
  templateUrl: './ubicacion.component.html',
  styles: ``,
})
export class UbicacionComponent {
  private _tipoUbicacionService = inject(TipoUbicacionService);
  private _loginService = inject(LoginService);
  private _claseService = inject(CabeceraDetalleService);
  private _ubicacionService = inject(UbicacionService);
  private _areasService = inject(AreasService);
  private _casaSaludService = inject(CasasSaludService);

  listUbicaciones: any[] = [];
  listTorre: any[] = [];
  listPiso: any[] = [];
  listSala: any[] = [];
  listHabitacion: any[] = [];
  listClase: any[] = [];
  listArea: any[] = [];

  idEstado = null;
  idArea = null;
  casaSaludBody: any = {};

  ubicacionBody: Ubicacion = {
    pk_ubi: 0, // serial4 (PK)
    fecha_creacion_ubi: {}, // json NOT NULL
    fecha_modificacion_ubi: {}, // json NULL
    fk_torre: null, // FK -> tipo_ubicacion.pk_tipoubi
    fk_piso: null, // FK -> tipo_ubicacion.pk_tipoubi
    fk_sala: null, // FK -> tipo_ubicacion.pk_tipoubi
    fk_habitacion: null, // FK -> tipo_ubicacion.pk_tipoubi
    clase_ubicacion: null, // FK -> catalogo_detalle.pk_catdetalle
    descripcion_ubicacion: '', // text NOT NULL
    observacion_ubicacion: '', // text NULL
    estado_ubicacion: '', // CHECK: A/D/O
    areas_id_fk: null, // FK -> areas.areas_id_pk
    pk_usuario: null,
  };

  bsqUbicacion: string = '';
  opcion: string = 'I';
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;
  loading: boolean = true;
  hasNext: boolean = true;
  private prevDesde = 0;
  private prevNumeracion = 1;
  isSearchActive: boolean = false;

  constructor() {
    this.inicializar();
  }

  inicializar() {
    this.desde = 0;
    this.numeracion = 1;
    this.prevDesde = 0;
    this.prevNumeracion = 1;
    this.hasNext = true;
    this.isSearchActive = false;
    this.getCasaSalud();
    this.getAllUbicacion(this.idEstado, this.idArea);
    this.getTipoUbicacion('T');
    this.getTipoUbicacion('P');
    this.getTipoUbicacion('S');
    this.getTipoUbicacion('H');
    this.getClaseCama();
    this.opcion = 'I';
  }

  getAllUbicacion(estado: string, area: number) {
    this.loading = true;
    this._ubicacionService.getAllUbicacion(this.desde, estado, area).subscribe({
      next: (resp) => {
        this.loading = false;
        if (resp.status === 'ok') {
          const rows = resp.rows ?? [];
          if (rows.length > 0) {
            this.listUbicaciones = rows;
            this.hasNext = rows.length === this.intervalo;
          } else {
            if (this.desde !== this.prevDesde) {
              this.desde = this.prevDesde ?? 0;
              this.numeracion = this.prevNumeracion ?? 1;
              this.hasNext = false;
            } else {
              this.listUbicaciones = [];
              this.hasNext = false;
            }
          }
        }
      },
      error: (err) => {
        this.loading = false;
        if (this.desde !== this.prevDesde) {
          this.desde = this.prevDesde ?? 0;
          this.numeracion = this.prevNumeracion ?? 1;
          this.hasNext = false;
        }
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Ubicación (${estado}-${area}) - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getUbicacionBusqueda(bsq: string) {
    this.loading = true;
    this._ubicacionService
      .getBsqUbicacion(bsq, this.idEstado, this.idArea)
      .subscribe({
        next: (resp) => {
          this.loading = false;
          if (resp.status === 'ok') {
            //Validacion para numeracion y parametro desde
            //Si resp.rows sea mayor a 0 se actualiza sino no
            if (resp.rows.length > 0) {
              this.listUbicaciones = resp.rows;
            } else {
              this.listUbicaciones = [];
            }
          }
          this.hasNext = false;
        },
        error: (err) => {
          this.loading = false;
          this.hasNext = false;
          // manejo de error
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Ubicación - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  getTipoUbicacion(tipo: string) {
    /* console.log(tipo) */
    this._tipoUbicacionService
      .getAllTipoUbicacion(this.desde, false, tipo)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            if (tipo === 'T') this.listTorre = resp.rows;
            else if (tipo === 'P') this.listPiso = resp.rows;
            else if (tipo === 'S') this.listSala = resp.rows;
            else if (tipo === 'H') this.listHabitacion = resp.rows;
          }
        },
        error: (err) => {
          // manejo de error
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Tipo Ubicación (${tipo}) - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  getClaseCama() {
    /* console.log(tipo) */
    this._claseService.getAllCabecerasDetalle2('TIP_UBI', true).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listClase = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Clase de Ubicación - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getCasaSalud() {
    this._casaSaludService.getCasaSaludPrincipal().subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.casaSaludBody = resp.rows;
          this.getAreas(this.casaSaludBody.casalud_id_pk);
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Casas de Salud - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getAreas(idCasaSalud: number) {
    this._areasService.getAllAreas(null, false, idCasaSalud).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listArea = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Áreas - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  onEstadoAreaChange() {
    this.bsqUbicacion = '';
    this.isSearchActive = false;
    this.desde = 0;
    this.numeracion = 1;
    this.prevDesde = 0;
    this.prevNumeracion = 1;
    this.hasNext = true;
    this.getAllUbicacion(this.idEstado, this.idArea);
  }

  avanzar() {
    if (this.isSearchActive || !this.hasNext) return;
    this.prevDesde = this.desde;
    this.prevNumeracion = this.numeracion;
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAllUbicacion(this.idEstado, this.idArea);
  }

  retroceder() {
    if (this.isSearchActive) return;
    this.desde = Math.max(0, this.desde - this.intervalo);
    this.numeracion = Math.max(1, this.numeracion - 1);
    this.prevDesde = this.desde;
    this.prevNumeracion = this.numeracion;
    this.hasNext = true;
    this.getAllUbicacion(this.idEstado, this.idArea);
  }

  validarGuardar() {
    if (
      !this.ubicacionBody ||
      !this.ubicacionBody.fk_torre ||
      this.ubicacionBody.fk_torre === undefined ||
      this.ubicacionBody.fk_torre === null ||
      this.ubicacionBody.fk_torre === 0 ||
      !this.ubicacionBody.fk_piso ||
      this.ubicacionBody.fk_piso === undefined ||
      this.ubicacionBody.fk_piso === null ||
      this.ubicacionBody.fk_piso === 0 ||
      !this.ubicacionBody.fk_sala ||
      this.ubicacionBody.fk_sala === undefined ||
      this.ubicacionBody.fk_sala === null ||
      this.ubicacionBody.fk_sala === 0 ||
      !this.ubicacionBody.fk_habitacion ||
      this.ubicacionBody.fk_habitacion === undefined ||
      this.ubicacionBody.fk_habitacion === null ||
      this.ubicacionBody.fk_habitacion === 0 ||
      !this.ubicacionBody.clase_ubicacion ||
      this.ubicacionBody.clase_ubicacion === undefined ||
      this.ubicacionBody.clase_ubicacion === null ||
      this.ubicacionBody.clase_ubicacion === 0 ||
      !this.ubicacionBody.areas_id_fk ||
      this.ubicacionBody.areas_id_fk === undefined ||
      this.ubicacionBody.areas_id_fk === null ||
      this.ubicacionBody.areas_id_fk === 0 ||
      this.ubicacionBody.descripcion_ubicacion === '' ||
      this.ubicacionBody.descripcion_ubicacion === undefined ||
      this.ubicacionBody.descripcion_ubicacion === null ||
      this.ubicacionBody.estado_ubicacion === '' ||
      this.ubicacionBody.estado_ubicacion === undefined ||
      this.ubicacionBody.estado_ubicacion === null
    )
      return false;
    return true;
  }

  nuevoUbicacion() {
    this.opcion = 'I';
    this.ubicacionBody = {
      pk_ubi: 0, // serial4 (PK)
      fecha_creacion_ubi: {}, // json NOT NULL
      fecha_modificacion_ubi: {}, // json NULL
      fk_torre: null, // FK -> tipo_ubicacion.pk_tipoubi
      fk_piso: null, // FK -> tipo_ubicacion.pk_tipoubi
      fk_sala: null, // FK -> tipo_ubicacion.pk_tipoubi
      fk_habitacion: null, // FK -> tipo_ubicacion.pk_tipoubi
      clase_ubicacion: null, // FK -> catalogo_detalle.pk_catdetalle
      descripcion_ubicacion: '', // text NOT NULL
      observacion_ubicacion: '', // text NULL
      estado_ubicacion: '', // CHECK: A/D/O
      areas_id_fk: null, // FK -> areas.areas_id_pk
      pk_usuario: null,
    };
    $('#ubicacionModal').modal('show');
  }

  buscarUbicacion() {
    if (this.bsqUbicacion.length >= 4) {
      this.isSearchActive = true;
      this.desde = 0;
      this.numeracion = 1;
      this.getUbicacionBusqueda(this.bsqUbicacion);
      // tu lógica aquí
    } else if (this.bsqUbicacion.length === 0) {
      this.isSearchActive = false;
      this.desde = 0;
      this.numeracion = 1;
      this.prevDesde = 0;
      this.prevNumeracion = 1;
      this.hasNext = true;
      this.getAllUbicacion(this.idEstado, this.idArea);
    }
  }

  editarUbicacion(id_ubicacion: number) {
    this.opcion = 'U';
    this._ubicacionService.getUbicacionId(id_ubicacion).subscribe({
      next: (resp) => {
        this.ubicacionBody = resp.rows;

        // ✅ Abre el modal con jQuery Bootstrap
        $('#ubicacionModal').modal('show');
      },
      error: (err) => {
        // manejo de error
        toastr.error(
          'Error',
          `${err} - Datos no cargados del id ${id_ubicacion}`
        );
      },
    });
  }

  eliminarUbicacion(ubicacion: any) {
    Swal.fire({
      title: 'Esta seguro?',
      text: `Esta acción elimina el registro de Ubicacion-Camas, siempre y cuando la cama no haya sido utilizada en los ciclos de hospitalización de un paciente`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        //Asingo el pk usuario para auditoria
        ubicacion.pk_usuario =
          this._loginService.getUserLocalStorage().pk_usuario;
        this._ubicacionService.guardarUbicacion(ubicacion, 'D').subscribe({
          next: (resp) => {
            if (resp.status && resp.status === 'ok') {
              Swal.fire({
                title: 'Eliminado!',
                text: 'Registro Eliminado.',
                icon: 'success',
              });
              if (this.bsqUbicacion.length >= 4) {
                this.buscarUbicacion();
              } else this.getAllUbicacion(this.idEstado, this.idArea);
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

  guardarUbicacion() {
    //Asingo el pk usuario para auditoria
    this.ubicacionBody.pk_usuario =
      this._loginService.getUserLocalStorage().pk_usuario;

    this._ubicacionService
      .guardarUbicacion(this.ubicacionBody, this.opcion)
      .subscribe({
        next: (resp) => {
          this.opcion = `U`;
          if (resp.status && resp.status === 'ok') {
            this.ubicacionBody = resp.data;
            toastr.success('Éxito', `Registro Guardado`);
            if (this.bsqUbicacion.length >= 4) {
              this.buscarUbicacion();
            } else this.getAllUbicacion(this.idEstado, this.idArea);
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
