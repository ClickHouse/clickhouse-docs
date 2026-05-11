---
description: 'RAM에 기록할 데이터를 버퍼링한 후 주기적으로 다른 테이블로 플러시합니다. 읽기 작업 시에는 버퍼와 다른 테이블에서 동시에 데이터를 읽습니다.'
sidebar_label: 'Buffer'
sidebar_position: 120
slug: /engines/table-engines/special/buffer
title: 'Buffer 테이블 엔진'
doc_type: 'reference'
---

# 버퍼 테이블 엔진 \{#buffer-table-engine\}

데이터를 RAM에 버퍼링한 뒤, 주기적으로 다른 테이블로 플러시합니다. 읽기 작업 시에는 버퍼와 다른 테이블에서 동시에 데이터를 읽습니다.

:::note
버퍼 테이블 엔진의 권장 대안은 [비동기 삽입(asynchronous inserts)](/guides/best-practices/asyncinserts.md) 기능을 활성화하는 것입니다.
:::

```sql
Buffer(database, table, num_layers, min_time, max_time, min_rows, max_rows, min_bytes, max_bytes [,flush_time [,flush_rows [,flush_bytes]]])
```

### 엔진 파라미터 \{#engine-parameters\}

#### `database` \{#database\}

`database` – 데이터베이스 이름입니다. 문자열을 반환하는 `currentDatabase()` 또는 다른 상수 표현식을 사용할 수 있습니다.

#### `table` \{#table\}

`table` – 데이터를 플러시할 대상 테이블입니다.

#### `num_layers` \{#num_layers\}

`num_layers` – 병렬성 계층입니다. 물리적으로 이 테이블은 서로 독립적인 버퍼 `num_layers`개로 표현됩니다.

#### `min_time`, `max_time`, `min_rows`, `max_rows`, `min_bytes`, and `max_bytes` \{#min_time-max_time-min_rows-max_rows-min_bytes-and-max_bytes\}

버퍼에서 데이터를 플러시하기 위한 조건입니다.

### 선택적 엔진 파라미터 \{#optional-engine-parameters\}

#### `flush_time`, `flush_rows`, and `flush_bytes` \{#flush_time-flush_rows-and-flush_bytes\}

백그라운드에서 버퍼에서 데이터를 플러시하기 위한 조건입니다(생략되었거나 0이면 `flush*` 파라미터가 없음을 의미합니다).

Data is flushed from the buffer and written to the destination table if all the `min*` conditions or at least one `max*` condition are met.

또한 하나 이상의 `flush*` 조건이 충족되면 백그라운드에서 플러시가 시작됩니다. 이는 `max*` 조건과 다르며, `flush*`를 사용하면 Buffer 테이블에 대한 `INSERT` 쿼리의 대기 시간을 증가시키지 않도록 별도로 백그라운드 플러시를 구성할 수 있습니다.

#### `min_time`, `max_time`, and `flush_time` \{#min_time-max_time-and-flush_time\}

버퍼에 처음 기록한 시점부터 경과한 시간(초)에 대한 조건입니다.

#### `min_rows`, `max_rows`, and `flush_rows` \{#min_rows-max_rows-and-flush_rows\}

버퍼에 있는 행(row) 개수에 대한 조건입니다.

#### `min_bytes`, `max_bytes`, and `flush_bytes` \{#min_bytes-max_bytes-and-flush_bytes\}

버퍼에 있는 바이트 수에 대한 조건입니다.

쓰기 작업 중에는 데이터가 하나 이상의 임의의 버퍼(`num_layers`로 설정됨)에 삽입됩니다. 또는 삽입할 데이터 부분이 충분히 큰 경우(`max_rows` 또는 `max_bytes`보다 큰 경우) 버퍼를 건너뛰고 데이터를 직접 대상 테이블에 기록합니다.

데이터를 플러시하기 위한 조건은 `num_layers` 각각의 버퍼에 대해 개별적으로 계산됩니다. 예를 들어, `num_layers = 16`이고 `max_bytes = 100000000`이면 최대 RAM 사용량은 1.6 GB입니다.

예:

```sql
CREATE TABLE merge.hits_buffer AS merge.hits ENGINE = Buffer(merge, hits, 1, 10, 100, 10000, 1000000, 10000000, 100000000)
```

`merge.hits`와 동일한 구조를 가지며 Buffer 엔진을 사용하는 `merge.hits_buffer` 테이블을 생성합니다. 이 테이블에 데이터를 기록하면 데이터가 RAM에 버퍼링되었다가 나중에 &#39;merge.hits&#39; 테이블로 기록됩니다. 단일 버퍼가 생성되며, 다음 조건 중 하나라도 충족되면 데이터가 플러시됩니다.

