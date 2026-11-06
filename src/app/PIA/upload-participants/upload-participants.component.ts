
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
import moment from 'moment';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
declare var bootstrap: any;
import { ModalService } from '@app/_services/modal.service';

@Component({
  selector: 'app-upload-participants',
  templateUrl: './upload-participants.component.html',
  styleUrls: ['./upload-participants.component.css']
})
export class UploadParticipantsComponent implements OnInit {
 ParticipantDataForm!: FormGroup;
  loginsessionDetails: any;
    agencyId: any;
    programIds:any
    @ViewChild('editParticipantModal') editParticipantModal: any;
    constructor(private fb: FormBuilder,
      private toastrService: ToastrService,
      private modalService: ModalService,
      private _commonService: CommonServiceService, private router: Router,) { 
        this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
      }
  
    ngOnInit(): void {
      this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');  
       this.loadOrganizations()
    this.formDetails();
    //this.getData()
    
    //this.getAllPrograms()
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
      this._commonService.getDataByUrl(APIS.participantdata.getDataUploadedByProgramBYDeatisl+this.programIds).subscribe({
        next: (res: any) => {
          this.submitedData = res?.data
          this.submitedData.map((data:any)=>{
            data['organizationName'] = data['organizationName'] ?data['organizationName']:''
             data['errorMessage'] = data['errorMessage'] ?data['errorMessage']:''
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
            this.dataTable = new DataTable('#view-table-participant1', {
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
              paging: true,
              info: false,
              searching: false,
              destroy: true, // Ensure reinitialization doesn't cause issues
            });
          }
    initializeDataTableb() {
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
          
          this._commonService.getDataByUrl(`${APIS.participantdata.getDataUploadedByProgramBYDeatisl}${this.programIds}`)
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
              // { 
              //   data: null,
              //   title: 'Actions',
              //   render: (data: any, type: any, row: any, meta: any) => {
              //     // Use meta.row for the current displayed row index
              //     // <button type="button" class="btn btn-default text-lime-green btn-sm edit-btn" data-index="${meta.row}">
              //     //     <span class="bi bi-pencil"></span>
              //     //   </button>
              //   //   <button type="button" class="btn btn-default text-danger btn-sm delete-btn" data-index="${meta.row}">
              //   //   <span class="bi bi-trash"></span>
              //   // </button>
              //   if (this.loginsessionDetails?.userRole == 'AGENCY_MANAGER' || this.loginsessionDetails?.userRole == 'AGENCY_EXECUTOR') {
              //     return `   
              //     <button type="button" class="btn btn-default text-lime-green btn-sm edit-btn" data-index="${meta.row}">
              //        <span class="bi bi-pencil"></span>
              //    </button>                 
                  
              //    `;
              //   }
              //   else{
              //     return '';
              //   }
                 
              //   },
              //   className: 'text-center',
              //   orderable: false
              // },
               { 
                data: 'errorMessage',
                title: 'Error Message',
                 render: function(data, type, row) {
                  return data ? data : '';
                }
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
        // initComplete: function() {
        //   // Add event listeners for edit/delete buttons
        //   $('#view-table-participant1').on('click', '.edit-btn', function() {
        //     const rowData = self.dataTable.row($(this).parents('tr')).data();
        //     self.editRow(rowData);
        //   });
          
        //   $('#view-table-participant1').on('click', '.delete-btn', function() {
        //     const rowData = self.dataTable.row($(this).parents('tr')).data();
        //     self.deleteRow(rowData);
        //   });
        // }
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
EditProgramId:any=false
  editRow(item: any) {
    console.log(item, "item")
    this.getDataByMobileNumber(item.mobileNo)
    this.EditProgramId= item?.programIds?.[0]
      this.isedit=true
    this.participantId=item.participantId
   console.log(this.OrganizationData)
    this.ParticipantDataForm.patchValue({ ...item,programIds :item.programIds?.[0],certificateIssueDate: item.certificateIssueDate?this.convertToISOFormat(item.certificateIssueDate):'',isAspirant:item.organizationId?'Existing Oragnization':'Aspirant',organizationId:item.organizationId})
    this.modalService.openModal(this.editParticipantModal, {
    centered: true,
    size: 'xl',
    scrollable: true
  });
    }

    OragnizationList(event: any) {
    if (event.target.value === 'Existing Oragnization') {
      this.loadOrganizations();
    }
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
            this.toastrService.success('Participant Data Uploaded successfully', "Participant Data!");
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
    let data = [this.programIds]
    this._commonService.add(`${APIS.participantdata.migrateApi}`, data).subscribe({
      next: (data: any) => {
        console.log('Response from API:', data);
        this.toastrService.success('Data Moved participant table successfully', "");
        this.closeConfirmSession();
        this.submitedData = ''
        this.getData()
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
    console.log(type,this.agencyId,this.selectedAgencyId,this.programIds)
     let payload ='?agencyId='+this.agencyId?this.agencyId:this.selectedAgencyId+'&programId='+this.programIds 
    if(!this.programIds && this.selectedAgencyId){
      payload = '?agencyId='+this.agencyId?this.agencyId:this.selectedAgencyId
    }
    else{
      payload ='?agencyId='+this.agencyId?this.agencyId:this.selectedAgencyId+'&programId='+this.programIds
    }
   
    let linkUrl =type=='excel'? APIS.participantdata.downloadParticipantDataExcel+payload:APIS.participantdata.downloadParticipantDataPdf+this.programIds
    const link = document.createElement("a");
    link.setAttribute("download", linkUrl);
    link.setAttribute("target", "_blank");
    link.setAttribute("href",linkUrl);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  // delete
     deleteProgramId:any ={}
       deleteTemp(item: any) {
        
         this.deleteProgramId = item?.participantId
           document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
          const myModal = new bootstrap.Modal(document.getElementById('exampleModalDeleteProgram'));
           myModal.show();
       
     }
  
       ConfirmdeleteExpenditure(item:any){
         this._commonService
         .deleteId(APIS.participantdata.deleteTempParticipant,item).subscribe({
           next: (data: any) => {
             this.getData()
              this.reinitializeDataTable();
               this.closeModalDelete();
               this.deleteProgramId =''
             this.toastrService.success( data, "Participant Data Success!");
             
           },
           error: (err) => {
             this.closeModalDelete();
              this.getData()
              this.reinitializeDataTable();
             this.deleteProgramId ={}
             this.toastrService.success(err, "Participant Data Error!");
             new Error(err);
           },
         });
   
       }
       
       closeModalDelete(): void {
  
        const editSessionModal = document.getElementById('exampleModalDeleteProgram');
      if (editSessionModal) {
        const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
        modalInstance.hide();
      }
  
        // const myModal = bootstrap.Modal.getInstance(document.getElementById('exampleModalDelete'));
        // myModal.hide();
       } 


      //  edit participant
        programData:any={}
  getProgramDetailsById(ProgrmId:any){
    this.programData={}
    this._commonService.getById(APIS.programCreation.getSingleProgramsList, ProgrmId).subscribe({
      next: (data: any) => {
        this.programData = data.data;
        
      },
      error: (err: any) => {
        this.toastrService.error(err.message, "Error fetching program details!");
      }
    });
  }
       selectedItems: any[] = [];
          dropdownList1=[];
          dropdownListOrg=[];
          dropdownSettingsOrg: IDropdownSettings = {};
          assignFluidData1Org() {
            this.dropdownSettingsOrg = {
                singleSelection: true,
                idField: 'organizationId',
                textField: 'organizationName',
                itemsShowLimit: 1,
                allowSearchFilter: true,
                clearSearchFilter: true,
                maxHeight: 197,
                searchPlaceholderText: "Search Organization",
                noDataAvailablePlaceholderText: "Data Not Available",
                closeDropDownOnSelection: false,
                showSelectedItemsAtTop: false,
                defaultOpen: false,
            };
            this.dropdownListOrg = this.OrganizationData;
           
          //   this.contractListObj.area= this.selectMapList1;
        }
        onItemSelectOrg(item: any) {
      console.log('Item selected:', item);
    }
  
  
    onItemDeSelectOrg(item: any) {
      console.log('Item deselected:', item);
    }
  
      get f2() {
    return this.ParticipantDataForm.controls;
  }
       formDetails() {
    this.ParticipantDataForm = new FormGroup({
      // date: new FormControl("", [Validators.required]),
      isAspirant: new FormControl("Aspirant", [Validators.required]),
      organizationId: new FormControl("",),
      participantName: new FormControl("", [Validators.required,Validators.pattern(/^[A-Za-z][A-Za-z .]*$/)]), //Validators.required
      gender: new FormControl("", [Validators.required,]),
      disability: new FormControl("N", [Validators.required]),
      // noOfDays: new FormControl("", [Validators.required,]),
      category: new FormControl("",[Validators.required,]),
      aadharNo: new FormControl("", [Validators.pattern(/^[0-9]{12}$/)]),
      mobileNo: new FormControl("", [Validators.required, Validators.pattern(/^[6789]\d{9}$/)]),
      email: new FormControl("", [Validators.email]),
      designation: new FormControl("", ),
      isParticipatedBefore: new FormControl("",),
      previousParticipationDetails: new FormControl("",),
      preTrainingAssessmentConducted: new FormControl("",),
      postTrainingAssessmentConducted: new FormControl("",),
      isCertificateIssued: new FormControl("N",),
      certificateIssueDate: new FormControl("",),
      needAssessmentMethodology: new FormControl("",),
      programIds: new FormControl("", [Validators.required,]),
    
      // TargetSector: new FormControl("",[Validators.required,]),
      // targetAudience: new FormControl("",[Validators.required,]),
      // targetNoOfParticipants: new FormControl("",[Validators.required,]),
    });
  }
   isedit:any=false
  participantId:any=''
  convertToISOFormat(date: string): string {
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
  }
 programList: any;
  getAllPrograms() {
    this.programList = []
    this._commonService.getDataByUrl(APIS.programCreation.getProgramsList).subscribe({
      next: (res: any) => {
        this.programList = res?.data
        this.programIds = this.programList[0]?.programId
        this.getData()
      },
      error: (err) => {
        new Error(err);
      }
    })
  }
  //  OrganizationData: any = []
  // getOrganizationData() {
  //   this._commonService.getDataByUrl(APIS.participantdata.getOrgnizationDataOnlyId).subscribe({
  //     next: (res: any) => {
  //       this.OrganizationData = res?.data
  //       this.assignFluidData1Org()
  //       // this.submitedData=res?.data?.data
  //       // this.advanceSearch(this.getSelDataRange);
  //       // modal.close()

  //     },
  //     error: (err) => {
  //       this.toastrService.error(err.message, "Organization Data Error!");
  //       new Error(err);
  //     },
  //   });
  // }
   OrganizationData: any = []
  filteredOrganizationData: any = []
  searchValue: boolean = true;
  loadOrganizations(Orgvalue?:any) {
    this._commonService.getDataByUrl(APIS.participantdata.getOrgnizationDataOnlyPagination + '?page=0&size=500').subscribe({
      next: (res: any) => {
        this.OrganizationData = res?.data;
        this.filteredOrganizationData = this.OrganizationData.slice();
         this.f2['organizationId'].patchValue(Orgvalue?.organizationId);
      },
      error: (err) => {
        this.toastrService.error(err.message, "Organization Data Error!");
      }
    });
  }

 onSearchChange(event: any) {
    const filterValue = event?.toLowerCase();
    if (filterValue.length >= 2) {
      this.searchValue = false;
      this._commonService.getDataByUrl(APIS.participantdata.getOrgnizationDataOnlyPagination + '?search=' + event + '&page=0&size=500')
        .subscribe({
          next: (res: any) => {
            this.OrganizationData = res?.data;
            this.filteredOrganizationData = this.OrganizationData.slice();
          },
          error: (error: any) => {
            this.filteredOrganizationData = [];
          }
        });
    } else {
      this.searchValue = true;
      this.filteredOrganizationData = this.OrganizationData.slice();
    }
  }
   DefaultDisabled: boolean = false;
  previousParticipationDetails: any = {};
  getDataByMobileNumber(MobileNumber:any){
    this.previousParticipationDetails={}
    if(MobileNumber.length==10){
      this.DefaultDisabled=false
      this._commonService.getById(APIS.captureOutcome.getParticipantData,MobileNumber).subscribe({
        next: (res: any) => {
          console.log(res)
          if(res.status==400){
            this.previousParticipationDetails={}
            this.ParticipantDataForm.reset()
            this.ParticipantDataForm.patchValue({mobileNo:MobileNumber})
          }
          else{
            let item = res?.data;
            this.previousParticipationDetails = item;
            if(!this.isedit){
              this.ParticipantDataForm.patchValue({ ...item, certificateIssueDate: item.certificateIssueDate?this.convertToISOFormat(item.certificateIssueDate):'',isAspirant:item.organizationId?'Existing Oragnization':'Aspirant',organizationId:this.OrganizationData.filter((data:any)=>{
                if(data.organizationId==item?.organizationId){
                      return data
                    }
              })})
            }
            
          }
         
        },
        error: (err) => {
          this.previousParticipationDetails={}
          this.ParticipantDataForm.reset()
            this.ParticipantDataForm.patchValue({mobileNo:MobileNumber})
          new Error(err);
        }
      })
    }
    else{
      
    }
 
}
  Submitform() {
      
      let payload:any={...this.ParticipantDataForm.value, "programIds": [this.ParticipantDataForm.value.programIds], "organizationId": this.ParticipantDataForm.value.organizationId?.[0]?.organizationId }
     console.log(typeof payload['programIds'])
      if(this.f2['isAspirant'].value!='Existing Oragnization'){
      delete payload['organizationId']
    }
    if(payload['isCertificateIssued']=='N'){
      delete payload['certificateIssueDate'];
    }
    else{
      payload['certificateIssueDate']=payload['certificateIssueDate']?moment(payload['certificateIssueDate']).format('DD-MM-YYYY'):null
    }
     
      this.submitedData.push(this.ParticipantDataForm.value)
      // sessionStorage.setItem('ParticipantData', this.submitedData)
  
      sessionStorage.setItem('ParticipantData', JSON.stringify(this.submitedData));
    
     if(Object?.keys(this.previousParticipationDetails)?.length){
        payload['programIds']=[...payload.programIds,...this.previousParticipationDetails?.programIds]
      }
      // payload['programIds']=[this.ParticipantDataForm.value.programIds]
      this._commonService
          .update(APIS.participantdata.updateTempParticipant, payload,this.participantId).subscribe({
        next: (data: any) => {
          if(data?.status==400){
            this.toastrService.error(data?.message, "Participant Data Error!");
          }
          else{
            // this.advanceSearch(this.getSelDataRange);
           this.programIds = this.ParticipantDataForm.value.programIds?this.ParticipantDataForm.value.programIds:this.programList[0]?.programId
          //  this.getData()
           this.isedit=false
           this.participantId=''
           this.ParticipantDataForm.reset()
           this.formDetails()
         
           // modal.close()
           this.toastrService.success('Participant Data updated Successfully', "Participant Data Success!");
          }
            this.getData()
          this.closeModalEdit()
        },
        error: (err) => {
          this.ParticipantDataForm.reset()
          this.isedit=false
          this.closeModalEdit()
          this.getData()
          this.formDetails()
          this.toastrService.error(err.message, "Participant Data Error!");
          new Error(err);
        },
      });
      //this.getData()  
    }
      closeModalEdit(): void {
  this.modalService.closeModal(this.editParticipantModal);
  this.ParticipantDataForm.reset();
  this.isedit = false;
  
        // const myModal = bootstrap.Modal.getInstance(document.getElementById('exampleModalDelete'));
        // myModal.hide();
       } 
  }


  