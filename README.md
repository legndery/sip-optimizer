# Sip Optimizer(Kinda)

This is a backtesting framwork(again, kinda) to understand if doing SIP with any kind of strategy that people talk about are worth looking into or not.

The Current implementation takes data in CSV:
```
"Date","Open","High","Low","Close"
"19 Aug 2022","17966.55","17992.20","17710.75","17758.45"
```
and converts it to this format:
```
{                     
  Date: '19 Aug 2022',
  Open: '17966.55',   
  High: '17992.20',   
  Low: '17710.75',    
  Close: '17758.45',  
  momentDate: Moment<2022-08-19T00:00:00+05:30>,   
  UnitPrice: 17758.45 
}
```
### Observations regarding Data:
1. UnitPrice is considered same as Nifty Closing price of that day.
    * Can change it to ur favorite Fund's Daily nav
2. momentDate is a internal date feild that converts the Date to a moment.js format
3. Currently Nifty50 10yrs data is loaded into the script

## The Trading Service:
```js
 /**
   *
   * @param {Number} startDate 1-31 start sip on this date
   * @param {Number} sipAmount
   * @param {Boolean} enableAlgo should enabled the formulae or not
   * @param {typeof Formulae.formulaToBuyOn} formulaToBuyOn callback function
   * @param {typeof Formulae.multiplierFormula} multiplier callback function
   */
  const tradingService = new TradingService(
      START_DATE,
      SIP_AMOUNT,
      true,
      // THis is the expression that needs to hit in order to place buy order
      Formulae.formulaToBuyOn,
      // This is the expression that multiplies the SIP amount according to the last multiplier and how many times the formula hit in a month
      Formulae.multiplierFormula,
    );
```
The parameters:
1. Start date which day of the month you want to start the SIP
2. Self explanatory SIP amount
3. if you want the algorithm/strategy you want to be enabled or not. Works if you want to measure the base xirr
4. a Callback for the formula/Strategy/algorthm you want to create. It is an expression so returning truthy value means there will be a buy call
5. a Callback for the multiplier of the SIP amount. For example if you want to invest double the amount if your formula hits then you can set it here.

## Default Formulae/Strategy/Algorithm
1. The algorithm currently baked into this is: if in a month the nifty index falls 500 points then BUY.
  ```js
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
  ```
2. The multiplier algorithm: First 500 buy SIP amount, if it falls another 500 invest 2x SIP amount, another 500 4x SIP amount. so, X,2X,4X and so on.
  ```js
  /**
   * if want to increase sip amount if the formula hits
   * @param {Number} lastMultiplier
   * @param {Number} ithForumulaHit the formula hits for that month. Zero based. So the first Hit will be zero.
   * @returns
   */
  static multiplierFormula(lastMultiplier, ithForumulaHit, niftyData) {
    if (!ithForumulaHit) return 1;
    return lastMultiplier * 2;
  }
  ```
Disclaimer: Its not like an investment tool, its a pet project for backtesting some interesting claims people make. Given that there are other tools for probably 1000x better if you want to seriously do algo-trading then I suggest you use those.