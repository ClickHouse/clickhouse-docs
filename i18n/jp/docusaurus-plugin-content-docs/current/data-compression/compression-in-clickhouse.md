---
slug: /data-compression/compression-in-clickhouse
title: 'ClickHouseにおける圧縮'
description: 'ClickHouseの圧縮アルゴリズムの選択'
keywords: ['圧縮', 'コーデック', 'エンコーディング']
---

ClickHouseのクエリ性能の秘密の一つが圧縮です。

ディスク上のデータが少ないほど、I/Oが少なくなり、クエリや挿入が高速化されます。多くの場合、CPUに対する圧縮アルゴリズムのオーバーヘッドは、I/Oの削減によって相殺されます。したがって、ClickHouseのクエリを高速に保つためには、データの圧縮を改善することが第一の焦点となるべきです。

> ClickHouseがデータを非常によく圧縮する理由については、[この記事](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)をお勧めします。要約すると、列指向データベースとして、値は列順に書き込まれます。これらの値がソートされていれば、同じ値は隣接することになります。圧縮アルゴリズムは、連続したデータパターンを利用します。さらに、ClickHouseにはコーデックや詳細なデータ型があり、ユーザーが圧縮手法をさらに調整できるようになっています。

ClickHouseにおける圧縮は、以下の3つの主な要因によって影響を受けます：
- Ordering Key（順序キー）
- Data Types（データ型）
- 使用されるコーデック

これらはすべてスキーマを通じて設定されます。

## 圧縮を最適化するための適切なデータ型の選択 {#choose-the-right-data-type-to-optimize-compression}

Stack Overflowデータセットを例に使いましょう。以下のスキーマのための `posts` テーブルの圧縮統計を比較します：

- `posts` - 順序キーのない非最適化スキーマ。
- `posts_v3` - 各カラムに対して適切な型とビットサイズを持つ最適化スキーマで、順序キーは `(PostTypeId, toDate(CreationDate), CommentCount)`です。

以下のクエリを使用して、各カラムの現在の圧縮サイズと非圧縮サイズを測定します。順序キーのない初期最適化スキーマ `posts` のサイズを調べてみましょう。

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

ここで、圧縮サイズと非圧縮サイズの両方を示しています。どちらも重要です。圧縮サイズはディスクから読み取る必要があるもので、クエリ性能（およびストレージコスト）を最小限に抑えたいものです。このデータは、読み取り前に展開する必要があります。この非圧縮サイズの大きさは、今回使用されるデータ型に依存します。このサイズを最小化することで、クエリのメモリオーバーヘッドとクエリによって処理されるデータの量を削減し、キャッシュの利用率を改善し、最終的にはクエリタイムを短縮できるのです。

> 上記のクエリは、システムデータベースの `columns` テーブルに依存しています。このデータベースはClickHouseによって管理されており、クエリ性能メトリクスからバックグラウンドクラスターのログまで、有用な情報が豊富にあります。「["システムテーブルとClickHouseの内部へのウィンドウ"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)」およびそれに付随する記事[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)を好奇心旺盛な読者にお勧めします。

テーブルの全体サイズをまとめるために、上記のクエリを簡略化できます：

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

`posts_v3` の最適化された型と順序キーを持つテーブルについてこのクエリを繰り返すと、非圧縮および圧縮サイズが大幅に削減されていることがわかります。

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

全カラムの詳細には、圧縮前にデータを順序付け、適切な型を使用することで `Body`、`Title`、`Tags`、`CreationDate` カラムにおける considerable なコスト削減が示されています。

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

カラム圧縮コーデックを使用すると、各カラムをエンコードおよび圧縮するために使用されるアルゴリズム（およびその設定）を変更できます。

エンコーディングと圧縮は同じ目的（データサイズの削減）を持っていますが、若干異なります。エンコーディングはデータにマッピングを適用し、データ型の特性を利用して値を変換します。それに対して、圧縮はバイトレベルでデータを圧縮する一般的なアルゴリズムを使用します。

