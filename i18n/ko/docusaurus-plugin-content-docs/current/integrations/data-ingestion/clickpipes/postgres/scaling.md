---
title: "OpenAPI를 통한 DB ClickPipes 확장"
description: "OpenAPI를 통해 Postgres ClickPipes를 확장하는 방법"
slug: /integrations/clickpipes/postgres/scaling
sidebar_label: "확장"
doc_type: "guide"
keywords:
  ["clickpipes", "postgresql", "CDC", "데이터 수집", "실시간 동기화"]
integration:
  - support_level: "core"
  - category: "clickpipes"
---

:::caution 대부분의 사용자는 이 API가 필요하지 않습니다
DB ClickPipes의 기본 구성은 대부분의 워크로드를 별도 설정 없이 처리할 수 있도록 설계되어 있습니다. 워크로드에 맞춰 확장이 필요하다고 판단되면 [지원 케이스](https://clickhouse.com/support/program)를 등록하십시오. 사용 사례에 가장 적합한 설정을 안내해 드립니다.
:::

확장 API는 다음과 같은 경우에 유용할 수 있습니다:

* 대규모 초기 로드(4 TB 초과)
* 중간 규모의 데이터를 가능한 한 빠르게 마이그레이션해야 하는 경우
* 동일한 서비스에서 8개를 초과하는 CDC ClickPipes를 운영해야 하는 경우

확장을 시도하기 전에 다음 사항을 고려하십시오:

* 소스 DB에 충분한 가용 용량이 있는지 확인
* ClickPipe를 생성할 때 먼저 [초기 로드 병렬 처리와 파티셔닝](/integrations/clickpipes/postgres/parallel_initial_load)을 조정
* CDC 지연의 원인이 될 수 있는 소스 측 [장시간 실행 트랜잭션](/integrations/clickpipes/postgres/sync_control#transactions)이 있는지 확인

**확장 규모를 늘리면 ClickPipes 컴퓨팅 비용도 그에 비례해 증가합니다.** 초기 로드만을 위해 확장하는 경우, 스냅샷이 완료된 후에는 예상치 못한 비용이 발생하지 않도록 반드시 다시 축소하십시오. 요금에 대한 자세한 내용은 [Postgres CDC Pricing](/cloud/reference/billing/clickpipes)을 참조하십시오.

## 이 절차를 위한 사전 준비 사항 \{#prerequisites\}

시작하기 전에 다음이 필요합니다.

1. 대상 ClickHouse Cloud 서비스에 대해 Admin 권한이 있는 [ClickHouse API key](/cloud/manage/openapi)
2. 서비스에서 한 번 이상 프로비저닝된 DB ClickPipe(Postgres, MySQL 또는 MongoDB). 첫 번째 ClickPipe가 생성될 때 CDC 인프라도 함께 생성되며, 그 시점부터 확장용 엔드포인트를 사용할 수 있습니다.

## DB ClickPipes 확장 절차 \{#cdc-scaling-steps\}

명령을 실행하기 전에 다음 환경 변수를 먼저 설정하십시오:

```bash
ORG_ID=<Your ClickHouse organization ID>
SERVICE_ID=<Your ClickHouse service ID>
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
```

현재 스케일링 구성을 조회합니다(선택 사항):

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

# example result:
{
  "result": {
    "replicaCpuMillicores": 2000,
    "replicaMemoryGb": 8
  },
  "requestId": "04310d9e-1126-4c03-9b05-2aa884dbecb7",
  "status": 200
}
```

원하는 스케일 수준을 설정합니다. 지원되는 구성은 CPU 코어 1~24개이며, 메모리(GB)는 코어 수의 4배로 설정됩니다.

```bash
cat <<EOF | tee cdc_scaling.json
{
  "replicaCpuMillicores": 24000,
  "replicaMemoryGb": 96
}
EOF

curl --silent --user $KEY_ID:$KEY_SECRET \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
-d @cdc_scaling.json | jq
```

구성 변경 사항이 전파될 때까지 기다리십시오(보통 3~5분 정도 소요됩니다). 스케일링이 완료되면 GET 엔드포인트에 새로운 값이 반영됩니다:

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

# example result:
{
  "result": {
    "replicaCpuMillicores": 24000,
    "replicaMemoryGb": 96
  },
  "requestId": "5a76d642-d29f-45af-a857-8c4d4b947bf0",
  "status": 200
}
```
