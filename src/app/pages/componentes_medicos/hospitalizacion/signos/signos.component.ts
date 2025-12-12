import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuHospitalizacionComponent } from '../../../../componentes_reutilizables/menu_izq/menu.component';
import { SignosBComponent } from './signos-b.component';
import { SignosCComponent } from './signos-c.component';
import { SignosDComponent } from './signos-d.component';
import { SignosEComponent } from './signos-e.component';
import { SignosFComponent } from './signos-f.component';
import { LoginService } from '../../../../services/login.service';
import { SignosService } from '../../../../services/hospitalizacion/signos/signos.service';
import Swal from 'sweetalert2';

declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-signos',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MenuHospitalizacionComponent,
    SignosBComponent,
    SignosCComponent,
    SignosDComponent,
    SignosEComponent,
    SignosFComponent
  ],
  templateUrl: './signos.component.html',
  styles: ``
})
export class SignosComponent implements AfterViewInit {
  private _loginService = inject(LoginService);
  private _signosService = inject(SignosService);
  
  @ViewChild(SignosBComponent) signosBComponent!: SignosBComponent;
  @ViewChild(SignosCComponent) signosCComponent!: SignosCComponent;
  @ViewChild(SignosDComponent) signosDComponent!: SignosDComponent;
  @ViewChild(SignosEComponent) signosEComponent!: SignosEComponent;
  @ViewChild(SignosFComponent) signosFComponent!: SignosFComponent;
  
  tabActivo: string = 'B';
  datos_hcu: any;

  constructor() {
    this.datos_hcu = this._loginService.getHcuLocalStorage();
  }

  ngAfterViewInit(): void {
    // Ejecutar getAllSignosB cuando se carga inicialmente el tab B
    if (this.tabActivo === 'B' && this.signosBComponent) {
      this.signosBComponent.getAllSignosB();
    }
  }

  /**
   * Cambia el tab activo y ejecuta la función correspondiente según el tab
   * @param tab - El identificador del tab (B, C, D, E, F)
   */
  cambiarTab(tab: string): void {
    // Solo cambiar si es un tab diferente
    if (this.tabActivo !== tab) {
      this.tabActivo = tab;
      
      // Usar setTimeout para asegurar que los componentes estén disponibles
      setTimeout(() => {
        switch (tab) {
          case 'B':
            if (this.signosBComponent) {
              this.signosBComponent.getAllSignosB();
            }
            break;
          case 'C':
            if (this.signosCComponent) {
              this.signosCComponent.getAllSignosC();
            }
            break;
          case 'D':
            if (this.signosDComponent) {
              this.signosDComponent.getAllSignosD();
            }
            break;
          case 'E':
            if (this.signosEComponent) {
              this.signosEComponent.getAllSignosE();
            }
            break;
          case 'F':
            if (this.signosFComponent) {
              this.signosFComponent.getAllSignosF();
            }
            break;
        }
      }, 100);
    }
  }

  /**
   * Función para imprimir signos vitales
   * @param tipo - 'periodo' para imprimir por periodo, 'total' para imprimir todo
   */
  imprimir(tipo: 'periodo' | 'total'): void {
    // Validar que existan los datos necesarios
    if (!this.datos_hcu || !this.datos_hcu.fk_hcu) {
      toastr.error('Sin datos', 'No se encontraron datos del paciente');
      return;
    }

    const fk_hcu = this.datos_hcu.fk_hcu;
    const fecha_desde = tipo === 'periodo' ? this.datos_hcu.fecha_ciclohosp : null;

    // Mostrar loading
    Swal.fire({
      title: 'Generando reporte..',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Llamar al servicio de impresión
    this._signosService.impresionSignos(fk_hcu, fecha_desde,null).subscribe({
      next: (resp: any) => {
        const b64 = resp?.message;
        if (!b64 || typeof b64 !== 'string') {
          Swal.close();
          toastr.error('Respuesta inválida', 'No se recibió el PDF.');
          return;
        }

        // Convertir base64 a Blob
        const byteChars = atob(b64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        Swal.close();

        // Intentar abrir en nueva ventana
        const win = window.open(url, '_blank');
        if (!win) {
          // Si no se puede abrir, descargar el archivo
          const a = document.createElement('a');
          a.href = url;
          a.download = `signos_vitales_${fk_hcu}_${tipo}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        // Liberar memoria después de 60 segundos
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (err) => {
        Swal.close();
        toastr.error('Error', `${err} - No se pudo imprimir Signos Vitales`);
      },
    });
  }
}
