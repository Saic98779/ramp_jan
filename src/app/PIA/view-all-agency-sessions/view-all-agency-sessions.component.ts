import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { API_BASE_URL, APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
declare var $: any;

@Component({
  selector: 'app-view-all-agency-sessions',
  templateUrl: './view-all-agency-sessions.component.html',
  styleUrls: ['./view-all-agency-sessions.component.css']
})
export class ViewAllAgencySessionsComponent implements OnInit {

  localStorageData: any;
  sessionDetailsList: any;
  tableList: any;
  dataTable: any;
  agencyList: any = [];
  loginsessionDetails: any;
  agencyId: any;
  constructor(
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
    private router: Router,
  ) { 
    this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');    
    this.agencyId = this.loginsessionDetails.agencyId;
  }

  ngOnInit(): void {
    this.getAgenciesList() 
  }

  selectedAgencyId: any;
  getAgenciesList() {
      this.agencyList = [];
      this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe((res: any) => {
        this.agencyList = res.data;
        this.selectedAgencyId = res.data[0].agencyId;
        this.GetProgramsByAgency(this.selectedAgencyId);
      }, (error) => {
        this.toastrService.error(error.error.message);
      });
    }

    GetProgramsByAgency(value?: any) {
      this.tableList=''
      this._commonService.getDataByUrl(APIS.programCreation.getProgramsListByAgencyDetails+value).subscribe({
        next: (dataList: any) => {
          this.tableList = dataList.data;
          console.log(this.tableList, 'tableList');
        },
        error: (error: any) => {
          this.toastrService.error(error.error.message);
        }
      });
    }

    previewData:any;
  cacheBuster = new Date().getTime();
  async showPreviewPopup(dataList: any) {
    this.previewData = ''
    let url = `${API_BASE_URL}/program/file/download/${dataList.programSessionFileId}`
    this.previewData = url
    // // this.previewData = this.sanitizer.bypassSecurityTrustResourceUrl(url)
    // console.log(url,'URL')
    // const genFile = await this.encodeFileName(url);
    // setTimeout(() => {
    //   this.previewData = genFile  
    // }, 1000);
    //https://view.officeapps.live.com/op/embed.aspx?src=https://ramp-tg.metaversedu.in/workflow/program/file/download/107
    
    // // this.previewData = this.sanitizer.bypassSecurityTrustResourceUrl(
    // //   `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}?cache='${this.cacheBuster}`
    // // );

    // const previewModal = document.getElementById('previewModal');
    // if (previewModal) {
    //   const modalInstance = new bootstrap.Modal(previewModal);
    //   modalInstance.show();
    // }
  }

  getFileIcon(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'fas fa-file-pdf';
      case 'doc':
      case 'docx': return 'fas fa-file-word';
      case 'xls':
      case 'xlsx': return 'fas fa-file-excel';
      case 'ppt':
      case 'pptx': return 'fas fa-file-powerpoint';
      default: return 'fas fa-file';
    }
  }
  
  getIconColor(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '#e74c3c';
      case 'doc':
      case 'docx': return '#3498db';
      case 'xls':
      case 'xlsx': return '#2ecc71';
      case 'ppt':
      case 'pptx': return '#e67e22';
      default: return '#7f8c8d';
    }
  }
  
  getFileName(filePath: string): string {
    return filePath.split('/').pop() || 'Download';
  }

  collapseStates: { [key: number]: boolean } = {};

  toggleIcon(index: number): void {
    this.collapseStates[index] = !this.collapseStates[index];
  }

}
