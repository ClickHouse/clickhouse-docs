---
sidebar_label: 'プライマリインデックス'
sidebar_position: 1
description: 'このガイドでは、ClickHouse のインデックス機構について徹底的に解説します。'
title: 'ClickHouse におけるプライマリインデックスの実践的入門'
slug: /guides/best-practices/sparse-primary-indexes
show_related_blogs: true
doc_type: 'guide'
keywords: ['プライマリインデックス', 'インデックス付け', 'パフォーマンス', 'クエリ最適化', 'ベストプラクティス']
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

# ClickHouse におけるプライマリインデックスの実践入門 {#a-practical-introduction-to-primary-indexes-in-clickhouse}

## はじめに {#introduction}

このガイドでは、ClickHouse におけるインデックスについて詳しく掘り下げて説明します。具体的には次の点を例示し、詳細に解説します。

- [ClickHouse のインデックスが従来のリレーショナルデータベース管理システムとどのように異なるか](#an-index-design-for-massive-data-scales)
- [ClickHouse がテーブルの疎なプライマリインデックスをどのように構築・利用しているか](#a-table-with-a-primary-key)
- [ClickHouse におけるインデックス設計のベストプラクティスの一部](#using-multiple-primary-indexes)

このガイドに記載されているすべての ClickHouse の SQL ステートメントおよびクエリは、必要に応じてご自身のマシン上で実行できます。
ClickHouse のインストール方法および利用開始手順については、[クイックスタート](/get-started/quick-start)を参照してください。

:::note
このガイドでは、ClickHouse の疎なプライマリインデックスに焦点を当てています。

ClickHouse の [セカンダリ data skipping インデックス](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)については、[チュートリアル](/guides/best-practices/skipping-indexes.md)を参照してください。
:::

### データセット {#data-set}

このガイド全体を通して、匿名化された Web トラフィックのサンプルデータセットを使用します。

- サンプルデータセットから 887 万行（イベント）のサブセットを使用します。
- 非圧縮時のデータサイズは 887 万イベントで約 700 MB です。ClickHouse に保存すると、これが 200 MB に圧縮されます。
- 本ガイドで使用するサブセットでは、各行には、特定の時刻（`EventTime` 列）に特定の URL（`URL` 列）をクリックしたインターネットユーザー（`UserID` 列）を示す 3 つの列が含まれます。

これら 3 つの列だけでも、すでに次のような典型的な Web 分析クエリを作成できます：

- 「特定のユーザーについて、クリック数が多い URL のトップ 10 は何か？」
- 「特定の URL を最も頻繁にクリックしたユーザーのトップ 10 は誰か？」
- 「ユーザーが特定の URL をクリックする時間帯（例：曜日）として、最も多いのはいつか？」

### テストマシン {#test-machine}

このドキュメントで示しているすべての実行時の数値は、Apple M1 Pro チップと 16GB の RAM を搭載した MacBook Pro 上で ClickHouse 22.2.1 をローカルで実行した際の結果に基づいています。

### フルテーブルスキャン {#a-full-table-scan}

主キーなしのデータセットに対してクエリがどのように実行されるかを確認するために、次の SQL DDL ステートメントを実行して、MergeTree テーブルエンジンを使用するテーブルを作成します。

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

次に、以下の SQL の `INSERT` 文を実行して、hits データセットの一部をテーブルに挿入します。
ここでは、clickhouse.com 上でリモートホストされている完全なデータセットの一部を読み込むために、[URL テーブル関数](/sql-reference/table-functions/url.md) を使用します。

```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```

レスポンスは次のとおりです。

```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```

ClickHouse クライアントの出力結果から、上記のステートメントによって 887 万行がテーブルに挿入されたことがわかります。

最後に、このガイド以降の説明を簡潔にし、図や結果を再現可能にするために、`FINAL` キーワードを使用してテーブルを [optimize](/sql-reference/statements/optimize.md) します。

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
一般的には、テーブルにデータをロードした直後に `OPTIMIZE` を実行して最適化する必要も推奨もありません。なぜこの例ではこれが必要になるのかは、後ほど明らかになります。
:::

では最初の Web アナリティクスのクエリを実行します。次のクエリは、UserID が 749927693 のインターネットユーザーについて、最もクリックされた URL の上位 10 件を算出しています。

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

ClickHouse クライアントの結果出力を見ると、ClickHouse がテーブルに対してフルスキャンを実行したことが分かります。テーブルにある 887 万行すべてが、1 行ずつ ClickHouse にストリーミングされました。これではスケールしません。

これを（かなり）効率良くし、（はるかに）高速化するには、適切なプライマリキーを持つテーブルを使用する必要があります。そうすることで、ClickHouse はプライマリキーのカラムに基づいて自動的に疎なプライマリインデックスを作成し、それを使ってこのサンプルクエリの実行を大幅に高速化できるようになります。

## ClickHouse のインデックス設計 {#clickhouse-index-design}

### 大規模データスケール向けのインデックス設計 {#an-index-design-for-massive-data-scales}

従来のリレーショナルデータベース管理システムでは、プライマリインデックスはテーブルの各行につき 1 つのエントリを持ちます。その結果、今回のデータセットではプライマリインデックスに 887 万件のエントリが含まれることになります。このようなインデックスは特定の行を高速に特定できるため、ルックアップクエリやポイント更新に対して高い効率を発揮します。`B(+)-Tree` データ構造における 1 エントリの探索の平均時間計算量は `O(log n)` です。より正確には、`log_b n = log_2 n / log_2 b` となり、ここで `b` は `B(+)-Tree` の分岐係数、`n` はインデックス付けされた行数です。`b` は通常数百から数千の範囲であるため、`B(+)-Tree` は非常に浅い構造となり、レコードを特定するために必要なディスクシークはわずかです。887 万行、分岐係数 1000 の場合、平均 2.3 回のディスクシークが必要になります。この性能は一方でコストも伴います。追加のディスクおよびメモリオーバーヘッド、新しい行をテーブルやインデックスに追加する際の挿入コストの増大、そして場合によっては B-Tree の再バランスが必要になります。

B-Tree インデックスに伴う課題を踏まえ、ClickHouse のテーブルエンジンは別のアプローチを採用しています。ClickHouse の [MergeTree Engine Family](/engines/table-engines/mergetree-family/index.md) は、大量データを扱うために設計・最適化されています。これらのテーブルは、1 秒あたり数百万行の挿入を受け付け、非常に大きな（数百ペタバイト規模の）データ量を保存できるよう設計されています。データはテーブルに対して [パートごと](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) に高速に書き込まれ、バックグラウンドでパートをマージするためのルールが適用されます。ClickHouse では各パートが独自のプライマリインデックスを持ちます。パートがマージされると、マージ後のパートのプライマリインデックスもマージされます。ClickHouse が想定する非常に大規模なスケールでは、ディスクとメモリの効率性を非常に高く保つことが最重要です。そのため、すべての行にインデックスを付ける代わりに、あるパートのプライマリインデックスは、行のグループ（「granule」と呼ぶ）ごとに 1 つのインデックスエントリ（「mark」として知られる）を持つ構造になっています。この手法は **スパースインデックス** と呼ばれます。

スパースインデックスが可能であるのは、ClickHouse がパート内の行をプライマリキー列でソートされた状態でディスク上に格納しているためです。B-Tree ベースのインデックスのように単一行を直接特定する代わりに、スパースプライマリインデックスは、インデックスエントリに対する二分探索を通じて、クエリにマッチし得る行のグループを高速に特定できます。見つかったマッチし得る行のグループ（granule）は、その後 ClickHouse エンジンに並列でストリーミングされ、一致する行が探索されます。このインデックス設計により、プライマリインデックスは小さく保つことができ（そして完全にメインメモリに収まる必要があります）、それでいてクエリ実行時間を大幅に短縮できます。特に、データ分析のユースケースで典型的なレンジクエリに対して効果を発揮します。

以下では、ClickHouse がスパースプライマリインデックスをどのように構築・利用しているかを詳細に説明します。記事の後半では、インデックス（プライマリキー列）を構築するために使用するテーブル列の選択・削除・並び替えについて、いくつかのベストプラクティスを解説します。

### 主キーを持つテーブル {#a-table-with-a-primary-key}

`UserID` と `URL` をキー列とする複合主キーを持つテーブルを作成します。

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
    本ガイド以降の説明および議論を簡潔にし、図や結果を再現可能にするため、DDL ステートメントでは次のことを行っています:

    <ul>
      <li>
        <code>ORDER BY</code> 句を使って、テーブルに対して複合ソートキーを指定します。
      </li>

      <li>
        次の設定を用いて、プライマリインデックスが持つインデックスエントリ数を明示的に制御します:

        <ul>
          <li>
            <code>index&#95;granularity</code>: デフォルト値の 8192 に明示的に設定します。これは、8192 行ごとのグループごとに、プライマリインデックスが 1 つのインデックスエントリを持つことを意味します。たとえば、テーブルに 16384 行が含まれている場合、インデックスは 2 つのインデックスエントリを持ちます。
          </li>

          <li>
            <code>index&#95;granularity&#95;bytes</code>: <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">adaptive index granularity</a> を無効にするために 0 に設定します。Adaptive index granularity とは、次のいずれかの条件を満たす場合に、ClickHouse が自動的に n 行のグループに対して 1 つのインデックスエントリを作成する動作を指します:

            <ul>
              <li>
                <code>n</code> が 8192 未満であり、その <code>n</code> 行に対する行データを合計したサイズが 10 MB 以上（<code>index&#95;granularity&#95;bytes</code> のデフォルト値）である場合。
              </li>

              <li>
                <code>n</code> 行の行データを合計したサイズが 10 MB 未満だが、<code>n</code> が 8192 である場合。
              </li>
            </ul>
          </li>

          <li>
            <code>compress&#95;primary&#95;key</code>: <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">プライマリインデックスの圧縮</a> を無効にするために 0 に設定します。これにより、後で必要に応じてその内容を確認できるようになります。
          </li>
        </ul>
      </li>
    </ul>
  </p>
</details>

上記の DDL ステートメントのプライマリキーにより、指定された 2 つのキー列に基づいてプライマリインデックスが作成されます。

<br />

次にデータを挿入します:

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

さらにテーブルを最適化します。

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br />

次のクエリで、テーブルのメタデータを取得できます。

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

The output of the ClickHouse client shows:

* テーブルのデータは、ディスク上の特定のディレクトリ内に [wide format](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) で保存されています。これは、そのディレクトリ内にテーブルの各カラムごとに 1 つのデータファイル（および 1 つのマークファイル）が存在することを意味します。
* テーブルには 8.87 百万行が含まれています。
* すべての行の非圧縮データサイズは 733.28 MB です。
* すべての行のディスク上での圧縮後サイズは 206.94 MB です。
* テーブルには 1083 エントリ（「marks」と呼ばれる）を持つプライマリインデックスがあり、そのインデックスサイズは 96.93 KB です。
* 合計で、テーブルのデータファイル、マークファイル、およびプライマリインデックスファイルがディスク上で 207.07 MB を占有します。

### データはプライマリキー列に基づいてディスク上に並び替えられて保存される {#data-is-stored-on-disk-ordered-by-primary-key-columns}

上で作成したテーブルには

- 複合[プライマリキー](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` と
- 複合[ソートキー](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)` があります。

:::note

- ソートキーだけを指定した場合、プライマリキーは暗黙的にソートキーと同じものとして定義されます。

- メモリ効率を高めるため、クエリでフィルタリングに使用する列のみを含むプライマリキーを明示的に指定しています。プライマリキーに基づくプライマリインデックスは完全にメインメモリに読み込まれます。

- このガイドの図の一貫性を保ち、かつ圧縮率を最大化するために、テーブルのすべての列を含む別のソートキーを定義しています（例えばソートによって、類似したデータを列内で互いに近接した位置に配置すると、そのデータはより高い圧縮率で圧縮されます）。

- プライマリキーとソートキーの両方を指定する場合、プライマリキーはソートキーのプレフィックスである必要があります。
:::

挿入された行は、プライマリキー列（およびソートキーに含まれる追加の `EventTime` 列）に基づいて、辞書順（昇順）でディスク上に保存されます。

:::note
ClickHouse では、プライマリキー列の値が同一の行を複数挿入することができます。この場合（下図の行 1 と行 2 を参照）、最終的な順序は指定したソートキー、したがって `EventTime` 列の値によって決まります。
:::

ClickHouse は<a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms
" target="_blank">カラム指向のデータベース管理システム</a>です。下図に示すように、

- ディスク上での表現として、テーブルの各列ごとに 1 つのデータファイル（*.bin）があり、その列のすべての値が<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a>形式で保存されます。
- 887万行（8.87 million rows）のデータは、プライマリキー列（および追加のソートキー列）に基づいて辞書順の昇順でディスク上に保存されます。つまりこの場合、
  - まず `UserID`,
  - 次に `URL`,
  - 最後に `EventTime` の順です。

<Image img={sparsePrimaryIndexes01} size="md" alt="疎なプライマリインデックス 01" background="white"/>

`UserID.bin`、`URL.bin`、`EventTime.bin` は、それぞれ `UserID`、`URL`、`EventTime` 列の値が保存されているディスク上のデータファイルです。

:::note

- プライマリキーがディスク上の行の辞書順を定義するため、テーブルは 1 つのプライマリキーしか持つことができません。

- ClickHouse のログメッセージでも使用される内部の行番号付与方式と揃えるため、行番号は 0 から始めています。
:::

### 並列データ処理のためにデータはグラニュールに編成される {#data-is-organized-into-granules-for-parallel-data-processing}

データ処理のために、テーブルのカラム値は論理的にグラニュールに分割されます。
グラニュールは、データ処理のために ClickHouse にストリーミングされる、これ以上分割できない最小のデータ集合です。
つまり、個々の行を読み込む代わりに、ClickHouse は常に（ストリーミングかつ並列に）行のグループ全体（グラニュール）を読み込みます。
:::note
カラム値は物理的にはグラニュールの内部に保存されません。グラニュールは、クエリ処理のためにカラム値を論理的に編成したものに過ぎません。
:::

次の図は、テーブルの 887 万行（のカラム値）が、テーブルの DDL 文に `index_granularity` 設定（デフォルト値の 8192 に設定）が含まれている結果として、1083 個のグラニュールにどのように構成されているかを示しています。

<Image img={sparsePrimaryIndexes02} size="md" alt="スパースなプライマリインデックス 02" background="white"/>

最初の（ディスク上の物理順序に基づく）8192 行（のカラム値）は論理的にグラニュール 0 に属し、次の 8192 行（のカラム値）はグラニュール 1 に属する、というように続きます。

:::note

- 最後のグラニュール（グラニュール 1082）は 8192 行未満を「含み」ます。

- このガイドの冒頭「DDL Statement Details」で述べたように、このガイドでの議論を簡略化し、かつ図と結果を再現可能にするために、[adaptive index granularity](/whats-new/changelog/2019.md/#experimental-features-1) を無効化しました。

  そのため、この例のテーブルでは（最後のグラニュールを除き）すべてのグラニュールが同じサイズになります。

- adaptive index granularity を有効にしたテーブルでは（[default](/operations/settings/merge-tree-settings#index_granularity_bytes) では index granularity はアダプティブです）、行データのサイズに応じて、一部のグラニュールのサイズが 8192 行未満になることがあります。

- プライマリキー列（`UserID`、`URL`）の一部のカラム値をオレンジ色でマークしています。
  このオレンジ色でマークされたカラム値は、それぞれのグラニュールの先頭行のプライマリキーのカラム値です。
  後述するように、このオレンジ色でマークされたカラム値がテーブルのプライマリインデックス内のエントリになります。

- ClickHouse の内部番号付け方式およびログメッセージで使用される方式と整合させるため、グラニュールの番号付けは 0 から開始しています。
:::

### プライマリインデックスは 1 つのグラニュールにつき 1 つのエントリを持つ {#the-primary-index-has-one-entry-per-granule}

プライマリインデックスは、上述の図に示したグラニュールに基づいて作成されます。このインデックスは非圧縮のフラットな配列形式のファイル（primary.idx）であり、0 から始まる数値インデックスマークを含みます。

下の図は、インデックスが各グラニュールの最初の行について、プライマリキー列の値（上の図でオレンジ色で示されている値）を保存していることを示しています。
言い換えると、プライマリインデックスは、テーブルの行（プライマリキー列で定義される物理的な行順に基づく）について 8192 行ごとに、その時点のプライマリキー列の値を保存しています。
例えば:

- 1 つ目のインデックスエントリ（下の図における「mark 0」）は、上の図のグラニュール 0 の最初の行のキー列の値を保持しています。
- 2 つ目のインデックスエントリ（下の図における「mark 1」）は、上の図のグラニュール 1 の最初の行のキー列の値を保持しており、以降も同様です。

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Sparse Primary Indices 03a" background="white"/>

合計すると、このテーブル（887 万行と 1083 個のグラニュール）に対するインデックスには 1083 個のエントリがあります。

<Image img={sparsePrimaryIndexes03b} size="md" alt="Sparse Primary Indices 03b" background="white"/>

:::note

- [adaptive index granularity](/whats-new/changelog/2019.md/#experimental-features-1) を持つテーブルでは、プライマリインデックス内に、テーブルの最後の行のプライマリキー列の値を記録する「最終」の追加マークが 1 つ保存されます。しかし、本ガイド内の説明を簡潔にし、また図や結果を再現しやすくするために adaptive index granularity を無効化しているため、本例のテーブルのインデックスにはこの最終マークは含まれていません。

- プライマリインデックスファイルは完全にメインメモリへ読み込まれます。ファイルサイズが利用可能な空きメモリ容量より大きい場合、ClickHouse はエラーを返します。
:::

<details>
    <summary>
    プライマリインデックスの内容を確認する
    </summary>
    <p>

セルフマネージドの ClickHouse クラスターでは、サンプルテーブルのプライマリインデックスの内容を確認するために、<a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">file テーブル関数</a>を使用できます。

そのためには、まず稼働中のクラスター内のノードの <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> にプライマリインデックスファイルをコピーする必要があります:
<ul>
<li>ステップ 1: プライマリインデックスファイルを含む part のパスを取得する</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

テストマシンでは `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4` が返されます。

<li>ステップ 2: user_files_path を取得する</li>
Linux における<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">デフォルトの user_files_path</a> は
`/var/lib/clickhouse/user_files/`

であり、Linux では次のコマンドで変更されたかどうかを確認できます: `$ grep user_files_path /etc/clickhouse-server/config.xml`

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

結果:

`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`

<li>最後のインデックスマークを取得する</li>
`
SELECT UserID, URL FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
結果:
`
4292714039 │ http://sosyal-mansetleri...
`
</ul>
<br/>
これは、サンプルテーブルに対するプライマリインデックス内容の図と完全に一致します。

</p>
</details>

プライマリキーのエントリは、それぞれのインデックスエントリが特定のデータ範囲の開始位置を示しているため、インデックスマークと呼ばれます。サンプルテーブルの場合、具体的には次のとおりです:

- UserID のインデックスマーク:

  プライマリインデックスに格納されている `UserID` の値は昇順に並んでいます。<br/>
  上の図における「mark 1」は、granule 1 と、それに続くすべての granule に含まれるテーブル行の `UserID` 値が、4.073.710 以上であることが保証されていることを示しています。

[後で見るように](#the-primary-index-is-used-for-selecting-granules)、このグローバルな順序付けにより、クエリがプライマリキーの先頭のカラムをフィルタ条件としている場合に、ClickHouse は<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">先頭キー列のインデックスマークに対して二分探索アルゴリズム</a>を使用できるようになります。

- URL インデックスマーク:

  主キー列 `UserID` と `URL` のカーディナリティがほぼ同じであるため、一般的に、先頭列以外のすべてのキー列に対するインデックスマークは、「少なくとも現在のグラニュール内において、直前のキー列の値がすべてのテーブル行で同一である範囲」に対してのみデータ範囲を示します。<br/>
  たとえば、上の図でマーク 0 とマーク 1 の UserID の値が異なる場合、ClickHouse は、グラニュール 0 内のすべてのテーブル行の URL の値が `'http://showtopics.html%3...'` 以上であるとは仮定できません。 しかし、もし上の図でマーク 0 とマーク 1 の UserID の値が同じであれば（つまり、グラニュール 0 内のすべてのテーブル行で UserID の値が同じであることを意味します）、ClickHouse は、グラニュール 0 内のすべてのテーブル行の URL の値が `'http://showtopics.html%3...'` 以上であると仮定できます。

  これがクエリ実行性能に与える影響については、このあと詳しく説明します。

### プライマリインデックスはグラニュールを選択するために使用される {#the-primary-index-is-used-for-selecting-granules}

これで、プライマリインデックスを活用してクエリを実行できるようになりました。

次のクエリは、UserID 749927693 に対して、クリック数が多い URL の上位 10 件を集計します。

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のとおりです：

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

ClickHouse クライアントの出力を見ると、フルテーブルスキャンを行う代わりに、8.19 千行分のデータのみが ClickHouse にストリーミングされたことがわかります。

<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">トレースログ</a> が有効になっている場合、ClickHouse サーバーのログファイルには、ClickHouse が 1083 個の UserID インデックスマークに対して <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索</a> を実行し、UserID 列の値が `749927693` である行を含む可能性があるグラニュールを特定していることが示されます。これは 19 ステップを必要とし、平均的な時間計算量は `O(log2 n)` です。

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

上記のトレースログから、既存の 1083 個のマークのうち 1 個だけがクエリ条件を満たしていることが分かります。

<details>
  <summary>
    トレースログの詳細
  </summary>

  <p>
    マーク 176 が特定されています（&#39;found left boundary mark&#39; は包含的であり、&#39;found right boundary mark&#39; は排他的です）。そのため、グラニュール 176（行 1,441,792 から開始します — これについては後ほど本ガイド内で説明します）の全 8192 行が ClickHouse にストリーミングされ、その中から UserID カラム値が `749927693` の実際の行を特定します。
  </p>
</details>

また、サンプルクエリで <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN 句</a> を使うことで、同じことを再現することもできます。

```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のとおりです：

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

クライアント出力から、1083 個の granule のうち 1 個が、`UserID` 列の値が 749927693 である行を含んでいる可能性があるものとして選択されたことがわかります。

:::note Conclusion
クエリが複合キーを構成する列のうち、先頭のキー列に対してフィルタリングを行っている場合、ClickHouse はそのキー列のインデックスマークに対して二分探索アルゴリズムを実行します。
:::

<br />

前述のとおり、ClickHouse は疎なプライマリインデックスを利用して、クエリにマッチする行を含んでいる可能性がある granule を（二分探索によって）高速に選択します。

これは、ClickHouse におけるクエリ実行の **第 1 段階（granule の選択）** です。

**第 2 段階（データ読み取り）**では、ClickHouse は選択された granule の位置を特定し、それらのすべての行を ClickHouse エンジンにストリーミングして、実際にクエリにマッチする行を見つけます。

この第 2 段階については、次のセクションでより詳しく説明します。

### グラニュールの位置特定にはマークファイルが使用される {#mark-files-are-used-for-locating-granules}

次の図は、テーブルのプライマリインデックスファイルの一部を示しています。

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white"/>

前述のとおり、インデックスに含まれる 1083 個の UserID マークに対して二分探索を行うことで、マーク 176 が特定されました。したがって、対応するグラニュール 176 には、UserID 列の値が 749.927.693 の行が含まれている可能性があります。

<details>
    <summary>
    Granule Selection Details
    </summary>
    <p>

上の図では、マーク 176 が、関連付けられたグラニュール 176 の最小 UserID 値が 749.927.693 より小さく、かつ次のマーク（マーク 177）に対応するグラニュール 177 の最小 UserID 値がこの値より大きい、最初のインデックスエントリであることが示されています。したがって、マーク 176 に対応するグラニュール 176 のみが、UserID 列の値が 749.927.693 の行を含んでいる可能性があります。
</p>
</details>

グラニュール 176 の中の行に、UserID 列の値が 749.927.693 のものが存在するかどうかを確認するには、このグラニュールに属する 8192 行すべてを ClickHouse にストリーミングする必要があります。

これを行うには、ClickHouse はグラニュール 176 の物理的な位置を知る必要があります。

ClickHouse では、このテーブルのすべてのグラニュールの物理的な位置はマークファイルに保存されています。データファイルと同様に、テーブルの各列ごとに 1 つのマークファイルがあります。

次の図は、テーブルの `UserID`、`URL`、`EventTime` 列に対応するグラニュールの物理的な位置を保存している 3 つのマークファイル `UserID.mrk`、`URL.mrk`、`EventTime.mrk` を示しています。

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white"/>

前述のとおり、プライマリインデックスは 0 から番号付けされたマークを含む、フラットで非圧縮の配列ファイル（primary.idx）です。

同様に、マークファイルも、0 から番号付けされたマークを含む、フラットで非圧縮の配列ファイル（*.mrk）です。

ClickHouse が、あるクエリに対して一致する行を含んでいる可能性のあるグラニュールのインデックスマークを特定して選択すると、マークファイルに対して配列の位置指定ルックアップを実行し、そのグラニュールの物理的な位置を取得できます。

特定の列に対する各マークファイルのエントリには、オフセット形式で 2 つの位置が格納されています。

- 1 つ目のオフセット（上の図中では 'block_offset'）は、選択されたグラニュールの圧縮済みバージョンを含む、<a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">ブロック</a>を、<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a>列データファイル内で特定します。この圧縮ブロックには、複数の圧縮済みグラニュールが含まれている可能性があります。特定された圧縮ファイルブロックは、読み込み時にメインメモリ上で解凍されます。

- 2 つ目のオフセット（上の図中では 'granule_offset'）は、解凍済みブロックデータ内におけるグラニュールの位置を、マークファイルから提供します。

こうして位置特定された解凍済みグラニュールに属する 8192 行すべてが、さらなる処理のために ClickHouse にストリーミングされます。

:::note

- [wide format](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) で、かつ [adaptive index granularity](/whats-new/changelog/2019.md/#experimental-features-1) を有効にしていないテーブルでは、ClickHouse は上図のような `.mrk` マークファイルを使用します。これらのマークファイルの各エントリには、2 つの 8 バイト長のアドレスが含まれています。これらのエントリは、すべて同じサイズのグラニュールの物理的位置を表します。

インデックスの粒度は[既定](/operations/settings/merge-tree-settings#index_granularity_bytes)ではアダプティブですが、本ガイドの説明を簡潔にし、図や結果を再現しやすくするために、サンプルテーブルではアダプティブインデックス粒度を無効にしています。テーブルは、データサイズが [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)（セルフマネージドクラスターではデフォルトで 10 MB）を超えているため、wide format を使用しています。

- wide format かつ adaptive index granularity を有効にしているテーブルでは、ClickHouse は `.mrk2` マークファイルを使用します。これらは `.mrk` マークファイルと同様のエントリを持ちますが、エントリごとに 3 つ目の値として、当該エントリに関連するグラニュールの行数を持ちます。

- [compact format](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) のテーブルでは、ClickHouse は `.mrk3` マークファイルを使用します。

:::

:::note マークファイルを使用する理由

なぜプライマリインデックスは、インデックスマークに対応するグラニュールの物理的な位置を直接保持していないのですか？

ClickHouse が想定するような非常に大規模なスケールでは、ディスクとメモリを極めて効率的に使うことが重要だからです。

プライマリインデックスファイルはメインメモリに収まっている必要があります。

今回の例のクエリでは、ClickHouse はプライマリインデックスを利用し、クエリにマッチする行を含んでいる可能性のあるグラニュールを 1 つだけ選択しました。その 1 つのグラニュールについてのみ、ClickHouse はその後の処理のために対応する行をストリーミングするための物理的な位置を知っていれば十分です。

さらに、このオフセット情報が必要なのは UserID 列と URL 列に対してだけです。

`EventTime` のような、クエリで使用されていない列にはオフセット情報は不要です。

今回のサンプルクエリで ClickHouse が必要とするのは、UserID データファイル (UserID.bin) 内のグラニュール 176 に対する 2 つの物理位置オフセットと、URL データファイル (URL.bin) 内のグラニュール 176 に対する 2 つの物理位置オフセットだけです。

mark ファイルによるこの間接参照により、プライマリインデックスの中に、3 列すべてについて 1083 個のグラニュールそれぞれの物理的位置を表すエントリを直接保持せずに済みます。これにより、メインメモリ内に不要な（潜在的に使用されない）データを持つことを防いでいます。
:::

次の図とその下の説明では、今回の例のクエリにおいて、ClickHouse が UserID.bin データファイル内のグラニュール 176 をどのように特定するかを示します。

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

このガイドの前半で説明したとおり、ClickHouse はプライマリインデックスマーク 176 を選択し、その結果としてグラニュール 176 を、クエリにマッチする行を含んでいる可能性のあるものとして選びました。

ClickHouse は、選択されたマーク番号 (176) を使用して UserID.mrk mark ファイルに対して位置配列のルックアップを行い、グラニュール 176 を特定するための 2 つのオフセットを取得します。

図に示されているように、1 つ目のオフセットは UserID.bin データファイル内の圧縮ファイルブロックの位置を指しており、そのブロック内にグラニュール 176 の圧縮データが含まれています。

特定されたファイルブロックがメインメモリ上に展開されると、2 つ目のオフセットを使って、展開済みデータ内のグラニュール 176 を特定できます。

ClickHouse は、今回の例のクエリ（UserID が 749.927.693 のインターネットユーザーに対する、最もクリックされた URL 上位 10 件）を実行するために、UserID.bin データファイルと URL.bin データファイルの両方からグラニュール 176 を特定し（かつそのすべての値をストリーミングする）必要があります。

上の図は、ClickHouse が UserID.bin データファイルのグラニュールをどのように特定しているかを示しています。

同時に、ClickHouse は URL.bin データファイルについてもグラニュール 176 に対して同じ処理を行います。これら 2 つのグラニュールは整列され、ClickHouse エンジンにストリーミングされて、さらなる処理、つまり UserID が 749.927.693 であるすべての行について、グループごとに URL の値を集計およびカウントし、最終的にカウントが多い順に URL グループ上位 10 件を出力します。

## 複数のプライマリインデックスを使用する {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>

### セカンダリキー列は（必ずしも）非効率とは限らない {#secondary-key-columns-can-not-be-inefficient}

クエリが複合キーの一部であり、かつ先頭のキー列である列を条件にフィルタリングしている場合、[ClickHouse はそのキー列のインデックスマークに対して二分探索アルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

では、クエリが複合キーを構成してはいるものの、先頭のキー列ではない列を条件にフィルタリングしている場合はどうなるでしょうか？

:::note
ここでは、クエリが先頭のキー列ではなく、セカンダリキー列を明示的に条件としてフィルタリングしているケースを扱います。

クエリが先頭のキー列と、その後に続く任意のキー列の両方を条件にフィルタリングしている場合、ClickHouse は先頭のキー列のインデックスマークに対して二分探索を実行します。
:::

<br />

<br />

<a name="query-on-url" />

ここでは、URL &quot;[http://public&#95;search](http://public\&#95;search)&quot; を最も頻繁にクリックしたユーザーのトップ 10 を算出するクエリを使用します。

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

応答は次のとおりです：<a name="query-on-url-slow" />

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

クライアントの出力から、[URL 列が複合主キーの一部](#a-table-with-a-primary-key)であるにもかかわらず、ClickHouse がほぼフルテーブルスキャンに近い処理を実行していることがわかります。ClickHouse は、このテーブルの 887 万行のうち 881 万行を読み取っています。

[trace&#95;logging](/operations/server-configuration-parameters/settings#logger) が有効になっている場合、ClickHouse サーバーログファイルには、ClickHouse が 1083 個の URL インデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">汎用除外検索</a>を実行し、URL 列の値が &quot;[http://public&#95;search](http://public\&#95;search)&quot; である行を含んでいる可能性のあるグラニュールを特定していることが記録されます。

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

上のサンプルトレースログから分かるように、1083 個のグラニュールのうち 1076 個が（マークを通じて）URL 値が一致する行を含んでいる可能性があるものとして選択されています。

その結果、実際に URL 値 &quot;[http://public&#95;search](http://public\&#95;search)&quot; を含む行を特定するために、合計 881 万行が（10 本のストリームを使って並列に）ClickHouse エンジンにストリーミングされます。

しかし後で見るように、選択された 1076 個のグラニュールのうち、実際に一致する行を含んでいるのは 39 個のグラニュールだけです。

複合プライマリキー (UserID, URL) に基づくプライマリインデックスは、特定の UserID 値で行をフィルタリングするクエリを高速化するうえでは非常に有用でしたが、特定の URL 値で行をフィルタリングするクエリを高速化するうえでは大きな助けにはなっていません。

その理由は、URL 列が先頭のキー列ではないため、ClickHouse が URL 列のインデックスマークに対して二分探索ではなく汎用除外探索アルゴリズムを使用しており、**このアルゴリズムの有効性は URL 列とその直前のキー列である UserID のカーディナリティの差に依存している** ためです。

これを説明するために、汎用除外探索がどのように動作するかの詳細を示します。

<a name="generic-exclusion-search-algorithm" />

### 一般的な除外検索アルゴリズム {#generic-exclusion-search-algorithm}

以下では、先行キー列が低い（または高い）カーディナリティを持つときに、セカンダリ列を介してグラニュールが選択される場合の、<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >ClickHouse の一般的な除外検索アルゴリズム</a>の動作を説明します。

両方のケースの例として、次のように仮定します。

- URL 値 = "W3" の行を検索するクエリがある。
- UserID と URL の値を単純化した、抽象的な hits テーブルのバージョンがある。
- インデックスに対して同じ複合主キー (UserID, URL) を持つ。これは、行がまず UserID の値で並べ替えられ、同じ UserID 値の行はその後 URL で並べ替えられることを意味する。
- グラニュールサイズは 2、すなわち各グラニュールは 2 行を含む。

以下の図では、各グラニュールの最初のテーブル行に対応するキー列の値をオレンジ色で示しています。

**先行キー列のカーディナリティが低い場合**<a name="generic-exclusion-search-fast"></a>

UserID のカーディナリティが低いとします。この場合、同じ UserID 値が複数のテーブル行およびグラニュール、したがって複数のインデックスマークにわたって分布している可能性が高くなります。同じ UserID を持つインデックスマークでは、（テーブル行がまず UserID、次に URL で並べ替えられているため）URL の値は昇順に並んでいます。これにより、以下に説明するような効率的なフィルタリングが可能になります。

<Image img={sparsePrimaryIndexes07} size="md" alt="疎なプライマリインデックス 06" background="white"/>

上の図に示した抽象的なサンプルデータに対するグラニュール選択処理には、次の 3 つのシナリオがあります。

1.  **URL の値が W3 より小さく、かつ直後のインデックスマークの URL の値も W3 より小さい**インデックスマーク 0 は除外できます。これは、マーク 0 と 1 が同じ UserID 値を持つためです。この除外の前提条件により、グラニュール 0 が完全に U1 の UserID 値で構成されていることが保証されるため、ClickHouse はグラニュール 0 の最大 URL 値も W3 より小さいと仮定でき、そのグラニュールを除外できます。

2. **URL の値が W3 より小さい（または等しい）、かつ直後のインデックスマークの URL の値が W3 より大きい（または等しい）**インデックスマーク 1 は選択されます。これは、グラニュール 1 が URL が W3 の行を含んでいる可能性があることを意味するためです。

3. **URL の値が W3 より大きい**インデックスマーク 2 と 3 は除外できます。プライマリインデックスのインデックスマークは、各グラニュールの最初のテーブル行のキー列の値を保存し、かつテーブル行はキー列の値でディスク上にソートされているため、グラニュール 2 と 3 が URL 値 W3 を含む可能性はありません。

**先行キー列のカーディナリティが高い場合**<a name="generic-exclusion-search-slow"></a>

UserID のカーディナリティが高い場合、同じ UserID 値が複数のテーブル行およびグラニュールにわたって分布している可能性は低くなります。これは、インデックスマークの URL の値が単調増加にはならないことを意味します。

<Image img={sparsePrimaryIndexes08} size="md" alt="疎なプライマリインデックス 06" background="white"/>

上の図からわかるように、URL の値が W3 より小さいと示されているすべてのマークは、その関連するグラニュールの行を ClickHouse エンジンにストリーミングするために選択されます。

これは、図中のすべてのインデックスマークが前述のシナリオ 1 に該当するものの、*直後のインデックスマークが現在のマークと同じ UserID 値を持つ*という除外の前提条件を満たしておらず、そのため除外できないためです。

たとえば、**URL の値が W3 より小さく、かつ直後のインデックスマークの URL の値も W3 より小さい**インデックスマーク 0 を考えます。これは、直後のインデックスマーク 1 が現在のマーク 0 と同じ UserID 値を持って *いない* ため、除外することはできません。

このことにより、ClickHouse はグラニュール 0 の最大 URL 値について仮定を行うことができなくなります。代わりに、グラニュール 0 が URL 値 W3 を持つ行を含んでいる可能性があると想定せざるを得ず、マーク 0 を選択する必要があります。

同じシナリオは、マーク 1、2、および 3 にも当てはまります。

:::note 結論
クエリが複合キーを構成するカラムでフィルタしているものの、それが最初のキー列ではない場合、ClickHouse は <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">汎用排他検索アルゴリズム</a> を <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索アルゴリズム</a> の代わりに使用します。このアルゴリズムは、直前のキー列のカーディナリティが低い（あるいはより低い）場合に最も効果的です。
:::

このサンプルデータセットでは、両方のキー列（UserID, URL）は同程度に高いカーディナリティを持っており、前述のとおり、URL 列の直前のキー列のカーディナリティが高い、あるいは同程度に高い場合には、汎用排他検索アルゴリズムはあまり効果的ではありません。

### データスキッピングインデックスに関する注意 {#note-about-data-skipping-index}

UserID と URL はどちらも同様にカーディナリティが高いため、[URL でのクエリフィルタリング](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) についても、[複合主キー (UserID, URL) を持つテーブル](#a-table-with-a-primary-key) の URL 列に [セカンダリのデータスキッピングインデックス](./skipping-indexes.md) を作成しても、得られる効果はそれほど大きくありません。

例えば、次の 2 つのステートメントでは、テーブルの URL 列に [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) データスキッピングインデックスを作成し、データを投入します。

```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```

ClickHouseは、4つの連続した[granule](#data-is-organized-into-granules-for-parallel-data-processing)のグループごとに（上記の`ALTER TABLE`文の`GRANULARITY 4`句に注意してください）、URL値の最小値と最大値を格納する追加のインデックスを作成しました。

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white" />

最初のインデックスエントリ（上図の&#39;mark 0&#39;）には、[テーブルの最初の4つのgranuleに属する行](#data-is-organized-into-granules-for-parallel-data-processing)のURL値の最小値と最大値が格納されています。

2番目のインデックスエントリ（&#39;mark 1&#39;）には、テーブルの次の4つのgranuleに属する行のURL値の最小値と最大値が格納されており、以降も同様です。

（ClickHouseは、インデックスマークに関連付けられたgranuleのグループを[特定する](#mark-files-are-used-for-locating-granules)ために、データスキッピングインデックス用の特別な[markファイル](#mark-files-are-used-for-locating-granules)も作成しました。）

UserIDとURLのカーディナリティがともに高いため、この二次データスキッピングインデックスは、[URLでフィルタリングするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)の実行時に、granuleの選択除外には役立ちません。

クエリが検索している特定のURL値（すなわち&#39;[http://public&#95;search&#39;）は、各granuleグループに対してインデックスが格納している最小値と最大値の範囲内に存在する可能性が非常に高く、その結果ClickHouseはそのgranuleグループを選択せざるを得なくなります（クエリに一致する行が含まれている可能性があるため）。](http://public\&#95;search\&#39;）は、各granuleグループに対してインデックスが格納している最小値と最大値の範囲内に存在する可能性が非常に高く、その結果ClickHouseはそのgranuleグループを選択せざるを得なくなります（クエリに一致する行が含まれている可能性があるため）。)

### 複数のプライマリインデックスを使用する必要性 {#a-need-to-use-multiple-primary-indexes}

そのため、特定の URL を持つ行でフィルタするサンプルクエリを大幅に高速化したい場合は、そのクエリに最適化されたプライマリインデックスを使用する必要があります。

さらに、特定の UserID を持つ行でフィルタするサンプルクエリの高いパフォーマンスも維持したい場合は、複数のプライマリインデックスを使用する必要があります。

以下では、その実現方法について説明します。

<a name="multiple-primary-indexes"></a>

### 追加のプライマリインデックスを作成するためのオプション {#options-for-creating-additional-primary-indexes}

サンプルクエリ 2 つ（特定の UserID を持つ行をフィルタするクエリと、特定の URL を持つ行をフィルタするクエリ）の両方を大幅に高速化したい場合は、次の 3 つのオプションのいずれかを使って複数のプライマリインデックスを利用する必要があります。

- 異なるプライマリキーを持つ**2 つ目のテーブル**を作成する。
- 既存テーブルに対して**マテリアライズドビュー**を作成する。
- 既存テーブルに**プロジェクション**を追加する。

これら 3 つのオプションはいずれも、テーブルのプライマリインデックスと行のソート順を再編成するために、サンプルデータを追加のテーブルに実質的に複製します。

ただし、これら 3 つのオプションは、クエリや INSERT 文のルーティングに関して、その追加テーブルがユーザーからどの程度透過的であるかが異なります。

異なるプライマリキーを持つ**2 つ目のテーブル**を作成する場合、クエリはそのクエリに最も適したテーブルバージョンに明示的に送信する必要があり、テーブル間の同期を保つために新しいデータは両方のテーブルに明示的に挿入しなければなりません。

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

**マテリアライズドビュー**の場合は、追加のテーブルが暗黙的に作成され、両方のテーブル間でデータが自動的に同期されます。

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

そして**プロジェクション**は、暗黙的に作成されて非表示となる追加テーブルをデータ変更とともに自動的に同期するだけでなく、クエリに対して ClickHouse が最も効果的なテーブルバージョンを自動的に選択してくれるため、最も透過的なオプションです。

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

以下では、複数のプライマリインデックスを作成して利用するためのこれら 3 つのオプションについて、実際の例を交えながら、より詳細に説明します。

<a name="multiple-primary-indexes-via-secondary-tables"></a>

### オプション 1: セカンダリテーブル {#option-1-secondary-tables}

<a name="secondary-table" />

元のテーブルとはキー列の順序を入れ替えた主キーを持つ、追加のテーブルを新たに作成します。

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

[元のテーブル](#a-table-with-a-primary-key) から 887 万行すべてを別のテーブルに挿入します。

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
```

レスポンスは以下のようになります：

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

最後にテーブルを最適化します：

```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

プライマリキー内の列の順序を入れ替えたため、挿入された行は（[元のテーブル](#a-table-with-a-primary-key) と比較して）ディスク上に異なる辞書順で保存されるようになり、その結果、そのテーブルの 1083 個のグラニュールに含まれる値も以前とは異なるものになります。

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white" />

これが、その結果として得られたプライマリキーです。

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white" />

このプライマリキーにより、URL 列でフィルタリングするサンプルクエリの実行を大幅に高速化し、URL &quot;[http://public&#95;search](http://public\&#95;search)&quot; を最も頻繁にクリックしたユーザー上位 10 人を算出できるようになります。

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

応答は次のとおりです:

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

これで、ClickHouse は [ほぼフルテーブルスキャンを行う](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns) のではなく、そのクエリをはるかに効率的に実行できるようになりました。

UserID を第 1 キー列、URL を第 2 キー列とする [元のテーブル](#a-table-with-a-primary-key) のプライマリインデックスでは、ClickHouse はそのクエリを実行するにあたり、インデックスマークに対して [generic exclusion search](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) を使用していましたが、UserID と URL のカーディナリティがどちらも高かったため、これはあまり効果的ではありませんでした。

プライマリインデックスの先頭列を URL に変更すると、ClickHouse はインデックスマークに対して <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索</a> を実行するようになります。
ClickHouse サーバーのログファイル内に出力される対応する trace ログからも、そのことが確認できます。

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

ClickHouse は、汎用除外検索を使用した場合の 1076 個のインデックスマークではなく、39 個のインデックスマークだけを選択しました。

なお、この追加テーブルは、URL でフィルタリングする今回のサンプルクエリの実行を高速化するように最適化されています。

[元のテーブル](#a-table-with-a-primary-key)に対するそのクエリの[悪いパフォーマンス](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)と同様に、[`UserIDs` でフィルタリングするサンプルクエリ](#the-primary-index-is-used-for-selecting-granules)は、新しい追加テーブルではあまり効率的には実行されません。というのも、そのテーブルの primary index において UserID は 2 番目のキー列になっており、そのため ClickHouse は granule の選択に generic exclusion search を使用します。しかし、これは UserID と URL のようにカーディナリティが同程度に高い場合には[あまり効果的ではありません](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。\
詳細については、以下の詳細ボックスを開いてください。

<details>
  <summary>
    UserID でフィルタリングするクエリは、現在はパフォーマンスが悪い<a name="query-on-userid-slow" />
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

10 rows in set. Elapsed: 0.024 sec.
# highlight-next-line
Processed 8.02 million rows,
73.04 MB (340.26 million rows/s., 3.10 GB/s.)
```

    Server Log:

    ```response
...Executor): Key condition: (column 1 in [749927693, 749927693])
# highlight-next-line
...Executor): Used generic exclusion search over index for part all_1_9_2
              with 1453 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
# highlight-next-line
              980/1083 marks by primary key, 980 marks to read from 23 ranges
...Executor): Reading approx. 8028160 rows with 10 streams
```
  </p>
</details>

現在は 2 つのテーブルがあり、それぞれ `UserIDs` でフィルタリングするクエリと、URL でフィルタリングするクエリの高速化に最適化されています。

### オプション 2: マテリアライズドビュー {#option-2-materialized-views}

既存のテーブルに[マテリアライズドビュー](/sql-reference/statements/create/view.md)を作成します。

```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

レスポンスは次のとおりです：

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note

* ビューのプライマリキーでは、（[元のテーブル](#a-table-with-a-primary-key) と比較して）キー列の順序を入れ替えています
* マテリアライズドビューは、**暗黙的に作成されたテーブル**を基盤としており、その行順序とプライマリインデックスは指定したプライマリキー定義に基づきます
* 暗黙的に作成されたテーブルは `SHOW TABLES` クエリで一覧表示され、その名前は `.inner` で始まります
* まずマテリアライズドビュー用の基盤となるテーブルを明示的に作成し、その後で `TO [db].[table]` [句](/sql-reference/statements/create/view.md) を指定してそのテーブルをターゲットにすることも可能です
* `POPULATE` キーワードを使用して、暗黙的に作成されたテーブルをソーステーブル [hits&#95;UserID&#95;URL](#a-table-with-a-primary-key) の 887 万行すべてで直ちに埋めます
* 新しい行がソーステーブル hits&#95;UserID&#95;URL に挿入されると、その行は暗黙的に作成されたテーブルにも自動的に挿入されます
* 実質的に暗黙的に作成されたテーブルは、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) と同じ行順序とプライマリインデックスを持ちます:

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white" />

ClickHouse は、暗黙的に作成されたテーブルの [カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules) (*.mrk2)、および [プライマリインデックス](#the-primary-index-has-one-entry-per-granule) (primary.idx) を、ClickHouse サーバーのデータディレクトリ内の特別なフォルダに保存します:

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white" />

:::

このマテリアライズドビューを基盤とする暗黙的に作成されたテーブル（およびそのプライマリインデックス）は、URL 列でフィルタリングする例のクエリの実行を大幅に高速化するために利用できます。

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは以下のとおりです。

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

マテリアライズドビューの裏側で暗黙的に作成されるテーブル（およびそのプライマリインデックス）は、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と事実上同一であるため、クエリは明示的に作成したテーブルを使う場合と実質的に同じ方法で実行されます。

ClickHouse のサーバーログファイル内の対応するトレースログは、ClickHouse がインデックスマークに対して二分探索を実行していることを確認させてくれます。

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

### オプション 3：プロジェクション {#option-3-projections}

既存のテーブルにプロジェクションを作成します。

```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

続いて、このプロジェクションをマテリアライズします:

```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note

* プロジェクションは、指定された `ORDER BY` 句に基づいた行順序とプライマリインデックスを持つ**隠しテーブル**を作成します
* 隠しテーブルは `SHOW TABLES` クエリでは一覧表示されません
* `MATERIALIZE` キーワードを使用して、ソーステーブル [hits&#95;UserID&#95;URL](#a-table-with-a-primary-key) の 887 万行すべてを、即座に隠しテーブルに投入します
* 新しい行がソーステーブル hits&#95;UserID&#95;URL に挿入されると、その行は自動的に隠しテーブルにも挿入されます
* クエリは常に（構文上は）ソーステーブル hits&#95;UserID&#95;URL を対象としますが、もし隠しテーブルの行順序とプライマリインデックスにより、より効率的なクエリ実行が可能な場合は、その隠しテーブルが代わりに使用されます
* プロジェクションは、たとえ ORDER BY がプロジェクションの ORDER BY 句と一致していても、ORDER BY を使用するクエリを効率化しないことに注意してください（[https://github.com/ClickHouse/ClickHouse/issues/47333](https://github.com/ClickHouse/ClickHouse/issues/47333) を参照）
* 実質的には、暗黙的に作成される隠しテーブルは、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と同じ行順序とプライマリインデックスを持ちます:

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white" />

ClickHouse は、隠しテーブルの[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules) (*.mrk2)、および[プライマリインデックス](#the-primary-index-has-one-entry-per-granule) (primary.idx) を、以下のスクリーンショットでオレンジ色に示した特別なディレクトリ内に、ソーステーブルのデータファイル、マークファイル、プライマリインデックスファイルと並べて保存します:

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white" />

:::

プロジェクションによって作成された隠しテーブル（およびそのプライマリインデックス）は、これで URL 列でフィルタリングするサンプルクエリの実行を大幅に高速化するために（暗黙的に）利用されるようになります。クエリは構文上はプロジェクションのソーステーブルを対象としている点に注意してください。

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは以下のとおりです：

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

プロジェクションによって作成される隠しテーブル（およびそのプライマリインデックス）は、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) と本質的に同一であるため、クエリは明示的に作成したテーブルを使う場合と同様の方法で実行されます。

ClickHouse のサーバーログファイル中の該当トレースログから、ClickHouse がインデックスマークに対して二分探索を実行していることが確認できます。

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

### まとめ {#summary}

[複合主キー (UserID, URL) を持つテーブル](#a-table-with-a-primary-key) のプライマリインデックスは、[UserID でフィルタするクエリ](#the-primary-index-is-used-for-selecting-granules) を高速化するうえで非常に有用でした。しかし、URL 列も複合主キーの一部であるにもかかわらず、そのインデックスは [URL でフィルタするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) の高速化にはあまり寄与していません。

その逆のケースも同様です。
[複合主キー (URL, UserID) を持つテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) のプライマリインデックスは、[URL でフィルタするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) を高速化していましたが、[UserID でフィルタするクエリ](#the-primary-index-is-used-for-selecting-granules) にはあまり効果がありませんでした。

主キー列である UserID と URL のカーディナリティが同程度に高いため、第 2 キー列でフィルタするクエリは、[第 2 キー列がインデックスに含まれていても大きな恩恵を受けません](#generic-exclusion-search-algorithm)。

したがって、プライマリインデックスから第 2 キー列を削除する（これによりインデックスのメモリ消費量が減少する）ことは合理的であり、その代わりに[複数のプライマリインデックスを使用する](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes) 方がよい場合があります。

一方で、複合主キー内のキー列のカーディナリティに大きな差がある場合は、プライマリキー列をカーディナリティの小さい順に並べることが、[クエリにとって有利になります](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。

キー列間のカーディナリティの差が大きいほど、キー内での列の並び順の重要性が増します。次のセクションでそれを示します。

## キーカラムを効率的に並べる {#ordering-key-columns-efficiently}

<a name="test" />

複合主キーでは、キーカラムの並び順は次の両方に大きな影響を与えます。

* クエリにおける 2 番目以降のキー列（セカンダリキー列）でのフィルタリング効率
* テーブルのデータファイルの圧縮率

これを示すために、[Web トラフィックのサンプルデータセット](#data-set) の別バージョンを使用します。このデータセットでは、各行に 3 つのカラムがあり、インターネット上の「ユーザー」（`UserID` カラム）による URL（`URL` カラム）へのアクセスが、ボットトラフィックとしてマークされているかどうか（`IsRobot` カラム）を示します。

ここでは、典型的な Web アナリティクスクエリを高速化するために利用できる、上記 3 つすべてのカラムを含む複合主キーを使用します。これらのクエリは次のようなものです。

* 特定の URL へのトラフィックのうち、どれだけ（何パーセント）がボットによるものか
* 特定のユーザーがボット（ではない）であると、どの程度の確信を持てるか（そのユーザーからのトラフィックのうち、どれだけの割合がボットトラフィックであると／ではないと想定されるか）

複合主キーとして使いたい 3 つのカラムのカーディナリティを計算するために、次のクエリを使用します（ローカルテーブルを作成せずに TSV データをオンデマンドでクエリするために、[URL table function](/sql-reference/table-functions/url.md) を使用していることに注意してください）。このクエリを `clickhouse client` で実行してください。

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

レスポンスは以下のとおりです：

```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

`URL` 列と `IsRobot` 列の間には、とくにカーディナリティに大きな差があることがわかります。そのため、複合主キーにおけるこれらの列の並び順は、これらの列でフィルタリングするクエリを効率的に高速化するうえでも、テーブルのカラムデータファイルで最適な圧縮率を達成するうえでも重要になります。

これを示すために、ボットトラフィック分析データに対して 2 つのテーブルバージョンを作成します。

* 複合主キー `(URL, UserID, IsRobot)` を持つテーブル `hits_URL_UserID_IsRobot`。ここではキー列をカーディナリティの降順で並べます
* 複合主キー `(IsRobot, UserID, URL)` を持つテーブル `hits_IsRobot_UserID_URL`。ここではキー列をカーディナリティの昇順で並べます

複合主キー `(URL, UserID, IsRobot)` を持つテーブル `hits_URL_UserID_IsRobot` を作成します。

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

そして、887万行のデータを投入します:

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

そして、前のテーブルと同じ 887 万行のデータを投入します：

```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```

レスポンスは以下のとおりです。

```response
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```

### セカンダリキー列を使った効率的なフィルタリング {#efficient-filtering-on-secondary-key-columns}

クエリが複合キーを構成する列のうち少なくとも 1 つの列でフィルタリングしており、かつそれが最初のキー列である場合、[ClickHouse はそのキー列のインデックスマークに対して二分探索アルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

クエリが複合キーを構成する列のうち、最初のキー列ではない列のみに対してフィルタリングしている場合、[ClickHouse はそのキー列のインデックスマークに対して汎用排他探索アルゴリズムを使用します](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

2 つ目のケースでは、複合プライマリキー内でのキー列の並び順は、[汎用排他探索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) の有効性にとって重要です。

以下は、キー列 `(URL, UserID, IsRobot)` をカーディナリティの降順で並べたテーブルに対して、`UserID` 列でフィルタリングしているクエリです。

```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```

レスポンスは次のとおりです：

```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.026 sec.
# highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

これは、キー列 `(IsRobot, UserID, URL)` をカーディナリティの昇順に並べたテーブルに対して実行した同じクエリです。

```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```

レスポンスは以下のとおりです：

```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.
# highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

キー列をカーディナリティの昇順に並べたテーブルのほうが、クエリ実行が有意に効率的で高速になっていることがわかります。

その理由は、[汎用除外検索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) は、直前のキー列のカーディナリティがより低い場合に、その次のセカンダリキー列を用いて [granules](#the-primary-index-is-used-for-selecting-granules) を選択するときに最も効果的に動作するためです。この点については、本ガイドの[前のセクション](#generic-exclusion-search-algorithm)で詳しく説明しました。

### データファイルの最適な圧縮率 {#efficient-filtering-on-secondary-key-columns}

次のクエリでは、上記で作成した 2 つのテーブル間における `UserID` 列の圧縮率を比較します。

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

これはレスポンスです：

```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```

`UserID` 列の圧縮率は、キー列 `(IsRobot, UserID, URL)` をカーディナリティの昇順で並べたテーブルのほうが、明らかに高くなっていることがわかります。

どちらのテーブルにもまったく同じデータが格納されています（両方のテーブルに同じ 8.87 百万行のデータを挿入しています）が、複合主キーにおけるキー列の並び順は、テーブル内の<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮された</a>データがテーブルの[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns)上で必要とするディスク容量に大きな影響を与えます。

* 複合主キー `(URL, UserID, IsRobot)` を持ち、キー列をカーディナリティの降順で並べたテーブル `hits_URL_UserID_IsRobot` では、`UserID.bin` データファイルは **11.24 MiB** のディスク容量を使用します
* 複合主キー `(IsRobot, UserID, URL)` を持ち、キー列をカーディナリティの昇順で並べたテーブル `hits_IsRobot_UserID_URL` では、`UserID.bin` データファイルはわずか **877.47 KiB** のディスク容量しか使用しません

テーブルのある列のオンディスクデータについて高い圧縮率が得られると、ディスク容量を節約できるだけでなく、その列からデータを読み出す必要があるクエリ（特に分析クエリ）も高速になります。列データをディスクからメインメモリ（オペレーティングシステムのファイルキャッシュ）へ移動するために必要な I/O が少なくて済むためです。

以下では、テーブルの列の圧縮率の観点から、主キー列をカーディナリティの昇順で並べることが有利になる理由を説明します。

次の図は、キー列をカーディナリティの昇順で並べた主キーに対して、行がディスク上でどのような順序で並ぶかの概略を示しています。

<Image img={sparsePrimaryIndexes14a} size="md" alt="スパース主インデックス 14a" background="white" />

[テーブルの行データは主キー列でソートされた状態でディスクに格納される](#data-is-stored-on-disk-ordered-by-primary-key-columns)ことについては、すでに説明しました。

上の図では、テーブルの行（ディスク上のカラム値）はまず `cl` の値でソートされ、同じ `cl` 値を持つ行は `ch` の値でソートされます。第 1 キー列 `cl` のカーディナリティが低いため、同じ `cl` 値を持つ行が多数存在する可能性が高くなります。その結果として、`ch` の値も（同じ `cl` 値を持つ行という局所的な範囲では）自然と順序付きになりやすくなります。

1 つの列の中で、似たデータが互いに近く（例えばソートによって）配置されていると、そのデータはより高い圧縮率で圧縮されます。
一般に、圧縮アルゴリズムはデータの連続長（連続したデータをより長く扱えるほど圧縮に有利）と局所性（互いに似たデータが近くにあるほど圧縮率が高くなる）によって恩恵を受けます。

上の図と対照的に、次の図はキー列をカーディナリティの降順で並べた主キーに対して、行がディスク上でどのような順序で並ぶかの概略を示しています。

<Image img={sparsePrimaryIndexes14b} size="md" alt="スパース主インデックス 14b" background="white" />

これでテーブルの行はまず `ch` の値で並べられ、同じ `ch` の値を持つ行同士は `cl` の値で並べられます。
しかし、最初のキー列である `ch` のカーディナリティが高いため、同じ `ch` の値を持つ行が存在する可能性は低くなります。その結果として、`cl` の値が（同じ `ch` の値を持つ行という局所的な範囲で）整列している可能性も低くなります。

したがって、`cl` の値はほとんどランダムな順序になっていると考えられ、そのために局所性が悪くなり、圧縮比も悪くなります。

### まとめ {#summary-1}

セカンダリキー列に対するクエリでの効率的なフィルタリングと、テーブルの列データファイルの圧縮率を高めるためには、プライマリキー内の列をカーディナリティが小さいものから大きいものへと昇順に並べることが有用です。

## 単一行を効率的に特定する {#identifying-single-rows-efficiently}

一般的には、これは ClickHouse の[最適なユースケースではありません](/knowledgebase/key-value)が、
ClickHouse を基盤としたアプリケーションでは、ClickHouse テーブル内の特定の 1 行を識別する必要が生じる場合があります。

そのための直感的な解決策としては、各行に一意な値を持つ [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 列を用意し、その列をプライマリキー列として使って行を高速に取得する方法が考えられます。

最も高速に取得するためには、UUID 列は[最初のキー列である必要があります](#the-primary-index-is-used-for-selecting-granules)。

[ClickHouse テーブルの行データはプライマリキー列でソートされた状態でディスク上に保存される](#data-is-stored-on-disk-ordered-by-primary-key-columns)ことはすでに説明しました。このため、プライマリキー、あるいは複合プライマリキーにおいて、非常に高いカーディナリティを持つ列（UUID 列のような）が、より低いカーディナリティの列よりも前に置かれていると、[他のテーブル列の圧縮率が低下します](#optimal-compression-ratio-of-data-files)。

最速の取得と最適なデータ圧縮との間の妥協案としては、複合プライマリキーを用い、UUID を最後のキー列とし、その前に一部の列の良好な圧縮率を確保するための低（またはより低い）カーディナリティのキー列を配置する方法があります。

### 具体的な例 {#a-concrete-example}

具体的な例として、Alexey Milovidov が開発し、[ブログで紹介](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)しているプレーンテキストのペーストサービス [https://pastila.nl](https://pastila.nl) があります。

テキストエリアの内容が変更されるたびに、そのデータは自動的に ClickHouse のテーブルの行（変更 1 回につき 1 行）として保存されます。

貼り付けられたコンテンツ（の特定バージョン）を識別して取得する 1 つの方法は、そのコンテンツのハッシュを、そのコンテンツを含むテーブル行の UUID として使用することです。

次の図は、

- コンテンツが変更されたとき（たとえばテキストエリアに文字をタイプするキー入力による）の行の挿入順序と、
- `PRIMARY KEY (hash)` が使用されている場合に、挿入された行のデータがディスク上に配置される順序を示しています:

<Image img={sparsePrimaryIndexes15a} size="md" alt="疎なプライマリインデックス 15a" background="white"/>

`hash` 列が主キー列として使用されているため、

- 特定の行は[非常に高速に](#the-primary-index-is-used-for-selecting-granules)取得できますが、
- テーブルの行（その列データ）は、（一意かつランダムな）ハッシュ値で昇順に並べられた順序でディスク上に保存されます。そのため、content 列の値もデータ局所性のないランダムな順序で格納され、**content 列のデータファイルの圧縮率が最適とは言えない状態になります**。

特定の行を高速に取得できることを維持しつつ、content 列の圧縮率を大幅に改善するために、pastila.nl では特定の行を識別するために 2 つのハッシュ（複合主キー）を利用しています。

- 先ほど説明した、異なるデータに対して異なる値となるコンテンツのハッシュと、
- データがわずかに変更された程度では**変化しない**[局所性敏感ハッシュ（fingerprint）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)

次の図は、

- コンテンツが変更されたとき（たとえばテキストエリアに文字をタイプするキー入力による）の行の挿入順序と、
- 複合 `PRIMARY KEY (fingerprint, hash)` が使用された場合に、挿入された行のデータがディスク上に配置される順序を示しています:

<Image img={sparsePrimaryIndexes15b} size="md" alt="疎なプライマリインデックス 15b" background="white"/>

これでディスク上の行はまず `fingerprint` で並べられ、同じ fingerprint 値を持つ行については、その `hash` 値が最終的な順序を決定します。

データがわずかに異なるだけの場合には同じ fingerprint 値が割り当てられるため、似たようなデータは content 列の中でディスク上に近接して保存されるようになります。これは content 列の圧縮率にとって非常に有利です。一般に、圧縮アルゴリズムはデータ局所性（データ同士の類似度が高いこと）が高いほど、より良い圧縮率が得られるためです。

トレードオフとして、複合 `PRIMARY KEY (fingerprint, hash)` によって生成されるプライマリインデックスを最適に活用して特定の行を取得するには、2 つのフィールド（`fingerprint` と `hash`）が必要になります。