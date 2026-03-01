/**
 * Central place to calculate risk based on sensor data
 * Returns risk level & violations array
 */
function calculateRisk(sensorData) {
    const violations = [];

    // 1. Detect Violations
    if (sensorData.speed > 80) {
        violations.push('OVERSPEED');
    }
    // Alcohol detection
    if (sensorData.mqValue > 1800 && sensorData.mqValue <= 3000) {
        violations.push('ALCOHOL');
    }
    // Smoking detection (simulated via higher MQ value or could be a separate field)
    if (sensorData.mqValue > 3000) {
        violations.push('SMOKING');
    }
    // Seatbelt detection
    if (sensorData.flexValue < 700) {
        violations.push('SEATBELT');
    }
    // Drowsiness detection
    if (sensorData.irStatus === 0) {
        violations.push('DROWSY');
    }

    // 2. Calculate Risk Level
    let riskLevel = 'LOW';
    const totalCount = violations.length;
    const hasSeatbeltViolation = violations.includes('SEATBELT');
    const majorViolationsCount = hasSeatbeltViolation ? totalCount - 1 : totalCount;

    if (totalCount === 0) {
        riskLevel = 'LOW';
    } else if (totalCount === 1 && hasSeatbeltViolation) {
        // Only seatbelt is not worn -> MEDIUM
        riskLevel = 'MEDIUM';
    } else if (majorViolationsCount === 1) {
        // Exactly one major violation (regardless of seatbelt) -> ABOVE_MEDIUM
        riskLevel = 'ABOVE_MEDIUM';
    } else if (majorViolationsCount >= 2 || totalCount >= 3) {
        // Multiple major violations or many minor ones -> HIGH
        riskLevel = 'HIGH';
    }

    return { riskLevel, violations };
}

module.exports = { calculateRisk };
