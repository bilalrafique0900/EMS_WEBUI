import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';

import { NgSelectModule } from '@ng-select/ng-select';

import { NgxEditorModule } from 'ngx-editor';

import { JobDescriptionRoutingModule } from './job-description-routing.module';
import { JDComponent } from './jd/jd.component';

@NgModule({
  declarations: [
    JDComponent
  ],
  imports: [
    CommonModule,
    JobDescriptionRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
     NgxEditorModule,
  ]
})
export class JobDescriptionModule { }
