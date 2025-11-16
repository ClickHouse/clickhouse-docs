---
'slug': '/guides/developer/ttl'
'sidebar_label': 'TTL (Time To Live)'
'sidebar_position': 2
'keywords':
- 'ttl'
- 'time to live'
- 'clickhouse'
- 'old'
- 'data'
'description': 'TTL (time-to-live)은 특정 시간 간격이 지나면 행 또는 컬럼이 이동, 삭제 또는 집계되는 기능을 나타냅니다.'
'title': 'TTL (Time-to-live)로 데이터 관리'
'show_related_blogs': true
'doc_type': 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 데이터 TTL (Time-To-Live) 관리하기

## TTL 개요 {#overview-of-ttl}

TTL (Time-To-Live)은 특정 시간이 경과한 후에 행 또는 열을 이동, 삭제 또는 집계할 수 있는 기능을 의미합니다. "time-to-live"라는 표현이 오래된 데이터를 삭제하는 데만 적용된다고 생각할 수 있지만, TTL에는 여러 사용 사례가 있습니다:

- 오래된 데이터 제거: 예상한 대로, 지정된 시간 간격 후에 행 또는 열을 삭제할 수 있습니다.
- 디스크 간 데이터 이동: 일정 시간이 지난 후, 스토리지 볼륨 간에 데이터를 이동할 수 있습니다 - 핫/웜/콜드 아키텍처를 배포하는 데 유용합니다.
- 데이터 롤업: 오래된 데이터를 삭제하기 전에 다양한 유용한 집계 및 계산으로 롤업할 수 있습니다.

:::note
TTL은 전체 테이블이나 특정 열에 적용할 수 있습니다.
:::

## TTL 구문 {#ttl-syntax}

`TTL` 절은 컬럼 정의 뒤와/또는 테이블 정의 끝에 나타날 수 있습니다. `INTERVAL` 절을 사용하여 시간 길이를 정의합니다 (이는 `Date` 또는 `DateTime` 데이터 타입이어야 함). 예를 들어, 다음 테이블에는 `TTL` 절이 있는 두 개의 컬럼이 있습니다:

```sql
CREATE TABLE example1 (
   timestamp DateTime,
   x UInt32 TTL timestamp + INTERVAL 1 MONTH,
   y String TTL timestamp + INTERVAL 1 DAY,
   z String
)
ENGINE = MergeTree
ORDER BY tuple()
```

- x 컬럼은 타임스탬프 컬럼에서 1개월의 TTL을 가집니다.
- y 컬럼은 타임스탬프 컬럼에서 1일의 TTL을 가집니다.
- 간격이 만료되면 컬럼이 만료됩니다. ClickHouse는 해당 컬럼의 값을 데이터 타입의 기본 값으로 교체합니다. 데이터 파트의 모든 컬럼 값이 만료되면, ClickHouse는 파일 시스템에서 이 컬럼을 삭제합니다.

:::note
TTL 규칙은 변경하거나 삭제할 수 있습니다. 자세한 내용은 [테이블 TTL 조작하기](/sql-reference/statements/alter/ttl.md) 페이지를 참조하세요.
:::

## TTL 이벤트 트리거 {#triggering-ttl-events}

만료된 행의 삭제 또는 집계는 즉시 발생하지 않습니다 - 이것은 테이블 병합 중에만 발생합니다. 활성 병합이 없는 테이블(어떤 이유에서든지)에는 TTL 이벤트를 트리거하는 두 가지 설정이 있습니다:

- `merge_with_ttl_timeout`: 삭제 TTL로 병합을 반복하기 전에 최소 지연 시간(초 단위). 기본값은 14400초 (4시간)입니다.
- `merge_with_recompression_ttl_timeout`: 재압축 TTL로 병합을 반복하기 전에 최소 지연 시간 (삭제 전에 데이터를 롤업하는 규칙). 기본값: 14400초 (4시간).

따라서 기본적으로, TTL 규칙은 4시간마다 적어도 한 번 테이블에 적용됩니다. TTL 규칙을 더 자주 적용해야 한다면 위의 설정을 수정하세요.

