---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-data
title: '将数据从 Elastic 迁移到 ClickStack'
pagination_prev: null
pagination_next: null
sidebar_label: '数据迁移'
sidebar_position: 4
description: '将数据从 Elastic 迁移到 ClickHouse 可观测性栈'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---



## 并行运行策略 {#parallel-operation-strategy}

在将可观测性场景从 Elastic 迁移到 ClickStack 时，我们建议采用**并行运行**策略，而不是尝试迁移历史数据。该策略具有以下优势：

1. **风险极小**：通过同时运行两个系统，在验证 ClickStack 并让用户熟悉新系统的同时，仍然可以访问现有数据和仪表板。
2. **自然数据过期**：大多数可观测性数据都有有限的保留期（通常为 30 天或更短），随着数据在 Elastic 中自然过期，可以顺利完成切换。
3. **迁移更简单**：无需使用复杂的数据传输工具或流程在系统之间迁移历史数据。
<br/>
:::note 迁移数据
我们在["迁移数据"](#migrating-data)一节中演示了从 Elasticsearch 迁移关键数据到 ClickHouse 的一种方法。对于更大的数据集不应采用该方法，因为其性能通常不佳——受限于 Elasticsearch 的导出能力，并且仅支持 JSON 格式导出。
:::

### 实施步骤 {#implementation-steps}

1. **配置双重摄取**
<br/>
将数据采集流水线配置为同时向 Elastic 和 ClickStack 摄取数据。 

具体实现方式取决于当前使用的采集 agent —— 请参阅["迁移 Agent"](/use-cases/observability/clickstack/migration/elastic/migrating-agents)。

2. **调整保留期**
<br/>
将 Elastic 的 TTL 设置配置为匹配所需的保留期。配置 ClickStack 的 [TTL](/use-cases/observability/clickstack/production#configure-ttl)，以在相同时间范围内保留数据。

3. **验证与对比**：
<br/>
- 在两个系统上运行查询，以确保数据一致性
- 对比查询性能和结果
- 将仪表板和告警迁移到 ClickStack。目前这是一个手动过程。
- 验证所有关键仪表板和告警在 ClickStack 中按预期工作

4. **渐进式切换**：
<br/>
- 随着数据在 Elastic 中自然过期，用户将越来越多地依赖 ClickStack
- 在对 ClickStack 有足够信心后，可以开始重定向查询和仪表板

### 长期保留 {#long-term-retention}

对于需要更长数据保留期的组织：

- 在 Elastic 中的所有数据过期之前，持续并行运行两个系统
- ClickStack 的[分层存储](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)能力可以帮助高效管理长期数据。
- 考虑使用[物化视图](/materialized-view/incremental-materialized-view)来维护聚合或过滤后的历史数据，同时允许原始数据过期。

### 迁移时间线 {#migration-timeline}

迁移时间线将取决于数据保留要求：

- **30 天保留期**：迁移可在一个月内完成。
- **更长保留期**：在 Elastic 中的数据过期之前持续并行运行。
- **历史数据**：如确有必要，可考虑使用[迁移数据](#migrating-data)导入特定的历史数据。



## 迁移设置 {#migration-settings}

从 Elastic 迁移到 ClickStack 时，需要调整索引和存储设置，以适配 ClickHouse 的架构。Elasticsearch 依赖水平扩展和分片来获得性能和容错能力，因此默认具有多个分片；而 ClickHouse 针对垂直扩展进行了优化，通常在分片较少的情况下表现最佳。

### 推荐设置 {#recommended-settings}

建议从**单个分片**开始，并通过垂直扩展进行扩容。此配置适用于大多数可观测性工作负载，并简化运维管理和查询性能调优。

- **[ClickHouse Cloud](https://clickhouse.com/cloud)**：默认使用单分片、多副本架构。存储与计算可独立扩展，非常适合摄取模式不可预测且读取负载较重的可观测性场景。
- **ClickHouse OSS**：在自管部署中，建议：
  - 从单个分片开始
  - 通过增加 CPU 和内存进行垂直扩展
  - 使用 [分层存储](/observability/managing-data#storage-tiers) 将本地磁盘扩展到兼容 S3 的对象存储
  - 在需要高可用时，使用 [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication)
  - 对于容错性，[1 个分片副本](/engines/table-engines/mergetree-family/replication) 通常足以满足可观测性工作负载。

### 何时进行分片 {#when-to-shard}

在以下情况下可能需要进行分片：

- 摄取速率超过单个节点的处理能力（通常 >500K 行/秒）
- 需要租户隔离或区域级数据隔离
- 即使使用对象存储，总数据集仍然过大，无法容纳于单台服务器

如果确实需要分片，请参考[水平扩展](/architecture/horizontal-scaling)，获取关于分片键和分布式表设置的指导。

### 保留策略和 TTL {#retention-and-ttl}

ClickHouse 在 MergeTree 表上使用 [TTL 子句](/use-cases/observability/clickstack/production#configure-ttl) 来管理数据过期。TTL 策略可以：

- 自动删除已过期数据
- 将较旧的数据移动到冷对象存储
- 仅在高速磁盘上保留最新、查询最频繁的日志

建议将 ClickHouse 的 TTL 配置与现有的 Elastic 保留策略对齐，以在迁移期间保持一致的数据生命周期。示例参见 [ClickStack 生产环境 TTL 配置](/use-cases/observability/clickstack/production#configure-ttl)。



## 迁移数据 {#migrating-data}

虽然我们建议对大多数可观测性数据采用并行运行的方式,但在某些特定情况下,可能需要将数据从 Elasticsearch 直接迁移到 ClickHouse:

- 用于数据增强的小型查找表(例如用户映射、服务目录)
- 存储在 Elasticsearch 中需要与可观测性数据关联的业务数据,相比 Elasticsearch 较为有限的查询选项,ClickHouse 的 SQL 功能和商业智能集成使得数据的维护和查询更加便捷。
- 需要在迁移过程中保留的配置数据

此方法仅适用于 1000 万行以下的数据集,因为 Elasticsearch 的导出功能仅限于通过 HTTP 传输 JSON,对于更大的数据集扩展性不佳。

以下步骤说明如何将单个 Elasticsearch 索引迁移到 ClickHouse。

<VerticalStepper headerLevel="h3">

### 迁移模式 {#migrate-scheme}

在 ClickHouse 中为从 Elasticsearch 迁移的索引创建表。用户可以将 [Elasticsearch 类型映射到其 ClickHouse](/use-cases/observability/clickstack/migration/elastic/types) 等效类型。或者,用户也可以直接使用 ClickHouse 中的 JSON 数据类型,该类型会在插入数据时动态创建相应类型的列。

请参考以下包含 `syslog` 数据的索引的 Elasticsearch 映射:

<details>
<summary>Elasticsearch 映射</summary>


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

等价的 ClickHouse 表结构：

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

请注意：

* 使用 `Tuple` 来表示嵌套结构，而不是点号分隔的字段表示法
* 基于映射使用了合适的 ClickHouse 类型：
  * `keyword` → `String`
  * `date` → `DateTime`
  * `boolean` → `UInt8`
  * `long` → `Int64`
  * `ip` → `Array(Variant(IPv4, IPv6))`。这里我们使用 [`Variant(IPv4, IPv6)`](/sql-reference/data-types/variant)，因为该字段同时包含 [`IPv4`](/sql-reference/data-types/ipv4) 和 [`IPv6`](/sql-reference/data-types/ipv6)。
  * `object` → `JSON`，用于结构不可预测的 syslog 对象。
* 列 `host.ip` 和 `host.mac` 被显式定义为 `Array` 类型，这与 Elasticsearch 中所有类型默认都表示为数组的方式不同。
* 添加了一个基于时间戳和主机名的 `ORDER BY` 子句，以实现高效的时间序列查询
* 使用了适合日志数据的 `MergeTree` 作为引擎类型

**推荐采用这种静态定义 schema、并仅在需要时选择性使用 JSON 类型的方式，[相关说明见此](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)。**

这种严格的 schema 具有以下诸多优点：

* **数据校验**——强制使用严格的 schema 可以在特定结构之外避免列数量爆炸的风险。
* **避免列数量爆炸风险**：尽管 JSON 类型可以扩展到潜在的成千上万列（其中子列会以独立列的形式存储），但这可能导致列文件数量过多，从而影响性能。为缓解这一问题，JSON 底层使用的 [Dynamic 类型](/sql-reference/data-types/dynamic) 提供了 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) 参数，用于限制作为独立列文件存储的唯一路径数量。一旦达到阈值，额外的路径会被存储在一个共享列文件中，并采用紧凑的编码格式，在支持灵活数据摄取的同时维持性能和存储效率。不过，访问该共享列文件的性能不如访问独立列。另请注意，JSON 列可以结合 [type hints](/integrations/data-formats/json/schema#using-type-hints-and-skipping-paths) 使用，带有 type hint 的列在性能上将与独立列相同。
* **更易于对路径和类型进行自省**：虽然 JSON 类型支持 [自省函数](/sql-reference/data-types/newjson#introspection-functions) 来确定已经推断出的类型和路径，但静态结构在探索时可能更为简单，例如通过 `DESCRIBE`。

<br />

或者，用户也可以仅创建一个包含单个 `JSON` 列的表。

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
我们在 JSON 定义中为 `host.name` 和 `timestamp` 列提供了类型提示，因为会在排序键/主键中使用它们。这样可以帮助 ClickHouse 确定该列不会为 null，并确保它知道应使用哪些子列（每种类型可能存在多个子列，否则会产生歧义）。
:::

后一种方式虽然更简单，但最适合用于原型开发和数据工程任务。在生产环境中，仅在必要的动态子结构上使用 `JSON`。

有关在 schema 中使用 JSON 类型以及如何高效应用它的更多详细信息，请参考指南[“Designing your schema”](/integrations/data-formats/json/schema)。

### 安装 `elasticdump`

我们推荐使用 [`elasticdump`](https://github.com/elasticsearch-dump/elasticsearch-dump) 从 Elasticsearch 导出数据。该工具依赖 `node`，应安装在同时与 Elasticsearch 和 ClickHouse 具有良好网络连接的机器上。对于大多数导出任务，我们建议使用至少具备 4 核 CPU 和 16GB 内存的专用服务器。

```shell
npm install elasticdump -g
```

`elasticdump` 在数据迁移方面有以下优势：

* 它直接与 Elasticsearch REST API 交互，确保数据被正确导出。
* 使用 Point-in-Time (PIT) API 在导出过程中保持数据一致性——会在某一特定时间点创建数据的一致性快照。
* 可直接以 JSON 格式导出数据，并将其流式传输到 ClickHouse 客户端进行插入。

在条件允许的情况下，我们建议将 ClickHouse、Elasticsearch 和 `elastic dump` 部署在同一可用区或数据中心，以最小化网络出口流量并最大化吞吐量。

### 安装 ClickHouse 客户端

确保在 `elasticdump` 所在的服务器上已[安装 ClickHouse](/install)。**不要启动 ClickHouse 服务器**——以下步骤只需要使用客户端。

### 流式传输数据

要在 Elasticsearch 和 ClickHouse 之间流式传输数据，请使用 `elasticdump` 命令，并将输出通过管道直接传递给 ClickHouse 客户端。下面的操作会将数据插入到我们结构良好的表 `logs_system_syslog` 中。


```shell
# 导出 URL 和凭据
export ELASTICSEARCH_INDEX=.ds-logs-system.syslog-default-2025.06.03-000001
export ELASTICSEARCH_URL=
export ELASTICDUMP_INPUT_USERNAME=
export ELASTICDUMP_INPUT_PASSWORD=
export CLICKHOUSE_HOST=
export CLICKHOUSE_PASSWORD=
export CLICKHOUSE_USER=default
```


# 运行命令 - 根据需要修改

elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONEachRow"

````

注意 `elasticdump` 的以下标志用法:

- `type=data` - 将响应限制为仅 Elasticsearch 中的文档内容。
- `input-index` - Elasticsearch 输入索引。
- `output=$` - 将所有结果重定向到标准输出。
- `sourceOnly` 标志,确保响应中省略元数据字段。
- `searchAfter` 标志,使用 [`searchAfter` API](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results#search-after) 实现高效的结果分页。
- `pit=true` 使用 [point in time API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-open-point-in-time) 确保查询间结果的一致性。
<br/>
此处的 ClickHouse 客户端参数(凭据除外):

- `max_insert_block_size=1000` - ClickHouse 客户端在达到此行数时发送数据。增加此值可提高吞吐量,但会增加构建数据块的时间,从而延长数据在 ClickHouse 中出现的时间。
- `min_insert_block_size_bytes=0` - 关闭服务器端按字节压缩数据块。
- `min_insert_block_size_rows=1000` - 在服务器端压缩来自客户端的数据块。在本例中,将其设置为 `max_insert_block_size`,使行立即出现。增加此值可提高吞吐量。
- `query="INSERT INTO logs_system_syslog FORMAT JSONAsRow"` - 以 [JSONEachRow 格式](/integrations/data-formats/json/other-formats)插入数据。当发送到定义明确的模式(如 `logs_system_syslog`)时,这是合适的选择。
<br/>
**用户可以预期吞吐量达到每秒数千行的量级。**

:::note 插入到单个 JSON 行
如果插入到单个 JSON 列(参见上面的 `syslog_json` 模式),可以使用相同的插入命令。但是,用户必须指定 `JSONAsObject` 作为格式,而不是 `JSONEachRow`,例如:

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONAsObject"
````

有关更多详细信息,请参阅["将 JSON 读取为对象"](/integrations/data-formats/json/other-formats#reading-json-as-an-object)。
:::

### 转换数据(可选) {#transform-data}

上述命令假设 Elasticsearch 字段与 ClickHouse 列之间存在一对一映射。用户通常需要在将 Elasticsearch 数据插入 ClickHouse 之前对其进行过滤和转换。

这可以通过使用 [`input`](/sql-reference/table-functions/input) 表函数来实现,该函数允许对标准输出执行任何 `SELECT` 查询。

假设我们只想存储之前数据中的 `timestamp` 和 `hostname` 字段。ClickHouse 模式:

```sql
CREATE TABLE logs_system_syslog_v2
(
    `timestamp` DateTime,
    `hostname` String
)
ENGINE = MergeTree
ORDER BY (hostname, timestamp)
```

要从 `elasticdump` 插入到此表中,只需使用 `input` 表函数 - 使用 JSON 类型动态检测并选择所需的列。请注意,此 `SELECT` 查询可以轻松包含过滤器。

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog_v2 SELECT json.\`@timestamp\` as timestamp, json.host.hostname as hostname FROM input('json JSON') FORMAT JSONAsObject"
```

注意需要转义 `@timestamp` 字段名称并使用 `JSONAsObject` 输入格式。

</VerticalStepper>
