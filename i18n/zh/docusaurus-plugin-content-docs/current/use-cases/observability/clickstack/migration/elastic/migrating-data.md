---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-data
title: '将数据从 Elastic 迁移到 ClickStack'
pagination_prev: null
pagination_next: null
sidebar_label: '数据迁移'
sidebar_position: 4
description: '将数据从 Elastic 迁移到 ClickHouse Observability Stack（ClickStack）'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---

## 并行运行策略 {#parallel-operation-strategy}

在将可观测性场景从 Elastic 迁移到 ClickStack 时，我们推荐采用**并行运行**的方法，而不是尝试迁移历史数据。此策略具有以下优势：

1. **风险最小化**：通过同时运行两个系统，在验证 ClickStack 并让用户熟悉新系统的同时，依然可以访问现有数据和仪表板。
2. **自然的数据过期**：大多数可观测性数据都有有限的保留期（通常为 30 天或更短），随着数据在 Elastic 中自然过期，可以实现自然过渡。
3. **简化迁移过程**：无需使用复杂的数据传输工具或流程在系统之间移动历史数据。

<br/>

:::note 数据迁移
我们在 ["Migrating data"](#migrating-data) 章节中演示了从 Elasticsearch 向 ClickHouse 迁移关键数据的一种方法。对于更大规模的数据集不应采用该方法，因为其性能往往不佳——受限于 Elasticsearch 的导出效率，且仅支持 JSON 格式。
:::

### 实施步骤 {#implementation-steps}

1. **配置双重摄取**

<br/>

将数据采集管道配置为同时向 Elastic 和 ClickStack 发送数据。 

具体实现方式取决于当前使用的采集代理（agent）—— 参见「[迁移 Agents](/use-cases/observability/clickstack/migration/elastic/migrating-agents)」。

2. **调整保留期**

<br/>

将 Elastic 的 TTL 设置配置为与目标保留期一致。配置 ClickStack 的 [TTL](/use-cases/observability/clickstack/production#configure-ttl)，以在相同时间范围内保留数据。

3. **验证与对比**：

<br/>

- 在两个系统上运行查询以确保数据一致性
- 对比查询性能和结果
- 将仪表盘和告警迁移到 ClickStack。目前这仍是一个手动流程。
- 验证所有关键仪表盘和告警在 ClickStack 中是否按预期工作

4. **渐进式切换**：

<br/>

- 随着 Elastic 中的数据自然过期，你会逐步更多地依赖 ClickStack
- 一旦对 ClickStack 建立了足够信心，即可开始将查询和仪表盘重定向到 ClickStack

### 长期保留 {#long-term-retention}

对于需要更长数据保留周期的组织：

- 在 Elastic 中的所有数据过期之前，继续并行运行这两个系统
- 利用 ClickStack 的 [分层存储](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes) 功能高效管理长期数据。
- 考虑使用 [物化视图](/materialized-view/incremental-materialized-view) 来维护聚合或过滤后的历史数据，同时允许原始数据过期。

### 迁移时间线 {#migration-timeline}

迁移时间线取决于数据保留要求：

- **30 天保留期**：迁移可以在一个月内完成。
- **更长保留期**：在 Elastic 中的数据过期之前，继续保持并行运行。
- **历史数据**：如确有必要，可考虑使用 [迁移数据](#migrating-data) 来导入特定的历史数据。

## 迁移设置 {#migration-settings}

从 Elastic 迁移到 ClickStack 时，需要调整索引和存储设置以适应 ClickHouse 的架构。Elasticsearch 依赖水平扩展和分片来获得性能和容错能力，因此默认采用多个分片；而 ClickHouse 针对垂直扩展进行了优化，通常在分片较少的情况下可以获得最佳性能。

### 推荐设置 {#recommended-settings}

我们建议从**单个分片**开始，并进行纵向扩展。此配置适用于大多数可观测性工作负载，同时简化管理和查询性能优化。

- **[ClickHouse Cloud](https://clickhouse.com/cloud)**：默认采用单分片、多副本架构。存储与计算可独立扩展，非常适合摄取模式不可预测且以读取为主的可观测性用例。
- **ClickHouse OSS**：在自行管理的部署中，我们建议：
  - 从单个分片开始
  - 通过增加 CPU 和 RAM 进行纵向扩展
  - 使用[分层存储](/observability/managing-data#storage-tiers)，通过 S3 兼容对象存储扩展本地磁盘
  - 在需要高可用性时使用 [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication)
  - 为实现容错能力，[1 个分片副本](/engines/table-engines/mergetree-family/replication)通常已足以满足可观测性工作负载的需求。

### 何时进行分片 {#when-to-shard}

在以下情况下，可能需要进行分片：

- 您的摄取速率超过单个节点的处理能力（通常 &gt;500K 行/秒）
- 您需要实现租户隔离或区域性数据隔离
- 即使使用对象存储，您的整个数据集对于单台服务器来说仍然过大

如果确实需要分片，请参考[横向扩展](/architecture/horizontal-scaling)，获取关于分片键和分布式表设置的指导。

### 数据保留与 TTL {#retention-and-ttl}

ClickHouse 在 MergeTree 表上使用 [TTL 子句](/use-cases/observability/clickstack/production#configure-ttl) 来管理数据过期。TTL 策略可以：

- 自动删除已过期的数据
- 将较旧的数据迁移到冷对象存储
- 仅在快速磁盘上保留最新且高频查询的日志

我们建议将 ClickHouse 的 TTL 配置与现有的 Elastic 保留策略保持一致，以便在迁移期间维持统一的数据生命周期。示例请参见 [ClickStack 生产环境 TTL 配置](/use-cases/observability/clickstack/production#configure-ttl)。

## 迁移数据 {#migrating-data}

虽然我们建议对大多数可观测性数据采用并行运行的方式，但在某些特定情况下，可能需要将数据从 Elasticsearch 直接迁移到 ClickHouse：

- 用于数据富化的小型查找表（例如用户映射、服务目录）
- 存储在 Elasticsearch 中、需要与可观测性数据进行关联的业务数据。在这种情况下，相比于 Elasticsearch 相对受限的查询能力，借助 ClickHouse 的 SQL 能力以及与商业智能（BI）工具的集成，可以更轻松地维护和查询这些数据。
- 需要在迁移过程中保留的配置数据

由于 Elasticsearch 的导出能力仅限于通过 HTTP 导出 JSON，且在更大规模数据集下扩展性较差，因此该方法仅适用于行数少于 1000 万的数据集。

以下步骤说明如何将单个 Elasticsearch 索引迁移到 ClickHouse。

<VerticalStepper headerLevel="h3">
  ### 迁移数据库架构

  在 ClickHouse 中为从 Elasticsearch 迁移的索引创建表。您可以将 [Elasticsearch 类型映射到其 ClickHouse](/use-cases/observability/clickstack/migration/elastic/types) 对应类型。或者,您也可以直接使用 ClickHouse 中的 JSON 数据类型,它会在插入数据时动态创建相应类型的列。

  请参考以下包含 `syslog` 数据的 Elasticsearch 索引映射：

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

  等效的 ClickHouse 表架构：

  <details>
    <summary>ClickHouse 架构</summary>

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

  * 使用元组来表示嵌套结构，而不是使用点号表示法
  * 根据该映射选用了合适的 ClickHouse 类型：
    * `keyword` → `String`
    * `date` → `DateTime`
    * `boolean` → `UInt8`
    * `long` → `Int64`
    * `ip` → `Array(Variant(IPv4, IPv6))`。我们在这里使用 [`Variant(IPv4, IPv6)`](/sql-reference/data-types/variant)，因为该字段同时包含 [`IPv4`](/sql-reference/data-types/ipv4) 和 [`IPv6`](/sql-reference/data-types/ipv6)。
    * `object` → `JSON`，用于结构不可预知的 syslog 对象。
  * 列 `host.ip` 和 `host.mac` 被显式声明为 `Array` 类型，这不同于 Elasticsearch 中所有类型本质上都被视为数组。
  * 添加了一个基于时间戳和主机名的 `ORDER BY` 子句，以提高按时间查询的效率
  * 使用针对日志数据优化的 `MergeTree` 作为引擎类型

  **[推荐](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)采用静态定义架构并在必要时选择性使用 JSON 类型的方法。**

  这种严格的架构具有以下优势：

  * **数据验证** – 通过强制使用严格的架构，可以在特定结构之外避免列数量爆炸的风险。
  * **避免列爆炸的风险**：尽管 JSON 类型可以扩展到潜在的数千个列，其中子列会被存储为独立的列，但这可能导致列文件数量出现“爆炸式增长”——生成过多列文件，从而影响性能。为缓解这一问题，JSON 底层使用的 [Dynamic 类型](/sql-reference/data-types/dynamic) 提供了一个 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) 参数，用于限制以独立列文件形式存储的唯一路径数量。一旦达到阈值，后续路径会存储在一个共享的列文件中，并使用紧凑的编码格式，从而在支持灵活数据摄取的同时，保持性能和存储效率。不过，访问这个共享列文件的性能不如访问独立列。另请注意，JSON 列可以与 [type hints](/integrations/data-formats/json/schema#using-type-hints-and-skipping-paths) 一起使用。通过类型提示（type hint）定义的列可以提供与独立列相同的性能。
  * **更简单地查看路径和数据类型**：尽管 JSON 类型支持使用[自省函数](/sql-reference/data-types/newjson#introspection-functions)来确定已推断出的类型和路径，但对于静态结构，例如通过 `DESCRIBE` 进行查看通常会更加简单。

  <br />

  或者,用户也可以直接创建一个包含单个 `JSON` 列的表。

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
  我们在 JSON 定义中为 `host.name` 和 `timestamp` 列提供类型提示,因为这些列用于排序键/主键。这样可以让 ClickHouse 明确该列不为空,并确定应使用哪些子列(否则每种类型可能对应多个子列,会产生歧义)。
  :::

  后一种方法虽然更简单,但最适合用于原型开发和数据工程任务。在生产环境中,仅在必要时对动态子结构使用 `JSON` 类型。

  有关在架构中使用 JSON 类型以及如何高效应用的更多详细信息,请参阅指南 [&quot;设计您的架构&quot;](/integrations/data-formats/json/schema)。

  ### 安装 `elasticdump`

  我们推荐使用 [`elasticdump`](https://github.com/elasticsearch-dump/elasticsearch-dump) 从 Elasticsearch 导出数据。该工具依赖 `node`,应安装在与 Elasticsearch 和 ClickHouse 网络邻近的机器上。对于大多数导出操作,我们建议使用至少 4 核 CPU 和 16GB 内存的专用服务器。

  ```shell
  npm install elasticdump -g
  ```

  `elasticdump` 为数据迁移提供了以下优势：

  * 它直接与 Elasticsearch 的 REST API 交互，确保数据被正确导出。
  * 在导出过程中通过 Point-in-Time（PIT）API 保持数据一致性，从而在特定时间点创建一致的数据快照。
  * 将数据直接导出为 JSON 格式，并可以流式方式传输到 ClickHouse 客户端以插入数据。

  在可能的情况下,我们建议将 ClickHouse、Elasticsearch 和 `elastic dump` 部署在同一可用区或数据中心内,以减少网络出口流量并提高吞吐量。

  ### 安装 ClickHouse 客户端

  确保在 `elasticdump` 所在的[服务器上安装 ClickHouse](/install)。**请勿启动 ClickHouse 服务器** - 这些步骤仅需要客户端。

  ### 流式传输数据

  要在 Elasticsearch 和 ClickHouse 之间流式传输数据,请使用 `elasticdump` 命令,通过管道将输出直接传递给 ClickHouse 客户端。以下操作会将数据插入到结构良好的表 `logs_system_syslog` 中。

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

  注意 `elasticdump` 的以下标志用法：

  * `type=data` - 将响应限制为仅包含 Elasticsearch 文档内容。
  * `input-index` - 我们的 Elasticsearch 输入索引。
  * `output=$` - 将所有结果重定向到标准输出 (stdout)。
  * `sourceOnly` 标志，确保在响应中省略元数据字段。
  * `searchAfter` 标志用于通过 [`searchAfter` API](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results#search-after) 对结果进行高效分页。
  * `pit=true`，以确保使用 [Point-in-Time（PIT）API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-open-point-in-time) 进行多次查询时的结果保持一致。

  <br />

  此处的 ClickHouse 客户端参数（凭据除外）：

  * `max_insert_block_size=1000` - 一旦达到该行数，ClickHouse 客户端就会发送数据。增大该值可以提升吞吐量，但代价是组装一个数据块所需时间变长——从而延长数据在 ClickHouse 中变得可见的延迟。
  * `min_insert_block_size_bytes=0` - 禁用服务端按字节数阈值对块进行合并（block squashing）。
  * `min_insert_block_size_rows=1000` - 在服务端合并由客户端发送的块。在这里，我们将其设置为与 `max_insert_block_size` 相同，使行能够立即可见。增大该值可以提升吞吐量。
  * `query="INSERT INTO logs_system_syslog FORMAT JSONAsRow"` - 以 [JSONEachRow 格式](/integrations/data-formats/json/other-formats) 插入数据。对于像 `logs_system_syslog` 这样 schema 定义清晰的表，这种方式是合适的。

  <br />

  **用户可预期达到每秒数千行级别的吞吐量。**

  :::note 插入单个 JSON 行
  如果要插入到单个 JSON 列(参见上述 `syslog_json` 架构),可以使用相同的插入命令。但是,您必须将格式指定为 `JSONAsObject` 而非 `JSONEachRow`,例如:

  ```shell
  elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true | 
  clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
  --min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONAsObject"
  ```

  有关更多详细信息，请参阅[&quot;将 JSON 读取为对象&quot;](/integrations/data-formats/json/other-formats#reading-json-as-an-object)。
  :::

  ### 转换数据(可选)

  上述命令假设 Elasticsearch 字段与 ClickHouse 列之间存在一对一映射。用户通常需要在将 Elasticsearch 数据插入 ClickHouse 之前对其进行过滤和转换。

  这可以通过 [`input`](/sql-reference/table-functions/input) 表函数来实现,它允许我们对标准输出执行任何 `SELECT` 查询。

  假设我们只希望存储之前数据中的 `timestamp` 和 `hostname` 字段。ClickHouse 架构如下：

  ```sql
  CREATE TABLE logs_system_syslog_v2
  (
      `timestamp` DateTime,
      `hostname` String
  )
  ENGINE = MergeTree
  ORDER BY (hostname, timestamp)
  ```

  要将 `elasticdump` 中的数据插入此表,只需使用 `input` 表函数——利用 JSON 类型动态检测并选择所需列。注意,此 `SELECT` 查询可根据需要添加过滤条件。

  ```shell
  elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
  clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
  --min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog_v2 SELECT json.\`@timestamp\` as timestamp, json.host.hostname as hostname FROM input('json JSON') FORMAT JSONAsObject"
  ```

  注意需要对 `@timestamp` 字段名进行转义,并使用 `JSONAsObject` 输入格式。
</VerticalStepper>