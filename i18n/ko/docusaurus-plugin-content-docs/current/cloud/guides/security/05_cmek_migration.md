---
sidebar_label: '레거시 CMEK 마이그레이션'
slug: /cloud/security/cmek-migration
title: 'CMEK v1에서 v2로 마이그레이션'
description: '레거시 CMEK에서 버전 2로 이전하기 위한 마이그레이션 안내'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'encryption', 'CMEK']
---

고객 관리 암호화 키(CMEK) 서비스의 보안을 개선하고 있습니다. 이제 모든 서비스에는 서비스별로 고유한 AWS 역할이 구성되어, 고객 키를 사용해 서비스를 암호화하고 복호화할 수 있도록 권한을 부여합니다. 이 새로운 역할은 서비스 구성 화면에서만 표시됩니다.

이 새로운 프로세스는 OpenAPI와 Terraform 모두에서 지원됩니다. 자세한 내용은 다음 문서를 참고하십시오. ([향상된 암호화](/docs/cloud/security/cmek), [Cloud API](/docs/cloud/manage/api/api-overview), [공식 Terraform Provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs))

:::warning
CMEK v1을 사용하는 고객은 2026년 6월 1일까지 서비스를 마이그레이션해야 합니다. 이 날짜 이후에는 고객 관리 키가 기본적으로 ClickHouse 관리 키로 로테이션됩니다. 기본 마이그레이션 이후에는 다시 고객 관리 키로 로테이션할 수 있습니다.
:::

## 수동 마이그레이션 \{#manual-migration\}

새 프로세스로 마이그레이션하려면 다음 단계를 완료하십시오:

1. https://console.clickhouse.cloud 에 로그인합니다
2. 암호화된 서비스를 클릭합니다
3. 왼쪽 메뉴에서 Service Settings를 클릭합니다
4. 화면 맨 아래까지 스크롤한 후 View service details를 펼칩니다
5. Encryption Role ID (IAM)을 복사합니다
6. AWS에서 KMS 키로 이동하여 다음 내용을 추가하도록 Key Policy를 업데이트합니다:

```json
{
   "Sid": "Allow ClickHouse Access",
   "Effect": "Allow",
   "Principal": {
       "AWS": ["Encryption role ID (ARN)"]
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

7. ClickHouse Cloud에서 지원 티켓을 열어 새로운 방식을 활성화해도 되는지 알려주십시오. 이 변경 사항은 서비스 재시작이 필요하므로, 서비스를 재시작하기에 가장 적합한 일시가 있다면 알려주십시오.
8. 서비스 재시작이 완료되면 AWS의 KMS 키로 이동하여 다음 내용을 Key Policy에서 제거하십시오:

```json
{
   "Sid": "Allow ClickHouse Access",
       "Effect": "Allow",
       "Principal": {
           "AWS": "arn:aws:iam::576599896960:role/prod-kms-request-role"
       },
       "Action": ["kms:GetPublicKey",
       "kms:Decrypt",
       "kms:GenerateDataKeyPair",
       "kms:Encrypt",
       "kms:GetKeyRotationStatus",
       "kms:GenerateDataKey",
       "kms:DescribeKey"],
       "Resource": "*"
}
```

9. 업데이트가 완료되었습니다!

## Terraform 마이그레이션 \{#terraform-migration\}

1. [Terraform 버전 3.5.0 이상](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)으로 업데이트합니다.
2. 변경 사항 없이 Terraform을 적용합니다. Terraform 상태에 transparent&#95;data&#95;encryption용 새 필드가 표시됩니다. 여기에서 role&#95;id를 기록해 둡니다.
3. AWS의 KMS 키로 이동하여 Key Policy를 다음과 같이 업데이트합니다:

```json
{
   "Sid": "Allow ClickHouse Access",
   "Effect": "Allow",
   "Principal": {
       "AWS": ["Encryption role ID (ARN)"]
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

4. ClickHouse Cloud에서 서비스 이름으로 지원 케이스를 생성하여 새로운 방식을 활성화할 수 있도록 요청해 주십시오. 이 변경 사항은 서비스 재시작이 필요하므로, 서비스를 재시작하기에 가장 적절한 날짜/시간이 있다면 알려주십시오.
5. 서비스 재시작 후에는 `transparent&#95;data&#95;encryption.enabled` 설정을 &#39;True&#39;로 업데이트하고 Terraform에서 tier 설정을 제거한 뒤 적용하십시오. 이 작업으로 실제 변경 사항이 발생하지는 않습니다.
6. AWS에서 사용하는 KMS 키로 이동하여 다음 항목을 Key Policy에서 제거하십시오:

```json
{
   "Sid": "Allow ClickHouse Access",
       "Effect": "Allow",
       "Principal": {
           "AWS": "arn:aws:iam::576599896960:role/prod-kms-request-role"
       },
       "Action": ["kms:GetPublicKey",
       "kms:Decrypt",
       "kms:GenerateDataKeyPair",
       "kms:Encrypt",
       "kms:GetKeyRotationStatus",
       "kms:GenerateDataKey",
       "kms:DescribeKey"],
       "Resource": "*"
}
```

7. 업데이트가 완료되었습니다!
