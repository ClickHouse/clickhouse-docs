---
title: 'Логирование DataStore'
sidebar_label: 'Логирование'
slug: /chdb/debugging/logging
description: 'Настройка логирования в DataStore для отладки и мониторинга'
keywords: ['chdb', 'datastore', 'logging', 'debug', 'log', 'level']
doc_type: 'reference'
---

# Логирование в DataStore \{#datastore-logging\}

DataStore использует стандартный модуль логирования языка Python. В этом руководстве описано, как настроить логирование для отладки.

## Быстрый старт \{#quick-start\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config

# Enable debug logging
config.enable_debug()

# Now all operations will log details
ds = pd.read_csv("data.csv")
result = ds.filter(ds['age'] > 25).to_df()
```


## Уровни логирования \{#levels\}

| Уровень | Значение | Описание |
|---------|----------|----------|
| `DEBUG` | 10 | Подробная информация для отладки |
| `INFO` | 20 | Общая информация о работе системы |
| `WARNING` | 30 | Предупреждения (уровень по умолчанию) |
| `ERROR` | 40 | Сообщения об ошибках |
| `CRITICAL` | 50 | Критические сбои |

## Настройка уровня логирования \{#setting-level\}

```python
import logging
from chdb.datastore.config import config

# Using standard logging levels
config.set_log_level(logging.DEBUG)
config.set_log_level(logging.INFO)
config.set_log_level(logging.WARNING)  # Default
config.set_log_level(logging.ERROR)

# Using quick preset
config.enable_debug()  # Sets DEBUG level + verbose format
```


## Формат логов \{#format\}

### Простой формат (по умолчанию) \{#simple\}

```python
config.set_log_format("simple")
```

Вывод:

```text
DEBUG - Executing SQL query
DEBUG - Cache miss for key abc123
```


### Подробный формат \{#verbose\}

```python
config.set_log_format("verbose")
```

Результат:

```text
2024-01-15 10:30:45.123 DEBUG datastore.core - Executing SQL query
2024-01-15 10:30:45.456 DEBUG datastore.cache - Cache miss for key abc123
```

***


## Что записывается в журнал \{#what-logged\}

### Уровень DEBUG \{#debug-logged\}

* Сгенерированные SQL-запросы
* Выбор исполнительного движка
* Операции кэша (попадания/промахи)
* Время выполнения операций
* Информация об источнике данных

```text
DEBUG - Creating DataStore from file 'data.csv'
DEBUG - SQL: SELECT * FROM file('data.csv', 'CSVWithNames') WHERE age > 25
DEBUG - Using engine: chdb
DEBUG - Execution time: 0.089s
DEBUG - Cache: Storing result (key: abc123)
```


### Уровень INFO \{#info-logged\}

* Завершение крупных операций
* Изменения конфигурации
* Подключения к источникам данных

```text
INFO - Loaded 1,000,000 rows from data.csv
INFO - Execution engine set to: chdb
INFO - Connected to MySQL: localhost:3306/mydb
```


### Уровень WARNING \{#warning-logged\}

* Использование устаревших функций
* Предупреждения о производительности
* Некритические проблемы

```text
WARNING - Large result set (>1M rows) may cause memory issues
WARNING - Cache TTL exceeded, re-executing query
WARNING - Column 'date' has mixed types, using string
```


### Уровень ERROR \{#error-logged\}

* Ошибки при выполнении запросов
* Ошибки подключения
* Ошибки преобразования данных

```text
ERROR - Failed to execute SQL: syntax error near 'FORM'
ERROR - Connection to MySQL failed: timeout
ERROR - Cannot convert column 'price' to float
```

***


## Пользовательская конфигурация логирования \{#custom\}

### Использование логирования в Python \{#python-logging\}

```python
import logging

# Configure root logger
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('datastore.log'),
        logging.StreamHandler()
    ]
)

# Get DataStore logger
ds_logger = logging.getLogger('chdb.datastore')
ds_logger.setLevel(logging.DEBUG)
```


### Логирование в файл \{#log-file\}

```python
import logging

