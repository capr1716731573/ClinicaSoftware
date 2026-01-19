import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { format } from '@formkit/tempo';
import Swal from 'sweetalert2';
import { CicloHospitalizacionService } from '../../../services/ciclo_hospitalizacion/ciclo_hospitalizacion.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoginService } from '../../../services/login.service';
import { InecEspecialidadesService } from '../../../services/hospitalizacion/inec/inec_especialidades.service';
import { CieService } from '../../../services/cie/cie.service';
import { Subject } from 'rxjs';
import { SkeletonTableComponent } from '../../../componentes_reutilizables/skeleton/skeleton-table.component';
import { CicloHospitalizacion } from './censoareas.component';
import { environment } from '../../../../environments/environment';

declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-egresos',
  imports: [CommonModule, FormsModule, NgSelectModule, SkeletonTableComponent],
  templateUrl: './egresos.component.html',
  styles: ``,
})
export class EgresosComponent {
  private _cicloHospitalizacionService = inject(CicloHospitalizacionService);
  private _loginService = inject(LoginService);
  private _inecEspecialidadesService = inject(InecEspecialidadesService);
  private _cieService = inject(CieService);

  listEgresos: any[] = [];
  bsqEgreso: string = '';
  loading = false;
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;
  count: number = 0;

  opcion: string = 'U'; // Para edición siempre será 'U'

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

