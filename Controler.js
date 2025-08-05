import generateToken from "./GenerateToken.js";
import Users from "./models/Usermodel.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = await Users.findOne({ email });
    if (users && password == users.password) {
      res.status(200).json({
        _id: users._id,
        username: users.username,
        email: users.email,
        password: users.password,
        number: users.number,
        address: users.address,
        role: users.role,
        token: generateToken(users._id),
      });
    } else {
      res.status(404).json({ message: "invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { username, email, password, number, address,role } = req.body;
    const userExists = await Users.findOne({ email,username });
    if (userExists) {
      res.status(400).json({ message: "user already exists" });
    } else {
      const user = Users.create({
        username,
        email,
        password,
        number,
        address,
        role,
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          username: user.username,
          email: user.email,
          password: user.password,
          number: user.number,
          address: user.address,
          role: user.role,
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: "Invalid User Data" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserprofile = async (req, res) => {
  try {
    const { id, token } = req.body;
    const user = await Users.findById(id);
    if (user) {
      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        password: user.password,
        number: user.number,
        address: user.address,
        role: user.role,
        token,
      });
    } else {
      res.status(404).json({ message: "invalid data" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
