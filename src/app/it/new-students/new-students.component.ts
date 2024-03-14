import { Component } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BranchService } from 'src/app/domain/services/branch.service';
import { StudentService } from 'src/app/domain/services/student.service';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { StudentStatus } from 'src/app/shared/Enum/student-status.enum';
import { AuthService } from 'src/app/shared/security/auth-service.service';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { environment } from 'src/environments/environment';
declare var require: any;
const Swal = require('sweetalert2');
@Component({
  selector: 'app-finance-new-students',
  templateUrl: './new-students.component.html',
  styleUrls: ['./new-students.component.scss']
})
export class NewStudentsComponent {
  studentList: any[] = [];
  studentIdModel: any = "";
  searchText:string='';
  pagination:any = paginationEnum;
  FilterBranchId: any=this.authSrv.getBranchIdFromLoginUser();
  constructor(
    private modalService: NgbModal,
    config: NgbModalConfig,
    private toast: ToastrService,
    private studentService: StudentService,
    private readonly authSrv: AuthService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }
  ngOnInit(): void {
    this.getStudents();
  }
  openScrollableContent(ScroleContent: any) {
    this.modalService.open(ScroleContent, { size: 'lg' });
  }
  onPageChange(event: any) {
    
    this.pagination.pageNo = event;
    this.getStudents();
    // You can perform any necessary actions with the selected page number here
  }
  onSearchText(){
    this.pagination.pageNo=1;
    this.pagination.pageSize=10;
    this.getStudents();
  }
  getStudents() {
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    this.studentService.getStudentByStatus(StudentStatus.paymentAdded, this.FilterBranchId, this.pagination.pageNo, this.pagination.pageSize, this.searchText).subscribe({
      next: result => {
        this.studentList = result.data;
        this.pagination.totalCount=result.data[0].totalRecords || 0;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  showStudentDetailsInDialouge(studentId: string) {
    this.studentIdModel = studentId;
  }

}
