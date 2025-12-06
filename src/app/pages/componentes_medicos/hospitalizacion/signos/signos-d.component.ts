import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SignosVitalesD } from './signos.interface';
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
  selector: 'app-signos-d',
  imports: [
    CommonModule,
    FormsModule,
    SkeletonTableComponent,
    SkeletonCrudComponent
  ],
  templateUrl: './signos-d.component.html',
  styles: ``
})
export class SignosDComponent {
  private _signosService = inject(SignosService);
  private _loginService = inject(LoginService);
  private _casaSaludService = inject(CasasSaludService);

  listSignosD: any[] = [];
  signoBody: SignosVitalesD = this.inicializarSigno();
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
    this.getAllSignosD();
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
   * Inicializa un nuevo objeto SignosVitalesD con valores por defecto
   */
  inicializarSigno(): SignosVitalesD {
    return {
      pk__sigvita_d: 0,
      fecha_creacion__sigvita_d: null,
      fecha_modificacion__sigvita_d: null,
      fecha_sigvita_d: null,
      hora_sigvita_d: null,
      casalud_id_fk: this.datos_hcu?.casalud_id_fk || 0,
      fk_hcu: this.datos_hcu?.fk_hcu || 0,
      medico_usu_id_fk: this._loginService.getUserLocalStorage()?.pk_usuario || 0,
      bh_i_enteral_sigvita_d: null,
      bh_i_parenteral_sigvita_d: null,
      bh_i_viaoral_sigvita_d: null,
      bh_i_total_sigvita_d: null,
      bh_e_orina_sigvita_d: null,
      bh_e_drenaje_sigvita_d: null,
      bh_e_vomito_sigvita_d: null,
      bh_e_diarreas_sigvita_d: null,
      bh_e_otros_sigvita_d: null,
      bh_e_total_sigvita_d: null,
      bh_ie_total_sigvita_d: null,
      dieta_sigvita_d: null,
      num_comidas_sigvita_d: null,
      num_micciones_sigvita_d: null,
      num_deposiciones_sigvita_d: null
    };
  }

