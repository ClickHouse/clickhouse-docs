---
'slug': '/integrations/clickpipes/secure-kinesis'
'sidebar_label': 'Kinesis 역할 기반 접근'
'title': 'Kinesis 역할 기반 접근'
'description': '이 문서에서는 ClickPipes 고객이 Amazon Kinesis와 인증하고 데이터 스트림에 안전하게 접근하기 위해
  역할 기반 접근을 활용하는 방법을 설명합니다.'
'doc_type': 'guide'
'keywords':
- 'Amazon Kinesis'
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

This article demonstrates how ClickPipes customers can leverage role-based access to authenticate with Amazon Kinesis and access their data streams securely.

## Prerequisites {#prerequisite}

To follow this guide, you will need:
- An active ClickHouse Cloud service
- An AWS account

## Introduction {#introduction}

Before diving into the setup for secure Kinesis access, it's important to understand the mechanism. Here's an overview of how ClickPipes can access Amazon Kinesis streams by assuming a role within customers' AWS accounts.

<Image img={secure_kinesis} alt="Secure Kinesis" size="lg" border/>

Using this approach, customers can manage all access to their Kinesis data streams in a single place (the IAM policy of the assumed-role) without having to modify each stream's access policy individually.

## Setup {#setup}

<VerticalStepper headerLevel="h3"/>

### Obtaining the ClickHouse service IAM role Arn {#obtaining-the-clickhouse-service-iam-role-arn}

- 1. Login to your ClickHouse cloud account.
- 2. Select the ClickHouse service you want to create the integration.
- 3. Select the **Settings** tab.
- 4. Scroll down to the **Network security information** section at the bottom of the page.
- 5. Copy the **Service role ID (IAM)** value belong to the service as shown below.

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

### Setting up IAM assume role {#setting-up-iam-assume-role}

#### Manually create IAM role. {#manually-create-iam-role}

- 1. Login to your AWS Account in the web browser with an IAM user that has permission to create & manage IAM role.
- 2. Browse to IAM Service Console.
- 3. Create a new IAM role with Trusted Entity Type of `AWS account`. Note that the name of the IAM role **must start with** `ClickHouseAccessRole-` for this to work.

   **i. Configure the Trust Policy**

   The trust policy allows the ClickHouse IAM role to assume this role. Replace `{ClickHouse_IAM_ARN}` with the IAM Role ARN from your ClickHouse service (obtained in the previous step).

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

   **ii. Configure the Permission Policy**

   The permission policy grants access to your Kinesis stream. Replace the following placeholders:
  - `{REGION}`: Your AWS region (e.g., `us-east-1`)
  - `{ACCOUNT_ID}`: Your AWS account ID
  - `{STREAM_NAME}`: Your Kinesis stream name

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "kinesis:DescribeStream",
        "kinesis:GetShardIterator",
        "kinesis:GetRecords",
        "kinesis:ListShards",
        "kinesis:RegisterStreamConsumer",
        "kinesis:DeregisterStreamConsumer",
        "kinesis:ListStreamConsumers"
      ],
      "Resource": [
        "arn:aws:kinesis:{REGION}:{ACCOUNT_ID}:stream/{STREAM_NAME}"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "kinesis:SubscribeToShard",
        "kinesis:DescribeStreamConsumer"
      ],
      "Resource": [
        "arn:aws:kinesis:{REGION}:{ACCOUNT_ID}:stream/{STREAM_NAME}/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "kinesis:ListStreams"
      ],
      "Resource": "*"
    }
  ]
}
```

- 4. Copy the new **IAM Role Arn** after creation. This is what is needed to access your Kinesis stream.

---

이 문서는 ClickPipes 고객이 역할 기반 액세스를 활용하여 Amazon Kinesis에 인증하고 데이터 스트림에 안전하게 액세스하는 방법을 보여줍니다.

## 필수 조건 {#prerequisite}

이 가이드를 따르려면 다음이 필요합니다:
- 활성 ClickHouse Cloud 서비스
- AWS 계정

## 소개 {#introduction}

안전한 Kinesis 액세스 설정에 들어가기 전에, 메커니즘을 이해하는 것이 중요합니다. 다음은 ClickPipes가 고객의 AWS 계정 내에서 역할을 가정하여 Amazon Kinesis 스트림에 액세스하는 방법에 대한 개요입니다.

<Image img={secure_kinesis} alt="Secure Kinesis" size="lg" border/>

이 접근 방식을 사용하면 고객은 각 스트림의 액세스 정책을 개별적으로 수정할 필요 없이 단일 장소(가정된 역할의 IAM 정책)에서 Kinesis 데이터 스트림에 대한 모든 액세스를 관리할 수 있습니다.

## 설정 {#setup}

<VerticalStepper headerLevel="h3"/>

### ClickHouse 서비스 IAM 역할 Arn 얻기 {#obtaining-the-clickhouse-service-iam-role-arn}

- 1. ClickHouse 클라우드 계정에 로그인합니다.
- 2. 통합을 생성할 ClickHouse 서비스를 선택합니다.
- 3. **설정** 탭을 선택합니다.
- 4. 페이지 하단의 **네트워크 보안 정보** 섹션으로 스크롤합니다.
- 5. 아래와 같이 서비스에 해당하는 **서비스 역할 ID (IAM)** 값을 복사합니다.

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

### IAM 가정 역할 설정 {#setting-up-iam-assume-role}

#### IAM 역할 수동 생성. {#manually-create-iam-role}

- 1. IAM 역할을 생성 및 관리할 수 있는 권한이 있는 IAM 사용자로 웹 브라우저에서 AWS 계정에 로그인합니다.
- 2. IAM 서비스 콘솔로 이동합니다.
- 3. `AWS account`의 신뢰할 수 있는 엔터티 유형으로 새 IAM 역할을 생성합니다. 이 기능이 작동하려면 IAM 역할의 이름이 **`ClickHouseAccessRole-`**로 시작해야 합니다.

   **i. 신뢰 정책 구성**

   신뢰 정책은 ClickHouse IAM 역할이 이 역할을 가정할 수 있도록 합니다. `{ClickHouse_IAM_ARN}`을 (를) 이전 단계에서 얻은 ClickHouse 서비스의 IAM 역할 ARN으로 교체합니다.

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

   **ii. 권한 정책 구성**

   권한 정책은 Kinesis 스트림에 대한 액세스를 부여합니다. 다음 자리 표시자를 교체합니다:
  - `{REGION}`: AWS 지역 (예: `us-east-1`)
  - `{ACCOUNT_ID}`: AWS 계정 ID
  - `{STREAM_NAME}`: Kinesis 스트림 이름

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "kinesis:DescribeStream",
        "kinesis:GetShardIterator",
        "kinesis:GetRecords",
        "kinesis:ListShards",
        "kinesis:RegisterStreamConsumer",
        "kinesis:DeregisterStreamConsumer",
        "kinesis:ListStreamConsumers"
      ],
      "Resource": [
        "arn:aws:kinesis:{REGION}:{ACCOUNT_ID}:stream/{STREAM_NAME}"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "kinesis:SubscribeToShard",
        "kinesis:DescribeStreamConsumer"
      ],
      "Resource": [
        "arn:aws:kinesis:{REGION}:{ACCOUNT_ID}:stream/{STREAM_NAME}/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "kinesis:ListStreams"
      ],
      "Resource": "*"
    }
  ]
}
```

- 4. 생성 후 새로운 **IAM 역할 ARN**을 복사합니다. 이는 Kinesis 스트림에 액세스하는 데 필요합니다.
