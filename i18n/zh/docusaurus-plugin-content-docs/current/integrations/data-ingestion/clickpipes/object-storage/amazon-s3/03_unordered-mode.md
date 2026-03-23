---
sidebar_label: '配置无序模式'
sidebar_position: 3
title: '为连续摄取配置无序模式'
slug: /integrations/clickpipes/object-storage/s3/unordered-mode
description: '在 S3 ClickPipes 中为连续摄取配置无序模式的分步指南。'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import cp_eb_s3_enable from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_eb_s3_enable.png';
import cp_eb_rule_define from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_eb_rule_define.png';
import cp_eb_rule_target from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_eb_rule_target.png';
import cp_eb_rule_created from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_eb_rule_created.png';
import Image from '@theme/IdealImage';

默认情况下，S3 ClickPipe 假定 File 会按[字典序](/integrations/clickpipes/object-storage/s3/overview#continuous-ingestion-lexicographical-order)添加到存储桶中。可以通过设置一个连接到存储桶的 [Amazon SQS](https://aws.amazon.com/sqs/) 队列，并可选地使用 [Amazon EventBridge](https://aws.amazon.com/eventbridge/) 作为事件路由器，来配置 S3 ClickPipe，以摄取不具有隐式顺序的 File。这样，ClickPipes 就能够监听 `ObjectCreated:*` 事件，并根据新 File 的创建情况进行摄取，而不受 File 命名约定的限制。

:::note
无序模式**仅**支持 Amazon S3，**不**支持公共存储桶或兼容 S3 的服务。它要求设置一个连接到存储桶的 [Amazon SQS](https://aws.amazon.com/sqs/) 队列，并可选地使用 [Amazon EventBridge](https://aws.amazon.com/eventbridge/) 作为事件路由器。
:::

## 工作原理 \{#how-it-works\}

在此模式下，S3 ClickPipe 会先对所选路径中的**所有 File**执行初始导入，然后监听队列中与指定路径匹配的 `ObjectCreated:*` 事件。对于此前已处理过的 File、不匹配该路径的 File，或其他类型事件的任何消息，都会被**忽略**。当达到 `max insert bytes` 或 `max file count` 中配置的阈值时，或者经过一个可配置的时间间隔后 (默认情况下为 30 Seconds) ，便会开始摄取这些 File。**无法**从某个特定 File 或某个时间点开始摄取——ClickPipes 始终会导入所选路径中的所有 File。

在摄取数据时，可能会发生各种故障，从而导致部分插入或重复数据。对象存储 ClickPipes 能够妥善处理插入失败，并通过临时暂存表提供 exactly-once 语义。数据会先插入暂存表；如果发生问题，暂存表会被截断，并从干净状态重新尝试插入。只有当插入成功完成后，分区才会被移动到目标表。

<VerticalStepper type="numbered" headerLevel="h2">
  ## 创建 Amazon SQS 队列 \{#create-sqs-queue\}

  **1.** 在 AWS Console 中，导航至 **Simple Queue Service &gt; Create queue**。使用默认值创建一个新的标准队列。

  :::tip
  我们强烈建议为 SQS queue 配置 **Dead-Letter-Queue (DLQ)**，以便更轻松地调试和重试 failed 的消息。如果已配置 DLQ，failed 的消息将被重新入队并重新处理，最大重试次数由 DLQ 的 `maxReceiveCount` parameter 决定。
  :::

  **2.** 使用以下两种方式之一将您的 S3 存储桶连接到 SQS 队列。对于大多数用例，推荐使用 EventBridge，因为它支持扇出 (fan-out) 、更灵活的事件过滤，且不受 S3 每个前缀每种事件类型仅允许一条通知规则的限制。

  <Tabs groupId="s3-notification-method">
    <TabItem value="eventbridge" label="通过 EventBridge" default>
      **a.** 在 S3 存储桶属性中，转到 **Event notifications &gt; Amazon EventBridge**，启用向 EventBridge 发送通知，然后点击 **Save changes**。

      <Image img={cp_eb_s3_enable} alt="在 S3 存储桶属性中启用 Amazon EventBridge 通知" size="lg" border />

      **b.** 在 AWS 控制台中，转到 **Amazon EventBridge &gt; Rules &gt; Create rule**。为规则命名 (例如 `S3ObjectCreated`) ，选择 **default** 事件总线，然后点击 **Next**。在 **Build event pattern** 步骤中，选择 **AWS events or EventBridge partner events** 作为事件源，然后手动输入以下事件模式，并将 `<bucket-name>` 替换为你的存储桶名称：

      <Image img={cp_eb_rule_define} alt="定义 EventBridge 规则名称和事件总线" size="lg" border />

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

      你也可以在模式中添加 `object.key` 条件，以按前缀或后缀进行过滤。若这样做，请确保它与为 ClickPipe 设置的路径匹配。

      **c.** 在 **Select target(s)** 步骤中，选择 **AWS service** 作为目标类型，并选择 **SQS queue**。选取上一步创建的队列。保持 **Use execution role (recommended)** 处于选中状态，以便 EventBridge 自动创建所需的 IAM 角色，然后点击 **Next** 并完成向导。

      <Image img={cp_eb_rule_target} alt="将 SQS 队列设置为 EventBridge 规则目标" size="lg" border />

      <Image img={cp_eb_rule_created} alt="EventBridge 规则已成功创建" size="lg" border />

      **d.** 编辑 SQS 队列访问策略，以允许 EventBridge 向该队列发送消息。将 `<sqs-queue-arn>` 和 `<eventbridge-rule-arn>` 替换为相应的值：

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

    <TabItem value="direct" label="直接从 S3 到 SQS">
      **a.** 编辑 SQS 队列访问策略，以允许你的 S3 存储桶向该队列发送消息。将 `<sqs-queue-arn>`、`<bucket-arn>` 和 `<aws-account-id>` 替换为相应的值：

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

      **b.** 在 S3 存储桶属性中，为 `ObjectCreated` 事件启用 **Event notifications**，并将目标设置为 SQS 队列。你也可以指定前缀或后缀，以过滤哪些对象会触发通知；若这样做，请确保它与为 ClickPipe 设置的路径匹配。

      :::note
      S3 不允许在同一个存储桶上为相同事件类型设置多个相互重叠的通知规则。如果你已在该存储桶上为 `ObjectCreated` 事件配置了通知规则，请改用 EventBridge 方式。
      :::
    </TabItem>
  </Tabs>

  ## 配置 IAM 角色 \{#configure-iam-role\}

  **1.** 在 ClickHouse Cloud 控制台中，导航至 **Settings &gt; Network security information**，复制您的服务的 **IAM role ARN**。

  **2.** 在 AWS Console 中，导航至 **IAM &gt; 角色 &gt; Create role**。选择 **Custom trust policy**，粘贴以下内容，并将 `<ch-cloud-arn>` 替换为上一步复制的 IAM 角色 ARN：

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

  **3.** 为 IAM 角色创建内联策略，授予其从 S3 读取对象及管理 SQS 队列消息所需的[必需权限](/01_overview.md/#permissions)。将 `<bucket-arn>` 和 `<sqs-queue-arn>` 替换为相应的值：

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

  ## 以无序模式创建 ClickPipe \{#create-clickpipe\}

  **1.** 在 ClickHouse Cloud 控制台中，导航至 **Data Sources &gt; Create ClickPipe**，然后选择 **Amazon S3**。输入连接 S3 存储桶所需的详细信息。在 **Authentication method** 下，选择 **IAM role**，并提供您在上一步中创建的角色的 ARN。

  **2.** 在 **Incoming data** 下，开启 **Continuous ingestion**。选择 **Any order** 作为摄取模式，并提供连接到您存储桶的队列的 **SQS queue URL**。

  **3.** 在 **Parse information** 下，为目标表定义 **Sorting key**。对映射的 schema 进行必要的调整，然后为 ClickPipes 数据库用户配置角色。

  **4.** 检查配置并点击 **Create ClickPipe**。ClickPipes 将对您的 bucket 执行初始扫描，导入所有符合指定路径的现有文件，然后在新的 `ObjectCreated:*` 事件到达队列时开始处理新文件。
</VerticalStepper>