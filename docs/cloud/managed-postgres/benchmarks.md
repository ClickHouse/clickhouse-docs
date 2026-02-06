---
slug: /cloud/managed-postgres/benchmarks
sidebar_label: 'Benchmarks'
title: 'Performance benchmarks'
description: 'Performance benchmarks comparing Postgres managed by ClickHouse with AWS Aurora, RDS, and other managed PostgreSQL services'
keywords: ['postgres benchmarks', 'performance', 'pgbench', 'aurora', 'rds', 'tps', 'latency', 'nvme performance']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import computeIntensive from '@site/static/images/managed-postgres/benchmarks/compute-intensive.png';
import ioRead-Only from '@site/static/images/managed-postgres/benchmarks/io-intensive-readonly.png';
import ioReadWrite from '@site/static/images/managed-postgres/benchmarks/io-intensive-readwrite.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="benchmarks" />

This page provides performance benchmark results comparing Postgres managed by ClickHouse against other popular managed PostgreSQL services, including AWS Aurora and RDS. These benchmarks demonstrate the performance advantages of NVMe-backed storage for different workload types.

## Benchmark overview {#overview}

We conducted comprehensive performance testing using `pgbench`, the standard PostgreSQL benchmarking tool, to evaluate workload performance under both moderate and high-concurrency scenarios.

## Benchmark setup {#setup}

All performance tests were conducted using a client VM with the same compute capacity, collocated in the same region and availability zone as the PostgreSQL database to ensure fair comparison.

We performed three distinct benchmark tests:

1. **CPU Intensive** (data fits in memory)
2. **IO Intensive - Read-Only** (large dataset, read-only queries)
3. **IO Intensive - Read+Write** (large dataset, mixed read/write operations)

### Test 1: CPU Intensive - Data fits in memory {#test1-config}

This test evaluates CPU performance when the working set fits entirely in memory, minimizing disk I/O impact.

**Instance configuration:**

| Configuration  | Postgres managed by ClickHouse | RDS PostgreSQL         |
|----------------|--------------------------------|------------------------|
| **PG Version** | 17                             | 17                     |
| **vCPUs**      | 2                              | 2                      |
| **RAM**        | 8 GB                           | 8 GB                   |
| **Disk Type**  | NVMe                           | Network-attached (gp3) |
| **HA**         | Not enabled                    | Not enabled            |

**Test configuration:**

```bash
# Initialize database (2 GB dataset)
pgbench -i -s 136

# Warm-up run to load dataset into memory
pgbench -c 1 -T 60 -S -M prepared

# Run benchmark (read-only, prepared statements)
pgbench -c 32 -j 16 -T 300 -S -M prepared -P 30
```

- `-c 32`: 32 concurrent client connections
- `-j 16`: 16 worker threads
- `-T 300`: Run for 300 seconds (5 minutes)
- `-S`: SELECT-only mode (read-only)
- `-M prepared`: Use prepared statements
- `-P 30`: Progress report every 30 seconds

### Test 2: IO Intensive - Read-Only (500 GB dataset) {#test2-config}

This test evaluates read performance with a large 500 GB dataset that doesn't fit in memory, stressing disk I/O capabilities.

**Instance configuration:**

| Configuration  | Postgres managed by ClickHouse | RDS with 16k IOPS              |
|----------------|--------------------------------|--------------------------------|
| **PG Version** | 17                             | 17                             |
| **vCPUs**      | 16                             | 16                             |
| **RAM**        | 64 GB                          | 64 GB                          |
| **Disk Size**  | 1 TB                           | 1 TB                           |
| **Disk Type**  | NVMe (unlimited IOPS)          | Network-attached (16,000 IOPS) |
| **HA**         | Not enabled                    | Not enabled                    |

**Test configuration:**

```bash
# Initialize database (500 GB dataset)
pgbench -i -s 34247

# Read-only benchmark
pgbench -c 256 -j 16 -T 600 -M prepared -P 30 -S
```

- `-c 256`: 256 concurrent client connections
- `-j 16`: 16 worker threads
- `-T 600`: Run for 600 seconds (10 minutes)
- `-M prepared`: Use prepared statements
- `-P 30`: Progress report every 30 seconds
- `-S`: SELECT-only mode (read-only)

### Test 3: IO Intensive - Read+Write (500 GB dataset) {#test3-config}

This test evaluates mixed read/write performance with a large 500 GB dataset, stressing both read and write paths of the storage subsystem.

**Instance configuration:**

