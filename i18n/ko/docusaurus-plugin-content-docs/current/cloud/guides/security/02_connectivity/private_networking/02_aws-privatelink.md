---
title: 'AWS PrivateLink'
description: '이 문서는 AWS PrivateLink를 사용하여 ClickHouse Cloud에 연결하는 방법을 설명합니다.'
slug: /manage/security/aws-privatelink
keywords: ['PrivateLink']
doc_type: 'guide'
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


# AWS PrivateLink \{#aws-privatelink\}

<ScalePlanFeatureBadge feature="AWS PrivateLink"/>

[AWS PrivateLink](https://aws.amazon.com/privatelink/)을 사용하면 VPC, AWS 서비스, 온프레미스 시스템과 ClickHouse Cloud 간에 보안 연결을 설정하면서 트래픽을 퍼블릭 인터넷에 노출하지 않을 수 있습니다. 이 문서에서는 AWS PrivateLink를 사용하여 ClickHouse Cloud에 연결하는 절차를 설명합니다.

ClickHouse Cloud 서비스에 대한 액세스를 AWS PrivateLink 주소로만 제한하려면 ClickHouse Cloud [IP Access Lists](/cloud/security/setting-ip-filters)에 제공된 안내를 따르십시오.

:::note
ClickHouse Cloud는 다음 리전에서 [크로스 리전(cross-region) PrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/)를 지원합니다:

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
요금 관련 사항: AWS는 크로스 리전 데이터 전송에 대해 요금을 부과합니다. 자세한 요금은 [여기](https://aws.amazon.com/privatelink/pricing/)에서 확인할 수 있습니다.
:::

**AWS PrivateLink를 활성화하려면 다음을 완료하십시오**:

1. Endpoint "Service name"을 확인합니다.
1. AWS Endpoint를 생성합니다.
1. "Endpoint ID"를 ClickHouse Cloud 조직에 추가합니다.
1. "Endpoint ID"를 ClickHouse 서비스 허용 목록(allow list)에 추가합니다.

Terraform 예시는 [여기](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)에서 확인할 수 있습니다.

## 중요한 고려 사항 \{#considerations\}

ClickHouse는 동일한 AWS 리전 내에서 이미 게시된 [service endpoint](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview)를 재사용할 수 있도록 서비스를 그룹화하려고 합니다. 다만, 특히 서비스를 여러 ClickHouse 조직에 분산해 둔 경우에는 이러한 그룹화가 항상 보장되지는 않습니다.
이미 ClickHouse 조직 내 다른 서비스에 대해 PrivateLink를 구성해 둔 경우, 이러한 그룹화 덕분에 대부분의 단계를 건너뛰고 마지막 단계인 ClickHouse 서비스 허용 목록에 ClickHouse "Endpoint ID"를 추가하는 단계로 바로 넘어갈 수 있습니다.

## 이 과정의 사전 준비 사항 \{#prerequisites\}

시작하기 전에 다음이 필요합니다.

1. AWS 계정
1. ClickHouse 측에서 프라이빗 엔드포인트를 생성하고 관리할 수 있는 권한이 부여된 [ClickHouse API key](/cloud/manage/openapi)

## 단계 \{#steps\}

다음 단계를 수행하여 AWS PrivateLink을 통해 ClickHouse Cloud 서비스에 연결합니다.

### 엔드포인트 "Service name" 확인 \{#obtain-endpoint-service-info\}

#### 옵션 1: ClickHouse Cloud 콘솔 \{#option-1-clickhouse-cloud-console\}

ClickHouse Cloud 콘솔에서 PrivateLink로 연결할 서비스를 연 후 **Settings** 메뉴로 이동합니다.

<Image img={aws_private_link_pecreate} size="md" alt="Private Endpoints" border />

`Service name`과 `DNS name`을 메모해 둔 후 [다음 단계로 진행합니다](#create-aws-endpoint).

#### 옵션 2: API \{#option-2-api\}

먼저 명령을 실행하기 전에 다음 환경 변수를 설정하십시오.

```shell
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

리전, 공급자 및 서비스 이름으로 필터링하여 ClickHouse `INSTANCE_ID`를 조회하십시오:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

PrivateLink 구성을 위해 `endpointServiceId` 및 `privateDnsHostname` 값을 확인하십시오:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

이 명령은 다음과 유사한 결과를 출력합니다:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

`endpointServiceId`와 `privateDnsHostname` 값을 메모해 두고 [다음 단계로 이동하십시오](#create-aws-endpoint).


### AWS 엔드포인트 생성 \{#create-aws-endpoint\}

:::important
이 섹션에서는 AWS PrivateLink를 통해 ClickHouse를 구성하기 위한 ClickHouse 관련 세부 정보만 다룹니다. AWS 관련 단계는 어디를 참고해야 하는지 안내하기 위한 참고용으로 제공되며, AWS Cloud 제공자의 별도 공지 없이 시간이 지나면서 변경될 수 있습니다. 구체적인 사용 사례에 따라 AWS 구성을 검토하시기 바랍니다.  

또한 필요한 AWS VPC 엔드포인트, 보안 그룹 규칙, DNS 레코드 구성을 ClickHouse에서 책임지지 않습니다.  

이전에 PrivateLink를 설정하는 과정에서 「private DNS names」를 활성화했고, PrivateLink를 통해 새 서비스를 구성하는 데 어려움을 겪고 있다면 ClickHouse 지원팀에 문의하십시오. AWS 구성 작업과 관련된 그 밖의 문제에 대해서는 AWS Support에 직접 문의하십시오.
:::

#### 옵션 1: AWS 콘솔 \{#option-1-aws-console\}

AWS 콘솔을 열고 **VPC** → **Endpoints** → **Create endpoints** 로 이동합니다.

**Endpoint services that use NLBs and GWLBs** 를 선택하고, **Service Name** 필드에 [Obtain Endpoint "Service name" ](#obtain-endpoint-service-info) 단계에서 확인한 `Service name`<sup>console</sup> 또는 `endpointServiceId`<sup>API</sup> 값을 입력합니다. 그런 다음 **Verify service** 를 클릭합니다:

<Image img={aws_private_link_endpoint_settings} size="md" alt="AWS PrivateLink Endpoint Settings" border/>

PrivateLink를 통해 리전 간 연결을 설정하려는 경우, "Cross region endpoint" 체크박스를 선택하고 서비스 리전을 지정합니다. 서비스 리전은 ClickHouse 인스턴스가 실행 중인 리전입니다.

"Service name couldn't be verified." 오류가 표시되면, 지원되는 리전 목록에 새 리전을 추가해 달라고 Customer Support에 문의하십시오.

다음으로 VPC와 서브넷을 선택합니다:

<Image img={aws_private_link_select_vpc} size="md" alt="Select VPC and subnets" border />

선택적으로 보안 그룹/태그(Security groups/Tags)를 지정할 수 있습니다:

:::note
보안 그룹에서 포트 `443`, `8443`, `9440`, `3306` 이 허용되어 있는지 확인하십시오.
:::

VPC Endpoint를 생성한 후, `Endpoint ID` 값을 기록해 두십시오. 이후 단계에서 필요합니다.

<Image img={aws_private_link_vpc_endpoint_id} size="md" alt="VPC Endpoint ID" border/>

#### 옵션 2: AWS CloudFormation \{#option-2-aws-cloudformation\}

다음으로, [Obtain Endpoint 「Service name」](#obtain-endpoint-service-info) 단계에서 얻은 `Service name`<sup>console</sup> 또는 `endpointServiceId`<sup>API</sup>를 사용하여 VPC Endpoint를 생성해야 합니다.
정확한 서브넷 ID, 보안 그룹, VPC ID를 사용하는지 확인하십시오.

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

VPC Endpoint를 생성한 후 `Endpoint ID` 값을 메모해 두십시오. 이후 단계에서 필요합니다.


#### 옵션 3: Terraform \{#option-3-terraform\}

아래 `service_name`은 [Obtain Endpoint &quot;Service name&quot;](#obtain-endpoint-service-info) 단계에서 얻은 `Service name`<sup>console</sup> 또는 `endpointServiceId`<sup>API</sup> 값입니다.

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

VPC Endpoint를 생성한 후 `Endpoint ID` 값을 메모해 두십시오. 이후 단계에서 사용합니다.


#### 엔드포인트의 프라이빗 DNS 이름 설정 \{#set-private-dns-name-for-endpoint\}

:::note
DNS를 구성하는 방법은 여러 가지가 있습니다. 사용 사례에 맞게 DNS를 설정하십시오.
:::

[엔드포인트 "Service name" 가져오기](#obtain-endpoint-service-info) 단계에서 가져온 "DNS name"이 AWS 엔드포인트 네트워크 인터페이스를 가리키도록 설정해야 합니다. 이렇게 하면 VPC/네트워크 내 서비스와 구성 요소에서 해당 이름을 올바르게 이름 해석할 수 있습니다.

### ClickHouse 서비스 허용 목록에 「Endpoint ID」 추가 \{#add-endpoint-id-to-services-allow-list\}

#### 옵션 1: ClickHouse Cloud 콘솔 \{#option-1-clickhouse-cloud-console-2\}

추가하려면 ClickHouse Cloud 콘솔로 이동하여 PrivateLink로 연결하려는 서비스를 연 다음 **Settings**로 이동합니다. **Set up private endpoint**를 클릭하여 프라이빗 엔드포인트 설정을 엽니다. [Create AWS Endpoint](#create-aws-endpoint) 단계에서 얻은 `Endpoint ID`를 입력한 후 「Create endpoint」를 클릭합니다.

:::note
기존 PrivateLink 연결에서 접근을 허용하려는 경우, 기존 엔드포인트 드롭다운 메뉴를 사용하십시오.
:::

<Image img={aws_private_link_pe_filters} size="md" alt="Private Endpoints Filter" border/>

제거하려면 ClickHouse Cloud 콘솔로 이동하여 해당 서비스를 찾은 뒤, 서비스의 **Settings**로 이동해 제거하려는 엔드포인트를 찾습니다. 엔드포인트 목록에서 해당 항목을 제거하십시오. 

#### 옵션 2: API \{#option-2-api-2\}

PrivateLink으로 액세스할 수 있어야 하는 각 인스턴스에 대해 Endpoint ID를 allow-list에 추가해야 합니다.

[Create AWS Endpoint](#create-aws-endpoint) 단계에서 생성한 값을 사용하여 `ENDPOINT_ID` 환경 변수를 설정합니다.

어떤 명령을 실행하기 전에 다음 환경 변수를 설정하십시오:

```bash
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

엔드포인트 ID를 허용 목록(allow-list)에 추가하려면:

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

엔드포인트 ID를 허용 목록에서 제거하려면:

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


### PrivateLink을 사용하여 인스턴스에 액세스하기 \{#accessing-an-instance-using-privatelink\}

Private Link이 활성화된 각 서비스에는 퍼블릭 엔드포인트와 프라이빗 엔드포인트가 있습니다. Private Link를 사용해 연결하려면 [Obtain Endpoint "Service name"](#obtain-endpoint-service-info)에서 확인한 `privateDnsHostname`<sup>API</sup> 또는 `DNS Name`<sup>console</sup> 프라이빗 엔드포인트를 사용해야 합니다.

#### 프라이빗 DNS 호스트 이름 확인하기 \{#getting-private-dns-hostname\}

##### 옵션 1: ClickHouse Cloud 콘솔 \{#option-1-clickhouse-cloud-console-3\}

ClickHouse Cloud 콘솔에서 **Settings**로 이동합니다. **Set up private endpoint** 버튼을 클릭합니다. 열리는 플라이아웃 창에서 **DNS Name**을 복사합니다.

<Image img={aws_private_link_ped_nsname} size="md" alt="프라이빗 엔드포인트 DNS 이름" border />

##### 옵션 2: API \{#option-2-api-3\}

명령을 실행하기 전에 다음 환경 변수를 설정하십시오.

```bash
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
INSTANCE_ID=<Your ClickHouse service name>
```

`INSTANCE_ID`는 [해당 단계](#option-2-api)에서 확인할 수 있습니다.

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

다음과 유사한 출력이 표시됩니다:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

이 예시에서는 `privateDnsHostname` 호스트 이름 값을 사용한 연결은 PrivateLink로 라우팅되지만, `endpointServiceId` 호스트 이름을 사용한 연결은 인터넷을 통해 라우팅됩니다.


## 문제 해결 \{#troubleshooting\}

### 단일 리전에서 여러 PrivateLink 사용 \{#multiple-privatelinks-in-one-region\}

대부분의 경우 각 VPC마다 엔드포인트 서비스를 하나만 생성하면 충분합니다. 이 엔드포인트는 해당 VPC에서 여러 ClickHouse Cloud 서비스로의 요청을 라우팅할 수 있습니다.  
자세한 내용은 [여기](#considerations)를 참고하십시오.

### 프라이빗 엔드포인트에 대한 연결 시간 초과 \{#connection-to-private-endpoint-timed-out\}

- VPC 엔드포인트에 보안 그룹을 연결하십시오.
- 엔드포인트에 연결된 보안 그룹의 `inbound` 규칙을 확인하고 ClickHouse 포트를 허용하십시오.
- 연결 테스트에 사용되는 VM에 연결된 보안 그룹의 `outbound` 규칙을 확인하고 ClickHouse 포트로의 연결을 허용하십시오.

### Private Hostname: 호스트 주소를 찾을 수 없습니다 \{#private-hostname-not-found-address-of-host\}

- DNS 구성을 확인하십시오.

### 피어에 의해 연결이 재설정됨 \{#connection-reset-by-peer\}

- 대부분의 경우 Endpoint ID가 서비스 허용 목록에 추가되지 않아서 발생합니다. [해당 단계](#add-endpoint-id-to-services-allow-list)를 참조하십시오.

### 엔드포인트 필터 확인 \{#checking-endpoint-filters\}

명령을 실행하기 전에 다음 환경 변수를 먼저 설정합니다:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

`INSTANCE_ID`는 [해당 단계](#option-2-api)에서 확인할 수 있습니다.

```shell
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X GET -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | \
jq .result.privateEndpointIds
```


### 원격 데이터베이스에 연결 \{#connecting-to-a-remote-database\}

ClickHouse Cloud에서 [MySQL](/sql-reference/table-functions/mysql) 또는 [PostgreSQL](/sql-reference/table-functions/postgresql) 테이블 함수를 사용하여 Amazon Web Services (AWS) VPC에 호스팅된 데이터베이스에 연결한다고 가정합니다. 이 연결을 안전하게 설정하기 위해 AWS PrivateLink를 사용할 수 없습니다. PrivateLink는 단방향, 일방향 연결입니다. 내부 네트워크나 Amazon VPC가 ClickHouse Cloud에 안전하게 연결되도록 해 주지만, ClickHouse Cloud가 내부 네트워크에 연결하는 것은 허용하지 않습니다.

[AWS PrivateLink 문서](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html)에 따르면:

> 클라이언트/서버 구성이 있고, 하나 이상의 consumer VPC에 service provider VPC의 특정 서비스나 인스턴스 집합에 대한 단방향 액세스를 허용하려는 경우 AWS PrivateLink를 사용하십시오. consumer VPC의 클라이언트만 service provider VPC의 서비스에 대한 연결을 시작할 수 있습니다.

이를 위해 AWS Security Groups(보안 그룹)을 구성하여 ClickHouse Cloud에서 내부/프라이빗 데이터베이스 서비스로의 연결을 허용하십시오. [ClickHouse Cloud 리전의 기본 egress IP 주소](/manage/data-sources/cloud-endpoints-api)와 [사용 가능한 고정 IP 주소](https://api.clickhouse.cloud/static-ips.json)를 함께 확인하십시오.