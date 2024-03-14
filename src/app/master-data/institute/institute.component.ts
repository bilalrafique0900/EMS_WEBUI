import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
declare var require: any;
import { v4 as uuidv4 } from 'uuid';
const Swal = require('sweetalert2');
@Component({
  selector: 'app-institute',
  templateUrl: './institute.component.html',
  styleUrls: ['./institute.component.scss'],
  providers: [DatePipe]
})
export class InstituteComponent {
  public instituteForm!: FormGroup;
  submitted = false;
  curdBtnIsList:boolean = true;
  sessionStartDatePicker: { day?: number; month: number; year: number };
  sessionEndDatePicker: { day?: number; month: number; year: number };
  licenseExpireDatePicker: { day?: number; month: number; year: number };
  gridList: any[]=[];
  pagination:any = paginationEnum;
  isEdit:boolean=false;
  searchText:string='';
  constructor(private readonly fb: FormBuilder,
     private readonly toast: ToastrService,
      private readonly http: HttpRequestService,
      private readonly datePipe: DatePipe
      ) {
    this.instituteForm = this.fb.group({
      InstituteId:  uuidv4(),
      InstituteName: ["", Validators.required],
      Address: [""],
      Phone: ["", Validators.required],
      //Logo: ["", Validators.required],
      LicenseExpireDate: ["", Validators.required],
      Islicense: [false],
      SessionStartDate: ["", Validators.required],
      SessionEndDate: ["", Validators.required],
      Description: [""],
    });
    this.sessionStartDatePicker = {
      day: 1,
      month: 1,
      year: new Date().getFullYear(),
    };
    this.sessionEndDatePicker = {
      day: 1,
      month: 1,
      year: new Date().getFullYear(),
    };
    this.licenseExpireDatePicker={
      day: 1,
      month: 1,
      year: new Date().getFullYear(),
    };
  }

