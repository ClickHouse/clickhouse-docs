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



## 並行運用戦略 {#parallel-operation-strategy}

オブザーバビリティのユースケースにおいてElasticからClickStackへ移行する際は、履歴データの移行を試みるのではなく、**並行運用**アプローチを推奨します。この戦略には以下のような利点があります：

1. **リスクの最小化**：両システムを同時に稼働させることで、ClickStackの検証とユーザーへの新システムの習熟を進めながら、既存のデータとダッシュボードへのアクセスを維持できます。
2. **自然なデータ有効期限**：ほとんどのオブザーバビリティデータは限られた保持期間（通常30日以下）を持つため、Elasticからデータが期限切れになるにつれて自然な移行が可能です。
3. **移行の簡素化**：システム間で履歴データを移動するための複雑なデータ転送ツールやプロセスが不要です。
   <br />
   :::note データの移行 ["データの移行"](#migrating-data)セクションでは、ElasticsearchからClickHouseへ必須データを移行するアプローチを示しています。これは大規模なデータセットには使用すべきではありません。Elasticsearchの効率的なエクスポート能力に制限があり、JSON形式のみがサポートされているため、パフォーマンスが低いことがほとんどです。:::

### 実装手順 {#implementation-steps}

1. **デュアルインジェストの設定**
   <br />
   データ収集パイプラインを設定し、ElasticとClickStackの両方に同時にデータを送信します。

これをどのように実現するかは、現在使用している収集エージェントに依存します。["エージェントの移行"](/use-cases/observability/clickstack/migration/elastic/migrating-agents)を参照してください。

2. **保持期間の調整**

   <br />
   ElasticのTTL設定を希望する保持期間に合わせて構成します。ClickStackの
   [TTL](/use-cases/observability/clickstack/production#configure-ttl)を設定し、
   同じ期間データを保持するようにします。

3. **検証と比較**：
   <br />

- 両システムに対してクエリを実行し、データの整合性を確認します
- クエリのパフォーマンスと結果を比較します
- ダッシュボードとアラートをClickStackに移行します。これは現在手動プロセスです。
- すべての重要なダッシュボードとアラートがClickStackで期待通りに動作することを確認します

4. **段階的な移行**：
   <br />

- Elasticからデータが自然に期限切れになるにつれて、ユーザーはClickStackへの依存度を高めていきます
- ClickStackへの信頼が確立されたら、クエリとダッシュボードのリダイレクトを開始できます

### 長期保持 {#long-term-retention}

より長い保持期間を必要とする組織の場合：

- Elasticからすべてのデータが期限切れになるまで、両システムを並行して稼働し続けます
- ClickStackの[階層型ストレージ](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)機能は、長期データを効率的に管理するのに役立ちます。
- [マテリアライズドビュー](/materialized-view/incremental-materialized-view)を使用して、生データの期限切れを許可しながら、集約またはフィルタリングされた履歴データを維持することを検討してください。

### 移行タイムライン {#migration-timeline}

移行タイムラインは、データ保持要件に依存します：

- **30日間の保持**：移行は1ヶ月以内に完了できます。
- **より長い保持期間**：Elasticからデータが期限切れになるまで並行運用を継続します。
- **履歴データ**：絶対に必要な場合は、[データの移行](#migrating-data)を使用して特定の履歴データをインポートすることを検討してください。


## 設定の移行 {#migration-settings}

ElasticからClickStackへ移行する際は、インデックス作成とストレージの設定をClickHouseのアーキテクチャに適合させる必要があります。Elasticsearchはパフォーマンスとフォールトトレランスのために水平スケーリングとシャーディングに依存しており、デフォルトで複数のシャードを持ちますが、ClickHouseは垂直スケーリングに最適化されており、通常はシャード数を少なくした方が最高のパフォーマンスを発揮します。

### 推奨設定 {#recommended-settings}

**単一シャード**から始めて垂直スケーリングを行うことを推奨します。この構成はほとんどのオブザーバビリティワークロードに適しており、管理とクエリパフォーマンスチューニングの両方を簡素化します。

- **[ClickHouse Cloud](https://clickhouse.com/cloud)**: デフォルトで単一シャード、マルチレプリカアーキテクチャを使用します。ストレージとコンピュートが独立してスケールするため、予測不可能な取り込みパターンと読み取り負荷の高いワークロードを持つオブザーバビリティユースケースに最適です。
- **ClickHouse OSS**: セルフマネージド環境では、以下を推奨します:
  - 単一シャードから始める
  - 追加のCPUとRAMで垂直スケーリングを行う
  - [階層型ストレージ](/observability/managing-data#storage-tiers)を使用してローカルディスクをS3互換オブジェクトストレージで拡張する
  - 高可用性が必要な場合は[`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication)を使用する
  - フォールトトレランスについては、オブザーバビリティワークロードでは通常[シャードの1レプリカ](/engines/table-engines/mergetree-family/replication)で十分です。

### シャーディングが必要な場合 {#when-to-shard}

以下の場合、シャーディングが必要になる可能性があります:

- 取り込み速度が単一ノードの容量を超える場合(通常は500K行/秒以上)
- テナント分離またはリージョン別のデータ分離が必要な場合
- オブジェクトストレージを使用しても、総データセットが単一サーバーには大きすぎる場合

シャーディングが必要な場合は、シャードキーと分散テーブルの設定に関するガイダンスについて[水平スケーリング](/architecture/horizontal-scaling)を参照してください。

### 保持期間とTTL {#retention-and-ttl}

ClickHouseは、MergeTreeテーブルで[TTL句](/use-cases/observability/clickstack/production#configure-ttl)を使用してデータの有効期限を管理します。TTLポリシーでは以下が可能です:

- 期限切れデータを自動的に削除する
- 古いデータをコールドオブジェクトストレージに移動する
- 最近の頻繁にクエリされるログのみを高速ディスクに保持する

移行中に一貫したデータライフサイクルを維持するため、ClickHouseのTTL設定を既存のElastic保持ポリシーに合わせることを推奨します。例については、[ClickStack本番環境のTTL設定](/use-cases/observability/clickstack/production#configure-ttl)を参照してください。


## データの移行 {#migrating-data}

ほとんどの可観測性データについては並行運用を推奨していますが、ElasticsearchからClickHouseへの直接的なデータ移行が必要となる特定のケースがあります：

- データエンリッチメントに使用される小規模なルックアップテーブル（例：ユーザーマッピング、サービスカタログ）
- 可観測性データと相関させる必要があるElasticsearchに保存されたビジネスデータ。ClickHouseのSQL機能とBusiness Intelligence統合により、Elasticsearchの限定的なクエリオプションと比較して、データの保守とクエリが容易になります。
- 移行時に保持する必要がある設定データ

このアプローチは1,000万行未満のデータセットに対してのみ実行可能です。Elasticsearchのエクスポート機能はHTTP経由のJSONに限定されており、より大規模なデータセットに対してはスケールしないためです。

以下の手順により、単一のElasticsearchインデックスをClickHouseへ移行できます。

<VerticalStepper headerLevel="h3">

### スキーマの移行 {#migrate-scheme}

Elasticsearchから移行するインデックス用のテーブルをClickHouseに作成します。ユーザーは[Elasticsearchの型をClickHouseの対応する型](/use-cases/observability/clickstack/migration/elastic/types)にマッピングできます。あるいは、ClickHouseのJSONデータ型を利用することもできます。これにより、データが挿入される際に適切な型のカラムが動的に作成されます。

`syslog`データを含むインデックスの以下のElasticsearchマッピングを考えてみましょう：

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

ClickHouse における同等のテーブルスキーマは次のとおりです:

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

次の点に注意してください:

* ネストされた構造はドット表記ではなく Tuple で表現しています
* マッピングに基づき、適切な ClickHouse の型を使用しています:
  * `keyword` → `String`
  * `date` → `DateTime`
  * `boolean` → `UInt8`
  * `long` → `Int64`
  * `ip` → `Array(Variant(IPv4, IPv6))`。このフィールドには [`IPv4`](/sql-reference/data-types/ipv4) と [`IPv6`](/sql-reference/data-types/ipv6) が混在しているため、ここでは [`Variant(IPv4, IPv6)`](/sql-reference/data-types/variant) を使用しています。
  * `object` → 構造が予測できない syslog オブジェクトに対しては `JSON`
* `host.ip` と `host.mac` 列は、Elasticsearch ではすべての型が配列であるのとは異なり、明示的に `Array` 型として定義されています。
* 効率的な時間ベースのクエリのため、タイムスタンプとホスト名を用いた `ORDER BY` 句を追加しています
* ログデータに最適な `MergeTree` をエンジンタイプとして使用しています

**スキーマを静的に定義し、必要な箇所でのみ JSON 型を選択的に使用するこのアプローチは、[推奨されています](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)。**

この厳格なスキーマには、いくつかの利点があります:

* **データ検証** – 厳格なスキーマを適用することで、特定の構造以外でのカラム数の増加リスクを回避できます。
* **カラム爆発のリスクを回避**: JSON 型は、サブカラムが専用カラムとして保存されるため潜在的には何千ものカラムまでスケール可能ですが、これにより過剰な数のカラムファイルが作成され、パフォーマンスに影響を与える可能性があります。これを軽減するために、JSON が内部的に使用する [Dynamic 型](/sql-reference/data-types/dynamic) では、[`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) パラメータを提供しており、個別のカラムファイルとして保存される一意なパス数を制限します。しきい値に達すると、追加のパスはコンパクトなエンコード形式を用いて共有カラムファイルに保存され、柔軟なデータ取り込みを維持しつつ、パフォーマンスとストレージ効率を確保します。ただし、この共有カラムファイルへのアクセスは同等の性能は得られません。また、JSON カラムは [type hints](/integrations/data-formats/json/schema#using-type-hints-and-skipping-paths) と組み合わせて使用することができ、「ヒント付き」カラムは専用カラムと同等のパフォーマンスを提供します。
* **パスと型のイントロスペクションがより簡単**: JSON 型は、推論された型やパスを特定するための [イントロスペクション関数](/sql-reference/data-types/newjson#introspection-functions) をサポートしていますが、`DESCRIBE` などを用いて探索する場合、静的な構造のほうが単純なことがあります。

<br />

別の方法として、ユーザーは 1 つの `JSON` カラムを持つテーブルを作成するだけでも構いません。

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
JSON定義において`host.name`と`timestamp`カラムに型ヒントを提供しています。これらのカラムを順序付け/プライマリキーで使用するためです。これにより、ClickHouseはこれらのカラムがnullにならないことを認識し、使用すべきサブカラムを特定できます(各型に対して複数のサブカラムが存在する可能性があるため、指定しない場合は曖昧になります)。
:::

この後者のアプローチは、よりシンプルではありますが、プロトタイピングやデータエンジニアリングタスクに最適です。本番環境では、必要な場合にのみ動的なサブ構造に対して`JSON`を使用してください。

スキーマにおけるJSON型の使用方法と効率的な適用方法の詳細については、ガイド["Designing your schema"](/integrations/data-formats/json/schema)を参照することを推奨します。

### `elasticdump`のインストール {#install-elasticdump}

Elasticsearchからデータをエクスポートするには、[`elasticdump`](https://github.com/elasticsearch-dump/elasticsearch-dump)を推奨します。このツールは`node`を必要とし、ElasticsearchとClickHouseの両方にネットワーク的に近接したマシンにインストールする必要があります。ほとんどのエクスポートには、最低4コアと16GBのRAMを搭載した専用サーバーを推奨します。

```shell
npm install elasticdump -g
```

`elasticdump`は、データ移行において以下の利点を提供します:

- Elasticsearch REST APIと直接やり取りすることで、適切なデータエクスポートを保証します。
- Point-in-Time (PIT) APIを使用してエクスポートプロセス中のデータ整合性を維持します。これにより、特定の時点におけるデータの一貫したスナップショットが作成されます。
- データを直接JSON形式でエクスポートし、ClickHouseクライアントにストリーミングして挿入できます。

可能な限り、ClickHouse、Elasticsearch、および`elasticdump`を同じアベイラビリティゾーンまたはデータセンター内で実行することを推奨します。これにより、ネットワーク送信を最小限に抑え、スループットを最大化できます。

### ClickHouseクライアントのインストール {#install-clickhouse-client}

`elasticdump`が配置されているサーバーにClickHouseが[インストールされている](/install)ことを確認してください。**ClickHouseサーバーを起動しないでください** - これらの手順ではクライアントのみが必要です。

### データのストリーミング {#stream-data}

ElasticsearchとClickHouse間でデータをストリーミングするには、`elasticdump`コマンドを使用し、出力を直接ClickHouseクライアントにパイプします。以下は、適切に構造化されたテーブル`logs_system_syslog`にデータを挿入します。


```shell
# URLと認証情報をエクスポート
export ELASTICSEARCH_INDEX=.ds-logs-system.syslog-default-2025.06.03-000001
export ELASTICSEARCH_URL=
export ELASTICDUMP_INPUT_USERNAME=
export ELASTICDUMP_INPUT_PASSWORD=
export CLICKHOUSE_HOST=
export CLICKHOUSE_PASSWORD=
export CLICKHOUSE_USER=default
```


# 実行するコマンド - 必要に応じて変更してください

elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONEachRow"

````

`elasticdump`の以下のフラグの使用に注意してください：

- `type=data` - レスポンスをElasticsearchのドキュメント内容のみに制限します。
- `input-index` - Elasticsearchの入力インデックスを指定します。
- `output=$` - すべての結果を標準出力にリダイレクトします。
- `sourceOnly` フラグはレスポンスからメタデータフィールドを省略します。
- `searchAfter` フラグは結果の効率的なページネーションのために[`searchAfter` API](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results#search-after)を使用します。
- `pit=true` は[point in time API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-open-point-in-time)を使用してクエリ間で一貫した結果を保証します。
<br/>
ClickHouseクライアントのパラメータ（認証情報を除く）：

- `max_insert_block_size=1000` - ClickHouseクライアントはこの行数に達するとデータを送信します。値を増やすとスループットが向上しますが、ブロック形成に時間がかかるため、データがClickHouseに表示されるまでの時間が長くなります。
- `min_insert_block_size_bytes=0` - サーバー側のバイト単位のブロック圧縮を無効にします。
- `min_insert_block_size_rows=1000` - サーバー側でクライアントからのブロックを圧縮します。この場合、`max_insert_block_size`に設定することで行が即座に表示されます。スループットを向上させるには値を増やしてください。
- `query="INSERT INTO logs_system_syslog FORMAT JSONAsRow"` - データを[JSONEachRow形式](/integrations/data-formats/json/other-formats)として挿入します。`logs_system_syslog`のような明確に定義されたスキーマに送信する場合に適しています。
<br/>
**ユーザーは毎秒数千行のオーダーのスループットを期待できます。**

:::note 単一のJSON行への挿入
単一のJSON列に挿入する場合（上記の`syslog_json`スキーマを参照）、同じ挿入コマンドを使用できます。ただし、`JSONEachRow`の代わりに`JSONAsObject`を形式として指定する必要があります。例：

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONAsObject"
````

詳細については["Reading JSON as an object"](/integrations/data-formats/json/other-formats#reading-json-as-an-object)を参照してください。
:::

### データの変換（オプション） {#transform-data}

上記のコマンドは、ElasticsearchフィールドとClickHouse列の1対1のマッピングを前提としています。ClickHouseへの挿入前にElasticsearchデータをフィルタリングおよび変換する必要がある場合がよくあります。

これは[`input`](/sql-reference/table-functions/input)テーブル関数を使用して実現できます。この関数により、標準出力に対して任意の`SELECT`クエリを実行できます。

先ほどのデータから`timestamp`と`hostname`フィールドのみを保存したいとします。ClickHouseスキーマ：

```sql
CREATE TABLE logs_system_syslog_v2
(
    `timestamp` DateTime,
    `hostname` String
)
ENGINE = MergeTree
ORDER BY (hostname, timestamp)
```

`elasticdump`からこのテーブルに挿入するには、`input`テーブル関数を使用します。JSON型を使用して必要な列を動的に検出および選択します。この`SELECT`クエリにはフィルタを簡単に含めることができます。

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog_v2 SELECT json.\`@timestamp\` as timestamp, json.host.hostname as hostname FROM input('json JSON') FORMAT JSONAsObject"
```

`@timestamp`フィールド名をエスケープし、`JSONAsObject`入力形式を使用する必要があることに注意してください。

</VerticalStepper>
