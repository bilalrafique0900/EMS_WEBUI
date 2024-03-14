import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StudentService } from 'src/app/domain/services/student.service';
import { v4 as uuidv4 } from 'uuid';
@Component({
  selector: 'app-previous-school-details',
  templateUrl: './previous-school-details.component.html',
  styleUrls: ['./previous-school-details.component.scss']
})
export class PreviousSchoolDetailsComponent {
  @Input() studentId:any = '';
  form: FormGroup;
 dateicker: { day?: number; month: number; year: number };
 submitted = false;
 constructor(
  private fb: FormBuilder,
  private toast: ToastrService,
  private router: Router,
  private studentService: StudentService,
  private datePipe: DatePipe,
) {
  this.form = this.fb.group({
    StudentPreviousSchoolId: uuidv4(),
    StudentId: ['', Validators.required],
    PreviousSchoolName: ['', Validators.required],
    PreviousSchoolYear: ['', Validators.required],
    PreviousSchoolGrade: ['', Validators.required],
    PreviousSchoolCertificate: ['', ],///Validators.required
    PreviousSchoolCertificateNumber: ['', ],//Validators.required
    PreviousSchoolCertificateDate: ['', ],//Validators.required
  });
  const today = new Date();
  this.dateicker = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate()
  };
}
ngOnInit(): void {
  if(this.studentId != "" && this.studentId != null){
    this.getPreviousSchoolInfo();
  }
}
getPreviousSchoolInfo() {
  this.studentService.getPreviousSchoolInfoByStudentId(this.studentId).subscribe({
    next: result => {
      let parentDetail = result.data;
      this.patchStudentPreviousInfo(parentDetail);
    },
    error: (err: any) => { this.toast.error(err.message) },
  });
}
patchStudentPreviousInfo(item:any){
  this.form.controls['StudentPreviousSchoolId'].setValue(item.studentPreviousSchoolId);
  this.form.controls['StudentId'].setValue(item.studentId);
  this.form.controls['PreviousSchoolName'].setValue(item.previousSchoolName);
  this.form.controls['PreviousSchoolYear'].setValue(item.previousSchoolYear);
  this.form.controls['PreviousSchoolGrade'].setValue(item.previousSchoolGrade);
  this.form.controls['PreviousSchoolCertificate'].setValue(item.previousSchoolCertificate);
  this.form.controls['PreviousSchoolCertificateNumber'].setValue(item.previousSchoolCertificateNumber);
  let FormateDate = this.datePipe.transform(item.dateOfBirth, "yyyy-MM-dd");
  let splitDOB: any = FormateDate?.split('-');
  if (Array.isArray(splitDOB)) {
    this.dateicker.year = Number(splitDOB[0]);
    this.dateicker.month = Number(splitDOB[1]);
    this.dateicker.day = Number(splitDOB[2]);
  }
    }
get basicFormControl() {
  return this.form.controls;
}
FormSubmit() {
  if(this.studentId == "" || this.studentId == null){
    this.toast.error("Please Edit student first"); return;
  }
  this.form.controls['StudentId'].setValue(this.studentId);
  let DateCertificate = this.dateicker.year + '-' + this.dateicker.month + '-' + this.dateicker.day;
  this.form.value['PreviousSchoolCertificateDate'] = new Date(DateCertificate);
  this.submitted = true;
  if (!this.form.valid) return;
  this.studentService.saveStudentPreviousSchoolDetails(this.form.value).subscribe({
    next: result => {
      if (result) {
        this.toast.success(result.message);
        this.router.navigateByUrl('/registration/student').then(() => {
          window.location.reload();
        });
        return;
      }
      else
        this.toast.error("Somethings went wrong...")
    },
    error: (err: any) => { this.toast.error(err.message) },
  });
}
}
