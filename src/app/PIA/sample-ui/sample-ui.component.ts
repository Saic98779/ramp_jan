import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';


interface UnitDetails {
  aadharNo: string | null;
  bankName: string | null;
  branchNameAddress: string | null;
  caste: string | null;
  category: string | null;
  commAlternateNo: string | null;
  commDistrict: string | null;
  commDoorNo: string | null;
  commLandmark: string | null;
  commLocality: string | null;
  commMandal: string | null;
  commMobileNo: string | null;
  commNameOfTheBuilding: string | null;
  commPinCode: string | null;
  commStreet: string | null;
  commVillage: string | null;
  commenceDate: string | null;
  communicationAddress: string | null;
  currentStatus: string | null;
  dateOfBirth: string | null;
  dateOfRegistration: string | null;
  departmentName: string | null;
  designation: string | null;
  din: string | null;
  district: string | null;
  doorNo: string | null;
  emailAddress: string | null;
  enterpriseType: string | null;
  femaleEmpsTotal: string | null;
  firmRegYear: string | null;
  firstMiddleLastName: string | null;
  floorNo: string | null;
  gender: string | null;
  gstRegNo: string | null;
  ifscCode: string | null;
  incorporationDate: string | null;
  institutionDetails: string | null;
  latitude: string | null;
  loadKva: number | null;
  loanAppliedDate: string | null;
  loanSanctionDate: string | null;
  locality: string | null;
  longitude: string | null;
  ltHt: number | null;
  maleEmpsTotal: string | null;
  mandal: string | null;
  msmeDist: string | null;
  msmeSector: string | null;
  msmeState: string | null;
  nationality: string | null;
  natureOfBusiness: string | null;
  netTurnoverRupees: number | null;
  nicCode: string | null;
  officeContact: string | null;
  officeEmail: string | null;
  orgnType: string | null;
  pan: string | null;
  passportNo: string | null;
  photograph: string | null;
  pinCode: string | null;
  principalBusinessPlace: string | null;
  productDesc: string | null;
  purpose: string | null;
  qualification: string | null;
  registrationNo: string | null;
  registrationUnder: string | null;
  releaseDateDoc: string | null;
  remarks: string | null;
  serviceNo: string | null;
  slno: number | null;
  sourceOfLoan: string | null;
  specialCategory: string | null;
  street: string | null;
  subsidyApplicationDate: string | null;
  typeOfLoan: string | null;
  udyamAadharRegistrationNo: string | null;
  udyamRegistrationNo: string | null;
  uniqueNo: string | null;
  unitAddress: string | null;
  unitCostOrInvestment: number | null;
  unitHolderOrOwnerName: string | null;
  unitName: string | null;
  village: string | null;
  villageId: string | null;
  ward: string | null;
  workingCapital: string | null;
}

// Add this interface for additional information
interface SupportNeeded {
  marketing: boolean;
  rawMaterials: boolean;
  finance: boolean;
}

@Component({
  selector: 'app-sample-ui',
  templateUrl: './sample-ui.component.html',
  styleUrls: ['./sample-ui.component.css']
})
export class SampleUiComponent implements OnInit {

  // Selected values
  selectedDistrict: string = '';
  selectedMandal: string = '';
  selectedVillage: string = '';
  selectedUnit: string = '';

  // Dropdown data arrays
  districts: any = [];
  mandals: any = [];
  villages: any = [];
  units: any = [];

  // Filtered arrays for Material select filter
  districtsFiltered: any = [];
  mandalsFiltered: any = [];
  villagesFiltered: any = [];
  unitsFiltered: any = [];

  // Unit details
  unitDetails: any  = {};

  // Loading states
  isLoadingDistricts: boolean = false;
  isLoadingMandals: boolean = false;
  isLoadingVillages: boolean = false;
  isLoadingUnits: boolean = false;
  isLoadingUnitDetails: boolean = false;

