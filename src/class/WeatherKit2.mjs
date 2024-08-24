import * as flatbuffers from 'flatbuffers';
import * as WK2 from "../flatbuffers/wk2.js";

export default class weatherKit2 {
    constructor(options = {}) {
		this.Name = "weatherKit2";
		this.Version = "1.0.0";
		console.log(`\n🟧 ${this.Name} v${this.Version}\n`);
		Object.assign(this, options);
    };
    
    encode(dataSets = "", data = {}) {
        const builder = new flatbuffers.Builder(this.initialSize);
		WK2.Weather.startWeather(builder);
		switch (dataSets) {
			case "airQuality":
				break;
			case "currentWeather":
				break;
			case "forecastDaily":
				break;
			case "forecastHourly":
				break;
			case "forecastNextHour":
				break;
			case "news":
				break;
			case "weatherAlert":
			case "weatherAlerts":
				break;
			case "weatherChange":
			case "weatherChanges":
				break;
			case "trendComparison":
			case "trendComparisons":
			case "historicalComparison":
			case "historicalComparisons":
				break;
		};
        const WeatherData = WK2.Weather.endWeather(builder);
        builder.finish(WeatherData);
        return builder.asUint8Array();
    };

    decode(dataSets = "", byteBuffer = this.bb) {
        //const byteBuffer = new flatbuffers.ByteBuffer(uint8Array);
        const WeatherData = WK2.Weather.getRootAsWeather(byteBuffer);
		let data = {};
		let metadata;
        switch (dataSets) {
			case "airQuality":
				const airQualityData = WeatherData?.airQuality();
				metadata = airQualityData.metadata();
				data = {
					"categoryIndex": airQualityData?.categoryIndex(),
					"index": airQualityData?.index(),
					"isSignificant": airQualityData?.isSignificant(),
					"pollutants": [],
					"previousDayComparison": WK2.ComparisonTrend[airQualityData?.previousDayComparison()],
					"primaryPollutant": WK2.PollutantType[airQualityData?.primaryPollutant()],
					"scale": airQualityData?.scale(),
				};
				for (let i = 0; i < airQualityData?.pollutantsLength(); i++) data.pollutants.push({
					"amount": airQualityData?.pollutants(i)?.amount(),
					"pollutantType": WK2.PollutantType[airQualityData?.pollutants(i)?.pollutantType()],
					"units": WK2.UnitType[airQualityData?.pollutants(i)?.units()],
				});
				break;
			case "currentWeather":
				const CurrentWeatherData = WeatherData?.currentWeather();
				metadata = CurrentWeatherData?.metadata();
				data = {
					"asOf": CurrentWeatherData?.asOf(),
					"cloudCover": CurrentWeatherData?.cloudCover(),
					"cloudCoverHighAltPct": CurrentWeatherData?.cloudCoverHighAltPct(),
					"cloudCoverLowAltPct": CurrentWeatherData?.cloudCoverLowAltPct(),
					"cloudCoverMidAltPct": CurrentWeatherData?.cloudCoverMidAltPct(),
					"conditionCode": WK2.ConditionCode[CurrentWeatherData?.conditionCode()],
					"daylight": CurrentWeatherData?.daylight(),
					"humidity": CurrentWeatherData?.humidity(),
					"perceivedPrecipitationIntensity": CurrentWeatherData?.perceivedPrecipitationIntensity(),
					"precipitationAmount24h": CurrentWeatherData?.precipitationAmount24h(),
					"precipitationAmountNext1hByType": [],
					"precipitationAmountNext24h": CurrentWeatherData?.precipitationAmountNext24h(),
					"precipitationAmountNext24hByType": [],
					"precipitationAmountNext6h": CurrentWeatherData?.precipitationAmountNext6h(),
					"precipitationAmountNext6hByType": [],
					"precipitationAmountPrevious1hByType": [],
					"precipitationAmountPrevious24hByType": [],
					"precipitationAmountPrevious6hByType": [],
					"precipitationIntensity": CurrentWeatherData?.precipitationIntensity(),
					"pressure": CurrentWeatherData?.pressure(),
					"pressureTrend": WK2.PressureTrend[CurrentWeatherData?.pressureTrend()],
					"snowfallAmount1h": CurrentWeatherData?.snowfallAmount1h(),
					"snowfallAmount24h": CurrentWeatherData?.snowfallAmount24h(),
					"snowfallAmount6h": CurrentWeatherData?.snowfallAmount6h(),
					"snowfallAmountNext1h": CurrentWeatherData?.snowfallAmountNext1h(),
					"snowfallAmountNext24h": CurrentWeatherData?.snowfallAmountNext24h(),
					"snowfallAmountNext6h": CurrentWeatherData?.snowfallAmountNext6h(),
					"temperature": CurrentWeatherData?.temperature(),
					"temperatureApparent": CurrentWeatherData?.temperatureApparent(),
					"unknown34": CurrentWeatherData?.unknown34(),
					"temperatureDewPoint": CurrentWeatherData?.temperatureDewPoint(),
					"uvIndex": CurrentWeatherData?.uvIndex(),
					"visibility": CurrentWeatherData?.visibility(),
					"windDirection": CurrentWeatherData?.windDirection(),
					"windGust": CurrentWeatherData?.windGust(),
					"windSpeed": CurrentWeatherData?.windSpeed(),
				};
				for (let i = 0; i < CurrentWeatherData?.precipitationAmountNext1hByTypeLength(); i++) data.precipitationAmountNext1hByType.push({
					"expected": CurrentWeatherData?.precipitationAmountNext1hByType(i)?.expected(),
					"expectedSnow": CurrentWeatherData?.precipitationAmountNext1hByType(i)?.expectedSnow(),
					"maximumSnow": CurrentWeatherData?.precipitationAmountNext1hByType(i)?.maximumSnow(),
					"minimumSnow": CurrentWeatherData?.precipitationAmountNext1hByType(i)?.minimumSnow(),
					"precipitationType": WK2.PrecipitationType[CurrentWeatherData?.precipitationAmountNext1hByType(i)?.precipitationType()],
				});
				for (let i = 0; i < CurrentWeatherData?.precipitationAmountNext24hByTypeLength(); i++) data.precipitationAmountNext24hByType.push({
					"expected": CurrentWeatherData?.precipitationAmountNext24hByType(i)?.expected(),
					"expectedSnow": CurrentWeatherData?.precipitationAmountNext24hByType(i)?.expectedSnow(),
					"maximumSnow": CurrentWeatherData?.precipitationAmountNext24hByType(i)?.maximumSnow(),
					"minimumSnow": CurrentWeatherData?.precipitationAmountNext24hByType(i)?.minimumSnow(),
					"precipitationType": WK2.PrecipitationType[CurrentWeatherData?.precipitationAmountNext24hByType(i)?.precipitationType()],
				});
				for (let i = 0; i < CurrentWeatherData?.precipitationAmountNext6hByTypeLength(); i++) data.precipitationAmountNext6hByType.push({
					"expected": CurrentWeatherData?.precipitationAmountNext6hByType(i)?.expected(),
					"expectedSnow": CurrentWeatherData?.precipitationAmountNext6hByType(i)?.expectedSnow(),
					"maximumSnow": CurrentWeatherData?.precipitationAmountNext6hByType(i)?.maximumSnow(),
					"minimumSnow": CurrentWeatherData?.precipitationAmountNext6hByType(i)?.minimumSnow(),
					"precipitationType": WK2.PrecipitationType[CurrentWeatherData?.precipitationAmountNext6hByType(i)?.precipitationType()],
				});
				for (let i = 0; i < CurrentWeatherData?.precipitationAmountPrevious1hByTypeLength(); i++) data.precipitationAmountPrevious1hByType.push({
					"expected": CurrentWeatherData?.precipitationAmountPrevious1hByType(i)?.expected(),
					"expectedSnow": CurrentWeatherData?.precipitationAmountPrevious1hByType(i)?.expectedSnow(),
					"maximumSnow": CurrentWeatherData?.precipitationAmountPrevious1hByType(i)?.maximumSnow(),
					"minimumSnow": CurrentWeatherData?.precipitationAmountPrevious1hByType(i)?.minimumSnow(),
					"precipitationType": WK2.PrecipitationType[CurrentWeatherData?.precipitationAmountPrevious1hByType(i)?.precipitationType()],
				});
				for (let i = 0; i < CurrentWeatherData?.precipitationAmountPrevious24hByTypeLength(); i++) data.precipitationAmountPrevious24hByType.push({
					"expected": CurrentWeatherData?.precipitationAmountPrevious24hByType(i)?.expected(),
					"expectedSnow": CurrentWeatherData?.precipitationAmountPrevious24hByType(i)?.expectedSnow(),
					"maximumSnow": CurrentWeatherData?.precipitationAmountPrevious24hByType(i)?.maximumSnow(),
					"minimumSnow": CurrentWeatherData?.precipitationAmountPrevious24hByType(i)?.minimumSnow(),
					"precipitationType": WK2.PrecipitationType[CurrentWeatherData?.precipitationAmountPrevious24hByType(i)?.precipitationType()],
				});
				for (let i = 0; i < CurrentWeatherData?.precipitationAmountPrevious6hByTypeLength(); i++) data.precipitationAmountPrevious6hByType.push({
					"expected": CurrentWeatherData?.precipitationAmountPrevious6hByType(i)?.expected(),
					"expectedSnow": CurrentWeatherData?.precipitationAmountPrevious6hByType(i)?.expectedSnow(),
					"maximumSnow": CurrentWeatherData?.precipitationAmountPrevious6hByType(i)?.maximumSnow(),
					"minimumSnow": CurrentWeatherData?.precipitationAmountPrevious6hByType(i)?.minimumSnow(),
					"precipitationType": WK2.PrecipitationType[CurrentWeatherData?.precipitationAmountPrevious6hByType(i)?.precipitationType()],
				});
				break;
			case "forecastDaily":
				const DailyForecastData = WeatherData?.forecastDaily();
				metadata = DailyForecastData?.metadata();
				data = {
					"days": [],
				};
				for (let i = 0; i < DailyForecastData?.daysLength(); i++) {
					let day = {
						"conditionCode": WK2.ConditionCode[DailyForecastData?.days(i)?.conditionCode()],
						"forecastEnd": DailyForecastData?.days(i)?.forecastEnd(),
						"forecastStart": DailyForecastData?.days(i)?.forecastStart(),
						"humidityMax": DailyForecastData?.days(i)?.humidityMax(),
						"humidityMin": DailyForecastData?.days(i)?.humidityMin(),
						"maxUvIndex": DailyForecastData?.days(i)?.maxUvIndex(),
						"moonPhase": WK2.MoonPhase[DailyForecastData?.days(i)?.moonPhase()],
						"moonrise": DailyForecastData?.days(i)?.moonrise(),
						"moonset": DailyForecastData?.days(i)?.moonset(),
						"precipitationAmount": DailyForecastData?.days(i)?.precipitationAmount(),
						"precipitationAmountByType": [],
						"precipitationChance": DailyForecastData?.days(i)?.precipitationChance(),
						"precipitationType": WK2.PrecipitationType[DailyForecastData?.days(i)?.precipitationType()],
						"snowfallAmount": DailyForecastData?.days(i)?.snowfallAmount(),
						"solarMidnight": DailyForecastData?.days(i)?.solarMidnight(),
						"solarNoon": DailyForecastData?.days(i)?.solarNoon(),
						"sunrise": DailyForecastData?.days(i)?.sunrise(),
						"sunriseCivil": DailyForecastData?.days(i)?.sunriseCivil(),
						"sunriseNautical": DailyForecastData?.days(i)?.sunriseNautical(),
						"sunriseAstronomical": DailyForecastData?.days(i)?.sunriseAstronomical(),
						"sunset": DailyForecastData?.days(i)?.sunset(),
						"sunsetCivil": DailyForecastData?.days(i)?.sunsetCivil(),
						"sunsetNautical": DailyForecastData?.days(i)?.sunsetNautical(),
						"sunsetAstronomical": DailyForecastData?.days(i)?.sunsetAstronomical(),
						"temperatureMax": DailyForecastData?.days(i)?.temperatureMax(),
						"temperatureMaxTime": DailyForecastData?.days(i)?.temperatureMaxTime(),
						"temperatureMin": DailyForecastData?.days(i)?.temperatureMin(),
						"temperatureMinTime": DailyForecastData?.days(i)?.temperatureMinTime(),
						"visibilityMax": DailyForecastData?.days(i)?.visibilityMax(),
						"visibilityMin": DailyForecastData?.days(i)?.visibilityMin(),
						"windGustSpeedMax": DailyForecastData?.days(i)?.windGustSpeedMax(),
						"windSpeedAvg": DailyForecastData?.days(i)?.windSpeedAvg(),
						"windSpeedMax": DailyForecastData?.days(i)?.windSpeedMax(),
					};
					for (let j = 0; j < DailyForecastData?.days(i)?.precipitationAmountByTypeLength(); j++) day.precipitationAmountByType.push({
						"expected": DailyForecastData?.days(i)?.precipitationAmountByType(j)?.expected(),
						"expectedSnow": DailyForecastData?.days(i)?.precipitationAmountByType(j)?.expectedSnow(),
						"maximumSnow": DailyForecastData?.days(i)?.precipitationAmountByType(j)?.maximumSnow(),
						"minimumSnow": DailyForecastData?.days(i)?.precipitationAmountByType(j)?.minimumSnow(),
						"precipitationType": WK2.PrecipitationType[DailyForecastData?.days(i)?.precipitationAmountByType(j)?.precipitationType()],
					});
					if (DailyForecastData?.days(i)?.daytimeForecast()) {
						day.daytimeForecast = {
							"cloudCover": DailyForecastData?.days(i)?.daytimeForecast()?.cloudCover(),
							"cloudCoverHighAltPct": DailyForecastData?.days(i)?.daytimeForecast()?.cloudCoverHighAltPct(),
							"cloudCoverLowAltPct": DailyForecastData?.days(i)?.daytimeForecast()?.cloudCoverLowAltPct(),
							"cloudCoverMidAltPct": DailyForecastData?.days(i)?.daytimeForecast()?.cloudCoverMidAltPct(),
							"conditionCode": WK2.ConditionCode[DailyForecastData?.days(i)?.daytimeForecast()?.conditionCode()],
							"forecastEnd": DailyForecastData?.days(i)?.daytimeForecast()?.forecastEnd(),
							"forecastStart": DailyForecastData?.days(i)?.daytimeForecast()?.forecastStart(),
							"humidity": DailyForecastData?.days(i)?.daytimeForecast()?.humidity(),
							"humidityMax": DailyForecastData?.days(i)?.daytimeForecast()?.humidityMax(),
							"humidityMin": DailyForecastData?.days(i)?.daytimeForecast()?.humidityMin(),
							"precipitationAmount": DailyForecastData?.days(i)?.daytimeForecast()?.precipitationAmount(),
							"precipitationAmountByType": [],
							"precipitationChance": DailyForecastData?.days(i)?.daytimeForecast()?.precipitationChance(),
							"precipitationType": WK2.PrecipitationType[DailyForecastData?.days(i)?.daytimeForecast()?.precipitationType()],
							"snowfallAmount": DailyForecastData?.days(i)?.daytimeForecast()?.snowfallAmount(),
							"temperatureMax": DailyForecastData?.days(i)?.daytimeForecast()?.temperatureMax(),
							"temperatureMin": DailyForecastData?.days(i)?.daytimeForecast()?.temperatureMin(),
							"visibilityMax": DailyForecastData?.days(i)?.daytimeForecast()?.visibilityMax(),
							"visibilityMin": DailyForecastData?.days(i)?.daytimeForecast()?.visibilityMin(),
							"windDirection": DailyForecastData?.days(i)?.daytimeForecast()?.windDirection(),
							"windGustSpeedMax": DailyForecastData?.days(i)?.daytimeForecast()?.windGustSpeedMax(),
							"windSpeed": DailyForecastData?.days(i)?.daytimeForecast()?.windSpeed(),
							"windSpeedMax": DailyForecastData?.days(i)?.daytimeForecast()?.windSpeedMax(),
						};
						for (let j = 0; j < DailyForecastData?.days(i)?.daytimeForecast()?.precipitationAmountByTypeLength(); j++) day.daytimeForecast.precipitationAmountByType.push({
							"expected": DailyForecastData?.days(i)?.daytimeForecast()?.precipitationAmountByType(j)?.expected(),
							"expectedSnow": DailyForecastData?.days(i)?.daytimeForecast()?.precipitationAmountByType(j)?.expectedSnow(),
							"maximumSnow": DailyForecastData?.days(i)?.daytimeForecast()?.precipitationAmountByType(j)?.maximumSnow(),
							"minimumSnow": DailyForecastData?.days(i)?.daytimeForecast()?.precipitationAmountByType(j)?.minimumSnow(),
							"precipitationType": WK2.PrecipitationType[DailyForecastData?.days(i)?.daytimeForecast()?.precipitationAmountByType(j)?.precipitationType()],
						});
					};
					if (DailyForecastData?.days(i)?.overnightForecast()) {
						day.overnightForecast = {
							"cloudCover": DailyForecastData?.days(i)?.overnightForecast()?.cloudCover(),
							"cloudCoverHighAltPct": DailyForecastData?.days(i)?.overnightForecast()?.cloudCoverHighAltPct(),
							"cloudCoverLowAltPct": DailyForecastData?.days(i)?.overnightForecast()?.cloudCoverLowAltPct(),
							"cloudCoverMidAltPct": DailyForecastData?.days(i)?.overnightForecast()?.cloudCoverMidAltPct(),
							"conditionCode": WK2.ConditionCode[DailyForecastData?.days(i)?.overnightForecast()?.conditionCode()],
							"forecastEnd": DailyForecastData?.days(i)?.overnightForecast()?.forecastEnd(),
							"forecastStart": DailyForecastData?.days(i)?.overnightForecast()?.forecastStart(),
							"humidity": DailyForecastData?.days(i)?.overnightForecast()?.humidity(),
							"humidityMax": DailyForecastData?.days(i)?.overnightForecast()?.humidityMax(),
							"humidityMin": DailyForecastData?.days(i)?.overnightForecast()?.humidityMin(),
							"precipitationAmount": DailyForecastData?.days(i)?.overnightForecast()?.precipitationAmount(),
							"precipitationAmountByType": [],
							"precipitationChance": DailyForecastData?.days(i)?.overnightForecast()?.precipitationChance(),
							"precipitationType": WK2.PrecipitationType[DailyForecastData?.days(i)?.overnightForecast()?.precipitationType()],
							"snowfallAmount": DailyForecastData?.days(i)?.overnightForecast()?.snowfallAmount(),
							"temperatureMax": DailyForecastData?.days(i)?.overnightForecast()?.temperatureMax(),
							"temperatureMin": DailyForecastData?.days(i)?.overnightForecast()?.temperatureMin(),
							"visibilityMax": DailyForecastData?.days(i)?.overnightForecast()?.visibilityMax(),
							"visibilityMin": DailyForecastData?.days(i)?.overnightForecast()?.visibilityMin(),
							"windDirection": DailyForecastData?.days(i)?.overnightForecast()?.windDirection(),
							"windGustSpeedMax": DailyForecastData?.days(i)?.overnightForecast()?.windGustSpeedMax(),
							"windSpeed": DailyForecastData?.days(i)?.overnightForecast()?.windSpeed(),
							"windSpeedMax": DailyForecastData?.days(i)?.overnightForecast()?.windSpeedMax(),
						};
						for (let j = 0; j < DailyForecastData?.days(i)?.overnightForecast()?.precipitationAmountByTypeLength(); j++) day.overnightForecast.precipitationAmountByType.push({
							"expected": DailyForecastData?.days(i)?.overnightForecast()?.precipitationAmountByType(j)?.expected(),
							"expectedSnow": DailyForecastData?.days(i)?.overnightForecast()?.precipitationAmountByType(j)?.expectedSnow(),
							"maximumSnow": DailyForecastData?.days(i)?.overnightForecast()?.precipitationAmountByType(j)?.maximumSnow(),
							"minimumSnow": DailyForecastData?.days(i)?.overnightForecast()?.precipitationAmountByType(j)?.minimumSnow(),
							"precipitationType": WK2.PrecipitationType[DailyForecastData?.days(i)?.overnightForecast()?.precipitationAmountByType(j)?.precipitationType()],
						});
					};
					if (DailyForecastData?.days(i)?.restOfDayForecast()) {
						day.restOfDayForecast = {
							"cloudCover": DailyForecastData?.days(i)?.restOfDayForecast()?.cloudCover(),
							"cloudCoverHighAltPct": DailyForecastData?.days(i)?.restOfDayForecast()?.cloudCoverHighAltPct(),
							"cloudCoverLowAltPct": DailyForecastData?.days(i)?.restOfDayForecast()?.cloudCoverLowAltPct(),
							"cloudCoverMidAltPct": DailyForecastData?.days(i)?.restOfDayForecast()?.cloudCoverMidAltPct(),
							"conditionCode": WK2.ConditionCode[DailyForecastData?.days(i)?.restOfDayForecast()?.conditionCode()],
							"forecastEnd": DailyForecastData?.days(i)?.restOfDayForecast()?.forecastEnd(),
							"forecastStart": DailyForecastData?.days(i)?.restOfDayForecast()?.forecastStart(),
							"humidity": DailyForecastData?.days(i)?.restOfDayForecast()?.humidity(),
							"humidityMax": DailyForecastData?.days(i)?.restOfDayForecast()?.humidityMax(),
							"humidityMin": DailyForecastData?.days(i)?.restOfDayForecast()?.humidityMin(),
							"precipitationAmount": DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationAmount(),
							"precipitationAmountByType": [],
							"precipitationChance": DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationChance(),
							"precipitationType": WK2.PrecipitationType[DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationType()],
							"snowfallAmount": DailyForecastData?.days(i)?.restOfDayForecast()?.snowfallAmount(),
							"temperatureMax": DailyForecastData?.days(i)?.restOfDayForecast()?.temperatureMax(),
							"temperatureMin": DailyForecastData?.days(i)?.restOfDayForecast()?.temperatureMin(),
							"visibilityMax": DailyForecastData?.days(i)?.restOfDayForecast()?.visibilityMax(),
							"visibilityMin": DailyForecastData?.days(i)?.restOfDayForecast()?.visibilityMin(),
							"windDirection": DailyForecastData?.days(i)?.restOfDayForecast()?.windDirection(),
							"windGustSpeedMax": DailyForecastData?.days(i)?.restOfDayForecast()?.windGustSpeedMax(),
							"windSpeed": DailyForecastData?.days(i)?.restOfDayForecast()?.windSpeed(),
							"windSpeedMax": DailyForecastData?.days(i)?.restOfDayForecast()?.windSpeedMax(),
						};
						for (let j = 0; j < DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationAmountByTypeLength(); j++) day.restOfDayForecast.precipitationAmountByType.push({
							"expected": DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationAmountByType(j)?.expected(),
							"expectedSnow": DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationAmountByType(j)?.expectedSnow(),
							"maximumSnow": DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationAmountByType(j)?.maximumSnow(),
							"minimumSnow": DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationAmountByType(j)?.minimumSnow(),
							"precipitationType": WK2.PrecipitationType[DailyForecastData?.days(i)?.restOfDayForecast()?.precipitationAmountByType(j)?.precipitationType()],
						});
					};
					data.days.push(day);
				};
				break;
			case "forecastHourly":
				const HourlyForecastData = WeatherData?.forecastHourly();
				metadata = HourlyForecastData?.metadata();
				data = {
					"hours": [],
				};
				for (let i = 0; i < HourlyForecastData?.hoursLength(); i++) data.hours.push({
					"cloudCover": HourlyForecastData?.hours(i)?.cloudCover(),
					"cloudCoverHighAltPct": HourlyForecastData?.hours(i)?.cloudCoverHighAltPct(),
					"cloudCoverLowAltPct": HourlyForecastData?.hours(i)?.cloudCoverLowAltPct(),
					"cloudCoverMidAltPct": HourlyForecastData?.hours(i)?.cloudCoverMidAltPct(),
					"conditionCode": WK2.ConditionCode[HourlyForecastData?.hours(i)?.conditionCode()],
					"daylight": HourlyForecastData?.hours(i)?.daylight(),
					"forecastStart": HourlyForecastData?.hours(i)?.forecastStart(),
					"humidity": HourlyForecastData?.hours(i)?.humidity(),
					"perceivedPrecipitationIntensity": HourlyForecastData?.hours(i)?.perceivedPrecipitationIntensity(),
					"precipitationAmount": HourlyForecastData?.hours(i)?.precipitationAmount(),
					"precipitationChance": HourlyForecastData?.hours(i)?.precipitationChance(),
					"precipitationIntensity": HourlyForecastData?.hours(i)?.precipitationIntensity(),
					"precipitationType": WK2.PrecipitationType[HourlyForecastData?.hours(i)?.precipitationType()],
					"pressure": HourlyForecastData?.hours(i)?.pressure(),
					"pressureTrend": WK2.PressureTrend[HourlyForecastData?.hours(i)?.pressureTrend()],
					"snowfallAmount": HourlyForecastData?.hours(i)?.snowfallAmount(),
					"snowfallIntensity": HourlyForecastData?.hours(i)?.snowfallIntensity(),
					"temperature": HourlyForecastData?.hours(i)?.temperature(),
					"temperatureApparent": HourlyForecastData?.hours(i)?.temperatureApparent(),
					"temperatureDewPoint": HourlyForecastData?.hours(i)?.temperatureDewPoint(),
					"uvIndex": HourlyForecastData?.hours(i)?.uvIndex(),
					"visibility": HourlyForecastData?.hours(i)?.visibility(),
					"windDirection": HourlyForecastData?.hours(i)?.windDirection(),
					"windGust": HourlyForecastData?.hours(i)?.windGust(),
					"windSpeed": HourlyForecastData?.hours(i)?.windSpeed(),
				});
				break;
			case "forecastNextHour":
				const NextHourForecastData = WeatherData?.forecastNextHour();
				metadata = NextHourForecastData?.metadata();
				data = {
					"condition": [],
					"forecastEnd": NextHourForecastData?.forecastEnd(),
					"forecastStart": NextHourForecastData?.forecastStart(),
					"minutes": [],
					"summary": []
				};
				for (let i = 0; i < NextHourForecastData?.conditionLength(); i++) {
					let condition = {
						"beginCondition": WK2.WeatherCondition[NextHourForecastData?.condition(i)?.beginCondition()],
						"endCondition": WK2.WeatherCondition[NextHourForecastData?.condition(i)?.endCondition()],
						"forecastToken": WK2.ForecastToken[NextHourForecastData?.condition(i)?.forecastToken()],
						"parameters": [],
						"startTime": NextHourForecastData?.condition(i)?.startTime(),
					}
					for (let j = 0; j < NextHourForecastData?.condition(i)?.parametersLength(); j++) condition.parameters.push({
						"date": NextHourForecastData?.condition(i)?.parameters(j)?.date(),
						"type": WK2.ParameterType[NextHourForecastData?.condition(i)?.parameters(j)?.type()],
					});
					data.condition.push(condition);
				};
				for (let i = 0; i < NextHourForecastData?.minutesLength(); i++) data.minutes.push({
					"perceivedPrecipitationIntensity": NextHourForecastData?.minutes(i)?.perceivedPrecipitationIntensity(),
					"precipitationChance": NextHourForecastData?.minutes(i)?.precipitationChance(),
					"precipitationIntensity": NextHourForecastData?.minutes(i)?.precipitationIntensity(),
					"startTime": NextHourForecastData?.minutes(i)?.startTime(),
				});
				for (let i = 0; i < NextHourForecastData?.summaryLength(); i++) data.summary.push({
					"condition": WK2.PrecipitationType[NextHourForecastData?.summary(i)?.condition()],
					"precipitationChance": NextHourForecastData?.summary(i)?.precipitationChance(),
					"precipitationIntensity": NextHourForecastData?.summary(i)?.precipitationIntensity(),
					"startTime": NextHourForecastData?.summary(i)?.startTime(),
				});
				break;
			case "news":
				const newsData = WeatherData?.news();
				metadata = newsData?.metadata();
				data = {
					"placements": [],
				};
				for (let i = 0; i < newsData?.placementsLength(); i++) {
					let placement = {
						"articles": [],
						"placement": WK2.PlacementType[newsData?.placements(i)?.placement()],
						"priority": newsData?.placements(i)?.priority(),
					};
					for (let j = 0; j < newsData?.placements(i)?.articlesLength(); j++) {
						let article = {
							"alertIds": [],
							"headlineOverride": newsData?.placements(i)?.articles(j)?.headlineOverride(),
							"id": newsData?.placements(i)?.articles(j)?.id(),
							"locale": newsData?.placements(i)?.articles(j)?.locale(),
							"phenomena": [],
							"supportedStorefronts": [],
						};
						for (let k = 0; k < newsData?.placements(i)?.articles(j)?.alertIdsLength(); k++) article.alertIds.push(newsData?.placements(i)?.articles(j)?.alertIds(k));
						for (let k = 0; k < newsData?.placements(i)?.articles(j)?.phenomenaLength(); k++) article.phenomena.push(newsData?.placements(i)?.articles(j)?.phenomena(k));
						for (let k = 0; k < newsData?.placements(i)?.articles(j)?.supportedStorefrontsLength(); k++) article.supportedStorefronts.push(newsData?.placements(i)?.articles(j)?.supportedStorefronts(k));
						placement.articles.push(article);
					};
					data.placements.push(placement);
				};
				break;
			case "weatherAlert":
			case "weatherAlerts":
				const WeatherAlertCollectionData = WeatherData?.weatherAlerts();
				metadata = WeatherAlertCollectionData?.metadata();
				data = {
					"alerts": [],
					"detailsUrl": WeatherAlertCollectionData?.detailsUrl(),
				};
				for (let i = 0; i < WeatherAlertCollectionData?.alertsLength(); i++) {
					let alert = {
						"areaId": WeatherAlertCollectionData?.alerts(i)?.areaId(),
						"attributionUrl": WeatherAlertCollectionData?.alerts(i)?.attributionUrl(),
						"certainty": WK2.Certainty[WeatherAlertCollectionData?.alerts(i)?.certainty()],
						"countryCode": WeatherAlertCollectionData?.alerts(i)?.countryCode(),
						"description": WeatherAlertCollectionData?.alerts(i)?.description(),
						"detailsUrl": WeatherAlertCollectionData?.alerts(i)?.detailsUrl(),
						"effectiveTime": WeatherAlertCollectionData?.alerts(i)?.effectiveTime(),
						"eventEndTime": WeatherAlertCollectionData?.alerts(i)?.eventEndTime(),
						"eventOnsetTime": WeatherAlertCollectionData?.alerts(i)?.eventOnsetTime(),
						"eventSource": WeatherAlertCollectionData?.alerts(i)?.eventSource(),
						"expireTime": WeatherAlertCollectionData?.alerts(i)?.expireTime(),
						"id": WeatherAlertCollectionData?.alerts(i)?.id(),
						"importance": WK2.ImportanceType[WeatherAlertCollectionData?.alerts(i)?.importance()],
						"issuedTime": WeatherAlertCollectionData?.alerts(i)?.issuedTime(),
						"phenomenon": WeatherAlertCollectionData?.alerts(i)?.phenomenon(),
						"responses": [],
						"severity": WK2.Severity[WeatherAlertCollectionData?.alerts(i)?.severity()],
						"significance": WK2.SignificanceType[WeatherAlertCollectionData?.alerts(i)?.significance()],
						"source": WeatherAlertCollectionData?.alerts(i)?.source(),
						"token": WeatherAlertCollectionData?.alerts(i)?.token(),
						"urgency": WK2.Urgency[WeatherAlertCollectionData?.alerts(i)?.urgency()],
					};
					for (let j = 0; j < WeatherAlertCollectionData?.alerts(i)?.responsesLength(); j++) alert.responses.push(WK2.ResponseType[WeatherAlertCollectionData?.alerts(i)?.responses(j)]);
					data.alerts.push(alert);
				};
				break;
			case "weatherChange":
			case "weatherChanges":
				const weatherChangesData = WeatherData?.weatherChanges();
				metadata = weatherChangesData?.metadata();
				data = {
					"changes": [],
					"forecastEnd": weatherChangesData?.forecastEnd(),
					"forecastStart": weatherChangesData?.forecastStart(),
				};
				for (let i = 0; i < weatherChangesData?.changesLength(); i++) {
					let change = {
						"dayPrecipitationChange": WK2.ChangeTrend[weatherChangesData?.changes(i)?.dayPrecipitationChange()],
						"forecastEnd": weatherChangesData?.changes(i)?.forecastEnd(),
						"forecastStart": weatherChangesData?.changes(i)?.forecastStart(),
						"maxTemperatureChange": WK2.ChangeTrend[weatherChangesData?.changes(i)?.maxTemperatureChange()],
						"minTemperatureChange": WK2.ChangeTrend[weatherChangesData?.changes(i)?.minTemperatureChange()],
						"nightPrecipitationChange": WK2.ChangeTrend[weatherChangesData?.changes(i)?.nightPrecipitationChange()],
					};
					data.changes.push(change);
				};
				break;
			case "trendComparison":
			case "trendComparisons":
			case "historicalComparison":
			case "historicalComparisons":
				const historicalComparisonsData = WeatherData?.historicalComparisons();
				metadata = historicalComparisonsData?.metadata();
				data = {
					"comparisons": [],
				};
				for (let i = 0; i < historicalComparisonsData?.comparisonsLength(); i++) {
					let comparison = {
						"baselineStartDate": historicalComparisonsData?.comparisons(i)?.baselineStartDate(),
						"baselineType": historicalComparisonsData?.comparisons(i)?.baselineType(),
						"baselineValue": historicalComparisonsData?.comparisons(i)?.baselineValue(),
						"condition": WK2.ComparisonType[historicalComparisonsData?.comparisons(i)?.condition()],
						"currentValue": historicalComparisonsData?.comparisons(i)?.currentValue(),
						"deviation": WK2.DeviationType[historicalComparisonsData?.comparisons(i)?.deviation()],
					};
					data.comparisons.push(comparison);
				};
				break;
		};
		data.metadata = {
			"attributionUrl": metadata?.attributionUrl(),
			"expireTime": metadata?.expireTime(),
			"language": metadata?.language(),
			"latitude": metadata?.latitude(),
			"longitude": metadata?.longitude(),
			"providerLogo": metadata?.providerLogo(),
			"providerName": metadata?.providerName(),
			"readTime": metadata?.readTime(),
			"reportedTime": metadata?.reportedTime(),
			"unknown9": metadata?.unknown9(),
			"sourceType": WK2.SourceType[metadata?.sourceType()],
			"unknown11": metadata?.unknown11(),
			//"temporarilyUnavailable": metadata?.temporarilyUnavailable(),
		};
		return data;
    };
}

