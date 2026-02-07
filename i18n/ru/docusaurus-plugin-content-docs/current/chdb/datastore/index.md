---
title: 'DataStore - API, совместимый с Pandas'
sidebar_label: 'Обзор'
slug: /chdb/datastore
description: 'DataStore предоставляет API, совместимый с pandas, с SQL-оптимизацией для высокопроизводительного анализа данных'
keywords: ['chdb', 'datastore', 'pandas', 'dataframe', 'sql', 'lazy evaluation']
doc_type: 'guide'
---

# DataStore: API chDB, совместимый с pandas и оптимизированный для SQL \{#datastore-pandas-compatible-api-with-sql-optimization\}

DataStore — это API chDB, совместимый с pandas, который сочетает привычный интерфейс pandas DataFrame с мощью оптимизации SQL‑запросов. Пишите код в стиле pandas, получайте производительность ClickHouse.

## Ключевые возможности \{#key-features\}

- **Совместимость с pandas**: 209 методов pandas DataFrame, 56 методов `.str`, более 42 методов `.dt`
- **Оптимизация SQL**: операции автоматически компилируются в оптимизированные SQL-запросы
- **Ленивые вычисления**: выполнение операций откладывается до момента, когда требуются результаты
- **Более 630 методов API**: обширный API для работы с данными
- **Расширения ClickHouse**: дополнительные аксессоры (`.arr`, `.json`, `.url`, `.ip`, `.geo`), недоступные в pandas

## Архитектура \{#architecture\}

<div style={{textAlign: 'center'}}>
  <img src="../images/datastore_architecture.png" alt="Архитектура DataStore" style={{maxWidth: '700px', width: '100%'}} />
</div>

DataStore использует **отложенные вычисления** с **двухдвижковой архитектурой выполнения**:

1. **Отложенная цепочка операций**: операции записываются, но не выполняются немедленно
2. **Интеллектуальный выбор движка**: QueryPlanner направляет каждый сегмент в оптимальный движок (chDB для SQL, Pandas для сложных операций)
3. **Промежуточное кэширование**: результаты кэшируются на каждом шаге для быстрого итеративного исследования данных

Подробности см. в разделе [Модель выполнения](execution-model.md).

## Миграция из Pandas одной строкой \{#migration\}

```python
# Before (pandas)
import pandas as pd
df = pd.read_csv("data.csv")
result = df[df['age'] > 25].groupby('city')['salary'].mean()

# After (DataStore) - just change the import!
from chdb import datastore as pd
df = pd.read_csv("data.csv")
result = df[df['age'] > 25].groupby('city')['salary'].mean()
```

Ваш существующий код pandas работает без изменений, но теперь выполняется поверх движка ClickHouse.


## Сравнение производительности \{#performance\}

DataStore обеспечивает значительный прирост производительности по сравнению с pandas, особенно для агрегаций и сложных пайплайнов:

| Операция | Pandas | DataStore | Ускорение |
|-----------|--------|-----------|-----------|
| GroupBy count | 347ms | 17ms | **19.93x** |
| Complex pipeline | 2,047ms | 380ms | **5.39x** |
| Filter+Sort+Head | 1,537ms | 350ms | **4.40x** |
| GroupBy agg | 406ms | 141ms | **2.88x** |

