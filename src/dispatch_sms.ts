import { notifyTechnician } from "./field_alerts.js";

const phone = process.env.TECHNICIAN_PHONE;
if (!phone) throw new Error("TECHNICIAN_PHONE is required");
const result = await notifyTechnician({
  id: "WO-1042",
  technicianPhone: phone,
  dispatchStatus: "en_route",
  photoUrls: ["https://example.com/photos/WO-1042-before.jpg"],
  followUp: "Call dispatch after the panel is replaced.",
});
console.log(JSON.stringify(result, null, 2));
