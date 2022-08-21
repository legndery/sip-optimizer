import type { Moment } from 'moment';
export interface NiftyData {
  Date: string;
  Close: string;
  momentDate: Moment;
  UnitPrice: Number;
}
export as namespace SipOptTypes;