通常、エンコーディングは圧縮が行われる前に適用されます。異なるエンコーディングや圧縮アルゴリズムは、異なる値の分布に対して効果的であるため、データを理解する必要があります。

ClickHouseは多くのコーデックと圧縮アルゴリズムをサポートしています。以下は重要度順の推奨事項です：

Recommendation                                     | Reasoning
---                                                |    ---
**`ZSTD`を最優先**                                | `ZSTD`圧縮は最高の圧縮率を提供します。`ZSTD(1)`はほとんどの一般的な型のデフォルトとすべきです。圧縮率を向上させるために数値を変更することができます。圧縮のコスト（挿入速度の見積もりが遅くなる）と比べて、3を超える値で十分なメリットを見かけることは稀です。
**日付および整数シーケンスには`Delta`を**      | `Delta`ベースのコーデックは、単調シーケンスまたは連続値の小さいデルタがある場合によく機能します。具体的には、デルタコーデックは、導関数が小さい数を生成する限りうまく機能します。そうでない場合は、`DoubleDelta`を試す価値があります（通常、`Delta`からの第一レベルの導関数がすでに非常に小さい場合に追加の効果を持ちます）。単調増加が均一なシーケンスは、さらに良い圧縮を提供します。たとえば、DateTimeフィールド。
**`ZSTD`を改善する`Delta`**                     | `ZSTD`はデルタデータに対して効果的なコーデックです。逆に、デルタエンコーディングは`ZSTD`圧縮を改善することができます。`ZSTD`がある場合、他のコーデックはほとんど追加の改善を提供することはありません。
**できれば`LZ4`を`ZSTD`の上に**                | `LZ4`と`ZSTD`の間で同等の圧縮を得られる場合は、前者を優先してください。LZ4はより高速な展開と少ないCPUを必要とします。しかし、ほとんどの場合、`ZSTD`は`LZ4`を大きく上回る性能を発揮します。これらのコーデックの中には、`LZ4`と組み合わせてより早く機能しながら、コーデックなしでの`ZSTD`と類似の圧縮を提供するものもあります。しかし、これはデータに特有のものであり、テストが必要です。
**スパースまたは小範囲には`T64`を**          | `T64`はスパースデータまたはブロック内の範囲が小さい場合に効果的です。ランダム数の場合は`T64`を避けてください。
**未知のパターンには`Gorilla`および`T64`？**  | データに未知のパターンがある場合は、`Gorilla`と`T64`を試す価値があります。
**ゲージデータには`Gorilla`を**                | `Gorilla`は浮動小数点データ、特にゲージ読取を表すデータ、すなわちランダムスパイクに対して効果的です。

さらなるオプションは[こちら](https://sql-reference/statements/create/table#column_compression_codec)を参照してください。

以下では、`Id`、`ViewCount`、`AnswerCount`に `Delta` コーデックを指定します。これらは順序キーと線形相関していると仮定され、したがってデルタエンコーディングの恩恵を受けるべきです。

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

これらのカラムの圧縮改善は以下に示されています：

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

6行がセットされました。経過時間: 0.008秒
```

### ClickHouse Cloudにおける圧縮 {#compression-in-clickhouse-cloud}

ClickHouse Cloudでは、デフォルトで `ZSTD` 圧縮アルゴリズム（デフォルト値は1）を使用しています。このアルゴリズムの圧縮速度は、圧縮レベルに応じて変化する場合があります（高い = 遅い）が、一貫して高速な展開（約20%の変動）を持ち、並列化できる利点があります。我々の過去のテストでも、このアルゴリズムがしばしば十分に効果的であり、コーデックと組み合わせた `LZ4` を上回ることもあります。ほとんどのデータ型や情報分布に対して効果的であり、したがって一般的な用途に適したデフォルトとされており、最適化なしでも我々の初期の前述の圧縮がすでに優れている理由でもあります。
