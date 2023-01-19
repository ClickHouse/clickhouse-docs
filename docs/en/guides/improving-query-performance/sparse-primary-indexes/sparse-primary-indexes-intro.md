---
slug: /en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-intro
sidebar_label: Introduction 
sidebar_position: 1
description: TODO
---


# A Practical Introduction to Primary Indexes in ClickHouse

In this guide we are going to do a deep dive into ClickHouse indexing. We will illustrate and discuss in detail:
- [how indexing in ClickHouse is different from traditional relational database management systems](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#an-index-design-for-massive-data-scales)
- [how ClickHouse is building and using a table’s sparse primary index](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#a-table-with-a-primary-key)
- [what some of the best practices are for indexing in ClickHouse](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-multiple.md)

You can optionally execute all ClickHouse SQL statements and queries given in this guide by yourself on your own machine.
For installation of ClickHouse and getting started instructions, see the [Quick Start](/docs/en/quick-start.mdx).

:::note
This guide is focusing on ClickHouse sparse primary indexes.

For ClickHouse [secondary data skipping indexes](/docs/en/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes), see the [Tutorial](/docs/en/guides/improving-query-performance/skipping-indexes.md).


:::


## Data Set

Throughout this guide we will use a sample anonymized web traffic data set.

- We will use a subset of 8.87 million rows (events) from the sample data set.
- The uncompressed data size is 8.87 million events and about 700 MB. This compresses to 200 mb when stored in ClickHouse.
- In our subset, each row contains three columns that indicate an internet user (`UserID` column) who clicked on a URL (`URL` column) at a specific time (`EventTime` column).

With these three columns we can already formulate some typical web analytics queries such as:

- "What are the top 10 most clicked urls for a specific user?”
- "What are the top 10 users that most frequently clicked a specific URL?"
- “What are the most popular times (e.g. days of the week) at which a user clicks on a specific URL?”

## Test Machine

All runtime numbers given in this document are based on running ClickHouse 22.2.1 locally on a MacBook Pro with the Apple M1 Pro chip and 16GB of RAM.


## A full table scan

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

## Related content
- Blog: [Super charging your ClickHouse queries](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
