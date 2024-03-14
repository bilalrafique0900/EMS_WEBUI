import { DatePipe } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { LovService } from 'src/app/domain/services/Lov.service';
import { AreaService } from 'src/app/domain/services/area.service';
import { ClassSectionService } from 'src/app/domain/services/classsection.service';
import { StudentService } from 'src/app/domain/services/student.service';
import { ZoneService } from 'src/app/domain/services/zone.service';
import { FilePathEnum } from 'src/app/shared/Enum/documentTableName-enum';
import { LovCode } from 'src/app/shared/Enum/lov-enum';
import { AuthService } from 'src/app/shared/security/auth-service.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ConfigService } from 'src/app/shared/services/config.service';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';
declare var require: any;
const Swal = require('sweetalert2');
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  providers: [DatePipe]
})
export class RegistrationComponent {
  studentId: any;
  url: string | ArrayBuffer | null | undefined;
  urlAttachment!: string | ArrayBuffer | null;
  @ViewChild('stepper') stepper!: MatStepper;
  attachmentFileName: string = 'Please select Medical report Attachment';
  registrationForm!: FormGroup;
  parentRegistrationForm!: FormGroup;
  submitted = false;
  dateofbirthPicker: { day?: number; month: number; year: number };
  dateOfJoiningPicker: { day?: number; month: number; year: number };
  RenewPicker: { day?: number; month: number; year: number };
  attachmentList: any[] = [];
  levelList: any[] = [];
  studenStatusList: any[] = [];
  genderList: any[] = [];
  schoolSystemList: any[] = [];
  classList: any[] = [];
  studentList: any[] = [];
  studentDetails: any;
  paymentTypes: any[] = [];
  paymentTypesSelected: any[] = [];
  paymentType: any;
  totalAmount = 0;
  noOfInstallments: any;
  installments: any[] = [];
  baseUrl: any = this.configService.baseApiUrl;
  FilePath: any = FilePathEnum;
  yearArray: any[] = [];
  zones: any[] = [];
  areas: any[] = [];
  working: boolean = false;
  FilterBranchId: string = '';
  classSectionList: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private toast: ToastrService,
    private http: HttpRequestService,
    private LovServ: LovService,
    private modalService: NgbModal,
    private StudentService: StudentService,
    private zoneService: ZoneService,
    config: NgbModalConfig,
    private common: CommonService,
    private datePipe: DatePipe,
    private authService: AuthService,
    private areaService: AreaService,
    private readonly classSectionService: ClassSectionService,
    private configService: ConfigService
  ) {
    this.registrationForm = this.fb.group({
      StudentId: uuidv4(),
      BranchId: ['', Validators.required],
      HCode: ['', Validators.required],
      FirstName: ['', Validators.required],
      MiddleName: ['', Validators.required],
      LastName: ['', Validators.required],
      FullName: [''],
      StudentEmail: ['', [Validators.compose([ Validators.pattern(/^(\d{10}|\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3}))$/)])]],//Validators.required,
      Nationality: ['', Validators.required],
      PlaceOfBirth: ['', Validators.required],
      DateOfBirth: ['', Validators.required],
      PassportNo: ['', Validators.required],
      IDNo: ['', Validators.required],
      MotherTongue: ['', Validators.required],
      DateOfJoining: ['', Validators.required],
      StudentPhoneNo: ['', ],//Validators.required
      GenderId: ['', Validators.required],
      Religion: ['', Validators.required],
      LevelId: ['', Validators.required],
      statusId: ['', Validators.required],
      classId: ['', Validators.required],
      sectionId: ['', Validators.required],
      ForSchoolSystemId: ['', Validators.required],
      AcadmicYear: ['', Validators.required],
      IsBusServices: [false],
      IsLunchServices: [false],
      IsUniform: [false],
      IsBooks: [false],
      IsForeign: [true],
      AllergyType: ['', ],//Validators.required
      WhereHearAboutSchool: [''],
      IsPicturePermission: [true],
      Picture: [''],
      Base64: [''],
      ImagePath: [FilePathEnum.ProfilePictures],
      StreetName: ['', ],//Validators.required
      HouseNo: ['', ],//Validators.required
      AreaId: ['', Validators.required],
      zoneId: ['', Validators.required],
      Address: ['', ],//Validators.required
      Group: [''],
      Grade: [''],
      year: [''],
      IsActive: [true],
      IsDeleted: [false],
    });
    // this.parentRegistrationForm = this.fb.group({
    //   ParentId: uuidv4(),
    //   StudentId: ['', Validators.required],
    //   FatherName: ['', Validators.required],
    //   FatherContactNo: ['', Validators.required],
    //   FatherOccupation: ['', Validators.required],
    //   FatherEmail: ['', [Validators.compose([Validators.required, Validators.pattern(/^(\d{10}|\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3}))$/)])]],
    //   FatherCompany: ['', Validators.required],
    //   MotherName: ['', Validators.required],
    //   MotherContactNo: ['', Validators.required],
    //   MotherOccupation: ['', Validators.required],
    //   MotherEmail: ['', [Validators.compose([Validators.pattern(/^(\d{10}|\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3}))$/)])]],
    //   MotherCompany: ['', Validators.required],
    //   AlternativeName: ['', Validators.required],
    //   AlternativeRelation: ['', Validators.required],
    //   AlternativeContact: ['', Validators.required],
    //   AlternativeNameSecond: ['', Validators.required],
    //   AlternativeRelationSecond: ['', Validators.required],
    //   AlternativeContactNoSecond: ['', Validators.required],

    // });
    const today = new Date();
    this.dateofbirthPicker = { day: 1, month: 1, year: 2000, };
    this.RenewPicker = { day: today.getDate(), month: today.getMonth() + 1, year: new Date().getFullYear(), };
    this.dateOfJoiningPicker = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };
    this.registrationForm.controls['HCode'].setValue(
      this.common.generateRandomCode(6)
    );
    config.backdrop = 'static';
    config.keyboard = false;
    
    this.FilterBranchId = this.authService.getBranchIdFromLoginUser();
  }

  ngOnInit(): void {

    this.studentId = this.route.snapshot.queryParamMap.get('id');
    if (this.studentId != null && this.studentId != "") {
      this.getStudentById(this.studentId);
    }
    this.getLevelByLovCode();
    this.getGenderByLovCode();
    this.getSchoolSystemByLovCode();
    this.getClassses();
    this.makeAcadmicYrar();
    this.getStudenStatusByLovCode();
    this.getZones();
  }
  makeAcadmicYrar() {
    const startYear: number = 1999;
    const endYear: number = 2023;

    for (let year = startYear; year <= endYear; year++) {
      const yearString = year + '-' + (year + 1);
      this.yearArray.push(yearString);
    }

  }
  getStudentById(studentId: string) {
    this.StudentService.getStudentById(studentId).subscribe({
      next: result => {
        this.studentDetails = result.data[0];
        this.SetRegistrationValuesForupdate(this.studentDetails);
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getZones() {
    this.zoneService.getall(this.FilterBranchId).subscribe({
      next: result => {
        this.zones = [];
        this.zones = this.common.sortByProperty(result.data ,"zoneName");
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getAreaByZone() {
    const zoneId = this.registrationForm.controls['zoneId'].value;
    this.areaService.getAreaByZoneId(zoneId, this.FilterBranchId).subscribe({
      next: result => {
        this.areas = [];
        this.areas = this.common.sortByProperty(result.data ,"areaName");
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  SetRegistrationValuesForupdate(item: any) {
    //Stydent Formdata set 
    this.registrationForm.controls['BranchId'].setValue(item.branchId);
    this.registrationForm.controls['StudentId'].setValue(item.studentId);
    if (!item.hCode) {
      this.registrationForm.controls['HCode'].setValue(
        this.common.generateRandomCode(6)
      );
    } else {
      this.registrationForm.controls['HCode'].setValue(item.hCode);
    }
    this.registrationForm.controls['FirstName'].setValue(item.firstName);
    this.registrationForm.controls['MiddleName'].setValue(item.middleName);
    this.registrationForm.controls['LastName'].setValue(item.lastName);
    this.registrationForm.controls['FullName'].setValue(item.fullName);
    this.registrationForm.controls['StudentEmail'].setValue(item.studentEmail);
    this.registrationForm.controls['Nationality'].setValue(item.nationality);
    this.registrationForm.controls['PlaceOfBirth'].setValue(item.placeOfBirth);
    let FormateDOB = this.datePipe.transform(item?.dateOfBirth, "yyyy-MM-dd");
    let splitDOB: any = FormateDOB?.split('-');
   if (Array.isArray(splitDOB)) {
      this.dateofbirthPicker = {
        day: Number(splitDOB[2]),
        month: Number(splitDOB[1]),
        year: Number(splitDOB[0]),
      };
    }
    let FormateDOBJoing = this.datePipe.transform(item.dateOfJoining, "yyyy-MM-dd");
    let splitDOBJoining: any = FormateDOBJoing?.split('-');
    if (Array.isArray(splitDOBJoining)) {
      this.dateOfJoiningPicker = {
        day: Number(splitDOBJoining[2]),
        month: Number(splitDOBJoining[1]),
        year: Number(splitDOBJoining[0]),
      };
    }
    
    // let RenewDate = this.datePipe.transform(item.renewDate, "yyyy-MM-dd");
    // let splitRenewDate: any = RenewDate?.split('-');
    // if (Array.isArray(splitRenewDate)) {
    //   this.RenewPicker = {
    //     day: Number(splitRenewDate[2]),
    //     month: Number(splitRenewDate[1]),
    //     year: Number(splitRenewDate[0]),
    //   };
    // }
    // if(item.renewDate==null)
    // this.registrationForm.controls['RenewDate'].setValue(item.renewDate);
    this.registrationForm.controls['PassportNo'].setValue(item.passportNo);
    this.registrationForm.controls['IDNo'].setValue(item.idNo);
    this.registrationForm.controls['MotherTongue'].setValue(item.motherTongue);
    this.registrationForm.controls['StudentPhoneNo'].setValue(item.studentPhoneNo);
    this.registrationForm.controls['GenderId'].setValue(item.genderId);
    this.registrationForm.controls['Religion'].setValue(item.religion);
    this.registrationForm.controls['LevelId'].setValue(item.levelId);
    this.registrationForm.controls['statusId'].setValue(item.statusId);
    this.registrationForm.controls['classId'].setValue(item.classId);
    this.getSectionByClassId();
    this.registrationForm.controls['sectionId'].setValue(item.sectionId);
    this.registrationForm.controls['ForSchoolSystemId'].setValue(item.forSchoolSystemId);
    this.registrationForm.controls['IsBusServices'].setValue(item.isBusServices);
    this.registrationForm.controls['IsLunchServices'].setValue(item.isLunchServices);
    // this.registrationForm.controls['IsForeign'].setValue(item.isForeign);
    this.registrationForm.controls['IsUniform'].setValue(item.isUniform);
    this.registrationForm.controls['IsBooks'].setValue(item.isBooks);
    this.registrationForm.controls['AllergyType'].setValue(item.allergyType);
    this.registrationForm.controls['WhereHearAboutSchool'].setValue(item.whereHearAboutSchool);
    this.registrationForm.controls['IsPicturePermission'].setValue(item.isPicturePermission);
    this.registrationForm.controls['Picture'].setValue(item.picture);
    this.registrationForm.controls['StreetName'].setValue(item.streetName);
    this.registrationForm.controls['HouseNo'].setValue(item.houseNo);
    this.registrationForm.controls['Address'].setValue(item.address);
    this.registrationForm.controls['IsActive'].setValue(item.isActive);
    this.registrationForm.controls['IsDeleted'].setValue(item.isDeleted);
    this.registrationForm.controls['Group'].setValue(item.group);
    this.registrationForm.controls['Grade'].setValue(item.grade);
    this.registrationForm.controls['year'].setValue(item.year);
    this.registrationForm.controls['zoneId'].setValue(item.zoneId);
    this.getAreaByZone();
    this.registrationForm.controls['AreaId'].setValue(item.areaId);
    this.registrationForm.controls['AcadmicYear'].setValue(item.acadmicYear);
    this.registrationForm.controls['BranchId'].setValue(item.branchId);
    if (item.picture)
      this.url = this.baseUrl + this.FilePath.ProfilePictures + "/" + item.picture;
  }
  getLevelByLovCode(): void {
    this.LovServ.getLevelByCode(LovCode.LEVEL).subscribe({
      next: (result) => {
        this.levelList = result.data;
      },
      error: (err: any) => {
        this.toast.error(err.message);
      },
    });
  }

  getStudenStatusByLovCode(): void {
    this.LovServ.getLevelByCode(LovCode.STUDENT_STATUS).subscribe({
      next: (result) => {
        this.studenStatusList = result.data;
      },
      error: (err: any) => {
        this.toast.error(err.message);
      },
    });
  }

  getGenderByLovCode(): void {
    this.LovServ.getLevelByCode(LovCode.GENDER).subscribe({
      next: (result) => {
        this.genderList = result.data;
      },
      error: (err: any) => {
        this.toast.error(err.message);
      },
    });
  }
  getSchoolSystemByLovCode(): void {
    this.LovServ.getLevelByCode(LovCode.SCHOOLSYSTEM).subscribe({
      next: (result) => {
        this.schoolSystemList = result.data;
      },
      error: (err: any) => {
        this.toast.error(err.message);
      },
    });
  }
  getClassses() {
    this.http.get('master-data/classes/get').subscribe({
      next: result => {
        this.classList = this.common.sortByProperty(result.data,'name');
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getSectionByClassId() {
    let classId = this.registrationForm.controls['classId'].value;
    this.classSectionService.classsectionByClass(classId).subscribe({
      next: result => {

        this.classSectionList = result.data;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getStudents() {
    this.http.get('student').subscribe({
      next: result => {
        this.studentList = result.data;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  get basicFormControl() {
    return this.registrationForm.controls;
  }

  onRemove() {
    this.url = null;
    this.registrationForm.controls['Base64'].setValue('');
  }
  onRemoveAttachment() {
    this.attachmentFileName = 'Please select Medical report Attachment';
  }
  onSelectFile(event: any) {
    if (event.addedFiles && event.addedFiles[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.addedFiles[0]); // read file as data url

      reader.onload = (event) => {
        // called once readAsDataURL is completed
        if (event.target) {
          this.url = event.target.result;
          this.registrationForm.controls['Base64'].setValue(this.url);
        }
        // this.p.setValue(this.url);
      };
    }
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
  private removeRequireValidation(controlName: string) {
    this.registrationForm.controls[controlName].setValidators(null);
    this.registrationForm.controls[controlName].setErrors(null);
    this.registrationForm.controls[controlName].updateValueAndValidity();
  }
  formSubmit() {
    this.submitted = true;
    this.registrationForm.controls['BranchId'].setValue(this.FilterBranchId);
    if (this.registrationForm.controls['PassportNo'].value) {
      this.removeRequireValidation('IDNo');
    }
    if (this.registrationForm.controls['IDNo'].value) {
      this.removeRequireValidation('PassportNo');
    }
    if (!this.registrationForm.valid) {
      this.toast.error("Some fields are required.")
      return;
    };
    let DateOfBirth = this.dateofbirthPicker.year + '-' + this.dateofbirthPicker.month + '-' + this.dateofbirthPicker.day;
    // if(this.RenewPicker!=null || this.RenewPicker!=undefined){
    //   let RenewPicker = this.RenewPicker.year + '-' + this.RenewPicker.month + '-' + this.RenewPicker.day;
    //   this.registrationForm.value['RenewDate'] = RenewPicker;
    // }
    let DateOfJoining = this.dateOfJoiningPicker.year + '-' + this.dateOfJoiningPicker.month + '-' + this.dateOfJoiningPicker.day;
    this.registrationForm.value['DateOfBirth'] = DateOfBirth;

    this.registrationForm.value['DateOfJoining'] = DateOfJoining;
    if (this.registrationForm.controls['IsPicturePermission'].value && (this.registrationForm.controls['Base64'].value == '' && this.registrationForm.controls['Picture'].value == '')) {
      this.toast.warning("Please select profile image"); return;
    }
    this.registrationForm.value['FullName'] = this.registrationForm.controls['FirstName'].value + ' ' + this.registrationForm.controls['MiddleName'].value + ' ' + this.registrationForm.controls['LastName'].value;
    this.working = true;
    this.http.post('student', this.registrationForm.value).subscribe({
      next: result => {
        if (result) {
          this.studentId = result.data;
          this.toast.success('Student Information Save');
          this.stepper.next();
        }
        else
          this.toast.error("Somethings went wrong...");
        this.working = false;
      },
      error: (err: any) => {
        this.toast.error(err.message);
        this.working = false;
      },
    });
  }

  onChangeLevel() {
    let levelLov = this.levelList.filter(x => x.id == this.registrationForm.controls['LevelId'].value)[0];
    if (levelLov.code == "PRIMARY") {
      let schoolSystemId = this.schoolSystemList.filter(x => x.code == 'BRITISH')[0].id;
      this.registrationForm.controls["ForSchoolSystemId"].setValue(schoolSystemId);
      this.registrationForm.controls["StudentEmail"].clearValidators();
    }
    else {
      this.registrationForm.controls["StudentEmail"].setValidators([Validators.required]);
      this.registrationForm.controls["ForSchoolSystemId"].setValue('');
    }
    this.registrationForm.controls['StudentEmail'].updateValueAndValidity();
  }
}