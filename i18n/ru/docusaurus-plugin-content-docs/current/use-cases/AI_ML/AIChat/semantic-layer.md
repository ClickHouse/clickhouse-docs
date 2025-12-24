---
slug: /use-cases/AI_ML/AIChat/semantic-layer
sidebar_label: 'Семантический слой'
title: 'Оптимизация диалогов с агентом Ask AI с помощью семантического слоя'
pagination_prev: null
pagination_next: null
description: 'Руководство по использованию AGENTS.md для задания пользовательской бизнес-логики и инструкций, специфичных для данных, чат-агенту Ask AI'
keywords: ['AI', 'ClickHouse Cloud', 'Agent', 'AGENTS.md', 'Семантический слой', 'Пользовательские инструкции', 'Системный промпт']
show_related_blogs: true
sidebar_position: 1
doc_type: 'guide'
---

# Настройка чата Ask AI с помощью семантического слоя {#customizing-ask-ai-chat-with-a-semantic-layer}

Агента чата Ask AI можно настроить так, чтобы он понимал специфическую бизнес-логику, структуры данных и отраслевые знания вашей организации, используя **AGENTS.md** — специальный сохранённый запрос, который служит семантическим слоем над системным промптом агента.

Создав файл AGENTS.md, вы можете задать настраиваемые инструкции, которые будут добавляться в начало каждого разговора, чтобы направлять генерацию SQL-запросов и анализ данных в соответствии с уникальными требованиями, расчётами и соглашениями вашей организации.

## Как это работает {#how-it-works}

Когда вы сохраняете запрос с именем "AGENTS.md" (с учётом регистра букв) в Cloud Console:

1. Чат-агент Ask AI автоматически загружает этот файл при отправке сообщения
2. Содержимое помещается в структурированный тег контента и внедряется в системный prompt (system prompt) агента
3. Инструкции применяются ко всем чат-диалогам Ask AI в этом сервисе

## Создание AGENTS.md {#creating-agents-md}

<VerticalStepper headerLevel="h3">

### Создайте сохранённый запрос {#create-query}

1. В Cloud Console создайте новый запрос
2. Назовите его точно так: **"AGENTS.md"** (с учётом регистра)
3. Напишите свои пользовательские инструкции в текстовом редакторе запроса (это не настоящий SQL)
4. Сохраните запрос

### Добавьте свои инструкции {#add-instructions}

Структурируйте свои инструкции, используя понятный, ориентированный на действия язык. Включите:

- Бизнес‑правила и вычисления
- Рекомендации по структуре данных
- Терминологию, специфичную для предметной области
- Типовые шаблоны запросов
- Правила оптимизации производительности

</VerticalStepper>

## Лучшие практики {#best-practices}

### Относитесь к контексту как к конечному ресурсу {#finite-resource}

Контекст ценен — каждый токен уменьшает «бюджет внимания» агента. Как и люди с ограниченной оперативной памятью, языковые модели испытывают снижение качества работы по мере роста контекста. Это означает, что нужно найти **наименьший возможный набор токенов с высоким информационным содержанием**, который максимизирует вероятность достижения желаемого результата.

### Найдите правильный уровень абстракции {#right-altitude}

Найдите баланс между двумя крайностями:

- **Слишком конкретно**: Жёстко запрограммированная хрупкая логика if-else, которая создаёт нестабильность и усложняет сопровождение
- **Слишком расплывчато**: Высокоуровневые рекомендации, которые не дают конкретных сигналов или ошибочно предполагают общий контекст

Оптимальный уровень абстракции достаточно конкретен, чтобы эффективно направлять поведение, но при этом достаточно гибок, чтобы модель могла применять сильные эвристики. Начните с минимального промпта на лучшей доступной модели, затем добавляйте чёткие инструкции на основе наблюдаемых отказов и ошибок.

### Организуйте с помощью структурированных разделов {#structured-sections}

Используйте XML-теги или заголовки Markdown, чтобы создавать отдельные, хорошо обозримые разделы:

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


### Предоставляйте разнообразные канонические примеры {#canonical-examples}

Примеры — как «картинка, которая стоит тысячи слов». Вместо того чтобы пытаться уместить в промпт все возможные крайние случаи, подготовьте небольшой, но разнообразный набор примеров, которые наглядно демонстрируют ожидаемое поведение.

### Делайте инструкции минимальными, но исчерпывающими {#minimal-complete}

- Включайте только часто используемые инструкции
- Будьте лаконичны — избыточный контекст ухудшает работу из‑за «context rot» (деградации контекста)
- Удаляйте устаревшие или редко используемые правила
- Обеспечьте достаточный объём информации, чтобы направлять поведение в нужное русло

:::tip
Минимализм не обязательно означает малый объём текста. Нужна достаточная детализация, чтобы агент придерживался ожидаемого поведения, просто избегайте лишней многословности.
:::

## Пример: вычисляемые метрики на основе сырых данных {#example-calculated-metrics}

Направляйте агента, когда метрики требуют специальных вычислений, а не прямого обращения к столбцам:

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


## Пример: правила бизнес-логики {#example-business-logic}

Определите доменные вычисления и правила категоризации:

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


## Пример: Особенности структуры данных {#example-data-quirks}

Задокументируйте нестандартные форматы данных или устаревшие решения по схеме данных:

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


## Пример: терминология предметной области {#example-terminology}

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
