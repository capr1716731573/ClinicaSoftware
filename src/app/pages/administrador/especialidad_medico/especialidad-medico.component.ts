import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgSelectComponent } from '@ng-select/ng-select';
import { EspecialidadMedicoService } from '../../../services/especilidades_medicos/especialidad_medico.service';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { CabeceraDetalleService } from '../../../services/cabecera_detalle/cabecera-detalle.service';
import { SkeletonTableComponent } from '../../../componentes_reutilizables/skeleton/skeleton-table.component';
import { environment } from '../../../../environments/environment';

declare var toastr: any;
declare var $: any;

// Registro tal como está en la BD (incluye PK)
export interface EspecialidadMedica {
  pk_espemed: number; // serial4 (PK)
  fk_usuario: number; // int8 (FK -> usuarios.pk_usuario)
  fk_catdetalle: number; // int8 (FK -> catalogo_detalle.pk_catdetalle)
  tipo_espemed: 'E' | 'S'; // CHECK: solo 'E' (Especialidad) o 'S' (Subespecialidad)
}

@Component({
  selector: 'app-especialidad-medico',
  imports: [CommonModule, FormsModule, NgSelectComponent, SkeletonTableComponent],
  templateUrl: './especialidad-medico.component.html',
  styles: ``,
})
export class EspecialidadMedicoComponent {
  private _especialidadMedicoService = inject(EspecialidadMedicoService);
  private _usuarioService = inject(UsuarioService);
  private _especialidadesService = inject(CabeceraDetalleService);

  listEspecialidadesMedicos: any[] = [];
  listEspecialidades: any[] = [];
  listMedicos: any[] = [];

  especialidadMedicoBody: EspecialidadMedica = {
    pk_espemed: 0, // serial4 (PK)
    fk_usuario: null, // int8 (FK -> usuarios.pk_usuario)
    fk_catdetalle: null, // int8 (FK -> catalogo_detalle.pk_catdetalle)
    tipo_espemed: 'E',
  };

