---
sidebar_label: 'Embeddable'
slug: /integrations/embeddable
keywords: ['ClickHouse', 'Embeddable', '连接', '集成', 'UI']
description: 'Embeddable 是一套面向开发者的工具包，可直接在应用中构建快速、交互性强且完全可定制的分析体验。'
title: '将 Embeddable 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# 将 Embeddable 连接到 ClickHouse \{#connecting-embeddable-to-clickhouse\}

<CommunityMaintainedBadge />

在 [Embeddable](https://embeddable.com/) 中，你可以通过代码定义 [数据模型](https://docs.embeddable.com/data-modeling/introduction) 和 [组件](https://docs.embeddable.com/development/introduction) (存储在你自己的代码仓库中) ，并使用我们的 **SDK** 在功能强大的 Embeddable **无代码构建器** 中将它们提供给团队使用。

最终，你可以直接在自己的产品中提供快速、交互式、面向客户的分析能力；由产品团队设计；由工程团队构建；由面向客户的团队和数据团队维护。这才是它应有的样子。

内置的行级安全机制意味着，每位用户始终只能看到其有权查看的数据。而两级完全可配置的缓存机制则意味着，你可以大规模提供快速的实时分析。

## 1. 获取连接详细信息 \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. 创建 ClickHouse 连接类型 \{#2-create-a-clickhouse-connection-type\}

使用 Embeddable API 添加数据库连接。此连接用于连接到您的 ClickHouse 服务。您可以通过以下 API 调用添加连接：

```javascript title="Query"
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
```

```text title="Response"
Status 201 { errorMessage: null }
```

以上表示的是一个 `CREATE` 操作，但所有 `CRUD` 操作都可用。

点击任一 Embeddable 仪表板上的 &quot;**Publish**&quot;，即可找到 `apiKey`。

`name` 是用于标识此连接的唯一名称。

* 默认情况下，你的数据模型会查找名为 &quot;default&quot; 的连接，但你也可以为模型提供不同的 `data_source` 名称，以便将不同的数据模型连接到不同的连接 (只需在模型中指定 data&#95;source 名称) 。

`type` 用于告知 Embeddable 应使用哪个驱动程序

* 此处应使用 `clickhouse`，但你也可以将多种不同的数据源连接到同一个 Embeddable 工作区，因此也可以使用其他类型，例如：`postgres`、`bigquery`、`mongodb` 等。

`credentials` 是一个 JavaScript 对象，包含驱动程序所需的凭据

* 这些信息会被安全加密，并且仅用于检索你在数据模型中定义的数据。
  Embeddable 强烈建议你为每个连接创建一个只读数据库用户 (Embeddable 只会从你的数据库中读取数据，不会写入) 。

为了支持连接到 prod、qa、test 等不同环境的数据库 (或为不同客户使用不同的数据库) ，你可以将每个连接分配给一个环境 (参见 [Environments API](https://docs.embeddable.com/data/environments)) 。