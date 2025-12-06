import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SignosVitalesB } from './signos.interface';
import { SignosService } from '../../../../services/hospitalizacion/signos/signos.service';
import { LoginService } from '../../../../services/login.service';
import { environment } from '../../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
import { CasasSaludService } from '../../../../services/casas_salud/casas_salud.service';
import { SkeletonTableComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-table.component';
import { SkeletonCrudComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-crud.component';

declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-signos-b',
  imports: [
    CommonModule,
    FormsModule,
    SkeletonTableComponent,
    SkeletonCrudComponent
  ],
  templateUrl: './signos-b.component.html',
  styles: ``
})
export class SignosBComponent {
  private _signosService = inject(SignosService);
  private _loginService = inject(LoginService);
  private _casaSaludService = inject(CasasSaludService);

  listSignosB: any[] = [];
  signoBody: SignosVitalesB = this.inicializarSigno();
  auditoriaData: any = null;
  casaSaludBody: any = {};
  datos_hcu: any;
  
  // Variables de loading
  loading: boolean = true;
  loadingEdit: boolean = false;
  
  opcion: string = 'I'; // 'I' para Insert, 'U' para Update
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;
  ant: boolean = false;
  sig: boolean = false;
  
  fecha_desde: Date | null = null;
  fecha_hasta: Date | null = null;

  constructor() {
    this.datos_hcu = this._loginService.getHcuLocalStorage();
    this.getAllSignosB();
    this.getCasaSalud();
  }

