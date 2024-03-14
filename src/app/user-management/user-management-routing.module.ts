import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleComponent } from './role/role.component';
import { UserComponent } from './user/user.component';
import { PermissionComponent } from './permission/permission.component';
import { AuthGuardService } from '../shared/security/auth-guard.service';

const routes: Routes = [
  {path: 'role',component: RoleComponent,
  //canActivate: [AuthGuardService]
},
  {path: 'user',component: UserComponent,
  //canActivate: [AuthGuardService]
},
  {path: 'permission',component: PermissionComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
