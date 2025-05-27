---
'slug': '/migrations/postgresql/data-modeling-techniques'
'title': 'データモデリングの手法'
'description': 'PostgreSQL から ClickHouse への移行用データモデリング'
'keywords':
- 'postgres'
- 'postgresql'
- 'migrate'
- 'migration'
- 'data modeling'
---

import postgres_b_tree from '@site/static/images/migrations/postgres-b-tree.png';
import postgres_sparse_index from '@site/static/images/migrations/postgres-sparse-index.png';
import postgres_partitions from '@site/static/images/migrations/postgres-partitions.png';
import postgres_projections from '@site/static/images/migrations/postgres-projections.png';
import Image from '@theme/IdealImage';

> これは **パート 3** の PostgreSQL から ClickHouse への移行に関するガイドです。実用的な例を用いて、PostgreSQL から移行する場合の ClickHouse でのデータモデリング方法を示しています。

Postgres から移行するユーザーには、[ClickHouse でのデータモデリングガイド](/data-modeling/schema-design)を読むことをお勧めします。このガイドでは、同じ Stack Overflow データセットを使用し、ClickHouse の機能を用いた複数のアプローチを探ります。

## ClickHouse における主キー（順序キー） {#primary-ordering-keys-in-clickhouse}

OLTP データベースから来たユーザーは、ClickHouse における同等の概念を探すことがよくあります。ClickHouse が `PRIMARY KEY` 構文をサポートしているのを見て、ユーザーはソース OLTP データベースと同じキーを使用してテーブルスキーマを定義したいと思うかもしれませんが、これは適切ではありません。

### ClickHouse の主キーはどのように異なるのか？ {#how-are-clickhouse-primary-keys-different}

OLTP の主キーを ClickHouse で使用することが適切でない理由を理解するために、ユーザーは ClickHouse のインデックスの基本を理解する必要があります。比較の例として Postgres を使用しますが、これらの一般的な概念は他の OLTP データベースにも適用されます。

- Postgres の主キーは、定義上、行ごとにユニークです。[B-tree 構造](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales) を使用することで、このキーによる単一行の効率的なルックアップが可能です。ClickHouse は単一行の値のルックアップに最適化できますが、分析ワークロードでは通常、複数のカラムの読み取りが必要で、行数は多くなります。フィルターは、集約が行われる行の**サブセット**を特定する必要があります。
- メモリとディスクの効率は、ClickHouse が多く使用されるスケールにおいて非常に重要です。データは ClickHouse テーブルにパーツとして知られるチャンクで書き込まれ、背景でパーツをマージするためのルールが適用されます。ClickHouse では、各パートには独自の主インデックスがあります。パーツがマージされると、マージされたパートの主インデックスもマージされます。Postgres とは異なり、これらのインデックスは各行のために構築されません。代わりに、パートの主インデックスは、行のグループごとに1つのインデックスエントリを持ちます。この技術は**スパースインデックス**と呼ばれます。
- **スパースインデックス**は、ClickHouse がパートの行を指定されたキーによってディスク上に順序付けて保存するために可能です。単一の行を直接位置付ける（B-Tree ベースのインデックスのような）代わりに、スパース主インデックスはインデックスエントリのバイナリ検索を通じて、クエリに一致する可能性のある行のグループを迅速に特定します。特定されたマッチする可能性のある行のグループは、並行して ClickHouse エンジンにストリームされ、一致が見つかるようにします。このインデックス設計により、主インデックスは小さく（メインメモリに完全に収まる）なり、それでもクエリ実行時間の大幅な短縮を可能にする特にデータ分析用途で典型的な範囲クエリに対して洗練されています。

詳細については、この[詳細ガイド](/guides/best-practices/sparse-primary-indexes)をお勧めします。

<Image img={postgres_b_tree} size="lg" alt="PostgreSQL B-Tree インデックス"/>

<Image img={postgres_sparse_index} size="lg" alt="PostgreSQL スパースインデックス"/>

