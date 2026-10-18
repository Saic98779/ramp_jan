import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
  import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
  import { Router } from '@angular/router';
  import { CommonServiceService } from '@app/_services/common-service.service';
  import { API_BASE_URL, APIS } from '@app/constants/constants';
  import { ToastrService } from 'ngx-toastr';
  import DataTable from 'datatables.net-dt';
  import 'datatables.net-buttons-dt';
  import 'datatables.net-responsive-dt';
  declare var bootstrap: any;

@Component({
  selector: 'app-view-all-programs-related-data',
  templateUrl: './view-all-programs-related-data.component.html',
  styleUrls: ['./view-all-programs-related-data.component.css']
})
export class ViewAllProgramsRelatedDataComponent implements OnInit {
  loginsessionDetails: any;
  agencyId: any;
  programIds:any
  activeTab:any;
   @ViewChild('addRemarks') addRemarks!: ElementRef;
  constructor(private fb: FormBuilder,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService, private router: Router,) { 
      this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
    }

  ngOnInit(): void {
    this.formDetailsRemark()
    this.activeTab = 'nav-five';
    this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');  
    if(this.loginsessionDetails.userRole == 'ADMIN' || this.loginsessionDetails.userRole == 'SPIU') {
      this.getAgenciesList()
    }
    else{
      this.getProgramsByAgency()
    }
   
  }

 
  onTabChange(activeTab:any){
    this.activeTab = activeTab;
    if(activeTab=='nav-ones' || activeTab=='nav-five') { 
      console.log(activeTab); 
      this.getProgramDetailsById(this.programIds)
    }
    if(activeTab=='nav-twos') {
      console.log(activeTab)
      this.getData()
    }
    else if(activeTab=='nav-three') {
      console.log(activeTab)
      this.getAttandanceData()
    }
    else if(activeTab=='nav-four') { 
      console.log(activeTab)
      this.TotalAmount=0
      this.getExpenditure()
    }
  }
  selectedAgencyId:any;
  agencyList:any;
  agencyListFiltered:any;
  // All Agency data  for admin login
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
  // All Programs data for admin login
  agencyProgramList: any;
  agencyProgramListFiltered: any;
  getProgramsByAgencyAdmin(agency:any) {
    if(agency == 'All Agencies') {
      this.programIds = 'All Programs'
      this.agencyProgramList=[]
      this.onTabChange(this.activeTab);
    }
    else{
      this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgencyStatus}/${agency}?status=Program Expenditure Updated`).subscribe({
        next: (data: any) => {
          this.agencyProgramList = data?.data
          this.agencyProgramListFiltered=this.agencyProgramList
          this.programIds = this.agencyProgramList?.[0]?.programId
          console.log(this.agencyProgramList,this.agencyProgramList.length)
          if(!this.agencyProgramList.length) {
            this.ProgramData=[]
            this.submitedData = []
            this.ParticipantAttendanceData=[]
            this.TotalAmount=0
            this.getExpenditureDataBoth=[]

          }
          else{
            this.onTabChange(this.activeTab);
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
        this.agencyProgramListFiltered = this.agencyProgramList
        this.programIds = this.agencyProgramList[0].programId
        this.onTabChange(this.activeTab);
      },
      error: (err) => {
        console.error('Error loading programs:', err);
      }
    });
    
  }
  dropdownProgramsList(event: any, type: any) {
    this.submitedData = ''
    this.programIds = event.value
    if(event.value == 'All Programs') {
      this.onTabChange(this.activeTab);

    }
    else{
      if (type == 'table' && event.value) {
        this.onTabChange(this.activeTab);
      }
    }
    
  }

  // Participant Related Data startes
  submitedData:any=[]
  getData() {
    this.submitedData = []
    // sessionStorage.getItem('ParticipantData')
    // let resList = sessionStorage.getItem('ParticipantData') || ''
    // // let resList = sessionStorage.getItem('ParticipantData') || ''   
    // console.log(resList) 
    // if(resList){
    //   this.submitedData=JSON.parse(resList)
    // }
    if(this.selectedAgencyId=='All Agencies') {
      this._commonService.getDataByUrl(APIS.participantdata.getDataByProgramBYDeatisl+-1+`?page=0&size=200`).subscribe({
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
          // this.toastrService.error(err.message, "Participant Data Error!");
          new Error(err);
        },
      });
    }
    else if(this.programIds == 'All Programs') {
      this._commonService.getDataByUrl(APIS.participantdata.getDataByProgramBYDeatisl+-2+`?agencyId=`+this.selectedAgencyId+`&page=0&size=200`).subscribe({
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
          // this.toastrService.error(err.message, "Participant Data Error!");
          new Error(err);
        },
      });
    }
    else{
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
          // this.toastrService.error(err.message, "Participant Data Error!");
          new Error(err);
        },
      });
    }


   
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
        let Url:any=''
        // Add search filter if any
        if (data.search.value) {
          params += `&search=${encodeURIComponent(data.search.value)}`;
        }
        if(this.selectedAgencyId=='All Agencies') {
          Url=APIS.participantdata.getDataByProgramBYDeatisl+-1+params
        }
        else if(this.programIds == 'All Programs') {
          Url=APIS.participantdata.getDataByProgramBYDeatisl+-2+'?agencyId='+this.selectedAgencyId+'&page='+page+'&size='+size
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

  // AttendanceData data start 
  ParticipantAttendanceData:any
    getAttandanceData() {
      this.ParticipantAttendanceData = ''
     
      this._commonService.getById(APIS.Attendance.getDeatails, this.programIds).subscribe({
        next: (res: any) => {          
          this.ParticipantAttendanceData = res?.data   
          this.ParticipantAttendanceData.participantAttendanceList=this.getparticipantAttendanceList(res?.data?.participantAttendanceList)
        },
        error: (err) => {
          // this.toastrService.error(err.message, "Participant Data Error!");
          new Error(err);
        },
      });
      // console.log(this.ParticipantAttentance)
    }
    getparticipantAttendanceList(data1:any){
      let participantAttendanceList:any=[]
      
      data1?.forEach((data:any,index:any)=>{
        let attendanceData1:any=[]
        data?.attendanceData?.forEach((item:any,index:any)=>{
          let attendanceData:any={}
          attendanceData[index]=item
          attendanceData1.push(attendanceData)
        })
        data['percentage'] = ((data?.attendanceData?.filter((item:any)=>item=='P')?.length/data?.attendanceData?.length)*100).toFixed(2)
        data['attendanceData1']=attendanceData1
      })
     
      console.log(data1,'srk')
      return data1

    }
    // Add this method to your component
    getAttendanceHeaders() {
      if (this.ParticipantAttendanceData?.participantAttendanceList?.length) {
          return this.ParticipantAttendanceData.participantAttendanceList[0]?.attendanceData || [];
      }
      return [];
    }
  // AttendanceData data end
  // expenditure data start
  getExpenditureData:any=[]
  getExpenditureDataBoth:any=[]
  TotalAmount:any=0
  getExpenditure(){
    this.TotalAmount=0
    this.getExpenditureDataBoth=[]
    if(this.programIds){ 
      this._commonService
        .getDataByUrl(APIS.programExpenditure.getExpenditure+'?programId='+this.programIds+'&expenditureType='+'PRE&agencyId='+this.agencyId).subscribe({
          next: (data: any) => {
           if(data?.data){
            this.getExpenditureData=data?.data
            this.getExpenditureDataBoth=[...this.getExpenditureDataBoth,...data?.data]
            // this.getExpenditure()
            this.getPost()
            this.reinitializeDataTable();
            
            this.getExpenditureData?.map((item:any)=>{

              this.TotalAmount+=item?.cost

            })
           }
           else{
            this.getPost()
           }
            
          },
          error: (err) => {
            this.getPost()
            this.toastrService.error(err.message, " Expenditure Data Error!");
            new Error(err);
          },
        });
        
    }
    
  }
  getPost(){
    this._commonService
        .getDataByUrl(APIS.programExpenditure.getExpenditure+'?programId='+this.programIds+'&expenditureType='+'POST'+'&agencyId='+this.agencyId).subscribe({
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
    if(this.loginsessionDetails?.userRole == 'ADMIN' || this.loginsessionDetails?.userRole == 'SPIU'){
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
  imageUrlDownloadPath = `https://ramp-tg.metaversedu.in/`;
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
  expenditureId:any
  expenditureType:any
openRemarks(item:any){
  this.RemarkForm.reset()
    item?.status?this.fRemark['status'].patchValue(item?.status):this.fRemark['status'].patchValue('')
    this.expenditureType=item?.expenditureType
     if(item?.expenditureType=='PRE' || item?.expenditureType=='POST'){
         this.expenditureId=item?.programExpenditureId
    }
     else{
      this.expenditureId=item?.bulkExpenditureTransactionId
              
    }
        const previewModal = document.getElementById('addRemarksModel');
    if (previewModal) {
      const modalInstance = new bootstrap.Modal(previewModal);
      modalInstance.show();
    }
    }

    SubmitRemarks(){
      let payload:any
      let url:any
      if(this.expenditureType=='PRE' || this.expenditureType=='POST'){
        url=APIS.programExpenditure.saveRemarks+'?status='+this.fRemark['status'].value
        if(this.loginsessionDetails?.userRole == 'ADMIN' || this.loginsessionDetails?.userRole == 'SPIU'){
            payload={
            "userId": this.loginsessionDetails?.userId,
            "spiuComments": this.fRemark['spiuComments'].value,
            "expenditureId": this.expenditureId
       }
       
        }
        else{
          payload={
            "userId": this.loginsessionDetails?.userId,
            "agencyComments": this.fRemark['agencyComments'].value,
            "expenditureId": this.expenditureId
       }
      
      }
    }
      else{
        url=APIS.programExpenditure.saveRemarksBulk+'?status='+this.fRemark['status'].value
          if(this.loginsessionDetails?.userRole == 'ADMIN' || this.loginsessionDetails?.userRole == 'SPIU'){
            payload={
            "userId": this.loginsessionDetails?.userId,
            "spiuComments": this.fRemark['spiuComments'].value,
            "transactionId": this.expenditureId
       }
       
        }
        else{
          payload={
            "userId": this.loginsessionDetails?.userId,
            "agencyComments": this.fRemark['agencyComments'].value,
            "transactionId": this.expenditureId
       }
      
      }
      }
  
            this._commonService.updatedata(url,payload).subscribe({
            next: (res: any) => {
             this.getExpenditure()
              this.toastrService.success('Data Added Successfully', "Expenditure Data!");
            },
            error: (err) => {
               this.getExpenditure()
              this.toastrService.error(err.message, "Expenditure Data Error!");
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
    let linkUrl = 'https://ramp-tg.metaversedu.in/'+url
    const link = document.createElement("a");
    link.setAttribute("download", linkUrl);
    link.setAttribute("target", "_blank");
    link.setAttribute("href", linkUrl);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  downloadImage(url:any) {
  const imageUrl = 'https://ramp-tg.metaversedu.in/'+url;

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
}
