---
sidebar_label: 'Fivetran'
slug: /integrations/fivetran
sidebar_position: 2
description: '使用 Fivetran 将任意来源的数据导入 ClickHouse Cloud，并自动创建 schema、进行去重，以及支持 历史模式（SCD Type 2）。'
title: 'Fivetran 与 ClickHouse Cloud'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
  - website: 'https://github.com/ClickHouse/clickhouse-fivetran-destination'
keywords: ['fivetran', 'data movement', 'etl', 'clickhouse destination', 'automated data platform', 'history mode', 'SCD Type 2']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Fivetran 与 ClickHouse Cloud \{#fivetran-and-clickhouse-cloud\}

<ClickHouseSupportedBadge/>

## 概览 \{#overview\}

[Fivetran](https://www.fivetran.com) 是一款自动化数据迁移平台，可用于在云数据平台之间，以及从云数据平台中导出或导入数据。

[ClickHouse Cloud](https://clickhouse.com/cloud) 目前已作为 [Fivetran 目标端](https://fivetran.com/docs/destinations/clickhouse) 之一受到支持，允许你将来自各种数据源的数据加载到 ClickHouse 中。开源版 ClickHouse 不支持作为目标端。

该目标端连接器由 ClickHouse 和 Fivetran 共同开发和维护。其源代码可在 [GitHub](https://github.com/ClickHouse/clickhouse-fivetran-destination) 上获取。

:::note
[ClickHouse Cloud 目标端](https://fivetran.com/docs/destinations/clickhouse) 当前处于 **Beta** 阶段，但我们正努力尽快将其推进为正式可用版本。
:::

<div class="vimeo-container">
  <iframe
    src="//www.youtube.com/embed/sWe5JHW3lAs"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
fullscreen;
picture-in-picture"
    allowfullscreen
  />
</div>

## 关键特性 \{#key-features\}

* **兼容 ClickHouse Cloud**：可将您的 ClickHouse Cloud 数据库用作 Fivetran 的目标端。
* **SaaS 部署模型**：由 Fivetran 完全托管，无需管理自己的基础设施。
* **历史模式 (SCD Type 2)&#x20;**：保留所有记录版本的完整历史，便于进行时点分析和审计追踪。
* **可配置的批次大小**：您可以通过 JSON 设置文件调整写入、查询、mutation 和硬删除的批次大小，使 Fivetran 适配您的具体用例。

## 限制 \{#limitations\}

* 目前尚不支持 schema 迁移，但我们正在开发中。
* 不支持添加、删除或修改主键列。
* 不支持在 `CREATE TABLE` 语句中指定自定义 ClickHouse 设置。
* 基于角色的授权尚未完全支持。连接器在检查授权时，只会查询直接授予用户的权限。请改用[直接授权](/integrations/fivetran/troubleshooting#role-based-grants)。

## 相关页面 \{#related-pages\}

* [技术参考](/integrations/fivetran/reference)：类型对照、表引擎、元数据列和进阶配置
* [故障排查与最佳实践](/integrations/fivetran/troubleshooting)：常见错误、优化技巧和调试查询
* [GitHub 上的 ClickHouse Fivetran 目标端](https://github.com/ClickHouse/clickhouse-fivetran-destination)

## 设置指南 \{#setup-guide\}

* 如果你在查找配置和常规技术细节，请参阅[技术参考](/integrations/fivetran/reference)。
* 如需更全面的指南，请查看 Fivetran 文档中的[设置指南](https://fivetran.com/docs/destinations/clickhouse/setup-guide)。

## 联系与支持 \{#contact-us\}

ClickHouse Fivetran 目标端采用分工协作的模式：

* **ClickHouse** 负责开发和维护目标端连接器代码。
* **Fivetran** 托管该连接器，并负责数据传输、管道调度以及源连接器。

Fivetran 和 ClickHouse 都为 Fivetran ClickHouse 目标端提供支持。对于一般咨询，建议联系 Fivetran，因为他们更熟悉 Fivetran 平台。对于任何 ClickHouse 特有的问题或故障，我们的支持团队也很乐意提供帮助。请创建[支持工单](/about-us/support) 提出问题或报告故障。