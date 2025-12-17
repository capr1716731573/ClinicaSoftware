import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { GeografiaService } from '../../../services/geografia/geografia.service';
import { SkeletonTableComponent } from '../../../componentes_reutilizables/skeleton/skeleton-table.component';
declare var toastr: any;
declare var $: any;

interface GeografiaBody {
  pk_geo: number;
  fk_padre: number;
  tipo_geo: string;
  desc_geo: string;
}

@Component({
  selector: 'app-geografia',
  imports: [CommonModule, FormsModule, NgSelectModule, SkeletonTableComponent],
  templateUrl: './geografia.component.html',
  styles: ``,
})
export class GeografiaComponent {
  private _geografiaService = inject(GeografiaService);
  /******** Variables******** */
  paisesList: any[] = [];
  provinciasList: any[] = [];
  ciudadesList: any[] = [];
  parroquiasList: any[] = [];

  paisSelect: any = {};
  idPais: number = null;
  provinciaSelect: any = {};
  idProvincia: number = null;
  ciudadSelect: any = {};
  idCiudad: number = null;
  parroquiaSelect: any = {};
  idParroquia: number = null;

  geografiaList: any[] = [];
  padreGeografiaGlobal: number = 0;

  tituloTabla: string = 'Cargar Lista..';

  geografiaBody: GeografiaBody = {
    pk_geo: 0,
    fk_padre: 0,
    tipo_geo: '',
    desc_geo: '',
  };

  opcion: string = 'I';
  desde: number = 0;
  intervalo = environment.filas;
  numeracion: number = 1;
  loading: boolean = false;

  constructor() {
    this.getGeografia_Paises();
  }

