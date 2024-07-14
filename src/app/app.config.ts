import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { provideToastr } from 'ngx-toastr';
import { environments } from '../environments/environments';


export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideToastr({timeOut: 7000, preventDuplicates: true,positionClass: 'toast-bottom-right'}),
    provideRouter(routes,  withHashLocation()),
    provideHttpClient(),
    importProvidersFrom([
      provideFirebaseApp(() => initializeApp(environments.firebaseConfig)),
      provideFirestore(() => getFirestore()),

    ]),
    { provide: FIREBASE_OPTIONS, useValue: environments.firebaseConfig },
  ]
};
