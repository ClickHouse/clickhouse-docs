---
slug: /migrations/postgresql/dataset
title: PostgreSQLからClickHouseへのデータロード
description: PostgreSQLからClickHouseへの移行のためのデータセット例
keywords: [postgres, postgresql, migrate, migration]
---

> これはPostgreSQLからClickHouseへの移行に関するガイドの**第1部**です。このコンテンツは、ClickHouseのベストプラクティスに従った初期機能システムを展開する手助けを目的とした導入的な内容と考えられます。複雑なトピックを避け、完全に最適化されたスキーマに至るものではなく、ユーザーが生産システムを構築し、自らの学びの基盤を作るための堅実な基礎を提供します。

## データセット {#dataset}

PostgresからClickHouseへの典型的な移行を示すための例として、Stack Overflowデータセットを使用します。このデータセットは、Stack Overflowで2008年から2024年4月までに発生したすべての`post`、`vote`、`user`、`comment`、および`badge`を含んでいます。これに関するPostgreSQLスキーマは以下の通りです：

<br />

<img src={require('../images/postgres-stackoverflow-schema.png').default}
  class="image"
  alt="NEEDS ALT"
  style={{width: '1000px', background: 'none'}} />

<br />

*PostgreSQLでテーブルを作成するためのDDLコマンドは[こちら](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==)で利用可能です。*

このスキーマは、必ずしも最適ではありませんが、主キー、外部キー、パーティション、インデックスなどの一般的なPostgreSQLの機能を利用しています。

これらの概念をそれぞれClickHouseの対応するものに移行します。

このデータセットをPostgreSQLインスタンスに投入して移行手順のテストを行いたいユーザーのために、DDLが含まれた`pg_dump`形式のデータをダウンロード可能で、以下にその後のデータロードコマンドを示します：

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

ClickHouseにとっては小規模ですが、このデータセットはPostgresにとっては substantialです。上記は2024年の最初の3か月をカバーするサブセットを表しています。

> 私たちの例の結果は、PostgresとClickHouseのパフォーマンスの違いを示すために完全なデータセットを使用していますが、以下に記載されたすべてのステップは小さなサブセットでも機能的に同一です。フルデータセットをPostgresにロードしたいユーザーは[こちら](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==)を参照してください。上記のスキーマによって課せられた外部制約のため、PostgreSQLのフルデータセットには参照整合性を満たす行のみが含まれます。このような制約がない[Parquetバージョン](/getting-started/example-datasets/stackoverflow)は、必要に応じてClickHouseに直接ロードすることが容易です。

## データ移行 {#migrating-data}

ClickHouseとPostgres間のデータ移行は、主に2つのワークロードタイプに分類されます：

- **初期バルクロードと定期的な更新** - 初期データセットを移行し、設定された間隔（例えば、日次）で定期的に更新を行います。ここでの更新は、変更があった行を再送信することにより処理されます。変更の特定には比較に使用できるカラム（例：日付）や`XMIN`値が使用されます。削除は、データセットの完全な定期的再ロードによって処理されます。
- **リアルタイムレプリケーションまたはCDC** - 初期データセットを移行する必要があり、このデータセットへの変更は、数秒の遅延のみ許容され、ClickHouseにほぼリアルタイムで反映される必要があります。これは、PostgresのテーブルをClickHouseに同期させるための変更データキャプチャ（CDC）プロセスです。すなわち、Postgresテーブルでの挿入、更新、削除は、ClickHouseの同等のテーブルに適用される必要があります。

### 初期バルクロードと定期的な更新 {#initial-bulk-load-with-periodic-updates}

このワークロードは、変更が定期的に適用できるため、上記のワークロードの中で最もシンプルです。データセットの初期バルクロードは次のように実現できます：

