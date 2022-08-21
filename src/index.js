import FileManagerService from './service/filemanagerService';
import TradingService from './service/tradingService';
import { SIP_AMOUNT, START_DATE, THRESHOLD } from './config/config';
import Formulae from './formula/formulae';

class SIPOptimizer {
  static async run() {
    const niftyData = await FileManagerService.readNiftyData();
    // Just to be on the safer side
    niftyData.sort((a, b) => a.momentDate.diff(b.momentDate));

    const tradingService = new TradingService(
      START_DATE,
      SIP_AMOUNT,
      true,
      // THis is the expression that needs to hit in order to place buy order
      Formulae.formulaToBuyOn,
      // This is the expression that multiplies the SIP amount according to the last multiplier and how many times the formula hit in a month
      Formulae.multiplierFormula,
    );
    niftyData.forEach((data) => {
      tradingService.decideToBuySIP(data);
    });
    const currentValue = tradingService.getUnits() * niftyData[niftyData.length - 1].Close;
    tradingService.completeService(currentValue, niftyData[niftyData.length - 1].momentDate);

    console.log('----------------------');
    console.log('AlgoEnabled:', tradingService.enableAlgo);
    console.log('Threshold:', THRESHOLD);
    console.log('Current Value: ', currentValue);
    console.log('Invested Value: ', tradingService.getTotalInvested());
    console.log('Profit: ', currentValue - tradingService.getTotalInvested());
    console.log('XIRR: ', tradingService.calculateXIRR());
    console.log('----------------------');
  }
}

SIPOptimizer.run();
