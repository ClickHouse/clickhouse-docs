---
slug: '/data-modeling/denormalization'
title: 'データの非正規化'
description: 'クエリパフォーマンスを向上させるための非正規化の使用方法'
keywords:
- 'data denormalization'
- 'denormalize'
- 'query optimization'
---

import denormalizationDiagram from '@site/static/images/data-modeling/denormalization-diagram.png';
import denormalizationSchema from '@site/static/images/data-modeling/denormalization-schema.png';
import Image from '@theme/IdealImage';


# データの非正規化

データの非正規化は、ClickHouseでフラットなテーブルを使用して、結合を避けることでクエリのレイテンシを最小限に抑えるのを助けるための手法です。

## 正規化されたスキーマと非正規化されたスキーマの比較 {#comparing-normalized-vs-denormalized-schemas}

データの非正規化には、特定のクエリパターンに対するデータベースのパフォーマンスを最適化するために、意図的に正規化プロセスを逆にすることが含まれます。正規化されたデータベースでは、冗長性を最小限に抑え、データの整合性を確保するために、データが複数の関連テーブルに分割されます。非正規化は、結合を行い、データを重複させ、計算されたフィールドを単一のテーブルまたは少数のテーブルに組み込むことによって冗長性を再導入し、クエリ時から挿入時に結合を移動させることを効果的に行います。

このプロセスは、クエリ時の複雑な結合の必要性を減少させ、読み取り操作を大幅に高速化することができ、重い読み取り要件と複雑なクエリを持つアプリケーションに最適です。しかし、重複したデータに対する変更はすべてのインスタンスにわたって伝播させる必要があるため、書き込み操作やメンテナンスの複雑さが増す可能性があります。

<Image img={denormalizationDiagram} size="lg" alt="ClickHouseにおける非正規化"/>

<br />

NoSQLソリューションによって普及した一般的な手法は、`JOIN`のサポートがない場合にデータを非正規化することであり、すべての統計情報または関連行を親行のカラムおよびネストされたオブジェクトとして格納します。たとえば、ブログのスキーマの例では、すべての`Comments`をそれぞれの投稿のオブジェクトの`Array`として保存できます。

## 非正規化を使用すべき時 {#when-to-use-denormalization}

一般的には、以下の場合に非正規化を推奨します：

- あまり頻繁に変更されないテーブル、または分析クエリにデータが利用可能になるまでの遅延が許容できる場合に非正規化します。つまり、データはバッチで完全に再ロードできます。
- 多対多のリレーションシップについての非正規化を避けます。これは、単一のソース行が変更された場合に、多くの行を更新する必要が生じる可能性があります。
- 高いカーディナリティのリレーションシップの非正規化を避けます。もしテーブルの各行が他のテーブルに数千の関連エントリを持つ場合、これらは`Array`として表現する必要があります。一般的に、1000以上のタプルを持つ配列はお勧めしません。
- ネストされたオブジェクトとしてすべてのカラムを非正規化するのではなく、マテリアライズドビューを使用して統計情報を非正規化することを検討してください（下記参照）。

すべての情報が非正規化される必要はありません - 頻繁にアクセスされる必要のある重要な情報だけです。

非正規化作業は、ClickHouseまたは上流で行うことができます。たとえば、Apache Flinkを使用する場合です。

## 頻繁に更新されるデータに対する非正規化を避ける {#avoid-denormalization-on-frequently-updated-data}

ClickHouseにおいて、非正規化はクエリパフォーマンスを最適化するためのいくつかのオプションの1つですが、注意して使用する必要があります。データが頻繁に更新され、ほぼリアルタイムで更新される必要がある場合、このアプローチは避けるべきです。主テーブルが主に追加専用であるか、定期的にバッチとして再ロードできる場合（例：日次）、この方法を使用してください。

このアプローチには1つの主要な課題があります - 書き込みパフォーマンスとデータの更新です。より具体的には、非正規化はデータ結合の責任をクエリ時から取り込み時にシフトさせます。これによってクエリパフォーマンスが大幅に向上する一方で、取り込みが複雑になり、データパイプラインがその構成に使用された行の1つが変更された場合にClickHouseに行を再挿入する必要があります。これは、1つのソース行の変更がClickHouse内の多くの行を更新する必要があることを意味する可能性があります。複雑なスキーマでは、行が複雑な結合から組み立てられているため、結合のネストされたコンポーネント内での行の変更は、数百万行の更新を必要とする可能性があります。

