---
description: '用 5 个步骤摄取并查询制表符分隔值数据'
sidebar_label: 'NYPD 报案数据'
slug: /getting-started/example-datasets/nypd_complaint_data
title: 'NYPD 报案数据'
doc_type: 'guide'
keywords: ['示例数据集', 'nypd', '犯罪数据', '样本数据', '公共数据']
---

制表符分隔值（Tab Separated Value，TSV）文件很常见，第一行通常包含字段标题。ClickHouse 可以摄取 TSV 文件，也可以在不摄取文件的情况下直接查询 TSV。本指南将同时介绍这两种场景。如果您需要查询或摄取 CSV 文件，可以使用相同的方法，只需在格式参数中将 `TSV` 替换为 `CSV` 即可。

在学习本指南的过程中，您将：

- **探索**：查询 TSV 文件的结构和内容。
- **确定目标 ClickHouse 表结构（schema）**：选择合适的数据类型，并将现有数据映射到这些类型。
- **创建一个 ClickHouse 表**。
- **预处理并流式发送**数据到 ClickHouse。
- **在 ClickHouse 上运行一些查询**。

本指南中使用的数据集来自 NYC Open Data 团队，包含“所有报告给纽约市警察局（NYPD）的有效重罪、轻罪和违规犯罪”的相关数据。撰写本文时，数据文件大小为 166MB，但会定期更新。

**来源**: [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)  
**使用条款**: https://www1.nyc.gov/home/terms-of-use.page

## 前提条件 {#prerequisites}

- 访问 [NYPD Complaint Data Current (Year To Date)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) 页面，点击 **Export** 按钮，选择 **TSV for Excel** 下载数据集。
- 安装 [ClickHouse 服务器和客户端](../../getting-started/install/install.mdx)

### 关于本指南中所述命令的说明 {#a-note-about-the-commands-described-in-this-guide}

本指南中使用两类命令：

- 部分命令用于查询 TSV 文件，这些命令在命令行提示符下运行。
- 其余命令用于查询 ClickHouse，这些命令在 `clickhouse-client` 或 Play UI 中运行。

:::note
本指南中的示例假设您已将 TSV 文件保存到 `${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`，请根据需要调整命令。
:::

## 熟悉 TSV 文件 {#familiarize-yourself-with-the-tsv-file}

在开始使用 ClickHouse 数据库之前，请先熟悉一下该 TSV 文件中的数据。

### 查看源 TSV 文件中的字段

这是一个查询 TSV 文件的示例命令，但先不要运行它。

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
大多数情况下，上述命令会告诉你输入数据中哪些字段是数值型、哪些是字符串、哪些是元组。但并非总是如此。由于 ClickHouse 经常用于包含数十亿条记录的数据集，为了避免为推断表结构而解析数十亿行，默认仅检查一定数量（100）行来[推断模式](/integrations/data-formats/json/inference)。由于该数据集每年会更新数次，你看到的响应结果可能与下方示例不完全一致。查看数据字典可以发现，CMPLNT&#95;NUM 被指定为文本类型而非数值类型。通过使用设置 `SETTINGS input_format_max_rows_to_read_for_schema_inference=2000` 覆盖用于推断的默认 100 行，你可以更好地了解数据内容。

注意：从 22.5 版本开始，推断模式时默认会采样 25,000 行，因此仅在你使用更旧版本，或需要采样超过 25,000 行时才需要修改该设置。
:::

在命令行提示符下运行此命令。你将使用 `clickhouse-local` 来查询已下载的 TSV 文件中的数据。

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

此时，应检查 TSV 文件中的列是否与[数据集网页](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)中 **Columns in this Dataset** 部分指定的列名和类型一致。该数据集中的数据类型定义并不十分具体，所有数值型字段都被设置为 `Nullable(Float64)`，而其他所有字段则为 `Nullable(String)`。在创建用于存储这些数据的 ClickHouse 表时，可以指定更合适、性能更佳的数据类型。


### 确定合适的表结构

要确定字段应使用哪些数据类型，必须先了解数据的实际形态。例如，字段 `JURISDICTION_CODE` 是一个数值类型：它应该是 `UInt8`，还是 `Enum`，或者使用 `Float64` 更为合适？

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

查询结果显示，`JURISDICTION_CODE` 很适合使用 `UInt8` 类型。

类似地，查看一些 `String` 字段，并判断它们是否更适合作为 `DateTime` 或 [`LowCardinality(String)`](../../sql-reference/data-types/lowcardinality.md) 类型。

