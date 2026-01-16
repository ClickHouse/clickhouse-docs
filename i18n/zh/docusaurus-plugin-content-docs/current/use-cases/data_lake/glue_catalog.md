---
slug: /use-cases/data-lake/glue-catalog
sidebar_label: 'AWS Glue 目录'
title: 'AWS Glue 目录'
pagination_prev: null
pagination_next: null
description: '在本指南中，我们将逐步演示如何使用 ClickHouse 和 AWS Glue 数据目录查询 S3 存储桶中的数据。'
keywords: ['Glue', '数据湖']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse 支持与多个目录集成（Unity、Glue、Polaris 等）。在本指南中，我们将向您展示如何使用 ClickHouse 和 Glue Data Catalog 查询 S3 存储桶中的数据。

:::note
Glue 支持多种不同的表格式，但此集成仅支持 Iceberg 表。
:::

## 在 AWS 中配置 Glue \\{#configuring\\}

要连接到 Glue 数据目录，您需要确定目录所在的区域，并提供访问密钥和秘密访问密钥。 

:::note
当前 Glue 数据目录仅支持使用访问密钥和秘密访问密钥进行访问，但我们将在未来支持更多的身份验证方式。
:::

## 在 Glue 数据目录与 ClickHouse 之间创建连接 \\{#connecting\\}

在完成 Unity Catalog 的配置并设置好身份验证后，即可在 ClickHouse 与 Unity Catalog 之间建立连接。

```sql title="Query"
CREATE DATABASE glue
ENGINE = DataLakeCatalog
SETTINGS 
    catalog_type = 'glue', 
    region = 'us-west-2', 
    aws_access_key_id = '<access-key>', 
    aws_secret_access_key = '<secret-key>'
```

## 使用 ClickHouse 查询 Glue 数据目录 \\{#query-glue-catalog\\}

现在连接已经建立，可以开始查询 Glue 了：

```sql title="Query"
USE glue;
SHOW TABLES;
```

```sql title="Response"
   ┌─name───────────────────────────────────┐
1. │ iceberg-benchmark.hitsiceberg          │
2. │ iceberg-benchmark.hitsparquet          │
3. │ iceberg_benchmark.hitsdailypartitioned │
4. │ iceberg_benchmark.time_travel          │
   └────────────────────────────────────────┘
```

你可以在上面看到，有些表并不是 Iceberg 表，例如
`iceberg-benchmark.hitsparquet`。这些表无法被查询，因为目前只支持 Iceberg。

要查询一张表：

```sql title="Query"
SELECT count(*) FROM `iceberg-benchmark.hitsiceberg`;
```

:::note
由于 ClickHouse 仅支持单一命名空间，因此需要使用反引号。
:::

要查看该表的 DDL，请运行以下查询：

```sql
SHOW CREATE TABLE `iceberg-benchmark.hitsiceberg`;
```

