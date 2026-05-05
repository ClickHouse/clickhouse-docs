---
description: 'Check Table에 대한 문서'
sidebar_label: 'CHECK TABLE'
sidebar_position: 41
slug: /sql-reference/statements/check-table
title: 'CHECK TABLE SQL 문'
doc_type: 'reference'
---

ClickHouse에서 `CHECK TABLE` 쿼리는 특정 테이블 또는 해당 파티션에 대해 유효성 검사를 수행하는 데 사용됩니다. 이 쿼리는 체크섬 및 기타 내부 데이터 구조를 검증하여 데이터의 무결성을 보장합니다.

특히 실제 파일 크기를 서버에 저장된 예상 값과 비교합니다. 파일 크기가 저장된 값과 일치하지 않으면 데이터가 손상되었음을 의미합니다. 이는 예를 들어 쿼리 실행 중 시스템 장애(크래시)로 인해 발생할 수 있습니다.

:::warning
`CHECK TABLE` 쿼리는 테이블의 모든 데이터를 읽고 일부 리소스를 점유할 수 있어, 리소스 사용량이 많을 수 있습니다.
이 쿼리를 실행하기 전에 성능과 리소스 사용량에 미칠 잠재적 영향을 고려해야 합니다.
이 쿼리는 시스템의 성능을 향상시키지 않으며, 수행하려는 작업을 확실히 이해하지 못한 경우 실행하지 않아야 합니다.
:::

## 구문 \{#syntax\}

쿼리의 기본 구문은 다음과 같습니다.

```sql
CHECK TABLE table_name [PARTITION partition_expression | PART part_name] [FORMAT format] [SETTINGS check_query_single_value_result = (0|1) [, other_settings]]
```

