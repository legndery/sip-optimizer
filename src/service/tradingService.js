import xirr from 'xirr';
import moment from 'moment';
import { LOG_ENABLED } from '../config/config';
import Formulae from '../formula/formulae';

export default class TradingService {
  /**
   *
   * @param {Number} startDate 1-31 start sip on this date
   * @param {Number} sipAmount
   * @param {Boolean} enableAlgo should enabled the formulae or not
   * @param {typeof Formulae.formulaToBuyOn} formulaToBuyOn callback function
   * @param {typeof Formulae.multiplierFormula} multiplier callback function
   */
  constructor(
    startDate,
    sipAmount,
    enableAlgo = false,
    formulaToBuyOn = Formulae.formulaToBuyOn,
    multiplier = Formulae.multiplierFormula,
  ) {
    this.startDate = startDate;
    this.sipAmount = sipAmount;
    this.units = 0;
    this.boughtCurrentMonth = false;
    this.monthlyInvested = 0;
    this.startingNifty = 0;
    this.enableAlgo = enableAlgo;
    this.totalInvested = 0;
    this.monthlyInvested = 0;
    this.isLogEnabled = LOG_ENABLED;
    this.boughtLog = [];
    this.firstBuyDateOfTheMonth = null;
    this.formulaHit = 0;
    this.lastMultiplier = 1;

    this.lastSIPDate = null;
    // Dynamic elements
    this.formulaToBuyOn = formulaToBuyOn;
    this.multiplier = (formulaHit, niftyData) => {
      this.lastMultiplier = multiplier(this.lastMultiplier, formulaHit, niftyData);
      return this.lastMultiplier;
    };
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
    this.log('Date:', date.format('DD/MMM/YYYY'), '| Amount:', this.sipAmount, '| Unit Price:', unitPrice);
  }

  addToLedger(amount, date) {
    this.boughtLog.push({ amount, when: date.toDate() });
  }

  /**
   *
   * @param {SipOptTypes.NiftyData} niftyData
   */
  isNewMonth(niftyData) {
    const SIP_DAY = moment(niftyData.momentDate).date(this.startDate);
    if (!SIP_DAY.isSame(this.lastSIPDate)) {
      // if not bought in the current month at all that means the month changed
      if (this.firstBuyDateOfTheMonth !== null && this.lastSIPDate.diff(this.firstBuyDateOfTheMonth) > 31) {
        return true;
      }
      this.lastSIPDate = SIP_DAY;
      // month changed
      if (niftyData.momentDate.isSameOrAfter(SIP_DAY)) {
        return true;
      }
    }
    return false;
  }

  /**
   *
   * @param {SipOptTypes.NiftyData} niftyData
   */
  decideToBuySIP(niftyData) {
    if (this.isNewMonth(niftyData)) {
      // Month changed
      this.log('--------Invested in the month: ', this.monthlyInvested);
      this.resetVariablesForEachMonth();
    }
    if (!this.boughtCurrentMonth) {
      // buy sip if not already bought
      this.buy(niftyData.UnitPrice, this.sipAmount, niftyData.momentDate);
      this.boughtCurrentMonth = true;
      this.firstBuyDateOfTheMonth = niftyData.momentDate;
      this.startingNifty = Number(niftyData.Close);
      return;
    }
    if (this.enableAlgo && this.formulaToBuyOn(this.startingNifty, niftyData)) {
      const amount = this.multiplier(this.formulaHit, niftyData) * this.sipAmount;
      this.formulaHit += 1;

      this.buy(niftyData.UnitPrice, amount, niftyData.momentDate);
      this.startingNifty = Number(niftyData.Close);
    }
  }

  completeService(currentInvestmentValue, date) {
    this.addToLedger(currentInvestmentValue, date);
  }

  calculateXIRR() {
    return xirr(this.boughtLog) * 100;
  }

  /// private methods
  resetVariablesForEachMonth() {
    this.boughtCurrentMonth = false;
    this.monthlyInvested = 0;
    this.lastMultiplier = 1;
    this.formulaHit = 0;
  }

  log(...data) {
    if (this.isLogEnabled) {
      console.log(...data);
    }
  }

  /// / getter setters
  getUnits() {
    return this.units;
  }

  getTotalInvested() {
    return this.totalInvested;
  }
}
