---
'slug': '/use-cases/AI/ai-powered-sql-generation'
'sidebar_label': 'AI 기반 SQL 생성'
'title': 'AI 기반 SQL 생성'
'pagination_prev': null
'pagination_next': null
'description': '이 가이드는 ClickHouse Client 또는 clickhouse-local에서 SQL 쿼리를 생성하기 위해 AI를
  사용하는 방법을 설명합니다.'
'keywords':
- 'AI'
- 'SQL generation'
'show_related_blogs': true
'doc_type': 'guide'
---

Starting from ClickHouse 25.7, [ClickHouse Client](https://clickhouse.com/docs/interfaces/cli) 및 [clickhouse-local](https://clickhouse.com/docs/operations/utilities/clickhouse-local)은 자연어 설명을 SQL 쿼리로 변환하는 [AI 기반 기능](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation)을 포함합니다. 이 기능을 통해 사용자는 요구하는 데이터의 내용을 일반 텍스트로 설명할 수 있으며, 시스템은 이를 해당하는 SQL 문으로 변환합니다.

이 기능은 복잡한 SQL 구문에 익숙하지 않거나 탐색 데이터 분석을 위해 신속하게 쿼리를 생성해야 하는 사용자에게 특히 유용합니다. 이 기능은 표준 ClickHouse 테이블과 함께 작동하며, 필터링, 집계 및 조인과 같은 일반적인 쿼리 패턴을 지원합니다.

다음과 같은 내장 도구/기능의 도움을 받아 이를 수행합니다:

* `list_databases` - ClickHouse 인스턴스 내의 모든 사용 가능한 데이터베이스 목록
* `list_tables_in_database` - 특정 데이터베이스 내의 모든 테이블 목록
* `get_schema_for_table` - 특정 테이블의 `CREATE TABLE` 문(스키마) 가져오기

## Prerequisites {#prerequisites}

우리는 Anthropic 또는 OpenAI 키를 환경 변수로 추가해야 합니다:

```bash
export ANTHROPIC_API_KEY=your_api_key
export OPENAI_API_KEY=your_api_key
```

또는 [구성 파일을 제공할 수도](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation-configuration) 있습니다.

## Connecting to the ClickHouse SQL playground {#connecting-to-the-clickhouse-sql-playground}

우리는 [ClickHouse SQL playground](https://sql.clickhouse.com/)를 사용하여 이 기능을 탐색할 것입니다.

다음 명령을 사용하여 ClickHouse SQL playground에 연결할 수 있습니다:

```bash
clickhouse client -mn \
--host sql-clickhouse.clickhouse.com \
--secure \
--user demo --password ''
```

:::note
ClickHouse가 설치되어 있다고 가정하지만, 설치되어 있지 않은 경우 [설치 가이드](https://clickhouse.com/docs/install)를 참조하세요.
:::

## Asking ClickHouse questions in natural language {#asking-clickhouse-questions-in-natural-language}

이제 질문을 시작할 시간입니다!

텍스트를 SQL로 변환하는 기능은 효과적으로 일회성 쿼리 생성 도구입니다. 대화 기록을 유지하지 않기 때문에 질문에 가능한 많은 유용한 맥락을 포함하세요. 다음에 대해 구체적으로 묻는 것이 좋습니다:

시간 범위 또는 날짜 범위
원하는 분석 유형(평균, 총계, 순위 등)
필터링 기준

### Finding expensive housing markets {#finding-expensive-housing-markets}

주택 가격에 관한 질문을 시작해 보겠습니다. SQL playground에는 AI가 자동으로 발견할 수 있는 영국 주택 가격 데이터셋이 포함되어 있습니다:

```sql
?? Can you tell me the most expensive place to buy a house in 2021?;
```

엔터를 누르면 AI가 질문에 대한 답을 찾기 위해 생각하는 과정을 볼 수 있습니다.

```text
• Starting AI SQL generation with schema discovery...
─────────────────────────────────────────────────
🧠 thinking...[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_01QpQd35ZD8HM9QSYFZuQ8Wh
🔧 Calling: list_databases [toolu_01...]
🧠 thinking✓ list_databases completed
  └─ Found 37 databases: - amazon - bluesky - country - covid - default - dns - en...
🔧 Calling: list_databases [toolu_01...]
✓ list_databases completed
  └─ Found 37 databases: - amazon - bluesky - country - covid - default - dns - en...
🧠 thinking[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_016DxK8SMVKGrUPfFwi43AzE
🔧 Calling: list_tables_in_database [toolu_01...]
  └─ Args: {"database":"uk"}
🧠 thinking.✓ list_tables_in_database completed
  └─ Found 9 tables in database 'uk': - uk_codes - uk_postcode_to_iso - uk_price_p...
🔧 Calling: list_tables_in_database [toolu_01...]
  └─ Args: {"database":"uk"}
✓ list_tables_in_database completed
  └─ Found 9 tables in database 'uk': - uk_codes - uk_postcode_to_iso - uk_price_p...
🧠 thinking.[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_015giF12wm619beNGC5aTrmw
🔧 Calling: get_schema_for_table [toolu_01...]
  └─ Args: {"database":"uk","table":"uk_price_paid"}
✓ get_schema_for_table completed
  └─ Schema for uk.uk_price_paid: CREATE TABLE uk.uk_price_paid (     `price` UInt...
🔧 Calling: get_schema_for_table [toolu_01...]
  └─ Args: {"database":"uk","table":"uk_price_paid"}
🧠 thinking..✓ get_schema_for_table completed
  └─ Schema for uk.uk_price_paid: CREATE TABLE uk.uk_price_paid (     `price` UInt...
🧠 thinking[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_01HxT1HKbaTT3165Wx5bDtY9
─────────────────────────────────────────────────
• ✨ SQL query generated successfully!
:) SELECT     town,     district,     county,     round(avg(price), 2) as avg_price,     count() as total_sales FROM uk.uk_price_paid WHERE date >= '2021-01-01' AND date <= '2021-12-31' GROUP BY     town,     district,     county HAVING total_sales >= 10 ORDER BY avg_price DESC LIMIT 10
```

AI는 다음 단계를 따릅니다:

1. 스키마 탐색 - 사용 가능한 데이터베이스 및 테이블 탐색
2. 테이블 분석 - 관련 테이블의 구조 검사
3. 쿼리 생성 - 질문과 발견된 스키마를 기반으로 SQL 작성

`uk_price_paid` 테이블을 찾았고, 실행할 쿼리를 생성했다는 것을 확인할 수 있습니다.
그 쿼리를 실행하면 다음 출력을 볼 수 있습니다:

```text
┌─town───────────┬─district───────────────┬─county──────────┬──avg_price─┬─total_sales─┐
│ ILKLEY         │ HARROGATE              │ NORTH YORKSHIRE │    4310200 │          10 │
│ LONDON         │ CITY OF LONDON         │ GREATER LONDON  │ 4008117.32 │         311 │
│ LONDON         │ CITY OF WESTMINSTER    │ GREATER LONDON  │ 2847409.81 │        3984 │
│ LONDON         │ KENSINGTON AND CHELSEA │ GREATER LONDON  │  2331433.1 │        2594 │
│ EAST MOLESEY   │ RICHMOND UPON THAMES   │ GREATER LONDON  │ 2244845.83 │          12 │
│ LEATHERHEAD    │ ELMBRIDGE              │ SURREY          │ 2051836.42 │         102 │
│ VIRGINIA WATER │ RUNNYMEDE              │ SURREY          │ 1914137.53 │         169 │
│ REIGATE        │ MOLE VALLEY            │ SURREY          │ 1715780.89 │          18 │
│ BROADWAY       │ TEWKESBURY             │ GLOUCESTERSHIRE │ 1633421.05 │          19 │
│ OXFORD         │ SOUTH OXFORDSHIRE      │ OXFORDSHIRE     │ 1628319.07 │         405 │
└────────────────┴────────────────────────┴─────────────────┴────────────┴─────────────┘
```

후속 질문을 하려면 질문을 처음부터 다시 해야 합니다.

### Finding expensive properties in Greater London {#finding-expensive-properties-in-greater-london}

이 기능은 대화 기록을 유지하지 않기 때문에 각 쿼리는 독립적이어야 합니다. 후속 질문을 할 때는 이전 쿼리를 참조하지 말고 전체 맥락을 제공해야 합니다.
예를 들어, 이전 결과를 보고 나서 특별히 그레이터 런던의 특성에 초점을 맞추고 싶을 수 있습니다. "그레이터 런던은 어때요?"라고 묻는 대신 전체 맥락을 포함해야 합니다:

```sql
?? Can you tell me the most expensive place to buy a house in Greater London across the years?;
```

AI가 이전에 이 데이터를 검사했음에도 불구하고 동일한 탐색 과정을 거친다는 것을 알 수 있습니다:

```text
• Starting AI SQL generation with schema discovery...
─────────────────────────────────────────────────
🧠 thinking[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_012m4ayaSHTYtX98gxrDy1rz
🔧 Calling: list_databases [toolu_01...]
✓ list_databases completed
  └─ Found 37 databases: - amazon - bluesky - country - covid - default - dns - en...
🔧 Calling: list_databases [toolu_01...]
🧠 thinking.✓ list_databases completed
  └─ Found 37 databases: - amazon - bluesky - country - covid - default - dns - en...
🧠 thinking.[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_01KU4SZRrJckutXUzfJ4NQtA
🔧 Calling: list_tables_in_database [toolu_01...]
  └─ Args: {"database":"uk"}
🧠 thinking..✓ list_tables_in_database completed
  └─ Found 9 tables in database 'uk': - uk_codes - uk_postcode_to_iso - uk_price_p...
🔧 Calling: list_tables_in_database [toolu_01...]
  └─ Args: {"database":"uk"}
✓ list_tables_in_database completed
  └─ Found 9 tables in database 'uk': - uk_codes - uk_postcode_to_iso - uk_price_p...
🧠 thinking[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_01X9CnxoBpbD2xj2UzuRy2is
🔧 Calling: get_schema_for_table [toolu_01...]
  └─ Args: {"database":"uk","table":"uk_price_paid"}
🧠 thinking.✓ get_schema_for_table completed
  └─ Schema for uk.uk_price_paid: CREATE TABLE uk.uk_price_paid (     `price` UInt...
🔧 Calling: get_schema_for_table [toolu_01...]
  └─ Args: {"database":"uk","table":"uk_price_paid"}
✓ get_schema_for_table completed
  └─ Schema for uk.uk_price_paid: CREATE TABLE uk.uk_price_paid (     `price` UInt...
🧠 thinking...[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_01QTMypS1XuhjgVpDir7N9wD
─────────────────────────────────────────────────
• ✨ SQL query generated successfully!
:) SELECT     district,     toYear(date) AS year,     round(avg(price), 2) AS avg_price,     count() AS total_sales FROM uk.uk_price_paid WHERE county = 'GREATER LONDON' GROUP BY district, year HAVING total_sales >= 10 ORDER BY avg_price DESC LIMIT 10;
```

이것은 구체적으로 그레이터 런던을 필터링하고 결과를 연도별로 나누는 보다 정밀한 쿼리를 생성합니다.
쿼리의 출력은 다음과 같이 표시됩니다:

```text
┌─district────────────┬─year─┬───avg_price─┬─total_sales─┐
│ CITY OF LONDON      │ 2019 │ 14504772.73 │         299 │
│ CITY OF LONDON      │ 2017 │  6351366.11 │         367 │
│ CITY OF LONDON      │ 2016 │  5596348.25 │         243 │
│ CITY OF LONDON      │ 2023 │  5576333.72 │         252 │
│ CITY OF LONDON      │ 2018 │  4905094.54 │         523 │
│ CITY OF LONDON      │ 2021 │  4008117.32 │         311 │
│ CITY OF LONDON      │ 2025 │  3954212.39 │          56 │
│ CITY OF LONDON      │ 2014 │  3914057.39 │         416 │
│ CITY OF LONDON      │ 2022 │  3700867.19 │         290 │
│ CITY OF WESTMINSTER │ 2018 │  3562457.76 │        3346 │
└─────────────────────┴──────┴─────────────┴─────────────┘
```

런던 시는 지속적으로 가장 비싼 지역으로 나타납니다! AI가 합리적인 쿼리를 생성한 것을 알 수 있지만, 결과는 연대기 순서가 아닌 평균 가격에 따라 정렬되어 있음을 알아차릴 것입니다. 연도별 분석을 위해서는 "매년 가장 비싼 지역"이라는 질문으로 다시 세분화하여 서로 다른 결과를 얻을 수 있습니다.
