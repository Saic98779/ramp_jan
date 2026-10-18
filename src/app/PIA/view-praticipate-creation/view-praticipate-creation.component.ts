import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
declare var $: any;

@Component({
  selector: 'app-view-praticipate-creation',
  templateUrl: './view-praticipate-creation.component.html',
  styleUrls: ['./view-praticipate-creation.component.css']
})
export class ViewParticipateCreationComponent implements OnInit {

  localStorageData:any
  sessionDetailsList:any
  agencyList: any = [];
  loginsessionDetails: any;
  constructor(
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
  ) { 
    this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');    
  }

  ngOnInit(): void {    
    //this.getProgramDetails()
    this.getAgenciesList()
  }

  ngAfterViewInit() {
    setTimeout(() => {
      
    }, 500);
  }
  tableList:any
  getProgramDetails(): any {
    //const programDetails = localStorage.getItem('programDetails');
    //console.log(programDetails)
    //this.localStorageData = programDetails ? JSON.parse(programDetails) : [];
    this.tableList = ''
    this._commonService.getDataByUrl(APIS.participantdata.getParticipantList).subscribe({
      next: (dataList: any) => {
        this.tableList = dataList.data
        this.reinitializeDataTable(this.loginsessionDetails?.agencyId);
      },
      error: (error: any) => {
        this.toastrService.error(error.error.message);
      }
    })
  }

