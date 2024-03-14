import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxColorsModule } from 'ngx-colors';
import { TeacherListComponent } from './teacher-list/teacher-list.component';
import { TeacherRoutingModule } from './teachers-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TeacherCoursesComponent } from './teacher-courses/teacher-courses.component';
import { TeacherClassesComponent } from './teacher-classes/teacher-classes.component';


@NgModule({
  declarations: [
    TeacherListComponent,
    TeacherCoursesComponent,
    TeacherClassesComponent,
  ],
  imports: [
    CommonModule,
    TeacherRoutingModule,
    SharedModule,
    NgxColorsModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbModule,

  ],
  exports: []
})
export class TeacherModule { }
