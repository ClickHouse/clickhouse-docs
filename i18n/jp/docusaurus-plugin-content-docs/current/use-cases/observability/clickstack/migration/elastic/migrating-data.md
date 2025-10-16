---
'slug': '/use-cases/observability/clickstack/migration/elastic/migrating-data'
'title': 'ElasticからClickStackへのデータ移行'
'pagination_prev': null
'pagination_next': null
'sidebar_label': 'データ移行'
'sidebar_position': 4
'description': 'ElasticからClickHouse Observability Stackへのデータ移行'
'show_related_blogs': true
'keywords':
- 'ClickStack'
'doc_type': 'guide'
---

## パラレルオペレーション戦略 {#parallel-operation-strategy}

ElasticからClickStackへの移行を行う際、特に可観測性のユースケースでは、過去のデータを移行する代わりに**パラレルオペレーション**アプローチを推奨します。この戦略にはいくつかの利点があります。

1. **最小限のリスク**: 並行して両方のシステムを運用することで、既存のデータやダッシュボードへのアクセスを維持しながら、ClickStackを検証し、新しいシステムにユーザーを慣れさせることができます。
2. **自然なデータの有効期限**: ほとんどの可観測性データは、限られた保持期間（通常30日以下）を持ち、Elasticからデータが期限切れになるにつれて、自然な移行が可能です。
3. **簡略化された移行**: システム間で歴史的なデータを移動させるための複雑なデータ転送ツールやプロセスは不要です。
<br/>
:::note データ移行
ElasticsearchからClickHouseに重要なデータを移行するためのアプローチは、セクション["データ移行"](#migrating-data)で示しています。この方法は、大規模なデータセットには推奨されません。なぜなら、Elasticsearchが効率的にエクスポートする能力に制限があり、JSON形式のみがサポートされているためです。
:::

### 実装ステップ {#implementation-steps}

1. **デュアルインジェスト設定**
<br/>
データコレクションパイプラインを設定して、ElasticとClickStackの両方に同時にデータを送信します。

これを達成する方法は、現在使用している収集エージェントに依存します。詳細は["エージェントの移行"](/use-cases/observability/clickstack/migration/elastic/migrating-agents)を参照してください。

2. **保持期間の調整**
<br/>
ElasticのTTL設定を希望する保持期間に合わせて構成します。ClickStackの[TTL](/use-cases/observability/clickstack/production#configure-ttl)を設定して、同じ期間データを保持します。

3. **検証と比較**:
<br/>
- 両方のシステムに対してクエリを実行し、データの整合性を確認します
- クエリのパフォーマンスと結果を比較します
- ダッシュボードとアラートをClickStackに移行します。これは現在手動のプロセスです。
- 重要なダッシュボードとアラートがClickStackで期待通りに機能することを確認します

4. **段階的移行**:
<br/>
- データがElasticから自然に期限切れになるにつれ、ユーザーはますますClickStackに依存するようになります
- ClickStackへの信頼が確立され次第、クエリとダッシュボードのリダイレクトを開始できます

### 長期保持 {#long-term-retention}

長期の保持期間を必要とする組織の場合:

- 全てのデータがElasticから期限切れになるまで、両方のシステムを並行して運用し続けます
- ClickStackの[階層ストレージ](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)機能を活用して、長期データを効率的に管理できます。
- アグリゲートまたはフィルタリングされた歴史データを保持しながら、生データを期限切れにするために[マテリアライズドビュー](/materialized-view/incremental-materialized-view)の使用を検討してください。

### 移行タイムライン {#migration-timeline}

移行のタイムラインは、データ保持要件に依存します:

- **30日保持**: 移行は1か月以内に完了できます。
- **長期保持**: データがElasticから期限切れになるまで並行運用を続けます。
- **歴史データ**: 絶対必要な場合は、特定の歴史データをインポートするために[データ移行](#migrating-data)の使用を検討してください。

## 移行設定 {#migration-settings}

ElasticからClickStackに移行する際には、インデックスとストレージの設定をClickHouseのアーキテクチャに合わせて調整する必要があります。Elasticsearchはパフォーマンスと障害耐性のために水平スケーリングとシャーディングに依存しているため、デフォルトで複数のシャードを持っていますが、ClickHouseは垂直スケーリングに最適化されており、通常は少ないシャードで最高のパフォーマンスを発揮します。

### 推奨設定 {#recommended-settings}

**単一シャード**から始め、垂直にスケーリングすることを推奨します。この構成は、ほとんどの可観測性ワークロードに適しており、管理とクエリパフォーマンスのチューニングを簡素化します。

- **[ClickHouse Cloud](https://clickhouse.com/cloud)**: デフォルトで単一シャード、マルチレプリカアーキテクチャを使用します。ストレージとコンピュートは独立してスケールし、予測不可能なインジェストパターンおよび読み取り重視のワークロードに理想的です。
- **ClickHouse OSS**: セルフマネージドデプロイでは、次のことを推奨します:
  - 単一シャードから開始する
  - 追加のCPUとRAMで垂直にスケーリングする
  - [階層ストレージ](/observability/managing-data#storage-tiers)を用いてローカルディスクをS3互換のオブジェクトストレージで拡張する
  - 高可用性が必要な場合は[`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication)を使用する
  - 障害耐性のために、可観測性ワークロードでは[1つのレプリカ](/engines/table-engines/mergetree-family/replication)が通常十分です。

### シャーディングのタイミング {#when-to-shard}

シャーディングが必要になる場合:

- インジェストレートが単一ノードの容量を超える（通常は500K行/秒を超える）
- テナントの隔離や地域データの分離が必要
- 全データセットが単一のサーバーでは大きすぎる（オブジェクトストレージを使用しても）

シャーディングが必要な場合は、シャードキーと分散テーブルのセットアップに関するガイダンスは[水平スケーリング](/architecture/horizontal-scaling)を参照してください。

### 保持とTTL {#retention-and-ttl}

ClickHouseは、MergeTreeテーブル上でデータの有効期限管理のために[TTL句](/use-cases/observability/clickstack/production#configure-ttl)を使用します。TTLポリシーは次のことができます：

- 期限切れデータを自動的に削除する
- 古いデータをコールドオブジェクトストレージに移動する
- 最近の頻繁にクエリされるログのみを高速ディスクに保持する

移行中のデータライフサイクルを維持するために、ClickHouseのTTL設定を既存のElasticの保持ポリシーに合わせることを推奨します。例として、[ClickStackの本番TTL設定](/use-cases/observability/clickstack/production#configure-ttl)を参照してください。

## データ移行 {#migrating-data}

ほとんどの可観測性データにはパラレルオペレーションを推奨していますが、ElasticからClickHouseへの直接的なデータ移行が必要な特定のケースもあります。

- データエンリッチメントに使用される小規模なルックアップテーブル（例：ユーザーのマッピング、サービスカタログ）
- 可観測性データと相関させる必要があるElasticに保存されたビジネスデータ。この場合、ClickHouseのSQL機能とビジネスインテリジェンス統合により、Elasticのより制限されたクエリオプションと比較して、データの保持とクエリが容易になります。
- 移行中に保持する必要のある設定データ

このアプローチは、データセットが1000万行未満の場合にのみ有効です。なぜなら、Elasticsearchのエクスポート能力はHTTP経由でのJSONに制限されており、大規模なデータセットに対してはスケールしないためです。

以下のステップでは、ClickHouseからElasticの単一インデックスを移行することが可能です。

<VerticalStepper headerLevel="h3">

### スキーマの移行 {#migrate-scheme}

Elasticsearchから移行するインデックス用にClickHouseにテーブルを作成します。ユーザーは、[Elasticsearchの型をClickHouse](/use-cases/observability/clickstack/migration/elastic/types)の等価物にマッピングすることができます。あるいは、ユーザーはClickHouseのJSONデータ型に単純に依存して、データが挿入されるときに適切な型のカラムを動的に作成することもできます。

以下は`syslog`データを含むインデックスに対するElasticsearchのマッピングです。

<details>
<summary>Elasticsearchマッピング</summary>

```javascript
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

同等のClickHouseテーブルスキーマ：

<details>
<summary>ClickHouseスキーマ</summary>

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

注意点：

- ネストされた構造はドット表記の代わりにタプルを使用して表します
- マッピングに基づいて適切なClickHouse型を使用しています：
  - `keyword` → `String`
  - `date` → `DateTime`
  - `boolean` → `UInt8`
  - `long` → `Int64`
  - `ip` → `Array(Variant(IPv4, IPv6))`。ここでは[`Variant(IPv4, IPv6)`](/sql-reference/data-types/variant)を使用しています、なぜならフィールドには[`IPv4`](/sql-reference/data-types/ipv4)と[`IPv6`](/sql-reference/data-types/ipv6)といった混合が含まれているためです。
  - `object` → 構造が不確実なsyslogオブジェクトのために`JSON`を使用します。
- カラム `host.ip` と `host.mac` は、Elasticsearchで全ての型が配列であるのに対し、明示的な`Array`型です。
- タイムスタンプとホスト名を使用して、効率的な時間ベースのクエリのために`ORDER BY`句が追加されています
- ログデータに最適な`MergeTree`がエンジンタイプとして使用されます

**このスキーマを静的に定義し、必要に応じてJSON型を選択的に使用するアプローチは[推奨されます](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures)。**

この厳密なスキーマには多くの利点があります：

- **データ検証** – 厳密なスキーマを強制することで、特定の構造外でのカラムの爆発のリスクを回避します。
- **カラム爆発のリスクを回避**: JSON型は潜在的に何千ものカラムにスケールする可能性がありますが、サブカラムが専用のカラムとして保存されていると、極端に多くのカラムファイルが作成され、パフォーマンスに影響を与えるカラムファイルの爆発を引き起こすことがあります。これを軽減するために、JSONによって使用される基盤となる[動的型](/sql-reference/data-types/dynamic)は、別のカラムファイルとして保存されるユニークパスの数を制限する[`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)パラメータを提供します。閾値に達すると、追加のパスはコンパクトにエンコードされた形式の共有カラムファイルに保存され、パフォーマンスとストレージの効率が維持されながら柔軟なデータインジェストがサポートされます。ただし、この共有カラムファイルにアクセスすることは、パフォーマンスがそれほど良くはありません。JSONカラムは、[型ヒント](/integrations/data-formats/json/schema#using-type-hints-and-skipping-paths)と共に使用されることもありますので注意してください。「ヒント付き」カラムは、専用カラムと同じパフォーマンスを提供します。
- **パスと型の簡単な内省**: JSON型は、[内省関数](/sql-reference/data-types/newjson#introspection-functions)をサポートしており、推測された型およびパスを特定できますが、静的構造は、例えば`DESCRIBE`を使ってより簡単に探ることができます。
<br/>
あるいは、ユーザーは単純に`JSON`カラムを1つ持つテーブルを作成することができます。

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
`host.name`と`timestamp`カラムの型ヒントをJSON定義に提供します。これを使用して、整列/主キーに使います。これにより、ClickHouseはこのカラムがnullではないことを知って、どのサブカラムを使うべきかを把握できます（各型には複数あるかもしれないので、そうでなければあいまいです）。
:::

この後者のアプローチは、単純ですが、プロトタイピングやデータエンジニアリングのタスクに最適です。本番環境では、必要な動的サブ構造についてのみ`JSON`を使用してください。

スキーマ内でのJSON型の使用、および効率的に適用する方法に関する詳細は、["スキーマの設計"](/integrations/data-formats/json/schema)ガイドを推奨します。

### `elasticdump`のインストール {#install-elasticdump}

Elasticsearchからデータをエクスポートするために[`elasticdump`](https://github.com/elasticsearch-dump/elasticsearch-dump)を推奨します。このツールは`node`を必要とし、ElasticsearchとClickHouseの両方にネットワーク的に近いマシンにインストールする必要があります。ほとんどのエクスポートに対して、少なくとも4コアおよび16GBのRAMを持つ専用サーバーを推奨します。

```shell
npm install elasticdump -g
```

`elasticdump`はデータ移行にいくつかの利点を提供します：

- ElasticsearchのREST APIと直接やり取りし、適切なデータエクスポートを保証します。
- エクスポートプロセス中にPoint-in-Time (PIT) APIを使用してデータの整合性を維持します。これにより特定の瞬間のデータの一貫したスナップショットを作成します。
- データをJSON形式で直接エクスポートし、ClickHouseクライアントにストリーミングして挿入できます。

可能であれば、ClickHouse、Elasticsearch、および`elasticdump`を同じアベイラビリティゾーンまたはデータセンターで実行し、ネットワークの出力を最小限に抑え、スループットを最大化することを推奨します。

### ClickHouseクライアントのインストール {#install-clickhouse-client}

`elasticdump`が存在するサーバーにClickHouseが[インストールされていること](/install)を確認してください。**ClickHouseサーバーを起動しないでください** - これらのステップはクライアントのみが必要です。 

### データのストリーミング {#stream-data}

ElasticsearchとClickHouseの間でデータをストリーミングするには、`elasticdump`コマンドを使用し、出力を直接ClickHouseクライアントにパイプします。以下はデータを、きちんと構造化されたテーブル`logs_system_syslog`に挿入します。

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

`elasticdump`で使用される次のフラグに注意してください：

- `type=data` - Elasticsearchにおける文書コンテンツのみへの応答を制限します。
- `input-index` - Elasticsearchの入力インデックス。
- `output=$` - すべての結果をstdoutにリダイレクトします。
- メタデータフィールドを応答から省略することを保証する`sourceOnly`フラグ。
- 結果の効率的なページネーションのために[`searchAfter` API](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results#search-after)を使用する`searchAfter`フラグ。
- [ポイント・イン・タイムAPI](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-open-point-in-time)を使用してクエリ間で一貫した結果を保証する`pit=true`。
<br/>
ここでのClickHouseクライアントのパラメータ（資格情報以外）：

- `max_insert_block_size=1000` - ClickHouseクライアントは、この行数に達するとデータを送信します。数値を増加させることでスループットが改善されますが、ブロックを形成する時間が増加するため、ClickHouseにデータが表示されるまでの時間が長くなります。
- `min_insert_block_size_bytes=0` - バイトによるサーバーブロックスクワッシングを無効にします。
- `min_insert_block_size_rows=1000` - サーバー側でクライアントからのブロックをスカッシュします。この場合、`max_insert_block_size`に設定して、行が即座に表示されるようにします。スループットを改善するためには数値を増加させます。
- `query="INSERT INTO logs_system_syslog FORMAT JSONAsRow"` - データを[JSONEachRow形式](/integrations/data-formats/json/other-formats)で挿入します。これは`logs_system_syslog`のような明確に定義されたスキーマに送信する場合に適しています。
<br/>
**ユーザーは毎秒数千行のスループットを期待できます。**

:::note 単一JSON行への挿入
単一JSONカラムに挿入する場合（上記の`syslog_json`スキーマを参照）、同じ挿入コマンドを使用できますが、ユーザーは形式を`JSONAsObject`として指定する必要があります。例：

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true | 
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONAsObject"
```

詳細については["オブジェクトとしてJSONを読む"](/integrations/data-formats/json/other-formats#reading-json-as-an-object)を参照してください。
:::

### データの変換（オプション） {#transform-data}

上記のコマンドは、ElasticsearchフィールドとClickHouseカラム間の1:1マッピングを前提としています。しかし、ユーザーはElasticsearchデータをClickHouseに挿入する前にフィルターや変換が必要なことがよくあります。

これは、`SELECT`クエリをstdout上で実行できる[`input`](/sql-reference/table-functions/input)テーブル関数を使用すると実現できます。

例えば、以前のデータから`timestamp`と`hostname`フィールドだけを保存したいとします。ClickHouseのスキーマ：

```sql
CREATE TABLE logs_system_syslog_v2
(
    `timestamp` DateTime,
    `hostname` String
)
ENGINE = MergeTree
ORDER BY (hostname, timestamp)
```

`elasticdump`からこのテーブルに挿入するためには、JSON型を使用して必要なカラムを動的に検出し選択することで、`input`テーブル関数を単純に使用できます。注：この`SELECT`クエリにはフィルタを含むことができます。

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog_v2 SELECT json.\`@timestamp\` as timestamp, json.host.hostname as hostname FROM input('json JSON') FORMAT JSONAsObject"
```

`@timestamp`フィールド名をエスケープする必要があり、入力形式として`JSONAsObject`を使用することに注意してください。

</VerticalStepper>
