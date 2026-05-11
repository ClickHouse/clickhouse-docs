---
slug: /cloud/managed-postgres/openapi
sidebar_label: 'OpenAPI'
title: 'OpenAPI'
description: 'OpenAPI를 사용하여 Managed Postgres 서비스를 관리합니다'
keywords: ['managed postgres', 'openapi', 'api', 'curl', '튜토리얼', '명령줄']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# Managed Postgres OpenAPI \{#managed-postgres-openapi\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="openapi" />

[ClickHouse OpenAPI](/cloud/manage/cloud-api)를 사용하면 ClickHouse 서비스와 마찬가지로 Managed Postgres 서비스도 프로그래밍 방식으로 제어할 수 있습니다. 이미 [OpenAPI]에 익숙하다면 [API 키]를 발급받아 바로 [Managed
Postgres API 참조][pg-openapi]로 이동하십시오. 그렇지 않다면 아래의 간단한 설명을 따라가십시오.

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
3. **Organization ID** 오른쪽에 있는 복사 아이콘을 클릭하여
   클립보드로 직접 복사합니다.

{/*

  TODO: API가 출시되면 주석 처리를 해제하고 올바른 예시 출력을 삽입하십시오.

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
      "id": "c0d0b15d-5e8b-431d-8943-51b6e233e0b1",
      "name": "고객 조직",
      "createdAt": "2026-03-24T14:21:31Z",
      "privateEndpoints": [],
      "enableCoreDumps": true
    }
  ],
  "requestId": "c128d830-5769-4c82-8235-f79aa69d1ebf",
  "status": 200
  }
  ```

  */ }

## CRUD \{#crud\}

Postgres 서비스의 생명주기를 살펴보겠습니다.

### 생성 \{#create\}

먼저 [create API]를 사용하여 새 항목을 생성합니다. 요청의 JSON 본문에는
다음 속성이 필요합니다:

* `name`: 새 Postgres 서비스의 이름
* `provider`: 클라우드 제공자의 이름
* `region`: 서비스를 배포할 클라우드 제공자 네트워크 내의 영역
* `size`: VM 크기
* `storageSize`: VM의 스토리지 크기

이러한 속성에 사용할 수 있는 값은 [create API] 문서를 참조하십시오. 또한
기본값인 17 대신 Postgres 18을 지정하겠습니다:

```bash
create_data='{
  "name": "my postgres",
  "provider": "aws",
  "region": "us-west-2",
  "postgresVersion": "18",
  "size": "r8gd.large",
  "storageSize": 118
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
    "id": "pg7myrd1j06p3gx4zrm2ze8qz6",
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
PG_ID=pg7myrd1j06p3gx4zrm2ze8qz6
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
  "id": "$PG_ID",
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

{/*

  TODO: 구현되면 내용을 보완합니다.

  OpenAPI는 [patch API]에서 지원하지 않는 속성을 업데이트할 수 있는 추가 엔드포인트를 제공합니다.
  예를 들어 [Postgres configuration]을 업데이트하려면
  [config API]를 사용하세요:

  ```bash
  curl -s --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/config" \
    -d '{"max_connections": "42"}'
  ```

  출력에는 업데이트된 구성이 표시됩니다:

  ```json
  {"max_connections": "42"}
  ```

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
