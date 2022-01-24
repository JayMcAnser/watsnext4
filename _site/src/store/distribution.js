/**
 * distribution store
 *
 */


export const state = () => ({
  distribution: {}
})


export const mutations = {
  increment(state) {

  }
}


export const actions = {
  increment(context) {
    context.commit('increment')
  }
}


export const getters = {

  data: (state) => {
    return state.elementClass;
  }
}

export const distribution = {
  state,
  mutations,
  actions,
  getters

}
