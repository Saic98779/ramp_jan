import { Component, OnInit,ViewChild, ElementRef,ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import moment from "moment";
declare var bootstrap: any;
@Component({
  selector: 'app-program-sessions',
  templateUrl: './program-sessions.component.html',
  styleUrls: ['./program-sessions.component.css']
})
export class ProgramSessionsComponent implements OnInit {

  modalFormStype!: FormGroup;
  sourceTypes: any = [];
  agencyId: any
  programCreationMain!: FormGroup;
  programCreationSub!: FormGroup;
  programId: any = '';
  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {
    this.formDetails();
    this.formDetailsTwo();
    this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
    this.modalFormStype = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z .]+$/)]],
      mobileNo: ['', [Validators.required, Validators.pattern(/^[6789]\d{9}$/)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      organizationName: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z0-9 .]+$/)]],
      qualification: ['', Validators.required],
      designation: ['', Validators.required],
      specialization: ['', Validators.required],
      briefDescription: ['', Validators.required],
      gender: ['', Validators.required],
      agencyIds: [[this.agencyId]],
    });
  }

  ngOnInit(): void {
    this.programId = this.route.snapshot.paramMap.get('id');
    if (this.programId) {
      this.getProgramDetailsById(this.programId);
    }
    this.getSessionResource();
    (this.programCreationSub?.controls["details"] as FormArray).clear();
    this.onAddRow(0);
    this.getProgramsByAgency()
  }

  uploadedFiles: any = [];
  validateFileExtension(file: File): boolean {
    const allowedExtensions = ['xlsx', 'xls', 'doc', 'docx', 'ppt', 'pptx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return allowedExtensions.includes(fileExtension || '');
  }

  onFilesSelected(event: any, index: any) {
    const input = event.target as HTMLInputElement;
    const rows = this.programCreationSub.get('details') as FormArray;
    let urlsList: any = [];
    if (rows && input.files) {
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
      rows.at(index).get('uploaFiles')?.setValue(validFiles);
      rows.at(index).get('videoUrls')?.setValue(urlsList);
    }
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

  submitForm() {
    if (!this.programCreationSub?.controls["details"]?.value[0].startTime) {
      this.toastrService.error('Please fill all the required fields in add sessions', 'Error!');
      return;
    }
    let val = { ...this.programCreationMain.value };
    val = { ...this.programCreationMain.value, programSessionList: this.programCreationSub?.controls["details"]?.value };
    let maindata = { ...this.programCreationMain.value };
    maindata['activityId'] = this.programCreationMain.value.activityId;
    maindata['subActivityId'] = this.programCreationMain.value.subActivityId;
    maindata['locationId'] = this.programCreationMain.value.programLocation;
    maindata['agencyId'] = this.agencyId;
    maindata['startTime'] = this.formatTime(maindata['startTime']);
    maindata['endTime'] = this.formatTime(maindata['endTime']);
    maindata['startDate'] = moment(maindata['startDate']).format('DD-MM-YYYY');
    maindata['endDate'] = moment(maindata['endDate']).format('DD-MM-YYYY');
    const programData = JSON.parse(localStorage.getItem('programDetails') || '[]');
    programData.push(val);
    localStorage.setItem('programDetails', JSON.stringify(programData));
    let objectnew: any = [...this.programCreationSub?.controls["details"]?.value];
    console.log(objectnew,'objectnew')
    const apiCalls = objectnew.map((element: any, index: any) => {
      const formData = new FormData();
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
        element['resourceId'] = Number(element['resourceId']);
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
        element['resourceId'] = Number(element['resourceId']);
        delete element['uploaFiles'];
        delete element['videoUrls'];
        //delete element['meterialType'];
        formData.set("data", JSON.stringify(element));
      }
      return this._commonService.uploadImage(formData);
    });

    forkJoin(apiCalls).subscribe({
      next: (results) => {
        this.closeModal();
        this.toastrService.success('Session Details Created Successfully', "Session Creation Success!");
        this.getProgramDetailsById(this.programId);          
      },
      error: (err) => {
        this.closeModal();
        this.toastrService.error(err, "Session Creation Error!");        
      },
    });
  }

  @ViewChild('exampleModal') exampleModal!: ElementRef;
  openModal(): void {    
    if(this.programId){
    const detailsArray = this.programCreationSub.get('details') as FormArray;

    // ✅ Ensure all form controls are marked as touched & trigger validation
    detailsArray.controls.forEach((rowGroup: AbstractControl) => {

      (rowGroup as FormGroup).markAllAsTouched();  // 🔹 Mark the entire row as touched
      (rowGroup as FormGroup).updateValueAndValidity(); // 🔹 Force re-evaluation
    });

    // ✅ Force Angular to detect UI changes
    this.cdRef.detectChanges();

    // 🔎 Debugging: Log each field's state
    detailsArray.controls.forEach((rowGroup, index) => {
      console.log(`Row ${index + 1} Errors:`, rowGroup.errors);
      Object.entries((rowGroup as FormGroup).controls).forEach(([key, control]) => {
        console.log(`Field: ${key}, Touched: ${control.touched}, Invalid: ${control.invalid}`);
      });
    });

    console.log('Form Valid:', this.programCreationSub.valid);
    console.log('Form Errors:', this.programCreationSub.errors);

    // 🚨 If form is invalid, show error message and prevent modal opening
    if (this.programCreationSub.invalid) {
      this.toastrService.error('Please fill all required fields in the form.', 'Validation Error!');
      return;
    }

    const modal = new bootstrap.Modal(this.exampleModal.nativeElement);
    modal.show();
  }
  else{
    this.toastrService.error('Please select Program first', 'Validation Error!');
  }
  }

  closeModal(): void {
    const modal = bootstrap.Modal.getInstance(this.exampleModal.nativeElement);
    modal.hide();
  }
  
  agencyProgramList: any;
  // programId: any = ''
  getProgramsByAgency() {
    this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgency + '/' + this.agencyId}`).subscribe({
      next: (res: any) => {
        this.agencyProgramList = res?.data
      },
      error: (err) => {
        new Error(err);
      }
    })
  }

  dropdownProgramsList(event: any, type: any) {
    if(event.target.value){
      this.programId = event.target.value
    this.getProgramDetailsById(this.programId);
     }
  }
    

  convertToISOFormat(date: string): string {
    console.log(date)
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
  }
  ProgramData:any
  getProgramDetailsById(programId: string) {
    this._commonService.getById(APIS.programCreation.getSingleProgramsList, programId).subscribe({
      next: (data: any) => {
        this.ProgramData=data.data
        const program = data.data;
        this.programCreationMain.patchValue({
          activityId: program.activityId,
          subActivityId: program.subActivityId,
          programType: program.programType,
          //programDetails: program.programDetails,
          programTitle: program.programTitle,
          startDate: this.convertToISOFormat(program.startDate),
          endDate: this.convertToISOFormat(program.endDate),
          startTime: this.convertTo24HourFormat(program.startTime),
          endTime: this.convertTo24HourFormat(program.endTime),
          spocName: program.spocName,
          spocContactNo: program.spocContactNo,
          programLocation: program.programLocation,
          kpi: program.kpi,
        });

        const sessionArray = this.programCreationSub.get('details') as FormArray;
        sessionArray.clear();
        console.log(sessionArray,program.programSessionList,program.startDate)
        if (program.programSessionList.length) {
          program.programSessionList.forEach((session: any, index: any) => {
            console.log(session)
            const sessionGroup = this.initiateForm();
            sessionGroup.patchValue({
              sessionDate: this.convertToISOFormat(session.sessionDate),
              startTime: this.convertTo24HourFormat(session.startTime),
              endTime: this.convertTo24HourFormat(session.endTime),
              sessionTypeName: session.sessionTypeName,
              sessionTypeMethodology: session.sessionTypeMethodology,
              sessionDetails: session.sessionDetails,
              resourceId: session.resourceId,
              //meterialType: session.meterialType,
              uploaFiles: null,
              sessionStreamingUrl: session.sessionStreamingUrl,
              videoUrls: session.videoUrls,
              sessionId: session.sessionId,
            });
            sessionArray.push(sessionGroup);
          });
          //this.reinitializeDataTable();
        } else {
          (this.programCreationSub?.controls["details"] as FormArray).clear();
          
          this.onAddRow(0);
          // const sessionGroup = this.initiateForm();
         
          // sessionGroup.patchValue({
          //   sessionDate: this.convertToISOFormat(program.startDate),})
        }
      },
      error: (err: any) => {
        this.toastrService.error(err.message, "Error fetching program details!");
      }
    });
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

  get f2() {
    return this.programCreationMain.controls;
  }

  formDetails() {

    this.programCreationMain = new FormGroup({
      activityId: new FormControl("", [Validators.required]),
      subActivityId: new FormControl("", [Validators.required]),
      programType: new FormControl("", [Validators.required]),
      //programDetails: new FormControl("", [Validators.required]),
      programTitle: new FormControl("", [Validators.required, Validators.pattern(/^[a-zA-Z]+(\s[a-zA-Z]+)*$/)]),
      startDate: new FormControl("", [Validators.required]),
      endDate: new FormControl("", [Validators.required]),
      startTime: new FormControl("", [Validators.required]),
      endTime: new FormControl("", [Validators.required]),
      spocName: new FormControl("", [Validators.required, Validators.pattern(/^[a-zA-Z]+(\s[a-zA-Z]+)*$/)]),
      spocContactNo: new FormControl("", [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
      programLocation: new FormControl("", [Validators.required]),
      kpi: new FormControl("", [Validators.required]),
    }, { validators: this.validateDates as ValidatorFn });
    // Mark all controls as touched to show validation errors immediately
    //Object.values(this.programCreationMain.controls).forEach(control => control.markAsTouched());
  }

  validateDates: ValidatorFn = (formGroup: AbstractControl): ValidationErrors | null => {
    const startDate = formGroup.get('startDate')?.value;
    const endDate = formGroup.get('endDate')?.value;

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      formGroup.get('endDate')?.setErrors({ invalidEndDate: true });
      return { invalidEndDate: true };
    } else {
      formGroup.get('endDate')?.setErrors(null);
      return null;
    }
  }

  formDetailsTwo() {
    this.programCreationSub = new FormGroup({
      details: this.fb?.array([this.fb.group({
        sessionDate: new FormControl("", Validators.required),
        startTime: new FormControl("",Validators.required),
        endTime: new FormControl("", Validators.required),
        sessionTypeName: new FormControl("", Validators.required),
        sessionTypeMethodology: new FormControl("", Validators.required),
        sessionDetails: new FormControl("ABC",),
        resourceId: new FormControl("", Validators.required),
        //meterialType: new FormControl("",),
        uploaFiles: [null, Validators.required],
        sessionStreamingUrl: new FormControl("", Validators.required),
        videoUrls: [null, Validators.required],
      })]),
    });
  }

  get addDynamicRow() {
    return this.programCreationSub?.get("details") as FormArray;
  }

  initiateForm(): FormGroup {
    return this.fb.group({
      sessionDate:  [, Validators.required],
      startTime:  ['', Validators.required],
      endTime:  ['', Validators.required],
      sessionTypeName:  ['', Validators.required],
      sessionTypeMethodology:  ['', Validators.required],
      sessionDetails:  ['ABC'],
      resourceId:  ['', Validators.required],
      //meterialType: "",
      uploaFiles: [null],
      sessionStreamingUrl:  ['', Validators.required],
      videoUrls:  [''],
      sessionId:  [''],
    });
  }

  onAddRow(index: any) {
    const control:any = this.programCreationSub?.get("details") as FormArray;
    control.push(this.initiateForm());
    // console.log(control.value)
    // if(index==0 && this.programCreationMain.value.startDate){
    //   // control.value.patchValue({sessionDate:this.convertToISOFormat(this.programCreationMain.value.startDate)})
    //   control.value[0]['sessionDate']=this.convertToISOFormat(this.programCreationMain.value.startDate)
    // }
  }

  onRemoveRow(rowIndex: number) {
    const control = this.programCreationSub?.get("details") as FormArray;
    control.removeAt(rowIndex);
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
  resourcekeyidData:any={}
  getSessionResource() {
    this.resourcekeyidData={}
    this.getSessionResourceData =[]
    this._commonService
      .getById(APIS.programCreation.getAllResource+'/', this.agencyId)
      .subscribe({
        next: (data: any) => {
          this.getSessionResourceData = data.data;
          this.getSessionResourceData.map((item:any)=>{
            this.resourcekeyidData[item?.resourceId]=item.name
          })

        },
        error: (err: any) => {
          new Error(err);
        },
      });
  }

}
