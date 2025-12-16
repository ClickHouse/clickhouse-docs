---
sidebar_label: 'プライマリインデックス'
sidebar_position: 1
description: 'このガイドでは、ClickHouse のインデックスについて徹底的に解説します。'
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


# ClickHouse のプライマリ索引に関する実践的入門 {#a-practical-introduction-to-primary-indexes-in-clickhouse}

## はじめに {#introduction}

このガイドでは、ClickHouse のインデックスについて深く掘り下げて解説します。以下の点を例示し、詳細に説明します。

- [ClickHouse におけるインデックスが、従来のリレーショナルデータベース管理システムとどのように異なるか](#an-index-design-for-massive-data-scales)
- [ClickHouse がどのようにテーブルのスパースなプライマリインデックスを構築し利用しているか](#a-table-with-a-primary-key)
- [ClickHouse におけるインデックス設計のベストプラクティスのいくつか](#using-multiple-primary-indexes)

このガイドで示されているすべての ClickHouse の SQL 文およびクエリは、必要に応じてご自身のマシン上で実行できます。
ClickHouse のインストール方法および利用開始手順については、[クイックスタート](/get-started/quick-start)を参照してください。

:::note
このガイドでは、ClickHouse のスパースなプライマリインデックスに焦点を当てます。

ClickHouse の[セカンダリなデータスキッピングインデックス](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)については、[チュートリアル](/guides/best-practices/skipping-indexes.md)を参照してください。
:::

### データセット {#data-set}

このガイド全体を通して、匿名化した Web トラフィックのサンプルデータセットを使用します。

- サンプルデータセットから 887 万行（イベント）のサブセットを使用します。
- 非圧縮のデータサイズは 887 万イベントで約 700 MB あり、ClickHouse に保存すると 200 MB に圧縮されます。
- このサブセットでは、それぞれの行に、インターネットユーザー（`UserID` カラム）が特定の時刻（`EventTime` カラム）に URL（`URL` カラム）をクリックしたことを示す 3 つのカラムが含まれています。

これら 3 つのカラムだけで、すでに次のような典型的な Web 分析クエリを作成できます:

- 「特定のユーザーについて、クリック数が多い URL の上位 10 件は何か？」
- 「特定の URL を最も頻繁にクリックしたユーザーの上位 10 人は誰か？」
- 「ユーザーが特定の URL をクリックするタイミング（例: 曜日）で、最も頻度が高いのはいつか？」

### テストマシン {#test-machine}

本ドキュメントで示すすべての実行時の数値は、Apple M1 Pro チップと 16GB の RAM を搭載した MacBook Pro 上で、ClickHouse 22.2.1 をローカル環境で実行した際の結果に基づいています。

### フルテーブルスキャン {#a-full-table-scan}

プライマリキーなしでデータセットに対してクエリがどのように実行されるかを確認するため、次の SQL DDL ステートメントを実行して、MergeTree テーブルエンジンを使用するテーブルを作成します。

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

次に、以下の SQL `INSERT` 文を使って、hits データセットの一部をテーブルに挿入します。
これは、clickhouse.com 上でリモートにホストされている完全なデータセットから一部を読み込むために、[URL table function](/sql-reference/table-functions/url.md) を使用します。


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

ClickHouse クライアントの結果の出力から、上記のステートメントがテーブルに 887 万行を挿入したことが分かります。

最後に、このガイドの後半での議論を分かりやすくし、図や結果を再現しやすくするために、FINAL キーワードを指定してテーブルに対して [optimize](/sql-reference/statements/optimize.md) を実行します。


```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
一般的には、データをテーブルにロードした直後に最適化を行う必要はなく、推奨もされません。この例でそれが必要になる理由は、このあとすぐに明らかになります。
:::

ここで、最初の Web アナリティクスのクエリを実行します。以下は、UserID 749927693 を持つインターネットユーザーについて、クリック数が最も多い URL の上位 10 件を集計しています。

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

ClickHouse クライアントの結果出力から、ClickHouse がテーブル全体スキャンを実行したことが分かります！テーブルにある 887 万行それぞれが、1 行ずつ ClickHouse にストリーミングされました。これはスケールしません。

これを（はるかに）効率的にし（さらに）高速化するには、適切な主キーを持つテーブルを使用する必要があります。そうすることで、ClickHouse は主キーのカラム（群）に基づいてスパースな主キー索引を自動的に作成し、それを使ってこの例のクエリの実行を大幅に高速化できます。


## ClickHouse の索引設計 {#clickhouse-index-design}

### 大規模データ向けのインデックス設計 {#an-index-design-for-massive-data-scales}

従来のリレーショナルデータベース管理システムでは、主索引にはテーブルの各行に対して 1 つのエントリが含まれます。この場合、主索引にはこのデータセットに対して 887 万件のエントリが含まれることになります。このような索引は特定の行を高速に特定できるため、ルックアップクエリやポイント更新において高い効率を発揮します。`B(+)-Tree` データ構造でエントリを検索する場合の平均計算量は `O(log n)` です。より正確には、`log_b n = log_2 n / log_2 b` であり、ここで `b` は `B(+)-Tree` の分岐係数、`n` は索引付けされた行数です。`b` は通常数百から数千の範囲であるため、`B(+)-Tree` は非常に浅い構造になり、レコードを特定するために必要なディスクシーク回数は少なくて済みます。887 万行で分岐係数 1000 の場合、平均して 2.3 回のディスクシークで済みます。ただし、この性能にはコストが伴います。追加のディスクおよびメモリのオーバーヘッド、テーブルに新しい行と索引エントリを追加する際の挿入コストの増大、さらには B-Tree のリバランス処理が必要になる場合があります。

B-Tree 索引に伴う課題を踏まえ、ClickHouse のテーブルエンジンは別のアプローチを採用しています。ClickHouse の [MergeTree Engine Family](/engines/table-engines/mergetree-family/index.md) は、巨大なデータ量を処理するために設計・最適化されています。これらのテーブルは、毎秒数百万行の挿入を受け付け、非常に大きな（数百 PB 規模の）データ量を保存できるよう設計されています。データはテーブルに対して [パーツごと](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) に素早く書き込まれ、バックグラウンドでこれらのパーツをマージするためのルールが適用されます。ClickHouse では、それぞれのパーツが独自の主索引を持ちます。パーツがマージされると、そのマージ後のパーツの主索引も同様にマージされます。ClickHouse が想定しているような非常に大規模なスケールでは、ディスクとメモリの効率性を極めて高く保つことが最重要です。そのため、すべての行を索引付けする代わりに、あるパーツの主索引は、行のグループ（「グラニュール」と呼ぶ）ごとに 1 つの索引エントリ（「マーク」と呼ぶ）を持つ設計になっています。この手法は **スパース索引** と呼ばれます。

スパース索引が可能なのは、ClickHouse がパーツの行を主キーとなるカラムでソートされた順序でディスクに保存しているためです。B-Tree ベースの索引のように個々の行を直接特定する代わりに、スパースな主索引は、索引エントリに対する二分探索を通じて、クエリにマッチする可能性のある行グループを素早く特定できるようにします。特定された、マッチしうる行グループ（グラニュール）は、その後 ClickHouse エンジンに対して並列にストリーミングされ、一致する行が検索されます。この索引設計により、主索引は小さく保たれ（完全にメインメモリに収まる必要があります）、それでもクエリ実行時間を大幅に短縮できます。特に、データ分析のユースケースで典型的なレンジクエリに対して効果を発揮します。

以下では、ClickHouse がスパースな主索引をどのように構築・利用しているかを詳細に説明します。記事の後半では、索引（主キーとなるカラム）を構築するために使用されるテーブルカラムの選択、削除、並び順に関するベストプラクティスについて説明します。

### 主キーを持つテーブル {#a-table-with-a-primary-key}

UserID と URL をキーとする複合主キーを持つテーブルを作成します。

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
    このガイドの後半での議論を分かりやすくし、また図や結果を再現可能にするために、DDL ステートメントでは次のように定義します。

    <ul>
      <li>
        <code>ORDER BY</code> 句によって、テーブルに対して複合ソートキーを指定します。
      </li>

      <li>
        次の設定を通して、プライマリインデックスが持つ索引エントリの数を明示的に制御します。

        <ul>
          <li>
            <code>index&#95;granularity</code>: デフォルト値である 8192 に明示的に設定します。これは、8192 行のグループごとに、プライマリインデックスが 1 つの索引エントリを持つことを意味します。例えば、テーブルに 16384 行が含まれている場合、インデックスは 2 つの索引エントリを持ちます。
          </li>

          <li>
            <code>index&#95;granularity&#95;bytes</code>: <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">adaptive index granularity</a> を無効にするために 0 に設定します。adaptive index granularity とは、次のいずれかの条件を満たす場合に、ClickHouse が n 行のグループに対して自動的に 1 つの索引エントリを作成する機能です。

            <ul>
              <li>
                <code>n</code> が 8192 未満であり、その <code>n</code> 行の合計行データサイズが 10 MB 以上である場合（<code>index&#95;granularity&#95;bytes</code> のデフォルト値は 10 MB）。
              </li>

              <li>
                <code>n</code> 行の合計行データサイズが 10 MB 未満だが、<code>n</code> が 8192 の場合。
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

上記の DDL ステートメントのプライマリキーにより、指定された 2 つのキーとなるカラムに基づいてプライマリインデックスが作成されます。

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

レスポンスは次のようになります。

```response
0 rows in set. Elapsed: 149.432 sec. Processed 8.87 million rows, 18.40 GB (59.38 thousand rows/s., 123.16 MB/s.)
```

<br />

次にテーブルを最適化します:

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br />

次のクエリで、テーブルに関するメタデータを取得できます。


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

レスポンスは以下のとおりです。

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

ClickHouse クライアントの出力は次のことを示しています:

* テーブルのデータはディスク上の特定のディレクトリに [wide format](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) で保存されており、これはそのディレクトリ内にテーブルの各カラムごとに 1 つのデータファイル（および 1 つのマークファイル）が存在することを意味します。
* テーブルには 887 万行のデータがあります。
* すべての行を合わせた非圧縮データサイズは 733.28 MB です。
* すべての行を合わせたディスク上の圧縮サイズは 206.94 MB です。
* テーブルには 1083 エントリ（「マーク」と呼ばれる）を持つプライマリインデックスがあり、そのインデックスサイズは 96.93 KB です。
* 合計で、テーブルのデータファイルとマークファイルおよびプライマリインデックスファイルを合わせて、ディスク上で 207.07 MB を使用します。


### データはプライマリキーカラムに基づく順序でディスクに保存される {#data-is-stored-on-disk-ordered-by-primary-key-columns}

先ほど作成したテーブルには、

- 複合[プライマリキー](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` と
- 複合[ソートキー](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`

があります。

:::note

- ソートキーのみを指定した場合、プライマリキーは暗黙的にソートキーと同じものとして定義されます。

- メモリ効率を高めるために、クエリでフィルタ条件として使用するカラムのみを含むプライマリキーを明示的に指定しています。プライマリキーに基づくプライマリインデックスは、丸ごとメインメモリ上にロードされます。

- 本ガイド内の図の一貫性を保ち、かつ圧縮率を最大化するために、テーブル内のすべてのカラムを含む別個のソートキーを定義しています（同種のデータが互いに近い位置に配置されている場合、たとえばソートによって並べられていると、そのデータはよりよく圧縮されます）。

- プライマリキーとソートキーを両方指定する場合、プライマリキーはソートキーの先頭部分（プレフィックス）である必要があります。
:::

挿入された行は、プライマリキーカラム（およびソートキーに含まれる追加の `EventTime` カラム）に基づいて、辞書順（昇順）でディスク上に保存されます。

:::note
ClickHouse では、プライマリキーカラムの値が同一の行を複数挿入することができます。この場合（下図の行 1 と行 2 を参照）、最終的な順序は指定されたソートキー、したがって `EventTime` カラムの値によって決まります。
:::

ClickHouse は<a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms
" target="_blank">カラム指向データベース管理システム</a>です。下図に示すように、

- ディスク上の表現では、テーブルの各カラムごとに 1 つのデータファイル（*.bin）があり、そのカラムのすべての値が<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a>形式で格納されます。
- 887 万行（8.87 million rows）のデータは、プライマリキーカラム（および追加のソートキーカラム）に基づいて辞書順の昇順でディスク上に保存されます。つまりこの例では、
  - まず `UserID`、
  - 次に `URL`、
  - そして最後に `EventTime` の順です。

<Image img={sparsePrimaryIndexes01} size="md" alt="スパースプライマリインデックス 01" background="white"/>

`UserID.bin`、`URL.bin`、`EventTime.bin` は、`UserID`、`URL`、`EventTime` カラムの値が格納されているディスク上のデータファイルです。

:::note

- プライマリキーはディスク上の行の辞書順を定義するため、テーブルに定義できるプライマリキーは 1 つだけです。

- ClickHouse の内部行番号付け方式（ログメッセージでも使用されます）に合わせるため、行番号は 0 から開始しています。
:::

### 並列データ処理のためにデータはグラニューラに編成されます {#data-is-organized-into-granules-for-parallel-data-processing}

データ処理のために、テーブルのカラム値は論理的にグラニューラに分割されます。
グラニューラは、データ処理のために ClickHouse にストリーミングされる、分割不可能な最小のデータ集合です。
つまり、個々の行を読む代わりに、ClickHouse は常に（ストリーミング方式かつ並列に）行のグループ全体（グラニューラ）を読み込みます。
:::note
カラム値は物理的にはグラニューラ内部に保存されていません。グラニューラは、クエリ処理のためにカラム値を論理的に編成するためのものです。
:::

次の図は、テーブルの 887 万行（のカラム値）が、テーブルの DDL ステートメントで `index_granularity`（デフォルト値 8192）が設定されている結果として、1083 個のグラニューラにどのように編成されているかを示しています。

<Image img={sparsePrimaryIndexes02} size="md" alt="Sparse Primary Indices 02" background="white"/>

最初の（ディスク上の物理順序に基づく）8192 行（それらのカラム値）は論理的にグラニューラ 0 に属し、次の 8192 行（それらのカラム値）はグラニューラ 1 に属し、というように続きます。

:::note

- 最後のグラニューラ（グラニューラ 1082）は 8192 行未満を「含み」ます。

- 本ガイドの冒頭にある「DDL Statement Details」で述べたように、このガイドでの議論を単純化し、かつ図や結果を再現可能にするために、[adaptive index granularity](/whats-new/changelog/2019.md/#experimental-features-1) を無効化しました。

  そのため、この例のテーブルでは最後のグラニューラを除くすべてのグラニューラは同じサイズです。

- adaptive index granularity を有効にしたテーブルでは（index granularity は[デフォルト](/operations/settings/merge-tree-settings#index_granularity_bytes)でアダプティブです）、一部のグラニューラのサイズは、行データのサイズに応じて 8192 行未満になることがあります。

- 主キーのカラム（`UserID`、`URL`）のいくつかのカラム値をオレンジ色でマークしています。
  このオレンジ色でマークされたカラム値は、各グラニューラの最初の行の主キーのカラム値です。
  後述するように、これらのオレンジ色でマークされたカラム値がテーブルのプライマリインデックスのエントリになります。

- ClickHouse の内部番号付け方式（ログメッセージにも使用されます）と整合させるために、グラニューラの番号付けは 0 から開始しています。
:::

### プライマリインデックスはグラニュールごとに 1 つのエントリを持つ {#the-primary-index-has-one-entry-per-granule}

プライマリインデックスは、上の図に示したグラニュールに基づいて作成されます。このインデックスは非圧縮のフラット配列ファイル（primary.idx）であり、0 から始まるいわゆる数値インデックスマークを格納します。

下の図は、このインデックスが各グラニュールの先頭行について、プライマリキーのカラム値（上の図でオレンジ色で示されている値）を保存していることを示しています。
言い換えると、プライマリインデックスはテーブルの各 8192 行ごと（プライマリキーのカラムで定義された物理的な行順に基づく）に、プライマリキーのカラム値を保存しています。
例えば次のとおりです。

- 1 つ目のインデックスエントリ（下の図の「mark 0」）は、上の図におけるグラニュール 0 の最初の行のキーとなるカラム値を格納しています。
- 2 つ目のインデックスエントリ（下の図の「mark 1」）は、上の図におけるグラニュール 1 の最初の行のキーとなるカラム値を格納しており、以下同様です。

<Image img={sparsePrimaryIndexes03a} size="lg" alt="スパースなプライマリインデックス 03a" background="white"/>

合計すると、このテーブル（行数 887 万行、グラニュール数 1083）に対するインデックスには 1083 個のエントリがあります。

<Image img={sparsePrimaryIndexes03b} size="md" alt="スパースなプライマリインデックス 03b" background="white"/>

:::note

- [アダプティブインデックス粒度](/whats-new/changelog/2019.md/#experimental-features-1)を持つテーブルでは、テーブルの最終行のプライマリキーのカラム値を記録するために、プライマリインデックス内に 1 つの「最終」追加マークも保存されます。ただし、本ガイドでの議論を単純化し、かつ図や結果を再現可能にするためにアダプティブインデックス粒度を無効化しているため、この例のテーブルのインデックスにはこの最終マークは含まれていません。

- プライマリインデックスファイルは完全にメインメモリに読み込まれます。このファイルが利用可能な空きメモリ容量より大きい場合、ClickHouse はエラーを発生させます。
:::

<details>
    <summary>
    プライマリインデックスの内容を確認する
    </summary>
    <p>

セルフマネージドの ClickHouse クラスターでは、サンプルテーブルのプライマリインデックスの内容を確認するために、<a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">file テーブル関数</a>を使用できます。

そのためには、まず実行中のクラスター内のノードの <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> にプライマリインデックスファイルをコピーする必要があります。
<ul>
<li>ステップ 1: プライマリインデックスファイルを含むパス (part-path) を取得する</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

テストマシンでは、`/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4` が返されます。

<li>ステップ 2: user_files_path を取得する</li>
Linux における<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">デフォルトの user_files_path</a> は
`/var/lib/clickhouse/user_files/`
です。

また、Linux では次のコマンドで変更されているかどうかを確認できます: `$ grep user_files_path /etc/clickhouse-server/config.xml`

テストマシンでは、パスは `/Users/tomschreiber/Clickhouse/user_files/` です。

<li>ステップ 3: プライマリインデックスファイルを user_files_path にコピーする</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

</ul>

<br/>
これで、SQL を使ってプライマリインデックスの内容を確認できます。
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

返される結果:

`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`

<li>最後のインデックスマークを取得する</li>
`
SELECT UserID, URL FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
返される結果:
`
4292714039 │ http://sosyal-mansetleri...
`
</ul>
<br/>
これは、サンプルテーブルのプライマリインデックス内容を示した図と完全に一致しています。

</p>
</details>

プライマリキーのエントリはインデックスマークと呼ばれます。これは、それぞれのインデックスエントリが、特定のデータ範囲の開始位置を示す「マーク」になっているためです。サンプルテーブルの場合、具体的には次のとおりです。

- UserID インデックスマーク:

  プライマリインデックス内に保存された `UserID` の値は、昇順にソートされています。<br/>
  上記の図にある 'mark 1' は、グラニュール 1 と、それ以降すべてのグラニュールに含まれるテーブル行の `UserID` 値が、必ず 4.073.710 以上であることを示しています。

[後ほど説明するように](#the-primary-index-is-used-for-selecting-granules)、このグローバルな順序付けにより、ClickHouse は、クエリがプライマリキーの最初のカラムでフィルタリングしている場合に、最初のキーカラムに対するインデックスマーク上で<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索アルゴリズム</a>を使用できるようになります。

- URL インデックスマーク:

  主キーのカラム `UserID` と `URL` のカーディナリティがほぼ同程度であるということは、一般的に言えば、先頭カラム以降のすべてのキーカラムのインデックスマークは、「少なくとも現在のグラニュール内で、直前のキーカラムの値がすべてのテーブル行で同一である範囲」においてのみ、データの範囲を示すにとどまることを意味します。<br/>
  たとえば、上の図では mark 0 と mark 1 の UserID の値が異なっているため、ClickHouse はグラニュール 0 内のすべてのテーブル行について、すべての URL の値が `'http://showtopics.html%3...'` 以上であるとは仮定できません。しかし、もし上の図で mark 0 と mark 1 の UserID の値が同じであれば（つまり、グラニュール 0 内のすべてのテーブル行で UserID の値が同じである場合）、ClickHouse はグラニュール 0 内のすべてのテーブル行について、すべての URL の値が `'http://showtopics.html%3...'` 以上であると仮定できます。

  このことがクエリ実行パフォーマンスにどのような影響を与えるかについては、後ほど詳しく説明します。

### プライマリインデックスはグラニュールの選択に使用されます {#the-primary-index-is-used-for-selecting-granules}

これで、プライマリインデックスのサポートを利用してクエリを実行できます。

次のクエリは、UserID 749927693 に対して、最もクリックされた URL の上位 10 件を算出します。

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは以下のとおりです。

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

ClickHouse クライアントの出力を見ると、テーブル全体のスキャンを行う代わりに、8.19 千行だけが ClickHouse にストリーミングされたことが分かります。

<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">トレースログ</a>が有効になっている場合、ClickHouse サーバーログファイルには、ClickHouse が 1083 個の UserID インデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索</a>を実行し、UserID カラムの値が `749927693` である行を含む可能性のある granule を特定していることが記録されます。これは 19 ステップを要し、平均時間計算量は `O(log2 n)` です。

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

上のトレースログから、既存の 1083 個のマークのうち 1 つだけがクエリ条件に一致していることがわかります。

<details>
  <summary>
    トレースログの詳細
  </summary>

  <p>
    マーク 176 が特定されました（「found left boundary mark」はそのマークを含み、「found right boundary mark」はそのマークを含みません）。そのため、実際に UserID カラムの値が `749927693` である行を見つけるために、グラニュール 176 のすべての 8192 行（行 1,441,792 から始まります。これについてはこのガイドの後半で説明します）が ClickHouse にストリーミングされます。
  </p>
</details>

また、この挙動はサンプルクエリで <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN 句</a> を使って再現できます。

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

クライアントの出力から、1083 個の granule のうち 1 個が、UserID カラム値が 749927693 の行を含んでいる可能性がある granule として選択されたことが分かります。

:::note 結論
クエリが複合キーを構成するカラムのうち、先頭のキー・カラムでフィルタリングしている場合、ClickHouse はそのキー・カラムの索引マークに対して二分探索アルゴリズムを実行します。
:::

<br />

前述のとおり、ClickHouse はスパースなプライマリ索引を用いて、クエリにマッチする行を含んでいる可能性のある granule を二分探索により高速に選択します。

これは ClickHouse のクエリ実行における **第 1 段階（granule の選択）** です。

**第 2 段階（データ読み取り）** では、ClickHouse は選択された granule を特定し、それらすべての行を ClickHouse エンジンにストリーミングして、実際にクエリにマッチする行を見つけます。

この第 2 段階については、次のセクションでより詳しく説明します。


### マークファイルはグラニュールの位置特定に使用される {#mark-files-are-used-for-locating-granules}

次の図は、このテーブルのプライマリインデックスファイルの一部を示しています。

<Image img={sparsePrimaryIndexes04} size="md" alt="スパースなプライマリインデックス 04" background="white"/>

前述のとおり、インデックス内の 1083 個の UserID マークに対して二分探索を行うことで、マーク 176 が特定されました。したがって、対応するグラニュール 176 には、UserID カラム値が 749.927.693 の行が含まれている可能性があります。

<details>
    <summary>
    グラニュール選択の詳細
    </summary>
    <p>

上の図は、マーク 176 が、対応するグラニュール 176 の最小 UserID 値が 749.927.693 より小さく、かつ次のマーク（マーク 177）に対応するグラニュール 177 の最小 UserID 値がこの値より大きい、最初のインデックスエントリであることを示しています。したがって、マーク 176 に対応するグラニュール 176 だけが、UserID カラム値が 749.927.693 の行を含んでいる可能性があります。
</p>
</details>

グラニュール 176 内の行に、UserID カラム値が 749.927.693 のものが存在するかどうかを確認するには、このグラニュールに属する 8192 行すべてを ClickHouse にストリーミングする必要があります。

そのためには、ClickHouse はグラニュール 176 の物理位置を把握している必要があります。

ClickHouse では、このテーブルのすべてのグラニュールの物理位置はマークファイル内に保存されています。データファイルと同様に、テーブルの各カラムごとに 1 つのマークファイルがあります。

次の図は、テーブルの `UserID`、`URL`、`EventTime` カラムのグラニュールの物理位置を保持している 3 つのマークファイル `UserID.mrk`、`URL.mrk`、`EventTime.mrk` を示しています。

<Image img={sparsePrimaryIndexes05} size="md" alt="スパースなプライマリインデックス 05" background="white"/>

すでに説明したように、プライマリインデックスはフラットで非圧縮の配列ファイル（primary.idx）であり、0 から始まる番号付きのインデックスマークを格納しています。

同様に、マークファイルも 0 から番号付けされたマークを格納するフラットで非圧縮の配列ファイル（*.mrk）です。

ClickHouse が、クエリにマッチする行を含んでいる可能性のあるグラニュールに対応するインデックスマークを特定して選択すると、マークファイルに対して位置による配列ルックアップを行うことで、そのグラニュールの物理位置を取得できます。

特定のカラムに対する各マークファイルエントリは、オフセットという形で 2 つの位置情報を保存しています。

- 1 つ目のオフセット（上の図では 'block_offset'）は、選択されたグラニュールの圧縮版を含む、<a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">ブロック</a>を、<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮された</a>カラムデータファイル内で特定するものです。この圧縮ブロックには、いくつかの圧縮グラニュールが含まれている可能性があります。特定された圧縮ファイルブロックは、読み込み時にメインメモリ上に解凍されます。

- 2 つ目のオフセット（上の図では 'granule_offset'）は、マークファイルに保存されているもので、解凍済みブロックデータ内でのグラニュールの位置を示します。

その後、特定された非圧縮グラニュールに属する 8192 行すべてが、さらなる処理のために ClickHouse にストリーミングされます。

:::note

- [ワイド形式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)かつ [adaptive index granularity](/whats-new/changelog/2019.md/#experimental-features-1) を使用していないテーブルに対しては、ClickHouse は、上の図に示されているような `.mrk` マークファイルを使用します。これらには、1 エントリあたり 8 バイト長のアドレスが 2 つ含まれます。これらのエントリは、すべて同じサイズを持つグラニュールの物理位置です。

インデックスグラニュラリティは [デフォルト](/operations/settings/merge-tree-settings#index_granularity_bytes) ではアダプティブですが、本ガイドでの説明を簡略化し、図や結果を再現可能にするために、例のテーブルではアダプティブなインデックスグラニュラリティを無効にしています。データサイズが [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)（セルフマネージドクラスターではデフォルトで 10 MB）より大きいため、このテーブルはワイド形式を使用しています。

- ワイド形式かつアダプティブなインデックスグラニュラリティを使用するテーブルに対しては、ClickHouse は `.mrk2` マークファイルを使用します。これらは `.mrk` マークファイルと同様のエントリに加えて、エントリが関連付けられているグラニュールの行数という 3 つ目の値を持ちます。

- [コンパクト形式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)のテーブルに対しては、ClickHouse は `.mrk3` マークファイルを使用します。

:::

:::note Why Mark Files

なぜプライマリインデックスは、インデックスマークに対応するグラニュールの物理的な位置を直接保持していないのでしょうか？

ClickHouse が想定している非常に大規模なスケールでは、ディスクとメモリの両方を極力効率的に使用することが重要だからです。

プライマリインデックスファイルはメインメモリに収まる必要があります。

今回のサンプルクエリでは、ClickHouse はプライマリインデックスを使用して、クエリと一致する行を含んでいる可能性があるグラニュールを 1 つだけ選択しました。その 1 つのグラニュールに対してのみ、ClickHouse は対応する行をストリーミングして後続処理を行うために物理的な位置情報を必要とします。

さらに、このオフセット情報が必要なのは UserID と URL のカラムだけです。

オフセット情報は、`EventTime` のようにクエリで使用されていないカラムには不要です。

このサンプルクエリの場合、ClickHouse が必要とするのは、UserID データファイル (UserID.bin) 内のグラニュール 176 用の 2 つの物理位置オフセットと、URL データファイル (URL.bin) 内のグラニュール 176 用の 2 つの物理位置オフセットだけです。

マークファイルによって提供される間接参照により、プライマリインデックス内に、3 つすべてのカラムに対する 1083 個すべてのグラニュールの物理的な位置エントリを直接格納することを避けています。これにより、メインメモリ内に不要な (潜在的に未使用の) データを保持することを回避しています。
:::

次の図とその後の説明は、このサンプルクエリに対して、ClickHouse が UserID.bin データファイル内のグラニュール 176 をどのように特定するかを示しています。

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

このガイドの前半で説明したとおり、ClickHouse はプライマリインデックスマーク 176 を選択し、その結果としてグラニュール 176 を、クエリと一致する行を含んでいる可能性があるものとして選択しました。

ClickHouse は、インデックスから選択したマーク番号 (176) を使用して、UserID.mrk マークファイルに対して位置配列のルックアップを行い、グラニュール 176 を特定するための 2 つのオフセットを取得します。

図のとおり、1 つ目のオフセットは UserID.bin データファイル内の圧縮ファイルブロックを特定します。このブロックには、圧縮されたグラニュール 176 が含まれています。

特定したファイルブロックがメインメモリ内に解凍されると、マークファイルに含まれる 2 つ目のオフセットを使って、非圧縮データ内でグラニュール 176 を特定できます。

ClickHouse は、このサンプルクエリ (UserID が 749.927.693 のインターネットユーザーに対して、最もクリックされた URL 上位 10 件) を実行するために、UserID.bin データファイルと URL.bin データファイルの両方からグラニュール 176 を特定し (およびそのすべての値をストリーミングし) る必要があります。

上の図は、ClickHouse が UserID.bin データファイルのグラニュールをどのように特定しているかを示しています。

これと並行して、ClickHouse は URL.bin データファイル内のグラニュール 176 に対しても同じ処理を行っています。2 つの対応するグラニュールはアラインされ、ClickHouse エンジンにストリーミングされて後続処理が行われます。すなわち、UserID が 749.927.693 であるすべての行について、グループごとに URL の値を集約およびカウントし、最後にカウント数の降順で URL グループ上位 10 件を出力します。

## 複数のプライマリインデックスの利用 {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>

### セカンダリキーのカラムは非効率になる場合がある（ならない場合もある） {#secondary-key-columns-can-not-be-inefficient}

クエリが複合キーを構成するカラムのうち、先頭のキー・カラムでフィルタリングしている場合、[ClickHouse はそのキー・カラムのインデックスマークに対して二分探索アルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

では、クエリが複合キーを構成するものの、先頭ではないキー・カラムでフィルタリングしている場合はどうなるでしょうか？

:::note
ここでは、クエリが明示的に先頭のキー・カラムではなく、セカンダリキーのカラムでフィルタリングしているシナリオについて説明します。

クエリが先頭のキー・カラムと、その後に続く任意のキー・カラムの両方でフィルタリングしている場合、ClickHouse は先頭のキー・カラムのインデックスマークに対して二分探索を実行します。
:::

<br />

<br />

<a name="query-on-url" />

ここでは、URL &quot;[http://public&#95;search](http://public\&#95;search)&quot; を最も頻繁にクリックしたユーザーの上位 10 件を算出するクエリを使用します：

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

クライアントの出力から、[URL カラムが複合主キーの一部である](#a-table-with-a-primary-key)にもかかわらず、ClickHouse がほぼ全表スキャンを実行していることが分かります。ClickHouse は、このテーブルの 887 万行のうち 881 万行を読み取っています。

[trace&#95;logging](/operations/server-configuration-parameters/settings#logger) が有効になっている場合、ClickHouse サーバーログファイルには、ClickHouse が URL の索引マーク 1083 個を対象に <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">generic exclusion search</a> を実行し、URL カラムの値が &quot;[http://public&#95;search](http://public\&#95;search)&quot; である行を含んでいる可能性のあるグラニュールを特定したことが記録されます。

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

上記のサンプルトレースログからわかるように、1083 個のグラニュールのうち 1076 個が（マークを介して）、URL 値が一致する行を含んでいる可能性があるものとして選択されています。

その結果、実際に URL 値 &quot;[http://public&#95;search](http://public\&#95;search)&quot; を含んでいる行を特定するために、合計 881 万行が（10 ストリームを使用して並列に）ClickHouse エンジンへストリーミングされます。

しかし後ほど見るように、その選択された 1076 個のグラニュールのうち、実際に一致する行を含んでいるのは 39 個のグラニュールだけです。

複合プライマリキー (UserID, URL) に基づくプライマリインデックスは、特定の UserID 値で行をフィルタリングするクエリを高速化するうえでは非常に有用でしたが、特定の URL 値で行をフィルタリングするクエリを高速化するうえでは、インデックスはあまり有効に機能していません。

その理由は、URL カラムが先頭のキーカラムではないため、ClickHouse は URL カラムのインデックスマークに対して（二分探索ではなく）汎用的な排除探索アルゴリズムを使用しており、**そのアルゴリズムの有効性は、URL カラムとその直前のキーカラムである UserID の間のカーディナリティの差に大きく依存する** ためです。

これを説明するために、汎用的な排除探索アルゴリズム (generic exclusion search) がどのように動作するかについて、いくつか詳細を示します。

<a name="generic-exclusion-search-algorithm" />


### 一般的な除外検索アルゴリズム {#generic-exclusion-search-algorithm}

以下では、先行キーのカラムが低い（または高い）カーディナリティを持つ場合に、セカンダリカラムを通じてグラニュールが選択されるときの、<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >ClickHouse の一般的な除外検索アルゴリズム</a>の動作を説明します。

両方のケースの例として、次の前提を置きます:

- URL の値 = "W3" の行を検索するクエリがある。
- UserID と URL の値を単純化した抽象的な hits テーブルがある。
- 索引には同じ複合主キー (UserID, URL) を使用している。これは、行がまず UserID の値で並べ替えられ、同じ UserID の行は URL で並べ替えられることを意味する。
- グラニュールサイズは 2、すなわち各グラニュールには 2 行が含まれる。

以下の図では、各グラニュールにおける最初のテーブル行のキー・カラム値をオレンジ色で示しています。

**先行キー・カラムのカーディナリティが低い場合**<a name="generic-exclusion-search-fast"></a>

UserID のカーディナリティが低いと仮定します。この場合、同じ UserID の値が複数のテーブル行やグラニュール、したがって複数の索引マークにまたがって出現する可能性が高くなります。同じ UserID を持つ索引マークについて、URL の値は昇順に並べ替えられます（テーブル行がまず UserID、次に URL で並べ替えられているため）。これにより、以下で説明するような効率的なフィルタリングが可能になります:

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

上の図にある抽象的なサンプルデータに対するグラニュール選択プロセスには、3 つの異なるシナリオがあります:

1.  **URL の値が W3 より小さく、かつ直後の索引マークの URL の値も W3 より小さい**索引マーク 0 は除外できます。これは、マーク 0 と 1 が同じ UserID の値を持つためです。この除外の前提条件により、グラニュール 0 が完全に U1 の UserID 値だけで構成されていると見なせるため、ClickHouse はグラニュール 0 内の最大 URL 値も W3 より小さいと仮定してグラニュールを除外できます。

2. **URL の値が W3 より小さい（または等しい）、かつ直後の索引マークの URL の値が W3 より大きい（または等しい）**索引マーク 1 は選択されます。これは、グラニュール 1 に URL が W3 の行が含まれている可能性があることを意味するためです。

3. **URL の値が W3 より大きい**索引マーク 2 と 3 は除外できます。主索引の索引マークには各グラニュールにおける最初のテーブル行のキー・カラム値が格納されており、テーブル行はキー・カラム値でディスク上にソートされているため、グラニュール 2 および 3 に URL の値が W3 の行が含まれることはありえません。

**先行キー・カラムのカーディナリティが高い場合**<a name="generic-exclusion-search-slow"></a>

UserID のカーディナリティが高い場合、同じ UserID の値が複数のテーブル行やグラニュールにまたがって出現する可能性は低くなります。これは、索引マークにおける URL の値が単調増加にならないことを意味します:

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

上の図から分かるように、URL の値が W3 より小さいと示されているすべてのマークは、対応するグラニュールの行を ClickHouse エンジンにストリーミングするために選択されています。

これは、図中のすべての索引マークが前述のシナリオ 1 に当てはまる一方で、*直後の索引マークが現在のマークと同じ UserID の値を持つ*という除外の前提条件を満たしていないため、除外できないからです。

例えば、**URL の値が W3 より小さく、かつ直後の索引マークの URL の値も W3 より小さい**索引マーク 0 を考えます。直後の索引マーク 1 が現在のマーク 0 と同じ UserID の値を持って*いない*ため、これは除外することができません。

この結果として、ClickHouse はグラニュール 0 内の最大 URL 値について何ら仮定を置くことができなくなります。代わりに、グラニュール 0 には URL の値が W3 の行が含まれている可能性があると見なさざるを得ず、マーク 0 を選択せざるを得ません。

同じシナリオは、マーク 1、2、3 にも当てはまります。

:::note 結論
ClickHouse が、複合キーを構成してはいるものの先頭キーではないカラムでクエリをフィルタリングしている場合に、<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">汎用的な除外探索アルゴリズム</a> を <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索アルゴリズム</a> の代わりに使用するのは、直前のキー カラムの基数が低い（あるいは相対的に低い）場合に最も効果的です。
:::

このサンプルデータセットでは、両方のキー カラム（UserID, URL）は同程度に高い基数を持っており、前述のとおり、URL カラムの直前のキー カラムの基数が高い（あるいは同程度に高い）場合には、汎用的な除外探索アルゴリズムはあまり効果的ではありません。

### data skipping index に関する注意事項 {#note-about-data-skipping-index}

UserID と URL のカーディナリティが同様に高いため、[URL に対するクエリフィルタリング](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) でも、[secondary data skipping index](./skipping-indexes.md) を URL カラムに作成しても、大きな効果は得られません。[複合プライマリキー (UserID, URL) を持つテーブル](#a-table-with-a-primary-key) の URL カラムに対しても同様です。

例えば、次の 2 つの文は、テーブルの URL カラムに [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) data skipping index を作成し、データを投入します。

```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```

ClickHouse は、追加のインデックスを新たに作成しました。これは、連続する 4 つの[グラニュール](#data-is-organized-into-granules-for-parallel-data-processing)ごとのグループ（上の `ALTER TABLE` 文の `GRANULARITY 4` 句に注目）について、URL の最小値と最大値を保持します。

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white" />

最初のインデックスエントリ（上の図にある「mark 0」）は、[テーブルの最初の 4 つのグラニュールに属する行](#data-is-organized-into-granules-for-parallel-data-processing)について、URL の最小値と最大値を保持しています。

2 番目のインデックスエントリ（「mark 1」）は、テーブルの次の 4 つのグラニュールに属する行について、URL の最小値と最大値を保持しており、以降も同様です。

（ClickHouse はまた、このデータスキップインデックスに対応して、インデックスマークに関連付けられたグラニュールのグループを[特定](#mark-files-are-used-for-locating-granules)するための特別な[マークファイル](#mark-files-are-used-for-locating-granules)も作成しました。）

UserID と URL のカーディナリティが同様に高いため、このセカンダリデータスキップインデックスは、[URL でフィルタするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)が実行されたときに、選択対象からグラニュールを除外するのにはほとんど役立ちません。

クエリが探している特定の URL 値（すなわち &#39;[http://public&#95;search&#39;）は、各グラニュールグループに対してインデックスに保存されている最小値と最大値の間に含まれている可能性が非常に高く、その結果、ClickHouse](http://public\&#95;search\&#39;）は、各グラニュールグループに対してインデックスに保存されている最小値と最大値の間に含まれている可能性が非常に高く、その結果、ClickHouse) はそのグループのグラニュールを選択せざるを得ません（クエリに一致する行が含まれている可能性があるためです）。


### 複数のプライマリインデックスを使用する必要性 {#a-need-to-use-multiple-primary-indexes}

その結果、特定の URL を持つ行をフィルタリングするサンプルクエリを大幅に高速化したい場合は、そのクエリに最適化されたプライマリインデックスを使用する必要があります。

さらに、特定の UserID を持つ行をフィルタリングするサンプルクエリについても良好なパフォーマンスを維持したい場合は、複数のプライマリインデックスを使用する必要があります。

以下では、それを実現する方法を示します。

<a name="multiple-primary-indexes"></a>

### 追加のプライマリ索引を作成するオプション {#options-for-creating-additional-primary-indexes}

サンプルクエリ 2 つ ― 特定の UserID を持つ行をフィルタするものと、特定の URL を持つ行をフィルタするもの ― の両方を大きく高速化したい場合は、次の 3 つのいずれかのオプションを使って複数のプライマリ索引を利用する必要があります。

- 異なるプライマリキーを持つ **2 つ目のテーブル** を作成する。
- 既存のテーブルに対して **materialized view** を作成する。
- 既存のテーブルに **PROJECTION** を追加する。

これら 3 つのオプションはいずれも、テーブルのプライマリ索引と行のソート順を再編成するために、サンプルデータを追加のテーブルに実質的に複製します。

しかし、これら 3 つのオプションは、クエリや挿入文のルーティングに関して、その追加テーブルがユーザーからどの程度透過的であるかが異なります。

異なるプライマリキーを持つ **2 つ目のテーブル** を作成する場合、クエリはクエリに最も適したテーブルバージョンに明示的に送る必要があり、新しいデータは両方のテーブルを同期させるために、両方のテーブルへ明示的に挿入しなければなりません。

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

**materialized view** を使用する場合、追加のテーブルは暗黙的に作成され、両方のテーブル間でデータは自動的に同期されます。

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

そして **PROJECTION** は最も透過的なオプションです。暗黙的に作成され（かつ非表示の）追加テーブルをデータ変更とともに自動的に同期させるだけでなく、ClickHouse がクエリに対して最も効果的なテーブルバージョンを自動的に選択します。

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

以下では、複数のプライマリ索引を作成および利用するための、これら 3 つのオプションについて、実例を用いてさらに詳しく説明します。

<a name="multiple-primary-indexes-via-secondary-tables"></a>

### オプション 1: セカンダリテーブル {#option-1-secondary-tables}

<a name="secondary-table" />

元のテーブルとはキーカラムの並び順を入れ替えた主キーを持つ、追加の新しいテーブルを作成します。

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

[元のテーブル](#a-table-with-a-primary-key) から 887 万行すべてを、追加で作成したテーブルに挿入します。

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
```

応答は次のようになります：

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

そして最後にテーブルを最適化します。

```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

プライマリキーのカラムの順序を変更したため、挿入された行はディスク上で異なる辞書順で保存されるようになりました([元のテーブル](#a-table-with-a-primary-key)と比較して)。そのため、このテーブルの1083個のグラニュールには、以前とは異なる値が含まれています:

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white" />

結果として得られるプライマリキーは次のとおりです:

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white" />

これにより、URLカラムでフィルタリングして、URL &quot;[http://public&#95;search&quot;を最も頻繁にクリックした上位10人のユーザーを計算するサンプルクエリの実行を大幅に高速化できます](http://public\&#95;search\&quot;を最も頻繁にクリックした上位10人のユーザーを計算するサンプルクエリの実行を大幅に高速化できます):

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは以下のとおりです。

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

今では、[ほぼテーブル全体をスキャンする](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns)代わりに、ClickHouse はそのクエリをはるかに効率的に実行できるようになりました。

UserID が先頭、URL が 2 番目のキー・カラムである[元のテーブル](#a-table-with-a-primary-key)のプライマリインデックスでは、ClickHouse はそのクエリを実行するためにインデックスマークに対して[汎用除外探索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)を使用していましたが、UserID と URL のカーディナリティがいずれも高かったため、それほど効率的ではありませんでした。

プライマリインデックスの先頭カラムを URL にすると、ClickHouse は現在、インデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索</a>を実行しています。
対応するトレースログが ClickHouse サーバーのログファイル内に出力されており、そのことを確認できます。


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

ClickHouse は、汎用除外検索を使用した場合の 1076 個ではなく、39 個のインデックスマークのみを選択しました。

追加テーブルは、URL によるフィルタリングを行うこのサンプルクエリの実行を高速化するよう最適化されている点に注意してください。

[元のテーブル](#a-table-with-a-primary-key)でのそのクエリの[悪いパフォーマンス](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)と同様に、`UserIDs` によるフィルタリングを行う[サンプルクエリ](#the-primary-index-is-used-for-selecting-granules)は、新しい追加テーブルではそれほど効率的には実行されません。これは、そのテーブルでは UserID がプライマリキーの 2 番目のキーカラムとなっており、そのため ClickHouse はグラニュール選択において汎用除外検索を使用することになり、UserID と URL のように[同程度に高いカーディナリティの場合にはあまり効果的ではない](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)ためです。
詳細は、以下の詳細ボックスを開いて確認してください。

<details>
  <summary>
    UserIDs によるフィルタリングクエリはパフォーマンスが悪くなった<a name="query-on-userid-slow" />
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

    10 rows in set. Elapsed: 0.024 sec.
    # highlight-next-line
    Processed 8.02 million rows,
    73.04 MB (340.26 million rows/s., 3.10 GB/s.)
    ```

    サーバーログ:

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

ここまでで 2 つのテーブルが用意できました。`UserIDs` によるフィルタリングクエリを高速化するよう最適化されたテーブルと、URL によるフィルタリングクエリを高速化するよう最適化されたテーブルです。


### オプション 2: materialized view の利用 {#option-2-materialized-views}

既存のテーブルに対して [materialized view](/sql-reference/statements/create/view.md) を作成します。

```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

出力は次のようになります。

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note

* view の primary key では（[元のテーブル](#a-table-with-a-primary-key) と比べて）キーとなるカラムの順序を入れ替えています
* materialized view は、**暗黙的に作成されたテーブル**を背後に持ち、その行順序と primary index は指定された primary key 定義に基づきます
* 暗黙的に作成されたテーブルは `SHOW TABLES` クエリで一覧表示され、名前は `.inner` で始まります
* materialized view 用のバックエンドテーブルを、先に明示的に作成しておくことも可能であり、その場合 view は `TO [db].[table]` [句](/sql-reference/statements/create/view.md) を介してそのテーブルをターゲットにできます
* `POPULATE` キーワードを使用して、暗黙的に作成されたテーブルをソーステーブル [hits&#95;UserID&#95;URL](#a-table-with-a-primary-key) からの 887 万行すべてで即座に初期化します
* 新しい行がソーステーブル hits&#95;UserID&#95;URL に挿入されると、その行は暗黙的に作成されたテーブルにも自動的に挿入されます
* 実質的に、暗黙的に作成されたテーブルは、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) と同じ行順序と primary index を持ちます:

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white" />

ClickHouse は、暗黙的に作成されたテーブルの [カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules) (*.mrk2)、および [primary index](#the-primary-index-has-one-entry-per-granule) (primary.idx) を、ClickHouse サーバーのデータディレクトリ内の専用フォルダに保存します:

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white" />

:::

materialized view を支える暗黙的に作成されたテーブル（およびその primary index）は、URL カラムでフィルタリングする例のクエリの実行を大幅に高速化するために利用できます。

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

materialized view を裏で支える暗黙的に作成されるテーブル（およびその primary index）は、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) と実質的に同一であるため、クエリは明示的に作成したテーブルを用いる場合と同様の効率で実行されます。

ClickHouse サーバーログファイル中の対応するトレースログから、ClickHouse がインデックスマークに対して二分探索を実行していることが確認できます。


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


### オプション 3: プロジェクション {#option-3-projections}

既存のテーブルにプロジェクションを作成します:

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

* projection は、その projection の `ORDER BY` 句に基づいた行の並び順とプライマリインデックスを持つ **隠しテーブル** を作成します
* この隠しテーブルは `SHOW TABLES` クエリでは表示されません
* `MATERIALIZE` キーワードを使用することで、ソーステーブル [hits&#95;UserID&#95;URL](#a-table-with-a-primary-key) から 887 万行すべてを即座に隠しテーブルへ書き込みます
* 新しい行がソーステーブル hits&#95;UserID&#95;URL に挿入されると、その行は自動的に隠しテーブルにも挿入されます
* クエリは常に（構文上は）ソーステーブル hits&#95;UserID&#95;URL を対象としますが、隠しテーブルの行の並び順とプライマリインデックスによってより効率的にクエリを実行できる場合は、その隠しテーブルが代わりに使用されます
* projection の ORDER BY がクエリの ORDER BY 句と一致していても、projection によって ORDER BY を使用するクエリが高速化されるわけではない点に注意してください（[https://github.com/ClickHouse/ClickHouse/issues/47333](https://github.com/ClickHouse/ClickHouse/issues/47333) を参照）
* 実質的には、暗黙的に作成された隠しテーブルは、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) と同じ行の並び順とプライマリインデックスを持ちます:

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white" />

ClickHouse は、隠しテーブルの [カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns)（*.bin）、[マークファイル](#mark-files-are-used-for-locating-granules)（*.mrk2）、および [プライマリインデックス](#the-primary-index-has-one-entry-per-granule)（primary.idx）を、ソーステーブルのデータファイル、マークファイル、プライマリインデックスファイルの隣にある特別なフォルダ（下のスクリーンショットでオレンジ色で示されたフォルダ）に保存します:

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white" />

:::

projection によって作成された隠しテーブル（およびそのプライマリインデックス）は、これで URL カラムでフィルタするサンプルクエリの実行を大幅に高速化するために（暗黙的に）利用できるようになりました。クエリは構文上は常に projection のソーステーブルを対象としている点に注意してください。

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のようになります。

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

プロジェクションによって作成される隠しテーブル（およびそのプライマリインデックス）は、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と実質的に同一であるため、クエリは明示的に作成したテーブルを使用する場合と同じ実効的な方法で実行されます。

ClickHouse サーバーログファイル内の対応するトレースログから、ClickHouse がインデックスマークに対して二分探索を実行していることが確認できます。


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

[複合主キー (UserID, URL) を持つテーブル](#a-table-with-a-primary-key) のプライマリ索引は、[UserID でフィルタするクエリ](#the-primary-index-is-used-for-selecting-granules) の高速化には非常に有効でした。しかし、その索引は、URL カラムが複合主キーの一部であるにもかかわらず、[URL でフィルタするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) の高速化にはそれほど寄与していません。

その逆も同様です。
[複合主キー (URL, UserID) を持つテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) のプライマリ索引は、[URL でフィルタするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) を高速化していましたが、[UserID でフィルタするクエリ](#the-primary-index-is-used-for-selecting-granules) についてはあまり効果がありませんでした。

主キー列である UserID と URL のカーディナリティが、どちらも同程度に高いため、第 2 キー列でフィルタするクエリは、[第 2 キー列が索引に含まれていてもあまり恩恵を受けません](#generic-exclusion-search-algorithm)。

したがって、第 2 キー列をプライマリ索引から削除する（その結果、索引のメモリ消費が減る）とともに、代わりに[複数のプライマリ索引を使用する](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes) 方が合理的です。

一方で、複合主キー内のキー列どうしでカーディナリティに大きな差がある場合には、主キー列をカーディナリティの昇順に並べることが、[クエリにとって有利になります](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。

キー列間のカーディナリティの差が大きければ大きいほど、キー内でのそれらの列の並び順がより重要になります。これについては次のセクションで示します。

## 複合キーのカラム順序を効率的に設計する {#ordering-key-columns-efficiently}

<a name="test" />

複合プライマリキーでは、キーとなるカラムの並び順が次の両方に大きな影響を与える可能性があります。

* クエリにおける二次キーとなるカラムでのフィルタリング効率
* テーブルのデータファイルに対する圧縮率

これを示すために、[web traffic sample data set](#data-set) の別バージョンを使用します。このデータでは、各行に 3 つのカラムがあり、インターネット「ユーザー」（`UserID` カラム）による URL（`URL` カラム）へのアクセスがボットトラフィックとしてマークされたかどうか（`IsRobot` カラム）を示します。

ここでは、典型的な Web 分析クエリを高速化できるように、上記 3 つすべてのカラムを含む複合プライマリキーを使用します。こうしたクエリでは、次のような計算を行います。

* 特定の URL へのトラフィックのうち、どれだけ（パーセンテージ）がボットによるものか
* 特定のユーザーがボット（ではない）とどの程度自信を持って判断できるか（そのユーザーからのトラフィックのうち、どの割合がボットトラフィックであるか、あるいはそうではないと想定されるか）

複合プライマリキーとして使用したい 3 つのカラムについて、そのカーディナリティを算出するために、次のクエリを使用します（ここでは、ローカルテーブルを作成せずに TSV データをアドホックでクエリするために [URL table function](/sql-reference/table-functions/url.md) を使用している点に注意してください）。このクエリを `clickhouse client` で実行してください。

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

応答は次のとおりです:

```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

特に `URL` カラムと `IsRobot` カラムの間でカーディナリティに大きな差があることが分かります。そのため、複合主キー内でのこれらのカラムの並び順は、これらのカラムでフィルタリングするクエリを効率的に高速化することと、テーブルのカラムデータファイルに対して最適な圧縮率を達成することの両方にとって重要です。

これを示すために、ボットトラフィック解析データに対して 2 つのテーブルのバージョンを作成します。

* カーディナリティの降順でキーとなるカラムを並べた、複合主キー `(URL, UserID, IsRobot)` を持つテーブル `hits_URL_UserID_IsRobot`
* カーディナリティの昇順でキーとなるカラムを並べた、複合主キー `(IsRobot, UserID, URL)` を持つテーブル `hits_IsRobot_UserID_URL`

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

そして、887万行を挿入します：

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

そして、前のテーブルに投入したのと同じ 887 万行のデータを投入します。


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


### セカンダリキーのカラムに対する効率的なフィルタリング {#efficient-filtering-on-secondary-key-columns}

クエリが複合キーの一部であり、かつ先頭のキーとなるカラムでフィルタリングしている場合、[ClickHouse はそのキー カラムのインデックスマークに対して二分探索アルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

クエリが、複合キーの一部ではあるものの先頭のキーではないカラムのみでフィルタリングしている場合、[ClickHouse はそのキー カラムのインデックスマークに対して汎用除外探索アルゴリズムを使用します](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

2 つ目のケースでは、複合主キー内におけるキー カラムの並び順が、[汎用除外探索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) の有効性にとって重要になります。

次は、キーのカラムをカーディナリティの降順で `(URL, UserID, IsRobot)` と並べたテーブルに対して、`UserID` カラムでフィルタリングするクエリです。

```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```

レスポンスは以下のとおりです。

```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.026 sec.
# highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

これは、キー・カラム `(IsRobot, UserID, URL)` をカーディナリティの昇順で並べ替えたテーブルに対して実行した、同じクエリです。

```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```

レスポンスは次のとおりです。

```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.
# highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

キーとなるカラムをカーディナリティの昇順で並べるように定義したテーブルでは、クエリ実行が大幅に効率的かつ高速になっていることがわかります。

その理由は、[汎用除外探索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) が最も効果的に動作するのは、[granules](#the-primary-index-is-used-for-selecting-granules) がセカンダリキーのカラム経由で選択され、その直前のキーとなるカラムのカーディナリティがより低い場合だからです。この点については、本ガイドの[前のセクション](#generic-exclusion-search-algorithm)で詳細に説明しました。


### データファイルの最適な圧縮率 {#optimal-compression-ratio-of-data-files}

このクエリは、上で作成した 2 つのテーブルにおける `UserID` カラムの圧縮率を比較します。

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

結果は次のとおりです：

```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```

`UserID` カラムの圧縮率は、キー列 `(IsRobot, UserID, URL)` をカーディナリティの昇順で並べたテーブルの方が、明らかに高くなっていることが分かります。

どちらのテーブルにもまったく同じデータ（両方のテーブルに同じ 887 万行を挿入）を格納しているにもかかわらず、複合主キーにおけるキー列の並び順は、テーブル内の<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮済み</a>データがテーブルの[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns)上で必要とするディスク容量に大きく影響します。

* 複合主キー `(URL, UserID, IsRobot)` を持ち、キー列をカーディナリティの降順で並べたテーブル `hits_URL_UserID_IsRobot` では、`UserID.bin` データファイルは **11.24 MiB** のディスク容量を使用します
* 複合主キー `(IsRobot, UserID, URL)` を持ち、キー列をカーディナリティの昇順で並べたテーブル `hits_IsRobot_UserID_URL` では、`UserID.bin` データファイルはわずか **877.47 KiB** のディスク容量しか使用しません

テーブルのあるカラムのディスク上のデータの圧縮率が高いと、ディスク容量を節約できるだけでなく、そのカラムからデータを読み出す必要があるクエリ（特に分析系クエリ）も高速になります。これは、カラムのデータをディスクからメインメモリ（OS のファイルキャッシュ）へ移動するために必要な I/O が少なくて済むためです。

以下では、主キーのカラムをカーディナリティの昇順で並べることが、テーブルのカラムの圧縮率にとって有利である理由を説明します。

次の図は、キー列がカーディナリティの昇順で並んでいる主キーに対して、行がディスク上でどのような順序で並ぶかを示したものです。

<Image img={sparsePrimaryIndexes14a} size="md" alt="スパース主インデックス 14a" background="white" />

[テーブルの行データは主キーのカラム順にディスク上へ格納される](#data-is-stored-on-disk-ordered-by-primary-key-columns)ことについては、すでに説明しました。

上の図では、テーブルの行（ディスク上のカラム値）は、まず `cl` の値で並べられ、同じ `cl` 値を持つ行の中では `ch` の値で並べられています。また、最初のキー列である `cl` のカーディナリティが低いため、同じ `cl` 値を持つ行が複数存在する可能性が高くなります。その結果として、`ch` の値も（同じ `cl` 値を持つ行の局所的な範囲で）並んだ状態になっている可能性が高くなります。

あるカラム内で、類似したデータが互いに近い位置に（例えばソートによって）配置されている場合、そのデータはより良く圧縮されます。
一般的に、圧縮アルゴリズムはデータの連続長（より多くのデータをまとめて扱えるほど圧縮に有利）と局所性（データ同士の類似性が高いほど圧縮率が向上）から恩恵を受けます。

これとは対照的に、次の図は、キー列がカーディナリティの降順で並んでいる主キーに対して、行がディスク上でどのような順序で並ぶかを示したものです。

<Image img={sparsePrimaryIndexes14b} size="md" alt="スパース主インデックス 14b" background="white" />


これでテーブルの行はまず `ch` の値で並べ替えられ、同じ `ch` の値を持つ行同士は `cl` の値で並べ替えられます。
しかし、先頭のキー列である `ch` のカーディナリティが高いため、同じ `ch` の値を持つ行が存在する可能性は低くなります。その結果として、`cl` の値が（同じ `ch` の値を持つ行という局所的な範囲で）順序付けられている可能性も低くなります。

したがって、`cl` の値はほとんどランダムな順序になっていると考えられ、その結果としてデータの局所性も圧縮率も悪くなります。

### まとめ {#summary-1}

クエリにおけるセカンダリキーのカラムに対する効率的なフィルタリングと、テーブルのカラムデータファイルの圧縮率の両方の観点から、プライマリキー内のカラムはカーディナリティが小さいものから大きいものへと昇順に配置することが望ましいです。

## 単一行を効率的に特定する {#identifying-single-rows-efficiently}

一般的には、ClickHouse にとってはそれが[最適なユースケースではない](/knowledgebase/key-value)ものの、
ClickHouse の上に構築されたアプリケーションが、ClickHouse テーブル内の単一行を特定する必要が生じる場合があります。

そのための直感的な解決策としては、1 行ごとに一意な値を持つ [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) カラムを用意し、行を高速に取得するためにそのカラムをプライマリキー・カラムとして使用することが考えられます。

最速で取得するためには、UUID カラムは[最初のキー・カラムである必要があります](#the-primary-index-is-used-for-selecting-granules)。

[ClickHouse テーブルの行データはプライマリキー・カラムの順序でソートされた状態でディスクに保存される](#data-is-stored-on-disk-ordered-by-primary-key-columns)ことを説明しましたが、そのため、非常に高いカーディナリティを持つカラム（UUID カラムなど）がプライマリキー、あるいは複合プライマリキーにおいて、カーディナリティの低いカラムより前に配置されると、[他のテーブル・カラムの圧縮率に悪影響を与えます](#optimal-compression-ratio-of-data-files)。

最速の取得と最適なデータ圧縮のバランスを取るための妥協案としては、複合プライマリキーを使用し、UUID を最後のキー・カラムとし、その前に一部のテーブル・カラムで良好な圧縮率を確保できるような、より低いカーディナリティのキー・カラムを配置する方法があります。

### 具体的な例 {#a-concrete-example}

具体的な例として、Alexey Milovidov が開発し[ブログで紹介している](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)プレーンテキストのペーストサービス [https://pastila.nl](https://pastila.nl) があります。

テキストエリアの内容が変更されるたびに、そのデータは自動的に ClickHouse のテーブルの行として保存されます（変更 1 回につき 1 行）。

貼り付けられたコンテンツ（の特定バージョン）を識別して取得する 1 つの方法は、そのコンテンツのハッシュ値を、そのコンテンツを含むテーブル行の UUID として使用することです。

次の図は、

- コンテンツが変化したとき（たとえばテキストエリアに文字をタイプするキーストロークによって）に行が挿入される順序と、
- `PRIMARY KEY (hash)` が使われたときに、挿入された行のデータがディスク上に並ぶ順序を示しています。

<Image img={sparsePrimaryIndexes15a} size="md" alt="Sparse Primary Indices 15a" background="white"/>

`hash` カラムが主キーのカラムとして使われているため、

- 特定の行を[非常に高速に](#the-primary-index-is-used-for-selecting-granules)取得できますが、
- テーブルの行（のカラムデータ）は（ユニークでランダムな）ハッシュ値で昇順にディスク上へ並べられます。そのため、content カラムの値もランダムな順序でデータ局所性がない状態で保存され、その結果として **content カラムのデータファイルの圧縮率が最適とは言えない** 状態になります。

特定の行を高速に取得できることを維持しつつ content カラムの圧縮率を大幅に向上させるために、pastila.nl では特定の行を識別するために 2 つのハッシュ（および複合主キー）を使用しています。

- 先ほど説明したように、異なるデータに対して異なる値となるコンテンツのハッシュと、
- データがわずかに変化しても **変化しない** [局所性敏感ハッシュ（fingerprint）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)。

次の図は、

- コンテンツが変化したとき（たとえばテキストエリアに文字をタイプするキーストロークによって）に行が挿入される順序と、
- 複合 `PRIMARY KEY (fingerprint, hash)` が使われたときに、挿入された行のデータがディスク上に並ぶ順序を示しています。

<Image img={sparsePrimaryIndexes15b} size="md" alt="Sparse Primary Indices 15b" background="white"/>

これでディスク上の行はまず `fingerprint` によって並べられ、同じ fingerprint 値を持つ行の中では、その `hash` 値によって最終的な順序が決まります。

わずかな差しかないデータは同じ fingerprint 値を持つため、類似したデータが content カラム内でディスク上の近い位置に保存されるようになりました。これは content カラムの圧縮率にとって非常に有利であり、一般に圧縮アルゴリズムはデータ局所性（データが似ていればいるほど圧縮率が向上する）から恩恵を受けるためです。

その代償として、複合 `PRIMARY KEY (fingerprint, hash)` によって得られるプライマリインデックスを最適に活用して特定の行を取得するには、2 つのフィールド（`fingerprint` と `hash`）を指定する必要があります。