ClickHouse で選択されたキーは、インデックスだけでなく、ディスク上にデータが書き込まれる順序も決定します。このため、圧縮レベルに劇的な影響を与える可能性があり、クエリパフォーマンスに影響を与えることもあります。ほとんどのカラムの値が連続的な順序で書き込まれるようにする順序キーは、選択した圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮するのを可能にします。

> テーブル内のすべてのカラムは、指定された順序キーの値に基づいてソートされます。キー自体に含まれているかどうかにかかわらず。例えば、`CreationDate` がキーとして使用されている場合、他のすべてのカラムの値の順序は `CreationDate` カラムの値の順序に対応します。複数の順序キーを指定することができ、これは `SELECT` クエリの `ORDER BY` 句と同じ意味でソートされます。

### 順序キーの選択 {#choosing-an-ordering-key}

順序キーの選択における考慮事項とステップについては、`posts` テーブルを例にして[こちら](/data-modeling/schema-design#choosing-an-ordering-key)を参照してください。

CDC を使用したリアルタイムレプリケーションの場合、考慮すべき追加の制約があります。この[ドキュメント](/integrations/clickpipes/postgres/ordering_keys)を参照して、CDC で順序キーをカスタマイズする方法を確認してください。

## パーティション {#partitions}

Postgres ユーザーは、テーブルをパーティションに分けて大規模なデータベースのパフォーマンスと管理性を向上させるという概念に精通しているでしょう。このパーティショニングは、指定されたカラム（例：日付）の範囲や、定義されたリスト、またはキーに基づくハッシュを使用して達成できます。これにより、管理者は日付範囲や地理的位置などの特定の基準に基づいてデータを整理することができます。パーティショニングは、パーティショニングプルーニングを通じたデータアクセスの迅速化や、より効率的なインデックス作成によるクエリパフォーマンスの向上に寄与します。また、個々のパーティションに対して操作を行うことを可能にするため、バックアップやデータパージなどの保守作業に役立ちます。さらに、パーティショニングは、複数のパーティションに負荷を分散させることで PostgreSQL データベースのスケーラビリティを大幅に向上させることができます。

ClickHouse では、テーブルが初期に定義されるときにパーティショニングが指定されます。これは `PARTITION BY` 句を通じて行われます。この句には、行がどのパーティションに送信されるかを定義する任意のカラムに対する SQL 式を含めることができます。

<Image img={postgres_partitions} size="md" alt="PostgreSQL パーティションから ClickHouse パーティション"/>

データパーツは、ディスク上の各パーティションと論理的に関連付けられており、個別にクエリを実行することができます。以下の例では、`posts` テーブルを `toYear(CreationDate)` という式を使用して年ごとにパーティション化しています。行が ClickHouse に挿入されると、この式は各行に対して評価され、その年の最初の行であれば、そのパーティションが作成されます。

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

パーティショニングの完全な説明については、["テーブルパーティション"](/partitions)を参照してください。

### パーティションの応用 {#applications-of-partitions}

ClickHouse におけるパーティショニングは Postgres と似た応用がありますが、いくつかの微妙な違いがあります。具体的には：

- **データ管理** - ClickHouse では、ユーザーはパーティショニングを主にデータ管理機能と考えるべきであり、クエリ最適化技術として考慮するべきではありません。キーに基づいて論理的にデータを分離することにより、各パーティションは独立して操作できます（例：削除）。これにより、パーティションの移動、したがってサブセットを [ストレージティア](/integrations/s3#storage-tiers)間で効率的に行ったり、[データの有効期限を切らせて削除](/sql-reference/statements/alter/partition)したりできます。例として、以下では、2008年の投稿を削除します。

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

17 行のセット。経過時間: 0.002 秒。

ALTER TABLE posts
(DROP PARTITION '2008')

Ok.

0 行のセット。経過時間: 0.103 秒。
```

- **クエリ最適化** - パーティションはクエリパフォーマンスを助ける場合がありますが、これはアクセスパターンに大きく依存します。クエリがごく少数のパーティション（ ideally one）を対象とする場合、パフォーマンスが向上する可能性があります。これは一般的に、パーティショニングキーが主キーに含まれておらず、フィルタリングに使用される場合のみ役立ちます。ただし、多くのパーティションをカバーする必要があるクエリは、パーティショニングを使用しない場合よりもパフォーマンスが低下する可能性があります（パーティショニングの結果として パーツが増える可能性があるため）。単一パートションをターゲットとする利点は、パーティショニングキーが主キーの初期にすでに存在する場合にはほとんど無効になります。パーティショニングは、各パーティション内の値がユニークである場合、[GROUP BY クエリの最適化](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)にも使用されることがあります。しかし、一般的には、ユーザーは主キーの最適化を確保し、特定の予測可能なサブセットへのアクセスパターンがある例外的な場合のみクエリ最適化技術としてパーティショニングを考慮すべきです。例えば、日ごとのパーティショニングで、ほとんどのクエリが昨日のデータに対して行われる場合です。

### パーティションに関する推奨事項 {#recommendations-for-partitions}

ユーザーはパーティショニングをデータ管理の手法として考慮すべきです。時間系列データを取り扱う際に、クラスターからデータを期限切れにする必要がある場合に最適です。例えば、最も古いパーティションは[簡単に削除可能です](/sql-reference/statements/alter/partition#drop-partitionpart)。

**重要:** パーティショニングキーの式が高い基数セットを生成しないことを確認してください。すなわち、100 を超えるパーティションの作成は避けるべきです。例えば、クライアント識別子や名前などの高基数のカラムでデータをパーティション化しないでください。代わりに、クライアント識別子や名前を ORDER BY 式の最初のカラムにしましょう。

> ClickHouse は挿入データのために内部で[パーツを作成します](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)。より多くのデータが挿入されると、パーツの数が増加します。クエリパフォーマンスが低下しないように、過度なパーツ数を防ぐため（読み取るファイルが増えるため）、パーツはバックグラウンドの非同期プロセスでマージされます。パーツの数が事前に設定された制限を超えると、ClickHouse は挿入時に "too many parts" エラーとして例外をスローします。これは通常の操作では起こらず、ClickHouse が誤設定されたり誤って使用されたりした場合（小さな挿入が多い場合）にのみ発生します。

> パーツは各パーティションごとに個別に作成されるため、パーティションの数を増やすと、パーツの数も増加します。つまり、これはパーティション数の倍数になります。高基数のパーティショニングキーは、このエラーを引き起こす可能性があるため、避けるべきです。

## マテリアライズドビューとプロジェクション {#materialized-views-vs-projections}

Postgres では、単一のテーブルに対して複数のインデックスを作成でき、さまざまなアクセスパターンに最適化することができます。この柔軟性により、管理者や開発者は特定のクエリと運用ニーズに合わせてデータベースのパフォーマンスを調整できます。ClickHouse のプロジェクションの概念は、この考えに完全には対応しないものの、ユーザーはテーブルの複数の `ORDER BY` 句を指定することができます。

ClickHouse の[データモデリングドキュメント](/data-modeling/schema-design)では、マテリアライズドビューが ClickHouse での集約の事前計算、行の変換、異なるアクセスパターンのクエリの最適化にどのように使用できるか探求しています。

後者の問題を解決するために、[例](/materialized-view/incremental-materialized-view#lookup-table)を提供しました。ここでは、マテリアライズドビューが、元のテーブルとは異なる順序キーを持つターゲットテーブルに行を送信します。

以下のクエリを考えてみてください：

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 行のセット。経過時間: 0.040 秒。処理された行数: 9038万行、361.59 MB (22.5億行/s., 9.01 GB/s.)
最大メモリ使用量: 201.93 MiB.
```

このクエリは、`UserId` が順序キーではないため、すべての 900万行をスキャンする必要があります（早いにしても）。以前は、`PostId` のルックアップとして機能するマテリアライズドビューを使用してこの問題を解決しました。同じ問題は、[プロジェクション](/data-modeling/projections)でも解決できます。以下のコマンドは、`ORDER BY user_id` のプロジェクションを追加します。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

プロジェクションを最初に作成し、その後マテリアライズする必要があることに注意してください。この後者のコマンドでは、データがディスク上に2つの異なる順序で二重に保存されます。データを作成する際にプロジェクションを定義することも可能で、以下のようにデータが挿入されると自動的に維持されます。

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

プロジェクションが `ALTER` を通じて作成された場合、`MATERIALIZE PROJECTION` コマンドが発行されたときに作成が非同期で行われます。ユーザーは、次のクエリでこの操作の進行状況を確認でき、`is_done=1` を待つことができます。

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

1 行のセット。経過時間: 0.003 秒。
```

上記のクエリを繰り返すと、追加のストレージ費用をかけてパフォーマンスが大幅に向上したことが確認できます。

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 行のセット。経過時間: 0.008 秒。処理された行数: 16360 行、98.17 KB (215 万行/s., 12.92 MB/s.)
最大メモリ使用量: 4.06 MiB.
```

`EXPLAIN` コマンドを使用して、プロジェクションがこのクエリを提供するために使用されたことを確認します：

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

11 行のセット。経過時間: 0.004 秒。
```

### プロジェクションを使用するタイミング {#when-to-use-projections}

プロジェクションは、新しいユーザーに対して魅力的な機能です。データが挿入される際に自動的に維持されるからです。さらに、クエリは単一のテーブルに送られ、可能な場合にはプロジェクションが利用され、応答時間を短縮します。

<Image img={postgres_projections} size="md" alt="ClickHouse における PostgreSQL プロジェクション"/>

これは、ユーザーが適切に最適化されたターゲットテーブルを選択しなければならないマテリアライズドビューと対照的であり、ユーザーはフィルタに応じてクエリを再編成しなければなりません。これにより、ユーザーアプリケーションに対する大きな焦点が生まれ、クライアント側の複雑さが増します。

これらの利点にもかかわらず、プロジェクションにはユーザーが認識すべき[固有の制限](/data-modeling/projections#when-to-use-projections)があります。したがって、慎重に展開する必要があります。

プロジェクションは次の場合に使用することをお勧めします：

- データの完全な再順序が必要な場合。プロジェクション内の式は理論的には `GROUP BY` を使用することができますが、集約を維持するためにはマテリアライズドビューの方が効果的です。クエリオプティマイザは単純な再順序を利用するプロジェクションをより活用する可能性があります。すなわち、`SELECT * ORDER BY x`のように、ユーザーはこの式内でカラムのサブセットを選択してストレージフットプリントを削減できます。
- ユーザーは、ストレージフットプリントの増加とデータを二重に書き込むことに伴うオーバーヘッドに対して快適である場合。挿入速度に与える影響をテストし、[ストレージオーバーヘッドを評価](/data-compression/compression-in-clickhouse)してください。

## 非正規化 {#denormalization}

Postgres はリレーショナルデータベースであるため、そのデータモデルは非常に[正規化されています](https://en.wikipedia.org/wiki/Database_normalization)。通常、数百のテーブルを含みます。ClickHouse では、JOIN のパフォーマンスを最適化するために非正規化が時には有益です。

ClickHouse における Stack Overflow データセットの非正規化の利点を示す[ガイド](/data-modeling/denormalization)を参照できます。

これで、Postgres から ClickHouse への移行に関する基本ガイドは終了です。Postgres から移行するユーザーには、[ClickHouse でのデータモデリングガイド](/data-modeling/schema-design)を読むことをお勧めします。学習のために ClickHouse の高度な機能についてさらに知ることができます。
