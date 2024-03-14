import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentListComponent } from './student-list.component';
import { AuthGuardService } from 'src/app/shared/security/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    title: 'Student - List',
    component: StudentListComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentListRoutingModule { }
