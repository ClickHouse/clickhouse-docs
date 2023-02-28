---
sidebar_label: Introduction
sidebar_position: 1
keywords: [clickhouse, go, client, golang]
slug: /en/integrations/go/intro
description: The Go clients for ClickHouse allows users to connect to ClickHouse using either the Go standard database/sql interface or an optimized native interface. 
---

# ClickHouse Go Client

ClickHouse supports two official Go clients. These clients are complementary and intentionally support different use cases.

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - High level language client which supports either the Go standard database/sql interface or the native interface.
* [ch-go](https://github.com/ClickHouse/ch-go) - Low level client. Native interface only.

clickhouse-go provides a high-level interface, allowing users to query and insert data using row-orientated semantics and batching that are lenient with respect to data types - values will be converted provided no precision loss is potentially incurred. ch-go, meanwhile, provides an optimized column-orientated interface that provides fast data block streaming with low CPU and memory overhead at the expense of type strictness and more complex usage. 

From version 2.3, Clickhouse-go utilizes ch-go for low-level functions such as encoding, decoding, and compression. Note that clickhouse-go also supports the Go `database/sql` interface standard. Both clients use the native format for their encoding to provide optimal performance and can communicate over the native ClickHouse protocol. clickhouse-go also supports HTTP as its transport mechanism for cases where users have a requirement to proxy or load balance traffic.

When choosing a client library, users should be aware of their respective pros and cons - see Choosing a Client Library.

<div class="adopters-table">

|               | Native format | Native protocol | HTTP protocol | Row Orientated API | Column Orientated API | Type flexibility | Compression | Query Placeholders |
|:-------------:|:-------------:|:---------------:|:-------------:|:------------------:|:---------------------:|:----------------:|:-----------:|:------------------:|
| clickhouse-go |       ✅       |        ✅        |       ✅       |          ✅         |           ✅           |         ✅        |      ✅      |          ✅         |
|     ch-go     |       ✅       |        ✅        |               |                    |           ✅           |                  |      ✅      |                    |

</div>