* 마지막 플러시 이후 100초가 지났을 때(`max_time`) 또는
* 100만 행이 기록되었을 때(`max_rows`) 또는
* 100 MB의 데이터가 기록되었을 때(`max_bytes`) 또는
* 10초가 지났고(`min_time`), 10,000개의 행(`min_rows`)과 10 MB(`min_bytes`)의 데이터가 기록되었을 때

예를 들어, 단 한 행만 기록되었더라도 100초가 지나면 어떤 경우든 플러시됩니다. 하지만 많은 행이 기록된 경우에는 데이터가 더 빨리 플러시됩니다.

서버가 중지될 때 `DROP TABLE` 또는 `DETACH TABLE`을 실행하면, 버퍼링된 데이터도 대상 테이블로 플러시됩니다.

데이터베이스 및 테이블 이름에 작은따옴표로 둘러싼 빈 문자열을 설정할 수 있습니다. 이는 대상 테이블이 없음을 나타냅니다. 이 경우 데이터 플러시 조건에 도달하면 버퍼는 단순히 비워집니다. 이는 메모리에 일정 시간 범위의 데이터를 유지하는 데 유용할 수 있습니다.

Buffer 테이블에서 읽을 때는 버퍼와 대상 테이블(있는 경우) 양쪽의 데이터가 모두 처리됩니다.
Buffer 테이블은 인덱스를 지원하지 않는다는 점에 유의하십시오. 즉, 버퍼 안의 데이터는 전부 스캔되므로 버퍼가 큰 경우 느려질 수 있습니다. (하위 테이블의 데이터에 대해서는 해당 테이블이 지원하는 인덱스가 사용됩니다.)

Buffer 테이블의 컬럼 집합이 하위 테이블의 컬럼 집합과 일치하지 않는 경우, 두 테이블에 모두 존재하는 컬럼의 부분 집합만 삽입됩니다.

Buffer 테이블과 하위 테이블에서 컬럼 중 하나의 타입이 일치하지 않으면, 서버 로그에 오류 메시지가 기록되고 버퍼가 비워집니다.
버퍼가 플러시될 때 하위 테이블이 존재하지 않아도 동일한 현상이 발생합니다.

:::note
2021년 10월 26일 이전에 배포된 릴리스에서 Buffer 테이블에 대해 ALTER를 실행하면 `Block structure mismatch` 오류가 발생합니다([#15117](https://github.com/ClickHouse/ClickHouse/issues/15117) 및 [#30565](https://github.com/ClickHouse/ClickHouse/pull/30565) 참고). 따라서 Buffer 테이블을 삭제한 뒤 다시 생성하는 방법만 사용할 수 있습니다. Buffer 테이블에 대해 ALTER를 실행하기 전에, 사용하는 릴리스에서 이 오류가 수정되었는지 확인하십시오.
:::

서버가 비정상적으로 재시작되면 버퍼 안의 데이터는 손실됩니다.

`FINAL` 및 `SAMPLE`은 Buffer 테이블에 대해 올바르게 동작하지 않습니다. 이러한 조건은 대상 테이블로 전달되지만, 버퍼 안의 데이터를 처리하는 데에는 사용되지 않습니다. 이러한 기능이 필요하다면 Buffer 테이블은 쓰기 전용으로만 사용하고, 읽기는 대상 테이블에서만 수행할 것을 권장합니다.

Buffer 테이블에 데이터를 추가할 때는 버퍼 중 하나가 잠깁니다. 이로 인해 테이블에서 읽기 작업이 동시에 수행되고 있는 경우 지연이 발생합니다.

Buffer 테이블에 삽입된 데이터는 하위 테이블에 다른 순서와 다른 블록으로 기록될 수 있습니다. 이로 인해 Buffer 테이블을 사용해 CollapsingMergeTree에 올바르게 쓰기는 어렵습니다. 문제를 피하기 위해 `num_layers`를 1로 설정할 수 있습니다.

대상 테이블이 복제된 테이블(Replicated Table)인 경우 Buffer 테이블에 쓰기를 수행하면 복제된 테이블의 일부 기대되는 특성이 손실됩니다. 행의 순서와 데이터 파트의 크기가 무작위로 변경되면 데이터 중복 제거(deduplication)가 중단되므로, 복제된 테이블에 대해 신뢰할 수 있는 「정확히 한 번」 쓰기를 보장할 수 없습니다.

이러한 단점 때문에 Buffer 테이블 사용은 드문 경우에만 권장됩니다.

Buffer 테이블은 단위 시간 동안 많은 수의 서버에서 너무 많은 INSERT가 들어와 삽입 전에 데이터를 버퍼링할 수 없고, 그 결과 INSERT가 충분히 빠르게 실행될 수 없을 때 사용합니다.

Buffer 테이블에 대해서도 데이터를 한 행(row)씩 삽입하는 것은 의미가 없습니다. 이렇게 하면 초당 수천 행 정도의 속도만 나오며, 더 큰 블록 단위로 데이터를 삽입하면 초당 100만 행이 넘는 속도를 얻을 수 있습니다.
