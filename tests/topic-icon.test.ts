import test from "node:test";
import assert from "node:assert/strict";
import { iconFor, siteIconNames } from "../src/icon-set";

test("industries and capabilities get specific icons, never a generic fallback", () => {
  assert.equal(iconFor("Retail and E-Commerce"), "bag");
  assert.equal(iconFor("Healthcare"), "health");
  assert.equal(iconFor("Logistics and Field Services"), "truck");
  assert.equal(iconFor("Finance and Fintech"), "bank");
  assert.equal(iconFor("AI Chatbot Development"), "ai");
  assert.equal(iconFor("REST API and Firebase integrations"), "api");
});

test("every technology chip gets an icon from the shared set", () => {
  for (const name of ["Kotlin", "Java", "Android Studio", "Gradle", "Room", "Retrofit", "Material Design 3", "Firebase Firestore", "Google Maps SDK", "NFC APIs", "Analytics SDKs", "Payment gateway SDKs"]) {
    assert.ok(siteIconNames.includes(iconFor(name, "Languages & IDE")), name);
  }
  assert.equal(iconFor("Firebase Firestore"), "database");
  assert.equal(iconFor("Google Maps SDK"), "pin");
});
