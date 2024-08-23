---
title: Can I use ClickHouse as a time-series database?
description: "ClickHouse is a generic data storage solution for OLAP workloads, while there are many specialized time-series database management systems."
date: 2021-09-01
---

# Can I Use ClickHouse As a Time-Series Database? {#can-i-use-clickhouse-as-a-time-series-database}

_Note: Please see the blog [Working with Time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse) for additional examples of using ClickHouse for time series analysis._

ClickHouse is a generic data storage solution for [OLAP](https://clickhouse.com/docs/en/faq/general/olap) workloads, while there are many specialized time-series database management systems. Nevertheless, ClickHouse’s [focus on query execution speed](https://clickhouse.com/docs/en/faq/general/why-clickhouse-is-so-fast) allows it to outperform specialized systems in many cases. There are many independent benchmarks on this topic out there, so we’re not going to conduct one here. Instead, let’s focus on ClickHouse features that are important to use if that’s your use case.

First of all, there are **[specialized codecs](https://clickhouse.com/docs/en/sql-reference/statements/create/table#specialized-codecs)** which make typical time-series. Either common algorithms like `DoubleDelta` and `Gorilla` or specific to ClickHouse like `T64`.

Second, time-series queries often hit only recent data, like one day or one week old. It makes sense to use servers that have both fast nVME/SSD drives and high-capacity HDD drives. ClickHouse [TTL](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/##table_engine-mergetree-multiple-volumes) feature allows to configure keeping fresh hot data on fast drives and gradually move it to slower drives as it ages. Rollup or removal of even older data is also possible if your requirements demand it.

Even though it’s against ClickHouse philosophy of storing and processing raw data, you can use [materialized views](https://clickhouse.com/docs/en/sql-reference/statements/create/view) to fit into even tighter latency or costs requirements.

## Related Content

- Blog: [Working with time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
