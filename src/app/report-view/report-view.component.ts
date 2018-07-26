import { Component, OnInit } from '@angular/core';
import {DataService} from '../data.service';


enum RESPONSE_TYPE {
  YEARLY,
  QUATERLY,
  MONTHLY,
}

@Component({
  selector: 'app-report-view',
  templateUrl: './report-view.component.html',
  styleUrls: ['./report-view.component.css']
})
export class ReportViewComponent implements OnInit {

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
  public uniqueMsid;
  private responseDataL1;
  private responseDataL2;
  public responseDataL3;
  private L2toL1Mapping ;
  public dataHeaders;
  public dataHedersToShow;
  private monthIndexes;
  public inputParameters;
  public yearList;
  public startDate;
  public endDate;
  public noData;
  private dataClipped;
  public monthlyView;
  constructor(private data: DataService) {
    this.uniqueMsid  = [];
    this.responseDataL1 = [];
    this.responseDataL2 = {};
    this.responseDataL3 = {};
    this.L2toL1Mapping = {};
    this.dataHeaders = [];
    this.yearList = [];
    this.monthIndexes = {};
    this.dataHedersToShow = [];
    this.noData = true;
    this.dataClipped = false;
    this.monthlyView = false;
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
    for ( let i = 0; i < 20 ; i++) {
      this.yearList.push(currentYear + i);
    }
    this.startDate = new Date();
    this.endDate = new Date(this.startDate.getFullYear());
  }

