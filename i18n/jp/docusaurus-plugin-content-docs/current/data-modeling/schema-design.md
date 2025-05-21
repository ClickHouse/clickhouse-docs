---
slug: /data-modeling/schema-design
title: 'スキーマ設計'
description: 'クエリパフォーマンスのためのClickHouseスキーマの最適化'
keywords: ['スキーマ', 'スキーマ設計', 'クエリ最適化']
---

import stackOverflowSchema from '@site/static/images/data-modeling/stackoverflow-schema.png';
import schemaDesignIndices from '@site/static/images/data-modeling/schema-design-indices.png';
import Image from '@theme/IdealImage';

効果的なスキーマ設計を理解することは、ClickHouseのパフォーマンスを最適化するための鍵であり、しばしばトレードオフの選択を含み、最適なアプローチは提供されるクエリやデータの更新頻度、レイテンシ要件、データボリュームなどの要因によって異なります。このガイドでは、ClickHouseのパフォーマンスを最適化するためのスキーマ設計のベストプラクティスとデータモデリング手法について概説します。

## Stack Overflowデータセット {#stack-overflow-dataset}

このガイドの例では、Stack Overflowデータセットのサブセットを使用します。これは、2008年から2024年4月までにStack Overflowで発生したすべての投稿、投票、ユーザー、コメント、およびバッジを含んでいます。このデータは、以下のスキーマを使用してParquetで利用可能で、S3バケット`s3://datasets-documentation/stackoverflow/parquet/`に保存されています。

> 示されている主キーと関係は制約を通じて強制されるものではなく（Parquetはファイル形式でありテーブル形式ではないため）、データがどのように関連しているかおよびそれが持つ一意のキーを示すものです。

<Image img={stackOverflowSchema} size="lg" alt="Stack Overflowスキーマ"/>

<br />

Stack Overflowデータセットは、関連するテーブルの数を含んでいます。データモデリング作業では、ユーザーにはまず主テーブルをロードすることに焦点を当てることをお勧めします。これは必ずしも最大のテーブルではないかもしれませんが、分析クエリを最も多く受け取ると予想されるテーブルです。これにより、ClickHouseの主要な概念や種類に親しむことができ、特に主にOLTPバックグラウンドから来た場合には重要です。このテーブルは、ClickHouseの機能を最大限に活用し、最適なパフォーマンスを得るために追加のテーブルが追加されると再設計が必要です。

上記のスキーマは、このガイドの目的上、意図的に最適ではありません。

## 初期スキーマの確立 {#establish-initial-schema}

`posts`テーブルは、ほとんどの分析クエリのターゲットになるため、このテーブルのスキーマを確立することに焦点を当てます。このデータは、公共のS3バケット`s3://datasets-documentation/stackoverflow/parquet/posts/*.parquet`に、年ごとにファイルとして利用可能です。

> Parquet形式のデータをS3からロードすることは、ClickHouseにデータをロードする最も一般的で望ましい方法です。ClickHouseはParquetの処理に最適化されており、S3から毎秒数千万行を読み込むことが可能です。

ClickHouseは、データセットの型を自動的に識別するためのスキーマ推定機能を提供します。これは、Parquetを含むすべてのデータ形式でサポートされています。この機能を利用して、s3テーブル関数および[`DESCRIBE`](/sql-reference/statements/describe-table)コマンドを介してデータのClickHouseタイプを特定できます。以下では、`stackoverflow/parquet/posts`フォルダー内のすべてのファイルを読み取るために、グロブパターン`*.parquet`を使用しています。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
SETTINGS describe_compact_output = 1

