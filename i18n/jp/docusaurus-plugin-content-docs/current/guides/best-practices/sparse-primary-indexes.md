---
sidebar_label: 主キーインデックス
sidebar_position: 1
description: このガイドでは、ClickHouseのインデックスについて深く掘り下げます。
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

# ClickHouseにおける主キーインデックスの実践的な紹介
## イントロダクション {#introduction}

このガイドでは、ClickHouseのインデックスについて深く掘り下げます。以下の点について詳細に説明します：
- [ClickHouseのインデックスが従来のリレーショナルデータベース管理システムとどのように異なるか](#an-index-design-for-massive-data-scales)
- [ClickHouseがテーブルのスパース主キーインデックスをどのように構築し使用しているか](#a-table-with-a-primary-key)
- [ClickHouseにおけるインデックスのベストプラクティス](#using-multiple-primary-indexes)

このガイドに記載されている全てのClickHouse SQL文およびクエリを、任意でご自身のマシン上で実行することができます。
ClickHouseのインストールおよび開始手順については、[クイックスタート](/quick-start.mdx)を参照してください。

:::note
このガイドは、ClickHouseのスパース主キーインデックスに焦点を当てています。

ClickHouseの[二次データスキップインデックス](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)については、[チュートリアル](/guides/best-practices/skipping-indexes.md)をご覧ください。
:::
### データセット {#data-set}

このガイドでは、サンプルの匿名化されたウェブトラフィックデータセットを使用します。

- サンプルデータセットからの8.87百万行（イベント）のサブセットを使用します。
- 非圧縮データサイズは8.87百万のイベントで、約700 MBです。ClickHouseに格納すると200 MBに圧縮されます。
- 私たちのサブセットでは、各行には特定の時間(`EventTime`カラム)にURL(`URL`カラム)をクリックしたインターネットユーザー(`UserID`カラム)を示す3つのカラムが含まれています。

これら3つのカラムを使用して、次のような典型的なウェブ分析クエリを形成することができます：

- "特定のユーザーが最もクリックしたトップ10のURLは何ですか？"
- "特定のURLを最も頻繁にクリックしたトップ10のユーザーは誰ですか？"
- "特定のURLをユーザーがクリックする最も人気のある時間（例：曜日）は何ですか？"
### テストマシン {#test-machine}

この文書で示されるすべての実行時数値は、MacBook Pro（Apple M1 Pro チップ、16GB RAM）上でローカルにClickHouse 22.2.1を実行した結果に基づいています。
### フルテーブルスキャン {#a-full-table-scan}

主キーがない状態でデータセットに対してクエリがどのように実行されるかを確認するために、次のSQL DDL文を実行してテーブルを作成します（MergeTreeテーブルエンジンを使用）：

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

次に、以下のSQL挿入文を使用してヒットデータセットのサブセットをテーブルに挿入します。これは、リモートでホストされている完全なデータセットからのサブセットをロードするために、[URLテーブル関数](/sql-reference/table-functions/url.md)を使用しています：

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

ClickHouseクライアントの結果出力は、上記の文がテーブルに8.87百万行を挿入したことを示しています。

最後に、このガイドでの議論を簡単にし、図や結果を再現可能にするために、テーブルを[最適化](/sql-reference/statements/optimize.md)します（FINALキーワードを使用）：

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
一般的には、データをロードした後、テーブルをすぐに最適化する必要はなく、推奨されません。この例でそれが必要な理由は後で明らかになります。
:::

次に、最初のウェブ分析クエリを実行します。以下は、UserID 749927693のインターネットユーザーについて最もクリックされたトップ10のURLを計算するものです：

```sql
SELECT URL, count(URL) as Count
FROM hits_NoPrimaryKey
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```
レスポンスは以下の通りです：
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

ClickHouseクライアントの結果出力は、ClickHouseがフルテーブルスキャンを実行したことを示しています！私たちのテーブルの8.87百万行の各行がClickHouseにストリームされました。これはスケーラブルではありません。

これを（はるかに）効率的かつ（はるかに）速くするためには、適切な主キーを持つテーブルを使用する必要があります。これにより、ClickHouseは自動的に（主キーのカラムに基づいて）スパース主キーインデックスを作成し、それを使用して例のクエリの実行を大幅に加速できます。
### 関連コンテンツ {#related-content}
- ブログ: [あなたのClickHouseクエリをスーパーチャージする](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## ClickHouseインデックス設計 {#clickhouse-index-design}
### 大規模データスケールのためのインデックス設計 {#an-index-design-for-massive-data-scales}

従来のリレーショナルデータベース管理システムでは、主インデックスにはテーブル行ごとに1つのエントリが含まれます。これにより、主インデックスは私たちのデータセットに対して8.87百万のエントリを含むことになります。このようなインデックスは、特定の行の迅速な検索を可能にし、ルックアップクエリやポイント更新の高効率を実現します。`B(+)-Tree`データ構造内のエントリを検索する平均時間計算量は`O(log n)`であり、より正確には`log_b n = log_2 n / log_2 b`で、`b`は`B(+)-Tree`の分岐係数で、`n`はインデックスされた行の数です。通常、`b`は数百から数千の間であるため、`B(+)-Trees`は非常に浅い構造であり、レコードを見つけるために必要なディスクシークは少ない。8.87百万行と分岐係数が1000の場合、平均して2.3回のディスクシークが必要です。この能力は、追加のディスクおよびメモリオーバーヘッド、新しい行やインデックスエントリをテーブルに追加する際の高い挿入コスト、および場合によってはBツリーの再バランスを伴います。

Bツリーインデックスに関連する課題を考慮して、ClickHouseのテーブルエンジンは異なるアプローチを採用しています。ClickHouseの[MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family/index.md)は、大規模データボリュームを処理するために設計および最適化されています。これらのテーブルは、毎秒何百万行もの挿入を受け入れ、非常に大きな（ペタバイト単位の）データボリュームを保存することを目的としています。データは、[部分ごとに](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)迅速にテーブルに書き込まれ、バックグラウンドでの部分のマージにルールが適用されます。ClickHouseでは、各部分に独自の主インデックスがあります。部分がマージされると、マージされた部分の主インデックスもマージされます。ClickHouseが対象としている非常に大規模なスケールでは、ディスクとメモリの効率が極めて重要です。したがって、すべての行にインデックスを付けるのではなく、部分の主インデックスは行のグループ（'granule'と呼ばれる）ごとに1つのインデックスエントリ（'mark'として知られる）を持ちます。この技術は**スパースインデックス**と呼ばれます。

スパースインデックスが可能なのは、ClickHouseが部分の行を主キーのカラムごとにディスクに順序付けて格納しているためです。特定の行を直接見つける代わりに（Bツリーに基づくインデックスのように）、スパース主インデックスは、インデックスエントリに対する二分検索を使用して、クエリに一致する可能性のある行のグループを迅速に特定します。特定された一致する可能性のある行のグループ（グラニュール）は、マッチを見つけるためにClickHouseエンジンに並行してストリーミングされます。このインデックス設計により、主インデックスは小さく（主メモリに完全に収まる必要があります）、クエリの実行時間を大幅に短縮できます。特にデータ解析のユースケースで典型的な範囲クエリにおいて急速に結果を得られるようになります。

以下は、ClickHouseがどのようにそのスパース主インデックスを構築し、使用しているかを詳しく示します。後の章では、インデックスを構築するために使用されるテーブルカラム（主キーのカラム）を選択、削除、および順序付けするためのベストプラクティスについて議論します。
### 主キーを持つテーブル {#a-table-with-a-primary-key}

UserIDとURLというキーカラムを持つ複合主キーを持つテーブルを作成します：

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

このガイドの後の議論を簡素化し、図や結果を再現可能にするために、DDLステートメントは以下のようにします。

<ul>
  <li>
    <code>ORDER BY</code>句を通じてテーブルの複合ソートキーを指定します。
  </li>
  <li>
    設定によって主インデックスにいくつのインデックスエントリが必要かを明示的に制御します。
    <ul>
      <li>
        <code>index_granularity</code>: デフォルト値8192に明示的に設定。この設定により、8192行ごとに1つのインデックスエントリが主インデックスに作成されます。たとえば、テーブルに16384行がある場合、インデックスは2つのインデックスエントリを持ちます。
      </li>
      <li>
        <code>index_granularity_bytes</code>: 0に設定し、<a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">適応インデックス粒度</a>を無効化します。適応インデックス粒度とは、ClickHouseが次のいずれかが真である場合、n行ごとに1つのインデックスエントリを自動的に生成することを意味します：
        <ul>
          <li>
            <code>n</code>が8192未満で、かつその<code>n</code>行の結合された行データのサイズが10 MB（<code>index_granularity_bytes</code>のデフォルト値）以上である場合。
          </li>
          <li>
            <code>n</code>行の結合されたデータサイズが10 MB未満だが、<code>n</code>が8192である場合。
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: 主インデックスの<a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">圧縮</a>を無効にするために0に設定します。これにより後でオプションでその内容を確認できるようになります。
      </li>
    </ul>
  </li>
</ul>

</p>
</details>


上記のDDLステートメントの主キーは、指定された2つのキーカラムに基づいて主インデックスの作成を引き起こします。

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
レスポンスは以下の通りです：
```response
0 rows in set. Elapsed: 149.432 sec. Processed 8.87 million rows, 18.40 GB (59.38 thousand rows/s., 123.16 MB/s.)
```


<br/>
テーブルを最適化します：

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br/>
次のクエリを使用して、テーブルに関するメタデータを取得できます：

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

レスポンスは以下の通りです：

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

- テーブルのデータは、特定のディレクトリ内に[ワイドフォーマット](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)で保存されており、すべてのカラムのデータファイル（およびマークファイル）がそのディレクトリ内に1つずつ存在します。
- テーブルには8.87百万行があり、すべての行の非圧縮データサイズは733.28 MBです。
- すべての行の圧縮サイズは、ディスク上で206.94 MBです。
- テーブルには1083のエントリ（'marks'と呼ばれる）がある主インデックスがあり、そのサイズは96.93 KBです。
- 合計で、テーブルのデータとマークファイル、主インデックスファイルを合わせて207.07 MBのディスク容量を占めます。
### データは主キーのカラムごとにディスクに順序付けて格納される {#data-is-stored-on-disk-ordered-by-primary-key-columns}

上記で作成したテーブルには
- 複合[主キー](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)`があり、
- 複合[ソートキー](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`があります。

:::note
- もしソートキーのみを指定していた場合、主キーは暗黙的にソートキーと等しいと定義されます。

- メモリ効率を良くするために、私たちは明示的に、クエリでフィルタリングするカラムのみを含む主キーを指定しました。主キーに基づいた主インデックスは主メモリに完全にロードされています。

- ガイドの図の一貫性を保ちながら、圧縮率を最大化するために、テーブルのすべてのカラムを含む別のソートキーを定義しました（カラム内に類似したデータが近接して配置されている場合、例えばソートを通じてデータが近接すれば、そのデータはより良く圧縮されます）。

- 両方のキーが指定されている場合、主キーはソートキーの接頭辞である必要があります。
:::

挿入された行は、主キーのカラムに従って（追加の`EventTime`カラムを含むソートキーから）ディスク上に辞書式順序（昇順）で保存されます。

:::note
ClickHouseは、同じ主キーのカラム値で複数の行を挿入することを許可しています。この場合（下の図の行1と行2を参照）、最終的な順序は指定されたソートキーによって決まります。したがって、`EventTime`カラムの値になります。
:::

ClickHouseは<a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">列指向データベース管理システム</a>です。以下の図に示すように
- ディスク上の表現については、各テーブルカラムに対して単一のデータファイル（*.bin）があり、その中にそのカラムのすべての値が<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a>形式で保存されており、
- 8.87百万行はディスク上で主キーのカラム（および追加のソートキーのカラム）に基づいて辞書式昇順で保存されています。すなわち、今回は以下の順序です：
  - 最初に`UserID`,
  - 次に`URL`,
  - 最後に`EventTime`:

<img src={sparsePrimaryIndexes01} class="image"/>

`UserID.bin`、`URL.bin`、`EventTime.bin`は、`UserID`、`URL`、`EventTime`カラムの値が保存されているディスク上のデータファイルです。

<br/>
<br/>

:::note
- 主キーはディスク上の行の辞書式順序を定義するため、テーブルは主キーを1つだけ持つことができます。

- 行はClickHouseの内部行番号付けスキームに合わせて0から番号付けしています。このスキームは、ログメッセージでも使用されています。
:::
### データは並列データ処理のためにグラニュールに整理される {#data-is-organized-into-granules-for-parallel-data-processing}

データ処理の目的で、テーブルのカラム値は論理的にグラニュールに分割されます。
グラニュールは、ClickHouseがデータ処理のためにストリームする最小の不可分なデータセットです。
これは、個々の行を読み取る代わりに、ClickHouseが常に行のグループ（グラニュール）全体をストリーミングで並行して読み込むことを意味します。
:::note
カラム値は物理的にグラニュール内に格納されているわけではありません；グラニュールはクエリ処理のためのカラム値の論理的な整理に過ぎません。
:::

以下の図は、8.87百万行のテーブルの（カラム値が）どのように1083のグラニュールに整理されているかを示しています。これは、テーブルのDDLステートメントに`index_granularity`の設定が含まれており、デフォルト値が8192に設定されているためです。

<img src={sparsePrimaryIndexes02} class="image"/>

最初の8192行（ディスク上の物理的順序に基づく）は論理的にグラニュール0に属し、次の8192行はグラニュール1に属します。

:::note
- 最後のグラニュール（グラニュール1082）は、8192行未満のデータを「含んでいます」。

- このガイドの冒頭で「DDLステートメントの詳細」で述べたように、[適応インデックス粒度](/whats-new/changelog/2019.md/#experimental-features-1)を無効にしました（このガイドの後の議論を簡素化し、図や結果を再現可能にするため）。

  そのため、このサンプルテーブルのすべてのグラニュール（最後の1つを除く）は同じサイズを持ちます。

- 適応インデックス粒度を持つテーブルでは（インデックス粒度は[デフォルトで](https://engines/table-engines/mergetree-family/mergetree.md/#index_granularity_bytes)適応的です）、行データサイズに応じて一部のグラニュールのサイズが8192行未満になる場合があります。

- 主キーのカラム（`UserID`、`URL`）のいくつかのカラム値をオレンジでマークしました。
  これらのオレンジマークされたカラム値は、各グラニュールの最初の行の主キーのカラム値です。
  後で見ていくと、これらのオレンジマークされたカラム値がテーブルの主インデックスのエントリになります。

- グラニュールは内部の番号付けスキームに合わせて0から番号付けしています。このスキームは、ログメッセージでも使用されています。
:::
### 主キーインデックスは各グラニュールごとに1エントリを持っています {#the-primary-index-has-one-entry-per-granule}

主キーインデックスは、上記の図に示されているグラニュールに基づいて作成されます。このインデックスは、0から始まるいわゆる数値インデックスマークを含む非圧縮の平面配列ファイル（primary.idx）です。

以下の図は、インデックスがそれぞれのグラニュールの最初の行に対する主キー列の値（上記の図でオレンジ色でマークされた値）を格納していることを示しています。言い換えれば、主キーインデックスはテーブルの各8192行ごとの主キー列の値を格納しています（物理的な行順序は主キー列によって定義されます）。例えば、
- 最初のインデックスエントリ（以下の図の「マーク 0」）は、上記の図のグラニュール0の最初の行のキー列の値を格納しています。
- 二番目のインデックスエントリ（以下の図の「マーク 1」）は、上記の図のグラニュール1の最初の行のキー列の値を格納しています。

<img src={sparsePrimaryIndexes03a} class="image"/>

合計で、このインデックスは、880万行と1083グラニュールを持つ我々のテーブルには1083エントリがあります：

<img src={sparsePrimaryIndexes03b} class="image"/>

:::note
- [適応インデックス粒度](/whats-new/changelog/2019.md/#experimental-features-1)を持つテーブルの場合、最後のテーブル行の主キー列の値を記録する「最終」追加マークが主インデックスに保存されていますが、このガイド内の議論を簡素化し、図と結果が再現可能にするために適応インデックス粒度を無効にしたため、例のテーブルのインデックスにはこの最終マークは含まれていません。

- 主インデックスファイルは完全にメインメモリに読み込まれます。ファイルが利用可能なフリーメモリスペースより大きい場合、ClickHouseはエラーを発生させます。
:::

<details>
    <summary>
    主インデックスの内容を検査する
    </summary>
    <p>

セルフマネージドのClickHouseクラスターでは、我々の例のテーブルの主インデックスの内容を調べるために、<a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">fileテーブル関数</a>を使用することができます。

そのためには、最初に主インデックスファイルを実行中のクラスターのノードの<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a>にコピーする必要があります：
<ul>
<li>ステップ 1: 主インデックスファイルを含む部分パスを取得</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

これはテストマシン上で`/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`を返します。

<li>ステップ 2: user_files_pathを取得</li>
Linuxでの<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">デフォルトのuser_files_path</a>は
`/var/lib/clickhouse/user_files/`

で、Linuxでは変更があったかどうかを確認できます：`$ grep user_files_path /etc/clickhouse-server/config.xml`

テストマシンでは、パスは`/Users/tomschreiber/Clickhouse/user_files/`です。


<li>ステップ 3: 主インデックスファイルをuser_files_pathにコピー</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

<br/>

</ul>

これで、SQLを通じて主インデックスの内容を検査することができます：
<ul>
<li>エントリの数を取得</li>
`
SELECT count( )<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String');
`

<br/>
<br/>
は`1083`を返します。
<br/>
<br/>
<li>最初の2つのインデックスマークを取得</li>
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
<li>最後のインデックスマークを取得</li>
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

これは、我々の例のテーブルの主インデックス内容の図と正確に一致します：
<img src={sparsePrimaryIndexes03b} class="image"/>
</p>
</details>

主キーエントリはインデックスマークと呼ばれます。なぜなら、各インデックスエントリは特定のデータ範囲の開始を示しているからです。具体的には、例のテーブルについて：
- UserIDインデックスマーク:<br/>
  主インデックスに格納されている`UserID`の値は昇順にソートされています。<br/>
  したがって、上記の図で「マーク 1」は、グラニュール1およびそれ以降のすべてのグラニュールのすべてのテーブル行の`UserID`の値が4,073,710以上であることが保証されます。

 [後で見ていくように](#the-primary-index-is-used-for-selecting-granules)、このグローバル順序により、ClickHouseは、クエリが主キーの最初の列でフィルタリングされているときに、最初のキー列に対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">バイナリ検索アルゴリズム</a>を使用することが可能になります。

- URLインデックスマーク:<br/>
  主キー列`UserID`と`URL`の類似した有効性は、一般的に、主キーの最初の列の後のすべてのキー列のインデックスマークは、前のキー列の値が現在のグラニュール内で同じである限り、データ範囲を示すだけであることを意味します。<br/>
  例えば、上記の図でマーク0とマーク1のUserIDの値が異なるため、ClickHouseはグラニュール0内のすべてのテーブル行のURLの値が`'http://showtopics.html%3...'`以上であると見なすことができません。しかし、上記の図でマーク0とマーク1のUserIDの値が同じである場合（すなわち、UserIDの値がグラニュール0内のすべてのテーブル行で同じである場合）、ClickHouseはグラニュール0のすべてのテーブル行のURLの値が`'http://showtopics.html%3...'`以上であると見なすことができるのです。

クエリ実行のパフォーマンスに対する影響については、後で詳しく説明します。
### 主キーインデックスはグラニュールを選択するために使用されます {#the-primary-index-is-used-for-selecting-granules}

これで、主キーインデックスのサポートを受けて、クエリを実行することができます。

以下は、UserID 749927693の最もクリックされた上位10のURLを計算します。

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

10 rows in set. Elapsed: 0.005 sec.
// highlight-next-line
Processed 8.19 thousand rows,
740.18 KB (1.53 million rows/s., 138.59 MB/s.)
```

ClickHouseクライアントの出力は、テーブル全体をスキャンするのではなく、クリックハウスにストリーミングされるのが8.19千行だけであることを示しています。

もし<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">トレースロギング</a>が有効になっている場合、ClickHouseサーバーログファイルは、ClickHouseが`749927693`のUserID列の値を持つ行を含む可能性があるグラニュールを特定するために、1083のUserIDインデックスマークに対して<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">バイナリ検索</a>を実行していたことを示しています。これは、平均時間計算量`O(log2 n)`で19ステップを要します：
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

トレースログでは、1083の既存のマークのうちの1つがクエリを満たすことがわかります。

<details>
    <summary>
    トレースログの詳細
    </summary>
    <p>

マーク176が特定されました（「見つかった左境界マーク」は含まれ、「見つかった右境界マーク」は除外されます）、したがって、グラニュール176のすべての8192行（行1441792から開始）をストリーミングして、UserID列の値が`749927693`である実際の行を見つけるためにClickHouseに渡されます。
</p>
</details>

このプロセスを再現するために、例のクエリ内で<a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN句</a>を使用します：
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

16 rows in set. Elapsed: 0.003 sec.
```
クライアントの出力は、1083グラニュールのうちの1つが749927693のUserID列の値を含む可能性があるとして選択されたことを示しています。

:::note 結論
クエリが複合キーの一部であり、最初のキー列でフィルタリングされている場合、ClickHouseはキー列のインデックスマークに対してバイナリ検索アルゴリズムを実行します。
:::

<br/>

上記で説明したように、ClickHouseは、そのスパース主インデックスを使用して、クエリに一致する行を含む可能性があるグラニュールを迅速に（バイナリ検索を介して）選択します。

これはClickHouseクエリ実行の**最初のステージ（グラニュール選択）**です。

**二番目のステージ（データ読み取り）**では、ClickHouseは選択されたグラニュールを見つけ、すべての行をClickHouseエンジンにストリーミングして、実際にクエリに一致する行を見つけます。

その二番目のステージについては、次のセクションで詳しく説明します。
### マークファイルはグラニュールを位置決めするために使用されます {#mark-files-are-used-for-locating-granules}

以下の図は、我々のテーブルの主インデックスファイルの一部を示しています。

<img src={sparsePrimaryIndexes04} class="image"/>

上記で説明したように、インデックスの1083のUserIDマークに対するバイナリ検索を介して、マーク176が特定されました。したがって、その対応するグラニュール176は、UserID列の値が749927693の行を含む可能性があります。

<details>
    <summary>
    グラニュール選択の詳細
    </summary>
    <p>

上記の図は、マーク176が関連付けられたグラニュール176の最小UserID値が749927693よりも小さく、次のマーク（マーク177）のためのグラニュール177の最小UserID値はこの値よりも大きいという最初のインデックスエントリであることを示しています。したがって、マーク176の関連グラニュール176だけが、UserID列の値が749927693の行を含む可能性があります。
</p>
</details>

グラニュール176内の行がUserID列の値749927693を含むかを確認するために、グラニュールに属する8192行をすべてClickHouseにストリーミングする必要があります。

そのために、ClickHouseはグラニュール176の物理的位置を知る必要があります。

ClickHouseでは、テーブルのすべてのグラニュールの物理的な位置がマークファイルに保存されています。データファイルと同様に、各テーブル列に対して1つのマークファイルがあります。

以下の図は、テーブルの`UserID`、`URL`、`EventTime`列のグラニュールの物理的な位置を保存する3つのマークファイル`UserID.mrk`、`URL.mrk`、`EventTime.mrk`を示しています。
<img src={sparsePrimaryIndexes05} class="image"/>

主インデックスが0から始まる番号付きインデックスマークを含む平坦な非圧縮の配列ファイル（primary.idx）であることはすでに説明しました。

同様に、マークファイルもまた、0から始まる番号を持つ平坦な非圧縮配列ファイル（*.mrk）であり、マークを含んでいます。

ClickHouseがクエリに対して一致する可能性のある行を含むグラニュールのインデックスマークを特定し選択した後、マークファイル内の位置配列ルックアップを実行して、グラニュールの物理的な位置を取得します。

特定の列に対する各マークファイルエントリは、オフセットの形で2つの位置を保存しています：

- 最初のオフセット（上記の図で「block_offset」）は、選択されたグラニュールの圧縮バージョンを含む<a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">ブロック</a>を<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮された</a>カラムデータファイル内で位置づけます。この圧縮されたブロックには、いくつかの圧縮されたグラニュールが含まれている可能性があります。所定の圧縮ファイルブロックは、読み込み時にメインメモリに解凍されます。

- マークファイルからの2番目のオフセット（上記の図で「granule_offset」）は、非圧縮ブロックデータ内のグラニュールの位置を提供します。

その後、位置付けられた非圧縮グラニュールに属するすべての8192行がClickHouseにストリーミングされ、さらなる処理が行われます。

:::note

- [広い形式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)を持ち、[適応インデックス粒度](/whats-new/changelog/2019.md/#experimental-features-1)を持たないテーブルの場合、ClickHouseは上記のように1エントリあたり2つの8バイトのアドレスを含む`.mrk`マークファイルを使用します。これらのエントリは、すべて同じサイズのグラニュールの物理的位置です。

インデックスの粒度はデフォルトで[適応](/engines/table-engines/mergetree-family/mergetree.md/#index_granularity_bytes)ですが、我々の例のテーブルでは、議論を簡素化し、図と結果が再現可能にするために適応インデックス粒度を無効にしました。我々のテーブルは、データのサイズが[min_bytes_for_wide_part](/engines/table-engines/mergetree-family/mergetree.md/#min_bytes_for_wide_part)（デフォルトではセルフマネージドクラスターでは10MB）よりも大きいため広い形式を使用しています。

- 適応インデックス粒度を持つ広い形式のテーブルの場合、ClickHouseは`.mrk2`マークファイルを使用します。これは、マークファイルに類似したエントリを含んでいますが、エントリごとに追加の3番目の値（現在のエントリに関連するグラニュールの行数）があります。

- [コンパクト形式](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)のテーブルについては、ClickHouseは`.mrk3`マークファイルを使用します。

:::


:::note マークファイルの理由

なぜ主インデックスはインデックスマークに対応するグラニュールの物理的な位置を直接含まないのでしょうか？

それは、ClickHouseが設計された非常に大規模なスケールにおいては、ディスクとメモリの両方に対して非常に効率的であることが重要なのです。

主インデックスファイルはメインメモリに収まる必要があります。

我々の例のクエリでは、ClickHouseは主インデックスを使用し、クエリに一致する行を持つ可能性があるグラニュール1つを選択しました。そのため、ClickHouseはその1つのグラニュールの物理的な位置しかストリーミングする必要がなく、他のグラニュールの物理的な位置を知る必要はありません。

さらに、このオフセット情報は、クエリに使用されていない列（例えば、`EventTime`）には必要ありません。

我々のサンプルクエリに対して、ClickHouseにはUserIDデータファイル（UserID.bin）内のグラニュール176の物理的位置オフセットが2つ、URLデータファイル（URL.bin）内のグラニュール176の物理的位置オフセットが2つだけを必要とします。

マークファイルによって提供される間接的情報は、主インデックス内で1083のグラニュールすべての物理位置のエントリを直接保持することを回避します。これにより、不必要な（潜在的に未使用の）データがメインメモリに存在するのを回避できます。
:::

以下の図とその下のテキストは、ClickHouseがどのようにしてユーザーIDデータファイル内のグラニュール176を特定するかを示しています。

<img src={sparsePrimaryIndexes06} class="image"/>

これまでに説明したように、ClickHouseは主インデックスマーク176を選択し、したがってグラニュール176をクエリに対する一致する行を含む可能性があるものとして特定しました。

ClickHouseは現在、選択されたマーク番号（176）を使用して、UserID.mrkマークファイルで位置配列ルックアップを行い、グラニュール176の2つのオフセットを取得します。

以下の図のように、最初のオフセットは、UserID.binデータファイル内の圧縮ファイルブロックを特定し、そのブロックにグラニュール176の圧縮バージョンが含まれています。

位置が特定されたファイルブロックがメインメモリに解凍された後、マークファイルからの2番目のオフセットを使用して非圧縮データ内でグラニュール176を特定することができます。

ClickHouseは我々の例のクエリを実行するために、UserID.binデータファイルとURL.binデータファイルの両方からグラニュール176を位置決め（およびすべての値をストリーミング）する必要があります（UserID 749.927.693のユーザーに対して最もクリックされた上位10のURL）。

上記の図は、ClickHouseがUserID.binデータファイルのグラニュールを位置決めする方法を示しています。

同時に、ClickHouseはURL.binデータファイルの場合のグラニュール176についても同様の処理を行なっており、両方のそれぞれのグラニュールが整列され、ClickHouseエンジンにストリーミングされ、すべての行の中でUserIDが749.927.693であるURL値を、そのグループごとに集計しカウントした後、最終的にカウントの降順で10の最大のURLグループを出力することになります。
## 複数の主キーを使用する {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### 二次キー列は（非効率になる可能性があります） {#secondary-key-columns-can-not-be-inefficient}

クエリが複合キーの一部であり、最初のキー列でフィルタリングされる場合、[ClickHouseはキー列のインデックスマークにバイナリ検索アルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

しかし、クエリが複合キーの一部であり、最初のキー列ではない列でフィルタリングされると、何が起こるでしょうか？

:::note
クエリが最初のキー列でなく、二次キー列で明示的にフィルタリングされるシナリオを見ていきます。

クエリが最初のキー列とその後の任意のキー列でフィルタリングされている場合、ClickHouseは最初のキー列のインデックスマークに対してバイナリ検索を実行します。
:::

<br/>
<br/>

<a name="query-on-url"></a>
「http://public_search」というURLを最も頻繁にクリックした上位10のユーザーを計算するクエリを使用します。

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

10 rows in set. Elapsed: 0.086 sec.
// highlight-next-line
Processed 8.81 million rows,
799.69 MB (102.11 million rows/s., 9.27 GB/s.)
```

クライアントの出力は、ClickHouseが完全にテーブルスキャンを実行しようとしていることを示しており、[URL列が複合主キーの一部である](#a-table-with-a-primary-key)にもかかわらず、880万行のうち8.81百万行が読み取られています。

もし[trace_logging](/operations/server-configuration-parameters/settings.md/#server_configuration_parameters-logger)が有効であれば、ClickHouseサーバーログファイルは、ClickHouseが<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">一般的な除外検索</a>を使用して、1083のURLインデックスマークを対象として、「http://public_search」のURL列の値を持つ行を含む可能性があるグラニュールを特定していることを示しています：
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
トレースログのサンプルでは、1083グラニュールのうち1076（マークにより）が選択され、「http://public_search」という一致するURL値を持つ行を含む可能性があることが示されています。

結果として、881万行がClickHouseエンジンにストリーミングされ（10スレッドを使用して並行して処理される）、最終的に「http://public_search」を持つ行が実際に含まれているかどうかを特定するためにストリーミングされます。

しかしながら、[後で確認しますが](#query-on-url-fast)、選択された1076のグラニュールのうち、実際に一致する行を持つのは39つのグラニュールだけです。

複合主キー（UserID、URL）に基づく主インデックスは、特定のUserIDの値でフィルタリングする行を高速化するのには非常に役立ちましたが、特定のURLの値でフィルタリングするクエリの速度向上にはあまり寄与していません。

その理由は、URL列が最初のキー列でないため、ClickHouseはURL列のインデックスマークの上に一般的な除外検索アルゴリズムを使用し、**そのアルゴリズムの有効性は、URL列とその前のキー列であるUserIDの間の有効性の差に依存します**。

これを説明するために、一般的な除外検索がどのように機能するかについていくつかの詳細を提供します。

<a name="generic-exclusion-search-algorithm"></a>
### 一般的な除外検索アルゴリズム {#generic-exclusion-search-algorithm}


以下は、前のキー列が低いまたは高い有効性を持つ場合に二次列によってグラニュールが選ばれるときに、<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >ClickHouse一般的な除外検索アルゴリズム</a>がどのように機能するかを示します。

いくつかの例として、以下の条件を仮定します：
- URL値が「W3」の行を検索するクエリ。
- UserIDとURLの値が簡略化された抽象的なヒットテーブルのバージョン。
- インデックスに対する同じ複合主キー（UserID、URL）。これは、行が最初にUserIDの値で、同じUserIDの値を持つ行が次にURLで順序付けされることを意味します。
- グラニュールサイズは2で、つまり各グラニュールには2行が含まれます。

以下の図では、各グラニュールの最初の行に対するキー列の値がオレンジでマークされています。

**前のキー列が低い有効性を持つ場合**<a name="generic-exclusion-search-fast"></a>

仮にUserIDが低い有効性を持っている場合、同じUserIDの値が複数のテーブル行およびグラニュール、従ってインデックスマークに分散される可能性が高くなります。そのため、同じUserIDのインデックスマークのURL値は昇順にソートされています（なぜなら、テーブル行は最初にUserIDで、次にURLで順に配置されるからです）。これは以下のように効率的なフィルタリングを可能にします：
<img src={sparsePrimaryIndexes07} class="image"/>

上記の抽象的なサンプルデータの図におけるグラニュール選択プロセスには、次の3つの異なるシナリオがあります：

1. **URL値がW3より小さく、直接後続のインデックスマークのURL値もW3より小さいインデックスマーク0**は除外可能です。これはマーク0および1が同じUserIDの値を持っているためです。この除外前提は、グラニュール0がU1 UserIDの値で完全に構成されることを保証し、ClickHouseがグラニュール0内の最大URL値がW3未満であると仮定でき、グラニュールを除外できることを意味します。

2. **URL値がW3より小さいまたは等しいが、直接後続のインデックスマークのURL値がW3以上であるインデックスマーク1**は選択されます。これは、グラニュール1がURL W3を持つ行を含む可能性があるからです。

3. **URL値がW3より大きいインデックスマーク2および3**は除外できます。なぜなら、主インデックスのインデックスマークは、各グラニュールの最初の行に対するキー列の値を格納しており、テーブル行はディスク上でキー列の値によってソートされているため、グラニュール2および3はW3のURL値を含むことができません。

**前のキー列が高い有効性を持つ場合**<a name="generic-exclusion-search-slow"></a>

UserIDが高い有効性を持つ場合、同じUserIDの値が複数のテーブル行およびグラニュールに分散される可能性が低くなります。これは、インデックスマークのURL値が単調に増加するわけではないことを意味します：

<img src={sparsePrimaryIndexes08} class="image"/>

上記の図に示すように、W3より小さいすべての表示されたマークは、対応するグラニュールの行をClickHouseエンジンにストリーミングするために選択されます。

これは、上記のすべてのインデックスマークが先ほど説明したシナリオ1に該当するにもかかわらず、次のインデックスマークが現在のマークと同じUserID値を持っているという除外前提を満たしていないためです。したがって、除外できません。

例えば、URL値がW3より小さく、直接後続のインデックスマークのURL値もW3より小さいインデックスマーク0を考えてみましょう。これは、直接後続のインデックスマーク1が現在のマーク0と同じUserID値を持っていないため、除外できません。

これは、ClickHouseがグラニュール0内の最大URL値についての仮定を行うことを妨げます。代わりに、ClickHouseはグラニュール0がURL値W3を持つ行を潜在的に含むと仮定し、マーク0を選択する必要があります。

このシナリオは、マーク1、2、3についても同様です。

:::note 結論
ClickHouseが、クエリが複合キーの一部であり、最初のキー列でない列でフィルタリングしている場合に使用する<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">一般的な除外検索アルゴリズム</a>は、前のキー列が低い有効性を持っている場合に最も効果的です。
:::

我々のサンプルデータセットでは、両方のキー列（UserID、URL）が類似した高い有効性を持ち、説明したように、一般的な除外検索アルゴリズムはURL列の前のキー列が高い（または類似の）有効性を持つ場合にあまり効果的ではありません。
### データスキッピングインデックスに関する注意 {#note-about-data-skipping-index}

UserIDとURLの類似の高いカーディナリティのため、私たちの[URLに関するクエリフィルタリング](#query-on-url)は、[テーブルのURLカラム](#a-table-with-a-primary-key)に[セカンダリーデータスキッピングインデックス](./skipping-indexes.md)を作成してもあまり恩恵を受けません。

例えば、以下の2つのステートメントは、私たちのテーブルのURLカラムに[MinMax](https://clickhouse.com/docs/ja/engines/table-engines/mergetree-family/mergetree/#primary-keys-and-indexes-in-queries)データスキッピングインデックスを作成し、ポピュレートします：
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouseは今、追加のインデックスを作成しました。これは、4つの連続した[グラニュール](#data-is-organized-into-granules-for-parallel-data-processing)ごとに（上記の`ALTER TABLE`文の`GRANULARITY 4`句に注意）、最小および最大のURL値を格納します：

<img src={sparsePrimaryIndexes13a} class="image"/>

最初のインデックスエントリ（上の図で「マーク0」）は、[私たちのテーブルの最初の4つのグラニュールに属する行](#data-is-organized-into-granules-for-parallel-data-processing)の最小および最大URL値を格納しています。

2番目のインデックスエントリ（「マーク1」）は、次の4つのグラニュールに属する行の最小および最大URL値を格納しています。

（ClickHouseはまた、インデックスマークに関連付けられたグラニュールのグループを[特定](#mark-files-are-used-for-locating-granules)するためのデータスキッピングインデックス用の特別な[マークファイル](#mark-files-are-used-for-locating-granules)を作成しました。）

UserIDとURLの類似の高いカーディナリティのため、セカンダリーデータスキッピングインデックスは、私たちの[URLに関するクエリフィルタリング](#query-on-url)が実行されるときに、グラニュールを除外するのに役立ちません。

クエリが探している特定のURL値（つまり、'http://public_search'）は、インデックスによって各グラニュールグループに格納された最小および最大の値の間に非常に可能性が高いため、ClickHouseはグラニュールのグループを選択することを強いられます（これには、クエリに一致する行が含まれている可能性があるため）。

### 複数の主インデックスを使用する必要性 {#a-need-to-use-multiple-primary-indexes}

その結果、特定のURLの行をフィルタリングするサンプルクエリを大幅に高速化したい場合は、そのクエリに最適化された主インデックスを使用する必要があります。

さらに、特定のUserIDの行をフィルタリングするサンプルクエリの良好なパフォーマンスを維持したい場合は、複数の主インデックスを使用する必要があります。

これを達成するための方法を以下に示します。

<a name="multiple-primary-indexes"></a>
### 追加の主インデックスを作成するためのオプション {#options-for-creating-additional-primary-indexes}

私たちのサンプルクエリ、特定のUserIDの行をフィルタリングするもの（これも特定のURLの行をフィルタリングするもの）を大幅に高速化したい場合は、以下の3つのオプションのいずれかを使用して、複数の主インデックスを使用する必要があります：

- 異なる主キーを持つ**2番目のテーブル**を作成する。
- 既存のテーブルに**マテリアライズドビュー**を作成する。
- 既存のテーブルに**プロジェクション**を追加する。

これらの3つのオプションは、テーブルの主インデックスと行のソート順序を再編成するために、サンプルデータを別のテーブルに実質的に重複させることになります。

しかし、これらの3つのオプションは、クエリと挿入ステートメントのルーティングに関して、ユーザーに対して追加のテーブルがどれだけ透明かという点で異なります。

異なる主キーを持つ**2番目のテーブル**を作成する際は、クエリは明示的にクエリに最適なテーブルバージョンに送信され、データは両方のテーブルに明示的に追加する必要があります。同期を保つために：
<img src={sparsePrimaryIndexes09a} class="image"/>

**マテリアライズドビュー**を使用すると、追加のテーブルが暗黙的に作成され、両方のテーブル間でデータが自動的に同期されます：
<img src={sparsePrimaryIndexes09b} class="image"/>

**プロジェクション**は最も透明なオプションです。なぜなら、暗黙的に作成された（隠れた）追加のテーブルをデータ変更に対して自動的に同期させるだけでなく、ClickHouseは自動的にクエリに最も効果的なテーブルバージョンを選択するからです：
<img src={sparsePrimaryIndexes09c} class="image"/>

以下に、複数の主インデックスを作成して使用するためのこれらの3つのオプションについて、より詳細に実際の例を示します。

<a name="multiple-primary-indexes-via-secondary-tables"></a>
### オプション1: セカンダリーテーブル {#option-1-secondary-tables}

<a name="secondary-table"></a>
主キーのカラムの順序を（元のテーブルに対して）切り替えた新しい追加テーブルを作成します：

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

私たちの[元のテーブル](#a-table-with-a-primary-key)から887万行すべてを追加テーブルに挿入します：

```sql
INSERT INTO hits_URL_UserID
SELECT * from hits_UserID_URL;
```

レスポンスは次のようになります：

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

そして、テーブルを最適化します：
```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

主キーのカラムの順序を切り替えたため、挿入された行は、ディスクに保存されるときに異なる辞書順に格納され（私たちの[元のテーブル](#a-table-with-a-primary-key)に比べて）、したがってそのテーブルの1083のグラニュールも前とは異なる値を含んでいます：

<img src={sparsePrimaryIndexes10} class="image"/>

これが得られた主キーです：

<img src={sparsePrimaryIndexes11} class="image"/>

これは、URLカラムをフィルタリングする私たちの例のクエリを大幅に高速化するために使用できます。最も頻繁にURL "http://public_search"をクリックした上位10人のユーザーを計算するためです：
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のとおりです：
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

今、[ほぼフルテーブルスキャンを行う](#filtering-on-key-columns-after-the-first)の代わりに、ClickHouseはそのクエリをはるかに効果的に実行しました。

[元のテーブル](#a-table-with-a-primary-key)の主インデックスでは、UserIDが最初で、URLが2番目のキー列であり、ClickHouseはそのクエリを実行するためにインデックスマークの一般的な除外検索を使用しましたが、これはUserIDとURLの類似の高いカーディナリティのためにあまり効果的ではありませんでした。

URLを主インデックスの最初の列として使用することで、ClickHouseは今やインデックスマーク上で<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">バイナリサーチ</a>を実行しています。
その対応するトレースログはClickHouseサーバーログファイルで確認できます：
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
ClickHouseは、一般的な除外検索を使用して1076を選択する代わりに、39のインデックスマークだけを選択しました。

追加のテーブルは、URLでフィルタリングする私たちの例のクエリの実行を高速化するために最適化されています。

私たちの[元のテーブル](#a-table-with-a-primary-key)での[低いパフォーマンス](#query-on-url-slow)に対して、`UserIDs`をフィルタリングする私たちの[例のクエリ](#the-primary-index-is-used-for-selecting-granules)は、新しい追加のテーブルでは非常に効果的には実行されません。なぜなら、UserIDは現在そのテーブルの主インデックスの第2キー列になっているため、ClickHouseは一般的な除外検索を使用してグラニュールを選択することになります。これは、UserIDとURLの類似の高いカーディナリティには[あまり効果的ではありません](#generic-exclusion-search-slow)。
詳細については、詳細ボックスを開いてください。

<details>
    <summary>
    UserIDsでのフィルタリングのクエリは現在、パフォーマンスが低下しています<a name="query-on-userid-slow"></a>
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

私たちは現在、2つのテーブルを持っています。`UserIDs`でのフィルタリングを速めるために最適化され、`URLs`でのフィルタリングを速めるためにも最適化されています：

<img src={sparsePrimaryIndexes12a} class="image"/>
### オプション2: マテリアライズドビュー {#option-2-materialized-views}

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
- 見込みへの主キーのカラムの順序を（私たちの[元のテーブル](#a-table-with-a-primary-key)に対して）切り替えます
- マテリアライズドビューは、指定された主キーの定義に基づいて行の順序と主インデックスから成る**暗黙的に作成されたテーブル**によって支えられています
- 暗黙的に作成されたテーブルは、`SHOW TABLES`クエリによってリストされ、名前は`.inner`で始まります
- マテリアライズドビューに対してバックを決定して明示的に作成されたテーブルを最初に作成し、そのテーブルにターゲットを設定するために、`TO [db].[table]` [句](/sql-reference/statements/create/view.md)を使用することも可能です
- `POPULATE`キーワードを使用して、ソーステーブル[hits_UserID_URL](#a-table-with-a-primary-key)から887万行すべてで暗黙的に作成されたテーブルを即座にポピュレートします
- 新しい行がソーステーブルhits_UserID_URLに挿入されると、それらの行は自動的に暗黙的に作成されたテーブルにも挿入されます
- 実質的に、暗黙的に作成されたテーブルは、私たちが明示的に作成した[セカンダリーテーブル](#multiple-primary-indexes-via-secondary-tables)と同じ行の順序と主インデックスを持つことになります：

<img src={sparsePrimaryIndexes12b1} class="image"/>

ClickHouseは、[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules) (*.mrk2)と[主インデックス](#the-primary-index-has-one-entry-per-granule) (primary.idx)を、ClickHouseサーバーのデータディレクトリ内の特別なフォルダに保存しています：

<img src={sparsePrimaryIndexes12b2} class="image"/>
:::

暗黙的に作成されたテーブル（とその主インデックス）を用いて、URLカラムのフィルタリングを効率的に行う私たちの例のクエリを大幅に高速化することができます：
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

実質的に、暗黙的に作成されたテーブル（とその主インデックス）をバックアップしているマテリアライズドビューは、私たちが明示的に作成した[セカンダリーテーブル](#multiple-primary-indexes-via-secondary-tables)と同じものであり、そのため、クエリは明示的に作成したテーブルと同じように効率的に実行されます。

対応するトレースログはClickHouseサーバーログファイルで確認でき、ClickHouseがインデックスマークのバイナリサーチを実行していることが確認できます：

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

そして、そのプロジェクションをマテリアライズします：
```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note
- プロジェクションは、指定された`ORDER BY`句に基づいて行の順序と主インデックスを持つ**隠れたテーブル**を作成しています
- 隠れたテーブルは、`SHOW TABLES`クエリによってリストされません
- `MATERIALIZE`キーワードを使用して、ソーステーブル[hit_UserID_URL](#a-table-with-a-primary-key)から887万行すべてで隠れたテーブルを即座にポピュレートします
- 新しい行がソーステーブルhits_UserID_URLに挿入されると、それらの行は自動的に隠れたテーブルにも挿入されます
- クエリは常に構文上ソーステーブルhits_UserID_URLをターゲットにしていますが、隠れたテーブルの行の順序と主インデックスがより効率的なクエリ実行を可能にする場合、代わりにその隠れたテーブルが使用されます
- プロジェクションは、プロジェクションの`ORDER BY`が一致する場合でも、`ORDER BY`を使用したクエリの実行効率を向上させることはありません。詳細は、https://github.com/ClickHouse/ClickHouse/issues/47333 を参照してください
- 実質的に、暗黙的に作成された隠れたテーブルは、私たちが明示的に作成した[セカンダリーテーブル](#multiple-primary-indexes-via-secondary-tables)と同じ行の順序と主インデックスを持っています：

<img src={sparsePrimaryIndexes12c1} class="image"/>

ClickHouseは、隠れたテーブルの[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules) (*.mrk2)と[主インデックス](#the-primary-index-has-one-entry-per-granule) (primary.idx)を、ソーステーブルのデータファイル、マークファイル、主インデックスファイルの隣にある特別なフォルダに保存しています：

<img src={sparsePrimaryIndexes12c2} class="image"/>
:::

プロジェクションによって作成された隠れたテーブル（およびその主インデックス）を使用して、URLカラムをフィルタリングする私たちの例のクエリを大幅に高速化できます。クエリは構文上ソーステーブルのプロジェクションをターゲットにしています。
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

レスポンスは次のとおりです：

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

実質的に、プロジェクションによって作成された隠れたテーブル（およびその主インデックス）は、私たちが明示的に作成した[セカンダリーテーブル](#multiple-primary-indexes-via-secondary-tables)と同一であり、そのため、クエリは明示的に作成したテーブルと同じように効率的に実行されます。

対応するトレースログはClickHouseサーバーログファイルで確認でき、ClickHouseがインデックスマーク上でバイナリサーチを実行していることが確認できます：

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

私たちの[主キーを持つテーブル(UserID, URL)](#a-table-with-a-primary-key)の主インデックスは、[UserID](#the-primary-index-is-used-for-selecting-granules)でフィルタリングするクエリを迅速化するために非常に役立ちました。しかし、このインデックスは、URLカラムが複合主キーの一部であるにもかかわらず、[URL](#query-on-url)でフィルタリングするクエリを迅速化する上であまり支援しません。

その逆もまた然り：
私たちの[主キーを持つテーブル(URL, UserID)](#secondary-table)の主インデックスは、[URL](#query-on-url)でフィルタリングするクエリを迅速化しましたが、[UserID](#the-primary-index-is-used-for-selecting-granules)でフィルタリングするクエリの支援にはほとんど役立ちませんでした。

主キーのカラムであるUserIDとURLが類似した高いカーディナリティを持っているため、[2番目のキー列がインデックスに含まれていても、]((#generic-exclusion-search-slow))2番目のキー列でフィルタリングするクエリの利益はあまりありません。

したがって、主インデックスから2番目のキー列を削除することは意味があり（インデックスのメモリ使用量を減らす結果になります）、その代わりに[複数の主インデックスを使用する](#multiple-primary-indexes)必要があります。

しかし、複合主キーのカラムに大きなカーディナリティの違いがある場合、主キーのカラムをカーディナリティの昇順に並べることは、[クエリに対して有益](#generic-exclusion-search-fast)です。

カーディナリティの違いが大きいほど、インデックス内でのカラムの順序が重要になります。次のセクションで、そのことを示します。
## キーカラムを効率的に並べる {#ordering-key-columns-efficiently}

<a name="test"></a>

複合主キーでは、キー列の順序が次の2つに大きく影響します：
- クエリ内のセカンダリキー列でのフィルタリングの効率、および
- テーブルのデータファイルの圧縮率。

それを示すために、インターネットの「ユーザー」（`UserID`カラム）によるURL（`URL`カラム）へのアクセスがボットトラフィックとしてマークされたかどうかを示す3つのカラムを含む私たちの[ウェブトラフィックサンプルデータセット](#data-set)のバージョンを使用します。

私たちは、典型的なウェブ分析クエリを迅速化するために使用されるかもしれない3つの前述のカラムを含む複合主キーを持つテーブルを作成します。これにより、
- 特定のURLへのトラフィックの割合がボットから来ているかどうかを計算したり、
- 特定のユーザーがボットである可能性（ボットトラフィックと見なされないトラフィックの割合）を計算することができます。

私たちは、これらの3つのカラムのカーディナリティを計算するために次のクエリを使用し、複合主キーに使用したいカラムを決定します（ローカルテーブルを作成することなく、TSVデータを即座にクエリできる[URLテーブル関数](/sql-reference/table-functions/url.md)を使用しています）。以下のクエリを`clickhouse client`で実行します：
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

`URL`と`IsRobot`カラムの間に特に大きなカーディナリティの違いがあることがわかります。したがって、複合主キーにおけるこれらのカラムの順序は、これらのカラムでフィルタリングするクエリの効率を向上させるためと、テーブルのカラムデータファイルの圧縮率を最適化するための両方において重要です。

これを実証するために、次の2つのテーブルバージョンを作成します：
- 複合主キー`(URL, UserID, IsRobot)`を持つテーブル`hits_URL_UserID_IsRobot`。ここでは、カーディナリティでキー列を降順に並べます。
- 複合主キー`(IsRobot, UserID, URL)`を持つテーブル`hits_IsRobot_UserID_URL`。ここでは、カーディナリティでキー列を昇順に並べます。

`hits_URL_UserID_IsRobot`テーブルを、複合主キー`(URL, UserID, IsRobot)`で作成します：
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

そして887万行でポピュレートします：
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

次に、複合主キー`(IsRobot, UserID, URL)`を持つ`hits_IsRobot_UserID_URL`テーブルを作成します：
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
そして、前のテーブルで使用したのと同じ887万行でポピュレートします：

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
### セカンダリキー列での効率的なフィルタリング {#efficient-filtering-on-secondary-key-columns}

クエリが少なくとも1つのカラムでフィルタリングを行っている場合、そのカラムが複合キーの1番目のキー列であるときは、ClickHouseはキー列のインデックスマークに対して[バイナリサーチアルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

クエリが（単独で）複合キーの一部であるカラムでフィルタリングを行っている場合、そのカラムが最初のキー列でない場合、ClickHouseはキー列のインデックスマークに対して[一般的な除外検索アルゴリズムを使用します](#secondary-key-columns-can-not-be-inefficient)。

2番目のケースでは、複合主キーのキー列の順序が、[一般的な除外検索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)の効果に影響します。

これは、`hits_URL_UserID_IsRobot`テーブルにおける`UserID`カラムでフィルタリングしているクエリです。キー列をカーディナリティに従い降順に並べています：
```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```
レスポンスは次の通りです：
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.026 sec.
// highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

次は、`IsRobot`、`UserID`、`URL`のキー列をカーディナリティの昇順に並べたテーブルでの同じクエリです：
```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```
レスポンスは次の通りです：
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.
// highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

キー列をカーディナリティの昇順に並べたテーブルでのクエリ実行が、はるかに有効で早いことがわかります。

その理由は、[一般的な除外検索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)は、前のキー列が低いカーディナリティである場合に、セカンダリキー列を介してグラニュールが選択されるときに最も効果的に機能するからです。この点は、前のセクションで詳細に説明しました。
### 最適なデータファイルの圧縮比 {#optimal-compression-ratio-of-data-files}

このクエリは、上で作成した2つのテーブル間での `UserID` カラムの圧縮比を比較します:

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
これがレスポンスです:
```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```
`UserID` カラムの圧縮比が、キーカラム `(IsRobot, UserID, URL)` の順番を基数の昇順で並べたテーブルで大幅に高いことがわかります。

両方のテーブルには全く同じデータが格納されています (同じ 8.87 百万行を両方のテーブルに挿入しました) が、複合主キーのキーカラムの順序が、テーブルの [カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) に必要なディスクスペースに大きな影響を与えます:
- 複合主キー `(URL, UserID, IsRobot)` を持つテーブル `hits_URL_UserID_IsRobot` では、キーカラムを基数に基づいて降順で並べるため、`UserID.bin` データファイルは **11.24 MiB** のディスクスペースを占めます
- 複合主キー `(IsRobot, UserID, URL)` を持つテーブル `hits_IsRobot_UserID_URL` では、キーカラムを基数に基づいて昇順で並べるため、`UserID.bin` データファイルはわずか **877.47 KiB** のディスクスペースしか占めません

テーブルのカラムのデータがディスク上で良好な圧縮比を持つことは、ディスク上のスペースを節約するだけでなく、特に分析用のクエリにおいて、そのカラムからのデータの読み込みに必要な I/O が少なくなるため、クエリの速度を向上させます。

以下では、テーブルのカラムの圧縮比が基数に基づいて昇順で主キーを並べることでなぜ有益であるかを説明します。

以下の図は、主キーのキーカラムが基数に基づいて昇順で並べられた場合のディスク上の行の順序を示しています:
<img src={sparsePrimaryIndexes14a} class="image"/>

私たちは、[テーブルの行データが主キーのカラムで順序付けられてディスクに保存されている](#data-is-stored-on-disk-ordered-by-primary-key-columns)ことを議論しました。

上の図では、テーブルの行 (ディスク上のカラム値) はまず `cl` 値に基づいて順序付けされ、同じ `cl` 値を持つ行は `ch` 値に基づいて順序付けされます。そして、最初のキーカラム `cl` が低基数であるため、同じ `cl` 値を持つ行が存在する可能性が高くなります。そのため、`ch` 値が (局所的に - 同じ `cl` 値を持つ行に対して) 順序付けされる可能性も高いです。

あるカラムで、似たデータが近接して配置される場合、例えばソートを通じて、そうしたデータはより良く圧縮されます。
一般的に、圧縮アルゴリズムはデータのランレングスを利用します (より多くのデータを見るほど圧縮が良くなります)。
そして、局所性 (データがより類似しているほど、圧縮比が良くなる) が有利です。

上の図とは対照的に、以下の図は、主キーのキーカラムが基数に基づいて降順で並べられた場合のディスク上の行の順序を示しています:
<img src={sparsePrimaryIndexes14b} class="image"/>

ここでは、テーブルの行がまず `ch` 値に基づいて順序付けされ、同じ `ch` 値を持つ行は `cl` 値に基づいて順序付けされます。
しかし、最初のキーカラム `ch` が高基数であるため、同じ `ch` 値を持つ行が存在する可能性は低く、したがって `cl` 値が (同じ `ch` 値を持つ行に対して) 順序付けされる可能性も低くなります。

そのため、`cl` 値はおそらくランダムな順序になっており、結果として良好な局所性や圧縮比が得られないでしょう。
### 要約 {#summary-1}

クエリにおけるセカンダリキー列の効率的なフィルタリングと、テーブルのカラムデータファイルの圧縮比の両方において、主キーのカラムを基数に基づいて昇順で並べることが有益です。
### 関連コンテンツ {#related-content-1}
- ブログ: [ClickHouseクエリの高速化](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## 単一行を効率的に特定する {#identifying-single-rows-efficiently}

一般的には、ClickHouseの最適な使用ケースでは [ない](https://knowledgebase/key-value) ですが、
時にはClickHouseの上に構築されたアプリケーションが、ClickHouseテーブルの単一行を特定する必要があります。

そのために直感的なソリューションは、行ごとにユニークな値を持つ [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) カラムを使用し、行の取得を迅速に行うためにそのカラムを主キーに使用することかもしれません。

最も迅速な取得のためには、UUIDカラム [は最初のキーカラムである必要があります](#the-primary-index-is-used-for-selecting-granules)。

私たちは、[ClickHouseテーブルの行データが主キーで順序付けられてディスクに保存されている](#data-is-stored-on-disk-ordered-by-primary-key-columns)ため、非常に高い基数のカラム (UUIDカラムなど) が主キーまたは複合主キーの前にあると、[他のテーブルカラムの圧縮比にとって悪影響を及ぼす](#optimal-compression-ratio-of-data-files)ことを議論しました。

取得の迅速さとデータ圧縮の最適化の間の妥協は、UUIDを最後のキーカラムとして持つ複合主キーを使用し、低基数のキーカラムを使用してテーブルの一部のカラムの良好な圧縮比を確保することです。
### 具体的な例 {#a-concrete-example}

具体的な例として、Alexey Milovidovが開発し、[ブログにも書いた](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/)プレーンテキストのペーストサービス https://pastila.nl があります。

テキストエリアが変更されるたびに、データは自動的に ClickHouse テーブルの行に保存されます (変更ごとに1行)。

貼り付けられた内容の (特定のバージョンの) 特定と取得を行う方法の1つは、その内容のハッシュをテーブル行のUUIDとして使用することです。

以下の図は、
- 内容が変更されるときの行の挿入順 (テキストエリアにテキストを入力しているためのキーストロークによる) と
- `PRIMARY KEY (hash)` を使用した際の挿入された行のディスク上のデータの順序を示しています:
<img src={sparsePrimaryIndexes15a} class="image"/>

`hash` カラムが主キーカラムとして使用されているため
- 特定の行を [非常に迅速に](#the-primary-index-is-used-for-selecting-granules)取得することができますが、
- テーブルの行 (そのカラムデータ) は、ディスク上で (ユニークでランダムな) ハッシュ値に基づいて昇順で保存されているため、コンテンツカラムの値もランダムな順序で保存されており、良好なデータ局所性がない結果として **コンテンツカラムのデータファイルの圧縮比は最適ではありません**。

特定の行の圧縮比を大幅に改善しつつ、依然として迅速なデータ取得を実現するために、pastila.nl では特定の行を識別するために2つのハッシュ (および複合主キー) を使用しています:
- 上記のように、異なるデータに対して異なるハッシュを持つコンテンツのハッシュと、
- データの小さな変更で **変わらない** [局所感度ハッシュ (フィンガープリント)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)。

以下の図は、
- 内容が変更されるときの行の挿入順 (テキストエリアにテキストを入力しているためのキーストロークによる) と
- 複合 `PRIMARY KEY (fingerprint, hash)` を使用した際の挿入された行のディスク上のデータの順序を示しています:

<img src={sparsePrimaryIndexes15b} class="image"/>

ここでは、ディスク上の行が最初に `fingerprint` に基づいて順序付けされ、同じフィンガープリント値を持つ行では `hash` 値が最終的な順序を決定します。

小さな変化だけで異なるデータが同じフィンガープリント値を取得できるため、似たデータが今、ディスク上のコンテンツカラムに近接して保存されています。このことは、圧縮アルゴリズムが一般的にデータ局所性から利益を得るため (データがより類似しているほど圧縮比が良くなる)、非常に良好です。

妥協点は、特定の行を最適に取得するために `fingerprint` と `hash` の2つのフィールドが必要になることです。
