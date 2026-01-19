import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CabeceraDetalleService {
  private readonly _http = inject(HttpClient);
  private _baseUrl = environment.apiUrl;

  constructor() {}

  /*********** SECCION CABECERA ********************** */

  getAllCabeceras(desde: number) {
    const url = `${this._baseUrl}/catalogo/cab/?desde=${desde}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Cabecera Detalle',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getAllCabeceraId(id: number) {
    const url = `${this._baseUrl}/catalogo/cab/id/${id}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(ID) - Cabecera Detalle',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getBsqCabecera(bsq: string) {
    const url = `${this._baseUrl}/catalogo/cab/bsq/${bsq}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(Bsq) - Cabecera Detalle',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarCabecera(cabecera: any, opcion: string) {
    const url = `${this._baseUrl}/catalogo/cab/${opcion}`;

    return this._http.post(url, cabecera).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo crear la cabecera.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  /*********** SECCION DETALLE ********************** */
  getAllCabecerasDetalle(codigo_cab: string, estado: boolean, desde: number) {
    const url = `${this._baseUrl}/catalogo/det/${codigo_cab}/${estado}?desde=${desde}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(getAllCabecerasDetalle) - Cabecera Detalle',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

    /*********** SECCION DETALLE ********************** */
  getAllCabecerasDetalle2(codigo_cab: string, estado: boolean) {
    const url = `${this._baseUrl}/catalogo/det/${codigo_cab}/${estado}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(getAllCabecerasDetalle2) - Cabecera Detalle2',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getCabeceraDetalleId(id: number) {
    const url = `${this._baseUrl}/catalogo/detalle/id/${id}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(ID) - Cabecera Detalle',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getBsqCabeceraDetalle(codigo_cab: string, estado_det: boolean, bsq: string) {
    const url = `${this._baseUrl}/catalogo/det/bsq/${codigo_cab}/${estado_det}/${bsq}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(Bsq) - Cabecera Detalle',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarCabeceraDetale(detalle: any, opcion: string) {
    const url = `${this._baseUrl}/catalogo/det/${opcion}`;

    return this._http.post(url, detalle).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo crear el detalle.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }
}
