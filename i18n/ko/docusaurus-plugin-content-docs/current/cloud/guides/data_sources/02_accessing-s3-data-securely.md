---
'slug': '/cloud/data-sources/secure-s3'
'sidebar_label': 'S3 데이터에 안전하게 접근하기'
'title': 'S3 데이터에 안전하게 접근하기'
'description': '이 문서에서는 ClickHouse Cloud 고객이 Amazon Simple Storage Service(S3)와 인증하기
  위해 역할 기반 접근을 활용하고 데이터를 안전하게 접근하는 방법을 보여줍니다.'
'keywords':
- 'RBAC'
- 'Amazon S3'
- 'authentication'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.jpg';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

이 문서에서는 ClickHouse Cloud 고객이 Amazon Simple Storage Service (S3)를 통해 안전하게 데이터에 접근할 수 있도록 역할 기반 접근 방식을 활용하는 방법을 시연합니다.

## Introduction {#introduction}

안전한 S3 접근을 위한 설정에 들어가기 전에, 이 방식이 어떻게 작동하는지 이해하는 것이 중요합니다. 아래는 ClickHouse 서비스가 고객의 AWS 계정 내에서 역할을 가정하여 개인 S3 버킷에 접근하는 방법에 대한 개요입니다.

<Image img={secure_s3} size="md" alt="ClickHouse와 함께하는 안전한 S3 접근 개요"/>

이 접근 방식은 고객이 모든 접근을 단일 위치(가정된 역할의 IAM 정책)에서 관리할 수 있게 하여, 모든 버킷 정책을 살펴보며 접근을 추가하거나 제거하는 번거로움 없이 S3 버킷에 대한 접근을 관리할 수 있게 합니다.

## Setup {#setup}

### Obtaining the ClickHouse service IAM role ARN {#obtaining-the-clickhouse-service-iam-role-arn}

1 - ClickHouse 클라우드 계정에 로그인합니다.

2 - 통합을 생성할 ClickHouse 서비스를 선택합니다.

3 - **Settings** 탭을 선택합니다.

4 - 페이지 하단의 **Network security information** 섹션으로 스크롤합니다.

5 - 아래와 같이 서비스에 해당하는 **Service role ID (IAM)** 값을 복사합니다.

<Image img={s3_info} size="lg" alt="ClickHouse 서비스 IAM 역할 ARN을 얻는 방법" border />

### Setting up IAM assume role {#setting-up-iam-assume-role}

#### Option 1: Deploying with CloudFormation stack {#option-1-deploying-with-cloudformation-stack}

1 - IAM 역할을 생성하고 관리할 권한이 있는 IAM 사용자로 웹 브라우저에서 AWS 계정에 로그인합니다.

2 - [이 URL](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3)로 이동하여 CloudFormation 스택을 생성합니다.

3 - ClickHouse 서비스에 해당하는 **IAM Role**을 입력(또는 붙여넣기)합니다.

4 - CloudFormation 스택을 구성합니다. 아래는 이러한 매개변수에 대한 추가 정보입니다.

| Parameter                 | Default Value        | Description                                                                                        |
| :---                      |    :----:            | :----                                                                                              |
| RoleName                  | ClickHouseAccess-001 | ClickHouse Cloud가 S3 버킷에 접근하는 데 사용할 새로운 역할의 이름입니다.                      |
| Role Session Name         |      *               | 역할 세션 이름은 버킷을 추가로 보호하기 위한 공유 비밀로 사용될 수 있습니다.                      |
| ClickHouse Instance Roles |                      | 이 Secure S3 통합을 사용할 수 있는 ClickHouse 서비스 IAM 역할의 쉼표로 구분된 목록입니다.         |
| Bucket Access             |    Read              | 제공된 버킷의 접근 수준을 설정합니다.                                                               |
| Bucket Names              |                      | 이 역할이 접근할 수 있는 **버킷 이름**의 쉼표로 구분된 목록입니다.                                |

*Note*: 전체 버킷 Arn을 입력하지 말고 버킷 이름만 입력하세요.

5 - **I acknowledge that AWS CloudFormation might create IAM resources with custom names.** 체크박스를 선택합니다.

6 - 오른쪽 하단의 **Create stack** 버튼을 클릭합니다.

7 - CloudFormation 스택이 오류 없이 완료되는지 확인합니다.

8 - CloudFormation 스택의 **Outputs**를 선택합니다.

9 - 이 통합을 위한 **RoleArn** 값을 복사합니다. 이 값이 S3 버킷에 접근하는 데 필요합니다.

<Image img={s3_output} size="lg" alt="IAM 역할 ARN을 보여주는 CloudFormation 스택 출력" border />

#### Option 2: Manually create IAM role {#option-2-manually-create-iam-role}

1 - IAM 역할을 생성하고 관리할 권한이 있는 IAM 사용자로 웹 브라우저에서 AWS 계정에 로그인합니다.

2 - IAM 서비스 콘솔로 이동합니다.

3 - 다음 IAM 및 신뢰 정책을 사용하여 새로운 IAM 역할을 생성합니다.

신뢰 정책 (여기서 `{ClickHouse_IAM_ARN}`을 ClickHouse 인스턴스에 해당하는 IAM 역할 Arn으로 교체하십시오):

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

IAM 정책 (여기서 `{BUCKET_NAME}`을 버킷 이름으로 교체하십시오):

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

4 - 생성 후 새로운 **IAM Role Arn**을 복사합니다. 이 값이 S3 버킷에 접근하는 데 필요합니다.

## Access your S3 bucket with the ClickHouseAccess role {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloud는 S3 테이블 함수의 일부로 `extra_credentials`를 지정할 수 있는 새로운 기능을 제공합니다. 아래는 위에서 복사한 새로 생성된 역할을 사용하여 쿼리를 실행하는 방법의 예입니다.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

아래는 `role_session_name`을 공유 비밀로 사용하여 버킷에서 데이터를 쿼리하는 예제 쿼리입니다. `role_session_name`이 정확하지 않으면 이 작업은 실패합니다.

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
데이터 전송 비용을 줄이기 위해 소스 S3가 ClickHouse Cloud 서비스와 동일한 리전에 있는 것이 좋습니다. 추가 정보는 [S3 가격]( https://aws.amazon.com/s3/pricing/)을 참조하십시오.
:::
