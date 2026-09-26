# Routeboard — Field Service Dispatch Board

A standalone demo dashboard for coordinating field-service work orders, technicians, and customer visits.

## Included

- Live dispatch board with Unassigned, En route, On site, and Completed lanes
- Search and priority filtering
- One-click job status updates and technician assignment
- New work-order form with scheduling, duration, priority, and notes
- Technician, customer, jobs, and weekly summary views
- Browser-local persistence so demo edits survive refreshes without a backend
- Responsive layout for desktop and smaller screens

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown by Vinext. For a production build:

```bash
npm run build
```

The app is intentionally self-contained and uses demo data. Each browser profile keeps its own changes in `localStorage` under `field-dispatch-jobs`.
