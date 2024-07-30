import User from '../models/user.js';

export const register = async (name, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return existingUser;
  }

  const newUser = new User({ name, email, password });
  await newUser.save();
  return newUser;
};
