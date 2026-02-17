---
title: 'DataStore - pandas 호환 API'
sidebar_label: '개요'
slug: /chdb/datastore
description: 'DataStore는 고성능 데이터 분석을 위해 SQL 최적화를 제공하는 pandas 호환 API를 제공합니다'
keywords: ['chdb', 'datastore', 'pandas', 'dataframe', 'sql', 'lazy evaluation']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import data_store from '@site/static/images/chdb/datastore_architecture.png'


# DataStore: SQL 최적화가 적용된 Pandas 호환 API \{#datastore-pandas-compatible-api-with-sql-optimization\}

DataStore는 익숙한 pandas DataFrame 인터페이스에 SQL 쿼리 최적화 기능을 결합한 chDB의 pandas 호환 API로, pandas 스타일 코드로 작성하면서도 ClickHouse급 성능을 제공합니다.

## 주요 기능 \{#key-features\}

- **Pandas 호환성**: 209개의 pandas DataFrame 메서드, 56개의 `.str` 메서드, 42개 이상의 `.dt` 메서드
- **SQL 최적화**: 연산이 자동으로 최적화된 SQL 쿼리로 컴파일됩니다
- **지연 평가(Lazy Evaluation)**: 결과가 필요할 때까지 연산이 지연됩니다
- **630개 이상 API 메서드**: 데이터 조작을 위한 포괄적인 API를 제공합니다
- **ClickHouse 확장 기능**: pandas에는 없는 추가 접근자(`.arr`, `.json`, `.url`, `.ip`, `.geo`)를 제공합니다

## 아키텍처 \{#architecture\}

<Image size="md" img={data_store} alt="DataStore 아키텍처" />

DataStore는 **지연 평가(lazy evaluation)** 와 **이중 엔진 실행(dual-engine execution)** 을 사용합니다.

1. **지연 연산 체인(Lazy Operation Chain)**: 연산을 즉시 실행하지 않고 기록해 둡니다
2. **스마트 엔진 선택(Smart Engine Selection)**: `QueryPlanner`가 각 세그먼트를 최적의 엔진으로 라우팅합니다(chDB는 SQL용, Pandas는 복잡한 연산용)
3. **중간 캐싱(Intermediate Caching)**: 빠른 반복 탐색을 위해 각 단계의 결과를 캐시합니다

자세한 내용은 [실행 모델](execution-model.md)을 참고하십시오.

## Pandas에서 한 줄로 마이그레이션하기 \{#migration\}

```python
# Before (pandas)
import pandas as pd
df = pd.read_csv("data.csv")
result = df[df['age'] > 25].groupby('city')['salary'].mean()

# After (DataStore) - just change the import!
from chdb import datastore as pd
df = pd.read_csv("data.csv")
result = df[df['age'] > 25].groupby('city')['salary'].mean()
```

기존 pandas 코드는 아무런 수정 없이 그대로 동작하지만, 이제 ClickHouse 엔진에서 실행됩니다.


## 성능 비교 \{#performance\}

DataStore는 특히 집계 및 복잡한 파이프라인에서 pandas보다 상당한 성능 향상을 제공합니다:

| Operation | Pandas | DataStore | Speedup |
|-----------|--------|-----------|---------|
| GroupBy count | 347ms | 17ms | **19.93x** |
| Complex pipeline | 2,047ms | 380ms | **5.39x** |
| Filter+Sort+Head | 1,537ms | 350ms | **4.40x** |
| GroupBy agg | 406ms | 141ms | **2.88x** |

