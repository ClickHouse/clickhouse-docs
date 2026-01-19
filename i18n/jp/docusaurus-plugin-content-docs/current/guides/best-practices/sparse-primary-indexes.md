---
sidebar_label: 'プライマリインデックス'
sidebar_position: 1
description: 'このガイドでは、ClickHouse におけるインデックスの仕組みについて詳しく解説します。'
title: 'ClickHouse におけるプライマリインデックスの実践的入門'
slug: /guides/best-practices/sparse-primary-indexes
show_related_blogs: true
doc_type: 'guide'
keywords: ['プライマリインデックス', 'インデックス作成', 'パフォーマンス', 'クエリ最適化', 'ベストプラクティス']
---

import sparsePrimaryIndexes01 from '@site/static/images/guides/best-practices/sparse-primary-indexes-01.png';
import sparsePrimaryIndexes02 from '@site/static/images/guides/best-practices/sparse-primary-indexes-02.png';
import sparsePrimaryIndexes03a from '@site/static/images/guides/best-practices/sparse-primary-indexes-03a.png';
import sparsePrimaryIndexes03b from '@site/static/images/guides/best-practices/sparse-primary-indexes-03b.png';
import sparsePrimaryIndexes04 from '@site/static/images/guides/best-practices/sparse-primary-indexes-04.png';
import sparsePrimaryIndexes05 from '@site/static/images/guides/best-practices/sparse-primary-indexes-05.png';
import sparsePrimaryIndexes06 from '@site/static/images/guides/best-practices/sparse-primary-indexes-06.png';
import sparsePrimaryIndexes07 from '@site/static/images/guides/best-practices/sparse-primary-indexes-07.png';
import sparsePrimaryIndexes08 from '@site/static/images/guides/best-practices/sparse-primary-indexes-08.png';
import sparsePrimaryIndexes09a from '@site/static/images/guides/best-practices/sparse-primary-indexes-09a.png';
import sparsePrimaryIndexes09b from '@site/static/images/guides/best-practices/sparse-primary-indexes-09b.png';
import sparsePrimaryIndexes09c from '@site/static/images/guides/best-practices/sparse-primary-indexes-09c.png';
import sparsePrimaryIndexes10 from '@site/static/images/guides/best-practices/sparse-primary-indexes-10.png';
import sparsePrimaryIndexes11 from '@site/static/images/guides/best-practices/sparse-primary-indexes-11.png';
import sparsePrimaryIndexes12a from '@site/static/images/guides/best-practices/sparse-primary-indexes-12a.png';
import sparsePrimaryIndexes12b1 from '@site/static/images/guides/best-practices/sparse-primary-indexes-12b-1.png';
import sparsePrimaryIndexes12b2 from '@site/static/images/guides/best-practices/sparse-primary-indexes-12b-2.png';
import sparsePrimaryIndexes12c1 from '@site/static/images/guides/best-practices/sparse-primary-indexes-12c-1.png';
import sparsePrimaryIndexes12c2 from '@site/static/images/guides/best-practices/sparse-primary-indexes-12c-2.png';
import sparsePrimaryIndexes13a from '@site/static/images/guides/best-practices/sparse-primary-indexes-13a.png';
import sparsePrimaryIndexes14a from '@site/static/images/guides/best-practices/sparse-primary-indexes-14a.png';
import sparsePrimaryIndexes14b from '@site/static/images/guides/best-practices/sparse-primary-indexes-14b.png';
import sparsePrimaryIndexes15a from '@site/static/images/guides/best-practices/sparse-primary-indexes-15a.png';
import sparsePrimaryIndexes15b from '@site/static/images/guides/best-practices/sparse-primary-indexes-15b.png';
import Image from '@theme/IdealImage';


# ClickHouse におけるプライマリインデックス実践入門 \{#a-practical-introduction-to-primary-indexes-in-clickhouse\}

## はじめに \{#introduction\}

このガイドでは、ClickHouse におけるインデックスについて詳しく解説します。以下の点を例示し、詳細に説明します。

