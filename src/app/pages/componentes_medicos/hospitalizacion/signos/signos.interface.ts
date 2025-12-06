/**
 * Interface para la tabla signos_vitales_b
 * Signos vitales básicos
 */
export interface SignosVitalesB {
  pk_sigvita_b?: number;
  fecha_creacion_sigvita_b: any; // jsonb
  fecha_modificacion_sigvita_b?: any; // jsonb
  fecha_sigvita_b: string; // date
  hora_sigvita_b: string; // time
  casalud_id_fk: number;
  fk_hcu: number;
  medico_usu_id_fk: number;
  dia_inter_sigvita_b?: number;
  dia_post_sigvita_b?: number;
  pulso_sigvita_b: number;
  temp_sigvita_b: number;
  frecresp_sigvita_b?: number;
  pulsometria_sigvita_b?: number;
  presistolica_sigvita_b?: number;
  prediastolica_sigvita_b?: number;
  estadoconciencia_sigvita_b?: string;
  proteinuria_sigvita_b?: number;
  scoremama_sigvita_b?: number;
}

/**
 * Interface para la tabla signos_vitales_c
 * Medidas antropométricas
 */
export interface SignosVitalesC {
  pk_sigvita_c?: number;
  fecha_creacion_sigvita_c: any; // jsonb
  fecha_modificacion_sigvita_c?: any; // jsonb
  fecha_sigvita_c: string; // date
  hora_sigvita_c: string; // time
  casalud_id_fk: number;
  fk_hcu: number;
  medico_usu_id_fk: number;
  peso_sigvita_c?: number;
  talla_sigvita_c?: number;
  pericefalico_sigvita_c?: number;
  periabdominal_sigvita_c?: number;
  otros_sigvita_c?: number;
}

/**
 * Interface para la tabla signos_vitales_d
 * Balance hídrico y dieta
 */
export interface SignosVitalesD {
  pk__sigvita_d?: number;
  fecha_creacion__sigvita_d: any; // jsonb
  fecha_modificacion__sigvita_d?: any; // jsonb
  fecha_sigvita_d: string; // date
  hora_sigvita_d: string; // time
  casalud_id_fk: number;
  fk_hcu: number;
  medico_usu_id_fk: number;
  bh_i_enteral_sigvita_d?: number;
  bh_i_parenteral_sigvita_d?: number;
  bh_i_viaoral_sigvita_d?: number;
  bh_i_total_sigvita_d?: number;
  bh_e_orina_sigvita_d?: number;
  bh_e_drenaje_sigvita_d?: number;
  bh_e_vomito_sigvita_d?: number;
  bh_e_diarreas_sigvita_d?: number;
  bh_e_otros_sigvita_d?: number;
  bh_e_total_sigvita_d?: number;
  bh_ie_total_sigvita_d?: number;
  dieta_sigvita_d?: string;
  num_comidas_sigvita_d?: number;
  num_micciones_sigvita_d?: number;
  num_deposiciones_sigvita_d?: number;
}

/**
 * Interface para la tabla signos_vitales_e
 * Cuidados y actividades
 */
export interface SignosVitalesE {
  pk_sigvita_e?: number;
  fecha_creacion_sigvita_e: any; // jsonb
  fecha_modificacion_sigvita_e?: any; // jsonb
  fecha_sigvita_e: string; // date
  hora_sigvita_e: string; // time
  casalud_id_fk: number;
  fk_hcu: number;
  medico_usu_id_fk: number;
  aseo_sigvita_e?: string;
  bano_sigvita_e?: string;
  reposo_sigvita_e?: string;
  posicion_sigvita_e?: string;
  otros_sigvita_e?: string;
}

/**
 * Interface para la tabla signos_vitales_f
 * Dispositivos y procedimientos
 */
export interface SignosVitalesF {
  pk_sigvita_f?: number;
  fecha_creacion_sigvita_f: any; // jsonb
  fecha_modificacion_sigvita_f?: any; // jsonb
  fecha_sigvita_f: string; // date
  hora_sigvita_f: string; // time
  casalud_id_fk: number;
  fk_hcu: number;
  medico_usu_id_fk: number;
  viacentral_sigvita_f?: string; // date
  viaperiferica_sigvita_f?: string; // date
  sondanaso_sigvita_f?: string; // date
  sondavesi_sigvita_f?: string; // date
  otros_sigvita_f?: string;
}
