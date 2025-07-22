import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from "jwt-decode";
import { environment } from '../../enviroments/enviroments';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly _http = inject(HttpClient);
  private _baseUrl=environment.apiUrl
  constructor() { }


  login(user: string, password: string) {
    const url = `${this._baseUrl}/auth/login`;
    const body = {
      user: user,
      password: password
    };

    return this._http.post(url, body).pipe(
      map((resp: any) => {
        //console.log(JSON.stringify(resp));
        return resp;
      }),
      catchError(err => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        console.error('Error no controlado:', err);
        return of(err); // ← devuelve observable, no error directo
      })
    );
  }

  verificarUsuarioPerfilModulo(user: number, perfil: number,modulo:number) {
    const url = `${this._baseUrl}/auth/login/verificar/${user}/${perfil}/${modulo}`;
    
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError(err => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        console.error('Error no controlado:', err);
        return of(err); // ← devuelve observable, no error directo
      })
    );
  }

  setLoginLocalStorage(token:any){
    localStorage.setItem('_token',token);
  }

  getLoginLocalStorage(){
    return localStorage.getItem('_token');
  }

  setUserLocalStorage(user:any){
    localStorage.setItem('_user',JSON.stringify(user));
  }

  getUserLocalStorage(){
    return localStorage.getItem(`_user`);
  }

  setPerfilLocalStorage(token:any){
    localStorage.setItem('_perfil',token);
  }

  getPerfilLocalStorage(){
    return localStorage.getItem('_perfil');
  }

  logout(){
    console.log('Borrado Cache');
    localStorage.removeItem('_token');
    localStorage.removeItem('_user');
    localStorage.removeItem('_perfil');
  }

  validarExpiracionToken(token: any) {
    
    if (localStorage.getItem('_user')) {
      
      let decodedToken = this.getDecodedAccessToken(token);
      let expirationDate = decodedToken.exp; // get token expiration dateTime
      ////console.log('EXPIRACION - '+expirationDate);
      if (Number(moment().format('X')) > Number(expirationDate)) {
        //console.log('Aqui dio false');
        return false;//token expiro
      } else {
        //console.log('Aqui dio true');
        return true;//token todavia valido
      }
    }
    else {
      return false;
    }
  }
  
  getDecodedAccessToken(token: string): any {
    try {
      return jwtDecode(token);
    }
    catch (Error) {
      return null;
    }
  }

  
}
