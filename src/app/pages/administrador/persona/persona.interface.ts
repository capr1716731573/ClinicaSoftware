export interface Persona {
  pk_persona?: number; // optional if serial
  apellidopat_persona: string;
  apellidomat_persona?: string;
  nombre_primario_persona: string;
  nombre_secundario_persona: string;
  correo_persona?: string;
  telefono_persona?: string;
  celular_persona?: string;
  fecnac_persona: string; // o Date si vas a convertirlo
  fk_ocupacion?: number;
  detalle_profesion_persona?: string;
  fk_tipoidentificacion: number;
  numidentificacion_persona: string;
  fk_sexo: number;
  fk_nivelacademico?: number;
  fk_estadocivil?: number;
  fk_pais: number;
  fk_provincia: number;
  fk_canton: number;
  fk_parroquia: number;
  discapacidad_persona: boolean;
  lista_discapacidades?: any; // Si tienes el formato JSON claro, puedes tiparlo mejor
  fk_tipo_sangre?: number;
  fk_estado_educacion?: number;
  barrio_persona?: string;
}
