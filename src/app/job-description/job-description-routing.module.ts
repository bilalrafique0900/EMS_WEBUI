import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JDComponent } from './jd/jd.component';
const routes: Routes = [
  {
    path: 'jd',
    component: JDComponent,
   // canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobDescriptionRoutingModule { }
