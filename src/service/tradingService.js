import { NiftyData } from '../typedefs/typedefs';

export default class TradingService {
  /**
   * 
   * @param {NiftyData} niftyData 
   */
  constructor(startDate, differenceThreshold, sipAmount){
    const SIP_AMOUNT = 5000;
    const START_DATE = 1;
    let units = 0;
    let currentMonth = -1;
    let boughtCurrentMonth = false;
    let startingNifty = 0;
    let threshold = 500;
    let invested = 0;
    let levelOfGoingDown = 1;
    let monthlyInvested = 0;
    let isLog = true;
    let boughtLog = [];
  }
  decideToBuySIP(niftyData){
    if(currentMonth !== niftyData.momentDate.month() && niftyData.momentDate.date() >= START_DATE){
      //month changed
      boughtCurrentMonth = false;
      isLog && console.log("--------Invested in the month: ", monthlyInvested);
      monthlyInvested = 0;
    }
    if(!boughtCurrentMonth){
      const unitPrice = Number(niftyData.Close);
      //buy sip if not already bought
      units += (SIP_AMOUNT/unitPrice);
      invested += SIP_AMOUNT;
      monthlyInvested += SIP_AMOUNT;
      isLog && console.log('Bought On:', niftyData.Date, SIP_AMOUNT);
      boughtLog.push({amount: -SIP_AMOUNT, when: niftyData.momentDate.toDate()})
      boughtCurrentMonth = true;
      currentMonth = niftyData.momentDate.month();
      startingNifty = Number(niftyData.Close);
      levelOfGoingDown = 1;
      return;
    }
    if(startingNifty - Number(niftyData.Close) > threshold){
      const amount = levelOfGoingDown*SIP_AMOUNT;
      const unitPrice = Number(niftyData.Close);
      units += (amount/unitPrice);
      invested += amount;
      monthlyInvested += amount;
      startingNifty = Number(niftyData.Close);
      isLog && console.log('==Bought On:', niftyData.Date, amount);
      boughtLog.push({amount: -amount, when: niftyData.momentDate.toDate()})
      levelOfGoingDown *=2;
      return;
    }
  }
}