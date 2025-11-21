---
slug: /data-modeling/denormalization
title: 'データの非正規化'
description: 'クエリパフォーマンスを改善するための非正規化の活用方法'
keywords: ['データの非正規化', '非正規化', 'クエリ最適化']
doc_type: 'guide'
---

import denormalizationDiagram from '@site/static/images/data-modeling/denormalization-diagram.png';
import denormalizationSchema from '@site/static/images/data-modeling/denormalization-schema.png';
import Image from '@theme/IdealImage';


# データの非正規化

ClickHouse におけるデータの非正規化は、結合処理を回避することでクエリのレイテンシを最小限に抑えるために、フラットなテーブルを利用する手法です。



## 正規化スキーマと非正規化スキーマの比較 {#comparing-normalized-vs-denormalized-schemas}

データの非正規化とは、特定のクエリパターンに対してデータベースのパフォーマンスを最適化するために、正規化プロセスを意図的に逆転させることを指します。正規化されたデータベースでは、冗長性を最小限に抑え、データの整合性を確保するために、データは複数の関連テーブルに分割されます。非正規化では、テーブルを結合し、データを複製し、計算フィールドを単一のテーブルまたはより少数のテーブルに組み込むことで冗長性を再導入します。これにより、結合処理をクエリ時から挿入時へ効果的に移行させます。

このプロセスにより、クエリ時の複雑な結合の必要性が軽減され、読み取り操作を大幅に高速化できるため、読み取り負荷が高く複雑なクエリを持つアプリケーションに最適です。ただし、複製されたデータへの変更は整合性を維持するためにすべてのインスタンスに反映する必要があるため、書き込み操作とメンテナンスの複雑さが増す可能性があります。

<Image
  img={denormalizationDiagram}
  size='lg'
  alt='ClickHouseにおける非正規化'
/>

<br />

NoSQLソリューションによって普及した一般的な手法として、`JOIN`のサポートがない場合にデータを非正規化し、すべての統計情報や関連する行を親行の列やネストされたオブジェクトとして格納する方法があります。例えば、ブログのスキーマ例では、すべての`Comments`をそれぞれの投稿にオブジェクトの`Array`として格納できます。


## 非正規化を使用する場合 {#when-to-use-denormalization}

一般的に、以下のような場合に非正規化を推奨します：

- 変更頻度が低いテーブル、または分析クエリでデータが利用可能になるまでの遅延が許容できるテーブル（つまり、データをバッチで完全に再読み込みできる場合）を非正規化します。
- 多対多の関係の非正規化は避けてください。単一のソース行が変更された場合、多数の行を更新する必要が生じる可能性があります。
- 高カーディナリティの関係の非正規化は避けてください。テーブルの各行が別のテーブルに数千の関連エントリを持つ場合、これらはプリミティブ型またはタプルの`Array`として表現する必要があります。一般的に、1000を超えるタプルを持つ配列は推奨されません。
- すべてのカラムをネストされたオブジェクトとして非正規化するのではなく、マテリアライズドビューを使用して統計情報のみを非正規化することを検討してください（以下を参照）。

すべての情報を非正規化する必要はありません。頻繁にアクセスする必要がある重要な情報のみを非正規化すれば十分です。

非正規化作業は、ClickHouseまたは上流（例：Apache Flink）のいずれかで処理できます。


## 頻繁に更新されるデータでの非正規化を避ける {#avoid-denormalization-on-frequently-updated-data}

ClickHouseにおいて、非正規化はクエリパフォーマンスを最適化するための選択肢の一つですが、慎重に使用する必要があります。データが頻繁に更新され、ほぼリアルタイムでの更新が必要な場合は、このアプローチを避けるべきです。メインテーブルが主に追記専用である場合、または日次などのバッチで定期的に再読み込み可能な場合に使用してください。

