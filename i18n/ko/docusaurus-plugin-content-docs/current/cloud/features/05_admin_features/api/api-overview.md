---
sidebar_label: '개요'
sidebar_position: 1
title: 'ClickHouse Cloud API'
slug: /cloud/manage/api/api-overview
description: 'ClickHouse Cloud API에 대해 알아봅니다'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'API 개요', '클라우드 API', 'REST API', '프로그래밍 방식 접근']
---



# ClickHouse Cloud API \{#clickhouse-cloud-api\}



## 개요 \{#overview\}

ClickHouse Cloud API는 개발자가 ClickHouse Cloud에서 조직과 서비스를 쉽게 관리할 수 있도록 설계된 REST API입니다. Cloud API를 사용하면 서비스를 생성 및 관리하고, API 키를 프로비저닝하며, 조직의 구성원을 추가하거나 제거하는 등의 작업을 수행할 수 있습니다.

[첫 번째 API 키를 생성하고 ClickHouse Cloud API 사용을 시작하는 방법을 알아보십시오.](/cloud/manage/openapi)



## Swagger (OpenAPI) 엔드포인트와 UI \{#swagger-openapi-endpoint-and-ui\}

ClickHouse Cloud API는 클라이언트에서 예측 가능하게 활용할 수 있도록 오픈소스 [OpenAPI 사양](https://www.openapis.org/)을 기반으로 구축되었습니다. ClickHouse Cloud API 문서를 프로그래밍 방식으로 사용해야 하는 경우, https://api.clickhouse.cloud/v1에서 JSON 기반 Swagger 엔드포인트를 제공합니다. 또한 [Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger)를 통해서도 API 문서를 확인할 수 있습니다.

:::note 
조직이 [새 요금제](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false) 중 하나로 마이그레이션되었으며 OpenAPI를 사용하는 경우, 서비스 생성 `POST` 요청에서 `tier` 필드를 제거해야 합니다.

서비스 티어를 더 이상 사용하지 않으므로 서비스 객체에서 `tier` 필드가 제거되었습니다.  
이는 `POST`, `GET`, `PATCH` 서비스 요청에서 반환되는 객체에 영향을 줍니다. 따라서 이러한 API를 사용하는 코드는 이러한 변경 사항을 처리할 수 있도록 수정이 필요할 수 있습니다.
:::



## Rate limits \{#rate-limits\}

개발자는 조직별로 최대 100개의 API 키를 생성할 수 있습니다. 각 API 키는 10초 동안 최대 10회의 요청만 허용됩니다. 조직에 대해 허용되는 API 키 개수 또는 10초당 요청 한도를 늘려야 하는 경우 support@clickhouse.com으로 문의하십시오.



## Terraform provider \{#terraform-provider\}

공식 ClickHouse Terraform Provider를 사용하면 [코드형 인프라(Infrastructure as Code)](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac)를 통해 예측 가능하고 버전 관리되는 구성을 정의하여 배포 과정에서의 오류 발생 가능성을 크게 줄일 수 있습니다.

Terraform Provider 문서는 [Terraform Registry](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)에서 확인할 수 있습니다.

ClickHouse Terraform Provider에 기여하려는 경우, 
소스 코드는 [GitHub 리포지토리](https://github.com/ClickHouse/terraform-provider-clickhouse)에서 확인할 수 있습니다.

:::note 
조직이 [새 요금제](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false) 중 하나로 마이그레이션된 경우, [ClickHouse Terraform Provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) 2.0.0 이상 버전을 반드시 사용해야 합니다. 이 업그레이드는 서비스의 `tier` 속성 변경을 처리하기 위해 필요합니다. 요금제가 마이그레이션된 이후에는 `tier` 필드가 더 이상 허용되지 않으며, 이에 대한 모든 참조를 제거해야 합니다.

또한 이제 서비스 리소스의 속성으로 `num_replicas` 필드를 지정할 수도 있습니다.
:::



## Terraform 및 OpenAPI 신규 요금제: 레플리카 설정 설명 \{#terraform-and-openapi-new-pricing---replica-settings-explained\}

각 서비스가 생성될 때의 기본 레플리카 수는 Scale 및 Enterprise 티어에서는 3, Basic 티어에서는 1입니다.
Scale 및 Enterprise 티어에서는 서비스 생성 요청에 `numReplicas` 필드를 포함하여 이 값을 조정할 수 있습니다. 
웨어하우스에서 첫 번째 서비스의 경우 `numReplicas` 필드 값은 2 이상 20 이하여야 합니다. 기존 웨어하우스에 생성되는 서비스는 레플리카 수를 최소 1까지 설정할 수 있습니다.



## 지원 \{#support\}

빠른 지원을 받으려면 먼저 [Slack 채널](https://clickhouse.com/slack)을 방문하시기 바랍니다.  
API와 해당 기능에 대해 추가적인 도움이 필요하거나 더 많은 정보를 원하시면  
https://console.clickhouse.cloud/support 에서 ClickHouse Support로 문의하십시오.
