# Facebook Email Scraper

This tutorial guides you through the process of using the `facebookScraper.js` script to extract member data from a Facebook group, and the `emailScraper` script to search for emails associated with names. Follow the steps below to get started:

## Prerequisites

- **Google Chrome Browser**: Ensure you have Google Chrome installed, as the scripts utilize the browser console.
- **Node.js**: Make sure you have Node.js installed on your computer.

## Step 1: Scraping Facebook Group Members

1. Open your Google Chrome browser.

2. Access the Facebook group page from which you want to scrape member data.

3. Open the Chrome Developer Console by right-clicking on the page, selecting "Inspect," and then navigating to the "Console" tab.

4. Copy the contents of the `facebookScraper.js` script and paste it into the Chrome Developer Console.

5. Scroll down the Facebook group page to ensure you load all the members you want to scrape.

6. Look for the "Download" button that appears on the page.

7. Click the "Download" button. The browser will prompt you to save a CSV file containing member data. Save this file with the name `input.csv`.

## Step 2: Searching for Emails

1. Move the saved `input.csv` file to the same folder where the `emailScraper.js` script is located.

2. Open your terminal and navigate to the directory containing the `emailScraper.js` script.

3. Install the required dependencies by running the following command:

```bash
npm install
```

4. After the installation is complete, run the following command to start the email scraping process:

```bash
npm start
```

5. The script will search for emails associated with the names listed in the `input.csv` file.

6. Once the process is complete, the script will output the results as a CSV file named `output.csv`.

## Disclaimer

- Always respect the terms of service and privacy policies of the platforms you are scraping. Web scraping might violate these terms and lead to legal consequences.
- Be considerate of ethical and legal considerations when scraping data from websites.
- Remember that using scripts to automate actions on websites may change the way you interact with the platform and can potentially violate their usage policies.

Happy scraping and coding!
