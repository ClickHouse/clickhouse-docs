---
sidebar_label: 'Embeddable'
slug: /integrations/embeddable
keywords: ['clickhouse', 'Embeddable', 'connect', 'integrate', 'ui']
description: 'Embeddable 是一个开发者工具包，用于将快速、交互式、可完全自定义的分析体验直接构建到您的应用中。'
title: '将 Embeddable 连接到 ClickHouse'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 Embeddable 连接到 ClickHouse

<CommunityMaintainedBadge/>

在 [Embeddable](https://embeddable.com/) 中，您通过代码（存储在您自己的代码仓库中）定义 [数据模型（Data Models）](https://docs.embeddable.com/data-modeling/introduction) 和 [组件（Components）](https://docs.embeddable.com/development/introduction)，并使用我们的 **SDK** 将它们提供给您的团队，在功能强大的 Embeddable **零代码构建器** 中使用。

最终，您可以在自己的产品中直接向客户交付快速、交互式的分析功能：由您的产品团队设计，由您的工程团队构建，并由面向客户团队和数据团队共同维护——这正是应有的方式。

内置的行级安全机制确保每位用户只会看到其被授权访问的精确数据。而双层、完全可配置的缓存则意味着，您可以在大规模场景下提供快速的实时分析。



## 1. 收集连接详细信息 {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. 创建 ClickHouse 连接类型 {#2-create-a-clickhouse-connection-type}

您可以使用 Embeddable API 添加数据库连接。该连接用于连接到您的 ClickHouse 服务。您可以通过以下 API 调用添加连接:

```javascript
// 出于安全考虑,此操作*绝不*应从客户端调用
fetch('https://api.embeddable.com/api/v1/connections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}` /* 请妥善保管您的 API 密钥 */,
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

上述代码表示一个 `CREATE` 操作,但所有 `CRUD` 操作均可用。

`apiKey` 可以通过点击您的某个 Embeddable 仪表板上的"**Publish**"按钮获取。

`name` 是用于标识此连接的唯一名称。

- 默认情况下,您的数据模型将查找名为"default"的连接,但您可以为模型指定不同的 `data_source` 名称,以支持将不同的数据模型连接到不同的连接(只需在模型中指定 data_source 名称即可)

`type` 用于告知 Embeddable 使用哪个驱动程序

- 在这里您需要使用 `clickhouse`,但您可以将多个不同的数据源连接到一个 Embeddable 工作区,因此您也可以使用其他数据源,例如:`postgres`、`bigquery`、`mongodb` 等。

`credentials` 是一个 JavaScript 对象,包含驱动程序所需的必要凭据

- 这些凭据经过安全加密,仅用于检索您在数据模型中定义的确切数据。
  Embeddable 强烈建议您为每个连接创建一个只读数据库用户(Embeddable 只会从您的数据库读取数据,不会写入)。

为了支持连接到不同环境的数据库(如生产环境、QA 环境、测试环境等,或为不同客户支持不同的数据库),您可以将每个连接分配给一个环境(请参阅 [Environments API](https://docs.embeddable.com/data/environments))。
