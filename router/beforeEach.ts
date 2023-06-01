import config from 'config'
import { Route } from 'vue-router'
import rootStore from '@vue-storefront/core/store'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'

export async function beforeEach (to: Route, from: Route, next) {
  const cartToken: string = rootStore.state.cart.cartServerToken;
  const userToken: string = rootStore.state.user.token;
  const externalCheckoutConfig = { ...config.externalCheckout };
  const cmsUrl: string = externalCheckoutConfig.cmsUrl;
  const stores = externalCheckoutConfig.stores;
  const storeCode = currentStoreView().storeCode
  const multistoreEnabled: boolean = config.storeViews.multistore

  if (multistoreEnabled) {
    if (storeCode in stores && to.name === storeCode + '-checkout') {
      await rootStore.dispatch('cart/sync', {
        forceClientState: true,
        forceSync: true
      })
      window.location.assign(stores[storeCode].cmsUrl + '/vue/cart/sync/token/' + userToken + '/cart/' + cartToken)
    } else if (storeCode in stores && to.name === 'checkout' && stores[storeCode].cmsUrl !== undefined) {
      rootStore.commit('ui/setSpinner', true);
      await rootStore.dispatch('cart/sync', {
        forceClientState: true,
        forceSync: true
      })
      rootStore.commit('ui/setSpinner', false);
      window.location.assign(stores[storeCode].cmsUrl + '/vue/cart/sync/token/' + userToken + '/cart/' + cartToken)
    } else {
      next()
    }
  } else {
    if (to.name === 'checkout') {
      await rootStore.dispatch('cart/sync', {
        forceClientState: true,
        forceSync: true
      })
      window.location.assign(cmsUrl + '/vue/cart/sync/token/' + userToken + '/cart/' + cartToken)
    } else {
      next()
    }
  }
}
