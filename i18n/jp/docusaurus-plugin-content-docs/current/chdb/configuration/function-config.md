---
title: '関数レベルの設定'
sidebar_label: '関数設定'
slug: /chdb/configuration/function-config
description: '関数レベルで実行エンジンとDtype補正を設定する'
keywords: ['chdb', 'datastore', '関数', '設定', 'Dtype', '補正']
doc_type: 'reference'
---

# 関数レベルの設定 \{#function-level-configuration\}

DataStore では、エンジンの選択や Dtype の補正など、関数レベルでの実行をきめ細かく制御できます。

## 関数エンジンの設定 \{#function-engine\}

特定の関数ごとに使用する実行エンジンを上書きします。

### Function エンジンの設定 \{#setting-engines\}

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


### 使用するタイミング \{#when-to-use\}

**chdb の使用を強制するケース:**

- ClickHouse がより高いパフォーマンスを発揮する関数
- SQL 最適化の恩恵を受けられる関数
- 大規模な文字列／日付時刻の処理

**pandas の使用を強制するケース:**

- pandas 固有の挙動を持つ関数
- pandas との厳密な互換性が必要な場合
- カスタム文字列処理

### 例 \{#function-example\}

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


## 共通の関数 \{#overlapping\}

159 個以上の関数が chdb エンジンと pandas エンジンの両方で利用できます:

| カテゴリ | 関数 |
|----------|-----------|
| **String** | `length`, `upper`, `lower`, `trim`, `ltrim`, `rtrim`, `concat`, `substring`, `replace`, `reverse`, `contains`, `startswith`, `endswith` |
| **Math** | `abs`, `round`, `floor`, `ceil`, `exp`, `log`, `log10`, `sqrt`, `pow`, `sin`, `cos`, `tan` |
| **DateTime** | `year`, `month`, `day`, `hour`, `minute`, `second`, `dayofweek`, `dayofyear`, `quarter` |
| **Aggregation** | `sum`, `avg`, `min`, `max`, `count`, `std`, `var`, `median` |

両方のエンジンで定義されている関数については、次の優先順位でエンジンが選択されます:

1. 明示的な関数設定（指定されている場合）
2. グローバルな `execution_engine` 設定
3. コンテキストに基づく自動選択

---

## chdb 専用関数 \{#chdb-only\}

一部の関数は ClickHouse 経由でのみ利用できます:

| カテゴリ | 関数 |
|----------|-----------|
| **Array** | `arraySum`, `arrayAvg`, `arraySort`, `arrayDistinct`, `groupArray`, `arrayElement` |
| **JSON** | `JSONExtractString`, `JSONExtractInt`, `JSONExtractFloat`, `JSONHas` |
| **URL** | `domain`, `path`, `protocol`, `extractURLParameter` |
| **IP** | `IPv4StringToNum`, `IPv4NumToString`, `isIPv4String` |
| **Geo** | `greatCircleDistance`, `geoDistance`, `geoToH3` |
| **Hash** | `cityHash64`, `xxHash64`, `sipHash64`, `MD5`, `SHA256` |
| **Conditional** | `sumIf`, `countIf`, `avgIf`, `minIf`, `maxIf` |

これらの関数は、設定内容に関係なく自動的に chdb エンジンを使用します。

---

## pandas 専用関数 \{#pandas-only\}

一部の関数は pandas を通じてのみ利用できます。

| Category | Functions |
|----------|-----------|
| **Apply** | カスタム lambda 関数、ユーザー定義関数 |
| **Complex Pivot** | カスタム集約を行うピボットテーブル |
| **Stack/Unstack** | 複雑な再構成（reshape）処理 |
| **Interpolate** | 時系列の補間メソッド |

これらの関数は、設定に関わらず自動的に pandas エンジンを使用します。

---

## Dtype Correction \{#dtype-correction\}

DataStore におけるエンジン間のデータ型の補正方法を設定します。

### 補正レベル \{#correction-levels\}

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


### 補正レベルの詳細 \{#level-details\}

| Level | 説明 | 補正対象の型 |
|-------|------|-----------------|
| `NONE` | 自動補正なし | なし |
| `CRITICAL` | 重要な補正 | NULL の扱い、ブール値変換 |
| `HIGH` (default) | 一般的な補正 | 整数/浮動小数点の精度、日時型、文字列エンコーディング |
| `MEDIUM` | 追加の補正 | DECIMAL 型の精度、タイムゾーンの扱い |
| `ALL` | 最大限の補正 | すべての型の差異 |

### 型の補正が必要になる場合 \{#when-correction\}

型の違いは次のような場合に発生します:

1. **ClickHouse → pandas**: 整数サイズの違い (Int64 と int64 の違い)
2. **pandas → ClickHouse**: Python オブジェクトから SQL 型への変換時
3. **NULL の扱い**: pandas の NA と ClickHouse の NULL の違い
4. **Boolean**: 真偽値表現の違い
5. **DateTime**: タイムゾーンの違い

### 使用例 \{#correction-example\}

```python
from chdb.datastore.dtype_correction.config import CorrectionLevel
from chdb.datastore.config import config

# Strict mode - expect exact type matches
config.set_correction_level(CorrectionLevel.NONE)

# Relaxed mode - auto-fix type issues
config.set_correction_level(CorrectionLevel.ALL)
```

***


## 関数設定 API \{#api\}

### function_config オブジェクト \{#function-config-object\}

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


### 呼び出し単位でのオーバーライド \{#per-call\}

一部のメソッドでは、呼び出しごとにエンジン設定をオーバーライドできます。

```python
# Using engine parameter (where supported)
ds['result'] = ds['col'].str.upper(engine='pandas')
```

***


## ベストプラクティス \{#best-practices\}

### 1. まずはデフォルトから始める \{#start-with-defaults\}

```python
# Use auto mode, let DataStore decide
config.use_auto()
```


### 2. 特定のワークロード向けの設定 \{#configure-for-specific-workloads\}

```python
# For ClickHouse-optimized string processing
function_config.use_chdb('length', 'substring', 'concat')

# For pandas-compatible string behavior
function_config.use_pandas('upper', 'lower')
```


### 3. 適切な補正レベルを設定する \{#use-appropriate-correction-level\}

```python
# Development: more permissive
config.set_correction_level(CorrectionLevel.ALL)

# Production: stricter
config.set_correction_level(CorrectionLevel.HIGH)
```


### 4. 両方のエンジンをテストする \{#test-both-engines\}

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
