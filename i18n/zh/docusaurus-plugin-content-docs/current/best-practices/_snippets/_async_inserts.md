---
null
...
---

import Image from '@theme/IdealImage';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';

在 ClickHouse 中，异步插入提供了一种强大的替代方案，当客户端批处理不可行时。尤其是在可观察性工作负载中，数百或数千个代理持续发送数据 — 日志、指标、跟踪 — 通常以小的实时有效载荷进行发送。在这些环境中，客户端缓冲数据增加了复杂性，需要一个集中队列以确保可以发送足够大的批次。

:::note
不推荐以同步模式发送许多小批次，这将导致创建多个部分。这将导致查询性能不佳以及出现 ["too many part"](/knowledgebase/exception-too-many-parts) 错误。
:::

异步插入通过将传入的数据写入内存中的缓冲区，然后根据可配置的阈值将其刷新到存储，从而将批处理责任从客户端转移到服务器。这种方法显著减少了部分创建的开销，降低了 CPU 的使用，并确保在高并发下的摄取效率。

核心行为通过 [`async_insert`](/operations/settings/settings#async_insert) 设置进行控制。

<Image img={async_inserts} size="lg" alt="异步插入"/>

当启用时 (1)，插入将被缓冲，并且仅在满足以下任何一个刷新条件后写入磁盘：

(1) 缓冲区达到指定的大小 (async_insert_max_data_size) 
(2) 时间阈值经过 (async_insert_busy_timeout_ms) 或 
(3) 累积到达最大插入查询数量 (async_insert_max_query_number)。

该批处理过程对客户端是不可见的，并帮助 ClickHouse 高效地合并来自多个源的插入流量。然而，在刷新发生之前，数据无法被查询。重要的是，每种插入形状和设置组合有多个缓冲区，并且在集群中，缓冲区是每个节点维护的 - 这允许在多租户环境中进行精细控制。插入机制在其他方面与 [同步插入](/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default) 描述的相同。

### 选择返回模式 {#choosing-a-return-mode}

异步插入的行为通过 [`wait_for_async_insert`](/operations/settings/settings#wait_for_async_insert) 设置进一步细化。

当设置为 1 (默认值) 时，ClickHouse 仅在数据成功刷新到磁盘后才确认插入。这确保了强大的持久性保证，使错误处理变得简单：如果在刷新时出现问题，错误将返回给客户端。此模式推荐用于大多数生产场景，特别是当插入失败需要可靠跟踪时。

[基准测试](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) 显示它在并发上表现良好 - 无论您是在运行 200 还是 500 个客户端 - 这得益于自适应插入和稳定的部分创建行为。

设置 `wait_for_async_insert = 0` 启用“无视而过”模式。在这里，服务器在数据被缓冲后立即确认插入，而无需等待数据达到存储。

这提供了超低延迟的插入和最大的吞吐量，理想用于高速度、低关键性的数据。然而，这也带来了权衡：无法保证数据被持久化，错误可能仅在刷新时显现，并且很难追踪失败的插入。只有在工作负载可以容忍数据丢失的情况下才使用此模式。

[基准测试还表明](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) 当缓冲刷新不频繁时（例如每 30 秒），部分数量显著减少，并且 CPU 使用率降低，但沉默失败的风险仍然存在。

我们强烈建议使用 `async_insert=1,wait_for_async_insert=1`，如果使用异步插入。使用 `wait_for_async_insert=0` 非常冒险，因为您的 INSERT 客户端可能无法意识到是否存在错误，并且可能会导致潜在的过载，如果您的客户端在 ClickHouse 服务器需要减缓写入速度并产生一些回压以确保服务可靠性时继续快速写入。

### 去重和可靠性 {#deduplication-and-reliability}

默认情况下，ClickHouse 为同步插入执行自动去重，这使得在失败场景中重试是安全的。然而，这在异步插入中是禁用的，除非明确启用（如果您有依赖的物化视图，则不应启用 - [参见问题](https://github.com/ClickHouse/ClickHouse/issues/66003)）。

实际上，如果去重启用并且由于超时或网络中断而重新尝试相同插入，ClickHouse 可以安全地忽略重复。这有助于保持幂等性并避免重复写入数据。仍然值得注意的是，插入验证和模式解析仅在缓冲刷新期间发生 - 因此错误（如类型不匹配）仅在那时浮现。

### 启用异步插入 {#enabling-asynchronous-inserts}

可以为特定用户或特定查询启用异步插入：

- 在用户级别启用异步插入。此示例使用用户 `default`，如果您创建了不同的用户，请替换该用户名：
```sql
ALTER USER default SETTINGS async_insert = 1
```
- 您可以通过在插入查询中使用 SETTINGS 子句来指定异步插入设置：
```sql
INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
```
- 在使用 ClickHouse 编程语言客户端时，您还可以将异步插入设置指定为连接参数。

作为一个示例，这就是在使用 ClickHouse Java JDBC 驱动程序连接到 ClickHouse Cloud 时，您可以在 JDBC 连接字符串中这样做：
```bash
"jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
```
