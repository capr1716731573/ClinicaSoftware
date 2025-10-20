import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { Router } from '@angular/router';
import { EmergenciaService } from '../../../services/emergencia/emergencia.service';
import { LoginService } from '../../../services/login.service';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-lista008',
  imports: [CommonModule, FormsModule],
  templateUrl: './lista008.component.html',
  styles: ``,
})
export class Lista008Component {
  private _lista008Service = inject(EmergenciaService);
  private _routerService = inject(Router);
  private _loginService = inject(LoginService);
  private _008Service = inject(EmergenciaService);
  emergenciaList: any[] = [];
  bsqEmergencia: string = '';
  opcion: string = 'I';

  //Variables de Paginacion
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;
  private prevDesde = 0;
  private prevNumeracion = 1;

  constructor() {
    this.getAllEmergencia();
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //@@@ Metodos de Paginacion  @@@@@
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  revertirPaginacion() {
    this.desde = this.prevDesde ?? 0;
    this.numeracion = this.prevNumeracion ?? 1;
  }

  avanzar() {
    // guarda estado previo
    this.prevDesde = this.desde;
    this.prevNumeracion = this.numeracion;

    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAllEmergencia();
  }

  retroceder() {
    // guarda estado previo
    this.prevDesde = this.desde;
    this.prevNumeracion = this.numeracion;

    this.desde = Math.max(0, this.desde - this.intervalo);
    this.numeracion = Math.max(1, this.numeracion - 1);
    this.getAllEmergencia();
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 
  getAllEmergencia() {
    this._lista008Service.getAllEmergencia(this.desde).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          if (resp.data && resp.data.length > 0) {
            this.emergenciaList = resp.data;
          } else {
            // No hay datos: vuelve a los valores previos
            this.revertirPaginacion();
          }
        }
      },
      error: (err) => {
        // Si hay error, también conviene revertir
        this.revertirPaginacion();
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Listado de Formularios 008 - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getEmergenciaBusqueda(bsq: string) {
    this._lista008Service.getBsqEmergencia(bsq).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          if (resp.data && resp.data.length > 0) {
            this.emergenciaList = resp.data;
          } else {
            this.emergenciaList = [];
          }
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Emergencia Bsq - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  buscarEmergencia() {
    if (this.bsqEmergencia.length >= 4) {
      this.getEmergenciaBusqueda(this.bsqEmergencia);
      // tu lógica aquí
    } else if (this.bsqEmergencia.length === 0) {
      this.desde = 0;
      this.numeracion = 1;
      this.getAllEmergencia();
    }
  }
  

  nuevo008() {
    this._routerService.navigate(['/emergencia', 0]);
  }

  editar008(emergencia: any) {
    if (emergencia.estado_emerg === false || emergencia.estado_emerg === null) {
      this._routerService.navigate(['/emergencia', emergencia.pk_emerg]);
    } else {
      if (this._loginService.getSuperUsuario() === true) {
        this._routerService.navigate(['/emergencia', emergencia.pk_emerg]);
      } else {
        toastr.error(
          `El Formulario 008 ha sido cerrado y no tiene permisos para editarlo`,
          'Acceso Denegado!'
        );
      }
    }
  }

  imprimirForm008(pk_emergencia) {
    const id = pk_emergencia;
    if (!id) {
      toastr.error('Sin ID', 'No hay pk_emerg para imprimir.');
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

    this._008Service.impresionEmergenciaId(id).subscribe({
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

        Swal.close(); // 🔹 Cerrar loading antes de abrir el PDF

        // Abrir en nueva pestaña
        const win = window.open(url, '_blank');
        if (!win) {
          // Si bloquea el popup -> descargar
          const a = document.createElement('a');
          a.href = url;
          a.download = `form008_${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (err) => {
        Swal.close();
        toastr.error('Error', `${err} - No se pudo imprimir el Form. 008`);
      },
    });
  }
}
