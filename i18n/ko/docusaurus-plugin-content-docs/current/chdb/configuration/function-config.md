---
title: '함수 수준 설정'
sidebar_label: '함수 설정'
slug: /chdb/configuration/function-config
description: '함수 수준에서 실행 엔진과 Dtype 보정을 설정합니다'
keywords: ['chdb', '데이터 저장소', '함수', '설정', 'Dtype', '보정']
doc_type: 'reference'
---

# FUNCTION 수준 구성 \{#function-level-configuration\}

DataStore는 FUNCTION 수준에서 실행을 세밀하게 제어할 수 있도록 엔진 선택 및 Dtype 보정 기능을 제공합니다.

## FUNCTION 엔진 구성 \{#function-engine\}

특정 FUNCTION에 사용할 실행 엔진을 재정의합니다.

### Function 엔진 설정 \{#setting-engines\}

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


### 언제 사용해야 하는가 \{#when-to-use\}

**chdb를 강제로 사용해야 하는 경우:**

- ClickHouse에서 성능이 더 좋은 FUNCTION
- SQL 최적화의 이점을 받을 수 있는 FUNCTION
- 대규모 문자열/날짜·시간 연산

**pandas를 강제로 사용해야 하는 경우:**

- pandas에 특화된 동작을 사용하는 FUNCTION
- pandas와의 완전한 호환성이 필요한 경우
- 사용자 정의 문자열 연산

### 예제 \{#function-example\}

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


## 중복되는 함수 \{#overlapping\}

159개 이상의 함수가 chdb 및 pandas 엔진 모두에서 사용 가능합니다.

| Category | Functions |
|----------|-----------|
| **String** | `length`, `upper`, `lower`, `trim`, `ltrim`, `rtrim`, `concat`, `substring`, `replace`, `reverse`, `contains`, `startswith`, `endswith` |
| **Math** | `abs`, `round`, `floor`, `ceil`, `exp`, `log`, `log10`, `sqrt`, `pow`, `sin`, `cos`, `tan` |
| **DateTime** | `year`, `month`, `day`, `hour`, `minute`, `second`, `dayofweek`, `dayofyear`, `quarter` |
| **Aggregation** | `sum`, `avg`, `min`, `max`, `count`, `std`, `var`, `median` |

중복되는 함수의 경우 엔진은 다음 기준에 따라 선택됩니다.

1. 명시적인 함수 구성(설정된 경우)
2. 전역 execution_engine 설정
3. 컨텍스트 기반 자동 선택

---

## chdb 전용 함수 \{#chdb-only\}

일부 함수는 ClickHouse를 통해서만 사용할 수 있습니다.

| 범주 | 함수 |
|----------|-----------|
| **Array** | `arraySum`, `arrayAvg`, `arraySort`, `arrayDistinct`, `groupArray`, `arrayElement` |
| **JSON** | `JSONExtractString`, `JSONExtractInt`, `JSONExtractFloat`, `JSONHas` |
| **URL** | `domain`, `path`, `protocol`, `extractURLParameter` |
| **IP** | `IPv4StringToNum`, `IPv4NumToString`, `isIPv4String` |
| **Geo** | `greatCircleDistance`, `geoDistance`, `geoToH3` |
| **Hash** | `cityHash64`, `xxHash64`, `sipHash64`, `MD5`, `SHA256` |
| **Conditional** | `sumIf`, `countIf`, `avgIf`, `minIf`, `maxIf` |

이러한 함수는 설정과 관계없이 자동으로 chdb 엔진을 사용합니다.

---

## pandas 전용 함수 \{#pandas-only\}

일부 함수는 pandas를 통해서만 사용할 수 있습니다:

| Category | Functions |
|----------|-----------|
| **Apply** | 사용자 정의 lambda 함수, 사용자 정의 함수 |
| **Complex Pivot** | 사용자 정의 집계를 사용하는 피벗 테이블 |
| **Stack/Unstack** | 복잡한 재구조화 작업 |
| **Interpolate** | 시계열 보간 방법 |

이러한 함수는 설정과 관계없이 자동으로 pandas 엔진을 사용합니다.

---

## Dtype Correction \{#dtype-correction\}

DataStore에서 엔진 간 데이터 유형을 교정하는 방식을 설정합니다.

### 보정 수준 \{#correction-levels\}

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


### 교정 수준 상세 \{#level-details\}

| Level | 설명 | 교정 대상 타입 |
|-------|-------------|-----------------|
| `NONE` | 자동 교정 없음 | 없음 |
| `CRITICAL` | 필수 교정 | NULL 처리, boolean 변환 |
| `HIGH` (default) | 일반적인 교정 | 정수/실수 정밀도, datetime, 문자열 인코딩 |
| `MEDIUM` | 추가 교정 | Decimal 정밀도, 타임존 처리 |
| `ALL` | 최대 수준 교정 | 모든 타입 불일치 |

### 타입 보정이 필요한 경우 \{#when-correction\}

다음과 같은 경우 타입 차이가 발생할 수 있습니다.

1. **ClickHouse → pandas**: 서로 다른 정수 크기(Int64 vs int64)
2. **pandas → ClickHouse**: Python 객체와 SQL 타입 간 차이
3. **NULL 처리**: pandas NA와 ClickHouse NULL의 차이
4. **Boolean**: 불리언(Boolean) 표현 방식의 차이
5. **DateTime**: 시간대(timezone) 차이

### 예제 \{#correction-example\}

```python
from chdb.datastore.dtype_correction.config import CorrectionLevel
from chdb.datastore.config import config

# Strict mode - expect exact type matches
config.set_correction_level(CorrectionLevel.NONE)

# Relaxed mode - auto-fix type issues
config.set_correction_level(CorrectionLevel.ALL)
```

***


## FUNCTION 설정 API \{#api\}

### function_config 객체 \{#function-config-object\}

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


### 호출 단위 재정의 \{#per-call\}

일부 메서드는 호출 단위로 엔진을 재정의할 수 있습니다.

```python
# Using engine parameter (where supported)
ds['result'] = ds['col'].str.upper(engine='pandas')
```

***


## 모범 사례 \{#best-practices\}

### 1. 기본값으로 시작합니다 \{#start-with-defaults\}

```python
# Use auto mode, let DataStore decide
config.use_auto()
```


### 2. 특정 워크로드용 구성 \{#configure-for-specific-workloads\}

```python
# For ClickHouse-optimized string processing
function_config.use_chdb('length', 'substring', 'concat')

# For pandas-compatible string behavior
function_config.use_pandas('upper', 'lower')
```


### 3. 알맞은 보정 수준을 사용하십시오 \{#use-appropriate-correction-level\}

```python
# Development: more permissive
config.set_correction_level(CorrectionLevel.ALL)

# Production: stricter
config.set_correction_level(CorrectionLevel.HIGH)
```


### 4. 두 엔진을 모두 테스트하기 \{#test-both-engines\}

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
