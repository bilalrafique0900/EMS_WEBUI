import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClassComponent } from './class/class.component';
import { CourseComponent } from './course/course.component';
import { InstituteComponent } from './institute/institute.component';
import { InstituteBranchComponent } from './institute-branch/institute-branch.component';
import { PaymentTypesComponent } from './payment-types/payment-types.component';
import { AuthGuardService } from '../shared/security/auth-guard.service';
import { RoomComponent } from './room/room.component';
import { BranchTimingsComponent } from './branch-timings/branch-timings.component';
import { ClassCoursesComponent } from './class-courses/class-courses.component';
import { AreaComponent } from './area/area.component';
import { ZoneComponent } from './zone/zone.component';
import { TemplateComponent } from './template/template.component';
import { SectionComponent } from './section/section.component';
import { ClassSectionComponent } from './class-section/class-section.component';
import { DiscountComponent } from './discount/discount.component';
import { StudentDocumentComponent } from './student-document/student-document.component';
import { PaymentTypeSapConfigComponent } from './payment-type-sap-config/payment-type-sap-config.component';
import { DepartmentComponent } from './department/department.component';
import { GroupComponent } from './group/group.component';
import { PostHostComponent } from './posthost/posthost.component';

const routes: Routes = [
  {
    path: 'departments',
    component: DepartmentComponent,
   // canActivate: [AuthGuardService]
  },
  {
    path: 'groups',
    component: GroupComponent,
   // canActivate: [AuthGuardService]
  },
  {
    path: 'posthosts',
    component: PostHostComponent,
   // canActivate: [AuthGuardService]
  },
  {
    path: 'class',
    component: ClassComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'course',
    component: CourseComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'institute',
    component: InstituteComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'institute-branch',
    component: InstituteBranchComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'branch-timings',
    component: BranchTimingsComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'payment-types',
    component: PaymentTypesComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'room',
    component: RoomComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'class-courses',
    component: ClassCoursesComponent
  },
  {
    path: 'template',
    component: TemplateComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'area',
    component: AreaComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'zone',
    component: ZoneComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'section',
    component: SectionComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'class-section',
    component: ClassSectionComponent
  },
  {
    path: 'discount',
    component: DiscountComponent
  }, 
  {
    path: 'student-document',
    component: StudentDocumentComponent
  },
  {
    path: 'Payment-type-sap-config',
    component: PaymentTypeSapConfigComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterDataRoutingModule { }
