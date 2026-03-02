---
description: '탭 구분 값 데이터를 5단계로 수집하고 쿼리하기'
sidebar_label: 'NYPD 신고 데이터'
slug: /getting-started/example-datasets/nypd_complaint_data
title: 'NYPD 신고 데이터'
doc_type: 'guide'
keywords: ['예제 데이터셋', 'nypd', '범죄 데이터', '샘플 데이터', '공공 데이터']
---

탭으로 구분된 값(Tab Separated Values, TSV) 파일은 일반적으로 사용되며, 파일의 첫 줄에 필드 헤더가 포함될 수 있습니다. ClickHouse는 TSV 파일을 수집할 수 있을 뿐만 아니라, 파일을 수집하지 않고도 TSV 파일에 대해 쿼리를 실행할 수 있습니다. 이 가이드에서는 이 두 가지 경우를 모두 다룹니다. CSV 파일을 쿼리하거나 수집해야 한다면 같은 기법을 사용할 수 있으며, 포맷 인수에서 `TSV`를 `CSV`로만 바꾸면 됩니다.

이 가이드를 진행하면서 다음을 수행합니다.

- **조사**: TSV 파일의 구조와 내용을 쿼리합니다.
- **대상 ClickHouse 스키마 결정**: 적절한 데이터 타입을 선택하고 기존 데이터를 해당 타입에 매핑합니다.
- **ClickHouse 테이블을 생성**합니다.
- 데이터를 ClickHouse로 **전처리하고 스트리밍**합니다.
- ClickHouse에 대해 **몇 가지 쿼리를 실행**합니다.

이 가이드에서 사용하는 데이터셋은 NYC Open Data 팀에서 제공하며, 「뉴욕시 경찰청(NYPD)에 신고된 모든 유효한 중범죄(felony), 경범죄(misdemeanor), 위반(violation) 범죄」에 대한 데이터를 포함합니다. 이 문서를 작성하는 시점에서 데이터 파일의 크기는 166MB였으며, 정기적으로 업데이트됩니다.

**출처**: [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)
**이용 약관**: https://www1.nyc.gov/home/terms-of-use.page

## 사전 준비 사항 \{#prerequisites\}

- [NYPD Complaint Data Current (Year To Date)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) 페이지에 접속한 다음 Export 버튼을 클릭하고 **TSV for Excel**을 선택하여 데이터셋을 다운로드합니다.
- [ClickHouse server and client](../../getting-started/install/install.mdx)를 설치합니다.

### 이 가이드에서 설명하는 명령어에 대한 참고 사항 \{#a-note-about-the-commands-described-in-this-guide\}

이 가이드에서 사용하는 명령어는 두 가지 유형이 있습니다.

- 일부 명령어는 TSV 파일을 대상으로 하는 쿼리이며, 명령 프롬프트에서 실행합니다.
- 나머지 명령어는 ClickHouse에 대한 쿼리이며, `clickhouse-client` 또는 Play UI에서 실행합니다.

:::note
이 가이드의 예시는 TSV 파일을 `${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv` 경로에 저장했다고 가정합니다. 필요한 경우 환경에 맞게 명령어를 조정하십시오.
:::

## TSV 파일 살펴보기 \{#familiarize-yourself-with-the-tsv-file\}

ClickHouse 데이터베이스로 작업을 시작하기 전에 먼저 TSV 데이터 파일을 살펴보십시오.

### 소스 TSV 파일의 필드를 살펴봅니다 \{#look-at-the-fields-in-the-source-tsv-file\}

다음은 TSV 파일에 쿼리를 실행하는 명령의 예시이지만, 아직 실행하지 마십시오.

```sh
clickhouse-local --query \
"describe file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')"
```

예시 응답

```response
CMPLNT_NUM                  Nullable(Float64)
ADDR_PCT_CD                 Nullable(Float64)
BORO_NM                     Nullable(String)
CMPLNT_FR_DT                Nullable(String)
CMPLNT_FR_TM                Nullable(String)
```

