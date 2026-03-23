---
sidebar_label: '비순차 모드 구성'
sidebar_position: 3
title: '지속적 수집을 위한 비순차 모드 구성'
slug: /integrations/clickpipes/object-storage/s3/unordered-mode
description: 'S3 ClickPipes에서 지속적 수집을 위해 비순차 모드를 구성하는 단계별 가이드입니다.'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import cp_eb_s3_enable from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_eb_s3_enable.png';
import cp_eb_rule_define from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_eb_rule_define.png';
import cp_eb_rule_target from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_eb_rule_target.png';
import cp_eb_rule_created from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_eb_rule_created.png';
import Image from '@theme/IdealImage';

기본적으로 S3 ClickPipe는 파일이 [사전순](/integrations/clickpipes/object-storage/s3/overview#continuous-ingestion-lexicographical-order)으로 버킷에 추가된다고 가정합니다. 파일에 내재된 순서가 없는 경우에도 수집하도록 S3 ClickPipe를 구성할 수 있으며, 이를 위해 버킷에 연결된 [Amazon SQS](https://aws.amazon.com/sqs/) 대기열을 설정하고 필요에 따라 [Amazon EventBridge](https://aws.amazon.com/eventbridge/)를 이벤트 라우터로 사용할 수 있습니다. 이렇게 하면 ClickPipes가 `ObjectCreated:*` 이벤트를 수신하여 파일 이름 지정 규칙과 관계없이 모든 새 파일을 수집할 수 있습니다.

:::note
비순차 모드는 Amazon S3에서만 **지원**되며, 공개 버킷 또는 S3 호환 서비스에서는 **지원되지 않습니다**. 이 모드를 사용하려면 버킷에 연결된 [Amazon SQS](https://aws.amazon.com/sqs/) 대기열을 설정해야 하며, 필요에 따라 [Amazon EventBridge](https://aws.amazon.com/eventbridge/)를 이벤트 라우터로 사용할 수 있습니다.
:::

## 작동 방식 \{#how-it-works\}

이 모드에서는 S3 ClickPipe가 선택한 경로에 있는 **모든 파일**을 초기 로드한 다음, 지정된 경로와 일치하는 대기열의 `ObjectCreated:*` 이벤트를 수신합니다. 이전에 이미 처리한 파일에 대한 메시지, 경로와 일치하지 않는 파일, 또는 다른 타입의 이벤트는 모두 **무시됩니다**. 파일은 `max insert bytes` 또는 `max file count`에 설정된 임곗값에 도달하거나, 설정 가능한 간격이 지나면(기본적으로 30초) 수집됩니다. 특정 파일이나 특정 시점부터 수집을 시작하는 것은 **불가능합니다** — ClickPipes는 항상 선택한 경로의 모든 파일을 로드합니다.

데이터를 수집하는 동안에는 다양한 유형의 장애가 발생할 수 있으며, 이로 인해 부분 삽입 또는 중복 데이터가 생길 수 있습니다. 객체 스토리지 ClickPipes는 삽입 실패에도 견고하게 동작하며, 임시 스테이징 테이블을 사용해 정확히 한 번 의미론을 제공합니다. 데이터는 먼저 스테이징 테이블에 삽입됩니다. 문제가 발생하면 스테이징 테이블을 비우고 깨끗한 상태에서 삽입을 다시 시도합니다. 삽입이 성공적으로 완료된 후에만 파티션이 대상 테이블로 이동됩니다.

<VerticalStepper type="numbered" headerLevel="h2">
  ## Amazon SQS 대기열 생성 \{#create-sqs-queue\}

  **1.** AWS 콘솔에서 **Simple Queue Service &gt; Create queue**로 이동합니다. 기본값을 사용하여 새 표준 대기열을 생성합니다.

  :::tip
  SQS 대기열에 **Dead-Letter-Queue (DLQ)**를 구성하실 것을 강력히 권장합니다. DLQ를 구성하면 실패한 메시지를 더 쉽게 디버그하고 재시도할 수 있습니다. DLQ가 구성된 경우, 실패한 메시지는 DLQ의 `maxReceiveCount` 파라미터에 설정된 횟수만큼 대기열에 다시 추가되어 재처리됩니다.
  :::

  **2.** 아래 두 가지 옵션 중 하나를 사용하여 S3 버킷을 SQS 대기열에 연결하십시오. EventBridge는 대부분의 사용 사례에 권장됩니다. 팬아웃(fan-out)을 지원하고, 보다 유연한 이벤트 필터링이 가능하며, 이벤트 타입(event type) 및 prefix별 알림 규칙을 하나로 제한하는 S3 제약을 받지 않기 때문입니다.

  <Tabs groupId="s3-notification-method">
    <TabItem value="eventbridge" label="EventBridge를 통해" default>
      **a.** S3 버킷 속성에서 **Event notifications &gt; Amazon EventBridge**로 이동하여 EventBridge로 알림을 전송하도록 활성화합니다. **Save changes**를 클릭합니다.

      <Image img={cp_eb_s3_enable} alt="S3 버킷 속성에서 Amazon EventBridge 알림 활성화" size="lg" border />

      **b.** AWS Console에서 **Amazon EventBridge &gt; Rules &gt; Create rule**로 이동합니다. 규칙 이름을 지정하고(예: `S3ObjectCreated`), **default** 이벤트 버스를 선택한 다음 **Next**를 클릭합니다. **Build event pattern** 단계에서 이벤트 소스로 **AWS events or EventBridge partner events**를 선택한 후, 아래 이벤트 패턴을 수동으로 입력합니다. 이때 `<bucket-name>`은 버킷 이름으로 바꾸십시오.

      <Image img={cp_eb_rule_define} alt="EventBridge 규칙 이름과 이벤트 버스 정의" size="lg" border />

      ```json
      {
        "source": ["aws.s3"],
        "detail-type": ["Object Created"],
        "detail": {
          "bucket": {
            "name": ["<bucket-name>"]
          }
        }
      }
      ```

      필요에 따라 패턴에 `object.key` 조건을 추가해 prefix 또는 suffix 기준으로 필터링할 수 있습니다. 이 경우 ClickPipe에 설정된 경로와 일치하는지 확인하십시오.

      **c.** **Select target(s)** 단계에서 대상 타입으로 **AWS service**를 선택하고 **SQS queue**를 선택합니다. 이전 단계에서 생성한 대기열을 선택합니다. EventBridge가 필요한 IAM 역할을 자동으로 생성할 수 있도록 **Use execution role (recommended)**는 선택된 상태로 둔 다음, **Next**를 클릭하고 마법사를 완료합니다.

      <Image img={cp_eb_rule_target} alt="EventBridge 규칙의 대상으로 SQS 대기열 설정" size="lg" border />

      <Image img={cp_eb_rule_created} alt="EventBridge 규칙 생성 완료" size="lg" border />

      **d.** EventBridge가 해당 SQS 대기열로 메시지를 보낼 수 있도록 SQS 대기열 액세스 정책을 편집합니다. `<sqs-queue-arn>` 및 `<eventbridge-rule-arn>`을 적절한 값으로 바꾸십시오.

      ```json
      {
        "Version": "2012-10-17",
        "Id": "example-ID",
        "Statement": [
          {
            "Sid": "AllowEventBridgeToSendMessage",
            "Effect": "Allow",
            "Principal": {
              "Service": "events.amazonaws.com"
            },
            "Action": "SQS:SendMessage",
            "Resource": "<sqs-queue-arn>",
            "Condition": {
              "ArnLike": {
                "aws:SourceArn": "<eventbridge-rule-arn>"
              }
            }
          }
        ]
      }
      ```
    </TabItem>

    <TabItem value="direct" label="Direct S3 → SQS">
      **a.** S3 버킷이 해당 SQS 대기열로 메시지를 보낼 수 있도록 SQS 대기열 액세스 정책을 편집합니다. `<sqs-queue-arn>`, `<bucket-arn>`, `<aws-account-id>`를 적절한 값으로 바꾸십시오.

      ```json
      {
        "Version": "2012-10-17",
        "Id": "example-ID",
        "Statement": [
          {
            "Sid": "AllowS3ToSendMessage",
            "Effect": "Allow",
            "Principal": {
              "Service": "s3.amazonaws.com"
            },
            "Action": "SQS:SendMessage",
            "Resource": "<sqs-queue-arn>",
            "Condition": {
              "ArnLike": {
                "aws:SourceArn": "<bucket-arn>"
              },
              "StringEquals": {
                "aws:SourceAccount": "<aws-account-id>"
              }
            }
          }
        ]
      }
      ```

      **b.** S3 버킷 속성에서 `ObjectCreated` 이벤트에 대한 **Event notifications**를 활성화하고, 대상을 SQS 대기열로 설정합니다. 필요에 따라 알림을 트리거할 객체를 필터링하도록 prefix 또는 suffix를 지정할 수 있습니다. 이 경우 ClickPipe에 설정된 경로와 일치하는지 확인하십시오.

      :::note
      S3는 동일한 버킷에서 동일한 이벤트 타입에 대해 서로 겹치는 여러 알림 규칙을 허용하지 않습니다. 이 버킷에 `ObjectCreated` 이벤트용 알림 규칙이 이미 있다면 대신 EventBridge 방식을 사용하십시오.
      :::
    </TabItem>
  </Tabs>

  ## IAM Role 구성 \{#configure-iam-role\}

  **1.** ClickHouse Cloud 콘솔에서 **Settings &gt; Network security information**으로 이동하여 해당 서비스의 **IAM role ARN**을 복사하십시오.

  **2.** AWS 콘솔에서 **IAM &gt; Roles &gt; Create role**로 이동합니다. **Custom trust policy**를 선택하고 아래 내용을 붙여넣되, `<ch-cloud-arn>`은 이전 단계에서 복사한 IAM 역할 ARN으로 대체하십시오.

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "AllowAssumeRole",
        "Effect": "Allow",
        "Principal": {
          "AWS": "<ch-cloud-arn>"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }
  ```

  **3.** S3에서 객체를 읽고 SQS 대기열의 메시지를 관리하는 데 필요한 [필수 권한](/01_overview.md/#permissions)을 포함하는 IAM 역할의 인라인 정책을 생성하십시오. `<bucket-arn>`과 `<sqs-queue-arn>`을 적절한 값으로 교체하십시오:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "S3BucketMetadataAccess",
        "Effect": "Allow",
        "Action": [
          "s3:GetBucketLocation",
          "s3:ListBucket"
        ],
        "Resource": "<bucket-arn>"
      },
      {
        "Sid": "AllowGetListObjects",
        "Effect": "Allow",
        "Action": [
          "s3:Get*",
          "s3:List*"
        ],
        "Resource": "<bucket-arn>/*"
      },
      {
        "Sid": "SQSNotificationsAccess",
        "Effect": "Allow",
        "Action": [
          "sqs:DeleteMessage",
          "sqs:ListQueues",
          "sqs:ReceiveMessage",
          "sqs:GetQueueAttributes"
        ],
        "Resource": "<sqs-queue-arn>"
      }
    ]
  }
  ```

  ## 비순서 모드로 ClickPipe 생성 \{#create-clickpipe\}

  **1.** ClickHouse Cloud 콘솔에서 **Data Sources &gt; Create ClickPipe**로 이동하여 **Amazon S3**를 선택하십시오. S3 버킷에 연결하기 위한 세부 정보를 입력하십시오. **Authentication method** 아래에서 **IAM role**을 선택하고, 이전 단계에서 생성한 역할의 ARN을 제공하십시오.

  **2.** **Incoming data** 아래에서 **Continuous ingestion**을 활성화하십시오. 수집 모드로 **Any order**를 선택하고, 버킷에 연결된 대기열의 **SQS queue URL**을 제공하십시오.

  **3.** **파싱 정보(Parse information)** 아래에서 대상 테이블의 **정렬 키(Sorting key)**를 정의하십시오. 매핑된 스키마를 필요에 따라 조정한 후, ClickPipes 데이터베이스 사용자의 역할(Role)을 구성하십시오.

  **4.** 구성을 검토한 후 **Create ClickPipe**를 클릭하십시오. ClickPipes는 버킷을 초기 스캔하여 지정된 경로와 일치하는 기존 파일을 모두 로드한 다음, 새로운 `ObjectCreated:*` 이벤트가 대기열에 도착하면 파일 처리를 시작합니다.
</VerticalStepper>