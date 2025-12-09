import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { format } from '@formkit/tempo';
import Swal from 'sweetalert2';
import { AreasService } from '../../../services/ubicaciones_camas/areas.service';
import { CasasSaludService } from '../../../services/casas_salud/casas_salud.service';
import { CicloHospitalizacionService } from '../../../services/ciclo_hospitalizacion/ciclo_hospitalizacion.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { FilterByPipe } from '../../../pipes/genericoListas.pipe';
import { UbicacionService } from '../../../services/ubicaciones_camas/ubicacion.service';
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';
import { InecEspecialidadesService } from '../../../services/hospitalizacion/inec/inec_especialidades.service';
import { CieService } from '../../../services/cie/cie.service';
import { Subject } from 'rxjs';
import { SkeletonTableComponent } from '../../../componentes_reutilizables/skeleton/skeleton-table.component';


export const SHARED_PIPES = [FilterByPipe];

declare var toastr: any;
declare var $: any;

export interface CicloHospitalizacion {
  pk_ciclohosp: number; // serial4 (PK)
  fk_ciclohosp: number | null; // int4 (FK opcional, permite null)
  fecha_ciclohosp: string; // date NOT NULL (formato YYYY-MM-DD)
  hora_ciclohosp: string; // time NOT NULL (formato HH:mm:ss)
  fk_hcu: number; // int4 NOT NULL (FK a historia_clinica)
  tipo_ciclohosp: string; // text NOT NULL
  motivo_ciclohosp: string; // text NOT NULL
  activo_ciclohosp: boolean; // bool NOT NULL
  fk_usuario: number; // int4 NOT NULL (FK a usuarios)
  fk_ubi: number; // int4 NOT NULL (FK a ubicacion)
  fecha_creacion_ciclo: any; // json NOT NULL (guardar usuario/fecha)
  fecha_modificacion_ciclo: any | null; // json NULL (guardar usuario/fecha modif.)
  defuncion_48_ciclohosp: number | null; // int4 DEFAULT 0 NULL (valores 0,1,2)
  fk_inecespe: number | null; // int8 NULL (FK a inec_especialidades)
  fk_cieprincipal: number | null; // int8 NULL (FK a cie)
  fk_ciesecundaria1: number | null; // int8 NULL (FK a cie)
  fk_ciesecundaria2: number | null; // int8 NULL (FK a cie)
  fk_ciecausaext: number | null; // int8 NULL (FK a cie)
}

@Component({
  selector: 'app-censoareas',
  imports: [CommonModule, FormsModule, NgSelectModule, SHARED_PIPES, SkeletonTableComponent],
  templateUrl: './censoareas.component.html',
  styles: ``,
})
export class CensoareasComponent {
  private _areasService = inject(AreasService);
  private _casaSaludService = inject(CasasSaludService);
  private _ubicacionService = inject(UbicacionService);
  private _loginService = inject(LoginService);
  private _cicloHospitalizacionService = inject(CicloHospitalizacionService);
  private _inecEspecialidadesService = inject(InecEspecialidadesService);
  private _cieService = inject(CieService);
  public _routerService = inject(Router);

  casaSaludBody: any = {};
  listArea: any[] = [];
  listCamas: any[] = [];
  cama: any = null;
  idCama = null;
  idArea = null;
  area = null;
  listAreaTransferencia: any[] = [];
  idAreaTransferencia = null;
  areaTransferencia = null;
  bsqCenso = null;
  listCenso: any[] = [];
  loading = false;

  altaDefuncion: boolean = false;

  opcion: string = 'I';

  identificacion: string = null;
  hcu: any = null;

  // Variables para INEC Especialidades
  listInecEspecialidades: any[] = [];
  inecEspecialidad: any = null;

  // Variables para CIE10 Principal
  listCie10Principal: any[] = [];
  isLoadingCiePrincipal = false;
  ciePrincipal: any = null;
  typeaheadCiePrincipal = new Subject<string>();

  // Variables para CIE10 Secundaria 1
  listCie10Secundaria1: any[] = [];
  isLoadingCieSecundaria1 = false;
  cieSecundaria1: any = null;
  typeaheadCieSecundaria1 = new Subject<string>();

  // Variables para CIE10 Secundaria 2
  listCie10Secundaria2: any[] = [];
  isLoadingCieSecundaria2 = false;
  cieSecundaria2: any = null;
  typeaheadCieSecundaria2 = new Subject<string>();

