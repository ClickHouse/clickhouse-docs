---
sidebar_position: 1
slug: /community-wisdom/performance-optimization
sidebar_label: 'Оптимизация производительности'
doc_type: 'guide'
keywords: [
  'оптимизация производительности',
  'производительность запросов',
  'настройка базы данных',
  'медленные запросы',
  'оптимизация памяти',
  'анализ кардинальности',
  'стратегии индексирования',
  'оптимизация агрегаций',
  'методы семплирования',
  'производительность базы данных',
  'анализ запросов',
  'диагностика производительности'
]
title: 'Уроки по оптимизации производительности'
description: 'Примеры стратегий оптимизации производительности из реальной практики'
---

# Оптимизация производительности: стратегии, проверенные сообществом {#performance-optimization}
*Это руководство — часть подборки материалов, основанных на результатах встреч сообщества. Для получения дополнительных практических решений и идей вы можете [просматривать материалы по конкретным проблемам](./community-wisdom.md).*
*Столкнулись с проблемами материализованных представлений? Ознакомьтесь с руководством сообщества по [Materialized Views](./materialized-views.md).*
*Если вы сталкиваетесь с медленными запросами и вам нужно больше примеров, у нас также есть руководство по [оптимизации запросов](/optimize/query-optimization).*

## Располагаете столбцы по кардинальности (от низкой к высокой) {#cardinality-ordering}
Первичный индекс ClickHouse работает лучше всего, когда в ключе сначала идут столбцы с низкой кардинальностью — это позволяет эффективно пропускать большие блоки данных. Столбцы с высокой кардинальностью, расположенные дальше в ключе, обеспечивают более детальную сортировку внутри этих блоков. Начинайте со столбцов с небольшим числом уникальных значений (например, status, category, country) и заканчивайте столбцами с большим числом уникальных значений (например, user_id, timestamp, session_id).

См. дополнительную документацию по кардинальности и первичным индексам:
- [Выбор первичного ключа](/best-practices/choosing-a-primary-key)
- [Первичные индексы](/primary-indexes)

## Важна временная гранулярность {#time-granularity}

При использовании меток времени в предложении ORDER BY учитывайте компромисс между кардинальностью и точностью. Метки времени с микросекундной точностью создают очень высокую кардинальность (почти одно уникальное значение на каждую строку), что снижает эффективность разреженного первичного индекса ClickHouse. Округлённые метки времени создают меньшую кардинальность, что позволяет эффективнее пропускать данные при чтении за счёт индекса, но при этом вы теряете точность для временных запросов.

```sql runnable editable
-- Задание: Попробуйте различные функции времени, например toStartOfMinute или toStartOfWeek
-- Эксперимент: Сравните различия в кардинальности на ваших собственных данных временных меток
SELECT 
    'Точность до микросекунд' as granularity,
    uniq(created_at) as unique_values,
    'Создает огромную кардинальность - неэффективно для ключа сортировки' as impact
FROM github.github_events
WHERE created_at >= '2024-01-01'
UNION ALL
SELECT 
    'Точность до часа',
    uniq(toStartOfHour(created_at)),
    'Гораздо лучше для ключа сортировки - обеспечивает пропуск индексов'
FROM github.github_events
WHERE created_at >= '2024-01-01'
UNION ALL  
SELECT 
    'Точность до дня',
    uniq(toStartOfDay(created_at)),
    'Оптимально для отчетных запросов'
FROM github.github_events
WHERE created_at >= '2024-01-01';
```

## Focus on individual queries, not averages {#focus-on-individual-queries-not-averages}

When debugging ClickHouse performance, don't rely on average query times or overall system metrics. Instead, identify why specific queries are slow. A system can have good average performance while individual queries suffer from memory exhaustion, poor filtering, or high cardinality operations.

According to Alexey, CTO of ClickHouse: *"The right way is to ask yourself why this particular query was processed in five seconds... I don't care if median and other queries process quickly. I only care about my query"*

When a query is slow, don't just look at averages. Ask "Why was THIS specific query slow?" and examine the actual resource usage patterns.

## Memory and row scanning {#memory-and-row-scanning}

