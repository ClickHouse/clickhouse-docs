import Image from '@theme/IdealImage';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';

Asynchronous inserts in ClickHouse provide a powerful alternative when client-side batching isn’t feasible. This is especially valuable in observability workloads, where hundreds or thousands of agents send data continuously - logs, metrics, traces - often in small, real-time payloads. Buffering data client-side in these environments increases complexity, requiring a centralized queue to ensure sufficiently large batches can be sent.

:::note
Sending many small batches in synchronous mode is not recommended, leading to many parts being created. This will lead to poor query performance and ["too many part"](/knowledgebase/exception-too-many-parts) errors.
:::

Asynchronous inserts shift batching responsibility from the client to the server by writing incoming data to an in-memory buffer, then flushing it to storage based on configurable thresholds. This approach significantly reduces part creation overhead, lowers CPU usage, and ensures ingestion remains efficient - even under high concurrency.

The core behavior is controlled via the [`async_insert`](/operations/settings/settings#async_insert) setting.

<Image img={async_inserts} size="lg" alt="Async inserts"/>

When enabled (1), inserts are buffered and only written to disk once one of the flush conditions is met: 

(1) the buffer reaches a specified size (async_insert_max_data_size)
(2) a time threshold elapses (async_insert_busy_timeout_ms) or 
(3) a maximum number of insert queries accumulate (async_insert_max_query_number). 

This batching process is invisible to clients and helps ClickHouse efficiently merge insert traffic from multiple sources. However, until a flush occurs, the data is not queryable. Importantly, there are multiple buffers per insert shape and settings combination, and in clusters, buffers are maintained per node - enabling fine-grained control across multi-tenant environments. Insert mechanics are otherwise identical to those described for [synchronous inserts](#synchronous-inserts-by-default).