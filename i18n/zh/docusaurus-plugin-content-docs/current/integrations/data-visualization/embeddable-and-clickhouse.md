---
sidebar_label: 可嵌入的
slug: /integrations/embeddable
keywords: [clickhouse, 可嵌入的, 连接, 集成, ui]
description: 可嵌入的是一个开发者工具包，用于直接在您的应用中构建快速、交互式和完全自定义的分析体验。
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# 连接可嵌入的到 ClickHouse

在 [可嵌入的](https://embeddable.com/) 中，您可以在代码中定义 [数据模型](https://trevorio.notion.site/Data-modeling-35637bbbc01046a1bc47715456bfa1d8) 和 [组件](https://trevorio.notion.site/Using-components-761f52ac2d0743b488371088a1024e49)（存储在您自己的代码库中），并使用我们的 **SDK** 将这些内容提供给您的团队，构建强大的可嵌入 **无代码构建器。**

最终结果是能够直接在您的产品中交付快速、交互式的面向客户的分析；由您的产品团队设计；由您的工程团队构建；由您的客户和数据团队维护。正如它应该那样。

内置的行级安全性意味着每个用户只会看到他们被允许查看的数据。而两级完全可配置的缓存意味着您可以按比例提供快速、实时的分析。

## 1. 收集您的连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 创建一个 ClickHouse 连接类型 {#2-create-a-clickhouse-connection-type}

您可以使用可嵌入 API 添加一个数据库连接。此连接用于连接到您的 ClickHouse 服务。您可以使用以下 API 调用添加连接：

```javascript
// 出于安全原因，此操作绝对不能从客户端调用
fetch('https://api.embeddable.com/api/v1/connections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}` /* 请确保您的 API 密钥安全 */,
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

上述内容表示一个 `CREATE` 操作，但所有 `CRUD` 操作均可用。

`apiKey` 可以通过点击您的可嵌入仪表板上的 "**发布**" 按钮找到。

`name` 是一个唯一名称，用于标识此连接。
- 默认情况下，您的数据模型会查找名为 "default" 的连接，但您可以为模型提供不同的 `data_source` 名称，以支持将不同的数据模型连接到不同的连接（只需在模型中指定数据源名称即可）。

`type` 告诉可嵌入使用哪个驱动程序

- 在这里，您将想使用 `clickhouse`，但您可以将多个不同的数据源连接到一个可嵌入工作区，因此您也可以使用其他数据源，如： `postgres`、`bigquery`、`mongodb` 等。

`credentials` 是一个包含驱动程序所需凭据的 JavaScript 对象
- 这些凭据是安全加密的，仅用于检索您在数据模型中描述的确切数据。可嵌入强烈建议您为每个连接创建一个只读数据库用户（可嵌入只会从数据库中读取，而不是写入）。

为了支持连接到不同的数据库以适应生产、质量控制、测试等（或支持为不同客户连接不同的数据库），您可以将每个连接分配给一个环境（请参见 [环境 API](https://www.notion.so/Environments-API-497169036b5148b38f7936aa75e62949?pvs=21)）。
