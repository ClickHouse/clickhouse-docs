---
slug: /data-compression/compression-in-clickhouse
title: ClickHouseにおける圧縮
description: ClickHouseの圧縮アルゴリズムの選択
keywords: [圧縮, コーデック, エンコーディング]
---

ClickHouseのクエリパフォーマンスの秘密の一つは圧縮です。 

ディスク上のデータが少ないほど、I/Oが少なくなり、クエリと挿入速度が向上します。ほとんどのケースにおいて、CPUに対する圧縮アルゴリズムのオーバーヘッドは、I/Oの削減によって相殺されます。したがって、ClickHouseのクエリが高速であることを確保するために、データの圧縮を改善することが最初の焦点になるべきです。

> ClickHouseがデータを非常にうまく圧縮する理由については、[こちらの記事](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)をお勧めします。要約すると、列指向データベースであるClickHouseは、値を列の順序で書き込むため、これらの値がソートされている場合、同じ値が隣接します。圧縮アルゴリズムは、連続したデータのパターンを利用します。さらに、ClickHouseにはユーザーが圧縮技術を調整できるコーデックと細かいデータ型があります。

ClickHouseにおける圧縮は、主に3つの要因に影響されます：
- オーダリングキー
- データ型
- 使用されるコーデック

これらすべてはスキーマを通じて設定されます。

## 圧縮を最適化するための適切なデータ型を選択する {#choose-the-right-data-type-to-optimize-compression}

Stack Overflowのデータセットを例にとり、`posts`テーブルの次のスキーマの圧縮統計を比較してみましょう：

- `posts` - オーダリングキーのない型最適化されていないスキーマ。
- `posts_v3` - 各カラムに対して適切な型とビットサイズを持つ型最適化スキーマで、オーダリングキーは`(PostTypeId, toDate(CreationDate), CommentCount)`です。

以下のクエリを使用して、各カラムの現在の圧縮サイズと非圧縮サイズを測定できます。オーダリングキーのない最初の最適化スキーマ`posts`のサイズを検討してみましょう。

```sql
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'posts'
GROUP BY name

┌─name──────────────────┬─compressed_size─┬─uncompressed_size─┬───ratio─┐
│ Body               	│ 46.14 GiB   	  │ 127.31 GiB    	  │	2.76    │
│ Title              	│ 1.20 GiB    	  │ 2.63 GiB      	  │	2.19    │
│ Score              	│ 84.77 MiB   	  │ 736.45 MiB    	  │	8.69    │
│ Tags               	│ 475.56 MiB  	  │ 1.40 GiB      	  │	3.02    │
│ ParentId           	│ 210.91 MiB  	  │ 696.20 MiB    	  │ 3.3     │
│ Id                 	│ 111.17 MiB  	  │ 736.45 MiB    	  │	6.62    │
│ AcceptedAnswerId   	│ 81.55 MiB   	  │ 736.45 MiB    	  │	9.03    │
│ ClosedDate         	│ 13.99 MiB   	  │ 517.82 MiB    	  │ 37.02   │
│ LastActivityDate   	│ 489.84 MiB  	  │ 964.64 MiB    	  │	1.97    │
│ CommentCount       	│ 37.62 MiB   	  │ 565.30 MiB    	  │ 15.03   │
│ OwnerUserId        	│ 368.98 MiB  	  │ 736.45 MiB    	  │ 2       │
│ AnswerCount        	│ 21.82 MiB   	  │ 622.35 MiB    	  │ 28.53   │
│ FavoriteCount      	│ 280.95 KiB  	  │ 508.40 MiB    	  │ 1853.02 │
│ ViewCount          	│ 95.77 MiB   	  │ 736.45 MiB    	  │	7.69    │
│ LastEditorUserId   	│ 179.47 MiB  	  │ 736.45 MiB    	  │ 4.1     │
│ ContentLicense     	│ 5.45 MiB    	  │ 847.92 MiB    	  │ 155.5   │
│ OwnerDisplayName   	│ 14.30 MiB   	  │ 142.58 MiB    	  │	9.97    │
│ PostTypeId         	│ 20.93 MiB   	  │ 565.30 MiB    	  │ 27      │
│ CreationDate       	│ 314.17 MiB  	  │ 964.64 MiB    	  │	3.07    │
│ LastEditDate       	│ 346.32 MiB  	  │ 964.64 MiB    	  │	2.79    │
│ LastEditorDisplayName│ 5.46 MiB	  │ 124.25 MiB	  │ 22.75   │
│ CommunityOwnedDate	│ 2.21 MiB	  │ 509.60 MiB	  │ 230.94  │
└───────────────────────┴─────────────────┴───────────────────┴─────────┘
```

ここでは、圧縮されたサイズと非圧縮のサイズの両方を示しています。どちらも重要です。圧縮されたサイズは、ディスクから読み取る必要のあるものであり、クエリパフォーマンス（およびストレージコスト）のために最小限に抑えたいものです。このデータは読み取る前に解凍する必要があります。この場合、非圧縮サイズは使用されるデータ型に依存します。このサイズを最小化することで、クエリのメモリオーバーヘッドが削減され、クエリによって処理されるデータ量が減ります。これにより、キャッシュの利用が改善され、最終的にクエリの時間が短縮されます。

> 上記のクエリは、システムデータベース内の`columns`テーブルに依存しています。このデータベースはClickHouseによって管理されており、クエリパフォーマンスメトリクスからバックグラウンドクラスターのログまで、有用な情報の宝庫です。興味のある読者には、["システムテーブルとClickHouseの内部へのウィンドウ"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)と関連する記事[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)をお勧めします。

テーブルの合計サイズを要約するために、上記のクエリを簡素化できます：

