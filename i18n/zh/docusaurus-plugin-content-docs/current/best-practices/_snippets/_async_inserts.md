import Image from "@theme/IdealImage"
import async_inserts from "@site/static/images/bestpractices/async_inserts.png"

当客户端批处理不可行时,ClickHouse 中的异步插入提供了一个强大的替代方案。这在可观测性工作负载中尤其有价值,在这些场景中,数百或数千个代理持续发送数据——日志、指标、追踪——通常以小型实时负载的形式。在这些环境中于客户端缓冲数据会增加复杂性,需要一个集中式队列来确保可以发送足够大的批次。

:::note
不建议在同步模式下发送许多小批次,这会导致创建大量数据分区。这将导致查询性能不佳和["分区过多"](/knowledgebase/exception-too-many-parts)错误。
:::

异步插入通过将传入数据写入内存缓冲区,然后根据可配置的阈值将其刷新到存储,将批处理责任从客户端转移到服务器。这种方法显著减少了数据分区创建开销,降低了 CPU 使用率,并确保即使在高并发情况下数据摄取仍然保持高效。

核心行为通过 [`async_insert`](/operations/settings/settings#async_insert) 设置进行控制。

<Image img={async_inserts} size='lg' alt='异步插入' />

启用时(1),插入会被缓冲,并且只有在满足以下刷新条件之一时才会写入磁盘:

(1) 缓冲区达到指定大小(async_insert_max_data_size)
(2) 经过时间阈值(async_insert_busy_timeout_ms)或
(3) 累积的插入查询数量达到最大值(async_insert_max_query_number)。

这个批处理过程对客户端是透明的,有助于 ClickHouse 高效地合并来自多个源的插入流量。但是,在刷新发生之前,数据无法被查询。重要的是,每个插入形状和设置组合都有多个缓冲区,在集群中,每个节点都维护缓冲区——这使得在多租户环境中能够进行细粒度控制。插入机制在其他方面与[同步插入](/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default)中描述的相同。

### 选择返回模式 {#choosing-a-return-mode}

异步插入的行为通过 [`wait_for_async_insert`](/operations/settings/settings#wait_for_async_insert) 设置进一步细化。

当设置为 1(默认值)时,ClickHouse 仅在数据成功刷新到磁盘后才确认插入。这确保了强持久性保证,并使错误处理变得简单:如果在刷新期间出现问题,错误会返回给客户端。对于大多数生产场景,特别是当必须可靠地跟踪插入失败时,建议使用此模式。

[基准测试](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)表明,由于自适应插入和稳定的数据分区创建行为,它在并发方面扩展良好——无论您运行 200 个还是 500 个客户端。

设置 `wait_for_async_insert = 0` 启用"即发即弃"模式。在这种模式下,服务器在数据被缓冲后立即确认插入,而无需等待其到达存储。

这提供了超低延迟的插入和最大吞吐量,非常适合高速、低关键性的数据。但是,这也有权衡:无法保证数据会被持久化,错误可能仅在刷新期间出现,并且难以追踪失败的插入。仅当您的工作负载可以容忍数据丢失时才使用此模式。

[基准测试还表明](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse),当缓冲区刷新不频繁时(例如每 30 秒),数据分区数量大幅减少且 CPU 使用率降低,但静默失败的风险仍然存在。

我们强烈建议在使用异步插入时使用 `async_insert=1,wait_for_async_insert=1`。使用 `wait_for_async_insert=0` 非常危险,因为您的 INSERT 客户端可能不会意识到是否存在错误,并且如果在 ClickHouse 服务器需要减慢写入速度并创建一些反压以确保服务可靠性的情况下,您的客户端继续快速写入,也可能导致潜在的过载。

### 去重和可靠性 {#deduplication-and-reliability}

默认情况下,ClickHouse 对同步插入执行自动去重,这使得在失败场景中重试是安全的。但是,对于异步插入,除非明确启用,否则此功能是禁用的(如果您有依赖的物化视图,则不应启用此功能——[参见问题](https://github.com/ClickHouse/ClickHouse/issues/66003))。

在实践中,如果启用了去重并且重试了相同的插入——例如由于超时或网络中断——ClickHouse 可以安全地忽略重复项。这有助于保持幂等性并避免重复写入数据。不过,值得注意的是,插入验证和模式解析仅在缓冲区刷新期间发生——因此错误(如类型不匹配)只会在那时出现。


### 启用异步插入 {#enabling-asynchronous-inserts}

可以为特定用户或特定查询启用异步插入:

- 在用户级别启用异步插入。此示例使用 `default` 用户,如果您创建了其他用户,请替换为相应的用户名:
  ```sql
  ALTER USER default SETTINGS async_insert = 1
  ```
- 您可以在插入查询中使用 SETTINGS 子句来指定异步插入设置:
  ```sql
  INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
  ```
- 使用 ClickHouse 编程语言客户端时,您还可以将异步插入设置指定为连接参数。

  例如,使用 ClickHouse Java JDBC 驱动程序连接到 ClickHouse Cloud 时,可以在 JDBC 连接字符串中进行如下设置:

  ```bash
  "jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
  ```
