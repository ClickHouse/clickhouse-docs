---
title: 'chDB'
sidebar_label: '개요'
slug: /chdb
description: 'chDB는 ClickHouse 기반의 인프로세스 SQL OLAP 엔진입니다'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'in-process', 'in process']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import dfBench from '@site/static/images/chdb/df_bench.png';


# chDB \{#chdb\}

chDB는 [ClickHouse](https://github.com/clickhouse/clickhouse) v25.8.2.1을 기반으로 하는 빠른 인프로세스 SQL OLAP 엔진입니다.
별도의 ClickHouse 서버에 연결하지 않고도 프로그래밍 언어 환경에서 ClickHouse의 기능과 성능을 활용할 수 있습니다.

## 주요 기능 \{#key-features\}

- **인프로세스 SQL OLAP 엔진** - ClickHouse 기반으로 동작하며 ClickHouse 서버를 별도로 설치할 필요가 없습니다
- **다양한 데이터 포맷** - Parquet, CSV, JSON, Arrow, ORC 및 [70개 이상의 추가 포맷](/interfaces/formats)에 대한 입력 및 출력 지원을 제공합니다
- **데이터 복사 최소화** - [`python memoryview`](https://docs.python.org/3/c-api/memoryview.html)를 사용하여 C++에서 Python으로 데이터를 전달할 때 복사를 최소화합니다
- **풍부한 Python 생태계 통합** - Pandas, Arrow, DB API 2.0에 대한 네이티브 지원으로 기존 데이터 사이언스 워크플로에 원활하게 통합됩니다
- **외부 종속성 없음** - 외부 데이터베이스를 설치할 필요가 없습니다
- **DataStore API** - SQL 최적화를 제공하는 Pandas 호환 API로, 630개가 넘는 메서드를 지원합니다

## DataStore: Pandas-Compatible API \{#datastore\}

**새 기능!** DataStore는 익숙한 pandas 구문에 ClickHouse 성능을 결합한, pandas와 호환되는 API를 제공합니다.

### 한 줄로 마이그레이션 \{#one-line-migration\}

```python
# Just change your import - your pandas code works unchanged
- import pandas as pd
+ from chdb import datastore as pd

df = pd.read_csv("data.csv")
result = df[df['age'] > 25].groupby('city')['salary'].mean()
```


### 주요 성능 지표 \{#performance-highlights\}

| 연산 | pandas | DataStore | 속도 향상 |
|-----------|--------|-----------|---------|
| GroupBy count | 347ms | 17ms | **19.93x** |
| 복잡한 파이프라인 | 2,047ms | 380ms | **5.39x** |
| Filter+Sort+Head | 1,537ms | 350ms | **4.40x** |

*1,000만 행 기준 벤치마크*

### DataStore 기능 \{#datastore-features\}

- **630개 이상의 API 메서드** - 209개의 pandas DataFrame 메서드, 185개 이상의 accessor 메서드
- **지연 평가(Lazy evaluation)** - 연산이 최적화된 SQL로 컴파일됩니다.
- **SQL 푸시다운(SQL pushdown)** - 필터와 집계가 데이터 소스에서 실행됩니다.
- **범용 데이터 소스(Universal data sources)** - 파일, S3, 데이터베이스, 데이터 레이크에서 데이터를 읽을 수 있습니다.

자세한 내용은 [DataStore Documentation](datastore/index.md)을 참조하십시오.

## chDB는 어떤 언어를 지원합니까? \{#what-languages-are-supported-by-chdb\}

chDB는 다음과 같은 언어 바인딩을 지원합니다:

* [Python](install/python.md) - [API Reference](api/python.md)
* [Go](install/go.md)
* [Rust](install/rust.md)
* [NodeJS](install/nodejs.md)
* [Bun](install/bun.md)
* [C and C++](install/c.md)

## 어떻게 시작하나요? \{#how-do-i-get-started\}

* [Go](install/go.md), [Rust](install/rust.md), [NodeJS](install/nodejs.md), [Bun](install/bun.md) 또는 [C 및 C++](install/c.md)을 사용하는 경우 해당 언어 페이지를 참고하십시오.
* Python을 사용하는 경우 [개발자용 시작 가이드](getting-started.md) 또는 [chDB 온디맨드 강좌](https://learn.clickhouse.com/user_catalog_class/show/1901178)를 참고하십시오.

### pandas 사용자용 \{#for-pandas-users\}

익숙한 pandas 사용 경험은 유지하면서 ClickHouse 성능을 활용할 수 있는 DataStore API부터 시작하십시오:

* [DataStore 빠른 시작](datastore/quickstart.md) - 설치 및 한 줄로 끝나는 마이그레이션
* [pandas에서 마이그레이션](guides/migration-from-pandas.md) - 단계별 마이그레이션 가이드
* [pandas 쿡북](guides/pandas-cookbook.md) - 일반적인 패턴
* [주요 차이점](guides/pandas-differences.md) - pandas와의 핵심 차이점
* [성능 가이드](guides/pandas-performance.md) - 최적화 팁

### DataStore API 레퍼런스 \{#datastore-reference\}

* [Factory Methods](datastore/factory-methods.md) - 파일, 데이터베이스, Cloud 스토리지에서 생성
* [Query Building](datastore/query-building.md) - SQL 스타일의 연산
* [Pandas Compatibility](datastore/pandas-compat.md) - 호환되는 메서드 209개
* [Accessors](datastore/accessors.md) - .str, .dt, .arr, .json, .url, .ip, .geo
* [Configuration](configuration/index.md) - 엔진, 로깅, 프로파일링
* [Debugging](debugging/index.md) - explain(), 프로파일링, 로깅

### SQL API 가이드 \{#sql-guides\}

* [Python API Reference](api/python.md) - SQL API 전체 참조 문서
* [JupySQL](guides/jupysql.md)
* [Pandas 쿼리하기](guides/querying-pandas.md)
* [Apache Arrow 쿼리하기](guides/querying-apache-arrow.md)
* [S3에 저장된 데이터 쿼리하기](guides/querying-s3-bucket.md)
* [Parquet 파일 쿼리하기](guides/querying-parquet.md)
* [원격 ClickHouse 쿼리하기](guides/query-remote-clickhouse.md)
* [clickhouse-local 데이터베이스 사용하기](guides/clickhouse-local.md)

## 소개 동영상 \{#an-introductory-video\}

chDB에 대한 짧은 소개 영상을 시청하고, ClickHouse의 강력한 기능을 Python 환경에서 어떻게 활용할 수 있는지 알아보십시오:

<div class='vimeo-container'>
<iframe width="560" height="315" src="https://www.youtube.com/embed/e_yL0dlX6k4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## 성능 벤치마크 \{#performance-benchmarks\}

chDB는 다양한 시나리오에서 뛰어난 성능을 발휘합니다:

* **[임베디드 엔진의 ClickBench](https://benchmark.clickhouse.com/#eyJzeXN0ZW0iOnsiQXRoZW5hIChwYXJ0aXRpb25lZCkiOnRydWUsIkF0aGVuYSAoc2luZ2xlKSI6dHJ1ZSwiQXVyb3JhIGZvciBNeVNRTCI6dHJ1ZSwiQXVyb3JhIGZvciBQb3N0Z3JlU1FMIjp0cnVlLCJCeXRlSG91c2UiOnRydWUsImNoREIiOnRydWUsIkNpdHVzIjp0cnVlLCJjbGlja2hvdXNlLWxvY2FsIChwYXJ0aXRpb25lZCkiOnRydWUsImNsaWNraG91c2UtbG9jYWwgKHNpbmdsZSkiOnRydWUsIkNsaWNrSG91c2UiOnRydWUsIkNsaWNrSG91c2UgKHR1bmVkKSI6dHJ1ZSwiQ2xpY2tIb3VzZSAoenN0ZCkiOnRydWUsIkNsaWNrSG91c2UgQ2xvdWQiOnRydWUsIkNsaWNrSG91c2UgKHdlYikiOnRydWUsIkNyYXRlREIiOnRydWUsIkRhdGFiZW5kIjp0cnVlLCJEYXRhRnVzaW9uIChzaW5nbGUpIjp0cnVlLCJBcGFjaGUgRG9yaXMiOnRydWUsIkRydWlkIjp0cnVlLCJEdWNrREIgKFBhcnF1ZXQpIjp0cnVlLCJEdWNrREIiOnRydWUsIkVsYXN0aWNzZWFyY2giOnRydWUsIkVsYXN0aWNzZWFyY2ggKHR1bmVkKSI6ZmFsc2UsIkdyZWVucGx1bSI6dHJ1ZSwiSGVhdnlBSSI6dHJ1ZSwiSHlkcmEiOnRydWUsIkluZm9icmlnaHQiOnRydWUsIktpbmV0aWNhIjp0cnVlLCJNYXJpYURCIENvbHVtblN0b3JlIjp0cnVlLCJNYXJpYURCIjpmYWxzZSwiTW9uZXREQiI6dHJ1ZSwiTW9uZ29EQiI6dHJ1ZSwiTXlTUUwgKE15SVNBTSkiOnRydWUsIk15U1FMIjp0cnVlLCJQaW5vdCI6dHJ1ZSwiUG9zdGdyZVNRTCI6dHJ1ZSwiUG9zdGdyZVNRTCAodHVuZWQpIjpmYWxzZSwiUXVlc3REQiAocGFydGl0aW9uZWQpIjp0cnVlLCJRdWVzdERCIjp0cnVlLCJSZWRzaGlmdCI6dHJ1ZSwiU2VsZWN0REIiOnRydWUsIlNpbmdsZVN0b3JlIjp0cnVlLCJTbm93Zmxha2UiOnRydWUsIlNRTGl0ZSI6dHJ1ZSwiU3RhclJvY2tzIjp0cnVlLCJUaW1lc2NhbGVEQiAoY29tcHJlc3Npb24pIjp0cnVlLCJUaW1lc2NhbGVEQiI6dHJ1ZX0sInR5cGUiOnsic3RhdGVsZXNzIjpmYWxzZSwibWFuYWdlZCI6ZmFsc2UsIkphdmEiOmZhbHNlLCJjb2x1bW4tb3JpZW50ZWQiOmZhbHNlLCJDKysiOmZhbHNlLCJNeVNRTCBjb21wYXRpYmxlIjpmYWxzZSwicm93LW9yaWVudGVkIjpmYWxzZSwiQyI6ZmFsc2UsIlBvc3RncmVTUUwgY29tcGF0aWJsZSI6ZmFsc2UsIkNsaWNrSG91c2UgZGVyaXZhdGl2ZSI6ZmFsc2UsImVtYmVkZGVkIjp0cnVlLCJzZXJ2ZXJsZXNzIjpmYWxzZSwiUnVzdCI6ZmFsc2UsInNlYXJjaCI6ZmFsc2UsImRvY3VtZW50IjpmYWxzZSwidGltZS1zZXJpZXMiOmZhbHNlfSwibWFjaGluZSI6eyJzZXJ2ZXJsZXNzIjp0cnVlLCIxNmFjdSI6dHJ1ZSwiTCI6dHJ1ZSwiTSI6dHJ1ZSwiUyI6dHJ1ZSwiWFMiOnRydWUsImM2YS5tZXRhbCwgNTAwZ2IgZ3AyIjp0cnVlLCJjNmEuNHhsYXJnZSwgNTAwZ2IgZ3AyIjp0cnVlLCJjNS40eGxhcmdlLCA1MDBnYiBncDIiOnRydWUsIjE2IHRocmVhZHMiOnRydWUsIjIwIHRocmVhZHMiOnRydWUsIjI0IHRocmVhZHMiOnRydWUsIjI4IHRocmVhZHMiOnRydWUsIjMwIHRocmVhZHMiOnRydWUsIjQ4IHRocmVhZHMiOnRydWUsIjYwIHRocmVhZHMiOnRydWUsIm01ZC4yNHhsYXJnZSI6dHJ1ZSwiYzVuLjR4bGFyZ2UsIDIwMGdiIGdwMiI6dHJ1ZSwiYzZhLjR4bGFyZ2UsIDE1MDBnYiBncDIiOnRydWUsImRjMi44eGxhcmdlIjp0cnVlLCJyYTMuMTZ4bGFyZ2UiOnRydWUsInJhMy40eGxhcmdlIjp0cnVlLCJyYTMueGxwbHVzIjp0cnVlLCJTMjQiOnRydWUsIlMyIjp0cnVlLCIyWEwiOnRydWUsIjNYTCI6dHJ1ZSwiNFhMIjp0cnVlLCJYTCI6dHJ1ZX0sImNsdXN0ZXJfc2l6ZSI6eyIxIjp0cnVlLCIyIjp0cnVlLCI0Ijp0cnVlLCI4Ijp0cnVlLCIxNiI6dHJ1ZSwiMzIiOnRydWUsIjY0Ijp0cnVlLCIxMjgiOnRydWUsInNlcnZlcmxlc3MiOnRydWUsInVuZGVmaW5lZCI6dHJ1ZX0sIm1ldHJpYyI6ImhvdCIsInF1ZXJpZXMiOlt0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlXX0=)** - SQL API 성능 비교
* **[DataFrame 벤치마크](https://benchmark.clickhouse.com/#eyJzeXN0ZW0iOnsiQWxsb3lEQiI6dHJ1ZSwiQWxsb3lEQiAodHVuZWQpIjp0cnVlLCJBdGhlbmEgKHBhcnRpdGlvbmVkKSI6dHJ1ZSwiQXRoZW5hIChzaW5nbGUpIjp0cnVlLCJBdXJvcmEgZm9yIE15U1FMIjp0cnVlLCJBdXJvcmEgZm9yIFBvc3RncmVTUUwiOnRydWUsIkJ5Q29uaXR5Ijp0cnVlLCJCeXRlSG91c2UiOnRydWUsImNoREIgKERhdGFGcmFtZSkiOnRydWUsImNoREIgKFBhcnF1ZXQsIHBhcnRpdGlvbmVkKSI6dHJ1ZSwiY2hEQiI6dHJ1ZSwiQ2l0dXMiOnRydWUsIkNsaWNrSG91c2UgQ2xvdWQgKGF3cykiOnRydWUsIkNsaWNrSG91c2UgQ2xvdWQgKGF6dXJlKSI6dHJ1ZSwiQ2xpY2tIb3VzZSBDbG91ZCAoZ2NwKSI6dHJ1ZSwiQ2xpY2tIb3VzZSAoZGF0YSBsYWtlLCBwYXJ0aXRpb25lZCkiOnRydWUsIkNsaWNrSG91c2UgKGRhdGEgbGFrZSwgc2luZ2xlKSI6dHJ1ZSwiQ2xpY2tIb3VzZSAoUGFycXVldCwgcGFydGl0aW9uZWQpIjp0cnVlLCJDbGlja0hvdXNlIChQYXJxdWV0LCBzaW5nbGUpIjp0cnVlLCJDbGlja0hvdXNlICh3ZWIpIjp0cnVlLCJDbGlja0hvdXNlIjp0cnVlLCJDbGlja0hvdXNlICh0dW5lZCkiOnRydWUsIkNsaWNrSG91c2UgKHR1bmVkLCBtZW1vcnkpIjp0cnVlLCJDbG91ZGJlcnJ5Ijp0cnVlLCJDcmF0ZURCIjp0cnVlLCJDcnVuY2h5IEJyaWRnZSBmb3IgQW5hbHl0aWNzIChQYXJxdWV0KSI6dHJ1ZSwiRGF0YWJlbmQiOnRydWUsIkRhdGFGdXNpb24gKFBhcnF1ZXQsIHBhcnRpdGlvbmVkKSI6dHJ1ZSwiRGF0YUZ1c2lvbiAoUGFycXVldCwgc2luZ2xlKSI6dHJ1ZSwiQXBhY2hlIERvcmlzIjp0cnVlLCJEcnVpZCI6dHJ1ZSwiRHVja0RCIChEYXRhRnJhbWUpIjp0cnVlLCJEdWNrREIgKFBhcnF1ZXQsIHBhcnRpdGlvbmVkKSI6dHJ1ZSwiRHVja0RCIjp0cnVlLCJFbGFzdGljc2VhcmNoIjp0cnVlLCJFbGFzdGljc2VhcmNoICh0dW5lZCkiOmZhbHNlLCJHbGFyZURCIjp0cnVlLCJHcmVlbnBsdW0iOnRydWUsIkhlYXZ5QUkiOnRydWUsIkh5ZHJhIjp0cnVlLCJJbmZvYnJpZ2h0Ijp0cnVlLCJLaW5ldGljYSI6dHJ1ZSwiTWFyaWFEQiBDb2x1bW5TdG9yZSI6dHJ1ZSwiTWFyaWFEQiI6ZmFsc2UsIk1vbmV0REIiOnRydWUsIk1vbmdvREIiOnRydWUsIk1vdGhlcmR1Y2siOnRydWUsIk15U1FMIChNeUlTQU0pIjp0cnVlLCJNeVNRTCI6dHJ1ZSwiT3hsYSI6dHJ1ZSwiUGFuZGFzIChEYXRhRnJhbWUpIjp0cnVlLCJQYXJhZGVEQiAoUGFycXVldCwgcGFydGl0aW9uZWQpIjp0cnVlLCJQYXJhZGVEQiAoUGFycXVldCwgc2luZ2xlKSI6dHJ1ZSwiUGlub3QiOnRydWUsIlBvbGFycyAoRGF0YUZyYW1lKSI6dHJ1ZSwiUG9zdGdyZVNRTCAodHVuZWQpIjpmYWxzZSwiUG9zdGdyZVNRTCI6dHJ1ZSwiUXVlc3REQiAocGFydGl0aW9uZWQpIjp0cnVlLCJRdWVzdERCIjp0cnVlLCJSZWRzaGlmdCI6dHJ1ZSwiU2luZ2xlU3RvcmUiOnRydWUsIlNub3dmbGFrZSI6dHJ1ZSwiU1FMaXRlIjp0cnVlLCJTdGFyUm9ja3MiOnRydWUsIlRhYmxlc3BhY2UiOnRydWUsIlRlbWJvIE9MQVAgKGNvbHVtbmFyKSI6dHJ1ZSwiVGltZXNjYWxlREIgKGNvbXByZXNzaW9uKSI6dHJ1ZSwiVGltZXNjYWxlREIiOnRydWUsIlVtYnJhIjp0cnVlfSwidHlwZSI6eyJDIjpmYWxzZSwiY29sdW1uLW9yaWVudGVkIjpmYWxzZSwiUG9zdGdyZVNRTCBjb21wYXRpYmxlIjpmYWxzZSwibWFuYWdlZCI6ZmFsc2UsImdjcCI6ZmFsc2UsInN0YXRlbGVzcyI6ZmFsc2UsIkphdmEiOmZhbHNlLCJDKysiOmZhbHNlLCJNeVNRTCBjb21wYXRpYmxlIjpmYWxzZSwicm93LW9yaWVudGVkIjpmYWxzZSwiQ2xpY2tIb3VzZSBkZXJpdmF0aXZlIjpmYWxzZSwiZW1iZWRkZWQiOmZhbHNlLCJzZXJ2ZXJsZXNzIjpmYWxzZSwiZGF0YWZyYW1lIjp0cnVlLCJhd3MiOmZhbHNlLCJhenVyZSI6ZmFsc2UsImFuYWx5dGljYWwiOmZhbHNlLCJSdXN0IjpmYWxzZSwic2VhcmNoIjpmYWxzZSwiZG9jdW1lbnQiOmZhbHNlLCJzb21ld2hhdCBQb3N0Z3JlU1FMIGNvbXBhdGlibGUiOmZhbHNlLCJ0aW1lLXNlcmllcyI6ZmFsc2V9LCJtYWNoaW5lIjp7IjE2IHZDUFUgMTI4R0IiOnRydWUsIjggdkNQVSA2NEdCIjp0cnVlLCJzZXJ2ZXJsZXNzIjp0cnVlLCIxNmFjdSI6dHJ1ZSwiYzZhLjR4bGFyZ2UsIDUwMGdiIGdwMiI6dHJ1ZSwiTCI6dHJ1ZSwiTSI6dHJ1ZSwiUyI6dHJ1ZSwiWFMiOnRydWUsImM2YS5tZXRhbCwgNTAwZ2IgZ3AyIjp0cnVlLCIxOTJHQiI6dHJ1ZSwiMjRHQiI6dHJ1ZSwiMzYwR0IiOnRydWUsIjQ4R0IiOnRydWUsIjcyMEdCIjp0cnVlLCI5NkdCIjp0cnVlLCJkZXYiOnRydWUsIjcwOEdCIjp0cnVlLCJjNW4uNHhsYXJnZSwgNTAwZ2IgZ3AyIjp0cnVlLCJBbmFseXRpY3MtMjU2R0IgKDY0IHZDb3JlcywgMjU2IEdCKSI6dHJ1ZSwiYzUuNHhsYXJnZSwgNTAwZ2IgZ3AyIjp0cnVlLCJjNmEuNHhsYXJnZSwgMTUwMGdiIGdwMiI6dHJ1ZSwiY2xvdWQiOnRydWUsImRjMi44eGxhcmdlIjp0cnVlLCJyYTMuMTZ4bGFyZ2UiOnRydWUsInJhMy40eGxhcmdlIjp0cnVlLCJyYTMueGxwbHVzIjp0cnVlLCJTMiI6dHJ1ZSwiUzI0Ijp0cnVlLCIyWEwiOnRydWUsIjNYTCI6dHJ1ZSwiNFhMIjp0cnVlLCJYTCI6dHJ1ZSwiTDEgLSAxNkNQVSAzMkdCIjp0cnVlLCJjNmEuNHhsYXJnZSwgNTAwZ2IgZ3AzIjp0cnVlfSwiY2x1c3Rlcl9zaXplIjp7IjEiOnRydWUsIjIiOnRydWUsIjQiOnRydWUsIjgiOnRydWUsIjE2Ijp0cnVlLCIzMiI6dHJ1ZSwiNjQiOnRydWUsIjEyOCI6dHJ1ZSwic2VydmVybGVzcyI6dHJ1ZX0sIm1ldHJpYyI6ImhvdCIsInF1ZXJpZXMiOlt0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlXX0=) - DataFrame 엔진 비교
* **[DataStore vs Pandas](datastore/index.md#performance)** - 일반적인 연산에서 pandas 대비 최대 20배 빠르게 동작합니다

<Image img={dfBench} alt='DataFrame 벤치마크 결과' size="md"/>

## chDB 소개 \{#about-chdb\}

- chDB 프로젝트의 탄생 스토리는 [블로그 글](https://clickhouse.com/blog/chdb-embedded-clickhouse-rocket-engine-on-a-bicycle)에서 확인할 수 있습니다.
- chDB와 그 활용 사례는 [블로그 글](https://clickhouse.com/blog/welcome-chdb-to-clickhouse)에서 확인할 수 있습니다.
- [chDB 온디맨드 과정](https://learn.clickhouse.com/user_catalog_class/show/1901178)을 수강하십시오.
- 브라우저에서 [codapi 예제](https://antonz.org/trying-chdb/)를 사용해 chDB를 살펴보십시오.
- 더 많은 예제는 (https://github.com/chdb-io/chdb/tree/main/examples)를 참조하십시오.

## 라이선스 \{#license\}

chDB는 Apache License 2.0 버전에 따라 제공됩니다. 자세한 내용은 [LICENSE](https://github.com/chdb-io/chdb/blob/main/LICENSE.txt)를 참조하십시오.