  getParticipateListByAgency(event?:any){
    this.tableList = ''
    let agencyId = event.target.value
    if(event.target.value){
      this.selectedAgencyId = event.target.value
      //this._commonService.getDataByUrl(APIS.participantdata.getParticipantList+'/'+this.loginsessionDetails.agencyId)
      this._commonService.getDataByUrl(APIS.participantdata.getParticipantListByAgency+agencyId).subscribe({
        next: (dataList: any) => {
          this.tableList = dataList.data
          this.reinitializeDataTable(agencyId);
        },
        error: (error: any) => {
          this.toastrService.error(error.error.message);
        }
      })
    }else {
      this.selectedAgencyId = event.target.value
      //this._commonService.getDataByUrl(APIS.participantdata.getParticipantList+'/'+this.loginsessionDetails.agencyId)
      this._commonService.getDataByUrl(APIS.participantdata.getParticipantListByAgency+agencyId).subscribe({
        next: (dataList: any) => {
          this.tableList = dataList.data
          this.reinitializeDataTable(agencyId);
        },
        error: (error: any) => {
          this.toastrService.error(error.error.message);
        }
      })
    }
    
  }
  initializeDataTable() {
    this.dataTable = new DataTable('#view-table-participate', {
      // scrollX: true,
      // scrollCollapse: true,    
      // responsive: true,    
      // paging: true,
      // searching: true,
      // ordering: true,
      scrollY: "415px",
      scrollX: true,
      scrollCollapse: true,
      autoWidth: true,
      paging: false,
      info: false,
      searching: false,
      destroy: true, // Ensure reinitialization doesn't cause issues
    });
  }
  // initializeDataTable() {
  //   this.dataTable = new DataTable('#view-table-participate', {              
  //     // scrollX: true,
  //     // scrollCollapse: true,    
  //     // responsive: true,    
  //     // paging: true,
  //     // searching: true,
  //     // ordering: true,
  //     scrollY: "415px",     
  //     scrollX:        true,
  //     scrollCollapse: true,
  //     autoWidth:         true,  
  //     paging:         true,  
  //     info: false,   
  //     searching: false,  
  //     destroy: true, // Ensure reinitialization doesn't cause issues
  //     columns: [
  //       { 
  //         title: 'S.No',
  //         render: function(data, type, row, meta) {
  //           return meta.row + 1;
  //         },
  //         className: 'text-start'
  //       },
  //       { 
  //         data: 'organizationName',
  //         title: 'IsAspirant',
  //         render: function(data, type, row) {
  //           return data ? 'No' : 'Yes';
  //         }
  //       },
  //       { 
  //         data: 'isAspirant',
  //         title: 'Organization Name',
  //         render: function(data, type, row) {
  //           return data === 'Aspirant' ? '' : row.organizationName;
  //         }
  //       },
  //       { 
  //         data: 'participantName',
  //         title: 'Name of the Participant'
  //       },
  //       { 
  //         data: 'gender',
  //         title: 'Gender'
  //       },
  //       { 
  //         data: 'disability',
  //         title: 'Disability'
  //       },
  //       { 
  //         data: 'aadharNo',
  //         title: 'Aadhar No.'
  //       },
  //       { 
  //         data: 'category',
  //         title: 'Category'
  //       },
  //       { 
  //         data: 'mobileNo',
  //         title: 'Mobile No.'
  //       },
  //       { 
  //         data: 'email',
  //         title: 'Email'
  //       },
  //       { 
  //         data: 'designation',
  //         title: 'Designation/Current Trade'
  //       },
  //       { 
  //         data: 'isParticipatedBefore',
  //         title: 'Previous Participant'
  //       },
  //       { 
  //         data: 'preTrainingAssessmentConducted',
  //         title: 'Pre-Training Assessment'
  //       },
  //       { 
  //         data: 'postTrainingAssessmentConducted',
  //         title: 'Post Training Assessment'
  //       },
  //       { 
  //         data: 'isCertificateIssued',
  //         title: 'Certificate Issue Date',
  //         render: function(data) {
  //           return data === 'Y' ? 'Yes' : 'No';
  //         }
  //       },
  //       { 
  //         data: 'certificateIssueDate',
  //         title: 'Issue Date',
  //         render: function(data, type, row) {
  //           return row.isCertificateIssued === 'Y' ? data : '';
  //         }
  //       },
  //       { 
  //         data: 'needAssessmentMethodology',
  //         title: 'Methodology Used for Needs Assessment'
  //       },
  //       { 
  //         title: 'Edit / Delete',
  //         render: function(data, type, row, meta) {
  //           return `
  //             <button type="button" class="btn btn-default text-lime-green btn-sm" onclick="angularComponentReference.editRow(${meta.row})">
  //               <span class="bi bi-pencil"></span>
  //             </button>
  //             <button type="button" class="btn btn-default text-danger btn-sm" onclick="angularComponentReference.deleteRow(${meta.row})">
  //               <span class="bi bi-trash"></span>
  //             </button>
  //           `;
  //         },
  //         className: 'text-center',
  //         orderable: false
  //       }
  //     ],
  //     // scrollY: "415px",
  //     // scrollX: true,
  //     // scrollCollapse: true,
  //     // autoWidth: true,
  //     // paging: true,
  //     pageLength: 10,
  //     lengthMenu: [5, 10, 25, 50],
  //     responsive: true,
  //     dom: '<"top"lf>rt<"bottom"ip>',
  //     });
  // }
  // initializeDataTable(agencyId:any) { 
  //   this.dataTable = new DataTable('#view-table-participate', {
  //     scrollY: "415px",
  //     scrollX: true,
  //     scrollCollapse: true,
  //     paging: true,
  //     serverSide: true, // Enable server-side processing
  //     pageLength: 10, // Default page size
  //     lengthMenu: [5, 10, 25, 50], // Available page sizes
  //     autoWidth: true,
  //     info: false,
  //     searching: false,
  //     destroy: true,
  //     ajax: function (data:any, callback, settings) {
  //       // Extract pagination parameters
  //       let page = data.start / data.length;
  //       let size = data.length;

