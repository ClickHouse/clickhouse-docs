---
'sidebar_position': 3
'sidebar_label': '데이터 선택하기'
'title': 'ClickHouse 데이터 선택하기'
'slug': '/guides/writing-queries'
'description': 'ClickHouse 데이터 선택하기에 대해 알아보세요'
'keywords':
- 'SELECT'
- 'data formats'
'show_related_blogs': true
'doc_type': 'guide'
---

ClickHouse는 SQL 데이터베이스이며, 이미 익숙한 동일한 유형의 `SELECT` 쿼리를 작성하여 데이터를 쿼리할 수 있습니다. 예를 들면:

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
구문 및 사용 가능한 절과 옵션에 대한 자세한 내용은 [SQL 참조](../sql-reference/statements/select/index.md)를 참조하십시오.
:::

응답이 깔끔한 테이블 형식으로 반환된다는 점에 주목하세요:

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ Insert a lot of rows per batch                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ Sort your data based on your commonly-used queries │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Hello, ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ Granules are the smallest chunks of data read      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4 rows in set. Elapsed: 0.008 sec.
```

`FORMAT` 절을 추가하여 [ClickHouse의 많은 지원 출력 형식 중 하나](../interfaces/formats.md)를 지정합니다:
```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```

위 쿼리에서 출력은 탭으로 구분된 형식으로 반환됩니다:

```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 Insert a lot of rows per batch      2022-03-21 00:00:00     1.41421
102 Sort your data based on your commonly-used queries  2022-03-22 00:00:00     2.718
101 Hello, ClickHouse!  2022-03-22 14:04:09     -1
101 Granules are the smallest chunks of data read       2022-03-22 14:04:14     3.14159

4 rows in set. Elapsed: 0.005 sec.
```

:::note
ClickHouse는 70개 이상의 입력 및 출력 형식을 지원하므로, 수천 개의 함수와 모든 데이터 형식 사이에서 ClickHouse를 사용하여 인상적이고 빠른 ETL 유사 데이터 변환을 수행할 수 있습니다. 사실, 데이터를 변환하기 위해 ClickHouse 서버가 실행 중일 필요도 없습니다. `clickhouse-local` 도구를 사용할 수 있습니다. 자세한 내용은 [`clickhouse-local` 문서 페이지](../operations/utilities/clickhouse-local.md)를 참조하십시오.
:::
