import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';
import moment from 'moment';
import _ from 'lodash';
import xirr from 'xirr';

const getData = async ()=>{
  const niftyData = [];
  return new Promise((res, rej)=>{
    fs.createReadStream(path.resolve(__dirname, '../assets', 'data.csv'))
    .pipe(csv.parse({ headers: true }))
    .on('error', rej)
    .on('data', row => niftyData.push({...row, momentDate: moment(row.Date, 'DD-MMM-YYYY')}))
    .on('end', ()=>res(niftyData));
  });
}
let units = 0;
const SIP_AMOUNT = 5000;
let currentMonth = -1;
let boughtCurrentMonth = false;
let startingNifty = 0;
let threshold = 500;
let invested = 0;
let levelOfGoingDown = 1;
const boughtLog = [];
/**
 * 
 * @param {Number} year 
 * @param {Number} month 
 * @param {{Date,Open,High,Low,Close,'Shares Traded','Turnover (Rs. Cr)', momentDate: moment()}} niftyData 
 */
const buySIP = (year, month, niftyData)=>{
  if(currentMonth !== niftyData.momentDate.month()){
    //month changed
    boughtCurrentMonth = false;
  }
  if(!boughtCurrentMonth){
    const unitPrice = Number(niftyData.Close)/100;
    //buy sip if not already bought
    units += (SIP_AMOUNT/unitPrice);
    invested += SIP_AMOUNT;
    console.log('Bought On:', niftyData.Date);
    boughtLog.push({amount: -SIP_AMOUNT, when: niftyData.momentDate.toDate()})
    boughtCurrentMonth = true;
    currentMonth = niftyData.momentDate.month();
    startingNifty = Number(niftyData.Close);
    levelOfGoingDown = 1;
    return;
  }
  if(startingNifty - Number(niftyData.Close) > threshold){
    const unitPrice = Number(niftyData.Close)/100;
    units += (levelOfGoingDown*SIP_AMOUNT/unitPrice);
    invested += levelOfGoingDown*SIP_AMOUNT;
    startingNifty = Number(niftyData.Close);
    console.log('==Bought On:', niftyData.Date);
    boughtLog.push({amount: -levelOfGoingDown*SIP_AMOUNT, when: niftyData.momentDate.toDate()})
    levelOfGoingDown++;
    return;
  }
};
const init = async ()=>{
  const niftyData = await getData();
  niftyData.forEach((data)=>{
    buySIP(null, null, data);
  });
  // console.log(niftyData);
  // const groupedNiftyData = groupByYearThenMonth(niftyData);
  // const yearsInData = Object.keys(groupedNiftyData).sort((a,b)=>Number(a)-Number(b));
  // console.log(yearsInData);
  // yearsInData.forEach((year)=>{
  //   const monthsInData = Object.keys(groupedNiftyData[year]).sort((a,b)=>Number(a)-Number(b));
  //   console.log(monthsInData);
  //   monthsInData.forEach(month=>{
  //     console.log(year, month);
  //     groupedNiftyData[year][month].forEach(niftyData=>{
  //       buySIP(year, month, niftyData);
  //     });
  //   });
  // });
  // get the month
  const currentValue = units*niftyData[niftyData.length -1].Close/100; 
  boughtLog.push({amount: currentValue, when: niftyData[niftyData.length -1].momentDate.toDate()})
  console.log('Current Value: ', currentValue);
  console.log('Invested Value: ', invested);
  console.log('Profit: ', currentValue - invested);
  console.log('XIRR: ', xirr(boughtLog)*100);
};

const groupByYearThenMonth = (/** @type {[{Date,Open,High,Low,Close,'Shares Traded','Turnover (Rs. Cr)', momentDate: moment()}]} **/data) =>{
  return data.reduce((p,c)=>{
    const year = c.momentDate.year();
    const month = c.momentDate.month();
    p[year] = p[year] || {};
    p[year][month] = p[year][month] || [];
    p[year][month].push(c);
    return p;
  }, {});
};
init().then();