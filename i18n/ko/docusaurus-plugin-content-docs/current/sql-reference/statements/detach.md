---
description: 'DETACH 문서'
sidebar_label: 'DETACH'
sidebar_position: 43
slug: /sql-reference/statements/detach
title: 'DETACH SQL 문'
doc_type: 'reference'
---

서버가 테이블, materialized view, 딕셔너리 또는 데이터베이스의 존재를 더 이상 인식하지 않도록 합니다.

**구문**

```sql
DETACH TABLE|VIEW|DICTIONARY|DATABASE [IF EXISTS] [db.]name [ON CLUSTER cluster] [PERMANENTLY] [SYNC]
```

분리(detach) 작업은 테이블, materialized view, 딕셔너리 또는 데이터베이스의 데이터나 메타데이터를 삭제하지 않습니다. 개체가 `PERMANENTLY` 옵션 없이 분리되었다면, 다음에 서버를 실행할 때 서버는 메타데이터를 읽고 해당 테이블/view/딕셔너리/데이터베이스를 다시 불러옵니다. 개체가 `PERMANENTLY` 옵션으로 분리되었다면 자동으로 다시 불러오지 않습니다.

테이블, 딕셔너리 또는 데이터베이스가 영구적으로 분리되었는지 여부와 관계없이, 두 경우 모두 [ATTACH](../../sql-reference/statements/attach.md) 쿼리를 사용하여 다시 연결(attach)할 수 있습니다.
시스템 로그 테이블(`query_log`, `text_log` 등)은 다시 attach 할 수도 있습니다. 다른 시스템 테이블은 다시 attach 할 수 없습니다. 다음 서버 실행 시 서버가 이러한 테이블을 다시 불러옵니다.

`ATTACH MATERIALIZED VIEW`는 ( `SELECT` 없이) 축약 문법으로는 동작하지 않지만, `ATTACH TABLE` 쿼리를 사용하여 attach 할 수 있습니다.

이미 (일시적으로) 분리된 테이블은 영구적으로 분리할 수 없다는 점에 유의하십시오. 하지만 다시 attach 한 다음, 다시 영구적으로 분리할 수는 있습니다.

또한 분리된 테이블을 [DROP](../../sql-reference/statements/drop.md#drop-table) 하거나, 영구적으로 분리된 테이블과 동일한 이름으로 [CREATE TABLE](../../sql-reference/statements/create/table.md) 하거나, [RENAME TABLE](../../sql-reference/statements/rename.md) 쿼리로 다른 테이블로 교체할 수는 없습니다.

`SYNC` 수정자는 지연 없이 동작을 실행합니다.

**예시**

테이블 생성:

쿼리:

```sql
CREATE TABLE test ENGINE = Log AS SELECT * FROM numbers(10);
SELECT * FROM test;
```

결과:

```text
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘
```

테이블 분리:

쿼리:

```sql
DETACH TABLE test;
SELECT * FROM test;
```

결과:

```text
Received exception from server (version 21.4.1):
Code: 60. DB::Exception: Received from localhost:9000. DB::Exception: Table default.test does not exist.
```

:::note
ClickHouse Cloud에서는 `PERMANENTLY` 절을 사용해야 합니다(예: `DETACH TABLE <table> PERMANENTLY`). 이 절을 사용하지 않으면 클러스터가 재시작될 때(예: 업그레이드 중) 테이블이 다시 연결됩니다.
:::

**함께 보기**

* [Materialized View](/sql-reference/statements/create/view#materialized-view)
* [Dictionaries](./create/dictionary/overview.md)
