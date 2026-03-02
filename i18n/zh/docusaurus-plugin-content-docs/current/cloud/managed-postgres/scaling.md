---
slug: /cloud/managed-postgres/scaling
sidebar_label: '扩展'
title: '扩展'
description: '通过灵活的 VM 类型和独立的资源伸缩，对由 ClickHouse 管理的 Postgres 实例进行纵向扩容'
keywords: ['postgres 扩展', '纵向扩容', 'vm 类型', 'nvme 扩展', '实例类型', '性能扩展']
doc_type: '指南'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import instanceTypes from '@site/static/images/managed-postgres/instance-types.png';
import scalingSettings from '@site/static/images/managed-postgres/scaling-settings.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="scaling" />

托管 Postgres 提供灵活的扩展选项，以满足您的工作负载需求。借助 50 多种基于 NVMe 的实例类型可供选择，您可以在 CPU、内存和存储之间独立扩展，以针对特定用例优化性能和成本。


## 实例类型与灵活性 \{#instance-types\}

托管 Postgres 提供了广泛的实例类型选择，每种类型都针对不同的工作负载特征进行了优化：

- 提供 **50 多种实例类型**，覆盖计算型、内存型和存储优化型配置
- 所有实例类型均采用 **基于 NVMe 的存储**，实现稳定且高性能的磁盘 I/O
- **资源可独立伸缩**：可根据工作负载选择合适的 CPU、内存和存储组合

<Image img={instanceTypes} alt="Instance types" size="md" border/>

### 选择合适的实例类型 \{#choosing-instance\}

不同的工作负载适合不同的资源配置：

| 工作负载类型                                      | CPU   | 内存  | 存储   | 推荐实例                                   |
|---------------------------------------------------|--------|--------|---------|---------------------------------------------|
| **计算优化型**                                    | 高    | 中    | 中     | 计算优化型（高 vCPU 数量）                 |
| **内存优化型**（大型工作集）                      | 中    | 高    | 中     | 内存优化型（高内存与 CPU 比例）            |
| **存储优化型**（大型数据集、高 I/O 负载）        | 中    | 中    | 高     | 存储优化型（高 NVMe 容量）                 |

## 扩展的工作原理 \{#how-scaling-works\}

当你更改实例类型时，Managed Postgres 会执行纵向扩展操作，配置新的基础设施资源，并在尽可能短的停机时间内迁移你的数据库。

<Image img={scalingSettings} alt="Scaling Settings" size="md" border/>

### 扩容流程 \{#scaling-process\}

扩容工作流会从备份中启动一个新的备用实例，并执行受控故障转移：

1. **备用实例预配**：使用目标实例类型（CPU、内存和存储配置）创建一个新的备用实例

2. **从 S3 备份恢复**：通过从存储在 S3 中的最新备份进行恢复来初始化备用实例