これをリアルタイムで達成するのはしばしば非現実的であり、二つの課題によって大幅な技術的な工夫が必要です：

1. テーブル行が変更されたときに正しい結合文をトリガーすること。理想的には、結合のすべてのオブジェクトが更新されることを引き起こさないようにすべきであり、影響を受けたものだけが更新されるようにします。正しい行に効率的にフィルタリングするためには、外部のツールやエンジニアリングが必要です。
1. ClickHouse内の行の更新は慎重に管理する必要があり、追加の複雑さを導入します。

<br />

したがって、すべての非正規化オブジェクトを定期的に再ロードするバッチ更新プロセスが一般的です。

## 非正規化の実用的なケース {#practical-cases-for-denormalization}

では、非正規化が意味をなすいくつかの実用的な例と、他のものでより望ましいアプローチがある場合を考えてみましょう。

`Posts`テーブルが既に`AnswerCount`や`CommentCount`などの統計で非正規化されていると仮定します。この場合、ソースデータはこの形式で提供されます。実際には、情報が頻繁に変更される可能性が高いため、非正規化されている内容を実際には正規化したいかもしれません。これらのカラムの多くは、例えば`PostId`カラムと`Comments`テーブルを通じて投稿のコメントを利用可能です。例の目的のために、投稿はバッチプロセスで再ロードされると仮定します。

また、我々は他のテーブルを`Posts`に非正規化することのみを検討します。`Posts`は分析のための主要なテーブルと考えています。逆方向での非正規化も一部のクエリにとって適切であり、上記の考慮事項が適用されます。

*以下の各例について、両方のテーブルを結合して利用するクエリが存在するものと仮定します。*

### 投稿と投票 {#posts-and-votes}

投稿への投票は、別々のテーブルとして表現されます。これに対する最適化されたスキーマは以下に示されています。また、データをロードするための挿入コマンドも示します：

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

一見したところ、これらは投稿テーブルの非正規化の候補かもしれません。このアプローチにはいくつかの課題があります。

投稿には頻繁に投票が付けられます。時間とともに投稿ごとの投票数は減少するかもしれませんが、次のクエリでは、30,000件の投稿に対して約40,000件/時間の投票があることを示しています。

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

もし遅延が許容できるのであれば、バッチ処理で対応することもできますが、すべての投稿を定期的に再ロードしない限り、更新を処理する必要があります（これは望ましいとは限りません）。

さらに厄介なのは、一部の投稿には非常に多くの投票がつくことです：

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

ここでの主な観察点は、各投稿の集計投票統計が、ほとんどの分析にとって十分であるということです - すべての投票情報を非正規化する必要はありません。例えば、現在の`Score`カラムはそのような統計を表しています。理想的には、クエリ時に単純なルックアップでこれらの統計を取得できるようにしたいものです（[dictionaries](/dictionary)を参照）。

### ユーザーとバッジ {#users-and-badges}

次に、`Users`と`Badges`を考えてみましょう：

<Image img={denormalizationSchema} size="lg" alt="ユーザーとバッジのスキーマ"/>

<p></p>
以下のコマンドでデータを最初に挿入します：
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

ユーザーは頻繁にバッジを取得するかもしれませんが、これは毎日以上に更新する必要があるデータセットではないでしょう。バッジとユーザーの関係は一対多です。バッジをユーザーにタプルのリストとして単純に非正規化することができるかもしれませんが、最も多くのバッジを持つユーザーを示すクイックチェックではこれは理想的ではないことが示唆されます：

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

19,000件のオブジェクトを単一の行に非正規化するのは現実的ではない可能性があります。この関係は別のテーブルとして残すか、統計情報を追加するのが最良かもしれません。

> 我々はバッジからユーザーへの統計（例：バッジの数）を非正規化したいと考えることがあります。このデータセットに対して挿入時にディクショナリを使用する際の例とします。

### 投稿と投稿リンク {#posts-and-postlinks}

`PostLinks`は、ユーザーが関連または重複していると考える`Posts`を接続します。以下のクエリは、スキーマとロードコマンドを示します：

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

非正規化を妨げる過剰なリンクが存在しないことを確認できます：

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

同様に、これらのリンクはあまり頻繁に発生しないイベントです：

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

