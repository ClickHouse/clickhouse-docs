---
slug: /data-modeling/denormalization
title: 'データの非正規化'
description: '非正規化を使用してクエリパフォーマンスを向上させる方法'
keywords: ['データ非正規化', '非正規化', 'クエリ最適化']
---

import denormalizationDiagram from '@site/static/images/data-modeling/denormalization-diagram.png';
import denormalizationSchema from '@site/static/images/data-modeling/denormalization-schema.png';
import Image from '@theme/IdealImage';


# データの非正規化

データの非正規化は、ClickHouseにおけるテクニックで、フラットなテーブルを利用してジョインを避けることによってクエリの待機時間を最小限に抑えることができます。

## 正規化スキーマと非正規化スキーマの比較 {#comparing-normalized-vs-denormalized-schemas}

データの非正規化は、特定のクエリパターンのためにデータベースパフォーマンスを最適化するために意図的に正規化プロセスを逆転させることを含みます。正規化されたデータベースでは、冗長性を最小限に抑え、データ整合性を確保するために、データが複数の関連テーブルに分割されます。非正規化は、テーブルを結合し、データを重複させ、計算フィールドを1つのテーブルまたは少数のテーブルに組み入れることによって冗長性を再導入します - 効果的に、クエリから挿入時間にジョインを移動させます。

このプロセスは、クエリ時の複雑なジョインの必要性を減少させ、読み取り操作を大幅に加速することができ、重い読み取り要件と複雑なクエリを持つアプリケーションに最適です。ただし、重複したデータの変更はすべてのインスタンスで一貫性を維持するために伝播させる必要があるため、書き込み操作とメンテナンスの複雑さが増す可能性があります。

<Image img={denormalizationDiagram} size="lg" alt="ClickHouseにおける非正規化"/>

<br />

NoSQLソリューションによって普及した一般的なテクニックは、`JOIN`のサポートがない場合にデータを非正規化し、親行のカラムおよびネストされたオブジェクトとしてすべての統計または関連行を格納することです。たとえば、ブログのスキーマの例では、すべての `Comments` をその投稿の `Array` のオブジェクトとして格納できます。

## 非正規化を使用する際のタイミング {#when-to-use-denormalization}

一般的に、以下のような場合にデータの非正規化を推奨します。

- 滅多に変更されないテーブルを非正規化するか、分析クエリ用にデータが利用可能になるまでの遅延を許容できる場合、すなわちデータをバッチで完全に再読み込みできる場合。
- 多対多の関係を非正規化することを避けてください。これは、単一のソース行が変更された場合に、多くの行を更新する必要がある可能性があります。
- 高いカーディナリティの関係を非正規化することを避けてください。テーブルの各行に他のテーブルに多数の関連項目がある場合、これらは `Array` で表される必要があります - 基本型またはタプルのいずれか。一般的に、1000を超えるタプルを持つ配列はお勧めしません。
- すべてのカラムをネストされたオブジェクトとして非正規化するのではなく、マテリアライズドビューを使用して単一の統計だけを非正規化することを検討してください（後述）。

すべての情報が非正規化される必要はありません - 頻繁にアクセスされる必要のある重要な情報だけが必要です。

非正規化作業は、ClickHouseまたは上流で処理することができます。例えば、Apache Flinkを使用することができます。

## 頻繁に更新されるデータでの非正規化を避ける {#avoid-denormalization-on-frequently-updated-data}

ClickHouseにおいて、非正規化はクエリパフォーマンスを最適化するためにユーザーが使用できるいくつかのオプションの1つですが、注意して使用する必要があります。データが頻繁に更新され、リアルタイムに近い速度で更新する必要がある場合、このアプローチは避けるべきです。メインテーブルが主に追加のみであるか、定期的にバッチとして再読み込みできる場合に使用してください - 例えば毎日。

このアプローチには、主に2つの課題があります - 書き込みパフォーマンスとデータの更新。より具体的には、非正規化は実質的にデータのジョインの責任をクエリ時から取り込み時にシフトさせます。これはクエリパフォーマンスを大幅に改善しますが、取り込みが複雑になり、データパイプラインは、構成に使用された行のいずれかが変わった場合にClickHouseに行を再挿入する必要があります。これは、ソース行の変更がClickHouse内の多くの行の更新を必要とする可能性があることを意味します。複雑なジョインから構成された行では、ジョインのネストされたコンポーネントの単一の行の変更が、数百万の行の更新を必要とする可能性があります。