  // Variables para CIE10 Causa Externa
  listCie10CausaExt: any[] = [];
  isLoadingCieCausaExt = false;
  cieCausaExt: any = null;
  typeaheadCieCausaExt = new Subject<string>();

  ingresoBody: CicloHospitalizacion = {
    pk_ciclohosp: 0, // PK inicial en 0
    fk_ciclohosp: null, // Puede ser null
    fecha_ciclohosp: '', // Lo llenarás con la fecha en formato YYYY-MM-DD
    hora_ciclohosp: '', // Lo llenarás con la hora en formato HH:mm:ss
    fk_hcu: 0, // Relación obligatoria con historia clínica
    tipo_ciclohosp: '', // Texto obligatorio (ej: "INGRESO")
    motivo_ciclohosp: '', // Texto obligatorio (ej: "OBSERVACIÓN")
    activo_ciclohosp: true, // Por defecto activo
    fk_usuario: 0, // Lo asignarás con el usuario en sesión
    fk_ubi: 0, // Ubicación obligatoria
    fecha_creacion_ciclo: {}, // Aquí guardarás json con usuario/fecha
    fecha_modificacion_ciclo: null, // Inicialmente null hasta que se actualice
    defuncion_48_ciclohosp: 0, // Por defecto 0 (sin defunción)
    fk_inecespe: null, // FK a inec_especialidades (opcional)
    fk_cieprincipal: null, // FK a cie principal (opcional)
    fk_ciesecundaria1: null, // FK a cie secundaria 1 (opcional)
    fk_ciesecundaria2: null, // FK a cie secundaria 2 (opcional)
    fk_ciecausaext: null, // FK a cie causa externa (opcional)
  };

  egresoBody: CicloHospitalizacion = {
    pk_ciclohosp: 0, // PK inicial en 0
    fk_ciclohosp: null, // Puede ser null
    fecha_ciclohosp: '', // Lo llenarás con la fecha en formato YYYY-MM-DD
    hora_ciclohosp: '', // Lo llenarás con la hora en formato HH:mm:ss
    fk_hcu: 0, // Relación obligatoria con historia clínica
    tipo_ciclohosp: '', // Texto obligatorio (ej: "INGRESO")
    motivo_ciclohosp: '', // Texto obligatorio (ej: "OBSERVACIÓN")
    activo_ciclohosp: true, // Por defecto activo
    fk_usuario: 0, // Lo asignarás con el usuario en sesión
    fk_ubi: 0, // Ubicación obligatoria
    fecha_creacion_ciclo: {}, // Aquí guardarás json con usuario/fecha
    fecha_modificacion_ciclo: null, // Inicialmente null hasta que se actualice
    defuncion_48_ciclohosp: 0, // Por defecto 0 (sin defunción)
    fk_inecespe: null, // FK a inec_especialidades (opcional)
    fk_cieprincipal: null, // FK a cie principal (opcional)
    fk_ciesecundaria1: null, // FK a cie secundaria 1 (opcional)
    fk_ciesecundaria2: null, // FK a cie secundaria 2 (opcional)
    fk_ciecausaext: null, // FK a cie causa externa (opcional)
  };

