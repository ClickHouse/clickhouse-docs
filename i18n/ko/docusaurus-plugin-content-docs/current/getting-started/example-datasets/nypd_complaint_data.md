---
'description': '5단계로 Tab Separated Value 데이터를 수집하고 쿼리합니다'
'sidebar_label': 'NYPD complaint data'
'slug': '/getting-started/example-datasets/nypd_complaint_data'
'title': 'NYPD Complaint Data'
'doc_type': 'guide'
'keywords':
- 'example dataset'
- 'nypd'
- 'crime data'
- 'sample data'
- 'public data'
---

Tab으로 구분된 값, 즉 TSV 파일은 일반적이며 파일의 첫 번째 줄에 필드 헤딩이 포함될 수 있습니다. ClickHouse는 TSV를 수집할 수 있으며, 파일을 수집하지 않고도 TSV를 쿼리할 수 있습니다. 이 가이드는 이 두 가지 경우를 다룹니다. CSV 파일을 쿼리하거나 수집해야 하는 경우 동일한 기술을 사용할 수 있으며, 형식 인수에서 `TSV`를 `CSV`로 대체하면 됩니다.

이 가이드를 진행하면서 다음을 수행합니다:
- **조사하기**: TSV 파일의 구조와 내용을 쿼리합니다.
- **대상 ClickHouse 스키마 결정하기**: 적절한 데이터 유형을 선택하고 기존 데이터를 해당 유형에 매핑합니다.
- **ClickHouse 테이블 생성하기**.
- **데이터를 ClickHouse로 전처리하고 스트리밍하기**.
- **ClickHouse에 대해 몇 가지 쿼리 실행하기**.

이 가이드에서 사용된 데이터 세트는 NYC Open Data 팀에서 제공하며 "뉴욕 경찰청(NYPD)에 보고된 모든 유효한 중범죄, 경범죄 및 위반 범죄"에 대한 데이터를 포함합니다. 작성 시점의 데이터 파일 크기는 166MB이지만 정기적으로 업데이트됩니다.

**출처**: [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)  
**이용 약관**: https://www1.nyc.gov/home/terms-of-use.page

## 전제 조건 {#prerequisites}
- [NYPD Complaint Data Current (Year To Date)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) 페이지를 방문하여 데이터 세트를 다운로드하고, 내보내기 버튼을 클릭한 후 **TSV for Excel**을 선택합니다.
- [ClickHouse 서버 및 클라이언트 설치하기](../../getting-started/install/install.mdx)

### 이 가이드에서 설명하는 명령에 대한 주의 사항 {#a-note-about-the-commands-described-in-this-guide}
이 가이드에는 두 가지 유형의 명령이 있습니다:
- 일부 명령은 TSV 파일을 쿼리하며, 이는 명령 프롬프트에서 실행됩니다.
- 나머지 명령은 ClickHouse를 쿼리하며, 이는 `clickhouse-client` 또는 Play UI에서 실행됩니다.

:::note
이 가이드의 예제는 TSV 파일이 `${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`로 저장되었음을 가정합니다. 필요에 따라 명령을 조정하십시오.
:::

## TSV 파일에 익숙해지기 {#familiarize-yourself-with-the-tsv-file}

ClickHouse 데이터베이스와 작업을 시작하기 전에 데이터에 익숙해져야 합니다.

### 원본 TSV 파일의 필드 보기 {#look-at-the-fields-in-the-source-tsv-file}

다음은 TSV 파일을 쿼리하기 위한 명령의 예시이지만, 아직 실행하지 마십시오.  
```sh
clickhouse-local --query \
"describe file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')"
```

샘플 응답  
```response
CMPLNT_NUM                  Nullable(Float64)
ADDR_PCT_CD                 Nullable(Float64)
BORO_NM                     Nullable(String)
CMPLNT_FR_DT                Nullable(String)
CMPLNT_FR_TM                Nullable(String)
```

