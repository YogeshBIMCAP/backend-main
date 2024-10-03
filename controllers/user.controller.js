import { fetchPaginatedData } from "../utils/pagination.js";
import axios from "axios";

/**
 * Controller to fetch a user's name by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getUserName = async (req, res) => {
  const userId = req.params.id;
  const { access_token } = req.body;

  try {
    const response = await axios.get(`${process.env.ROOT_URL}/user.get`, {
      params: {
        auth: access_token,
        FILTER: { ID: userId },
        SELECT: ["NAME", "LAST_NAME"],
      },
    });

    const result = response.data.result;
    if (result.length > 0) {
      const user = result[0];
      const userName = `${user.NAME} ${user.LAST_NAME}`;
      return res.json({ userName });
    }

    return res.json({ userName: "Unknown User" });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
};

/**
 * Controller to fetch all active users using pagination.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getActiveUsers = async (req, res) => {
  const { access_token } = req.body;
  const settings = { access_token };
  const filter = { ACTIVE: "Y" };
  const url = `${process.env.ROOT_URL}/user.get`;

  try {
    const totalActiveUsers = await fetchPaginatedData(url, settings, filter);
    const userCount = totalActiveUsers.length;
    return res.json({ totalActiveUsers, userCount });
  } catch (error) {
    console.error("Error fetching active users:", error);
    return res.status(500).json({ error: "Failed to fetch active users" });
  }
};
