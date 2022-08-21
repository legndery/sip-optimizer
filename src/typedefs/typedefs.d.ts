import type { Moment } from 'moment';
export interface NiftyData {
  Date: string;
  Close: string;
  momentDate: Moment
}
export as namespace SipOptTypes;