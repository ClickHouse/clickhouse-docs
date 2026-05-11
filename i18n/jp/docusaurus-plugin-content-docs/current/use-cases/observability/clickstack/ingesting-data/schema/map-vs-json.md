---
slug: /use-cases/observability/clickstack/ingesting-data/schema/map-vs-json
pagination_prev: null
pagination_next: null
description: 'ClickStack の属性で Map 型と JSON 型を利用するタイミング'
sidebar_label: 'Map 型 vs JSON 型'
title: 'ClickStack の Map 型と JSON 型'
doc_type: 'reference'
keywords: ['clickstack', 'json', 'map', '属性', 'schema', 'オブザーバビリティ']
---

import BetaBadge from '@theme/badges/BetaBadge';

ClickStack の[デフォルト schema](/use-cases/observability/clickstack/ingesting-data/schemas)では、resource、scope、log、span の属性は `Map(LowCardinality(String), String)` カラムに保存されます。ClickHouse は厳密に型付けされた [`JSON` 型](/interfaces/formats/JSON) もサポートしており、ClickStack では `Map` の代わりにこれを使用することもベータサポートとしてサポートしています。

**一般的なオブザーバビリティのワークロードでは、[デフォルトの `Map` ベース schema](/use-cases/observability/clickstack/ingesting-data/schemas) をそのまま使い続けることを推奨します。** `JSON` 型は、属性キーの種類が少なく安定しているワークロードで評価したいユーザー向けに利用できますが、一般用途向けの推奨 schema ではありません。

## Map がデフォルトとして推奨される理由 \{#why-map\}

オブザーバビリティデータの大半は、resource attributes、scope attributes、span 属性、log 属性のような属性データです。これらの集合は通常、規模が大きく、高カーディナリティであり、高い処理量で取り込まれます。これらの属性にどの schema を選ぶかは、取り込みコストとストレージレイアウトを決める最も大きな要因です。