┌─name──────────────────┬─type───────────────────────────┐
│ Id                    │ Nullable(Int64)               │
│ PostTypeId            │ Nullable(Int64)               │
│ AcceptedAnswerId      │ Nullable(Int64)               │
│ CreationDate          │ Nullable(DateTime64(3, 'UTC')) │
│ Score                 │ Nullable(Int64)               │
│ ViewCount             │ Nullable(Int64)               │
│ Body                  │ Nullable(String)              │
│ OwnerUserId           │ Nullable(Int64)               │
│ OwnerDisplayName      │ Nullable(String)              │
│ LastEditorUserId      │ Nullable(Int64)               │
│ LastEditorDisplayName │ Nullable(String)              │
│ LastEditDate          │ Nullable(DateTime64(3, 'UTC')) │
│ LastActivityDate      │ Nullable(DateTime64(3, 'UTC')) │
│ Title                 │ Nullable(String)              │
│ Tags                  │ Nullable(String)              │
│ AnswerCount           │ Nullable(Int64)               │
│ CommentCount          │ Nullable(Int64)               │
│ FavoriteCount         │ Nullable(Int64)               │
│ ContentLicense        │ Nullable(String)              │
│ ParentId              │ Nullable(String)              │
│ CommunityOwnedDate    │ Nullable(DateTime64(3, 'UTC')) │
│ ClosedDate            │ Nullable(DateTime64(3, 'UTC')) │
└───────────────────────┴────────────────────────────────┘
```

> [s3テーブル関数](/sql-reference/table-functions/s3)を使用することで、S3のデータをClickHouseからインプレースでクエリすることができます。この関数は、ClickHouseがサポートするすべてのファイル形式と互換性があります。

これにより、最初の非最適化スキーマを提供します。デフォルトでは、ClickHouseはこれらを同等のNullable型にマッピングします。シンプルな`CREATE EMPTY AS SELECT`コマンドを使用して、これらの型を持つClickHouseテーブルを作成できます。

```sql
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
```

いくつかの重要なポイント：

このコマンドを実行した後、私たちのpostsテーブルは空です。データはロードされていません。
テーブルエンジンとしてMergeTreeを指定しました。MergeTreeは、おそらく最も一般的に使用されるClickHouseテーブルエンジンです。PBのデータを処理できるマルチツールであり、ほとんどの分析使用ケースに対応しています。他のテーブルエンジンは、効率的な更新をサポートする必要があるCDCなどのユースケースに存在します。

`ORDER BY ()`句は、インデックスがなく、データに順序がないことを意味します。これについては後で詳しく説明します。現時点では、すべてのクエリが線形スキャンを必要とすることを知っておいてください。

テーブルが作成されたことを確認するには：

```sql
SHOW CREATE TABLE posts

