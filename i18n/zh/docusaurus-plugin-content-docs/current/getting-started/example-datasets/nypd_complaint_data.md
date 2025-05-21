---
'description': 'Ingest and query Tab Separated Value data in 5 steps'
'sidebar_label': 'NYPD Complaint Data'
'slug': '/getting-started/example-datasets/nypd_complaint_data'
'title': 'NYPD Complaint Data'
---



制表符分隔值，或称TSV文件是常见的文件格式，可能包括文件第一行的字段标题。ClickHouse可以接收TSV文件，并且在不接收文件的情况下也可以查询TSV文件。本指南涵盖了这两种情况。如果您需要查询或接收CSV文件，则同样的技术适用，只需在格式参数中将`TSV`替换为`CSV`即可。

在阅读本指南的过程中，您将会：
- **调查**: 查询TSV文件的结构和内容。
- **确定目标ClickHouse架构**: 选择合适的数据类型，并将现有数据映射到这些类型。
- **创建ClickHouse表**。
- **预处理并流式传输** 数据到ClickHouse。
- **运行一些查询** 以访问ClickHouse。

本指南使用的数据集来自NYC Open Data团队，包含关于“报告给纽约市警察局(NYPD)的所有有效重罪、轻罪和违法犯罪的数据”。撰写时，数据文件的大小为166MB，但会定期更新。

**来源**: [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)  
**使用条款**: https://www1.nyc.gov/home/terms-of-use.page

## 前提条件 {#prerequisites}
- 下载数据集，访问[NYPD Complaint Data Current (Year To Date)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)页面，点击导出按钮，并选择**TSV for Excel**。
- 安装[ClickHouse服务器和客户端](../../getting-started/install/install.mdx)

### 关于本指南中描述的命令的说明 {#a-note-about-the-commands-described-in-this-guide}
本指南中有两种类型的命令：
- 一些命令是查询TSV文件的，这些命令在命令提示符下运行。
- 其余的命令是查询ClickHouse的，这些命令在`clickhouse-client`或Play UI中运行。

:::note
本指南中的示例假设您已将TSV文件保存到`${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`，如有需要，请调整命令。
:::

## 熟悉TSV文件 {#familiarize-yourself-with-the-tsv-file}

在开始使用ClickHouse数据库之前，先熟悉数据。

### 查看源TSV文件中的字段 {#look-at-the-fields-in-the-source-tsv-file}

以下是一条查询TSV文件的示例命令，但请暂时不要执行。
```sh
clickhouse-local --query \
"describe file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')"
```

示例响应
```response
CMPLNT_NUM                  Nullable(Float64)
ADDR_PCT_CD                 Nullable(Float64)
BORO_NM                     Nullable(String)
CMPLNT_FR_DT                Nullable(String)
CMPLNT_FR_TM                Nullable(String)
```

:::tip
大多数时候，上述命令会让您知道输入数据中哪些字段是数字，哪些是字符串，哪些是元组。但这并不总是如此。由于ClickHouse通常用于包含数十亿条记录的数据集，因此默认情况下会检查100条行以[推断架构](/integrations/data-formats/json/inference)，以避免解析数十亿行来推断架构。下面的响应可能与您看到的内容不匹配，因为数据集每年更新几次。查看数据字典时，您会发现CMPLNT_NUM被指定为文本，而不是数字。通过使用`SETTINGS input_format_max_rows_to_read_for_schema_inference=2000`来覆盖推断的默认100行，您可以获得对内容的更好理解。

注意：根据22.5版本的规定，推断架构的默认值现在是25,000行，因此只有在您使用旧版本或需要超过25,000行进行采样时，才更改此设置。
:::

在命令提示符下运行此命令。您将使用`clickhouse-local`来查询您下载的TSV文件中的数据。
```sh
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"describe file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')"
```

