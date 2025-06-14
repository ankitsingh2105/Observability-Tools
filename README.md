# 🔍 Observability-Tools

This repo is a practical playground where I learned how to **monitor, log, and measure** what's actually happening inside a Node.js (Express) app using some of the best tools out there.

---

## 🧰 Tech Stack / Tools Used

- **Express.js** – The backend app we’re monitoring.
- **Prometheus** – For collecting and storing metrics.
- **Grafana** – For visualising those metrics beautifully.
- **Loki** – For log aggregation.
- **Winston** – For logging in Node.js.
- **winston-loki** – The Loki transport for Winston.
- **prom-client** – Node.js Prometheus client.

---

## 🚀 What I Learned

### 🧠 Prometheus + Grafana
- Learned how to expose custom metrics using `prom-client`.
- Used **Histograms** to track API response times.
- Created **Counters** to track the number of incoming requests.
- Built `/metrics` endpoint and hooked it up to Prometheus.
- Visualised everything in Grafana with live updating panels.

### 📦 Loki + Winston
- Used `winston-loki` to send logs to Loki.
- Learned that `labels` like `{ job: "express-app" }` are *must-haves* for querying logs in Grafana.
- Realised you can’t filter logs by route in the logger config, so I did it manually in middleware.

### ⚠️ Realizations (a.k.a “shit I ran into”)
- `route:` is not a thing in `winston-loki`. Don’t try it — it won’t work.
- Querying logs in Grafana won’t work without proper **labels**.
- Prometheus logs everything — you need to **ignore `/metrics`** route or you’ll pollute your own data.
- You can log only selected routes with a simple if-check. No magic config for that.

---

## 📊 Dashboard Metrics

| Metric | Description |
|--------|-------------|
| `custom_http_request_duration_seconds` | Histogram of request times |
| `custom_total_request_counter` | Counter of total HTTP requests |
| `sum(count_over_time(...))` | Used in Grafana to get total logs per minute |

---


