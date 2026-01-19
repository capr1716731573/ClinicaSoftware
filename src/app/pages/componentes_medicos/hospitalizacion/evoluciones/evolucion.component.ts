import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { format } from '@formkit/tempo';
import { MenuHospitalizacionComponent } from '../../../../componentes_reutilizables/menu_izq/menu.component';
import { FormsModule } from '@angular/forms';
import { EvolucionService } from '../../../../services/hospitalizacion/evolucion/evolucion.service';
import Swal from 'sweetalert2';
import { CasasSaludService } from '../../../../services/casas_salud/casas_salud.service';
import { LoginService } from '../../../../services/login.service';
import { CabeceraDetalleService } from '../../../../services/cabecera_detalle/cabecera-detalle.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { SkeletonTableComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-table.component';
import { environment } from '../../../../../environments/environment';
declare var toastr: any;
declare var $: any;

export interface Evolucion {
  pk_evo: number; // serial4 (PK)
  fecha_creacion_evo: any; // json NOT NULL
  fecha_modificacion_evo: any | null; // json NULL
  fk_hcu: number; // int4 NOT NULL (FK historia_clinica)
  fk_tipo_nota_evo: number; // int4 NOT NULL (FK catalogo_detalle)
  fecha_evo: string; // date NOT NULL (YYYY-MM-DD)
  hora_evo: string; // time NOT NULL (HH:mm:ss)
  evolucion_evo: string; // text NOT NULL
  prescripcion_evo: string | null; // text NULL
  admin_medica_evo: boolean; // bool NOT NULL
  aprobado_evo: boolean; // bool NOT NULL
  casalud_id_fk: number | null; // int8 NULL (FK casas_salud)
  user_admin_medica_evo: any | null;
  user_aprobado_evo: any | null;
  pk_usuario: number | null;
  actual: boolean | null;
}

@Component({
  selector: 'app-evolucion',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MenuHospitalizacionComponent,
    NgSelectModule,
    SkeletonTableComponent,
  ],
  templateUrl: './evolucion.component.html',
  styleUrl: `evolucion.component.css`,
})
export class EvolucionComponent {
  private _evolucionService = inject(EvolucionService);
  private _casaSaludService = inject(CasasSaludService);
  private _loginService = inject(LoginService);
  private _detalleService = inject(CabeceraDetalleService);

  evolucionList: any[] = [];
  evolucionBody: Evolucion = {
    pk_evo: 0,
    fecha_creacion_evo: null,
    fecha_modificacion_evo: null,
    fk_hcu: 0,
    fk_tipo_nota_evo: null as any, // Puede ser null inicialmente
    fecha_evo: '',
    hora_evo: '',
    evolucion_evo: '',
    prescripcion_evo: null,
    admin_medica_evo: false,
    aprobado_evo: false,
    casalud_id_fk: null,
    user_admin_medica_evo: null,
    user_aprobado_evo: null,
    pk_usuario: null,
    actual: true,
  };
  casaSaludBody: any = {};
  tiposEvolucion: any[] = [];
  hcu: any = {};
  user: any = {};
  bsqEvolucion: string = '';
  opcion: string = 'I';
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;
  loading: boolean = true;
  ant: boolean;
  sig: boolean;

  constructor() {
    this.hcu = this._loginService.getHcuLocalStorage();
    this.nuevaEvolucion(); // Inicializar evolucionBody primero
    this.getCasaSalud();
    this.getAllEvoluciones();
    this.getDetalle();
  }

