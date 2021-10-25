

export const status = {
    success: 'success',
    error: 'error'
  }

export const apiState = {
  idle: 'idle',
  waiting: 'waiting',
  ready: 'ready',
  error: 'error'
}

export const axiosActions = {
  status: function(res) {
    return res.status
  },
  isOk: function(res) {
    return res.status === 200 && res.data.errors === undefined
  },
  hasErrors: function(res) {
    return res.data && !!res.data.errors
  },
  data: function(res) {
    // if (res.data.data.has('_id')) {
    //   // mongo should return id, not the _id
    //   res.data.data.id = res.data.data._id
    // }
    return res.data.data
  },
  errors: function(res) {
    if (res.data && res.data.errors) {
      return res.data.errors.map(err => err.title).join('\n')
    }
    console.log(res.data)
    return 'unknown error'
  },
  errorMessage: function(res) {
    if (res.data.errors && res.data.errors.length > 0) {
      return res.data.errors.map(err => {
        return err.title}
        ).join(', ');
    } else {
      return 'no error message found'
    }
  }
}

