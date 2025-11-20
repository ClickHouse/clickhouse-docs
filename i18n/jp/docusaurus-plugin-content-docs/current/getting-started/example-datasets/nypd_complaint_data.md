---
description: 'タブ区切り値データを 5 ステップで取り込み・クエリする'
sidebar_label: 'NYPD 苦情データ'
slug: /getting-started/example-datasets/nypd_complaint_data
title: 'NYPD 苦情データ'
doc_type: 'guide'
keywords: ['example dataset', 'nypd', 'crime data', 'sample data', 'public data']
---

タブ区切り値（Tab Separated Value、TSV）ファイルは一般的な形式であり、ファイルの先頭行にフィールド名が含まれている場合があります。ClickHouse は TSV を取り込めるだけでなく、ファイルを取り込まずに TSV を直接クエリすることもできます。このガイドでは、これら両方のケースを扱います。CSV ファイルをクエリまたは取り込む必要がある場合も、同じ手法を利用でき、フォーマット引数内の `TSV` を `CSV` に置き換えるだけです。

このガイドを進めるにあたり、次のことを行います:
- **調査**: TSV ファイルの構造と内容をクエリする。
- **対象となる ClickHouse スキーマの決定**: 適切なデータ型を選択し、既存データをそれらの型にマッピングする。
- **ClickHouse テーブルの作成**。
- データを **前処理してストリーミングし**、ClickHouse に送信する。
- ClickHouse に対して **いくつかのクエリを実行**する。

このガイドで使用するデータセットは NYC Open Data チームが提供しているもので、「New York City Police Department (NYPD) に報告された、すべての有効な重罪、軽罪、および違反行為に関する犯罪」のデータを含みます。執筆時点では、データファイルのサイズは 166MB ですが、定期的に更新されています。

**出典**: [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)
**利用規約**: https://www1.nyc.gov/home/terms-of-use.page



## 前提条件 {#prerequisites}

- [NYPD Complaint Data Current (Year To Date)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)ページにアクセスし、Exportボタンをクリックして**TSV for Excel**を選択し、データセットをダウンロードします。
- [ClickHouseサーバーとクライアント](../../getting-started/install/install.mdx)をインストールします

### このガイドで使用するコマンドについて {#a-note-about-the-commands-described-in-this-guide}

このガイドでは2種類のコマンドを使用します:

- TSVファイルに対してクエリを実行するコマンド。これらはコマンドプロンプトで実行します。
- ClickHouseに対してクエリを実行するコマンド。これらは`clickhouse-client`またはPlay UIで実行します。

:::note
このガイドの例では、TSVファイルを`${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`に保存していることを前提としています。必要に応じてコマンドを調整してください。
:::


## TSVファイルの内容を確認する {#familiarize-yourself-with-the-tsv-file}

ClickHouseデータベースでの作業を開始する前に、データの内容を確認してください。

### ソースTSVファイルのフィールドを確認する {#look-at-the-fields-in-the-source-tsv-file}

これはTSVファイルをクエリするコマンドの例ですが、まだ実行しないでください。

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
通常、上記のコマンドを実行すると、入力データのどのフィールドが数値型で、どれが文字列型で、どれがタプル型かを確認できます。ただし、常にそうとは限りません。ClickHouseは数十億件のレコードを含むデータセットで日常的に使用されるため、スキーマを推論する際に数十億行を解析することを避けるために、デフォルトで100行が[スキーマ推論](/integrations/data-formats/json/inference)の対象として検査されます。データセットは年に数回更新されるため、以下のレスポンスは実際に表示される内容と一致しない場合があります。データディクショナリを確認すると、CMPLNT_NUMはテキストとして指定されており、数値ではないことがわかります。推論のデフォルト100行を`SETTINGS input_format_max_rows_to_read_for_schema_inference=2000`設定で上書きすることで、コンテンツをより正確に把握できます。

注意: バージョン22.5以降、スキーマ推論のデフォルトは25,000行になっているため、古いバージョンを使用している場合や、25,000行を超えるサンプリングが必要な場合にのみ設定を変更してください。
:::

コマンドプロンプトでこのコマンドを実行してください。ダウンロードしたTSVファイル内のデータをクエリするために`clickhouse-local`を使用します。

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

この時点で、TSVファイルの列が[データセットのウェブページ](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)の**Columns in this Dataset**セクションで指定されている名前と型と一致していることを確認してください。データ型はあまり具体的ではなく、すべての数値フィールドは`Nullable(Float64)`に設定され、その他のフィールドはすべて`Nullable(String)`になっています。データを格納するClickHouseテーブルを作成する際には、より適切でパフォーマンスの高い型を指定できます。

### 適切なスキーマを決定する {#determine-the-proper-schema}

フィールドにどの型を使用すべきかを判断するには、データがどのようなものかを把握する必要があります。例えば、`JURISDICTION_CODE`フィールドは数値ですが、`UInt8`、`Enum`、または`Float64`のどれが適切でしょうか?


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

