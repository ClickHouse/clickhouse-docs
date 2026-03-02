---
slug: /integrations/clickpipes/kinesis/auth
sidebar_label: 'Kinesis 역할 기반 액세스'
title: 'Kinesis 역할 기반 액세스'
description: '이 문서는 ClickPipes 고객이 역할 기반 액세스를 활용하여 Amazon Kinesis에 대한 인증을 수행하고 데이터 스트림에 안전하게 접근하는 방법을 설명합니다.'
doc_type: 'guide'
keywords: ['Amazon Kinesis']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

이 문서에서는 ClickPipes 사용자가 역할 기반 액세스를 사용하여 Amazon Kinesis에 인증하고 데이터 스트림에 안전하게 접근하는 방법을 설명합니다.


## 사전 요구 사항 \{#prerequisite\}

이 가이드를 따라 진행하려면 다음이 필요합니다:

- 활성화된 ClickHouse Cloud 서비스
- AWS 계정

## 소개 \{#introduction\}

Kinesis에 대한 보안 액세스를 설정하기 전에, 먼저 그 동작 방식을 이해하는 것이 중요합니다. 아래는 고객의 AWS 계정 내에서 역할을 가정(assume role)하여 ClickPipes가 Amazon Kinesis 스트림에 액세스하는 방식에 대한 개요입니다.

<Image img={secure_kinesis} alt="Secure Kinesis" size="lg" border/>

이 방식을 사용하면, 고객은 각 스트림의 액세스 정책을 개별적으로 수정할 필요 없이, 가정한 역할의 IAM 정책 한 곳에서 Kinesis 데이터 스트림에 대한 모든 액세스를 관리할 수 있습니다.

## 설정 \{#setup\}

<VerticalStepper headerLevel="h3"/>

### ClickHouse 서비스 IAM 역할 ARN 가져오기 \{#obtaining-the-clickhouse-service-iam-role-arn\}

- 1. ClickHouse Cloud 계정에 로그인합니다.
- 2. 통합을 생성할 ClickHouse 서비스를 선택합니다.
- 3. **Settings** 탭을 선택합니다.
- 4. 페이지 하단의 **Network security information** 섹션까지 아래로 스크롤합니다.
- 5. 아래와 같이 표시된 해당 서비스의 **Service role ID (IAM)** 값을 복사합니다.

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

### IAM 역할 승계(Assume Role) 설정 \{#setting-up-iam-assume-role\}

#### IAM 역할 수동 생성. \{#manually-create-iam-role\}

- 1. IAM 역할을 생성 및 관리할 권한이 있는 IAM 사용자로 웹 브라우저에서 AWS 계정에 로그인합니다.
- 2. IAM 콘솔로 이동합니다.
- 3. 신뢰할 수 있는 주체 유형(Trusted entity type)으로 `AWS account`를 선택해 새 IAM 역할을 생성합니다. 이 구성이 동작하려면 IAM 역할 이름은 반드시 `ClickHouseAccessRole-`로 **시작해야 합니다**.

   **i. Trust Policy 구성**

   Trust Policy는 ClickHouse IAM 역할이 이 역할을 가정(assume)할 수 있도록 허용합니다. `{ClickHouse_IAM_ARN}`을 이전 단계에서 가져온 ClickHouse 서비스의 IAM Role ARN으로 교체합니다.

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

   **ii. Permission Policy 구성**

   Permission Policy는 Kinesis 스트림에 대한 액세스를 부여합니다. 다음 플레이스홀더를 교체합니다:
  - `{REGION}`: AWS 리전(예: `us-east-1`)
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

- 4. 생성이 완료되면 새 **IAM Role ARN**을 복사합니다. 이는 Kinesis 스트림에 액세스하는 데 필요합니다.