import { ethers } from 'ethers'
import Big from 'big.js'

enum EventName{
  accountsChanged, // 监听账号改变
  chainChanged, // 监听网络改变
}

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
      // console.log(provider, signer)
      // 为了满足构造函数中可使用async/await
      const getAddr = (async ()=> {
        // 用于metamask弹出链接弹框
        await (window as any).ethereum.send('eth_requestAccounts');
        const address = await this.getAddress()
        this.address = address
        this.gasPrice = await this.getGasPrice()
        delete this.then;
        return this
      })()
      this.then = getAddr.then.bind(getAddr)
    }
  }

  // 事件监听"metamsk"
  // TODO: 这里的callback怎么定义
  // eventName: accountsChanged
  addEventListener(eventName: string, callback: any) {
    (window as any).ethereum.on(eventName, callback)
  }

  async getAddress() {
    return await this.signer.getAddress().then((res: any) => res).catch((error: any) => {
      console.log('catch=====', error)
    })
  }

  async getGasPrice(){
    return this.calcAmount(await this.signer.getGasPrice(), 9)
  }

  // 获取链id
  async getChainId() {
    const network = await this.provider.getNetwork();
    console.log(network, this.provider)
    return network.chainId
  }

  // 提供给人看的数字
  calcAmount(num: string, decimal: number){
    return Big(num).div(Big(ethers.BigNumber.from(10).pow(decimal))).toFixed()
  }
}

export default EthersUtils;