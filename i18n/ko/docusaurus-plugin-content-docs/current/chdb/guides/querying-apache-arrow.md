---
'title': 'Apache Arrow를 chDB로 쿼리하는 방법'
'sidebar_label': 'Apache Arrow 쿼리하기'
'slug': '/chdb/guides/apache-arrow'
'description': '이 가이드에서는 chDB를 사용하여 Apache Arrow 테이블을 쿼리하는 방법을 배웁니다.'
'keywords':
- 'chdb'
- 'Apache Arrow'
'doc_type': 'guide'
---

[Apache Arrow](https://arrow.apache.org/)는 데이터 커뮤니티에서 인기를 얻고 있는 표준화된 컬럼 지향 메모리 형식입니다. 이 가이드에서는 `Python` 테이블 함수를 사용하여 Apache Arrow를 쿼리하는 방법을 배웁니다.

## Setup {#setup}

먼저 가상 환경을 생성해 보겠습니다:

```bash
python -m venv .venv
source .venv/bin/activate
```

이제 chDB를 설치하겠습니다. 2.0.2 버전 이상이 설치되어 있는지 확인하세요:

```bash
pip install "chdb>=2.0.2"
```

이제 PyArrow, pandas 및 ipython을 설치하겠습니다:

```bash
pip install pyarrow pandas ipython
```

이 가이드의 나머지 명령을 실행하기 위해 `ipython`을 사용할 예정이며, 다음을 실행하여 시작할 수 있습니다:

```bash
ipython
```

코드를 Python 스크립트나 즐겨 사용하는 노트북에서도 사용할 수 있습니다.

## Creating an Apache Arrow table from a file {#creating-an-apache-arrow-table-from-a-file}

먼저 [Ookla dataset](https://github.com/teamookla/ookla-open-data) 중 하나의 Parquet 파일을 다운로드합니다. [AWS CLI 도구](https://aws.amazon.com/cli/)를 사용하세요:

```bash
aws s3 cp \
  --no-sign \
  s3://ookla-open-data/parquet/performance/type=mobile/year=2023/quarter=2/2023-04-01_performance_mobile_tiles.parquet .
```

:::note
더 많은 파일을 다운로드하려면 `aws s3 ls`를 사용하여 모든 파일 목록을 가져온 후 위의 명령을 업데이트하세요.
:::

다음으로 `pyarrow` 패키지에서 Parquet 모듈을 가져옵니다:

```python
import pyarrow.parquet as pq
```

그런 다음 Parquet 파일을 Apache Arrow 테이블로 읽을 수 있습니다:

```python
arrow_table = pq.read_table("./2023-04-01_performance_mobile_tiles.parquet")
```

스키마는 아래에 표시됩니다:

```python
arrow_table.schema
```

```text
quadkey: string
tile: string
tile_x: double
tile_y: double
avg_d_kbps: int64
avg_u_kbps: int64
avg_lat_ms: int64
avg_lat_down_ms: int32
avg_lat_up_ms: int32
tests: int64
devices: int64
```

`shape` 속성을 호출하여 행과 열의 개수를 얻을 수 있습니다:

```python
arrow_table.shape
```

```text
(3864546, 11)
```

## Querying Apache Arrow {#querying-apache-arrow}

이제 chDB에서 Arrow 테이블을 쿼리해 보겠습니다. 먼저 chDB를 import합니다:

```python
import chdb
```

그런 다음 테이블을 설명할 수 있습니다:

```python
chdb.query("""
DESCRIBE Python(arrow_table)
SETTINGS describe_compact_output=1
""", "DataFrame")
```

```text
               name     type
0           quadkey   String
1              tile   String
2            tile_x  Float64
3            tile_y  Float64
4        avg_d_kbps    Int64
5        avg_u_kbps    Int64
6        avg_lat_ms    Int64
7   avg_lat_down_ms    Int32
8     avg_lat_up_ms    Int32
9             tests    Int64
10          devices    Int64
```

행 수를 계산할 수도 있습니다:

```python
chdb.query("SELECT count() FROM Python(arrow_table)", "DataFrame")
```

```text
   count()
0  3864546
```

이제 좀 더 흥미로운 작업을 해보겠습니다. 다음 쿼리는 `quadkey` 및 `tile.*` 컬럼을 제외하고 나머지 컬럼에 대한 평균과 최대 값을 계산합니다:

```python
chdb.query("""
WITH numericColumns AS (
  SELECT * EXCEPT ('tile.*') EXCEPT(quadkey)
  FROM Python(arrow_table)
)
SELECT * APPLY(max), * APPLY(avg) APPLY(x -> round(x, 2))
FROM numericColumns
""", "Vertical")
```

```text
Row 1:
──────
max(avg_d_kbps):                4155282
max(avg_u_kbps):                1036628
max(avg_lat_ms):                2911
max(avg_lat_down_ms):           2146959360
max(avg_lat_up_ms):             2146959360
max(tests):                     111266
max(devices):                   1226
round(avg(avg_d_kbps), 2):      84393.52
round(avg(avg_u_kbps), 2):      15540.4
round(avg(avg_lat_ms), 2):      41.25
round(avg(avg_lat_down_ms), 2): 554355225.76
round(avg(avg_lat_up_ms), 2):   552843178.3
round(avg(tests), 2):           6.31
round(avg(devices), 2):         2.88
```
