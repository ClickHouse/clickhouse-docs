---
title: 'DataStore 日志'
sidebar_label: '日志'
slug: /chdb/debugging/logging
description: '配置 DataStore 日志以用于调试和监控'
keywords: ['chdb', 'datastore', '日志', '调试', '日志级别']
doc_type: 'reference'
---

# DataStore 日志 \{#datastore-logging\}

DataStore 使用 Python 标准日志模块。本文指南介绍如何配置日志以便进行调试。

## 快速入门 \{#quick-start\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config

# Enable debug logging
config.enable_debug()

# Now all operations will log details
ds = pd.read_csv("data.csv")
result = ds.filter(ds['age'] > 25).to_df()
```


## 日志级别 \{#levels\}

| 级别 | 数值 | 描述 |
|-------|-------|-------------|
| `DEBUG` | 10 | 用于调试的详细信息 |
| `INFO` | 20 | 常规运行信息 |
| `WARNING` | 30 | 警告消息（默认） |
| `ERROR` | 40 | 错误消息 |
| `CRITICAL` | 50 | 严重故障 |

## 设置日志级别 \{#setting-level\}

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


## 日志格式 \{#format\}

### 简洁格式（默认） \{#simple\}

```python
config.set_log_format("simple")
```

输出：

```text
DEBUG - Executing SQL query
DEBUG - Cache miss for key abc123
```


### 详细日志格式 \{#verbose\}

```python
config.set_log_format("verbose")
```

输出：

```text
2024-01-15 10:30:45.123 DEBUG datastore.core - Executing SQL query
2024-01-15 10:30:45.456 DEBUG datastore.cache - Cache miss for key abc123
```

***


## 会记录哪些数据 \{#what-logged\}

### DEBUG 级别 \{#debug-logged\}

* 生成的 SQL 查询
* 执行引擎的选择
* 缓存操作（命中/未命中）
* 操作耗时
* 数据源信息

```text
DEBUG - Creating DataStore from file 'data.csv'
DEBUG - SQL: SELECT * FROM file('data.csv', 'CSVWithNames') WHERE age > 25
DEBUG - Using engine: chdb
DEBUG - Execution time: 0.089s
DEBUG - Cache: Storing result (key: abc123)
```


### INFO 级别 \{#info-logged\}

* 重要操作的完成
* 配置变更
* 数据源连接情况

```text
INFO - Loaded 1,000,000 rows from data.csv
INFO - Execution engine set to: chdb
INFO - Connected to MySQL: localhost:3306/mydb
```


### WARNING 级别 \{#warning-logged\}

* 已弃用功能的使用
* 性能警告
* 非关键问题

```text
WARNING - Large result set (>1M rows) may cause memory issues
WARNING - Cache TTL exceeded, re-executing query
WARNING - Column 'date' has mixed types, using string
```


### ERROR 级别 \{#error-logged\}

* 查询执行失败
* 连接错误
* 数据转换错误

```text
ERROR - Failed to execute SQL: syntax error near 'FORM'
ERROR - Connection to MySQL failed: timeout
ERROR - Cannot convert column 'price' to float
```

***


## 自定义日志配置 \{#custom\}

### 使用 Python 日志功能 \{#python-logging\}

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


### 日志输出到文件 \{#log-file\}

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


### 抑制日志输出 \{#suppress\}

```python
import logging

# Suppress all DataStore logs
logging.getLogger('chdb.datastore').setLevel(logging.CRITICAL)

# Or using config
config.set_log_level(logging.CRITICAL)
```

***


## 调试场景 \{#scenarios\}

### 调试 SQL 语句生成 \{#debug-sql\}

```python
config.enable_debug()

ds = pd.read_csv("data.csv")
result = ds.filter(ds['age'] > 25).groupby('city').sum()
```

日志输出：

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


### 选择调试引擎 \{#debug-engine\}

```python
config.enable_debug()

result = ds.filter(ds['x'] > 10).apply(custom_func)
```

日志输出：

```text
DEBUG - filter: selecting engine (eligible: chdb, pandas)
DEBUG - filter: using chdb (SQL-compatible)
DEBUG - apply: selecting engine (eligible: pandas)
DEBUG - apply: using pandas (custom function)
```


### 调试缓存操作 \{#debug-cache\}

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


### 排查性能问题 \{#debug-performance\}

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

日志输出：

```text
DEBUG - filter: 0.002ms
DEBUG - groupby: 0.001ms
DEBUG - agg: 0.003ms
DEBUG - SQL generation: 0.012ms
DEBUG - SQL execution: 89.456ms  <- Main time spent here
DEBUG - Result conversion: 2.345ms
```

***


## 生产环境配置 \{#production\}

### 推荐配置 \{#recommended\}

```python
import logging
from chdb.datastore.config import config

# Production: minimal logging
config.set_log_level(logging.WARNING)
config.set_log_format("simple")
config.set_profiling_enabled(False)
```


### 日志轮转 \{#rotation\}

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


## 环境变量 \{#env-vars\}

你还可以通过环境变量配置日志：

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


## 摘要 \{#summary\}

| 任务 | 命令 |
|------|---------|
| 启用调试 | `config.enable_debug()` |
| 设置级别 | `config.set_log_level(logging.DEBUG)` |
| 设置格式 | `config.set_log_format("verbose")` |
| 输出到文件 | 使用 Python logging 处理器 |
| 抑制日志 | `config.set_log_level(logging.CRITICAL)` |