---
slug: /data-compression/compression-in-clickhouse
title: 'ClickHouse における圧縮'
description: 'ClickHouse の圧縮アルゴリズムの選択'
keywords: ['compression', 'codec', 'encoding']
doc_type: 'reference'
---

ClickHouse のクエリ性能を支える要素の 1 つが圧縮です。

ディスク上のデータ量が少ないほど I/O が減り、クエリや挿入が高速になります。ほとんどの場合、圧縮アルゴリズムに伴う CPU オーバーヘッドは、I/O 削減によって十分に相殺されます。そのため、ClickHouse のクエリを高速にしたい場合は、まずデータの圧縮効率を改善することに注力すべきです。

> ClickHouse がなぜこれほど高い圧縮率を実現できるのかについては、[こちらの記事](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) を読むことをおすすめします。要するに、ClickHouse のカラム指向データベースは値をカラム順に書き込みます。これらの値がソートされると、同一の値が互いに隣接して配置されるようになり、圧縮アルゴリズムはデータ内の連続したパターンを利用できます。さらに ClickHouse にはコーデックときめ細かなデータ型が用意されており、圧縮をより簡単にチューニングできます。

ClickHouse における圧縮は、主に次の 3 つの要因の影響を受けます。

- オーダリングキー
- データ型
- 使用するコーデック

これらはすべてスキーマを通じて設定されます。

## 圧縮を最適化するために適切なデータ型を選択する \{#choose-the-right-data-type-to-optimize-compression\}

Stack Overflow のデータセットを例として使用します。`posts` テーブルに対して、次のスキーマにおける圧縮に関する統計情報を比較します。

* `posts` - データ型の最適化が行われておらず、並び替えキーも定義されていないスキーマ。
* `posts_v3` - 各カラムに対して適切なデータ型とビットサイズを持ち、並び替えキー `(PostTypeId, toDate(CreationDate), CommentCount)` が定義されている、データ型が最適化されたスキーマ。

次のクエリを使用して、各カラムの現在の圧縮済みサイズと非圧縮時のサイズを測定できます。まず、並び替えキーのない最初のスキーマ `posts` のサイズを確認してみましょう。

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
   
<summary>コンパクトパーツとワイドパーツに関する注意</summary>

