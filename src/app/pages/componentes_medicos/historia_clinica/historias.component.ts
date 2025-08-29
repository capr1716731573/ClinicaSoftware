import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { Router } from '@angular/router';
import { HistoriaClinicaService } from '../../../services/historia_clinica/historia_clinica.service';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-historias',
  imports: [CommonModule, FormsModule],
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
    this._historiaClinicaService.getAllHistoriaClinica(this.desde).subscribe({
      next: (resp) => {
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
    this._historiaClinicaService.getBsqHistoriaClinica(bsq).subscribe({
      next: (resp) => {
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
}