  /**
   * Obtiene todos los signos vitales D del paciente
   */
  getAllSignosD(): void {
    if (!this.datos_hcu || !this.datos_hcu.fk_hcu) {
      toastr.error('Error', 'No se encontraron datos del paciente');
      return;
    }

    this.loading = true;
    this._signosService.getAllSignos(this.desde, this.datos_hcu.fk_hcu, 'D').subscribe({
      next: (resp: any) => {
        if (resp.status === 'ok') {
          this.listSignosD = resp.data || [];
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
          text: `Signos Vitales D (getAllSignos) - ${err.message}`,
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
      this.getFechasSignosD();
      return;
    }

    if (!hasDesde && !hasHasta) {
      this.getAllSignosD();
      return;
    }
  }

  /**
   * Obtiene signos vitales filtrados por fechas
   */
  getFechasSignosD(): void {
    if (!this.datos_hcu || !this.datos_hcu.fk_hcu) {
      toastr.error('Error', 'No se encontraron datos del paciente');
      return;
    }

    const fecha1 = this.formatFecha(this.fecha_desde);
    const fecha2 = this.formatFecha(this.fecha_hasta);

    this.loading = true;
    this._signosService.getFechasSignos(this.datos_hcu.fk_hcu, fecha1, fecha2, 'D').subscribe({
      next: (resp: any) => {
        if (resp.status === 'ok') {
          this.listSignosD = resp.data || [];
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
          text: `Signos Vitales D (getFechasSignos) - ${err.message}`,
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
    this.getAllSignosD();
  }

  /**
   * Retrocede a la página anterior
   */
  retroceder(): void {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getAllSignosD();
  }

  /**
   * Abre el modal para crear un nuevo signo vital
   */
  nuevoSigno(): void {
    this.opcion = 'I';
    this.signoBody = this.inicializarSigno();
    $('#signosDModal').modal('show');
  }

  /**
   * Abre el modal para editar un signo vital existente
   */
  editarSigno(id: number): void {
    this.opcion = 'U';
    this.loadingEdit = true;
    $('#signosDModal').modal('show');
    
    this._signosService.getSignosID(id, 1, 'd').subscribe({
      next: (resp: any) => {
        if (resp.status === 'ok' && resp.data) {
          this.signoBody = resp.data;
          this.calcularTotales();
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
      fecha_creacion__sigvita_d: item.fecha_creacion__sigvita_d || null,
      fecha_modificacion__sigvita_d: item.fecha_modificacion__sigvita_d || null
    };
    
    // Esperar un momento para que Angular actualice la vista
    setTimeout(() => {
      const modal = $('#auditoriaModalSignosD');
      if (modal && modal.length > 0) {
        modal.modal('show');
      } else {
        console.error('No se encontró el modal con ID: auditoriaModalSignosD');
      }
    }, 0);
  }

  /**
   * Convierte el texto a mayúsculas (para el campo dieta)
   */
  convertirAMayusculas(event: any): void {
    if (event && event.target && event.target.value) {
      const valorMayusculas = event.target.value.toUpperCase();
      event.target.value = valorMayusculas;
      this.signoBody.dieta_sigvita_d = valorMayusculas;
    }
  }

  /**
   * Calcula los totales automáticamente
   */
  calcularTotales(): void {
    // Calcular bh_i_total_sigvita_d (suma de enteral, parenteral y vía oral)
    const enteral = this.signoBody.bh_i_enteral_sigvita_d || 0;
    const parenteral = this.signoBody.bh_i_parenteral_sigvita_d || 0;
    const viaoral = this.signoBody.bh_i_viaoral_sigvita_d || 0;
    this.signoBody.bh_i_total_sigvita_d = enteral + parenteral + viaoral;

    // Calcular bh_e_total_sigvita_d (suma de orina, drenaje, vómito, diarreas y otros)
    const orina = this.signoBody.bh_e_orina_sigvita_d || 0;
    const drenaje = this.signoBody.bh_e_drenaje_sigvita_d || 0;
    const vomito = this.signoBody.bh_e_vomito_sigvita_d || 0;
    const diarreas = this.signoBody.bh_e_diarreas_sigvita_d || 0;
    const otros = this.signoBody.bh_e_otros_sigvita_d || 0;
    this.signoBody.bh_e_total_sigvita_d = orina + drenaje + vomito + diarreas + otros;

    // Calcular bh_ie_total_sigvita_d (diferencia entre ingreso y egreso)
    const totalIngreso = this.signoBody.bh_i_total_sigvita_d || 0;
    const totalEgreso = this.signoBody.bh_e_total_sigvita_d || 0;
    this.signoBody.bh_ie_total_sigvita_d = totalIngreso - totalEgreso;
  }

  /**
   * Valida que los campos obligatorios estén completos
   */
  validarGuardar(): boolean {
    if (!this.signoBody) return false;

    // Campos obligatorios (excluyendo los totales que se calculan automáticamente)
    const camposObligatorios = [
      this.signoBody.fk_hcu,
      this.signoBody.medico_usu_id_fk,
      this.signoBody.bh_i_enteral_sigvita_d,
      this.signoBody.bh_i_parenteral_sigvita_d,
      this.signoBody.bh_i_viaoral_sigvita_d,
      this.signoBody.bh_e_orina_sigvita_d,
      this.signoBody.bh_e_drenaje_sigvita_d,
      this.signoBody.bh_e_vomito_sigvita_d,
      this.signoBody.bh_e_diarreas_sigvita_d,
      this.signoBody.bh_e_otros_sigvita_d
    ];

    // Verifica que ningún campo obligatorio sea null, undefined o 0
    // Nota: Los totales (bh_i_total, bh_e_total, bh_ie_total) se calculan automáticamente
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

    // Calcular totales antes de guardar
    this.calcularTotales();

    // Mensaje de confirmación con SweetAlert2
    Swal.fire({
      title: '¿Está seguro?',
      text: this.opcion === 'I' 
        ? '¿Desea guardar este nuevo registro de Balance Hídrico?' 
        : '¿Desea actualizar este registro de Balance Hídrico?',
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

    this._signosService.guardarSignos(this.signoBody, this.opcion, 'D').subscribe({
      next: (resp: any) => {
        if (resp.status && resp.status === 'ok') {
          toastr.success('Éxito', 'Registro guardado correctamente');
          $('#signosDModal').modal('hide');
          
          // Recargar la lista
          if (this.fecha_desde && this.fecha_hasta) {
            this.getFechasSignosD();
          } else {
            this.getAllSignosD();
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
