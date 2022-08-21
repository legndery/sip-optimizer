import fs from 'fs';
import moment from 'moment';
import * as csv from 'fast-csv';
import { CSV_PATH, DATE_FORMAT } from '../config/config';

export default class FileManagerService {
  /**
   *
   * @returns {Promise<[SipOptTypes.NiftyData]>}
   */
  static async readNiftyData() {
    const niftyData = [];
    return new Promise((res, rej) => {
      fs.createReadStream(CSV_PATH)
        .pipe(csv.parse({ headers: true }))
        .on('error', rej)
        .on('data', (row) => niftyData.push({ ...row, momentDate: moment(row.Date, DATE_FORMAT), UnitPrice: Number(row.Close) }))
        .on('end', () => res(niftyData));
    });
  }
}