  ngOnInit(): void {
    this.getInstitutes();
  }
  setDefaultTime(){
    this.sessionStartDatePicker = {
      day: 1,
      month: 1,
      year: new Date().getFullYear(),
    };
    this.sessionEndDatePicker = {
      day: 1,
      month: 1,
      year: new Date().getFullYear(),
    };
    this.licenseExpireDatePicker={
      day: 1,
      month: 1,
      year: new Date().getFullYear(),
    };
  }
  onPageChange(event: any) {
    
    this.pagination.pageNo = event;
    this.getInstitutes();
    // You can perform any necessary actions with the selected page number here
  }
  get basicFormControl() {
    return this.instituteForm.controls;
  }
  onSearchText(){
    this.pagination.pageNo=1;
    this.pagination.pageSize=10;
    this.getInstitutes();
  }
  getInstitutes() {
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    this.http.get('master/institute/institutes-list?pageNo='+this.pagination.pageNo+'&pageSize='+this.pagination.pageSize+'&searchText='+this.searchText).subscribe({
      next: result => {
        this.gridList=[];
        this.gridList = result.data.data;
        this.pagination.totalCount=result.data.totalCount;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  changeCurdView(bitVal: boolean) {
    this.curdBtnIsList = bitVal;
    this.isEdit=false;
  }
  setValueToForm(row: any) {
    
    this.instituteForm.controls['InstituteId'].setValue(row.instituteId);
    this.instituteForm.controls['InstituteName'].setValue(row.instituteName);
    this.instituteForm.controls['Description'].setValue(row.description);
    this.instituteForm.controls['Address'].setValue(row.address);
    this.instituteForm.controls['Phone'].setValue(row.phone);
    //this.instituteForm.controls['LicenseExpireDate'].setValue(row.licenseExpireDate);
      // Extract day, month, and year from sessionStartDate
      let FormatelicenseExpireDate = this.datePipe.transform(row?.licenseExpireDate,"yyyy-MM-dd");
      let splitexpireDate:any = FormatelicenseExpireDate?.split('-');
      this.licenseExpireDatePicker.year = Number(splitexpireDate[0]);
      this.licenseExpireDatePicker.month = Number(splitexpireDate[1]);
      this.licenseExpireDatePicker.day = Number(splitexpireDate[2]);

    this.instituteForm.controls['Islicense'].setValue(row.islicense);
    //this.instituteForm.controls['SessionStartDate'].setValue(row.sessionStartDate);
    let FormatesessionStartDate = this.datePipe.transform(row?.sessionStartDate,"yyyy-MM-dd");
    let splitstartDate:any = FormatesessionStartDate?.split('-');
    this.sessionStartDatePicker.year = Number(splitstartDate[0]);
    this.sessionStartDatePicker.month = Number(splitstartDate[1]);
    this.sessionStartDatePicker.day = Number(splitstartDate[2]);

    //this.instituteForm.controls['SessionEndDate'].setValue(row.sessionEndDate);
    let FormatesessionEndDate = this.datePipe.transform(row?.sessionEndDate,"yyyy-MM-dd");
    let splitsessionEndDate:any = FormatesessionEndDate?.split('-');
    this.sessionEndDatePicker.year = Number(splitsessionEndDate[0]);
    this.sessionEndDatePicker.month = Number(splitsessionEndDate[1]);
    this.sessionEndDatePicker.day = Number(splitsessionEndDate[2]);
    this.isEdit=true;
    this.curdBtnIsList = false;
  }
  isRecordExist(){
    const existing = this.gridList.find(obj => obj.instituteName.trim().toLowerCase() === this.instituteForm.value.InstituteName.trim().toLowerCase() && obj.instituteId!=this.instituteForm.value.InstituteId);

    if (existing) {
      this.toast.error("Institute Name already exists")
      return true;
    }
    return false;
  }
  formSubmit() {
    
    this.submitted = true;
    if (!this.instituteForm.valid)
      return;
      if(this.isRecordExist())
return;
      let StartDate = this.sessionStartDatePicker.year +'-'+ this.sessionStartDatePicker.month +'-'+ this.sessionStartDatePicker.day;
      let EndDate = this.sessionEndDatePicker.year +'-'+ this.sessionEndDatePicker.month +'-'+ this.sessionEndDatePicker.day;
      let ExpireDate = this.licenseExpireDatePicker.year +'-'+ this.licenseExpireDatePicker.month +'-'+ this.licenseExpireDatePicker.day;
      
      this.instituteForm.value['SessionStartDate'] = StartDate;
      this.instituteForm.value['SessionEndDate'] = EndDate;
      this.instituteForm.value['LicenseExpireDate'] = ExpireDate;
    this.http.post('master/institute/create-update',this.instituteForm.value).subscribe({
      next: (data: any) => {
        this.instituteForm.reset();
        this.instituteForm.controls['InstituteId'].setValue(uuidv4());
        this.toast.success("Institute  has been Saved.");
        this.isEdit=false;
        this.getInstitutes();
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
        this.http.get(`master/institute/delete?id=${row.instituteId}`).subscribe({
          next: result => {
            if (result.status) {
              this.getInstitutes();
              this.toast.success(result.message)
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your institute has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6259ca',
        });
      }
    });
  }
  IsActive(row: any) {
    
    this.http.get(`master/institute/active?id=${row.instituteId}`).subscribe({
      next: result => {
        if (result.status) {
          this.getInstitutes();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  get InstituteId() { return this.instituteForm.get("InstituteId"); }
  get InstituteName() { return this.instituteForm.get("InstituteName"); }
  get Address() { return this.instituteForm.get("Address"); }
  get Phone() { return this.instituteForm.get("Phone"); }
  //get Logo() { return this.instituteForm.get("Logo"); }
  get LicenseExpireDate() { return this.instituteForm.get("LicenseExpireDate"); }
  get Islicense() { return this.instituteForm.get("Islicense"); }
  get SessionStartDate() { return this.instituteForm.get("SessionStartDate"); }
  get SessionEndDate() { return this.instituteForm.get("SessionEndDate"); }
  get Description() { return this.instituteForm.get("Description"); }
}