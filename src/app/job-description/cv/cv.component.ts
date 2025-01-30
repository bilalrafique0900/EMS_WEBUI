import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { JobService } from 'src/app/domain/services/job.service ';

@Component({
  selector: 'app-cv',
  templateUrl: './cv.component.html',
  styleUrls: ['./cv.component.scss']
})
export class CvComponent {
  cvData: any[] = [] ;
  constructor(
    private route: ActivatedRoute, // To get the route parameters
    private jobService: JobService, // Service to fetch data
    private toast: ToastrService // For notifications
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      debugger
      this.fetchCvData(id);
    } else {
      this.toast.error('No ID provided in the route.');
    }
  }

  fetchCvData(id: string): void {
    // this.jobService.getCvById(id).subscribe({
    //   next: (data:any) => {
    //     this.cvData = data; 
    //   }
    // });
  }
}

