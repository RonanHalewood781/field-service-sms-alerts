import assert from "node:assert/strict";
import { alertText, notifyTechnician } from "../src/field_alerts.js";

const order = { id: "WO-7", technicianPhone: "+15551234567", dispatchStatus: "on_site" as const, photoUrls: ["https://example.com/p.jpg"], followUp: "Upload the closing photo." };
assert.match(alertText(order), /WO-7 is on_site/);
assert.match(alertText(order), /closing photo/);
const completed = await notifyTechnician({ ...order, dispatchStatus: "completed" });
assert.deepEqual(completed, { skipped: true, reason: "completed" });
console.log("field alert decision test passed");
