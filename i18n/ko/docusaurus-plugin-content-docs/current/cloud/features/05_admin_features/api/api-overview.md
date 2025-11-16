---
'sidebar_label': '개요'
'sidebar_position': 1
'title': 'ClickHouse Cloud API'
'slug': '/cloud/manage/api/api-overview'
'description': 'ClickHouse Cloud API에 대해 배우기'
'doc_type': 'reference'
'keywords':
- 'ClickHouse Cloud'
- 'API overview'
- 'cloud API'
- 'REST API'
- 'programmatic access'
---



# ClickHouse Cloud API

## 개요 {#overview}

ClickHouse Cloud API는 개발자가 ClickHouse Cloud에서 조직과 서비스를 쉽게 관리할 수 있도록 설계된 REST API입니다. Cloud API를 사용하면 서비스를 생성 및 관리하고, API 키를 프로비저닝하며, 조직에서 구성원을 추가하거나 제거하는 등의 작업을 수행할 수 있습니다.

[첫 번째 API 키를 생성하고 ClickHouse Cloud API를 사용하기 시작하는 방법을 배우십시오.](/cloud/manage/openapi)

## Swagger (OpenAPI) 엔드포인트 및 UI {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud API는 클라이언트 측 소비를 예측 가능하게 하기 위해 오픈 소스 [OpenAPI 사양](https://www.openapis.org/)에 기반하여 구축되었습니다. 프로그래밍 방식으로 ClickHouse Cloud API 문서를 소비해야 하는 경우, https://api.clickhouse.cloud/v1을 통해 JSON 기반 Swagger 엔드포인트를 제공합니다. 또한 [Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger)를 통해 API 문서를 찾을 수 있습니다.

:::note 
조직이 [새 요금제](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false)로 마이그레이션되었고 OpenAPI를 사용하는 경우, 서비스 생성 `POST` 요청에서 `tier` 필드를 제거해야 합니다.

서비스 개체에서 `tier` 필드는 더 이상 서비스 계층이 없으므로 제거되었습니다.  
이는 `POST`, `GET`, 및 `PATCH` 서비스 요청으로 반환된 객체에 영향을 미칩니다. 따라서 이러한 API를 소비하는 코드도 이러한 변경을 처리하도록 조정해야 할 수 있습니다.
:::

## 속도 제한 {#rate-limits}

개발자는 조직당 100개의 API 키로 제한됩니다. 각 API 키는 10초 동안 10개의 요청으로 제한됩니다. 조직의 API 키 수나 10초 동안의 요청 수를 늘리려면 support@clickhouse.com에 문의하십시오.

## Terraform 제공자 {#terraform-provider}

공식 ClickHouse Terraform Provider를 사용하면 [코드로서의 인프라](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac)를 사용하여 예측 가능하고 버전 관리가 가능한 구성 파일을 생성하여 배포에서 오류를 줄일 수 있습니다.

Terraform 제공자 문서는 [Terraform 레지스트리](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)에서 확인할 수 있습니다.

ClickHouse Terraform Provider에 기여하고 싶다면, [GitHub 레포지토리](https://github.com/ClickHouse/terraform-provider-clickhouse)에서 소스를 확인할 수 있습니다.

:::note 
조직이 [새 요금제](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false)로 마이그레이션되었으면, 서비스의 `tier` 속성 변경을 처리하기 위해 ClickHouse Terraform provider 버전 2.0.0 이상을 사용해야 합니다. 이 업그레이드는 마이그레이션 후 더 이상 `tier` 필드가 허용되지 않으므로 필요합니다.

이제 서비스 리소스의 속성으로 `num_replicas` 필드를 지정할 수도 있습니다.
:::

## Terraform 및 OpenAPI 새 요금제: 복제본 설정 설명 {#terraform-and-openapi-new-pricing---replica-settings-explained}

각 서비스에 대한 복제본 수는 Scale 및 Enterprise 요금제의 경우 기본값이 3이며, Basic 요금제의 경우 기본값이 1입니다. Scale 및 Enterprise 요금제의 경우 서비스 생성 요청에 `numReplicas` 필드를 전달하여 이를 조정할 수 있습니다. 
`numReplicas` 필드의 값은 창고의 첫 서비스에 대해 2와 20 사이여야 합니다. 기존 창고에서 생성된 서비스는 최소 1개의 복제본을 가질 수 있습니다.

## 지원 {#support}

빠른 지원을 받으려면 [우리의 Slack 채널](https://clickhouse.com/slack)을 먼저 방문하는 것을 권장합니다. API 및 기능에 대한 추가 도움이나 더 많은 정보를 얻고 싶다면, ClickHouse 지원팀에 https://console.clickhouse.cloud/support를 통해 문의하시기 바랍니다.
