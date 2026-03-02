---
slug: /cloud/data-sources/secure-azure
sidebar_label: 'Azure 데이터에 안전하게 접근하기'
title: 'ClickHouse Cloud를 Azure Blob Storage에 연결하기'
description: '이 문서에서는 ClickHouse Cloud 고객이 Azure 데이터에 안전하게 접근하는 방법을 설명합니다'
keywords: ['ABS', 'azure blob storage']
doc_type: 'guide'
---

이 가이드는 데이터 수집, 외부 테이블 구성 및 기타 통합 시나리오를 위해 ClickHouse Cloud를 Azure Blob Storage에 안전하게 연결하는 방법을 설명합니다.

## Overview \{#overview\}

ClickHouse Cloud는 여러 인증 방법을 사용하여 Azure Blob Storage에 연결할 수 있습니다.
이 가이드는 적절한 방법을 선택하고 연결을 안전하게 구성하는 데 도움이 됩니다.

지원되는 사용 사례:

- [azureBlobStorage table function](/sql-reference/table-functions/azureBlobStorage)을 사용하여 Azure Blob Storage에서 데이터 읽기
- [AzureBlobStorage table engine](/engines/table-engines/integrations/azureBlobStorage)을 사용하여 외부 테이블 생성 
- ClickPipes를 통한 데이터 수집
- [Azure Blob Storage에 백업 저장](/cloud/manage/backups/backup-restore-via-ui#azure)

:::warning 중요한 네트워크 제한 사항
ClickHouse Cloud 서비스와 Azure Blob Storage 컨테이너가 동일한 Azure 리전에 배포된 경우 IP 주소 화이트리스트는 작동하지 않습니다.

이는 Azure가 동일 리전 트래픽을 공용 인터넷과 NAT 게이트웨이를 우회하여 내부 네트워크(VNet + Service Endpoints)를 통해 라우팅하기 때문입니다.
그 결과, 공용 IP 주소를 기준으로 하는 Azure Storage Account 방화벽 규칙이 적용되지 않습니다.

다음과 같은 경우 IP 화이트리스트가 작동합니다:

- ClickHouse Cloud 서비스가 Storage Account와 다른 Azure 리전에 있는 경우
- ClickHouse Cloud 서비스가 AWS/GCP에 있고 Azure Storage에 연결하는 경우

다음과 같은 경우 IP 화이트리스트는 작동하지 않습니다:

- ClickHouse Cloud 서비스와 Storage가 동일한 Azure 리전에 있는 경우. IP 화이트리스트 대신 연결 문자열을 통한 [Shared Access Signatures (SAS)](/integrations/clickpipes/object-storage/abs/overview#authentication)를 사용하거나 ABS와 ClickHouse를 서로 다른 리전에 배포하십시오.
:::

## 네트워크 구성(크로스 리전 전용) \{#network-config\}

:::warning Cross-Region Only
이 섹션은 ClickHouse Cloud 서비스와 Azure Blob Storage 컨테이너가 서로 다른 Azure 리전에 있거나, ClickHouse Cloud가 AWS나 GCP에서 실행되는 경우에만 적용됩니다.
동일 리전에 배포되어 있다면 대신 SAS 토큰을 사용하십시오.
:::

<VerticalStepper headerLevel="h3">

### ClickHouse Cloud egress IP 주소 확인 \{#find-egress-ips\}

IP 기반 방화벽 규칙을 구성하려면 ClickHouse Cloud 리전에 대한 egress IP 주소를 허용 목록에 추가해야 합니다.

다음 명령을 실행하여 리전별 egress 및 ingress IP 목록을 가져옵니다.  
아래 `eastus`를 사용 중인 리전으로 바꾸어 다른 리전은 제외하십시오:

```bash
# For Azure regions
curl https://api.clickhouse.cloud/static-ips.json | jq '.azure[] | select(.region == "westus")'
```

다음과 유사한 출력이 표시됩니다:

```response
{
  "egress_ips": [
    "20.14.94.21",
    "20.150.217.205",
    "20.38.32.164"
  ],
  "ingress_ips": [
    "4.227.34.126"
  ],
  "region": "westus3"
}
```

:::tip
지원되는 Cloud 리전 목록은 [Azure regions](/cloud/reference/supported-regions#azure-regions)를 참고하고,
사용해야 하는 이름은 [Azure regions list](https://learn.microsoft.com/en-us/azure/reliability/regions-list#azure-regions-list-1)의 "Programmatic name" 컬럼을 참고하십시오.
:::

자세한 내용은 [Cloud IP addresses](/manage/data-sources/cloud-endpoints-api) 문서에서 확인하십시오.

### Azure Storage 방화벽 설정 \{#configure-firewall\}

Azure Portal에서 Storage Account로 이동합니다.

1. **Networking** → **Firewalls and virtual networks**로 이동합니다.
2. **Enabled from selected virtual networks and IP addresses**를 선택합니다.
3. 이전 단계에서 얻은 각 ClickHouse Cloud egress IP 주소를 Address range 필드에 추가합니다.

:::warning
ClickHouse Cloud 프라이빗 IP(10.x.x.x 주소)는 추가하지 마십시오.
:::

4. "Save"를 클릭합니다.

자세한 내용은 [Configure Azure Storage firewalls 문서](https://learn.microsoft.com/en-us/azure/storage/common/storage-network-security?tabs=azure-portal)를 참고하십시오.

</VerticalStepper>

## ClickPipes 구성 \{#clickpipes-config\}

Azure Blob Storage와 함께 [ClickPipes](/integrations/clickpipes)를 사용할 때는 ClickPipes UI에서 인증을 구성해야 합니다.
자세한 내용은 ["첫 번째 Azure ClickPipe 생성"](/integrations/clickpipes/object-storage/azure-blob-storage/get-started)을 참조하십시오.

:::note
ClickPipes는 외부로 나가는(outbound) 연결에 별도의 고정 IP 주소를 사용합니다.
IP 기반 방화벽 규칙을 사용하는 경우 이 IP들을 허용 목록(allowlist)에 추가해야 합니다.

["고정 IP 목록"](/integrations/clickpipes#list-of-static-ips)을 참조하십시오.
:::

:::tip
이 문서의 시작 부분에서 언급한 동일 리전 IP 허용 목록 제한 사항은 ClickPipes에도 동일하게 적용됩니다.
ClickPipes 서비스와 Azure Blob Storage가 동일한 리전에 있는 경우 IP 허용 목록 대신 SAS 토큰 인증을 사용하십시오.
:::