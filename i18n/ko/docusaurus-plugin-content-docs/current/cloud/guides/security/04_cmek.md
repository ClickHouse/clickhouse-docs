---
sidebar_label: '데이터 암호화'
slug: /cloud/security/cmek
title: '데이터 암호화'
description: 'ClickHouse Cloud에서 데이터 암호화에 대해 자세히 알아봅니다'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', '암호화', 'CMEK', 'KMS 키 폴러']
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import cmek_performance from '@site/static/images/_snippets/cmek-performance.png';


# 데이터 암호화 \{#data-encryption\}

## 스토리지 수준 암호화 \{#storage-encryption\}

ClickHouse Cloud는 기본적으로 클라우드 제공자가 관리하는 AES 256 키를 사용하는 저장 데이터 암호화(encryption at rest)로 구성되어 있습니다. 자세한 내용은 다음 문서를 참고하십시오.

- [S3용 AWS 서버 측 암호화](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingServerSideEncryption.html)
- [저장 데이터에 대한 GCP 기본 암호화](https://cloud.google.com/docs/security/encryption/default-encryption)
- [저장 데이터에 대한 Azure 스토리지 암호화](https://learn.microsoft.com/en-us/azure/storage/common/storage-service-encryption)

## 데이터베이스 수준 암호화 \{#database-encryption\}

<EnterprisePlanFeatureBadge feature="고급 암호화"/>

저장 데이터(data at rest)는 기본적으로 클라우드 제공업체에서 관리하는 AES-256 키를 사용하여 암호화됩니다. 고객은 서비스 데이터에 대한 추가적인 보호 계층을 제공하기 위해 Transparent Data Encryption(TDE)을 활성화하거나, 자체 키를 제공하여 서비스에 Customer Managed Encryption Keys(CMEK)를 구현할 수 있습니다.

고급 암호화는 현재 AWS 및 GCP 서비스에서 사용 가능합니다. Azure 지원은 곧 제공될 예정입니다.

### Transparent Data Encryption (TDE) \{#transparent-data-encryption-tde\}

TDE는 서비스 생성 시에만 활성화할 수 있습니다. 이미 생성된 서비스는 생성 이후에 암호화할 수 없습니다. TDE를 한 번 활성화하면 비활성화할 수 없습니다. 서비스의 모든 데이터는 암호화된 상태로 유지됩니다. TDE를 비활성화하려면 새 서비스를 생성하고 데이터를 해당 서비스로 마이그레이션해야 합니다.

1. `Create new service`를 선택합니다.
2. 서비스 이름을 지정합니다.
3. 드롭다운에서 클라우드 제공업체로 AWS 또는 GCP를 선택하고, 원하는 리전을 선택합니다.
4. Enterprise features 드롭다운을 클릭한 후 「Enable Transparent Data Encryption (TDE)」를 활성화합니다.
5. 「Create service」를 클릭합니다.

### Customer Managed Encryption Keys (CMEK) \{#customer-managed-encryption-keys-cmek\}

:::warning
ClickHouse Cloud 서비스를 암호화하는 데 사용된 KMS 키를 삭제하면 ClickHouse 서비스가 중지되고 기존 백업을 포함한 데이터를 복구할 수 없게 됩니다. 키를 교체할 때 실수로 데이터가 손실되는 것을 방지하려면, 삭제 전에 일정 기간 동안 기존 KMS 키를 유지하는 것이 좋습니다. 
:::

서비스가 TDE로 암호화된 이후에는 키를 업데이트하여 CMEK를 활성화할 수 있습니다. TDE 설정을 업데이트하면 서비스가 자동으로 재시작됩니다. 이 과정에서 이전 KMS 키가 데이터 암호화 키(DEK)를 복호화하고, 새 KMS 키가 DEK를 다시 암호화합니다. 이를 통해 재시작 후 서비스가 이후 암호화 작업에 새 KMS 키를 사용하도록 보장합니다. 이 과정에는 수분 정도가 소요될 수 있습니다.

<details>
    <summary>AWS KMS로 CMEK 활성화</summary>
    
1. ClickHouse Cloud에서 암호화된 서비스를 선택합니다.
2. 왼쪽의 "Settings"를 클릭합니다.
3. 화면 하단에서 "Network security" 정보를 확장합니다.
4. Encryption role ID (AWS) 또는 Encryption Service Account (GCP)를 복사합니다. 이후 단계에서 필요합니다.
5. [AWS용 KMS 키를 생성합니다](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
6. 키를 클릭합니다.
7. AWS 키 정책을 다음과 같이 업데이트합니다:
    
    ```json
    {
        "Sid": "Allow ClickHouse Access",
        "Effect": "Allow",
        "Principal": {
            "AWS": [ "Encryption role ID " ]
        },
        "Action": [
            "kms:Encrypt",
            "kms:Decrypt",
            "kms:ReEncrypt*",
            "kms:DescribeKey"
        ],
        "Resource": "*"
    }
    ```
    
10. 키 정책을 저장합니다.
11. Key ARN을 복사합니다.
12. ClickHouse Cloud로 돌아가 Service Settings의 Transparent Data Encryption 섹션에 Key ARN을 붙여넣습니다.
13. 변경 내용을 저장합니다.
    
</details>

<details>
    <summary>GCP KMS로 CMEK 활성화</summary>

1. ClickHouse Cloud에서 암호화된 서비스를 선택합니다.
2. 왼쪽의 "Settings"를 클릭합니다.
3. 화면 하단에서 "Network security" 정보를 확장합니다.
4. Encryption Service Account (GCP)를 복사합니다. 이후 단계에서 필요합니다.
5. [GCP용 KMS 키를 생성합니다](https://cloud.google.com/kms/docs/create-key)
6. 키를 클릭합니다.
7. 위 4단계에서 복사한 GCP Encryption Service Account에 다음 권한을 부여합니다.
   - Cloud KMS CryptoKey Encrypter/Decrypter
   - Cloud KMS Viewer
10. 키 권한을 저장합니다.
11. Key Resource Path를 복사합니다.
12. ClickHouse Cloud로 돌아가 Service Settings의 Transparent Data Encryption 섹션에 Key Resource Path를 붙여넣습니다.
13. 변경 내용을 저장합니다.
    
</details>

#### 키 회전 \{#key-rotation\}

CMEK을 설정한 후에는 새로운 KMS 키를 생성하고 권한을 부여하는 앞의 절차를 따라 키를 회전합니다. 서비스 설정으로 돌아가 새 ARN(AWS) 또는 Key Resource Path(GCP)를 붙여 넣고 설정을 저장합니다. 서비스는 새 키를 적용하기 위해 다시 시작됩니다.

#### KMS 키 폴러 \{#kms-key-poller\}

CMEK을 사용할 때 제공된 KMS 키의 유효성은 10분마다 확인됩니다. KMS 키에 대한 접근 권한이 유효하지 않게 되면 ClickHouse 서비스가 중지됩니다. 서비스를 다시 시작하려면 이 가이드의 단계를 따라 KMS 키에 대한 접근 권한을 복원한 후 서비스를 재시작하십시오.

### 백업 및 복원 \{#backup-and-restore\}

백업은 해당 서비스와 동일한 키를 사용하여 암호화됩니다. 암호화된 백업을 복원하면 원본 인스턴스와 동일한 KMS 키를 사용하는 암호화된 인스턴스가 생성됩니다. 필요한 경우 복원 후에 KMS 키를 순환(키 로테이션)할 수 있습니다. 자세한 내용은 [키 순환(Key Rotation)](#key-rotation)을 참조하십시오.

## 성능 \{#performance\}

데이터베이스 암호화는 ClickHouse에 내장된 [데이터 암호화를 위한 Virtual File System 기능](/operations/storing-data#encrypted-virtual-file-system)을 활용하여 데이터를 암호화하고 보호합니다. 이 기능에 사용되는 알고리즘은 `AES_256_CTR`이며, 워크로드에 따라 약 5–15%의 성능 저하가 발생할 수 있습니다:

<Image img={cmek_performance} size="lg" alt="CMEK 성능 저하" />