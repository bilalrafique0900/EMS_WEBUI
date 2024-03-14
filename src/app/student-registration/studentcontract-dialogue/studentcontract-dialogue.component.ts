import { Component, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FilePathEnum } from 'src/app/shared/Enum/documentTableName-enum';
import { ConfigService } from 'src/app/shared/services/config.service';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { environment } from 'src/environments/environment';
import { PDFDocumentProxy, PDFProgressData } from 'ng2-pdf-viewer';
import { from } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
declare var $: any; 
@Component({
  selector: 'app-studentcontract-dialogue',
  templateUrl: './studentcontract-dialogue.component.html',
  styleUrls: ['./studentcontract-dialogue.component.scss']
})
export class StudentcontractDialogueComponent {
  contractFile:any;
  @Input() studentId:any = '';
  baseUrl:any = this.configService.baseApiUrl;
  FilePath:any = FilePathEnum;
  src = '';
  isPdfLoaded = false;
  private pdf: any;

  constructor(
    private toast: ToastrService,
    private http: HttpRequestService,
    private configService:ConfigService,
    private spinner: NgxSpinnerService
    ) {
      
  }
  onProgress(progressData: PDFProgressData) {
    this.spinner.show();
  }
  onLoaded(pdf: PDFDocumentProxy) {
    this.pdf = pdf;
    this.isPdfLoaded = true;
    this.spinner.hide();
  }

  ngOnInit(): void {
    $(document).ready(() => {  
      $("#Print-btn").click(function () {
        $("#print").print();

          });
        
    });

    if(this.studentId != "")
    this.getStudentContract();
  }
  getStudentContract(){
    this.http.get(`api/Contract/getcontact?studentId=${this.studentId}&Language=En`).subscribe({
      next: result => {
        this.contractFile =  result.data;
       this.src=this.baseUrl+this.FilePath.StudentDocuments+'/'+this.contractFile;
      // window.open(this.src, "_blank");
     
      },
      error: (err: any) => {this.toast.error(err.message)},
      });
}

print() {
  this.pdf.getData().then((u8: { buffer: BlobPart; }) => {
      let blob = new Blob([u8.buffer], {
          type: 'application/pdf'
      });

      const blobUrl = window.URL.createObjectURL((blob));
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
  });
}

}
