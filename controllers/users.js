const { prisma } = require("../prisma/prisma-client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Заполните все поля" });
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    const isPasswordCorrect =
      user && (await bcrypt.compare(password, user.password));
    const secret = process.env.JWT_SECRET;

    if (user && isPasswordCorrect && secret) {
      res.status(200).json({
        id: user.id,
        email: user.email,
        name: user.name,
        token: jwt.sign({ id: user.id }, secret, { expiresIn: "30d" }),
      });
    } else {
      return res.status(400).json({ message: "Неверный логин или пароль" });
    }
  } catch (error) {
    res.status(500).json({ message: "Что-то пошло не так" });
  }
};

const register = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name) {
      return res.send(400).json({ message: "Заполните все поля" });
    }

    const registeredUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (registeredUser) {
      return res.status(400).json({ message: "Пользователь уже существует" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    const secret = process.env.JWT_SECRET;

    if (user && secret) {
      res.status(201).json({
        id: user.id,
        email: user.email,
        name,
        token: jwt.sign({ id: user.id }, secret, { expiresIn: "30d" }),
      });
    } else {
      return res
        .status(400)
        .json({ message: "Не удалось создать пользователя" });
    }
  } catch (error) {
    res.status(500).json({ message: "Что-то пошло не так" });
  }
};

const current = async (req, res) => {
  return res.status(200).json(req.user);
};

const edit = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    await prisma.user.update({
      where: {
        id,
      },
      data,
    });

    res.status(204).json("Ok");
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Не удалось редактировать пользователя" });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Не удалось получить пользователя" });
  }
};

module.exports = {
  login,
  register,
  current,
  edit,
  getUserById,
};