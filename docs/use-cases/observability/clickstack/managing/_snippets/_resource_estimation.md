When deploying **Managed ClickStack**, it is important to provision sufficient compute resources to handle both ingestion and query workloads. The estimates below provide a **baseline starting point** based on the volume of observability data you plan to ingest.

| Monthly ingest volume | Recommended compute |
|-----------------------|---------------------|
| < 10 TB / month       | 2 vCPU × 3 replicas |
| 10–50 TB / month      | 4 vCPU × 3 replicas |
| 50–100 TB / month     | 8 vCPU × 3 replicas |
| 100–500 TB / month   | 30 vCPU × 3 replicas |
| 1 PB+ / month        | 59 vCPU × 3 replicas |

These recommendations are based on the following assumptions:

- Data volume refers to **uncompressed ingest volume** per month and applies to both logs and traces.
- Query patterns are typical for observability use cases, with most queries targeting **recent data**, usually the last 24 hours.
- Ingestion is relatively **uniform across the month**. If you expect bursty traffic or spikes, you should provision additional headroom.
- Storage is handled separately via ClickHouse Cloud object storage and isn't a limiting factor for retention. We assume data retained for longer periods is infrequently accessed.

More compute may be required for access patterns that regularly query longer time ranges, perform heavy aggregations, or support a high number of concurrent users.

Although two replicas can meet the CPU and memory requirements for a given ingestion throughput, we recommend using three replicas where possible to achieve the same total capacity and improve service redundancy.

:::note
These values are **estimates only** and should be used as an initial baseline. Actual requirements depend on query complexity, concurrency, retention policies, and variance in ingestion throughput. Always monitor resource usage and scale as needed.
:::
