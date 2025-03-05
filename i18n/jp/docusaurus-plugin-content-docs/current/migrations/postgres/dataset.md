---
slug: /migrations/postgresql/dataset
title: PostgreSQL から ClickHouse へのデータ読み込み
description: PostgreSQL から ClickHouse へ移行するためのデータセットの例
keywords: [postgres, postgresql, migrate, migration]
---

import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';

> これは **第1部** PostgreSQL から ClickHouse への移行に関するガイドです。この内容は入門的なものであり、ユーザーが ClickHouse のベストプラクティスに従った初期機能的システムを展開する手助けを目的としています。複雑なトピックは避けており、完全に最適化されたスキーマにはならないため、ユーザーが生産システムを構築し学びの基盤とするためのしっかりとした基盤を提供します。

## データセット {#dataset}

Postgres から ClickHouse への一般的な移行を示すためのデータセットの例として、Stack Overflow データセットを使用します。このデータセットには、2008 年から 2024 年 4 月までの Stack Overflow で発生したすべての `post`、`vote`、`user`、`comment`、および `badge` が含まれています。このデータの PostgreSQL スキーマは以下の通りです：

<br />

<img src={postgres_stackoverflow_schema} class="image" alt="PostgreSQL Stack Overflow スキーマ" style={{width: '1000px', background: 'none'}} />

<br />

*PostgreSQL でテーブルを作成するための DDL コマンドは [こちら](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==) にあります。*

このスキーマは必ずしも最適とは言えませんが、主キー、外部キー、パーティショニング、およびインデックスなど、いくつかの一般的な PostgreSQL 機能を利用しています。

これらの概念をそれぞれ ClickHouse の同等物に移行します。

このデータセットを PostgreSQL インスタンスに投入して移行ステップをテストしたいユーザーのために、データを `pg_dump` 形式でダウンロード可能にし、DDL 及びその後のデータロードコマンドを以下に示します：

```bash

# users
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/users.sql.gz
gzip -d users.sql.gz
psql < users.sql


# posts
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posts.sql.gz
gzip -d posts.sql.gz
psql < posts.sql


# posthistory
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posthistory.sql.gz
gzip -d posthistory.sql.gz
psql < posthistory.sql


# comments
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/comments.sql.gz
gzip -d comments.sql.gz
psql < comments.sql


# votes
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/votes.sql.gz
gzip -d votes.sql.gz
psql < votes.sql


# badges
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/badges.sql.gz
gzip -d badges.sql.gz
psql < badges.sql


# postlinks
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz
gzip -d postlinks.sql.gz
psql < postlinks.sql
```

ClickHouse にとっては小さいですが、このデータセットは Postgres にとってはかなりの量です。上記は 2024 年の最初の三ヶ月をカバーする部分集合を表しています。

> 当社の例は、Postgres と Clickhouse のパフォーマンスの違いを示すために完全なデータセットを使用していますが、以下に文書化されたすべてのステップは小さな部分集合でも機能的には同等です。Postgres に完全なデータセットをロードしたいユーザーは [こちら](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==) を参照してください。上記のスキーマによって課せられる外部制約により、PostgreSQL の完全なデータセットには参照整合性を満たす行のみが含まれています。制約がない [Parquet バージョン](/getting-started/example-datasets/stackoverflow) は、必要に応じて ClickHouse に直接簡単にロードできます。

## データの移行 {#migrating-data}

ClickHouse と Postgres の間でデータを移行する際の主な作業負荷タイプは 2 つに分かれます：

- **初期バルクロードと定期的な更新** - 初期データセットを移行し、設定された間隔（例：毎日）で定期的な更新を行う必要があります。ここでの更新は、変更された行を再送信することで行われ、比較に使用できるカラム（例：日付）または `XMIN` 値によって特定されます。削除はデータセットの完全な定期的再ロードによって処理されます。
- **リアルタイムレプリケーションまたは CDC** - 初期データセットを移行する必要があります。このデータセットに対する変更は、数秒の遅延で ClickHouse に近リアルタイムで反映される必要があります。これは実際には変更データキャプチャ（CDC）プロセスであり、Postgres のテーブルは ClickHouse と同期される必要があります。すなわち、Postgres テーブルの挿入、更新、および削除は、ClickHouse の同等のテーブルに適用される必要があります。

### 初期バルクロードと定期的な更新 {#initial-bulk-load-with-periodic-updates}

