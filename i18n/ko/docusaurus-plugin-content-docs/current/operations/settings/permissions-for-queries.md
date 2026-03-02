---
description: '쿼리 권한 설정.'
sidebar_label: '쿼리 권한'
sidebar_position: 58
slug: /operations/settings/permissions-for-queries
title: '쿼리 권한'
doc_type: 'reference'
---

# 쿼리에 대한 권한 \{#permissions-for-queries\}

ClickHouse에서 쿼리는 다음과 같은 여러 유형으로 나눌 수 있습니다.

1.  데이터 읽기 쿼리: `SELECT`, `SHOW`, `DESCRIBE`, `EXISTS`.
2.  데이터 쓰기 쿼리: `INSERT`, `OPTIMIZE`.
3.  설정 변경 쿼리: `SET`, `USE`.
4.  [DDL](https://en.wikipedia.org/wiki/Data_definition_language) 쿼리: `CREATE`, `ALTER`, `RENAME`, `ATTACH`, `DETACH`, `DROP` `TRUNCATE`.
5.  `KILL QUERY`.

다음 설정은 쿼리 유형별로 사용자 권한을 제어합니다.

## readonly \{#readonly\}

데이터 읽기, 데이터 쓰기, 설정 변경 쿼리에 대한 권한을 제한합니다.

1로 설정하면 다음이 허용됩니다:

- 모든 종류의 읽기 쿼리(예: SELECT 및 이와 동등한 쿼리).
- 세션 컨텍스트만 수정하는 쿼리(예: USE).

2로 설정하면 위 조건에 더해 다음이 허용됩니다:

- SET 및 CREATE TEMPORARY TABLE

  :::tip
  EXISTS, DESCRIBE, EXPLAIN, SHOW PROCESSLIST 등의 쿼리는 시스템 테이블에서 SELECT만 실행하므로 SELECT와 동등합니다.
  :::

가능한 값:

- 0 — 읽기, 쓰기 및 설정 변경 쿼리가 모두 허용됩니다.
- 1 — 데이터 읽기 쿼리만 허용됩니다.
- 2 — 데이터 읽기 및 설정 변경 쿼리가 허용됩니다.

기본값: 0

:::note
`readonly = 1`로 설정한 후에는 현재 세션에서 사용자는 `readonly` 및 `allow_ddl` 설정을 변경할 수 없습니다.

[HTTP 인터페이스](/interfaces/http)에서 `GET` 메서드를 사용할 때는 `readonly = 1`이 자동으로 설정됩니다. 데이터를 수정하려면 `POST` 메서드를 사용해야 합니다.

`readonly = 1` 설정은 사용자가 설정을 변경하는 것을 금지합니다. 특정 설정만 변경하지 못하도록 금지하는 방법도 있습니다. 또한 `readonly = 1` 제약 하에서 특정 설정만 변경할 수 있도록 허용하는 방법도 있습니다. 자세한 내용은 [설정 제약(constraints on settings)](../../operations/settings/constraints-on-settings.md)을 참고하십시오.
:::

## allow_ddl \{#allow_ddl\}

[DDL](https://en.wikipedia.org/wiki/Data_definition_language) 쿼리를 허용하거나 허용하지 않도록 설정합니다.

설정 가능한 값:

- 0 — DDL 쿼리를 허용하지 않습니다.
- 1 — DDL 쿼리를 허용합니다.

기본값: 1

:::note
현재 세션에서 `allow_ddl = 0`인 경우 `SET allow_ddl = 1`을 실행할 수 없습니다.
:::

:::note KILL QUERY
`KILL QUERY`는 readonly 및 allow_ddl 설정 값의 모든 조합에서 실행할 수 있습니다.
:::