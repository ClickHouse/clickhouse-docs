---
sidebar_position: 1
slug: /tips-and-tricks/too-many-parts
sidebar_label: 'Слишком много партиций'
doc_type: 'guide'
keywords: [
  'clickhouse too many parts',
  'too many parts error',
  'clickhouse insert batching',
  'part explosion problem',
  'clickhouse merge performance',
  'batch insert optimization',
  'clickhouse async inserts',
  'small insert problems',
  'clickhouse parts management',
  'insert performance optimization',
  'clickhouse batching strategy',
  'database insert patterns'
]
title: 'Уроки — проблема "слишком много партиций"'
description: 'Решения и предотвращение проблемы "слишком много партиций"'
---



# Проблема слишком большого количества партов {#the-too-many-parts-problem}

_Это руководство является частью коллекции материалов, собранных на встречах сообщества. Больше практических решений и рекомендаций можно найти, [выбрав конкретную проблему](./community-wisdom.md)._
_Нужны дополнительные советы по оптимизации производительности? Ознакомьтесь с руководством сообщества по [оптимизации производительности](./performance-optimization.md)._


## Понимание проблемы {#understanding-the-problem}

ClickHouse выдаёт ошибку "Too many parts" для предотвращения серьёзной деградации производительности. Небольшие части вызывают множество проблем: низкую производительность запросов из-за чтения и слияния большего количества файлов при выполнении запросов, повышенное потребление памяти, поскольку каждая часть требует хранения метаданных в памяти, снижение эффективности сжатия, так как меньшие блоки данных сжимаются менее эффективно, увеличенные накладные расходы на операции ввода-вывода из-за большего количества файловых дескрипторов и операций позиционирования, а также более медленные фоновые слияния, создающие дополнительную нагрузку на планировщик слияний.

**Связанная документация**

- [Движок MergeTree](/engines/table-engines/mergetree-family/mergetree)
- [Части](/parts)
- [Системная таблица Parts](/operations/system-tables/parts)


## Раннее выявление проблемы {#recognize-parts-problem}

Этот запрос отслеживает фрагментацию таблиц путем анализа количества и размеров партов во всех активных таблицах. Он выявляет таблицы с избыточным количеством или слишком маленькими партами, которые могут требовать оптимизации слияния. Используйте его регулярно для обнаружения проблем фрагментации до того, как они повлияют на производительность запросов.

```sql runnable editable
-- Задача: Замените на фактические имена баз данных и таблиц для использования в продакшене
-- Эксперимент: Настройте пороговые значения количества партов (1000, 500, 100) в соответствии с вашей системой
SELECT
    database,
    table,
    count() as total_parts,
    sum(rows) as total_rows,
    round(avg(rows), 0) as avg_rows_per_part,
    min(rows) as min_rows_per_part,
    max(rows) as max_rows_per_part,
    round(sum(bytes_on_disk) / 1024 / 1024, 2) as total_size_mb,
    CASE
        WHEN count() > 1000 THEN 'КРИТИЧНО - Слишком много партов (>1000)'
        WHEN count() > 500 THEN 'ПРЕДУПРЕЖДЕНИЕ - Много партов (>500)'
        WHEN count() > 100 THEN 'ВНИМАНИЕ - Становится много партов (>100)'
        ELSE 'ОК - Приемлемое количество партов'
    END as parts_assessment,
    CASE
        WHEN avg(rows) < 1000 THEN 'ПЛОХО - Очень маленькие парты'
        WHEN avg(rows) < 10000 THEN 'УДОВЛЕТВОРИТЕЛЬНО - Маленькие парты'
        WHEN avg(rows) < 100000 THEN 'ХОРОШО - Средние парты'
        ELSE 'ОТЛИЧНО - Большие парты'
    END as part_size_assessment
FROM system.parts
WHERE active = 1
  AND database NOT IN ('system', 'information_schema')
GROUP BY database, table
ORDER BY total_parts DESC
LIMIT 20;
```


## Видеоматериалы {#video-sources}

- [Fast, Concurrent, and Consistent Asynchronous INSERTS in ClickHouse](https://www.youtube.com/watch?v=AsMPEfN5QtM) - сотрудник команды ClickHouse объясняет асинхронные вставки и проблему избыточного количества партов
- [Production ClickHouse at Scale](https://www.youtube.com/watch?v=liTgGiTuhJE) - стратегии пакетной обработки данных из реальных платформ мониторинга
