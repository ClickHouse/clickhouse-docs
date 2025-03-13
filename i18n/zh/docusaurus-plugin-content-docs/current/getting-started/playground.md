---
sidebar_label: 'ClickHouse 游乐场'
sidebar_position: 2
keywords: ['clickhouse', '游乐场', '开始', '文档']
description: 'ClickHouse 游乐场允许用户通过即时运行查询来实验 ClickHouse，无需设置他们的服务器或集群。'
slug: /getting-started/playground
---


# ClickHouse 游乐场

[ClickHouse 游乐场](https://sql.clickhouse.com) 允许用户通过即时运行查询来实验 ClickHouse，无需设置他们的服务器或集群。在游乐场中提供了多个示例数据集。

您可以使用任何 HTTP 客户端向游乐场发出查询，例如 [curl](https://curl.haxx.se) 或 [wget](https://www.gnu.org/software/wget/)，或者使用 [JDBC](../interfaces/jdbc.md) 或 [ODBC](../interfaces/odbc.md) 驱动程序建立连接。有关支持 ClickHouse 的软件产品的更多信息，请访问 [这里](../integrations/index.mdx)。

## 凭证 {#credentials}

| 参数                 | 值                                   |
|:---------------------|:-------------------------------------|
| HTTPS 端点          | `https://play.clickhouse.com:443/`  |
| 原生 TCP 端点       | `play.clickhouse.com:9440`           |
| 用户                | `explorer` 或 `play`                 |
| 密码                | (空)                                  |

## 限制 {#limitations}

查询以只读用户身份执行。这意味着一些限制：

- 不允许 DDL 查询
- 不允许 INSERT 查询

该服务的使用还有名额限制。

## 示例 {#examples}

使用 `curl` 的 HTTPS 端点示例：

``` bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

使用 [CLI](../interfaces/cli.md) 的 TCP 端点示例：

``` bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```