`compressed_size` または `uncompressed_size` の値が `0` になっている場合、パーツのタイプが `wide` ではなく `compact` であることが原因の可能性があります（[`system.parts`](/operations/system-tables/parts) の `part_type` の説明を参照してください）。
パーツのフォーマットは、設定項目 [`min_bytes_for_wide_part`](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) および [`min_rows_for_wide_part`](/operations/settings/merge-tree-settings#min_rows_for_wide_part) によって制御されており、挿入されたデータによって生成されるパーツがこれらの設定値を超えない場合、そのパーツは `wide` ではなく `compact` となり、`compressed_size` や `uncompressed_size` の値は表示されません。

例を示します:

```sql title="Query"
-- Create a table with compact parts
CREATE TABLE compact (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number 
AS SELECT * FROM numbers(100000); -- Not big enough to exceed default of min_bytes_for_wide_part = 10485760

-- Check the type of the parts
SELECT table, name, part_type from system.parts where table = 'compact';

-- Get the compressed and uncompressed column sizes for the compact table
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'compact'
GROUP BY name;

-- Create a table with wide parts 
CREATE TABLE wide (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number
SETTINGS min_bytes_for_wide_part=0
AS SELECT * FROM numbers(100000);

-- Check the type of the parts
SELECT table, name, part_type from system.parts where table = 'wide';

-- Get the compressed and uncompressed sizes for the wide table
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

ここでは圧縮サイズと非圧縮サイズの両方を示しています。いずれも重要です。圧縮サイズはディスクから読み出す必要のある量に相当し、クエリパフォーマンス（およびストレージコスト）の観点から最小化したい値です。このデータは読み取り前に伸長する必要があります。そのときの非圧縮サイズは、このケースでは使用しているデータ型に依存します。このサイズを小さくすることで、クエリのメモリオーバーヘッドと、クエリで処理しなければならないデータ量を削減でき、キャッシュの利用効率が向上し、最終的にクエリ時間を短縮できます。

> 上記のクエリは、system データベース内の `columns` テーブルに依存しています。このデータベースは ClickHouse によって管理されており、クエリパフォーマンスメトリクスからバックグラウンドのクラスタログまで、有用な情報の宝庫です。興味のある読者には「[System Tables and a Window into the Internals of ClickHouse](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)」および関連する記事[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse) を推奨します。 

テーブルの総サイズを求めるには、上記のクエリを次のように単純化できます。

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

最適化されたデータ型とソートキーを持つテーブル `posts_v3` に対して同じクエリを実行すると、非圧縮時と圧縮時のサイズがいずれも大きく削減されていることがわかります。

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

カラムごとの詳細な内訳を見ると、圧縮を行う前にデータを並べ替え、適切な型を使用することで、`Body`、`Title`、`Tags`、`CreationDate` カラムで大きな削減効果が得られていることが分かります。


```sql
SELECT
    name,
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE `table` = 'posts_v3'
GROUP BY name

┌─name──────────────────┬─compressed_size─┬─uncompressed_size─┬───ratio─┐
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


## 適切なカラム圧縮コーデックの選択 \{#choosing-the-right-column-compression-codec\}

カラム圧縮コーデックを使うと、各カラムをエンコードおよび圧縮するために使用されるアルゴリズム（とその設定）を変更できます。

エンコーディングと圧縮は、どちらもデータサイズを削減するという同じ目的を持ちながら、仕組みは少し異なります。エンコーディングはデータ型の特性を利用して、関数に基づくマッピングを適用し、値を変換します。対照的に、圧縮は汎用的なアルゴリズムを使い、バイトレベルでデータを圧縮します。

通常は、圧縮を行う前にまずエンコーディングが適用されます。エンコーディングや圧縮アルゴリズムによって、得意とする値の分布が異なるため、自分たちのデータを理解しておく必要があります。

ClickHouse は多くのコーデックと圧縮アルゴリズムをサポートしています。以下は重要度順の推奨事項です:

| 推奨事項                            | 理由                                                                                                                                                                                                                                      |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ZSTD` を基本とする**               | `ZSTD` 圧縮は最も高い圧縮率を提供します。`ZSTD(1)` はほとんどの一般的な型に対するデフォルトとすべきです。引数の数値を変更することで、より高い圧縮率を試すことができます。挿入が遅くなるなど圧縮コストが増える割に、3 を超える値では有益な差が得られることはほとんどありません。                                                                                       |
| **日付・整数シーケンスには `Delta`**        | `Delta` ベースのコーデックは、単調なシーケンスや、連続する値の差分（デルタ）が小さい場合に有効です。より具体的には、差分の結果が小さい値になる場合に `Delta` コーデックはよく機能します。そうでない場合は、`DoubleDelta` を試す価値があります（`Delta` による一次の差分がすでに十分小さい場合は、追加の効果はあまりありません）。単調増加の増分が一定のシーケンス、例えば DateTime フィールドなどは、さらによく圧縮されます。 |
| **`Delta` は `ZSTD` を改善する**      | `ZSTD` はデルタデータに対して有効なコーデックであり、逆にデルタエンコーディングにより `ZSTD` 圧縮を改善できます。`ZSTD` を使用している場合、その他のコーデックがさらに改善をもたらすことはまれです。                                                                                                                           |
| **可能であれば `ZSTD` より `LZ4`**      | `LZ4` と `ZSTD` で同等の圧縮率が得られる場合は、前者を優先してください。`LZ4` の方がデコードが速く、必要な CPU も少ないためです。ただし多くの場合、`ZSTD` は `LZ4` を大きく上回る圧縮性能を示します。これらのコーデックの一部は、`ZSTD` 単体と同様の圧縮率を維持しつつ、`LZ4` と組み合わせるとより高速に動作する場合があります。ただしこれはデータ固有であり、検証が必要です。                       |
| **スパースまたは狭い範囲には `T64`**         | `T64` はスパースなデータ、またはブロック内の値の範囲が小さい場合に有効です。乱数には `T64` は避けてください。                                                                                                                                                                           |
| **パターン不明なら `Gorilla` と `T64`?** | データのパターンが不明な場合は、`Gorilla` や `T64` を試してみる価値があります。                                                                                                                                                                                        |
| **ゲージデータには `Gorilla`**          | `Gorilla` は浮動小数点データ、特にゲージ値（ランダムなスパイクを示す値）を表すデータに対して有効な場合があります。                                                                                                                                                                          |

他のオプションについては[こちら](/sql-reference/statements/create/table#column_compression_codec)を参照してください。

以下では、`Id`、`ViewCount`、`AnswerCount` に対して `Delta` コーデックを指定しています。これらがソートキーと線形に相関しており、Delta エンコーディングの恩恵を受けると仮定しています。

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

これらのカラムにおける圧縮率の改善は次のとおりです。


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


### Compression in ClickHouse Cloud \\{#compression-in-clickhouse-cloud\\}

ClickHouse Cloud では、デフォルトで `ZSTD` 圧縮アルゴリズム（圧縮レベルのデフォルト値は 1）を使用しています。圧縮レベル（高いほど低速）に応じてこのアルゴリズムの圧縮速度は変動しますが、伸長時には一貫して高速（およそ 20% 程度のばらつき）であるうえ、並列化が可能であるという利点があります。過去のテスト結果からも、このアルゴリズムは多くの場合十分に効果的であり、コーデックと組み合わせた `LZ4` を上回ることさえあることが示唆されています。ほとんどのデータ型および情報分布に対して有効であるため、汎用的なデフォルトとして妥当であり、最適化を行わなくてもデフォルトの圧縮結果がすでに非常に優れている理由となっています。