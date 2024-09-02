const convert = (unit, unitToConvert, amount, ppxToXGM3Value) => {
    if (amount < 0) {
        return -1;
    }

    switch (unit) {
        case 'PARTS_PER_MILLION':
            switch (unitToConvert) {
                case 'PARTS_PER_MILLION':
                    return amount;
                case 'PARTS_PER_BILLION':
                    return amount * 1000;
                case 'MILLIGRAMS_PER_CUBIC_METER':
                    return amount * ppxToXGM3Value;
                case 'MICROGRAMS_PER_CUBIC_METER': {
                    const inPpb = convert(unit, 'PARTS_PER_BILLION', amount, ppxToXGM3Value);
                    return inPpb * ppxToXGM3Value;
                }
                default:
                    return -1;
            }
        case 'PARTS_PER_BILLION':
            switch (unitToConvert) {
                case 'PARTS_PER_BILLION':
                    return amount;
                case 'PARTS_PER_MILLION':
                    return amount * 0.001;
                case 'MILLIGRAMS_PER_CUBIC_METER': {
                    const inPpm = convert(unit, 'PARTS_PER_MILLION', amount, ppxToXGM3Value);
                    return inPpm * ppxToXGM3Value;
                }
                case 'MICROGRAMS_PER_CUBIC_METER':
                    return amount * ppxToXGM3Value;
                default:
                    return -1;
            }
        case 'MILLIGRAMS_PER_CUBIC_METER':
            switch (unitToConvert) {
                case 'MILLIGRAMS_PER_CUBIC_METER':
                    return amount;
                case 'MICROGRAMS_PER_CUBIC_METER':
                    return amount * 1000;
                case 'PARTS_PER_MILLION':
                    return amount / ppxToXGM3Value;
                case 'PARTS_PER_BILLION': {
                    const inUgM3 = convert(unit, 'MICROGRAMS_PER_CUBIC_METER', amount, ppxToXGM3Value);
                    return inUgM3 / ppxToXGM3Value;
                }
                default:
                    return -1;
            }
        case 'MICROGRAMS_PER_CUBIC_METER':
            switch (unitToConvert) {
                case 'MICROGRAMS_PER_CUBIC_METER':
                    return amount;
                case 'MILLIGRAMS_PER_CUBIC_METER':
                    return amount * 0.001;
                case 'PARTS_PER_MILLION': {
                    const inMgM3 = convert(unit, 'MILLIGRAMS_PER_CUBIC_METER', amount, ppxToXGM3Value);
                    return inMgM3 / ppxToXGM3Value;
                }
                case 'PARTS_PER_BILLION':
                    return amount / ppxToXGM3Value;
                default:
                    return -1;
            }
        default:
            return -1;
    }
};

export default { convert };
