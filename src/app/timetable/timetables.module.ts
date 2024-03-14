import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxColorsModule } from 'ngx-colors';
import { TimetableListComponent } from './timetable-list/timetable-list.component';
import { TimeTableRoutingModule } from './timetable-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { TimetableclassComponent } from './timetableclass/timetableclass.component';


@NgModule({
  declarations: [
    TimetableListComponent,
    TimetableclassComponent
  ],
  imports: [
    CommonModule,
    TimeTableRoutingModule,
    SharedModule,
    NgxColorsModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbModule

  ],
  exports: []
})
export class TimeTableModule { }