- [ClickHouse のインデックスが従来のリレーショナルデータベース管理システムとどのように異なるか](#an-index-design-for-massive-data-scales)
- [ClickHouse がテーブルのスパースなプライマリインデックスをどのように構築・利用しているか](#a-table-with-a-primary-key)
- [ClickHouse におけるインデックス設計のベストプラクティスのいくつか](#using-multiple-primary-indexes)

このガイドに記載されているすべての ClickHouse の SQL 文とクエリは、必要に応じてご自身のマシン上で実行できます。
ClickHouse のインストール方法と導入手順については、[クイックスタート](/get-started/quick-start)を参照してください。

:::note
このガイドでは、ClickHouse のスパースなプライマリインデックスに焦点を当てています。

ClickHouse の[セカンダリデータスキッピングインデックス](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)については、[チュートリアル](/guides/best-practices/skipping-indexes.md)を参照してください。
:::

### データセット \{#data-set\}

このガイド全体を通して、匿名化された Web トラフィックのサンプルデータセットを使用します。

- サンプルデータセットから 887 万行（イベント）のサブセットを使用します。
- 非圧縮時のデータサイズは 887 万イベントで約 700 MB です。ClickHouse に保存すると 200 MB に圧縮されます。
- このサブセットでは、各行には、特定の時刻（`EventTime` カラム）に特定の URL（`URL` カラム）をクリックしたインターネットユーザー（`UserID` カラム）を示す 3 つのカラムが含まれています。

これら 3 つのカラムがあれば、すでに次のような典型的な Web 分析クエリを記述できます。

- 「特定のユーザーに対して、最もクリックされた URL の上位 10 件は何か？」
- 「特定の URL を最も頻繁にクリックしたユーザーの上位 10 人は誰か？」
- 「ユーザーが特定の URL をクリックする最も一般的な時間帯（例：曜日）はいつか？」

### テストマシン \{#test-machine\}

本ドキュメントに記載しているすべての実行時の数値は、Apple M1 Pro チップと 16GB の RAM を搭載した MacBook Pro 上で、ClickHouse 22.2.1 をローカルで実行した結果に基づいています。

### テーブル全体スキャン \{#a-full-table-scan\}

プライマリキーなしのデータセットに対してクエリがどのように実行されるかを確認するため、次の SQL DDL ステートメントを実行して、MergeTree テーブルエンジンを使用したテーブルを作成します。

```sql
CREATE TABLE hits_NoPrimaryKey
(
    `UserID` UInt32,
    `URL` String,
    `EventTime` DateTime
)
ENGINE = MergeTree
PRIMARY KEY tuple();
```

次に、以下の SQL `INSERT` ステートメントを実行して、`hits` データセットの一部をテーブルに挿入します。
ここでは、clickhouse.com 上でリモート提供されている完全なデータセットの一部をロードするために、[URL table function](/sql-reference/table-functions/url.md) を使用します。


```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```

レスポンスは以下のとおりです：

```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```

ClickHouse クライアントの出力結果から、上記の文がテーブルに 887 万行を挿入したことが分かります。

最後に、このガイドの後半での議論を分かりやすくし、図や結果を再現しやすくするため、FINAL キーワードを指定してテーブルを [OPTIMIZE](/sql-reference/statements/optimize.md) します。


```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
一般的に、データをテーブルにロードした直後にすぐ最適化を行う必要はなく、推奨もされません。この例でそれが必要になる理由は、この後で明らかになります。
:::

では最初の Web アナリティクス クエリを実行します。以下では、UserID 749927693 のインターネットユーザーについて、最もクリックされた URL の上位 10 件を算出します。

```sql
SELECT URL, count(URL) AS Count
FROM hits_NoPrimaryKey
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のとおりです。

```response
┌─URL────────────────────────────┬─Count─┐
│ http://auto.ru/chatay-barana.. │   170 │
│ http://auto.ru/chatay-id=371...│    52 │
│ http://public_search           │    45 │
│ http://kovrik-medvedevushku-...│    36 │
│ http://forumal                 │    33 │
│ http://korablitz.ru/L_1OFFER...│    14 │
│ http://auto.ru/chatay-id=371...│    14 │
│ http://auto.ru/chatay-john-D...│    13 │
│ http://auto.ru/chatay-john-D...│    10 │
│ http://wot/html?page/23600_m...│     9 │
└────────────────────────────────┴───────┘

10 rows in set. Elapsed: 0.022 sec.
# highlight-next-line
Processed 8.87 million rows,
70.45 MB (398.53 million rows/s., 3.17 GB/s.)
```

ClickHouse クライアントの結果出力から、ClickHouse がテーブル全体のフルテーブルスキャンを実行したことが分かります。テーブル内の 887 万行のそれぞれの行がすべて ClickHouse に読み出されました。これはスケールしません。

これを（かなり）効率的かつ（大幅に）高速にするためには、適切なプライマリキーを持つテーブルを使用する必要があります。これにより、ClickHouse はプライマリキーのカラムに基づいて自動的にスパースなプライマリインデックスを作成できるようになり、そのインデックスを使ってこの例のクエリの実行を大幅に高速化できます。


## ClickHouse における索引設計 \{#clickhouse-index-design\}

### 大規模データスケール向けのインデックス設計 \{#an-index-design-for-massive-data-scales\}

従来のリレーショナルデータベース管理システムでは、プライマリインデックスにはテーブルの各行に対して 1 つのエントリが含まれます。今回のデータセットの場合、プライマリインデックスには 887 万件のエントリが含まれることになります。このようなインデックスにより特定の行を高速に特定できるため、ルックアップクエリやポイント更新が高効率になります。`B(+)-Tree` データ構造におけるエントリ探索の平均時間計算量は `O(log n)` です。より正確には `log_b n = log_2 n / log_2 b` であり、ここで `b` は `B(+)-Tree` の分岐係数、`n` はインデックスされた行数です。`b` は通常数百から数千の範囲であるため、`B(+)-Trees` は非常に浅い構造となり、レコードを特定するために必要なディスクシークはわずかです。887 万行、分岐係数 1000 の場合、平均で 2.3 回のディスクシークが必要です。この能力にはコストが伴います。追加のディスクおよびメモリオーバーヘッド、テーブルに新しい行やインデックスエントリを追加する際の挿入コストの増大、さらに場合によっては B-Tree の再バランス（再平衡）処理が必要になります。

B-Tree インデックスに伴う課題を踏まえ、ClickHouse のテーブルエンジンは別のアプローチを採用しています。ClickHouse の [MergeTree Engine Family](/engines/table-engines/mergetree-family/index.md) は、大規模なデータ量を処理するために設計・最適化されています。これらのテーブルは、毎秒数百万行の挿入を受け付け、非常に大きなデータ量（数百 PB）を保存できるよう設計されています。データはテーブルに対して[パーツ単位](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)で素早く書き込まれ、バックグラウンドでパーツをマージするためのルールが適用されます。ClickHouse では各パーツが独自のプライマリインデックスを持ちます。パーツがマージされると、マージ後のパーツのプライマリインデックスも同様にマージされます。ClickHouse が想定する非常に大規模なスケールでは、ディスクおよびメモリ効率を極めて高く保つことが最重要です。そのため、すべての行をインデックスする代わりに、あるパーツのプライマリインデックスは、行のグループ（「granule」と呼ぶ）ごとに 1 つのインデックスエントリ（「mark」と呼ぶ）だけを持ちます。この手法は **sparse index**（スパース索引）と呼ばれます。

スパースインデックスが可能なのは、ClickHouse がパーツ内の行を、プライマリキーのカラムでソートされた状態でディスクに保存しているためです。B-Tree ベースのインデックスのように単一行を直接特定するのではなく、スパースなプライマリインデックスは、インデックスエントリ上での二分探索を通じて、クエリと一致する可能性のある行グループを素早く特定できるようにします。特定された、一致の可能性がある行グループ（granule）は、その後 ClickHouse エンジンへ並列にストリーミングされ、一致行の探索が行われます。このインデックス設計により、プライマリインデックスを小さく保ち（完全にメインメモリに収まる必要があります）、なおかつクエリ実行時間を大幅に短縮できます。特に、データ分析ユースケースで典型的なレンジクエリに対して効果を発揮します。

以下では、ClickHouse がスパースなプライマリインデックスをどのように構築・利用しているかを詳細に説明します。記事の後半では、インデックス（プライマリキーのカラム）を構築するために使用されるテーブルカラムの選択・削除・順序付けに関するベストプラクティスについても解説します。

### 主キーを持つテーブル \{#a-table-with-a-primary-key\}

UserID と URL を主キーを構成するカラムとする複合主キーを持つテーブルを作成します。

```sql
CREATE TABLE hits_UserID_URL
(
    `UserID` UInt32,
    `URL` String,
    `EventTime` DateTime
)
ENGINE = MergeTree
-- highlight-next-line
PRIMARY KEY (UserID, URL)
ORDER BY (UserID, URL, EventTime)
SETTINGS index_granularity_bytes = 0, compress_primary_key = 0;
```

[//]: # "<details open>"

<details>
  <summary>
    DDL ステートメントの詳細
  </summary>

  <p>
    このガイドの後の説明を簡潔にし、図や結果を再現可能にするために、DDL ステートメントは次のように定義されています。

    <ul>
      <li>
        <code>ORDER BY</code> 句を使って、このテーブルに対して複合ソートキーを指定します。
      </li>

      <li>
        次の設定を通じて、プライマリインデックスが持つインデックスエントリの数を明示的に制御します。

        <ul>
          <li>
            <code>index&#95;granularity</code>: 既定値である 8192 に明示的に設定します。これは、8192 行ごとのグループごとに、プライマリインデックスが 1 つのインデックスエントリを持つことを意味します。例えば、テーブルに 16384 行が含まれている場合、インデックスは 2 つのインデックスエントリを持ちます。
          </li>

          <li>
            <code>index&#95;granularity&#95;bytes</code>: <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">adaptive index granularity</a> を無効にするために 0 に設定します。Adaptive index granularity とは、次のいずれかが真である場合に、ClickHouse が自動的に n 行のグループに対して 1 つのインデックスエントリを作成することを意味します。

            <ul>
              <li>
                <code>n</code> が 8192 より小さく、かつその <code>n</code> 行分の合計の行データサイズが 10 MB 以上である場合（<code>index&#95;granularity&#95;bytes</code> の既定値）。
              </li>

              <li>
                <code>n</code> 行分の合計の行データサイズが 10 MB 未満だが、<code>n</code> が 8192 の場合。
              </li>
            </ul>
          </li>

          <li>
            <code>compress&#95;primary&#95;key</code>: <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">プライマリインデックスの圧縮</a>を無効にするために 0 に設定します。これにより、後で必要に応じてその内容を確認できるようになります。
          </li>
        </ul>
      </li>
    </ul>
  </p>
</details>

上記の DDL ステートメントにおけるプライマリキーにより、指定された 2 つのキーのカラムに基づくプライマリインデックスが作成されます。

<br />

次にデータを挿入します。


```sql
INSERT INTO hits_UserID_URL SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```

レスポンスは次のとおりです。

```response
0 rows in set. Elapsed: 149.432 sec. Processed 8.87 million rows, 18.40 GB (59.38 thousand rows/s., 123.16 MB/s.)
```

<br />

次にテーブルを最適化します。

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br />

次のクエリを使って、このテーブルに関するメタデータを取得できます。


```sql
SELECT
    part_type,
    path,
    formatReadableQuantity(rows) AS rows,
    formatReadableSize(data_uncompressed_bytes) AS data_uncompressed_bytes,
    formatReadableSize(data_compressed_bytes) AS data_compressed_bytes,
    formatReadableSize(primary_key_bytes_in_memory) AS primary_key_bytes_in_memory,
    marks,
    formatReadableSize(bytes_on_disk) AS bytes_on_disk
FROM system.parts
WHERE (table = 'hits_UserID_URL') AND (active = 1)
FORMAT Vertical;
```

レスポンスは以下のとおりです：

```response
part_type:                   Wide
path:                        ./store/d9f/d9f36a1a-d2e6-46d4-8fb5-ffe9ad0d5aed/all_1_9_2/
rows:                        8.87 million
data_uncompressed_bytes:     733.28 MiB
data_compressed_bytes:       206.94 MiB
primary_key_bytes_in_memory: 96.93 KiB
marks:                       1083
bytes_on_disk:               207.07 MiB

1 rows in set. Elapsed: 0.003 sec.
```

ClickHouse クライアントの出力から、次のことがわかります。

* テーブルのデータはディスク上の特定のディレクトリに [wide format](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) で格納されており、そのディレクトリ内にはテーブルの各カラムごとに 1 つのデータファイル（および 1 つの mark ファイル）が存在します。
* テーブルには 887 万行のデータがあります。
* すべての行の非圧縮時の合計データサイズは 733.28 MB です。
* すべての行のディスク上での圧縮後の合計サイズは 206.94 MB です。
* テーブルには 1083 個のエントリ（「marks」と呼ばれる）を持つプライマリインデックスがあり、そのインデックスサイズは 96.93 KB です。
* テーブルのデータファイル、mark ファイル、およびプライマリインデックスファイルを合わせたディスク上での合計サイズは 207.07 MB です。


### データはプライマリキーのカラム順でディスク上に保存される \{#data-is-stored-on-disk-ordered-by-primary-key-columns\}

上で作成したテーブルには次のものがあります。

- 複合[プライマリキー](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` と
- 複合[ソートキー](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`。

:::note

- もしソートキーだけを指定していた場合、プライマリキーは暗黙にソートキーと同一であると定義されます。

- メモリ効率を高めるために、クエリでフィルタリングに使用するカラムだけを含むプライマリキーを明示的に指定しました。プライマリキーに基づくプライマリインデックスはメインメモリに完全にロードされます。

- このガイド内の図の一貫性を保ち、かつ圧縮率を最大化するために、テーブル内のすべてのカラムを含む別のソートキーを定義しました。（たとえばソートなどにより、似たデータがカラム内で互いに近くに配置されていると、そのデータはより高い圧縮率で圧縮されます）。

- プライマリキーとソートキーの両方を指定する場合、プライマリキーはソートキーのプレフィックスである必要があります。
:::

挿入された行は、プライマリキーのカラム（およびソートキーに含まれる追加の `EventTime` カラム）に基づいて、辞書順（昇順）でディスク上に保存されます。

:::note
ClickHouse では、プライマリキーのカラム値が同一の行を複数挿入することができます。この場合（下図の行 1 と行 2 を参照）、最終的な順序は指定されたソートキー、したがって `EventTime` カラムの値によって決まります。
:::

ClickHouse は<a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms
" target="_blank">カラム指向データベース管理システム</a>です。下図に示すように、

- ディスク上での表現としては、テーブルの各カラムごとに 1 つのデータファイル（*.bin）があり、そのカラムのすべての値が<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a>形式で格納されます。
- 約 887 万行は、プライマリキーのカラム（および追加のソートキーのカラム）に基づいて辞書順の昇順でディスク上に保存されます。つまりこのケースでは、
  - まず `UserID`、
  - 次に `URL`、
  - そして最後に `EventTime` の順です。

<Image img={sparsePrimaryIndexes01} size="md" alt="スパースなプライマリインデックス 01" background="white"/>

`UserID.bin`、`URL.bin`、`EventTime.bin` は、`UserID`、`URL`、`EventTime` カラムの値が格納されているディスク上のデータファイルです。

:::note

- プライマリキーはディスク上の行の辞書順を定義するため、テーブルが持てるプライマリキーは 1 つだけです。

- ClickHouse の内部の行番号付け方式（ログメッセージでも使用されます）に合わせるため、行番号は 0 から開始しています。
:::

### データは並列データ処理のためにグラニュールへと編成される \{#data-is-organized-into-granules-for-parallel-data-processing\}

データ処理の観点から、テーブルのカラム値は論理的にグラニュールに分割されます。
グラニュールは、データ処理のために ClickHouse にストリーミングされる、最小の不可分なデータセットです。
つまり、個々の行を読むのではなく、ClickHouse は常に（ストリーミング方式で並列に）行のグループ全体（グラニュール）を読み込みます。
:::note
カラム値は物理的にはグラニュール内部に保存されていません。グラニュールは、クエリ処理のためにカラム値を論理的に編成したものに過ぎません。
:::

次の図は、テーブルの 887 万行（のカラム値）がどのように 1083 個のグラニュールに編成されているかを示しています。これは、テーブルの DDL ステートメントに `index_granularity`（デフォルト値の 8192 に設定）が含まれている結果です。

<Image img={sparsePrimaryIndexes02} size="md" alt="スパースなプライマリインデックス 02" background="white"/>

最初の（ディスク上の物理順序に基づく）8192 行（のカラム値）は論理的にグラニュール 0 に属し、次の 8192 行（のカラム値）はグラニュール 1 に属し、その後も同様に続きます。

:::note

- 最後のグラニュール（グラニュール 1082）は 8192 行未満を「含み」ます。

- このガイドの冒頭の「DDL Statement Details」で述べたように、[adaptive index granularity](/whats-new/changelog/2019.md/#experimental-features-1) を無効化しました（このガイドでの説明を簡潔にし、図や結果を再現可能にするためです）。

  そのため、この例のテーブルでは最後のグラニュールを除き、すべてのグラニュールが同じサイズです。

- adaptive index granularity（index granularity が [デフォルト](/operations/settings/merge-tree-settings#index_granularity_bytes) でアダプティブ）のテーブルでは、一部のグラニュールのサイズは、行データのサイズに応じて 8192 行未満になる場合があります。

- プライマリキーのカラム（`UserID`、`URL`）の一部のカラム値をオレンジ色でマークしました。
  このオレンジ色でマークされたカラム値は、各グラニュールの最初の行のプライマリキーのカラム値です。
  後述するように、これらのオレンジ色でマークされたカラム値が、テーブルのプライマリインデックスのエントリになります。

- ClickHouse の内部番号付け方式（ログメッセージでも使用されます）に合わせるため、グラニュールの番号付けは 0 から開始しています。
:::

### プライマリインデックスはグラニュールごとに 1 つのエントリを持つ \{#the-primary-index-has-one-entry-per-granule\}

プライマリインデックスは、上の図に示したグラニュールに基づいて作成されます。このインデックスは、0 から始まる数値インデックスマークを含む、非圧縮のフラットな配列ファイル（primary.idx）です。

下の図が示すように、インデックスは各グラニュールの最初の行に対応するプライマリキーカラムの値（上の図でオレンジ色で示された値）を保持します。
言い換えると、プライマリインデックスはテーブルの各 8192 行目ごとのプライマリキーカラムの値（プライマリキーカラムで定義された物理的な行の順序に基づく）を保持します。
例えば、

- 最初のインデックスエントリ（下の図の「mark 0」）は、上の図におけるグラニュール 0 の最初の行のキーカラム値を保持しています。
- 2 番目のインデックスエントリ（下の図の「mark 1」）は、上の図におけるグラニュール 1 の最初の行のキーカラム値を保持しており、以降も同様です。

<Image img={sparsePrimaryIndexes03a} size="lg" alt="スパースなプライマリインデックス 03a" background="white"/>

全体として、このテーブル（887 万行、1083 個のグラニュール）に対して、インデックスには 1083 個のエントリがあります。

<Image img={sparsePrimaryIndexes03b} size="md" alt="スパースなプライマリインデックス 03b" background="white"/>

:::note

- [アダプティブなインデックス粒度](/whats-new/changelog/2019.md/#experimental-features-1)を持つテーブルでは、プライマリインデックス内に、テーブルの最後の行のプライマリキーカラムの値を記録する「最終」の追加マークも 1 つ保存されます。しかし、このガイドでは議論を簡略化し、図や結果を再現可能にするためにアダプティブなインデックス粒度を無効化しているため、本例のテーブルのインデックスにはこの最終マークは含まれていません。

- プライマリインデックスファイルは完全にメインメモリに読み込まれます。ファイルサイズが利用可能な空きメモリより大きい場合、ClickHouse はエラーを返します。
:::

<details>
    <summary>
    プライマリインデックスの内容を確認する
    </summary>
    <p>

セルフマネージドの ClickHouse クラスターでは、サンプルテーブルのプライマリインデックスの内容を確認するために、<a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">file テーブル関数</a>を使用できます。

このためには、まず稼働中のクラスター内のノードの <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> にプライマリインデックスファイルをコピーする必要があります:
<ul>
<li>ステップ 1: プライマリインデックスファイルを含むパーツのパス (part-path) を取得する</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

テストマシンでは `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4` が返されます。

<li>ステップ 2: user_files_path を取得する</li>
Linux における<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">デフォルトの user_files_path</a> は
`/var/lib/clickhouse/user_files/`
です。

Linux では、次のコマンドで変更されているかを確認できます: `$ grep user_files_path /etc/clickhouse-server/config.xml`

テストマシンではパスは `/Users/tomschreiber/Clickhouse/user_files/` です。

<li>ステップ 3: プライマリインデックスファイルを user_files_path にコピーする</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

</ul>

<br/>
これで SQL を使ってプライマリインデックスの内容を確認できます:
<ul>
<li>エントリ数を取得する</li>
`
SELECT count( )<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String');
`
`1083` が返されます。

<li>最初の 2 つのインデックスマークを取得する</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 0, 2;
`

返される値:

`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`

<li>最後のインデックスマークを取得する</li>
`
SELECT UserID, URL FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
返される値:
`
4292714039 │ http://sosyal-mansetleri...
`
</ul>
<br/>
これは、サンプルテーブルについて示したプライマリインデックス内容の図と完全に一致しています。

</p>
</details>

プライマリキーのエントリは、各インデックスエントリが特定のデータ範囲の開始位置をマークしているため、インデックスマークと呼ばれます。サンプルテーブルの場合、具体的には次のとおりです。

- UserID のインデックスマーク:

  プライマリインデックスに格納されている `UserID` の値は昇順にソートされています。<br/>
  上記の図における「mark 1」は、グラニュール 1、およびそれ以降のすべてのグラニュールに含まれるテーブル行の `UserID` 値が、4.073.710 以上であることが保証されていることを示しています。

[後ほど説明するように](#the-primary-index-is-used-for-selecting-granules)、このグローバルな順序により、クエリがプライマリキーの 1 列目のカラムをフィルタリングしている場合に、ClickHouse は<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">最初のキーカラムに対するインデックスマーク上での二分探索アルゴリズム</a>を使用できるようになります。

- URL インデックスマーク:

  プライマリキーの `UserID` と `URL` カラムのカーディナリティがほぼ同じであるため、一般的に、先頭のカラム以外のすべてのキーカラムに対するインデックスマークは、「少なくとも現在のグラニュール内で、直前のキーカラムの値がすべてのテーブル行で同じである範囲」に限って、データ範囲を示すだけになります。<br/>
  例えば、上の図で mark 0 と mark 1 の UserID の値が異なる場合、ClickHouse は、グラニュール 0 内のすべてのテーブル行の URL の値が `'http://showtopics.html%3...'` 以上であるとは仮定できません。しかし、もし上の図で mark 0 と mark 1 の UserID の値が同じであれば（つまり、グラニュール 0 内のすべてのテーブル行で UserID の値が同じであることを意味します）、ClickHouse は、グラニュール 0 内のすべてのテーブル行の URL の値が `'http://showtopics.html%3...'` 以上であると仮定できます。

  このことがクエリ実行のパフォーマンスにどのような影響を与えるかについては、後ほど詳しく説明します。

### プライマリ索引はグラニュールの選択に使用される \{#the-primary-index-is-used-for-selecting-granules\}

これで、プライマリ索引を活用してクエリを実行できるようになりました。

次のクエリは、UserID 749927693 について最もクリックされた URL の上位 10 件を求めます。

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のとおりです。

```response
┌─URL────────────────────────────┬─Count─┐
│ http://auto.ru/chatay-barana.. │   170 │
│ http://auto.ru/chatay-id=371...│    52 │
│ http://public_search           │    45 │
│ http://kovrik-medvedevushku-...│    36 │
│ http://forumal                 │    33 │
│ http://korablitz.ru/L_1OFFER...│    14 │
│ http://auto.ru/chatay-id=371...│    14 │
│ http://auto.ru/chatay-john-D...│    13 │
│ http://auto.ru/chatay-john-D...│    10 │
│ http://wot/html?page/23600_m...│     9 │
└────────────────────────────────┴───────┘

10 rows in set. Elapsed: 0.005 sec.
# highlight-next-line
Processed 8.19 thousand rows,
740.18 KB (1.53 million rows/s., 138.59 MB/s.)
```

ClickHouse クライアントの出力から、フルテーブルスキャンを行う代わりに、8.19 千行だけが ClickHouse にストリーミングされていることがわかります。

<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">トレースログ</a>が有効になっている場合、ClickHouse サーバーログファイルには、ClickHouse が 1083 個の UserID インデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索</a>を実行し、UserID カラム値が `749927693` である行を含んでいる可能性のある granule を特定していることが記録されます。これは平均時間計算量 `O(log2 n)` で 19 ステップを必要とします。

```response
...Executor): Key condition: (column 0 in [749927693, 749927693])
# highlight-next-line
...Executor): Running binary search on index range for part all_1_9_2 (1083 marks)
...Executor): Found (LEFT) boundary mark: 176
...Executor): Found (RIGHT) boundary mark: 177
...Executor): Found continuous range in 19 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
# highlight-next-line
              1/1083 marks by primary key, 1 marks to read from 1 ranges
...Reading ...approx. 8192 rows starting from 1441792
```

上のトレースログから、既存の 1083 個のマークのうち 1 つだけがクエリを満たしていることが分かります。

<details>
  <summary>
    トレースログの詳細
  </summary>

  <p>
    マーク 176 が特定されています（「found left boundary mark」は包含、「found right boundary mark」は排他的）ので、グラニュール 176 からの 8192 行すべて（これは行 1,441,792 から始まります ― このガイドの後半で確認します）が ClickHouse にストリーミングされ、その中から `749927693` という UserID カラム値を持つ実際の行が検索されます。
  </p>
</details>

また、この動作は、サンプルクエリで<a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN 句</a>を使うことで再現できます。

```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のようになります。


```response
┌─explain───────────────────────────────────────────────────────────────────────────────┐
│ Expression (Projection)                                                               │
│   Limit (preliminary LIMIT (without OFFSET))                                          │
│     Sorting (Sorting for ORDER BY)                                                    │
│       Expression (Before ORDER BY)                                                    │
│         Aggregating                                                                   │
│           Expression (Before GROUP BY)                                                │
│             Filter (WHERE)                                                            │
│               SettingQuotaAndLimits (Set limits and quota after reading from storage) │
│                 ReadFromMergeTree                                                     │
│                 Indexes:                                                              │
│                   PrimaryKey                                                          │
│                     Keys:                                                             │
│                       UserID                                                          │
│                     Condition: (UserID in [749927693, 749927693])                     │
│                     Parts: 1/1                                                        │
# highlight-next-line
│                     Granules: 1/1083                                                  │
└───────────────────────────────────────────────────────────────────────────────────────┘

16 rows in set. Elapsed: 0.003 sec.
```

クライアントの出力から、1083 個の granule のうち 1 個が、UserID カラム値が 749927693 の行を含んでいる可能性がある granule として選択されていることが分かります。

:::note 結論
クエリが複合キーを構成するカラムのうち先頭のキー・カラムでフィルタリングを行っている場合、ClickHouse はそのキー・カラムのインデックスマークに対して二分探索アルゴリズムを実行します。
:::

<br />

前述のとおり、ClickHouse はスパースなプライマリ索引を使って、クエリにマッチする行を含んでいる可能性のある granule を二分探索により高速に選択します。

これは、ClickHouse のクエリ実行における**第 1 段階（granule の選択）**です。

**第 2 段階（データ読み取り）**では、ClickHouse は選択された granule の位置を特定し、そのすべての行を ClickHouse エンジンにストリーミングして、実際にクエリにマッチしている行を見つけます。

この第 2 段階については、次のセクションでより詳しく説明します。


### マークファイルはグラニュールの位置特定に使用される \{#mark-files-are-used-for-locating-granules\}

次の図は、このテーブルのプライマリインデックスファイルの一部を示しています。

<Image img={sparsePrimaryIndexes04} size="md" alt="スパースなプライマリインデックス 04" background="white"/>

前述のとおり、インデックス内の 1083 個の UserID マークに対して二分探索を行うことで、マーク 176 が特定されました。対応するグラニュール 176 には、UserID カラムの値が 749.927.693 の行が含まれている可能性があります。

<details>
    <summary>
    Granule Selection Details
    </summary>
    <p>

上の図では、マーク 176 が、関連付けられたグラニュール 176 の最小 UserID 値が 749.927.693 より小さく、かつ次のマーク（マーク 177）に対応するグラニュール 177 の最小 UserID 値がこの値より大きい、最初のインデックスエントリであることが分かります。したがって、UserID カラムの値が 749.927.693 の行を含んでいる可能性があるのは、マーク 176 に対応するグラニュール 176 だけです。
</p>
</details>

グラニュール 176 内の行の中に UserID カラムの値が 749.927.693 のものが存在するかどうかを確認するには、このグラニュールに属するすべての 8192 行を ClickHouse にストリーミングする必要があります。

そのためには、ClickHouse はグラニュール 176 の物理的な位置を知る必要があります。

ClickHouse では、このテーブルのすべてのグラニュールの物理的な位置はマークファイルに保存されます。データファイルと同様に、テーブルの各カラムごとに 1 つのマークファイルがあります。

次の図は、テーブルの `UserID`、`URL`、`EventTime` カラムのグラニュールの物理的な位置を保存している 3 つのマークファイル `UserID.mrk`、`URL.mrk`、`EventTime.mrk` を示しています。

<Image img={sparsePrimaryIndexes05} size="md" alt="スパースなプライマリインデックス 05" background="white"/>

すでに説明したように、プライマリインデックスはフラットな非圧縮配列ファイル（primary.idx）であり、0 から始まる番号付きのインデックスマークを含みます。

同様に、マークファイルも 0 から始まる番号付きのマークを含む、フラットな非圧縮配列ファイル（*.mrk）です。

ClickHouse が、クエリに一致する行を含んでいる可能性のあるグラニュールに対応するインデックスマークを特定・選択すると、マークファイルに対して配列位置によるルックアップを行うことで、そのグラニュールの物理的な位置を取得できます。

特定のカラム用の各マークファイルエントリは、オフセットという形で 2 つの位置情報を保持しています。

- 1 つ目のオフセット（上の図の 'block_offset'）は、選択されたグラニュールの圧縮版を含む、<a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">ブロック</a>を、<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮済み</a>カラムデータファイル内で特定します。この圧縮ブロックには、複数の圧縮グラニュールが含まれている可能性があります。特定された圧縮ファイルブロックは、読み込み時にメインメモリ上に展開（解凍）されます。

- 2 つ目のオフセット（上の図の 'granule_offset'）は、マークファイルから提供されるもので、非圧縮ブロックデータ内でのグラニュールの位置を示します。

特定された非圧縮グラニュールに属する 8192 行はすべて、後続の処理のために ClickHouse にストリーミングされます。

:::note

- [ワイド形式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)で、かつ [adaptive index granularity](/whats-new/changelog/2019.md/#experimental-features-1) を使用していないテーブルでは、ClickHouse は上図のような `.mrk` マークファイルを使用します。これらには、各エントリごとに 2 つの 8 バイト長のアドレスが含まれます。これらのエントリは、すべて同じサイズのグラニュールの物理的位置を表します。

インデックスの粒度は[デフォルト](/operations/settings/merge-tree-settings#index_granularity_bytes)ではアダプティブですが、このガイドでの説明を分かりやすくし、図や結果を再現可能にするために、このサンプルテーブルではアダプティブインデックス粒度を無効にしています。このテーブルは、データサイズが [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)（セルフマネージドクラスターではデフォルトで 10 MB）より大きいため、ワイド形式を使用しています。

- ワイド形式でアダプティブインデックス粒度を使用しているテーブルでは、ClickHouse は `.mrk2` マークファイルを使用します。これらは `.mrk` マークファイルと同様のエントリを持ちますが、各エントリには追加の 3 つ目の値として、そのエントリが対応するグラニュールの行数が含まれます。

- [コンパクト形式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)のテーブルでは、ClickHouse は `.mrk3` マークファイルを使用します。

:::

:::note マークファイルを使う理由

なぜプライマリインデックスは、インデックスマークに対応するグラニュールの物理的な位置を直接保持していないのでしょうか？

ClickHouse が想定しているような非常に大規模なスケールでは、ディスクとメモリを極めて効率的に使用することが重要だからです。

プライマリインデックスファイルはメインメモリに収まる必要があります。

今回のサンプルクエリでは、ClickHouse はプライマリインデックスを使って、クエリにマッチする行を含んでいる可能性があるグラニュールを 1 つだけ選択しました。ClickHouse が物理的な位置を知る必要があるのは、その 1 つのグラニュールだけであり、その情報を使って対応する行をストリーミングし、後続の処理を行います。

さらに、このオフセット情報が必要なのは、UserID と URL のカラムだけです。

`EventTime` のようにクエリで使用されていないカラムには、オフセット情報は不要です。

今回のサンプルクエリでは、ClickHouse が必要とするのは、UserID データファイル (UserID.bin) 内のグラニュール 176 の 2 つの物理位置オフセットと、URL データファイル (URL.bin) 内のグラニュール 176 の 2 つの物理位置オフセットだけです。

mark ファイルによる間接参照により、プライマリインデックス内に、3 つのカラムすべてについて 1083 個のグラニュールそれぞれの物理位置エントリを直接格納することを避けています。これにより、メインメモリ内に不要な（使用されない可能性のある）データを保持せずに済みます。
:::

次の図とその後の説明では、サンプルクエリにおいて ClickHouse が UserID.bin データファイル内のグラニュール 176 をどのように特定するかを示します。

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

このガイドの前半で説明したように、ClickHouse はプライマリインデックスマーク 176 を選択し、その結果としてグラニュール 176 を、クエリにマッチする行を含んでいる可能性があるものとして選びました。

ClickHouse は、インデックスから選択したマーク番号 (176) を使用して、UserID.mrk mark ファイルに対して位置配列によるルックアップを行い、グラニュール 176 を特定するための 2 つのオフセットを取得します。

示されているように、1 つ目のオフセットは、UserID.bin データファイル内で、圧縮されたグラニュール 176 を含む圧縮ファイルブロックの位置を特定します。

特定されたファイルブロックがメインメモリ上に展開（解凍）されると、mark ファイル中の 2 つ目のオフセットを使って、展開済みデータ内のグラニュール 176 を特定できます。

ClickHouse がサンプルクエリ（UserID が 749.927.693 のインターネットユーザーについて、最もクリックされた URL の上位 10 件）を実行するには、UserID.bin データファイルと URL.bin データファイルの両方からグラニュール 176 を特定し（かつそのすべての値をストリーミングする）必要があります。

上の図では、ClickHouse が UserID.bin データファイル用のグラニュールをどのように特定しているかを示しています。

同時に、ClickHouse は URL.bin データファイルについてもグラニュール 176 に対して同じ処理を行います。両方のグラニュールは対応付けられ、ClickHouse エンジンにストリーミングされて後続処理が行われます。すなわち、UserID が 749.927.693 であるすべての行について、グループごとに URL 値を集約・カウントし、その後カウントの降順で URL グループ上位 10 件を最終的な出力として返します。

## 複数のプライマリインデックスの使用 \{#using-multiple-primary-indexes\}

<a name="filtering-on-key-columns-after-the-first"></a>

### セカンダリキーのカラムが非効率になる場合とならない場合がある \{#secondary-key-columns-can-not-be-inefficient\}

クエリが複合キーを構成するカラムのうち先頭のキー・カラムでフィルタしている場合、[ClickHouse はそのキー・カラムのインデックスマークに対して二分探索アルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

では、クエリが複合キーを構成するカラムでフィルタしているものの、それが先頭のキー・カラムではない場合はどうなるでしょうか。

:::note
ここでは、クエリが先頭のキー・カラムではなく、セカンダリキー・カラムのみで明示的にフィルタしているシナリオについて説明します。

クエリが先頭のキー・カラムと、それ以降の任意のキー・カラムの両方でフィルタしている場合、ClickHouse は先頭のキー・カラムのインデックスマークに対して二分探索を実行します。
:::

<br />

<br />

<a name="query-on-url" />

ここでは、URL &quot;[http://public&#95;search](http://public\&#95;search)&quot; を最も頻繁にクリックしたユーザーの上位 10 件を求めるクエリを使用します。

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のとおりです。<a name="query-on-url-slow" />

```response
┌─────UserID─┬─Count─┐
│ 2459550954 │  3741 │
│ 1084649151 │  2484 │
│  723361875 │   729 │
│ 3087145896 │   695 │
│ 2754931092 │   672 │
│ 1509037307 │   582 │
│ 3085460200 │   573 │
│ 2454360090 │   556 │
│ 3884990840 │   539 │
│  765730816 │   536 │
└────────────┴───────┘

10 rows in set. Elapsed: 0.086 sec.
# highlight-next-line
Processed 8.81 million rows,
799.69 MB (102.11 million rows/s., 9.27 GB/s.)
```

クライアントの出力から、[URL カラムが複合主キーの一部である](#a-table-with-a-primary-key)にもかかわらず、ClickHouse がほぼ全表スキャンを実行しかけたことがわかります。ClickHouse は、このテーブルの 887 万行のうち 881 万行を読み取っています。

[trace&#95;logging](/operations/server-configuration-parameters/settings#logger) が有効になっている場合、ClickHouse サーバーのログファイルには、URL カラムの値が &quot;[http://public&#95;search](http://public\&#95;search)&quot; である行を含む可能性があるグラニュールを特定するために、ClickHouse が 1083 個の URL 索引マークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">汎用排除検索</a>を使用したことが記録されます。

```response
...Executor): Key condition: (column 1 in ['http://public_search',
                                           'http://public_search'])
# highlight-next-line
...Executor): Used generic exclusion search over index for part all_1_9_2
              with 1537 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
# highlight-next-line
              1076/1083 marks by primary key, 1076 marks to read from 5 ranges
...Executor): Reading approx. 8814592 rows with 10 streams
```

上のサンプルトレースログからわかるように、1083 個の granule のうち 1076 個が（マークを通じて）選択され、その中に一致する URL 値を持つ行が含まれている可能性があると判断されています。

その結果、実際に URL 値 &quot;[http://public&#95;search](http://public\&#95;search)&quot; を含む行を特定するために、合計 881 万行が（10 本のストリームを使って並列に）ClickHouse エンジンへストリーミングされることになります。

しかし後で見るように、その選択された 1076 個の granule のうち、実際に一致する行を含んでいるのは 39 個の granule にすぎません。

複合主キー (UserID, URL) に基づくプライマリインデックスは、特定の UserID 値で行をフィルタリングするクエリを高速化するうえでは非常に有用でしたが、特定の URL 値で行をフィルタリングするクエリを高速化するうえでは大きな助けにはなっていません。

その理由は、URL カラムが先頭のキー・カラムではないため、ClickHouse は URL カラムのインデックスマークに対してバイナリサーチではなく汎用の除外探索アルゴリズムを使用しており、**このアルゴリズムの有効性は、URL カラムとその直前のキー・カラムである UserID との間のカーディナリティの差に依存する**ためです。

これを説明するために、汎用の除外探索がどのように動作するかについて、いくつか詳細を示します。

<a name="generic-exclusion-search-algorithm" />


### 汎用除外検索アルゴリズム \{#generic-exclusion-search-algorithm\}

以下では、先行キーとなるカラムのカーディナリティが低い（または高い）場合に、二次カラム経由でグラニュールが選択されるときの <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >ClickHouse の汎用除外検索アルゴリズム</a> がどのように動作するかを示します。

両方のケースの例として、次のように仮定します:

- URL の値が "W3" である行を検索するクエリがある。
- UserID と URL の値を簡略化した抽象的な hits テーブルがある。
- インデックスには同じ複合プライマリキー (UserID, URL) を用いる。これは、行がまず UserID の値でソートされ、その後、同じ UserID の値を持つ行は URL でソートされることを意味する。
- グラニュールサイズは 2、つまり各グラニュールは 2 行を含む。

以下の図では、各グラニュールにおける最初のテーブル行のキー・カラム値をオレンジ色で示しています。

**先行キー・カラムのカーディナリティが低い場合**<a name="generic-exclusion-search-fast"></a>

UserID のカーディナリティが低いと仮定します。この場合、同じ UserID の値が複数のテーブル行およびグラニュール、したがって複数のインデックスマークにまたがって出現する可能性が高くなります。同じ UserID を持つインデックスマークについては、（テーブル行がまず UserID、次に URL でソートされているため）インデックスマークにおける URL の値は昇順に並びます。これにより、以下で説明するような効率的なフィルタリングが可能になります:

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

上の図に示した抽象的なサンプルデータに対するグラニュール選択処理には、3 つの異なるシナリオがあります:

1.  **URL の値が W3 より小さく、かつ直後のインデックスマークの URL 値も W3 より小さい**インデックスマーク 0 は除外できます。マーク 0 と 1 は同じ UserID の値を持つためです。この除外条件により、グラニュール 0 が U1 の UserID 値のみで構成されていることが保証されるので、ClickHouse はグラニュール 0 内の最大 URL 値も W3 より小さいとみなして、このグラニュールを除外できます。

2. **URL の値が W3 より小さい（または等しい）、かつ直後のインデックスマークの URL 値が W3 より大きい（または等しい）**インデックスマーク 1 は選択されます。これは、グラニュール 1 が URL が W3 の行を含んでいる可能性があることを意味するためです。

3. **URL の値が W3 より大きい**インデックスマーク 2 および 3 は除外できます。プライマリインデックスのインデックスマークは各グラニュールにおける最初のテーブル行のキー・カラム値を保持し、テーブル行はキー・カラム値でディスク上にソートされているため、グラニュール 2 と 3 が URL 値 W3 を含む可能性はありません。

**先行キー・カラムのカーディナリティが高い場合**<a name="generic-exclusion-search-slow"></a>

UserID のカーディナリティが高い場合、同じ UserID の値が複数のテーブル行およびグラニュールに分散している可能性は低くなります。これは、インデックスマークにおける URL 値が単調増加にはならないことを意味します:

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

上の図から分かるように、URL の値が W3 より小さいすべてのマークは、そのマークに対応するグラニュールの行を ClickHouse エンジンにストリーミングするために選択されています。

これは、図中のすべてのインデックスマークが前述のシナリオ 1 に該当するにもかかわらず、*直後のインデックスマークが現在のマークと同じ UserID の値を持つ* という除外の事前条件を満たさないため、除外できないからです。

たとえば、**URL の値が W3 より小さく、かつ直後のインデックスマークの URL 値も W3 より小さい**インデックスマーク 0 を考えます。直後のインデックスマーク 1 が現在のマーク 0 と同じ UserID の値を *持たない* ため、これは除外できません。

このことにより、ClickHouse はグラニュール 0 内の最大 URL 値について仮定を置くことができなくなります。代わりに、グラニュール 0 が URL 値 W3 を持つ行を含む可能性があるとみなさなければならず、マーク 0 を選択せざるを得ません。

同じ状況はマーク 1、2、および 3 にも当てはまります。

:::note 結論
ClickHouse では、複合キーを構成するものの先頭のキーカラムではないカラムに対してクエリでフィルタリングを行う場合、<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">汎用除外検索アルゴリズム</a>を、<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索アルゴリズム</a>の代わりに使用します。このアルゴリズムは、先行するキーカラムのカーディナリティがより低い場合に最も効果的です。
:::

サンプルデータセットでは、両方のキーカラム（UserID、URL）のカーディナリティはいずれも高く、前述のとおり、URL カラムの先行キーカラムのカーディナリティが高い、あるいは同程度に高い場合には、汎用除外検索アルゴリズムはあまり効果的ではありません。

### データスキッピングインデックスに関する注意 \{#note-about-data-skipping-index\}

UserID と URL はどちらもカーディナリティが高いという点で似ているため、[URL に対するクエリフィルタ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)についても、URL カラムに[セカンダリのデータスキッピングインデックス](./skipping-indexes.md)を作成しても大きなメリットは得られません。これは、[複合主キー (UserID, URL) を持つテーブル](#a-table-with-a-primary-key)に対しても同様です。

たとえば、次の 2 つの文は、テーブルの URL カラムに [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) データスキッピングインデックスを作成し、テーブルにデータを投入します。

```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```

ClickHouseは、4つの連続した[グラニュール](#data-is-organized-into-granules-for-parallel-data-processing)のグループごとに（上記の`ALTER TABLE`文の`GRANULARITY 4`句に注意してください）、最小および最大のURL値を格納する追加の索引を作成しました:

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white" />

最初の索引エントリ（上図の&#39;mark 0&#39;）には、[テーブルの最初の4つのグラニュールに属する行](#data-is-organized-into-granules-for-parallel-data-processing)の最小および最大URL値が格納されています。

2番目の索引エントリ（&#39;mark 1&#39;）には、テーブルの次の4つのグラニュールに属する行の最小および最大URL値が格納されており、以降も同様です。

（ClickHouseは、索引マークに関連付けられたグラニュールのグループを[特定する](#mark-files-are-used-for-locating-granules)ために、データスキッピング索引用の特別な[マークファイル](#mark-files-are-used-for-locating-granules)も作成しました。）

UserIDとURLの両方が同様に高いカーディナリティを持つため、この二次データスキッピング索引は、[URLでフィルタリングするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)が実行される際に、グラニュールの選択除外には役立ちません。

クエリが検索している特定のURL値（すなわち&#39;[http://public&#95;search&#39;）は、各グラニュールグループに対して索引が格納している最小値と最大値の間に存在する可能性が非常に高いため、ClickHouseはそのグラニュールグループを選択せざるを得なくなります（クエリに一致する行が含まれている可能性があるため）。](http://public\&#95;search\&#39;）は、各グラニュールグループに対して索引が格納している最小値と最大値の間に存在する可能性が非常に高いため、ClickHouseはそのグラニュールグループを選択せざるを得なくなります（クエリに一致する行が含まれている可能性があるため）。)


### 複数のプライマリインデックスを使用する必要性 \{#a-need-to-use-multiple-primary-indexes\}

そのため、特定の URL を持つ行を絞り込むサンプルクエリを大幅に高速化したい場合は、そのクエリに最適化されたプライマリインデックスを使用する必要があります。

さらに、特定の UserID を持つ行を絞り込むサンプルクエリの高いパフォーマンスも維持したい場合は、複数のプライマリインデックスを使用する必要があります。

以下では、その実現方法を説明します。

<a name="multiple-primary-indexes"></a>

### 追加の primary index を作成するためのオプション \{#options-for-creating-additional-primary-indexes\}

サンプルクエリ 2 つ ― 特定の UserID の行をフィルタするものと、特定の URL の行をフィルタするもの ― の両方を大幅に高速化したい場合は、次の 3 つのオプションのいずれかを使って複数の primary index を利用する必要があります:

- 異なる primary key を持つ **2 つ目のテーブル**を作成する。
- 既存テーブル上に **materialized view** を作成する。
- 既存テーブルに **projection** を追加する。

これら 3 つのオプションはいずれも、テーブルの primary index と行のソート順を再編成するために、サンプルデータを追加のテーブルに実質的に複製します。

ただし、これら 3 つのオプションは、クエリや insert 文のルーティングに関して、その追加テーブルがユーザーにとってどれだけ透過的であるかが異なります。

異なる primary key を持つ **2 つ目のテーブル**を作成する場合、クエリはそのクエリに最も適したテーブルバージョンに対して明示的に実行する必要があり、新しいデータは両方のテーブルを同期させるために、両方のテーブルへ明示的に挿入しなければなりません:

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

**materialized view** を使用する場合、追加テーブルは暗黙的に作成され、両方のテーブル間でデータは自動的に同期されます:

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

そして **projection** は最も透過的なオプションです。暗黙的に作成され（かつ非表示の）追加テーブルをデータ変更とともに自動的に同期させるだけでなく、ClickHouse がクエリに対して最も効果的なテーブルバージョンを自動的に選択します:

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

以下では、複数の primary index を作成して利用するためのこれら 3 つのオプションについて、より詳しく実例を交えて説明します。

<a name="multiple-primary-indexes-via-secondary-tables"></a>

### オプション 1: セカンダリテーブル \{#option-1-secondary-tables\}

<a name="secondary-table" />

元のテーブルとは逆になるように主キーのキーとなるカラムの順序を入れ替えた、追加のテーブルを新たに作成します。

```sql
CREATE TABLE hits_URL_UserID
(
    `UserID` UInt32,
    `URL` String,
    `EventTime` DateTime
)
ENGINE = MergeTree
-- highlight-next-line
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
SETTINGS index_granularity_bytes = 0, compress_primary_key = 0;
```

[元のテーブル](#a-table-with-a-primary-key)から 887 万行すべてをこの追加テーブルに挿入します。

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
```

レスポンスは以下のとおりです：

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

最後に、テーブルを最適化します：

```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

主キーのカラムの順序を入れ替えたため、挿入された行は（[元のテーブル](#a-table-with-a-primary-key) と比べて）ディスク上に異なる辞書順で格納されるようになり、その結果、そのテーブルの 1083 個のグラニュールにも以前とは異なる値が含まれるようになりました。

<Image img={sparsePrimaryIndexes10} size="md" alt="スパースな主キーインデックス 10" background="white" />

これが、結果として得られた主キーです:

<Image img={sparsePrimaryIndexes11} size="md" alt="スパースな主キーインデックス 11" background="white" />

これにより、URL カラムでフィルタリングするサンプルクエリの実行を大幅に高速化し、URL &quot;[http://public&#95;search](http://public\&#95;search)&quot; を最も頻繁にクリックしたユーザーのトップ 10 を算出できるようになります。

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは以下のとおりです：

<a name="query-on-url-fast" />

```response
┌─────UserID─┬─Count─┐
│ 2459550954 │  3741 │
│ 1084649151 │  2484 │
│  723361875 │   729 │
│ 3087145896 │   695 │
│ 2754931092 │   672 │
│ 1509037307 │   582 │
│ 3085460200 │   573 │
│ 2454360090 │   556 │
│ 3884990840 │   539 │
│  765730816 │   536 │
└────────────┴───────┘

10 rows in set. Elapsed: 0.017 sec.
# highlight-next-line
Processed 319.49 thousand rows,
11.38 MB (18.41 million rows/s., 655.75 MB/s.)
```

今度は、[ほぼフルテーブルスキャンになっていた](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns)場合とは異なり、ClickHouse はそのクエリをはるかに効率的に実行しました。

UserID が第 1 キー、URL が第 2 キーである [元のテーブル](#a-table-with-a-primary-key) の primary index を使っていたとき、ClickHouse はそのクエリの実行にあたりインデックスマークに対して[汎用排他検索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)を用いていましたが、UserID と URL のカーディナリティが同様に高かったため、これはあまり効率的ではありませんでした。

primary index の第 1 カラムを URL にしたことで、ClickHouse は現在、インデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索</a>を実行するようになりました。
これに対応するトレースログが、ClickHouse サーバーのログファイルから確認できます。


```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
# highlight-next-line
...Executor): Running binary search on index range for part all_1_9_2 (1083 marks)
...Executor): Found (LEFT) boundary mark: 644
...Executor): Found (RIGHT) boundary mark: 683
...Executor): Found continuous range in 19 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
# highlight-next-line
              39/1083 marks by primary key, 39 marks to read from 1 ranges
...Executor): Reading approx. 319488 rows with 2 streams
```

ClickHouse は、汎用排除検索を使用したときの 1076 件ではなく、39 件のインデックスマークだけを選択しました。

追加したテーブルは、URL でフィルタする今回の例のクエリの実行を高速化するよう最適化されていることに注意してください。

[元のテーブル](#a-table-with-a-primary-key)でのそのクエリの[悪いパフォーマンス](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)と同様に、`UserIDs` でフィルタする[例のクエリ](#the-primary-index-is-used-for-selecting-granules)は、新しい追加テーブルではあまり効率的には実行されません。これは、そのテーブルの primary index において UserID が 2 つ目のキー・カラムであるためであり、そのため ClickHouse は granule の選択に generic exclusion search を使用します。しかし、UserID と URL のカーディナリティが同程度に高いため、これは[あまり効果的ではありません](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。
詳細については、以下の詳細ボックスを開いて確認してください。

<details>
  <summary>
    UserIDs でフィルタするクエリは、現在パフォーマンスが悪いです<a name="query-on-userid-slow" />
  </summary>

  <p>
    ```sql
    SELECT URL, count(URL) AS Count
    FROM hits_URL_UserID
    WHERE UserID = 749927693
    GROUP BY URL
    ORDER BY Count DESC
    LIMIT 10;
    ```

    レスポンスは次のとおりです:

    ```response
    ┌─URL────────────────────────────┬─Count─┐
    │ http://auto.ru/chatay-barana.. │   170 │
    │ http://auto.ru/chatay-id=371...│    52 │
    │ http://public_search           │    45 │
    │ http://kovrik-medvedevushku-...│    36 │
    │ http://forumal                 │    33 │
    │ http://korablitz.ru/L_1OFFER...│    14 │
    │ http://auto.ru/chatay-id=371...│    14 │
    │ http://auto.ru/chatay-john-D...│    13 │
    │ http://auto.ru/chatay-john-D...│    10 │
    │ http://wot/html?page/23600_m...│     9 │
    └────────────────────────────────┴───────┘

    セット内の行数: 10。経過時間: 0.024 秒。
    # 次の行をハイライト
    Processed 8.02 million rows,
    73.04 MB (340.26 million rows/s., 3.10 GB/s.)
    ```

    サーバーログ:

    ```response
    ...Executor): Key condition: (column 1 in [749927693, 749927693])
    # 次の行をハイライト
    ...Executor): Used generic exclusion search over index for part all_1_9_2
                  with 1453 steps
    ...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
    # 次の行をハイライト
                  980/1083 marks by primary key, 980 marks to read from 23 ranges
    ...Executor): Reading approx. 8028160 rows with 10 streams
    ```
  </p>
</details>

現在は 2 つのテーブルがあり、それぞれ `UserIDs` でフィルタするクエリ、および URL でフィルタするクエリの高速化に最適化されています。


### オプション 2: materialized view の利用 \{#option-2-materialized-views\}

既存のテーブル上に [materialized view](/sql-reference/statements/create/view.md) を作成します。

```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

