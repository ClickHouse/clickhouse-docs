---
sidebar_label: 主キーインデックス
sidebar_position: 1
description: このガイドでは、ClickHouseのインデックスについて深く掘り下げていきます。
---


# ClickHouseにおける主キーインデックスの実用的な紹介

## はじめに {#introduction}

このガイドでは、ClickHouseのインデックスについて深く掘り下げていきます。以下の点について詳細に説明します：
- [ClickHouseのインデックスが従来のリレーショナルデータベース管理システムとどう異なるか](#an-index-design-for-massive-data-scales)
- [ClickHouseがテーブルのスパース主キーインデックスをどのように構築し、利用しているか](#a-table-with-a-primary-key)
- [ClickHouseでのインデックス作成に関するベストプラクティスのいくつか](#using-multiple-primary-indexes)

このガイドに記載されている全てのClickHouse SQL文やクエリは、オプションで自己のマシン上で実行できます。
ClickHouseのインストールと開始方法については、[クイックスタート](/quick-start.mdx)を参照してください。

:::note
このガイドでは、ClickHouseのスパース主キーインデックスに焦点を当てています。

ClickHouseの[セカンダリデータスキッピングインデックス](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)については、[チュートリアル](/guides/best-practices/skipping-indexes.md)を参照してください。
:::


### データセット {#data-set}

このガイドを通じて、サンプルの匿名化されたウェブトラフィックデータセットを使用します。

- サンプルデータセットの中から887万行（イベント）のサブセットを使用します。
- 非圧縮データサイズは887万イベントで、約700 MBです。ClickHouseに保存すると200 MBに圧縮されます。
- サブセット内の各行は、特定の時間（`EventTime`カラム）にURL（`URL`カラム）をクリックしたインターネットユーザー（`UserID`カラム）を示す3つのカラムを含んでいます。

これらの3つのカラムを使って、次のような典型的なウェブ分析クエリを構築できます。

- 「特定のユーザーによってクリックされた上位10のURLは何ですか？」
- 「特定のURLを最も頻繁にクリックした上位10のユーザーは誰ですか？」
- 「特定のURLをクリックするユーザーにとって最も人気のある時間（例：週の日）はいつですか？」

### テストマシン {#test-machine}

この文書で示された全ての実行時数値は、Apple M1 Proチップと16GB RAMを搭載したMacBook Pro上でClickHouse 22.2.1を実行したものに基づいています。


### フルテーブルスキャン {#a-full-table-scan}

主キーのないデータセットに対してクエリを実行する方法を見てみるために、次のSQL DDL文を実行してテーブル（MergeTreeテーブルエンジンを使用）を作成します：

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



次に、以下のSQL挿入文を使用してヒットデータセットのサブセットをテーブルに挿入します。
これは、リモートでホストされている完全なデータセットからサブセットを読み込むために[URLテーブル関数](/sql-reference/table-functions/url.md)を使用します：

```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
応答は以下の通りです：
```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```


ClickHouseクライアントの結果出力は、上記の文が887万行をテーブルに挿入したことを示しています。

最後に、このガイドでの後の議論を簡素化し、図と結果を再現可能にするために、テーブルを[最適化](/sql-reference/statements/optimize.md)します。FINALキーワードを使用して以下のようにします：

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
一般的には、データをロードした後にテーブルを即座に最適化することは推奨されません。この例でこれが必要な理由は後で明らかになります。
:::


次に、最初のウェブ分析クエリを実行します。以下は、UserID 749927693を持つインターネットユーザーに対して最もクリックされた上位10のURLを計算しています：

```sql
SELECT URL, count(URL) as Count
FROM hits_NoPrimaryKey
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```
応答は以下の通りです：
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


ClickHouseクライアントの結果出力は、ClickHouseがフルテーブルスキャンを実行したことを示しています！887万行すべてがClickHouseにストリーミングされました。これはスケールしません。

これを（はるかに）効率的かつ（はるかに）速くするためには、適切な主キーを持つテーブルを使用する必要があります。これにより、ClickHouseは自動的に（主キーのカラムに基づいて）スパース主キーインデックスを作成し、そのインデックスを使って例示したクエリの実行を大幅に加速できます。

### 関連コンテンツ {#related-content}
- ブログ: [ClickHouseのクエリを高速化する](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)


## ClickHouseのインデックス設計 {#clickhouse-index-design}



### 大規模データ用のインデックス設計 {#an-index-design-for-massive-data-scales}

従来のリレーショナルデータベース管理システムでは、主インデックスはテーブル行ごとに1つのエントリを含みます。このため、主インデックスには887万エントリが含まれることになります。このようなインデックスは、特定の行を迅速に検索できるため、ルックアップクエリやポイント更新の際に高い効率を持ちます。`B(+)-Tree`データ構造でのエントリの検索は、平均時間計算量が`O(log n)`であり、より正確には`log_b n = log_2 n / log_2 b`で、ここで`b`は`B(+)-Tree`の分岐係数であり、`n`はインデックスされる行の数です。通常、`b`は数百から数千の間であるため、`B(+)-Trees`は非常に浅い構造であり、レコードを見つけるためのディスクアクセスは少なくなります。887万行と分岐係数1000の場合、平均して2.3回のディスクシークが必要です。この能力はコストがかかります：追加のディスクおよびメモリオーバーヘッド、新しい行をテーブルに追加する際のより高い挿入コスト、および時にはB-Treeの再バランスが必要になります。

B-Treeインデックスに関連する課題を考えると、ClickHouseのテーブルエンジンは異なるアプローチを利用しています。ClickHouseの[MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family/index.md)は、大規模データボリュームを処理するように設計され、最適化されています。これらのテーブルは、1秒あたり数百万行の挿入を受け入れ、非常に大規模なデータ（数ペタバイト）を保存するように設計されています。データは、[パーツごとに迅速に](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)テーブルに書き込まれ、パーツをバックグラウンドで結合するためのルールが適用されます。ClickHouseでは各パーツに自身の主インデックスがあります。パーツがマージされると、マージされたパーツの主インデックスも結合されます。ClickHouseが大量のデータを処理するために設計されているため、ディスクとメモリの効率は非常に重要です。そのため、すべての行をインデックスするのではなく、パーツの主インデックスには1つのインデックスエントリ（「マーク」として知られる）が行のグループ（「グラニュール」と呼ばれる）ごとに設定され、この手法は**スパースインデックス**と呼ばれます。

スパースインデックスは、ClickHouseがパーツの行をディスクに主キーのカラムごとに順序付けて保存しているため、可能です。単一の行を直接特定するのではなく（B-Treeベースのインデックスのように）、スパース主インデックスはインデックスエントリ上での二分探索を介して、クエリと一致する可能性のある行のグループを迅速に特定できます。特定された一致の可能性がある行のグループ（グラニュール）は、その後、さらに一致を見つけるためにClickHouseエンジンに並行してストリーミングされます。このインデックス設計により、主インデックスは小さく（メインメモリに完全に収まることができ、そうする必要があります）、クエリ実行時間を大幅に短縮します：特にデータ分析のユースケースで典型的な範囲クエリにおいてです。

以下は、ClickHouseがスパース主インデックスをどのように構築し、利用するかを詳細に示します。後のセクションでは、インデックスを構築するために使用されるテーブルカラム（主キーのカラム）の選択、削除、および順序に関するいくつかのベストプラクティスについて議論します。

### 主キーを持つテーブルの作成 {#a-table-with-a-primary-key}

`UserID`と`URL`のキーカラムを持つ複合主キーを持つテーブルを作成します：

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

このガイドでの後の議論を簡素化し、図と結果を再現可能にするために、DDLステートメントは次のことを指定します：

<ul>
  <li>
    <code>ORDER BY</code>句を介してテーブルの複合ソートキーを指定します。
  </li>
  <li>
    設定を通じて、主インデックスが持つインデックスエントリの数を明示的に制御します：
    <ul>
      <li>
        <code>index_granularity</code>: そのデフォルト値である8192に明示的に設定されています。これは、8192行ごとに主インデックスが1つのインデックスエントリを持つことを意味します。たとえば、テーブルに16384行がある場合、インデックスは2つのインデックスエントリを持ちます。
      </li>
      <li>
        <code>index_granularity_bytes</code>: <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">アダプティブインデックスの粒度</a>を無効にするために0に設定されています。アダプティブインデックスの粒度は、次のいずれかが真である場合、ClickHouseがn行のグループごとに自動的に1つのインデックスエントリを生成することを意味します：
        <ul>
          <li>
            <code>n</code>が8192未満で、その<code>n</code>行の結合された行データのサイズが10 MB（<code>index_granularity_bytes</code>のデフォルト値）以上である場合。
          </li>
          <li>
            <code>n</code>行の結合された行データのサイズが10 MB未満であるが、<code>n</code>が8192である場合。
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">主インデックスの圧縮</a>を無効にするために0に設定されています。これにより、後でその内容をオプションで検査できます。
      </li>
    </ul>
  </li>
</ul>

</p>
</details>


上記のDDLステートメントの主キーは、指定された2つのキーカラムに基づいて主インデックスを生成します。

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
応答は以下の通りです：
```response
0 rows in set. Elapsed: 149.432 sec. Processed 8.87 million rows, 18.40 GB (59.38 thousand rows/s., 123.16 MB/s.)
```


<br/>
そしてテーブルを最適化します：

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br/>
テーブルのメタデータを取得するために、以下のクエリを使用できます：

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

応答は次の通りです：

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

- テーブルのデータは、特定のディレクトリ内に[ワイドフォーマット](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)で保存されており、そのディレクトリ内の各列に対して1つのデータファイル（および1つのマークファイル）があります。
- テーブルには887万行があります。
- 全行を合わせた非圧縮データサイズは733.28 MBです。
- 全行を合わせたディスク上の圧縮サイズは206.94 MBです。
- テーブルには1083エントリ（「マーク」と呼ばれる）の主インデックスがあり、そのインデックスのサイズは96.93 KBです。
- 合計して、テーブルのデータとマークファイルおよび主インデックスファイルは207.07 MBをディスク上で消費しています。

### データは主キーのカラムで順序付けてディスクに保存される {#data-is-stored-on-disk-ordered-by-primary-key-columns}

上記で作成したテーブルには次の特徴があります：
- 複合[主キー](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` と、
- 複合[ソートキー](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)` です。

:::note
- もしソートキーだけを指定していた場合、主キーは暗黙的にソートキーと等しく設定されます。

- メモリ効率を考慮して、クエリがフィルター処理するカラムのみを含む主キーを明示的に指定しました。主キーに基づく主インデックスは、メインメモリに完全にロードされます。

- ガイドの図に一貫性を持たせ、圧縮率を最大化するために、テーブルの全カラムを含む別のソートキーを定義しました（同じカラムに類似のデータが近づけて配置される場合、例えばソートによって、そのデータはより良く圧縮されます）。

- 主キーは、両方が指定されている場合、ソートキーのプレフィックスである必要があります。
:::


挿入された行は、主キーのカラム（およびソートキーからの追加の`EventTime`カラム）によって昇順でディスクに格納されます。

:::note
ClickHouseでは、主キーカラム値が同じである複数の行を挿入することが可能です。この場合（下の図の行1と行2を参照）、最終的な順序は指定されたソートキーによって決まり、そのために`EventTime`カラムの値が影響します。
:::



ClickHouseは<a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">列指向のデータベース管理システム</a>です。下の図に示すように
- ディスク上の表現では、各テーブルカラムごとに単一のデータファイル（*.bin）があり、そのカラムの全値が<a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮</a>された形式で保存されており、 
- 887万行がディスク上で主キーのカラム（および追加のソートキーのカラム）によって昇順で保存されています。つまり、この場合
  - まず`UserID`によって、
  - 次に`URL`によって、
  - 最後に`EventTime`によって順序付けられています：

<img src={require('./images/sparse-primary-indexes-01.png').default} class="image"/>

`UserID.bin`、`URL.bin`、および`EventTime.bin`は、`UserID`、`URL`、および`EventTime`カラムの値が保存されているディスク上のデータファイルです。

<br/>
<br/>


:::note
- 主キーがディスク上の行の辞書順の順序を決定するため、テーブルには1つの主キーしか持てません。

- 行の番号は、ClickHouseの内部行番号付け方式に合わせるために0から始めています。この方式は、ログメッセージで使用されるのと同じです。
:::



### データはグラニュールに組織されており、並列データ処理用に準備されている {#data-is-organized-into-granules-for-parallel-data-processing}

データ処理の目的で、テーブルのカラム値は論理的にグラニュールに分割されています。
グラニュールは、ClickHouseにストリーミングされて処理される最小の分割不可能なデータセットです。
つまり、ClickHouseは個々の行を読み取るのではなく、常に行のグループ（グラニュール）全体をストリーミング方式で並行して読み取ります。
:::note
カラム値は実際にはグラニュール内には物理的に保存されていません：グラニュールは、クエリ処理のためのカラム値の論理的な編成に過ぎません。
:::

以下の図は、テーブルのDDLステートメントに`index_granularity`（デフォルト値の8192に設定）が含まれている結果として、887万行の（カラム値の）組織を1083のグラニュールに示しています。

<img src={require('./images/sparse-primary-indexes-02.png').default} class="image"/>

最初の（物理的にディスク上の順序に基づく）8192行（そのカラム値）は論理的にグラニュール0に属し、その後の8192行（そのカラム値）はグラニュール1に属し、そのように進んでいきます。

:::note
- 最後のグラニュール（グラニュール1082）は8192行未満を「含む」場合があります。

- ガイドの最初に「DDLステートメントの詳細」で述べたように、アダプティブインデックスの粒度を[無効](/whats-new/changelog/2019.md/#experimental-features-1)に設定しました（このガイドでは議論を簡素化し、図と結果を再現可能にするため）。
  そのため、対象の例の各グラニュールはすべて同じサイズです。

- アダプティブインデックスの粒度（デフォルトで[適応的](/engines/table-engines/mergetree-family/mergetree.md/#index_granularity_bytes)）のあるテーブルの場合、いくつかのグラニュールのサイズは行データサイズに応じて8192行未満になる可能性があります。



- 主キーのカラム値から選択された一部のカラム値（`UserID`、`URL`）がオレンジ色でマークされています。
  これらのオレンジ色でマークされたカラム値は、各グラニュールの最初の行の主キーのカラム値です。
  以下で示すように、これらのオレンジ色でマークされたカラム値が、テーブルの主インデックスのエントリになります。

- グラニュールを0から数え始めて、ClickHouseの内部番号付け方式に合わせています。この方式は、ログメッセージで使用されるのと同じです。
:::



### 主インデックスにはグラニュールごとに1エントリがある {#the-primary-index-has-one-entry-per-granule}

主インデックスは、上記の図に示されたグラニュールに基づいて作成されます。このインデックスは、数値インデックスマークと呼ばれる、0から始まる未圧縮のフラット配列ファイル（primary.idx）です。
以下の図は、インデックスが上記の図での各グラニュールの最初の行の主キーカラム値（オレンジ色でマークされた値）を保存していることを示しています。
言い換えれば、主インデックスは、テーブルの各8192行ごとの主キーのカラム値を保存します（これは、主キーのカラムによって定義された物理行の順序に基づく）。
たとえば、
- 最初のインデックスエントリ（以下の図の「マーク0」）は、上記の図でのグラニュール0の最初の行のキーのカラム値を保存しています。
- 2番目のインデックスエントリ（以下の図の「マーク1」）は、上記の図でのグラニュール1の最初の行のキーのカラム値を保存しています。そのように続きます。



<img src={require('./images/sparse-primary-indexes-03a.png').default} class="image"/>

このインデックスには、887万行および1083のグラニュールを持つテーブルのために合計1083エントリがあります：

<img src={require('./images/sparse-primary-indexes-03b.png').default} class="image"/>

:::note
- [アダプティブインデックスの粒度](/whats-new/changelog/2019.md/#experimental-features-1)を持つテーブルでは、最後のテーブル行の主キーカラムの値を記録するために、主インデックスにも1つの「最終」追加マークが保存されますが、これはアダプティブインデックスの粒度を無効にしたため（このガイドでは議論を簡素化し、図と結果を再現可能にするため）、対象の例のインデックスにはこの最終的なマークは含まれていません。

- 主インデックスファイルはメインメモリに完全にロードされます。ファイルが利用可能な空きメモリスペースよりも大きい場合、ClickHouseはエラーを発生させます。
:::

<details>
    <summary>
    主インデックスの内容の検査
    </summary>
    <p>

セルフマネージドのClickHouseクラスターでは、例のテーブルの主インデックスの内容を検査するために、<a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">ファイルテーブル関数</a>を使用できます。

そのため、まず、実行中のクラスターのノードの<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a>に主インデックスファイルをコピーする必要があります：
<ul>
<li>ステップ1: 主インデックスファイルを含むパートパスを取得します</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`


は、テストマシンで`/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`を返します。

<li>ステップ2: user_files_pathを取得します</li>
デフォルトの<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">user_files_path</a>は、Linuxで
`/var/lib/clickhouse/user_files/`です。

そして、Linux上では変更があったかどうかを確認できます： `$ grep user_files_path /etc/clickhouse-server/config.xml`

テストマシンのパスは`/Users/tomschreiber/Clickhouse/user_files/`です。


<li>ステップ3: 主インデックスファイルをuser_files_pathにコピーします</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

<br/>

</ul>

今、SQLを介して主インデックスの内容を検査できます：
<ul>
<li>エントリの数量を取得します</li>
`
SELECT count( )<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String');
`

<br/>
<br/>
は`1083`を返します。
<br/>
<br/>
<li>最初の2つのインデックスマークを取得します</li>
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
<li>最後のインデックスマークを取得します</li>
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

これは、例のテーブルの主インデックス内容の図と完全に一致します：
<img src={require('./images/sparse-primary-indexes-03b.png').default} class="image"/>
</p>
</details>


主キーのエントリは、各インデックスエントリが特定のデータ範囲の開始をマークしていることから「インデックスマーク」と呼ばれます。具体的には例のテーブルに関して：
- UserIDインデックスマーク：<br/>
  主インデックスに保存されている`UserID`値は、昇順にソートされています。<br/>
  図中の「マーク1」は、グラニュール1およびその後のすべてのテーブル行の`UserID`値が4,073,710以上であることを示しています。

 [後で見るように](#the-primary-index-is-used-for-selecting-granules)、このグローバルオーダーは、クエリが主キーの最初のカラムでフィルタリングされるときに、ClickHouseが<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索アルゴリズム</a>を使用することを可能にします。

- URLインデックスマーク：<br/>
主キーのカラムである`UserID`と`URL`のほぼ同様のカーディナリティは、一般的に、最初のカラムのキー値が、現在のグラニュール内のすべてのテーブル行で同じである限り、すべての後続のカラムに対するインデックスマークがデータ範囲を示すことを意味します。
例えば、上記の図で mark 0 と mark 1 の UserID 値が異なるため、ClickHouse は granule 0 内のすべてのテーブル行の URL 値が `'http://showtopics.html%3...'` より大きいか等しいと仮定することができません。しかし、もし mark 0 と mark 1 の UserID 値が同じであれば（つまり、granule 0 内のすべてのテーブル行の UserID 値が同じであれば）、ClickHouse は granule 0 内のすべてのテーブル行の URL 値が `'http://showtopics.html%3...'` より大きいか等しいと仮定できます。

このクエリ実行性能への影響については後ほど詳しく説明します。

### 主キーインデックスはグラニュールを選択するために使用されます {#the-primary-index-is-used-for-selecting-granules}

これで、主キーインデックスのサポートを使用してクエリを実行できます。

次のクエリは、UserID 749927693 に対する最もクリックされた上位 10 の URL を計算します。

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

応答は次のようになります。

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

10 行がセットされました。経過時間: 0.005 秒。
// highlight-next-line
処理した行数: 8.19 千行、
740.18 KB (1.53 百万行/s., 138.59 MB/s.)
```

ClickHouse クライアントの出力は、全テーブルスキャンを実行する代わりに、8.19 千行のみが ClickHouse にストリームされていることを示しています。

もし <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">トレースログ</a> が有効になっていると、ClickHouse サーバーログファイルには、ClickHouse が `749927693` の UserID カラム値を持つ行を含む可能性があるグラニュールを特定するために <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">バイナリサーチ</a> を実行していることが記録されています。これには、平均時間計算量 `O(log2 n)` で 19 ステップが必要です：
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

上記のトレースログから、1083 個の既存のマークのうち 1 つがクエリを満たしていることがわかります。

<details>
    <summary>
    トレースログ詳細
    </summary>
    <p>

マーク 176 が特定されました（「見つかった左境界マーク」は包含的、「見つかった右境界マーク」は排他的です）、そのため、実際の行が `749927693` の UserID カラム値を持つ行を見つけるために、granule 176 のすべて 8192 行が ClickHouse にストリームされます（このトピックについては後でガイドで詳しく説明します）。
</p>
</details>

以下のように、<a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN 句</a> を使用してこれを再現することもできます：
```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

応答は次のようになります。

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

16 行がセットされました。経過時間: 0.003 秒。
```
クライアント出力は、1083 個のグラニュールのうち 1 つが UserID カラム値が 749927693 の行を含む可能性があるとして選択されたことを示しています。

:::note 結論
クエリが複合キーの一部であり、最初のキー列であるカラムをフィルタリングしている場合、ClickHouse はキー列のインデックスマークに対してバイナリサーチアルゴリズムを実行しています。
:::

<br/>

上記の通り、ClickHouse はスパース主キーインデックスを使用して、クエリに一致する行を含む可能性のあるグラニュールを迅速に（バイナリサーチで）選択しています。

これが ClickHouse のクエリ実行の **第一段階（グラニュール選択）** です。

**第二段階（データ読み込み）** では、ClickHouse が選択されたグラニュールを見つけ出し、すべての行を ClickHouse エンジンにストリームして、実際にクエリに一致する行を見つけます。

この第二段階については、次のセクションで詳しく説明します。



### マークファイルはグラニュールを見つけるために使用されます {#mark-files-are-used-for-locating-granules}

以下の図は、当テーブルの主キーインデックスファイルの一部を示しています。

<img src={require('./images/sparse-primary-indexes-04.png').default} class="image"/>

上記の通り、インデックスの 1083 UserID マークに対するバイナリサーチを通じて、マーク 176 が特定されました。その対応するグラニュール 176 には、UserID カラムの値が 749.927.693 の行が含まれる可能性があります。

<details>
    <summary>
    グラニュール選択詳細
    </summary>
    <p>

上記の図は、マーク 176 が関連付けられたグラニュール 176 の最小 UserID 値が 749.927.693 より小さく、次のマーク（マーク 177）の最小 UserID 値がこの値より大きい最初のインデックスエントリであることを示しています。したがって、マーク 176 の対応するグラニュール 176 には、UserID カラムの値が 749.927.693 の行が含まれる可能性があります。
</p>
</details>

グラニュール 176 にある行が UserID カラム値 749.927.693 を含んでいるかどうかを確認するには、全 8192 行が ClickHouse にストリームされる必要があります。

これを実現するには、ClickHouse はグラニュール 176 の物理的な位置を知っている必要があります。

ClickHouse では、テーブルのすべてのグラニュールの物理的位置はマークファイルに保存されます。データファイルと同様に、各テーブルカラムに対して 1 つのマークファイルがあります。

次の図は、テーブルの `UserID`、`URL`、`EventTime` カラムのグラニュールの物理的位置を保存する 3 つのマークファイル `UserID.mrk`、`URL.mrk`、`EventTime.mrk` を示しています。
<img src={require('./images/sparse-primary-indexes-05.png').default} class="image"/>

主キーインデックスは、0 から始まる番号が付けられたインデックスマークを含む平坦な未圧縮配列ファイル（primary.idx）であることを前述しました。

同様に、マークファイルも 0 から始まる番号が付けられたインデックスマークを含む平坦な未圧縮配列ファイル (*.mrk) です。

ClickHouse が、クエリに一致する行を含む可能性のあるグラニュールのインデックスマークを特定し選択した後、マークファイルで位置配列のルックアップを行い、グラニュールの物理的位置を取得することができます。

特定のカラムの各マークファイルエントリは、オフセットの形で 2 つの位置を保存しています：

- 最初のオフセット（上記の図の 'block_offset'）は、選択したグラニュールの圧縮されたバージョンを含む <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">ブロック</a> を <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">圧縮された</a> カラムデータファイル内で特定するものです。この圧縮ブロックは、いくつかの圧縮されたグラニュールを含む可能性があります。特定された圧縮ファイルブロックは読み取り時にメインメモリに解凍されます。

- マークファイルの 2 番目のオフセット（上記の図の 'granule_offset'）は、圧縮解除されたブロックデータ内のグラニュールの位置を提供します。

位置が特定された未圧縮グラニュールに属する全 8192 行は、さらなる処理のために ClickHouse にストリームされます。

:::note

- [ワイドフォーマット](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)のテーブルと、[適応インデックス粒度](/whats-new/changelog/2019.md/#experimental-features-1)なしのテーブルでは、ClickHouse は上記のように、各エントリに 8 バイトのアドレスを 2 つ含むエントリを持つ `.mrk` マークファイルを使用します。これらのエントリは、すべて同じサイズを持つグラニュールの物理的位置です。

インデックスの粒度は [デフォルトで適応的です](/engines/table-engines/mergetree-family/mergetree.md/#index_granularity_bytes) が、当例のテーブルでは（本ガイドでの議論を簡素化し、図と結果を再現可能とするために）適応インデックスの粒度を無効にしました。当テーブルは、データサイズが [min_bytes_for_wide_part](/engines/table-engines/mergetree-family/mergetree.md/#min_bytes_for_wide_part)（デフォルトは 10 MB、セルフマネージドクラスター用）より大きいため、ワイドフォーマットを使用しています。

- ワイドフォーマットのテーブルで、適応インデックス粒度を持つ場合、ClickHouse は `.mrk2` マークファイルを使用します。これは `.mrk` マークファイルと似たエントリを含んでいますが、現在のエントリに関連づけられたグラニュールの行数という第三の値が加わります。

- [コンパクトフォーマット](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)のテーブルでは、ClickHouse は `.mrk3` マークファイルを使用します。

:::


:::note マークファイルの理由

なぜ主キーインデックスは、インデックスマークに対応するグラニュールの物理的位置を直接含まないのでしょうか？

ClickHouse が設計された非常に大規模なスケールでは、ディスクおよびメモリの効率を非常に高く保つことが重要です。

主キーインデックスファイルはメインメモリに収まる必要があります。

例のクエリにおいて、ClickHouse は主キーインデックスを使用して、クエリに一致する行を含む可能性のある単一のグラニュールを選択しました。その単一のグラニュールに対してのみ、ClickHouse は対応する行をストリームするための物理的位置が必要です。

さらに、このオフセット情報は UserID および URL カラムに対してのみ必要です。

クエリで使用されていないカラム、例えば `EventTime` にオフセット情報は必要ありません。

サンプルクエリでは、ClickHouse は UserID データファイル (UserID.bin) のグラニュール 176 に対する 2 つの物理的な位置オフセットと、URL データファイル (URL.bin) のグラニュール 176 に対する 2 つの物理的な位置オフセットのみが必要です。

マークファイルによって提供される間接性は、主キーインデックス内に 1083 のすべてのグラニュールの物理位置のエントリを直接保存することを避けます。これにより、メインメモリ内に不要（使用されていない可能性がある）データが保管されることを回避します。
:::

次の図と以下のテキストは、例のクエリに対して ClickHouse が UserID.bin データファイル内のグラニュール 176 を特定する方法を示しています。

<img src={require('./images/sparse-primary-indexes-06.png').default} class="image"/>

本ガイドの以前の部分で、ClickHouse は主キーインデックスマーク 176 を選択し、その結果、グラニュール 176 がクエリに一致する行を含む可能性があると特定しました。

ClickHouse は、選択されたマーク番号 (176) をインデックスから使用して、UserID.mrk マークファイル内で位置配列のルックアップを行い、グラニュール 176 の物理的位置を特定するための 2 つのオフセットを取得します。

上記のように、最初のオフセットは UserID.bin データファイル内の圧縮ファイルブロックを特定し、続いてその圧縮ブロック内のグラニュール 176 を特定するためにマークファイルの 2 番目のオフセットを使用します。

ClickHouse は、例のクエリ（UserID 749927693 のインターネットユーザーによる最もクリックされた URL 上位 10 の計算）の実行のために、UserID.bin データファイルおよび URL.bin データファイルの両方からグラニュール 176 を特定（およびすべての値をストリーム）する必要があります。

上記の図は、ClickHouse が UserID.bin データファイルのグラニュールを特定する方法を示しています。

同時に、ClickHouse は URL.bin データファイルのグラニュール 176 に対しても同様のことを行います。これらの 2 つのグラニュールは整列され、ClickHouse エンジンにストリームされ、最終的に UserID が 749927693 であるすべての行に対して URL 値を集計し、カウントして、最終的にカウント順に上位 10 の大きな URL グループを出力します。


## 複数主キーインデックスの使用 {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>

### 二次キー列は効率的でない可能性があります {#secondary-key-columns-can-not-be-inefficient}


クエリが複合キーの一部であり、最初のキー列であるカラムをフィルタリングしている場合、[ClickHouse はキー列のインデックスマークに対してバイナリサーチアルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

しかし、クエリが複合キーの一部ではあるものの、最初のキー列でないカラムをフィルタリングするとどうなりますか？

:::note
ここでは、クエリが明示的に最初のキー列でなく、二次キー列でフィルタリングされるシナリオを議論します。

クエリが最初のキー列と、その後の任意のキー列の両方をフィルタリングすると、ClickHouse は最初のキー列のインデックスマークに対してバイナリサーチを実行します。
:::

<br/>
<br/>

<a name="query-on-url"></a>
ここで、URL "http://public_search" に最も頻繁にクリックした上位 10 のユーザーを計算するクエリを使用します。

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

応答は以下の通りです：<a name="query-on-url-slow"></a>
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

10 行がセットされました。経過時間: 0.086 秒。
// highlight-next-line
処理した行数: 8.81 百万行、
799.69 MB (102.11 百万行/s., 9.27 GB/s.)
```

クライアント出力は、ClickHouse が複合主キーの一部である [URL カラム] がフィルタリングされているにもかかわらず、ほぼ全テーブルスキャンを実行したことを示しています！ClickHouse は 8.87 百万行のうち、8.81 百万行を読み込みました。

もし [trace_logging](/operations/server-configuration-parameters/settings.md/#server_configuration_parameters-logger) が有効になっていれば、ClickHouse サーバーログファイルには、ClickHouse が "http://public_search" の URL 値を持つ行を含む可能性があるグラニュールを特定するために、1083 の URL インデックスマークに対して <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">汎用排除検索</a> を使用したことが記録されています：
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
上記のサンプルトレースログでわかるように、1083 のうち 1076 のマークが、URL の値が "http://public_search" に一致する行を含む可能性のあるグラニュールとして選択されました。

この結果、8.81 百万行が ClickHouse エンジンにストリームされることとなります（10 ストリームを使って並列処理されます）、そして "http://public_search" の URL 値を持つ行を実際に特定します。

しかし、[後で見られるように](#query-on-url-fast)、選択された 1076 のグラニュールのうち、実際に一致する行を含むのは 39 のグラニュールだけです。

複合主キー (UserID, URL) に基づく主キーインデックスは、特定の UserID 値を持つ行のフィルタリングには有用ですが、特定の URL 値を持つ行のフィルタリングを高速化するためにはほとんど役に立ちません。

その理由は、URL カラムが最初のキー列でないため、ClickHouse が URL カラムのインデックスマークに対してバイナリサーチではなく、汎用排除検索アルゴリズムを使用しており、**そのアルゴリズムの効果は、URL カラムとその前のキー列 UserID の間のカーディナリティの差に依存しています**。

これを説明するために、汎用排除検索がどのように機能するかについての詳細を示します。

<a name="generic-exclusion-search-algorithm"></a>

### 汎用排除検索アルゴリズム {#generic-exclusion-search-algorithm}

以下は、<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank">ClickHouse の汎用排除検索アルゴリズム</a> が、前のキー列のカーディナリティが低い場合や高い場合において、どのように機能するかを示しています。

どちらのケースでも、次の想定をおいています：
- URL 值 = "W3" の行を検索するクエリ。
- UserID と URL に対する簡略化された値を持つ抽象的なバージョンのヒットテーブル。
- 索引用の同じ複合主キー (UserID, URL)。
- 各グラニュールに 2 行を含むグラニュールサイズが 2 です。

以下の図では、各グラニュールの最初のテーブル行のキー列値をオレンジ色でマークしています。

**前のキー列が低いカーディナリティを持つ場合** <a name="generic-exclusion-search-fast"></a>

UserID が低いカーディナリティを持つ場合、同じ UserID 値が複数のテーブル行やグラニュール、したがってインデックスマークにも分散している可能性が高くなります。同じ UserID を持つインデックスマークの場合、インデックスマークの URL 値は昇順に並べられます（これは、テーブル行が最初に UserID で順序付けされ、その後に URL で順序付けされるためです）。これにより、以下のように効率的なフィルタリングが可能になります：
<img src={require('./images/sparse-primary-indexes-07.png').default} class="image"/>

上記の抽象サンプルデータのグラニュール選択プロセスに対する 3 つの異なるシナリオがあります：

1. URL 値が W3 より小さく、直接後続のインデックスマークの URL 値も W3 より小さいインデックスマーク 0 は、マーク 0 と 1 が同じ UserID 値を持つため、除外することができます。この除外前提条件により、グラニュール 0 は完全に U1 UserID 値で構成されていると仮定することができ、したがって、グラニュール 0 内の最大 URL 値も W3 より小さいと仮定し、グラニュールを除外できます。

2. URL 値が W3 より小さい（または等しい）インデックスマーク 1 で、直接後続のインデックスマークの URL 値が W3 より大きい（または等しい）場合、このインデックスマークは選択されます。これは、グラニュール 1 が URL W3 を含む可能性があることを意味します。

3. URL 値が W3 より大きいインデックスマーク 2 と 3 は、インデックスマークが各グラニュールの最初のテーブル行のキー列値を保存し、テーブル行がディスク上でキー列値によってソートされているため、グラニュール 2 と 3 は URL 値 W3 を含む可能性がありません。

**前のキー列が高いカーディナリティを持つ場合** <a name="generic-exclusion-search-slow"></a>

UserID に高いカーディナリティがある場合、同じ UserID 値が複数のテーブル行やグラニュールに分散している可能性は低くなります。これにより、インデックスマークの URL 値は単調に増加するわけではありません：

<img src={require('./images/sparse-primary-indexes-08.png').default} class="image"/>

上記の図のように、W3 より小さいすべての表示されたマークは、その関連するグラニュールの行を ClickHouse エンジンにストリームするために選択されます。

これは、上記の図内のすべてのインデックスマークがシナリオ 1 に該当するものの、*直接後続のインデックスマークが現在のマークと同じ UserID 値を持つ*という前提条件を満たしていないため、除外することができないからです。

例えば、URL 値が W3 より小さく、直接後続のインデックスマークの URL 値も W3 より小さいインデックスマーク 0 は、直接後続のインデックスマーク 1 が現在のマーク 0 と同じ UserID 値を持たないため、除外することができません。

これにより、ClickHouse はグラニュール 0 内の最大 URL 値についての仮定ができなくなります。代わりに、グラニュール 0 が URL 値 W3 の行を含む可能性があると仮定し、マーク 0 を選択せざるを得ません。

マーク 1、2、および 3 に関しても同様のシナリオが当てはまります。

:::note 結論
ClickHouse が、複合キーの一部であるカラムでフィルタリングされる場合には、最初のキー列でないカラムに対して使用される <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">汎用排除検索アルゴリズム</a> は、前のキー列に低いカーディナリティが存在する場合に最も効果的です。
:::

サンプルデータセットでは、両方のキー列 (UserID, URL) が同様に高いカーディナリティを持っているため、前述したように、URL に関する [クエリフィルタリング](#query-on-url) も、当テーブルの [二次データスキッピングインデックス](./skipping-indexes.md) を作成することからほとんど恩恵を受けません。

例えば、次の 2 つのステートメントは、当テーブルの URL カラムに [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) データスキッピングインデックスを作成およびポピュレートします：
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouse はこれで、テーブルの最初の 4 個のグラニュールに属する行に対して最小および最大の URL 値を保存する追加のインデックスを作成しました：

<img src={require('./images/sparse-primary-indexes-13a.png').default} class="image"/>

最初のインデックスエントリ（上記の図の「マーク 0」）は、テーブルの最初の 4 グラニュールに属する行の最小および最大 URL 値を保存しています。

2 番目のインデックスエントリ（「マーク 1」）は、テーブルの次の 4 グラニュールに属する行の最小および最大 URL 値を保存し、以下同様です。

（ClickHouse は、関連するインデックスマークに関連付けられたグラニュールのグループを [特定する](#mark-files-are-used-for-locating-granules) ために、データスキッピングインデックス用に特別な [マークファイル](#mark-files-are-used-for-locating-granules) も作成しました。）

高いカーディナリティの UserID と URL のため、この二次データスキッピングインデックスは、[クエリフィルタリング](#query-on-url) 実行時に、選択されるグラニュールの除外に役立てることはできません。

クエリが探している特定の URL 値（すなわち 'http://public_search'）は、インデックスが各グラニュールのグループのために保存している最小および最大値の間にある可能性が高く、ClickHouse はグラニュールのグループを選択せざるを得ない結果になります（それらがクエリに一致する行を含む可能性があるため）。

### 複数主キーインデックスを使用する必要性 {#a-need-to-use-multiple-primary-indexes}


その結果、特定の URL を持つ行のフィルタリングを大幅に高速化するには、そのクエリに最適化された主キーインデックスを使用する必要があります。

また、特定の UserID を持つ行のフィルタリングの実行性能を維持したい場合は、複数の主キーインデックスを使用する必要があります。

以下は、それを実現する方法を示します。

<a name="multiple-primary-indexes"></a>

### 追加の主キーインデックスを作成するためのオプション {#options-for-creating-additional-primary-indexes}


特定の UserID と特定の URL の両方でフィルタリングするサンプルクエリを大幅に速くするには、次の 3 つのオプションを使用して、複数の主キーインデックスを使用する必要があります：

- **異なる主キーを持つ第二のテーブル**の作成。
- **既存のテーブルのマテリアライズドビュー**の作成。
- **既存のテーブルにプロジェクションを追加する**。

これらの 3 つのオプションは、いずれもサンプルデータを追加のテーブルに複製して、テーブルの主キーインデックスおよび行のソート順を再編成するために効果的です。

ただし、これらの 3 つのオプションは、クエリと挿入文のルーティングに関して、ユーザーに対する追加のテーブルの透明性に関して異なります。

**異なる主キーを持つ第二のテーブル**を作成する場合、クエリは、クエリに最適なテーブルバージョンに明示的に送信する必要があり、新しいデータは、両方のテーブルに明示的に挿入され、テーブルを同期しておく必要があります：
<img src={require('./images/sparse-primary-indexes-09a.png').default} class="image"/>


**マテリアライズドビュー**を使用すると、追加のテーブルが暗黙的に作成され、両方のテーブル間でデータが自動的に同期されます：
<img src={require('./images/sparse-primary-indexes-09b.png').default} class="image"/>


**プロジェクション**は最も透明なオプションであり、追加のテーブルがデータ変更と同期して自動的に維持されるだけでなく、ClickHouse はクエリに対して最も効果的なテーブルバージョンを自動的に選択します：
<img src={require('./images/sparse-primary-indexes-09c.png').default} class="image"/>

以下では、複数の主キーインデックスを作成し使用するためのこれら 3 つのオプションについて、詳細かつ実例を交えて説明します。

<a name="multiple-primary-indexes-via-secondary-tables"></a>

### オプション 1: 二次テーブル {#option-1-secondary-tables}

<a name="secondary-table"></a>
主キーのキー列の順序を元のテーブルと比較して入れ替えた新たな追加テーブルを作成します。

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

当テーブルに属する 8.87 百万行を追加テーブルに挿入します：

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
```

応答は次のようになります。

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

最後に、テーブルを最適化します：
```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

主キーのキー列の順序を切り替えたため、挿入された行はディスク上で異なる辞書順で保存され、したがって、そのテーブルの 1083 のグラニュールには以前とは異なる値が格納されています：
<img src={require('./images/sparse-primary-indexes-10.png').default} class="image"/>

これが得られた主キーです：
<img src={require('./images/sparse-primary-indexes-11.png').default} class="image"/>

これを使用して、"http://public_search" の URL に最も頻繁にクリックした上位 10 のユーザーを計算するための例のクエリの実行を大幅に高速化できます：
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

応答は次の通りです：
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

10 行がセットされました。経過時間: 0.017 秒。
```
```html
// highlight-next-line
処理された行数: 319,490,
11.38 MB (18.41百万行/秒, 655.75 MB/秒)
```

今、[ほぼフルテーブルスキャンを行う代わりに](#filtering-on-key-columns-after-the-first)、ClickHouseはそのクエリをずっと効果的に実行しました。

UserID が最初で URL が第2のキー列である[元のテーブル](#a-table-with-a-primary-key)の主キーを使用して、ClickHouseはそのクエリを実行するためにインデックスマーク上で[一般的な排除検索](#generic-exclusion-search-algorithm)を使用しましたが、UserID と URL の高いカーディナリティによりあまり効果的ではありませんでした。

URL を主インデックスの最初の列として使用することで、ClickHouse は現在 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">二分探索</a>をインデックスマーク上で実行しています。
ClickHouse サーバーログファイル内の対応するトレースログは次のとおりです。
```response
...Executor): キー条件: (column 0 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): インデックス範囲での二分探索を実行中 (all_1_9_2 パートの 1083 マーク)
...Executor): (LEFT) 境界マークを見つけました: 644
...Executor): (RIGHT) 境界マークを見つけました: 683
...Executor): 19 ステップで連続範囲を見つけました
...Executor): パーティションキーで 1/1 パーツを選択, 主キーで 1 パーツを選択,
// highlight-next-line
              主キーによる 39/1083 マーク, 1 範囲から読み取るための 39 マーク
...Executor): 約 319488 行を 2 ストリームで読み込んでいます
```
ClickHouse は一般的な排除検索を使用した際の 1076 マークの代わりに、39 のインデックスマークのみを選択しました。

追加のテーブルは、URL にフィルタリングする我々の例のクエリの実行を高速化するよう最適化されています。

元のテーブル（[劣悪なパフォーマンス](#query-on-url-slow)のクエリ）と同様に、UserID がそのテーブルの主インデックスの第2キー列である新しい追加テーブルでは、[UserIDs](#the-primary-index-is-used-for-selecting-granules) にフィルタリングする我々の[例のクエリ]についてはあまり効果的に実行されないでしょう。したがって、ClickHouse はグラニュール選択のために一般的な排除検索を使用しますが、UserID と URL の高いカーディナリティには[あまり効果がありません](#generic-exclusion-search-slow)。
詳細のボックスを開いて具体的な内容をご覧ください。

<details>
    <summary>
    UserIDs にフィルタリングするクエリのパフォーマンスが悪化しています<a name="query-on-userid-slow"></a>
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

10 行がセットに含まれています。経過時間: 0.024 秒。
// highlight-next-line
処理された行数: 8.02百万行,
73.04 MB (340.26百万行/秒, 3.10 GB/秒)
```

サーバーログ:
```response
...Executor): キー条件: (column 1 in [749927693, 749927693])
// highlight-next-line
...Executor): all_1_9_2 パートのインデックス上で1473 ステップを持つ一般的な排除検索を使用しました
...Executor): パーティションキーで 1/1 パーツを選択, 主キーで 1 パーツを選択,
// highlight-next-line
              主キーによる 980/1083 マーク, 23 範囲から読み取るための 980 マーク
...Executor): 約 8028160 行を 10 ストリームで読み込みます
```
</p>
</details>

現在、我々は二つのテーブルを持っています。`UserIDs` にフィルタリングするクエリを高速化するために最適化されたものと、URL にフィルタリングするクエリを高速化するためのものです:

<img src={require('./images/sparse-primary-indexes-12a.png').default} class="image"/>

### オプション 2: マテリアライズドビュー {#option-2-materialized-views}

既存のテーブルにマテリアライズドビューを作成します。
```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

レスポンスは次のように見えます:

```response
Ok.

0 行がセットに含まれています。経過時間: 2.935 秒。処理された行数: 8.87百万行, 838.84 MB (3.02百万行/秒, 285.84 MB/秒)
```

:::note
- ビューの主キーではキー列の順序を（[元のテーブル](#a-table-with-a-primary-key) と比較して）変更します。
- マテリアライズドビューは、指定された主キー定義に基づいてその行順序と主キーを持つ**暗黙的に作成されたテーブル**によってバックアップされます。
- 暗黙的に作成されたテーブルは、`SHOW TABLES` クエリによってリストされ、その名前は `.inner` で始まります。
- マテリアライズドビューのバックエンドテーブルを最初に明示的に作成することも可能で、そのビューは `TO [db].[table]` [句](/sql-reference/statements/create/view.md)を使用してそのテーブルをターゲットにできます。
- ソーステーブル [hits_UserID_URL](#a-table-with-a-primary-key) からすべての 8.87 百万行で暗黙的に作成されたテーブルを即座に埋めるために `POPULATE` キーワードを使用します。
- ソーステーブル hits_UserID_URL に新しい行が挿入されると、暗黙的に作成されたテーブルにも自動的にその行が挿入されます。
- 実質的に暗黙的に作成されたテーブルは、[我々が明示的に作成した二次テーブル](#multiple-primary-indexes-via-secondary-tables)と同じ行順序と主キーを持っています:
<img src={require('./images/sparse-primary-indexes-12b-1.png').default} class="image"/>

ClickHouse は、暗黙的に作成されたテーブルの[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin)、[マークファイル](#mark-files-are-used-for-locating-granules) (*.mrk2)、および[主インデックス](#the-primary-index-has-one-entry-per-granule) (primary.idx)を ClickHouse サーバーのデータディレクトリ内の特別なフォルダーに保存します:
<img src={require('./images/sparse-primary-indexes-12b-2.png').default} class="image"/>
:::

マテリアライズドビューによって作成された（およびその主インデックス）暗黙的に作成されたテーブルは、次のように URL 列でフィルタリングした我々の例のクエリの実行を大幅に高速化するために使用できます。
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
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

10 行がセットに含まれています。経過時間: 0.026 秒。
// highlight-next-line
処理された行数: 335.87 千行,
13.54 MB (12.91百万行/秒, 520.38 MB/秒)
```

実質的に、マテリアライズドビューをバックアップしている暗黙的に作成されたテーブル（およびその主インデックス）は、[明示的に作成した二次テーブル](#multiple-primary-indexes-via-secondary-tables)と同じ方法でクエリが実行されます。

ClickHouse サーバーログファイル内の対応するトレースログは、ClickHouse がインデックスマーク上で二分探索を実行していることを確認します:

```response
...Executor): キー条件: (column 0 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): インデックス範囲での二分探索を実行中 ...
...
...Executor): パーティションキーで 4/4 パーツを選択, 主キーで 4 パーツを選択,
// highlight-next-line
              主キーによる 41/1083 マーク, 4 範囲から読み取るための 41 マーク
...Executor): 約 335872 行を 4 ストリームで読み込みます
```

### オプション 3: プロジェクション {#option-3-projections}

既存のテーブルにプロジェクションを作成します。
```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

そしてプロジェクションをマテリアライズします。
```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note
- プロジェクションは **隠れたテーブル** を作成し、その行順序と主インデックスはプロジェクションの指定された `ORDER BY` 句に基づいています。
- 隠れたテーブルは `SHOW TABLES` クエリによってリストされません。
- プロジェクションの隠れたテーブルを即座に全ての 8.87 百万行で埋めるために `MATERIALIZE` キーワードを使用します。
- ソーステーブル hits_UserID_URL に新しい行が挿入されると、その行も自動的に隠れたテーブルに挿入されます。
- クエリは常に（文法的に）ソーステーブル hits_UserID_URL に向いていますが、隠れたテーブルの行順序と主インデックスがクエリ実行をより効果的にする場合、その隠れたテーブルが代わりに使用されます。
- プロジェクションがORDER BYで使用されるクエリを効率的にすることはないため、プロジェクションの ORDER BY ステートメントに一致しなくても、注意してください(https://github.com/ClickHouse/ClickHouse/issues/47333)。
- 実質的に、暗黙的に作成された隠れたテーブルは、[我々が明示的に作成した二次テーブル](#multiple-primary-indexes-via-secondary-tables)と同じ行順序と主インデックスを持っています:

<img src={require('./images/sparse-primary-indexes-12c-1.png').default} class="image"/>

ClickHouse は、プロジェクションによって作成された（およびその主インデックス）隠れたテーブルを（暗黙的に）使用して、URL 列でフィルタリングした我々の例のクエリの実行を大幅に高速化します。クエリは文法的にプロジェクションのソーステーブルをターゲットにしています。
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
FROM hits_UserID_URL
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

10 行がセットに含まれています。経過時間: 0.029 秒。
// highlight-next-line
処理された行数: 319.49 千行, 1
1.38 MB (11.05百万行/秒, 393.58 MB/秒)
```

実質的に、プロジェクションによって作成された隠れたテーブル（およびその主インデックス）は、[明示的に作成した二次テーブル](#multiple-primary-indexes-via-secondary-tables)と同じ方法でクエリが実行されます。

ClickHouse サーバーログファイル内の対応するトレースログは、ClickHouse がインデックスマーク上で二分探索を実行していることを確認します。

```response
...Executor): キー条件: (column 0 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): インデックス範囲での二分探索を実行中 ...
...Executor): ...
// highlight-next-line
...Executor): 完全なノーマルプロジェクション prj_url_userid を選択
...Executor): プロジェクションが必要な列: URL, UserID
...Executor): パーティションキーで 1/1 パーツを選択, 主キーで 1 パーツを選択,
// highlight-next-line
              主キーによる 39/1083 マーク, 1 範囲から読み取るための 39 マーク
...Executor): 約 319488 行を 2 ストリームで読み込みます
```

### まとめ {#summary}

我々の[複合主キーを持つテーブル (UserID, URL)](#a-table-with-a-primary-key)の主キーは、[UserID にフィルタリングするクエリを高速化する](#the-primary-index-is-used-for-selecting-granules)のに非常に役立ちました。しかし、そのインデックスは、URL 列が複合主キーの一部であるにもかかわらず、[URL にフィルタリングするクエリを高速化する](#query-on-url)のには大きな助けにはなりませんでした。

逆に言えば:
我々の[複合主キー (URL, UserID)](#secondary-table)を持つテーブルの主キーは、[URL にフィルタリングするクエリ](#query-on-url)を高速化しましたが、[UserID にフィルタリングするクエリを](#the-primary-index-is-used-for-selecting-granules)にはあまり支援を提供しませんでした。

主キー列の UserID と URL のカーディナリティが類似して高いため、第二キー列でフィルタリングするクエリは、[インデックス内の第二キー列を持つことからあまり恩恵を受けない](#generic-exclusion-search-slow)のです。

したがって、主インデックスから第二キー列を削除する（インデックスのメモリ消費が少なくなる結果になります）と、[複数の主インデックス](#multiple-primary-indexes)を使用する方が理にかなっています。

ただし、複合主キー内のキー列に大きなカーディナリティの差がある場合、主キー列をカーディナリティの昇順に並べることが[クエリにとって利点](#generic-exclusion-search-fast)になります。

キー列間のカーディナリティの差が大きいほど、キー内でのそれらの列の順序が重要になります。次のセクションで示します。

## キー列を効率的に並べる {#ordering-key-columns-efficiently}

<a name="test"></a>

複合主キーでは、キー列の順序が次の両方に大きな影響を与えます:
- クエリのセカンダリーキー列へのフィルタリングの効率
- テーブルのデータファイルの圧縮率

これを示すために、我々は[ウェブトラフィックサンプルデータセット](#data-set)のバージョンを使用します。
このデータセットには、それぞれの行に、インターネットの「ユーザー」（`UserID` 列）が URL へのアクセスがボットトラフィック (`IsRobot` 列)としてマークされたかどうかを示す 3 つの列が含まれています。

我々は、典型的なウェブ分析クエリを加速するために使用できる 3 つの前述の列を含む複合主キーを定義します。
これらのクエリによって計算されるのは
- 特定の URL へのトラフィックのうち、どれだけの割合がボットからのものであるか、または
- 特定のユーザーがボットであるか（でないか）とどれだけ自信があるか、（そのユーザーからのトラフィックのどれだけの割合がボットトラフィックではないと見なされるか）です。

次のクエリを使って、複合主キーに使用したい 3 つの列のカーディナリティを計算します（注意: TSV データをローカルテーブルを作成せずにアドホックにクエリするために、[URL テーブル関数](https://clickhouse.com/docs/sql-reference/table-functions/url.md)を使用します）。このクエリを `clickhouse client` で実行します。
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
レスポンスは次の通りです:
```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39百万       │ 119.08千          │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 行がセットに含まれています。経過時間: 118.334 秒。処理された行数: 8.87百万行, 15.88 GB (74.99 千行/秒, 134.21 MB/秒)
```

`URL` 列と `IsRobot` 列間で特に大きなカーディナリティの差があることがわかります。したがって、複合主キー内のこれらの列の順序は、クエリの効率を向上させ、テーブルのカラムデータファイルの最適圧縮率を達成する上で重要です。

次に、我々はボットトラフィック分析データのために二つのテーブルバージョンを作成します。
- 複合主キー `(URL, UserID, IsRobot)` を持つテーブル `hits_URL_UserID_IsRobot` で、キー列の順序をカーディナリティの降順で並べます。
- 複合主キー `(IsRobot, UserID, URL)` を持つテーブル `hits_IsRobot_UserID_URL` で、キー列の順序をカーディナリティの昇順で並べます。

複合主キー `(URL, UserID, IsRobot)` を持つテーブル `hits_URL_UserID_IsRobot` を作成します。
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

そして 8.87 百万行でそれにデータを入力します。
```sql
INSERT INTO hits_URL_UserID_IsRobot SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
こちらがレスポンスです:
```response
0 行がセットに含まれています。経過時間: 104.729 秒。処理された行数: 8.87百万行, 15.88 GB (84.73 千行/秒, 151.64 MB/秒)
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
// highlight-next-line
PRIMARY KEY (IsRobot, UserID, URL);
```
そして、先ほどと同じ 8.87 百万行を同じデータを使用して挿入します。
```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
レスポンスは次の通りです:
```response
0 行がセットに含まれています。経過時間: 95.959 秒。処理された行数: 8.87百万行, 15.88 GB (92.48 千行/秒, 165.50 MB/秒)
```

### セカンダリーキー列の効率的フィルタリング {#efficient-filtering-on-secondary-key-columns}

クエリが少なくとも複合キーの一部である1つの列にフィルタリングしている場合、かつそれが最初のキー列である場合、[ClickHouse はキー列のインデックスマークの上で二分探索アルゴリズムを実行します](#the-primary-index-is-used-for-selecting-granules)。

クエリが（のみ）複合キーの一部である列にフィルタリングしている場合、しかしそれが最初のキー列でない場合、[ClickHouse はキー列のインデックスマークの上で一般的な排除検索アルゴリズムを使用します](#secondary-key-columns-can-not-be-inefficient)。

後者の場合、複合主キー内のキー列の順序が[一般的な排除検索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)の効果に重要です。

ここでは、キー列 `(URL, UserID, IsRobot)` のテーブルで `UserID` 列をフィルタリングしているクエリがあります。
```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```
レスポンスは次の通りです:
```response
┌─count()─┐
│      73 │
└─────────┘

