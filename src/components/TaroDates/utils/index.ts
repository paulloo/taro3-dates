import Taro  from '@tarojs/taro'
import { SelectorQuery } from '@tarojs/taro/types/index'

const ENV = Taro.getEnv()

export function delay(delayTime = 500): Promise<null> {
  return new Promise(resolve => {
    if ([Taro.ENV_TYPE.WEB, Taro.ENV_TYPE.SWAN].includes(ENV)) {
      setTimeout(() => {
        resolve(null)
      }, delayTime)
      return
    }
    resolve(null)
  })
}

export function delayQuerySelector(
    selectorStr: string,
    delayTime = 500
  ): Promise<Array<any>> {
    const selector: SelectorQuery = Taro.createSelectorQuery()
    return new Promise(resolve => {
      delay(delayTime).then(() => {
        selector
          .select(selectorStr)
          .boundingClientRect()
          .exec((res: Array<any>) => {
            resolve(res)
          })
      })
    })
  }