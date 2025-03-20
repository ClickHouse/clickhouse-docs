---
slug: /data-compression/compression-in-clickhouse
title: ClickHouseにおける圧縮
description: ClickHouseの圧縮アルゴリズムの選択
keywords: [圧縮, コーデック, エンコーディング]
---

ClickHouseのクエリパフォーマンスの秘密の一つは圧縮です。

ディスク上のデータが少ないということは、I/Oが少なく、クエリや挿入が速くなるということを意味します。ほとんどの場合、CPUに対する任意の圧縮アルゴリズムのオーバーヘッドは、I/Oの削減によって相殺されるでしょう。したがって、ClickHouseのクエリを迅速にするための作業において、データの圧縮を改善することが最初の焦点となるべきです。

> ClickHouseがデータを効率的に圧縮する理由については、[こちらの記事](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)をお勧めします。要約すると、列指向データベースであるため、値はカラム順に書き込まれます。これらの値がソートされている場合、同じ値は隣接します。圧縮アルゴリズムは、連続したデータパターンを利用します。さらに、ClickHouseにはコーデックや細かいデータ型があり、ユーザーが圧縮技術をさらに調整できるようになっています。

ClickHouseにおける圧縮には3つの主な要因が影響します：
- 順序キー
- データ型
- 使用されるコーデック

これらすべてはスキーマを通じて構成されます。

## 圧縮を最適化するための適切なデータ型の選択 {#choose-the-right-data-type-to-optimize-compression}

Stack Overflowのデータセットを例として使いましょう。`posts`テーブルの以下のスキーマの圧縮統計を比較してみます。

- `posts` - 順序キーのない、型最適化されていないスキーマ。
- `posts_v3` - 各カラムに対して適切な型とビットサイズを持ち、順序キー`(PostTypeId, toDate(CreationDate), CommentCount)`を持つ型最適化されたスキーマ。

次のクエリを使用して、各カラムの現在の圧縮サイズと非圧縮サイズを測定できます。まず、順序キーのない初期の最適化スキーマ`posts`のサイズを確認しましょう。

```sql
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'posts'
GROUP BY name

┌─name──────────────────┬─compressed_size─┬─uncompressed_size─┬───ratio────┐
│ Body              	│ 46.14 GiB   	  │ 127.31 GiB        │	2.76       │
│ Title             	│ 1.20 GiB    	  │ 2.63 GiB          │	2.19       │
│ Score             	│ 84.77 MiB   	  │ 736.45 MiB        │	8.69       │
│ Tags              	│ 475.56 MiB  	  │ 1.40 GiB          │	3.02       │
│ ParentId          	│ 210.91 MiB  	  │ 696.20 MiB        │ 3.3        │
│ Id                	│ 111.17 MiB  	  │ 736.45 MiB        │	6.62       │
│ AcceptedAnswerId  	│ 81.55 MiB   	  │ 736.45 MiB        │	9.03       │
│ ClosedDate        	│ 13.99 MiB   	  │ 517.82 MiB        │ 37.02      │
│ LastActivityDate  	│ 489.84 MiB  	  │ 964.64 MiB        │	1.97       │
│ CommentCount      	│ 37.62 MiB   	  │ 565.30 MiB        │ 15.03      │
│ OwnerUserId       	│ 368.98 MiB  	  │ 736.45 MiB        │ 2          │
│ AnswerCount       	│ 21.82 MiB   	  │ 622.35 MiB        │ 28.53      │
│ FavoriteCount     	│ 280.95 KiB  	  │ 508.40 MiB        │ 1853.02    │
│ ViewCount         	│ 95.77 MiB   	  │ 736.45 MiB        │	7.69       │
│ LastEditorUserId  	│ 179.47 MiB  	  │ 736.45 MiB        │ 4.1        │
│ ContentLicense    	│ 5.45 MiB    	  │ 847.92 MiB        │ 155.5      │
│ OwnerDisplayName  	│ 14.30 MiB   	  │ 142.58 MiB        │	9.97       │
│ PostTypeId        	│ 20.93 MiB   	  │ 565.30 MiB        │ 27         │
│ CreationDate      	│ 314.17 MiB  	  │ 964.64 MiB        │	3.07       │
│ LastEditDate      	│ 346.32 MiB  	  │ 964.64 MiB        │	2.79       │
│ LastEditorDisplayName │ 5.46 MiB    	  │ 124.25 MiB        │ 22.75      │
│ CommunityOwnedDate	│ 2.21 MiB    	  │ 509.60 MiB        │ 230.94     │
└───────────────────────┴─────────────────┴───────────────────┴────────────┘
```

ここでは、圧縮されたサイズと非圧縮のサイズの両方を示しています。どちらも重要です。圧縮されたサイズは、ディスクから読み取る必要があるサイズに相当します - これはクエリパフォーマンス（およびストレージコスト）のために最小化したいものです。このデータは読み取りの前に解凍する必要があります。この非圧縮のサイズは、この場合に使用されるデータ型に依存します。このサイズを最小限に抑えることで、クエリのメモリオーバーヘッドと、クエリによって処理される必要があるデータの量が削減され、キャッシュの利用が改善され、最終的なクエリ時間が短縮されます。

> 上記のクエリは、システムデータベース内の`columns`テーブルに依存しています。このデータベースはClickHouseによって管理されており、クエリ性能メトリックからバックグラウンドクラスターのログまで、便利な情報の宝庫です。興味がある方には、[「システムテーブルとClickHouseの内部へのウィンドウ」](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)やその関連の記事[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)をお勧めします。

テーブルの合計サイズを要約するために、上記のクエリを簡略化できます：

