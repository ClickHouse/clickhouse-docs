---
description: '5つのステップでTab Separated Valueデータを取り込み、クエリを実行する'
sidebar_label: 'NYPD苦情データ'
slug: /getting-started/example-datasets/nypd_complaint_data
title: 'NYPD Complaint Data'
doc_type: 'guide'
keywords: ['サンプルデータセット', 'nypd', '犯罪データ', 'サンプルデータ', '公開データ']
---

Tab separated value（TSV）ファイルは一般的な形式であり、ファイルの先頭行にフィールド見出しが含まれている場合があります。ClickHouseはTSVを取り込むことができるだけでなく、ファイルを取り込まずにTSVに対してクエリを実行することもできます。本ガイドでは、この2つのケースの両方を扱います。CSVファイルに対してクエリを実行したり取り込んだりする必要がある場合も、同じ手法が利用でき、フォーマット引数内の `TSV` を `CSV` に置き換えるだけで対応できます。

本ガイドを進めるにあたって、次のことを行います:

- **調査**: TSVファイルの構造と内容に対してクエリを実行し、確認する。
- **対象となるClickHouseスキーマの決定**: 適切なデータ型を選択し、既存データをそれらの型にマッピングする。
- **ClickHouseテーブルをCREATE文で作成する**。
- データを前処理し、ClickHouseに**ストリーミング**する。
- ClickHouseに対して**いくつかのクエリを実行**する。

本ガイドで使用するデータセットはNYC Open Dataチームによるもので、「New York City Police Department (NYPD) に報告された、すべての有効な重罪、軽犯罪、違反行為」に関するデータを含みます。執筆時点ではデータファイルのサイズは166MBですが、定期的に更新されています。

**出典**: [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)
**利用規約**: https://www1.nyc.gov/home/terms-of-use.page

## 前提条件 {#prerequisites}

- [NYPD Complaint Data Current (Year To Date)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) ページを開き、Export ボタンをクリックして **TSV for Excel** を選択し、データセットをダウンロードします。
- [ClickHouse server と client](../../getting-started/install/install.mdx) をインストールします

### このガイドで説明しているコマンドについての注意事項 {#a-note-about-the-commands-described-in-this-guide}

このガイドに登場するコマンドは、次の 2 種類に分かれます。

- 一部のコマンドは TSV ファイルに対してクエリを実行するもので、これらはコマンドラインで実行します。
- 残りのコマンドは ClickHouse に対してクエリを実行するもので、`clickhouse-client` または Play UI で実行します。

:::note
このガイドのサンプルでは、TSV ファイルを `${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv` に保存していることを前提としています。必要に応じてコマンド内のパスを調整してください。
:::

## TSV ファイルの内容を把握しましょう {#familiarize-yourself-with-the-tsv-file}

ClickHouse データベースを操作し始める前に、まずデータの内容を確認しておきましょう。

### 元のTSVファイル内のフィールドを確認する {#look-at-the-fields-in-the-source-tsv-file}

これはTSVファイルに対してクエリを実行するコマンドの例ですが、まだ実行しないでください。

```sh
clickhouse-local --query \
"describe file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')"
```

レスポンス例

```response
CMPLNT_NUM                  Nullable(Float64)
ADDR_PCT_CD                 Nullable(Float64)
BORO_NM                     Nullable(String)
CMPLNT_FR_DT                Nullable(String)
CMPLNT_FR_TM                Nullable(String)
```

:::tip
ほとんどの場合、上記のコマンドを実行すると、入力データ内のどのフィールドが数値で、どれが文字列で、どれがタプルであるかが分かります。ただし、常にそうとは限りません。ClickHouse は数十億レコードを含むデータセットで日常的に利用されるため、スキーマ推論のために数十億行をパースするのを避ける目的で、デフォルトでは [スキーマを推論する](/integrations/data-formats/json/inference) 際に 100 行のみが検査されます。以下の出力は、データセットが年に数回更新されるため、実際に得られる結果と一致しない可能性があります。Data Dictionary を見ると、CMPLNT&#95;NUM は数値ではなくテキストとして定義されていることが分かります。推論に使用する行数のデフォルト値 100 を `SETTINGS input_format_max_rows_to_read_for_schema_inference=2000` によって上書きすることで、データ内容をより正確に把握できます。

