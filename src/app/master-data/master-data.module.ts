import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { BranchTimingsComponent } from './branch-timings/branch-timings.component';
import { ClassCoursesComponent } from './class-courses/class-courses.component';
import { ClassComponent } from './class/class.component';
import { CourseComponent } from './course/course.component';
import { InstituteBranchComponent } from './institute-branch/institute-branch.component';
import { InstituteComponent } from './institute/institute.component';
import { MasterDataRoutingModule } from './master-data-routing.module';
import { PaymentTypesComponent } from './payment-types/payment-types.component';
import { RoomComponent } from './room/room.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { TemplateComponent } from './template/template.component';
import { NgxEditorModule } from 'ngx-editor';
import { ZoneComponent } from './zone/zone.component';
import { AreaComponent } from './area/area.component';
import { SectionComponent } from './section/section.component';
import { ClassSectionComponent } from './class-section/class-section.component';
import { DiscountComponent } from './discount/discount.component';
import { StudentDocumentComponent } from './student-document/student-document.component';
import { PaymentTypeSapConfigComponent } from './payment-type-sap-config/payment-type-sap-config.component';
import { DepartmentComponent } from './department/department.component';
import { GroupComponent } from './group/group.component';
import { PostHostComponent } from './posthost/posthost.component';


@NgModule({
  declarations: [
    DepartmentComponent,
    GroupComponent,
    PostHostComponent,
    ClassComponent,
    CourseComponent,
    InstituteBranchComponent,
    InstituteComponent,
    PaymentTypesComponent,
    RoomComponent,
    BranchTimingsComponent,
    ClassCoursesComponent,
    TemplateComponent,
    ZoneComponent,
    AreaComponent,
    SectionComponent,
    ClassSectionComponent,
    DiscountComponent,
    StudentDocumentComponent,
    PaymentTypeSapConfigComponent
  ],
  imports: [
    CommonModule,
    MasterDataRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
     NgxEditorModule,
  ]
})
export class MasterDataModule { }
