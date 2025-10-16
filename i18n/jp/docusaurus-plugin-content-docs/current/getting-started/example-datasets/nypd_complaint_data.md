---
'description': '5ステップでタブ区切り値データを取り込み、クエリします'
'sidebar_label': 'NYPD Complaint Data'
'slug': '/getting-started/example-datasets/nypd_complaint_data'
'title': 'NYPD Complaint Data'
'doc_type': 'reference'
---

Tab区切り値（TSV）ファイルは一般的で、ファイルの最初の行にはフィールド見出しが含まれている場合があります。ClickHouseはTSVを読み込むことができ、ファイルを読み込むことなくTSVをクエリすることもできます。このガイドではこの2つのケースをカバーします。CSVファイルをクエリまたは読み込む必要がある場合も、同じ手法が機能し、フォーマット引数内で`TSV`を`CSV`に置き換えるだけで済みます。

このガイドを通じて、あなたは以下を行います。
- **調査**: TSVファイルの構造と内容をクエリします。
- **対象ClickHouseスキーマを決定**: 適切なデータ型を選び、既存のデータをその型にマッピングします。
- **ClickHouseテーブルを作成**。
- **データを前処理してClickHouseにストリーミング**します。
- **ClickHouseに対していくつかのクエリを実行**します。

このガイドで使用されるデータセットはNYC Open Dataチームからのもので、「ニューヨーク市警察（NYPD）に報告されたすべての有効な重罪、軽罪、違反犯罪」に関するデータが含まれています。この文書執筆時点ではデータファイルは166MBですが、定期的に更新されます。

**出典**: [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)  
**利用規約**: https://www1.nyc.gov/home/terms-of-use.page

## 前提条件 {#prerequisites}
- [NYPD Complaint Data Current (Year To Date)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) ページを訪れてデータセットをダウンロードし、エクスポートボタンをクリックして**TSV for Excel**を選択してください。
- [ClickHouseサーバーとクライアントをインストール](../../getting-started/install/install.mdx)します。

### このガイドで説明するコマンドについての注意 {#a-note-about-the-commands-described-in-this-guide}
このガイドでは2種類のコマンドがあります。
- 一部のコマンドはTSVファイルをクエリしており、これはコマンドプロンプトで実行されます。
- 残りのコマンドはClickHouseをクエリしており、これは`clickhouse-client`またはPlay UIで実行されます。

:::note
このガイドの例では、TSVファイルを`${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`に保存していると仮定しています。必要に応じてコマンドを調整してください。
:::

## TSVファイルに慣れる {#familiarize-yourself-with-the-tsv-file}

ClickHouseデータベースで作業を開始する前に、データに慣れてください。

### ソースTSVファイルのフィールドを確認する {#look-at-the-fields-in-the-source-tsv-file}

これはTSVファイルをクエリするためのコマンドの例ですが、まだ実行しないでください。  
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
ほとんどの場合、上記のコマンドは入力データ内のどのフィールドが数値で、どのフィールドが文字列で、どのフィールドがタプルであるかを示します。ただし、これは常に当てはまるわけではありません。ClickHouseは数十億のレコードを含むデータセットで通常使用されるため、スキーマを[推測するために](/integrations/data-formats/json/inference)デフォルトで調査される行数は100行です。これは、スキーマを推測するために数十億の行を解析するのを避けるためです。以下のレスポンスは、データセットが毎年数回更新されるため、実際に見るものとは一致しない場合があります。データ辞書を確認すると、CMPLNT_NUMが数値ではなくテキストとして指定されていることがわかります。推測のデフォルト100行を`SETTINGS input_format_max_rows_to_read_for_schema_inference=2000`の設定でオーバーライドすることで、内容をよりよく理解できます。

注: バージョン22.5以降、スキーマ推測のデフォルトは25,000行に設定されているため、古いバージョンを使用しているか、25,000行以上のサンプルが必要な場合にのみこの設定を変更してください。
:::

コマンドプロンプトでこのコマンドを実行してください。ダウンロードしたTSVファイルのデータをクエリするために`clickhouse-local`を使用します。  
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

この時点で、TSVファイル内の列が[データセットのウェブページ](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)の**このデータセットのカラム**セクションで指定された名前とタイプに一致していることを確認する必要があります。データ型は非常に特定的ではなく、すべての数値フィールドは`Nullable(Float64)`に設定されており、他のフィールドはすべて`Nullable(String)`です。データを保存するためのClickHouseテーブルを作成するときに、より適切でパフォーマンスの高い型を指定できます。

