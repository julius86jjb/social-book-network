import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { environments } from '../environments/environments';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { provideToastr } from 'ngx-toastr';


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
