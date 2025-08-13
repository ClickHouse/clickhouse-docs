---
slug: /best-practices/selecting-an-insert-strategy
sidebar_position: 10
sidebar_label: 'Selecting an insert strategy'
title: 'Selecting an insert strategy'
description: 'Page describing how to choose an insert strategy in ClickHouse'
keywords: ['INSERT', 'asynchronous inserts', 'compression', 'batch inserts']
show_related_blogs: true
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import insert_process from '@site/static/images/bestpractices/insert_process.png';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';
import AsyncInserts from '@site/docs/best-practices/_snippets/_async_inserts.md';
import BulkInserts from '@site/docs/best-practices/_snippets/_bulk_inserts.md';

Efficient data ingestion forms the basis of high-performance ClickHouse deployments. Selecting the right insert strategy can dramatically impact throughput, cost, and reliability. This section outlines best practices, tradeoffs, and configuration options to help you make the right decision for your workload.

:::note
The following assumes you are pushing data to ClickHouse via a client. If you are pulling data into ClickHouse e.g. using built in table functions such as [s3](/sql-reference/table-functions/s3) and [gcs](/sql-reference/table-functions/gcs), we recommend our guide ["Optimizing for S3 Insert and Read Performance"](/integrations/s3/performance).
:::

## Synchronous inserts by default {#synchronous-inserts-by-default}

By default, inserts into ClickHouse are synchronous.  Each insert query immediately creates a storage part on disk, including metadata and indexes.