これを非正規化の例として使用します。

### 簡単な統計の例 {#simple-statistic-example}

ほとんどの場合、非正規化は親行に単一のカラムまたは統計を追加することを必要とします。たとえば、単に投稿の複製された投稿の数で投稿を強化したいだけかもしれません。そうすれば、カラムを追加する必要があります。

```sql
CREATE TABLE posts_with_duplicate_count
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -他のカラム
   `DuplicatePosts` UInt16
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

このテーブルをポピュレートするために、`INSERT INTO SELECT`を利用して、私たちの複製統計を投稿に結合します。

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

### 一対多のリレーションシップのための複雑な型を活用する {#exploiting-complex-types-for-one-to-many-relationships}

非正規化を行うためには、複雑な型を利用することが必要です。一対一のリレーションシップが非正規化される場合、カラム数が少ない場合、ユーザーはこれを単純に元の型で行として追加することができます。しかし、これは一般的に大きなオブジェクトには望ましくないことであり、一対多のリレーションシップには適用できません。

複雑なオブジェクトや一対多のリレーションシップの場合、ユーザーは以下を使用できます：

- 名前付きタプル - 一連のカラムとして関連構造を表すことができます。
- Array(Tuple)またはNested - 名前付きタプルの配列もしくは、各エントリがオブジェクトを表すNested。適用可能な一対多のリレーションシップ。

例として、`PostLinks`を`Posts`に非正規化する方法を示します。

各投稿は、前に示した`PostLinks`スキーマのように、他の投稿へのいくつかのリンクを含む可能性があります。ネストされたタイプとして、リンクされた投稿と重複投稿を次のように表現できます：

```sql
SET flatten_nested=0
CREATE TABLE posts_with_links
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -他のカラム
   `LinkedPosts` Nested(CreationDate DateTime64(3, 'UTC'), PostId Int32),
   `DuplicatePosts` Nested(CreationDate DateTime64(3, 'UTC'), PostId Int32),
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

> `flatten_nested=0`を使用していることに注意してください。ネストされたデータのフラット化は無効にすることをお勧めします。

この非正規化を`INSERT INTO SELECT`を使用して、`OUTER JOIN`クエリを使って実行できます：

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

> ここにタイミングを注目してください。約2分で6600万行を非正規化することに成功しました。後で見るように、これはスケジュールすることができる操作です。

`groupArray`関数を使用して、`PostLinks`を各`PostId`ごとに配列にまとめたことに注意してください。これは、その後、2つのサブリストにフィルタリングされます：`LinkedPosts`と`DuplicatePosts`は、外部結合からの空の結果を除外します。

新しい非正規化された構造を確認するために、いくつかの行を選択できます：

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

## 非正規化の調整とスケジューリング {#orchestrating-and-scheduling-denormalization}

### バッチ {#batch}

非正規化を利用するためには、変換プロセスを行い、調整する必要があります。

以上で示したように、ClickHouseを使用して`INSERT INTO SELECT`を通じてデータがロードされた後にこの変換を実行することができます。これは定期的なバッチ変換に適しています。

ユーザーは、周期的なバッチロードプロセスが許容される場合、ClickHouse内でこれを調整するためのいくつかのオプションを持っています：

- **[更新可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view)** - 更新可能なマテリアライズドビューを使用して、定期的にクエリをスケジュールし、結果をターゲットテーブルに送信できます。クエリが実行されると、ビューはターゲットテーブルを原子的に更新します。これはこの作業をスケジュールするためのClickHouseネイティブな手段を提供します。
- **外部ツール** - [dbt](https://www.getdbt.com/)や[Airflow](https://airflow.apache.org/)などのツールを利用して、変換を定期的にスケジュールします。[dbtのClickHouse統合](/integrations/dbt)は、ターゲットテーブルの新しいバージョンが作成され、クエリを受け取るバージョンと原子的に交換されることを保証します（[EXCHANGE](/sql-reference/statements/exchange)コマンドを介して）。

### ストリーミング {#streaming}

ユーザーは、代わりにClickHouseの外部で挿入前に、[Apache Flink](https://flink.apache.org/)のようなストリーミング技術を使用してこれを行いたいかもしれません。あるいは、データが挿入される際にこのプロセスを実行するために、インクリメンタルな[マテリアライズドビュー](/guides/developer/cascading-materialized-views)を使用することもできます。