  constructor() {
    this.getCasaSalud();
    
    // Manejador global para filtrar errores de extensiones del navegador
    window.addEventListener('unhandledrejection', (event: any) => {
      const errorMessage = event?.reason?.message || event?.reason || '';
      // Filtrar errores conocidos de extensiones del navegador
      if (
        typeof errorMessage === 'string' &&
        (errorMessage.includes('message channel') ||
         errorMessage.includes('Extension context invalidated') ||
         errorMessage.includes('Receiving end does not exist'))
      ) {
        event.preventDefault(); // Prevenir que se muestre en la consola
        return;
      }
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

  onAreaChange(area: any) {
    this.area = area;
    this.getCicloHospitalizacion(this.area.areas_id_pk);
  }

  getAreas(idCasaSalud: number) {
    this._areasService.getAllAreas(null, false, idCasaSalud).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listArea = resp.rows;
          this.listAreaTransferencia = resp.rows;
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

  getAllUbicacion(area: number) {
    this._ubicacionService.getAllUbicacion(null, 'D', area).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listCamas = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Ubicación (${area}) - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getCicloHospitalizacion(area: number) {
    this.loading = true;
    this._cicloHospitalizacionService
      .getIngresosXAreaPiso(Number(area))
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            this.listCenso = resp.rows;
            //console.log(JSON.stringify(this.listCenso));
            this.loading = false;
          }
        },
        error: (err) => {
          // manejo de error
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Ciclo Hospitalización - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
          this.loading = false;
        },
      });
  }

  validarGuardarIngreso() {
    if (!this.hcu || this.hcu.ingreso || !this.cama) {
      return false;
    }
    return true;
  }

  nuevoIngreso() {
    const ahora = new Date();
    this.opcion = 'I';
    this.ingresoBody = {
      pk_ciclohosp: 0,
      fk_ciclohosp: null,
      fecha_ciclohosp: format(ahora, 'YYYY-MM-DD'),
      hora_ciclohosp: format(ahora, 'HH:mm:ss'),
      fk_hcu: 0,
      tipo_ciclohosp: 'INGRESO',
      motivo_ciclohosp: 'N',
      activo_ciclohosp: true,
      fk_usuario: 0,
      fk_ubi: 0,
      fecha_creacion_ciclo: null,
      fecha_modificacion_ciclo: null,
      defuncion_48_ciclohosp: 0,
      fk_inecespe: null,
      fk_cieprincipal: null,
      fk_ciesecundaria1: null,
      fk_ciesecundaria2: null,
      fk_ciecausaext: null,
    };
    this.hcu = null;
    this.identificacion = null;
    this.cama = null;
    this.idCama = null;
    this.getAllUbicacion(this.area.areas_id_pk);
    $('#ingresoPacienteModal').modal('show');
  }

  consultarHcu(identificacion: string) {
    this._cicloHospitalizacionService
      .getPacienteHospitalizado(identificacion)
      .subscribe({
        next: (resp) => {
          this.hcu = resp.rows;
          if (!resp.rows || Object.keys(resp.rows).length === 0) {
            toastr.error(
              'Sin Datos',
              ` Paciente con la identificación ${identificacion} no existe, por favor crear la Historia Clínica`
            );
            this.hcu = null;
          }
        },
        error: (err) => {
          // manejo de error
          toastr.error(
            'Error',
            `${err} - Datos no cargados del paciente ${identificacion}`
          );
        },
      });
  }

  guardarCensoIngreso() {
    Swal.fire({
      title: 'Esta seguro?',
      text: `Esta acción ingresara al paciente seleccionado al área y cama asignada`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Acepto',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        //Asingo el pk usuario para auditoria
        this.ingresoBody.fk_usuario =
          this._loginService.getUserLocalStorage().pk_usuario;
        this.ingresoBody.fk_hcu = this.hcu.pk_hcu;
        this.ingresoBody.fk_ubi = this.cama.pk_ubi;

        this._cicloHospitalizacionService
          .crudCicloHospitalizacion(this.ingresoBody, this.opcion)
          .subscribe({
            next: (resp) => {
              this.opcion = `U`;
              if (resp.status && resp.status === 'ok') {
                this.ingresoBody = resp.data;
                toastr.success('Éxito', `Paciente Ingresado`);
                $('#ingresoPacienteModal').modal('hide');
                this.getCicloHospitalizacion(this.area.areas_id_pk);
              } else {
                // manejo de error
                toastr.error('Error', `Problema al crear ingreso`);
              }
            },
            error: (err) => {
              // manejo de error
              toastr.error('Error', `${err} - Problema al crear ingreso 2`);
            },
          });
      }
    });
  }

  /*-------- CAMBIO DE CAMA -----------*/
  cambioCama(ingreso: any) {
    this.opcion = 'U';
    this.cama = null;
    this.idCama = null;
    this.ingresoBody = {
      pk_ciclohosp: ingreso.pk_ciclohosp,
      fk_ciclohosp: ingreso.fk_ciclohosp,
      fecha_ciclohosp: ingreso.fecha_ciclohosp,
      hora_ciclohosp: ingreso.hora_ciclohosp,
      fk_hcu: ingreso.fk_hcu,
      tipo_ciclohosp: ingreso.tipo_ciclohosp,
      motivo_ciclohosp: ingreso.motivo_ciclohosp,
      activo_ciclohosp: ingreso.activo_ciclohosp,
      fk_usuario: ingreso.fk_usuario,
      fk_ubi: ingreso.fk_ubi,
      fecha_creacion_ciclo: ingreso.fecha_creacion_ciclo,
      fecha_modificacion_ciclo: ingreso.fecha_modificacion_ciclo,
      defuncion_48_ciclohosp: ingreso.defuncion_48_ciclohosp,
      fk_inecespe: ingreso.fk_inecespe ?? null,
      fk_cieprincipal: ingreso.fk_cieprincipal ?? null,
      fk_ciesecundaria1: ingreso.fk_ciesecundaria1 ?? null,
      fk_ciesecundaria2: ingreso.fk_ciesecundaria2 ?? null,
      fk_ciecausaext: ingreso.fk_ciecausaext ?? null,
    };
    this.ingresoBody = ingreso;
    this.hcu = ingreso;
    //console.log(JSON.stringify(this.ingresoBody));
    this.getAllUbicacion(this.area.areas_id_pk);
    $('#cambioCamaModal').modal('show');
  }

