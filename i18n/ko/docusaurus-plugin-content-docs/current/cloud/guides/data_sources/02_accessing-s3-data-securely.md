---
slug: /cloud/data-sources/secure-s3
sidebar_label: 'S3 데이터에 안전하게 접근하기'
title: 'S3 데이터에 안전하게 접근하기'
description: '이 문서에서는 ClickHouse Cloud 고객이 역할 기반 액세스를 활용해 Amazon Simple Storage Service(S3)에 인증하고 S3 데이터에 안전하게 접근하는 방법을 설명합니다.'
keywords: ['RBAC', 'Amazon S3', '인증']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.png';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.png';

이 가이드는 ClickHouse Cloud 고객이 역할 기반 액세스(role-based access)를 활용하여 Amazon Simple Storage Service (S3)에 인증한 뒤 데이터를 안전하게 액세스하는 방법을 설명합니다.
보안 S3 액세스 구성을 시작하기 전에 먼저 이 방식이 어떻게 동작하는지 이해하는 것이 중요합니다. 아래는 ClickHouse 서비스가 고객의 AWS 계정 내에서 역할을 가정(assume role)하여 비공개 S3 버킷에 액세스하는 방식에 대한 개요입니다.

<Image img={secure_s3} size="lg" alt="ClickHouse를 이용한 보안 S3 액세스 개요" />

<br />

이 접근 방식에서는 고객이 모든 S3 버킷 정책을 일일이 수정하지 않고도, 한 곳(가정된 역할의 IAM 정책)에서 S3 버킷에 대한 모든 액세스를 관리할 수 있습니다.
아래 섹션에서 이 구성을 설정하는 방법을 설명합니다.


## ClickHouse 서비스의 IAM 역할 ARN 가져오기 \{#obtaining-the-clickhouse-service-iam-role-arn\}

1. ClickHouse Cloud 계정에 로그인합니다.

2. 통합을 설정하려는 ClickHouse 서비스를 선택합니다.

3. **Settings** 탭을 선택합니다.

4. 페이지 하단의 **Network security information** 섹션으로 스크롤하여 이동합니다.

5. 아래와 같이 표시된 해당 서비스의 **Service role ID (IAM)** 값을 복사합니다.

<Image img={s3_info} size="lg" alt="ClickHouse 서비스 IAM 역할 ARN 가져오기" border />

## IAM Assume Role 설정 \{#setting-up-iam-assume-role\}

IAM Assume Role은 다음 두 가지 방법 중 하나로 설정할 수 있습니다.

