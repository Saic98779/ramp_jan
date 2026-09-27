import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'commaSeperationIndia'
})
export class CommaSeperationIndiaPipe implements PipeTransform {

  transform(value: number | string | null | undefined, symbol: string = '₹'): string {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return 'N/A';
    }

    // Format number with Indian numbering system
    const formattedAmount = this.formatIndianNumber(numValue);
    
    return `${symbol} ${formattedAmount}`;
  }

  private formatIndianNumber(num: number): string {
    const isNegative = num < 0;
    const absNum = Math.abs(num);

    // Round to paise - raw values carry float noise (e.g. 340.08510636)
    const rounded = Math.round(absNum * 100) / 100;

    // Check if number has decimals
    const hasDecimals = rounded % 1 !== 0;
    const parts = rounded.toString().split('.');
    let integerPart = parts[0];
    const decimalPart = hasDecimals ? `.${parts[1]}` : '';
    
    // Apply Indian numbering system (lakhs, crores)
    if (integerPart.length > 3) {
      const lastThree = integerPart.substring(integerPart.length - 3);
      const otherNumbers = integerPart.substring(0, integerPart.length - 3);
      
      if (otherNumbers !== '') {
        integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
      } else {
        integerPart = lastThree;
      }
    }
    
    const result = integerPart + decimalPart;
    return isNegative ? `-${result}` : result;
  }
}
