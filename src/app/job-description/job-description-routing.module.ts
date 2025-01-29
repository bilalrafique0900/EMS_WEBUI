import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JDComponent } from './jd/jd.component';
import { CvComponent } from './cv/cv.component';
const routes: Routes = [
  {
    path: 'jd',
    component: JDComponent,
   // canActivate: [AuthGuardService]
  },
  {
    path: 'cv',
    component: CvComponent,
   // canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobDescriptionRoutingModule { }
