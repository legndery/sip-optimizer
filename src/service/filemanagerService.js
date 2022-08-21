import fs from 'fs';
import moment from 'moment';
import * as csv from 'fast-csv';
import { CSV_PATH, DATE_FORMAT } from '../config/config';
import { NiftyData } from '../typedefs/typedefs';

export default class FileManagerService {
  /**
   *
   * @returns {Promise<[NiftyData]>}
   */
  static async readNiftyData() {
    const niftyData = [];
    return new Promise((res, rej) => {
      fs.createReadStream(CSV_PATH)
        .pipe(csv.parse({ headers: true }))
        .on('error', rej)
        .on('data', (row) => niftyData.push({ ...row, momentDate: moment(row.Date, DATE_FORMAT) }))
        .on('end', () => res(niftyData.reverse()));
    });
  }
}
