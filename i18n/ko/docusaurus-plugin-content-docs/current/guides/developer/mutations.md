---
'slug': '/guides/developer/mutations'
'sidebar_label': '데이터 업데이트 및 삭제'
'sidebar_position': 1
'keywords':
- 'UPDATE'
- 'DELETE'
- 'mutations'
'title': 'ClickHouse 데이터 업데이트 및 삭제'
'description': 'ClickHouse에서 업데이트 및 삭제 작업을 수행하는 방법을 설명합니다.'
'show_related_blogs': false
'doc_type': 'guide'
---


# ClickHouse 데이터 업데이트 및 삭제를 위한 변형

ClickHouse는 대량의 분석 작업을 위해 설계되었지만, 특정 상황에서는 기존 데이터를 수정하거나 삭제하는 것이 가능합니다. 이러한 작업은 "변형(mutations)"으로 라벨이 붙으며, `ALTER TABLE` 명령어를 사용하여 실행됩니다.

:::tip
자주 업데이트할 필요가 있는 경우, ClickHouse에서 [중복 제거](../developer/deduplication.md)를 사용하는 것을 고려하세요. 이는 변형 이벤트를 발생시키지 않고 행을 업데이트 및/또는 삭제할 수 있습니다. 또는 [경량 업데이트](/docs/sql-reference/statements/update) 또는 [경량 삭제](/guides/developer/lightweight-delete)를 사용하세요.
:::

## 데이터 업데이트 {#updating-data}

`ALTER TABLE...UPDATE` 명령어를 사용하여 테이블의 행을 업데이트합니다:

```sql
ALTER TABLE [<database>.]<table> UPDATE <column> = <expression> WHERE <filter_expr>
```

`<expression>`은 `<filter_expr>`이 만족하는 컬럼의 새 값입니다. `<expression>`은 컬럼과 동일한 데이터 유형이어야 하며, `CAST` 연산자를 사용하여 동일한 데이터 유형으로 변환 가능해야 합니다. `<filter_expr>`는 데이터의 각 행에 대해 `UInt8` (0 또는 0이 아님) 값을 반환해야 합니다. 여러 `UPDATE <column>` 문을 단일 `ALTER TABLE` 명령어에 쉼표로 구분하여 결합할 수 있습니다.

**예시**:

 1. 이런 변형을 사용하면 딕셔너리 조회를 통해 `visitor_ids`를 새로운 것으로 업데이트할 수 있습니다:

```sql
ALTER TABLE website.clicks
UPDATE visitor_id = getDict('visitors', 'new_visitor_id', visitor_id)
WHERE visit_date < '2022-01-01'
```

2. 하나의 명령어로 여러 값을 수정하는 것이 여러 명령어보다 효율적일 수 있습니다:

```sql
ALTER TABLE website.clicks
UPDATE url = substring(url, position(url, '://') + 3), visitor_id = new_visit_id
WHERE visit_date < '2022-01-01'
```

3. 변형은 샤드된 테이블에 대해 `ON CLUSTER`로 실행될 수 있습니다:

```sql
ALTER TABLE clicks ON CLUSTER main_cluster
UPDATE click_count = click_count / 2
WHERE visitor_id ILIKE '%robot%'
```

:::note
기본 키 또는 정렬 키의 일부인 컬럼은 업데이트할 수 없습니다.
:::

## 데이터 삭제 {#deleting-data}

`ALTER TABLE` 명령어를 사용하여 행을 삭제합니다:

```sql
ALTER TABLE [<database>.]<table> DELETE WHERE <filter_expr>
```

`<filter_expr>`는 데이터의 각 행에 대해 UInt8 값을 반환해야 합니다.

**예시**

1. 배열의 값이 포함된 컬럼에 대한 레코드를 삭제합니다:
```sql
ALTER TABLE website.clicks DELETE WHERE visitor_id in (253, 1002, 4277)
```

2. 이 쿼리는 무엇을 변경합니까?
```sql
ALTER TABLE clicks ON CLUSTER main_cluster DELETE WHERE visit_date < '2022-01-02 15:00:00' AND page_id = '573'
```

:::note
테이블의 모든 데이터를 삭제하려면 `TRUNCATE TABLE [<database].]<table>` 명령어를 사용하는 것이 더 효율적입니다. 이 명령어는 `ON CLUSTER`에서 실행될 수 있습니다.
:::

더 자세한 내용은 [`DELETE` 문서](/sql-reference/statements/delete.md) 페이지를 참조하세요.

## 경량 삭제 {#lightweight-deletes}

행을 삭제하는 또 다른 옵션은 `DELETE FROM` 명령어를 사용하는 것입니다. 이는 **경량 삭제**라고 불립니다. 삭제된 행은 즉시 삭제된 것으로 표시되며, 모든 후속 쿼리에서 자동으로 필터링됩니다. 그래서 파트 병합을 기다리거나 `FINAL` 키워드를 사용할 필요가 없습니다. 데이터 정리는 백그라운드에서 비동기적으로 발생합니다.

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [WHERE expr]
```

예를 들어, 다음 쿼리는 `Title` 컬럼에 `hello` 텍스트가 포함된 `hits` 테이블의 모든 행을 삭제합니다:

```sql
DELETE FROM hits WHERE Title LIKE '%hello%';
```

경량 삭제에 대한 몇 가지 메모:
- 이 기능은 `MergeTree` 테이블 엔진 계열에서만 사용할 수 있습니다.
- 경량 삭제는 기본적으로 동기식으로 설정되어 있으며, 모든 복제본이 삭제를 처리할 때까지 기다립니다. 이 동작은 [`lightweight_deletes_sync` 설정](/operations/settings/settings#lightweight_deletes_sync)으로 제어됩니다.
