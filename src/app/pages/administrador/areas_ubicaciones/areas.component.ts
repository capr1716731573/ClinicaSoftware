import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { AreasService } from '../../../services/ubicaciones_camas/areas.service';
import { CasasSaludService } from '../../../services/casas_salud/casas_salud.service';
import { LoginService } from '../../../services/login.service';
import { SkeletonTableComponent } from '../../../componentes_reutilizables/skeleton/skeleton-table.component';

declare var toastr: any;
declare var $: any;

export interface Area {
  areas_id_pk: number; // serial4 NOT NULL (PK)
  casalud_id_fk: number; // int4 NOT NULL (FK -> casas_salud.casalud_id_pk)
  fecha_creacion_area: any; // json NOT NULL
  fecha_modificacion_area: any; // json NULL
  area_descripcion: string; // text NOT NULL
  area_habilitada: boolean; // bool NOT NULL
  area_observacion: string | null; // text NULL
  pk_usuario:number//Aqui como guarda auditoria de fecha_creacion y fecha_modificacion toca colocar
}

@Component({
  selector: 'app-areas',
  imports: [CommonModule, FormsModule, NgSelectModule, SkeletonTableComponent],
  templateUrl: './areas.component.html',
  styles: ``,
})
export class AreasComponent {
  private _areaService = inject(AreasService);
  private _casaSaludService = inject(CasasSaludService);
  private _loginService = inject(LoginService);
  listAreas: any[] = [];
  casaSaludBody: any = {};
  areaBody: Area = {
    areas_id_pk: 0, // serial4 NOT NULL (PK)
    casalud_id_fk: null, // int4 NOT NULL (FK -> casas_salud.casalud_id_pk)
    fecha_creacion_area: null, // json NOT NULL
    fecha_modificacion_area: null, // json NULL
    area_descripcion: '', // text NOT NULL
    area_habilitada: true, // bool NOT NULL
    area_observacion: '', // text NULL
    pk_usuario:0
  };
  bsqArea: string = '';
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
    this.getCasaSalud();
  }

  inicializacion() {
    this.getCasaSalud();
  }

  getCasaSalud() {
    this.loading = true;
    this._casaSaludService.getCasaSaludPrincipal().subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.casaSaludBody = resp.rows;
          this.getAreas(this.casaSaludBody.casalud_id_pk);
        }
      },
      error: (err) => {
        this.loading = false;
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
    this.loading = true;
    this._areaService.getAllAreas(this.desde, false, idCasaSalud).subscribe({
      next: (resp) => {
        this.loading = false;
        if (resp.status === 'ok') {
          const rows = resp.rows ?? [];
          if (rows.length > 0) {
            this.listAreas = rows;
            this.hasNext = rows.length === this.intervalo;
          } else {
            if (this.desde !== this.prevDesde) {
              this.desde = this.prevDesde ?? 0;
              this.numeracion = this.prevNumeracion ?? 1;
              this.hasNext = false;
            } else {
              this.listAreas = [];
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
          text: `Áreas - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getAllAreasBusqueda(bsq: string) {
    this.loading = true;
    this._areaService
      .getBsqAreas(bsq, null, this.casaSaludBody.casalud_id_pk)
      .subscribe({
        next: (resp) => {
          this.loading = false;
          if (resp.status === 'ok') {
            //Validacion para numeracion y parametro desde
            //Si resp.rows sea mayor a 0 se actualiza sino no
            if (resp.rows.length > 0) {
              this.listAreas = resp.rows;
            } else {
              this.listAreas = [];
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
            text: `Áreas - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  avanzar() {
    if (this.isSearchActive || !this.hasNext) return;
    this.prevDesde = this.desde;
    this.prevNumeracion = this.numeracion;
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAreas(Number(this.casaSaludBody.casalud_id_pk));
  }

  retroceder() {
    if (this.isSearchActive) return;
    this.desde = Math.max(0, this.desde - this.intervalo);
    this.numeracion = Math.max(1, this.numeracion - 1);
    this.prevDesde = this.desde;
    this.prevNumeracion = this.numeracion;
    this.hasNext = true;
    this.getAreas(Number(this.casaSaludBody.casalud_id_pk));
  }

  validarGuardar() {
    if (
      !this.areaBody ||
      !this.areaBody.area_descripcion ||
      this.areaBody.area_descripcion === '' ||
      this.areaBody.area_descripcion === undefined ||
      this.areaBody.casalud_id_fk === undefined ||
      this.areaBody.casalud_id_fk === null ||
      this.areaBody.casalud_id_fk === 0
    )
      return false;
    return true;
  }

  nuevoArea() {
    this.opcion = 'I';
    this.areaBody = {
      areas_id_pk: 0, // serial4 NOT NULL (PK)
      casalud_id_fk: Number(this.casaSaludBody.casalud_id_pk), // int4 NOT NULL (FK -> casas_salud.casalud_id_pk)
      fecha_creacion_area: {}, // json NOT NULL
      fecha_modificacion_area: {}, // json NULL
      area_descripcion: '', // text NOT NULL
      area_habilitada: true, // bool NOT NULL
      area_observacion: '', // text NULL
      pk_usuario:0
    };
    if (this.casaSaludBody.casalud_id_pk) {
      // ✅ Abre el modal con jQuery Bootstrap
      $('#areasModal').modal('show');
    }
  }

  buscarArea() {
    if (this.bsqArea.length >= 4) {
      this.isSearchActive = true;
      this.desde = 0;
      this.numeracion = 1;
      this.getAllAreasBusqueda(this.bsqArea);
      // tu lógica aquí
    } else if (this.bsqArea.length === 0) {
      this.isSearchActive = false;
      this.desde = 0;
      this.numeracion = 1;
      this.prevDesde = 0;
      this.prevNumeracion = 1;
      this.hasNext = true;
      this.getAreas(this.casaSaludBody.casalud_id_pk);
    }
  }

  editarArea(id_area: number) {
    this.opcion = 'U';
    this._areaService.getAllAreasId(id_area).subscribe({
      next: (resp) => {
        this.areaBody = resp.rows;
        this.areaBody.casalud_id_fk = Number(this.areaBody.casalud_id_fk);

        // ✅ Abre el modal con jQuery Bootstrap
        $('#areasModal').modal('show');
      },
      error: (err) => {
        // manejo de error
        toastr.error('Error', `${err} - Datos no cargados del id ${id_area}`);
      },
    });
  }

  eliminarArea(area: any) {
    Swal.fire({
      title: 'Esta seguro?',
      text: `Esta acción elimina el registro del área seleccionada (Verifique que no tenga camas ancladas al área)`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        //Asingo el pk usuario para auditoria
        area.pk_usuario =this._loginService.getUserLocalStorage().pk_usuario;
        this._areaService.guardarAreas(area, 'D').subscribe({
          next: (resp) => {
            if (resp.status && resp.status === 'ok') {
              Swal.fire({
                title: 'Eliminado!',
                text: 'Registro Eliminado.',
                icon: 'success',
              });
              if (this.bsqArea.length >= 4) {
                this.buscarArea();
              } else this.getAreas(Number(this.casaSaludBody.casalud_id_pk));
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

  guardarArea() {
    //Asingo el pk usuario para auditoria
    this.areaBody.pk_usuario=this._loginService.getUserLocalStorage().pk_usuario;

    this._areaService.guardarAreas(this.areaBody, this.opcion).subscribe({
      next: (resp) => {
        this.opcion = `U`;
        if (resp.status && resp.status === 'ok') {
          this.areaBody = resp.data;
          toastr.success('Éxito', `Registro Guardado`);
          if (this.bsqArea.length >= 4) {
            this.buscarArea();
          } else this.getAreas(Number(this.casaSaludBody.casalud_id_pk));
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
