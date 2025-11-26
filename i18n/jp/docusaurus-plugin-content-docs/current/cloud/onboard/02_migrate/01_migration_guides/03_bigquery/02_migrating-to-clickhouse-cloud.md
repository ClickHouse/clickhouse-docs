---
title: 'BigQuery から ClickHouse Cloud への移行'
slug: /migrations/bigquery/migrating-to-clickhouse-cloud
description: 'BigQuery のデータを ClickHouse Cloud に移行する方法'
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


## なぜ BigQuery ではなく ClickHouse Cloud を使うのか？ {#why-use-clickhouse-cloud-over-bigquery}

要約すると、現代的なデータ分析においては、ClickHouse の方が BigQuery よりも高速で低コストかつ高機能だからです。

<Image img={bigquery_2} size="md" alt="ClickHouse と BigQuery の比較"/>



## BigQuery から ClickHouse Cloud へのデータ読み込み {#loading-data-from-bigquery-to-clickhouse-cloud}

### データセット {#dataset}

BigQuery から ClickHouse Cloud への典型的な移行例として、[こちら](/getting-started/example-datasets/stackoverflow)で説明している Stack Overflow データセットを使用します。これは、2008 年から 2024 年 4 月までに Stack Overflow 上で発生したすべての `post`、`vote`、`user`、`comment`、`badge` を含みます。このデータに対する BigQuery のスキーマは次のとおりです:

<Image img={bigquery_3} size="lg" alt="スキーマ"/>

移行手順をテストするために、このデータセットを BigQuery インスタンスに投入したいユーザー向けに、これらのテーブル用のデータを Parquet 形式で GCS バケットに用意しており、BigQuery でテーブルを作成およびロードするための DDL コマンドは[こちら](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==)で利用できます。

### データの移行 {#migrating-data}

BigQuery と ClickHouse Cloud 間のデータ移行は、主に次の 2 種類のワークロードに分類できます:

