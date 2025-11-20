---
'title': 'AWS PrivateLink'
'description': '이 문서는 AWS PrivateLink를 사용하여 ClickHouse Cloud에 연결하는 방법을 설명합니다.'
'slug': '/manage/security/aws-privatelink'
'keywords':
- 'PrivateLink'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import aws_private_link_pecreate from '@site/static/images/cloud/security/aws-privatelink-pe-create.png';
import aws_private_link_endpoint_settings from '@site/static/images/cloud/security/aws-privatelink-endpoint-settings.png';
import aws_private_link_select_vpc from '@site/static/images/cloud/security/aws-privatelink-select-vpc-and-subnets.png';
import aws_private_link_vpc_endpoint_id from '@site/static/images/cloud/security/aws-privatelink-vpc-endpoint-id.png';
import aws_private_link_endpoints_menu from '@site/static/images/cloud/security/aws-privatelink-endpoints-menu.png';
import aws_private_link_modify_dnsname from '@site/static/images/cloud/security/aws-privatelink-modify-dns-name.png';
import pe_remove_private_endpoint from '@site/static/images/cloud/security/pe-remove-private-endpoint.png';
import aws_private_link_pe_filters from '@site/static/images/cloud/security/aws-privatelink-pe-filters.png';
import aws_private_link_ped_nsname from '@site/static/images/cloud/security/aws-privatelink-pe-dns-name.png';


# AWS PrivateLink

<ScalePlanFeatureBadge feature="AWS PrivateLink"/>

