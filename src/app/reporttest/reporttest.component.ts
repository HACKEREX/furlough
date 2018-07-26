import { Component, OnInit } from '@angular/core';
import {DataSource} from '@angular/cdk/table';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {DataService} from '../data.service';
import {CollectionViewer} from '@angular/cdk/collections';
import {catchError, finalize} from 'rxjs/operators';

interface FurloughReport {
  'MSID': string;
  'NAME': string;
}

enum LEFT_RIGHT {
  LEFT, RIGHT, VOID, MONTHLY_VIEW
}

export class ReportDataSource implements DataSource<FurloughReport> {
  private reportSubject = new BehaviorSubject<FurloughReport[]>([]);
  private loadingSubject = new BehaviorSubject<Boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  public dataHeaders = [];
  public monthHeaders = ['JAN', 'FEB' , 'MAR' , 'APR' , 'MAY' , 'JUN' , 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  public monthHeadersMap = {
    'JAN': 0,
    'FEB': 1 ,
    'MAR': 2 ,
    'APR': 3 ,
    'MAY': 4,
    'JUN': 5,
    'JUL': 6,
    'AUG': 7,
    'SEP': 8,
    'OCT': 9,
    'NOV': 10,
    'DEC': 11};
  private dataClipped;
  public dataHeadersToShow = [];
  public startDate;
  public endDate;
  public monthIndexes = {};
  private L2toL1Mapping = {};
  public uniqueMsid = [];
  public responseDataL1 = [];
  public responseDataL2 = {};
  public responseDataL3 = {};
  public monthDataHeaders = [];
  public noData = true;
  public monthView = false;
  public inputParameters = {};
  constructor(private data: DataService) {
    this.inputParameters = {
      'MONTH' : new Date().getMonth(),
      'YEAR' : new Date().getFullYear(),
      'TYPE' : RESPONSE_TYPE.YEARLY,
      'QUARTER_VIEW': {
        'QUARTER_NUMBER': 1
      },
      'MONTH_VIEW': {
        'NO_OF_DAYS': 0,
        'NO_OF_DAYS_ARRAY': []
      }
    };
  }
  connect(collectionViewer: CollectionViewer): Observable<FurloughReport[]> {
    return this.reportSubject.asObservable();
  }
  disconnect(collectionViewer: CollectionViewer): void {
    this.loadingSubject.complete();
    this.reportSubject.complete();
  }
  loadFurloughReport(startDate, endDate, inputParameters) {
    this.loadingSubject.next(true);
    this.startDate = startDate;
    this.endDate = endDate;
    this.flushAll();

    this.startDate = new Date(inputParameters.YEAR, 0, 1);
    this.endDate = new Date(inputParameters.YEAR, 11, 31);


    this.data.getData(startDate, endDate)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe((response) => {
        console.log(response);
      if (response === [] || response[0] === undefined) {
        this.prepareDataHeader(inputParameters);
        this.prepareDataToShow(inputParameters);
        this.dataHeaders.unshift('NAME');
        this.dataHeaders.unshift('MSID');
        this.dataHeaders.push('TOTAL');
        this.getMonthDataHeaders(inputParameters);
        this.monthDataHeaders.unshift('NAME');
        this.monthDataHeaders.unshift('MSID');
        this.noData = true;
        return;
      }
      if (response != null || response !== []) {
        this.noData = false;
        for (const index in response) {
          this.responseDataL1.push(this.reFormat(response[index], index));
        }
        this.prepareDataHeader(inputParameters);
        this.getFormatL3();
        // console.log(response);
        // console.log(this.responseDataL3);
        this.prepareDataToShow(inputParameters);
        this.dataHeaders.unshift('NAME');
        this.dataHeaders.unshift('MSID');
        this.dataHeaders.push('TOTAL');
        this.getMonthDataHeaders(inputParameters);
        this.monthDataHeaders.unshift('NAME');
        this.monthDataHeaders.unshift('MSID');
      } else {
        this.flushAll();
      }
    });
  }
  getMonthDataHeaders(inputParameters) {
    this.monthDataHeaders = inputParameters.MONTH_VIEW.NO_OF_DAYS_ARRAY;
    for(let i = 0; i< this.monthDataHeaders.length; i++) {
      this.monthDataHeaders[i] = this.monthDataHeaders[i].toString();
    }
  }
  prepareDataToShow(inputParameters) {
    const currentReport: FurloughReport[] = [];

    const dataHeadersTemp = this.dataHeaders;
    this.dataHeaders = [];
    // console.log(this.dataHeaders);
    // console.log(this.dataHeadersToShow);
    if (inputParameters.TYPE === RESPONSE_TYPE.YEARLY) {
      this.monthView = false;
      this.dataHeadersToShow = [];
      for (let i = 0; i < 12; i++) {
        this.dataHeadersToShow.push(true);
      }
    }
    for (let i = 0 ; i < this.dataHeadersToShow.length; i++) {
      if (this.dataHeadersToShow[i] === true) {
        this.dataHeaders.push(dataHeadersTemp[i]);
      }
    }


    for (const msid in this.responseDataL3) {
      const reportObj: FurloughReport = {
        'MSID': this.responseDataL3[msid].MSID,
        'NAME': this.responseDataL3[msid].NAME,
      };
      let total = 0 + '   ' + 0;
      for (const index in this.responseDataL3[msid].VIEW) {
        if (this.dataHeaders.includes(this.responseDataL3[msid].VIEW[index].DATE )) {
          const currentTot = this.findLeavesandOverlap(this.responseDataL3[msid].VIEW[index].REPORT);
          reportObj[this.responseDataL3[msid].VIEW[index].DATE] = currentTot;
          const s = currentTot.split(' ');
          const s1 = total.split(' ');
          total = (parseInt(s[0], 10) + parseInt(s1[0], 10)) + '   ' + (parseInt(s[3], 10) + parseInt(s1[3], 10));
        }
      }
      reportObj['TOTAL'] = total;
      currentReport.push(reportObj);

    }
    const currentMonth = inputParameters.MONTH;
    const monthlyView = [];
    for ( const msid in this.responseDataL3) {
      const currentObj = {
        'MSID': this.responseDataL3[msid].MSID,
        'NAME': this.responseDataL3[msid].NAME,
      };
      let index = 0;
      for (const monthDetails in this.responseDataL3[msid].VIEW[currentMonth].REPORT) {
        index++;
        const aa = index;
        currentObj[aa.toString()] = this.responseDataL3[msid].VIEW[currentMonth].REPORT[monthDetails];
      }
      monthlyView.push(currentObj);
    }
    console.log(monthlyView);
    if (!this.monthView) {
      this.reportSubject.next(currentReport);
    } else {
      this.reportSubject.next(monthlyView);
    }
  }
  findLeavesandOverlap(reportArray) {
    let pl = 0;
    let ov = 0;
    for (let index = 0; index < reportArray.length; index++) {
      if (reportArray[index] === 1) {
        pl += 1;
      } else if (reportArray[index] === 2) {
        ov += 1;
      }
    }
    return pl.toString() + '   ' + ov.toString();
  }
  reFormat(data, index) {

    this.uniqueMsid.push(data.msid);
    const dataObj = {
      'MSID' : data.msid,
      'NAME' : data.resourceName,
      'FURLOUGHS' : data.dateAndOverlaps.map((Obj) => { return {
        'DATE' : new Date(Obj.furloughDate),
        'STATUS': Obj.overlap
      }; })
    };
    this.responseDataL2[data.msid] = dataObj;
    this.L2toL1Mapping[data.msid] = index;
    return dataObj;

  }
  flushAll() {
    this.dataHeaders = [];
    this.responseDataL1 = [];
    this.responseDataL2 = {};
    this.responseDataL3 = {};
    this.dataHeadersToShow = [];
    this.monthIndexes = {};
    this.monthDataHeaders = [];
  }
  prepareDataHeader(inputParameters) {
    switch (parseInt(inputParameters.TYPE, 10)) {
      case RESPONSE_TYPE.YEARLY:  this.monthView = false; break;
      case RESPONSE_TYPE.MONTHLY: this.clipHeaders(inputParameters);
        break;
      case RESPONSE_TYPE.QUATERLY: this.monthView = false; this.clipHeaders(inputParameters);
        break;
    }
    this.startDate = new Date(inputParameters.YEAR, 0, 1) ;
    this.endDate = new Date(inputParameters.YEAR , 11, 31); this.fillDateHeader(this.startDate);
  }
  clipHeaders(inputParameters) {
    if (inputParameters.TYPE !== RESPONSE_TYPE.YEARLY) {
      this.dataClipped = true;
    }
    if (inputParameters.TYPE === RESPONSE_TYPE.QUATERLY) {
      const clipper = (inputParameters.QUARTER_VIEW.QUARTER_NUMBER - 1) * 3;
      for (let i = 0 ; i < 12; i++) {
        this.dataHeadersToShow[i] = false;
      }
      this.dataHeadersToShow[clipper] = true;
      this.dataHeadersToShow[clipper + 1] = true;
      this.dataHeadersToShow[clipper + 2] = true;
    }
    if (inputParameters.TYPE === RESPONSE_TYPE.MONTHLY) {
      for (let i = 0; i < 12; i++) {
        this.dataHeadersToShow[i] = false;
      }
      this.dataHeadersToShow[inputParameters.MONTH] = true;
    }
  }
  fillDateHeader(startDate) {
    let months = 0;
    months = (this.startDate.getFullYear() - this.endDate.getFullYear()) * 12;
    months -= this.startDate.getMonth();
    months += 1;
    months += this.endDate.getMonth();
    if(this.dataClipped === false) {
      this.dataHeadersToShow = [];
    }
    this.dataHeaders = [];
    const startMonth = startDate.getMonth();
    const startYear =  startDate.getFullYear();
    let yearIterator = startYear;
    for ( let i = 0; i < months; i++) {
      const monthIterator = (startMonth + i) % 12;
      if ( i > 0 )
        (monthIterator === 0 ? yearIterator += 1 : yearIterator = yearIterator );
      this.dataHeaders.push(
        this.monthHeaders[monthIterator] + ' ' + yearIterator
      );
      this.monthIndexes[this.monthHeaders[monthIterator] + yearIterator] = i;
      if (this.dataClipped === false) {
        this.dataHeadersToShow.push(true);
      }
    }

  }
  handleLeftClick(inputParameters) {
    this.getMonthDataHeaders(inputParameters);
    //  console.log('hl');
    console.log(inputParameters);
    this.startDate = new Date(inputParameters.YEAR, 0, 1);
    this.endDate = new Date(inputParameters.YEAR, 11, 31);
    this.loadFurloughReport(this.startDate, this.endDate, inputParameters);
  }
  handleRightClick(inputParameters) {
    this.getMonthDataHeaders(inputParameters);
    console.log('hr');
    console.log(inputParameters);
    this.startDate = new Date(inputParameters.YEAR, 0, 1);
    this.endDate = new Date(inputParameters.YEAR, 11, 31);
    this.loadFurloughReport(this.startDate, this.endDate, inputParameters);
  }
  calculateNoOfDaysInMonth(dateObj) {
    return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();
  }
  getResponseView() {
    const responseView = [];

    for ( const outerIndex in this.dataHeaders ) {
      const s = this.dataHeaders[outerIndex].split(' ');
      const noOfDays = this.calculateNoOfDaysInMonth(new Date(parseInt(s[1], 10), this.monthHeadersMap[s[0]], 1));
      const monthArray = [];
      for(let i = 0; i < noOfDays; i++) {
        monthArray.push(0);
      }
      responseView.push({'DATE': this.dataHeaders[outerIndex], 'REPORT': monthArray});
    }
    return responseView;
  }
  getFormatL3() {
    const furloughsArray = this.responseDataL2[this.responseDataL1[0].MSID].FURLOUGHS;

    for(let msid in this.responseDataL2) {
      const responseViewObj = {
        'MSID': msid,
        'NAME': this.responseDataL2[msid].NAME,
        'VIEW': this.getResponseView(),
      };

      for (let fur in this.responseDataL2[msid].FURLOUGHS) {
        const furloughDate = this.responseDataL2[msid].FURLOUGHS[fur].DATE;
        const furloughStatus = this.responseDataL2[msid].FURLOUGHS[fur].STATUS;
        const day = furloughDate.getDate();
        const month = furloughDate.getMonth();
        const year = furloughDate.getFullYear();

        if (furloughStatus === 'PLANNED') {
          responseViewObj.VIEW[month].REPORT[day - 1] = 1;
        } else if (furloughStatus === 'CANCELLED') {
          responseViewObj.VIEW[month].REPORT[day - 1] = 0;
        } else if (furloughStatus === 'OVERLAPPED') {
          responseViewObj.VIEW[month].REPORT[day - 1] = 2;
        }
        this.responseDataL3[msid] = responseViewObj;
      }
    }
  }
  handleMonthView(month, inputParameters) {
    this.monthView = true;
    console.log(month);
    this.monthDataHeaders = inputParameters.MONTH_VIEW.NO_OF_DAYS_ARRAY;
    for (let i = 0; i < this.monthDataHeaders.length; i++) {
      this.monthDataHeaders[i] = this.monthDataHeaders[i].toString();
    }
    this.prepareDataToShow(inputParameters);
    if(this.monthDataHeaders[0] !== 'MSID') {
      this.monthDataHeaders.unshift('NAME');
      this.monthDataHeaders.unshift('MSID');
      this.monthDataHeaders.push('TOTAL');
    }
    // console.log(this.monthDataHeaders);
  }
  handleBack(inputParameters) {
    this.monthView = false;
    inputParameters.TYPE = RESPONSE_TYPE.YEARLY;
    this.dataHeadersToShow.map((x, i) => true);
    this.handleRightClick(inputParameters);
    this.handleLeftClick(inputParameters);
  }

}

enum RESPONSE_TYPE {
  YEARLY,
  QUATERLY,
  MONTHLY,
}


@Component({
  selector: 'app-reporttest',
  templateUrl: './reporttest.component.html',
  styleUrls: ['./reporttest.component.css']
})
export class ReporttestComponent implements OnInit {
  public dataSource;
  public startDate;
  public endDate;
  public inputParameters;
  public yearList = [];
  public monthHeaders = ['JAN', 'FEB' , 'MAR' , 'APR' , 'MAY' , 'JUN' , 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  public monthHeadersMap = {
    'JAN': 0,
    'FEB': 1 ,
    'MAR': 2 ,
    'APR': 3 ,
    'MAY': 4,
    'JUN': 5,
    'JUL': 6,
    'AUG': 7,
    'SEP': 8,
    'OCT': 9,
    'NOV': 10,
    'DEC': 11};
  constructor(private data: DataService) {
    this.inputParameters = {
      'MONTH' : new Date().getMonth(),
      'YEAR' : new Date().getFullYear(),
      'TYPE' : RESPONSE_TYPE.YEARLY,
      'QUARTER_VIEW': {
        'QUARTER_NUMBER': 1
      },
      'MONTH_VIEW': {
        'NO_OF_DAYS': 0,
        'NO_OF_DAYS_ARRAY': []
      }
    };
    const currentYear = new Date().getFullYear() - 5;
    for (let i = 0; i < 20 ; i++ ) {
      this.yearList[i] = (currentYear + i);
    }
    this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = Math.floor(
      parseInt(this.inputParameters.MONTH, 10) / 3
    ) + 1;
  }

  ngOnInit() {
    this.dataSource = new ReportDataSource(this.data);
    this.startDate = new Date();
    this.endDate = new Date(this.startDate.getFullYear());
    this.dataSource.loadFurloughReport(this.startDate, this.endDate, this.inputParameters);
  }
  fillInputDetailsAttribute(direction) {

    if (direction === LEFT_RIGHT.RIGHT) {
      this.inputParameters.TYPE = parseInt(this.inputParameters.TYPE, 10);
      if (this.inputParameters.TYPE === RESPONSE_TYPE.MONTHLY) {
        if (parseInt(this.inputParameters.MONTH, 10) === 11) {
          this.inputParameters.YEAR = parseInt(this.inputParameters.YEAR, 10) + 1;
          this.inputParameters.MONTH = 0;
          this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = 1;
        } else {

          this.inputParameters.MONTH = parseInt(this.inputParameters.MONTH, 10) + 1;
          this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = Math.floor(this.inputParameters.MONTH / 3) + 1;
        }
      } else if (this.inputParameters.TYPE === RESPONSE_TYPE.QUATERLY) {
        if (parseInt(this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER, 10) === 4) {
          this.inputParameters.YEAR = parseInt(this.inputParameters.YEAR, 10) + 1;
          this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = 1;
          this.inputParameters.MONTH = 0;
        } else {
          this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = parseInt(this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER, 10) + 1;
          this.inputParameters.MONTH = (this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER - 1) * 3;
        }
      }
      if (this.inputParameters.TYPE === RESPONSE_TYPE.YEARLY) {
        this.inputParameters.YEAR = parseInt(this.inputParameters.YEAR, 10) + 1;
      }
      this.startDate = new Date(this.inputParameters.YEAR, 0, 1);
      this.endDate = new Date(this.inputParameters.YEAR, 11, 31);
      /*this.inputParameters.MONTH_VIEW.NO_OF_DAYS = this.dataSource.calculateNoOfDaysInMonth(new Date(
        this.inputParameters.YEAR,
        this.inputParameters.MONTH,
        1
      ));
      this.inputParameters.MONTH_VIEW.NO_OF_DAYS_ARRAY = Array(
        this.inputParameters.MONTH_VIEW.NO_OF_DAYS
      ).fill(0).map((x, i) => i + 1);*/
      this.fillInputDetailsAttribute(LEFT_RIGHT.MONTHLY_VIEW);
    } else if (direction === LEFT_RIGHT.LEFT) {
      if (this.inputParameters.TYPE === RESPONSE_TYPE.MONTHLY) {
        if (this.inputParameters.MONTH === 0) {
          this.inputParameters.YEAR = parseInt(this.inputParameters.YEAR, 10) - 1;
          this.inputParameters.MONTH = 11;
          this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = Math.floor(parseInt(this.inputParameters.MONTH, 10) / 3) + 1;
        } else {
          this.inputParameters.MONTH = parseInt(this.inputParameters.MONTH, 10) - 1;
          this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = Math.floor (parseInt(this.inputParameters.MONTH, 10) / 3) + 1;
        }
      } else if (this.inputParameters.TYPE === RESPONSE_TYPE.QUATERLY) {
        if (this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER === 1) {
          this.inputParameters.YEAR = parseInt(this.inputParameters.YEAR, 10) - 1;
          this.inputParameters.MONTH = 9;
          this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = 4;
        } else {
          this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = parseInt(this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER, 10) - 1;
          this.inputParameters.MONTH = parseInt(this.inputParameters.MONTH, 10) - 3;
        }
      }
      if (this.inputParameters.TYPE === RESPONSE_TYPE.YEARLY) {
        this.inputParameters.YEAR = parseInt(this.inputParameters.YEAR, 10) - 1;
      }
      this.startDate = new Date(this.inputParameters.YEAR, 0, 1);
      this.endDate = new Date(this.inputParameters.YEAR, 11, 31);
      /*this.inputParameters.MONTH_VIEW.NO_OF_DAYS = this.dataSource.calculateNoOfDaysInMonth(new Date(
        this.inputParameters.YEAR,
        this.inputParameters.MONTH,
        1
      ));
      this.inputParameters.MONTH_VIEW.NO_OF_DAYS_ARRAY = Array(
        this.inputParameters.MONTH_VIEW.NO_OF_DAYS
      ).fill(0).map((x, i) => i + 1);*/
      this.fillInputDetailsAttribute(LEFT_RIGHT.MONTHLY_VIEW);
    }
    if (direction === LEFT_RIGHT.VOID) {
      this.inputParameters.TYPE = parseInt(this.inputParameters.TYPE, 10);
      this.inputParameters.MONTH = parseInt(this.inputParameters.MONTH, 10);
      this.inputParameters.YEAR = parseInt(this.inputParameters.YEAR, 10);
      this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = Math.ceil(parseInt(this.inputParameters.MONTH, 10) / 3) + 1;
      this.startDate = new Date(this.inputParameters.YEAR, 0, 1);
      this.endDate = new Date(this.inputParameters.YEAR, 11, 31);
      this.fillInputDetailsAttribute(LEFT_RIGHT.MONTHLY_VIEW);
    }
    if (direction === LEFT_RIGHT.MONTHLY_VIEW) {
      this.inputParameters.MONTH_VIEW.NO_OF_DAYS = this.dataSource.calculateNoOfDaysInMonth(
        new Date(this.inputParameters.YEAR, this.inputParameters.MONTH, 1));
      this.inputParameters.MONTH_VIEW.NO_OF_DAYS_ARRAY = Array(
        this.inputParameters.MONTH_VIEW.NO_OF_DAYS).fill(0).map((x, i) => i + 1);
      this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = Math.floor(this.inputParameters.MONTH / 3) + 1;

    }

  }
  handleRight() {
    this.fillInputDetailsAttribute(LEFT_RIGHT.RIGHT);
    console.log(this.inputParameters);
    this.dataSource.handleRightClick(this.inputParameters);
  }
  handleLeft() {
    this.fillInputDetailsAttribute(LEFT_RIGHT.LEFT)
    console.log(this.inputParameters);
    this.dataSource.handleLeftClick(this.inputParameters);
  }
  refreshDetails() {
    this.fillInputDetailsAttribute(LEFT_RIGHT.VOID);
    console.log(this.inputParameters);
    this.dataSource.loadFurloughReport(this.startDate, this.endDate, this.inputParameters);
  }
  handleMonthView(month) {
    if (month === 'MSID' || month === 'TOTAL' || month === 'NAME') {
      return;
    }
    const s = month.toString().split(' ')[0];
    this.inputParameters.TYPE = RESPONSE_TYPE.MONTHLY;
    this.inputParameters.MONTH = this.monthHeadersMap[s];
    this.fillInputDetailsAttribute(LEFT_RIGHT.MONTHLY_VIEW);
    console.log(this.inputParameters);
    this.dataSource.handleMonthView(month, this.inputParameters);
  }

  handleBack() {
    this.dataSource.handleBack(this.inputParameters);
  }



}
