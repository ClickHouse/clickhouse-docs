---
slug: /en/native-protocol/server
sidebar_position: 3
---

# Server packets

| value | name                             | description                                                     |
|-------|----------------------------------|-----------------------------------------------------------------|
| 0     | [Hello](#hello)                  | Server handshake response                                       |
| 1     | Data                             | Same as [client data](./client.md#data)                            |
| 2     | [Exception](#exception)          | Query processing exception                                      |
| 3     | [Progress](#progress)            | Query progress                                                  |
| 4     | [Pong](#pong)                    | Ping response                                                   |
| 5     | [EndOfStream](#end-of-stream)    | All packets were transferred                                    |
| 6     | [ProfileInfo](#profile-info)     | Profiling data                                                  |
| 7     | Totals                           | Total values                                                    |
| 8     | Extremes                         | Extreme values (min, max)                                       |
| 9     | TablesStatusResponse             | Response to TableStatus request                                 |
| 10    | [Log](#log)                      | Query system log                                                |
| 11    | TableColumns                     | Columns description                                             |
| 12    | UUIDs                            | List of unique parts ids                                        |
| 13    | ReadTaskRequest                  | String (UUID) describes a request for which next task is needed |
| 14    | [ProfileEvents](#profile-events) | Packet with profile events from server                          |

The `Data`, `Totals` and `Extremes` can be compressed.

## Hello

Response to [client hello](./client.md#hello).

| field         | type    | value           | description          |
|---------------|---------|-----------------|----------------------|
| name          | String  | `Clickhouse`    | Server name          |
| version_major | UVarInt | `21`            | Server major version |
| version_minor | UVarInt | `12`            | Server minor version |
| revision      | UVarInt | `54452`         | Server revision      |
| tz            | String  | `Europe/Moscow` | Server timezone      |
| display_name  | String  | `Clickhouse`    | Server name for UI   |
| version_patch | UVarInt | `3`             | Server patch version |


## Exception

Server exception during query processing.

| field       | type   | value                                  | description                  |
|-------------|--------|----------------------------------------|------------------------------|
| code        | Int32  | `60`                                   | See [ErrorCodes.cpp][codes]. |
| name        | String | `DB::Exception`                        | Server major version         |
| message     | String | `DB::Exception: Table X doesn't exist` | Server minor version         |
| stack_trace | String | ~                                      | C++ stack trace              |
| nested      | Bool   | `true`                                 | More errors                  |

Can be continuous list of exceptions until `nested` is `false`.

[codes]: https://clickhouse.com/codebrowser/ClickHouse/src/Common/ErrorCodes.cpp.html "List of error codes"

## Progress

Progress of query execution periodically reported by server.

:::tip
Progress reported in **deltas**. For totals, accumulate it on client.
:::

| field       | type    | value    | description       |
|-------------|---------|----------|-------------------|
| rows        | UVarInt | `65535`  | Row count         |
| bytes       | UVarInt | `871799` | Byte count        |
| total_rows  | UVarInt | `0`      | Total rows        |
| wrote_rows  | UVarInt | `0`      | Rows from client  |
| wrote_bytes | UVarInt | `0`      | Bytes from client |

## Pong

Response for [client ping](./client.md#ping), no packet body.

## End of stream

No more **Data** packets will be sent, query result is fully steamed from server to client.

No packet body.

## Profile info

| field                        | type    |
|------------------------------|---------|
| rows                         | UVarInt |
| blocks                       | UVarInt |
| bytes                        | UVarInt |
| applied_limit                | Bool    |
| rows_before_limit            | UVarInt |
| calculated_rows_before_limit | Bool    |

## Log

**Data block** with server log.

:::tip
Encoded as **data block** of columns, but is never compressed.
:::

| column     | type     |
|------------|----------|
| time       | DateTime |
| time_micro | UInt32   |
| host_name  | String   |
| query_id   | String   |
| thread_id  | UInt64   |
| priority   | Int8     |
| source     | String   |
| text       | String   |

## Profile events

**Data block** with profile events.

:::tip
Encoded as **data block** of columns, but is never compressed.

The `value` type is `UInt64` or `Int64`, depending on server revision.
:::


| column       | type            |
|--------------|-----------------|
| host_name    | String          |
| current_time | DateTime        |
| thread_id    | UInt64          |
| type         | Int8            |
| name         | String          |
| value        | UInt64 or Int64 |
