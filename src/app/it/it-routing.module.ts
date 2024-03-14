import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewStudentsComponent } from './new-students/new-students.component';
import { AuthGuardService } from '../shared/security/auth-guard.service';
import { AddStudentUserComponent } from './add-student-user/add-student-user.component';
import { NewTeachersComponent } from './new-teachers/new-teachers.component';
import { AddTeacherUserComponent } from './add-teacher-user/add-teacher-user.component';

const routes: Routes = [
  {
    path: 'new-students',
    title: 'IT New Students',
    component: NewStudentsComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'add-student-user',
    title: 'Add Student User',
    component: AddStudentUserComponent,
  },{
    path: 'new-teachers',
    title: 'IT New Teachers',
    component: NewTeachersComponent,
    canActivate: [AuthGuardService]
  }, 
  {
    path: 'add-teacher-user',
    title: 'Add Teacher User',
    component: AddTeacherUserComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ITRoutingModule { }
