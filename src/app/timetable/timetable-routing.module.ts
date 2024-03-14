import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'src/app/shared/security/auth-guard.service';
import { TimetableListComponent } from './timetable-list/timetable-list.component';
import { TimetableclassComponent } from './timetableclass/timetableclass.component';
const routes: Routes = [
  {
    path: 'timetable-list/:cid/:cname',
    title: 'TimeTable',
    component: TimetableListComponent,
    //canActivate: [AuthGuardService]
  },
  {
    path: 'timetable-class',
    title: 'TimeTable ',
    component: TimetableclassComponent,
    //canActivate: [AuthGuardService]
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimeTableRoutingModule { }
