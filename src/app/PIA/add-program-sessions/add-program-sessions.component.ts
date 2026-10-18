import { Component, OnInit,ViewChild, ElementRef } from '@angular/core';
import { CommonServiceService } from '@app/_services/common-service.service';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { API_BASE_URL, APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import moment from "moment";
import { DomSanitizer } from '@angular/platform-browser';
import { Role } from '@app/_models';
declare var bootstrap: any;

@Component({
  selector: 'app-add-program-sessions',
  templateUrl: './add-program-sessions.component.html',
  styleUrls: ['./add-program-sessions.component.css']
})
export class AddProgramSessionsComponent implements OnInit {

  agencyId: any
  modalFormStype!: FormGroup;
  sourceTypes: any = [];
  sessionForm!: FormGroup;

  // Full list of methodologies
  allMethodologies = [
    'Lecture', 'Break', 'Discussion', 'Panel discussion', 'Presentation', 'Felicitation'
  ];

  // Visible methodologies after filtering
  availableMethodologies: string[] = [];
  Role :any='';
  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
    private sanitizer: DomSanitizer
  ) {
    this.Role=JSON.parse(sessionStorage.getItem('user') || '{}').userRole;
    this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
    this.modalFormStype = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z .]+$/)]],
      mobileNo: ['', [Validators.required, Validators.pattern(/^[6789]\d{9}$/)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      organizationName: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z0-9 .]+$/)]],
      qualification: ['', Validators.required],
      designation: ['', Validators.required],
      isVIP: ['', ],
      specialization: ['', Validators.required],
      briefDescription: ['', Validators.required],
      gender: ['', Validators.required],
      agencyIds: [[this.agencyId]],
    });

    // Initialize available methodologies
    this.availableMethodologies = [...this.allMethodologies];
  }
  get fresouce(){
    return this.modalFormStype.controls;
  }
  changeStatus(event:any){
    if(event.target.checked){
      this.modalFormStype.patchValue({isVIP:true})
      this.modalFormStype.get('mobileNo')?.patchValue('');
      this.modalFormStype.get('mobileNo')?.setValidators(null);
      this.modalFormStype.get('mobileNo')?.updateValueAndValidity();
      this.modalFormStype.get('email')?.patchValue('');
      this.modalFormStype.get('email')?.setValidators(null);
      this.modalFormStype.get('email')?.updateValueAndValidity();
      this.modalFormStype.get('organizationName')?.patchValue('');
      this.modalFormStype.get('organizationName')?.setValidators(null);
      this.modalFormStype.get('organizationName')?.updateValueAndValidity();
      this.modalFormStype.get('qualification')?.patchValue('');
      this.modalFormStype.get('qualification')?.setValidators(null);
      this.modalFormStype.get('qualification')?.updateValueAndValidity();
      this.modalFormStype.get('designation')?.patchValue('');
      this.modalFormStype.get('designation')?.setValidators(null);
      this.modalFormStype.get('designation')?.updateValueAndValidity();
      this.modalFormStype.get('briefDescription')?.patchValue('');
      this.modalFormStype.get('briefDescription')?.setValidators(null);
      this.modalFormStype.get('briefDescription')?.updateValueAndValidity();
      this.modalFormStype.get('specialization')?.patchValue('');
      this.modalFormStype.get('specialization')?.setValidators(null);
      this.modalFormStype.get('specialization')?.updateValueAndValidity();
      
    }else{
      this.modalFormStype.patchValue({isVIP:false})
      this.modalFormStype.get('mobileNo')?.patchValue('');
      this.modalFormStype.get('mobileNo')?.setValidators([Validators.required, Validators.pattern(/^[6789]\d{9}$/)]);
      this.modalFormStype.get('mobileNo')?.updateValueAndValidity();
      this.modalFormStype.get('email')?.patchValue('');
      this.modalFormStype.get('email')?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]);
      this.modalFormStype.get('email')?.updateValueAndValidity();
      this.modalFormStype.get('organizationName')?.patchValue('');
      this.modalFormStype.get('organizationName')?.setValidators([Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z0-9 .]+$/)]);
      this.modalFormStype.get('organizationName')?.updateValueAndValidity();
      this.modalFormStype.get('qualification')?.patchValue('');
      this.modalFormStype.get('qualification')?.setValidators([Validators.required]);
      this.modalFormStype.get('qualification')?.updateValueAndValidity();
      this.modalFormStype.get('designation')?.patchValue('');
      this.modalFormStype.get('designation')?.setValidators([Validators.required]);
      this.modalFormStype.get('designation')?.updateValueAndValidity();
      this.modalFormStype.get('briefDescription')?.patchValue('');
      this.modalFormStype.get('briefDescription')?.setValidators([Validators.required]);
      this.modalFormStype.get('briefDescription')?.updateValueAndValidity();
      this.modalFormStype.get('specialization')?.patchValue('');
      this.modalFormStype.get('specialization')?.setValidators([Validators.required]);
      this.modalFormStype.get('specialization')?.updateValueAndValidity();
    }
  }

  onModalSubmitType() {
    if (this.modalFormStype.valid) {
      const newSourceType = this.modalFormStype.value;
      this.sourceTypes.push(newSourceType);

      this._commonService
        .add(APIS.programCreation.addResource, this.modalFormStype.value)
        .subscribe({
          next: (data) => {
            this.toastrService.success('Resource Person Created Successfully', "");
            this.getSessionResource();
          },
          error: (err) => {
            this.toastrService.error(err.message, "Location Creation Error!");
            new Error(err);
          },
        });

      const addResourceModal = document.getElementById('addResource');
      if (addResourceModal) {
        const modalInstance = bootstrap.Modal.getInstance(addResourceModal);
        modalInstance.hide();
      }
    }
  }

  getSessionResourceData: any = [];
  resourcekeyidData: any = {}
  getSessionResource() {
    this.resourcekeyidData = {}
    this.getSessionResourceData = []
    this._commonService
      .getById(APIS.programCreation.getAllResource+'/', this.agencyId)
      .subscribe({
        next: (data: any) => {
          this.getSessionResourceData = data.data;          
          this.getSessionResourceData.map((item: any) => {
            this.resourcekeyidData[item?.resourceId] = item.name
          })
          
          this.getSessionResourceData = this.getSessionResourceData.filter((item: any) => item.name != "Break")
        },
        error: (err: any) => {
          new Error(err);
        },
      });
  }

  ngOnInit(): void {
    this.getSessionResourceData = []
    this.sourceTypes = []
    this.getProgramsByAgency()
    this.getSessionResource();
    this.initializeSessionForm();

    // Watch sessionTypeName changes
    this.sessionForm.get('sessionTypeName')?.valueChanges.subscribe(value => {
      if (value === 'Break') {
        this.availableMethodologies = ['Break'];
        this.sessionForm.get('sessionTypeMethodology')?.setValue('Break'); // auto-select Break

        // Disable and make fields not mandatory
        this.sessionForm.get('resourceId')?.disable();
        this.sessionForm.get('resourceId')?.clearValidators();
        this.sessionForm.get('sessionStreamingUrl')?.disable();
        this.sessionForm.get('sessionStreamingUrl')?.clearValidators();
        this.sessionForm.get('uploaFiles')?.disable();
        this.sessionForm.get('uploaFiles')?.clearValidators();
        this.sessionForm.get('sessionDetails')?.disable();
        this.sessionForm.get('sessionDetails')?.clearValidators();
      } else if (value === 'Session') {
        this.availableMethodologies = this.allMethodologies.filter(m => m !== 'Break');
        this.sessionForm.get('sessionTypeMethodology')?.setValue('');

        // Enable and make fields mandatory
        this.sessionForm.get('resourceId')?.enable();
        this.sessionForm.get('resourceId')?.setValidators(Validators.required);
        this.sessionForm.get('sessionStreamingUrl')?.enable();
        this.sessionForm.get('uploaFiles')?.enable();
        this.sessionForm.get('sessionDetails')?.enable();
      } else {
        this.availableMethodologies = [...this.allMethodologies];
        this.sessionForm.get('sessionTypeMethodology')?.setValue('');

        // Enable and make fields mandatory
        this.sessionForm.get('resourceId')?.enable();
        this.sessionForm.get('resourceId')?.setValidators(Validators.required);
        this.sessionForm.get('sessionStreamingUrl')?.enable();
        this.sessionForm.get('uploaFiles')?.enable();
        this.sessionForm.get('sessionDetails')?.enable();
      }
    });
  }

  initializeSessionForm(): void {
    this.sessionForm = this.fb.group({
      sessionDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      sessionTypeName: ['', Validators.required],
      sessionTypeMethodology: ['', Validators.required],
      sessionDetails: [''],
      resourceId: ['', Validators.required],
      uploaFiles: [null],
      sessionStreamingUrl: [''],
      videoUrls: [''],
      sessionId: ['']
    });
  }  

  formatTime(timeValue: any) {
    if (timeValue) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      const suffix = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
    }
    return timeValue;
  }

  loading = false;
  onSubmitSessionForm(): void {
    this.loading = true;
    if (this.sessionForm.valid) {
      
      console.log('Form Submitted:', this.sessionForm.value);
      // Handle form submission logic here
      this.sessionForm.value.uploaFiles = this.uploadedFiles;
      let objectnew: any = [this.sessionForm.value]      
      
      const apiCalls = objectnew.map((element: any, index: any) => {
            const formData = new FormData();
            if(this.editFlag){              
              element['programSessionId'] = Number(element['sessionId']);
              delete element['sessionId'];
            }else {
              delete element['sessionId'];
            }
            // if(element['sessionId']){
            //   element['sessionId'] = Number(element['sessionId']);
            // }else {
            //   delete element['sessionId'];
            // }
            if (element['uploaFiles']) {
              element['uploaFiles'].forEach((file: any) => {
                formData.append("files", file);
              });
              element['startTime'] = this.formatTime(element['startTime']);
              element['endTime'] = this.formatTime(element['endTime']);
              element['sessionDate'] = moment(element['sessionDate']).format('DD-MM-YYYY');
              if (this.programId) {
                element['programId'] = Number(this.programId);
              } else {
                element['programId'] = Number(element['programId'] ? element['programId'] : 1);
              }
              if(element['videoUrls']) {
                element['videoUrls'] = element['videoUrls'];
              }else {
                delete element['videoUrls'];
              }

              if(element['sessionTypeName'] === 'Break') {
                element['resourceId'] = 102;
              }else {
                element['resourceId'] = Number(element['resourceId']);
              }
              
              delete element['uploaFiles'];
              //delete element['meterialType'];
              formData.set("data", JSON.stringify(element));
            } if (element['uploaFiles'] === null) {
              element['startTime'] = this.formatTime(element['startTime']);
              element['endTime'] = this.formatTime(element['endTime']);
              element['sessionDate'] = moment(element['sessionDate']).format('DD-MM-YYYY');
              if (this.programId) {
                element['programId'] = Number(this.programId);
              } else {
                element['programId'] = Number(element['programId'] ? element['programId'] : 1);
              }
              
              if(element['videoUrls']) {
                element['videoUrls'] = element['videoUrls'];
              }else {
                delete element['videoUrls'];
              }

              if(element['sessionTypeName'] === 'Break') {
                element['resourceId'] = 102;
              }else {
                element['resourceId'] = Number(element['resourceId']);
              }

              delete element['uploaFiles'];
              delete element['videoUrls'];
              //delete element['meterialType'];
              formData.set("data", JSON.stringify(element));
            }
            if(this.editFlag){
              return this._commonService.uploadImageSession(formData);
            }
            return this._commonService.uploadImage(formData);
          });
      
          forkJoin(apiCalls).subscribe({
            next: (results) => {
              this.loading = false;
              this.closeModal();
              this.toastrService.success('Session Details Created Successfully', "Session Creation Success!");
              this.getProgramDetailsById(this.programId);          
            },
            error: (err) => {
              this.loading = false;
              this.closeModal();
              this.toastrService.error(err, "Session Creation Error!");        
            },
          });

    } else {
      console.error('Form is invalid');
    }
  }

  @ViewChild('sessionFormModal') sessionFormModal!: ElementRef;
  closeModal(): void {
    const modal = bootstrap.Modal.getInstance(this.sessionFormModal.nativeElement);
    modal.hide();   
  }

  agencyProgramList: any;
  agencyProgramListFiltered: any ;
  programId: any = ''
  getProgramsByAgency() {
    this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListBySession + this.agencyId}?status=Program Scheduled`).subscribe({
      next: (res: any) => {
        this.agencyProgramList = res?.data
        this.programId=res.data[0]?.programId
        this.agencyProgramListFiltered= this.agencyProgramList
        this.dropdownProgramsList({ value: res.data[0]?.programId }, 'table');
      },
      error: (err) => {
        new Error(err);
      }
    })

    // this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgency + this.agencyId}`).subscribe({
    //   next: (res: any) => {
    //     this.agencyProgramList = res?.data
    //   },
    //   error: (err) => {
    //     new Error(err);
    //   }
    // })
  }

  dropdownProgramsList(event: any, type: any) {
    if (event.value) {
      this.programId = event.value
      this.getProgramDetailsById(this.programId);
    }else {
      this.programId = ''
      this.ProgramData = ''
    }
  }

  ProgramData: any
  getProgramDetailsById(programId: string) {
    this.ProgramData = ''
    this._commonService.getById(APIS.programCreation.getSingleProgramsList, programId).subscribe({
      next: (data: any) => {
        this.ProgramData = data.data;
      }
      , error: (err: any) => {
        new Error(err);
      }
    })
  }

  editFlag: boolean = false;
  showSessionEditModal(session?: any) {
    this.uploadedFiles = []
    if(!this.ProgramData?.programId) {
      this.toastrService.error("Please Select atleast one Program to add sessions", "Program Error");
      return;
    }
    if (!session) {
      this.sessionForm.reset();
      const editSessionModal = document.getElementById('sessionFormModal');
      if (editSessionModal) {
        const modalInstance = new bootstrap.Modal(editSessionModal);
        modalInstance.show();
      }

      // Enable and make fields mandatory
      this.sessionForm.get('resourceId')?.enable();
      this.sessionForm.get('resourceId')?.setValidators(Validators.required);

      this.sessionForm.get('sessionStreamingUrl')?.enable();
      this.sessionForm.get('sessionStreamingUrl')?.clearValidators();
      this.sessionForm.get('uploaFiles')?.enable();
      this.sessionForm.get('uploaFiles')?.clearValidators();
      this.sessionForm.get('sessionDetails')?.enable();
      this.sessionForm.get('sessionDetails')?.clearValidators();

      this.editFlag = false;
      if(this.ProgramData?.programSessionList?.length){
        const DummyData=this.ProgramData?.programSessionList.length
        this.sessionForm.patchValue({'sessionDate':this.convertToISOFormat(this.ProgramData?.programSessionList[DummyData-1]?.sessionDate),'startTime':this.convertTo24HourFormat(this.ProgramData?.programSessionList[DummyData-1]?.endTime)})
        // this.sessionForm.get('startTime')?.disable();
      }
      else{
        // this.sessionForm.get('startTime')?.enable();
      }
     
      return;
    }

    // Enable and make fields mandatory
    this.sessionForm.get('resourceId')?.enable();
    this.sessionForm.get('resourceId')?.setValidators(Validators.required);

    this.sessionForm.get('sessionStreamingUrl')?.enable();
    this.sessionForm.get('sessionStreamingUrl')?.clearValidators();
    this.sessionForm.get('uploaFiles')?.enable();
    this.sessionForm.get('uploaFiles')?.clearValidators();
    this.sessionForm.get('sessionDetails')?.enable();
    this.sessionForm.get('sessionDetails')?.clearValidators();


    this.editFlag = true;

    this.sessionForm.patchValue({
      sessionDate: this.convertToISOFormat(session.sessionDate),
      startTime: this.convertTo24HourFormat(session.startTime),
      endTime: this.convertTo24HourFormat(session.endTime),
      sessionTypeName: session.sessionTypeName,
      sessionTypeMethodology: session.sessionTypeMethodology,
      resourceId: session.resourceId,
      uploaFiles: null,
      sessionStreamingUrl: session.sessionStreamingUrl,
      videoUrls: session.videoUrls,
      sessionId: session.sessionId,
      sessionDetails: session.sessionDetails,
    });
    
    const editSessionModal = document.getElementById('sessionFormModal');
    if (editSessionModal) {
      const modalInstance = new bootstrap.Modal(editSessionModal);
      modalInstance.show();
    }
  }

  validateDate(type:any){
    if(type == 'MIN' && this.ProgramData?.startDate){
      const startDate = this.convertToISOFormat(this.ProgramData?.startDate);
      return startDate;
    }else if(type == 'MAX' && this.ProgramData?.endDate){
      const endDate = this.convertToISOFormat(this.ProgramData?.endDate);
      return endDate;
    }
    // else if(type == 'MIN' && !this.ProgramData?.startDate){
    //   let startDate = moment().startOf('Q').format('DD-MM-YYYY');
    //   return this.convertToISOFormat(startDate);
    // }else if(type == 'MAX' && !this.ProgramData?.endDate){
    //   let endDate = moment().endOf('Q').format('DD-MM-YYYY');
    //   return this.convertToISOFormat(endDate);
    // }    
    return ''
  }

  convertToISOFormat(date: any): string {    
    const [day, month, year] = date?.split('-');
    return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
  }

  convertTo24HourFormat(time: string): string {
    const [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  validateFileExtension(file: File): boolean {
    const allowedExtensions = ['xlsx', 'xls', 'doc', 'docx', 'ppt', 'pptx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return allowedExtensions.includes(fileExtension || '');
  }

  uploadedFiles: File[] = [];
  onFileChange(event: any) {
    // const file = event.target.files[0];
    // let urlsList: any = [];
    // if (file) {
    //   this.sessionForm.patchValue({ uploaFiles: file });
    // }
    const input = event.target as HTMLInputElement;
    let urlsList: any = [];

    if (input.files) {
      const newFiles = Array.from(input.files);
      const validFiles = newFiles.filter(file => this.validateFileExtension(file));
      if (validFiles.length !== newFiles.length) {
        this.toastrService.error('Invalid file type selected. Only Excel, Word, and PowerPoint files are allowed.', 'File Upload Error');
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
      this.sessionForm.patchValue({ videoUrls: urlsList });
    }
  }

  async encodeFileName(url: string) {
    const lastSlashIndex = url.lastIndexOf("/");
    
    if (lastSlashIndex === -1) {
      return url; // No slash found, return as is (should not happen for valid paths)
    }
  
    const path = url.substring(0, lastSlashIndex + 1); // Extract path before file name
    const fileName = url.substring(lastSlashIndex + 1); // Extract file name
    
    const encodedFileName = encodeURIComponent(fileName); // Encode only the file name
    
    return path + encodedFileName; // Reconstruct the URL
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

  deleteSessionId:any = ''
  deleteTitle:any = ''
  deleteSession(item: any) {
    this.deleteTitle = 'Delete Session'
    this.deleteSessionId = item?.sessionId
    const previewModal = document.getElementById('exampleModalDelete');
    if (previewModal) {
      const modalInstance = new bootstrap.Modal(previewModal);
      modalInstance.show();
    }
  }
  
  confirmDelete(id: any) {
    let url = `?sessionId=${id}`
    this._commonService.deleteById(APIS.programCreation.deleteSession, url).subscribe({
      next: (data: any) => {
        this.deleteTitle = ''
        console.log('Response from API:', data);
        if (data.includes('Deleted Session Successfully')) {
          this.toastrService.success('Session Deleted Successfully', "");
        } else {        
          this.toastrService.error("Something unexpected happened!!");          
        }
        this.closeModalDelete();
        this.deleteSessionId = ''
        this.getProgramDetailsById(this.programId);
      },
      error: (err: any) => {
        this.deleteTitle = ''
        this.closeModalDelete();
        this.deleteSessionId = ''
        this.toastrService.error("Something unexpected happened!!");
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

  closeConfirmSession() {
    const editSessionModal = document.getElementById('exampleModalDeleteConfirm');
    if (editSessionModal) {
      const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
      modalInstance.hide();
    }
  }

  sessionSubmissionFinal() {
    let data = {}
    this._commonService.add(`${APIS.programCreation.updateSessionByStatus}${this.programId}?status=Sessions Created`, data).subscribe({
      next: (data: any) => {
        console.log('Response from API:', data);
        this.toastrService.success('Session Details Submitted Successfully', "");
        this.closeConfirmSession();
        this.ProgramData = ''
        this.getProgramsByAgency()
      },
      error: (err: any) => {
        this.closeConfirmSession();        
        this.toastrService.error("Something unexpected happened!!");
        new Error(err);
      },
    });    
  }

  deleteFileData: any = {}
  deleteFile(parentIndex: number, fileIndex: number): void {
    // const confirmed = confirm('Are you sure you want to delete this file?');
    // if (confirmed) {
    //   //this.items[parentIndex].files.splice(fileIndex, 1);
    // }
    this.deleteTitle = 'Delete File'
    this.deleteFileData = {
      parentIndex: parentIndex,
      fileIndex: fileIndex
    }
    const previewModal = document.getElementById('exampleModalDelete');
    if (previewModal) {
      const modalInstance = new bootstrap.Modal(previewModal);
      modalInstance.show();
    }
  }

  confirmDeleteFile(deleteFileData: any) {
    const { parentIndex, fileIndex } = deleteFileData;       
    let url = `${parentIndex?.programSessionFileId}`
    
    this._commonService.deleteId(APIS.programCreation.sessionFilesDelete, url).subscribe({
      next: (data: any) => {
        this.deleteTitle = ''
        console.log('Response from API:', data);
        if (data?.message.includes('File deleted successfully')) {
          this.toastrService.success('File deleted successfully', "");          
        } else {        
          this.toastrService.error("Something unexpected happened!!");          
        }
        this.closeModalDelete();
        this.deleteSessionId = ''
        this.getProgramDetailsById(this.programId);
      },
      error: (err: any) => {
        this.deleteTitle = ''
        this.closeModalDelete();
        this.deleteSessionId = ''
        this.toastrService.error("Something unexpected happened!!");
        new Error(err);
      },
    });
  }
  downloadSessions(){
    let linkUrl = APIS.programCreation.downloadSessionsData+this.programId
    const link = document.createElement("a");
    link.setAttribute("download", linkUrl);
    link.setAttribute("target", "_blank");
    link.setAttribute("href", linkUrl);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
