---
slug: /use-cases/AI_ML/AIChat/semantic-layer
sidebar_label: 'Настройка чата Ask AI с помощью семантического слоя'
title: 'Оптимизация взаимодействия агента Ask AI с помощью семантического слоя'
pagination_prev: null
pagination_next: null
description: 'Руководство по использованию AGENTS.md для задания пользовательской бизнес-логики и инструкций, связанных с данными, для чат-агента Ask AI'
keywords: ['AI', 'ClickHouse Cloud', 'Агент', 'AGENTS.md', 'Семантический слой', 'Пользовательские инструкции', 'Системная подсказка']
show_related_blogs: true
doc_type: 'руководство'
---

# Настройка чата Ask AI с помощью семантического слоя \{#customize-ask-ai-chat-with-a-semantic-layer\}

Агента чата Ask AI можно настроить так, чтобы он понимал вашу специфическую бизнес-логику, структуры данных и доменные знания с помощью **AGENTS.md** — специального сохранённого запроса, который выступает в роли семантического слоя поверх системного промпта агента.

Создав файл AGENTS.md, вы можете задать пользовательские инструкции, которые будут вставляться в начало каждого разговора, чтобы направлять генерацию SQL‑запросов и анализ данных в соответствии с уникальными требованиями, вычислениями и принятыми соглашениями вашей организации.

## Как это работает \\{#how-it-works\\}

Когда вы сохраняете запрос с именем "AGENTS.md" (с учетом регистра) в Cloud Console:

1. Чат-агент Ask AI автоматически загружает этот файл при отправке сообщения
2. Содержимое помещается в структурированный тег и внедряется в системный промпт агента
3. Инструкции применяются ко всем чат-диалогам Ask AI в этом сервисе

## Создание AGENTS.md \\{#creating-agents-md\\}

<VerticalStepper headerLevel="h3">

### Создайте сохранённый запрос \\{#create-query\\}

1. В Cloud Console создайте новый запрос
2. Назовите его точно: **"AGENTS.md"** (с учётом регистра)
3. Напишите пользовательские инструкции в текстовом редакторе запроса (это не настоящий SQL‑запрос)
4. Сохраните запрос

### Добавьте инструкции \\{#add-instructions\\}

Структурируйте инструкции, используя понятный язык, побуждающий к действию. Включите:

- Бизнес-правила и вычисления
- Рекомендации по структуре данных
- Отраслевую терминологию
- Типовые шаблоны запросов
- Правила оптимизации производительности

</VerticalStepper>

## Рекомендации \\{#best-practices\\}

### Относитесь к контексту как к конечному ресурсу \\{#finite-resource\\}

Контекст ценен — каждый токен расходует «бюджет внимания» агента. Подобно людям с ограниченным объёмом рабочей памяти, языковые модели демонстрируют ухудшение качества работы по мере роста контекста. Это означает, что нужно находить **минимально возможный набор высокоинформативных токенов**, который максимизирует вероятность нужного вам результата.

### Найдите правильный уровень абстракции \\{#right-altitude\\}

Найдите баланс между двумя крайностями:

- **Слишком конкретно**: Жёстко зашитая логика if-else, делающая систему хрупкой и усложняющая сопровождение
- **Слишком расплывчато**: Высокоуровневые рекомендации, которые не дают конкретных ориентиров или ошибочно предполагают наличие общего контекста

Оптимальный уровень абстракции достаточно конкретен, чтобы эффективно направлять поведение, но при этом достаточно гибок, чтобы модель могла применять сильные эвристики. Начните с минимального промпта на лучшей доступной модели, а затем добавляйте чёткие инструкции, исходя из наблюдаемых сценариев сбоев.

### Структурируйте с помощью разделов \\{#structured-sections\\}

Используйте теги XML или заголовки Markdown, чтобы создавать отдельные разделы, удобные для быстрого просмотра:

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


### Предоставляйте разнообразные канонические примеры \\{#canonical-examples\\}

Примеры — это «иллюстрации, которые лучше тысячи слов». Вместо того чтобы пытаться включить в промпт каждый крайний случай, подготовьте компактный набор разнообразных примеров, которые эффективно демонстрируют ожидаемое поведение.

### Делайте инструкции минимальными, но достаточными \\{#minimal-complete\\}

- Включайте только часто востребованные инструкции
- Будьте лаконичны — избыточный контекст ухудшает работу из‑за «гниения контекста»
- Удаляйте устаревшие или редко используемые правила
- Обеспечьте достаточный объём информации, чтобы направлять желаемое поведение агента

:::tip
Минимальный объём не обязательно означает краткость. Нужно достаточно деталей, чтобы агент соблюдал ожидаемое поведение — просто избегайте ненужной многословности.
:::

## Пример: вычисляемые метрики на основе сырых данных \\{#example-calculated-metrics\\}

Направляйте работу агента в случаях, когда метрики нужно сначала вычислять, а не получать напрямую из столбца:

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


## Пример: Правила бизнес-логики \\{#example-business-logic\\}

Определите доменные вычисления и классификации:

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


## Пример: особенности структуры данных \\{#example-data-quirks\\}

Задокументируйте нестандартные форматы данных или устаревшие решения по схемам:

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


## Пример: терминология предметной области \\{#example-terminology\\}

Сопоставьте бизнес-термины с их технической реализацией:

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
