import { ethers } from 'ethers'
import Big from 'big.js'
class EthersUtils{
  [x: string]: any;
  provider: any;
  signer: any;
  address: string = '';
  gasPrice: string= '3'
  
  constructor() {
    // TODO: 可以在构造函数中需要抛出错误
    if (typeof (window as any).ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner()
      this.provider = provider;
      this.signer = signer
      // 为了满足构造函数中可使用async/await
      const getAddr = (async ()=> {
        this.address = await this.getAddress()
        this.gasPrice = await this.getGasPrice()
        delete this.then;
        return this
      })()
      this.then = getAddr.then.bind(getAddr)
      this.getAddress()
    }
  }

  // 事件监听
  // TODO: 这里的callback怎么定义
  addEventListener(eventName: string, callback: any) {
    (window as any).ethereum.on(eventName, callback)
  }

  async getAddress() {
    // window.addEventListener
    return await this.signer.getAddress()
  }

  async getGasPrice(){
    return this.calcAmount(await this.signer.getGasPrice(), 9)
  }

  // 获取链id
  async getChainId() {
    const network = await this.provider.getNetwork();
    return network.chainId
  }

  // 提供给人看的数字
  calcAmount(num: string, decimal: number){
    return Big(num).div(Big(ethers.BigNumber.from(10).pow(decimal))).toFixed()
  }
}

export default EthersUtils;