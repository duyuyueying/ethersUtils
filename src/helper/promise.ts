export function doAsync(fnPromise: Promise<Function>): Promise<any>{
  return fnPromise.then((res:any) => [null, res]).catch((error: any) => [error])
}