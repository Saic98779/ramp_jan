import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { API_BASE_URL, APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
declare var $: any;
import { LoaderService } from '@app/common_components/loader-service.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-view-program-agencies',
  templateUrl: './view-program-agencies.component.html',
  styleUrls: ['./view-program-agencies.component.css']
})
export class ViewProgramAgenciesComponent implements OnInit ,AfterViewInit{
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
      private loader:LoaderService
    ) { 
      this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');    
      this.agencyId = this.loginsessionDetails.agencyId;
    this.StatusData = 'programsInProcess'; // Set default status

    }
  
    ngOnInit(): void {
      this.getAgenciesList() 
    }
  
    ngAfterViewInit() {
      // this.initializeDataTable(-1);
    this.initializeDataTable(this.selectedAgencyId || this.agencyId);

    }
    GetProgramsByAgency(event:any){
      this.agencyByAdmin=event;
      // this.StatusData=''
      this.selectedAgencyId = event;
      this.StatusData = 'programsInProcess'; // Always set to In-Progress on agency change
  
      this.getData()
      // this._commonService.getDataByUrl(APIS.programCreation.getProgramsListByAgencyDetails+event).subscribe({
      //   next: (dataList: any) => {
      //     this.tableList = dataList.data;
          this.reinitializeDataTable();
      //   },
      //   error: (error: any) => {
      //     this.toastrService.error(error.error.message);
      //   }
      // });
    }
    StatusData:any=''
  getProgramsByStatus(status: string) {
    if(status==this.StatusData){
      this.StatusData=''
      this.reinitializeDataTable();

    }
    else{
       this.StatusData= status;
    }
   
      this._commonService.getDataByUrl(APIS.programCreation.getProgramsListByAgencyDetails + this.selectedAgencyId).subscribe({
        next: (dataList: any) => {
          this.tableList = dataList.data;
          this.reinitializeDataTable();
        },
        error: (error: any) => {
          this.toastrService.error(error.error.message);
        }
      });
  }

  dateRange: { start: Date | null; end: Date | null } = {
    start: null,
    end: null
  };