- **初回一括ロード + 定期更新** - 初期データセットを移行し、その後は日次などの一定間隔で定期的に更新します。ここでの更新は、変更された行を再送信することで処理します。変更の識別には、（日付などの）比較に使用できるカラムを利用します。削除は、データセット全体を定期的に完全リロードすることで対応します。
- **リアルタイムレプリケーションまたは CDC** - 初期データセットを移行する必要があります。その後、このデータセットへの変更は、数秒程度の遅延のみ許容される形で、ほぼリアルタイムに ClickHouse に反映される必要があります。これは実質的に [Change Data Capture (CDC) プロセス](https://en.wikipedia.org/wiki/Change_data_capture)であり、BigQuery のテーブルが ClickHouse と同期されている必要があります。すなわち、BigQuery テーブルでの挿入（INSERT）・更新（UPDATE）・削除（DELETE）を、ClickHouse の同等のテーブルに適用しなければなりません。

#### Google Cloud Storage (GCS) 経由の一括ロード {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery は、データを Google のオブジェクトストア（GCS）へエクスポートする機能をサポートしています。今回のサンプルデータセットでは:

1. 7 つのテーブルを GCS にエクスポートします。そのためのコマンドは[こちら](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==)で利用できます。

2. データを ClickHouse Cloud にインポートします。そのために [gcs テーブル関数](/sql-reference/table-functions/gcs)を使用できます。DDL とインポートクエリは[こちら](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==)で利用できます。なお、ClickHouse Cloud インスタンスは複数のコンピュートノードで構成されるため、`gcs` テーブル関数の代わりに [s3Cluster テーブル関数](/sql-reference/table-functions/s3Cluster)を使用しています。この関数は GCS バケットでも動作し、[ClickHouse Cloud サービスのすべてのノードを活用](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers)してデータを並列にロードします。

<Image img={bigquery_4} size="md" alt="一括ロード"/>

このアプローチには、次のような利点があります:

- BigQuery のエクスポート機能は、データのサブセットをエクスポートするためのフィルタをサポートしています。
- BigQuery は [Parquet、Avro、JSON、CSV](https://cloud.google.com/bigquery/docs/exporting-data) 形式および複数の[圧縮形式](https://cloud.google.com/bigquery/docs/exporting-data)へのエクスポートをサポートしており、いずれも ClickHouse でサポートされています。
- GCS は[オブジェクト ライフサイクル管理](https://cloud.google.com/storage/docs/lifecycle)をサポートしており、エクスポートして ClickHouse にインポートし終えたデータを、指定した期間後に削除できます。
- [Google は 1 日あたり最大 50TB までの GCS へのエクスポートを無料で許可](https://cloud.google.com/bigquery/quotas#export_jobs)しています。ユーザーが支払うのは GCS ストレージ料金のみです。
- エクスポートは自動的に複数ファイルを生成し、各ファイルを最大 1GB のテーブルデータに制限します。これは、インポートを並列化できるため ClickHouse にとって有利です。

以下の例を試す前に、エクスポートとインポートのパフォーマンスを最大化するため、[エクスポートに必要な権限](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions)および[ロケーションに関する推奨事項](https://cloud.google.com/bigquery/docs/exporting-data#data-locations)を確認することを推奨します。



### スケジュールされたクエリによるリアルタイムレプリケーションまたは CDC {#real-time-replication-or-cdc-via-scheduled-queries}

Change Data Capture（CDC）は、2 つのデータベース間でテーブルを同期状態に保つプロセスです。更新および削除をほぼリアルタイムで扱う必要がある場合、処理は格段に複雑になります。1 つのアプローチとして、BigQuery の[スケジュールされたクエリ機能](https://cloud.google.com/bigquery/docs/scheduling-queries)を利用し、定期的なエクスポートを実行するようスケジュールする方法があります。ClickHouse へのデータ挿入に一定の遅延を許容できる場合、このアプローチは実装と保守が容易です。具体的な例は[このブログ記事](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries)で紹介されています。



## スキーマの設計

Stack Overflow のデータセットには、関連する多数のテーブルが含まれています。まずは主要なテーブルの移行に集中することを推奨します。これは必ずしも最大のテーブルとは限らず、むしろ分析クエリの発行が最も多いと想定されるテーブルです。そうすることで、主要な ClickHouse の概念に慣れることができます。このテーブルは、追加のテーブルが増えるにつれて、ClickHouse の機能を最大限に活用し最適なパフォーマンスを得るために、再モデリングが必要になる場合があります。このモデリングプロセスについては、[データモデリングのドキュメント](/data-modeling/schema-design#next-data-modeling-techniques)で解説しています。

この原則に従い、ここではメインの `posts` テーブルに注目します。これに対する BigQuery のスキーマを以下に示します。

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

### 型の最適化

[こちら](/data-modeling/schema-design)で説明しているプロセスに従うと、次のようなスキーマになります。

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
COMMENT '最適化された型'
```

[`INSERT INTO SELECT`](/sql-reference/statements/insert-into) を使って、[`gcs` table function](/sql-reference/table-functions/gcs) により gcs からエクスポートされたデータを読み込み、このテーブルに簡単にデータを投入できます。なお、ClickHouse Cloud では、gcs 互換の [`s3Cluster` table function](/sql-reference/table-functions/s3Cluster) を使用して、複数ノード間でロード処理を並列化することもできます。

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

新しいスキーマでは、NULL は一切保持しません。上記の INSERT 文により、これらはそれぞれの型のデフォルト値に暗黙的に変換されます。整数であれば 0、文字列であれば空文字列です。ClickHouse は数値型についても、自動的にターゲットの精度に変換します。


## ClickHouse のプライマリキーは何が違うのか {#how-are-clickhouse-primary-keys-different}

[こちら](/migrations/bigquery)で説明したとおり、BigQuery と同様に、ClickHouse はテーブルのプライマリキー列の値に対して一意性を強制しません。

BigQuery におけるクラスタリングと同様に、ClickHouse のテーブルデータは、プライマリキー列を基準としてディスク上に順序づけて格納されます。このソート順は、クエリオプティマイザによって活用され、再ソートの回避、結合におけるメモリ使用量の最小化、および LIMIT 句の評価の早期打ち切りを可能にします。
BigQuery と異なり、ClickHouse はプライマリキー列の値に基づいて[（疎な）プライマリインデックス](/guides/best-practices/sparse-primary-indexes)を自動的に作成します。このインデックスは、プライマリキー列に対してフィルタを含むすべてのクエリの高速化に使用されます。具体的には次のとおりです。

- ClickHouse がよく利用されるようなスケールでは、メモリとディスクの効率性が極めて重要です。データは、パーツと呼ばれるチャンク単位で ClickHouse のテーブルに書き込まれ、バックグラウンドでパーツをマージするためのルールが適用されます。ClickHouse では、各パーツが自身のプライマリインデックスを持ちます。パーツがマージされると、マージ後のパーツのプライマリインデックスもマージされます。これらのインデックスは行ごとには構築されないことに注意してください。代わりに、1 つのパーツのプライマリインデックスには、行のグループごとに 1 件のインデックスエントリがあります。この手法は疎インデックスと呼ばれます。
- 疎インデックスが可能なのは、ClickHouse がパーツ内の行を、指定されたキーで順序づけた状態でディスクに格納しているためです。単一行を直接特定する（B-Tree ベースのインデックスのような）代わりに、疎なプライマリインデックスはインデックスエントリに対する二分探索により、クエリにマッチする可能性のある行グループを素早く特定できるようにします。特定された、マッチする可能性のある行グループは、その後並列で ClickHouse エンジンにストリーミングされ、実際にマッチする行の探索が行われます。このインデックス設計により、プライマリインデックスは小さく（メインメモリに完全に収まる状態に）保たれながらも、特にデータ分析ユースケースで典型的なレンジクエリにおいて、クエリ実行時間を大幅に短縮できます。詳細については、[この詳細ガイド](/guides/best-practices/sparse-primary-indexes)を参照することを推奨します。

<Image img={bigquery_5} size="md" alt="ClickHouse のプライマリキー"/>

ClickHouse で選択したプライマリキーは、インデックスだけでなく、データがディスクに書き込まれる順序も決定します。このため、圧縮率に大きな影響を与え、それが結果としてクエリ性能に影響を与える可能性があります。ほとんどの列の値が連続した順序で書き込まれるような並べ替えキーを選択すると、選択された圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮できるようになります。

> テーブル内のすべての列は、指定した並べ替えキーの値に基づいてソートされ、その列がキー自体に含まれているかどうかに関わらず、このルールが適用されます。たとえば、`CreationDate` がキーとして使用される場合、他のすべての列の値の並び順は、`CreationDate` 列の値の順序に対応します。複数の並べ替えキーを指定することもでき、その場合は `SELECT` クエリの `ORDER BY` 句と同じセマンティクスでソートされます。

### 並べ替えキーの選択 {#choosing-an-ordering-key}

並べ替えキーを選択する際の考慮事項と手順については、posts テーブルを例にとった[こちら](/data-modeling/schema-design#choosing-an-ordering-key)を参照してください。



## データモデリング手法

BigQuery から移行するユーザーは、まず [ClickHouse におけるデータモデリングガイド](/data-modeling/schema-design) を参照することを推奨します。このガイドでは同じ Stack Overflow データセットを使用し、ClickHouse の機能を活用した複数のアプローチを解説しています。

### パーティション

BigQuery ユーザーは、大規模なデータベースにおいて、テーブルを「パーティション」と呼ばれる小さく扱いやすい単位に分割することで、性能と管理性を向上させるテーブルパーティショニングの概念に馴染みがあるはずです。パーティショニングは、指定したカラム（例: 日付）に対する範囲、定義済みリスト、あるいはキーに対するハッシュによって実現できます。これにより、管理者は日付範囲や地理的位置といった特定の条件に基づいてデータを整理できます。

パーティショニングは、パーティションプルーニングや、より効率的なインデックス付けにより、高速なデータアクセスを可能にし、クエリ性能を向上させます。また、テーブル全体ではなく個々のパーティション単位で操作できるため、バックアップやデータ削除といったメンテナンスタスクにも役立ちます。さらに、負荷を複数のパーティションに分散することで、BigQuery データベースのスケーラビリティを大幅に向上させることができます。

ClickHouse では、パーティショニングはテーブルを最初に定義する際に [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key) 句によって指定します。この句には、任意のカラムに対する SQL 式を含めることができ、その評価結果によって各行がどのパーティションに送られるかが決まります。

<Image img={bigquery_6} size="md" alt="パーティション" />

データパーツはディスク上でそれぞれのパーティションに論理的に関連付けられ、パーティション単位で個別にクエリできます。以下の例では、[`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toYear) という式を使用して posts テーブルを年ごとにパーティション化しています。行が ClickHouse に挿入される際、この式が各行に対して評価され、その結果に基づき、そのパーティションに属する新しいデータパーツとして適切なパーティションにルーティングされます。

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

#### 用途

ClickHouse におけるパーティショニングの用途は BigQuery と似ていますが、いくつか細かな違いがあります。具体的には次のとおりです。

* **データ管理** - ClickHouse では、パーティショニングはクエリ最適化の手段ではなく、主にデータ管理のための機能として捉えるべきです。キーに基づいてデータを論理的に分割することで、それぞれのパーティションを独立して操作（例: 削除）できます。これにより、[ストレージ階層](/integrations/s3#storage-tiers)間でパーティション、ひいてはその部分集合を、時間ベースで効率的に移動したり、[クラスタからのデータの期限切れ／効率的な削除](/sql-reference/statements/alter/partition)を行ったりできます。例えば、以下では 2008 年の投稿を削除しています。

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

17 行を取得しました。経過時間: 0.002 秒

ALTER TABLE posts
(DROP PARTITION '2008')

完了しました。

0 行を取得しました。経過時間: 0.103 秒
```


- **クエリ最適化** - パーティションはクエリパフォーマンスの改善に役立つ場合がありますが、その効果はアクセスパターンに大きく依存します。クエリが少数のパーティション（理想的には 1 つ）のみを対象とする場合、パフォーマンスが向上する可能性があります。これは通常、パーティショニングキーがプライマリキーに含まれておらず、かつそのキーでフィルタリングしている場合にのみ有用です。一方で、多数のパーティションをまたいで読み取る必要があるクエリは、パーティショニングを行わない場合よりもパフォーマンスが低下する可能性があります（パーティショニングの結果として `parts` が増える可能性があるため）。対象を 1 つのパーティションに限定できることによる利点も、パーティショニングキーがすでにプライマリキーの先頭付近にある場合にはほとんど、あるいはまったくと言ってよいほど小さくなります。パーティショニングは、各パーティション内の値が一意である場合に限り、[`GROUP BY` クエリを最適化](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key) するためにも利用できます。ただし、一般的には、まずプライマリキーが最適化されていることを確認し、そのうえで、アクセスパターンが 1 日の中の特定の予測可能なサブセットだけにアクセスするような例外的なケース（例: 1 日単位でパーティションを切り、ほとんどのクエリが直近 1 日のみを対象とする場合）に限って、クエリ最適化手法としてのパーティショニングを検討すべきです。

#### 推奨事項 {#recommendations}

パーティショニングはデータ管理のテクニックと考えるべきです。特に時系列データを扱う際、クラスターから古いデータを削除する必要がある場合に適しています。例えば、最も古いパーティションを[単純に削除する](/sql-reference/statements/alter/partition#drop-partitionpart)ことができます。

重要: パーティショニングキーの式によって高カーディナリティな集合が生成されないようにしてください。すなわち、100 を超えるパーティションを作成することは避けてください。例えば、クライアント識別子や名前のような高カーディナリティの列でデータをパーティション分割しないでください。その代わりに、クライアント識別子や名前を `ORDER BY` 式の先頭の列にしてください。

> 内部的には、ClickHouse は挿入されたデータに対して[parts を作成](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)します。より多くのデータが挿入されると、parts の数は増加します。あまりに多くの parts が存在すると、読み取るファイル数が増えるためクエリパフォーマンスが低下してしまいますが、これを防ぐために、バックグラウンドの非同期処理で parts がマージされます。parts の数が[事前に設定された上限](/operations/settings/merge-tree-settings#parts_to_throw_insert)を超えると、ClickHouse は挿入時に例外をスローし、[「too many parts」エラー](/knowledgebase/exception-too-many-parts)として扱います。これは通常の運用では発生せず、ClickHouse の設定ミスや誤った使用方法（例: 非常に小さい挿入を多数行う）によってのみ発生します。parts は各パーティションごとに独立して作成されるため、パーティション数を増やすと parts の数も増加し、パーティション数に比例して大きくなります。そのため、高カーディナリティなパーティショニングキーはこのエラーの原因となりうるため、避けるべきです。



## マテリアライズドビューとプロジェクション

ClickHouse のプロジェクションの概念により、ユーザーは 1 つのテーブルに対して複数の `ORDER BY` 句を指定できます。

[ClickHouse のデータモデリング](/data-modeling/schema-design) では、マテリアライズドビューを ClickHouse でどのように活用して、集約の事前計算や行の変換を行い、さまざまなアクセスパターンに応じてクエリを最適化できるかを解説しています。このうち、アクセスパターンごとのクエリ最適化については、マテリアライズドビューが、挿入を受け取る元のテーブルとは異なるソートキーを持つターゲットテーブルへ行を送る、という[具体例を示しました](/materialized-view/incremental-materialized-view#lookup-table)。

例えば、次のクエリを考えてみます。

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
   │ 0.18181818181818182 │
   └─────────────────────┘
--highlight-next-line
1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (22.5億行/秒、9.01 GB/秒)
ピークメモリ使用量: 201.93 MiB.
```

このクエリは、`UserId` がソートキーではないため（高速ではあるものの）9,000万行すべてをスキャンする必要があります。以前は、`PostId` のルックアップとして機能するマテリアライズドビューを使って、この問題を解決していました。同じ問題はプロジェクションでも解決できます。
以下のコマンドは、`ORDER BY user_id` を持つプロジェクションを追加します。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

まずプロジェクションを作成し、その後にマテリアライズする必要がある点に注意してください。
後者のコマンドを実行すると、データは異なる順序でディスク上に 2 回保存されます。
プロジェクションは、以下に示すようにデータを作成する際に定義することもでき、
データが挿入されると自動的に維持されます。

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

`ALTER` コマンドでプロジェクションを作成した場合、`MATERIALIZE PROJECTION` コマンドを発行しても、その作成は非同期で行われます。次のクエリでこの処理の進捗を確認し、`is_done=1` になるまで待機できます。

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

1 行が返されました。経過時間: 0.003 秒。
```

上記のクエリを再実行すると、追加のストレージを要するものの、パフォーマンスが大幅に向上していることが分かります。

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘
--highlight-next-line
結果セット内の行数: 1 行。経過時間: 0.008 秒。処理行数: 16.36 千行、98.17 KB（2.15 百万行/秒、12.92 MB/秒）。
ピークメモリ使用量: 4.06 MiB。
```

[`EXPLAIN` コマンド](/sql-reference/statements/explain) を使用して、このクエリの処理にプロジェクションが利用されたことも確認できます。

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047
```


┌─explain─────────────────────────────────────────────┐

1. │ 式 ((Projection + Before ORDER BY))                  │
2. │   集約                                              │
3. │   フィルター                                        │
4. │           ReadFromMergeTree (comments&#95;user&#95;id)      │
5. │           インデックス:                             │
6. │           PrimaryKey                                │
7. │           キー:                                     │
8. │           UserId                                    │
9. │           条件: (UserId in [8592047, 8592047])      │
10. │           パーツ: 2/2                               │
11. │           グラニュール: 2/11360                      │
    └─────────────────────────────────────────────────────┘

11 行が結果セットに含まれています。経過時間: 0.004 秒。

```

### プロジェクションを使用する場合 {#when-to-use-projections}

プロジェクションは、データ挿入時に自動的にメンテナンスされるため、新規ユーザーにとって魅力的な機能です。さらに、クエリは単一のテーブルに送信するだけで、プロジェクションが可能な限り活用され、応答時間が短縮されます。

<Image img={bigquery_7} size="md" alt="Projections"/>

これは、マテリアライズドビューとは対照的です。マテリアライズドビューでは、フィルタに応じて適切に最適化されたターゲットテーブルを選択するか、クエリを書き直す必要があります。これにより、ユーザーアプリケーションへの負担が大きくなり、クライアント側の複雑性が増加します。

これらの利点にもかかわらず、プロジェクションには固有の制限があるため、ユーザーはそれを認識し、慎重に導入する必要があります。詳細については、["マテリアライズドビュー対プロジェクション"](/managing-data/materialized-views-versus-projections)を参照してください。

以下の場合にプロジェクションの使用を推奨します:

- データの完全な並べ替えが必要な場合。プロジェクション内の式は理論的には `GROUP BY` を使用できますが、マテリアライズドビューは集計の保守においてより効果的です。また、クエリオプティマイザは、単純な並べ替えを使用するプロジェクション(例: `SELECT * ORDER BY x`)を活用する可能性が高くなります。ユーザーはこの式で列のサブセットを選択することで、ストレージ使用量を削減できます。
- ストレージ使用量の増加とデータを2回書き込むオーバーヘッドを許容できる場合。挿入速度への影響をテストし、[ストレージオーバーヘッドを評価](/data-compression/compression-in-clickhouse)してください。
```


## ClickHouse 向けの BigQuery クエリの書き換え

以下は、BigQuery と ClickHouse のクエリを比較したサンプルクエリです。このリストは、ClickHouse の機能を活用してクエリを大幅に簡素化する方法を示すことを目的としています。ここでの例では、Stack Overflow の全データセット（2024 年 4 月まで）を使用します。

**質問を 10 件超投稿しているユーザーのうち、最も多くビューを獲得しているユーザー:**

*BigQuery*

<Image img={bigquery_8} size="sm" alt="BigQuery クエリの書き換え" border />

*ClickHouse*

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

**どのタグの閲覧数が最も多いか:**

*BigQuery*

<br />

<Image img={bigquery_9} size="sm" alt="BigQuery 1" border />

*ClickHouse*

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

5行が返されました。経過時間: 0.318秒。処理された行数: 5982万行、1.45 GB (1億8801万行/秒、4.54 GB/秒)
ピークメモリ使用量: 567.41 MiB。
```


## 集約関数

可能な場合は、ClickHouse の集約関数を活用してください。以下では、各年でもっとも閲覧された質問を求めるために、[`argMax` 集約関数](/sql-reference/aggregate-functions/reference/argmax) を使用する例を示します。

*BigQuery*

<Image img={bigquery_10} border size="sm" alt="集約関数 1" />

<Image img={bigquery_11} border size="sm" alt="集約関数 2" />

*ClickHouse*

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
MostViewedQuestionTitle: リスト内の指定された項目のインデックスを見つける方法は？
MaxViewCount:            6316987

Row 2:
──────
Year:                    2009
MostViewedQuestionTitle: Gitで最新のローカルコミットを取り消す方法は？
MaxViewCount:            13962748

...

Row 16:
───────
Year:                    2023
MostViewedQuestionTitle: pip 3を使用するたびに「error: externally-managed-environment」を解決する方法は？
MaxViewCount:            506822

Row 17:
───────
Year:                    2024
MostViewedQuestionTitle: 警告「サードパーティCookieがブロックされます。詳細は問題タブをご覧ください」
MaxViewCount:            66975

17行のセット。経過時間: 0.225秒。処理済み 2,435万行、1.86 GB（1億799万行/秒、8.26 GB/秒）
ピークメモリ使用量: 377.26 MiB。
```


## 条件式と配列

条件式と配列関数を使うと、クエリを大幅に簡潔にできます。次のクエリは、2022 年から 2023 年にかけての出現回数が 10000 回を超えるタグのうち、増加率が最も大きいものを算出します。以下の ClickHouse クエリが、条件式・配列関数・`HAVING` 句および `SELECT` 句でエイリアスを再利用できる機能のおかげで簡潔になっている点に注目してください。

*BigQuery*

<Image img={bigquery_12} size="sm" border alt="条件式と配列" />

*ClickHouse*

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

5行を取得しました。経過時間: 0.096秒。処理済み: 508万行、155.73 MB (5310万行/秒、1.63 GB/秒)
ピークメモリ使用量: 410.37 MiB
```

これで、BigQuery から ClickHouse へ移行するユーザー向けの基本ガイドは終了です。BigQuery から移行するユーザーは、ClickHouse の高度な機能についてさらに理解するために、[ClickHouse におけるデータモデリング](/data-modeling/schema-design) のガイドを読むことをお勧めします。
