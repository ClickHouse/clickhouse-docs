---
slug: /data-modeling/denormalization
title: 'データの非正規化'
description: '非正規化を用いてクエリパフォーマンスを向上させる方法'
keywords: ['データの非正規化', '非正規化', 'クエリ最適化']
doc_type: 'guide'
---

import denormalizationDiagram from '@site/static/images/data-modeling/denormalization-diagram.png';
import denormalizationSchema from '@site/static/images/data-modeling/denormalization-schema.png';
import Image from '@theme/IdealImage';

# データの非正規化 {#denormalizing-data}

データの非正規化は、フラット化されたテーブルを使用して `JOIN` を回避し、クエリのレイテンシーを最小限に抑えるために ClickHouse で用いられる手法です。

## 正規化スキーマと非正規化スキーマの比較 {#comparing-normalized-vs-denormalized-schemas}

データの非正規化とは、特定のクエリパターンに対してデータベースのパフォーマンスを最適化するために、あえて正規化プロセスを意図的に元に戻すことを指します。正規化されたデータベースでは、冗長性を最小化しデータ整合性を確保するために、データは複数の関連テーブルに分割されます。非正規化では、テーブルを結合したりデータを重複させたり、計算済みフィールドを単一または少数のテーブルに取り込むことで冗長性を再導入し、実質的に `JOIN` をクエリ時から挿入時へと移すことになります。

このプロセスにより、クエリ時に複雑な結合が不要になり、読み取り処理を大幅に高速化できるため、読み取り要求が多くクエリも複雑なアプリケーションに適しています。ただし、重複データへの変更をすべてのインスタンスに伝播して一貫性を維持する必要があるため、書き込み処理や保守の複雑さが増す可能性があります。

<Image img={denormalizationDiagram} size="lg" alt="ClickHouse における非正規化"/>

<br />

NoSQL ソリューションによって一般的になった手法として、`JOIN` をサポートしない場合にデータを非正規化し、すべての統計情報や関連行を親行上の列およびネストされたオブジェクトとして保存する、というものがあります。例えばブログ用のサンプルスキーマでは、すべての `Comments` を、それぞれの投稿上のオブジェクトの `Array` として保存できます。

## 非正規化を行うタイミング {#when-to-use-denormalization}

一般的には、次のようなケースで非正規化を行うことを推奨します。

- 更新頻度が低いテーブル、もしくは分析クエリでデータが利用可能になるまでの遅延を許容できるテーブル（すなわち、データをバッチで完全にリロードできるテーブル）を非正規化する。
- 多対多関係の非正規化は避ける。これは、単一のソース行が変更された場合に、多数の行を更新する必要が生じる可能性があるためです。
- 高カーディナリティな関係の非正規化は避ける。テーブル内の各行が別のテーブル内の数千件の関連エントリを持つ場合、それらは `Array`（プリミティブ型またはタプルのいずれかの型）として表現する必要があります。一般的に、1000 を超えるタプルを持つ配列は推奨されません。
- すべての列をネストされたオブジェクトとして非正規化するのではなく、マテリアライズドビュー（後述）を利用して統計量だけを非正規化することを検討してください。

すべての情報を非正規化する必要はなく、頻繁にアクセスする必要がある重要な情報だけを非正規化すれば十分です。

非正規化の処理は、ClickHouse 内で行うことも、上流のシステム（例: Apache Flink）で行うこともできます。

## 頻繁に更新されるデータでの非正規化は避ける {#avoid-denormalization-on-frequently-updated-data}

ClickHouse では、非正規化はクエリ性能を最適化するためにユーザーが利用できる選択肢のひとつですが、慎重に使用する必要があります。データが頻繁に更新され、ほぼリアルタイムに更新する必要がある場合、この手法は避けてください。メインテーブルがほぼ追記専用であるか、たとえば毎日などバッチとして定期的に再ロードできる場合にのみ、この手法を使用してください。

このアプローチには、本質的な課題がひとつあります。それは書き込み性能とデータ更新です。より具体的には、非正規化はデータ結合の責務をクエリ時点からインジェスト時点に事実上移すことになります。これはクエリ性能を大きく向上させられる一方で、インジェストを複雑にし、構成に使用された行のいずれかが変更された場合には、データパイプラインがその行を ClickHouse に再挿入する必要があることを意味します。これは、1つのソース行の変更が、場合によっては ClickHouse 内の多くの行を更新する必要があることを意味します。スキーマが複雑で、行が複雑な結合から構成されている場合、結合のネストされたコンポーネント内の1行の変更が、潜在的に数百万行の更新を必要とする可能性があります。

