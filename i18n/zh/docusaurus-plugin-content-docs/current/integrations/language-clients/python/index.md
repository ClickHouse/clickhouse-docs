---
keywords: ['clickhouse', 'python', 'client', 'connect', 'integrate']
slug: /integrations/python
description: '用于将 Python 连接到 ClickHouse 的 ClickHouse Connect 项目套件'
title: '通过 ClickHouse Connect 集成 Python'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-connect'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# 简介 {#introduction}

ClickHouse Connect 是一个核心数据库驱动程序,可与各种 Python 应用程序实现互操作性。

- 主要接口是 `clickhouse_connect.driver` 包中的 `Client` 对象。该核心包还包含用于与 ClickHouse 服务器通信的各种辅助类和实用函数,以及用于高级管理插入和查询操作的"上下文"实现。
- `clickhouse_connect.datatypes` 包为所有非实验性 ClickHouse 数据类型提供基础实现和子类。其主要功能是将 ClickHouse 数据序列化和反序列化为 ClickHouse "Native" 二进制列式格式,以实现 ClickHouse 与客户端应用程序之间最高效的数据传输。
- `clickhouse_connect.cdriver` 包中的 Cython/C 类优化了一些最常见的序列化和反序列化操作,相比纯 Python 实现可显著提升性能。
- `clickhouse_connect.cc_sqlalchemy` 包中提供了基于 `datatypes` 和 `dbi` 包构建的 [SQLAlchemy](https://www.sqlalchemy.org/) 方言。该实现支持 SQLAlchemy Core 功能,包括带 `JOIN` 的 `SELECT` 查询(`INNER`、`LEFT OUTER`、`FULL OUTER`、`CROSS`)、`WHERE` 子句、`ORDER BY`、`LIMIT`/`OFFSET`、`DISTINCT` 操作、带 `WHERE` 条件的轻量级 `DELETE` 语句、表反射以及基本 DDL 操作(`CREATE TABLE`、`CREATE`/`DROP DATABASE`)。虽然它不支持高级 ORM 功能或高级 DDL 功能,但它提供了强大的查询能力,适用于针对 ClickHouse 面向 OLAP 的数据库的大多数分析工作负载。
- 核心驱动程序和 [ClickHouse Connect SQLAlchemy](sqlalchemy.md) 实现是将 ClickHouse 连接到 Apache Superset 的首选方法。请使用 `ClickHouse Connect` 数据库连接或 `clickhousedb` SQLAlchemy 方言连接字符串。

本文档基于 clickhouse-connect 0.9.2 版本编写。

:::note
官方 ClickHouse Connect Python 驱动程序使用 HTTP 协议与 ClickHouse 服务器通信。这使其支持 HTTP 负载均衡器,并且在具有防火墙和代理的企业环境中运行良好,但与原生基于 TCP 的协议相比,其压缩率和性能略低,并且缺乏对某些高级功能(如查询取消)的支持。对于某些使用场景,您可以考虑使用基于原生 TCP 协议的[社区 Python 驱动程序](/interfaces/third-party/client-libraries.md)之一。
:::


## 要求与兼容性 {#requirements-and-compatibility}

|       Python |     |       平台¹ |     |      ClickHouse |     | SQLAlchemy² |     | Apache Superset |     |  Pandas |     | Polars |     |
| -----------: | :-- | --------------: | :-- | --------------: | :-- | ----------: | :-- | --------------: | :-- | ------: | :-- | -----: | :-- |
| 2.x, &lt;3.9 | ❌  |     Linux (x86) | ✅  |       &lt;25.x³ | 🟡  |  &lt;1.4.40 | ❌  |         &lt;1.4 | ❌  | &ge;1.5 | ✅  |    1.x | ✅  |
|        3.9.x | ✅  | Linux (Aarch64) | ✅  |           25.x³ | 🟡  |  &ge;1.4.40 | ✅  |           1.4.x | ✅  |     2.x | ✅  |        |     |
|       3.10.x | ✅  |     macOS (x86) | ✅  |    25.3.x (LTS) | ✅  |     &ge;2.x | ✅  |           1.5.x | ✅  |         |     |        |     |
|       3.11.x | ✅  |     macOS (ARM) | ✅  | 25.6.x (Stable) | ✅  |             |     |           2.0.x | ✅  |         |     |        |     |
|       3.12.x | ✅  |         Windows | ✅  | 25.7.x (Stable) | ✅  |             |     |           2.1.x | ✅  |         |     |        |     |
|       3.13.x | ✅  |                 |     |    25.8.x (LTS) | ✅  |             |     |           3.0.x | ✅  |         |     |        |     |
|              |     |                 |     | 25.9.x (Stable) | ✅  |             |     |                 |     |         |     |        |     |

¹ClickHouse Connect 已在所列平台上经过明确测试。此外,还为优秀的 [`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/) 项目所支持的所有架构构建了未经测试的二进制 wheel 包(包含 C 优化)。最后,由于 ClickHouse Connect 也可以作为纯 Python 运行,因此源码安装应该可以在任何较新的 Python 安装环境中正常工作。

²SQLAlchemy 支持仅限于核心功能(查询、基本 DDL)。不支持 ORM 功能。详情请参阅 [SQLAlchemy 集成支持](sqlalchemy.md) 文档。

³ClickHouse Connect 通常也能很好地兼容官方支持范围之外的版本。


## 安装 {#installation}

通过 pip 从 [PyPI](https://pypi.org/project/clickhouse-connect/) 安装 ClickHouse Connect:

`pip install clickhouse-connect`

ClickHouse Connect 也可以从源代码安装:

- 使用 `git clone` 克隆 [GitHub 仓库](https://github.com/ClickHouse/clickhouse-connect)。
- (可选)运行 `pip install cython` 以构建并启用 C/Cython 优化
- 使用 `cd` 进入项目根目录并运行 `pip install .`


## 支持策略 {#support-policy}

在报告任何问题之前,请先更新到 ClickHouse Connect 的最新版本。问题应提交到 [GitHub 项目](https://github.com/ClickHouse/clickhouse-connect/issues)。ClickHouse Connect 的未来版本旨在与发布时处于活跃支持状态的 ClickHouse 版本兼容。ClickHouse 服务器的活跃支持版本可在[此处](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)找到。如果您不确定应使用哪个版本的 ClickHouse 服务器,请阅读[此处](https://clickhouse.com/docs/knowledgebase/production#how-to-choose-between-clickhouse-releases)的讨论。我们的 CI 测试矩阵会针对最新的两个 LTS 版本和最新的三个稳定版本进行测试。然而,由于采用 HTTP 协议且 ClickHouse 版本之间的破坏性变更极少,ClickHouse Connect 通常能够很好地兼容官方支持范围之外的服务器版本,但与某些高级数据类型的兼容性可能会有所不同。


## 基本用法 {#basic-usage}

### 收集连接信息 {#gather-your-connection-details}

<ConnectionDetails />

### 建立连接 {#establish-a-connection}

以下展示了连接 ClickHouse 的两个示例:

- 连接到本地主机上的 ClickHouse 服务器。
- 连接到 ClickHouse Cloud 服务。

#### 使用 ClickHouse Connect 客户端实例连接到本地主机上的 ClickHouse 服务器: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost}

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```

#### 使用 ClickHouse Connect 客户端实例连接到 ClickHouse Cloud 服务: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service}

:::tip
使用之前收集的连接信息。ClickHouse Cloud 服务需要 TLS,因此请使用端口 8443。
:::

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```

### 与数据库交互 {#interact-with-your-database}

要运行 ClickHouse SQL 命令,请使用客户端的 `command` 方法:

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

要插入批量数据,请使用客户端的 `insert` 方法,传入包含行和值的二维数组:

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])
```

要使用 ClickHouse SQL 检索数据,请使用客户端的 `query` 方法:


```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
print(result.result_rows)
# 输出：[(2000, -50.9035)]
```
