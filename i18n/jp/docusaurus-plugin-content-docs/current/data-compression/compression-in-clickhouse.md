---
slug: /data-compression/compression-in-clickhouse
title: 'ClickHouse における圧縮'
description: 'ClickHouse の圧縮アルゴリズムの選択'
keywords: ['compression', 'codec', 'encoding']
doc_type: 'reference'
---

ClickHouse のクエリ性能を支えている要素の 1 つが圧縮です。

ディスク上のデータ量が少ないほど I/O が減り、クエリや挿入は高速になります。ほとんどの場合、CPU に対する圧縮アルゴリズムのオーバーヘッドは、I/O 削減の効果によって十分に相殺されます。そのため、ClickHouse のクエリを高速化するうえでは、まずデータの圧縮効率を高めることに注力すべきです。

> ClickHouse がなぜこれほど高い圧縮率を実現できるのかについては、[この記事](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)を参照することをお勧めします。簡単に言うと、ClickHouse のカラム指向データベースは値をカラム順に書き込みます。これらの値がソートされていると、同一の値が互いに隣り合う位置に配置され、圧縮アルゴリズムはデータ内の連続したパターンを利用できます。さらにそのうえで、ClickHouse には圧縮をさらに簡単にチューニングできるコーデックと、きめ細かなデータ型が用意されています。

ClickHouse における圧縮は、主に次の 3 つの要因の影響を受けます。

- オーダリングキー（ORDER BY キー）
- データ型
- 使用するコーデック

これらはすべてスキーマによって設定されます。

## 圧縮を最適化するために適切なデータ型を選択する {#choose-the-right-data-type-to-optimize-compression}

例として Stack Overflow データセットを使用します。`posts` テーブルに対して、次のスキーマの圧縮統計を比較します。

* `posts` - データ型の最適化が行われておらず、ソートキー（ordering key）もないスキーマ。
* `posts_v3` - 各カラムに対して適切な型とビットサイズを指定し、ソートキー（ordering key） `(PostTypeId, toDate(CreationDate), CommentCount)` を持つ、データ型が最適化されたスキーマ。

次のクエリを使用して、各カラムの現在の圧縮後および非圧縮時のサイズを測定できます。まず、ソートキーを持たない、最初に最適化対象とするスキーマ `posts` のサイズを確認します。

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

