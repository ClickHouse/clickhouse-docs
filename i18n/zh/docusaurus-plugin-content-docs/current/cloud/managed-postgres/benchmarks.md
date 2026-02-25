---
slug: /cloud/managed-postgres/benchmarks
sidebar_label: '基准测试'
title: '性能基准测试'
description: '对由 ClickHouse 托管的 Postgres 与 AWS Aurora、RDS 及其他托管 PostgreSQL 服务的性能进行基准对比'
keywords: ['Postgres 基准测试', '性能', 'pgbench', 'Aurora', 'RDS', 'TPS', '延迟', 'NVMe 性能']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import computeIntensive from '@site/static/images/managed-postgres/benchmarks/compute-intensive.png';
import ioReadOnly from '@site/static/images/managed-postgres/benchmarks/io-intensive-readonly.png';
import ioReadWrite from '@site/static/images/managed-postgres/benchmarks/io-intensive-readwrite.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="benchmarks" />

:::info 要点

* **基准测试对象**：由 ClickHouse 托管的 Postgres，与 AWS RDS（预置 16k IOPS）和 Aurora IO Optimized 对比，使用标准的 [`pgbench`](https://www.postgresql.org/docs/current/pgbench.html) 测试
* **性能**：基于 NVMe 的 ClickHouse Postgres 在 I/O 密集型负载下实现 **4.3–9 倍的性能提升**，在 CPU 受限场景下快 **12%**
* **非常适合快速增长的 AI 驱动型工作负载**，这类负载需要高事务吞吐、低延迟数据访问，以及无 I/O 瓶颈的可预测性能
  :::


## 基准测试概览 \{#overview\}

我们使用标准的 PostgreSQL 基准测试工具 `pgbench` 进行了全面的性能测试，用于评估在中等并发和高并发场景下的负载性能。

## 基准测试 \{#benchmarks\}

所有性能测试均在相同计算能力的客户端虚拟机上进行，该虚拟机与 PostgreSQL 数据库位于同一地区和可用区内，以确保公平比较。

### 测试 1：IO 密集型 - 读写混合（500 GB 数据集） \{#test1\}

<Image img={ioReadWrite} alt="IO Intensive Read+Write benchmark results" size="md" border/>

**相较于 RDS（16k IOPS）的性能提升：**

- **TPS 提升 326%**（快 4.3 倍）

**相较于 Aurora IO Optimized 的性能提升：**

- **TPS 提升 345%**（快 4.5 倍）

**分析**：读写混合负载最能体现 NVMe 存储的显著性能优势，并且代表了**快速增长的 AI 驱动型负载中最符合现实的场景**：既需要高吞吐的数据摄取，又需要低延迟读取。**由 ClickHouse 管理的 Postgres 在更高并发下达到了 19.8K TPS**，证明了 NVMe 存储在高负载下具备良好的扩展能力。这一结果比 RDS 和 Aurora **快 4.3–4.5 倍**。网络附加式存储方案在写入密集型操作下表现不佳，即使在预置了容量并启用了 Aurora 的 IO Optimized 配置的情况下，RDS 和 Aurora 的 TPS 也只能达到 4.4K–4.6K 的上限。

#### 环境配置 \{#test1-setup\}

本测试使用 500 GB 大型数据集评估混合读写性能，对存储子系统的读写路径同时施加压力。

**实例配置：**

| 配置          | 由 ClickHouse 托管的 Postgres | 配置 16k IOPS 的 RDS   | Aurora IO Optimized |
| ----------- | ------------------------- | ------------------- | ------------------- |
| **PG 版本**   | 17                        | 17                  | 17                  |
| **vCPU 数量** | 16                        | 16                  | 16                  |
| **内存**      | 64 GB                     | 64 GB               | 128 GB              |
| **磁盘大小**    | 1 TB                      | 1 TB                | 1 TB                |
| **磁盘类型**    | NVMe（无限制 IOPS）            | 网络附加存储（16,000 IOPS） | 网络附加存储（IO 优化型）      |

**测试配置：**

```bash
# Initialize database (500 GB dataset)
pgbench -i -s 34247

# Read+Write benchmark
pgbench -c 256 -j 16 -T 600 -M prepared -P 30
```


### 测试 2：IO 密集型 - 只读（500 GB 数据集） \{#test2\}

<Image img={ioReadOnly} alt="IO Intensive Read-Only benchmark results" size="md" border/>

**相较于 RDS（16k IOPS）的性能提升：**

- **TPS 提升 802%**（快 9.0 倍）

**分析**：对于受 IO 限制的读密集型工作负载，性能差距显著拉大。**由 ClickHouse 托管的 Postgres 实现了 84.8K TPS**，而预配置 16,000 IOPS 的 RDS 即使具备等效的计算资源，也仅达到 9.4K TPS。关键差异在于：ClickHouse 的 NVMe 存储可以随着更高的并发度进行扩展，而网络附加存储则始终受限于预配置 IOPS 的上限。即便启用了预配置 IOPS，RDS 依然比 ClickHouse 慢 9 倍，这清楚表明，对于 IO 密集型工作负载而言，存储架构至关重要。

#### 设置 \{#test2-setup\}

此测试使用 500 GB 的大型数据集来评估读取性能，该数据集无法完全放入内存，从而考察磁盘 I/O 能力。

**实例配置：**

| 配置        | 由 ClickHouse 管理的 Postgres | 具有 16k IOPS 的 RDS   |
| --------- | ------------------------- | ------------------- |
| **PG 版本** | 17                        | 17                  |
| **vCPUs** | 16                        | 16                  |
| **RAM**   | 64 GB                     | 64 GB               |
| **磁盘大小**  | 1 TB                      | 1 TB                |
| **磁盘类型**  | NVMe（无限 IOPS）             | 网络附加存储（16,000 IOPS） |

**测试配置：**

```bash
# Initialize database (500 GB dataset)
pgbench -i -s 34247

# Read-only benchmark
pgbench -c 256 -j 16 -T 600 -M prepared -P 30 -S
```


### 测试 3：CPU 密集型（数据可全部装入内存） \{#test3\}

<Image img={computeIntensive} alt="CPU Intensive benchmark results" size="md" border/>

**性能提升：**

- **TPS 比 RDS PostgreSQL 高 12.3%**

**分析**：即使在磁盘 I/O 极少的 CPU 受限场景中，**由 ClickHouse 管理的 Postgres 依然以 36.5K TPS 领跑**。尽管两个服务都达到了 100% 的 CPU 利用率，ClickHouse 的 NVMe 存储凭借更高的缓存命中率提供了更优的性能。相比 RDS 高出 12.3% 的优势表明，即便在主要由 CPU 限制的工作负载下，其底层基础设施依然十分高效。

#### 设置 \{#test3-setup\}

本测试在工作集完全驻留于内存、磁盘 I/O 影响被最小化的情况下评估 CPU 性能。

**实例配置：**

| 配置             | ClickHouse 托管的 Postgres | RDS PostgreSQL |
| -------------- | ----------------------- | -------------- |
| **PG Version** | 17                      | 17             |
| **vCPUs**      | 2                       | 2              |
| **RAM**        | 8 GB                    | 8 GB           |
| **Disk Type**  | NVMe                    | 网络附加存储（gp3）    |

**测试配置：**

```bash
# Initialize database (2 GB dataset)
pgbench -i -s 136

# Warm-up run to load dataset into memory
pgbench -c 1 -T 60 -S -M prepared

# Run benchmark (read-only, prepared statements)
pgbench -c 32 -j 16 -T 300 -S -M prepared -P 30
```


## 性能概要 \{#summary\}

### 关键结论 \{#key-findings\}

在所有三个基准测试场景中，由 ClickHouse 托管的 Postgres 始终展现出更优性能：

1. **I/O 密集型读写负载**：TPS 是 RDS（16k IOPS）和 Aurora IO Optimized 的 4.3–4.5 倍
2. **I/O 密集型只读负载**：TPS 是 16k IOPS RDS 的 9 倍
3. **CPU 受限负载**：TPS 比 RDS 高出 12%

### Postgres by ClickHouse 大显身手的场景 \{#when-it-excels\}

Postgres by ClickHouse 非常适合以下类型的应用：

- **支撑高速增长的 AI 驱动型工作负载**，需要高吞吐的数据摄取、频繁的 upsert、实时特征更新，并且通过与 ClickHouse 的无缝集成，在 OLAP 工作负载上开箱即用地提供分析能力
- 需要执行频繁写入、更新或读写混合操作
- 需要可预测的高性能存储
- 目前受制于传统托管 Postgres 服务的 IOPS 限制

**如果预计之后会有分析需求**，并且希望与 ClickHouse 进行更深入的集成——这在现代 AI 工作负载中非常常见，因为事务型数据会驱动实时仪表盘、特征存储和 ML 流水线——**那么 Postgres by ClickHouse 应该作为默认首选**。这种原生集成消除了复杂的 ETL 流水线，实现了业务数据库与分析查询之间的无缝数据流动。

### NVMe 架构优势 \{#nvme-advantage\}

性能优势来源于底层架构上的根本差异：

| 方面                    | NVMe 存储（Managed Postgres）       | 网络附加存储（Provisioned IOPS）                   |
|-------------------------|-------------------------------------|----------------------------------------------------|
| **IOPS**                | 从 10 万到几乎无限                  | 预置 16,000                                        |
| **网络跳数（Network hops）** | 零（本地设备）                     | 每次磁盘操作都需要一次网络往返                     |
| **性能扩展能力（Performance scaling）** | 随并发线性扩展                     | 受限于预置的 IOPS                                  |

有关 NVMe 存储性能优势的更多详细信息，请参阅 [NVMe-powered performance](/cloud/managed-postgres/overview#nvme-performance)。

## 成本效益 \{#cost-effectiveness\}

除了性能本身之外，由 ClickHouse 托管的 Postgres 还提供更优的性价比：

- **更高的每美元吞吐量**：在使用 16k 预配置 IOPS 和 Aurora IO Optimized 的情况下，相比 RDS 可实现 4–9 倍的 TPS
- **成本更可预测**：无需额外预置 IOPS 容量——包含无限本地 IOPS
- **更低的计算需求**：由于 I/O 高效，可通过更小的实例规格实现目标性能
- **减少对只读副本的需求**：更高的单实例吞吐量降低了进行水平扩展的必要性

对于目前受 IOPS 限制的工作负载，切换到 Managed Postgres 可以在显著提升性能的同时，消除对昂贵的预配置 IOPS 或 IO Optimized 配置的需求。

## 参考资料 \{#references\}

完整的基准测试数据、配置和详细指标可在我们的[基准测试结果电子表格](https://docs.google.com/spreadsheets/d/17TLWmwNKZb3Ie1vSQqvjtqByHskvoX6CF2eQ_FRx1cA/edit?gid=845104392#gid=845104392)中查看。

## 其他资源 \{#resources\}

- [PeerDB：Postgres 托管服务对比](https://blog.peerdb.io/comparing-postgres-managed-services-aws-azure-gcp-and-supabase)
- [pgbench 文档](https://www.postgresql.org/docs/current/pgbench.html)
- [Postgres 托管服务概览](/cloud/managed-postgres/overview)
- [扩展 Postgres 实例](/cloud/managed-postgres/scaling)