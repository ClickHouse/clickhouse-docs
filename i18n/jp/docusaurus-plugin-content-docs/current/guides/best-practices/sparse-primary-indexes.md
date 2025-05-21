---
sidebar_label: '主キーインデックス'
sidebar_position: 1
description: 'このガイドでは、ClickHouseのインデックスについて深く掘り下げます。'
title: 'ClickHouseにおける主キーインデックスの実践的な紹介'
slug: /guides/best-practices/sparse-primary-indexes
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

# ClickHouseにおける主キーインデックスの実践的な紹介
## はじめに {#introduction}

このガイドでは、ClickHouseのインデックスについて深く掘り下げます。次の内容を詳しく説明します。
- [ClickHouseのインデックスが従来のリレーショナルデータベース管理システムとどのように異なるか](#an-index-design-for-massive-data-scales)
- [ClickHouseがテーブルのスパース主キーをどのように構築し、使用しているか](#a-table-with-a-primary-key)
- [ClickHouseにおけるインデックスのベストプラクティス](#using-multiple-primary-indexes)

このガイドで示されるすべてのClickHouse SQL文とクエリを、自分のマシンで実行することができます。
ClickHouseのインストールおよび始め方の手順については、[クイックスタート](/quick-start.mdx)を参照してください。

:::note
このガイドは、ClickHouseのスパース主キーインデックスに焦点を当てています。

ClickHouseの[セカンダリデータスキッピングインデックス](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)については、[チュートリアル](/guides/best-practices/skipping-indexes.md)をご覧ください。
:::
### データセット {#data-set}

このガイドでは、サンプルの匿名化されたWebトラフィックデータセットを使用します。

- サンプルデータセットから887万行（イベント）のサブセットを使用します。
- 解凍後のデータサイズは887万イベントで約700MBです。ClickHouseに保存すると200MBに圧縮されます。
- サブセット内の各行には、特定の時間に特定のURLをクリックしたインターネットユーザーを示す3つのカラムがあります（`UserID`カラム、`URL`カラム、`EventTime`カラム）。

これら3つのカラムを使用して、以下のような典型的なWeb分析クエリを作成できます。

- 「特定のユーザーが最もクリックした上位10件のURLは何ですか？」
- 「特定のURLを最も頻繁にクリックした上位10人のユーザーは誰ですか？」
- 「特定のURLをユーザーがクリックする最も人気のある時間帯（例：曜日）はいつですか？」
### テストマシン {#test-machine}

このドキュメントで示されるすべての実行時数値は、Apple M1 Proチップと16GBのRAMを搭載したMacBook ProでClickHouse 22.2.1をローカルで実行した場合に基づいています。
### 完全テーブルスキャン {#a-full-table-scan}

プライマリーキーなしでデータセットに対してクエリを実行する方法を見るために、以下のSQL DDL文を実行してテーブル（MergeTreeテーブルエンジンを使用）を作成します。

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

次に、次のSQL挿入文を使用して、テーブルにヒットデータセットのサブセットを挿入します。
これは、[URLテーブル関数](/sql-reference/table-functions/url.md)を使用して、clickhouse.comでホストされている完全なデータセットのサブセットをロードします。

```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
応答は次のとおりです。
```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```

ClickHouseクライアントの結果出力は、上記のステートメントがテーブルに887万行を挿入したことを示しています。

最後に、このガイドでの後の議論を簡素化し、図や結果を再現可能にするために、テーブルを[最適化](/sql-reference/statements/optimize.md)します。FINALキーワードを使用します。

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
一般に、データをロードした後、テーブルをすぐに最適化する必要はなく、推奨もされません。なぜこれがこの例で必要かは後で明らかになります。
:::

次に、最初のWeb分析クエリを実行します。以下は、UserIDが749927693のインターネットユーザーにとって最もクリックされた上位10件のURLを計算します。

```sql
SELECT URL, count(URL) as Count
FROM hits_NoPrimaryKey
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```
応答は次のとおりです。
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

ClickHouseクライアントの結果出力は、ClickHouseが完全なテーブルスキャンを実行したことを示しています！私たちのテーブルの887万行の各行がClickHouseにストリーミングされました。これはスケールしません。

これを（もっと）効率的にし、（はるかに）速くするためには、適切な主キーを持つテーブルを使用する必要があります。これにより、ClickHouseは自動的に（主キーのカラムに基づいて）スパース主キーインデックスを作成し、次に例のクエリの実行を大幅に加速します。
### 関連コンテンツ {#related-content}
- ブログ: [ClickHouseのクエリをスーパー充電する](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## ClickHouseインデックス設計 {#clickhouse-index-design}
### 大規模データスケールのためのインデックス設計 {#an-index-design-for-massive-data-scales}

従来のリレーショナルデータベース管理システムでは、主インデックスはテーブルの各行に1エントリを含みます。これにより、主インデックスには887万エントリが含まれます。このようなインデックスは特定の行を迅速に見つけることを可能にし、ルックアップクエリやポイント更新に高い効率をもたらします。`B(+)-Tree`データ構造内のエントリを検索する場合の平均時間計算量は`O(log n)`です；より正確には、`log_b n = log_2 n / log_2 b`であり、ここで`b`は`B(+)-Tree`の分岐因子、`n`はインデックスされた行の数です。`b`は通常数百から数千の間であり、`B(+)-Trees`は非常に浅い構造で、レコードを見つけるために必要なディスクシークは少数です。887万行で分岐因子が1000の場合、平均で約2.3回のディスクシークが必要です。この機能にはコストが伴います：追加のディスクとメモリのオーバーヘッド、新しい行をテーブルに追加しインデックスにエントリを追加する際の挿入コストの増加、そして時にはB-Treeの再バランスです。

B-Treeインデックスに関連する課題を考慮すると、ClickHouseのテーブルエンジンは異なるアプローチを利用します。ClickHouseの[MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family/index.md)は、大量のデータを処理するように設計および最適化されています。これらのテーブルは、毎秒何百万もの行を挿入し、非常に大きな（ペタバイト単位の）データをストレージします。データはテーブルを[パーツごとに](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)迅速に書き込まれ、バックグラウンドでマージに関するルールが適用されます。ClickHouseでは各パートが独自の主キーインデックスを持っています。パーツがマージされると、マージされたパートの主インデックスもマージされます。ClickHouseが設計された非常に大規模なスケールにおいて、ディスクとメモリの効率が非常に重要です。したがって、すべての行をインデックス付けするのではなく、パートの主インデックスでは、行のグループ（『グラニュール』と呼ばれる）ごとに1インデックスエントリ（『マーク』として知られる）を持っています。この技術は**スパースインデックス**と呼ばれます。

スパースインデックスが可能なのは、ClickHouseがディスク上でパートの行を主キーのカラム順に格納しているからです。単一の行を直接見つけるのではなく（B-Treeベースのインデックスのように）、スパース主インデックスにより、高速に（インデックスエントリを介しての二分探索を通じて）クエリに一致する可能性のある行のグループを特定することができます。見つかった一致する可能性のある行のグループ（グラニュール）は、並行してClickHouseエンジンにストリーミングされ、一致項目を特定します。このインデックス設計により、主インデックスは小さく（完全にメインメモリに収まる必要がある）、かつクエリ実行時間を大幅に改善します：特にデータ分析の用途に典型的な範囲クエリにおいてです。

以下に、ClickHouseがどのようにスパース主インデックスを作成し、利用しているかを詳細に示します。記事の後半では、インデックスを構築するために使用されるテーブルカラム（主キーのカラム）を選択、削除、順序付けするためのいくつかのベストプラクティスについて説明します。
### 主キーを持つテーブル {#a-table-with-a-primary-key}

UserIDとURLのカラムを持つ複合主キーを持つテーブルを作成します。

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
SETTINGS index_granularity = 8192, index_granularity_bytes = 0, compress_primary_key = 0;
```

[//]: # (<details open>)
<details>
    <summary>
    DDLステートメントの詳細
    </summary>
    <p>

このガイドでの後の議論を簡素化し、図や結果を再現可能にするために、DDL文は次の要素を指定します：

<ul>
  <li>
    <code>ORDER BY</code>句を使用してテーブルの複合ソートキーを指定します。
  </li>
  <li>
    主インデックスが持つエントリの数を次の設定を通じて明示的に制御します：
    <ul>
      <li>
        <code>index_granularity</code>: デフォルト値8192に明示的に設定されます。これは、8192行ごとに主インデックスに1エントリが存在することを意味します。たとえば、テーブルに16384行が含まれている場合、インデックスには2つのエントリがあります。
      </li>
      <li>
        <code>index_granularity_bytes</code>: <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">適応インデックスグラニュラリティ</a>を無効にするために0に設定されます。適応インデックスグラニュラリティとは、ClickHouseが自動的にn行のグループごとに1エントリを作成することを意味し、次のいずれかが真である場合です：
        <ul>
          <li>
            <code>n</code>が8192未満で、その<code>n</code>行の結合行データのサイズが10 MB以上の場合（<code>index_granularity_bytes</code>のデフォルト値）。
          </li>
          <li>
            結合行データサイズが<code>n</code>行のサイズが10 MB未満であるが、<code>n</code>が8192である場合。
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">主インデックスの圧縮</a>を無効にするために0に設定されます。これにより、私たちは後でその内容をオプションで検査できます。
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

DDL文内での主キーにより、指定された2つのキーのカラムに基づいて主インデックスが作成されます。

<br/>
次に、データを挿入します。

```sql
INSERT INTO hits_UserID_URL SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
応答は次のとおりです。
```response
0 rows in set. Elapsed: 149.432 sec. Processed 8.87 million rows, 18.40 GB (59.38 thousand rows/s., 123.16 MB/s.)
```

<br/>
そしてテーブルを最適化します：

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br/>
次のクエリを使用して、テーブルのメタデータを取得できます。

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

応答は次のとおりです。

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

ClickHouseクライアントの出力は次のことを示しています：

- テーブルのデータはディスク上に[ワイドフォーマット](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)で特定のディレクトリに保存されいており、これはそのディレクトリ内に各テーブルカラムごとに1つのデータファイル（および1つのマークファイル）があることを意味します。
- テーブルには887万行があります。
- すべての行の解凍後のデータサイズは733.28MBです。
- ディスク上に保存されたすべての行の圧縮サイズは206.94MBです。
- テーブルには1083のエントリ（『マーク』と呼ばれる）の主インデックスがあり、インデックスのサイズは96.93KBです。
- 合計で、テーブルのデータ、マークファイルおよび主インデックスファイルはすべて合わせて207.07MBのディスクを占めています。
### データは主キーのカラム順にディスクに保存される {#data-is-stored-on-disk-ordered-by-primary-key-columns}

上記で作成したテーブルには
- 複合[主キー](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)`と
- 複合[ソートキー](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`があります。

:::note
- もしソートキーのみを指定していた場合、主キーは暗黙的にソートキーと等しいものとして定義されます。

- メモリ効率を考慮して、明示的に主キーを指定し、クエリでフィルタリングされるカラムのみを含めました。主キーに基づく主インデックスは完全にメインメモリにロードされます。

- ガイドの図や圧縮比率を最大化するために、テーブルのすべてのカラムを含む別のソートキーを定義しました（カラム内の類似データが近くに配置されると、たとえばソートによって、そのデータはより効果的に圧縮されます）。

- 主キーは、両方が指定されている場合、ソートキーのプレフィックスである必要があります。
:::

挿入された行は、主キーのカラム（およびソートキーの付加的な `EventTime` カラム）によってディスク上に辞書式順序（昇順）で保存されます。

:::note
ClickHouseは、同じ主キーのカラムの値を持つ複数の行を挿入することを許可します。この場合（以下の図の行1および行2を参照）、最終的な順序は指定されたソートキーによって決まり、そのため`EventTime`カラムの値によって決まります。
:::


ClickHouseは<a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">列指向のデータベース管理システム</a>です。以下の図に示すように
- ディスク上の表現のために、各テーブルカラムのすべての値が<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a>形式で格納されている単一のデータファイル（*.bin）が存在し、
- 887万行は主キーのカラム（および追加のソートキーのカラム）の辞書順昇順でディスクに保存されます。つまり、このケースでは
  - まず`UserID`で、
  - 次に`URL`で、
  - 最後に`EventTime`で：

<Image img={sparsePrimaryIndexes01} size="md" alt="Sparse Primary Indices 01" background="white"/>

`UserID.bin`、`URL.bin`、および`EventTime.bin`は、ディスク上に`UserID`、`URL`、および`EventTime`カラムの値が格納されているデータファイルです。

:::note
- 主キーはディスク上の行の辞書順序を定義するため、テーブルは1つの主キーしか持てません。

- 行は0から番号が付けられ、ClickHouse内部の行番号付けスキームと整合性を持たせ、ログメッセージでも使用されます。
:::
### データはグラニュールに整理され、並行データ処理を行う {#data-is-organized-into-granules-for-parallel-data-processing}

データ処理の目的で、テーブルのカラム値は論理的にグラニュールに分割されます。
グラニュールは、ClickHouseにストリーミングされるデータ処理用の最小限の不可分のデータセットです。
つまり、Individual rowsは読み取るのではなく、ClickHouseは常に（ストリーミング方式で、かつ並行して）行のグループ（グラニュール）全体を読み取ります。
:::note
カラムの値はグラニュール内に物理的に保存されるわけではありません：グラニュールはクエリ処理のためのカラム値の論理的な組織に過ぎません。
:::

以下の図は、テーブルのDDL文に`index_granularity`（デフォルト値の8192に設定）を含んでいる結果、887万行の（カラム値の）グラニュールが1083に整理されている様子を示しています。

<Image img={sparsePrimaryIndexes02} size="md" alt="Sparse Primary Indices 02" background="white"/>

物理的なディスク上の順序に基づいて最初の8192行（カラム値）は論理的にグラニュール0に属し、次の8192行（カラム値）はグラニュール1に属する、というように続きます。

:::note
- 最後のグラニュール（グラニュール1082）は8192行未満の行を「含む」ことになります。

- 本ガイドの初めで、「DDLステートメントの詳細」というセクションで、[適応インデックスグラニュラリティ](/whats-new/changelog/2019.md/#experimental-features-1)を無効にすることを紹介しました（本ガイドの議論を簡素化し、図や結果を再現可能にするためです）。したがって、例のテーブルのすべてのグラニュール（最後のものを除く）のサイズは同じです。

- 適応インデックスグラニュラリティ（デフォルトでは[適応グラニュラリティが有効](/operations/settings/merge-tree-settings#index_granularity_bytes)）のテーブルでは、行データサイズに応じて、いくつかのグラニュールのサイズが8192行未満になる可能性があります。

- 私たちは、主キーのカラム（`UserID`、`URL`）の一部のカラム値をオレンジでマーキングしました。これらのオレンジマーク付きのカラム値は、各グラニュールの最初の行に関する主キーのカラム値になります。以下に示すように、これらのオレンジマークのカラム値はテーブルの主インデックスのエントリになります。

- グラニュールは0から番号が付けられ、ClickHouse内部の番号付けスキームと整合性を持たせ、ログメッセージでも使用されます。
:::

### 主キーインデックスは各グラニュールごとに1つのエントリを持つ {#the-primary-index-has-one-entry-per-granule}

主キーインデックスは、上の図に示されているグラニュールに基づいて作成されます。このインデックスは圧縮されていないフラットな配列ファイル（primary.idx）であり、0から始まるいわゆる数値インデックスマークを含みます。

以下の図は、インデックスが各グラニュールの最初の行に対する主キー列の値（上の図でオレンジ色にマークされた値）を格納していることを示しています。
言い換えれば：主キーインデックスは、テーブルの各8192行の主キー列の値を格納します（主キー列によって定義された物理行順に基づきます）。
例えば
- 最初のインデックスエントリ（以下の図の「マーク0」）は上の図のグラニュール0の最初の行のキー列の値を格納しています。
- 2番目のインデックスエントリ（以下の図の「マーク1」）は上の図のグラニュール1の最初の行のキー列の値を格納しています。その後続きます。

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Sparse Primary Indices 03a" background="white"/>

合計で、8.87百万行と1083個のグラニュールを持つテーブルに対して、インデックスは1083エントリを持ちます：

<Image img={sparsePrimaryIndexes03b} size="md" alt="Sparse Primary Indices 03b" background="white"/>

:::note
- [適応インデックス粒度](/whats-new/changelog/2019.md/#experimental-features-1)を持つテーブルでは、主キーインデックスに最後のテーブル行の主キー列の値を記録した「最終」追加マークも格納されますが、私たちは適応インデックス粒度を無効にしました（このガイドでの議論を簡素化するためと、図や結果を再現可能にするため）、そのため私たちの例のテーブルのインデックスにはこの最終マークは含まれていません。

- 主キーインデックスファイルは完全に主メモリに読み込まれます。ファイルが利用可能なメモリスペースより大きい場合、ClickHouseはエラーを発生させます。
:::

<details>
    <summary>
    主キーインデックスの内容を検査する
    </summary>
    <p>

セルフマネージドのClickHouseクラスターでは、私たちの例のテーブルの主キーインデックスの内容を検査するために、<a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">fileテーブル関数</a>を使用できます。

そのためには、まず主キーインデックスファイルを稼働中のクラスターのノードの<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a>にコピーする必要があります：
<ul>
<li>ステップ1：主キーインデックスファイルを含むパートのパスを取得します。</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

は、テストマシンで`/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`を返します。

<li>ステップ2：user_files_pathを取得します。</li>
Linuxの<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">デフォルトuser_files_path</a>は
`/var/lib/clickhouse/user_files/`

であり、Linuxでそれが変更されたかどうかを確認できます：`$ grep user_files_path /etc/clickhouse-server/config.xml`

テストマシンでは、パスは`/Users/tomschreiber/Clickhouse/user_files/`です。


<li>ステップ3：主キーインデックスファイルをuser_files_pathにコピーします。</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

</ul>

<br/>
これで、SQLを介して主キーインデックスの内容を検査できます：
<ul>
<li>エントリ数を取得します。</li>
`
SELECT count( )<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String');
`
は`1083`を返します。

<li>最初の2つのインデックスマークを取得します。</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 0, 2;
`

は次のように返します：

`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`

<li>最後のインデックスマークを取得します。</li>
`
SELECT UserID, URL FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
は次のように返します：
`
4292714039 │ http://sosyal-mansetleri...
`
</ul>
<br/>
これは私たちの例のテーブルに対する主キーインデックスの内容の図に正確に一致します。

</p>
</details>

主キーエントリはインデックスマークと呼ばれます。なぜならば、各インデックスエントリが特定のデータ範囲の開始を示すからです。具体的には、例のテーブルに対して：
- UserIDインデックスマーク：

  主キーインデックスに格納されている`UserID`値は昇順にソートされています。<br/>
  上の図の「マーク1」は、したがって、グラニュール1のすべてのテーブル行の`UserID`値が4,073,710以上であることを保証します。

 [後で見るように](#the-primary-index-is-used-for-selecting-granules)、このグローバルな順序により、ClickHouseは<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">インデックスマークに対してバイナリサーチアルゴリズム</a>を使用でき、クエリが主キーの最初のカラムでフィルタリングしている場合に機能します。

- URLインデックスマーク：

  主キー列`UserID`と`URL`の類似したカーディナリティは、一般的に最初のカラム以降のすべてのキー列のインデックスマークは、前任者のキー列値が少なくとも現在のグラニュール内で同じである限り、データ範囲を示すことができることを意味します。<br/>
  例えば、上の図でマーク0とマーク1の`UserID`値が異なるため、ClickHouseはグラニュール0のすべてのテーブル行のすべてのURL値が`'http://showtopics.html%3...'`以上であるとは想定できません。しかし、もし上の図でマーク0とマーク1の`UserID`値が同じであれば（つまり、`UserID`値がグラニュール0内のすべてのテーブル行で同じである場合）、ClickHouseはグラニュール0のすべてのテーブル行のすべてのURL値が`'http://showtopics.html%3...'`以上であることを仮定できました。

  このことがクエリ実行パフォーマンスに与える影響について、後で詳細に説明します。
### 主キーインデックスはグラニュールを選択するために使用されます {#the-primary-index-is-used-for-selecting-granules}

これで、主キーインデックスのサポートを受けながらクエリを実行できます。

次のクエリは、UserID 749927693の最もクリックされたURL上位10件を計算します。

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

応答は次のようになります：

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

10件の行がセットされました。経過時間：0.005秒。

# highlight-next-line
8.19千行が処理されました、
740.18 KB (1.53百万行/秒、138.59 MB/秒)。
```

ClickHouseクライアントの出力は、フルテーブルスキャンを実行する代わりに、8.19千行だけがClickHouseにストリーミングされたことを示しています。

<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">トレースロギング</a>が有効になっている場合、ClickHouseサーバーログファイルは、ClickHouseが`749927693`の`UserID`列値を持つ行を含む可能性のあるグラニュールを特定するために、1083のUserIDインデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">バイナリサーチ</a>を実行していたことを示します。このレポートには、平均的な時間の複雑さ`O(log2 n)`を要します：
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
...Reading ...約 8192行が1,441,792行目から開始します
```

上のトレースログから、1083の既存マークのうちの1つがクエリを満たしていることがわかります。

<details>
    <summary>
    トレースログ詳細
    </summary>
    <p>

マーク176が特定されました（'found left boundary mark'は含まれ、'found right boundary mark'は排他的です），したがって、グラニュール176からのすべての8192行（これは1,441,792行目から開始されます。後でこのガイドで見ます）がClickHouseにストリーミングされます。
</p>
</details>

私たちはこのことを、例のクエリで<a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN句</a>を使用することによって再現できます。
```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

応答は次のようになります：

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

16件の行がセットされました。経過時間：0.003秒。
```
クライアント出力は、1083のグラニュールのうちの1つが749927693というUserID列の値を含む行を保持している可能性があることを示しています。

:::note 結論
クエリが複合キーの一部であるカラムでフィルタリングしている場合、そしてそれが最初のキーコラムである場合、ClickHouseはキーコラムのインデックスマークに対してバイナリサーチアルゴリズムを実行しています。
:::

<br/>

上で論じたように、ClickHouseは、そのスパース主インデックスを使用して、クエリに一致する行を含む可能性のあるグラニュールを迅速に（バイナリサーチを介して）選択します。

これはClickHouseクエリ実行の**第一段階（グラニュール選択）**です。

**第二段階（データ読み込み）**では、ClickHouseは選択されたグラニュールを特定し、それらのすべての行をClickHouseエンジンにストリーミングして、実際にクエリに一致する行を見つけます。

私たちはこの第二段階について、次のセクションで詳しく論じます。
### マークファイルはグラニュールを特定するために使用されます {#mark-files-are-used-for-locating-granules}

以下の図は、私たちのテーブルの主インデックスファイルの一部を示しています。

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white"/>

上で論じたように、インデックスの1083のUserIDマークに対してバイナリサーチを行った結果、マーク176が特定されました。そのため、対応するグラニュール176は749,927,693というUserID列値を持つ行を含む可能性があります。

<details>
    <summary>
    グラニュール選択の詳細
    </summary>
    <p>

上の図は、マーク176が関係しているグラニュール176の最小UserID値が749,927,693より小さく、次のマーク（マーク177）の最小UserID値がこの値より大きい最初のインデックスエントリであることを示しています。したがって、マーク176に対応するグラニュール176だけが749,927,693というUserID列値を持つ行を含んでいる可能性があります。
</p>
</details>

グラニュール176に行が749,927,693というUserID列値を含むかどうかを確認するためには、既にストリーミングされているこのグラニュールに属するすべての8192行をClickHouseにストリーミングする必要があります。

これを実現するために、ClickHouseはグラニュール176の物理的位置を知る必要があります。

ClickHouseでは、テーブルのすべてのグラニュールの物理的な場所はマークファイルに保存されています。データファイルと同様に、テーブルの各カラムに対して1つのマークファイルがあります。

以下の図は、テーブルの`UserID`、`URL`、および`EventTime`カラムのグラニュールの物理的位置を保存する3つのマークファイル`UserID.mrk`、`URL.mrk`、`EventTime.mrk`を示しています。

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white"/>

私たちは、主インデックスが圧縮されていないフラットな配列ファイル（primary.idx）であり、0から始まるインデックスマークが含まれていることを議論しました。

同様に、マークファイルも圧縮されていないフラットな配列ファイル（*.mrk）であり、0から始まるマークが含まれています。

ClickHouseが、クエリに一致する行を含む可能性のあるグラニュールのインデックスマークを特定して選択した後、マークファイルにおける位置配列のルックアップを行うことで、グラニュールの物理的位置を取得できます。

特定のカラムの各マークファイルエントリは、オフセットの形で2つの位置を保存しています：

- 最初のオフセット（上の図の'block_offset'）は、選択されたグラニュールの圧縮バージョンを含む<a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">ブロック</a>を<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮された</a>カラムデータファイル内に位置付けます。この圧縮されたブロックには、いくつかの圧縮されたグラニュールが含まれている可能性があります。位置付けられた圧縮ファイルブロックは、読み込み時に主メモリに展開されます。

- マークファイルからの2番目のオフセット（上の図の'granule_offset'）は、展開されたブロックデータ内のグラニュールの場所を提供します。

その後、位置付けられた圧縮グラニュールに属するすべての8192行がClickHouseにストリーミングされ、さらに処理されます。

:::note

- [ワイドフォーマット](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)を持ち、[適応インデックス粒度](/whats-new/changelog/2019.md/#experimental-features-1)を持たないテーブルに対して、ClickHouseは上で視覚化された`.mrk`マークファイルを使用します。これらのエントリは、各エントリごとに2つの8バイト長のアドレスを含んでいます。これらのエントリは、すべて同じサイズのグラニュールの物理的な場所です。

インデックス粒度は[デフォルトで適応的](/operations/settings/merge-tree-settings#index_granularity_bytes)ですが、私たちの例のテーブルでは、（このガイド内での議論を簡素化し、図や結果を再現可能にするために）適応インデックス粒度を無効にしました。私たちのテーブルはデータのサイズが[最小のワイドパートのバイト数](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)（デフォルトでセルフマネージドクラスタ用の10MB）を超えるため、ワイドフォーマットを使用しています。

- ワイドフォーマットを持ち、適応インデックス粒度を持つテーブルに対して、ClickHouseは`.mrk2`マークファイルを使用します。これには、現在のエントリに関連付けられているグラニュールの行数が追加された三つ目の値を含むエントリが含まれます。

- [コンパクトフォーマット](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)を持つテーブルに対しては、ClickHouseは`.mrk3`マークファイルを使用します。

:::

:::note マークファイルの重要性

なぜ主インデックスは、インデックスマークに対応するグラニュールの物理的な場所を直接含まないのでしょうか？

それは、ClickHouseが設計されている非常に大きなスケールでは、ディスクとメモリの効率が非常に重要だからです。

主インデックスファイルは主メモリに収まる必要があります。

私たちの例のクエリに対して、ClickHouseは主インデックスを使用し、クエリに一致する行が含まれる可能性のある単一のグラニュールを選択しました。その唯一のグラニュールに対してのみ、ClickHouseは関連する行をストリーミングするための物理的な場所が必要になります。

さらに、オフセット情報は、クエリに使用されていないカラム（例：`EventTime`）には必要ありません。

私たちのサンプルクエリに対して、ClickHouseはUserIDデータファイル（UserID.bin）内のグラニュール176の物理的位置オフセット2つとURLデータファイル（URL.bin）内のグラニュール176の物理的位置オフセット2つのみが必要です。

マークファイルによって提供される間接性は、主インデックス内に1083個のグラニュールのすべての物理的な場所のエントリを直接保存することを回避し、不必要（潜在的に未使用）のデータが主メモリ内に存在することを回避します。
:::

以下の図と本文は、私たちの例のクエリに対してClickHouseがUserID.binデータファイル内のグラニュール176をどのように位置付けるかを示しています。

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

このガイドの前の部分で、ClickHouseは主インデックスマーク176を選び、それによってグラニュール176がクエリに一致する行を含む可能性があることが説明されています。

ClickHouseは現在、インデックスからの選択されたマーク番号（176）を使用して、UserID.mrkマークファイルにおける位置配列のルックアップを行い、グラニュール176を位置付けるための2つのオフセットを取得します。

示されているように、最初のオフセットは、UserID.binデータファイル内で、グラニュール176の圧縮バージョンを含む圧縮ファイルブロックを位置付けます。

位置付けられたファイルブロックが主メモリ内に展開された後、マークファイルからの2番目のオフセットを使用して、展開されたデータ内のグラニュール176を位置付けることができます。

ClickHouseは、私たちの例のクエリ（UserID 749,927,693を持つインターネットユーザーの最もクリックされたURL上位10件）を実行するために、UserID.binデータファイルおよびURL.binデータファイルから両方のグラニュール176を位置付ける必要があります。

上の図は、ClickHouseがUserID.binデータファイルのグラニュールを位置付ける様子を示しています。

並行して、ClickHouseはURL.binデータファイルのグラニュール176のために同じことを行います。2つのそれぞれのグラニュールが整列され、ClickHouseエンジンにストリーミングされ、最終的にUserIDが749,927,693であるすべての行についてURL値をグループごとに集約および計算し、最終的にカウント順に上位10のURLグループを出力します。
## 複数の主インデックスを使用する {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### セカンダリーキー列は（効率的ではない可能性があります） {#secondary-key-columns-can-not-be-inefficient}

クエリが複合キーの一部であるカラムでフィルタリングしており、それが最初のキーコラムである場合、[ClickHouseはキーコラムのインデックスマークに対してバイナリサーチアルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

しかし、クエリが複合キーの一部であるカラムでフィルタリングしており、それが最初のキーコラムでない場合はどうなるでしょうか？

:::note
クエリが最初のキーコラムでないセカンダリーキーコラムでフィルタリングされていないシナリオを議論します。

クエリが最初のキーコラムとその後のキーコラムでフィルタリングしている場合、ClickHouseは最初のキーコラムのインデックスマークに対してバイナリサーチを実行します。
:::

<br/>
<br/>

<a name="query-on-url"></a>
URL "http://public_search" を最も頻繁にクリックしたユーザー上位10件を計算するクエリを使用します：

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

応答は次のようになります： <a name="query-on-url-slow"></a>
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

10件の行がセットされました。経過時間：0.086秒。

# highlight-next-line
8.81百万行が処理されました、
799.69 MB (102.11百万行/秒、9.27 GB/秒)。
```

クライアントの出力は、ClickHouseがURLカラムが複合主キーの一部であっても、ほぼフルテーブルスキャンを実行したことを示します！ClickHouseは878万行のテーブルから880万行を読み取ります。

もし[trace_logging](/operations/server-configuration-parameters/settings#logger)が有効になっている場合、ClickHouseサーバーログファイルは、ClickHouseが1083のURLインデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">一般的な除外検索</a>を使用して、「http://public_search」 URLカラム値を持つ可能性のある行を含むグラニュールを特定したことを示します：
```response
...Executor): Key condition: (column 1 in ['http://public_search',
                                           'http://public_search'])

# highlight-next-line
...Executor): Used generic exclusion search over index for part all_1_9_2
              with 1537 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,

# highlight-next-line
              1076/1083 marks by primary key, 1076マークが5範囲から読み込まれます
...Executor): Reading approx. 8814592行が10ストリームで
```
上のサンプルトレースログから、マークを介して選択された1083のうち1076のグラニュールが、"http://public_search"と一致するURL値を持つ行を含む可能性があることがわかります。

これにより、ClickHouseエンジンにストリーミングされる8.81百万行の中には、実際に一致するURL値を持つ行が含まれています（10ストリームを使用して並列で）。
とはいえ、後で説明しますが、選択された1076のグラニュールのうち、実際に一致する行を含むのは39のグラニュールだけです。

複合主キー（UserID、URL）に基づく主インデックスは、特定のUserID値を持つ行のフィルタリングには非常に役立つものの、特定のURL値を持つ行のフィルタリングにはほとんど助けになりません。

その理由は、URLカラムが最初のキーコラムではないため、ClickHouseはURLカラムのインデックスマークに対して一般的な除外検索アルゴリズム（バイナリサーチではなく）を使用しており、**このアルゴリズムの効果は**URLカラムとその前任者キーコラムのUserIDとの間のカーディナリティの違いに依存しています。

これを示すために、一般的な除外検索がどのように機能するかに関する詳細を示します。

<a name="generic-exclusion-search-algorithm"></a>
### 一般的な除外検索アルゴリズム {#generic-exclusion-search-algorithm}

以下は、低いまたは高いカーディナリティを持つ前任者キーコラムに基づいて、<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank">ClickHouseの一般的な除外検索アルゴリズム</a>がどのように機能するかを示しています。

両方のケースの例として、次のように想定します：
- URL値 = "W3" を持つ行を検索するクエリ。
- UserIDとURLの簡略化された値を持つ抽象的なヒットテーブル。
- 同じ複合主キー（UserID、URL）によるインデックス。これは、行がUserID値で最初に順序付けられ、同じUserID値を持つ行は次にURLで順序付けられることを意味します。
- グラニュールサイズは2、つまり各グラニュールには2行が含まれます。

以下の図で、各グラニュールの最初のテーブル行のキーコラム値がオレンジ色でマークされています。

**前任者キーコラムが低い（または高い）カーディナリティを持つ場合**<a name="generic-exclusion-search-fast"></a>

UserIDが低いカーディナリティを持つと仮定します。この場合、同じUserID値が複数のテーブル行やグラニュールに分散される可能性が高く、したがってインデックスマークに分散します。同じUserIDを持つインデックスマークに対しては、インデックスマークのURL値は昇順にソートされます（グラニュール内の全行は、最初にUserIDで順序付けされ、次にURLで順序付けされるため）。これにより、効率的なフィルタリングが可能になります。

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

上の図に示される抽象的なサンプルデータに対するグラニュール選択プロセスには、次の3つのシナリオがあります：

1. インデックスマーク0は、**URL値がW3より小さく、直接続くインデックスマークのURL値もW3より小さい**ため、マーク0および1が同じUserID値を持っているため除外できます。この除外事前条件により、グラニュール0がU1のUserID値で完全に構成されていることが保証され、ClickHouseはグラニュール0のURL値の最大値もW3より小さいと仮定して除外することができます。

2. インデックスマーク1は、**URL値がW3以下で、直接続くインデックスマークのURL値がW3以上である**ため、選択されます。これは、グラニュール1がURL W3を含む行を持つ可能性があることを意味します。

3. インデックスマーク2および3は、**URL値がW3より大きいため**除外されます。主インデックスのインデックスマークは、各グラニュールの最初のテーブル行のキーコラム値を保存するため、ディスク上のテーブル行はキーコラム値によって順序付けられているため、グラニュール2および3はURL値W3を含むことができません。

**前任者キーコラムが高い（または低い）カーディナリティを持つ場合**<a name="generic-exclusion-search-slow"></a>

UserIDが高いカーディナリティを持つ場合、同じUserID 값が複数のテーブル行やグラニュールに広がる可能性が低くなります。これは、インデックスマークのURL値が単調増加しないことを意味します：

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

上の図が示すように、W3より小さいすべてのマークは、関連するグラニュールの行をClickHouseエンジンにストリーミングするために選択されます。

これは、すべてのインデックスマークが、上記で説明したシナリオ1に該当するにも関わらず、*直接続くインデックスマークが現在のマークと同じUserID値を持つ*という条件を満たさないためです。したがって、除外することはできません。

例えば、URL値がW3より小さいインデックスマーク0の場合、**直接続くインデックスマークのURL値もW3より小さい**ため、このマーク0は除外できず、直接続くインデックスマーク1は*このマーク0と同じUserID値を持たない*ためです。

これにより、ClickHouseはグラニュール0のURL値W3を含む可能性がある行を持つと推測することを余儀なくされ、マーク0を選択する必要があります。

同様の状況がマーク1、2、および3にも当てはまります。

:::note 結論
ClickHouseが、複合キーの一部であるカラムのフィルタリングにおいて、バイナリ検索アルゴリズムではなく、<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">一般的な除外検索アルゴリズム</a>を使用している理由は、前任者キーコラムが低いカーディナリティを持っている場合に最も効果的です。
:::

私たちのサンプルデータセットでは、両方のキーコラム（UserID、URL）が同様に高いカーディナリティを持っており、説明したように、URLカラムの前任者キーコラムのカーディナリティが高い（または同様の）場合、一般的な除外検索アルゴリズムの効果はあまり良くありません。
```

### データスキッピングインデックスに関する注意 {#note-about-data-skipping-index}

UserIDとURLの高いカーディナリティが似ているため、当社の[URLによるクエリフィルタリング](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)も、[URLカラム](./skipping-indexes.md)における[セカンダリデータスキッピングインデックス](#a-table-with-a-primary-key)を作成することからあまり利益を得ません。

例えば、次の2つのステートメントは、テーブルのURLカラムに対して[minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries)データスキッピングインデックスを作成し、データを入力します：
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
これにより、ClickHouseは4つの連続した[グラニュール](#data-is-organized-into-granules-for-parallel-data-processing)のグループごとに最小および最大のURL値を格納する追加のインデックスを作成しました（上記の`ALTER TABLE`ステートメントの`GRANULARITY 4`句に注意してください）：

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white"/>

最初のインデックスエントリ（上の図における「マーク0」）は、[当社のテーブルの最初の4つのグラニュールに属する行](#data-is-organized-into-granules-for-parallel-data-processing)の最小および最大のURL値を格納しています。

2番目のインデックスエントリ（「マーク1」）は、テーブルの次の4つのグラニュールに属する行の最小および最大のURL値を格納しています。

（ClickHouseは、インデックスマークに関連するグラニュールのグループを[場所](#mark-files-are-used-for-locating-granules)を特定するための特別な[マークファイル](#mark-files-are-used-for-locating-granules)も作成しました。）

UserIDとURLの似たような高いカーディナリティのため、このセカンダリデータスキッピングインデックスは、[URLによるクエリフィルタリング](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)が実行されるときに、選択されるグラニュールを除外するのに役立ちません。

クエリが探している特定のURL値（すなわち「http://public_search」）は、おそらくインデックスがグラニュールの各グループに格納した最小値と最大値の間にあり、これによりClickHouseは（行がクエリと一致する可能性があるため）グラニュールのグループを選択せざるを得ません。

### 複数の主インデックスを使用する必要性 {#a-need-to-use-multiple-primary-indexes}

その結果、特定のURLを持つ行をフィルタリングするサンプルクエリを大幅に速度アップさせたければ、そのクエリに最適化された主インデックスを使用する必要があります。

加えて、特定のUserIDを持つ行をフィルタリングするサンプルクエリの性能を維持したければ、複数の主インデックスを使用する必要があります。

以下に、それを達成するための方法を示します。

<a name="multiple-primary-indexes"></a>
### 追加の主インデックスを作成するためのオプション {#options-for-creating-additional-primary-indexes}

特定のUserIDを持つ行をフィルタリングするサンプルクエリと、特定のURLを持つ行をフィルタリングするサンプルクエリの両方を大幅に速度アップさせたい場合は、次の3つのオプションの1つを使用して複数の主インデックスを作成する必要があります：

- 異なる主キーを持つ**第2テーブル**を作成する。
- 既存のテーブルに**マテリアライズドビュー**を作成する。
- 既存のテーブルに**プロジェクション**を追加する。

これら3つのオプションはすべて、主インデックスと行のソート順を再編成するためにサンプルデータを追加のテーブルに実質的に複製します。

ただし、3つのオプションは、クエリと挿入ステートメントのルーティングに関して、ユーザーに対する追加のテーブルの透明性が異なります。

異なる主キーを持つ**第2テーブル**を作成する場合、クエリは照会に最適なテーブルバージョンに明示的に送信する必要があり、新しいデータは、テーブルを同期させるために両方のテーブルに明示的に挿入する必要があります：

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

**マテリアライズドビュー**を使用すると、追加のテーブルが暗黙的に作成され、データは自動的に両方のテーブル間で同期されます：

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

**プロジェクション**は、暗黙的に作成された（そして隠された）追加のテーブルをデータの変更で自動的に同期させるだけでなく、ClickHouseがクエリに対して最も効果的なテーブルバージョンを自動的に選択するため、最も透明なオプションです：

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

次に、これらの3つのオプションについて、実際の例を交えて詳しく説明します。

<a name="multiple-primary-indexes-via-secondary-tables"></a>
### オプション1：セカンダリーテーブル {#option-1-secondary-tables}

<a name="secondary-table"></a>
主キーのキーの順序を（オリジナルのテーブルと比較して）入れ替えた新しい追加のテーブルを作成します：

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
SETTINGS index_granularity = 8192, index_granularity_bytes = 0, compress_primary_key = 0;
```

当社の[オリジナルテーブル](#a-table-with-a-primary-key)から887万行すべてを追加のテーブルに挿入します：

```sql
INSERT INTO hits_URL_UserID
SELECT * from hits_UserID_URL;
```

応答は次のようになります：

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

最後にテーブルを最適化します：
```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

主キーのカラムの順序が入れ替わったため、挿入された行は現在、（当社の[オリジナルテーブル](#a-table-with-a-primary-key)と比較して）異なる辞書順でディスクに保存され、したがってこのテーブルの1083のグラニュールも以前とは異なる値を含んでいます：

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white"/>

これが生成された主キーです：

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white"/>

これを使用して、「http://public_search」のURLをクリックしたユーザーのトップ10を計算するためにURLカラムでフィルタリングする例のクエリの実行速度を大幅に向上させることができます：
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

応答は次のようになります：
<a name="query-on-url-fast"></a>

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

これで、[ほぼフルテーブルスキャンを行う](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns)代わりに、ClickHouseはそのクエリをより効果的に実行しました。

主インデックスが[オリジナルテーブル](#a-table-with-a-primary-key)のUserIDが最初のカラム、URLが2番目のキー列の場合、ClickHouseはそのクエリを実行するためにインデックスマークの上で[一般的な除外検索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)を使用しましたが、UserIDとURLの似たような高いカーディナリティのため、それはあまり効果的ではありませんでした。

URLが主インデックスの最初のカラムとして作成されると、ClickHouseは現在、<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">バイナリー検索</a>をインデックスマークの上で実行しています。
ClickHouseサーバーログファイルの対応するトレースログがそれを確認しています：
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
ClickHouseは、一般的な除外検索が使用されたときに1076ではなく39のインデックスマークのみを選択しました。

追加のテーブルは、現在、`UserIDs`でのクエリフィルタリングを高速化するために最適化されており、URLでのクエリフィルタリングを高速化するために最適化された二つのテーブルが存在します。

### オプション2：マテリアライズドビュー {#option-2-materialized-views}

既存のテーブルに[マテリアライズドビュー](/sql-reference/statements/create/view.md)を作成します。
```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

応答は次のようになります：

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note
- ビューの主キーにおけるキーの順序を（当社の[オリジナルテーブル](#a-table-with-a-primary-key) と比較して）入れ替えます。
- マテリアライズドビューは、指定された主キー定義に基づいて行順と主インデックスが作成された**暗黙的に作成されたテーブル**によってバックアップされます。
- この暗黙的に作成されたテーブルは、`SHOW TABLES`クエリによってリストされ、その名前は`.inner`で始まります。
- マテリアライズドビューのバックアップテーブルを最初に明示的に作成し、ビューがそのテーブルを`TO [db].[table]` [句](/sql-reference/statements/create/view.md)を通じてターゲットすることも可能です。
- `POPULATE`キーワードを使用して、元のテーブル「hits_UserID_URL」から887万行すべてを暗黙的に作成されたテーブルに即座に供給します。
- 元のテーブル「hits_UserID_URL」に新しい行が挿入されると、その行は暗黙的に作成されたテーブルにも自動的に挿入されます。
- 実質的に、暗黙的に作成されたテーブルは[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と同じ行順と主インデックスを持っています：

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white"/>

ClickHouseは、暗黙的に作成されたテーブルの[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns)(*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules)(*.mrk2)および[主インデックス](#the-primary-index-has-one-entry-per-granule)(primary.idx)をClickHouseサーバーのデータディレクトリ内の特別なフォルダに保存しています：

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white"/>

:::

マテリアライズドビューをバックアップする暗黙的に作成されたテーブル（および主要インデックス）は、URLカラムでフィルタリングする例のクエリの実行速度を大幅に向上させるために使用できます：
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

応答は次のようになります：

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

実質的に、マテリアライズドビューをバックアップする暗黙的に作成されたテーブル（およびその主インデックス）は、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と同じであるため、クエリは明示的に作成したテーブルと同じ効果的な方法で実行されます。

ClickHouseサーバーログファイルの対応するトレースログが、ClickHouseがインデックスマークの上でバイナリー検索を実行していることを確認しています：

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

### オプション3：プロジェクション {#option-3-projections}

既存のテーブルにプロジェクションを作成します：
```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

そしてプロジェクションをマテリアライズします：
```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note
- プロジェクションは、指定された`ORDER BY`句に基づいて行順と主インデックスを持つ**隠れたテーブル**を作成します。
- 隠れたテーブルは、`SHOW TABLES`クエリによってリストされません。
- `MATERIALIZE`キーワードを使用して、元のテーブル「hits_UserID_URL」から887万行すべてを隠れたテーブルに即座に供給します。
- 元のテーブル「hits_UserID_URL」に新しい行が挿入されると、その行は自動的に隠れたテーブルにも挿入されます。
- クエリは常に（文法上）元のテーブル「hits_UserID_URL」をターゲットにしますが、隠れたテーブルの行順と主インデックスがクエリのより効果的な実行を可能にする場合、その隠れたテーブルが代わりに使用されます。
- プロジェクションは、プロジェクションのORDER BYが一致しても、ORDER BYを使用するクエリの効率を向上させません（see https://github.com/ClickHouse/ClickHouse/issues/47333）。
- 実質的に、暗黙的に作成された隠れたテーブルは[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と同じ行順と主インデックスを持っています：

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white"/>

ClickHouseは、暗黙的に作成された隠れたテーブルの[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns)(*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules)(*.mrk2)および[主インデックス](#the-primary-index-has-one-entry-per-granule)(primary.idx)を、元のテーブルのデータファイル、マークファイル、主インデックスファイルの隣にある特別なフォルダに保存します：

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white"/>

:::

プロジェクションによって作成された隠れたテーブル（およびその主インデックス）は、URLカラムでフィルタリングする例のクエリの実行速度を大幅に向上させるために（暗黙的に）使用できます。ただし、クエリはプロジェクションの元のテーブルを文法上ターゲットにしています。
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

応答は次のようになります：

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

実質的に、プロジェクションによって作成された隠れたテーブル（およびその主インデックス）は[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と同じであるため、クエリは、明示的に作成されたテーブルと同じ効果的な方法で実行されます。

ClickHouseサーバーログファイルの対応するトレースログが、ClickHouseがインデックスマークの上でバイナリー検索を実行していることを確認しています：

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

[複合主キー (UserID, URL)を持つテーブル](#a-table-with-a-primary-key)の主インデックスは、[UserIDでフィルタリングするクエリ](#the-primary-index-is-used-for-selecting-granules)の実行速度を大幅に向上させるのに非常に役立ちました。しかし、そのインデックスは、URL列が複合主キーの一部であるにもかかわらず、[URLでフィルタリングするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)の速度を大幅に向上させることには役立っていません。

逆も然り：
[複合主キー (URL, UserID)を持つテーブル](#guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)の主インデックスは、[URLでフィルタリングするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)の速度を向上させていましたが、[UserIDでフィルタリングするクエリ](#the-primary-index-is-used-for-selecting-granules)のサポートをあまり提供しませんでした。

主キー列のUserIDとURLの同様の高いカーディナリティのため、2番目のキー列でフィルタリングするクエリは、インデックスに2番目のキー列が含まれていることから多くの利益を得ることができません（#generic-exclusion-search-algorithm）。

したがって、主インデックスから2番目のキー列を削除して（インデックスのメモリ消費を軽減し）、[複数の主インデックスを使用する](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes)方が良いと言えます。

ただし、複合主キー内のキー列に大きなカーディナリティの違いがある場合、主キー列はカーディナリティの昇順で並べることが、[クエリにとって有益です](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。

キー列間のカーディナリティの差が大きいほど、それらの列のキーの順序が重要になります。次のセクションでそのことを示します。

## キー列の効率的な順序付け {#ordering-key-columns-efficiently}

<a name="test"></a>

複合主キーでは、キー列の順序が次の両方に大きな影響を及ぼす可能性があります：
- クエリにおけるセカンダリキー列でのフィルタリングの効率
- テーブルのデータファイルの圧縮率

それを示すために、インターネットの「ユーザー」(`UserID`列)がURL(`URL`列)にアクセスし、ボットトラフィックとしてマークされたかどうかを示す3つのカラムを含む当社の[ウェブトラフィックサンプルデータセット](#data-set)のバージョンを使用します。

フィルタリングを行うために使えるカーディナリティを計算するために、私たちは複合主キーに含まれる3つのカラムを使用します（URL、UserID、IsRobot）。このクエリを`clickhouse client`で実行します：
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
応答は次のようになります：
```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

`URL`と`IsRobot`列間には大きな違いがあることがわかります。そのため、複合主キー内のこれらの列の順序は、クエリフィルタリングの効率を大幅に向上させ、テーブルのカラムデータファイルの最適な圧縮比を達成するために重要です。

そのことを示すために、ボットトラフィック分析データの2つのテーブルバージョンを作成します：
- キー列を降順で並べた複合主キー `(URL, UserID, IsRobot)`を持つテーブル `hits_URL_UserID_IsRobot`
- キー列を昇順で並べた複合主キー `(IsRobot, UserID, URL)`を持つテーブル `hits_IsRobot_UserID_URL`

複合主キー `(URL, UserID, IsRobot)`を持つテーブル `hits_URL_UserID_IsRobot`を作成します：
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

887万行を挿入します：
```sql
INSERT INTO hits_URL_UserID_IsRobot SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
応答は次のようになります：
```response
0 rows in set. Elapsed: 104.729 sec. Processed 8.87 million rows, 15.88 GB (84.73 thousand rows/s., 151.64 MB/s.)
```

次に、複合主キー `(IsRobot, UserID, URL)`を持つテーブル `hits_IsRobot_UserID_URL`を作成します：
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
そして、前と同じ887万行を同じく挿入します：

```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
応答は次のようになります：
```response
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```
### セカンダリキー列での効率的なフィルタリング {#efficient-filtering-on-secondary-key-columns}

クエリが1つ以上の列でフィルタリングを行っている場合、その中に複合キーの最初のキー列が含まれていれば、[ClickHouseはキー列のインデックスマークに対してバイナリー検索アルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

クエリが（のみ）複合キーの中にある列でフィルタリングを行っているが、最初のキー列でない場合、[ClickHouseはキー列のインデックスマークに対して一般的な除外検索アルゴリズムを使用します](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

後者のケースにおいては、複合主キーのキー列の順序が[一般的な除外検索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)の有効性に重要です。

URL列がキーが(URL, UserID, IsRobot)で降順に並べたテーブルへのユーザーID列のフィルタリングを行うこのクエリ：
```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```
応答は次のようになります：
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.026 sec.

# highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

同じクエリがキーを(IsRobot, UserID, URL)が昇順のテーブルで行われた場合：
```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```
応答は次のようになります：
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.

# highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

テーブルに並べられたキー列の順序が、クエリの実行速度を劇的に短縮できることが分かります。

その理由は、[一般的な除外検索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)が、先行キー列が低いカーディナリティを持つセカンダリキー列から選択されると、[グラニュール](#the-primary-index-is-used-for-selecting-granules)が選択された場合最も効果的に機能するからです。前に詳細に説明しました。
```
### 最適な圧縮比率のデータファイル {#optimal-compression-ratio-of-data-files}

このクエリは、上記で作成した2つのテーブル間の `UserID` カラムの圧縮比率を比較します：

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
これが応答です：
```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 行がセットされました。経過時間: 0.006 秒。
```
`UserID` カラムの圧縮比率は、キーのカラム `(IsRobot, UserID, URL)` を cardinality の昇順で並べたテーブルの方がはるかに高いことがわかります。

両方のテーブルには正確に同じデータが格納されています（同じ 8.87 百万行を両方のテーブルに挿入しました）が、複合主キーのキーのカラムの順序がテーブルの [カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) において、圧縮されたデータが必要とするディスクスペースに大きな影響を与えることがあります：
- 複合主キー `(URL, UserID, IsRobot)` のテーブル `hits_URL_UserID_IsRobot` では、キーのカラムを cardinality の降順に並べると、`UserID.bin` データファイルは **11.24 MiB** のディスクスペースを消費します。
- 複合主キー `(IsRobot, UserID, URL)` のテーブル `hits_IsRobot_UserID_URL` では、キーのカラムを cardinality の昇順に並べると、`UserID.bin` データファイルはわずか **877.47 KiB** のディスクスペースを消費します。

テーブルのカラムデータがディスクに良好な圧縮比率で保存されていることは、ディスクスペースを節約するだけでなく、そのカラムからデータを読み取る必要があるクエリ（特に分析系のクエリ）を高速化するためにも重要です。なぜなら、カラムのデータをディスクからメインメモリ（オペレーティングシステムのファイルキャッシュ）に移動させるために必要な I/O が少なくて済むからです。

以下では、テーブルのカラムの圧縮比率を総合的に良くするために、主キーのカラムを cardinality の昇順で並べることがなぜ有益であるかを示します。

以下の図は、主キーのキーのカラムが cardinality の昇順で並べられたときの行のディスク上の順序を示しています：

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white"/>

私たちは、[テーブルの行データが主キーのカラムで並べられている](#data-is-stored-on-disk-ordered-by-primary-key-columns)ことを議論しました。

上の図では、テーブルの行（ディスク上のカラム値）は、まず `cl` 値で並べられ、同じ `cl` 値を持つ行は `ch` 値で並べられます。最初のキーのカラム `cl` は低い cardinality を持っているため、同じ `cl` 値を持つ行が存在する可能性が高いです。そのため、`ch` 値が（同じ `cl` 値を持つ行の中では）ローカルに並べられる可能性も高いです。

もしカラム内に似たデータが近くに配置されている場合、例えばソートによって、データはより良く圧縮されます。
一般に、圧縮アルゴリズムはデータのランレングス（より多くのデータが見えるほど圧縮が良くなる）と局所性（データがより似ているほど圧縮比率が良くなる）に利益をもたらします。

上の図とは対照的に、以下の図は主キーのキーのカラムが cardinality の降順で並べられたときの行のディスク上の順序を示しています：

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white"/>

今度は、テーブルの行がまず `ch` 値で並べられ、同じ `ch` 値を持つ行は `cl` 値で並べられます。
ただし、最初のキーのカラム `ch` は高い cardinality を持っているため、同じ `ch` 値を持つ行が存在する可能性は低いです。それゆえ、`cl` 値が（同じ `ch` 値を持つ行の中では）ローカルに並べられる可能性も低くなります。

したがって、`cl` 値はランダムな順序に近く、したがって局所性と圧縮比率が悪くなります。

### まとめ {#summary-1}

クエリにおける二次キーのカラムの効率的なフィルタリングとテーブルのカラムデータファイルの圧縮比率においては、主キーのカラムを cardinality の昇順で並べる方が有益です。

### 関連コンテンツ {#related-content-1}
- ブログ: [ClickHouse のクエリを高速化する](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)

## 単一行の効率的な識別 {#identifying-single-rows-efficiently}

一般に、ClickHouse にとって最適なユースケースではありませんが、ClickHouse の上に構築されたアプリケーションによっては、ClickHouse テーブルの単一行を識別する必要がある場合があります。

それに対する直感的な解決策は、行ごとにユニークな値を持つ [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) カラムを使用し、そのカラムを主キーのカラムとして使用することです。

最速の取得のためには、UUID カラムは [最初のキーのカラム](#the-primary-index-is-used-for-selecting-granules) である必要があります。

私たちは、[ClickHouse テーブルの行データが主キーのカラムで並べられている](#data-is-stored-on-disk-ordered-by-primary-key-columns)ため、非常に高い cardinality のカラム（UUID カラムのような）を主キーまたは複合主キーの低い cardinality カラムの前に置くことは、他のテーブルのカラムの圧縮比率に悪影響を及ぼすことを議論しました。

最速の取得と最適なデータ圧縮の妥協は、UUID を最後のキーのカラムとして使用し、テーブルのカラムの良好な圧縮比率を確保するために使用される低い（または低い）cardinality のカラムが先にくる複合主キーを使用することです。

### 具体的な例 {#a-concrete-example}

一つの具体的な例は、Alexey Milovidov が開発し、[ブログで紹介した](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/) プレーンテキストのペーストサービス https://pastila.nl です。

テキストエリアに変更があるたびに、データは自動的に ClickHouse テーブルの行に保存されます（変更ごとに1行）。

ペーストされたコンテンツ（特定のバージョン）を識別し取得する方法の一つは、コンテンツのハッシュをテーブル行の UUID として使用することです。

以下の図は、
- コンテンツ変更時の行挿入順（テキストエリアにキーストロークを打ち込むことによる変更など）と、
- `PRIMARY KEY (hash)` が使用されたときの挿入された行のディスク上のデータの順序を示しています：

<Image img={sparsePrimaryIndexes15a} size="md" alt="Sparse Primary Indices 15a" background="white"/>

`hash` カラムが主キーのカラムとして使用されるため、
- 特定の行を [非常に迅速に](#the-primary-index-is-used-for-selecting-granules)取得できますが、
- テーブルの行（カラムデータ）はディスク上で（ユニークでランダムな）ハッシュ値の昇順に並べられます。そのため、コンテンツカラムの値もランダム順に保存され、データの局所性がないために **コンテンツカラムデータファイルの圧縮比率が最適でない** ことになります。

特定の行の圧縮比率を大幅に改善し、同時に特定の行の迅速な取得を可能にするために、pastila.nl では特定の行を識別するために 2 つのハッシュ（複合主キー）を使用しています：
- 上述したように、異なるデータに対して異なる `hash` で、
- 小さなデータの変化に対しては **変更されない** [ローカリティ感知ハッシュ（フィンガープリント）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)。

以下の図は、
- コンテンツ変更時の行挿入順（テキストエリアにキーストロークを打ち込むことなど）と、
- 複合 `PRIMARY KEY (fingerprint, hash)` が使用された場合の挿入行のディスク上のデータの順序を示しています：

<Image img={sparsePrimaryIndexes15b} size="md" alt="Sparse Primary Indices 15b" background="white"/>

この場合、ディスク上の行は最初に `fingerprint` で並べられ、同じフィンガープリント値を持つ行では、その `hash` 値が最終的な順序を決定します。

データが小さな変更のみで異なる場合、同じフィンガープリント値が得られるため、同様のデータがディスク上で近接して保存されます。これは、圧縮アルゴリズムの局所性に非常に良い影響を与えます（データがより似ているほど圧縮比率が良くなるからです）。

妥協点は、複合 `PRIMARY KEY (fingerprint, hash)` によって生じる主インデックスを最適に活用するために、特定の行を取得するには 2 つのフィールド（`fingerprint` と `hash`）が必要であるということです。
