---
slug: /cloud/managed-postgres/branching
sidebar_label: '分支'
title: '分支'
description: '从时间点快照创建隔离的数据库分支，用于开发、暂存、测试和恢复工作流'
keywords: ['managed postgres', 'branching', 'pitr', 'point-in-time recovery', 'staging', 'development', 'database branch']
doc_type: 'guide'
---

Managed Postgres 支持通过时间点恢复 (PITR) 创建相互隔离的数据库分支。

分支是从现有数据库某一特定时间点创建的、完全独立的 PostgreSQL 部署。分支可用于开发、暂存、测试、调试、数据验证或恢复等工作流，而不会影响源数据库。

不同于采用写时复制并与主节点数据库共享存储的实现方式，Managed Postgres 分支是从备份中恢复出来的，并作为独立的 PostgreSQL 部署运行。

## 分支如何工作 \{#branching\}

分支创建基于与 [时间点恢复 (PITR) ](/cloud/managed-postgres/backup-and-restore) 相同的备份和恢复基础设施。

创建分支时，Managed Postgres 会先从对象存储中恢复基础备份，再重放所需的 WAL 分段以到达请求的恢复时间点，并根据恢复后的状态预配一个新的 PostgreSQL 部署。恢复完成后，该分支将独立于源数据库运行。

最终生成的分支是源数据库在所选时间点的完整副本。

## 常见使用场景 \{#common-use-cases\}

### 开发与测试 \{#dev-and-testing\}

从生产数据库或暂存数据库创建分支，基于真实数据验证应用更改、迁移或新功能。

### 暂存环境 \{#staging-environments\}

维护一个尽可能贴近生产环境的暂存环境，同时避免影响生产工作负载。

### 数据校验 \{#date-validation\}

在部署到生产环境之前，先测试 schema 变更、索引策略和查询优化方案。

### 恢复与调查 \{#recovery-and-investigation\}

将数据库恢复到特定时间点，以便进行故障排查、审计或验证应用程序的行为。

## 分支规格 \{#branch-sizing\}

分支是独立的 PostgreSQL 部署，其规格可以独立于源数据库单独调整。

例如，生产部署可能采用更高的配置，而开发或暂存分支则可以使用更小的计算资源 profile 来降低成本。这样，团队就能创建临时环境，而不必配备与生产环境相同的计算资源。

## 分支创建时间 \{#branch-creation-time\}

由于 Managed Postgres 使用 NVMe 支持的 PostgreSQL 存储，分支是通过从备份中恢复而来的，而不是通过存储层的写时复制机制创建的。因此，分支创建并非即时完成。

典型的分支创建时间通常在几分钟到几十分钟不等，具体取决于：

* 数据库大小
* 备份大小
* 恢复点
* 必须重放的 WAL 量
* 整体集群配置

对于大多数部署，分支会在几分钟内可用。较大的数据库可能需要更长时间。

如果分支创建时间成为工作流中的瓶颈，请联系 ClickHouse 团队。在很多情况下，可以根据工作负载特征和恢复要求来优化分支恢复性能。

## 分支 vs 本地开发 \{#branches-v-local-dev\}

一个常见的问题是，是否每位开发者都应该把生产分支用作自己的开发环境。

虽然分支对于测试、验证和暂存流程很有用，但通常并不推荐将其作为日常应用开发的主要方式。每个分支都是一个独立的 PostgreSQL 部署，需要从备份中恢复并单独维护。创建大量分支会增加基础设施成本和运维复杂度。

对于大多数组织，我们建议：

* 将 PostgreSQL 分支用于暂存、测试、调试和验证流程。
* 将本地 PostgreSQL 环境用于日常开发。
* 在适当情况下生成用于开发的合成数据集，或使用经过脱敏处理的数据集。
* 避免直接在基于生产环境恢复出的分支上进行常规开发。

这种方式可以减轻生产系统负载，提高开发效率，并帮助确保生产数据得到妥善保护。

如需了解如何使用 Docker 创建本地 PostgreSQL 开发环境，请参阅[本地开发环境](/cloud/managed-postgres/local-development)。

## 推荐的工作流程 \{#recommended-workflow\}

常见的工作流程如下：

```text
Production Database
        │
        ├─────────────► Branch
        │                  │
        │                  ├── Staging
        │                  ├── Validation
        │                  ├── Migration Testing
        │                  └── Incident Investigation
        │
        └─────────────► Local Development
                               │
                               ├── Docker PostgreSQL
                               ├── Application Migrations
                               └── Synthetic Test Data
```

分支最适用于需要一份接近生产环境的数据库副本的场景。对于日常开发，本地 PostgreSQL 环境通常能提供更快、成本更低且扩展性更强的工作流。