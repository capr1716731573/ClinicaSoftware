import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { Router } from '@angular/router';
import { HistoriaClinicaService } from '../../../services/historia_clinica/historia_clinica.service';
import { SkeletonTableComponent } from '../../../componentes_reutilizables/skeleton/skeleton-table.component';
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
  historiaclinicaList: any[] = [];
  bsqHistoriaClinica: string = '';
  opcion: string = 'I';
  desde: number = 0;

  intervalo = environment.filas;
  numeracion: number = 1;
  loading: boolean = true;

  constructor() {
    this.getAllHistoriaClinica();
  }

  controlManejoPaginacion() {
    if ((this.desde -= this.intervalo) < 0 || this.numeracion < 0) {
      this.desde = 0;
      this.numeracion = 1;
    } else {
      this.desde -= this.intervalo;
      this.numeracion -= 1;
    }
  }

  getAllHistoriaClinica() {
    this.loading = true;
    this._historiaClinicaService.getAllHistoriaClinica(this.desde).subscribe({
      next: (resp) => {
        this.loading = false;
        if (resp.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          if (resp.data.length > 0) {
            this.historiaclinicaList = resp.data;
          } else {
            this.controlManejoPaginacion();
          }
        }
      },
      error: (err) => {
        this.loading = false;
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
      },
      error: (err) => {
        this.loading = false;
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
      this.getAllHistoriaClinicaBusqueda(this.bsqHistoriaClinica);
      // tu lógica aquí
    } else if (this.bsqHistoriaClinica.length === 0) {
      this.desde = 0;
      this.numeracion = 1;
      this.getAllHistoriaClinica();
    }
  }

  avanzar() {
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAllHistoriaClinica();
  }

  retoceder() {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
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