クエリの結果から、`JURISDICTION_CODE` は `UInt8` に適していることがわかります。

同様に、いくつかの `String` フィールドを確認し、`DateTime` または [`LowCardinality(String)`](../../sql-reference/data-types/lowcardinality.md) フィールドに適しているかどうかを判断します。

例えば、`PARKS_NM` フィールドは「該当する場合、発生したニューヨーク市の公園、遊び場、または緑地の名称(州立公園は含まれません)」と説明されています。ニューヨーク市の公園名は `LowCardinality(String)` の適切な候補となる可能性があります:

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

いくつかの公園名を確認してみましょう:

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

執筆時点で使用されているデータセットでは、`PARK_NM` 列に数百の異なる公園と遊び場しか含まれていません。これは、`LowCardinality(String)` フィールドでは10,000未満の異なる文字列に留めるという [LowCardinality](/sql-reference/data-types/lowcardinality#description) の推奨事項に基づくと、少ない数です。

### DateTime フィールド {#datetime-fields}

[データセットのウェブページ](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)の **Columns in this Dataset** セクションによると、報告されたイベントの開始と終了の日時フィールドがあります。`CMPLNT_FR_DT` と `CMPLT_TO_DT` の最小値と最大値を確認することで、これらのフィールドが常に入力されているかどうかを把握できます:

```sh title="CMPLNT_FR_DT"
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select min(CMPLNT_FR_DT), max(CMPLNT_FR_DT) FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
FORMAT PrettyCompact"
```


結果:

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

結果:

```response
┌─min(CMPLNT_TO_TM)─┬─max(CMPLNT_TO_TM)─┐
│ (null)            │ 23:59:00          │
└───────────────────┴───────────────────┘
```


## 計画を立てる {#make-a-plan}

上記の調査に基づいて：

- `JURISDICTION_CODE` は `UInt8` にキャストする必要があります。
- `PARKS_NM` は `LowCardinality(String)` にキャストする必要があります。
- `CMPLNT_FR_DT` と `CMPLNT_FR_TM` は常に値が入力されています（デフォルトの時刻として `00:00:00` が設定されている可能性があります）
- `CMPLNT_TO_DT` と `CMPLNT_TO_TM` は空の場合があります
- 日付と時刻はソースでは別々のフィールドに格納されています
- 日付は `mm/dd/yyyy` 形式です
- 時刻は `hh:mm:ss` 形式です
- 日付と時刻は DateTime 型に結合できます
- 1970年1月1日より前の日付が一部存在するため、64ビットの DateTime が必要です

:::note
型に対して行うべき変更は他にも多数ありますが、それらはすべて同じ調査手順に従うことで判断できます。フィールド内の個別の文字列の数、数値の最小値と最大値を確認し、判断を下してください。このガイドの後半で示されるテーブルスキーマには、多数の低カーディナリティ文字列と符号なし整数フィールドがあり、浮動小数点数値はほとんどありません。
:::


## 日付と時刻フィールドの連結 {#concatenate-the-date-and-time-fields}

日付フィールド `CMPLNT_FR_DT` と時刻フィールド `CMPLNT_FR_TM` を連結して `DateTime` 型にキャスト可能な単一の `String` にするには、連結演算子で結合した2つのフィールドを選択します: `CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM`。`CMPLNT_TO_DT` と `CMPLNT_TO_TM` フィールドも同様に処理します。

```sh
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM AS complaint_begin FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
LIMIT 10
FORMAT PrettyCompact"
```

結果:

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


## 日付と時刻の文字列をDateTime64型に変換する {#convert-the-date-and-time-string-to-a-datetime64-type}

このガイドの前半で、TSVファイルには1970年1月1日より前の日付が含まれていることが判明しました。これは、日付に64ビットのDateTime型が必要であることを意味します。また、日付を`MM/DD/YYYY`形式から`YYYY/MM/DD`形式に変換する必要があります。これらは両方とも[`parseDateTime64BestEffort()`](../../sql-reference/functions/type-conversion-functions.md#parsedatetime64besteffort)で実行できます。

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

上記の2行目と3行目には前のステップで行った連結が含まれており、4行目と5行目では文字列を`DateTime64`に解析しています。苦情終了時刻は必ずしも存在するとは限らないため、`parseDateTime64BestEffortOrNull`を使用しています。


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
上で `1925` と表示されている日付は、データの誤りによるものです。元データには、本来は `2019`〜`2022` であるべきところが、`1019`〜`1022` の年として記録されているレコードがいくつか存在します。64 ビットの DateTime で扱える最も古い日付が 1925 年 1 月 1 日であるため、それらは 1925 年 1 月 1 日として保存されています。
:::


## テーブルの作成 {#create-a-table}

上記で決定したカラムのデータ型は、以下のテーブルスキーマに反映されています。また、テーブルで使用する`ORDER BY`と`PRIMARY KEY`を決定する必要があります。`ORDER BY`または`PRIMARY KEY`の少なくとも一方を指定する必要があります。以下に、`ORDER BY`に含めるカラムを決定する際のガイドラインを示します。詳細については、このドキュメントの最後にある_次のステップ_セクションを参照してください。

### `ORDER BY`句と`PRIMARY KEY`句 {#order-by-and-primary-key-clauses}

- `ORDER BY`タプルには、クエリフィルタで使用されるフィールドを含める必要があります
- ディスク上の圧縮を最大化するため、`ORDER BY`タプルはカーディナリティの昇順で並べる必要があります
- `PRIMARY KEY`タプルが存在する場合、`ORDER BY`タプルのサブセットである必要があります
- `ORDER BY`のみが指定されている場合、同じタプルが`PRIMARY KEY`として使用されます
- プライマリキーインデックスは、指定されている場合は`PRIMARY KEY`タプルを使用して作成され、それ以外の場合は`ORDER BY`タプルを使用して作成されます
- `PRIMARY KEY`インデックスはメインメモリに保持されます

データセットとそれをクエリすることで答えられる可能性のある質問を見ると、ニューヨーク市の5つの区で時系列に報告された犯罪の種類を調べることが考えられます。これらのフィールドを`ORDER BY`に含めることができます:

| カラム    | 説明（データディクショナリより）                 |
| --------- | ------------------------------------------------------ |
| OFNS_DESC | キーコードに対応する違反の説明     |
| RPT_DT    | 事件が警察に報告された日付                      |
| BORO_NM   | 事件が発生した区の名前 |

3つの候補カラムのカーディナリティについてTSVファイルをクエリします:

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

カーディナリティで並べると、`ORDER BY`は次のようになります:

```sql
ORDER BY ( BORO_NM, OFNS_DESC, RPT_DT )
```

:::note
以下のテーブルでは、より読みやすいカラム名を使用します。上記の名前は次のようにマッピングされます

```sql
ORDER BY ( borough, offense_description, date_reported )
```

:::

データ型の変更と`ORDER BY`タプルをまとめると、次のテーブル構造になります:

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

### テーブルのプライマリキーの確認 {#finding-the-primary-key-of-a-table}


ClickHouse の `system` データベース、特に `system.table` には、作成したばかりのテーブルに関するすべての情報が含まれています。このクエリでは、`ORDER BY`（ソートキー）と `PRIMARY KEY` が確認できます:

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

行 1:
──────
パーティションキー:
ソートキー:   borough, offense_description, date_reported
プライマリキー:   borough, offense_description, date_reported
テーブル:         NYPD_Complaint

1 行を取得しました。経過時間: 0.001 秒。
```


## データの前処理とインポート {#preprocess-import-data}

データの前処理には`clickhouse-local`ツールを使用し、アップロードには`clickhouse-client`を使用します。

### 使用する`clickhouse-local`の引数 {#clickhouse-local-arguments-used}

:::tip
以下のclickhouse-localの引数に`table='input'`が指定されています。clickhouse-localは提供された入力（`cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`）を受け取り、テーブルに挿入します。デフォルトではテーブル名は`table`ですが、このガイドではデータフローを明確にするためにテーブル名を`input`に設定しています。clickhouse-localの最後の引数はテーブルから選択するクエリ（`FROM input`）であり、その結果が`clickhouse-client`にパイプされて`NYPD_Complaint`テーブルにデータが投入されます。
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


## データの検証 {#validate-data}

:::note
データセットは年に1回以上更新されるため、カウント数がこのドキュメントの記載内容と一致しない場合があります。
:::

クエリ:

```sql
SELECT count()
FROM NYPD_Complaint
```

結果:

```text
┌─count()─┐
│  208993 │
└─────────┘

1 row in set. Elapsed: 0.001 sec.
```

ClickHouse内のデータセットのサイズは元のTSVファイルのわずか12%です。元のTSVファイルのサイズとテーブルのサイズを比較してみましょう:

クエリ:

```sql
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'NYPD_Complaint'
```

結果:

```text
┌─formatReadableSize(total_bytes)─┐
│ 8.63 MiB                        │
└─────────────────────────────────┘
```


## クエリを実行する {#run-queries}

### クエリ1. 月別の苦情件数を比較する {#query-1-compare-the-number-of-complaints-by-month}

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

### クエリ2. 区別の苦情総数を比較する {#query-2-compare-total-number-of-complaints-by-borough}

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

[ClickHouseにおけるスパースプライマリインデックスの実践的な入門](/guides/best-practices/sparse-primary-indexes.md)では、従来のリレーショナルデータベースと比較したClickHouseのインデックスの違い、ClickHouseがスパースプライマリインデックスを構築・使用する方法、およびインデックスのベストプラクティスについて解説しています。
