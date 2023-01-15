import PromiseThrottle from 'promise-throttle'

export const promiseThrottle = new PromiseThrottle({
  requestsPerSecond: 5
})
