import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { environment } from '../../../../enviroments/enviroments';
import { LoginService } from '../../../services/login.service';
import { TriageService } from '../../../services/emergencia/triage.service';
import { SkeletonTableComponent } from '../../../componentes_reutilizables/skeleton/skeleton-table.component';
import { EmergenciaTriage } from './formulario008.interface';

declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-lista-triage',
  imports: [CommonModule, FormsModule, SkeletonTableComponent],
  templateUrl: './lista-triage.component.html',
  styles: `
    .manchester-sphere {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      border: 2px solid rgba(255,255,255,0.35);
      user-select: none;
    }
    .manchester-az { background: #1e88e5; color: #fff; }
    .manchester-ro { background: #e53935; color: #fff; }
    .manchester-am { background: #fdd835; color: #111; }
    .manchester-na { background: #fb8c00; color: #111; }
    .manchester-ve { background: #43a047; color: #fff; }
    .manchester-nd { background: #90a4ae; color: #111; }
  `
})
export class ListaTriageComponent {
  private readonly _triageService = inject(TriageService);
  private readonly _routerService = inject(Router);
  private readonly _loginService = inject(LoginService);

  triageList: any[] = [];
  bsqTriage: string = '';

  loading: boolean = true;
  auditoriaData: any = null;

  // Variables de Paginación
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;
  private prevDesde = 0;
  private prevNumeracion = 1;

