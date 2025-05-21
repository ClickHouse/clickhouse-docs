---
slug: /migrations/postgresql/data-modeling-techniques
title: 'データモデリング手法'
description: 'PostgreSQL から ClickHouse への移行のためのデータモデリング'
keywords: ['postgres', 'postgresql', 'migrate', 'migration', 'data modeling']
---

import postgres_b_tree from '@site/static/images/migrations/postgres-b-tree.png';
import postgres_sparse_index from '@site/static/images/migrations/postgres-sparse-index.png';
import postgres_partitions from '@site/static/images/migrations/postgres-partitions.png';
import postgres_projections from '@site/static/images/migrations/postgres-projections.png';
import Image from '@theme/IdealImage';

> これは PostgreSQL から ClickHouse への移行ガイドの **第 3 部** です。具体的な例を用いて、PostgreSQL から移行する際の ClickHouse におけるデータモデリングの方法を示します。

Postgres から移行するユーザーには、[ClickHouse でのデータモデリングに関するガイド](/data-modeling/schema-design)を読むことをお勧めします。このガイドでは、同じ Stack Overflow データセットを使用し、ClickHouse の機能を活用した複数のアプローチを探ります。

## ClickHouse における主キー (順序) {#primary-ordering-keys-in-clickhouse}

OLTP データベースから来たユーザーは、ClickHouse における同等の概念を探しがちです。ClickHouse が `PRIMARY KEY` 構文をサポートしているのを見て、ユーザーはソースOLTPデータベースと同じキーを使用してテーブルスキーマを定義したくなるかもしれません。これは適切ではありません。

### ClickHouse の主キーはどのように異なるのか? {#how-are-clickhouse-primary-keys-different}

自分の OLTP の主キーを ClickHouse で使用するのが適切でない理由を理解するためには、ユーザーは ClickHouse のインデックスの基本を理解する必要があります。Postgres を例として比較しますが、これらの一般的な概念は他の OLTP データベースにも適用されます。

- Postgres の主キーは、定義上、行ごとに一意です。[B-tree 構造](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)の使用により、このキーによって単一行の効率的な検索が可能です。ClickHouse は単一行の値の検索の最適化が可能ですが、分析ワークロードでは通常、数カラムの読み取りが求められ、多くの行に対してフィルタリングを行う必要があります。フィルタは、集計を行う「行のサブセット」を特定することが求められます。
- メモリとディスクの効率は、ClickHouse がしばしば使用されるスケールにとって重要です。データは、パーツとして知られるチャンクで ClickHouse テーブルに書き込まれ、バックグラウンドでのパーツのマージのためにルールが適用されます。ClickHouse では、各パートに固有の主インデックスがあります。パーツがマージされると、マージされたパーツの主インデックスも一緒にマージされます。Postgres とは異なり、これらのインデックスは各行に対して構築されるものではありません。代わりに、パートの主インデックスには行のグループごとに1つのインデックスエントリがあり、この手法は**スパースインデックス**と呼ばれます。
- **スパースインデックス**が可能なのは、ClickHouse が指定されたキーによってディスク上にパートの行を順序付けて保存するからです。単一行を直接見つけるのではなく（B-Tree ベースのインデックスのように）、スパース主インデックスは、インデックスエントリのバイナリ検索を通じて、クエリと一致する可能性のある行のグループを迅速に特定します。見つかった行のグループは、その後、並行して ClickHouse エンジンにストリーミングされて一致を見つけます。このインデックス設計により、主インデックスは小さく（メインメモリに完全に収まる）、特にデータ分析のユースケースで一般的な範囲クエリの実行時を大幅に短縮します。

詳細については、この[詳細なガイド](/guides/best-practices/sparse-primary-indexes)をお勧めします。

<Image img={postgres_b_tree} size="lg" alt="PostgreSQL B-Tree インデックス"/>

<Image img={postgres_sparse_index} size="lg" alt="PostgreSQL スパースインデックス"/>

ClickHouse で選択されたキーは、インデックスだけでなく、データがディスクに書き込まれる順序も決定します。これにより、圧縮レベルに劇的に影響を与え、結果としてクエリパフォーマンスに影響を与えることがあります。ほとんどのカラムの値が連続的に書き込まれる順序を引き起こす順序キーは、選択された圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮することを可能にします。

> テーブル内のすべてのカラムは、指定された順序キーの値に基づいてソートされます。これは、キー自体に含まれているかどうかに関係なく行われます。たとえば、`CreationDate` をキーとして使用する場合、他のすべてのカラムの値の順序は `CreationDate` カラムの値の順序に対応します。複数の順序キーを指定できます。これにより、`SELECT` クエリの `ORDER BY` 句と同じ意味の順序が得られます。

### 順序キーの選択 {#choosing-an-ordering-key}

