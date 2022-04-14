const axios = require("axios");
const ResponseError = require("../errors/responseError");

const NutritionixService = {
    searchFood: async (query) => {
        try {
            const options = {
                method: 'GET',
                url: 'https://nutritionix-api.p.rapidapi.com/v1_1/search/' + query,
                params: {
                    fields: 'item_name,item_id,brand_name,nf_calories,nf_total_fat,nf_total_carbohydrate,nf_protein',
                    phrase: query
                },
                headers: {
                    'X-RapidAPI-Host': 'nutritionix-api.p.rapidapi.com',
                    'X-RapidAPI-Key': '44f3e50060mshb056b62d542980ep19bb33jsn425c266d51fd'
                }
            };

            let response = await axios.request(options);
            return response.data;
        } catch (err) {
            throw new ResponseError(err.response.data.error_message, err.response.data.status_code);
        }
    },

    searchBarcode: async (barcode) => {
        try {
            const options = {
                method: 'GET',
                url: 'https://nutritionix-api.p.rapidapi.com/v1_1/item',
                params: { upc: barcode },
                headers: {
                    'X-RapidAPI-Host': 'nutritionix-api.p.rapidapi.com',
                    'X-RapidAPI-Key': '44f3e50060mshb056b62d542980ep19bb33jsn425c266d51fd'
                }
            };

            let response = await axios.request(options);
            return response.data;
        } catch (err) {
            throw new ResponseError(err.response.data.error_message, err.response.data.status_code);
        }
    }
}

module.exports = NutritionixService;