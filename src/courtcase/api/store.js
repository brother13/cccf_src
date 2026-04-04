/* jshint esversion: 8 */

var store = {

  set(key, value) {
    return localStorage.setItem(key, value)
  },
  get(key) {
    return localStorage.getItem(key)
  },
  remove(key) {
    return localStorage.removeItem(key)
  },
  clear() {
    return localStorage.clear()
  },
  Session_get(key) {
    return sessionStorage.getItem(key)
  },
  Session_set(key, value) {
    return sessionStorage.setItem(key, value)
  }

}

export default store
