---
slug: /use-cases/AI_ML/AIChat/semantic-layer
sidebar_label: 'Настройка чата Ask AI с помощью семантического слоя'
title: 'Оптимизация диалогов агента Ask AI с помощью семантического слоя'
pagination_prev: null
pagination_next: null
description: 'Руководство по использованию AGENTS.md для задания пользовательской бизнес-логики и зависящих от данных инструкций для агента чата Ask AI'
keywords: ['AI', 'ClickHouse Cloud', 'Agent', 'AGENTS.md', 'Semantic Layer', 'Custom Instructions', 'System Prompt']
show_related_blogs: true
doc_type: 'guide'
---

# Настройка чата Ask AI с помощью семантического слоя \{#customize-ask-ai-chat-with-a-semantic-layer\}

Агента чата Ask AI можно настроить так, чтобы он понимал вашу специфическую бизнес‑логику, структуры данных и предметную область с помощью **AGENTS.md** — специального сохранённого запроса, который выступает в роли семантического слоя поверх системного промпта агента.

Создав файл AGENTS.md, вы можете задать настраиваемые инструкции, которые будут добавляться в начало каждого разговора, чтобы направлять генерацию SQL‑запросов и анализ данных в соответствии с уникальными требованиями, вычислениями и соглашениями вашей организации.

## Как это работает \{#how-it-works\}

Когда вы сохраняете запрос с именем "AGENTS.md" (с учётом регистра) в Cloud Console:

1. Чат-агент Ask AI автоматически загружает этот файл при отправке сообщения
2. Содержимое помещается в структурированный тег содержимого и внедряется в системный промпт агента
3. Инструкции применяются ко всем чат-диалогам Ask AI в данном сервисе

## Создание AGENTS.md \{#creating-agents-md\}

<VerticalStepper headerLevel="h3">

### Создайте сохранённый запрос \{#create-query\}

1. В Cloud Console создайте новый запрос
2. Назовите его в точности: **"AGENTS.md"** (с учётом регистра)
3. Напишите собственные инструкции в текстовом редакторе запроса (это не SQL)
4. Сохраните запрос

### Добавьте свои инструкции \{#add-instructions\}

Структурируйте инструкции, используя ясный, ориентированный на действие язык. Включите:

- Бизнес‑правила и вычисления
- Рекомендации по структуре данных
- Отраслевую терминологию
- Типовые шаблоны запросов
- Правила оптимизации производительности

</VerticalStepper>

## Рекомендуемые практики \{#best-practices\}

### Относитесь к контексту как к конечному ресурсу \{#finite-resource\}

Контекст ценен — каждый токен истощает «бюджет внимания» агента. Подобно людям с ограниченной оперативной памятью, языковые модели испытывают ухудшение качества работы по мере увеличения контекста. Это означает, что нужно находить **наименьший возможный набор максимально информативных токенов**, который максимально повышает вероятность желаемого результата.

### Найдите правильный уровень абстракции \{#right-altitude\}

Найдите баланс между двумя крайностями:

- **Слишком конкретно**: Жёсткое зашивание хрупкой if-else-логики, которое приводит к хрупкости системы и усложняет сопровождение
- **Слишком расплывчато**: Высокоуровневые рекомендации, которые не дают конкретных ориентиров или ложно предполагают общий контекст

Оптимальный уровень абстракции достаточно конкретен, чтобы эффективно направлять поведение, но при этом достаточно гибок, чтобы модель могла применять сильные эвристики. Начните с минимального промпта на лучшей доступной модели, затем добавляйте чёткие инструкции на основе наблюдаемых типов сбоев.

### Организуйте материал в структурированные разделы \{#structured-sections\}

Используйте XML-теги или заголовки Markdown, чтобы создавать отдельные, удобные для беглого просмотра разделы:

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


### Предоставляйте разнообразные канонические примеры \{#canonical-examples\}

Примеры — это «картинки, которые лучше тысячи слов». Вместо того чтобы пытаться включить в промпт каждый крайний случай, подготовьте сфокусированный набор разнообразных примеров, которые эффективно демонстрируют ожидаемое поведение.

### Делайте инструкции минимальными, но полными \{#minimal-complete\}

- Включайте только часто востребованные инструкции
- Будьте лаконичны — избыточный контекст ухудшает работу модели из‑за «размывания контекста»
- Удаляйте устаревшие или редко используемые правила
- Обеспечьте достаточно информации, чтобы направлять желаемое поведение

:::tip
Минимальный — не обязательно короткий. Нужен достаточный уровень детализации, чтобы агент придерживался ожидаемого поведения, просто избегайте лишней многословности.
:::

## Пример: вычисляемые метрики из необработанных данных \{#example-calculated-metrics\}

Направляйте агента, когда для метрик требуются специальные вычисления, а не прямое обращение к столбцам:

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


## Пример: правила бизнес-логики \{#example-business-logic\}

Определяйте доменные вычисления и классификации:

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


## Пример: особенности структуры данных \{#example-data-quirks\}

Задокументируйте нестандартные форматы данных или устаревшие решения по схеме:

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


## Пример: терминология предметной области \{#example-terminology\}

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
