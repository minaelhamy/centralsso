'use strict'

const register = {
  body: {
    type: 'object',
    properties: {
      username: { type: 'string', minLength: 3, maxLength: 20 },
      password: { type: 'string', minLength: 6, maxLength: 20 },
      email: { type: 'string', minLength: 7 }
    },
    required: ['username', 'password', 'email']
  }
}

const activation = {
  body: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    },
    required: ['id']
  }
}

const login = {
  body: {
    type: 'object',
    properties: {
      username: { type: 'string' },
      password: { type: 'string' }
    },
    required: ['username', 'password']
  }
}

const checkUsername = {
  params: {
    type: 'object',
    properties: {
      username: { type: 'string', minLength: 3, maxLength: 20 }
    }
  }
}

const checkEmail = {
  params: {
    type: 'object',
    properties: {
      email: { type: 'string', minLength: 7 }
    }
  }
}

const forgotPassword = {
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', minLength: 7 }
    },
    required: ['email']
  }
}

const resetPassword = {
  body: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      password: { type: 'string', minLength: 6, maxLength: 20 }
    },
    required: ['id', 'password']
  }
}

const changePassword = {
  type: 'object',
  properties: {
    oldpassword: { type: 'string', minLength: 6, maxLength: 20 },
    newpassword: { type: 'string', minLength: 6, maxLength: 20 }
  },
  required: ['oldpassword', 'newpassword']
}

const editProfile = {
  type: 'object',
  properties: {
    fullname: { type: 'string', maxLength: 50 },
    email: { type: 'string', minLength: 7 },
    data: { type: 'object' }
  },
  required: ['email']
}

const getProfile = {
  params: {
    type: 'object',
    properties: {
      username: { type: 'string' }
    }
  }
}

const addUser = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 20 },
    password: { type: 'string', minLength: 6, maxLength: 20 },
    role: { type: 'string' },
    email: { type: 'string', minLength: 7 }
  },
  required: ['username', 'email', 'password', 'role']
}

const updateUser = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 20 },
    role: { type: 'string' },
    status: { type: 'integer' },
    email: { type: 'string', minLength: 7 }
  },
  required: ['username', 'email', 'role']
}

const suspendUser = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 20 }
  },
  required: ['username']
}

const updateStatusUser = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 20 },
    status: { type: 'integer' }
  },
  required: ['username', 'status']
}

const deleteUser = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 20 }
  },
  required: ['username']
}

const listUser = {
  type: 'object',
  properties: {
    search: { type: 'string' },
    last_created_at: { type: 'integer' },
    limit: { type: 'integer' }
  }
}

const listUserLastLogin = {
  type: 'object',
  properties: {
    search: { type: 'string' },
    last_login_at: { type: 'integer' },
    limit: { type: 'integer' }
  }
}

module.exports = {
  register,
  activation,
  login,
  checkUsername,
  checkEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  editProfile,
  getProfile,
  addUser,
  updateUser,
  suspendUser,
  updateStatusUser,
  deleteUser,
  listUser,
  listUserLastLogin
}
