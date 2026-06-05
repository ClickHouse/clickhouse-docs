---
slug: /cloud/managed-postgres/openapi
sidebar_label: 'OpenAPI'
title: 'Managed Postgres OpenAPI'
description: 'OpenAPI로 Managed Postgres 서비스를 제어할 수 있습니다'
keywords: ['managed postgres', 'openapi', 'api', 'curl', '튜토리얼', '명령줄', '쿼리 인사이트', '느린 쿼리']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.openapi-beta" />

[ClickHouse OpenAPI](/cloud/manage/cloud-api)를 사용하면 ClickHouse 서비스와 마찬가지로 Managed Postgres 서비스도 프로그래밍 방식으로 제어할 수 있습니다. 동일한 API는 서비스 메트릭을 스크레이핑하기 위한 [Prometheus 엔드포인트]도 제공합니다.
이미 [OpenAPI]에 익숙하다면 [API 키]를 발급받아 바로
[Managed Postgres API 참조][pg-openapi]로 이동하십시오. 그렇지 않다면 아래의 간단한 설명을 따라가십시오.

## API 키 \{#api-keys\}

ClickHouse OpenAPI를 사용하려면 인증이 필요합니다. 생성 방법은 [API 키]를
참조하십시오. 그런 다음 다음과 같이 Basic 인증 자격 증명을 사용하십시오:

```bash
KEY_ID=mykeyid
KEY_SECRET=mykeysecret

curl -s --user "$KEY_ID:$KEY_SECRET" https://api.clickhouse.cloud/v1/organizations | jq
```

## 조직 ID \{#organization-id\}

다음으로 조직 ID가 필요합니다.

1. 콘솔 왼쪽 하단에서 조직 이름을 선택합니다.
2. **Organization details**를 선택합니다.
3. **조직 ID** 오른쪽에 있는 복사 아이콘을 클릭하여
   클립보드로 직접 복사합니다.

이제 다음과 같이 요청에 사용할 수 있습니다:

```bash
ORG_ID=myorgid

curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres" | jq
```

이제 첫 번째 Postgres API 요청을 만들었습니다. 위의 [list API]는 조직에 있는 모든
Postgres 서버를 나열합니다. 출력은 다음과
비슷해야 합니다:

```json
{
  "result": [
    {
      "id": "ee2fef9f-b443-8ad0-8c9b-724390cdb826",
      "name": "oltp",
      "provider": "aws",
      "region": "eu-west-2",
      "postgresVersion": "18",
      "size": "r6gd.medium",
      "storageSize": 59,
      "haType": "none",
      "tags": [],
      "isPrimary": true,
      "state": "running",
      "createdAt": "2026-05-25T16:42:16+00:00"
    }
  ],
  "requestId": "c128d830-5769-4c82-8235-f79aa69d1ebf",
  "status": 200
}
```

## CRUD \{#crud\}

Postgres 서비스의 생명주기를 살펴보겠습니다.

### 생성 \{#create\}

먼저 [create API]를 사용하여 새 항목을 생성합니다. 요청의 JSON 본문에는
다음 속성이 필요합니다:

* `name`: 새 Postgres 서비스의 이름
* `provider`: 클라우드 제공자의 이름
* `region`: 서비스를 배포할 클라우드 제공자 네트워크 내의 영역
* `size`: VM 크기

이러한 속성에 사용할 수 있는 값은 [create API] 문서를 참조하십시오. 또한
기본값인 17 대신 Postgres 18을 지정하겠습니다:

```bash
create_data='{
  "name": "my postgres",
  "provider": "aws",
  "region": "us-west-2",
  "postgresVersion": "18",
  "size": "r8gd.large"
}'
```

이제 이 데이터를 사용해 새 인스턴스를 생성합니다. 이때 Content-Type 헤더가 필요합니다:

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres" \
    -d "$create_data" | jq
