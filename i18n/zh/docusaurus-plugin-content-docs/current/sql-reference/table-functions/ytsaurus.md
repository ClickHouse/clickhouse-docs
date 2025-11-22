---
description: '表函数可用于从 YTsaurus 集群读取数据。'
sidebar_label: 'ytsaurus'
sidebar_position: 85
slug: /sql-reference/table-functions/ytsaurus
title: 'ytsaurus'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ytsaurus 表函数

<ExperimentalBadge/>

该表函数可用于从 YTsaurus 集群读取数据。



## 语法 {#syntax}

```sql
ytsaurus(http_proxy_url, cypress_path, oauth_token, format)
```

:::info
这是一个实验性功能,在未来的版本中可能会以不向后兼容的方式发生变更。
使用 [allow_experimental_ytsaurus_table_function](/operations/settings/settings#allow_experimental_ytsaurus_table_engine) 设置来启用 YTsaurus 表函数。
输入命令 `set allow_experimental_ytsaurus_table_function = 1`。
:::


## 参数 {#arguments}

- `http_proxy_url` — YTsaurus HTTP 代理的 URL。
- `cypress_path` — 数据源的 Cypress 路径。
- `oauth_token` — OAuth 令牌。
- `format` — 数据源的[格式](/interfaces/formats)。

**返回值**

返回一个具有指定结构的表,用于从 YTsaurus 集群中指定的 Cypress 路径读取数据。

**另请参阅**

- [YTsaurus 引擎](/engines/table-engines/integrations/ytsaurus.md)
