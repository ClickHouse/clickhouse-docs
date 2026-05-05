---
slug: /guides/developer/mutations
sidebar_label: '데이터 업데이트 및 삭제'
sidebar_position: 1
keywords: ['UPDATE', 'DELETE', '뮤테이션']
title: 'ClickHouse 데이터 업데이트 및 삭제'
description: 'ClickHouse에서 데이터 업데이트 및 삭제 작업을 수행하는 방법을 설명합니다'
show_related_blogs: false
doc_type: 'guide'
---

# 뮤테이션을 사용한 ClickHouse 데이터 업데이트 및 삭제 \{#updating-and-deleting-clickhouse-data-with-mutations\}

ClickHouse는 대량 분석 워크로드에 최적화되어 있지만, 특정 상황에서는 기존 데이터를 수정하거나 삭제할 수 있습니다.
이러한 작업은 「뮤테이션」이라고 하며 `ALTER TABLE` 명령을 사용하여 실행됩니다.

:::tip
자주 업데이트해야 하는 경우 ClickHouse의 [중복 제거](../developer/deduplication.md) 기능 사용을 고려하십시오.
이를 사용하면 뮤테이션 이벤트를 생성하지 않고도 행을 업데이트 및/또는 삭제할 수 있습니다. 또는 [경량 업데이트](/docs/sql-reference/statements/update)나
[경량한 삭제](/guides/developer/lightweight-delete)를 사용하십시오.
:::

## 데이터 업데이트 \{#updating-data\}

테이블의 행을 업데이트하려면 `ALTER TABLE...UPDATE` 명령을 사용하십시오:

```sql
ALTER TABLE [<database>.]<table> UPDATE <column> = <expression> WHERE <filter_expr>
```

`<expression>`은 `<filter_expr>` 조건을 만족하는 컬럼의 새로운 값입니다. `<expression>`은 컬럼과 동일한 데이터 타입이거나, `CAST` 연산자를 사용하여 동일한 데이터 타입으로 변환할 수 있어야 합니다. `<filter_expr>`은 각 행에 대해 `UInt8`(0 또는 0이 아닌 값)을 반환해야 합니다. 여러 개의 `UPDATE <column>` SQL 문은 쉼표로 구분하여 하나의 `ALTER TABLE` 명령으로 결합할 수 있습니다.

**예시**:

1. 다음과 같은 뮤테이션을 사용하면 딕셔너리 조회를 통해 `visitor_ids`를 새로운 값으로 대체하여 업데이트할 수 있습니다:

   ```sql
   ALTER TABLE website.clicks
   UPDATE visitor_id = getDict('visitors', 'new_visitor_id', visitor_id)
   WHERE visit_date < '2022-01-01'
   ```

2. 하나의 명령에서 여러 값을 수정하는 것이 여러 명령으로 나누는 것보다 더 효율적일 수 있습니다:

   ```sql
   ALTER TABLE website.clicks
   UPDATE url = substring(url, position(url, '://') + 3), visitor_id = new_visit_id
   WHERE visit_date < '2022-01-01'
   ```

3. 뮤테이션은 세그먼트된 테이블에 대해 `ON CLUSTER`로 실행할 수 있습니다:

   ```sql
   ALTER TABLE clicks ON CLUSTER main_cluster
   UPDATE click_count = click_count / 2
   WHERE visitor_id ILIKE '%robot%'
   ```

:::note
프라이머리 키 또는 정렬 키의 일부인 컬럼은 업데이트할 수 없습니다.
:::

## 데이터 삭제 \{#deleting-data\}

`ALTER TABLE` 명령을 사용하여 행을 삭제할 수 있습니다:

```sql
ALTER TABLE [<database>.]<table> DELETE WHERE <filter_expr>
```

`<filter_expr>`은 데이터의 각 행에 대해 UInt8 값을 반환해야 합니다.

**예시**

1. 컬럼 값이 배열에 포함된 행을 삭제합니다:
   ```sql
   ALTER TABLE website.clicks DELETE WHERE visitor_id in (253, 1002, 4277)
   ```

2. 이 쿼리는 무엇을 변경합니까?
   ```sql
   ALTER TABLE clicks ON CLUSTER main_cluster DELETE WHERE visit_date < '2022-01-02 15:00:00' AND page_id = '573'
   ```

:::note
테이블의 모든 데이터를 삭제하려면 `TRUNCATE TABLE [<database].]<table>` 명령을 사용하는 것이 더 효율적입니다. 이 명령은 `ON CLUSTER`로도 실행할 수 있습니다.
:::

자세한 내용은 [`DELETE` SQL 문](/sql-reference/statements/delete.md) 문서 페이지를 참조하십시오.

## 경량한 삭제 \{#lightweight-deletes\}

행을 삭제하는 또 다른 방법은 `DELETE FROM` 명령을 사용하는 것으로, 이를 **경량한 삭제(lightweight delete)**라고 합니다. 삭제된 행은 즉시 삭제된 것으로 표시되며 이후 실행되는 모든 쿼리에서 자동으로 필터링되므로, 파트 병합을 기다리거나 `FINAL` 키워드를 사용할 필요가 없습니다. 데이터 정리는 백그라운드에서 비동기적으로 수행됩니다.

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [WHERE expr]
```

예를 들어, 다음 쿼리는 `Title` 컬럼에 `hello` 텍스트가 포함된 모든 행을 `hits` 테이블에서 삭제합니다:

```sql
DELETE FROM hits WHERE Title LIKE '%hello%';
```

경량한 삭제에 대한 몇 가지 참고 사항은 다음과 같습니다.

* 이 기능은 `MergeTree` 테이블 엔진 계열에서만 지원됩니다.
* 경량한 삭제는 기본적으로 동기식으로 동작하며, 모든 레플리카가 삭제를 처리할 때까지 대기합니다. 이 동작은 [`lightweight_deletes_sync` 설정](/operations/settings/settings#lightweight_deletes_sync)으로 제어됩니다.
