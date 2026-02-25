---
slug: /use-cases/AI_ML/AIChat/semantic-layer
sidebar_label: '시맨틱 레이어로 Ask AI 채팅 맞춤화하기'
title: '시맨틱 레이어로 Ask AI 에이전트 대화 최적화하기'
pagination_prev: null
pagination_next: null
description: 'AGENTS.md를 사용하여 Ask AI 채팅 에이전트에 맞춤 비즈니스 로직과 데이터 특화 지침을 제공하는 방법에 대한 가이드'
keywords: ['AI', 'ClickHouse Cloud', 'Agent', 'AGENTS.md', 'Semantic Layer', 'Custom Instructions', 'System Prompt']
show_related_blogs: true
doc_type: 'guide'
---

# 시맨틱 레이어로 Ask AI 채팅 커스터마이징하기 \{#customize-ask-ai-chat-with-a-semantic-layer\}

Ask AI 채팅 에이전트는 **AGENTS.md**를 통해 조직의 비즈니스 로직, 데이터 구조, 도메인 지식을 이해하도록 커스터마이징할 수 있습니다. **AGENTS.md**는 에이전트의 시스템 프롬프트 위에 시맨틱 레이어 역할을 하는, 특별한 저장된 쿼리입니다.

AGENTS.md 파일을 생성하면 각 대화가 시작될 때마다 주입되는 사용자 정의 지시 사항을 제공하여, 조직 고유의 요구 사항, 계산, 관례에 기반해 SQL 쿼리 생성과 데이터 분석을 안내할 수 있습니다.

## 작동 방식 \{#how-it-works\}

Cloud Console에서 "AGENTS.md"라는 이름의 쿼리(대소문자 구분)를 저장하면 다음과 같이 동작합니다.

1. 메시지를 보내면 Ask AI 채팅 에이전트가 이 파일을 자동으로 로드합니다.
2. 해당 내용이 구조화된 콘텐츠 태그 안에 배치된 후 에이전트의 system prompt에 주입됩니다.
3. 이 지침은 해당 서비스의 모든 Ask AI 채팅 대화에 적용됩니다.

## AGENTS.md 만들기 \{#creating-agents-md\}

<VerticalStepper headerLevel="h3">

### 저장된 쿼리 생성 \{#create-query\}

1. Cloud Console에서 새 쿼리를 생성합니다.
2. 이름을 정확히 **"AGENTS.md"**로 지정합니다(대소문자 구분).
3. 쿼리 텍스트 편집기에서 사용자 지정 지침을 작성합니다(실제 SQL이 아닙니다).
4. 쿼리를 저장합니다.

### 지침 추가 \{#add-instructions\}

지침은 명확하고 실행 가능한 언어로 구성하십시오. 다음을 포함하십시오.

- 비즈니스 규칙 및 계산
- 데이터 구조 관련 안내
- 도메인 특화 용어
- 일반적인 쿼리 패턴
- 성능 최적화 규칙

</VerticalStepper>

## 모범 사례 \{#best-practices\}

### 컨텍스트를 유한한 자원으로 취급하기 \{#finite-resource\}

컨텍스트는 소중하며, 토큰이 추가될 때마다 에이전트의 「주의 예산(attention budget)」이 소모됩니다. 제한된 작업 메모리를 가진 인간처럼, 언어 모델도 컨텍스트가 커질수록 성능이 저하됩니다. 이는 원하는 결과를 얻을 가능성을 극대화할 수 있는 **가장 작으면서도 정보 밀도가 높은 토큰 집합**을 찾아야 함을 의미합니다.

### 적절한 추상화 수준 찾기 \{#right-altitude\}

두 가지 극단 사이에서 균형을 찾아야 합니다:

- **너무 구체적임**: 깨지기 쉬운 if-else 로직을 하드코딩하여 취약성과 유지 관리 복잡성을 키우는 경우
- **너무 추상적임**: 구체적인 신호를 제공하지 못하거나, 공유된 맥락이 있다고 잘못 가정하는 높은 수준의 안내만 제공하는 경우

최적의 추상화 수준은 행동을 효과적으로 이끌 수 있을 만큼 충분히 구체적이면서도, 모델이 강력한 휴리스틱을 적용할 수 있을 만큼 유연해야 합니다. 사용 가능한 최고의 모델에 최소한의 프롬프트로 시작한 뒤, 관찰된 실패 패턴을 기반으로 명확한 지침을 추가하십시오.

### 구조화된 섹션으로 정리하기 \{#structured-sections\}

XML 태그나 Markdown 헤더를 사용하여 명확하게 구분되고 한눈에 파악할 수 있는 섹션을 만드십시오:

```xml
<background_information>
Context about your data and domain
</background_information>

<calculation_rules>
Specific formulas and business logic
</calculation_rules>

<tool_guidance>
How to use specific ClickHouse features
</tool_guidance>
```


