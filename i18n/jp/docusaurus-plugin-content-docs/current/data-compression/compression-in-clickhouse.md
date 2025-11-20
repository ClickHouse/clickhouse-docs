---
slug: /data-compression/compression-in-clickhouse
title: 'ClickHouse における圧縮'
description: 'ClickHouse の圧縮アルゴリズムの選択'
keywords: ['compression', 'codec', 'encoding']
doc_type: 'reference'
---

ClickHouse のクエリ性能を支えている要因の 1 つが圧縮です。

ディスク上のデータ量が少ないほど、I/O が減り、クエリや挿入が高速になります。ほとんどの場合、CPU に対する圧縮アルゴリズムのオーバーヘッドは、I/O 削減効果によって相殺されます。そのため、ClickHouse のクエリを高速に保つうえでは、まずデータの圧縮率の改善に注力すべきです。

> ClickHouse がこれほど高い圧縮率を実現できる理由については、[この記事](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) を参照することをお勧めします。要約すると、カラム指向データベースであるため、値はカラム単位で順に書き出されます。これらの値がソートされていれば、同じ値が互いに隣り合って並びます。圧縮アルゴリズムは、このような連続したデータパターンを利用します。さらに ClickHouse には、ユーザーが圧縮手法をより細かくチューニングできる codec と、細かい粒度のデータ型が用意されています。

ClickHouse における圧縮は、主に次の 3 つの要因の影響を受けます。
- ordering key
- データ型
- 使用される codec

これらはすべてスキーマで設定されます。



## 圧縮を最適化するための適切なデータ型の選択 {#choose-the-right-data-type-to-optimize-compression}

Stack Overflowデータセットを例として使用します。`posts`テーブルの以下のスキーマについて圧縮統計を比較してみましょう:

- `posts` - 型最適化されていないスキーマで、ORDER BY キーなし。
- `posts_v3` - 各カラムに適切な型とビットサイズを持つ型最適化されたスキーマで、ORDER BY キーは`(PostTypeId, toDate(CreationDate), CommentCount)`。

以下のクエリを使用して、各カラムの現在の圧縮サイズと非圧縮サイズを測定できます。ORDER BY キーのない初期の最適化されていないスキーマ`posts`のサイズを確認してみましょう。

```sql
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'posts'
GROUP BY name

┌─name──────────────────┬─compressed_size─┬─uncompressed_size─┬───ratio────┐
│ Body                  │ 46.14 GiB       │ 127.31 GiB        │ 2.76       │
│ Title                 │ 1.20 GiB        │ 2.63 GiB          │ 2.19       │
│ Score                 │ 84.77 MiB       │ 736.45 MiB        │ 8.69       │
│ Tags                  │ 475.56 MiB      │ 1.40 GiB          │ 3.02       │
│ ParentId              │ 210.91 MiB      │ 696.20 MiB        │ 3.3        │
│ Id                    │ 111.17 MiB      │ 736.45 MiB        │ 6.62       │
│ AcceptedAnswerId      │ 81.55 MiB       │ 736.45 MiB        │ 9.03       │
│ ClosedDate            │ 13.99 MiB       │ 517.82 MiB        │ 37.02      │
│ LastActivityDate      │ 489.84 MiB      │ 964.64 MiB        │ 1.97       │
│ CommentCount          │ 37.62 MiB       │ 565.30 MiB        │ 15.03      │
│ OwnerUserId           │ 368.98 MiB      │ 736.45 MiB        │ 2          │
│ AnswerCount           │ 21.82 MiB       │ 622.35 MiB        │ 28.53      │
│ FavoriteCount         │ 280.95 KiB      │ 508.40 MiB        │ 1853.02    │
│ ViewCount             │ 95.77 MiB       │ 736.45 MiB        │ 7.69       │
│ LastEditorUserId      │ 179.47 MiB      │ 736.45 MiB        │ 4.1        │
│ ContentLicense        │ 5.45 MiB        │ 847.92 MiB        │ 155.5      │
│ OwnerDisplayName      │ 14.30 MiB       │ 142.58 MiB        │ 9.97       │
│ PostTypeId            │ 20.93 MiB       │ 565.30 MiB        │ 27         │
│ CreationDate          │ 314.17 MiB      │ 964.64 MiB        │ 3.07       │
│ LastEditDate          │ 346.32 MiB      │ 964.64 MiB        │ 2.79       │
│ LastEditorDisplayName │ 5.46 MiB        │ 124.25 MiB        │ 22.75      │
│ CommunityOwnedDate    │ 2.21 MiB        │ 509.60 MiB        │ 230.94     │
└───────────────────────┴─────────────────┴───────────────────┴────────────┘
```

