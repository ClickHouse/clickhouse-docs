---
'title': '지원되는 클라우드 지역'
'sidebar_label': '지원되는 클라우드 지역'
'keywords':
- 'aws'
- 'gcp'
- 'google cloud'
- 'azure'
- 'cloud'
- 'regions'
'description': 'ClickHouse Cloud를 위한 지원되는 지역'
'slug': '/cloud/reference/supported-regions'
'doc_type': 'reference'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# 지원되는 클라우드 지역

## AWS 지역 {#aws-regions}

- ap-northeast-1 (도쿄)
- ap-northeast-2 (대한민국, 서울)
- ap-south-1 (뭄바이)
- ap-southeast-1 (싱가포르)
- ap-southeast-2 (시드니)
- eu-central-1 (프랑크푸르트)
- eu-west-1 (아일랜드)
- eu-west-2 (런던)
- me-central-1 (UAE)
- us-east-1 (노스 버지니아)
- us-east-2 (오하이오)
- us-west-2 (오리건)

**프라이빗 지역:**
- ca-central-1 (캐나다)
- af-south-1 (남아프리카)
- eu-north-1 (스톡홀름)
- sa-east-1 (남아메리카)
 
## Google Cloud 지역 {#google-cloud-regions}

- asia-southeast1 (싱가포르)
- asia-northeast1 (도쿄)
- europe-west4 (네덜란드)
- us-central1 (아이오와)
- us-east1 (사우스캐롤라이나)

**프라이빗 지역:**

- us-west1 (오리건)
- australia-southeast1 (시드니)
- europe-west3 (프랑크푸르트)
- europe-west6 (취리히)
- northamerica-northeast1 (몬트리올)

## Azure 지역 {#azure-regions}

- West US 3 (애리조나)
- East US 2 (버지니아)
- Germany West Central (프랑크푸르트)

**프라이빗 지역:**

- JapanEast

:::note
현재 목록에 없는 지역에 배포해야 합니까? [요청하기](https://clickhouse.com/pricing?modal=open).
:::

## 프라이빗 지역 {#private-regions}

<EnterprisePlanFeatureBadge feature="프라이빗 지역 기능"/>

우리는 엔터프라이즈 계층 서비스에 대해 프라이빗 지역을 제공합니다. 프라이빗 지역 요청은 [연락해 주세요](https://clickhouse.com/company/contact).

프라이빗 지역에 대한 핵심 고려 사항:
- 서비스는 자동 확장되지 않으며, 수동 수직 및 수평 확장이 지원됩니다.
- 서비스는 유휴 상태가 될 수 없습니다.
- 프라이빗 지역에 대한 상태 페이지는 제공되지 않습니다.

HIPAA 준수를 위한 추가 요구 사항이 적용될 수 있습니다(BAA 서명 포함). HIPAA는 현재 엔터프라이즈 계층 서비스에서만 사용할 수 있습니다.

## HIPAA 준수 지역 {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

고객은 HIPAA 준수 지역에 서비스를 설정하기 위해 사업 파트너 계약(Business Associate Agreement, BAA)에 서명하고 영업 또는 지원을 통해 온boarding 요청을 해야 합니다. 다음 지역은 HIPAA 준수를 지원합니다:
- AWS af-south-1 (남아프리카) **프라이빗 지역**
- AWS ca-central-1 (캐나다) **프라이빗 지역**
- AWS eu-central-1 (프랑크푸르트)
- AWS eu-north-1 (스톡홀름) **프라이빗 지역**
- AWS eu-west-1 (아일랜드)
- AWS eu-west-2 (런던)
- AWS sa-east-1 (남아메리카) **프라이빗 지역**
- AWS us-east-1 (노스 버지니아)
- AWS us-east-2 (오하이오)
- AWS us-west-2 (오리건)
- GCP europe-west4 (네덜란드)
- GCP us-central1 (아이오와)
- GCP us-east1 (사우스캐롤라이나)

## PCI 준수 지역 {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature="PCI" support="true"/>

고객은 PCI 준수 지역에 서비스를 설정하기 위해 영업 또는 지원을 통해 온boarding 요청을 해야 합니다. 다음 지역은 PCI 준수를 지원합니다:
- AWS af-south-1 (남아프리카) **프라이빗 지역**
- AWS ca-central-1 (캐나다) **프라이빗 지역**
- AWS eu-central-1 (프랑크푸르트)
- AWS eu-north-1 (스톡홀름) **프라이빗 지역**
- AWS eu-west-1 (아일랜드)
- AWS eu-west-2 (런던)
- AWS sa-east-1 (남아메리카) **프라이빗 지역**
- AWS us-east-1 (노스 버지니아)
- AWS us-east-2 (오하이오)
- AWS us-west-2 (오리건)
