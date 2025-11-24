---
'description': 'RAM에 기록할 데이터를 버퍼링하고, 주기적으로 다른 테이블로 플러싱합니다. 읽기 작업 중에는 버퍼와 다른 테이블에서
  동시에 데이터를 읽습니다.'
'sidebar_label': '버퍼'
'sidebar_position': 120
'slug': '/engines/table-engines/special/buffer'
'title': '버퍼 테이블 엔진'
'doc_type': 'reference'
---


# 버퍼 테이블 엔진

RAM에 데이터를 버퍼링하고 주기적으로 다른 테이블에 플러시합니다. 읽기 작업 중에는 버퍼와 다른 테이블에서 동시에 데이터를 읽습니다.

:::note
버퍼 테이블 엔진에 대한 추천 대안은 [비동기 삽입](/guides/best-practices/asyncinserts.md)을 활성화하는 것입니다.
:::

```sql
Buffer(database, table, num_layers, min_time, max_time, min_rows, max_rows, min_bytes, max_bytes [,flush_time [,flush_rows [,flush_bytes]]])
```

### 엔진 매개변수 {#engine-parameters}

#### `database` {#database}

`database` – 데이터베이스 이름. `currentDatabase()` 또는 문자열을 반환하는 다른 상수 표현식을 사용할 수 있습니다.

#### `table` {#table}

`table` – 데이터를 플러시할 테이블입니다.

#### `num_layers` {#num_layers}

`num_layers` – 병렬성 계층. 물리적으로, 테이블은 `num_layers`개의 독립적인 버퍼로 표현됩니다.

#### `min_time`, `max_time`, `min_rows`, `max_rows`, `min_bytes`, 및 `max_bytes` {#min_time-max_time-min_rows-max_rows-min_bytes-and-max_bytes}

버퍼에서 데이터를 플러시하는 조건입니다.

### 선택적 엔진 매개변수 {#optional-engine-parameters}

#### `flush_time`, `flush_rows`, 및 `flush_bytes` {#flush_time-flush_rows-and-flush_bytes}

백그라운드에서 버퍼에서 데이터를 플러시하는 조건입니다 (생략되거나 0이면 `flush*` 매개변수 없음).

모든 `min*` 조건이 충족되거나 적어도 하나의 `max*` 조건이 충족되면 버퍼에서 데이터를 플러시하고 목적지 테이블에 작성합니다.

또한, 적어도 하나의 `flush*` 조건이 충족되면 백그라운드에서 플러시가 시작됩니다. 이것은 `max*`와 다릅니다. 왜냐하면 `flush*`를 사용하면 Buffer 테이블에 대한 `INSERT` 쿼리의 지연을 추가하지 않기 위해 백그라운드 플러시를 별도로 구성할 수 있기 때문입니다.

#### `min_time`, `max_time`, 및 `flush_time` {#min_time-max_time-and-flush_time}

버퍼에 첫 번째 쓰기가 발생한 시점부터 초 단위의 시간 조건입니다.

#### `min_rows`, `max_rows`, 및 `flush_rows` {#min_rows-max_rows-and-flush_rows}

버퍼에 있는 행 수에 대한 조건입니다.

#### `min_bytes`, `max_bytes`, 및 `flush_bytes` {#min_bytes-max_bytes-and-flush_bytes}

버퍼에 있는 바이트 수에 대한 조건입니다.

쓰기 작업 중에는 데이터가 하나 이상의 랜덤 버퍼(`num_layers`로 구성됨)에 삽입됩니다. 또는 삽입할 데이터 파트가 충분히 크면(`max_rows` 또는 `max_bytes` 초과), 버퍼를 생략하고 직접 목적지 테이블에 기록됩니다.

데이터를 플러시하는 조건은 각 `num_layers` 버퍼에 대해 별도로 계산됩니다. 예를 들어, `num_layers = 16` 및 `max_bytes = 100000000`인 경우, 최대 RAM 소비량은 1.6GB입니다.

예제:

```sql
CREATE TABLE merge.hits_buffer AS merge.hits ENGINE = Buffer(merge, hits, 1, 10, 100, 10000, 1000000, 10000000, 100000000)
```

`merge.hits_buffer` 테이블을 `merge.hits`와 동일한 구조로 생성하고 버퍼 엔진을 사용합니다. 이 테이블에 쓰는 동안 데이터는 RAM에 버퍼링되고 이후에 'merge.hits' 테이블에 기록됩니다. 단일 버퍼가 생성되며, 아래의 조건 중 하나라도 충족되면 데이터가 플러시됩니다:
- 마지막 플러시 이후 100초가 경과(`max_time`)했거나
- 100만 행이 삽입되었거나(`max_rows`) 
- 100MB의 데이터가 삽입되었거나(`max_bytes`) 
- 10초가 경과(`min_time`)하고 10,000행(`min_rows`) 및 10MB(`min_bytes`)의 데이터가 삽입되었습니다.

