---
title: 'DataStore の設定'
sidebar_label: '概要'
slug: /chdb/configuration
description: 'DataStore の実行エンジン、ログ、キャッシュ、およびプロファイリングを設定する'
keywords: ['chdb', 'datastore', 'configuration', 'config', 'settings']
doc_type: 'reference'
---

# DataStore の設定 \{#datastore-configuration\}

DataStore は、実行エンジンの選択、互換モード、ロギング、キャッシュ、プロファイリング、dtype の補正などに関する包括的な設定オプションを提供します。

## クイックリファレンス \{#quick-reference\}

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


## すべての設定オプション \{#all-options\}

| カテゴリ | オプション | 値 | デフォルト | 説明 |
|----------|--------|--------|---------|-------------|
| **Logging** | `log_level` | DEBUG/INFO/WARNING/ERROR | WARNING | ログの詳細レベル |
| | `log_format` | "simple", "verbose" | "simple" | ログメッセージの形式 |
| **Cache** | `cache_enabled` | True/False | True | 結果キャッシュを有効にする |
| | `cache_ttl` | float (seconds) | 0.0 | キャッシュの有効期限 (TTL) |
| **Engine** | `execution_engine` | "auto", "chdb", "pandas" | "auto" | 実行エンジン |
| | `cross_datastore_engine` | "auto", "chdb", "pandas" | "auto" | DataStore 間の処理 |
| **Compat** | `compat_mode` | "pandas", "performance" | "pandas" | Pandas 互換性優先か、SQL ファーストでのスループット優先か |
| **Profiling** | `profiling_enabled` | True/False | False | プロファイリングを有効にする |
| **Dtype** | `correction_level` | NONE/CRITICAL/HIGH/MEDIUM/ALL | HIGH | データ型 (dtype) の補正レベル |

---

## 構成方法 \{#methods\}

### ロギング設定 \{#logging\}

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

詳細は [Logging](logging.md) を参照してください。


### キャッシュの設定 \{#cache\}

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


### エンジン設定 \{#engine\}

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

詳細は [Execution Engine](execution-engine.md) を参照してください。


### 互換性モード \{#compat-mode\}

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

詳細は [Performance Mode](performance-mode.md) を参照してください。


### プロファイリング設定 \{#profiling\}

```python
# Enable profiling
config.enable_profiling()
config.set_profiling_enabled(True)

# Disable profiling
config.set_profiling_enabled(False)

# Check if profiling is enabled
print(config.profiling_enabled)
```

詳細については [Profiling](../debugging/profiling.md) を参照してください。


### Dtype の修正 \{#dtype\}

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


## config オブジェクトを使用する \{#config-object\}

`config` オブジェクトは、すべての設定を一元管理するシングルトンオブジェクトです。

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


## コードによる設定 \{#in-code\}

### スクリプトごとの設定 \{#per-script\}

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


### コンテキストマネージャー（将来対応予定） \{#context-manager\}

```python
# Planned feature: temporary configuration
with config.override(execution_engine='pandas'):
    result = ds.process()
# Original settings restored
```

***


## よくある構成パターン \{#scenarios\}

### 開発／デバッグ \{#dev-config\}

```python
from chdb.datastore.config import config

config.enable_debug()        # Verbose logging
config.enable_profiling()    # Performance tracking
config.set_cache_enabled(False)  # Disable caching for fresh results
```


### 本番運用 \{#prod-config\}

```python
from chdb.datastore.config import config
import logging

config.set_log_level(logging.WARNING)  # Minimal logging
config.set_execution_engine('auto')    # Optimal engine selection
config.set_cache_enabled(True)         # Enable caching
config.set_profiling_enabled(False)    # Disable profiling overhead
```


### 最大スループット \{#max-throughput-config\}

```python
from chdb.datastore.config import config

config.use_performance_mode()    # SQL-first, no pandas overhead
config.set_cache_enabled(False)  # Disable cache for streaming
```


### パフォーマンステスト \{#perf-config\}

```python
from chdb.datastore.config import config

config.use_chdb()            # Force ClickHouse for benchmarks
config.enable_profiling()    # Track performance
config.set_cache_enabled(False)  # Disable cache for accurate timing
```


### Pandas 互換性テスト \{#compat-config\}

```python
from chdb.datastore.config import config

config.use_pandas()          # Force pandas engine
config.enable_debug()        # See what operations are used
```

***


## 関連ドキュメント \{#related\}

- [Execution Engine](execution-engine.md) - エンジン選択の詳細
- [Performance Mode](performance-mode.md) - 最大スループット向けの SQL ファーストモード
- [Function Config](function-config.md) - 関数ごとのエンジン設定
- [Logging](../debugging/logging.md) - ロギング設定
- [Profiling](../debugging/profiling.md) - パフォーマンスプロファイリング設定