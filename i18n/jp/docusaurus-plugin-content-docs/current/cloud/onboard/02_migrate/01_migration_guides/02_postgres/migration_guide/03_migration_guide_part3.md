---
'slug': '/migrations/postgresql/data-modeling-techniques'
'title': 'データモデリング技術'
'description': 'PostgreSQL から ClickHouse への移行に関するガイドのパート 3'
'keywords':
- 'postgres'
- 'postgresql'
'show_related_blogs': true
'sidebar_label': 'パート 3'
'doc_type': 'guide'
---

import postgres_b_tree from '@site/static/images/migrations/postgres-b-tree.png';
import postgres_sparse_index from '@site/static/images/migrations/postgres-sparse-index.png';
import postgres_partitions from '@site/static/images/migrations/postgres-partitions.png';
import postgres_projections from '@site/static/images/migrations/postgres-projections.png';
import Image from '@theme/IdealImage';

> これはPostgreSQLからClickHouseへの移行に関するガイドの**パート3**です。実用的な例を使用して、PostgreSQLから移行する場合にClickHouseでデータをどのようにモデル化するかを示しています。

Postgresから移行するユーザーには、[ClickHouseでのデータモデル化ガイド](/data-modeling/schema-design)を読むことをお勧めします。このガイドでは、同じStack Overflowデータセットを使用し、ClickHouse機能を使用した複数のアプローチを探ります。

## ClickHouseにおける主キー（順序付けキー） {#primary-ordering-keys-in-clickhouse}

OLTPデータベースから来るユーザーは、ClickHouseにおける同等の概念を求めることがよくあります。ClickHouseが`PRIMARY KEY`構文をサポートしていることに気付くと、ユーザーはソースOLTPデータベースと同じキーを使用してテーブルスキーマを定義したくなるかもしれませんが、これは適切ではありません。

### ClickHouseの主キーはどのように異なるか？ {#how-are-clickhouse-primary-keys-different}

OLTP主キーをClickHouseで使用することが適切でない理由を理解するには、ユーザーはClickHouseのインデクシングの基本を理解する必要があります。Postgresを比較の例として使用しますが、これらの一般的な概念は他のOLTPデータベースにも適用されます。

- Postgresの主キーは定義上、行ごとにユニークです。 [B木構造](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)の使用により、このキーによる単一行の効率的な検索が可能です。ClickHouseは単一行値の検索に最適化できますが、分析ワークロードは通常、たくさんの行のいくつかのカラムを読み取ることを要求します。フィルタは、集約が実行される**行のサブセット**を特定する必要があることが多いです。
- メモリとディスクの効率は、ClickHouseがよく使用されるスケールにおいて非常に重要です。データはパーツと呼ばれるチャンク単位でClickHouseテーブルに書き込まれ、バックグラウンドでパーツをマージするためのルールが適用されます。ClickHouseでは、各パートには独自の主インデックスがあります。パーツがマージされると、マージされたパートの主インデックスもマージされます。Postgresとは異なり、これらのインデックスは各行に対して構築されません。代わりに、パートの主インデックスは行のグループごとに1つのインデックスエントリを持っています。この技術は**スパースインデクシング**と呼ばれます。
- **スパースインデクシング**が可能なのは、ClickHouseがパートの行を指定したキーによってディスク上に順序付けて保存するからです。単一の行を直接特定するのではなく（B-Treeベースのインデックスのように）、スパース主インデックスはインデックスエントリのバイナリサーチを介してクエリと一致する可能性がある行のグループを迅速に特定します。特定された潜在的に一致する行のグループは、並行してClickHouseエンジンにストリーミングされて一致を見つけることができます。このインデックス設計により、主インデックスは小さく（メインメモリに完全に収まります）、データ分析のユースケースで一般的な範囲クエリにおいて特にクエリ実行時間を大幅に短縮することができます。

詳細については、この[詳細ガイド](/guides/best-practices/sparse-primary-indexes)をお勧めします。

<Image img={postgres_b_tree} size="lg" alt="PostgreSQL B-Tree インデックス"/>

<Image img={postgres_sparse_index} size="lg" alt="PostgreSQL スパースインデックス"/>

ClickHouseで選択するキーは、インデックスだけでなく、データがディスクに書き込まれる順序も決定します。これにより、圧縮レベルに大きな影響を与える可能性があるため、クエリのパフォーマンスにも影響を与えることがあります。ほとんどのカラムの値が連続した順序で書き込まれるような順序付けキーは、選択した圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮できるようにします。

> テーブル内のすべてのカラムは、指定された順序付けキーの値に基づいてソートされます。このキーに含まれているカラムに関係なく。たとえば、`CreationDate`がキーとして使用される場合、他のすべてのカラムの値の順序は`CreationDate`カラムの値の順序に対応します。複数の順序付けキーを指定することができます - これは`SELECT`クエリの`ORDER BY`句と同じ意味で順序が付けられます。

### 順序付けキーの選択 {#choosing-an-ordering-key}

