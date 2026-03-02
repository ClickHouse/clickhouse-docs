---
slug: /guides/developer/ttl
sidebar_label: 'TTL (Time To Live)'
sidebar_position: 2
keywords: ['ttl', 'time to live', 'clickhouse', '오래된', '데이터']
description: 'TTL (time-to-live)은 일정 시간이 경과한 후 행 또는 컬럼을 이동, 삭제하거나 롤업할 수 있는 기능을 의미합니다.'
title: 'TTL (time-to-live)로 데이터 관리하기'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TTL(time-to-live)을 사용한 데이터 관리 \{#manage-data-with-ttl-time-to-live\}

## TTL 개요 \{#overview-of-ttl\}

TTL (time-to-live)은 일정 시간이 지나면 행 또는 컬럼을 이동, 삭제 또는 롤업할 수 있는 기능입니다. 「time-to-live」라는 표현 때문에 오래된 데이터를 삭제하는 데만 적용되는 것처럼 들리지만, TTL에는 다음과 같은 여러 가지 활용 사례가 있습니다.

- 오래된 데이터 제거: 지정된 시간 간격이 지나면 행 또는 컬럼을 삭제할 수 있습니다.
- 디스크 간 데이터 이동: 일정 시간이 지나면 스토리지 볼륨 간에 데이터를 이동할 수 있어 hot/warm/cold 아키텍처를 구축하는 데 유용합니다.
- 데이터 롤업: 오래된 데이터를 삭제하기 전에 다양한 유용한 집계와 계산으로 롤업할 수 있습니다.

:::note
TTL은 전체 테이블이나 특정 컬럼에 적용할 수 있습니다.
:::

## TTL 구문 \{#ttl-syntax\}

`TTL` 절은 컬럼 정의 뒤와/또는 테이블 정의의 끝에 올 수 있습니다. `INTERVAL` 절을 사용하여 기간을 정의합니다. 이때 기준이 되는 값은 `Date` 또는 `DateTime` 데이터 타입이어야 합니다. 예를 들어, 다음 테이블에는
`TTL` 절이 있는 컬럼이 두 개 있습니다:

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

* x 컬럼은 timestamp 컬럼을 기준으로 TTL(time to live)이 1개월입니다.
* y 컬럼은 timestamp 컬럼을 기준으로 TTL(time to live)이 1일입니다.
* 기간이 경과하면 컬럼이 만료됩니다. ClickHouse는 컬럼 값을 해당 데이터 타입의 기본값으로 대체합니다. 데이터 파트에서 이 컬럼의 모든 값이 만료되면 ClickHouse는 파일 시스템의 해당 데이터 파트에서 이 컬럼을 삭제합니다.

:::note
TTL 규칙은 변경하거나 삭제할 수 있습니다. 자세한 내용은 [Manipulations with Table TTL](/sql-reference/statements/alter/ttl.md) 페이지를 참고하십시오.
:::

:::tip 모범 사례
테이블 수준 TTL을 사용하여 오래된 행을 제거하는 경우, TTL 표현식에 사용된 것과 동일한 시간 필드의 날짜 또는 월을 기준으로 **테이블을 파티션하는 것**을 권장합니다.

ClickHouse는 개별 행을 삭제하는 것보다 전체 파티션을 훨씬 더 효율적으로 삭제할 수 있습니다.
파티션 키가 TTL 표현식과 일치하도록 설정되면, ClickHouse는 만료된 행을 제거하기 위해 데이터 파트를 다시 쓰는 대신 만료 시 전체 파티션을 한 번에 삭제할 수 있습니다.

TTL 주기에 따라 파티션 단위를 선택하십시오:

* TTL이 일/주 단위인 경우: `toYYYYMMDD(date_field)`를 사용하여 일 단위로 파티션합니다.
* TTL이 월/년 단위인 경우: `toYYYYMM(date_field)` 또는 `toStartOfMonth(date_field)`를 사용하여 월 단위로 파티션합니다.
  :::


## TTL 이벤트 트리거하기 \{#triggering-ttl-events\}

만료된 행을 삭제하거나 집계하는 작업은 즉시 이루어지지 않으며, 테이블 머지(merge) 시점에만 수행됩니다. 어떤 이유로든 테이블에서 머지가 원활히 발생하지 않는 경우, TTL 이벤트를 트리거하는 설정이 두 가지 있습니다:

* `merge_with_ttl_timeout`: delete TTL이 적용된 머지를 다시 수행하기 전까지 대기하는 최소 지연 시간(초)입니다. 기본값은 14400초(4시간)입니다.
* `merge_with_recompression_ttl_timeout`: recompression TTL(데이터를 삭제하기 전에 롤업하는 규칙)이 적용된 머지를 다시 수행하기 전까지 대기하는 최소 지연 시간(초)입니다. 기본값은 14400초(4시간)입니다.

따라서 기본적으로 TTL 규칙은 최소 4시간에 한 번씩 테이블에 적용됩니다. TTL 규칙을 더 자주 적용해야 하는 경우 위 설정값을 수정하면 됩니다.

:::note
좋은 해결책은 아니며 자주 사용할 것을 권장하지는 않지만, `OPTIMIZE`를 사용하여 강제로 머지를 수행할 수도 있습니다:

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE`는 테이블의 파트에 대해 예약되지 않은 머지 작업을 수행하며, `FINAL`은 테이블이 이미 단일 파트인 경우에도 다시 최적화되도록 강제합니다.
:::


## 행 제거 \{#removing-rows\}

특정 시간이 지난 후 테이블에서 전체 행을 제거하려면 테이블 수준에서 TTL 규칙을 정의합니다:

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

또한 레코드의 값에 기반한 TTL 규칙을 정의할 수도 있습니다.
이는 WHERE 절에 조건을 지정하여 쉽게 구현할 수 있습니다.
여러 조건을 사용할 수 있습니다:

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


## 컬럼 제거 \{#removing-columns\}

전체 행을 삭제하는 대신 balance와 address 컬럼만 만료되도록 하고 싶다고 가정해 보겠습니다. `customers` 테이블을 수정하여 두 컬럼 모두에 2시간 TTL을 추가합니다:

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```


## 롤업 구현하기 \{#implementing-a-rollup\}

일정 시간이 지나면 행은 삭제하되, 보고 목적을 위해 일부 데이터는 보존하고 싶다고 가정합니다. 모든 세부 정보가 필요한 것은 아니고, 과거 데이터의 집계된 결과 몇 가지만 유지하면 됩니다. 이는 `TTL` 표현식에 `GROUP BY` 절을 추가하고, 집계 결과를 저장하기 위한 몇 개의 컬럼을 테이블에 추가하여 구현할 수 있습니다.

다음의 `hits` 테이블에서 오래된 행은 삭제하되, 행을 제거하기 전에 `hits` 컬럼의 합계와 최대값은 유지하고 싶다고 가정합니다. 이러한 값을 저장할 컬럼이 필요하며, 합계와 최대값을 롤업하도록 `TTL` 절에 `GROUP BY` 절을 추가해야 합니다.

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

`hits` 테이블에 대한 몇 가지 참고 사항입니다.

* `TTL` 절의 `GROUP BY` 컬럼은 `PRIMARY KEY`의 접두사(prefix)여야 하며, 결과를 하루의 시작 시점별로 그룹화하려는 목적이 있습니다. 따라서 `toStartOfDay(timestamp)`가 `PRIMARY KEY`에 추가되었습니다.
* 집계 결과를 저장하기 위해 `max_hits`와 `sum_hits` 두 필드를 추가했습니다.
* `SET` 절이 정의된 방식에 따라 로직이 올바르게 동작하도록 `max_hits`와 `sum_hits`의 기본값을 `hits`로 설정하는 것이 필요합니다.


## Hot/Warm/Cold 아키텍처 구현 \{#implementing-a-hotwarmcold-architecture\}

<CloudNotSupportedBadge />

:::note
ClickHouse Cloud를 사용하는 경우, 이 섹션의 단계는 적용되지 않습니다. ClickHouse Cloud에서는 오래된 데이터를 이동하는 것에 대해 신경 쓸 필요가 없습니다.
:::

대량의 데이터를 다룰 때 일반적으로 사용하는 방법 중 하나는 데이터가 오래될수록 위치를 옮기는 것입니다. 여기서는 ClickHouse에서 `TTL` 명령의 `TO DISK` 및 `TO VOLUME` 절을 사용하여 hot/warm/cold 아키텍처를 구현하는 단계를 설명합니다. (참고로 반드시 hot과 cold만 구분해야 하는 것은 아니며, 보유한 어떤 사용 사례든 데이터를 이동하기 위해 TTL을 사용할 수 있습니다.)

1. `TO DISK` 및 `TO VOLUME` 옵션은 ClickHouse 설정 파일에 정의된 디스크 또는 볼륨 이름을 참조합니다. 디스크를 정의하는 `my_system.xml`(또는 다른 이름의 파일)을 새로 만든 다음, 해당 디스크를 사용하는 볼륨을 정의하십시오. 그런 다음 XML 파일을 `/etc/clickhouse-server/config.d/`에 배치하여 설정이 시스템에 적용되도록 합니다:

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

2. 위 설정에서는 ClickHouse가 읽고 쓸 수 있는 폴더를 가리키는 세 개의 디스크를 참조합니다. 볼륨에는 하나 이상의 디스크가 포함될 수 있으며, 여기서는 세 개의 디스크 각각에 대해 하나의 볼륨을 정의했습니다. 이제 디스크를 확인해 보겠습니다:

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

3. 이제 볼륨을 확인해 보겠습니다:

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

4. 이제 hot, warm, cold 볼륨 간에 데이터가 이동되도록 하는 `TTL` 규칙을 추가합니다:

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. 새로 추가한 `TTL` 규칙은 자동으로 적용되지만, 확실히 하려면 다음과 같이 강제로 적용할 수 있습니다:

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. `system.parts` 테이블을 조회하여 데이터가 의도한 디스크로 이동했는지 확인합니다.

```sql
Using the system.parts table, view which disks the parts are on for the crypto_prices table:

SELECT
    name,
    disk_name
FROM system.parts
WHERE (table = 'my_table') AND (active = 1)
```

응답은 다음과 같습니다:

```response
┌─name────────┬─disk_name─┐
│ all_1_3_1_5 │ warm_disk │
│ all_2_2_0   │ hot_disk  │
└─────────────┴───────────┘
```
