import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxColorsModule } from 'ngx-colors';
import { ITRoutingModule } from './it-routing.module';
import { NewStudentsComponent } from './new-students/new-students.component';
import { AddStudentUserComponent } from './add-student-user/add-student-user.component';
import { NewTeachersComponent } from './new-teachers/new-teachers.component';
import { AddTeacherUserComponent } from './add-teacher-user/add-teacher-user.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    NewStudentsComponent,
    AddStudentUserComponent,
    NewTeachersComponent,
    AddTeacherUserComponent
  ],
  imports: [
    CommonModule,
    ITRoutingModule,
    SharedModule,
    NgxColorsModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbModule

  ],
  exports: []
})
export class ITModule { }
