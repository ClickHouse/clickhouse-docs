import Image from '@theme/IdealImage';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';

异步插入在 ClickHouse 中提供了一种强大的替代方案，当客户端批处理不可行时显得尤为重要。这在可观察性工作负载中尤其有价值，其中数百或数千个代理持续发送数据 - 日志、指标、跟踪 - 通常以小的实时有效负载进行。为了在这些环境中客户端缓冲数据，复杂性增加，需要一个集中队列来确保可以发送足够大的批量。

:::note
不推荐以同步模式发送许多小批次，这样会导致创建许多 parts。这将导致查询性能差和 ["too many part"](/knowledgebase/exception-too-many-parts) 错误。
:::

异步插入通过将传入数据写入内存缓冲区，然后根据可配置的阈值刷新到存储中，将批处理责任从客户端转移到服务器。这种方法显著降低了部分创建的开销，降低了 CPU 使用率，并确保即使在高并发下，数据摄取也保持高效。

核心行为通过 [`async_insert`](/operations/settings/settings#async_insert) 设置进行控制。

<Image img={async_inserts} size="lg" alt="异步插入"/>

启用时 (1)，插入被缓冲，只有在满足其中一个刷新条件时才写入磁盘：

(1) 缓冲区达到指定大小 (async_insert_max_data_size)
(2) 已经过了时间阈值 (async_insert_busy_timeout_ms) 或 
(3) 累积的插入查询达到最大数量 (async_insert_max_query_number)。 

这个批处理过程对客户端是不可见的，并帮助 ClickHouse 有效地合并来自多个源的插入流量。然而，在发生刷新之前，数据无法被查询。重要的是，对于每个插入形状和设置组合有多个缓冲区，并且在集群中，缓冲区按节点维护 - 这使得在多租户环境中可以进行细粒度控制。插入机制与 [同步插入](/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default) 描述的相同。

### 选择返回模式 {#choosing-a-return-mode}

异步插入的行为通过 [`wait_for_async_insert`](/operations/settings/settings#wait_for_async_insert) 设置进一步细化。

当设置为 1（默认值）时，ClickHouse 只有在数据成功刷新到磁盘后才确认插入。这确保了强大的耐久性保证，并使错误处理变得简单：如果在刷新过程中出现问题，错误将返回给客户端。这个模式推荐用于大多数生产场景，特别是在必须可靠地跟踪插入失败时。

[基准测试](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) 显示它在并发时扩展良好 - 无论你是运行 200 还是 500 个客户端 - 这要归功于自适应插入和稳定的部分创建行为。

将 `wait_for_async_insert = 0` 设置为“ fire-and-forget”模式。在这里，服务器在数据缓冲后立即确认插入，而不等待其到达存储。

这提供了超低延迟插入和最大吞吐量，非常适合高速、低重要性数据。然而，这带来了权衡：没有保证数据会被持久化，错误可能仅在刷新期间浮现，并且难以追踪失败的插入。仅在你的工作负载能够容忍数据丢失时使用此模式。

[基准测试还显示](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) 当缓冲刷新不频繁（例如每 30 秒一次）时，部分减少和 CPU 使用率降低，但静默失败的风险仍然存在。

我们强烈建议使用 `async_insert=1,wait_for_async_insert=1`，如果使用异步插入。使用 `wait_for_async_insert=0` 风险很大，因为你的 INSERT 客户端可能无法意识到是否存在错误，并且在 ClickHouse 服务器需要减慢写入并产生一定的反压以确保服务的可靠性时，可能会导致潜在的过载。

### 去重和可靠性 {#deduplication-and-reliability}

默认情况下，ClickHouse 对于同步插入执行自动去重，这使得在出现故障场景时重试很安全。然而，对于异步插入，此功能默认是禁用的，除非显式启用（如果你有依赖的物化视图，则不应启用 - [参见问题](https://github.com/ClickHouse/ClickHouse/issues/66003)）。

实际上，如果去重被开启，并且由于超时或网络中断重试了相同的插入，ClickHouse 可以安全地忽略重复插入。这有助于保持幂等性并避免数据的重复写入。然而，值得注意的是，插入验证和模式解析只在缓冲刷新期间进行 - 所以错误（如类型不匹配）只会在那时显现出来。

### 启用异步插入 {#enabling-asynchronous-inserts}

异步插入可以为特定用户或特定查询启用：

- 在用户级别启用异步插入。这个例子使用用户 `default`，如果你创建了不同的用户则替换该用户名：
```sql
ALTER USER default SETTINGS async_insert = 1
```
- 你可以通过使用插入查询的 SETTINGS 子句来指定异步插入设置：
```sql
INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
```
- 你还可以在使用 ClickHouse 编程语言客户端时将异步插入设置作为连接参数指定。

  作为示例，在使用 ClickHouse Java JDBC 驱动程序连接到 ClickHouse Cloud 时，这就是你可以在 JDBC 连接字符串中做到的：
```bash
"jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
```
