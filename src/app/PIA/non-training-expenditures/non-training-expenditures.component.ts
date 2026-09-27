 import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
   import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
   import { Router } from '@angular/router';
   import { CommonServiceService } from '@app/_services/common-service.service';
   import { API_BASE_URL, APIS } from '@app/constants/constants';
   import { ToastrService } from 'ngx-toastr';
   import DataTable from 'datatables.net-dt';
   import 'datatables.net-buttons-dt';
   import 'datatables.net-responsive-dt';
 import moment from 'moment';
   declare var bootstrap: any;

@Component({
  selector: 'app-non-training-expenditures',
  templateUrl: './non-training-expenditures.component.html',
  styleUrls: ['./non-training-expenditures.component.css']
})
export class NonTrainingExpendituresComponent implements OnInit {

   loginsessionDetails: any;
   agencyId: any;
   programIds:any
   activeTab:any;
   
    @ViewChild('addRemarks') addRemarks!: ElementRef;
   constructor(private fb: FormBuilder,
     private toastrService: ToastrService,
     private _commonService: CommonServiceService, private router: Router,) { 
      this.financialForm = this.createForm();
       this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
     }
 
   ngOnInit(): void {
     this.formDetailsRemark()
      this.formDetails()
     this.formDetailsPre()
     this.formDetailsBulk()
      this.getHeadOfExpenditure()
     
     this.activeTab = 'nav-five';
     this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');  
     if(this.loginsessionDetails.userRole == 'ADMIN' || this.loginsessionDetails.userRole == 'FINANCE'){ 
       this.getAgenciesList()
     }
     else{
        this.getBudgetHeadList( this.loginsessionDetails.agencyId)
     }
   
   }
 
 
   agencyList:any;
   agencyListFiltered:any;
   // All Agency data  for admin login
 getAgenciesList() {
   this.agencyList = [];
   this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe((res: any) => {
     this.agencyList = res.data;
     this.agencyListFiltered= this.agencyList;
     this.agencyId = res.data[0].agencyId
    //  this.getProgramsByAgencyAdmin(this.agencyId)
      this.getBudgetHeadList(this.agencyId)
   }, (error) => {
     this.toastrService.error(error.error.message);
   });
 } 
 selectedSubActivity:any
 FilterActivityList:any
  budgetHeadList: any;
     getBudgetHeadList(event:any) {
      this.agencyId=event
      this.SubActivityList = []
        this.FilterActivityList = []
         this._commonService.getDataByUrl(APIS.nontrainingtargets.getBudgetHeadList+this.agencyId).subscribe((res: any) => {
           this.budgetHeadList = res;
           this.FilterActivityList = res;
           this.onActivityChange(this.budgetHeadList[0]?.activityId)
         
         }, (error) => {
           // this.toastrService.error(error.message);
         });
       }
       selectedActivity:any
       SubActivityList:any=[]
       FilterSubActivityList:any=[]

