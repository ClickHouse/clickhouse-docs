---
sidebar_label: Introduction
sidebar_position: 1
keywords: [clickhouse, go, client, high-level, introduction]
slug: /en/integrations/go/clickhouse-go/introduction
description: Introduction to the high level client
---

# Introduction

The clickhouse-go client provides two API interfaces for communicating with ClickHouse:

* ClickHouse client-specific API
* `database/sql` standard - generic interface around SQL databases provided by Golang.

While the `database/sql` provides a database-agnostic interface, allowing developers to abstract their data store, it enforces some typing and query semantics that impact performance. For this reason, the client-specific API should be used where [performance is important](https://github.com/clickHouse/clickHouse-go#benchmark). However, users who wish to integrate ClickHouse into tooling, which supports multiple databases, may prefer to use the standard interface. 

Both interfaces encode data using the [native format](/docs/en/native-protocol/) and native protocol for communication. Additionally, the standard interface supports communication over HTTP.

<div class="adopters-table">

|                    | Native format | Native protocol | HTTP protocol | Bulk write support | Struct marshaling | Compression | Query Placeholders |
|:------------------:|:-------------:|:---------------:|:-------------:|:------------------:|:-----------------:|:-----------:|:------------------:|
|   ClickHouse API   |       ✅       |        ✅        |               |          ✅         |         ✅         |      ✅      |          ✅         |
| `database/sql` API |       ✅       |        ✅        |       ✅       |          ✅         |                   |      ✅      |          ✅         |
</div>