*1,000만 행 기준 벤치마크입니다. 자세한 내용은 [벤치마크 스크립트](https://github.com/chdb-io/chdb/blob/main/refs/benchmark_datastore_vs_pandas.py) 및 [성능 가이드](../guides/pandas-performance.md)를 참조하십시오.*

## DataStore를 언제 사용해야 하는가 \{#when-to-use\}

**다음과 같은 경우 DataStore를 사용합니다.**

- 대규모 데이터셋(수백만 개의 행)을 다루는 경우
- 집계 및 groupby 작업을 수행하는 경우
- 파일, 데이터베이스 또는 Cloud 스토리지에서 데이터를 쿼리하는 경우
- 복잡한 데이터 파이프라인을 구축하는 경우
- 더 높은 성능의 pandas API가 필요한 경우

**다음과 같은 경우 raw SQL API를 사용합니다.**

- SQL을 직접 작성하는 방식을 선호하는 경우
- 쿼리 실행을 세밀하게 제어해야 하는 경우
- pandas API에서 제공하지 않는 ClickHouse 고유 기능을 사용하는 경우

## 기능 비교 \{#comparison\}

| 기능 | Pandas | Polars  | DuckDB | DataStore |
|---------|--------|---------|--------|-----------|
| Pandas API 호환성 | -      | 부분 호환 | 아니요 | **완전 호환** |
| 지연 평가(Lazy evaluation) | 아니요     | 예     | 예 | **예** |
| SQL 쿼리 지원 | 아니요     | 예     | 예 | **예** |
| ClickHouse 함수 | 아니요     | 아니요      | 아니요 | **예** |
| String/DateTime 접근자 | 예    | 예     | 아니요 | **예 + 추가 기능** |
| Array/JSON/URL/IP/Geo | 아니요     | 부분 지원 | 아니요 | **예** |
| 파일에 대한 직접 쿼리 | 아니요     | 예     | 예 | **예** |
| Cloud 스토리지 지원 | 아니요     | 제한적 | 예 | **예** |

## API 통계 \{#api-stats\}

| 범주 | 개수 | 지원 범위 |
|----------|-------|----------|
| DataFrame 메서드 | 209 | pandas의 100% |
| Series.str 접근자 | 56 | pandas의 100% |
| Series.dt 접근자 | 42+ | 100%+ (ClickHouse 추가 기능 포함) |
| Series.arr 접근자 | 37 | ClickHouse 전용 |
| Series.json 접근자 | 13 | ClickHouse 전용 |
| Series.url 접근자 | 15 | ClickHouse 전용 |
| Series.ip 접근자 | 9 | ClickHouse 전용 |
| Series.geo 접근자 | 14 | ClickHouse 전용 |
| **총 API 메서드 수** | **630+** | - |

## 문서 안내 \{#navigation\}

### 시작하기 \{#getting-started\}

- [빠른 시작](quickstart.md) - 설치 및 기본 사용법
- [Pandas에서 마이그레이션](../guides/migration-from-pandas.md) - 단계별 마이그레이션 가이드

### API reference \{#api-reference\}

- [Factory Methods](factory-methods.md) - 다양한 소스로부터 DataStore 생성
- [Query Building](query-building.md) - SQL 스타일 쿼리 구성 연산
- [Pandas Compatibility](pandas-compat.md) - pandas와 호환되는 209개 메서드
- [Accessors](accessors.md) - String, DateTime, Array, JSON, URL, IP, Geo 접근자
- [Aggregation](aggregation.md) - 집계 및 윈도우 함수
- [I/O Operations](io.md) - 데이터 입출력 작업

### 고급 주제 \{#advanced-topics\}

- [Execution Model](execution-model.md) - 지연 평가 및 캐싱
- [Class Reference](class-reference.md) - 전체 API 참조

### 구성 & 디버깅 \{#configuration-debugging\}

- [구성](../configuration/index.md) - 모든 구성 옵션
- [성능 모드](../configuration/performance-mode.md) - 최대 처리량을 제공하는 SQL-first 모드
- [디버깅](../debugging/index.md) - Explain, 프로파일링 및 로깅

### Pandas 사용자 가이드 \{#pandas-user-guides\}

- [Pandas Cookbook](../guides/pandas-cookbook.md) - 자주 사용하는 패턴
- [Key Differences](../guides/pandas-differences.md) - pandas와의 핵심 차이점
- [Performance Guide](../guides/pandas-performance.md) - 성능 최적화 팁
- [SQL for Pandas Users](../guides/pandas-to-sql.md) - pandas 연산 이면의 SQL 이해

## 간단한 예 \{#quick-example\}

```python
from chdb import datastore as pd

# Read data from various sources
ds = pd.read_csv("sales.csv")
# or: ds = pd.DataStore.uri("s3://bucket/sales.parquet")
# or: ds = pd.DataStore.from_mysql("mysql://user:pass@host/db/table")

# Familiar pandas operations - automatically optimized to SQL
result = (ds
    .filter(ds['amount'] > 1000)           # WHERE amount > 1000
    .groupby('region')                      # GROUP BY region
    .agg({'amount': ['sum', 'mean']})       # SUM(amount), AVG(amount)
    .sort_values('sum', ascending=False)    # ORDER BY sum DESC
    .head(10)                               # LIMIT 10
)

# View the generated SQL
print(result.to_sql())

# Execute and get results
df = result.to_df()  # Returns pandas DataFrame
```


## 다음 단계 \{#next-steps\}

- **DataStore가 처음이라면** [빠른 시작 가이드](quickstart.md)부터 시작하십시오.
- **pandas에서 이전하려는 경우** [마이그레이션 가이드](../guides/migration-from-pandas.md)를 읽으십시오.
- **더 자세히 알고 싶다면** [API 참조 문서](class-reference.md)를 살펴보십시오.