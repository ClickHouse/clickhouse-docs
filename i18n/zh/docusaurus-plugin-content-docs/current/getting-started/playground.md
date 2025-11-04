---
'description': 'ClickHouse Playground 允许人们通过即时运行查询来实验 ClickHouse ，而无需设置他们的服务器或集群。'
'keywords':
- 'clickhouse'
- 'playground'
- 'getting'
- 'started'
- 'docs'
'sidebar_label': 'ClickHouse Playground'
'slug': '/getting-started/playground'
'title': 'ClickHouse Playground'
'doc_type': 'guide'
---


# ClickHouse playground

[ClickHouse Playground](https://sql.clickhouse.com) 允许用户通过即时运行查询来试验 ClickHouse，而无需设置他们的服务器或集群。
在 Playground 中提供了若干示例数据集。

您可以使用任何 HTTP 客户端向 Playground 发起查询，例如 [curl](https://curl.haxx.se) 或 [wget](https://www.gnu.org/software/wget/)，或使用 [JDBC](../interfaces/jdbc.md) 或 [ODBC](../interfaces/odbc.md) 驱动程序建立连接。有关支持 ClickHouse 的软件产品的更多信息，请访问 [这里](../integrations/index.mdx)。

## Credentials {#credentials}

| 参数               | 值                                   |
|:--------------------|:-------------------------------------|
| HTTPS 端点         | `https://play.clickhouse.com:443/` |
| 原生 TCP 端点      | `play.clickhouse.com:9440`          |
| 用户                | `explorer` 或 `play`                 |
| 密码                | (空)                                |

## Limitations {#limitations}

查询以只读用户身份执行。这意味着一些限制：

- 不允许 DDL 查询
- 不允许 INSERT 查询

该服务在使用上也有配额限制。

## Examples {#examples}

HTTPS 端点示例使用 `curl`：

```bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

TCP 端点示例使用 [CLI](../interfaces/cli.md)：

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```

## Playground specifications {#specifications}

我们的 ClickHouse Playground 的规格如下：

- 托管在美国中部地区（US-Central-1）的 Google Cloud (GCE) 上
- 3 副本设置
- 每个副本 256 GiB 存储和 59 虚拟 CPU。
