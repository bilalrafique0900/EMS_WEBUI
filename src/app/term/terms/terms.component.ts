import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { AuthService } from 'src/app/shared/security/auth-service.service';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { environment } from 'src/environments/environment';
declare var require: any;
import { v4 as uuidv4 } from 'uuid';
const Swal = require('sweetalert2');
@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
  providers:[DatePipe]
})
export class TermsComponent {
  public termForm!: FormGroup;
  submitted = false;
  curdBtnIsList:boolean = true;
  TermStartDatePicker: { day?: number; month: number; year: number };
  TermEndDatePicker: { day?: number; month: number; year: number };
  gridList: any[] = [];
  pagination:any = paginationEnum;
  branchList: any[] = [];
  isEdit:boolean=false;
  searchText:string='';
  LoginBranchId: any=this.authSrv.getBranchIdFromLoginUser();
  constructor(private fb: FormBuilder, private toast: ToastrService, private http: HttpRequestService
    ,private readonly datePipe:DatePipe,
    private readonly authSrv: AuthService
    ) {
    this.termForm = this.fb.group({
      TermId: uuidv4(),
      BranchId: [this.LoginBranchId, Validators.required],     
      TermName: ["", Validators.required],
      TermStartDate: ["", Validators.required],
      TermEndDate: ["", Validators.required],
      Description: [""],
    });
    this.TermStartDatePicker = {
      day: 1,
      month: 1,
      year: new Date().getFullYear(),
    };
    this.TermEndDatePicker = {
      day: 1,
      month: 1,
      year: new Date().getFullYear(),
    };
  }

  ngOnInit(): void {
    this.getTerms();
    this.getBranches();
  }
  setDefaultTime(){
    this.TermStartDatePicker = {
      day: 1,
      month: 1,
      year: new Date().getFullYear(),
    };
    this.TermEndDatePicker = {
      day: 1,
      month: 1,
      year: new Date().getFullYear(),
    };
  }
  onPageChange(event: any) {
    
    this.pagination.pageNo = event;
    this.getTerms();
    // You can perform any necessary actions with the selected page number here
  }
  get basicFormControl() {
    return this.termForm.controls;
  }
  getTerms() {
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    this.http.get('master/term/terms-list?pageNo='+this.pagination.pageNo+'&pageSize='+this.pagination.pageSize+'&searchText='+this.searchText).subscribe({
      next: result => {
        
        this.gridList=[];
        this.gridList = result.data.data;
        this.pagination.totalCount=result.data.totalCount;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getBranches() {
    this.http.get('master/branch').subscribe({
      next: result => {
        
        this.branchList=[];
        this.branchList = result.data;

      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  changeCurdView(bitVal:boolean){
    this.curdBtnIsList = bitVal;
    this.isEdit=false;
  }
  setValueToForm(row: any) {
    this.termForm.controls['TermId'].setValue(row.termId);
    this.termForm.controls['BranchId'].setValue(row.branchId);
    this.termForm.controls['TermName'].setValue(row.termName);
    this.termForm.controls['Description'].setValue(row.description);
    //this.termForm.controls['TermStartDate'].setValue(row.termStartDate);
    let FormatetermStartDate = this.datePipe.transform(row?.termStartDate,"yyyy-MM-dd");
    let splittermStartDate:any = FormatetermStartDate?.split('-');
    this.TermStartDatePicker.year = Number(splittermStartDate[0]);
    this.TermStartDatePicker.month = Number(splittermStartDate[1]);
    this.TermStartDatePicker.day = Number(splittermStartDate[2]);
    //this.termForm.controls['TermEndDate'].setValue(row.termEndDate);
    let FormatetermEndDate = this.datePipe.transform(row?.termEndDate,"yyyy-MM-dd");
    let splittermEndDate:any = FormatetermEndDate?.split('-');
    this.TermEndDatePicker.year = Number(splittermEndDate[0]);
    this.TermEndDatePicker.month = Number(splittermEndDate[1]);
    this.TermEndDatePicker.day = Number(splittermEndDate[2]);
    this.isEdit=true;
    this.curdBtnIsList = false;
  }
  isRecordExist(){
    const existing = this.gridList.find(obj => obj.termName.trim().toLowerCase() === this.termForm.value.TermName.trim().toLowerCase() && obj.branchId==this.termForm.value.BranchId  && obj.termId!=this.termForm.value.TermId);

    if (existing) {
      this.toast.error("Term Name already exists")
      return true;
    }
    return false;
  }
  dateCheck(){
    if(new Date(this.termForm.value.TermEndDate) < new Date(this.termForm.value.TermStartDate)){
      this.toast.warning("End Date should be equal or greater than Start Date.");
      return true;
    }else{
      return false
    }
  }
  formSubmit() {
    
    this.submitted = true;
    if (!this.termForm.valid)
      return;
      if(this.isRecordExist())
return;

      let StartDate = this.TermStartDatePicker.year +'-'+ this.TermStartDatePicker.month +'-'+ this.TermStartDatePicker.day;
      let EndDate = this.TermEndDatePicker.year +'-'+ this.TermEndDatePicker.month +'-'+ this.TermEndDatePicker.day;
      this.termForm.value['TermStartDate'] = StartDate;
      this.termForm.value['TermEndDate'] = EndDate;
      if(this.dateCheck())
        return;
    this.http.post('master/term',this.termForm.value).subscribe({
      next: (data: any) => {
        //this.termForm.reset();

        this.termForm.controls['TermId'].setValue(uuidv4());
        this.termForm.controls['TermName'].setValue('');
        this.toast.success("Term  has been Saved.");
        this.isEdit=false;
        this.getTerms();
        this.setDefaultTime();
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
        this.http.get(`master/term/delete?id=${row.termId}`).subscribe({
          next: result => {
            if (result.status) {
              this.getTerms();
              this.toast.success(result.message)
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your term has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6259ca',
        });
      }
    });
  }
  IsActive(row: any) {
    
    this.http.get(`master/term/active?id=${row.termId}`).subscribe({
      next: result => {
        if (result.status) {
          this.getTerms();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  get TermId() { return this.termForm.get("TermId"); }
  get TermName() { return this.termForm.get("TermName"); }
  get TermStartDate() { return this.termForm.get("TermStartDate"); }
  get TermEndDate() { return this.termForm.get("TermEndDate"); }
  get Description() { return this.termForm.get("Description"); }
}
