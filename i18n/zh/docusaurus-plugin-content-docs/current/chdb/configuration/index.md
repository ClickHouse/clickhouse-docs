---
title: 'DataStore 配置'
sidebar_label: '概览'
slug: /chdb/configuration
description: '配置 DataStore 的执行引擎、日志、缓存和性能分析'
keywords: ['chdb', 'DataStore', '配置', '配置项', '设置']
doc_type: 'reference'
---

# DataStore 配置 \{#datastore-configuration\}

DataStore 提供了全面的配置选项，用于选择执行引擎、配置日志、缓存、性能分析以及 dtype 类型纠正。

## 快速参考 \{#quick-reference\}

```python
from chdb.datastore.config import config

# Quick setup presets
config.enable_debug()       # Enable verbose logging
config.use_chdb()           # Force ClickHouse engine
config.use_pandas()         # Force pandas engine
config.use_auto()           # Auto-select engine (default)
config.enable_profiling()   # Enable performance profiling
```


## 所有配置选项 \{#all-options\}

| 类别 | 选项 | 取值 | 默认值 | 描述 |
|----------|--------|--------|---------|-------------|
| **Logging** | `log_level` | DEBUG/INFO/WARNING/ERROR | WARNING | 日志详细程度 |
| | `log_format` | "simple", "verbose" | "simple" | 日志消息格式 |
| **Cache** | `cache_enabled` | True/False | True | 是否启用结果缓存 |
| | `cache_ttl` | float (seconds) | 0.0 | 缓存生存时间 (TTL) |
| **Engine** | `execution_engine` | "auto", "chdb", "pandas" | "auto" | 执行引擎 |
| | `cross_datastore_engine` | "auto", "chdb", "pandas" | "auto" | 跨 DataStore 的操作 |
| **Profiling** | `profiling_enabled` | True/False | False | 是否启用性能分析 |
| **Dtype** | `correction_level` | NONE/CRITICAL/HIGH/MEDIUM/ALL | HIGH | Dtype 校正级别 |

---

## 配置方式 \{#methods\}

### 日志配置 \{#logging\}

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

有关详细信息，请参阅[日志记录](logging.md)。


### 缓存配置 \{#cache\}

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


### 引擎配置 \{#engine\}

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

有关执行引擎的详细信息，请参阅 [Execution Engine](execution-engine.md)。


### 性能分析配置 \{#profiling\}

```python
# Enable profiling
config.enable_profiling()
config.set_profiling_enabled(True)

# Disable profiling
config.set_profiling_enabled(False)

# Check if profiling is enabled
print(config.profiling_enabled)
```

有关详细信息，请参阅[Profiling](../debugging/profiling.md)。


### Dtype 更正 \{#dtype\}

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


## 使用 config 对象 \{#config-object\}

`config` 对象是一个单例对象，用于管理所有配置：

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


## 在代码中配置 \{#in-code\}

### 脚本级配置 \{#per-script\}

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


### 上下文管理器（未来功能） \{#context-manager\}

```python
# Planned feature: temporary configuration
with config.override(execution_engine='pandas'):
    result = ds.process()
# Original settings restored
```

***


## 常见配置场景 \{#scenarios\}

### 开发/调试环境 \{#dev-config\}

```python
from chdb.datastore.config import config

config.enable_debug()        # Verbose logging
config.enable_profiling()    # Performance tracking
config.set_cache_enabled(False)  # Disable caching for fresh results
```


### 生产环境 \{#prod-config\}

```python
from chdb.datastore.config import config
import logging

config.set_log_level(logging.WARNING)  # Minimal logging
config.set_execution_engine('auto')    # Optimal engine selection
config.set_cache_enabled(True)         # Enable caching
config.set_profiling_enabled(False)    # Disable profiling overhead
```


### 性能测试 \{#perf-config\}

```python
from chdb.datastore.config import config

config.use_chdb()            # Force ClickHouse for benchmarks
config.enable_profiling()    # Track performance
config.set_cache_enabled(False)  # Disable cache for accurate timing
```


### Pandas 兼容性测试 \{#compat-config\}

```python
from chdb.datastore.config import config

config.use_pandas()          # Force pandas engine
config.enable_debug()        # See what operations are used
```

***


## 相关文档 \{#related\}

- [Execution Engine](execution-engine.md) - 引擎选择说明
- [Function Config](function-config.md) - 单个 FUNCTION 的引擎配置
- [Logging](../debugging/logging.md) - 日志配置
- [Profiling](../debugging/profiling.md) - 性能分析配置