例如，字段 `PARKS_NM` 被描述为 &quot;若适用，此字段为事发地点所属纽约市公园、游乐场或绿地的名称（不包括州立公园）&quot;。纽约市公园的名称就很适合使用 `LowCardinality(String)` 类型：

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

来看一些公园的名称：

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
┌─公园名称───────────────────┐
│ (null)                     │
│ 阿瑟·利维公园              │
│ 詹姆斯·J·沃克公园          │
│ 贝尔特公园大道/海岸公园大道│
│ 展望公园                   │
│ 蒙蒂菲奥里广场             │
│ 萨顿广场公园               │
│ 乔伊斯·基尔默公园          │
│ 巷道运动场                 │
│ 阿斯托里亚公园             │
└────────────────────────────┘
```

在撰写本文时使用的数据集中，`PARK_NM` 列中只有几百个不同的公园和游乐场名称。根据 [LowCardinality](/sql-reference/data-types/lowcardinality#description) 的建议，`LowCardinality(String)` 字段中的不同字符串数量应控制在 10,000 个以下，因此这个数量相对较小。


### DateTime 字段

根据该[数据集网页](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)中的 **Columns in this Dataset** 部分，可以看到为报告事件的开始和结束分别提供了日期和时间字段。查看 `CMPLNT_FR_DT` 和 `CMPLT_TO_DT` 的最小值和最大值，可以帮助判断这些字段是否始终有值：

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

基于以上分析结果：

- `JURISDICTION_CODE` 应该转换为 `UInt8`。
- `PARKS_NM` 应该转换为 `LowCardinality(String)`。
- `CMPLNT_FR_DT` 和 `CMPLNT_FR_TM` 始终有值（可能使用 `00:00:00` 作为默认时间）
- `CMPLNT_TO_DT` 和 `CMPLNT_TO_TM` 可能为空
- 在源数据中，日期和时间存储在不同的字段中
- 日期为 `mm/dd/yyyy` 格式
- 时间为 `hh:mm:ss` 格式
- 日期和时间可以拼接为 DateTime 类型
- 存在早于 1970 年 1 月 1 日的日期，这意味着我们需要 64 位的 DateTime 类型

:::note
还需要对更多字段类型进行修改，这些都可以通过遵循相同的分析步骤来确定。查看字段中不同字符串取值的数量、数值字段的最小值和最大值，然后做出你的决策。本指南后面给出的表结构中包含了许多低基数的字符串字段和无符号整数字段，而浮点数值字段则很少。
:::

## 连接日期和时间字段

要将日期和时间字段 `CMPLNT_FR_DT` 和 `CMPLNT_FR_TM` 拼接为一个可以转换为 `DateTime` 的 `String`，请选择这两个字段，并使用连接运算符进行拼接：`CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM`。`CMPLNT_TO_DT` 和 `CMPLNT_TO_TM` 字段的处理方式相同。

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


## 将日期和时间字符串转换为 DateTime64 类型

在本指南的前面部分中，我们发现 TSV 文件中存在早于 1970 年 1 月 1 日的日期，这意味着这些日期需要使用 64 位的 DateTime 类型。同时，还需要将日期格式从 `MM/DD/YYYY` 转换为 `YYYY/MM/DD`。这两项操作都可以通过 [`parseDateTime64BestEffort()`](../../sql-reference/functions/type-conversion-functions.md#parsedatetime64besteffort) 来完成。

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

上面的第 2 行和第 3 行是上一步拼接得到的结果，而第 4 行和第 5 行将这些字符串解析为 `DateTime64`。由于投诉结束时间不一定存在，因此使用了 `parseDateTime64BestEffortOrNull`。

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
上方显示为 `1925` 的日期是源数据错误导致的。在原始数据中，有若干记录的年份为 `1019` - `1022`，本应为 `2019` - `2022`。由于 1925 年 1 月 1 日是 64 位 `DateTime` 类型所能表示的最早日期，这些错误日期被统一存储为 1925 年 1 月 1 日。
:::


## 创建表 {#create-a-table}

上文中针对各列所选用的数据类型会体现在下面的表结构中。我们还需要确定表所使用的 `ORDER BY` 和 `PRIMARY KEY`。必须至少指定 `ORDER BY` 或 `PRIMARY KEY` 其中之一。下面是关于如何决定在 `ORDER BY` 中包含哪些列的一些指导原则，更多信息请参见本文档末尾的 *后续步骤* 部分。

### `ORDER BY` 和 `PRIMARY KEY` 子句

* `ORDER BY` 元组应包含在查询过滤条件中使用的字段
* 为了最大化磁盘压缩率，`ORDER BY` 元组中的字段应按基数从低到高排序
* 如果存在 `PRIMARY KEY` 元组，则它必须是 `ORDER BY` 元组的子集
* 如果只指定了 `ORDER BY`，则会使用同一个元组作为 `PRIMARY KEY`
* 主键索引在指定时使用 `PRIMARY KEY` 元组创建，否则使用 `ORDER BY` 元组
* `PRIMARY KEY` 索引保存在内存中

结合数据集本身以及我们可能希望通过查询来回答的问题，我们或许会决定按时间维度查看纽约市五个行政区内报告的各类犯罪类型。那么这些字段就可以包含在 `ORDER BY` 中：

| Column        | Description (from the data dictionary) |
| ------------- | -------------------------------------- |
| OFNS&#95;DESC | 与键码对应的犯罪描述                             |
| RPT&#95;DT    | 向警方报告该事件的日期                            |
| BORO&#95;NM   | 事件发生所在行政区的名称                           |

针对 TSV 文件查询这三个候选列的基数：

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

按基数排序后，`ORDER BY` 子句变为：

```sql
ORDER BY ( BORO_NM, OFNS_DESC, RPT_DT )
```

:::note
下表将使用更易读的列名，并将上述名称映射到这些列名。

```sql
ORDER BY ( borough, offense_description, date_reported )
```

:::

综合数据类型的更改和 `ORDER BY` 元组后，得到如下表结构：

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


### 查找表的主键

ClickHouse 的 `system` 数据库，特别是 `system.table`，存储了你刚刚创建的表的所有信息。下面的查询会显示 `ORDER BY`（排序键）和 `PRIMARY KEY`：

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

第 1 行:
──────
分区键:
排序键:   borough, offense_description, date_reported
主键:   borough, offense_description, date_reported
表:         NYPD_Complaint

1 行结果集。耗时: 0.001 秒。
```


