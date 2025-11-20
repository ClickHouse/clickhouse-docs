import Image from "@theme/IdealImage"
import async_inserts from "@site/static/images/bestpractices/async_inserts.png"

在无法在客户端进行批量处理时，ClickHouse 的异步插入提供了一种功能强大的替代方案。这在可观测性工作负载中尤为重要，此类场景下有数百甚至数千个 agent 持续发送数据——日志、指标、追踪数据——并且通常是小而实时的负载。在这些环境中在客户端侧缓冲数据会增加系统复杂度，需要一个集中式队列来确保能够发送足够大的批次。

:::note
不建议在同步模式下发送大量小批次数据，因为这会导致创建过多的数据分片（part），进而造成查询性能下降，并触发 ["too many part"](/knowledgebase/exception-too-many-parts) 错误。
:::

异步插入通过将传入数据写入内存缓冲区，并根据可配置的阈值将其刷新到存储中，从而将批处理的责任从客户端转移到服务端。这种方式可以显著减少分片创建的开销、降低 CPU 使用率，并确保在高并发场景下数据写入依然高效。

该机制的核心行为由 [`async_insert`](/operations/settings/settings#async_insert) 设置控制。

<Image img={async_inserts} size='lg' alt='Async inserts' />

当启用该设置（值为 1）时，插入数据会先进入缓冲区，仅在满足任一刷新条件后才写入磁盘：

(1) 缓冲区达到指定大小（async_insert_max_data_size）  
(2) 达到时间阈值（async_insert_busy_timeout_ms），或  
(3) 已累计的 INSERT 查询数量达到上限（async_insert_max_query_number）。

这个批处理过程对客户端是透明的，有助于 ClickHouse 高效合并来自多个源的插入流量。不过，在刷新发生之前，这些数据是无法被查询到的。需要特别注意的是：针对不同的插入形态和设置组合会维护多个缓冲区，在集群中则会按节点分别维护缓冲区——从而在多租户环境中实现细粒度控制。除此之外，插入机制与 [synchronous inserts](/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default) 中描述的同步插入是相同的。

### 选择返回模式 {#choosing-a-return-mode}

可以通过 [`wait_for_async_insert`](/operations/settings/settings#wait_for_async_insert) 设置对异步插入的行为进行进一步细化控制。

当该设置为 1（默认值）时，ClickHouse 仅在数据成功刷新到磁盘后才确认插入。这可以提供强有力的持久性保证，并简化错误处理：如果在刷新过程中发生问题，错误会返回给客户端。此模式推荐用于大多数生产场景，尤其适用于需要可靠追踪插入失败的情况。

[基准测试](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)表明，该模式在并发场景下具有良好的扩展性——无论是 200 还是 500 个客户端——这得益于自适应插入机制和稳定的分片创建行为。

将 `wait_for_async_insert = 0` 时会启用“fire-and-forget”（发出即忘）模式。在此模式下，服务器在数据写入缓冲区后立刻确认插入，而不会等待其真正落入存储。

此模式可以提供极低延迟的插入和最大吞吐量，适合高流速、低重要性的数据。然而，这也带来了权衡：无法保证数据一定会被持久化，错误可能只会在刷新阶段才暴露，而且很难追踪失败的插入。仅当你的工作负载可以容忍数据丢失时才应使用此模式。

[基准测试还表明](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)，当缓冲区刷新不太频繁（例如每 30 秒一次）时，可以显著减少分片数量并降低 CPU 使用率，但静默失败的风险依然存在。

在使用异步插入时，我们强烈建议采用 `async_insert=1,wait_for_async_insert=1` 的配置。使用 `wait_for_async_insert=0` 风险很高，因为你的 INSERT 客户端可能无法感知错误的发生，而且在 ClickHouse 服务器需要降低写入速度、制造一定反压以保证服务可靠性的情况下，客户端若仍持续高速写入，可能会导致潜在的过载。

### 去重与可靠性 {#deduplication-and-reliability}

默认情况下，ClickHouse 会对同步插入自动执行去重，从而在失败场景下使重试变得安全。然而，对于异步插入，该功能默认是关闭的，只有显式开启时才会生效（如果存在依赖的物化视图，则不应开启此功能——[参见 issue](https://github.com/ClickHouse/ClickHouse/issues/66003)）。

在实践中，如果开启了去重，并且由于超时或网络中断等原因重试了同一条插入，ClickHouse 可以安全地忽略重复数据。这有助于保持操作幂等性并避免重复写入。不过，需要注意的是，插入校验和模式解析仅在缓冲区刷新时才会进行——因此，诸如类型不匹配之类的错误也只会在那个时刻才暴露出来。


### 启用异步插入 {#enabling-asynchronous-inserts}

异步插入可以针对特定用户或特定查询启用：

- 在用户级别启用异步插入。本示例使用 `default` 用户，如果您创建了其他用户，请替换为对应的用户名：
  ```sql
  ALTER USER default SETTINGS async_insert = 1
  ```
- 您可以在插入查询中使用 SETTINGS 子句来指定异步插入设置：
  ```sql
  INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
  ```
- 使用 ClickHouse 编程语言客户端时，您还可以将异步插入设置指定为连接参数。

  例如，使用 ClickHouse Java JDBC 驱动程序连接到 ClickHouse Cloud 时，可以在 JDBC 连接字符串中进行如下设置：

  ```bash
  "jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
  ```