       onActivityChange(event: any) {
        
        this.FilterSubActivityList = []
        this.SubActivityList=[]
         this.selectedActivity=event
         this.selectedSubActivity=[]
          this._commonService.getDataByUrl(APIS.nontrainingtargets.getSubActivityList+event).subscribe((res: any) => {
           this.SubActivityList = res;
           this.FilterSubActivityList = res;
           this.selectedSubActivity= this.SubActivityList[0]?.subActivityId
           this.getExpenditure( this.selectedSubActivity)

          //  this.onBudgetHeadChange(this.SubActivityList[0]?.subActivityId)
         
         }, (error) => {
           // this.toastrService.error(error.message);
         });
       }
   // All Programs data for admin login
   agencyProgramList: any;
   agencyProgramListFiltered:any;
   getProgramsByAgencyAdmin(agency:any) {
     if(agency == 'All Agencies') {
       this.programIds = 'All Programs'
       this.agencyProgramList=[]
       this.agencyProgramListFiltered=[]
      // this.getExpenditure()
     }
     else{
       this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgencyStatus}/${agency}?status=Program Expenditure Updated`).subscribe({
         next: (data: any) => {
           this.agencyProgramList = data?.data
           this.agencyProgramListFiltered = this.agencyProgramList
           this.programIds = this.agencyProgramList?.[0]?.programId
           console.log(this.agencyProgramList,this.agencyProgramList.length)
           if(!this.agencyProgramList.length) {
             this.ProgramData=[]
             this.TotalAmount=0
             this.getExpenditureDataBoth=[]
 
           }
           else{
            // this.getExpenditure()
           }
           
         },
         error: (err) => {
           console.error('Error loading programs:', err);
         }
       });
   
     }
     
   }
   // get programs by  Agency login
   getProgramsByAgency() {
     this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgencyStatus}/${this.agencyId}?status=Program Expenditure Updated`).subscribe({
       next: (data: any) => {
         this.agencyProgramList = data?.data
         this.agencyProgramListFiltered=this.agencyProgramList
         this.programIds = this.agencyProgramList[0].programId
        //  this.getExpenditure()
       },
       error: (err) => {
         console.error('Error loading programs:', err);
       }
     });
     
   }
   dropdownProgramsList(event: any, type: any) {
     this.programIds = event.value
     if(event.value == 'All Programs') {
      //  this.getExpenditure()
 
     }
     else{
       if (type == 'table' && event.value) {
        //  this.getExpenditure()
       }
     }
     
   }
 
   // Participant Related Data starte
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
         let Url:any=''
         // Add search filter if any
         if (data.search.value) {
           params += `&search=${encodeURIComponent(data.search.value)}`;
         }
         if(this.agencyId=='All Agencies') {
           Url=APIS.participantdata.getDataByProgramBYDeatisl+-1+params
         }
         else if(this.programIds == 'All Programs') {
           Url=APIS.participantdata.getDataByProgramBYDeatisl+-2+'?agencyId='+this.agencyId+'&page='+page+'&size='+size
         }
         else{
          Url=APIS.participantdata.getDataByProgramBYDeatisl+this.programIds+params
         }
         this._commonService.getDataByUrl(Url)
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
      
     });
   }
   // ending of participants
 
   // AttendanceData data end
   // expenditure data start
   getExpenditureData:any=[]
   getExpenditureDataBoth:any=[]
   TotalAmount:any=0
   getExpenditure(event:any){
    this.selectedSubActivity=event
     this.getExpenditureDataBoth=[]
     this.TotalAmount=0
     if(this.selectedSubActivity=='125'){
             this.getResourceList()
             this.getContingencyDataById()
            
           }
     if(this.selectedSubActivity){ 
       this._commonService
         .getDataByUrl(APIS.programExpenditure.getExpenditureNonTraining+'?nonTrainingActivityId='+this.selectedSubActivity).subscribe({
           next: (data: any) => {
            if(data?.data){
             this.getExpenditureData=data?.data
             this.getExpenditureDataBoth=[...this.getExpenditureDataBoth,...data?.data]
             // this.getExpenditure()
            //  this.getPost()
             this.reinitializeDataTable();
             this.getExpenditureData?.map((item:any)=>{
 
               this.TotalAmount+=item?.expenditureAmount
 
             })
            }
            else{
            //  this.getPost()
            }
             
           },
           error: (err) => {
            //  this.getPost()
             this.toastrService.error(err.message, " Expenditure Data Error!");
             new Error(err);
           },
         });
         
     }
     
   }
        resourceList:any=[]
    getResourceList(){
         this.resourceList=[]
           this._commonService.getDataByUrl(APIS.nontrainingtargets.getResourceList+this.selectedSubActivity).subscribe((res: any) => {
               this.resourceList=res.data;
              
           
           }, (error) => {
             // this.toastrService.error(error.message);
           });
       }
       travelList:any=[]
       getTravelDataBySubActive(){
            this.travelList=[]
           this._commonService.getDataByUrl(APIS.nontrainingtargets.getTravelList+this.selectedSubActivity).subscribe((res: any) => {
               this.travelList=res.data;
            //    this.financialTargetAchievement=0
            //  this.travelList?.map((item:any)=>{
            //    this.financialTargetAchievement+=Number(item?.amount)
            //  })
              
           
           }, (error) => {
             // this.toastrService.error(error.message);
           });
       }
       getContingencyData:any=[]
        getContingencyDataById(){
          this.getContingencyData=[]
          this._commonService.getDataByUrl(APIS.nontrainingtargets.getNonTrainingtargetsAleapContingencyId+this.selectedSubActivity).subscribe((res: any) => {
             this.getContingencyData=res.data;
         
         }, (error) => {
           // this.toastrService.error(error.message);
         });
       }
       getPaymentsData:any=[]
        getPaymentsDataById(){
         this.getPaymentsData=[]
          this._commonService.getDataByUrl(APIS.nontrainingtargets.getNonTrainingtargetsAleapPaymentsId+this.selectedSubActivity).subscribe((res: any) => {
             this.getPaymentsData=res.data;

         }, (error) => {
           // this.toastrService.error(error.message);
         });
       }
   getPost(){
     this._commonService
         .getDataByUrl(APIS.programExpenditure.getExpenditureNonTraining+'?programId='+this.programIds+'&expenditureType='+'POST'+'&agencyId='+this.agencyId).subscribe({
           next: (data: any) => {
            if(data?.data){
             this.getExpenditureData=data?.data
             this.getExpenditureDataBoth=[...this.getExpenditureDataBoth,...data?.data]
             this.getBulkExpenditure()
             // this.reinitializeDataTable();
             this.getExpenditureData?.map((item:any)=>{
               this.TotalAmount+=item?.cost
             })
            }
            else{
             this.getBulkExpenditure()
            }
             
           },
           error: (err) => {
             this.getBulkExpenditure()
             this.toastrService.error(err.message, " Expenditure Data Error!");
             new Error(err);
           },
         });
   }
   getBulkExpenditureData:any=[]
   getBulkExpenditure(){
   
    
     if(this.programIds){
       this._commonService
       .getDataByUrl(APIS.programExpenditure.getBulkExpenditureByProgramId+'?programId='+this.programIds).subscribe({
         next: (data: any) => {
           if(data?.data){
             this.getExpenditureDataBoth=[...this.getExpenditureDataBoth,...data?.data]
              console.log( this.getExpenditureData,data?.data,this.getExpenditureDataBoth)
             this.getBulkExpenditureData=data?.data
             this.getBulkExpenditureData?.map((item:any)=>{
               // this.BulkTotalUnitCost+=item?.unitCost
               this.TotalAmount+=item?.allocatedCost
             })
           }
          
           console.log(this.TotalAmount)
         },
         error: (err) => {
           
           this.toastrService.error(err.message, " Expenditure Data Error!");
           new Error(err);
         },
       });
     }
    
   }
 
   // expenditure ends
   // session starts
   collapseStates: { [key: number]: boolean } = {};
 
   toggleIcon(index: number): void {
     this.collapseStates[index] = !this.collapseStates[index];
   }
   ProgramData: any
   getProgramDetailsById(programId: string) {
     this.ProgramData = []
     this._commonService.getById(APIS.programCreation.getSingleProgramsList, programId).subscribe({
       next: (data: any) => {
         this.ProgramData = data.data;
       }
       , error: (err: any) => {
         new Error(err);
       }
     })
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
   previewData:any;
   cacheBuster = new Date().getTime();
   async showPreviewPopup(dataList: any) {
     this.previewData = ''
     let url = `${API_BASE_URL}/program/file/download/${dataList.programSessionFileId}`
     this.previewData = url
    
    
   }
   RemarkForm!: FormGroup;
   get fRemark() {
     return this.RemarkForm.controls;
   }
   formDetailsRemark() {
     if(this.loginsessionDetails?.userRole == 'ADMIN' || this.loginsessionDetails?.userRole == 'FINANCE'){
        this.RemarkForm = new FormGroup({
       spiuComments: new FormControl("", [Validators.required]),
       agencyComments: new FormControl("", ),
       status:new FormControl("", [Validators.required]),
       userId:new FormControl("")
       
     })
     }
     else{
       this.RemarkForm = new FormGroup({
       spiuComments: new FormControl("", ),
       agencyComments: new FormControl("", [Validators.required]),
       status:new FormControl("",),
       userId:new FormControl("")
       
     })
     }
    
   }
   imageUrlDownloadPath = `https://metaverseedu.in/`;
   imagePreviewUrl: any
    type:any=''
     showImagePreview(url: any, value: string,type:any) {
     this.type=type
     this.imagePreviewUrl = null; // Reset the image preview URL
     this.imagePreviewUrl = url + value;
 
     const editSessionModal = document.getElementById('imagePreview');
     if (editSessionModal) {
       const modalInstance = new bootstrap.Modal(editSessionModal);
       modalInstance.show();
     }
   }
   nonTrainingExpenditureId:any
   expenditureType:any
 openRemarks(item:any){
   this.RemarkForm.reset()
     item?.status?this.fRemark['status'].patchValue(item?.status):this.fRemark['status'].patchValue('')
     this.expenditureType=item?.expenditureType
      if(item?.expenditureType=='PRE' || item?.expenditureType=='POST'){
          this.nonTrainingExpenditureId=item?.id
     }
      else{
       this.nonTrainingExpenditureId=item?.id
               
     }
         const previewModal = document.getElementById('addRemarksModel');
     if (previewModal) {
       const modalInstance = new bootstrap.Modal(previewModal);
       modalInstance.show();
     }
     }
 
     SubmitRemarks(){
       let payload:any
       let url:any=APIS.programExpenditure.saveRemarksNonTraining
       if(this.expenditureType=='PRE' || this.expenditureType=='POST'){
         if(this.loginsessionDetails?.userRole != 'ADMIN' && this.loginsessionDetails?.userRole != 'FINANCE'){
            url=APIS.programExpenditure.saveRemarks
         }
         else{
           url=APIS.programExpenditure.saveRemarksNonTraining+'?status='+this.fRemark['status'].value
         }
         
         if(this.loginsessionDetails?.userRole == 'ADMIN' || this.loginsessionDetails?.userRole == 'FINANCE'){
             payload={
             "userId": this.loginsessionDetails?.userId,
             "spiuComments": this.fRemark['spiuComments'].value,
             "nonTrainingExpenditureId": this.nonTrainingExpenditureId,

        }
        
         }
         else{
           payload={
             "userId": this.loginsessionDetails?.userId,
             "agencyComments": this.fRemark['agencyComments'].value,
             "nonTrainingExpenditureId": this.nonTrainingExpenditureId
        }
       
       }
     }
       else{
         if(this.loginsessionDetails?.userRole != 'ADMIN' && this.loginsessionDetails?.userRole != 'FINANCE'){
            url=APIS.programExpenditure.saveRemarksNonTraining
         }
         else{
             url=APIS.programExpenditure.saveRemarksNonTraining+'?status='+this.fRemark['status'].value
         }
       
           if(this.loginsessionDetails?.userRole == 'ADMIN' || this.loginsessionDetails?.userRole == 'FINANCE'){
             payload={
             "userId": this.loginsessionDetails?.userId,
             "spiuComments": this.fRemark['spiuComments'].value,
             "nonTrainingExpenditureId": this.nonTrainingExpenditureId
        }
        
         }
         else{
           payload={
             "userId": this.loginsessionDetails?.userId,
             "agencyComments": this.fRemark['agencyComments'].value,
             "nonTrainingExpenditureId": this.nonTrainingExpenditureId
        }
       
       }
       }
   
             this._commonService.updatedata(url,payload).subscribe({
             next: (res: any) => {
              this.getExpenditure(this.selectedSubActivity)
               this.toastrService.success('Data Added Successfully', "Non Trainig Expenditure Data!");
             },
             error: (err) => {
                this.getExpenditure(this.selectedSubActivity)
               this.toastrService.error(err.message, "Non TrainigExpenditure Data Error!");
               new Error(err);
             },
           });
             const editSessionModal = document.getElementById('addRemarksModel');
               if (editSessionModal) {
                 const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
                 modalInstance.hide();
               }
 
             }
   downloadPDF(url:any){
     let linkUrl = 'https://metaverseedu.in/'+url
     const link = document.createElement("a");
     link.setAttribute("download", linkUrl);
     link.setAttribute("target", "_blank");
     link.setAttribute("href", linkUrl);
     document.body.appendChild(link);
     link.click();
     link.remove();
   }
   downloadImage(url:any) {
   const imageUrl = 'https://metaverseedu.in/'+url;
 
   // const fileName = 'ProgramScreenshot.png'; // Optional: rename the file
 
   const link = document.createElement('a');
   link.href = imageUrl;
   link.download = imageUrl;
 
   // Required for cross-origin download support
   link.target = '_blank';
 
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
 }
 
 
 
 
 // expenditure 
 
 
 
 
 
   // ngOnInit(): void {
   //   this.getHeadOfExpenditure()
   //   this.getAllActivityList()
   //   this.getProgramTypeData();
   //   this.onAgencyChange()
    
     
    
   //   this.programCreationMain.controls['activityId'].valueChanges.subscribe((activityId: any) => {
   //     if (activityId) this.getSubActivitiesList(activityId);
   //   });
   // }
 
   get f2() {
     return this.programCreationMain.controls;
   }
   get fPre() {
     return this.PrePostExpenditureForm.controls;
   }
   get fBulk() {
     return this.BulkExpenditureForm.controls;
   }
   @ViewChild('addPreEventModal') PreEventModal!: ElementRef;
   @ViewChild('BulkEvenModal') BulkEvenModal!: ElementRef;
   activityList: any
   subActivitiesList: any
   programCreationMain!: FormGroup;
   
   BulkExpenditureForm!: FormGroup;
   PrePostExpenditureForm!: FormGroup;
   ExpenditureData:any=[]
   getHeadOfExpenditure() {
     this._commonService.getDataByUrl(APIS.programExpenditure.getHeadOfExpenditure).subscribe({
       next: (data: any) => {
         this.ExpenditureData = data;
       },
       error: (err: any) => {
         this.ExpenditureData = [];
       }
     })
   }
   programData:any={}
 
   getAllActivityList() {
     this.subActivitiesList = []
     this._commonService.getById(APIS.programCreation.getActivityListbyId,  this.agencyId? this.agencyId:this.agencyId).subscribe({
       next: (data: any) => {
         this.activityList = data.data;
       },
       error: (err: any) => {
         this.activityList = [];
       }
     })
   }
 
   getSubActivitiesList(activityId: any) {
     this._commonService.getDataByUrl(`${APIS.programCreation.getSubActivityListByActivity + '/' + activityId}`).subscribe({
       next: (data: any) => {
         this.subActivitiesList = data.data.subActivities;
         if(this.programData?.subActivityId){
           this.programCreationMain.get('subActivityId')?.setValue(Number(this.programData?.subActivityId))
         }
       },
       error: (err: any) => {
         this.subActivitiesList = [];
       }
     })
   }
  // Load Programs
  programs:any
  onAgencyChange(): void {
   this.programs = [];
   if (this.agencyId) {
     this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgencyStatus}/${this.agencyId}?status=Program Execution Updated`).subscribe({
       next: (data: any) => {
         this.programs = data.data;
       },
       error: (err) => {
         console.error('Error loading programs:', err);
       }
     });
   }
 }
   formDetails() {
     this.programCreationMain = new FormGroup({
       activityId: new FormControl("", [Validators.required]),
       subActivityId: new FormControl("", [Validators.required]),
       programId: new FormControl("", [Validators.required]),
       expenditureType: new FormControl("PRE", [Validators.required]),
     })
   }
   
   formDetailsPre() {
     // {
 
     //   "activityId": 1,
     //   "subActivityId": 2,
     //   "programId": 1,
     //   "agencyId": 1,
     //   "expenditureType": "POST",
     //   "headOfExpenseId": 3,
     //   "cost": 15000.75,
     //   "billNo": 12345,
     //   "billDate": "2025-04-15",
     //   "payeeName": "ABC Constructions",
     //   "bankName": "State Bank of India",
     //   "ifscCode": "SBIN0001234",
     //   "modeOfPayment": "BANK_TRANSFER",
     //   "purpose": "Infrastructure Development",
     //   "uploadBillUrl": "https://example.com/uploads/bill12345.pdf"
     // }
     this.PrePostExpenditureForm = new FormGroup({
       headOfExpenseId: new FormControl("", [Validators.required]),
       billNo: new FormControl("", [Validators.required,Validators.pattern(/^[^\s].*/)]),
       cost: new FormControl("", [Validators.required,Validators.pattern(/^(0*[1-9]\d*(\.\d+)?|0+\.\d*[1-9]\d*)$/)]),
       billDate: new FormControl("", [Validators.required]),
       payeeName: new FormControl("", [Validators.required]),
       bankName: new FormControl("", ),
       transactionId: new FormControl("", [Validators.pattern(/^[^\s].*/)]),
       ifscCode: new FormControl("", [Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]),
       modeOfPayment: new FormControl("", [Validators.required]),
       purpose: new FormControl("", ),
       checkDate:new FormControl("", [Validators.required]),
       checkNo:new FormControl("", [Validators.pattern(/^[0-9]\d*$/)]),
       uploadBillUrl: new FormControl("", ),
     
     })
   }
   // Mode of payment
   modeOfPayment(val:any){
     if(val=='CASH'){
       this.PrePostExpenditureForm.get('bankName')?.setValidators(null);
       this.PrePostExpenditureForm.get('transactionId')?.setValidators(null);
       this.PrePostExpenditureForm.get('ifscCode')?.setValidators(null);
       this.PrePostExpenditureForm.get('bankName')?.patchValue('');
       this.PrePostExpenditureForm.get('checkNo')?.setValidators(null);
       this.PrePostExpenditureForm.get('checkDate')?.setValidators(null);
       this.PrePostExpenditureForm.get('transactionId')?.patchValue('');
       this.PrePostExpenditureForm.get('ifscCode')?.patchValue('');
       this.PrePostExpenditureForm.get('bankName')?.clearValidators();
       this.PrePostExpenditureForm.get('transactionId')?.clearValidators();
       this.PrePostExpenditureForm.get('ifscCode')?.clearValidators();
       this.PrePostExpenditureForm.get('bankName')?.disable();
       this.PrePostExpenditureForm.get('transactionId')?.disable();
       this.PrePostExpenditureForm.get('ifscCode')?.disable();
       this.PrePostExpenditureForm.get('checkNo')?.patchValue('');
       this.PrePostExpenditureForm.get('checkDate')?.patchValue('');
       this.PrePostExpenditureForm.get('bankName')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('transactionId')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('ifscCode')?.updateValueAndValidity();
        this.PrePostExpenditureForm.get('checkNo')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('checkDate')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('cost')?.setValidators([Validators.required, Validators.min(0), Validators.max(5000)]);
       this.PrePostExpenditureForm.get('cost')?.updateValueAndValidity();

     }
     else if(val=='BANK_TRANSFER'){
       this.PrePostExpenditureForm.get('bankName')?.setValidators([Validators.required]);
       this.PrePostExpenditureForm.get('transactionId')?.setValidators(null);
       this.PrePostExpenditureForm.get('ifscCode')?.setValidators([Validators.required,Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]);
       this.PrePostExpenditureForm.get('checkNo')?.setValidators(null);
         this.PrePostExpenditureForm.get('checkDate')?.setValidators(null);
       this.PrePostExpenditureForm.get('bankName')?.enable();
       this.PrePostExpenditureForm.get('transactionId')?.disable();
       this.PrePostExpenditureForm.get('ifscCode')?.enable();
       this.PrePostExpenditureForm.get('bankName')?.patchValue('');
       this.PrePostExpenditureForm.get('transactionId')?.patchValue('');
       this.PrePostExpenditureForm.get('ifscCode')?.patchValue('');
       this.PrePostExpenditureForm.get('checkNo')?.patchValue('');
       this.PrePostExpenditureForm.get('checkDate')?.patchValue('');
       this.PrePostExpenditureForm.get('bankName')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('transactionId')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('ifscCode')?.updateValueAndValidity();
        this.PrePostExpenditureForm.get('checkNo')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('checkDate')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('cost')?.setValidators([Validators.required, Validators.min(0)]);
       this.PrePostExpenditureForm.get('cost')?.updateValueAndValidity();
     }
     else if(val=='UPI'){
       this.PrePostExpenditureForm.get('bankName')?.setValidators(null);
       this.PrePostExpenditureForm.get('transactionId')?.setValidators([Validators.required]);
       this.PrePostExpenditureForm.get('ifscCode')?.setValidators(null);
       this.PrePostExpenditureForm.get('checkNo')?.setValidators(null);
         this.PrePostExpenditureForm.get('checkDate')?.setValidators(null);
       this.PrePostExpenditureForm.get('bankName')?.disable();
       this.PrePostExpenditureForm.get('transactionId')?.enable();
       this.PrePostExpenditureForm.get('ifscCode')?.disable();
       this.PrePostExpenditureForm.get('bankName')?.patchValue('');
       this.PrePostExpenditureForm.get('transactionId')?.patchValue('');
       this.PrePostExpenditureForm.get('ifscCode')?.patchValue('');
       this.PrePostExpenditureForm.get('checkNo')?.patchValue('');
       this.PrePostExpenditureForm.get('checkDate')?.patchValue('');
       this.PrePostExpenditureForm.get('bankName')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('transactionId')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('ifscCode')?.updateValueAndValidity();
        this.PrePostExpenditureForm.get('checkNo')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('checkDate')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('cost')?.setValidators([Validators.required, Validators.min(0)]);
       this.PrePostExpenditureForm.get('cost')?.updateValueAndValidity();
     }
       else if(val=='CHEQUE'){
       this.PrePostExpenditureForm.get('bankName')?.setValidators(null);
       this.PrePostExpenditureForm.get('transactionId')?.setValidators(null);
       this.PrePostExpenditureForm.get('ifscCode')?.setValidators(null);
         this.PrePostExpenditureForm.get('checkNo')?.setValidators([Validators.required,Validators.pattern(/^[0-9]\d*$/)]);
         this.PrePostExpenditureForm.get('checkDate')?.setValidators([Validators.required]);
       this.PrePostExpenditureForm.get('bankName')?.enable();
       this.PrePostExpenditureForm.get('transactionId')?.enable();
       this.PrePostExpenditureForm.get('ifscCode')?.enable();
       this.PrePostExpenditureForm.get('bankName')?.patchValue('');
       this.PrePostExpenditureForm.get('transactionId')?.patchValue('');
       this.PrePostExpenditureForm.get('ifscCode')?.patchValue('');
        this.PrePostExpenditureForm.get('checkNo')?.patchValue('');
       this.PrePostExpenditureForm.get('checkDate')?.patchValue('');
       this.PrePostExpenditureForm.get('bankName')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('transactionId')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('ifscCode')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('checkNo')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('checkDate')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('cost')?.setValidators([Validators.required, Validators.min(0)]);
       this.PrePostExpenditureForm.get('cost')?.updateValueAndValidity();
     }
   }
   formDetailsBulk() {
     this.BulkExpenditureForm = new FormGroup({
       itemName: new FormControl("", [Validators.required]),
       purchaseDate: new FormControl("",),
       purchasedQuantity: new FormControl("",),
       headOfExpenseId: new FormControl("",[Validators.required]),
       unitCost: new FormControl("",[Validators.pattern(/^(0*[1-9]\d*(\.\d+)?|0+\.\d*[1-9]\d*)$/)]),
       bulkExpenditureId: new FormControl("",),
       availableQuantity: new FormControl("", ),
       consumedQuantityFromBulk: new FormControl("", ),
       consumedQuantity: new FormControl("", [Validators.required,Validators.pattern(/^[1-9]\d*$/)]),
       allocatedCost: new FormControl("", ),
     })
   }
   ChangeexpenditureType(event:any,val:any){
     this.expenditureType=val
     if(val=='Bulk'){
       this.TotalAmount=0
       // this.getBulkExpenditure()
      //  this.getExpenditure()
     }
     else{
       this.TotalAmount=0
       // this.getBulkExpenditure()
      //  this.getExpenditure()
     }
   }
   getProgramType: any = [];
   getProgramTypeData() {
     this._commonService.getById(APIS.programCreation.getProgramType, this.agencyId)
       .subscribe({
         next: (data: any) => {
           this.getProgramType = data.data;
         },
         error: (err: any) => {
           new Error(err);
         },
       });
   }
   GetItemsData:any
   getHeadOfExpenseId(val:any){
     this.GetItemsData=[]
     if(val){
       this._commonService.getDataByUrl(APIS.programExpenditure.getItemByExpenses+'='+val+'&agencyId='+this.agencyId,)?.subscribe({
         next: (data: any) => {
          if(data){
            this.GetItemsData = data;
          }
         },
         error: (err: any) => {
           this.toastrService.error(err.message, "Error fetching program details!");
         }
       });
     }
   }
   getBulkByItem:any
   getBulkDataByItem(val:any,expenseId:any){
     this.getBulkByItem=[]
     if(val && expenseId){
       this._commonService.add(APIS.programExpenditure.getBulkDataByExpensesItem,{"expenseId": expenseId,"itemName": val})?.subscribe({
         next: (data: any) => {
          if(data){
            this.getBulkByItem = data;
            this.BulkExpenditureForm.patchValue({"purchasedQuantity": this.getBulkByItem?.purchasedQuantity,"unitCost": this.getBulkByItem?.unitCost,"purchaseDate":this.convertToISOFormat(this.getBulkByItem?.purchaseDate),"consumedQuantityFromBulk": this.getBulkByItem?.consumedQuantity,"bulkExpenditureId": this.getBulkByItem?.bulkExpenditureId,"availableQuantity": this.getBulkByItem?.availableQuantity})
           // unit cost just changed with the item - the old allocated cost is stale
           this.calcCostAllocated(this.fBulk['consumedQuantity'].value)
          }
         },
         error: (err: any) => {
           this.toastrService.error(err.message, "Error fetching program details!");
         }
       });
     }
   }
   calcCostAllocated(Val:any){
     const qty = Number(Val);
     const unitCost = Number(this.fBulk['unitCost'].value);
     if (!qty || !unitCost || isNaN(qty) || isNaN(unitCost)) {
       this.fBulk['allocatedCost'].setValue('');
       return;
     }
     // round to paise, the raw product carries float noise (e.g. 338.4912959 * 3)
     this.fBulk['allocatedCost'].setValue(Number((qty * unitCost).toFixed(2)));
   }
   
   isEdit:any=false
   Expenditureid:any=''
   editUploadUrl:any
   OpenModal(type:any,item?:any):any{
     this.Expenditureid=''
     this.fileErrors='';  
      this.editUploadUrl=''
    if(type=='add'){
     this.isEdit=false
     if(this.programCreationMain.value.activityId && this.programCreationMain.value.subActivityId && this.programCreationMain.value.programId){
       this.PrePostExpenditureForm.reset()
       if(this.expenditureType=='Bulk'){
         const modal = new bootstrap.Modal(this.BulkEvenModal.nativeElement);
         modal.show();
         
       }
       else{
         const modal1 = new bootstrap.Modal(this.PreEventModal.nativeElement);
         modal1.show();
       }
       
         // this.formModel = new window.bootstrap.Modal(document.getElementById("addInventory")    );
       // return true;;
     }
     else{
       this.toastrService.warning('Please select Activity,subactivity,Program then only you have to Add '+this.expenditureType+' Expenditure')
       // return false;
      
     }
    }
    else{
      this.editUploadUrl=item?.uploadBillUrl;
     if(item?.expenditureType=='PRE' || item?.expenditureType=='POST'){
       this.Expenditureid=item?.programExpenditureId
       this.isEdit=true
       console.log(item)
       this.PrePostExpenditureForm.reset()
       item['uploadBillUrl']=''
       this.modeOfPayment(item?.modeOfPayment)
       this.programCreationMain.patchValue({...item})
       this.PrePostExpenditureForm.patchValue({...item,headOfExpenseId:this.getExpenseIdByName(item?.headOfExpense),billDate:this.convertToISOFormat(item?.billDate),checkDate:this.convertToISOFormat(item?.checkDate)})
       // this.PrePostExpenditureForm.get('uploadBillUrl')?.setValue(item?.uploadBillUrl)
   
       console.log(item)
       
       
      
       const modal1 = new bootstrap.Modal(this.PreEventModal.nativeElement);
       modal1.show();
     }
     else{
       this.Expenditureid=item?.bulkExpenditureTransactionId
       this.isEdit=true
       console.log(item)
      
       this.BulkExpenditureForm.reset()
       this.BulkExpenditureForm.patchValue({...item,headOfExpenseId:this.getExpenseIdByName(item?.headOfExpense),billDate:this.convertToISOFormat(item?.billDate),checkDate:this.convertToISOFormat(item?.checkDate)})
       this.getHeadOfExpenseId(this.getExpenseIdByName(item?.headOfExpense))
       console.log(item?.itemName,this.getExpenseIdByName(item?.headOfExpense))
       this.getBulkDataByItem(item?.itemName,this.getExpenseIdByName(item?.headOfExpense))
       // this.PrePostExpenditureForm.get('uploadBillUrl')?.setValue(item?.uploadBillUrl)
   
       console.log(item)
       
       
      
       const modal1 = new bootstrap.Modal(this.BulkEvenModal.nativeElement);
       modal1.show();
     }
     
    
    }
     
   }
  
   //date converter
   convertToISOFormat(date: string): string {    
     if(date){
       const [day, month, year] = date.split('-');
       return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
     }
     else{
       return ''
     }
   
   }
   getExpenseIdByName(expenseName: string): number | undefined {
     const expense = this.ExpenditureData.find((item:any) => item.expenseName === expenseName);
     return expense?.expenseId;
   }
   validateFileExtension(file: File): boolean {
 
     const allowedExtensions = [ 'jpg','png','pdf','jpeg'];
     const fileExtension = file?.name?.split('.')?.pop()?.toLowerCase();
     console.log(fileExtension)
     return allowedExtensions.includes(fileExtension || '');
   }
   fileErrors:any=''
   uploadedFiles: any = [];
   onFileChange(event: any) {
     this.fileErrors=''
     // const file = event.target.files[0];
     // let urlsList: any = [];
     // if (file) {
     //   this.sessionForm.patchValue({ uploaFiles: file });
     // }
     const input = event.target as HTMLInputElement;
     const maxSize = 1 * 1024 * 1024; // 1MB
     let urlsList: any = [];
 
     if (input.files) {
       const newFiles = Array.from(input.files);
       const fileSize = input.files[0].size;
       const validFiles = newFiles.filter(file => this.validateFileExtension(file));
       // if (validFiles.length !== newFiles.length) {
       //   this.toastrService.error('Invalid file type selected. Only pdf and images files are allowed.', 'File Upload Error');
       // }
       if (validFiles.length !== newFiles.length) {
         this.fileErrors = `Invalid file type selected. Only images, and pdf files are allowed.`;
         // this.toastrService.error('Invalid file type selected. Only images, and pdf files are allowed.', 'File Upload Error');
       }
       else if (fileSize > maxSize) {
         this.fileErrors = `File size exceeds the maximum limit of 1MB.`;
         return;
     }
       for (let i = 0; i < validFiles.length; i++) {
         const fileName = validFiles[i].name;
         const fakePath = `${fileName}`;
         urlsList.push(fakePath);
       }
       //this.sessionForm.patchValue({ uploaFiles: validFiles });
       //this.sessionForm.get('uploaFiles')?.setValue(validFiles);
       // Save valid files separately
       this.uploadedFiles = validFiles;
       // this.sessionForm.patchValue({ videoUrls: urlsList });
     }
   }
   //save pre and post expenditure 
   ExpenditureSubmit(){
    this.PrePostExpenditureForm.value.checkDate=this.PrePostExpenditureForm.value.checkDate?moment(this.PrePostExpenditureForm.value.checkDate).format('DD-MM-YYYY'):null;
     let payload={...this.programCreationMain.value ,activityId:Number(this.programCreationMain.value.activityId),
       subActivityId:Number(this.programCreationMain.value.subActivityId),programId:Number(this.programCreationMain.value.programId),...this.PrePostExpenditureForm.value,
       headOfExpenseId:Number(this.PrePostExpenditureForm.value.headOfExpenseId),
       billDate:moment(this.PrePostExpenditureForm.value.billDate).format('DD-MM-YYYY'),
       agencyId:this.agencyId?Number(this.agencyId):Number(this.agencyId),uploadBillUrl:this.editUploadUrl?this.editUploadUrl:null}
       // payload['uploadBillUrl']=null
     console.log(payload)
     const formData = new FormData();
      
        formData.append("request", JSON.stringify(payload));
       if (this.PrePostExpenditureForm.value.uploadBillUrl) {
         formData.append("files", this.uploadedFiles[0]);
         }
         if(this.isEdit){
           this._commonService
           .add(APIS.programExpenditure.UpdateExpenditure+this.Expenditureid, formData).subscribe({
             next: (data: any) => {
               
               if(data?.status==400){
                 this.toastrService.error(data?.message, " Expenditure Data Error!");
               }
               else{
                 this.uploadedFiles=[]
                 this.PrePostExpenditureForm.reset();
                 this.TotalAmount=0
                //  this.getExpenditure()
                 // this.getBulkExpenditure()
                 
                
               this.toastrService.success(' Expenditure Updated Successfully'," Expenditure Data Success!");
               }
               
             },
             error: (err) => {
               
               this.toastrService.error(err.message," Expenditure Data Error!");
               new Error(err);
             },
           });
         }
         else{
           this._commonService
           .add(APIS.programExpenditure.saveExpenditure, formData).subscribe({
             next: (data: any) => {
               
               if(data?.status==400){
                 this.toastrService.error(data?.message, " Expenditure Data Error!");
               }
               else{
                 this.uploadedFiles=[]
                 this.PrePostExpenditureForm.reset();
                 this.TotalAmount=0
                //  this.getExpenditure()
                 // this.getBulkExpenditure()
                 
                
               this.toastrService.success( ' Expenditure Added Successfully', " Expenditure Data Success!");
               }
               
             },
             error: (err) => {
               
               this.toastrService.error(err.message, " Expenditure Data Error!");
               new Error(err);
             },
           });
         }
    
   }
   // save Bulk expenditure
   BulkExpenditureSubmit(){
     let payload1:any={
       "activityId": Number(this.programCreationMain.value?.activityId),
       "subActivityId": Number(this.programCreationMain.value?.subActivityId),
       "programId": Number(this.programCreationMain.value?.programId),
       "agencyId": this.agencyId?Number(this.agencyId):Number(this.agencyId),
       // "expenditureType": "PRE",
       "headOfExpenseId": this.BulkExpenditureForm.value?.headOfExpenseId,
       "bulkExpenditureId": this.BulkExpenditureForm.value?.bulkExpenditureId,
       "consumedQuantity": this.BulkExpenditureForm.value?.consumedQuantity,
       "allocatedCost":this.BulkExpenditureForm.value?.allocatedCost
   }
     // let payload={...this.BulkExpenditureForm.value,agencyId:this.agencyId}
     // console.log(payload)
    
         if(this.isEdit){
           this._commonService
           .add(APIS.programExpenditure.UpdatebulkByItemTranstion+this.Expenditureid, payload1).subscribe({
             next: (data: any) => {
               if(data?.status==400){
                 this.toastrService.error(data?.message," Expenditure Data Error!");
               }
               else{
                 this.BulkExpenditureForm.reset()
                 this.TotalAmount=0
                //  this.getExpenditure()
                 // this.advanceSearch(this.getSelDataRange);
             
               // this.formDetails()
               // modal.close()
               this.toastrService.success(' Expenditure Added Successfully'," Expenditure Data Success!");
               }
               
             },
             error: (err) => {
               
               this.toastrService.error(err.message," Expenditure Data Error!");
               new Error(err);
              //  this.getExpenditure()
             },
           });
         }
         else{
           this._commonService
           .add(APIS.programExpenditure.savebulkByItemExpenditure, payload1).subscribe({
             next: (data: any) => {
               if(data?.status==400){
                 this.toastrService.error(data?.message," Expenditure Data Error!");
               }
               else{
                 this.BulkExpenditureForm.reset()
                 this.TotalAmount=0
                //  this.getExpenditure()
                 // this.advanceSearch(this.getSelDataRange);
             
               // this.formDetails()
               // modal.close()
               this.toastrService.success( this.expenditureType +' Expenditure Added Successfully'," Expenditure Data Success!");
               }
               
             },
             error: (err) => {
               
               this.toastrService.error(err.message," Expenditure Data Error!");
               new Error(err);
              //  this.getExpenditure()
             },
           });
         }
   }
 
   BulkTotalUnitCost:any=0
   BulkTotalCost:any=0
   
     dataTableBulk: any;
     reinitializeDataTableBulk() {
       if (this.dataTable) {
         this.dataTable.destroy();
       }
       setTimeout(() => {
         this.initializeDataTableBulk();
       }, 0);
     }
   
     initializeDataTableBulk() {
       this.dataTable = new DataTable('#expenditure-table-bulk', {
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
     deleteprogramExpenditureId:any ={}
     deleteExpenditure(item: any) {
     this.deleteprogramExpenditureId = item
     const previewModal = document.getElementById('exampleModalDelete');
     if (previewModal) {
       const modalInstance = new bootstrap.Modal(previewModal);
       modalInstance.show();
     }
   }
     ConfirmdeleteExpenditure(item:any){
       console.log(item,'ConfirmdeleteExpenditure')
       let id=item?.programExpenditureId?item?.programExpenditureId:item.bulkExpenditureTransactionId
       let URL=item?.programExpenditureId?APIS.programExpenditure.deleteExpenditure:APIS.programExpenditure.deleteTransation
       console.log(id)
       this._commonService
       .add(URL+id, {}).subscribe({
         next: (data: any) => {
           if(data?.status==400){
             this.toastrService.error(data?.message, item.expenditureType +" Expenditure Data Error!");
             this.closeModalDelete();
             this.deleteprogramExpenditureId ={}
           }
           else{
             this.PrePostExpenditureForm.reset()
             this.TotalAmount=0
            //  this.getExpenditure()
             this.closeModalDelete();
             this.deleteprogramExpenditureId ={}
           this.toastrService.success( item.expenditureType +' Expenditure Deleted Successfully', item.expenditureType +" Expenditure Data Success!");
           }
           
         },
         error: (err) => {
           this.closeModalDelete();
           this.deleteprogramExpenditureId ={}
           this.toastrService.error(err.message, item.expenditureType +" Expenditure Data Error!");
           new Error(err);
         },
       });
 
     }
     closeModalDelete(): void {
       const editSessionModal = document.getElementById('exampleModalDelete');
       if (editSessionModal) {
         const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
         modalInstance.hide();
       }
     } 
     UpdateExpenditure(item:any){
 
     }
 
     sessionSubmissionFinal() {
              let data = {}
              this._commonService.add(`${APIS.programCreation.updateSessionByStatus}${this.programCreationMain.value.programId?this.programCreationMain.value.programId:this.programIds}?status=Program Expenditure Approved`, data).subscribe({
                next: (data: any) => {
                  console.log('Response from API:', data);
                  this.toastrService.success('Program Expenditure Details Submitted Successfully', "");
                  this.closeConfirmSession();
                  this.getExpenditureDataBoth = ''
                  this.programCreationMain.reset()
                  this.getProgramsByAgencyAdmin(this.agencyId)
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
             downloadProgramExpenditure(){
               let linkUrl = APIS.programExpenditure.downloadExpeditureData+'?programId='+this.programCreationMain.value.programId+'&agencyId='+this.agencyId
               const link = document.createElement("a");
               link.setAttribute("download", linkUrl);
               link.setAttribute("target", "_blank");
               link.setAttribute("href", linkUrl);
               document.body.appendChild(link);
               link.click();
               link.remove();
             }


            //  expemditure
            // Expenditure CRUD operations
            isSubmitted = false;
            financialForm!: FormGroup;
            createForm(): FormGroup {
    return this.fb.group({
      agencyId: [0, ],
      nonTrainingSubActivityId: [0, ],
       nonTrainingActivityId: [0, ],
      paymentDate: ['', Validators.required],
      category: ['', ],
      expenditureAmount: [0, [Validators.required, Validators.min(0),Validators.max(5000000)]],
      billNo: ['', Validators.required],
      billDate: ['', Validators.required],
      payeeName: ['', Validators.required],
      accountNumber: ['', Validators.required],
      bankName: ['', Validators.required],
      ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      modeOfPayment: ['', Validators.required],
      transactionId: [''],
      purpose: ['', ],
      uploadBillUrl: [''],
      checkNo: [''],
      checkDate: ['']
    });
  }
            
              get f() {
                return this.financialForm.controls;
              }
             
              iseditMode = false;
              preliminaryID:any
              categroryList:any=[]
              openModel(mode: string,item?: any): void {
      if(this.selectedSubActivity=='20' || this.selectedSubActivity=='21' || this.selectedSubActivity=='22' || this.selectedSubActivity=='23' ){
        this.categroryList=['Course Content Development','Processing Fee', 'Admin Charges', 'Others']
      }
      else if(this.selectedSubActivity=='24' ){
          this.categroryList = ['Man Power Support', 'Prototype / Fabrication', 'IPR Support', 'Others'];
      }
       else if(this.selectedSubActivity=='25' ){
            this.categroryList = ['Honororium', 'Travel', 'Others'];
      }
     if (mode === 'add') {
        this.uploadedFilesFinance=null
      this.financialForm.reset();
      this.iseditMode = false;
      this.resetForm();
    }
    if (mode === 'edit') {
      this.preliminaryID=item?.id
      this.iseditMode = true;
      this.modeOfPaymentIt(item?.modeOfPayment);
      this.uploadedFilesFinance=item?.uploadBillUrl
      this.financialForm.patchValue({
        agencyId: item?.agencyId || 0,
        nonTrainingSubActivityId: item?.nonTrainingSubActivityId || 0,
        paymentDate: item?.paymentDate ? this.convertToISOFormat(item?.paymentDate) : '',
        category: item?.category ? item?.category : '',
        expenditureAmount: item?.expenditureAmount || 0,
        billNo: item?.billNo || '',
        billDate: item?.billDate ? this.convertToISOFormat(item?.billDate) : '',
        payeeName: item?.payeeName || '',
        accountNumber: item?.accountNumber || '',
        bankName: item?.bankName || '',
        ifscCode: item?.ifscCode || '',
        modeOfPayment: item?.modeOfPayment || '',
        transactionId: item?.transactionId || '',
        purpose: item?.purpose || '',
        uploadBillUrl: '',
        checkNo: item?.checkNo || '',
        checkDate: item?.checkDate ? this.convertToISOFormat(item?.checkDate) : '',
       
      });
      
    }
    const modal1 = new bootstrap.Modal(document.getElementById('addSurvey'));
    modal1.show();
  }
            
            modeOfPaymentIt(val:any){
      if(val=='CASH'){
        this.financialForm.get('bankName')?.setValidators(null);
        this.financialForm.get('accountNumber')?.setValidators(null);
        this.financialForm.get('transactionId')?.setValidators(null);
        this.financialForm.get('ifscCode')?.setValidators(null);
        this.financialForm.get('bankName')?.patchValue('');
        this.financialForm.get('accountNumber')?.patchValue('');
        this.financialForm.get('transactionId')?.patchValue('');
        this.financialForm.get('ifscCode')?.patchValue('');
        this.financialForm.get('bankName')?.clearValidators();
        this.financialForm.get('accountNumber')?.clearValidators();
        this.financialForm.get('transactionId')?.clearValidators();
        this.financialForm.get('ifscCode')?.clearValidators();
        this.financialForm.get('bankName')?.disable();
        this.financialForm.get('accountNumber')?.disable();
        this.financialForm.get('transactionId')?.disable();
        this.financialForm.get('ifscCode')?.disable();
      
        this.financialForm.get('bankName')?.updateValueAndValidity();
        this.financialForm.get('accountNumber')?.updateValueAndValidity();
        this.financialForm.get('transactionId')?.updateValueAndValidity();
        this.financialForm.get('ifscCode')?.updateValueAndValidity();
        this.financialForm.get('expenditureAmount')?.setValidators([Validators.required, Validators.min(0), Validators.max(5000)]);
        this.financialForm.get('expenditureAmount')?.updateValueAndValidity();

      }
      else if(val=='BANK_TRANSFER'){
        this.financialForm.get('bankName')?.setValidators([Validators.required]);
        this.financialForm.get('accountNumber')?.setValidators([Validators.required]);
        this.financialForm.get('transactionId')?.setValidators(null);
        this.financialForm.get('ifscCode')?.setValidators([Validators.required,Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]);
        this.financialForm.get('bankName')?.enable();
        this.financialForm.get('accountNumber')?.enable();
        this.financialForm.get('transactionId')?.disable();
        this.financialForm.get('ifscCode')?.enable();
        this.financialForm.get('bankName')?.patchValue('');
        this.financialForm.get('accountNumber')?.patchValue('');
        this.financialForm.get('transactionId')?.patchValue('');
        this.financialForm.get('ifscCode')?.patchValue('');
        this.financialForm.get('bankName')?.updateValueAndValidity();
        this.financialForm.get('accountNumber')?.updateValueAndValidity();
        this.financialForm.get('transactionId')?.updateValueAndValidity();
        this.financialForm.get('ifscCode')?.updateValueAndValidity();
        this.financialForm.get('expenditureAmount')?.setValidators([Validators.required, Validators.min(0)]);
        this.financialForm.get('expenditureAmount')?.updateValueAndValidity();

      }
      else if(val=='UPI'){
        this.financialForm.get('bankName')?.setValidators(null);
        this.financialForm.get('accountNumber')?.setValidators(null);
        this.financialForm.get('transactionId')?.setValidators([Validators.required,Validators.pattern(/^[^\s].*/)]);
        this.financialForm.get('ifscCode')?.setValidators(null);
        this.financialForm.get('bankName')?.disable();
        this.financialForm.get('accountNumber')?.disable();
        this.financialForm.get('transactionId')?.enable();
        this.financialForm.get('ifscCode')?.disable();
        this.financialForm.get('bankName')?.patchValue('');
        this.financialForm.get('accountNumber')?.patchValue('');
        this.financialForm.get('transactionId')?.patchValue('');
        this.financialForm.get('ifscCode')?.patchValue('');

        this.financialForm.get('bankName')?.updateValueAndValidity();
        this.financialForm.get('accountNumber')?.updateValueAndValidity();
        this.financialForm.get('transactionId')?.updateValueAndValidity();
        this.financialForm.get('ifscCode')?.updateValueAndValidity();
        this.financialForm.get('expenditureAmount')?.setValidators([Validators.required, Validators.min(0)]);
        this.financialForm.get('expenditureAmount')?.updateValueAndValidity();

      }
       else if(val=='CHEQUE'){
        this.financialForm.get('bankName')?.setValidators(null);
        this.financialForm.get('accountNumber')?.setValidators(null);
        this.financialForm.get('transactionId')?.setValidators(null);
        this.financialForm.get('ifscCode')?.setValidators(Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/));
        this.financialForm.get('bankName')?.enable();
        this.financialForm.get('accountNumber')?.enable();
        this.financialForm.get('transactionId')?.enable();
        this.financialForm.get('ifscCode')?.enable();
        this.financialForm.get('bankName')?.patchValue('');
        this.financialForm.get('accountNumber')?.patchValue('');
        this.financialForm.get('transactionId')?.patchValue('');
        this.financialForm.get('ifscCode')?.patchValue('');

        this.financialForm.get('bankName')?.updateValueAndValidity();
        this.financialForm.get('accountNumber')?.updateValueAndValidity();
        this.financialForm.get('transactionId')?.updateValueAndValidity();

        this.financialForm.get('ifscCode')?.updateValueAndValidity();
        this.financialForm.get('expenditureAmount')?.setValidators([Validators.required, Validators.min(0)]);
        this.financialForm.get('expenditureAmount')?.updateValueAndValidity();
      }
    }
                //  uploadedFiles: any ;
  
        uploadedFilesFinance: any ;
        onFileSelected(event: any): void {
          console.log('File selected event:', event);
          const file = event.target.files[0];
          if (file) {
            this.uploadedFilesFinance = file;
            // Handle file upload logic here
            // You might want to upload the file and then set the URL
            // this.financialForm.patchValue({
            //   uploadBillUrl: file.name // This would be the uploaded file URL
            // });
          }
        }
          removeFile(): void {
              this.uploadedFilesFinance=null   
            }
              getPreliminaryData:any=[]
             
               onSubmit(): void {
                   this.isSubmitted = true;
                    if (this.financialForm.valid) {
                   if(this.iseditMode){
                      this.f['agencyId'].setValue(Number(this.agencyId));
                       this.f['nonTrainingSubActivityId'].setValue(Number(this.selectedSubActivity));
                       this.f['nonTrainingActivityId'].setValue(Number(this.selectedActivity));
                       const formData = new FormData();
                           console.log('this.uploadedFilesFinance:', this.uploadedFilesFinance,Object(this.uploadedFilesFinance).length>0,typeof this.uploadedFilesFinance);
                            if (this.uploadedFilesFinance?.name && typeof this.uploadedFilesFinance !== 'string') {
                             formData.append("files", this.uploadedFilesFinance);
                             }
                             else{
                               this.financialForm.patchValue({uploadBillUrl:this.uploadedFilesFinance})
                             }
               
                             formData.append("dto", JSON.stringify({...this.financialForm.value,nonTrainingSubActivityId:Number(this.selectedSubActivity),id:this.preliminaryID}));
               
                        
                       this._commonService.update(APIS.nontrainingtargets.updateNonTrainingtargetsAleapPriliminary,formData,this.preliminaryID).subscribe((res: any) => {
                        this.toastrService.success('Data Updated successfully','Non Training Progress Data Success!');
                         
                         console.log('Preliminary Data:', this.getPreliminaryData);
                         this.resetForm();
                           this.getExpenditure(this.selectedSubActivity)
               
                         this.isSubmitted = false;
                         const modalElement = document.getElementById('addSurvey');
                         const modal1 = modalElement ? bootstrap.Modal.getInstance(modalElement) : null;
                         if (modal1) {
                           modal1.hide();
                         }
                       
                       }, (error) => {
                          this.resetForm();
                         this.isSubmitted = false;
                         const modal1 = bootstrap.Modal.getInstance(document.getElementById('addSurvey'));
                         modal1.hide();
                         this.toastrService.error(error.message,"Non Training Progress Data Error!");
                       });
                       setTimeout(() => {
                           this.getExpenditure(this.selectedSubActivity)
                       }, 200);
                   }
                   else{
                     console.log('Form Submitted:', this.financialForm.value);
                     this.f['agencyId'].setValue(Number(this.agencyId));
                       this.f['nonTrainingSubActivityId'].setValue(Number(this.selectedSubActivity));
                       this.f['nonTrainingActivityId'].setValue(Number(this.selectedActivity));
                        const formData = new FormData();
                         formData.append("dto", JSON.stringify({...this.financialForm.value}));
               
                          if (this.uploadedFilesFinance) {
                            formData.append("file", this.uploadedFilesFinance);
                            }
                       this._commonService.add(APIS.nontrainingtargets.saveNonTrainingtargetsCodeIT,formData).subscribe((res: any) => {
                         this.toastrService.success('Data saved successfully','Non Training Progress Data Success!');
                         this.getPreliminaryData.push(res.data)
                           this.getExpenditure(this.selectedSubActivity)
               
                         this.resetForm();
                         this.isSubmitted = false;
                         const modal1 = bootstrap.Modal.getInstance(document.getElementById('addSurvey'));
                         modal1.hide();
                        
                       
                       }, (error) => {
                         this.resetForm();
                         this.isSubmitted = false;
                         const modal1 = bootstrap.Modal.getInstance(document.getElementById('addSurvey'));
                         modal1.hide();
                         this.toastrService.error(error.message);
                       });
                       setTimeout(() => {
                           this.getExpenditure(this.selectedSubActivity)
                       }, 200);
                   }
                  
                   }
               
                 }
            
             
            
              deletePreliminaryID:any
              deletePreliminary(id:any):void{
                this.deletePreliminaryID=id
                 const previewModal = document.getElementById('exampleModalDelete');
                if (previewModal) {
                  const modal = new bootstrap.Modal(previewModal);
                  modal.show();
                }
              }
            
              ConfirmdeleteExpenditureData(item:any){
                  this._commonService
                  .deleteId(APIS.nontrainingtargets.deleteNonTrainingtargetsAleapContingency,item).subscribe({
                    next: (data: any) => {
                      this.toastrService.success('Expenditure deleted successfully', 'Success!');
                      const editSessionModal = document.getElementById('exampleModalDelete');
                      if (editSessionModal) {
                        const modal = bootstrap.Modal.getInstance(editSessionModal);
                        if (modal) modal.hide();
                      }
                      //  this.getExpenditure(this.selectedSubActivity);
                      this.getExpenditure(this.selectedSubActivity);
                    },
                    error: (err) => {
                      this.toastrService.error(err.message || 'Failed to delete expenditure', 'Error!');
                    },
                  });
                }
                 resetForm(): void {
       const modalElement = document.getElementById('addSurvey');
            const modal1 = modalElement ? bootstrap.Modal.getInstance(modalElement) : null;
            if (modal1) {
              modal1.hide();
            }
      this.isSubmitted = false;
    }
 checkExpenditure(data: any): boolean {
      // Returns true if all records in data have status 'Approved'
      if (!Array.isArray(data)) return false;
      return data.every((item: any) => item.status === 'APPROVED' || item.status === 'Approved' );
    }
     // addd by upendranath reddy for common file preview
  showFileViewer(filePath: string) {
    console.log('File path to open:', filePath);

    this._commonService.openFile(filePath);

  }
           
 }
 
 
 
 
 
 
 