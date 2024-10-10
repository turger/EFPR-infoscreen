// MetarServerComponent.js
import React, { useState, useEffect } from "react";

export default function MetarServerComponent() {
    const [metarReport, setMetarReport] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wind direction variation over 10 minutes
  const fetchWindDirectionData = async () => {
    const now = new Date();
    const thirteenMinutesAgo = new Date(now.getTime() - 13 * 60 * 1000);
    const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);

    const formatDateUTC = (date) =>
      date.toISOString().replace(/\.\d{3}Z$/, "Z");

    const startTimeForWindDirection = formatDateUTC(thirteenMinutesAgo);
    const endTimeForWindDirection = formatDateUTC(threeMinutesAgo);

    const weatherStation = "107029";
    //pyhtää 107029

    const windApiUrl = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=GetFeature&storedquery_id=fmi::observations::weather::simple&fmisid=${weatherStation}&starttime=${startTimeForWindDirection}&endtime=${endTimeForWindDirection}&parameters=winddirection&format=application/json`;

    console.log(windApiUrl);
    try {
      const response = await fetch(windApiUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");

      let winddirection = [];

      const members = xmlDoc.getElementsByTagName("wfs:member");
      for (let i = 0; i < members.length; i++) {
        const paramName = members[i].getElementsByTagName(
          "BsWfs:ParameterName"
        )[0]?.textContent;
        const paramValue = parseFloat(
          members[i].getElementsByTagName("BsWfs:ParameterValue")[0]
            ?.textContent
        );

        if (paramName === "winddirection") {
          winddirection.push(paramValue);
        }
      }

      const minDir =
        winddirection.length > 0
          ? Math.round(Math.min(...winddirection) / 10) * 10
          : "000";
      const maxDir =
        winddirection.length > 0
          ? Math.round(Math.max(...winddirection) / 10) * 10
          : "000";

      return { minDir, maxDir };
    } catch (error) {
      throw new Error("Failed to fetch wind direction data");
    }
  };

  // Fetch all other data 3 minutes ago
  const fetchWeatherData = async () => {
    const now = new Date();
    const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);

    const formatDateUTC = (date) =>
      date.toISOString().replace(/\.\d{3}Z$/, "Z");

    // Set the seconds to 0 for the start time
    threeMinutesAgo.setSeconds(0, 0); // Sets seconds and milliseconds to 0

    const startTime = formatDateUTC(threeMinutesAgo);

    // Create the end time, which is exactly one second after the start time
    const endTimeDate = new Date(threeMinutesAgo.getTime() + 1000); // Add 1 second (1000 milliseconds)
    const endTimeForThreeMinutesAgo = formatDateUTC(endTimeDate);

    const weatherStation = "107029";
    //pyhtää 107029

    const weatherApiUrl = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=GetFeature&storedquery_id=fmi::observations::weather::simple&fmisid=${weatherStation}&starttime=${startTime}&endtime=${endTimeForThreeMinutesAgo}&parameters=humidity,wawa,temperature,visibility,winddirection,windspeedms,windgust,dewpoint,totalcloudcover,pressure&format=application/json`;
    console.log(weatherApiUrl);
    try {
      const response = await fetch(weatherApiUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");

      let windspeed = null;
      let windgust = null;
      let pressure = null;
      let visibility = null;
      let temperature = null;
      let dewpoint = null;
      let totalcloudcover = null;
      let wawa = null;
      let humidity = null;
      let winddirection = null;

      const members = xmlDoc.getElementsByTagName("wfs:member");
      for (let i = 0; i < members.length; i++) {
        const paramName = members[i].getElementsByTagName(
          "BsWfs:ParameterName"
        )[0]?.textContent;
        const paramValue = parseFloat(
          members[i].getElementsByTagName("BsWfs:ParameterValue")[0]
            ?.textContent
        );

        switch (paramName) {
          case "windspeedms":
            windspeed = paramValue;
            break;
          case "windgust":
            windgust = paramValue;
            break;
          case "pressure":
            pressure = paramValue;
            break;
          case "visibility":
            visibility = paramValue;
            break;
          case "temperature":
            temperature = paramValue;
            break;
          case "dewpoint":
            dewpoint = paramValue;
            break;
          case "totalcloudcover":
            totalcloudcover = paramValue;
            break;
          case "wawa":
            wawa = paramValue;
            break;
          case "humidity":
            humidity = paramValue;
            break;
          case "winddirection":
            winddirection = paramValue;
            break;
          default:
            break;
        }
      }

      return {
        windspeed,
        windgust,
        pressure,
        visibility,
        temperature,
        dewpoint,
        totalcloudcover,
        wawa,
        humidity,
        winddirection,
      };
    } catch (error) {
      throw new Error("Failed to fetch weather data");
    }
  };

  const fetchMetarData = async () => {
    try {
      const windData = await fetchWindDirectionData();
      const weatherData = await fetchWeatherData();

      const { minDir, maxDir } = windData;
      const {
        windspeed,
        windgust,
        pressure,
        visibility,
        temperature,
        dewpoint,
        totalcloudcover,
        wawa,
        humidity,
        winddirection,
      } = weatherData;

      console.log(minDir, maxDir);

      const windSpeed =
        windspeed !== null && !isNaN(windspeed)
          ? String(Math.round(windspeed * 1.94384)).padStart(2, "0")
          : "////";
      const gustSpeed =
        windgust !== null && !isNaN(windgust)
          ? String(Math.round(windgust * 1.94384)).padStart(2, "0")
          : "////";

      // Show the visibility according to metar rules
      const visibilityKm =
        visibility !== null && !isNaN(visibility)
          ? visibility > 10000
            ? "9999"
            : visibility >= 5000
            ? String(Math.round(visibility / 1000) * 1000).padStart(4, "0")
            : visibility >= 800
            ? String(Math.round(visibility / 100) * 100).padStart(4, "0")
            : String(Math.round(visibility / 50) * 50).padStart(4, "0")
          : "////";

      const pressureValue =
        pressure !== null && !isNaN(pressure)
          ? String(Math.round(pressure)).padStart(4, "0")
          : "////";

      let cloudCover = "CLR";
      if (totalcloudcover !== null && !isNaN(totalcloudcover)) {
        let cloudBaseFeet = Math.round(((temperature - dewpoint) / 2.5) * 1000); //Pilvipohjan korkeus arvio
        cloudBaseFeet = Math.max(0, Math.min(cloudBaseFeet, 9999)); // Varmistus jolla vältetään virheelliset tiedot
        let cloudBase = String(Math.floor(cloudBaseFeet / 100)).padStart(
          3,
          "0"
        ); //Converting Cloud Base to Hundreds of Feet

        if (totalcloudcover <= 2) {
          cloudCover = `FEW${cloudBase}`;
        } else if (totalcloudcover <= 4) {
          cloudCover = `SCT${cloudBase}`;
        } else if (totalcloudcover <= 7) {
          cloudCover = `BKN${cloudBase}`;
        } else {
          cloudCover = `OVC${cloudBase}`;
        }
      } else {
        cloudCover = "///";
      }

      let wawaMetar = "";
      if (wawa === 0.0) {
        wawaMetar = "";
      } else if (wawa === 4.0 || wawa === 5.0) {
        wawaMetar = "HZ/FU/DU"; //pitää muokata?
      } else if (wawa === 30.0 && visibility < 1000) {
        wawaMetar = "FG";
      } else if (wawa === 30.0 && humidity > 80.0) {
        wawaMetar = "HZ";
      } else if (wawa === 30.0) {
        wawaMetar = "BR";
      } else if (wawa === 40.0) {
        wawaMetar = "RA";
      } else if (wawa === 41.0) {
        wawaMetar = "-RA";
      } else if (wawa === 42.0) {
        wawaMetar = "+RA";
      } else if (wawa === 50.0 || wawa === 51.0) {
        wawaMetar = "-DZ";
      } else if (wawa === 52.0) {
        wawaMetar = "DZ";
      } else if (wawa === 53.0) {
        wawaMetar = "+DZ";
      } else if (wawa === 54.0) {
        wawaMetar = "-FZDZ";
      } else if (wawa === 55.0) {
        wawaMetar = "FZDZ";
      } else if (wawa === 56.0) {
        wawaMetar = "+FZDZ";
      } else if (wawa === 60.0 || wawa === 61.0) {
        wawaMetar = "-RA";
      } else if (wawa === 62.0) {
        wawaMetar = "RA";
      } else if (wawa === 63.0) {
        wawaMetar = "+RA";
      } else if (wawa === 64.0) {
        wawaMetar = "-FZRA";
      } else if (wawa === 65.0) {
        wawaMetar = "FZRA";
      } else if (wawa === 66.0) {
        wawaMetar = "+FZRA";
      } else if (wawa === 67.0) {
        wawaMetar = "-RASN";
      } else if (wawa === 68.0) {
        wawaMetar = "RASN";
      } else if (wawa === 70.0 || wawa === 72.0) {
        wawaMetar = "SN";
      } else if (wawa === 71.0) {
        wawaMetar = "-SN";
      } else if (wawa === 73.0) {
        wawaMetar = "+SN";
      } else if (wawa === 74.0) {
        wawaMetar = "-PE";
      } else if (wawa === 75.0) {
        wawaMetar = "PE";
      } else if (wawa === 76.0) {
        wawaMetar = "+PE";
      } else if (wawa === 77.0) {
        wawaMetar = "SG";
      } else if (wawa === 78.0) {
        wawaMetar = "IC";
      } else if (wawa === 80.0) {
        wawaMetar = "-PRRA";
        // } else if ((wawa === 81.0 || wawa === 82.0) && visibility >= 8000) {
        // wawaMetar = "VCSH"; // Vicinity showers
      } else if (wawa === 81.0) {
        wawaMetar = "-SHRA";
      } else if (wawa === 82.0) {
        wawaMetar = "SHRA";
      } else if (wawa === 83.0 || wawa === 84.0) {
        wawaMetar = "+SHRA";
      } else if (wawa === 85.0) {
        wawaMetar = "-SHSN";
      } else if (wawa === 86.0) {
        wawaMetar = "SHSN";
      } else if (wawa === 87.0) {
        wawaMetar = "+SHSN";
      } else if (wawa === 89.0) {
        wawaMetar = "GR";
      } else if (isNaN(wawa)) {
        wawaMetar = "//";
      }

      let weatherCondition = "";
      if (
        visibility >= 10000 &&
        (totalcloudcover === null || totalcloudcover < 2) &&
        wawa == 0.0
      ) {
        weatherCondition = "CAVOK";
      } else {
        weatherCondition = `${visibilityKm} ${wawaMetar} ${cloudCover}`;
      }

      const gustInfo = gustSpeed !== "" ? `G${gustSpeed}` : "";
      const temp =
        temperature !== null
          ? (temperature < 0 ? "M" : "") +
            String(Math.abs(Math.round(temperature))).padStart(2, "0")
          : "///";

      const dew =
        dewpoint !== null
          ? (dewpoint < 0 ? "M" : "") +
            String(Math.abs(Math.round(dewpoint))).padStart(2, "0")
          : "/";

      const windDir =
        winddirection !== null
          ? String(Math.round(winddirection / 10) * 10).padStart(3, "0")
          : "/";

      const now = new Date();
      const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000); // 3 minutes ago
      const utcDay = String(threeMinutesAgo.getUTCDate()).padStart(2, "0");

      // Format time as HHMM without colons
      const utcTime = threeMinutesAgo
        .toISOString()
        .slice(11, 16)
        .replace(":", "");

      const windDirVariation = minDir !== maxDir ? ` ${minDir}V${maxDir}` : "";

      const metarReport = `EFPR ${utcDay}${utcTime}Z AUTO ${windDir}${windSpeed}${gustInfo}KT${windDirVariation} ${weatherCondition} ${temp}/${dew} Q${pressureValue}=`;

      setMetarReport(metarReport);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetarData();

    const intervalId = setInterval(() => {
      fetchMetarData();
    }, 60000); // Refresh every 1 minutes

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <p>{metarReport}</p>
    </div>
  );
}
