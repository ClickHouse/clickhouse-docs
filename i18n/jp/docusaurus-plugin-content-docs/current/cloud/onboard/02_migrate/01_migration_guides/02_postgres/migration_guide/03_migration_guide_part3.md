---
slug: /migrations/postgresql/data-modeling-techniques
title: 'データモデリング手法'
description: 'PostgreSQL から ClickHouse への移行ガイド 第 3 回'
keywords: ['postgres', 'postgresql']
show_related_blogs: true
sidebar_label: '第 3 回'
doc_type: 'guide'
---

import postgres_b_tree from '@site/static/images/migrations/postgres-b-tree.png';
import postgres_sparse_index from '@site/static/images/migrations/postgres-sparse-index.png';
import postgres_partitions from '@site/static/images/migrations/postgres-partitions.png';
import postgres_projections from '@site/static/images/migrations/postgres-projections.png';
import Image from '@theme/IdealImage';

> これは、PostgreSQL から ClickHouse への移行ガイドの**パート 3**です。実践的な例を用いて、PostgreSQL から移行する際に ClickHouse でデータをどのようにモデリングすればよいかを示します。

Postgres から移行するユーザーには、[ClickHouse におけるデータモデリングのガイド](/data-modeling/schema-design)を読むことを推奨します。このガイドでは、同じ Stack Overflow データセットを使用し、ClickHouse の機能を活用した複数のアプローチを解説します。


## ClickHouseにおけるプライマリ（ソート）キー {#primary-ordering-keys-in-clickhouse}

OLTPデータベースから移行するユーザーは、ClickHouseで同等の概念を探すことがよくあります。ClickHouseが`PRIMARY KEY`構文をサポートしていることに気づくと、元のOLTPデータベースと同じキーを使用してテーブルスキーマを定義したくなるかもしれません。しかし、これは適切ではありません。

### ClickHouseのプライマリキーはどう異なるのか？ {#how-are-clickhouse-primary-keys-different}

ClickHouseでOLTPプライマリキーを使用することが適切でない理由を理解するには、ClickHouseのインデックス作成の基本を理解する必要があります。ここではPostgresを比較例として使用しますが、これらの一般的な概念は他のOLTPデータベースにも適用されます。

- Postgresのプライマリキーは、定義上、行ごとに一意です。[B-tree構造](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)を使用することで、このキーによる単一行の効率的な検索が可能になります。ClickHouseは単一行の値の検索に最適化できますが、分析ワークロードでは通常、少数の列を多数の行に対して読み取る必要があります。フィルタは、集計が実行される**行のサブセット**を特定する必要があることが多くなります。
- ClickHouseが使用される規模において、メモリとディスクの効率性は極めて重要です。データはパートと呼ばれるチャンク単位でClickHouseテーブルに書き込まれ、バックグラウンドでパートをマージするためのルールが適用されます。ClickHouseでは、各パートに独自のプライマリインデックスがあります。パートがマージされると、マージされたパートのプライマリインデックスもマージされます。Postgresとは異なり、これらのインデックスは各行に対して構築されません。代わりに、パートのプライマリインデックスは行のグループごとに1つのインデックスエントリを持ちます。この技術は**スパースインデックス**と呼ばれます。
- **スパースインデックス**が可能なのは、ClickHouseが指定されたキーで順序付けられたパートの行をディスクに保存するためです。単一行を直接特定する（B-Treeベースのインデックスのような）代わりに、スパースプライマリインデックスは、（インデックスエントリに対する二分探索を介して）クエリに一致する可能性のある行のグループを迅速に特定できます。特定された一致する可能性のある行のグループは、並列にClickHouseエンジンにストリーミングされ、一致を見つけます。このインデックス設計により、プライマリインデックスを小さく保つ（メインメモリに完全に収まる）ことができ、特にデータ分析のユースケースで典型的な範囲クエリにおいて、クエリ実行時間を大幅に高速化できます。

詳細については、この[詳細ガイド](/guides/best-practices/sparse-primary-indexes)を参照することをお勧めします。

<Image img={postgres_b_tree} size='lg' alt='PostgreSQL B-Treeインデックス' />

