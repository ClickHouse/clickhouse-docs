---
sidebar_position: 3
sidebar_label: '데이터 선택'
title: 'ClickHouse 데이터 선택'
slug: /guides/writing-queries
description: 'ClickHouse 데이터 선택 방법 알아보기'
keywords: ['SELECT', 'data formats']
show_related_blogs: true
doc_type: 'guide'
---

ClickHouse는 SQL 데이터베이스로, 이미 익숙한 형태의 `SELECT` 쿼리를 작성하여 데이터를 조회할 수 있습니다. 예를 들면 다음과 같습니다:

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
문법과 사용 가능한 절 및 옵션에 대한 자세한 내용은 [SQL Reference](/sql-reference/statements/select)를 참고하십시오.
:::

응답이 보기 좋은 테이블 형식으로 반환됩니다.

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ Insert a lot of rows per batch                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ Sort your data based on your commonly-used queries │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Hello, ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ Granules are the smallest chunks of data read      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4 rows in set. Elapsed: 0.008 sec.
```

ClickHouse에서 지원하는 [다양한 출력 형식](/interfaces/formats#formats-overview) 중 하나를 지정하기 위해 `FORMAT` 절을 추가하십시오:

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```

위 쿼리에서는 출력이 탭으로 구분된 형태로 반환됩니다.

```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 Insert a lot of rows per batch      2022-03-21 00:00:00     1.41421
102 Sort your data based on your commonly-used queries  2022-03-22 00:00:00     2.718
101 Hello, ClickHouse!  2022-03-22 14:04:09     -1
101 Granules are the smallest chunks of data read       2022-03-22 14:04:14     3.14159

4 rows in set. Elapsed: 0.005 sec.
```

:::note
ClickHouse는 70개가 넘는 입력 및 출력 형식을 지원하므로, 수천 개의 함수와 다양한 데이터 형식을 조합해 매우 뛰어나고 빠른 ETL 유사 데이터 변환을 수행할 수 있습니다. 실제로 데이터 변환을 위해 실행 중인 ClickHouse 서버가 필요하지 않으며, 대신 `clickhouse-local` 도구를 사용할 수 있습니다. 자세한 내용은 [`clickhouse-local` 문서 페이지](/interfaces/cli)를 참조하십시오.
:::
