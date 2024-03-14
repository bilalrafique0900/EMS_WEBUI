import { Component } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BranchService } from 'src/app/domain/services/branch.service';
import { TeacherService } from 'src/app/domain/services/teacher.service';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { StudentStatus } from 'src/app/shared/Enum/student-status.enum';
import { TeacherStatus } from 'src/app/shared/Enum/teacher-status.enum';
import { environment } from 'src/environments/environment';
declare var require: any;
const Swal = require('sweetalert2');
@Component({
  selector: 'app-new-teachers',
  templateUrl: './new-teachers.component.html',
  styleUrls: ['./new-teachers.component.scss']
})
export class NewTeachersComponent {
  teacherList: any[] = [];
  studentIdModel: any = "";
  searchText:string='';
  pagination:any = paginationEnum;
  FilterBranchId: any=JSON.parse(atob(localStorage.getItem(environment.BranchId) as string));
  branchList: any[]=[];
  constructor(
    private modalService: NgbModal,
    config: NgbModalConfig,
    private toast: ToastrService,
    private readonly teacherService:TeacherService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    this.getTeachers();
  }
  openScrollableContent(ScroleContent: any) {
    this.modalService.open(ScroleContent, { size: 'lg' });
  }
  onPageChange(event: any) {
    
    this.pagination.pageNo = event;
    this.getTeachers();
    // You can perform any necessary actions with the selected page number here
  }
  onSearchText(){
    this.pagination.pageNo=1;
    this.pagination.pageSize=10;
    this.getTeachers();
  }
  getTeachers() {
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    this.teacherService.getTeacherByStatus(TeacherStatus.NEW,this.FilterBranchId, this.pagination.pageNo, this.pagination.pageSize,this.searchText).subscribe({
      next: result => {
        
        this.teacherList = result.data;
        this.pagination.totalCount=result.data[0].totalRecords || 0;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  showStudentDetailsInDialouge(teacherId: string) {
    this.studentIdModel = teacherId;
  }

}
