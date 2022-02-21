const puppeteer = require('puppeteer');
const fs = require('fs');

let exercises = [];

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let data = fs.readFileSync('C:\\Users\\Legion\\Documents\\gymApp\\dataset\\logbook\\exercises.txt', 'utf-8');
    const arr = data.toString().replace(/\r\n/g, '\n').split('\n');
    for (let index = 0; index < arr.length; index++) {
        let exercisesFile = JSON.parse(fs.readFileSync('C:\\Users\\Legion\\Documents\\gymApp\\dataset\\logbook\\exercises.json'));
        let exerciseAlreadyAdded = false;
        for (let exercise of exercisesFile['exercises']) {
            if (exercise.name == arr[index]) {
                exerciseAlreadyAdded = true;
            }
        }
        if (!exerciseAlreadyAdded) {
            await page.goto('https://exrx.net/Lists/SearchExercises');
            let cookiesAcceptButton = (await page.$('#ez-accept-all')) || null;
            if (cookiesAcceptButton) {
                await page.click('button[id="ez-accept-all"]');
            }
            await page.waitForSelector('input[id=gsc-i-id1]');
            await page.$eval('input[id="gsc-i-id1"]', (el, value) => el.value = value, arr[index]);
            await page.focus('input[id="gsc-i-id1"]');
            await page.keyboard.press('Enter');
            console.log(arr[index]);
            await page.waitForSelector('a[class="gs-title"]');
            const link = await page.$eval('a[class="gs-title"]', el => el.getAttribute('href'));
            await page.goto(link);
            await page.waitForSelector('div[class="col-sm-6"]');
            const htmlContent = await page.$eval('div[class="col-sm-6"]', el => el.innerHTML);
            const jsdom = require("jsdom");
            const dom = new jsdom.JSDOM(htmlContent);
            const paragraphs = dom.window.document.querySelectorAll("p");
            let textDescription = "";
            for (let index = 0; index < paragraphs.length; index++) {
                if (index == 1 || index == 3) textDescription += (index == 3) ? " " + paragraphs[index].textContent : paragraphs[index].textContent;
            }
            exercisesFile['exercises'].push({ name: arr[index], textDescription: textDescription });
            fs.writeFileSync('C:\\Users\\Legion\\Documents\\gymApp\\dataset\\logbook\\exercises.json', JSON.stringify(exercisesFile))
        }
    }
    await browser.close();
})();