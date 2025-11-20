---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-data
title: '将数据从 Elastic 迁移到 ClickStack'
pagination_prev: null
pagination_next: null
sidebar_label: '数据迁移'
sidebar_position: 4
description: '将数据从 Elastic 迁移至 ClickHouse Observability Stack'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---



## 并行运行策略 {#parallel-operation-strategy}

在将可观测性用例从 Elastic 迁移到 ClickStack 时,我们建议采用**并行运行**的方式,而不是尝试迁移历史数据。这种策略具有以下几个优势:

1. **风险最小化**:通过同时运行两个系统,您可以在验证 ClickStack 并让用户熟悉新系统的同时,继续访问现有数据和仪表板。
2. **数据自然过期**:大多数可观测性数据的保留期限有限(通常为 30 天或更短),随着数据从 Elastic 中过期,可以实现自然过渡。
3. **简化迁移流程**:无需使用复杂的数据传输工具或流程在系统之间移动历史数据。
   <br />
   :::note 迁移数据 我们在["迁移数据"](#migrating-data)部分演示了一种将关键数据从 Elasticsearch 迁移到 ClickHouse 的方法。此方法不应用于较大的数据集,因为它的性能通常较差 - 受限于 Elasticsearch 的导出能力,且仅支持 JSON 格式。 :::

### 实施步骤 {#implementation-steps}

1. **配置双路数据摄取**
   <br />
   设置您的数据收集管道,使其同时向 Elastic 和 ClickStack 发送数据。

具体实现方式取决于您当前使用的采集代理 - 请参阅["迁移代理"](/use-cases/observability/clickstack/migration/elastic/migrating-agents)。

2. **调整保留期限**

   <br />
   配置 Elastic 的 TTL 设置以匹配您期望的保留期限。设置 ClickStack 的 [TTL](/use-cases/observability/clickstack/production#configure-ttl) 以保持相同的数据保留时长。

3. **验证和比较**:
   <br />

- 对两个系统运行查询以确保数据一致性
- 比较查询性能和结果
- 将仪表板和告警迁移到 ClickStack。这目前是一个手动过程。
- 验证所有关键仪表板和告警在 ClickStack 中按预期工作

4. **逐步过渡**:
   <br />

- 随着数据从 Elastic 中自然过期,用户将越来越多地依赖 ClickStack
- 一旦对 ClickStack 建立了信心,您就可以开始将查询和仪表板重定向到 ClickStack

### 长期保留 {#long-term-retention}

对于需要更长保留期限的组织:

- 继续并行运行两个系统,直到所有数据从 Elastic 中过期
- ClickStack 的[分层存储](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)功能可以帮助高效管理长期数据。
- 考虑使用[物化视图](/materialized-view/incremental-materialized-view)来维护聚合或过滤后的历史数据,同时允许原始数据过期。

### 迁移时间表 {#migration-timeline}

迁移时间表将取决于您的数据保留要求:

- **30 天保留期**:迁移可在一个月内完成。
- **更长保留期**:继续并行运行,直到数据从 Elastic 中过期。
- **历史数据**:如果确有必要,可以考虑使用[迁移数据](#migrating-data)来导入特定的历史数据。


## 迁移设置 {#migration-settings}

从 Elastic 迁移到 ClickStack 时,需要调整索引和存储设置以适配 ClickHouse 的架构。Elasticsearch 依赖水平扩展和分片来实现性能和容错,因此默认使用多个分片;而 ClickHouse 针对垂直扩展进行了优化,通常使用较少分片时性能表现最佳。

### 推荐设置 {#recommended-settings}

我们建议从**单分片**开始,采用垂直扩展方式。这种配置适用于大多数可观测性工作负载,同时简化了管理和查询性能调优。

- **[ClickHouse Cloud](https://clickhouse.com/cloud)**:默认采用单分片、多副本架构。存储和计算独立扩展,非常适合具有不可预测数据摄取模式和读密集型工作负载的可观测性场景。
- **ClickHouse OSS**:在自管理部署中,我们建议:
  - 从单分片开始
  - 通过增加 CPU 和内存进行垂直扩展
  - 使用[分层存储](/observability/managing-data#storage-tiers)通过 S3 兼容对象存储扩展本地磁盘
  - 如需高可用性,使用 [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication)
  - 对于容错性,在可观测性工作负载中,[每个分片 1 个副本](/engines/table-engines/mergetree-family/replication)通常已足够。

### 何时需要分片 {#when-to-shard}

以下情况可能需要分片:

- 数据摄取速率超过单节点容量(通常 >500K 行/秒)
- 需要租户隔离或区域数据分离
- 即使使用对象存储,总数据集对单服务器而言仍过大

如确需分片,请参阅[水平扩展](/architecture/horizontal-scaling)了解分片键和分布式表设置的相关指导。

### 数据保留与 TTL {#retention-and-ttl}

ClickHouse 通过在 MergeTree 表上使用 [TTL 子句](/use-cases/observability/clickstack/production#configure-ttl)来管理数据过期。TTL 策略可以:

- 自动删除过期数据
- 将旧数据迁移到冷对象存储
- 仅在快速磁盘上保留近期频繁查询的日志

我们建议将 ClickHouse TTL 配置与现有 Elastic 保留策略保持一致,以便在迁移期间维持统一的数据生命周期。相关示例请参阅 [ClickStack 生产环境 TTL 设置](/use-cases/observability/clickstack/production#configure-ttl)。


## 迁移数据 {#migrating-data}

虽然我们建议对大多数可观测性数据采用并行运行的方式,但在某些特定情况下,可能需要将数据从 Elasticsearch 直接迁移到 ClickHouse:

- 用于数据增强的小型查找表(例如用户映射、服务目录)
- 存储在 Elasticsearch 中需要与可观测性数据关联的业务数据,相比 Elasticsearch 较为有限的查询选项,ClickHouse 的 SQL 功能和商业智能集成使得数据的维护和查询更加便捷
- 需要在迁移过程中保留的配置数据

此方法仅适用于 1000 万行以下的数据集,因为 Elasticsearch 的导出功能仅限于通过 HTTP 传输 JSON,对于更大的数据集扩展性不佳。

以下步骤允许将单个 Elasticsearch 索引迁移到 ClickHouse。

<VerticalStepper headerLevel="h3">

### 迁移模式 {#migrate-scheme}

在 ClickHouse 中为从 Elasticsearch 迁移的索引创建表。用户可以将 [Elasticsearch 类型映射到其 ClickHouse 等效类型](/use-cases/observability/clickstack/migration/elastic/types)。或者,用户也可以直接使用 ClickHouse 中的 JSON 数据类型,该类型会在插入数据时动态创建相应类型的列。

考虑以下包含 `syslog` 数据的索引的 Elasticsearch 映射:

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

等效的 ClickHouse 表结构：

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

注意事项：

* 使用 Tuple 表示嵌套结构，而非点号表示法
* 根据映射关系使用相应的 ClickHouse 类型：
  * `keyword` → `String`
  * `date` → `DateTime`
  * `boolean` → `UInt8`
  * `long` → `Int64`
  * `ip` → `Array(Variant(IPv4, IPv6))`。此处使用 [`Variant(IPv4, IPv6)`](/sql-reference/data-types/variant)，因为该字段包含 [`IPv4`](/sql-reference/data-types/ipv4) 和 [`IPv6`](/sql-reference/data-types/ipv6) 混合类型。
  * `object` → `JSON`，用于结构不可预测的 syslog 对象。
* 列 `host.ip` 和 `host.mac` 显式声明为 `Array` 类型，这与 Elasticsearch 中所有类型均为数组的方式不同。
* 添加了 `ORDER BY` 子句，使用时间戳和主机名以优化基于时间的查询性能
* 使用 `MergeTree` 引擎类型，该引擎最适合日志数据

**[推荐](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)采用这种静态定义结构并在必要时选择性使用 JSON 类型的方法。**

这种严格的结构定义具有以下优势：

* **数据验证** – 强制执行严格的结构可以避免列爆炸风险（特定结构除外）。
* **避免列爆炸风险**：虽然 JSON 类型可以扩展到数千列，其中子列作为独立列存储，但这可能导致列文件爆炸，即创建过多的列文件从而影响性能。为缓解此问题，JSON 使用的底层 [Dynamic 类型](/sql-reference/data-types/dynamic)提供了 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) 参数，用于限制作为独立列文件存储的唯一路径数量。达到阈值后，额外的路径将使用紧凑编码格式存储在共享列文件中，在支持灵活数据摄取的同时保持性能和存储效率。但需要注意的是，访问共享列文件的性能不如访问独立列。另外，JSON 列可以配合[类型提示](/integrations/data-formats/json/schema#using-type-hints-and-skipping-paths)使用。&quot;提示&quot;列将提供与独立列相同的性能。
* **更简便的路径和类型内省**：虽然 JSON 类型支持[内省函数](/sql-reference/data-types/newjson#introspection-functions)来确定已推断的类型和路径，但静态结构可以更简便地进行探索，例如使用 `DESCRIBE` 命令。

<br />

或者，用户也可以简单地创建一个仅包含单个 `JSON` 列的表。

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
我们在 JSON 定义中为 `host.name` 和 `timestamp` 列提供了类型提示,因为我们在排序键/主键中使用了它们。这有助于 ClickHouse 知道该列不会为 null,并确保它知道要使用哪些子列(每种类型可能有多个子列,否则会产生歧义)。
:::

后一种方法虽然更简单,但最适合用于原型开发和数据工程任务。对于生产环境,仅在必要时对动态子结构使用 `JSON` 类型。

有关在 schema 中使用 JSON 类型以及如何高效应用的更多详细信息,我们推荐阅读["设计您的 schema"](/integrations/data-formats/json/schema)指南。

### 安装 `elasticdump` {#install-elasticdump}

我们推荐使用 [`elasticdump`](https://github.com/elasticsearch-dump/elasticsearch-dump) 从 Elasticsearch 导出数据。该工具需要 `node`,应安装在与 Elasticsearch 和 ClickHouse 网络距离较近的机器上。对于大多数导出任务,我们建议使用至少 4 核和 16GB 内存的专用服务器。

```shell
npm install elasticdump -g
```

`elasticdump` 在数据迁移方面具有以下几个优势:

- 直接与 Elasticsearch REST API 交互,确保正确导出数据。
- 使用时间点(Point-in-Time, PIT)API 在导出过程中保持数据一致性 - 这会在特定时刻创建数据的一致性快照。
- 直接将数据导出为 JSON 格式,可以流式传输到 ClickHouse 客户端进行插入。

在可能的情况下,我们建议在同一可用区或数据中心运行 ClickHouse、Elasticsearch 和 `elasticdump`,以最小化网络出口流量并最大化吞吐量。

### 安装 ClickHouse 客户端 {#install-clickhouse-client}

确保在 `elasticdump` 所在的服务器上[安装了 ClickHouse](/install)。**不要启动 ClickHouse 服务器** - 这些步骤只需要客户端。

### 流式传输数据 {#stream-data}

要在 Elasticsearch 和 ClickHouse 之间流式传输数据,请使用 `elasticdump` 命令 - 将输出直接通过管道传输到 ClickHouse 客户端。以下命令将数据插入到我们结构良好的表 `logs_system_syslog` 中。


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

注意 `elasticdump` 使用了以下参数:

- `type=data` - 将响应限制为仅包含 Elasticsearch 中的文档内容。
- `input-index` - 指定 Elasticsearch 输入索引。
- `output=$` - 将所有结果重定向到标准输出。
- `sourceOnly` 标志确保响应中省略元数据字段。
- `searchAfter` 标志用于使用 [`searchAfter` API](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results#search-after) 实现高效的结果分页。
- `pit=true` 使用 [point in time API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-open-point-in-time) 确保查询之间结果的一致性。
<br/>
ClickHouse 客户端参数说明(除凭据外):

- `max_insert_block_size=1000` - ClickHouse 客户端在达到此行数时发送数据。增加此值可以提高吞吐量,但代价是需要更多时间来构建数据块,从而增加数据出现在 ClickHouse 中的延迟。
- `min_insert_block_size_bytes=0` - 关闭服务器端按字节合并数据块。
- `min_insert_block_size_rows=1000` - 在服务器端合并来自客户端的数据块。在本例中,我们将其设置为与 `max_insert_block_size` 相同,以便数据行立即可见。增加此值可以提高吞吐量。
- `query="INSERT INTO logs_system_syslog FORMAT JSONAsRow"` - 以 [JSONEachRow 格式](/integrations/data-formats/json/other-formats)插入数据。如果目标是定义明确的模式(如 `logs_system_syslog`),这种格式是合适的。
<br/>
**用户可以预期吞吐量达到每秒数千行的量级。**

:::note 插入到单个 JSON 列
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

这可以通过使用 [`input`](/sql-reference/table-functions/input) 表函数来实现,该函数允许我们对标准输出执行任何 `SELECT` 查询。

假设我们只想存储之前数据中的 `timestamp` 和 `hostname` 字段。ClickHouse 表结构如下:

```sql
CREATE TABLE logs_system_syslog_v2
(
    `timestamp` DateTime,
    `hostname` String
)
ENGINE = MergeTree
ORDER BY (hostname, timestamp)
```

要从 `elasticdump` 插入到此表中,我们可以直接使用 `input` 表函数 - 使用 JSON 类型动态检测并选择所需的列。请注意,此 `SELECT` 查询可以轻松包含过滤条件。

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog_v2 SELECT json.\`@timestamp\` as timestamp, json.host.hostname as hostname FROM input('json JSON') FORMAT JSONAsObject"
```

请注意需要转义 `@timestamp` 字段名称并使用 `JSONAsObject` 输入格式。

</VerticalStepper>
