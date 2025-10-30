import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { MenuHospitalizacionComponent } from '../../../../componentes_reutilizables/menu_izq/menu.component';
import { EpicrisisService } from '../../../../services/hospitalizacion/epicrisis/epicrisis.service';
import { CasasSaludService } from '../../../../services/casas_salud/casas_salud.service';
import { LoginService } from '../../../../services/login.service';
import { environment } from '../../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
import { Epicrisis } from './epicrisis.interface';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-epicrisis',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MenuHospitalizacionComponent,
    NgSelectModule,
  ],
  templateUrl: './epicrisis.component.html',
  styles: ``,
})
export class EpicrisisComponent {
  private _epicrisisService = inject(EpicrisisService);
  private _casaSaludService = inject(CasasSaludService);
  private _loginService = inject(LoginService);
  private _routerService = inject(Router);

  epicrisisList: any[] = [];
  casaSaludBody: any = {};
  hcu: any = {};
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;
  ant: boolean;
  sig: boolean;

  constructor() {
    this.getCasaSalud();
    this.hcu = this._loginService.getHcuLocalStorage();
    this.getAllEpicrisis();
  }

  parametrizarEpicrisis(data: any): Epicrisis {
    return {
      _a: {
        pk_epi: data?.pk_epi ?? 0,
        casalud_id_fk: data?.casalud_id_fk ?? 0,
        fk_hcu: data?.fk_hcu ?? 0,
        estado_epi: data?.estado_epi ?? false,
      },

      _b: {
        resumen_cuadro_clinico: data?.resumen_cuadro_clinico_epi ?? null,
      },

      _c: {
        resumen_evolucion: data?.resumen_evolucion_complic_epi ?? null,
      },

      _d: {
        hallazgos_relevantes: data?.hallazgos_relevantes_epi ?? null,
      },

      _e: {
        resumen_tratamiento:
          data?.resumen_tratamiento_procedimiento_epi ?? null,
      },

      _f: {
        indicaciones_alta:
          data?.indicaciones_alta_epi?.indicaciones_alta ?? null,
        prox_control: data?.indicaciones_alta_epi?.prox_control ?? null, // Campo adicional no existe en BD
      },

      _h: {
        vivo: data?.condiciones_alta_epi?.vivo ?? false,
        fallecido: data?.condiciones_alta_epi?.fallecido ?? false,
        alta_medica: data?.condiciones_alta_epi?.alta_medica ?? false,
        alta_voluntaria: data?.condiciones_alta_epi?.alta_voluntaria ?? false,
        asintomatico: data?.condiciones_alta_epi?.asintomatico ?? false,
        discapacidad: data?.condiciones_alta_epi?.discapacidad ?? false,
        retiro_no_autorizado:
          data?.condiciones_alta_epi?.retiro_no_autorizado ?? false,
        def_menor_48: data?.condiciones_alta_epi?.def_menor_48 ?? false,
        def_mayor_48: data?.condiciones_alta_epi?.def_mayor_48 ?? false,
        dias_estada: data?.condiciones_alta_epi?.dias_estada ?? null,
        dias_reposo: data?.condiciones_alta_epi?.dias_reposo ?? null,
        observacion_h: data?.condiciones_alta_epi?.observacion_h ?? null,
      },

      _j: {
        medico_usu_id_fk: data?.medico_usu_id_fk ?? null,
      },
    };
  }

