import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class GeografiaService {
  private readonly _http = inject(HttpClient);
  private _baseUrl = environment.apiUrl;

  constructor() {}

  getAllGeografia(desde: number, tipo: string, padre: number) {
    let url = `${this._baseUrl}/geografia`;
    if (desde != null)
      url = `${url}?desde=${desde}&tipo=${tipo}&padre=${padre}`;
    else url = `${url}?tipo=${tipo}&padre=${padre}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service(getAllGeografia). - Geografía',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getBsqGeografia(bsq: string, desde: number, tipo: string, padre: number) {
    let url = `${this._baseUrl}/geografia/bsq/${bsq}`;
    if (desde != null)
      url = `${url}?desde=${desde}&tipo=${tipo}&padre=${padre}`;
    else url = `${url}?tipo=${tipo}&padre=${padre}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service(getBsqGeografia). - Geografía',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getGeografiaId(id: number) {
    const url = `${this._baseUrl}/geografia/id/${id}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(getGeografiaId) - Geografía',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getGeografiaTipo(tipo: string) {
    const url = `${this._baseUrl}/geografia/tipo/${tipo}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(getGeografiaTipo) - Geografía',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarGeografia(geografia: any, opcion: string) {
    const url = `${this._baseUrl}/geografia/${opcion}`;

    return this._http.post(url, geografia).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo crear registro en geografia (guardarGeografia).',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }
}