  getCasaSalud() {
    this._casaSaludService.getCasaSaludPrincipal().subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.casaSaludBody = resp.rows;
          // Actualizar evolucionBody si existe y no tiene casalud_id_fk
          if (this.evolucionBody && !this.evolucionBody.casalud_id_fk) {
            this.evolucionBody.casalud_id_fk = this.casaSaludBody?.casalud_id_pk || null;
          }
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

  getDetalle() {
    this._detalleService.getAllCabecerasDetalle2('TIP_EVO', true).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.tiposEvolucion = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Lista Tipo Evoluciones - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getAllEvoluciones() {
    this.loading = true;
    this._evolucionService
      .getAllEvolucion(this.desde, this.hcu.fk_hcu)
      .subscribe({
        next: (resp) => {
          this.loading = false;
          if (resp.status === 'ok') {
            //Validacion para numeracion y parametro desde
            //Si resp.rows sea mayor a 0 se actualiza sino no
            if (resp.data.length > 0) {
              this.evolucionList = resp.data;

              this.numeracion = resp.paginacion.pag;
              this.ant = resp.paginacion.ant;
              this.sig = resp.paginacion.sig;
              /* console.log(resp); */
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

  buscarEvolucion() {
    if (this.bsqEvolucion.length >= 4) {
      this.getAllEvolucionBusqueda(this.bsqEvolucion);
      // tu lógica aquí
    } else if (this.bsqEvolucion.length === 0) {
      this.desde = 0;
      this.numeracion = 1;
      this.getAllEvoluciones();
    }
  }

  getAllEvolucionBusqueda(bsq: string) {
    this.loading = true;
    this._evolucionService.getBsqEvolucion(bsq, this.hcu.fk_hcu).subscribe({
      next: (resp) => {
        this.loading = false;
        if (resp.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          if (resp.data.length > 0) {
            this.evolucionList = resp.data;
          } else {
            this.evolucionList = [];
          }

          this.numeracion = resp.paginacion.pag;
          this.ant = resp.paginacion.ant;
          this.sig = resp.paginacion.sig;
        }
      },
      error: (err) => {
        this.loading = false;
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Evolución - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  abrirModalNuevaEvolucion() {
    this.nuevaEvolucion();
    $('#evolucionModal').modal('show');
  }

  nuevaEvolucion() {
    const ahora = new Date();
    this.opcion = 'I';
    console.log(`opcion nuevo ===> ${this.opcion}`)

    this.evolucionBody = {
      pk_evo: 0,
      fecha_creacion_evo: null,
      fecha_modificacion_evo: null,
      fk_hcu: this.hcu?.fk_hcu || 0,
      fk_tipo_nota_evo: null,
      fecha_evo: format(ahora, 'YYYY-MM-DD'),
      hora_evo: format(ahora, 'HH:mm:ss'),
      evolucion_evo: '',
      prescripcion_evo: null,
      admin_medica_evo: false,
      aprobado_evo: false,
      casalud_id_fk: this.casaSaludBody?.casalud_id_pk || null,
      user_admin_medica_evo: null,
      user_aprobado_evo: null,
      pk_usuario: null,
      actual: true,
    };
  }

  editarEvolucion(item: any) {
    this.opcion = 'U';
    this.passItemEvolucion(item);
    $('#evolucionModal').modal('show');
  }

  validarGuardar() {
    if (
      !this.evolucionBody ||
      !this.evolucionBody.fk_hcu ||
      this.evolucionBody.fk_hcu === 0 ||
      this.evolucionBody.fk_hcu === undefined ||
      this.evolucionBody.fk_hcu === null ||
      !this.evolucionBody.fk_tipo_nota_evo ||
      this.evolucionBody.fk_tipo_nota_evo === 0 ||
      this.evolucionBody.fk_tipo_nota_evo === undefined ||
      this.evolucionBody.fk_tipo_nota_evo === null ||
      !this.evolucionBody.casalud_id_fk ||
      this.evolucionBody.casalud_id_fk === 0 ||
      this.evolucionBody.casalud_id_fk === undefined ||
      this.evolucionBody.casalud_id_fk === null ||
      !this.evolucionBody.evolucion_evo ||
      this.evolucionBody.evolucion_evo === undefined ||
      this.evolucionBody.evolucion_evo === null
    )
      return false;
    return true;
  }

  guardarEvolucion() {
    Swal.fire({
      html: `
      <p style="font-size:20px;font-weight:bold;">
        ¿Está seguro que desea guardar esta Evolución?
      </p>
      <p style="font-size:14px;">
        Esta acción implica guardar la información proporcionada de la evolución.
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
        //Reprogramo hora y fecha
        if (this.opcion === 'I') {
          const ahora = new Date();
          this.evolucionBody.fecha_evo = format(ahora, 'YYYY-MM-DD');
          this.evolucionBody.hora_evo = format(ahora, 'HH:mm:ss');
          this.evolucionBody.casalud_id_fk = this.casaSaludBody?.casalud_id_pk;
        }

        //Asingo el pk usuario para auditoria
        this.evolucionBody.pk_usuario =
          this._loginService.getUserLocalStorage().pk_usuario;
        this.evolucionBody.evolucion_evo =
          this._loginService.reemplazarComillasSimples(
            this.evolucionBody.evolucion_evo
          );
        this.evolucionBody.prescripcion_evo =
          this._loginService.reemplazarComillasSimples(
            this.evolucionBody.prescripcion_evo
          );
          console.log(`opcion ===> ${this.opcion}`)

        this._evolucionService
          .guardarEvolucion(this.evolucionBody, this.opcion)
          .subscribe({
            next: (resp) => {
              if (resp.status && resp.status === 'ok') {
                // Solo cambiar a 'U' si fue una inserción exitosa
                if (this.opcion === 'I') {
                  this.opcion = 'U';
                }
                this.evolucionBody = resp.data;
                toastr.success('Éxito', `Evolución Guardada`);
                $('#evolucionModal').modal('hide');
                if (this.bsqEvolucion.length >= 4) {
                  this.buscarEvolucion();
                } else {
                  this.getAllEvoluciones();
                }
              } else {
                // manejo de error
                toastr.error('Error', `Problema al crear registro`);
              }
            },
            error: (err) => {
              // manejo de error
              toastr.error('Error', `${err} - Problema al crear registro 2`);
            },
          });
      } else if (
        result.isDismissed &&
        result.dismiss === Swal.DismissReason.cancel
      ) {
      }
    });
  }

  guardarEvolucion2(evolucion: any) {
    //Asingo el pk usuario para auditoria
    evolucion.pk_usuario = this._loginService.getUserLocalStorage().pk_usuario;

    this._evolucionService.guardarEvolucion(evolucion, this.opcion).subscribe({
      next: (resp) => {
        this.opcion = `U`;
        if (resp.status && resp.status === 'ok') {
          //this.evolucionBody = resp.data;
          toastr.success(`Evolución Guardada/ Actualizada`, 'Éxito');
          if (this.bsqEvolucion.length >= 4) {
            this.buscarEvolucion();
          } else {
            this.getAllEvoluciones();
          }
        } else {
          // manejo de error
          toastr.error('Error', `Problema al actualizar evolución`);
        }
      },
      error: (err) => {
        // manejo de error
        toastr.error('Error', `${err} - Problema al actualizar evolución 2`);
      },
    });
  }

  avanzar() {
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAllEvoluciones();
  }

  retroceder() {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getAllEvoluciones();
  }

  passItemEvolucion(item: any) {
    this.evolucionBody = {
      pk_evo: item.pk_evo,
      fecha_creacion_evo: item.fecha_creacion_evo,
      fecha_modificacion_evo: item.fecha_modificacion_evo,
      fk_hcu: item.fk_hcu,
      fk_tipo_nota_evo: item.fk_tipo_nota_evo,
      fecha_evo: item.fecha_evo,
      hora_evo: item.hora_evo,
      evolucion_evo: item.evolucion_evo,
      prescripcion_evo: item.prescripcion_evo,
      admin_medica_evo: item.admin_medica_evo,
      aprobado_evo: item.aprobado_evo,
      casalud_id_fk: item.casalud_id_fk,
      user_admin_medica_evo: item.user_admin_medica_evo,
      user_aprobado_evo: item.user_aprobado_evo,
      pk_usuario: this._loginService.getUserLocalStorage().pk_usuario,
      actual: item.actual,
    };
  }

  parametrizarUser() {
    const userLocalStorage: any = this._loginService.getUserLocalStorage();
    let user: any = {};
    const ahora = new Date();
    user.pk_usuario = userLocalStorage.pk_usuario;
    user.fk_persona = userLocalStorage.fk_persona;
    user.apellidomat_persona = userLocalStorage.apellidomat_persona;
    user.apellidopat_persona = userLocalStorage.apellidopat_persona;
    user.nombre_primario_persona = userLocalStorage.nombre_primario_persona;
    user.nombre_secundario_persona = userLocalStorage.nombre_secundario_persona;
    user.numidentificacion_persona = userLocalStorage.numidentificacion_persona;
    user.fecha = format(ahora, 'YYYY-MM-DD');
    user.hora = format(ahora, 'HH:mm:ss');

    return user;
  }

  aprobarEvolucion(evolucionItem: any) {
    // Si viene de un <a> o botón, evita navegación por defecto
    //this.passItemEvolucion(evolucionItem);
    if (this.accionBloqueoEditarSuperUsuario(evolucionItem)) {
      return;
    }
    this.opcion = 'U';

    Swal.fire({
      html: `
      <p style="font-size:20px;font-weight:bold;">
        ¿Está seguro que desea aprobar esta Evolución?
      </p>
      <p style="font-size:14px;">
        Esta acción implica que la evolucion no podrá ser modificada.
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
        evolucionItem.aprobado_evo = true;
        evolucionItem.user_aprobado_evo = this.parametrizarUser();

        this.guardarEvolucion2(evolucionItem);
      } else if (
        result.isDismissed &&
        result.dismiss === Swal.DismissReason.cancel
      ) {
      }
    });
  }

  adminMedicamentoEvolucion(evolucionItem: any) {
    if (!this._loginService.getSuperUsuario()) {
      if (!evolucionItem.actual) return;
    }

    // Si viene de un <a> o botón, evita navegación por defecto
    //this.passItemEvolucion(evolucionItem);
    this.opcion = 'U';

    Swal.fire({
      html: `
      <p style="font-size:20px;font-weight:bold;">
        ¿Está seguro que desea confirmar la Administración de Medicamentos de esta Evolución?
      </p>
      <p style="font-size:14px;">
        Esta acción implica confirmar la Administración de Medicamentos de esta evolución.
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
        evolucionItem.admin_medica_evo = true;
        evolucionItem.user_admin_medica_evo = this.parametrizarUser();

        this.guardarEvolucion2(evolucionItem);
      } else if (
        result.isDismissed &&
        result.dismiss === Swal.DismissReason.cancel
      ) {
      }
    });
  }

  quitarAprobarEvolucion(evolucionItem: any) {
    if (this._loginService.getSuperUsuario()) {
      // Si viene de un <a> o botón, evita navegación por defecto
      //this.passItemEvolucion(evolucionItem);
      this.opcion = 'U';

      Swal.fire({
        html: `
      <p style="font-size:20px;font-weight:bold;">
        ¿Está seguro que desea des-aprobar esta Evolución?
      </p>
      <p style="font-size:14px;">
        Esta acción implica que la evolución podrá ser modificada de nuevo.
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
          evolucionItem.aprobado_evo = false;
          evolucionItem.user_aprobado_evo = null;

          this.guardarEvolucion2(evolucionItem);
        } else if (
          result.isDismissed &&
          result.dismiss === Swal.DismissReason.cancel
        ) {
        }
      });
    }
  }

  quitarAdminMedicamentoEvolucion(evolucionItem: any) {
    if (this._loginService.getSuperUsuario()) {
      // Si viene de un <a> o botón, evita navegación por defecto
      //this.passItemEvolucion(evolucionItem);
      this.opcion = 'U';

      Swal.fire({
        html: `
      <p style="font-size:20px;font-weight:bold;">
        ¿Está seguro que desea suprimir la confirmación la Administración de Medicamentos de esta Evolución?
      </p>
      <p style="font-size:14px;">
        Esta acción implica que suprimir la confirmación la Administración de Medicamentos de esta evolución.
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
          evolucionItem.admin_medica_evo = false;
          evolucionItem.user_admin_medica_evo = null;

          this.guardarEvolucion2(evolucionItem);
        } else if (
          result.isDismissed &&
          result.dismiss === Swal.DismissReason.cancel
        ) {
        }
      });
    }
  }

  abrirAuditoria(evolucion: any) {
    this.passItemEvolucion(evolucion);
    $('#auditoriaModal').modal('show');
  }

  cerrarModalAuditoria() {
    this.nuevaEvolucion();
    $('#auditoriaModal').modal('hide');
  }

  accionBloqueoEditarSuperUsuario(evolucion: any) {
    let respuesta = false;

    // Protección contra null o undefined
    if (!evolucion) {
      return false;
    }

    if (this.opcion === 'U') {
      if (this._loginService.getSuperUsuario()) {
        respuesta = false;
      } else {
        if (evolucion.actual && !evolucion.aprobado_evo) {
          respuesta = false;
        } else {
          respuesta = true;
        }
      }
    } else {
      respuesta = false;
    }

    return respuesta;
  }

  imprimirEvolucion(tipo:string) {
    const id = this.hcu.fk_hcu;
    if (!id) {
      toastr.error('Sin ID', 'No hay pk_emerg para imprimir.');
      return;
    }

    const fecha1 = tipo === 'p' ? this._loginService.getHcuLocalStorage().fecha_ciclohosp : null;
    

    // Mostrar Loading con SweetAlert
    Swal.fire({
      title: 'Generando reporte..',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this._evolucionService.impresionEvolucionId(id,fecha1,null).subscribe({
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
          a.download = `evolucion_${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (err) => {
        Swal.close();
        toastr.error('Error', `${err} - No se pudo imprimir el Form. Evolución`);
      },
    });
  }
}
