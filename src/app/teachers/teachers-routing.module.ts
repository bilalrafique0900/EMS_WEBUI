import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../shared/security/auth-guard.service';
import { TeacherListComponent } from './teacher-list/teacher-list.component';
import { TeacherCoursesComponent } from './teacher-courses/teacher-courses.component';
import { TeacherClassesComponent } from './teacher-classes/teacher-classes.component';

const routes: Routes = [
  {
    path: 'teacher-list',
    title: 'Teacher',
    component: TeacherListComponent,
    canActivate: [AuthGuardService]
  }
  ,
  {
    path: 'teacher-courses',
    component: TeacherCoursesComponent
  },
  {
    path: 'teacher-classes',
    component: TeacherClassesComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeacherRoutingModule { }
