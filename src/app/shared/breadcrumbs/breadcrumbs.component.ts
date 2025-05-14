import { Component, inject, OnDestroy } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-breadcrumbs',
  imports: [],
  templateUrl: './breadcrumbs.component.html',
  styles: ``,
})
export class BreadcrumbsComponent implements OnDestroy{
  private router = inject(Router);
  public titulo: string;
  public tituloSubs$: Subscription;

  constructor() {
    this.tituloSubs$ = this.getArgumentosRuta().subscribe((data: any) => {
      this.titulo = data.titulo; //cambio en el breadcrumbs
      document.title = data.titulo;
    });
  }

  ngOnDestroy(): void {
    this.tituloSubs$.unsubscribe();//elimina la subscripcion del observable
  }

  getArgumentosRuta() {
    return this.router.events.pipe(
      filter((event) => event instanceof ActivationEnd),
      filter((event: ActivationEnd) => event.snapshot.firstChild === null),
      map((event: ActivationEnd) => event.snapshot.data)
    );
  }
}
