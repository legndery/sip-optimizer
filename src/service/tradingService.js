import xirr from 'xirr';
// eslint-disable-next-line no-unused-vars
import { NiftyData } from '../typedefs/typedefs';

export default class TradingService {
  constructor(startDate, differenceThreshold, sipAmount, formula = TradingService.defaultFormula, enableAlgo = false) {
    this.startDate = startDate;
    this.currentMonth = -1;
    this.threshold = differenceThreshold;
    this.sipAmount = sipAmount;
    this.formula = formula;
    this.units = 0;
    this.boughtCurrentMonth = false;
    this.monthlyInvested = 0;
    this.startingNifty = 0;
    this.enableAlgo = enableAlgo;
    this.totalInvested = 0;
    this.levelOfGoingDown = 1;
    this.monthlyInvested = 0;
    this.isLogEnabled = false;
    this.boughtLog = [];
  }

  static defaultFormula() {
    return 1;
  }

  log(...data) {
    if (this.isLogEnabled) {
      console.log(...data);
    }
  }

  /**
   *
   * @param {Number} unitPrice
   * @param {Number} amount
   * @param {import('moment').Moment} date
   */
  buy(unitPrice, amount, date) {
    this.units += (amount / unitPrice);
    this.totalInvested += amount;
    this.monthlyInvested += amount;
    this.addToLedger(-amount, date);
  }

  addToLedger(amount, date) {
    this.boughtLog.push({ amount, when: date.toDate() });
  }

  /**
   *
   * @param {NiftyData} niftyData
   */
  decideToBuySIP(niftyData) {
    if (this.currentMonth !== niftyData.momentDate.month() && niftyData.momentDate.date() >= this.startDate) {
      // month changed
      this.boughtCurrentMonth = false;
      this.log('--------Invested in the month: ', this.monthlyInvested);
      this.monthlyInvested = 0;
    }
    if (!this.boughtCurrentMonth) {
      const unitPrice = Number(niftyData.Close);
      // buy sip if not already bought
      this.buy(unitPrice, this.sipAmount, niftyData.momentDate);
      this.log('Bought On:', niftyData.Date, this.sipAmount);
      this.boughtCurrentMonth = true;
      this.currentMonth = niftyData.momentDate.month();
      this.startingNifty = Number(niftyData.Close);
      this.levelOfGoingDown = 1;
      return;
    }
    if (this.enableAlgo && this.startingNifty - Number(niftyData.Close) > this.threshold) {
      const amount = this.levelOfGoingDown * this.sipAmount;
      const unitPrice = Number(niftyData.Close);
      this.buy(unitPrice, this.sipAmount, niftyData.momentDate);
      this.startingNifty = Number(niftyData.Close);
      this.log('==Bought On:', niftyData.Date, amount);
      this.levelOfGoingDown *= 2;
    }
  }

  completeService(currentInvestmentValue, date) {
    this.addToLedger(currentInvestmentValue, date);
  }

  calculateXIRR() {
    return xirr(this.boughtLog) * 100;
  }

  /// / getter setters
  getUnits() {
    return this.units;
  }

  getTotalInvested() {
    return this.totalInvested;
  }
}