- [CloudFormation 스택을 사용](#option-1-deploying-with-cloudformation-stack)
- [IAM 역할을 수동으로 생성](#option-2-manually-create-iam-role)

### CloudFormation 스택으로 배포하기 \{#option-1-deploying-with-cloudformation-stack\}

1. IAM 역할을 생성 및 관리할 권한이 있는 IAM 사용자로 웹 브라우저에서 AWS 계정에 로그인합니다.

2. CloudFormation 스택을 생성하기 위해 다음 [CloudFormation URL](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3)에 접속합니다.

3. 앞에서 확보한 서비스용 **service role ID (IAM)** 를 "ClickHouse Instance Roles"라는 입력란에 입력(또는 붙여넣기)합니다.  
   Cloud 콘솔에 표시된 그대로 service role ID를 붙여넣으면 됩니다.

4. "Bucket Names"라는 입력란에 버킷 이름을 입력합니다. 버킷 URL이 `https://ch-docs-s3-bucket.s3.eu-central-1.amazonaws.com/clickhouseS3/` 인 경우 버킷 이름은 `ch-docs-s3-bucket` 입니다.

:::note
전체 버킷 ARN을 넣지 말고, 버킷 이름만 입력합니다.
:::

5. CloudFormation 스택을 구성합니다. 아래는 이러한 파라미터에 대한 추가 정보입니다.

| Parameter                 | Default Value        | Description                                                                                        |
| :---                      |    :----:            | :----                                                                                              |
| RoleName                  | ClickHouseAccess-001 | ClickHouse Cloud가 S3 버킷에 액세스하기 위해 사용할 새 역할의 이름입니다.                           |
| Role Session Name         |      *               | Role Session Name은 버킷을 추가로 보호하기 위한 공유 비밀로 사용할 수 있습니다.                    |
| ClickHouse Instance Roles |                      | 이 보안 S3 통합을 사용할 수 있는 ClickHouse 서비스 IAM 역할의 쉼표로 구분된 목록입니다.            |
| Bucket Access             |    Read              | 제공된 버킷에 대한 액세스 수준을 설정합니다.                                                       |
| Bucket Names              |                      | 이 역할이 액세스하게 될 버킷 이름의 쉼표로 구분된 목록입니다. **Note:** 전체 버킷 ARN이 아니라 버킷 이름만 사용하십시오. |

6. **I acknowledge that AWS CloudFormation might create IAM resources with custom names.** 체크박스를 선택합니다.

7. 오른쪽 하단의 **Create stack** 버튼을 클릭합니다.

8. CloudFormation 스택이 오류 없이 완료되었는지 확인합니다.

9. 새로 생성된 스택을 선택한 다음 CloudFormation 스택의 **Outputs** 탭을 선택합니다.

10. 이 통합에서 사용할 **RoleArn** 값을 복사합니다. 이 값이 S3 버킷에 액세스하는 데 필요합니다.

<Image img={s3_output} size="lg" alt="IAM Role ARN이 표시된 CloudFormation 스택 출력" border />

### IAM 역할 수동 생성 \{#option-2-manually-create-iam-role\}

1. IAM 역할을 생성 및 관리할 수 있는 권한이 있는 IAM 사용자로 웹 브라우저에서 AWS 계정에 로그인합니다.

2. IAM 서비스 콘솔로 이동합니다.

3. 아래 IAM 및 신뢰 정책(Trust policy)으로 새 IAM 역할을 생성합니다. `{ClickHouse_IAM_ARN}`을(를) 사용 중인 ClickHouse 인스턴스에 해당하는 IAM 역할 ARN으로 바꾸십시오.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "{ClickHouse_IAM_ARN}"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

**IAM 정책**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:GetBucketLocation",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::{BUCKET_NAME}"
            ],
            "Effect": "Allow"
        },
        {
            "Action": [
                "s3:Get*",
                "s3:List*"
            ],
            "Resource": [
                "arn:aws:s3:::{BUCKET_NAME}/*"
            ],
            "Effect": "Allow"
        }
    ]
}
```

4. 생성이 완료되면 생성된 **IAM Role Arn** 값을 복사합니다. 이 값은 S3 버킷에 접근하는 데 필요합니다.


## ClickHouseAccess 역할로 S3 버킷에 액세스하기 \{#access-your-s3-bucket-with-the-clickhouseaccess-role\}

ClickHouse Cloud에서는 S3 테이블 함수의 일부로 `extra_credentials`를 지정할 수 있습니다.
아래는 앞에서 생성하여 복사한 새 역할을 사용해 쿼리를 실행하는 예입니다.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

아래는 `role_session_name`을 공유 비밀로 사용하여 버킷에서 데이터를 쿼리하는 예제 쿼리입니다.
`role_session_name`이 올바르지 않으면 이 작업이 실패합니다.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
데이터 전송 비용을 줄이기 위해 ClickHouse Cloud 서비스와 동일한 리전에 소스 S3를 두는 것을 권장합니다.
자세한 내용은 [S3 요금](https://aws.amazon.com/s3/pricing/)을 참조하십시오.
:::


## 고급 동작 제어 \{#advanced-action-control\}

보다 엄격한 액세스 제어를 위해 [`aws:SourceVpce` 조건](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies-vpc-endpoint.html#example-bucket-policies-restrict-accesss-vpc-endpoint)을 사용하여 ClickHouse Cloud의 VPC 엔드포인트에서 비롯된 요청만 허용하도록 버킷 정책을 제한할 수 있습니다. ClickHouse Cloud 리전에 대한 VPC 엔드포인트를 확인하려면 터미널을 열고 다음을 실행하십시오:

```bash
# Replace <your-region> with your ClickHouse Cloud region
curl -s https://api.clickhouse.cloud/static-ips.json | jq -r '.aws[] | select(.region == "<your-region>") | .s3_endpoints[]'
```

그런 다음 반환된 엔드포인트를 사용해 IAM 정책에 deny 규칙(거부 규칙)을 추가합니다:

```json
{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "VisualEditor0",
                "Effect": "Allow",
                "Action": [
                    "s3:List*",
                    "s3:Get*"
                ],
                "Resource": [
                    "arn:aws:s3:::{BUCKET_NAME}",
                    "arn:aws:s3:::{BUCKET_NAME}/*"
                ]
            },
            {
                "Sid": "VisualEditor3",
                "Effect": "Deny",
                "Action": [
                    "s3:GetObject"
                ],
                "Resource": "*",
                "Condition": {
                    "StringNotEquals": {
                        "aws:SourceVpce": [
                            "{ClickHouse VPC ID from your S3 region}",
                            "{ClickHouse VPC ID from your S3 region}",
                            "{ClickHouse VPC ID from your S3 region}"
                        ]
                    }
                }
            }
        ]
}
```

ClickHouse Cloud 서비스 엔드포인트에 대한 자세한 내용은 [Cloud IP Addresses](/manage/data-sources/cloud-endpoints-api)를 참고하십시오.
