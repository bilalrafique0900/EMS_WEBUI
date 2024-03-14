import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxEditorModule } from 'ngx-editor';
import { SharedModule } from '../shared/shared.module';
import { TermRoutingModule } from './term-routing.module';
import { TermsComponent } from './terms/terms.component';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    TermsComponent
  ],
  imports: [
    CommonModule,
    TermRoutingModule,
    SharedModule,
    //NgxColorsModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    // Ng2TelInputModule,
    NgSelectModule,
    MatStepperModule,
    MatFormFieldModule,
    //ArchwizardModule,
    MatIconModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatIconModule,
    // AngularEditorModule,
    // NgxDropzoneModule,
    NgxEditorModule,
  ]
})
export class TermModule { }
