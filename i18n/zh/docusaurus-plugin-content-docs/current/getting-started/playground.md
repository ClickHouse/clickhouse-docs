---
description: 'ClickHouse Playground 允许用户无需搭建自己的服务器或集群，即可通过即时运行查询来体验和探索 ClickHouse。'
keywords: ['clickhouse', 'playground', 'getting', 'started', 'docs']
sidebar_label: 'ClickHouse playground'
slug: /getting-started/playground
title: 'ClickHouse Playground'
doc_type: 'guide'
---



# ClickHouse playground

[ClickHouse Playground](https://sql.clickhouse.com) 允许用户无需搭建自己的服务器或集群，就可以直接运行查询来体验 ClickHouse。
Playground 中提供了若干示例数据集。

你可以使用任意 HTTP 客户端向 Playground 发送查询，例如 [curl](https://curl.haxx.se) 或 [wget](https://www.gnu.org/software/wget/)，也可以通过 [JDBC](../interfaces/jdbc.md) 或 [ODBC](../interfaces/odbc.md) 驱动程序建立连接。关于支持 ClickHouse 的软件产品的更多信息参见[这里](../integrations/index.mdx)。



## 凭据 {#credentials}

| 参数                | 值                                  |
| :------------------ | :--------------------------------- |
| HTTPS 端点          | `https://play.clickhouse.com:443/` |
| Native TCP 端点     | `play.clickhouse.com:9440`         |
| 用户                | `explorer` 或 `play`               |
| 密码                | (空)                                |


## 限制 {#limitations}

查询以只读用户身份执行。这意味着存在以下限制:

- 不允许执行 DDL 查询
- 不允许执行 INSERT 查询

该服务还对使用量设有配额限制。


## 示例 {#examples}

使用 `curl` 的 HTTPS 端点示例:

```bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

使用 [CLI](../interfaces/cli.md) 的 TCP 端点示例:

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```


## Playground 规格 {#specifications}

我们的 ClickHouse Playground 运行规格如下:

- 托管于 Google Cloud (GCE) 美国中部区域 (US-Central-1)
- 3 副本部署
- 每个副本配备 256 GiB 存储和 59 个虚拟 CPU