順序キーを選択する際の考慮事項と手順については、ポストテーブルを例に[こちら](/data-modeling/schema-design#choosing-an-ordering-key)をご覧ください。

リアルタイムのレプリケーションが CDC を使用している場合、追加の制約が考慮される必要があります。CDC での順序キーをカスタマイズする方法については、この[ドキュメント](/integrations/clickpipes/postgres/ordering_keys)を参照してください。

## パーティション {#partitions}

Postgres ユーザーは、パーティションと呼ばれるより小さく管理しやすい部分にテーブルを分割して大規模データベースのパフォーマンスと管理を向上させる概念に馴染みがあるでしょう。このパーティショニングは、指定されたカラム（例：日付）に基づく範囲、定義されたリスト、またはキーをハッシュ化することによって達成できます。これにより、管理者は日付範囲や地理的位置などの特定の基準に基づいてデータを整理できます。パーティショニングは、パーティションのプルーニングとより効率的なインデクシングを通じてクエリパフォーマンスを向上させます。また、全テーブルではなく個々のパーティションで操作を行うことができるため、バックアップやデータ削除などのメンテナンスタスクもサポートします。さらに、パーティショニングは PostgreSQL データベースのスケーラビリティを大幅に向上させ、負荷を複数のパーティションに分散させることができます。

ClickHouse では、テーブルの作成時に `PARTITION BY` 句を使用してパーティショニングを指定します。この句には、カラムに関する SQL 式を含めることができ、その結果によって行がどのパーティションに送信されるかが決定されます。

<Image img={postgres_partitions} size="md" alt="PostgreSQL パーティションから ClickHouse パーティション"/>

データパーツは、ディスク上で各パーティションと論理的に関連付けられ、独立してクエリ可能です。以下の例では、`CreationDate` に基づいて `posts` テーブルを年ごとにパーティショニングします。行が ClickHouse に挿入されると、この式は各行に対して評価され、その結果に応じてパーティションにルーティングされます（もしその年の最初の行であれば、パーティションが作成されます）。

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

パーティショニングの完全な説明については、["テーブルのパーティション"](/partitions)をご覧ください。

### パーティションの応用 {#applications-of-partitions}

ClickHouse におけるパーティショニングは、Postgres と同様の応用がありますが、いくつか微妙な違いがあります。具体的には：

- **データ管理** - ClickHouse では、パーティショニングを主にデータ管理機能として考慮すべきであり、クエリ最適化手法ではありません。キーに基づいてデータを論理的に分離することにより、各パーティションは独立して操作できます（例：削除）。これにより、ユーザーはパーティションを移動させたり、したがってサブセットを[ストレージティア](/integrations/s3#storage-tiers)間で効率的に移動させたりすることができます。また、データの期限切れや[クラスタからの効率的な削除](/sql-reference/statements/alter/partition)が可能です。以下の例では、2008年の投稿を削除します。

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

- **クエリ最適化** - パーティションはクエリパフォーマンスを支援することができますが、これはアクセスパターンに大きく依存します。クエリがわずか数パーティション（理想的には1つ）を対象とする場合、パフォーマンスは向上する可能性があります。これは通常、パーティショニングキーが主キーに含まれておらず、かつそれでフィルタリングしている場合にのみ有効です。しかし、多くのパーティションをカバーする必要があるクエリは、パーティショニングが使用されていない場合よりもパフォーマンスが低下する可能性があります（パーティショニングの結果としてパーツが増える可能性があるため）。パーティションを対象とする利点は、すでに主キーの早いエントリにパーティショニングキーが含まれている場合、存在感が大幅に薄れるか、ほとんどなくなるでしょう。パーティショニングはまた、[GROUP BY クエリを最適化する](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)ために使用できますが、この場合各パーティション内の値が一意である必要があります。一般的には、ユーザーは主キーが最適化されていることを確認し、ごく特定の予測可能なサブセットの1日のアクセスパターンに対してのみパーティショニングをクエリ最適化手法として考慮すべきです。

### パーティションに関する推奨事項 {#recommendations-for-partitions}

ユーザーはパーティショニングをデータ管理手法として考慮すべきです。時間系列データを扱う際にデータをクラスタから期限切れにする必要がある場合に理想的です。例えば、最も古いパーティションは[単に削除する](/sql-reference/statements/alter/partition#drop-partitionpart)ことができます。

**重要:** パーティショニングキーの式が高いカーディナリティのセットにならないようにしてください。すなわち、100 を超えるパーティションを作成することは避けるべきです。例えば、クライアント識別子や名前などの高カーディナリティカラムでデータをパーティショニングしないでください。代わりに、クライアント識別子や名前を ORDER BY 式の最初のカラムにしてください。

> 内部的に、ClickHouse は挿入データに対して[パーツを作成](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)します。データが増えるにつれて、パーツの数が増加します。クエリ性能を低下させるほど高いパーツ数を防ぐために、パーツはバックグラウンドの非同期プロセスで結合されます。パーツの数が設定された制限を超えると、ClickHouse は挿入時に例外をスローします - 「パーツが多すぎる」エラーとして。このエラーは通常の運用状態では発生せず、ClickHouse が不適切に設定されているか、誤って使用されている場合（例：多くの小さい挿入）にのみ発生します。

> パーツはパーティションごとに独立して作成されるため、パーティションの数が増加すると、パーツの数も増加します。つまり、パーティションの数の倍数となります。高カーディナリティのパーティショニングキーは、このエラーを引き起こす可能性があるため、避けるべきです。

## マテリアライズドビューとプロジェクションの違い {#materialized-views-vs-projections}

Postgres では、単一テーブルに対して複数のインデックスを作成することができ、さまざまなアクセスパターンの最適化が可能です。この柔軟性により、管理者や開発者は特定のクエリや運用ニーズに合わせてデータベースのパフォーマンスを調整できます。ClickHouse のプロジェクションの概念は完全に同じではありませんが、ユーザーがテーブルに対して複数の `ORDER BY` 句を指定できるようにします。

ClickHouseの[データモデリング ドキュメント](/data-modeling/schema-design)では、マテリアライズドビューを使用して ClickHouse で集計を事前に計算し、行を変換し、異なるアクセスパターンに対してクエリを最適化する方法を探ります。

これらのうち後者については、[例](/materialized-view/incremental-materialized-view#lookup-table)を提供しました。ここでは、マテリアライズドビューが異なる順序キーを持つターゲットテーブルに行を送信します。

例えば、次のクエリを考えてみましょう：

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

このクエリは、`UserId` が順序キーではないため、90M 行全体をスキャンする必要があります（迅速に処理されますが）。以前は、`PostId` のルックアップのためにマテリアライズドビューを使用してこの問題を解決しました。同じ問題は、[プロジェクション](/data-modeling/projections)を使用して解決できます。以下のコマンドは、 `ORDER BY user_id` のプロジェクションを追加します。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

プロジェクションを作成してから、それをマテリアライズする必要があることに注意してください。この後者のコマンドにより、データが2つの異なる順序でディスクに2回保存されます。データ作成時にプロジェクションを定義することも可能で、以下のように、データが挿入されるときに自動的に維持されます。

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

プロジェクションが `ALTER` で作成された場合、その作成は非同期であり、`MATERIALIZE PROJECTION` コマンドが発行されるときに実行されます。ユーザーは、次のクエリを実行してこの操作の進行状況を確認でき、`is_done=1` を待つことができます。

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

上記のクエリを繰り返すと、追加のストレージの費用を伴って、パフォーマンスが大幅に向上していることが確認できます。

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

`EXPLAIN` コマンドを使用すると、このクエリを処理するためにプロジェクションが使用されたことも確認できます：

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

プロジェクションは、新しいユーザーにとって魅力的な機能です。データが挿入される際に自動的に維持されます。さらに、クエリはプロジェクションが利用できる場合に、単一のテーブルに送信することができ、応答時間を短縮できます。

<Image img={postgres_projections} size="md" alt="PostgreSQL プロジェクション in ClickHouse"/>

これは、マテリアライズドビューとは対照的で、ユーザーは適切な最適化されたターゲットテーブルを選択するか、フィルターに応じてクエリを再作成する必要があります。これにより、ユーザーのアプリケーションの強調が大きくなり、クライアント側の複雑さが増します。

これらの利点にもかかわらず、プロジェクションには[固有の制限](/data-modeling/projections#when-to-use-projections)があり、ユーザーはこれを理解しておくべきです。したがって、プロジェクションは節度を持って展開すべきです。

プロジェクションを使用することをお勧めする場合：

- データの完全な再順序が必要です。プロジェクション内の式は理論的には `GROUP BY` を使用できますが、マテリアライズドビューは集計を維持するためにより効果的です。また、クエリオプティマイザは、`SELECT * ORDER BY x` のような単純な再順序を使用するプロジェクションを利用する可能性が高くなります。この式内でカラムのサブセットを選択することで、ストレージのフットプリントを削減することもできます。
- ユーザーが関連するストレージのフットプリントとデータを2回書き込むオーバーヘッドの増加に対して快適であること。

## デノーマライゼーション {#denormalization}

Postgres はリレーショナルデータベースであるため、そのデータモデルは非常に[正規化](https://en.wikipedia.org/wiki/Database_normalization)されており、しばしば数百のテーブルが含まれます。ClickHouseでは、JOIN パフォーマンスを最適化するためにデノーマライゼーションが有用な場合があります。

ClickHouse における Stack Overflow データセットのデノーマライゼーションの利点を示す[ガイド](/data-modeling/denormalization)をご覧ください。

これで、Postgres から ClickHouse への移行を行うユーザー向けの基本的なガイドを終了します。Postgres から移行するユーザーには、[ClickHouse でのデータモデリングに関するガイド](/data-modeling/schema-design)を読んで、ClickHouse の高度な機能についてさらに学ぶことをお勧めします。
