---
keywords: ['clickhouse', 'python', 'client', 'connect', 'integrate']
slug: /integrations/python
description: '用于在 Python 与 ClickHouse 之间建立连接的 ClickHouse Connect 项目套件'
title: '基于 ClickHouse Connect 的 Python 集成'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-connect'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# 介绍 \{#introduction\}

ClickHouse Connect 是一个核心数据库驱动，为各类 Python 应用程序提供互操作能力。

* 主要接口是包 `clickhouse_connect.driver` 中的 `Client` 对象。该核心包还包含若干用于与 ClickHouse 服务器通信的辅助类和实用函数，以及用于高级管理 INSERT 和 SELECT 查询的 “context” 实现。
* `clickhouse_connect.datatypes` 包为所有非实验性的 ClickHouse 数据类型提供基础实现及其子类。其主要功能是将 ClickHouse 数据在 ClickHouse “Native” 二进制列式格式之间进行序列化与反序列化，以实现 ClickHouse 与客户端应用之间最高效的传输。
* `clickhouse_connect.cdriver` 包中的 Cython/C 类对一些最常见的序列化与反序列化进行了优化，相比纯 Python 实现可显著提升性能。
* 包 `clickhouse_connect.cc_sqlalchemy` 中提供了一个 [SQLAlchemy](https://www.sqlalchemy.org/) dialect，它基于 `datatypes` 和 `dbi` 包构建。该实现支持 SQLAlchemy Core 功能，包括带有 `JOIN`（`INNER`、`LEFT OUTER`、`FULL OUTER`、`CROSS`）的 `SELECT` 查询、`WHERE` 子句、`ORDER BY`、`LIMIT`/`OFFSET`、`DISTINCT` 操作、带 `WHERE` 条件的轻量级 `DELETE` 语句、表反射，以及基础 DDL 操作（`CREATE TABLE`、`CREATE`/`DROP DATABASE`）。尽管它不支持高级 ORM 功能或高级 DDL 功能，但为在 ClickHouse 面向 OLAP 的数据库上运行的大多数分析型工作负载提供了强大的查询能力。
* 核心驱动和 [ClickHouse Connect SQLAlchemy](sqlalchemy.md) 实现是将 ClickHouse 连接到 Apache Superset 的首选方式。请使用 `ClickHouse Connect` 数据库连接，或使用 `clickhousedb` SQLAlchemy dialect 连接字符串。

本文档内容基于 clickhouse-connect 0.9.2 版本。

:::note
官方 ClickHouse Connect Python 驱动使用 HTTP 协议与 ClickHouse 服务器通信。这使其能够支持 HTTP 负载均衡器，并且在包含防火墙和代理的企业环境中运行良好，但与原生基于 TCP 的协议相比，其压缩率和性能略低，且不支持某些高级特性，例如查询取消。在某些使用场景下，可以考虑使用基于原生 TCP 协议的 [社区 Python 驱动](/interfaces/third-party/client-libraries.md)。
:::

## 要求和兼容性 \{#requirements-and-compatibility\}

|       Python |   |       平台¹ |   |      ClickHouse |    | SQLAlchemy² |   | Apache Superset |   |  Pandas |   | Polars |   |
|-------------:|:--|------------:|:--|----------------:|:---|------------:|:--|----------------:|:--|--------:|:--|-------:|:--|
| 2.x, &lt;3.9 | ❌ |     Linux (x86) | ✅ |       &lt;25.x³ | 🟡 |  &lt;1.4.40 | ❌ |         &lt;1.4 | ❌ | ≥1.5 | ✅ |    1.x | ✅ |
|        3.9.x | ✅ | Linux (Aarch64) | ✅ |           25.x³ | 🟡 |  ≥1.4.40 | ✅ |           1.4.x | ✅ |     2.x | ✅ |        |   |
|       3.10.x | ✅ |     macOS (x86) | ✅ |    25.3.x (LTS) | ✅  |     ≥2.x | ✅ |           1.5.x | ✅ |         |   |        |   |
|       3.11.x | ✅ |     macOS (ARM) | ✅ | 25.6.x (Stable) | ✅  |             |   |           2.0.x | ✅ |         |   |        |   |
|       3.12.x | ✅ |         Windows | ✅ | 25.7.x (Stable) | ✅  |             |   |           2.1.x | ✅ |         |   |        |   |
|       3.13.x | ✅ |                 |   |    25.8.x (LTS) | ✅  |             |   |           3.0.x | ✅ |         |   |        |   |
|              |   |                 |   | 25.9.x (Stable) | ✅  |             |   |                 |   |         |   |        |   |

¹ClickHouse Connect 已在上述列出的平台上进行了专门测试。此外，还针对优秀的 [`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/) 项目所支持的所有架构构建了未经测试的二进制 wheel 包（带 C 优化）。最后，由于 ClickHouse Connect 也可以以纯 Python 方式运行，其源码安装在任何较新的 Python 环境中都应能正常工作。

²SQLAlchemy 支持仅限于 Core 功能（查询、基础 DDL），不支持 ORM 功能。详情请参阅 [SQLAlchemy 集成支持](sqlalchemy.md) 文档。

³ClickHouse Connect 在官方支持范围之外的版本上通常也能良好运行。

## 安装 \{#installation\}

通过 pip 从 [PyPI](https://pypi.org/project/clickhouse-connect/) 安装 ClickHouse Connect：

`pip install clickhouse-connect`

ClickHouse Connect 也可以从源代码安装：

* 使用 `git clone` 克隆 [GitHub 仓库](https://github.com/ClickHouse/clickhouse-connect)
* （可选）运行 `pip install cython` 以构建并启用 C/Cython 优化
* 使用 `cd` 切换到项目根目录并运行 `pip install .`

## 支持策略 \{#support-policy\}

在报告任何问题之前，请先升级到最新版本的 ClickHouse Connect。请在 [GitHub 项目](https://github.com/ClickHouse/clickhouse-connect/issues) 中提交问题。ClickHouse Connect 的后续版本会尽量与发布时仍处于主动支持状态的 ClickHouse 版本保持兼容。当前处于主动支持状态的 ClickHouse 服务器版本列表见[此处](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)。如果不确定应使用哪个版本的 ClickHouse 服务器，请阅读[此处](https://clickhouse.com/docs/knowledgebase/production#how-to-choose-between-clickhouse-releases)的讨论。我们的 CI 测试矩阵会针对最新的两个 LTS 版本和最新的三个稳定版本进行测试。不过，由于使用 HTTP 协议且 ClickHouse 各发行版本之间的破坏性变更极少，ClickHouse Connect 通常在超出官方支持范围的服务器版本上也能正常工作，但对某些高级数据类型的兼容性可能会有所差异。

## 基本用法 \{#basic-usage\}

### 收集连接信息 \{#gather-your-connection-details\}

<ConnectionDetails />

### 建立连接 \{#establish-a-connection\}

如下示例演示了两种连接 ClickHouse 的方式：

* 连接到本地主机上的 ClickHouse 服务器。
* 连接到 ClickHouse Cloud 服务。

#### 使用 ClickHouse Connect 客户端实例连接到本地 ClickHouse 服务器： \{#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```

#### 使用 ClickHouse Connect 客户端实例连接到 ClickHouse Cloud 服务： \{#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service\}

:::tip
使用之前获取的连接信息。ClickHouse Cloud 服务需要 TLS，因此请使用端口 8443。
:::

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```

### 与数据库交互 \{#interact-with-your-database\}

要执行 ClickHouse SQL 命令，请使用客户端的 `command` 方法：

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

要插入批量数据，请使用客户端 `insert` 方法，并传入一个由多行及其对应值组成的二维数组：

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])
```

要通过 ClickHouse SQL 查询数据，请使用客户端的 `query` 方法：

```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
print(result.result_rows)
# Output: [(2000, -50.9035)]
```
