import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../../enviroments/enviroments';

@Injectable({
  providedIn: 'root',
})
export class SignosService {
  private readonly _http = inject(HttpClient);
  private _baseUrl = environment.apiUrl;

  constructor() {}

  getAllSignos(desde: number, hcu: number, signo: string) {
    let url = `${this._baseUrl}/sigvita/signos/${signo}/all/${hcu}?desde=${desde}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: `Operación incompleta en el Service. - Listado Signos ${signo}`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getSignosID(id: number, opcion: any, signo: string) {
    const url = `${this._baseUrl}/sigvita/signos/${signo}/id/${opcion}/${id}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: `Operación incompleta en el Service.(ID) -Signos ${signo}`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getFechasSignos(hcu: number, fecha1: any, fecha2: any, signo: string) {
    const url = `${this._baseUrl}/sigvita/signos/${signo}/fechas/${hcu}/${fecha1}/${fecha2}`;
    console.log(url);

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: `Operación incompleta en el Service.(Bsq) - Signos ${signo} Fechas`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarSignos(signos: any, opcion: string, signo: string) {
    const url = `${this._baseUrl}/sigvita/signos/${signo}/${opcion}`;

    return this._http.post(url, signos).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: `No se pudo registrar signos ${signo}.`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  impresionSignos(hcu: number, fecha_desde: any,fecha_hasta: any) {
    const url = `${this._baseUrl}/sigvita/signos/reporte_frame/${hcu}/${fecha_desde}/${fecha_hasta}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta al generar impresión - Signos Vitales',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }
}
