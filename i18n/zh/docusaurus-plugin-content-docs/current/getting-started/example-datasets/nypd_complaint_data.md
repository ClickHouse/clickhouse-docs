---
description: '通过 5 个步骤摄取并查询制表符分隔值数据'
sidebar_label: 'NYPD 投诉数据'
slug: /getting-started/example-datasets/nypd_complaint_data
title: 'NYPD Complaint Data'
doc_type: 'guide'
keywords: ['示例数据集', 'nypd', '犯罪数据', '样本数据', '公共数据']
---

制表符分隔值（Tab Separated Value，TSV）文件非常常见，且通常在文件第一行包含字段标题。ClickHouse 可以摄取 TSV 文件，也可以在不摄取文件的情况下直接查询 TSV。本指南涵盖这两种情况。如果你需要查询或摄取 CSV 文件，可以使用相同的方法，只需在格式参数中将 `TSV` 替换为 `CSV` 即可。

在完成本指南的过程中，你将会：

- **探索**：查询 TSV 文件的结构和内容。
- **确定目标 ClickHouse 表结构**：选择合适的数据类型，并将现有数据映射到这些类型。
- **创建一个 ClickHouse 表**。
- **预处理并流式摄取** 数据到 ClickHouse。
- **在 ClickHouse 上运行一些查询**。

本指南使用的数据集来自 NYC Open Data 团队，包含关于“所有向纽约市警察局 (NYPD) 报告的有效重罪、轻罪和违规犯罪”的数据。在撰写本文时，数据文件大小为 166MB，但会定期更新。

**来源**: [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)
**使用条款**: https://www1.nyc.gov/home/terms-of-use.page

## 前置条件 {#prerequisites}

- 访问 [NYPD Complaint Data Current (Year To Date)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) 页面，点击 “Export” 按钮，然后选择 **TSV for Excel** 下载数据集。
- 安装 [ClickHouse 服务器和客户端](../../getting-started/install/install.mdx)

### 本指南中所述命令的说明 {#a-note-about-the-commands-described-in-this-guide}

本指南中涉及两类命令：

- 部分命令用于查询 TSV 文件，这些命令需要在命令行提示符中运行。
- 其余命令用于查询 ClickHouse，这些命令需要在 `clickhouse-client` 或 Play UI 中运行。

:::note
本指南中的示例假定您已将 TSV 文件保存为 `${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`，如有需要请相应调整命令。
:::

## 熟悉 TSV 文件 {#familiarize-yourself-with-the-tsv-file}

在开始使用 ClickHouse 数据库之前，请先了解一下这些数据。

### 查看源 TSV 文件中的字段 {#look-at-the-fields-in-the-source-tsv-file}

这是一个查询 TSV 文件的命令示例，但先不要运行。

```sh
clickhouse-local --query \
"describe file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')"
```

示例结果

```response
CMPLNT_NUM                  Nullable(Float64)
ADDR_PCT_CD                 Nullable(Float64)
BORO_NM                     Nullable(String)
CMPLNT_FR_DT                Nullable(String)
CMPLNT_FR_TM                Nullable(String)
```

:::tip
在大多数情况下，上述命令会告诉你输入数据中哪些字段是数值型、哪些是字符串、哪些是元组。但并非总是如此。由于 ClickHouse 经常用于包含数十亿记录的数据集，为了避免为推断模式而解析数十亿行数据，系统默认只检查一定数量（100）行来[推断模式](/integrations/data-formats/json/inference)。下面的响应可能与你实际看到的不一致，因为该数据集每年会更新多次。查看数据字典可以看到，CMPLNT&#95;NUM 被定义为文本而非数值。通过使用 `SETTINGS input_format_max_rows_to_read_for_schema_inference=2000` 覆盖用于推断的默认 100 行，你可以更好地了解数据内容。

注意：从 22.5 版本开始，用于推断模式的默认行数已增加到 25,000 行，因此只有在使用更早版本，或需要抽样超过 25,000 行时，才需要修改该设置。
:::

在命令行提示符下运行此命令。你将使用 `clickhouse-local` 来查询你下载的 TSV 文件中的数据。

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

此时应检查 TSV 文件中的列是否与[数据集网页](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)中 **Columns in this Dataset** 部分所列的名称和类型一致。数据类型本身并不十分具体，所有数值字段都被设为 `Nullable(Float64)`，其余字段则为 `Nullable(String)`。在创建用于存储这些数据的 ClickHouse 表时，可以为各字段指定更合适且性能更优的数据类型。