onDateRangeChange() {
  console.log('Selected date range:', this.dateRange);

  // Run only if both dates are selected
  if (this.dateRange.start && this.dateRange.end) {
        this.StatusData=""
        this.getData()
        this.initializeDataTable(this.selectedAgencyId || this.agencyId);

  }
}
    sessionDetails(dataList: any): any {
      // console.log(dataList)
      this.sessionDetailsList = dataList.programSessionList;
    }
  
    editProgram(dataList: any): any {
      this.router.navigateByUrl('/program-creation-edit/' + dataList.programId);
    }
  
    editSession(dataList: any): any {
      this.router.navigateByUrl('/program-sessions-edit/' + dataList.programId);
    }
  
    initializeDataTable(agency:any) { 
      const self = this;
      this.dataTable = new DataTable('#view-program', {
        scrollY: "505px",
        scrollX: true,
        scrollCollapse: true,
        paging: true,
        serverSide: true, // Enable server-side processing
        pageLength: 10, // Default page size
        lengthMenu: [5, 10, 25, 50], // Available page sizes
        autoWidth: true,
        info: false,
        searching: false,
        destroy: true,
      columns: [
        { 
            title: 'S.No',
            render: function(data, type, row, meta:any) {
              // console.log(data,meta,type, row)
                return meta.settings?._iDisplayStart+meta.row  + 1;
            },
            className: 'dt-center'
        },
        { 
          title: 'Actions',
          data: null,
          render: function(data:any, type:any, row:any,meta: any) {
            // console.log(data,row,meta)
              // if (this.loginsessionDetails?.userRole == 'AGENCY_MANAGER' || this.loginsessionDetails?.userRole == 'AGENCY_EXECUTOR') {
                  return `  <button type="button" class="btn btn-default btn-sm text-lime-green edit-btn" 
                  title="Sessions" data-bs-toggle="modal" data-bs-target="#viewModal" 
                  data-id="${row.id}" title="View">
                  <span class="bi bi-eye"></span>
                </button>
                 <button type="button" class="btn btn-default btn-sm text-lime-green reschedule-btn" 
                  title="Reshedule Data" data-bs-toggle="modal" data-bs-target="#viewSheduleModal" 
                  data-id="${row.id}">
                  <span class="bi bi-arrow-repeat"></span>
                </button>
                `;
              // }
              // return '';
          },
          orderable: false,
          className: 'text-center'
      },
      { 
        data: 'startDate',
        title: 'Start Date'
    },
    { 
      data: 'endDate',
      title: 'End Date'
  },
  { 
      data: 'programTitle',
      title: 'Title Of Program'
  },
  { 
      data: 'status',
      title: 'Status',
  },
    // { 
    //     data: 'startTime',
    //     title: 'In Time',
    //     className: 'text-center'
    // },
    // { 
    //     data: 'endTime',
    //     title: 'Out Time',
    //     className: 'text-center'
    // },
    { 
      data: 'programLocationName',
      orderable: false,
      title: 'Program Location',
      render: function(data, type, row) {
        return data ? data : '';
      }
  },
    { 
        data: 'agencyName',
        orderable: false,
        title: 'Agency Name'
    },
    
    
        { 
            data: 'activityName',
            orderable: false,
            title: 'Type Of Activity'
        },
         { 
          data: 'subActivityName',
          title: 'Sub Activity',
          orderable: false ,
          render: function(data, type, row) {
            return data ? data : '';
          }
      },
  { 
    title: 'District',
    orderable: false ,
    render: function(data, type, row, meta:any) {
      // console.log(data,meta,type, row)
        return row?.district ? row?.district : '-';   
    },
    className: 'dt-center'
},
   
       
      
      
        { 
            data: 'spocName',
            title: 'SPOC Name'
        },
        { 
            data: 'spocContactNo',
            title: 'SPOC Contact No.'
        },
  //        { 
  //     data: 'programType',
  //     title: 'Budget Head'
  // },
    
        // { 
        //   data: null,
        //   title: 'Edit / Delete',
        //   render: (data: any, type: any, row: any, meta: any) => {
        //     // Use meta.row for the current displayed row index
        //     return `
        //       <button type="button" class="btn btn-default text-lime-green btn-sm edit-btn" data-index="${meta.row}">
        //         <span class="bi bi-eye"></span>
        //       </button>
        //       // <button type="button" class="btn btn-default text-danger btn-sm delete-btn" data-index="${meta.row}">
        //       //   <span class="bi bi-trash"></span>
        //       // </button>
        //     `;
        //   },
        //   className: 'text-center',
        //   orderable: false
        // }
       
    ],
    ajax: (data: any, callback: any, settings: any) => {
      // Extract pagination and sorting parameters
      const page = data.start / data.length;
      const size = data.length;
      const sortColumn = data.order[0]?.column;
      const sortDirection = data.order[0]?.dir;
      const sortField = data.columns[sortColumn]?.data;
      
      // Prepare parameters for API call
      let statusDataurl=`&status=${this.StatusData?this.StatusData:'programsScheduled'}`;
      let params = `?page=${page}&size=${size}`;
      params=`&page=${page}&size=${size}`
      if(sortField=='programLocationName' || sortField=='subActivityName' || sortField=='activityName'){
        params=`&page=${page}&size=${size}`
        // params = `?page=${page}&size=${size}`
        
      }
      else{
        if (sortField && sortDirection) {
          params += `&sort=${sortField},${sortDirection}`;
        }
      }
     
      
      // Add search filter if any
      if (data.search.value) {
        params += `&search=${encodeURIComponent(data.search.value)}`;
      }
     
      statusDataurl = `?status=${this.StatusData?this.StatusData:'programsScheduled'}`;
       let startDate = this.dateRange.start
        if (startDate) {
          const day = String(startDate.getDate()).padStart(2, '0');
          const month = String(startDate.getMonth() + 1).padStart(2, '0');
          const year = startDate.getFullYear();
          params += `&fromDate=${day}-${month}-${year}`;
        }
        let endDate = this.dateRange.end;
        if (endDate) {
          const day = String(endDate.getDate()).padStart(2, '0');
          const month = String(endDate.getMonth() + 1).padStart(2, '0');
          const year = endDate.getFullYear();
          params += `&toDate=${day}-${month}-${year}`;
        }
        
         this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgencyByStatusDetails}${agency}${statusDataurl}${params}`)
        .pipe()
        .subscribe({
          next: (res: any) => {
            callback({
              draw: data.draw,
              recordsTotal: res.totalElements,
              recordsFiltered: res.totalElements,
              data: res.data
             
            });
            // console.log(data)
          },
          error: (err) => {
            this.toastrService.error(err.message, "Programs Data Error!");
            console.error(err);
            callback({
              draw: data.draw,
              recordsTotal: 0,
              recordsFiltered: 0,
              data: []
            });
          }
        });
      // if(this.StatusData){
       
      // }
      // else{
      //   let startDate = this.dateRange.start
      //   if (startDate) {
      //     const day = String(startDate.getDate()).padStart(2, '0');
      //     const month = String(startDate.getMonth() + 1).padStart(2, '0');
      //     const year = startDate.getFullYear();
      //     params += `&startDate=${day}-${month}-${year}`;
      //   }
      //   let endDate = this.dateRange.end;
      //   if (endDate) {
      //     const day = String(endDate.getDate()).padStart(2, '0');
      //     const month = String(endDate.getMonth() + 1).padStart(2, '0');
      //     const year = endDate.getFullYear();
      //     params += `&endDate=${day}-${month}-${year}`;
      //   }
      //   this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgencyDetails}${agency}${params}`)
      //   .pipe()
      //   .subscribe({
      //     next: (res: any) => {
      //       callback({
      //         draw: data.draw,
      //         recordsTotal: res.totalElements,
      //         recordsFiltered: res.totalElements,
      //         data: res.data
             
      //       });
      //       // console.log(data)
      //     },
      //     error: (err) => {
      //       this.toastrService.error(err.message, "Programs Data Error!");
      //       console.error(err);
      //       callback({
      //         draw: data.draw,
      //         recordsTotal: 0,
      //         recordsFiltered: 0,
      //         data: []
      //       });
      //     }
      //   });
      // }
      
    },
   
    initComplete: function() {
      // Use proper event handling with arrow function
      $('#view-program').on('click', '.edit-btn', (event:any) => {
        const rowData = self.dataTable.row($(event.currentTarget).parents('tr')).data();
        self.sessionDetails(rowData); // Call your method with proper data
      });
       $('#view-table-program').on('click', '.reschedule-btn', function(event: any) {
      const rowData = self.dataTable.row($(event.currentTarget).parents('tr')).data();
      self.openRescheduleModal(rowData);
    });
    }
      });
    }


    selectedRescheduleData: any = [];
  openRescheduleModal(row: any) {
  // Store the selected row/session data if needed
  this.selectedRescheduleData = [];
  // Show the modal using Bootstrap JS
  // const modal = new bootstrap.Modal(document.getElementById('viewSheduleModal'));
  // modal.show();

  this.loader.show();

  this._commonService.getById(APIS.programCreation.resheduleData, row.programId).subscribe({
    next: (res: any) => {
      this.selectedRescheduleData = res?.data;
      this.loader.hide();
  //      const modal = new bootstrap.Modal(document.getElementById('viewSheduleModal'));
  // modal.show();
      // console.log(this.selectedRescheduleData, 'selectedRescheduleData');
    },
    error: (err) => {
  //      const modal = new bootstrap.Modal(document.getElementById('viewSheduleModal'));
  // modal.show();
      this.loader.hide();
      this.toastrService.error('Data Not Available', "Session Data Error!");
      new Error(err);
    },
  });

  




}
  
    reinitializeDataTable() {
      if (this.dataTable) {
        this.dataTable.destroy();
      }
      setTimeout(() => {
        this.initializeDataTable( this.agencyByAdmin);
       
      }, 0);
    }
    agencyByAdmin:any=-1
    selectedAgencyId:any=-1
    agencyListFiltered:any;
    getAgenciesList() {
      this.agencyList = [];
      this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe((res: any) => {
        this.agencyList = res.data;
        this.agencyListFiltered=this.agencyList;
           this.StatusData = 'programsInProcess'; 
        this.selectedAgencyId =-1
        this.GetProgramsByAgency(-1);
      }, (error) => {
        this.toastrService.error(error.error.message);
      });
    }
  
    previewData:any;    
    async showPreviewPopup(dataList: any) {
      this.previewData = ''
      let url = `${API_BASE_URL}/program/file/download/${dataList.programSessionFileId}`
      this.previewData = url
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
    PrigramSummaryData:any={}
    getData() {
    let params:any=''
    this.PrigramSummaryData ={}
    let startDate = this.dateRange.start
        if (startDate) {
          const day = String(startDate.getDate()).padStart(2, '0');
          const month = String(startDate.getMonth() + 1).padStart(2, '0');
          const year = startDate.getFullYear();
          params += `?fromDate=${day}-${month}-${year}`;
        }
        let endDate = this.dateRange.end;
        if (endDate) {
          const day = String(endDate.getDate()).padStart(2, '0');
          const month = String(endDate.getMonth() + 1).padStart(2, '0');
          const year = endDate.getFullYear();
          params += `&toDate=${day}-${month}-${year}`;
        }
    this._commonService.getDataByUrl(APIS.programCreation.programSummary+(this.selectedAgencyId?this.selectedAgencyId:this.agencyId)+params).subscribe({
      next: (res: any) => {          
        // this.PrigramSummaryData = res?.data   
      // console.log( this.PrigramSummaryData)
      this.PrigramSummaryData = res?.data
      },
      error: (err) => {
        this.toastrService.error('Data Not Available', "Summary Data Error!");
        new Error(err);
      },
    });
    // console.log(this.ParticipantAttentance)
  }
     downloadProgram(type:any){
     this.loader.show();
      let linkUrl = type=='excel'?APIS.programCreation.downloadProgramsDataExcel+this.selectedAgencyId:APIS.programCreation.downloadProgramsDataPdf+this.selectedAgencyId
      const link = document.createElement("a");
      link.setAttribute("download", linkUrl);
      link.setAttribute("target", "_blank");
      link.setAttribute("href", linkUrl);
      document.body.appendChild(link);
      link.click();
      link.remove();
      this.loader.hide();
    }

    // ---------- Download the currently-selected status tab as Excel ----------
    isStatusDownloadLoading: boolean = false;
    private readonly statusTabLabels: Record<string, string> = {
      programsScheduled: 'Scheduled',
      programsOverdue: 'Overdue',
      programsYetToBegin: 'Yet to Begin',
      programsInProcess: 'In Progress',
      programsCompletedDataPending: 'Completed Data Pending',
      programExpenditureUpdated: 'Expenditure Updated',
      programExpenditureApproved: 'Expenditure Verified'
    };
    get statusDownloadLabel(): string {
      const key = this.StatusData || 'programsScheduled';
      return this.statusTabLabels[key] || 'Programs';
    }
    private formatDateDDMMYYYY(d: any): string {
      if (!d || Object.prototype.toString.call(d) !== '[object Date]' || isNaN(d.getTime())) return '';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
    downloadStatusTab(): void {
      const agency = this.selectedAgencyId !== undefined && this.selectedAgencyId !== null
        ? this.selectedAgencyId
        : this.agencyId;
      if (agency === undefined || agency === null || agency === '') {
        this.toastrService.info('Please select an agency first.');
        return;
      }
      const status = this.StatusData || 'programsScheduled';
      const fromDate = this.formatDateDDMMYYYY(this.dateRange?.start);
      const toDate = this.formatDateDDMMYYYY(this.dateRange?.end);
      let url = `${APIS.programCreation.getProgramsListByAgencyByStatusDetails}${agency}?status=${status}&page=0&size=10000`;
      if (fromDate) url += `&fromDate=${fromDate}`;
      if (toDate) url += `&toDate=${toDate}`;
      this.isStatusDownloadLoading = true;
      this._commonService.getDataByUrl(url).subscribe({
        next: (res: any) => {
          this.isStatusDownloadLoading = false;
          const rows: any[] = Array.isArray(res?.data) ? res.data : [];
          if (!rows.length) {
            this.toastrService.info('No records to download for this tab.');
            return;
          }
          this.exportRowsAsXlsx(rows, `Programs_${this.statusDownloadLabel.replace(/\s+/g, '_')}.xlsx`);
        },
        error: (err: any) => {
          this.isStatusDownloadLoading = false;
          this.toastrService.error(err?.message || 'Failed to download programs.');
        }
      });
    }
    private exportRowsAsXlsx(rows: any[], fileName: string): void {
      // Column order + headers mirror the on-screen DataTable.
      const columns: { header: string; key: string }[] = [
        { header: 'Start Date', key: 'startDate' },
        { header: 'End Date', key: 'endDate' },
        { header: 'Title Of Program', key: 'programTitle' },
        { header: 'Status', key: 'status' },
        { header: 'Program Location', key: 'programLocationName' },
        { header: 'Agency Name', key: 'agencyName' },
        { header: 'Type Of Activity', key: 'activityName' },
        { header: 'Sub Activity', key: 'subActivityName' },
        { header: 'District', key: 'district' },
        { header: 'SPOC Name', key: 'spocName' },
        { header: 'SPOC Contact No.', key: 'spocContactNo' }
      ];
      const header = ['S.No', ...columns.map(c => c.header)];
      const body = rows.map((row, i) => [
        i + 1,
        ...columns.map(c => (row?.[c.key] === null || row?.[c.key] === undefined) ? '' : row[c.key])
      ]);
      const sheet = XLSX.utils.aoa_to_sheet([header, ...body]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, 'Programs');
      XLSX.writeFile(workbook, fileName);
    }
  }


  //  <tr *ngFor="let item of tableList; let i = index">

  //                                   <td>{{ i + 1 }}</td>
  //                                   <td *ngIf="loginsessionDetails?.userRole == 'AGENCY_MANAGER' || loginsessionDetails?.userRole == 'AGENCY_EXECUTOR'
  //                                   || loginsessionDetails?.userRole == 'ADMIN'">
  //                                       <!-- (click)="sessionDetails(item)" data-bs-toggle="modal" data-bs-target="#viewModal" -->
  //                                       <button type="button" class="btn btn-default btn-sm text-lime-green"
  //                                           title="Sessions" data-bs-toggle="modal" data-bs-target="#viewModal"
  //                                           (click)="sessionDetails(item)" title="View"><span
  //                                               class="bi bi-eye"></span></button>
  //                                       <!-- <button type="button" class="btn btn-default btn-sm text-primary mx-2" title="Edit" (click)="editProgram(item)"><span class="bi bi-pencil"></span></button> -->
  //                                       <!-- <button type="button" class="btn btn-default btn-sm text-danger" title="Delete"><span class="bi bi-trash"></span></button> -->
  //                                   </td>
  //                                   <td>{{ item.status }}</td>
  //                                   <td>{{ item.activityName }}</td>
  //                                   <td>{{ item.subActivityName }}</td>
  //                                   <td>{{ item.programType }}</td>
  //                                   <!-- <td>{{ item.programDetails }}</td> -->
  //                                   <td>{{ item.programTitle }}</td>
  //                                   <!-- <td>{{ item.noOfDays }}</td> -->
  //                                   <td>{{ item.startDate }}</td>
  //                                   <td>{{ item.endDate }}</td>
  //                                   <td class="text-center">{{ item.startTime }}</td>
  //                                   <!-- <td class="text-center">{{ item.endTime }}</td> -->
  //                                   <td>{{ item.spocName }}</td>
  //                                   <td>{{ item.spocContactNo }}</td>
  //                                   <td>{{ item.programLocationName }}</td>
                                    
  //                               </tr>