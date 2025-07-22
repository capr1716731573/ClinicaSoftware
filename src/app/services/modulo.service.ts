import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroments';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ModuloService {
  private readonly _http = inject(HttpClient);
  private _baseUrl=environment.apiUrl

  constructor() { }

  getAllModulos(){
    const url = `${this._baseUrl}/modulo`;
    return this._http.get(url).pipe(
          map((resp: any) => {
            return resp;
          }),
          catchError(err => {
            Swal.fire({
              title: '¡Error!',
              text: 'Operación incompleta en el Service. - Módulo',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
            console.error('Error no controlado:', err);
            return of(err); // ← devuelve observable, no error directo
          })
        );
  }

  getBsqModulo(bsq:string){
      let url=`${this._baseUrl}/modulo/bsq/${bsq}`;
  
        return this._http.get(url).pipe(
          map((resp: any) => {
            console.log(resp);
            return resp;
          }),
          catchError((err) => {
            Swal.fire({
              title: '¡Error!',
              text: 'Operación incompleta en el Service(getBsqModulo). - Modulos',
              icon: 'error',
              confirmButtonText: 'Aceptar',
            });
            console.error('Error no controlado:', err);
            return of(err);
          })
        );
    }
  
    getModuloId(id: number) {
        const url = `${this._baseUrl}/modulo/id/${id}`;
    
        return this._http.get(url).pipe(
          map((resp: any) => {
            return resp;
          }),
          catchError((err) => {
            Swal.fire({
              title: '¡Error!',
              text: 'Operación incompleta en el Service.(getModuloId) - Modulos',
              icon: 'error',
              confirmButtonText: 'Aceptar',
            });
            console.error('Error no controlado:', err);
            return of(err);
          })
        );
    }
  
    guardarModulo(modulo: any, opcion: string) {
        const url = `${this._baseUrl}/modulo/${opcion}`;
    
        return this._http.post(url, modulo).pipe(
          map((resp: any) => {
            return resp;
          }),
          catchError((err) => {
            Swal.fire({
              title: '¡Error!',
              text: 'No se pudo crear registro en modulo (guardarModulo).',
              icon: 'error',
              confirmButtonText: 'Aceptar',
            });
            console.error('Error no controlado:', err);
            return of(err);
          })
        );
    }

}
