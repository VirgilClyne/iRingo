this.Configs = {
    "EPA_NowCast": {
        "categories": {
            "INVALID": { "CATEGORY_INDEX": -1, "RANGE": { "LOWER": Number.MIN_VALUE, "UPPER": -1 } },
            "GOOD": { "CATEGORY_INDEX": 1, "RANGE": { "LOWER": 0, "UPPER": 50 } },
            "MODERATE": { "CATEGORY_INDEX": 2, "RANGE": { "LOWER": 51, "UPPER": 100 } },
            "UNHEALTHY_FOR_SENSITIVE": { "CATEGORY_INDEX": 3, "RANGE": { "LOWER": 101, "UPPER": 150 } },
            "UNHEALTHY": { "CATEGORY_INDEX": 4, "RANGE": { "LOWER": 151, "UPPER": 200 } },
            "VERY_UNHEALTHY": { "CATEGORY_INDEX": 5, "RANGE": { "LOWER": 201, "UPPER": 300 } },
            "HAZARDOUS": { "CATEGORY_INDEX": 6, "RANGE": { "LOWER": 301, "UPPER": 500 } },
            "OVER_RANGE": { "CATEGORY_INDEX": 7, "RANGE": { "LOWER": 500, "UPPER": Number.MAX_VALUE } },
        }
    },
    "WAQI_InstantCast": {
    },
};
this.Configs.EPA_NowCast.ranges = {
    OZONE_8H: {
        GOOD: {
            AQI: this.Configs.EPA_NowCast.categories.GOOD.RANGE,
            AMOUNT: { LOWER: 0.000, UPPER: 0.054 },
        },
        MODERATE: {
            AQI: this.Configs.EPA_NowCast.categories.MODERATE.RANGE,
            AMOUNT: { LOWER: 0.055, UPPER: 0.070 },
        },
        UNHEALTHY_FOR_SENSITIVE: {
            AQI: this.Configs.EPA_NowCast.categories.UNHEALTHY_FOR_SENSITIVE.RANGE,
            AMOUNT: { LOWER: 0.071, UPPER: 0.085 },
        },
        UNHEALTHY: {
            AQI: this.Configs.EPA_NowCast.categories.UNHEALTHY.RANGE,
            AMOUNT: { LOWER: 0.086, UPPER: 0.105 },
        },
        VERY_UNHEALTHY: {
            AQI: this.Configs.EPA_NowCast.categories.VERY_UNHEALTHY.RANGE,
            AMOUNT: { LOWER: 0.106, UPPER: 0.200 },
        },
        // 8-hour O3 values do not define higher AQI values (≥ 301).
        // AQI values of 301 or higher are calculated with 1-hour O3 concentrations.
    },
    OZONE: {
        // Areas are generally required to report the AQI based on 8-hour O3 values. However,
        // there are a small number of areas where an AQI based on 1-hour O3 values would be more precautionary.
        // In these cases, in addition to calculating the 8-hour O3 index value,
        // the 1-hour O3 value may be calculated, and the maximum of the two values reported.
        UNHEALTHY_FOR_SENSITIVE: {
            AQI: this.Configs.EPA_NowCast.categories.UNHEALTHY_FOR_SENSITIVE.RANGE,
            AMOUNT: { LOWER: 0.125, UPPER: 0.164 },
        },
        UNHEALTHY: {
            AQI: this.Configs.EPA_NowCast.categories.UNHEALTHY.RANGE,
            AMOUNT: { LOWER: 0.165, UPPER: 0.204 },
        },
        VERY_UNHEALTHY: {
            AQI: this.Configs.EPA_NowCast.categories.VERY_UNHEALTHY.RANGE,
            AMOUNT: { LOWER: 0.205, UPPER: 0.404 },
        },
        HAZARDOUS: {
            AQI: this.Configs.EPA_NowCast.categories.HAZARDOUS.RANGE,
            AMOUNT: { LOWER: 0.405, UPPER: 0.604 },
        },
    },
    PM2_5_24H: {
        GOOD: {
            AQI: this.Configs.EPA_NowCast.categories.GOOD.RANGE,
            AMOUNT: { LOWER: 0.0, UPPER: 9.0 },
        },
        MODERATE: {
            AQI: this.Configs.EPA_NowCast.categories.MODERATE.RANGE,
            AMOUNT: { LOWER: 9.1, UPPER: 35.4 },
        },
        UNHEALTHY_FOR_SENSITIVE: {
            AQI: this.Configs.EPA_NowCast.categories.UNHEALTHY_FOR_SENSITIVE.RANGE,
            AMOUNT: { LOWER: 35.5, UPPER: 55.4 },
        },
        UNHEALTHY: {
            AQI: this.Configs.EPA_NowCast.categories.UNHEALTHY.RANGE,
            AMOUNT: { LOWER: 55.5, UPPER: 125.4 },
        },
        VERY_UNHEALTHY: {
            AQI: this.Configs.EPA_NowCast.categories.VERY_UNHEALTHY.RANGE,
            AMOUNT: { LOWER: 125.5, UPPER: 225.4 },
        },
        HAZARDOUS: {
            AQI: this.Configs.EPA_NowCast.categories.HAZARDOUS.RANGE,
            AMOUNT: { LOWER: 225.5, UPPER: 325.4 },
        },
    },
    PM10_24H: {
        GOOD: {
            AQI: this.Configs.EPA_NowCast.categories.GOOD.RANGE,
            AMOUNT: { LOWER: 0, UPPER: 54 },
        },
        MODERATE: {
            AQI: this.Configs.EPA_NowCast.categories.MODERATE.RANGE,
            AMOUNT: { LOWER: 55, UPPER: 154 },
        },
        UNHEALTHY_FOR_SENSITIVE: {
            AQI: this.Configs.EPA_NowCast.categories.UNHEALTHY_FOR_SENSITIVE.RANGE,
            AMOUNT: { LOWER: 155, UPPER: 254 },
        },
        UNHEALTHY: {
            AQI: this.Configs.EPA_NowCast.categories.UNHEALTHY.RANGE,
            AMOUNT: { LOWER: 255, UPPER: 354 },
        },
        VERY_UNHEALTHY: {
            AQI: this.Configs.EPA_NowCast.categories.VERY_UNHEALTHY.RANGE,
            AMOUNT: { LOWER: 355, UPPER: 424 },
        },
        HAZARDOUS: {
            AQI: this.Configs.EPA_NowCast.categories.HAZARDOUS.RANGE,
            AMOUNT: { LOWER: 425, UPPER: 604 },
        },
    },
    CO_8H: {
        GOOD: {
            AQI: this.Configs.EPA_NowCast.categories.GOOD.RANGE,
            AMOUNT: { LOWER: 0.0, UPPER: 4.4 },
        },
        MODERATE: {
            AQI: this.Configs.EPA_NowCast.categories.MODERATE.RANGE,
            AMOUNT: { LOWER: 4.5, UPPER: 9.4 },
        },
        UNHEALTHY_FOR_SENSITIVE: {
            AQI: this.Configs.EPA_NowCast.categories.UNHEALTHY_FOR_SENSITIVE.RANGE,
            AMOUNT: { LOWER: 9.5, UPPER: 12.4 },
        },
        UNHEALTHY: {
            AQI: this.Configs.EPA_NowCast.categories.UNHEALTHY.RANGE,
            AMOUNT: { LOWER: 12.5, UPPER: 15.4 },
        },
        VERY_UNHEALTHY: {
            AQI: this.Configs.EPA_NowCast.categories.VERY_UNHEALTHY.RANGE,
            AMOUNT: { LOWER: 15.5, UPPER: 30.4 },
        },
        HAZARDOUS: {
            AQI: this.Configs.EPA_NowCast.categories.HAZARDOUS.RANGE,
            AMOUNT: { LOWER: 30.5, UPPER: 50.4 },
        },
    },
    SO2: {
        GOOD: {
            AQI: this.Configs.EPA_NowCast.categories.GOOD.RANGE,
            AMOUNT: { LOWER: 0, UPPER: 35 },
        },
        MODERATE: {
            AQI: this.Configs.EPA_NowCast.categories.MODERATE.RANGE,
            AMOUNT: { LOWER: 36, UPPER: 75 },
        },
        UNHEALTHY_FOR_SENSITIVE: {
            AQI: this.Configs.EPA_NowCast.categories.UNHEALTHY_FOR_SENSITIVE.RANGE,
            AMOUNT: { LOWER: 76, UPPER: 185 },
        },
        UNHEALTHY: {
            AQI: this.Configs.EPA_NowCast.categories.UNHEALTHY.RANGE,
            AMOUNT: { LOWER: 186, UPPER: 304 },
        },
        // 1-hour SO2 values do not define higher AQI values (≥ 200).
        // AQI values of 200 or greater are calculated with 24-hour SO2 concentrations.
    },
    SO2_24H: {
        VERY_UNHEALTHY: {
            AQI: this.Configs.EPA_NowCast.categories.VERY_UNHEALTHY.RANGE,
            AMOUNT: { LOWER: 305, UPPER: 604 },
        },
        HAZARDOUS: {
            AQI: this.Configs.EPA_NowCast.categories.HAZARDOUS.RANGE,
            AMOUNT: { LOWER: 605, UPPER: 1004 },
        },
    },
    NO2: {
        GOOD: {
            AQI: this.Configs.EPA_NowCast.categories.GOOD.RANGE,
            AMOUNT: { LOWER: 0, UPPER: 53 },
        },
        MODERATE: {
            AQI: this.Configs.EPA_NowCast.categories.MODERATE.RANGE,
            AMOUNT: { LOWER: 54, UPPER: 100 },
        },
        UNHEALTHY_FOR_SENSITIVE: {
            AQI: this.Configs.EPA_NowCast.categories.UNHEALTHY_FOR_SENSITIVE.RANGE,
            AMOUNT: { LOWER: 101, UPPER: 360 },
        },
        UNHEALTHY: {
            AQI: this.Configs.EPA_NowCast.categories.UNHEALTHY.RANGE,
            AMOUNT: { LOWER: 361, UPPER: 649 },
        },
        VERY_UNHEALTHY: {
            AQI: this.Configs.EPA_NowCast.categories.VERY_UNHEALTHY.RANGE,
            AMOUNT: { LOWER: 650, UPPER: 1249 },
        },
        HAZARDOUS: {
            AQI: this.Configs.EPA_NowCast.categories.HAZARDOUS.RANGE,
            AMOUNT: { LOWER: 1250, UPPER: 2049 },
        },
    },
};
this.Configs.EPA_NowCast = {
    ...this.Configs.EPA_NowCast, ...{
        "scale": 'EPA_NowCast.2411',
        SIGNIFICANT_LEVEL: this.Configs.EPA_NowCast.categories.UNHEALTHY_FOR_SENSITIVE.CATEGORY_INDEX,
        AQI_CATEGORIES: Object.values(this.Configs.EPA_NowCast.categories),
        "pollutants": {
            OZONE_8H: {
                UNIT: 'PARTS_PER_MILLION',
                // 48 g/mol
                PPX_TO_XGM3: 1.97,
                RANGES: {
                    MIN: this.Configs.EPA_NowCast.ranges.OZONE_8H.GOOD,
                    MAX: this.Configs.EPA_NowCast.ranges.OZONE_8H.VERY_UNHEALTHY,
                    ALL: Object.values(this.Configs.EPA_NowCast.ranges.OZONE_8H),
                },
            },
            OZONE: {
                UNIT: 'PARTS_PER_MILLION',
                // 48 g/mol
                PPX_TO_XGM3: 1.97,
                RANGES: {
                    MIN: this.Configs.EPA_NowCast.ranges.OZONE.UNHEALTHY_FOR_SENSITIVE,
                    MAX: this.Configs.EPA_NowCast.ranges.OZONE.HAZARDOUS,
                    ALL: Object.values(this.Configs.EPA_NowCast.ranges.OZONE),
                },
            },
            PM2_5_24H: {
                UNIT: 'MICROGRAMS_PER_CUBIC_METER',
                PPX_TO_XGM3: -1,
                RANGES: {
                    MIN: this.Configs.EPA_NowCast.ranges.PM2_5_24H.GOOD,
                    MAX: this.Configs.EPA_NowCast.ranges.PM2_5_24H.HAZARDOUS,
                    ALL: Object.values(this.Configs.EPA_NowCast.ranges.PM2_5_24H),
                },
            },
            PM10_24H: {
                UNIT: 'MICROGRAMS_PER_CUBIC_METER',
                PPX_TO_XGM3: -1,
                RANGES: {
                    MIN: this.Configs.EPA_NowCast.ranges.PM10_24H.GOOD,
                    MAX: this.Configs.EPA_NowCast.ranges.PM10_24H.HAZARDOUS,
                    ALL: Object.values(this.Configs.EPA_NowCast.ranges.PM10_24H),
                },
            },
            CO_8H: {
                UNIT: 'PARTS_PER_MILLION',
                // 28 g/mol
                PPX_TO_XGM3: 1.14,
                RANGES: {
                    MIN: this.Configs.EPA_NowCast.ranges.CO_8H.GOOD,
                    MAX: this.Configs.EPA_NowCast.ranges.CO_8H.HAZARDOUS,
                    ALL: Object.values(this.Configs.EPA_NowCast.ranges.CO_8H),
                },
            },
            SO2: {
                UNIT: 'PARTS_PER_BILLION',
                // 64 g/mol
                PPX_TO_XGM3: 2.62,
                RANGES: {
                    MIN: this.Configs.EPA_NowCast.ranges.SO2.GOOD,
                    MAX: this.Configs.EPA_NowCast.ranges.SO2.UNHEALTHY,
                    ALL: Object.values(this.Configs.EPA_NowCast.ranges.SO2),
                },
            },
            SO2_24H: {
                UNIT: 'PARTS_PER_BILLION',
                PPX_TO_XGM3: -1,
                RANGES: {
                    MIN: this.Configs.EPA_NowCast.ranges.SO2_24H.VERY_UNHEALTHY,
                    MAX: this.Configs.EPA_NowCast.ranges.SO2_24H.HAZARDOUS,
                    ALL: Object.values(this.Configs.EPA_NowCast.ranges.SO2_24H),
                },
            },
            // NOT FOR CALCULATION
            //
            // EPA strengthened the primary standard for SO2 in 2010.
            // Because there was not enough health information to inform changing the upper end of the AQI for SO2,
            // the upper end continues to use the 24-hour average SO2 concentration.
            // The lower end of the AQI uses the daily max 1-hour SO2 concentration.
            //
            // If you have a daily max 1-hour SO2 concentration below 305 ppb,
            // then use the breakpoints in Table 6 to calculate the AQI value.
            //
            // If you have a 24-hour average SO2 concentration greater than or equal to 305 ppb,
            // then use the breakpoints in Table 6 to calculate the AQI value.
            // If you have a 24-hour value in this range,
            // it will always result in a higher AQI value than a 1-hour value would.
            //
            // On rare occasions, you could have a day where the daily max 1-hour concentration is at or above 305 ppb
            // but when you try to use the 24-hour average to calculate the AQI value,
            // you find that the 24-hour concentration is not above 305 ppb.
            // If this happens, use 200 for the lower and upper AQI breakpoints (ILo and IHi) in Equation 1
            // to calculate the AQI value based on the daily max 1-hour value.
            // This effectively fixes the AQI value at 200 exactly,
            // which ensures that you get the highest possible AQI value associated with your 1-hour concentration
            // on such days.
            SO2_MAX_1H: {
                UNIT: 'PARTS_PER_BILLION',
                PPX_TO_XGM3: -1,
                RANGES: {
                    MIN: this.Configs.EPA_NowCast.ranges.SO2_24H.VERY_UNHEALTHY,
                    MAX: Number.MAX_VALUE,
                    ALL: [{
                        AQI: { LOWER: 200, UPPER: 200 },
                        AMOUNT: {
                            LOWER: this.Configs.EPA_NowCast.ranges.SO2_24H.VERY_UNHEALTHY.AMOUNT.LOWER,
                            UPPER: Number.MAX_VALUE,
                        },
                    }],
                },
            },
            NO2: {
                UNIT: 'PARTS_PER_BILLION',
                // 46 g/mol
                PPX_TO_XGM3: 1.88,
                RANGES: {
                    MIN: this.Configs.EPA_NowCast.ranges.NO2.GOOD,
                    MAX: this.Configs.EPA_NowCast.ranges.NO2.HAZARDOUS,
                    ALL: Object.values(this.Configs.EPA_NowCast.ranges.NO2),
                },
            },
        },
    },
};
this.Configs.WAQI_InstantCast.ranges = {
    OZONE: {
        GOOD: {
            AQI: this.Configs.EPA_NowCast.categories.GOOD.RANGE,
            AMOUNT: { LOWER: 0, UPPER: 61.5 },
        },
        MODERATE: {
            AQI: this.Configs.EPA_NowCast.categories.MODERATE.RANGE,
            AMOUNT: { LOWER: 62.5, UPPER: 100.5 },
        },
        UNHEALTHY_FOR_SENSITIVE: {
            AQI: this.Configs.EPA_NowCast.categories.UNHEALTHY_FOR_SENSITIVE.RANGE,
            AMOUNT: { LOWER: 101.5, UPPER: 151.5 },
        },
        UNHEALTHY: {
            AQI: this.Configs.EPA_NowCast.categories.UNHEALTHY.RANGE,
            AMOUNT: { LOWER: 152.5, UPPER: 204 },
        },
        VERY_UNHEALTHY: {
            AQI: this.Configs.EPA_NowCast.categories.VERY_UNHEALTHY.RANGE,
            AMOUNT: { LOWER: 205, UPPER: 404 },
        },
        HAZARDOUS: {
            AQI: this.Configs.EPA_NowCast.categories.HAZARDOUS.RANGE,
            AMOUNT: { LOWER: 405, UPPER: 605 },
        },
    },
};
this.Configs.WAQI_InstantCast = {
    ...this.Configs.WAQI_InstantCast, ...{
        "scale": this.Configs.EPA_NowCast.scale,
        SIGNIFICANT_LEVEL: this.Configs.EPA_NowCast.SIGNIFICANT_LEVEL,

        AQI_CATEGORIES: this.Configs.EPA_NowCast.AQI_CATEGORIES,
        "pollutants": {
            ...this.Configs.EPA_NowCast.pollutants,
            OZONE: {
                UNIT: 'PARTS_PER_BILLION',
                PPX_TO_XGM3: this.Configs.EPA_NowCast.pollutants.OZONE.PPX_TO_XGM3,
                RANGES: {
                    MIN: this.Configs.WAQI_InstantCast.ranges.OZONE.GOOD,
                    MAX: this.Configs.WAQI_InstantCast.ranges.OZONE.HAZARDOUS,
                    ALL: Object.values(this.Configs.WAQI_InstantCast.ranges.OZONE),
                },
            },
            PM2_5: this.Configs.EPA_NowCast.pollutants.PM2_5_24H,
            PM10: this.Configs.EPA_NowCast.pollutants.PM10_24H,
            CO: this.Configs.EPA_NowCast.pollutants.CO_8H,
            OZONE_8H: undefined,
            PM2_5_24H: undefined,
            PM10_24H: undefined,
            CO_8H: undefined,
            SO2_24H: undefined,
        },
    },
}
