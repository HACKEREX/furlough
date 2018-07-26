import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatCardModule,
  MatTableModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatToolbarModule, MatListModule, MatSortModule, MatProgressSpinnerModule, MatSelectModule, MatDialogModule
} from '@angular/material';
import {MatExpansionModule} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatMenuModule,
    MatDialogModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    MatGridListModule,
    MatTableModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule
  ],
  exports: [
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
    MatInputModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatListModule,
    MatGridListModule,
    MatExpansionModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatCardModule
  ],
  declarations: []
})
export class FurloughMaterialThemeModule { }
