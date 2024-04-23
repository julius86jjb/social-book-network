import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { environments } from '../environments/environments';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { NgCircleProgressModule } from 'ng-circle-progress';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom([
      provideFirebaseApp(() => initializeApp(environments.firebaseConfig)),
      provideFirestore(() => getFirestore()),

    ]),
    { provide: FIREBASE_OPTIONS, useValue: environments.firebaseConfig },
  ]
};