```sql title="Response"
  ┌─statement───────────────────────────────────────────────┐
1.│ CREATE TABLE glue.`iceberg-benchmark.hitsiceberg`       │
  │ (                                                       │
  │     `watchid` Nullable(Int64),                          │
  │     `javaenable` Nullable(Int32),                       │
  │     `title` Nullable(String),                           │
  │     `goodevent` Nullable(Int32),                        │
  │     `eventtime` Nullable(DateTime64(6)),                │
  │     `eventdate` Nullable(Date),                         │
  │     `counterid` Nullable(Int32),                        │
  │     `clientip` Nullable(Int32),                         │
  │     `regionid` Nullable(Int32),                         │
  │     `userid` Nullable(Int64),                           │
  │     `counterclass` Nullable(Int32),                     │
  │     `os` Nullable(Int32),                               │
  │     `useragent` Nullable(Int32),                        │
  │     `url` Nullable(String),                             │
  │     `referer` Nullable(String),                         │
  │     `isrefresh` Nullable(Int32),                        │
  │     `referercategoryid` Nullable(Int32),                │
  │     `refererregionid` Nullable(Int32),                  │
  │     `urlcategoryid` Nullable(Int32),                    │
  │     `urlregionid` Nullable(Int32),                      │
  │     `resolutionwidth` Nullable(Int32),                  │
  │     `resolutionheight` Nullable(Int32),                 │
  │     `resolutiondepth` Nullable(Int32),                  │
  │     `flashmajor` Nullable(Int32),                       │
  │     `flashminor` Nullable(Int32),                       │
  │     `flashminor2` Nullable(String),                     │
  │     `netmajor` Nullable(Int32),                         │
  │     `netminor` Nullable(Int32),                         │
  │     `useragentmajor` Nullable(Int32),                   │
  │     `useragentminor` Nullable(String),                  │
  │     `cookieenable` Nullable(Int32),                     │
  │     `javascriptenable` Nullable(Int32),                 │
  │     `ismobile` Nullable(Int32),                         │
  │     `mobilephone` Nullable(Int32),                      │
  │     `mobilephonemodel` Nullable(String),                │
  │     `params` Nullable(String),                          │
  │     `ipnetworkid` Nullable(Int32),                      │
  │     `traficsourceid` Nullable(Int32),                   │
  │     `searchengineid` Nullable(Int32),                   │
  │     `searchphrase` Nullable(String),                    │
  │     `advengineid` Nullable(Int32),                      │
  │     `isartifical` Nullable(Int32),                      │
  │     `windowclientwidth` Nullable(Int32),                │
  │     `windowclientheight` Nullable(Int32),               │
  │     `clienttimezone` Nullable(Int32),                   │
  │     `clienteventtime` Nullable(DateTime64(6)),          │
  │     `silverlightversion1` Nullable(Int32),              │
  │     `silverlightversion2` Nullable(Int32),              │
  │     `silverlightversion3` Nullable(Int32),              │
  │     `silverlightversion4` Nullable(Int32),              │
  │     `pagecharset` Nullable(String),                     │
  │     `codeversion` Nullable(Int32),                      │
  │     `islink` Nullable(Int32),                           │
  │     `isdownload` Nullable(Int32),                       │
  │     `isnotbounce` Nullable(Int32),                      │
  │     `funiqid` Nullable(Int64),                          │
  │     `originalurl` Nullable(String),                     │
  │     `hid` Nullable(Int32),                              │
  │     `isoldcounter` Nullable(Int32),                     │
  │     `isevent` Nullable(Int32),                          │
  │     `isparameter` Nullable(Int32),                      │
  │     `dontcounthits` Nullable(Int32),                    │
  │     `withhash` Nullable(Int32),                         │
  │     `hitcolor` Nullable(String),                        │
  │     `localeventtime` Nullable(DateTime64(6)),           │
  │     `age` Nullable(Int32),                              │
  │     `sex` Nullable(Int32),                              │
  │     `income` Nullable(Int32),                           │
  │     `interests` Nullable(Int32),                        │
  │     `robotness` Nullable(Int32),                        │
  │     `remoteip` Nullable(Int32),                         │
  │     `windowname` Nullable(Int32),                       │
  │     `openername` Nullable(Int32),                       │
  │     `historylength` Nullable(Int32),                    │
  │     `browserlanguage` Nullable(String),                 │
  │     `browsercountry` Nullable(String),                  │
  │     `socialnetwork` Nullable(String),                   │
  │     `socialaction` Nullable(String),                    │
  │     `httperror` Nullable(Int32),                        │
  │     `sendtiming` Nullable(Int32),                       │
  │     `dnstiming` Nullable(Int32),                        │
  │     `connecttiming` Nullable(Int32),                    │
  │     `responsestarttiming` Nullable(Int32),              │
  │     `responseendtiming` Nullable(Int32),                │
  │     `fetchtiming` Nullable(Int32),                      │
  │     `socialsourcenetworkid` Nullable(Int32),            │
  │     `socialsourcepage` Nullable(String),                │
  │     `paramprice` Nullable(Int32),                       │
  │     `paramorderid` Nullable(String),                    │
  │     `paramcurrency` Nullable(String),                   │
  │     `paramcurrencyid` Nullable(Int32),                  │
  │     `openstatservicename` Nullable(String),             │
  │     `openstatcampaignid` Nullable(String),              │
  │     `openstatadid` Nullable(String),                    │
  │     `openstatsourceid` Nullable(String),                │
  │     `utmsource` Nullable(String),                       │
  │     `utmmedium` Nullable(String),                       │
  │     `utmcampaign` Nullable(String),                     │
  │     `utmcontent` Nullable(String),                      │
  │     `utmterm` Nullable(String),                         │
  │     `fromtag` Nullable(String),                         │
  │     `hasgclid` Nullable(Int32),                         │
  │     `refererhash` Nullable(Int64),                      │
  │     `urlhash` Nullable(Int64),                          │
  │     `clid` Nullable(Int32)                              │
  │ )                                                       │
  │ENGINE = Iceberg('s3://<s3-path>')                       │
  └─────────────────────────────────────────────────────────┘
```

