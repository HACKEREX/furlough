import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatMonth'
})
export class FormatMonthPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    console.log(value);
    const s = value.split(' ');
    //console.log(s[0] + s[1][2] + s[1][3])
    return s[0] + ',' + s[1][2] + s[1][3];
  }

}