  bsqEspecialidadMedico: string = '';
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
    this.getEspecialidadesMedicos();
    this.getEspecialidades();
    this.getMedicos();
  }

  getEspecialidadesMedicos() {
    this.loading = true;
    this._especialidadMedicoService
      .getAllEspecialidadMedico(this.desde)
      .subscribe({
        next: (resp) => {
          this.loading = false;
          if (resp.status === 'ok') {
            const rows = resp.rows ?? [];
            if (rows.length > 0) {
              this.listEspecialidadesMedicos = rows;
              this.hasNext = rows.length === this.intervalo;
            } else {
              if (this.desde !== this.prevDesde) {
                this.desde = this.prevDesde ?? 0;
                this.numeracion = this.prevNumeracion ?? 1;
                this.hasNext = false;
              } else {
                this.listEspecialidadesMedicos = [];
                this.hasNext = false;
              }
            }
            console.log(JSON.stringify(this.listEspecialidadesMedicos))
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
            text: `Especialidades Médicos - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  getAllEspecialidadesMedicosBusqueda(bsq: string) {
    this.loading = true;
    this._especialidadMedicoService.getBsqEspecialidadMedico(bsq).subscribe({
      next: (resp) => {
        this.loading = false;
        if (resp.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          if (resp.rows.length > 0) {
            this.listEspecialidadesMedicos = resp.rows;
          } else {
            this.listEspecialidadesMedicos = [];
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
          text: `Especialidades Médicos - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getEspecialidades() {
    this._especialidadesService
      .getAllCabecerasDetalle2('ESPEC_MED', true)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            this.listEspecialidades = resp.rows;
          }
        },
        error: (err) => {
          // manejo de error
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Especialidades - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  getMedicos() {
    this._usuarioService.getAllUsuarioMedicos().subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listMedicos = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Médicos - ${err.message}`,
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
    this.getEspecialidadesMedicos();
  }

  retoceder() {
    if (this.isSearchActive) return;
    this.desde = Math.max(0, this.desde - this.intervalo);
    this.numeracion = Math.max(1, this.numeracion - 1);
    this.prevDesde = this.desde;
    this.prevNumeracion = this.numeracion;
    this.hasNext = true;
    this.getEspecialidadesMedicos();
  }

  nuevoEspecialidadMedico() {
    this.opcion = 'I';
    this.especialidadMedicoBody = {
      pk_espemed: 0, // serial4 (PK)
      fk_usuario: null, // int8 (FK -> usuarios.pk_usuario)
      fk_catdetalle: null, // int8 (FK -> catalogo_detalle.pk_catdetalle)
      tipo_espemed: 'E',
    };

    // ✅ Abre el modal con jQuery Bootstrap
    $('#especialidadMedicoModal').modal('show');
  }

  editarEspecialidadMedico(id_espemed: number) {
    this.opcion = 'U';
    this._especialidadMedicoService
      .getAllEspecialidadMedicoId(id_espemed)
      .subscribe({
        next: (resp) => {
          this.especialidadMedicoBody = resp.rows;
          this.especialidadMedicoBody.fk_catdetalle = Number(
            this.especialidadMedicoBody.fk_catdetalle
          );
          this.especialidadMedicoBody.fk_usuario = Number(
            this.especialidadMedicoBody.fk_usuario
          );
          // ✅ Abre el modal con jQuery Bootstrap
          $('#especialidadMedicoModal').modal('show');
        },
        error: (err) => {
          // manejo de error
          toastr.error(
            'Error',
            `${err} - Datos no cargados del id ${id_espemed}`
          );
        },
      });
  }

  eliminarEspecialidadMedico(espeMed: any) {
    Swal.fire({
      title: 'Esta seguro?',
      text: `Esta acción elimina el registro de la Especialidad/SubEspecialidad ${espeMed.desc_catdetalle} al Médico ${espeMed.apellidopat_persona} ${espeMed.nombre_primario_persona}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._especialidadMedicoService
          .guardarEspecialidadMedico(espeMed, 'D')
          .subscribe({
            next: (resp) => {
              if (resp.status && resp.status === 'ok') {
                Swal.fire({
                  title: 'Eliminado!',
                  text: 'Registro Eliminado.',
                  icon: 'success',
                });
                if (this.bsqEspecialidadMedico.length >= 4) {
                  this.buscarEspecialidadMedico();
                } else this.getEspecialidadesMedicos();
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

  validarGuardar() {
    if (
      !this.especialidadMedicoBody ||
      !this.especialidadMedicoBody.fk_usuario ||
      this.especialidadMedicoBody.fk_usuario === undefined ||
      !this.especialidadMedicoBody.fk_catdetalle ||
      this.especialidadMedicoBody.fk_catdetalle === undefined ||
      !this.especialidadMedicoBody.tipo_espemed ||
      this.especialidadMedicoBody.tipo_espemed === undefined
    )
      return false;
    return true;
  }

  buscarEspecialidadMedico() {
    if (this.bsqEspecialidadMedico.length >= 4) {
      this.isSearchActive = true;
      this.desde = 0;
      this.numeracion = 1;
      this.getAllEspecialidadesMedicosBusqueda(this.bsqEspecialidadMedico);
      // tu lógica aquí
    } else if (this.bsqEspecialidadMedico.length === 0) {
      this.isSearchActive = false;
      this.desde = 0;
      this.numeracion = 1;
      this.prevDesde = 0;
      this.prevNumeracion = 1;
      this.hasNext = true;
      this.getEspecialidadesMedicos();
    }
  }

  guardarEspecialidadMedico() {
    this._especialidadMedicoService
      .guardarEspecialidadMedico(this.especialidadMedicoBody, this.opcion)
      .subscribe({
        next: (resp) => {
          this.opcion = `U`;
          if (resp.status && resp.status === 'ok') {
            this.especialidadMedicoBody = resp.data;
            toastr.success('Éxito', `Registro Guardado`);
            if (this.bsqEspecialidadMedico.length >= 4) {
              this.buscarEspecialidadMedico();
            } else this.getEspecialidadesMedicos();
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