* `table_name`: 확인하려는 테이블의 이름을 지정합니다.
* `partition_expression`: (선택 사항) 테이블의 특정 파티션을 확인하려는 경우 이 표현식을 사용하여 파티션을 지정할 수 있습니다.
* `part_name`: (선택 사항) 테이블의 특정 파트를 확인하려는 경우 문자열 리터럴을 추가하여 파트 이름을 지정할 수 있습니다.
* `FORMAT format`: (선택 사항) 결과의 출력 형식을 지정할 수 있습니다.
* `SETTINGS`: (선택 사항) 추가 설정을 지정할 수 있습니다.
  * (선택 사항): [check&#95;query&#95;single&#95;value&#95;result](../../operations/settings/settings#check_query_single_value_result): 이 설정은 출력이 상세(`0`) 형식인지 요약(`1`) 형식인지 제어합니다.
  * 다른 설정도 적용할 수 있습니다. 결과에 대해 결정적인 순서를 요구하지 않는 경우, 쿼리 속도를 높이기 위해 `max_threads`를 1보다 큰 값으로 설정할 수 있습니다.

쿼리 응답은 `check_query_single_value_result` 설정 값에 따라 달라집니다.
`check_query_single_value_result = 1`인 경우 `result` 컬럼 하나와 단일 행만 반환됩니다. 이 행의 값은 무결성 검사가 통과되면 `1`, 데이터가 손상되었으면 `0`입니다.

`check_query_single_value_result = 0`인 경우 쿼리는 다음 컬럼을 반환합니다:

* `part_path`: 데이터 파트의 경로 또는 파일 이름을 나타냅니다.
  * `is_passed`: 이 파트에 대한 검사가 성공하면 1, 그렇지 않으면 0을 반환합니다.
  * `message`: 오류 또는 성공 메시지와 같이 검사와 관련된 추가 메시지입니다.

`CHECK TABLE` 쿼리는 다음 테이블 엔진을 지원합니다:

* [Log](../../engines/table-engines/log-family/log.md)
* [TinyLog](../../engines/table-engines/log-family/tinylog.md)
* [StripeLog](../../engines/table-engines/log-family/stripelog.md)
* [MergeTree family](../../engines/table-engines/mergetree-family/mergetree.md)

다른 테이블 엔진을 사용하는 테이블에서 실행하면 `NOT_IMPLEMENTED` 예외가 발생합니다.

`*Log` 패밀리의 엔진은 장애 발생 시 자동 데이터 복구를 제공하지 않습니다. `CHECK TABLE` 쿼리를 사용하여 데이터 손실을 적시에 추적하십시오.


## 예제 \{#examples\}

기본적으로 `CHECK TABLE` 쿼리는 테이블의 전반적인 검사 결과를 보여줍니다:

```sql
CHECK TABLE test_table;
```

```text
┌─result─┐
│      1 │
└────────┘
```

각 데이터 파트별 검사 상태를 확인하려면 `check_query_single_value_result` 설정을 사용할 수 있습니다.

또한 테이블의 특정 파티션만 검사하려면 `PARTITION` 키워드를 사용할 수 있습니다.

```sql
CHECK TABLE t0 PARTITION ID '201003'
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0
```

출력:

```text
┌─part_path────┬─is_passed─┬─message─┐
│ 201003_7_7_0 │         1 │         │
│ 201003_3_3_0 │         1 │         │
└──────────────┴───────────┴─────────┘
```

마찬가지로 `PART` 키워드를 사용하여 테이블의 특정 파트를 조회할 수 있습니다.

```sql
CHECK TABLE t0 PART '201003_7_7_0'
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0
```

출력:

```text
┌─part_path────┬─is_passed─┬─message─┐
│ 201003_7_7_0 │         1 │         │
└──────────────┴───────────┴─────────┘
```

part가 존재하지 않으면 쿼리 실행 시 오류가 발생합니다.

```sql
CHECK TABLE t0 PART '201003_111_222_0'
```

```text
DB::Exception: No such data part '201003_111_222_0' to check in table 'default.t0'. (NO_SUCH_DATA_PART)
```


### &#39;Corrupted&#39; 결과를 받는 경우 \{#receiving-a-corrupted-result\}

:::warning
면책 조항: 여기에서 설명하는 절차, 특히 데이터 디렉터리에서 파일을 수동으로 조작하거나 직접 삭제하는 작업은 실험용 또는 개발 환경에서만 사용해야 합니다. 데이터 손실이나 기타 의도하지 않은 결과를 초래할 수 있으므로 프로덕션 서버에서는 절대로 시도하지 마십시오.
:::

기존 체크섬 파일을 제거합니다:

```bash
rm /var/lib/clickhouse-server/data/default/t0/201003_3_3_0/checksums.txt
```

````sql
CHECK TABLE t0 PARTITION ID '201003'
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0


Output:

```text
┌─part_path────┬─is_passed─┬─message──────────────────────────────────┐
│ 201003_7_7_0 │         1 │                                          │
│ 201003_3_3_0 │         1 │ Checksums recounted and written to disk. │
└──────────────┴───────────┴──────────────────────────────────────────┘
````

checksums.txt 파일이 없더라도 복구할 수 있습니다. 특정 파티션에 대해 `CHECK TABLE` 명령을 실행하는 동안 체크섬이 다시 계산되고 다시 기록되며, 상태는 계속해서 &#39;is&#95;passed = 1&#39;로 보고됩니다.

`CHECK ALL TABLES` 쿼리를 사용하여 기존의 모든 `(Replicated)MergeTree` 테이블을 한 번에 점검할 수 있습니다.

```sql
CHECK ALL TABLES
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0
```

```text
┌─database─┬─table────┬─part_path───┬─is_passed─┬─message─┐
│ default  │ t2       │ all_1_95_3  │         1 │         │
│ db1      │ table_01 │ all_39_39_0 │         1 │         │
│ default  │ t1       │ all_39_39_0 │         1 │         │
│ db1      │ t1       │ all_39_39_0 │         1 │         │
│ db1      │ table_01 │ all_1_6_1   │         1 │         │
│ default  │ t1       │ all_1_6_1   │         1 │         │
│ db1      │ t1       │ all_1_6_1   │         1 │         │
│ db1      │ table_01 │ all_7_38_2  │         1 │         │
│ db1      │ t1       │ all_7_38_2  │         1 │         │
│ default  │ t1       │ all_7_38_2  │         1 │         │
└──────────┴──────────┴─────────────┴───────────┴─────────┘
```


## 데이터가 손상된 경우 {#if-the-data-is-corrupted}

테이블이 손상된 경우 손상되지 않은 데이터를 다른 테이블로 복사할 수 있습니다. 이를 위해서는 다음과 같이 합니다:

1.  손상된 테이블과 동일한 구조를 가진 새 테이블을 생성합니다. 이를 위해 쿼리 `CREATE TABLE <new_table_name> AS <damaged_table_name>`를 실행합니다.
2.  다음 쿼리를 단일 스레드에서 처리하도록 `max_threads` 값을 1로 설정합니다. 이를 위해 쿼리 `SET max_threads = 1`를 실행합니다.
3.  쿼리 `INSERT INTO <new_table_name> SELECT * FROM <damaged_table_name>`를 실행합니다. 이 쿼리는 손상된 테이블에서 손상되지 않은 데이터를 다른 테이블로 복사합니다. 손상된 부분 이전의 데이터만 복사됩니다.
4.  `max_threads` 값을 초기화하기 위해 `clickhouse-client`를 재시작합니다.