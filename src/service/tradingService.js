import xirr from 'xirr';
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
    this.currentMonth = -1;
    this.sipAmount = sipAmount;
    this.units = 0;
    this.boughtCurrentMonth = false;
    this.monthlyInvested = 0;
    this.startingNifty = 0;
    this.enableAlgo = enableAlgo;
    this.totalInvested = 0;
    this.monthlyInvested = 0;
    this.isLogEnabled = true;
    this.boughtLog = [];
    this.formulaHit = 0;
    this.lastMultiplier = 1;

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
  decideToBuySIP(niftyData) {
    if (this.currentMonth !== niftyData.momentDate.month() && niftyData.momentDate.date() >= this.startDate) {
      // Month changed
      this.log('--------Invested in the month: ', this.monthlyInvested);
      this.resetVariablesForEachMonth();
    }
    if (!this.boughtCurrentMonth) {
      const unitPrice = Number(niftyData.Close);
      // buy sip if not already bought
      this.buy(unitPrice, this.sipAmount, niftyData.momentDate);
      this.boughtCurrentMonth = true;
      this.currentMonth = niftyData.momentDate.month();
      this.startingNifty = Number(niftyData.Close);
      return;
    }
    if (this.enableAlgo && this.formulaToBuyOn(this.startingNifty, niftyData)) {
      const amount = this.multiplier(this.formulaHit, niftyData) * this.sipAmount;
      this.formulaHit += 1;
      const unitPrice = Number(niftyData.Close);

      this.buy(unitPrice, amount, niftyData.momentDate);
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
