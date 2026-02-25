---
slug: /use-cases/AI/ai-powered-sql-generation
sidebar_label: 'AI 기반 SQL 생성'
title: 'AI 기반 SQL 생성'
pagination_prev: null
pagination_next: null
description: '이 가이드는 ClickHouse Client 또는 clickhouse-local에서 AI를 사용하여 SQL 쿼리를 생성하는 방법을 설명합니다.'
keywords: ['AI', 'SQL generation']
show_related_blogs: true
doc_type: 'guide'
---

ClickHouse 25.7부터 [ClickHouse Client](https://clickhouse.com/docs/interfaces/cli)와 [clickhouse-local](https://clickhouse.com/docs/operations/utilities/clickhouse-local)에 자연어 설명을 SQL 쿼리로 변환하는 [AI 기반 기능](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation)이 포함되어 있습니다. 이 기능을 사용하면 데이터 요구 사항을 일반 텍스트로 서술할 수 있으며, 시스템이 이를 해당 SQL 문으로 변환합니다.

이 기능은 복잡한 SQL 문법에 익숙하지 않거나, 탐색적 데이터 분석을 위해 쿼리를 빠르게 생성해야 하는 경우 특히 유용합니다. 표준 ClickHouse 테이블과 함께 사용할 수 있으며, 필터링, 집계, 조인 등을 포함한 일반적인 쿼리 패턴을 지원합니다.

이 기능은 다음과 같은 내장 도구 및 함수의 도움을 받아 동작합니다:

* `list_databases` - ClickHouse 인스턴스에서 사용 가능한 모든 데이터베이스를 나열합니다.
* `list_tables_in_database` - 특정 데이터베이스의 모든 테이블을 나열합니다.
* `get_schema_for_table` - 특정 테이블에 대한 `CREATE TABLE` 문(스키마)을 가져옵니다.

## 사전 준비 사항 \{#prerequisites\}

Anthropic 또는 OpenAI 키를 환경 변수로 추가해야 합니다.

```bash
export ANTHROPIC_API_KEY=your_api_key
export OPENAI_API_KEY=your_api_key
```

또는 [구성 파일을 제공](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation-configuration)할 수도 있습니다.


## ClickHouse SQL playground에 연결하기 \{#connecting-to-the-clickhouse-sql-playground\}

[ClickHouse SQL playground](https://sql.clickhouse.com/)을 사용하여 이 기능을 살펴보겠습니다.

다음 명령을 사용하여 ClickHouse SQL playground에 연결합니다:

```bash
clickhouse client -mn \
--host sql-clickhouse.clickhouse.com \
--secure \
--user demo --password ''
```

:::note
ClickHouse가 이미 설치되어 있다고 가정합니다. 설치되어 있지 않다면 [설치 가이드](https://clickhouse.com/docs/install)를 참조하십시오.
:::


## 자연어로 ClickHouse에 질문하기 \{#asking-clickhouse-questions-in-natural-language\}

이제 실제로 몇 가지 질문을 해 보겠습니다.

텍스트를 SQL로 변환하는 기능은 사실상 한 번에 하나의 쿼리만 생성하는 도구입니다. 대화 기록을 유지하지 않으므로 질문에 가능한 한 많은 유용한 맥락을 포함하는 것이 좋습니다. 다음 사항을 구체적으로 명시하십시오.

시간 구간 또는 날짜 범위
원하는 분석 유형(평균, 합계, 순위 등)
필터링 기준

### 고가 주택 시장 찾아보기 \{#finding-expensive-housing-markets\}

먼저 주택 가격에 대해 질문해 보겠습니다. SQL playground에는 영국(UK) 주택 가격 데이터셋이 포함되어 있으며, AI가 이를 자동으로 찾아줍니다:

```sql
?? Can you tell me the most expensive place to buy a house in 2021?;
```

Enter 키를 누르면, 질문에 대한 답을 생성하기 위해 AI가 어떤 사고 과정을 거치는지 확인할 수 있습니다.

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

1. 스키마 탐색 - 사용 가능한 데이터베이스와 테이블을 살펴봅니다
2. 테이블 분석 - 관련 테이블의 구조를 분석합니다
3. 쿼리 생성 - 질문과 탐색된 스키마를 기반으로 SQL을 생성합니다

`uk_price_paid` 테이블을 찾아 실행할 쿼리를 생성한 것을 확인할 수 있습니다.
해당 쿼리를 실행하면 다음과 같은 출력이 표시됩니다:


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

후속 질문을 하려면 질문을 처음부터 다시 입력해야 합니다.


### 그레이터 런던의 고가 부동산 찾기 \{#finding-expensive-properties-in-greater-london\}

이 기능은 대화 기록을 유지하지 않으므로 각 쿼리는 그 자체로 완결된 형태여야 합니다. 후속 질문을 할 때는 이전 쿼리를 참조하지 말고 전체 맥락을 다시 제공해야 합니다.
예를 들어, 이전 결과를 확인한 후에는 그레이터 런던 지역의 부동산에만 구체적으로 집중하고 싶을 수 있습니다. 「그레이터 런던은 어떤가요?」라고만 묻는 대신 전체 맥락을 모두 포함해야 합니다:

```sql
?? Can you tell me the most expensive place to buy a house in Greater London across the years?;
```

AI가 방금 이 데이터를 살펴봤음에도 동일한 탐색 과정을 다시 거친다는 점에 주목하십시오:

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

이는 Greater London만을 대상으로 필터링하고 연도별로 결과를 세분화하는 보다 구체적인 쿼리를 생성합니다.
해당 쿼리의 출력 결과는 아래와 같습니다:


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

런던 시티는 꾸준히 가장 비싼 구로 나타납니다! AI가 생성한 쿼리는 꽤 합리적이지만, 결과가 시간순이 아니라 평균 가격 기준으로 정렬되어 있다는 점을 확인할 수 있습니다. 연도별 분석을 위해서는 결과가 다르게 그룹화되도록, 질문을 「연도별로 가장 비싼 구」를 구체적으로 요청하는 방식으로 다듬을 수 있습니다.