  constructor() {
    this.getAllTriage();
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //@@@ Metodos de Paginacion  @@@@@
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  revertirPaginacion() {
    this.desde = this.prevDesde ?? 0;
    this.numeracion = this.prevNumeracion ?? 1;
  }

  avanzar() {
    if (this.isSearching) return;
    // guarda estado previo
    this.prevDesde = this.desde;
    this.prevNumeracion = this.numeracion;

    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAllTriage();
  }

  retroceder() {
    if (this.isSearching) return;
    // guarda estado previo
    this.prevDesde = this.desde;
    this.prevNumeracion = this.numeracion;

    this.desde = Math.max(0, this.desde - this.intervalo);
    this.numeracion = Math.max(1, this.numeracion - 1);
    this.getAllTriage();
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  getAllTriage() {
    this.loading = true;

    this._triageService.getAllTriage(this.desde).subscribe({
      next: (resp: any) => {
        this.loading = false;

        if (resp?.status === 'ok') {
          if (resp.data && resp.data.length > 0) {
            this.triageList = resp.data;
          } else {
            // No hay datos: vuelve a los valores previos
            this.revertirPaginacion();
          }
        } else {
          // Respuesta inesperada
          this.triageList = [];
        }
      },
      error: (err) => {
        this.loading = false;
        this.revertirPaginacion();
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Listado de Triage - ${err?.message ?? err}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getTriageBusqueda(bsq: string) {
    this.loading = true;

    this._triageService.getBsqTriage(bsq).subscribe({
      next: (resp: any) => {
        this.loading = false;

        if (resp?.status === 'ok') {
          if (resp.data && resp.data.length > 0) {
            this.triageList = resp.data;
          } else {
            this.triageList = [];
          }
        } else {
          this.triageList = [];
        }
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Triage Bsq - ${err?.message ?? err}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  buscarTriage() {
    if (this.bsqTriage.length >= 4) {
      this.getTriageBusqueda(this.bsqTriage);
    } else if (this.bsqTriage.length === 0) {
      this.desde = 0;
      this.numeracion = 1;
      this.prevDesde = 0;
      this.prevNumeracion = 1;
      this.getAllTriage();
    }
  }

  get isSearching(): boolean {
    return (this.bsqTriage ?? '').toString().trim().length >= 4;
  }

  nuevoTriage() {
    this._routerService.navigate(['/triage', 0]);
  }

  editarTriage(triage: any) {
    const id = triage?.triage_pk_triage ?? triage?.pk_triage ?? 0;

    if (triage?.triage_estado_triage === false || triage?.triage_estado_triage === null) {
      this._routerService.navigate(['/triage', id]);
      return;
    }

    // Si está aprobado/cerrado => solo superusuario puede editar
    if (this._loginService.getSuperUsuario() === true) {
      this._routerService.navigate(['/triage', id]);
    } else {
      toastr.error(
        `El Triage ha sido aprobado/cerrado y no tiene permisos para editarlo`,
        'Acceso Denegado!'
      );
    }
  }

  imprimirTriage(pk_triage: any) {
    const id = pk_triage;
    if (!id) {
      toastr.error('Sin ID', 'No hay pk_triage para imprimir.');
      return;
    }

    // Mostrar Loading con SweetAlert
    Swal.fire({
      title: 'Generando reporte..',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this._triageService.impresionTriageId(id).subscribe({
      next: (resp: any) => {
        const b64 = resp?.message;
        if (!b64 || typeof b64 !== 'string') {
          Swal.close();
          toastr.error('Respuesta inválida', 'No se recibió el PDF.');
          return;
        }

        // Convertir Base64 a Blob
        const byteChars = atob(b64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        Swal.close(); // cerrar loading antes de abrir el PDF

        // Abrir en nueva pestaña
        const win = window.open(url, '_blank');
        if (!win) {
          // Si bloquea el popup -> descargar
          const a = document.createElement('a');
          a.href = url;
          a.download = `triage_${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (err) => {
        Swal.close();
        toastr.error('Error', `${err} - No se pudo imprimir el Triage`);
      },
    });
  }

  verAuditoria(item: any): void {
    this.auditoriaData = {
      triage_fecha_creacion: item?.triage_fecha_creacion || null,
      triage_fecha_modificacion: item?.triage_fecha_modificacion || null,
    };
    $('#auditoriaModal').modal('show');
  }

  aprobarTriage(triage: any) {
    Swal.fire({
      html: `
        <p style="font-size:20px;font-weight:bold;">
          ¿Está seguro que desea aprobar este Triage?
        </p>
        <p style="font-size:14px;">
          Esta acción implica que el Triage no podrá ser modificado de nuevo.
        </p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#36c6d3',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        // Alinear a la interfaz EmergenciaTriage
          const triageBody: EmergenciaTriage = this.mapApiToEmergenciaTriage(triage);
          triageBody.estado_triage = true;
          triageBody.fk_usuario = this._loginService.getUserLocalStorage()?.pk_usuario;
          this.guardarTriageEstado(triageBody);
      }
    });
  }

  desaprobarTriage(triage: any) {
    if (this._loginService.getSuperUsuario()) {
      Swal.fire({
        html: `
          <p style="font-size:20px;font-weight:bold;">
            ¿Está seguro que desea des-aprobar este Triage?
          </p>
          <p style="font-size:14px;">
            Esta acción implica que el Triage podrá ser modificado de nuevo.
          </p>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#36c6d3',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          
           // Alinear a la interfaz EmergenciaTriage
          const triageBody: EmergenciaTriage = this.mapApiToEmergenciaTriage(triage);
          triageBody.estado_triage = false;
          triageBody.fk_usuario = this._loginService.getUserLocalStorage()?.pk_usuario;
          this.guardarTriageEstado(triageBody);
        }
      });
    } else {
      toastr.warning('Advertencia', 'Solo los super usuarios pueden desaprobar registros');
    }
  }

  /**
   * Convierte el JSON que viene del API (con prefijos `triage_...`) a la interfaz `EmergenciaTriage`
   * usada para guardar/actualizar.
   */
  private mapApiToEmergenciaTriage(item: any): EmergenciaTriage {
    return {
      pk_triage: item?.pk_triage ?? item?.triage_pk_triage ?? 0,

      fk_persona: item?.fk_persona ?? item?.triage_fk_persona ?? 0,
      casalud_id_fk: item?.casalud_id_fk ?? item?.triage_casalud_id_fk ?? 0,
      tip_seg_fk: item?.tip_seg_fk ?? item?.triage_tip_seg_fk ?? 0,

      fecha_triage: item?.fecha_triage ?? item?.triage_fecha_triage ?? '',
      hora_triage: item?.hora_triage ?? item?.triage_hora_triage ?? '',

      fk_usuario: item?.fk_usuario ?? item?.triage_fk_usuario ?? 0,

      signos_vitales_triage:
        item?.signos_vitales_triage ?? item?.triage_signos_vitales_triage ?? null,
      atencion_triage: item?.atencion_triage ?? item?.triage_atencion_triage ?? null,

      clasificacion_triage:
        item?.clasificacion_triage ?? item?.triage_clasificacion_triage ?? '',
      observacion_triage:
        item?.observacion_triage ?? item?.triage_observacion_triage ?? null,

      datos_auxiliares_triage:
        item?.datos_auxiliares_triage ?? item?.triage_datos_auxiliares_triage ?? null,

      estado_triage: item?.estado_triage ?? item?.triage_estado_triage ?? false,

      fecha_creacion: item?.fecha_creacion ?? item?.triage_fecha_creacion ?? null,
      fecha_modificacion:
        item?.fecha_modificacion ?? item?.triage_fecha_modificacion ?? null,
    };
  }

  private guardarTriageEstado(triage: any) {
   

    // Asegurar auditoría (usuario que realiza la acción)
    triage.fk_usuario =
      this._loginService.getUserLocalStorage()?.pk_usuario ?? triage.fk_usuario;


    this._triageService.guardarTriage(triage, 'U').subscribe({
      next: (resp: any) => {
        if (resp?.status === 'ok') {
          toastr.success('Éxito', 'Estado del Triage actualizado correctamente');

          // Refrescar lista respetando búsqueda/paginación
          if (this.bsqTriage?.length >= 4) {
            this.getTriageBusqueda(this.bsqTriage);
          } else {
            this.getAllTriage();
          }
        } else {
          toastr.error('Error', 'Problema al actualizar el estado del Triage');
        }
      },
      error: (err) => {
        toastr.error('Error', `${err} - Problema al actualizar el estado del Triage`);
      },
    });
  }

  getManchesterLabel(code: any): string {
    const c = (code ?? '').toString().trim().toUpperCase();
    switch (c) {
      case 'AZ':
        return 'AZ';
      case 'RO':
        return 'RO';
      case 'AM':
        return 'AM';
      case 'NA':
        return 'NA';
      case 'VE':
        return 'VE';
      default:
        return '---';
    }
  }

  getManchesterClass(code: any): string {
    const c = (code ?? '').toString().trim().toUpperCase();
    switch (c) {
      case 'AZ':
        return 'manchester-az';
      case 'RO':
        return 'manchester-ro';
      case 'AM':
        return 'manchester-am';
      case 'NA':
        return 'manchester-na';
      case 'VE':
        return 'manchester-ve';
      default:
        return 'manchester-nd';
    }
  }
}
