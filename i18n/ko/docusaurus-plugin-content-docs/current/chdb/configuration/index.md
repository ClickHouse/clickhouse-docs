---
title: 'DataStore 구성'
sidebar_label: '개요'
slug: /chdb/configuration
description: 'DataStore 실행 엔진, 로깅, 캐싱, 프로파일링 구성'
keywords: ['chdb', 'datastore', 'configuration', 'config', 'settings']
doc_type: 'reference'
---

# DataStore 구성 \{#datastore-configuration\}

DataStore는 실행 엔진 선택, 호환성 모드, 로깅, 캐싱, 프로파일링, 데이터 타입(dtype) 교정 등을 위한 포괄적인 구성 옵션을 제공합니다.

## 빠른 참고 \{#quick-reference\}

```python
from chdb.datastore.config import config

# Quick setup presets
config.enable_debug()           # Enable verbose logging
config.use_chdb()               # Force ClickHouse engine
config.use_pandas()             # Force pandas engine
config.use_auto()               # Auto-select engine (default)
config.use_performance_mode()   # SQL-first, max throughput
config.use_pandas_compat()      # Full pandas compatibility (default)
config.enable_profiling()       # Enable performance profiling
```


## 모든 설정 옵션 \{#all-options\}

| Category | Option | Values | Default | Description |
|----------|--------|--------|---------|-------------|
| **Logging** | `log_level` | DEBUG/INFO/WARNING/ERROR | WARNING | 로그 상세 수준 |
| | `log_format` | "simple", "verbose" | "simple" | 로그 메시지 형식 |
| **Cache** | `cache_enabled` | True/False | True | 결과 캐시 사용 |
| | `cache_ttl` | float (seconds) | 0.0 | 캐시 TTL(유효 기간) |
| **Engine** | `execution_engine` | "auto", "chdb", "pandas" | "auto" | 실행 엔진 |
| | `cross_datastore_engine` | "auto", "chdb", "pandas" | "auto" | DataStore 간 연산 |
| **Compat** | `compat_mode` | "pandas", "performance" | "pandas" | Pandas 호환성 vs SQL 우선 처리량 |
| **Profiling** | `profiling_enabled` | True/False | False | 프로파일링 사용 |
| **Dtype** | `correction_level` | NONE/CRITICAL/HIGH/MEDIUM/ALL | HIGH | Dtype 보정 수준 |

---

## 구성 방법 \{#methods\}

### 로그 구성 \{#logging\}

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

자세한 내용은 [Logging](logging.md) 문서를 참조하십시오.


### 캐시 설정 \{#cache\}

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


### 엔진 설정 \{#engine\}

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

자세한 내용은 [Execution Engine](execution-engine.md)을 참조하십시오.


### 호환성 모드 \{#compat-mode\}

```python
# Performance mode: SQL-first, no pandas compatibility overhead
config.use_performance_mode()
# or: config.set_compat_mode('performance')

# Pandas compatibility mode (default)
config.use_pandas_compat()
# or: config.set_compat_mode('pandas')

# Check current mode
print(config.compat_mode)  # 'pandas' or 'performance'
```

자세한 내용은 [성능 모드](performance-mode.md)를 참조하십시오.


### 프로파일링 설정 \{#profiling\}

```python
# Enable profiling
config.enable_profiling()
config.set_profiling_enabled(True)

# Disable profiling
config.set_profiling_enabled(False)

# Check if profiling is enabled
print(config.profiling_enabled)
```

자세한 내용은 [Profiling](../debugging/profiling.md)을 참조하십시오.


### Dtype 보정 \{#dtype\}

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


## config 객체 사용 \{#config-object\}

`config` 객체는 모든 설정을 관리하는 싱글톤(singleton)입니다:

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


## 코드에서의 설정 \{#in-code\}

### 스크립트별 구성 \{#per-script\}

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


### 컨텍스트 매니저(추후 지원 예정) \{#context-manager\}

```python
# Planned feature: temporary configuration
with config.override(execution_engine='pandas'):
    result = ds.process()
# Original settings restored
```

***


## 공통 구성 시나리오 \{#scenarios\}

### 개발/디버깅 \{#dev-config\}

```python
from chdb.datastore.config import config

config.enable_debug()        # Verbose logging
config.enable_profiling()    # Performance tracking
config.set_cache_enabled(False)  # Disable caching for fresh results
```


### 운영 환경 \{#prod-config\}

```python
from chdb.datastore.config import config
import logging

config.set_log_level(logging.WARNING)  # Minimal logging
config.set_execution_engine('auto')    # Optimal engine selection
config.set_cache_enabled(True)         # Enable caching
config.set_profiling_enabled(False)    # Disable profiling overhead
```


### 최대 처리량 \{#max-throughput-config\}

```python
from chdb.datastore.config import config

config.use_performance_mode()    # SQL-first, no pandas overhead
config.set_cache_enabled(False)  # Disable cache for streaming
```


### 성능 테스트 \{#perf-config\}

```python
from chdb.datastore.config import config

config.use_chdb()            # Force ClickHouse for benchmarks
config.enable_profiling()    # Track performance
config.set_cache_enabled(False)  # Disable cache for accurate timing
```


### Pandas 호환성 테스트 \{#compat-config\}

```python
from chdb.datastore.config import config

config.use_pandas()          # Force pandas engine
config.enable_debug()        # See what operations are used
```

***


## 관련 문서 \{#related\}

- [Execution Engine](execution-engine.md) - 엔진 선택에 대한 상세 내용
- [Performance Mode](performance-mode.md) - 최대 처리량을 위한 SQL 우선 모드
- [Function Config](function-config.md) - FUNCTION별 엔진 구성
- [Logging](../debugging/logging.md) - 로깅 구성
- [Profiling](../debugging/profiling.md) - 성능 프로파일링