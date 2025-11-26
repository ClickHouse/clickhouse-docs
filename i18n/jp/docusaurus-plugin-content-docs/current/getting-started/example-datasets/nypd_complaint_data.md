---
description: 'タブ区切り値データの取り込みとクエリを 5 ステップで実行'
sidebar_label: 'NYPD 通報データ'
slug: /getting-started/example-datasets/nypd_complaint_data
title: 'NYPD 通報データ'
doc_type: 'guide'
keywords: ['サンプルデータセット', 'nypd', '犯罪データ', 'サンプルデータ', '公開データ']
---

タブ区切り値（Tab Separated Value、TSV）ファイルは一般的な形式で、ファイルの 1 行目にフィールド名（ヘッダー）が含まれることがあります。ClickHouse は TSV を取り込むことができるだけでなく、ファイルを取り込まずに TSV をクエリすることも可能です。本ガイドでは、この両方のケースを取り上げます。CSV ファイルをクエリまたは取り込む必要がある場合も、同じ手法が利用できるため、フォーマット引数内の `TSV` を `CSV` に置き換えるだけで対応できます。

本ガイドを進める中で、次のことを行います。
- **調査**: TSV ファイルの構造と内容をクエリします。
- **対象の ClickHouse スキーマを決定**: 適切なデータ型を選択し、既存のデータをそれらの型にマッピングします。
- **ClickHouse テーブルを作成します**。
- データを **前処理し、ClickHouse にストリーミングします**。
- ClickHouse に対して **いくつかのクエリを実行します**。

このガイドで使用するデータセットは NYC Open Data チームが提供しているもので、「New York City Police Department (NYPD) に報告された、すべての有効な重罪、軽罪、および違反行為」に関するデータを含みます。執筆時点ではデータファイルのサイズは 166MB ですが、定期的に更新されています。

**出典**: [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)
**利用規約**: https://www1.nyc.gov/home/terms-of-use.page



## 前提条件 {#prerequisites}
- [NYPD Complaint Data Current (Year To Date)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) ページにアクセスし、Export ボタンをクリックして **TSV for Excel** を選択し、データセットをダウンロードします。
- [ClickHouse server and client](../../getting-started/install/install.mdx) をインストールします。

### このガイドで説明するコマンドについての注意事項 {#a-note-about-the-commands-described-in-this-guide}
このガイドで使用するコマンドには 2 種類あります。
- 一部のコマンドは TSV ファイルに対してクエリを実行するもので、シェルのコマンドプロンプトから実行します。
- 残りのコマンドは ClickHouse に対してクエリを実行するもので、`clickhouse-client` または Play UI で実行します。

:::note
このガイドの例では、TSV ファイルを `${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv` に保存していることを前提としています。必要に応じてコマンドを調整してください。
:::



## TSV ファイルの内容を把握しておきましょう

ClickHouse データベースを使い始める前に、まずデータの内容を確認しておきましょう。

### 元の TSV ファイル内のフィールドを確認する

これは TSV ファイルに対してクエリを実行するコマンドの例ですが、まだ実行しないでください。

```sh
clickhouse-local --query \
"describe file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')"
```

サンプルレスポンス

```response
CMPLNT_NUM                  Nullable(Float64)
ADDR_PCT_CD                 Nullable(Float64)
BORO_NM                     Nullable(String)
CMPLNT_FR_DT                Nullable(String)
CMPLNT_FR_TM                Nullable(String)
```

:::tip
ほとんどの場合、上記のコマンドによって、入力データのどのフィールドが数値で、どれが文字列で、どれがタプルかが分かります。ただし、常にそうとは限りません。ClickHouse は数十億件のレコードを含むデータセットで日常的に利用されるため、スキーマ推論のために数十億行をパースすることを避ける目的で、既定では [スキーマを推論する](/integrations/data-formats/json/inference) 際に 100 行だけを検査するようになっています。以下の出力は、データセットが年に数回更新されるため、実際に表示される内容と一致しない可能性があります。Data Dictionary を見ると、CMPLNT&#95;NUM は数値ではなくテキストとして定義されていることが分かります。推論に用いる行数の既定値 100 行を `SETTINGS input_format_max_rows_to_read_for_schema_inference=2000` によって上書きすることで、内容をより正確に把握できます。

