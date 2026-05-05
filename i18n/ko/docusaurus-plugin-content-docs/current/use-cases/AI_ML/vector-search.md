---
slug: /use-cases/AI/qbit-vector-search
sidebar_label: 'QBit을 활용한 벡터 검색'
title: '벡터 검색과 QBit 소개'
pagination_prev: null
pagination_next: null
description: 'QBit이 ClickHouse의 벡터 검색 쿼리에 대해 런타임에 정밀도를 조정할 수 있는 튜닝 기능을 어떻게 제공하는지 알아봅니다.'
keywords: ['QBit', '벡터 검색', 'AI', 'embeddings', 'ANN']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import diagram_1 from '@site/static/images/use-cases/AI_ML/QBit/diagram_1.jpg';
import diagram_2 from '@site/static/images/use-cases/AI_ML/QBit/diagram_2.jpg';
import diagram_3 from '@site/static/images/use-cases/AI_ML/QBit/diagram_3.jpg';
import diagram_4 from '@site/static/images/use-cases/AI_ML/QBit/diagram_4.jpg';
import diagram_5 from '@site/static/images/use-cases/AI_ML/QBit/diagram_5.jpg';
import diagram_6 from '@site/static/images/use-cases/AI_ML/QBit/diagram_6.jpg';
import diagram_7 from '@site/static/images/use-cases/AI_ML/QBit/diagram_7.jpg';
import diagram_8 from '@site/static/images/use-cases/AI_ML/QBit/diagram_8.jpg';
import diagram_9 from '@site/static/images/use-cases/AI_ML/QBit/diagram_9.jpg';
import diagram_10 from '@site/static/images/use-cases/AI_ML/QBit/diagram_10.jpg';
import diagram_11 from '@site/static/images/use-cases/AI_ML/QBit/diagram_11.jpg';
import diagram_12 from '@site/static/images/use-cases/AI_ML/QBit/diagram_12.jpg';
import diagram_13 from '@site/static/images/use-cases/AI_ML/QBit/diagram_13.jpg';
import diagram_14 from '@site/static/images/use-cases/AI_ML/QBit/diagram_14.jpg';
import diagram_15 from '@site/static/images/use-cases/AI_ML/QBit/diagram_15.jpg';
import diagram_16 from '@site/static/images/use-cases/AI_ML/QBit/diagram_16.jpg';
import diagram_17 from '@site/static/images/use-cases/AI_ML/QBit/diagram_17.jpg';

:::note[이 가이드에서는 다음을 다룹니다:]

* 벡터 검색을 간단히 소개합니다
* Approximate Nearest Neighbours (ANN)와 Hierarchical Navigable Small World (HNSW)에 대해 알아봅니다
* Quantised Bit (QBit)에 대해 알아봅니다
* DBPedia 데이터셋을 사용하여 QBit을 활용한 벡터 검색을 수행합니다
  :::


## 벡터 검색 입문 \{#vector-search-primer\}

수학과 물리학에서 벡터는 크기와 방향을 모두 가지는 객체로 공식적으로 정의됩니다.
이는 종종 선분이나 공간을 가로지르는 화살표 형태를 띠며, 속도, 힘, 가속도와 같은 양을 표현하는 데 사용될 수 있습니다.
컴퓨터 과학에서 벡터는 유한한 길이의 수열입니다.
즉, 숫자 값을 저장하는 데 사용되는 데이터 구조입니다.

머신 러닝에서는 벡터가 컴퓨터 과학에서 말하는 것과 같은 데이터 구조이지만, 그 안에 저장된 수치 값들이 특별한 의미를 가집니다.
텍스트 블록이나 이미지를 가져와 그것이 표현하는 핵심 개념만 추출하는 과정을 인코딩(encoding)이라고 합니다.
이 과정을 통해 얻어진 출력은 이러한 핵심 개념을 수치 형태로 표현한, 머신이 이해할 수 있는 표현입니다.
이를 임베딩(embedding)이라고 하며, 벡터에 저장됩니다.
즉, 이러한 문맥적 의미가 벡터 안에 표현된 것을 임베딩이라고 부를 수 있습니다.

벡터 검색(vector search)은 이제 어디에나 사용됩니다.
음악 추천, 답변 품질 향상을 위해 외부 지식을 가져오는 대규모 언어 모델의 RAG(retrieval-augmented generation), 심지어 구글 검색조차도 어느 정도는 벡터 검색에 의해 구동됩니다.