```

성공 시 새 인스턴스를 생성하고 해당 인스턴스에 대한 정보를 반환하며,
여기에는 연결 데이터가 포함됩니다:

```json
{
  "result": {
    "id": "67b4bc12-8582-45d0-8806-fe9b2e5a54e6",
    "name": "my postgres",
    "provider": "aws",
    "region": "us-west-2",
    "postgresVersion": "18",
    "size": "r8gd.large",
    "storageSize": 118,
    "haType": "none",
    "tags": [],
    "connectionString": "postgres://postgres:vV6cfEr2p_-TzkCDrZOx@my-postgres-6d8d2e3e.pg7myrd1j06p3gx4zrm2ze8qz6.c0.us-west-2.aws.pg.clickhouse-dev.com:5432/postgres?channel_binding=require",
    "username": "postgres",
    "password": "vV6cfEr2p_-TzkCDrZOx",
    "hostname": "my-postgres-6d8d2e3e.pg7myrd1j06p3gx4zrm2ze8qz6.c0.us-west-2.aws.pg.clickhouse-dev.com",
    "isPrimary": true,
    "state": "creating"
  },
  "requestId": "a5957990-dbe5-46fd-b5ce-a7f8f79e50fe",
  "status": 200
}
```

### 조회 \{#read\}

응답의 `id`를 사용해 서비스를 다시 조회하십시오:

```bash
PG_ID=67b4bc12-8582-45d0-8806-fe9b2e5a54e6
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq
```

출력은 생성 시 반환되는 JSON과 비슷하지만, `state`를 계속
확인하세요. 이 값이 `running`으로 변경되면 서버가 준비된 것입니다:

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq .result.state
```

```json
"running"
```

이제 `connectionString` 속성을 사용해 예를 들어
[psql]로 연결할 수 있습니다:

```bash
$ psql "$(
    curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq -r .result.connectionString
)"

psql (18.3)
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off, ALPN: postgresql)
Type "help" for help.

postgres=#
```

[psql]을 종료하려면 `\q`를 입력하세요.

### 업데이트 \{#update\}

[patch API]는 [RFC 7396] JSON Merge Patch를 사용해 Managed
Postgres 서비스의 속성 일부만 업데이트할 수 있습니다. 복잡한
배포에서는 태그가 특히 유용할 수 있으며, 요청에 태그만 보내면 됩니다:

```bash
curl -sX PATCH --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    -d '{"tags": [{"key": "Environment", "value": "production"}]}' \
    | jq .result
```

반환된 데이터에 새 태그가 포함되어 있어야 합니다:

```json
{
  "id": "67b4bc12-8582-45d0-8806-fe9b2e5a54e6",
  "name": "my postgres",
  "provider": "aws",
  "region": "us-west-2",
  "postgresVersion": "18",
  "size": "r8gd.large",
  "storageSize": 118,
  "haType": "none",
  "tags": [
    {
      "key": "Environment",
      "value": "production"
    }
  ],
  "connectionString": "postgres://postgres:vV6cfEr2p_-TzkCDrZOx@my-postgres-6d8d2e3e.$PG_ID.c0.us-west-2.aws.pg.clickhouse-dev.com:5432/postgres?channel_binding=require",
  "username": "postgres",
  "password": "vV6cfEr2p_-TzkCDrZOx",
  "hostname": "my-postgres-6d8d2e3e.$PG_ID.c0.us-west-2.aws.pg.clickhouse-dev.com",
  "isPrimary": true,
  "state": "running"
}
```

OpenAPI는 [patch API]에서 지원하지 않는 속성을 업데이트할 수 있는 추가 엔드포인트를 제공합니다.
예를 들어 [Postgres configuration]을 업데이트하려면
[config API]를 사용하세요:

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/config" \
    -d '{"pgConfig": {"max_connections": "42"}, "pgBouncerConfig": {}}' | jq