## 预处理并导入数据 {#preprocess-import-data}

我们将使用 `clickhouse-local` 工具对数据进行预处理，并使用 `clickhouse-client` 将其上传。

### 使用的 `clickhouse-local` 参数

:::tip
`table='input'` 出现在下面传给 clickhouse-local 的参数中。clickhouse-local 会获取提供的输入（`cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`），并将该输入插入到一张表中。默认情况下，这张表被命名为 `table`。在本指南中，将这张表的名称设置为 `input`，以使数据流更加清晰。传给 clickhouse-local 的最后一个参数是一个从该表查询的语句（`FROM input`），随后通过管道传给 `clickhouse-client`，用于向表 `NYPD_Complaint` 写入数据。
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


## 验证数据

:::note
数据集每年会变动一到多次，因此你得到的计数结果可能与本文档中的示例不完全一致。
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

1 行在集合中。耗时：0.001 秒。
```

ClickHouse 中的数据集大小只相当于原始 TSV 文件的 12%，将原始 TSV 文件的大小与表的大小进行比较：

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

### 查询 1：按月对比投诉数量

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
│ 三月     │      34536 │ ███████████████████████████████████████████████████████▎ │
│ 五月       │      34250 │ ██████████████████████████████████████████████████████▋  │
│ 四月     │      32541 │ ████████████████████████████████████████████████████     │
│ 一月   │      30806 │ █████████████████████████████████████████████████▎       │
│ 二月  │      28118 │ ████████████████████████████████████████████▊            │
│ 十一月  │       7474 │ ███████████▊                                             │
│ 十二月  │       7223 │ ███████████▌                                             │
│ 十月   │       7070 │ ███████████▎                                             │
│ 九月 │       6910 │ ███████████                                              │
│ 八月    │       6801 │ ██████████▊                                              │
│ 六月      │       6779 │ ██████████▋                                              │
│ 七月      │       6485 │ ██████████▍                                              │
└───────────┴────────────┴──────────────────────────────────────────────────────────┘

返回 12 行。耗时：0.006 秒。已处理 20.899 万行，417.99 KB（3748 万行/秒，74.96 MB/秒）
```


### 查询 2：按行政区对比投诉总数

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

6 行数据。耗时: 0.008 秒。处理了 208.99 千行，209.43 KB (27.14 百万行/秒，27.20 MB/秒)
```


## 后续步骤 {#next-steps}

[ClickHouse 稀疏主键索引的实用入门](/guides/best-practices/sparse-primary-indexes.md) 介绍了 ClickHouse 索引与传统关系型数据库之间的差异、ClickHouse 如何构建和使用稀疏主键索引，以及索引的最佳实践。