#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <TinyGPSPlus.h>
#include "HX711.h"

// ===== Wi-Fi Credentials =====
const char* ssid = "RAGU";
const char* password = "234567890";

// ===== Server URL (UPDATED) =====
// For local testing, use the IP of your computer. For deployment, use your domain/IP.
const char* serverUrl = "https://final-year-project-4yre.onrender.com/api/vehicle/update"; 
const char* deviceKey = "20d2d1ad663fc7988210ab7f8ecbc663"; // Get this from your Vehicle record in MongoDB

// ===== Pin Definitions =====
#define GPS_RX 16
#define GPS_TX 17
#define MQ3_PIN 35
#define IR_PIN 34
#define FLEX_PIN 32
#define HX_DT 19
#define HX_SCK 18

// ===== Objects =====
Adafruit_MPU6050 mpu;
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);
HX711 scale;

float calibration_factor = -7050.0;

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  Wire.begin(21, 22);
  Wire.setClock(100000);

  Serial.println("Connecting to Wi-Fi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi Connected!");
  Serial.println(WiFi.localIP());

  if (!mpu.begin()) {
    Serial.println("❌ MPU6050 not found!");
  } else {
    Serial.println("✅ MPU6050 ready.");
  }

  scale.begin(HX_DT, HX_SCK);
  scale.set_scale(calibration_factor);
  scale.tare();

  pinMode(IR_PIN, INPUT);
  Serial.println("System Ready...");
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  while (gpsSerial.available() > 0)
    gps.encode(gpsSerial.read());

  double lat = gps.location.isValid() ? gps.location.lat() : 0.0;
  double lon = gps.location.isValid() ? gps.location.lng() : 0.0;
  float speed = gps.speed.isValid() ? gps.speed.kmph() : 0.0;

  int mqAnalog = analogRead(MQ3_PIN);
  int irValue = digitalRead(IR_PIN);
  int flexValue = analogRead(FLEX_PIN);
  float weight = scale.get_units(5);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    // This header is REQUIRED for the backend to recognize your device
    http.addHeader("x-device-key", deviceKey);

    String payload = "{";
    payload += "\"latitude\":" + String(lat, 6) + ",";
    payload += "\"longitude\":" + String(lon, 6) + ",";
    payload += "\"speed\":" + String(speed, 2) + ",";
    payload += "\"accelX\":" + String(a.acceleration.x, 2) + ",";
    payload += "\"accelY\":" + String(a.acceleration.y, 2) + ",";
    payload += "\"accelZ\":" + String(a.acceleration.z, 2) + ",";
    payload += "\"gyroX\":" + String(g.gyro.x, 2) + ",";
    payload += "\"gyroY\":" + String(g.gyro.y, 2) + ",";
    payload += "\"gyroZ\":" + String(g.gyro.z, 2) + ",";
    payload += "\"irStatus\":" + String(irValue) + ",";
    payload += "\"mqValue\":" + String(mqAnalog) + ",";
    payload += "\"flexValue\":" + String(flexValue) + ",";
    payload += "\"weight\":" + String(weight, 2);
    payload += "}";

    int code = http.POST(payload);
    Serial.printf("Sent (%d): %s\n", code, payload.c_str());

    http.end();
  }

  delay(1500);
}
