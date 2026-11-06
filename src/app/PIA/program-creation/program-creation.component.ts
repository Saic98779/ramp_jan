import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import moment from "moment";
declare var bootstrap: any;
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
declare var $: any;
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

@Component({
  selector: 'app-program-creation',
  templateUrl: './program-creation.component.html',
  styleUrls: ['./program-creation.component.css']
})
export class ProgramCreationComponent implements OnInit, AfterViewInit {
  programCreationMain!: FormGroup;
  programCreationSub!: FormGroup;
  locationForm!: FormGroup;
  programId: string | null = null;
  agencyId:any
  @ViewChild("pickerstart") pickerstart!: TemplateRef<any>;
  @ViewChild("pickerEnd") pickerEnd!: TemplateRef<any>;
  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.formDetails();   
    this.getAllDistricts() 
    this.formDetailsLocation();    
    this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;    
    this.getProgramLocation();    
    this.getProgramTypeData();
    this.getAllActivityList()
    this.getProgramsByAgency()
  }

  ngOnInit(): void {
    this.programId = this.route.snapshot.paramMap.get('id');
    if (this.programId) {
      this.getProgramDetailsById(this.programId);
    }
    console.log(this.programId, 'programId');
    //(document.getElementById('collapseExample') as HTMLElement).classList.add('show');
    
    this.programCreationMain.controls['activityId'].valueChanges.subscribe((activityId: any) => {
      if(activityId) this.getSubActivitiesList(activityId);
    });
  }
  allDistricts:any
  getAllDistricts(){
    this.allDistricts = []
    this._commonService.getDataByUrl(APIS.masterList.getDistricts).subscribe({
      next: (data: any) => {
        this.allDistricts = data.data;
      },
      error: (err: any) => {
        this.allDistricts = [];
      }
    })
  }
  MandalList:any
  GetMandalByDistrict(event: any) {
    this.MandalList=[]
    this._commonService.getDataByUrl(APIS.masterList.getMandalName + event).subscribe({
      next: (data: any) => {
        this.MandalList = data.data;
      },
      error: (err: any) => {
        this.MandalList = [];
      }
    })

  }
  activityList:any
  subActivitiesList:any
  getAllActivityList(){
    this.subActivitiesList = []
    this._commonService.getById(APIS.programCreation.getActivityListbyId,this.agencyId).subscribe({
      next: (data: any) => {
        this.activityList = data.data;
      },
      error: (err: any) => {
        this.activityList = [];
      }
    })
  }

  getSubActivitiesList(activityId: any){
    this._commonService.getDataByUrl(`${APIS.programCreation.getSubActivityListByActivity+'/'+activityId}`).subscribe({
      next: (data: any) => {
        this.subActivitiesList = data.data.subActivities;
      },
      error: (err: any) => {
        this.subActivitiesList = [];
      }
    })
  }

  ngAfterViewInit(): void {
    // setTimeout(() => {
    //   new DataTable('#creation-table', {
    //     scrollY: "415px",
    //     scrollX: true,
    //     scrollCollapse: true,
    //     autoWidth: true,
    //     paging: false,
    //     info: false,
    //     searching: false,
    //     destroy: true,
    //   });
    // }, 500);
  }

  get f2() {
    return this.programCreationMain.controls;
  }

  get fLocation() {
    return this.locationForm.controls;
  }

  formDetails() {
    
    this.programCreationMain = new FormGroup({
      activityId: new FormControl("", [Validators.required]),
      subActivityId: new FormControl("", [Validators.required]),
      // programType: new FormControl("", [Validators.required]),
      //programDetails: new FormControl("", [Validators.required]),new FormControl("",[Validators.pattern(/^[^\s].*/)]),
      programTitle: new FormControl("", [Validators.required, Validators.pattern(/^[^\s].*/)]),
      startDate: new FormControl("", [Validators.required]),
      endDate: new FormControl("", [Validators.required]),
      startTime: new FormControl("", [Validators.required]),
      endTime: new FormControl("", [Validators.required]),
      // spocName: new FormControl("", [Validators.required, Validators.pattern(/^[a-zA-Z]+(\s[a-zA-Z . ]+)*$/)]),
      spocName: new FormControl("", [Validators.required,Validators.pattern(/^[A-Za-z][A-Za-z .]*$/)]), //Validators.required
      spocContactNo: new FormControl("", [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
      programLocation: new FormControl("", [Validators.required]),
      // kpi: new FormControl("", [Validators.required]),
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

  formDetailsLocation() {
    this.locationForm = new FormGroup({
      locationName: new FormControl("", [Validators.required,Validators.pattern(/^[A-Za-z ]+$/)]),
      ownershipType: new FormControl(""),
      typeOfVenue: new FormControl("", [Validators.required]),
      latitude: new FormControl(""),
      longitude: new FormControl("",),
      googleMapUrl: new FormControl("",[Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)]),
      OthersType: new FormControl("",),
      capacity: new FormControl("",[Validators.required,Validators.pattern(/^[1-9]\d*$/)]),
      agencyId: new FormControl("",),
      filePath: new FormControl("",),
      district: new FormControl("",),
      mandal: new FormControl("",),
    });
  }

  get addDynamicRow() {
    return this.programCreationSub?.get("details") as FormArray;
  }

  initiateForm(): FormGroup {
    return this.fb.group({
      sessionDate: "",
      startTime: "",
      endTime: "",
      sessionTypeName: "",
      sessionTypeMethodology: "",
      sessionDetails: "",
      resourceId: '',
      //meterialType: "",
      uploaFiles: [null],
      sessionStreamingUrl: "",
      videoUrls: []
    });
  }

  onAddRow(index: any) {
    const control = this.programCreationSub?.get("details") as FormArray;
    control.push(this.initiateForm());
  }

  onRemoveRow(rowIndex: number) {
    const control = this.programCreationSub?.get("details") as FormArray;
    control.removeAt(rowIndex);
  }

  convertToBlob(file: File): Blob {
    return new Blob([file]);
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
  
  getProgrameIdBasesOnSave:any
  loading = false;
  submitProgramCreation() {
    this.getProgrameIdBasesOnSave = ''
    let maindata = { ...this.programCreationMain.value };
    maindata['startTime'] = this.formatTime(maindata['startTime'])
    maindata['endTime'] = this.formatTime(maindata['endTime'])
    maindata['startDate'] = this.convertToISOFormat(maindata['startDate'])
    maindata['endDate'] = moment(maindata['endDate']).format('DD-MM-YYYY')
    maindata['locationId'] = Number(this.programCreationMain.value?.programLocation)
    maindata['agencyId'] = Number(this.agencyId)
    maindata['activityId'] = Number(this.programCreationMain.value?.activityId)
    maindata['subActivityId'] = Number(this.programCreationMain.value?.subActivityId)
    maindata['userId'] = JSON.parse(sessionStorage.getItem('user') || '{}').userId
    this.loading = true;
    if(this.programId) {
      maindata['programId'] = Number(this.programId)
      console.log(this.ProgramupdatingData,'ProgramupdatingData',maindata);
      if(this.ProgramupdatingData.status){
         maindata['status'] = this.ProgramupdatingData.status;
      }
      
      this._commonService.add(APIS.programCreation.updateProgram, maindata).subscribe({
        next: (data) => {      
          this.loading = false;    
          this.toastrService.success('Program Updated Successfully', "Success!");
          this.getProgramDetailsById(maindata['programId']);      
          this.redirect()    
        },
        error: (err) => {
          this.loading = false;
          this.toastrService.error(err.message, "Program Creation Error!");
          new Error(err);
        },
      })
    }else {
      this._commonService.add(APIS.programCreation.addprogram, maindata).subscribe({
        next: (data) => {
          this.loading = false;
          this.getProgrameIdBasesOnSave = data.data
          this.toastrService.success('Program Created Successfully', "Success!");
          this.programCreationMain.reset();
          this.getProgramsByAgency()
        },
        error: (err) => {
          this.loading = false;
          this.toastrService.error(err.message, "Program Creation Error!");
          new Error(err);
        },
      })
    }
    
  }

  redirect() {
    this.router.navigate(['/veiw-program-creation']);
  }

  onModalSubmitLocation() {
    let payload: any = { ...this.locationForm.value };
    payload['typeOfVenue'] == 'Others' ? payload['typeOfVenue'] = payload['OthersType'] : payload['typeOfVenue'];
    payload['agencyId'] = this.agencyId;
    delete payload['OthersType'];
    this._commonService
      .add(APIS.programCreation.addLocation, payload)
      .subscribe({
        next: (data) => {
          this.toastrService.success('Location Added Successfully', "Success!");
          this.locationForm.reset();
          this.getProgramLocation();
        },
        error: (err) => {
          this.toastrService.error(err.message, "Location Creation Error!");
          new Error(err);
        },
      });
  }

  getProgramLocationData: any = [];
  getProgramLocation() {
    this._commonService
      .getById(APIS.programCreation.getLocation, this.agencyId)
      .subscribe({
        next: (data: any) => {
          this.getProgramLocationData = data.data;
        },
        error: (err: any) => {
          new Error(err);
        },
      });
  }

  getProgramType: any = [];
  getProgramTypeData() {
    this._commonService
      .getById(APIS.programCreation.getProgramType, this.agencyId)
      .subscribe({
        next: (data: any) => {
          this.getProgramType = data.data;
        },
        error: (err: any) => {
          new Error(err);
        },
      });
  }

  uploadedFiles: any = [];
  // onFilesSelected(event: any, index: any) {
  //   const input = event.target as HTMLInputElement;
  //   const rows = this.programCreationSub.get('details') as FormArray;
  //   let urlsList: any = [];
  //   if (rows && input.files) {
  //     const newFiles = Array.from(input.files);
  //     for (let i = 0; i < input.files.length; i++) {
  //       const fileName = input.files[i].name;
  //       const fakePath = `${fileName}`;
  //       urlsList.push(fakePath);
  //     }
  //     rows.at(index).get('uploaFiles')?.setValue(newFiles);
  //     rows.at(index).get('videoUrls')?.setValue(urlsList);
  //   }
  // }
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

  convertToISOFormat(date: string): string {
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
  }
  isedit:boolean = false
  ProgramupdatingData:any
  getProgramDetailsById(programId: string) {
    this.isedit=true
    this._commonService.getById(APIS.programCreation.getSingleProgramsList, programId).subscribe({
      next: (data: any) => {
        const program = data.data;
        this.ProgramupdatingData = data.data;
        this.programCreationMain.patchValue({
          activityId: program.activityId,
          subActivityId: program.subActivityId,
          // programType: program.programType,
          //programDetails: program.programDetails,
          programTitle: program.programTitle,
          startDate: this.convertToISOFormat(program.startDate),
          endDate: this.convertToISOFormat(program.endDate),
          startTime: this.convertTo24HourFormat(program.startTime),
          endTime: this.convertTo24HourFormat(program.endTime),
          spocName: program.spocName,
          spocContactNo: program.spocContactNo,
          programLocation: program.programLocation,
          // kpi: program.kpi,
        });

        if (this.programCreationMain.invalid) {
          Object.values(this.programCreationMain.controls).forEach(control => {
            control.markAsTouched();
          });
        }

        // const sessionArray = this.programCreationSub.get('details') as FormArray;
        // sessionArray.clear();
        // if(program.programSessionList.length) {
        //   program.programSessionList.forEach((session: any, index: any) => {
        //     const sessionGroup = this.initiateForm();
        //     sessionGroup.patchValue({
        //       sessionDate: moment(session.sessionDate).format('YYYY-MM-DD'),
        //       startTime: this.convertTo24HourFormat(session.startTime),
        //       endTime: this.convertTo24HourFormat(session.endTime),
        //       sessionTypeName: session.sessionTypeName,
        //       sessionTypeMethodology: session.sessionTypeMethodology,
        //       sessionDetails: session.sessionDetails,
        //       resourceId: session.resourceId,
        //       //meterialType: session.meterialType,
        //       uploaFiles: null,
        //       sessionStreamingUrl: session.sessionStreamingUrl,
        //       videoUrls: session.videoUrls,
        //     });
        //     sessionArray.push(sessionGroup);
        //   });
        //   //this.reinitializeDataTable();
        // }else {
        //   (this.programCreationSub?.controls["details"] as FormArray).clear();
        //   this.onAddRow(0);
        // }
      },
      error: (err: any) => {
        this.toastrService.error(err.message, "Error fetching program details!");
      }
    });
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
    this.dataTable = new DataTable('#creation-table', {              
      // scrollX: true,
      // scrollCollapse: true,    
      // responsive: true,    
      // paging: true,
      // searching: true,
      // ordering: true,
      scrollY: "415px",     
      scrollX:        true,
      scrollCollapse: true,
      autoWidth:         true,  
      paging:         false,  
      info: false,   
      searching: false,  
      order: [[0, 'asc']],
      destroy: true, // Ensure reinitialization doesn't cause issues
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

  agencyProgramList: any;
  programIds:any=''
  getProgramsByAgency() {
    this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgency+'/'+this.agencyId}`).subscribe({
      next: (res: any) => {
        this.agencyProgramList = res?.data
      },
      error: (err) => {
        new Error(err);
      }
    })
  }

  dropdownProgramsList(event: any, type: any) {
    this.programIds = event.target.value
    this.getProgramDetailsById(this.programIds);
  }
}