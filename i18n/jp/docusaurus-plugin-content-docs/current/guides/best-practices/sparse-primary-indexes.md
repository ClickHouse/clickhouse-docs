---
sidebar_label: '主キーインデックス'
sidebar_position: 1
description: 'このガイドでは、ClickHouseのインデックスに詳しく入ります。'
title: 'ClickHouseにおける主キーインデックスの実践的な紹介'
slug: '/guides/best-practices/sparse-primary-indexes'
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



# ClickHouseにおける主キーインデックスの実用的な導入
## はじめに {#introduction}

このガイドでは、ClickHouseのインデックスについて詳しく掘り下げていきます。以下について詳細に説明し、議論します：
- [ClickHouseにおけるインデクシングが従来のリレーショナルデータベース管理システムとどのように異なるか](#an-index-design-for-massive-data-scales)
- [ClickHouseがテーブルのスパース主キーインデックスをどのように構築し使用しているか](#a-table-with-a-primary-key)
- [ClickHouseにおけるインデクシングのベストプラクティスは何か](#using-multiple-primary-indexes)

このガイドに記載されているすべてのClickHouse SQLステートメントとクエリを自分のマシンで実行することもできます。
ClickHouseのインストールと開始方法については、[クイックスタート](/quick-start.mdx)を参照してください。

:::note
このガイドはClickHouseのスパース主キーインデックスに焦点を当てています。

ClickHouseの[セカンダリーデータスキッピングインデックス](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)については、[チュートリアル](/guides/best-practices/skipping-indexes.md)を参照してください。
:::
### データセット {#data-set}

このガイドでは、サンプルの匿名化されたウェブトラフィックデータセットを使用します。

- サンプルデータセットから887万行（イベント）のサブセットを使用します。
- 圧縮されていないデータサイズは887万イベントで約700MBです。ClickHouseに保存すると圧縮後は200MBになります。
- サブセットの各行には、特定の時刻にURL（`URL`カラム）をクリックしたインターネットユーザー（`UserID`カラム）を示す3つのカラムがあります。

これら3つのカラムを使用して、次のような典型的なウェブ分析クエリをすでに策定できます：

- 「特定のユーザーにとって最もクリックされた上位10のURLは何ですか？」
- 「特定のURLを最も頻繁にクリックした上位10のユーザーは誰ですか？」
- 「ユーザーが特定のURLをクリックする際の最も人気のある時間（例えば、曜日）は何ですか？」
### テストマシン {#test-machine}

このドキュメントに示すすべての実行時間数値は、Apple M1 Proチップを搭載したMacBook Pro上でClickHouse 22.2.1をローカルで実行したものです。
### フルテーブルスキャン {#a-full-table-scan}

主キーなしでデータセット上でクエリがどのように実行されるかを見るために、次のSQL DDLステートメントを実行してテーブル（MergeTreeテーブルエンジンを使用）を作成します：

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

次に、次のSQL挿入ステートメントを使用して、ヒットデータセットのサブセットをテーブルに挿入します。
これは、クリックハウスのリモートホストにホストされているフルデータセットのサブセットをロードするために[URLテーブル関数](/sql-reference/table-functions/url.md)を使用します：

```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
応答は次のようになります：
```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```

ClickHouseクライアントの結果出力は、上記のステートメントがテーブルに887万行挿入されたことを示しています。

最後に、後の議論を簡素化し、図や結果を再現可能にするために、FINALキーワードを使用してテーブルを[最適化](/sql-reference/statements/optimize.md)します：

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
一般的には、データをロードした後にすぐにテーブルを最適化することは必要も推奨もされません。この例でこれが必要な理由は明らかになります。
:::

次に、最初のウェブ分析クエリを実行します。以下は、ユーザーID 749927693を持つインターネットユーザーのために最もクリックされた上位10のURLを計算します：

```sql
SELECT URL, count(URL) as Count
FROM hits_NoPrimaryKey
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

10 rows in set. Elapsed: 0.022 sec.

# highlight-next-line
Processed 8.87 million rows,
70.45 MB (398.53 million rows/s., 3.17 GB/s.)
```

ClickHouseクライアントの結果出力は、ClickHouseがフルテーブルスキャンを実行したことを示しています！私たちのテーブルの887万行の各行がClickHouseにストリームされました。これはスケールしません。

これを（大幅に）効率的かつ（はるかに）高速にするためには、適切な主キーを持つテーブルを使用する必要があります。これにより、ClickHouseは自動的に（主キーのカラムに基づいて）スパース主キーインデックスを作成し、それを使用して例のクエリの実行速度を大幅に向上させることができます。
### 関連コンテンツ {#related-content}
- ブログ: [ClickHouseのクエリを超高速化する](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## ClickHouseインデックス設計 {#clickhouse-index-design}
### 大規模データスケールのためのインデックス設計 {#an-index-design-for-massive-data-scales}

従来のリレーショナルデータベース管理システムでは、主インデックスにはテーブル行ごとに1つのエントリが含まれます。これにより、主インデックスには887万エントリが含まれることになります。このようなインデックスは特定の行を迅速に特定することができるため、ルックアップクエリやポイントアップデートに対して高い効率をもたらします。`B(+)-Tree`データ構造でエントリを検索する平均時間計算量は`O(log n)`です；より正確には、`log_b n = log_2 n / log_2 b`であり、ここで`b`は`B(+)-Tree`の分岐因子、`n`はインデックスされた行の数です。通常、`b`は数百から数千の間にあるため、`B(+)-Trees`は非常に浅い構造であり、レコードを特定するために必要なディスクシークは少数です。887万行と分岐因子が1000の場合、平均して2.3回のディスクシークが必要です。この能力にはコストが伴います：新しい行をテーブルに追加し、インデックスにエントリを追加する際の追加的なディスクおよびメモリーオーバーヘッド、挿入コストの増加、時にはB-Treeの再バランス。

B-Treeインデックスに関連する課題を考慮すると、ClickHouseのテーブルエンジンは異なるアプローチを利用しています。ClickHouseの[MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family/index.md)は、大量のデータボリュームを処理するために設計および最適化されています。これらのテーブルは、毎秒数百万の行挿入を受け取り、非常に大きな（100ペタバイト以上の）データボリュームを保存するように設計されています。データは、バックグラウンドで部分を結合するルールが適用されながら、テーブルに[部分ごとに](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)迅速に書き込まれます。ClickHouseでは、各部分にそれぞれの主インデックスがあります。部分がマージされると、マージされた部分の主インデックスもマージされます。ClickHouseが設計された非常に大きなスケールにおいて、ディスクとメモリーの効率が非常に重要です。したがって、すべての行をインデックスするのではなく、部分の主インデックスは行のグループ（「グラニュール」と呼ばれる）ごとに1つのインデックスエントリ（「マーク」と呼ばれる）を持ちます。このテクニックは**スパースインデックス**と呼ばれます。

スパースインデクシングが可能なのは、ClickHouseが部分の行を主キーのカラムに基づいてディスクに順序付けて保存しているためです。単一の行を直接特定する代わりに（B-Treeベースのインデックスのように）、スパース主インデックスはインデックスエントリのバイナリ検索を介して迅速に一致する可能性がある行のグループを特定できます。見つかった一致する可能性のある行のグループ（グラニュール）は、その後ClickHouseエンジンに並行してストリーミングされて一致を見つけます。このインデックス設計により、主インデックスは小さく（完全にメインメモリにフィットすることが可能であり、及びそれが必要です）、クエリ実行時間を大幅に短縮します：特にデータ分析のユースケースにおいて典型的な範囲クエリの場合に。

以下に、ClickHouseがスパース主インデックスを構築し使用する方法を詳しく示します。後のセクションでは、インデックスを構築するために使用されるテーブルカラム（主キーのカラム）の選択、削除、順序付けのベストプラクティスについて議論します。
### 主キーを持つテーブル {#a-table-with-a-primary-key}

UserIDとURLのキーカラムを持つ複合主キーのあるテーブルを作成します：

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

後の議論を簡素化し、図や結果を再現可能にするために、DDLステートメントは：

<ul>
  <li>
    <code>ORDER BY</code>句を介してテーブルの複合ソートキーを指定します。
  </li>
  <li>
    設定を通じて主インデックスが持つインデックスエントリの数を明示的に制御します：
    <ul>
      <li>
        <code>index_granularity</code>：デフォルト値の8192に明示的に設定されており、8192行ごとに1つのインデックスエントリを持つことを意味します。例えば、テーブルが16384行を持つ場合、インデックスは2つのインデックスエントリを持つことになります。
      </li>
      <li>
        <code>index_granularity_bytes</code>：<a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">適応インデックスグラニュラティ</a>を無効にするために0に設定されます。適応インデックスグラニュラティは、次のいずれかが真である場合にClickHouseがn行のグループごとに1つのインデックスエントリを自動的に作成することを意味します：
        <ul>
          <li>
            <code>n</code>が8192未満であり、その<code>n</code>行の結合された行データのサイズが10MB以上（<code>index_granularity_bytes</code>のデフォルト値）である場合。
          </li>
          <li>
            <code>n</code>行の結合されたデータサイズが10MB未満であるが、<code>n</code>が8192である場合。
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>：主インデックスの<a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">圧縮を無効にするために0に設定されており</a>、これにより後でオプションでコンテンツを検査できます。
      </li>
    </ul>
  </li>
</ul>

</p>
</details>


上記のDDLステートメントの主キーは、指定された2つのキーカラムに基づいて主インデックスを作成する原因となります。

<br/>
次にデータを挿入します：

```sql
INSERT INTO hits_UserID_URL SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
応答は次のようになります：
```response
0 rows in set. Elapsed: 149.432 sec. Processed 8.87 million rows, 18.40 GB (59.38 thousand rows/s., 123.16 MB/s.)
```


<br/>
テーブルを最適化します：

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br/>
次のクエリを使用してテーブルのメタデータを取得できます：

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

応答は次のようになります：

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

ClickHouseクライアントの出力は次のことを示しています:

- テーブルのデータは、ディスク上の特定のディレクトリに[広い形式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)で保存されており、そのディレクトリ内にはテーブルカラムごとに1つのデータファイル（および1つのマークファイル）があります。
- テーブルには887万行があります。
- すべての行の圧縮されていないデータサイズは733.28MBです。
- すべての行のディスク上の圧縮サイズは206.94MBです。
- テーブルには1083エントリ（「マーク」と呼ばれる）の主インデックスがあり、そのインデックスのサイズは96.93KBです。
- 合計で、テーブルのデータとマークファイル、および主インデックスファイルはディスク上で207.07MBを占めています。
### データは主キーのカラムによって順序付けられてディスクに保存される {#data-is-stored-on-disk-ordered-by-primary-key-columns}

上記で作成したテーブルは以下の特性を持っています：
- 複合[主キー](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)`と
- 複合[ソートキー](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`。

:::note
- もしソートキーのみを指定していた場合、主キーは暗黙的にソートキーと等しいと定義されます。
- メモリ効率を高めるために、クエリがフィルタリングするカラムのみを含む主キーを明示的に指定しました。主キーに基づく主インデックスは、完全にメインメモリにロードされています。
- ガイドの図や情報の一貫性を確保し、圧縮率を最適化するため、すべてのテーブルカラムを含む別のソートキーを定義しました（同じカラムに類似のデータが近接すればするほど、例えばソートを行うことで、データはより良く圧縮されます）。
- 両方が指定されている場合、主キーはソートキーのプレフィックスである必要があります。
:::

挿入された行は、主キーのカラム（およびソートキーの追加的な `EventTime` カラム）によって、ディスク上で辞書式順序（昇順）で保存されています。

:::note
ClickHouseは、同一の主キーのカラム値を持つ複数の行を挿入することを許可します。この場合（以下に図の行1と行2を参照）、最終的な順番は指定されたソートキーによって決まるため、`EventTime`カラムの値によって決まります。
:::

ClickHouseは<a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">列指向のデータベース管理システム</a>です。以下の図に示すように
- ディスク上の表現では、各テーブルカラムに対して1つのデータファイル（*.bin）があり、すべての値は<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a>された形式で保存され、
- 887万の行はディスク上で主キーのカラム（および追加のソートキーのカラム）によって辞書式昇順で保存されます。すなわち、この場合
  - 最初は `UserID`によって、
  - 次は `URL`によって、
  - 最後に `EventTime`によって：

<Image img={sparsePrimaryIndexes01} size="md" alt="Sparse Primary Indices 01" background="white"/>

`UserID.bin`、`URL.bin`、および `EventTime.bin` は、`UserID`、`URL`、および `EventTime`カラムの値が保存されるディスク上のデータファイルです。

:::note
- 主キーはディスク上の行の辞書式順序を定義するため、テーブルには1つの主キーしか持てません。
- 行を0から始まる番号付けしているのは、ClickHouseの内部行番号付けスキームと一致させ、ログメッセージにも使用されるためです。
:::
### データは並列データ処理のためにグラニュールに整理される {#data-is-organized-into-granules-for-parallel-data-processing}

データ処理の目的のために、テーブルのカラムの値は論理的にグラニュールに分割されます。
グラニュールはClickHouseにストリーミングされる最小の不可分なデータセットです。
これにより、数個の行を読み取るのではなく、ClickHouseは常に行のグループ（グラニュール）全体をストリーミング方式かつ並行して読み取ります。
:::note
カラムの値は物理的にグラニュール内に保存されるわけではありません：グラニュールはクエリ処理のためのカラム値の論理的な定義です。
:::

以下の図は、当テーブルの8.87百万行の（カラムの値）が、テーブルのDDLステートメントに`index_granularity`（デフォルト値の8192に設定）を含むことから、1083グラニュールに整理される様子を示しています。

<Image img={sparsePrimaryIndexes02} size="md" alt="Sparse Primary Indices 02" background="white"/>

最初の（物理的なディスク上の順序に基づく）8192行（そのカラムの値）は論理的にグラニュール0に属し、その後の8192行（そのカラムの値）はグラニュール1に属します。

:::note
- 最後のグラニュール（グラニュール1082）は、8192行未満を「含む」ことがあります。
- このガイドの冒頭で「DDLステートメントの詳細」において、私たちは[適応インデックスグラニュラティ](/whats-new/changelog/2019.md/#experimental-features-1)を無効にしたことに言及しました（ガイドの議論を簡素化し、図や結果を再現可能にするために）。
  
  したがって、私たちの例のテーブルのすべてのグラニュール（最後のものを除く）のサイズは同じです。

- 適応インデックスグラニュラティを持つテーブルの場合（index granularityは[デフォルトで適応的](/operations/settings/merge-tree-settings#index_granularity_bytes)であり）、一部のグラニュールのサイズは8192行より少なくなる場合があります。

- 私たちは主キーのカラム（`UserID`、`URL`）の一部のカラム値をオレンジでマーキングしています。
  これらのオレンジでマークされたカラム値は、各グラニュールの最初の行の主キーのカラム値になります。
  以下で見ていくように、これらのオレンジでマークされたカラム値はテーブルの主インデックスのエントリになります。

- グラニュールには0から番号を付けており、ClickHouseの内部の番号付けスキームと一致させ、ログメッセージにも使用されます。
:::
### 主インデックスはグラニュールごとに1つのエントリを持つ {#the-primary-index-has-one-entry-per-granule}

主インデックスは、上記の図に示すグラニュールに基づいて作成されます。このインデックスは圧縮されていないフラットな配列ファイル（primary.idx）であり、0から始まるいわゆる数値インデックスマークを含みます。

以下の図は、インデックスが各グラニュールの最初の行の主キーのカラム値（上記の図でオレンジでマークされた値）を保存していることを示しています。
言い換えれば：主インデックスは、テーブルのすべての8192行における主キーのカラム値を保存しています（物理的な行順序に基づいて主キーのカラムによって定義されます）。
例えば、
- 最初のインデックスエントリ（上の図で「マーク0」と呼ばれる）は、上の図でグラニュール0の最初の行のキーのカラム値を保存しています。
- 2番目のインデックスエントリ（上の図で「マーク1」と呼ばれる）は、上の図でグラニュール1の最初の行のキーのカラム値を保存しています、そして続きます。

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Sparse Primary Indices 03a" background="white"/>

私たちのテーブルには887万行と1083グラニュールがあるため、インデックスには合計1083エントリがあります：

<Image img={sparsePrimaryIndexes03b} size="md" alt="Sparse Primary Indices 03b" background="white"/>

:::note
- [適応インデックスグラニュラティ](/whats-new/changelog/2019.md/#experimental-features-1)を持つテーブルの場合、テーブルの最後の行の主キーのカラム値を記録する1つの「最終」の追加マークも主インデックスに保存されますが、適応インデックスグラニュラティを無効にしたため（このガイドの議論を簡素化し、図や結果を再現可能にするため）、私たちの例のテーブルのインデックスにはこの最終のマークは含まれていません。
  
- 主インデックスファイルは完全にメインメモリにロードされます。ファイルのサイズが利用可能な空きメモリのサイズを超える場合は、ClickHouseはエラーを発生させます。
:::

<details>
    <summary>
    主インデックスの内容を検査する
    </summary>
    <p>

セルフマネージドのClickHouseクラスタ上で、以下の手順を踏むことで、例のテーブルの主インデックスのコンテンツを調査するために<a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">fileテーブル関数</a>を使用できます。

そのために、まず、稼働中のクラスタのノードの<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a>に主インデックスファイルをコピーする必要があります：
<ul>
<li>ステップ1：主インデックスファイルを含む部分のパスを取得します</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

はテストマシン上で`/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`を返します。

<li>ステップ2：user_files_pathを取得します</li>
デフォルトのuser_files_pathは、Linuxでは
`/var/lib/clickhouse/user_files/`

であり、Linuxでは変更されたかどうかを確認できます：`$ grep user_files_path /etc/clickhouse-server/config.xml`

テストマシン上のパスは`/Users/tomschreiber/Clickhouse/user_files/`です。

<li>ステップ3：主インデックスファイルをuser_files_pathにコピーします</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

</ul>

<br/>
これで、SQLを介して主インデックスの内容を検査できます：
<ul>
<li>エントリの数を取得します</li>
`
SELECT count( )<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String');
`
は `1083` を返します。

<li>最初の2つのインデックスマークを取得します</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 0, 2;
`

は次のように返します：

`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`

<li>最後のインデックスマークを取得します</li>
`
SELECT UserID, URL FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
は
`
4292714039 │ http://sosyal-mansetleri...
`
と返します。
</ul>
<br/>
これは、私たちの例のテーブルの主インデックス内容の図と正確に一致します：
</p>
</details>

主キーエントリはインデックスマークと呼ばれます。なぜなら、各インデックスエントリが特定のデータ範囲の開始を示すためです。具体的には例のテーブルに関して：
- UserIDインデックスマーク：

  主インデックスに保存された`UserID`の値は昇順にソートされています。<br/>
  上記の図の「マーク1」は、グラニュール1のすべてのテーブル行の`UserID`の値、およびすべての後続のグラニュールの`UserID`の値が4.073.710以上であることを保証します。

 [後で確認するように](#the-primary-index-is-used-for-selecting-granules)、このグローバルな順序により、ClickHouseはクエリが主キーの最初のカラムでフィルタリングされるときにインデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">バイナリサーチアルゴリズムを使用することができる</a>からです。

- URLインデックスマーク：

  主キーのカラム`UserID`と`URL`の類似の基数により、一般的に主キーの最初のカラムの後に位置するすべてのキーカラムのインデックスマークは、前のキーのカラム値がグラニュール内のすべてのテーブル行で同じである限りデータ範囲を示します。<br/>
  例えば、上記の図でマーク0とマーク1のUserID値が異なるため、ClickHouseはグラニュール0内のすべてのテーブル行のURLの値が`'http://showtopics.html%3...'`以上であるとは仮定できません。しかし、上記の図でマーク0とマーク1のUserID値が同じであれば（すなわち、UserIDの値がグラニュール0内のすべてのテーブル行で同じであれば）、ClickHouseはグラニュール0内のすべてのテーブル行のURLの値が`'http://showtopics.html%3...'`以上であると仮定できたでしょう。

  これは、クエリ実行パフォーマンスに対しての影響について、後で詳しく説明します。
```
### 主キーはグラニュールを選択するために使用されます {#the-primary-index-is-used-for-selecting-granules}

現在、主キーのサポートを使用してクエリを実行できます。

次のクエリは、UserID 749927693 の上位 10 件のクリックされた URL を計算します。

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

返答は次のようになります：

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

10 行がセットにあります。経過時間: 0.005 秒。

# highlight-next-line
処理された行数: 8.19 千,
740.18 KB (1.53 百万行/s., 138.59 MB/s.)
```

ClickHouse クライアントの出力は、フルテーブルスキャンを実行する代わりに、8.19 千の行のみが ClickHouse にストリーミングされたことを示しています。

もし <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">トレースログ</a> が有効になっていると、ClickHouse サーバーログファイルは ClickHouse が 1083 の UserID インデックスマークに対して <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索</a> を実行して、`749927693` の UserID カラム値を持つ行を含んでいる可能性のあるグラニュールを特定したことを示しています。これには平均で `O(log2 n)` の時間計算量を必要とします：
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

上記のトレースログから、1083 の既存のマークのうち 1 つがクエリを満たしていることが分かります。

<details>
    <summary>
    トレースログの詳細
    </summary>
    <p>

マーク 176 が特定されました（「見つかった左境界マーク」は包含的で、「見つかった右境界マーク」は排他的です）、したがって、グラニュール 176 からのすべての 8192 行（これは行 1.441.792 から始まります - これは後でこのガイドで確認します）が ClickHouse にストリーミングされ、`749927693` の UserID カラム値を持つ実際の行が見つかります。
</p>
</details>

この例のクエリで <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN 句</a> を使用してこれを再現することもできます：
```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

返答は次のようになります：

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

16 行がセットにあります。経過時間: 0.003 秒。
```
クライアントの出力は、1083 のグラニュールのうち 1 つが UserID カラム値 749927693 を持つ行を含んでいる可能性があるとして選択されたことを示しています。

:::note 結論
クエリが複合キーの一部であり、最初のキー列であるカラムをフィルタリングする場合、ClickHouse はキー列のインデックスマークの上で二分探索アルゴリズムを実行します。
:::

<br/>

上記で述べたように、ClickHouse は自社のスパース主インデックスを使用して、クエリに一致する可能性のある行を含むグラニュールを迅速に（二分探索を介して）選択しています。

これは ClickHouse のクエリ実行の **第一段階（グラニュール選択）** です。

**第二段階（データ読み取り）** では、ClickHouse は選択したグラニュールを見つけて、それらのすべての行を ClickHouse エンジンにストリーミングして、クエリに実際に一致する行を見つけるために使用します。

この第二段階について、次のセクションで詳しく説明します。
### マークファイルはグラニュールを特定するために使用されます {#mark-files-are-used-for-locating-granules}

以下の図は、私たちのテーブルの主インデックスファイルの一部を示しています。

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white"/>

上記で述べたように、インデックスの 1083 の UserID マークに対する二分探索を通じて、マーク 176 が特定されました。したがって、対応するグラニュール 176 はおそらく UserID カラム値 749.927.693 を持つ行を含んでいる可能性があります。

<details>
    <summary>
    グラニュール選択の詳細
    </summary>
    <p>

上記の図は、マーク 176 が関連グラニュール 176 の最小 UserID 値が 749.927.693 より小さく、次のマーク（マーク 177）のグラニュール 177 の最小 UserID 値がこの値より大きいという最初のインデックスエントリであることを示しています。したがって、マーク 176 に対応するグラニュール 176 のみが UserID カラム値が 749.927.693 を持つ行を含んでいる可能性があります。
</p>
</details>

グラニュール 176 の中に UserID カラム値が 749.927.693 を持つ行が含まれているかどうかを確認するためには、このグラニュールに属するすべての 8192 行を ClickHouse にストリーミングする必要があります。

これを達成するために、ClickHouse はグラニュール 176 の物理的位置を知る必要があります。

ClickHouse では、テーブルのすべてのグラニュールの物理的位置がマークファイルに格納されています。データファイルと同様に、カラムごとに 1 つのマークファイルがあります。

以下の図は、テーブルの `UserID`、`URL`、および `EventTime` カラムのグラニュールの物理位置を保存している 3 つのマークファイル `UserID.mrk`、`URL.mrk`、および `EventTime.mrk` を示しています。

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white"/>

主インデックスが 0 から始まる番号を付けられたインデックスマークを含むフラットな未圧縮配列ファイル (primary.idx) であることを説明してきました。

同様に、マークファイルも 0 から始まる番号が付けられたマークを含むフラットな未圧縮配列ファイル (*.mrk) です。

ClickHouse がマッチする可能性のある行を含むグラニュールのインデックスマークを特定して選択した後、マークファイルにおいて位置配列のルックアップが実行され、そのグラニュールの物理位置を取得します。

特定のカラムの各マークファイルエントリは、オフセットの形式で 2 つの位置を保存しています。

- 最初のオフセット（上記の図の「block_offset」）は、選択されたグラニュールの圧縮バージョンを含む <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">ブロック</a> が、<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a>されたカラムデータファイルの中でどこにあるかを指し示しています。この圧縮ブロックは、おそらくいくつかの圧縮されたグラニュールを含んでいます。見つかった圧縮ファイルブロックは、読み込み時に主メモリに展開されます。

- マークファイルの 2 番目のオフセット（上記の図の「granule_offset」）は、非圧縮ブロックデータ内のグラニュールの位置を提供します。

その後、見つかった非圧縮グラニュールに属するすべての 8192 行が、さらなる処理のために ClickHouse にストリーミングされます。


:::note

- [ワイドフォーマット](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)のテーブルで、[適応インデックス粒度](/whats-new/changelog/2019.md/#experimental-features-1)がない場合、ClickHouse は上記のように視覚化された `.mrk` マークファイルを使用し、各エントリには 8 バイトのアドレスが 2 つ含まれています。これらのエントリは、同じサイズを持つすべてのグラニュールの物理位置です。

インデックス粒度は [デフォルトで適応式](/operations/settings/merge-tree-settings#index_granularity_bytes)ですが、例のために、適応インデックス粒度を無効にしました（このガイドでの議論を簡素化し、図や結果を再現しやすくするため）。私たちのテーブルは、データのサイズが [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) より大きいため、ワイドフォーマットを使用しています（これはセルフマネージドクラスターのデフォルトで 10 MB です）。

- ワイドフォーマットのテーブルで、適応インデックス粒度がある場合、ClickHouse は `.mrk2` マークファイルを使用し、`.mrk` マークファイルと似たエントリを持っていますが、各エントリに対して追加の 3 番目の値、すなわち現在のエントリに関連するグラニュールの行数があります。

- [コンパクトフォーマット](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)のテーブルでは、ClickHouse は `.mrk3` マークファイルを使用します。

:::


:::note マークファイルの理由

なぜ主インデックスは、インデックスマークに対応するグラニュールの物理位置を直接含まないのでしょうか？

ClickHouse が設計されている非常に大規模なスケールにおいては、非常にディスクおよびメモリ効率が良いことが重要です。

主インデックスファイルは主メモリに収まる必要があります。

私たちの例のクエリでは、ClickHouse は主インデックスを使用しておそらくマッチする行を含むことができる単一のグラニュールを選択しました。その単一のグラニュールのためにのみ、ClickHouse は対応する行をストリーミングするための物理位置が必要です。

さらに、このオフセット情報は、クエリに使用されていないカラム（例えば `EventTime`）には必要ありません。

サンプルクエリの場合、ClickHouse は UserID データファイル (UserID.bin) のグラニュール 176 の 2 つの物理位置オフセットと、URL データファイル (URL.bin) のグラニュール 176 の 2 つの物理位置オフセットのみが必要です。

マークファイルによって提供される間接性は、すべての 1083 グラニュールの物理位置のエントリを主インデックスの中に直接格納することを避けることで、メインメモリ内に不要な（使用されていない）データを持つことを回避します。
:::

以下の図とその後のテキストは、例のクエリのために ClickHouse が UserID.bin データファイル内のグラニュール 176 をどのように特定するかを示しています。

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

このガイドで以前に述べたように、ClickHouse は主インデックスマーク 176 を選択し、したがって私たちのクエリに一致する行を含む可能性のあるグラニュール 176 を選択しました。

ClickHouse は今、選択されたマーク番号 (176) を使用して、UserID.mrk マークファイル内で位置配列ルックアップを行って、グラニュール 176 の位置を特定するための 2 つのオフセットを取得します。

示されているように、最初のオフセットは、UserID.bin データファイル内でグラニュール 176 の圧縮ファイルブロックを特定しています。

見つかったファイルブロックが主メモリに展開されると、マークファイルからの 2 番目のオフセットを使って、非圧縮データ内のグラニュール 176 を特定できます。

ClickHouse は UserID.bin データファイルと URL.bin データファイルの両方からグラニュール 176 を特定し（すべての値をストリーミングする）、サンプルクエリ（UserID 749.927.693 のインターネットユーザーの上位 10 件のクリックされた URL）を実行する必要があります。

上記の図は、ClickHouse が UserID.bin データファイルのグラニュールを特定する方法を示しています。

並行して、ClickHouse は URL.bin データファイルのグラニュール 176 に対しても同様の処理を行います。対応する 2 つのグラニュールは整列して ClickHouse エンジンにストリーミングされ、UserID が 749.927.693 であるすべての行の URL 値をグループごとに集約およびカウントし、最終的に 10 の最大の URL グループを降順で出力します。
## 複数の主インデックスを使用する {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### 二次キー列は（非効率的）である可能性がある {#secondary-key-columns-can-not-be-inefficient}


クエリが複合キーの一部であり、最初のキー列であるカラムをフィルタリングしている場合、[ClickHouse はキー列のインデックスマークに対して二分探索アルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

しかし、クエリが複合キーの一部であるが最初のキー列ではないカラムをフィルタリングする場合に何が起こるでしょうか？

:::note
ここでは、クエリが最初のキー列ではなく、二次キー列でフィルタリングしているシナリオについて議論します。

クエリが最初のキー列とその後の任意のキー列でフィルタリングしている場合、ClickHouse は最初のキー列のインデックスマークに対して二分探索を実行します。
:::

<br/>
<br/>

<a name="query-on-url"></a>
次のクエリを使用して、最も頻繁に「http://public_search」の URL をクリックした上位 10 人のユーザーを計算します：

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

返答は次のとおりです： <a name="query-on-url-slow"></a>
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

10 行がセットにあります。経過時間: 0.086 秒。

# highlight-next-line
処理された行数: 8.81 百万,
799.69 MB (102.11 百万行/s., 9.27 GB/s.)
```

クライアント出力は、ClickHouse が複合主キーの一部である [URL カラム](#a-table-with-a-primary-key) に対してほぼフルテーブルスキャンを実行したことを示しています！ ClickHouse は 887 万行のテーブルから 881 万行を読み取ります。

もし [trace_logging](/operations/server-configuration-parameters/settings#logger) が有効になっている場合、ClickHouse サーバーログファイルは、ClickHouse が 1083 の URL インデックスマークに対して <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">一般的な除外検索</a> を使用して、「http://public_search」という URL カラム値を持つ行を含む可能性のあるグラニュールを特定したことを示しています：
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
上記のサンプルトレースログから、1076（マークによる）マークのうちの 1083 が、マッチする URL 値を持つ行を含んでいる可能性があるとして選択されたことがわかります。

その結果、ClickHouse エンジンのために 881 万行がストリーミングされ（10 ストリームを使用して並列で）、実際に「http://public_search」という URL 値が含まれている行を特定します。

しかし、後で見ますが、その選択した 1076 のグラニュールのうち、実際に一致する行を持つのは 39 のグラニュールだけです。

複合主キー（UserID、URL）に基づく主インデックスは、特定の UserID 値を持つ行のフィルタリングを迅速に行うためには非常に便利でしたが、特定の URL 値を持つ行のフィルタリングのクエリを迅速に行う際には大きな助けにはなっていません。

その理由は、URL カラムが最初のキー列ではないため、ClickHouse は URL カラムのインデックスマークに対して一般的な除外検索アルゴリズム（代わりに二分検索）を使用しており、**そのアルゴリズムの効果は、URL カラムとその前のキー列である UserID との間の基数の違いに依存します**。

これを説明するために、一般的な除外検索がどのように機能するかの詳細をいくつか示します。

<a name="generic-exclusion-search-algorithm"></a>
### 一般的な除外検索アルゴリズム {#generic-exclusion-search-algorithm}

以下は、<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank">ClickHouse の一般的な除外検索アルゴリズム</a>が、前のキー列が低いまたは高い基数を持つ二次列でグラニュールが選択されるときにどのように機能するかを示しています。

どちらのケースについても、次の仮定をします：
- URL 値 = "W3" の行を検索するクエリ。
- UserID および URL の簡略値を持つ抽象バージョンのヒットテーブル。
- インデックスの複合主キー（UserID、URL）。これは、行が最初に UserID 値で並べられ、同じ UserID 値を持つ行が URL で並べられていることを意味します。
- グラニュールサイズは 2 です。すなわち、各グラニュールには 2 行が含まれています。

以下の図では、各グラニュールの最初のテーブル行のキー列値をオレンジ色でマークしています。

**前のキー列が低い基数を持つ場合**<a name="generic-exclusion-search-fast"></a>

UserID に低い基数があると仮定してください。この場合、同じ UserID 値が複数のテーブル行およびグラニュール、したがってインデックスマークに広がっている可能性が高いです。同じ UserID のインデックスマークの URL 値は、昇順にソートされます（テーブル行は最初に UserID によって、次に URL で並べられるため）。これにより、効率的なフィルタリングが可能です。

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

上の図には、抽象的なサンプルデータに基づくグラニュール選択プロセスの 3 つの異なるシナリオが示されています：

1. **URL 値が W3 より小さく、次のインデックスマークの URL 値も W3 より小さいインデックスマーク 0** は、マーク 0 と 1 が同じ UserID 値を持っていますので除外できます。この除外前提条件により、グラニュール 0 はすべて U1 UserID 値で構成されていることが確認でき、ClickHouse はグラニュール 0 内の最大 URL 値も W3 より小さいと仮定し、グラニュールを除外できます。

2. **URL 値が W3 より小さい（または等しい）インデックスマーク 1 と直接後続のインデックスマークの URL 値が W3 より大きい（または等しい）場合は選択されます**。これはグラニュール 1 がおそらく URL W3 を含むことを意味します。

3. **URL 値が W3 より大きいインデックスマーク 2 および 3** は除外できます。なぜなら、プライマリインデックスのインデックスマークは、各グラニュールの最初のテーブル行のキー列値を保存しており、テーブル行はキー列値に基づいてディスクにソートされるため、グラニュール 2 および 3 では URL 値 W3 が存在できないためです。

**前のキー列が高い基数を持つ場合**<a name="generic-exclusion-search-slow"></a>

UserID に高い基数がある場合、同じ UserID 値が複数のテーブル行およびグラニュールに広がる可能性は低くなります。これは、インデックスマークの URL 値が単調に増加しないことを意味します：

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

上記の図では、W3 よりも URL 値が小さいすべてのマークがその関連するグラニュールの行を ClickHouse エンジンにストリーミングするための選択を受けていることが示されています。

これは、図内のすべてのインデックスマークがシナリオ 1 に該当するが、示された除外前提条件を満たしていないためです。それは、*直接後続のインデックスマークが現在のマークと同じ UserID 値を持つ*ことから、除外できないからです。

例えば、**URL 値が W3 より小さいインデックスマーク 0** に注目すると、その直接後続のインデックスマーク 1 も W3 より小さいが、*マーク 1 の UserID 値は 0 と異なるため*除外できません。

これが最終的に、ClickHouse がグラニュール 0 の最大 URL 値についての仮定を行うことを妨げます。代わりに、ClickHouse はグラニュール 0 に行が存在する可能性があると仮定し、マーク 0 の選択を余儀なくされます。

同様のシナリオがマーク 1、2、および 3 に対しても当てはまります。

:::note 結論
ClickHouse が一般的な除外検索アルゴリズムを使用するのは、前のキー列が低い基数を持つ場合において、特に効果的です。
:::

サンプルデータセットでは、両方のキー列（UserID、URL）が高い基数を持ち、説明されたように、一般的な除外検索アルゴリズムは、URL カラムの前のキー列が高い（または等しい）基数を持つ場合にはあまり効果的ではありません。
### データスキップインデックスについての注意事項 {#note-about-data-skipping-index}


UserID と URL の基数が似て高いため、私たちの [URL でのフィルタリングクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) も、複合主キー (UserID、URL) の URL カラムに対する [二次データスキッピングインデックス](./skipping-indexes.md) 作成からあまり利益を得ることはできません。

例えば、次の 2 つのステートメントは、テーブルの URL カラムに対する [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) データスキッピングインデックスを作成し、充填します：
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouse は、4 つの連続する [グラニュール](#data-is-organized-into-granules-for-parallel-data-processing) のグループごとに最小および最大の URL 値を保存する追加のインデックスを作成しました（上記の `ALTER TABLE` ステートメントの `GRANULARITY 4` 句に注目）。

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white"/>

最初のインデックスエントリ（上の図の「マーク 0」）は、テーブルの最初の 4 つのグラニュールに属する行の最小および最大の URL 値を保存しています。

2 番目のインデックスエントリ（「マーク 1」）は、テーブルの次の 4 つのグラニュールに属する行に対する最小および最大の URL 値を保存し、以下同様です。

（ClickHouse は、インデックスマークに関連付けられたグラニュールのグループを [特定](#mark-files-are-used-for-locating-granules)するための [特別なマークファイル](#mark-files-are-used-for-locating-granules) も作成しました。）


UserID と URL の基数が似て高いため、この二次データスキッピングインデックスは、私たちの [URL でのフィルタリングクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) が実行された場合にグラニュールの選択から除外するのに役立つことはありません。

クエリが探している特定の URL 値（すなわち 'http://public_search'）は、インデックスがそれぞれのグラニュールグループに保存している最小値と最大値の間にある可能性が高く、そのため ClickHouse はグラニュールグループを選択せざるを得ません（それらがクエリと一致する行を含んでいる可能性があるため）。
### 複数の主インデックスを使用する必要性 {#a-need-to-use-multiple-primary-indexes}


その結果、特定の URL を持つ行のためにサンプルクエリを大幅に高速化する必要がある場合、クエリに最適化された主インデックスを使用する必要があります。

さらに、特定の UserID を持つ行のためにサンプルクエリの良好なパフォーマンスを維持したい場合、複数の主インデックスを使用する必要があります。

これは、次のような方法で実現できます。

<a name="multiple-primary-indexes"></a>
### 追加の主インデックスを作成するオプション {#options-for-creating-additional-primary-indexes}


特定の UserID を持つ行をフィルタリングするサンプルクエリと特定の URL を持つ行をフィルタリングするサンプルクエリの両方を大幅に高速化したい場合、次の 3 つのオプションのいずれかを使用して、複数の主インデックスを使用する必要があります：

- **異なる主キーを持つ第二のテーブルを作成する**。
- **既存のテーブルにマテリアライズドビューを作成する**。
- **既存のテーブルにプロジェクションを追加する**。

これら 3 つのオプションは、テーブルの主インデックスおよび行のソート順を再編成するために、サンプルデータを追加のテーブルに効果的に複製します。

しかし、3 つのオプションは、クエリのルーティングや挿入ステートメントに関して、ユーザーに対する追加のテーブルの透過性において異なります。

**異なる主キーを持つ第二のテーブル**を作成する場合、クエリはクエリに最適なテーブルバージョンに明示的に送信する必要があり、新しいデータは両方のテーブルに明示的に挿入されて、テーブルを同期する必要があります：

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

**マテリアライズドビュー**の場合、追加のテーブルは自動的に作成され、データは両方のテーブル間で自動的に同期されます：

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

そして、**プロジェクション**は最も透過的なオプションであり、暗黙的に作成された（そして隠された）追加のテーブルをデータの変更に基づいて自動的に同期させるだけでなく、ClickHouse はクエリに最も効果的なテーブルバージョンを自動的に選択します：

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

以下では、複数の主インデックスを作成して使用するための 3 つのオプションについて、さらに詳細に、実際の例と共に議論します。

<a name="multiple-primary-indexes-via-secondary-tables"></a>
### Option 1: セカンダリテーブル {#option-1-secondary-tables}

<a name="secondary-table"></a>
プライマリキーのキーカラムの順序を元のテーブルと比較して入れ替えた新しい追加テーブルを作成します。

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

元のテーブルからすべての 8.87百万行を追加テーブルに挿入します:

```sql
INSERT INTO hits_URL_UserID
SELECT * from hits_UserID_URL;
```

レスポンスは次のようになります:

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

最後にテーブルを最適化します:
```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

プライマリキーのカラムの順序を変更したため、挿入された行はディスクに異なる辞書順で保存され（元のテーブルと比較して）、そのテーブルの 1083 グラニュールも以前とは異なる値を含んでいます:

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white"/>

これが結果のプライマリキーです:

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white"/>

これを使用して、URL カラムでフィルタリングされた例のクエリの実行を大幅に高速化できます。これは、最も頻繁に「http://public_search」をクリックしたトップ 10 のユーザーを計算するためのクエリです:
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のようになります:
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

今や、[ほぼ全テーブルスキャンを行う代わりに](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns)、ClickHouse はそのクエリをはるかに効果的に実行しました。

元のテーブルのプライマリインデックスでは、UserID が最初で、URL が 2 番目のキーカラムでしたが、ClickHouse はクエリを実行するためにインデックスマークの上で [一般的な排他検索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) を使用し、UserID と URL の間の同様に高いカーディナリティにより、あまり効果的ではありませんでした。

URL をプライマリインデックスの最初のカラムとして使用することで、ClickHouse は現在、インデックスマークの上で<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索</a>を実行しています。
ClickHouse サーバーログファイルの対応するトレースログがそれを確認しました:
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
ClickHouse は、一般的な排他検索を使用した際の 1076 ではなく、わずか 39 インデックスマークを選択しました。

追加テーブルは、URL でフィルタリングされた例のクエリの実行を高速化するために最適化されています。

元のテーブルでのクエリの[悪いパフォーマンス](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)と同様に、`UserIDs` に対するフィルタリングの例のクエリは新しい追加テーブルであまり効果的には実行されません。なぜなら、UserID がこのテーブルのプライマリインデックスの 2 番目のキーカラムになったからであり、ClickHouse はそのため、グラニュール選択に一般的な排他検索を使用するからです。UserID と URL のカーディナリティが同じように高い場合（/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm）。

詳細を知りたい場合は、詳細ボックスを開いてください。

<details>
    <summary>
    UserIDs に対するフィルタリングのクエリのパフォーマンスは悪い<a name="query-on-userid-slow"></a>
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

レスポンスは以下のようになります:

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

私たちは現在、2 つのテーブルを所有しています。`UserIDs` に対するフィルタリングのクエリを高速化するために最適化され、URLs に対するクエリを高速化するために最適化されたテーブルです。

### Option 2: マテリアライズドビュウ {#option-2-materialized-views}

既存のテーブルに対してマテリアライズドビューを作成します。
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
- ビューのプライマリキーのキーカラムの順序を（元のテーブルと比較して）入れ替えます
- マテリアライズドビューは、所定のプライマリキーディフィニションに基づいて、**暗黙的に作成されたテーブル**によってバックアップされています
- 暗黙的に作成されたテーブルは、`SHOW TABLES` クエリによってリスト表示され、名前は `.inner` で始まります
- マテリアライズドビューのバックアップテーブルを最初に明示的に作成し、その後、`TO [db].[table]` [句](/sql-reference/statements/create/view.md)を通じてそのテーブルをターゲットにすることも可能です
- `POPULATE` キーワードを使用して、元のテーブル [hits_UserID_URL](#a-table-with-a-primary-key) から 8.87 百万行すべてで暗黙的に作成されたテーブルを即座に埋めます
- 新しい行がソーステーブル hits_UserID_URL に挿入されると、その行は暗黙的に作成されたテーブルにも自動的に挿入されます
- 実際には、暗黙的に作成されたテーブルは、[セカンダリテーブルとして明示的に作成したテーブル](#option-1-secondary-tables) と同じ行の順序およびプライマリインデックスを持っています:

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white"/>

ClickHouse は、[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules) (*.mrk2)、および暗黙的に作成されたテーブルの[プライマリインデックス](#the-primary-index-has-one-entry-per-granule) (primary.idx)を、ClickHouse サーバーディレクトリの特別なフォルダに保存します:

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white"/>

:::

暗黙的に作成されたテーブル（およびそのプライマリインデックス）は、URL カラムでフィルタリングされた例のクエリの実行を大幅に高速化するために今や使用できます:
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のようになります:

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

実際に、プライマリインデックスのバックアップとして暗黙的に作成されたテーブルは、[セカンダリテーブルとして明示的に作成したテーブル](#option-1-secondary-tables) と同一のものであり、このためクエリは明示的に作成したテーブルと同じ効果的な方法で実行されます。

ClickHouse サーバーログファイルの対応するトレースログは、ClickHouse がインデックスマークの上で二分探索を実行していることを確認します:

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

### Option 3: プロジェクション {#option-3-projections}

既存のテーブルにプロジェクションを作成します:
```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

そしてプロジェクションをマテリアライズします:
```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note
- プロジェクションは、所定の `ORDER BY` 句に基づく行の順序とプライマリインデックスを持つ**隠れたテーブル**を作成します
- 隠れたテーブルは、`SHOW TABLES` クエリではリスト表示されません
- `MATERIALIZE` キーワードを使用して、元のテーブル [hits_UserID_URL](#a-table-with-a-primary-key) から 8.87 百万行すべてで隠れたテーブルを即座に埋めます
- 新しい行がソーステーブル hits_UserID_URL に挿入されると、その行は暗黙的に作成されたテーブルにも自動的に挿入されます
- クエリは常に（文法的に）ソーステーブル hits_UserID_URL をターゲットにしていますが、もし隠れたテーブルの行の順序とプライマリインデックスがより効果的なクエリ実行を可能にする場合、その隠れたテーブルが代わりに使用されます
- プロジェクションは、プロジェクションの ORDER BY ステートメントが一致していても、ORDER BY を使用するクエリがより効率的になるわけではありません (see https://github.com/ClickHouse/ClickHouse/issues/47333)
- 実際には、暗黙的に作成された隠れたテーブルは、[セカンダリテーブルとして明示的に作成したテーブル](#option-1-secondary-tables) と同じ行の順序およびプライマリインデックスを持っています:

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white"/>

ClickHouse は、[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules) (*.mrk2)、および隠れたテーブルの[プライマリインデックス](#the-primary-index-has-one-entry-per-granule) (primary.idx) を、ソーステーブルのデータファイル、マークファイル、プライマリインデックスファイルの隣にある特別なフォルダ（下のスクリーンショットでオレンジ色でマーク）に保存します:

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white"/>

:::

プロジェクションによって作成された隠れたテーブル（およびそのプライマリインデックス）は、URL カラムでフィルタリングされた例のクエリの実行を大幅に高速化するために今や使用できます。クエリは文法的にプロジェクションのソーステーブルをターゲットにしています。
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは以下のようになります:

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
Processed 319.49 thousand rows, 
11.38 MB (11.05 million rows/s., 393.58 MB/s.)
```

実際に、プロジェクションによって作成された隠れたテーブル（およびそのプライマリインデックス）は、[セカンダリテーブルとして明示的に作成したテーブル](#option-1-secondary-tables) と同一であり、このためクエリは明示的に作成したテーブルと同じ効果的な方法で実行されます。

ClickHouse サーバーログファイルの対応するトレースログは、ClickHouse がインデックスマークの上で二分探索を実行していることを確認します:

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

### Summary {#summary}

UserID と URL の複合プライマリキーを持つテーブルのプライマリインデックスは、[UserID に基づくクエリのフィルタリングを高速化する](#the-primary-index-is-used-for-selecting-granules)のに役立ちました。しかし、そのインデックスは、[URL に基づくクエリのフィルタリングを高速化する](#secondary-key-columns-can-not-be-inefficient)のにはあまり明確な助けは提供しません。URL カラムが複合プライマリキーの一部であってもですが。

そして、逆もまた然りです:
URL と UserID の複合プライマリキーを持つテーブルのプライマリインデックスは、[URL に基づくクエリのフィルタリングを高速化する](#secondary-key-columns-can-not-be-inefficient)のには役立ちましたが、[UserID に基づくクエリのフィルタリングに対してはあまり効果を提供しません](#the-primary-index-is-used-for-selecting-granules)。

UserID と URL のプライマリキーのカラムの同様に高いカーディナリティのため、2 番目のキーカラムでフィルタリングされるクエリは、[インデックスにある 2 番目のキーカラムからあまり恩恵を受けない](#generic-exclusion-search-algorithm)。

したがって、プライマリインデックスから 2 番目のキーカラムを削除し（インデックスのメモリ消費を少なくすることになります）、[複数のプライマリインデックスを使用する](#using-multiple-primary-indexes)方が理にかなっています。

ただし、複合プライマリキー内のキーカラムに大きなカーディナリティの違いがある場合、[クエリにとって有益](#generic-exclusion-search-algorithm)な処理を行うために、プライマリキーカラムを昇順にカーディナリティでソートすることの方が良いです。

キーカラム間のカーディナリティ差が大きいほど、それらのカラムの順序は重要となります。次のセクションでそのことを証明していきます。

## キーカラムを効率的に順序付ける {#ordering-key-columns-efficiently}

<a name="test"></a>

複合プライマリキー内のキーカラムの順序は、次の両者に大きな影響を与えます:
- クエリ内のセカンダリキーカラムに対するフィルタリングの効率と、
- テーブルのデータファイルの圧縮率。

これを実証するために、次の 3 つのカラムを持つ、インターネットの「ユーザー」(`UserID` カラム) が URL (`URL` カラム) にアクセスした際にボットトラフィックとしてマークされたかを示すサンプルデータセットを使用します。
- 特定の URL へのトラフィックのうち、ボットによるものがどれくらい (パーセント) なのか
- 特定のユーザーが (ボットでない) かどうかの信頼度 (そのユーザーからのトラフィックのうち、どのくらいがボットトラフィックでないと見なされるか)

上記の 3 つのカラムをキーカラムとして使用する複合プライマリキーのカーディナリティを計算するため、このクエリを使用します（注意: TSV データをローカルテーブルを作成することなく、即席でクエリするために [URL テーブル関数](/sql-reference/table-functions/url.md) を使用しています）。以下のクエリを `clickhouse client` で実行します:
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
レスポンスは次のようになります:
```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

私たちは、`URL` と `IsRobot` カラムの間で特にカーディナリティに大きな違いがあることを確認できます。したがって、複合プライマリキーでこれらのカラムの順序は、これらのカラムのフィルタリングの効率を高め、テーブルのカラムデータファイルの最適な圧縮比を達成するために重要です。

このことを示すために、私たちはボットトラフィック分析データ用に 2 つのテーブルバージョンを作成します:
- `(URL, UserID, IsRobot)` の複合プライマリキーを持つテーブル `hits_URL_UserID_IsRobot`
- `(IsRobot, UserID, URL)` の複合プライマリキーを持つテーブル `hits_IsRobot_UserID_URL`

`hits_URL_UserID_IsRobot` テーブルを `(URL, UserID, IsRobot)` の複合プライマリキーで作成します:
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

そして、8.87 百万行で埋め込みます:
```sql
INSERT INTO hits_URL_UserID_IsRobot SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
レスポンスは次のようになります:
```response
0 rows in set. Elapsed: 104.729 sec. Processed 8.87 million rows, 15.88 GB (84.73 thousand rows/s., 151.64 MB/s.)
```

次に、`hits_IsRobot_UserID_URL` テーブルを `(IsRobot, UserID, URL)` の複合プライマリキーで作成します:
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
そして、前のテーブルを埋めるために使用したのと同じ 8.87 百万行で埋め込みます:
```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
レスポンスは次のようになります:
```response
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```

### セカンダリキーカラムの効率的なフィルタリング {#efficient-filtering-on-secondary-key-columns}

クエリが複合キーの一部であるカラムでフィルタリングし、かつそれが最初のキーカラムである場合、[ClickHouse はインデックスマークの上でバイナリ検索アルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

クエリが複合キーの一部であるカラムでのみフィルタリングしているが、それが最初のキーカラムでない場合、[ClickHouse はインデックスマークの上で一般的な排他検索アルゴリズムを使用します](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

第二のケースでは、複合プライマリキー内でのキーカラムの順序は、[一般的な排他検索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)の効果に影響を与えます。

これは、キーカラム `(URL, UserID, IsRobot)` の順序をカーディナリティに降順にしたテーブルの `UserID` カラムでフィルタリングしているクエリです:
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

次に、キーカラム `(IsRobot, UserID, URL)` の順序をカーディナリティに昇順にしたテーブルに対して同じクエリを実行します:
```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```
レスポンスは次のようになります:
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.

# highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

テーブルでのキーカラムの順序をカーディナリティに降順にした場合と比較して、迅速性が非常に大きく効果的であることがわかります。

その理由は、[一般的な排他検索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)が、前のキーカラムが低いカーディナリティである場合に、セカンダリキーカラムを介してグラニュールが選択されるとうまく機能するからです。このことについては、ガイドの[前のセクション](#generic-exclusion-search-algorithm)で詳しく説明しました。

### データファイルの最適圧縮率 {#optimal-compression-ratio-of-data-files}

次のクエリは、上記で作成した 2 つのテーブルの `UserID` カラムの圧縮率を比較します:

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
レスポンスは以下のようになります:
```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```

`UserID` カラムの圧縮率は、カーディナリティに昇順にソートされたテーブルの方が非常に高いことがわかります。

両方のテーブルに正確に同じデータが保存されているにも関わらず（両方のテーブルに同じ 8.87 百万行を挿入しました）、複合プライマリキー内のキーカラムの順序は、テーブルの[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns)内の圧縮データが必要とするディスクスペースの大きさに大きな影響を与えています:
- 複合プライマリキーが `(URL, UserID, IsRobot)` でキーカラムの順序がカーディナリティに降順の場合、`UserID.bin` データファイルのディスクスペースは **11.24 MiB** です
- 複合プライマリキーが `(IsRobot, UserID, URL)` でキーカラムの順序がカーディナリティに昇順の場合、`UserID.bin` データファイルのディスクスペースは **877.47 KiB** です

ディスク上のテーブルのカラムに対して良好な圧縮率を持つことは、ディスクスペースを節約するだけでなく、当該カラムからのデータをメインメモリ（オペレーティングシステムのファイルキャッシュ）に移動するために必要な入出力が少なくなるため、（特に分析用の）クエリがより高速になります。

次のセクションで、テーブルのカラムに対する圧縮率を最適化するためにプライマリキーのカラムを昇順にソートすることがいかに有益であるかを説明します。

以下の図は、カーディナリティによって昇順に並べられたプライマリキーの行がディスク上での順序を示しています:

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white"/>

私たちは、[テーブルの行データがプライマリキーのカラムに沿ってディスクに保存される](#data-is-stored-on-disk-ordered-by-primary-key-columns)ことを確認しました。

上記の図では、テーブルの行（そのカラム値がディスク上）はまずその `cl` 値によってオーダーされ、同じ `cl` 値を持つ行はその `ch` 値によってオーダーされます。そして、最初のキーカラム `cl` が低いカーディナリティであるため、同じ `cl` 値を持つ行がある可能性が高く、これにより `ch` 値がローカルでオーダーされる可能性が高いのです。

もしデータが似たようなものだと近くに配置されている場合（例えば、ソートによって）、そのデータはよりよく圧縮されます。
一般的に、圧縮アルゴリズムは、データのランレングスが多いほど（データが多ければ多いほど圧縮にとって良いことです）および局所性（データが似たようなものであるほど圧縮率が良いことです）に利益を得ます。

上記の図と対照的に、下記の図は、カーディナリティに降順で順序付けられたプライマリキーのディスク上での行を示しています:

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white"/>

ここでは、テーブルの行はまずその `ch` 値によってオーダーされ、同じ `ch` 値を持つ行はその `cl` 値によってオーダーされます。
しかし、最初のキーカラム `ch` が高いカーディナリティであるため、同じ `ch` 値を持つ行が存在する可能性は低く、これにより `cl` 値がローカルでオーダーされる可能性も低くなります。

したがって、`cl` 値は最も可能性としてランダムな順序にあり、したがって局所性や圧縮率が悪くなります。

### Summary {#summary-1}

クエリにおけるセカンダリキーカラムの効率的フィルタリングとテーブルのカラムデータファイルの圧縮率の両方に対して、プライマリキー内のカラムの順序をカーディナリティに沿って昇順に並べることが有益です。

### 関連コンテンツ {#related-content-1}
- ブログ: [ClickHouse のクエリをスーパーチャージする](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)

## 単一行の特定を効率的に行う {#identifying-single-rows-efficiently}

一般的に、ClickHouse にとっての最良の使用ケースではありませんが、時々 ClickHouse 上に構築されたアプリケーションは、ClickHouse テーブルの単一行を特定する必要があります。

その直感的な解決策は、各行にユニークな値を持つ [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) カラムを使用し、そのカラムをプライマリキーとして使用して行を迅速に取得することです。

最も迅速に取得するためには、UUID カラムは[最初のキーカラムである必要があります](#the-primary-index-is-used-for-selecting-granules)。

私たちは[ClickHouse テーブルの行データがディスクに保存され、プライマリキーのカラムによって並べられている](#data-is-stored-on-disk-ordered-by-primary-key-columns)ため、非常に高いカーディナリティのカラム（UUID カラムのような）をプライマリキーまたは複合プライマリキー内の低いカーディナリティのカラムの前に置くことは、テーブルの他のカラムの圧縮率に悪影響を及ぼします。

最も迅速に取得することと、データ圧縮を最適化することとの妥協案は、複合プライマリキーを使用し、UUIDを最後のキーカラム、低（または）カーディナリティのキーカラムの後に配置することです。
### A concrete example {#a-concrete-example}

一つの具体例は、Alexey Milovidov が開発し、[ブログに書いた](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)プレーンテキストペーストサービス [https://pastila.nl](https://pastila.nl) です。

テキストエリアの変更があるたびに、データは自動的に ClickHouse テーブルの行に保存されます（変更ごとに一行）。

ペーストされたコンテンツの（特定のバージョンの）識別と取得の方法の一つは、コンテンツのハッシュをそのコンテンツを含むテーブル行の UUID として使用することです。

以下の図は
- コンテンツが変更されるときの行の挿入順（例えば、テキストエリアにテキストを入力するキーストロークによる）と
- `PRIMARY KEY (hash)` が使用される場合の挿入された行からのデータのディスク上の順序を示しています：

<Image img={sparsePrimaryIndexes15a} size="md" alt="Sparse Primary Indices 15a" background="white"/>

`hash` カラムが主キー列として使用されるため
- 特定の行を [非常に速く](#the-primary-index-is-used-for-selecting-granules) 取得できますが、
- テーブルの行（そのカラムデータ）はディスク上に（ユニークでランダムな）ハッシュ値によって昇順に保存されます。したがって、コンテンツカラムの値もランダム順で保存され、データの局所性がないため、**コンテンツカラムデータファイルの最適でない圧縮比**をもたらします。

コンテンツカラムの圧縮比を大幅に改善しつつ、特定の行の迅速な取得を実現するために、pastila.nl は特定の行を識別するために二つのハッシュ（および複合主キー）を使用しています：
- 上述の通り、異なるデータに対して異なるハッシュであるコンテンツのハッシュと、
- 小さなデータの変更で**変わらない** [局所感度ハッシュ（フィンガープリント）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing) です。

以下の図は
- コンテンツが変更されるときの行の挿入順（例えば、テキストエリアにテキストを入力するキーストロークによる）と
- 複合 `PRIMARY KEY (fingerprint, hash)` が使用される場合の挿入された行からのデータのディスク上の順序を示しています：

<Image img={sparsePrimaryIndexes15b} size="md" alt="Sparse Primary Indices 15b" background="white"/>

今やディスク上の行はまず `fingerprint` によって順序付けられ、同じフィンガープリント値を持つ行においては、その `hash` 値が最終的な順序を決定します。

データが小さな変更のみで異なる場合でも同じフィンガープリント値が付与されるため、今や似たデータはコンテンツカラム上で近くに保存されます。これは、圧縮アルゴリズムが一般的にデータの局所性から恩恵を受けるため、コンテンツカラムの圧縮比を非常に良くします（データがより似ているほど、圧縮比は良くなります）。

妥協点は、複合 `PRIMARY KEY (fingerprint, hash)` から得られる主インデックスを最適に利用するために特定の行を取得するには二つのフィールド（`fingerprint` と `hash`）が必要であることです。