```sql
SELECT formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'posts'

┌─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ 50.16 GiB   	  │ 143.47 GiB    	  │  2.86 │
└─────────────────┴───────────────────┴───────┘
```

このクエリを型とオーダリングキーが最適化されたテーブルである`posts_v3`に繰り返すと、非圧縮および圧縮サイズに大幅な削減が見られます。

```sql
SELECT
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE `table` = 'posts_v3'

┌─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ 25.15 GiB   	  │ 68.87 GiB     	  │  2.74 │
└─────────────────┴───────────────────┴───────┘
```

各カラムの詳細な内訳は、データを圧縮する前に順序付けることで、`Body`、`Title`、`Tags`、および`CreationDate`カラムでかなりの節約が達成されていることを示しています。

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

## 適切なカラム圧縮コーデックを選択する {#choosing-the-right-column-compression-codec}

カラム圧縮コーデックを使用すると、各カラムのエンコードと圧縮に使用されるアルゴリズム（およびその設定）を変更できます。

エンコーディングと圧縮は、データサイズを削減するという同じ目的で少し異なる動作をします。エンコーディングは、データ型の性質を利用して値を関数に基づいて変換するマッピングをデータに適用します。一方、圧縮はバイトレベルでデータを圧縮するために一般的なアルゴリズムを使用します。

通常、異なるエンコーディングと圧縮アルゴリズムは、異なる値の分布に対して効果的であるため、データを理解する必要があります。 

ClickHouseは多くのコーデックと圧縮アルゴリズムをサポートしています。以下は重要性順にいくつかの推奨事項です：

提案                                              | 理由
---                                               | ---
**`ZSTD`を徹底的に使用**                         | `ZSTD`圧縮は、最も優れた圧縮率を提供します。`ZSTD(1)`は、最も一般的な型に対するデフォルトとすべきです。圧縮率を上げるために数値を変更することができますが、3以上では、圧縮のコスト（挿入速度の低下）に対する利益はあまり見られません。 
**日付と整数シーケンスには`Delta`を使用**      | `Delta`ベースのコーデックは、連続する値に単調なシーケンスや小さなデルタがあるときにうまく機能します。より具体的には、デルタコーデックは導関数が小さい数値を生成する場合にうまく機能します。そうでない場合は、`DoubleDelta`を試してみる価値があります（通常、`Delta`からの1階の導関数がすでに非常に小さい場合はほとんど効果がありません）。単調の増加が均一なシーケンスは、DateTimeフィールドのように、さらに良く圧縮されます。
**`Delta`は`ZSTD`を改善します**               | `ZSTD`はデルタデータに対して効果的なコーデックです。逆に、デルタエンコーディングは`ZSTD`の圧縮を改善することができます。`ZSTD`が存在する場合、他のコーデックはあまりさらなる改善を提供することはありません。
**可能であれば`LZ4`を優先します**           | `LZ4`と`ZSTD`の間で近似した圧縮が得られる場合、LZ4はより早い解凍と少ないCPU負荷を提供するため、優先すべきです。ただし、ほとんどのケースで`ZSTD`は`LZ4`をかなり上回ります。一部のコーデックは、`ZSTD`なしで同様の圧縮を提供しつつ`LZ4`と組み合わせると早く動作することがあります。しかし、これはデータ特有であり、テストが必要です。
**スパースまたは小さな範囲には`T64`を使用**   | `T64`はスパースデータやブロック内の範囲が小さい場合に効果的です。ランダムな数には`T64`を避けてください。
**未知のパターンには`Gorilla`と`T64`を試す**  | データに未知のパターンがある場合、`Gorilla`と`T64`を試す価値があるかもしれません。
**計測データには`Gorilla`を使用**           | `Gorilla`は浮動小数点データ、特に計測値を表すデータに効果的です。

さらなるオプションについては[こちら](/sql-reference/statements/create/table#column_compression_codec)をご覧ください。

以下では、`Id`、`ViewCount`、`AnswerCount`に`Delta`コーデックを指定し、これらがオーダリングキーと線形相関すると仮定し、したがってDeltaエンコーディングの恩恵を受けるべきです。

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

これらのカラムに対する圧縮の改善は、以下に示されています。

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
│ posts_v3 │ AnswerCount │ 9.67 MiB    	    │ 113.69 MiB    	    │ 11.76 │
│ posts_v4 │ AnswerCount │ 10.39 MiB   	    │ 111.31 MiB    	    │ 10.71 │
│ posts_v3 │ Id          │ 159.70 MiB  	    │ 227.38 MiB    	    │  1.42 │
│ posts_v4 │ Id          │ 64.91 MiB   	    │ 222.63 MiB    	    │  3.43 │
│ posts_v3 │ ViewCount   │ 45.04 MiB   	    │ 227.38 MiB    	    │  5.05 │
│ posts_v4 │ ViewCount   │ 52.72 MiB   	    │ 222.63 MiB    	    │  4.22 │
└──────────┴─────────────┴─────────────────┴───────────────────┴───────┘

6 rows in set. Elapsed: 0.008 sec
```

### ClickHouse Cloudにおける圧縮 {#compression-in-clickhouse-cloud}

ClickHouse Cloudでは、デフォルトで`ZSTD`圧縮アルゴリズム（デフォルト値は1）を利用しています。このアルゴリズムの圧縮速度は、圧縮レベル（高いほど遅い）によって異なりますが、解凍速度が一貫して早く（約20%の変動）、並列化できる利点があります。過去のテストでも、このアルゴリズムは多くの場合、十分に効果的であり、コーデックと組み合わせた`LZ4`を上回ることもあります。ほとんどのデータ型と情報の分布に対して効果的であるため、一般的なデフォルトとして合理的であり、最適化なしでもすでに優れた初期の圧縮が実現されています。
