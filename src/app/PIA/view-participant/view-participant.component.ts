import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
declare var bootstrap: any;

@Component({
  selector: 'app-view-participant',
  templateUrl: './view-participant.component.html',
  styleUrls: ['./view-participant.component.css']
})
export class ViewParticipantComponent implements OnInit {

  loginsessionDetails: any;
    agencyId: any;
    programIds:any
     Role :any='';
    constructor(private fb: FormBuilder,
      private toastrService: ToastrService,
      private _commonService: CommonServiceService, private router: Router,) { 
        this.Role=JSON.parse(sessionStorage.getItem('user') || '{}').userRole;
        this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
      }
  
    ngOnInit(): void {
      this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');  
      if(this.loginsessionDetails.userRole == 'ADMIN') {
        this.getAgenciesList()
      }
      else{
        this.getProgramsByAgency()
      }
     
    }
    selectedAgencyId:any;
    agencyList:any;
    agencyListFiltered:any;
  getAgenciesList() {
    this.agencyList = [];
    this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe((res: any) => {
      this.agencyList = res.data;
      this.agencyListFiltered= this.agencyList;
      this.selectedAgencyId = res.data[0].agencyId
      this.getProgramsByAgencyAdmin(this.selectedAgencyId)
    }, (error) => {
      this.toastrService.error(error.error.message);
    });
  }
    agencyProgramList: any;
    agencyProgramListFiltered:any;
    getProgramsByAgencyAdmin(agency:any) {
      this.submitedData = ''
      this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgency+'/'+agency}`).subscribe({
        next: (res: any) => {
          this.agencyProgramList = res?.data
          this.agencyProgramListFiltered = this.agencyProgramList
          this.programIds = this.agencyProgramList[0].programId
          this.submitedData = ''
          this.getData()
        },
        error: (err) => {
          new Error(err);
        }
      })
    }
    getProgramsByAgency() {
     

      this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListBySession + (this.loginsessionDetails.agencyId?this.loginsessionDetails.agencyId:this.agencyId)}?status=Sessions Created`).subscribe({
        next: (res: any) => {
          this.agencyProgramList = res?.data
          this.agencyProgramListFiltered= this.agencyProgramList
          this.programIds = this.agencyProgramList[0].programId
          this.getData()
        },
        error: (err) => {
          new Error(err);
        }
      })
    }
    dropdownProgramsList(event: any, type: any) {
      this.submitedData = ''
      this.programIds = event.value
      if (type == 'table' && event.value) {
        this.getData()
      }
    }
    submitedData:any
    getData() {
      this.submitedData = ''
      // sessionStorage.getItem('ParticipantData')
      // let resList = sessionStorage.getItem('ParticipantData') || ''
      // // let resList = sessionStorage.getItem('ParticipantData') || ''   
      // console.log(resList) 
      // if(resList){
      //   this.submitedData=JSON.parse(resList)
      // }
      this._commonService.getDataByUrl(APIS.participantdata.getDataByProgramBYDeatisl+this.programIds+`?page=0&size=200`).subscribe({
        next: (res: any) => {
          this.submitedData = res?.data
          this.submitedData.map((data:any)=>{
            data['organizationName'] = data['organizationName'] ?data['organizationName']:''
          })
          this.reinitializeDataTable();
          // this.advanceSearch(this.getSelDataRange);
          // modal.close()
  
        },
        error: (err) => {
          this.toastrService.error(err.message, "Participant Data Error!");
          new Error(err);
        },
      });
      // console.log(this.submitedData)
    }
    dataTable: any;
    reinitializeDataTable() {
      if (this.dataTable) {
        this.dataTable.destroy();
      }
      setTimeout(() => {
        this.initializeDataTable();
      }, 0);
    }
    initializeDataTable() {
      const self = this;
      
      this.dataTable = $('#view-table-participant1').DataTable({
        scrollY: "415px",
        scrollX: true,
        scrollCollapse: true,
        paging: true,
        serverSide: true,
        processing: true,
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50],
        autoWidth: true,
        info: false,
        searching: false,
        ajax: (data: any, callback: any, settings: any) => {
          // Extract pagination and sorting parameters
          const page = data.start / data.length;
          const size = data.length;
          const sortColumn = data.order[0]?.column;
          const sortDirection = data.order[0]?.dir;
          const sortField = data.columns[sortColumn]?.data;
          
          // Prepare parameters for API call
          let params = `?page=${page}&size=${size}`;
          
          if (sortField && sortDirection) {
            params += `&sort=${sortField},${sortDirection}`;
          }
          
          // Add search filter if any
          if (data.search.value) {
            params += `&search=${encodeURIComponent(data.search.value)}`;
          }
          
          this._commonService.getDataByUrl(`${APIS.participantdata.getDataByProgramBYDeatisl}${this.programIds}${params}`)
            .pipe()
            .subscribe({
              next: (res: any) => {
                callback({
                  draw: data.draw,
                  recordsTotal: res.totalElements,
                  recordsFiltered: res.totalElements,
                  data: res.data.map((item: any) => ({
                    ...item,
                    organizationName: item.organizationName || ''
                  }))
                 
                });
                // console.log(data)
              },
              error: (err) => {
                this.toastrService.error(err.message, "Participant Data Error!");
                console.error(err);
                callback({
                  draw: data.draw,
                  recordsTotal: 0,
                  recordsFiltered: 0,
                  data: []
                });
              }
            });
        },
        columns: [
              { 
                title: 'S.No',
                render: function(data, type, row, meta:any) {
                  // console.log(data,meta,type, row)
                    return meta.settings?._iDisplayStart+meta.row  + 1;
                },
                className: 'text-start'
              },
              { 
                data: null,
                title: 'Actions',
                render: (data: any, type: any, row: any, meta: any) => {
                  // Use meta.row for the current displayed row index
                  // <button type="button" class="btn btn-default text-lime-green btn-sm edit-btn" data-index="${meta.row}">
                  //     <span class="bi bi-pencil"></span>
                  //   </button>
                //   <button type="button" class="btn btn-default text-danger btn-sm delete-btn" data-index="${meta.row}">
                //   <span class="bi bi-trash"></span>
                // </button>
                if (this.loginsessionDetails?.userRole == 'AGENCY_MANAGER' || this.loginsessionDetails?.userRole == 'AGENCY_EXECUTOR') {
                  return `   
                  <button type="button" class="btn btn-default text-lime-green btn-sm edit-btn" data-index="${meta.row}">
                     <span class="bi bi-pencil"></span>
                 </button>                 
                  
                 `;
                }
                else{
                  return '';
                }
                 
                },
                className: 'text-center',
                orderable: false
              },
              { 
                data: 'organizationName',
                title: 'IsAspirant',
                render: function(data, type, row) {
                  return data ? 'No' : 'Yes';
                }
              },
              { 
                data: 'organizationName',
                title: 'Organization Name',
                // render: function(data, type, row) {
                //   return row.organizationName;
                // }
              },
              { 
                data: 'participantName',
                title: 'Name of the Participant'
              },
              { 
                data: 'gender',
                title: 'Gender'
              },
              { 
                data: 'disability',
                title: 'Disability'
              },
              { 
                data: 'aadharNo',
                title: 'Aadhar No.',
                render: function(data, type, row) {
                  return data ? data : '';
                }
              },
              { 
                data: 'category',
                title: 'Category',
                render: function(data, type, row) {
                  return data ? data : '';
                }
              },
              { 
                data: 'mobileNo',
                title: 'Mobile No.',
                render: function(data, type, row) {
                  return data ? data : '';
                }
              },
              { 
                data: 'email',
                title: 'Email',
                render: function(data, type, row) {
                  return data ? data : '';
                }
              },
              { 
                data: 'designation',
                title: 'Designation/Current Trade',
                render: function(data, type, row) {
                  return data ? data : '';
                }
              },
              { 
                data: 'isParticipatedBefore',
                title: 'Previous Participant',
                render: function(data) {
                  return data === 'Y' ? 'Yes' : 'No';
                }
              },
              
              { 
                data: 'preTrainingAssessmentConducted',
                title: 'Pre-Training Assessment',
                render: function(data) {
                  return data === 'Y' ? 'Yes' : 'No';
                }
              },
              { 
                data: 'postTrainingAssessmentConducted',
                title: 'Post Training Assessment',
                render: function(data) {
                  return data === 'Y' ? 'Yes' : 'No';
                }
              },
              { 
                data: 'isCertificateIssued',
                title: 'Certificate Issue Date',
                render: function(data) {
                  return data === 'Y' ? 'Yes' : 'No';
                }
              },
              { 
                data: 'certificateIssueDate',
                title: 'Issue Date',
                render: function(data, type, row) {
                  return row?.isCertificateIssued === 'Y' ? data ? data:'' : '';
                }
              },
              { 
                data: 'needAssessmentMethodology',
                title: 'Methodology Used for Needs Assessment',
                render: function(data, type, row) {
                  return data ? data : '';
                }
              }
              // { 
              //   title: 'Edit / Delete',
              //   render: function(data, type, row, meta) {
                  
              //     return `
              //       <button type="button" class="btn btn-default text-lime-green btn-sm" onclick="editRow(${row})">
              //         <span class="bi bi-pencil"></span>
              //       </button>
              //       <button type="button" class="btn btn-default text-danger btn-sm" onclick="deleteRow(${row})">
              //         <span class="bi bi-trash"></span>
              //       </button>
              //     `;
              //   },
              //   className: 'text-center',
              //   orderable: false
              // }
            ],
        initComplete: function() {
          // Add event listeners for edit/delete buttons
          $('#view-table-participant1').on('click', '.edit-btn', function() {
            const rowData = self.dataTable.row($(this).parents('tr')).data();
            self.editRow(rowData);
          });
          
          $('#view-table-participant1').on('click', '.delete-btn', function() {
            const rowData = self.dataTable.row($(this).parents('tr')).data();
            self.deleteRow(rowData);
          });
        }
      });
    }
  
    
    deleteRow(item: any,) {
      //  this.submitedData.pop(i)
      // this.submitedData.splice(i, 1)
      console.log(this.submitedData)
      // this.submitedData.push(this.ParticipantDataForm.value)
      // sessionStorage.setItem('ParticipantData', this.submitedData)
      sessionStorage.setItem('ParticipantData', JSON.stringify(this.submitedData));
      this.getData()
    }

  editRow(item: any) {
    console.log(item, "item")
    // this.router.navigate(['add-participant-data-edit', {partId:item.participantId,program:this.programIds}]);
      this.router.navigateByUrl('/add-participant-data-edit/' + item.participantId+'-'+this.programIds);
    }
    // Upload documnet

    @ViewChild('fileInput') fileInput!: ElementRef;
    openFileUploadModal() {
      const modal1 = new bootstrap.Modal(document.getElementById('addDocumentModel'));
      modal1.show();
      this.selectedfiles=[]
       this.fileInput.nativeElement.value = ''
    }
    selectUploadedFiles: File = null!
    multipleFiles: any;
    fileName: any;
    fileSize: any;
    fileType: any;
    fileErrorMsg: any
    selectedfiles:any=[]
    file: any;
    onFilesSelected(event: any) {
      this.fileErrorMsg = '';
      this.multipleFiles = []
      this.selectedfiles = event.target.files;
      this.selectUploadedFiles = event.target.files[0];
      let formData = new FormData();
      let totalSize = 0;
      this.multipleFiles = [];
  
      for (var i = 0; i < this.selectedfiles.length; i++) {
        this.fileName = this.selectedfiles[i].name;
        this.fileSize = this.selectedfiles[i].size;
        this.fileType = this.selectedfiles[i].type;
        totalSize += this.fileSize;
  
        if (totalSize > 25 * 1024 * 1024) { // 25MB in bytes
          this.fileErrorMsg = 'Total file size exceeds 25MB';
          //this.toastrService.error('Total file size exceeds 25MB', 'File Upload Error');
          return;
        }
  
        this.multipleFiles.push(this.selectedfiles[i]);
      }
  
      if (this.multipleFiles.length > 0) {
      }
      // console.log(this.multipleFiles, 'hshshsh')
  
      // console.log(event.target.files,this.multipleFiles, "selectedFiles")
    }
    uploadManualFiles() {

      let formData = new FormData();
      // formData.append("programId", this.programIds);
      if (this.selectedfiles.length == 1) {
        formData.append("file", this.selectUploadedFiles);
      }
      else {
        //formData.set("file", this.multipleFiles);
        this.multipleFiles.forEach((file: any) => {
          formData.append("file", file);
        })
      }
  
      this._commonService.add(APIS.participantdata.uploadParticipantData+'?programId='+this.programIds, formData).pipe().subscribe(
        {
          next: (res: any) => {
            console.log(res, "res")
            this.toastrService.success(res, "Participant Data!");
            this.getData()
            this.selectedfiles=[]
            // console.log(data)
          },
          error: (err) => {
            console.log(err, "error")
            this.toastrService.success('Participant Data Uploaded successfully', "Participant Data!");
            this.getData()
            this.selectedfiles=[]
          }
        })
    }

    sessionSubmissionFinal() {
    let data = {}
    this._commonService.add(`${APIS.programCreation.updateSessionByStatus}${this.programIds}?status=Participants Added`, data).subscribe({
      next: (data: any) => {
        console.log('Response from API:', data);
        this.toastrService.success('Participants Details Submitted Successfully', "");
        this.closeConfirmSession();
        this.submitedData = ''
        this.getProgramsByAgency()
      },
      error: (err: any) => {
        this.closeConfirmSession();        
        this.toastrService.error("Something unexpected happened!!");
        new Error(err);
      },
    });    
    }

    closeConfirmSession() {
    const editSessionModal = document.getElementById('exampleModalDeleteConfirm');
    if (editSessionModal) {
      const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
      modalInstance.hide();
    }
  }
    downloadParticipant(type:any){
     let payload ='?agencyId='+(this.agencyId?this.agencyId:this.selectedAgencyId)+'&programId='+this.programIds 
    if(!this.programIds && this.selectedAgencyId){
      payload = '?agencyId='+(this.agencyId?this.agencyId:this.selectedAgencyId)
    }
    else{
      payload ='?agencyId='+(this.agencyId?this.agencyId:this.selectedAgencyId)+'&programId='+this.programIds
    }
    console.log(type,this.agencyId,this.selectedAgencyId,this.programIds,payload)
    let linkUrl =type=='excel'? APIS.participantdata.downloadParticipantDataExcel+payload:APIS.participantdata.downloadParticipantDataPdf+this.programIds
    const link = document.createElement("a");
    link.setAttribute("download", linkUrl);
    link.setAttribute("target", "_blank");
    link.setAttribute("href",linkUrl);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  }


  