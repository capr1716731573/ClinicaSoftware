import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScoreMamaService {
  constructor() {}

  //Puntuacion: FC
  calc_frecuencia_cardiaca(valor: number): number {
    let respuesta: any = null;

    if (valor >= 50 && valor <= 99) {
      respuesta = 0;
    } else if (valor >= 100 && valor <= 109) {
      respuesta = 1;
    } else if ((valor >= 110 && valor <= 129) || (valor >= 41 && valor <= 49)) {
      respuesta = 2;
    } else if (valor >= 130 || valor <= 40) {
      respuesta = 3;
    }

    return respuesta;
  }

  //Puntuacion: Sistolica
  calc_sistolica(valor: number): number {
    let respuesta: any = null;

    if (valor >= 90 && valor <= 139) {
      respuesta = 0;
    } else if ((valor >= 140 && valor <= 149) || (valor >= 80 && valor <= 89)) {
      respuesta = 1;
    } else if ((valor >= 71 && valor <= 79) || (valor >= 150 && valor <= 159)) {
      respuesta = 2;
    } else if (valor <= 70 || valor >= 160) {
      respuesta = 3;
    }

    return respuesta;
  }

  //Puntuacion: Diastolica
  calc_diastolica(valor: number): number {
    let respuesta: any = null;

    if (valor >= 50 && valor <= 89) {
      respuesta = 0;
    } else if (valor <= 49 || (valor >= 90 && valor <= 99)) {
      respuesta = 1;
    } else if (valor >= 100 && valor <= 109) {
      respuesta = 2;
    } else if (valor >= 110) {
      respuesta = 3;
    }

    return respuesta;
  }

  // Puntuacion: FR (Frecuencia Respiratoria)
  calc_frecuencia_respiratoria(valor: number): number {
    let respuesta: any = null;

    if (valor >= 11 && valor <= 20) {
      respuesta = 0;
    } else if (valor >= 21 && valor <= 24) {
      respuesta = 1;
    } else if (valor >= 25 && valor <= 29) {
      respuesta = 2;
    } else if (valor >= 30 || valor <= 10) {
      respuesta = 3;
    }

    return respuesta;
  }

  // Puntuacion: T (°C) (Temperatura Corporal)
  calc_temperatura(valor: number): number {
    let respuesta: any = null;

    // Rango normal (incluye 36.0–36.5 que antes quedaba sin puntaje y bloqueaba el score)
    if (valor >= 36.0 && valor <= 37.4) {
      respuesta = 0;
    } else if (
      (valor >= 37.5 && valor <= 38.2) ||
      (valor >= 35 && valor <= 35.9)
    ) {
      respuesta = 1;
    } else if (valor >= 39 || valor < 35) {
      respuesta = 3;
    } else if (valor >= 38.3 && valor <= 38.9) {
      respuesta = 2;
    }

    return respuesta;
  }

  // Puntuacion: Sat (Saturación de Oxígeno)
  calc_saturacion(valor: number): number {
    let respuesta: any = null;

    if (valor >= 94) {
      respuesta = 0;
    } else if (valor >= 91 && valor <= 93) {
      respuesta = 1;
    } else if (valor >= 89 && valor <= 90) {
      respuesta = 2;
    } else if (valor <= 88) {
      respuesta = 3;
    }

    return respuesta;
  }

  // Puntuacion: Estado de Conciencia
  calc_estado_conciencia(valor: string): number {
    let respuesta: any = null;

    if (valor == 'alerta') {
      respuesta = 0;
    } else if (valor == 'voz') {
      respuesta = 1;
    } else if (valor == 'dolor' || valor == 'agitada') {
      respuesta = 2;
    } else if (valor == 'nores') {
      respuesta = 3;
    }

    return respuesta;
  }


  calc_gastoUrinario(valor: string): number {
    let respuesta: any = null;

    if (valor == 'nocuantificable') {
      respuesta = 0;
    } else if (valor == '30') {
      respuesta = 2;
    } else if (valor == '10') {
      respuesta = 3;
    }

    return respuesta;
  }

    // Puntuacion: Estado de Conciencia
  calc_oxigeno_terapia(valor: string): number {
    let respuesta: any = null;

    if (valor == 'aire') {
      respuesta = 0;
    } else if (valor == 'cateter') {
      respuesta = 2;
    } else if (valor == 'mascara') {
      respuesta = 3;
    }

    return respuesta;
  }
}