사용자는 특화된 데이터베이스가 가진 장점에도 불구하고, 전용 벡터 스토어보다 애드혹(ad-hoc) 벡터 기능을 제공하는 일반 데이터베이스를 선호하는 경우가 많습니다.
ClickHouse는 [brute-force 벡터 검색](/engines/table-engines/mergetree-family/annindexes#exact-nearest-neighbor-search)과 [근사 최근접 이웃(ANN, approximate nearest neighbour) 검색을 위한 방법](/engines/table-engines/mergetree-family/annindexes#approximate-nearest-neighbor-search)을 모두 지원하며, 여기에 빠른 벡터 검색을 위한 현재 표준인 HNSW도 포함됩니다.

### 임베딩 이해하기 \{#understanding-embeddings\}

벡터 검색이 어떻게 작동하는지 간단한 예제를 통해 살펴보겠습니다.
다음과 같은 단어의 임베딩(벡터 표현)을 생각해 보십시오:

<Image size="md" img={diagram_4} alt="Fruit and animal embeddings visualization" />

아래와 같이 샘플 임베딩이 포함된 테이블을 생성하십시오:

```sql
CREATE TABLE fruit_animal
ENGINE = MergeTree
ORDER BY word
AS SELECT *
FROM VALUES(
  'word String, vec Array(Float64)',
  ('apple', [-0.99105519, 1.28887844, -0.43526649, -0.98520696, 0.66154391]),
  ('banana', [-0.69372815, 0.25587061, -0.88226235, -2.54593015, 0.05300475]),
  ('orange', [0.93338752, 2.06571317, -0.54612565, -1.51625717, 0.69775337]),
  ('dog', [0.72138876, 1.55757105, 2.10953259, -0.33961248, -0.62217325]),
  ('horse', [-0.61435682, 0.48542571, 1.21091247, -0.62530446, -1.33082533])
);
```

주어진 임베딩과 가장 유사한 단어를 찾을 수 있습니다:

```sql
SELECT word, L2Distance(
  vec, [-0.88693672, 1.31532824, -0.51182908, -0.99652702, 0.59907770]
) AS distance
FROM fruit_animal
ORDER BY distance
LIMIT 5;
```

```response
┌─word───┬────────────distance─┐
│ apple  │ 0.14639757188169716 │
│ banana │  1.9989613690076786 │
│ orange │   2.039041552613732 │
│ horse  │  2.7555776805484813 │
│ dog    │   3.382295083120104 │
└────────┴─────────────────────┘
```

쿼리 임베딩이 &quot;apple&quot; 임베딩과 가장 가깝습니다(거리가 가장 짧습니다). 두 임베딩을 나란히 보면 자연스러운 결과임을 알 수 있습니다:

```response
apple:           [-0.99105519,1.28887844,-0.43526649,-0.98520696,0.66154391]
query embedding: [-0.88693672,1.31532824,-0.51182908,-0.99652702,0.5990777]
```


## 근사 최근접 이웃(Approximate Nearest Neighbours, ANN) \{#approximate-nearest-neighbours\}

데이터셋이 매우 큰 경우, 브루트 포스(brute-force) 탐색은 속도가 너무 느려집니다.
이때 근사 최근접 이웃 기법이 사용됩니다.

### Quantisation \{#quantisation\}

Quantisation은 더 작은 수치형 타입으로 다운캐스팅하는 과정을 의미합니다.
숫자가 작을수록 데이터가 작아지고, 데이터가 작을수록 거리 계산이 더 빨라집니다.
ClickHouse의 벡터화된 쿼리 실행 엔진은 연산당 프로세서 레지스터에 더 많은 값을 적재할 수 있어 처리량이 직접적으로 증가합니다.

두 가지 옵션이 있습니다:

1. **양자화된 복사본을 원래 컬럼과 함께 유지** - 저장 공간이 2배로 늘어나지만, 언제든지 전체 정밀도로 되돌릴 수 있으므로 안전합니다.
2. **원래 값을 완전히 교체** (삽입 시 다운캐스팅) - 공간과 I/O를 절약하지만, 되돌릴 수 없는 선택입니다.

### 계층적 내비게이블 스몰 월드(HNSW, Hierarchical Navigable Small World) \{#hnsw\}

<Image size="md" img={diagram_1} alt="HNSW layer structure"/>

HNSW는 여러 계층의 노드(벡터)로 구성됩니다. 각 노드는 하나 이상의 계층에 무작위로 할당되며, 더 높은 계층에 속할 확률은 지수적으로 감소합니다.

검색을 수행할 때는 최상위 계층의 노드에서 시작하여 가장 가까운 이웃을 향해 탐욕적 탐색(greedy search) 방식으로 이동합니다. 더 이상 가까운 노드를 찾을 수 없으면, 그다음으로 더 촘촘한 계층으로 내려갑니다.

이와 같은 계층적 설계 덕분에 HNSW는 노드 수에 대해 로그 수준의 검색 복잡도를 달성합니다.

:::warning[HNSW 제한 사항]
주요 병목은 메모리입니다. ClickHouse는 HNSW의 [usearch](https://github.com/unum-cloud/usearch) 구현을 사용하며, 이는 분할을 지원하지 않는 메모리 내(in-memory) 데이터 구조입니다.
그 결과, 더 큰 데이터셋에는 그에 비례하여 더 많은 RAM이 필요합니다.
:::

### 접근 방식 비교 \{#comparison-approaches\}

| Category | Brute-force | HNSW | QBit |
|----------|-------------|------|------|
| **Precision** | 완벽함 | 우수함 | 유연함 |
| **Speed** | 느림 | 빠름 | 유연함 |
| **Others** | 양자화: 더 많은 공간 필요 또는 되돌릴 수 없는 정밀도 손실 | 인덱스는 메모리에 상주할 수 있어야 하며 미리 구축되어야 함 | 여전히 O(#records) |

## QBit 심층 살펴보기 \{#qbit-deepdive\}

### Quantised Bit (QBit) \{#quantised-bit\}

QBit은 `BFloat16`, `Float32`, `Float64` 값을, 부동소수점 수가 비트로 표현되는 방식을 활용해 저장하는 새로운 데이터 구조입니다.
각 수 전체를 그대로 저장하는 대신, QBit은 값을 **비트 평면(bit plane)** 으로 나눕니다. 모든 첫 번째 비트, 모든 두 번째 비트, 모든 세 번째 비트 등과 같이 비트 위치별로 분리하여 저장합니다.

<Image size="md" img={diagram_2} alt="QBit 비트 평면 개념"/>

이 방식은 전통적인 양자화의 주요 한계를 해결합니다. 중복된 데이터를 저장할 필요가 없으며, 값이 의미를 잃을 위험도 줄어듭니다. 또한 QBit은 메모리 내 인덱스를 유지하는 대신 저장된 데이터를 직접 처리하므로, HNSW에서 발생하는 RAM 병목 현상도 피할 수 있습니다.

:::tip[Benefit]
**무엇보다도, 사전에 결정을 내릴 필요가 없습니다.**
정밀도와 성능은 쿼리 시점에 동적으로 조정할 수 있으므로, 사용자가 정확도와 속도 사이의 균형을 부담 없이 조정해 볼 수 있습니다.
:::

:::note Limitation
QBit은 벡터 검색을 가속하지만, 계산 복잡도는 여전히 O(n)입니다. 다시 말해, 데이터셋이 충분히 작아서 HNSW 인덱스를 RAM에 무리 없이 적재할 수 있다면, 여전히 그 방식이 가장 빠른 선택입니다.
:::

### 데이터 유형 \{#the-data-type\}

QBit 컬럼을 생성하는 방법은 다음과 같습니다.

```sql
SET allow_experimental_qbit_type = 1;
CREATE TABLE fruit_animal
(
  word String,
  vec QBit(Float64, 5)
)
ENGINE = MergeTree
ORDER BY word;

INSERT INTO fruit_animal VALUES
('apple',  [-0.99105519, 1.28887844, -0.43526649, -0.98520696, 0.66154391]),
('banana', [-0.69372815, 0.25587061, -0.88226235, -2.54593015, 0.05300475]),
('orange', [0.93338752, 2.06571317, -0.54612565, -1.51625717, 0.69775337]),
('dog',    [0.72138876, 1.55757105, 2.10953259, -0.33961248, -0.62217325]),
('horse',  [-0.61435682, 0.48542571, 1.21091247, -0.62530446, -1.33082533]);
```

<Image size="md" img={diagram_5} alt="QBit 데이터 구조 전치" />

데이터가 QBit 컬럼에 삽입되면, 모든 첫 번째 비트가 함께 정렬되고, 모든 두 번째 비트가 함께 정렬되는 식으로 전치됩니다. 이렇게 묶인 비트 집합을 **그룹(group)**이라고 합니다.

각 그룹은 별도의 `FixedString(N)` 컬럼에 저장됩니다. 이는 구분자 없이 메모리에 연속해서 저장되는 길이 N 바이트의 고정 길이 문자열입니다. 이렇게 만들어진 모든 그룹은 하나의 `Tuple`로 묶여 QBit의 기본 구조를 이룹니다.

**예시:** 8×Float64 요소로 이루어진 벡터에서 시작한다고 가정하면, 각 그룹은 8비트를 포함합니다. Float64는 64비트이므로 최종적으로 64개의 그룹(각 비트마다 하나씩)이 생성됩니다. 따라서 `QBit(Float64, 8)`의 내부 레이아웃은 64×FixedString(1) 컬럼으로 이루어진 Tuple처럼 됩니다.

:::tip
원래 벡터 길이가 8로 나누어떨어지지 않는 경우, 구조는 길이가 8에 맞도록 눈에 보이지 않는 요소를 추가해 패딩됩니다. 이는 전체 바이트 단위로만 동작하는 FixedString과의 호환성을 보장합니다.
:::


### 거리 계산 \{#the-distance-calculation\}

QBit으로 쿼리를 실행하려면 정밀도 매개변수를 지정하여 [`L2DistanceTransposed`](/sql-reference/functions/distance-functions#L2DistanceTransposed) 함수를 사용합니다.

```sql
SELECT
  word,
  L2DistanceTransposed(vec, [-0.88693672, 1.31532824, -0.51182908, -0.99652702, 0.59907770], 16) AS distance
FROM fruit_animal
ORDER BY distance;
```

```response
┌─word───┬────────────distance─┐
│ apple  │ 0.15196434766705247 │
│ banana │   1.966091150410285 │
│ orange │  1.9864477714218596 │
│ horse  │  2.7306267946594005 │
│ dog    │  3.2849989362383165 │
└────────┴─────────────────────┘
```

세 번째 매개변수(16)는 비트 단위 정밀도를 지정합니다.


### I/O 최적화 \{#io-optimisation\}

<Image size="md" img={diagram_3} alt="QBit I/O optimization"/>

거리를 계산하기 전에 필요한 데이터를 디스크에서 읽은 다음, 역전치(비트 단위로 그룹화된 표현을 다시 전체 벡터로 복원)해야 합니다. QBit은 정밀도 수준별로 비트를 전치한 형태로 값을 저장하므로, ClickHouse는 원하는 정밀도까지 숫자를 재구성하는 데 필요한 상위 비트 플레인만 읽으면 됩니다.

위 쿼리에서는 정밀도 수준 16을 사용합니다. Float64는 64비트이므로, 처음 16개의 비트 플레인만 읽고 **데이터의 75%를 건너뜁니다**.

<Image size="md" img={diagram_6} alt="QBit reconstruction"/>

데이터를 읽은 후에는 로드된 비트 플레인으로부터 각 숫자의 상위 부분만 재구성하고, 읽지 않은 비트는 0으로 남겨 둡니다.

### 계산 최적화 \{#calculation-optimisation\}

<Image size="md" img={diagram_7} alt="다운캐스팅 비교"/>

Float32 또는 BFloat16과 같이 더 작은 타입으로 캐스팅하면 이 사용되지 않는 부분을 제거할 수 있을지 의문이 들 수 있습니다. 실제로 그렇게 하면 가능하지만, 모든 행에 명시적 캐스트를 적용하면 비용이 많이 듭니다.

대신 참조 벡터에만 다운캐스팅을 수행하고, QBit 데이터를 더 좁은 값이 들어 있는 것처럼 처리할 수 있습니다(일부 컬럼의 존재를 「잊어버리는」 것). 이는 QBit 데이터의 레이아웃이 종종 해당 타입들의 잘려진(truncated) 버전에 대응하기 때문입니다.

#### BFloat16 Optimization \{#bfloat16-optimization\}

BFloat16은 Float32의 하위 16비트를 잘라낸 형식입니다. 부호 비트와 8비트 지수는 그대로 유지하지만, 23비트 가수 부분에서는 상위 7비트만 유지합니다. 이 때문에 QBit 컬럼에서 처음 16개 비트 플레인을 읽으면 BFloat16 값의 메모리 레이아웃을 사실상 그대로 재현하게 됩니다. 따라서 이 경우 기준 벡터를 BFloat16으로 안전하게 변환할 수 있으며, 실제로도 그렇게 합니다.

#### Float64 복잡도 \{#float64-complexity\}

그러나 Float64는 상황이 다릅니다. 11비트 지수와 52비트 가수부를 사용하므로, 단순히 Float32의 비트 수만 두 배로 늘린 형식이 아닙니다. 구조와 지수 바이어스가 완전히 다릅니다. Float64를 Float32와 같은 더 작은 형식으로 다운캐스트하려면, 각 값을 표현 가능한 가장 가까운 Float32로 반올림하는 실제 IEEE 754 변환이 필요합니다. 이 반올림 단계는 연산 비용이 많이 듭니다.

:::tip
QBit의 성능 요소를 더 깊이 살펴보고 싶다면 ["Let’s vectorize"](https://clickhouse.com/blog/qbit-vector-search#lets-vectorise)를 참고하십시오.
:::

## DBpedia 예제 \{#example\}

DBpedia 데이터셋을 사용하는 실제 예제를 통해 QBit이 실제 환경에서 어떻게 동작하는지 살펴보겠습니다. 이 데이터셋에는 Float32 임베딩으로 표현된 100만 개의 Wikipedia 문서가 포함되어 있습니다.

### 설정 \{#setup\}

먼저 테이블을 생성합니다.

```sql
CREATE TABLE dbpedia
(
  id      String,
  title   String,
  text    String,
  vector  Array(Float32) CODEC(NONE)
) ENGINE = MergeTree ORDER BY (id);
```

명령줄에서 데이터를 삽입하세요:

```bash
for i in $(seq 0 25); do
  echo "Processing file ${i}..."
  clickhouse client -q "INSERT INTO dbpedia SELECT _id, title, text, \"text-embedding-3-large-1536-embedding\" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/${i}.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;"
  echo "File ${i} complete."
done
```

:::tip
데이터를 삽입하는 데 다소 시간이 걸릴 수 있습니다.
커피 한 잔 할 시간입니다!
:::

또는 아래와 같이 개별 SQL 문을 실행하여 25개의 Parquet 파일 각각을 로드할 수도 있습니다:

```sql
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/0.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/1.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
...
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/25.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
```

dbpedia 테이블에 100만 개의 행이 있는지 확인합니다:

```sql
SELECT count(*)
FROM dbpedia

┌─count()─┐
│ 1000000 │
└─────────┘
```

다음으로 QBit 컬럼을 추가합니다:

```sql
SET allow_experimental_qbit_type = 1;

-- Assuming you have a table with Float32 embeddings
ALTER TABLE dbpedia ADD COLUMN qbit QBit(Float32, 1536);
ALTER TABLE dbpedia UPDATE qbit = vector WHERE 1;
```


### 검색 쿼리 \{#search-query\}

Moon, Apollo 11, Space Shuttle, Astronaut, Rocket과 같은 우주 관련 검색어 모두와 가장 밀접하게 연관된 개념을 찾아보겠습니다:

```sql
SELECT
    title,
    text,
    COUNT(DISTINCT concept) AS num_concepts_matched,
    MIN(distance) AS min_distance,
    AVG(distance) AS avg_distance
FROM (
         (
             SELECT title, text, 'Moon' AS concept,
                    L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Moon'), 5) AS distance
             FROM dbpedia
             WHERE title != 'Moon'
             ORDER BY distance ASC
                 LIMIT 1000
         )
         UNION ALL
         (
             SELECT title, text, 'Apollo 11' AS concept,
                    L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Apollo 11'), 5) AS distance
             FROM dbpedia
             WHERE title != 'Apollo 11'
             ORDER BY distance ASC
                 LIMIT 1000
         )
         UNION ALL
         (
             SELECT title, text, 'Space Shuttle' AS concept,
                    L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Space Shuttle'), 5) AS distance
             FROM dbpedia
             WHERE title != 'Space Shuttle'
             ORDER BY distance ASC
                 LIMIT 1000
         )
         UNION ALL
         (
             SELECT title, text, 'Astronaut' AS concept,
                    L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Astronaut'), 5) AS distance
             FROM dbpedia
             WHERE title != 'Astronaut'
             ORDER BY distance ASC
                 LIMIT 1000
         )
         UNION ALL
         (
             SELECT title, text, 'Rocket' AS concept,
                    L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Rocket'), 5) AS distance
             FROM dbpedia
             WHERE title != 'Rocket'
             ORDER BY distance ASC
                 LIMIT 1000
         )
     )
WHERE title NOT IN ('Moon', 'Apollo 11', 'Space Shuttle', 'Astronaut', 'Rocket')
GROUP BY title, text
HAVING num_concepts_matched >= 3
ORDER BY num_concepts_matched DESC, min_distance ASC
    LIMIT 10;
```

이 쿼리는 다섯 개의 개념 각각에 대해 의미적으로 유사한 상위 1000개의 항목을 검색합니다.
이들 결과 집합 가운데 최소 3개 이상에 포함되는 항목을 반환하며, 몇 개의 개념과 일치하는지와 그 개념들 중 어떤 것과의 최소 거리인지(원본 항목은 제외)를 기준으로 순위를 매깁니다.

오직 5비트(부호 1비트 + 지수 4비트, 가수는 0)를 사용하여:


```response
Row 1:
──────
title:                Aintree railway station
text:                 For a guide to the various Aintree stations that have existed and their relationship to each other see Aintree Stations.Aintree railway station is a railway station in Aintree, Merseyside, England.  It is on the Ormskirk branch of the Merseyrail network's Northern Line.  Until 1968 it was known as Aintree Sefton Arms after a nearby public house. The station's design reflects the fact it is the closest station to Aintree Racecourse, where the annual Grand National horse race takes place.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 2:
──────
title:                AP German Language
text:                 Advanced Placement German Language (also known as AP German Language or AP German) is a course and examination provided by the College Board through the Advanced Placement Program. This course  is designed to give high school students the opportunity to receive credit in a college-level German language course.Originally the College Board had offered two AP German exams, one with AP German Language and another with AP German Literature.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 3:
──────
title:                Adelospondyli
text:                 Adelospondyli is an order of elongate, presumably aquatic, Carboniferous amphibians.  The skull is solidly roofed, and elongate, with the orbits located very far forward.  The limbs are well developed.  Most adelospondyls belong to the family Adelogyrinidae, although the adelospondyl Acherontiscus has been placed in its own family, Acherontiscidae. The group is restricted to the Mississippian (Serpukhovian Age) of Scotland.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 4:
──────
title:                Adrien-Henri de Jussieu
text:                 Adrien-Henri de Jussieu (23 December 1797 – 29 June 1853) was a French botanist.Born in Paris as the son of botanist Antoine Laurent de Jussieu, he received the degree of Doctor of Medicine in 1824 with a treatise of the plant family Euphorbiaceae.  When his father retired in 1826, he succeeded him at the Jardin des Plantes; in 1845 he became professor of organography of plants.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 5:
──────
title:                Alan Taylor (footballer, born 1953)
text:                 Alan Taylor (born 14 November 1953) is an English former professional footballer best known for his goalscoring exploits with West Ham United in their FA Cup success of 1975, culminating in two goals in that season's final.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 6:
──────
title:                Abstract algebraic logic
text:                 In mathematical logic, abstract algebraic logic is the study of the algebraization of deductive systemsarising as an abstraction of the well-known Lindenbaum-Tarski algebra, and how the resulting algebras are related to logical systems.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 7:
──────
title:                Ahsan Saleem Hyat
text:                 General Ahsan Saleem Hayat (Urdu: احسن سلیم حیات; born 10 January 1948), is a retired four-star general who served as the vice chief of army staff of the Pakistan Army from 2004 until his retirement in 2007. Prior to that, he served as the operational field commander of the V Corps in Sindh Province and was a full-tenured professor of war studies at the National Defence University. He was succeeded by General Ashfaq Parvez Kayani on 8 October 2007.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 8:
──────
title:                Al Wafa al Igatha al Islamia
text:                 There is another organization named Al Wafa (Israel), a charity, in Israel, devoted to womenThere is another organization Jamaiat Al-Wafa LiRayat Al-Musenin which is proscribed by the Israeli government.Al Wafa is an Islamic charity listed in Executive Order 13224 as an entity that supports terrorism.United States intelligence officials state that it was founded in Afghanistan by Adil Zamil Abdull Mohssin Al Zamil,Abdul Aziz al-Matrafi and Samar Khand.According to Saad Madai Saad al-Azmi's Combatant Status Review Tribunal Al Wafa is located in the Wazir Akhbar Khan area ofAfghanistan.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 9:
───────
title:                Alex Baumann
text:                 Alexander Baumann, OC OOnt (born April 21, 1964) is a Canadian former competitive swimmer who won two gold medals and set two world records at the 1984 Summer Olympics in Los Angeles.Born in Prague (former Czechoslovakia), Baumann was raised in Canada after his family moved there in 1969 following the Prague Spring.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 10:
───────
title:                Alberni-Clayoquot Regional District
text:                 The Alberni-Clayoquot Regional District (2006 population 30,664) of British Columbia is located on west central Vancouver Island.  Adjacent regional districts it shares borders with are the Strathcona and Comox Valley Regional Districts to the north, and the Nanaimo and Cowichan Valley Regional Districts to the east. The regional district offices are located in Port Alberni.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

10 rows in set. Elapsed: 0.542 sec. Processed 5.01 million rows, 1.86 GB (9.24 million rows/s., 3.43 GB/s.)
Peak memory usage: 327.04 MiB.
```

**성능:** 결과 집합에 10행. 경과 시간: 0.271초. 처리된 데이터: 846만 행, 4.54 GB (초당 3,119만 행, 16.75 GB/초). 최대 메모리 사용량: **739.82 MiB**.

<details>
  <summary>전수 검색과 성능 비교</summary>

  ```sql
  SELECT 
      title,
      text,
      COUNT(DISTINCT concept) AS num_concepts_matched,
      MIN(distance) AS min_distance,
      AVG(distance) AS avg_distance
  FROM (
      (
          SELECT title, text, 'Moon' AS concept,
                 L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Moon'), 5) AS distance
          FROM dbpedia
          WHERE title != 'Moon'
          ORDER BY distance ASC
          LIMIT 1000
      )
      UNION ALL
      (
          SELECT title, text, 'Apollo 11' AS concept,
                 L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Apollo 11'), 5) AS distance
          FROM dbpedia
          WHERE title != 'Apollo 11'
          ORDER BY distance ASC
          LIMIT 1000
      )
      UNION ALL
      (
          SELECT title, text, 'Space Shuttle' AS concept,
                 L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Space Shuttle'), 5) AS distance
          FROM dbpedia
          WHERE title != 'Space Shuttle'
          ORDER BY distance ASC
          LIMIT 1000
      )
      UNION ALL
      (
          SELECT title, text, 'Astronaut' AS concept,
                 L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Astronaut'), 5) AS distance
          FROM dbpedia
          WHERE title != 'Astronaut'
          ORDER BY distance ASC
          LIMIT 1000
      )
      UNION ALL
      (
          SELECT title, text, 'Rocket' AS concept,
                 L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Rocket'), 5) AS distance
          FROM dbpedia
          WHERE title != 'Rocket'
          ORDER BY distance ASC
          LIMIT 1000
      )
  )
  WHERE title NOT IN ('Moon', 'Apollo 11', 'Space Shuttle', 'Astronaut', 'Rocket')
  GROUP BY title, text
  HAVING num_concepts_matched >= 3
  ORDER BY num_concepts_matched DESC, min_distance ASC
  LIMIT 10;
  ```

  ```response
  Row 1:
  ──────
  title:                Apollo program
  text:                 The Apollo program, also known as Project Apollo, was the third United States human spaceflight program carried out by the National Aeronautics and Space Administration (NASA), which accomplished landing the first humans on the Moon from 1969 to 1972. First conceived during Dwight D. Eisenhower's administration as a three-man spacecraft to follow the one-man Project Mercury which put the first Americans in space, Apollo was later dedicated to President John F.
  num_concepts_matched: 4
  min_distance:         0.82420665
  avg_distance:         1.0207901149988174

  Row 2:
  ──────
  title:                Apollo 8
  text:                 Apollo 8, the second human spaceflight mission in the United States Apollo space program, was launched on December 21, 1968, and became the first manned spacecraft to leave Earth orbit, reach the Earth's Moon, orbit it and return safely to Earth.
  num_concepts_matched: 4
  min_distance:         0.8285278
  avg_distance:         1.0357224345207214

  Row 3:
  ──────
  title:                Lunar Orbiter 1
  text:                 The Lunar Orbiter 1 robotic (unmanned) spacecraft, part of the Lunar Orbiter Program, was the first American spacecraft to orbit the Moon.  It was designed primarily to photograph smooth areas of the lunar surface for selection and verification of safe landing sites for the Surveyor and Apollo missions. It was also equipped to collect selenodetic, radiation intensity, and micrometeoroid impact data.The spacecraft was placed in an Earth parking orbit on August 10, 1966 at 19:31 (UTC).
  num_concepts_matched: 4
  min_distance:         0.94581836
  avg_distance:         1.0584313124418259

  Row 4:
  ──────
  title:                Apollo (spacecraft)
  text:                 The Apollo spacecraft was composed of three parts designed to accomplish the American Apollo program's goal of landing astronauts on the Moon by the end of the 1960s and returning them safely to Earth.  The expendable (single-use) spacecraft consisted of a combined Command/Service Module (CSM) and a Lunar Module (LM).
  num_concepts_matched: 4
  min_distance:         0.9643517
  avg_distance:         1.0367188602685928

  Row 5:
  ──────
  title:                Surveyor 1
  text:                 Surveyor 1 was the first lunar soft-lander in the unmanned  Surveyor program of the National Aeronautics and Space Administration (NASA, United States). This lunar soft-lander gathered data about the lunar surface that would be needed for the manned Apollo Moon landings that began in 1969.
  num_concepts_matched: 4
  min_distance:         0.9738264
  avg_distance:         1.0988530814647675

  Row 6:
  ──────
  title:                Spaceflight
  text:                 Spaceflight (also written space flight) is ballistic flight into or through outer space. Spaceflight can occur with spacecraft with or without humans on board. Examples of human spaceflight include the Russian Soyuz program, the U.S. Space shuttle program, as well as the ongoing International Space Station. Examples of unmanned spaceflight include space probes that leave Earth orbit, as well as satellites in orbit around Earth, such as communications satellites.
  num_concepts_matched: 4
  min_distance:         0.9831049
  avg_distance:         1.060678943991661

  Row 7:
  ──────
  title:                Skylab
  text:                 Skylab was a space station launched and operated by NASA and was the United States' first space station. Skylab orbited the Earth from 1973 to 1979, and included a workshop, a solar observatory, and other systems. It was launched unmanned by a modified Saturn V rocket, with a weight of 169,950 pounds (77 t).  Three manned missions to the station, conducted between 1973 and 1974 using the Apollo Command/Service Module (CSM) atop the smaller Saturn IB, each delivered a three-astronaut crew.
  num_concepts_matched: 4
  min_distance:         0.99155205
  avg_distance:         1.0769911855459213

  Row 8:
  ──────
  title:                Orbital spaceflight
  text:                 An orbital spaceflight (or orbital flight) is a spaceflight in which a spacecraft is placed on a trajectory where it could remain in space for at least one orbit. To do this around the Earth, it must be on a free trajectory which has an altitude at perigee (altitude at closest approach) above 100 kilometers (62 mi) (this is, by at least one convention, the boundary of space).  To remain in orbit at this altitude requires an orbital speed of ~7.8 km/s.
  num_concepts_matched: 4
  min_distance:         1.0075209
  avg_distance:         1.085978478193283

  Row 9:
  ───────
  title:                Dragon (spacecraft)
  text:                 Dragon is a partially reusable spacecraft developed by SpaceX, an American private space transportation company based in Hawthorne, California. Dragon is launched into space by the SpaceX Falcon 9 two-stage-to-orbit launch vehicle, and SpaceX is developing a crewed version called the Dragon V2.During its maiden flight in December 2010, Dragon became the first commercially built and operated spacecraft to be recovered successfully from orbit.
  num_concepts_matched: 4
  min_distance:         1.0222818
  avg_distance:         1.0942841172218323

  Row 10:
  ───────
  title:                Space capsule
  text:                 A space capsule is an often manned spacecraft which has a simple shape for the main section, without any wings or other features to create lift during atmospheric reentry.Capsules have been used in most of the manned space programs to date, including the world's first manned spacecraft Vostok and Mercury, as well as in later Soviet Voskhod, Soyuz, Zond/L1, L3, TKS, US Gemini, Apollo Command Module, Chinese Shenzhou and US, Russian and Indian manned spacecraft currently being developed.
  num_concepts_matched: 4
  min_distance:         1.0262821
  avg_distance:         1.0882147550582886
  ```

  **성능:** Set에 10개 행. 경과 시간: 1.157초. 처리된 데이터: 1,000만 행, 32.76 GB (초당 864만 행, 초당 28.32 GB). 최대 메모리 사용량: **6.05 GiB**.
</details>

### 핵심 인사이트 \{#key-insight\}

결과는 어떨까요? 그냥 좋은 수준이 아닙니다. 놀라울 정도로 좋습니다. 부동소수점 수에서 가수부 전체와 지수부의 절반을 제거하고도 여전히 의미 있는 정보가 남는다는 것은 직관적으로 받아들이기 어렵습니다.

**QBit의 핵심 인사이트는, 중요하지 않은 비트를 무시해도 벡터 검색이 여전히 효과적으로 동작한다는 점입니다.**

메모리 사용량은 **6.05 GB에서 740 MB로** 줄어들었지만, 여전히 뛰어난 의미 기반 검색 품질을 유지합니다!

## 결론 \{#result\}

QBit은 부동소수점 수를 비트 플레인으로 저장하는 컬럼 타입입니다.
이를 사용하면 벡터 검색 시 읽을 비트 수를 선택하여, 데이터를 변경하지 않고도 재현율(recall)과 성능을 조정할 수 있습니다.
각 벡터 검색 방식은 재현율, 정확도, 성능 간의 트레이드오프를 결정하는 고유한 매개변수를 가집니다.
일반적으로 이러한 매개변수는 미리 결정해야 합니다.
만약 잘못 선택하면 많은 시간과 리소스가 낭비되고, 나중에 방향을 바꾸기가 매우 어려워집니다.
QBit을 사용하면 이러한 결정을 사전에 내릴 필요가 없습니다.
쿼리 시점에 정밀도와 속도 간의 균형을 직접 조정하면서, 진행하면서 최적의 균형을 탐색할 수 있습니다.

---

*2025년 10월 28일에 게시된 Raufs Dunamalijevs의 [블로그 게시물](https://clickhouse.com/blog/qbit-vector-search)을 기반으로 작성되었습니다.*