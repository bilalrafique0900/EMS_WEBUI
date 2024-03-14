import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from './registration/registration.component';
import { StudentprofileComponent } from './studentprofile/studentprofile.component';
import { AuthGuardService } from '../shared/security/auth-guard.service';

const routes: Routes = [
  {
    path: 'student',
    title: 'Student - Registration',
    component: RegistrationComponent,
    //canActivate: [AuthGuardService]
  },
  {
    path: 'profile',
    title: 'Profile',
    component: StudentprofileComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'student-list',
    title: 'Student - List',
    loadChildren: () =>
      import('./student-list/student-list.module').then(
        (m) => m.StudentListModule
      ),
   // component: StudentListComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRegistrationRoutingModule { }
