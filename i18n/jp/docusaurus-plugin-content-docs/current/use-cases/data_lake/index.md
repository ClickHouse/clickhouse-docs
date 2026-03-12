---
description: 'Apache Iceberg、Delta Lake、Apache Hudi、Apache Paimon などのオープンなテーブル形式でデータをクエリし、高速化し、分析するために ClickHouse を使用します。'
pagination_prev: null
pagination_next: null
slug: /use-cases/data-lake
title: 'データレイクハウス'
keywords: ['data lake', 'lakehouse', 'iceberg', 'delta lake', 'hudi', 'paimon', 'glue', 'unity', 'rest', 'OneLake', 'BigLake']
doc_type: 'landing-page'
---

ClickHouse は、[Apache Iceberg](/engines/table-engines/integrations/iceberg)、[Delta Lake](/engines/table-engines/integrations/deltalake)、[Apache Hudi](/engines/table-engines/integrations/hudi)、[Apache Paimon](/sql-reference/table-functions/paimon) などのオープンなレイクハウスのオープンなテーブル形式と統合されています。これにより、ユーザーはオブジェクトストレージ全体でこれらの形式ですでに保存されているデータに ClickHouse を接続し、既存のデータレイク基盤と ClickHouse の分析能力を組み合わせることができます。

## ClickHouse とオープンテーブルフォーマットを組み合わせて利用する理由 \{#why-clickhouse-uses-lake-formats\}

### 既存データをそのままクエリする \{#querying-data-in-place\}

ClickHouse は、データを複製することなく、オブジェクトストレージ上のオープンなテーブル形式を直接クエリできます。Iceberg、Delta Lake、Hudi、Paimon を標準として採用している組織は、既存のテーブルを ClickHouse に指定するだけで、その SQL 方言、分析関数、高効率なネイティブ Parquet リーダーをすぐに利用できます。同時に、[clickhouse-local](/operations/utilities/clickhouse-local) や [chDB](/chdb) のようなツールを使うことで、リモートストレージ上の 70 を超えるファイル形式に対して探索的かつアドホックな分析が可能になり、追加のインフラストラクチャを用意することなく、レイクハウスのデータセットを対話的に探索できます。

ユーザーは、[テーブル関数とテーブルエンジン](/use-cases/data-lake/getting-started/querying-directly) を用いて直接読み出すか、[データカタログに接続する](/use-cases/data-lake/getting-started/connecting-catalogs) ことで、これを実現できます。

### ClickHouse を用いたリアルタイム分析ワークロード \{#real-time-with-clickhouse\}

高い同時実行性と低レイテンシのレスポンスが求められるワークロードでは、オープンなテーブル形式のデータを ClickHouse の [MergeTree](/engines/table-engines/mergetree-family/mergetree) エンジンにロードできます。これにより、データレイクをソースとするデータの上にリアルタイム分析レイヤーを構築し、ダッシュボード、運用レポート、その他 MergeTree の列指向ストレージと索引機能の恩恵を受けるレイテンシに敏感なワークロードをサポートできます。

[MergeTree による分析の高速化](/use-cases/data-lake/getting-started/accelerating-analytics)のための入門ガイドも参照してください。

## 機能 \{#capabilities\}

### データを直接読み取る \{#read-data-directly\}

ClickHouse は、オブジェクトストレージ上のオープンなテーブルフォーマットを直接読み取るための[テーブル関数](/sql-reference/table-functions)と[エンジン](/engines/table-engines/integrations)を提供しています。[`iceberg()`](/sql-reference/table-functions/iceberg)、[`deltaLake()`](/sql-reference/table-functions/deltalake)、[`hudi()`](/sql-reference/table-functions/hudi)、[`paimon()`](/sql-reference/table-functions/paimon) などの関数により、事前の設定なしで、SQL ステートメント内からレイクフォーマットのテーブルに対してクエリを実行できます。これらの関数には、S3、Azure Blob Storage、GCS など、一般的なオブジェクトストアのほとんどに対応したバージョンが用意されています。さらに、これらの関数に対応するテーブルエンジンも用意されており、基盤となるレイクフォーマットのオブジェクトストレージを参照するテーブルを ClickHouse 内に CREATE するために使用できます。これにより、クエリの実行がより容易になります。

[直接クエリを実行する](/use-cases/data-lake/getting-started/querying-directly)方法や、[データカタログに接続する](/use-cases/data-lake/getting-started/connecting-catalogs)方法については、入門ガイドを参照してください。

### カタログをデータベースとして公開する \{#expose-catalogs-as-databases\}

[`DataLakeCatalog`](/engines/database-engines/datalakecatalog) データベースエンジンを使用すると、ClickHouse を外部カタログに接続し、そのカタログをデータベースとして公開できます。カタログに登録されているテーブルは ClickHouse 内のテーブルとして認識され、ClickHouse の SQL 構文と分析関数をフルに透過的に利用できます。つまり、カタログで管理されているテーブルに対しても、ネイティブな ClickHouse テーブルと同様にクエリ、結合、集約を実行でき、ClickHouse のクエリ最適化、並列実行、および高い読み取り性能のメリットを享受できます。

サポートされているカタログは次のとおりです:

| Catalog                  | Guide                                                             |
| ------------------------ | ----------------------------------------------------------------- |
| AWS Glue                 | [Glue Catalog ガイド](/use-cases/data-lake/glue-catalog)             |
| BigLake Metastore        | [BigLake Metastore ガイド](/use-cases/data-lake/biglake-catalog)     |
| Databricks Unity Catalog | [Unity Catalog ガイド](/use-cases/data-lake/unity-catalog)           |
| Iceberg REST Catalog     | [REST Catalog ガイド](/use-cases/data-lake/rest-catalog)             |
| Lakekeeper               | [Lakekeeper Catalog ガイド](/use-cases/data-lake/lakekeeper-catalog) |
| Project Nessie           | [Nessie Catalog ガイド](/use-cases/data-lake/nessie-catalog)         |
| Microsoft OneLake        | [OneLake Catalog ガイド](/use-cases/data-lake/onelake-catalog)       |

[カタログへの接続](/use-cases/data-lake/getting-started/connecting-catalogs)に関する入門ガイドを参照してください。

### レイクハウス形式への書き戻し \{#write-back-to-lakehouse-formats\}

ClickHouse はデータをオープンなテーブル形式に書き戻す機能をサポートしており、次のようなシナリオで有用です。

- **リアルタイムから長期保存への移行** - データがリアルタイム分析レイヤーとしての ClickHouse を経由し、結果を Iceberg などのフォーマットへオフロードして、耐久性が高くコスト効率の良い長期保存を行う必要がある場合。
- **Reverse ETL** - ユーザーが ClickHouse 内で materialized views やスケジュール実行されるクエリを用いて変換処理を行い、その結果をデータエコシステム内の他ツールで利用できるように、オープンなテーブル形式へ永続化したい場合。

データレイクへの書き込みについては、[writing to data lakes](/use-cases/data-lake/getting-started/writing-data) の入門ガイドを参照してください。

## 次のステップ \{#next-steps\}

試してみる準備はできましたか？[Getting Started ガイド](/use-cases/data-lake/getting-started)では、オープンなテーブルフォーマットへの直接クエリ、カタログへの接続、高速な分析のための MergeTree へのデータロード、そして結果の書き戻しまでを、ひとつのエンドツーエンドなワークフローとして順を追って説明します。