リアルタイムでこれを達成することはしばしば非現実的であり、2つの課題によりかなりのエンジニアリングを必要とします：

1. テーブル行が変更されたときに正しいジョイン文をトリガーします。これは、できる限り、ジョインのためのすべてのオブジェクトを更新するべきではなく、影響を受けたものだけを更新すべきです。正しい行を効率的にフィルタリングするようにジョインを変更し、高スループットの下でこれを達成するには、外部ツールやエンジニアリングが必要です。
1. ClickHouse内の行の更新は慎重に管理する必要があり、追加の複雑さをもたらします。

<br />

したがって、すべての非正規化されたオブジェクトを定期的に再読み込みするバッチ更新プロセスが一般的です。

## 非正規化の実用的なケース {#practical-cases-for-denormalization}

非正規化が意味を持ついくつかの実用的な例と、他のアプローチがより望ましい場合を考えてみましょう。

例えば、すでに `AnswerCount` や `CommentCount` のような統計を含む非正規化された `Posts` テーブルを考えます - ソースデータはこの形式で提供されます。実際には、この情報は頻繁に変更されるため、正規化することを望むかもしれません。これらのカラムの多くは、他のテーブルを通じても利用可能です。例えば、投稿のコメントは `PostId` カラムと `Comments` テーブルを通じて利用可能です。例の目的のために、投稿はバッチプロセスで再読み込みされると仮定します。

他のテーブルを `Posts` に非正規化することだけを検討しています。なぜなら、それが分析のためのメインテーブルだと考えられているからです。逆の方向に非正規化することも、一部のクエリには適切であり、上記の考慮が適用されます。

*以下の各例では、両方のテーブルがジョインで使用されることを前提とします。*

### Posts と Votes {#posts-and-votes}

投稿に対する投票は、別のテーブルとして表されています。これに最適化されたスキーマは以下に示されており、データを読み込むための挿入コマンドも示されています：

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

一見して、これらは投稿テーブルでの非正規化の候補かもしれません。このアプローチにはいくつかの課題があります。

投票は投稿に頻繁に追加されます。投稿あたりの投票が時間とともに減少する可能性はあるものの、以下のクエリは、私たちが約40kの投票を一時間あたり30kの投稿に対して行っていることを示しています。

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

この問題には、遅延に耐えられるのであればバッチ処理によって対処可能ですが、すべての投稿を定期的に再読み込みしない限り、更新を処理する必要があります（それは望ましくない可能性があります）。

さらに厄介なのは、一部の投稿に非常に多くの投票が集まることです。

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

主な観察点は、各投稿に対する集計された投票統計がほとんどの分析に対して十分であるということです - 投票情報をすべて非正規化する必要はありません。たとえば、現在の `Score` カラムはそのような統計を表しています - すなわち、合計アップ票からダウン票を引いたものです。理想的には、これらの統計をクエリ時に簡単にルックアップできれば良いでしょう（詳しくは [dictionaries](/dictionary) を参照）。

### Users と Badges {#users-and-badges}

次に `Users` と `Badges` を考えましょう：

<Image img={denormalizationSchema} size="lg" alt="Users and Badges schema"/>

<p></p>
次のコマンドでデータを挿入します：
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

ユーザーがバッジを頻繁に取得する可能性はありますが、これはおそらく毎日更新する必要があるデータセットではないでしょう。バッジとユーザー間の関係は一対多です。おそらく、単にバッジをユーザーにタプルのリストとして非正規化することができますか？可能ですが、ユーザーごとのバッジの最高数を確認すると、これは理想的ではないことが示唆されます。

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

1万9千のオブジェクトを単一の行に非正規化することはおそらく現実的ではありません。この関係は、別のテーブルとして残すか、統計を追加するのがベストかもしれません。

> バッジの統計をユーザーに非正規化したいかもしれません。例えば、バッジの数を。データを挿入時に辞書を使用してこのデータセットを考慮する際の例です。

### Posts と PostLinks {#posts-and-postlinks}

