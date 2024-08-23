import axios from "axios";

export const getArsenalFixturesForCurrentSeason = async () => {
    try {
        const rapidApiHeaders = {
            headers: {
                'x-rapidapi-key': 'd241f0783fmshdda528fa7e70127p1dae6cjsnd6bed51ff1d7',
                'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
            }
        }

        const res = await axios.get(`https://api-football-v1.p.rapidapi.com/v3/fixtures?season=2024&team=42`, rapidApiHeaders);

        return res.data.response;

        // eslint-disable-next-line no-unreachable
    } catch (error) {
        // Add custom logic to handle errors
    }
};