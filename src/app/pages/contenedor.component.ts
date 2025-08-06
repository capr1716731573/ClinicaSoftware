import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  RouterOutlet,
  Router,
} from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { BreadcrumbsComponent } from '../shared/breadcrumbs/breadcrumbs.component';
import { SettingsService } from '../services/settings.service';

//Importar  libreria JS del template
declare function customInitFuntionsJs();

@Component({
  selector: 'app-contenedor',
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    BreadcrumbsComponent,
  ],
  templateUrl: './contenedor.component.html',
  styles: ``,
})
export class ContenedorComponent implements OnInit {
  public _settingsService = inject(SettingsService);
  private _routerService = inject(Router);
  isSidebarCollapsed = false;

  constructor(){
    //customInitFuntionsJs();
  }

  ngOnInit() {
    customInitFuntionsJs();
  }
  

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
