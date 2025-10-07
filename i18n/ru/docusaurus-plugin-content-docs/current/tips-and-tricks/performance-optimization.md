---
'sidebar_position': 1
'slug': '/community-wisdom/performance-optimization'
'sidebar_label': 'Оптимизация производительности'
'doc_type': 'guide'
'keywords':
- 'performance optimization'
- 'query performance'
- 'database tuning'
- 'slow queries'
- 'memory optimization'
- 'cardinality analysis'
- 'indexing strategies'
- 'aggregation optimization'
- 'sampling techniques'
- 'database performance'
- 'query analysis'
- 'performance troubleshooting'
'title': 'Уроки - оптимизация производительности'
'description': 'Примеры из реальной жизни стратегий оптимизации производительности'
---
# Оптимизация производительности: проверенные стратегии сообщества {#performance-optimization}
*Этот гид является частью набора выводов, полученных на встречах сообщества. Для получения дополнительных решений и идей вы можете [просмотреть по конкретной проблеме](./community-wisdom.md).*
*Проблемы с материализованными представлениями? Ознакомьтесь с гидом по [Материализованным представлениям](./materialized-views.md) от сообщества.*
*Если у вас медленные запросы и вам нужно больше примеров, у нас также есть гид по [Оптимизации запросов](/optimize/query-optimization).*

## Порядок по кардинальности (от низкой к высокой) {#cardinality-ordering}
Первичный индекс ClickHouse работает лучше всего, когда колонки с низкой кардинальностью идут первыми, что позволяет эффективно пропускать большие объемы данных. Колонки с высокой кардинальностью, расположенные позже в ключе, обеспечивают детальную сортировку внутри этих объемов. Начинайте с колонок, имеющих несколько уникальных значений (например, статус, категория, страна), и заканчивайте колонками с множеством уникальных значений (например, user_id, timestamp, session_id).

Изучите дополнительные материалы о кардинальности и первичных индексах:
- [Выбор первичного ключа](/best-practices/choosing-a-primary-key)
- [Первичные индексы](/primary-indexes)

## Важность временной гранулярности {#time-granularity}
При использовании временных меток в вашем операторе ORDER BY учитывайте компромисс между кардинальностью и точностью. Микросекундные метки создают очень высокую кардинальность (почти одно уникальное значение на строку), что снижает эффективность разреженного первичного индекса ClickHouse. Округленные временные метки создают более низкую кардинальность, что позволяет лучше пропускать индексы, но при этом вы теряете точность для временных запросов.

```sql runnable editable
-- Challenge: Try different time functions like toStartOfMinute or toStartOfWeek
-- Experiment: Compare the cardinality differences with your own timestamp data
SELECT 
    'Microsecond precision' as granularity,
    uniq(created_at) as unique_values,
    'Creates massive cardinality - bad for sort key' as impact
FROM github.github_events
WHERE created_at >= '2024-01-01'
UNION ALL
SELECT 
    'Hour precision',
    uniq(toStartOfHour(created_at)),
    'Much better for sort key - enables skip indexing'
FROM github.github_events
WHERE created_at >= '2024-01-01'
UNION ALL  
SELECT 
    'Day precision',
    uniq(toStartOfDay(created_at)),
    'Best for reporting queries'
FROM github.github_events
WHERE created_at >= '2024-01-01';
```

## Сосредоточьтесь на отдельных запросах, а не на средних значениях {#focus-on-individual-queries-not-averages}

При отладке производительности ClickHouse не полагайтесь на среднее время запросов или общие системные метрики. Вместо этого определите, почему конкретные запросы работают медленно. Система может демонстрировать хорошую среднюю производительность, в то время как отдельные запросы страдают от исчерпания памяти, плохой фильтрации или операций с высокой кардинальностью.

По словам Алексея, CTO ClickHouse: *"Правильный подход - задать себе вопрос, почему этот конкретный запрос был обработан за пять секунд... Неважно, если медианные и другие запросы обрабатываются быстро. Мне важно только моё выполнение запроса."*

Когда запрос работает медленно, не ограничивайтесь средними значениями. Спросите: "Почему THIS конкретный запрос был медленным?" и изучите фактические паттерны использования ресурсов.

