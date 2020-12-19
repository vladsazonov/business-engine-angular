import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { filter } from 'rxjs/operators';

import { AcceptDialogComponent } from './components/json-filed/accept-dialog.component';

interface IJson {
  document: string;
  result: boolean;
  accepting: IAccepting[];
}

interface IAccepting {
  condition: string;
  step: number;
  result: boolean;
  users: IUser[];
}

interface IUser {
  id: number;
  name: string;
  result: boolean;
}

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  public form: FormGroup;
  public json: IJson;

  public currentConditionStep = 1;
  public clickedUser = null;
  public currentTabIndex = 0;

  get parsedJson(): string {
    return JSON.stringify(this.json, null, 2);
  }

  constructor(private formBuilder: FormBuilder, public dialog: MatDialog) {}

  public ngOnInit() {
    this.createForm();
  }

  private createForm() {
    this.form = this.formBuilder.group({
      json: null,
      selected: 0
    });
  }

  public loadJSON() {
    const parsedJson = this.tryParseJSON(this.form.get('json')?.value);

    if (parsedJson) {
      this.json = <IJson>parsedJson;
      this.currentTabIndex += 1;
    }
  }

  public tryParseJSON(jsonString: string): boolean | IJson {
    try {
      const o = JSON.parse(jsonString);

      if (o && typeof o === 'object') {
        return o;
      }
    } catch (e) {}

    return false;
  }

  public handleOpenAcceptingDialog(user: IUser) {
    const dialog = this.dialog.open(AcceptDialogComponent, { data: { user } });

    dialog
      .afterClosed()
      .pipe(
        untilDestroyed(this),
        filter(value => !!value)
      )
      .subscribe(value => {
        const currentCondition = this.json.accepting[this.currentConditionStep - 1];
        const currentUserIndex = this.json.accepting[this.currentConditionStep - 1].users.findIndex(
          currentUser => currentUser.id === value.id
        );

        this.json.accepting[this.currentConditionStep - 1].users[currentUserIndex] = value;

        this.clickedUser = null;

        if (
          this.checkStep(this.json.accepting[this.currentConditionStep - 1].users) === currentCondition.users.length
        ) {
          const conditionResult = this.calculateConditionResult(
            this.json.accepting[this.currentConditionStep - 1].condition,
            this.json.accepting[this.currentConditionStep - 1].users
          );

          this.json.accepting[this.currentConditionStep - 1].result = conditionResult;

          this.currentConditionStep += 1;
        }
      });
  }

  public checkStep(users: IUser[]): number {
    const isStepCompleted = users.filter(user => typeof user.result === 'boolean');

    return isStepCompleted.length;
  }

  public calculateConditionResult(condition: string, users: IUser[]): boolean {
    let i = 0;

    if (condition === 'or') {
      const trueAnswers = users.filter(user => !!user.result);
      return !!trueAnswers.length;
    } else if (condition === 'and') {
      for (const user of users) {
        if (!!user.result) {
          i++;
          if (i === users.length) {
            return true;
          }
          continue;
        } else {
          return false;
        }
      }
    }
  }

  public isAllStepsDone(accepting: IAccepting[]): boolean {
    if (accepting) {
      const acceptedConditions = accepting.filter(elem => typeof elem.result === 'boolean');

      return acceptedConditions.length === accepting.length;
    }

    return false;
  }

  public calculateFinalDocument() {
    let i = 0;
    let documentResult = false;

    for (const condition of this.json.accepting) {
      if (!!condition.result) {
        i++;
        if (i === this.json.accepting.length) {
          documentResult = true;
        }
        continue;
      }
    }

    this.json.result = documentResult;
  }

  public clearData() {
    this.json = null;
    this.form.patchValue({
      json: null
    });
    this.clickedUser = null;
    this.currentConditionStep = 1;
  }

  public revertProcess() {
    this.clearData();
    this.currentTabIndex = 0;
  }

  public doneProcess() {
    this.calculateFinalDocument();
    this.currentTabIndex += 1;
  }
}