:::tip
대부분의 경우 위 명령으로 입력 데이터에서 어떤 필드가 숫자형이고, 어떤 필드가 문자열이며, 어떤 필드가 튜플인지 알 수 있습니다. 그러나 항상 그런 것은 아닙니다. ClickHouse는 수십억 개의 레코드를 포함하는 대규모 데이터셋에 자주 사용되므로, 스키마를 추론하기 위해 수십억 개의 행을 모두 파싱하지 않도록 기본적으로 100개의 행만 검사하여 [스키마를 추론](/integrations/data-formats/json/inference)합니다. 아래 응답은 데이터셋이 매년 여러 차례 업데이트되므로 실제로 보는 결과와 일치하지 않을 수 있습니다. 데이터 딕셔너리를 보면 CMPLNT&#95;NUM이 숫자가 아니라 텍스트로 지정된 것을 알 수 있습니다. 스키마 추론 시 기본 100행 대신 `SETTINGS input_format_max_rows_to_read_for_schema_inference=2000`으로 설정을 변경하면 데이터 내용을 더 잘 파악할 수 있습니다.

참고: 22.5 버전부터는 스키마를 추론할 때 기본값이 25,000행이므로, 이전 버전을 사용 중이거나 25,000행보다 더 많은 샘플이 필요한 경우에만 이 SETTING 값을 변경하십시오.
:::

명령 프롬프트에서 다음 명령을 실행하십시오. 다운로드한 TSV 파일의 데이터를 쿼리하기 위해 `clickhouse-local`을 사용합니다.

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

이 단계에서는 TSV 파일의 컬럼들이 [데이터셋 웹 페이지](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)의 **Columns in this Dataset** 섹션에 지정된 이름과 타입이 일치하는지 확인해야 합니다. 데이터 타입은 그다지 구체적으로 정의되어 있지 않으며, 모든 숫자 필드는 `Nullable(Float64)`로 설정되어 있고 그 밖의 모든 필드는 `Nullable(String)`입니다. 데이터를 저장하기 위한 ClickHouse 테이블을 CREATE할 때 더 적절하면서 성능이 뛰어난 타입을 지정할 수 있습니다.


### 올바른 스키마 결정하기 \{#determine-the-proper-schema\}

각 필드에 어떤 타입을 사용해야 하는지 파악하려면 데이터가 어떤 형태인지 알아야 합니다. 예를 들어 `JURISDICTION_CODE` 필드는 숫자형입니다. 이 필드를 `UInt8`으로 할지, `Enum`으로 할지, 아니면 `Float64`가 적절한지 결정해야 합니다.

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

쿼리 응답을 보면 `JURISDICTION_CODE`는 `UInt8`에 잘 들어맞는다는 것을 확인할 수 있습니다.

마찬가지로, 일부 `String` 필드를 확인하여 `DateTime` 또는 [`LowCardinality(String)`](../../sql-reference/data-types/lowcardinality.md) 필드로 사용하는 데 적합한지 살펴보십시오.

예를 들어, 필드 `PARKS_NM`은 &quot;해당되는 경우, 발생 위치인 NYC 공원, 놀이터 또는 녹지의 이름(주립공원은 포함되지 않음)&quot;으로 설명되어 있습니다. 뉴욕시 공원 이름은 `LowCardinality(String)`에 적합한 좋은 후보가 될 수 있습니다:

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

다음 공원 이름들을 살펴보십시오:

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