このアプローチには、書き込みパフォーマンスとデータ更新という主要な課題があります。より具体的には、非正規化はデータ結合の責任をクエリ時から取り込み時へと効果的にシフトします。これによりクエリパフォーマンスは大幅に向上しますが、取り込み処理が複雑になり、行を構成するために使用された行のいずれかが変更された場合、データパイプラインはClickHouseに行を再挿入する必要があります。つまり、ソース行の1つの変更により、ClickHouseの多数の行を更新する必要が生じる可能性があります。複雑なスキーマにおいて、複雑な結合から行が構成されている場合、結合のネストされたコンポーネントの単一行の変更により、数百万行の更新が必要になる可能性があります。

これをリアルタイムで実現することは、多くの場合非現実的であり、次の2つの課題により大規模なエンジニアリングが必要となります。

1. テーブル行が変更されたときに適切な結合ステートメントをトリガーすること。理想的には、結合のすべてのオブジェクトを更新するのではなく、影響を受けたもののみを更新する必要があります。結合を変更して適切な行に効率的にフィルタリングし、高スループット環境下でこれを実現するには、外部ツールまたはエンジニアリングが必要です。
1. ClickHouseでの行更新は慎重に管理する必要があり、追加の複雑性が生じます。

<br />

したがって、すべての非正規化オブジェクトを定期的に再読み込みするバッチ更新プロセスの方が一般的です。


## 非正規化の実用例 {#practical-cases-for-denormalization}

非正規化が有効な実用例と、代替アプローチがより望ましい例をいくつか検討してみましょう。

`AnswerCount`や`CommentCount`などの統計情報で既に非正規化されている`Posts`テーブルを考えてみましょう。ソースデータはこの形式で提供されています。実際には、この情報は頻繁に変更される可能性が高いため、正規化することが望ましい場合があります。これらのカラムの多くは他のテーブルからも利用可能です。例えば、投稿に対するコメントは`PostId`カラムと`Comments`テーブルを介して取得できます。この例では、投稿がバッチ処理で再読み込みされることを前提としています。

また、`Posts`を分析の主要テーブルと見なしているため、他のテーブルを`Posts`に非正規化することのみを検討します。逆方向の非正規化も一部のクエリには適切ですが、同じ考慮事項が適用されます。

_以下の各例では、両方のテーブルを結合で使用する必要があるクエリが存在することを前提としています。_

### PostsとVotes {#posts-and-votes}

投稿に対する投票は別のテーブルとして表現されます。最適化されたスキーマとデータを読み込むためのinsertコマンドを以下に示します:

```sql
CREATE TABLE votes
(
        `Id` UInt32,
        `PostId` Int32,
        `VoteTypeId` UInt8,
        `CreationDate` DateTime64(3, 'UTC'),
        `UserId` Int32,
        `BountyAmount` UInt8
)
ENGINE = MergeTree
ORDER BY (VoteTypeId, CreationDate, PostId)

INSERT INTO votes SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 26.272 sec. Processed 238.98 million rows, 2.13 GB (9.10 million rows/s., 80.97 MB/s.)
```

一見すると、これらは投稿テーブルに非正規化する候補となるかもしれません。しかし、このアプローチにはいくつかの課題があります。

投票は投稿に頻繁に追加されます。投稿ごとの頻度は時間とともに減少する可能性がありますが、以下のクエリは1時間あたり約40,000件の投票が30,000件の投稿に対して行われていることを示しています。

```sql
SELECT round(avg(c)) AS avg_votes_per_hr, round(avg(posts)) AS avg_posts_per_hr
FROM
(
        SELECT
        toStartOfHour(CreationDate) AS hr,
        count() AS c,
        uniq(PostId) AS posts
        FROM votes
        GROUP BY hr
)

┌─avg_votes_per_hr─┬─avg_posts_per_hr─┐
│               41759 │         33322 │
└──────────────────┴──────────────────┘
```

遅延が許容できる場合はバッチ処理で対処できますが、すべての投稿を定期的に再読み込みしない限り(望ましくない可能性が高い)、更新を処理する必要があります。

さらに厄介なのは、一部の投稿が非常に多くの投票を持っていることです:

