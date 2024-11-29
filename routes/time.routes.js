import express from "express";
import fetchTimeElapsed from "../controllers/time.controller.js";
import axios from "axios";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

const router = express.Router();

router.post("/elapsed", fetchTimeElapsed);
router.post('/test', async (req, res) => {
    const { access_token } = req.body;
    
    const params = {
      auth: access_token,
      ORDER: { ID: 'desc' },
      FILTER: { '>=CREATED_DATE': '2024-10-02'  }
    };
  
    try {
      const response = await axios.get('https://bimcap.bitrix24.com/rest/task.elapseditem.getlist', { params });
      res.send(response.data);
    } catch (error) {
      console.error('Error fetching data from Bitrix24:', error);
      res.status(500).send({ error: error.message });
    }
  });

// Export the router
export default router;
