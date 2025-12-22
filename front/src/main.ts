import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import 'hammerjs';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    document.body.classList.add(isIOS ? 'is-ios' : 'not-ios');
  })
  .catch((err) => console.error(err));
