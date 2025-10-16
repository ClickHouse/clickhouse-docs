---
'description': '在 5 步中摄取和查询 Tab 分隔值数据'
'sidebar_label': 'NYPD Complaint Data'
'slug': '/getting-started/example-datasets/nypd_complaint_data'
'title': 'NYPD Complaint Data'
'doc_type': 'reference'
---

Tab 分隔值，或称 TSV 文件，是一种常见的文件格式，可能会在文件的第一行包含字段标题。ClickHouse 可以导入 TSV 文件，也可以在不导入文件的情况下查询 TSV 文件。本指南涵盖这两种情况。如果您需要查询或导入 CSV 文件，使用相同的技巧，只需在格式参数中将 `TSV` 替换为 `CSV`。

在阅读本指南时，您将：
- **调查**：查询 TSV 文件的结构和内容。
- **确定目标 ClickHouse 模式**：选择适当的数据类型，并将现有数据映射到这些类型。
- **创建 ClickHouse 表**。
- **预处理并流式** 将数据发送到 ClickHouse。
- **对 ClickHouse 运行一些查询**。

本指南使用的数据集来自纽约市开放数据团队，包含有关“向纽约市警察局 (NYPD) 报告的所有有效重罪、轻罪和违规犯罪的数据”。截至撰写时，数据文件大小为 166MB，但会定期更新。

**来源**：[data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)
**使用条款**：https://www1.nyc.gov/home/terms-of-use.page

## 前提条件 {#prerequisites}
- 通过访问 [NYPD Complaint Data Current (Year To Date)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) 页面，点击导出按钮，并选择 **TSV for Excel** 下载数据集。
- 安装 [ClickHouse 服务器和客户端](../../getting-started/install/install.mdx)

### 关于本指南中描述的命令的说明 {#a-note-about-the-commands-described-in-this-guide}
本指南中有两种类型的命令：
- 一些命令是查询 TSV 文件，这些命令在命令提示符下运行。
- 其他命令是查询 ClickHouse 的，这些命令在 `clickhouse-client` 或 Play UI 中运行。

:::note
本指南中的示例假定您已将 TSV 文件保存到 `${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`，如果需要，请调整命令。
:::

## 熟悉 TSV 文件 {#familiarize-yourself-with-the-tsv-file}

在开始使用 ClickHouse 数据库之前，请先熟悉数据。

### 查看源 TSV 文件中的字段 {#look-at-the-fields-in-the-source-tsv-file}

这是查询 TSV 文件的命令示例，但请暂时不要运行它。
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
大多数情况下，上述命令会告知您输入数据中哪些字段是数字，哪些是字符串，哪些是元组。但这并不总是如此。由于 ClickHouse 通常用于包含数十亿条记录的数据集，因此默认检查的行数为 100，目的是为了 [推断模式](/integrations/data-formats/json/inference)，以避免解析数十亿行来推断模式。下面的响应可能与您看到的不同，因为该数据集每年会更新几次。查看数据字典您会看到，CMPLNT_NUM 被指定为文本，而不是数字。通过将推断的默认值（100 行）更改为 `SETTINGS input_format_max_rows_to_read_for_schema_inference=2000`，您可以更好地了解内容。

注意：从版本 22.5 开始，推断模式的默认值现在为 25,000 行，因此仅在您使用的是旧版本或需要超过 25,000 行进行抽样时才更改此设置。
:::

在命令提示符下运行此命令。您将使用 `clickhouse-local` 查询您下载的 TSV 文件中的数据。
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

此时，您应该检查 TSV 文件中的列是否与 [数据集网页](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) 中的 **Columns in this Dataset** 部分中指定的名称和类型匹配。数据类型不是很具体，所有数字字段都设置为 `Nullable(Float64)`，所有其他字段都是 `Nullable(String)`。当您创建一个 ClickHouse 表来存储数据时，可以指定更适合和更高性能的类型。

### 确定适当的模式 {#determine-the-proper-schema}

为了确定字段应该使用什么类型，有必要了解数据的外观。例如，字段 `JURISDICTION_CODE` 是数字：它应该是 `UInt8`，还是 `Enum`，或者 `Float64` 是否合适？

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

查询响应显示，`JURISDICTION_CODE` 很适合使用 `UInt8`。

类似地，查看一些 `String` 字段，看看它们是否适合用作 `DateTime` 或 [`LowCardinality(String)`](../../sql-reference/data-types/lowcardinality.md) 字段。

例如，字段 `PARKS_NM` 被描述为“NYC 公园、游乐场或绿地的名称（如果适用，州立公园不包括在内）”。纽约市的公园名称可能是 `LowCardinality(String)` 的好候选：

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

看看一些公园名称：
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

