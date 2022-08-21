import { PERCENTAGE_ACCEPTABLE_DELTA, THRESHOLD } from '../config/config';

export default class Formulae {
  /**
   * The expression if true a buy call will be placed
   * @param {Number} startingNiftyThatMonth at the price the first sip was bought
   * @param {NiftyData} niftyData
   * @returns
   */
  static formulaToBuyOn(startingNiftyThatMonth, niftyData) {
    const actualThreshold = THRESHOLD * ((100 - PERCENTAGE_ACCEPTABLE_DELTA) / 100);
    return startingNiftyThatMonth - Number(niftyData.Close) >= actualThreshold;
  }

  /**
   * if want to increase sip amount if the formula hits
   * @param {Number} lastMultiplier
   * @param {Number} ithForumulaHit the formula hits for that month
   * @returns
   */
  // eslint-disable-next-line no-unused-vars
  static multiplierFormula(lastMultiplier, ithForumulaHit, niftyData) {
    if (!ithForumulaHit) return 1;
    return lastMultiplier * 2;
  }
}
