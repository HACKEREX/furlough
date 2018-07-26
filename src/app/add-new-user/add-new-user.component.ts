import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DataService} from '../data.service';

interface User {
  MSID: string;
  NAME: string;
  EMAIL: string;
  ACCOLITE_EMPLOYEE: string;
  CONTACT: string;
}

@Component({
  selector: 'app-add-new-user',
  templateUrl: './add-new-user.component.html',
  styleUrls: ['./add-new-user.component.css']
})
export class AddNewUserComponent implements OnInit {
  public userDetails: User;
  constructor( public dialogRef: MatDialogRef<AddNewUserComponent>, @Inject(MAT_DIALOG_DATA) public data: User) {
    this.userDetails = {
      'NAME': '',
      'MSID': '',
      'ACCOLITE_EMPLOYEE': '',
      'EMAIL': '',
      'CONTACT': ''
    };
  }
  ngOnInit() {
  }
  closeDialog() {
    this.dialogRef.close();
  }
  createNewUser() {
    const employeeInput = {'mSID': this.userDetails.MSID ,
      'accoliteEmployee': this.userDetails.ACCOLITE_EMPLOYEE,
      'resourceName': this.userDetails.NAME ,
      'email': this.userDetails.EMAIL};
    this.dialogRef.close(employeeInput);
  }

}
