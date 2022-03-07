const fs = require('fs')
const { faker } = require('@faker-js/faker');

const STATUSES = ["ACTIVE", "PENDING", "BLOCKED"];
let STATUSES_COUNT = {
    ACTIVE: 0,
    PENDING: 0,
    BLOCKED: 0
}

const PROFILES_COUNT = 1000;
let profiles = [];

for (let index = 0; index < PROFILES_COUNT; index++) {
    const randomCard = faker.helpers.createCard(); // random contact card containing many properties
    const firstName = randomCard.name.split(" ")[0];
    const lastName = randomCard.name.split(" ")[1];
    const location = {
        address: `${randomCard.address.city}, ${randomCard.address.country}`,
        lat: parseFloat(randomCard.address.geo.lat),
        lng: parseFloat(randomCard.address.geo.lng)
    }
    const rand = Math.floor(Math.random() * (100 - 0 + 1)) + 0;
    let status = null;
    if (rand >= 0 && rand <= 50) status = "ACTIVE";
    else if (rand >= 51 && rand <= 75) status = "BLOCKED";
    else status = "PENDING";
    STATUSES_COUNT[status]++;
    const profile = {
        firstName: firstName,
        lastName: lastName,
        location: location,
        status: status,
    }
    profiles.push(profile);
}

for (let profile of profiles) {
    console.log(profile);
}

fs.writeFile("coachesTestData.json", JSON.stringify(profiles), 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }

    console.log("JSON file has been saved.");
});