注意: バージョン 22.5 以降では、スキーマ推論のために使用されるデフォルト行数は 25,000 行になっているため、古いバージョンを使用している場合、または 25,000 行以上をサンプリングする必要がある場合にのみ、この設定を変更してください。
:::

コマンドプロンプトで次のコマンドを実行してください。ダウンロードした TSV ファイル内のデータをクエリするために `clickhouse-local` を使用します。

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

この時点で、TSV ファイル内のカラムが、[データセットのウェブページ](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)の **Columns in this Dataset** セクションで指定されている名前と型に一致していることを確認してください。データ型はあまり厳密ではなく、数値フィールドはすべて `Nullable(Float64)` に、その他のフィールドはすべて `Nullable(String)` に設定されています。データを保存する ClickHouse テーブルを作成する際には、より適切でパフォーマンスに優れた型を指定できます。


### 適切なスキーマを決定する {#determine-the-proper-schema}

各フィールドにどの型を使用すべきかを判断するには、データがどのような内容なのかを把握しておく必要があります。例えば、フィールド `JURISDICTION_CODE` は数値ですが、これは `UInt8` とすべきでしょうか、`Enum` とすべきでしょうか、それとも `Float64` が適切でしょうか？

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

同様に、いくつかの `String` 型のフィールドを確認し、それらが `DateTime` 型や [`LowCardinality(String)`](../../sql-reference/data-types/lowcardinality.md) 型に適しているかどうかを見てみましょう。

たとえば、フィールド `PARKS_NM` は「該当する場合、発生場所となった NYC の公園、遊び場、または緑地の名称（州立公園は含まない）」と説明されています。ニューヨーク市内の公園名は、`LowCardinality(String)` 型の良い候補となる可能性があります。

```sh
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select count(distinct PARKS_NM) FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
 FORMAT PrettyCompact"
```

結果:

```response
┌─uniqExact(PARKS_NM)─┐
│                 319 │
└─────────────────────┘
```

いくつかの公園名を見てみましょう：

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