[AWS PrivateLink](https://aws.amazon.com/privatelink/) 를 사용하여 VPC, AWS 서비스, 온프레미스 시스템 및 ClickHouse Cloud 간의 보안 연결을 설정할 수 있으며, 이를 통해 트래픽을 공용 인터넷에 노출하지 않습니다. 이 문서에서는 AWS PrivateLink를 사용하여 ClickHouse Cloud에 연결하는 단계를 설명합니다.

ClickHouse Cloud 서비스에 대한 액세스를 AWS PrivateLink 주소를 통해 전용으로 제한하려면 ClickHouse Cloud의 [IP 액세스 목록](/cloud/security/setting-ip-filters)에서 제공하는 지침을 따르십시오.

:::note
ClickHouse Cloud는 다음 지역에서 [교차 지역 PrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/)를 지원합니다:
- sa-east-1
- il-central-1
- me-central-1
- me-south-1
- eu-central-2
- eu-north-1
- eu-south-2
- eu-west-3
- eu-south-1
- eu-west-2
- eu-west-1
- eu-central-1
- ca-west-1
- ca-central-1
- ap-northeast-1
- ap-southeast-2
- ap-southeast-1
- ap-northeast-2
- ap-northeast-3
- ap-south-1
- ap-southeast-4
- ap-southeast-3
- ap-south-2
- ap-east-1
- af-south-1
- us-west-2
- us-west-1
- us-east-2
- us-east-1
가격 고려 사항: AWS는 지역 간 데이터 전송에 대해 요금을 청구합니다. 가격은 [여기](https://aws.amazon.com/privatelink/pricing/)를 참조하십시오.
:::

**AWS PrivateLink를 사용하도록 설정하려면 다음을 완료하십시오:**
1. 엔드포인트 "서비스 이름"을 얻으십시오.
1. AWS 엔드포인트를 생성하십시오.
1. ClickHouse Cloud 조직에 "Endpoint ID"를 추가하십시오.
1. ClickHouse 서비스 허용 목록에 "Endpoint ID"를 추가하십시오.

Terraform 예제는 [여기](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)에서 찾을 수 있습니다.

## 중요 고려 사항 {#considerations}
ClickHouse는 AWS 지역 내에서 동일한 게시된 [서비스 엔드포인트](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview)를 재사용하기 위해 서비스를 그룹화하려고 시도합니다. 그러나 이러한 그룹화는 보장되지 않으며, 특히 서비스를 여러 ClickHouse 조직에 걸쳐 배포하는 경우에는 더욱 그렇습니다. 이미 ClickHouse 조직의 다른 서비스에 대해 PrivateLink가 구성된 경우, 대부분의 단계를 건너뛰고 최종 단계인 ClickHouse "Endpoint ID"를 ClickHouse 서비스 허용 목록에 추가하는 단계로 바로 진행할 수 있습니다.

## 이 프로세스의 전제 조건 {#prerequisites}

시작하기 전에 다음이 필요합니다:

1. 귀하의 AWS 계정.
1. ClickHouse에서 개인 엔드포인트를 생성하고 관리하는 데 필요한 권한을 가진 [ClickHouse API 키](/cloud/manage/openapi).

## 단계 {#steps}

AWS PrivateLink를 통해 ClickHouse Cloud 서비스에 연결하려면 다음 단계를 따르십시오.

### 엔드포인트 "서비스 이름" 획득 {#obtain-endpoint-service-info}

#### 옵션 1: ClickHouse Cloud 콘솔 {#option-1-clickhouse-cloud-console}

ClickHouse Cloud 콘솔에서 PrivateLink를 통해 연결할 서비스를 열고 **설정** 메뉴로 이동합니다.

<Image img={aws_private_link_pecreate} size="md" alt="Private Endpoints" border />

`서비스 이름` 및 `DNS 이름`을 메모한 후, [다음 단계로 이동하십시오](#create-aws-endpoint).

#### 옵션 2: API {#option-2-api}

먼저, 명령어를 실행하기 전에 다음 환경 변수를 설정합니다:

```shell
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

지역, 제공자 및 서비스 이름으로 필터링하여 ClickHouse `INSTANCE_ID`를 가져옵니다:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

PrivateLink 구성을 위해 `endpointServiceId` 및 `privateDnsHostname`를 받습니다:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

이 명령어는 다음과 같은 결과를 반환해야 합니다:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

`endpointServiceId` 및 `privateDnsHostname`를 메모하십시오. [다음 단계로 이동하십시오](#create-aws-endpoint).

### AWS 엔드포인트 생성 {#create-aws-endpoint}

:::important
이 섹션에서는 AWS PrivateLink를 통해 ClickHouse를 구성하기 위한 ClickHouse 전용 세부정보를 다룹니다. AWS 관련 단계는 안내를 위해 제공되며 시간이 지남에 따라 예고 없이 변경될 수 있습니다. 특정 사용 사례에 따라 AWS 구성을 고려하십시오.

ClickHouse는 필요한 AWS VPC 엔드포인트, 보안 그룹 규칙 또는 DNS 레코드를 구성하는 것에 대해 책임지지 않습니다.

이전에 PrivateLink 설정 시 "개인 DNS 이름"을 활성화한 경우 새로운 서비스를 PrivateLink를 통해 구성하는 데 어려움을 겪고 있다면, ClickHouse 지원팀에 문의하십시오. AWS 구성 작업과 관련된 다른 문제는 AWS 지원팀에 직접 문의하십시오.
:::

#### 옵션 1: AWS 콘솔 {#option-1-aws-console}

AWS 콘솔을 열고 **VPC** → **Endpoints** → **Create endpoints**로 이동합니다.

**NLB 및 GWLB를 사용하는 엔드포인트 서비스**를 선택하고 [엔드포인트 "서비스 이름"씩 획득한 로그인 정보](#obtain-endpoint-service-info)에서 받은 `Service name`<sup>콘솔</sup> 또는 `endpointServiceId`<sup>API</sup>를 **서비스 이름** 필드에 입력합니다. **서비스 확인**을 클릭합니다:

<Image img={aws_private_link_endpoint_settings} size="md" alt="AWS PrivateLink Endpoint Settings" border/>

PrivateLink를 통해 교차 지역 연결을 설정하려면 "교차 지역 엔드포인트" 체크박스를 활성화하고 서비스 지역을 지정하십시오. 서비스 지역은 ClickHouse 인스턴스가 실행되는 지역입니다.

"서비스 이름을 확인할 수 없습니다."라는 오류가 발생하면 고객 지원팀에 연락하여 새 지역을 지원 지역 목록에 추가하도록 요청하십시오.

다음으로 VPC 및 서브넷을 선택합니다:

<Image img={aws_private_link_select_vpc} size="md" alt="Select VPC and subnets" border />

선택적 단계로 보안 그룹/태그를 할당합니다:

:::note
포트 `443`, `8443`, `9440`, `3306`이 보안 그룹에서 허용되어 있는지 확인하십시오.
:::

VPC 엔드포인트를 만든 후, `Endpoint ID` 값을 메모하십시오. 이후 단계에서 필요합니다.

<Image img={aws_private_link_vpc_endpoint_id} size="md" alt="VPC Endpoint ID" border/>

#### 옵션 2: AWS CloudFormation {#option-2-aws-cloudformation}

다음으로, [엔드포인트 "서비스 이름"씩 획득한 로그인 정보](#obtain-endpoint-service-info)에서 받은 `Service name`<sup>콘솔</sup> 또는 `endpointServiceId`<sup>API</sup>를 사용하여 VPC 엔드포인트를 생성해야 합니다. 올바른 서브넷 ID, 보안 그룹 및 VPC ID를 사용하는지 확인하십시오.

```response
Resources:
  ClickHouseInterfaceEndpoint:
    Type: 'AWS::EC2::VPCEndpoint'
    Properties:
      VpcEndpointType: Interface
      PrivateDnsEnabled: false
      ServiceName: <Service name(endpointServiceId), pls see above>
      VpcId: vpc-vpc_id
      SubnetIds:
        - subnet-subnet_id1
        - subnet-subnet_id2
        - subnet-subnet_id3
      SecurityGroupIds:
        - sg-security_group_id1
        - sg-security_group_id2
        - sg-security_group_id3
```

VPC 엔드포인트를 생성한 후, `Endpoint ID` 값을 메모하십시오. 이후 단계에서 필요합니다.

#### 옵션 3: Terraform {#option-3-terraform}

아래의 `service_name`은 [엔드포인트 "서비스 이름"씩 획득한 로그인 정보](#obtain-endpoint-service-info)에서 받은 `Service name`<sup>콘솔</sup> 또는 `endpointServiceId`<sup>API</sup>입니다.

```json
resource "aws_vpc_endpoint" "this" {
  vpc_id            = var.vpc_id
  service_name      = "<pls see comment above>"
  vpc_endpoint_type = "Interface"
  security_group_ids = [
    Var.security_group_id1,var.security_group_id2, var.security_group_id3,
  ]
  subnet_ids          = [var.subnet_id1,var.subnet_id2,var.subnet_id3]
  private_dns_enabled = false
  service_region      = "(Optional) If specified, the VPC endpoint will connect to the service in the provided region. Define it for multi-regional PrivateLink connections."
}
```

VPC 엔드포인트를 생성한 후, `Endpoint ID` 값을 메모하십시오. 이후 단계에서 필요합니다.

#### 엔드포인트에 대해 개인 DNS 이름 설정 {#set-private-dns-name-for-endpoint}

:::note
DNS를 구성하는 방법은 여러 가지가 있습니다. 특정 사용 사례에 따라 DNS를 설정하십시오.
:::

[엔드포인트 "서비스 이름"씩 획득한 로그인 정보](#obtain-endpoint-service-info)에서 가져온 "DNS 이름"을 AWS 엔드포인트 네트워크 인터페이스로 지정해야 합니다. 이는 VPC/네트워크 내의 서비스/구성 요소들이 이를 올바르게 해석할 수 있도록 보장합니다.

### ClickHouse 서비스 허용 목록에 "Endpoint ID" 추가 {#add-endpoint-id-to-services-allow-list}

#### 옵션 1: ClickHouse Cloud 콘솔 {#option-1-clickhouse-cloud-console-2}

추가하려면 ClickHouse Cloud 콘솔로 이동하여 PrivateLink를 통해 연결할 서비스로 이동한 다음 **설정**으로 가십시오. **개인 엔드포인트 설정**을 클릭하여 개인 엔드포인트 설정을 엽니다. [Create AWS Endpoint](#create-aws-endpoint) 단계에서 얻은 `Endpoint ID`를 입력합니다. "엔드포인트 생성"을 클릭합니다.

:::note
기존 PrivateLink 연결에서 액세스를 허용하려면 기존 엔드포인트 드롭다운 메뉴를 사용하십시오.
:::

<Image img={aws_private_link_pe_filters} size="md" alt="Private Endpoints Filter" border/>

제거하려면 ClickHouse Cloud 콘솔로 이동하여 서비스를 찾고, 해당 서비스의 **설정**으로 이동한 후 제거하려는 엔드포인트를 찾습니다. 목록에서 제거합니다.

#### 옵션 2: API {#option-2-api-2}

PrivateLink를 사용하여 접근할 수 있어야 하는 각 인스턴스에 대해 허용 목록에 Endpoint ID를 추가해야 합니다.

[Create AWS Endpoint](#create-aws-endpoint) 단계의 데이터를 사용하여 `ENDPOINT_ID` 환경 변수를 설정하십시오.

명령어를 실행하기 전에 다음 환경 변수를 설정합니다:

```bash
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

허용 목록에 엔드포인트 ID를 추가하려면:

```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "add": [
      "${ENDPOINT_ID:?}"
    ]
  }
}
EOF

curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X PATCH -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" \
-d @pl_config.json | jq
```

허용 목록에서 엔드포인트 ID를 제거하려면:

```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "remove": [
      "${ENDPOINT_ID:?}"
    ]
  }
}
EOF

curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X PATCH -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" \
-d @pl_config.json | jq
```

### PrivateLink를 사용하여 인스턴스에 접근하기 {#accessing-an-instance-using-privatelink}

Private Link가 활성화된 각 서비스에는 공용 및 개인 엔드포인트가 있습니다. Private Link를 통해 연결하려면 [Obtain Endpoint "Service name"](#obtain-endpoint-service-info) 단계에서 받은 `privateDnsHostname`<sup>API</sup> 또는 `DNS Name`<sup>console</sup>을 사용해야 합니다.

#### 개인 DNS 호스트 이름 가져오기 {#getting-private-dns-hostname}

##### 옵션 1: ClickHouse Cloud 콘솔 {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloud 콘솔에서 **설정**으로 이동합니다. **개인 엔드포인트 설정** 버튼을 클릭합니다. 열리는 사이드 메뉴에서 **DNS 이름**을 복사합니다.

<Image img={aws_private_link_ped_nsname} size="md" alt="Private Endpoint DNS Name" border />

##### 옵션 2: API {#option-2-api-3}

명령어를 실행하기 전에 다음 환경 변수를 설정합니다:

```bash
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
INSTANCE_ID=<Your ClickHouse service name>
```

[step](#option-2-api)에서 `INSTANCE_ID`를 가져올 수 있습니다.

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

이 명령은 다음과 같은 결과를 출력해야 합니다:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

이 예제에서는 `privateDnsHostname` 호스트 이름의 값을 통해 PrivateLink로 연결되지만, `endpointServiceId` 호스트 이름을 통해서는 인터넷을 통해 연결됩니다.

## 문제 해결 {#troubleshooting}

### 한 지역의 여러 PrivateLink {#multiple-privatelinks-in-one-region}

대부분의 경우, 각 VPC에 대해 단일 엔드포인트 서비스만 생성하면 됩니다. 이 엔드포인트는 VPC에서 여러 ClickHouse Cloud 서비스로 요청을 라우팅할 수 있습니다. [여기](#considerations)를 참조하십시오.

### 개인 엔드포인트에 대한 연결 시간 초과 {#connection-to-private-endpoint-timed-out}

- VPC 엔드포인트에 보안 그룹을 연결하십시오.
- 엔드포인트에 연결된 보안 그룹에서 `inbound` 규칙을 확인하고 ClickHouse 포트를 허용하십시오.
- 연결 테스트에 사용된 VM에 연결된 보안 그룹에서 `outbound` 규칙을 확인하고 ClickHouse 포트에 대한 연결을 허용하십시오.

### 개인 호스트 이름: 호스트의 주소를 찾을 수 없음 {#private-hostname-not-found-address-of-host}

- DNS 구성을 확인하십시오.

### 동료에 의한 연결 재설정 {#connection-reset-by-peer}

- 엔드포인트 ID가 서비스 허용 목록에 추가되지 않았을 가능성이 높습니다. [단계](#add-endpoint-id-to-services-allow-list)를 방문하십시오.

### 엔드포인트 필터 확인 {#checking-endpoint-filters}

명령어를 실행하기 전에 다음 환경 변수를 설정합니다:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

[step](#option-2-api)에서 `INSTANCE_ID`를 가져올 수 있습니다.

```shell
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X GET -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | \
jq .result.privateEndpointIds
```

### 원격 데이터베이스에 연결 {#connecting-to-a-remote-database}

[MySQL](/sql-reference/table-functions/mysql) 또는 [PostgreSQL](/sql-reference/table-functions/postgresql) 테이블 함수를 사용하여 ClickHouse Cloud에서 AWS VPC에 호스팅된 데이터베이스에 연결하려고 한다고 가정해 보겠습니다. AWS PrivateLink는 이 연결을 안전하게 활성화하는 데 사용될 수 없습니다. PrivateLink는 단방향 연결입니다. 내부 네트워크 또는 Amazon VPC가 ClickHouse Cloud에 안전하게 연결할 수 있도록 하지만, ClickHouse Cloud가 내부 네트워크에 연결할 수는 없습니다.

[AWS PrivateLink 문서](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html)에 따르면:

> 클라이언트/서버 설정을 사용할 때 AWS PrivateLink를 사용하십시오. 여기서 하나 이상의 소비자 VPC에 서비스 제공자 VPC의 특정 서비스 또는 인스턴스 집합에 대해 단방향 액세스를 허용하려고 합니다. 소비자 VPC의 클라이언트만 서비스 제공자 VPC의 서비스에 연결을 시작할 수 있습니다.

이를 위해 ClickHouse Cloud에서 내부/개인 데이터베이스 서비스로의 연결을 허용하도록 AWS 보안 그룹을 구성하십시오. [ClickHouse Cloud 지역별 기본 이탈 IP 주소]( /manage/data-sources/cloud-endpoints-api)와 함께 [사용 가능한 정적 IP 주소](https://api.clickhouse.cloud/static-ips.json)를 확인하십시오.
