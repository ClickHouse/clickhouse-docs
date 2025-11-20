---
'sidebar_label': 'AWS PrivateLink for ClickPipes'
'description': 'AWS PrivateLink를 사용하여 ClickPipes와 데이터 소스 간의 보안 연결을 설정합니다.'
'slug': '/integrations/clickpipes/aws-privatelink'
'title': 'AWS PrivateLink for ClickPipes'
'doc_type': 'guide'
'keywords':
- 'aws privatelink'
- 'ClickPipes security'
- 'vpc endpoint'
- 'private connectivity'
- 'vpc resource'
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



# AWS PrivateLink for ClickPipes

[AWS PrivateLink](https://aws.amazon.com/privatelink/)를 사용하여 VPC, AWS 서비스, 온프레미스 시스템 및 ClickHouse Cloud 간에 보안을 유지하면서 인터넷에 트래픽을 노출하지 않고 연결을 구축할 수 있습니다.

이 문서는 AWS PrivateLink VPC 엔드포인트를 설정할 수 있는 ClickPipes 역방향 개인 엔드포인트 기능을 설명합니다.

## 지원되는 ClickPipes 데이터 소스 {#supported-sources}

ClickPipes의 역방향 개인 엔드포인트 기능은 다음 데이터 소스 유형으로 제한됩니다:
- Kafka
- Postgres
- MySQL

## 지원되는 AWS PrivateLink 엔드포인트 유형 {#aws-privatelink-endpoint-types}

ClickPipes의 역방향 개인 엔드포인트는 다음 AWS PrivateLink 접근 방식 중 하나로 구성할 수 있습니다:

- [VPC 리소스](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)
- [MSK ClickPipe의 MSK 다중 VPC 연결](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html)
- [VPC 엔드포인트 서비스](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)

### VPC 리소스 {#vpc-resource}

[VPC 리소스](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)를 사용하여 ClickPipes에서 VPC 리소스에 접근할 수 있습니다. 이 접근 방식은 데이터 소스 앞에 로드 밸런서를 설정할 필요가 없습니다.

리소스 구성은 특정 호스트 또는 RDS 클러스터 ARN으로 타겟팅할 수 있습니다. 교차 리전은 지원되지 않습니다.

Postgres CDC에서 RDS 클러스터의 데이터를 수집하는 데 선호되는 선택입니다.

PrivateLink를 VPC 리소스로 설정하려면:
1. 리소스 게이트웨이를 생성하십시오.
2. 리소스 구성을 생성하십시오.
3. 리소스 공유를 생성하십시오.

<VerticalStepper headerLevel="h4">

#### 리소스 게이트웨이 생성 {#create-resource-gateway}

리소스 게이트웨이는 VPC 내의 지정된 리소스에 대한 트래픽을 수신하는 지점입니다.

:::note
리소스 게이트웨이에 연결된 서브넷은 충분한 IP 주소를 제공해야 합니다.
각 서브넷에 대해 최소 `/26` 서브넷 마스크를 권장합니다.

각 VPC 엔드포인트(각 역방향 개인 엔드포인트)에 대해, AWS는 서브넷당 16개의 IP 주소의 연속 블록을 요구합니다. (`/28` 서브넷 마스크)
이 요구 사항이 충족되지 않으면 역방향 개인 엔드포인트는 실패 상태로 전환됩니다.
:::

[AWS 콘솔](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-gateway.html)에서 또는 다음 명령어를 사용하여 리소스 게이트웨이를 생성할 수 있습니다:

```bash
aws vpc-lattice create-resource-gateway \
    --vpc-identifier <VPC_ID> \
    --subnet-ids <SUBNET_IDS> \
    --security-group-ids <SG_IDs> \
    --name <RESOURCE_GATEWAY_NAME>
```

출력에는 다음 단계에 필요할 리소스 게이트웨이 ID가 포함됩니다.

진행하기 전에 리소스 게이트웨이가 `Active` 상태로 전환되기를 기다려야 합니다. 다음 명령을 실행하여 상태를 확인할 수 있습니다:

```bash
aws vpc-lattice get-resource-gateway \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID>
```

#### VPC 리소스 구성 생성 {#create-resource-configuration}

리소스 구성이 리소스 게이트웨이에 연결되어 리소스에 접근할 수 있도록 합니다.

[AWS 콘솔](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-configuration.html)에서 또는 다음 명령어를 실행하여 리소스 구성을 생성할 수 있습니다:

```bash
aws vpc-lattice create-resource-configuration \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID> \
    --type <RESOURCE_CONFIGURATION_TYPE> \
    --resource-configuration-definition <RESOURCE_CONFIGURATION_DEFINITION> \
    --name <RESOURCE_CONFIGURATION_NAME>
```

가장 간단한 [리소스 구성 유형](https://docs.aws.amazon.com/vpc-lattice/latest/ug/resource-configuration.html#resource-configuration-types)은 단일 리소스 구성입니다. 직접 ARN으로 구성하거나 공용으로 확인 가능한 IP 주소 또는 도메인 이름을 공유할 수 있습니다.

예를 들어, RDS 클러스터의 ARN으로 구성하는 경우:

```bash
aws vpc-lattice create-resource-configuration \
    --name my-rds-cluster-config \
    --type ARN \
    --resource-gateway-identifier rgw-0bba03f3d56060135 \
    --resource-configuration-definition 'arnResource={arn=arn:aws:rds:us-east-1:123456789012:cluster:my-rds-cluster}'
```

:::note
공용 액세스가 가능한 클러스터에 대한 리소스 구성을 생성할 수 없습니다.
클러스터가 공용 액세스 가능하면 리소스 구성을 생성하기 전에 클러스터를 비공식 거리로 수정해야 하거나 [IP 허용 목록](/integrations/clickpipes#list-of-static-ips)을 대신 사용해야 합니다.
자세한 내용은 [AWS 문서](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html#resource-definition)를 참조하십시오.
:::

출력에는 다음 단계에 필요할 리소스 구성 ARN이 포함됩니다. 또한 ClickPipe 연결을 설정하는 데 필요한 리소스 구성 ID도 포함됩니다.

#### 리소스 공유 생성 {#create-resource-share}

리소스를 공유하려면 리소스 공유가 필요합니다. 이것은 리소스 액세스 관리자(RAM)를 통해 이루어집니다.

[AWS 콘솔](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html)에서 리소스 구성을 리소스 공유에 추가하거나 ClickPipes 계정 ID `072088201116` (arn:aws:iam::072088201116:root)와 함께 다음 명령어를 실행하여 진행할 수 있습니다:

```bash
aws ram create-resource-share \
    --principals 072088201116 \
    --resource-arns <RESOURCE_CONFIGURATION_ARN> \
    --name <RESOURCE_SHARE_NAME>
```

출력에는 ClickPipe와 VPC 리소스 연결을 설정하는 데 필요한 리소스 공유 ARN이 포함됩니다.

이제 VPC 리소스를 사용하여 [역방향 개인 엔드포인트로 ClickPipe를 생성할](#creating-clickpipe) 준비가 되었습니다. 다음을 설정해야 합니다:
- `VPC 엔드포인트 유형`을 `VPC 리소스`로 설정합니다.
- `리소스 구성 ID`를 2단계에서 생성한 리소스 구성의 ID로 설정합니다.
- `리소스 공유 ARN`을 3단계에서 생성한 리소스 공유의 ARN으로 설정합니다.

VPC 리소스와 관련된 PrivateLink에 대한 자세한 내용은 [AWS 문서](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)를 참조하세요.

</VerticalStepper>

### MSK 다중 VPC 연결 {#msk-multi-vpc}

[AWS MSK의 다중 VPC 연결](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html)은 여러 VPC를 단일 MSK 클러스터에 연결할 수 있는 AWS MSK의 내장 기능입니다.
프라이빗 DNS 지원이 기본적으로 제공되며 추가 구성이 필요하지 않습니다.
교차 리전은 지원되지 않습니다.

ClickPipes용 MSK에서 추천하는 선택입니다.
자세한 내용은 [시작하기](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html) 가이드를 참조하세요.

:::info
MSK 클러스터 정책을 업데이트하고 MSK 클러스터에서 허용된 주체에 `072088201116`을 추가하십시오.
자세한 내용은 [클러스터 정책 첨부](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html) 관련 AWS 가이드를 참조하십시오.
:::

ClickPipes를 위한 [MSK 설정 가이드](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes)를 따라 연결 설정 방법을 배워보세요.

### VPC 엔드포인트 서비스 {#vpc-endpoint-service}

[VPC 엔드포인트 서비스](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)는 ClickPipes와 데이터 소스를 공유하는 또 다른 접근 방식입니다.
데이터 소스 앞에 NLB(네트워크 로드 밸런서)를 설정하고 VPC 엔드포인트 서비스를 NLB를 사용하도록 구성해야 합니다.

VPC 엔드포인트 서비스는 ClickPipes VPC에서 접근할 수 있는 [프라이빗 DNS](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html)와 함께 구성할 수 있습니다.

선택에 따라 다음과 같은 경우에 권장됩니다:

- 프라이빗 DNS 지원이 필요한 온프레미스 Kafka 설정
- [Postgres CDC의 교차 리전 연결](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- MSK 클러스터의 교차 리전 연결. 지원팀에 도움을 요청하세요.

자세한 내용은 [시작하기](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html) 가이드를 참조하세요.

:::info
ClickPipes 계정 ID `072088201116`을 VPC 엔드포인트 서비스의 허용된 주체에 추가하십시오.
자세한 내용은 [권한 관리](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions) 관련 AWS 가이드를 확인하세요.
:::

:::info
[교차 리전 접근](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region) 설정이 ClickPipes에 대해 가능하다. VPC 엔드포인트 서비스에서 허용된 리전 목록에 [당신의 ClickPipe 리전](#aws-privatelink-regions)을 추가하십시오.
:::

## 역방향 개인 엔드포인트로 ClickPipe 생성 {#creating-clickpipe}

<VerticalStepper headerLevel="list">

1. ClickHouse Cloud 서비스의 SQL 콘솔에 접근합니다.

<Image img={cp_service} alt="ClickPipes 서비스" size="md" border/>

2. 왼쪽 메뉴에서 `데이터 소스` 버튼을 선택하고 "ClickPipe 설정"을 클릭합니다.

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. 데이터 소스로 Kafka 또는 Postgres 중 하나를 선택합니다.

<Image img={cp_rpe_select} alt="Select data source" size="lg" border/>

4. `역방향 개인 엔드포인트` 옵션을 선택합니다.

<Image img={cp_rpe_step0} alt="Select reverse private endpoint" size="lg" border/>

5. 기존의 역방향 개인 엔드포인트 중 하나를 선택하거나 새로 만듭니다.

:::info
RDS에 대한 교차 리전 액세스가 필요한 경우 VPC 엔드포인트 서비스를 생성해야 하며
[이 가이드가](https://knowledgebase.aws-privatelink-setup-for-clickpipes) 설정 시작점으로 유용할 것입니다.

동일 리전 액세스의 경우, VPC 리소스를 생성하는 것이 권장되는 접근 방식입니다.
:::

<Image img={cp_rpe_step1} alt="Select reverse private endpoint" size="lg" border/>

6. 선택한 엔드포인트 유형에 필요한 매개변수를 제공합니다.

<Image img={cp_rpe_step2} alt="Select reverse private endpoint" size="lg" border/>

    - VPC 리소스의 경우, 구성 공유 ARN 및 구성 ID를 제공합니다.
    - MSK 다중 VPC의 경우, 클러스터 ARN과 생성된 엔드포인트에서 사용된 인증 방법을 제공합니다.
    - VPC 엔드포인트 서비스의 경우 서비스 이름을 제공합니다.

7. `생성`을 클릭하고 역방향 개인 엔드포인트가 준비될 때까지 기다립니다.

   새 엔드포인트를 생성하는 경우, 엔드포인트 설정에 시간이 걸릴 수 있습니다.
   엔드포인트가 준비되면 페이지가 자동으로 새로 고쳐집니다.
   VPC 엔드포인트 서비스는 AWS 콘솔에서 연결 요청을 수락해야 할 수 있습니다.

<Image img={cp_rpe_step3} alt="Select reverse private endpoint" size="lg" border/>

8. 엔드포인트가 준비되면 DNS 이름을 사용하여 데이터 소스에 연결할 수 있습니다.

   엔드포인트 목록에서 사용 가능한 엔드포인트의 DNS 이름을 볼 수 있습니다.
   내부 ClickPipes가 제공한 DNS 이름이거나 PrivateLink 서비스에서 제공된 프라이빗 DNS 이름일 수 있습니다.
   DNS 이름은 전체 네트워크 주소가 아닙니다.
   데이터 소스에 따라 포트를 추가하십시오.

   MSK 연결 문자열은 AWS 콘솔에서 확인할 수 있습니다.

   전체 DNS 이름 목록을 보려면 클라우드 서비스 설정에서 확인하십시오.

</VerticalStepper>

## 기존 역방향 개인 엔드포인트 관리 {#managing-existing-endpoints}

ClickHouse Cloud 서비스 설정에서 기존 역방향 개인 엔드포인트를 관리할 수 있습니다:

<VerticalStepper headerLevel="list">

1. 사이드바에서 `설정` 버튼을 찾아 클릭합니다.

    <Image img={cp_rpe_settings0} alt="ClickHouse Cloud settings" size="lg" border/>

2. `ClickPipe 역방향 개인 엔드포인트` 섹션에서 `역방향 개인 엔드포인트`를 클릭합니다.

    <Image img={cp_rpe_settings1} alt="ClickHouse Cloud settings" size="md" border/>

   역방향 개인 엔드포인트의 확장 정보가 플라이아웃에 표시됩니다.

   여기서 엔드포인트를 제거할 수 있습니다. 이 엔드포인트를 사용하는 ClickPipes에 영향을 미칩니다.

</VerticalStepper>

## 지원되는 AWS 리전 {#aws-privatelink-regions}

ClickPipes에 대한 AWS PrivateLink 지원은 특정 AWS 리전으로 제한됩니다.
사용 가능한 리전을 보려면 [ClickPipes 리전 목록](/integrations/clickpipes#list-of-static-ips)을 참조하십시오.

이 제한은 교차 리전 연결이 활성화된 PrivateLink VPC 엔드포인트 서비스에는 적용되지 않습니다.

## 제한 사항 {#limitations}

ClickHouse Cloud에서 생성된 ClickPipes의 AWS PrivateLink 엔드포인트는 ClickHouse Cloud 서비스와 동일한 AWS 리전에서 생성되리라는 보장이 없습니다.

현재, VPC 엔드포인트 서비스만 교차 리전 연결을 지원합니다.

프라이빗 엔드포인트는 특정 ClickHouse 서비스에 연결되어 있으며 서비스 간 이전이 불가능합니다.
단일 ClickHouse 서비스에 대한 여러 ClickPipes는 동일한 엔드포인트를 재사용할 수 있습니다.
