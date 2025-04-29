import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';                                             
import { AreaService } from 'src/app/domain/services/area.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ConfigService } from 'src/app/shared/services/config.service';
import { v4 as uuidv4 } from 'uuid';
import { paginationEnum } from '../shared/Enum/paginationEnum';
import { OnboardingService } from '../domain/services/onboarding.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  providers: [DatePipe,AreaService],
})

export class OnboardingComponent implements OnInit {
  onboardingId: any;
  url: string | ArrayBuffer | null | undefined;
  urlAttachment!: string | ArrayBuffer | null;
  @ViewChild('stepper') stepper!: MatStepper;
  
  registrationForm!: FormGroup;
  parentRegistrationForm!: FormGroup;
  submitted = false;
  isEdit = false;
  
  onboardingStartDatePicker: { day?: number; month: number; year: number };
  curdBtnIsList: boolean = true;
  searchText: string = '';
  pagination: any = paginationEnum;
  baseUrl: any = this.configService.baseApiUrl;
  working:boolean=false;
  onboardingList: any[]=[];
  onboardingDetails: any={};
  constructor(
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly toast: ToastrService,
    private readonly modalService: NgbModal,
    private readonly onboardingService: OnboardingService,
    private readonly common: CommonService,
    private readonly configService: ConfigService
  ) {
    this.registrationForm = this.fb.group({
      OnboardingId: uuidv4(),

      CompanyName: ['', Validators.required],
      ContactPersonName: ['', Validators.required], 
      ContactPhoneNumber:['', Validators.required],
      ContactEmailAddress: ['', [Validators.pattern(this.common.emailPatteren)]], //Validators.required,
      ClientType: ['', Validators.required],
      OnboardingStartDate: ['', Validators.required],
      NumberOfEmployee: ['', Validators.required],
      ServicesRequired: ['', Validators.required],
      SpecialRequirmentOrNotes: ['', Validators.required],
      CompanyAddress: [''],
      IsActive: [true],
      IsDeleted: [false],
    });
    const today = new Date();
   
    this.onboardingStartDatePicker = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };
   // this.common.generateRandomCode(6)
    // this.registrationForm.controls['EmployeeCode'].setValue(
    //   'EMP-01'
    // );
  }
  get basicFormControl() {
    return this.registrationForm.controls;
  }
  changeCurdView(bitVal: boolean) {
    this.curdBtnIsList = bitVal;
    this.isEdit = false;
  }
  onPageChange(event: any) {
    this.pagination.pageNo = event;
    this.getonboardings();
  }
  onSearchText() {
    this.pagination.pageNo = 1;
    this.pagination.pageSize = 10;
    this.getonboardings();
  }
  ngOnInit(): void {
    this.onboardingId = this.route.snapshot.queryParamMap.get('id');
    if (this.onboardingId != null && this.onboardingId != '') {
      this.isEdit = true;
     // this.getEmployeeById(this.employeeId);
    }else{
      this.isEdit=false;
    }
   // if(!this.isEdit)
    // this.getEmployeeCode();
    //  this.getGenderByLovCode();
    //  this.getgroups();
   
    //this.getdepartments();
   // this.getfunctions();
    // this.getlevels();
    //  this.getEmployeeDesignationByLovCode();
    //  this.getMaritalStatusByLovCode();
    //  this.getEmployeeTypeByLovCode();
    //  this.getEmploymentTypeByLovCode();
    //  this.getjobDescriptions();
  }
  getonboardings() {

    this.onboardingService.getOnboardings('','','').subscribe({
      next: result => {
        
        this.onboardingList=[];
        this.onboardingList = result.data;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getOnboardingById(onboardingId: string) {
    this.onboardingService.getOnboardingById(onboardingId).subscribe({
      next: (result) => {
        this.onboardingDetails = result.data;
        this.setRegistrationValuesForupdate(this.onboardingDetails);
      },
      error: (err: any) => {
        this.toast.error(err?.error?.message);
      },
    });
  }
  setRegistrationValuesForupdate(item: any) {
    this.registrationForm.controls['OnboardingId'].setValue(item.onboardingId);
  
    this.registrationForm.controls['CompanyName'].setValue(item.companyName);
    this.registrationForm.controls['ContactPersonName'].setValue(item.contactPersonName);
    this.registrationForm.controls['ContactEmailAddress'].setValue(item.contactEmailAddress);
    this.registrationForm.controls['ContactPhoneNumber'].setValue(item.ContactPhoneNumber);  
      

    this.registrationForm.controls['ClientType'].setValue(item.clientType);
    this.registrationForm.controls['CompanyAddress'].setValue(item.companyAddress);
    this.registrationForm.controls['NumberOfEmployees'].setValue(item.numberOfEmployees);
    this.registrationForm.controls['ServicesRequired'].setValue(item.servicesRequired);
    this.registrationForm.controls['OnboardingStartDate'].setValue(item.onboardingStartDate);
    
    this.registrationForm.controls['SpeccialRequirementsOrNotes'].setValue(item.speccialRequirementsOrNotes);
  

    
 
    this.registrationForm.controls['IsActive'].setValue(item.isActive);
    
  }
  IsActive(row: any) {
    this.onboardingService.active(row.onboardingId).subscribe({
      next: result => {
        if (result.status) {
          this.getonboardings();
          this.toast.success("Record Active OR InActive SuccessFully");
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  
  deleteRow(row: any) {
    // Swal.fire({
    //   icon: 'warning',
    //   title: 'Are you sure ?',
    //   text: 'You will not be able to recover this imaginary file!',
    //   showCancelButton: true,
    //   confirmButtonColor: '#6259ca',
    //   cancelButtonColor: '#6259ca',
    //   confirmButtonText: 'Yes, delete it!',
    //   reverseButtons: true,
    // }).then((result: any) => {
    //   if (result.isConfirmed) {
    //     this.onboardingService.delete(row.onboardingId).subscribe({
    //       next: result => {
    //         if (result.status) {
    //           this.getonboardings();
    //           this.toast.success("Record Deleted SuccessFully")
    //         }
    //       },
    //       error: (err: any) => { this.toast.error(err.message) },
    //     });
    //     Swal.fire({
    //       title: 'Deleted!',
    //       text: 'Your class has been deleted.',
    //       icon: 'success',
    //       confirmButtonColor: '#6259ca',
    //     });
    //   }
    // });
  }

  onRemove() {
    this.url = null;
    this.registrationForm.controls['Base64'].setValue('');
  }
 
  formatBytes(bytes: number): string {
    const UNITS = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const factor = 1024;
    let index = 0;
    while (bytes >= factor) {
      bytes /= factor;
      index++;
    }
    return `${parseFloat(bytes.toFixed(2))} ${UNITS[index]}`;
  }
  openScrollableContent(ScroleContent: any) {
    this.modalService.open(ScroleContent);
  }
  formSubmit() {
    this.submitted = true;
    debugger;
    if (!this.registrationForm.valid) {
      this.toast.error('Please complete all required fields before proceeding.');
      return;
    }
    
    // if(this.RenewPicker!=null || this.RenewPicker!=undefined){
    //   let RenewPicker = this.RenewPicker.year + '-' + this.RenewPicker.month + '-' + this.RenewPicker.day;
    //   this.registrationForm.value['RenewDate'] = RenewPicker;
    // }
    let OnboardingStartDate =
      this.onboardingStartDatePicker.year +
      '-' +
      this.onboardingStartDatePicker.month +
      '-' +
      this.onboardingStartDatePicker.day;
    

    this.registrationForm.value['DateOfJoining'] = OnboardingStartDate;
    if (
      this.registrationForm.controls['IsPicturePermission'].value &&
      this.registrationForm.controls['Base64'].value == '' &&
      this.registrationForm.controls['Picture'].value == ''
    ) {
      this.toast.warning('Please select profile image');
      return;
    }
    this.working = true;

    this.onboardingService.save(this.registrationForm.value).subscribe({
      next: (result: any) => {
        if (result) {
          this.onboardingId = result.data;
          this.toast.success("Your details have been saved.");
          this.stepper.next();
        } else this.toast.error('Somethings went wrong...');
        this.working = false;
      },
      error: (err: any) => {
        this.toast.error(err?.error?.message);
        this.working = false;
      },
    });
  }

  
}