### 确定合适的表结构 {#determine-the-proper-schema}

要判断各个字段应使用什么数据类型，必须先了解数据的具体形态。比如，字段 `JURISDICTION_CODE` 是一个数值：它应该是 `UInt8`，还是 `Enum`，或者使用 `Float64` 更合适？

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

查询响应显示，`JURISDICTION_CODE` 很适合作为 `UInt8` 类型。

同样地，查看一些 `String` 字段，判断它们是否适合作为 `DateTime` 或 [`LowCardinality(String)`](../../sql-reference/data-types/lowcardinality.md) 字段。

例如，字段 `PARKS_NM` 的描述是 &quot;Name of NYC park, playground or greenspace of occurrence, if applicable (state parks are not included)&quot;。纽约市公园名称就是一个很适合使用 `LowCardinality(String)` 的候选字段：

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

来看看一些公园的名称：

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

在撰写本文时所使用的数据集中，`PARK_NM` 列中只有几百个不同的公园和游乐场。根据 [LowCardinality](/sql-reference/data-types/lowcardinality#description) 中的建议，在 `LowCardinality(String)` 字段中不同字符串的数量应保持在 10,000 以下，从这个意义上说，这算是一个较小的数量。


### DateTime 字段 {#datetime-fields}

根据该[数据集网页](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)中 **Columns in this Dataset** 部分的说明，可以看到该数据集中有表示报告事件开始和结束时间的日期和时间字段。查看 `CMPLNT_FR_DT` 和 `CMPLT_TO_DT` 的最小值和最大值，可以大致判断这些字段是否始终被填充：

```sh title="CMPLNT_FR_DT"
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select min(CMPLNT_FR_DT), max(CMPLNT_FR_DT) FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
FORMAT PrettyCompact"
```

预期结果：

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

结果如下：

```response
┌─min(CMPLNT_TO_TM)─┬─max(CMPLNT_TO_TM)─┐
│ (null)            │ 23:59:00          │
└───────────────────┴───────────────────┘
```


## 制定计划 {#make-a-plan}

基于上述分析结果：

- `JURISDICTION_CODE` 应转换为 `UInt8`。
- `PARKS_NM` 应转换为 `LowCardinality(String)`。
- `CMPLNT_FR_DT` 和 `CMPLNT_FR_TM` 始终有值（可能使用 `00:00:00` 作为默认时间）。
- `CMPLNT_TO_DT` 和 `CMPLNT_TO_TM` 可能为空。
- 在源数据中，日期和时间存储在不同的字段中。
- 日期为 `mm/dd/yyyy` 格式。
- 时间为 `hh:mm:ss` 格式。
- 日期和时间可以拼接为 DateTime 类型。
- 存在一些早于 1970 年 1 月 1 日的日期，这意味着我们需要使用 64 位的 DateTime。

:::note
还有许多字段类型需要进一步修改，都可以通过相同的分析步骤来确定。查看字段中不同字符串的数量、数值字段的最小值和最大值，并据此做出决定。本指南后面给出的表结构中包含大量低基数字符串和无符号整数字段，而使用浮点数值类型的字段则非常少。
:::

## 连接日期和时间字段 {#concatenate-the-date-and-time-fields}

要将日期和时间字段 `CMPLNT_FR_DT` 和 `CMPLNT_FR_TM` 连接成一个可以转换为 `DateTime` 的 `String`，请选择这两个字段，并使用连接运算符将它们拼接在一起：`CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM`。`CMPLNT_TO_DT` 和 `CMPLNT_TO_TM` 字段的处理方式类似。

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


## 将日期和时间字符串转换为 DateTime64 类型 {#convert-the-date-and-time-string-to-a-datetime64-type}

在本指南前文中，我们发现 TSV 文件中包含早于 1970 年 1 月 1 日的日期，这意味着这些日期需要使用 64 位的 DateTime 类型。日期还需要从 `MM/DD/YYYY` 格式转换为 `YYYY/MM/DD` 格式。这两项操作都可以通过 [`parseDateTime64BestEffort()`](../../sql-reference/functions/type-conversion-functions.md#parseDateTime64BestEffort) 来完成。

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

上面的第 2 行和第 3 行包含了上一步的拼接结果，而第 4 行和第 5 行则将字符串解析为 `DateTime64`。由于投诉结束时间不一定总是存在，因此使用了 `parseDateTime64BestEffortOrNull`。

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
上面显示为 `1925` 的日期是由数据错误造成的。在原始数据中，有多条记录的年份为 `1019` - `1022`，而它们本应是 `2019` - `2022`。由于 64 位 DateTime 可表示的最早日期是 1925 年 1 月 1 日，因此这些错误日期都被存储为 1925 年 1 月 1 日。
:::


## 创建表 {#create-a-table}

上面对列所选用的数据类型会体现在下面的表结构中。我们还需要决定该表使用的 `ORDER BY` 和 `PRIMARY KEY`。必须至少指定 `ORDER BY` 或 `PRIMARY KEY` 中的一个。下面是一些关于如何选择包含在 `ORDER BY` 中的列的指导原则，更多信息请参见本文档末尾的 *后续步骤* 部分。

### `ORDER BY` 和 `PRIMARY KEY` 子句 {#order-by-and-primary-key-clauses}

* `ORDER BY` 元组应包含在查询过滤条件中使用的字段
* 为了在磁盘上实现最大压缩率，`ORDER BY` 元组中的字段应按基数从低到高排列
* 如果存在，`PRIMARY KEY` 元组必须是 `ORDER BY` 元组的子集
* 如果只指定了 `ORDER BY`，则会使用同一个元组作为 `PRIMARY KEY`
* 创建主键索引时，如果指定了 `PRIMARY KEY`，则使用其元组，否则使用 `ORDER BY` 元组
* `PRIMARY KEY` 索引会保存在内存中

结合数据集本身以及我们希望通过查询回答的问题，我们可能会决定按时间维度查看纽约市五个行政区中报告的犯罪类型。这样就可以将这些字段包含在 `ORDER BY` 中：

| Column        | Description (from the data dictionary) |
| ------------- | -------------------------------------- |
| OFNS&#95;DESC | 与键代码对应的犯罪描述                            |
| RPT&#95;DT    | 事件向警方报案的日期                             |
| BORO&#95;NM   | 事件发生所在行政区的名称                           |

查询 TSV 文件，统计这三个候选列的基数：

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

按照基数排序后，`ORDER BY` 子句为：

```sql
ORDER BY ( BORO_NM, OFNS_DESC, RPT_DT )
```

:::note
下表将使用更易读的列名，上面的名称将被映射为：

```sql
ORDER BY ( borough, offense_description, date_reported )
```

:::

将数据类型的更改与 `ORDER BY` 元组组合起来后，就得到如下表结构：

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

ClickHouse 的 `system` 数据库（尤其是 `system.table`）包含了你刚创建的表的所有信息。下面的查询会显示 `ORDER BY`（排序键）和 `PRIMARY KEY`：

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

我们将使用 `clickhouse-local` 工具进行数据预处理，并使用 `clickhouse-client` 来上传数据。

### `clickhouse-local` 使用的参数 {#clickhouse-local-arguments-used}

:::tip
`table='input'` 出现在下面传递给 clickhouse-local 的参数中。clickhouse-local 会获取提供的输入（`cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`），并将该输入插入到一张表中。默认情况下，这张表名为 `table`。在本指南中，将表名设置为 `input`，以便让数据流向更加清晰。传给 clickhouse-local 的最后一个参数是一个查询语句，它从该表中读取数据（`FROM input`），其输出随后通过管道传给 `clickhouse-client`，用于填充表 `NYPD_Complaint`。
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
该数据集每年会变更一次或多次，因此你的统计结果可能与本文档中的不一致。
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

在 ClickHouse 中，该数据集的大小仅为原始 TSV 文件的 12%。通过以下查询比较原始 TSV 文件与表的大小：

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


## 执行一些查询 {#run-queries}

### 查询 1：按月比较投诉数量 {#query-1-compare-the-number-of-complaints-by-month}

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


### 查询 2. 按行政区对比总投诉量 {#query-2-compare-total-number-of-complaints-by-borough}

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

[A Practical Introduction to Sparse Primary Indexes in ClickHouse](/guides/best-practices/sparse-primary-indexes.md) 讨论了 ClickHouse 索引与传统关系型数据库索引之间的差异、ClickHouse 如何构建和使用稀疏主索引，以及索引的最佳实践。