これをリアルタイムで実現するのは非現実的であることが多く、次の2つの課題により多大なエンジニアリング工数を要します。

1. テーブル行が変更されたときに、正しい結合ステートメントをトリガーすること。理想的には、結合対象のすべてのオブジェクトを更新するのではなく、影響を受けたものだけを更新すべきです。結合を調整して、正しい行に効率的にフィルタしつつ、高スループット下でこれを実現するには、外部ツールやエンジニアリングが必要です。
1. ClickHouse における行の更新は慎重に管理する必要があり、追加の複雑さをもたらします。

<br />

そのため、すべての非正規化済みオブジェクトを定期的に再ロードするバッチ更新プロセスのほうが一般的です。

## 非正規化の実用的なケース {#practical-cases-for-denormalization}

非正規化が妥当となるいくつかの実用的な例と、別のアプローチのほうが望ましいケースを考えてみます。

`AnswerCount` や `CommentCount` といった統計情報を含むように、すでに非正規化された `Posts` テーブルがあるとします ― 元のデータはこの形式で提供されています。実際には、この情報は頻繁に変更される可能性が高いため、正規化したくなるかもしれません。これらの列の多くは、他のテーブルからも取得できます。たとえば、ある投稿に対するコメントは、`PostId` 列と `Comments` テーブルを通じて取得できます。例を簡単にするため、ここでは投稿はバッチ処理で再ロードされると仮定します。

また、分析におけるメインテーブルは `Posts` とみなすため、ここでは他のテーブルを `Posts` に対してのみ非正規化することを考えます。逆方向に非正規化することが適切なクエリもありますが、その場合も同様の検討事項が当てはまります。

*以下の各例について、両方のテーブルを結合で使用する必要があるクエリが存在すると仮定してください。*

### Posts と Votes {#posts-and-votes}

投稿に対する Votes は別テーブルで表現されています。このために最適化されたスキーマを以下に示し、あわせてデータをロードするための INSERT コマンドも示します。

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

一見すると、これらは `posts` テーブルに非正規化して格納する候補に見えるかもしれません。このアプローチにはいくつかの課題があります。

`posts` には頻繁に投票が追加されます。時間の経過とともに投稿ごとの頻度は低下するかもしれませんが、次のクエリから、3万件超の投稿に対して 1 時間あたり約 4 万件の投票があることがわかります。

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

遅延を許容できるのであればバッチ処理で対処することも考えられますが、それでも更新を扱う必要がありますし、すべての投稿を定期的に再読み込みするようなことは（おそらく望ましくないため）現実的ではありません。

さらに厄介なのは、一部の投稿には非常に多くの投票が集まっていることです。

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

ここでの主なポイントは、各投稿ごとの投票結果の集計があれば、ほとんどの分析には十分であり、すべての投票情報を非正規化する必要はないということです。たとえば、現在の `Score` 列はそのような統計量、すなわち賛成票の合計から反対票の合計を引いた値を表しています。理想的には、クエリ時に単純なルックアップでこれらの統計を取得できるのが望ましいでしょう（[dictionaries](/dictionary) を参照）。

### Users と Badges {#users-and-badges}

次に `Users` と `Badges` を考えてみましょう：

<Image img={denormalizationSchema} size="lg" alt="Users and Badges schema" />

<p />

まず、次のコマンドでデータを挿入します。

<p />

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

ユーザーは頻繁にバッジを獲得する可能性がありますが、このデータセットを1日に何度も更新する必要があるとは考えにくいです。バッジとユーザーの関係は一対多です。バッジをタプルのリストとしてユーザー側に単純に非正規化して持たせることはできるでしょうか？ 可能ではあるものの、ユーザーごとの最大バッジ数をざっと確認すると、これは得策ではなさそうです。

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

1行に1万9千個のオブジェクトを非正規化して載せるのは、現実的ではない可能性が高いです。この関係は、テーブルを分けたままにするか、統計情報を別途追加する形にしておくのが最適かもしれません。

> たとえば、バッジからユーザーへ統計情報（バッジ数など）を非正規化して持たせたくなるかもしれません。このデータセットでは、挿入時に辞書を使用する例として、そのようなケースを検討します。

### Posts と PostLinks {#posts-and-postlinks}