`PostLinks` はユーザーが関連しているか重複していると見なす `Posts` を接続します。次のクエリはスキーマとロードコマンドを示しています：

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

非正規化を妨げる過剰なリンクを持つ投稿はありません。

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

同様に、これらのリンクは過剰に頻繁に発生するイベントではありません。

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

これを基に、以下で非正規化の例を示します。

### 単純な統計の例 {#simple-statistic-example}

ほとんどの場合、非正規化は親行に単一のカラムまたは統計を追加することが必要です。例えば、重複投稿の数を投稿に追加したいだけで、単純にカラムを追加する必要があります。

```sql
CREATE TABLE posts_with_duplicate_count
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -他のカラム
   `DuplicatePosts` UInt16
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

このテーブルを充填するために、重複統計と投稿を結合して `INSERT INTO SELECT` を利用します。

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

### 一対多の関係のために複雑な型を利用する {#exploiting-complex-types-for-one-to-many-relationships}

非正規化を行うためには、複雑な型を利用する必要があります。一対一の関係が非正規化される場合、カラムの数が少ない場合、ユーザーは単に元の型として行を追加することができます。ですが、これは大きなオブジェクトにとっては望ましくなく、一対多の関係には適用できません。

複雑なオブジェクトや一対多の関係の場合、ユーザーは以下を利用できます：

- 名前付きタプル - 関連する構造をカラムセットとして表現することを可能にします。
- Array(Tuple) または Nested - 名前付きタプルの配列もしくはネストされた形式で、各エントリがオブジェクトを表します。一対多の関係に適用できます。

例として、以下に `PostLinks` を `Posts` に非正規化する様子を示します。

各投稿は、前述の `PostLinks` スキーマのように、他の投稿へのリンクを含むことができます。ネストされた型として、これらのリンクされている重複投稿を以下のように表現するかもしれません：

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

> `flatten_nested=0` の設定を利用してください。ネストされたデータのフラット化を無効にすることをお勧めします。

この非正規化を、`INSERT INTO SELECT` を使って `OUTER JOIN` クエリで実行できます。

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

> ここでの時間に注意してください。66m行を約2分で非正規化しました。後で見るように、これはスケジュールできる操作です。

`groupArray` 関数を利用して、`PostLinks` を各 `PostId` 用に配列にまとめる際にこのような確認が行われます。この配列は、その後2つのサブリスト - `LinkedPosts` と `DuplicatePosts` にフィルタリングされ、外部ジョインから空の結果が除外されます。

新しい非正規化された構造を見るために、いくつかの行を選択することができます：

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

非正規化を活用するには、変換プロセスが必要で、それを実行し調整することが可能です。

上記で示したように、ClickHouseを使用して、`INSERT INTO SELECT` を介してデータを読み込んだ後にこの変換を実行することができます。これはバッチ変換に適しています。

ユーザーは、定期的なバッチ読み込みプロセスが受け入れられると仮定して、ClickHouse内でこれを調整するためのいくつかのオプションがあります：

- **[更新可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view)** - 更新可能なマテリアライズドビューは、定期的にクエリをスケジュールし、その結果をターゲットテーブルに送信するために使用できます。クエリ実行時に、ビューはターゲットテーブルが原子的に更新されることを保証します。これにより、この作業をスケジュールするClickHouseのネイティブな手段が提供されます。
- **外部ツール** - [dbt](https://www.getdbt.com/)や[Airflow](https://airflow.apache.org/)のようなツールを使用して、定期的に変換をスケジュールします。[dbtのClickHouse統合](/integrations/dbt)により、これは原子的に新しいバージョンのターゲットテーブルが作成され、その後クエリを受け取るバージョンと原子的に入れ替えられることが保証されます（[EXCHANGE](/sql-reference/statements/exchange)コマンドを通じて）。

### ストリーミング {#streaming}

ユーザーは、挿入前にClickHouseの外部でこのプロセスを実行したい場合もあります。その場合、[Apache Flink](https://flink.apache.org/)のようなストリーミング技術を使用することができます。あるいは、データが挿入されるにつれてこのプロセスを実行するために、増分 [マテリアライズドビュー](/guides/developer/cascading-materialized-views)を利用することもできます。