예를 들어, 단 하나의 행이 삽입된 경우, 100초가 지나면 플러시됩니다. 하지만 여러 행이 삽입된 경우, 데이터는 더 빨리 플러시됩니다.

서버가 중지되면 `DROP TABLE` 또는 `DETACH TABLE`을 사용하여 버퍼링된 데이터도 목적지 테이블에 플러시됩니다.

데이터베이스 및 테이블 이름에 빈 문자열을 단일 따옴표로 설정할 수 있습니다. 이는 목적지 테이블이 없음을 나타냅니다. 이 경우 데이터 플러시 조건이 충족되면 버퍼가 간단히 비워집니다. 이는 메모리에 데이터 창을 유지하는 데 유용할 수 있습니다.

버퍼 테이블에서 읽을 때 데이터는 버퍼와 목적지 테이블(있는 경우)에서 모두 처리됩니다.
버퍼 테이블은 인덱스를 지원하지 않습니다. 즉, 버퍼의 데이터는 완전히 스캔되며, 이는 대형 버퍼에 대해 느릴 수 있습니다. (하위 테이블의 데이터에 대해서는 지원되는 인덱스가 사용됩니다.)

버퍼 테이블의 컬럼 집합이 하위 테이블의 컬럼 집합과 일치하지 않으면 두 테이블 모두에 존재하는 컬럼의 하위 집합이 삽입됩니다.

버퍼 테이블의 컬럼 중 하나와 하위 테이블의 타입이 일치하지 않으면 서버 로그에 오류 메시지가 기록되고 버퍼가 비워집니다. 버퍼가 플러시될 때 하위 테이블이 존재하지 않으면 같은 일이 발생합니다.

:::note
2021년 10월 26일 이전의 릴리스에서 버퍼 테이블의 ALTER를 실행하면 `Block structure mismatch` 오류가 발생합니다 (참조: [#15117](https://github.com/ClickHouse/ClickHouse/issues/15117) 및 [#30565](https://github.com/ClickHouse/ClickHouse/pull/30565)), 따라서 버퍼 테이블을 삭제한 후 다시 생성하는 것이 유일한 방법입니다. 버퍼 테이블에서 ALTER를 실행하기 전에 이 오류가 귀하의 릴리스에서 수정되었는지 확인하십시오.
:::

서버가 비정상적으로 재시작되면 버퍼의 데이터가 손실됩니다.

`FINAL` 및 `SAMPLE`은 버퍼 테이블에서 올바르게 작동하지 않습니다. 이러한 조건은 목적지 테이블로 전달되지만 버퍼의 데이터 처리에는 사용되지 않습니다. 이러한 기능이 필요하다면, Buffer 테이블은 쓰기 전용으로 사용하고 읽기는 목적지 테이블에서 수행할 것을 권장합니다.

버퍼 테이블에 데이터를 추가할 때, 하나의 버퍼가 잠금됩니다. 이로 인해 테이블에서 동시에 수행되는 읽기 작업이 지연됩니다.

버퍼 테이블에 삽입된 데이터는 하위 테이블에 다른 순서와 다른 블록으로 저장될 수 있습니다. 이로 인해 Buffer 테이블을 CollapsingMergeTree에 올바르게 쓰는 것이 어렵습니다. 문제를 피하기 위해 `num_layers`를 1로 설정할 수 있습니다.

목적지 테이블이 복제되는 경우, 버퍼 테이블에 기록할 때 일부 예상된 복제 테이블의 특성이 손실됩니다. 행의 순서와 데이터 파트의 크기에 대한 무작위 변경으로 인해 데이터 중복 제거가 작동하지 않게 되므로, 복제 테이블에 안정적인 '정확히 한 번' 쓰기가 불가능합니다.

이러한 단점으로 인해, 우리는 버퍼 테이블을 사용하도록 권장하는 경우가 드뭅니다.

버퍼 테이블은 단위 시간 내에 많은 서버로부터 너무 많은 INSERT를 수신하고, 데이터가 삽입 전에 버퍼링할 수 없을 때 사용됩니다. 즉, INSERT가 충분히 빠르게 실행될 수 없습니다.

버퍼 테이블의 경우에도 한 번에 한 행씩 데이터를 삽입하는 것은 의미가 없습니다. 이는 초당 수천 행의 속도만을 생성하지만, 더 큰 데이터 블록을 삽입하면 초당 백만 행 이상을 생성할 수 있습니다.
