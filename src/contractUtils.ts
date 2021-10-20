import { ethers } from 'ethers'
import {doAsync} from './helper/promise'
import {cacheResponseError} from './helper/error'
import {hex2int} from './helper/number'
import Big from 'big.js'
import EthersUtils from './index'

class ContractUtils extends EthersUtils{
  contract: any;
  constructor(token: string, abi: any, signer: any) {
    super()
    this.contract = new ethers.Contract(token, abi, signer)
  }
  // 普通方法， 直接返回
  async method(methodName: string, params = [], msg?: any): Promise<any>{
    let res
    if(msg){
      if(methodName.indexOf('estimateGas') > -1) {
        methodName = methodName.split('.')[1]
        res = await doAsync(this.contract.estimateGas[methodName](...params, msg))
      } else {
        res = await doAsync(this.contract[methodName](...params, msg))
      }
    } else {
      res = await doAsync(this.contract[methodName](...params))
    }
    if(res[0] != null) {
      res[0] = cacheResponseError(res[0])
    }
    return res
  }
  // 转精度方法
  async methodWithDecimal(methodName: string, decimal: number, params = [], msg?: any): Promise<any>{
    let res
    if(msg){
      res = await this.method(methodName, params, msg)
    } else {
      res = await this.method(methodName, params)
    }
    if(res[0] == null) {
      let pow = Math.pow(10, decimal)
      const Value = Big(hex2int(res[1])).div(Big(pow)).toFixed()
      res[1] = Value
    }
    return res
  }

  // 预估并调用合约方法
  async estimateMethod(methodName: string, callback?: any, params=[], modify = false, msgValue = 0) {
    let msg = {gasPrice: ethers.utils.parseUnits(String(this.gasPrice), "gwei")};
    if(msgValue != 0) {
      msg = Object.assign({}, msg, {value: msgValue})
    }
    let estRes = await this.methodWithDecimal(`estimateGas.${methodName}`, 0, params, msg)
    if(estRes[0] != null) {
      return estRes
    }
    msg = Object.assign({}, msg, {gasLimit: Number(estRes[1])})
    let res = await this.method(methodName, params, msg)
    if(res[0] == null && callback) {
      let wftRes = await doAsync(this.provider.waitForTransaction(res[1].hash))
      if(wftRes[0] != null){
        return wftRes
      }
      return callback()
    } else {
      return res
    }
  }

  // 授权合约
  async approveMethod(approveAddr: string, approveDecimal: number, dealAmount?: string, callback?: any){
    let params = [this.address, approveAddr]
    const allowanceRes = await this.methodWithDecimal('allowance', approveDecimal, params as any)
    if(allowanceRes[0] == null) {
      if (Big(allowanceRes[1]).gt(Big(dealAmount))) {
        return callback()
      } else {
        let estRes = await this.estimateMethod('approve', ()=>{
          return callback()
        }, [approveAddr, '1000000000000000000000000000000000000000000000000000000000000000000000000000'] as any)
        return estRes
      }
    } else {
      return allowanceRes
    }
  }
}
export default ContractUtils;