结果：
```response
CMPLNT_NUM        Nullable(String)
ADDR_PCT_CD       Nullable(Float64)
BORO_NM           Nullable(String)
CMPLNT_FR_DT      Nullable(String)
CMPLNT_FR_TM      Nullable(String)
CMPLNT_TO_DT      Nullable(String)
CMPLNT_TO_TM      Nullable(String)
CRM_ATPT_CPTD_CD  Nullable(String)
HADEVELOPT        Nullable(String)
HOUSING_PSA       Nullable(Float64)
JURISDICTION_CODE Nullable(Float64)
JURIS_DESC        Nullable(String)
KY_CD             Nullable(Float64)
LAW_CAT_CD        Nullable(String)
LOC_OF_OCCUR_DESC Nullable(String)
OFNS_DESC         Nullable(String)
PARKS_NM          Nullable(String)
PATROL_BORO       Nullable(String)
PD_CD             Nullable(Float64)
PD_DESC           Nullable(String)
PREM_TYP_DESC     Nullable(String)
RPT_DT            Nullable(String)
STATION_NAME      Nullable(String)
SUSP_AGE_GROUP    Nullable(String)
SUSP_RACE         Nullable(String)
SUSP_SEX          Nullable(String)
TRANSIT_DISTRICT  Nullable(Float64)
VIC_AGE_GROUP     Nullable(String)
VIC_RACE          Nullable(String)
VIC_SEX           Nullable(String)
X_COORD_CD        Nullable(Float64)
Y_COORD_CD        Nullable(Float64)
Latitude          Nullable(Float64)
Longitude         Nullable(Float64)
Lat_Lon           Tuple(Nullable(Float64), Nullable(Float64))
New Georeferenced Column Nullable(String)
```

此时，您应检查TSV文件中的列是否与[数据集网页](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) “**此数据集中的列**”部分中指定的名称和类型匹配。数据类型并不是很具体，所有数字字段都设置为`Nullable(Float64)`，所有其他字段为`Nullable(String)`。创建ClickHouse表以存储数据时，您可以指定更合适和更高效的类型。

### 确定合适的架构 {#determine-the-proper-schema}

为了确定字段应使用什么类型，需要了解数据的外观。例如，`JURISDICTION_CODE`字段是数字：它应该是`UInt8`，还是`Enum`，或者是`Float64`合适？

```sql
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select JURISDICTION_CODE, count() FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
 GROUP BY JURISDICTION_CODE
 ORDER BY JURISDICTION_CODE
 FORMAT PrettyCompact"
```

结果：
```response
┌─JURISDICTION_CODE─┬─count()─┐
│                 0 │  188875 │
│                 1 │    4799 │
│                 2 │   13833 │
│                 3 │     656 │
│                 4 │      51 │
│                 6 │       5 │
│                 7 │       2 │
│                 9 │      13 │
│                11 │      14 │
│                12 │       5 │
│                13 │       2 │
│                14 │      70 │
│                15 │      20 │
│                72 │     159 │
│                87 │       9 │
│                88 │      75 │
│                97 │     405 │
└───────────────────┴─────────┘
```

查询响应显示`JURISDICTION_CODE`适合为`UInt8`。

类似地，查看一些`String`字段，看看它们是否适合为`DateTime`或[`LowCardinality(String)`](../../sql-reference/data-types/lowcardinality.md) 字段。

例如，字段`PARKS_NM`被描述为“出现的纽约市公园、游乐场或绿地的名称（如果适用，州立公园不包括在内）”。纽约市的公园名称可能是`LowCardinality(String)`的良好候选者：

```sh
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select count(distinct PARKS_NM) FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
 FORMAT PrettyCompact"
```

结果：
```response
┌─uniqExact(PARKS_NM)─┐
│                 319 │
└─────────────────────┘
```

看一下某些公园的名称：
```sql
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select distinct PARKS_NM FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
 LIMIT 10
 FORMAT PrettyCompact"
```

