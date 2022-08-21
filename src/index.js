import moment from 'moment';
import _ from 'lodash';
import xirr from 'xirr';
import FileManagerService from './service/filemanagerService';

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
/**
 * 
 * @param {Number} year 
 * @param {Number} month 
 * @param {{Date,Open,High,Low,Close,'Shares Traded','Turnover (Rs. Cr)', momentDate: moment()}} niftyData 
 */
const decideToBuySIP = (niftyData)=>{
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
};
const init = async ()=>{
  const niftyData = await FileManagerService.readNiftyData();
  for(let th = 500;th<=500;th+=100){
    threshold = th;
    console.log("Threshold:", threshold);
    niftyData.forEach((data)=>{
      decideToBuySIP(data);
    });
    const currentValue = units*niftyData[niftyData.length -1].Close; 
    boughtLog.push({amount: currentValue, when: niftyData[niftyData.length -1].momentDate.toDate()})
    console.log('Current Value: ', currentValue);
    console.log('Invested Value: ', invested);
    console.log('Profit: ', currentValue - invested);
    console.log('XIRR: ', xirr(boughtLog)*100);
    console.log("----------------------");
    units = 0;
    currentMonth = -1;
    boughtCurrentMonth = false;
    startingNifty = 0;
    threshold = 500;
    invested = 0;
    levelOfGoingDown = 1;
    monthlyInvested = 0;
    boughtLog = [];
  }
};
init().then();