---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-data
title: 'Elastic から ClickStack へのデータ移行'
pagination_prev: null
pagination_next: null
sidebar_label: 'データ移行'
sidebar_position: 4
description: 'Elastic から ClickHouse Observability Stack へのデータ移行'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---

## 並行運用戦略 \\{#parallel-operation-strategy\\}

オブザーバビリティ用途で Elastic から ClickStack へ移行する際には、履歴データの移行を試みるのではなく、**並行運用** アプローチを推奨します。この戦略には次の利点があります。

1. **リスクの最小化**: 両方のシステムを同時に稼働させることで、ClickStack を検証しつつ、新しいシステムにユーザーが慣れる間も既存のデータとダッシュボードへのアクセスを維持できます。
2. **自然なデータの有効期限切れ**: ほとんどのオブザーバビリティデータは保持期間が限られており（通常 30 日以内）、Elastic 上のデータが有効期限切れとなるにつれて自然な形で移行を進めることができます。
3. **移行の単純化**: システム間で履歴データを移動するための複雑なデータ転送ツールやプロセスが不要になります。

<br/>

:::note データ移行
["Migrating data"](#migrating-data) セクションでは、Elasticsearch から ClickHouse に重要なデータを移行するためのアプローチを紹介します。これは、大規模なデータセットにはほとんどの場合パフォーマンス上適していません。Elasticsearch 側のエクスポート性能に制約されるうえ、サポートされる形式が JSON のみであるためです。
:::

### 実装手順 \\{#implementation-steps\\}

1. **二重インジェストを構成する**

<br/>

データ収集パイプラインを設定し、Elastic と ClickStack の両方に同時にデータを送信できるようにします。 

これをどのように実現するかは、現在使用している収集用エージェントによって異なります。詳しくは、「[Migrating Agents](/use-cases/observability/clickstack/migration/elastic/migrating-agents)」を参照してください。

2. **保持期間を調整する**

<br/>

Elastic の TTL 設定を、希望する保持期間に合うように構成します。ClickStack 側でも同じ期間データを保持できるように、[TTL](/use-cases/observability/clickstack/production#configure-ttl) を設定します。

3. **検証と比較**

<br/>

- 両方のシステムに対してクエリを実行し、データの一貫性を確認する
- クエリのパフォーマンスと結果を比較する
- ダッシュボードとアラートを ClickStack に移行する（現在は手作業によるプロセスです）
- すべての重要なダッシュボードとアラートが ClickStack 上で期待どおりに動作することを確認する

4. **段階的な移行**

<br/>

- データが Elastic から自然に期限切れを迎えるにつれて、徐々に ClickStack に依存するようになります
- ClickStack に対する信頼が十分に確立されたら、クエリとダッシュボードのリダイレクトを開始できます

### 長期保持 \\{#long-term-retention\\}

より長い保持期間が必要な組織向け:

- Elastic 上のすべてのデータの保持期間が終了するまで、両方のシステムを並行稼働させる
- ClickStack の [階層型ストレージ](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes) 機能を利用すると、長期間保存するデータを効率的に管理できます。
- 生データの保持期間を終了させつつ、集計済みまたはフィルタ済みの履歴データを維持するために、[マテリアライズドビュー](/materialized-view/incremental-materialized-view) の利用を検討してください。

### 移行タイムライン \\{#migration-timeline\\}

移行タイムラインは、データ保持要件によって異なります：

- **30日間の保持**: 移行は1か月以内に完了可能です。
- **より長い保持期間**: Elastic からデータの保持期限が切れるまで、並行運用を継続します。
- **履歴データ**: どうしても必要な場合は、特定の履歴データをインポートするために [データ移行](#migrating-data) の利用を検討してください。

## 設定の移行 \\{#migration-settings\\}

Elastic から ClickStack に移行する際は、インデックスおよびストレージ設定を ClickHouse のアーキテクチャに合わせて調整する必要があります。Elasticsearch はパフォーマンスとフォールトトレランスのために水平スケーリングとシャーディングに依存しており、そのためデフォルトで複数のシャードを持ちますが、ClickHouse は垂直スケーリングに最適化されており、通常は少数のシャード構成で最適なパフォーマンスを発揮します。

### 推奨設定 \\{#recommended-settings\\}

まずは**単一シャード**構成から開始し、垂直方向にスケールさせることを推奨します。この構成は、ほとんどのオブザーバビリティ系ワークロードに適しており、運用管理とクエリパフォーマンスのチューニングの両方を簡素化できます。

- **[ClickHouse Cloud](https://clickhouse.com/cloud)**: デフォルトで単一シャード・マルチレプリカのアーキテクチャを使用します。ストレージとコンピュートを独立してスケールできるため、取り込みパターンが予測しづらく、読み取り中心のオブザーバビリティ用途に最適です。
- **ClickHouse OSS**: セルフマネージドなデプロイでは、次の構成を推奨します:
  - 単一シャードから開始する
  - 追加の CPU と RAM により垂直スケールする
  - S3 互換オブジェクトストレージでローカルディスクを拡張するために、[階層型ストレージ](/observability/managing-data#storage-tiers)を使用する
  - 高可用性が必要な場合は、[`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication) を使用する
  - 障害耐性の観点では、オブザーバビリティ系ワークロードでは通常、[シャードの 1 レプリカ](/engines/table-engines/mergetree-family/replication) で十分です。

### シャーディングが必要な場合 \\{#when-to-shard\\}

次のような場合、シャーディングが必要になることがあります：

- 取り込みレートが単一ノードの処理能力を超えている場合（一般的には単一ノードあたり 500K 行/秒を超える場合）
- テナント分離やリージョンごとのデータ分離が必要な場合
- オブジェクトストレージを利用しても、単一サーバーに収まりきらないほどデータセットが大きい場合

シャーディングが必要な場合は、シャードキーと分散テーブル構成に関するガイダンスとして、[Horizontal scaling](/architecture/horizontal-scaling) を参照してください。

### 保持期間と TTL \\{#retention-and-ttl\\}

ClickHouse は MergeTree テーブルの [TTL 句](/use-cases/observability/clickstack/production#configure-ttl) を使用して、データの有効期限を管理します。TTL ポリシーにより、次のことが可能です。

- 期限切れデータを自動的に削除する
- 古いデータをコールドオブジェクトストレージへ移動する
- 最近の、頻繁にクエリされるログのみを高速ディスク上に保持する

移行中も一貫したデータライフサイクルを維持するために、既存の Elastic の保持ポリシーと整合するように ClickHouse の TTL 設定を合わせることを推奨します。具体例については、[ClickStack 本番環境での TTL 設定](/use-cases/observability/clickstack/production#configure-ttl) を参照してください。

## データの移行 \\{#migrating-data\\}

ほとんどのオブザーバビリティデータについては併用運用を推奨しますが、Elasticsearch から ClickHouse へデータを直接移行する必要があるケースもあります。

- データエンリッチメントに使用される小さなルックアップテーブル（例：ユーザーマッピング、サービスカタログ）
- オブザーバビリティデータと相関付ける必要がある、Elasticsearch に保存されたビジネスデータ。ClickHouse の SQL 機能と Business Intelligence との連携により、クエリ機能が制限されている Elasticsearch と比べて、これらのデータの保守およびクエリが容易になります。
- 移行前後で保持する必要がある構成データ

このアプローチが実用的なのは、1,000 万行未満のデータセットに限られます。これは、Elasticsearch のエクスポート機能が HTTP 経由の JSON に限られており、大規模なデータセットにはうまくスケールしないためです。

以下の手順では、単一の Elasticsearch インデックスを ClickHouse に移行します。

<VerticalStepper headerLevel="h3">
  ### スキーマの移行

  Elasticsearchから移行するインデックス用のテーブルをClickHouseに作成します。[Elasticsearchのデータ型をClickHouseの対応する型](/use-cases/observability/clickstack/migration/elastic/types)にマッピングすることができます。あるいは、ClickHouseのJSON型を利用することで、データ挿入時に適切な型のカラムが動的に作成されます。

  `syslog` データを含むインデックスに対する以下の Elasticsearch マッピングを確認してください:

  <details>
    <summary>Elasticsearchマッピング</summary>

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

  対応するClickHouseテーブルスキーマ:

  <details>
    <summary>ClickHouse のスキーマ</summary>

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

  以下の点に注意してください：

  * タプルは、ドット記法の代わりにネスト構造の表現に使用されています
  * マッピングに基づき、適切な ClickHouse 型を採用しています:
    * `keyword` → `String`
    * `date` → `DateTime`
    * `boolean` → `UInt8`
    * `long` → `Int64`
    * `ip` → `Array(Variant(IPv4, IPv6))`。このフィールドには [`IPv4`](/sql-reference/data-types/ipv4) と [`IPv6`](/sql-reference/data-types/ipv6) が混在しているため、[`Variant(IPv4, IPv6)`](/sql-reference/data-types/variant) を使用します。
    * `object` → 構造を事前に固定できない syslog オブジェクトには `JSON` を使用します。
  * `host.ip` と `host.mac` の列は明示的に `Array` 型として定義されています。一方、Elasticsearch ではすべての型が配列型として扱われます。
  * 時間ベースのクエリを効率的に実行できるよう、タイムスタンプとホスト名をキーとする `ORDER BY` 句を追加しています
  * ログデータに最適な `MergeTree` をテーブルエンジンとして使用します

  **スキーマを静的に定義し、必要な箇所でJSON型を選択的に使用するこのアプローチが[推奨されます](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)。**

  この厳密なスキーマには、次のような利点があります：

  * **データ検証** – 厳密なスキーマを採用することで、一部の特殊な構造を除き、列の爆発的増加のリスクを回避できます。
  * **列の爆発的増加のリスクを回避**: JSON 型ではサブカラムが専用のカラムとして保存されるため、潜在的には数千のカラムまでスケールできますが、その結果として過剰な数のカラムファイルが生成され、パフォーマンスに悪影響を及ぼす「カラムファイルの爆発」を引き起こす可能性があります。この問題を抑制するために、JSON が利用している基盤となる [Dynamic type](/sql-reference/data-types/dynamic) では、[`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) パラメータを提供しており、別個のカラムファイルとして保存される一意のパス数を制限できます。このしきい値に達すると、それ以降のパスは共有のカラムファイルにコンパクトなエンコード形式で保存され、柔軟なデータのインジェストをサポートしつつ、パフォーマンスとストレージ効率を維持します。ただし、この共有カラムファイルへのアクセスは、専用カラムほど高パフォーマンスではありません。なお、JSON カラムは [type hints](/integrations/data-formats/json/schema#using-type-hints-and-skipping-paths) と併用することもできます。&quot;Hinted&quot; カラムは専用カラムと同等のパフォーマンスを提供します。
  * **パスと型のより容易な把握**：JSON 型にも、推論された型やパスを確認するための[イントロスペクション関数](/sql-reference/data-types/newjson#introspection-functions)がありますが、`DESCRIBE` などを利用できる静的な構造のほうが、より簡単に把握できる場合があります。

  <br />

  あるいは、1つの`JSON`カラムを持つテーブルを作成することもできます。

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
  JSON定義内の`host.name`カラムと`timestamp`カラムに型ヒントを指定しています。これらのカラムを順序付けキー/プライマリキーで使用するためです。これによりClickHouseは当該カラムがnullにならないことを認識し、使用すべきサブカラムを判別できます(各型に対して複数のサブカラムが存在する可能性があるため、型ヒントがない場合は曖昧になります)。
  :::

  この後者のアプローチは、よりシンプルではありますが、プロトタイピングやデータエンジニアリング作業に最適です。本番環境では、動的なサブ構造が必要な場合にのみ`JSON`を使用してください。

  スキーマにおけるJSON型の使用方法と効率的な適用方法の詳細については、ガイド[&quot;スキーマの設計&quot;](/integrations/data-formats/json/schema)を参照してください。

  ### `elasticdump` のインストール

  Elasticsearchからのデータエクスポートには[`elasticdump`](https://github.com/elasticsearch-dump/elasticsearch-dump)の使用を推奨します。このツールは`node`が必要であり、ElasticsearchとClickHouseの両方にネットワーク的に近いマシンにインストールする必要があります。ほとんどのエクスポート作業では、最低4コアと16GBのRAMを搭載した専用サーバーを推奨します。

  ```shell
  npm install elasticdump -g
  ```

  `elasticdump`はデータ移行において次の利点があります：

  * Elasticsearch REST API と直接連携し、データが正しくエクスポートされるようにします。
  * エクスポート処理中は Point-in-Time（PIT）API を使用してデータの一貫性を確保します。これにより、特定時点のデータを一貫した状態でスナップショットとして取得できます。
  * データを JSON 形式で直接エクスポートでき、ClickHouse クライアントにストリーミングしてそのまま挿入できます。

  可能な限り、ClickHouse、Elasticsearch、および `elastic dump` を同一のアベイラビリティゾーンまたはデータセンター内で実行することを推奨します。これにより、ネットワーク送信を最小化し、スループットを最大化できます。

  ### ClickHouseクライアントのインストール

  `elasticdump`が配置されている[サーバーにClickHouseがインストールされている](/install)ことを確認してください。**ClickHouseサーバーは起動しないでください** - これらの手順ではクライアントのみが必要です。

  ### データのストリーミング

  ElasticsearchとClickHouse間でデータをストリーミングするには、`elasticdump`コマンドを使用し、出力を直接ClickHouseクライアントにパイプします。以下のコマンドは、適切に構造化されたテーブル`logs_system_syslog`にデータを挿入します。

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

  `elasticdump`では以下のフラグを使用します：

  * `type=data` - レスポンスを Elasticsearch ドキュメントの内容のみに限定します。
  * `input-index` - Elasticsearch の入力インデックス。
  * `output=$` - すべての結果を標準出力 (stdout) にリダイレクトします。
  * `sourceOnly` フラグにより、レスポンスからメタデータフィールドが除外されます。
  * `searchAfter` フラグは、結果を効率的にページングするために [`searchAfter` API](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results#search-after) を利用するためのフラグです。
  * `pit=true` を指定して、[point in time API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-open-point-in-time) を使用するクエリ間で結果の一貫性を確保します。

  <br />

  ここでのClickHouseクライアントパラメータ（認証情報を除く）:

  * `max_insert_block_size=1000` - ClickHouse クライアントは、この行数に達するごとにデータを送信します。この値を大きくするとスループットは向上しますが、1ブロックを組み立てるまでの時間が長くなり、その結果 ClickHouse にデータが出現するまでの時間も長くなります。
  * `min_insert_block_size_bytes=0` - サーバー側でのバイト数に基づくブロック結合処理を無効化します。
  * `min_insert_block_size_rows=1000` - クライアントから送信されたブロックをサーバー側でまとめて結合します。この例では、行が即座に反映されるように `max_insert_block_size` と同じ値に設定しています。スループットを向上させたい場合は、この値を大きくしてください。
  * `query="INSERT INTO logs_system_syslog FORMAT JSONAsRow"` - データを [JSONEachRow 形式](/integrations/data-formats/json/other-formats) として挿入します。これは `logs_system_syslog` のような、厳密に定義されたスキーマに対して書き込む場合に適しています。

  <br />

  **毎秒数千行のオーダーのスループットを期待できます。**

  :::note 単一のJSON行への挿入
  単一のJSONカラムに挿入する場合（上記の`syslog_json`スキーマを参照）、同じinsertコマンドを使用できます。ただし、フォーマットとして`JSONEachRow`ではなく`JSONAsObject`を指定する必要があります。例：

  ```shell
  elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true | 
  clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
  --min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONAsObject"
  ```

  詳細については、[&quot;JSONをオブジェクトとして読み取る&quot;](/integrations/data-formats/json/other-formats#reading-json-as-an-object)を参照してください。
  :::

  ### データの変換（オプション）

  上記のコマンドは、ElasticsearchフィールドとClickHouseカラムが1対1で対応していることを前提としています。多くの場合、ユーザーはClickHouseへ挿入する前にElasticsearchデータのフィルタリングと変換を行う必要があります。

  これは[`input`](/sql-reference/table-functions/input)テーブル関数を使用することで実現できます。この関数により、標準出力に対して任意の`SELECT`クエリを実行できます。

  先ほどのデータから`timestamp`と`hostname`フィールドのみを保存する場合を想定します。ClickHouseスキーマは次のようになります：

  ```sql
  CREATE TABLE logs_system_syslog_v2
  (
      `timestamp` DateTime,
      `hostname` String
  )
  ENGINE = MergeTree
  ORDER BY (hostname, timestamp)
  ```

  `elasticdump`からこのテーブルへデータを挿入するには、`input`テーブル関数を使用します。JSON型により必要なカラムを動的に検出・選択できます。なお、この`SELECT`クエリにはフィルタを容易に追加できます。

  ```shell
  elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
  clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
  --min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog_v2 SELECT json.\`@timestamp\` as timestamp, json.host.hostname as hostname FROM input('json JSON') FORMAT JSONAsObject"
  ```

  `@timestamp` フィールド名のエスケープと `JSONAsObject` 入力形式の使用が必要です。
</VerticalStepper>