---
slug: /en/optimize/sparse-primary-indexes
sidebar_label: Sparse Primary Indexes
sidebar_position: 1
description: In this guide we are going to do a deep dive into ClickHouse indexing.
---


# A Practical Introduction to Primary Indexes in ClickHouse

## Introduction

In this guide we are going to do a deep dive into ClickHouse indexing. We will illustrate and discuss in detail:
- [how indexing in ClickHouse is different from traditional relational database management systems](#an-index-design-for-massive-data-scales)
- [how ClickHouse is building and using a table’s sparse primary index](#a-table-with-a-primary-key)
- [what some of the best practices are for indexing in ClickHouse](#using-multiple-primary-indexes)

You can optionally execute all ClickHouse SQL statements and queries given in this guide by yourself on your own machine.
For installation of ClickHouse and getting started instructions, see the [Quick Start](/docs/en/quick-start.mdx).

:::note
This guide is focusing on ClickHouse sparse primary indexes.

For ClickHouse [secondary data skipping indexes](/docs/en/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes), see the [Tutorial](/docs/en/guides/best-practices/skipping-indexes.md).
:::


### Data Set

Throughout this guide we will use a sample anonymized web traffic data set.

- We will use a subset of 8.87 million rows (events) from the sample data set.
- The uncompressed data size is 8.87 million events and about 700 MB. This compresses to 200 mb when stored in ClickHouse.
- In our subset, each row contains three columns that indicate an internet user (`UserID` column) who clicked on a URL (`URL` column) at a specific time (`EventTime` column).

With these three columns we can already formulate some typical web analytics queries such as:

- "What are the top 10 most clicked urls for a specific user?”
- "What are the top 10 users that most frequently clicked a specific URL?"
- “What are the most popular times (e.g. days of the week) at which a user clicks on a specific URL?”

### Test Machine

All runtime numbers given in this document are based on running ClickHouse 22.2.1 locally on a MacBook Pro with the Apple M1 Pro chip and 16GB of RAM.


### A full table scan

In order to see how a query is executed over our data set without a primary key, we create a table (with a MergeTree table engine) by executing the following SQL DDL statement:

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



Next insert a subset of the hits data set into the table with the following SQL insert statement.
This uses the [URL table function](/docs/en/sql-reference/table-functions/url.md) in order to load a  subset of the full dataset hosted remotely at clickhouse.com:

```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
The response is:
```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```


ClickHouse client’s result output shows us that the statement above inserted 8.87 million rows into the table.


Lastly, in order to simplify the discussions later on in this guide and to make the diagrams and results reproducible, we [optimize](/docs/en/sql-reference/statements/optimize.md) the table using the FINAL keyword:

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
In general it is not required nor recommended to immediately optimize a table
after loading data into it. Why this is necessary for this example will become apparent.
:::


Now we execute our first web analytics query. The following is calculating the top 10 most clicked urls for the internet user with the UserID 749927693:

```sql
SELECT URL, count(URL) as Count
FROM hits_NoPrimaryKey
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```
The response is:
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


ClickHouse client’s result output indicates that ClickHouse executed a full table scan! Each single row of the 8.87 million rows of our table was streamed into ClickHouse. That doesn’t scale.

To make this (way) more efficient and (much) faster, we need to use a table with a appropriate primary key. This will allow ClickHouse to automatically (based on the primary key’s column(s)) create a sparse primary index which can then be used to significantly speed up the execution of our example query.

### Related content
- Blog: [Super charging your ClickHouse queries](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)


## ClickHouse Index Design



### An index design for massive data scales

In traditional relational database management systems, the primary index would contain one entry per table row. For our data set this would result in the primary index - often a <a href="https://en.wikipedia.org/wiki/B%2B_tree" target="_blank">B(+)-Tree</a> data structure - containing 8.87 million entries. Such an index allows the fast location of specific rows, resulting in high efficiency for lookup queries and point updates. Searching an entry in a B(+)-Tree data structure has average time complexity of `O(log2 n)`. For a table of 8.87 million rows, this means 23 steps are required to locate any index entry. This capability comes at a cost: additional disk and memory overheads and higher insertion costs when adding new rows to the table and entries to the index (and also sometimes rebalancing of the B-Tree).

Considering the challenges associated with B-Tree indexes, table engines in ClickHouse utilise a different approach. The ClickHouse [MergeTree Engine Family](/docs/en/engines/table-engines/mergetree-family/index.md) has been designed and optimized to handle massive data volumes. These tables are designed to receive millions of row inserts per second and store very large (100s of Petabytes) volumes of data. Data is quickly written to a table [part by part](/docs/en/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage), with rules applied for merging the parts in the background. In ClickHouse each part has its own primary index. When parts are merged, then the merged part’s primary indexes are also merged. At the very large scale that ClickHouse is designed for, it is paramount to be very disk and memory efficient. Therefore, instead of indexing every row, the primary index for a part has one index entry (known as a ‘mark’) per group of rows (called ‘granule’) - this technique is called **sparse index**.

Sparse indexing is possible because ClickHouse is storing the rows for a part on disk ordered by the primary key column(s). Instead of directly locating single rows (like a B-Tree based index), the sparse primary index allows it to quickly (via a binary search over index entries) identify groups of rows that could possibly match the query. The located groups of potentially matching rows (granules) are then in parallel streamed into the ClickHouse engine in order to find the matches. This index design allows for the primary index to be small (it can, and must, completely fit into the main memory), whilst still significantly speeding up query execution times: especially for range queries that are typical in data analytics use cases.

The following illustrates in detail how ClickHouse is building and using its sparse primary index. Later on in the article, we will discuss some best practices for choosing, removing, and ordering the table columns that are used to build the index (primary key columns).

### A table with a primary key

Create a table that has a compound primary key with key columns UserID and URL:

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
SETTINGS index_granularity = 8192, index_granularity_bytes = 0;
```

[//]: # (<details open>)
<details>
    <summary>
    DDL Statement Details
    </summary>
    <p>

In order to simplify the discussions later on in this guide, as well as  make the diagrams and results reproducible, the DDL statement
<ul>
<li>specifies a compound sorting key for the table via an `ORDER BY` clause</li>
<br/>
<li>explicitly controls how many index entries the primary index will have through the settings:</li>
<br/>
<ul>
<li>`index_granularity: explicitly set to its default value of 8192. This means that for each group of 8192 rows, the primary index will have one index entry, e.g. if the table contains 16384 rows then the index will have two index entries.
</li>
<br/>
<li>`index_granularity_bytes`: set to 0 in order to disable <a href="https://clickhouse.com/docs/en/whats-new/changelog/2019/#experimental-features-1" target="_blank">adaptive index granularity</a>. Adaptive index granularity means that ClickHouse automatically creates one index entry for a group of n rows if either of these are true:
<ul>
<li>if n is less than 8192 and the size of the combined row data for that n rows is larger than or equal to 10 MB (the default value for index_granularity_bytes) or</li>
<li>if the combined row data size for n rows is less than 10 MB but n is 8192.</li>
</ul>
</li>
</ul>
</ul>
</p>
</details>


The primary key in the DDL statement above causes the creation of the primary index based on the two specified key columns.

<br/>
Next insert the data:

```sql
INSERT INTO hits_UserID_URL SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
The response looks like:
```response
0 rows in set. Elapsed: 149.432 sec. Processed 8.87 million rows, 18.40 GB (59.38 thousand rows/s., 123.16 MB/s.)
```


<br/>
And optimize the table:

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br/>
We can use the following query to obtain metadata about our table:

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

The response is:

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

The output of the ClickHouse client shows:

- The table’s data is stored in [wide format](/docs/en/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) in a specific directory on disk meaning that there will be one data file (and one mark file) per table column inside that directory.
- The table has 8.87 million rows.
- The uncompressed data size of all rows together is 733.28 MB.
- The compressed size on disk of all rows together is 206.94 MB.
- The table has a primary index with 1083 entries (called ‘marks’) and the size of the index is 96.93 KB.
- In total, the table’s data and mark files and primary index file together take 207.07 MB on disk.

### Data is stored on disk ordered by primary key column(s)

Our table that we created above has
- a compound [primary key](/docs/en/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` and
- a compound [sorting key](/docs/en/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`.

:::note
- If we would have specified only the sorting key, then the primary key would be implicitly defined to be equal to the sorting key.

- In order to be memory efficient we explicitly specified a primary key that only contains columns that our queries are filtering on. The primary index that is based on the primary key is completely loaded into the main memory.

- In order to have consistency in the guide’s diagrams and in order to maximise compression ratio we defined a separate sorting key that includes all of our table's columns (if in a column similar data is placed close to each other, for example via sorting, then that data will be compressed better).

- The primary key needs to be a prefix of the sorting key if both are specified.
:::


The inserted rows are stored on disk in lexicographical order (ascending) by the primary key columns (and the additional EventTime column from the sorting key).

:::note
ClickHouse allows inserting multiple rows with identical primary key column values. In this case (see row 1 and row 2 in the diagram below), the final order is determined by the specified sorting key and therefore the value of the `EventTime` column.
:::



ClickHouse is a <a href="https://clickhouse.com/docs/en/introduction/distinctive-features/#true-column-oriented-dbms
" target="_blank">column-oriented database management system</a>. As shown in the diagram below
- for the on disk representation, there is a single data file (*.bin) per table column where all the values for that column are stored in a <a href="https://clickhouse.com/docs/en/introduction/distinctive-features/#data-compression" target="_blank">compressed</a> format, and
- the 8.87 million rows are stored on disk in lexicographic ascending order by the primary key columns (and the additional sort key columns) i.e. in this case
  - first by `UserID`,
  - then by `URL`,
  - and lastly by `EventTime`:

<img src={require('./images/sparse-primary-indexes-01.png').default} class="image"/>
UserID.bin, URL.bin, and EventTime.bin are the data files on disk where the values of the `UserID`, `URL`, and `EventTime` columns are stored.

<br/>
<br/>


:::note
- As the primary key defines the lexicographical order of the rows on disk, a table can only have one primary key.

- We are numbering rows starting with 0 in order to be aligned with the ClickHouse internal row numbering scheme that is also used for logging messages.
:::



### Data is organized into granules for parallel data processing

For data processing purposes, a table's column values are logically divided into granules.
A granule is the smallest indivisible data set that is streamed into ClickHouse for data processing.
This means that instead of reading individual rows, ClickHouse is always reading (in a streaming fashion and in parallel) a whole group (granule) of rows.
:::note
Column values are not physically stored inside granules: granules are just a logical organization of the column values for query processing.
:::

The following diagram shows how the (column values of) 8.87 million rows of our table
are organized into 1083 granules, as a result of the table's DDL statement containing the setting `index_granularity` (set to its default value of 8192).

<img src={require('./images/sparse-primary-indexes-02.png').default} class="image"/>

The first (based on physical order on disk) 8192 rows (their column values) logically belong to granule 0, then the next 8192 rows (their column values) belong to granule 1 and so on.

:::note
- The last granule (granule 1082) "contains" less than 8192 rows.

- We mentioned in the beginning of this guide in the "DDL Statement Details", that we disabled [adaptive index granularity](/docs/en/whats-new/changelog/2019.md/#experimental-features-1) (in order to simplify the discussions in this guide, as well as make the diagrams and results reproducible).

  Therefore all granules (except the last one) of our example table have the same size.

- For tables with adaptive index granularity (index granularity is adaptive by [default](/docs/en/engines/table-engines/mergetree-family/mergetree.md/#index_granularity_bytes)) the size of some granules can be less than 8192 rows depending on the row data sizes.



- We marked some column values from our primary key columns (`UserID`, `URL`) in orange.
  These orange-marked column values are the primary key column values of each first row of each granule.
  As we will see below, these orange-marked column values will be the entries in the table's primary index.

- We are numbering granules starting with 0 in order to be aligned with the ClickHouse internal numbering scheme that is also used for logging messages.
:::



### The primary index has one entry per granule

The primary index is created based on the granules shown in the diagram above. This index is an uncompressed flat array file (primary.idx), containing so-called numerical index marks starting at 0.

The diagram below shows that the index stores the primary key column values (the values marked in orange in the diagram above) for each first row for each granule.
Or in other words: the primary index stores the primary key column values from each 8192nd row of the table (based on the physical row order defined by the primary key columns).
For example
- the first index entry (‘mark 0’ in the diagram below) is storing the key column values of the first row of granule 0 from the diagram above,
- the second index entry (‘mark 1’ in the diagram below) is storing the key column values of the first row of granule 1 from the diagram above, and so on.



<img src={require('./images/sparse-primary-indexes-03a.png').default} class="image"/>

In total the index has 1083 entries for our table with 8.87 million rows and 1083 granules:

<img src={require('./images/sparse-primary-indexes-03b.png').default} class="image"/>

:::note
- For tables with [adaptive index granularity](/docs/en/whats-new/changelog/2019.md/#experimental-features-1), there is also one "final" additional mark stored in the primary index that records the values of the primary key columns of the last table row, but because we disabled adaptive index granularity (in order to simplify the discussions in this guide, as well as make the diagrams and results reproducible), the index of our example table doesn't include this final mark.

- The primary index file is completely loaded into the main memory. If the file is larger than the available free memory space then ClickHouse will raise an error.
:::

<details>
    <summary>
    Inspecting the content of the primary index
    </summary>
    <p>

On a self-managed ClickHouse cluster we can use the <a href="https://clickhouse.com/docs/en/sql-reference/table-functions/file/" target="_blank">file table function</a> for inspecting the content of the primary index of our example table.

For that we first need to copy the primary index file into the <a href="https://clickhouse.com/docs/en/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> of a node from the running cluster:
<ul>
<li>Step 1: Get part-path that contains the primary index file</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`


returns `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4` on the test machine.

<li>Step 2: Get user_files_path</li>
The <a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">default user_files_path</a> on Linux is
`/var/lib/clickhouse/user_files/`

and on Linux you can check if it got changed: `$ grep user_files_path /etc/clickhouse-server/config.xml`

On the test machine the path is `/Users/tomschreiber/Clickhouse/user_files/`


<li>Step 3: Copy the primary index file into the user_files_path</li>
`
cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx
`

<br/>

</ul>

Now we can inspect the content of the primary index via SQL:
<ul>
<li>Get amount of entries</li>
`
SELECT count( )<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String');
`

<br/>
<br/>
returns `1083`
<br/>
<br/>
<li>Get first two index marks</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 0, 2;
`
<br/>
<br/>
returns
<br/>
`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`
<br/>
<br/>
<li>Get last index mark</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
<br/>
<br/>
returns
<br/>
`
4292714039 │ http://sosyal-mansetleri...
`



</ul>

This matches exactly our diagram of the primary index content for our example table:
<img src={require('./images/sparse-primary-indexes-03b.png').default} class="image"/>
</p>
</details>



The primary key entries are called index marks because each index entry is marking the start of a specific data range. Specifically for the example table:
- UserID index marks:<br/>
  The stored `UserID` values in the primary index are sorted in ascending order.<br/>
  ‘mark 1’ in the diagram above thus indicates that the `UserID` values of all table rows in granule 1, and in all following granules, are guaranteed to be greater than or equal to 4.073.710.

 [As we will see later](#the-primary-index-is-used-for-selecting-granules), this global order enables ClickHouse to <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">use a binary search algorithm</a> over the index marks for the first key column when a query is filtering on the first column of the primary key.

- URL index marks:<br/>
  The quite similar cardinality of the primary key columns `UserID` and `URL`
  means that the index marks for all key columns after the first column in general only indicate a data range as long as the predecessor key column value stays the same for all table rows within at least the current granule.<br/>
 For example, because the UserID values of mark 0 and mark 1 are different in the diagram above, ClickHouse can't assume that all URL values of all table rows in granule 0 are larger or equal to `'http://showtopics.html%3...'`. However, if the UserID values of mark 0 and mark 1 would be the same in the diagram above (meaning that the UserID value stays the same for all table rows within the granule 0), the ClickHouse could assume that all URL values of all table rows in granule 0 are larger or equal to `'http://showtopics.html%3...'`.

  We will discuss the consequences of this on query execution performance in more detail later.

### The primary index is used for selecting granules

We can now execute our queries with support from the primary index.


The following calculates the top 10 most clicked urls for the UserID 749927693.

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

The response is:


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

The output for the ClickHouse client is now showing that instead of doing a full table scan, only 8.19 thousand rows were streamed into ClickHouse.


If <a href="https://clickhouse.com/docs/en/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">trace logging</a> is enabled then the ClickHouse server log file shows that ClickHouse was running a <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">binary search</a> over the 1083 UserID index marks, in order to identify granules that possibly can contain rows with a UserID column value of `749927693`. This requires 19 steps with an average time complexity of `O(log2 n)`:
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


We can see in the trace log above, that one mark out of the 1083 existing marks satisfied the query.

<details>
    <summary>
    Trace Log Details
    </summary>
    <p>

Mark 176 was identified (the 'found left boundary mark' is inclusive, the 'found right boundary mark' is exclusive), and therefore all 8192 rows from granule 176 (which starts at row 1.441.792 - we will see that later on in this guide) are then streamed into ClickHouse in order to find the actual rows with a UserID column value of `749927693`.
</p>
</details>

We can also reproduce this by using the <a href="https://clickhouse.com/docs/en/sql-reference/statements/explain/" target="_blank">EXPLAIN clause</a> in our example query:
```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

The response looks like:

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
The client output is showing that one out of the 1083 granules was selected as possibly containing rows with a UserID column value of 749927693.


:::note Conclusion
When a query is filtering on a column that is part of a compound key and is the first key column, then ClickHouse is running the binary search algorithm over the key column's index marks.
:::

<br/>


As discussed above, ClickHouse is using its sparse primary index for quickly (via binary search) selecting granules that could possibly contain rows that match a query.


This is the **first stage (granule selection)** of ClickHouse query execution.

In the **second stage (data reading)**, ClickHouse is locating the selected granules in order to stream all their rows into the ClickHouse engine in order to find the rows that are actually matching the query.

We discuss that second stage in more detail in the following section.



### Mark files are used for locating granules

The following diagram illustrates a part of the primary index file for our table.

<img src={require('./images/sparse-primary-indexes-04.png').default} class="image"/>

As discussed above, via a binary search over the index’s 1083 UserID marks, mark 176 was identified. Its corresponding granule 176 can therefore possibly contain rows with a UserID column value of 749.927.693.

<details>
    <summary>
    Granule Selection Details
    </summary>
    <p>

The diagram above shows that mark 176 is the first index entry where both the minimum UserID value of the associated granule 176 is smaller than 749.927.693, and the minimum UserID value of granule 177 for the next mark (mark 177) is greater than this value. Therefore only the corresponding granule 176 for mark 176 can possibly contain rows with a UserID column value of 749.927.693.
</p>
</details>

In order to confirm (or not) that some row(s) in granule 176 contain a UserID column value of 749.927.693, all 8192 rows belonging to this granule need to be streamed into ClickHouse.

To achieve this, ClickHouse needs to know the physical location of granule 176.

In ClickHouse the physical locations of all granules for our table are stored in mark files. Similar to data files, there is one mark file per table column.

The following diagram shows the three mark files UserID.mrk, URL.mrk, and EventTime.mrk that store the physical locations of the granules for the table’s UserID, URL, and EventTime columns.
<img src={require('./images/sparse-primary-indexes-05.png').default} class="image"/>

We have discussed how the primary index is a flat uncompressed array file (primary.idx), containing index marks that are numbered starting at 0.

Similarly, a mark file is also a flat uncompressed array file (*.mrk) containing marks that are numbered starting at 0.

Once ClickHouse has identified and selected the index mark for a granule that can possibly contain matching rows for a query, a positional array lookup can be performed in the mark files in order to obtain the physical locations of the granule.

Each mark file entry for a specific column is storing two locations in the form of offsets:

- The first offset ('block_offset' in the diagram above) is locating the <a href="https://clickhouse.com/docs/en/development/architecture/#block" target="_blank">block</a> in the <a href="https://clickhouse.com/docs/en/introduction/distinctive-features/#data-compression" target="_blank">compressed</a> column data file that contains the compressed version of the selected granule. This compressed block potentially contains a few compressed granules. The located compressed file block is uncompressed into the main memory on read.

- The second offset ('granule_offset' in the diagram above) from the mark-file provides the location of the granule within the uncompressed block data.

All the 8192 rows belonging to the located uncompressed granule are then streamed into ClickHouse for further processing.


:::note

- For tables with [wide format](/docs/en/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) and without [adaptive index granularity](/docs/en/whats-new/changelog/2019.md/#experimental-features-1), ClickHouse uses `.mrk` mark files as visualised above, that contain entries with two 8 byte long addresses per entry. These entries are physical locations of granules that all have the same size.

 Index granularity is adaptive by [default](/docs/en/engines/table-engines/mergetree-family/mergetree.md/#index_granularity_bytes), but for our example table we disabled adaptive index granularity (in order to simplify the discussions in this guide, as well as make the diagrams and results reproducible). Our table is using wide format because the size of the data is larger than [min_bytes_for_wide_part](/docs/en/engines/table-engines/mergetree-family/mergetree.md/#min_bytes_for_wide_part) (which is 10 MB by default for self-managed clusters).

- For tables with wide format and with adaptive index granularity, ClickHouse uses `.mrk2` mark files, that contain similar entries to `.mrk` mark files but with an additional third value per entry: the number of rows of the granule that the current entry is associated with.

- For tables with [compact format](/docs/en/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage), ClickHouse uses `.mrk3` mark files.

:::


:::note Why Mark Files

Why does the primary index not directly contain the physical locations of the granules that are corresponding to index marks?

Because at that very large scale that ClickHouse is designed for, it is important to be very disk and memory efficient.

The primary index file needs to fit into the main memory.

For our example query, ClickHouse used the primary index and selected a single granule that can possibly contain rows matching our query. Only for that one granule does ClickHouse then need the physical locations in order to stream the corresponding rows for further processing.

Furthermore, this offset information is only needed for the UserID and URL columns.

Offset information is not needed for columns that are not used in the query e.g. the EventTime.

For our sample query, ClickHouse needs only the two physical location offsets for granule 176 in the UserID data file (UserID.bin) and the two physical location offsets for granule 176 in the URL data file (URL.bin).

The indirection provided by mark files avoids storing, directly within the primary index, entries for the physical locations of all 1083 granules for all three columns: thus avoiding having unnecessary (potentially unused) data in main memory.
:::

The following diagram and the text below illustrate how for our example query ClickHouse locates granule 176 in the UserID.bin data file.

<img src={require('./images/sparse-primary-indexes-06.png').default} class="image"/>

We discussed earlier in this guide that ClickHouse selected the primary index mark 176 and therefore granule 176 as possibly containing matching rows for our query.

ClickHouse now uses the selected mark number (176) from the index for a positional array lookup in the UserID.mrk mark file in order to get the two offsets for locating granule 176.

As shown, the first offset is locating the compressed file block within the UserID.bin data file that in turn contains the compressed version of granule 176.

Once the located file block is uncompressed into the main memory, the second offset from the mark file can be used to locate granule 176 within the uncompressed data.

ClickHouse needs to locate (and stream all values from) granule 176 from both the UserID.bin data file and the URL.bin data file in order to execute our example query (top 10 most clicked URLs for the internet user with the UserID 749.927.693).

The diagram above shows how ClickHouse is locating the granule for the UserID.bin data file.

In parallel, ClickHouse is doing the same for granule 176 for the URL.bin data file. The two respective granules are aligned and streamed into the ClickHouse engine for further processing i.e. aggregating and counting the URL values per group for all rows where the UserID is 749.927.693, before finally outputting the 10 largest URL groups in descending count order.


## Using multiple primary indexes

<a name="filtering-on-key-columns-after-the-first"></a>

### Secondary key columns can (not) be inefficient


When a query is filtering on a column that is part of a compound key and is the first key column, [then ClickHouse is running the binary search algorithm over the key column's index marks](#the-primary-index-is-used-for-selecting-granules).

But what happens when a query is filtering on a column that is part of a compound key, but is not the first key column?

:::note
We discuss a scenario when a query is explicitly not filtering on the first key colum, but on a secondary key column.

When a query is filtering on both the first key column and on any key column(s) after the first then ClickHouse is running binary search over the first key column's index marks.
:::

<br/>
<br/>

<a name="query-on-url"></a>
We use a query that calculates the top 10 users that have most frequently clicked on the URL "http://public_search":

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

The response is: <a name="query-on-url-slow"></a>
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

The client output indicates that ClickHouse almost executed a full table scan despite the [URL column being part of the compound primary key](#a-table-with-a-primary-key)! ClickHouse reads 8.81 million rows from the 8.87 million rows of the table.

If [trace_logging](/docs/en/operations/server-configuration-parameters/settings.md/#server_configuration_parameters-logger) is enabled then the ClickHouse server log file shows that ClickHouse used a <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">generic exclusion search</a> over the 1083 URL index marks in order to identify those granules that possibly can contain rows with a URL column value of "http://public_search":
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
We can see in the sample trace log above, that 1076 (via the marks) out of 1083 granules were selected as possibly containing rows with a matching URL value.

This results in 8.81 million rows being streamed into the ClickHouse engine (in parallel by using 10 streams), in order to identify the rows that are actually contain the URL value "http://public_search".

However, [as we will see later](#query-on-url-fast) only 39 granules out of that selected 1076 granules actually contain matching rows.

Whilst the primary index based on the compound primary key (UserID, URL) was very useful for speeding up queries filtering for rows with a specific UserID value, the index is not providing significant help with speeding up the query that filters for rows with a specific URL value.

The reason for this is that the URL column is not the first key column and therefore ClickHouse is using a generic exclusion search algorithm (instead of binary search) over the URL column's index marks, and **the effectiveness of that algorithm is dependant on the cardinality difference** between the URL column and its predecessor key column UserID.

In order to illustrate that, we give some details about how the generic exclusion search works.


<a name="generic-exclusion-search-algorithm"></a>

### Generic exclusion search algorithm







The following is illustrating how the <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >ClickHouse generic exclusion search algorithm</a> works when granules are selected via a secondary column where the predecessor key column has a low(er) or high(er) cardinality.

As an example for both cases we will assume:
- a query that is searching for rows with URL value = "W3".
- an abstract version of our hits table with simplified values for UserID and URL.
- the same compound primary key (UserID, URL) for the index. This means rows are first ordered by UserID values. Rows with the same UserID value are then ordered by URL.
- a granule size of two i.e. each granule contains two rows.

We have marked the key column values for the first table rows for each granule in orange in the diagrams below..

**Predecessor key column has low(er) cardinality**<a name="generic-exclusion-search-fast"></a>

Suppose UserID had low cardinality. In this case it would be likely that the same UserID value is spread over multiple table rows and granules and therefore index marks. For index marks with the same UserID, the URL values for the index marks are sorted in ascending order (because the table rows are ordered first by UserID and then by URL). This allows efficient filtering as described below:
<img src={require('./images/sparse-primary-indexes-07.png').default} class="image"/>

There are three different scenarios for the granule selection process for our abstract sample data in the diagram above:


1.  Index mark 0 for which the **URL value is smaller than W3 and for which the URL value of the directly succeeding index mark is also smaller than W3** can be excluded because mark 0, and 1 have the same UserID value. Note that this exclusion-precondition ensures that granule 0 is completely composed of U1 UserID values so that ClickHouse can assume that also the maximum URL value in granule 0 is smaller than W3 and exclude the granule.

2. Index mark 1 for which the **URL value is smaller (or equal) than W3 and for which the URL value of the directly succeeding index mark is greater (or equal) than W3** is selected because it means that granule 1 can possibly contain rows with URL W3.

3. Index marks 2 and 3 for which the **URL value is greater than W3** can be excluded, since index marks of a primary index store the key column values for the first table row for each granule and the table rows are sorted on disk by the key column values, therefore granule 2 and 3 can't possibly contain URL value W3.



**Predecessor key column has high(er) cardinality**<a name="generic-exclusion-search-slow"></a>

When the UserID has high cardinality then it is unlikely that the same UserID value is spread over multiple table rows and granules. This means the URL values for the index marks are not monotonically increasing:

<img src={require('./images/sparse-primary-indexes-08.png').default} class="image"/>


As we can see in the diagram above, all shown marks whose URL values are smaller than W3 are getting selected for streaming its associated granule's rows into the ClickHouse engine.

This is because whilst all index marks in the diagram fall into scenario 1 described above, they do not satisfy the mentioned exclusion-precondition that *the directly succeeding index mark has the same UserID value as the current mark* and thus can’t be excluded.

For example, consider index mark 0 for which the **URL value is smaller than W3 and for which the URL value of the directly succeeding index mark is also smaller than W3**. This can *not* be excluded because the directly succeeding index mark 1 does *not* have the same UserID value as the current mark 0.

This ultimately prevents ClickHouse from making assumptions about the maximum URL value in granule 0. Instead it has to assume that granule 0 potentially contains rows with URL value W3 and is forced to select mark 0.


The same scenario is true for mark 1, 2, and 3.




:::note Conclusion
The <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">generic exclusion search algorithm</a> that ClickHouse is using instead of the <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">binary search algorithm</a> when a query is filtering on a column that is part of a compound key, but is not the first key column is most effective when the predecessor key column has low(er) cardinality.
:::

In our sample data set both key columns (UserID, URL) have similar high cardinality, and, as explained, the generic exclusion search algorithm is not very effective when the predecessor key column of the URL column has a high(er) or similar cardinality.


### Note about data skipping index


Because of the similarly high cardinality of UserID and URL, our [query filtering on URL](#query-on-url) also wouldn't benefit much from creating a [secondary data skipping index](./skipping-indexes.md) on the URL column
of our [table with compound primary key (UserID, URL)](#a-table-with-a-primary-key).

For example this two statements create and populate a [minmax](/docs/en/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) data skipping index on the URL column of our table:
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouse now created an additional index that is storing - per group of 4 consecutive [granules](#data-is-organized-into-granules-for-parallel-data-processing) (note the `GRANULARITY 4` clause in the `ALTER TABLE` statement above) - the minimum and maximum URL value:

<img src={require('./images/sparse-primary-indexes-13a.png').default} class="image"/>

The first index entry (‘mark 0’ in the diagram above) is storing the minimum and maximum URL values for the [rows belonging to the first 4 granules of our table](#data-is-organized-into-granules-for-parallel-data-processing).

The second index entry (‘mark 1’) is storing the minimum and maximum URL values for the rows belonging to the next 4 granules of our table, and so on.

(ClickHouse also created a special [mark file](#mark-files-are-used-for-locating-granules) for to the data skipping index for [locating](#mark-files-are-used-for-locating-granules) the groups of granules associated with the index marks.)


Because of the similarly high cardinality of UserID and URL, this secondary data skipping index can't help with excluding granules from being selected when our [query filtering on URL](#query-on-url) is executed.

The specific URL value that the query is looking for (i.e. 'http://public_search') very likely is between the minimum and maximum value stored by the index for each group of granules resulting in ClickHouse being forced to select the group of granules (because they might contain row(s) matching the query).


### A need to use multiple primary indexes


As a consequence, if we want to significantly speed up our sample query that filters for rows with a specific URL then we need to use a primary index optimized to that query.

If in addition we want to keep the good performance of our sample query that filters for rows with a specific UserID then we need to use multiple primary indexes.

The following is showing ways for achieving that.

<a name="multiple-primary-indexes"></a>

### Options for creating additional primary indexes


If we want to significantly speed up both of our sample queries - the one that  filters for rows with a specific UserID and the one that filters for rows with a specific URL - then we need to use multiple primary indexes by using one of these three options:

- Creating a **second table** with a different primary key.
- Creating a **materialized view** on our existing table.
- Adding a **projection** to our existing table.

All three options will effectively duplicate our sample data into a additional table in order to reorganize the table primary index and row sort order.

However, the three options differ in how transparent that additional table is to the user with respect to the routing of queries and insert statements.

When creating a **second table** with a different primary key then queries must be explicitly send to the table version best suited for the query, and new data must be inserted explicitly into both tables in order to keep the tables in sync:
<img src={require('./images/sparse-primary-indexes-09a.png').default} class="image"/>


With a **materialized view** the additional table is implicitly created and data is automatically kept in sync between both tables:
<img src={require('./images/sparse-primary-indexes-09b.png').default} class="image"/>


And the **projection** is the most transparent option because next to automatically keeping the implicitly created (and hidden) additional table in sync with data changes, ClickHouse will automatically choose the most effective table version for queries:
<img src={require('./images/sparse-primary-indexes-09c.png').default} class="image"/>

In the following we discuss this three options for creating and using multiple primary indexes in more detail and with real examples.

<a name="multiple-primary-indexes-via-secondary-tables"></a>

### Option 1: Secondary Tables

<a name="secondary-table"></a>
We are creating a new additional table where we switch the order of the key columns (compared to our original table) in the primary key:

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
SETTINGS index_granularity = 8192, index_granularity_bytes = 0;
```

Insert all 8.87 million rows from our [original table](#a-table-with-a-primary-key) into the additional table:

```sql
INSERT INTO hits_URL_UserID
SELECT * from hits_UserID_URL;
```

The response looks like:

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

And finally optimize the table:
```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

Because we switched the order of the columns in the primary key, the inserted rows are now stored on disk in a different lexicographical order (compared to our [original table](#a-table-with-a-primary-key)) and therefore also the 1083 granules of that table are containing different values than before:
<img src={require('./images/sparse-primary-indexes-10.png').default} class="image"/>

This is the resulting primary key:
<img src={require('./images/sparse-primary-indexes-11.png').default} class="image"/>

That can now be used to significantly speed up the execution of our example query filtering on the URL column in order to calculate the top 10 users that most frequently clicked on the URL "http://public_search":
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

The response is:
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

Now, instead of [almost doing a full table scan](#filtering-on-key-columns-after-the-first), ClickHouse executed that query much more effectively.

With the primary index from the [original table](#a-table-with-a-primary-key) where UserID was the first, and URL the second key column, ClickHouse used a [generic exclusion search](#generic-exclusion-search-algorithm) over the index marks for executing that query and that was not very effective because of the similarly high cardinality of UserID and URL.

With URL as the first column in the primary index, ClickHouse is now running <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">binary search</a> over the index marks.
The corresponding trace log in the ClickHouse server log file confirms that:
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
ClickHouse selected only 39 index marks, instead of 1076 when generic exclusion search was used.


Note that the additional table is optimized for speeding up the execution of our example query filtering on URLs.


Similar to the [bad performance](#query-on-url-slow) of that query with our [original table](#a-table-with-a-primary-key), our [example query filtering on UserIDs](#the-primary-index-is-used-for-selecting-granules) will not run very effectively with the new additional table, because UserID is now the second key column in the primary index of that table and therefore ClickHouse will use generic exclusion search for granule selection, which is [not very effective for similarly high cardinality](#generic-exclusion-search-slow) of UserID and URL.
Open the details box for specifics.
<details>
    <summary>
    Query filtering on UserIDs now has bad performance<a name="query-on-userid-slow"></a>
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

The response is:

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

Server Log:
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




We now have two tables. Optimized for speeding up queries filtering on UserIDs, and speeding up queries filtering on URLs, respectively:
<img src={require('./images/sparse-primary-indexes-12a.png').default} class="image"/>









### Option 2: Materialized Views

Create a [materialized view](/docs/en/sql-reference/statements/create/view.md) on our existing table.
```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

The response looks like:

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note
- we switch the order of the key columns (compared to our [original table](#a-table-with-a-primary-key) ) in the view's primary key
- the materialized view is backed by a **implicitly created table** whose row order and primary index is based on the given primary key definition
- the implicitly created table is listed by the `SHOW TABLES` query and has a name starting with `.inner`
- it is also possible to first explicitly create the backing table for a materialized view and then the view can target that table via the `TO [db].[table]` [clause](/docs/en/sql-reference/statements/create/view.md)
- we use the `POPULATE` keyword in order to immediately populate the implicitly created table with all 8.87 million rows from the source table [hits_UserID_URL](#a-table-with-a-primary-key)
- if new rows are inserted into the source table hits_UserID_URL, then that rows are automatically also inserted into the implicitly created table
- Effectively the implicitly created table has the same row order and primary index as the [secondary table that we created explicitly](#multiple-primary-indexes-via-secondary-tables):




<img src={require('./images/sparse-primary-indexes-12b-1.png').default} class="image"/>


ClickHouse is storing the [column data files](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), the [mark files](#mark-files-are-used-for-locating-granules) (*.mrk2) and the [primary index](#the-primary-index-has-one-entry-per-granule) (primary.idx) of the implicitly created table in a special folder withing the ClickHouse server's data directory:


<img src={require('./images/sparse-primary-indexes-12b-2.png').default} class="image"/>

:::


The implicitly created table (and its primary index) backing the materialized view can now be used to significantly speed up the execution of our example query filtering on the URL column:
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

The response is:

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

Because effectively the implicitly created table (and its primary index) backing the materialized view is identical to the [secondary table that we created explicitly](#multiple-primary-indexes-via-secondary-tables), the query is executed in the same effective way as with the explicitly created table.

The corresponding trace log in the ClickHouse server log file confirms that ClickHouse is running binary search over the index marks:

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



### Option 3: Projections

Create a projection on our existing table:
```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

And materialize the projection:
```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note
- the projection is creating a **hidden table** whose row order and primary index is based on the given `ORDER BY` clause of the projection
- the hidden table is not listed by the `SHOW TABLES` query
- we use the `MATERIALIZE` keyword in order to immediately populate the hidden table with all 8.87 million rows from the source table [hits_UserID_URL](#a-table-with-a-primary-key)
- if new rows are inserted into the source table hits_UserID_URL, then that rows are automatically also inserted into the hidden table
- a query is always (syntactically) targeting the source table hits_UserID_URL, but if the row order and primary index of the hidden table allows a more effective query execution, then that hidden table will be used instead
- please note that projections do not make queries that use ORDER BY more efficient, even if the ORDER BY matches the projection's ORDER BY statement (see https://github.com/ClickHouse/ClickHouse/issues/47333)
- Effectively the implicitly created hidden table has the same row order and primary index as the [secondary table that we created explicitly](#multiple-primary-indexes-via-secondary-tables):

<img src={require('./images/sparse-primary-indexes-12c-1.png').default} class="image"/>

ClickHouse is storing the [column data files](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), the [mark files](#mark-files-are-used-for-locating-granules) (*.mrk2) and the [primary index](#the-primary-index-has-one-entry-per-granule) (primary.idx) of the hidden table in a special folder (marked in orange in the screenshot below) next to the source table's data files, mark files, and primary index files:

<img src={require('./images/sparse-primary-indexes-12c-2.png').default} class="image"/>
:::


The hidden table (and its primary index) created by the projection can now be (implicitly) used to significantly speed up the execution of our example query filtering on the URL column. Note that the query is syntactically targeting the source table of the projection.
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

The response is:

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

Because effectively the hidden table (and its primary index) created by the projection is identical to the [secondary table that we created explicitly](#multiple-primary-indexes-via-secondary-tables), the query is executed in the same effective way as with the explicitly created table.

The corresponding trace log in the ClickHouse server log file confirms that ClickHouse is running binary search over the index marks:


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


### Summary


The primary index of our [table with compound primary key (UserID, URL)](#a-table-with-a-primary-key) was very useful for speeding up a [query filtering on UserID](#the-primary-index-is-used-for-selecting-granules). But that index is not providing significant help with speeding up a [query filtering on URL](#query-on-url), despite the URL column being part of the compound primary key.

And vice versa:
The primary index of our [table with compound primary key (URL, UserID)](#secondary-table) was speeding up a [query filtering on URL](#query-on-url), but didn't provide much support for a [query filtering on UserID](#the-primary-index-is-used-for-selecting-granules).

Because of the similarly high cardinality of the primary key columns UserID and URL, a query that filters on the second key column [doesn’t benefit much from the second key column being in the index](#generic-exclusion-search-slow).

Therefore it makes sense to remove the second key column from the primary index (resulting in less memory consumption of the index) and to [use multiple primary indexes](#multiple-primary-indexes) instead.


However if the key columns in a compound primary key have big differences in cardinality, then it is [beneficial for queries](#generic-exclusion-search-fast) to order the primary key columns by cardinality in ascending order.

The higher the cardinality difference between the key columns is, the more the order of those columns in the key matters. We will demonstrate that in the next section.

## Ordering key columns efficiently

<a name="test"></a>


In a compound primary key the order of the key columns can significantly influence both:
- the efficiency of the filtering on secondary key columns in queries, and
- the compression ratio for the table's data files.

In order to demonstrate that, we will use a version of our [web traffic sample data set](#data-set)
where each row contains three columns that indicate whether or not the access by an internet 'user' (`UserID` column) to a URL (`URL` column) got marked as bot traffic (`IsRobot` column).

We will use a compound primary key containing all three aforementioned columns that could be used to speed up typical web analytics queries that calculate
- how much (percentage of) traffic to a specific URL is from bots or
- how confident we are that a specific user is (not) a bot (what percentage of traffic from that user is (not) assumed to be bot traffic)

We use this query for calculating the cardinalities of the three columns that we want to use as key columns in a compound primary key (note that we are using the [URL table function](/docs/en/sql-reference/table-functions/url.md) for querying TSV data ad-hocly without having to create a local table). Run this query in `clickhouse client`:
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
The response is:
```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

We can see that there is a big difference between the cardinalities, especially between the `URL` and `IsRobot` columns, and therefore the order of these columns in a compound primary key is significant for both the efficient speed up of queries filtering on that columns and for achieving optimal compression ratios for the table's column data files.

In order to demonstrate that we are creating two table versions for our bot traffic analysis data:
- a table `hits_URL_UserID_IsRobot` with the compound primary key `(URL, UserID, IsRobot)` where we order the key columns by cardinality in descending order
- a table `hits_IsRobot_UserID_URL` with the compound primary key `(IsRobot, UserID, URL)` where we order the key columns by cardinality in ascending order


Create the table `hits_URL_UserID_IsRobot` with the compound primary key `(URL, UserID, IsRobot)`:
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

And populate it with 8.87 million rows:
```sql
INSERT INTO hits_URL_UserID_IsRobot SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
This is the response:
```response
0 rows in set. Elapsed: 104.729 sec. Processed 8.87 million rows, 15.88 GB (84.73 thousand rows/s., 151.64 MB/s.)
```


Next, create the table `hits_IsRobot_UserID_URL` with the compound primary key `(IsRobot, UserID, URL)`:
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
And populate it with the same 8.87 million rows that we used to populate the previous table:

```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
The response is:
```response
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```



### Efficient filtering on secondary key columns

When a query is filtering on at least one column that is part of a compound key, and is the first key column, [then ClickHouse is running the binary search algorithm over the key column's index marks](#the-primary-index-is-used-for-selecting-granules).

When a query is filtering (only) on a column that is part of a compound key, but is not the first key column, [then ClickHouse is using the generic exclusion search algorithm over the key column's index marks](#secondary-key-columns-can-not-be-inefficient).


For the second case the ordering of the key columns in the compound primary key is significant for the effectiveness of the [generic exclusion search algorithm](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444).

This is a query that is filtering on the `UserID` column of the table where we ordered the key columns `(URL, UserID, IsRobot)` by cardinality in descending order:
```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```
The response is:
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.026 sec.
// highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

This is the same query on the table where we ordered the key columns `(IsRobot, UserID, URL)` by cardinality in ascending order:
```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```
The response is:
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.
// highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

We can see that the query execution is significantly more effective and faster on the table where we ordered the key columns by cardinality in ascending order.

The reason for that is that the [generic exclusion search algorithm](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) works most effective, when [granules](#the-primary-index-is-used-for-selecting-granules) are selected via a secondary key column where the predecessor key column has a lower cardinality. We illustrated that in detail in a [previous section](#generic-exclusion-search-algorithm) of this guide.


### Optimal compression ratio of data files

This query compares the compression ratio of the `UserID` column between the two tables that we created above:

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
This is the response:
```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```
We can see that the compression ratio for the `UserID` column is significantly higher for the table where we ordered the key columns `(IsRobot, UserID, URL)` by cardinality in ascending order.

Although in both tables exactly the same data is stored (we inserted the same 8.87 million rows into both tables), the order of the key columns in the compound primary key has a significant influence on how much disk space the <a href="https://clickhouse.com/docs/en/introduction/distinctive-features/#data-compression" target="_blank">compressed</a> data in the table's [column data files](#data-is-stored-on-disk-ordered-by-primary-key-columns) requires:
- in the table `hits_URL_UserID_IsRobot` with the compound primary key `(URL, UserID, IsRobot)` where we order the key columns by cardinality in descending order, the `UserID.bin` data file takes **11.24 MiB** of disk space
- in the table `hits_IsRobot_UserID_URL` with the compound primary key `(IsRobot, UserID, URL)` where we order the key columns by cardinality in ascending order, the `UserID.bin` data file takes only **877.47 KiB** of disk space

Having a good compression ratio for the data of a table's column on disk not only saves space on disk, but also makes queries (especially analytical ones) that require the reading of data from that column faster, as less i/o is required for moving the column's data from disk to the main memory (the operating system's file cache).

In the following we illustrate why it's beneficial for the compression ratio of a table's columns to order the primary key columns by cardinality in ascending order.

The diagram below sketches the on-disk order of rows for a primary key where the key columns are ordered by cardinality in ascending order:
<img src={require('./images/sparse-primary-indexes-14a.png').default} class="image"/>

We discussed that [the table's row data is stored on disk ordered by primary key columns](#data-is-stored-on-disk-ordered-by-primary-key-columns).

In the diagram above, the table's rows (their column values on disk) are first ordered by their `cl` value, and rows that have the same `cl` value are ordered by their `ch` value. And because the first key column `cl` has low cardinality, it is likely that there are rows with the same `cl` value. And because of that it is also likely that `ch` values are ordered (locally - for rows with the same `cl` value).

If in a column, similar data is placed close to each other, for example via sorting, then that data will be compressed better.
In general, a compression algorithm benefits from the run length of data (the more data it sees the better for compression)
and locality (the more similar the data is, the better the compression ratio is).

In contrast to the diagram above, the diagram below sketches the on-disk order of rows for a primary key where the key columns are ordered by cardinality in descending order:
<img src={require('./images/sparse-primary-indexes-14b.png').default} class="image"/>

Now the table's rows are first ordered by their `ch` value, and rows that have the same `ch` value are ordered by their `cl` value.
But because the first key column `ch` has high cardinality, it is unlikely that there are rows with the same `ch` value. And because of that is is also unlikely that `cl` values are ordered (locally - for rows with the same `ch` value).

Therefore the `cl` values are most likely in random order and therefore have a bad locality and compression ration, respectively.


### Summary

For both the efficient filtering on secondary key columns in queries and the compression ratio of a table's column data files it is beneficial to order the columns in a primary key by their cardinality in ascending order.


### Related content
- Blog: [Super charging your ClickHouse queries](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)


## Identifying single rows efficiently

Although in general it is [not](/knowledgebase/key-value) the best use case for ClickHouse,
sometimes applications built on top of ClickHouse require to identify single rows of a ClickHouse table.


An intuitive solution for that might be to use a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) column with a unique value per row and for fast retrieval of rows to use that column as a primary key column.

For the fastest retrieval, the UUID column [would need to be the first key column](#the-primary-index-is-used-for-selecting-granules).

We discussed that because [a ClickHouse table's row data is stored on disk ordered by primary key column(s)](#data-is-stored-on-disk-ordered-by-primary-key-columns), having a very high cardinality column (like a UUID column) in a primary key or in a compound primary key before columns with lower cardinality [is detrimental for the compression ratio of other table columns](#optimal-compression-ratio-of-data-files).

A compromise between fastest retrieval and optimal data compression is to use a compound primary key where the UUID is the last key column, after low(er) cardinality key columns that are used to ensure a good compression ratio for some of the table's columns.

### A concrete example

One concrete example is a the plaintext paste service https://pastila.nl that Alexey Milovidov developed and [blogged about](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/).

On every change to the text-area, the data is saved automatically into a ClickHouse table row (one row per change).

And one way to identify and retrieve (a specific version of) the pasted content is to use a hash of the content as the UUID for the table row that contains the content.

The following diagram shows
- the insert order of rows when the content changes (for example because of keystrokes typing the text into the text-area) and
- the on-disk order of the data from the inserted rows when the `PRIMARY KEY (hash)` is used:
<img src={require('./images/sparse-primary-indexes-15a.png').default} class="image"/>

Because the `hash` column is used as the primary key column
- specific rows can be retrieved [very quickly](#the-primary-index-is-used-for-selecting-granules), but
- the table's rows (their column data) are stored on disk ordered ascending by (the unique and random) hash values. Therefore also the content column's values are stored in random order with no data locality resulting in a **suboptimal compression ratio for the content column data file**.


In order to significantly improve the compression ratio for the content column while still achieving fast retrieval of specific rows, pastila.nl is using two hashes (and a compound primary key) for identifying a specific row:
- a hash of the content, as discussed above, that is distinct for distinct data, and
- a [locality-sensitive hash (fingerprint)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing) that does **not** change on small changes of data.

The following diagram shows
- the insert order of rows when the content changes (for example because of keystrokes typing the text into the text-area) and
- the on-disk order of the data from the inserted rows when the compound `PRIMARY KEY (fingerprint, hash)` is used:

<img src={require('./images/sparse-primary-indexes-15b.png').default} class="image"/>

Now the rows on disk are first ordered by `fingerprint`, and for rows with the same fingerprint value, their `hash` value determines the final order.

Because data that differs only in small changes is getting the same fingerprint value, similar data is now stored on disk close to each other in the content column. And that is very good for the compression ratio of the content column, as a compression algorithm in general benefits from data locality (the more similar the data is the better the compression ratio is).

The compromise is that two fields (`fingerprint` and `hash`) are required for the retrieval of a specific row in order to optimally utilise the primary index that results from the compound `PRIMARY KEY (fingerprint, hash)`.
