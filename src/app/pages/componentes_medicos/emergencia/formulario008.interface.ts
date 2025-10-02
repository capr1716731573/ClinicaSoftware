export interface Emergencia {
  _a: {
    pk_emerg: number;
    casalud_id_fk: number;
    fk_hcu: number;
    adminisionista_usu_id_fk: number;
    estado_emerg:boolean;
  };

  _b: {
    forma_llegada: {
      ambulatorio: boolean;
      ambulancia: boolean;
      otro_trans: boolean;
    };
    fuente: string | null;
    institucion_entrega: string | null;
    telefono_inst: string | null;
  };

  _c: {
    fecha: string | null;
    hora: string | null;
    condicion_llegada: {
      estable: boolean;
      inestable: boolean;
      fallecido: boolean;
    };
    motivo_atencion: string | null;
  };

  _d: {
    fecha: string | null;
    hora: string | null;
    lugar: string | null;
    direccion: string | null;
    custodia_policial: string | null;
    accidente_transito: boolean;
    caida: boolean;
    quemadura: boolean;
    mordedura: boolean;
    ahogamiento: boolean;
    asfixia: boolean;
    cuerpo_extrano: boolean;
    aplastamiento: boolean;
    otro_accidente: boolean;
    violencia_arma_fuego: boolean;
    violencia_arma_punzante: boolean;
    violencia_rina: boolean;
    violencia_familiar: boolean;
    violencia_fisica: boolean;
    violencia_psicologica: boolean;
    violencia_sexual: boolean;
    notificacion: string | null;
    intox_alcoholica: boolean;
    intox_alimentaria: boolean;
    intox_drogas: boolean;
    intox_gases: boolean;
    intox_otra: boolean;
    picadura: boolean;
    envenenamiento: boolean;
    anafilaxia: boolean;
    aliento_alcohol: boolean;
    observacion_d: string | null;
  };

  _e: {
    no_aplica: boolean;
    alergicos: boolean;
    clinicos: boolean;
    traumatologicos: boolean;
    ginecologicos: boolean;
    pediatricos: boolean;
    quirurgicos: boolean;
    farmacologicos: boolean;
    habitos: boolean;
    familiares: boolean;
    otros: boolean;
    observacion_e: string | null;
  };

  _f: {
    observacion_f: string | null;
  };

  _g: {
    sin_constantes_vitales: string | null;
    presion_arterial_mmhg: string | null;
    presion_arterial_sistolica: string | null;
    presion_arterial_diastolica: string | null;
    pulso_por_min: string | null;
    frecuencia_respiratoria_por_min: string | null;
    pulsioximetria_porcentaje: string | null;
    temperatura: string | null;
    estado_conciencia: string | null;
    proteinuria: string | null;
    score_mama: number | null;
    peso_kg: string | null;
    talla_cm: string | null;
    glicemia_capilar_mg_dl: string | null;
    glasgow: number | null;
    ocular: number | null;
    verbal: number | null;
    motora: number | null;
    perimetro_cefalico:string | null;
    eva:string | null;
    pupila_izq: string | null;
    pupila_der: string | null;
    llenado_capilar: string | null;

  };

  _h: {
    piel_faneras: boolean;
    cabeza: boolean;
    ojos: boolean;
    oidos: boolean;
    nariz: boolean;
    boca: boolean;
    oro_faringe: boolean;
    cuello: boolean;
    axilas_mamas: boolean;
    torax: boolean;
    abdomen: boolean;
    columna_vertebral: boolean;
    ingle_perine: boolean;
    miembros_superiores: boolean;
    miembros_inferiores: boolean;
    observacion_h: string | null;
  };

  _i: {
    observacion_i: string | null;
  };

  _j: {
    no_aplica: boolean;
    numero_gestas: number | null;
    numero_partos: number | null;
    numero_abortos: number | null;
    numero_cesareas: number | null;
    fum: string | null;
    semanas_gestacion: number | null;
    movimiento_fetal: string | null;
    frecuencia_cardiaca_fetal: string | null;
    ruptura_de_membranas: string | null;
    tiempo: string | null;
    afu: string | null;
    presentacion: string | null;
    dilatacion: string | null;
    borramiento: string | null;
    plano: string | null;
    pelvis_viable: string | null;
    sangrado_vaginal: string | null;
    contracciones: string | null;
    score_mama: number | null;
    observacion_j: string | null;
  };

  _k: {
    no_aplica: boolean;
    biometria: boolean;
    uroanalisis: boolean;
    quimica_sanguinea: boolean;
    electrolitos: boolean;
    gasometria: boolean;
    electro_cardiograma: boolean;
    rx_torax: boolean;
    rx_osea: boolean;
    ecografia_pelvica: boolean;
    ecografia_abdomen: boolean;
    rx_abdomen: boolean;
    interconsulta: boolean;
    tomografia: boolean;
    resonancia: boolean;
    endoscopia: boolean;
    otros: boolean;
    observacion_k: string | null;
  };

  _n: {
    observacion_n: string | null;
  };

  _o: {
    vivo: boolean;
    estable: boolean;
    inestable: boolean;
    fallecido: boolean;
    alta_definitiva: boolean;
    consulta_externa: boolean;
    observacion_de_emergencia: boolean;
    hospitalizacion: boolean;
    referencia: boolean;
    inversa: boolean;
    derivacion: boolean;
    establecimiento: boolean;
    dias_reposo: string | null;
    observacion_o: string | null;
  };

  _p: {
    medico_usu_id_fk: number | null;
  };

  auditoria: {
    fecha_creacion: string | null;
    fecha_modificacion: string | null;
  };
};

export interface EmergenciaDiagnostico {
  pk_emerdiag: number;                          // serial4 NOT NULL
  fk_emerg: number;                             // int8 NOT NULL
  fk_cie: number;                               // int8 NOT NULL
  fecha_creacion_emerdiag: Record<string, any> | null;     // json NULL
  fecha_modificacion_emerdiag: Record<string, any> | null; // json NULL
  tipo_emerdiag: string;                        // text NOT NULL
}

export interface EmergenciaPlanTratamiento {
  pk_plantra: number;                     // serial4 NOT NULL
  fk_emerg: number;                       // int8 NOT NULL
  fecha_creacion_plantra: any | null;     // json NULL
  fecha_modificacion_plantra: any | null; // json NULL
  medicamiento_plantra: string;           // text NOT NULL
  via_plantra: string;                    // text NOT NULL
  dosis_plantra: string;                  // text NOT NULL
  posologia_plantra: string;              // text NOT NULL
  dias: number;                           // int8 NOT NULL
}