```sql
SELECT PostId, concat('https://stackoverflow.com/questions/', PostId) AS url, count() AS c
FROM votes
GROUP BY PostId
ORDER BY c DESC
LIMIT 5

┌───PostId─┬─url──────────────────────────────────────────┬─────c─┐
│ 11227902 │ https://stackoverflow.com/questions/11227902 │ 35123 │
│   927386 │ https://stackoverflow.com/questions/927386   │ 29090 │
│ 11227809 │ https://stackoverflow.com/questions/11227809 │ 27475 │
│   927358 │ https://stackoverflow.com/questions/927358   │ 26409 │
│  2003515 │ https://stackoverflow.com/questions/2003515  │ 25899 │
└──────────┴──────────────────────────────────────────────┴───────┘
```

ここでの主な観察結果は、各投稿の集計された投票統計がほとんどの分析には十分であるということです。すべての投票情報を非正規化する必要はありません。例えば、現在の`Score`カラムはそのような統計を表しています。つまり、賛成票の合計から反対票を引いたものです。理想的には、クエリ時に単純な検索でこれらの統計を取得できるようにすることです([dictionaries](/dictionary)を参照)。

### UsersとBadges {#users-and-badges}

次に、`Users`と`Badges`を考えてみましょう:

<Image img={denormalizationSchema} size='lg' alt='UsersとBadgesのスキーマ' />

<p></p>
まず、以下のコマンドでデータを挿入します:
<p></p>


```sql
CREATE TABLE users
(
    `Id` Int32,
    `Reputation` LowCardinality(String),
    `CreationDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
    `DisplayName` String,
    `LastAccessDate` DateTime64(3, 'UTC'),
    `AboutMe` String,
    `Views` UInt32,
    `UpVotes` UInt32,
    `DownVotes` UInt32,
    `WebsiteUrl` String,
    `Location` LowCardinality(String),
    `AccountId` Int32
)
ENGINE = MergeTree
ORDER BY (Id, CreationDate)
```

```sql
CREATE TABLE badges
(
    `Id` UInt32,
    `UserId` Int32,
    `Name` LowCardinality(String),
    `Date` DateTime64(3, 'UTC'),
    `Class` Enum8('Gold' = 1, 'Silver' = 2, 'Bronze' = 3),
    `TagBased` Bool
)
ENGINE = MergeTree
ORDER BY UserId

INSERT INTO users SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet')

0 rows in set. Elapsed: 26.229 sec. Processed 22.48 million rows, 1.36 GB (857.21 thousand rows/s., 51.99 MB/s.)

INSERT INTO badges SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 18.126 sec. Processed 51.29 million rows, 797.05 MB (2.83 million rows/s., 43.97 MB/s.)
```

ユーザーがバッジを頻繁に獲得する可能性はありますが、このデータセットを日次より高い頻度で更新する必要性は低いと考えられます。バッジとユーザーの関係は一対多です。バッジをタプルのリストとしてユーザーに非正規化することは可能でしょうか?可能ではありますが、ユーザーあたりの最大バッジ数を確認すると、この方法は理想的ではないことが示唆されます:

```sql
SELECT UserId, count() AS c FROM badges GROUP BY UserId ORDER BY c DESC LIMIT 5

┌─UserId─┬─────c─┐
│  22656 │ 19334 │
│   6309 │ 10516 │
│ 100297 │  7848 │
│ 157882 │  7574 │
│  29407 │  6512 │
└────────┴───────┘
```

19,000個のオブジェクトを単一の行に非正規化することは現実的ではありません。この関係は、別々のテーブルとして保持するか、統計情報を追加する形で扱うのが最適と考えられます。

> バッジの統計情報(例:バッジ数)をユーザーに非正規化することを検討する場合があります。このようなケースについては、このデータセットに対して挿入時にディクショナリを使用する例で説明します。

### PostsとPostLinks {#posts-and-postlinks}

`PostLinks`は、ユーザーが関連または重複していると見なす`Posts`を接続します。以下のクエリは、スキーマとロードコマンドを示しています:

```sql
CREATE TABLE postlinks
(
  `Id` UInt64,
  `CreationDate` DateTime64(3, 'UTC'),
  `PostId` Int32,
  `RelatedPostId` Int32,
  `LinkTypeId` Enum('Linked' = 1, 'Duplicate' = 3)
)
ENGINE = MergeTree
ORDER BY (PostId, RelatedPostId)

