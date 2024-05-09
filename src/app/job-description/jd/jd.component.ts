import { Component, OnInit } from '@angular/core';
import { FormBuilder,FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';
import { DepartmentService } from 'src/app/domain/services/department.service';
import { PostHostService } from 'src/app/domain/services/posthost.service';
import { GroupService } from 'src/app/domain/services/group.service';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { AuthService } from 'src/app/shared/security/auth-service.service';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { EmployeeService } from 'src/app/domain/services/employee.service';
import { DesignationCode, LovCode } from 'src/app/shared/Enum/lov-enum';
import { LovService } from 'src/app/domain/services/Lov.service';
import { Editor, Toolbar } from 'ngx-editor';
import { DatePipe } from '@angular/common';
import { JobService } from 'src/app/domain/services/job.service ';
@Component({
  selector: 'app-jd',
  templateUrl: './jd.component.html',
  styleUrls: ['./jd.component.scss'],
  providers: [DatePipe],
})
export class JDComponent {
  editor: any;
  public jobForm!: FormGroup;
  submitted = false;
  curdBtnIsList:boolean = true;
  pagination:any = paginationEnum;
  isEdit: boolean=false;
  jobOpeningDatePicker: { day?: number; month: number; year: number };
  
  searchText:string='';
  branchId:any;
  departmentList: any[] = [];
  posthostList: any[] = [];
  groupList: any[] = [];

  managerList: any[]=[];
  employmenttypeList: any[]=[];
  jobList: any[]=[];
  constructor(
    private fb: FormBuilder, 
    private toast: ToastrService,
    private departmentService: DepartmentService, 
    private groupService: GroupService, 
    private postHostService: PostHostService, 
    private LovServ:LovService,
    private employeeService: EmployeeService, 
    private jobService: JobService, 
    private readonly datePipe: DatePipe,
    private http: HttpRequestService,
    private authSrv : AuthService) {
    this.jobForm = this.fb.group({
      JobDescriptionId:uuidv4(),
      DepartmentId: ['',Validators.required],
      GroupId: ['',Validators.required],
     
      PostHostId: ['',Validators.required],
      HiringManagerId: ['',Validators.required],
      EmploymentTypeId: ['',Validators.required],
      Title: ['', Validators.required],
      JobOpeningDate: ['', Validators.required],
      Description:['',Validators.required]
    });
    const today = new Date();
    this.jobOpeningDatePicker = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.getgroups();
   
    this.getdepartments();
    this.getposthosts();
    this.getHiringManagers();
    this.getEmploymentTypeByLovCode();
    this.getjobdescriptions();
  }
    // make sure to destory the editor
    ngOnDestroy(): void {
      this.editor.destroy();
    }
    toolbar: Toolbar = [
      ['bold', 'italic'],
      ['underline', 'strike'],
      ['code', 'blockquote'],
      ['ordered_list', 'bullet_list'],
      [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
      ['link', 'image'],
      ['text_color', 'background_color'],
      ['align_left', 'align_center', 'align_right', 'align_justify'],
    ];
  get basicFormControl() {
    return this.jobForm.controls;
  }
  onPageChange(event: any) {
    this.pagination.pageNo = event;
    this.getjobdescriptions();
  }
  onSearchText(){
    this.pagination.pageNo=1;
    this.pagination.pageSize=10;
    this.getjobdescriptions();
  }
  getjobdescriptions() {
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    if(this.pagination.searchText=='')
    this.pagination.searchText = "";
    this.jobService.get(this.pagination.pageNo,this.pagination.pageSize,this.pagination.searchText).subscribe({
      next: result => {
        debugger;
        this.jobList=[];
        this.jobList = result.data;
        this.pagination.totalCount = result.data[0]?.totalRecords || 0;
      },
      error: (err: any) => {
        debugger;
        this.toast.error(err.message) },
    });
  }
  getEmploymentTypeByLovCode(): void {
    this.LovServ.getLevelByCode(LovCode.EMPLOYMENT_TYPE).subscribe({
      next: (result) => {
        this.employmenttypeList = result.data;
      },
      error: (err: any) => {
        this.toast.error(err?.error?.message);
      },
    });
  }
  getdepartments() {

    this.departmentService.getall().subscribe({
      next: result => {
        
        this.departmentList=[];
        this.departmentList = result.data;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getposthosts() {

    this.postHostService.getall().subscribe({
      next: result => {
        
        this.posthostList=[];
        this.posthostList = result.data;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getgroups() {

    this.groupService.getall().subscribe({
      next: result => {
        
        this.groupList=[];
        this.groupList = result.data;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  
  getHiringManagers() {

    this.employeeService.getEmployeesByDesignation(DesignationCode.MANAGER).subscribe({
      next: result => {
        
        this.managerList=[];
        this.managerList = result.data;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  changeCurdView(bitVal: boolean) {
    this.curdBtnIsList = bitVal;
    this.isEdit=false; 
  }
  setValueToForm(row: any) {
    this.jobForm.controls['JobDescriptionId'].setValue(row.jobDescriptionId);
    this.jobForm.controls['DepartmentId'].setValue(row.departmentId);
    this.jobForm.controls['PostHostId'].setValue(row.postHostId);
    this.jobForm.controls['GroupId'].setValue(row.groupId);
    
    this.jobForm.controls['HiringManagerId'].setValue(row.hiringManagerId);
    this.jobForm.controls['EmploymentTypeId'].setValue(row.employmentTypeId);
    this.jobForm.controls['Title'].setValue(row.title);
    this.jobForm.controls['Description'].setValue(row.description);
    this.curdBtnIsList = false;
    this.isEdit=true;
    let FormateOpeningDate = this.datePipe.transform(
      row.jobOpeningDate,
      'yyyy-MM-dd'
    );
    let splitOpeningDate: any = FormateOpeningDate?.split('-');
    if (Array.isArray(splitOpeningDate)) {
      this.jobOpeningDatePicker = {
        day: Number(splitOpeningDate[2]),
        month: Number(splitOpeningDate[1]),
        year: Number(splitOpeningDate[0]),
      };
  }
}
  formSubmit() {
    
    this.submitted = true;
    if (!this.jobForm.valid)
      return;
      let JobOpeningDate =
      this.jobOpeningDatePicker.year +
      '-' +
      this.jobOpeningDatePicker.month +
      '-' +
      this.jobOpeningDatePicker.day;
  

    this.jobForm.value['JobOpeningDate'] = JobOpeningDate;
    this.jobService.saveUpdate(this.jobForm.value).subscribe({
      next: (data: any) => {
        this.jobForm.reset();
        this.jobForm.controls['JobDescriptionId'].setValue(uuidv4());
        this.toast.success("Job Descripton has been Saved.");
        this.isEdit=false;
        this.curdBtnIsList =true;
        this.getjobdescriptions();
      },
      error: (err: any) => {
        this.toast.error(err.error);
      },
    
    });
  }
  deleteRow(row: any) {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure ?',
      text: 'You will not be able to recover this imaginary file!',
      showCancelButton: true,
      confirmButtonColor: '#6259ca',
      cancelButtonColor: '#6259ca',
      confirmButtonText: 'Yes, delete it!',
      reverseButtons: true,
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.jobService.delete(row.jobDespcritionId).subscribe({
          next: result => {
            if (result.status) {
              this.getjobdescriptions();
              this.toast.success("Record Deleted SuccessFully")
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your class has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6259ca',
        });
      }
    });
  }
  IsActive(row: any) {
    this.jobService.active(row.jobDespcritionId).subscribe({
      next: result => {
        if (result.status) {
          this.getjobdescriptions();
          this.toast.success("Record Active OR InActive SuccessFully");
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
}