## 将数据湖中的数据加载到 ClickHouse \\{#loading-data-into-clickhouse\\}

如果您需要从 Databricks 向 ClickHouse 加载数据，请首先创建一个本地 ClickHouse 表：

```sql title="Query"
CREATE TABLE hits
(
    `WatchID` BIGINT NOT NULL,
    `JavaEnable` SMALLINT NOT NULL,
    `Title` TEXT NOT NULL,
    `GoodEvent` SMALLINT NOT NULL,
    `EventTime` TIMESTAMP NOT NULL,
    `EventDate` Date NOT NULL,
    `CounterID` INTEGER NOT NULL,
    `ClientIP` INTEGER NOT NULL,
    `RegionID` INTEGER NOT NULL,
    `UserID` BIGINT NOT NULL,
    `CounterClass` SMALLINT NOT NULL,
    `OS` SMALLINT NOT NULL,
    `UserAgent` SMALLINT NOT NULL,
    `URL` TEXT NOT NULL,
    `Referer` TEXT NOT NULL,
    `IsRefresh` SMALLINT NOT NULL,
    `RefererCategoryID` SMALLINT NOT NULL,
    `RefererRegionID` INTEGER NOT NULL,
    `URLCategoryID` SMALLINT NOT NULL,
    `URLRegionID` INTEGER NOT NULL,
    `ResolutionWidth` SMALLINT NOT NULL,
    `ResolutionHeight` SMALLINT NOT NULL,
    `ResolutionDepth` SMALLINT NOT NULL,
    `FlashMajor` SMALLINT NOT NULL,
    `FlashMinor` SMALLINT NOT NULL,
    `FlashMinor2` TEXT NOT NULL,
    `NetMajor` SMALLINT NOT NULL,
    `NetMinor` SMALLINT NOT NULL,
    `UserAgentMajor` SMALLINT NOT NULL,
    `UserAgentMinor` VARCHAR(255) NOT NULL,
    `CookieEnable` SMALLINT NOT NULL,
    `JavascriptEnable` SMALLINT NOT NULL,
    `IsMobile` SMALLINT NOT NULL,
    `MobilePhone` SMALLINT NOT NULL,
    `MobilePhoneModel` TEXT NOT NULL,
    `Params` TEXT NOT NULL,
    `IPNetworkID` INTEGER NOT NULL,
    `TraficSourceID` SMALLINT NOT NULL,
    `SearchEngineID` SMALLINT NOT NULL,
    `SearchPhrase` TEXT NOT NULL,
    `AdvEngineID` SMALLINT NOT NULL,
    `IsArtifical` SMALLINT NOT NULL,
    `WindowClientWidth` SMALLINT NOT NULL,
    `WindowClientHeight` SMALLINT NOT NULL,
    `ClientTimeZone` SMALLINT NOT NULL,
    `ClientEventTime` TIMESTAMP NOT NULL,
    `SilverlightVersion1` SMALLINT NOT NULL,
    `SilverlightVersion2` SMALLINT NOT NULL,
    `SilverlightVersion3` INTEGER NOT NULL,
    `SilverlightVersion4` SMALLINT NOT NULL,
    `PageCharset` TEXT NOT NULL,
    `CodeVersion` INTEGER NOT NULL,
    `IsLink` SMALLINT NOT NULL,
    `IsDownload` SMALLINT NOT NULL,
    `IsNotBounce` SMALLINT NOT NULL,
    `FUniqID` BIGINT NOT NULL,
    `OriginalURL` TEXT NOT NULL,
    `HID` INTEGER NOT NULL,
    `IsOldCounter` SMALLINT NOT NULL,
    `IsEvent` SMALLINT NOT NULL,
    `IsParameter` SMALLINT NOT NULL,
    `DontCountHits` SMALLINT NOT NULL,
    `WithHash` SMALLINT NOT NULL,
    `HitColor` CHAR NOT NULL,
    `LocalEventTime` TIMESTAMP NOT NULL,
    `Age` SMALLINT NOT NULL,
    `Sex` SMALLINT NOT NULL,
    `Income` SMALLINT NOT NULL,
    `Interests` SMALLINT NOT NULL,
    `Robotness` SMALLINT NOT NULL,
    `RemoteIP` INTEGER NOT NULL,
    `WindowName` INTEGER NOT NULL,
    `OpenerName` INTEGER NOT NULL,
    `HistoryLength` SMALLINT NOT NULL,
    `BrowserLanguage` TEXT NOT NULL,
    `BrowserCountry` TEXT NOT NULL,
    `SocialNetwork` TEXT NOT NULL,
    `SocialAction` TEXT NOT NULL,
    `HTTPError` SMALLINT NOT NULL,
    `SendTiming` INTEGER NOT NULL,
    `DNSTiming` INTEGER NOT NULL,
    `ConnectTiming` INTEGER NOT NULL,
    `ResponseStartTiming` INTEGER NOT NULL,
    `ResponseEndTiming` INTEGER NOT NULL,
    `FetchTiming` INTEGER NOT NULL,
    `SocialSourceNetworkID` SMALLINT NOT NULL,
    `SocialSourcePage` TEXT NOT NULL,
    `ParamPrice` BIGINT NOT NULL,
    `ParamOrderID` TEXT NOT NULL,
    `ParamCurrency` TEXT NOT NULL,
    `ParamCurrencyID` SMALLINT NOT NULL,
    `OpenstatServiceName` TEXT NOT NULL,
    `OpenstatCampaignID` TEXT NOT NULL,
    `OpenstatAdID` TEXT NOT NULL,
    `OpenstatSourceID` TEXT NOT NULL,
    `UTMSource` TEXT NOT NULL,
    `UTMMedium` TEXT NOT NULL,
    `UTMCampaign` TEXT NOT NULL,
    `UTMContent` TEXT NOT NULL,
    `UTMTerm` TEXT NOT NULL,
    `FromTag` TEXT NOT NULL,
    `HasGCLID` SMALLINT NOT NULL,
    `RefererHash` BIGINT NOT NULL,
    `URLHash` BIGINT NOT NULL,
    `CLID` INTEGER NOT NULL
)
PRIMARY KEY (CounterID, EventDate, UserID, EventTime, WatchID);
```

接下来，从 Iceberg 表加载数据：

```sql title="Query"
INSERT INTO default.hits 
SELECT * FROM glue.`iceberg-benchmark.hitsiceberg`;
```