INSERT INTO postlinks SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/postlinks.parquet')

0 rows in set. Elapsed: 4.726 sec. Processed 6.55 million rows, 129.70 MB (1.39 million rows/s., 27.44 MB/s.)
```

投稿に非正規化を妨げるほど過剰な数のリンクが存在しないことを確認できます:

```sql
SELECT PostId, count() AS c
FROM postlinks
GROUP BY PostId
ORDER BY c DESC LIMIT 5

┌───PostId─┬───c─┐
│ 22937618 │ 125 │
│  9549780 │ 120 │
│  3737139 │ 109 │
│ 18050071 │ 103 │
│ 25889234 │  82 │
└──────────┴─────┘
```

同様に、これらのリンクは過度に頻繁に発生するイベントではありません:


```sql
SELECT
  round(avg(c)) AS avg_votes_per_hr,
  round(avg(posts)) AS avg_posts_per_hr
FROM
(
  SELECT
  toStartOfHour(CreationDate) AS hr,
  count() AS c,
  uniq(PostId) AS posts
  FROM postlinks
  GROUP BY hr
)

┌─avg_votes_per_hr─┬─avg_posts_per_hr─┐
│                54 │                    44     │
└──────────────────┴──────────────────┘
```

以下では、これを非正規化の例として使用します。

### シンプルな統計の例 {#simple-statistic-example}

ほとんどの場合、非正規化では親行に単一の列または統計情報を追加する必要があります。たとえば、投稿に重複投稿の数を追加して情報を充実させたい場合、単に列を追加するだけで済みます。

```sql
CREATE TABLE posts_with_duplicate_count
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -その他の列
   `DuplicatePosts` UInt16
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

このテーブルにデータを投入するには、重複統計情報を投稿と結合する`INSERT INTO SELECT`を使用します。

```sql
INSERT INTO posts_with_duplicate_count SELECT
    posts.*,
    DuplicatePosts
FROM posts AS posts
LEFT JOIN
(
    SELECT PostId, countIf(LinkTypeId = 'Duplicate') AS DuplicatePosts
    FROM postlinks
    GROUP BY PostId
) AS postlinks ON posts.Id = postlinks.PostId
```

### 1対多の関係における複合型の活用 {#exploiting-complex-types-for-one-to-many-relationships}

非正規化を実行するには、複合型を活用する必要があることがよくあります。1対1の関係を非正規化する場合で、列数が少ない場合は、上記のように元の型のまま行として追加するだけで済みます。ただし、これは大きなオブジェクトには望ましくないことが多く、1対多の関係には適用できません。

複雑なオブジェクトや1対多の関係の場合、ユーザーは以下を使用できます:

- 名前付きタプル - 関連する構造を列のセットとして表現できます。
- Array(Tuple)またはNested - 名前付きタプルの配列で、Nestedとも呼ばれ、各エントリがオブジェクトを表します。1対多の関係に適用可能です。

例として、以下では`PostLinks`を`Posts`に非正規化する方法を示します。

各投稿には、前述の`PostLinks`スキーマに示されているように、他の投稿へのリンクが複数含まれる場合があります。Nested型として、これらのリンクされた投稿と重複投稿を次のように表現できます:

