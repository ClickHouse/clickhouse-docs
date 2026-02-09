---
description: '表函数允许从 YTsaurus 集群读取数据。'
sidebar_label: 'ytsaurus'
sidebar_position: 85
slug: /sql-reference/table-functions/ytsaurus
title: 'ytsaurus'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# ytsaurus 表函数 \{#ytsaurus-table-function\}

<ExperimentalBadge/>

此表函数用于从 YTsaurus 集群读取数据。

## 语法 \{#syntax\}

```sql
ytsaurus(http_proxy_url, cypress_path, oauth_token, format)
```

:::info
这是一个实验性功能，在未来版本中可能会以与旧版本不兼容的方式发生变化。
要启用 YTsaurus 表函数，
请通过设置 [allow&#95;experimental&#95;ytsaurus&#95;table&#95;function](/operations/settings/settings#allow_experimental_ytsaurus_table_engine) 来实现。
执行命令 `set allow_experimental_ytsaurus_table_function = 1`。
:::

## 参数 \{#arguments\}

- `http_proxy_url` — YTsaurus HTTP 代理的 URL。
- `cypress_path` — 指向数据源的 Cypress 路径。
- `oauth_token` — OAuth 令牌。
- `format` — 数据源的[格式](/interfaces/formats)。

**返回值**

一个具有指定结构的表，用于在指定的 YTsaurus 集群中，从指定的 YTsaurus Cypress 路径读取数据。

**另请参阅**

- [YTsaurus 引擎](/engines/table-engines/integrations/ytsaurus.md)