## Память и сканирование строк {#memory-and-row-scanning}

Sentry — это платформа отслеживания ошибок, ориентированная на разработчиков, обрабатывающая миллиарды событий ежедневно от более 4 миллионов разработчиков. Их ключевой вывод: *"Кардинальность ключа группировки будет определять использование памяти в данной ситуации"* - Агрегации с высокой кардинальностью убивают производительность через исчерпание памяти, а не через сканирование строк.

Когда запросы терпят неудачу, определить, проблема ли это с памятью (слишком много групп) или с сканированием (слишком много строк).

Запрос, подобный `GROUP BY user_id, error_message, url_path`, создает отдельное состояние памяти для каждой уникальной комбинации всех трех значений вместе. При большем количестве пользователей, типов ошибок и URL-путей вы можете легко создать миллионы состояний агрегации, которые должны храниться в памяти одновременно.

В крайних случаях Sentry использует детерминированное выборочное наблюдение. 10%-я выборка уменьшает использование памяти на 90%, сохраняя при этом около 5% точности для большинства агрегаций:

```sql
WHERE cityHash64(user_id) % 10 = 0  -- Always same 10% of users
```

Это гарантирует, что одни и те же пользователи появляются в каждом запросе, обеспечивая постоянные результаты в разные временные периоды. Ключевой вывод: `cityHash64()` производит последовательные хеш-значения для одного и того же ввода, так что `user_id = 12345` всегда будет хешироваться в одно и то же значение, что гарантирует, что пользователь либо всегда появится в вашей 10%-й выборке, либо никогда - без мерцания между запросами.

## Оптимизация битовой маски от Sentry {#bit-mask-optimization}

При агрегации по колонкам с высокой кардинальностью (например, URL) каждое уникальное значение создает отдельное состояние агрегации в памяти, что приводит к исчерпанию памяти. Решение Sentry: вместо группировки по фактическим строкам URL, группировать по логическим выражениям, которые сворачиваются в битовые маски.

Вот запрос, который вы можете попробовать на своих таблицах, если данная ситуация вам подходит:

```sql
-- Memory-Efficient Aggregation Pattern: Each condition = one integer per group
-- Key insight: sumIf() creates bounded memory regardless of data volume
-- Memory per group: N integers (N * 8 bytes) where N = number of conditions

SELECT 
    your_grouping_column,

    -- Each sumIf creates exactly one integer counter per group
    -- Memory stays constant regardless of how many rows match each condition
    sumIf(1, your_condition_1) as condition_1_count,
    sumIf(1, your_condition_2) as condition_2_count,
    sumIf(1, your_text_column LIKE '%pattern%') as pattern_matches,
    sumIf(1, your_numeric_column > threshold_value) as above_threshold,

    -- Complex multi-condition aggregations still use constant memory
    sumIf(1, your_condition_1 AND your_text_column LIKE '%pattern%') as complex_condition_count,

    -- Standard aggregations for context
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

Вместо того чтобы хранить каждую уникальную строку в памяти, вы храните ответ на вопросы о этих строках в виде целых чисел. Состояние агрегации становится ограниченным и маленьким, независимо от разнообразия данных.

От инженерной команды Sentry: "Эти тяжелые запросы работают более чем в 10 раз быстрее, а использование памяти у нас в 100 раз ниже (и, что более важно, ограничено). Наши крупнейшие клиенты больше не видят ошибок при поиске реплеев, и теперь мы можем поддерживать клиентов произвольного размера без исчерпания памяти."

## Видеоресурсы {#video-sources}

- [Потерянные в стоге сена - Оптимизация агрегаций с высокой кардинальностью](https://www.youtube.com/watch?v=paK84-EUJCA) - Уроки Sentry по оптимизации памяти
- [Анализ производительности ClickHouse](https://www.youtube.com/watch?v=lxKbvmcLngo) - Алексей Миловидов о методологии отладки
- [Встреча ClickHouse: Техники оптимизации запросов](https://www.youtube.com/watch?v=JBomQk4Icjo) - Стратегии оптимизации сообщества

**Читайте далее**:
- [Гид по оптимизации запросов](/optimize/query-optimization)
- [К insights сообщества по материализованным представлениям](./materialized-views.md)