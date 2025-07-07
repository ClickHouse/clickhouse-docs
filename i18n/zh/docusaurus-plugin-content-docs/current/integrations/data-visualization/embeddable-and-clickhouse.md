---
'sidebar_label': 'Embeddable'
'slug': '/integrations/embeddable'
'keywords':
- 'clickhouse'
- 'Embeddable'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Embeddable 是一个开发工具包，用于直接在您的应用中构建快速、互动、完全自定义的分析体验。'
'title': '将 Embeddable 连接到 ClickHouse'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 连接 Embeddable 和 ClickHouse

<CommunityMaintainedBadge/>

在 [Embeddable](https://embeddable.com/) 中，您在代码中定义 [数据模型](https://docs.embeddable.com/data-modeling/introduction) 和 [组件](https://docs.embeddable.com/development/introduction)（存储在您自己的代码库中），并使用我们的 **SDK** 将这些内容提供给您的团队，在强大的 Embeddable **无代码构建器** 中使用。

最终的结果是能够在您的产品中直接提供快速、交互式的面向客户的分析；由您的产品团队设计；由您的工程团队构建；由您的客户和数据团队维护。正是应该如此。

内置的行级安全性意味着每个用户只能看到他们被允许查看的数据。而两个级别的完全可配置缓存意味着您可以在规模上提供快速、实时的分析。

## 1. 收集连接详情 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 创建 ClickHouse 连接类型 {#2-create-a-clickhouse-connection-type}

您可以使用 Embeddable API 添加数据库连接。此连接用于连接到您的 ClickHouse 服务。您可以使用以下 API 调用添加连接：

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

上述表示一个 `CREATE` 操作，但所有 `CRUD` 操作均可用。

`apiKey` 可以通过单击您某个 Embeddable 仪表板上的 "**发布**" 来找到。

`name` 是唯一标识此连接的名称。
- 默认情况下，您的数据模型将查找名为 "default" 的连接，但您可以为您的模型提供不同的 `data_source` 名称，以支持将不同的数据模型连接到不同的连接（只需在模型中指定数据源名称）

`type` 告诉 Embeddable 使用哪个驱动程序

- 这里您将想要使用 `clickhouse`，但您可以将多个不同的数据源连接到一个 Embeddable 工作区，因此您可能会使用其他数据源，比如：`postgres`、`bigquery`、`mongodb` 等。

`credentials` 是一个 JavaScript 对象，包含驱动程序所期望的必要凭据
- 这些凭据经过安全加密，仅用于检索您在数据模型中描述的确切数据。
Embeddable 强烈建议您为每个连接创建一个只读数据库用户（Embeddable 仅会从您的数据库读取，而不会写入）。

为了支持连接到用于生产、QA、测试等的不同数据库（或支持不同客户使用不同数据库），您可以将每个连接分配给一个环境（请参阅 [Environments API](https://docs.embeddable.com/data/environments)）。
