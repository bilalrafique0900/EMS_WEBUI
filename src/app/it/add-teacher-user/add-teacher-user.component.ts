import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TeacherService } from 'src/app/domain/services/teacher.service';
import { AuthService } from 'src/app/shared/security/auth-service.service';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { v4 as uuidv4 } from 'uuid';
@Component({
  selector: 'app-add-teacher-user',
  templateUrl: './add-teacher-user.component.html',
  styleUrls: ['./add-teacher-user.component.scss'],
  providers: [DatePipe]
})
export class AddTeacherUserComponent {
  public userForm!: FormGroup;
  isSubmitted:boolean=false;
  teacherId: any;
  teacher: any={};
  roleList: any[]=[];
  user: any={};
  isUserExist=false;
  loginBranchId: string='';
  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly toast: ToastrService,
   private readonly http:HttpRequestService,
   private readonly teacherService: TeacherService,
   private readonly authService:AuthService,
   private readonly router: Router,
  ) {
    this.userForm = this.fb.group({
      userId: uuidv4(),
      teacherEmail: ["", Validators.required],
      teacherId: [this.route.snapshot.queryParams["tid"],Validators.required],
      fullName:[''],
      branchId:[''],

    });
    this.loginBranchId = this.authService.getBranchIdFromLoginUser();
    this.userForm.controls['branchId'].setValue(this.loginBranchId);
  }
  get basicFormControl() {
    return this.userForm.controls;
  }
  ngOnInit(): void {
    this.getTeacherInfo();
  }
  getTeacherInfo() {
    this.teacherId = this.route.snapshot.queryParams["tid"];
    this.teacherService.getTeacherBasicInfo(this.teacherId).subscribe({
      next: res => {
        
        this.teacher = res.data;
        this.userForm.controls['fullName'].setValue(this.teacher.fullName);
        this.userForm.controls['teacherEmail'].setValue(this.teacher.teacherEmail);       
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  formSubmit() {
    
    this.isSubmitted = true;
    if (!this.userForm.valid)
      return;
      this.teacherId = this.route.snapshot.queryParams["tid"];
      this.teacherService.saveteacheruser(this.userForm.value).subscribe({
        next: (result: any) => {
          if(result.data){
            this.toast.success("Updated Successfully..!");
            this.router.navigate(['/it/new-teachers']);
            }
            else
            this.toast.error("User Email Already Exist..!");
        },
        error: (err: any) => {
          this.toast.error(err.error);
        },
      });
  }
}