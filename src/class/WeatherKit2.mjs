import { log } from "../utils/utils.mjs";
import * as WK2 from "../flatbuffers/wk2.js";

export default class WeatherKit2 {
	static Name = "WeatherKit2";
	static Version = "1.1.4";
	static encode(builder, dataSet = "all", data = {}) {
		log(`☑️ WeatherKit2.encode, dataSet: ${dataSet}`, "");
		let offset;
		let metadataOffset;
		if (data?.metadata) metadataOffset = WK2.Metadata.createMetadata(builder, builder.createString(data?.metadata?.attributionUrl), data?.metadata?.expireTime, builder.createString(data?.metadata?.language), data?.metadata?.latitude, data?.metadata?.longitude, builder.createString(data?.metadata?.providerLogo), builder.createString(data?.metadata?.providerName), data?.metadata?.readTime, data?.metadata?.reportedTime, data?.metadata?.temporarilyUnavailable, WK2.SourceType[data?.metadata?.sourceType], data?.metadata?.unknown11, data?.metadata?.unknown12, data?.metadata?.unknown13, data?.metadata?.unknown14, data?.metadata?.unknown15);
		switch (dataSet) {
			case "all":
				const Offsets = {};
				if (data?.airQuality) Offsets.airQualityOffset = this.encode(builder, "airQuality", data.airQuality);
				if (data?.currentWeather) Offsets.currentWeatherOffset = this.encode(builder, "currentWeather", data.currentWeather);
				if (data?.forecastDaily) Offsets.forecastDailyOffset = this.encode(builder, "forecastDaily", data.forecastDaily);
				if (data?.forecastHourly) Offsets.forecastHourlyOffset = this.encode(builder, "forecastHourly", data.forecastHourly);
				if (data?.forecastNextHour) Offsets.forecastNextHourOffset = this.encode(builder, "forecastNextHour", data.forecastNextHour);
				if (data?.news) Offsets.newsOffset = this.encode(builder, "news", data.news);
				if (data?.weatherAlerts) Offsets.weatherAlertsOffset = this.encode(builder, "weatherAlerts", data.weatherAlerts);
				if (data?.weatherChanges) Offsets.weatherChangesOffset = this.encode(builder, "weatherChanges", data.weatherChanges);
				if (data?.historicalComparisons) Offsets.historicalComparisonsOffset = this.encode(builder, "historicalComparisons", data.historicalComparisons);
				offset = WeatherKit2.createWeather(builder, Offsets.airQualityOffset, Offsets.currentWeatherOffset, Offsets.forecastDailyOffset, Offsets.forecastHourlyOffset, Offsets.forecastNextHourOffset, Offsets.newsOffset, Offsets.weatherAlertsOffset, Offsets.weatherChangesOffset, Offsets.historicalComparisonsOffset);
				break;
			case "airQuality":
				let pollutantsOffset = WK2.AirQuality.createPollutantsVector(builder, data?.pollutants?.map(p => WK2.Pollutant.createPollutant(builder, WK2.PollutantType[p.pollutantType], p.amount, WK2.UnitType[p.units])));
				let scaleOffset = builder.createString(data?.scale);
				offset = WK2.AirQuality.createAirQuality(builder, metadataOffset, data?.categoryIndex, data?.index, data?.isSignificant, pollutantsOffset, WK2.ComparisonTrend[data?.previousDayComparison], WK2.PollutantType[data?.primaryPollutant], scaleOffset);
				break;
			case "currentWeather":
				let precipitationAmountNext1hByTypeOffset = WK2.CurrentWeatherData.createPrecipitationAmountNext1hByTypeVector(builder, data?.precipitationAmountNext1hByType?.map(p => WK2.PrecipitationAmountByType.createPrecipitationAmountByType(builder, WK2.PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
				let precipitationAmountNext24hByTypeOffset = WK2.CurrentWeatherData.createPrecipitationAmountNext24hByTypeVector(builder, data?.precipitationAmountNext24hByType?.map(p => WK2.PrecipitationAmountByType.createPrecipitationAmountByType(builder, WK2.PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
				let precipitationAmountNext6hByTypeOffset = WK2.CurrentWeatherData.createPrecipitationAmountNext6hByTypeVector(builder, data?.precipitationAmountNext6hByType?.map(p => WK2.PrecipitationAmountByType.createPrecipitationAmountByType(builder, WK2.PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
				let precipitationAmountPrevious1hByTypeOffset = WK2.CurrentWeatherData.createPrecipitationAmountPrevious1hByTypeVector(builder, data?.precipitationAmountPrevious1hByType?.map(p => WK2.PrecipitationAmountByType.createPrecipitationAmountByType(builder, WK2.PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
				let precipitationAmountPrevious24hByTypeOffset = WK2.CurrentWeatherData.createPrecipitationAmountPrevious24hByTypeVector(builder, data?.precipitationAmountPrevious24hByType?.map(p => WK2.PrecipitationAmountByType.createPrecipitationAmountByType(builder, WK2.PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
				let precipitationAmountPrevious6hByTypeOffset = WK2.CurrentWeatherData.createPrecipitationAmountPrevious6hByTypeVector(builder, data?.precipitationAmountPrevious6hByType?.map(p => WK2.PrecipitationAmountByType.createPrecipitationAmountByType(builder, WK2.PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
				offset = WK2.CurrentWeatherData.createCurrentWeatherData(builder, metadataOffset, data?.asOf, data?.cloudCover, data?.cloudCoverLowAltPct, data?.cloudCoverMidAltPct, data?.cloudCoverHighAltPct, WK2.WeatherCondition[data?.conditionCode], data?.daylight, data?.humidity, data?.perceivedPrecipitationIntensity, data?.precipitationAmount1h, data?.precipitationAmount6h, data?.precipitationAmount24h, data?.precipitationAmountNext1h, data?.precipitationAmountNext6h, data?.precipitationAmountNext24h, precipitationAmountNext1hByTypeOffset, precipitationAmountNext6hByTypeOffset, precipitationAmountNext24hByTypeOffset, precipitationAmountPrevious1hByTypeOffset, precipitationAmountPrevious6hByTypeOffset, precipitationAmountPrevious24hByTypeOffset, data?.precipitationIntensity, data?.pressure, WK2.PressureTrend[data?.pressureTrend], data?.snowfallAmount1h, data?.snowfallAmount6h, data?.snowfallAmount24h, data?.snowfallAmountNext1h, data?.snowfallAmountNext6h, data?.snowfallAmountNext24h, data?.temperature, data?.temperatureApparent, data?.unknown34, data?.temperatureDewPoint, data?.uvIndex, data?.visibility, data?.windDirection, data?.windGust, data?.windSpeed);
				break;
			case "forecastDaily":
				let daysOffsets = data?.days?.map(day => {
					const Offsets = {};
					Offsets.precipitationAmountByTypeOffest = WK2.DayWeatherConditions.createPrecipitationAmountByTypeVector(builder, day?.precipitationAmountByType?.map(p => WK2.PrecipitationAmountByType.createPrecipitationAmountByType(builder, WK2.PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
					if (day?.daytimeForecast) {
						Offsets.daytimeForecastPrecipitationAmountByTypeOffest = WK2.DayPartForecast.createPrecipitationAmountByTypeVector(builder, day?.daytimeForecast?.precipitationAmountByType?.map(p => WK2.PrecipitationAmountByType.createPrecipitationAmountByType(builder, WK2.PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
						Offsets.daytimeForecastOffset = WK2.DayPartForecast.createDayPartForecast(builder, day?.daytimeForecast?.forecastStart, day?.daytimeForecast?.forecastEnd, day?.daytimeForecast?.cloudCover, day?.daytimeForecast?.cloudCoverLowAltPct, day?.daytimeForecast?.cloudCoverMidAltPct, day?.daytimeForecast?.cloudCoverHighAltPct, WK2.WeatherCondition[day?.daytimeForecast?.conditionCode], day?.daytimeForecast?.humidity, day?.daytimeForecast?.humidityMax, day?.daytimeForecast?.humidityMin, day?.daytimeForecast?.precipitationAmount, Offsets.daytimeForecastPrecipitationAmountByTypeOffest, day?.daytimeForecast?.precipitationChance, WK2.PrecipitationType[day?.daytimeForecast?.precipitationType], day?.daytimeForecast?.snowfallAmount, day?.daytimeForecast?.temperatureMax, day?.daytimeForecast?.temperatureMin, day?.daytimeForecast?.visibilityMax, day?.daytimeForecast?.visibilityMin, day?.daytimeForecast?.windDirection, day?.daytimeForecast?.windGustSpeedMax, day?.daytimeForecast?.windSpeed, day?.daytimeForecast?.windSpeedMax);
					};
					if (day?.overnightForecast) {
						Offsets.overnightForecastPrecipitationAmountByTypeOffest = WK2.DayPartForecast.createPrecipitationAmountByTypeVector(builder, day?.overnightForecast?.precipitationAmountByType?.map(p => WK2.PrecipitationAmountByType.createPrecipitationAmountByType(builder, WK2.PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
						Offsets.overnightForecastOffset = WK2.DayPartForecast.createDayPartForecast(builder, day?.overnightForecast?.forecastStart, day?.overnightForecast?.forecastEnd, day?.overnightForecast?.cloudCover, day?.overnightForecast?.cloudCoverLowAltPct, day?.overnightForecast?.cloudCoverMidAltPct, day?.overnightForecast?.cloudCoverHighAltPct, WK2.WeatherCondition[day?.overnightForecast?.conditionCode], day?.overnightForecast?.humidity, day?.overnightForecast?.humidityMax, day?.overnightForecast?.humidityMin, day?.overnightForecast?.precipitationAmount, Offsets.overnightForecastPrecipitationAmountByTypeOffest, day?.overnightForecast?.precipitationChance, WK2.PrecipitationType[day?.overnightForecast?.precipitationType], day?.overnightForecast?.snowfallAmount, day?.overnightForecast?.temperatureMax, day?.overnightForecast?.temperatureMin, day?.overnightForecast?.visibilityMax, day?.overnightForecast?.visibilityMin, day?.overnightForecast?.windDirection, day?.overnightForecast?.windGustSpeedMax, day?.overnightForecast?.windSpeed, day?.overnightForecast?.windSpeedMax);
					};
					if (day?.restOfDayForecast) {
						Offsets.restOfDayForecastPrecipitationAmountByTypeOffest = WK2.DayPartForecast.createPrecipitationAmountByTypeVector(builder, day?.restOfDayForecast?.precipitationAmountByType?.map(p => WK2.PrecipitationAmountByType.createPrecipitationAmountByType(builder, WK2.PrecipitationType[p.precipitationType], p.expected, p.minimumSnow, p.maximumSnow, p.expectedSnow)));
						Offsets.restOfDayForecastOffset = WK2.DayPartForecast.createDayPartForecast(builder, day?.restOfDayForecast?.forecastStart, day?.restOfDayForecast?.forecastEnd, day?.restOfDayForecast?.cloudCover, day?.restOfDayForecast?.cloudCoverLowAltPct, day?.restOfDayForecast?.cloudCoverMidAltPct, day?.restOfDayForecast?.cloudCoverHighAltPct, WK2.WeatherCondition[day?.restOfDayForecast?.conditionCode], day?.restOfDayForecast?.humidity, day?.restOfDayForecast?.humidityMax, day?.restOfDayForecast?.humidityMin, day?.restOfDayForecast?.precipitationAmount, Offsets.restOfDayForecastPrecipitationAmountByTypeOffest, day?.restOfDayForecast?.precipitationChance, WK2.PrecipitationType[day?.restOfDayForecast?.precipitationType], day?.restOfDayForecast?.snowfallAmount, day?.restOfDayForecast?.temperatureMax, day?.restOfDayForecast?.temperatureMin, day?.restOfDayForecast?.visibilityMax, day?.restOfDayForecast?.visibilityMin, day?.restOfDayForecast?.windDirection, day?.restOfDayForecast?.windGustSpeedMax, day?.restOfDayForecast?.windSpeed, day?.restOfDayForecast?.windSpeedMax);
					};
					WK2.DayWeatherConditions.startDayWeatherConditions(builder);
					WK2.DayWeatherConditions.addForecastStart(builder, day?.forecastStart);
					WK2.DayWeatherConditions.addForecastEnd(builder, day?.forecastEnd);
					WK2.DayWeatherConditions.addConditionCode(builder, WK2.WeatherCondition[day?.conditionCode]);
					WK2.DayWeatherConditions.addHumidityMax(builder, day?.humidityMax);
					WK2.DayWeatherConditions.addHumidityMin(builder, day?.humidityMin);
					WK2.DayWeatherConditions.addMaxUvIndex(builder, day?.maxUvIndex);
					WK2.DayWeatherConditions.addMoonPhase(builder, WK2.MoonPhase[day?.moonPhase]);
					WK2.DayWeatherConditions.addMoonrise(builder, day?.moonrise);
					WK2.DayWeatherConditions.addMoonset(builder, day?.moonset);
					WK2.DayWeatherConditions.addPrecipitationAmount(builder, day?.precipitationAmount);
					WK2.DayWeatherConditions.addPrecipitationAmountByType(builder, Offsets.precipitationAmountByTypeOffest);
					WK2.DayWeatherConditions.addPrecipitationChance(builder, day?.precipitationChance);
					WK2.DayWeatherConditions.addPrecipitationType(builder, WK2.PrecipitationType[day?.precipitationType]);
					WK2.DayWeatherConditions.addSnowfallAmount(builder, day?.snowfallAmount);
					WK2.DayWeatherConditions.addSolarMidnight(builder, day?.solarMidnight);
					WK2.DayWeatherConditions.addSolarNoon(builder, day?.solarNoon);
					WK2.DayWeatherConditions.addSunrise(builder, day?.sunrise);
					WK2.DayWeatherConditions.addSunriseCivil(builder, day?.sunriseCivil);
					WK2.DayWeatherConditions.addSunriseNautical(builder, day?.sunriseNautical);
					WK2.DayWeatherConditions.addSunriseAstronomical(builder, day?.sunriseAstronomical);
					WK2.DayWeatherConditions.addSunset(builder, day?.sunset);
					WK2.DayWeatherConditions.addSunsetCivil(builder, day?.sunsetCivil);
					WK2.DayWeatherConditions.addSunsetNautical(builder, day?.sunsetNautical);
					WK2.DayWeatherConditions.addSunsetAstronomical(builder, day?.sunsetAstronomical);
					WK2.DayWeatherConditions.addTemperatureMax(builder, day?.temperatureMax);
					WK2.DayWeatherConditions.addTemperatureMaxTime(builder, day?.temperatureMaxTime);
					WK2.DayWeatherConditions.addTemperatureMin(builder, day?.temperatureMin);
					WK2.DayWeatherConditions.addTemperatureMinTime(builder, day?.temperatureMinTime);
					WK2.DayWeatherConditions.addVisibilityMax(builder, day?.visibilityMax);
					WK2.DayWeatherConditions.addVisibilityMin(builder, day?.visibilityMin);
					WK2.DayWeatherConditions.addWindGustSpeedMax(builder, day?.windGustSpeedMax);
					WK2.DayWeatherConditions.addWindSpeedAvg(builder, day?.windSpeedAvg);
					WK2.DayWeatherConditions.addWindSpeedMax(builder, day?.windSpeedMax);
					if (day?.daytimeForecast) WK2.DayWeatherConditions.addDaytimeForecast(builder, Offsets.daytimeForecastOffset);
					if (day?.overnightForecast) WK2.DayWeatherConditions.addOvernightForecast(builder, Offsets.overnightForecastOffset);
					if (day?.restOfDayForecast) WK2.DayWeatherConditions.addRestOfDayForecast(builder, Offsets.restOfDayForecastOffset);
					return WK2.DayWeatherConditions.endDayWeatherConditions(builder);
				});
				let daysOffset = WK2.DailyForecastData.createDaysVector(builder, daysOffsets);
				offset = WK2.DailyForecastData.createDailyForecastData(builder, metadataOffset, daysOffset);
				break;
			case "forecastHourly":
				let hoursOffsets = data?.hours?.map(hour => WK2.HourWeatherConditions.createHourWeatherConditions(builder, hour?.forecastStart, hour?.cloudCover, hour?.cloudCoverLowAltPct, hour?.cloudCoverMidAltPct, hour?.cloudCoverHighAltPct, WK2.WeatherCondition[hour?.conditionCode], hour?.daylight, hour?.humidity, hour?.perceivedPrecipitationIntensity, hour?.precipitationAmount, hour?.precipitationIntensity, hour?.precipitationChance, WK2.PrecipitationType[hour?.precipitationType], hour?.pressure, WK2.PressureTrend[hour?.pressureTrend], hour?.snowfallAmount, hour?.snowfallIntensity, hour?.temperature, hour?.temperatureApparent, hour?.unknown20, hour?.temperatureDewPoint, hour?.uvIndex, hour?.visibility, hour?.windDirection, hour?.windGust, hour?.windSpeed));
				let hoursOffset = WK2.HourlyForecastData.createHoursVector(builder, hoursOffsets);
				offset = WK2.HourlyForecastData.createHourlyForecastData(builder, metadataOffset, hoursOffset);
				break;
			case "forecastNextHour":
				let conditionOffsets = data?.condition?.map(condition => {
					let parametersOffsets = condition?.parameters.map(parameter => WK2.Parameter.createParameter(builder, WK2.ParameterType[parameter?.type], parameter?.date));
					let parametersOffset = WK2.Condition.createParametersVector(builder, parametersOffsets);
					return WK2.Condition.createCondition(builder, condition?.startTime, condition?.endTime, WK2.ForecastToken[condition?.forecastToken], WK2.ConditionType[condition?.beginCondition], WK2.ConditionType[condition?.endCondition], parametersOffset);
				});
				let conditionOffset = WK2.NextHourForecastData.createConditionVector(builder, conditionOffsets);
				let summaryOffsets = data?.summary?.map(summary => WK2.ForecastPeriodSummary.createForecastPeriodSummary(builder, summary?.startTime, summary?.endTime, WK2.PrecipitationType[summary?.condition], summary?.precipitationChance, summary?.precipitationIntensity));
				let summaryOffset = WK2.NextHourForecastData.createSummaryVector(builder, summaryOffsets);
				let minutesOffsets = data?.minutes?.map(minute => WK2.ForecastMinute.createForecastMinute(builder, minute?.startTime, minute?.precipitationChance, minute?.precipitationIntensity, minute?.perceivedPrecipitationIntensity));
				let minutesOffset = WK2.NextHourForecastData.createMinutesVector(builder, minutesOffsets);
				offset = WK2.NextHourForecastData.createNextHourForecastData(builder, metadataOffset, conditionOffset, summaryOffset, data?.forecastStart, data?.forecastEnd, minutesOffset);
				break;
			case "news":
				let placementsOffsets = data?.placements?.map(placement => {
					let articlesOffsets = placement?.articles?.map(article => {
						let alertIdsOffset = WK2.Articles.createAlertIdsVector(builder, article?.alertIds?.map(alertId => builder.createString(alertId)));
						let headlineOverrideOffset = builder.createString(article?.headlineOverride);
						let idOffset = builder.createString(article?.id);
						let localeOffset = builder.createString(article?.locale);
						let phenomenaOffset = WK2.Articles.createPhenomenaVector(builder, article?.phenomena?.map(phenomena => builder.createString(phenomena)));
						let supportedStorefrontsOffset = WK2.Articles.createSupportedStorefrontsVector(builder, article?.supportedStorefronts?.map(supportedStorefront => builder.createString(supportedStorefront)));
						return WK2.Articles.createArticles(builder, idOffset, supportedStorefrontsOffset, alertIdsOffset, phenomenaOffset, headlineOverrideOffset, localeOffset);
					});
					let articlesOffset = WK2.Placement.createArticlesVector(builder, articlesOffsets);
					return WK2.Placement.createPlacement(builder, placement?.priority, articlesOffset, WK2.PlacementType[placement?.placement]);
				});
				let placementsOffset = WK2.News.createPlacementsVector(builder, placementsOffsets);
				offset = WK2.News.createNews(builder, metadataOffset, placementsOffset);
				break;
			case "weatherAlert":
			case "weatherAlerts":
				let alertsOffsets = data?.alerts?.map(alert => {
					let responsesOffsets = alert?.responses?.map(response => WK2.ResponseType[response]);
					let responsesOffset = WK2.WeatherAlertSummary.createResponsesVector(builder, responsesOffsets);
					let idOffset = WK2.ID.createID(builder, builder.createString(alert?.id?.uuid));
					//let idOffset = WK2.WeatherAlertSummary.createIdVector(builder, alert?.id);
					//WK2.WeatherAlertSummary.startIdVector(builder, alert?.id?.length);
					//alert?.id?.map(id => WK2.UUID.createUUID(builder, id?.lowBytes, id?.highBytes));
					//let idOffset = builder.endVector();
					let areaIdOffset = builder.createString(alert?.areaId);
					let attributionUrlOffset = builder.createString(alert?.attributionUrl);
					let countryCodeOffset = builder.createString(alert?.countryCode);
					let descriptionOffset = builder.createString(alert?.description);
					let tokenOffset = builder.createString(alert?.token);
					let detailsUrlOffset = builder.createString(alert?.detailsUrl);
					let phenomenonOffset = builder.createString(alert?.phenomenon);
					let sourceOffset = builder.createString(alert?.source);
					let eventSourceOffset = builder.createString(alert?.eventSource);
					return WK2.WeatherAlertSummary.createWeatherAlertSummary(builder, idOffset, areaIdOffset, alert?.unknown3, attributionUrlOffset, countryCodeOffset, descriptionOffset, tokenOffset, alert?.effectiveTime, alert?.expireTime, alert?.issuedTime, alert?.eventOnsetTime, alert?.eventEndTime, detailsUrlOffset, phenomenonOffset, WK2.Severity[alert?.severity], WK2.SignificanceType[alert?.significance], sourceOffset, eventSourceOffset, WK2.Urgency[alert?.urgency], WK2.Certainty[alert?.certainty], WK2.ImportanceType[alert?.importance], responsesOffset, alert?.unknown23, alert?.unknown24);
				});
				let alertsOffset = WK2.WeatherAlertCollectionData.createAlertsVector(builder, alertsOffsets);
				let detailsUrlOffset = builder.createString(data?.detailsUrl);
				offset = WK2.WeatherAlertCollectionData.createWeatherAlertCollectionData(builder, metadataOffset, detailsUrlOffset, alertsOffset);
				break;
			case "weatherChange":
			case "weatherChanges":
				let changesOffsets = data?.changes?.map(change => WK2.Change.createChange(builder, change?.forecastStart, change?.forecastEnd, WK2.Direction[change?.maxTemperatureChange], WK2.Direction[change?.minTemperatureChange], WK2.Direction[change?.dayPrecipitationChange], WK2.Direction[change?.nightPrecipitationChange]));
				let changesOffset = WK2.WeatherChanges.createChangesVector(builder, changesOffsets);
				offset = WK2.WeatherChanges.createWeatherChanges(builder, metadataOffset, data?.forecastStart, data?.forecastEnd, changesOffset);
				break;
			case "trendComparison":
			case "trendComparisons":
			case "historicalComparison":
			case "historicalComparisons":
				let comparisonsOffsets = data?.comparisons?.map(comparison => WK2.Comparison.createComparison(builder, WK2.ComparisonType[comparison?.condition], comparison?.currentValue, comparison?.baselineValue, WK2.Deviation[comparison?.deviation], comparison?.baselineType, comparison?.baselineStartDate));
				let comparisonsOffset = WK2.HistoricalComparison.createComparisonsVector(builder, comparisonsOffsets);
				offset = WK2.HistoricalComparison.createHistoricalComparison(builder, metadataOffset, comparisonsOffset);
				break;
		};
		log(`✅ WeatherKit2.encode, dataSet: ${dataSet}`, "");
		return offset;
	};

	static decode(byteBuffer, dataSet = "all", data = {}) {
		log(`☑️ WeatherKit2.decode, dataSet: ${dataSet}`, "");
		const Weather = WK2.Weather.getRootAsWeather(byteBuffer);
		const airQualityData = Weather?.airQuality();
		const CurrentWeatherData = Weather?.currentWeather();
		const DailyForecastData = Weather?.forecastDaily();
		const HourlyForecastData = Weather?.forecastHourly();
		const NextHourForecastData = Weather?.forecastNextHour();
		const newsData = Weather?.news();
		const WeatherAlertCollectionData = Weather?.weatherAlerts();
		const weatherChangesData = Weather?.weatherChanges();
		const historicalComparisonsData = Weather?.historicalComparisons();
		switch (dataSet) {
			case "all":
				if (airQualityData) data.airQuality = this.decode(byteBuffer, "airQuality", airQualityData);
				if (CurrentWeatherData) data.currentWeather = this.decode(byteBuffer, "currentWeather", CurrentWeatherData);
				if (DailyForecastData) data.forecastDaily = this.decode(byteBuffer, "forecastDaily", DailyForecastData);
				if (HourlyForecastData) data.forecastHourly = this.decode(byteBuffer, "forecastHourly", HourlyForecastData);
				if (NextHourForecastData) data.forecastNextHour = this.decode(byteBuffer, "forecastNextHour", NextHourForecastData);
				if (newsData) data.news = this.decode(byteBuffer, "news", newsData);
				if (WeatherAlertCollectionData) data.weatherAlerts = this.decode(byteBuffer, "weatherAlerts", WeatherAlertCollectionData);
				if (weatherChangesData) data.weatherChanges = this.decode(byteBuffer, "weatherChange", weatherChangesData);
				if (historicalComparisonsData) data.historicalComparisons = this.decode(byteBuffer, "trendComparison", historicalComparisonsData);
				break;
			case "airQuality":
				data = {
					"metadata": this.decode(byteBuffer, "metadata", airQualityData?.metadata()),
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
				data = {
					"metadata": this.decode(byteBuffer, "metadata", CurrentWeatherData?.metadata()),
					"asOf": CurrentWeatherData?.asOf(),
					"cloudCover": CurrentWeatherData?.cloudCover(),
					"cloudCoverHighAltPct": CurrentWeatherData?.cloudCoverHighAltPct(),
					"cloudCoverLowAltPct": CurrentWeatherData?.cloudCoverLowAltPct(),
					"cloudCoverMidAltPct": CurrentWeatherData?.cloudCoverMidAltPct(),
					"conditionCode": WK2.WeatherCondition[CurrentWeatherData?.conditionCode()],
					"daylight": CurrentWeatherData?.daylight(),
					"humidity": CurrentWeatherData?.humidity(),
					"perceivedPrecipitationIntensity": CurrentWeatherData?.perceivedPrecipitationIntensity(),
					"precipitationAmount1h": CurrentWeatherData?.precipitationAmount1h(),
					"precipitationAmount24h": CurrentWeatherData?.precipitationAmount24h(),
					"precipitationAmount6h": CurrentWeatherData?.precipitationAmount6h(),
					"precipitationAmountNext1h": CurrentWeatherData?.precipitationAmountNext1h(),
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
				data = {
					"metadata": this.decode(byteBuffer, "metadata", DailyForecastData?.metadata()),
					"days": [],
				};
				for (let i = 0; i < DailyForecastData?.daysLength(); i++) {
					let day = {
						"conditionCode": WK2.WeatherCondition[DailyForecastData?.days(i)?.conditionCode()],
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
							"conditionCode": WK2.WeatherCondition[DailyForecastData?.days(i)?.daytimeForecast()?.conditionCode()],
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
							"conditionCode": WK2.WeatherCondition[DailyForecastData?.days(i)?.overnightForecast()?.conditionCode()],
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
							"conditionCode": WK2.WeatherCondition[DailyForecastData?.days(i)?.restOfDayForecast()?.conditionCode()],
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
				data = {
					"metadata": this.decode(byteBuffer, "metadata", HourlyForecastData?.metadata()),
					"hours": [],
				};
				for (let i = 0; i < HourlyForecastData?.hoursLength(); i++) data.hours.push({
					"cloudCover": HourlyForecastData?.hours(i)?.cloudCover(),
					"cloudCoverHighAltPct": HourlyForecastData?.hours(i)?.cloudCoverHighAltPct(),
					"cloudCoverLowAltPct": HourlyForecastData?.hours(i)?.cloudCoverLowAltPct(),
					"cloudCoverMidAltPct": HourlyForecastData?.hours(i)?.cloudCoverMidAltPct(),
					"conditionCode": WK2.WeatherCondition[HourlyForecastData?.hours(i)?.conditionCode()],
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
					"unknown20": HourlyForecastData?.hours(i)?.unknown20(),
					"temperatureDewPoint": HourlyForecastData?.hours(i)?.temperatureDewPoint(),
					"uvIndex": HourlyForecastData?.hours(i)?.uvIndex(),
					"visibility": HourlyForecastData?.hours(i)?.visibility(),
					"windDirection": HourlyForecastData?.hours(i)?.windDirection(),
					"windGust": HourlyForecastData?.hours(i)?.windGust(),
					"windSpeed": HourlyForecastData?.hours(i)?.windSpeed(),
				});
				break;
			case "forecastNextHour":
				data = {
					"metadata": this.decode(byteBuffer, "metadata", NextHourForecastData?.metadata()),
					"condition": [],
					"forecastEnd": NextHourForecastData?.forecastEnd(),
					"forecastStart": NextHourForecastData?.forecastStart(),
					"minutes": [],
					"summary": []
				};
				for (let i = 0; i < NextHourForecastData?.conditionLength(); i++) {
					let condition = {
						"beginCondition": WK2.ConditionType[NextHourForecastData?.condition(i)?.beginCondition()],
						"endCondition": WK2.ConditionType[NextHourForecastData?.condition(i)?.endCondition()],
						"endTime": NextHourForecastData?.condition(i)?.endTime(),
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
					"endTime": NextHourForecastData?.summary(i)?.endTime(),
					"precipitationChance": NextHourForecastData?.summary(i)?.precipitationChance(),
					"precipitationIntensity": NextHourForecastData?.summary(i)?.precipitationIntensity(),
					"startTime": NextHourForecastData?.summary(i)?.startTime(),
				});
				break;
			case "metadata":
				data = {
					"attributionUrl": data?.attributionUrl(),
					"expireTime": data?.expireTime(),
					"language": data?.language(),
					"latitude": data?.latitude(),
					"longitude": data?.longitude(),
					"providerLogo": data?.providerLogo(),
					"providerName": data?.providerName(),
					"readTime": data?.readTime(),
					"reportedTime": data?.reportedTime(),
					"temporarilyUnavailable": data?.temporarilyUnavailable(),
					"sourceType": WK2.SourceType[data?.sourceType()],
				};
				break;
			case "news":
				data = {
					"metadata": this.decode(byteBuffer, "metadata", newsData?.metadata()),
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
				data = {
					"metadata": this.decode(byteBuffer, "metadata", WeatherAlertCollectionData?.metadata()),
					"alerts": [],
					"detailsUrl": WeatherAlertCollectionData?.detailsUrl(),
				};
				for (let i = 0; i < WeatherAlertCollectionData?.alertsLength(); i++) {
					//let uuid = { "uuid": WeatherAlertCollectionData?.alerts(i)?.id().uuid() };
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
						"id": { "uuid": WeatherAlertCollectionData?.alerts(i)?.id()?.uuid() },
						"importance": WK2.ImportanceType[WeatherAlertCollectionData?.alerts(i)?.importance()],
						"issuedTime": WeatherAlertCollectionData?.alerts(i)?.issuedTime(),
						"phenomenon": WeatherAlertCollectionData?.alerts(i)?.phenomenon(),
						"responses": [],
						"severity": WK2.Severity[WeatherAlertCollectionData?.alerts(i)?.severity()],
						"significance": WK2.SignificanceType[WeatherAlertCollectionData?.alerts(i)?.significance()],
						"source": WeatherAlertCollectionData?.alerts(i)?.source(),
						"token": WeatherAlertCollectionData?.alerts(i)?.token(),
						"unknown3": WeatherAlertCollectionData?.alerts(i)?.unknown3(),
						"urgency": WK2.Urgency[WeatherAlertCollectionData?.alerts(i)?.urgency()],
					};
					//for (let j = 0; j < WeatherAlertCollectionData?.alerts(i)?.idLength(); j++) alert.id.push(WeatherAlertCollectionData?.alerts(i)?.id(j));
					//for (let j = 0; j < WeatherAlertCollectionData?.alerts(i)?.idLength(); j++) alert.id.push({ "lowBytes": WeatherAlertCollectionData?.alerts(i)?.id(j).lowBytes(), "highBytes": WeatherAlertCollectionData?.alerts(i)?.id(j).highBytes() });
					for (let j = 0; j < WeatherAlertCollectionData?.alerts(i)?.responsesLength(); j++) alert.responses.push(WK2.ResponseType[WeatherAlertCollectionData?.alerts(i)?.responses(j)]);
					data.alerts.push(alert);
				};
				break;
			case "weatherChange":
			case "weatherChanges":
				data = {
					"metadata": this.decode(byteBuffer, "metadata", weatherChangesData?.metadata()),
					"changes": [],
					"forecastEnd": weatherChangesData?.forecastEnd(),
					"forecastStart": weatherChangesData?.forecastStart(),
				};
				for (let i = 0; i < weatherChangesData?.changesLength(); i++) {
					let change = {
						"dayPrecipitationChange": WK2.Direction[weatherChangesData?.changes(i)?.dayPrecipitationChange()],
						"forecastEnd": weatherChangesData?.changes(i)?.forecastEnd(),
						"forecastStart": weatherChangesData?.changes(i)?.forecastStart(),
						"maxTemperatureChange": WK2.Direction[weatherChangesData?.changes(i)?.maxTemperatureChange()],
						"minTemperatureChange": WK2.Direction[weatherChangesData?.changes(i)?.minTemperatureChange()],
						"nightPrecipitationChange": WK2.Direction[weatherChangesData?.changes(i)?.nightPrecipitationChange()],
					};
					data.changes.push(change);
				};
				break;
			case "trendComparison":
			case "trendComparisons":
			case "historicalComparison":
			case "historicalComparisons":
				data = {
					"metadata": this.decode(byteBuffer, "metadata", historicalComparisonsData?.metadata()),
					"comparisons": [],
				};
				for (let i = 0; i < historicalComparisonsData?.comparisonsLength(); i++) {
					let comparison = {
						"baselineStartDate": historicalComparisonsData?.comparisons(i)?.baselineStartDate(),
						"baselineType": historicalComparisonsData?.comparisons(i)?.baselineType(),
						"baselineValue": historicalComparisonsData?.comparisons(i)?.baselineValue(),
						"condition": WK2.ComparisonType[historicalComparisonsData?.comparisons(i)?.condition()],
						"currentValue": historicalComparisonsData?.comparisons(i)?.currentValue(),
						"deviation": WK2.Deviation[historicalComparisonsData?.comparisons(i)?.deviation()],
					};
					data.comparisons.push(comparison);
				};
				break;
		};
		log(`✅ WeatherKit2.decode, dataSet: ${dataSet}`, "");
		return data;
	};

	static createWeather(builder, airQualityOffset, currentWeatherOffset, forecastDailyOffset, forecastHourlyOffset, forecastNextHourOffset, newsOffset, weatherAlertsOffset, weatherChangesOffset, historicalComparisonsOffset) {
		WK2.Weather.startWeather(builder);
		if (airQualityOffset) WK2.Weather.addAirQuality(builder, airQualityOffset);
		if (currentWeatherOffset) WK2.Weather.addCurrentWeather(builder, currentWeatherOffset);
		if (forecastDailyOffset) WK2.Weather.addForecastDaily(builder, forecastDailyOffset);
		if (forecastHourlyOffset) WK2.Weather.addForecastHourly(builder, forecastHourlyOffset);
		if (forecastNextHourOffset) WK2.Weather.addForecastNextHour(builder, forecastNextHourOffset);
		if (newsOffset) WK2.Weather.addNews(builder, newsOffset);
		if (weatherAlertsOffset) WK2.Weather.addWeatherAlerts(builder, weatherAlertsOffset);
		if (weatherChangesOffset) WK2.Weather.addWeatherChanges(builder, weatherChangesOffset);
		if (historicalComparisonsOffset) WK2.Weather.addHistoricalComparisons(builder, historicalComparisonsOffset);
		return WK2.Weather.endWeather(builder);
	}

}

