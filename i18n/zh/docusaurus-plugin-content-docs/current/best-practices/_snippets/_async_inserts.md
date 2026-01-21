import Image from '@theme/IdealImage';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';

在客户端无法进行批量处理时，ClickHouse 中的异步插入提供了一种强大的替代方案。这在可观测性工作负载中尤为重要，因为数百甚至数千个 agent 会持续发送数据——日志、指标、追踪数据（traces）——通常以小而实时的负载形式发送。在这类环境中在客户端缓冲数据会增加复杂度，需要一个集中式队列来确保可以发送足够大的批次。

:::note
不推荐在同步模式下发送大量小批次，这会导致创建大量数据片（parts）。这将导致查询性能下降，并产生 [&quot;too many part&quot;](/knowledgebase/exception-too-many-parts) 错误。
:::

异步插入通过将批处理的责任从客户端转移到服务器来实现：将传入数据写入内存缓冲区，然后根据可配置阈值刷新到存储中。此方法显著降低了数据片创建的开销，减少 CPU 使用率，并确保在高并发下摄取仍然高效。

核心行为通过 [`async_insert`](/operations/settings/settings#async_insert) 设置进行控制。

<Image img={async_inserts} size="lg" alt="异步插入" />

启用（1）后，插入会被缓冲，只有在满足以下任一刷新条件时才会写入磁盘：

(1) 缓冲区达到指定大小（async&#95;insert&#95;max&#95;data&#95;size）
(2) 达到时间阈值（async&#95;insert&#95;busy&#95;timeout&#95;ms），或
(3) 累积的插入查询数量达到上限（async&#95;insert&#95;max&#95;query&#95;number）。

这一批处理过程对客户端是透明的，有助于 ClickHouse 高效合并来自多个源的插入流量。但在刷新发生之前，这些数据无法被查询。需要注意的是，对于每种插入数据结构（insert shape）与设置组合会有多个缓冲区，在集群中，缓冲区按节点维护——从而在多租户环境中实现细粒度控制。其余插入机制与[同步插入](/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default)中描述的相同。

### 选择返回模式 \{#choosing-a-return-mode\}

异步插入的行为可通过 [`wait_for_async_insert`](/operations/settings/settings#wait_for_async_insert) 设置进行进一步细化。

当设置为 1（默认值）时，ClickHouse 仅在数据成功刷新到磁盘后才确认插入。这确保了强持久性保证，并使错误处理变得简单：如果在刷新期间出现问题，错误会返回给客户端。此模式推荐用于大多数生产场景，尤其是在必须可靠跟踪插入失败时。

[基准测试](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)表明，它在并发规模下表现良好——无论你运行的是 200 还是 500 个客户端——这得益于自适应插入和稳定的数据片创建行为。

将 `wait_for_async_insert = 0` 设置为 0 会开启 “fire-and-forget”（“发出即忘”）模式。在该模式下，服务器在数据被缓冲后立即确认插入，而不会等待其写入存储。

这提供了超低延迟的插入和最大吞吐量，非常适合高速度、低重要性的数据。然而，这也带来了权衡：无法保证数据一定被持久化，错误可能只会在刷新时才暴露，而且难以追踪失败的插入。仅当你的工作负载可以容忍数据丢失时才使用此模式。

[基准测试还表明](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)，当缓冲刷新不频繁（例如每 30 秒一次）时，可以显著减少数据片数量并降低 CPU 使用率，但静默失败的风险依然存在。

我们强烈建议，如果使用异步插入，应设置 `async_insert=1,wait_for_async_insert=1`。使用 `wait_for_async_insert=0` 风险极高，因为你的 INSERT 客户端可能不知道是否发生了错误，并且在 ClickHouse 服务器需要减慢写入速度并施加一定背压以保证服务可靠性的情况下，如果客户端持续快速写入，还可能导致潜在的过载。

### 去重与可靠性 \{#deduplication-and-reliability\}

默认情况下，ClickHouse 会对同步插入执行自动去重，这使得在失败场景下重试是安全的。然而，对于异步插入，这一功能是禁用的，除非显式启用（如果你有依赖的物化视图，则不应启用——[见相关 issue](https://github.com/ClickHouse/ClickHouse/issues/66003)）。

在实践中，如果开启了去重并对同一插入执行重试——例如由于超时或网络中断——ClickHouse 可以安全地忽略重复记录。这有助于保持幂等性并避免数据被写入两次。不过，仍需注意，插入验证和 schema 解析仅在缓冲刷新时执行——因此错误（例如类型不匹配）只会在那个时间点才会暴露出来。

### 启用异步插入 \{#enabling-asynchronous-inserts\}

可以为特定用户或特定查询启用异步插入：

- 在用户级别启用异步插入。此示例使用用户 `default`，如果你创建了其他用户，请将其替换为相应的用户名：
  ```sql
  ALTER USER default SETTINGS async_insert = 1
  ```
- 你可以在插入语句中通过 `SETTINGS` 子句指定异步插入相关设置：
  ```sql
  INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
  ```
- 在使用 ClickHouse 编程语言客户端时，你也可以通过连接参数指定异步插入相关设置。

  例如，以下是在使用 ClickHouse Java JDBC 驱动程序连接到 ClickHouse Cloud 时，在 JDBC 连接字符串中进行设置的方式：
  ```bash
  "jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
  ```
