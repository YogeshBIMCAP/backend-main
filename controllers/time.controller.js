import { fetchElapsedTimeData } from "../utils/pagination.js";

/**
 * Controller to fetch elapsed time entries with pagination.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const fetchTimeElapsed = async (req, res) => {
  const { access_token, startDate, endDate } = req.body;

  try {

    // Use only valid sorting keys in the ORDER parameter
    const params = {
      auth: access_token,
      ORDER: { ID: 'desc' },
      FILTER: { '>=CREATED_DATE': String(startDate) , '<=CREATED_DATE': String(endDate)  }
    };

    // Fetch all paginated data using the pagination utility
    const allResults = await fetchElapsedTimeData(
      `${process.env.ROOT_URL}/task.elapseditem.getlist`,
      params
    );

    res.json({ allResults, userCount: allResults.length });
  } catch (error) {
    console.error('Error fetching elapsed time entries:', error);
    res.status(500).json({ error: error.message });
  }
};

export default fetchTimeElapsed;
