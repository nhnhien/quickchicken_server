const getUser = async (req, res) => {
  res.status(200).json('Hello');
};

const createUser = async (req, res) => {
  const { name } = req.body;
  res.json({ message: `User ${name} created!` });
};

const updateUser = async (req, res) => {
  res.status(200).json('update user');
};

const deleteUser = async (req, res) => {
  res.status(200).json('delete user');
};

export { getUser, createUser, updateUser, deleteUser };