截至撰写时，所使用的数据集中 `PARK_NM` 列只有几百个不同的公园和游乐场。根据 [LowCardinality](/sql-reference/data-types/lowcardinality#description) 的建议，保持在 `LowCardinality(String)` 字段中不超过 10,000 个不同字符串，这个数字很小。

### DateTime 字段 {#datetime-fields}
根据 [数据集网页](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) 中的 **Columns in this Dataset** 部分，存在报告事件开始和结束的日期和时间字段。查看 `CMPLNT_FR_DT` 和 `CMPLT_TO_DT` 的最小值和最大值，可以大致了解这些字段是否总是被填充：

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

根据以上调查：
- `JURISDICTION_CODE` 应该被转换为 `UInt8`。
- `PARKS_NM` 应该被转换为 `LowCardinality(String)`
- `CMPLNT_FR_DT` 和 `CMPLNT_FR_TM` 始终被填充（可能默认时间为 `00:00:00`）
- `CMPLNT_TO_DT` 和 `CMPLNT_TO_TM` 可能为空
- 源中日期和时间存储在不同字段中
- 日期为 `mm/dd/yyyy` 格式
- 时间为 `hh:mm:ss` 格式
- 日期和时间可以合并为 DateTime 类型
- 存在一些日期在 1970 年 1 月 1 日之前，这意味着我们需要一个 64 位的 DateTime

:::note
还有很多类型转换的变化，可以通过遵循相同的调查步骤来确定。查看字段中不同字符串的数量，数字的最小值和最大值，并作出决定。后面指南中给出的表模式有许多低基数字符串和非负整数字段，浮点数很少。
:::

## 合并日期和时间字段 {#concatenate-the-date-and-time-fields}

要将日期和时间字段 `CMPLNT_FR_DT` 和 `CMPLNT_FR_TM` 合并为一个可以转换为 `DateTime` 的 `String`，选择两个字段并用连接操作符连接：`CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM`。`CMPLNT_TO_DT` 和 `CMPLNT_TO_TM` 字段类似处理。

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

在本指南早些时候，我们发现 TSV 文件中有些日期早于 1970 年 1 月 1 日，这意味着我们需要一个 64 位的 DateTime 类型来存储这些日期。这些日期还需要从 `MM/DD/YYYY` 转换为 `YYYY/MM/DD` 格式。这两者都可以通过 [`parseDateTime64BestEffort()`](../../sql-reference/functions/type-conversion-functions.md#parsedatetime64besteffort) 实现。

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

上述第 2 行和第 3 行包含了上一步的连接，第 4 行和第 5 行将字符串解析为 `DateTime64`。由于投诉结束时间不一定存在，因此使用 `parseDateTime64BestEffortOrNull`。

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
上述日期 `1925` 是由于数据中的错误而显示的。原始数据中有几个记录的日期在 `1019` 到 `1022` 年之间，实际上应该为 `2019` 到 `2022`。它们被存储为 1925 年 1 月 1 日，因为这是 64 位 DateTime 可以表示的最早日期。
:::

## 创建表 {#create-a-table}

以上对列的数据类型的决策反映在下面的表架构中。我们还需要决定用于表的 `ORDER BY` 和 `PRIMARY KEY`。`ORDER BY` 或 `PRIMARY KEY` 中至少需要指定其中之一。以下是确定要包含在 `ORDER BY` 中的字段的一些指导方针，更多信息请参见本文件末尾的 *Next Steps* 部分。

### `ORDER BY` 和 `PRIMARY KEY` 子句 {#order-by-and-primary-key-clauses}

- `ORDER BY` 元组应包括用于查询过滤器的字段
- 为了最大化磁盘上的压缩，`ORDER BY` 元组应按升序基数排序
- 如果存在，则 `PRIMARY KEY` 元组必须是 `ORDER BY` 元组的一个子集
- 如果仅指定 `ORDER BY`，则使用相同的元组作为 `PRIMARY KEY`
- 如果指定了 `PRIMARY KEY`，则创建时使用 `PRIMARY KEY` 元组；否则，使用 `ORDER BY` 元组
- `PRIMARY KEY` 索引存储在主内存中

查看数据集以及可能通过查询回答的问题，我们可能会决定查看纽约市五个区内随时间变化的犯罪类型。这些字段可能会被包含在 `ORDER BY` 中：

| 列        | 描述（来自数据字典）                       |
| --------- | ------------------------------------------ |
| OFNS_DESC | 与关键代码对应的罪犯描述                     |
| RPT_DT    | 事件向警方报告的日期                        |
| BORO_NM   | 事件发生的辖区名称                          |

查询 TSV 文件以获取这三个候选列的基数：

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
按基数排序，`ORDER BY` 变为：

```sql
ORDER BY ( BORO_NM, OFNS_DESC, RPT_DT )
```
:::note
下表将使用更易读的列名，以上名称将映射到
```sql
ORDER BY ( borough, offense_description, date_reported )
```
:::

综合数据类型更改和 `ORDER BY` 元组，得到此表结构：

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

ClickHouse 的 `system` 数据库，特别是 `system.table` 中包含您刚创建的表的所有信息。此查询显示 `ORDER BY`（排序键）和 `PRIMARY KEY`：
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

## 预处理和导入数据 {#preprocess-import-data}

我们将使用 `clickhouse-local` 工具进行数据预处理，并使用 `clickhouse-client` 上传它。

### `clickhouse-local` 使用的参数 {#clickhouse-local-arguments-used}

:::tip
`table='input'` 出现在下面的 clickhouse-local 参数中。clickhouse-local 取提供的输入（`cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`）并将其插入一个表中。默认情况下，表的名称为 `table`。在本指南中，表的名称设置为 `input`，以使数据流更清晰。clickhouse-local 的最后一个参数是一个从表中选择的查询（`FROM input`），然后将其传递给 `clickhouse-client` 以填充表 `NYPD_Complaint`。
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
数据集每年会发生一次或多次变化，您的计数可能与本文件中的数据不匹配。
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

ClickHouse 中数据集的大小仅为原始 TSV 文件的 12%，请比较原始 TSV 文件的大小与表的大小：

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

### 查询 1. 按月比较投诉数量 {#query-1-compare-the-number-of-complaints-by-month}

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

### 查询 2. 按辖区比较总投诉数量 {#query-2-compare-total-number-of-complaints-by-borough}

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

## 下一步 {#next-steps}

[A Practical Introduction to Sparse Primary Indexes in ClickHouse](/guides/best-practices/sparse-primary-indexes.md) 讨论了 ClickHouse 索引与传统关系数据库之间的差异，ClickHouse 如何构建和使用稀疏主索引，以及索引的最佳实践。
