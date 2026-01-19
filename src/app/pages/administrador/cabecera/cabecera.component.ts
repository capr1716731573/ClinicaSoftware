import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CabeceraDetalleService } from '../../../services/cabecera_detalle/cabecera-detalle.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { SkeletonTableComponent } from '../../../componentes_reutilizables/skeleton/skeleton-table.component';
import { environment } from '../../../../environments/environment';
declare var toastr: any;
declare var $: any;
// ✅ Aquí declaras la interfaz
interface CabeceraBody {
  pk_catcab: number;
  descripcion_catcab: string;
  codigo_catcab: string;
}

@Component({
  selector: 'app-cabecera',
  imports: [CommonModule, FormsModule, SkeletonTableComponent],
  templateUrl: './cabecera.component.html',
  styles: ``,
})
export class CabeceraComponent {
  cabeceraList: any[] = [];
  cabeceraBody: CabeceraBody = {
    pk_catcab: 0,
    descripcion_catcab: '',
    codigo_catcab: '',
  };
  bsqCabecera:string="";
  opcion: string = 'I';
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;
  loading: boolean = true;
  private _cabeceraService = inject(CabeceraDetalleService);

  constructor() {
    this.getAllCabeceras();
  }

  getAllCabeceras() {
    this.loading = true;
    this._cabeceraService.getAllCabeceras(this.desde).subscribe({
      next: (resp) => {
        this.loading = false;
        if (resp.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          if (resp.rows.length > 0) {
            this.cabeceraList = resp.rows;
          } else {
            this.desde -= this.intervalo;
            this.numeracion -= 1;
          }
        }
      },
      error: (err) => {
        this.loading = false;
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

  getAllCabecerasBusqueda(bsq:string) {
    this.loading = true;
    this._cabeceraService.getBsqCabecera(bsq).subscribe({
      next: (resp) => {
        this.loading = false;
        if (resp.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          if (resp.rows.length > 0) {
            this.cabeceraList = resp.rows;
          } 
        }
      },
      error: (err) => {
        this.loading = false;
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

  avanzar() {
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAllCabeceras();
  }

  retoceder() {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getAllCabeceras();
  }

  validarGuardar() {
    if (
      !this.cabeceraBody ||
      !this.cabeceraBody.descripcion_catcab ||
      !this.cabeceraBody.codigo_catcab ||
      this.cabeceraBody.descripcion_catcab === '' ||
      this.cabeceraBody.codigo_catcab === '' ||
      this.cabeceraBody.descripcion_catcab === undefined ||
      this.cabeceraBody.codigo_catcab === undefined ||
      this.cabeceraBody.descripcion_catcab === null ||
      this.cabeceraBody.codigo_catcab === null
    )
      return false;
    return true;
  }

  nuevoCabecera() {
    this.opcion = 'I';
    this.cabeceraBody = {
      pk_catcab: 0,
      descripcion_catcab: '',
      codigo_catcab: '',
    };
    // ✅ Abre el modal con jQuery Bootstrap
    $('#cabeceraModal').modal('show');
  }

  editarCabecera(id_cab: number) {
    this.opcion = 'U';
    this._cabeceraService.getAllCabeceraId(id_cab).subscribe({
      next: (resp) => {
        this.cabeceraBody = resp.rows;
      },
      error: (err) => {
        // manejo de error
        toastr.error('Error', `${err} - Datos no cargados del id ${id_cab}`);
      },
    });
  }

  guardarCabecera() {
    this._cabeceraService
      .guardarCabecera(this.cabeceraBody, this.opcion)
      .subscribe({
        next: (resp) => {
          this.opcion = `U`;
          if (resp.status && resp.status === 'ok') {
            this.cabeceraBody = resp.data;
            toastr.success('Éxito', `Registro Guardado`);
            if (this.bsqCabecera.length >=4) {this.buscarCabecera()} else this.getAllCabeceras();
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
  }

  buscarCabecera() {
    if (this.bsqCabecera.length >= 4) {
      this.getAllCabecerasBusqueda(this.bsqCabecera);
      // tu lógica aquí
    }else if (this.bsqCabecera.length === 0){
      this.desde=0;
      this.numeracion=1;
      this.getAllCabeceras();
    }
  }
}
