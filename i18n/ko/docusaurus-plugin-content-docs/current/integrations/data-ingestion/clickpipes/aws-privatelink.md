---
sidebar_label: 'ClickPipes용 AWS PrivateLink'
description: 'AWS PrivateLink를 사용하여 ClickPipes와 데이터 소스 간에 보안 연결을 구성합니다.'
slug: /integrations/clickpipes/aws-privatelink
title: 'ClickPipes용 AWS PrivateLink'
doc_type: 'guide'
keywords: ['AWS PrivateLink', 'ClickPipes 보안', 'VPC 엔드포인트', '프라이빗 연결', 'VPC 리소스']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_rpe_select from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_select.png';
import cp_rpe_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step0.png';
import cp_rpe_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step1.png';
import cp_rpe_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step2.png';
import cp_rpe_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step3.png';
import cp_rpe_settings0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_settings0.png';
import cp_rpe_settings1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_settings1.png';
import Image from '@theme/IdealImage';


# ClickPipes를 위한 AWS PrivateLink \{#aws-privatelink-for-clickpipes\}

[AWS PrivateLink](https://aws.amazon.com/privatelink/)을 사용하면 VPC, AWS 서비스, 온프레미스 시스템, ClickHouse Cloud 간에 퍼블릭 인터넷에 트래픽을 노출하지 않고 보안 연결을 구성할 수 있습니다.

이 문서는 AWS PrivateLink VPC 엔드포인트를 설정할 수 있게 해주는 ClickPipes 역방향 프라이빗 엔드포인트 기능을 설명합니다.

## 지원되는 ClickPipes 데이터 소스 \{#supported-sources\}

ClickPipes 역방향 프라이빗 엔드포인트 기능은 다음과 같은 데이터 소스 유형으로 제한됩니다.

- Kafka
- Postgres
- MySQL
- MongoDB

## 지원되는 AWS PrivateLink 엔드포인트 유형 \{#aws-privatelink-endpoint-types\}

ClickPipes 역방향 프라이빗 엔드포인트는 다음과 같은 AWS PrivateLink 방식 중 하나로 구성할 수 있습니다.

- [VPC 리소스](#vpc-resource)
- [MSK ClickPipe용 MSK 멀티 VPC 연결](#msk-multi-vpc)
- [VPC 엔드포인트 서비스](#vpc-endpoint-service)

### VPC resource \{#vpc-resource\}

:::info
리전 간 연결(cross-region)은 지원되지 않습니다.
:::

VPC 리소스는 [PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)를 사용하여 ClickPipes에서 액세스할 수 있습니다. 이 방식은 데이터 소스 앞단에 로드 밸런서를 구성할 필요가 없습니다.

리소스 구성은 특정 호스트 또는 RDS 클러스터 ARN을 대상으로 지정할 수 있습니다.

Postgres RDS 클러스터에서 CDC 방식으로 데이터를 수집할 때 권장되는 옵션입니다.

VPC resource와 함께 PrivateLink를 설정하려면:

1. resource gateway를 생성합니다.
2. resource configuration을 생성합니다.
3. resource share를 생성합니다.

<VerticalStepper headerLevel="h4">
  #### 리소스 게이트웨이 생성하기

  리소스 게이트웨이(Resource gateway)는 VPC 내에서 지정된 리소스로 향하는 트래픽을 수신하는 지점입니다.

  :::note
  리소스 게이트웨이에 연결된 서브넷에는 충분한 IP 주소가 확보되어 있어야 합니다.
  각 서브넷에 최소 `/26` 서브넷 마스크를 사용하는 것을 권장합니다.

  각 VPC 엔드포인트(각 Reverse Private Endpoint)마다 AWS는 서브넷당 연속된 16개의 IP 주소 블록을 요구합니다. (`/28` 서브넷 마스크)
  이 요구 사항을 충족하지 못하면 Reverse Private Endpoint가 실패 상태로 전환됩니다.
  :::

  [AWS 콘솔](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-gateway.html)에서 리소스 게이트웨이를 생성하거나 다음 명령으로 생성할 수 있습니다:

  ```bash
  aws vpc-lattice create-resource-gateway \
      --vpc-identifier <VPC_ID> \
      --subnet-ids <SUBNET_IDS> \
      --security-group-ids <SG_IDs> \
      --name <RESOURCE_GATEWAY_NAME>
  ```

  출력에는 다음 단계에 필요한 리소스 게이트웨이 ID가 포함됩니다.

  계속 진행하기 전에 리소스 게이트웨이가 `Active` 상태가 될 때까지 기다려야 합니다. 다음 명령을 실행하여 상태를 확인하십시오:

  ```bash
  aws vpc-lattice get-resource-gateway \
      --resource-gateway-identifier <RESOURCE_GATEWAY_ID>
  ```

  #### VPC 리소스 구성 생성하기

  Resource-Configuration은 리소스 게이트웨이와 연결되어 리소스에 대한 접근을 가능하게 합니다.

  [AWS 콘솔](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-configuration.html)에서 Resource-Configuration을 생성하거나 다음 명령으로 생성할 수 있습니다:

  ```bash
  aws vpc-lattice create-resource-configuration \
      --resource-gateway-identifier <RESOURCE_GATEWAY_ID> \
      --type <RESOURCE_CONFIGURATION_TYPE> \
      --resource-configuration-definition <RESOURCE_CONFIGURATION_DEFINITION> \
      --name <RESOURCE_CONFIGURATION_NAME>
  ```

  가장 간단한 [리소스 구성 유형](https://docs.aws.amazon.com/vpc-lattice/latest/ug/resource-configuration.html#resource-configuration-types)은 단일 Resource-Configuration입니다. ARN을 직접 사용하여 구성하거나, 공개적으로 확인 가능한 IP 주소 또는 도메인 이름을 공유하십시오.

  예를 들어, RDS 클러스터의 ARN을 사용하여 구성하려면 다음과 같이 설정하십시오:

  ```bash
  aws vpc-lattice create-resource-configuration \
      --name my-rds-cluster-config \
      --type ARN \
      --resource-gateway-identifier rgw-0bba03f3d56060135 \
      --resource-configuration-definition 'arnResource={arn=arn:aws:rds:us-east-1:123456789012:cluster:my-rds-cluster}'
  ```

  :::note
  공개 액세스가 가능한 클러스터에 대해서는 리소스 구성을 생성할 수 없습니다.
  클러스터가 공개 액세스 가능한 경우, 리소스 구성을 생성하기 전에
  클러스터를 비공개로 변경하거나
  [IP 허용 목록](/integrations/clickpipes#list-of-static-ips)을 사용하십시오.
  자세한 내용은 [AWS 문서](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html#resource-definition)를 참조하십시오.
  :::

  출력에는 다음 단계에 필요한 Resource-Configuration ARN이 포함됩니다. 또한 VPC 리소스와 ClickPipe 연결을 설정하는 데 필요한 Resource-Configuration ID도 포함됩니다.

  #### Resource-Share 생성하기

  리소스를 공유하려면 Resource-Share가 필요합니다. 이는 Resource Access Manager(RAM)를 통해 이루어집니다.

  :::note
  Resource-Share는 단일 Reverse Private Endpoint에만 사용할 수 있으며 재사용할 수 없습니다.
  동일한 Resource-Configuration을 여러 Reverse Private Endpoint에 사용해야 하는 경우,
  각 엔드포인트마다 별도의 Resource-Share를 생성하십시오.
  Resource-Share는 Reverse Private Endpoint가 삭제된 후에도 AWS 계정에 남아 있으므로
  더 이상 필요하지 않은 경우 수동으로 제거하십시오.
  :::

  [AWS 콘솔](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html)을 통해 또는 ClickPipes 계정 ID `072088201116` (arn:aws:iam::072088201116:root)를 사용하여 다음 명령을 실행함으로써 Resource-Configuration을 Resource-Share에 추가할 수 있습니다:

  ```bash
  aws ram create-resource-share \
      --principals 072088201116 \
      --resource-arns <RESOURCE_CONFIGURATION_ARN> \
      --name <RESOURCE_SHARE_NAME>
  ```

  출력에는 Resource-Share ARN이 포함되며, 이를 사용하여 VPC 리소스와 ClickPipe 연결을 설정할 수 있습니다.

  VPC 리소스를 사용하여 [Reverse private endpoint로 ClickPipe 생성](#creating-clickpipe)을 진행할 준비가 완료되었습니다. 다음 사항이 필요합니다:

  * `VPC endpoint type`를 `VPC Resource`로 설정하십시오.
  * `Resource configuration ID`를 2단계에서 생성한 Resource-Configuration의 ID로 설정합니다.
  * 3단계에서 생성한 Resource-Share의 ARN으로 `Resource share ARN`을 설정합니다.

  VPC 리소스와 함께 PrivateLink를 사용하는 방법에 대한 자세한 내용은 [AWS 문서](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)를 참조하세요.
</VerticalStepper>

### MSK 다중 VPC 연결 {#msk-multi-vpc}

[Multi-VPC connectivity](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html)는 여러 VPC를 하나의 MSK 클러스터에 연결할 수 있게 해 주는 AWS MSK의 기본 제공 기능입니다.
프라이빗 DNS 지원은 기본으로 제공되며, 추가 구성이 필요하지 않습니다.
크로스 리전(cross-region) 연결은 지원되지 않습니다.

이는 MSK용 ClickPipes에 권장되는 옵션입니다.
자세한 내용은 [시작하기](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html) 가이드를 참고하십시오.

:::info
MSK 클러스터 정책을 업데이트하고, `072088201116`을(를) MSK 클러스터의 허용된 주체(principal) 목록에 추가하십시오.
자세한 내용은 AWS의 [클러스터 정책 연결](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html) 가이드를 참고하십시오.
:::

연결 설정 방법을 알아보려면 [ClickPipes용 MSK 설정 가이드](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes)를 참조하십시오.

### VPC endpoint service {#vpc-endpoint-service}

[VPC endpoint service](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)는 데이터 소스를 ClickPipes와 공유하는 또 다른 방법입니다.
데이터 소스 앞단에 NLB(Network Load Balancer)를 설정하고
VPC endpoint service가 해당 NLB를 사용하도록 구성해야 합니다.

VPC endpoint service는 [private DNS로 구성](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html)할 수 있으며, 이렇게 구성된 DNS는 ClickPipes VPC 내에서 액세스할 수 있습니다.

다음과 같은 경우에 권장됩니다:

- private DNS 지원이 필요한 온프레미스 Kafka 설정
- [Postgres CDC를 위한 리전 간 연결](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- MSK 클러스터를 위한 리전 간 연결. 지원이 필요한 경우 ClickHouse 지원 팀에 문의하십시오.

자세한 내용은 [시작하기](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html) 가이드를 참조하십시오.

:::info
VPC endpoint service의 허용 Principal 목록에 ClickPipes 계정 ID `072088201116`을(를) 추가하십시오.
자세한 내용은 AWS의 [권한 관리](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions) 가이드를 참조하십시오.
:::

:::info
[리전 간 액세스](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)는
ClickPipes에 대해 설정할 수 있습니다. VPC endpoint service의 허용 리전 목록에 [사용 중인 ClickPipe 리전](#aws-privatelink-regions)을 추가하십시오.
:::

## Reverse private endpoint로 ClickPipe 생성하기 {#creating-clickpipe}

<VerticalStepper headerLevel="list">

1. ClickHouse Cloud Service의 SQL Console에 접속합니다.

<Image img={cp_service} alt="ClickPipes 서비스" size="md" border/>

2. 왼쪽 메뉴에서 `Data Sources` 버튼을 선택한 후 "ClickPipe 설정(Set up a ClickPipe)"을 클릭합니다.

<Image img={cp_step0} alt="가져오기 항목 선택" size="lg" border/>

3. 데이터 소스로 Kafka 또는 Postgres 중 하나를 선택합니다.

<Image img={cp_rpe_select} alt="데이터 소스 선택" size="lg" border/>

4. `Reverse private endpoint` 옵션을 선택합니다.

<Image img={cp_rpe_step0} alt="Reverse private endpoint 선택" size="lg" border/>

5. 기존 reverse private endpoint 중 하나를 선택하거나 새로 생성합니다.

:::info
RDS에 대해 리전 간(cross-region) 액세스가 필요하면 VPC endpoint service를 생성해야 하며,
이를 설정하는 데 도움이 되는 시작점으로 [이 가이드](/knowledgebase/aws-privatelink-setup-for-clickpipes)를 참고할 수 있습니다.

동일 리전 액세스의 경우 VPC Resource를 생성하는 것이 권장되는 방법입니다.
:::

<Image img={cp_rpe_step1} alt="Reverse private endpoint 선택" size="lg" border/>

6. 선택한 endpoint 유형에 필요한 매개변수를 입력합니다.

<Image img={cp_rpe_step2} alt="Reverse private endpoint 선택" size="lg" border/>

    - VPC resource의 경우 configuration share ARN과 configuration ID를 입력합니다.
    - MSK multi-VPC의 경우 생성된 endpoint에서 사용하는 cluster ARN과 인증 방식을 입력합니다.
    - VPC endpoint service의 경우 service name을 입력합니다.

7. `Create`를 클릭하고 reverse private endpoint가 준비될 때까지 기다립니다.

   새 endpoint를 생성하는 경우 endpoint 설정이 완료될 때까지 시간이 소요됩니다.
   endpoint가 준비되면 페이지가 자동으로 새로 고침됩니다.
   VPC endpoint service의 경우 AWS 콘솔에서 연결 요청을 수락해야 할 수도 있습니다.

<Image img={cp_rpe_step3} alt="Reverse private endpoint 선택" size="lg" border/>

8. endpoint가 준비되면 DNS 이름을 사용해 데이터 소스에 연결할 수 있습니다.

   endpoint 목록에서 사용 가능한 endpoint의 DNS 이름을 확인할 수 있습니다.
   이는 ClickPipes에서 내부적으로 프로비저닝한 DNS 이름이거나 PrivateLink service에서 제공한 private DNS 이름일 수 있습니다.
   DNS 이름만으로는 완전한 네트워크 주소가 아닙니다.
   데이터 소스에 맞는 포트를 추가해야 합니다.

   MSK 연결 문자열은 AWS 콘솔에서 확인할 수 있습니다.

   전체 DNS 이름 목록을 보려면 Cloud 서비스 설정에서 확인합니다.

</VerticalStepper>

## 기존 역방향 프라이빗 엔드포인트 관리 {#managing-existing-endpoints}

ClickHouse Cloud 서비스 설정에서 기존 역방향 프라이빗 엔드포인트를 관리할 수 있습니다:

<VerticalStepper headerLevel="list">

1. 사이드바에서 `Settings` 버튼을 찾아 클릭합니다.

    <Image img={cp_rpe_settings0} alt="ClickHouse Cloud 설정" size="lg" border/>

2. `ClickPipe reverse private endpoints` 섹션에서 `Reverse private endpoints`를 클릭합니다.

    <Image img={cp_rpe_settings1} alt="ClickHouse Cloud 설정" size="md" border/>

   플라이아웃에 역방향 프라이빗 엔드포인트의 자세한 정보가 표시됩니다.

   여기에서 엔드포인트를 제거할 수 있습니다. 이 작업은 해당 엔드포인트를 사용하는 모든 ClickPipes에 영향을 미칩니다.

</VerticalStepper>

## 지원되는 AWS 리전 {#aws-privatelink-regions}

AWS PrivateLink 지원은 ClickPipes의 경우 특정 AWS 리전에서만 제공됩니다.
사용 가능한 리전을 확인하려면 [ClickPipes 리전 목록](/integrations/clickpipes#list-of-static-ips)을 참조하십시오.

이 제한은 크로스 리전 연결이 활성화된 PrivateLink VPC 엔드포인트 서비스에는 적용되지 않습니다.

## 제한 사항 \{#limitations\}

ClickHouse Cloud에서 생성된 ClickPipes용 AWS PrivateLink 엔드포인트는
ClickHouse Cloud 서비스와 동일한 AWS 리전에 생성된다는 보장이 없습니다.

현재는 VPC 엔드포인트 서비스만
리전 간 연결을 지원합니다.

프라이빗 엔드포인트는 특정 ClickHouse 서비스에 연결되며, 서비스 간에 이전할 수 없습니다.
하나의 ClickHouse 서비스에 여러 개의 ClickPipes가 있을 경우 동일한 엔드포인트를 재사용할 수 있습니다.

AWS MSK는 MSK 클러스터당 인증 유형(SASL_IAM 또는 SASL_SCRAM)별로 하나의 PrivateLink(VPC 엔드포인트)만 지원합니다. 따라서 여러 ClickHouse Cloud 서비스나 조직이 동일한 인증 유형을 사용하여 동일한 MSK 클러스터에 대해 별도의 PrivateLink 연결을 생성할 수 없습니다.

### 비활성 엔드포인트의 자동 정리 {#automatic-cleanup}

터미널 상태에 남아 있는 역방향 프라이빗 엔드포인트는 정의된 유예 기간 이후 자동으로 제거됩니다.
이를 통해 사용되지 않거나 잘못 구성된 엔드포인트가 무기한 유지되지 않도록 합니다.

엔드포인트 상태에 따라 적용되는 유예 기간은 다음과 같습니다.

| Status | Grace Period | Description |
|---|---|---|
| **Failed** | 7 days | 프로비저닝 중 오류가 발생한 엔드포인트입니다. |
| **Pending Acceptance** | 1 day | 엔드포인트 연결이 서비스 소유자에게 아직 승인되지 않은 상태입니다. |
| **Rejected** | 1 day | 엔드포인트 연결이 서비스 소유자에 의해 거부된 상태입니다. |
| **Expired** | Immediate | 엔드포인트가 이미 만료되었으며 즉시 제거됩니다. |

유예 기간이 지나면 엔드포인트와 관련된 모든 리소스가 자동으로 삭제됩니다.

자동 제거를 방지하려면 유예 기간이 만료되기 전에 근본적인 문제를 해결해야 합니다.
예를 들어 AWS 콘솔에서 보류 중인 연결 요청을 승인하거나,
엔드포인트가 실패 상태로 전환된 경우 엔드포인트를 다시 생성하십시오.