この作業負荷は、変更を定期的に適用できるため、上記の作業負荷の中でより簡単なものを表しています。データセットの初期バルクロードは次の方法で達成できます：

- **テーブル関数** - ClickHouse の [Postgres テーブル関数](/sql-reference/table-functions/postgresql) を使用して、Postgres からデータを `SELECT` し、それを ClickHouse テーブルに `INSERT` します。関連するのは数百 GB のデータセットまでのバルクロードです。
- **エクスポート** - CSV や SQL スクリプトファイルなどの中間形式にエクスポートします。これらのファイルは、クライアントを介して `INSERT FROM INFILE` 句を使用して ClickHouse にロードするか、オブジェクトストレージとその関連相関関数（例：s3、gcs）を使用してロードできます。

増分ロードは、その後スケジュール可能です。Postgres テーブルに挿入のみが行われ、増分 ID またはタイムスタンプが存在する場合、ユーザーは上記のテーブル関数アプローチを使用して増分をロードできます。この場合、`SELECT` に `WHERE` 句を適用できます。このアプローチは、列が同じものであることが保証された場合、更新をサポートするためにも使用できますが、削除をサポートするには完全な再ロードが必要であり、テーブルが成長するにつれてこれを達成するのは難しい場合があります。

初期ロードと増分ロードを `CreationDate` を使用して示します（行が更新された場合、これが更新されると仮定します）。

```sql
-- 初期ロード
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password>')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password>') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouse は、`=`、`!=`、`>`、`>=`、`<`、`<=`、および IN といった単純な `WHERE` 句を PostgreSQL サーバーにプッシュダウンします。したがって、変更セットを特定するために使用されるカラムにインデックスが存在することを確認することで、増分ロードはより効率的になります。

> クエリレプリケーションを使用する際に UPDATE 操作を検出する可能性のある方法として、[`XMIN` システムカラム](https://www.postgresql.org/docs/9.1/ddl-system-columns.html)（トランザクション ID）をウォーターマークとして使用することがあります。このカラムの変更は変更の指標であるため、宛先テーブルに適用できます。このアプローチを採用するユーザーは、`XMIN` 値がラップする可能性があること、比較には完全なテーブルスキャンが必要であり、変更の追跡がより複雑になることを理解しておくべきです。このアプローチの詳細については、「変更データキャプチャ（CDC）」を参照してください。

### リアルタイムレプリケーションまたは CDC {#real-time-replication-or-cdc}

変更データキャプチャ（CDC）は、2 つのデータベース間でテーブルが同期されるプロセスです。これは、更新と削除を近リアルタイムで処理する場合、著しく複雑になります。現在いくつかのソリューションが存在します：
1. **ClickHouse による PeerDB** - PeerDB は、ユーザーがセルフマネージドまたは SaaS ソリューションを通じて実行できるオープンコードの専門的な Postgres CDC ソリューションを提供しており、Postgres と ClickHouse のスケールで良好な性能を示しています。このソリューションは、高性能でのデータ転送と Postgres と ClickHouse 間の信頼性保証を実現するための低レベルの最適化に焦点を当てています。オンラインおよびオフラインのロードの両方をサポートします。

:::info
PeerDB は、ClickHouse Cloud にネイティブに利用可能です - Blazing-fast Postgres から ClickHouse への CDC を私たちの [新しい ClickPipe コネクタ](/integrations/clickpipes/postgres) で - 現在パブリックベータ中です。
:::

2. **自分自身で構築** - これは **Debezium + Kafka** を使用して実現できます - Debezium は、Postgres テーブルのすべての変更をキャプチャし、これらをイベントとして Kafka キューに転送する能力を提供します。これらのイベントは、ClickHouse Kafka コネクタまたは [ClickHouse Cloud の ClickPipes](https://clickhouse.com/cloud/clickpipes) で消費され、ClickHouse に挿入されます。これは変更データキャプチャ（CDC）を表しており、Debezium は初期のテーブルコピーを実行するだけでなく、その後のすべての更新、削除、挿入を Postgres で検出し、下流のイベントを生成します。これには、Postgres、Debezium、および ClickHouse の両方の慎重な構成が必要です。例については [こちら](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2) を参照してください。

このガイドの例では、初期バルクロードのみを仮定し、データの探索と他のアプローチで使用可能な生産スキーマへの容易な反復に焦点を当てています。

[こちらをクリックして第2部へ](/migrations/postgresql/designing-schemas).
