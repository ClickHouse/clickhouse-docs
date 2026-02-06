---
title: 'Конфигурация DataStore'
sidebar_label: 'Обзор'
slug: /chdb/configuration
description: 'Настройка движка выполнения DataStore, логирования, кэширования и профилирования'
keywords: ['chdb', 'datastore', 'конфигурация', 'config', 'настройки']
doc_type: 'reference'
---

# Настройка DataStore \{#datastore-configuration\}

DataStore предоставляет широкие возможности настройки для выбора движка выполнения, журналирования, кеширования, профилирования и коррекции типов данных (dtype).

## Краткая справка \{#quick-reference\}

```python
from chdb.datastore.config import config

# Quick setup presets
config.enable_debug()       # Enable verbose logging
config.use_chdb()           # Force ClickHouse engine
config.use_pandas()         # Force pandas engine
config.use_auto()           # Auto-select engine (default)
config.enable_profiling()   # Enable performance profiling
```


## Все параметры конфигурации \{#all-options\}

| Категория | Опция | Значения | По умолчанию | Описание |
|----------|--------|--------|---------|-------------|
| **Logging** | `log_level` | DEBUG/INFO/WARNING/ERROR | WARNING | Уровень детализации логов |
| | `log_format` | "simple", "verbose" | "simple" | Формат сообщений лога |
| **Cache** | `cache_enabled` | True/False | True | Включить кэширование результатов |
| | `cache_ttl` | float (seconds) | 0.0 | Время жизни кэша (TTL) |
| **Engine** | `execution_engine` | "auto", "chdb", "pandas" | "auto" | Движок выполнения |
| | `cross_datastore_engine` | "auto", "chdb", "pandas" | "auto" | Операции между DataStore |
| **Profiling** | `profiling_enabled` | True/False | False | Включить профилирование |
| **Dtype** | `correction_level` | NONE/CRITICAL/HIGH/MEDIUM/ALL | HIGH | Уровень коррекции Dtype |

---

## Способы настройки \{#methods\}

### Настройка логирования \{#logging\}

```python
from chdb.datastore.config import config
import logging

# Set log level
config.set_log_level(logging.DEBUG)
config.set_log_level(logging.INFO)
config.set_log_level(logging.WARNING)  # Default
config.set_log_level(logging.ERROR)

# Set log format
config.set_log_format("simple")   # Default
config.set_log_format("verbose")  # More details

# Quick enable debug mode
config.enable_debug()  # Sets DEBUG level + verbose format
```

Дополнительные сведения см. в разделе [Logging](logging.md).


### Настройка кэша \{#cache\}

```python
# Enable/disable caching
config.set_cache_enabled(True)   # Default
config.set_cache_enabled(False)  # Disable caching

# Set cache TTL (time-to-live)
config.set_cache_ttl(60.0)  # Cache expires after 60 seconds
config.set_cache_ttl(0.0)   # No expiration (default)

# Check current settings
print(config.cache_enabled)
print(config.cache_ttl)
```


### Конфигурация движка \{#engine\}

```python
# Set execution engine
config.set_execution_engine('auto')    # Auto-select (default)
config.set_execution_engine('chdb')    # Force ClickHouse
config.set_execution_engine('pandas')  # Force pandas

# Quick presets
config.use_auto()     # Auto-select
config.use_chdb()     # Force ClickHouse
config.use_pandas()   # Force pandas

# Cross-DataStore engine (for operations between different DataStores)
config.set_cross_datastore_engine('auto')
config.set_cross_datastore_engine('chdb')
config.set_cross_datastore_engine('pandas')

# Check current engine
print(config.execution_engine)
```

Подробности см. в разделе [Execution Engine](execution-engine.md).


### Настройка профилирования \{#profiling\}

```python
# Enable profiling
config.enable_profiling()
config.set_profiling_enabled(True)

# Disable profiling
config.set_profiling_enabled(False)

# Check if profiling is enabled
print(config.profiling_enabled)
```

Подробности см. в разделе [Profiling](../debugging/profiling.md).


### Коррекция типов данных \{#dtype\}

```python
from chdb.datastore.dtype_correction.config import CorrectionLevel

# Set correction level
config.set_correction_level(CorrectionLevel.NONE)      # No correction
config.set_correction_level(CorrectionLevel.CRITICAL)  # Critical types only
config.set_correction_level(CorrectionLevel.HIGH)      # Default
config.set_correction_level(CorrectionLevel.MEDIUM)    # More corrections
config.set_correction_level(CorrectionLevel.ALL)       # All corrections
```

***


## Использование объекта config \{#config-object\}

Объект `config` — это синглтон, который управляет всеми параметрами:

```python
from chdb.datastore.config import config

# Read settings
print(config.log_level)
print(config.execution_engine)
print(config.cache_enabled)
print(config.profiling_enabled)

# Modify settings
config.set_log_level(logging.DEBUG)
config.set_execution_engine('chdb')
config.set_cache_enabled(False)
config.enable_profiling()
```

***


## Конфигурация в коде \{#in-code\}

### Настройка отдельных скриптов \{#per-script\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config

# Configure at script start
config.enable_debug()
config.use_chdb()
config.enable_profiling()

# Your DataStore code
ds = pd.read_csv("data.csv")
result = ds.filter(ds['age'] > 25).groupby('city').agg({'salary': 'mean'})
```


### Менеджер контекста (планируется) \{#context-manager\}

```python
# Planned feature: temporary configuration
with config.override(execution_engine='pandas'):
    result = ds.process()
# Original settings restored
```

***


## Типовые сценарии настройки \{#scenarios\}

### Разработка и отладка \{#dev-config\}

```python
from chdb.datastore.config import config

config.enable_debug()        # Verbose logging
config.enable_profiling()    # Performance tracking
config.set_cache_enabled(False)  # Disable caching for fresh results
```


### Продакшн-среда \{#prod-config\}

```python
from chdb.datastore.config import config
import logging

config.set_log_level(logging.WARNING)  # Minimal logging
config.set_execution_engine('auto')    # Optimal engine selection
config.set_cache_enabled(True)         # Enable caching
config.set_profiling_enabled(False)    # Disable profiling overhead
```


### Тестирование производительности \{#perf-config\}

```python
from chdb.datastore.config import config

config.use_chdb()            # Force ClickHouse for benchmarks
config.enable_profiling()    # Track performance
config.set_cache_enabled(False)  # Disable cache for accurate timing
```


### Проверка совместимости с Pandas \{#compat-config\}

```python
from chdb.datastore.config import config

config.use_pandas()          # Force pandas engine
config.enable_debug()        # See what operations are used
```

***


## Сопутствующая документация \{#related\}

- [Execution Engine](execution-engine.md) — подробности выбора движка
- [Function Config](function-config.md) — конфигурация движка на уровне функции
- [Logging](../debugging/logging.md) — настройка логирования
- [Profiling](../debugging/profiling.md) — профилирование производительности