结果：
```response
┌─PARKS_NM───────────────────┐
│ (null)                     │
│ ASSER LEVY PARK            │
│ JAMES J WALKER PARK        │
│ BELT PARKWAY/SHORE PARKWAY │
│ PROSPECT PARK              │
│ MONTEFIORE SQUARE          │
│ SUTTON PLACE PARK          │
│ JOYCE KILMER PARK          │
│ ALLEY ATHLETIC PLAYGROUND  │
│ ASTORIA PARK               │
└────────────────────────────┘
```

撰写时的数据集在`PARK_NM`列中只有几百个不同的公园和游乐场。根据对`LowCardinality`(/sql-reference/data-types/lowcardinality#description)的建议，这个数字很少，应该保持在10,000个不同字符串以下。

### DateTime字段 {#datetime-fields}
根据[数据集网页](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) “**此数据集中的列**”部分，有一些字段是报告事件的开始和结束的日期和时间。查看`CMPLNT_FR_DT`和`CMPLT_TO_DT`字段的最小值和最大值，可以了解这些字段是否始终被填充：

```sh title="CMPLNT_FR_DT"
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select min(CMPLNT_FR_DT), max(CMPLNT_FR_DT) FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
FORMAT PrettyCompact"
```

结果：
```response
┌─min(CMPLNT_FR_DT)─┬─max(CMPLNT_FR_DT)─┐
│ 01/01/1973        │ 12/31/2021        │
└───────────────────┴───────────────────┘
```

```sh title="CMPLNT_TO_DT"
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select min(CMPLNT_TO_DT), max(CMPLNT_TO_DT) FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
FORMAT PrettyCompact"
```

结果：
```response
┌─min(CMPLNT_TO_DT)─┬─max(CMPLNT_TO_DT)─┐
│                   │ 12/31/2021        │
└───────────────────┴───────────────────┘
```

```sh title="CMPLNT_FR_TM"
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select min(CMPLNT_FR_TM), max(CMPLNT_FR_TM) FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
FORMAT PrettyCompact"
```

结果：
```response
┌─min(CMPLNT_FR_TM)─┬─max(CMPLNT_FR_TM)─┐
│ 00:00:00          │ 23:59:00          │
└───────────────────┴───────────────────┘
```

```sh title="CMPLNT_TO_TM"
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select min(CMPLNT_TO_TM), max(CMPLNT_TO_TM) FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
FORMAT PrettyCompact"
```

结果：
```response
┌─min(CMPLNT_TO_TM)─┬─max(CMPLNT_TO_TM)─┐
│ (null)            │ 23:59:00          │
└───────────────────┴───────────────────┘
```

## 制定计划 {#make-a-plan}

依据上述调查：
- `JURISDICTION_CODE`应被转换为`UInt8`。
- `PARKS_NM`应被转换为`LowCardinality(String)`
- `CMPLNT_FR_DT`和`CMPLNT_FR_TM`始终被填充（可能默认时间为`00:00:00`）
- `CMPLNT_TO_DT`和`CMPLNT_TO_TM`可能为空
- 日期和时间在源中存储在不同的字段中
- 日期格式是`mm/dd/yyyy`
- 时间格式是`hh:mm:ss`
- 日期和时间可以合并为DateTime类型
- 有些日期早于1970年1月1日，这意味着我们需要64位的DateTime

:::note
还需要对类型进行更多更改，所有这些都可以通过遵循相同的调查步骤确定。查看字段中不同字符串的数量，数字的最小值和最大值，作出决定。本指南稍后的表架构包含许多低基数字符串和无符号整数字段，及很少的浮点数字。
:::

## 合并日期和时间字段 {#concatenate-the-date-and-time-fields}

要将日期和时间字段`CMPLNT_FR_DT`和`CMPLNT_FR_TM`合并为一个`String`，以便可转换为`DateTime`，请选择连接运算符连接这两个字段：`CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM`。`CMPLNT_TO_DT`和`CMPLNT_TO_TM`字段的处理类似。

```sh
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM AS complaint_begin FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
LIMIT 10
FORMAT PrettyCompact"
```

结果：
```response
┌─complaint_begin─────┐
│ 07/29/2010 00:01:00 │
│ 12/01/2011 12:00:00 │
│ 04/01/2017 15:00:00 │
│ 03/26/2018 17:20:00 │
│ 01/01/2019 00:00:00 │
│ 06/14/2019 00:00:00 │
│ 11/29/2021 20:00:00 │
│ 12/04/2021 00:35:00 │
│ 12/05/2021 12:50:00 │
│ 12/07/2021 20:30:00 │
└─────────────────────┘
```

## 将日期和时间字符串转换为DateTime64类型 {#convert-the-date-and-time-string-to-a-datetime64-type}

在本指南的早些时候，我们发现TSV文件中有些日期在1970年1月1日之前，这意味着我们需要用于日期的64位DateTime类型。日期还需要从`MM/DD/YYYY`格式转换为`YYYY/MM/DD`格式。这两者都可以使用[`parseDateTime64BestEffort()`](../../sql-reference/functions/type-conversion-functions.md#parsedatetime64besteffort)来完成。

```sh
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"WITH (CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM) AS CMPLNT_START,
      (CMPLNT_TO_DT || ' ' || CMPLNT_TO_TM) AS CMPLNT_END
select parseDateTime64BestEffort(CMPLNT_START) AS complaint_begin,
       parseDateTime64BestEffortOrNull(CMPLNT_END) AS complaint_end
FROM file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
ORDER BY complaint_begin ASC
LIMIT 25
FORMAT PrettyCompact"
```

上述第二和第三行包含了前一步的连接，第四和第五行将字符串解析为`DateTime64`。由于投诉的结束时间并不一定存在，因此使用了`parseDateTime64BestEffortOrNull`。

结果：
```response
┌─────────complaint_begin─┬───────────complaint_end─┐
│ 1925-01-01 10:00:00.000 │ 2021-02-12 09:30:00.000 │
│ 1925-01-01 11:37:00.000 │ 2022-01-16 11:49:00.000 │
│ 1925-01-01 15:00:00.000 │ 2021-12-31 00:00:00.000 │
│ 1925-01-01 15:00:00.000 │ 2022-02-02 22:00:00.000 │
│ 1925-01-01 19:00:00.000 │ 2022-04-14 05:00:00.000 │
│ 1955-09-01 19:55:00.000 │ 2022-08-01 00:45:00.000 │
│ 1972-03-17 11:40:00.000 │ 2022-03-17 11:43:00.000 │
│ 1972-05-23 22:00:00.000 │ 2022-05-24 09:00:00.000 │
│ 1972-05-30 23:37:00.000 │ 2022-05-30 23:50:00.000 │
│ 1972-07-04 02:17:00.000 │                    ᴺᵁᴸᴸ │
│ 1973-01-01 00:00:00.000 │                    ᴺᵁᴸᴸ │
│ 1975-01-01 00:00:00.000 │                    ᴺᵁᴸᴸ │
│ 1976-11-05 00:01:00.000 │ 1988-10-05 23:59:00.000 │
│ 1977-01-01 00:00:00.000 │ 1977-01-01 23:59:00.000 │
│ 1977-12-20 00:01:00.000 │                    ᴺᵁᴸᴸ │
│ 1981-01-01 00:01:00.000 │                    ᴺᵁᴸᴸ │
│ 1981-08-14 00:00:00.000 │ 1987-08-13 23:59:00.000 │
│ 1983-01-07 00:00:00.000 │ 1990-01-06 00:00:00.000 │
│ 1984-01-01 00:01:00.000 │ 1984-12-31 23:59:00.000 │
│ 1985-01-01 12:00:00.000 │ 1987-12-31 15:00:00.000 │
│ 1985-01-11 09:00:00.000 │ 1985-12-31 12:00:00.000 │
│ 1986-03-16 00:05:00.000 │ 2022-03-16 00:45:00.000 │
│ 1987-01-07 00:00:00.000 │ 1987-01-09 00:00:00.000 │
│ 1988-04-03 18:30:00.000 │ 2022-08-03 09:45:00.000 │
│ 1988-07-29 12:00:00.000 │ 1990-07-27 22:00:00.000 │
└─────────────────────────┴─────────────────────────┘
```
:::note
上述显示为`1925`的日期是数据中的错误。原始数据中有几条记录的日期在`1019`至`1022`年之间，应该是`2019`至`2022`年。它们被存储为1925年1月1日，因为这是具有64位DateTime的最早日期。
:::

## 创建表 {#create-a-table}

对列使用的数据类型的决定反映在下面的表架构中。我们还需要决定表的`ORDER BY`和`PRIMARY KEY`。必须指定至少一个`ORDER BY`或`PRIMARY KEY`。以下是在决定包含哪些列进行`ORDER BY`时的一些指南，更多信息见本文末尾的*后续步骤*部分。

### Order By和Primary Key子句 {#order-by-and-primary-key-clauses}

- `ORDER BY`元组应包括用于查询过滤的字段
- 为了最大化磁盘上的压缩，`ORDER BY`元组应按升序基数排序
- 如果存在，`PRIMARY KEY`元组必须是`ORDER BY`元组的子集
- 如果仅指定`ORDER BY`，则将使用相同的元组作为`PRIMARY KEY`
- 如果指定了`PRIMARY KEY`元组，则使用该元组创建主键索引，否则使用`ORDER BY`元组
- `PRIMARY KEY`索引保存在主内存中

通过查看数据集以及可能通过查询得到的问题，我们可能决定查看五个区内的犯罪类型。以下字段可能会包含在`ORDER BY`中：

| 列名      | 描述（来自数据字典）                       |
| ----------- | ------------------------------------- |
| OFNS_DESC   | 与关键代码相对应的犯罪描述                    |
| RPT_DT      | 事件报告给警方的日期                         |
| BORO_NM     | 事件发生的区的名称                         |

查询TSV文件以获取这三列候选项的基数：

```bash
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select formatReadableQuantity(uniq(OFNS_DESC)) as cardinality_OFNS_DESC,
        formatReadableQuantity(uniq(RPT_DT)) as cardinality_RPT_DT,
        formatReadableQuantity(uniq(BORO_NM)) as cardinality_BORO_NM
  FROM
  file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
  FORMAT PrettyCompact"
```

结果：
```response
┌─cardinality_OFNS_DESC─┬─cardinality_RPT_DT─┬─cardinality_BORO_NM─┐
│ 60.00                 │ 306.00             │ 6.00                │
└───────────────────────┴────────────────────┴─────────────────────┘
```

按基数排序，`ORDER BY`结果为：

```sql
ORDER BY ( BORO_NM, OFNS_DESC, RPT_DT )
```
:::note
下面的表将使用更容易读取的列名，上述名称将映射到
```sql
ORDER BY ( borough, offense_description, date_reported )
```
:::

综合数据类型的更改和`ORDER BY`元组形成以下表结构：

```sql
CREATE TABLE NYPD_Complaint (
    complaint_number     String,
    precinct             UInt8,
    borough              LowCardinality(String),
    complaint_begin      DateTime64(0,'America/New_York'),
    complaint_end        DateTime64(0,'America/New_York'),
    was_crime_completed  String,
    housing_authority    String,
    housing_level_code   UInt32,
    jurisdiction_code    UInt8,
    jurisdiction         LowCardinality(String),
    offense_code         UInt8,
    offense_level        LowCardinality(String),
    location_descriptor  LowCardinality(String),
    offense_description  LowCardinality(String),
    park_name            LowCardinality(String),
    patrol_borough       LowCardinality(String),
    PD_CD                UInt16,
    PD_DESC              String,
    location_type        LowCardinality(String),
    date_reported        Date,
    transit_station      LowCardinality(String),
    suspect_age_group    LowCardinality(String),
    suspect_race         LowCardinality(String),
    suspect_sex          LowCardinality(String),
    transit_district     UInt8,
    victim_age_group     LowCardinality(String),
    victim_race          LowCardinality(String),
    victim_sex           LowCardinality(String),
    NY_x_coordinate      UInt32,
    NY_y_coordinate      UInt32,
    Latitude             Float64,
    Longitude            Float64
) ENGINE = MergeTree
  ORDER BY ( borough, offense_description, date_reported )
```

### 查找表的主键 {#finding-the-primary-key-of-a-table}

ClickHouse `system`数据库，特别是`system.table`包含有关您刚刚创建的表的所有信息。此查询显示了`ORDER BY`（排序键）和`PRIMARY KEY`：
```sql
SELECT
    partition_key,
    sorting_key,
    primary_key,
    table
FROM system.tables
WHERE table = 'NYPD_Complaint'
FORMAT Vertical
```

响应
```response
Query id: 6a5b10bf-9333-4090-b36e-c7f08b1d9e01

Row 1:
──────
partition_key:
sorting_key:   borough, offense_description, date_reported
primary_key:   borough, offense_description, date_reported
table:         NYPD_Complaint

1 row in set. Elapsed: 0.001 sec.
```

## 预处理并导入数据 {#preprocess-import-data}

我们将使用`clickhouse-local`工具进行数据预处理，使用`clickhouse-client`进行上传。

### 使用的`clickhouse-local`参数 {#clickhouse-local-arguments-used}

:::tip
`table='input'`出现在下面的clickhouse-local参数中。clickhouse-local接受提供的输入（`cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`）并将其插入表中。默认情况下，表名为`table`。在本指南中，表的名称设置为`input`以使数据流更加清晰。clickhouse-local的最后一个参数是选择表中的查询（`FROM input`），然后通过管道传递给`clickhouse-client`以填充表`NYPD_Complaint`。
:::

```sql
cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv \
  | clickhouse-local --table='input' --input-format='TSVWithNames' \
  --input_format_max_rows_to_read_for_schema_inference=2000 \
  --query "
    WITH (CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM) AS CMPLNT_START,
     (CMPLNT_TO_DT || ' ' || CMPLNT_TO_TM) AS CMPLNT_END
    SELECT
      CMPLNT_NUM                                  AS complaint_number,
      ADDR_PCT_CD                                 AS precinct,
      BORO_NM                                     AS borough,
      parseDateTime64BestEffort(CMPLNT_START)     AS complaint_begin,
      parseDateTime64BestEffortOrNull(CMPLNT_END) AS complaint_end,
      CRM_ATPT_CPTD_CD                            AS was_crime_completed,
      HADEVELOPT                                  AS housing_authority_development,
      HOUSING_PSA                                 AS housing_level_code,
      JURISDICTION_CODE                           AS jurisdiction_code,
      JURIS_DESC                                  AS jurisdiction,
      KY_CD                                       AS offense_code,
      LAW_CAT_CD                                  AS offense_level,
      LOC_OF_OCCUR_DESC                           AS location_descriptor,
      OFNS_DESC                                   AS offense_description,
      PARKS_NM                                    AS park_name,
      PATROL_BORO                                 AS patrol_borough,
      PD_CD,
      PD_DESC,
      PREM_TYP_DESC                               AS location_type,
      toDate(parseDateTimeBestEffort(RPT_DT))     AS date_reported,
      STATION_NAME                                AS transit_station,
      SUSP_AGE_GROUP                              AS suspect_age_group,
      SUSP_RACE                                   AS suspect_race,
      SUSP_SEX                                    AS suspect_sex,
      TRANSIT_DISTRICT                            AS transit_district,
      VIC_AGE_GROUP                               AS victim_age_group,
      VIC_RACE                                    AS victim_race,
      VIC_SEX                                     AS victim_sex,
      X_COORD_CD                                  AS NY_x_coordinate,
      Y_COORD_CD                                  AS NY_y_coordinate,
      Latitude,
      Longitude
    FROM input" \
  | clickhouse-client --query='INSERT INTO NYPD_Complaint FORMAT TSV'
```

## 验证数据 {#validate-data}

:::note
数据集每年更改一次或多次，您的计数可能与本文件中的数据不匹配。
:::

查询：

```sql
SELECT count()
FROM NYPD_Complaint
```

结果：

```text
┌─count()─┐
│  208993 │
└─────────┘

1 row in set. Elapsed: 0.001 sec.
```

ClickHouse中的数据集大小仅为原始TSV文件的12%，与原始TSV文件的大小进行比较：

查询：

```sql
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'NYPD_Complaint'
```

结果：
```text
┌─formatReadableSize(total_bytes)─┐
│ 8.63 MiB                        │
└─────────────────────────────────┘
```


## 运行一些查询 {#run-queries}

### 查询1. 按月比较投诉数量 {#query-1-compare-the-number-of-complaints-by-month}

查询：

```sql
SELECT
    dateName('month', date_reported) AS month,
    count() AS complaints,
    bar(complaints, 0, 50000, 80)
FROM NYPD_Complaint
GROUP BY month
ORDER BY complaints DESC
```

结果：
```response
Query id: 7fbd4244-b32a-4acf-b1f3-c3aa198e74d9

┌─month─────┬─complaints─┬─bar(count(), 0, 50000, 80)───────────────────────────────┐
│ March     │      34536 │ ███████████████████████████████████████████████████████▎ │
│ May       │      34250 │ ██████████████████████████████████████████████████████▋  │
│ April     │      32541 │ ████████████████████████████████████████████████████     │
│ January   │      30806 │ █████████████████████████████████████████████████▎       │
│ February  │      28118 │ ████████████████████████████████████████████▊            │
│ November  │       7474 │ ███████████▊                                             │
│ December  │       7223 │ ███████████▌                                             │
│ October   │       7070 │ ███████████▎                                             │
│ September │       6910 │ ███████████                                              │
│ August    │       6801 │ ██████████▊                                              │
│ June      │       6779 │ ██████████▋                                              │
│ July      │       6485 │ ██████████▍                                              │
└───────────┴────────────┴──────────────────────────────────────────────────────────┘

12 rows in set. Elapsed: 0.006 sec. Processed 208.99 thousand rows, 417.99 KB (37.48 million rows/s., 74.96 MB/s.)
```

### 查询2. 按区比较投诉总数 {#query-2-compare-total-number-of-complaints-by-borough}

查询：

```sql
SELECT
    borough,
    count() AS complaints,
    bar(complaints, 0, 125000, 60)
FROM NYPD_Complaint
GROUP BY borough
ORDER BY complaints DESC
```

结果：
```response
Query id: 8cdcdfd4-908f-4be0-99e3-265722a2ab8d

┌─borough───────┬─complaints─┬─bar(count(), 0, 125000, 60)──┐
│ BROOKLYN      │      57947 │ ███████████████████████████▋ │
│ MANHATTAN     │      53025 │ █████████████████████████▍   │
│ QUEENS        │      44875 │ █████████████████████▌       │
│ BRONX         │      44260 │ █████████████████████▏       │
│ STATEN ISLAND │       8503 │ ████                         │
│ (null)        │        383 │ ▏                            │
└───────────────┴────────────┴──────────────────────────────┘

6 rows in set. Elapsed: 0.008 sec. Processed 208.99 thousand rows, 209.43 KB (27.14 million rows/s., 27.20 MB/s.)
```

## 后续步骤 {#next-steps}

[ClickHouse中稀疏主索引的实用介绍](/guides/best-practices/sparse-primary-indexes.md)讨论了ClickHouse索引与传统关系数据库的差异，ClickHouse如何构建和使用稀疏主索引，以及索引最佳实践。
