const tickers = ["JPM", "WFC", "BAC", "MS", "C", "GS"];
const apiKey = "CI3AV3ONKZ7KAD1R";
// const apiKey = "DEMO";
const operations = ["BALANCE_SHEET", "TIME_SERIES_DAILY", "OVERVIEW"];

//the ones to all are getBankInformation, getDayClose, calcTBV

// let infoOutput = await runCalculations("JPM");
async function runCalculations(ticker) {
  const bankInfo = await getBankInformation(ticker);
  console.log("bankinfo:", bankInfo);
  const dayClose = await getDayClose(ticker);
  console.log("dayClose:", dayClose);
  const tangibleBV = await calcTBV(ticker);
  console.log("tangibleBV", tangibleBV);
  let infoObject = {};
  infoObject["bank information"] = bankInfo;
  infoObject["dayClose"] = dayClose;
  infoObject["TBV"] = tangibleBV;
  return infoObject;
}

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
    console.log(tbvList);
    let dateTextSeries = [];
    tbvList.forEach((record) => {
      dateTextSeries.push(record["fiscal date ending"]);
    });
    let dateSeries = dateTextToDate(dateTextSeries);
    const latestDate = getLatestDate(dateSeries);
    const latestDateString = getStringFromDate(latestDate);
    const latestTBV = getTBVfromArray(tbvList, latestDateString);
    const output = {
      "latest quarter reported": latestDateString,
      TBV: latestTBV,
    };
    return output;
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
    let dates = dateTextToDate(dateText);
    console.log("dates:", dates);
    const latestDate = getLatestDate(dates);
    latestDateString = getStringFromDate(latestDate);
    let info = {};
    info.latestDate = latestDateString;
    info.latestClose = timeSeries[latestDateString]["4. close"];
    console.log(info);
    return info;
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

function dateTextToDate(array) {
  let dateArray = array.map((dateText) => {
    return new Date(dateText);
  });
  return dateArray;
}

function getTBVfromArray(array, searchString) {
  let tbv = "";
  array.forEach((record) => {
    if (record["fiscal date ending"] === searchString) {
      tbv = record["tbv"];
    }
  });
  return tbv;
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