レスポンスは次のとおりです。

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note

* view のプライマリキーでは（[元のテーブル](#a-table-with-a-primary-key) と比べて）キーとなるカラムの順序を入れ替えています
* materialized view は、指定したプライマリキー定義に基づく行順序とプライマリインデックスを持つ、**暗黙的に作成されたテーブル**によって裏付けられています
* 暗黙的に作成されたテーブルは `SHOW TABLES` クエリで一覧表示され、その名前は `.inner` で始まります
* まず materialized view 用の裏付けとなるテーブルを明示的に作成し、その後 `TO [db].[table]` [句](/sql-reference/statements/create/view.md) を使ってそのテーブルを view の出力先にすることも可能です
* `POPULATE` キーワードを使用して、暗黙的に作成されたテーブルを、ソーステーブル [hits&#95;UserID&#95;URL](#a-table-with-a-primary-key) からの 887 万行すべてで即座に埋めています
* 新しい行がソーステーブル hits&#95;UserID&#95;URL に挿入されると、それらの行は暗黙的に作成されたテーブルにも自動的に挿入されます
* 実質的に、暗黙的に作成されたテーブルは、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) と同じ行順序とプライマリインデックスを持ちます:

<Image img={sparsePrimaryIndexes12b1} size="md" alt="スパースなプライマリインデックス 12b1" background="white" />

ClickHouse は、暗黙的に作成されたテーブルの [カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules) (*.mrk2)、および [プライマリインデックス](#the-primary-index-has-one-entry-per-granule) (primary.idx) を、ClickHouse サーバーのデータディレクトリ内にある特別なフォルダー内に保存します:

<Image img={sparsePrimaryIndexes12b2} size="md" alt="スパースなプライマリインデックス 12b2" background="white" />

:::

materialized view を裏付けている暗黙的に作成されたテーブル（およびそのプライマリインデックス）は、URL カラムでフィルタリングするこの例のクエリの実行を大幅に高速化するために利用できるようになりました。

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

応答は次のとおりです。

```response
┌─────UserID─┬─Count─┐
│ 2459550954 │  3741 │
│ 1084649151 │  2484 │
│  723361875 │   729 │
│ 3087145896 │   695 │
│ 2754931092 │   672 │
│ 1509037307 │   582 │
│ 3085460200 │   573 │
│ 2454360090 │   556 │
│ 3884990840 │   539 │
│  765730816 │   536 │
└────────────┴───────┘

10 rows in set. Elapsed: 0.026 sec.
# highlight-next-line
Processed 335.87 thousand rows,
13.54 MB (12.91 million rows/s., 520.38 MB/s.)
```

materialized view を支える暗黙的に作成されるテーブル（およびその primary index）は、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と本質的に同一であるため、クエリは明示的に作成したテーブルを用いる場合と同じ実効的な方法で実行されます。

ClickHouse のサーバーログファイル内の対応するトレースログから、ClickHouse が index マークに対して二分探索を実行していることが確認できます。


```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
# highlight-next-line
...Executor): Running binary search on index range ...
...
...Executor): Selected 4/4 parts by partition key, 4 parts by primary key,
# highlight-next-line
              41/1083 marks by primary key, 41 marks to read from 4 ranges
...Executor): Reading approx. 335872 rows with 4 streams
```


### オプション3：PROJECTION \{#option-3-projections\}

既存のテーブルに PROJECTION を作成します:

```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

次に PROJECTION をマテリアライズします:

```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note

* projection は、指定した `ORDER BY` 句に基づいた行順序とプライマリインデックスを持つ **非表示テーブル** を作成します
* 非表示テーブルは `SHOW TABLES` クエリの結果には表示されません
* `MATERIALIZE` キーワードを使用することで、ソーステーブル [hits&#95;UserID&#95;URL](#a-table-with-a-primary-key) に存在する 887 万行すべてを、即座に非表示テーブルへ投入します
* 新しい行がソーステーブル hits&#95;UserID&#95;URL に挿入されると、その行は自動的に非表示テーブルにも挿入されます
* クエリは常に（構文上は）ソーステーブル hits&#95;UserID&#95;URL を対象としますが、非表示テーブルの行順序とプライマリインデックスによって、より効率的にクエリを実行できる場合には、その非表示テーブルが代わりに使用されます
* projection の ORDER BY がクエリの ORDER BY と一致していても、projection によって ORDER BY を含むクエリがより効率的になるわけではない点に注意してください（[https://github.com/ClickHouse/ClickHouse/issues/47333](https://github.com/ClickHouse/ClickHouse/issues/47333) を参照）
* 実質的には、暗黙的に作成される非表示テーブルは、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) と同じ行順序とプライマリインデックスを持ちます:

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white" />

ClickHouse は、非表示テーブルの [カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns)（*.bin）、[mark ファイル](#mark-files-are-used-for-locating-granules)（*.mrk2）、および [プライマリインデックス](#the-primary-index-has-one-entry-per-granule)（primary.idx）を、ソーステーブルのデータファイル、mark ファイル、プライマリインデックスファイルと並べて、専用のフォルダ（下のスクリーンショットでオレンジ色で示されている）に保存します:

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white" />

:::

projection によって作成された非表示テーブル（およびそのプライマリインデックス）は、URL カラムでフィルタリングするこの例のクエリの実行を大幅に高速化するために、暗黙的に利用されます。クエリは構文上は、projection のソーステーブルを対象としている点に注意してください。

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のとおりです。

```response
┌─────UserID─┬─Count─┐
│ 2459550954 │  3741 │
│ 1084649151 │  2484 │
│  723361875 │   729 │
│ 3087145896 │   695 │
│ 2754931092 │   672 │
│ 1509037307 │   582 │
│ 3085460200 │   573 │
│ 2454360090 │   556 │
│ 3884990840 │   539 │
│  765730816 │   536 │
└────────────┴───────┘

10 rows in set. Elapsed: 0.029 sec.
# highlight-next-line
Processed 319.49 thousand rows, 1
1.38 MB (11.05 million rows/s., 393.58 MB/s.)
```

プロジェクションによって作成された隠しテーブル（およびそのプライマリ索引）は、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) と実質的に同一であるため、クエリは明示的に作成したテーブルを使う場合と同じ効率で実行されます。

ClickHouse サーバーログファイル内の対応するトレースログから、ClickHouse が index marks に対して二分探索を実行していることが確認できます。


```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
# highlight-next-line
...Executor): Running binary search on index range for part prj_url_userid (1083 marks)
...Executor): ...
# highlight-next-line
...Executor): Choose complete Normal projection prj_url_userid
...Executor): projection required columns: URL, UserID
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
# highlight-next-line
              39/1083 marks by primary key, 39 marks to read from 1 ranges
...Executor): Reading approx. 319488 rows with 2 streams
```


### 要約 \{#summary\}

[複合プライマリキー (UserID, URL) を持つテーブル](#a-table-with-a-primary-key) のプライマリインデックスは、[UserID でフィルタするクエリ](#the-primary-index-is-used-for-selecting-granules) の高速化には非常に有用でした。しかし、そのインデックスは、URL カラムも複合プライマリキーの一部であるにもかかわらず、[URL でフィルタするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) の高速化にはほとんど役立っていませんでした。

逆もまた同様です。
[複合プライマリキー (URL, UserID) を持つテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) のプライマリインデックスは、[URL でフィルタするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) の高速化には寄与していましたが、[UserID でフィルタするクエリ](#the-primary-index-is-used-for-selecting-granules) にはあまり効果がありませんでした。

プライマリキーカラムである UserID と URL のカーディナリティが同程度に高いため、第 2 キーカラムでフィルタするクエリは、[その第 2 キーカラムがインデックスに含まれていてもあまり恩恵を受けません](#generic-exclusion-search-algorithm)。

したがって、プライマリインデックスから第 2 キーカラムを削除し（その結果インデックスのメモリ消費を削減し）、代わりに [複数のプライマリインデックスを使用する](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes) ことには合理性があります。

一方で、複合プライマリキー内のキーカラム同士のカーディナリティに大きな差がある場合は、カーディナリティの小さいものから順にプライマリキーカラムを並べることが、[クエリの性能向上に有利](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) になります。

キーカラム間のカーディナリティの差が大きいほど、キー内でのカラム順序の重要性は増します。次のセクションでそれを示します。

## 複合主キーのカラム順序を効率的に指定する \{#ordering-key-columns-efficiently\}

<a name="test" />

複合主キーでは、キーとなるカラムの並び順が次の両方に大きな影響を与える可能性があります。

* クエリにおけるセカンダリキーとなるカラムでのフィルタリングの効率
* テーブルのデータファイルの圧縮率

これを示すために、各行が 3 つのカラムを持つ [Web トラフィックのサンプルデータセット](#data-set) のバージョンを使用します。これら 3 つのカラムは、インターネット上の「ユーザー」（`UserID` カラム）によるある URL（`URL` カラム）へのアクセスが、ボットトラフィックとしてマークされたかどうか（`IsRobot` カラム）を示します。

典型的な Web 分析クエリを高速化するために、上記 3 つすべてのカラムを含む複合主キーを使用します。これらのクエリでは、次のような値を計算します。

* 特定の URL に対するトラフィックのうち、どの程度（パーセンテージ）がボットによるものか
* 特定のユーザーがボットである（またはボットではない）とどの程度確信できるか（そのユーザーからのトラフィックのうち、どの程度がボットトラフィックであると（ないしはそうではないと）仮定されているか）

複合主キーとして使用したい 3 つのカラムのカーディナリティを計算するために、次のクエリを使用します（ここでは、ローカルテーブルを作成せずに TSV データをアドホックにクエリするために [URL table function](/sql-reference/table-functions/url.md) を使用している点に注意してください）。このクエリを `clickhouse client` で実行してください。

```sql
SELECT
    formatReadableQuantity(uniq(URL)) AS cardinality_URL,
    formatReadableQuantity(uniq(UserID)) AS cardinality_UserID,
    formatReadableQuantity(uniq(IsRobot)) AS cardinality_IsRobot
FROM
(
    SELECT
        c11::UInt64 AS UserID,
        c15::String AS URL,
        c20::UInt8 AS IsRobot
    FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
    WHERE URL != ''
)
```

レスポンスは次のとおりです：

```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

`URL` と `IsRobot` カラムの間など、カーディナリティに大きな差があることがわかります。そのため、複合プライマリキーにおけるこれらのカラムの並び順は、それらのカラムでフィルタリングするクエリを効率的に実行するうえでも、テーブルのカラムデータファイルで最適な圧縮率を達成するうえでも重要です。

これを示すために、ボットトラフィック分析データについて 2 つのテーブルバージョンを作成します。

* カーディナリティが高い順（降順）でキーカラムを並べた、複合プライマリキー `(URL, UserID, IsRobot)` を持つテーブル `hits_URL_UserID_IsRobot`
* カーディナリティが低い順（昇順）でキーカラムを並べた、複合プライマリキー `(IsRobot, UserID, URL)` を持つテーブル `hits_IsRobot_UserID_URL`

次のように、複合プライマリキー `(URL, UserID, IsRobot)` を持つテーブル `hits_URL_UserID_IsRobot` を作成します。

```sql
CREATE TABLE hits_URL_UserID_IsRobot
(
    `UserID` UInt32,
    `URL` String,
    `IsRobot` UInt8
)
ENGINE = MergeTree
-- highlight-next-line
PRIMARY KEY (URL, UserID, IsRobot);
```

そして、テーブルに 887 万行のデータを投入します:

```sql
INSERT INTO hits_URL_UserID_IsRobot SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```

レスポンスは次のとおりです：

```response
0 rows in set. Elapsed: 104.729 sec. Processed 8.87 million rows, 15.88 GB (84.73 thousand rows/s., 151.64 MB/s.)
```

次に、複合主キー `(IsRobot, UserID, URL)` を持つテーブル `hits_IsRobot_UserID_URL` を作成します。

```sql
CREATE TABLE hits_IsRobot_UserID_URL
(
    `UserID` UInt32,
    `URL` String,
    `IsRobot` UInt8
)
ENGINE = MergeTree
-- highlight-next-line
PRIMARY KEY (IsRobot, UserID, URL);
```

そして、このテーブルにも、前のテーブルに投入したものと同じ 887 万行のデータを投入します。


```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```

レスポンスは次のとおりです：

```response
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```


### セカンダリキーのカラムでの効率的なフィルタリング \{#efficient-filtering-on-secondary-key-columns\}

クエリで、複合キーを構成するカラムのうち、先頭のキーカラムである少なくとも 1 つのカラムに対してフィルタリングを行っている場合、[ClickHouse はそのキーカラムの index marks に対して二分探索アルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

クエリで、複合キーを構成するカラムだが先頭のキーカラムではないカラムのみに対してフィルタリングを行っている場合、[ClickHouse はそのキーカラムの index marks に対して汎用除外探索アルゴリズムを使用します](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

2 番目のケースでは、複合プライマリキー内でのキーカラムの並び順が、[汎用除外探索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)の有効性にとって重要です。

次は、キーカラムをカーディナリティの降順で `(URL, UserID, IsRobot)` の順に並べたテーブルに対して、`UserID` カラムでフィルタリングしているクエリです。

```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```

レスポンスは次のようになります:

```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.026 sec.
# highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

これは、キー・カラム `(IsRobot, UserID, URL)` を基数の昇順に並べ替えたテーブルに対して実行した、同じクエリです。

```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```

応答は次のとおりです：

```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.
# highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

クエリ実行は、キー列をカーディナリティの昇順に並べたテーブルの方が、はるかに効率的かつ高速になることが分かります。

その理由は、[generic exclusion search algorithm](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) が最も効率良く動作するのが、[granules](#the-primary-index-is-used-for-selecting-granules) を選択する際に、先行するキー列のカーディナリティがより小さい状態で、後続のセカンダリキー列を使って granule を選択する場合だからです。このガイドの[前のセクション](#generic-exclusion-search-algorithm)で、その詳細を説明しました。


### データファイルの最適な圧縮率 \{#optimal-compression-ratio-of-data-files\}

次のクエリは、上で作成した 2 つのテーブル間で、`UserID` カラムの圧縮率を比較します。

```sql
SELECT
    table AS Table,
    name AS Column,
    formatReadableSize(data_uncompressed_bytes) AS Uncompressed,
    formatReadableSize(data_compressed_bytes) AS Compressed,
    round(data_uncompressed_bytes / data_compressed_bytes, 0) AS Ratio
FROM system.columns
WHERE (table = 'hits_URL_UserID_IsRobot' OR table = 'hits_IsRobot_UserID_URL') AND (name = 'UserID')
ORDER BY Ratio ASC
```

レスポンスは次のとおりです。

```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```

`UserID` カラムの圧縮率は、キー列 `(IsRobot, UserID, URL)` をカーディナリティの昇順で並べたテーブルの方が、はるかに高いことがわかります。

どちらのテーブルにもまったく同じデータが保存されています（両方のテーブルに 8.87 百万行を挿入しました）が、複合主キーにおけるキー列の並び順は、テーブル内の<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮された</a>データがディスク上で[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns)としてどれだけの容量を必要とするかに大きな影響を与えます。

* 複合主キー `(URL, UserID, IsRobot)` を持ち、キー列をカーディナリティの降順で並べたテーブル `hits_URL_UserID_IsRobot` では、`UserID.bin` データファイルは **11.24 MiB** のディスク容量を消費します
* 複合主キー `(IsRobot, UserID, URL)` を持ち、キー列をカーディナリティの昇順で並べたテーブル `hits_IsRobot_UserID_URL` では、`UserID.bin` データファイルはディスク容量を **877.47 KiB** しか消費しません

テーブルのカラムデータがディスク上で高い圧縮率を持つことは、ディスク容量の節約になるだけでなく、そのカラムからデータを読み出す必要があるクエリ（特に分析クエリ）を高速化します。カラムのデータをディスクからメインメモリ（オペレーティングシステムのファイルキャッシュ）へ移動するために必要な I/O が減るためです。

以下では、テーブルのカラムの圧縮率にとって、主キーのカラムをカーディナリティの昇順で並べることがなぜ有利なのかを説明します。

次の図は、キー列をカーディナリティの昇順で並べた主キーに対して、行がディスク上でどのような順序で並ぶかを概略的に示しています。

<Image img={sparsePrimaryIndexes14a} size="md" alt="スパース主インデックス 14a" background="white" />

[テーブルの行データは主キーのカラム順にディスク上へ格納される](#data-is-stored-on-disk-ordered-by-primary-key-columns)ことについては、すでに述べました。

上の図では、テーブルの行（ディスク上のカラム値）はまず `cl` の値で並べられ、同じ `cl` 値を持つ行同士は `ch` の値で並べられます。そして、最初のキー列である `cl` のカーディナリティが低いため、同じ `cl` 値を持つ行が存在する可能性が高くなります。その結果として、`ch` の値も（同じ `cl` 値を持つ行という局所的な範囲内で）並んだ状態になっている可能性が高くなります。

あるカラム内で類似したデータが互いに近接して配置されている場合、たとえばソートによってそうなっている場合、そのデータはより高い圧縮率で圧縮されます。
一般に、圧縮アルゴリズムはデータの連なり（より多くの連続したデータを観測できるほど圧縮に有利）と局所性（データ同士の類似度が高いほど圧縮率が向上）から恩恵を受けます。

これに対して、次の図はキー列をカーディナリティの降順で並べた主キーに対して、行がディスク上でどのような順序で並ぶかを概略的に示しています。

<Image img={sparsePrimaryIndexes14b} size="md" alt="スパース主インデックス 14b" background="white" />


これでテーブルの行はまず `ch` の値で並べ替えられ、同じ `ch` の値を持つ行同士は `cl` の値で並べ替えられます。
しかし、最初のキー列である `ch` のカーディナリティが高いため、同じ `ch` の値を持つ行が存在する可能性は低くなります。そのため、`cl` の値が（同じ `ch` の値を持つ行という局所的な範囲で）順序付けられている可能性も低くなります。

したがって、`cl` の値はほとんどランダムな順序になっていると考えられ、その結果、局所性が悪くなり、圧縮率も悪化します。

### 要約 \{#summary-1\}

クエリでセカンダリキーとなるカラムを効率的にフィルタリングするためにも、テーブルのカラムデータファイルの圧縮率を高めるためにも、プライマリキー内のカラムはカーディナリティが小さいものから大きいものへと昇順に並べることが望ましいです。

## 単一行を効率的に特定する \{#identifying-single-rows-efficiently\}

一般的には ClickHouse の[典型的なユースケースではない](/knowledgebase/key-value)ものの、
ClickHouse 上に構築されたアプリケーションが、ClickHouse テーブル内の単一行を特定する必要が生じることがあります。

そのための直感的な解決策としては、行ごとに一意な値を持つ [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) カラムを用意し、行を高速に取得するためにそのカラムをプライマリキーのカラムとして使用する、というものが考えられます。

最も高速に取得するには、UUID カラムは[最初のキー・カラムである必要があります](#the-primary-index-is-used-for-selecting-granules)。

すでに説明したように、[ClickHouse テーブルの行データはプライマリキー・カラムに従って並び替えられた状態でディスクに格納される](#data-is-stored-on-disk-ordered-by-primary-key-columns)ため、プライマリキーや、あるいは複合プライマリキーにおいて、より低いカーディナリティのカラムより前の位置に（UUID カラムのような）非常に高いカーディナリティのカラムを含めると、[他のテーブル・カラムの圧縮率に悪影響を及ぼします](#optimal-compression-ratio-of-data-files)。

最速の取得と最適なデータ圧縮との妥協案としては、複合プライマリキーを使用し、UUID を最後のキー・カラムとし、その前に、テーブル内の一部のカラムに対して良好な圧縮率を確保するために用いるカーディナリティの低い（もしくはより低い）キー・カラムを配置する方法があります。

### 具体的な例 \{#a-concrete-example\}

具体的な例として、Alexey Milovidov が開発し、[ブログで紹介している](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)プレーンテキストのペーストサービス [https://pastila.nl](https://pastila.nl) があります。

テキストエリアの内容が変更されるたびに、そのデータは自動的に ClickHouse テーブルの行に保存されます（変更 1 回につき 1 行）。

貼り付けたコンテンツ（の特定バージョン）を識別して取得する 1 つの方法は、そのコンテンツのハッシュを、そのコンテンツを含むテーブル行の UUID として使用することです。

次の図は、以下を示しています。

- コンテンツが変更されたときの行の挿入順（たとえばテキストエリアに文字をタイプするキーストロークによる変更）と
- `PRIMARY KEY (hash)` を使用した場合に、挿入された行のデータがディスク上に並ぶ順序:

<Image img={sparsePrimaryIndexes15a} size="md" alt="スパースなプライマリインデックス 15a" background="white"/>

`hash` カラムがプライマリキー列として使われているため、

- 特定の行を[非常に高速に](#the-primary-index-is-used-for-selecting-granules)取得できますが、
- テーブルの行（そのカラムデータ）は、（一意かつランダムな）ハッシュ値で昇順にディスク上に保存されます。そのため、content カラムの値もデータの局所性がないランダムな順序で保存され、その結果、**content カラムのデータファイルとしては最適とは言えない圧縮率**になります。

特定の行を高速に取得できる状態を維持しつつ、content カラムの圧縮率を大幅に改善するために、pastila.nl では特定の行を識別するために 2 種類のハッシュ（および複合プライマリキー）を使用しています。

- 上で説明したように、異なるデータごとに異なる値になるコンテンツのハッシュと、
- データが少しだけ変化しても**変化しない**[局所性に敏感なハッシュ（fingerprint）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)

次の図は、以下を示しています。

- コンテンツが変更されたときの行の挿入順（たとえばテキストエリアに文字をタイプするキーストロークによる変更）と
- 複合 `PRIMARY KEY (fingerprint, hash)` を使用した場合に、挿入された行のデータがディスク上に並ぶ順序:

<Image img={sparsePrimaryIndexes15b} size="md" alt="スパースなプライマリインデックス 15b" background="white"/>

これにより、ディスク上の行はまず `fingerprint` で並べ替えられ、同じ fingerprint 値を持つ行については、その `hash` 値によって最終的な順序が決まります。

わずかな違いしかないデータには同じ fingerprint 値が割り当てられるため、類似したデータは content カラム内でディスク上の近い位置に保存されます。これは content カラムの圧縮率にとって非常に有利です。一般に圧縮アルゴリズムはデータの局所性（データ同士の類似度）が高いほど良い圧縮率を実現できるためです。

その代償として、複合 `PRIMARY KEY (fingerprint, hash)` によって得られるプライマリインデックスを最適に活用して特定の行を取得するには、2 つのフィールド（`fingerprint` と `hash`）が必要になります。