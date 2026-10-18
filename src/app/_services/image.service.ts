import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AgencyResponse } from '../_models/agencies.model';
import { ProgramResponse } from '../_models/program.model';
import { APIS } from '@app/constants/constants'; 

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private http: HttpClient) {}

  getCollageImages(): Observable<any[]> {
    return this.http.get<any[]>(`${APIS.collageCreation.GET_COLLAGE_IMAGES}`);
  }

  getAllImages(programId: number): Observable<any[]> {
    return this.http.get<any[]>(`${APIS.collageCreation.GET_ALL_IMAGES}${programId}`);
  }


  getAgencies(): Observable<AgencyResponse> {
    return this.http.get<AgencyResponse>(`${APIS.collageCreation.GET_AGENCIES}`);
  }

  getPrograms(agencyId: number): Observable<ProgramResponse> {
    return this.http.get<ProgramResponse>(`${APIS.collageCreation.GET_PROGRAMS}/${agencyId}`);
  }
  saveImages(url:any,data:any): Observable<any> {
    return this.http.post<any>(`${url}`,data);
  }
  deleteImage(imageId: any): Observable<any> {
    return this.http.delete<any>(`${APIS.collageCreation.DELETE_IMAGE}${imageId?.programId}&fileId=${imageId.fileId}`);
  }
}
