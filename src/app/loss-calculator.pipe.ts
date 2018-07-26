import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lossCalculator'
})
export class LossCalculatorPipe implements PipeTransform {

  transform(value: any, args?: any): any {

    if (args === 'ALL') {
      const response = {
        'PLANNED' : 0,
        'OVERLAPPED' : 0
      };
      for (let i = 0; i < value.uniqueMsid.length; i++) {
        let responseOne = this.getPlannedAndOverlappedForCustomMSID(value, value.uniqueMsid[i]);
        let  s = responseOne.split(' ');
        response.PLANNED += parseInt(s[0], 10);
        response.OVERLAPPED += parseInt(s[3], 10);
      }
      return response.PLANNED + '   ' + response.OVERLAPPED;
    } else {
      return this.getPlannedAndOverlappedForCustomMSID(value, args);
    }
  }
  getPlannedAndOverlappedForCustomMSID(value, args) {
    if (value.monthlyView === false) {
      const response = {
        'PLANNED': 0,
        'OVERLAPPED': 0
      };
      for (let i = 0; i < value.monthHeaders.length; i++) {
        if (value.dataHedersToShow[i] === true) {
          const viewArray = value.responseDataL3[args].VIEW;
          const oneResp = this.getPlannedAndOverlapped(viewArray[i]);
          response.PLANNED += oneResp.PLANNED;
          response.OVERLAPPED += oneResp.OVERLAPPED;
        }
      }
      console.log(value);

      return response.PLANNED + '   ' + response.OVERLAPPED;
    } else {
      const month = value.inputParameters.MONTH;
      const response = {'PLANNED': 0, 'OVERLAPPED' : 0 };
      for (let i = 0; i < value.responseDataL3[args].VIEW[month].REPORT.length; i++) {
        if (value.responseDataL3[args].VIEW[month].REPORT[i] === 1) {
          response.PLANNED += 1;
        } else if (value.responseDataL3[args].VIEW[month].REPORT[i] === 2) {
          response.OVERLAPPED += 1;
        }
      }
      return response.PLANNED + '   ' + response.OVERLAPPED;
    }
  }
  getPlannedAndOverlapped(arrayObj) {
   const response = {'PLANNED' : 0, 'OVERLAPPED' : 0};
   for (let i = 0; i < arrayObj.REPORT.length; i++) {
     if (arrayObj.REPORT[i] === 1) {
       response.PLANNED += 1;
     } else if (arrayObj.REPORT[i] === 2) {
       response.OVERLAPPED += 1;
     }
   }
   return response;
  }



}