CREATE TABLE posts
(
        `Id` Nullable(Int64),
        `PostTypeId` Nullable(Int64),
        `AcceptedAnswerId` Nullable(Int64),
        `CreationDate` Nullable(DateTime64(3, 'UTC')),
        `Score` Nullable(Int64),
        `ViewCount` Nullable(Int64),
        `Body` Nullable(String),
        `OwnerUserId` Nullable(Int64),
        `OwnerDisplayName` Nullable(String),
        `LastEditorUserId` Nullable(Int64),
        `LastEditorDisplayName` Nullable(String),
        `LastEditDate` Nullable(DateTime64(3, 'UTC')),
        `LastActivityDate` Nullable(DateTime64(3, 'UTC')),
        `Title` Nullable(String),
        `Tags` Nullable(String),
        `AnswerCount` Nullable(Int64),
        `CommentCount` Nullable(Int64),
        `FavoriteCount` Nullable(Int64),
        `ContentLicense` Nullable(String),
        `ParentId` Nullable(String),
        `CommunityOwnedDate` Nullable(DateTime64(3, 'UTC')),
        `ClosedDate` Nullable(DateTime64(3, 'UTC'))
)
ENGINE = MergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
ORDER BY tuple()
```

初期スキーマが定義されたので、`INSERT INTO SELECT`を使用してデータを埋め込むことができます。s3テーブル関数を使用してデータを読み込み、以下のコマンドを使用して`posts`データを約2分で30コアのClickHouse Cloudインスタンスにロードします。

```sql
INSERT INTO posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 148.140 sec. Processed 59.82 million rows, 38.07 GB (403.80 thousand rows/s., 257.00 MB/s.)
```

> 上記のクエリは、6000万行をロードします。ClickHouseにとっては小規模ですが、慢性的なインターネット接続の遅いユーザーは、データのサブセットをロードすることをお勧めします。これは、ロードする年を指定することで達成できます。グロブパターンを使用することで例として`https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2008.parquet`や`https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/{2008, 2009}.parquet`を指定できます。ファイルのサブセットをターゲットにするためにグロブパターンを使用する方法については、[こちら](/sql-reference/table-functions/file#globs-in-path)を参照してください。

## 型の最適化 {#optimizing-types}

ClickHouseのクエリパフォーマンスの秘密の1つは、圧縮です。

ディスク上のデータが少ないほど、少ないI/Oで済み、クエリや挿入が速くなります。ほとんどの場合、圧縮アルゴリズムのCPUに関するオーバーヘッドはI/Oの削減によって上回られます。したがって、データの圧縮を改善することが、ClickHouseクエリを迅速にするための最初の焦点となるべきです。

> ClickHouseがデータを非常に良く圧縮する理由については、[このアーティクル](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)をお勧めします。要約すると、列指向データベースであるため、値は列の順序で書き込まれます。これらの値がソートされている場合、同じ値が隣接します。圧縮アルゴリズムはデータの連続したパターンを利用します。これに加えて、ClickHouseにはユーザーが圧縮技術をさらに調整できるコーデックと細かいデータ型があります。

ClickHouseにおける圧縮は、主に3つの要因に影響を受けます：順序キー、データ型、および使用されるコーデック。これらはすべてスキーマを通じて設定されます。

圧縮とクエリパフォーマンスの最初の大きな改善は、型最適化のシンプルなプロセスを通じて得られます。スキーマを最適化するために適用できるいくつかのシンプルなルールがあります：

- **厳密な型を使用する** - 私たちの初期スキーマでは、多くのカラムに明らかに数値のためのStringsを使用しています。正しい型の使用により、フィルタリングや集計時に期待された意味論が保証されます。これは、Parquetファイルで正しく提供された日付型にも当てはまります。
- **Nullableカラムを避ける** - デフォルトでは、上記のカラムはNullであると仮定されました。Nullable型により、クエリが空の値とNull値の違いを決定できます。これにより、別のUInt8型のカラムが作成されます。この追加カラムは、ユーザーがnullableカラムを操作するたびに処理されなければなりません。これにより、追加のストレージスペースが使用され、クエリパフォーマンスにほぼ常に悪影響を及ぼします。型のデフォルトの空の値とNullの間に違いがある場合にのみNullableを使用してください。たとえば、`ViewCount`カラムの空の値として0の値は、多くのクエリに対して十分であり、結果に影響を与えないでしょう。空の値を異なる扱いにする必要がある場合は、フィルターを使用してクエリから除外することもしばしばできます。
最小限の精度の数値型を使用する - ClickHouseには、さまざまな数値範囲と精度のために設計された数値型がいくつかあります。カラムを表現するために使用するビットの数を最小限に抑えることを常に目指してください。たとえば、Int16の異なるサイズの整数に加え、最小値が0の符号なしのバリアントも提供されます。これにより、カラムに使用されるビット数を減らすことができます。たとえば、UInt16は最大値が65535で、Int16の2倍です。可能な限りこれらの型を大きな符号付きバリアントの代わりに優先してください。
- **日付型の最小限の精度** - ClickHouseは複数の日付および日時型をサポートしています。DateおよびDate32は、純粋な日付を保存するために使用できますが、後者はより多くのビットを必要とする代わりに大きな日付範囲をサポートします。DateTimeおよびDateTime64は日時に対するサポートを提供します。DateTimeは秒の粒度に制限され、32ビットを使用します。DateTime64は、名前が示す通り64ビットを使用しますが、ナノ秒の粒度までサポートします。クエリのために許可される最も粗いバージョンを選択し、必要なビット数を最小限に抑えます。
- **LowCardinalityを使用する** - ユニークな値の数が少ない数値、文字列、日付または日時のカラムは、LowCardinality型を使用してエンコードできる可能性があります。この辞書は値をエンコードし、ディスク上のサイズを削減します。ユニークな値が1万未満のカラムで検討してください。
定義された長さを持つ文字列のためにFixedStringを使用する - 正確にNバイトの長さを持つ文字列は、FixedString型でエンコードできます。これは、データがまさにNバイトの長さであるときに効率的です。それ以外の場合、効率が低下する可能性が高く、LowCardinalityが優先されます。
- **データ検証のためのEnum** - Enum型は列挙型を効率的にエンコードするために使用できます。Enumは、ストアする必要があるユニークな値の数に応じて8ビットまたは16ビットになります。これを使用すると、挿入時に関連する検証が必要な場合（未宣言の値が拒否されます）や、Enum値の自然な順序を利用するクエリを実行したい場合に検討してください。例えば、ユーザーの回答を含むフィードバックカラムに`Enum(':(' = 1, ':|' = 2, ':)' = 3)`を想像してみてください。

> ヒント：すべてのカラムの範囲や異なる値の数を見つけるには、ユーザーはシンプルなクエリ`SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical`を使用できます。これはコストがかかる可能性があるため、小規模なデータセットで実行することをお勧めします。このクエリは、精度を示すために少なくとも数値として定義される必要があります。すなわち、Stringではありません。

これらのシンプルなルールをpostsテーブルに適用することで、各カラムの最適な型を特定できます：

| カラム                   | 数値     | 最小、最大                                                            | ユニークな値 | Nulls | コメント                                                                                      | 最適化された型                           |
|------------------------|------------|------------------------------------------------------------------------|----------------|--------|----------------------------------------------------------------------------------------------|------------------------------------------|
| `PostTypeId`             | はい        | 1, 8                                                                   | 8              | いいえ     |                                                                                              | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | はい        | 0, 78285170                                                            | 12282094       | はい    | 0値でNullを区別                                                                                | UInt32                                   |
| `CreationDate`           | いいえ         | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000           | -              | いいえ     | ミリ秒の粒度は必要ありません。DateTimeを使用                                                    | DateTime                                 |
| `Score`                  | はい        | -217, 34970                                                            | 3236           | いいえ     |                                                                                              | Int32                                    |
| `ViewCount`              | はい        | 2, 13962748                                                            | 170867         | いいえ     |                                                                                              | UInt32                                   |
| `Body`                   | いいえ         | -                                                                      | -              | いいえ     |                                                                                              | String                                   |
| `OwnerUserId`            | はい        | -1, 4056915                                                            | 6256237        | はい    |                                                                                              | Int32                                    |
| `OwnerDisplayName`       | いいえ         | -                                                                      | 181251         | はい    | Nullを空の文字列とみなす                                                                                | String                                   |
| `LastEditorUserId`       | はい        | -1, 9999993                                                            | 1104694        | はい    | 0値はNull用に使用可能な未使用値                                                              | Int32                                    |
| `LastEditorDisplayName`  | いいえ         | -                                                                      | 70952          | はい    | Nullを空の文字列とみなします。LowCardinalityをテストしたが、メリットはありません                                                         | String                                   |
| `LastEditDate`           | いいえ         | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000           | -              | いいえ     | ミリ秒の粒度は必要ありません。DateTimeを使用                                                    | DateTime                                 |
| `LastActivityDate`       | いいえ         | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000           | -              | いいえ     | ミリ秒の粒度は必要ありません。DateTimeを使用                                                    | DateTime                                 |
| `Title`                  | いいえ         | -                                                                      | -              | いいえ     | Nullを空の文字列とみなす                                                                                | String                                   |
| `Tags`                   | いいえ         | -                                                                      | -              | いいえ     | Nullを空の文字列とみなす                                                                                | String                                   |
| `AnswerCount`            | はい        | 0, 518                                                                 | 216            | いいえ     | Nullと0を同じとする                                                                            | UInt16                                   |
| `CommentCount`           | はい        | 0, 135                                                                 | 100            | いいえ     | Nullと0を同じとする                                                                            | UInt8                                    |
| `FavoriteCount`          | はい        | 0, 225                                                                 | 6              | はい    | Nullと0を同じとする                                                                            | UInt8                                    |
| `ContentLicense`         | いいえ         | -                                                                      | 3              | いいえ     | LowCardinalityがFixedStringを上回る                                                             | LowCardinality(String)                   |
| `ParentId`               | いいえ         | -                                                                      | 20696028       | はい    | Nullを空の文字列とみなす                                                                                | String                                   |
| `CommunityOwnedDate`     | いいえ         | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000           | -              | はい    | Nullの場合はデフォルト1970-01-01と見なします。ミリ秒の粒度は必要ありません。DateTimeを使用                                       | DateTime                                 |
| `ClosedDate`             | いいえ         | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000                     | -              | はい    | Nullの場合はデフォルト1970-01-01と見なします。ミリ秒の粒度は必要ありません。DateTimeを使用                                       | DateTime                                 |

<br />

上記により、次のスキーマが得られます：

```sql
CREATE TABLE posts_v2
(
   `Id` Int32,
   `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
   `AcceptedAnswerId` UInt32,
   `CreationDate` DateTime,
   `Score` Int32,
   `ViewCount` UInt32,
   `Body` String,
   `OwnerUserId` Int32,
   `OwnerDisplayName` String,
   `LastEditorUserId` Int32,
   `LastEditorDisplayName` String,
   `LastEditDate` DateTime,
   `LastActivityDate` DateTime,
   `Title` String,
   `Tags` String,
   `AnswerCount` UInt16,
   `CommentCount` UInt8,
   `FavoriteCount` UInt8,
   `ContentLicense` LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT '最適化された型'
```

これにより、以前のテーブルからデータを読み込んでこのテーブルに挿入する簡単な`INSERT INTO SELECT`でポピュレートできます。

```sql
INSERT INTO posts_v2 SELECT * FROM posts

0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

新しいスキーマにはNullが保持されません。上記の挿入により、これらはそれぞれの型のデフォルト値（整数の場合は0、文字列の場合は空の値）に暗黙的に変換されます。ClickHouseはまた、任意の数値をターゲット精度に自動的に変換します。ClickHouseにおける主キー（順序キー）

OLTPデータベースから来たユーザーは、ClickHouseにおける同等の概念を探すことがよくあります。

## 順序キーの選択 {#choosing-an-ordering-key}

ClickHouseがしばしば使用されるスケールでは、メモリとディスクの効率が最重要です。データは、パーツと呼ばれるチャンクでClickHouseテーブルに書き込まれ、バックグラウンドでパーツをマージするルールが適用されます。ClickHouseでは、各パートには独自の主インデックスがあります。パーツがマージされると、マージされたパートの主インデックスもマージされます。パーツの主インデックスは、行のグループごとに1つのインデックスエントリがあります。この手法はスパースインデックスと呼ばれます。

<Image img={schemaDesignIndices} size="md" alt="ClickHouseにおけるスパースインデックス"/>

ClickHouseで選択したキーは、インデックスだけでなく、ディスク上にデータが書き込まれる順序も決定します。これにより、圧縮レベルに劇的な影響を与えることができ、これがクエリパフォーマンスに影響を与えることがあります。ほとんどのカラムの値が連続して書き込まれる順序キーは、選択した圧縮アルゴリズム（およびコーデック）を使用してデータをより効果的に圧縮することを可能にします。

> テーブル内のすべてのカラムは、指定した順序キーの値に基づいてソートされます。キー自体に含まれているかどうかに関係ありません。たとえば、`CreationDate`がキーとして使用されている場合、他のすべてのカラムの値の順序は`CreationDate`カラムの値の順序に対応します。複数の順序キーを指定できます。これは、`SELECT`クエリの`ORDER BY`句と同じセマンティクスで順序付けられます。

順序キーを選択するのに役立つシンプルなルールを適用できます。以下の点は時に対立する場合があるため、これを考慮に入れてください。このプロセスからいくつかのキーを特定できます。通常4〜5個で十分です。

- 一般的なフィルターと一致するカラムを選択してください。カラムが`WHERE`句で頻繁に使用される場合、頻度が低いカラムよりもキーにこれらを優先的に含めてください。
フィルタリング時に総行数の大部分を除外するのに役立つカラムを優先し、読み込む必要のあるデータの量を削減します。
- 他のテーブル内の他のカラムと高い相関関係がありそうなカラムを優先してください。これにより、これらの値も連続して格納され、圧縮が改善されるのに役立ちます。
`GROUP BY`および`ORDER BY`操作を順序キー内のカラムに対してよりメモリ効率良く行うことができます。

順序キーに指定するカラムのサブセットを特定する際には、カラムを特定の順序で宣言します。この順序は、クエリ内の二次キーのフィルタリング効率や、テーブルのデータファイルの圧縮率に大きな影響を与える可能性があります。一般的には、ユニーク性の降順でキーを整理するのが最良です。この際、順序キーの後ろでフィルタリングされるカラムは、前のタプルでフィルタリングされるものよりも効率が低下することを考慮に入れます。これらの振る舞いのバランスを取り、アクセスパターンを考慮に入れてください（そして最も重要なのは、さまざまなモデルをテストしてください）。

### 例 {#example}

上記のガイドラインをpostsテーブルに適用すると、ユーザーが日付と投稿タイプでフィルタリングする分析を実行したいと仮定しましょう。

「過去3ヶ月間でコメントが最も多かった質問は何ですか？」

最初の`posts_v2`テーブルを使用してこの質問のクエリは次のとおりです。最適化された型を持っていても順序キーはありません。

```sql
SELECT
    Id,
    Title,
    CommentCount
FROM posts_v2
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')
ORDER BY CommentCount DESC
LIMIT 3

┌───────Id─┬─Title─────────────────────────────────────────────────────────────┬─CommentCount─┐
│ 78203063 │ How to avoid default initialization of objects in std::vector?     │               74 │
│ 78183948 │ About memory barrier                                               │               52 │
│ 77900279 │ Speed Test for Buffer Alignment: IBM's PowerPC results vs. my CPU │        49 │
└──────────┴───────────────────────────────────────────────────────────────────┴──────────────

10 rows in set. Elapsed: 0.070 sec. Processed 59.82 million rows, 569.21 MB (852.55 million rows/s., 8.11 GB/s.)
Peak memory usage: 429.38 MiB.
```

> ここのクエリは非常に迅速ですが、6000万行すべてが線形スキャンされています - ClickHouseはただ速いのです :) 大規模なTBやPBのスケールでは、順序キーの価値を信頼してください！

`PostTypeId`と`CreationDate`を順序キーとして選択しましょう。

もしかしたら、私たちのケースでは、ユーザーは常に`PostTypeId`でフィルタリングすると期待しています。これは、8のユニーク性を持ち、順序キーの最初のエントリーとして論理的な選択を示しています。日付粒度によるフィルタリング（これがdatetimeフィルタを支援することは未だに期待できます）に十分であるため、私たちは2番目のキーのコンポーネントとして`toDate(CreationDate)`を使用します。これにより、日付は16バイトで表現できるため、より小さなインデックスが生成され、フィルタリングが高速化されます。私たちの最終的なキーエントリーは`CommentCount`です。これは、最も多くのコメントが付いた投稿を見つけるのに役立ちます（最終的なソートです）。 

```sql
CREATE TABLE posts_v3
(
        `Id` Int32,
        `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
        `AcceptedAnswerId` UInt32,
        `CreationDate` DateTime,
        `Score` Int32,
        `ViewCount` UInt32,
        `Body` String,
        `OwnerUserId` Int32,
        `OwnerDisplayName` String,
        `LastEditorUserId` Int32,
        `LastEditorDisplayName` String,
        `LastEditDate` DateTime,
        `LastActivityDate` DateTime,
        `Title` String,
        `Tags` String,
        `AnswerCount` UInt16,
        `CommentCount` UInt8,
        `FavoriteCount` UInt8,
        `ContentLicense` LowCardinality(String),
        `ParentId` String,
        `CommunityOwnedDate` DateTime,
        `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
COMMENT '順序キー'

--既存のテーブルからテーブルをポピュレート

INSERT INTO posts_v3 SELECT * FROM posts_v2

0 rows in set. Elapsed: 158.074 sec. Processed 59.82 million rows, 76.21 GB (378.42 thousand rows/s., 482.14 MB/s.)
Peak memory usage: 6.41 GiB.


私たちの前のクエリの応答時間が3倍以上改善されました：

SELECT
    Id,
    Title,
    CommentCount
FROM posts_v3
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')
ORDER BY CommentCount DESC
LIMIT 3

10 rows in set. Elapsed: 0.020 sec. Processed 290.09 thousand rows, 21.03 MB (14.65 million rows/s., 1.06 GB/s.)
```

特定の型と適切な順序キーを使用することで達成された圧縮の改善に関心のあるユーザーは、[ClickHouseの圧縮](/data-compression/compression-in-clickhouse)を参照してください。さらに圧縮を改善する必要がある場合、適切なカラム圧縮コーデックの選択のセクションもお勧めします。[ClickHouseにおける圧縮を選択する](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)をご覧ください。
## 次: データモデリング技術 {#next-data-modeling-techniques}

これまでに、私たちは単一のテーブルのみを移行しました。これは、いくつかのコアな ClickHouse の概念を導入することを可能にしましたが、残念ながらほとんどのスキーマはこれほど単純ではありません。

以下にリストされた他のガイドでは、最適な ClickHouse クエリを実行するために、より広範なスキーマを再構築するためのさまざまな技術を探ります。このプロセス全体を通じて、`Posts` を分析クエリが実行される中心的なテーブルとして維持することを目指しています。他のテーブルも個別にクエリされることは可能ですが、ほとんどの分析は `posts` の文脈で行われると仮定します。

> このセクションでは、他のテーブルの最適化されたバリアントを使用します。これらのスキーマを提供しますが、簡潔さのために決定された内容は省略します。これらは以前に説明したルールに基づいており、決定を推測するのは読者にお任せします。

以下のアプローチは、読み取りを最適化し、クエリパフォーマンスを向上させるために JOIN を使用する必要性を最小限に抑えることを目的としています。ClickHouse では JOIN が完全にサポートされていますが、最適なパフォーマンスを得るためには控えめに使用することをお勧めします（JOIN クエリでは 2 〜 3 のテーブルが適切です）。

> ClickHouse には外部キーの概念がありません。これにより、ジョインは可能ですが、参照整合性はユーザーがアプリケーションレベルで管理することになります。ClickHouse のような OLAP システムでは、データ整合性はしばしばアプリケーションレベルまたはデータ取り込みプロセス中に管理され、データベース自体によって強制されることはなく、大きなオーバーヘッドが発生します。このアプローチにより、より柔軟性が高まり、データの挿入が速くなります。これは、非常に大きなデータセットに対する読み取りおよび挿入クエリの速度とスケーラビリティに焦点を当てた ClickHouse に合致しています。

クエリ時にジョインの使用を最小限に抑えるために、ユーザーにはいくつかのツール/アプローチがあります：

- [**データの非正規化**](/data-modeling/denormalization) - テーブルを統合し、1:1 関係でない複雑な型を使用してデータを非正規化します。これは通常、クエリ時のジョインを挿入時に移動させることを含みます。
- [**辞書**](/dictionary) - 直接的なジョインおよびキー値検索を処理するための ClickHouse 特有の機能です。
- [**インクリメンタル マテリアライズド ビュー**](/materialized-view/incremental-materialized-view) - クエリ時の計算コストを挿入時に移動させる ClickHouse の機能で、集計値をインクリメンタルに計算する能力も含まれます。
- [**リフレッシュ可能なマテリアライズド ビュー**](/materialized-view/refreshable-materialized-view) - 他のデータベース製品で使用されるマテリアライズド ビューと似ており、クエリの結果を定期的に計算し、その結果をキャッシュします。

これらのアプローチのそれぞれをガイドごとに探り、各アプローチが適切な場合を強調し、Stack Overflow データセットに対してどのように適用できるかを示す例を提供します。
