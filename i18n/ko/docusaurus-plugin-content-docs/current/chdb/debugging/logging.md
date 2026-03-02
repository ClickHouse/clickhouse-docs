---
title: 'DataStore 로깅'
sidebar_label: '로깅'
slug: /chdb/debugging/logging
description: '디버깅 및 모니터링을 위한 DataStore 로깅 구성'
keywords: ['chdb', 'datastore', 'logging', 'debug', 'log', 'level']
doc_type: 'reference'
---

# DataStore 로깅 \{#datastore-logging\}

DataStore는 Python의 표준 logging 모듈을 사용합니다. 이 가이드에서는 디버깅을 위해 로깅을 구성하는 방법을 설명합니다.

## 빠른 시작 \{#quick-start\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config

# Enable debug logging
config.enable_debug()

# Now all operations will log details
ds = pd.read_csv("data.csv")
result = ds.filter(ds['age'] > 25).to_df()
```


## 로그 레벨 \{#levels\}

| Level | Value | 설명 |
|-------|-------|-------------|
| `DEBUG` | 10 | 디버깅을 위한 자세한 정보 |
| `INFO` | 20 | 일반 운영 정보 |
| `WARNING` | 30 | 경고 메시지 (기본값) |
| `ERROR` | 40 | 오류 메시지 |
| `CRITICAL` | 50 | 치명적인 장애 |

## 로그 레벨 설정 \{#setting-level\}

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


## 로그 형식 \{#format\}

### 간단 형식(기본값) \{#simple\}

```python
config.set_log_format("simple")
```

출력 결과:

```text
DEBUG - Executing SQL query
DEBUG - Cache miss for key abc123
```


### 상세 형식 \{#verbose\}

```python
config.set_log_format("verbose")
```

출력:

```text
2024-01-15 10:30:45.123 DEBUG datastore.core - Executing SQL query
2024-01-15 10:30:45.456 DEBUG datastore.cache - Cache miss for key abc123
```

***


## 로그에 기록되는 내용 \{#what-logged\}

### DEBUG 레벨 \{#debug-logged\}

* 생성된 SQL 쿼리
* 실행 엔진 선택
* 캐시 연산(히트/미스)
* 작업 타이밍
* 데이터 소스 정보

```text
DEBUG - Creating DataStore from file 'data.csv'
DEBUG - SQL: SELECT * FROM file('data.csv', 'CSVWithNames') WHERE age > 25
DEBUG - Using engine: chdb
DEBUG - Execution time: 0.089s
DEBUG - Cache: Storing result (key: abc123)
```


### INFO 레벨 \{#info-logged\}

* 주요 작업 완료
* 구성 변경
* 데이터 소스 연결

```text
INFO - Loaded 1,000,000 rows from data.csv
INFO - Execution engine set to: chdb
INFO - Connected to MySQL: localhost:3306/mydb
```


### WARNING 레벨 \{#warning-logged\}

* 사용 중단(deprecated)된 기능 사용
* 성능 경고
* 심각하지 않은 문제

```text
WARNING - Large result set (>1M rows) may cause memory issues
WARNING - Cache TTL exceeded, re-executing query
WARNING - Column 'date' has mixed types, using string
```


### ERROR 레벨 \{#error-logged\}

* 쿼리 실행 실패
* 연결 오류
* 데이터 변환 오류

```text
ERROR - Failed to execute SQL: syntax error near 'FORM'
ERROR - Connection to MySQL failed: timeout
ERROR - Cannot convert column 'price' to float
```

***


## 사용자 정의 로깅 구성 \{#custom\}

### Python 로깅 사용하기 \{#python-logging\}

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


### 로그를 파일에 기록 \{#log-file\}

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


### 로그 비활성화 \{#suppress\}

```python
import logging

# Suppress all DataStore logs
logging.getLogger('chdb.datastore').setLevel(logging.CRITICAL)

# Or using config
config.set_log_level(logging.CRITICAL)
```

***


## 디버깅 시나리오 \{#scenarios\}

### SQL 생성 디버깅 \{#debug-sql\}

```python
config.enable_debug()

ds = pd.read_csv("data.csv")
result = ds.filter(ds['age'] > 25).groupby('city').sum()
```

로그 출력:

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


### 엔진 선택 과정 디버깅 \{#debug-engine\}

```python
config.enable_debug()

result = ds.filter(ds['x'] > 10).apply(custom_func)
```

로그 출력 결과:

```text
DEBUG - filter: selecting engine (eligible: chdb, pandas)
DEBUG - filter: using chdb (SQL-compatible)
DEBUG - apply: selecting engine (eligible: pandas)
DEBUG - apply: using pandas (custom function)
```


### 캐시 작업 디버깅 \{#debug-cache\}

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


### 성능 문제 진단 \{#debug-performance\}

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

로그 출력:

```text
DEBUG - filter: 0.002ms
DEBUG - groupby: 0.001ms
DEBUG - agg: 0.003ms
DEBUG - SQL generation: 0.012ms
DEBUG - SQL execution: 89.456ms  <- Main time spent here
DEBUG - Result conversion: 2.345ms
```

***


## 운영 환경 구성 \{#production\}

### 권장 설정 \{#recommended\}

```python
import logging
from chdb.datastore.config import config

# Production: minimal logging
config.set_log_level(logging.WARNING)
config.set_log_format("simple")
config.set_profiling_enabled(False)
```


### 로그 로테이션 \{#rotation\}

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


## 환경 변수 \{#env-vars\}

또한 환경 변수를 사용해 로깅을 구성할 수 있습니다.

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


## 요약 \{#summary\}

| 작업 | 명령 |
|------|---------|
| 디버그 활성화 | `config.enable_debug()` |
| 레벨 설정 | `config.set_log_level(logging.DEBUG)` |
| 형식 설정 | `config.set_log_format("verbose")` |
| 파일로 로깅 | Python logging 핸들러 사용 |
| 로그 출력 억제 | `config.set_log_level(logging.CRITICAL)` |