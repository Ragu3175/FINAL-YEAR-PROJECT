/**
 * Detects if an accident occurred based on IMU data
 * @param {Object} sensorData - {accelX, accelY, accelZ, gyroX, gyroY, gyroZ}
 */
function detectAccident(sensorData) {
    const { accelX, accelY, accelZ, gyroX, gyroY, gyroZ } = sensorData;

    // Calculate Accel magnitude (exclude Z as jerks are mostly vertical)
    const horizontalAccel = Math.sqrt(accelX ** 2 + accelY ** 2);
    const totalAccel = Math.sqrt(accelX ** 2 + accelY ** 2 + accelZ ** 2);

    // Calculate Gyro magnitude
    const gyroMag = Math.sqrt(gyroX ** 2 + gyroY ** 2 + gyroZ ** 2);

    // Indian Road Jerk Filter:
    // 1. Sudden vertical spikes (Z) without horizontal impact or rotation are likely jerks/potholes.
    // 2. Accidents typically involve:
    //    a. Massive horizontal impact (> 4G = ~39 m/s^2)
    //    b. Rollover (high gyro > 10 rad/s)
    //    c. Significant Z impact (> 6G) COMBINED with either horizontal impact or rotation.

    const isCrushingImpact = horizontalAccel > 35.0; // ~3.5G horizontal
    const isExtremeRollover = gyroMag > 12.0;       // ~680 deg/s
    const isMajorVerticalImpact = totalAccel > 55.0 && (horizontalAccel > 15.0 || gyroMag > 5.0);

    return isCrushingImpact || isExtremeRollover || isMajorVerticalImpact;
}

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
    // Alcohol detection (MQ3-MQ135)
    if (sensorData.mqValue > 1800 && sensorData.mqValue <= 3000) {
        violations.push('ALCOHOL');
    }
    // Smoking detection
    if (sensorData.mqValue > 3000) {
        violations.push('SMOKING');
    }
    // Seatbelt detection (Flex Sensor)
    if (sensorData.flexValue < 700) {
        violations.push('SEATBELT');
    }
    // Drowsiness detection (IR Sensor)
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
        riskLevel = 'MEDIUM';
    } else if (majorViolationsCount === 1) {
        riskLevel = 'ABOVE_MEDIUM';
    } else if (majorViolationsCount >= 2 || totalCount >= 3) {
        riskLevel = 'HIGH';
    }

    return { riskLevel, violations };
}

module.exports = { calculateRisk, detectAccident };