注意: バージョン 22.5 以降では、スキーマ推論のための既定値は 25,000 行になっているため、古いバージョンを使用している場合、または 25,000 行以上のサンプルが必要な場合にのみ、この設定を変更してください。
:::

コマンドプロンプトで次のコマンドを実行します。ダウンロードした TSV ファイル内のデータをクエリするために `clickhouse-local` を使用します。

```sh
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"describe file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')"
```

結果:

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

この時点で、TSV ファイル内のカラムが、[データセットのウェブページ](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)の **Columns in this Dataset** セクションで指定されている名前および型と一致していることを確認する必要があります。データ型はあまり細かく指定されておらず、数値フィールドはすべて `Nullable(Float64)`、それ以外のフィールドはすべて `Nullable(String)` に設定されています。データを保存するための ClickHouse テーブルを作成する際には、より適切でパフォーマンスに優れた型を指定できます。

### 適切なスキーマを決定する

各フィールドにどの型を使用すべきかを判断するには、データの内容を把握しておく必要があります。たとえば、フィールド `JURISDICTION_CODE` は数値ですが、`UInt8` を使うべきか、`Enum` を使うべきか、それとも `Float64` のままでよいのか、といった点を検討します。


```sql
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select JURISDICTION_CODE, count() FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
 GROUP BY JURISDICTION_CODE
 ORDER BY JURISDICTION_CODE
 FORMAT PrettyCompact"
```

結果:

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

クエリ結果から、`JURISDICTION_CODE` は `UInt8` にうまく収まることがわかります。

同様に、いくつかの `String` フィールドを確認して、それらが `DateTime` や [`LowCardinality(String)`](../../sql-reference/data-types/lowcardinality.md) フィールドに適しているかどうかを判断してください。

たとえば、フィールド `PARKS_NM` は「該当する場合、発生場所となった NYC の公園、遊び場、または緑地の名称（州立公園は含まない）」として説明されています。ニューヨーク市内の公園名は、`LowCardinality(String)` の良い候補となる可能性があります。

```sh
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select count(distinct PARKS_NM) FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
 FORMAT PrettyCompact"
```

結果：

```response
┌─uniqExact(PARKS_NM)─┐
│                 319 │
└─────────────────────┘
```

いくつかの公園の名前を見てみましょう。

```sql
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select distinct PARKS_NM FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
 LIMIT 10
 FORMAT PrettyCompact"
```

結果:

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