  //       // Fetch data from API
  //       fetch(APIS.participantdata.getParticipantListByAgency+agencyId+`?page=${page}&size=${size}`)
  //           .then(res => res.json())
  //           .then(json => {
  //               callback({
  //                   draw: data.draw,
  //                   recordsTotal: json.totalElements,
  //                   recordsFiltered: json.totalElements,
  //                   data: json.data
  //               });
  //           });
  //   },
  //   columns: [
  //     { 
  //       title: 'S.No',
  //       render: function(data, type, row, meta) {
  //         return meta.row + 1;
  //       },
  //       className: 'text-start'
  //     },
  //     { 
  //       data: 'organizationName',
  //       title: 'IsAspirant',
  //       render: function(data, type, row) {
  //         return data ? 'No' : 'Yes';
  //       }
  //     },
  //     { 
  //       data: 'isAspirant',
  //       title: 'Organization Name',
  //       render: function(data, type, row) {
  //         return data === 'Aspirant' ? '' : row.organizationName;
  //       }
  //     },
  //     { 
  //       data: 'participantName',
  //       title: 'Name of the Participant'
  //     },
  //     { 
  //       data: 'gender',
  //       title: 'Gender'
  //     },
  //     { 
  //       data: 'disability',
  //       title: 'Disability'
  //     },
  //     { 
  //       data: 'aadharNo',
  //       title: 'Aadhar No.'
  //     },
  //     { 
  //       data: 'category',
  //       title: 'Category'
  //     },
  //     { 
  //       data: 'mobileNo',
  //       title: 'Mobile No.'
  //     },
  //     { 
  //       data: 'email',
  //       title: 'Email'
  //     },
  //     { 
  //       data: 'designation',
  //       title: 'Designation/Current Trade'
  //     },
  //     { 
  //       data: 'isParticipatedBefore',
  //       title: 'Previous Participant'
  //     },
  //     { 
  //       data: 'preTrainingAssessmentConducted',
  //       title: 'Pre-Training Assessment'
  //     },
  //     { 
  //       data: 'postTrainingAssessmentConducted',
  //       title: 'Post Training Assessment'
  //     },
  //     { 
  //       data: 'isCertificateIssued',
  //       title: 'Certificate Issue Date',
  //       render: function(data) {
  //         return data === 'Y' ? 'Yes' : 'No';
  //       }
  //     },
  //     { 
  //       data: 'certificateIssueDate',
  //       title: 'Issue Date',
  //       render: function(data, type, row) {
  //         return row.isCertificateIssued === 'Y' ? data : '';
  //       }
  //     },
  //     { 
  //       data: 'needAssessmentMethodology',
  //       title: 'Methodology Used for Needs Assessment'
  //     },
  //     { 
  //       title: 'Edit / Delete',
  //       render: function(data, type, row, meta) {
  //         return `
  //           <button type="button" class="btn btn-default text-lime-green btn-sm" onclick="angularComponentReference.editRow(${meta.row})">
  //             <span class="bi bi-pencil"></span>
  //           </button>
  //           <button type="button" class="btn btn-default text-danger btn-sm" onclick="angularComponentReference.deleteRow(${meta.row})">
  //             <span class="bi bi-trash"></span>
  //           </button>
  //         `;
  //       },
  //       className: 'text-center',
  //       orderable: false
  //     }
  //   ],
  //   });
  // }
  dataTable: any;
  reinitializeDataTable(agencyId:any) {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
    setTimeout(() => {
      this.initializeDataTable();
    }, 0);
  }

  sessionDetails(dataList: any): any {    
    this.sessionDetailsList = dataList.programSessionList
  }

  deleteRow(item:any,i:number){
    //  this.submitedData.pop(i)
     this.tableList.splice(i, 1)
      console.log( this.tableList)
      // this.submitedData.push(this.ParticipantDataForm.value)
      // sessionStorage.setItem('ParticipantData', this.submitedData)
       //sessionStorage.setItem('ParticipantData', JSON.stringify(this.submitedData)); 
       //this.getData()
  }
  editRow(item:any,i:any){
    //this.tableList.patchValue({...item})
  }
  selectedAgencyId:any
  getAgenciesList() {
    this.agencyList = [];
    this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe((res: any) => {
      this.agencyList = res.data;
      this.selectedAgencyId = res.data[0].agencyId
      this.getParticipateListByAgency({target:{value:res.data[0].agencyId}})
    }, (error) => {
      this.toastrService.error(error.error.message);
    });
  }
}