Sentry is a developer-first error tracking platform processing billions of events daily from 4+ million developers. Their key insight: *"The cardinality of the grouping key that's going to drive memory in this particular situation"* - High cardinality aggregations kill performance through memory exhaustion, not row scanning.

When queries fail, determine if it's a memory problem (too many groups) or scanning problem (too many rows).

A query like `GROUP BY user_id, error_message, url_path` creates a separate memory state for every unique combination of all three values together. With a higher load of users, error types, and URL paths, you could easily generate millions of aggregation states that must be held in memory simultaneously.

For extreme cases, Sentry uses deterministic sampling. A 10% sample reduces memory usage by 90% while maintaining roughly 5% accuracy for most aggregations:

```sql
WHERE cityHash64(user_id) % 10 = 0  -- Всегда одни и те же 10% пользователей
```

This ensures the same users appear in every query, providing consistent results across time periods. The key insight: `cityHash64()` produces consistent hash values for the same input, so `user_id = 12345` will always hash to the same value, ensuring that user either always appears in your 10% sample or never does - no flickering between queries.

## Sentry's bit mask optimization {#bit-mask-optimization}

When aggregating by high-cardinality columns (like URLs), each unique value creates a separate aggregation state in memory, leading to memory exhaustion. Sentry's solution: instead of grouping by the actual URL strings, group by boolean expressions that collapse into bit masks.

Here is a query that you can try on your own tables if this situation applies to you:

```sql
-- Паттерн эффективной агрегации по памяти: каждое условие = одно целое число на группу
-- Ключевая идея: sumIf() использует ограниченный объём памяти независимо от объёма данных
-- Память на группу: N целых чисел (N * 8 байт), где N = количество условий

SELECT 
    your_grouping_column,
    
    -- Каждый sumIf создаёт ровно один целочисленный счётчик на группу
    -- Объём памяти остаётся постоянным независимо от количества строк, соответствующих каждому условию
    sumIf(1, your_condition_1) as condition_1_count,
    sumIf(1, your_condition_2) as condition_2_count,
    sumIf(1, your_text_column LIKE '%pattern%') as pattern_matches,
    sumIf(1, your_numeric_column > threshold_value) as above_threshold,
    
    -- Сложные многоусловные агрегации также используют постоянный объём памяти
    sumIf(1, your_condition_1 AND your_text_column LIKE '%pattern%') as complex_condition_count,
    
    -- Стандартные агрегации для контекста
    count() as total_rows,
    avg(your_numeric_column) as average_value,
    max(your_timestamp_column) as latest_timestamp
    
FROM your_schema.your_table
WHERE your_timestamp_column >= 'start_date' 
  AND your_timestamp_column < 'end_date'
GROUP BY your_grouping_column
HAVING condition_1_count > minimum_threshold 
   OR condition_2_count > another_threshold
ORDER BY (condition_1_count + condition_2_count + pattern_matches) DESC
LIMIT 20
```

Вместо того чтобы хранить в памяти каждую уникальную строку, вы храните ответы на вопросы об этих строках в виде целых чисел. Состояние агрегации становится ограниченным и очень маленьким, независимо от разнообразия данных.

От инженерной команды Sentry: «Эти ресурсоёмкие запросы выполняются более чем в 10 раз быстрее, а использование памяти в 100 раз ниже (и, что ещё важнее, ограничено). Наши крупнейшие клиенты больше не сталкиваются с ошибками при поиске реплеев, и теперь мы можем поддерживать клиентов любого размера, не исчерпывая память».

## Видеоматериалы {#video-sources}

- [Lost in the Haystack - Optimizing High Cardinality Aggregations](https://www.youtube.com/watch?v=paK84-EUJCA) - практический опыт Sentry по оптимизации использования памяти в продакшене
- [ClickHouse Performance Analysis](https://www.youtube.com/watch?v=lxKbvmcLngo) - Алексей Миловидов о методологии отладки
- [ClickHouse Meetup: Query Optimization Techniques](https://www.youtube.com/watch?v=JBomQk4Icjo) - стратегии оптимизации от сообщества

**Читать далее**:
- [Руководство по оптимизации запросов](/optimize/query-optimization)
- [Материализованные представления: опыт сообщества](./materialized-views.md)