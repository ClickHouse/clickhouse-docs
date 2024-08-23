---
slug: /en/native-protocol/client
sidebar_position: 2
---

# Client packets

| value | name              | description            |
|-------|-------------------|------------------------|
| 0     | [Hello](#hello)   | Client handshake start |
| 1     | [Query](#query)   | Query request          |
| 2     | [Data](#data)     | Block with data        |
| 3     | [Cancel](#cancel) | Cancel query           |
| 4     | [Ping](#ping)     | Ping request           |
| 5     | TableStatus       | Table status request   |

The `Data` can be compressed.

## Hello

For example, we are `Go Client` v1.10 that supports `54451` protocol version and
want to connect to `default` database with `default` user and `secret` password.

| field            | type    | value         | description                |
|------------------|---------|---------------|----------------------------|
| client_name      | String  | `"Go Client"` | Client implementation name |
| version_major    | UVarInt | `1`           | Client major version       |
| version_minor    | UVarInt | `10`          | Client minor version       |
| protocol_version | UVarInt | `54451`       | TCP Protocol version       |
| database         | String  | `"default"`   | Database name              |
| username         | String  | `"default"`   | Username                   |
| password         | String  | `"secret"`    | Password                   |

### Protocol version

Protocol version is TCP protocol version of client.

Usually it is equal to the latest compatible server revision, but
should not be confused with it.

### Defaults

All values should be **explicitly set**, there are no defaults on server side.
On client side, use `"default"` database, `"default"` username and `""` (blank string)
password as defaults.

## Query

| field           | type                       | value      | description               |
|-----------------|----------------------------|------------|---------------------------|
| query_id        | String                     | `1ff-a123` | Query ID, can be UUIDv4   |
| client_info     | [ClientInfo](#client-info) | See type   | Data about client         |
| settings        | [Settings](#settings)      | See type   | List of settings          |
| secret          | String                     | `secret`   | Inter-server secret       |
| [stage](#stage) | UVarInt                    | `2`        | Execute until query stage |
| compression     | UVarInt                    | `0`        | Disabled=0, enabled=1     |
| body            | String                     | `SELECT 1` | Query text                |

### Client info

| field             | type            | description                    |
|-------------------|-----------------|--------------------------------|
| query_kind        | byte            | None=0, Initial=1, Secondary=2 |
| initial_user      | String          | Initial user                   |
| initial_query_id  | String          | Initial query id               |
| initial_address   | String          | Initial address                |
| initial_time      | Int64           | Initial time                   |
| interface         | byte            | TCP=1, HTTP=2                  |
| os_user           | String          | OS User                        |
| client_hostname   | String          | Client Hostname                |
| client_name       | String          | Client Name                    |
| version_major     | UVarInt         | Client major version           |
| version_minor     | UVarInt         | Client minor version           |
| protocol_version  | UVarInt         | Client protocol version        |
| quota_key         | String          | Quota key                      |
| distributed_depth | UVarInt         | Distributed depth              |
| version_patch     | UVarInt         | Client patch version           |
| otel              | Bool            | Trace fields are present       |
| trace_id          | FixedString(16) | Trace ID                       |
| span_id           | FixedString(8)  | Span ID                        |
| trace_state       | String          | Tracing state                  |
| trace_flags       | Byte            | Tracing flags                  |


### Settings

| field     | type   | value             | description           |
|-----------|--------|-------------------|-----------------------|
| key       | String | `send_logs_level` | Key of setting        |
| value     | String | `trace`           | Value of setting      |
| important | Bool   | `true`            | Can be ignored or not |

Encoded as list, blank key and value denotes end of list.

### Stage

| value | name               | description                                 |
|-------|--------------------|---------------------------------------------|
| 0     | FetchColumns       | Only fetch column types                     |
| 1     | WithMergeableState | Until mergeable state                       |
| 2     | Complete           | Until full completeness (should be default) |


## Data

| field   | type                | description        |
|---------|---------------------|--------------------|
| info    | BlockInfo           | Encoded block info |
| columns | UVarInt             | Columns count      |
| rows    | UVarInt             | Rows count         |
| columns | [[]Column](#column) | Columns with data  |

### Column

| field | type   | value           | description |
|-------|--------|-----------------|-------------|
| name  | String | `foo`           | Column name |
| type  | String | `DateTime64(9)` | Column type |
| data  | bytes  | ~               | Column data |

## Cancel

No packet body. Server should cancel query.

## Ping

No packet body. Server should [respond with pong](./server.md#pong).