   getCasaSalud(): void {
      this._casaSaludService.getCasaSaludPrincipal().subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            this.casaSaludBody = resp.rows;
          }
        },
        error: (err) => {
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Casas de Salud - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
    }

  /**
   * Inicializa un nuevo objeto SignosVitalesB con valores por defecto
   */
  inicializarSigno(): SignosVitalesB {
    return {
      pk_sigvita_b: 0,
      fecha_creacion_sigvita_b: null,
      fecha_modificacion_sigvita_b: null,
      fecha_sigvita_b: null,
      hora_sigvita_b: null,
      casalud_id_fk: this.datos_hcu?.casalud_id_fk || 0,
      fk_hcu: this.datos_hcu?.fk_hcu || 0,
      medico_usu_id_fk: this._loginService.getUserLocalStorage()?.pk_usuario || 0,
      dia_inter_sigvita_b: null,
      dia_post_sigvita_b: null,
      pulso_sigvita_b: null,
      temp_sigvita_b: null,
      frecresp_sigvita_b: null,
      pulsometria_sigvita_b: null,
      presistolica_sigvita_b: null,
      prediastolica_sigvita_b: null,
      estadoconciencia_sigvita_b: null,
      proteinuria_sigvita_b: null,
      scoremama_sigvita_b: null
    };
  }

  /**
   * Obtiene todos los signos vitales B del paciente
   */
  getAllSignosB(): void {
    if (!this.datos_hcu || !this.datos_hcu.fk_hcu) {
      toastr.error('Error', 'No se encontraron datos del paciente');
      return;
    }

    this.loading = true;
    this._signosService.getAllSignos(this.desde, this.datos_hcu.fk_hcu, 'B').subscribe({
      next: (resp: any) => {
        if (resp.status === 'ok') {
          this.listSignosB = resp.data || [];
          this.numeracion = resp.paginacion?.pag || 1;
          this.ant = resp.paginacion?.ant || false;
          this.sig = resp.paginacion?.sig || false;
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Signos Vitales B (getAllSignos) - ${err.message}`,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  /**
   * Filtra signos vitales por rango de fechas
   */
  filtroFechas(): void {
    const desdeVal = this.fecha_desde ? this.formatFecha(this.fecha_desde) : '';
    const hastaVal = this.fecha_hasta ? this.formatFecha(this.fecha_hasta) : '';

    const hasDesde = desdeVal !== '';
    const hasHasta = hastaVal !== '';

    if (hasDesde && hasHasta) {
      if (new Date(desdeVal) > new Date(hastaVal)) {
        toastr.warning('Advertencia', 'Fecha "Desde" es mayor que "Hasta"');
        return;
      }
      this.getFechasSignosB();
      return;
    }

    if (!hasDesde && !hasHasta) {
      this.getAllSignosB();
      return;
    }
  }

  /**
   * Obtiene signos vitales filtrados por fechas
   */
  getFechasSignosB(): void {
    if (!this.datos_hcu || !this.datos_hcu.fk_hcu) {
      toastr.error('Error', 'No se encontraron datos del paciente');
      return;
    }

    const fecha1 = this.formatFecha(this.fecha_desde);
    const fecha2 = this.formatFecha(this.fecha_hasta);

    this.loading = true;
    this._signosService.getFechasSignos(this.datos_hcu.fk_hcu, fecha1, fecha2, 'B').subscribe({
      next: (resp: any) => {
        if (resp.status === 'ok') {
          this.listSignosB = resp.data || [];
          this.desde = 0;
          this.numeracion = 1;
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Signos Vitales B (getFechasSignos) - ${err.message}`,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  /**
   * Formatea una fecha a string YYYY-MM-DD
   */
  private formatFecha(fecha: Date | string | null): string {
    if (!fecha) return '';
    if (typeof fecha === 'string') return fecha;
    return fecha.toISOString().split('T')[0];
  }

  /**
   * Avanza a la siguiente página
   */
  avanzar(): void {
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAllSignosB();
  }

  /**
   * Retrocede a la página anterior
   */
  retroceder(): void {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getAllSignosB();
  }

  /**
   * Abre el modal para crear un nuevo signo vital
   */
  nuevoSigno(): void {
    this.opcion = 'I';
    this.signoBody = this.inicializarSigno();
    $('#signosBModal').modal('show');
  }

  /**
   * Abre el modal para editar un signo vital existente
   */
  editarSigno(id: number): void {
    this.opcion = 'U';
    this.loadingEdit = true;
    $('#signosBModal').modal('show');
    
    this._signosService.getSignosID(id, 1, 'b').subscribe({
      next: (resp: any) => {
        if (resp.status === 'ok' && resp.data) {
          this.signoBody = resp.data;
          this.loadingEdit = false;
        }
      },
      error: (err) => {
        this.loadingEdit = false;
        toastr.error('Error', `${err} - No se pudieron cargar los datos del registro ${id}`);
      }
    });
  }

  /**
   * Abre el modal de auditoría con la información de creación y modificación
   */
  verAuditoria(item: any): void {
    this.auditoriaData = {
      fecha_creacion_sigvita_b: item.fecha_creacion_sigvita_b || null,
      fecha_modificacion_sigvita_b: item.fecha_modificacion_sigvita_b || null
    };
    $('#auditoriaModal').modal('show');
  }

  /**
   * Valida que los campos obligatorios estén completos
   */
  validarGuardar(): boolean {
    if (!this.signoBody) return false;

    // Campos obligatorios
    const camposObligatorios = [
      this.signoBody.fk_hcu,
      this.signoBody.medico_usu_id_fk,
      this.signoBody.pulso_sigvita_b,
      this.signoBody.temp_sigvita_b,
      this.signoBody.frecresp_sigvita_b
    ];

    // Verifica que ningún campo obligatorio sea null, undefined o 0
    return camposObligatorios.every(campo => 
      campo !== null && campo !== undefined && campo !== 0
    );
  }

  /**
   * Guarda o actualiza un signo vital
   */
  guardarSigno(): void {
    if (!this.validarGuardar()) {
      toastr.warning('Advertencia', 'Complete todos los campos obligatorios');
      return;
    }

    // Mensaje de confirmación con SweetAlert2
    Swal.fire({
      title: '¿Está seguro?',
      text: this.opcion === 'I' 
        ? '¿Desea guardar este nuevo registro de Constantes Vitales?' 
        : '¿Desea actualizar este registro de Constantes Vitales?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#36c6d3',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.ejecutarGuardado();
      }
    });
  }

  /**
   * Ejecuta el guardado del signo vital
   */
  private ejecutarGuardado(): void {
    // Asegurar que los IDs estén actualizados
    this.signoBody.casalud_id_fk = this.casaSaludBody?.casalud_id_pk ?? 0
    this.signoBody.fk_hcu = this.datos_hcu?.fk_hcu || this.signoBody.fk_hcu;
    this.signoBody.medico_usu_id_fk = this._loginService.getUserLocalStorage()?.pk_usuario || this.signoBody.medico_usu_id_fk;

    this._signosService.guardarSignos(this.signoBody, this.opcion, 'B').subscribe({
      next: (resp: any) => {
        if (resp.status && resp.status === 'ok') {
          toastr.success('Éxito', 'Registro guardado correctamente');
          $('#signosBModal').modal('hide');
          
          // Recargar la lista
          if (this.fecha_desde && this.fecha_hasta) {
            this.getFechasSignosB();
          } else {
            this.getAllSignosB();
          }
        } else {
          toastr.error('Error', 'Problema al guardar el registro');
        }
      },
      error: (err) => {
        toastr.error('Error', `${err} - Problema al guardar el registro`);
      }
    });
  }
}
