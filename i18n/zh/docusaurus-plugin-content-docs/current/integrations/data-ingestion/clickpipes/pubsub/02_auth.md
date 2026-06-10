---
slug: /integrations/clickpipes/pubsub/auth
sidebar_label: 'Pub/Sub IAM 权限'
title: 'Pub/Sub IAM 权限'
description: '本文介绍 ClickPipes 为通过 Google Cloud Pub/Sub 进行身份验证并从你的 topics 中消费数据所需的 GCP IAM 权限。'
doc_type: 'guide'
keywords: ['Google Cloud Pub/Sub', 'GCP IAM', '服务账号']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

:::note
你可以在[这里](https://clickhouse.com/cloud/clickpipes#pubsub-private-preview)注册加入私有预览候补名单。
:::

本文介绍 ClickPipes 为通过 Google Cloud Pub/Sub 进行身份验证并从你的 topics 中消费数据所需的 GCP IAM 权限，以及如何设置一个仅授予这些权限的服务账号。

## 前置条件 \{#prerequisite\}

要按照本指南进行操作，您需要：

* 一个处于活跃状态的 ClickHouse Cloud 服务
* 一个 GCP 项目，其中包含您要从中摄取数据的 Pub/Sub topic
* 该项目中的 IAM 权限，用于创建服务账号并授予角色

## 身份验证模型 \{#authentication-model\}

用于 Pub/Sub 的 ClickPipes 通过 [服务账号 JSON 密钥](https://cloud.google.com/iam/docs/keys-create-delete) 与 GCP 进行身份验证。创建 管道 时，您需要上传该密钥文件；ClickPipes 会对其进行静态加密，并在运行时将其用于：

* 列出并读取您项目中的 topic，
* 创建和删除 ClickPipes 用于消费消息的[托管订阅](/integrations/clickpipes/pubsub#managed-subscriptions)，
* 从该订阅消费消息，以及
* (可选) 从 Schema Registry 读取原生 Pub/Sub schema。

目前不支持 workload identity，也不支持以内联方式粘贴凭据——服务账号 JSON 密钥是当前唯一受支持的身份验证方法。

## 所需权限 \{#required-permissions\}

ClickPipes 需要在拥有该 topic 的 GCP 项目中具备以下 IAM 权限。这些权限覆盖整个管道生命周期：发现 (topic 列表、验证、采样) 、订阅管理、稳定运行期间的摄取以及清理。

### topic 访问 (发现与验证) \{#topic-access\}

| Permission                         | Purpose                                     |
| ---------------------------------- | ------------------------------------------- |
| `pubsub.topics.list`               | 在发现阶段列出项目中可用的 topics                        |
| `pubsub.topics.get`                | 验证 topic 是否存在，并获取 schema 设置                 |
| `pubsub.topics.attachSubscription` | 创建针对某个 **topic** 的订阅时，必须在该 **topic** 上具备此权限 |

### 订阅生命周期 (发现与摄取) \{#subscription-lifecycle\}

| Permission                     | Purpose                                 |
| ------------------------------ | --------------------------------------- |
| `pubsub.subscriptions.create`  | 创建托管订阅 (`clickpipes-{pipeID}`) 和临时发现订阅  |
| `pubsub.subscriptions.get`     | 健康检查 (每 60 秒一次) 、follower 轮询、订阅验证       |
| `pubsub.subscriptions.delete`  | 清理临时发现订阅，并在 pipe 删除时删除托管订阅              |
| `pubsub.subscriptions.consume` | `Receive()`、`Ack()`、`Nack()` 以及按时间戳寻道操作 |

### schema 访问 (可选——仅用于原生 Avro/Protobuf topic) \{#schema-access\}

| 权限                   | 用途                                       |
| -------------------- | ---------------------------------------- |
| `pubsub.schemas.get` | 从 Pub/Sub Schema Registry 获取原生 schema 定义 |

## 预定义角色 \{#predefined-roles\}

| 角色                                                                                                   | 是否足够？ | 说明                                                                                                          |
| ---------------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------- |
| [`roles/pubsub.editor`](https://cloud.google.com/iam/docs/understanding-roles#pubsub.editor)         | 是     | 覆盖所有必需权限，是权限范围最广的选项。                                                                                        |
| [`roles/pubsub.subscriber`](https://cloud.google.com/iam/docs/understanding-roles#pubsub.subscriber) | **否** | 缺少 `topics.list`、`topics.attachSubscription`、`subscriptions.create`、`subscriptions.delete` 和 `schemas.get`。 |
| [`roles/pubsub.viewer`](https://cloud.google.com/iam/docs/understanding-roles#pubsub.viewer)         | **否** | 只读——不支持订阅管理，也无法消费消息。                                                                                        |
| 自定义角色 *(推荐)*                                                                                         | 是     | 使用上述七项核心权限 (以及可选的 `schemas.get`) ，即可实现最小权限访问。                                                               |

## 设置 \{#setup\}

<VerticalStepper headerLevel="h3" />

### 创建自定义角色 (推荐) \{#create-custom-role\}

为遵循最小权限原则，请创建一个仅包含 ClickPipes 所需权限的自定义角色。

您可以使用 `gcloud` CLI 执行此操作：

```bash
gcloud iam roles create clickpipes.pubsub.ingestion \
  --project=YOUR_PROJECT_ID \
  --title="ClickPipes Pub/Sub Ingestion" \
  --description="Permissions required by ClickHouse ClickPipes to ingest from Pub/Sub" \
  --permissions=pubsub.topics.list,pubsub.topics.get,pubsub.topics.attachSubscription,pubsub.subscriptions.create,pubsub.subscriptions.get,pubsub.subscriptions.delete,pubsub.subscriptions.consume \
  --stage=GA
```

或者，在 GCP Console 中，前往 **IAM &amp; Admin → Roles → Create role**，并添加[所需权限](#required-permissions)中列出的权限。

:::note 可选权限
如果你要从使用原生 Pub/Sub Avro 或 Protobuf schema 的 topic 摄取数据，请将 `pubsub.schemas.get` 追加到 `--permissions` 列表中。否则请不要添加，以尽量保持角色权限最小化。
:::

如果你不想创建自定义角色，也可以直接授予 `roles/pubsub.editor`。

### 创建服务账号 \{#create-service-account\}

为 ClickPipe 创建专用的服务账号：

```bash
gcloud iam service-accounts create clickpipes-pubsub \
  --project=YOUR_PROJECT_ID \
  --display-name="ClickPipes Pub/Sub Ingestion"
```

### 向服务账号授予角色 \{#grant-role\}

在项目级别，将您创建的角色 (或 `roles/pubsub.editor`) 授予该服务账号：

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:clickpipes-pubsub@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="projects/YOUR_PROJECT_ID/roles/clickpipes.pubsub.ingestion"
```

### 创建并下载服务账号密钥 \{#create-key\}

为服务账号创建一个 JSON 密钥，并下载到本地：

```bash
gcloud iam service-accounts keys create clickpipes-pubsub-key.json \
  --iam-account=clickpipes-pubsub@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

您将在创建该管道时，在 ClickPipes 界面中上传此 `clickpipes-pubsub-key.json` 文件。

:::note 请将该密钥视为机密
服务账号密钥可用于访问您的 GCP 项目。请妥善保管该文件，不要将其提交到版本控制系统，并定期更换。上传后，ClickPipes 会对静态存储的密钥进行加密。
:::

## 说明 \{#notes\}

* `pubsub.topics.attachSubscription` 需要授予在**topic 资源**上，而不是 subscription 上。仅授予 subscription 级别权限时，通常会遗漏这一点。
* 如果你的 topic 未使用原生 Pub/Sub schema (Avro 或 Protobuf) ，则不需要 `pubsub.schemas.get` 权限。
* 托管订阅命名为 `clickpipes-{pipeID}`，确认截止时间为 60 秒，消息保留期为 7 天，并启用了消息排序。
* 临时发现订阅命名为 `clickpipes-discovery-{uuid}`，确认截止时间为 10 秒，保留期为 10 分钟，并设置了 24 小时后自动过期的生存时间 (TTL)。
* ClickPipes 将 `PermissionDenied` 和 `Unauthenticated` 错误视为不可重试——如果缺少权限，管道 会立即失败，而不是无限重试。