import { z } from "zod";
import { sendSmsBatch } from "./infrai_sms.js";

export const workOrderSchema = z.object({
  id: z.string().min(1),
  technicianPhone: z.string().min(7),
  dispatchStatus: z.enum(["assigned", "en_route", "on_site", "completed"]),
  photoUrls: z.array(z.string().url()).default([]),
  followUp: z.string().min(1),
});
export type WorkOrder = z.infer<typeof workOrderSchema>;

export function alertText(order: WorkOrder): string {
  const photoLine = order.photoUrls.length ? ` Photos: ${order.photoUrls.join(", ")}` : "";
  return `Work order ${order.id} is ${order.dispatchStatus}.${photoLine} Follow-up: ${order.followUp}`;
}

export async function notifyTechnician(input: unknown): Promise<unknown> {
  const order = workOrderSchema.parse(input);
  if (order.dispatchStatus === "completed") return { skipped: true, reason: "completed" };
  return sendSmsBatch({ messages: [{ to: order.technicianPhone, text: alertText(order) }] }, `work-order-${order.id}`);
}
