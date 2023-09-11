const tickers = ["JPM", "WFC", "BAC", "MS", "C", "GS"];
const apiKey = "CI3AV3ONKZ7KAD1R";
// const apiKey = "DEMO";
const operations = ["BALANCE_SHEET", "TIME_SERIES_DAILY", "OVERVIEW"];

//main api call - called in subsequent async functions with different params
async function getData(operation, symbol, apiKey) {
  try {
    const result = await axios.get(
      `https://www.alphavantage.co/query?function=${operation}&symbol=${symbol}&apikey=${apiKey}`
    );
    let data = result.data;
    return data;
  } catch {
    (error) => {
      console.log(error);
    };
  }
}
//used to get Basic Bank Information - Name and Description. Returns an object
async function getBankInformation(symbol) {
  try {
    const data = await getData(operations[2], symbol, apiKey);
    const name = data.Name;
    console.log(name);
    const description = data.Description;
    const nameAndDescription = {
      name: name,
      description: description,
    };
    console.log("name and description here: ", nameAndDescription);
    return nameAndDescription;
  } catch {
    (error) => {
      console.log(error);
    };
  }
}
//used to pull total balance sheet information, gets all annual and quarterly reports
async function getBalanceSheet(symbol) {
  const data = await getData(operations[0], symbol, apiKey);
  return data;
}

async function getQuarterlyReport(symbol) {
  try {
    const balSheet = await getBalanceSheet(symbol);
    return balSheet.quarterlyReports;
  } catch {
    (error) => {
      console.log(error);
    };
  }
}

async function calcTBV(ticker) {
  try {
    let data = await getQuarterlyReport(ticker);
    console.log(data);
    let qtrRepList = [];
    let tbvList = [];
    data.forEach((report) => {
      qtrRepList.push(report);
    });
    console.log("qtrRep: ", qtrRepList);
    qtrRepList.forEach((report) => {
      tbvList.push(getTBV(report));
      console.log("pushed");
    });
    return tbvList;
  } catch {
    (error) => {
      console.log(error);
    };
  }
}

function getTBV(report) {
  let tbv = {};
  const fiscalDateEnding = report.fiscalDateEnding;
  const totalAssets = report.totalAssets;
  const goodWill = report.goodwill;
  const intangibles = report.intangibleAssets;
  const liabilities = report.totalLiabilities;
  const shares = report.commonStockSharesOutstanding;
  const tbvps = (
    (totalAssets - goodWill - intangibles - liabilities) /
    shares
  ).toFixed(2);
  tbv["fiscal date ending"] = fiscalDateEnding;
  tbv["tbv"] = tbvps;
  return tbv;
}

async function getDayClose(symbol) {
  try {
    const result = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`
    );
    console.log("result", result.data);
    const timeSeries = result.data["Time Series (Daily)"];
    console.log("timeseries", timeSeries);
    const dateText = Object.keys(timeSeries);
    console.log("dateText", dateText);
    let dates = dateText.map((date) => {
      return new Date(date);
    });
    const latestDate = getLatestDate(dates);
    latestDateString = getStringFromDate(latestDate);
    console.log(latestDateString);
    console.log(timeSeries[latestDateString]["4. close"]);
  } catch {
    (error) => {
      console.log(error);
    };
  }
}

function getLatestDate(dateArray) {
  let latestDate = dateArray[0];
  for (let i = 0; i < dateArray.length; i++) {
    if (dateArray[i] > latestDate) {
      latestDate = dateArray[i];
    }
  }
  return latestDate;
}

function getStringFromDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

//   let information = {
//     "Fiscal Date Ending": fiscalDateEnding,
//     "Tangible Book Value Per Share": tbvps,
//     "Total Assets": totalAssets,
//     GoodWill: goodWill,
//     Intangibles: intangibles,
//     Liabilities: liabilities,
//   };
//   console.log(information);
// }

// so i want an which will be passed two objects, name and description, and then

///deal later///
