import { Component, inject, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-account-settings',
  imports: [],
  templateUrl: './account-settings.component.html',
  styles: ``
})
export class AccountSettingsComponent implements OnInit{
    
  public _settingsService = inject(SettingsService);

  ngOnInit(){
    this._settingsService.checkCurrentTheme()
  }

  changeTheme(theme:string){    
    this._settingsService.changeTheme(theme);
  }

     
}
