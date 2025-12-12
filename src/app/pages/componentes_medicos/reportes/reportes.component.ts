import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CicloHospitalizacionService } from '../../../services/ciclo_hospitalizacion/ciclo_hospitalizacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reportes',
  imports: [FormsModule],
  templateUrl: './reportes.component.html',
  styles: ``
})
export class ReportesComponent {
  private cicloHospitalizacionService = inject(CicloHospitalizacionService);
  
  mes1: number | null = null;
  anio1: number | null = null;
  
  // Generar array de años desde el año actual hasta 2000
  anios: number[] = [];
  
  constructor() {
    const añoActual = new Date().getFullYear();
    for (let i = añoActual; i >= 2000; i--) {
      this.anios.push(i);
    }
  }

  generarReporte() {
    // Validar que mes y año estén llenos
    if (!this.mes1 || !this.anio1) {
      Swal.fire({
        title: '¡Atención!',
        text: 'Por favor complete el Mes y el Año antes de generar el reporte.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    // Mostrar SweetAlert2 de carga
    Swal.fire({
      title: 'Generando Reporte',
      text: 'Por favor espere...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Llamar al servicio para descargar el reporte
    this.cicloHospitalizacionService.descargarReporteINEC(this.mes1, this.anio1).subscribe({
      next: () => {
        // Cerrar el loading y el servicio mostrará el mensaje de éxito
        Swal.close();
      },
      error: (err) => {
        // Cerrar el loading antes de mostrar el error
        Swal.close();
        console.error('Error al generar reporte:', err);
      }
    });
  }

  generarCensoActual() {
    // Mostrar SweetAlert2 de carga
    Swal.fire({
      title: 'Generando Reporte',
      text: 'Por favor espere...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Llamar al servicio para descargar el censo actual
    this.cicloHospitalizacionService.descargarCensoActual().subscribe({
      next: () => {
        // Cerrar el loading y el servicio mostrará el mensaje de éxito
        Swal.close();
      },
      error: (err) => {
        // Cerrar el loading antes de mostrar el error
        Swal.close();
        console.error('Error al generar censo actual:', err);
      }
    });
  }
}