### 다양하고 대표적인 예시를 제공하십시오 \{#canonical-examples\}

예시는 「백문이 불여일견」과 같습니다. 모든 에지 케이스를 프롬프트에 잔뜩 넣기보다, 기대하는 동작을 효과적으로 보여 줄 수 있는 다양한 예시를 엄선해 선별적으로 제시하십시오.

### 최소하면서도 완전하게 유지하기 \{#minimal-complete\}

- 자주 필요한 지침만 포함하십시오
- 컨텍스트는 간결하게 유지하십시오 — 컨텍스트가 커지면 "context rot"로 인해 성능이 저하될 수 있습니다
- 오래되었거나 거의 사용되지 않는 규칙은 제거하십시오
- 원하는 동작을 유도할 수 있을 만큼 충분한 정보를 제공하십시오

:::tip
최소하다고 해서 반드시 짧다는 의미는 아닙니다. 에이전트가 기대되는 동작을 따르도록 하려면 충분한 세부 정보가 필요하며, 불필요하게 장황해지지만 않으면 됩니다.
:::

## 예시: 원시 데이터에서 계산된 메트릭 \{#example-calculated-metrics\}

메트릭이 컬럼을 직접 조회하는 대신 특정 계산이 필요한 경우, 에이전트에 다음과 같이 지시합니다:

```xml
<metric_calculations>
IMPORTANT: "active_sessions" is NOT a column. It must be calculated.

To calculate active sessions:
COUNT(DISTINCT session_id || '|' || user_id) AS active_sessions

This counts unique combinations of session and user identifiers.

When the user asks for "active sessions" or "session count", always use this formula:
SELECT
    date,
    COUNT(DISTINCT session_id || '|' || user_id) AS active_sessions
FROM events
GROUP BY date;

</metric_calculations>
```


## 예시: 비즈니스 로직 규칙 \{#example-business-logic\}

도메인별 계산 및 분류를 정의합니다:

```xml
<business_rules>
Revenue Calculation:
- Exclude refunded transactions: WHERE transaction_status != 'refunded'
- Apply regional tax rates using CASE expressions
- Use MRR for subscriptions:
  SUM(CASE
    WHEN billing_cycle = 'monthly' THEN amount
    WHEN billing_cycle = 'yearly' THEN amount / 12
    ELSE 0
  END) AS mrr

Traffic Source Classification:
Use CASE expression to categorize:
CASE
  WHEN traffic_source IN ('google', 'bing', 'organic') THEN 'Organic Search'
  WHEN traffic_source IN ('facebook', 'instagram', 'social') THEN 'Social Media'
  WHEN traffic_source = 'direct' THEN 'Direct'
  ELSE 'Other'
END AS source_category

Customer Segmentation:
- Enterprise: annual_contract_value >= 100000
- Mid-Market: annual_contract_value >= 10000 AND annual_contract_value < 100000
- SMB: annual_contract_value < 10000

Always include these categorizations when generating traffic or revenue reports.
</business_rules>
```


## 예시: 데이터 구조의 특이 사항 \{#example-data-quirks\}

비표준 데이터 형식이나 레거시 스키마 관련 결정을 문서화합니다:

```xml
<data_structure_notes>
The user_status column uses numeric codes, not strings:
- 1 = 'active'
- 2 = 'inactive'
- 3 = 'suspended'
- 99 = 'deleted'

When filtering or displaying user status, always use:
CASE user_status
  WHEN 1 THEN 'active'
  WHEN 2 THEN 'inactive'
  WHEN 3 THEN 'suspended'
  WHEN 99 THEN 'deleted'
END AS status_label

The product_metadata column contains JSON strings that must be parsed:
SELECT
    product_id,
    JSONExtractString(product_metadata, 'category') AS category,
    JSONExtractInt(product_metadata, 'inventory_count') AS inventory
FROM products;
</data_structure_notes>
```


## 예제: 도메인 용어 \{#example-terminology\}

비즈니스 용어를 기술 구현에 매핑합니다:

```xml
<terminology>
When users refer to "conversions", they mean:
- For e-commerce: transactions WHERE transaction_type = 'purchase'
- For SaaS: subscriptions WHERE subscription_status = 'active' AND first_payment_date IS NOT NULL

"Churn" is calculated as:
COUNT(DISTINCT user_id) WHERE last_active_date < today() - INTERVAL 90 DAY
AND previous_subscription_status = 'active'

"DAU" (Daily Active Users) means:
COUNT(DISTINCT user_id) WHERE activity_date = today()

"Qualified leads" must meet ALL criteria:
- lead_score >= 70
- company_size >= 50
- budget_confirmed = true
- contact_role IN ('Director', 'VP', 'C-Level')
</terminology>
```
