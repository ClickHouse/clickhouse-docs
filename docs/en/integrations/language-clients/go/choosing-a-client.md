---
sidebar_label: Choosing a Client
sidebar_position: 2
keywords: [clickhouse, go, client, golang]
slug: /en/integrations/go/choosing-a-client
description: Choosing a low-level or high-level client
---

# Choosing a Client

Selecting a client library depends on your usage patterns and need for optimal performance. For insert heavy use cases, where millions of inserts are required per second, we recommend using the low level client [ch-go](https://github.com/ClickHouse/ch-go). This client avoids the associated overhead of pivoting the data from a row-orientated format to columns, as the ClickHouse native format requires. Furthermore, it avoids any reflection or use of the `interface{}` (`any`) type to simplify usage.

For query workloads focused on aggregations or lower throughput insert workloads, the [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) provides a familiar `database/sql` interface and more straightforward row semantics. Users can also optionally use HTTP for the transport protocol and take advantage of helper functions to marshal rows to and from structs.