`compressed_size` または `uncompressed_size` の値が `0` になっている場合、パーツのタイプが `wide` ではなく `compact` であることが原因の可能性があります（[`system.parts`](/operations/system-tables/parts) の `part_type` の説明を参照）。パーツの形式は、[`min_bytes_for_wide_part`](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) および [`min_rows_for_wide_part`](/operations/settings/merge-tree-settings#min_rows_for_wide_part) の設定によって制御されます。つまり、挿入されたデータによって生成されたパーツが、これらの設定値を超えない場合、そのパーツは wide ではなく compact になり、`compressed_size` や `uncompressed_size` の値は 0 のままになります。

以下に例を示します。

```sql title="Query"
-- コンパクトパーツを持つテーブルを作成
CREATE TABLE compact (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number 
AS SELECT * FROM numbers(100000); -- min_bytes_for_wide_part = 10485760 のデフォルト値を超えるほど大きくない

-- パーツのタイプを確認
SELECT table, name, part_type from system.parts where table = 'compact';

-- compact テーブルの圧縮および非圧縮カラムサイズを取得
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'compact'
GROUP BY name;

-- wide パーツを持つテーブルを作成
CREATE TABLE wide (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number
SETTINGS min_bytes_for_wide_part=0
AS SELECT * FROM numbers(100000);

-- パーツのタイプを確認
SELECT table, name, part_type from system.parts where table = 'wide';

-- wide テーブルの圧縮および非圧縮サイズを取得
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

ここでは、圧縮サイズと非圧縮サイズの両方を示しています。いずれも重要です。圧縮サイズはディスクから読み取る必要がある量に相当し、これはクエリ性能（およびストレージコスト）の観点から最小化したいものです。このデータは読み取り前に伸長（解凍）される必要があります。非圧縮時のサイズは、このケースでは使用しているデータ型に依存します。このサイズを小さくすることで、クエリのメモリオーバーヘッドとクエリで処理しなければならないデータ量が削減され、キャッシュの有効活用につながり、最終的にはクエリ時間の短縮に寄与します。

> 上記のクエリは、system データベース内の `columns` テーブルに依存しています。このデータベースは ClickHouse によって管理されており、クエリ性能メトリクスからバックグラウンドのクラスタログまで、有用な情報の宝庫です。興味のある読者には ["System Tables and a Window into the Internals of ClickHouse"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables) と、それに関連する記事[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse) を推奨します。 

テーブルの合計サイズを集計するには、上記のクエリを次のように簡略化できます。

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

最適化された型とソートキーを持つテーブル `posts_v3` に対して同じクエリを実行すると、非圧縮時と圧縮後のサイズがいずれも大幅に小さくなっていることが確認できます。

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

カラムごとの詳細な内訳を見ると、データを圧縮する前に並べ替え、適切な型を使用することで、`Body`、`Title`、`Tags`、`CreationDate` カラムでかなりの容量削減が達成されていることがわかります。


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


## 適切なカラム圧縮コーデックの選択 {#choosing-the-right-column-compression-codec}

カラム圧縮コーデックを使用すると、各カラムのエンコードおよび圧縮に用いられるアルゴリズム（およびその設定）を変更できます。

エンコーディングと圧縮は、どちらもデータサイズを削減するという同じ目的を持ちながら、動作は少し異なります。エンコーディングはデータ型の特性を利用して、関数に基づき値を変換するマッピングをデータに適用します。対照的に、圧縮は汎用的なアルゴリズムを使用して、バイトレベルでデータを圧縮します。

通常、圧縮を行う前に、まずエンコーディングが適用されます。異なるエンコーディングと圧縮アルゴリズムは、それぞれ異なる値の分布に対して効果的であるため、自身が扱うデータを理解しておく必要があります。

ClickHouse は多数のコーデックと圧縮アルゴリズムをサポートしています。以下は重要度順のいくつかの推奨事項です。

| Recommendation                                | Reasoning                                                                                                                                                                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ZSTD` all the way**                        | `ZSTD` 圧縮は最も高い圧縮率を提供します。`ZSTD(1)` は、ほとんどの一般的な型に対するデフォルトとすべきです。数値を変更することで、より高い圧縮率を試すことができますが、3 を超える値では圧縮コストの増加（挿入の遅延）に見合う十分なメリットはほとんど見られません。                                                                                                       |
| **`Delta` for date and integer sequences**    | `Delta` ベースのコーデックは、単調増加するシーケンスや、連続する値の差分（デルタ）が小さい場合に有効に機能します。より具体的には、差分の結果が小さな値になる場合に Delta コーデックは良好に動作します。そうでない場合は、`DoubleDelta` を試す価値があります（`Delta` による差分がすでに非常に小さい場合は、これを追加しても効果はほとんど増えません）。単調増加の増分が一定であるシーケンス、例えば DateTime フィールドは、さらに良く圧縮されます。 |
| **`Delta` improves `ZSTD`**                   | `ZSTD` はデルタデータに対して有効なコーデックであり、逆にデルタエンコーディングは `ZSTD` 圧縮を改善できます。`ZSTD` を使用している場合、他のコーデックがさらなる改善を提供することは稀です。                                                                                                                                         |
| **`LZ4` over `ZSTD` if possible**             | `LZ4` と `ZSTD` の圧縮率が同等であれば、より高速な伸長と少ない CPU 使用量を提供するため、`LZ4` を優先してください。ただし、ほとんどのケースでは `ZSTD` が `LZ4` を大きく上回ります。いくつかのコーデックは、コーデックなしの `ZSTD` と同等の圧縮を提供しつつ、`LZ4` と組み合わせることでより高速に動作する場合があります。ただし、これはデータに依存し、検証が必要です。                                   |
| **`T64` for sparse or small ranges**          | `T64` はスパースなデータ、あるいはブロック内の値の範囲が小さい場合に有効です。乱数に対しては `T64` の使用を避けてください。                                                                                                                                                                              |
| **`Gorilla` and `T64` for unknown patterns?** | データのパターンが不明な場合、`Gorilla` と `T64` を試す価値があります。                                                                                                                                                                                                      |
| **`Gorilla` for gauge data**                  | `Gorilla` は浮動小数点データ、特にゲージの読み取り、すなわちランダムなスパイクを表すデータに対して有効な場合があります。                                                                                                                                                                                 |

その他のオプションについては[こちら](/sql-reference/statements/create/table#column_compression_codec)を参照してください。

以下では、`Id`、`ViewCount`、`AnswerCount` に対して `Delta` コーデックを指定しています。これらがソートキーと線形に相関しており、そのため Delta エンコーディングの効果が見込めると仮定しています。

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

これらのカラムにおける圧縮の改善結果を以下に示します。


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


### ClickHouse Cloud における圧縮 {#compression-in-clickhouse-cloud}

ClickHouse Cloud では、デフォルトで `ZSTD` 圧縮アルゴリズム（圧縮レベルのデフォルト値は 1）を使用しています。このアルゴリズムは圧縮レベル（高いほど低速）によって圧縮速度が変動しますが、解凍（伸長）時には常に高速である（おおよそ 20% 程度のばらつき）という利点があり、並列化にも適しています。過去のテスト結果からも、このアルゴリズムは多くの場合に十分な効果を発揮し、場合によってはコーデックと組み合わせた `LZ4` を上回ることが示唆されています。ほとんどのデータ型および情報分布に対して有効であり、汎用的なデフォルトとして妥当であるため、最適化を行わなくても、最初から採用している圧縮設定の品質がすでに非常に高い理由となっています。