---
sidebar_label: 主キーインデックス
sidebar_position: 1
description: このガイドでは、ClickHouseのインデックスについて詳しく説明します。
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

# ClickHouseにおける主キーインデックスの実践的な導入
## はじめに {#introduction}

このガイドでは、ClickHouseのインデックスについて詳しく探ります。以下の内容を詳述します：

- [ClickHouseのインデックスが従来のリレーショナルデータベース管理システムとどう異なるか](#an-index-design-for-massive-data-scales)
- [ClickHouseがテーブルのスパース主キーインデックスをどのように構築し使用しているか](#a-table-with-a-primary-key)
- [ClickHouseのインデックスに関するベストプラクティス](#using-multiple-primary-indexes)

このガイドで示されるすべてのClickHouse SQLステートメントとクエリを、自分のマシンでオプションとして実行できます。
ClickHouseのインストールと初期設定に関する手順は、[クイックスタート](/quick-start.mdx)をご覧ください。

:::note
このガイドでは、ClickHouseのスパース主キーインデックスに焦点を当てています。

ClickHouseの[セカンダリーデータスキッピングインデックス](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)については、[チュートリアル](/guides/best-practices/skipping-indexes.md)をご覧ください。
:::
### データセット {#data-set}

このガイド全体で、サンプルの匿名化されたウェブトラフィックデータセットを使用します。

- サンプルデータセットからの8.87百万行（イベント）のサブセットを使用します。
- 圧縮されていないデータサイズは8.87百万イベントで約700 MBです。ClickHouseに保存すると200MBに圧縮されます。
- 私たちのサブセットでは、各行にはインターネットユーザーを示す3つのカラムがあります（`UserID`カラム）、特定の時刻にURLをクリックした(`URL`カラム)。

これらの3つのカラムを使用すると、次のような典型的なウェブ分析クエリを作成できます。

- "特定のユーザーの最もクリックされた上位10のURLは何ですか？"
- "特定のURLを最も頻繁にクリックした上位10のユーザーは誰ですか？"
- "特定のURLをクリックするユーザーにとって最も人気のある時間（例：曜日）は何ですか？"
### テストマシン {#test-machine}

この文書で示されるすべての実行時数値は、Apple M1 Proチップを搭載したMacBook ProにローカルでClickHouse 22.2.1を実行した際のものです。
### フルテーブルスキャン {#a-full-table-scan}

主キーなしでデータセット上でクエリがどのように実行されるかを確認するために、次のSQL DDLステートメントを実行してテーブルを作成します（MergeTreeテーブルエンジン使用）：

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
これは、[URLテーブル関数](/sql-reference/table-functions/url.md)を使用して、clickhouse.comでホストされている完全なデータセットのサブセットをロードします。

```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
応答は次のとおりです：
```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```

ClickHouseクライアントの結果出力は、上記のステートメントがテーブルに8.87百万行を挿入したことを示しています。

最後に、後の議論を簡略化し、図と結果を再現可能にするために、テーブルを[FILTER](/sql-reference/statements/optimize.md)を使用して最適化します：

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
一般的には、データを読み込んだ後にテーブルをすぐに最適化する必要はありませんし、お勧めしません。この例でなぜ必要であるかは後で明らかになります。
:::

次に、最初のウェブ分析クエリを実行します。以下は、UserIDが749927693のインターネットユーザーの最もクリックされた上位10のURLを計算しています。

```sql
SELECT URL, count(URL) as Count
FROM hits_NoPrimaryKey
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

10 rows in set. Elapsed: 0.022 sec.
// highlight-next-line
Processed 8.87 million rows,
70.45 MB (398.53 million rows/s., 3.17 GB/s.)
```

ClickHouseクライアントの結果出力は、ClickHouseがフルテーブルスキャンを実行したことを示しています！私たちのテーブルの8.87百万行の各行がClickHouseにストリーミングされました。それではスケールアップしません。

このプロセスを（より）効率的かつ（ずっと）速くするためには、適切な主キーを持つテーブルを使用する必要があります。これにより、ClickHouseは自動的に（主キーのカラムに基づいて）スパース主キーインデックスを作成し、このインデックスを使用してクエリの実行を大幅に高速化できます。
### 関連コンテンツ {#related-content}
- ブログ: [ClickHouseクエリを超高速化する](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## ClickHouseインデックス設計 {#clickhouse-index-design}
### 大規模データスケールのためのインデックス設計 {#an-index-design-for-massive-data-scales}

従来のリレーショナルデータベース管理システムでは、主キーはテーブル行ごとに1つのエントリを含むことになります。これにより、私たちのデータセットには8.87百万エントリを含む主キーインデックスが作成されます。このようなインデックスは特定の行を迅速に特定することができ、ルックアップクエリやポインタ更新の高い効率をもたらします。`B(+)-Tree`データ構造内でエントリを検索するのは平均時間計算量が`O(log n)`であり、より正確には`log_b n = log_2 n / log_2 b`、ここで`b`は`B(+)-Tree`の分岐係数で、`n`はインデックスされた行の数です。通常、`b`は数百から数千の間なので、`B(+)-Trees`は非常に浅い構造で、レコードを特定するために必要なディスクシークが少なくて済みます。8.87百万行あり、分岐係数が1000の場合、平均して2.3ディスクシークが必要です。この能力は追加のディスクとメモリのオーバーヘッド、新しい行をテーブルに追加する際のインサーションコストの増加、時折Bツリーの再バランスなど、コストがかかります。

B-Treeインデックスに関連する課題を考慮すると、ClickHouseのテーブルエンジンは異なるアプローチを採用しています。ClickHouseの[MargeTreeエンジンファミリー](/engines/table-engines/mergetree-family/index.md)は、大規模なデータボリュームを処理するために設計され最適化されています。これらのテーブルは、1秒あたり何百万もの行を挿入できるように設計されており、非常に大きなデータ量（数百ペタバイト）をストレージできます。データは迅速にテーブルに[パート毎に](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)書き込まれ、パーツのマージに関するルールがバックグラウンドで適用されます。ClickHouseでは、各パートが自身の主キーインデックスを持っています。パーツがマージされると、マージされたパートの主インデックスもマージされます。ClickHouseが設計されている非常に大規模なスケールでは、ディスクとメモリの効率を非常に重要視します。そのため、すべての行をインデックス化するのではなく、パートの主インデックスは行のグループ（「グラニュール」と呼ばれます）ごとに1つのインデックスエントリ（「マーク」と呼ばれる）を持ち、その技術を**スパースインデックス**と呼びます。

スパースインデックスは、ClickHouseがパートの行を主キー列によってディスク上に順序付けて保存しているため可能です。単一の行を直接特定する代わりに（Bツリーに基づくインデックスのように）、スパース主キーインデックスは、クエリに一致する可能性のある行のグループを迅速に（インデックスエントリのバイナリ検索を介して）特定できるようにします。特定された一致する可能性のある行のグループ（グラニュール）は並行してClickHouseエンジンにストリーミングされ、一致を見つけるために使用されます。このインデックス設計により、主インデックスが小さく（それは、完全に主メモリに収まる必要があります）、クエリ実行時間が大幅に短縮されます。特に、データ分析のユースケースでよく見られる範囲クエリに対して特に有効です。

以下は、ClickHouseがどのようにスパース主キーインデックスを構築し使用しているかを詳しく示します。記事の後半では、インデックス（主キー列）を構築するために使用されるテーブルカラムの選択、削除、および順序に関するいくつかのベストプラクティスについて説明します。
### 主キーを持つテーブル {#a-table-with-a-primary-key}

UserIDとURLを主キーとする複合主キーを持つテーブルを作成します：

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
    DDLステートメントの詳細
    </summary>
    <p>

後の議論を簡単にし、図と結果を再現可能にするために、DDLステートメントは次のことを指定します：

<ul>
  <li>
    <code>ORDER BY</code>句を通じてテーブルの複合ソートキーを指定します。
  </li>
  <li>
    主キーインデックスのエントリ数を設定値により明示的に制御します：
    <ul>
      <li>
        <code>index_granularity</code>：デフォルト値の8192に明示的に設定されています。これは、8192行のグループごとに1つのインデックスエントリを持つことを意味します。たとえば、テーブルに16384行がある場合、インデックスは2つのインデックスエントリを持ちます。
      </li>
      <li>
        <code>index_granularity_bytes</code>：0に設定して、<a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">適応インデックス粒度</a>を無効にします。適応インデックス粒度は、次のいずれかが真である場合、ClickHouseが自動的にn行のグループに対して1つのインデックスエントリを作成することを意味します：
        <ul>
          <li>
            <code>n</code>が8192未満であり、その<code>n</code>行の結合行データのサイズが10MB以上（<code>index_granularity_bytes</code>のデフォルト値）である場合。
          </li>
          <li>
            <code>n</code>行の結合行データのサイズが10MB未満であるが、<code>n</code>が8192である場合。
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>：0に設定して、<a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">主インデックスの圧縮</a>を無効にします。これにより、後でオプションとして内容を調査できます。
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

DDLステートメントの主キーは、指定された2つのキー列に基づいて主インデックスを作成します。

<br/>
次に、データを挿入します：

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
以下のクエリを使用して、テーブルのメタデータを取得できます：

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
```

ClickHouseクライアントの出力は次のことを示しています：

- テーブルのデータは[position=documentation](https://engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)に従って特定のディレクトリ内に[ワイド形式]で保存されており、ディレクトリ内に各テーブルカラムごとのデータファイル（およびマークファイル）が存在します。
- テーブルには8.87百万行があります。
- すべて行の圧縮されていないデータサイズは733.28 MBです。
- ディスク上のすべての行の圧縮サイズは206.94 MBです。
- テーブルには1083のエントリ（「マーク」と呼ばれます）を持つ主インデックスがあり、インデックスのサイズは96.93 KBです。
- 合計で、テーブルのデータおよびマークファイルと主インデックスファイルのサイズは206.07 MBです。
### データは主キー列で順序付けられてディスクに保存されます {#data-is-stored-on-disk-ordered-by-primary-key-columns}

上記で作成したテーブルには
- 複合[主キー](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)`と
- 複合[ソートキー](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`があります。

:::note
- もしソートキーのみを指定した場合、主キーは暗黙的にソートキーと等しいと定義されます。

- メモリ効率を上げるために、クエリがフィルタリングするカラムのみを含む主キーを明示的に指定しました。主キーに基づく主インデックスは主メモリに完全にロードされます。

- ガイドの図の一貫性を保ち、圧縮率を最大化するために、テーブルにすべてのカラムを含む別のソートキーを定義しました（同様のデータが近くに配置されることで、データはより良く圧縮されます）。

- 主キーとソートキーの両方を指定した場合、主キーはソートキーのプレフィックスである必要があります。
:::

挿入された行は、主キー列（およびソートキーからの追加の`EventTime`列）によってディスク上に辞書式順序に保存されます。

:::note
ClickHouseは同じ主キー列値を持つ複数行の挿入を許可します。この場合（以下の図の行1と行2を参照）、最終的な順序は指定されたソートキーによって決定され、したがって`EventTime`列の値が影響します。
:::

ClickHouseは<a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">列指向データベース管理システム</a>です。以下の図のように
- ディスク上の表現において、各テーブルカラムの値は<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a>された形式で保存される単一のデータファイル（*.bin）があり、
- 8.87百万行は主キー列（および追加のソートキー列）によって辞書式で昇順にディスクに保存されています。すなわち、以下のように
  - まず`UserID`によって、
  - 次に`URL`によって、
  - 最後に`EventTime`によって：

<img src={sparsePrimaryIndexes01} class="image"/>

`UserID.bin`、`URL.bin`、`EventTime.bin`は、`UserID`、`URL`、`EventTime`カラムの値が保存されているデータファイルです。

<br/>
<br/>

:::note
- 主キーは行のディスク上の辞書式順序を定義するため、テーブルは1つの主キーしか持てません。

- 行に番号を付ける際は、ClickHouseの内部の行番号付けスキームおよびログメッセージにも使用されるため、0から始めています。
:::
### データは並列データ処理のためにグラニュールに整理されます {#data-is-organized-into-granules-for-parallel-data-processing}

データ処理の目的のために、テーブルのカラムの値は論理的にグラニュールに分割されます。
グラニュールは、ClickHouseにストリーミングされデータ処理のために使用される最小の不可分なデータセットです。
これは、個別の行を読み込む代わりに、ClickHouseが常に（ストリーミング方式で並行して）行のグループ（グラニュール）の全体を読み込むことを意味します。
:::note
カラムの値はグラニュール内に物理的に保存されるわけではありません：グラニュールはクエリ処理のためのカラムの値の論理的な編成に過ぎません。
:::

以下の図は、私たちのテーブルの8.87百万行の（カラム値の）整理が、DDLステートメントに含まれる設定`index_granularity`（そのデフォルト値は8192）によって1083のグラニュールに整理されています。

<img src={sparsePrimaryIndexes02} class="image"/>

最初の（ディスク上の物理的順序に基づく）8192行（そのカラム値）は論理的にグラニュール0に属し、その次の8192行はグラニュール1に属し続きます。

:::note
- 最後のグラニュール（グラニュール1082）は、8192行未満を「含む」場合があります。

- このガイドの始めに「DDLステートメントの詳細」で述べたように、[適応インデックス粒度](/whats-new/changelog/2019.md/#experimental-features-1)を無効にしました（このガイドの議論を簡略化し、図や結果を再現可能にするため）。

  したがって、私たちの例テーブルのすべてのグラニュール（最後のものを除く）は同じサイズを持ちます。

- 適応インデックス粒度を有するテーブルの場合（デフォルトでは[適応的](/operations/settings/merge-tree-settings#index_granularity_bytes)）、行のデータサイズに応じて一部のグラニュールは8192行未満になる可能性があります。

- 主キー列の一部のカラム値（`UserID`、`URL`）をオレンジでマークしました。
  これらのオレンジでマークされたカラム値は、各グラニュールの最初の行の主キー列の値になります。
  これらは次に、テーブルの主インデックスのエントリになります。

- グラニュールには0から番号を付けて、ClickHouseの内部番号付けスキームおよびログメッセージでも使用されるようにしています。
:::
### 主キーインデックスは、グラニュールごとに1つのエントリを持つ {#the-primary-index-has-one-entry-per-granule}

主キーインデックスは、上記の図に示されたグラニュールに基づいて作成されます。このインデックスは、0から始まる数値インデックスマークを含む非圧縮のフラット配列ファイル（primary.idx）です。

以下の図は、インデックスが各グラニュールの最初の行に対して主キー列の値（上記の図でオレンジ色でマークされた値）を保存していることを示しています。
言い換えれば、主キーインデックスはテーブルの8192行ごとの主キー列の値を保存します（主キー列によって定義された物理行順序に基づいて）。
例えば、
- 最初のインデックスエントリ（以下の図の「マーク0」）は、上記の図のグラニュール0の最初の行のキー列の値を保存しています。
- 2番目のインデックスエントリ（以下の図の「マーク1」）は、上記の図のグラニュール1の最初の行のキー列の値を保存しています。

<img src={sparsePrimaryIndexes03a} class="image"/>

合計で、このインデックスは、887万行と1083のグラニュールを持つ我々のテーブルに対して1083のエントリを持っています：

<img src={sparsePrimaryIndexes03b} class="image"/>

:::note
- [適応インデックス粒度](/whats-new/changelog/2019.md/#experimental-features-1)を持つテーブルでは、主キーインデックスに最後のテーブル行の主キー列の値を記録する「最終」追加マークが1つ保存されます。しかし、我々はこのガイドのディスカッションを簡素化し、図や結果を再現可能にするために、適応インデックス粒度を無効にしたため、例のテーブルのインデックスにはこの最終マークは含まれていません。

- 主キーインデックスファイルは完全にメインメモリにロードされます。もしファイルが利用可能な空きメモリスペースよりも大きい場合、ClickHouseはエラーを返します。
:::

<details>
    <summary>
    主キーインデックスの内容を確認する
    </summary>
    <p>

セルフマネージドのClickHouseクラスタ上では、<a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">fileテーブル関数</a>を使用して、我々の例のテーブルの主キーインデックスの内容を確認できます。

そのためには、まずは、稼働中のクラスタのノードの<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a>に主キーインデックスファイルをコピーする必要があります：
<ul>
<li>ステップ1: 主キーインデックスファイルを含むパートパスを取得します。</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

テストマシンで返される結果は`/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`です。

<li>ステップ2: user_files_pathを取得します。</li>
Linuxの<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">デフォルトuser_files_path</a>は
`/var/lib/clickhouse/user_files/`

Linuxでは、もし変更されている場合は確認できます：`$ grep user_files_path /etc/clickhouse-server/config.xml`

テストマシンでのパスは`/Users/tomschreiber/Clickhouse/user_files/`です。

<li>ステップ3: 主キーインデックスファイルをuser_files_pathにコピーします。</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

<br/>

</ul>

これで、SQLを介して主キーインデックスの内容を確認できます：
<ul>
<li>エントリの数を取得します。</li>
`
SELECT count( )<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String');
`

<br/>
<br/>
返される結果は`1083`
<br/>
<br/>
<li>最初の2つのインデックスマークを取得します。</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 0, 2;
`
<br/>
<br/>
返される結果は
<br/>
`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`
<br/>
<br/>
<li>最後のインデックスマークを取得します。</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
<br/>
<br/>
返される結果は
<br/>
`
4292714039 │ http://sosyal-mansetleri...
`



</ul>

これは、我々の例のテーブルの主キーインデックス内容の図と正確に一致しています：
<img src={sparsePrimaryIndexes03b} class="image"/>
</p>
</details>

主キーエントリはインデックスマークと呼ばれ、各インデックスエントリは特定のデータ範囲の開始を示しています。特に例のテーブルに対しては：
- UserIDインデックスマーク：<br/>
  主キーインデックスに保存された`UserID`値は昇順にソートされています。<br/>
  したがって、上記の図の「マーク1」は、グラニュール1のすべてのテーブル行の`UserID`値、およびその後のすべてのグラニュールの値が4.073.710以上であることを保証します。

 [後で確認するように](#the-primary-index-is-used-for-selecting-granules)、このグローバルな順序は、ClickHouseが<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">最初の主キー列をフィルタリングするクエリに対して</a>インデックスマークに対する二分探索アルゴリズムを使用できることを可能にします。

- URLインデックスマーク：<br/>
  主キー列である`UserID`と`URL`の非常に似た基数は、通常、最初の列の後のすべてのキー列のインデックスマークが、少なくとも現在のグラニュール内のすべてのテーブル行に対して前のキー列の値が同じである限り、データ範囲のみを示すことを意味します。<br/>
  例えば、上記の図でマーク0とマーク1の`UserID`値が異なるため、ClickHouseはグラニュール0のすべてのテーブル行の`URL`値が`'http://showtopics.html%3...'`以上であるとは仮定できません。しかし、上記の図でマーク0とマーク1の`UserID`値が同じであれば（つまり、`UserID`の値がグラニュール0内のすべてのテーブル行に対して同じであれば）、ClickHouseはグラニュール0のすべてのテーブル行の`URL`値が`'http://showtopics.html%3...'`以上であると仮定できるということです。

  このことがクエリ実行パフォーマンスにどのように影響するかについて、後で詳しく議論します。
### 主キーインデックスはグラニュールの選択に使用される {#the-primary-index-is-used-for-selecting-granules}

これで、主キーインデックスのサポートを受けてクエリを実行できます。

以下は、UserID 749927693について最もクリックされた上位10件のURLを計算します。

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
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

10行がセットされました。経過時間: 0.005秒。
// highlight-next-line
処理された行数: 8.19千行,
740.18 KB (1.53百万行/秒, 138.59 MB/秒)
```

ClickHouseクライアントの出力は、テーブル全体のスキャンを行う代わりに、8.19千行のみがClickHouseにストリームされたことを示しています。


もし<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">トレースロギング</a>が有効になっている場合、ClickHouseサーバーログファイルには、ClickHouseがURL列の値が`749927693`の行を含む可能性のあるグラニュールを特定するために1083のUserIDインデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索</a>を実行していることが示されています。これは19ステップで、平均計算量は`O(log2 n)`です：
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


上記のトレースログでは、1083の既存マークのうち1つがクエリを満たしていることが確認できます。

<details>
    <summary>
    トレースログの詳細
    </summary>
    <p>

マーク176が特定されました（「左の境界マークが見つかりました」は含まれ、「右の境界マークが見つかりました」は除外されます）ので、すべての8192行がグラニュール176からストリームされます（これは行1.441.792から始まります - このガイドの後半で見ることになります）。
</p>
</details>

このことは、例のクエリにおいて<a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN句</a>を使用することでも再現できます：
```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のようになります：

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

16行がセットされました。経過時間: 0.003秒。
```
クライアント出力は、クエリの`UserID`列の値を持つ行を含む可能性があるグラニュールが1083のうち1つ選択されたことを示しています。

:::note 結論
クエリが複合キーの一部であり、最初のキー列でフィルタリングされている場合、ClickHouseはキー列のインデックスマークに対して二分探索アルゴリズムを実行します。
:::

<br/>

前述のように、ClickHouseはそのスパース主キーインデックスを使用して、クエリに一致する行を含む可能性のあるグラニュールを迅速に（二分探索で）選択します。

これはClickHouseクエリ実行の**第一段階（グラニュール選択）**です。

**第二段階（データ読み取り）**では、ClickHouseは選択されたグラニュールを特定し、それらの行をClickHouseエンジンにストリーミングして、実際にクエリに一致する行を見つけます。

この第二段階については次のセクションで詳しく論じます。
### マークファイルはグラニュールの位置特定に使用される {#mark-files-are-used-for-locating-granules}

以下の図は、我々のテーブルの主キーインデックスファイルの一部を示しています。

<img src={sparsePrimaryIndexes04} class="image"/>

前述のように、インデックスの1083のUserIDマークに対する二分探索を介して、マーク176が特定されました。その対応するグラニュール176は、したがって`749.927.693`のUserID列の値を持つ行を含む可能性があります。

<details>
    <summary>
    グラニュール選択の詳細
    </summary>
    <p>

上記の図は、マーク176が関連するグラニュール176の最小UserID値が`749.927.693`より小さく、次のマーク（マーク177）のグラニュール177の最小UserID値がこの値より大きい最初のインデックスエントリであることを示しています。したがって、マーク176の対応するグラニュール176のみが`749.927.693`のUserID列の値を含む可能性があります。
</p>
</details>

`749.927.693`のUserID列の値を持つ行がグラニュール176に存在するかどうかを確認するために、すべての8192行がClickHouseにストリーミングされる必要があります。

これを実現するために、ClickHouseはグラニュール176の物理的な位置を知る必要があります。

ClickHouseでは、テーブルのすべてのグラニュールの物理的な位置がマークファイルに保存されています。データファイルと同様に、各テーブル列ごとに1つのマークファイルがあります。

以下の図は、テーブルの`UserID`、`URL`、および`EventTime`列のグラニュールの物理的な位置を保存する3つのマークファイル`UserID.mrk`、`URL.mrk`、`EventTime.mrk`を示しています。
<img src={sparsePrimaryIndexes05} class="image"/>

主キーインデックスが0から始まる番号付けされたインデックスマークを持つ非圧縮のフラット配列ファイル（primary.idx）であるように、マークファイルもまた0から始まる番号付けされたマークを含む非圧縮のフラット配列ファイル（*.mrk）です。

ClickHouseがクエリに一致する行を含む可能性のあるグラニュールのインデックスマークを特定し選択したら、マークファイル内での位置配列ルックアップにより、グラニュールの物理的な位置を取得できます。

特定の列の各マークファイルエントリは、オフセットの形で2つの位置を保存しています：

- 最初のオフセット（上記の図の「block_offset」）は、選択されたグラニュールの圧縮版が含まれる<a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">ブロック</a>を<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮された</a>カラムデータファイル内で特定します。この圧縮されたブロックには、いくつかの圧縮されたグラニュールが含まれる可能性があります。特定された圧縮ファイルブロックは、読み取り時にメインメモリにデフレートされます。

- マークファイルからの2番目のオフセット（上記の図の「granule_offset」）は、デフレートされたブロックデータ内のグラニュールの位置を提供します。

次に、特定されたデフレートされたグラニュールのすべての8192行がClickHouseにストリーミングされ、さらなる処理が行われます。

:::note

- [広い形式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)と[適応インデックス粒度](/whats-new/changelog/2019.md/#experimental-features-1)を持たないテーブルの場合、ClickHouseは上述のように`.mrk`マークファイルを使用し、各エントリごとに2つの8バイト長のアドレスを含むエントリを持ちます。これらのエントリは、同じサイズのグラニュールを持つ物理的な位置を示しています。

インデックス粒度は[デフォルトで適応的](/operations/settings/merge-tree-settings#index_granularity_bytes)ですが、我々の例のテーブルでは（ガイドのディスカッションを簡素化し、図と結果を再現可能にするために）適応インデックス粒度を無効にしました。我々のテーブルは、データのサイズが[min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)（これがデフォルトのセルフマネージドクラスタの10MBより大きい）であるため、広い形式を使用しています。

- 適応インデックス粒度を持つ広い形式のテーブルの場合、ClickHouseは`.mrk2`マークファイルを使用し、`.mrk`マークファイルと似たエントリを含みますが、現在のエントリに関連するグラニュールの行数の追加の第三の値があります。

- [コンパクト形式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)のテーブルの場合、ClickHouseは`.mrk3`マークファイルを使用します。

:::


:::note マークファイルの理由

主キーインデックスは、インデックスマークに対応するグラニュールの物理的な位置を直接含まないのはなぜですか？

ClickHouseが対応するように設計された非常に大規模なスケールで、ディスクとメモリの効率性が非常に重要です。

主キーインデックスファイルはメインメモリに収まる必要があります。

例のクエリに対して、ClickHouseは主キーインデックスを使用してクエリに一致する可能性がある単一のグラニュールを選択しました。その1つのグラニュールに対してのみ、ClickHouseは関連する行をストリーミングするために物理的な位置が必要です。

さらに、このオフセット情報は、クエリに使用されていない列、例えば`EventTime`のためには必要ありません。

我々のサンプルクエリに対して、ClickHouseはUserIDデータファイル（UserID.bin）のグラニュール176に対する2つの物理位置オフセットのみ、およびURLデータファイル（URL.bin）のグラニュール176に対する2つの物理位置オフセットのみが必要です。

マークファイルによって提供される間接参照により、主キーインデックス内で、すべての3列に対する1083のグラニュールの物理的な位置に対するエントリを直接保存することで、メインメモリ内に不要な（使用される可能性のある）データを避けることができます。
:::

以下の図とテキストは、ClickHouseが指定されたクエリに対してどのようにUserID.binデータファイル内のグラニュール176を特定するかを示しています。

<img src={sparsePrimaryIndexes06} class="image"/>

我々のガイドの前半で説明したように、ClickHouseは主キーインデックスマーク176を選択したため、したがってグラニュール176がクエリに一致する行を含む可能性があると特定されました。

ClickHouseは、インデックスから選択されたマーク番号（176）を使用して、UserID.mrkマークファイル内でポジショナル配列ルックアップを行い、グラニュール176を特定するための2つのオフセットを取得します。

図に示すように、最初のオフセットは、UserID.binデータファイル内の圧縮ファイルブロックを特定します。このブロックには、グラニュール176の圧縮版が含まれています。

特定されたファイルブロックがメインメモリにデフレートされると、マークファイルの2番目のオフセットを使用して、デフレートされたデータ内のグラニュール176の位置を特定できます。

ClickHouseは、例のクエリ（UserID 749.927.693のインターネットユーザーの上位10件の最もクリックされたURL）を実行するために、UserID.binデータファイルとURL.binデータファイルの両方からグラニュール176を特定（およびストリームする）する必要があります。

上記の図は、ClickHouseがUserID.binデータファイルのグラニュールを特定している様子を示しています。

同時に、ClickHouseはURL.binデータファイルのグラニュール176についても同じことを行っています。2つのそれぞれのグラニュールが整列し、ClickHouseエンジンにストリーミングされ、UserIDが749.927.693のすべての行に対して、URL値をグループごとに集計し、カウントした後、最終的にカウント順に上位10のURLグループを出力します。
## 複数の主キーインデックスを使用する {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### セカンダリーキー列は非効率的（になり得る） {#secondary-key-columns-can-not-be-inefficient}

クエリが複合キーの一部であり、最初のキー列でフィルタリングされている場合、[ClickHouseはキー列のインデックスマークに対して二分探索アルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

しかし、クエリが複合キーの一部であり、最初のキー列ではない列でフィルタリングしている場合はどうなりますか？

:::note
クエリが明示的に最初のキー列でなく、セカンダリーキー列でフィルタリングしているシナリオを議論します。

クエリが最初のキー列およびその後の任意のキー列でフィルタリングしている場合、ClickHouseは最初のキー列のインデックスマークに対して二分探索を実行します。
:::


<br/>
<br/>

<a name="query-on-url"></a>
URL "http://public_search"を最も頻繁にクリックした上位10ユーザーを計算するクエリを使用します。

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次の通りです： <a name="query-on-url-slow"></a>
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

10行がセットされました。経過時間: 0.086秒。
// highlight-next-line
処理された行数: 8.81百万行,
799.69 MB (102.11百万行/秒, 9.27 GB/秒)
```

クライアント出力は、ClickHouseがほぼテーブル全体のスキャンを実行したことを示しており、[URL列が複合主キーの一部であるにもかかわらず](#a-table-with-a-primary-key)、ClickHouseは887万行のテーブルから888万行を読みました。

もし[trace_logging](/operations/server-configuration-parameters/settings#logger)が有効になっている場合、ClickHouseサーバーログファイルには、ClickHouseが<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">一般的な除外検索</a>を1083のURLインデックスマークに対して使用して「http://public_search」というURL列の値を持つ行を含む可能性のあるグラニュールを特定したことが示されます：
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
上記のサンプルトレースログでは、1083グラニュールのうち、1076が選択され、URLの値が一致する行を持つ可能性のあるグラニュールが選ばれました。

これにより、8.81百万行がClickHouseエンジンにストリーミングされ、'http://public_search'というURL値を持つ行を特定するために処理が行われます。

ただし、後で確認するように、選択された1076グラニュールのうち39グラニュールのみが実際に一致する行を含みます。

複合主キー（UserID, URL）に基づく主キーインデックスは、特定のUserID値を持つ行のフィルタリングを迅速化するために非常に役立ちましたが、特定のURL値を持つ行のフィルタリングに関しては、クエリを迅速化するために重要な助けになりません。

これには理由があり、URL列は最初のキー列ではないため、ClickHouseはURL列のインデックスマークに対して一般的な除外検索アルゴリズム（代わりに二分探索）を使用しており、そのアルゴリズムの効果はURL列とその前のキー列であるUserIDの基数の違いに依存しています。

これを説明するために、一般的な除外検索の仕組みについての詳細を示します。

<a name="generic-exclusion-search-algorithm"></a>
### 一般的な除外検索アルゴリズム {#generic-exclusion-search-algorithm}

以下は、<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank">ClickHouseの一般的な除外検索アルゴリズム</a>が、前のキー列の基数が低いまたは高い場合に副次的な列からグラニュールを選択するときにどのように動作するかを示しています。

両方のケースの例として以下のような前提を置きます：
- URL値="W3"を持つ行を検索しているクエリ。
- UserIDとURLの簡略化された値を持つ抽象的なヒットテーブル。
- 同じ複合主キー（UserID, URL）をインデックスに持つ。このため、行は最初にUserID値で、同じUserID値の行はURLで順序付けられる。
- グラニュールサイズは2、つまり各グラニュールは2行を含みます。

上記の図で最初のテーブル行ごとに1つのグラニュールがオレンジ色でマークされています。

**前のキー列が低い基数の場合**<a name="generic-exclusion-search-fast"></a>

UserIDが低い基数を持つ場合、同じUserID値が複数のテーブル行やグラニュール、したがってインデックスマークにまたがって広がる可能性が高くなります。同じUserIDを持つインデックスマークで、URL値は昇順にソートされています（テーブル行はまずUserIDで、その後にURLで並べられます）。これにより、効率的なフィルタリングが可能になります。

以下の図は、我々の抽象的なサンプルデータに対するグラニュール選択プロセスの3つの異なるシナリオを示しています：

1. インデックスマーク0で、**URL値がW3より小さく、直接次に続くインデックスマークのURL値もW3より小さい**場合は、排除されます。これは、マーク0と1が同じUserID値を持つためです。この排除の前提条件により、グラニュール0が全てU1のUserID値で構成され、ClickHouseがグラニュール0の最大URL値もW3より小さいと仮定できるため、グラニュールを除外できます。

2. インデックスマーク1で、**URL値がW3以下で、次のインデックスマークのURL値がW3以上である**場合は選択されます。これは、グラニュール1がURL W3を含む可能性があることを示します。

3. インデックスマーク2および3で、**URL値がW3より大きい**場合は除外されます。主キーインデックスのインデックスマークは、各グラニュールの最初のテーブル行のキー列値を保存しているため、ディスク上でテーブル行はキー列値でソートされているため、グラニュール2および3はURL値W3を含むことはできません。

**前のキー列が高い基数の場合**<a name="generic-exclusion-search-slow"></a>

UserIDの基数が高い場合、同じUserID値が複数のテーブル行やグラニュールに広がる可能性は低くなります。これにより、インデックスマークのURL値は単調増加しなくなります：

<img src={sparsePrimaryIndexes08} class="image"/>

上記の図を見ると、W3より小さいすべてのマークが、その関連するグラニュールの行をClickHouseエンジンにストリーミングするために選択されています。

これは、上記の図のすべてのインデックスマークが、シナリオ1で説明した条件を満たしていますが、次のインデックスマークがその現在のマークと同じUserID値を持っているわけではなく、排除できません。

例えば、マーク0で**URL値がW3より小さく、その次のインデックスマークのURL値もW3より小さい**場合、直接次に続くインデックスマーク1は*マーク0と同じUserID値を持っていないため*、排除できません。

この最終的には、ClickHouseがグラニュール0の最大URL値に関する仮定を行うことを妨げます。したがって、ClickHouseはグラニュール0がURL値W3を含む可能性があると仮定するしかなく、マーク0を選択せざるを得ません。

マーク1、2、および3に対して同様のシナリオが当てはまります。

:::note 結論
ClickHouseが複合キーの一部であっても最初のキー列ではない列でクエリがフィルタリングされるときに使用する<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">一般的な除外検索アルゴリズム</a>は、前のキー列の基数が低い場合に最も効果的です。
:::

サンプルデータセットでは、両方のキー列（UserID、URL）が高い基数を持ち、前述のように、URL列の前のキー列が高い基数を持つ場合には一般的な除外検索アルゴリズムがあまり効果的でないことが説明されました。
### データスキッピングインデックスに関する注意 {#note-about-data-skipping-index}

UserIDとURLの類似した高いカーディナリティのため、私たちの[URLでのクエリフィルタリング](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)も、[URLカラム](./skipping-indexes.md)に対して[セカンダリーデータスキッピングインデックス](#a-table-with-a-primary-key)を作成してもほとんど恩恵を受けません。

例えば、次の2つの文は、私たちのテーブルのURLカラムに対して[minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries)データスキッピングインデックスを作成およびポピュレートします：
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouseは、今、追加のインデックスを作成し、4つの連続した[グラニュール](#data-is-organized-into-granules-for-parallel-data-processing)ごとに（上記の`ALTER TABLE`文の`GRANULARITY 4`句に注意）、最小および最大のURL値を保存しています：

<img src={sparsePrimaryIndexes13a} class="image"/>

最初のインデックスエントリ（上の図の「マーク0」）は、[テーブルの最初の4つのグラニュールに属する行](#data-is-organized-into-granules-for-parallel-data-processing)の最小および最大のURL値を保存しています。

2番目のインデックスエントリ（「マーク1」）は、テーブルの次の4つのグラニュールに属する行の最小および最大のURL値を保存しており、以下同様です。

（ClickHouseは、データスキッピングインデックスのために[マークファイル](#mark-files-are-used-for-locating-granules)を作成しました、インデックスマークに関連するグラニュールのグループを[特定するために](#mark-files-are-used-for-locating-granules)使用します。）

UserIDとURLの類似した高いカーディナリティのため、このセカンダリーデータスキッピングインデックスは、私たちの[URLでのクエリフィルタリング](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)が実行される際に、グラニュールの選択から除外するのに役立ちません。

クエリが探している特定のURL値（つまり、'http://public_search'）は、インデックスが各グループのグラニュールに対して保存している最小および最大の値の間にある可能性が高くなります。そのため、ClickHouseはグループのグラニュールを選択せざるを得ません（それらにはクエリに一致する行が含まれているかもしれないため）。

### 複数の主キーインデックスを使用する必要性 {#a-need-to-use-multiple-primary-indexes}

その結果、特定のURLを持つ行をフィルタリングするサンプルクエリを大幅に高速化したい場合は、そのクエリに最適化された主キーインデックスを使用する必要があります。

さらに、特定のUserIDを持つ行をフィルタリングするサンプルクエリの良好なパフォーマンスを保持したい場合は、複数の主キーインデックスを使用する必要があります。

以下では、それを実現する方法を示しています。

<a name="multiple-primary-indexes"></a>
### 追加の主キーインデックスを作成するためのオプション {#options-for-creating-additional-primary-indexes}

私たちのサンプルクエリの両方を大幅に高速化したい場合 — 特定のUserIDを持つ行をフィルタリングするクエリと、特定のURLを持つ行をフィルタリングするクエリ — では、以下の3つのオプションを使用して複数の主キーインデックスを使用する必要があります：

- **2番目のテーブル**を異なる主キーで作成する。
- 既存のテーブルに**マテリアライズドビュー**を作成する。
- 既存のテーブルに**プロジェクション**を追加する。

これら3つのオプションはすべて、主キーインデックスと行のソート順を再編成するために、効果的にサンプルデータを別のテーブルに複製します。

ただし、3つのオプションは、クエリや挿入ステートメントのルーティングに関して、追加のテーブルがユーザーにとってどれだけ透明であるかで異なります。

**2番目のテーブル**を異なる主キーで作成する場合、クエリは明示的にそのクエリに最も適したテーブルバージョンに送信する必要があり、新しいデータは両方のテーブルに明示的に挿入する必要があります：

<img src={sparsePrimaryIndexes09a} class="image"/>

**マテリアライズドビュー**を使用すると、追加のテーブルが暗黙的に作成され、データが両方のテーブル間で自動的に同期されます：

<img src={sparsePrimaryIndexes09b} class="image"/>

**プロジェクション**は最も透明なオプションであり、暗黙的に作成された（隠れた）追加のテーブルがデータ変更と同期を自動的に保持するだけでなく、ClickHouseはクエリに最も効果的なテーブルバージョンを自動的に選択します：

<img src={sparsePrimaryIndexes09c} class="image"/>

次のセクションでは、複数の主キーインデックスを作成および使用するためのこれら3つのオプションについて、さらに詳しく現実の例を交えて議論します。

<a name="multiple-primary-indexes-via-secondary-tables"></a>
### オプション1: セカンダリテーブル {#option-1-secondary-tables}

<a name="secondary-table"></a>
主キーのキーの順序を（元のテーブルに対して）切り替えた新しい追加テーブルを作成します：

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

元の[テーブル](#a-table-with-a-primary-key)の全8.87百万行を追加テーブルに挿入します：

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

主キーのカラムの順序を切り替えたため、挿入された行はディスクに異なる辞書順で格納されています（元の[テーブル](#a-table-with-a-primary-key)に対して）おり、それによりそのテーブルの1083のグラニュールに含まれる値も異なります：

<img src={sparsePrimaryIndexes10} class="image"/>

これが得られた主キーです：

<img src={sparsePrimaryIndexes11} class="image"/>

これを使用して、URL「http://public_search」を最も頻繁にクリックした上位10人のユーザーを計算するための私たちの例のクエリの実行を大幅に高速化できます：
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
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
// highlight-next-line
Processed 319.49 thousand rows,
11.38 MB (18.41 million rows/s., 655.75 MB/s.)
```

今や、[ほぼ全テーブルスキャンを実行する代わりに](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns)、ClickHouseはそのクエリをより効果的に実行しています。

UserIDが最初のカラムで、URLが2番目のキーのカラムであった元のテーブルからの主インデックスでは、ClickHouseはそのクエリを実行するためにインデックスマークに対して[一般的な排除検索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)を使用していましたが、UserIDとURLの類似した高いカーディナリティのため、それはあまり効果的ではありませんでした。

URLが主インデックスの最初のカラムとして設定されると、ClickHouseはインデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">バイナリサーチ</a>を実行します。
ClickHouseサーバーログファイルの対応するトレースログは、次のことを確認しています：
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
ClickHouseは、一般的な排除検索が使用されていたときの1076ではなく、わずか39のインデックスマークを選択しました。

追加のテーブルは、URLでフィルタリングする私たちの例のクエリの実行を加速するために最適化されています。

元のテーブルでの[悪いパフォーマンス](/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)のクエリと同様に、私たちの[UserIDsでのクエリフィルタリング](#the-primary-index-is-used-for-selecting-granules)も、新しい追加テーブルでは非常に効果的には実行されません。なぜなら、UserIDがそのテーブルの主インデックスの2番目のキーのカラムであり、そのためClickHouseはグラニュール選択のために一般的な排除検索を使用するからです。これは、[類似した高いカーディナリティに対しては非常に効果的ではありません](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)。
詳細ボックスを開いて具体的な内容を表示してください。

<details>
    <summary>
    UserIDsでのクエリフィルタリングは現在、パフォーマンスが悪い<a name="query-on-userid-slow"></a>
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

応答は：

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

現在、私たちは2つのテーブルを持っています。UserIDsでのクエリをフィルタリングするために最適化されたテーブルと、URLでのクエリをフィルタリングするために最適化されたテーブルです：

<img src={sparsePrimaryIndexes12a} class="image"/>

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

応答は次のようになります：

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note
- 視点の主キーにおいて、キーのカラムの順序を（元のテーブルに対して）切り替えています。
- マテリアライズドビューは、与えられた主キー定義に基づいて行の順序と主インデックスを持つ**暗黙的に作成されたテーブル**によって支えられています。
- 暗黙的に作成されたテーブルは、`SHOW TABLES`クエリによってリストされ、名前は`.inner`で始まります。
- マテリアライズドビューのバックで暗黙的に作成されたテーブルを指し示すために、最初にバックを明示的に作成することも可能です。
- `POPULATE`キーワードを使用して、元のテーブル[ hits_UserID_URL](#a-table-with-a-primary-key)の8.87百万行ですぐに暗黙的に作成されたテーブルをポピュレートしています。
- 新しい行が元のテーブルhits_UserID_URLに挿入された場合、暗黙的に作成されたテーブルにもその行が自動的に挿入されます。
- 実際には、暗黙的に作成されたテーブルは、[明示的に作成したセカンダリテーブル](#option-1-secondary-tables)と同じ行の順序と主インデックスを持っています：

<img src={sparsePrimaryIndexes12b1} class="image"/>

ClickHouseは、[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns)(*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules)(*.mrk2)、および主インデックス(primary.idx)を、ClickHouseサーバーのデータディレクトリ内の特別なフォルダーに格納しています：

<img src={sparsePrimaryIndexes12b2} class="image"/>

:::

マテリアライズドビューによって支えられる（その主インデックス）が今や、URLカラムをフィルタリングする私たちの例のクエリの実行を大幅に加速するために使用できます：
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
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
// highlight-next-line
Processed 335.87 thousand rows,
13.54 MB (12.91 million rows/s., 520.38 MB/s.)
```

実際には、マテリアライズドビューによって支えられるテーブル（その主インデックス）は、[明示的に作成したセカンダリテーブル](#option-1-secondary-tables)と同一であり、クエリは明示的に作成されたテーブルと同じ効果的な方法で実行されます。

ClickHouseサーバーログファイルの対応するトレースログは、ClickHouseがインデックスマークに対してバイナリサーチを実行していることを確認しています：

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

### オプション3: プロジェクション {#option-3-projections}

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
- プロジェクションは、指定された`ORDER BY`句に基づいて行の順序と主インデックスを持つ**隠れたテーブル**を作成しています。
- 隠れたテーブルは、`SHOW TABLES`クエリによってリストされません。
- `MATERIALIZE`キーワードを使用して、元のテーブル[ hits_UserID_URL](#a-table-with-a-primary-key)からすぐに8.87百万行を埋め込むようにします。
- 新しい行が元のテーブルhits_UserID_URLに挿入された場合、暗黙的に作成されたテーブルにもその行が自動的に挿入されます。
- クエリは常に構文的に元のテーブルhits_UserID_URLを対象としていますが、隠れたテーブルの行の順序と主インデックスがクエリの実行をより効果的にする場合、その隠れたテーブルが代わりに使用されます。
- プロジェクションは、たとえORDER BYがプロジェクションのORDER BY文と一致しても、ORDER BYを使用するクエリを効果的にしません（詳細は https://github.com/ClickHouse/ClickHouse/issues/47333）。
- 実際には、暗黙的に作成された隠れたテーブルは、[明示的に作成したセカンダリテーブル](#option-1-secondary-tables)と同じ行の順序と主インデックスを持っています：

<img src={sparsePrimaryIndexes12c1} class="image"/>

ClickHouseは、[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns)(*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules)(*.mrk2)、および主インデックス(primary.idx)を、元のテーブルのデータファイル、マークファイル、主インデックスファイルの隣にある特別なフォルダーに格納しています：

<img src={sparsePrimaryIndexes12c2} class="image"/>
:::

プロジェクションによって作成された隠れたテーブル（その主インデックス）は、今や（暗黙的に）URLカラムをフィルタリングする私たちの例のクエリの実行を大幅に加速するために使用されます。クエリは構文的にはプロジェクションの元のテーブルを対象にしています。
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
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
// highlight-next-line
Processed 319.49 thousand rows, 1
1.38 MB (11.05 million rows/s., 393.58 MB/s.)
```

実際には、プロジェクションによって作成された隠れたテーブル（その主インデックス）は、[明示的に作成したセカンダリテーブル](#option-1-secondary-tables)と同一であり、クエリは明示的に作成されたテーブルと同じ効果的な方法で実行されます。

ClickHouseサーバーログファイルの対応するトレースログは、ClickHouseがインデックスマークに対してバイナリサーチを実行していることを確認しています：

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

### まとめ {#summary}

私たちの[複合主キーを持つテーブル（UserID、URL）](#a-table-with-a-primary-key)は、[UserIDでフィルタリングするクエリ](#the-primary-index-is-used-for-selecting-granules)の実行を加速するのに非常に役立ちました。しかし、そのインデックスは、URLカラムが複合主キーの一部であっても、[URLでフィルタリングするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)を加速するのにはあまり役立ちません。

逆に：
私たちの[複合主キー（URL、UserID）](#guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)を持つテーブルは、[URLでフィルタリングするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)を加速しましたが、[UserIDでフィルタリングするクエリ](#the-primary-index-is-used-for-selecting-granules)をあまり支援しませんでした。

主キーのカラムUserIDとURLの類似した高いカーディナリティのため、2番目のキーのカラムでフィルタリングするクエリは、[インデックスにおけるセカンドキーのカラムが存在することからあまり利点を得ません](#generic-exclusion-search-algorithm)。

したがって、主インデックスから2番目のキーのカラムを削除する（インデックスのメモリ消費を減らす結果になります）ことと、[複数の主キーインデックスを使用する](#using-multiple-primary-indexes)ことが理にかなっています。

ただし、複合主キーのキーのカラムに大きなカーディナリティの差がある場合、クエリにとって[有益である](#generic-exclusion-search-algorithm)のは、主キーをカーディナリティの昇順に並べることです。

キーのカラム間のカーディナリティの差が大きいほど、これらのカラムの順序が重要になります。次のセクションでそれを示します。

## キーカラムを効率的に順序付ける {#ordering-key-columns-efficiently}

<a name="test"></a>

複合主キーでは、キーのカラムの順序は、次の両方に大きな影響を与える可能性があります：
- クエリにおけるセカンダリキーのカラムに対するフィルタリングの効率、および
- テーブルのデータファイルに対する圧縮率。

これを示すために、インターネット「ユーザー」（`UserID`カラム）がURL（`URL`カラム）にアクセスしたかどうかを示す3つのカラムを含む[ウェブトラフィックサンプルデータセット](#data-set)のバージョンを使用します。これには、ボットトラフィックとしてマークされたかどうかを示す`IsRobot`カラムも含まれます。

通常のウェブアナリティクスクエリを高速化するために使用できる複合主キーを含む3つのカラムを使用します。具体的には、次のような計算を行います：
- 特定のURLへのトラフィック（割合）のうち、どれだけがボットからのものか
- 特定のユーザーが（ボットでない）確率がどれだけ高いか（そのユーザーからのトラフィックのうち、どれだけがボットトラフィックでないと見做されるか）

これらの3つのカラムのカーディナリティを計算するために、次のクエリを使用します（注意： TSVデータをローカルテーブルを作成せずに即座にクエリするために、[URLテーブル関数](/sql-reference/table-functions/url.md)を使用しています）。このクエリを`clickhouse client`で実行します：
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

`URL`カラムと`IsRobot`カラムの間には大きな差があるため、これらのカラムの順序は、クエリの効率的な高速化や、テーブルのカラムデータファイルの最適な圧縮率を達成する上で重要です。

このことを示すために、ボットトラフィック分析データ用に2つのテーブルバージョンを作成します：
- 複合主キー`(URL, UserID, IsRobot)`を持つテーブル`hits_URL_UserID_IsRobot`では、キーのカラムをカーディナリティの高い順に並べます。
- 複合主キー`(IsRobot, UserID, URL)`を持つテーブル`hits_IsRobot_UserID_URL`では、キーのカラムをカーディナリティの低い順に並べます。

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

そして8.87百万行をポピュレートします：
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

そして、前のテーブルに使用したのと同じ8.87百万行をポピュレートします：
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

### セカンダリキーのカラムでの効率的なフィルタリング {#efficient-filtering-on-secondary-key-columns}

クエリが複合キーの少なくとも1つのカラムでフィルタリングしている場合、かつそれが最初のキーのカラムである場合、[ClickHouseはそのキーのカラムのインデックスマークに対してバイナリサーチアルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

クエリが複合キーの一部であるカラムで（のみ）フィルタリングしているが、それが最初のキーのカラムでない場合、[ClickHouseはそのキーのカラムのインデックスマークに対して一般的な排除検索アルゴリズムを使用します](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

後者のケースでは、複合主キーのキーのカラムの順序は、[一般的な排除検索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)の有効性にとって重要です。

次のクエリは、キーのカラムを`(URL, UserID, IsRobot)`の順にカーディナリティが高い順に並べたテーブルの`UserID`カラムでフィルタリングしています：
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
// highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

同じクエリを、キーのカラムを`(IsRobot, UserID, URL)`の順にカーディナリティが低い順に並べたテーブルで実行します：
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
// highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

キーのカラムをカーディナリティの低い順に並べたテーブルでのクエリの実行が、はるかに効果的でより速いことがわかります。

その理由は、[一般的な排除検索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)が、前のキーのカラムが低いカーディナリティを有する場合、セカンダリーキーのカラムを通じてグラニュールが選択される際に最も効果的に機能するためです。この点については、[このガイドの前のセクション](#generic-exclusion-search-algorithm)で詳しく説明しています。
### 最適なデータファイルの圧縮率 {#optimal-compression-ratio-of-data-files}

このクエリは、上記で作成した2つのテーブル間で`UserID`カラムの圧縮率を比較します。

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

2行のセット。経過時間: 0.006秒。
```
`UserID`カラムの圧縮率は、キーのカラム `(IsRobot, UserID, URL)` をカーディナリティの昇順で並べたテーブルでかなり高いことがわかります。

両方のテーブルには正確に同じデータ（887万行を両方のテーブルに挿入しました）が保存されていますが、複合主キーのキー列の順序は、<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a>データがテーブルの [カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) に必要とするディスクスペースに大きな影響を与えます：
- 複合主キー `(URL, UserID, IsRobot)` を持つテーブル `hits_URL_UserID_IsRobot` では、カーディナリティを降順で並べると、`UserID.bin` データファイルは **11.24 MiB** のディスクスペースを占有します
- 複合主キー `(IsRobot, UserID, URL)` を持つテーブル `hits_IsRobot_UserID_URL` では、カーディナリティを昇順で並べると、`UserID.bin` データファイルはわずか **877.47 KiB** のディスクスペースを占有します

テーブルのカラムのデータに良好な圧縮率を持つことは、ディスク上のスペースを節約するだけでなく、そのカラムからデータを読み取るクエリ（特に分析的なクエリ）が速くなることにも寄与します。これは、カラムのデータをディスクからメインメモリ（オペレーティングシステムのファイルキャッシュ）に移動させるために必要なI/Oが減少するからです。

以下では、テーブルのカラムの圧縮率を向上させるために、主キーのカラムをカーディナリティの昇順で並べることの利点を説明します。

以下の図は、主キーがカーディナリティの昇順で並べられた場合の行のディスク上の順序を概略示しています：
<img src={sparsePrimaryIndexes14a} class="image"/>

[テーブルの行データが主キーのカラムで順番にディスクに保存される](#data-is-stored-on-disk-ordered-by-primary-key-columns) ことについて議論しました。

上の図では、テーブルの行（ディスク上のカラム値）は、最初にその `cl` 値で順序付けられ、同じ `cl` 値の行はその `ch` 値で順序付けられます。そして、最初のキー列 `cl` は低カーディナリティを持っているため、同じ `cl` 値を持つ行が存在する可能性が高いです。そのため、`ch` 値が（同じ `cl` 値を持つ行について局所的に）順序付けられる可能性もあります。

カラム内で、類似データが互いに近く配置されている場合（例：ソートによって）、そのデータはより良く圧縮されます。
一般的に、圧縮アルゴリズムはデータのランレングス（もっと多くのデータが見えるほど圧縮に有利）および局所性（データがより類似しているほど圧縮率が高くなる）から利益を得ます。

上の図とは対照的に、下の図は、主キーがカーディナリティの降順で並べられた場合の行のディスク上の順序を概略示しています：
<img src={sparsePrimaryIndexes14b} class="image"/>

この場合、テーブルの行は最初にその `ch` 値で順序付けられ、同じ `ch` 値を持つ行はその `cl` 値で順序付けられます。
しかし、最初のキー列 `ch` は高カーディナリティを持っているため、同じ `ch` 値を持つ行が存在する可能性は低くなります。その結果、`cl` 値が（同じ `ch` 値を持つ行について局所的に）順序付けられる可能性も低くなります。

したがって、`cl` 値はほとんどランダムな順序になり、その結果、局所性と圧縮率が悪くなります。

### 要約 {#summary-1}

クエリにおけるセカンダリキーのカラムに対する効率的なフィルタリングおよびテーブルのカラムデータファイルの圧縮率の両方において、主キーのカラムをカーディナリティの昇順で並べることは有利です。

### 関連コンテンツ {#related-content-1}
- ブログ: [ClickHouseクエリの高速化](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## 単一行を効率的に特定する {#identifying-single-rows-efficiently}

一般的に、ClickHouseの最適な使用ケースではありませんが、時にはClickHouse上に構築されたアプリケーションがClickHouseテーブルの単一行を特定することを要求します。

そのための直感的な解決策は、各行に一意の値を持つ [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) カラムを使用し、そのカラムを主キーとして利用して行の高速な取得を行うことかもしれません。

最も高速な取得のためには、UUIDカラムは [最初のキー列である必要があります](#the-primary-index-is-used-for-selecting-granules)。

私たちは、[ClickHouseテーブルの行データが主キーのカラムで順番にディスクに保存される](#data-is-stored-on-disk-ordered-by-primary-key-columns) ため、非常に高いカーディナリティを持つカラム（UUIDカラムのような）を主キーまたは複合主キーの最初のカラムに置くことは、[他のテーブルカラムの圧縮率にとって悪影響を及ぼす](#optimal-compression-ratio-of-data-files) ことについて議論しました。

最も速い取得と最適なデータ圧縮の間の妥協は、UUIDを低カーディナリティのキー列の後に配置した複合主キーを使用することです。これにより、いくつかのテーブルのカラムの良好な圧縮率が確保されます。

### 具体的な例 {#a-concrete-example}

一例として、Alexey Milovidovが開発し、[ブログで紹介した](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/) プレーンテキストペーストサービス https://pastila.nl があります。 

テキストエリアの変更時に、データが自動的にClickHouseテーブルの行に保存されます（変更ごとに1行）。

過去の内容を特定して取得する一つの方法として、内容のハッシュをUUIDとして使用することがあります。

以下の図は
- 内容が変更される際の行の挿入順序（例えば、テキストエリアにテキストを入力する際のキーストロークによって）と
- `PRIMARY KEY (hash)` を使用した際の挿入された行のデータのディスク上の順序を示しています：
<img src={sparsePrimaryIndexes15a} class="image"/>

`hash`カラムが主キーとして使用されているために、
- 特定の行は[非常に迅速に](#the-primary-index-is-used-for-selecting-granules)取得できますが、
- テーブルの行（そのカラムデータ）はディスク上に（ユニークでランダムな）ハッシュ値の昇順で保存されます。したがって、内容カラムの値もランダムな順序で保存され、データの局所性が得られず、**内容カラムデータファイルの圧縮率が最適ではありません**。

内容カラムの圧縮率を大幅に改善しながら、特定の行の迅速な取得を実現するために、pastila.nlでは特定の行を識別するために2つのハッシュ（および複合主キー）を使用しています：
- 前述の通り、異なるデータに対して異なるハッシュを持つ内容のハッシュと、
- 小さなデータの変更では**変わらない** [局所性感度ハッシュ（フィンガープリント）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)。

以下の図は
- 内容が変更される際の行の挿入順序（例えば、テキストエリアにテキストを入力する際のキーストロークによって）と
- `PRIMARY KEY (fingerprint, hash)` を使用した際の挿入された行のデータのディスク上の順序を示しています：

<img src={sparsePrimaryIndexes15b} class="image"/>

これで、ディスク上では最初に `fingerprint` によって行が順序付けられ、同じフィンガープリント値を持つ行については、`hash` 値が最終的な順を決定します。

小さな変更のみで異なるデータが同じフィンガープリント値を持つため、ディスク上では類似データが現在どれも内容カラムに近く保存されます。それは内容カラムの圧縮率にとって非常に良い結果をもたらし、圧縮アルゴリズムは一般にデータの局所性から恩恵を受けます（データがより類似しているほど、圧縮率が向上します）。

妥協点は、特定の行を取得するためには、複合 `PRIMARY KEY (fingerprint, hash)` から得られる主インデックスを最適に利用するために2つのフィールド（`fingerprint` と `hash`）が必要となることです。
