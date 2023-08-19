const puppeteer = require("puppeteer");
const fs = require("fs");
const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const names = await readNamesFromCsv("input.csv");
  const results = await searchNamesForEmailsAndPhones(page, names);

  try {
    results = await searchNamesForEmailsAndPhones(page, names);
  } catch (error) {
    console.error("An error occurred during the search:", error);
  } finally {
    saveResultsToCsv(results, "output.csv");
    await browser.close();
  }
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

async function searchNamesForEmailsAndPhones(page, names) {
  const results = [];

  for (const name of names) {
    const searchQuery = `site:facebook.com "${name}" "@gmail.com" OR "phone"`;
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

    const foundPhone = findPhoneInResults(searchResults);
    const foundEmail = findEmailInResults(searchResults);

    const [firstName, ...lastName] = name.split(" ");
    const result = {
      firstName,
      lastName,
      email: foundEmail,
      phone: foundPhone,
    };

    console.log(result);

    results.push(result);
  }

  return results;
}

function findPhoneInResults(searchResults) {
  const phoneRegex = /(?:\+\d{1,3}[-\s]?)?\d{3,4}[-\s]?\d{3,4}[-\s]?\d{3,4}/g;
  for (const result of searchResults) {
    const phoneMatches = result.match(phoneRegex);
    if (phoneMatches) {
      return phoneMatches[0];
    }
  }
  return null;
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

function saveResultsToCsv(results, csvFilePath) {
  const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: [
      { id: "firstName", title: "First Name" },
      { id: "lastName", title: "Last Name" },
      { id: "email", title: "Email" },
      { id: "phone", title: "Phone" },
    ],
  });

  csvWriter
    .writeRecords(results)
    .then(() => {
      console.log("Results saved to CSV file");
    })
    .catch((error) => {
      console.error("Error saving results to CSV:", error);
    });
}