이 문서를 작성하는 시점에 사용 중인 데이터셋의 `PARK_NM` 컬럼에는 서로 다른 공원 및 놀이터가 수백 개 정도만 있습니다. 이는 `LowCardinality(String)` 필드에서 서로 다른 문자열 개수를 10,000개 이하로 유지해야 한다는 [LowCardinality](/sql-reference/data-types/lowcardinality#description) 권장 기준에 비추어 보면 작은 편입니다.


### DateTime 필드 \{#datetime-fields\}

[데이터셋 웹 페이지](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)의 **Columns in this Dataset** 섹션을 기준으로, 신고된 사건의 시작과 종료 시점을 나타내는 날짜 및 시간 필드가 있음을 알 수 있습니다. `CMPLNT_FR_DT`와 `CMPLT_TO_DT`의 최소값과 최대값을 확인하면 이 필드들이 항상 입력되어 있는지 여부를 가늠할 수 있습니다:

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


## 계획 수립 \{#make-a-plan\}

위의 조사 결과를 바탕으로 다음과 같이 정리할 수 있습니다.

- `JURISDICTION_CODE`는 `UInt8`로 캐스팅해야 합니다.
- `PARKS_NM`는 `LowCardinality(String)`으로 캐스팅해야 합니다.
- `CMPLNT_FR_DT`와 `CMPLNT_FR_TM`은 항상 값이 채워져 있습니다(기본 시간 `00:00:00`이 들어 있을 수 있음).
- `CMPLNT_TO_DT`와 `CMPLNT_TO_TM`은 비어 있을 수 있습니다.
- 날짜와 시간은 원본에서 서로 다른 필드에 저장되어 있습니다.
- 날짜는 `mm/dd/yyyy` 형식입니다.
- 시간은 `hh:mm:ss` 형식입니다.
- 날짜와 시간은 결합하여 DateTime 타입으로 만들 수 있습니다.
- 1970년 1월 1일 이전의 날짜가 일부 존재하므로 64비트 DateTime이 필요합니다.

:::note
타입에 대해 변경해야 할 사항은 이보다 훨씬 더 많으며, 모두 동일한 조사 단계를 따르면 결정할 수 있습니다. 필드에 들어 있는 서로 다른 문자열의 개수, 수치형 값의 최소/최댓값을 확인한 후 타입을 결정하십시오. 이 가이드의 후반부에서 제시되는 테이블 스키마에는 낮은 카디널리티 문자열과 부호 없는 정수 필드가 많이 사용되고, 부동 소수점 수치형은 매우 적습니다.
:::

## 날짜 및 시간 필드 연결 \{#concatenate-the-date-and-time-fields\}

날짜 및 시간 필드 `CMPLNT_FR_DT`와 `CMPLNT_FR_TM`을 하나의 `String` 값으로 이어 붙여 `DateTime`으로 캐스팅할 수 있도록 하려면, 연결 연산자를 사용해 두 필드를 다음과 같이 선택합니다: `CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM`. `CMPLNT_TO_DT` 및 `CMPLNT_TO_TM` 필드도 동일한 방식으로 처리합니다.

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


## 날짜 및 시간 String을 DateTime64 타입으로 변환 \{#convert-the-date-and-time-string-to-a-datetime64-type\}

앞에서 살펴본 대로 TSV 파일에는 1970년 1월 1일 이전 날짜가 포함되어 있으므로, 이러한 날짜에는 64비트 DateTime 타입이 필요합니다. 또한 날짜 형식을 `MM/DD/YYYY`에서 `YYYY/MM/DD` 형식으로 변환해야 합니다. 이 두 작업은 모두 [`parseDateTime64BestEffort()`](../../sql-reference/functions/type-conversion-functions.md#parseDateTime64BestEffort)를 사용하여 처리할 수 있습니다.

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

위의 2번과 3번 줄에는 이전 단계에서 이어 붙인 문자열이 들어 있고, 4번과 5번 줄에서는 이 문자열을 `DateTime64`로 파싱합니다. complaint 종료 시간이 항상 존재하는 것이 보장되지 않으므로 `parseDateTime64BestEffortOrNull`이 사용됩니다.

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
위에서 `1925`년으로 표시된 날짜는 데이터에 존재하는 오류 때문입니다. 원본 데이터에는 실제로는 `2019`년부터 `2022`년까지여야 하는 레코드가 여러 개 있는데, 연도가 `1019`년부터 `1022`년까지로 잘못 들어가 있습니다. 64비트 DateTime에서 표현 가능한 가장 이른 날짜가 1925년 1월 1일이므로, 이러한 값들은 모두 1925년 1월 1일로 저장됩니다.
:::


## 테이블 생성 \{#create-a-table\}

위에서 컬럼에 사용한 데이터 타입에 대한 결정은 아래 테이블 스키마에 반영되어 있습니다. 또한 테이블에 사용할 `ORDER BY`와 `PRIMARY KEY`도 결정해야 합니다. `ORDER BY` 또는 `PRIMARY KEY` 중 최소 하나는 지정해야 합니다. `ORDER BY`에 포함할 컬럼을 결정하기 위한 몇 가지 가이드라인은 아래에 있으며, 이에 대한 추가 정보는 이 문서 맨 끝의 *Next Steps* 섹션에 있습니다.

### `ORDER BY` 및 `PRIMARY KEY` 절 \{#order-by-and-primary-key-clauses\}

* `ORDER BY` 튜플에는 쿼리 필터에 사용되는 필드가 포함되어야 합니다.
* 디스크에서 압축률을 최대화하려면 `ORDER BY` 튜플을 카디널리티가 낮은 것부터 높은 것 순으로 정렬해야 합니다.
* 존재하는 경우 `PRIMARY KEY` 튜플은 `ORDER BY` 튜플의 부분집합이어야 합니다.
* `ORDER BY`만 지정된 경우 동일한 튜플이 `PRIMARY KEY`로 사용됩니다.
* 기본 키 인덱스는 지정된 경우 `PRIMARY KEY` 튜플을, 그렇지 않으면 `ORDER BY` 튜플을 사용하여 생성됩니다.
* `PRIMARY KEY` 인덱스는 메인 메모리에 유지됩니다.

데이터셋과 이에 대해 쿼리를 실행하여 얻을 수 있는 질문들을 살펴보면,
뉴욕시 5개 자치구에서 시간 경과에 따라 보고된 범죄 유형을 살펴보는 데 관심을 가질 수 있습니다.
이 경우 다음 필드들을 `ORDER BY`에 포함하도록 결정할 수 있습니다:

| Column        | Description (from the data dictionary) |
| ------------- | -------------------------------------- |
| OFNS&#95;DESC | 키 코드에 해당하는 범죄 설명                       |
| RPT&#95;DT    | 사건이 경찰에 보고된 날짜                         |
| BORO&#95;NM   | 사건이 발생한 자치구(borough)의 이름               |

이 세 개 후보 컬럼의 카디널리티를 확인하기 위해 TSV 파일을 쿼리합니다:

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

카디널리티 순으로 정렬하면 `ORDER BY` 절은 다음과 같습니다:

```sql
ORDER BY ( BORO_NM, OFNS_DESC, RPT_DT )
```

:::note
아래 테이블에서는 더 읽기 쉬운 컬럼 이름을 사용하며, 위의 이름들은 이에 매핑됩니다

```sql
ORDER BY ( borough, offense_description, date_reported )
```

:::

데이터 타입 변경과 `ORDER BY` 튜플을 반영하면 다음과 같은 테이블 구조가 됩니다:

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


### 테이블의 기본 키 찾기 \{#finding-the-primary-key-of-a-table\}

ClickHouse의 `system` 데이터베이스, 특히 `system.table`에는 방금 생성한 테이블에 대한 모든 정보가 있습니다.
다음 쿼리는 `ORDER BY`(정렬 키)와 `PRIMARY KEY`를 보여줍니다:

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


## 데이터 전처리 및 가져오기 \{#preprocess-import-data\}

데이터 전처리를 위해 `clickhouse-local` 도구를 사용하고, 데이터를 업로드하는 데에는 `clickhouse-client`를 사용합니다.

### `clickhouse-local`에서 사용하는 인자 \{#clickhouse-local-arguments-used\}

:::tip
아래 `clickhouse-local` 인자에는 `table='input'`이 포함됩니다. `clickhouse-local`은 제공된 입력(`cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`)을 받아 테이블에 삽입합니다. 기본적으로 테이블 이름은 `table`입니다. 이 가이드에서는 데이터 흐름을 더 명확하게 하기 위해 테이블 이름을 `input`으로 설정합니다. `clickhouse-local`의 마지막 인자는 테이블에서 조회를 수행하는 쿼리(`FROM input`)이며, 이 결과는 테이블 `NYPD_Complaint`을(를) 채우기 위해 `clickhouse-client`로 파이프됩니다.
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


## 데이터 검증 \{#validate-data\}

:::note
데이터셋은 연간 한 번 이상 변경될 수 있으므로, 이 문서에 기재된 값과 개수가 일치하지 않을 수 있습니다.
:::

쿼리:

```sql
SELECT count()
FROM NYPD_Complaint
```

실행 결과:

```text
┌─count()─┐
│  208993 │
└─────────┘

1 row in set. Elapsed: 0.001 sec.
```

ClickHouse에서 데이터셋 크기는 원본 TSV 파일의 12%에 불과합니다. 원본 TSV 파일과 테이블의 크기를 비교하십시오:

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


## 몇 가지 쿼리 실행하기 \{#run-queries\}

### 쿼리 1. 월별 민원 건수 비교 \{#query-1-compare-the-number-of-complaints-by-month\}

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


### 쿼리 2. 자치구별 전체 민원 건수 비교 \{#query-2-compare-total-number-of-complaints-by-borough\}

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


## 다음 단계 \{#next-steps\}

[A Practical Introduction to Sparse Primary Indexes in ClickHouse](/guides/best-practices/sparse-primary-indexes.md)는 전통적인 관계형 데이터베이스와 비교했을 때 ClickHouse 인덱싱의 차이점, ClickHouse가 희소 기본(primary) 인덱스를 구현하고 활용하는 방법, 그리고 인덱싱 모범 사례를 다룹니다.