  constructor(
    private _commonService: CommonServiceService,
    private toastrService: ToastrService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadDistricts();
  }

 
   loadDistricts(): void {
    this.isLoadingDistricts = true;
     this._commonService.getDataByUrl(`https://ramp-tg.metaversedu.in/workflow/districts`).subscribe({
      next: (res: any) => {
        this.districts = res || [];
        this.districtsFiltered = [...this.districts];
        this.isLoadingDistricts = false;
      },
      error: (error) => {
        this.toastrService.error('Failed to load districts');
        console.error('Error loading districts:', error);
        this.isLoadingDistricts = false;
      }
    });
  }

  onDistrictChange(): void {
    // Reset dependent dropdowns
    this.selectedMandal = '';
    this.selectedVillage = '';
    this.selectedUnit = '';
    this.mandals = [];
    this.villages = [];
    this.units = [];
    this.mandalsFiltered = [];
    this.villagesFiltered = [];
    this.unitsFiltered = [];
    this.unitDetails = {};

    if (this.selectedDistrict) {
      this.loadMandals(this.selectedDistrict);
    }
  }

  loadMandals(districtId: string): void {
    this.isLoadingMandals = true;
    this._commonService.getDataByUrl(`https://ramp-tg.metaversedu.in/workflow/mandals/${districtId}`).subscribe({
      next: (res: any) => {
        this.mandals = res || [];
        this.mandalsFiltered = [...this.mandals];
        this.isLoadingMandals = false;
      },
      error: (error) => {
        this.toastrService.error('Failed to load mandals');
        console.error('Error loading mandals:', error);
        this.isLoadingMandals = false;
      }
    });
  }

  onMandalChange(): void {
    // Reset dependent dropdowns
    this.selectedVillage = '';
    this.selectedUnit = '';
    this.villages = [];
    this.units = [];
    this.villagesFiltered = [];
    this.unitsFiltered = [];
    this.unitDetails = {};

    if (this.selectedMandal) {
      this.loadVillages(this.selectedMandal);
    }
  }

  loadVillages(mandalId: string): void {
    this.isLoadingVillages = true;
    this._commonService.getDataByUrl(`https://ramp-tg.metaversedu.in/workflow/villages/${mandalId}`).subscribe({
      next: (res: any) => {
        this.villages = res || [];
        this.villagesFiltered = [...this.villages];
        this.isLoadingVillages = false;
      },
      error: (error) => {
        this.toastrService.error('Failed to load villages');
        console.error('Error loading villages:', error);
        this.isLoadingVillages = false;
      }
    });
  }

  onVillageChange(): void {
    // Reset dependent dropdowns
    this.selectedUnit = '';
    this.units = [];
    this.unitsFiltered = [];
    this.unitDetails = {};

    if (this.selectedVillage) {
      this.loadUnits(this.selectedVillage);
    }
  }

  loadUnits(villageId: string): void {
    this.isLoadingUnits = true;
    let mandalname=this.mandals.find((v: { mandalId: string; })=>v.mandalId===this.selectedMandal)?.mandalName;
    this._commonService.getDataByUrl(`https://ramp-tg.metaversedu.in/workflow/units?village=${villageId}&madal=${mandalname}`).subscribe({
      next: (res: any) => {
        this.units = res || [];
        this.unitsFiltered = [...this.units];
        this.isLoadingUnits = false;
      },
      error: (error) => {
        this.toastrService.error('Failed to load units');
        console.error('Error loading units:', error);
        this.isLoadingUnits = false;
      }
    });
  }



  updateUnitDetails(): void {

    if (this.unitDetails && this.selectedUnit) {
      this._commonService.updatedata(`${APIS.unitDetails.updateUnitDetails}/${this.selectedUnit}`, this.unitDetails).subscribe({
        next: (res: any) => {
          this.toastrService.success('Unit details updated successfully!');
          console.log('Unit details updated:', res);
        },
        error: (error) => {
          this.toastrService.error('Failed to update unit details');
          console.error('Error updating unit details:', error);
        }
      });
    }
  }

  // Filter methods for Material select
  onDistrictsFiltered(filteredList: any[]): void {
    this.districtsFiltered = filteredList;
  }

  onMandalsFiltered(filteredList: any[]): void {
    this.mandalsFiltered = filteredList;
  }

