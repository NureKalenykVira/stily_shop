import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-account-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-panel.component.html',
  styleUrls: ['./account-panel.component.scss']
})
export class AccountPanelComponent {
  user = {
    name: 'Віра',
    surname: 'Каленик',
    email: 'vera.kalenik2203i@gmail.com'
  };
}
