---
sidebar_label: '主キーインデックス'
sidebar_position: 1
description: 'このガイドでは、ClickHouseのインデックスについて深く掘り下げていきます。'
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

# ClickHouseの主キーインデックスの実用的な紹介
## はじめに {#introduction}

このガイドでは、ClickHouseのインデックスについて深く掘り下げていきます。以下の点について詳しく説明します：
- [ClickHouseのインデックスが従来のリレーショナルデータベース管理システムのインデックスとどのように異なるか](#an-index-design-for-massive-data-scales)
- [ClickHouseがテーブルのスパース主キーインデックスをどのように構築し使用しているか](#a-table-with-a-primary-key)
- [ClickHouseでのインデックスのベストプラクティスは何か](#using-multiple-primary-indexes)

このガイドに記載されたすべてのClickHouse SQL文やクエリは、ご自身のマシンで実行することができます。
ClickHouseのインストールおよび始め方の手順については、[クイックスタート](/quick-start.mdx)を参照してください。

:::note
このガイドは、ClickHouseのスパース主キーインデックスに焦点を当てています。

ClickHouseの[二次データスキッピングインデックス](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)については、[チュートリアル](/guides/best-practices/skipping-indexes.md)をご覧ください。
:::
### データセット {#data-set}

このガイドの中では、サンプルの匿名化されたウェブトラフィックデータセットを使用します。

- サンプルデータセットからの8.87百万行（イベント）のサブセットを使用します。
- 非圧縮データのサイズは8.87百万イベントで約700MBです。ClickHouseに保存すると200MBに圧縮されます。
- サブセットにおいて、各行はインターネットユーザーを示す3つのカラムを含みます（`UserID`カラム）、特定の時間にURLをクリックした（`URL`カラム）、イベント時間（`EventTime`カラム）を示します。

この3つのカラムを使って、以下のような典型的なウェブ分析クエリを提案できます：

- "特定のユーザーの最もクリックされたURLのトップ10は？"
- "特定のURLを最も頻繁にクリックしたユーザーのトップ10は誰か？"
- "特定のURLをユーザーがクリックする最も人気のある時間帯（例：曜日）は？"
### テストマシン {#test-machine}

このドキュメントに記載されたすべての実行時間の数字は、Apple M1 Proチップと16GBのRAMを搭載したMacBook Pro上でClickHouse 22.2.1をローカルに実行した際のものです。
### フルテーブルスキャン {#a-full-table-scan}

プライマリーキーなしでデータセットに対してクエリが実行される方法を確認するために、次のSQL DDL文を実行して（MergeTreeテーブルエンジンを使用して）テーブルを作成します：

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

次に、以下のSQL挿入文を使用して、ヒットデータセットのサブセットをテーブルに挿入します。
これには、クリックハウス.comにリモートホストされた完全なデータセットのサブセットを読み込むために[URLテーブル関数](/sql-reference/table-functions/url.md)が使用されています。

```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
レスポンスは以下の通りです：
```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```

ClickHouseクライアントの結果出力は、上記のステートメントがテーブルに8.87百万行を挿入したことを示しています。

最後に、後の議論を簡単にし、図や結果を再現性のあるものにするために、`FINAL`キーワードを使用してテーブルを[最適化](/sql-reference/statements/optimize.md)します：

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
一般的に、データを読み込んだ後にテーブルをすぐに最適化する必要はありませんし、推奨もされません。この例でなぜこれが必要かは後で明らかになります。
:::

最初のウェブ分析クエリを実行します。以下は、UserID 749927693のインターネットユーザーに対して最もクリックされたURLのトップ10を計算するクエリです。

```sql
SELECT URL, count(URL) as Count
FROM hits_NoPrimaryKey
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```
レスポンスは次のようになります：
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
// highlight-next-line
Processed 8.87 million rows,
70.45 MB (398.53 million rows/s., 3.17 GB/s.)
```

ClickHouseクライアントの結果出力は、ClickHouseがフルテーブルスキャンを実行したことを示しています！8.87百万行のテーブルの各行がClickHouseにストリームされました。これはスケールしません。

これを（はるかに）効率よく（ずっと）速くするためには、適切な主キーを持つテーブルを使用する必要があります。これにより、ClickHouseは自動的に（主キーのカラムに基づいて）スパース主キーインデックスを作成し、例のクエリの実行を大幅に高速化できます。
### 関連コンテンツ {#related-content}
- ブログ: [ClickHouseクエリの高速化](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## ClickHouseインデックス設計 {#clickhouse-index-design}
### 大規模データスケールのためのインデックス設計 {#an-index-design-for-massive-data-scales}

従来のリレーショナルデータベース管理システムでは、主インデックスはテーブルの行ごとに1つのエントリを含むことになります。これにより、主インデックスは私たちのデータセットに対して8.87百万のエントリを含むことになります。このようなインデックスは、特定の行を迅速に特定できるため、ルックアップクエリやポイント更新において高効率を実現します。`B(+)-Tree`データ構造におけるエントリの検索は、平均時間計算量が`O(log n)`です；より正確には、`log_b n = log_2 n / log_2 b`、ここで`b`は`B(+)-Tree`の分岐係数で、`n`はインデックスされた行の数です。`b`は通常、数百から数千の間の値を持つため、`B(+)-Trees`は非常に浅い構造であり、レコードを特定するために必要なディスクアクセスも少なく済みます。8.87百万行で分岐係数が1000の場合、平均して2.3回のディスクアクセスが必要です。この能力は、多くのディスクおよびメモリのオーバーヘッド、新しい行をテーブルに追加しインデックスにエントリを追加する際の高い挿入コスト、時にはB-Treeの再バランスを必要とするというコストを伴います。

B-Treeインデックスに関連する課題を考慮に入れて、ClickHouseのテーブルエンジンは異なるアプローチを利用しています。ClickHouseの[MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family/index.md)は、大規模なデータボリュームを処理するために設計および最適化されています。これらのテーブルは毎秒百万行の挿入を受け入れ、非常に大きなデータ（100ペタバイト以上）を格納するために設計されています。データは迅速にテーブルに[パーツごと](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)書き込まれ、バックグラウンドでパーツをマージするためのルールが適用されます。ClickHouseにおいて各パーツにはそれぞれの主インデックスがあります。パーツがマージされると、マージされたパーツの主インデックスもマージされます。ClickHouseが設計された非常に大規模な環境では、ディスクおよびメモリの効率が重要です。したがって、各行をインデックスするのではなく、パーツの主インデックスには行のグループごとに1つのインデックスエントリ（「マーク」として知られる）が存在します。この技術は**スパースインデックス**と呼ばれます。

スパースインデックスが可能であるのは、ClickHouseがパーツの行をディスク上で主キーのカラムに従って順序付けて保存しているためです。個々の行を直接特定するのではなく（B-Treeベースのインデックスのように）、スパース主インデックスはインデックスエントリのバイナリ検索を通じて、クエリに対して一致する可能性のある行のグループを迅速に特定することを可能にします。特定された一群の一致する可能性のある行（グラニュール）は、その後、並行してClickHouseエンジンにストリーミングされます。このインデックス設計により、主インデックスは小さく（完全にメインメモリに収まる必要があります）、クエリ実行時間を大幅に短縮します：特にデータ分析の使用ケースで典型的な範囲クエリの場合に。

以下は、ClickHouseがどのようにスパース主インデックスを構築し、使用しているのかを詳細に示します。後のセクションでは、インデックスを構築するために使用されるテーブルカラムの選択、削除、順序に関するいくつかのベストプラクティスについて議論します。
### 主キーを持つテーブル {#a-table-with-a-primary-key}

UserIDとURLのキーカラムを持つコンパウンド主キーを持つテーブルを作成します：

```sql
CREATE TABLE hits_UserID_URL
(
    `UserID` UInt32,
    `URL` String,
    `EventTime` DateTime
)
ENGINE = MergeTree
// highlight-next-line
PRIMARY KEY (UserID, URL)
ORDER BY (UserID, URL, EventTime)
SETTINGS index_granularity = 8192, index_granularity_bytes = 0, compress_primary_key = 0;
```

[//]: # (<details open>)
<details>
    <summary>
    DDL文の詳細
    </summary>
    <p>

このガイドの今後の議論を簡潔にし、図や結果を再現可能にするために、DDL文は：

<ul>
  <li>
    <code>ORDER BY</code>句を介してテーブルの複合ソートキーを指定します。
  </li>
  <li>
    セッティングの介して、主インデックスのエントリ数を明示的に制御します：
    <ul>
      <li>
        <code>index_granularity</code>: デフォルト値の8192に明示的に設定されます。これは、8192行の各グループに対して主インデックスが1つのインデックスエントリを持つことを意味しています。例えば、テーブルに16384行がある場合、インデックスには2つのインデックスエントリが存在します。
      </li>
      <li>
        <code>index_granularity_bytes</code>: <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">適応インデックスグラニュラリティ</a>を無効にするために0に設定されています。適応インデックスグラニュラリティは、ClickHouseが次のいずれかが真の場合に、n行のグループに対して1つのインデックスエントリを自動的に作成することを意味します：
        <ul>
          <li>
            <code>n</code>が8192未満であり、かつその<code>n</code>行の合計行データサイズが10MB以上（<code>index_granularity_bytes</code>のデフォルト値）である場合。
          </li>
          <li>
            <code>n</code>行の合計行データサイズが10MB未満であるが、<code>n</code>が8192である場合。
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: 主インデックスの<a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">圧縮を無効にするために0</a>に設定されます。これにより、後でその内容をオプションで検査することができます。
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

DDL文で指定された主キーは、指定された2つのキーカラムに基づいて主インデックスの作成を誘発します。

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
レスポンスは以下のようになります：
```response
0 rows in set. Elapsed: 149.432 sec. Processed 8.87 million rows, 18.40 GB (59.38 thousand rows/s., 123.16 MB/s.)
```

<br/>
そして、テーブルを最適化します：

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br/>
次に、テーブルのメタデータを取得するためのクエリを使用します：

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

レスポンスは以下のようになります：

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

ClickHouseクライアントの出力は以下を示しています：

- テーブルのデータは、ディスク上の特定のディレクトリに[ワイドフォーマット](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)で保存されており、そのディレクトリ内には各テーブルカラムに対して1つのデータファイルと1つのマークファイルがあります。
- テーブルには8.87百万行が含まれています。
- すべての行の合計の非圧縮データサイズは733.28MBです。
- すべての行のディスク上での圧縮サイズは206.94MBです。
- テーブルには1083エントリ（「マーク」と呼ばれる）の主インデックスがあり、そのサイズは96.93KBです。
- 合計で、テーブルのデータファイル、マークファイル、および主インデックスファイルは、ディスク上で207.07MBを占めています。
### データは主キーのカラムによってディスク上で順序付けられて保存される {#data-is-stored-on-disk-ordered-by-primary-key-columns}

上記で作成したテーブルは以下の特徴を持っています：
- 複合[主キー](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)`と
- 複合[ソートキー](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`。

:::note
- ソートキーのみを指定している場合、主キーは暗黙のうちにソートキーに等しいと定義されます。

- メモリ効率を考慮して、クエリでフィルタリングされるカラムのみを含む主キーを明示的に指定しました。主キーに基づいている主インデックスは、メインメモリに完全に読み込まれます。

- ガイドの図の一貫性を維持し、圧縮率を最大化するために、すべてのテーブルカラムを含む別のソートキーを定義しました（同じデータが近くに配置されている場合、例えばソートを通じて、そのデータはより良く圧縮されます）。

- 主キーを指定する場合、主キーはソートキーのプレフィックスである必要があります。
:::

挿入された行は、主キーのカラム（および追加の`EventTime`カラム）の順序に従ってディスク上に辞書式に（昇順に）保存されます。

:::note
ClickHouseは、同じ主キーのカラム値を持つ複数の行の挿入を許可します。この場合（下の図の行1と行2を参照）、最終的な順序は指定されたソートキーによって決まります。したがって、`EventTime`カラムの値が重要です。
:::

ClickHouseは<a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">列指向データベース管理システム</a>です。以下の図示は示しています：
- ディスク上の表現については、各テーブルカラムごとに1つのデータファイル（*.bin）があり、すべての値が<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a>された形式で保存されます。
- 8.87百万行は、主キーのカラム（および追加のソートキーのカラム）で辞書式の昇順にディスク上に保存されます。すなわち、この場合、
  - 最初に`UserID`で、
  - 次に`URL`で、
  - 最後に`EventTime`で並べられます：

<img src={sparsePrimaryIndexes01} class="image"/>

`UserID.bin`、`URL.bin`、及び`EventTime.bin`は、それぞれ`UserID`、`URL`、`EventTime`のカラムの値が保存されているディスク上のデータファイルです。

<br/>
<br/>

:::note
- 主キーはディスク上の行の辞書式の順序を定義するため、テーブルには1つの主キーしか存在できません。

- 行の番号は0から始めており、ClickHouseの内部的な行番号付けのスキームと整合させています。これは、ログメッセージにも使用されます。
:::
### データはグラニュールに整理されており、並列データ処理が可能 {#data-is-organized-into-granules-for-parallel-data-processing}

データ処理の目的で、テーブルのカラム値は論理的にグラニュールに分割されます。
グラニュールは、データ処理のためにClickHouseにストリームされる最小の不可分なデータセットです。
これは、個々の行を読み込むのではなく、ClickHouseが常に一度に一群（グラニュール）の行を読み込むことを意味します。
:::note
カラム値は物理的にグラニュール内に保存されるわけではありません：グラニュールはクエリ処理のためのカラム値の論理的な組織に過ぎません。
:::

次の図は、8.87百万行のテーブルの（カラム値が）1083のグラニュールに整理されるさまを示しています。これはテーブルのDDL文に設定された`index_granularity`（デフォルト値8192に設定）を考慮した結果です。

<img src={sparsePrimaryIndexes02} class="image"/>

最初の（ディスク上の物理的順序に基づく）8192行（そのカラム値）は論理的にグラニュール0に属し、その後の8192行（そのカラム値）はグラニュール1に属します。

:::note
- 最後のグラニュール（グラニュール1082）は、8192行未満の「含むから」です。

- このガイドの最初で、私たちは[適応インデックスグラニュラリティ](/whats-new/changelog/2019.md/#experimental-features-1)を無効にしたと述べました（このガイドでの議論を簡略化するため、または図や結果を再現可能にするためにです）。

したがって、例のテーブルのすべてのグラニュール（最後のものを除いて）は、同じサイズを持っています。

- 適応インデックスグラニュラリティのあるテーブル（インデックスグラニュラリティはデフォルトで[適応](/operations/settings/merge-tree-settings#index_granularity_bytes)である場合、いくつかのグラニュールは行データ長に応じて8192行未満である可能性があります。

- 主キーのカラム（`UserID`、`URL`）の一部のカラム値はオレンジでマークされており、これらのオレンジでマークされたカラム値は、各グラニュールの最初の行の主キーのカラム値です。
これらのオレンジでマークされたカラム値は、テーブルの主インデックスにおけるエントリとなります。

- グラニュールは0から始めて番号を付けており、ClickHouseの内部的な番号付けスキームと整合しています。これもまたログメッセージに利用できます。
:::
```yaml
title: '主キーインデックスはグラニュールごとに1エントリを持っています'
sidebar_label: '主キーインデックスはグラニュールごとに1エントリを持っています'
keywords: '主キー, インデックス, グラニュール, ClickHouse'
description: 'このドキュメントでは、主キーインデックスに関する詳細情報を提供します。'
```

### 主キーインデックスはグラニュールごとに1エントリを持っています {#the-primary-index-has-one-entry-per-granule}

主キーインデックスは上の図に示すグラニュールに基づいて作成されます。このインデックスは非圧縮のフラット配列ファイル（primary.idx）であり、0から始まるいわゆる数値インデックスマークを含んでいます。

以下の図は、そのインデックスが各グラニュールの最初の行の主キー列の値（上の図でオレンジ色でマークされた値）を格納していることを示しています。
言い換えれば、主キーインデックスは、テーブルの8192行ごとの主キー列の値を格納しています（主キー列で定義された物理行順に基づく）。
例えば
- 最初のインデックスエントリ（以下の図の「マーク 0」）は、上の図からグラニュール0の最初の行のキー列の値を格納しています。
- 2番目のインデックスエントリ（以下の図の「マーク 1」）は、上の図からグラニュール1の最初の行のキー列の値を格納しています。このように続きます。

<img src={sparsePrimaryIndexes03a} class="image"/>

合計で、8.87百万行と1083グラニュールを持つテーブルのインデックスには1083のエントリがあります：

<img src={sparsePrimaryIndexes03b} class="image"/>

:::note
- [適応インデックスの粒度](/whats-new/changelog/2019.md/#experimental-features-1)を持つテーブルの場合、主インデックスには「最終」追加マークも格納され、これは最後のテーブル行の主キー列の値を記録していますが、このガイドの議論を簡素化するために（また図示や結果の再現性を向上させるために）適応インデックスの粒度を無効にしたため、例のテーブルのインデックスにはこの最終マークは含まれていません。

- 主インデックスファイルは完全にメインメモリにロードされます。ファイルが利用可能な空きメモリスペースよりも大きい場合、ClickHouseはエラーを引き起こします。
:::

<details>
    <summary>
    主インデックスの内容を調査する
    </summary>
    <p>

セルフマネージドのClickHouseクラスターでは、<a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">ファイルテーブル関数</a>を使用して、例のテーブルの主インデックスの内容を調査できます。

そのためには、まず主インデックスファイルを実行中のクラスターのノードの<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a>にコピーする必要があります：
<ul>
<li>ステップ 1: 主インデックスファイルを含むパーツパスを取得します。</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

はテストマシンで`/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`を返します。

<li>ステップ 2: user_files_pathを取得します。</li>
Linuxの<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">デフォルトのuser_files_path</a>は
`/var/lib/clickhouse/user_files/`

Linuxでは、それが変更されたかどうかを確認できます：`$ grep user_files_path /etc/clickhouse-server/config.xml`

テストマシンではパスは`/Users/tomschreiber/Clickhouse/user_files/`です。

<li>ステップ 3: 主インデックスファイルをuser_files_pathにコピーします。</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

<br/>

</ul>

これで、SQLを使って主インデックスの内容を調査できます：
<ul>
<li>エントリ数を取得する</li>
`
SELECT count( )<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String');
`

<br/>
<br/>
は`1083`を返します。
<br/>
<br/>
<li>最初の2つのインデックスマークを取得する</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 0, 2;
`
<br/>
<br/>
は
<br/>
`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`
<br/>
<br/>
<li>最後のインデックスマークを取得する</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
<br/>
<br/>
は
<br/>
`
4292714039 │ http://sosyal-mansetleri...
`



</ul>

この内容は、例のテーブルの主インデックス内容の図と完全に一致します：
<img src={sparsePrimaryIndexes03b} class="image"/>
</p>
</details>

主キーエントリはインデックスマークと呼ばれます。なぜなら、各インデックスエントリが特定のデータ範囲の開始を示しているからです。具体的には例のテーブルについて：
- UserIDインデックスマーク:<br/>
  主インデックスに格納された`UserID`値は昇順にソートされています。<br/>
  したがって、上の図の「マーク 1」は、グラニュール1内のすべてのテーブル行の`UserID`値と、そのすべての後続グラニュールの`UserID`値が4,073,710以上であることが保証されます。

 [後で詳しく説明します](#the-primary-index-is-used-for-selecting-granules)が、ClickHouseはクエリが主キーの最初の列をフィルタリングしているときに、インデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索アルゴリズム</a>を使用できます。

- URLインデックスマーク:<br/>
  主キー列`UserID`と`URL`のほぼ同じカーディナリティは、一般に、最初の列以降のすべてのキー列のインデックスマークが、少なくとも現在のグラニュール内のすべてのテーブル行で前のキー列の値が同じである間だけデータ範囲を示すことを意味します。<br/>
  例えば、上の図でマーク0とマーク1の`UserID`値が異なるため、ClickHouseはグラニュール0内のすべてのテーブル行のすべてのURL値が`'http://showtopics.html%3...'`以上であると仮定できません。しかし、上の図でマーク0とマーク1の`UserID`値が同じだった場合（つまり、`UserID`値がグラニュール0内のすべてのテーブル行で同じである場合）、ClickHouseはグラニュール0内のすべてのテーブル行のすべてのURL値が`'http://showtopics.html%3...'`以上であると仮定できます。

  この点については、クエリの実行性能への影響を後で詳しく説明します。
### 主キーインデックスはグラニュールを選択するために使用されます {#the-primary-index-is-used-for-selecting-granules}

これで、主キーインデックスのサポートを受けてクエリを実行できます。


次のクエリは、UserID 749927693の最もクリックされた上位10のURLを計算します。

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

応答は次のとおりです：

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

10行がセットに含まれています。経過時間: 0.005秒。
// highlight-next-line
処理された行数: 8.19千行、
740.18 KB (1.53百万行/s., 138.59 MB/s.)
```

ClickHouseクライアントの出力は、テーブルスキャンを行う代わりに、8.19千行のみがClickHouseにストリーミングされたことを示しています。


もし<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">トレースロギング</a>が有効になっている場合、ClickHouseサーバーログファイルは、ClickHouseが`749927693`というUserID列の値を含む行を持つ可能性のあるグラニュールを特定するために、1083のUserIDインデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索</a>を実行していたことを示しています。これには19ステップが必要で、平均時間計算量は`O(log2 n)`です：
```response
...Executor): Key condition: (column 0 in [749927693, 749927693])
// highlight-next-line
...Executor): Running binary search on index range for part all_1_9_2 (1083 marks)
...Executor): Found (LEFT) boundary mark: 176
...Executor): Found (RIGHT) boundary mark: 177
...Executor): Found continuous range in 19 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
// highlight-next-line
              1/1083 marks by primary key, 1 marks to read from 1 ranges
...Reading ...approx. 8192 rows starting from 1441792
```


上のトレースログから、1083の既存マークのうち、クエリを満たす1マークが特定されたことがわかります。

<details>
    <summary>
    トレースログの詳細
    </summary>
    <p>

マーク176が特定されました（「見つかった左境界マーク」は含まれ、「見つかった右境界マーク」は排他的です）。したがって、グラニュール176からの8192行（1,441,792行目から開始）がClickHouseにストリーミングされ、その中でUserID列の値が`749927693`である実際の行を見つけることができます。
</p>
</details>

また、例のクエリで<a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN句</a>を使用してこれを再現できます：
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
// highlight-next-line
│                     Granules: 1/1083                                                  │
└───────────────────────────────────────────────────────────────────────────────────────┘

16行がセットに含まれています。経過時間: 0.003秒。
```
クライアントの出力は1083のグラニュールのうち1つが749927693のUserID列の値を持つ行を含む可能性があるとして選択されたことを示しています。


:::note 結論
クエリが複合キーの一部であり、最初のキー列でフィルタリングされている場合、ClickHouseはキー列のインデックスマークに対して二分探索アルゴリズムを実行します。
:::

<br/>

上で説明したように、ClickHouseはスパース主インデックスを使用して、クエリに一致する行を含む可能性があるグラニュールを迅速に（バイナリ検索を介して）選択しています。


これはClickHouseクエリ実行の**第一段階（グラニュール選択）**です。

**第二段階（データ読み込み）**では、ClickHouseは選択されたグラニュールを特定し、すべての行をClickHouseエンジンにストリーミングして、クエリに実際に一致する行を見つけます。

その第二段階については、次のセクションで詳しく説明します。
### マークファイルはグラニュールの特定に使用されます {#mark-files-are-used-for-locating-granules}

以下の図は、テーブルの主インデックスファイルの一部を示しています。

<img src={sparsePrimaryIndexes04} class="image"/>

上で説明したように、1083のUserIDマークに対する二分検索を介してマーク176が特定されました。したがって、対応するグラニュール176はUserID列の値749,927,693を含む行を持つ可能性があります。

<details>
    <summary>
    グラニュール選択の詳細
    </summary>
    <p>

上の図は、マーク176が関連するグラニュール176の最小UserID値が749,927,693未満で、次のマーク（マーク177）のグラニュール177の最小UserID値がこの値よりも大きい最初のインデックスエントリであることを示しています。したがって、マーク176の対応するグラニュール176のみがUserID列の値749,927,693を含む可能性があります。
</p>
</details>

グラニュール176に行が含まれているかどうかを確認するためには、このグラニュールに属する全8192行をClickHouseにストリーミングする必要があります。

これを実現するために、ClickHouseはグラニュール176の物理的な場所を知る必要があります。

ClickHouseでは、我々のテーブルのすべてのグラニュールの物理的な場所がマークファイルに格納されています。データファイルと同様に、テーブルの各列ごとに1つのマークファイルがあります。

以下の図は、テーブルの`UserID`、`URL`、`EventTime`列のグラニュールの物理的な場所を格納している3つのマークファイル`UserID.mrk`、`URL.mrk`、`EventTime.mrk`を示しています。
<img src={sparsePrimaryIndexes05} class="image"/>

主インデックスが、0から始まるインデックスマークを含む非圧縮のフラット配列ファイル（primary.idx）であることを説明しました。

同様に、マークファイルも0から始まるマークを含む非圧縮のフラット配列ファイル（*.mrk）です。

ClickHouseがクエリに対して一致する行を含む可能性のあるグラニュールのインデックスマークを特定および選択した後、マークファイル内の位置配列ルックアップを実行して、グラニュールの物理的な場所を取得できます。

特定の列の各マークファイルエントリは、オフセットの形で2つの位置を格納しています：

- 最初のオフセット（上の図の「block_offset」）は、選択されたグラニュールの圧縮バージョンを含む<a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">ブロック</a>を<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a>されたカラムデータファイル内で特定しています。この圧縮ブロックには、いくつかの圧縮されたグラニュールが含まれている可能性があります。特定された圧縮ファイルブロックは、読み込み時にメインメモリに展開されます。

- マークファイルの2番目のオフセット（上の図の「granule_offset」）は、非圧縮されたブロックデータ内でのグラニュールの位置を提供します。

すべての8192行がその後、ClickHouseにストリーミングされ、さらなる処理に使用されます。

:::note

- [ワイドフォーマット](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)のテーブルと[適応インデックス粒度](/whats-new/changelog/2019.md/#experimental-features-1)を持たないテーブルの場合、ClickHouseは上で視覚化した`.mrk`マークファイルを使用します。そのエントリには、各エントリごとに2つの8バイト長のアドレスが含まれており、これらはすべて同じサイズのグラニュールの物理的場所です。

インデックス粒度は[デフォルトで適応的](/operations/settings/merge-tree-settings#index_granularity_bytes)ですが、例のテーブルでは適応インデックス粒度を無効にしました（このガイド内の議論を簡素化し、図や結果の再現性を持たせるため）。当テーブルはデータのサイズが[min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)よりも大きいため、ワイドフォーマットを使用しています（デフォルトでセルフマネージドクラスター向けに10MB）。

- ワイドフォーマットのテーブルで適応インデックス粒度がある場合、ClickHouseは`.mrk2`マークファイルを使用します。これには、現在のエントリに関連付けられたグラニュールの行数という追加の3番目の値が含まれています。

- [コンパクトフォーマット](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)のテーブルの場合、ClickHouseは`.mrk3`マークファイルを使用します。

:::


:::note マークファイルの理由

なぜ主インデックスがインデックスマークに対応するグラニュールの物理的な場所を直接含まないのでしょうか？

ClickHouseが設計されている非常に大規模なスケールでは、ディスクとメモリ効率を非常に重視することが重要です。

主インデックスファイルはメインメモリに収まる必要があります。

例のクエリでは、ClickHouseは主インデックスを使用して、クエリに一致する行を持つ可能性のある単一のグラニュールを選択しました。その1つのグラニュールのみのために、ClickHouseはそれに関連する行をストリーミングするために物理的な場所を必要とします。

さらに、このオフセット情報は、クエリで使用されていない列（例えば`EventTime`）には必要ありません。

例のクエリにおいて、ClickHouseはUserIDデータファイル（UserID.bin）内のグラニュール176の物理的な場所オフセット2つと、URLデータファイル（URL.bin）内のグラニュール176の物理的な場所オフセット2つのみが必要です。

マークファイルによって提供される間接性により、主インデックス内に3列のすべての1083グラニュールの物理的な場所のエントリを直接保存することを回避できるため、メインメモリ内の不要な（潜在的に未使用の）データを避けることができます。
:::

以下の図とその下のテキストは、例のクエリに対してClickHouseがUserID.binデータファイル内のグラニュール176をどのように特定するかを示しています。

<img src={sparsePrimaryIndexes06} class="image"/>

これまでの説明で、ClickHouseは主インデックスマーク176を選択し、したがってグラニュール176をクエリに一致する可能性のある行を持つものとして特定したと述べました。

ClickHouseは、選択されたインデックスマーク番号（176）を使用してUserID.mrkマークファイル内で位置配列ルックアップを行い、グラニュール176の特定のために2つのオフセットを取得します。

示されているように、最初のオフセットは`UserID.bin`データファイル内の圧縮ファイルブロックを特定します。このブロックには、圧縮されたグラニュール176が含まれています。

一度特定されたファイルブロックがメインメモリに展開されると、マークファイルの2番目のオフセットを使用して、非圧縮データ内のグラニュール176を特定できます。

ClickHouseは、例のクエリを実行するために、UserID.binデータファイルおよびURL.binデータファイルの両方からグラニュール176を特定（およびすべての値をストリーミング）する必要があります。

上の図は、ClickHouseがUserID.binデータファイルのグラニュールをどのように特定しているかを示しています。

並行して、ClickHouseはURL.binデータファイルのグラニュール176について同様の操作を行っています。これらの2つのグラニュールは整列され、ClickHouseエンジンにストリーミングされてさらなる処理が行われ、すなわちUserIDが749927693であるすべての行のURL値をグループ別に集計およびカウントした後、最終的にカウントの降順で10の最大URLグループを出力します。
## 複数の主インデックスを使用する {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### セカンダリキー列は（非効率的ではない）ことができます {#secondary-key-columns-can-not-be-inefficient}


クエリが最初のキー列である複合キーの一部である列でフィルタリングされているとき、[ClickHouseはキー列のインデックスマークに対して二分探索アルゴリズムを実行しています](#the-primary-index-is-used-for-selecting-granules)。

しかし、クエリが複合キーの一部である列でフィルタリングされていますが、それが最初のキー列でない場合はどうなりますか？

:::note
クエリが最初のキー列でフィルタリングしていないが、セカンダリキー列でフィルタリングしているシナリオを説明します。

クエリが最初のキー列とその後のすべてのキー列でフィルタリングしている場合、ClickHouseは最初のキー列のインデックスマークに対して二分探索を実行しています。
:::

<br/>
<br/>

<a name="query-on-url"></a>
URL「http://public_search」を頻繁にクリックした上位10のユーザーを計算するクエリを使用します。

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

応答は以下のとおりです： <a name="query-on-url-slow"></a>
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

10行がセットに含まれています。経過時間: 0.086秒。
// highlight-next-line
処理された行数: 8.81百万行、
799.69 MB (102.11百万行/s., 9.27 GB/s.)
```

クライアントの出力は、ClickHouseが主キー列`URL`の一部としているにも関わらず、ほぼ完全なテーブルスキャンを実行したことを示しています！ClickHouseは、8.87百万行のテーブルから8.81百万行を読み込みました。

もし[trace_logging](/operations/server-configuration-parameters/settings#logger)が有効になっていると、ClickHouseサーバーログファイルはClickHouseが1083のURLインデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">一般的な排除検索</a>を使用して、「http://public_search」列の値を持つ行を含む可能性のあるグラニュールを特定したことを示しています：
```response
...Executor): Key condition: (column 1 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): Used generic exclusion search over index for part all_1_9_2
              with 1537 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
// highlight-next-line
              1076/1083 marks by primary key, 1076 marks to read from 5 ranges
...Executor): Reading approx. 8814592 rows with 10 streams
```

上記のサンプルトレースログから、1083のうち1076のインデックスマークから、マッチングするURL値を持つ行を含む可能性がある行が選択されたことがわかります。

この結果、ClickHouseエンジンに8.81百万行がストリーミングされます（10のストリームを使用して並行して）。これは、実際に「http://public_search」の値を持つ行を特定するためです。

しかし、後で説明するように、選択された1076グラニュールのうち、実際にマッチングする行を含むグラニュールは39しかありません。

複合主キー（UserID、URL）に基づく主インデックスは、特定のUserID値の行をフィルタリングするクエリを加速するのに非常に役立ちましたが、特定のURL値の行をフィルタリングするためのクエリを加速する際にはそれほど有用ではありません。

その理由は、URL列が最初のキー列でないため、ClickHouseはURL列のインデックスマークに対して一般的な排除検索アルゴリズムを使用しており、そのアルゴリズムの効果は、URL列と前のキー列UserIDのカーディナリティの差に依存しています。

これを説明するために、一般的な排除検索がどのように機能するかの詳細を示します。

<a name="generic-exclusion-search-algorithm"></a>
### 一般的な排除検索アルゴリズム {#generic-exclusion-search-algorithm}

以下は、複合キーの一部である列を経由してグラニュールが選択されるときに、ClickHouseの<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank">一般的な排除検索アルゴリズム</a>がどのように機能するかを示しています。前のキー列が低いまたは高いカーディナリティの場合の両方のケースを例として考えます。
- URL値が「W3」である行を検索するクエリ。
- UserIDおよびURLの簡略化された値の抽象的なヒットテーブルのバージョン。
- インデックス用の同じ複合主キー（UserID、URL）。これは、行が最初にUserID値で順序付けられることを意味します。最初のUserID値が同じ行は、その後URLで順序付けられます。
- グラニュールサイズは2、すなわち各グラニュールが2行を含むとします。

以下の図での各グラニュールの最初の行のキー列値はオレンジでマークされています。

**前のキー列が低いカーディナリティの場合**<a name="generic-exclusion-search-fast"></a>

UserIDには低いカーディナリティがあるとします。この場合、同じUserID値が複数のテーブル行やグラニュールに広がる可能性が高く、したがってインデックスマークもです。同じUserIDを持つインデックスマークに対しては、URL値は昇順にソートされています（テーブル行は最初にUserIDで、次にURLで順序付けられるため）。これにより、以下のように効率的にフィルタリングできます：
<img src={sparsePrimaryIndexes07} class="image"/>

この図の抽象的なサンプルデータに対するグラニュール選択プロセスには、3つの異なるシナリオがあります：

1. インデックスマーク0は、**URL値がW3より小さく、直接後のインデックスマークのURL値もW3より小さい**場合は排除されます。なぜなら、マーク0と１は同じUserID値を持つためです。この排除前提条件により、グラニュール0はすべてU1のUserID値で構成されていると仮定できるので、ClickHouseはグラニュール0内の最大URL値がW3よりも小さいとも断定し、グラニュールを排除できます。

2. インデックスマーク1は、**URL値がW3より小さい（または等しい）場合、および直接後のインデックスマークのURL値がW3以上の場合**は選択されます。これにより、グラニュール1がURL W3を含む可能性があることを示します。

3. インデックスマーク2および3は、**URL値がW3より大きい場合**に排除されます。主インデックスのインデックスマークが各グラニュールの最初のテーブル行のキー列の値を格納しているため、テーブル行はディスク上でキー列の値で順序付けられています。したがって、グラニュール2と3はURL値W3を含むことはできません。

**前のキー列が高いカーディナリティの場合**<a name="generic-exclusion-search-slow"></a>

UserIDが高いカーディナリティである場合は、同じUserID値が複数のテーブル行やグラニュールに広がる可能性が低くなります。これにより、インデックスマークのURL値は単調に増加することはありません：

<img src={sparsePrimaryIndexes08} class="image"/>

上の図からわかるように、W3より小さいすべてのマークはその関連するグラニュールの行をClickHouseエンジンにストリーミングするために選択されます。

これは、図内のすべてのインデックスマークが上記のシナリオ1に該当しますが、インデックスマーク0に対しては、**直接後のインデックスマークが現在のマークとは同じUserID値を持っている**という排除前提条件が満たされないため、排除できません。

例えば、インデックスマーク0は**URL値がW3より小さく、直接後のインデックスマークがW3よりも小さい**場合であっても、直接後のインデックスマーク1が現在のマーク0と同じUserID値を持たないため、排除できません。

これが最終的にClickHouseがグラニュール0の最大URL値に関する仮定を行うことを妨げます。代わりに、ClickHouseは、グラニュール0がURL値W3を含む可能性があると仮定せざるを得ず、マーク0を選択せざるを得ません。

同様のシナリオが、マーク1、2、3にも当てはまります。

:::note 結論
ClickHouseが複合キーの一部である列のフィルタリングに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">一般的な排除検索アルゴリズム</a>を用いている場合、前のキー列が低いカーディナリティがある場合に最も効果的です。
:::

サンプルデータセットでは、両方のキー列（UserID、URL）は高いカーディナリティを持ち、上記の通り、URL列の前のキー列のカーディナリティが高いか似ている場合、一般的な排除検索アルゴリズムはあまり効果的ではありません。

### データスキッピングインデックスに関する注意 {#note-about-data-skipping-index}

UserIDとURLの似たような高いカーディナリティのため、私たちの[URLに基づくクエリフィルタリング](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)も、私たちの[複合主キー（UserID、URL）を持つテーブル](#a-table-with-a-primary-key)のURLカラムに対して[セカンダリデータスキッピングインデックス](./skipping-indexes.md)を作成することからあまり恩恵を受けませんでした。

例えば、次の2つの文は、私たちのテーブルのURLカラムに対して[minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries)データスキッピングインデックスを作成し、人口を与えます：
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouseは現在、4つの連続した[グラニュール](#data-is-organized-into-granules-for-parallel-data-processing)のグループごと（上記の`ALTER TABLE`文の`GRANULARITY 4`句に注意）に、最小および最大のURL値を格納する追加のインデックスを作成しました：

<img src={sparsePrimaryIndexes13a} class="image"/>

最初のインデックスエントリ（上の図での「マーク0」）は、[テーブルの最初の4つのグラニュールに属する行](#data-is-organized-into-granules-for-parallel-data-processing)の最小および最大のURL値を格納しています。

2つ目のインデックスエントリ（「マーク1」）は、テーブルの次の4つのグラニュールに属する行の最小および最大のURL値を格納し、以下同様です。

（ClickHouseはまた、インデックスマークに関連付けられたグラニュールのグループを[定位するため](#mark-files-are-used-for-locating-granules)にデータスキッピングインデックス用の特別な[マークファイル](#mark-files-are-used-for-locating-granules)を作成しました。）

UserIDとURLの似たような高いカーディナリティのため、このセカンダリデータスキッピングインデックスは、私たちの[URLに基づくクエリフィルタリング](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)が実行される際に、グラニュールを除外するのに役立ちません。

クエリが探している特定のURL値（つまり、'http://public_search'）は、インデックスが各グラニュールのグループに対して保存する最小値と最大値の間に非常にありそうであり、ClickHouseはそのグループのグラニュールを選択せざるを得なくなります（なぜならそれらはクエリに一致する行を含む可能性があるためです）。

### 複数の主インデックスを使用する必要性 {#a-need-to-use-multiple-primary-indexes}

その結果、特定のURLを持つ行をフィルタリングするサンプルクエリを大幅に高速化したい場合は、そのクエリに最適化された主インデックスを使用する必要があります。

さらに、特定のUserIDを持つ行をフィルタリングするサンプルクエリの良好なパフォーマンスを維持したい場合は、複数の主インデックスを使用する必要があります。

次に、それを達成する方法を示します。

<a name="multiple-primary-indexes"></a>
### 追加の主インデックスを作成するオプション {#options-for-creating-additional-primary-indexes}

私たちのサンプルクエリの両方を大幅に高速化したい場合（特定のUserIDを持つ行をフィルタリングするクエリと特定のURLを持つ行をフィルタリングするクエリ）には、次の3つのオプションのいずれかを使用して複数の主インデックスを使用する必要があります：

- 異なる主キーを持つ**第2テーブル**を作成する。
- 既存のテーブルに**マテリアライズドビュー**を作成する。
- 既存のテーブルに**プロジェクション**を追加する。

3つのオプションはすべて、サンプルデータを追加テーブルに効果的に重複させ、テーブルの主インデックスと行のソート順序を再編成することになります。

ただし、3つのオプションは、クエリや挿入文のルーティングに対する追加テーブルの透明性の点で異なります。

異なる主キーで**第2テーブル**を作成する場合、クエリはテーブルのバージョンに明示的に送信される必要があり、新しいデータは両方のテーブルに明示的に挿入される必要があります：
<img src={sparsePrimaryIndexes09a} class="image"/>

**マテリアライズドビュー**の場合、追加のテーブルは暗黙的に作成され、データは自動的に両方のテーブル間で同期されます：
<img src={sparsePrimaryIndexes09b} class="image"/>

そして**プロジェクション**は、暗黙的に作成された（隠された）追加テーブルをデータ変更とともに自動的に同期させるだけでなく、ClickHouseがクエリのために最も効果的なテーブルバージョンを自動的に選択するため、最も透明なオプションです：
<img src={sparsePrimaryIndexes09c} class="image"/>

以下では、複数の主インデックスを作成し使用するためのこれらの3つのオプションについて、詳細かつ実際の例と共に説明します。

<a name="multiple-primary-indexes-via-secondary-tables"></a>
### オプション 1: セカンダリテーブル {#option-1-secondary-tables}

<a name="secondary-table"></a>
私たちは、主キーにおけるカラムの順序を（元のテーブルと比較して）変更する新しい追加テーブルを作成しています：

```sql
CREATE TABLE hits_URL_UserID
(
    `UserID` UInt32,
    `URL` String,
    `EventTime` DateTime
)
ENGINE = MergeTree
// highlight-next-line
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
SETTINGS index_granularity = 8192, index_granularity_bytes = 0, compress_primary_key = 0;
```

元のテーブルからすべての8.87百万行を追加テーブルに挿入します：

```sql
INSERT INTO hits_URL_UserID
SELECT * from hits_UserID_URL;
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

主キーのカラムの順序を変更したため、挿入された行は現在、元のテーブルと比較して異なる辞書順でディスクに保存され、そのテーブルの1083のグラニュールには以前とは異なる値が含まれています：

<img src={sparsePrimaryIndexes10} class="image"/>

これが生成された主キーです：

<img src={sparsePrimaryIndexes11} class="image"/>

これを使用して、URLカラムでフィルタリングされたサンプルクエリの実行を大幅に高速化することができます。これにより、URL「http://public_search」を最も頻繁にクリックした上位10ユーザーを計算します：
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは以下の通りです：
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
// highlight-next-line
Processed 319.49 thousand rows,
11.38 MB (18.41 million rows/s., 655.75 MB/s.)
```

今、[ほぼフルテーブルスキャンを行うことなく](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns)、ClickHouseはそのクエリをより効率的に実行しました。

元のテーブルの主インデックスではUserIDが最初のカラムで、URLが2番目のカラムでしたが、ClickHouseはそのクエリを実行するためにインデックスマークに対して[一般的な除外検索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)を使用していましたが、UserIDとURLの似たような高いカーディナリティのため、それはあまり効果的ではありませんでした。

URLが主インデックスの最初のカラムとして配置されたことで、ClickHouseは[バイナリサーチ](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452)をインデックスマークの上で実行しています。
ClickHouseサーバーログファイルの対応するトレースログは次のように確認します：
```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): Running binary search on index range for part all_1_9_2 (1083 marks)
...Executor): Found (LEFT) boundary mark: 644
...Executor): Found (RIGHT) boundary mark: 683
...Executor): Found continuous range in 19 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
// highlight-next-line
              39/1083 marks by primary key, 39 marks to read from 1 ranges
...Executor): Reading approx. 319488 rows with 2 streams
```
ClickHouseは1076のインデックスマークではなく、39のインデックスマークのみを選択しました。

追加テーブルが、URLでフィルタリングされたサンプルクエリの実行を高速化するように最適化されていることに注意してください。

元のテーブルでのそのクエリの[悪いパフォーマンス](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)とは異なり、`UserIDs`に対する私たちの[例のクエリのフィルタリング](#the-primary-index-is-used-for-selecting-granules)は、新しい追加テーブルでは非常に効果的には実行されません。なぜなら、UserIDがそのテーブルの主インデックスの2番目のキー列であり、したがってClickHouseはグラニュール選択のために一般的な除外検索を使用することになるからです。これは[同様に高いカーディナリティ](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)にはあまり効果的ではありません。

詳細ボックスを開いて具体例を確認してください。

<details>
    <summary>
    UserIDsに基づくクエリフィルタリングのパフォーマンスが悪くなった<a name="query-on-userid-slow"></a>
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

レスポンスは次の通りです：

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
// highlight-next-line
Processed 8.02 million rows,
73.04 MB (340.26 million rows/s., 3.10 GB/s.)
```

サーバーログ：
```response
...Executor): Key condition: (column 1 in [749927693, 749927693])
// highlight-next-line
...Executor): Used generic exclusion search over index for part all_1_9_2
              with 1453 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
// highlight-next-line
              980/1083 marks by primary key, 980 marks to read from 23 ranges
...Executor): Reading approx. 8028160 rows with 10 streams
```
</p>
</details>

私たちは現在、2つのテーブルを持っています。`UserIDs`でフィルタリングされたクエリの実行を高速化するように最適化され、URLでフィルタリングされたクエリの実行を高速化するように最適化されています：

<img src={sparsePrimaryIndexes12a} class="image"/>
### オプション 2: マテリアライズドビュー {#option-2-materialized-views}

既存のテーブルに対して[マテリアライズドビュー](/sql-reference/statements/create/view.md)を作成します。
```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

レスポンスは次のようになります：
```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note
- 主キーのカラム順序を（元のテーブルと比較して）変更しています。
- マテリアライズドビューは、指定された主キー定義に基づいて行順序と主インデックスを持つ**暗黙的に作成されたテーブル**に支えられています。
- 暗黙的に作成されたテーブルは`SHOW TABLES`クエリでリストされており、名前は`.inner`で始まります。
- マテリアライズドビューのバックアップテーブルを最初に明示的に作成し、そのテーブルを`TO [db].[table]` [句](/sql-reference/statements/create/view.md)を介してターゲットすることも可能です。
- `POPULATE`キーワードを使用して、ソーステーブル[hits_UserID_URL](#a-table-with-a-primary-key)のすべての8.87百万行で暗黙的に作成されたテーブルを即座に人口します。
- ソーステーブルhits_UserID_URLに新しい行が挿入されると、これらの行も自動的に暗黙的に作成されたテーブルに挿入されます。
- 効果的には、暗黙的に作成されたテーブルは、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と同じ行順序と主インデックスを持っています：

<img src={sparsePrimaryIndexes12b1} class="image"/>

ClickHouseは、暗黙的に作成されたテーブルの[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns)(*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules)(*.mrk2)、および[主インデックス](#the-primary-index-has-one-entry-per-granule)(primary.idx)をClickHouseサーバーのデータディレクトリ内の特別なフォルダに保存します：

<img src={sparsePrimaryIndexes12b2} class="image"/>
:::

暗黙的に作成されたテーブル（およびその主インデックス）がマテリアライズドビューを支えていることで、URLカラムでフィルタリングされたサンプルクエリの実行を大幅に高速化することができます：
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のようになります：

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
// highlight-next-line
Processed 335.87 thousand rows,
13.54 MB (12.91 million rows/s., 520.38 MB/s.)
```

暗黙的に作成されたテーブル（およびその主インデックス）が、マテリアライズドビューを支えていることで、クエリは明示的に作成したテーブルと同じ効果的な方法で実行されます。

ClickHouseサーバーログファイルの対応するトレースログは、ClickHouseがインデックスマークに対してバイナリサーチを実行していることを確認します：

```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): Running binary search on index range ...
...
...Executor): Selected 4/4 parts by partition key, 4 parts by primary key,
// highlight-next-line
              41/1083 marks by primary key, 41 marks to read from 4 ranges
...Executor): Reading approx. 335872 rows with 4 streams
```
### オプション 3: プロジェクション {#option-3-projections}

既存のテーブルにプロジェクションを作成します：
```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

プロジェクションをマテリアライズします：
```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note
- プロジェクションは、指定された`ORDER BY`句に基づいて行順序と主インデックスを持つ**隠されたテーブル**を作成します。
- 隠されたテーブルは`SHOW TABLES`クエリでリストされません。
- `MATERIALIZE`キーワードを使用して、ソーステーブル[hits_UserID_URL](#a-table-with-a-primary-key)のすべての8.87百万行で隠されたテーブルを即座に人口します。
- ソーステーブルhits_UserID_URLに新しい行が挿入されると、これらの行も自動的に隠されたテーブルに挿入されます。
- クエリは常に（構文的に）ソーステーブルhits_UserID_URLをターゲットにしますが、隠されたテーブルの行順序と主インデックスがクエリの実行をより効果的にする場合、その隠されたテーブルが代わりに使用されます。
- プロジェクションは、プロジェクションの`ORDER BY`が一致しても、ORDER BYを使用するクエリをより効率的にすることはありません（https://github.com/ClickHouse/ClickHouse/issues/47333を参照）。
- 効果的には、暗黙的に作成された隠されたテーブルは[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と同じ行順序と主インデックスを持っています：

<img src={sparsePrimaryIndexes12c1} class="image"/>

ClickHouseは、隠されたテーブル（およびその主インデックス）の[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns)(*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules)(*.mrk2)、および[主インデックス](#the-primary-index-has-one-entry-per-granule)(primary.idx)をソーステーブルのデータファイル、マークファイル、および主インデックスファイルの隣の特別なフォルダに保存します：

<img src={sparsePrimaryIndexes12c2} class="image"/>
:::

プロジェクションによって作成された隠されたテーブル（およびその主インデックス）は、URLカラムでフィルタリングされたサンプルクエリの実行を大幅に高速化するために（暗黙的に）使用できます。クエリは構文的にプロジェクションのソーステーブルをターゲットとしています。
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のようになります：

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
// highlight-next-line
Processed 319.49 thousand rows, 1
1.38 MB (11.05 million rows/s., 393.58 MB/s.)
```

効果的にプロジェクションによって作成された隠されたテーブル（およびその主インデックス）は、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と同じ効果的な方法でクエリを実行します。

ClickHouseサーバーログファイルの対応するトレースログは、ClickHouseがインデックスマークに対してバイナリサーチを実行していることを確認します：

```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): Running binary search on index range for part prj_url_userid (1083 marks)
...Executor): ...
// highlight-next-line
...Executor): Choose complete Normal projection prj_url_userid
...Executor): projection required columns: URL, UserID
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
// highlight-next-line
              39/1083 marks by primary key, 39 marks to read from 1 ranges
...Executor): Reading approx. 319488 rows with 2 streams
```
### サマリー {#summary}

複合主キー（UserID、URL）を持つ私たちの[テーブル](#a-table-with-a-primary-key)の主インデックスは、UserIDでフィルタリングされた[クエリを高速化するのに非常に役立ちました](#the-primary-index-is-used-for-selecting-granules)。しかし、そのインデックスはURLでフィルタリングされた[クエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)の高速化にはあまり助けになっていませんでした。URLカラムが複合主キーの一部であるにもかかわらずです。

逆もまた真です：
複合主キー（URL、UserID）を持つ私たちの[テーブル](#guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)は、URLでフィルタリングされた[クエリを高速化しました](#guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。しかし、UserIDでフィルタリングされた[クエリ](#the-primary-index-is-used-for-selecting-granules)にはあまりサポートを提供しませんでした。

主キーのカラムであるUserIDとURLが似たような高いカーディナリティであるため、2番目のキー列でフィルタリングされたクエリは、[インデックスにその2番目のキー列があることでほとんど利益を得られない](#generic-exclusion-search-algorithm)のです。

したがって、主インデックスから2番目のキー列を削除する（インデックスのメモリ消費量が少なくなる）こと、および[複数の主インデックスを使用する](#guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes)ことは理にかなっています。

ただし、複合主キーのキー列に大きなカーディナリティの違いがある場合、主キーのカラムをカーディナリティの昇順に並べることは、[クエリにとって有益です](#guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。

キー列のカーディナリティ差が大きいほど、その列の順序が重要になります。次のセクションではそれを示します。

## キー列を効率的に並べる {#ordering-key-columns-efficiently}

<a name="test"></a>

複合主キーでは、キー列の順序が次の両方に大きな影響を与えることができます。
- クエリ内のセカンダリーキー列のフィルタリングの効率。
- テーブルのデータファイルの圧縮率。

そのことを示すために、アクセスがインターネットの「ユーザー」(`UserID`カラム)からURL(`URL`カラム)に対するボットトラフィック(`IsRobot`カラム)としてマークされたかどうかを示す3つのカラムを含む、私たちの[ウェブトラフィックサンプルデータセット](#data-set)のバージョンを使用します。

その3つのカラムを含む複合主キーを使って、特定のURLへのトラフィックのパーセンテージがボットからのものであるか、特定のユーザーが（ボットではない）ボットであるかどうかの自信がどの程度あるか（そのユーザーからのトラフィックの何パーセントがボットトラフィックであると見なされているか）を計算するという典型的なウェブ分析のクエリを高速化するためのキーとして使います。

これらのキー列として使いたい3つのカラムのカーディナリティを計算するために、このクエリを使用します（注意：ローカルテーブルを作成せずにTSVデータをアドホックにクエリするために[URLテーブル関数](/sql-reference/table-functions/url.md)を使用しています）。クリックハウスクライアントでこのクエリを実行してください：
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
レスポンスは次のようになります：
```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

カーディナリティに大きな違いがあることが確認でき、特に`URL`と`IsRobot`カラムの間では大きな違いがあるため、したがって、複合主キーにおけるこれらのカラムの順序は、クエリの効率的な高速化とテーブルのカラムデータファイルの最適な圧縮比を達成するために重要です。

そのことを証明するために、ボットトラフィック分析データのために2つのテーブルバージョンを作成します。
- キー列のカーディナリティを降順に並べる複合主キー`(URL, UserID, IsRobot)`を持つテーブル`hits_URL_UserID_IsRobot`
- キー列のカーディナリティを昇順に並べる複合主キー`(IsRobot, UserID, URL)`を持つテーブル`hits_IsRobot_UserID_URL`

複合主キー`(URL, UserID, IsRobot)`を持つテーブル`hits_URL_UserID_IsRobot`を作成します：
```sql
CREATE TABLE hits_URL_UserID_IsRobot
(
    `UserID` UInt32,
    `URL` String,
    `IsRobot` UInt8
)
ENGINE = MergeTree
// highlight-next-line
PRIMARY KEY (URL, UserID, IsRobot);
```

そして8.87百万行でそれを満たします：
```sql
INSERT INTO hits_URL_UserID_IsRobot SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
レスポンスは次のようになります：
```response
0 rows in set. Elapsed: 104.729 sec. Processed 8.87 million rows, 15.88 GB (84.73 thousand rows/s., 151.64 MB/s.)
```

次に、複合主キー`(IsRobot, UserID, URL)`を持つテーブル`hits_IsRobot_UserID_URL`を作成します：
```sql
CREATE TABLE hits_IsRobot_UserID_URL
(
    `UserID` UInt32,
    `URL` String,
    `IsRobot` UInt8
)
ENGINE = MergeTree
// highlight-next-line
PRIMARY KEY (IsRobot, UserID, URL);
```
そして、先程のテーブルで使用したのと同じ8.87百万行を満たします：

```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
レスポンスは次のようになります：
```response
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```
### セカンダリーキー列の効率的なフィルタリング {#efficient-filtering-on-secondary-key-columns}

クエリが複合キーの一部である列でフィルタリングしている場合、その列が最初のキー列であれば、[ClickHouseはそのカラムのインデックスマークに整列検索を実行しています](#the-primary-index-is-used-for-selecting-granules)。

クエリがフィルタリングしているのが複合キーの一部のカラムであり、しかしそれが最初のキー列ではない場合、[ClickHouseはそのカラムのインデックスマークに対して一般的な除外検索アルゴリズムを使用しています](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

このクエリは、キー列を(`URL, UserID, IsRobot`)のカラム順序で持つテーブルの`UserID`列でフィルタリングしています：
```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```
レスポンスは次のようになります：
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.026 sec.
// highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

次は、カラムを(`IsRobot, UserID, URL`)のカラム順序で持つテーブルでの同じクエリです：
```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```
レスポンスは次のようになります：
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.
// highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

キー列の順序をカーディナリティに応じて並べたテーブルでのクエリ実行が、はるかに効果的で速いことが確認できます。

その理由は、[一般的な除外検索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)は、前のキー列のカーディナリティが低い場合にセカンダリーキー列で選択されたグラニュールを最も効果的に処理するからです。これはこのガイドの[以前のセクション](#generic-exclusion-search-algorithm)で詳しく説明しました。
```
```yaml
title: 'データファイルの最適な圧縮率'
sidebar_label: 'データファイルの最適な圧縮率'
keywords: 'ClickHouse, 圧縮率, データファイル, プライマリキー, クエリ'
description: 'ClickHouseにおけるデータファイルの圧縮率についての解説。'
```

### データファイルの最適な圧縮率 {#optimal-compression-ratio-of-data-files}

このクエリは、上で作成した二つのテーブル間での`UserID`カラムの圧縮率を比較します：

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
これがレスポンスです：
```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```
`UserID`カラムの圧縮率は、キーのカラムを高次元の順に整列させたテーブルで著しく高いことがわかります。

両方のテーブルには同じデータが保存されています（双方のテーブルに同じ8.87百万行を挿入しました）が、複合主キーでのキーのカラムの順序は、テーブルの[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns)にある圧縮されたデータが必要とするディスクスペースに大きな影響を与えます：
- 複合主キー`(URL, UserID, IsRobot)`のテーブル`hits_URL_UserID_IsRobot`では、キーのカラムを高次元に降順で整列させたため、`UserID.bin`データファイルは**11.24 MiB**のディスクスペースを必要とします
- 複合主キー`(IsRobot, UserID, URL)`のテーブル`hits_IsRobot_UserID_URL`では、キーのカラムを高次元に昇順で整列させたため、`UserID.bin`データファイルはわずかに**877.47 KiB**のディスクスペースを必要とします

テーブルのカラムデータのディスク上で良好な圧縮率を持つことは、ディスクのスペースを節約するだけでなく、そのカラムからデータを読み取る必要があるクエリ（特に分析を必要とするもの）を速くします。なぜなら、カラムのデータをディスクから主記憶（オペレーティングシステムのファイルキャッシュ）に移動する際に必要な入出力が少なくて済むからです。

以下に、テーブルのカラムの圧縮率を高めるために、主キーのカラムを高次元に昇順に整列させることが有益である理由を示します。

下の図は、主キーが高次元に昇順で整列されている場合のディスク上の行の順序を示しています：
<img src={sparsePrimaryIndexes14a} class="image"/>

私たちは、[テーブルの行データが主キーのカラムで整列されて保存されている](#data-is-stored-on-disk-ordered-by-primary-key-columns)ことを議論しました。

上の図では、テーブルの行（ディスク上のカラム値）が最初にその`cl`値で整列され、同じ`cl`値を持つ行はその`ch`値で整列されます。また、最初のキーカラム`cl`は低次元を持つため、同じ`cl`値を持つ行が存在する可能性が高いです。このため、`ch`値が（同じ`cl`値を持つ行に対して）ローカルで整列される可能性も高いです。

カラム内で、類似データが互いに近く配置されている場合（例えばソートによって）、そのデータはより良く圧縮されます。
一般的に、圧縮アルゴリズムはデータのラン長と位置性の恩恵を受けます（多くのデータを見れば見るほど圧縮が良くなり、データが類似しているほど圧縮率が向上します）。

上の図とは対照的に、下の図は、プライマリキーのカラムが高次元に降順で配置されている場合のディスク上の行の順序を示しています：
<img src={sparsePrimaryIndexes14b} class="image"/>

ここでテーブルの行は最初にその`ch`値で整列され、同じ`ch`値を持つ行はその`cl`値で整列されます。
しかし、最初のキーカラム`ch`は高次元を持つため、同じ`ch`値を持つ行が存在する可能性は低くなります。このため、`cl`値が（同じ`ch`値を持つ行に対して）ローカルで整列される可能性も低くなります。

よって、`cl`値はほとんどランダムな順序であり、したがって、ローカル性と圧縮率が良くありません。

### まとめ {#summary-1}

クエリでのセカンダリキーのカラムに対する効率的なフィルタリングとテーブルのカラムデータファイルの圧縮率の両方において、プライマリキーのカラムを高次元に昇順で整列させることは有益です。

### 関連コンテンツ {#related-content-1}
- ブログ: [ClickHouseのクエリを強化する](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## 単一行を効率的に特定する {#identifying-single-rows-efficiently}

一般的には[最良の](https://knowledgebase/key-value)ユースケースではありませんが、ClickHouseの上に構築されたアプリケーションでは、ClickHouseテーブルの単一行を特定する必要があります。

その直感的な解決策は、各行にユニークな値を持つ[UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)カラムを使用し、行の高速な取得にそのカラムをプライマリキーとして使用することです。

最速の取得のためには、UUIDカラム[が最初のキーカラムである必要があります](#the-primary-index-is-used-for-selecting-granules)。

私たちは、[ClickHouseテーブルの行データがディスク上で主キーのカラムで整列されて保存されている](#data-is-stored-on-disk-ordered-by-primary-key-columns)ため、非常に高次元のカラム（UUIDカラムのような）をプライマリキーまたは複合プライマリキー内の低次元のカラムの前に置くことは、他のテーブルのカラムの圧縮率にとって有害であることを議論しました。

最速の取得と最適なデータ圧縮の妥協点は、UUIDを最後のキーカラムとして持つ複合プライマリキーを使用し、テーブルのいくつかのカラムの良好な圧縮率を確保するために低次元のキーカラムを使用することです。

### 具体例 {#a-concrete-example}

具体的な例の一つは、Alexey Milovidovが開発し[ブログに書いた](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)プレーンテキストのペーストサービスであるhttps://pastila.nlです。

テキストエリアで変更があるたびに、データは自動的にClickHouseテーブルの行に保存されます（変更ごとに一行）。

ペーストされたコンテンツの（特定のバージョンを）特定し、取得する一つの方法は、そのコンテンツのハッシュをテーブル行のUUIDとして使用することです。

以下の図は、変更があるときの行の挿入順序（例えばテキストをテキストエリアにタイプする際のキーストロークによる）と、`PRIMARY KEY (hash)`が使用された場合の挿入された行からのデータのディスク上の順序を示しています：
<img src={sparsePrimaryIndexes15a} class="image"/>

`hash`カラムがプライマリキーとして使用されているため、
- 特定の行は[非常に速く](#the-primary-index-is-used-for-selecting-granules)取得でき、しかし
- テーブルの行（そのカラムデータ）は、（ユニークでランダムな）ハッシュ値によって昇順でディスクに保存されます。したがって、コンテンツカラムの値もランダム順序で保存され、データのローカリティが結果的に**コンテンツカラムのデータファイルの圧縮率を最適でないものに**しています。

特定の行の取得を迅速に行いながら、コンテンツカラムの圧縮率を大幅に改善するために、pastila.nlは二つのハッシュ（および複合プライマリキー）を使用して特定の行を特定しています：
- 前述のように、異なるデータに対して一意であるコンテンツのハッシュ、及び
- 小さなデータの変更の際には**変化しない**[局所感応ハッシュ（フィンガープリント）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)。

以下の図は、
- コンテンツが変わる際の行の挿入順序（例えばテキストエリアにテキストをタイプする際のキーストロークによる）と
- 複合`PRIMARY KEY (fingerprint, hash)`が使用された場合の挿入された行からのデータのディスク上の順序を示しています：

<img src={sparsePrimaryIndexes15b} class="image"/>

現在、ディスク上の行はまず`fingerprint`によって整列され、同じフィンガープリント値を持つ行に対してはその`hash`値が最終的な順序を決定します。

わずかに変更されたデータが同じフィンガープリント値を受け取るため、類似データがディスク上で互いに近くに保存され、これはコンテンツカラムの圧縮率にとって非常に良いことです。一般的に圧縮アルゴリズムはデータのローカリティから恩恵を受けます（データが類似しているほど圧縮率が良くなります）。

妥協点は、複合`PRIMARY KEY (fingerprint, hash)`から得られるプライマリインデックスを最適に利用するためには、特定の行を取得するために二つのフィールド（`fingerprint`と`hash`）が必要であることです。
