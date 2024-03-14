import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TermsComponent } from './terms/terms.component';
import { AuthGuardService } from '../shared/security/auth-guard.service';

const routes: Routes = [
  {
    path: 'term',
    title: 'Term',
    component: TermsComponent,
    canActivate: [AuthGuardService]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TermRoutingModule { }
