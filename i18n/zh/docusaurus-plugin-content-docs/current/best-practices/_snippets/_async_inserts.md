---
{}
---

import Image from '@theme/IdealImage';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';

异步插入在 ClickHouse 中提供了一种强大的替代方案，当客户端批处理不可行时尤其有价值。这在可观察性工作负载中尤为重要，在这些工作负载中，成百上千个代理会持续发送数据 - 日志、指标、追踪 - 通常是小型的实时负载。在这些环境中，客户端缓冲数据会增加复杂性，需要一个集中式队列来确保可以发送足够大的批次。

:::note
在同步模式下发送许多小批次并不推荐，这会导致创建许多分区片段。这将导致查询性能不佳和 ["too many part"](/knowledgebase/exception-too-many-parts) 错误。
:::

异步插入将批处理责任从客户端转移到服务器，通过将传入的数据写入内存缓冲区，然后根据可配置的阈值刷新到存储。这种方法显著减少了分区片段创建的开销，降低了 CPU 使用率，并确保即使在高并发情况下，数据摄取也能保持高效。

核心行为通过 [`async_insert`](/operations/settings/settings#async_insert) 设置控制。

<Image img={async_inserts} size="lg" alt="异步插入"/>

当启用 (1) 时，插入会被缓冲，并且仅在满足以下刷新条件之一时写入磁盘：

(1) 缓冲区达到指定大小（async_insert_max_data_size）
(2) 超过时间阈值（async_insert_busy_timeout_ms） 或 
(3) 累积的插入查询到达最大数量（async_insert_max_query_number）。

这一批处理过程对客户端是不可见的，有助于 ClickHouse 从多个来源高效合并插入流量。然而，在刷新之前，数据无法被查询。重要的是，每个插入形状和设置组合都有多个缓冲区，并且在集群中，缓冲区按节点维护 - 使得在多租户环境中能够进行细粒度控制。插入机制与 [同步插入](/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default) 中描述的基本相同。

### 选择返回模式 {#choosing-a-return-mode}

异步插入的行为通过 [`wait_for_async_insert`](/operations/settings/settings#wait_for_async_insert) 设置进一步细化。

当设置为 1（默认值）时，ClickHouse 仅在数据成功刷新到磁盘后才能确认插入。这确保了强耐久性保证，并使错误处理变得简单：如果在刷新过程中出现问题，错误会返回给客户端。这种模式推荐用于大多数生产场景，特别是当插入失败必须可靠跟踪时。

[基准测试](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) 显示它在并发情况下扩展良好 - 无论您是运行 200 个还是 500 个客户端 - 这得益于自适应插入和稳定的分区片段创建行为。

设置 `wait_for_async_insert = 0` 启用“火忘”模式。在这里，服务器在数据缓冲后立即确认插入，而无需等待其达到存储。

这提供了超低延迟的插入和最大吞吐量，非常适合高速、低重要性的数据。然而，这也带来了一些权衡：没有保证数据会被持久化，错误可能只会在刷新时显现，并且很难追踪失败的插入。仅当您的工作负载能够容忍数据丢失时，使用这种模式。

[基准测试还演示了](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) 当缓冲区刷新不频繁（例如每 30 秒）时，分区片段显著减少和 CPU 使用率降低，但静默失败的风险仍然存在。

我们强烈建议在使用异步插入时使用 `async_insert=1,wait_for_async_insert=1`。使用 `wait_for_async_insert=0` 是非常危险的，因为您的 INSERT 客户端可能不知晓是否存在错误，并且在 ClickHouse 服务器需要减慢写入速度并施加一定的反压以确保服务的可靠性时，也可能导致潜在的过载。

### 去重和可靠性 {#deduplication-and-reliability}

默认情况下，ClickHouse 为同步插入执行自动去重，这使得在失败场景中重试是安全的。然而，对于异步插入，这是禁用的，除非显式启用（如果您有依赖的物化视图，则不应启用 - [参见问题](https://github.com/ClickHouse/ClickHouse/issues/66003)）。

实际上，如果开启了去重并且相同的插入被重试 - 由于时间超时或网络掉线等原因 - ClickHouse 可以安全地忽略重复。这有助于保持幂等性，避免重复写入数据。值得注意的是，插入验证和模式解析仅在缓冲区刷新时发生 - 因此错误（如类型不匹配）仅在那个时候显现。

### 启用异步插入 {#enabling-asynchronous-inserts}

可以为特定用户或特定查询启用异步插入：

- 在用户级别启用异步插入。这个示例使用用户 `default`，如果您创建了不同的用户，则替换该用户名：
```sql
  ALTER USER default SETTINGS async_insert = 1
```
- 您可以通过使用插入查询的 SETTINGS 子句来指定异步插入设置：
```sql
  INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
```
- 当使用 ClickHouse 编程语言客户端时，您也可以将异步插入设置作为连接参数指定。

  例如，当您使用 ClickHouse Java JDBC 驱动程序连接到 ClickHouse Cloud 时，这就是您可以在 JDBC 连接字符串中做到这一点的方式：
```bash
  "jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
```
