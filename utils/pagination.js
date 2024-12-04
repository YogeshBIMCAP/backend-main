import axios from "axios";
/**
 * A utility function to handle paginated requests from an API.
 * @param {String} url - The API endpoint to fetch data from.
 * @param {Object} settings - An object containing the access token and other parameters.
 * @param {Object} filter - The filter options to apply when fetching data.
 * @returns {Array} - Returns an array of all the fetched users.
 */
export const fetchPaginatedData = async (
  url,
  settings={},
  filter = {},
  Select = [],
) => {
  let totalData = [];
  let start = 0;
  let hasMore = true;

  console.log({
    url,
    settings,
    filter,
    Select
  });
  

  try {
    while (hasMore) {
      const response = await axios.get(url, {
        params: {
          auth: settings.access_token,
          IS_ADMIN: "Y",
          ORDER: { ID: "desc" },
          filter: filter,
          select: Select,
          start, // Pagination starts from this point
        },
      });

      const result = response.data.result;
      const next = response.data.next; // 'next' tells if more data is available
      

      totalData = totalData.concat(result); // Append new data to the totalData array

      if (next !== undefined) {
        start = next; // Move to the next page
      } else {
        hasMore = false; // No more pages if 'next' is not provided
      }
    }
  } catch (error) {
    console.error("Error fetching paginated data:", error);
    throw new Error("Pagination failed");
  }

  return totalData; // Return the accumulated data
};
export const fetchElapsedTimeData = async (url, params) => {
  let totalData = [];
  let start = 0;
  let hasMore = true;
  let page = 1

  console.log("fetching data", url, params);
  

  try {
    while (hasMore) {

      const response = await axios.get(url, {
        params: {
          auth: params.auth,
          ORDER: params.ORDER || [],
          FILTER: params.FILTER || [],
          select:params.SELECT || [],
          PARAMS: {
            NAV_PARAMS: {
              nPageSize: 50, // Number of items per page
              iNumPage: page   // Page number
            }
          }
          
        },
      });

      console.log(response.data);
      if (response.data.result.length == 50) {

        
        start += 50;
        page++
        const result = response.data.result;

        totalData = totalData.concat(result); // Append new data to the totalData array
      } else {
        const result = response.data.result;
        totalData = totalData.concat(result); // Append new data to the totalData array
        hasMore = false;
      }
    }
  } catch (error) {
    console.error("Error fetching paginated data:", error);
    throw new Error("Pagination failed");
  }
  return totalData; // Return the accumulated data
};
