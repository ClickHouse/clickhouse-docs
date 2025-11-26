---
sidebar_position: 1
slug: /tips-and-tricks/too-many-parts
sidebar_label: 'Слишком много частей'
doc_type: 'guide'
keywords: [
  'clickhouse слишком много частей',
  'ошибка "Too many parts"',
  'clickhouse пакетирование вставок',
  'проблема взрывного роста числа частей',
  'производительность слияний clickhouse',
  'оптимизация пакетных вставок',
  'clickhouse асинхронные вставки',
  'проблемы с маленькими вставками',
  'управление частями clickhouse',
  'оптимизация производительности вставки',
  'стратегия пакетирования вставок clickhouse',
  'шаблоны вставки в базу данных'
]
title: 'Уроки — проблема «Too many parts»'
description: 'Решения и предотвращение проблемы «Too many parts»'
---



# Проблема слишком большого количества частей {#the-too-many-parts-problem}
*Это руководство является частью сборника выводов, полученных на встречах сообщества. Для получения большего количества практических решений и инсайтов вы можете [подобрать материалы по конкретным проблемам](./community-wisdom.md).*
*Нужны дополнительные советы по оптимизации производительности? Ознакомьтесь с руководством с инсайтами от сообщества по теме [Performance Optimization](./performance-optimization.md).*



## Понимание проблемы {#understanding-the-problem}

ClickHouse выдает ошибку «Too many parts», чтобы предотвратить серьезную деградацию производительности. Мелкие части данных вызывают несколько проблем: низкую производительность запросов из‑за чтения и слияния большего числа файлов во время выполнения запросов, повышенное потребление памяти, поскольку каждая часть требует метаданных в памяти, снижение эффективности сжатия, так как меньшие блоки данных сжимаются менее эффективно, более высокие накладные расходы на операции ввода‑вывода (I/O) из‑за большего количества файловых дескрипторов и операций позиционирования в файлах, а также более медленные фоновые слияния, поскольку планировщик слияний получает больше работы.

**Связанные документы**
- [Движок MergeTree](/engines/table-engines/mergetree-family/mergetree)
- [Части](/parts)
- [Системная таблица parts](/operations/system-tables/parts)



## Раннее выявление проблемы

Этот запрос отслеживает фрагментацию таблиц, анализируя количество и размеры частей во всех активных таблицах. Он выявляет таблицы с чрезмерным количеством или слишком мелкими частями, которым может потребоваться оптимизация слияния. Используйте его регулярно, чтобы обнаруживать проблемы фрагментации до того, как они начнут влиять на производительность запросов.

```sql runnable editable
-- Задача: замените на реальные имена баз данных и таблиц для боевой среды
-- Эксперимент: скорректируйте пороговые значения количества частей (1000, 500, 100) под вашу систему
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
        WHEN count() > 1000 THEN 'CRITICAL — Слишком много частей (>1000)'
        WHEN count() > 500 THEN 'WARNING — Много частей (>500)'
        WHEN count() > 100 THEN 'CAUTION — Частей становится много (>100)'
        ELSE 'OK — Разумное количество частей'
    END as parts_assessment,
    CASE 
        WHEN avg(rows) < 1000 THEN 'POOR — Очень маленькие части'
        WHEN avg(rows) < 10000 THEN 'FAIR — Небольшие части'
        WHEN avg(rows) < 100000 THEN 'GOOD — Средние части'
        ELSE 'EXCELLENT — Крупные части'
    END as part_size_assessment
FROM system.parts
WHERE active = 1
  AND database NOT IN ('system', 'information_schema')
GROUP BY database, table
ORDER BY total_parts DESC
LIMIT 20;
```


## Видеоматериалы {#video-sources}

- [Fast, Concurrent, and Consistent Asynchronous INSERTS in ClickHouse](https://www.youtube.com/watch?v=AsMPEfN5QtM) — сотрудник команды ClickHouse объясняет асинхронные INSERT и проблему слишком большого числа частей
- [Production ClickHouse at Scale](https://www.youtube.com/watch?v=liTgGiTuhJE) — практические стратегии пакетной обработки от платформ наблюдаемости