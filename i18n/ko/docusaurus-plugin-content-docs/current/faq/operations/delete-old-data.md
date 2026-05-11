---
slug: /faq/operations/delete-old-data
title: 'ClickHouse 테이블에서 오래된 레코드를 삭제할 수 있습니까?'
toc_hidden: true
toc_priority: 20
description: '이 페이지에서는 ClickHouse 테이블에서 오래된 레코드를 삭제할 수 있는지에 대한 질문에 답변을 제공합니다'
doc_type: 'reference'
keywords: ['데이터 삭제', 'TTL', '데이터 보존', '정리', '데이터 수명주기']
---

# ClickHouse 테이블에서 오래된 레코드를 삭제할 수 있습니까? \{#is-it-possible-to-delete-old-records-from-a-clickhouse-table\}

간단한 대답은 「예」입니다. ClickHouse에는 오래된 데이터를 제거하여 디스크 공간을 확보할 수 있는 여러 메커니즘이 있습니다. 각 메커니즘은 서로 다른 시나리오에 맞게 설계되었습니다.

## TTL \{#ttl\}

ClickHouse에서는 특정 조건이 충족되면 값을 자동으로 삭제하도록 설정할 수 있습니다. 이 조건은 일반적으로 타임스탬프 컬럼에 대한 고정 오프셋처럼, 임의의 컬럼을 기반으로 한 표현식으로 구성됩니다.

이 방식의 핵심 장점은 TTL을 한 번 구성해 두면, 이를 트리거하기 위한 별도의 외부 시스템 없이도 데이터 삭제가 백그라운드에서 자동으로 수행된다는 점입니다.

:::note
TTL은 데이터를 [/dev/null](https://en.wikipedia.org/wiki/Null_device)로 이동하는 데만 사용할 수 있는 것이 아니라, SSD에서 HDD로와 같이 서로 다른 스토리지 시스템 간에 데이터를 이동하는 데에도 사용할 수 있습니다.
:::

[TTL 구성](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)에 대한 자세한 내용은 링크를 참조하십시오.

## DELETE FROM \{#delete-from\}

[DELETE FROM](/sql-reference/statements/delete.md)은 ClickHouse에서 표준 DELETE 쿼리를 실행할 수 있게 합니다. 필터 절에서 대상이 된 행은 삭제된 것으로 표시되며, 이후 결과 집합에서 제외됩니다. 행 정리 작업은 비동기적으로 수행됩니다.

:::note
DELETE FROM은 23.3 버전 이상에서 일반적으로 사용 가능합니다. 이전 버전에서는 실험적 기능이며 다음과 같이 활성화해야 합니다:

```sql
SET allow_experimental_lightweight_delete = true;
```

:::


## ALTER DELETE \{#alter-delete\}

ALTER DELETE는 비동기 배치 작업을 사용해 행을 제거합니다. DELETE FROM과는 달리, ALTER DELETE 이후 배치 작업이 완료되기 전에 실행되는 쿼리에는 삭제 대상 행이 여전히 포함됩니다. 자세한 내용은 [ALTER DELETE](/sql-reference/statements/alter/delete.md) 문서를 참조하십시오.

`ALTER DELETE`는 오래된 데이터를 유연하게 제거하는 데 사용할 수 있습니다. 이를 정기적으로 실행해야 한다면, 외부 시스템을 통해 쿼리를 제출해야 한다는 점이 주요 단점입니다. 또한 삭제해야 할 행이 하나뿐인 경우에도 뮤테이션이 전체 파트를 다시 쓰기 때문에 성능 측면에서 고려해야 할 사항이 있습니다.

이 방식은 ClickHouse 기반 시스템을 [GDPR](https://gdpr-info.eu) 규정을 준수하도록 만드는 가장 일반적인 접근 방식입니다.

[뮤테이션](/sql-reference/statements/alter#mutations)에 대한 자세한 내용은 해당 문서를 참조하십시오.

## DROP PARTITION \{#drop-partition\}

`ALTER TABLE ... DROP PARTITION`은(는) 전체 파티션을 삭제하는 비용 효율적인 방법입니다. 유연성이 높지는 않으며 테이블 생성 시 적절한 파티션 구성 방식이 설정되어야 하지만, 일반적인 사용 사례 대부분을 처리합니다. 정기적으로 사용하려면 뮤테이션과 마찬가지로 외부 시스템에서 실행해야 합니다.

자세한 내용은 [파티션 조작](/sql-reference/statements/alter/partition)을(를) 참조하십시오.

## TRUNCATE \{#truncate\}

테이블의 모든 데이터를 삭제하는 것은 다소 과격한 방법이지만, 일부 상황에서는 오히려 필요한 작업일 수 있습니다.

자세한 내용은 [테이블 비우기(table truncation)](/sql-reference/statements/truncate.md)를 참고하십시오.