:::note
훌륭한 해결책은 아닙니다(또한 자주 사용할 것을 권장하지 않습니다), 하지만 `OPTIMIZE`를 사용하여 병합을 강제로 실행할 수도 있습니다:

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE`는 테이블의 파트를 비정기적으로 병합하며, `FINAL`은 테이블이 이미 단일 파트인 경우 재최적화를 강제합니다.
:::

## 행 삭제하기 {#removing-rows}

특정 시간이 지난 후 테이블에서 전체 행을 제거하려면, 테이블 수준에서 TTL 규칙을 정의하세요:

```sql
CREATE TABLE customers (
timestamp DateTime,
name String,
balance Int32,
address String
)
ENGINE = MergeTree
ORDER BY timestamp
TTL timestamp + INTERVAL 12 HOUR
```

또한, 레코드의 값에 따라 TTL 규칙을 정의하는 것도 가능합니다. 이것은 조건을 지정하여 쉽게 구현할 수 있습니다. 여러 조건이 허용됩니다:

```sql
CREATE TABLE events
(
    `event` String,
    `time` DateTime,
    `value` UInt64
)
ENGINE = MergeTree
ORDER BY (event, time)
TTL time + INTERVAL 1 MONTH DELETE WHERE event != 'error',
    time + INTERVAL 6 MONTH DELETE WHERE event = 'error'
```

## 열 삭제하기 {#removing-columns}

전체 행을 삭제하는 대신, 단지 잔액 및 주소 열만 만료되기를 원한다고 가정해 보겠습니다. `customers` 테이블을 수정하고 두 열의 TTL을 2시간으로 설정합시다:

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```

## 롤업 구현하기 {#implementing-a-rollup}
특정 시간이 지나면 행을 삭제하지만, 보고 목적으로 일부 데이터를 유지하고 싶다고 가정해 보겠습니다. 모든 세부사항은 필요 없고, 역사적 데이터의 몇 가지 집계 결과만 필요합니다. 이를 위해, `TTL` 표현식에 `GROUP BY` 절을 추가하고 집계 결과를 저장할 몇 개의 컬럼을 테이블에 추가합니다.

다음 `hits` 테이블에서 오래된 행을 삭제하되, `hits` 컬럼의 합계와 최대값을 유지하고 싶다고 가정해 보겠습니다. 이 값을 저장할 필드가 필요하며, 합계 및 최대값을 롤업하기 위해 `TTL` 절에 `GROUP BY` 절을 추가해야 합니다:

```sql
CREATE TABLE hits (
   timestamp DateTime,
   id String,
   hits Int32,
   max_hits Int32 DEFAULT hits,
   sum_hits Int64 DEFAULT hits
)
ENGINE = MergeTree
PRIMARY KEY (id, toStartOfDay(timestamp), timestamp)
TTL timestamp + INTERVAL 1 DAY
    GROUP BY id, toStartOfDay(timestamp)
    SET
        max_hits = max(max_hits),
        sum_hits = sum(sum_hits);
```

`hits` 테이블에 대한 몇 가지 주의 사항:

- `TTL` 절의 `GROUP BY` 컬럼은 `PRIMARY KEY`의 접두사여야 하며, 우리는 하루의 시작을 기준으로 결과를 그룹화하고자 합니다. 따라서 `toStartOfDay(timestamp)`가 기본 키에 추가되었습니다.
- 집계 결과를 저장하기 위해 두 개의 필드인 `max_hits`와 `sum_hits`를 추가했습니다.
- `SET` 절이 정의된 방식에 따라, `max_hits`와 `sum_hits`의 기본 값을 `hits`로 설정하는 것이 우리의 로직이 작동하기 위해 필요합니다.

## 핫/웜/콜드 아키텍처 구현하기 {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge/>

:::note
ClickHouse Cloud를 사용 중인 경우, 이 수업의 단계는 적용되지 않습니다. ClickHouse Cloud에서 오래된 데이터를 이동하는 것에 대해 걱정할 필요가 없습니다.
:::

