export function cacheResponseError(error:any) : string {
  try{
    if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      return '错误:' + error.error.message
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      return '矿工费不足'
    } else if (error.code === 4001 || error === 'cancelled') {
      return '交易取消'
    } else {
      if ((error.data.message || '').indexOf('gas') > 0) {
        return '矿工费不足'
      } else if ((error.data.message || '').indexOf('RPC') > 0) {
        return '节点异常，请切换节点'
      } else if ((error.data.message || '').indexOf('reverted') > 0) {
        return '错误:' + error.data.message
      } else {
        return '异常'
      }
    }
  } catch(e) {
    return '异常'
  }
  
}