順序付けキーの選択に関する考慮事項および手順については、投稿テーブルを例にした情報を[こちら](/data-modeling/schema-design#choosing-an-ordering-key)で確認してください。

CDCを用いたリアルタイムレプリケーションを使用する際には、考慮すべき追加の制約があります。CDCによる順序付けキーのカスタマイズ方法については、この[ドキュメント](/integrations/clickpipes/postgres/ordering_keys)を参照してください。

## パーティション {#partitions}

Postgresユーザーは、テーブルパーティショニングの概念に慣れているでしょう。これは、大規模データベースのパフォーマンスと管理性を向上させるために、テーブルをより小さく、管理しやすい部分であるパーティションに分割することです。このパーティショニングは、指定したカラム（例：日付）での範囲、定義されたリスト、またはキーに基づくハッシュを使用して実現できます。これにより、管理者はデータを特定の基準（例：日付範囲や地理的位置）に基づいて整理できます。パーティショニングは、パーティションプルーニングを通じてデータアクセスが迅速化され、より効率的なインデクシングによりクエリパフォーマンス向上に寄与します。また、パーティションごとに操作を実行できるため、バックアップやデータパージなどのメンテナンスタスクにも役立ちます。さらに、パーティショニングは、負荷を複数のパーティションに分散させることにより、PostgreSQLデータベースのスケーラビリティを大幅に向上させることができます。

ClickHouseでは、パーティショニングは`PARTITION BY`句を使用してテーブルが初めて定義される際に指定されます。この句は、任意のカラムに対するSQL式を含むことができ、その結果がどのパーティションに行が送信されるかを定義します。

<Image img={postgres_partitions} size="md" alt="PostgreSQLからClickHouseへのパーティション"/>

データパーツは論理的に各パーティションに関連付けられ、孤立してクエリを実行できます。以下の例では、`posts`テーブルを年ごとに`toYear(CreationDate)`の式を用いてパーティション化しています。行がClickHouseに挿入されると、この式は各行に対して評価され、結果のパーティションが存在する場合はそこにルーティングされます（行が年の最初の場合、パーティションが作成されます）。

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

### パーティションの適用 {#applications-of-partitions}

ClickHouseにおけるパーティショニングの適用はPostgresと似ていますが、いくつかの微妙な違いがあります。より具体的には：

- **データ管理** - ClickHouseでは、ユーザーはパーティショニングを主にデータ管理機能と考えるべきであり、クエリ最適化技術ではありません。キーによって論理的にデータを分けることで、各パーティションは独立して操作を行うことができます（例：削除）。これにより、ユーザーはパーティションを移動することができ、その結果、[ストレージティア](/integrations/s3#storage-tiers)間で時間を効率的に移動させたり、[データを有効期限で削除/クラスターから効率的に削除]( /sql-reference/statements/alter/partition)したりできます。以下の例では、2008年の投稿を削除します。

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

- **クエリ最適化** - パーティションはクエリパフォーマンスを支援することができますが、これはアクセスパターンに大きく依存します。クエリが数少ないパーティション（理想的には1つ）のみをターゲットにする場合、パフォーマンスが向上する可能性があります。これは通常、パーティショニングキーが主キーに含まれていない場合にのみ有効であり、それによってフィルタリングします。しかし、多くのパーティションを網羅する必要があるクエリは、パーティショニングを使用しない場合よりもパフォーマンスが悪化するかもしれません（これは、パーティショニングによってパーツが増える可能性があるため）。単一のパーティションをターゲットにする利点は、パーティショニングキーがすでに主キーの初期のエントリである場合には、ほとんど存在しないか、全く存在しないでしょう。パーティショニングは、もし各パーティション内の値がユニークであるなら、[GROUP BYクエリの最適化](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)にも使用できます。ただし、一般的には、ユーザーは主キーが最適化されていることを確認し、アクセスパターンが特定の予測可能なサブセット（例：日ごとのパーティショニングで、ほとんどのクエリが最後の日にある）にアクセスする場合にのみパーティショニングをクエリ最適化技術として考慮すべきです。

### パーティションの推奨事項 {#recommendations-for-partitions}

ユーザーはパーティショニングをデータ管理技術と考えるべきです。時間系列データを扱う際に、クラスターから古いデータを有効期限切れにする必要がある場合には理想的です。たとえば、最も古いパーティションは[単純に削除できる](/sql-reference/statements/alter/partition#drop-partitionpart)からです。

**重要：** パーティショニングキーの式が高いカーディナリティのセットを生成しないようにしてください。すなわち、100以上のパーティションを作成することは避けるべきです。たとえば、クライアント識別子や名前のような高カーディナリティカラムでデータをパーティショニングしないでください。代わりに、ORDER BY式の最初のカラムにクライアント識別子や名前を設けてください。

> 内部的にClickHouseは、挿入されたデータに対して[パーツを作成](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)します。データがさらに挿入されると、パーツの数が増加します。パーツの数が過剰に増えることを防ぐため、これはクエリパフォーマンスを低下させ（読み取るファイルが増えるため）、パーツがバックグラウンドの非同期プロセスで一緒にマージされます。パーツの数が事前に設定された制限を超えると、ClickHouseは挿入時に例外をスローします - "too many parts"エラーとして。このエラーは通常の操作中には発生せず、ClickHouseが不適切に設定されているか、誤って使用されている場合にのみ発生します（例：多くの小さな挿入）。

> パーティションごとにパーツが独立して作成されるため、パーティション数を増やすとパーツ数が増加します。すなわち、パーツはパーティション数の倍数です。高カーディナリティのパーティショニングキーは、このエラーを引き起こす可能性があるため、避けるべきです。

## マテリアライズドビューとプロジェクションの違い {#materialized-views-vs-projections}

Postgresでは、単一のテーブルに対して複数のインデックスを作成でき、多様なアクセスパターンに最適化できます。この柔軟性により、管理者や開発者は特定のクエリや運用ニーズにデータベースパフォーマンスを合わせることができます。ClickHouseのプロジェクションの概念は完全に同じではありませんが、ユーザーはテーブルのための複数の`ORDER BY`句を指定できます。

ClickHouseの[データモデル化ドキュメント](/data-modeling/schema-design)では、マテリアライズドビューを使用してClickHouseで集約を事前計算し、行を変換し、さまざまなアクセスパターンのクエリを最適化する方法を探ります。

これらのうちの後者について、マテリアライズドビューが`PostId`のルックアップとして行をターゲットテーブルに送信する例を[示しました](/materialized-view/incremental-materialized-view#lookup-table)。 

例えば、次のクエリを考えてみてください：

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

このクエリは、`UserId`が順序付けキーでないため、すべての9000万行をスキャンする必要があります（速いとはいえ）。以前、私たちはこれを`PostId`のルックアップとして機能するマテリアライズドビューを使って解決しました。同じ問題は、[プロジェクション](/data-modeling/projections)でも解決できます。以下のコマンドは、`ORDER BY user_id`に対してプロジェクションを追加します。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

プロジェクションをまず作成し、その後マテリアライズする必要があることに注意してください。この後者のコマンドは、データを異なる順序の2つの場所にディスクに保存させます。データが作成されるときにプロジェクションを定義することもでき、以下のように、データが挿入されるにつれて自動的に維持されます。

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

プロジェクションが`ALTER`を介して作成された場合、`MATERIALIZE PROJECTION`コマンドが発行されると、作成は非同期です。この操作の進行状況は次のクエリで確認でき、`is_done=1`を待つことができます。

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

上記のクエリを繰り返すと、パフォーマンスが大幅に改善され、追加のストレージの代償が生じます。

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

`EXPLAIN`コマンドを使用すると、このクエリを処理するためにプロジェクションが使用されたことを確認できます：

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

プロジェクションは新しいユーザーにとって魅力的な機能であり、データが挿入されると自動的に維持されます。さらに、クエリはプロジェクションが可能な限り利用される単一のテーブルに送信することができ、応答時間を短縮します。

<Image img={postgres_projections} size="md" alt="ClickHouseにおけるPostgreSQLプロジェクション"/>

これは、ユーザーが適切な最適化ターゲットテーブルを選択するか、フィルタに応じてクエリを再構成しなければならないマテリアライズドビューとは対照的です。これは、ユーザーアプリケーションに対するより大きな強調を置き、クライアント側の複雑さを増加させます。

これらの利点にもかかわらず、プロジェクションにはいくつかの[固有の制限](/data-modeling/projections#when-to-use-projections)があるため、慎重に展開する必要があります。

プロジェクションを使用することをお勧めするのは、以下の場合です：

- データの完全な順序付けが必要です。プロジェクション内の式は理論的には`GROUP BY`を使用できますが、マテリアライズドビューは集約を維持するのにより効果的です。クエリオプティマイザは、簡単な再順序付けを行うプロジェクションをより多く活用する可能性があります。すなわち、`SELECT * ORDER BY x`。ユーザーはこの式でカラムのサブセットを選択して、ストレージのフットプリントを削減できます。
- ユーザーがデータを2回書き込むことによるストレージのフットプリントとオーバーヘッドの増加を受け入れることができる。挿入速度への影響をテストし、[ストレージオーバーヘッドを評価する](/data-compression/compression-in-clickhouse)。

:::note
バージョン25.5以降、ClickHouseはプロジェクションにおいて仮想カラム`_part_offset`をサポートしています。これにより、プロジェクションをよりスペース効率的に保存できる方法が解放されます。

詳細については["プロジェクション"](/data-modeling/projections)を参照してください。
:::

## 非正規化 {#denormalization}

Postgresはリレーショナルデータベースであるため、そのデータモデルは高度に[正規化](https://en.wikipedia.org/wiki/Database_normalization)されており、しばしば数百のテーブルを含みます。ClickHouseでは、JOINパフォーマンスを最適化するために非正規化が有益な場合があります。

ClickHouseにおけるStack Overflowデータセットの非正規化の利点を示す[ガイド](/data-modeling/denormalization)を参照してください。

これで、PostgresからClickHouseに移行するユーザー向けの基本ガイドが完了しました。Postgresから移行するユーザーには、[ClickHouseでのデータモデル化ガイド](/data-modeling/schema-design)を読むことをお勧めします。より高度なClickHouse機能について学ぶことができます。
