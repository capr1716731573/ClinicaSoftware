import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SignosVitalesC } from './signos.interface';
import { SignosService } from '../../../../services/hospitalizacion/signos/signos.service';
import { LoginService } from '../../../../services/login.service';
import Swal from 'sweetalert2';
import { CasasSaludService } from '../../../../services/casas_salud/casas_salud.service';
import { SkeletonTableComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-table.component';
import { SkeletonCrudComponent } from '../../../../componentes_reutilizables/skeleton/skeleton-crud.component';
import { environment } from '../../../../../environments/environment';

declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-signos-c',
  imports: [
    CommonModule,
    FormsModule,
    SkeletonTableComponent,
    SkeletonCrudComponent
  ],
  templateUrl: './signos-c.component.html',
  styles: ``
})
export class SignosCComponent {
  private _signosService = inject(SignosService);
  private _loginService = inject(LoginService);
  private _casaSaludService = inject(CasasSaludService);

  listSignosC: any[] = [];
  signoBody: SignosVitalesC = this.inicializarSigno();
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

  fecha_desde: string = '';
  fecha_hasta: string = '';

  constructor() {
    this.datos_hcu = this._loginService.getHcuLocalStorage();
    this.getAllSignosC();
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
   * Inicializa un nuevo objeto SignosVitalesC con valores por defecto
   */
  inicializarSigno(): SignosVitalesC {
    return {
      pk_sigvita_c: 0,
      fecha_creacion_sigvita_c: null,
      fecha_modificacion_sigvita_c: null,
      fecha_sigvita_c: null,
      hora_sigvita_c: null,
      casalud_id_fk: this.datos_hcu?.casalud_id_fk || 0,
      fk_hcu: this.datos_hcu?.fk_hcu || 0,
      medico_usu_id_fk: this._loginService.getUserLocalStorage()?.pk_usuario || 0,
      peso_sigvita_c: null,
      talla_sigvita_c: null,
      pericefalico_sigvita_c: null,
      periabdominal_sigvita_c: null,
      otros_sigvita_c: null
    };
  }

  /**
   * Obtiene todos los signos vitales C del paciente
   */
  getAllSignosC(): void {
    if (!this.datos_hcu || !this.datos_hcu.fk_hcu) {
      toastr.error('Error', 'No se encontraron datos del paciente');
      return;
    }

    this.loading = true;
    this._signosService.getAllSignos(this.desde, this.datos_hcu.fk_hcu, 'C').subscribe({
      next: (resp: any) => {
        if (resp.status === 'ok') {
          this.listSignosC = resp.data || [];
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
          text: `Signos Vitales C (getAllSignos) - ${err.message}`,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  /**
   * Filtra signos vitales por rango de fechas
   */
  filtroFechas(): void {
    if (this.fecha_desde && this.fecha_hasta) {
      this.getFechasSignosC();
    } else if (!this.fecha_desde && !this.fecha_hasta) {
      this.desde = 0;
      this.getAllSignosC();
    }
  }

  /**
   * Obtiene signos vitales filtrados por fechas
   */
  getFechasSignosC(): void {
    if (!this.datos_hcu || !this.datos_hcu.fk_hcu) {
      toastr.error('Error', 'No se encontraron datos del paciente');
      return;
    }

    // Las fechas ya vienen en formato yyyy-mm-dd del input type="date"
    this.loading = true;
    this._signosService.getFechasSignos(this.datos_hcu.fk_hcu, this.fecha_desde, this.fecha_hasta, 'C').subscribe({
      next: (resp: any) => {
        if (resp.status === 'ok') {
          this.listSignosC = resp.data || [];
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
          text: `Signos Vitales C (getFechasSignos) - ${err.message}`,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }



  /**
   * Navega a la página anterior
   */
  retroceder(): void {
    if (this.numeracion > 1) {
      this.desde -= this.intervalo;
      this.getAllSignosC();
    }
  }

  /**
   * Navega a la página siguiente
   */
  avanzar(): void {
    if (this.sig) {
      this.desde += this.intervalo;
      this.getAllSignosC();
    }
  }

  /**
   * Abre el modal para crear un nuevo signo vital
   */
  nuevoSigno(): void {
    this.opcion = 'I';
    this.signoBody = this.inicializarSigno();
    $('#signosCModal').modal('show');
  }

  /**
   * Abre el modal para editar un signo vital existente
   */
  editarSigno(id: number): void {
    this.opcion = 'U';
    this.loadingEdit = true;
    $('#signosCModal').modal('show');
    
    this._signosService.getSignosID(id, 1, 'c').subscribe({
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
      fecha_creacion_sigvita_c: item.fecha_creacion_sigvita_c || null,
      fecha_modificacion_sigvita_c: item.fecha_modificacion_sigvita_c || null
    };
    $('#auditoriaCModal').modal('show');
  }

  /**
   * Valida que los campos obligatorios estén completos
   */
  validarGuardar(): boolean {
    if (!this.signoBody) {
      return false;
    }

    // Campos obligatorios
    const camposObligatorios = [
      this.signoBody.fk_hcu,
      this.signoBody.medico_usu_id_fk,
      this.signoBody.peso_sigvita_c,
      this.signoBody.talla_sigvita_c
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
        ? '¿Desea guardar este nuevo registro de Antropometría?' 
        : '¿Desea actualizar este registro de Antropometría?',
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

    this._signosService.guardarSignos(this.signoBody, this.opcion, 'C').subscribe({
      next: (resp: any) => {
        if (resp.status && resp.status === 'ok') {
          toastr.success('Éxito', 'Registro guardado correctamente');
          $('#signosCModal').modal('hide');
          
          // Recargar la lista
          if (this.fecha_desde && this.fecha_hasta) {
            this.getFechasSignosC();
          } else {
            this.getAllSignosC();
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
