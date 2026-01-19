---
sidebar_label: 'Embeddable'
slug: /integrations/embeddable
keywords: ['clickhouse', 'Embeddable', 'connect', 'integrate', 'ui']
description: 'Embeddable 是一个开发工具包，用于将快速、交互式、完全自定义的分析体验直接构建到您的应用程序中。'
title: '将 Embeddable 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# 将 Embeddable 连接到 ClickHouse \{#connecting-embeddable-to-clickhouse\}

<CommunityMaintainedBadge/>

在 [Embeddable](https://embeddable.com/) 中，你以代码的形式（存放在你自己的代码仓库中）定义 [Data Models](https://docs.embeddable.com/data-modeling/introduction) 和 [Components](https://docs.embeddable.com/development/introduction)，并使用我们的 **SDK** 将这些内容提供给你的团队，以便在功能强大的 Embeddable **无代码构建器** 中使用。

最终，你可以在自己的产品中直接交付快速、交互式、面向客户的分析功能；由你的产品团队负责设计；由你的工程团队负责构建；由你的面向客户团队和数据团队负责维护——这才是应有的方式。

内置的行级安全机制确保每个用户只会看到其被允许查看的精确数据。而两级、完全可配置的缓存机制则意味着你可以在大规模场景下提供快速的实时分析能力。

## 1. 收集连接参数 \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. 创建 ClickHouse 连接类型 \{#2-create-a-clickhouse-connection-type\}

您可以使用 Embeddable API 添加数据库连接。该连接用于访问您的 ClickHouse 服务。您可以使用以下 API 调用来添加连接：

```javascript
// for security reasons, this must *never* be called from your client-side
fetch('https://api.embeddable.com/api/v1/connections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}` /* keep your API Key secure */,
  },
  body: JSON.stringify({
    name: 'my-clickhouse-db',
    type: 'clickhouse',
    credentials: {
      host: 'my.clickhouse.host',
      user: 'clickhouse_user',
      port: 8443,
      password: '*****',
    },
  }),
});

Response:
Status 201 { errorMessage: null }
```

以上示例表示一个 `CREATE` 操作，但所有 `CRUD` 操作都可用。

可以通过在任一 Embeddable 仪表板上点击“**Publish**”来找到 `apiKey`。

`name` 是用于标识此连接的唯一名称。

* 默认情况下，数据模型会查找名为 “default” 的连接，但你可以为模型提供不同的 `data_source` 名称，从而将不同的数据模型连接到不同的连接（只需在模型中指定 `data_source` 名称）。

`type` 用于告诉 Embeddable 应该使用哪个驱动程序。

* 在这里建议使用 `clickhouse`，但你可以在同一个 Embeddable 工作区中连接多个不同的数据源，因此也可以使用其他类型，例如：`postgres`、`bigquery`、`mongodb` 等。

`credentials` 是一个 JavaScript 对象，其中包含驱动程序所需的必要凭据。

* 这些凭据会被安全加密，并且只会用于检索你在数据模型中描述的精确数据。
  Embeddable 强烈建议你为每个连接创建一个只读数据库用户（Embeddable 只会从你的数据库中读取数据，而不会进行写入）。

为了支持在 prod、qa、test 等环境中连接到不同的数据库（或为不同客户使用不同的数据库），你可以将每个连接分配到一个环境（参见 [Environments API](https://docs.embeddable.com/data/environments)）。
