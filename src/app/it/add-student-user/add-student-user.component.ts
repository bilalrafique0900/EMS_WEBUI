import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StudentService } from 'src/app/domain/services/student.service';
import { AuthService } from 'src/app/shared/security/auth-service.service';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';
@Component({
  selector: 'app-add-student-user',
  templateUrl: './add-student-user.component.html',
  styleUrls: ['./add-student-user.component.scss'],
  providers: [DatePipe]
})
export class AddStudentUserComponent {
  public userForm!: FormGroup;
  isSubmitted:boolean=false;
  studentId: any;
  student: any={};
  roleList: any[]=[];
  user: any={};
  isUserExist=false;
  loginBranchId: string='';
  parent: any={};
  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly toast: ToastrService,
   private readonly http:HttpRequestService,
   private readonly studentService: StudentService,
   private readonly authService:AuthService,
   private readonly router: Router,
  ) {
    this.userForm = this.fb.group({
      UserId: uuidv4(),
      Email: ["", Validators.required],
      RoleId: [uuidv4(),Validators.required],
      StudentId: [this.route.snapshot.queryParams["sid"],Validators.required],
      FullName:['', Validators.required],
      FatherName:['', Validators.required],
      FatherEmail:['', Validators.required],
      BranchId:[''],
      ParentId:['']

    });
    this.loginBranchId = this.authService.getBranchIdFromLoginUser();
    this.userForm.controls['BranchId'].setValue(this.loginBranchId);
  }
  get basicFormControl() {
    return this.userForm.controls;
  }
  ngOnInit(): void {
    this.getRoleList();
    this.getStudentInfo();
    this.getStudentParentInfo();
  }
  getStudentParentInfo() {
    this.studentId = this.route.snapshot.queryParams["sid"];
    this.studentService.getStudentParentInfoByStudentId(this.studentId).subscribe({
      next: res => {
        
        this.parent = res.data;
        this.userForm.controls['FatherName'].setValue(this.parent.fatherName);
        this.userForm.controls['FatherEmail'].setValue(this.parent.fatherEmail);
        this.userForm.controls['ParentId'].setValue(this.parent.parentId);
        
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getStudentInfo() {
    this.studentId = this.route.snapshot.queryParams["sid"];
    this.studentService.getStudentBasicInfo(this.studentId).subscribe({
      next: res => {
        
        this.student = res.data;
        this.userForm.controls['FullName'].setValue(this.student.fullName);
        this.userForm.controls['Email'].setValue(this.student.studentEmail);
        
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getRoleList(){
    this.http.get('user-management/role/get').subscribe({
      next: result => {
        this.roleList =  result.data.filter((m:any)=>m.keyCode==='STUDENT');
      },
      error: (err: any) => {this.toast.error(err.message)},
      });
}
  formSubmit() {
    
    this.isSubmitted = true;
    if (!this.userForm.valid)
      return;
      this.studentId = this.route.snapshot.queryParams["sid"];
      this.http.post('student-users/update-student-user', this.userForm.value).subscribe((result: any) => {
        if(result.data){
        this.toast.success("Updated Successfully..!");
        this.router.navigate(['/it/new-students']);
        }
        else
        this.toast.error("User Email Already Exist..!");
      },
        (error) => {
          this.toast.error(error.error);
        });
  }
}