---
sidebar_label: '配置无序模式'
sidebar_position: 3
title: '为持续摄取配置无序模式'
slug: /integrations/clickpipes/object-storage/gcs/unordered-mode
description: '在 GCS ClickPipes 中为持续摄取配置无序模式的分步指南。'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

默认情况下，GCS ClickPipe 假定 File 会按[字典序](/integrations/clickpipes/object-storage/gcs/overview#continuous-ingestion-lexicographical-order)添加到存储桶中。也可以通过设置一个连接到该存储桶的 [Google Cloud Pub/Sub](https://cloud.google.com/pubsub) 订阅，将 GCS ClickPipe 配置为摄取不具备隐式顺序的 File。这使 ClickPipes 能够监听 `OBJECT_FINALIZE` 通知，并摄取任何新 File，而不受 File 命名约定的影响。

:::note
无序模式**不**支持公共存储桶。它需要 **Service Account** 身份验证，以及一个连接到该存储桶的 [Google Cloud Pub/Sub](https://cloud.google.com/pubsub) 订阅。
:::


## 工作原理 \{#how-it-works\}

在此模式下，GCS ClickPipe 会先对所选路径中的**所有文件**执行初始加载，然后通过与指定路径匹配的 Pub/Sub 订阅监听对象通知。对于先前已见过的文件、不匹配该路径的文件，或不同类型事件的任何消息，都将被**忽略**。**无法**从特定文件或某个时间点开始摄取——ClickPipes 始终会加载所选路径中的所有文件。

摄取数据时，可能会发生各种类型的故障，从而导致部分插入或重复数据。对象存储 ClickPipes 能够抵御插入失败，并通过临时暂存表提供 exactly-once 语义。数据会先插入暂存表；如果出现问题，暂存表会被截断，并从干净状态重试插入。只有在插入成功完成后，分区才会被移动到目标表。

<VerticalStepper type="numbered" headerLevel="h2">

## 创建 Google Cloud Pub/Sub 主题 \{#create-pubsub-topic\}

**1.** 在 Google Cloud Console 中，导航到 **Pub/Sub > Topics > Create topic**。创建一个带默认订阅的新主题，并记下 **Topic Name**。

**2.** 配置一个 GCS 存储桶通知，将 [`OBJECT_FINALIZE` 事件](https://docs.cloud.google.com/storage/docs/pubsub-notifications)发布到上面创建的 Pub/Sub 主题。

**2.1.** 此步骤无法在 Google Cloud Console 中执行，因此您必须使用 `gcloud` 客户端或您偏好的 Google Cloud 编程接口。例如，使用 `gcloud`：

  ```bash
  # Create a Pub/Sub notification for new objects in the bucket
  gcloud storage buckets notifications create "gs://${YOUR_BUCKET_NAME}" \
    --topic="projects/${YOUR_PROJECT_ID}/topics/${YOUR_TOPIC_NAME}" \
    --event-types="OBJECT_FINALIZE" \
    --payload-format="json"

  # List the Pub/Sub notifications in the bucket
  gcloud storage buckets notifications describe
  ```

## 配置服务账号 \{#configure-service-account\}

**1.** 配置一个 [服务账号](http://docs.cloud.google.com/iam/docs/keys-create-delete)，并授予其[所需权限](/integrations/clickpipes/object-storage/gcs/overview#permissions)，以允许 ClickPipes 列出并获取指定存储桶中的对象，以及使用和监控 Pub/Sub 订阅中的通知。

**1.1.** 此步骤可以在 Google Cloud Console 中执行，也可以使用 `gcloud` 客户端或您偏好的 Google Cloud 编程接口。例如，使用 `gcloud`：

  ```bash
  # 1. Grant read access to the GCS bucket
  gcloud storage buckets add-iam-policy-binding "gs://${YOUR_BUCKET_NAME}" \
    --member="serviceAccount:${YOUR_SERVICE_ACCOUNT}@${YOUR_PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.objectViewer"

  # 2. Grant read access to the Pub/Sub subscription
  gcloud pubsub subscriptions add-iam-policy-binding "${YOUR_SUBSCRIPTION_NAME}" \
    --member="serviceAccount:${YOUR_SERVICE_ACCOUNT}@${YOUR_PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/pubsub.subscriber"

  # 3. Grant permission to get the Pub/Sub subscription metadata
  gcloud pubsub subscriptions add-iam-policy-binding "${YOUR_SUBSCRIPTION_NAME}" \
    --member="serviceAccount:${YOUR_SERVICE_ACCOUNT}@${YOUR_PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/pubsub.viewer"
  ```

## 以无序模式创建 ClickPipe \{#create-clickpipe\}

**1.** 在 ClickHouse Cloud 控制台中，导航到 **Data Sources > Create ClickPipe**，并选择 **Google Cloud Storage**。输入用于连接到您的 GCS 存储桶的详细信息。在 **Authentication method** 下，选择 **Service Account** 并提供 `.json` 服务账号密钥。

**2.** 打开 **持续摄取**，然后选择 **Any order** 作为摄取模式，并提供与您的存储桶相连的 **Pub/Sub 订阅** 名称。订阅名称必须遵循以下格式：

```text
projects/${YOUR_PROJECT_ID}/subscriptions/${YOUR_SUBSCRIPTION_NAME}
```

**3.** 点击 **Incoming data**。为目标表定义一个 **Sorting key**。对映射后的 schema 进行必要调整，然后为 ClickPipes 数据库用户配置一个角色。

**4.** 检查配置并点击 **Create ClickPipe**。ClickPipes 将先对您的存储桶执行初始扫描，以加载与指定路径匹配的所有现有文件，然后在主题中收到新的 `OBJECT_FINALIZE` 事件时开始处理文件。

</VerticalStepper>