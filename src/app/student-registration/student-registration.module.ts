import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { SharedModule } from '../shared/shared.module';
import { ParentDetailsComponent } from './parent-details/parent-details.component';
import { PreviousSchoolDetailsComponent } from './previous-school-details/previous-school-details.component';
import { ProfileDialogueComponent } from './profile-dialogue/profile-dialogue.component';
import { RegistrationComponent } from './registration/registration.component';
import { StudentRegistrationRoutingModule } from './student-registration-routing.module';
import { StudentprofileComponent } from './studentprofile/studentprofile.component';

@NgModule({
  declarations: [
    RegistrationComponent,
    StudentprofileComponent,
    //StudentListComponent,
    ProfileDialogueComponent,
    PreviousSchoolDetailsComponent,
    ParentDetailsComponent,
    //StudentcontractDialogueComponent

  ],
  imports: [
    CommonModule,
    StudentRegistrationRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgSelectModule,
    MatStepperModule,
    //MatFormFieldModule,
   // MatDatepickerModule,
    NgxDropzoneModule,
  ],
  exports: [ProfileDialogueComponent]
})
export class StudentRegistrationModule { }
