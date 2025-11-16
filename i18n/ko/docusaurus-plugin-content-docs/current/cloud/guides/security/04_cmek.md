---
'sidebar_label': '데이터 암호화'
'slug': '/cloud/security/cmek'
'title': '데이터 암호화'
'description': 'ClickHouse Cloud에서 데이터 암호화에 대해 더 알아보세요.'
'doc_type': 'guide'
'keywords':
- 'ClickHouse Cloud'
- 'encryption'
- 'CMEK'
- 'KMS key poller'
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import cmek_performance from '@site/static/images/_snippets/cmek-performance.png';


# 데이터 암호화

## 스토리지 수준 암호화 {#storage-encryption}

ClickHouse Cloud는 기본적으로 클라우드 제공자가 관리하는 AES 256 키를 이용한 데이터 암호화를 제공하며, 기본적으로 암호화 저장이 구성되어 있습니다. 자세한 내용은 다음을 참조하세요:
- [AWS S3의 서버 측 암호화](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingServerSideEncryption.html)
- [GCP의 기본 암호화](https://cloud.google.com/docs/security/encryption/default-encryption)
- [Azure의 데이터 저장소 암호화](https://learn.microsoft.com/en-us/azure/storage/common/storage-service-encryption)

## 데이터베이스 수준 암호화 {#database-encryption}

<EnterprisePlanFeatureBadge feature="Enhanced Encryption"/>

데이터가 저장될 때 기본적으로 클라우드 제공자가 관리하는 AES 256 키를 사용하여 암호화됩니다. 고객은 서비스 데이터에 대한 추가 보호 계층을 제공하기 위해 투명 데이터 암호화(Transparent Data Encryption, TDE)를 활성화하거나 고객 관리 암호화 키(Customer Managed Encryption Keys, CMEK)를 구현하기 위해 자체 키를 제공할 수 있습니다.

강화된 암호화는 현재 AWS 및 GCP 서비스에서 사용할 수 있으며, Azure는 곧 지원될 예정입니다.

### 투명 데이터 암호화 (TDE) {#transparent-data-encryption-tde}

TDE는 서비스 생성 시 활성화해야 합니다. 기존 서비스는 생성 후 암호화할 수 없습니다. TDE가 활성화되면 비활성화할 수 없습니다. 서비스 내의 모든 데이터는 암호화된 상태로 유지됩니다. TDE를 활성화한 후 비활성화하려면 새 서비스를 생성하고 데이터 이동을 해야 합니다.

1. `새 서비스 생성`을 선택합니다.
2. 서비스를 이름을 지정합니다.
3. 드롭다운에서 클라우드 제공자를 AWS 또는 GCP로 선택하고 원하는 지역을 선택합니다.
4. 기업 기능 드롭다운을 클릭하고 투명 데이터 암호화(TDE) 사용을 전환합니다.
5. 서비스 생성 클릭합니다.

### 고객 관리 암호화 키 (CMEK) {#customer-managed-encryption-keys-cmek}

:::warning
ClickHouse Cloud 서비스의 암호화에 사용된 KMS 키를 삭제하면 ClickHouse 서비스가 중지되고 해당 데이터와 기존 백업이 복구할 수 없게 됩니다. 키를 회전할 때 우발적인 데이터 손실을 방지하기 위해 삭제 전 일정 기간 동안 이전 KMS 키를 유지할 수 있습니다. 
:::

서비스가 TDE로 암호화된 후 고객은 CMEK를 활성화하기 위해 키를 업데이트할 수 있습니다. TDE 설정을 업데이트한 후 서비스는 자동으로 재시작됩니다. 이 과정에서 이전 KMS 키가 데이터 암호화 키(DKE)를 복호화하고 새 KMS 키가 DKE를 다시 암호화합니다. 이로 인해 재시작 시 서비스가 앞으로의 암호화 작업에 대해 새 KMS 키를 사용하게 됩니다. 이 과정은 몇 분이 걸릴 수 있습니다.

<details>
    <summary>AWS KMS로 CMEK 활성화</summary>
    
1. ClickHouse Cloud에서 암호화된 서비스를 선택합니다.
2. 왼쪽에서 설정을 클릭합니다.
3. 화면 하단에서 네트워크 보안 정보를 확장합니다.
4. 암호화 역할 ID (AWS) 또는 암호화 서비스 계정 (GCP)을 복사합니다. 이후 단계에서 이 정보가 필요합니다.
5. [AWS KMS 키 생성](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)을 클릭합니다.
6. 키를 클릭합니다.
7. 다음과 같이 AWS 키 정책을 업데이트합니다:
    
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
11. 키 ARN을 복사합니다.
12. ClickHouse Cloud로 돌아가서 서비스 설정의 투명 데이터 암호화 섹션에 키 ARN을 붙여넣습니다.
13. 변경 사항을 저장합니다.
    
</details>

<details>
    <summary>GCP KMS로 CMEK 활성화</summary>

1. ClickHouse Cloud에서 암호화된 서비스를 선택합니다.
2. 왼쪽에서 설정을 클릭합니다.
3. 화면 하단에서 네트워크 보안 정보를 확장합니다.
4. 위 단계 4에서 복사한 암호화 서비스 계정을 복사합니다. 이후 단계에서 이 정보가 필요합니다.
5. [GCP KMS 키 생성](https://cloud.google.com/kms/docs/create-key)을 클릭합니다.
6. 키를 클릭합니다.
7. 위 단계 4에서 복사한 GCP 암호화 서비스 계정에 다음 권한을 부여합니다.
   - Cloud KMS CryptoKey Encrypter/Decrypter
   - Cloud KMS Viewer
10. 키 권한을 저장합니다.
11. 키 리소스 경로를 복사합니다.
12. ClickHouse Cloud로 돌아가서 서비스 설정의 투명 데이터 암호화 섹션에 키 리소스 경로를 붙여넣습니다.
13. 변경 사항을 저장합니다.
    
</details>

#### 키 회전 {#key-rotation}

CMEK를 설정한 후에는 위 절차에 따라 새 KMS 키를 생성하고 권한을 부여하여 키를 회전합니다. 서비스 설정으로 돌아가서 새 ARN (AWS) 또는 키 리소스 경로 (GCP)를 붙여넣고 설정을 저장합니다. 서비스는 새 키를 적용하기 위해 재시작됩니다.

#### KMS 키 폴러 {#kms-key-poller}

CMEK를 사용할 때 제공된 KMS 키의 유효성이 10분마다 확인됩니다. KMS 키에 대한 접근이 유효하지 않으면 ClickHouse 서비스가 중지됩니다. 서비스를 재개하려면 이 가이드의 절차를 따라 KMS 키에 대한 접근을 복원하고, 이후 서비스를 재시작합니다.

### 백업 및 복원 {#backup-and-restore}

백업은 관련 서비스와 동일한 키를 사용하여 암호화됩니다. 암호화된 백업을 복원하면 원본 인스턴스와 동일한 KMS 키를 사용하는 암호화된 인스턴스가 생성됩니다. 필요시 복원 후 KMS 키를 회전할 수 있습니다; 자세한 내용은 [키 회전](#key-rotation)을 참조하세요.

## 성능 {#performance}

데이터베이스 암호화는 ClickHouse의 내장된 [데이터 암호화용 가상 파일 시스템 기능](/operations/storing-data#encrypted-virtual-file-system)을 활용하여 데이터를 암호화하고 보호합니다. 이 기능에 사용되는 알고리즘은 `AES_256_CTR`이며, 부하에 따라 5-15%의 성능 저하가 예상됩니다:

<Image img={cmek_performance} size="lg" alt="CMEK 성능 저하" />
