---
title: 'DataStore Configuration'
sidebar_label: 'Overview'
slug: /chdb/configuration
description: 'Configure DataStore execution engine, logging, caching, and profiling'
keywords: ['chdb', 'datastore', 'configuration', 'config', 'settings']
doc_type: 'reference'
---

# DataStore Configuration

DataStore provides comprehensive configuration options for execution engine selection, logging, caching, profiling, and dtype correction.

## Quick Reference {#quick-reference}

```python
from chdb.datastore.config import config

# Quick setup presets
config.enable_debug()       # Enable verbose logging
config.use_chdb()           # Force ClickHouse engine
config.use_pandas()         # Force pandas engine
config.use_auto()           # Auto-select engine (default)
config.enable_profiling()   # Enable performance profiling
```

## All Configuration Options {#all-options}

| Category | Option | Values | Default | Description |
|----------|--------|--------|---------|-------------|
| **Logging** | `log_level` | DEBUG/INFO/WARNING/ERROR | WARNING | Log verbosity |
| | `log_format` | "simple", "verbose" | "simple" | Log message format |
| **Cache** | `cache_enabled` | True/False | True | Enable result caching |
| | `cache_ttl` | float (seconds) | 0.0 | Cache time-to-live |
| **Engine** | `execution_engine` | "auto", "chdb", "pandas" | "auto" | Execution engine |
| | `cross_datastore_engine` | "auto", "chdb", "pandas" | "auto" | Cross-DataStore operations |
| **Profiling** | `profiling_enabled` | True/False | False | Enable profiling |
| **Dtype** | `correction_level` | NONE/CRITICAL/HIGH/MEDIUM/ALL | HIGH | Dtype correction level |

---

## Configuration Methods {#methods}

### Logging Configuration {#logging}

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

See [Logging](logging.md) for details.

### Cache Configuration {#cache}

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

### Engine Configuration {#engine}

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

See [Execution Engine](execution-engine.md) for details.

### Profiling Configuration {#profiling}

```python
# Enable profiling
config.enable_profiling()
config.set_profiling_enabled(True)

# Disable profiling
config.set_profiling_enabled(False)

# Check if profiling is enabled
print(config.profiling_enabled)
```

See [Profiling](../debugging/profiling.md) for details.

### Dtype Correction {#dtype}

```python
from chdb.datastore.dtype_correction.config import CorrectionLevel

# Set correction level
config.set_correction_level(CorrectionLevel.NONE)      # No correction
config.set_correction_level(CorrectionLevel.CRITICAL)  # Critical types only
config.set_correction_level(CorrectionLevel.HIGH)      # Default
config.set_correction_level(CorrectionLevel.MEDIUM)    # More corrections
config.set_correction_level(CorrectionLevel.ALL)       # All corrections
```

---

## Using config Object {#config-object}

The `config` object is a singleton that manages all settings:

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

---

## Configuration in Code {#in-code}

### Per-Script Configuration {#per-script}

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

### Context Manager (Future) {#context-manager}

```python
# Planned feature: temporary configuration
with config.override(execution_engine='pandas'):
    result = ds.process()
# Original settings restored
```

---

## Common Configuration Scenarios {#scenarios}

### Development/Debugging {#dev-config}

```python
from chdb.datastore.config import config

config.enable_debug()        # Verbose logging
config.enable_profiling()    # Performance tracking
config.set_cache_enabled(False)  # Disable caching for fresh results
```

### Production {#prod-config}

```python
from chdb.datastore.config import config
import logging

config.set_log_level(logging.WARNING)  # Minimal logging
config.set_execution_engine('auto')    # Optimal engine selection
config.set_cache_enabled(True)         # Enable caching
config.set_profiling_enabled(False)    # Disable profiling overhead
```

### Performance Testing {#perf-config}

```python
from chdb.datastore.config import config

config.use_chdb()            # Force ClickHouse for benchmarks
config.enable_profiling()    # Track performance
config.set_cache_enabled(False)  # Disable cache for accurate timing
```

### Pandas Compatibility Testing {#compat-config}

```python
from chdb.datastore.config import config

config.use_pandas()          # Force pandas engine
config.enable_debug()        # See what operations are used
```

---

## Related Documentation {#related}

- [Execution Engine](execution-engine.md) - Engine selection details
- [Function Config](function-config.md) - Per-function engine configuration
- [Logging](../debugging/logging.md) - Logging configuration
- [Profiling](../debugging/profiling.md) - Performance profiling
