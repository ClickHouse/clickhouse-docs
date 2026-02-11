---
title: 'Конфигурация на уровне функций'
sidebar_label: 'Конфигурация функций'
slug: /chdb/configuration/function-config
description: 'Настройка движка выполнения и коррекции Dtype на уровне функций'
keywords: ['chdb', 'хранилище данных', 'функция', 'конфигурация', 'Dtype', 'коррекция']
doc_type: 'reference'
---

# Конфигурация на уровне функций \{#function-level-configuration\}

DataStore предоставляет тонкий контроль за выполнением на уровне отдельных функций, включая выбор движка и корректировку Dtype.

## Конфигурация движка функций \{#function-engine\}

Переопределяйте движок выполнения для конкретных функций.

### Задание движков функций \{#setting-engines\}

```python
from chdb.datastore.config import function_config

# Force specific functions to use chdb
function_config.use_chdb('length', 'substring', 'concat')

# Force specific functions to use pandas
function_config.use_pandas('upper', 'lower', 'capitalize')

# Set default preference
function_config.prefer_chdb()    # Default to chdb
function_config.prefer_pandas()  # Default to pandas

# Reset to auto
function_config.reset()
```


### Когда использовать \{#when-to-use\}

**Принудительно использовать chdb для:**

- Функций с более высокой производительностью в ClickHouse
- Функций, которые выигрывают от SQL-оптимизации
- Масштабных операций со строками и датой/временем

**Принудительно использовать pandas для:**

- Функций с поведением, специфичным для pandas
- Случаев, когда требуется полная совместимость с pandas
- Пользовательских строковых операций

### Пример \{#function-example\}

```python
from chdb import datastore as pd
from chdb.datastore.config import function_config

# Configure function engines
function_config.use_chdb('length', 'substring')
function_config.use_pandas('upper')

ds = pd.read_csv("data.csv")

# length() will use chdb
ds['name_len'] = ds['name'].str.len()

# substring() will use chdb  
ds['prefix'] = ds['name'].str.slice(0, 3)

# upper() will use pandas
ds['name_upper'] = ds['name'].str.upper()
```

***


## Общие функции \{#overlapping\}

159+ функций доступны как в движках chdb, так и pandas:

| Категория | Функции |
|----------|-----------|
| **String** | `length`, `upper`, `lower`, `trim`, `ltrim`, `rtrim`, `concat`, `substring`, `replace`, `reverse`, `contains`, `startswith`, `endswith` |
| **Math** | `abs`, `round`, `floor`, `ceil`, `exp`, `log`, `log10`, `sqrt`, `pow`, `sin`, `cos`, `tan` |
| **DateTime** | `year`, `month`, `day`, `hour`, `minute`, `second`, `dayofweek`, `dayofyear`, `quarter` |
| **Aggregation** | `sum`, `avg`, `min`, `max`, `count`, `std`, `var`, `median` |

Для общих функций движок выбирается на основе:

1. Явной настройки функции (если указана)
2. Глобальной настройки параметра execution_engine
3. Автоматического выбора на основе контекста

---

## Функции, доступные только в chdb \{#chdb-only\}

Некоторые функции доступны только через ClickHouse:

| Категория | Функции |
|----------|-----------|
| **Array** | `arraySum`, `arrayAvg`, `arraySort`, `arrayDistinct`, `groupArray`, `arrayElement` |
| **JSON** | `JSONExtractString`, `JSONExtractInt`, `JSONExtractFloat`, `JSONHas` |
| **URL** | `domain`, `path`, `protocol`, `extractURLParameter` |
| **IP** | `IPv4StringToNum`, `IPv4NumToString`, `isIPv4String` |
| **Geo** | `greatCircleDistance`, `geoDistance`, `geoToH3` |
| **Hash** | `cityHash64`, `xxHash64`, `sipHash64`, `MD5`, `SHA256` |
| **Условные функции** | `sumIf`, `countIf`, `avgIf`, `minIf`, `maxIf` |

Эти функции автоматически используют движок chdb независимо от конфигурации.

---

## Функции, доступные только в pandas \{#pandas-only\}

Некоторые функции доступны только через pandas:

| Категория | Функции |
|----------|-----------|
| **Apply** | Пользовательские lambda-выражения, пользовательские функции |
| **Сложный Pivot** | Сводные таблицы с пользовательской агрегацией |
| **Stack/Unstack** | Сложные операции изменения формы данных |
| **Interpolate** | Методы интерполяции временных рядов |

Эти функции автоматически используют движок pandas вне зависимости от конфигурации.

---

## Коррекция типов данных (Dtype) \{#dtype-correction\}

Настройте правила, по которым DataStore корректирует типы данных между движками.

### Уровни коррекции \{#correction-levels\}

```python
from chdb.datastore.dtype_correction.config import CorrectionLevel
from chdb.datastore.config import config

# No correction
config.set_correction_level(CorrectionLevel.NONE)

# Critical types only (NULL handling, boolean)
config.set_correction_level(CorrectionLevel.CRITICAL)

# High priority (default) - common type mismatches
config.set_correction_level(CorrectionLevel.HIGH)

# Medium - more aggressive correction
config.set_correction_level(CorrectionLevel.MEDIUM)

# All - correct all possible types
config.set_correction_level(CorrectionLevel.ALL)
```


### Подробное описание уровней коррекции \{#level-details\}

| Уровень | Описание | Корректируемые типы |
|--------|----------|---------------------|
| `NONE` | Без автоматической коррекции | Нет |
| `CRITICAL` | Критически важные коррекции | Обработка NULL, преобразование логических значений |
| `HIGH` (по умолчанию) | Наиболее распространённые коррекции | Точность целых/вещественных чисел, значения datetime, кодировка строк |
| `MEDIUM` | Дополнительные коррекции | Точность чисел DECIMAL, обработка часовых поясов |
| `ALL` | Максимальная коррекция | Все различия типов |

### Когда требуется исправление типов \{#when-correction\}

Различия в типах могут возникать в следующих случаях:

1. **ClickHouse → pandas**: Разные разряды целочисленных типов (Int64 vs int64)
2. **pandas → ClickHouse**: Преобразование объектов Python в SQL-типы
3. **Обработка NULL**: pandas NA vs ClickHouse NULL
4. **Boolean**: Различные представления логических типов
5. **DateTime**: Различия в часовых поясах

### Пример \{#correction-example\}

```python
from chdb.datastore.dtype_correction.config import CorrectionLevel
from chdb.datastore.config import config

# Strict mode - expect exact type matches
config.set_correction_level(CorrectionLevel.NONE)

# Relaxed mode - auto-fix type issues
config.set_correction_level(CorrectionLevel.ALL)
```

***


## API конфигурации функций \{#api\}

### Объект `function_config` \{#function-config-object\}

```python
from chdb.datastore.config import function_config

# Force engine for functions
function_config.use_chdb(*function_names)
function_config.use_pandas(*function_names)

# Set default preference
function_config.prefer_chdb()
function_config.prefer_pandas()

# Reset to default (auto)
function_config.reset()

# Check configuration
function_config.get_engine('length')  # Returns 'chdb', 'pandas', or 'auto'
```


### Переопределение на уровне вызова \{#per-call\}

Некоторые методы поддерживают переопределение движка на уровне отдельного вызова:

```python
# Using engine parameter (where supported)
ds['result'] = ds['col'].str.upper(engine='pandas')
```

***


## Лучшие практики \{#best-practices\}

### 1. Сначала используйте настройки по умолчанию \{#start-with-defaults\}

```python
# Use auto mode, let DataStore decide
config.use_auto()
```


### 2. Настройка под конкретные типы нагрузок \{#configure-for-specific-workloads\}

```python
# For ClickHouse-optimized string processing
function_config.use_chdb('length', 'substring', 'concat')

# For pandas-compatible string behavior
function_config.use_pandas('upper', 'lower')
```


### 3. Используйте соответствующий уровень исправления \{#use-appropriate-correction-level\}

```python
# Development: more permissive
config.set_correction_level(CorrectionLevel.ALL)

# Production: stricter
config.set_correction_level(CorrectionLevel.HIGH)
```


### 4. Протестируйте оба движка \{#test-both-engines\}

```python
# Test with chdb
config.use_chdb()
result_chdb = process_data()

# Test with pandas
config.use_pandas()
result_pandas = process_data()

# Compare results
assert result_chdb.equals(result_pandas)
```