| Configuration  | Postgres managed by ClickHouse | RDS with 16k IOPS              | Aurora IO Optimized             |
|----------------|--------------------------------|--------------------------------|---------------------------------|
| **PG Version** | 17                             | 17                             | 17                              |
| **vCPUs**      | 16                             | 16                             | 16                              |
| **RAM**        | 64 GB                          | 64 GB                          | 128 GB                          |
| **Disk Size**  | 1 TB                           | 1 TB                           | 1 TB                            |
| **Disk Type**  | NVMe (unlimited IOPS)          | Network-attached (16,000 IOPS) | Network-attached (IO Optimized) |
| **HA**         | Not enabled                    | Not enabled                    | Not enabled                     |

**Test configuration:**

```bash
# Initialize database (500 GB dataset)
pgbench -i -s 34247

# Read+Write benchmark
pgbench -c 256 -j 16 -T 600 -M prepared -P 30
```

- `-c 256`: 256 concurrent client connections
- `-j 16`: 16 worker threads
- `-T 600`: Run for 600 seconds (10 minutes)
- `-M prepared`: Use prepared statements
- `-P 30`: Progress report every 30 seconds

## Benchmark results {#results}

### Test 1: CPU Intensive (data fits in memory) {#test1-results}

When the working set fits entirely in RAM, this test primarily stresses CPU performance with minimal disk I/O.

<Image img={computeIntensive} alt="CPU Intensive benchmark results" size="lg" border/>

**Performance improvement:**
- **12.3% higher TPS** than RDS PostgreSQL

**Analysis**: Even in CPU-bound scenarios where disk I/O is minimal, **Postgres managed by ClickHouse led the pack with 36.5K TPS**. Despite both services hitting 100% CPU utilization, ClickHouse's NVMe storage delivered superior performance with better cache hit rates. The 12% advantage over RDS demonstrates the efficiency of the underlying infrastructure even when workloads are primarily CPU-bound.

### Test 2: IO Intensive - Read-Only (500 GB dataset) {#test2-results}

This test evaluates read performance with a large dataset that exceeds available memory, heavily stressing disk I/O subsystems.

<Image img={ioRead-Only} alt="IO Intensive Read-Only benchmark results" size="lg" border/>

**Performance improvement over RDS (16k IOPS):**
- **802% higher TPS** (9.0x faster)

**Analysis**: The performance gap widens dramatically for read-intensive workloads that exceed memory capacity. **Postgres managed by ClickHouse delivered 84.8K TPS**, while RDS with 16,000 provisioned IOPS achieved only 9.4K TPS despite having equivalent compute resources. The key difference: ClickHouse's NVMe storage scales with higher concurrency, while network-attached storage remains constrained by provisioned IOPS limits. Even with provisioned IOPS, RDS was still 9x slower than ClickHouse, demonstrating the critical importance of storage architecture for IO-intensive workloads.

### Test 3: IO Intensive - Read+Write (500 GB dataset) {#test3-results}

This test evaluates mixed read/write performance with a large dataset, stressing both read and write paths of the storage subsystem.

<Image img={ioReadWrite} alt="IO Intensive Read+Write benchmark results" size="lg" border/>

**Performance improvement over RDS (16k IOPS):**
- **326% higher TPS** (4.3x faster)

**Performance improvement over Aurora IO Optimized:**
- **345% higher TPS** (4.5x faster)

**Analysis**: Mixed read/write workloads showcase the most dramatic performance advantages of NVMe storage. **Postgres managed by ClickHouse achieved 19.8K TPS with higher concurrency**, demonstrating how NVMe storage scales effectively under load. This is **4.3-4.5x faster than RDS and Aurora**. Network-attached storage solutions struggled with write-heavy operations, with RDS and Aurora maxing out at 4.4K-4.6K TPS despite provisioned capacity and even with Aurora's IO Optimized configuration.

## Performance summary {#summary}

### Key findings {#key-findings}

Across all three benchmark scenarios, Postgres managed by ClickHouse consistently delivered superior performance:

1. **CPU-bound workloads**: 12% higher TPS than RDS
2. **IO-intensive read workloads**: 9x higher TPS compared to RDS with 16k IOPS
3. **IO-intensive read+write workloads**: 4.3-4.5x higher TPS compared to RDS (16k IOPS) and Aurora IO Optimized

### When Postgres by ClickHouse excels {#when-it-excels}

Postgres by ClickHouse is ideal for applications that:
- Require high transaction throughput (20K-85K TPS depending on workload and concurrency)
- Work with large datasets that exceed available memory
- Perform frequent writes, updates, or mixed read/write operations
- Need predictable, high-performance storage
- Are currently constrained by IOPS limits on traditional managed Postgres services

### NVMe architecture advantage {#nvme-advantage}