### 適切なスキーマを決定する {#determine-the-proper-schema}

フィールドに使用すべき型を判断するためには、データがどのように見えるかを知る必要があります。たとえば、フィールド`JURISDICTION_CODE`は数値であるべきですが、`UInt8`、`Enum`、それとも`Float64`が適切でしょうか？

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

クエリのレスポンスは、`JURISDICTION_CODE`が`UInt8`に適合することを示しています。

同様に、一部の`String`フィールドを確認し、`DateTime`または[`LowCardinality(String)`](../../sql-reference/data-types/lowcardinality.md)フィールドとして適切かどうかを確認してください。

たとえば、フィールド`PARKS_NM`は「該当する場合、発生地点のニューヨーク市の公園、遊び場、グリーンスペースの名前（州立公園は含まれません）」と説明されています。ニューヨーク市の公園名は`LowCardinality(String)`の適候補になるかもしれません：

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

執筆時点で使用中のデータセットには、`PARK_NM`カラムに数百の異なる公園と遊び場しか含まれていません。この数は、`LowCardinality`の推奨に基づき、`LowCardinality(String)`フィールド内の異なる文字列が10,000未満であることを考えると、小さい数です。

### DateTimeフィールド {#datetime-fields}
[データセットのウェブページ](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)の**このデータセットのカラム**セクションに基づくと、報告されたイベントの開始と終了の日時フィールドがあります。`CMPLNT_FR_DT`および`CMPLT_TO_DT`の最小値と最大値を見て、フィールドが常に埋まっているかどうかを判断します：

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
- `JURISDICTION_CODE`は`UInt8`にキャストされるべきです。
- `PARKS_NM`は`LowCardinality(String)`にキャストされるべきです。
- `CMPLNT_FR_DT`および`CMPLNT_FR_TM`は常に埋まっています（デフォルトの時間が`00:00:00`である可能性があります）。
- `CMPLNT_TO_DT`および`CMPLNT_TO_TM`は空である可能性があります。
- 日付と時刻はソース内で別々のフィールドに格納されています。
- 日付は`mm/dd/yyyy`形式です。
- 時間は`hh:mm:ss`形式です。
- 日付と時刻はDateTime型に連結できます。
- 1970年1月1日より前の日付がいくつかあるため、64ビットDateTimeが必要です。

:::note
型に関する変更はまだ多く、そのすべては同様の調査ステップに従うことで決定できます。フィールド内の異なる文字列の数、数値の最小値および最大値を確認し、判断を下してください。後でガイドに示されるテーブルスキーマには、多くのローカルコーディナリティ文字列と非符号整数フィールドがあり、浮動小数点数は非常に少ないです。
:::

## 日付と時間フィールドを連結する {#concatenate-the-date-and-time-fields}

日付と時間フィールド`CMPLNT_FR_DT`と`CMPLNT_FR_TM`を単一の`String`に連結してから`DateTime`にキャストするために、`CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM`という演算子で2つのフィールドを結合します。`CMPLNT_TO_DT`および`CMPLNT_TO_TM`フィールドも同様に処理されます。

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

## 日付と時間のStringをDateTime64型に変換する {#convert-the-date-and-time-string-to-a-datetime64-type}

