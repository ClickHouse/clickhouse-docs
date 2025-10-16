---
'slug': '/use-cases/observability/clickstack/migration/elastic/migrating-data'
'title': '从 Elastic 迁移数据到 ClickStack'
'pagination_prev': null
'pagination_next': null
'sidebar_label': '迁移数据'
'sidebar_position': 4
'description': '从 Elastic 迁移数据到 ClickHouse 观察性堆栈'
'show_related_blogs': true
'keywords':
- 'ClickStack'
'doc_type': 'guide'
---

## 并行操作策略 {#parallel-operation-strategy}

在从 Elastic 迁移到 ClickStack 的可观察性用例时，我们建议采用 **并行操作** 方法，而不是试图迁移历史数据。这种策略有几个优势：

1. **最小风险**：通过同时运行两个系统，您可以在验证 ClickStack 并让用户熟悉新系统的同时，保持对现有数据和仪表板的访问。
2. **自然数据过期**：大多数可观察性数据的保留期有限（通常为 30 天或更短），这使得数据从 Elastic 过期时实现自然过渡。
3. **简化迁移**：无需复杂的数据传输工具或流程来在系统之间移动历史数据。
<br/>
:::note 迁移数据
我们在 ["迁移数据"](#migrating-data) 部分演示了将重要数据从 Elasticsearch 迁移到 ClickHouse 的方法。由于 Elasticsearch 在以 JSON 格式导出时效率有限，因此不应将其用于更大的数据集。
:::

### 实施步骤 {#implementation-steps}

1. **配置双重摄取**
<br/>
设置数据收集管道以同时将数据发送到 Elastic 和 ClickStack。

如何实现这一点取决于您当前用于收集的代理 - 请参阅 ["迁移代理"](/use-cases/observability/clickstack/migration/elastic/migrating-agents)。

2. **调整保留期**
<br/>
配置 Elastic 的 TTL 设置以匹配您所需的保留期。设置 ClickStack 的 [TTL](/use-cases/observability/clickstack/production#configure-ttl) 以保持相同时间段的数据。

3. **验证和比较**：
<br/>
- 对两个系统运行查询，以确保数据一致性
- 比较查询性能和结果
- 将仪表板和警报迁移到 ClickStack。这目前是一个手动过程。
- 验证所有关键仪表板和警报在 ClickStack 中按预期工作

4. **逐步过渡**：
<br/>
- 随着数据自然从 Elastic 过期，用户将越来越依赖 ClickStack
- 一旦对 ClickStack 建立了信心，您可以开始重定向查询和仪表板

### 长期保留 {#long-term-retention}

对于需要更长保留期的组织：

- 继续同时运行两个系统，直到所有数据从 Elastic 过期
- ClickStack 的 [分层存储](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes) 功能可以帮助有效管理长期数据。
- 考虑使用 [物化视图](/materialized-view/incremental-materialized-view) 来保持聚合或过滤的历史数据，同时允许原始数据过期。

### 迁移时间表 {#migration-timeline}

迁移时间表将取决于您的数据保留要求：

- **30 天保留**：迁移可以在一个月内完成。
- **更长的保留**：继续并行操作，直到数据从 Elastic 过期。
- **历史数据**：如果绝对必要，考虑使用 [迁移数据](#migrating-data) 导入特定的历史数据。

## 迁移设置 {#migration-settings}

在从 Elastic 迁移到 ClickStack 时，您的索引和存储设置需要调整以适应 ClickHouse 的架构。虽然 Elasticsearch 依赖于横向扩展和分片以提高性能和容错，因此默认有多个分片，ClickHouse 经过优化，适合纵向扩展，通常在较少的分片下性能最佳。

### 推荐设置 {#recommended-settings}

我们建议从 **单个分片** 开始，并进行纵向扩展。这种配置适合大多数可观察性工作负载，并简化了管理和查询性能调优。

- **[ClickHouse Cloud](https://clickhouse.com/cloud)**：默认使用单分片，多副本架构。存储和计算独立扩展，适合可观察性用例的不可预测摄取模式和重读取工作负载。
- **ClickHouse OSS**：在自管理部署中，我们建议：
  - 从单个分片开始
  - 通过增加 CPU 和内存进行纵向扩展
  - 使用 [分层存储](/observability/managing-data#storage-tiers) 用 S3 兼容对象存储扩展本地磁盘
  - 如果需要高可用性，请使用 [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication)
  - 在可观察性工作负载中，通常 1 个副本的分片 (/engines/table-engines/mergetree-family/replication) 就足够了。

### 何时分片 {#when-to-shard}

如果：

- 您的摄取速率超过单个节点的容量（通常 >500K 行/秒）
- 您需要租户隔离或区域数据分离
- 您的总数据集对于单台服务器来说太大，即使使用对象存储

如果您确实需要分片，请参考 [横向扩展](/architecture/horizontal-scaling) 获取有关分片键和分布式表设置的指导。

### 保留和 TTL {#retention-and-ttl}

ClickHouse 使用 [TTL 子句](/use-cases/observability/clickstack/production#configure-ttl) 管理 MergeTree 表的数据过期。 TTL 策略可以：

- 自动删除过期数据
- 将旧数据移动到冷对象存储
- 仅在快速磁盘上保留最近、经常查询的日志

我们建议将 ClickHouse 的 TTL 配置与现有的 Elastic 保留策略对齐，以在迁移过程中保持一致的数据生命周期。有关示例，请参见 [ClickStack 生产环境的 TTL 设置](/use-cases/observability/clickstack/production#configure-ttl)。

## 迁移数据 {#migrating-data}

虽然我们建议对大多数可观察性数据采用并行操作，但在某些特定情况下，可能需要直接将数据从 Elasticsearch 迁移到 ClickHouse：

- 用于数据增强的小型查找表（例如，用户映射、服务目录）
- 存储在 Elasticsearch 中的业务数据，需要与可观察性数据关联，ClickHouse 的 SQL 能力和商业智能集成使得维护和查询该数据比 Elasticsearch 的查询选项更容易。
- 迁移过程中需要保留的配置数据

这种方法只能用于 1000 万行以下的数据集，因为 Elasticsearch 的导出能力仅限于通过 HTTP 导出的 JSON，对于更大的数据集扩展性差。

以下步骤允许将单个 Elasticsearch 索引从 ClickHouse 迁移。

<VerticalStepper headerLevel="h3">

### 迁移架构 {#migrate-scheme}

为从 Elasticsearch 迁移的索引在 ClickHouse 中创建一个表。用户可以将 [Elasticsearch 类型映射到他们的 ClickHouse](/use-cases/observability/clickstack/migration/elastic/types) 对应类型。或者，用户可以仅依赖 ClickHouse 中的 JSON 数据类型，数据插入时会动态创建适当类型的列。

考虑以下包含 `syslog` 数据的 Elasticsearch 映射：

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

相应的 ClickHouse 表结构：

<details>
<summary>ClickHouse 结构</summary>

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

注意：

- 元组用于表示嵌套结构，而不是点符号
- 根据映射使用适当的 ClickHouse 类型：
  - `keyword` → `String`
  - `date` → `DateTime`
  - `boolean` → `UInt8`
  - `long` → `Int64`
  - `ip` → `Array(Variant(IPv4, IPv6))`。我们在这里使用 [`Variant(IPv4, IPv6)`](/sql-reference/data-types/variant)，因为该字段包含 [`IPv4`](/sql-reference/data-types/ipv4) 和 [`IPv6`](/sql-reference/data-types/ipv6) 的混合。
  - `object` → `JSON` 用于结构不可预测的 syslog 对象。
- 列 `host.ip` 和 `host.mac` 是显式的 `Array` 类型，而不是在 Elasticsearch 中所有类型都是数组。
- 添加了使用时间戳和主机名的 `ORDER BY` 子句，以便于基于时间的查询
- 用于日志数据的引擎类型是 `MergeTree`，这对于日志数据是最佳选择

**这种静态定义架构和选择性使用 JSON 类型的方法 [是推荐的](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)。**

这种严格的架构有许多好处：

- **数据验证** – 强制实施严格的架构可以避免在特定结构之外的列爆炸风险。
- **避免列爆炸的风险**：尽管 JSON 类型可以扩展到潜在数千个列，子列存储为专用列，这可能导致列文件爆炸，生成过多的列文件影响性能。为缓解这个问题，JSON 所使用的底层 [动态类型](/sql-reference/data-types/dynamic) 提供了一个 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) 参数，限制存储为单独列文件的唯一路径数量。一旦达到阈值，额外路径将以紧凑编码格式存储在共享列文件中，从而在保持性能和存储效率的同时支持灵活的数据摄取。不过，访问此共享列文件的性能不佳。请注意，JSON 列可以与 [类型提示](/integrations/data-formats/json/schema#using-type-hints-and-skipping-paths) 一起使用。“提示”列将提供与专用列相同的性能。
- **简化路径和类型的反查**：尽管 JSON 类型支持 [反查函数](/sql-reference/data-types/newjson#introspection-functions) 来确定已推断的类型和路径，静态结构可以更容易地进行探索，例如使用 `DESCRIBE`。
<br/>
或者，用户可以简单地创建一个包含一个 `JSON` 列的表。

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
我们在 JSON 定义中为 `host.name` 和 `timestamp` 列提供了类型提示，因为我们在排序/主键中使用它。这有助于 ClickHouse 知道这个列不会为 null，并确保它知道使用哪个子列（每种类型可能有多个，所以否则会不明确）。
:::

后一种方法虽然更简单，但最适合原型和数据工程任务。对于生产环境，仅在必要时对动态子结构使用 `JSON`。

有关如何在架构中使用 JSON 类型的更多详细信息，以及如何有效应用它，我们推荐 ["设计您的架构"](/integrations/data-formats/json/schema) 指南。

### 安装 `elasticdump` {#install-elasticdump}

我们推荐使用 [`elasticdump`](https://github.com/elasticsearch-dump/elasticsearch-dump) 从 Elasticsearch 导出数据。该工具需要 `node`，并应安装在与 Elasticsearch 和 ClickHouse 网络接近的机器上。我们建议为大多数导出使用至少 4 核心和 16GB RAM 的专用服务器。

```shell
npm install elasticdump -g
```

`elasticdump` 在数据迁移中提供了几个优点：

- 它直接与 Elasticsearch REST API 交互，确保数据导出正确。
- 在导出过程中使用时间点 (PIT) API 维持数据一致性 - 这会在特定时刻创建数据的一致快照。
- 将数据直接导出为 JSON 格式，可以流式传输到 ClickHouse 客户端以进行插入。

在可能的情况下，我们建议在同一可用区域或数据中心运行 ClickHouse、Elasticsearch 和 `elasticdump`，以最小化网络出口并最大化吞吐量。

### 安装 ClickHouse 客户端 {#install-clickhouse-client}

确保在 `elasticdump` 所在的服务器上 [安装 ClickHouse](/install)。**请勿启动 ClickHouse 服务器** - 这些步骤仅需要客户端。

### 流式传输数据 {#stream-data}

要在 Elasticsearch 和 ClickHouse 之间流式传输数据，请使用 `elasticdump` 命令 - 将输出直接管道到 ClickHouse 客户端。以下示例将数据插入我们结构良好的表 `logs_system_syslog` 中。

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

注意 `elasticdump` 的以下标志：

- `type=data` - 限制响应仅为 Elasticsearch 中的文档内容。
- `input-index` - 我们的 Elasticsearch 输入索引。
- `output=$` - 将所有结果重定向到 stdout。
- `sourceOnly` 标志确保我们在响应中省略元数据字段。
- `searchAfter` 标志使用 [`searchAfter` API](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results#search-after) 有效分页结果。
- `pit=true` 以确保使用 [时间点 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-open-point-in-time) 在查询之间获取一致结果。
<br/>
我们 ClickHouse 客户端的参数（除了凭证）：

- `max_insert_block_size=1000` - ClickHouse 客户端将在达到此行数时发送数据。增加会提高吞吐量，但会增加形成一个块的时间，从而延长数据在 ClickHouse 中出现的时间。
- `min_insert_block_size_bytes=0` - 关闭按字节进行的服务器块压缩。
- `min_insert_block_size_rows=1000` - 在服务器端对客户端的块进行压缩。在这种情况下，我们将其设置为 `max_insert_block_size`，因此行会立即出现。增加以提高吞吐量。
- `query="INSERT INTO logs_system_syslog FORMAT JSONAsRow"` - 将数据插入 [JSONEachRow 格式](/integrations/data-formats/json/other-formats)。如果发送到结构良好的架构，如 `logs_system_syslog`，这非常合适。
<br/>
**用户可以期望每秒的吞吐量在数千行的数量级。**

:::note 插入单个 JSON 行
如果要插入单个 JSON 列（请参见上面的 `syslog_json` 架构），可以使用相同的插入命令。然而，用户必须指定 `JSONAsObject` 作为格式，而不是 `JSONEachRow`，例如：

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true | 
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONAsObject"
```

有关更多详细信息，请参见 ["将 JSON 作为对象读取"](/integrations/data-formats/json/other-formats#reading-json-as-an-object)。
:::

### 转换数据（可选） {#transform-data}

上述命令假设 Elasticsearch 字段与 ClickHouse 列之间存在 1:1 配置。用户通常需要在插入 ClickHouse 之前过滤和转换 Elasticsearch 数据。

这可以使用 [`input`](/sql-reference/table-functions/input) 表函数来实现，该函数允许我们在 stdout 上执行任何 `SELECT` 查询。

假设我们希望仅存储之前数据中的 `timestamp` 和 `hostname` 字段。 ClickHouse 架构：

```sql
CREATE TABLE logs_system_syslog_v2
(
    `timestamp` DateTime,
    `hostname` String
)
ENGINE = MergeTree
ORDER BY (hostname, timestamp)
```

要从 `elasticdump` 插入到该表中，我们可以简单地使用 `input` 表函数 - 使用 JSON 类型动态检测和选择所需列。请注意，此 `SELECT` 查询可以很容易包含过滤条件。

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog_v2 SELECT json.\`@timestamp\` as timestamp, json.host.hostname as hostname FROM input('json JSON') FORMAT JSONAsObject"
```

请注意需要转义 `@timestamp` 字段名称并使用 `JSONAsObject` 输入格式。

</VerticalStepper>
