import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ToastMessageComponent } from './components/toast-message/toast-message.component';
import { ToastService } from './services/toast.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { fader } from '././route-animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ToastMessageComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [fader]
})
export class AppComponent {
  title = 'stilyshop';

  hideChrome = false;

  constructor(
    public toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });

        const url = this.router.url || '';
        this.hideChrome = url.startsWith('/admin');

        let r: ActivatedRoute | null = this.route;
        while (r?.firstChild) r = r.firstChild;
        const hideHeader = !!r?.snapshot.data?.['hideHeader'];
        const hideFooter = !!r?.snapshot.data?.['hideFooter'];
        this.hideChrome = this.hideChrome || hideHeader || hideFooter;
      });
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}