`Map(LowCardinality(String), String)` は、キーと値を単一の構造として保存します。`Map` の従来の欠点は、1 つのキーを読み取るだけでも map カラム全体を読む必要があったことです。しかし、これはもはや当てはまりません。ClickHouse は現在、[バケット化 map シリアライゼーション](/sql-reference/data-types/map#bucketed-map-serialization) をサポートしており、map を複数のバケットに分割することで、クエリは必要なバケットだけを読み取れるようになりました。さらに、[ClickStack のデフォルト schema](/use-cases/observability/clickstack/ingesting-data/schemas) で設定されているように、map のキーと値に [テキスト索引](/engines/table-engines/mergetree-family/textindexes) を組み合わせることで、新しいキーが追加されても取り込み時のペナルティなしに、`Map` は読み取り時に高い選択性と速度を実現できます。

実際には、これは次のことを意味します。

* **キーが増えても取り込みコストは安定する。** 新しい属性キーを追加しても、ディスク上のカラムレイアウトは変わらず、新しいカラムファイルも作成されません。取り込みコストはキーのカーディナリティではなく、データ量に左右されます。
* **メタデータが爆発的に増えない。** ディスク上のカラムファイル数は、一意な属性キーの数に連動しません。
* **索引による選択的な検索。** map のキーと値に対するテキスト索引により、すべての行をスキャンしなくてもピンポイントで検索できます。
* **高い処理量でも挙動を予測しやすい。** `Map` は、tracing やログで一般的な、バースト的で schema を持たない属性集合を、キーごとのオーバーヘッドなしで処理できます。

## なぜデフォルトで JSON ではないのか \{#why-not-json\}

`JSON` 型は異なるアプローチを取ります。挿入時には、ClickHouse が検出した各パスごとに、専用の厳密に型付けされたサブカラムを動的に作成します。読み込み時には、要求されたサブカラムだけが読み込まれ、型も保持され、クエリ時のキャストも不要なため、これは魅力的です。

トレードオフが現れるのは取り込み時です。多数の動的サブカラムを作成して管理すると、書き込み時のオーバーヘッドとメタデータの複雑さが増します。オブザーバビリティのワークロードでは、非常に大規模または高度に動的な属性セットと高い取り込み処理量を日常的に扱うため、このオーバーヘッドは無視できません。[`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) 制限を使えば、余分なパスを共有カラムに退避して影響を抑えられますが、共有カラムへのアクセスは専用サブカラムより遅いため、そもそも JSON を使う動機だった読み込み時の利点が損なわれます。

`Map` のバケット化シリアライゼーションによって、`Map` の従来の読み込み時オーバーヘッドの大半が解消されたため、一般的なオブザーバビリティのワークロードでは、`JSON` の読み込み時の利点は、もはや取り込み時のコストを上回りません。

## それでも JSON を検討するケース \{#when-to-consider-json\}

次の条件をすべて満たす場合は、JSON 型 が適した選択肢になることがあります。

* 属性のキーセットが**小さく安定している**。つまり、一意なキーが何千個もなく、新しいキーが追加されることもまれである。
* 属性のカーディナリティに対して、取り込み処理量が**控えめ**である。
* クエリ時のキャストなしで、属性に**型付きでアクセス**したい (数値は数値のまま、ブール値はブール値のまま) 。
* ClickStack で**ベータ機能**を運用し、統合内容が変更される可能性を受け入れられる。

これらの条件をすべて満たさない場合は、[デフォルトの `Map` ベースの schema](/use-cases/observability/clickstack/ingesting-data/schemas) をそのまま使用してください。

## ベータ ステータス \{#beta-status\}

<BetaBadge />

:::warning ベータ機能であり、本番環境には未対応
**ClickStack** における JSON 型 のサポートは**ベータ機能**です。JSON 型 自体は ClickHouse 25.3+ で本番環境に対応していますが、ClickStack での統合は現在も開発が進められており、制限があったり、今後変更される可能性があったり、不具合を含む場合があります。
:::

ClickStack では、バージョン `2.0.4` 以降で JSON 型 がベータサポートされています。

## JSON サポートの有効化 \{#enabling-json-support\}

[デフォルトの `Map` ベースの schema](/use-cases/observability/clickstack/ingesting-data/schemas)ではなく JSON 型 の schema を使用するには、以下の環境変数を設定します。

| 変数                                                              | 設定先                     | 目的                                                                |
| --------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------- |
| `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` | OTel collector          | JSON 型 を使用して ClickHouse に schema を作成します。                       |
| `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`                         | HyperDX (ClickStack UI) | アプリケーション層で JSON 型 の schema をクエリできるようにします。ClickStack オープンソースのみ。 |

### Managed ClickStack \{#managed-clickstack\}

Managed ClickStack で JSON サポートを有効にするには、collector を設定する前に support@clickhouse.com までお問い合わせください。この機能は、ClickHouse Cloud の ClickStack UI (HyperDX) でも有効にする必要があります。

collector に `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` を設定します。例:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
```

### オープンソース ClickStack \{#oss-clickstack\}

collector を含むすべてのデプロイメントで `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` を設定し、HyperDX のアプリケーションレイヤーで `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` を設定して、JSON 型の schema をクエリできるようにします。

たとえば:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
```

## Map ベースの schema から JSON への移行 \{#migrating-from-map-to-json\}

:::important 後方互換性
[JSON 型](/interfaces/formats/JSON) は、既存の Map ベースの schema と **後方互換性がありません**。この機能を有効にすると、`JSON` type を使用する新しいテーブルが作成され、データを手動で移行する必要があります。
:::

[デフォルトの Map ベースの schema](/use-cases/observability/clickstack/ingesting-data/schemas) から移行するには、次の手順に従ってください。

<VerticalStepper headerLevel="h3">
  ### OTel collector を停止する \{#stop-the-collector\}

  ### 既存のテーブル名を変更し、データソースを更新する \{#rename-existing-tables-sources\}

  既存のテーブル名を変更し、HyperDX のデータソースを更新します。

  例:

  ```sql
  RENAME TABLE otel_logs TO otel_logs_map;
  RENAME TABLE otel_metrics TO otel_metrics_map;
  ```

  ### collector をデプロイする \{#deploy-the-collector\}

  `OTEL_AGENT_FEATURE_GATE_ARG` を設定して collector をデプロイします。

  ### JSON schema サポートを有効にして HyperDX コンテナを再起動する \{#restart-the-hyperdx-container\}

  ```shell
  export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
  ```

  ### 新しいデータソースを作成する \{#create-new-data-sources\}

  JSON テーブルを参照する新しいデータソースを HyperDX で作成します。
</VerticalStepper>

### 既存データの移行 (任意) \{#migrating-existing-data\}

古いデータを新しい JSON テーブルに移行するには、以下を実行します。

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
推奨されるのは、約100億行未満のデータセットに限られます。以前に Map 型で保存されたデータでは型の精度が保持されておらず、すべての値が文字列でした。そのため、古いデータは保持期間を過ぎるまで、新しい schema でも文字列として表示され、フロントエンド側で一部キャストが必要になります。新しいデータの型は JSON 型 で保持されます。
:::