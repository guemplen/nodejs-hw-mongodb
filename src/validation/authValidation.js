export const registrationSchema = {
  name: {
    in: ['body'],
    isString: {
      errorMessage: 'Name must be a string',
    },
    notEmpty: {
      errorMessage: 'Name is required',
    },
    isLength: {
      options: { min: 3, max: 50 },
      errorMessage: 'Name should be between 3 and 50 characters',
    },
  },
  email: {
    in: ['body'],
    isEmail: {
      errorMessage: 'Please provide a valid email address',
    },
    notEmpty: {
      errorMessage: 'Email is required',
    },
  },
  password: {
    in: ['body'],
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters long',
    },
    notEmpty: {
      errorMessage: 'Password is required',
    },
  },
};

export const loginSchema = {
  email: {
    in: ['body'],
    isEmail: {
      errorMessage: 'Please provide a valid email address',
    },
    notEmpty: {
      errorMessage: 'Email is required',
    },
  },
  password: {
    in: ['body'],
    notEmpty: {
      errorMessage: 'Password is required',
    },
  },
};

export const refreshSchema = {
  // refreshToken: {
  //   in: ['body'],
  //   notEmpty: {
  //     errorMessage: 'Refresh token is required',
  //   },
  //   custom: {
  //     options: (value) => {
  //       if (typeof value !== 'string') {
  //         throw new Error('Refresh token must be a string');
  //       }
  //       return true;
  //     },
  //   },
  // },
};

export const logoutSchema = {
  // authorization: {
  //   in: ['headers'],
  //   notEmpty: {
  //     errorMessage: 'Access token is required',
  //   },
  // },
};

