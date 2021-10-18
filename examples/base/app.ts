import EthersUtils from '../../src/index'
(async function() {
    const res = await new EthersUtils()
    console.log(res)
    const id = await res.getChainId()
    console.log('chainId', id)
    res.addEventListener('accountsChanged', (accounts: any) => {
        console.log('accountsChanged===', accounts)
    })
})()