  onVillagesFiltered(filteredList: any[]): void {
    this.villagesFiltered = filteredList;
  }

  onUnitsFiltered(filteredList: any[]): void {
    this.unitsFiltered = filteredList;
  }
 

  // Additional Information tab properties
  topProducts: string[] = ['', '', '', '', '']; // Array for 5 products
  isExporting: boolean | null = null; // For radio button selection
  supportNeeded: SupportNeeded = {
    marketing: false,
    rawMaterials: false,
    finance: false
  };


  isUpdatingAdditionalInfo: boolean = false; // Add loading state for update

  onUnitChange(event:any): void {
    console.log('Selected Unit Event:', event);
    this.unitDetails = event;


    // Reset additional information when unit changes
    // this.resetAdditionalInfo();
    
    // if (this.selectedUnit) {
    //   this.showUnitDetails();
    // }
  }

  showUnitDetails(): void {
    if (this.selectedUnit) {
      this.isLoadingUnitDetails = true;
      this._commonService.getById(APIS.unitDetails.getUnitDetails, this.selectedUnit).subscribe({
        next: (res: any) => {
          this.unitDetails = res.data || {
            unitName: '',
            unitType: '',
            establishedDate: '',
            status: '',
            budget: 0,
            expenditure: 0,
            fundingSource: '',
            technology: '',
            capacity: '',
            maintenanceSchedule: '',
            description: '',
            remarks: ''
          };
          
          // Load additional information if exists
          this.loadAdditionalInfo();
          
          this.isLoadingUnitDetails = false;
        },
        error: (error) => {
          this.toastrService.error('Failed to load unit details');
          console.error('Error loading unit details:', error);
          this.isLoadingUnitDetails = false;
        }
      });
    }
  }

  // New method to load additional information
  loadAdditionalInfo(): void {
    if (this.selectedUnit) {
      this._commonService.getById(`${APIS.unitDetails.getAdditionalInfo}`, this.selectedUnit).subscribe({
        next: (res: any) => {
          if (res.data) {
            this.topProducts = res.data.topProducts || ['', '', '', '', ''];
            this.isExporting = res.data.isExporting ?? null;
            this.supportNeeded = res.data.supportNeeded || {
              marketing: false,
              rawMaterials: false,
              finance: false
            };
          }
        },
        error: (error) => {
          console.log('No additional information found or error loading:', error);
          // Keep default values if no data exists
        }
      });
    }
  }

  // Method to reset additional information
  resetAdditionalInfo(): void {
    this.topProducts = ['', '', '', '', ''];
    this.isExporting = null;
    this.supportNeeded = {
      marketing: false,
      rawMaterials: false,
      finance: false
    };
  }

  // Method to update additional information
  updateAdditionalInfo(): void {
    if (!this.selectedUnit) {
      this.toastrService.error('Please select a unit first');
      return;
    }

    // Validate that at least one product is entered
    const hasProducts = this.topProducts.some(product => product.trim() !== '');
    if (!hasProducts) {
      this.toastrService.error('Please enter at least one product');
      return;
    }

    // Validate export selection
    if (this.isExporting === null) {
      this.toastrService.error('Please select export status');
      return;
    }

    const additionalInfoData = {
      unitId: this.selectedUnit,
      topProducts: this.topProducts.filter(product => product.trim() !== ''), // Remove empty products
      isExporting: this.isExporting,
      supportNeeded: this.supportNeeded
    };

    this.isUpdatingAdditionalInfo = true;
    
    this._commonService.updatedata(`${APIS.unitDetails.updateAdditionalInfo}/${this.selectedUnit}`, additionalInfoData).subscribe({
      next: (res: any) => {
        this.toastrService.success('Additional information updated successfully!');
        console.log('Additional information updated:', res);
        this.isUpdatingAdditionalInfo = false;
      },
      error: (error) => {
        this.toastrService.error('Failed to update additional information');
        console.error('Error updating additional information:', error);
        this.isUpdatingAdditionalInfo = false;
      }
    });
  }
}




