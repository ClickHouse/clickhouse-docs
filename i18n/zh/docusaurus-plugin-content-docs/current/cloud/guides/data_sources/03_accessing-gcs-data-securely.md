---
slug: /cloud/data-sources/secure-gcs
sidebar_label: '安全访问 GCS 数据'
title: '安全访问 GCS 数据'
description: '本文演示 ClickHouse Cloud 客户如何安全地访问其 GCS 数据'
keywords: ['GCS']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import IAM_and_admin from '@site/static/images/cloud/guides/accessing-data/GCS/IAM_and_admin.png';
import create_service_account from '@site/static/images/cloud/guides/accessing-data/GCS/create_service_account.png';
import create_and_continue from '@site/static/images/cloud/guides/accessing-data/GCS/create_and_continue.png';
import storage_object_user_role from '@site/static/images/cloud/guides/accessing-data/GCS/storage_object_user.png';
import note_service_account_email from '@site/static/images/cloud/guides/accessing-data/GCS/note_service_account_email.png';
import cloud_storage_settings from '@site/static/images/cloud/guides/accessing-data/GCS/cloud_storage_settings.png';
import create_key_for_service_account from '@site/static/images/cloud/guides/accessing-data/GCS/create_key_for_service_account.png';
import create_key from '@site/static/images/cloud/guides/accessing-data/GCS/create_a_key.png';
import clickpipes_hmac_key from '@site/static/images/cloud/guides/accessing-data/GCS/clickpipes_hmac_key.png';

本指南演示如何安全地对 Google Cloud Storage (GCS) 进行身份验证，并从 ClickHouse Cloud 访问您的数据。


## 介绍 {#introduction}

ClickHouse Cloud 使用与 Google Cloud 服务账号关联的 HMAC（基于哈希的消息认证码）密钥连接到 GCS。
这种方式为访问 GCS 存储桶提供了安全机制，而无需在查询中直接嵌入凭证。

工作原理如下：

1. 创建一个具备相应 GCS 权限的 Google Cloud 服务账号
2. 为该服务账号生成 HMAC 密钥
3. 将这些 HMAC 凭证提供给 ClickHouse Cloud
4. ClickHouse Cloud 使用这些凭证访问 GCS 存储桶

通过这种方式，可以通过服务账号上的 IAM 策略统一管理对 GCS 存储桶的所有访问，无需修改单个存储桶策略即可更方便地授予或撤销访问权限。

## 前提条件 {#prerequisites}

要按照本指南进行操作，您需要准备：

- 一个有效的 ClickHouse Cloud 服务
- 一个已启用 Cloud Storage 的 Google Cloud 项目
- 在您的 GCP 项目中创建服务账号并生成 HMAC 密钥的权限

## 安装和配置 {#setup}

