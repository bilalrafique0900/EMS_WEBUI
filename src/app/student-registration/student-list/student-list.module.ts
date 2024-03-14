import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SharedModule } from 'src/app/shared/shared.module';
import { StudentRegistrationModule } from '../student-registration.module';
import { StudentcontractDialogueComponent } from '../studentcontract-dialogue/studentcontract-dialogue.component';
import { StudentListRoutingModule } from './student-list-routing.module';
import { StudentListComponent } from './student-list.component';
import {MatTabsModule} from '@angular/material/tabs';
@NgModule({
  declarations: [
    StudentListComponent,
    StudentcontractDialogueComponent,
  ],
  imports: [
    CommonModule,
    StudentListRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgSelectModule,
    PdfViewerModule,
    StudentRegistrationModule,
    MatTabsModule
  ],
  exports: [] 
})
export class StudentListModule { }
