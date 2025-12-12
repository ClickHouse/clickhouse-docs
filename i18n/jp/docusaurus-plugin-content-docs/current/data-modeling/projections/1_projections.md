---
slug: /data-compression/compression-in-clickhouse
title: 'ClickHouseにおける圧縮'
description: 'ClickHouseの圧縮アルゴリズムの選択'
keywords: ['compression', 'codec', 'encoding']
doc_type: 'reference'
---

ClickHouseのクエリパフォーマンスの秘密の1つは圧縮です。

ディスク上のデータが少なければ、I/Oが減り、クエリと挿入が高速になります。CPUに対する圧縮アルゴリズムのオーバーヘッドは、ほとんどの場合、I/Oの削減によって相殺されます。したがって、ClickHouseクエリを高速にするための最初の焦点は、データの圧縮を改善することにあるべきです。

> ClickHouseがデータをこれほどうまく圧縮する理由については、[この記事](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)を読むことをお勧めします。簡単に言うと、我々のカラム指向データベースは、カラム順に値を書き込みます。これらの値がソートされると、同一の値が隣接して配置され、圧縮アルゴリズムはデータの連続したパターンを活用します。さらに、ClickHouseにはコーデックと詳細なデータ型があり、圧縮をさらに簡単に調整できます。

ClickHouseにおける圧縮は、主に3つの要因によって影響を受けます：
- オーダリングキー
- データ型
- 使用されるコーデック

これらはすべてスキーマを通じて設定されます。

## 圧縮を最適化するための適切なデータ型の選択 {#choose-the-right-data-type-to-optimize-compression}

Stack Overflowデータセットを例として使用しましょう。`posts`テーブルの以下のスキーマの圧縮統計を比較してみましょう：

- `posts` - オーダリングキーのない型最適化されていないスキーマ。
- `posts_v3` - 各カラムに適切な型とビットサイズを持ち、オーダリングキー`(PostTypeId, toDate(CreationDate), CommentCount)`を持つ型最適化されたスキーマ。

以下のクエリを使用して、各カラムの現在の圧縮サイズと非圧縮サイズを測定できます。オーダリングキーのない初期最適化スキーマ`posts`のサイズを調べてみましょう。

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
   
<summary>コンパクトパーツとワイドパーツに関する注記</summary>

