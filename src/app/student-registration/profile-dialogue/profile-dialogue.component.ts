import { Component, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FilePathEnum } from 'src/app/shared/Enum/documentTableName-enum';
import { CommonService } from 'src/app/shared/services/common.service';
import { ConfigService } from 'src/app/shared/services/config.service';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { environment } from 'src/environments/environment';
declare var $: any; 
@Component({
  selector: 'app-profile-dialogue',
  templateUrl: './profile-dialogue.component.html',
  styleUrls: ['./profile-dialogue.component.scss']
})
export class ProfileDialogueComponent {
  studentDetails:any;
  @Input() studentId:any = '';
  baseUrl:any = this.configService.baseApiUrl;
  FilePath:any = FilePathEnum;
  constructor(
    private toast: ToastrService,
    private http: HttpRequestService,
    private configService:ConfigService,
    private commonService:CommonService,
    ) {
      
  }
  
  ngOnInit(): void {
    $(document).ready(() => {  
      $("#Print-btn").click(function () {
        $("#print").print();

          });
        
    });
    
    if(this.studentId != "")
    this.getStudents();
  }
  getStudents(){
    this.http.get(`student/by-studentid?studentId=${this.studentId}`).subscribe({
      next: result => {
        this.studentDetails =  result.data[0];
        this.studentDetails['age'] = this.commonService.calculate_age(this.studentDetails.dateOfBirth);
      },
      error: (err: any) => {this.toast.error(err.message)},
      });
}
}
