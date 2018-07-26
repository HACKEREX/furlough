import { Component, OnInit } from '@angular/core';
import {DataService} from '../data.service';
import {DataSource} from '@angular/cdk/table';
import {CollectionViewer} from '@angular/cdk/collections';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Data} from '@angular/router';
import {catchError, finalize} from 'rxjs/operators';
import {Sort} from '@angular/material';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';

interface File {
  'NAME': string;
  'UPLOADED_AT': string;
  'UPLOADED_BY': string;
}

export class FileDataSource implements DataSource<File> {
  private fileSubject = new BehaviorSubject<File[]>([]);
  private loadingSubject = new BehaviorSubject<Boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  public fileList = [];

  constructor(private data: DataService) {}
  connect(collectionViewer: CollectionViewer): Observable<File[]> {
    return this.fileSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.loadingSubject.complete();
    this.fileSubject.complete();
  }
  loadFiles() {
    this.loadingSubject.next(true);
    this.data.getFilesList().pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(files => {
      console.log(files);
    });
  }
  compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  sortData(sort: Sort) {
    const data = this.fileList.slice();
    let sortedData = this.fileList;
    if (!sort.active || sort.direction === '') {
      return;
    }
    sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'NAME': return this.compare(a.NAME, b.NAME, isAsc);
        case 'UPLOADED_BY': return this.compare(a.UPLOADED_BY, b.UPLOADED_BY, isAsc);
      }
    });
  }
}

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  public fileListHeaders = ['NAME', 'UPLOADED_AT', 'UPLOADED_BY'];
  public dataSource;
  selectedFiles: FileList;
  currentFileUpload;
  constructor(private dService: DataService) {
  }

  ngOnInit() {
    this.dataSource = new FileDataSource(this.dService);
    this.dataSource.loadFiles();
  }
  selectFile(event) {
    this.selectedFiles = event.target.files;
  }

  upload() {
    this.currentFileUpload = this.selectedFiles.item(0);
    this.dService.pushFileToStorage(this.currentFileUpload).subscribe(event => {
        if (event instanceof HttpResponse) {
          console.log(event);
        }
      },
      error => {
        if ( error instanceof HttpErrorResponse) {
          console.log(error);
        }
      });
    this.selectedFiles = undefined;
  }

}
