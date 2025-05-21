---
'sidebar_label': '可嵌入的'
'slug': '/integrations/embeddable'
'keywords':
- 'clickhouse'
- 'Embeddable'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Embeddable 是一个开发工具包，用于在应用程序中直接构建快速、交互式、完全自定义的分析体验。'
'title': '连接 Embeddable 到 ClickHouse'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 连接 Embeddable 到 ClickHouse

<CommunityMaintainedBadge/>

在 [Embeddable](https://embeddable.com/) 中，您可以在代码中定义 [数据模型](https://docs.embeddable.com/data-modeling/introduction) 和 [组件](https://docs.embeddable.com/development/introduction) （存储在您自己的代码仓库中），并使用我们的 **SDK** 使这些可供您的团队在强大的 Embeddable **无代码构建器** 中使用。

最终结果是能够直接在您的产品中提供快速、互动的面向客户的分析；由您的产品团队设计；由您的工程团队构建；由您的客户和数据团队维护。正如它应该的那样。

内置的行级安全性意味着每个用户只能看到他们被允许查看的数据。两个级别的完全可配置缓存意味着您可以在较大规模上提供快速、实时的分析。

## 1. 收集连接详细信息 {#1-gather-your-connection-details}
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

上述代表一个 `CREATE` 操作，但所有 `CRUD` 操作都是可用的。

可以通过点击您的 Embeddable 仪表板上的 "**发布**" 来找到 `apiKey`。

`name` 是一个唯一名称，用于识别此连接。
- 默认情况下，您的数据模型将查找名为 "default" 的连接，但您可以向模型提供不同的 `data_source` 名称，以支持将不同的数据模型连接到不同的连接（只需在模型中指定数据源名称）

`type` 告诉 Embeddable 使用哪个驱动程序。

- 在这里，您将希望使用 `clickhouse`，但您可以将多个不同的数据源连接到一个 Embeddable 工作区，因此您也可以使用其他如：`postgres`、`bigquery`、`mongodb` 等。

`credentials` 是一个包含驱动程序所需凭据的 JavaScript 对象。
- 这些信息是安全加密的，仅用于检索您在数据模型中描述的确切数据。
Embeddable 强烈建议您为每个连接创建一个只读数据库用户（Embeddable 将仅从您的数据库读取，不进行写入）。

为了支持连接到不同的数据库以适应生产环境、质量保证、测试等（或支持不同客户的不同数据库），您可以将每个连接分配给一个环境（请参见 [Environments API](https://docs.embeddable.com/data/environments)）。