대량의 데이터를 다룰 때 일반적인 관행은 데이터가 오래될수록 그 데이터를 이동하는 것입니다. `TTL` 명령의 `TO DISK` 및 `TO VOLUME` 절을 사용하여 ClickHouse에서 핫/웜/콜드 아키텍처를 구현하기 위한 단계는 다음과 같습니다. (참고로, 핫 및 콜드 방식일 필요는 없으며, 원하는 사용 사례에 따라 TTL을 사용하여 데이터를 이동할 수 있습니다.)

1. `TO DISK` 및 `TO VOLUME` 옵션은 ClickHouse 구성 파일에 정의된 디스크 또는 볼륨의 이름을 나타냅니다. 디스크를 정의하는 `my_system.xml`(또는 어떤 파일명이든 가능)이라는 새 파일을 생성한 후, 디스크를 사용하는 볼륨을 정의합니다. XML 파일을 `/etc/clickhouse-server/config.d/`에 배치하여 시스템에 구성 적용:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <default>
            </default>
           <hot_disk>
              <path>./hot/</path>
           </hot_disk>
           <warm_disk>
              <path>./warm/</path>
           </warm_disk>
           <cold_disk>
              <path>./cold/</path>
           </cold_disk>
        </disks>
        <policies>
            <default>
                <volumes>
                    <default>
                        <disk>default</disk>
                    </default>
                    <hot_volume>
                        <disk>hot_disk</disk>
                    </hot_volume>
                    <warm_volume>
                        <disk>warm_disk</disk>
                    </warm_volume>
                    <cold_volume>
                        <disk>cold_disk</disk>
                    </cold_volume>
                </volumes>
            </default>
        </policies>
    </storage_configuration>
</clickhouse>
```

2. 위의 구성은 ClickHouse가 읽고 쓸 수 있는 폴더를 가리키는 세 개의 디스크를 참조합니다. 볼륨은 하나 이상의 디스크를 포함할 수 있으며, 우리는 세 개의 디스크 각각에 대한 볼륨을 정의했습니다. 디스크를 살펴보겠습니다:

```sql
SELECT name, path, free_space, total_space
FROM system.disks
```

```response
┌─name────────┬─path───────────┬───free_space─┬──total_space─┐
│ cold_disk   │ ./data/cold/   │ 179143311360 │ 494384795648 │
│ default     │ ./             │ 179143311360 │ 494384795648 │
│ hot_disk    │ ./data/hot/    │ 179143311360 │ 494384795648 │
│ warm_disk   │ ./data/warm/   │ 179143311360 │ 494384795648 │
└─────────────┴────────────────┴──────────────┴──────────────┘
```

3. 그리고...볼륨을 확인해 보겠습니다:

```sql
SELECT
    volume_name,
    disks
FROM system.storage_policies
```

```response
┌─volume_name─┬─disks─────────┐
│ default     │ ['default']   │
│ hot_volume  │ ['hot_disk']  │
│ warm_volume │ ['warm_disk'] │
│ cold_volume │ ['cold_disk'] │
└─────────────┴───────────────┘
```

4. 이제 핫, 웜 및 콜드 볼륨 간에 데이터를 이동하는 `TTL` 규칙을 추가할 것입니다:

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. 새로운 `TTL` 규칙이 적용되어야 합니다. 하지만 확인을 위해 강제로 적용할 수 있습니다:

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. `system.parts` 테이블을 사용하여 데이터가 예상한 디스크로 이동했는지 확인하세요:

```sql
Using the system.parts table, view which disks the parts are on for the crypto_prices table:

SELECT
    name,
    disk_name
FROM system.parts
WHERE (table = 'my_table') AND (active = 1)
```

응답은 다음과 같을 것입니다:

```response
┌─name────────┬─disk_name─┐
│ all_1_3_1_5 │ warm_disk │
│ all_2_2_0   │ hot_disk  │
└─────────────┴───────────┘
```
