---
'description': 'Detach에 대한 문서'
'sidebar_label': 'DETACH'
'sidebar_position': 43
'slug': '/sql-reference/statements/detach'
'title': 'DETACH 문'
'doc_type': 'reference'
---

서버가 테이블, 물리화된 뷰, 딕셔너리 또는 데이터베이스의 존재를 "잊어버리게" 합니다.

**구문**

```sql
DETACH TABLE|VIEW|DICTIONARY|DATABASE [IF EXISTS] [db.]name [ON CLUSTER cluster] [PERMANENTLY] [SYNC]
```

분리(detach)는 테이블, 물리화된 뷰, 딕셔너리 또는 데이터베이스의 데이터나 메타데이터를 삭제하지 않습니다. 엔티티가 `PERMANENTLY` 분리되지 않았다면, 다음 서버 시작 시 서버는 메타데이터를 읽고 테이블/뷰/딕셔너리/데이터베이스를 다시 기억합니다. 엔티티가 `PERMANENTLY` 분리되었다면, 자동으로 기억하지 않습니다.

테이블, 딕셔너리 또는 데이터베이스가 영구적으로 분리되었는지 여부와 관계없이, 두 경우 모두 [ATTACH](../../sql-reference/statements/attach.md) 쿼리를 사용하여 다시 연결할 수 있습니다. 시스템 로그 테이블도(예: `query_log`, `text_log` 등) 다시 연결할 수 있습니다. 다른 시스템 테이블은 다시 연결할 수 없습니다. 다음 서버 시작 시 서버는 해당 테이블을 다시 기억할 것입니다.

`ATTACH MATERIALIZED VIEW`는 짧은 구문( `SELECT` 없이)과 함께 작동하지 않지만, `ATTACH TABLE` 쿼리를 사용하여 연결할 수 있습니다.

이미 분리된(일시적) 테이블을 영구적으로 분리할 수는 없습니다. 하지만 다시 연결한 후에 영구적으로 분리할 수 있습니다.

또한, 분리된 테이블을 [DROP](../../sql-reference/statements/drop.md#drop-table) 할 수 없거나, 영구적으로 분리된 것과 동일한 이름으로 [CREATE TABLE](../../sql-reference/statements/create/table.md) 할 수 없으며, [RENAME TABLE](../../sql-reference/statements/rename.md) 쿼리를 사용하여 다른 테이블로 교체할 수 없습니다.

`SYNC` 수정자는 지연 없이 액션을 실행합니다.

**예제**

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
ClickHouse Cloud에서 사용자는 `PERMANENTLY` 절을 사용해야 합니다. 예를 들어 `DETACH TABLE <table> PERMANENTLY`와 같이 사용합니다. 이 절이 사용되지 않으면 클러스터 재시작 시 테이블이 다시 연결됩니다. 예를 들어 업그레이드 중에 그렇습니다.
:::

**참고**

- [물리화된 뷰](/sql-reference/statements/create/view#materialized-view)
- [딕셔너리](../../sql-reference/dictionaries/index.md)