  getCasaSalud() {
    this._casaSaludService.getCasaSaludPrincipal().subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.casaSaludBody = resp.rows;
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

  getAllEpicrisis() {
    this._epicrisisService
      .getAllEpicrisis(this.desde, this.hcu.fk_hcu)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            //Validacion para numeracion y parametro desde
            //Si resp.rows sea mayor a 0 se actualiza sino no
            if (resp.data.length > 0) {
              this.epicrisisList = resp.data;

              this.numeracion = resp.paginacion.pag;
              this.ant = resp.paginacion.ant;
              this.sig = resp.paginacion.sig;
              /* console.log(resp); */
            }
          }
        },
        error: (err) => {
          // manejo de error
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Epicrisis (getAllEpicrisis) - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  avanzar() {
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAllEpicrisis();
  }

  retroceder() {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getAllEpicrisis();
  }

  aprobarEpicrisis(epicrisis: any) {
    Swal.fire({
      html: `
          <p style="font-size:20px;font-weight:bold;">
            ¿Está seguro que desea aprobar esta Epicrisis?
          </p>
          <p style="font-size:14px;">
            Esta acción implica que la epicrisis no podrá ser modificada de nuevo.
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
        epicrisis.estado_epi = true;
        epicrisis.medico_usu_id_fk =
          this._loginService.getUserLocalStorage().pk_usuario;
        let epicrisisFinal = this.parametrizarEpicrisis(epicrisis);

        this.guardarEpicrisis(epicrisisFinal);
      } else if (
        result.isDismissed &&
        result.dismiss === Swal.DismissReason.cancel
      ) {
      }
    });
  }

  desaprobarEpicrisis(epicrisis: any) {
    if (this._loginService.getSuperUsuario()) {
      Swal.fire({
        html: `
          <p style="font-size:20px;font-weight:bold;">
            ¿Está seguro que desea des-aprobar esta Epicrisis?
          </p>
          <p style="font-size:14px;">
            Esta acción implica que la epicrisis podrá ser modificada de nuevo.
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
          epicrisis.estado_epi = false;
          epicrisis.medico_usu_id_fk =
            this._loginService.getUserLocalStorage().pk_usuario;
          let epicrisisFinal = this.parametrizarEpicrisis(epicrisis);

          this.guardarEpicrisis(epicrisisFinal);
        } else if (
          result.isDismissed &&
          result.dismiss === Swal.DismissReason.cancel
        ) {
        }
      });
    }
  }

  guardarEpicrisis(epicrisis: Epicrisis) {
    //Asingo el pk usuario para auditoria
    epicrisis._j.medico_usu_id_fk =
      this._loginService.getUserLocalStorage().pk_usuario;

    //console.log(JSON.stringify(epicrisis));
    this._epicrisisService.guardarEpicrisis(epicrisis, 'U').subscribe({
      next: (resp) => {
        if (resp.status && resp.status === 'ok') {
          //this.evolucionBody = resp.data;
          toastr.success(`Epicrisis Guardada/ Actualizada`, 'Éxito');
          this.getAllEpicrisis();
        } else {
          // manejo de error
          toastr.error('Error', `Problema al actualizar epicrisis`);
        }
      },
      error: (err) => {
        // manejo de error
        toastr.error('Error', `${err} - Problema al actualizar epicrisis`);
      },
    });
  }

  editarEpicrisis(epicrisis: any) {
    if (this._loginService.getSuperUsuario()) {
      this._routerService.navigate(['/form_epicrisis', epicrisis.pk_epi, false]); //true es editar
      
    } else {
      if (epicrisis.estado_epi) {
        this._routerService.navigate(['/form_epicrisis', epicrisis.pk_epi, true]); //true es editar
       
      } else {
        this._routerService.navigate(['/form_epicrisis', epicrisis.pk_epi, false]); //true es editar
        
      }
    }
  }

  nuevoEpicrisis() {
    this._routerService.navigate(['/form_epicrisis', 0, false]); //true es editar
  }

  imprimirEpicrisis(epicrisis: any) {
    const id = epicrisis;
    if (!id) {
      toastr.error('Sin ID', 'No hay pk_epi para imprimir.');
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

    this._epicrisisService.impresionEpicrisisId(id).subscribe({
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
          a.download = `epicrisis_${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (err) => {
        Swal.close();
        toastr.error(
          'Error',
          `${err} - No se pudo imprimir el Form. Evolución`
        );
      },
    });
  }
  
}