<Image img={postgres_sparse_index} size='lg' alt='PostgreSQLスパースインデックス' />

ClickHouseで選択されたキーは、インデックスだけでなく、データがディスクに書き込まれる順序も決定します。このため、圧縮レベルに大きな影響を与える可能性があり、それがクエリパフォーマンスに影響を与えることがあります。ほとんどの列の値が連続した順序で書き込まれるようにするソートキーは、選択された圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮できるようにします。

> テーブル内のすべての列は、キー自体に含まれているかどうかに関係なく、指定されたソートキーの値に基づいてソートされます。たとえば、`CreationDate`がキーとして使用される場合、他のすべての列の値の順序は`CreationDate`列の値の順序に対応します。複数のソートキーを指定できます。これは、`SELECT`クエリの`ORDER BY`句と同じセマンティクスで順序付けされます。

### ソートキーの選択 {#choosing-an-ordering-key}

postsテーブルを例として、ソートキーを選択する際の考慮事項と手順については、[こちら](/data-modeling/schema-design#choosing-an-ordering-key)を参照してください。

CDCを使用したリアルタイムレプリケーションを使用する場合、考慮すべき追加の制約があります。CDCでソートキーをカスタマイズする方法については、この[ドキュメント](/integrations/clickpipes/postgres/ordering_keys)を参照してください。


## パーティション {#partitions}

Postgresユーザーは、テーブルを「パーティション」と呼ばれるより小さく管理しやすい単位に分割することで、大規模データベースのパフォーマンスと管理性を向上させるテーブルパーティショニングの概念に馴染みがあるでしょう。このパーティショニングは、指定されたカラムの範囲（例：日付）、定義されたリスト、またはキーに対するハッシュを使用して実現できます。これにより、管理者は日付範囲や地理的位置などの特定の基準に基づいてデータを整理できます。パーティショニングは、パーティションプルーニングによる高速なデータアクセスとより効率的なインデックス作成を可能にすることで、クエリパフォーマンスの向上に役立ちます。また、テーブル全体ではなく個々のパーティションに対して操作を実行できるようにすることで、バックアップやデータ削除などのメンテナンスタスクを支援します。さらに、パーティショニングは複数のパーティションに負荷を分散することで、PostgreSQLデータベースのスケーラビリティを大幅に向上させることができます。

ClickHouseでは、パーティショニングはテーブルの初期定義時に`PARTITION BY`句を使用して指定します。この句には任意のカラムに対するSQL式を含めることができ、その結果によって行がどのパーティションに送られるかが決定されます。

<Image
  img={postgres_partitions}
  size='md'
  alt='PostgreSQLパーティションからClickHouseパーティションへ'
/>

データパートはディスク上の各パーティションに論理的に関連付けられており、個別にクエリを実行できます。以下の例では、`toYear(CreationDate)`式を使用して`posts`テーブルを年ごとにパーティション分割しています。行がClickHouseに挿入されると、この式が各行に対して評価され、該当するパーティションが存在すればそこにルーティングされます（その年の最初の行である場合、パーティションが作成されます）。

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

パーティショニングの詳細については、[「テーブルパーティション」](/partitions)を参照してください。

### パーティションの用途 {#applications-of-partitions}

ClickHouseのパーティショニングはPostgresと同様の用途がありますが、いくつかの微妙な違いがあります。具体的には：

- **データ管理** - ClickHouseでは、ユーザーはパーティショニングを主にデータ管理機能として考えるべきであり、クエリ最適化技術としてではありません。キーに基づいてデータを論理的に分離することで、各パーティションは独立して操作（例：削除）できます。これにより、ユーザーはパーティション、つまりデータのサブセットを[ストレージ階層](/integrations/s3#storage-tiers)間で効率的に移動したり、[データを期限切れにしたりクラスタから効率的に削除](/sql-reference/statements/alter/partition)したりできます。以下の例では、2008年の投稿を削除しています。

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


- **クエリ最適化** - パーティションはクエリパフォーマンスの向上に寄与できますが、これはアクセスパターンに大きく依存します。クエリが少数のパーティション(理想的には1つ)のみを対象とする場合、パフォーマンスが向上する可能性があります。これは通常、パーティショニングキーがプライマリキーに含まれておらず、それによるフィルタリングを行う場合にのみ有用です。しかし、多数のパーティションをカバーする必要があるクエリは、パーティショニングを使用しない場合よりもパフォーマンスが低下する可能性があります(パーティショニングの結果としてパーツ数が増える可能性があるため)。パーティショニングキーがすでにプライマリキーの先頭付近に存在する場合、単一パーティションを対象とすることの利点はさらに小さくなるか、ほぼ無くなります。各パーティション内の値が一意である場合、パーティショニングは[GROUP BYクエリの最適化](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)にも使用できます。ただし、一般的には、ユーザーはまずプライマリキーが最適化されていることを確認し、アクセスパターンが特定の予測可能なデータのサブセットにアクセスする例外的なケース(例:日単位でパーティショニングし、ほとんどのクエリが直近の日を対象とする場合)でのみ、クエリ最適化手法としてパーティショニングを検討すべきです。

### パーティションに関する推奨事項 {#recommendations-for-partitions}

ユーザーはパーティショニングをデータ管理手法として検討すべきです。時系列データを扱う際にクラスタからデータを削除する必要がある場合に理想的です。例えば、最も古いパーティションは[単純に削除](/sql-reference/statements/alter/partition#drop-partitionpart)できます。

**重要:** パーティショニングキー式が高カーディナリティのセットを生成しないようにしてください。つまり、100を超えるパーティションの作成は避けるべきです。例えば、クライアント識別子や名前などの高カーディナリティカラムでデータをパーティショニングしないでください。代わりに、クライアント識別子や名前をORDER BY式の最初のカラムにしてください。

> 内部的に、ClickHouseは挿入されたデータに対して[パーツを作成](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)します。データの挿入が増えるにつれて、パーツ数も増加します。クエリパフォーマンスを低下させる(読み取るファイル数が増える)過度に多いパーツ数を防ぐため、パーツはバックグラウンドの非同期プロセスでマージされます。パーツ数が事前設定された制限を超えると、ClickHouseは挿入時に例外をスローします - これは「パーツが多すぎる」エラーとして表示されます。これは通常の運用では発生せず、ClickHouseが誤って設定されているか、誤って使用されている場合(例:多数の小さな挿入)にのみ発生します。

> パーツはパーティションごとに独立して作成されるため、パーティション数を増やすとパーツ数も増加します。つまり、パーティション数の倍数になります。したがって、高カーディナリティのパーティショニングキーはこのエラーを引き起こす可能性があり、避けるべきです。


## マテリアライズドビュー vs プロジェクション {#materialized-views-vs-projections}

Postgresでは単一のテーブルに複数のインデックスを作成でき、多様なアクセスパターンに対する最適化が可能です。この柔軟性により、管理者と開発者は特定のクエリや運用要件に合わせてデータベースのパフォーマンスを調整できます。ClickHouseのプロジェクションの概念は、これと完全に類似しているわけではありませんが、ユーザーがテーブルに対して複数の`ORDER BY`句を指定できるようにします。

ClickHouseの[データモデリングドキュメント](/data-modeling/schema-design)では、マテリアライズドビューを使用して集計を事前計算し、行を変換し、異なるアクセスパターンに対してクエリを最適化する方法について説明しています。

後者については、マテリアライズドビューが挿入を受け取る元のテーブルとは異なるソートキーを持つターゲットテーブルに行を送信する[例](/materialized-view/incremental-materialized-view#lookup-table)を提供しました。

例えば、次のクエリを考えてみましょう:

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

このクエリは、`UserId`がソートキーではないため、すべての9000万行をスキャンする必要があります(確かに高速ですが)。
以前は、`PostId`のルックアップとして機能するマテリアライズドビューを使用してこれを解決しました。同じ問題は[プロジェクション](/data-modeling/projections)で解決できます。以下のコマンドは、`ORDER BY user_id`のプロジェクションを追加します。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

まずプロジェクションを作成し、次にそれをマテリアライズする必要があることに注意してください。この後者のコマンドにより、データは2つの異なる順序でディスク上に2回保存されます。プロジェクションは、以下に示すようにデータ作成時に定義することもでき、データが挿入されると自動的に維持されます。

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
        PROJECTION comments_user_id
        (
        SELECT *
        ORDER BY UserId
        )
)
ENGINE = MergeTree
ORDER BY PostId
```

プロジェクションが`ALTER`を介して作成される場合、`MATERIALIZE PROJECTION`コマンドが発行されると作成は非同期で行われます。ユーザーは次のクエリでこの操作の進行状況を確認でき、`is_done=1`になるまで待機します。

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

1 row in set. Elapsed: 0.008 sec. Processed 16.36 thousand rows, 98.17 KB (2.15 million rows/s., 12.92 MB/s.)
Peak memory usage: 4.06 MiB.
```

`EXPLAIN`コマンドを使用すると、このクエリの処理にプロジェクションが使用されたことも確認できます:

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

```


┌─explain─────────────────────────────────────────────┐

1. │ Expression ((Projection + Before ORDER BY))         │
2. │   Aggregating                                       │
3. │   Filter                                            │
4. │           ReadFromMergeTree (comments&#95;user&#95;id)      │
5. │           Indexes:                                  │
6. │           PrimaryKey                                │
7. │           Keys:                                     │
8. │           UserId                                    │
9. │           Condition: (UserId in [8592047, 8592047]) │
10. │           Parts: 2/2                                │
11. │           Granules: 2/11360                         │
    └─────────────────────────────────────────────────────┘

11 行が結果セットに含まれます。経過時間: 0.004 秒。

```

### プロジェクションを使用するタイミング {#when-to-use-projections}

プロジェクションは、データ挿入時に自動的にメンテナンスされるため、新規ユーザーにとって魅力的な機能です。さらに、クエリを単一のテーブルに送信するだけで、可能な場合にプロジェクションが自動的に活用され、応答時間が短縮されます。

<Image img={postgres_projections} size="md" alt="ClickHouseにおけるPostgreSQLプロジェクション"/>

これは、マテリアライズドビューとは対照的です。マテリアライズドビューでは、フィルタに応じて適切に最適化されたターゲットテーブルを選択するか、クエリを書き直す必要があります。これにより、ユーザーアプリケーション側の負担が増大し、クライアント側の複雑性が高まります。

これらの利点にもかかわらず、プロジェクションにはユーザーが認識すべき[固有の制限](/data-modeling/projections#when-to-use-projections)があるため、慎重に使用する必要があります。

以下の場合にプロジェクションの使用を推奨します:

- データの完全な並べ替えが必要な場合。プロジェクション内の式は理論的には`GROUP BY`を使用できますが、集計の維持にはマテリアライズドビューの方が効果的です。また、クエリオプティマイザは、単純な並べ替え(例:`SELECT * ORDER BY x`)を使用するプロジェクションを活用する可能性が高くなります。この式で列のサブセットを選択することで、ストレージ使用量を削減できます。
- ストレージ使用量の増加とデータを2回書き込むオーバーヘッドを許容できる場合。挿入速度への影響をテストし、[ストレージオーバーヘッドを評価](/data-compression/compression-in-clickhouse)してください。

:::note
バージョン25.5以降、ClickHouseはプロジェクション内で仮想カラム`_part_offset`をサポートしています。これにより、よりスペース効率の高い方法でプロジェクションを保存できるようになります。

詳細については、[「プロジェクション」](/data-modeling/projections)を参照してください。
:::
```


## 非正規化 {#denormalization}

Postgresはリレーショナルデータベースであるため、そのデータモデルは高度に[正規化](https://en.wikipedia.org/wiki/Database_normalization)されており、数百のテーブルが関与することも珍しくありません。ClickHouseでは、JOINのパフォーマンスを最適化するために非正規化が有効な場合があります。

ClickHouseにおけるStack Overflowデータセットの非正規化の利点を示す[ガイド](/data-modeling/denormalization)を参照してください。

以上で、PostgresからClickHouseへ移行するユーザー向けの基本ガイドは終了です。Postgresから移行するユーザーには、ClickHouseの高度な機能について詳しく学ぶために、[ClickHouseにおけるデータモデリングガイド](/data-modeling/schema-design)を読むことをお勧めします。