:::tip
대부분의 경우 위 명령은 입력 데이터의 어떤 필드가 숫자인지, 어떤 필드가 문자열인지, 어떤 필드가 튜플인지 알려줍니다. 항상 그런 것은 아닙니다. ClickHouse는 수십억 개의 레코드를 포함하는 데이터 세트와 함께 사용되는 경우가 많기 때문에 스키마를 [유추하기 위해](https://integrations/data-formats/json/inference) 기본적으로 100개의 행이 검사됩니다. 이는 수십억 개의 행을 구문 분석하여 스키마를 유추하는 것을 피하기 위함입니다. 아래의 응답은 데이터 세트가 매년 여러 번 업데이트되기 때문에 여러분이 보는 것과 일치하지 않을 수 있습니다. 데이터 사전에서 CMPLNT_NUM이 숫자가 아닌 텍스트로 지정되어 있음을 확인할 수 있습니다. `SETTINGS input_format_max_rows_to_read_for_schema_inference=2000`을 사용하여 유추를 위한 기본 100행을 무시하면 내용에 대한 더 나은 아이디어를 얻을 수 있습니다.

참고: 22.5 버전부터 기본값은 이제 스키마 유추를 위한 25,000행입니다. 따라서 이전 버전을 사용하거나 25,000행 이상의 샘플이 필요한 경우에만 설정을 변경하십시오.
:::

명령 프롬프트에서 이 명령을 실행하십시오. 다운로드한 TSV 파일의 데이터를 쿼리하기 위해 `clickhouse-local`을 사용할 것입니다.  
```sh
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"describe file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')"
```

결과:  
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

지금까지 TSV 파일의 열이 [데이터 세트 웹 페이지](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) 의 **이 데이터 세트의 열** 섹션에 명시된 이름 및 유형과 일치하는지 확인해야 합니다. 데이터 유형은 매우 구체적이지 않으며, 모든 숫자 필드는 `Nullable(Float64)`로 설정되고, 모든 다른 필드는 `Nullable(String)`으로 설정됩니다. ClickHouse 테이블을 생성하여 데이터를 저장할 때 더 적절하고 성능이 좋은 유형을 지정할 수 있습니다.

### 적절한 스키마 결정 {#determine-the-proper-schema}

필드에 사용할 유형을 결정하기 위해 데이터가 어떻게 생겼는지 아는 것이 필요합니다. 예를 들어, 필드 `JURISDICTION_CODE`는 숫자입니다: 이것이 `UInt8`이 되어야 할지, `Enum`이 되어야 할지, 아니면 `Float64`가 적합한지 확인해야 합니다.

```sql
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select JURISDICTION_CODE, count() FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
 GROUP BY JURISDICTION_CODE
 ORDER BY JURISDICTION_CODE
 FORMAT PrettyCompact"
```

결과:  
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

쿼리 응답은 `JURISDICTION_CODE`가 `UInt8`에 잘 맞는 것을 보여줍니다.

유사하게, 몇 가지 `String` 필드를 살펴보며 `DateTime` 또는 [`LowCardinality(String)`](../../sql-reference/data-types/lowcardinality.md) 필드로 잘 맞는지 확인해야 합니다.

예를 들어, `PARKS_NM` 필드는 "해당하는 경우 사건 발생지의 NYC 공원, 놀이터 또는 녹지의 이름(주립 공원은 포함되지 않음)"으로 설명됩니다. 뉴욕시의 공원 이름은 `LowCardinality(String)`의 좋은 후보가 될 수 있습니다:

```sh
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select count(distinct PARKS_NM) FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
 FORMAT PrettyCompact"
```

결과:  
```response
┌─uniqExact(PARKS_NM)─┐
│                 319 │
└─────────────────────┘
```

몇 가지 공원 이름을 살펴보십시오:  
```sql
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select distinct PARKS_NM FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
 LIMIT 10
 FORMAT PrettyCompact"
```

결과:  
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

작성 시점의 데이터 세트는 `PARK_NM` 열에 몇 백 개의 서로 다른 공원 및 놀이터만 포함하고 있습니다. 이는 [`LowCardinality`](https://sql-reference/data-types/lowcardinality#description) 권장 사항에 따라 `LowCardinality(String)` 필드에서 10,000개 미만의 서로 다른 문자열을 유지하는 것을 기준으로 할 때 적은 숫자입니다.

### DateTime 필드 {#datetime-fields}
[데이터 세트 웹 페이지](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) 의 **이 데이터 세트의 열** 섹션에 따르면 보고된 사건의 시작 및 종료를 위한 날짜 및 시간 필드가 있습니다. `CMPLNT_FR_DT`와 `CMPLT_TO_DT`의 최소값과 최대값을 살펴보면 필드가 항상 채워져 있는지 여부를 알 수 있습니다:

```sh title="CMPLNT_FR_DT"
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select min(CMPLNT_FR_DT), max(CMPLNT_FR_DT) FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
FORMAT PrettyCompact"
```

결과:  
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

결과:  
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

결과:  
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

결과:  
```response
┌─min(CMPLNT_TO_TM)─┬─max(CMPLNT_TO_TM)─┐
│ (null)            │ 23:59:00          │
└───────────────────┴───────────────────┘
```

## 계획 세우기 {#make-a-plan}

위 조사에 따라:
- `JURISDICTION_CODE`는 `UInt8`로 변환해야 합니다.
- `PARKS_NM`은 `LowCardinality(String)`으로 변환해야 합니다.
- `CMPLNT_FR_DT` 및 `CMPLNT_FR_TM`은 항상 채워져 있습니다(기본 시간으로 `00:00:00`일 수 있음).
- `CMPLNT_TO_DT` 및 `CMPLNT_TO_TM`은 비어있을 수 있습니다.
- 날짜와 시간은 원본에서 별도의 필드로 저장됩니다.
- 날짜 형식은 `mm/dd/yyyy`입니다.
- 시간 형식은 `hh:mm:ss`입니다.
- 날짜와 시간은 DateTime 유형으로 연결될 수 있습니다.
- 1970년 1월 1일 이전의 날짜가 있으므로 64비트 DateTime이 필요합니다.

:::note
형식에 대해 변경해야 할 많은 사항이 있으며, 이는 동일한 조사 단계에 따라 모두 결정할 수 있습니다. 필드의 고유 문자열 수, 숫자의 최소 및 최대값을 살펴보고 결정을 내리십시오. 가이드 아래에 나오는 테이블 스키마는 많은 저카디널리티 문자열과 부호 없는 정수 필드, 매우 적은 부동 소수점 숫자를 가지고 있습니다.
:::

## 날짜 및 시간 필드 연결하기 {#concatenate-the-date-and-time-fields}

날짜 및 시간 필드 `CMPLNT_FR_DT` 및 `CMPLNT_FR_TM`을 하나의 `String`으로 연결하여 `DateTime`으로 변환할 수 있도록 하려면 연결 연산자 `CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM`을 사용하여 두 필드를 선택합니다. `CMPLNT_TO_DT` 및 `CMPLNT_TO_TM` 필드는 유사하게 처리됩니다.

```sh
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM AS complaint_begin FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
LIMIT 10
FORMAT PrettyCompact"
```

결과:  
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

## 날짜 및 시간 문자열을 DateTime64 형식으로 변환하기 {#convert-the-date-and-time-string-to-a-datetime64-type}

가이드 초반에 TSV 파일에 1970년 1월 1일 이전의 날짜가 있음을 발견했으므로, 날짜에 대해 64비트 DateTime 형식이 필요합니다. 날짜는 `MM/DD/YYYY`에서 `YYYY/MM/DD` 형식으로 변환해야 합니다. 이 두 가지는 모두 [`parseDateTime64BestEffort()`](../../sql-reference/functions/type-conversion-functions.md#parsedatetime64besteffort)로 수행할 수 있습니다.

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

위의 2행과 3행은 이전 단계에서 연결된 결과이며, 4행과 5행은 문자열을 `DateTime64`로 파싱합니다. 불만 종료 시간이 존재하는 것이 보장되지 않기 때문에 `parseDateTime64BestEffortOrNull`을 사용합니다.

결과:  
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
위에 표시된 `1925`년 날짜는 데이터 오류로 인해 발생합니다. 원본 데이터에는 `1019`년 - `1022`년의 날짜가 여러 개 있으며, 이 날짜는 `2019`년 - `2022`년이 되어야 합니다. 이러한 날짜는 64비트 DateTime으로 가능한 가장 이른 날짜인 1925년 1월 1일로 저장됩니다.
:::

## 테이블 생성하기 {#create-a-table}

열에 사용되는 데이터 유형에 대한 위의 결정 사항은 아래의 테이블 스키마에 반영됩니다. `ORDER BY` 및 테이블의 `PRIMARY KEY`에 대해 결정해야 합니다. `ORDER BY` 또는 `PRIMARY KEY` 중 적어도 하나는 지정해야 합니다. `ORDER BY`에 포함할 열을 결정할 때 몇 가지 지침이 있으며, 이에 대한 자세한 내용은 이 문서의 *다음 단계* 섹션에 있습니다.

### `ORDER BY` 및 `PRIMARY KEY` 절 {#order-by-and-primary-key-clauses}

- `ORDER BY` 튜플은 쿼리 필터에서 사용되는 필드를 포함해야 합니다.
- 디스크에서 압축을 극대화하려면 `ORDER BY` 튜플은 오름차순 카디널리티로 정렬되어야 합니다.
- 존재하는 경우, `PRIMARY KEY` 튜플은 `ORDER BY` 튜플의 일부여야 합니다.
- `ORDER BY`만 지정된 경우, 동일한 튜플이 `PRIMARY KEY`로 사용됩니다.
- `PRIMARY KEY` 튜플이 지정된 경우, 주 키 인덱스가 생성되며 그렇지 않으면 `ORDER BY` 튜플이 사용됩니다.
- `PRIMARY KEY` 인덱스는 주 메모리에 유지됩니다.

데이터 세트를 살펴보고 쿼리하여 답변할 수 있는 쿼리들 중에서, 우리가 뉴욕시의 다섯 개 자치구에서 시간 경과에 따라 보고된 범죄 유형을 살펴보는 것에 대해 결정할 수 있습니다. 이러한 필드는 `ORDER BY`에 포함될 수 있습니다:

| 열         | 설명 (데이터 사전에서)                          |
| ----------- | -------------------------------------------- |
| OFNS_DESC   | 키 코드와 관련된 범죄의 설명                     |
| RPT_DT      | 사건이 경찰에 보고된 날짜                       |
| BORO_NM     | 사건이 발생한 자치구의 이름                     |

세 가지 후보 열의 고유성(카디널리티)을 쿼리하여:

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

결과:  
```response
┌─cardinality_OFNS_DESC─┬─cardinality_RPT_DT─┬─cardinality_BORO_NM─┐
│ 60.00                 │ 306.00             │ 6.00                │
└───────────────────────┴────────────────────┴─────────────────────┘
```

카디널리티에 따라 정렬하면, `ORDER BY`는 다음과 같습니다:

```sql
ORDER BY ( BORO_NM, OFNS_DESC, RPT_DT )
```
:::note
아래 테이블은 읽기 쉬운 열 이름을 사용할 것이며, 위의 이름은 다음과 매핑됩니다.  
```sql
ORDER BY ( borough, offense_description, date_reported )
```
:::

데이터 유형 변경 사항과 `ORDER BY` 튜플을 종합하면 다음과 같은 테이블 구조가 생성됩니다:

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

### 테이블의 기본 키 찾기 {#finding-the-primary-key-of-a-table}

ClickHouse의 `system` 데이터베이스, 특히 `system.table`에는 방금 생성한 테이블에 대한 모든 정보가 포함되어 있습니다. 이 쿼리는 `ORDER BY`(정렬 키) 및 `PRIMARY KEY`를 보여줍니다:  
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

응답  
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

## 데이터 전처리 및 가져오기 {#preprocess-import-data}

우리는 `clickhouse-local` 도구를 사용하여 데이터를 전처리하고 `clickhouse-client`를 사용하여 업로드합니다.

### 사용된 `clickhouse-local` 인수 {#clickhouse-local-arguments-used}

:::tip
`table='input'`은 아래 clickhouse-local에 대한 인수에 나타납니다. clickhouse-local은 제공된 입력(`cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`)을 가져와서 테이블에 입력합니다. 기본적으로 테이블 이름은 `table`입니다. 이 가이드에서는 데이터 흐름을 명확하게 하기 위해 테이블 이름을 `input`으로 설정합니다. clickhouse-local의 마지막 인수는 테이블에서 선택하는 쿼리(`FROM input`)입니다. 그 후 클릭하우스 클라이언트로 파이프되어 `NYPD_Complaint` 테이블을 인구하게 됩니다.
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

## 데이터 검증 {#validate-data}

:::note
데이터 세트는 연간 한 번 이상 변경되며, 여러분의 수치는 이 문서의 수치와 일치하지 않을 수 있습니다.
:::

쿼리:

```sql
SELECT count()
FROM NYPD_Complaint
```

결과:

```text
┌─count()─┐
│  208993 │
└─────────┘

1 row in set. Elapsed: 0.001 sec.
```

ClickHouse에서 데이터 세트의 크기는 원본 TSV 파일의 12%에 불과하며, 원본 TSV 파일의 크기와 테이블 크기를 비교하십시오.

쿼리:

```sql
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'NYPD_Complaint'
```

결과:  
```text
┌─formatReadableSize(total_bytes)─┐
│ 8.63 MiB                        │
└─────────────────────────────────┘
```

## 몇 가지 쿼리 실행하기 {#run-queries}

### 쿼리 1. 월별 불만 수 비교하기 {#query-1-compare-the-number-of-complaints-by-month}

쿼리:

```sql
SELECT
    dateName('month', date_reported) AS month,
    count() AS complaints,
    bar(complaints, 0, 50000, 80)
FROM NYPD_Complaint
GROUP BY month
ORDER BY complaints DESC
```

결과:  
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

### 쿼리 2. 자치구별 전체 불만 수 비교하기 {#query-2-compare-total-number-of-complaints-by-borough}

쿼리:

```sql
SELECT
    borough,
    count() AS complaints,
    bar(complaints, 0, 125000, 60)
FROM NYPD_Complaint
GROUP BY borough
ORDER BY complaints DESC
```

결과:  
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

## 다음 단계 {#next-steps}

[ClickHouse에서 스파스 기본 인덱스에 대한 실용적인 소개](/guides/best-practices/sparse-primary-indexes.md)에서는 ClickHouse의 인덱싱과 전통적인 관계형 데이터베이스 간의 차이점, ClickHouse가 스파스 필수 인덱스를 구축하고 사용하는 방법, 그리고 인덱싱에 대한 모범 사례에 대해 논의합니다.