<VerticalStepper headerLevel="h3">
  ### 创建 Google Cloud 服务账号

  1. 在 Google Cloud 控制台中，转到 “IAM 和管理” → “服务帐号”

  <Image img={IAM_and_admin} size="md" alt="" />

  2. 在左侧菜单中点击 `Service accounts`，然后点击 `Create service account`：

  <Image img={create_service_account} size="md" alt="" />

  为您的服务账户输入名称和描述,例如:

  ```text
  Service account name: clickhouse-gcs-access (or your preferred name)
  Service account description: Service account for ClickHouse Cloud to access GCS buckets
  ```

  点击 `Create and continue`（创建并继续）

  <Image img={create_and_continue} size="sm" alt="" />

  为服务账号授予 `Storage Object User` 角色:

  <Image img={storage_object_user_role} size="sm" alt="" />

  该角色提供对 GCS 对象的读写访问权限

  :::tip
  对于只读访问权限,请使用 `Storage Object Viewer`
  如需更精细的控制,可以创建自定义角色
  :::

  点击 `Continue`,然后点击 `Done`

  记录服务账号的电子邮件地址:

  <Image img={note_service_account_email} size="md" alt="" />

  ### 为服务账户授予存储桶访问权限

  您可以在项目级别或单个存储桶级别授予访问权限。

  #### 选项 1:授予特定存储桶的访问权限(推荐)

  1. 转到 `Cloud Storage` → `Buckets`
  2. 点击要授予访问权限的存储桶
  3. 进入 `Permissions` 选项卡
  4. 在“Permissions”部分中，为在前面步骤中创建的 principal 点击 `Grant access`
  5. 在“New principals”字段中输入您的服务账户电子邮件地址
  6. 请选择合适的角色：

  * 用于读写访问的对象存储用户
  * 用于只读访问的 Storage Object Viewer 角色

  7. 单击 `Save`
  8. 如有其他 bucket，请重复上述步骤

  #### 选项 2:授予项目级别访问权限

  1. 前往 `IAM & Admin` → `IAM`
  2. 单击 `Grant access`
  3. 在 `New principals` 字段中输入您的服务账号电子邮箱地址
  4. 选择 Storage Object User（只读访问请选择 Storage Object Viewer）
  5. 点击“保存”

  :::warning 安全最佳实践
  仅授予 ClickHouse 访问所需特定存储桶的权限,而非项目级权限。
  :::

  ### 为服务账户生成 HMAC 密钥

  导航至 `Cloud Storage` → `Settings` → `Interoperability`:

  <Image img={cloud_storage_settings} size="sm" alt="" />

  如果您没有看到&quot;Access keys&quot;部分,请单击 `Enable interoperability access`

  在&quot;Access keys for service accounts&quot;下,点击 `Create a key for a service account`:

  <Image img={create_key_for_service_account} size="md" alt="" />

  选择您之前创建的服务账号(例如 clickhouse-gcs-access@your-project.iam.gserviceaccount.com)

  点击 `Create key`：

  <Image img={create_key} size="md" alt="" />

  系统将显示 HMAC 密钥。
  请立即保存访问密钥和密钥 - 之后将无法再次查看该密钥。

  示例密钥如下所示:

  ```vbnet
  Access Key: GOOG1EF4YBJVNFQ2YGCP3SLV4Y7CMFHW7HPC6EO7RITLJDDQ75639JK56SQVD
  Secret: nFy6DFRr4sM9OnV6BG4FtWVPR25JfqpmcdZ6w9nV
  ```

  :::danger 重要
  请妥善保管这些凭据。
  关闭此页面后将无法再次获取该密钥。
  如果丢失密钥,您需要重新生成。
  :::

  ## 在 ClickHouse Cloud 中使用 HMAC 密钥

  现在您可以使用 HMAC 凭据从 ClickHouse Cloud 访问 GCS。
  为此,请使用 GCS 表函数:

  ```sql
  SELECT *
  FROM gcs(
      'https://storage.googleapis.com/clickhouse-docs-example-bucket/epidemiology.csv',
      'GOOG1E...YOUR_ACCESS_KEY',
      'YOUR_SECRET_KEY',
      'CSVWithNames'
  );
  ```

  使用通配符匹配多个文件:

  ```sql
  SELECT *
  FROM gcs(
  'https://storage.googleapis.com/clickhouse-docs-example-bucket/*.parquet',
  'GOOG1E...YOUR_ACCESS_KEY',
  'YOUR_SECRET_KEY',
  'Parquet'
  );
  ```

  ## ClickPipes for GCS 中的 HMAC 身份验证

  ClickPipes 使用 HMAC(基于哈希的消息身份验证码)密钥向 Google Cloud Storage 进行身份验证。

  当[设置 GCS ClickPipe](/integrations/clickpipes/object-storage/gcs/get-started) 时:

  1. 在 ClickPipe 设置过程中，将 `Authentication method` 设置为 `Credentials`
  2. 提供在前述步骤中获取的 HMAC 凭据

  <Image img={clickpipes_hmac_key} size="md" alt="" />

  :::note
  当前不支持服务账号身份验证 - 必须使用 HMAC 密钥
  GCS 存储桶 URL 必须使用格式:`https://storage.googleapis.com/<bucket>/<path>`(不支持 `gs://`)
  :::

  HMAC 密钥必须与具有 `roles/storage.objectViewer` 角色的服务账号关联,该角色包含:

  * `storage.objects.list`: 用于列出存储桶中的对象
  * `storage.objects.get`：用于获取/读取对象
</VerticalStepper>

## 最佳实践 {#best-practices}

### 为不同环境使用单独的服务账户 {#separate-service-accounts}

为开发、预发布和生产环境创建单独的服务账户。例如：

- `clickhouse-gcs-dev@project.iam.gserviceaccount.com`
- `clickhouse-gcs-staging@project.iam.gserviceaccount.com`
- `clickhouse-gcs-prod@project.iam.gserviceaccount.com`

这样可以在不影响其他环境的情况下，轻松撤销某个特定环境的访问权限。

### 应用最小权限访问原则 {#apply-least-privilege-access}

仅授予完成任务所需的最小权限：

- 对只读访问使用 **Storage Object Viewer**
- 仅授予对特定存储桶的访问权限，而不是整个项目级别
- 考虑使用存储桶级条件，将访问限制到特定路径

### 定期轮换 HMAC 密钥 {#rotate-hmac-keys}

制定并执行密钥轮换计划：

- 生成新的 HMAC 密钥
- 使用新密钥更新 ClickHouse 配置
- 使用新密钥验证功能是否正常
- 删除旧的 HMAC 密钥

:::tip
Google Cloud 不强制 HMAC 密钥过期，因此需要自行制定并实施轮换策略。
:::

### 使用 Cloud Audit Logs 监控访问 {#monitor-access}

为 Cloud Storage 启用并监控 Cloud Audit Logs：

1. 前往 IAM &amp; Admin → Audit Logs
2. 在列表中找到 Cloud Storage
3. 启用 `Admin Read`、`Data Read` 和 `Data Write` 日志
4. 使用这些日志来监控访问模式并检测异常