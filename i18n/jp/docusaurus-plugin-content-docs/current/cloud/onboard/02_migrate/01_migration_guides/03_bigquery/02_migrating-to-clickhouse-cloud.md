---
title: 'BigQueryからClickHouse Cloudへの移行'
slug: /migrations/bigquery/migrating-to-clickhouse-cloud
description: 'BigQueryからClickHouse Cloudへデータを移行する方法'
keywords: ['BigQuery']
show_related_blogs: true
sidebar_label: '移行ガイド'
doc_type: 'guide'
---

import bigquery_2 from '@site/static/images/migrations/bigquery-2.png';
import bigquery_3 from '@site/static/images/migrations/bigquery-3.png';
import bigquery_4 from '@site/static/images/migrations/bigquery-4.png';
import bigquery_5 from '@site/static/images/migrations/bigquery-5.png';
import bigquery_6 from '@site/static/images/migrations/bigquery-6.png';
import bigquery_7 from '@site/static/images/migrations/bigquery-7.png';
import bigquery_8 from '@site/static/images/migrations/bigquery-8.png';
import bigquery_9 from '@site/static/images/migrations/bigquery-9.png';
import bigquery_10 from '@site/static/images/migrations/bigquery-10.png';
import bigquery_11 from '@site/static/images/migrations/bigquery-11.png';
import bigquery_12 from '@site/static/images/migrations/bigquery-12.png';
import Image from '@theme/IdealImage';

## なぜBigQueryよりClickHouse Cloudを使うべきか？ {#why-use-clickhouse-cloud-over-bigquery}

要約：現代のデータ分析において、ClickHouseはBigQueryよりも高速、低コスト、かつ強力だからです：

<Image img={bigquery_2} size="md" alt="ClickHouse vs BigQuery"/>

## BigQueryからClickHouse Cloudへのデータロード {#loading-data-from-bigquery-to-clickhouse-cloud}

### データセット {#dataset}

BigQueryからClickHouse Cloudへの典型的な移行を示すサンプルデータセットとして、[こちら](/getting-started/example-datasets/stackoverflow)で説明されているStack Overflowデータセットを使用します。このデータセットには、2008年から2024年4月までにStack Overflowで発生したすべての`post`、`vote`、`user`、`comment`、`badge`が含まれています。このデータのBigQueryスキーマを以下に示します：

<Image img={bigquery_3} size="lg" alt="スキーマ"/>

移行手順をテストするためにこのデータセットをBigQueryインスタンスに投入したいユーザーのために、GCSバケットにParquet形式でこれらのテーブルのデータを提供しており、BigQueryでテーブルを作成およびロードするためのDDLコマンドは[こちら](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==)で入手できます。

### データの移行 {#migrating-data}

BigQueryとClickHouse Cloud間のデータ移行は、主に2つのワークロードタイプに分類されます：