3. **并行 WAL 回放**：备用实例使用由 [WAL-G](https://github.com/wal-g/wal-g) 提供支持的并行恢复机制，应用自备份以来的所有预写日志（WAL）更改
   - WAL-G 支持快速、并行化的恢复操作
   - WAL-G 的创建者在我们合作的 Ubicloud 团队中，从而确保了深厚的专业能力和优化

4. **复制追赶**：备用实例通过流式接收并应用持续产生的 WAL 更改来追上主实例

5. **故障转移**：一旦备用实例完全同步，通过受控故障转移将其提升为新的主实例
   - **这是唯一会导致停机的步骤**（约 30 秒）
   - 故障转移期间所有活动连接都会被中断
   - 故障转移完成后客户端必须重新连接

6. **旧实例退役**：故障转移完成后，对原始实例进行退役

### 扩容耗时 \{#scaling-duration\}

扩容所需的总时间主要取决于数据库的大小，以及需要从备份中回放的 WAL 数据量：

- **备份恢复**：将最新的完整备份从 S3 恢复到新实例所需的时间
- **WAL 回放**：自上次完整备份以来增量 WAL 变更的回放时间
- **并行恢复**：WAL-G 的并行恢复机制可显著加速整个过程

恢复时间可能从几分钟到数小时不等，但维护/停机时间非常短（仅约 30 秒）。

:::important[最小化停机时间]
无论整个扩容过程耗时多久，在故障切换期间，您的应用只会经历大约 30 秒的停机时间。所有恢复和追赶进度的工作都会在后台的备用实例上完成。
:::

### 使用 WAL-G 进行并行恢复 \{#parallel-restore\}

托管版 Postgres 使用 [WAL-G](https://github.com/wal-g/wal-g) 在扩缩操作期间加速备份恢复。值得一提的是，WAL-G 的创建者是我们合作伙伴 Ubicloud 团队的一员，为恢复流程带来了深厚的专业知识。

WAL-G 提供：

- **并行下载和解压缩**：从 S3 并行获取多个备份片段并同时解压缩
- **高效 WAL 回放**：在可能的情况下并行应用增量 WAL 变更
- **优化的流式传输**：直接从 S3 存储进行流式读取，无需中间副本
- **快速恢复**：尽管总耗时取决于数据规模，但并行化方案显著加快了整个过程

这些优化大幅降低了启动新备用实例所需的时间。更重要的是，恢复过程完全在后台进行——你的应用只会在短暂的约 30 秒故障转移窗口内经历停机时间。

### 启动扩容操作 \{#initiating-scaling\}

要为 Managed Postgres 实例扩容：

1. 转到实例的 **Settings**（设置）选项卡
2. 在 **Scaling**（扩容）部分向下滚动至 **Service size**（服务规格）
3. 选择目标实例类型
4. 检查更改并单击 “Apply changes”（应用更改）

## 扩展策略 \{#scaling-strategies\}

### 垂直扩容 \{#vertical-scaling\}

垂直扩容（更换实例类型）是 Managed Postgres 中调整资源的主要方式。此方式具有以下优势：

- **精细化控制**：从 50 多种实例类型中选择，以精细调节 CPU、内存和存储
- **工作负载优化**：选择针对特定工作负载（计算密集型、内存密集型或存储密集型）优化的配置
- **成本效益**：只为实际需要的资源付费，避免过度预留

### 用于横向扩展的只读副本 \{#read-replicas\}

对于读压力较大的工作负载，可以考虑使用[只读副本](/cloud/managed-postgres/read-replicas)来横向扩展读取能力：

- 将读取查询转移到专用的只读副本实例
- 每个只读副本都是完全独立的 Postgres 实例，拥有自己的计算和内存资源
- 只读副本从对象存储中以流式方式获取 WAL 变更，以实现高效复制

这种方式非常适合读写比高的应用程序，例如报表看板、分析查询或读密集型 API 端点。

### 面向 ClickHouse 集成的 CDC 扩缩容 \{#cdc-scaling\}

如果你使用 [ClickPipes](/cloud/managed-postgres/clickhouse-integration) 将数据复制到 ClickHouse，可以独立地对 CDC（变更数据捕获）管道进行扩缩容：

- 将 CDC worker 的 CPU 资源从 1 个核心扩展到最多 24 个核心
- 内存会自动按 CPU 核心数量的 4 倍进行扩展
- 通过 [ClickPipes OpenAPI](/integrations/clickpipes/postgres/scaling) 调整扩缩容配置

这样可以将复制吞吐量与 Postgres 实例资源解耦并单独优化。

## 自动扩缩容（路线图） \{#autoscaling\}

:::note[敬请期待]
Managed Postgres 的自动存储扩缩容功能已在规划中。该功能会在数据库数据量增长时自动提升实例规格，从而无需手动干预。
:::

## 其他资源 \{#resources\}

- [设置和配置](/cloud/managed-postgres/settings)
- [只读副本](/cloud/managed-postgres/read-replicas)
- [高可用性](/cloud/managed-postgres/high-availability)
- [性能基准测试](/cloud/managed-postgres/benchmarks)