```

출력에는 업데이트된 구성과 변경에 따른 영향을 설명하는 메시지가 함께 표시됩니다:

```json
{
  "result":{
    "pgConfig": {
      "max_connections": "42"
    },
    "pgBouncerConfig": {},
    "message": "The changes in the following parameters require a database restart to take effect: max_connections. You can restart the database by using the restart endpoint."
  },
  "requestId":"fdec06f2-66f7-45b4-9f82-0c051aba20aa",
  "status": 200
}
```

{/*

  TODO: API가 제공되면 주석 처리를 해제하고 올바른 예시 출력을 추가합니다.

  추가 업데이트 API는 다음과 같습니다:

  * superuser 비밀번호 재설정
  * Postgres 서비스 이름 변경(호스트 이름도 변경됨)
  * 다음 주요 Postgres 버전으로 업그레이드

  */ }

### 삭제 \{#delete\}

Postgres 서비스를 삭제하려면 [delete API]를 사용합니다.

:::warning
Postgres 서비스를 삭제하면 서비스와 그 안의 모든 데이터가 완전히
삭제됩니다. 서비스를 삭제하기 전에 반드시 백업이 있거나 레플리카를
primary로 승격해 두었는지 확인하십시오.
:::

```bash
curl -sX DELETE --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq
```

성공 시 응답은 예를 들어 상태 코드 200을 반환합니다:

```json
{
  "requestId": "ac9bbffa-e370-410c-8bdd-bd24bf3d7f82",
  "status": 200
}
```

## 모니터링 \{#monitoring\}

Prometheus와 호환되는 2개의 엔드포인트가 Managed Postgres 서비스의 CPU, 메모리, I/O, 연결,
및 트랜잭션 메트릭을 노출합니다. 하나는 조직의 모든 서비스에 대한
메트릭을 반환하고, 다른 하나는 단일 서비스에 대한 메트릭을 반환합니다.
설정 방법은 [Prometheus 엔드포인트] 페이지를, 전체 메트릭 목록은
[메트릭 참고]를 참조하십시오.

## 쿼리 인사이트 \{#query-insights\}

Cloud Console의 [쿼리 인사이트] 탭에서 제공되는 SQL 문별 텔레메트리는 프로그래밍 방식으로도 사용할 수 있습니다. 2개의 엔드포인트가 서비스의 가장 느린 쿼리 패턴을 제공합니다. 하나는 영향도 순으로 모든 패턴을 나열하고, 다른 하나는 최근 실행 내역과 함께 단일 패턴을 반환합니다.

### 느린 쿼리 패턴 목록 \{#list-slow-query-patterns\}

[slow patterns API]는 지정된 시간 범위 동안 관찰된 가장 느린 쿼리
패턴의 집계 메트릭을 반환합니다. 시간 범위는 필수이므로
RFC 3339 타임스탬프 형식의 `from_date`와 `to_date`를 전달하십시오:

```bash
FROM=2026-05-25T00:00:00Z
TO=2026-05-26T00:00:00Z

curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/slowQueryPatterns?from_date=$FROM&to_date=$TO" \
    | jq
```

결과는 기본적으로 `total_duration` 내림차순으로 정렬되며, 비용이 높은 패턴이 먼저 표시됩니다. `sort_by`로 다른 카운터(예:
`p99_duration`, `call_count`, `total_wal_bytes`)를 기준으로 정렬할 수 있고, `sort_order`로 정렬 방향을
반대로 바꿀 수 있습니다. `db_name`, `db_user`,
`db_operation`, `app` 필터로 범위를 좁히고, `limit` 및
`offset`으로 페이지를 나눠 볼 수 있습니다.

각 결과는 리터럴이 제거된 정규화된 패턴 1개이며, 지속 시간은 마이크로초 단위로
표시됩니다:

```json
{
  "result": [
    {
      "queryId": "-4748036479882663975",
      "queryText": "SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2",
      "dbName": "sales",
      "dbUser": "orders_service",
      "dbOperation": "SELECT",
      "app": "orders-api",
      "callCount": 84213,
      "errorCount": 0,
      "totalDurationUs": 1012384556,
      "avgDurationUs": 12021,
      "maxDurationUs": 482915,
      "p50DurationUs": 9874,
      "p95DurationUs": 28431,
      "p99DurationUs": 41200,
      "totalRows": 842130,
      "totalSharedBlksRead": 19284,
      "totalSharedBlksHit": 48217734,
      "totalCpuTimeUs": 938472113,
      "totalWalBytes": 0
    }
  ],
  "requestId": "c128d830-5769-4c82-8235-f79aa69d1ebf",
  "status": 200
}
```

`queryId`는 정규화된 SQL 문(statement)의 부호 있는 64비트 해시이므로
대개 음수입니다. 단일 패턴을 가져오려면 앞의 `-`를 포함해
값을 그대로 다시 전달하십시오.

### 느린 쿼리 패턴 가져오기 \{#get-slow-query-pattern\}

목록 응답의 `queryId`를 [slow pattern API]에 전달하면 해당
패턴의 집계 메트릭과 함께 가장 최근의 개별 실행 기록을 가져올 수 있습니다.
패턴을 식별하는 `db_name`, `db_user`, `db_operation`은
필수입니다:

```bash
QUERY_ID=-4748036479882663975

curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/slowQueryPatterns/$QUERY_ID?db_name=sales&db_user=orders_service&db_operation=SELECT" \
    | jq
```

응답에는 목록 엔드포인트와 동일한 집계가 `aggregate` 아래에 포함되며,
여기에 `recentExecutions` 배열이 추가됩니다. 각 실행에는
공유 및 임시 블록 I/O, CPU 사용자 및 시스템
시간, 병렬 workers, JIT, WAL을 비롯한 실행별 전체 카운터가 포함되며, 이는
콘솔에서 [detail flyout]이 세부적으로 보여주는 카운터와 동일합니다:

```json
{
  "result": {
    "aggregate": {
      "queryId": "-4748036479882663975",
      "queryText": "SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2",
      "dbName": "sales",
      "dbUser": "orders_service",
      "dbOperation": "SELECT",
      "callCount": 84213,
      "avgDurationUs": 12021,
      "p99DurationUs": 41200
    },
    "recentExecutions": [
      {
        "timestamp": "2026-05-25T16:42:09Z",
        "durationUs": 41200,
        "rows": 10,
        "sharedBlksHit": 412,
        "sharedBlksRead": 3,
        "tempBlksWritten": 0,
        "cpuUserTimeUs": 38211,
        "cpuSysTimeUs": 1044,
        "parallelWorkersPlanned": 0,
        "parallelWorkersLaunched": 0,
        "walBytes": 0,
        "serverRole": "primary"
      }
    ]
  },
  "requestId": "a5957990-dbe5-46fd-b5ce-a7f8f79e50fe",
  "status": 200
}
```

예시에서는 간결하게 보여주기 위해 두 객체를 모두 일부만 표시했으며, API는
[per-execution counters]에 문서화된 전체 카운터 세트를 반환합니다.

[ClickHouse OpenAPI]: /cloud/manage/cloud-api "Cloud API"

[OpenAPI]: https://www.openapis.org "OpenAPI Initiative"

[API keys]: /cloud/manage/openapi "API 키 관리"

[pg-openapi]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres "ClickHouse Cloud용 Postgres OpenAPI 사양"

[list API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceGetList "조직의 Postgres 서비스 목록 조회"

[create API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceCreate "새 Postgres 서비스 생성"

[psql]: https://www.postgresql.org/docs/current/app-psql.html "PostgreSQL 문서: psql — PostgreSQL 대화형 터미널"

[patch API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServicePatch "PostgreSQL 서비스 업데이트"

[RFC 7396]: https://www.rfc-editor.org/rfc/rfc7396 "RFC 7396: JSON Merge Patch"

[Postgres configuration]: https://www.postgresql.org/docs/18/runtime-config.html "PostgreSQL 문서: 서버 구성"

[config API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceSetConfig "Postgres 서비스 구성 업데이트"

[delete API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceDelete "PostgreSQL 서비스 삭제"

[Prometheus endpoint]: /cloud/managed-postgres/monitoring/prometheus "Managed Postgres Prometheus 엔드포인트"

[metrics reference]: /cloud/managed-postgres/monitoring/metrics "Managed Postgres 메트릭 참고"

[Query Insights]: /cloud/managed-postgres/monitoring/query-insights "Postgres 쿼리 인사이트"

[detail flyout]: /cloud/managed-postgres/monitoring/query-insights#detail "쿼리 인사이트 세부 정보 플라이아웃"

[per-execution counters]: /cloud/managed-postgres/monitoring/query-insights#counters "쿼리 인사이트 실행별 카운터"

[slow patterns API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/slowQueryPatternsGetList "Postgres 느린 쿼리 패턴 목록 조회"

[slow pattern API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/slowQueryPatternGet "최근 실행 기록과 함께 Postgres 느린 쿼리 패턴 조회"