# Create file handler
file_handler = logging.FileHandler('datastore_debug.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))

# Add to DataStore logger
ds_logger = logging.getLogger('chdb.datastore')
ds_logger.addHandler(file_handler)
```


### Отключение логирования \{#suppress\}

```python
import logging

# Suppress all DataStore logs
logging.getLogger('chdb.datastore').setLevel(logging.CRITICAL)

# Or using config
config.set_log_level(logging.CRITICAL)
```

***


## Сценарии отладки \{#scenarios\}

### Отладка генерации SQL-запросов \{#debug-sql\}

```python
config.enable_debug()

ds = pd.read_csv("data.csv")
result = ds.filter(ds['age'] > 25).groupby('city').sum()
```

Вывод логов:

```text
DEBUG - Creating DataStore from file 'data.csv'
DEBUG - Building filter: age > 25
DEBUG - Building groupby: city
DEBUG - Building aggregation: sum
DEBUG - Generated SQL:
        SELECT city, SUM(*) 
        FROM file('data.csv', 'CSVWithNames')
        WHERE age > 25
        GROUP BY city
```


### Выбор отладочного движка \{#debug-engine\}

```python
config.enable_debug()

result = ds.filter(ds['x'] > 10).apply(custom_func)
```

Вывод логов:

```text
DEBUG - filter: selecting engine (eligible: chdb, pandas)
DEBUG - filter: using chdb (SQL-compatible)
DEBUG - apply: selecting engine (eligible: pandas)
DEBUG - apply: using pandas (custom function)
```


### Отладка операций кэша \{#debug-cache\}

```python
config.enable_debug()

# First execution
result1 = ds.filter(ds['age'] > 25).to_df()
# DEBUG - Cache miss for query hash abc123
# DEBUG - Executing query...
# DEBUG - Caching result (key: abc123, size: 1.2MB)

# Second execution (same query)
result2 = ds.filter(ds['age'] > 25).to_df()
# DEBUG - Cache hit for query hash abc123
# DEBUG - Returning cached result
```


### Диагностика проблем с производительностью \{#debug-performance\}

```python
config.enable_debug()
config.enable_profiling()

# Logs will show timing for each operation
result = (ds
    .filter(ds['amount'] > 100)
    .groupby('region')
    .agg({'amount': 'sum'})
    .to_df()
)
```

Вывод логов:

```text
DEBUG - filter: 0.002ms
DEBUG - groupby: 0.001ms
DEBUG - agg: 0.003ms
DEBUG - SQL generation: 0.012ms
DEBUG - SQL execution: 89.456ms  <- Main time spent here
DEBUG - Result conversion: 2.345ms
```

***


## Конфигурация для продакшена \{#production\}

### Рекомендуемые настройки \{#recommended\}

```python
import logging
from chdb.datastore.config import config

# Production: minimal logging
config.set_log_level(logging.WARNING)
config.set_log_format("simple")
config.set_profiling_enabled(False)
```


### Ротация журналов \{#rotation\}

```python
import logging
from logging.handlers import RotatingFileHandler

# Create rotating file handler
handler = RotatingFileHandler(
    'datastore.log',
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5
)
handler.setLevel(logging.WARNING)

# Add to DataStore logger
logging.getLogger('chdb.datastore').addHandler(handler)
```

***


## Переменные окружения \{#env-vars\}

Вы также можете настроить логирование с помощью переменных окружения:

```bash
# Set log level
export CHDB_LOG_LEVEL=DEBUG

# Set log format
export CHDB_LOG_FORMAT=verbose
```

```python
import os
import logging

# Read from environment
log_level = os.environ.get('CHDB_LOG_LEVEL', 'WARNING')
config.set_log_level(getattr(logging, log_level))
```

***


## Сводка \{#summary\}

| Задача | Команда |
|------|---------|
| Включить отладку | `config.enable_debug()` |
| Установить уровень логирования | `config.set_log_level(logging.DEBUG)` |
| Установить формат логирования | `config.set_log_format("verbose")` |
| Логирование в файл | Используйте обработчики логирования Python |
| Подавить вывод логов | `config.set_log_level(logging.CRITICAL)` |