:::note Use synchronous inserts if you can batch the data client side
If not, see [Asynchronous inserts](#asynchronous-inserts) below.
:::

 We briefly review ClickHouse's MergeTree insert mechanics below:

<Image img={insert_process} size="lg" alt="Insert processes" background="black"/>

#### Client-side steps {#client-side-steps}

For optimal performance, data must be ①[ batched](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance), making batch size the **first decision**.

ClickHouse stores inserted data on disk,[ ordered](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) by the table's primary key column(s). The **second decision** is whether to ② pre-sort the data before transmission to the server. If a batch arrives pre-sorted by primary key column(s), ClickHouse can [skip](https://github.com/ClickHouse/ClickHouse/blob/94ce8e95404e991521a5608cd9d636ff7269743d/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L595) the ⑨ sorting step, speeding up ingestion.

If the data to be ingested has no predefined format, the **key decision** is choosing a format. ClickHouse supports inserting data in [over 70 formats](/interfaces/formats). However, when using the ClickHouse command-line client or programming language clients, this choice is often handled automatically. If needed, this automatic selection can also be overridden explicitly.

The next **major decision** is ④ whether to compress data before transmission to the ClickHouse server. Compression reduces transfer size and improves network efficiency, leading to faster data transfers and lower bandwidth usage, especially for large datasets.

The data is ⑤ transmitted to a ClickHouse network interface—either the [native](/interfaces/tcp) or[ HTTP](/interfaces/http) interface (which we [compare](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient#clickhouse-client-defaults) later in this post).

#### Server-side steps {#server-side-steps}

After ⑥ receiving the data, ClickHouse ⑦ decompresses it if compression was used, then ⑧ parses it from the originally sent format.

Using the values from that formatted data and the target table's [DDL](/sql-reference/statements/create/table) statement, ClickHouse ⑨ builds an in-memory [block](/development/architecture#block) in the MergeTree format, ⑩ [sorts](/parts#what-are-table-parts-in-clickhouse) rows by the primary key columns if they are not already pre-sorted, ⑪ creates a [sparse primary index](/guides/best-practices/sparse-primary-indexes), ⑫ applies [per-column compression](/parts#what-are-table-parts-in-clickhouse), and ⑬ writes the data as a new ⑭ [data part](/parts) to disk.

### Batch inserts if synchronous {#batch-inserts-if-synchronous}

<BulkInserts/>

### Ensure idempotent retries {#ensure-idempotent-retries}

Synchronous inserts are also **idempotent**. When using MergeTree engines, ClickHouse will deduplicate inserts by default. This protects against ambiguous failure cases, such as:

* The insert succeeded but the client never received an acknowledgment due to a network interruption.
* The insert failed server-side and timed out.

In both cases, it's safe to **retry the insert** - as long as the batch contents and order remain identical. For this reason, it's critical that clients retry consistently, without modifying or reordering data.

### Choose the right insert target {#choose-the-right-insert-target}

For sharded clusters, you have two options:

* Insert directly into a **MergeTree** or **ReplicatedMergeTree** table. This is the most efficient option when the client can perform load balancing across shards. With `internal_replication = true`, ClickHouse handles replication transparently.
* Insert into a [Distributed table](/engines/table-engines/special/distributed). This allows clients to send data to any node and let ClickHouse forward it to the correct shard. This is simpler but slightly less performant due to the extra forwarding step. `internal_replication = true` is still recommended.

**In ClickHouse Cloud all nodes read and write to the same single shard. Inserts are automatically balanced across nodes. Users can simply send inserts to the exposed endpoint.**

### Choose the right format {#choose-the-right-format}

Choosing the right input format is crucial for efficient data ingestion in ClickHouse. With over 70 supported formats, selecting the most performant option can significantly impact insert speed, CPU and memory usage, and overall system efficiency. 

While flexibility is useful for data engineering and file-based imports, **applications should prioritize performance-oriented formats**:

* **Native format** (recommended): Most efficient. Column-oriented, minimal parsing required server-side. Used by default in Go and Python clients.
* **RowBinary**: Efficient row-based format, ideal if columnar transformation is hard client-side. Used by the Java client.
* **JSONEachRow**: Easy to use but expensive to parse. Suitable for low-volume use cases or quick integrations.

### Use compression {#use-compression}

Compression plays a critical role in reducing network overhead, speeding up inserts, and lowering storage costs in ClickHouse. Used effectively, it enhances ingestion performance without requiring changes to data format or schema.

Compressing insert data reduces the size of the payload sent over the network, minimizing bandwidth usage and accelerating transmission.

For inserts, compression is especially effective when used with the Native format, which already matches ClickHouse's internal columnar storage model. In this setup, the server can efficiently decompress and directly store the data with minimal transformation.

#### Use LZ4 for speed, ZSTD for compression ratio {#use-lz4-for-speed-zstd-for-compression-ratio}

ClickHouse supports several compression codecs during data transmission. Two common options are:

* **LZ4**: Fast and lightweight. It reduces data size significantly with minimal CPU overhead, making it ideal for high-throughput inserts and default in most ClickHouse clients.
* **ZSTD**: Higher compression ratio but more CPU-intensive. It's useful when network transfer costs are high—such as in cross-region or cloud provider scenarios—though it increases client-side compute and server-side decompression time slightly.

Best practice: Use LZ4 unless you have constrained bandwidth or incur data egress costs - then consider ZSTD.

:::note
In tests from the [FastFormats benchmark](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient), LZ4-compressed Native inserts reduced data size by more than 50%, cutting ingestion time from 150s to 131s for a 5.6 GiB dataset. Switching to ZSTD compressed the same dataset down to 1.69 GiB, but increased server-side processing time slightly.
:::

#### Compression reduces resource usage {#compression-reduces-resource-usage}

Compression not only reduces network traffic—it also improves CPU and memory efficiency on the server. With compressed data, ClickHouse receives fewer bytes and spends less time parsing large inputs. This benefit is especially important when ingesting from multiple concurrent clients, such as in observability scenarios.

The impact of compression on CPU and memory is modest for LZ4, and moderate for ZSTD. Even under load, server-side efficiency improves due to the reduced data volume.

**Combining compression with batching and an efficient input format (like Native) yields the best ingestion performance.**

When using the native interface (e.g. [clickhouse-client](/interfaces/cli)), LZ4 compression is enabled by default. You can optionally switch to ZSTD via settings.

With the [HTTP interface](/interfaces/http), use the Content-Encoding header to apply compression (e.g. Content-Encoding: lz4). The entire payload must be compressed before sending.

### Pre-sort if low cost {#pre-sort-if-low-cost}

Pre-sorting data by primary key before insertion can improve ingestion efficiency in ClickHouse, particularly for large batches. 

When data arrives pre-sorted, ClickHouse can skip or simplify the internal sorting step during part creation, reducing CPU usage and accelerating the insert process. Pre-sorting also improves compression efficiency, since similar values are grouped together - enabling codecs like LZ4 or ZSTD to achieve a better compression ratio. This is especially beneficial when combined with large batch inserts and compression, as it reduces both the processing overhead and the amount of data transferred.

**That said, pre-sorting is an optional optimization—not a requirement.** ClickHouse sorts data highly efficiently using parallel processing, and in many cases, server-side sorting is faster or more convenient than pre-sorting client-side. 

**We recommend pre-sorting only if the data is already nearly ordered or if client-side resources (CPU, memory) are sufficient and underutilized.** In latency-sensitive or high-throughput use cases, such as observability, where data arrives out of order or from many agents, it's often better to skip pre-sorting and rely on ClickHouse's built-in performance.

## Asynchronous inserts {#asynchronous-inserts}

<AsyncInserts />

## Choose an interface - HTTP or native {#choose-an-interface}

### Native {#choose-an-interface-native}

ClickHouse offers two main interfaces for data ingestion: the **native interface** and the **HTTP interface** - each with trade-offs between performance and flexibility. The native interface, used by [clickhouse-client](/interfaces/cli) and select language clients like Go and C++, is purpose-built for performance. It always transmits data in ClickHouse's highly efficient Native format, supports block-wise compression with LZ4 or ZSTD, and minimizes server-side processing by offloading work such as parsing and format conversion to the client. 

It even enables client-side computation of MATERIALIZED and DEFAULT column values, allowing the server to skip these steps entirely. This makes the native interface ideal for high-throughput ingestion scenarios where efficiency is critical.

### HTTP {#choose-an-interface-http}

Unlike many traditional databases, ClickHouse also supports an HTTP interface. **This, by contrast, prioritizes compatibility and flexibility.** It allows data to be sent in [any supported format](/integrations/data-formats) - including JSON, CSV, Parquet, and others - and is widely supported across most ClickHouse clients, including Python, Java, JavaScript, and Rust. 

This is often preferable to ClickHouse's native protocol as it allows traffic to be easily switched with load balancers. We expect small differences in insert performance with the native protocol, which incurs a little less overhead.

However, it lacks the native protocol's deeper integration and cannot perform client-side optimizations like materialized value computation or automatic conversion to Native format. While HTTP inserts can still be compressed using standard HTTP headers (e.g. `Content-Encoding: lz4`), the compression is applied to the entire payload rather than individual data blocks. This interface is often preferred in environments where protocol simplicity, load balancing, or broad format compatibility is more important than raw performance.

For a more detailed description of these interfaces see [here](/interfaces/overview).