<details>
   
<summary>コンパクトパートとワイドパートに関する注記</summary>


`compressed_size`または`uncompressed_size`の値が`0`と表示される場合、パートのタイプが`wide`ではなく`compact`であることが原因の可能性があります([`system.parts`](/operations/system-tables/parts)の`part_type`の説明を参照)。
パート形式は[`min_bytes_for_wide_part`](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)と[`min_rows_for_wide_part`](/operations/settings/merge-tree-settings#min_rows_for_wide_part)の設定によって制御されます。挿入されたデータが前述の設定値を超えないパートになる場合、そのパートはwideではなくcompactとなり、`compressed_size`や`uncompressed_size`の値は表示されません。

実例を示します:

```sql title="Query"
-- compactパートを持つテーブルを作成
CREATE TABLE compact (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number
AS SELECT * FROM numbers(100000); -- min_bytes_for_wide_partのデフォルト値10485760を超えるほど大きくない

-- パートのタイプを確認
SELECT table, name, part_type from system.parts where table = 'compact';

-- compactテーブルの圧縮済みおよび非圧縮のカラムサイズを取得
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'compact'
GROUP BY name;

-- wideパートを持つテーブルを作成
CREATE TABLE wide (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number
SETTINGS min_bytes_for_wide_part=0
AS SELECT * FROM numbers(100000);

-- パートのタイプを確認
SELECT table, name, part_type from system.parts where table = 'wide';

-- wideテーブルの圧縮済みおよび非圧縮のサイズを取得
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'wide'
GROUP BY name;
```

```response title="Response"
   ┌─table───┬─name──────┬─part_type─┐
1. │ compact │ all_1_1_0 │ Compact   │
   └─────────┴───────────┴───────────┘
   ┌─name───┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
1. │ number │ 0.00 B          │ 0.00 B            │   nan │
   └────────┴─────────────────┴───────────────────┴───────┘
   ┌─table─┬─name──────┬─part_type─┐
1. │ wide  │ all_1_1_0 │ Wide      │
   └───────┴───────────┴───────────┘
   ┌─name───┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
1. │ number │ 392.31 KiB      │ 390.63 KiB        │     1 │
   └────────┴─────────────────┴───────────────────┴───────┘
```

</details>

ここでは圧縮済みサイズと非圧縮サイズの両方を表示しています。どちらも重要です。圧縮済みサイズは、ディスクから読み取る必要があるデータ量に相当します。これはクエリパフォーマンス(およびストレージコスト)を向上させるために最小化すべき値です。このデータは読み取り前に解凍する必要があります。非圧縮サイズの大きさは、使用されるデータ型に依存します。このサイズを最小化することで、クエリのメモリオーバーヘッドとクエリで処理する必要があるデータ量が削減され、キャッシュの利用効率が向上し、最終的にクエリ時間が改善されます。

> 上記のクエリは、systemデータベースの`columns`テーブルに依存しています。このデータベースはClickHouseによって管理されており、クエリパフォーマンスメトリクスからバックグラウンドクラスタログまで、有用な情報の宝庫です。詳しく知りたい読者には、["System Tables and a Window into the Internals of ClickHouse"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)および関連記事[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)をお勧めします。

テーブルの合計サイズを要約するには、上記のクエリを簡略化できます:


```sql
SELECT formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'posts'

┌─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ 50.16 GiB       │ 143.47 GiB        │  2.86 │
└─────────────────┴───────────────────┴───────┘
```

最適化された型と並び替えキーを持つテーブル `posts_v3` に対して同じクエリを実行すると、非圧縮サイズと圧縮サイズの両方が大幅に削減されていることが分かります。

```sql
SELECT
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE `table` = 'posts_v3'

┌─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ 25.15 GiB       │ 68.87 GiB         │  2.74 │
└─────────────────┴───────────────────┴───────┘
```

カラムごとの詳細な内訳を見ると、圧縮前にデータを並べ替え、適切な型を使用したことで、`Body`、`Title`、`Tags`、`CreationDate` 各カラムで大きなデータ削減効果が得られていることが分かります。

```sql
SELECT
    name,
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE `table` = 'posts_v3'
GROUP BY name
```


┌─name──────────────────┬─compressed&#95;size─┬─uncompressed&#95;size─┬───ratio─┐
│ Body                  │ 23.10 GiB       │ 63.63 GiB         │    2.75 │
│ Title                 │ 614.65 MiB      │ 1.28 GiB          │    2.14 │
│ Score                 │ 40.28 MiB       │ 227.38 MiB        │    5.65 │
│ Tags                  │ 234.05 MiB      │ 688.49 MiB        │    2.94 │
│ ParentId              │ 107.78 MiB      │ 321.33 MiB        │    2.98 │
│ Id                    │ 159.70 MiB      │ 227.38 MiB        │    1.42 │
│ AcceptedAnswerId      │ 40.34 MiB       │ 227.38 MiB        │    5.64 │
│ ClosedDate            │ 5.93 MiB        │ 9.49 MiB          │     1.6 │
│ LastActivityDate      │ 246.55 MiB      │ 454.76 MiB        │    1.84 │
│ CommentCount          │ 635.78 KiB      │ 56.84 MiB         │   91.55 │
│ OwnerUserId           │ 183.86 MiB      │ 227.38 MiB        │    1.24 │
│ AnswerCount           │ 9.67 MiB        │ 113.69 MiB        │   11.76 │
│ FavoriteCount         │ 19.77 KiB       │ 147.32 KiB        │    7.45 │
│ ViewCount             │ 45.04 MiB       │ 227.38 MiB        │    5.05 │
│ LastEditorUserId      │ 86.25 MiB       │ 227.38 MiB        │    2.64 │
│ ContentLicense        │ 2.17 MiB        │ 57.10 MiB         │   26.37 │
│ OwnerDisplayName      │ 5.95 MiB        │ 16.19 MiB         │    2.72 │
│ PostTypeId            │ 39.49 KiB       │ 56.84 MiB         │ 1474.01 │
│ CreationDate          │ 181.23 MiB      │ 454.76 MiB        │    2.51 │
│ LastEditDate          │ 134.07 MiB      │ 454.76 MiB        │    3.39 │
│ LastEditorDisplayName │ 2.15 MiB        │ 6.25 MiB          │    2.91 │
│ CommunityOwnedDate    │ 824.60 KiB      │ 1.34 MiB          │    1.66 │
└───────────────────────┴─────────────────┴───────────────────┴─────────┘

```
```


## 適切なカラム圧縮コーデックの選択 {#choosing-the-right-column-compression-codec}

カラム圧縮コーデックを使用することで、各カラムのエンコードと圧縮に使用されるアルゴリズム(およびその設定)を変更できます。

エンコーディングと圧縮は、データサイズを削減するという同じ目的を持ちながらも、動作が若干異なります。エンコーディングはデータに対してマッピングを適用し、データ型の特性を活用して関数に基づいて値を変換します。一方、圧縮はバイトレベルでデータを圧縮する汎用的なアルゴリズムを使用します。

通常、圧縮が使用される前にエンコーディングが最初に適用されます。異なるエンコーディングと圧縮アルゴリズムは異なる値の分布に対して効果的であるため、データを理解する必要があります。

ClickHouseは多数のコーデックと圧縮アルゴリズムをサポートしています。以下は重要度順の推奨事項です:

| 推奨事項                                | 理由                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ZSTD`を基本とする**                        | `ZSTD`圧縮は最高の圧縮率を提供します。`ZSTD(1)`は最も一般的な型のデフォルトとすべきです。数値を変更することで、より高い圧縮率を試すことができます。圧縮コストの増加(挿入の遅延)に対して、3より大きい値で十分な利点が得られることはほとんどありません。                                                                                                                                      |
| **日付と整数シーケンスには`Delta`**    | `Delta`ベースのコーデックは、単調なシーケンスや連続する値の差分が小さい場合に効果的です。より具体的には、Deltaコーデックは微分が小さな数値を生成する場合に効果的です。そうでない場合は、`DoubleDelta`を試す価値があります(ただし、`Delta`の一次微分が既に非常に小さい場合は、通常ほとんど効果がありません)。単調な増分が均一なシーケンス(例: DateTimeフィールド)は、さらに良好に圧縮されます。 |
| **`Delta`は`ZSTD`を改善する**                   | `ZSTD`は差分データに対して効果的なコーデックです。逆に、差分エンコーディングは`ZSTD`圧縮を改善できます。`ZSTD`が存在する場合、他のコーデックがさらなる改善を提供することはほとんどありません。                                                                                                                                                                                                                                                 |
| **可能であれば`ZSTD`より`LZ4`**             | `LZ4`と`ZSTD`で同等の圧縮が得られる場合は、より高速な展開とより少ないCPU使用量を提供する前者を優先してください。ただし、ほとんどの場合、`ZSTD`は`LZ4`を大幅に上回ります。これらのコーデックの一部は、`LZ4`と組み合わせることで、コーデックなしの`ZSTD`と同等の圧縮を提供しながら、より高速に動作する場合があります。ただし、これはデータ固有であり、テストが必要です。                              |
| **疎なデータや小さな範囲には`T64`**          | `T64`は疎なデータやブロック内の範囲が小さい場合に効果的です。ランダムな数値には`T64`を使用しないでください。                                                                                                                                                                                                                                                                                                                                      |
| **未知のパターンには`Gorilla`と`T64`?** | データに未知のパターンがある場合は、`Gorilla`と`T64`を試す価値があるかもしれません。                                                                                                                                                                                                                                                                                                                                                                   |
| **ゲージデータには`Gorilla`**                  | `Gorilla`は浮動小数点データ、特にゲージ測定値(すなわち、ランダムなスパイク)を表すデータに対して効果的です。                                                                                                                                                                                                                                                                                                                                         |

その他のオプションについては[こちら](/sql-reference/statements/create/table#column_compression_codec)を参照してください。

以下では、`Id`、`ViewCount`、`AnswerCount`に対して`Delta`コーデックを指定しています。これらはソートキーと線形相関があり、したがってDeltaエンコーディングの恩恵を受けるはずだという仮説に基づいています。

```sql
CREATE TABLE posts_v4
(
        `Id` Int32 CODEC(Delta, ZSTD),
        `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
        `AcceptedAnswerId` UInt32,
        `CreationDate` DateTime64(3, 'UTC'),
        `Score` Int32,
        `ViewCount` UInt32 CODEC(Delta, ZSTD),
        `Body` String,
        `OwnerUserId` Int32,
        `OwnerDisplayName` String,
        `LastEditorUserId` Int32,
        `LastEditorDisplayName` String,
        `LastEditDate` DateTime64(3, 'UTC'),
        `LastActivityDate` DateTime64(3, 'UTC'),
        `Title` String,
        `Tags` String,
        `AnswerCount` UInt16 CODEC(Delta, ZSTD),
        `CommentCount` UInt8,
        `FavoriteCount` UInt8,
        `ContentLicense` LowCardinality(String),
        `ParentId` String,
        `CommunityOwnedDate` DateTime64(3, 'UTC'),
        `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```


これらのカラムの圧縮改善結果を以下に示します：

```sql
SELECT
    `table`,
    name,
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE (name IN ('Id', 'ViewCount', 'AnswerCount')) AND (`table` IN ('posts_v3', 'posts_v4'))
GROUP BY
    `table`,
    name
ORDER BY
    name ASC,
    `table` ASC

┌─table────┬─name────────┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ posts_v3 │ AnswerCount │ 9.67 MiB        │ 113.69 MiB        │ 11.76 │
│ posts_v4 │ AnswerCount │ 10.39 MiB       │ 111.31 MiB        │ 10.71 │
│ posts_v3 │ Id          │ 159.70 MiB      │ 227.38 MiB        │  1.42 │
│ posts_v4 │ Id          │ 64.91 MiB       │ 222.63 MiB        │  3.43 │
│ posts_v3 │ ViewCount   │ 45.04 MiB       │ 227.38 MiB        │  5.05 │
│ posts_v4 │ ViewCount   │ 52.72 MiB       │ 222.63 MiB        │  4.22 │
└──────────┴─────────────┴─────────────────┴───────────────────┴───────┘

6 rows in set. Elapsed: 0.008 sec
```

### ClickHouse Cloudにおける圧縮 {#compression-in-clickhouse-cloud}

ClickHouse Cloudでは、デフォルトで`ZSTD`圧縮アルゴリズム（デフォルト値1）を使用しています。このアルゴリズムの圧縮速度は圧縮レベルによって変動します（レベルが高いほど低速）が、解凍時には一貫して高速である（変動幅は約20%）という利点があり、並列化も可能です。過去のテストでは、このアルゴリズムは十分に効果的であることが多く、コーデックと組み合わせた`LZ4`を上回る性能を発揮することもあります。ほとんどのデータ型と情報分布に対して効果的であるため、汎用的なデフォルトとして適切な選択であり、最適化を行わなくても初期段階から優れた圧縮性能を実現できる理由となっています。
