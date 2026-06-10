---
slug: /cloud/managed-postgres/pricing
sidebar_label: '定价'
title: '定价'
description: 'ClickHouse 托管的 Postgres 的定价模型、层级、实例类型和 Beta 定价详情'
keywords: ['Postgres 定价', 'Managed Postgres 成本', 'Postgres Beta 定价', 'Postgres 定价计算器', 'NVMe 定价', 'Postgres 层级定价']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.pricing-beta" />

由 ClickHouse 托管的 Postgres 基于本地 NVMe 存储构建，因此无需承担传统网络附加存储架构带来的额外成本，也能提供生产级性能以及与 ClickHouse 的原生集成。本页介绍该服务的定价模型、可用实例类型和层级对比。

由 ClickHouse 托管的 Postgres 现已进入 Beta 阶段。在 2026 年 6 月 15 日开始计量之前，该服务仍可免费使用，让团队能够在开始计费前为实例合理规划规格。

在 Beta 期间，所有套餐均可享受 50% 折扣，以体现我们对早期客户的支持。起始价格约为 **30 美元/月**，对应 1 vCPU、8 GB RAM 和 59 GB NVMe 存储配置。

:::tip[定价计算器]
如需获取精确定价，请使用[定价计算器](https://clickhouse.com/pricing?service=postgres#pricing-calculator)，为您的工作负载找到最合适的配置和价格。
:::

## 性价比 \{#price-performance\}

由于该服务运行在本地 NVMe 存储上，与传统的网络附加存储架构相比，许多工作负载都能获得显著更高的性价比。有关在相似硬件配置下与其他 Postgres 提供商的基准测试对比，请参阅 [PostgresBench](https://postgresbench.clickhouse.com/)。

对于相当的工作负载，客户所需的计算资源最高可降至原来的 1/2 到 1/4。因而，在跨提供商比较价格时，应将这些潜在的效率收益考虑在内；不过，实际改进幅度会因工作负载而异，仍需结合您的具体应用进行验证。

## 定价模型 \{#pricing-model\}

该服务运行在本地 NVMe 存储上，因此定价基于完整的 VM 配置——CPU、内存和存储，而不是将计算资源和磁盘分别计费。

提供 50 多种配置，范围从 1 vCPU / 8 GB RAM / 59 GB NVMe 到 96 vCPU / 768 GB RAM / 60 TB NVMe 存储，可为计算密集型和存储密集型 Postgres 工作负载提供灵活选择。

### 按层级定价 \{#tier-based-pricing\}

定价、功能和资源限制因组织层级而异——[基础版、Scale 或 Enterprise](/cloud/manage/cloud-tiers)；不过，每个层级都包含该服务的核心能力，包括基于本地 NVMe 存储、适用于生产环境的 Postgres、面向 ClickHouse 的原生 CDC，以及 `pg_clickhouse` 扩展。

下表汇总了各层级包含的功能、能力和限制。要比较不同层级的定价，请参阅[定价计算器](https://clickhouse.com/pricing?service=postgres#pricing-calculator)。

<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '24px 0'}}>
  <div style={{border: '1px solid var(--ifm-color-emphasis-300)', borderTop: '3px solid var(--ifm-color-primary)', borderRadius: '8px', padding: '20px', background: 'var(--ifm-background-surface-color)'}}>
    <h4 style={{marginTop: 0, marginBottom: '8px', textAlign: 'center'}}>基础版</h4>
    <p style={{textAlign: 'center', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', minHeight: '3.5em', marginBottom: '16px'}}>非常适合试验新想法或起步项目。存储和内存有限。</p>

    <ul style={{paddingLeft: '20px', margin: 0, fontSize: '0.9rem'}}>
      <li><a href="/docs/cloud/managed-postgres/scaling">计算资源最高可达 8 GB RAM</a></li>
      <li><a href="/docs/cloud/managed-postgres/scaling">本地 NVMe 存储最高可达 118 GB</a></li>
      <li><a href="/docs/cloud/managed-postgres/backup-and-restore">备份保留期为 1 天</a></li>
      <li><a href="/docs/cloud/managed-postgres/backup-and-restore">PITR 和分支</a></li>
      <li>包含<a href="/docs/cloud/managed-postgres/high-availability">高可用性</a></li>
      <li><a href="/docs/cloud/managed-postgres/monitoring/query-insights">Query Insights</a>，保留期为 1 天</li>
      <li><a href="/docs/cloud/managed-postgres/extensions">90+ 个 Postgres 扩展</a></li>
      <li><a href="/docs/cloud/managed-postgres/clickhouse-integration">到 ClickHouse 的原生 CDC (变更数据捕获) </a></li>
      <li><a href="/docs/cloud/managed-postgres/extensions"><code>pg&#95;clickhouse</code> 扩展</a></li>
      <li><a href="/docs/cloud/managed-postgres/migrations/clickhouse-cloud">全托管数据迁移</a></li>
      <li>专家支持，响应时间为 1 个工作日</li>
      <li>使用 Google 或 Microsoft 社交登录的<a href="/docs/cloud/security/manage-my-account">单点登录 (SSO) 身份验证</a></li>
      <li><a href="/docs/cloud/security/manage-my-account#mfa">多因素身份验证</a></li>
    </ul>
  </div>

  <div style={{border: '1px solid var(--ifm-color-emphasis-300)', borderTop: '3px solid var(--ifm-color-primary)', borderRadius: '8px', padding: '20px', background: 'var(--ifm-background-surface-color)'}}>
    <h4 style={{marginTop: 0, marginBottom: '8px', textAlign: 'center'}}>Scale</h4>
    <p style={{textAlign: 'center', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', minHeight: '3.5em', marginBottom: '16px'}}>适用于生产环境、大规模数据处理或专业级使用场景。</p>
    <p style={{fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem'}}>包含基础版的全部功能，另外还包括</p>

    <ul style={{paddingLeft: '20px', margin: 0, fontSize: '0.9rem'}}>
      <li><a href="/docs/cloud/managed-postgres/scaling">最高可达 60 TB 存储</a></li>
      <li><a href="/docs/cloud/managed-postgres/scaling">最高可达 96 个 vCPU 和 768 GB RAM</a></li>
      <li><a href="/docs/cloud/managed-postgres/scaling">存储自动扩缩容</a></li>
      <li><a href="/docs/cloud/managed-postgres/read-replicas">只读副本</a></li>
      <li><a href="/docs/cloud/managed-postgres/security">私有网络</a></li>
      <li><a href="/docs/cloud/managed-postgres/backup-and-restore">备份保留 7 天</a></li>
      <li><a href="/docs/cloud/managed-postgres/monitoring/query-insights">Query Insights</a> 保留期为 7 天</li>
      <li>专家支持：针对严重性 1 级问题提供 24x7 全天候支持，响应时间为 1 小时</li>
    </ul>
  </div>

  <div style={{border: '1px solid var(--ifm-color-emphasis-300)', borderTop: '3px solid var(--ifm-color-primary)', borderRadius: '8px', padding: '20px', background: 'var(--ifm-background-surface-color)'}}>
    <h4 style={{marginTop: 0, marginBottom: '8px', textAlign: 'center'}}>Enterprise</h4>
    <p style={{textAlign: 'center', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', minHeight: '3.5em', marginBottom: '16px'}}>适用于生产环境、超大规模数据处理或企业级场景。</p>
    <p style={{fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem'}}>包含 Scale 的全部功能，外加</p>

    <ul style={{paddingLeft: '20px', margin: 0, fontSize: '0.9rem'}}>
      <li>提供 Enterprise 支持服务，严重级别 1 问题可在 30 分钟内响应</li>
      <li><a href="/docs/cloud/infrastructure/clickhouse-private">私有区域</a></li>
      <li>指定首席支持工程师</li>
      <li><a href="/docs/cloud/managed-postgres/extensions">自定义扩展</a> (*待批准) </li>
      <li><a href="/docs/cloud/managed-postgres/migrations/clickhouse-cloud">迁移咨询指南</a></li>
      <li><a href="/docs/cloud/managed-postgres/upgrades">计划内升级</a></li>
    </ul>
  </div>
</div>

### 实例类型 \{#instance-types\}

实例配置分为三类，以便根据工作负载特征简化基础设施选型。

* **内存优化型：** 专为内存密集型工作负载设计，具有更高的内存与 CPU 配比 (例如 1:8 或 1:4) 。支持基于 AWS Graviton 的 `r8gd`、`r6gd`、`m6gd` 和 `m8gd` 系列。最适合大型活跃数据集、高缓存命中率以及内存瓶颈型数据库工作负载。
* **存储优化型：** 专为需要大量本地 NVMe 存储、但无需按比例扩缩容计算资源的工作负载设计。支持基于 AWS Graviton 的 `i8g`、`i8ge`、`i7i` 和 `i7ie` 系列，配置最高可提供 60 TB 本地 NVMe 存储。最适合大型数据集、时序数据工作负载、日志和事件存储，以及存储密集型 OLTP 工作负载。
* **CPU 优化型：** 专为计算密集型工作负载设计，具有较低的内存与 CPU 配比 (通常约为 1:2) 。支持 `c6gd` 系列，最适合高并发事务型工作负载以及受 CPU 瓶颈限制的查询。

## 定价计算器 \{#pricing-calculator\}

使用[定价计算器](https://clickhouse.com/pricing?service=postgres#pricing-calculator)估算不同工作负载配置和选项下的部署成本。您可以自定义：

* 组织层级 (基础版、Scale、Enterprise)
* 区域
* 配置类型 (内存优化、存储优化或 CPU 优化)
* CPU 架构 (ARM 或 x86)
* vCPU、内存和存储规格
* 待机 / 高可用性 (HA) 配置

这样，您就可以比较 50 多种受支持的配置组合的价格，并为您的工作负载找到最合适的方案。

## Beta 定价亮点 \{#beta-pricing-highlights\}

在 Beta 期间：

* 在 **2026 年 6 月 15 日** 开始按用量计费之前，此服务免费
* 通过 **ClickPipes** 提供的原生 CDC 无需额外付费
* 目前 **网络出站流量** 和 **备份** 均不收取任何费用
* 目前所有套餐均享受 **5 折 Beta 定价**

## 免责声明 \{#disclaimers\}

由于产品在 Beta 阶段仍在持续演进，定价和套餐方案可能会在正式发布 (GA) 前进一步调整。请注意以下事项：

* GA 后将引入网络出站流量定价。与数据库部署在同一位置的应用预计只会产生极低的出站流量成本。
* 对于超过某个上限 (该上限目前仍在制定中) 的保留时长，GA 时可能会收取额外的备份费用。
* 我们预计，通过 ClickPipes 提供的原生 CDC 在 GA 时，当 Postgres 和 ClickHouse 部署在同一区域时，将继续保持免费或仅收取极低费用，这也符合统一 OLTP + OLAP 平台的愿景。
* 在扩缩容和维护操作期间，系统会短暂并行运行新旧实例以保持数据库在线——在切换完成之前，您可能会看到新旧两个实例同时产生费用。该时间窗口的耗时会因实例类型和存储容量而异。
* 如果所选实例类型的容量在某些可用区暂时受限，服务可能会回退到旧一代中可比的实例类型，以维持所选的高可用配置。您将按目标实例类型的费率计费。
* 随着我们在 Beta 期间进一步了解真实客户的使用模式、工作负载特征和基础设施需求，现有定价可能会在临近 GA 时进一步调整和变化。