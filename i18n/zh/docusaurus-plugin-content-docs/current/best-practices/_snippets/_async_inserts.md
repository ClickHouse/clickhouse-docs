import Image from '@theme/IdealImage';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';

Asynchronous inserts in ClickHouse 提供了一个强大的替代方案，当客户端批处理不可行时。这在可观测性工作负载中尤为重要，在这些工作负载中，数百或数千个代理持续发送数据 - 日志、指标、追踪 - 通常是在小的实时负载中。在这些环境中，在客户端缓冲数据会增加复杂性，需要一个集中队列来确保能够发送足够大的批次。

:::note
在同步模式下发送许多小批次是不推荐的，这会导致创建许多 parts。这将导致查询性能差和 ["too many part"](/knowledgebase/exception-too-many-parts) 错误。
:::

异步插入通过将传入数据写入内存缓冲区，再根据可配置的阈值将其刷新到存储，将批处理责任从客户端转移到服务器。这种方法显著减少了 part 创建的开销，降低了 CPU 使用率，并确保在高并发情况下仍能高效地摄取数据。

核心行为通过 [`async_insert`](/operations/settings/settings#async_insert) 设置进行控制。

<Image img={async_inserts} size="lg" alt="Async inserts"/>

当启用时 (1)，插入会被缓冲，并且只有在满足以下刷新条件之一时才会写入磁盘：

(1) 缓冲区达到指定大小 (async_insert_max_data_size)
(2) 经过时间阈值 (async_insert_busy_timeout_ms) 或
(3) 累积最多插入查询数量 (async_insert_max_query_number)。

这一批处理过程对客户端是不可见的，有助于 ClickHouse 高效地合并来自多个来源的插入流量。然而，在刷新发生之前，数据无法被查询。重要的是，每种插入形状和设置组合都有多个缓冲区，而在集群中，缓冲区是按节点维护的 - 使得在多租户环境中能够进行细粒度控制。插入机制与 [同步插入](/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default) 的描述基本相同。

### 选择返回模式 {#choosing-a-return-mode}

异步插入的行为进一步利用 [`wait_for_async_insert`](/operations/settings/settings#wait_for_async_insert) 设置进行细化。

当设置为 1（默认值）时，ClickHouse 仅在数据成功刷新到磁盘后才确认插入。这确保了强大的持久性保证，并使错误处理变得简单：如果在刷新过程中出现问题，则错误会返回给客户端。这个模式推荐用于大多数生产场景，特别是当需要可靠跟踪插入失败时。

[基准测试](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) 显示在并发性方面表现良好- 无论您是运行 200 个还是 500 个客户端 - 得益于自适应插入和稳定的 part 创建行为。

设置 `wait_for_async_insert = 0` 启用“即插即用”模式。在这里，服务器在数据被缓冲后立即确认插入，而不等待其到达存储。

这提供了超低延迟的插入和最大吞吐量，非常适合高速、低重要性的数据。然而，这伴随着权衡：无法保证数据会被持久化，错误可能只会在刷新期间显现，并且难以追踪失败的插入。仅在工作负载能够容忍数据丢失的情况下使用此模式。

[基准测试还表明](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) 当缓冲刷新不频繁（例如每 30 秒一次）时，parts 的显著减少和较低的 CPU 使用率，但无声故障的风险仍然存在。

我们的强烈建议是在使用异步插入时使用 `async_insert=1,wait_for_async_insert=1`。使用 `wait_for_async_insert=0` 风险很高，因为您的 INSERT 客户端可能无法意识到是否存在错误，并且如果您的客户端继续快速写入而 ClickHouse 服务器需要减缓写入速度并创建一些回压以确保服务的可靠性，这也可能导致潜在的过载。

### 去重和可靠性 {#deduplication-and-reliability}

默认情况下，ClickHouse 对于同步插入执行自动去重，这使得在失败场景中重试是安全的。然而，除非明确启用，否则异步插入将禁用去重（如果您有相关的物化视图，则不应启用 - [参见问题](https://github.com/ClickHouse/ClickHouse/issues/66003)）。

实际上，如果去重打开并且由于超时或网络中断等原因重试相同的插入，ClickHouse 可以安全地忽略重复。这有助于保持幂等性并避免重复写入数据。不过，值得注意的是，插入验证和模式解析仅在缓冲刷新期间进行 - 因此错误（例如类型不匹配）仅会在此时显现。

### 启用异步插入 {#enabling-asynchronous-inserts}

可以为特定用户或特定查询启用异步插入：

- 在用户级别启用异步插入。此示例使用用户 `default`，如果您创建了不同的用户，请替换该用户名：
```sql
ALTER USER default SETTINGS async_insert = 1
```
- 您可以通过在插入查询的 SETTINGS 子句中指定异步插入设置：
```sql
INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
```
- 使用 ClickHouse 编程语言客户端时，您也可以将异步插入设置指定为连接参数。

  例如，当您使用 ClickHouse Java JDBC 驱动程序连接到 ClickHouse Cloud 时，可以在 JDBC 连接字符串中这样做：
```bash
"jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
```
