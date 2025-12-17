import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CabeceraDetalleService } from '../../../services/cabecera_detalle/cabecera-detalle.service';
import { environment } from '../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { SkeletonTableComponent } from '../../../componentes_reutilizables/skeleton/skeleton-table.component';
declare var toastr: any;
declare var $: any;
// ✅ Aquí declaras la interfaz
interface CabeceraDetalleBody {
  pk_catdetalle: number;
  fk_catcabecera: number;
  desc_catdetalle: string;
  estado_catdetalle: boolean;
}

@Component({
  selector: 'app-cabecera-detalle',
  imports: [CommonModule, FormsModule, NgSelectModule, SkeletonTableComponent],
  templateUrl: './cabecera-detalle.component.html',
  styles: ``,
})
export class CabeceraDetalleComponent {
  /********* Variables ************* */
  cabeceraList: any[] = [];
  idcabeceraSelect: number = 0;
  cabeceraSelect: any = {};
  typeahead = new Subject<string>();
  isLoading = false;
  loadingDetalle = false;

  cabeceraDetalleList: any[] = [];
  cabeceraDetalleBody: CabeceraDetalleBody = {
    pk_catdetalle: 0,
    fk_catcabecera: 0,
    desc_catdetalle: '',
    estado_catdetalle: true,
  };
  bsqCabecera: string = '';
  bsqCabeceraDetalle: string = '';
  opcion: string = 'I';
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;
  private _cabeceraService = inject(CabeceraDetalleService);

  constructor() {
    
  }

  //*Seccion Cabecera//
  //✅Aqui metodo que ejecuta al buscar o filtrar datos del select,
  //el cual va siempre en el constructor

  onSearchCabecera(term: any) {
    let bsq=term.term;
    
    if (bsq.length >= 4) {
     
      this.isLoading = true;
      this._cabeceraService.getBsqCabecera(bsq).subscribe({
        next: (resp) => {
          this.isLoading = false;
          this.cabeceraList =
            resp.status === 'ok' && resp.rows?.length > 0 ? resp.rows : [];
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
        },
      });
    } else {
      this.cabeceraList = [];
    }
  }

  seleccionCabecera(cabecera: any) {
    /* Reinicio las variables / */
    this.desde = 0;
    this.bsqCabeceraDetalle = '';
    this.numeracion = 1;

    this.cabeceraSelect = cabecera;

    this.cargarDetalle(cabecera);
  }

  getAllCabecerasBusqueda(bsq: string) {
    this._cabeceraService.getBsqCabecera(bsq).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          if (resp.rows.length > 0) {
            this.cabeceraList = resp.rows;
          }
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Cabecera - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  /** Seccion Detalles */
  cargarDetalle(cabecera: any) {
    this.loadingDetalle = true;
    this._cabeceraService
      .getAllCabecerasDetalle(cabecera.codigo_catcab, false, this.desde)
      .subscribe({
        next: (resp) => {
          this.loadingDetalle = false;
          if (resp.status === 'ok') {
            //Validacion para numeracion y parametro desde
            //Si resp.rows sea mayor a 0 se actualiza sino no
            if (resp.rows.length > 0) {
              this.cabeceraDetalleList = resp.rows;
            } else {
              this.desde =
                this.desde === 0 ? 0 : (this.desde -= this.intervalo);
              this.numeracion =
                this.numeracion === 1
                  ? this.numeracion
                  : (this.numeracion -= 1);
            }
          }
        },
        error: (err) => {
          this.loadingDetalle = false;
          // manejo de error
          Swal.fire({
            title: '¡Error!',
            icon: 'error',
            text: `Cabecera Detalle - ${err.message}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  buscarCabeceraDetalle() {
    if (this.bsqCabeceraDetalle.length >= 4) {
      this.loadingDetalle = true;
      this._cabeceraService
        .getBsqCabeceraDetalle(
          this.cabeceraSelect.codigo_catcab,
          false,
          this.bsqCabeceraDetalle
        )
        .subscribe({
          next: (resp) => {
            this.loadingDetalle = false;
            if (resp.status === 'ok') {
              //Validacion para numeracion y parametro desde
              //Si resp.rows sea mayor a 0 se actualiza sino no
              if (resp.rows.length > 0) {
                this.cabeceraDetalleList = resp.rows;
              } else this.cabeceraDetalleList = [];
            }
          },
          error: (err) => {
            this.loadingDetalle = false;
            // manejo de error
            Swal.fire({
              title: '¡Error!',
              icon: 'error',
              text: `Cabecera Detalle - ${err.message}`,
              confirmButtonText: 'Aceptar',
            });
          },
        });
    } else if (this.bsqCabecera.length === 0) {
      this.desde = 0;
      this.numeracion = 1;
      this.cargarDetalle(this.cabeceraSelect);
    }
  }

  avanzar() {
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.cargarDetalle(this.cabeceraSelect);
  }

  retroceder() {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.cargarDetalle(this.cabeceraSelect);
  }

  nuevoCabeceraDetalle() {
    this.opcion = 'I';
    this.cabeceraDetalleBody = {
      pk_catdetalle: 0,
      fk_catcabecera: this.cabeceraSelect.pk_catcab,
      desc_catdetalle: '',
      estado_catdetalle: true,
    };
    // ✅ Abre el modal con jQuery Bootstrap
    $('#cabeceraDetalleModal').modal('show');

  }

  editarCabeceraDetalle(pk_cabdet: number) {
    this.opcion = 'U';
    this._cabeceraService.getCabeceraDetalleId(pk_cabdet).subscribe({
      next: (resp) => {
        this.cabeceraDetalleBody = resp.rows;
      },
      error: (err) => {
        // manejo de error
        toastr.error('Error', `${err} - Datos no cargados del id Detalle ${pk_cabdet}`);
      },
    });
  }

  guardarCabeceraDetalle() {
    this._cabeceraService
      .guardarCabeceraDetale(this.cabeceraDetalleBody, this.opcion)
      .subscribe({
        next: (resp) => {
          this.opcion = `U`;
          if (resp.status && resp.status === 'ok') {
            this.cabeceraDetalleBody = resp.data;
            toastr.success('Éxito', `Registro Guardado`);
            if (this.bsqCabeceraDetalle.length >=4) {
              this.buscarCabeceraDetalle()
            } else {
              this.cargarDetalle(this.cabeceraSelect);
            }
          } else {
            // manejo de error
            toastr.error('Error', `Problema al crear registro detalle`);
          }
        },
        error: (err) => {
          // manejo de error
          toastr.error('Error', `${err} - Problema al crear registro 2`);
        },
      });
  }

  validarGuardar() {
    if (
      !this.cabeceraSelect ||
      !this.cabeceraDetalleBody ||
      !this.cabeceraDetalleBody.desc_catdetalle ||
      this.cabeceraDetalleBody.desc_catdetalle === '' ||
      this.cabeceraDetalleBody.desc_catdetalle === undefined ||
      this.cabeceraDetalleBody.estado_catdetalle === undefined ||
      this.cabeceraDetalleBody.desc_catdetalle === null ||
      this.cabeceraDetalleBody.estado_catdetalle === null
    )
      return false;
    return true;
  }
}
