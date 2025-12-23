import { Component, OnInit, signal } from '@angular/core';
import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  animations: [
    trigger('heroIntro', [
      state('out', style({ opacity: 0, transform: 'translateY(12px)' })),
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('out => in', [
        animate('1100ms 120ms cubic-bezier(0.16, 1, 0.3, 1)'),
      ]),
    ]),
    trigger('logoPop', [
      state('out', style({ opacity: 0, transform: 'scale(0.92) rotate(-1deg)' })),
      state('in', style({ opacity: 1, transform: 'scale(1) rotate(0deg)' })),
      transition('out => in', [
        animate(
          '1200ms 260ms cubic-bezier(0.16, 1, 0.3, 1)',
          keyframes([
            style({
              opacity: 0,
              transform: 'scale(0.92) rotate(-1deg)',
              offset: 0,
            }),
            style({
              opacity: 1,
              transform: 'scale(1.03) rotate(0deg)',
              offset: 0.7,
            }),
            style({ opacity: 1, transform: 'scale(1) rotate(0deg)', offset: 1 }),
          ])
        ),
      ]),
    ]),
    trigger('subtitleFade', [
      state('out', style({ opacity: 0, transform: 'translateY(6px)' })),
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('out => in', [
        animate('800ms 420ms ease-out'),
      ]),
    ]),
  ],
  styles: `
    .dashboard-hero {
      display: grid;
      place-items: center;
      padding: 2.25rem 1rem;
      min-height: 60vh;
    }

    .dashboard-hero-card {
      width: min(720px, 100%);
      display: grid;
      place-items: center;
      gap: 1.1rem;
      padding: 2rem 1.25rem;
      border-radius: 22px;
      background: rgba(17, 25, 40, 0.55);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(10px);
    }

    .dashboard-logo {
      width: min(560px, 92vw);
      height: auto;
      border-radius: 18px;
      box-shadow: 0 14px 34px rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.10);
      background: rgba(255, 255, 255, 0.03);
      padding: 10px;
    }

    .dashboard-title {
      margin: 0;
      text-align: center;
      letter-spacing: 0.2px;
      line-height: 1.15;
      font-family: 'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Arial,
        sans-serif;
      font-weight: 700;
      font-size: clamp(1.15rem, 2.2vw, 1.6rem);
      color: rgba(255, 255, 255, 0.92);
      text-shadow: 0 10px 26px rgba(0, 0, 0, 0.45);
    }

    .dashboard-title strong {
      background: linear-gradient(90deg, #4cc9f0, #4895ef, #4361ee);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .dashboard-subtitle {
      margin: -0.25rem 0 0;
      text-align: center;
      font-family: 'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Arial,
        sans-serif;
      font-weight: 500;
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.70);
    }

    /* Responsive tweaks */
    @media (max-width: 768px) {
      .dashboard-hero {
        min-height: 52vh;
        padding: 1.5rem 0.75rem;
      }

      .dashboard-hero-card {
        padding: 1.5rem 1rem;
        border-radius: 18px;
        gap: 0.9rem;
      }

      .dashboard-logo {
        width: min(520px, 94vw);
        border-radius: 16px;
        padding: 8px;
      }
    }

    @media (max-width: 480px) {
      .dashboard-hero {
        min-height: 46vh;
        padding: 1.25rem 0.5rem;
      }

      .dashboard-hero-card {
        padding: 1.15rem 0.85rem;
        border-radius: 16px;
      }

      .dashboard-logo {
        width: 100%;
        padding: 6px;
        border-radius: 14px;
      }

      .dashboard-subtitle {
        font-size: 0.85rem;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .dashboard-hero,
      .dashboard-hero-card,
      .dashboard-logo,
      .dashboard-title,
      .dashboard-subtitle {
        animation: none !important;
        transition: none !important;
      }
    }
  `,
})
export class DashboardComponent implements OnInit {
  heroState = signal<'out' | 'in'>('out');
  logoState = signal<'out' | 'in'>('out');

  ngOnInit(): void {
    // Dispara la animación aunque el componente ya esté renderizado.
    setTimeout(() => {
      this.heroState.set('in');
    });

    // Fallback: si el evento (load) no dispara (cache/edge cases), igual mostramos el logo.
    setTimeout(() => {
      if (this.logoState() === 'out') this.logoState.set('in');
    }, 1200);
  }

  onLogoLoad(): void {
    // Animamos el logo cuando termina de cargar (sensación más “real”).
    setTimeout(() => {
      this.logoState.set('in');
    }, 80);
  }
}