  ngOnInit() {
    this.fetchDetails();
  }
  handleLeftClick() {
    this.inputParameters.TYPE = parseInt(this.inputParameters.TYPE, 10);
    if (this.inputParameters.TYPE === RESPONSE_TYPE.MONTHLY) {
      if (this.inputParameters.MONTH === 0) {
        this.inputParameters.YEAR = parseInt(this.inputParameters.YEAR, 10) - 1;
        this.inputParameters.MONTH = 11;
        this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = (parseInt(this.inputParameters.MONTH, 10) / 3 ) + 1;
      } else {
        this.inputParameters.MONTH = parseInt(this.inputParameters.MONTH, 10) - 1;
        this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = (parseInt(this.inputParameters.MONTH, 10) / 3 ) + 1;
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
    this.endDate = new Date(this.inputParameters.YEAR , 11, 31);
    this.inputParameters.MONTH_VIEW.NO_OF_DAYS = this.calculateNoOfDaysInMonth(new Date(
      this.inputParameters.YEAR,
      this.inputParameters.MONTH,
      1
    ));
    this.inputParameters.MONTH_VIEW.NO_OF_DAYS_ARRAY = Array(
      this.inputParameters.MONTH_VIEW.NO_OF_DAYS
    ).fill(0).map((x, i) => i + 1);
    console.log(this.inputParameters);
    this.fetchDetails();
  }
  handleRightClick() {
    this.inputParameters.TYPE = parseInt(this.inputParameters.TYPE, 10);
    if( this.inputParameters.TYPE === RESPONSE_TYPE.MONTHLY) {
      if( parseInt(this.inputParameters.MONTH, 10) === 11) {
        this.inputParameters.YEAR = parseInt(this.inputParameters.YEAR, 10) + 1;
        this.inputParameters.MONTH = 0;
        this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = Math.ceil(parseInt(this.inputParameters.MONTH, 10) / 3) + 1;

      }  else {
        this.inputParameters.MONTH = parseInt(this.inputParameters.MONTH, 10) + 1;
        this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = Math.ceil(parseInt(this.inputParameters.MONTH, 10) / 3) + 1;

      }
    } else if ( this.inputParameters.TYPE === RESPONSE_TYPE.QUATERLY ) {
      if ( parseInt(this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER , 10) === 4) {
        this.inputParameters.YEAR = parseInt(this.inputParameters.YEAR, 10) + 1;
        this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER === 1;
        this.inputParameters.MONTH = 0;
      } else {
        this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = parseInt(this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER, 10) + 1;
        this.inputParameters.MONTH = (this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER - 1 ) * 3;
      }
    }
    if ( this.inputParameters.TYPE === RESPONSE_TYPE.YEARLY) {
      this.inputParameters.YEAR = parseInt(this.inputParameters.YEAR, 10) + 1;
    }
    this.startDate = new Date(this.inputParameters.YEAR, 0, 1);
    this.endDate = new Date(this.inputParameters.YEAR, 11, 31);
    this.inputParameters.MONTH_VIEW.NO_OF_DAYS = this.calculateNoOfDaysInMonth(new Date(
      this.inputParameters.YEAR,
      this.inputParameters.MONTH,
      1
    ));
    this.inputParameters.MONTH_VIEW.NO_OF_DAYS_ARRAY = Array(
      this.inputParameters.MONTH_VIEW.NO_OF_DAYS
    ).fill(0).map((x, i) => i + 1);
    console.log(this.inputParameters);
    this.fetchDetails();
  }

  calculateId(type, index) {
    if (type === RESPONSE_TYPE.MONTHLY) {
      return 'total-loss-tablem' + this.L2toL1Mapping[index];
    } else {
      return 'total-loss-table' + this.L2toL1Mapping[index];
    }
  }
  handleMonthView(handlemonthObj) {

    if(handlemonthObj && this.dataHedersToShow[handlemonthObj] === true) {
      this.monthlyView = true;
      let s = handlemonthObj.toString().split(' ')[0];
      this.inputParameters.TYPE = RESPONSE_TYPE.MONTHLY;
      this.inputParameters.MONTH = handlemonthObj;
      this.inputParameters.MONTH_VIEW.NO_OF_DAYS = this.calculateNoOfDaysInMonth(
        new Date(this.inputParameters.YEAR, this.inputParameters.MONTH, 1));
      this.inputParameters.MONTH_VIEW.NO_OF_DAYS_ARRAY = Array(
        this.inputParameters.MONTH_VIEW.NO_OF_DAYS).fill(0).map((x, i) => i + 1);
      this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = Math.ceil(this.inputParameters.MONTH / 3) + 1;
    }
  }

  lossFunction(obj) {
    console.log(obj);
  }

  handleBack() {
    this.inputParameters.TYPE = RESPONSE_TYPE.YEARLY;
    this.monthlyView = false;
    this.dataHedersToShow.map((x, i) => true);
    this.handleRightClick();
    this.handleLeftClick();
  }

  fetchDetails() {
    this.inputParameters.TYPE = parseInt(this.inputParameters.TYPE, 10);
    this.inputParameters.MONTH = parseInt(this.inputParameters.MONTH, 10);
    this.inputParameters.YEAR = parseInt(this.inputParameters.YEAR, 10);
    this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER = Math.ceil(parseInt(this.inputParameters.MONTH, 10) / 3) + 1;
    this.inputParameters.MONTH_VIEW.NO_OF_DAYS = this.calculateNoOfDaysInMonth(new Date(
      this.inputParameters.YEAR,
      this.inputParameters.MONTH,
      1
    ));
    this.inputParameters.MONTH_VIEW.NO_OF_DAYS_ARRAY = Array(
      this.inputParameters.MONTH_VIEW.NO_OF_DAYS
    ).fill(0).map((x, i) => i + 1);
    //  TODO HANDLE YEAR OPTIONS IN SLECT BOX
    this.flushAll();

    this.startDate = new Date(this.inputParameters.YEAR, 0, 1);
    this.endDate = new Date(this.inputParameters.YEAR, 11, 31);

    this.data.getData(this.startDate, this.endDate).subscribe((response) => {
      if (response === [] || response[0] === undefined) {
        this.prepareDataHeader();
        this.noData = true;
        return;
      }
      if (response != null || response !== []) {
        this.noData = false;
        for (let index in response) {
          this.responseDataL1.push(this.reFormat(response[index], index));
        }

        this.prepareDataHeader();
        this.getFormatL3();
        console.log(response);
      } else {
        this.flushAll();
      }
    });
  }
  flushAll() {
    this.responseDataL1 = [];
    this.responseDataL2 = {};
    this.responseDataL3 = {};
    this.monthIndexes = {};
    this.dataHeaders = [];
    this.uniqueMsid = [];
    this.dataHedersToShow = [];
    this.dataClipped = false;
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
  getResponseView() {
    let responseView = [];

    for ( let outerIndex in this.dataHeaders ) {
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
      let responseViewObj = {
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
  prepareDataHeader() {
    switch (parseInt(this.inputParameters.TYPE, 10)) {
      case RESPONSE_TYPE.YEARLY:  break;
      case RESPONSE_TYPE.MONTHLY: this.clipHeaders();
        break;
      case RESPONSE_TYPE.QUATERLY: this.clipHeaders();
        break;
    }
    this.startDate = new Date(this.inputParameters.YEAR, 0, 1) ;
    this.endDate = new Date(this.inputParameters.YEAR , 11, 31); this.fillDateHeader();
  }
  clipHeaders() {
    if (this.inputParameters.TYPE !== RESPONSE_TYPE.YEARLY) {
      this.dataClipped = true;
    }
    if (this.inputParameters.TYPE === RESPONSE_TYPE.QUATERLY) {
      const clipper = (this.inputParameters.QUARTER_VIEW.QUARTER_NUMBER - 1) * 3;
      for (let i = 0 ; i < 12; i++) {
        this.dataHedersToShow[i] = false;
      }
      this.dataHedersToShow[clipper] = true;
      this.dataHedersToShow[clipper + 1] = true;
      this.dataHedersToShow[clipper + 2] = true;
    }
    if (this.inputParameters.TYPE === RESPONSE_TYPE.MONTHLY) {
      const clipper = this.inputParameters.MONTH;
      for (let i = 0; i < 12; i++) {
        this.dataHedersToShow[i] = false;
      }
      this.dataHedersToShow[this.inputParameters.MONTH] = true;
    }
  }
  fillDateHeader() {
    let months = 0;
    months = (this.startDate.getFullYear() - this.endDate.getFullYear()) * 12;
    months -= this.startDate.getMonth();
    months += 1;
    months += this.endDate.getMonth();
    if(this.dataClipped === false) {
      this.dataHedersToShow = [];
    }
    this.dataHeaders = [];
    const startMonth = this.startDate.getMonth();
    const startYear = this.startDate.getFullYear();
    let yearIterator = startYear;
    for ( let i = 0; i < months; i++) {
      const monthIterator = (startMonth + i) % 12;
      if ( i > 0 )
        (monthIterator === 0 ? yearIterator += 1 : yearIterator = yearIterator );
      this.dataHeaders.push(
        this.monthHeaders[monthIterator] + ' ' + yearIterator
      );
      this.monthIndexes[this.monthHeaders[monthIterator] + yearIterator] = i;
      if(this.dataClipped === false) {
        this.dataHedersToShow.push(true);
      }
    }

  }
  calculateNoOfDaysInMonth(dateObj) {
    return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();
  }



}
