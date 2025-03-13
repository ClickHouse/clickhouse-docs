---
slug: /cloud/bestpractices/asynchronous-inserts
sidebar_label: 异步插入
title: 异步插入 (async_insert)
---

import asyncInsert01 from '@site/static/images/cloud/bestpractices/async-01.png';
import asyncInsert02 from '@site/static/images/cloud/bestpractices/async-02.png';
import asyncInsert03 from '@site/static/images/cloud/bestpractices/async-03.png';

以大批量的方式将数据插入 ClickHouse 是一种最佳实践。这可以节省计算周期和磁盘 I/O，从而节省成本。如果您的用例允许您在 ClickHouse 之外批量插入数据，这是一个选项。如果您希望 ClickHouse 创建批量插入，则可以使用此处描述的异步 INSERT 模式。

将异步插入用作在客户端批量处理数据和保持插入速率在每秒大约一个插入查询的替代方案，通过启用 [async_insert](/operations/settings/settings.md/#async_insert) 设置。这将导致 ClickHouse 在服务器端处理批量插入。

默认情况下，ClickHouse 是以同步方式写入数据的。
每个发送到 ClickHouse 的插入都会导致 ClickHouse 立即创建一个包含插入数据的分片。
这是当 async_insert 设置为其默认值 0 时的默认行为：

<img src={asyncInsert01}
  class="image"
  alt="异步插入过程 - 默认同步插入"
  style={{width: '100%', background: 'none'}} />

通过将 async_insert 设置为 1，ClickHouse 会先将输入的插入存储到内存缓冲区，然后定期将其刷新到磁盘。

可以导致 ClickHouse 刷新缓冲区到磁盘的两种条件：
- 缓冲区大小已达到 N 字节（N 可通过 [async_insert_max_data_size](/operations/settings/settings.md/#async_insert_max_data_size) 配置）
- 自上次缓冲区刷新以来已至少过去 N 毫秒（N 可通过 [async_insert_busy_timeout_max_ms](/operations/settings/settings.md/#async_insert_busy_timeout_max_ms) 配置）

每当满足上述任何条件时，ClickHouse 都会将其内存缓冲区刷新到磁盘。

:::note
您的数据在写入存储分区后将可用于读取查询。请记住这一点，以便在您想要修改 `async_insert_busy_timeout_ms`（默认设置为 1 秒）或 `async_insert_max_data_size`（默认设置为 10 MiB）设置时。
:::

通过 [wait_for_async_insert](/operations/settings/settings.md/#wait_for_async_insert) 设置，您可以配置插入语句是希望在数据插入缓冲区后立即返回确认（wait_for_async_insert = 0），还是默认在从缓冲区刷新后数据写入分区之后返回确认（wait_for_async_insert = 1）。

以下两个图示说明了 async_insert 和 wait_for_async_insert 的两个设置：

<img src={asyncInsert02}
  class="image"
  alt="异步插入过程 - async_insert=1, wait_for_async_insert=1"
  style={{width: '100%', background: 'none'}} />

<img src={asyncInsert03}
  class="image"
  alt="异步插入过程 - async_insert=1, wait_for_async_insert=0"
  style={{width: '100%', background: 'none'}} />

### 启用异步插入 {#enabling-asynchronous-inserts}

可以为特定用户或特定查询启用异步插入：

- 在用户级别启用异步插入。此示例使用用户 `default`，如果您创建了不同的用户，请替换该用户名：
  ```sql
  ALTER USER default SETTINGS async_insert = 1
  ```
- 通过在插入查询中使用 SETTINGS 子句，可以指定异步插入设置：
  ```sql
  INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
  ```
- 当使用 ClickHouse 编程语言客户端时，也可以将异步插入设置作为连接参数指定。

  例如，当您使用 ClickHouse Java JDBC 驱动程序连接到 ClickHouse Cloud 时，可以通过 JDBC 连接字符串这样做：
  ```bash
  "jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
  ```
我们的强烈建议是在使用异步插入时使用 async_insert=1,wait_for_async_insert=1。使用 wait_for_async_insert=0 非常危险，因为您的 INSERT 客户端可能无法了解是否存在错误，并且如果您的客户端在 ClickHouse 服务器需要减缓写入速度并创建一些反压以确保服务的可靠性时继续快速写入，可能会导致潜在的过载。

:::note 使用异步插入时，自动去重默认情况下是禁用的
手动批量插入（见 [bulk insert](/cloud/bestpractices/bulkinserts.md)）的优势在于，如果（恰好）对 ClickHouse Cloud 发送了相同的插入语句多次，例如，由于客户端软件因某些临时网络连接问题而进行的自动重试，则支持 [内置的自动去重](/engines/table-engines/mergetree-family/replication.md)。
:::
