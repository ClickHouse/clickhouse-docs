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

Observability のユースケースで Elastic から ClickStack へ移行する場合、履歴データの移行を試みるのではなく、**並行運用**アプローチを推奨します。この戦略には次のような利点があります。

1. **リスク最小化**: 両システムを同時に稼働させることで、既存のデータやダッシュボードへのアクセスを維持しつつ、ClickStack を検証し、ユーザーが新しいシステムに慣れる時間を確保できます。
2. **自然なデータの消滅**: 多くの Observability データは保持期間が限定されており（通常 30 日以内）、Elastic 上のデータが期限切れになるのに合わせて自然に移行が進みます。
3. **移行の単純化**: 履歴データをシステム間で移動するための複雑なデータ転送ツールやプロセスが不要になります。
<br/>
:::note Migrating data
["Migrating data"](#migrating-data) のセクションで、Elasticsearch から ClickHouse へ重要なデータを移行するアプローチを紹介します。これは大規模なデータセットには使用すべきではありません。Elasticsearch 側の効率的なエクスポート性能に制約があり、サポートされる形式も JSON のみであるため、十分なパフォーマンスが得られないことが多いためです。
:::

### 実装手順 {#implementation-steps}

1. **デュアルインジェストの設定**
<br/>
データ収集パイプラインを設定し、Elastic と ClickStack の両方へ同時にデータを送信できるようにします。

これをどのように実現するかは、現在使用している収集エージェントに依存します。["Migrating Agents"](/use-cases/observability/clickstack/migration/elastic/migrating-agents) を参照してください。

2. **保持期間の調整**
<br/>
Elastic の TTL 設定を、目的の保持期間に合わせて設定します。同じ期間データを保持できるよう、ClickStack の [TTL](/use-cases/observability/clickstack/production#configure-ttl) も設定します。

3. **検証と比較**
<br/>
- 両システムに対してクエリを実行し、データの一貫性を確認する
- クエリ性能と結果を比較する
- ダッシュボードとアラートを ClickStack に移行する（現時点では手動での移行が必要です）
- すべての重要なダッシュボードとアラートが ClickStack 上で期待どおり動作することを確認する

4. **段階的な切り替え**
<br/>
- Elastic 上のデータが自然に期限切れになるにつれ、ユーザーは徐々に ClickStack に依存するようになります
- ClickStack への信頼が確立されたら、クエリやダッシュボードの向き先を切り替え始めることができます

### 長期保持 {#long-term-retention}

より長い保持期間を必要とする組織の場合:

- すべてのデータが Elastic から期限切れになるまで、両システムを並行運用し続けます
- ClickStack の [階層型ストレージ](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes) 機能を利用することで、長期データを効率的に管理できます。
- [マテリアライズドビュー](/materialized-view/incremental-materialized-view) を使用して、集約済みまたはフィルタ済みの履歴データを保持しつつ、生データは期限切れで削除されるようにすることも検討してください。

### 移行タイムライン {#migration-timeline}

移行のタイムラインは、データ保持要件に依存します。

- **30 日保持**: 移行は 1 か月以内に完了できます。
- **より長い保持期間**: Elastic 上のデータが期限切れになるまで並行運用を継続します。
- **履歴データ**: どうしても必要な場合は、特定の履歴データをインポートするために [Migrating data](#migrating-data) の利用を検討してください。



## 設定の移行 {#migration-settings}

Elastic から ClickStack へ移行する際は、インデックスおよびストレージ設定を ClickHouse のアーキテクチャに合わせて調整する必要があります。Elasticsearch は性能とフォールトトレランスのために水平スケーリングとシャーディングに依存しており、そのためデフォルトで複数シャードを持ちますが、ClickHouse は垂直スケーリング向けに最適化されており、一般的には少ないシャード数で最高の性能を発揮します。

### 推奨設定 {#recommended-settings}

まずは**単一シャード**で開始し、垂直スケーリングすることを推奨します。この構成はほとんどのオブザーバビリティワークロードに適しており、運用管理とクエリ性能のチューニングの両方を簡素化します。

- **[ClickHouse Cloud](https://clickhouse.com/cloud)**: デフォルトで単一シャード・マルチレプリカのアーキテクチャを採用しています。ストレージとコンピュートが独立してスケールするため、取り込みパターンが予測しづらく、読み取りが多いオブザーバビリティユースケースに最適です。
- **ClickHouse OSS**: 自前運用の場合は、次を推奨します:
  - 単一シャードから開始する
  - 追加の CPU と RAM により垂直スケーリングする
  - S3 互換オブジェクトストレージでローカルディスクを拡張するために [階層型ストレージ](/observability/managing-data#storage-tiers) を使用する
  - 高可用性が必要な場合は [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication) を使用する
  - フォールトトレランスのためには、オブザーバビリティワークロードでは通常 [シャードあたり 1 レプリカ](/engines/table-engines/mergetree-family/replication) で十分です

### いつシャーディングするか {#when-to-shard}

次のような場合はシャーディングが必要になることがあります:

- 取り込みレートが単一ノードの処理能力を超える場合 (通常は 500K rows/sec 超)
- テナント分離やリージョン別データ分離が必要な場合
- オブジェクトストレージを利用してもなお、データセット全体が単一サーバーに収まりきらない場合

シャーディングが必要な場合は、シャードキーおよび分散テーブルのセットアップに関するガイドとして [水平スケーリング](/architecture/horizontal-scaling) を参照してください。

### 保持期間と TTL {#retention-and-ttl}

ClickHouse は、MergeTree テーブル上で [TTL 句](/use-cases/observability/clickstack/production#configure-ttl) を使用してデータの有効期限を管理します。TTL ポリシーにより、次のことが可能です:

- 期限切れデータの自動削除
- 古いデータをコールドなオブジェクトストレージへ移動
- 最近の、頻繁にクエリされるログのみを高速ディスク上に保持

移行中のデータライフサイクルを一貫させるために、既存の Elastic の保持ポリシーと ClickHouse の TTL 設定を揃えることを推奨します。設定例については、[ClickStack 本番環境での TTL 設定](/use-cases/observability/clickstack/production#configure-ttl) を参照してください。



## データの移行 {#migrating-data}

ほとんどのオブザーバビリティデータについては並行運用を推奨していますが、ElasticsearchからClickHouseへの直接的なデータ移行が必要となる特定のケースがあります：

- データエンリッチメントに使用される小規模なルックアップテーブル（例：ユーザーマッピング、サービスカタログ）
- オブザーバビリティデータと相関付ける必要があるElasticsearchに保存されたビジネスデータ。ClickHouseのSQL機能とビジネスインテリジェンス統合により、Elasticsearchの限定的なクエリオプションと比較して、データの保守とクエリが容易になります。
- 移行時に保持する必要がある設定データ

このアプローチは1,000万行未満のデータセットに対してのみ実行可能です。Elasticsearchのエクスポート機能はHTTP経由のJSONに限定されており、より大規模なデータセットに対してはスケールしないためです。

以下の手順により、単一のElasticsearchインデックスをClickHouseへ移行できます。

<VerticalStepper headerLevel="h3">

### スキーマの移行 {#migrate-scheme}

Elasticsearchから移行するインデックス用のテーブルをClickHouseに作成します。ユーザーは[ElasticsearchタイプをClickHouseの対応するタイプ](/use-cases/observability/clickstack/migration/elastic/types)にマッピングできます。あるいは、ClickHouseのJSONデータ型を使用することもできます。これにより、データが挿入される際に適切な型の列が動的に作成されます。

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

同等の ClickHouse テーブルスキーマは次のとおりです:

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

以下に注意してください:

* ドット表記ではなく、入れ子構造を表現するために Tuple を使用しています。
* 以下のマッピングに基づき、適切な ClickHouse 型を使用しています:
  * `keyword` → `String`
  * `date` → `DateTime`
  * `boolean` → `UInt8`
  * `long` → `Int64`
  * `ip` → `Array(Variant(IPv4, IPv6))`。このフィールドには [`IPv4`](/sql-reference/data-types/ipv4) と [`IPv6`](/sql-reference/data-types/ipv6) が混在しているため、ここでは [`Variant(IPv4, IPv6)`](/sql-reference/data-types/variant) を使用しています。
  * `object` → 構造が予測できない syslog オブジェクトに対しては `JSON`
* `host.ip` と `host.mac` カラムは明示的に `Array` 型になっています。これは、すべての型が配列となる Elasticsearch とは異なります。
* 時系列クエリを効率的に実行するため、タイムスタンプとホスト名を用いた `ORDER BY` 句を追加しています。
* ログデータに最適な `MergeTree` をエンジンタイプとして使用しています。

**スキーマを静的に定義し、必要な箇所のみ選択的に JSON 型を使用するこのアプローチは、[推奨される方法です](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)。**

このような厳格なスキーマには、次のような利点があります:

* **データ検証** – 厳格なスキーマを適用することで、特定の構造を除き、カラム爆発のリスクを回避できます。
* **カラム爆発のリスク回避**: JSON 型はサブカラムを専用カラムとして保存するため、潜在的には数千のカラムまでスケールできますが、その結果として過剰な数のカラムファイルが生成され、パフォーマンスへの悪影響を招く「カラムファイルの爆発」が起こり得ます。これを軽減するために、JSON が内部的に使用する [Dynamic 型](/sql-reference/data-types/dynamic) では [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) パラメータを提供しており、個別のカラムファイルとして保存されるユニークなパスの数を制限します。この閾値に達すると、追加のパスはコンパクトなエンコード形式を用いて共有カラムファイルに保存され、柔軟なデータのインジェストを維持しつつ、パフォーマンスとストレージ効率のバランスを取ります。ただし、この共有カラムファイルへのアクセスは、それほど高性能ではありません。なお、JSON カラムは [type hints](/integrations/data-formats/json/schema#using-type-hints-and-skipping-paths) と併用することができ、「ヒント付き」のカラムは専用カラムと同等のパフォーマンスを発揮します。
* **パスと型のイントロスペクションが容易**: JSON 型は、推論された型とパスを特定するための [イントロスペクション関数](/sql-reference/data-types/newjson#introspection-functions) をサポートしていますが、`DESCRIBE` などを用いる場合、静的構造の方が探索が容易なことがあります。

<br />

別の方法として、ユーザーは単一の `JSON` カラムを持つテーブルを作成するだけでも構いません。

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
`host.name` および `timestamp` カラムは、並び順/プライマリキーで使用するため、JSON 定義内で型ヒントを指定しています。これにより ClickHouse はこのカラムが null になり得ないことを把握でき、どのサブカラムを使用すべきかを認識できます（型ごとに複数のサブカラムが存在し得るため、指定しないと曖昧になります）。
:::

この後者のアプローチは、よりシンプルであり、プロトタイピングやデータエンジニアリングの作業に最適です。本番環境では、必要な場合に限り、動的なサブ構造に対してのみ `JSON` を使用してください。

スキーマでの JSON 型の使用方法や、その効率的な適用方法の詳細については、ガイド [「Designing your schema」](/integrations/data-formats/json/schema) を参照することをお勧めします。

### `elasticdump` をインストールする

Elasticsearch からデータをエクスポートするには [`elasticdump`](https://github.com/elasticsearch-dump/elasticsearch-dump) を推奨します。このツールには `node` が必要で、Elasticsearch と ClickHouse の両方にネットワーク的に近接したマシンにインストールする必要があります。ほとんどのエクスポート用途では、少なくとも 4 コアと 16GB の RAM を持つ専用サーバーを推奨します。

```shell
npm install elasticdump -g
```

`elasticdump` は、データ移行においていくつかの利点があります。

* Elasticsearch REST API と直接やり取りするため、正しくデータをエクスポートできます。
* Point-in-Time (PIT) API を使用してエクスポート処理中のデータ整合性を維持します。これにより、特定時点のデータの一貫したスナップショットが作成されます。
* データを直接 JSON 形式でエクスポートでき、ClickHouse クライアントへストリーミングして挿入できます。

可能であれば、ネットワークの送信トラフィックを最小化しスループットを最大化するため、ClickHouse、Elasticsearch、`elasticdump` を同一のアベイラビリティゾーンまたはデータセンター内で実行することを推奨します。

### ClickHouse クライアントのインストール

`elasticdump` が配置されているサーバーに ClickHouse が[インストールされていること](/install)を確認してください。**ClickHouse サーバーは起動しないでください**。これらの手順で必要なのはクライアントのみです。

### データのストリーミング

Elasticsearch と ClickHouse 間でデータをストリーミングするには、`elasticdump` コマンドを使用し、その出力を ClickHouse クライアントへ直接パイプします。以下の例では、データを適切に設計されたテーブル `logs_system_syslog` に挿入します。


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

`elasticdump`の以下のフラグの使用に注意してください:

- `type=data` - レスポンスをElasticsearch内のドキュメントコンテンツのみに制限します。
- `input-index` - Elasticsearchの入力インデックスです。
- `output=$` - すべての結果を標準出力にリダイレクトします。
- `sourceOnly` - レスポンスからメタデータフィールドを除外します。
- `searchAfter` - 結果の効率的なページネーションのために[`searchAfter` API](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results#search-after)を使用します。
- `pit=true` - [point in time API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-open-point-in-time)を使用してクエリ間で一貫した結果を保証します。
<br/>
ClickHouseクライアントのパラメータ(認証情報を除く):

- `max_insert_block_size=1000` - ClickHouseクライアントはこの行数に達するとデータを送信します。値を増やすとスループットが向上しますが、ブロックの形成に時間がかかるため、ClickHouseにデータが表示されるまでの時間が長くなります。
- `min_insert_block_size_bytes=0` - サーバー側のバイト単位によるブロック圧縮を無効にします。
- `min_insert_block_size_rows=1000` - サーバー側でクライアントからのブロックを圧縮します。この場合、`max_insert_block_size`と同じ値に設定することで行が即座に表示されます。スループットを向上させるには値を増やしてください。
- `query="INSERT INTO logs_system_syslog FORMAT JSONAsRow"` - データを[JSONEachRow形式](/integrations/data-formats/json/other-formats)として挿入します。`logs_system_syslog`のような明確に定義されたスキーマに送信する場合に適しています。
<br/>
**ユーザーは毎秒数千行のオーダーのスループットを期待できます。**

:::note 単一のJSON列への挿入
単一のJSON列に挿入する場合(上記の`syslog_json`スキーマを参照)、同じ挿入コマンドを使用できます。ただし、`JSONEachRow`の代わりに`JSONAsObject`を形式として指定する必要があります。例:

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONAsObject"
````

詳細については["Reading JSON as an object"](/integrations/data-formats/json/other-formats#reading-json-as-an-object)を参照してください。
:::

### データの変換(オプション) {#transform-data}

上記のコマンドはElasticsearchフィールドとClickHouse列の1対1のマッピングを前提としています。ユーザーはClickHouseへの挿入前にElasticsearchデータをフィルタリングおよび変換する必要がある場合が多くあります。

これは[`input`](/sql-reference/table-functions/input)テーブル関数を使用して実現できます。この関数により標準出力に対して任意の`SELECT`クエリを実行できます。

先ほどのデータから`timestamp`と`hostname`フィールドのみを保存したいとします。ClickHouseスキーマ:

```sql
CREATE TABLE logs_system_syslog_v2
(
    `timestamp` DateTime,
    `hostname` String
)
ENGINE = MergeTree
ORDER BY (hostname, timestamp)
```

`elasticdump`からこのテーブルに挿入するには、`input`テーブル関数を使用します。JSON型を使用して必要な列を動的に検出および選択します。この`SELECT`クエリには簡単にフィルタを含めることができます。

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog_v2 SELECT json.\`@timestamp\` as timestamp, json.host.hostname as hostname FROM input('json JSON') FORMAT JSONAsObject"
```

`@timestamp`フィールド名をエスケープし、`JSONAsObject`入力形式を使用する必要があることに注意してください。

</VerticalStepper>