本稿執筆時点で使用しているデータセットでは、`PARK_NM` 列に含まれる公園や遊び場の異なる名称は数百件しかありません。これは、`LowCardinality(String)` フィールドにおける異なる文字列数を 10,000 未満に保つという [LowCardinality](/sql-reference/data-types/lowcardinality#description) の推奨事項から見ても小さい数です。

### DateTime フィールド

[データセットの Web ページ](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) の **Columns in this Dataset** セクションによると、報告された事象の開始と終了の日時を表すフィールドが存在します。`CMPLNT_FR_DT` と `CMPLT_TO_DT` の最小値と最大値を確認することで、これらのフィールドが常に設定されているかどうかの目安が得られます。

```sh title="CMPLNT_FR_DT"
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select min(CMPLNT_FR_DT), max(CMPLNT_FR_DT) FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
FORMAT PrettyCompact"
```


結果：

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

結果：

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

結果:

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

結果：

```response
┌─min(CMPLNT_TO_TM)─┬─max(CMPLNT_TO_TM)─┐
│ (null)            │ 23:59:00          │
└───────────────────┴───────────────────┘
```


## 計画を立てる {#make-a-plan}

上記の調査に基づいて、次のようにします：
- `JURISDICTION_CODE` は `UInt8` にキャストする
- `PARKS_NM` は `LowCardinality(String)` にキャストする
- `CMPLNT_FR_DT` と `CMPLNT_FR_TM` には常に値が入っている（デフォルト時刻が `00:00:00` の可能性あり）
- `CMPLNT_TO_DT` と `CMPLNT_TO_TM` は空の場合がある
- 元データでは日付と時刻は別々のフィールドに保存されている
- 日付は `mm/dd/yyyy` 形式
- 時刻は `hh:mm:ss` 形式
- 日付と時刻は連結して DateTime 型にできる
- 1970 年 1 月 1 日より前の日付が含まれているため、64 ビットの DateTime 型が必要

:::note
型に対して行うべき変更はまだ多数ありますが、いずれも同じ調査手順に従うことで判断できます。フィールド内のユニークな文字列数や数値の最小値・最大値を確認し、それに基づいて決定してください。このガイドの後半で示すテーブルスキーマでは、多数の低カーディナリティ文字列と符号なし整数フィールドが使用されており、浮動小数点数はごくわずかです。
:::



## 日付フィールドと時刻フィールドを連結する

日付フィールドと時刻フィールドである `CMPLNT_FR_DT` と `CMPLNT_FR_TM` を、`DateTime` にキャスト可能な 1 つの `String` に連結するには、連結演算子 `||` で 2 つのフィールドを結合して `CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM` を選択します。`CMPLNT_TO_DT` と `CMPLNT_TO_TM` フィールドも同様に処理します。

```sh
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM AS complaint_begin FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
LIMIT 10
FORMAT PrettyCompact"
```

結果：

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


## 日付と時刻の文字列を DateTime64 型に変換する

本ガイドの先のセクションで、TSV ファイル内に 1970 年 1 月 1 日より前の日付が含まれていることを確認しました。これは、日付には 64 ビットの DateTime64 型が必要であることを意味します。また、日付は `MM/DD/YYYY` 形式から `YYYY/MM/DD` 形式へ変換する必要があります。これらは両方とも、[`parseDateTime64BestEffort()`](../../sql-reference/functions/type-conversion-functions.md#parsedatetime64besteffort) を使用して実行できます。

```sh
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"WITH (CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM) AS CMPLNT_START,
      (CMPLNT_TO_DT || ' ' || CMPLNT_TO_TM) AS CMPLNT_END
select parseDateTime64BestEffort(CMPLNT_START) AS 苦情開始,
       parseDateTime64BestEffortOrNull(CMPLNT_END) AS 苦情終了
FROM file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
ORDER BY 苦情開始 ASC
LIMIT 25
FORMAT PrettyCompact"
```

上記の2行目と3行目には前のステップで行った連結結果が含まれており、4行目と5行目ではその文字列を `DateTime64` にパースしています。苦情の終了時刻は必ずしも存在するとは限らないため、`parseDateTime64BestEffortOrNull` が使用されています。


結果:

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
上で `1925` として表示されている日付は、データ内の誤りによるものです。元のデータには、本来は `2019` ～ `2022` であるべきところを `1019` ～ `1022` として記録しているレコードがいくつか存在します。これらは、64 ビットの DateTime 型で表現可能な最も古い日付である 1925 年 1 月 1 日として保存されています。
:::


## テーブルを作成する

上で決定した各カラムに使用するデータ型は、以下のテーブルスキーマに反映されます。あわせて、このテーブルで使用する `ORDER BY` と `PRIMARY KEY` も決める必要があります。`ORDER BY` か `PRIMARY KEY` の少なくとも一方は必ず指定しなければなりません。`ORDER BY` に含めるカラムを決める際のガイドラインを以下に示します。さらに詳しい情報は、このドキュメントの最後にある *Next Steps* セクションを参照してください。

### `ORDER BY` および `PRIMARY KEY` 句

* `ORDER BY` タプルには、クエリのフィルタで使用されるフィールドを含めるべきです
* ディスク上での圧縮率を最大化するには、`ORDER BY` タプルはカーディナリティが小さい順（昇順）に並べるべきです
* 存在する場合、`PRIMARY KEY` タプルは `ORDER BY` タプルの部分集合でなければなりません
* `ORDER BY` のみが指定されている場合、同じタプルが `PRIMARY KEY` として使用されます
* プライマリキーインデックスは、指定されていれば `PRIMARY KEY` タプルを使用し、指定されていない場合は `ORDER BY` タプルを使用して作成されます
* `PRIMARY KEY` インデックスはメインメモリ上に保持されます

データセットと、それに対してクエリを実行することで答えられそうな問いを検討すると、ニューヨーク市の 5 つの行政区（borough）ごとの時間経過に伴う犯罪の種類を分析することになると判断できるかもしれません。この場合、次のフィールドを `ORDER BY` に含めることが考えられます:

| Column        | Description (from the data dictionary) |
| ------------- | -------------------------------------- |
| OFNS&#95;DESC | キーコードに対応する犯罪の説明                        |
| RPT&#95;DT    | 事件が警察に通報された日付                          |
| BORO&#95;NM   | 事件が発生した行政区（borough）の名称                 |

3 つの候補カラムについて、TSV ファイルに対してカーディナリティをクエリします:

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

結果:

```response
┌─cardinality_OFNS_DESC─┬─cardinality_RPT_DT─┬─cardinality_BORO_NM─┐
│ 60.00                 │ 306.00             │ 6.00                │
└───────────────────────┴────────────────────┴─────────────────────┘
```

カーディナリティ順に並べ替えると、`ORDER BY` 句は次のようになります：

```sql
ORDER BY ( BORO_NM, OFNS_DESC, RPT_DT )
```

:::note
以下のテーブルでは、より読みやすい列名を使用し、上記の列名は次のようにマッピングされます。

```sql
ORDER BY ( borough, offense_description, date_reported )
```

:::

データ型の変更点と `ORDER BY` 句のタプルを反映すると、テーブル構造は次のようになります。

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

### テーブルの主キーを特定する


ClickHouse の `system` データベース、特に `system.table` には、作成したばかりのテーブルに関するすべての情報が含まれています。このクエリでは、`ORDER BY`（ソートキー）と `PRIMARY KEY` がどのように定義されているかを確認できます。

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

応答

```response
Query id: 6a5b10bf-9333-4090-b36e-c7f08b1d9e01

行 1:
──────
パーティションキー:
ソートキー:   borough, offense_description, date_reported
プライマリキー:   borough, offense_description, date_reported
テーブル:         NYPD_Complaint

1 行を取得しました。経過時間: 0.001 秒。
```


## データの前処理とインポート

データの前処理には `clickhouse-local` ツールを使用し、取り込みには `clickhouse-client` を使用します。

### ここで使用する `clickhouse-local` の引数

:::tip
以下の `clickhouse-local` の引数の中に `table='input'` という指定があります。clickhouse-local は、与えられた入力（`cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`）を受け取り、その内容をテーブルに挿入します。デフォルトではテーブル名は `table` です。このガイドではデータフローをわかりやすくするため、テーブル名を `input` に設定しています。clickhouse-local の最後の引数は、そのテーブル（`FROM input`）からデータを取得するクエリであり、その結果が `clickhouse-client` へパイプされて `NYPD_Complaint` テーブルに投入されます。
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


## データを検証する

:::note
このデータセットは年に 1 回以上変更されることがあるため、本書の件数と一致しない場合があります。
:::

クエリ:

```sql
SELECT count()
FROM NYPD_Complaint
```

結果：

```text
┌─count()─┐
│  208993 │
└─────────┘

1 row in set. Elapsed: 0.001 sec.
```

ClickHouse 内のデータセットのサイズは、元の TSV ファイルのわずか 12% です。次のクエリで、元の TSV ファイルのサイズとテーブルのサイズを比較します。

クエリ:

```sql
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'NYPD_Complaint'
```

結果：

```text
┌─formatReadableSize(total_bytes)─┐
│ 8.63 MiB                        │
└─────────────────────────────────┘
```


## いくつかのクエリを実行する

### クエリ 1. 月別の苦情件数を比較する

クエリ:

```sql
SELECT
    dateName('month', date_reported) AS month,
    count() AS complaints,
    bar(complaints, 0, 50000, 80)
FROM NYPD_Complaint
GROUP BY month
ORDER BY complaints DESC
```

結果:

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

### クエリ 2. 各区の苦情総数を比較する

クエリ:

```sql
SELECT
    borough,
    count() AS complaints,
    bar(complaints, 0, 125000, 60)
FROM NYPD_Complaint
GROUP BY borough
ORDER BY complaints DESC
```

結果:

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


## 次のステップ {#next-steps}

[ClickHouse における疎なプライマリインデックスの実践的な入門](/guides/best-practices/sparse-primary-indexes.md) では、従来のリレーショナルデータベースと比較した ClickHouse のインデックスの違い、ClickHouse が疎なプライマリインデックスをどのように構築・利用するか、そしてインデックスのベストプラクティスについて解説します。
