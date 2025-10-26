import Image from '@theme/IdealImage';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';

Asynchronous inserts in ClickHouse provide a powerful alternative when client-side batching isn't feasible. This is especially valuable in observability workloads, where hundreds or thousands of agents send data continuously—logs, metrics, traces—often in small, real-time payloads. Buffering data client-side in these environments increases complexity, requiring a centralized queue to ensure sufficiently large batches can be sent.

:::note
Sending many small batches in synchronous mode is not recommended, leading to many parts being created. This will lead to poor query performance and ["too many part"](/knowledgebase/exception-too-many-parts) errors.
:::

Asynchronous inserts shift batching responsibility from the client to the server by writing incoming data to an in-memory buffer, then flushing it to storage based on configurable thresholds. This approach significantly reduces part creation overhead, lowers CPU usage, and ensures ingestion remains efficient—even under high concurrency.

The core behavior is controlled via the [`async_insert`](/operations/settings/settings#async_insert) setting.

<Image img={async_inserts} size="lg" alt="Async inserts"/>

When enabled (1), inserts are buffered and only written to disk once one of the flush conditions is met: 

(1) the buffer reaches a specified size (async_insert_max_data_size)
(2) a time threshold elapses (async_insert_busy_timeout_ms) or 
(3) a maximum number of insert queries accumulate (async_insert_max_query_number). 

This batching process is invisible to clients and helps ClickHouse efficiently merge insert traffic from multiple sources. However, until a flush occurs, the data cannot be queried. Importantly, there are multiple buffers per insert shape and settings combination, and in clusters, buffers are maintained per node—enabling fine-grained control across multi-tenant environments. Insert mechanics are otherwise identical to those described for [synchronous inserts](/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default).

### Choosing a return mode {#choosing-a-return-mode}

The behavior of asynchronous inserts is further refined using the [`wait_for_async_insert`](/operations/settings/settings#wait_for_async_insert) setting. 

When set to 1 (the default), ClickHouse only acknowledges the insert after the data is successfully flushed to disk. This ensures strong durability guarantees and makes error handling straightforward: if something goes wrong during the flush, the error is returned to the client. This mode is recommended for most production scenarios, especially when insert failures must be tracked reliably. 

[Benchmarks](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) show it scales well with concurrency—whether you're running 200 or 500 clients—thanks to adaptive inserts and stable part creation behavior.

Setting `wait_for_async_insert = 0` enables "fire-and-forget" mode. Here, the server acknowledges the insert as soon as the data is buffered, without waiting for it to reach storage. 

This offers ultra-low-latency inserts and maximal throughput, ideal for high-velocity, low-criticality data. However, this comes with trade-offs: there's no guarantee the data will be persisted, errors may only surface during flush, and it's difficult to trace failed inserts. Use this mode only if your workload can tolerate data loss. 

[Benchmarks also demonstrate](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) substantial part reduction and lower CPU usage when buffer flushes are infrequent (e.g. every 30 seconds), but the risk of silent failure remains.

Our strong recommendation is to use `async_insert=1,wait_for_async_insert=1` if using asynchronous inserts. Using `wait_for_async_insert=0` is very risky because your INSERT client may not be aware if there are errors, and also can cause potential overload if your client continues to write quickly in a situation where the ClickHouse server needs to slow down the writes and create some backpressure in order to ensure reliability of the service.

### Deduplication and reliability {#deduplication-and-reliability}

By default, ClickHouse performs automatic deduplication for synchronous inserts, which makes retries safe in failure scenarios. However, this is disabled for asynchronous inserts unless explicitly enabled (this should not be enabled if you have dependent materialized views—[see issue](https://github.com/ClickHouse/ClickHouse/issues/66003)). 

In practice, if deduplication is turned on and the same insert is retried—due to, for instance, a timeout or network drop—ClickHouse can safely ignore the duplicate. This helps maintain idempotency and avoids double-writing data. Still, it's worth noting that insert validation and schema parsing happen only during buffer flush—so errors (like type mismatches) will only surface at that point.

### Enabling asynchronous inserts {#enabling-asynchronous-inserts}

Asynchronous inserts can be enabled for a particular user, or for a specific query:

- Enabling asynchronous inserts at the user level.  This example uses the user `default`, if you create a different user then substitute that username:
  ```sql
  ALTER USER default SETTINGS async_insert = 1
  ```
- You can specify the asynchronous insert settings by using the SETTINGS clause of insert queries:
  ```sql
  INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
  ```
- You can also specify asynchronous insert settings as connection parameters when using a ClickHouse programming language client.

  As an example, this is how you can do that within a JDBC connection string when you use the ClickHouse Java JDBC driver for connecting to ClickHouse Cloud:
  ```bash
  "jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
  ```
