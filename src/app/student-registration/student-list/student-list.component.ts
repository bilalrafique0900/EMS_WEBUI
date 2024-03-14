import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { el } from 'date-fns/locale';
import { ToastrService } from 'ngx-toastr';
import { LovService } from 'src/app/domain/services/Lov.service';
import { ClassSectionService } from 'src/app/domain/services/classsection.service';
import { DocumentService } from 'src/app/domain/services/document.service';
import { StudentService } from 'src/app/domain/services/student.service';
import { DocumentTableNameEnum, FilePathEnum } from 'src/app/shared/Enum/documentTableName-enum';
import { LovCode } from 'src/app/shared/Enum/lov-enum';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { DocumentModel } from 'src/app/shared/models/document.Model';
import { AuthService } from 'src/app/shared/security/auth-service.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ConfigService } from 'src/app/shared/services/config.service';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';
import {MatTabChangeEvent, MatTabsModule} from '@angular/material/tabs';
declare var require: any;
const Swal = require('sweetalert2');
@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent {
  tempStudentId: string = '';
  studentList: any[] = [];
  attachmentList: any[] = [];
  getAttachment: any[] = [];
  baseUrl: any = this.configService.baseApiUrl;
  FilePath: any = FilePathEnum;
  pagination: any = paginationEnum;
  studenStatusList: any[] = [];
  model: DocumentModel = new DocumentModel();
  widthDrawForm!: FormGroup;
  reRegistrationForm: FormGroup;
  submitted = false;
  withdrawicker: { day?: number; month: number; year: number };
  reNewDatePicker: { day?: number; month: number; year: number };
  studentHCode: string = '';
  sibblingStudents: any[] = [];
  classList: any[] = [];
  classSectionList: any[] = [];
  branchId: string = '';
  yearArray:any[] = [];
  studenttype:any='';
  studentfilterIsSubmitted:boolean=false;
  constructor(
    private modalService: NgbModal,
    config: NgbModalConfig,
    private toast: ToastrService,
    private http: HttpRequestService,
    private LovServ: LovService,
    private documentService: DocumentService,
    private studentService: StudentService,
    private fb: FormBuilder,
    private configService: ConfigService,
    private authService: AuthService,
    private common: CommonService,
    private readonly classSectionService: ClassSectionService,
  ) {
    this.widthDrawForm = this.fb.group({
      studentStatusHistoryId: uuidv4(),
      studentId: ['', Validators.required],
      statusId: ['', Validators.required],
      reasonForGoing: ['', Validators.required],
      whichSchoolGoing: ['', Validators.required],
      withdrawnDate: ['', Validators.required]
    });
    this.reRegistrationForm = this.fb.group({
      ReRegisgtrationHistoryId: uuidv4(),
      studentId: ['', Validators.required],
      statusId: ['', Validators.required],
      ReNewDate: ['', Validators.required],
      classId: ['', Validators.required],
      sectionId: ['', Validators.required],
      AcadmicYear: ['', Validators.required]
    });
    this.branchId = this.authService.getBranchIdFromLoginUser();
    const today = new Date();
    this.withdrawicker = { day: today.getDate(), month: today.getMonth() + 1, year: new Date().getFullYear(), };
    this.reNewDatePicker = { day: today.getDate(), month: today.getMonth() + 1, year: new Date().getFullYear(), };
    config.backdrop = 'static';
    config.keyboard = false;
    this.getStudents();
    this.getStuddentAttachmentByLovCode();

  }
  get basicFormControl() {
    return this.widthDrawForm.controls;
  }
  get basicFormControlRegistration() {
    return this.reRegistrationForm.controls;
  }
  getDDLForReRegistration(){
    this.getStudenStatusByLovCode();
    this.getClassses();
    this.makeAcadmicYrar();
  }
  openScrollableContent(ScroleContent: any) {
    this.modalService.open(ScroleContent, { size: 'lg' });
  }
  openScrollableContentMd(ScroleContent: any, studentId: string) {
    this.modalService.open(ScroleContent);
    this.tempStudentId = studentId;
  }
  makeAcadmicYrar() {
    const startYear: number = 1999;
    const endYear: number = 2023;

    for (let year = startYear; year <= endYear; year++) {
      const yearString = year + '-' + (year + 1);
      this.yearArray.push(yearString);
    }

  }
  deleteDocument(documentId : string){
    this.documentService.deleteDocument(documentId).subscribe({
      next: (result) => {
        this.toast.success("Deleted SuccessFully");
        this.getUploadDocument();
      },
      error: (err: any) => {
        this.toast.error(err.message);
      },
    });
  }
  getStudents() {
    this.http.get(`student?pageNo=${this.pagination.pageNo}&pageSize=${this.pagination.pageSize}&status=${this.studenttype}&isSubmited=${this.studentfilterIsSubmitted}&searchText=${this.pagination.searchText}`).subscribe({
      next: result => {

        this.studentList = result.data;
        this.pagination.totalCount = result.data[0]?.totalRecords || 0;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  showStudentDetailsInDialouge(studentId: string) {
    this.tempStudentId = studentId;
  }
  showStudentContractDialouge(studentId: string) {
    this.tempStudentId = studentId;
  }
  getSectionByClassId() {
    let classId = this.reRegistrationForm.controls['classId'].value;
    this.classSectionService.classsectionByClass(classId).subscribe({
      next: result => {

        this.classSectionList = result.data;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  onSelectAttachment(event: any, LovId: string) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      const file = event.target.files[0];
      let ext = event.target.files[0].name.split('.').pop();
      if (ext !== 'pdf') {
        this.toast.warning('Please select PDF formate file');
        event.target.value = ''
        return;
      }
      let FileName = file.name.split('.').slice(0, -1).join('.');
      let Filesize = this.formatBytes(file.size)
      reader.onload = (event) => {
        // called once readAsDataURL is completed
        if (event.target) {
          let url = event.target.result;
          this.model.DocumentId = uuidv4();
          this.model.Base64Url = url;
          this.model.DocumentName = FileName;
          this.model.DocumentExtention = ext;
          this.model.DocumentSize = Filesize;
          this.model.LovId = LovId;
          this.model.Table = DocumentTableNameEnum.Student;
          this.model.DocumentPath = FilePathEnum.StudentDocuments;
          this.model.TableRefrenceId = this.tempStudentId;
        }
        this.uploadStudentDocument(this.model);
      };
    }
  }
  onSearchText() {
    this.pagination.pageNo = 1;
    this.pagination.pageSize = 10;
    this.getStudents();
  }
  onPageChange(event: any) {
    this.pagination.pageNo = event;
    this.getStudents();
    // You can perform any necessary actions with the selected page number here
  }
  IsActive(row: any) {
    this.studentService.active(row.studentId).subscribe({
      next: result => {
        if (result.status) {
          this.getStudents();
          this.toast.success("Record Active OR InActive SuccessFully");
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }

  uploadStudentDocument(DocumentModel: DocumentModel): void {
    this.documentService.studentUploadDocument(DocumentModel).subscribe({
      next: (result) => {
        this.toast.success(result.message);
      },
      error: (err: any) => {
        this.toast.error(err.message);
      },
    });
  }
  getUploadDocument(): void {
    this.documentService.getEmployeeDocument(DocumentTableNameEnum.Student, this.tempStudentId).subscribe({
      next: (result) => {
        this.getAttachment = result.data;
      },
      error: (err: any) => {
        this.toast.error(err.message);
      },
    });
  }
  getStuddentAttachmentByLovCode(): void {

    this.LovServ.getStuddentAttachmentByLovCode(LovCode.STUDENTFILES).subscribe({
      next: (result) => {
        this.attachmentList = result.data;
      },
      error: (err: any) => {
        this.toast.error(err.message);
      },
    });
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
        this.studentService.delete(row.studentId).subscribe({
          next: result => {
            if (result.status) {
              this.getStudents();
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
  submitStudent(row: any) {
    
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure to submit this student ?',
      input: 'textarea',  // Add an input field for user's comment
      inputPlaceholder: 'Enter your comment here...',
      showCancelButton: true,
      confirmButtonColor: '#6259ca',
      cancelButtonColor: '#6259ca',
      confirmButtonText: 'Yes, submit it!',
      reverseButtons: true,
    }).then((result: any) => {
      if (result.isConfirmed) {
        const userComment = result.value || '';  // Get user's comment or use an empty string
  
        this.studentService.submit(row.studentId, this.branchId,userComment).subscribe({
          next: result => {
            if (result.data) {
              this.getStudents();
              this.toast.success(result.message);
              Swal.fire({
                title: 'Submitted!',
                text: 'Student has been submitted.',
                icon: 'success',
                confirmButtonColor: '#6259ca',
              });
            } else {
              this.toast.error("Please Attach all documents first");
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
      }
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
  submitReRegistration() {
    this.submitted = true;
    this.reRegistrationForm.controls['studentId'].setValue(this.tempStudentId);
    if (!this.reRegistrationForm.valid) {
      this.toast.error("Some fields are required.")
      return;
    };
    let reNewDatePicker = this.reNewDatePicker.year + '-' + this.reNewDatePicker.month + '-' + this.reNewDatePicker.day;
    this.reRegistrationForm.value['ReNewDate'] = new Date(reNewDatePicker);
    this.studentService.reRegistrationStudent(this.reRegistrationForm.value).subscribe({
      next: result => {
        if (result.status) {
          this.reRegistrationForm.reset();
          this.reRegistrationForm.controls['ReRegisgtrationHistoryId'].setValue(uuidv4());
          this.modalService.dismissAll();
          this.getStudents();
          this.toast.success("SuccessFully");
        }
        else
          this.toast.error("Somethings went wrong...");
      },
      error: (err: any) => {
        this.toast.error(err.message);
      },
    });
  }
  formSubmit() {
    this.submitted = true;
    this.widthDrawForm.controls['studentId'].setValue(this.tempStudentId);
    if (!this.widthDrawForm.valid) {
      this.toast.error("Some fields are required.")
      return;
    };
    let withdrawicker = this.withdrawicker.year + '-' + this.withdrawicker.month + '-' + this.withdrawicker.day;
    this.widthDrawForm.value['withdrawnDate'] = new Date(withdrawicker);
    this.studentService.saveStudentWidthDraw(this.widthDrawForm.value).subscribe({
      next: result => {
        if (result.status) {
          this.widthDrawForm.reset();
          this.widthDrawForm.controls['studentStatusHistoryId'].setValue(uuidv4());
          this.getStudents();
          this.modalService.dismissAll();
          this.toast.success("SuccessFully");
        }
        else
          this.toast.error("Somethings went wrong...");
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
  getStudentByHCode(): void {
    this.studentService.getStudentByHCode(this.studentHCode).subscribe({
      next: (result) => {
        if (result.data) {
          const index = this.sibblingStudents.findIndex(x => x.studentId == result.data.studentId);
          if (index == -1)
            this.sibblingStudents.push(result.data)
          else {
            this.toast.warning("Already Added in Sibbling");
          }
        } else {
          this.toast.error("Please Enter Correct H Code");
        }
        this.studentHCode='';
      },
      error: (err: any) => {
        this.toast.error(err.message);
      },
    });
  }
  deleteSibbling(studentId: string) {
    const index = this.sibblingStudents.findIndex(x => x.studentId == studentId);
    if (index !== -1)
      this.sibblingStudents.splice(index, 1);
  }
  saveSibblingStudent() {
    let postData = {
      studentId: this.tempStudentId,
      sibblingList: this.sibblingStudents
    }
    this.studentService.saveSibblingStudent(postData).subscribe({
      next: result => {
        if (result.status) {
          this.toast.success("Saved SuccessFully");
        }
        else
          this.toast.error("Somethings went wrong...");
      },
      error: (err: any) => {
        this.toast.error(err.message);
      },
    });
  }
  getSibblingStudentByStudentId(): void {
    this.sibblingStudents = [];
    this.studentHCode='';
    this.studentService.getSibblingStudentByStudentId(this.tempStudentId).subscribe({
      next: (result) => {

        this.sibblingStudents = result.data;
      },
      error: (err: any) => {
        this.toast.error(err.message);
      },
    });
  }
  
  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    // console.log('tabChangeEvent => ', tabChangeEvent);
    // console.log('index => ', tabChangeEvent.index);
    // console.log('label => ', tabChangeEvent.tab.textLabel);
    
    this.studenttype='';
    this.studentfilterIsSubmitted=false;
    if(tabChangeEvent.index==0){
      this.studenttype='';
    }else if(tabChangeEvent.index==1){
      
      this.studentfilterIsSubmitted=true;
    }else if(tabChangeEvent.index==2){
      this.studenttype='NEW';   
    }else if(tabChangeEvent.index==3){
    this.studenttype='RE_REGISTER';
  }
    this.getStudents();
  }
}
