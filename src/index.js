import FileManagerService from './service/filemanagerService';
import TradingService from './service/tradingService';
import { SIP_AMOUNT, START_DATE, THRESHOLD } from './config/config';

const init = async () => {
  const niftyData = await FileManagerService.readNiftyData();

  const tradingService = new TradingService(START_DATE, THRESHOLD, SIP_AMOUNT);
  console.log('Threshold:', THRESHOLD);
  niftyData.forEach((data) => {
    tradingService.decideToBuySIP(data);
  });
  console.log(tradingService.getUnits());
  const currentValue = tradingService.getUnits() * niftyData[niftyData.length - 1].Close;
  tradingService.completeService(currentValue, niftyData[niftyData.length - 1].momentDate);

  console.log('Current Value: ', currentValue);
  console.log('Invested Value: ', tradingService.getTotalInvested());
  console.log('Profit: ', currentValue - tradingService.getTotalInvested());
  console.log('XIRR: ', tradingService.calculateXIRR());
  console.log('----------------------');
};
init().then();