- **テーブル関数** - ClickHouseの[Postgresテーブル関数](/sql-reference/table-functions/postgresql)を使用して、Postgresからデータを`SELECT`し、それをClickHouseテーブルに`INSERT`します。これは、数百GBのデータセットのバルクロードに関連しています。
- **エクスポート** - CSVやSQLスクリプトファイルといった中間形式へのエクスポート。これらのファイルは、`INSERT FROM INFILE`句を通じてクライアントからClickHouseにロードするか、オブジェクトストレージと関連機能（例：s3、gcs）を使用してロードできます。

増分ロードもスケジュールできます。Postgresテーブルにのみ挿入が行われ、一意のIDやタイムスタンプが存在する場合、ユーザーは上記のテーブル関数アプローチを使用して増分をロードできます。つまり、`SELECT`に`WHERE`句を適用できます。このアプローチは、同じカラムを更新することが保証されている場合には、更新をサポートするためにも使用できます。ただし、削除をサポートするためには完全な再ロードが必要であり、テーブルが大きくなるにつれてそれを達成することは困難です。

ここでは、`CreationDate`を使用して初期ロードと増分ロードを示します（行が更新されるとこれも更新されると仮定します）。

```sql
-- 初期ロード
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouseは、`=`、`!=`、`>`、`>=`、`<`、`<=`、およびINのような単純な`WHERE`句をPostgreSQLサーバーにプッシュダウンします。よって、変更セットを特定するために使用されるカラムにインデックスが存在することを確認することで、増分ロードがより効率的になります。

> クエリレプリケーションを使用する際のUPDATE操作を検出する可能な方法は、[`XMIN`システムカラム](https://www.postgresql.org/docs/9.1/ddl-system-columns.html)（トランザクションID）をウォーターマークとして使用することです。このカラムの変更は変更の指標であり、したがって宛先テーブルに適用できます。このアプローチを利用するユーザーは、`XMIN`値がラップアラウンドすることがあり、比較には完全なテーブルスキャンが必要なため、変更追跡がより複雑になることに注意する必要があります。このアプローチの詳細については、「変更データキャプチャ（CDC）」を参照してください。

### リアルタイムレプリケーションまたはCDC {#real-time-replication-or-cdc}

変更データキャプチャ（CDC）は、2つのデータベース間でテーブルを同期させるプロセスです。これが、更新や削除がほぼリアルタイムで処理される場合は、格段に複雑になります。現在、いくつかのソリューションが存在します：
1. **ClickHouseによるPeerDB** - PeerDBは、ユーザーがセルフマネージドまたはSaaSソリューションを通じて実行できるオープンコードのPostgres CDCソリューションを提供しており、PostgresとClickHouseのスケールでのパフォーマンスが良好であることが示されています。このソリューションは、PostgresとClickHouseの間で高性能なデータ転送を実現するための低レベルの最適化に重点を置いています。オンラインおよびオフラインのロードの両方をサポートしています。

:::info
PeerDBは、ClickHouse Cloudでネイティブに利用可能で、私たちの[新しいClickPipeコネクタ](/integrations/clickpipes/postgres)を使用して、超高速のPostgresからClickHouseへのCDCを実現します - 現在パブリックベータ中です。
:::

2. **独自構築** - これは**Debezium + Kafka**を使用して実現できます。Debeziumは、Postgresテーブルのすべての変更をキャプチャし、これをイベントとしてKafkaキューに転送する機能を提供します。これらのイベントは、ClickHouse Kafkaコネクタまたは[ClickHouse CloudのClickPipes](https://clickhouse.com/cloud/clickpipes)によって消費され、ClickHouseに挿入されます。これは変更データキャプチャ（CDC）であり、Debeziumはテーブルの初期コピーを実行するだけでなく、その後のすべての更新、削除、挿入をPostgresから検出し、下流イベントを生成します。これにはPostgres、Debezium、ClickHouseの両方の慎重な設定が必要です。例は[こちら](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2)で見ることができます。

このガイドの例では、初期バルクロードのみを仮定し、データ探索と他のアプローチに使用可能な生産スキーマに向けた簡単な反復を重視しています。

[第2部はこちらをクリック](/migrations/postgresql/designing-schemas)。
