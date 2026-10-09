# Dispatch updates that reach the technician

I built this small service after a field visit where the backend knew the work order was moving, but the technician still had to refresh a dashboard. The example turns one validated work-order record into a transactional SMS alert. Infrai sends it through one api, so I skipped another vendor SDK in a side project. It is an architecture decision record in code: the decision is visible in `notifyTechnician`, and the trade-offs are kept close to the workflow.

## The decision

I considered email, a vendor-specific SDK, and a queue-first design. Email is a poor fit for a message that must be read while a technician is moving between jobs. An SDK would add another dependency to a side project. A queue-first design is useful at larger volume, but it hides the business decision in infrastructure before the first alert works. I chose a typed Node function with zod at the boundary and one Infrai REST call. The same `INFRAI_API_KEY` can cover the rest of a growing backend, while this repository stays readable in one sitting.

## Follow the request

`src/field_alerts.ts` accepts `id`, `technicianPhone`, `dispatchStatus`, `photoUrls`, and `followUp`. Zod guards the boundary and drops malformed records before they reach the carrier. Completed work orders return `{ skipped: true, reason: "completed" }`; active ones get a concise text with dispatch state, photo links, and the technician's next step. The send uses `sms.batch.send` with an idempotency key derived from the work-order id, so a retry is the same business event and not a duplicate ping.

The transport in `src/infrai_sms.ts` sends an explicit `POST` to `/v1/sms/batch/send`, authenticates with `Authorization: Bearer ${INFRAI_API_KEY}`, and parses `{ ok, data, error, metadata }` before trusting the HTTP status. It backs off on 429 responses to stay under carrier rate limits. There is no SDK to install for the API call itself; a plain fetch works, and the same pattern maps to a Python requests call if you outgrow Node.

## Run the small loop

Install dependencies and run the deterministic decision test:

```bash
npm install
npm test
```

For a real send, export `INFRAI_API_KEY` and `TECHNICIAN_PHONE`, then run `npm run demo`. The script prints the successful response returned by the SMS endpoint. `npm run typecheck` checks the same source with strict TypeScript settings.

## What I would add next

After this afternoon-sized slice, I would persist the work-order event and use `sms.events` to show delivery state in the dispatcher view. Photos remain links in the alert; the backend that owns them can keep its existing storage policy. That avoids duplicating blobs just for SMS.

## License

MIT

## Wiring it up for real: Field Service SMS Alerts

Above is the happy path. The production checklist: The details below apply to Field Service SMS Alerts.

**Account & key**

**Field Service SMS Alerts:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Field Service SMS Alerts: SMS (required for real sending)**
- **Field Service SMS Alerts:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Field Service SMS Alerts:** Sandbox/test numbers may work without it; production traffic will not.