  egresoBody: CicloHospitalizacion = {
    pk_ciclohosp: 0,
    fk_ciclohosp: null,
    fecha_ciclohosp: '',
    hora_ciclohosp: '',
    fk_hcu: 0,
    tipo_ciclohosp: 'EGRESO',
    motivo_ciclohosp: '',
    activo_ciclohosp: false,
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

  egresoData: any = null; // Para almacenar los datos completos del egreso

  altaDefuncion: boolean = false;

  auditoriaData: any = null; // Para almacenar los datos de auditoría

  constructor() {
    this.getAllEgresos();
    this.getInecEspecialidades();
  }

  getAllEgresos() {
    this.loading = true;
    this._cicloHospitalizacionService.getAllEgresos(this.desde).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listEgresos = resp.rows || [];
          this.count = resp.count || 0;
        }
        this.loading = false;
      },
      error: (err) => {
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Egresos - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
        this.loading = false;
      },
    });
  }

  getBsqEgresos(bsq: string) {
    if (!bsq || bsq.trim().length === 0) {
      this.desde = 0;
      this.numeracion = 1;
      this.getAllEgresos();
      return;
    }

    this.loading = true;
    this._cicloHospitalizacionService.getBsqEgresos(bsq).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          if (resp.rows && resp.rows.length > 0) {
            this.listEgresos = resp.rows;
            this.count = resp.count || resp.rows.length;
          } else {
            this.listEgresos = [];
            this.count = 0;
          }
        }
        this.loading = false;
      },
      error: (err) => {
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Búsqueda Egresos - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
        this.loading = false;
      },
    });
  }

  buscarEgreso() {
    if (this.bsqEgreso.length >= 4) {
      this.getBsqEgresos(this.bsqEgreso);
    } else if (this.bsqEgreso.length === 0) {
      this.desde = 0;
      this.numeracion = 1;
      this.getAllEgresos();
    }
    // Si tiene entre 1 y 3 caracteres, no hacer nada (esperar a que el usuario escriba más)
  }

  avanzar() {
    if (this.bsqEgreso && this.bsqEgreso.length > 0) {
      return; // No avanzar si hay búsqueda activa
    }
    // Verificar si hay más registros disponibles
    // Si la cantidad de filas devueltas es menor que el intervalo, no hay más páginas
    if (this.listEgresos.length < this.intervalo) {
      return; // No avanzar si ya no hay más registros
    }
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAllEgresos();
  }

  puedeAvanzar(): boolean {
    if (this.bsqEgreso && this.bsqEgreso.length > 0) {
      return false; // No avanzar si hay búsqueda activa
    }
    // Verificar si hay más registros disponibles
    // Si la cantidad de filas devueltas es menor que el intervalo, no hay más páginas
    return this.listEgresos.length >= this.intervalo;
  }

  retroceder() {
    if (this.bsqEgreso && this.bsqEgreso.length > 0) {
      return; // No retroceder si hay búsqueda activa
    }
    if (this.desde > 0) {
      this.desde -= this.intervalo;
      this.numeracion -= 1;
      this.getAllEgresos();
    }
  }

  editarEgreso(egreso: any) {
    this.opcion = 'U';
    this.loading = true;
    
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

    this._cicloHospitalizacionService.getEgresosId(egreso.pk_ciclohosp).subscribe({
      next: (resp) => {
        this.loading = false;
        if (resp.status === 'ok' && resp.rows) {
          this.egresoData = resp.rows;
          
          // Mapear datos al egresoBody
          this.egresoBody = {
            pk_ciclohosp: resp.rows.pk_ciclohosp || 0,
            fk_ciclohosp: resp.rows.fk_ciclohosp ?? null,
            fecha_ciclohosp: resp.rows.fecha_ciclohosp || '',
            hora_ciclohosp: resp.rows.hora_ciclohosp || '',
            fk_hcu: resp.rows.fk_hcu || 0,
            tipo_ciclohosp: resp.rows.tipo_ciclohosp || 'EGRESO',
            motivo_ciclohosp: resp.rows.motivo_ciclohosp || '',
            activo_ciclohosp: resp.rows.activo_ciclohosp ?? false,
            fk_usuario: resp.rows.fk_usuario || 0,
            fk_ubi: resp.rows.fk_ubi || 0,
            fecha_creacion_ciclo: resp.rows.fecha_creacion_ciclo || {},
            fecha_modificacion_ciclo: resp.rows.fecha_modificacion_ciclo ?? null,
            defuncion_48_ciclohosp: resp.rows.defuncion_48_ciclohosp ?? 0,
            fk_inecespe: resp.rows.fk_inecespe ?? null,
            fk_cieprincipal: resp.rows.fk_cieprincipal ?? null,
            fk_ciesecundaria1: resp.rows.fk_ciesecundaria1 ?? null,
            fk_ciesecundaria2: resp.rows.fk_ciesecundaria2 ?? null,
            fk_ciecausaext: resp.rows.fk_ciecausaext ?? null,
          };

          // Cargar estado de alta por defunción
          this.altaDefuncion = resp.rows.motivo_ciclohosp === 'D' || false;
          if (this.altaDefuncion && this.egresoBody.defuncion_48_ciclohosp === 0) {
            this.egresoBody.defuncion_48_ciclohosp = 0;
          }

          // Cargar especialidad INEC si existe
          if (this.egresoBody.fk_inecespe && this.listInecEspecialidades.length > 0) {
            this.inecEspecialidad = this.listInecEspecialidades.find(
              (esp) => esp.pk_inecespe == this.egresoBody.fk_inecespe
            ) || null;
          }

          // Cargar CIE Principal si existe - crear objeto desde los datos del egreso
          if (this.egresoBody.fk_cieprincipal && resp.rows.cod_cie_principal && resp.rows.cie_principal) {
            this.ciePrincipal = {
              pk_cie: this.egresoBody.fk_cieprincipal,
              codigo_cie: resp.rows.cod_cie_principal,
              desc_cie: resp.rows.cie_principal,
              cie_completo: `${resp.rows.cod_cie_principal} - ${resp.rows.cie_principal}`
            };
            this.listCie10Principal = [this.ciePrincipal];
          }

          // Cargar CIE Secundaria 1 si existe
          if (this.egresoBody.fk_ciesecundaria1 && resp.rows.cod_cie_secundario1 && resp.rows.cie_secundario1) {
            this.cieSecundaria1 = {
              pk_cie: this.egresoBody.fk_ciesecundaria1,
              codigo_cie: resp.rows.cod_cie_secundario1,
              desc_cie: resp.rows.cie_secundario1,
              cie_completo: `${resp.rows.cod_cie_secundario1} - ${resp.rows.cie_secundario1}`
            };
            this.listCie10Secundaria1 = [this.cieSecundaria1];
          }

          // Cargar CIE Secundaria 2 si existe
          if (this.egresoBody.fk_ciesecundaria2 && resp.rows.cod_cie_secundario2 && resp.rows.cie_secundario2) {
            this.cieSecundaria2 = {
              pk_cie: this.egresoBody.fk_ciesecundaria2,
              codigo_cie: resp.rows.cod_cie_secundario2,
              desc_cie: resp.rows.cie_secundario2,
              cie_completo: `${resp.rows.cod_cie_secundario2} - ${resp.rows.cie_secundario2}`
            };
            this.listCie10Secundaria2 = [this.cieSecundaria2];
          }

          // Cargar CIE Causa Externa si existe
          if (this.egresoBody.fk_ciecausaext && resp.rows._cod_cie_causaext && resp.rows.cie_causaext) {
            this.cieCausaExt = {
              pk_cie: this.egresoBody.fk_ciecausaext,
              codigo_cie: resp.rows._cod_cie_causaext,
              desc_cie: resp.rows.cie_causaext,
              cie_completo: `${resp.rows._cod_cie_causaext} - ${resp.rows.cie_causaext}`
            };
            this.listCie10CausaExt = [this.cieCausaExt];
          }

          $('#editarEgresoModal').modal('show');
        } else {
          toastr.error('Error', 'No se pudieron cargar los datos del egreso');
        }
      },
      error: (err) => {
        this.loading = false;
        toastr.error('Error', `${err} - Datos no cargados del egreso ${egreso.pk_ciclohosp}`);
      },
    });
  }

  validarGuardarEgreso() {
    if (!this.egresoBody || (this.altaDefuncion && this.egresoBody.defuncion_48_ciclohosp === 0)) {
      return false;
    }
    // Validar campos obligatorios
    if (!this.egresoBody.fk_inecespe || !this.egresoBody.fk_cieprincipal) {
      return false;
    }
    return true;
  }

  guardarEgreso() {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Esta acción actualizará los datos del egreso`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Acepto',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Asignar usuario para auditoría
        this.egresoBody.fk_usuario = this._loginService.getUserLocalStorage().pk_usuario;
        
        // Manejar motivo de defunción
        if (this.altaDefuncion) {
          this.egresoBody.motivo_ciclohosp = 'D';
        } else if (this.egresoBody.motivo_ciclohosp === 'D') {
          // Si se desactiva la defunción, mantener el motivo original o cambiar a 'N'
          this.egresoBody.motivo_ciclohosp = 'N';
          this.egresoBody.defuncion_48_ciclohosp = 0;
        }

        this._cicloHospitalizacionService
          .crudCicloHospitalizacion(this.egresoBody, this.opcion)
          .subscribe({
            next: (resp) => {
              if (resp.status && resp.status === 'ok') {
                this.egresoBody = resp.data;
                toastr.success('Éxito', `Egreso actualizado correctamente`);
                $('#editarEgresoModal').modal('hide');
                
                // Limpiar campos
                this.limpiarCampos();
                
                // Recargar datos
                if (this.bsqEgreso && this.bsqEgreso.length > 0) {
                  this.buscarEgreso();
                } else {
                  this.getAllEgresos();
                }
              } else {
                toastr.error('Error', `Problema al actualizar egreso`);
              }
            },
            error: (err) => {
              toastr.error('Error', `${err} - Problema al actualizar egreso`);
            },
          });
      }
    });
  }

  limpiarCampos() {
    this.egresoBody = {
      pk_ciclohosp: 0,
      fk_ciclohosp: null,
      fecha_ciclohosp: '',
      hora_ciclohosp: '',
      fk_hcu: 0,
      tipo_ciclohosp: 'EGRESO',
      motivo_ciclohosp: '',
      activo_ciclohosp: false,
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
    this.egresoData = null;
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

  // Método auxiliar para formatear motivo
  getMotivoTexto(motivo: string): string {
    if (motivo === 'T') return 'TRANSFERENCIA';
    if (motivo === 'N') return 'NORMAL';
    if (motivo === 'D') return 'DEFUNCIÓN';
    return motivo ? motivo.toUpperCase() : '';
  }

  // Método para obtener la clase CSS del badge según el motivo
  getMotivoBadgeClass(motivo: string): string {
    if (motivo === 'D') return 'badge badge-danger';
    if (motivo === 'T') return 'badge badge-warning';
    if (motivo === 'N') return 'badge badge-success';
    return 'badge badge-secondary';
  }

  // Método para ver auditoría
  verAuditoria(item: any): void {
    this.auditoriaData = {
      fecha_creacion_ciclo: item.fecha_creacion_ciclo || null,
      fecha_modificacion_ciclo: item.fecha_modificacion_ciclo || null
    };
    $('#auditoriaModal').modal('show');
  }
}
