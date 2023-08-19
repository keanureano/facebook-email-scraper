const puppeteer = require("puppeteer");
const fs = require("fs");
const csv = require("csv-parser");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  const names = await readNamesFromCsv("input.csv");
  const results = await searchNamesForEmails(page, names);

  console.log(results);

  await browser.close();
})();

async function readNamesFromCsv(csvFilePath) {
  const names = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row) => {
        if (row["Full Name"]) {
          names.push(row["Full Name"]);
        }
      })
      .on("end", () => {
        resolve(names);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

async function searchNamesForEmails(page, names) {
  const results = [];

  for (const name of names) {
    const searchQuery = `site:facebook.com "${name}" "@gmail.com"`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      searchQuery
    )}`;

    await page.goto(searchUrl);
    await page.waitForSelector("#search");

    const searchResults = await page.evaluate(() => {
      const searchContainer = document.querySelector("#search");
      const resultLinks = Array.from(searchContainer.querySelectorAll("span"));
      return resultLinks.map((link) => link.textContent);
    });

    const foundEmail = findEmailInResults(searchResults);
    const result = { name, email: foundEmail };
    console.log(result);

    results.push(result);
  }

  return results;
}

function findEmailInResults(searchResults) {
  for (const result of searchResults) {
    const emailMatches = result.match(/@gmail\.com/g);
    if (emailMatches) {
      const extractedEmail = result.match(/[a-zA-Z0-9._%+-]+@gmail\.com/g);
      return extractedEmail ? extractedEmail[0] : null;
    }
  }
  return null;
}