```sql
SELECT formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'posts'

┌─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ 50.16 GiB   	  │ 143.47 GiB        │  2.86 │
└─────────────────┴───────────────────┴───────┘
```

`posts_v3`、すなわち最適化された型と順序キーを持つテーブルのためにこのクエリを繰り返すと、非圧縮サイズと圧縮サイズが大幅に削減されることがわかります。

```sql
SELECT
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE `table` = 'posts_v3'

┌─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ 25.15 GiB   	  │ 68.87 GiB         │  2.74 │
└─────────────────┴───────────────────┴───────┘
```

完全なカラムの内訳では、データを圧縮前に順序を付け、適切な型を使用することで、`Body`、`Title`、`Tags`、`CreationDate`カラムでかなりの保存が達成される様子が示されています。

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

カラム圧縮コーデックを使用することで、各カラムに対して使用されるアルゴリズム（およびその設定）を変更できます。

エンコーディングと圧縮は、データサイズを削減するという同じ目的を持ちながら、わずかに異なる方法で作用します。エンコーディングは、データ型の特性を利用して値を変換する関数に基づいてデータにマッピングを適用します。一方、圧縮は、バイトレベルでデータを圧縮するための一般的なアルゴリズムを使用します。

通常、エンコーディングは圧縮が使用される前に適用されます。異なるエンコーディングと圧縮アルゴリズムは異なる値の分布に対して効果的であるため、自分のデータを理解する必要があります。

ClickHouseは多くのコーデックと圧縮アルゴリズムをサポートしています。以下は、重要度の順にいくつかの推薦事項です：

Recommendation                                     | Reasoning
---                                                |    ---
**`ZSTD`を推奨**                             | `ZSTD`圧縮は最高の圧縮率を提供します。`ZSTD(1)`は最も一般的な型のデフォルトとすべきです。圧縮率を高めるためには数値を変更することができます。圧縮コスト（挿入速度の低下）が増加するため、3以上の値では十分な利点を得られることは稀です。
**日付および整数列には`Delta`を**         | `Delta`ベースのコーデックは、単調増加列や連続する値の小さなデルタを持つ場合に効果的です。具体的には、デルタコーデックは、導関数が小さな数を生成する場合に有効です。そうでない場合は、`DoubleDelta`を試す価値があります（これにより、通常は一次導関数の値が既に非常に小さい場合にほとんど追加効果がありません）。単調増加が均一な列の場合は、さらに効果的な圧縮が実現します（例：DateTimeフィールド）。
**`Delta`は`ZSTD`を向上させる**                        | `ZSTD`はデルタデータに対して効果的で、逆にデルタエンコーディングは`ZSTD`圧縮を改善することがあります。`ZSTD`が存在する場合、他のコーデックはほとんどさらなる改善を提供しません。
**可能であれば`LZ4`を`ZSTD`より優先**                  | `LZ4`と`ZSTD`の間で比較可能な圧縮が得られた場合は、前者を優先してください。`LZ4`はより速い解凍を提供し、CPUの必要性も少ないからです。ただし、`ZSTD`はほとんどの場合で`LZ4`を大幅に上回ります。これらのコーデックの一部は、`LZ4`と組み合わせて使用することで、コーデックなしの`ZSTD`と比較して似たような圧縮を提供しやすくなります。ただし、これはデータに依存するため、テストが必要です。
**スパースまたは小さな範囲に`T64`を**               | `T64`はスパースデータやブロック内の範囲が小さい場合に効果的です。ランダムな数には`T64`を避けましょう。
**未知のパターンには`Gorilla`および`T64`を**      | データに未知のパターンがある場合、`Gorilla`および`T64`を試してみる価値があります。
**ゲージデータに`Gorilla`を**                       | `Gorilla`は浮動小数点データ、特にゲージ読み取り（すなわち、ランダムなスパイク）を表すものに対して効果的です。

詳細なオプションについては[こちら](https://clickhouse.com/sql-reference/statements/create/table#column_compression_codec)を参照してください。

以下では、`Id`、`ViewCount`、および`AnswerCount`のために`Delta`コーデックを指定し、これらが順序キーと線形相関があると仮定し、デルタエンコーディングの恩恵を受けるはずです。

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

これらのカラムにおける圧縮の改善は以下に示されています。

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
│ posts_v3 │ AnswerCount │ 9.67 MiB    	   │ 113.69 MiB        │ 11.76 │
│ posts_v4 │ AnswerCount │ 10.39 MiB   	   │ 111.31 MiB        │ 10.71 │
│ posts_v3 │ Id      	 │ 159.70 MiB  	   │ 227.38 MiB        │  1.42 │
│ posts_v4 │ Id      	 │ 64.91 MiB   	   │ 222.63 MiB        │  3.43 │
│ posts_v3 │ ViewCount   │ 45.04 MiB   	   │ 227.38 MiB        │  5.05 │
│ posts_v4 │ ViewCount   │ 52.72 MiB   	   │ 222.63 MiB        │  4.22 │
└──────────┴─────────────┴─────────────────┴───────────────────┴───────┘

6行がセットされました。経過時間: 0.008秒
```

### ClickHouse Cloudにおける圧縮 {#compression-in-clickhouse-cloud}

ClickHouse Cloudでは、デフォルトで`ZSTD`圧縮アルゴリズム（デフォルト値は1）を利用しています。圧縮速度は、このアルゴリズムの圧縮レベル（高いほど遅い）によって異なりますが、常に速い解凍を実現できるという利点があり（約20%の変動）、並列化の能力も享受できます。これまでのテストは、このアルゴリズムがほとんどのデータ型と情報分布に対して効果的であり、最初から最適化を行わない状態でも当初の圧縮が優れていた理由です。