  validarCambioCama() {
    if (!this.ingresoBody || !this.cama) {
      return false;
    }
    return true;
  }

  guardarCambioCama() {
    Swal.fire({
      title: 'Esta seguro?',
      text: `Esta acción cambiará de ubicación al paciente seleccionado`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Acepto',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        //Asingo el pk usuario para auditoria
        this.ingresoBody.fk_usuario =
          this._loginService.getUserLocalStorage().pk_usuario;
        this.ingresoBody.fk_ubi = this.cama.pk_ubi;

        this._cicloHospitalizacionService
          .crudCicloHospitalizacion(this.ingresoBody, this.opcion)
          .subscribe({
            next: (resp) => {
              this.opcion = `U`;
              if (resp.status && resp.status === 'ok') {
                this.ingresoBody = resp.data;
                toastr.success(
                  'Éxito',
                  `Cambio de cama realizado correctamente!`
                );
                $('#cambioCamaModal').modal('hide');
                this.getCicloHospitalizacion(this.area.areas_id_pk);
              } else {
                // manejo de error
                toastr.error('Error', `Problema al cambiar de cama`);
              }
            },
            error: (err) => {
              // manejo de error
              toastr.error('Error', `${err} - Problema al cambiar de cama 2`);
            },
          });
      }
    });
  }
  /* --------------------------------- */

  /* ------------ Transferencia de Servicio ------------------ */

  transferenciaServicio(egreso: any) {
    this.opcion = 'I';
    this.idCama = null;
    this.cama = null;
    this.idAreaTransferencia = null;
    this.areaTransferencia = null;
    this.hcu = egreso;
    this.egresoBody = {
      pk_ciclohosp: 0,
      fk_ciclohosp: egreso.pk_ciclohosp,
      fecha_ciclohosp: egreso.fecha_ciclohosp,
      hora_ciclohosp: egreso.hora_ciclohosp,
      fk_hcu: egreso.fk_hcu,
      tipo_ciclohosp: 'EGRESO',
      motivo_ciclohosp: 'T',
      activo_ciclohosp: false,
      fk_usuario: egreso.fk_usuario,
      fk_ubi: egreso.fk_ubi,
      fecha_creacion_ciclo: null,
      fecha_modificacion_ciclo: null,
      defuncion_48_ciclohosp: egreso.defuncion_48_ciclohosp,
      fk_inecespe: egreso.fk_inecespe ?? null,
      fk_cieprincipal: egreso.fk_cieprincipal ?? null,
      fk_ciesecundaria1: egreso.fk_ciesecundaria1 ?? null,
      fk_ciesecundaria2: egreso.fk_ciesecundaria2 ?? null,
      fk_ciecausaext: egreso.fk_ciecausaext ?? null,
    };
    
    // Limpiar campos de selección
    this.inecEspecialidad = null;
    this.ciePrincipal = null;
    this.listCie10Principal = [];
    this.cieSecundaria1 = null;
    this.listCie10Secundaria1 = [];
    this.cieSecundaria2 = null;
    this.listCie10Secundaria2 = [];
    this.cieCausaExt = null;
    this.listCie10CausaExt = [];
    
    // Cargar especialidades INEC si no están cargadas
    if (this.listInecEspecialidades.length === 0) {
      this.getInecEspecialidades();
    }

   

    $('#transferenciaModal').modal('show');
  }

  getAllUbicacionTransferencia(area: number) {
    this._ubicacionService.getAllUbicacion(null, 'D', area).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listCamas = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Ubicación (${area}) - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  onAreaTransferenciaChange(area: any) {
    this.areaTransferencia = area;
    //Calido que si selecciono la misma area coloque todo en null
    if (this.idAreaTransferencia === this.idArea) {
      Swal.fire({
        title: '¡Error!',
        icon: 'warning',
        text: `Debe seleccionar otra área para hacer la transferencia, caso contrario la aplicación no le permitira realizar la transferencia del servicio`,
        confirmButtonText: 'Aceptar',
      });

      this.areaTransferencia = null;
      this.idAreaTransferencia = null;
      this.cama = null;
      this.idCama = null;
      this.listCamas = [];
      return;
    }

    this.getAllUbicacionTransferencia(this.areaTransferencia.areas_id_pk);
  }

  validarTransferencia() {
    if (
      !this.egresoBody ||
      !this.cama ||
      !this.idAreaTransferencia ||
      this.idAreaTransferencia === this.idArea
    ) {
      return false;
    }
    // Validar campos obligatorios
    if(!this.egresoBody.fk_inecespe || !this.egresoBody.fk_cieprincipal){
      return false;
    }
    return true;
  }

  guardarTransferencia() {
    Swal.fire({
      title: 'Confirmación',
      text: `Esta acción creara un egreso e ingreso del paciente al transferir de servicio`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Acepto',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.realizarEgresoIngreso();
      }
    });
  }

  realizarEgresoIngreso() {
    const ahora = new Date();

    // --- preparar EGRESO (deep copy / objeto nuevo) ---
    const egresoBody: CicloHospitalizacion = {
      pk_ciclohosp: 0,
      fk_ciclohosp: this.egresoBody.fk_ciclohosp, // normalmente = pk del ingreso vigente
      fecha_ciclohosp: format(ahora, 'YYYY-MM-DD'),
      hora_ciclohosp: format(ahora, 'HH:mm:ss'),
      fk_hcu: this.egresoBody.fk_hcu,
      tipo_ciclohosp: 'EGRESO',
      motivo_ciclohosp: 'T',
      activo_ciclohosp: false, // cierra el ciclo actual
      fk_usuario: this._loginService.getUserLocalStorage().pk_usuario,
      fk_ubi: this.egresoBody.fk_ubi, // cama anterior
      fecha_creacion_ciclo: null,
      fecha_modificacion_ciclo: null,
      defuncion_48_ciclohosp: this.egresoBody.defuncion_48_ciclohosp ?? 0,
      fk_inecespe: this.egresoBody.fk_inecespe ?? null,
      fk_cieprincipal: this.egresoBody.fk_cieprincipal ?? null,
      fk_ciesecundaria1: this.egresoBody.fk_ciesecundaria1 ?? null,
      fk_ciesecundaria2: this.egresoBody.fk_ciesecundaria2 ?? null,
      fk_ciecausaext: this.egresoBody.fk_ciecausaext ?? null,
    };

    // 1) Crear EGRESO
    this._cicloHospitalizacionService
      .crudCicloHospitalizacion(egresoBody, 'I')
      .subscribe({
        next: (respEgreso) => {
          if (!(respEgreso?.status === 'ok')) {
            toastr.error('Error', 'Problema al crear egreso');
            return;
          }

          const egresoCreado: CicloHospitalizacion = respEgreso.data;

          // --- preparar INGRESO (objeto NUEVO) ---
          const ingresoBody: CicloHospitalizacion = {
            pk_ciclohosp: 0,
            // encadenar al EGRESO recién creado (opcional pero recomendado)
            fk_ciclohosp: null,
            fecha_ciclohosp: format(ahora, 'YYYY-MM-DD'),
            hora_ciclohosp: format(ahora, 'HH:mm:ss'),
            fk_hcu: egresoCreado.fk_hcu,
            tipo_ciclohosp: 'INGRESO',
            motivo_ciclohosp: 'T',
            activo_ciclohosp: true, // abre nuevo ciclo
            fk_usuario: egresoCreado.fk_usuario,
            fk_ubi: this.cama.pk_ubi, // cama nueva seleccionada
            fecha_creacion_ciclo: null,
            fecha_modificacion_ciclo: null,
            defuncion_48_ciclohosp: 0,
            fk_inecespe: egresoCreado.fk_inecespe ?? null,
            fk_cieprincipal: egresoCreado.fk_cieprincipal ?? null,
            fk_ciesecundaria1: egresoCreado.fk_ciesecundaria1 ?? null,
            fk_ciesecundaria2: egresoCreado.fk_ciesecundaria2 ?? null,
            fk_ciecausaext: egresoCreado.fk_ciecausaext ?? null,
          };

          // 2) Crear INGRESO
          this._cicloHospitalizacionService
            .crudCicloHospitalizacion(ingresoBody, 'I')
            .subscribe({
              next: (respIngreso) => {
                if (respIngreso?.status === 'ok') {
                  toastr.success('Éxito', 'Paciente transferido exitosamente');
                  // limpiar UI
                  this.hcu = null;
                  this.listCamas = [];
                  this.idCama = null;
                  this.cama = null;
                  this.areaTransferencia = null;
                  this.idAreaTransferencia = null;
                  this.ingresoBody = null;
                  // Reinicializar egresoBody en lugar de null para evitar errores en el template
                  this.egresoBody = {
                    pk_ciclohosp: 0,
                    fk_ciclohosp: null,
                    fecha_ciclohosp: '',
                    hora_ciclohosp: '',
                    fk_hcu: 0,
                    tipo_ciclohosp: '',
                    motivo_ciclohosp: '',
                    activo_ciclohosp: true,
                    fk_usuario: 0,
                    fk_ubi: 0,
                    fecha_creacion_ciclo: {},
                    fecha_modificacion_ciclo: null,
                    defuncion_48_ciclohosp: 0,
                    fk_inecespe: null,
                    fk_cieprincipal: null,
                    fk_ciesecundaria1: null,
                    fk_ciesecundaria2: null,
                    fk_ciecausaext: null,
                  };
                  this.inecEspecialidad = null;
                  this.ciePrincipal = null;
                  this.listCie10Principal = [];
                  this.cieSecundaria1 = null;
                  this.listCie10Secundaria1 = [];
                  this.cieSecundaria2 = null;
                  this.listCie10Secundaria2 = [];
                  this.cieCausaExt = null;
                  this.listCie10CausaExt = [];
                  $('#transferenciaModal').modal('hide');
                  this.getCicloHospitalizacion(this.area.areas_id_pk);
                } else {
                  toastr.error('Error', 'Problema al crear ingreso');
                }
              },
              error: (err) => {
                toastr.error('Error', `${err} - Problema al crear ingreso 2`);
              },
            });
        },
        error: (err) => {
          toastr.error('Error', `${err} - Problema al crear egreso 2`);
        },
      });
  }

  /* ------------ ----------------------------------------- */

  /* ------------ Alta de Paciente ------------------ */

  alta(egreso: any) {
    const ahora = new Date();
    this.hcu = egreso;
    // --- preparar EGRESO (deep copy / objeto nuevo) ---
    this.egresoBody = {
      pk_ciclohosp: 0,
      fk_ciclohosp: egreso.pk_ciclohosp, // normalmente = pk del ingreso vigente
      fecha_ciclohosp: format(ahora, 'YYYY-MM-DD'),
      hora_ciclohosp: format(ahora, 'HH:mm:ss'),
      fk_hcu: egreso.fk_hcu,
      tipo_ciclohosp: 'EGRESO',
      motivo_ciclohosp: 'N',
      activo_ciclohosp: false, // cierra el ciclo actual
      fk_usuario: this._loginService.getUserLocalStorage().pk_usuario,
      fk_ubi: egreso.fk_ubi, // cama anterior
      fecha_creacion_ciclo: null,
      fecha_modificacion_ciclo: null,
      defuncion_48_ciclohosp: egreso.defuncion_48_ciclohosp ?? 0,
      fk_inecespe: egreso.fk_inecespe ?? null,
      fk_cieprincipal: egreso.fk_cieprincipal ?? null,
      fk_ciesecundaria1: egreso.fk_ciesecundaria1 ?? null,
      fk_ciesecundaria2: egreso.fk_ciesecundaria2 ?? null,
      fk_ciecausaext: egreso.fk_ciecausaext ?? null,
    };
    this.altaDefuncion = false;
    this.inecEspecialidad = null;
    this.ciePrincipal = null;
    this.listCie10Principal = [];
    this.cieSecundaria1 = null;
    this.listCie10Secundaria1 = [];
    this.cieSecundaria2 = null;
    this.listCie10Secundaria2 = [];
    this.cieCausaExt = null;
    this.listCie10CausaExt = [];
    // Cargar especialidades INEC si no están cargadas
    if (this.listInecEspecialidades.length === 0) {
      this.getInecEspecialidades();
    }
    $('#egresoModal').modal('show');
  }

  altaXDefuncion(alta: any) {
    if (this.egresoBody) {
      this.egresoBody.defuncion_48_ciclohosp = 0;
    }
  }

  validarEgreso(){
    if(!this.egresoBody||(this.altaDefuncion && this.egresoBody.defuncion_48_ciclohosp === 0)){
      return false;
    }
    // Validar campos obligatorios
    if(!this.egresoBody.fk_inecespe || !this.egresoBody.fk_cieprincipal){
      return false;
    }
    return true;
  }

  guardarEgreso(){
    Swal.fire({
      title: 'Confirmación',
      text: `Esta acción egresará al paciente asignado`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Acepto',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const ahora = new Date();
        this.egresoBody.fecha_ciclohosp= format(ahora, 'YYYY-MM-DD');
        this.egresoBody.hora_ciclohosp= format(ahora, 'HH:mm:ss');
        if(this.altaDefuncion){
          this.egresoBody.motivo_ciclohosp='D';
        }else this.egresoBody.motivo_ciclohosp='N';

         this._cicloHospitalizacionService
            .crudCicloHospitalizacion(this.egresoBody, 'I')
            .subscribe({
              next: (respIngreso) => {
                if (respIngreso?.status === 'ok') {
                  toastr.success('Éxito', 'Paciente egresado exitosamente');
                  // limpiar UI
                  this.hcu = null;
                  this.listCamas = [];
                  this.idCama = null;
                  this.cama = null;
                  this.areaTransferencia = null;
                  this.idAreaTransferencia = null;
                  this.ingresoBody = null;
                  // Reinicializar egresoBody en lugar de null para evitar errores en el template
                  this.egresoBody = {
                    pk_ciclohosp: 0,
                    fk_ciclohosp: null,
                    fecha_ciclohosp: '',
                    hora_ciclohosp: '',
                    fk_hcu: 0,
                    tipo_ciclohosp: '',
                    motivo_ciclohosp: '',
                    activo_ciclohosp: true,
                    fk_usuario: 0,
                    fk_ubi: 0,
                    fecha_creacion_ciclo: {},
                    fecha_modificacion_ciclo: null,
                    defuncion_48_ciclohosp: 0,
                    fk_inecespe: null,
                    fk_cieprincipal: null,
                    fk_ciesecundaria1: null,
                    fk_ciesecundaria2: null,
                    fk_ciecausaext: null,
                  };
                  this.altaDefuncion = false;
                  this.inecEspecialidad = null;
                  this.ciePrincipal = null;
                  this.listCie10Principal = [];
                  this.cieSecundaria1 = null;
                  this.listCie10Secundaria1 = [];
                  this.cieSecundaria2 = null;
                  this.listCie10Secundaria2 = [];
                  this.cieCausaExt = null;
                  this.listCie10CausaExt = [];
                  $('#egresoModal').modal('hide');
                  this.getCicloHospitalizacion(this.area.areas_id_pk);
                } else {
                  toastr.error('Error', 'Problema al crear egreso');
                }
              },
              error: (err) => {
                toastr.error('Error', `${err} - Problema al crear egreso 2`);
              },
            });
      }
    });
  }

  seleccionarPaciente(hcu:any){
    this._loginService.setHcuLocalStorage(hcu);
    this._routerService.navigate(['/hospitalizacion_inicio']);
  }

  /* ------------ INEC Especialidades ------------------ */
  
  getInecEspecialidades() {
    this._inecEspecialidadesService.getAllInecEspecialidades(null, true).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listInecEspecialidades = resp.rows || [];
        }
      },
      error: (err) => {
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `INEC Especialidades Médicas - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  seleccionInecEspecialidad(especialidad: any): void {
    this.inecEspecialidad = especialidad;
    this.egresoBody.fk_inecespe = especialidad?.pk_inecespe ?? null;
  }

  /* ------------ CIE10 Principal ------------------ */

  onSearchCiePrincipal(term: any): void {
    if (!term || !term.term) {
      this.listCie10Principal = [];
      return;
    }
    
    const bsq = term.term.trim();
    if (bsq.length < 3) {
      this.listCie10Principal = [];
      return;
    }

    this.isLoadingCiePrincipal = true;
    this._cieService.getBsqCie(bsq).subscribe({
      next: (resp) => {
        this.isLoadingCiePrincipal = false;
        this.listCie10Principal =
          resp?.status === 'ok' && resp?.rows?.length > 0 ? resp.rows : [];
      },
      error: (err) => {
        this.isLoadingCiePrincipal = false;
        this.listCie10Principal = [];
        // Silenciar errores de consola que pueden ser de extensiones del navegador
        if (err?.message && !err.message.includes('message channel')) {
          console.error('Error en búsqueda CIE Principal:', err);
        }
      },
    });
  }

  seleccionCiePrincipal(cie: any): void {
    this.ciePrincipal = cie;
    this.egresoBody.fk_cieprincipal = cie?.pk_cie ?? null;
  }

  /* ------------ CIE10 Secundaria 1 ------------------ */

  onSearchCieSecundaria1(term: any): void {
    if (!term || !term.term) {
      this.listCie10Secundaria1 = [];
      return;
    }
    
    const bsq = term.term.trim();
    if (bsq.length < 3) {
      this.listCie10Secundaria1 = [];
      return;
    }

    this.isLoadingCieSecundaria1 = true;
    this._cieService.getBsqCie(bsq).subscribe({
      next: (resp) => {
        this.isLoadingCieSecundaria1 = false;
        this.listCie10Secundaria1 =
          resp?.status === 'ok' && resp?.rows?.length > 0 ? resp.rows : [];
      },
      error: (err) => {
        this.isLoadingCieSecundaria1 = false;
        this.listCie10Secundaria1 = [];
        // Silenciar errores de consola que pueden ser de extensiones del navegador
        if (err?.message && !err.message.includes('message channel')) {
          console.error('Error en búsqueda CIE Secundaria 1:', err);
        }
      },
    });
  }

  seleccionCieSecundaria1(cie: any): void {
    this.cieSecundaria1 = cie;
    this.egresoBody.fk_ciesecundaria1 = cie?.pk_cie ?? null;
  }

  /* ------------ CIE10 Secundaria 2 ------------------ */

  onSearchCieSecundaria2(term: any): void {
    if (!term || !term.term) {
      this.listCie10Secundaria2 = [];
      return;
    }
    
    const bsq = term.term.trim();
    if (bsq.length < 3) {
      this.listCie10Secundaria2 = [];
      return;
    }

    this.isLoadingCieSecundaria2 = true;
    this._cieService.getBsqCie(bsq).subscribe({
      next: (resp) => {
        this.isLoadingCieSecundaria2 = false;
        this.listCie10Secundaria2 =
          resp?.status === 'ok' && resp?.rows?.length > 0 ? resp.rows : [];
      },
      error: (err) => {
        this.isLoadingCieSecundaria2 = false;
        this.listCie10Secundaria2 = [];
        // Silenciar errores de consola que pueden ser de extensiones del navegador
        if (err?.message && !err.message.includes('message channel')) {
          console.error('Error en búsqueda CIE Secundaria 2:', err);
        }
      },
    });
  }

  seleccionCieSecundaria2(cie: any): void {
    this.cieSecundaria2 = cie;
    this.egresoBody.fk_ciesecundaria2 = cie?.pk_cie ?? null;
  }

  /* ------------ CIE10 Causa Externa ------------------ */

  onSearchCieCausaExt(term: any): void {
    if (!term || !term.term) {
      this.listCie10CausaExt = [];
      return;
    }
    
    const bsq = term.term.trim();
    if (bsq.length < 3) {
      this.listCie10CausaExt = [];
      return;
    }

    this.isLoadingCieCausaExt = true;
    this._cieService.getBsqCie(bsq).subscribe({
      next: (resp) => {
        this.isLoadingCieCausaExt = false;
        this.listCie10CausaExt =
          resp?.status === 'ok' && resp?.rows?.length > 0 ? resp.rows : [];
      },
      error: (err) => {
        this.isLoadingCieCausaExt = false;
        this.listCie10CausaExt = [];
        // Silenciar errores de consola que pueden ser de extensiones del navegador
        if (err?.message && !err.message.includes('message channel')) {
          console.error('Error en búsqueda CIE Causa Externa:', err);
        }
      },
    });
  }

  seleccionCieCausaExt(cie: any): void {
    this.cieCausaExt = cie;
    this.egresoBody.fk_ciecausaext = cie?.pk_cie ?? null;
  }

  /* ----------------------------------------------------------*/
}