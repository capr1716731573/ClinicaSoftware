import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class PersonaService {
  private readonly _http = inject(HttpClient);
  private _baseUrl = environment.apiUrl;

  constructor() {}

  getAllPersona(desde: number) {
    const url = `${this._baseUrl}/persona/?desde=${desde}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Persona',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getAllPersonaId(opcion: number, id: number) {
    const url = `${this._baseUrl}/persona/id/${opcion}/${id}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(ID) - Persona',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getBsqPersona(bsq: string) {
    const url = `${this._baseUrl}/persona/bsq/${bsq}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(Bsq) - Persona',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarPersona(persona: any, opcion: string) {
    const url = `${this._baseUrl}/persona/${opcion}`;

    return this._http.post(url, persona).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo crear la Persona.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getVerificarUsuarioPersona(identificacion:string){
     const url = `${this._baseUrl}/persona/usupersona/${identificacion}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(ID) - Persona',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

    getVerificarHistoriaClinica_Persona(identificacion:string){
     const url = `${this._baseUrl}/persona/histopersona/${identificacion}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(ID) - Persona Historia Clínica',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  validarCedulaEcuador(cedula: string): boolean {
    if (!/^\d{10}$/.test(cedula)) return false; // Debe tener exactamente 10 dígitos

    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || provincia > 24) return false; // Código de provincia válido

    const digitoVerificador = parseInt(cedula[9], 10);
    let suma = 0;

    for (let i = 0; i < 9; i++) {
      let num = parseInt(cedula[i], 10);

      if (i % 2 === 0) {
        num *= 2;
        if (num > 9) num -= 9;
      }

      suma += num;
    }

    const modulo = suma % 10;
    const verificadorCalculado = modulo === 0 ? 0 : 10 - modulo;

    return verificadorCalculado === digitoVerificador;
  }
}
