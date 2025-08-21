---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-data
title: 'Migrating data to ClickStack from Elastic'
pagination_prev: null
pagination_next: null
sidebar_label: 'Migrating data'
sidebar_position: 4
description: 'Migrating data to ClickHouse Observability Stack from Elastic'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: how-to
---

## Parallel operation strategy {#parallel-operation-strategy}

When migrating from Elastic to ClickStack for observability use cases, we recommend a **parallel operation** approach rather than attempting to migrate historical data. This strategy offers several advantages:

1. **Minimal risk**: by running both systems concurrently, you maintain access to existing data and dashboards while validating ClickStack and familiarizing your users with the new system.
2. **Natural data expiration**: most observability data has a limited retention period (typically 30 days or less), allowing for a natural transition as data expires from Elastic.
3. **Simplified migration**: no need for complex data transfer tools or processes to move historical data between systems.
<br/>
:::note Migrating data
We demonstrate an approach for migrating essential data from Elasticsearch to ClickHouse in the section ["Migrating data"](#migrating-data). This should not be used for larger datasets as it is rarely performant - limited by the ability for Elasticsearch to export efficiently, with only JSON format supported.
:::

### Implementation steps {#implementation-steps}

1. **Configure Dual Ingestion**
<br/>
Set up your data collection pipeline to send data to both Elastic and ClickStack simultaneously. 

How this is achieved depends on your current agents for collection - see ["Migrating Agents"](/use-cases/observability/clickstack/migration/elastic/migrating-agents).

2. **Adjust Retention Periods**
<br/>
Configure Elastic's TTL settings to match your desired retention period. Set up the ClickStack [TTL](/use-cases/observability/clickstack/production#configure-ttl) to maintain data for the same duration.

3. **Validate and Compare**:
<br/>
- Run queries against both systems to ensure data consistency
- Compare query performance and results
- Migrate dashboards and alerts to ClickStack. This is currently a manual process.
- Verify that all critical dashboards and alerts work as expected in ClickStack

4. **Gradual Transition**:
<br/>
- As data naturally expires from Elastic, users will increasingly rely on ClickStack
- Once confidence in ClickStack is established, you can begin redirecting queries and dashboards

### Long-term retention {#long-term-retention}

For organizations requiring longer retention periods:

- Continue running both systems in parallel until all data has expired from Elastic
- ClickStack [tiered storage](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes) capabilities can help manage long-term data efficiently.
- Consider using [materialized views](/materialized-view/incremental-materialized-view) to maintain aggregated or filtered historical data while allowing raw data to expire.

### Migration timeline {#migration-timeline}

The migration timeline will depend on your data retention requirements:

- **30-day retention**: Migration can be completed within a month.
- **Longer retention**: Continue parallel operation until data expires from Elastic.
- **Historical data**: If absolutely necessary, consider using [Migrating data](#migrating-data) to import specific historical data.

## Migrating settings {#migration-settings}

When migrating from Elastic to ClickStack, your indexing and storage settings will need to be adapted to fit ClickHouse's architecture. While Elasticsearch relies on horizontal scaling and sharding for performance and fault tolerance and thus has multiple shards by default, ClickHouse is optimized for vertical scaling and typically performs best with fewer shards.

### Recommended settings {#recommended-settings}

We recommend starting with a **single shard** and scaling vertically. This configuration is suitable for most observability workloads and simplifies both management and query performance tuning.

- **[ClickHouse Cloud](https://clickhouse.com/cloud)**: Uses a single-shard, multi-replica architecture by default. Storage and compute scale independently, making it ideal for observability use cases with unpredictable ingest patterns and read-heavy workloads.
- **ClickHouse OSS**: In self-managed deployments, we recommend:
  - Starting with a single shard
  - Scaling vertically with additional CPU and RAM
  - Using [tiered storage](/observability/managing-data#storage-tiers) to extend local disk with S3-compatible object storage
  - Using [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication) if high availability is required
  - For fault tolerance, [1 replica of your shard](/engines/table-engines/mergetree-family/replication) is typically sufficient in Observability workloads.

### When to shard {#when-to-shard}

Sharding may be necessary if:

- Your ingest rate exceeds the capacity of a single node (typically >500K rows/sec)
- You need tenant isolation or regional data separation
- Your total dataset is too large for a single server, even with object storage

If you do need to shard, refer to [Horizontal scaling](/architecture/horizontal-scaling) for guidance on shard keys and distributed table setup.

### Retention and TTL {#retention-and-ttl}

ClickHouse uses [TTL clauses](/use-cases/observability/clickstack/production#configure-ttl) on MergeTree tables to manage data expiration. TTL policies can:

- Automatically delete expired data
- Move older data to cold object storage
- Retain only recent, frequently queried logs on fast disk

We recommend aligning your ClickHouse TTL configuration with your existing Elastic retention policies to maintain a consistent data lifecycle during the migration. For examples, see [ClickStack production TTL setup](/use-cases/observability/clickstack/production#configure-ttl).

## Migrating data {#migrating-data}

While we recommend parallel operation for most observability data, there are specific cases where direct data migration from Elasticsearch to ClickHouse may be necessary:

- Small lookup tables used for data enrichment (e.g., user mappings, service catalogs)
- Business data stored in Elasticsearch that needs to be correlated with observability data, with ClickHouse's SQL capabilities and Business Intelligence integrations making it easier to maintain and query the data compared to Elasticsearch's more limited query options.
- Configuration data that needs to be preserved across the migration

This approach is only viable for datasets under 10 million rows, as Elasticsearch's export capabilities are limited to JSON over HTTP and don't scale well for larger datasets. 

The following steps allow the migration of a single Elasticsearch index from ClickHouse.

<VerticalStepper headerLevel="h3">

### Migrate schema {#migrate-scheme}

Create a table in ClickHouse for the index being migrated from Elasticsearch. Users can map [Elasticsearch types to their ClickHouse](/use-cases/observability/clickstack/migration/elastic/types) equivalent. Alternatively, users can simply rely on the JSON data type in ClickHouse, which will dynamically create columns of the appropriate type as data is inserted.

Consider the following Elasticsearch mapping for an index containing `syslog` data:

<details>
<summary>Elasticsearch mapping</summary>

```javascripton
GET .ds-logs-system.syslog-default-2025.06.03-000001/_mapping
{
  ".ds-logs-system.syslog-default-2025.06.03-000001": {
    "mappings": {
      "_meta": {
        "managed_by": "fleet",
        "managed": true,
        "package": {
          "name": "system"
        }
      },
      "_data_stream_timestamp": {
        "enabled": true
      },
      "dynamic_templates": [],
      "date_detection": false,
      "properties": {
        "@timestamp": {
          "type": "date",
          "ignore_malformed": false
        },
        "agent": {
          "properties": {
            "ephemeral_id": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "id": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "name": {
              "type": "keyword",
              "fields": {
                "text": {
                  "type": "match_only_text"
                }
              }
            },
            "type": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "version": {
              "type": "keyword",
              "ignore_above": 1024
            }
          }
        },
        "cloud": {
          "properties": {
            "account": {
              "properties": {
                "id": {
                  "type": "keyword",
                  "ignore_above": 1024
                }
              }
            },
            "availability_zone": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "image": {
              "properties": {
                "id": {
                  "type": "keyword",
                  "ignore_above": 1024
                }
              }
            },
            "instance": {
              "properties": {
                "id": {
                  "type": "keyword",
                  "ignore_above": 1024
                }
              }
            },
            "machine": {
              "properties": {
                "type": {
                  "type": "keyword",
                  "ignore_above": 1024
                }
              }
            },
            "provider": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "region": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "service": {
              "properties": {
                "name": {
                  "type": "keyword",
                  "fields": {
                    "text": {
                      "type": "match_only_text"
                    }
                  }
                }
              }
            }
          }
        },
        "data_stream": {
          "properties": {
            "dataset": {
              "type": "constant_keyword",
              "value": "system.syslog"
            },
            "namespace": {
              "type": "constant_keyword",
              "value": "default"
            },
            "type": {
              "type": "constant_keyword",
              "value": "logs"
            }
          }
        },
        "ecs": {
          "properties": {
            "version": {
              "type": "keyword",
              "ignore_above": 1024
            }
          }
        },
        "elastic_agent": {
          "properties": {
            "id": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "snapshot": {
              "type": "boolean"
            },
            "version": {
              "type": "keyword",
              "ignore_above": 1024
            }
          }
        },
        "event": {
          "properties": {
            "agent_id_status": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "dataset": {
              "type": "constant_keyword",
              "value": "system.syslog"
            },
            "ingested": {
              "type": "date",
              "format": "strict_date_time_no_millis||strict_date_optional_time||epoch_millis",
              "ignore_malformed": false
            },
            "module": {
              "type": "constant_keyword",
              "value": "system"
            },
            "timezone": {
              "type": "keyword",
              "ignore_above": 1024
            }
          }
        },
        "host": {
          "properties": {
            "architecture": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "containerized": {
              "type": "boolean"
            },
            "hostname": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "id": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "ip": {
              "type": "ip"
            },
            "mac": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "name": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "os": {
              "properties": {
                "build": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "codename": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "family": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "kernel": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "name": {
                  "type": "keyword",
                  "fields": {
                    "text": {
                      "type": "match_only_text"
                    }
                  }
                },
                "platform": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "type": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "version": {
                  "type": "keyword",
                  "ignore_above": 1024
                }
              }
            }
          }
        },
        "input": {
          "properties": {
            "type": {
              "type": "keyword",
              "ignore_above": 1024
            }
          }
        },
        "log": {
          "properties": {
            "file": {
              "properties": {
                "path": {
                  "type": "keyword",
                  "fields": {
                    "text": {
                      "type": "match_only_text"
                    }
                  }
                }
              }
            },
            "offset": {
              "type": "long"
            }
          }
        },
        "message": {
          "type": "match_only_text"
        },
        "process": {
          "properties": {
            "name": {
              "type": "keyword",
              "fields": {
                "text": {
                  "type": "match_only_text"
                }
              }
            },
            "pid": {
              "type": "long"
            }
          }
        },
        "system": {
          "properties": {
            "syslog": {
              "type": "object"
            }
          }
        }
      }
    }
  }
}
```
</details>

The equivalent ClickHouse table schema:

<details>
<summary>ClickHouse schema</summary>

```sql
SET enable_json_type = 1;

CREATE TABLE logs_system_syslog
(
    `@timestamp` DateTime,
    `agent` Tuple(
        ephemeral_id String,
        id String,
        name String,
        type String,
        version String),
    `cloud` Tuple(
        account Tuple(
            id String),
        availability_zone String,
        image Tuple(
            id String),
        instance Tuple(
            id String),
        machine Tuple(
            type String),
        provider String,
        region String,
        service Tuple(
            name String)),
    `data_stream` Tuple(
        dataset String,
        namespace String,
        type String),
    `ecs` Tuple(
        version String),
    `elastic_agent` Tuple(
        id String,
        snapshot UInt8,
        version String),
    `event` Tuple(
        agent_id_status String,
        dataset String,
        ingested DateTime,
        module String,
        timezone String),
    `host` Tuple(
        architecture String,
        containerized UInt8,
        hostname String,
        id String,
        ip Array(Variant(IPv4, IPv6)),
        mac Array(String),
        name String,
        os Tuple(
            build String,
            codename String,
            family String,
            kernel String,
            name String,
            platform String,
            type String,
            version String)),
    `input` Tuple(
        type String),
    `log` Tuple(
        file Tuple(
            path String),
        offset Int64),
    `message` String,
    `process` Tuple(
        name String,
        pid Int64),
    `system` Tuple(
        syslog JSON)
)
ENGINE = MergeTree
ORDER BY (`host.name`, `@timestamp`)
```

</details>

Note that:

- Tuples are used to represent nested structures instead of dot notation
- Used appropriate ClickHouse types based on the mapping:
  - `keyword` → `String`
  - `date` → `DateTime`
  - `boolean` → `UInt8`
  - `long` → `Int64`
  - `ip` → `Array(Variant(IPv4, IPv6))`. We use a [`Variant(IPv4, IPv6)`](/sql-reference/data-types/variant) here as the field contains a mixture of [`IPv4`](/sql-reference/data-types/ipv4) and [`IPv6`](/sql-reference/data-types/ipv6).
  - `object` → `JSON` for the syslog object whose structure is unpredictable.
- Columns `host.ip` and `host.mac` are explicit `Array` type, unlike in Elasticsearch where all types are arrays.
- An `ORDER BY` clause is added using timestamp and hostname for efficient time-based queries
- `MergeTree`, which is optimal for log data, is used as the engine type

**This approach of statically defining the schema and using the JSON type selectively where required [is recommended](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures).**

This strict schema has a number of benefits:

- **Data validation** – enforcing a strict schema avoids the risk of column explosion, outside of specific structures. 
- **Avoids risk of column explosion**: although the JSON type scales to potentially thousands of columns, where subcolumns are stored as dedicated columns, this can lead to a column file explosion where an excessive number of column files are created that impacts performance. To mitigate this, the underlying [Dynamic type](/sql-reference/data-types/dynamic) used by JSON offers a [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) parameter, which limits the number of unique paths stored as separate column files. Once the threshold is reached, additional paths are stored in a shared column file using a compact encoded format, maintaining performance and storage efficiency while supporting flexible data ingestion. Accessing this shared column file is, however, not as performant. Note, however, that the JSON column can be used with [type hints](/integrations/data-formats/json/schema#using-type-hints-and-skipping-paths). "Hinted" columns will deliver the same performance as dedicated columns.
- **Simpler introspection of paths and types**: although the JSON type supports [introspection functions](/sql-reference/data-types/newjson#introspection-functions) to determine the types and paths that have been inferred, static structures can be simpler to explore e.g. with `DESCRIBE`.
<br/>
Alternatively, users can simply create a table with one `JSON` column.

```sql
SET enable_json_type = 1;

CREATE TABLE syslog_json
(
 `json` JSON(`host.name` String, `@timestamp` DateTime)
)
ENGINE = MergeTree
ORDER BY (`json.host.name`, `json.@timestamp`)
```

:::note
We provide a type hint for the `host.name` and `timestamp` columns in the JSON definition as we use it in the ordering/primary key. This helps ClickHouse know this column won't be null and ensures it knows which sub-columns to use (there may be multiple for each type, so this is ambiguous otherwise).
:::

This latter approach, while simpler, is best for prototyping and data engineering tasks. For production, use `JSON` only for dynamic sub structures where necessary.

For more details on using the JSON type in schemas, and how to efficiently apply it, we recommend the guide ["Designing your schema"](/integrations/data-formats/json/schema).

### Install `elasticdump` {#install-elasticdump}

We recommend [`elasticdump`](https://github.com/elasticsearch-dump/elasticsearch-dump) for exporting data from Elasticsearch. This tool requires `node` and should be installed on a machine with network proximity to both Elasticsearch and ClickHouse. We recommend a dedicated server with at least 4 cores and 16GB of RAM for most exports.

```shell
npm install elasticdump -g
```

`elasticdump` offers several advantages for data migration:

- It interacts directly with the Elasticsearch REST API, ensuring proper data export.
- Maintains data consistency during the export process using the Point-in-Time (PIT) API - this creates a consistent snapshot of the data at a specific moment.
- Exports data directly to JSON format, which can be streamed to the ClickHouse client for insertion.

Where possible, we recommend running both ClickHouse, Elasticsearch, and `elastic dump` in the same availability zone or data center to minimize network egress and maximize throughput.

### Install ClickHouse client {#install-clickhouse-client}

Ensure ClickHouse is [installed on the server](/install) on which `elasticdump` is located. **Do not start a ClickHouse server** - these steps only require the client.

### Stream data {#stream-data}

To stream data between Elasticsearch and ClickHouse, use the `elasticdump` command - piping the output directly to the ClickHouse client. The following inserts the data into our well structured table `logs_system_syslog`.

```shell
# export url and credentials
export ELASTICSEARCH_INDEX=.ds-logs-system.syslog-default-2025.06.03-000001
export ELASTICSEARCH_URL=
export ELASTICDUMP_INPUT_USERNAME=
export ELASTICDUMP_INPUT_PASSWORD=
export CLICKHOUSE_HOST=
export CLICKHOUSE_PASSWORD=
export CLICKHOUSE_USER=default

# command to run - modify as required
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true | 
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONEachRow"
```

Note the use of the following flags for `elasticdump`:

- `type=data` - limits the response to only the document content in Elasticsearch.
- `input-index` - our Elasticsearch input index.
- `output=$` - redirects all results to stdout.
- `sourceOnly` flag ensuring we omit metadata fields in our response.
- `searchAfter` flag to use the [`searchAfter` API](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results#search-after) for efficient pagination of results.
- `pit=true` to ensure consistent results between queries using the [point in time API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-open-point-in-time).
<br/>
Our ClickHouse client parameters here (aside from credentials):

- `max_insert_block_size=1000` - ClickHouse client will send data once this number of rows is reached. Increasing improves throughput at the expense of time to formulate a block - thus increasing time till data appears in ClickHouse.
- `min_insert_block_size_bytes=0` - Turns off server block squashing by bytes.
- `min_insert_block_size_rows=1000` - Squashes blocks from clients on the server side. In this case, we set to `max_insert_block_size` so rows appear immediately. Increase to improve throughput.
- `query="INSERT INTO logs_system_syslog FORMAT JSONAsRow"` - Inserting the data as [JSONEachRow format](/integrations/data-formats/json/other-formats). This is appropriate if sending to a well-defined schema such as `logs_system_syslog.`
<br/>
**Users can expect throughput in order of thousands of rows per second.**

:::note Inserting into single JSON row
If inserting into a single JSON column (see the `syslog_json` schema above), the same insert command can be used. However, users must specify `JSONAsObject` as the format instead of `JSONEachRow` e.g.

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true | 
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONAsObject"
```

See ["Reading JSON as an object"](/integrations/data-formats/json/other-formats#reading-json-as-an-object) for further details.
:::

### Transform data (optional) {#transform-data}

The above commands assume a 1:1 mapping of Elasticsearch fields to ClickHouse columns. Users often need to filter and transform Elasticsearch data before insertion into ClickHouse.

This can be achieved using the [`input`](/sql-reference/table-functions/input) table function, which allows us to execute any `SELECT` query on the stdout.

Suppose we wish to only store the `timestamp` and `hostname` fields from our earlier data. The ClickHouse schema:

```sql
CREATE TABLE logs_system_syslog_v2
(
    `timestamp` DateTime,
    `hostname` String
)
ENGINE = MergeTree
ORDER BY (hostname, timestamp)
```

To insert from `elasticdump` into this table, we can simply use the `input` table function - using the JSON type to dynamically detect and select the required columns. Note this `SELECT` query could easily contain a filter.

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog_v2 SELECT json.\`@timestamp\` as timestamp, json.host.hostname as hostname FROM input('json JSON') FORMAT JSONAsObject"
```

Note the need to escape the `@timestamp` field name and use the `JSONAsObject` input format.

</VerticalStepper>
