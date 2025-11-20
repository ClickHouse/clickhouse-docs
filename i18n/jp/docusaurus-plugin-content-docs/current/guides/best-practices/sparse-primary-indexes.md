---
sidebar_label: '主キーインデックス'
sidebar_position: 1
description: 'このガイドでは、ClickHouse のインデックス機構について詳しく解説します。'
title: 'ClickHouse における主キーインデックスの実践的入門'
slug: /guides/best-practices/sparse-primary-indexes
show_related_blogs: true
doc_type: 'guide'
keywords: ['primary index', 'indexing', 'performance', 'query optimization', 'best practices']
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


# ClickHouse における主インデックスの実践入門



## はじめに {#introduction}

このガイドでは、ClickHouseのインデックス作成について詳しく解説します。以下の内容について詳細に説明します：

- [ClickHouseのインデックス作成が従来のリレーショナルデータベース管理システムとどのように異なるか](#an-index-design-for-massive-data-scales)
- [ClickHouseがテーブルのスパースプライマリインデックスをどのように構築・使用しているか](#a-table-with-a-primary-key)
- [ClickHouseにおけるインデックス作成のベストプラクティス](#using-multiple-primary-indexes)

このガイドで示されているすべてのClickHouse SQLステートメントとクエリは、ご自身のマシンで実行できます。
ClickHouseのインストールと開始手順については、[クイックスタート](/get-started/quick-start)を参照してください。

:::note
このガイドは、ClickHouseのスパースプライマリインデックスに焦点を当てています。

ClickHouseの[セカンダリデータスキッピングインデックス](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)については、[チュートリアル](/guides/best-practices/skipping-indexes.md)を参照してください。
:::

### データセット {#data-set}

このガイド全体を通して、匿名化されたウェブトラフィックのサンプルデータセットを使用します。

- サンプルデータセットから887万行（イベント）のサブセットを使用します。
- 非圧縮データサイズは887万イベントで約700 MBです。ClickHouseに保存すると200 MBに圧縮されます。
- このサブセットでは、各行に3つのカラムが含まれており、特定の時刻（`EventTime`カラム）にURL（`URL`カラム）をクリックしたインターネットユーザー（`UserID`カラム）を示しています。

これら3つのカラムを使用して、次のような典型的なウェブ解析クエリを作成できます：

- 「特定のユーザーが最もクリックしたURL上位10件は何か？」
- 「特定のURLを最も頻繁にクリックしたユーザー上位10名は誰か？」
- 「ユーザーが特定のURLをクリックする最も人気のある時間帯（例：曜日）は何か？」

### テスト環境 {#test-machine}

このドキュメントに記載されているすべての実行時間は、Apple M1 Proチップと16GBのRAMを搭載したMacBook ProでClickHouse 22.2.1をローカルで実行した結果に基づいています。

### フルテーブルスキャン {#a-full-table-scan}

プライマリキーなしでデータセットに対してクエリがどのように実行されるかを確認するため、次のSQL DDLステートメントを実行してテーブル（MergeTreeテーブルエンジンを使用）を作成します：

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

次に、以下のSQL insertステートメントを使用して、hitsデータセットのサブセットをテーブルに挿入します。
これは、clickhouse.comでリモートにホストされている完全なデータセットのサブセットを読み込むために[URLテーブル関数](/sql-reference/table-functions/url.md)を使用します：


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

ClickHouse クライアントの結果出力から、上記のステートメントによって 887 万行がテーブルに挿入されたことがわかります。

最後に、このガイドで以降に行う議論をわかりやすくし、図や結果を再現可能にするため、FINAL キーワードを使ってテーブルを[最適化](/sql-reference/statements/optimize.md)します。


```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
一般的には、テーブルにデータをロードした直後に `OPTIMIZE` を実行する必要はなく、推奨もされません。この例でそれが必要になる理由は、この先で明らかになります。
:::

では、最初の Web アナリティクスのクエリを実行します。次のクエリは、UserID が 749927693 のインターネットユーザーについて、クリックされた回数が多い URL の上位 10 件を求めるものです。

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
```


10 rows in set. Elapsed: 0.022 sec.

# highlight-next-line

8.87百万行を処理しました、
70.45 MB（398.53百万行/秒、3.17 GB/秒）

```

ClickHouseクライアントの結果出力から、ClickHouseがフルテーブルスキャンを実行したことがわかります。テーブルの887万行すべてがClickHouseにストリーミングされました。これではスケールしません。

これを大幅に効率化し、高速化するには、適切なプライマリキーを持つテーブルを使用する必要があります。これにより、ClickHouseはプライマリキーの列に基づいてスパースプライマリインデックスを自動的に作成し、このインデックスを使用してサンプルクエリの実行を大幅に高速化できます。
```


## ClickHouseのインデックス設計 {#clickhouse-index-design}

### 大規模データスケールに対応したインデックス設計 {#an-index-design-for-massive-data-scales}

従来のリレーショナルデータベース管理システムでは、プライマリインデックスはテーブルの各行に対して1つのエントリを持ちます。このため、本データセットではプライマリインデックスに887万個のエントリが含まれることになります。このようなインデックスにより特定の行を高速に特定できるため、検索クエリやポイント更新において高い効率を実現します。`B(+)-Tree`データ構造におけるエントリの検索は、平均時間計算量が`O(log n)`となります。より正確には`log_b n = log_2 n / log_2 b`であり、ここで`b`は`B(+)-Tree`の分岐係数、`n`はインデックス化された行数です。`b`は通常数百から数千の範囲であるため、`B(+)-Tree`は非常に浅い構造となり、レコードの特定に必要なディスクシークは少なくなります。887万行で分岐係数が1000の場合、平均2.3回のディスクシークが必要です。この機能には代償が伴います。追加のディスクとメモリのオーバーヘッド、テーブルへの新規行追加やインデックスへのエントリ追加時の挿入コストの増加、そして場合によってはB-Treeの再バランシングが必要となります。

B-Treeインデックスに関連する課題を考慮し、ClickHouseのテーブルエンジンは異なるアプローチを採用しています。ClickHouseの[MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family/index.md)は、大量のデータを処理するために設計・最適化されています。これらのテーブルは、毎秒数百万行の挿入を受け入れ、非常に大規模な(数百ペタバイト)データ量を保存できるよう設計されています。データは[パート単位](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)でテーブルに高速に書き込まれ、バックグラウンドでパートをマージするルールが適用されます。ClickHouseでは各パートが独自のプライマリインデックスを持ちます。パートがマージされると、マージされたパートのプライマリインデックスも統合されます。ClickHouseが想定する非常に大規模な環境では、ディスクとメモリの効率性が極めて重要です。そのため、すべての行をインデックス化する代わりに、パートのプライマリインデックスは行のグループ(「granule」と呼ばれる)ごとに1つのインデックスエントリ(「mark」と呼ばれる)を持ちます。この手法は**スパースインデックス**と呼ばれます。

スパースインデックスが可能なのは、ClickHouseがパートの行をプライマリキー列の順序でディスクに保存しているためです。単一の行を直接特定する(B-Treeベースのインデックスのような)代わりに、スパースプライマリインデックスは(インデックスエントリに対する二分探索により)クエリに一致する可能性のある行のグループを迅速に識別します。特定された一致する可能性のある行のグループ(granule)は、その後並列にClickHouseエンジンにストリーミングされ、一致するものが検索されます。このインデックス設計により、プライマリインデックスを小さく保つことができ(メインメモリに完全に収まることができ、また収まる必要があります)、同時にクエリ実行時間を大幅に高速化できます。特にデータ分析のユースケースで典型的な範囲クエリにおいて効果的です。

以下では、ClickHouseがスパースプライマリインデックスをどのように構築し使用しているかを詳細に説明します。この記事の後半では、インデックスの構築に使用されるテーブル列(プライマリキー列)の選択、削除、順序付けに関するベストプラクティスについて説明します。

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

このガイドの後半での説明を簡潔にし、図と結果を再現可能にするため、DDL文は以下のようになっています:


<ul>
  <li>
    <code>ORDER BY</code>句を使用してテーブルの複合ソートキーを指定します。
  </li>
  <li>
    以下の設定により、プライマリインデックスが保持するインデックスエントリの数を明示的に制御します:
    <ul>
      <li>
        <code>index_granularity</code>: デフォルト値の8192に明示的に設定されています。これは、8192行ごとのグループに対して、プライマリインデックスが1つのインデックスエントリを保持することを意味します。例えば、テーブルに16384行が含まれている場合、インデックスは2つのインデックスエントリを保持します。
      </li>
      <li>
        <code>index_granularity_bytes</code>: <a
          href='https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1'
          target='_blank'
        >
          適応的インデックス粒度
        </a>を無効にするために0に設定されています。適応的インデックス粒度とは、以下のいずれかの条件が満たされた場合に、ClickHouseがn行のグループに対して自動的に1つのインデックスエントリを作成することを意味します:
        <ul>
          <li>
            <code>n</code>が8192未満で、その<code>n</code>行の結合行データのサイズが10 MB以上である場合(<code>index_granularity_bytes</code>のデフォルト値)。
          </li>
          <li>
            <code>n</code>行の結合行データサイズが10 MB未満であるが、<code>n</code>が8192である場合。
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

上記のDDL文のプライマリキーにより、指定された2つのキー列に基づいてプライマリインデックスが作成されます。

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

レスポンスは次のようになります。

```response
0 rows in set. Elapsed: 149.432 sec. Processed 8.87 million rows, 18.40 GB (59.38 thousand rows/s., 123.16 MB/s.)
```

<br />

テーブルを最適化します：

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br />

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

レスポンスは次のとおりです:

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

ClickHouseクライアントの出力は以下を示しています:

- テーブルのデータは、ディスク上の特定のディレクトリに[ワイドフォーマット](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)で保存されており、そのディレクトリ内にテーブルの各カラムごとに1つのデータファイル(および1つのマークファイル)が存在します。
- テーブルには887万行が含まれています。
- すべての行の非圧縮データサイズは合計733.28 MBです。
- すべての行のディスク上の圧縮サイズは合計206.94 MBです。
- テーブルには1083個のエントリ('マーク'と呼ばれる)を持つプライマリインデックスがあり、インデックスのサイズは96.93 KBです。
- 合計で、テーブルのデータファイル、マークファイル、プライマリインデックスファイルは、ディスク上で207.07 MBを占有しています。

### データはプライマリキーカラムでソートされてディスクに保存される {#data-is-stored-on-disk-ordered-by-primary-key-columns}

上記で作成したテーブルには以下があります

- 複合[プライマリキー](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` と
- 複合[ソートキー](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`

:::note

- ソートキーのみを指定した場合、プライマリキーは暗黙的にソートキーと等しく定義されます。

- メモリ効率を高めるため、クエリでフィルタリングするカラムのみを含むプライマリキーを明示的に指定しました。プライマリキーに基づくプライマリインデックスは、完全にメインメモリにロードされます。

- ガイドの図の一貫性を保ち、圧縮率を最大化するために、テーブルのすべてのカラムを含む別個のソートキーを定義しました(カラム内で類似したデータが互いに近くに配置されている場合、例えばソートによって、そのデータはより効率的に圧縮されます)。

- 両方が指定されている場合、プライマリキーはソートキーの接頭辞である必要があります。
  :::

挿入された行は、プライマリキーカラム(およびソートキーからの追加の`EventTime`カラム)によって辞書順(昇順)でディスクに保存されます。

:::note
ClickHouseは、同一のプライマリキーカラム値を持つ複数の行の挿入を許可します。この場合(下図の行1と行2を参照)、最終的な順序は指定されたソートキーによって決定され、したがって`EventTime`カラムの値によって決まります。
:::

ClickHouseは<a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms
" target="_blank">カラム指向データベース管理システム</a>です。下図に示すように

- ディスク上の表現では、テーブルの各カラムごとに単一のデータファイル(\*.bin)があり、そのカラムのすべての値が<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a>形式で保存されます。また、
- 887万行は、プライマリキーカラム(および追加のソートキーカラム)によって辞書順の昇順でディスクに保存されます。つまり、この場合
  - 最初に`UserID`、
  - 次に`URL`、
  - 最後に`EventTime`の順です:

<Image
  img={sparsePrimaryIndexes01}
  size='md'
  alt='Sparse Primary Indices 01'
  background='white'
/>


`UserID.bin`、`URL.bin`、`EventTime.bin` は、`UserID`、`URL`、`EventTime` カラムの値が格納されているディスク上のデータファイルです。

:::note

- プライマリキーはディスク上の行の辞書順を定義するため、テーブルは1つのプライマリキーのみを持つことができます。

- ログメッセージにも使用されるClickHouseの内部行番号付けスキームに合わせるため、行の番号付けは0から開始しています。
  :::

### データは並列データ処理のためにグラニュールに編成される {#data-is-organized-into-granules-for-parallel-data-processing}

データ処理の目的で、テーブルのカラム値は論理的にグラニュールに分割されます。
グラニュールは、データ処理のためにClickHouseにストリーミングされる最小の不可分なデータセットです。
これは、個々の行を読み取る代わりに、ClickHouseが常に行のグループ全体(グラニュール)を(ストリーミング方式で並列に)読み取ることを意味します。
:::note
カラム値は物理的にグラニュール内に格納されているわけではありません。グラニュールは、クエリ処理のためのカラム値の論理的な編成に過ぎません。
:::

次の図は、テーブルのDDL文に`index_granularity`設定(デフォルト値の8192に設定)が含まれている結果として、テーブルの887万行の(カラム値が)どのように1083個のグラニュールに編成されているかを示しています。

<Image
  img={sparsePrimaryIndexes02}
  size='md'
  alt='スパースプライマリインデックス 02'
  background='white'
/>

最初の(ディスク上の物理的順序に基づく)8192行(そのカラム値)は論理的にグラニュール0に属し、次の8192行(そのカラム値)はグラニュール1に属する、という具合です。

:::note

- 最後のグラニュール(グラニュール1082)は8192行未満を「含んで」います。

- このガイドの冒頭の「DDL文の詳細」で、[適応的インデックスグラニュラリティ](/whats-new/changelog/2019.md/#experimental-features-1)を無効にしたことに触れました(このガイドでの議論を簡素化し、図と結果を再現可能にするため)。

  したがって、サンプルテーブルのすべてのグラニュール(最後のものを除く)は同じサイズを持ちます。

- 適応的インデックスグラニュラリティを持つテーブルの場合(インデックスグラニュラリティは[デフォルト](/operations/settings/merge-tree-settings#index_granularity_bytes)で適応的)、行データのサイズに応じて一部のグラニュールのサイズが8192行未満になることがあります。

- プライマリキーカラム(`UserID`、`URL`)の一部のカラム値をオレンジ色でマークしました。
  これらのオレンジ色でマークされたカラム値は、各グラニュールの最初の行のプライマリキーカラム値です。
  以下で見るように、これらのオレンジ色でマークされたカラム値がテーブルのプライマリインデックスのエントリになります。

- ログメッセージにも使用されるClickHouseの内部番号付けスキームに合わせるため、グラニュールの番号付けは0から開始しています。
  :::

### プライマリインデックスはグラニュールごとに1つのエントリを持つ {#the-primary-index-has-one-entry-per-granule}

プライマリインデックスは、上の図に示されているグラニュールに基づいて作成されます。このインデックスは、0から始まる数値インデックスマークと呼ばれるものを含む、非圧縮のフラット配列ファイル(primary.idx)です。

下の図は、インデックスが各グラニュールの最初の行ごとにプライマリキーカラム値(上の図でオレンジ色でマークされた値)を格納していることを示しています。
言い換えれば、プライマリインデックスは、テーブルの8192行ごとのプライマリキーカラム値を格納します(プライマリキーカラムによって定義される物理的な行順序に基づく)。
例えば

- 最初のインデックスエントリ(下の図の「マーク0」)は、上の図のグラニュール0の最初の行のキーカラム値を格納しています、
- 2番目のインデックスエントリ(下の図の「マーク1」)は、上の図のグラニュール1の最初の行のキーカラム値を格納しています、という具合です。

<Image
  img={sparsePrimaryIndexes03a}
  size='lg'
  alt='スパースプライマリインデックス 03a'
  background='white'
/>

合計で、インデックスは887万行と1083個のグラニュールを持つテーブルに対して1083個のエントリを持ちます:

<Image
  img={sparsePrimaryIndexes03b}
  size='md'
  alt='スパースプライマリインデックス 03b'
  background='white'
/>


:::note
- [アダプティブインデックス粒度](/whats-new/changelog/2019.md/#experimental-features-1) を使用しているテーブルでは、最後のテーブル行の主キー列の値を記録する、1 つの「最終」追加マークもプライマリインデックスに格納されます。ただし、本ガイドでは議論を簡潔にし、図や結果を再現しやすくするためにアダプティブインデックス粒度を無効化しているので、今回のサンプルテーブルのインデックスにはこの最終マークは含まれていません。

- プライマリインデックスファイルはメインメモリに完全に読み込まれます。ファイルサイズが利用可能な空きメモリ容量より大きい場合、ClickHouse はエラーをスローします。
:::

<details>
    <summary>
    プライマリインデックスの内容の確認
    </summary>
    <p>

自己管理型の ClickHouse クラスターでは、サンプルテーブルのプライマリインデックスの内容を確認するために、<a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">file テーブル関数</a>を使用できます。

そのためには、まず実行中のクラスター内のあるノードの <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> にプライマリインデックスファイルをコピーする必要があります:
<ul>
<li>手順 1: プライマリインデックスファイルを含む part-path を取得</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

テストマシンでは `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4` が返されます。

<li>手順 2: user_files_path を取得</li>
Linux における<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">デフォルトの user_files_path</a> は
`/var/lib/clickhouse/user_files/`

であり、Linux では次のコマンドで変更されたかどうかを確認できます: `$ grep user_files_path /etc/clickhouse-server/config.xml`

テストマシンではパスは `/Users/tomschreiber/Clickhouse/user_files/` です。

<li>手順 3: プライマリインデックスファイルを user_files_path にコピー</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

</ul>

<br/>
これで、SQL を使ってプライマリインデックスの内容を確認できます:
<ul>
<li>エントリ数を取得</li>
`
SELECT count( )<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String');
`
`1083` が返されます。

<li>最初の 2 つのインデックスマークを取得</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 0, 2;
`

結果:

`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`

<li>最後のインデックスマークを取得</li>
`
SELECT UserID, URL FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
結果:
`
4292714039 │ http://sosyal-mansetleri...
`
</ul>
<br/>
これは、サンプルテーブルに対するプライマリインデックス内容の図と完全に一致しています。

</p>
</details>

プライマリキーのエントリは、各インデックスエントリが特定のデータ範囲の開始位置を示していることから、インデックスマークと呼ばれます。今回のサンプルテーブルでは具体的に次のとおりです:
- UserID インデックスマーク:

  プライマリインデックスに格納されている `UserID` の値は昇順にソートされています。<br/>
  上の図中の「マーク 1」は、グラニュール 1 およびそれ以降のすべてのグラニュールに含まれるすべてのテーブル行の `UserID` の値が、4.073.710 以上であることが保証されていることを示しています。



[後述するように](#the-primary-index-is-used-for-selecting-granules)、このグローバルな順序により、クエリがプライマリキーの最初のカラムでフィルタリングを行う際に、ClickHouseは最初のキーカラムのインデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索アルゴリズムを使用</a>できます。

- URLインデックスマーク:

  プライマリキーカラム`UserID`と`URL`のカーディナリティが非常に類似しているため、最初のカラム以降のすべてのキーカラムのインデックスマークは、一般的に、少なくとも現在のグラニュール内のすべてのテーブル行において前のキーカラムの値が同じである限り、データ範囲のみを示します。<br/>
  例えば、上図ではマーク0とマーク1のUserID値が異なるため、ClickHouseはグラニュール0内のすべてのテーブル行のURL値が`'http://showtopics.html%3...'`以上であると仮定できません。しかし、上図でマーク0とマーク1のUserID値が同じである場合(つまり、グラニュール0内のすべてのテーブル行でUserID値が同じである場合)、ClickHouseはグラニュール0内のすべてのテーブル行のURL値が`'http://showtopics.html%3...'`以上であると仮定できます。

  これがクエリ実行パフォーマンスに与える影響については、後ほど詳しく説明します。

### プライマリインデックスはグラニュールの選択に使用される {#the-primary-index-is-used-for-selecting-granules}

これで、プライマリインデックスのサポートを利用してクエリを実行できます。

以下は、UserID 749927693に対してクリック数が最も多い上位10件のURLを計算します。

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

結果は次のとおりです:

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


10 行が結果セットに含まれます。経過時間: 0.005 秒。

# highlight-next-line

8.19 千行を処理しました、
740.18 KB (1.53 百万行/秒、138.59 MB/秒)

```

ClickHouseクライアントの出力は、フルテーブルスキャンを実行する代わりに、わずか8,190行のみがClickHouseにストリーミングされたことを示しています。
```


<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">トレースロギング</a> が有効になっている場合、ClickHouse サーバーログファイルには、ClickHouse が 1083 個の UserID インデックスマークに対して <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索</a> を行い、UserID 列の値が `749927693` である行を含んでいる可能性のあるグラニュールを特定していることが示されています。これは平均計算量 `O(log2 n)` で 19 ステップを要します。

```response
...Executor): キー条件: (column 0 in [749927693, 749927693])
# highlight-next-line
...Executor): パート all_1_9_2 のインデックス範囲に対して二分探索を実行中 (1083 マーク)
...Executor): (LEFT) 境界マークを検出: 176
...Executor): (RIGHT) 境界マークを検出: 177
...Executor): 19 ステップで連続範囲を検出
...Executor): パーティションキーで 1/1 パートを選択、プライマリキーで 1 パート、
# highlight-next-line
              プライマリキーで 1/1083 マーク、1 範囲から 1 マークを読み取り
...読み取り中 ...1441792 から開始して約 8192 行
```

上記のトレースログから、既存の 1083 個のマークのうち 1 つのマークがクエリ条件を満たしていることが分かります。

<details>
  <summary>
    トレースログの詳細
  </summary>

  <p>
    マーク 176 が特定されました（「found left boundary mark」は含む境界、「found right boundary mark」は含まない境界）ため、granule 176（行 1,441,792 から開始します。これについては後ほど本ガイド内で説明します）の 8192 行すべてが ClickHouse に読み込まれ、その中から UserID 列の値が `749927693` である実際の行を探し出します。
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

クライアント出力は、1083個のグラニュールのうち1個が、UserID列の値749927693を含む可能性のある行として選択されたことを示しています。

:::note 結論
クエリが複合キーの一部である列でフィルタリングを行い、その列が最初のキー列である場合、ClickHouseはそのキー列のインデックスマークに対してバイナリサーチアルゴリズムを実行します。
:::

<br />

前述のように、ClickHouseはスパースプライマリインデックスを使用して、クエリに一致する行を含む可能性のあるグラニュールを(バイナリサーチにより)高速に選択します。

これがClickHouseクエリ実行の**第1段階(グラニュール選択)**です。

**第2段階(データ読み取り)**では、ClickHouseは選択されたグラニュールの位置を特定し、それらのすべての行をClickHouseエンジンにストリーミングして、実際にクエリに一致する行を見つけます。

この第2段階については、次のセクションで詳しく説明します。

### マークファイルによるグラニュールの位置特定 {#mark-files-are-used-for-locating-granules}

次の図は、このテーブルのプライマリインデックスファイルの一部を示しています。

<Image
  img={sparsePrimaryIndexes04}
  size='md'
  alt='Sparse Primary Indices 04'
  background='white'
/>

前述のように、インデックスの1083個のUserIDマークに対するバイナリサーチにより、マーク176が特定されました。したがって、対応するグラニュール176は、UserID列の値749.927.693を含む行が存在する可能性があります。

<details>
    <summary>
    グラニュール選択の詳細
    </summary>
    <p>

上の図は、マーク176が、関連するグラニュール176の最小UserID値が749.927.693より小さく、かつ次のマーク(マーク177)のグラニュール177の最小UserID値がこの値より大きい最初のインデックスエントリであることを示しています。したがって、マーク176に対応するグラニュール176のみが、UserID列の値749.927.693を含む行が存在する可能性があります。

</p>
</details>

グラニュール176内の一部の行がUserID列の値749.927.693を含むかどうかを確認するには、このグラニュールに属するすべての8192行をClickHouseにストリーミングする必要があります。

これを実現するために、ClickHouseはグラニュール176の物理的な位置を知る必要があります。

ClickHouseでは、テーブルのすべてのグラニュールの物理的な位置がマークファイルに保存されます。データファイルと同様に、テーブルの列ごとに1つのマークファイルが存在します。

次の図は、テーブルの`UserID`、`URL`、`EventTime`列のグラニュールの物理的な位置を保存する3つのマークファイル`UserID.mrk`、`URL.mrk`、`EventTime.mrk`を示しています。

<Image
  img={sparsePrimaryIndexes05}
  size='md'
  alt='Sparse Primary Indices 05'
  background='white'
/>

プライマリインデックスが、0から始まる番号が付けられたインデックスマークを含む、フラットな非圧縮配列ファイル(primary.idx)であることについて説明しました。

同様に、マークファイルも、0から始まる番号が付けられたマークを含む、フラットな非圧縮配列ファイル(\*.mrk)です。

ClickHouseがクエリに一致する行を含む可能性のあるグラニュールのインデックスマークを特定して選択すると、マークファイル内で位置配列検索を実行して、グラニュールの物理的な位置を取得できます。

特定の列の各マークファイルエントリは、オフセットの形式で2つの位置を保存しています:


- 最初のオフセット（上の図の `block_offset`）は、選択されたグラニュールの圧縮版を含んでいる<a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">ブロック</a>を、<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a>カラムデータファイルの中から特定します。この圧縮ブロックには、複数の圧縮グラニュールが含まれている可能性があります。特定された圧縮ファイルブロックは、読み取り時にメインメモリ上に解凍されます。

- 2つ目のオフセット（上の図の `granule_offset`）はマークファイルに記録されており、解凍済みブロックデータ内でのグラニュールの位置を示します。

その後、特定された解凍済みグラニュールに属する 8192 行すべてが、さらなる処理のために ClickHouse にストリーミングされます。

:::note

- [ワイド形式 (wide format)](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) かつ [アダプティブインデックス粒度 (adaptive index granularity)](/whats-new/changelog/2019.md/#experimental-features-1) を無効にしているテーブルでは、ClickHouse は上で示したような `.mrk` マークファイルを使用します。これらには、1 エントリにつき 8 バイト長のアドレスが 2 つ含まれます。これらのエントリは、すべて同じサイズを持つグラニュールの物理位置を表します。

 インデックス粒度は[デフォルト](/operations/settings/merge-tree-settings#index_granularity_bytes)ではアダプティブですが、このガイドでの説明を簡潔にし、図や結果を再現可能にするために、サンプルのテーブルではアダプティブインデックス粒度を無効にしています。今回のテーブルは、データサイズが [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)（セルフマネージドクラスタではデフォルトで 10 MB）を上回っているため、ワイド形式を使用しています。

- ワイド形式かつアダプティブインデックス粒度を有効にしているテーブルでは、ClickHouse は `.mrk2` マークファイルを使用します。これには `.mrk` マークファイルと同様のエントリが含まれますが、1 エントリあたり 3 つ目の値として、そのエントリに対応するグラニュールの行数が含まれます。

- [コンパクト形式 (compact format)](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) のテーブルでは、ClickHouse は `.mrk3` マークファイルを使用します。

:::

:::note Why Mark Files

なぜプライマリインデックスは、インデックスマークに対応するグラニュールの物理位置を直接保持しないのでしょうか。

それは、ClickHouse が想定している非常に大規模なスケールにおいては、ディスクおよびメモリの効率を非常に高く保つことが重要だからです。

プライマリインデックスファイルはメインメモリに収まる必要があります。

この例のクエリでは、ClickHouse はプライマリインデックスを使用して、クエリにマッチする行を含んでいる可能性のある単一のグラニュールを選択しました。ClickHouse が物理位置を必要とするのは、その 1 つのグラニュールに対応する行をストリーミングし、さらなる処理を行うためだけです。

さらに、このオフセット情報が必要なのは UserID カラムと URL カラムだけです。

オフセット情報は、`EventTime` のようにクエリで使用されないカラムには不要です。

このサンプルクエリの場合、ClickHouse が必要とするのは、UserID データファイル（UserID.bin）内のグラニュール 176 に対する 2 つの物理位置オフセットと、URL データファイル（URL.bin）内のグラニュール 176 に対する 2 つの物理位置オフセットだけです。

マークファイルによるこの間接参照により、プライマリインデックスの中に、3 つのカラムすべてについて 1083 個のグラニュールそれぞれの物理位置エントリを直接格納することを避けられます。これにより、メインメモリ内の不要な（潜在的に未使用の）データを持たずに済みます。
:::

次の図と、その後に続く説明では、サンプルクエリに対して ClickHouse がどのようにして UserID.bin データファイル内のグラニュール 176 を特定するかを示します。

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

このガイドの前半で、ClickHouse がプライマリインデックスマーク 176 を選択し、それによりグラニュール 176 がクエリにマッチする行を含んでいる可能性があると判断したことを説明しました。

ClickHouse は、選択されたマーク番号（176）を使用して、UserID.mrk マークファイルに対して位置による配列ルックアップを行い、グラニュール 176 を特定するための 2 つのオフセットを取得します。

図に示されているように、1 つ目のオフセットは、UserID.bin データファイル内の圧縮ファイルブロックを特定します。このブロックには、グラニュール 176 の圧縮版が含まれています。

特定されたファイルブロックがメインメモリ上に解凍されると、マークファイル中の 2 つ目のオフセットを使用して、解凍済みデータ内のグラニュール 176 を特定できます。

ClickHouse がこのサンプルクエリ（UserID 749.927.693 のインターネットユーザーに対する、最もクリックされた URL トップ 10）を実行するためには、UserID.bin データファイルと URL.bin データファイルの両方からグラニュール 176 を特定し（およびそこからすべての値をストリーミングし）なければなりません。



上の図は、ClickHouse が UserID.bin データファイルに対して対象となるグラニュールをどのように特定しているかを示しています。

同時に、ClickHouse は URL.bin データファイルについてもグラニュール 176 に対して同様の処理を行います。両方のグラニュールは位置合わせされたうえで ClickHouse エンジンにストリーミングされ、UserID が 749.927.693 であるすべての行について、グループごとに URL 値を集計・カウントする処理が行われます。最後に、その結果として、カウントが多い順に並べた上位 10 個の URL グループが出力されます。



## 複数のプライマリインデックスの使用 {#using-multiple-primary-indexes}

<a name='filtering-on-key-columns-after-the-first'></a>

### セカンダリキーカラムが非効率になる場合とならない場合 {#secondary-key-columns-can-not-be-inefficient}

クエリが複合キーの一部であり、かつ最初のキーカラムに対してフィルタリングを行う場合、[ClickHouseはそのキーカラムのインデックスマークに対してバイナリサーチアルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

しかし、クエリが複合キーの一部であるものの、最初のキーカラムではないカラムに対してフィルタリングを行う場合はどうなるでしょうか?

:::note
ここでは、クエリが最初のキーカラムに対してフィルタリングを行わず、セカンダリキーカラムに対して明示的にフィルタリングを行うシナリオについて説明します。

クエリが最初のキーカラムと、それ以降の任意のキーカラムの両方に対してフィルタリングを行う場合、ClickHouseは最初のキーカラムのインデックスマークに対してバイナリサーチを実行します。
:::

<br />
<br />

<a name='query-on-url'></a>
URL "http://public_search" を最も頻繁にクリックした上位10人のユーザーを計算するクエリを使用します:

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

結果は次のとおりです: <a name="query-on-url-slow"></a>

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


10 行の結果。経過時間: 0.086 秒。

# highlight-next-line

8.81 百万行を処理しました、
799.69 MB (102.11 百万行/秒、9.27 GB/秒)

```

クライアント出力は、[URL列が複合主キーの一部である](#a-table-with-a-primary-key)にもかかわらず、ClickHouseがほぼフルテーブルスキャンを実行したことを示しています!ClickHouseは、テーブルの887万行のうち881万行を読み取りました。
```


[trace_logging](/operations/server-configuration-parameters/settings#logger)が有効な場合、ClickHouseサーバーのログファイルには、ClickHouseが1083個のURLインデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">汎用除外検索</a>を使用して、URL列の値が"http://public_search"である行を含む可能性のあるグラニュールを特定したことが示されます:

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

上記のサンプルトレースログから、1083個のグラニュールのうち1076個(マーク経由)が、一致するURL値を含む行を持つ可能性があるものとして選択されたことがわかります。

その結果、URL値"http://public_search"を実際に含む行を特定するために、881万行が(10個のストリームを使用して並列に)ClickHouseエンジンにストリーミングされます。

しかし、後述するように、選択された1076個のグラニュールのうち、実際に一致する行を含むのはわずか39個のグラニュールのみです。

複合プライマリキー(UserID、URL)に基づくプライマリインデックスは、特定のUserID値を持つ行をフィルタリングするクエリの高速化に非常に有用でしたが、特定のURL値を持つ行をフィルタリングするクエリの高速化には大きな効果をもたらしていません。

これは、URL列が最初のキー列ではないため、ClickHouseがURL列のインデックスマークに対して(二分探索ではなく)汎用除外検索アルゴリズムを使用しており、**そのアルゴリズムの効果はURL列とその前のキー列UserIDとのカーディナリティの差に依存する**ためです。

これを説明するために、汎用除外検索がどのように機能するかについて詳細を示します。

<a name='generic-exclusion-search-algorithm'></a>

### 汎用除外検索アルゴリズム {#generic-exclusion-search-algorithm}

以下は、前のキー列のカーディナリティが低い(または高い)場合に、セカンダリ列を介してグラニュールが選択される際に、<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >ClickHouseの汎用除外検索アルゴリズム</a>がどのように機能するかを示しています。

両方のケースの例として、以下を仮定します:

- URL値 = "W3"の行を検索するクエリ
- UserIDとURLの値を簡略化したhitsテーブルの抽象版
- インデックスに同じ複合プライマリキー(UserID、URL)を使用。これは、行が最初にUserID値で順序付けられることを意味します。同じUserID値を持つ行は、次にURLで順序付けられます。
- グラニュールサイズは2、つまり各グラニュールには2行が含まれます。

以下の図では、各グラニュールの最初のテーブル行のキー列の値をオレンジ色でマークしています。

**前のキー列のカーディナリティが低い場合**<a name="generic-exclusion-search-fast"></a>

UserIDのカーディナリティが低いと仮定します。この場合、同じUserID値が複数のテーブル行とグラニュール、したがってインデックスマークに分散している可能性が高くなります。同じUserIDを持つインデックスマークの場合、インデックスマークのURL値は昇順にソートされます(テーブル行が最初にUserIDで、次にURLで順序付けられるため)。これにより、以下に説明するように効率的なフィルタリングが可能になります:

<Image
  img={sparsePrimaryIndexes07}
  size='md'
  alt='Sparse Primary Indices 06'
  background='white'
/>

上記の図の抽象的なサンプルデータに対するグラニュール選択プロセスには、3つの異なるシナリオがあります:

1.  **URL値がW3より小さく、直後のインデックスマークのURL値もW3より小さい**インデックスマーク0は、マーク0と1が同じUserID値を持つため除外できます。この除外の前提条件により、グラニュール0が完全にU1のUserID値で構成されていることが保証されるため、ClickHouseはグラニュール0の最大URL値もW3より小さいと仮定し、グラニュールを除外できます。


2. **URL値がW3以下であり、かつ直後のインデックスマークのURL値がW3以上である**インデックスマーク1が選択されます。これは、グラニュール1がURL W3を含む行を保持している可能性があることを意味します。

3. **URL値がW3より大きい**インデックスマーク2と3は除外できます。プライマリインデックスのインデックスマークは各グラニュールの最初のテーブル行のキー列値を格納し、テーブル行はキー列値によってディスク上でソートされているため、グラニュール2と3はURL値W3を含むことができません。

**前方キー列のカーディナリティが高い場合**<a name="generic-exclusion-search-slow"></a>

UserIDのカーディナリティが高い場合、同じUserID値が複数のテーブル行やグラニュールに分散している可能性は低くなります。これは、インデックスマークのURL値が単調増加しないことを意味します。

<Image
  img={sparsePrimaryIndexes08}
  size='md'
  alt='スパースプライマリインデックス 06'
  background='white'
/>

上の図に示すように、URL値がW3より小さいすべてのマークが選択され、関連するグラニュールの行がClickHouseエンジンにストリーミングされます。

これは、図中のすべてのインデックスマークが上記のシナリオ1に該当する一方で、_直後のインデックスマークが現在のマークと同じUserID値を持つ_という除外の前提条件を満たさないため、除外できないからです。

例えば、**URL値がW3より小さく、かつ直後のインデックスマークのURL値もW3より小さい**インデックスマーク0を考えてみましょう。これは除外_できません_。なぜなら、直後のインデックスマーク1が現在のマーク0と同じUserID値を持って_いない_からです。

これにより、ClickHouseはグラニュール0の最大URL値について推測することができなくなります。代わりに、グラニュール0がURL値W3を持つ行を含む可能性があると仮定し、マーク0を選択せざるを得なくなります。

同じシナリオがマーク1、2、3にも当てはまります。

:::note 結論
複合キーの一部であるが最初のキー列ではない列でクエリがフィルタリングを行う場合、ClickHouseが<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索アルゴリズム</a>の代わりに使用する<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">汎用除外探索アルゴリズム</a>は、前方キー列のカーディナリティが低い場合に最も効果的です。
:::

サンプルデータセットでは、両方のキー列（UserID、URL）が同様に高いカーディナリティを持っており、説明したように、URL列の前方キー列が高いまたは同様のカーディナリティを持つ場合、汎用除外探索アルゴリズムはあまり効果的ではありません。

### データスキッピングインデックスに関する注意 {#note-about-data-skipping-index}

UserIDとURLのカーディナリティが同様に高いため、[複合プライマリキー（UserID、URL）を持つテーブル](#a-table-with-a-primary-key)のURL列に[セカンダリデータスキッピングインデックス](./skipping-indexes.md)を作成しても、[URLでフィルタリングするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)はあまり恩恵を受けません。

例えば、次の2つのステートメントは、テーブルのURL列に[minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries)データスキッピングインデックスを作成して設定します。

```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```

ClickHouseは、4つの連続した[グラニュール](#data-is-organized-into-granules-for-parallel-data-processing)のグループごとに（上記の`ALTER TABLE`ステートメントの`GRANULARITY 4`句に注意）、最小および最大URL値を格納する追加のインデックスを作成しました。

<Image
  img={sparsePrimaryIndexes13a}
  size='md'
  alt='スパースプライマリインデックス 13a'
  background='white'
/>

最初のインデックスエントリ（上の図の「マーク0」）は、[テーブルの最初の4つのグラニュールに属する行](#data-is-organized-into-granules-for-parallel-data-processing)の最小および最大URL値を格納しています。


2番目のインデックスエントリ（'mark 1'）は、テーブルの次の4つのグラニュールに属する行のURLの最小値と最大値を格納しており、以降も同様です。

（ClickHouseは、インデックスマークに関連付けられたグラニュールのグループを[特定](#mark-files-are-used-for-locating-granules)するために、データスキッピングインデックス用の特別な[マークファイル](#mark-files-are-used-for-locating-granules)も作成します。）

UserIDとURLのカーディナリティがともに高いため、この二次データスキッピングインデックスは、[URLでフィルタリングするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)が実行される際に、グラニュールの選択を除外することができません。

クエリが検索している特定のURL値（例：'http://public_search'）は、各グラニュールグループに対してインデックスが格納している最小値と最大値の間にある可能性が非常に高く、その結果ClickHouseはそのグラニュールグループを選択せざるを得なくなります（クエリに一致する行が含まれている可能性があるため）。

### 複数のプライマリインデックスを使用する必要性 {#a-need-to-use-multiple-primary-indexes}

その結果、特定のURLを持つ行をフィルタリングするサンプルクエリを大幅に高速化したい場合は、そのクエリに最適化されたプライマリインデックスを使用する必要があります。

さらに、特定のUserIDを持つ行をフィルタリングするサンプルクエリの良好なパフォーマンスを維持したい場合は、複数のプライマリインデックスを使用する必要があります。

以下では、それを実現する方法を示します。

<a name='multiple-primary-indexes'></a>

### 追加のプライマリインデックスを作成するオプション {#options-for-creating-additional-primary-indexes}

両方のサンプルクエリ（特定のUserIDを持つ行をフィルタリングするものと、特定のURLを持つ行をフィルタリングするもの）を大幅に高速化したい場合は、次の3つのオプションのいずれかを使用して複数のプライマリインデックスを使用する必要があります：

- 異なるプライマリキーを持つ**セカンドテーブル**を作成する
- 既存のテーブルに**マテリアライズドビュー**を作成する
- 既存のテーブルに**プロジェクション**を追加する

3つのオプションすべてが、テーブルのプライマリインデックスと行のソート順を再編成するために、サンプルデータを追加のテーブルに効果的に複製します。

ただし、3つのオプションは、クエリとINSERT文のルーティングに関して、その追加テーブルがユーザーにとってどの程度透過的であるかという点で異なります。

異なるプライマリキーを持つ**セカンドテーブル**を作成する場合、クエリはそのクエリに最適なテーブルバージョンに明示的に送信する必要があり、テーブルを同期させるために新しいデータを両方のテーブルに明示的に挿入する必要があります：

<Image
  img={sparsePrimaryIndexes09a}
  size='md'
  alt='スパースプライマリインデックス 09a'
  background='white'
/>

**マテリアライズドビュー**を使用すると、追加のテーブルが暗黙的に作成され、両方のテーブル間でデータが自動的に同期されます：

<Image
  img={sparsePrimaryIndexes09b}
  size='md'
  alt='スパースプライマリインデックス 09b'
  background='white'
/>

そして**プロジェクション**は最も透過的なオプションです。暗黙的に作成された（そして隠された）追加テーブルをデータ変更と自動的に同期させるだけでなく、ClickHouseがクエリに対して最も効果的なテーブルバージョンを自動的に選択するためです：

<Image
  img={sparsePrimaryIndexes09c}
  size='md'
  alt='スパースプライマリインデックス 09c'
  background='white'
/>

以下では、複数のプライマリインデックスを作成して使用するこれら3つのオプションについて、より詳細に実例を交えて説明します。

<a name='multiple-primary-indexes-via-secondary-tables'></a>

### オプション1：セカンドテーブル {#option-1-secondary-tables}

<a name='secondary-table'></a>
プライマリキーにおいて（元のテーブルと比較して）キーカラムの順序を入れ替えた新しい追加テーブルを作成します：

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

[元のテーブル](#a-table-with-a-primary-key)から887万行すべてを追加テーブルに挿入します：

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
```

レスポンスは次のようになります：

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

最後にテーブルを最適化します：

```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```


プライマリキーのカラムの順序を変更したため、挿入された行はディスク上で異なる辞書順で格納されるようになりました（[元のテーブル](#a-table-with-a-primary-key)と比較して）。そのため、このテーブルの1083個のグラニュールも以前とは異なる値を含んでいます：

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white" />

結果として得られるプライマリキーは次のようになります：

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white" />

これにより、URLカラムでフィルタリングを行い、URL &quot;[http://public&#95;search](http://public\&#95;search)&quot; を最も頻繁にクリックした上位10人のユーザーを算出するサンプルクエリの実行を大幅に高速化できます：

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のとおりです。

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


10 行の結果。経過時間: 0.017 秒。

# highlight-next-line

319.49 千行を処理、
11.38 MB (18.41 百万行/秒、655.75 MB/秒)

```

これにより、[ほぼフルテーブルスキャンを実行する](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns)代わりに、ClickHouseはそのクエリをはるかに効率的に実行しました。

UserIDが第1キー列、URLが第2キー列である[元のテーブル](#a-table-with-a-primary-key)のプライマリインデックスでは、ClickHouseはそのクエリを実行するためにインデックスマークに対して[汎用除外検索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)を使用しましたが、UserIDとURLのカーディナリティがともに高いため、あまり効率的ではありませんでした。
```


プライマリインデックスの最初のカラムとしてURLを配置することで、ClickHouseはインデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索</a>を実行するようになります。
ClickHouseサーバーのログファイル内の対応するトレースログでこれを確認できます:

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

この追加テーブルは、URLでフィルタリングする例示クエリの実行を高速化するために最適化されていることに注意してください。

[元のテーブル](#a-table-with-a-primary-key)でのそのクエリの[パフォーマンスの悪さ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)と同様に、[`UserIDs`でフィルタリングする例示クエリ](#the-primary-index-is-used-for-selecting-granules)は、この新しい追加テーブルでは効果的に実行されません。なぜなら、UserIDがこのテーブルのプライマリインデックスの2番目のキーカラムになっているため、ClickHouseはグラニュール選択に汎用除外検索を使用することになり、これはUserIDとURLの[同様に高いカーディナリティに対してあまり効果的ではない](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)からです。
詳細については、詳細ボックスを開いてください。

<details>
    <summary>
    UserIDでフィルタリングするクエリのパフォーマンスが悪化<a name="query-on-userid-slow"></a>
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

結果は次のとおりです:

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


10 行のセット。経過時間: 0.024 秒。

# highlight-next-line

8.02 百万行を処理,
73.04 MB (340.26 百万行/秒、3.10 GB/秒)

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

これで2つのテーブルができました。それぞれ`UserIDs`でフィルタリングするクエリの高速化と、URLでフィルタリングするクエリの高速化に最適化されています:

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
- マテリアライズドビューは**暗黙的に作成されるテーブル**によって支えられており、その行順序とプライマリインデックスは指定されたプライマリキー定義に基づいています
- 暗黙的に作成されたテーブルは`SHOW TABLES`クエリでリストされ、`.inner`で始まる名前を持ちます
- マテリアライズドビューの裏付けテーブルを最初に明示的に作成し、その後ビューが`TO [db].[table]` [句](/sql-reference/statements/create/view.md)を介してそのテーブルをターゲットにすることも可能です
- `POPULATE`キーワードを使用して、ソーステーブル[hits_UserID_URL](#a-table-with-a-primary-key)から全887万行を暗黙的に作成されたテーブルに即座に投入します
- ソーステーブルhits_UserID_URLに新しい行が挿入されると、それらの行は自動的に暗黙的に作成されたテーブルにも挿入されます
- 実質的に、暗黙的に作成されたテーブルは、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と同じ行順序とプライマリインデックスを持ちます:

<Image
  img={sparsePrimaryIndexes12b1}
  size='md'
  alt='Sparse Primary Indices 12b1'
  background='white'
/>

ClickHouseは、暗黙的に作成されたテーブルの[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns)(_.bin)、[マークファイル](#mark-files-are-used-for-locating-granules)(_.mrk2)、および[プライマリインデックス](#the-primary-index-has-one-entry-per-granule)(primary.idx)を、ClickHouseサーバーのデータディレクトリ内の特別なフォルダに保存します:

<Image
  img={sparsePrimaryIndexes12b2}
  size='md'
  alt='Sparse Primary Indices 12b2'
  background='white'
/>

:::

マテリアライズドビューを支える暗黙的に作成されたテーブル(とそのプライマリインデックス)を使用して、URL列でフィルタリングする例示クエリの実行を大幅に高速化できるようになりました:

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


10 行取得。経過時間: 0.026 秒。

# highlight-next-line

335.87 千行を処理、
13.54 MB (12.91 百万行/秒、520.38 MB/秒)

```

マテリアライズドビューの基盤となる暗黙的に作成されたテーブル(およびそのプライマリインデックス)は、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と実質的に同一であるため、クエリは明示的に作成したテーブルと同様に効率的に実行されます。

ClickHouseサーバーログファイル内の対応するトレースログは、ClickHouseがインデックスマークに対してバイナリサーチを実行していることを示しています:
```


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

### オプション3: プロジェクション {#option-3-projections}

既存のテーブルにプロジェクションを作成します:

```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

プロジェクションをマテリアライズします:

```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note

- プロジェクションは、プロジェクションの`ORDER BY`句に基づいて行順序とプライマリインデックスが決定される**隠しテーブル**を作成します
- 隠しテーブルは`SHOW TABLES`クエリには表示されません
- `MATERIALIZE`キーワードを使用して、ソーステーブル[hits_UserID_URL](#a-table-with-a-primary-key)から全887万行を隠しテーブルに即座に投入します
- ソーステーブルhits_UserID_URLに新しい行が挿入されると、それらの行は自動的に隠しテーブルにも挿入されます
- クエリは常に(構文的には)ソーステーブルhits_UserID_URLを対象としますが、隠しテーブルの行順序とプライマリインデックスがより効率的なクエリ実行を可能にする場合は、代わりに隠しテーブルが使用されます
- プロジェクションは、ORDER BYがプロジェクションのORDER BY文と一致する場合でも、ORDER BYを使用するクエリの効率を向上させないことに注意してください(https://github.com/ClickHouse/ClickHouse/issues/47333 を参照)
- 実質的に、暗黙的に作成された隠しテーブルは、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と同じ行順序とプライマリインデックスを持ちます:

<Image
  img={sparsePrimaryIndexes12c1}
  size='md'
  alt='Sparse Primary Indices 12c1'
  background='white'
/>

ClickHouseは、隠しテーブルの[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns)(_.bin)、[マークファイル](#mark-files-are-used-for-locating-granules)(_.mrk2)、および[プライマリインデックス](#the-primary-index-has-one-entry-per-granule)(primary.idx)を、ソーステーブルのデータファイル、マークファイル、プライマリインデックスファイルの隣にある特別なフォルダ(下のスクリーンショットでオレンジ色でマークされています)に保存します:

<Image
  img={sparsePrimaryIndexes12c2}
  size='sm'
  alt='Sparse Primary Indices 12c2'
  background='white'
/>

:::

プロジェクションによって作成された隠しテーブル(とそのプライマリインデックス)を(暗黙的に)使用することで、URL列でフィルタリングする例示クエリの実行を大幅に高速化できるようになりました。クエリは構文的にはプロジェクションのソーステーブルを対象としていることに注意してください。

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

結果は次のとおりです:

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


10 行がセットに含まれています。経過時間: 0.029 秒。

# highlight-next-line

319.49 千行を処理、1
1.38 MB（11.05 百万行/秒、393.58 MB/秒）

```

プロジェクションによって作成される隠しテーブル(およびそのプライマリインデックス)は、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と実質的に同一であるため、クエリは明示的に作成したテーブルと同様に効率的に実行されます。

ClickHouseサーバーログファイル内の対応するトレースログは、ClickHouseがインデックスマークに対してバイナリサーチを実行していることを示しています:
```


```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
# highlight-next-line
...Executor): パーツ prj_url_userid のインデックス範囲で二分探索を実行中 (1083 マーク)
...Executor): ...
# highlight-next-line
...Executor): 完全な通常プロジェクション prj_url_userid を選択
...Executor): プロジェクションに必要なカラム: URL, UserID
...Executor): パーティションキーで 1/1 パーツを選択、プライマリキーで 1 パーツを選択、
# highlight-next-line
              プライマリキーで 39/1083 マーク、1 範囲から 39 マークを読み取り
...Executor): 2 ストリームで約 319488 行を読み取り中
```

### まとめ {#summary}

[複合プライマリキー (UserID, URL) を持つテーブル](#a-table-with-a-primary-key)のプライマリインデックスは、[UserID でフィルタリングするクエリ](#the-primary-index-is-used-for-selecting-granules)の高速化に非常に有用でした。しかし、URL カラムが複合プライマリキーの一部であるにもかかわらず、そのインデックスは [URL でフィルタリングするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)の高速化にはほとんど役立ちません。

逆の場合も同様です。
[複合プライマリキー (URL, UserID) を持つテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)のプライマリインデックスは、[URL でフィルタリングするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)を高速化しましたが、[UserID でフィルタリングするクエリ](#the-primary-index-is-used-for-selecting-granules)にはほとんど役立ちませんでした。

プライマリキーカラムである UserID と URL のカーディナリティがどちらも高いため、2番目のキーカラムでフィルタリングするクエリは、[2番目のキーカラムがインデックスに含まれていてもほとんど恩恵を受けません](#generic-exclusion-search-algorithm)。

したがって、プライマリインデックスから2番目のキーカラムを削除し(インデックスのメモリ消費量が削減されます)、代わりに[複数のプライマリインデックスを使用する](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes)ことが合理的です。

ただし、複合プライマリキーのキーカラム間でカーディナリティに大きな差がある場合は、プライマリキーカラムをカーディナリティの昇順に並べることが[クエリにとって有益](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)です。

キーカラム間のカーディナリティの差が大きいほど、キー内のカラムの順序がより重要になります。これについては次のセクションで実証します。


## キーカラムの効率的な順序付け {#ordering-key-columns-efficiently}

<a name='test'></a>

複合プライマリキーにおいて、キーカラムの順序は以下の両方に大きな影響を与えます:

- クエリにおけるセカンダリキーカラムでのフィルタリングの効率
- テーブルのデータファイルの圧縮率

これを実証するために、[Webトラフィックサンプルデータセット](#data-set)のバージョンを使用します。各行には、インターネット「ユーザー」(`UserID`カラム)によるURL(`URL`カラム)へのアクセスがボットトラフィックとしてマークされたかどうかを示す3つのカラム(`IsRobot`カラム)が含まれています。

前述の3つのカラムすべてを含む複合プライマリキーを使用します。これは、以下を計算する典型的なWeb解析クエリを高速化するために使用できます:

- 特定のURLへのトラフィックのうち、どの程度(何パーセント)がボットからのものか
- 特定のユーザーがボットである(ない)ことをどの程度確信できるか(そのユーザーからのトラフィックの何パーセントがボットトラフィックであると(ないと)想定されるか)

複合プライマリキーのキーカラムとして使用したい3つのカラムのカーディナリティを計算するために、このクエリを使用します(ローカルテーブルを作成せずにTSVデータをアドホックにクエリするために[URLテーブル関数](/sql-reference/table-functions/url.md)を使用していることに注意してください)。`clickhouse client`でこのクエリを実行します:

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

レスポンスは次のとおりです:

```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

カーディナリティには大きな差があり、特に`URL`カラムと`IsRobot`カラムの間で顕著です。したがって、複合プライマリキーにおけるこれらのカラムの順序は、これらのカラムでフィルタリングするクエリの効率的な高速化と、テーブルのカラムデータファイルの最適な圧縮率の達成の両方にとって重要です。

これを実証するために、ボットトラフィック解析データ用に2つのテーブルバージョンを作成します:

- 複合プライマリキー`(URL, UserID, IsRobot)`を持つテーブル`hits_URL_UserID_IsRobot`。キーカラムをカーディナリティの降順で並べます
- 複合プライマリキー`(IsRobot, UserID, URL)`を持つテーブル`hits_IsRobot_UserID_URL`。キーカラムをカーディナリティの昇順で並べます

複合プライマリキー`(URL, UserID, IsRobot)`を持つテーブル`hits_URL_UserID_IsRobot`を作成します:

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

レスポンスは次のとおりです:

```response
0 rows in set. Elapsed: 104.729 sec. Processed 8.87 million rows, 15.88 GB (84.73 thousand rows/s., 151.64 MB/s.)
```

次に、複合プライマリキー`(IsRobot, UserID, URL)`を持つテーブル`hits_IsRobot_UserID_URL`を作成します:

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

そして、前のテーブルに投入したのと同じ887万行のデータを投入します:


```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```

レスポンスは次のとおりです:

```response
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```

### セカンダリキーカラムでの効率的なフィルタリング {#efficient-filtering-on-secondary-key-columns}

クエリが複合キーの一部である少なくとも1つのカラムでフィルタリングを行い、それが最初のキーカラムである場合、[ClickHouseはそのキーカラムのインデックスマークに対してバイナリサーチアルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

クエリが複合キーの一部であるカラムで(のみ)フィルタリングを行うが、それが最初のキーカラムではない場合、[ClickHouseはそのキーカラムのインデックスマークに対して汎用除外検索アルゴリズムを使用します](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

2番目のケースでは、複合プライマリキー内のキーカラムの順序が[汎用除外検索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)の有効性に大きく影響します。

以下は、キーカラム`(URL, UserID, IsRobot)`をカーディナリティの降順で並べたテーブルの`UserID`カラムでフィルタリングを行うクエリです:

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


1 行が結果セットに含まれています。経過時間: 0.026 秒。

# highlight-next-line

7.92 百万行を処理、
31.67 MB (306.90 百万行/秒、1.23 GB/秒)

````

これは、キー列 `(IsRobot, UserID, URL)` をカーディナリティの昇順に並べたテーブルに対する同じクエリです:
```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
````

レスポンスは次のとおりです：

```response
┌─count()─┐
│      73 │
└─────────┘
```


1 行セット。経過時間: 0.003 秒。

# highlight-next-line

20.32 千行を処理しました、
81.28 KB (6.61 百万行/秒、26.44 MB/秒)

````

キーカラムをカーディナリティの昇順で並べたテーブルでは、クエリの実行が大幅に効率的かつ高速になることがわかります。

その理由は、[汎用除外検索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)が最も効果的に機能するのは、先行するキーカラムのカーディナリティが低い場合に、後続のキーカラムを介して[グラニュール](#the-primary-index-is-used-for-selecting-granules)が選択されるときだからです。これについては、このガイドの[前のセクション](#generic-exclusion-search-algorithm)で詳しく説明しました。

### データファイルの最適な圧縮率 {#optimal-compression-ratio-of-data-files}

このクエリは、上記で作成した2つのテーブル間で`UserID`カラムの圧縮率を比較します:

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

これはレスポンスです。

```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2行のデータ。経過時間: 0.006秒
```

`UserID` 列の圧縮率は、キー列をカーディナリティの昇順で `(IsRobot, UserID, URL)` のように並べたテーブルの方が、明らかに高いことがわかります。

両方のテーブルにはまったく同じデータ（どちらにも同じ 887 万行を挿入）を格納しているにもかかわらず、複合主キー内のキー列の順序は、テーブル内の<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮済み</a>データが [列データファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) 上で必要とするディスク容量に大きな影響を与えます。

* 複合主キー `(URL, UserID, IsRobot)` を持ち、キー列をカーディナリティの降順で並べたテーブル `hits_URL_UserID_IsRobot` では、`UserID.bin` データファイルは **11.24 MiB** のディスク容量を使用します
* 複合主キー `(IsRobot, UserID, URL)` を持ち、キー列をカーディナリティの昇順で並べたテーブル `hits_IsRobot_UserID_URL` では、`UserID.bin` データファイルは **877.47 KiB** のディスク容量しか使用しません

テーブルの列データがディスク上で高い圧縮率を持つことは、ディスク容量を節約できるだけでなく、その列からデータを読み取る必要があるクエリ（特に分析クエリ）を高速化します。列データをディスクからメインメモリ（オペレーティングシステムのファイルキャッシュ）へ移動するために必要な I/O 量が少なくて済むためです。

以下では、テーブルの列の圧縮率にとって、主キー列をカーディナリティの昇順で並べることが有利である理由を説明します。

次の図は、キー列がカーディナリティの昇順で並んでいる主キーに対して、行がディスク上で並ぶ順序の概要を示したものです。

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white" />

[テーブルの行データは主キー列で並べ替えられた順序でディスク上に格納される](#data-is-stored-on-disk-ordered-by-primary-key-columns)ことについては、すでに説明しました。


上記の図では、テーブルの行（ディスク上の列値）はまず`cl`値でソートされ、同じ`cl`値を持つ行は`ch`値でソートされます。最初のキー列`cl`はカーディナリティが低いため、同じ`cl`値を持つ行が存在する可能性が高くなります。その結果、`ch`値もソートされている可能性が高くなります（ローカルに - 同じ`cl`値を持つ行内で）。

列内で類似したデータが互いに近くに配置されている場合、例えばソートによって、そのデータはより効率的に圧縮されます。
一般的に、圧縮アルゴリズムはデータのランレングス（処理するデータが多いほど圧縮効率が向上）と局所性（データの類似性が高いほど圧縮率が向上）の恩恵を受けます。

上記の図とは対照的に、下記の図はキー列がカーディナリティの降順でソートされたプライマリキーに対する行のディスク上の順序を示しています：

<Image
  img={sparsePrimaryIndexes14b}
  size='md'
  alt='スパースプライマリインデックス 14b'
  background='white'
/>

この場合、テーブルの行はまず`ch`値でソートされ、同じ`ch`値を持つ行は`cl`値でソートされます。
しかし、最初のキー列`ch`はカーディナリティが高いため、同じ`ch`値を持つ行が存在する可能性は低くなります。その結果、`cl`値がソートされている可能性も低くなります（ローカルに - 同じ`ch`値を持つ行内で）。

したがって、`cl`値はランダムな順序である可能性が高く、その結果、局所性と圧縮率がそれぞれ低下します。

### まとめ {#summary-1}

クエリにおけるセカンダリキー列の効率的なフィルタリングと、テーブルの列データファイルの圧縮率の両方において、プライマリキー内の列をカーディナリティの昇順でソートすることが有益です。


## 単一行の効率的な識別 {#identifying-single-rows-efficiently}

一般的にはClickHouseの[最適なユースケースではありません](/knowledgebase/key-value)が、
ClickHouse上に構築されたアプリケーションでは、ClickHouseテーブルの単一行を識別する必要が生じる場合があります。

直感的な解決策として、行ごとに一意の値を持つ[UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)カラムを使用し、行を高速に取得するためにそのカラムをプライマリキーカラムとして使用することが考えられます。

最速の取得を実現するには、UUIDカラムを[最初のキーカラムにする必要があります](#the-primary-index-is-used-for-selecting-granules)。

[ClickHouseテーブルの行データはプライマリキーカラムで順序付けられてディスクに保存される](#data-is-stored-on-disk-ordered-by-primary-key-columns)ため、非常に高いカーディナリティを持つカラム(UUIDカラムなど)をプライマリキーに含めたり、複合プライマリキーで低カーディナリティのカラムより前に配置したりすることは、[他のテーブルカラムの圧縮率に悪影響を及ぼす](#optimal-compression-ratio-of-data-files)ことを説明しました。

最速の取得と最適なデータ圧縮のバランスを取る方法は、テーブルの一部のカラムに対して良好な圧縮率を確保するために使用される低カーディナリティのキーカラムの後に、UUIDを最後のキーカラムとして配置した複合プライマリキーを使用することです。

### 具体例 {#a-concrete-example}

具体例の一つは、Alexey Milovidovが開発し[ブログで紹介した](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)プレーンテキストペーストサービス[https://pastila.nl](https://pastila.nl)です。

テキストエリアへの変更ごとに、データは自動的にClickHouseテーブルの行に保存されます(変更ごとに1行)。

ペーストされたコンテンツ(の特定バージョン)を識別および取得する方法の一つは、コンテンツのハッシュをそのコンテンツを含むテーブル行のUUIDとして使用することです。

次の図は以下を示しています

- コンテンツが変更されたときの行の挿入順序(例えば、テキストエリアにテキストを入力するキーストロークによる変更)
- `PRIMARY KEY (hash)`を使用した場合の、挿入された行のデータのディスク上の順序:

<Image
  img={sparsePrimaryIndexes15a}
  size='md'
  alt='Sparse Primary Indices 15a'
  background='white'
/>

`hash`カラムがプライマリキーカラムとして使用されているため

- 特定の行を[非常に高速に](#the-primary-index-is-used-for-selecting-granules)取得できますが、
- テーブルの行(そのカラムデータ)は、(一意でランダムな)ハッシュ値の昇順でディスクに保存されます。そのため、contentカラムの値もランダムな順序で保存され、データの局所性がなく、**contentカラムのデータファイルの圧縮率が最適ではない**結果となります。

特定の行の高速な取得を維持しながらcontentカラムの圧縮率を大幅に改善するために、pastila.nlは特定の行を識別するために2つのハッシュ(および複合プライマリキー)を使用しています:

- 上述したように、異なるデータに対して異なる値を持つコンテンツのハッシュ
- データの小さな変更では**変化しない**[局所性鋭敏型ハッシュ(フィンガープリント)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)

次の図は以下を示しています

- コンテンツが変更されたときの行の挿入順序(例えば、テキストエリアにテキストを入力するキーストロークによる変更)
- 複合`PRIMARY KEY (fingerprint, hash)`を使用した場合の、挿入された行のデータのディスク上の順序:

<Image
  img={sparsePrimaryIndexes15b}
  size='md'
  alt='Sparse Primary Indices 15b'
  background='white'
/>

これにより、ディスク上の行はまず`fingerprint`で順序付けられ、同じfingerprintの値を持つ行については、その`hash`の値が最終的な順序を決定します。

わずかな変更のみが異なるデータは同じfingerprintの値を取得するため、類似したデータはcontentカラム内でディスク上で互いに近接して保存されるようになります。これはcontentカラムの圧縮率にとって非常に有益です。なぜなら、圧縮アルゴリズムは一般的にデータの局所性から恩恵を受けるからです(データが類似しているほど圧縮率が向上します)。

トレードオフとして、複合`PRIMARY KEY (fingerprint, hash)`から生成されるプライマリインデックスを最適に活用するために、特定の行の取得には2つのフィールド(`fingerprint`と`hash`)が必要になります。