本ドキュメント執筆時点で使用しているデータセットでは、`PARK_NM` カラム内に存在する公園と遊び場の名称の種類は数百件程度しかありません。これは、`LowCardinality(String)` フィールドに含める異なる文字列数を 10,000 未満に抑えることを推奨している [LowCardinality](/sql-reference/data-types/lowcardinality#description) のガイドラインから見ても、小さい数と言えます。


### DateTime フィールド {#datetime-fields}

[データセットのウェブページ](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) の **Columns in this Dataset** セクションによると、報告されたイベントの開始と終了を表す日時フィールドがあります。`CMPLNT_FR_DT` と `CMPLT_TO_DT` の最小値と最大値を確認すると、それらのフィールドに常に値が入っているかどうかのおおよその見当がつきます。

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

結果:

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

結果：

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

結果:

```response
┌─min(CMPLNT_TO_TM)─┬─max(CMPLNT_TO_TM)─┐
│ (null)            │ 23:59:00          │
└───────────────────┴───────────────────┘
```


## 計画を立てる {#make-a-plan}

上記の調査結果に基づいて、次のようにします。

- `JURISDICTION_CODE` は `UInt8` にキャストする。
- `PARKS_NM` は `LowCardinality(String)` にキャストする。
- `CMPLNT_FR_DT` と `CMPLNT_FR_TM` には常に値が入っている（`00:00:00` のデフォルト時刻が入っている可能性あり）。
- `CMPLNT_TO_DT` と `CMPLNT_TO_TM` は空の場合がある。
- 日付と時刻はソース側で別々のフィールドに格納されている。
- 日付は `mm/dd/yyyy` 形式である。
- 時刻は `hh:mm:ss` 形式である。
- 日付と時刻は連結して DateTime 型にできる。
- 1970 年 1 月 1 日より前の日付が存在するため、64 ビットの DateTime が必要。

:::note
型については、このほかにも多くの変更が必要ですが、いずれも同じ調査手順に従って決定できます。フィールド内のユニークな文字列の数や数値の最小値・最大値を確認し、そのうえで判断してください。後で示すテーブルスキーマでは、LowCardinality の文字列型と符号なし整数型が多く、浮動小数点数型はごくわずかです。
:::

## 日付フィールドと時刻フィールドを連結する {#concatenate-the-date-and-time-fields}

日付フィールド `CMPLNT_FR_DT` と時刻フィールド `CMPLNT_FR_TM` を、`DateTime` にキャスト可能な単一の `String` に連結するには、連結演算子で 2 つのフィールドを結合した式を選択します: `CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM`。`CMPLNT_TO_DT` と `CMPLNT_TO_TM` フィールドも同様に扱います。

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


## 日付と時刻の文字列を DateTime64 型に変換する {#convert-the-date-and-time-string-to-a-datetime64-type}

このガイドの前のセクションで、TSV ファイル内に 1970 年 1 月 1 日より前の日付が含まれていることを確認しました。これは、日付に 64 ビットの DateTime 型が必要であることを意味します。加えて、日付を `MM/DD/YYYY` 形式から `YYYY/MM/DD` 形式に変換する必要があります。これらはどちらも、[`parseDateTime64BestEffort()`](../../sql-reference/functions/type-conversion-functions.md#parseDateTime64BestEffort) を使って行うことができます。

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

上記の 2 行目と 3 行目には前のステップで作成した連結結果が含まれており、4 行目と 5 行目ではその文字列を `DateTime64` 型に変換しています。苦情の終了時刻は必ずしも存在するとは限らないため、`parseDateTime64BestEffortOrNull` を使用しています。

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
上で `1925` と表示されている日付は、データ中の誤りによるものです。元データには、本来は `2019` ～ `2022` 年であるべきものが `1019` ～ `1022` 年として記録されているレコードがいくつか存在します。64 ビットの DateTime で表現可能な最も早い日付が 1925 年 1 月 1 日であるため、それらは 1925 年 1 月 1 日として保存されています。
:::


## テーブルを作成する {#create-a-table}

上でカラムに使用するデータ型について行った決定は、以下のテーブルスキーマに反映されています。また、テーブルで使用する `ORDER BY` と `PRIMARY KEY` も決定する必要があります。`ORDER BY` と `PRIMARY KEY` の少なくともどちらか一方は指定しなければなりません。`ORDER BY` に含めるカラムを決定するためのガイドラインを以下に示します。さらに詳しい情報は、このドキュメント末尾の *Next Steps* セクションを参照してください。

### `ORDER BY` と `PRIMARY KEY` 句 {#order-by-and-primary-key-clauses}

* `ORDER BY` タプルには、クエリのフィルタ条件で使用されるフィールドを含める必要があります
* ディスク上での圧縮効率を最大化するには、`ORDER BY` タプルはカーディナリティが小さいものから大きいものへ昇順になるように並べるべきです
* 存在する場合、`PRIMARY KEY` タプルは `ORDER BY` タプルの部分集合でなければなりません
* `ORDER BY` のみが指定されている場合、同じタプルが `PRIMARY KEY` として使用されます
* プライマリキーの索引は、指定されていれば `PRIMARY KEY` タプルを使って、指定されていなければ `ORDER BY` タプルを使って作成されます
* `PRIMARY KEY` 索引はメインメモリ内に保持されます

データセットと、そのデータに対してクエリを投げることで答えられそうな質問を検討すると、
ニューヨーク市の 5 つの行政区における、時間の経過に伴う犯罪の種類の推移を
確認したいと判断できるかもしれません。 その場合、次のフィールドを `ORDER BY` に含めることが考えられます:

| Column        | Description (from the data dictionary)                 |
| ------------- | ------------------------------------------------------ |
| OFNS&#95;DESC | Description of offense corresponding with key code     |
| RPT&#95;DT    | Date event was reported to police                      |
| BORO&#95;NM   | The name of the borough in which the incident occurred |

3 つの候補カラムのカーディナリティを確認するために TSV ファイルに対してクエリを実行します:

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

結果：

```response
┌─cardinality_OFNS_DESC─┬─cardinality_RPT_DT─┬─cardinality_BORO_NM─┐
│ 60.00                 │ 306.00             │ 6.00                │
└───────────────────────┴────────────────────┴─────────────────────┘
```

カーディナリティ順にすると、`ORDER BY` 句は次のようになります。

```sql
ORDER BY ( BORO_NM, OFNS_DESC, RPT_DT )
```

:::note
以下のテーブルでは、より読みやすいカラム名を使用し、上記の名前は次のように対応付けられます。

```sql
ORDER BY ( borough, offense_description, date_reported )
```

:::

データ型の変更と `ORDER BY` 句のタプルを組み合わせると、テーブル構造は次のようになります：

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


### テーブルの主キーを確認する {#finding-the-primary-key-of-a-table}

ClickHouse の `system` データベース、特に `system.table` には、作成したばかりのテーブルに関するすべての情報が含まれています。
このクエリは `ORDER BY`（ソートキー）と `PRIMARY KEY` を表示します。

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

レスポンス

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


## データの前処理とインポート {#preprocess-import-data}

データの前処理には `clickhouse-local` ツールを使用し、インポートには `clickhouse-client` を使用します。

### `clickhouse-local` で使用される引数 {#clickhouse-local-arguments-used}

:::tip
`table='input'` は、以下の clickhouse-local の引数の中に含まれています。clickhouse-local は、指定された入力（`cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`）を受け取り、その入力をテーブルに挿入します。デフォルトではテーブル名は `table` です。このガイドでは、データフローを分かりやすくするために、テーブル名を `input` に設定しています。clickhouse-local への最後の引数は、テーブル（`FROM input`）から選択するクエリであり、その結果がパイプで `clickhouse-client` に渡され、`NYPD_Complaint` テーブルにデータが投入されます。
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


## データを検証する {#validate-data}

:::note
データセットは年に一度以上更新されるため、このドキュメントに記載されている件数と一致しない場合があります。
:::

クエリ：

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

ClickHouse 上のデータセットのサイズは、元の TSV ファイルの 12% しかありません。元の TSV ファイルのサイズとテーブルのサイズを比較してみましょう。

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


## クエリを実行する {#run-queries}

### クエリ 1. 月別の苦情件数を比較する {#query-1-compare-the-number-of-complaints-by-month}

クエリ：

```sql
SELECT
    dateName('month', date_reported) AS month,
    count() AS complaints,
    bar(complaints, 0, 50000, 80)
FROM NYPD_Complaint
GROUP BY month
ORDER BY complaints DESC
```

結果：

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


### クエリ 2. 区ごとの総苦情件数の比較 {#query-2-compare-total-number-of-complaints-by-borough}

クエリ：

```sql
SELECT
    borough,
    count() AS complaints,
    bar(complaints, 0, 125000, 60)
FROM NYPD_Complaint
GROUP BY borough
ORDER BY complaints DESC
```

結果：

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

[A Practical Introduction to Sparse Primary Indexes in ClickHouse](/guides/best-practices/sparse-primary-indexes.md) では、従来のリレーショナルデータベースと比較した ClickHouse における索引の違い、ClickHouse がスパースなプライマリ索引をどのように構築・利用するか、そしてインデックス設計におけるベストプラクティスについて解説しています。