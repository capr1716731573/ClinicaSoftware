import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class KardexService {
  private readonly _http = inject(HttpClient);
  private _baseUrl = environment.apiUrl;

  constructor() {}

  // @@@@@@@@@@ Cabecera @@@@@@@@@@@@@@@@@@@@@@
  getAllKardex(desde: number, hcu: number) {
    let url = `${this._baseUrl}/kardex/cab/all/${hcu}?desde=${desde}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: `Operación incompleta en el Service. - Listado Kardex`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getKardexID(id: number, opcion: any) {
    const url = `${this._baseUrl}/kardex/cab/id/${opcion}/${id}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: `Operación incompleta en el Service.(ID) -Kardex`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getFechasKardex(hcu: number, fecha1: any, fecha2: any) {
    const url = `${this._baseUrl}/kardex/cab/fechas/${hcu}/${fecha1}/${fecha2}`;
    console.log(url);

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: `Operación incompleta en el Service.(Bsq) - KardexFechas`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getBsqKardex(hcu: number, bsq:string) {
    const url = `${this._baseUrl}/kardex/cab/bsq/${hcu}/${bsq}`;
    console.log(url);

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: `Operación incompleta en el Service.(Bsq) - Kardex`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarKardex(Kardex: any, opcion: string) {
    const url = `${this._baseUrl}/kardex/cab/${opcion}`;

    return this._http.post(url, Kardex).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: `No se pudo registrar Kardex Cabecera`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  //@@@@@@@@@@@ Detalle @@@@@@@@@@@@@@@@@@@@@@@@@
  getKardexDetalleID(id: number, opcion: any) {
    const url = `${this._baseUrl}/kardex/det/id/${opcion}/${id}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: `Operación incompleta en el Service.(ID) -Kardex Detalle`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarKardexDetalle(KardexDet: any, opcion: string) {
    const url = `${this._baseUrl}/kardex/det/${opcion}`;

    return this._http.post(url, KardexDet).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: `No se pudo registrar Kardex Detalle`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  impresionKardex(hcu: number, fecha_desde: any, fecha_hasta: any) {
    const url = `${this._baseUrl}/kardex/cab/reporte_frame/${hcu}/${fecha_desde}/${fecha_hasta}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta al generar impresión - Kardex',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }
}