- **定期的な更新を伴う初期一括ロード** - 初期データセットを移行し、設定された間隔（例：毎日）で定期的に更新します。ここでの更新は、比較に使用できるカラム（例：日付）によって識別された変更された行を再送信することで処理されます。削除は、データセットの完全な定期的な再ロードで処理されます。
- **リアルタイムレプリケーションまたはCDC** - 初期データセットを移行する必要があります。このデータセットへの変更は、数秒の遅延のみが許容される、ほぼリアルタイムでClickHouseに反映される必要があります。これは実質的に[Change Data Capture（CDC）プロセス](https://en.wikipedia.org/wiki/Change_data_capture)であり、BigQueryのテーブルはClickHouseと同期される必要があります。つまり、BigQueryテーブルでの挿入、更新、削除がClickHouseの同等のテーブルに適用される必要があります。

#### Google Cloud Storage（GCS）経由の一括ロード {#bulk-loading-via-google-cloud-storage-gcs}

BigQueryはGoogleのオブジェクトストア（GCS）へのデータエクスポートをサポートしています。サンプルデータセットの場合：

1. 7つのテーブルをGCSにエクスポートします。そのためのコマンドは[こちら](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==)で入手できます。

2. データをClickHouse Cloudにインポートします。これには[gcsテーブル関数](/sql-reference/table-functions/gcs)を使用できます。DDLとインポートクエリは[こちら](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==)で入手できます。ClickHouse Cloudインスタンスは複数のコンピュートノードで構成されているため、`gcs`テーブル関数の代わりに[s3Clusterテーブル関数](/sql-reference/table-functions/s3Cluster)を使用しています。この関数はGCSバケットでも動作し、[ClickHouse Cloudサービスのすべてのノードを活用](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers)してデータを並列でロードします。

<Image img={bigquery_4} size="md" alt="一括ロード"/>

このアプローチにはいくつかの利点があります：

- BigQueryのエクスポート機能は、データのサブセットをエクスポートするためのフィルターをサポートしています。
- BigQueryは[Parquet、Avro、JSON、CSV](https://cloud.google.com/bigquery/docs/exporting-data)形式と複数の[圧縮タイプ](https://cloud.google.com/bigquery/docs/exporting-data)へのエクスポートをサポートしており、すべてClickHouseでサポートされています。
- GCSは[オブジェクトライフサイクル管理](https://cloud.google.com/storage/docs/lifecycle)をサポートしており、エクスポートされてClickHouseにインポートされたデータを指定された期間後に削除できます。
- [Googleは1日あたり最大50TBのGCSへのエクスポートを無料で許可しています](https://cloud.google.com/bigquery/quotas#export_jobs)。ユーザーはGCSストレージのみを支払います。
- エクスポートは自動的に複数のファイルを生成し、各ファイルを最大1GBのテーブルデータに制限します。これはClickHouseにとって有益であり、インポートを並列化できます。

以下の例を試す前に、エクスポートおよびインポートのパフォーマンスを最大化するために、[エクスポートに必要な権限](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions)と[ロケーションの推奨事項](https://cloud.google.com/bigquery/docs/exporting-data#data-locations)を確認することをお勧めします。

### スケジュールクエリ経由のリアルタイムレプリケーションまたはCDC {#real-time-replication-or-cdc-via-scheduled-queries}

Change Data Capture（CDC）は、2つのデータベース間でテーブルを同期させるプロセスです。更新と削除をほぼリアルタイムで処理する場合、これは大幅に複雑になります。1つのアプローチは、BigQueryの[スケジュールクエリ機能](https://cloud.google.com/bigquery/docs/scheduling-queries)を使用して定期的なエクスポートをスケジュールすることです。ClickHouseへのデータ挿入に多少の遅延を許容できる場合、このアプローチは実装と保守が簡単です。例は[このブログ記事](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries)に記載されています。

## スキーマの設計 {#designing-schemas}

Stack Overflowデータセットには、複数の関連テーブルが含まれています。最初にプライマリテーブルの移行に集中することをお勧めします。これは必ずしも最大のテーブルではなく、最も多くの分析クエリを受けると予想されるテーブルです。これにより、主要なClickHouseの概念に慣れることができます。このテーブルは、追加のテーブルが追加されてClickHouseの機能を完全に活用し、最適なパフォーマンスを得るために、再モデリングが必要になる場合があります。このモデリングプロセスについては、[データモデリングドキュメント](/data-modeling/schema-design#next-data-modeling-techniques)で説明しています。

この原則に従い、メインの`posts`テーブルに焦点を当てます。このテーブルのBigQueryスキーマを以下に示します：

```sql
CREATE TABLE stackoverflow.posts (
    id INTEGER,
    posttypeid INTEGER,
    acceptedanswerid STRING,
    creationdate TIMESTAMP,
    score INTEGER,
    viewcount INTEGER,
    body STRING,
    owneruserid INTEGER,
    ownerdisplayname STRING,
    lasteditoruserid STRING,
    lasteditordisplayname STRING,
    lasteditdate TIMESTAMP,
    lastactivitydate TIMESTAMP,
    title STRING,
    tags STRING,
    answercount INTEGER,
    commentcount INTEGER,
    favoritecount INTEGER,
    conentlicense STRING,
    parentid STRING,
    communityowneddate TIMESTAMP,
    closeddate TIMESTAMP
);
```

### 型の最適化 {#optimizing-types}

[こちらで説明されている](/data-modeling/schema-design)プロセスを適用すると、以下のスキーマになります：

```sql
CREATE TABLE stackoverflow.posts
(
   `Id` Int32,
   `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
   `AcceptedAnswerId` UInt32,
   `CreationDate` DateTime,
   `Score` Int32,
   `ViewCount` UInt32,
   `Body` String,
   `OwnerUserId` Int32,
   `OwnerDisplayName` String,
   `LastEditorUserId` Int32,
   `LastEditorDisplayName` String,
   `LastEditDate` DateTime,
   `LastActivityDate` DateTime,
   `Title` String,
   `Tags` String,
   `AnswerCount` UInt16,
   `CommentCount` UInt8,
   `FavoriteCount` UInt8,
   `ContentLicense`LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT 'Optimized types'
```

シンプルな[`INSERT INTO SELECT`](/sql-reference/statements/insert-into)を使用して、[`gcs`テーブル関数](/sql-reference/table-functions/gcs)を使ってGCSからエクスポートされたデータを読み取り、このテーブルに投入できます。ClickHouse Cloudでは、GCS互換の[`s3Cluster`テーブル関数](/sql-reference/table-functions/s3Cluster)を使用して、複数のノードでロードを並列化することもできます：

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

新しいスキーマではnullを保持しません。上記のINSERTは、これらを暗黙的にそれぞれの型のデフォルト値に変換します - 整数の場合は0、文字列の場合は空の値。ClickHouseは、数値をターゲットの精度に自動的に変換します。

## ClickHouseのプライマリキーの違いは？ {#how-are-clickhouse-primary-keys-different}

[こちら](/migrations/bigquery)で説明されているように、BigQueryと同様に、ClickHouseはテーブルのプライマリキーカラム値の一意性を強制しません。

BigQueryのクラスタリングと同様に、ClickHouseテーブルのデータはプライマリキーカラムでソートされてディスクに保存されます。このソート順序は、クエリオプティマイザによって、再ソートの防止、結合のメモリ使用量の最小化、およびLIMIT句のショートサーキットの有効化に利用されます。
BigQueryとは対照的に、ClickHouseはプライマリキーカラム値に基づいて自動的に[（疎な）プライマリインデックス](/guides/best-practices/sparse-primary-indexes)を作成します。このインデックスは、プライマリキーカラムにフィルターを含むすべてのクエリを高速化するために使用されます。具体的には：

- ClickHouseが使用されるスケールでは、メモリとディスクの効率が最も重要です。データはパーツと呼ばれるチャンクでClickHouseテーブルに書き込まれ、バックグラウンドでパーツをマージするルールが適用されます。ClickHouseでは、各パーツには独自のプライマリインデックスがあります。パーツがマージされると、マージされたパーツのプライマリインデックスもマージされます。これらのインデックスは各行に対して構築されるわけではないことに注意してください。代わりに、パーツのプライマリインデックスには、行のグループごとに1つのインデックスエントリがあります - このテクニックは疎インデックスと呼ばれます。
- ClickHouseは指定されたキーでソートされた行をディスクに保存するため、疎インデックスが可能です。（B-Treeベースのインデックスのように）単一の行を直接見つける代わりに、疎プライマリインデックスは、（インデックスエントリに対するバイナリサーチを介して）クエリに一致する可能性のある行のグループを迅速に特定できます。見つかった潜在的に一致する行のグループは、その後、ClickHouseエンジンに並列でストリームされ、一致を見つけます。このインデックス設計により、プライマリインデックスは小さく（メインメモリに完全に収まる）なり、それでもクエリ実行時間を大幅に短縮できます。特に、データ分析のユースケースで典型的な範囲クエリに対して効果的です。詳細については、[この詳細ガイド](/guides/best-practices/sparse-primary-indexes)をお勧めします。

<Image img={bigquery_5} size="md" alt="ClickHouseプライマリキー"/>

ClickHouseで選択されたプライマリキーは、インデックスだけでなく、ディスクにデータが書き込まれる順序も決定します。このため、圧縮レベルに劇的な影響を与える可能性があり、それがクエリパフォーマンスに影響を与える可能性があります。ほとんどのカラムの値が連続した順序で書き込まれるようにするオーダリングキーにより、選択した圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮できます。

> テーブル内のすべてのカラムは、指定されたオーダリングキーの値に基づいてソートされます。キー自体に含まれているかどうかに関係なくです。例えば、`CreationDate`がキーとして使用される場合、他のすべてのカラムの値の順序は、`CreationDate`カラムの値の順序に対応します。複数のオーダリングキーを指定できます - これは`SELECT`クエリの`ORDER BY`句と同じセマンティクスでソートします。

### オーダリングキーの選択 {#choosing-an-ordering-key}

オーダリングキーの選択に関する考慮事項と手順については、postsテーブルを例として使用した[こちら](/data-modeling/schema-design#choosing-an-ordering-key)を参照してください。

## データモデリングテクニック {#data-modeling-techniques}

BigQueryから移行するユーザーには、[ClickHouseでのデータモデリングガイド](/data-modeling/schema-design)を読むことをお勧めします。このガイドでは、同じStack Overflowデータセットを使用し、ClickHouseの機能を使用した複数のアプローチを探ります。

### パーティション {#partitions}

BigQueryから来た場合、テーブルパーティショニングの概念に馴染みがあるでしょう。これは、テーブルをパーティションと呼ばれるより小さく管理しやすいピースに分割することで、大規模なデータベースのパフォーマンスと管理性を向上させます。このパーティショニングは、指定されたカラム（例：日付）の範囲を使用するか、定義されたリストを使用するか、キーのハッシュを使用して実現できます。これにより、管理者は日付範囲や地理的な場所などの特定の基準に基づいてデータを整理できます。

パーティショニングは、パーティションプルーニングによるより高速なデータアクセスとより効率的なインデックスにより、クエリパフォーマンスを向上させるのに役立ちます。また、テーブル全体ではなく個々のパーティションに対して操作を可能にすることで、バックアップやデータパージなどのメンテナンスタスクにも役立ちます。さらに、パーティショニングは、複数のパーティションに負荷を分散することで、BigQueryデータベースのスケーラビリティを大幅に向上させることができます。

ClickHouseでは、テーブルが最初に定義されるときに[`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key)句を介してパーティショニングが指定されます。この句には、任意のカラムに対するSQL式を含めることができ、その結果によって行がどのパーティションに送られるかが決定されます。

<Image img={bigquery_6} size="md" alt="パーティション"/>

データパーツは、ディスク上の各パーティションに論理的に関連付けられ、個別にクエリできます。以下の例では、式[`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toYear)を使用してpostsテーブルを年でパーティションします。行がClickHouseに挿入されると、この式が各行に対して評価され、行はそのパーティションに属する新しいデータパーツの形で結果のパーティションにルーティングされます。

```sql
CREATE TABLE posts
(
        `Id` Int32 CODEC(Delta(4), ZSTD(1)),
        `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
        `AcceptedAnswerId` UInt32,
        `CreationDate` DateTime64(3, 'UTC'),
...
        `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate)
PARTITION BY toYear(CreationDate)
```

#### アプリケーション {#applications}

ClickHouseのパーティショニングはBigQueryと同様のアプリケーションがありますが、いくつかの微妙な違いがあります。具体的には：

- **データ管理** - ClickHouseでは、パーティショニングは主にデータ管理機能として考えるべきであり、クエリ最適化テクニックではありません。キーに基づいてデータを論理的に分離することで、各パーティションを個別に操作できます（例：削除）。これにより、パーティション、つまりサブセットを、時間に基づいて効率的に[ストレージティア](/integrations/s3#storage-tiers)間で移動したり、[データの有効期限/クラスターからの効率的な削除](/sql-reference/statements/alter/partition)を行ったりできます。以下の例では、2008年の投稿を削除します：

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'posts'

┌─partition─┐
│ 2008      │
│ 2009      │
│ 2010      │
│ 2011      │
│ 2012      │
│ 2013      │
│ 2014      │
│ 2015      │
│ 2016      │
│ 2017      │
│ 2018      │
│ 2019      │
│ 2020      │
│ 2021      │
│ 2022      │
│ 2023      │
│ 2024      │
└───────────┘

17 rows in set. Elapsed: 0.002 sec.

ALTER TABLE posts
(DROP PARTITION '2008')

Ok.

0 rows in set. Elapsed: 0.103 sec.
```

- **クエリ最適化** - パーティションはクエリパフォーマンスを支援できますが、これはアクセスパターンに大きく依存します。クエリが少数のパーティション（理想的には1つ）のみをターゲットにする場合、パフォーマンスが向上する可能性があります。これは通常、パーティショニングキーがプライマリキーになく、それでフィルタリングしている場合にのみ有用です。ただし、多くのパーティションをカバーする必要があるクエリは、パーティショニングが使用されていない場合よりもパフォーマンスが低下する可能性があります（パーティショニングの結果としてより多くのパーツが存在する可能性があるため）。パーティショニングキーがすでにプライマリキーの早い位置にエントリされている場合、単一パーティションをターゲットにする利点はさらに小さくなるか、存在しなくなります。パーティショニングは、各パーティションの値が一意である場合、[`GROUP BY`クエリの最適化](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)にも使用できます。ただし、一般的には、プライマリキーが最適化されていることを確認し、アクセスパターンが特定の予測可能なサブセットにアクセスする例外的なケースでのみ、クエリ最適化テクニックとしてパーティショニングを検討してください。例えば、日でパーティショニングし、ほとんどのクエリが直近の日にある場合などです。

#### 推奨事項 {#recommendations}

パーティショニングはデータ管理テクニックとして考えてください。時系列データを操作する際にクラスターからデータを期限切れにする必要がある場合に理想的です。例えば、最も古いパーティションを[単純に削除](/sql-reference/statements/alter/partition#drop-partitionpart)できます。

重要：パーティショニングキー式が高カーディナリティセットを生成しないようにしてください。つまり、100を超えるパーティションの作成は避けてください。例えば、クライアント識別子や名前などの高カーディナリティカラムでデータをパーティションしないでください。代わりに、クライアント識別子または名前を`ORDER BY`式の最初のカラムにしてください。

> 内部的に、ClickHouseは挿入されたデータに対して[パーツを作成](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)します。より多くのデータが挿入されると、パーツの数が増加します。（読み取るファイルが増えるため）クエリパフォーマンスを低下させる過度に多くのパーツを防ぐために、パーツはバックグラウンドの非同期プロセスでマージされます。パーツの数が[事前に設定された制限](/operations/settings/merge-tree-settings#parts_to_throw_insert)を超えると、ClickHouseは["too many parts"エラー](/knowledgebase/exception-too-many-parts)として挿入時に例外をスローします。これは通常の操作では発生せず、ClickHouseが誤って設定されているか、誤って使用されている場合（例：多くの小さな挿入）にのみ発生します。パーツはパーティションごとに個別に作成されるため、パーティションの数を増やすとパーツの数が増加します。つまり、パーティションの数の倍数になります。したがって、高カーディナリティのパーティショニングキーはこのエラーを引き起こす可能性があり、避けるべきです。

## マテリアライズドビュー vs プロジェクション {#materialized-views-vs-projections}

ClickHouseのプロジェクションの概念により、テーブルに複数の`ORDER BY`句を指定できます。

[ClickHouseデータモデリング](/data-modeling/schema-design)では、マテリアライズドビューが
ClickHouseで集計の事前計算、行の変換、および異なるアクセスパターン向けのクエリの最適化にどのように使用できるかを探ります。後者については、マテリアライズドビューが挿入を受け取る元のテーブルとは異なるオーダリングキーを持つターゲットテーブルに行を送信する[例を提供しました](/materialized-view/incremental-materialized-view#lookup-table)。

例えば、以下のクエリを考えてみましょう：

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
   │ 0.18181818181818182 │
   └─────────────────────┘
--highlight-next-line
1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

このクエリは、`UserId`がオーダリングキーではないため、全9000万行をスキャンする必要があります（高速ではありますが）。以前は、`PostId`のルックアップとして機能するマテリアライズドビューを使用してこれを解決しました。同じ問題はプロジェクションでも解決できます。
以下のコマンドは、`ORDER BY user_id`を持つプロジェクションを追加します。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

最初にプロジェクションを作成し、次にそれをマテリアライズする必要があることに注意してください。
後者のコマンドにより、データが2つの異なる順序でディスクに2回保存されます。プロジェクションは、以下に示すようにデータ作成時に定義することもでき、データが挿入されると自動的に維持されます。

```sql
CREATE TABLE comments
(
    `Id` UInt32,
    `PostId` UInt32,
    `Score` UInt16,
    `Text` String,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `UserDisplayName` LowCardinality(String),
    --highlight-begin
    PROJECTION comments_user_id
    (
    SELECT *
    ORDER BY UserId
    )
    --highlight-end
)
ENGINE = MergeTree
ORDER BY PostId
```

プロジェクションが`ALTER`コマンドで作成された場合、`MATERIALIZE PROJECTION`コマンドが発行されると作成は非同期になります。以下のクエリでこの操作の進行状況を確認でき、`is_done=1`を待ちます。

```sql
SELECT
    parts_to_do,
    is_done,
    latest_fail_reason
FROM system.mutations
WHERE (`table` = 'comments') AND (command LIKE '%MATERIALIZE%')

   ┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
1. │           1 │       0 │                    │
   └─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

上記のクエリを繰り返すと、追加のストレージを犠牲にしてパフォーマンスが大幅に向上していることがわかります。

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘
--highlight-next-line
1 row in set. Elapsed: 0.008 sec. Processed 16.36 thousand rows, 98.17 KB (2.15 million rows/s., 12.92 MB/s.)
Peak memory usage: 4.06 MiB.
```

[`EXPLAIN`コマンド](/sql-reference/statements/explain)を使用して、このクエリにプロジェクションが使用されたことも確認できます：

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

    ┌─explain─────────────────────────────────────────────┐
 1. │ Expression ((Projection + Before ORDER BY))         │
 2. │   Aggregating                                       │
 3. │   Filter                                            │
 4. │           ReadFromMergeTree (comments_user_id)      │
 5. │           Indexes:                                  │
 6. │           PrimaryKey                                │
 7. │           Keys:                                     │
 8. │           UserId                                    │
 9. │           Condition: (UserId in [8592047, 8592047]) │
10. │           Parts: 2/2                                │
11. │           Granules: 2/11360                         │
    └─────────────────────────────────────────────────────┘

11 rows in set. Elapsed: 0.004 sec.
```

### プロジェクションを使用するタイミング {#when-to-use-projections}

プロジェクションは、データが挿入されると自動的に維持されるため、新しいユーザーにとって魅力的な機能です。さらに、クエリは単一のテーブルに送信するだけでよく、可能な場合はプロジェクションが活用されて応答時間が短縮されます。

<Image img={bigquery_7} size="md" alt="プロジェクション"/>

これは、ユーザーが適切に最適化されたターゲットテーブルを選択するか、フィルターに応じてクエリを書き換える必要があるマテリアライズドビューとは対照的です。
これにより、ユーザーアプリケーションへの重点が高まり、クライアント側の複雑さが増します。

これらの利点にもかかわらず、プロジェクションには認識しておくべきいくつかの固有の制限があり、したがって控えめにデプロイする必要があります。詳細については、["マテリアライズドビュー vs プロジェクション"](/managing-data/materialized-views-versus-projections)を参照してください。

プロジェクションの使用を推奨する場合：

- データの完全な並べ替えが必要な場合。プロジェクションの式は理論的には`GROUP BY`を使用できますが、マテリアライズドビューは集計の維持により効果的です。クエリオプティマイザも、単純な並べ替え（つまり、`SELECT * ORDER BY x`）を使用するプロジェクションを活用する可能性が高くなります。この式でカラムのサブセットを選択して、ストレージフットプリントを削減できます。
- ユーザーがストレージフットプリントの増加とデータを2回書き込むオーバーヘッドに慣れている場合。挿入速度への影響をテストし、[ストレージオーバーヘッドを評価](/data-compression/compression-in-clickhouse)してください。

## BigQueryクエリのClickHouseでの書き換え {#rewriting-bigquery-queries-in-clickhouse}

以下は、BigQueryとClickHouseを比較するクエリの例を示しています。このリストは、ClickHouseの機能を活用してクエリを大幅に簡素化する方法を示すことを目的としています。ここでの例は、完全なStack Overflowデータセット（2024年4月まで）を使用しています。

**最も多くのビューを獲得したユーザー（質問が10件を超えるもの）：**

_BigQuery_

<Image img={bigquery_8} size="sm" alt="BigQueryクエリの書き換え" border/>

_ClickHouse_

```sql
SELECT
    OwnerDisplayName,
    sum(ViewCount) AS total_views
FROM stackoverflow.posts
WHERE (PostTypeId = 'Question') AND (OwnerDisplayName != '')
GROUP BY OwnerDisplayName
HAVING count() > 10
ORDER BY total_views DESC
LIMIT 5

   ┌─OwnerDisplayName─┬─total_views─┐
1. │ Joan Venge       │    25520387 │
2. │ Ray Vega         │    21576470 │
3. │ anon             │    19814224 │
4. │ Tim              │    19028260 │
5. │ John             │    17638812 │
   └──────────────────┴─────────────┘

5 rows in set. Elapsed: 0.076 sec. Processed 24.35 million rows, 140.21 MB (320.82 million rows/s., 1.85 GB/s.)
Peak memory usage: 323.37 MiB.
```

**最も多くのビューを獲得したタグ：**

_BigQuery_

<br />

<Image img={bigquery_9} size="sm" alt="BigQuery 1" border/>

_ClickHouse_

```sql
-- ClickHouse
SELECT
    arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS tags,
    sum(ViewCount) AS views
FROM stackoverflow.posts
GROUP BY tags
ORDER BY views DESC
LIMIT 5

   ┌─tags───────┬──────views─┐
1. │ javascript │ 8190916894 │
2. │ python     │ 8175132834 │
3. │ java       │ 7258379211 │
4. │ c#         │ 5476932513 │
5. │ android    │ 4258320338 │
   └────────────┴────────────┘

5 rows in set. Elapsed: 0.318 sec. Processed 59.82 million rows, 1.45 GB (188.01 million rows/s., 4.54 GB/s.)
Peak memory usage: 567.41 MiB.
```

## 集計関数 {#aggregate-functions}

可能な限り、ClickHouseの集計関数を活用してください。以下では、各年で最も閲覧された質問を計算するための[`argMax`関数](/sql-reference/aggregate-functions/reference/argmax)の使用を示します。

_BigQuery_

<Image img={bigquery_10} border size="sm" alt="集計関数1"/>

<Image img={bigquery_11} border size="sm" alt="集計関数2"/>

_ClickHouse_

```sql
-- ClickHouse
SELECT
    toYear(CreationDate) AS Year,
    argMax(Title, ViewCount) AS MostViewedQuestionTitle,
    max(ViewCount) AS MaxViewCount
FROM stackoverflow.posts
WHERE PostTypeId = 'Question'
GROUP BY Year
ORDER BY Year ASC
FORMAT Vertical

Row 1:
──────
Year:                    2008
MostViewedQuestionTitle: How to find the index for a given item in a list?
MaxViewCount:            6316987

Row 2:
──────
Year:                    2009
MostViewedQuestionTitle: How do I undo the most recent local commits in Git?
MaxViewCount:            13962748

...

Row 16:
───────
Year:                    2023
MostViewedQuestionTitle: How do I solve "error: externally-managed-environment" every time I use pip 3?
MaxViewCount:            506822

Row 17:
───────
Year:                    2024
MostViewedQuestionTitle: Warning "Third-party cookie will be blocked. Learn more in the Issues tab"
MaxViewCount:            66975

17 rows in set. Elapsed: 0.225 sec. Processed 24.35 million rows, 1.86 GB (107.99 million rows/s., 8.26 GB/s.)
Peak memory usage: 377.26 MiB.
```

## 条件式と配列 {#conditionals-and-arrays}

条件関数と配列関数により、クエリが大幅にシンプルになります。以下のクエリは、2022年から2023年にかけて最大の増加率を示したタグ（出現回数が10000回を超えるもの）を計算します。以下のClickHouseクエリが、条件式、配列関数、および`HAVING`と`SELECT`句でエイリアスを再利用できる機能により、いかに簡潔であるかに注目してください。

_BigQuery_

<Image img={bigquery_12} size="sm" border alt="条件式と配列"/>

_ClickHouse_

```sql
SELECT
    arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS tag,
    countIf(toYear(CreationDate) = 2023) AS count_2023,
    countIf(toYear(CreationDate) = 2022) AS count_2022,
    ((count_2023 - count_2022) / count_2022) * 100 AS percent_change
FROM stackoverflow.posts
WHERE toYear(CreationDate) IN (2022, 2023)
GROUP BY tag
HAVING (count_2022 > 10000) AND (count_2023 > 10000)
ORDER BY percent_change DESC
LIMIT 5

┌─tag─────────┬─count_2023─┬─count_2022─┬──────percent_change─┐
│ next.js     │      13788 │      10520 │   31.06463878326996 │
│ spring-boot │      16573 │      17721 │  -6.478189718413183 │
│ .net        │      11458 │      12968 │ -11.644046884639112 │
│ azure       │      11996 │      14049 │ -14.613139725247349 │
│ docker      │      13885 │      16877 │  -17.72826924216389 │
└─────────────┴────────────┴────────────┴─────────────────────┘

5 rows in set. Elapsed: 0.096 sec. Processed 5.08 million rows, 155.73 MB (53.10 million rows/s., 1.63 GB/s.)
Peak memory usage: 410.37 MiB.
```

これでBigQueryからClickHouseへの移行の基本ガイドは終了です。高度なClickHouse機能についてさらに学ぶには、[ClickHouseでのデータモデリングガイド](/data-modeling/schema-design)を読むことをお勧めします。