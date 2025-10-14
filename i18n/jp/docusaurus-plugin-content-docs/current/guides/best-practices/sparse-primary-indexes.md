---
'sidebar_label': '主キーインデックス'
'sidebar_position': 1
'description': 'このガイドでは、ClickHouseのインデックスについて深く掘り下げていきます。'
'title': 'ClickHouseにおける主キーインデックスの実践的入門'
'slug': '/guides/best-practices/sparse-primary-indexes'
'show_related_blogs': true
'doc_type': 'guide'
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


# ClickHouseにおける主キーインデックスの実践的な入門
## はじめに {#introduction}

このガイドでは、ClickHouseのインデックスについて深く掘り下げていきます。詳細に説明し議論する内容は以下の通りです：
- [ClickHouseのインデックスが従来のリレーショナルデータベース管理システムとどのように異なるか](#an-index-design-for-massive-data-scales)
- [ClickHouseがテーブルのスパース主キーインデックスをどのように構築し使用しているか](#a-table-with-a-primary-key)
- [ClickHouseのインデックスに関するベストプラクティス](#using-multiple-primary-indexes)

このガイドに記載されている全てのClickHouse SQL文やクエリは、お使いのマシン上で実行することも可能です。
ClickHouseのインストールと開始手順については、[クイックスタート](/get-started/quick-start)を参照してください。

:::note
このガイドは、ClickHouseのスパース主キーインデックスに焦点を当てています。

ClickHouseの[二次データスキッピングインデックス](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)については、[チュートリアル](/guides/best-practices/skipping-indexes.md)をご覧ください。
:::
### データセット {#data-set}

このガイド全体で、サンプルの匿名化されたWebトラフィックデータセットを使用します。

- サンプルデータセットの8.87百万行（イベント）のサブセットを使用します。
- 非圧縮データサイズは8.87百万イベントで約700 MBです。ClickHouseに保存すると200 MBに圧縮されます。
- このサブセットには、特定の時刻（`EventTime`カラム）にURL（`URL`カラム）をクリックしたインターネットユーザーを示す3つのカラムが含まれています（`UserID`カラム）。

これらの3つのカラムを使用して、次のような典型的なWeb分析クエリを既に構築できます：

- "特定のユーザーが最もクリックした上位10のURLは何ですか？"
- "特定のURLを最も頻繁にクリックした上位10のユーザーは誰ですか？"
- "特定のURLをユーザーがクリックする最も人気のある時間（例えば、曜日）はいつですか？"
### テストマシン {#test-machine}

この文書に記載されている全ての実行時数値は、Apple M1 Proチップを搭載したMacBook Pro上でClickHouse 22.2.1をローカルで実行した結果に基づいています。
### フルテーブルスキャン {#a-full-table-scan}

主キーなしでデータセットに対してクエリがどのように実行されるかを見るために、次のSQL DDL文を実行してテーブル（MergeTreeテーブルエンジンを使用）を作成します：

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

次に、以下のSQL挿入文でヒットデータセットのサブセットをテーブルに挿入します。
これは、clickhouse.comでホストされているフルデータセットのサブセットをロードするために[URLテーブル関数](/sql-reference/table-functions/url.md)を使用します：

```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
レスポンスは：
```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```

ClickHouseクライアントの結果出力は、上記の文がテーブルに8.87百万行を挿入したことを示しています。

最後に、このガイドの後の議論を簡素化し、図および結果を再現可能にするために、FINALキーワードを使用してテーブルを[最適化](/sql-reference/statements/optimize.md)します：

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
一般的に、データをロードした後に即座にテーブルを最適化することは必要ではなく、推奨されません。この例においてなぜそれが必要なのかは明白になるでしょう。
:::

次に、最初のWeb分析クエリを実行します。以下は、UserID 749927693のインターネットユーザーが最もクリックした上位10のURLを計算しています：

```sql
SELECT URL, count(URL) AS Count
FROM hits_NoPrimaryKey
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```
レスポンスは：
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

ClickHouseクライアントの結果出力は、ClickHouseがフルテーブルスキャンを実行したことを示しています！私たちのテーブルの8.87百万行の各行がClickHouseにストリーミングされました。それではスケールしません。

これを（はるかに）効率的で（さらに）高速にするためには、適切な主キーを持つテーブルを使用する必要があります。これにより、ClickHouseは自動的に（主キーのカラムに基づいて）スパース主キーインデックスを作成でき、これが私たちの例のクエリの実行を大幅にスピードアップします。
## ClickHouseインデックス設計 {#clickhouse-index-design}
### 大規模データスケールのためのインデックス設計 {#an-index-design-for-massive-data-scales}

従来のリレーショナルデータベース管理システムでは、主インデックスはテーブル行ごとに1つのエントリを含みます。これにより、主インデックスにはデータセットに対して8.87百万のエントリが含まれることになります。このようなインデックスは特定の行を迅速に特定することを可能にし、検索クエリおよびポイント更新の効率が向上します。`B(+)-Tree`データ構造でエントリを検索する場合の平均時間計算量は`O(log n)`です。より正確には、`log_b n = log_2 n / log_2 b`となり、`b`は`B(+)-Tree`の分岐係数で、`n`はインデックスされた行の数です。通常`b`は数百から数千の間であるため、`B(+)-Trees`は非常に浅い構造であり、レコードを特定するために必要なディスクシークが少なくて済みます。8.87百万行および分岐係数が1000の場合、平均して2.3のディスクシークが必要です。この能力はコストを伴います：ディスクとメモリのオーバーヘッドが追加され、新しい行をテーブルに追加したりインデックスにエントリを追加する際のコストが高くなり、時にはB-Treeの再バランスも必要です。

B-Treeインデックスに関連する課題を考慮し、ClickHouseのテーブルエンジンは異なるアプローチを採用しています。ClickHouseの[MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family/index.md)は、大規模データボリュームを処理するために設計および最適化されています。これらのテーブルは、秒間に数百万の行の挿入を受け取り、非常に大きな（数百ペタバイト）データボリュームを格納するように設計されています。データは、背景でパーツをマージするためのルールが適用されながら、[パーツごとに迅速にテーブルに書き込まれます](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)。ClickHouseでは、各パーツには独自の主インデックスがあります。パーツがマージされると、マージされたパーツの主インデックスもマージされます。ClickHouseが設計されている非常に大規模の範囲では、ディスクとメモリの効率が非常に重要です。したがって、すべての行をインデックスする代わりに、パーツの主インデックスには、行のグループ（「グラニュール」）ごとに1つのインデックスエントリ（「マーク」と呼ばれる）が存在します。この技術は**スパースインデックス**として知られています。

スパースインデックスは、ClickHouseがパーツの行を主キーのカラムによってディスクに順序付けて存储しているために可能です。単一の行を特定するのではなく（B-Treeベースのインデックスのように）、スパース主インデックスは、インデックスエントリに対する二分探索を通じて、クエリと一致する可能性のある行のグループを迅速に特定します。特定されたグループの潜在的に一致する行（グラニュール）は、クエリの一致を見つけるためにClickHouseエンジンに並行してストリーミングされます。このインデックス設計により、主インデックスは小さく（完全にメインメモリに収まる必要があり）、クエリ実行時間を大幅に短縮し、特にデータ分析ユースケースで典型的な範囲クエリにおいて効果を発揮します。

以下では、ClickHouseがスパース主インデックスをどのように構築・使用しているかを詳細に示します。記事の後半では、インデックスを構築するために使用されるテーブルカラム（主キーのカラム）を選定、削除、及び順序付けるためのベストプラクティスについて議論します。
### 主キーを持つテーブル {#a-table-with-a-primary-key}

UserIDおよびURLをキーとした複合主キーを持つテーブルを作成します：

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
    DDL文の詳細
    </summary>
    <p>

このガイドの後の議論を簡素化し、図や結果を再現可能にするために、DDL文は以下を指定します：

<ul>
  <li>
    <code>ORDER BY</code>句を通じてテーブルに対する複合ソートキーを指定します。
  </li>
  <li>
    主インデックスのエントリ数を設定を通じて明示的に制御します：
    <ul>
      <li>
        <code>index_granularity</code>：デフォルト値の8192に明示的に設定されます。これは、8192行ごとに主インデックスに１つのインデックスエントリが存在することを意味します。例えば、テーブルが16384行を含むなら、インデックスは2つのインデックスエントリを持ちます。
      </li>
      <li>
        <code>index_granularity_bytes</code>：0に設定して、<a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">適応インデックスグラニュラリティ</a>を無効にします。適応インデックスグラニュラリティとは、ClickHouseが自動的にn行のグループのために１つのインデックスエントリを作成することを意味します。これは以下のいずれかが真である場合です：
        <ul>
          <li>
            <code>n</code>が8192未満で、その<code>n</code>行の結合行データのサイズが10 MB（<code>index_granularity_bytes</code>のデフォルト値）以上である場合。
          </li>
          <li>
            <code>n</code>行の結合データサイズが10 MB未満である場合でも、<code>n</code>が8192である場合。
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>：0に設定して、<a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">主インデックスの圧縮</a>を無効にします。これにより、後でその内容をオプションで調べることができるようになります。
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

上記のDDL文の主キーは、指定された2つのキー列に基づいて主インデックスの作成を引き起こします。

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
そしてテーブルを最適化します：

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br/>
次のクエリを使用してテーブルに関するメタデータを取得できます：

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

レスポンスは：

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

ClickHouseクライアントの出力は以下のことを示しています：

- テーブルのデータは、特定のディレクトリ内の[ワイドフォーマット](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)で保存され、ディレクトリ内に各テーブルカラムごとに1つのデータファイル（および1つのマークファイル）があります。
- テーブルには8.87百万行があります。
- 全行の非圧縮データサイズは733.28 MBです。
- 全行の圧縮サイズは206.94 MBです。
- テーブルには1083のエントリ（「マーク」と呼ばれる）を持つ主インデックスがあり、インデックスのサイズは96.93 KBです。
- 合計で、テーブルのデータ、マークファイル、および主インデックスファイルは207.07 MBを占めます。
### データは主キーのカラムで順序付けられてディスクに保存される {#data-is-stored-on-disk-ordered-by-primary-key-columns}

上記で作成したテーブルは以下の条件を満たしています：
- 複合[主キー](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)`と
- 複合[ソートキー](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`です。

:::note
- もしソートキーのみを指定していた場合、主キーは暗黙的にソートキーと等しいものとして定義されます。

- メモリ効率を向上させるため、クエリでフィルタリングするカラムのみを含む主キーを明示的に指定しました。主キーに基づく主インデックスは完全にメインメモリにロードされます。

- ガイドの図の一貫性を保ち、圧縮比を最大化するために、すべてのテーブルカラムを含む別のソートキーを定義しました（カラム内に類似のデータが近接して配置されると、そのデータはより良く圧縮されます）。

- 主キーは、両方が指定されている場合には、ソートキーのプレフィックスである必要があります。
:::

挿入された行は、主キーのカラム（およびソートキーからの追加カラムである`EventTime`）によって、辞書順（昇順）でディスクに保存されます。

:::note
ClickHouseは、同一の主キーのカラム値を持つ複数の行を挿入することを許可しています。この場合（下の図の行1および行2を参照）、最終的な順序は指定されたソートキーによって決定されるため、`EventTime`列の値に基づいて決まります。
:::

ClickHouseは<a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">列指向データベース管理システム</a>です。以下の図に示すように
- ディスク上の表現においては、各テーブルカラムごとに単一のデータファイル (*.bin) があり、そのカラムのすべての値が<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a>形式で保存され、
- 8.87百万行は主キーのカラム（および追加のソートキーのカラム）によって、辞書順の昇順でディスクに保存されています。つまり、この場合は
  - まず`UserID`によって、
  - 次に`URL`によって、
  - 最後に`EventTime`によって：

<Image img={sparsePrimaryIndexes01} size="md" alt="Sparse Primary Indices 01" background="white"/>

`UserID.bin`、`URL.bin`、および`EventTime.bin`は、`UserID`、`URL`、および`EventTime`カラムの値が保存されるディスク上のデータファイルです。

:::note
- 主キーはディスク上の行の辞書順を決定するため、テーブルには1つの主キーしか持てません。

- 行はClickHouseの内部の行番号付け方式に合わせて0から始まる番号付けをしています。この方式は、ログメッセージにも使用されています。
:::
### データは並行データ処理のためにグラニュールに編成されている {#data-is-organized-into-granules-for-parallel-data-processing}

データ処理の目的で、テーブルのカラム値は論理的にグラニュールに分割されます。
グラニュールはClickHouseにストリーミングされる最小の不可分なデータセットです。
これは、個々の行を読み込むのではなく、ClickHouseが常に行のグループ（グラニュール）全体を（ストリーミング方式で並行して）読み込むことを意味します。
:::note
カラム値はグラニュール内に物理的に保存されているわけではありません。グラニュールはクエリ処理のためのカラム値の論理的な組織です。
:::

以下の図は、テーブルの8.87百万行の（カラム値が）どのように1083のグラニュールに編成されているかを示しています。これは、テーブルのDDL文が設定`index_granularity`（デフォルト値の8192に設定）を含んでいるためです。

<Image img={sparsePrimaryIndexes02} size="md" alt="Sparse Primary Indices 02" background="white"/>

最初（物理ディスク上の順序に基づく）8192行（そのカラム値）は論理的にグラニュール0に属し、次の8192行（そのカラム値）はグラニュール1に属する、そしてそのように続いています。

:::note
- 最後のグラニュール（グラニュール1082）は8192行未満を"含んでいます"。

- このガイドの冒頭で「DDL文の詳細」の中で、[適応インデックスグラニュラリティ](/whats-new/changelog/2019.md/#experimental-features-1)を無効にしたことを示しました（このガイドの議論を簡素化するため、および図や結果を再現できるように）。

  したがって、私たちの例のテーブルのすべてのグラニュール（最後のものを除く）は、同じサイズを持ちます。

- 適応インデックスグラニュラリティを持つテーブルの場合（インデックスグラニュラリティは[デフォルトで](operations/settings/merge-tree-settings#index_granularity_bytes)適応であるため）、いくつかのグラニュールのサイズは行のデータサイズに応じて8192行未満になることがあります。

- 主キーのカラム（`UserID`、`URL`）のいくつかのカラム値にオレンジ色のマークを付けました。
  これらのオレンジ色でマークされたカラム値は、各グラニュールの最初の行の主キーのカラム値です。
  以下で見えるように、これらのオレンジ色でマークされたカラム値がテーブルの主インデックスのエントリになります。

- グラニュールは0から番号付けを始めており、ClickHouseの内部の番号付け方式に合わせています。これもログメッセージに使用されています。
:::
### 主インデックスはグラニュールごとに1つのエントリを持つ {#the-primary-index-has-one-entry-per-granule}

主インデックスは、上記の図に示されたグラニュールに基づいて作成されます。このインデックスは、呼ばれる数値インデックスマークの無圧縮フラット配列ファイル（primary.idx）です。0から始まります。

以下の図は、インデックスがグラニュールごとに各最初の行の主キーのカラム値（上記の図にオレンジ色でマークされた値）を保存していることを示しています。
つまり、主インデックスはテーブルの各8192行目の主キーのカラム値を保存します（物理行の順序は主キーのカラムによって定義されています）。

例えば、
- 最初のインデックスエントリ（以下の図で「マーク0」）は、上記のグラニュール0の最初の行のキーのカラム値を保存しています。
- 2番目のインデックスエントリ（以下の図で「マーク1」）は、上記のグラニュール1の最初の行のキーのカラム値を保存しています。そしてそのように続きます。

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Sparse Primary Indices 03a" background="white"/>

合計で、インデックスは8.87百万行と1083のグラニュールを持つテーブルに対して1083のエントリを持ちます：

<Image img={sparsePrimaryIndexes03b} size="md" alt="Sparse Primary Indices 03b" background="white"/>

:::note
- [適応インデックスグラニュラリティ](/whats-new/changelog/2019.md/#experimental-features-1)を持つテーブルの場合、追加の「最終」マークが主インデックスに保存され、テーブルの最後の行の主キーのカラム値を記録します。しかし、私たちはガイドを簡素化するために適応インデックスグラニュラリティを無効にしたため（このガイドの議論を簡素化するため）、私たちの例のテーブルのインデックスにはこの最終マークは含まれていません。

- 主インデックスファイルは完全にメインメモリにロードされています。ファイルが利用可能な空きメモリよりも大きい場合、ClickHouseはエラーを発生させます。
:::

<details>
    <summary>
    主インデックスの内容を調査する
    </summary>
    <p>

セルフマネージドのClickHouseクラスターでは、<a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">ファイルテーブル関数</a>を使用して、サンプルテーブルの主インデックスの内容を調べることができます。

そのためには、まず主インデックスファイルを稼働中のクラスターのノードの<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a>にコピーする必要があります：
<ul>
<li>ステップ1：主インデックスファイルを含むパートのパスを取得</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

は、テストマシン上で`/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`を返します。

<li>ステップ2：user_files_pathを取得</li>
デフォルトの<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">user_files_path</a>はLinuxでは
`/var/lib/clickhouse/user_files/`

であり、変更があったか確認するにはLinuxで次のコマンドを実行します：`$ grep user_files_path /etc/clickhouse-server/config.xml`

テストマシンでは、パスは`/Users/tomschreiber/Clickhouse/user_files/`です。

<li>ステップ3：主インデックスファイルをuser_files_pathにコピーします</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

</ul>

<br/>
次に、SQL経由で主インデックスの内容を調査できます：
<ul>
<li>エントリの数を取得</li>
`
SELECT count( )<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String');
`
は`1083`を返します。

<li>最初の2つのインデックスマークを取得</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 0, 2;
`

は

`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`

を返します。

<li>最後のインデックスマークを取得</li>
`
SELECT UserID, URL FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
は
`
4292714039 │ http://sosyal-mansetleri...
`
を返します。
</ul>
<br/>
これは私たちの例のテーブルの主インデックス内容の図と完全に一致します：

</p>
</details>

主キーのエントリはインデックスマークと呼ばれます。なぜなら各インデックスエントリは特定のデータ範囲の開始を示しているからです。特にこの例のテーブルについて：
- UserIDインデックスマーク：

  主インデックスに保存された`UserID`値は昇順にソートされています。<br/>
  上の図の「マーク1」は、グラニュール1内のすべてのテーブル行の`UserID`値、および以降のすべてのグラニュールの値が4,073,710以上であることを保証します。

 [後で見るように](#the-primary-index-is-used-for-selecting-granules)、このグローバルな順序により、ClickHouseはクエリが主キーの最初のカラムのフィルタリングを行う場合、インデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索アルゴリズム</a>を使用できます。

- URLインデックスマーク：

  主キーのカラムである`UserID`および`URL`のカーディナリティが非常に似ているため、主キーの最初のカラム以降のすべてのキーのインデックスマークは、一般的に、前のキーのカラム値が現在のグラニュール内のすべてテーブルの行について同じである限り、データ範囲を示しています。<br/>
  例えば、上の図のマーク0とマーク1の`UserID`値が異なるため、ClickHouseはグラニュール0内のすべてのテーブル行の`URL`値が`'http://showtopics.html%3...'`以上であると仮定することはできません。しかし、上述の図でマーク0とマーク1の`UserID`値が同じであった場合（それはグラニュール0内のすべてのテーブル行の`UserID`値が同じことを意味します）、ClickHouseはすべてのテーブル行の`URL`値が`'http://showtopics.html%3...'`以上であると仮定できました。

  このクエリ実行性能への影響について、後でさらに詳しく議論します。
### 主インデックスはグラニュールを選択するために使用される {#the-primary-index-is-used-for-selecting-granules}

これで、主インデックスのサポートを受けてクエリを実行することができます。

以下は、UserID 749927693のために最もクリックされた上位10のURLを計算します。

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは：

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

ClickHouseクライアントの出力は、フルテーブルスキャンを行うのではなく、わずか8.19千行がClickHouseにストリーミングされたことを示しています。

もし<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">トレースログ</a>が有効になっている場合、ClickHouseのサーバーログファイルは、ClickHouseが`749927693`という値を持つ`UserID`の列を含む行を特定するために、1083のUserIDインデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索</a>を実行したことを示しています。これは平均して19ステップを要し、計算量が`O(log2 n)`となります：
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

上記のトレースログで、1083の既存のマークのうち1つがクエリを満たしていたのが分かります。

<details>
    <summary>
    トレースログの詳細
    </summary>
    <p>

マーク176が特定されました（'見つかった左境界マーク'は包括的で、'見つかった右境界マーク'は排他的です）、したがって、グラニュール176のすべての8192行（行1,441,792から始まる - これは後でこのガイドで確認します）がClickHouseにストリーミングされ、最終的に`UserID`列の値が`749927693`である行を特定することになります。
</p>
</details>

このことは、私たちの例のクエリで<a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN句</a>を使って再現することもできます。
```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは以下のようになります：

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
クライアント出力は、1083のグラニュールのうち1つが`749927693`という`UserID`の値を持つ行を含む可能性があるとして選択されたことを示しています。

:::note 結論
クエリが複合キーの一部であり、最初のキーのカラムに対してフィルタリングする場合、ClickHouseはそのキーのカラムのインデックスマークに対して二分探索アルゴリズムを実行します。
:::

<br/>

上記で議論したように、ClickHouseはスパース主インデックスを使用して、クエリと一致する行を含む可能性のあるグラニュールを迅速に（バイナリサーチを介して）選択します。

これはClickHouseのクエリ実行の**第一段階（グラニュール選択）**です。

**第二段階（データ読み込み）**では、ClickHouseは選択されたグラニュールを特定し、すべての行をClickHouseエンジンにストリーミングして、実際にクエリに一致する行を見つけ出します。

この第二段階については、次のセクションでさらに詳しく議論します。
### Mark files are used for locating granules {#mark-files-are-used-for-locating-granules}

次の図は、私たちのテーブルの主インデックスファイルの一部を示しています。

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white"/>

上記で説明したように、インデックスの1083 UserID マークのバイナリ検索により、マーク176が特定されました。したがって、対応するグラニュール176には、UserID カラムの値749.927.693を持つ行が含まれている可能性があります。

<details>
    <summary>
    グラニュール選択の詳細
    </summary>
    <p>

上の図は、マーク176が、関連付けられたグラニュール176の最小UserID値が749.927.693より小さく、次のマーク（マーク177）のグラニュール177の最小UserID値がこの値より大きい最初のインデックスエントリであることを示しています。したがって、マーク176に対応するグラニュール176のみが、UserIDカラムの値749.927.693を持つ行を含む可能性があります。
</p>
</details>

グラニュール176のいくつかの行がUserIDカラムの値749.927.693を含むかどうかを確認するために、すべての8192行をClickHouseにストリーミングする必要があります。

これを達成するために、ClickHouseはグラニュール176の物理的な位置を知る必要があります。

ClickHouseでは、私たちのテーブルのすべてのグラニュールの物理的な位置がマークファイルに保存されています。データファイルと同様に、テーブルカラムごとに1つのマークファイルがあります。

次の図は、テーブルの `UserID`、`URL`、および `EventTime` カラムのグラニュールの物理的な位置を保存している3つのマークファイル `UserID.mrk`、`URL.mrk`、`EventTime.mrk` を示しています。

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white"/>

主インデックスが、0から始まる番号の付けられたインデックスマークを含むフラットな未圧縮の配列ファイル（primary.idx）であることについては既に説明しました。

同様に、マークファイルも0から始まる番号の付けられたマークを含むフラットな未圧縮の配列ファイル（*.mrk）です。

ClickHouseがクエリに対して一致する行を含む可能性のあるグラニュールのインデックスマークを特定して選択した後、マークファイル内の位置配列のルックアップを実行して、グラニュールの物理的な位置を取得できます。

特定のカラムの各マークファイルエントリは、以下の形式の2つの位置を格納しています：

- 最初のオフセット（上の図の「block_offset」）は、選択されたグラニュールの圧縮版を含むデータファイル内の <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">ブロック</a> を特定しています。この圧縮ブロックは、いくつかの圧縮グラニュールを含む可能性があります。特定された圧縮ファイルブロックは、読み取り時に主メモリに展開されます。

- Mark-fileからの2番目のオフセット（上の図の「granule_offset」）は、非圧縮ブロックデータ内のグラニュールの位置を提供します。

特定された非圧縮グラニュールに属するすべての8192行は、さらに処理するためにClickHouseにストリーミングされます。

:::note

- [ワイドフォーマット](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)のテーブルと、[適応型インデックスの粒度](/whats-new/changelog/2019.md/#experimental-features-1)がないテーブルの場合、ClickHouseは、上記のように、各エントリについて2つの8バイト長のアドレスを含むエントリを持つ `.mrk` マークファイルを使用します。これらのエントリは、すべて同じサイズのグラニュールの物理的な位置です。

インデックスの粒度は[デフォルトで適応的](/operations/settings/merge-tree-settings#index_granularity_bytes)ですが、私たちの例のテーブルでは適応型インデックス粒度を無効にしているため（このガイドのディスカッションを簡素化し、図や結果を再現可能にするため）、テーブルはワイドフォーマットを使用しています。データサイズが [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) より大きいため（デフォルトでセルフマネージドクラスター向けに10MB）。

- ワイドフォーマットのテーブルと適応型インデックス粒度を持つテーブルの場合、ClickHouseは、現在のエントリに関連付けられたグラニュールの行数の追加の3番目の値を持つ `.mrk2` マークファイルを使用します。

- [コンパクトフォーマット](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)のテーブルの場合、ClickHouseは `.mrk3` マークファイルを使用します。

:::

:::note マークファイルの理由

なぜ主インデックスはインデックスマークに対応するグラニュールの物理的な位置を直接含まないのですか？

ClickHouseが設計されているその非常に大規模な規模において、ディスクとメモリの効率を非常に高く保つことが重要だからです。

主インデックスファイルは主メモリに収まる必要があります。

私たちのサンプルクエリのために、ClickHouseは主インデックスを使用し、特定の行を含む可能性のある単一のグラニュールを選択しました。ClickHouseは、対応する行をさらに処理するためにストリーミングするために、その一つのグラニュールの物理的な位置を必要とします。

さらに、このオフセット情報はUserIDとURLカラムにのみ必要です。

クエリで使用されないカラム（例：`EventTime`）にはオフセット情報は必要ありません。

私たちのサンプルクエリでは、ClickHouseは、UserID データファイル (UserID.bin) 内のグラニュール176の物理的な位置オフセット2つと、URL データファイル (URL.bin) 内のグラニュール176の物理的な位置オフセット2つのみを必要とします。

マークファイルによって提供される間接性は、主インデックス内にインデックスマークに対してすべての1083グラニュールの物理的な位置を直接保存することを避けることができます。したがって、主メモリに不要（おそらく未使用の）データを持つことを回避できます。
:::

次の図と、以下のテキストは、私たちの例のクエリに対してClickHouseがUserID.binデータファイル内のグラニュール176をどのように特定するかを示しています。

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

このガイドで以前に説明したように、ClickHouseは主インデックスマーク176を選択し、したがってグラニュール176を、私たちのクエリに一致する行を含む可能性があるものとして選択しました。

ClickHouseは、グラニュール176を特定するために、当該マーク番号（176）を使ってUserID.mrkマークファイル内で位置配列のルックアップを行い、グラニュール176を特定するための2つのオフセットを取得します。

示されたように、最初のオフセットは、圧縮されたファイルブロック内のUserID.binデータファイルを特定し、これがグラニュール176の圧縮版を含みます。

特定されたファイルブロックが主メモリに解凍されると、マークファイルからの2番目のオフセットを使用して、非圧縮データ内のグラニュール176を特定できます。

ClickHouseは、UserID.binデータファイルとURL.binデータファイルの両方からグラニュール176をアップロード（ストリーミング）し、私たちの例のクエリ（UserIDが749.927.693のインターネットユーザーに対するトップ10のクリックされたURL）を実行する必要があります。

上の図は、ClickHouseがUserID.binデータファイルのためにグラニュールを特定する方法を示しています。

並行して、ClickHouseはURL.binデータファイルのグラニュール176についても同じ処理を行います。2つのグラニュールがそれぞれ整列され、ClickHouseエンジンにストリーミングされ、最終的にUserIDが749.927.693のすべての行のURLの値を集約およびカウントした後、カウント順で最大の10のURLグループを出力します。
## Using multiple primary indexes {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### Secondary key columns can (not) be inefficient {#secondary-key-columns-can-not-be-inefficient}

クエリが複合キーの一部であり最初のキー列である列にフィルタリングされている場合、[この場合、ClickHouseはキー列のインデックスマークに対してバイナリ検索アルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

しかし、クエリが、複合キーの一部である列にフィルタリングされている場合、最初のキー列でない場合はどうなりますか？

:::note
クエリが最初のキー列でフィルタリングしていないが、セカンダリキー列でフィルタリングしているシナリオを説明します。

クエリが最初のキー列と、最初の後の任意のキー列でフィルタリングされている場合、ClickHouseは最初のキー列のインデックスマークに対してバイナリ検索を実行します。
:::

<br/>
<br/>

<a name="query-on-url"></a>
私たちは、URL "http://public_search"を最も頻繁にクリックしたトップ10ユーザーを計算するクエリを使用します：

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

応答は次のとおりです： <a name="query-on-url-slow"></a>
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

クライアント出力は、ClickHouseが[複合主キーの一部であるにもかかわらず、テーブル全体のスキャンを実行した](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)ことを示しています！ ClickHouseは、テーブルの887万行から881万行を読み取ります。

[trace_logging](/operations/server-configuration-parameters/settings#logger)が有効になっている場合、ClickHouseサーバーログファイルは、ClickHouseが、URLカラムの値が"http://public_search"を含む行が含まれる可能性のあるグラニュールを特定するために1083のURLインデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">一般的な除外検索</a>を使用したことを示しています：
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
サンプルトレースログでは、1076（マーク経由で）1083のグラニュールが選択されたことがわかります。

これにより、実際にURL値"http://public_search"を含む行を特定するために、ClickHouseエンジンに埋め込まれた881万行がストリーミングされ（10のストリームを使用して並行処理）、実際に行を特定します。

ただし、後で見るように、選択された1076グラニュールのうち、実際に一致する行を含むのは39グラニュールのみです。

ユーザーIDの特定の値で行をフィルタリングするための非常に役立つ複合主キーに基づいた主インデックスが、特定のURL値で行をフィルタリングするクエリの速度を向上させる上ではそれほど効果的ではありません。

その理由は、URLカラムが最初のキー列でないため、ClickHouseがURLカラムのインデックスマークに対して一般的な除外検索アルゴリズム（バイナリ検索の代わりに）を使用しているためです。そして、**このアルゴリズムの効果は、URLカラムとその前のキー列UserIDとの間の基数の違いに依存します。**

これを示すために、一般的な除外検索がどのように機能するかについての詳細を示します。

<a name="generic-exclusion-search-algorithm"></a>
### Generic exclusion search algorithm {#generic-exclusion-search-algorithm}

以下は、<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >ClickHouseの一般的な除外検索アルゴリズム</a>が、前のキー列が低（低い）または高（高い）基数のときに、セカンダリカラムを介してグラニュールが選択されるときにどのように機能するかを示しています。

両方のケースの例として、次のことを仮定します：
- URL値 = "W3"を持つ行を検索するクエリ。
- UserIDとURLの簡略化された値を持つ抽象的なヒットテーブルのバージョン。
- インデックスのために同じ複合主キー（UserID、URL）。これは、行がまずUserID値で順序付けられ、同じUserID値を持つ行が次にURLで順序付けられることを意味します。
- グラニュールサイズは2、つまり各グラニュールに2行が含まれます。

以下の図では、各グラニュールの最初のテーブル行のキー列の値をオレンジ色でマークしています。

**前のキー列の基数が低い（低い）**<a name="generic-exclusion-search-fast"></a>

UserIDが低い基数を持っていると仮定すると、この場合、同じUserID値が複数のテーブル行およびグラニュール、したがってインデックスマークに分散している可能性が高いです。同じUserIDを持つインデックスマークに対して、インデックスマークのURL値は昇順にソートされています（テーブル行がまずUserIDで順序付けられ、その後URLで順序付けられます）。これは、以下に示すように効率的なフィルタリングを可能にします：

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

上の図の抽象的なサンプルデータについてのグラニュール選択プロセスには3つの異なるシナリオがあります：

1. インデックスマーク0、**URL値がW3より小さく、直接続くインデックスマークのURL値もW3より小さい**場合、マーク0および1は同じUserID値を持っているため除外できます。この除外の前提により、グラニュール0は完全にU1のUserID値で構成されていると仮定され、したがってClickHouseはグラニュール0の最大URL値もW3より小さいと仮定し、グラニュールを除外できます。

2. インデックスマーク1、**URL値がW3以下で、直接続くインデックスマークのURL値がW3以上の場合** 選択されます。これは、グラニュール1がURL W3を含む行を持つ可能性があることを意味します。

3. インデックスマーク2および3に対して、**URL値がW3より大きい**ため、除外できます。これは、主インデックスのインデックスマークが各グラニュールの最初のテーブル行のキー列の値を保存し、テーブル行がディスク上でキー列の値でソートされているため、グラニュール2および3はURL値W3を含むことはできません。

**前のキー列の基数が高い（高い）**<a name="generic-exclusion-search-slow"></a>

UserIDが高い基数を持っているとき、同じUserID値が複数のテーブル行およびグラニュールに分散している可能性は低いです。これは、インデックスマークのURL値が単調増加ではないことを意味します：

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

上の図で示されているように、URL値がW3より小さいすべてのマークが、関連するグラニュールの行をClickHouseエンジンにストリーミングするために選択されています。

これは、上の図のすべてのインデックスマークが上で述べたシナリオ1に該当するものの、*直接続くインデックスマークが現在のマークと同じUserID値を持つ*という除外の前提を満たさないために除外できないからです。

たとえば、インデックスマーク0は、**URL値がW3より小さく、直接続くインデックスマークのURL値もW3より小さい**場合です。これは除外できません。なぜなら、直接続くインデックスマーク1は*現在のマーク0*と同じUserID値を持っていないからです。

最終的に、これによりClickHouseはグラニュール0の最大URL値についての仮定を作ることができなくなります。代わりに、グラニュール0がURL値W3を含む行を持つ可能性があると仮定し、マーク0を選択することを余儀なくされます。

マーク1、2、3についても同様のシナリオが当てはまります。

:::note 結論
ClickHouseが複合キーの一部である列でフィルタリングされるが、最初のキー列でない場合に使用する<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">一般的な除外検索アルゴリズム</a>は、前のキー列の基数が低いときに最も効果的です。
:::

サンプルデータセットでは、両方のキー列（UserID、URL）は類似の高い基数を持っており、説明したように、URL列の前のキー列の基数が高く（または類似している）場合、一般的な除外検索アルゴリズムはあまり効果的ではありません。
### Note about data skipping index {#note-about-data-skipping-index}

UserIDとURLの基数が同様に高いため、私たちの[URLでフィルタリングするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)は、私たちの[複合主キー (UserID、URL)](#a-table-with-a-primary-key)のURL列に対する[セカンダリデータスキッピングインデックス](./skipping-indexes.md)を作成してもあまり利益を得ることはできません。

たとえば、これらの2つの文は、私たちのテーブルのURLカラムに対して[minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries)データスキッピングインデックスを作成し、埋め込むものです：
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouseは、私たちのテーブルの最初の4つの[グラニュール](#data-is-organized-into-granules-for-parallel-data-processing)の各グループに対し、最小および最大URL値を保存する追加のインデックスを作成しました（上記の`ALTER TABLE`文の`GRANULARITY 4`句に注意）：

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white"/>

最初のインデックスエントリ（上の図の「mark 0」）は、私たちのテーブルの最初の4つのグラニュールに属する[行の最小および最大URL値を保存しています](#data-is-organized-into-granules-for-parallel-data-processing)。

2番目のインデックスエントリ（「mark 1」）は、私たちのテーブルの次の4つのグラニュールに属する行の最小および最大URL値を保存しています。

（ClickHouseは、インデックスマークに関連付けられたグラニュールのグループを[特定するための](#mark-files-are-used-for-locating-granules)データスキッピングインデックス用の特別な[マークファイル](#mark-files-are-used-for-locating-granules)も作成しました。）

UserIDとURLの基数が同様に高いため、このセカンダリデータスキッピングインデックスは、私たちの[URLでフィルタリングするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)が実行されるときにグラニュールの除外に役立つことはありません。

クエリが探している特定のURL値（つまり、'http://public_search'）は、非常に高い確率で各グラニュールグループのインデックスによって保存された最小および最大値の間にあるため、ClickHouseはそのグラニュールグループを選択することを余儀なくされます（なぜなら、それらはクエリに一致する行が含まれる可能性があるからです）。
### A need to use multiple primary indexes {#a-need-to-use-multiple-primary-indexes}

その結果、特定のURLで行をフィルタリングするサンプルクエリの速度を大幅に向上させたい場合は、そのクエリに最適化された主インデックスを使用する必要があります。

さらに、特定のUserIDで行をフィルタリングするサンプルクエリの良好なパフォーマンスを維持したい場合は、複数の主インデックスを使用する必要があります。

次に、これを達成するための方法を示します。

<a name="multiple-primary-indexes"></a>
### Options for creating additional primary indexes {#options-for-creating-additional-primary-indexes}

特定のUserIDで行をフィルタリングし、特定のURLで行をフィルタリングする両方のサンプルクエリを大幅に高速化したい場合は、次の3つのオプションのいずれかを使用して複数の主インデックスを使用する必要があります：

- 異なる主キーで**2番目のテーブル**を作成する。
- 既存のテーブルに**マテリアライズドビュー**を作成する。
- 既存のテーブルに**プロジェクション**を追加する。

この3つのオプションはすべて、サンプルデータを効果的に別のテーブルに複製し、テーブル主インデックスと行のソート順を再整理します。

しかし、3つのオプションは、クエリや挿入ステートメントのルーティングに関して、追加のテーブルがユーザーにどれだけ透過的かにおいて異なります。

**異なる主キーで2番目のテーブルを作成する**場合、クエリはクエリに最も適したテーブルバージョンに明示的に送信され、テーブルを同期させるためには新しいデータを両方のテーブルに明示的に挿入する必要があります：

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

**マテリアライズドビュー**の場合、追加のテーブルが暗黙的に作成され、データは両方のテーブル間で自動的に同期されます：

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

そして**プロジェクション**は、暗黙的に作成された（非表示の）追加テーブルをデータ変更と自動的に同期させるだけでなく、ClickHouseがクエリに最も効果的なテーブルバージョンを自動的に選択するため、最も透過的なオプションです：

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

以下で、複数の主インデックスを作成して使用するためのこの3つのオプションについて、詳細にリアルな例を交えて説明します。

<a name="multiple-primary-indexes-via-secondary-tables"></a>
### Option 1: Secondary Tables {#option-1-secondary-tables}

<a name="secondary-table"></a>
主キーのキー列の順序を（元のテーブルと比較して）入れ替えた新しい追加テーブルを作成します：

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

元のテーブルから887万行すべてを追加のテーブルに挿入します：

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
```

応答は次のようになります：

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

そして最後にテーブルを最適化します：
```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

主キー内の列の順序を入れ替えたため、挿入された行は、（元のテーブルと比較して）ディスク上で異なる辞書順で保存され、したがってそのテーブルの1083グラニュールも異なる値を含みます：

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white"/>

これが結果の主キーです：

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white"/>

これにより、URLカラムでフィルタリングされる私たちの例のクエリの実行を大幅に高速化するために使用できます。http://public_search"に最も頻繁にクリックしたトップ10ユーザーを計算する：
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

応答は次のとおりです：
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

今や、[ほぼテーブル全体のスキャンを実行する](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns)のではなく、ClickHouseはこのクエリを非常に効果的に実行しました。

UserIDが最初でURLが2番目の主インデックスがある[元のテーブル](#a-table-with-a-primary-key)では、ClickHouseは[一般的な除外検索](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)をインデックスマークに使用してこのクエリを実行し、それは効果的ではありませんでした。なぜなら、UserIDとURLの基数が類似しているからです。

URLが主インデックスの最初のカラムの場合、ClickHouseは現在、インデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">バイナリ検索</a>を実行しています。

ClickHouseサーバーログファイルの対応するトレースログは以下の通りです：
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
ClickHouseは1076でなく、39のインデックスマークを選択しました。

追加テーブルは、URLでフィルタリングする私たちの例のクエリの実行を加速するように最適化されています。

私たちの[元のテーブル](#a-table-with-a-primary-key)の[悪いパフォーマンス](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)と同様に、この追加テーブルでは[UserIDsでフィルタリングする私たちの例のクエリ](#the-primary-index-is-used-for-selecting-granules)は非常に効果的に実行されません。なぜなら、UserIDがそのテーブルの主インデックスの2番目のキー列になるため、ClickHouseはグラニュール選択に一般的な除外検索を使用するからです。これは、[UserIDとURLの基数が類似しているとあまり効果的ではない](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)のです。
詳細を開いて具体的に見てみましょう。

<details>
    <summary>
    UserIDsでフィルタリングするクエリのパフォーマンスが悪化<a name="query-on-userid-slow"></a>
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

10 rows in set. Elapsed: 0.024 sec.

# highlight-next-line
Processed 8.02 million rows,
73.04 MB (340.26 million rows/s., 3.10 GB/s.)
```

サーバーログ：
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

今や私たちには二つのテーブルがあります。`UserIDs`でフィルタリングするクエリの速度を向上させるように最適化されたテーブルと、URLでフィルタリングするクエリの速度を向上させるように最適化されたテーブルです。
### Option 2: Materialized Views {#option-2-materialized-views}

既存のテーブルに対して[マテリアライズドビュー](/sql-reference/statements/create/view.md)を作成します。
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
- 主キーのキー列の順序を（元のテーブルと比較して）入れ替えています。
- マテリアライズドビューは、指定された主キー定義に基づいた**暗黙的に作成されたテーブル**によってバックアップされます。その行の順序と主インデックスも同様です。
- 暗黙的に作成されたテーブルは、`SHOW TABLES`クエリによってリストされ、`.inner`で始まる名前を持っています。
- マテリアライズドビューのために、最初にバックアップテーブルを明示的に作成し、その後ビューが`TO [db].[table]` [句](/sql-reference/statements/create/view.md)を使用してそのテーブルをターゲットにすることも可能です。
- `POPULATE`キーワードを使用して、元のテーブル[hits_UserID_URL](#a-table-with-a-primary-key)から暗黙的に作成されたテーブルに887万行すべてを直ちに挿入します。
- 元のテーブルhits_UserID_URLに新しい行が挿入されると、それらの行も自動的に暗黙的に作成されたテーブルに挿入されます。
- 実質的に、暗黙的に作成されたテーブルは、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と同じ行の順序と主インデックスを持ちます：

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white"/>

ClickHouseは、暗黙的に作成されたテーブルの[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules) (*.mrk2)、および[主インデックス](#the-primary-index-has-one-entry-per-granule) (primary.idx)をClickHouseサーバーのデータディレクトリ内の特別なフォルダーに保存しています。

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white"/>

:::

暗黙的に作成されたテーブル（およびその主インデックス）が私たちのURLカラムでフィルタリングする例のクエリの実行を大幅に高速化するために使用できます：
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

応答は次のとおりです：

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

実質的に、暗黙的に作成されたテーブル（およびその主インデックス）が私たちの[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と同じであるため、このクエリは明示的に作成されたテーブルと同じ効果的な方法で実行されます。

ClickHouseサーバーログファイルの対応するトレースログは、ClickHouseがインデックスマークに対してバイナリ検索を実行していることを確認しています：

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
### Option 3: Projections {#option-3-projections}

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
- このプロジェクションは、指定された`ORDER BY`句に基づいた**隠れたテーブル**を作成します。
- 隠れたテーブルは`SHOW TABLES`クエリによってリストされません。
- 私たちは`MATERIALIZE`キーワードを使用して、元のテーブル[hits_UserID_URL](#a-table-with-a-primary-key)から隠れたテーブルに887万行すべてを直ちに挿入します。
- 元のテーブルhits_UserID_URLに新しい行が挿入されると、それらの行も自動的に隠れたテーブルに挿入されます。
- クエリは常に（構文的に）元のテーブルhits_UserID_URLをターゲットにしていますが、隠れたテーブルの行の順序と主インデックスがクエリ実行をより効果的にする場合、その隠れたテーブルが代わりに使用されます。
- プロジェクションは、ORDER BYがプロジェクションのORDER BY宣言と一致しても、ORDER BYを使用するクエリをより効率的にするものではありません（https://github.com/ClickHouse/ClickHouse/issues/47333を参照）。
- 実質的に、暗黙的に作成された隠れたテーブルは、[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と同じ行の順序と主インデックスを持ちます：

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white"/>

ClickHouseは、隠れたテーブルの[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules) (*.mrk2)、および[主インデックス](#the-primary-index-has-one-entry-per-granule) (primary.idx)を、元のテーブルのデータファイル、マークファイル、および主インデックスファイルの隣にある特別フォルダーに保存しています：

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white"/>

:::

プロジェクションによって生成された隠れたテーブル（およびその主インデックス）は、私たちのURLカラムでフィルタリングする例のクエリの実行を大幅に迅速化するために（暗黙的に）使用できます。クエリは、プロジェクションのソーステーブルを構文的にターゲットにしています。
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

応答は次のとおりです：

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

実質的に、プロジェクションによって生成された隠れたテーブル（およびその主インデックス）は、私たちの[明示的に作成したセカンダリテーブル](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)と同じであり、クエリは明示的に作成されたテーブルと同じ効果的な方法で実行されます。

ClickHouseサーバーログファイルの対応するトレースログは、ClickHouseがインデックスマークに対してバイナリ検索を実行していることを確認しています：

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
### 概要 {#summary}

私たちの[複合主キー (UserID, URL) を持つテーブル](#a-table-with-a-primary-key)の主インデックスは、[UserID に基づいてフィルタリングするクエリ](#the-primary-index-is-used-for-selecting-granules)を高速化するのに非常に役立ちました。しかし、そのインデックスは、URL カラムが複合主キーの一部であるにもかかわらず、[URL に基づいてフィルタリングするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)の高速化にはあまり効果がありません。

逆もまた真です：
私たちの[複合主キー (URL, UserID)](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)を持つテーブルの主インデックスは、[URL に基づいてフィルタリングするクエリ](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)を高速化しましたが、[UserID に基づいてフィルタリングするクエリ](#the-primary-index-is-used-for-selecting-granules)にはあまりサポートを提供しませんでした。

主キーのカラム UserID と URL の高いカーディナリティの類似性のため、2 番目のキー カラムでフィルタリングするクエリは、[インデックスに 2 番目のキー カラムがあることからあまり利益を得られない](#generic-exclusion-search-algorithm)のです。

したがって、主インデックスから 2 番目のキー カラムを削除し（インデックスのメモリ使用量を減らす結果）、代わりに[複数の主インデックスを使用する]( /guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes)ことが理にかなっています。

ただし、複合主キーのキー カラム間に大きなカーディナリティの違いがある場合、[クエリにとっては有益](#guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)なため、主キーのカラムをカーディナリティが昇順になるように順序付けることが重要です。

カーディナリティの違いが大きくなるほど、キー内のそれらのカラムの順序が重要になります。次のセクションでそれを示します。

## キーカラムを効率的に並べる {#ordering-key-columns-efficiently}

<a name="test"></a>

複合主キーでは、キー カラムの順序が次の両方に大きく影響します：
- クエリ内のセカンダリーキー カラムのフィルタリングの効率、および
- テーブルのデータファイルの圧縮率。

これを示すために、各行がインターネットの「ユーザー」 (`UserID` カラム) による URL (`URL` カラム) へのアクセスがボットトラフィック (`IsRobot` カラム)としてマークされたかどうかを示す三つのカラムを含む、私たちの[ウェブトラフィックサンプルデータセット](#data-set)のバージョンを使用します。

通常のウェブ分析クエリを高速化するために使用できるすべての3つの上述のカラムからなる複合主キーを使用して計算します：
- 特定の URL に対するトラフィックのうち、どれだけの割合がボットが占めるか、または
- 特定のユーザーがボットである可能性がどれほど高いか（そのユーザーからのトラフィックの何パーセントがボットトラフィックではないと見なされているか）

私たちはこのクエリを実行して、複合主キーとして使用したい3つのカラムのカーディナリティを計算します（注意：TSVデータをローカルテーブルを作成せずにその場でクエリするために、[URL テーブル関数](/sql-reference/table-functions/url.md)を使用しています）。このクエリを `clickhouse client` で実行します：
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
応答は以下の通りです：
```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

カーディナリティ、特に `URL` と `IsRobot` カラム間の間に大きな違いがあることが分かります。そして、したがって、複合主キー内のこれらのカラムの順序は、フィルタリングするクエリの効率の向上と、そのテーブルのカラムデータファイルの最適な圧縮率を達成するために重要になります。

これを示すために、ボットトラフィック分析データのために2つのテーブル バージョンを作成します：
- `(URL, UserID, IsRobot)`という複合主キーを持つテーブル `hits_URL_UserID_IsRobot` では、カーディナリティに従ってキー カラムを降順に並べます。
- `(IsRobot, UserID, URL)`という複合主キーを持つテーブル `hits_IsRobot_UserID_URL` では、キー カラムを昇順に並べます。

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

そして 887 万行でそれを埋めます：
```sql
INSERT INTO hits_URL_UserID_IsRobot SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
これは応答です：
```response
0 rows in set. Elapsed: 104.729 sec. Processed 8.87 million rows, 15.88 GB (84.73 thousand rows/s., 151.64 MB/s.)
```

次に、複合主キー `(IsRobot, UserID, URL)` を持つテーブル `hits_IsRobot_UserID_URL` を作成します：
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
前のテーブルに使用したのと同じ 887 万行でそれを埋めます：

```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
応答は以下の通りです：
```response
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```

### セカンダリーキー カラムの効率的なフィルタリング {#efficient-filtering-on-secondary-key-columns}

クエリが複合キーの一部であり、最初のキー カラムである少なくとも1つのカラムでフィルタリングしている場合、[ClickHouse はキー カラムのインデックスマークに対してバイナリ検索アルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

クエリが複合キーの一部であるカラムで（のみ）フィルタリングしているが、最初のキー カラムではない場合、[ClickHouse はキー カラムのインデックスマークに対して一般的な除外探索アルゴリズムを使用しています](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)。

2 番目のケースでは、複合主キー内のキー カラムの順序が[一般的な除外探索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)の有効性にとって重要です。

これは、カラムの順序が `(URL, UserID, IsRobot)` でカーディナリティが降順に並べられたテーブルの `UserID` カラムでフィルタリングするクエリです：
```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```
応答は以下の通りです：
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.026 sec.

# highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

これは、カラムの順序が `(IsRobot, UserID, URL)` でカーディナリティが昇順に並べられたテーブルに対する同じクエリです：
```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```
応答は以下の通りです：
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.

# highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

カーディナリティが昇順に並べられたテーブルで、クエリの実行が著しく効果的かつ迅速であることが分かります。

その理由は、[一般的な除外探索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)は、[グラニュール](#the-primary-index-is-used-for-selecting-granules)が、先行するキー カラムが低いカーディナリティであるセカンダリーキー カラムを介して選択されるときに最も効果的に機能するからです。このガイドの[前のセクション](#generic-exclusion-search-algorithm)で詳細に説明しました。

### データファイルの最適な圧縮率 {#optimal-compression-ratio-of-data-files}

このクエリは、上記で作成した二つのテーブルの `UserID` カラムの圧縮率を比較します：

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
応答は以下の通りです：
```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```

`UserID` カラムの圧縮率は、カラムのキー カラムを昇順で並べたテーブルに対して著しく高いことが分かります。

両方のテーブルには正確に同じデータが格納されているにもかかわらず（両方のテーブルに887万行を挿入しました）、複合主キー内のキー カラムの順序が、テーブルの[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns)の圧縮されたデータが必要とするディスクスペースに重要な影響を与えます：
- 複合主キー `(URL, UserID, IsRobot)`を持つテーブル `hits_URL_UserID_IsRobot` では、カーディナリティに従ってキー カラムを降順に並べた、その `UserID.bin` データファイルは**11.24 MiB**のディスクスペースを必要とします。
- 複合主キー `(IsRobot, UserID, URL)`を持つテーブル `hits_IsRobot_UserID_URL` では、カーディナリティに従って低順にキー カラムを並べ、その `UserID.bin` データファイルはわずか**877.47 KiB**のディスクスペースを必要とします。

テーブルのカラムのデータの良い圧縮率は、ディスク上のスペースを節約するだけでなく（特に解析用のクエリは）、データをディスクからメインメモリ（オペレーティングシステムのファイルキャッシュ）に移動するために必要な I/O を減らすので、特にそのカラムからのデータの読み込みが速くなります。

次に、最適な圧縮率を達成するために、テーブルのカラムの圧縮率がカーディナリティに従ってキー カラムを昇順に並べることが有益である理由を示します。

下の図は、キー カラムがカーディナリティに従って昇順に並べられた場合の主キーのオンディスク順を示しています：

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white"/>

私たちは[テーブルの行データは主キーのカラムに従ってディスクに保存されている](#data-is-stored-on-disk-ordered-by-primary-key-columns)ことを説明しました。

上記の図では、テーブルの行（ディスク上のカラム値）は最初にその `cl` 値で順序付けされ、同じ `cl` 値を持つ行はその `ch` 値で順序付けされます。そして、最初のキー カラム `cl` のカーディナリティが低いため、同じ `cl` 値を持つ行が存在する可能性が高くなります。そのため、`ch` 値が（同じ `cl` 値の行に対して）ローカルに順序付けられている可能性があります。

もし、あるカラムに似たデータが近くに配置されている場合、たとえばソートによって、データはより良く圧縮されます。
一般的に、圧縮アルゴリズムはデータのラン長（見えるデータが多いほど圧縮に有利）と局所性（データが似ているほど圧縮率が良くなる）から恩恵を受けます。

上の図とは対照的に、下の図は、デカーディナリティに従って並べられた主キーのオンディスク順を示しています：

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white"/>

現在、テーブルの行は最初にその `ch` 値で順序付けされ、同じ `ch` 値を持つ行はその `cl` 値で順序付けされます。
しかし、最初のキー カラム `ch` は高いカーディナリティを持つため、同じ `ch` 値を持つ行が存在する可能性は低いです。そのため、仮に `cl` 値が（同じ `ch` 値を持つ行に対して）ローカルに順序付けされている可能性も低くなります。

したがって、`cl` 値は無作為に並んでいる可能性が高く、局所性が悪く、圧縮率も悪化します。

### 概要 {#summary-1}

クエリにおけるセカンダリーキー カラムの効率的なフィルタリングと、テーブルのカラムデータファイルの圧縮率の両方に対して、主キー内のカラムをカーディナリティに従って昇順に並べることが有益です。

## 単一行を効率的に特定する {#identifying-single-rows-efficiently}

一般的に、ClickHouseにとって[最適なユースケースではない](https://knowledgebase/key-value)ものの、
時々、ClickHouseの上に構築されたアプリケーションは、ClickHouse テーブルの単一行を特定する必要があります。

直感的な解決策は、行ごとに一意の値を持つ[UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) カラムを使用し、そのカラムを主キー カラムとして使用して行を迅速に取得することです。

最も迅速な取得のためには、UUID カラムは[最初のキー カラムである必要があります](#the-primary-index-is-used-for-selecting-granules)。

私たちは、[ClickHouse テーブルの行データは主キー カラムに従ってディスクに保存される](#data-is-stored-on-disk-ordered-by-primary-key-columns)ため、非常に高いカーディナリティのカラム（UUID カラムのような）が主キーまたは複合主キーの前に置かれると、[他のテーブルカラムの圧縮率にとって不利である](#optimal-compression-ratio-of-data-files)ことを説明しました。

最も迅速な取得と最適なデータ圧縮の間の妥協は、UUID を最後のキー カラムとして使用する複合主キーを使用し、低（または）カーディナリティのキー カラムがいくつかのテーブルのカラムの良い圧縮率を確保するために使用されます。

### 具体的な例 {#a-concrete-example}

具体的な例は、Alexey Milovidov が開発し、[ブログで説明した](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)プレーンテキストのペーストサービス [https://pastila.nl](https://pastila.nl) です。

テキストエリアが変更されるたびに、そのデータは自動的に ClickHouse テーブルの行に保存されます（変更ごとに1行）。

ペーストコンテンツを特定して取得する方法の一つは、そのコンテンツのハッシュをテーブル行のUUIDとして利用することです。

次の図は
- コンテンツが変更されたときの行の挿入順（たとえば、テキストエリアに入力されたキーストロークによる）と
- `PRIMARY KEY (hash)` が使用されるときの挿入された行からのデータのディスク上の順序を示しています：

<Image img={sparsePrimaryIndexes15a} size="md" alt="Sparse Primary Indices 15a" background="white"/>

`hash` カラムが主キー カラムとして使用されるため、
- 特定の行を[非常に迅速に](#the-primary-index-is-used-for-selecting-granules)取得できますが、
- テーブルの行（そのカラムデータ）はディスクに (ユニークでランダムな) ハッシュ値昇順で保存されます。したがって、コンテンツカラムの値も無作為に保存され、**コンテンツカラムデータファイルの圧縮率が最適ではありません。**

コンテンツカラムの圧縮率を大幅に改善しながら、特定の行の迅速な取得を達成するために、pastila.nl では特定の行を識別するために2つのハッシュ（および複合主キー）を使用しています：
- 前述のコンテンツのハッシュ、そのデータに対して異なるもの、
- 小さなデータ変更に対して**変化しない**[ローカリティスィンシティブハッシュ（フィンガープリント）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)。

次の図は
- コンテンツが変更されたときの行の挿入順（たとえば、テキストエリアにタイピングされたキーストロークによる）と
- 複合 `PRIMARY KEY (fingerprint, hash)` が使用されるときの挿入された行からのデータのディスク上の順序を示しています：

<Image img={sparsePrimaryIndexes15b} size="md" alt="Sparse Primary Indices 15b" background="white"/>

これでディスク上의行はまず `fingerprint` によって順序付けられ、同じフィンガープリント値を持つ行の場合、その `hash` 値が最終的な順序を決定します。

データがわずかな変化のみで異なると、同じフィンガープリント値のみが付与され、コンテンツカラム内の似たデータがディスク上で近くに保存されます。これはコンテンツカラムの圧縮率には非常に良い結果をもたらします。一般に、圧縮アルゴリズムはデータの局所性から恩恵を受け（データが似ているほど圧縮率が良い）、最適な圧縮率を実現します。

妥協は、複合 `PRIMARY KEY (fingerprint, hash)`から派生する主インデックスを最適に利用するために、特定の行を取得するために二つのフィールド (`fingerprint` と `hash`) が必要であることです。
