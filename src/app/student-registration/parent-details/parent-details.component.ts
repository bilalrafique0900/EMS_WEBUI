import { DatePipe } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { LovService } from 'src/app/domain/services/Lov.service';
import { AreaService } from 'src/app/domain/services/area.service';
import { StudentService } from 'src/app/domain/services/student.service';
import { ZoneService } from 'src/app/domain/services/zone.service';
import { AuthService } from 'src/app/shared/security/auth-service.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { v4 as uuidv4 } from 'uuid';
@Component({
  selector: 'app-parent-details',
  templateUrl: './parent-details.component.html',
  styleUrls: ['./parent-details.component.scss']
})
export class ParentDetailsComponent {
  @Input() studentId:any = '';
  parentRegistrationForm: FormGroup;
  submitted = false;
  @ViewChild('stepper') stepper!: MatStepper;
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private toast: ToastrService,
    private http: HttpRequestService,
    private LovServ: LovService,
    private modalService: NgbModal,
    private studentService: StudentService,
    private zoneService : ZoneService,
    config: NgbModalConfig,
    private common: CommonService,
    private datePipe: DatePipe,
    private router: Router,
    private authService: AuthService,
    private areaService:AreaService
  ) {
    this.parentRegistrationForm = this.fb.group({
      ParentId: uuidv4(),
      StudentId: ['', Validators.required],
      FatherName: ['', Validators.required],
      FatherContactNo: ['', Validators.required],
      SecondFatherContactNo:[''],
      FatherOccupation: ['', Validators.required],
      FatherEmail: ['', [Validators.compose([Validators.required, Validators.pattern(/^(\d{10}|\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3}))$/)])]],
      FatherCompany: ['', Validators.required],
      MotherName: ['', Validators.required],
      MotherContactNo: ['', Validators.required],
      MotherOccupation: [''],
      MotherEmail: ['', [Validators.compose([Validators.pattern(/^(\d{10}|\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3}))$/)])]],
      MotherCompany: ['', ],//Validators.required
      AlternativeName: ['', Validators.required],
      AlternativeRelation: ['', Validators.required],
      AlternativeContact: ['', Validators.required],
      AlternativeNameSecond: ['', Validators.required],
      AlternativeRelationSecond: ['', Validators.required],
      AlternativeContactNoSecond: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    if(this.studentId != "" && this.studentId != null){
      this.getStudentParentInfo();
    }
  }
  getStudentParentInfo() {
    this.studentService.getStudentParentInfoByStudentId(this.studentId).subscribe({
      next: result => {
        let parentDetail = result.data;
        
        if(parentDetail)
        this.patchParentInfo(parentDetail);
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  patchParentInfo(item:any){;
//Parent Formdata set
this.parentRegistrationForm.controls['ParentId'].setValue(item.parentId);
this.parentRegistrationForm.controls['StudentId'].setValue(item.studentId);
this.parentRegistrationForm.controls['FatherName'].setValue(item.fatherName);
this.parentRegistrationForm.controls['FatherContactNo'].setValue(item.fatherContactNo);
this.parentRegistrationForm.controls['SecondFatherContactNo'].setValue(item.secondFatherContactNo);
this.parentRegistrationForm.controls['FatherOccupation'].setValue(item.fatherOccupation);
this.parentRegistrationForm.controls['FatherEmail'].setValue(item.fatherEmail);
this.parentRegistrationForm.controls['FatherCompany'].setValue(item.fatherCompany);
this.parentRegistrationForm.controls['MotherName'].setValue(item.motherName);
this.parentRegistrationForm.controls['MotherContactNo'].setValue(item.motherContactNo);
this.parentRegistrationForm.controls['MotherOccupation'].setValue(item.motherOccupation);
this.parentRegistrationForm.controls['MotherEmail'].setValue(item.motherEmail);
this.parentRegistrationForm.controls['MotherCompany'].setValue(item.motherCompany);
this.parentRegistrationForm.controls['AlternativeName'].setValue(item.alternativeName);
this.parentRegistrationForm.controls['AlternativeRelation'].setValue(item.alternativeRelation);
this.parentRegistrationForm.controls['AlternativeContact'].setValue(item.alternativeContact);
this.parentRegistrationForm.controls['AlternativeNameSecond'].setValue(item.alternativeNameSecond);
this.parentRegistrationForm.controls['AlternativeRelationSecond'].setValue(item.alternativeRelationSecond);
this.parentRegistrationForm.controls['AlternativeContactNoSecond'].setValue(item.alternativeContactNoSecond);
  }
  ParentFormSubmit() {
    if(this.studentId == "" || this.studentId == null){
      this.toast.error("Please Edit student first"); return;
    }
    this.parentRegistrationForm.controls['StudentId'].setValue(this.studentId);
    this.submitted = true;
    if (!this.parentRegistrationForm.valid) return;
    this.http.post('student/parent-info', this.parentRegistrationForm.value).subscribe({
      next: result => {
        if (result) {
          this.toast.success(result.message);
          this.stepper.next();
          return;
        }
        else
          this.toast.error("Somethings went wrong...")
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  get basicFormControlParent() {
    return this.parentRegistrationForm.controls;
  }
}