`PostLinks` は、ユーザーが関連または重複しているとみなす `Posts` を関連付けます。次のクエリは、スキーマとロードコマンドを示しています。

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

どの投稿にも、非正規化を妨げるほど多数のリンクは含まれていないことが確認できます：

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

同様に、これらのリンクも過度に頻繁に発生するイベントではありません。

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

### 簡単な統計の例 {#simple-statistic-example}

ほとんどの場合、非正規化では、親行に単一の列または統計情報を追加するだけで済みます。たとえば、投稿を重複投稿数で拡張したいだけであれば、列を 1 つ追加するだけで済みます。

```sql
CREATE TABLE posts_with_duplicate_count
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -その他の列
   `DuplicatePosts` UInt16
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

このテーブルにデータを投入するために、重複統計テーブルと投稿テーブルを結合した `INSERT INTO ... SELECT` 構文を利用します。

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

### 一対多リレーションのための複合型の活用 {#exploiting-complex-types-for-one-to-many-relationships}

非正規化を行うためには、複合型を活用する必要があることがよくあります。少数のカラムを持つ一対一リレーションを非正規化する場合は、上記のように元の型のまま行として追加すれば十分です。しかし、オブジェクトが大きい場合にはこれは望ましくないことが多く、一対多リレーションではそもそも不可能です。

複雑なオブジェクトや一対多リレーションの場合、次のものを使用できます。

* Named Tuple - 関連する構造を一連のカラムとして表現できます。
* Array(Tuple) または Nested - Named Tuple の配列で、Nested とも呼ばれ、各要素が 1 つのオブジェクトを表します。一対多リレーションに適用できます。

例として、以下では `PostLinks` を `Posts` に対して非正規化する方法を示します。

各投稿は、前述の `PostLinks` スキーマで示したように、他の投稿への複数のリンクを含むことができます。Nested 型として、これらのリンク先投稿および重複投稿を次のように表現できます。

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

> 設定 `flatten_nested=0` を使用していることに注意してください。ネストされたデータのフラット化は無効にすることを推奨します。

この非正規化は、`OUTER JOIN` を用いた `INSERT INTO SELECT` クエリで実行できます。

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

> ここでは処理時間に注目してください。約 2 分で 6,600 万行を非正規化できました。後ほど説明するように、この処理はスケジュール実行が可能です。

`PostId` ごとに `PostLinks` を 1 つの配列にまとめるため、結合前に `groupArray` 関数を使用している点に注意してください。この配列は、その後 `LinkedPosts` と `DuplicatePosts` という 2 つのサブリストにフィルタリングされ、外部結合によって生じた空の結果も除外されます。

新しい非正規化構造を確認するために、いくつかの行を選択してみましょう。

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

非正規化を活用するには、それを実行し、その処理をオーケストレーションするための変換プロセスが必要です。

上で示したように、`INSERT INTO SELECT` を使用して、データのロード後にこの変換を実行するために ClickHouse を利用できます。これは、定期的なバッチ変換に適しています。

定期的なバッチロードプロセスが許容できると仮定すると、ユーザーには ClickHouse でこれをオーケストレーションするためのいくつかの選択肢があります。

- **[リフレッシュ可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view)** - リフレッシュ可能なマテリアライズドビューを使用して、結果をターゲットテーブルに送信するクエリを定期的にスケジュールできます。クエリ実行時、ビューはターゲットテーブルがアトミックに更新されることを保証します。これにより、この作業をスケジューリングするための ClickHouse ネイティブの手段が提供されます。
- **外部ツール** - [dbt](https://www.getdbt.com/) や [Airflow](https://airflow.apache.org/) などのツールを利用して、変換処理を定期的にスケジュールします。[dbt 向け ClickHouse インテグレーション](/integrations/dbt) により、新しいバージョンのターゲットテーブルが作成され、その後、現在クエリを受け付けているバージョンとアトミックに入れ替えられることで（[EXCHANGE](/sql-reference/statements/exchange) コマンド経由）、この処理がアトミックに実行されることが保証されます。

### ストリーミング {#streaming}

ユーザーは、代わりに ClickHouse の外部で、挿入前に [Apache Flink](https://flink.apache.org/) などのストリーミング技術を使用してこの処理を行いたい場合もあります。あるいは、インクリメンタルな [マテリアライズドビュー](/guides/developer/cascading-materialized-views) を使用して、データの挿入と同時にこのプロセスを実行することもできます。