1 行がセットに含まれています。経過時間: 0.026 秒。
// highlight-next-line
処理された行数: 7.92百万行,
31.67 MB (306.90百万行/秒, 1.23 GB/秒)
```

次は、キー列が `(IsRobot, UserID, URL)` のテーブルで同じクエリです。
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

1 行がセットに含まれています。経過時間: 0.003 秒。
// highlight-next-line
処理された行数: 20.32 千行,
81.28 KB (6.61百万行/秒, 26.44 MB/秒)
```

クエリの実行が、キー列をカーディナリティの昇順で並べたテーブルでより効果的かつ迅速であることがわかります。

その理由は、[一般的な排除検索アルゴリズム](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)が効果を発揮するためには、[グラニュール](#the-primary-index-is-used-for-selecting-granules)が次のキー列のカーディナリティが低い場合に選択されることが最も効果的だからです。この詳細は、ガイドの[前のセクション](#generic-exclusion-search-algorithm)で詳しく説明しました。

### データファイルの最適圧縮率 {#optimal-compression-ratio-of-data-files}

次のクエリは、前述の二つのテーブルの `UserID` 列間の圧縮率を比較します。

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
レスポンスは次の通りです:
```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 行がセットに含まれています。経過時間: 0.006 秒。
```
`UserID` 列の圧縮率が、キー列をカーディナリティの昇順で並べたテーブルで非常に高いことがわかります。

両方のテーブルに正確に同じデータが保存されています（二つのテーブルには同じ 8.87 百万行が挿入されています）、複合主キー内のキー列の順序が、テーブルの[カラムデータファイル](#data-is-stored-on-disk-ordered-by-primary-key-columns)内の圧縮されたデータが必要とするディスクスペースの量に大きな影響を与えます。
- 複合主キー `(URL, UserID, IsRobot)` を持つテーブル `hits_URL_UserID_IsRobot` では、`UserID.bin` データファイルが **11.24 MiB** のディスクスペースを占めます。
- 複合主キー `(IsRobot, UserID, URL)` を持つテーブル `hits_IsRobot_UserID_URL` では、`UserID.bin` データファイルが **877.47 KiB** のみを占めます。

テーブルのカラムに対する良好な圧縮率を持つことは、ディスク上のスペースを節約するだけでなく、特にそのカラムからのデータを読み取る必要があるクエリ（特に分析クエリ）を迅速にします。これは、カラムのデータをディスクからメインメモリ（オペレーティングシステムのファイルキャッシュ）に移動するために必要な入出力が少なくなるからです。

以下に、なぜテーブルのカラムデータの圧縮率を最大化するために主キーをカーディナリティの昇順で並べることが有益であるかを示します。

テーブルの行の物理的な順序を示す図を以下に示します。これは主キーがカーディナリティの昇順で並べられている場合のものです。
<img src={require('./images/sparse-primary-indexes-14a.png').default} class="image"/>

我々は、[テーブルの行データが主キー列でオーダー付けられて記録される](#data-is-stored-on-disk-ordered-by-primary-key-columns)ことを議論しました。

上記の図では、`cl` の値に基づいて最初にテーブルの行（そのカラムの値）がオーダー付けされ、同じ `cl` 値を持つ行は `ch` 値によってオーダー付けされます。そして、最初のキー列 `cl` のカーディナリティが低いため、同じ `cl` 値を持つ行が存在する可能性が高いです。また、`ch` の値が同じであることも（同じ `cl` 値を持つ行に対して）高い可能性を持っています。

もし、カラム内の類似データが近接して配置されていれば、例えばソートを介して、そのデータはより良く圧縮されます。
一般的に、圧縮アルゴリズムはデータのランレングス（データが多いほど圧縮の向上）とローカリティ（データが類似しているほど良くなる圧縮率）から利を得ます。

上記の図とは対照的に、以下の図は主キーがカーディナリティの降順でオーダー付けられている場合の行の物理的な順序を示しています。
<img src={require('./images/sparse-primary-indexes-14b.png').default} class="image"/>

この場合、テーブルの行は最初に `ch` 値によってオーダー付けされ、同じ `ch` 値を持つ行は `cl` 値によってオーダー付けされます。しかし、最初のキー列 `ch` のカーディナリティが高いため、同じ `ch` 値を持つ行を持たない可能性が高くなります。そのため、そのオーダーが異なる `cl` 値が同じ `ch` 値を持つ行に対してローカルにオーダー付けされる可能性が低くなります。

したがって、`cl` 値はおそらくランダムな順序になるため、データのローカリティと圧縮率が悪くなります。

### まとめ {#summary-1}

クエリのセカンダリーキー列に対する効率的なフィルタリングと、テーブルのカラムデータファイルの圧縮率の両方において、主キー中のカラムをカーディナリティの昇順で並べることが有益です。

### 関連コンテンツ {#related-content-1}
- ブログ: [ClickHouse クエリの超加速](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)

## 単一行を効率的に識別する {#identifying-single-rows-efficiently}

一般的に[そうではありません](/knowledgebase/key-value)が、ClickHouse の上に構築されたアプリケーションの中には、ClickHouse テーブルの単一行を識別することを必要とするものがあります。

直感的な解決策は、一意の値を持つ [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 列を使用し、高速な行取得のためにその列を主キー列として使用することです。

最速の取得を実現するために、UUID 列は[最初のキー列である必要があります](#the-primary-index-is-used-for-selecting-granules)。

[ClickHouse テーブルの行データがディスクに主キー列でオーダー付けされて保存される](#data-is-stored-on-disk-ordered-by-primary-key-columns)ため、主キーまたは複合主キー内の非常に高カーディナリティ列（UUID 列など）を持つことが、他のテーブル列の圧縮率に[デメリットを与えます](#optimal-compression-ratio-of-data-files)。

最速の取得と最適なデータ圧縮との間の妥協は、UUID を最後のキー列とする複合主キーを使用し、良好な圧縮率を保証するために低（い）カーディナリティのキー列を前に持ってくることです。

### 具体例 {#a-concrete-example}

一つの具体例は、Alexey Milovidov によって開発され、[ブログに記載された](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/) プレーンテキストペーストサービス https://pastila.nl です。

テキストエリアでの変更ごとに、データは自動的に ClickHouse テーブルの行に保存されます（変更ごとに1行）。

そして、ペーストされたコンテンツ（特定のバージョン）を識別して取得するための一つの方法は、コンテンツのハッシュをテーブル行の UUID として使用することです。

次の図は
- 行が変更されるときの挿入順序（例えば、テキストエリアにテキストを入力するキーストロークによって）、および
- `PRIMARY KEY (hash)` が使用される場合の挿入された行のディスク上のオーダーを示しています:
<img src={require('./images/sparse-primary-indexes-15a.png').default} class="image"/>

`hash` 列が主キー列として使用されるため、
- 特定の行を[非常に迅速に](#the-primary-index-is-used-for-selecting-granules)取得できますが、
- テーブルの行（そのカラムデータ）はランダムで一意なハッシュ値で昇順にディスクに保存されます。その結果、コンテンツ列の値もランダムな順序で保存され、データローカリティのない **最適な圧縮率が得られません**。

圧縮率を大幅に改善するために、特定の行を取得しつつ、`PRIMARY KEY (fingerprint, hash)` という複合主キーを使用して、pastila.nl は二つのハッシュを使っています。
- 同じデータのハッシュとして、先に述べたように、（異なるデータに対して異なる）ハッシュ、
- 小さなデータの変更があるときに変わらない[ローカリティ感度ハッシュ（フィンガープリント）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)。

次の図は、行が変更されるときの挿入順序（例えば、テキストエリアにテキストを入力するキーストロークによって）と、
複合 `PRIMARY KEY (fingerprint, hash)` を使用する場合に挿入された行のディスク上のオーダーを示しています。

<img src={require('./images/sparse-primary-indexes-15b.png').default} class="image"/>

ここで、行はまず `fingerprint` の順序でオーダー付けされ、同じフィンガープリント値を持つ行の最終的なオーダーを決定するのは、その `hash` 値です。

小さな変更によって異なるデータが同じフィンガープリント値を持つため、今や類似データがコンテンツ列において、ディスクに近接して保存されます。これは、圧縮率にとって非常に良いことであり、圧縮アルゴリズムは一般的にデータローカリティ（データが似ているほど圧縮率が良くなる）から利を得ます。

妥協として、特定の行を取得するためには二つのフィールド（`fingerprint` と `hash`）が必要です。それによって、複合 `PRIMARY KEY (fingerprint, hash)` から得られるプライマリインデックスを最適に活用することができます。