*Бенчмарк на 10M строк. Подробности см. в [скрипте бенчмарка](https://github.com/chdb-io/chdb/blob/main/refs/benchmark_datastore_vs_pandas.py) и [руководстве по производительности](../guides/pandas-performance.md).*

## Когда использовать DataStore \{#when-to-use\}

**Используйте DataStore, когда:**

- Работаете с большими наборами данных (миллионы строк)
- Выполняете агрегирование и операции groupby
- Выполняете запросы к данным из файлов, баз данных или облачных хранилищ
- Строите сложные конвейеры обработки данных
- Вам нужен API pandas с более высокой производительностью

**Используйте raw SQL API, когда:**

- Вы предпочитаете писать SQL напрямую
- Вам нужен точный контроль над выполнением запроса
- Работаете с функциями ClickHouse, которые недоступны через API pandas

## Сравнение возможностей \{#comparison\}

| Возможность | Pandas | Polars  | DuckDB | DataStore |
|-------------|--------|---------|--------|-----------|
| Совместимость с API Pandas | -      | Частичная | Нет | **Полная** |
| Отложенные вычисления | Нет     | Да     | Да | **Да** |
| Поддержка SQL-запросов | Нет     | Да     | Да | **Да** |
| Функции ClickHouse | Нет     | Нет      | Нет | **Да** |
| Методы доступа к строкам/DateTime | Да    | Да     | Нет | **Да + дополнительные возможности** |
| Array/JSON/URL/IP/Geo | Нет     | Частично | Нет | **Да** |
| Прямые запросы к файлам | Нет     | Да     | Да | **Да** |
| Поддержка облачных хранилищ | Нет     | Ограниченная поддержка | Да | **Да** |

## Статистика API \{#api-stats\}

| Категория | Количество | Покрытие |
|----------|-------|----------|
| Методы DataFrame | 209 | 100% API pandas |
| Аксессор Series.str | 56 | 100% API pandas |
| Аксессор Series.dt | 42+ | 100%+ (включая дополнительные возможности ClickHouse) |
| Аксессор Series.arr | 37 | Специфичный для ClickHouse |
| Аксессор Series.json | 13 | Специфичный для ClickHouse |
| Аксессор Series.url | 15 | Специфичный для ClickHouse |
| Аксессор Series.ip | 9 | Специфичный для ClickHouse |
| Аксессор Series.geo | 14 | Специфичный для ClickHouse |
| **Всего методов API** | **630+** | - |

## Навигация по документации \{#navigation\}

### Начало работы \{#getting-started\}

- [Быстрый старт](quickstart.md) - Установка и базовое использование
- [Миграция с Pandas](../guides/migration-from-pandas.md) - Пошаговое руководство по переходу с Pandas

### Справочник по API \{#api-reference\}

- [Factory Methods](factory-methods.md) - Фабричные методы для создания DataStore из различных источников
- [Query Building](query-building.md) - Операции построения запросов в стиле SQL
- [Pandas Compatibility](pandas-compat.md) - Все 209 методов, совместимых с pandas
- [Accessors](accessors.md) - аксессоры для String, DateTime, Array, JSON, URL, IP, Geo
- [Aggregation](aggregation.md) - агрегатные и оконные функции
- [I/O Operations](io.md) - чтение и запись данных

### Продвинутые темы \{#advanced-topics\}

- [Модель выполнения](execution-model.md) - Ленивые вычисления и кэширование
- [Справочник классов](class-reference.md) - Полный справочник по API

### Конфигурация и отладка \{#configuration-debugging\}

- [Конфигурация](../configuration/index.md) - Все параметры конфигурации
- [Режим производительности](../configuration/performance-mode.md) - режим, ориентированный на SQL, для максимальной пропускной способности
- [Отладка](../debugging/index.md) - EXPLAIN, профилирование и логирование

### Руководства для пользователей pandas \{#pandas-user-guides\}

- [Pandas Cookbook](../guides/pandas-cookbook.md) - Распространённые приёмы
- [Key Differences](../guides/pandas-differences.md) - Важные отличия от pandas
- [Performance Guide](../guides/pandas-performance.md) - Руководство по оптимизации производительности
- [SQL for Pandas Users](../guides/pandas-to-sql.md) - Понимание SQL, лежащего в основе операций pandas

## Краткий пример \{#quick-example\}

```python
from chdb import datastore as pd

# Read data from various sources
ds = pd.read_csv("sales.csv")
# or: ds = pd.DataStore.uri("s3://bucket/sales.parquet")
# or: ds = pd.DataStore.from_mysql("mysql://user:pass@host/db/table")

# Familiar pandas operations - automatically optimized to SQL
result = (ds
    .filter(ds['amount'] > 1000)           # WHERE amount > 1000
    .groupby('region')                      # GROUP BY region
    .agg({'amount': ['sum', 'mean']})       # SUM(amount), AVG(amount)
    .sort_values('sum', ascending=False)    # ORDER BY sum DESC
    .head(10)                               # LIMIT 10
)

# View the generated SQL
print(result.to_sql())

# Execute and get results
df = result.to_df()  # Returns pandas DataFrame
```


## Следующие шаги \{#next-steps\}

- **Впервые используете DataStore?** Начните с [краткого руководства по началу работы](quickstart.md)
- **Переходите с pandas?** Ознакомьтесь с [руководством по миграции](../guides/migration-from-pandas.md)
- **Хотите узнать больше?** Изучите [справочник API](class-reference.md)