前のガイドでは、TSVファイルに1970年1月1日より前の日付が存在することを発見しました。これは、日付には64ビットのDateTime型が必要であることを意味します。日付は`MM/DD/YYYY`から`YYYY/MM/DD`形式に変換する必要もあります。これらの両方は[`parseDateTime64BestEffort()`](../../sql-reference/functions/type-conversion-functions.md#parsedatetime64besteffort)を使用して行うことができます。

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

上記の2行目と3行目には前のステップからの連結が含まれており、上記の4行目と5行目は文字列を`DateTime64`に解析します。苦情の終了時間が存在することが保証されていないため、`parseDateTime64BestEffortOrNull`が使用されます。

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
上記に示されている`1925`として表示されている日付は、データの誤りに起因しています。元のデータには年`1019` - `1022`の日付を持ついくつかのレコードがあり、これらは`2019` - `2022`であるべきです。これらは、64ビットDateTimeの最も早い日付である1925年1月1日に格納されています。
:::

## テーブルを作成する {#create-a-table}

上記で決定されたカラムのデータ型は、以下のテーブルスキーマに反映されています。テーブルに使用される`ORDER BY`および`PRIMARY KEY`も決定する必要があります。 `ORDER BY`または`PRIMARY KEY`のいずれかは指定する必要があります。 `ORDER BY`に含めるカラム決定に関するガイドラインは以下にあり、この文書の最後の*次のステップ*セクションにはさらに詳細があります。

### `ORDER BY`および`PRIMARY KEY`節 {#order-by-and-primary-key-clauses}

- `ORDER BY`タプルにはクエリフィルターで使用されるフィールドを含めるべきです。
- ディスク上の圧縮を最大化するために、`ORDER BY`タプルは昇順にカーディナリティで並べるべきです。
- 存在する場合、`PRIMARY KEY`タプルは`ORDER BY`タプルのサブセットでなければなりません。
- `ORDER BY`のみが指定されている場合、同じタプルが`PRIMARY KEY`として使用されます。
- 指定された`PRIMARY KEY`タプルがあれば、主キーインデックスはそのタプルを使用して作成され、それ以外の場合は`ORDER BY`タプルが使用されます。
- `PRIMARY KEY`インデックスは主メモリに保持されます。

データセットを見て、クエリすることによって答えられるかもしれない質問を考慮すると、ニューヨーク市の5つの区で報告された犯罪の種類を見たいと私たちは決定するかもしれません。これらのフィールドはその後`ORDER BY`に含められるかもしれません：

| カラム       | 説明（データ辞書から）                      |
| ----------- | ------------------------------------- |
| OFNS_DESC   | キーコードに対応する犯罪の説明                |
| RPT_DT      | 警察に報告されたイベントの日付                |
| BORO_NM     | 事件が発生した区の名前                      |

3つの候補カラムのカーディナリティについてTSVファイルをクエリします：

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

カーディナリティに基づいて`ORDER BY`が以下になります：

```sql
ORDER BY ( BORO_NM, OFNS_DESC, RPT_DT )
```
:::note
以下のテーブルは、より読みやすいカラム名を使用しますが、上記の名前は
```sql
ORDER BY ( borough, offense_description, date_reported )
```
にマッピングされます。
:::

データ型の変更と`ORDER BY`タプルを組み合わせたこのテーブル構造を示します：

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

### テーブルの主キーを見つける {#finding-the-primary-key-of-a-table}

ClickHouseの`system`データベース、特に`system.table`には、作成したテーブルに関するすべての情報があります。このクエリは`ORDER BY`（ソートキー）、および`PRIMARY KEY`を表示します：  
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

## データを前処理してインポートする {#preprocess-import-data}

データの前処理には`clickhouse-local`ツールを使用し、アップロードには`clickhouse-client`を使用します。

### 使用される`clickhouse-local`引数 {#clickhouse-local-arguments-used}

:::tip
`table='input'`は以下のclickhouse-localの引数に表示されます。clickhouse-localは引数で提供された入力（`cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`）をテーブルに挿入します。デフォルトではテーブル名は`table`です。このガイドではデータの流れを明確にするためにテーブル名を`input`に設定します。clickhouse-localの最後の引数は、テーブルから選択するクエリ（`FROM input`）で、これは`clickhouse-client`にパイプされ、テーブル`NYPD_Complaint`を埋めるために使用されます。 
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
データセットは年に1回以上変更されます。カウントはこの文書の内容と一致しない場合があります。
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

ClickHouseのデータセットのサイズは、元のTSVファイルのわずか12％です。元のTSVファイルのサイズとテーブルのサイズを比較します：

クエリ：

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

## いくつかのクエリを実行する {#run-queries}

### クエリ1. 月ごとの苦情の数を比較する {#query-1-compare-the-number-of-complaints-by-month}

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

### クエリ2. 区ごとの苦情の総数を比較する {#query-2-compare-total-number-of-complaints-by-borough}

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

[ClickHouseにおけるスパース主インデックスの実用的紹介](/guides/best-practices/sparse-primary-indexes.md)では、従来の関係データベースにおけるClickHouseのインデックスの違いや、ClickHouseがスパース主インデックスをどのように構築および使用するか、ならびにインデックスのベストプラクティスについて説明しています。
