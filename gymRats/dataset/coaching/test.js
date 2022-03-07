const fs = require('fs')
const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');

const STATUSES = ["ACTIVE", "PENDING", "BLOCKED"];
let STATUSES_COUNT = {
    ACTIVE: 0,
    PENDING: 0,
    BLOCKED: 0
}

const PROFILES_COUNT = 10000;
let profiles = [];
let users = [];

try {
    for (let index = 0; index < PROFILES_COUNT; index++) {
        console.log(index)
        const randomCard = faker.helpers.createCard(); // random contact card containing many properties
        const firstName = randomCard.name.split(" ")[0];
        const lastName = randomCard.name.split(" ")[1];
        const password = randomstring.generate(8);
        const user = {
            _id: mongoose.Types.ObjectId(),
            firstName: firstName,
            lastName: lastName,
            password: bcrypt.hashSync(password, 10),
            unhashedPassword: password,
            email: randomCard.email,
            profilePicture: undefined,
            verifiedEmail: false,
            weightUnit: ["KILOGRAMS", "POUNDS"][Math.floor(Math.random() * (1 - 0 + 1) + 0)],
            lastPasswordReset: new Date(),
            createdDt: new Date()
        }
        users.push(user);
        if (index % 10 == 0) {
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
                userId: user._id,
                location: location,
                status: status,
            }
            profiles.push(profile);
        }
    }

    fs.writeFile("coachesTestData.json", JSON.stringify(profiles), 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }

        console.log("JSON file has been saved.");
    });

    fs.writeFile("usersTestData.json", JSON.stringify(users), 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }

        console.log("JSON file has been saved.");
    });
} catch (err) {
    throw new Error(err);
}
