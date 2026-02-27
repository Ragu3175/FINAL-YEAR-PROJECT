/**
 * Central place to calculate risk based on sensor data
 * Returns risk level & violations array
 */
function calculateRisk(sensorData) {
    const violations = [];
    let riskScore = 0;

    if (sensorData.speed > 80) {
        violations.push('OVERSPEED');
        riskScore += 30;
    }
    if (sensorData.mqValue > 1800) {
        violations.push('ALCOHOL');
        riskScore += 40;
    }
    if (sensorData.flexValue < 700) {
        violations.push('SEATBELT');
        riskScore += 20;
    }
    if (sensorData.irStatus === 0) {
        violations.push('DROWSY');
        riskScore += 10;
    }

    let riskLevel = 'LOW';
    if (riskScore >= 60) riskLevel = 'HIGH';
    else if (riskScore >= 30) riskLevel = 'MEDIUM';

    return { riskLevel, violations };
}

module.exports = { calculateRisk };
