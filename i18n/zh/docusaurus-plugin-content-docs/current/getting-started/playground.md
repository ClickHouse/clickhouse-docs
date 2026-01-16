---
description: 'ClickHouse Playground 允许用户无需搭建自己的服务器或集群，即可立即运行查询来体验和试用 ClickHouse。'
keywords: ['clickhouse', 'playground', '快速入门', '文档']
sidebar_label: 'ClickHouse Playground'
slug: /getting-started/playground
title: 'ClickHouse Playground'
doc_type: '指南'
---

# ClickHouse playground \{#clickhouse-playground\}

[ClickHouse Playground](https://sql.clickhouse.com) 允许用户无需自行搭建服务器或集群，即可通过即时运行查询来试用和探索 ClickHouse。
Playground 中提供了若干示例数据集。

您可以使用任意 HTTP 客户端向 Playground 发送查询，例如 [curl](https://curl.haxx.se) 或 [wget](https://www.gnu.org/software/wget/)，也可以通过 [JDBC](/interfaces/jdbc) 或 [ODBC](/interfaces/odbc) 驱动程序来建立连接。关于支持 ClickHouse 的软件产品的更多信息，请参见[此处](../integrations/index.mdx)。

## 凭证 \\{#credentials\\}

| 参数               | 值                                  |
|:--------------------|:-----------------------------------|
| HTTPS 端点         | `https://play.clickhouse.com:443/` |
| 原生 TCP 端点      | `play.clickhouse.com:9440`         |
| 用户               | `explorer` 或 `play`               |
| 密码               | （空）                             |

## 限制 \\{#limitations\\}

所有查询均以只读用户的身份执行。这意味着存在一些限制：

- 不允许执行 DDL 查询
- 不允许执行 INSERT 查询

该服务的使用还受配额限制。

## 示例 \{#examples\}

使用 `curl` 访问 HTTPS 端点的示例：

```bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

使用 [CLI](../interfaces/cli.md) 的 TCP 端点示例：

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```


## Playground 规格 \\{#specifications\\}

我们的 ClickHouse Playground 当前采用以下规格：

- 托管在美国中部区域（US-Central-1）的 Google Cloud（GCE）上
- 3 副本架构
- 每个节点具有 256 GiB 存储和 59 个虚拟 CPU。