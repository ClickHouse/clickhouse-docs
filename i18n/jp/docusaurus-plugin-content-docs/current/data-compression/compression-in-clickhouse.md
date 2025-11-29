---
slug: /data-compression/compression-in-clickhouse
title: 'ClickHouse における圧縮'
description: 'ClickHouse の圧縮アルゴリズムの選択'
keywords: ['圧縮', 'コーデック', 'エンコーディング']
doc_type: 'reference'
---

ClickHouse のクエリ性能を支える秘訣の 1 つが圧縮です。

ディスク上のデータ量が少ないほど、I/O が少なくなり、クエリや挿入が高速になります。多くの場合、どの圧縮アルゴリズムを使っても発生する CPU オーバーヘッドは、I/O 削減効果によって相殺されます。そのため、ClickHouse のクエリを高速にする際には、まずデータの圧縮を改善することに注力すべきです。

> ClickHouse がなぜこれほどデータをうまく圧縮できるのかについては、[こちらの記事](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) の参照をお勧めします。要約すると、ClickHouse はカラム指向データベースであり、値はカラム順に書き込まれます。これらの値がソートされている場合、同じ値が互いに隣接するようになります。圧縮アルゴリズムは、このような連続したデータパターンを利用します。さらに、ClickHouse にはコーデックと粒度の細かいデータ型が用意されており、ユーザーは圧縮手法をより細かくチューニングできます。

ClickHouse における圧縮は、主に次の 3 つの要因の影響を受けます:
- オーダリングキー
- データ型
- 使用されるコーデック

これらはすべてスキーマで設定されます。



## 圧縮を最適化するための適切なデータ型の選択 {#choose-the-right-data-type-to-optimize-compression}

Stack Overflowデータセットを例として使用します。`posts`テーブルの以下のスキーマについて圧縮統計を比較してみましょう:

- `posts` - 型最適化されていないスキーマで、順序キーなし。
- `posts_v3` - 各カラムに適切な型とビットサイズを持つ型最適化されたスキーマで、順序キー`(PostTypeId, toDate(CreationDate), CommentCount)`を使用。

以下のクエリを使用して、各カラムの現在の圧縮サイズと非圧縮サイズを測定できます。順序キーのない初期の最適化されていないスキーマ`posts`のサイズを確認してみましょう。

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


