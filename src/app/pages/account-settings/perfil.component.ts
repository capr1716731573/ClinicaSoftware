import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styles: `
    /* Scoped styles for Perfil */
    .perfil-shell {
      --perfil-grad-1: #1f3c88;
      --perfil-grad-2: #28c3a3;
      --perfil-text-muted: rgba(255, 255, 255, 0.85);
    }

    .perfil-hero {
      position: relative;
      border-radius: 10px;
      overflow: hidden;
      background: linear-gradient(135deg, var(--perfil-grad-1), var(--perfil-grad-2));
      padding: 18px 18px 14px 18px;
      color: #fff;
    }

    .perfil-hero h4 {
      color: #ffffff;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.28);
    }

    .perfil-hero::after {
      content: '';
      position: absolute;
      inset: -60px -60px auto auto;
      width: 180px;
      height: 180px;
      background: rgba(255, 255, 255, 0.14);
      filter: blur(0px);
      border-radius: 50%;
    }

    .perfil-hero .perfil-sub {
      color: var(--perfil-text-muted);
      margin: 0;
    }

    .perfil-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.25);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
      font-weight: 700;
      letter-spacing: 0.5px;
      font-size: 20px;
      user-select: none;
    }

    .perfil-badges .badge {
      font-size: 0.85rem;
      padding: 0.45rem 0.6rem;
      margin-right: 0.35rem;
      margin-bottom: 0.35rem;
    }

    .perfil-kv {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .perfil-kv:last-child {
      border-bottom: 0;
    }

    .perfil-kv .k {
      color: #6c757d;
      font-weight: 600;
      font-size: 0.86rem;
      min-width: 155px;
    }

    .perfil-kv .v {
      text-align: right;
      font-weight: 600;
      word-break: break-word;
    }

    .perfil-section-title {
      font-weight: 700;
      margin: 0 0 10px 0;
      letter-spacing: 0.2px;
    }

    .perfil-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0.35rem 0.6rem;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.035);
      border: 1px solid rgba(0, 0, 0, 0.06);
      font-weight: 600;
      margin-right: 0.4rem;
      margin-bottom: 0.4rem;
    }

    .perfil-pill i {
      opacity: 0.85;
    }

    .perfil-empty {
      padding: 18px;
      border-radius: 10px;
      border: 1px dashed rgba(0, 0, 0, 0.25);
      background: rgba(0, 0, 0, 0.02);
    }
  `,
})
export class PerfilComponent implements OnInit {
  private readonly _loginService = inject(LoginService);

  user: any = null;

  vm = {
    fullName: 'SIN DATO',
    initials: 'NA',
    login: 'SIN DATO',
    correo: 'SIN DATO',
    celular: 'SIN DATO',
    identificacion: 'SIN DATO',
    genero: 'SIN DATO',
    estadoCivil: 'SIN DATO',
    perfiles: [] as string[],
    badges: {
      estadoUsuario: { text: 'SIN DATO', cls: 'badge-secondary', icon: 'fa fa-question' },
      superUsuario: { text: 'SIN DATO', cls: 'badge-secondary', icon: 'fa fa-question' },
      doctorUsuario: { text: 'SIN DATO', cls: 'badge-secondary', icon: 'fa fa-question' },
    },
  };

  ngOnInit(): void {
    this.user = this._loginService.getUserLocalStorage();
    this.buildVM();
  }

  private buildVM() {
    if (!this.user) {
      return;
    }

    const u = this.user;

    const fullName = this.joinName([
      u?.apellidopat_persona,
      u?.apellidomat_persona,
      u?.nombre_primario_persona,
      u?.nombre_secundario_persona,
    ]);

    const perfiles = Array.isArray(u?.perfiles)
      ? u.perfiles
          .map((p: any) => this.display(p?.nombre_perfil))
          .filter((x: string) => x !== 'SIN DATO')
      : [];

    this.vm.fullName = fullName;
    this.vm.initials = this.getInitials(fullName, u?.login_usuario);
    this.vm.login = this.display(u?.login_usuario);
    this.vm.correo = this.display(u?.correo_persona);
    this.vm.celular = this.display(u?.celular_persona);
    this.vm.identificacion = this.display(u?.numidentificacion_persona);
    this.vm.genero = this.display(u?.genero?.desc_catdetalle ?? u?.genero?.descripcion ?? u?.genero);
    this.vm.estadoCivil = this.display(
      u?.estado_civil?.desc_catdetalle ?? u?.estado_civil?.desc_catDetalle ?? u?.estado_civil?.descripcion ?? u?.estado_civil
    );
    this.vm.perfiles = perfiles.length ? perfiles : ['SIN DATO'];

    this.vm.badges.estadoUsuario = this.badgeEstadoUsuario(u?.estado_usuario);
    this.vm.badges.superUsuario = this.badgeFlag(u?.super_usuario, 'SUPER USUARIO', 'fa fa-shield', 'badge-primary');
    this.vm.badges.doctorUsuario = this.badgeFlag(u?.doctor_usuario, 'MÉDICO', 'fa fa-user-md', 'badge-info');
  }

  private display(value: any): string {
    if (value === null || value === undefined) return 'SIN DATO';
    if (typeof value === 'string') {
      const v = value.trim();
      return v.length ? v : 'SIN DATO';
    }
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'SI' : 'NO';
    return String(value);
  }

  private joinName(parts: any[]): string {
    const clean = parts
      .map((p) => this.display(p))
      .filter((p) => p !== 'SIN DATO')
      .join(' ')
      .trim();
    return clean.length ? clean : 'SIN DATO';
  }

  private getInitials(fullName: string, login: any): string {
    if (fullName && fullName !== 'SIN DATO') {
      const words = fullName
        .split(' ')
        .map((w) => w.trim())
        .filter(Boolean);
      const a = words[0]?.[0] ?? '';
      const b = words.length > 1 ? words[1]?.[0] ?? '' : words[0]?.[1] ?? '';
      const ini = (a + b).toUpperCase();
      return ini.length ? ini : 'NA';
    }
    const lg = this.display(login);
    return lg !== 'SIN DATO' ? lg.slice(0, 2).toUpperCase() : 'NA';
  }

  private badgeEstadoUsuario(flag: any) {
    if (flag === true) return { text: 'ACTIVO', cls: 'badge-success', icon: 'fa fa-check' };
    if (flag === false) return { text: 'INACTIVO', cls: 'badge-danger', icon: 'fa fa-times' };
    return { text: 'SIN DATO', cls: 'badge-secondary', icon: 'fa fa-question' };
  }

  private badgeFlag(flag: any, label: string, icon: string, okCls: string) {
    if (flag === true) return { text: label, cls: okCls, icon };
    if (flag === false) return { text: `NO ${label}`, cls: 'badge-secondary', icon: 'fa fa-minus' };
    return { text: 'SIN DATO', cls: 'badge-secondary', icon: 'fa fa-question' };
  }
}
