import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countPlannedFurlough'
})
export class CountPlannedPipe implements PipeTransform {

  transform(value: any): string {
    let count = 0;
    for(let i = 0 ; i < value.length; i++) {
      if( parseInt(value[i], 10) === 1 ) {
        count += 1;
      }
    }
    return count + '';
  }

}


@Pipe({
  name: 'countOverlappedFurlough'
})
export class CountOverlappedPipe implements PipeTransform {

  transform(value: any): string {
    let count = 0;
    for(let i = 0 ; i < value.length; i++) {
      if( parseInt(value[i], 10) === 2 ) {
        count += 1;
      }
    }
    return count + '';
  }

}
