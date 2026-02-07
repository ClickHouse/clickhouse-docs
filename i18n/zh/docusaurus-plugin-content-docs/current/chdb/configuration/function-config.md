---
title: '函数级别配置'
sidebar_label: '函数配置'
slug: /chdb/configuration/function-config
description: '在函数级别配置执行引擎和 Dtype 校正'
keywords: ['chdb', '数据存储', 'function', '配置', 'Dtype', '校正']
doc_type: 'reference'
---

# 函数级别配置 \{#function-level-configuration\}

DataStore 允许在函数级别对执行进行细粒度控制，包括引擎选择和 Dtype 校正。

## FUNCTION 引擎配置 \{#function-engine\}

为特定 FUNCTION 覆盖其执行引擎。

### 设置函数引擎 \{#setting-engines\}

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


### 何时使用 \{#when-to-use\}

**强制使用 chdb 的场景：**

- 在 ClickHouse 中性能更佳的函数
- 需要利用 SQL 优化能力的函数
- 大规模字符串/日期时间操作

**强制使用 pandas 的场景：**

- 具有 pandas 特有行为的函数
- 当需要与 pandas 保持完全兼容时
- 自定义字符串操作

### 示例 \{#function-example\}

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


## 重叠函数 \{#overlapping\}

在 chdb 和 pandas 两种引擎中共有 159+ 个可用函数：

| Category | Functions |
|----------|-----------|
| **String** | `length`, `upper`, `lower`, `trim`, `ltrim`, `rtrim`, `concat`, `substring`, `replace`, `reverse`, `contains`, `startswith`, `endswith` |
| **Math** | `abs`, `round`, `floor`, `ceil`, `exp`, `log`, `log10`, `sqrt`, `pow`, `sin`, `cos`, `tan` |
| **DateTime** | `year`, `month`, `day`, `hour`, `minute`, `second`, `dayofweek`, `dayofyear`, `quarter` |
| **Aggregation** | `sum`, `avg`, `min`, `max`, `count`, `std`, `var`, `median` |

对于重叠函数，引擎的选择基于以下规则：

1. 显式函数配置（如果已设置）
2. 全局 `execution_engine` 设置
3. 基于上下文的自动选择

---

## 仅限 chdb 的函数 \{#chdb-only\}

某些函数只能通过 ClickHouse 使用：

| 类别 | 函数 |
|----------|-----------|
| **数组** | `arraySum`, `arrayAvg`, `arraySort`, `arrayDistinct`, `groupArray`, `arrayElement` |
| **JSON** | `JSONExtractString`, `JSONExtractInt`, `JSONExtractFloat`, `JSONHas` |
| **URL** | `domain`, `path`, `protocol`, `extractURLParameter` |
| **IP** | `IPv4StringToNum`, `IPv4NumToString`, `isIPv4String` |
| **地理** | `greatCircleDistance`, `geoDistance`, `geoToH3` |
| **哈希** | `cityHash64`, `xxHash64`, `sipHash64`, `MD5`, `SHA256` |
| **条件** | `sumIf`, `countIf`, `avgIf`, `minIf`, `maxIf` |

这些函数无论如何配置，都会自动使用 chdb 引擎来执行。

## 仅限 pandas 的函数 \{#pandas-only\}

某些函数只能通过 pandas 使用：

| 类别 | 函数 |
|----------|-----------|
| **Apply** | 自定义 lambda 函数、用户自定义函数 |
| **Complex Pivot** | 带自定义聚合的透视表 |
| **Stack/Unstack** | 复杂的重排/重塑操作 |
| **Interpolate** | 时间序列插值方法 |

这些函数会自动使用 pandas 引擎，与配置无关。

---

## Dtype 校正 \{#dtype-correction\}

配置 DataStore 如何在不同引擎之间修正数据类型。

### 校正级别 \{#correction-levels\}

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


### 更正级别详情 \{#level-details\}

| Level | 描述 | 更正的类型 |
|-------|-------------|-----------------|
| `NONE` | 不进行自动更正 | 无 |
| `CRITICAL` | 关键更正 | NULL 处理、布尔值转换 |
| `HIGH` (default) | 常见更正 | 整数/浮点数精度、日期时间（datetime）、字符串编码 |
| `MEDIUM` | 更多更正 | Decimal 精度、时区处理 |
| `ALL` | 最大程度的更正 | 所有类型差异 |

### 何时需要进行类型校正 \{#when-correction\}

在以下情况下可能会出现类型差异：

1. **ClickHouse → pandas**：整数位宽不同（Int64 vs int64）
2. **pandas → ClickHouse**：从 Python 对象转换为 SQL 类型
3. **NULL 处理**：pandas 的 NA 与 ClickHouse 的 NULL
4. **布尔类型**：布尔值表示方式不同
5. **DateTime**：时区差异

### 示例 \{#correction-example\}

```python
from chdb.datastore.dtype_correction.config import CorrectionLevel
from chdb.datastore.config import config

# Strict mode - expect exact type matches
config.set_correction_level(CorrectionLevel.NONE)

# Relaxed mode - auto-fix type issues
config.set_correction_level(CorrectionLevel.ALL)
```

***


## 函数配置 API \{#api\}

### function_config 对象 \{#function-config-object\}

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


### 按调用级别覆盖 \{#per-call\}

某些方法支持在每次调用时覆盖引擎：

```python
# Using engine parameter (where supported)
ds['result'] = ds['col'].str.upper(engine='pandas')
```

***


## 最佳实践 \{#best-practices\}

### 1. 从默认设置开始 \{#start-with-defaults\}

```python
# Use auto mode, let DataStore decide
config.use_auto()
```


### 2. 为特定工作负载进行配置 \{#configure-for-specific-workloads\}

```python
# For ClickHouse-optimized string processing
function_config.use_chdb('length', 'substring', 'concat')

# For pandas-compatible string behavior
function_config.use_pandas('upper', 'lower')
```


### 3. 使用合适的校正级别 \{#use-appropriate-correction-level\}

```python
# Development: more permissive
config.set_correction_level(CorrectionLevel.ALL)

# Production: stricter
config.set_correction_level(CorrectionLevel.HIGH)
```


### 4. 测试这两种引擎 \{#test-both-engines\}

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
