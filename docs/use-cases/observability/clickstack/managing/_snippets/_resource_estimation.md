When deploying ClickStack, provision compute to cover two independent workloads: **ingest** and **query**.

| Workload | Estimated resources |
|----------|---------------|
| **Ingest** | 1 vCPU per 10 MB/s of sustained ingest throughput |
| **Query** | 1 vCPU per 1 QPS and per 10 MB/s of sustained ingest throughput |

Assumptions:

- A **10x compression ratio** for storage - typically conservative for logs and traces.
- We assume most queries occur over recent data, with a mean lookback window of six hours, with a normal distribution and a standard deviation of one hour on either side. Users may wish to provision dedicated compute to query older data. In ClickHouse Cloud this can be idle (thus not incuring costs) when not in use.
- While query compute can be scaled independently of ingest compute, it remains intrinsically linked to ingest volume. We assume as ingest increases, data density grows, resulting in larger scan volumes at query time and consequently higher query compute requirements.

:::note
These values are **estimates only** and should be used as an initial baseline. Actual requirements depend on query complexity, concurrency, retention policies, and variance in ingestion throughput. Always monitor resource usage and scale as needed.
:::

The following table provides example sizings based on increasing ingest throughput in megabytes per second, alongside the corresponding data volumes in terabytes per month. This assumes a sustained average of **3 QPS** from ClickStack across all query types (search, dashboards, alerting). 

| MB/s | TB/month | Ingest CPUs | Query CPUs | Total CPUs | Total Storage (per month) (GB) |
|-----:|--------:|------------:|-----------:|-----------:|-------------:|
| 10 | 25.92 | 1 | 3 | 4 | 2,592 |
| 20 | 51.84 | 2 | 6 | 8 | 5,184 |
| 50 | 129.6 | 5 | 15 | 20 | 12,960 |
| 100 | 259.2 | 10 | 30 | 40 | 25,920 |
| 200 | 518.4 | 20 | 60 | 80 | 51,840 |
| 500 | 1,296 | 50 | 150 | 200 | 129,600 |
| 1000 | 2,592 | 100 | 300 | 400 | 259,200 |
