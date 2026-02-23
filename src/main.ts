import { bootstrapApplication } from '@angular/platform-browser';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

Amplify.configure(awsExports);

bootstrapApplication(AppComponent, appConfig);
