---
'title': 'OpenAPI를 통한 DB ClickPipes 확장'
'description': 'OpenAPI를 통한 DB ClickPipes 확장을 위한 문서'
'slug': '/integrations/clickpipes/postgres/scaling'
'sidebar_label': '확장'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'postgresql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

:::caution 대부분의 사용자에게 이 API는 필요하지 않습니다
DB ClickPipes의 기본 구성은 대부분의 작업 부하를 즉시 처리할 수 있도록 설계되었습니다. 작업 부하가 확장이 필요하다고 생각되면, [지원 요청](https://clickhouse.com/support/program)을 열어 주시면 사용 사례에 대한 최적의 설정을 안내해 드리겠습니다.
:::

Scaling API는 다음과 같은 경우에 유용할 수 있습니다:
- 대량 초기 로드(4 TB 이상)
- 가능한 한 빨리 적당한 양의 데이터 이관
- 동일한 서비스에서 8개 이상의 CDC ClickPipes 지원

확장 시도 전 고려해야 할 사항:
- 소스 DB에 충분한 사용 가능한 용량이 있는지 확인
- ClickPipe를 생성할 때 먼저 [초기 로드 병렬 처리 및 파티셔닝](/integrations/clickpipes/postgres/parallel_initial_load) 조정
- CDC 지연을 초래할 수 있는 [장기 실행 트랜잭션](/integrations/clickpipes/postgres/sync_control#transactions)을 소스에서 확인

**확장하면 ClickPipes의 컴퓨팅 비용이 비례하여 증가합니다.** 초기 로드만을 위해 확장하는 경우, 스냅샷이 완료된 후 예기치 않은 요금을 피하기 위해 축소하는 것이 중요합니다. 가격에 대한 자세한 내용은 [Postgres CDC 가격](/cloud/reference/billing/clickpipes)을 참조하십시오.

## 이 과정의 전제 조건 {#prerequisites}

시작하기 전에 다음이 필요합니다:

1. 대상 ClickHouse Cloud 서비스에 대한 관리자 권한이 있는 [ClickHouse API 키](/cloud/manage/openapi).
2. 서비스에서 생성된 DB ClickPipe (Postgres, MySQL 또는 MongoDB). CDC 인프라는 첫 번째 ClickPipe와 함께 생성되며, 그 시점부터 확장 끝점이 사용 가능해집니다.

## DB ClickPipes 확장 단계 {#cdc-scaling-steps}

명령을 실행하기 전에 다음 환경 변수를 설정하세요:

```bash
ORG_ID=<Your ClickHouse organization ID>
SERVICE_ID=<Your ClickHouse service ID>
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
```

현재 확장 구성을 가져옵니다(선택 사항):

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

원하는 확장을 설정합니다. 지원되는 구성은 CPU 코어 1-24개와 메모리(GB)는 코어 수의 4배로 설정됩니다:

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

구성이 전파될 때까지 기다립니다(일반적으로 3-5분 소요). 확장이 완료된 후 GET 끝점은 새로운 값을 반영합니다:

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
