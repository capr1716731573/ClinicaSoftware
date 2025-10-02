import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScoreMamaService {

  constructor() { }

  //Puntuacion: FC
  calc_frecuencia_cardiaca(valor: number): number {
    let respuesta: any = null;
  
    if (valor >= 60 && valor <= 100) {
      respuesta = 0;
    } else if ((valor >= 101 && valor <= 110) || (valor >= 51 && valor <= 59)) {
      respuesta = 1;
    } else if (valor >= 111 && valor <= 119) {
      respuesta = 2;
    } else if (valor >= 120 || valor <= 50) {
      respuesta = 3;
    }
  
    return respuesta;
  }

  //Puntuacion: Sistolica
  calc_sistolica(valor: number): number {
    let respuesta: any = null;
  
    if (valor >= 90 && valor <= 139) {
      respuesta = 0;
    } else if ((valor >= 140 && valor <= 159) || (valor >= 71 && valor <= 89)) {
      respuesta = 2;
    } else if (valor <= 70 || valor >= 160 ) {
      respuesta = 3;
    }
  
    return respuesta;
  }

  //Puntuacion: Diastolica
  calc_diastolica(valor: number): number {
    let respuesta: any = null;
  
    if (valor >= 60 && valor <= 85) {
      respuesta = 0;
    } else if (valor >= 86 && valor <= 89) {
      respuesta = 1;
    } else if ((valor >= 90 && valor <= 109) || (valor >= 51 && valor <= 59)) {
      respuesta = 2;
    } else if (valor <= 50 || valor >= 110 ) {
      respuesta = 3;
    }
  
    return respuesta;
  }

  // Puntuacion: FR (Frecuencia Respiratoria)
  calc_frecuencia_respiratoria(valor: number): number {
  let respuesta: any = null;

  if (valor >= 12 && valor <= 22) {
      respuesta = 0;
  } else if (valor >= 23 && valor <= 29) {
      respuesta = 1;
  } else if (valor >= 30 || valor <= 11) {
      respuesta = 3;
  }

  return respuesta;
  }

// Puntuacion: T (°C) (Temperatura Corporal)
  calc_temperatura(valor: number): number {
    let respuesta: any = null;

    if (valor >= 35.6 && valor <= 37.2) {
        respuesta = 0;
    } else if (valor >= 37.3 && valor <= 38.4) {
        respuesta = 1;
    } else if (valor >= 38.5) {
        respuesta = 3;
    } else if (valor <= 35.5) {
        respuesta = 2;
    }

    return respuesta;
  }

  // Puntuacion: Sat (Saturación de Oxígeno)
  calc_saturacion(valor: number): number {
    let respuesta: any = null;

    if (valor >= 94 && valor <= 100) {
        respuesta = 0;
    } else if (valor >= 90 && valor <= 93) {
        respuesta = 1;
    } else if (valor >= 86 && valor <= 89) {
        respuesta = 2;
    } else if (valor <= 85) {
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

  // Puntuacion: Sat (Saturación de Oxígeno)
  calc_proteinuria(valor: number): number {
    let respuesta: any = null;

    if (valor > 0) {
        respuesta = 1;
    } else {
        respuesta = 0;
    } 
    return respuesta;
  }

  
}