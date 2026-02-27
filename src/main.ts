import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app/app.routes';
// import { authInterceptor } from './app/interceptors/auth.interceptor';

import { register as registerSwiperElements } from 'swiper/element/bundle';
import { environment } from './environments/environment';

console.log('Current Environment:', environment.apiUrl);
registerSwiperElements();

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // 🔥 THIS WAS MISSING
    provideHttpClient(
      // withInterceptors([authInterceptor])
    )
  ]
}).catch(err => console.error(err));
