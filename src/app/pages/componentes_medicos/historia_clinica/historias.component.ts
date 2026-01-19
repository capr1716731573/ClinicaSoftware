import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { Router } from '@angular/router';
import { HistoriaClinicaService } from '../../../services/historia_clinica/historia_clinica.service';
import { SkeletonTableComponent } from '../../../componentes_reutilizables/skeleton/skeleton-table.component';
import { LoginService } from '../../../services/login.service';
import { environment } from '../../../../environments/environment';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-historias',
  imports: [CommonModule, FormsModule, SkeletonTableComponent],
  templateUrl: './historias.component.html',
  styles: ``,
})
export class HistoriasComponent {
  private _historiaClinicaService = inject(HistoriaClinicaService);
  private _routerService = inject(Router);
  private _loginService = inject(LoginService)
  historiaclinicaList: any[] = [];
  bsqHistoriaClinica: string = '';
  opcion: string = 'I';
  desde: number = 0;

  intervalo = environment.filas;
  numeracion: number = 1;
  loading: boolean = true;
  hasNext: boolean = true;
  private prevDesde = 0;
  private prevNumeracion = 1;
  private prevHasNext = true;
  isSearchActive: boolean = false;

  constructor() {
    this.getAllHistoriaClinica();
    this._loginService.removeHcuLocalStorage();
  }

  private revertPagination(lockNext: boolean = false) {
    this.desde = this.prevDesde ?? 0;
    this.numeracion = this.prevNumeracion ?? 1;
    this.hasNext = lockNext ? false : (this.prevHasNext ?? true);
  }

  private resetPagination() {
    this.desde = 0;
    this.numeracion = 1;
    this.prevDesde = 0;
    this.prevNumeracion = 1;
    this.prevHasNext = true;
    this.hasNext = true;
  }

  canGoNext(): boolean {
    return !this.loading && !this.isSearchActive && this.hasNext;
  }

  canGoPrev(): boolean {
    return !this.loading && !this.isSearchActive && this.numeracion > 1 && this.desde > 0;
  }

  private notifyPaginationBlocked(direction: 'next' | 'prev') {
    if (this.loading) {
      toastr.info('Cargando...', 'Espera a que termine la carga para navegar.');
      return;
    }
    if (this.isSearchActive) {
      toastr.warning(
        'Búsqueda activa',
        'Desactiva la búsqueda (borra el texto) para usar la paginación.'
      );
      return;
    }
    if (direction === 'next') {
      toastr.info('Última página', 'No hay más registros para mostrar.');
    } else {
      toastr.info('Primera página', 'Ya estás en la primera página.');
    }
  }

  getAllHistoriaClinica() {
    this.loading = true;
    this._historiaClinicaService.getAllHistoriaClinica(this.desde).subscribe({
      next: (resp) => {
        this.loading = false;
        if (resp?.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          if (resp.data && resp.data.length > 0) {
            this.historiaclinicaList = resp.data;
            // optimista: si viene "llena", probablemente hay siguiente
            this.hasNext = resp.data.length === this.intervalo;
          } else {
            // Si venimos de un "avanzar" y no hay data, volvemos a la última página válida y bloqueamos avanzar
            if (this.desde !== this.prevDesde) {
              const direction: 'next' | 'prev' = this.desde > this.prevDesde ? 'next' : 'prev';
              this.revertPagination(direction === 'next');
              this.notifyPaginationBlocked(direction);
            } else {
              this.historiaclinicaList = [];
              this.hasNext = false;
            }
          }
        } else {
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Historias Clinicas (getAllHistoriaClinica) - Respuesta inválida del servidor.`,
            confirmButtonText: 'Aceptar',
          });
        }
      },
      error: (err) => {
        this.loading = false;
        if (this.desde !== this.prevDesde) {
          const direction: 'next' | 'prev' = this.desde > this.prevDesde ? 'next' : 'prev';
          this.revertPagination(direction === 'next');
          this.notifyPaginationBlocked(direction);
        }
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Historias Clinicas (getAllHistoriaClinica) - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getAllHistoriaClinicaBusqueda(bsq: string) {
    this.loading = true;
    this._historiaClinicaService.getBsqHistoriaClinica(bsq).subscribe({
      next: (resp) => {
        this.loading = false;
        if (resp.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          if (resp.data && resp.data.length > 0) {
            this.historiaclinicaList = resp.data;
          } else {
            this.historiaclinicaList = [];
          }
        }
        this.hasNext = false; // en búsqueda no paginamos
      },
      error: (err) => {
        this.loading = false;
        this.hasNext = false;
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `HistoriaClinica (getAllHistoriaClinicaBusqueda) - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  buscarHistoriaClinica() {
    if (this.bsqHistoriaClinica.length >= 4) {
      this.isSearchActive = true;
      this.desde = 0;
      this.numeracion = 1;
      this.getAllHistoriaClinicaBusqueda(this.bsqHistoriaClinica);
      // tu lógica aquí
    } else if (this.bsqHistoriaClinica.length === 0) {
      this.isSearchActive = false;
      this.resetPagination();
      this.getAllHistoriaClinica();
    }
  }

  avanzar() {
    if (!this.canGoNext()) {
      this.notifyPaginationBlocked('next');
      return;
    }
    this.prevDesde = this.desde;
    this.prevNumeracion = this.numeracion;
    this.prevHasNext = this.hasNext;
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAllHistoriaClinica();
  }

  retoceder() {
    if (!this.canGoPrev()) {
      this.notifyPaginationBlocked('prev');
      return;
    }
    // Guardamos estado anterior por si hay error y toca revertir
    this.prevDesde = this.desde;
    this.prevNumeracion = this.numeracion;
    this.prevHasNext = this.hasNext;
    this.desde = Math.max(0, this.desde - this.intervalo);
    this.numeracion = Math.max(1, this.numeracion - 1);
    this.hasNext = true;
    this.getAllHistoriaClinica();
  }

  nuevoHistoriaClinica() {
    this._routerService.navigate(['/hcu', 0]);
  }

  editarHistoriaClinica(pk_historia: number) {
    this._routerService.navigate(['/hcu', pk_historia]);
  }

  anexosHistoriaClinica(pk_historia: number) {
    this._routerService.navigate(['/anexos', pk_historia]);
  }

  ciclosHospitalizacion(pk_historia: number) {
    this._routerService.navigate(['/ingresos', pk_historia]);
  }

  historialClinico(pk_historia:number){
    const id = pk_historia;
    if (!id) {
      toastr.error('Sin ID', 'No hay pk_historia para imprimir.');
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

    this._historiaClinicaService.impresionHistorialClinico(id).subscribe({
      next: (resp: any) => {
        // La API suele devolver { message: base64 }, pero soportamos string directo por seguridad
        const b64 =
          resp?.message ?? resp?.data ?? resp?.base64 ?? (typeof resp === 'string' ? resp : null);

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

        Swal.close(); // Cerrar loading antes de abrir el PDF

        // Abrir en nueva pestaña
        const win = window.open(url, '_blank');
        if (!win) {
          // Si bloquea el popup -> descargar
          const a = document.createElement('a');
          a.href = url;
          a.download = `historial_clinico_${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (err) => {
        Swal.close();
        toastr.error('Error', `${err} - No se pudo imprimir el Historial Clínico`);
      },
    });
  }
}