The performance advantage comes from the fundamental architectural difference:

| Aspect                  | NVMe Storage (Managed Postgres)     | Network-Attached Storage (Provisioned IOPS)        |
|-------------------------|-------------------------------------|----------------------------------------------------|
| **IOPS**                | 100k to virtually unlimited         | 16,000 provisioned                                 |
| **Network hops**        | Zero (local device)                 | Every disk operation requires network round trip   |
| **Performance scaling** | Scales linearly with concurrency    | Limited by provisioned IOPS                        |

For more details on the performance benefits of NVMe storage, see [NVMe-powered performance](/cloud/managed-postgres/overview#nvme-performance).

## Cost-effectiveness {#cost-effectiveness}

Beyond raw performance, Postgres managed by ClickHouse offers superior price-performance:

- **Higher throughput per dollar**: Achieve 4-9x more TPS compared to RDS with 16k provisioned IOPS and Aurora IO Optimized
- **Predictable costs**: No need to provision additional IOPS capacity—unlimited local IOPS included
- **Lower compute requirements**: Achieve target performance with smaller instance sizes due to efficient I/O
- **Reduced need for read replicas**: Higher single-instance throughput reduces need for horizontal scaling

For workloads currently constrained by IOPS limits, switching to Managed Postgres can eliminate the need for expensive provisioned IOPS or IO-optimized configurations while delivering significantly better performance.

## Running your own benchmarks {#running-your-own}

To reproduce these benchmarks or test with your own workload:

**Test 1: CPU Intensive (2 GB dataset)**

```bash
# Initialize
pgbench -i -s 136 postgres

# Warm-up run
pgbench -c 1 -T 60 -S -M prepared postgres

# Run benchmark
pgbench -c 32 -j 16 -T 300 -S -M prepared -P 30 postgres
```

**Test 2: IO Intensive - Read-Only (500 GB dataset)**

```bash
# Initialize (takes 1-4 hours depending on service)
pgbench -i -s 34247 postgres

# Read-only benchmark (high concurrency)
pgbench -c 256 -j 16 -T 600 -M prepared -P 30 -S postgres
```

**Test 3: IO Intensive - Read+Write (500 GB dataset)**

```bash
# Initialize (takes 1-4 hours depending on service)
pgbench -i -s 34247 postgres

# Read+Write benchmark (high concurrency)
pgbench -c 256 -j 16 -T 600 -M prepared -P 30 postgres
```

**Monitoring metrics:**
- Average TPS (transactions per second)
- CPU utilization percentage
- Disk IOPS (read and write separately)
- Cache hit rates

For additional workload testing:
- Adjust client count (`-c`) and worker threads (`-j`) to match your concurrency requirements
- Increase test duration (`-T`) for more stable long-running results
- Modify scale factor (`-s`) to test with different dataset sizes

## Conclusion {#conclusion}

These comprehensive `pgbench` benchmarks demonstrate that Postgres managed by ClickHouse delivers exceptional performance across diverse workload types. The NVMe-backed storage architecture provides:

- **Consistent advantages** even in CPU-bound scenarios (12% higher TPS than RDS)
- **Dramatic improvements** for IO-intensive read workloads (9x faster than RDS with 16k IOPS)
- **Superior write performance** for mixed read/write workloads (4.3-4.5x faster than RDS and Aurora IO Optimized)

The key distinction is the unlimited local NVMe IOPS that eliminates storage bottlenecks. While competing services with network-attached storage struggle at 4-9K TPS due to provisioned IOPS limits, Postgres managed by ClickHouse scales to 20-85K TPS depending on workload characteristics and concurrency levels. This translates to better resource utilization, lower costs, and the ability to handle demanding production workloads without over-provisioning.

For organizations running IO-intensive PostgreSQL workloads, the performance gains speak for themselves: faster queries, higher throughput, and predictable performance without the complexity of provisioning and managing IOPS capacity.

## References {#references}

The complete benchmark data, configurations, and detailed metrics are available in our [benchmark results spreadsheet](https://docs.google.com/spreadsheets/d/17TLWmwNKZb3Ie1vSQqvjtqByHskvoX6CF2eQ_FRx1cA/edit?gid=845104392#gid=845104392).

## Additional resources {#resources}

- [PeerDB: Comparing Postgres managed services](https://blog.peerdb.io/comparing-postgres-managed-services-aws-azure-gcp-and-supabase)
- [pgbench documentation](https://www.postgresql.org/docs/current/pgbench.html)
- [Managed Postgres overview](/cloud/managed-postgres/overview)
- [Scaling your Postgres instance](/cloud/managed-postgres/scaling)
