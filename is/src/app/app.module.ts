import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { SharedModule } from './shared/shared.module';
import { AcceptDialogComponent } from './components/json-filed/accept-dialog.component';

@NgModule({
  declarations: [AppComponent, AcceptDialogComponent],
  imports: [BrowserModule, BrowserAnimationsModule, SharedModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