  getGeografia_Paises() {
    /******* Seteo de Campos ********/
    this.provinciasList = [];
    this.idProvincia = null;
    this.ciudadesList = [];
    this.idCiudad = null;
    this.parroquiasList = [];
    this.idParroquia = null;
    this.geografiaList = [];
    /******** Carga de Informacion ************ */
    this._geografiaService.getAllGeografia(null, 'P', 0).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          if (resp.rows.length > 0) {
            this.paisesList = resp.rows;
          } else {
            this.paisesList = [];
          }
        }
      },
      error: (err) => {
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

  getGeografia_Provincias(provincia: any) {
    /******* Seteo de Campos ********/
    this.provinciasList = [];
    this.idProvincia = null; // 🔑
    this.ciudadesList = [];
    this.idCiudad = null; // 🔑
    this.parroquiasList = [];
    this.idParroquia = null; // 🔑/*  */
    this.geografiaList = [];
    /******** Carga de Informacion ************ */
    this._geografiaService
      .getAllGeografia(null, 'PR', provincia.pk_geo)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            //Validacion para numeracion y parametro desde
            //Si resp.rows sea mayor a 0 se actualiza sino no
            if (resp.rows.length > 0) {
              this.provinciasList = resp.rows;
            } else {
              this.provinciasList = [];
            }
          }
        },
        error: (err) => {
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

  getGeografia_Ciudades(ciudad: any) {
    /******* Seteo de Campos ********/
    this.ciudadesList = [];
    this.idCiudad = null; // 🔑
    this.parroquiasList = [];
    this.idParroquia = null; // 🔑
    this.geografiaList = [];
    /******** Carga de Informacion ************ */
    this._geografiaService
      .getAllGeografia(null, 'CIU', ciudad.pk_geo)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            //Validacion para numeracion y parametro desde
            //Si resp.rows sea mayor a 0 se actualiza sino no
            if (resp.rows.length > 0) {
              this.ciudadesList = resp.rows;
            } else {
              this.ciudadesList = [];
            }
          }
        },
        error: (err) => {
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

  getGeografia_Parroquias(parroquia: any) {
    this.parroquiasList = [];
    this.idParroquia = null; // 🔑
    this.geografiaList = [];
    this._geografiaService
      .getAllGeografia(null, 'PARR', parroquia.pk_geo)
      .subscribe({
        next: (resp) => {
          if (resp.status === 'ok') {
            //Validacion para numeracion y parametro desde
            //Si resp.rows sea mayor a 0 se actualiza sino no
            if (resp.rows.length > 0) {
              this.parroquiasList = resp.rows;
            } else {
              this.parroquiasList = [];
            }
          }
        },
        error: (err) => {
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

  cargarGeografia(tipoLista: string, id_padre: number) {
    /******* Configuro el titulo******* */
    if (tipoLista === 'P') this.tituloTabla = 'Paises';
    else if (tipoLista === 'PR') this.tituloTabla = 'Provincias';
    else if (tipoLista === 'CIU') this.tituloTabla = 'Ciudades';
    else if (tipoLista === 'PARR') this.tituloTabla = 'Parroquias';

    this.padreGeografiaGlobal = id_padre;
    /******** Carga de Informacion ************ */
    this.loading = true;
    this._geografiaService
      .getAllGeografia(this.desde, tipoLista, id_padre)
      .subscribe({
        next: (resp) => {
          this.loading = false;
          if (resp.status === 'ok') {
            //Validacion para numeracion y parametro desde
            //Si resp.rows sea mayor a 0 se actualiza sino no

            if (resp.rows.length > 0) {
              this.geografiaList = resp.rows;
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
          this.loading = false;
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

  avanzar() {
    let tipo = null;
    if (this.tituloTabla === 'Paises') tipo = 'P';
    else if (this.tituloTabla === 'Provincias') tipo = 'PR';
    else if (this.tituloTabla === 'Ciudades') tipo = 'CIU';
    else if (this.tituloTabla === 'Parroquias') tipo = 'PARR';
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.cargarGeografia(tipo, this.padreGeografiaGlobal);
  }

  retroceder() {
    let tipo = null;
    if (this.tituloTabla === 'Paises') tipo = 'P';
    else if (this.tituloTabla === 'Provincias') tipo = 'PR';
    else if (this.tituloTabla === 'Ciudades') tipo = 'CIU';
    else if (this.tituloTabla === 'Parroquias') tipo = 'PARR';
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.cargarGeografia(tipo, this.padreGeografiaGlobal);
  }

  nuevogeografia() {
    this.opcion = 'I';
    let tipo = null;
    let padre = null;
    if (this.tituloTabla === 'Paises') {
      tipo = 'P';
      padre = null;
    } else if (this.tituloTabla === 'Provincias') {
      tipo = 'PR';
      padre = this.idPais;
    } else if (this.tituloTabla === 'Ciudades') {
      tipo = 'CIU';
      padre = this.idProvincia;
    } else if (this.tituloTabla === 'Parroquias') {
      tipo = 'PARR';
      padre = this.idCiudad;
    }
    /*Armo el body de geografia* */
    this.geografiaBody = {
      pk_geo: 0,
      fk_padre: padre,
      desc_geo: '',
      tipo_geo: tipo,
    };
    // ✅ Abre el modal con jQuery Bootstrap
    $('#geografiaModal').modal('show');
  }

  editarGeografia(geografia: any) {
    this.geografiaBody = geografia;
    // ✅ Abre el modal con jQuery Bootstrap
    $('#geografiaModal').modal('show');
  }

  guardarGeografia() {
    this._geografiaService
      .guardarGeografia(this.geografiaBody, this.opcion)
      .subscribe({
        next: (resp) => {
          if (resp.status && resp.status === 'ok') {
            this.geografiaBody = resp.data;
            toastr.success('Éxito', `Registro Guardado`);

            let itemGeo: GeografiaBody = {
              pk_geo: 0,
              fk_padre: 0,
              tipo_geo: '',
              desc_geo: '',
            };
            let padre = null;
            let tipo = null;
            if (this.tituloTabla === 'Paises') {
              tipo = 'P';
              padre = 0;
              itemGeo.pk_geo = 0;
              this.getGeografia_Paises();
            } else if (this.tituloTabla === 'Provincias') {
              tipo = 'PR';
              padre = this.idPais;
              itemGeo.pk_geo = padre;
              this.getGeografia_Provincias(itemGeo);
            } else if (this.tituloTabla === 'Ciudades') {
              tipo = 'CIU';
              padre = this.idProvincia;
              itemGeo.pk_geo = padre;
              this.getGeografia_Ciudades(itemGeo);
            } else if (this.tituloTabla === 'Parroquias') {
              tipo = 'PARR';
              padre = this.idCiudad;
              itemGeo.pk_geo = padre;
              this.getGeografia_Parroquias(itemGeo);
            }
            this.opcion = `U`;

            this.cargarGeografia(tipo, padre);
          } else {
            // manejo de error
            toastr.error('Error', `Problema al crear registro Geografia`);
          }
        },
        error: (err) => {
          // manejo de error
          toastr.error(
            'Error',
            `${err} - Problema al crear registro Geografia(web service)`
          );
        },
      });
  }

  validarGuardar() {
    if (
      !this.geografiaBody ||
      !this.geografiaBody.desc_geo ||
      this.geografiaBody.desc_geo === '' ||
      this.geografiaBody.desc_geo === undefined
    )
      return false;
    return true;
  }
}
