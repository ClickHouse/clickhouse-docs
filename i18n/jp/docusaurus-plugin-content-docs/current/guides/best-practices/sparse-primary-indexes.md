---
sidebar_label: 'プライマリインデックス'
sidebar_position: 1
description: 'このガイドでは、ClickHouse におけるインデックス機構について深く掘り下げて解説します。'
title: 'ClickHouse におけるプライマリインデックス実践的入門'
slug: /guides/best-practices/sparse-primary-indexes
show_related_blogs: true
doc_type: 'guide'
keywords: ['プライマリインデックス', 'インデックス', 'パフォーマンス', 'クエリ最適化', 'ベストプラクティス']
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


# ClickHouse におけるプライマリインデックスの実践的入門



## はじめに

このガイドでは、ClickHouse のインデックスについて深く掘り下げて解説します。具体的には次の点を詳しく説明・議論します:

* [ClickHouse におけるインデックスが従来のリレーショナルデータベース管理システムとどのように異なるか](#an-index-design-for-massive-data-scales)
* [ClickHouse がテーブルのスパースなプライマリインデックスをどのように構築・利用しているか](#a-table-with-a-primary-key)
* [ClickHouse におけるインデックス設計のベストプラクティス](#using-multiple-primary-indexes)

このガイド内で提示するすべての ClickHouse の SQL ステートメントやクエリは、任意でご自身のマシン上で実行できます。
ClickHouse のインストールや入門手順については、[クイックスタート](/get-started/quick-start)を参照してください。

:::note
このガイドでは ClickHouse のスパースなプライマリインデックスに焦点を当てています。

ClickHouse の[セカンダリのデータスキップインデックス](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)については、[チュートリアル](/guides/best-practices/skipping-indexes.md)を参照してください。
:::

### データセット

このガイド全体を通して、匿名化された Web トラフィックのサンプルデータセットを使用します。

* サンプルデータセットから 887 万行（イベント）のサブセットを使用します。
* 非圧縮のデータサイズは 887 万イベントで約 700 MB です。ClickHouse に保存すると 200 MB に圧縮されます。
* このサブセットでは、各行は、あるインターネットユーザ（`UserID` 列）が特定の時刻（`EventTime` 列）にある URL（`URL` 列）をクリックしたことを示す 3 つの列を含みます。

これら 3 つの列だけでも、次のような典型的な Web 分析クエリを作成できます:

* 「特定ユーザに対して、最もクリックされた URL のトップ 10 は何か？」
* 「特定の URL を最も頻繁にクリックしたユーザのトップ 10 は誰か？」
* 「ユーザが特定の URL をクリックする最も一般的な時間帯（例: 曜日）はいつか？」

### テストマシン

本ドキュメントで示すすべての実行時間は、Apple M1 Pro チップと 16GB の RAM を搭載した MacBook Pro 上で、ClickHouse 22.2.1 をローカル実行した結果に基づいています。

### フルテーブルスキャン

プライマリキーなしでデータセットに対してクエリがどのように実行されるかを確認するために、次の SQL DDL ステートメントを実行して、（MergeTree テーブルエンジンを用いた）テーブルを作成します:

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

次に、以下の SQL `INSERT` 文を使って、`hits` データセットの一部をテーブルに挿入します。
これは、clickhouse.com 上でホストされている完全なデータセットのサブセットを読み込むために、[URL table function](/sql-reference/table-functions/url.md) を使用します。


```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```

レスポンスは以下のとおりです。

```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```

ClickHouse クライアントの出力結果から、上記のクエリによって 887 万行がテーブルに挿入されたことがわかります。

最後に、このガイドの後半での議論をわかりやすくし、図や結果を再現可能にするために、FINAL キーワードを使ってテーブルを[最適化](/sql-reference/statements/optimize.md)します。


```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
一般的には、データをテーブルにロードした直後にテーブルの最適化を行う必要も、行うことも推奨されません。この例でなぜそれが必要になるのかは、後ほど明らかになります。
:::

では、最初の Web 分析用クエリを実行します。以下は、UserID 749927693 のインターネットユーザーについて、クリック数が多い URL の上位 10 件を求めるものです。

```sql
SELECT URL, count(URL) AS Count
FROM hits_NoPrimaryKey
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは以下のとおりです：

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
```


10 行が結果セットに含まれています。経過時間: 0.022 秒。

# highlight-next-line

8.87 百万行を処理しました。
70.45 MB（398.53 百万行/秒、3.17 GB/秒）。

```

ClickHouseクライアントの結果出力から、ClickHouseがフルテーブルスキャンを実行したことが分かります。テーブルの887万行すべてがClickHouseにストリーミングされました。これではスケールしません。

これを大幅に効率化し高速化するには、適切なプライマリキーを持つテーブルを使用する必要があります。これにより、ClickHouseはプライマリキーの列に基づいてスパースプライマリインデックスを自動的に作成し、サンプルクエリの実行を大幅に高速化できます。
```


## ClickHouseのインデックス設計 {#clickhouse-index-design}

### 大規模データスケールに対応するインデックス設計 {#an-index-design-for-massive-data-scales}

従来のリレーショナルデータベース管理システムでは、プライマリインデックスはテーブルの各行に対して1つのエントリを保持します。このため、本データセットではプライマリインデックスに887万件のエントリが含まれることになります。このようなインデックスにより特定の行を高速に特定できるため、検索クエリやポイント更新において高い効率を実現します。`B(+)-Tree`データ構造におけるエントリの検索は、平均時間計算量が`O(log n)`となります。より正確には、`log_b n = log_2 n / log_2 b`であり、ここで`b`は`B(+)-Tree`の分岐係数、`n`はインデックス化された行数です。`b`は通常数百から数千の範囲であるため、`B(+)-Tree`は非常に浅い構造となり、レコードの特定に必要なディスクシークは少なくなります。887万行で分岐係数が1000の場合、平均2.3回のディスクシークが必要です。この機能には代償が伴います。追加のディスクおよびメモリのオーバーヘッド、テーブルへの新規行追加やインデックスへのエントリ追加時の挿入コストの増加、そして場合によってはB-Treeの再バランシングが必要となります。

B-Treeインデックスに関連する課題を考慮し、ClickHouseのテーブルエンジンは異なるアプローチを採用しています。ClickHouseの[MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family/index.md)は、大規模データ量を処理するために設計・最適化されています。これらのテーブルは、毎秒数百万行の挿入を受け付け、非常に大きな(数百ペタバイト)データ量を保存するように設計されています。データは[パート単位](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)でテーブルに高速に書き込まれ、バックグラウンドでパートをマージするルールが適用されます。ClickHouseでは、各パートが独自のプライマリインデックスを持ちます。パートがマージされると、マージされたパートのプライマリインデックスもマージされます。ClickHouseが設計された非常に大規模な環境では、ディスクとメモリの効率性が極めて重要です。そのため、すべての行をインデックス化する代わりに、パートのプライマリインデックスは行のグループ(「granule」と呼ばれる)ごとに1つのインデックスエントリ(「mark」と呼ばれる)を持ちます。この手法は**スパースインデックス**と呼ばれます。

スパースインデックスが可能なのは、ClickHouseがパートの行をプライマリキー列の順序でディスクに保存しているためです。単一の行を直接特定する(B-Treeベースのインデックスのような)代わりに、スパースプライマリインデックスは(インデックスエントリに対する二分探索により)クエリに一致する可能性のある行のグループを迅速に識別します。特定された一致する可能性のある行のグループ(granule)は、その後並列にClickHouseエンジンにストリーミングされ、一致するものを見つけます。このインデックス設計により、プライマリインデックスを小さく保つことができ(メインメモリに完全に収まることができ、また収まる必要があります)、同時にクエリ実行時間を大幅に高速化します。特にデータ分析のユースケースで典型的な範囲クエリにおいて効果的です。

以下では、ClickHouseがスパースプライマリインデックスをどのように構築し使用しているかを詳細に説明します。本記事の後半では、インデックスの構築に使用されるテーブル列(プライマリキー列)の選択、削除、順序付けに関するベストプラクティスについて説明します。

### プライマリキーを持つテーブル {#a-table-with-a-primary-key}

UserIDとURLをキー列とする複合プライマリキーを持つテーブルを作成します:

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

[//]: # "<details open>"

<details>
    <summary>
    DDL文の詳細
    </summary>
    <p>

本ガイドの後半での説明を簡潔にし、図や結果を再現可能にするため、DDL文は以下のようになっています:


<ul>
  <li>
    <code>ORDER BY</code>{" "}句を使用してテーブルの複合ソートキーを指定します。
  </li>
  <li>
    設定を通じてプライマリインデックスが持つインデックスエントリの数を明示的に制御します:
    <ul>
      <li>
        <code>index_granularity</code>: デフォルト値の8192に明示的に設定されています。これは、8192行のグループごとにプライマリインデックスが1つのインデックスエントリを持つことを意味します。例えば、テーブルに16384行が含まれている場合、インデックスは2つのインデックスエントリを持ちます。
      </li>
      <li>
        <code>index_granularity_bytes</code>: <a
          href='https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1'
          target='_blank'
        >
          適応型インデックス粒度
        </a>を無効にするために0に設定されています。適応型インデックス粒度とは、以下のいずれかの条件が満たされた場合に、ClickHouseがn行のグループに対して自動的に1つのインデックスエントリを作成することを意味します:
        <ul>
          <li>
            <code>n</code>が8192未満で、その<code>n</code>行の結合された行データのサイズが10 MB以上である場合(<code>index_granularity_bytes</code>のデフォルト値)。
          </li>
          <li>
            <code>n</code>行の結合された行データサイズが10 MB未満であるが、<code>n</code>が8192である場合。
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: <a
          href='https://github.com/ClickHouse/ClickHouse/issues/34437'
          target='_blank'
        >
          プライマリインデックスの圧縮
        </a>を無効にするために0に設定されています。これにより、後でその内容を必要に応じて検査できるようになります。
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

上記のDDL文のプライマリキーは、指定された2つのキー列に基づいてプライマリインデックスを作成します。

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

レスポンスは以下のようになります。

```response
0 rows in set. 経過時間: 149.432秒 処理: 887万行、18.40 GB (59.38千行/秒、123.16 MB/秒)
```

<br />

次に、テーブルを最適化します。

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br />

次のクエリを実行して、テーブルに関するメタデータを取得できます。


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

レスポンスは次のとおりです。

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

ClickHouse クライアントの出力は次のとおりです:

* テーブルのデータはディスク上の特定のディレクトリに[wide format](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)で保存されており、そのディレクトリ内ではテーブルの各カラムにつき 1 つのデータファイル（および 1 つのマークファイル）が存在します。
* テーブルには 887 万行のデータがあります。
* すべての行を非圧縮で保持した場合のデータサイズは 733.28 MB です。
* すべての行のディスク上での圧縮後サイズは 206.94 MB です。
* テーブルには 1083 個のエントリ（「マーク」と呼ばれます）を持つプライマリインデックスがあり、そのインデックスサイズは 96.93 KB です。
* テーブルのデータファイル、マークファイル、およびプライマリインデックスファイルをすべて合わせたディスク使用量は合計 207.07 MB です。

### データはディスク上でプライマリキー列により並べ替えられて保存される

上で作成したテーブルには

* 複合[プライマリキー](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` と
* 複合[ソートキー](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)` が定義されています。

:::note

* ソートキーのみを指定した場合、プライマリキーは暗黙的にソートキーと同一のものとして定義されます。

* メモリ効率を高めるため、クエリでフィルタリングに使用するカラムだけを含むプライマリキーを明示的に指定しました。プライマリキーに基づくプライマリインデックスは、すべてメインメモリにロードされます。

* このガイド内の図の一貫性を保ち、かつ圧縮率を最大化するために、テーブルのすべてのカラムを含む別個のソートキーを定義しました（あるカラム内で類似したデータが互いに近接して配置されている場合、たとえばソートによってそうなっていると、そのデータはより高い圧縮率で保存されます）。

* プライマリキーとソートキーの両方を指定する場合、プライマリキーはソートキーのプレフィックスである必要があります。
  :::

挿入された行は、プライマリキー列（およびソートキーに含まれる追加の `EventTime` 列）に基づき、辞書順（昇順）でディスク上に保存されます。

:::note
ClickHouse では、プライマリキー列の値が同一の複数行を挿入できます。この場合（下の図の行 1 と行 2 を参照）、最終的な並び順は指定されたソートキー、したがって `EventTime` 列の値によって決定されます。
:::

ClickHouse は<a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms
" target="_blank">カラム指向のデータベース管理システム</a>です。以下の図に示すように、

* ディスク上の表現では、テーブルの各カラムごとに 1 つのデータファイル（*.bin）が存在し、そのカラムのすべての値は<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a>された形式で保存されます。
* 887 万行のデータは、プライマリキー列（および追加のソートキー列）に基づき辞書順（昇順）でディスク上に保存されます。つまりこのケースでは
  * まず `UserID`,
  * 次に `URL`,
  * 最後に `EventTime` によって並べ替えられます。

<Image img={sparsePrimaryIndexes01} size="md" alt="スパースなプライマリインデックス 01" background="white" />


`UserID.bin`、`URL.bin`、`EventTime.bin` は、`UserID`、`URL`、`EventTime` 列の値が保存されているディスク上のデータファイルです。

:::note
- 主キーはディスク上の行の辞書順を定義するため、テーブルに定義できる主キーは 1 つだけです。

- ClickHouse の内部行番号付け方式（ログメッセージにも使用されます）と揃えるため、行番号は 0 から開始しています。
:::

### データは並列処理のためにグラニュールに編成されます {#data-is-organized-into-granules-for-parallel-data-processing}

データ処理のために、テーブルの列値は論理的にグラニュールに分割されます。
グラニュールは、データ処理のために ClickHouse にストリーミングされる、最小の不可分データセットです。
つまり、個々の行を読み込む代わりに、ClickHouse は常に（ストリーミング方式かつ並列に）行のグループ全体（グラニュール）を読み込みます。
:::note
列値は物理的にはグラニュールの内部に保存されません。グラニュールは、クエリ処理のための列値の論理的な編成にすぎません。
:::

次の図は、このテーブルの 887 万行（の列値）が、テーブルの DDL ステートメントに含まれる `index_granularity` 設定（デフォルト値 8192）に基づき、1083 個のグラニュールにどのように編成されているかを示しています。

<Image img={sparsePrimaryIndexes02} size="md" alt="Sparse Primary Indices 02" background="white"/>

最初の 8192 行（ディスク上の物理順に基づく、その列値）は論理的にグラニュール 0 に属し、次の 8192 行（の列値）はグラニュール 1 に属し、という形で続きます。

:::note
- 最後のグラニュール（グラニュール 1082）は 8192 行未満を「含み」ます。

- このガイドの冒頭の「DDL ステートメントの詳細」で述べたように、[adaptive index granularity](/whats-new/changelog/2019.md/#experimental-features-1) を無効化しています（このガイドでの説明を簡略化し、図や結果を再現可能にするためです）。

  したがって、この例のテーブルのすべてのグラニュール（最後の 1 つを除く）は同じサイズになります。

- adaptive index granularity（インデックス粒度は[デフォルト](/operations/settings/merge-tree-settings#index_granularity_bytes)でアダプティブ）を持つテーブルでは、一部のグラニュールのサイズは行データのサイズに応じて 8192 行より小さくなる場合があります。

- 主キー列（`UserID`、`URL`）の一部の列値をオレンジ色でマークしています。
  このオレンジ色でマークされた列値は、それぞれのグラニュールの先頭行の主キー列の値です。
  後述するように、これらのオレンジ色でマークされた列値が、テーブルのプライマリインデックスのエントリになります。

- ClickHouse の内部番号付け方式（ログメッセージにも使用されます）と揃えるため、グラニュール番号は 0 から開始しています。
:::

### プライマリインデックスはグラニュールごとに 1 エントリを持つ {#the-primary-index-has-one-entry-per-granule}

プライマリインデックスは、上記の図に示されているグラニュールに基づいて作成されます。このインデックスは、0 から始まる数値インデックスマークを含む、圧縮されていないフラット配列のファイル（primary.idx）です。

下の図は、インデックスが各グラニュールの先頭行の主キー列の値（上の図でオレンジ色でマークされた値）を格納していることを示しています。
言い換えると、プライマリインデックスは、テーブルの各 8192 行目の主キー列の値（主キー列で定義された物理的な行順に基づく）を格納しています。
例えば、
- 最初のインデックスエントリ（下図の「mark 0」）は、上の図のグラニュール 0 の先頭行のキー列の値を格納しており、
- 2 番目のインデックスエントリ（下図の「mark 1」）は、上の図のグラニュール 1 の先頭行のキー列の値を格納しており、そのように続きます。

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Sparse Primary Indices 03a" background="white"/>

合計で、このテーブル（887 万行、1083 グラニュール）のインデックスには 1083 個のエントリがあります。

<Image img={sparsePrimaryIndexes03b} size="md" alt="Sparse Primary Indices 03b" background="white"/>



:::note
- [adaptive index granularity](/whats-new/changelog/2019.md/#experimental-features-1) を持つテーブルでは、主キーインデックス内に、テーブルの最後の行の主キー列の値を記録する「最終」追加マークも 1 つ保存されます。ただし、本ガイドでの説明を単純化し、図や結果を再現可能にするために adaptive index granularity を無効化しているため、このサンプルテーブルのインデックスにはこの最終マークは含まれていません。

- プライマリインデックスファイルはメインメモリ上に完全にロードされます。ファイルサイズが利用可能な空きメモリ容量より大きい場合、ClickHouse はエラーを返します。
:::

<details>
    <summary>
    プライマリインデックスの内容の確認
    </summary>
    <p>

セルフマネージドの ClickHouse クラスターでは、サンプルテーブルのプライマリインデックスの内容を確認するために、<a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">file テーブル関数</a>を使用できます。

そのためには、まず実行中のクラスター内のノードのいずれかの <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> にプライマリインデックスファイルをコピーする必要があります:
<ul>
<li>Step 1: プライマリインデックスファイルを含む part-path を取得する</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

テストマシンでは `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4` が返されます。

<li>Step 2: user_files_path を取得する</li>
Linux における<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">デフォルトの user_files_path</a> は
`/var/lib/clickhouse/user_files/`
です。

また、Linux では次のコマンドで変更されているかを確認できます: `$ grep user_files_path /etc/clickhouse-server/config.xml`

テストマシンではこのパスは `/Users/tomschreiber/Clickhouse/user_files/` です。

<li>Step 3: プライマリインデックスファイルを user_files_path にコピーする</li>

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

<li>先頭 2 つのインデックスマークを取得する</li>
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
これは、サンプルテーブルのプライマリインデックス内容を示す図と完全に一致しています。

</p>
</details>

プライマリキーのエントリはインデックスマークと呼ばれます。これは、それぞれのインデックスエントリが特定のデータ範囲の開始位置をマークしているためです。サンプルテーブルの場合、特に以下のようになります:
- UserID インデックスマーク:

  プライマリインデックスに保存されている `UserID` の値は昇順に並べ替えられています。<br/>
  上の図における「mark 1」は、granule 1 およびそれ以降のすべての granule に含まれるテーブル行の `UserID` の値が、4.073.710 以上であることが保証されていることを意味します。



[後ほど説明するように](#the-primary-index-is-used-for-selecting-granules)、このグローバルな順序により、クエリがプライマリキーの第1列でフィルタリングしている場合に、ClickHouse は第1キー列のインデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索アルゴリズムを使用</a>できるようになります。

* URL インデックスマーク:

  プライマリキー列 `UserID` と `URL` のカーディナリティがほぼ同程度であることから、
  一般に、最初のキー列以降のすべてのキー列に対するインデックスマークは、「少なくとも現在の granule に含まれる全テーブル行において、直前のキー列の値が同一である範囲」に対してのみデータ範囲を示すことになります。<br />
  例えば、上の図で mark 0 と mark 1 の UserID の値が異なるため、ClickHouse は granule 0 に含まれるすべてのテーブル行の URL の値が `'http://showtopics.html%3...'` 以上であるとは仮定できません。しかし、もし上の図で mark 0 と mark 1 の UserID の値が同じであった場合（つまり、granule 0 内のすべてのテーブル行で UserID の値が同じである場合）、ClickHouse は granule 0 に含まれるすべてのテーブル行の URL の値が `'http://showtopics.html%3...'` 以上であると仮定できるようになります。

  これがクエリ実行時のパフォーマンスにどのような影響を与えるかについては、後ほど詳しく説明します。

### プライマリインデックスは granule の選択に使用される

これで、プライマリインデックスの支援を受けてクエリを実行できるようになりました。

次のクエリでは、UserID 749927693 について、クリック数が最も多い URL の上位 10 件を算出します。

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
```


10 行が返されました。経過時間: 0.005 秒。

# highlight-next-line

8.19 千行を処理しました、
740.18 KB (1.53 百万行/秒、138.59 MB/秒)。

```

ClickHouseクライアントの出力は、フルテーブルスキャンを実行する代わりに、8,190行のみがClickHouseにストリーミングされたことを示しています。
```


<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">trace logging</a> が有効になっている場合、ClickHouse サーバーのログファイルには、ClickHouse が 1083 個の UserID インデックスマークに対して <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">binary search</a> を実行し、UserID 列の値が `749927693` である行を含んでいる可能性がある granule を特定していることが示されます。これは平均時間計算量が `O(log2 n)` の 19 ステップで行われます。

```response
...Executor): キー条件: (カラム 0 が [749927693, 749927693] に含まれる)
# highlight-next-line
...Executor): パート all_1_9_2 のインデックス範囲で二分探索を実行中 (1083 マーク)
...Executor): 左境界マークを検出: 176
...Executor): 右境界マークを検出: 177
...Executor): 19 ステップで連続範囲を検出
...Executor): パーティションキーで 1/1 パートを選択、プライマリキーで 1 パートを選択、
# highlight-next-line
              プライマリキーで 1/1083 マーク、1 範囲から 1 マークを読み取り
...読み取り中 ...1441792 から開始して約 8192 行
```

上のトレースログからわかるように、既存の 1083 個のマークのうち 1 つだけがこのクエリを満たしています。

<details>
  <summary>
    トレースログの詳細
  </summary>

  <p>
    Mark 176 が特定されました（「found left boundary mark」は範囲に含まれ、「found right boundary mark」は範囲に含まれません）。その結果、granule 176（これは行 1.441.792 から始まります。これについては本ガイドの後半で説明します）に含まれる 8192 行すべてが ClickHouse にストリーミングされ、UserID 列の値が `749927693` である実際の行を検索します。
  </p>
</details>

また、この挙動はサンプルクエリで <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN 句</a> を使用することで再現できます。

```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のとおりです。


```response
┌─explain───────────────────────────────────────────────────────────────────────────────┐
│ Expression (射影)                                                                      │
│   Limit (予備LIMIT (OFFSETなし))                                                       │
│     Sorting (ORDER BYのソート)                                                         │
│       Expression (ORDER BY前)                                                          │
│         Aggregating                                                                   │
│           Expression (GROUP BY前)                                                      │
│             Filter (WHERE)                                                            │
│               SettingQuotaAndLimits (ストレージ読み取り後の制限とクォータ設定)              │
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

16行。経過時間: 0.003秒
```

クライアントの出力によると、1083 個あるグラニュールのうち 1 個が、`UserID` 列の値が 749927693 である行を含んでいる可能性があるものとして選択されています。

:::note 結論
クエリが複合キーを構成する列のうち先頭のキー列を対象にフィルタリングしている場合、ClickHouse はそのキー列のインデックスマークに対して二分探索アルゴリズムを実行します。
:::

<br />

前述のとおり、ClickHouse は疎なプライマリインデックスを用いて、クエリにマッチする可能性のある行を含むグラニュールを、二分探索により高速に選択しています。

これは ClickHouse のクエリ実行における **第 1 段階（グラニュール選択）** です。

**第 2 段階（データ読み取り）** では、ClickHouse は選択されたグラニュールを特定し、そのすべての行を ClickHouse エンジン内へストリーミングして、実際にクエリにマッチする行を見つけます。

この第 2 段階については、次のセクションでより詳しく説明します。

### マークファイルはグラニュールの位置特定に利用される

次の図は、このテーブルのプライマリインデックスファイルの一部を示しています。

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white" />

前述のとおり、インデックス内の 1083 個の `UserID` マークに対して二分探索を行うことで、マーク 176 が特定されました。対応するグラニュール 176 には、`UserID` 列の値が 749.927.693 の行を含んでいる可能性があります。

<details>
  <summary>
    Granule Selection Details
  </summary>

  <p>
    上の図では、マーク 176 が、関連付けられたグラニュール 176 の最小 `UserID` 値が 749.927.693 より小さく、かつ次のマーク（マーク 177）に対応するグラニュール 177 の最小 `UserID` 値がこの値より大きい、最初のインデックスエントリであることが示されています。したがって、`UserID` 列の値が 749.927.693 の行を含んでいる可能性があるのは、マーク 176 に対応するグラニュール 176 のみです。
  </p>
</details>

グラニュール 176 内の行の一部（またはすべて）が `UserID` 列の値 749.927.693 を持つかどうかを確認するには、このグラニュールに属する 8192 行すべてを ClickHouse にストリーミングする必要があります。

そのためには、ClickHouse はグラニュール 176 の物理的な位置を知る必要があります。

ClickHouse では、このテーブルにおけるすべてのグラニュールの物理位置がマークファイルに保存されています。データファイルと同様に、テーブルの各列ごとに 1 つのマークファイルがあります。

次の図は、テーブルの `UserID`、`URL`、`EventTime` 列のグラニュールの物理位置を格納している 3 つのマークファイル `UserID.mrk`、`URL.mrk`、`EventTime.mrk` を示しています。

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white" />

すでに説明したように、プライマリインデックスはフラットな非圧縮配列ファイル（`primary.idx`）であり、0 から始まる番号付きのインデックスマークを含みます。

同様に、マークファイルも 0 から始まる番号付きのマークを含む、フラットな非圧縮配列ファイル（`*.mrk`）です。

ClickHouse が、クエリにマッチする可能性のある行を含みうるグラニュールのインデックスマークを特定・選択した後は、そのグラニュールの物理位置を取得するために、マークファイルに対して配列インデックスによるルックアップを実行できます。

特定の列に対する各マークファイルのエントリは、オフセットという形で 2 つの位置情報を保持しています。


- 最初のオフセット（上の図の 'block_offset'）は、選択されたグラニュールの圧縮版を含む<a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">ブロック</a>を、<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮された</a>カラムデータファイル内で特定します。この圧縮ブロックには、複数の圧縮グラニュールが含まれている可能性があります。特定された圧縮ファイルブロックは、読み取り時にメインメモリ上に展開（解凍）されます。

- 2 番目のオフセット（上の図の 'granule_offset'）は mark-file から取得され、非圧縮ブロックデータ内でのグラニュールの位置を示します。

その後、特定された非圧縮グラニュールに属する 8192 行すべてが、さらなる処理のために ClickHouse へストリーミングされます。

:::note

- [ワイド形式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)かつ[アダプティブインデックス粒度](/whats-new/changelog/2019.md/#experimental-features-1)を使用していないテーブルの場合、ClickHouse は上図のような `.mrk` マークファイルを使用します。これらには、1 エントリあたり 8 バイト長のアドレスが 2 つ含まれています。これらのエントリは、すべて同じサイズを持つグラニュールの物理的位置を表します。

 インデックス粒度は[デフォルト](/operations/settings/merge-tree-settings#index_granularity_bytes)でアダプティブになっていますが、このガイドでの説明を簡潔にし、図や結果を再現可能にするために、サンプルテーブルではアダプティブインデックス粒度を無効にしています。また、本ガイドのテーブルは、データサイズが [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)（セルフマネージドクラスターではデフォルト 10 MB）より大きいため、ワイド形式を使用しています。

- ワイド形式かつアダプティブインデックス粒度を使用するテーブルの場合、ClickHouse は `.mrk2` マークファイルを使用します。これらは `.mrk` マークファイルと同様のエントリを持ちますが、エントリごとに 3 つ目の値として、現在のエントリが対応するグラニュールの行数を追加で保持します。

- [コンパクト形式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)のテーブルの場合、ClickHouse は `.mrk3` マークファイルを使用します。

:::

:::note Why Mark Files

なぜプライマリインデックスが、インデックスマークに対応するグラニュールの物理的位置を直接保持していないのでしょうか？

それは、ClickHouse が設計されている非常に大規模なスケールでは、ディスクとメモリを非常に効率的に利用することが重要だからです。

プライマリインデックスファイルはメインメモリに収まる必要があります。

今回のサンプルクエリでは、ClickHouse はプライマリインデックスを利用し、クエリにマッチする可能性のある行を含む 1 つのグラニュールを選択しました。ClickHouse が物理位置を必要とするのは、その 1 つのグラニュールについてのみであり、その位置情報を使って対応する行をストリーミングし、さらなる処理を行います。

さらに、このオフセット情報が必要なのは UserID と URL のカラムだけです。

クエリで使用されていないカラム、例えば `EventTime` にはオフセット情報は不要です。

このサンプルクエリでは、ClickHouse が必要とするのは、UserID データファイル（UserID.bin）のグラニュール 176 に対する 2 つの物理位置オフセットと、URL データファイル（URL.bin）のグラニュール 176 に対する 2 つの物理位置オフセットだけです。

マークファイルによるこの間接参照により、すべての 3 カラムに対する 1083 個すべてのグラニュールの物理位置エントリをプライマリインデックス内に直接保持することを回避できます。これにより、メインメモリ内の不要な（潜在的に未使用の）データを削減できます。
:::

次の図とその後の説明では、サンプルクエリにおいて、ClickHouse が UserID.bin データファイル内のグラニュール 176 をどのように特定するかを示します。

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

本ガイドの前半で説明したように、ClickHouse はプライマリインデックスマーク 176 を選択し、それによりグラニュール 176 を、クエリにマッチする行を含む可能性のあるグラニュールとして選択しました。

ClickHouse は、インデックスから選択されたマーク番号（176）を使用し、UserID.mrk マークファイルに対して配列インデックスによるルックアップを行い、グラニュール 176 を特定するための 2 つのオフセットを取得します。

示されているように、最初のオフセットは UserID.bin データファイル内で、グラニュール 176 の圧縮版を含む圧縮ファイルブロックを特定します。

特定されたファイルブロックがメインメモリ上に展開（解凍）されると、マークファイルからの 2 つ目のオフセットを使用して、非圧縮データ内でグラニュール 176 を特定できます。

サンプルクエリを実行するために、ClickHouse は UserID.bin データファイルと URL.bin データファイルの両方から、グラニュール 176 を特定し（およびその全値をストリーミングし）なければなりません（UserID 749.927.693 のインターネットユーザーに対する、もっともクリックされた URL の上位 10 件を求めるクエリ）。



上の図は、ClickHouse が UserID.bin データファイルに対してグラニュールをどのように特定しているかを示しています。

並行して、ClickHouse は URL.bin データファイルのグラニュール 176 についても同様の処理を行います。対応する 2 つのグラニュールは位置合わせされ、ClickHouse エンジンにストリーミングされてさらに処理されます。具体的には、UserID が 749.927.693 であるすべての行について、URL の値をグループごとに集計およびカウントし、その後、カウント数の降順で並べた上位 10 個の URL グループを最終的に出力します。



## 複数のプライマリインデックスの使用

<a name="filtering-on-key-columns-after-the-first" />

### セカンダリキー列が非効率になる場合とならない場合

クエリが複合キーの一部であり、かつ最初のキー列である列でフィルタリングしている場合、[ClickHouse はそのキー列のインデックスマークに対して二分探索アルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

では、クエリが複合キーを構成してはいるものの、最初のキー列ではない列でフィルタリングしている場合はどうなるでしょうか。

:::note
ここでは、クエリが明示的に最初のキー列ではなく、セカンダリキー列でフィルタリングしているシナリオについて説明します。

クエリが最初のキー列と、さらにその後の任意のキー列でフィルタリングしている場合、ClickHouse は最初のキー列のインデックスマークに対して二分探索を実行します。
:::

<br />

<br />

<a name="query-on-url" />

ここでは、URL 「[http://public&#95;search」](http://public\&#95;search」) が最も多くクリックされたユーザーのトップ 10 を計算するクエリを使用します。

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

応答は次のとおりです: <a name="query-on-url-slow" />

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
```


10 行が取得されました。経過時間: 0.086 秒。

# highlight-next-line

8.81百万行を処理、
799.69 MB（102.11百万行/秒、9.27 GB/秒）

```

クライアント出力は、[URL列が複合主キーの一部である](#a-table-with-a-primary-key)にもかかわらず、ClickHouseがほぼフルテーブルスキャンを実行したことを示しています!ClickHouseはテーブルの887万行中881万行を読み取りました。
```


[trace&#95;logging](/operations/server-configuration-parameters/settings#logger) が有効になっている場合、ClickHouse サーバーログファイルには、ClickHouse が URL インデックスマーク 1083 個に対して <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">汎用的な除外探索</a> を実行し、URL 列の値が &quot;[http://public&#95;search](http://public\&#95;search)&quot; である行を含んでいる可能性のあるグラニュールを特定したことが記録されます。

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

上記のサンプルトレースログから、1083 個の granule のうち 1076 個が（マークを通じて）該当する URL 値を含んでいる可能性があるものとして選択されていることが分かります。

その結果として、実際に URL 値 &quot;[http://public&#95;search](http://public\&#95;search)&quot; を含む行を特定するために、8.81 百万行が（10 本のストリームを用いて並列に）ClickHouse エンジンへストリーミングされます。

しかし、後で見るように、選択された 1076 個の granule のうち、実際に一致する行を含んでいる granule は 39 個だけです。

複合主キー (UserID, URL) に基づくプライマリインデックスは、特定の UserID 値で行をフィルタリングするクエリを高速化するうえでは非常に有用でしたが、特定の URL 値で行をフィルタリングするクエリを高速化するうえでは、インデックスはそれほど大きな効果を発揮していません。

その理由は、URL カラムが先頭のキー列ではないため、ClickHouse は URL カラムのインデックスマークに対して二分探索ではなく汎用除外検索アルゴリズムを使用しており、**このアルゴリズムの有効性は、URL カラムと、その直前のキー列である UserID とのカーディナリティの差に依存する** ためです。

これを説明するために、汎用除外検索がどのように機能するかの詳細を示します。

<a name="generic-exclusion-search-algorithm" />

### 汎用除外検索アルゴリズム

以下では、直前のキー列のカーディナリティが低い（または高い）場合に、副次カラム経由で granule が選択されるときの、<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank">ClickHouse 汎用除外検索アルゴリズム</a>の動作を説明します。

両方のケースの例として、次の前提を置きます:

* URL 値 = &quot;W3&quot; を持つ行を検索するクエリである。
* UserID と URL の値を簡略化した、hits テーブルの抽象版である。
* インデックスには同じ複合主キー (UserID, URL) を使用する。これは、行がまず UserID 値でソートされ、同じ UserID 値を持つ行は URL でソートされることを意味する。
* granule サイズは 2、すなわち各 granule には 2 行が含まれる。

以下の図では、各 granule の最初のテーブル行に対するキー列の値をオレンジ色でマークしています。

**直前のキー列のカーディナリティが低い場合**<a name="generic-exclusion-search-fast" />

UserID のカーディナリティが低いと仮定します。この場合、同じ UserID 値が複数のテーブル行および granule、ひいてはインデックスマークにまたがって出現する可能性が高くなります。同じ UserID を持つインデックスマークについては（テーブル行がまず UserID、次に URL でソートされているため）、インデックスマークの URL 値は昇順に並びます。これにより、以下のように効率的なフィルタリングが可能になります:

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white" />

上の図にある抽象的なサンプルデータについて、granule 選択プロセスには 3 つの異なるシナリオがあります:

1. **URL 値が W3 より小さく、かつ、直後のインデックスマークの URL 値も W3 より小さい** インデックスマーク 0 は除外できます。これは、マーク 0 と 1 が同じ UserID 値を持つためです。この除外条件により、granule 0 が U1 の UserID 値だけで構成されていることが保証されるため、ClickHouse は granule 0 における最大 URL 値も W3 より小さいとみなして granule を除外できます。


2. **URL 値が W3 より小さい（または等しい）かつ、その直後のインデックスマークの URL 値が W3 より大きい（または等しい）** インデックスマーク 1 が選択されます。これは、グラニュール 1 が URL W3 を持つ行を含んでいる可能性があることを意味します。

3. **URL 値が W3 より大きい** インデックスマーク 2 と 3 は除外できます。なぜなら、主キーインデックスのインデックスマークは各グラニュールにおける最初のテーブル行のキー列値を保持しており、テーブル行はキー列値でディスク上にソートされているため、グラニュール 2 と 3 が URL 値 W3 を含んでいる可能性はないからです。

**先行キー列のカーディナリティが高い（またはより高い）場合**<a name="generic-exclusion-search-slow" />

UserID のカーディナリティが高い場合、同じ UserID 値が複数のテーブル行やグラニュールにまたがって出現する可能性は低くなります。これは、インデックスマークの URL 値が単調増加にならないことを意味します。

<Image img={sparsePrimaryIndexes08} size="md" alt="疎なプライマリインデックス 06" background="white" />

上の図から分かるように、図に示されたうち URL 値が W3 より小さいすべてのマークは、その関連グラニュールの行を ClickHouse エンジンにストリーミングするために選択されています。

これは、図中のすべてのインデックスマークが前述のシナリオ 1 に該当してはいるものの、*直後のインデックスマークが現在のマークと同じ UserID 値を持つ* という除外の前提条件を満たしておらず、そのため除外できないからです。

例えば、**URL 値が W3 より小さく、かつ直後のインデックスマークの URL 値も W3 より小さい** インデックスマーク 0 を考えてみます。これは、直後のインデックスマーク 1 が現在のマーク 0 と同じ UserID 値を *持っていない* ため、*除外できません*。

この結果、ClickHouse はグラニュール 0 における URL の最大値について仮定を置くことができなくなります。代わりに、グラニュール 0 が URL 値 W3 を持つ行を含んでいる可能性があると見なさなければならず、マーク 0 を選択せざるを得ません。

同じシナリオはマーク 1、2、および 3 にも当てはまります。

:::note 結論
ClickHouse が、クエリが複合キーの一部であるが先頭ではない列でフィルタリングしている場合に、<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索アルゴリズム</a> の代わりに使用している <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">汎用除外検索アルゴリズム</a> は、先行キー列のカーディナリティが低い（またはより低い）場合に最も効果的です。
:::

このサンプルデータセットでは、両方のキー列（UserID, URL）のカーディナリティが同様に高く、前述のとおり、URL 列の先行キー列のカーディナリティが高い（または同程度に高い）場合、汎用除外検索アルゴリズムはあまり効果的ではありません。

### データスキッピングインデックスに関する注意

UserID と URL のカーディナリティが同様に高いため、[URL でフィルタリングするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) は、[複合主キー (UserID, URL) を持つテーブル](#a-table-with-a-primary-key) の URL 列に対して [セカンダリのデータスキッピングインデックス](./skipping-indexes.md) を作成しても、あまり恩恵を受けられません。

例えば、次の 2 つのステートメントは、テーブルの URL 列に対して [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) データスキッピングインデックスを作成し、データを投入します。

```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```

ClickHouse は、連続する 4 つの[グラニュール](#data-is-organized-into-granules-for-parallel-data-processing)ごとに（上記の `ALTER TABLE` 文中の `GRANULARITY 4` 句に注目）最小および最大の URL 値を保持する追加のインデックスを作成しました。

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white" />

最初のインデックスエントリ（上の図の「mark 0」）は、[テーブル内の最初の 4 つのグラニュールに属する行](#data-is-organized-into-granules-for-parallel-data-processing)に対する最小および最大の URL 値を保持しています。


2 番目のインデックスエントリ（&#39;mark 1&#39;）には、テーブルの次の 4 つのグラニュールに属する行の URL の最小値と最大値が格納されており、その後も同様に続きます。

（ClickHouse は、[インデックスマークに関連付けられたグラニュールのグループを特定](#mark-files-are-used-for-locating-granules)するためのデータスキップインデックス向けに、特別な [マークファイル](#mark-files-are-used-for-locating-granules) も作成しました。）

UserID と URL のカーディナリティが同様に高いため、この二次的なデータスキップインデックスは、[URL でフィルタリングするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) が実行されたときに、選択対象からグラニュールを除外するのには役立ちません。

クエリが探している特定の URL 値（つまり &#39;[http://public&#95;search&#39;）は、各グラニュールグループに対してインデックスに保存されている最小値と最大値の間に存在する可能性が非常に高く、その結果、ClickHouse](http://public\&#95;search\&#39;）は、各グラニュールグループに対してインデックスに保存されている最小値と最大値の間に存在する可能性が非常に高く、その結果、ClickHouse) はそのグラニュールグループを選択せざるを得なくなります（クエリに一致する行が含まれている可能性があるためです）。

### 複数のプライマリインデックスを使う必要性

その結果、特定の URL を持つ行をフィルタリングするサンプルクエリを大幅に高速化したい場合、そのクエリに最適化されたプライマリインデックスを使用する必要があります。

さらに、特定の UserID を持つ行をフィルタリングするサンプルクエリの良好なパフォーマンスも維持したい場合は、複数のプライマリインデックスを使用する必要があります。

以下では、それを実現する方法を示します。

<a name="multiple-primary-indexes" />

### 追加のプライマリインデックスを作成するためのオプション

特定の UserID を持つ行をフィルタリングするクエリと、特定の URL を持つ行をフィルタリングするクエリという 2 つのサンプルクエリの両方を大幅に高速化したい場合は、次の 3 つのオプションのいずれかを使って複数のプライマリインデックスを使用する必要があります。

* 異なるプライマリキーを持つ **2 つ目のテーブル** を作成する。
* 既存テーブル上に **マテリアライズドビュー** を作成する。
* 既存テーブルに **projection（プロジェクション）** を追加する。

これら 3 つのオプションはいずれも、テーブルのプライマリインデックスと行のソート順を再構成するために、サンプルデータを追加テーブルに実質的に複製します。

ただし、この 3 つのオプションは、クエリおよび INSERT 文のルーティングという観点から、その追加テーブルがユーザーに対してどの程度透過的であるかが異なります。

異なるプライマリキーを持つ **2 つ目のテーブル** を作成する場合、クエリはクエリに最も適したテーブルバージョンに明示的に送る必要があり、新しいデータはテーブルを同期状態に保つために両方のテーブルへ明示的に INSERT しなければなりません。

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white" />

With a **materialized view** the additional table is implicitly created and data is automatically kept in sync between both tables:

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white" />

そして **projection（プロジェクション）** は最も透過的なオプションであり、暗黙的に作成され（かつ非表示である）追加テーブルをデータ変更と自動的に同期させるだけでなく、ClickHouse がクエリに対して最も効果的なテーブルバージョンを自動的に選択します。

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white" />

In the following we discuss this three options for creating and using multiple primary indexes in more detail and with real examples.

<a name="multiple-primary-indexes-via-secondary-tables" />

### オプション 1: セカンダリテーブル

<a name="secondary-table" />

新しい追加テーブルを作成し、そのプライマリキーにおいて（元のテーブルと比較して）キー列の順序を入れ替えます。

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

元の[テーブル](#a-table-with-a-primary-key)の 887 万行すべてを、この追加テーブルに挿入します。

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
```

レスポンスは次のとおりです。

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

最後に、テーブルを最適化します。

```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```


主キーの列の順序を入れ替えたことで、挿入された行は（[元のテーブル](#a-table-with-a-primary-key) と比較して）ディスク上では異なる辞書順で保存されるようになりました。その結果、このテーブルの 1083 個の granule も、以前とは異なる値を含むようになっています。

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white" />

これが、その結果として得られる主キーです。

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white" />

これを利用することで、URL 列でフィルタリングするサンプルクエリの実行を大幅に高速化し、URL &quot;[http://public&#95;search](http://public\&#95;search)&quot; を最も頻繁にクリックしたユーザー上位 10 名を求めることができます。

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
```


10 行がセットに含まれます。経過時間: 0.017 秒。

# highlight-next-line

319.49 千行を処理しました。
11.38 MB (18.41 百万行/秒, 655.75 MB/秒)

```

これにより、[ほぼフルテーブルスキャンを実行する](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns)代わりに、ClickHouseはクエリをはるかに効率的に実行しました。

UserIDが第1キー列、URLが第2キー列である[元のテーブル](#a-table-with-a-primary-key)のプライマリインデックスでは、ClickHouseはクエリ実行のためにインデックスマークに対して[汎用除外検索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)を使用しましたが、UserIDとURLのカーディナリティがともに高いため、効率的ではありませんでした。
```


プライマリインデックスの最初のカラムとしてURLを配置することで、ClickHouseはインデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索</a>を実行するようになります。
ClickHouseサーバーログファイル内の対応するトレースログで、これが確認できます:

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

ClickHouseは、汎用除外検索が使用された場合の1076個ではなく、わずか39個のインデックスマークのみを選択しました。

この追加テーブルは、URLでフィルタリングする例示クエリの実行を高速化するために最適化されている点に注意してください。

[元のテーブル](#a-table-with-a-primary-key)でのそのクエリの[低いパフォーマンス](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)と同様に、[`UserIDs`でフィルタリングする例示クエリ](#the-primary-index-is-used-for-selecting-granules)は、この新しい追加テーブルでは効果的に実行されません。これは、UserIDがこのテーブルのプライマリインデックスにおいて第2キーカラムとなっており、そのためClickHouseはグラニュール選択に汎用除外検索を使用することになるためです。この方法は、UserIDとURLの同様に高いカーディナリティに対して[あまり効果的ではありません](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。
詳細については、詳細ボックスを開いてください。

<details>
    <summary>
    UserIDでフィルタリングするクエリのパフォーマンスが低下<a name="query-on-userid-slow"></a>
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

応答は次のとおりです:

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

```


10 行が返されました。経過時間: 0.024 秒。

# highlight-next-line

8.02 百万行を処理し、
73.04 MB（340.26 百万行/秒、3.10 GB/秒）。

```
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

これで2つのテーブルが作成されました。それぞれ、`UserIDs` でフィルタリングするクエリの高速化と、URL でフィルタリングするクエリの高速化に最適化されています:

### オプション2: マテリアライズドビュー {#option-2-materialized-views}

既存のテーブルに[マテリアライズドビュー](/sql-reference/statements/create/view.md)を作成します。

```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

レスポンスは次のようになります:

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note

- ビューのプライマリキーでは、([元のテーブル](#a-table-with-a-primary-key)と比較して)キー列の順序を入れ替えています
- マテリアライズドビューは、指定されたプライマリキー定義に基づいて行順序とプライマリインデックスが決定される**暗黙的に作成されたテーブル**によって支えられています
- 暗黙的に作成されたテーブルは `SHOW TABLES` クエリで一覧表示され、`.inner` で始まる名前を持ちます
- マテリアライズドビューの裏付けテーブルを最初に明示的に作成し、その後ビューが `TO [db].[table]` [句](/sql-reference/statements/create/view.md)を介してそのテーブルをターゲットにすることも可能です
- `POPULATE` キーワードを使用して、ソーステーブル [hits_UserID_URL](#a-table-with-a-primary-key) から全 887 万行を暗黙的に作成されたテーブルに即座に投入します
- ソーステーブル hits_UserID_URL に新しい行が挿入されると、それらの行は自動的に暗黙的に作成されたテーブルにも挿入されます
- 実質的に、暗黙的に作成されたテーブルは、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と同じ行順序とプライマリインデックスを持ちます:

<Image
  img={sparsePrimaryIndexes12b1}
  size='md'
  alt='Sparse Primary Indices 12b1'
  background='white'
/>

ClickHouse は、暗黙的に作成されたテーブルの[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) (_.bin)、[マークファイル](#mark-files-are-used-for-locating-granules) (_.mrk2)、および[プライマリインデックス](#the-primary-index-has-one-entry-per-granule) (primary.idx) を、ClickHouse サーバーのデータディレクトリ内の特別なフォルダに保存します:

<Image
  img={sparsePrimaryIndexes12b2}
  size='md'
  alt='Sparse Primary Indices 12b2'
  background='white'
/>

:::

マテリアライズドビューを支える暗黙的に作成されたテーブル(とそのプライマリインデックス)を使用して、URL 列でフィルタリングする例示クエリの実行を大幅に高速化できるようになりました:

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のとおりです:

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

```


10 行が返されました。経過時間: 0.026 秒。

# highlight-next-line

335.87 千行を処理しました,
13.54 MB（12.91 百万行/秒、520.38 MB/秒）。

```

マテリアライズドビューの基盤となる暗黙的に作成されたテーブル(およびそのプライマリインデックス)は、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と実質的に同一であるため、クエリは明示的に作成したテーブルと同様に効率的に実行されます。

ClickHouseサーバーログファイル内の対応するトレースログにより、ClickHouseがインデックスマーク上でバイナリサーチを実行していることが確認できます:
```


```response
...Executor): キー条件: (column 0 in ['http://public_search',
                                           'http://public_search'])
# highlight-next-line
...Executor): インデックス範囲で二分探索を実行中...
...
...Executor): パーティションキーで4/4パーツを選択、プライマリキーで4パーツ、
# highlight-next-line
              プライマリキーで41/1083マーク、4範囲から読み取る41マーク
...Executor): 4ストリームで約335872行を読み取り中
```

### オプション 3：プロジェクション

既存のテーブルにプロジェクションを作成します。

```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

続いて、プロジェクションをマテリアライズします:

```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note

* プロジェクションは、指定された `ORDER BY` 句に基づく行順序とプライマリインデックスを持つ **隠しテーブル** を作成します
* 隠しテーブルは `SHOW TABLES` クエリで一覧表示されません
* `MATERIALIZE` キーワードを使用することで、ソーステーブル [hits&#95;UserID&#95;URL](#a-table-with-a-primary-key) から 887 万行すべてを即座に隠しテーブルに書き込みます
* 新しい行がソーステーブル hits&#95;UserID&#95;URL に挿入されると、それらの行も自動的に隠しテーブルに挿入されます
* クエリは常に構文上はソーステーブル hits&#95;UserID&#95;URL を対象としますが、隠しテーブルの行順序とプライマリインデックスによってより効率的にクエリを実行できる場合には、その隠しテーブルが代わりに使用されます
* プロジェクションは、たとえ ORDER BY がプロジェクションの ORDER BY 句と一致していても、ORDER BY を使用するクエリを高速化しないことに注意してください（[https://github.com/ClickHouse/ClickHouse/issues/47333](https://github.com/ClickHouse/ClickHouse/issues/47333) を参照）
* 実質的に、暗黙的に作成される隠しテーブルは、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) と同じ行順序およびプライマリインデックスを持ちます:

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white" />

ClickHouse は、隠しテーブルの [カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules) (*.mrk2)、および [プライマリインデックス](#the-primary-index-has-one-entry-per-granule) (primary.idx) を、ソーステーブルのデータファイル、マークファイル、およびプライマリインデックスファイルと並んで配置された特別なフォルダ（下のスクリーンショットでオレンジ色で示されている）内に保存します:

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white" />

:::

プロジェクションによって作成された隠しテーブル（およびそのプライマリインデックス）は、これで URL カラムをフィルタする例のクエリの実行を大幅に高速化するために（暗黙的に）使用できるようになりました。クエリは構文上はプロジェクションのソーステーブルを対象としていることに注意してください。

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
```


10 行が返されました。経過時間: 0.029 秒。

# highlight-next-line

319.49 千行を処理しました、
1.38 MB（11.05 百万行/秒、393.58 MB/秒）

```

プロジェクションによって作成される隠しテーブル(およびそのプライマリインデックス)は、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と実質的に同一であるため、クエリは明示的に作成したテーブルと同様に効率的に実行されます。

ClickHouseサーバーログファイル内の対応するトレースログにより、ClickHouseがインデックスマークに対してバイナリサーチを実行していることが確認できます:
```


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

### まとめ

[複合主キー (UserID, URL) を持つテーブル](#a-table-with-a-primary-key) のプライマリインデックスは、[UserID でフィルタするクエリ](#the-primary-index-is-used-for-selecting-granules) の高速化には非常に有効でした。しかし、そのインデックスは、URL 列も複合主キーの一部であるにもかかわらず、[URL でフィルタするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) の高速化にはあまり貢献していません。

逆も成り立ちます。
[複合主キー (URL, UserID) を持つテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) のプライマリインデックスは、[URL でフィルタするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) を高速化していましたが、[UserID でフィルタするクエリ](#the-primary-index-is-used-for-selecting-granules) にはあまり効果を発揮しませんでした。

主キー列 UserID と URL のカーディナリティが同程度に高いため、2 番目のキー列でフィルタするクエリは、[2 番目のキー列がインデックスに含まれていてもそれほど恩恵を受けません](#generic-exclusion-search-algorithm)。

したがって、プライマリインデックスから 2 番目のキー列を削除する（インデックスのメモリ消費を削減できる）ことや、代わりに[複数のプライマリインデックスを使用する](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes)ことは妥当です。

一方で、複合主キー内のキー列のカーディナリティに大きな差がある場合は、プライマリキー列をカーディナリティの小さい順に並べることで、[クエリ性能の向上につながります](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。

キー列間のカーディナリティの差が大きいほど、キー内での列の順序がより重要になります。次のセクションでそれを説明します。


## キー列の順序付けを効率化する

<a name="test" />

複合主キーでは、キー列の並び順は次の両方に大きな影響を与える可能性があります。

* クエリにおける、他のキー列でのフィルタリング効率
* テーブルのデータファイルに対する圧縮率

これを示すために、[Web トラフィックのサンプルデータセット](#data-set) の一種を使用します。このデータでは、各行に、インターネット「ユーザー」（`UserID` 列）による URL（`URL` 列）へのアクセスがボットトラフィックとしてマークされたかどうか（`IsRobot` 列）を示す 3 つの列が含まれています。

ここでは、典型的な Web 分析クエリを高速化するために使用できる、上記 3 つの列すべてを含む複合主キーを使用します。これらのクエリでは、次のような計算を行います。

* 特定の URL へのトラフィックのうち、どれくらい（何パーセント）がボットによるものか
* 特定のユーザーがボットである（ない）とどれだけ確信できるか（そのユーザーからのトラフィックのうち、どれくらいの割合がボットトラフィックであると（ないと）想定されるか）

複合主キーとして使用したい 3 つの列のカーディナリティを計算するために、次のクエリを使用します（ローカルテーブルを作成せずに TSV データをアドホックにクエリするために、[URL table function](/sql-reference/table-functions/url.md) を使用している点に注意してください）。このクエリを `clickhouse client` で実行します。

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
│ 239万           │ 11万9080           │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1行を取得しました。経過時間: 118.334秒。処理: 887万行、15.88 GB (74,990行/秒、134.21 MB/秒)
```

`URL` 列と `IsRobot` 列の間には、特にカーディナリティに大きな差があることがわかります。そのため、複合主キー内でのこれらの列の並び順は、それらの列でフィルタリングするクエリを効率的に高速化するためにも、テーブルのカラムデータファイルに対して最適な圧縮率を達成するためにも重要です。

このことを示すために、ボットトラフィック分析データに対して 2 種類のテーブルを作成します。

* 複合主キー `(URL, UserID, IsRobot)` を持つテーブル `hits_URL_UserID_IsRobot`。ここではキーカラムをカーディナリティの降順で並べます
* 複合主キー `(IsRobot, UserID, URL)` を持つテーブル `hits_IsRobot_UserID_URL`。ここではキーカラムをカーディナリティの昇順で並べます

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

そして、887万行のデータを投入します：

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
0 rows in set. 経過時間: 104.729秒 処理: 887万行、15.88 GB (84.73千行/秒、151.64 MB/秒)
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

そして、前のテーブルと同じ 887 万行のデータをこのテーブルにも投入します。


```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```

レスポンスは以下のとおりです:

```response
0 rows in set. 経過時間: 95.959秒 処理: 887万行、15.88 GB (92.48千行/秒、165.50 MB/秒)
```

### セカンダリキー列での効率的なフィルタリング

クエリが複合キーを構成する列のうち、先頭のキー列である少なくとも 1 つの列を対象にフィルタリングしている場合、[ClickHouse はそのキー列のインデックスマークに対して二分探索アルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

クエリが、複合キーの一部ではあるが先頭のキー列ではない列「のみ」を対象にフィルタリングしている場合、[ClickHouse はそのキー列のインデックスマークに対して汎用除外検索アルゴリズムを使用します](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

2 つ目のケースでは、複合主キー内でのキー列の並び順が、[汎用除外検索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)の有効性にとって重要になります。

次のクエリは、キー列 `(URL, UserID, IsRobot)` をカーディナリティの降順で並べたテーブルに対して、`UserID` 列でフィルタリングを行っています。

```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```

レスポンスは次のとおりです:

```response
┌─count()─┐
│      73 │
└─────────┘
```


1 行の結果。経過時間: 0.026秒。

# highlight-next-line

792 万行を処理しました、
31.67 MB（306.90 百万行/秒、1.23 GB/秒）

````

これは、キー列 `(IsRobot, UserID, URL)` をカーディナリティの昇順で並べ替えたテーブルに対する同じクエリです:
```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
````

レスポンスは以下のとおりです：

```response
┌─count()─┐
│      73 │
└─────────┘
```


1 行が結果セットに含まれます。経過時間: 0.003 秒。

# highlight-next-line

20.32 千行を処理しました。
81.28 KB (6.61 百万行/秒、26.44 MB/秒)。

````

キー列をカーディナリティの昇順で並べたテーブルでは、クエリの実行が大幅に効率的かつ高速であることがわかります。

その理由は、[汎用除外検索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)が最も効果的に機能するのは、先行するキー列のカーディナリティが低い場合に、セカンダリキー列を介して[グラニュール](#the-primary-index-is-used-for-selecting-granules)が選択されるときだからです。これについては、本ガイドの[前のセクション](#generic-exclusion-search-algorithm)で詳しく説明しました。

### データファイルの最適な圧縮率 {#optimal-compression-ratio-of-data-files}

このクエリは、上記で作成した2つのテーブル間で`UserID`列の圧縮率を比較します。

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
````

応答は次のとおりです：

```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2行のセット。経過時間: 0.006秒
```

`UserID` カラムの圧縮率は、キー列をカーディナリティの昇順で `(IsRobot, UserID, URL)` のように並べたテーブルの方が、明らかに高いことがわかります。

両方のテーブルにはまったく同じデータが格納されています（どちらのテーブルにも 887 万行を挿入しました）が、複合主キーにおけるキー列の順序は、テーブル内のデータが <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a> されて [カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) に保存される際に必要なディスク容量に、大きな影響を与えます。

* 複合主キー `(URL, UserID, IsRobot)` を持ち、キー列をカーディナリティの降順で並べたテーブル `hits_URL_UserID_IsRobot` では、`UserID.bin` データファイルは **11.24 MiB** のディスク容量を使用します
* 複合主キー `(IsRobot, UserID, URL)` を持ち、キー列をカーディナリティの昇順で並べたテーブル `hits_IsRobot_UserID_URL` では、`UserID.bin` データファイルはわずか **877.47 KiB** のディスク容量しか使用しません

テーブルのカラムデータがディスク上で高い圧縮率で保存されていると、ディスク容量を節約できるだけでなく、そのカラムからデータを読み込む必要があるクエリ（特に分析クエリ）も高速になります。カラムのデータをディスクからメインメモリ（OS のファイルキャッシュ）へ移動するために必要な I/O が少なくて済むためです。

以下では、テーブルのカラムの圧縮率を高めるうえで、主キーのカラムをカーディナリティの昇順で並べることが有利になる理由を説明します。

次の図は、キー列がカーディナリティの昇順で並べられている主キーに対して、行がディスク上でどのような順序で並ぶかの概略を示したものです。

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white" />

[テーブルの行データは、主キーのカラム順にディスク上へ保存される](#data-is-stored-on-disk-ordered-by-primary-key-columns) ことについて、これまでに説明しました。


上の図では、テーブルの行（ディスク上の各列の値）はまず `cl` の値で並べられ、同じ `cl` 値を持つ行は `ch` の値で並べられています。また、最初のキー列 `cl` のカーディナリティが低いため、同じ `cl` 値を持つ行が存在する可能性が高くなります。その結果として、`ch` の値も（同じ `cl` 値を持つ行という局所的な範囲では）並んだ状態になっている可能性が高くなります。

1 つのカラムの中で、類似したデータが互いに近く（たとえばソートによって）配置されている場合、そのデータはより高い圧縮率で圧縮されます。
一般に、圧縮アルゴリズムはデータの連続長（同種のデータが長く続くほど圧縮に有利）と局所性（データ同士が似ているほど圧縮率が向上する）から恩恵を受けます。

上の図とは対照的に、下の図は、キー列がカーディナリティの降順で並べられているプライマリキーに対して、行がディスク上でどのような順序で格納されるかを模式的に示しています。

<Image img={sparsePrimaryIndexes14b} size="md" alt="疎なプライマリインデックス 14b" background="white"/>

ここではテーブルの行はまず `ch` の値で並べられ、同じ `ch` 値を持つ行は `cl` の値で並べられています。
しかし、最初のキー列である `ch` のカーディナリティが高いため、同じ `ch` 値を持つ行が存在する可能性は低くなります。その結果として、`cl` の値が（同じ `ch` 値を持つ行という局所的な範囲でさえも）並んだ状態になっている可能性も低くなります。

したがって、`cl` の値はほとんどランダムな順序になっていると考えられ、その結果、局所性と圧縮率の両方が悪化します。

### まとめ {#summary-1}

クエリでのセカンダリキー列に対する効率的なフィルタリングと、テーブルのカラムデータファイルの圧縮率の両方の観点から、プライマリキー内の列はカーディナリティの昇順で並べることが有利です。



## 単一行を効率的に特定する {#identifying-single-rows-efficiently}

一般的には ClickHouse の[最適なユースケースではない](/knowledgebase/key-value)ものの、
ClickHouse 上に構築されたアプリケーションが、ClickHouse テーブル内の単一行を特定する必要がある場合があります。

そのための直感的な解決策としては、各行ごとに一意な値を持つ [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 列を用意し、その列をプライマリキー列として使って行を高速に取得する、というものが考えられます。

もっとも高速に取得するには、UUID 列は[最初のキー列である必要があります](#the-primary-index-is-used-for-selecting-granules)。

すでに説明したように、[ClickHouse テーブルの行データはプライマリキー列でソートされた状態でディスクに保存される](#data-is-stored-on-disk-ordered-by-primary-key-columns)ため、プライマリキー、あるいは複合プライマリキーにおいて、非常に高いカーディナリティの列（UUID 列など）が低いカーディナリティの列より前にあると、[他のテーブル列の圧縮率に悪影響を与えます](#optimal-compression-ratio-of-data-files)。

最速の取得と最適なデータ圧縮率の折り合いをつける方法としては、複合プライマリキーを使用し、UUID を最後のキー列とし、その前に、いくつかのテーブル列の圧縮率を良好に保つために使われる、より低いカーディナリティのキー列を配置する、というものがあります。

### 具体例 {#a-concrete-example}

具体例として、Alexey Milovidov が開発し、[ブログで紹介した](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)プレーンテキストのペーストサービス [https://pastila.nl](https://pastila.nl) があります。

テキストエリアの内容が変更されるたびに、そのデータは自動的に ClickHouse テーブルの行として保存されます（変更 1 回につき 1 行）。

貼り付けた内容の特定のバージョンを識別して取得する 1 つの方法は、その内容のハッシュを、その内容を保持するテーブル行の UUID として使用することです。

次の図は、以下を示しています。
- コンテンツが変更されたときの行の挿入順序（たとえば、テキストエリアにテキストをタイプするキーストロークによる変更）と
- `PRIMARY KEY (hash)` を使用した場合に、挿入された行のデータがディスク上で並ぶ順序:

<Image img={sparsePrimaryIndexes15a} size="md" alt="スパースプライマリインデックス 15a" background="white"/>

`hash` 列がプライマリキー列として使用されているため、
- 特定の行を[非常に高速に](#the-primary-index-is-used-for-selecting-granules)取得できますが、
- テーブルの行（その列データ）は、（一意でランダムな）ハッシュ値に基づいて昇順でディスクに保存されます。そのため、content 列の値もデータ局所性のないランダムな順序で保存されることになり、その結果、**content 列のデータファイルの圧縮率が最適ではなくなります**。

content 列の圧縮率を大きく改善しつつ、特定の行を高速に取得できるようにするため、pastila.nl では特定の行を識別するために 2 つのハッシュ（および複合プライマリキー）を使用しています。
- 先ほど説明したように、異なるデータごとに異なる値となるコンテンツのハッシュと、
- 小さなデータ変更では**変化しない**[ローカリティセンシティブハッシュ（フィンガープリント）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)。

次の図は、以下を示しています。
- コンテンツが変更されたときの行の挿入順序（たとえば、テキストエリアにテキストをタイプするキーストロークによる変更）と
- 複合 `PRIMARY KEY (fingerprint, hash)` を使用した場合に、挿入された行のデータがディスク上で並ぶ順序:

<Image img={sparsePrimaryIndexes15b} size="md" alt="スパースプライマリインデックス 15b" background="white"/>

この場合、ディスク上の行はまず `fingerprint` によってソートされ、同じ fingerprint 値を持つ行の中では `hash` の値が最終的な順序を決定します。

小さな変更しかないデータは同じ fingerprint 値を持つため、類似したデータは content 列内でディスク上の近い位置に保存されるようになります。これは content 列の圧縮率にとって非常に有利であり、一般に圧縮アルゴリズムはデータ局所性（データがより類似しているほど圧縮率が向上する）から恩恵を受けるためです。

トレードオフとして、複合 `PRIMARY KEY (fingerprint, hash)` から得られるプライマリインデックスを最適に活用して特定の行を取得するには、2 つのフィールド（`fingerprint` と `hash`）が必要になります。
