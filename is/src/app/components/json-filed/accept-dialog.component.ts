import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-accept-dialog',
  templateUrl: 'accept-dialog.component.html',
  styleUrls: ['accept-dialog.component.scss']
})
export class AcceptDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { user: { id: number; name: string; result: boolean } },
    public dialogRef: MatDialogRef<AcceptDialogComponent>
  ) {}

  public handleListItemClick(value: boolean) {
    const user = this.data.user;

    user.result = value;
    this.dialogRef.close(user);
  }
}
