---
slug: /en/file-upload
sidebar_label: File Upload
---

# File Upload Tutorial

## What to Expect from This Tutorial?

In this tutorial you will:
1. Upload a file to a ClickHouse Cloud service
1. Modify the table schema to optimize the data types
1. Visualize the data with Superset

You can upload a dataset file through ClickHouse Cloud **Load Data** that meets these requirements:
- foo
- bar

:::tip
Other file formats, and files without a header line that identifies the columns can also be uploaded using `clickhouse client` or `clickhouse local` or one of several other tools including the ones listed on out [integrations](/docs/en/integrations/index.mdx) page.
:::

The sample file is a subset of the weather data available from [NOAA](https://www.ncei.noaa.gov/products).  This subset includes weather data from the year 1901.

https://www.ncei.noaa.gov/data/global-hourly/archive/csv/

```bash
wget https://www.ncei.noaa.gov/data/global-hourly/archive/csv/1901.tar.gz
```

REMOVE, this is for opencellid, not NOAA
<p><a href="https://www.opencellid.org/"><b>OpenCelliD</b></a> data is governed by <a rel="nofollow" class="external text" href="https://creativecommons.org/licenses/by-sa/4.0/">Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)</a></p>


:::note
This tutorial assumes you have access to a running ClickHouse Cloud service.  If not, check out the [Quick Start](/docs/en/quick-start.mdx).
:::

## 1. Upload the sample file

Select your ClickHouse Cloud service and in the Actions menu select **Load Data**.  Switch to the **File upload** tab, and right click on the sample file link. Save the file.   Drag the file onto the upload where it will be uploaded to he browser and analyzed.  Click on **Upload** when it is finished.
:::tip IP Allow List
Your IP address must be in the allow list for the upload to work.
:::

## 2. Modify the table
Most fields are `Nullable(String)` type.  This is fine when ClickHouse is inferring the schema, but Sting types are not ideal if you want to visualize the data with tools that expect numeric types.

```sql
ALTER TABLE CentralParkWeather MODIFY COLUMN SNOW Nullable(FLOAT) DEFAULT 0.0
```

```sql
SELECT * FROM system.mutations WHERE is_done = 0
```

```sql
select SNOW from CentralParkWeather WHERE SNOW > 0
```

```sql
select PRCP from CentralParkWeather where PRCP > '0.0'
```

```sql
ALTER TABLE CentralParkWeather MODIFY COLUMN PRCP Nullable(FLOAT) DEFAULT 0
```

```sql
select PRCP from CentralParkWeather where PRCP > 0
```

```sql
select DISTINCT NAME from CentralParkWeather
```
```sql
select DISTINCT STATION from CentralParkWeather
```

```sql
describe CentralParkWeather FORMAT Vertical
```

#### Congrats!

Well done, you made it through the tutorial, and hopefully, you have a better understanding of how to upload files to ClickHouse. Here are some options for what to do next:

- Read [how primary keys work in ClickHouse](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-intro.md) - this knowledge will move you a long ways forward along your journey to becoming a ClickHouse expert
- [Integrate an external data source](/docs/en/integrations/index.mdx) like files, Kafka, PostgreSQL, data pipelines, or lots of other data sources
- [Connect your favorite UI/BI tool](/docs/en/integrations/data-visualization/) to ClickHouse
- Check out the [SQL Reference](/docs/en/sql-reference/) and browse through the various functions. ClickHouse has an amazing collection of functions for transforming, processing and analyzing data