`compressed_size`または`uncompressed_size`の値が`0`と表示される場合、パーツのタイプが`wide`ではなく`compact`である可能性があります（[`system.parts`](/operations/system-tables/parts)の`part_type`の説明を参照）。
パーツ形式は設定[`min_bytes_for_wide_part`](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)および[`min_rows_for_wide_part`](/operations/settings/merge-tree-settings#min_rows_for_wide_part)によって制御されます。つまり、挿入されたデータが上記の設定値を超えないパーツになる場合、パーツはワイドではなくコンパクトになり、`compressed_size`や`uncompressed_size`の値は表示されません。

デモンストレーション：

```sql title="クエリ"
-- コンパクトパーツを持つテーブルを作成
CREATE TABLE compact (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number 
AS SELECT * FROM numbers(100000); -- min_bytes_for_wide_part = 10485760のデフォルトを超えない程度の小ささ

-- パーツのタイプを確認
SELECT table, name, part_type from system.parts where table = 'compact';

-- コンパクトテーブルの圧縮および非圧縮カラムサイズを取得
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'compact'
GROUP BY name;

-- ワイドパーツを持つテーブルを作成 
CREATE TABLE wide (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number
SETTINGS min_bytes_for_wide_part=0
AS SELECT * FROM numbers(100000);

-- パーツのタイプを確認
SELECT table, name, part_type from system.parts where table = 'wide';

-- ワイドテーブルの圧縮および非圧縮サイズを取得
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'wide'
GROUP BY name;
```

```response title="レスポンス"
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

ここでは圧縮サイズと非圧縮サイズの両方を示しています。両方とも重要です。圧縮サイズは、ディスクから読み取る必要があるものに相当し、クエリパフォーマンス（およびストレージコスト）のために最小化したいものです。このデータは読み取る前に解凍する必要があります。この非圧縮サイズのサイズは、この場合使用されるデータ型に依存します。このサイズを最小化することで、クエリのメモリオーバーヘッドとクエリで処理する必要があるデータ量が削減され、キャッシュの利用が改善され、最終的にクエリ時間が短縮されます。

> 上記のクエリは、システムデータベースの`columns`テーブルに依存しています。このデータベースはClickHouseによって管理されており、クエリパフォーマンスメトリクスからバックグラウンドクラスターログまで、有用な情報の宝庫です。興味のある読者には、["System Tables and a Window into the Internals of ClickHouse"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)および関連記事[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)をお勧めします。

テーブルの合計サイズを要約するために、上記のクエリを簡素化できます：

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

最適化された型とオーダリングキーを持つテーブル`posts_v3`に対してこのクエリを繰り返すと、非圧縮サイズと圧縮サイズの両方で大幅な削減が見られます。

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

完全なカラムの内訳では、圧縮前にデータを順序付けし、適切な型を使用することで、`Body`、`Title`、`Tags`、`CreationDate`カラムで大幅な節約が達成されていることがわかります。

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

カラム圧縮コーデックを使用すると、各カラムのエンコードと圧縮に使用されるアルゴリズム（およびその設定）を変更できます。

エンコーディングと圧縮は、同じ目的（データサイズの削減）を持ちながら、わずかに異なる動作をします。エンコーディングは、データ型のプロパティを活用して関数に基づいて値を変換することで、データにマッピングを適用します。逆に、圧縮はバイトレベルでデータを圧縮する汎用アルゴリズムを使用します。

通常、圧縮が使用される前にエンコーディングが最初に適用されます。異なるエンコーディングと圧縮アルゴリズムは異なる値の分布に効果的であるため、データを理解する必要があります。

ClickHouseは多数のコーデックと圧縮アルゴリズムをサポートしています。以下は重要度順のいくつかの推奨事項です：

推奨事項                                           | 理由
---                                                |    ---
**`ZSTD`を全面的に使用**                           | `ZSTD`圧縮は最高の圧縮率を提供します。`ZSTD(1)`は最も一般的な型のデフォルトとすべきです。数値を変更することで、より高い圧縮率を試すことができます。圧縮コストの増加（挿入が遅くなる）に対して、3より高い値で十分な利点が得られることはまれです。
**日付と整数シーケンスには`Delta`**                | `Delta`ベースのコーデックは、単調シーケンスや連続値間の小さな差分がある場合にうまく機能します。より具体的には、導関数が小さな数を生成する場合にDeltaコーデックはうまく機能します。そうでない場合は、`DoubleDelta`を試す価値があります（`Delta`からの一次導関数がすでに非常に小さい場合、これはほとんど追加されません）。単調増加が均一なシーケンスは、さらによく圧縮されます。例えばDateTimeフィールドなど。
**`Delta`は`ZSTD`を改善**                          | `ZSTD`はデルタデータに効果的なコーデックです - 逆に、デルタエンコーディングは`ZSTD`圧縮を改善できます。`ZSTD`がある場合、他のコーデックがさらなる改善を提供することはまれです。
**可能なら`ZSTD`より`LZ4`**                        | `LZ4`と`ZSTD`で同等の圧縮が得られる場合、前者を優先してください。より高速な解凍とより少ないCPUが必要です。ただし、ほとんどの場合、`ZSTD`は`LZ4`を大幅に上回ります。これらのコーデックの一部は、`LZ4`と組み合わせると、コーデックなしの`ZSTD`と同等の圧縮を提供しながら、より高速に動作する場合があります。これはデータ固有であり、テストが必要です。
**疎またはレンジが小さい場合は`T64`**              | `T64`は疎データやブロック内の範囲が小さい場合に効果的です。ランダムな数には`T64`を避けてください。
**パターンが不明な場合は`Gorilla`と`T64`?**        | データに未知のパターンがある場合、`Gorilla`と`T64`を試す価値があるかもしれません。
**ゲージデータには`Gorilla`**                      | `Gorilla`は浮動小数点データ、特にゲージ読み取り（ランダムなスパイク）を表すデータに効果的です。

その他のオプションについては[こちら](/sql-reference/statements/create/table#column_compression_codec)を参照してください。

以下では、`Id`、`ViewCount`、`AnswerCount`に`Delta`コーデックを指定しています。これらがオーダリングキーと線形相関があり、したがってDeltaエンコーディングの恩恵を受けると仮定しています。

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

これらのカラムの圧縮改善を以下に示します：

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

ClickHouse Cloudでは、デフォルトで`ZSTD`圧縮アルゴリズム（デフォルト値1）を使用しています。このアルゴリズムの圧縮速度は圧縮レベルによって異なりますが（高い = 遅い）、解凍では一貫して高速（約20%の変動）であり、並列化できるという利点があります。過去のテストでも、このアルゴリズムは十分に効果的であり、コーデックと組み合わせた`LZ4`を上回ることさえあることが示されています。ほとんどのデータ型と情報分布に効果的であり、したがって賢明な汎用デフォルトであり、最適化なしでも初期の圧縮がすでに優れている理由です。