`compressed_size`または`uncompressed_size`の値が`0`と表示される場合、パートのタイプが`wide`ではなく`compact`であることが原因の可能性があります([`system.parts`](/operations/system-tables/parts)の`part_type`の説明を参照してください)。
パート形式は[`min_bytes_for_wide_part`](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)および[`min_rows_for_wide_part`](/operations/settings/merge-tree-settings#min_rows_for_wide_part)の設定によって制御されます。挿入されたデータが前述の設定値を超えないパートを生成する場合、パートはwideではなくcompactとなり、`compressed_size`または`uncompressed_size`の値は表示されません。

以下に例を示します:

```sql title="Query"
-- compactパートを持つテーブルを作成
CREATE TABLE compact (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number
AS SELECT * FROM numbers(100000); -- min_bytes_for_wide_part = 10485760のデフォルト値を超えるほど大きくない

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

ここでは圧縮済みサイズと非圧縮サイズの両方を示しています。どちらも重要です。圧縮済みサイズはディスクから読み取る必要があるデータ量に相当し、クエリパフォーマンス(およびストレージコスト)の観点から最小化すべきものです。このデータは読み取り前に解凍する必要があります。非圧縮サイズの大きさは、使用されるデータ型に依存します。このサイズを最小化することで、クエリのメモリオーバーヘッドとクエリで処理する必要があるデータ量が削減され、キャッシュの利用効率が向上し、最終的にクエリ時間が改善されます。

> 上記のクエリはsystemデータベースの`columns`テーブルに依存しています。このデータベースはClickHouseによって管理されており、クエリパフォーマンスメトリクスからバックグラウンドクラスタログまで、有用な情報の宝庫です。詳しく知りたい読者には["System Tables and a Window into the Internals of ClickHouse"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)および関連記事[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)をお勧めします。

テーブルの合計サイズを要約するには、上記のクエリを次のように簡略化できます:


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

最適化された型と並び替えキーを持つテーブル `posts_v3` に対して同じクエリを実行すると、非圧縮サイズと圧縮サイズの両方が大きく減少していることが分かります。

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

`Body`、`Title`、`Tags`、`CreationDate` 列の詳細な内訳を見ると、圧縮前にデータを並べ替え、適切な型を使用することで、これらの列の容量を大幅に削減できていることがわかります。

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

カラム圧縮コーデックを用いることで、各カラムのエンコードおよび圧縮に使用されるアルゴリズム（およびその設定）を変更できます。

エンコードと圧縮は、目的（データサイズの削減）は同じですが、動作が少し異なります。エンコードはデータ型の特性を利用し、関数に基づくマッピングを適用して値を変換します。一方、圧縮はより汎用的なアルゴリズムを用いて、バイトレベルでデータを圧縮します。

一般的には、圧縮を行う前にまずエンコードが適用されます。エンコードや圧縮アルゴリズムの有効性は値の分布によって異なるため、自分たちのデータを理解しておく必要があります。

ClickHouse は多数のコーデックと圧縮アルゴリズムをサポートしています。以下に、重要度順でいくつか推奨事項を示します。

| Recommendation                                | Reasoning                                                                                                                                                                                                                                     |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ZSTD` all the way**                        | `ZSTD` 圧縮は最も優れた圧縮率を提供します。`ZSTD(1)` は、ほとんどの一般的な型に対するデフォルトとすべきです。数値を変更することで、より高い圧縮率を試すことができます。ただし、圧縮コスト（挿入が遅くなる）の増大に対して、値を 3 より大きくしても十分なメリットが得られるケースはまれです。                                                                                      |
| **`Delta` for date and integer sequences**    | `Delta` ベースのコーデックは、単調増加（減少）シーケンスや連続する値の差分（デルタ）が小さい場合に有効です。より具体的には、隣接差分が小さい値を生成する場合に Delta コーデックは有効に機能します。そうでない場合は `DoubleDelta` を試す価値があります（ただし、`Delta` による 1 次差分がすでに十分小さい場合には、追加の効果はほとんどありません）。単調な増分が一定のシーケンスはさらによく圧縮されます（例: DateTime フィールド）。 |
| **`Delta` improves `ZSTD`**                   | `ZSTD` はデルタデータに対して効果的なコーデックであり、逆にデルタエンコードは `ZSTD` 圧縮を改善できます。`ZSTD` を使用している場合、他のコーデックがそれ以上の改善をもたらすことはほとんどありません。                                                                                                                                |
| **`LZ4` over `ZSTD` if possible**             | `LZ4` と `ZSTD` で同程度の圧縮率が得られる場合は、展開が高速で CPU 使用量も少ない `LZ4` を優先してください。ただし、ほとんどのケースでは `ZSTD` は `LZ4` を大きく上回る圧縮性能を発揮します。これらのコーデックの中には、単独の `ZSTD` と同等の圧縮率を維持しつつ、`LZ4` と組み合わせることでより高速に動作するものもあります。ただしこれはデータに依存し、検証が必要です。                             |
| **`T64` for sparse or small ranges**          | `T64` はスパースなデータや、ブロック内の値の範囲が小さい場合に有効です。乱数には `T64` を使用しないでください。                                                                                                                                                                                |
| **`Gorilla` and `T64` for unknown patterns?** | データのパターンが不明な場合は、`Gorilla` や `T64` を試してみる価値があります。                                                                                                                                                                                              |
| **`Gorilla` for gauge data**                  | `Gorilla` は、特にゲージ値（例: ランダムなスパイクを示す値）を表す浮動小数点データに対して有効です。                                                                                                                                                                                      |

その他のオプションについては[こちら](/sql-reference/statements/create/table#column_compression_codec)を参照してください。

以下では、`Id`、`ViewCount`、`AnswerCount` に対して `Delta` コーデックを指定しています。これらの値は順序付けキーと線形に相関付けられていると仮定しており、そのため Delta エンコードによるメリットが期待できます。

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

ClickHouse Cloud では、デフォルトで `ZSTD` 圧縮アルゴリズム（圧縮レベルのデフォルト値は 1）を使用しています。このアルゴリズムの圧縮速度は、圧縮レベル（高いほど低速）に応じて変動しますが、伸長時には一貫して高速である（ばらつきは約 20% 程度）という利点があり、さらに並列処理も可能です。過去のテスト結果からも、このアルゴリズムは多くの場合十分に効果的であり、コーデックを組み合わせた `LZ4` よりも高い性能を発揮することさえあると示唆されています。ほとんどのデータ型や情報分布に対して有効であるため、汎用的なデフォルトとして妥当であり、特別な最適化を行わなくても、デフォルト設定での圧縮品質がすでに非常に高い理由となっています。
