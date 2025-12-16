---
sidebar_label: 'Streamkap を ClickHouse に接続する'
sidebar_position: 11
keywords: ['clickhouse', 'Streamkap', 'CDC', '接続', '連携', 'etl', 'データ連携', '変更データキャプチャ']
slug: /integrations/sttreamkap
description: 'Airbyte のデータパイプラインを使用してストリーミングデータを ClickHouse にインジェストする'

title: 'Streamkap を ClickHouse に接続する'
doc_type: 'ガイド'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
  - website: 'https://www.streamkap.com/'
---

import Image from '@theme/IdealImage';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Streamkap を ClickHouse に接続する {#connect-streamkap-to-clickhouse}

<PartnerBadge/>

<a href="https://www.streamkap.com/" target="_blank">Streamkap</a> は、ストリーミング CDC（変更データキャプチャ）およびストリーム処理を専門とするリアルタイムデータ統合プラットフォームです。Apache Kafka、Apache Flink、Debezium を用いた高スループットでスケーラブルなスタック上に構築されており、SaaS または BYOC（Bring your own Cloud）構成のフルマネージドサービスとして提供されます。 

Streamkap を使用すると、PostgreSQL、MySQL、SQL Server、MongoDB、および <a href="https://streamkap.com/connectors" target="_blank">その他</a> のソースデータベースからのすべての insert、update、delete を、ミリ秒単位のレイテンシで直接 ClickHouse にストリーミングできます。 

これにより、リアルタイム分析ダッシュボード、オペレーショナルアナリティクス、機械学習モデルへのライブデータ供給を実現するのに最適です。

## 主な機能 {#key-features}

- **リアルタイムストリーミング CDC:** Streamkap はデータベースのログから直接変更をキャプチャし、ClickHouse 上のデータがソースのリアルタイムなレプリカとなるようにします。

- **ストリーム処理の簡素化:** ClickHouse に取り込まれる前に、リアルタイムでデータの変換、エンリッチメント、ルーティング、フォーマット、埋め込みベクトルの生成を行えます。Flink を基盤としつつ、その複雑さを意識せずに利用できます。

- **フルマネージドかつスケーラブル:** 運用環境対応でメンテナンス不要のパイプラインを提供するため、自前で Kafka、Flink、Debezium、あるいはスキーマレジストリのインフラを管理する必要がありません。プラットフォームは高スループット向けに設計されており、線形にスケールし、数十億件規模のイベントを処理できます。

- **自動スキーマ進化:** Streamkap はソースデータベースのスキーマ変更を自動検出し、それを ClickHouse に伝搬します。新しいカラムの追加やカラム型の変更も、手動による対応なしで処理できます。

- **ClickHouse 向けに最適化:** この連携は ClickHouse の機能を効率的に活用できるように構築されています。デフォルトで ReplacingMergeTree エンジンを使用し、ソースシステムからの更新および削除をシームレスに処理します。

- **堅牢なデータ配信:** プラットフォームは少なくとも 1 回の配信保証 (at-least-once) を提供し、ソースと ClickHouse 間のデータ整合性を確保します。アップサート処理では、主キーに基づいて重複排除を行います。

## はじめに {#started}

このガイドでは、データを ClickHouse にロードするための Streamkap パイプラインのセットアップ方法について全体像を説明します。

### 前提条件 {#prerequisites}

- <a href="https://app.streamkap.com/account/sign-up" target="_blank">Streamkap アカウント</a>。
- ClickHouse クラスターの接続情報: ホスト名、ポート、ユーザー名、パスワード。
- CDC（変更データキャプチャ）が有効になるように構成されたソースデータベース（例: PostgreSQL、SQL Server）。詳細なセットアップガイドは Streamkap のドキュメントに記載されています。

### ステップ 1: Streamkap でソースを設定する {#configure-clickhouse-source}

1. Streamkap アカウントにログインします。
2. サイドバーで **Connectors** に移動し、**Sources** タブを選択します。
3. **+ Add** をクリックし、ソースデータベースの種類（例: SQL Server RDS）を選択します。
4. エンドポイント、ポート、データベース名、ユーザーの認証情報など、接続情報を入力します。
5. コネクタを保存します。

### Step 2: ClickHouse 宛先を構成する {#configure-clickhouse-dest}

1. **Connectors** セクションで、**Destinations** タブを選択します。
2. **+ Add** をクリックし、リストから **ClickHouse** を選択します。
3. ClickHouse サービスの接続情報を入力します：
   - **Hostname:** ClickHouse インスタンスのホスト（例：`abc123.us-west-2.aws.clickhouse.cloud`）
   - **Port:** セキュアな HTTPS ポート（通常は `8443`）
   - **Username and Password:** ClickHouse ユーザーの認証情報
   - **Database:** ClickHouse 内の対象データベース名
4. 宛先を保存します。

### ステップ 3: パイプラインを作成して実行する {#run-pipeline}

1. サイドバーの **Pipelines** を開き、**+ Create** をクリックします。
2. 先ほど設定した Source と Destination を選択します。
3. ストリーミングしたいスキーマとテーブルを選択します。
4. パイプラインに名前を付け、**Save** をクリックします。

作成が完了すると、パイプラインはアクティブになります。Streamkap はまず既存データのスナップショットを取得し、その後、以降に発生する変更をストリーミングし始めます。

### ステップ 4: ClickHouse のデータを確認する {#verify-data-clickhoouse}

ClickHouse クラスターに接続し、ターゲットテーブルにデータが取り込まれているか確認するクエリを実行します。

```sql
SELECT * FROM your_table_name LIMIT 10;
```


## ClickHouse との連携の仕組み {#how-it-works-with-clickhouse}

Streamkap の統合機能は、ClickHouse 上の CDC（変更データキャプチャ）データを効率的に管理できるように設計されています。

### テーブルエンジンとデータ処理 {#table-engine-data-handling}

デフォルトでは、Streamkap はアップサート型のインジェストモードを使用します。ClickHouse にテーブルを作成する際には、ReplacingMergeTree エンジンを使用します。このエンジンは CDC（変更データキャプチャ）イベントの処理に最適です。

- ソーステーブルのプライマリキーは、ReplacingMergeTree テーブル定義における ORDER BY キーとして使用されます。

- ソースでの**更新**は、ClickHouse では新しい行として書き込まれます。バックグラウンドでのマージ処理中に、ReplacingMergeTree がこれらの行を統合し、ORDER BY キーに基づいて最新バージョンのみを保持します。

- **削除**は、ReplacingMergeTree の ```is_deleted``` パラメータに渡されるメタデータフラグによって処理されます。ソースで削除された行はすぐには物理削除されず、削除済みとしてマークされます。
  - 必要に応じて、削除済みレコードを分析目的で ClickHouse 内に保持しておくこともできます

### メタデータカラム {#metadata-columns}

Streamkap は、データの状態を管理するために各テーブルに複数のメタデータカラムを追加します。

| Column Name              | Description                                                               |
|--------------------------|---------------------------------------------------------------------------|
| `_STREAMKAP_SOURCE_TS_MS` | ソースデータベースにおけるイベント発生時刻のタイムスタンプ（ミリ秒単位）。          |
| `_STREAMKAP_TS_MS`        | Streamkap がイベントを処理した時刻のタイムスタンプ（ミリ秒単位）。           |
| `__DELETED`               | 行がソース側で削除されたかどうかを示すブール値フラグ（`true`/`false`）。 |
| `_STREAMKAP_OFFSET`       | 並び順の制御やデバッグに有用な、Streamkap の内部ログにおけるオフセット値。 |

### 最新データのクエリ実行 {#query-latest-data}

ReplacingMergeTree は更新や削除をバックグラウンドで処理するため、単純な SELECT * クエリでは、マージが完了する前の履歴行や削除済みの行が表示される場合があります。最新のデータ状態を取得するには、削除されたレコードを除外し、各行の最新バージョンのみを選択する必要があります。

これは、便利ではあるもののクエリパフォーマンスに影響を及ぼす可能性がある FINAL 修飾子を使って行うことができます。

```sql
-- Using FINAL to get the correct current state
SELECT * FROM your_table_name FINAL WHERE __DELETED = 'false';
SELECT * FROM your_table_name FINAL LIMIT 10;
SELECT * FROM your_table_name FINAL WHERE <filter by keys in ORDER BY clause>;
SELECT count(*) FROM your_table_name FINAL;
```

大規模なテーブルで、特にすべてのカラムを読む必要がなく、一度きりの分析クエリを実行する場合には、各プライマリキーごとに最新のレコードを手動で選択するために `argMax` 関数を使用することで、パフォーマンスを向上できます。

```sql
SELECT key,
       argMax(col1, version) AS col1,
       argMax(col2, version) AS col2
FROM t
WHERE <your predicates>
GROUP BY key;
```

本番利用のユースケースや、エンドユーザーによる同時発生する反復的なクエリがある場合には、下流のアクセスパターンにより適した形でデータをモデリングするために Materialized Views を利用できます。


## 参考資料 {#further-reading}

- <a href="https://streamkap.com/" target="_blank">Streamkap の Web サイト</a>
- <a href="https://docs.streamkap.com/clickhouse" target="_blank">ClickHouse 向け Streamkap ドキュメント</a>
- <a href="https://streamkap.com/blog/streaming-with-change-data-capture-to-clickhouse" target="_blank">ブログ：Change Data Capture を用いた ClickHouse へのストリーミング</a>
- <a href="https://streamkap.com/blog/streaming-with-change-data-capture-to-clickhouse" target="_blank">ClickHouse ドキュメント：ReplacingMergeTree</a>