```sql
SET flatten_nested=0
CREATE TABLE posts_with_links
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -その他の列
   `LinkedPosts` Nested(CreationDate DateTime64(3, 'UTC'), PostId Int32),
   `DuplicatePosts` Nested(CreationDate DateTime64(3, 'UTC'), PostId Int32),
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

> 設定`flatten_nested=0`の使用に注意してください。ネストされたデータのフラット化を無効にすることを推奨します。

この非正規化は、`OUTER JOIN`クエリを使用した`INSERT INTO SELECT`で実行できます:

```sql
INSERT INTO posts_with_links
SELECT
    posts.*,
    arrayMap(p -> (p.1, p.2), arrayFilter(p -> p.3 = 'Linked' AND p.2 != 0, Related)) AS LinkedPosts,
    arrayMap(p -> (p.1, p.2), arrayFilter(p -> p.3 = 'Duplicate' AND p.2 != 0, Related)) AS DuplicatePosts
FROM posts
LEFT JOIN (
    SELECT
         PostId,
         groupArray((CreationDate, RelatedPostId, LinkTypeId)) AS Related
    FROM postlinks
    GROUP BY PostId
) AS postlinks ON posts.Id = postlinks.PostId

0 rows in set. Elapsed: 155.372 sec. Processed 66.37 million rows, 76.33 GB (427.18 thousand rows/s., 491.25 MB/s.)
Peak memory usage: 6.98 GiB.
```

> ここでの処理時間に注目してください。約2分で6600万行を非正規化できました。後述するように、これはスケジュール可能な操作です。


`groupArray` 関数を使用して、結合の前に `PostLinks` を各 `PostId` ごとの配列にまとめている点に注目してください。この配列は 2 つのサブリスト、`LinkedPosts` と `DuplicatePosts` にフィルタリングされ、その際、外部結合の結果に含まれる空の結果は除外されます。

新しい非正規化された構造を確認するために、いくつかの行を選択してみます。

```sql
SELECT LinkedPosts, DuplicatePosts
FROM posts_with_links
WHERE (length(LinkedPosts) > 2) AND (length(DuplicatePosts) > 0)
LIMIT 1
FORMAT Vertical

Row 1:
──────
LinkedPosts:    [('2017-04-11 11:53:09.583',3404508),('2017-04-11 11:49:07.680',3922739),('2017-04-11 11:48:33.353',33058004)]
DuplicatePosts: [('2017-04-11 12:18:37.260',3922739),('2017-04-11 12:18:37.260',33058004)]
```


## 非正規化のオーケストレーションとスケジューリング {#orchestrating-and-scheduling-denormalization}

### バッチ {#batch}

非正規化を活用するには、それを実行しオーケストレーションできる変換プロセスが必要です。

上記では、`INSERT INTO SELECT`を通じてデータが読み込まれた後、ClickHouseを使用してこの変換を実行する方法を示しました。これは定期的なバッチ変換に適しています。

定期的なバッチ読み込みプロセスが許容される場合、ユーザーはClickHouseでこれをオーケストレーションするためのいくつかのオプションがあります:

- **[リフレッシュ可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view)** - リフレッシュ可能なマテリアライズドビューを使用して、クエリを定期的にスケジュールし、結果をターゲットテーブルに送信できます。クエリ実行時に、ビューはターゲットテーブルがアトミックに更新されることを保証します。これにより、この作業をスケジュールするためのClickHouseネイティブな手段が提供されます。
- **外部ツール** - [dbt](https://www.getdbt.com/)や[Airflow](https://airflow.apache.org/)などのツールを利用して、変換を定期的にスケジュールします。[dbt用ClickHouse統合](/integrations/dbt)は、ターゲットテーブルの新しいバージョンが作成され、クエリを受信するバージョンとアトミックに交換される([EXCHANGE](/sql-reference/statements/exchange)コマンドを介して)ことで、これがアトミックに実行されることを保証します。

### ストリーミング {#streaming}

ユーザーは、[Apache Flink](https://flink.apache.org/)などのストリーミング技術を使用して、挿入前にClickHouseの外部でこれを実行することもできます。あるいは、データが挿入される際にこのプロセスを実行するために、インクリメンタルな[マテリアライズドビュー](/guides/developer/cascading-materialized-views)を使用することもできます。
