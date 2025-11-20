---
'slug': '/faq/operations/delete-old-data'
'title': 'ClickHouse 테이블에서 오래된 기록을 삭제할 수 있는가?'
'toc_hidden': true
'toc_priority': 20
'description': '이 페이지는 ClickHouse 테이블에서 오래된 기록을 삭제할 수 있는지에 대한 질문에 답합니다.'
'doc_type': 'reference'
'keywords':
- 'delete data'
- 'TTL'
- 'data retention'
- 'cleanup'
- 'data lifecycle'
---


# 오래된 레코드를 ClickHouse 테이블에서 삭제하는 것이 가능한가요? {#is-it-possible-to-delete-old-records-from-a-clickhouse-table}

짧은 대답은 “예”입니다. ClickHouse는 오래된 데이터를 제거하여 디스크 공간을 확보할 수 있는 여러 가지 메커니즘을 가지고 있습니다. 각 메커니즘은 다양한 시나리오를 위해 설계되었습니다.

## TTL {#ttl}

ClickHouse는 특정 조건이 발생할 때 자동으로 값을 삭제할 수 있도록 합니다. 이 조건은 대개 특정 타임스탬프 컬럼의 정적 오프셋을 기반으로 구성된 표현식으로 설정됩니다.

이 접근 방식의 주요 장점은 TTL이 구성된 후에는 외부 시스템이 필요 없이 데이터 제거가 백그라운드에서 자동으로 발생한다는 것입니다.

:::note
TTL은 [/dev/null](https://en.wikipedia.org/wiki/Null_device)뿐만 아니라 SSD에서 HDD와 같은 다른 저장 시스템 간에 데이터 이동에도 사용할 수 있습니다.
:::

[TTL 구성에 대한 자세한 내용](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)을 확인하십시오.

## DELETE FROM {#delete-from}

[DELETE FROM](/sql-reference/statements/delete.md)은 ClickHouse에서 표준 DELETE 쿼리를 실행할 수 있도록 합니다. 필터 절에서 지정된 행은 삭제로 표시되고, 향후 결과 집합에서 제거됩니다. 행의 정리는 비동기적으로 발생합니다.

:::note
DELETE FROM는 일반적으로 23.3 버전 이상에서 사용할 수 있습니다. 이전 버전에서는 실험적인 기능이며, 다음과 같이 활성화해야 합니다:
```sql
SET allow_experimental_lightweight_delete = true;
```
:::

## ALTER DELETE {#alter-delete}

ALTER DELETE는 비동기 배치 작업을 사용하여 행을 제거합니다. DELETE FROM와 달리 ALTER DELETE 이후 및 배치 작업이 완료되기 전 실행된 쿼리에는 삭제 대상으로 지정된 행이 포함됩니다. 더 자세한 내용은 [ALTER DELETE](/sql-reference/statements/alter/delete.md) 문서를 참조하십시오.

`ALTER DELETE`를 통해 유연하게 오래된 데이터를 제거할 수 있습니다. 정기적으로 수행해야 하는 경우, 주요 단점은 쿼리를 제출할 외부 시스템이 필요하다는 점입니다. 또한, 변형이 단일 행만 삭제하는 경우에도 전체 파트를 다시 작성하므로 성능 고려사항이 있습니다.

이 방법은 ClickHouse를 기반으로 시스템을 [GDPR](https://gdpr-info.eu)에 준수하도록 만드는 가장 일반적인 접근 방식입니다.

[변형에 대한 자세한 내용](/sql-reference/statements/alter#mutations)을 확인하십시오.

## DROP PARTITION {#drop-partition}

`ALTER TABLE ... DROP PARTITION`는 전체 파티션을 삭제하는 비용 효율적인 방법을 제공합니다. 유연성이 떨어지고 테이블 생성 시 적절한 파티셔닝 스킴이 구성되어야 하지만, 여전히 대부분의 일반적인 경우를 처리할 수 있습니다. 변형의 경우 정기적으로 사용하기 위해 외부 시스템에서 실행해야 합니다.

[파티션 조작에 대한 자세한 내용](/sql-reference/statements/alter/partition)을 확인하십시오.

## TRUNCATE {#truncate}

테이블에서 모든 데이터를 삭제하는 것은 다소 급진적이지만, 어떤 경우에는 정확히 필요한 경우일 수 있습니다.

[테이블 자르기에 대한 자세한 내용](/sql-reference/statements/truncate.md)을 확인하십시오.
