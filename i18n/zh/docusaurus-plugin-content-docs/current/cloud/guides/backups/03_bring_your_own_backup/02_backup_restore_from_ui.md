---
sidebar_label: '使用 UI 备份或恢复'
slug: /cloud/manage/backups/backup-restore-via-ui
title: '在 UI 中创建或恢复备份'
description: '介绍如何在 UI 中使用您自己的存储桶创建或恢复备份的页面'
sidebar_position: 2
doc_type: 'guide'
keywords: ['备份', '灾难恢复', '数据保护', '恢复', '云功能']
---

import Image from '@theme/IdealImage'
import arn from '@site/static/images/cloud/manage/backups/arn.png'
import change_external_backup from '@site/static/images/cloud/manage/backups/change_external_backup.png'
import configure_arn_s3_details from '@site/static/images/cloud/manage/backups/configure_arn_s3_details.png'
import view_backups from '@site/static/images/cloud/manage/backups/view_backups.png'
import backup_command from '@site/static/images/cloud/manage/backups/backup_command.png'
import gcp_configure from '@site/static/images/cloud/manage/backups/gcp_configure.png'
import gcp_stored_backups from '@site/static/images/cloud/manage/backups/gcp_stored_backups.png'
import gcp_restore_command from '@site/static/images/cloud/manage/backups/gcp_restore_command.png'
import azure_connection_details from '@site/static/images/cloud/manage/backups/azure_connection_details.png'
import view_backups_azure from '@site/static/images/cloud/manage/backups/view_backups_azure.png'
import restore_backups_azure from '@site/static/images/cloud/manage/backups/restore_backups_azure.png'


# 通过用户界面备份和恢复 {#ui-experience}



## AWS {#AWS}

### 将备份导出到 AWS {#taking-backups-to-aws}

#### 1. 在 AWS 中执行的步骤 {#aws-steps}

:::note
这些步骤与["安全访问 S3 数据"](/cloud/data-sources/secure-s3)中描述的安全 S3 设置类似,但角色权限需要额外的操作
:::

在您的 AWS 账户中执行以下步骤:

<VerticalStepper headerLevel="h5">

##### 创建 AWS S3 存储桶 {#create-s3-bucket}

在您的账户中创建一个 AWS S3 存储桶,用于导出备份。

##### 创建 IAM 角色 {#create-iam-role}

AWS 使用基于角色的身份验证,因此需要创建一个 IAM 角色,使 ClickHouse Cloud 服务能够代入该角色并写入此存储桶。

- a. 从 ClickHouse Cloud 服务设置页面的"网络安全信息"下获取 ARN,其格式类似于:

<Image img={arn} alt='AWS S3 ARN' size='lg' />

- b. 为此角色创建如下信任策略:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "backup service",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::463754717262:role/CH-S3-bordeaux-ar-90-ue2-29-Role"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

##### 更新角色权限 {#update-permissions-for-role}

您还需要为此角色设置权限,以便 ClickHouse Cloud 服务能够写入 S3 存储桶。
这可以通过为角色创建权限策略来完成,使用类似以下的 JSON,其中在两处资源位置替换为您的存储桶 ARN。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::byob-ui"],
      "Effect": "Allow"
    },
    {
      "Action": ["s3:Get*", "s3:List*", "s3:PutObject"],
      "Resource": ["arn:aws:s3:::byob-ui/*"],
      "Effect": "Allow"
    },
    {
      "Action": ["s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::byob-ui/*/.lock"],
      "Effect": "Allow"
    }
  ]
}
```

</VerticalStepper>

#### 2. 在 ClickHouse Cloud 中执行的步骤 {#cloud-steps}

在 ClickHouse Cloud 控制台中执行以下步骤以配置外部存储桶:

<VerticalStepper headerLevel="h5">

##### 更改外部备份 {#configure-external-bucket}

在"设置"页面上,点击"设置外部备份":

<Image img={change_external_backup} alt='Change external backup' size='lg' />

##### 配置 AWS IAM 角色 ARN 和 S3 存储桶详细信息 {#configure-aws-iam-role-arn-and-s3-bucket-details}

在下一个屏幕上提供您刚创建的 AWS IAM 角色 ARN 和 S3 存储桶 URL,格式如下:

<Image
  img={configure_arn_s3_details}
  alt='Configure AWS IAM Role ARN and S3 bucket details'
  size='lg'
/>

##### 保存更改 {#save-changes}

点击"保存外部存储桶"以保存设置

##### 更改默认备份计划 {#changing-the-backup-schedule}

外部备份现在将按默认计划在您的存储桶中执行。
或者,您可以从"设置"页面配置备份计划。
如果配置不同,自定义计划将用于将备份写入您的存储桶,而默认计划(每 24 小时备份一次)将用于 ClickHouse Cloud 所有的存储桶中的备份。

##### 查看存储在您的存储桶中的备份 {#view-backups-stored-in-your-bucket}

"备份"页面将在单独的表中显示您的存储桶中的这些备份,如下所示:

<Image img={view_backups} alt='View backups stored in your bucket' size='lg' />

</VerticalStepper>

### 从 AWS 恢复备份 {#restoring-backups-from-aws}

执行以下步骤从 AWS 恢复备份:

<VerticalStepper headerLevel="h5">

##### 创建新服务以进行恢复 {#create-new-service-to-restore-to}


创建一个新服务用于恢复备份。

##### 添加服务 ARN {#add-service-arn}

将新创建服务的 ARN(可从 ClickHouse Cloud 控制台的服务设置页面获取)添加到 IAM 角色的信任策略中。此操作与上述 AWS 步骤部分中的[第二步](#create-iam-role)相同。这是必需的操作,以便新服务能够访问 S3 存储桶。

##### 获取用于恢复备份的 SQL 命令 {#obtain-sql-command-to-restore-backup}

在 UI 中点击备份列表上方的"访问或恢复备份"链接,以获取用于恢复备份的 SQL 命令。该命令如下所示:

<Image
  img={backup_command}
  alt='获取用于恢复备份的 SQL 命令'
  size='md'
/>

:::warning 将备份移动到其他位置
如果将备份移动到其他位置,则需要自定义恢复命令以引用新位置。
:::

:::tip ASYNC 命令
对于恢复命令,您还可以选择在末尾添加 `ASYNC` 命令以进行大型恢复操作。
这允许恢复以异步方式进行,因此即使连接中断,恢复操作也会继续运行。
需要注意的是,ASYNC 命令会立即返回成功状态。
但这并不意味着恢复操作已成功完成。
您需要监控 `system.backups` 表以查看恢复是否已完成以及操作结果是成功还是失败。
:::

##### 运行恢复命令 {#run-the-restore-command}

在新创建服务的 SQL 控制台中运行恢复命令以恢复备份。

</VerticalStepper>


## GCP {#gcp}

### 将备份导出到 GCP {#taking-backups-to-gcp}

按照以下步骤将备份导出到 GCP：

#### 在 GCP 中执行的步骤 {#gcp-steps-to-follow}

<VerticalStepper headerLevel="h5">

##### 创建 GCP 存储桶 {#create-a-gcp-storage-bucket}

在您的 GCP 账户中创建一个存储桶以导出备份。

##### 生成 HMAC 密钥和密文 {#generate-an-hmac-key-and-secret}

生成 HMAC 密钥和密文，这是基于密码的身份验证所必需的。按照以下步骤生成密钥：

- a. 创建服务账户
  - I. 在 Google Cloud Console 中导航到 IAM & Admin 部分，然后选择 `Service Accounts`。
  - II. 点击 `Create Service Account` 并提供名称和 ID。点击 `Create and Continue`。
  - III. 向此服务账户授予 Storage Object User 角色。
  - IV. 点击 `Done` 完成服务账户创建。

- b. 生成 HMAC 密钥
  - I. 在 Google Cloud Console 中转到 Cloud Storage，然后选择 `Settings`
  - II 转到 Interoperability 选项卡。
  - III. 在 `Service account HMAC` 部分，点击 `Create a key for a service account`。
  - IV. 从下拉菜单中选择您在上一步中创建的服务账户。
  - V. 点击 `Create key`。

- c. 安全存储凭据：
  - I. 系统将显示 Access ID（您的 HMAC 密钥）和 Secret（您的 HMAC 密文）。请保存这些值，因为关闭此窗口后将不再显示密文。

</VerticalStepper>

#### 在 ClickHouse Cloud 中执行的步骤 {#gcp-cloud-steps}

在 ClickHouse Cloud 控制台中按照以下步骤配置外部存储桶：

<VerticalStepper headerLevel="h5">

##### 更改外部备份 {#gcp-configure-external-bucket}

在 `Settings` 页面上，点击 `Change external backup`

<Image img={change_external_backup} alt='Change external backup' size='lg' />

##### 配置 GCP HMAC 密钥和密文 {#gcp-configure-gcp-hmac-key-and-secret}

在弹出对话框中，提供在上一节中创建的 GCP 存储桶路径、HMAC 密钥和密文。

<Image img={gcp_configure} alt='Configure GCP HMAC Key and Secret' size='md' />

##### 保存外部存储桶 {#gcp-save-external-bucket}

点击 `Save External Bucket` 保存设置。

##### 更改默认备份计划 {#gcp-changing-the-backup-schedule}

外部备份现在将按照默认计划在您的存储桶中执行。
或者，您可以从 `Settings` 页面配置备份计划。
如果配置不同，自定义计划将用于将备份写入您的存储桶，而默认计划（每 24 小时备份一次）将用于 ClickHouse Cloud 所有的存储桶中的备份。

##### 查看存储在您的存储桶中的备份 {#gcp-view-backups-stored-in-your-bucket}

Backups 页面应在单独的表中显示您的存储桶中的这些备份，如下所示：

<Image
  img={gcp_stored_backups}
  alt='View backups stored in your bucket'
  size='lg'
/>

</VerticalStepper>

### 从 GCP 恢复备份 {#gcp-restoring-backups-from-gcp}

按照以下步骤从 GCP 恢复备份：

<VerticalStepper headerLevel="h5">

##### 创建新服务以恢复到 {#gcp-create-new-service-to-restore-to}

创建一个新服务以将备份恢复到该服务。

##### 获取用于恢复备份的 SQL 命令 {#gcp-obtain-sql-command-to-restore-backup}

点击 UI 中备份列表上方的 `access or restore a backup` 链接以获取恢复备份的 SQL 命令。该命令应如下所示，您可以从下拉菜单中选择适当的备份以获取该特定备份的恢复命令。您需要将密钥访问密钥添加到命令中：

<Image
  img={gcp_restore_command}
  alt='Get SQL command used to restore backup'
  size='md'
/>

:::warning 将备份移动到其他位置
如果您将备份移动到其他位置，则需要自定义恢复命令以引用新位置。
:::


:::tip ASYNC 命令
对于 Restore 命令，您可以选择在末尾添加 `ASYNC` 命令来处理大型恢复操作。
这样可以使恢复过程异步执行，即使连接中断，恢复操作也会继续运行。
需要注意的是，ASYNC 命令会立即返回成功状态。
但这并不代表恢复操作已成功完成。
您需要监控 `system.backups` 表来查看恢复是否已完成以及执行结果。
:::

##### 运行 SQL 命令恢复备份 {#gcp-run-sql-command-to-restore-backup}

在新创建的服务的 SQL 控制台中运行恢复命令来恢复备份。

</VerticalStepper>


## Azure {#azure}

### 将备份保存到 Azure {#taking-backups-to-azure}

按照以下步骤将备份保存到 Azure：

#### 在 Azure 中需要执行的步骤 {#steps-to-follow-in-azure}

<VerticalStepper headerLevel="h5">

##### 创建存储帐户 {#azure-create-a-storage-account}

在 Azure 门户中创建一个新的存储帐户，或选择一个现有的存储帐户，用于存放你的备份。

##### 获取连接字符串 {#azure-get-connection-string}

* a. 在存储帐户的“概览”中，找到名为 `Security + networking` 的部分，并点击 `Access keys`。
* b. 这里你会看到 `key1` 和 `key2`。在每个密钥下方，你会找到一个 `Connection string` 字段。
* c. 点击 `Show` 以显示连接字符串。复制该连接字符串，你将在 ClickHouse Cloud 中进行后续配置时使用它。

</VerticalStepper>

#### 在 ClickHouse Cloud 中需要执行的步骤 {#azure-cloud-steps}

在 ClickHouse Cloud 控制台中按照以下步骤配置外部 bucket：

<VerticalStepper headerLevel="h5">

##### 更改外部备份 {#azure-configure-external-bucket}

在 `Settings` 页面上，点击 `Change external backup`。

<Image img={change_external_backup} alt="更改外部备份" size="lg" />

##### 为 Azure 存储帐户提供连接字符串和容器名称 {#azure-provide-connection-string-and-container-name-azure}

在下一个界面中，提供在上一节中创建的 Azure 存储帐户的 Connection String 和 Container Name：

<Image img={azure_connection_details} alt="为 Azure 存储帐户提供连接字符串和容器名称" size="md" />

##### 保存外部 bucket {#azure-save-external-bucket}

点击 `Save External Bucket` 以保存设置。

##### 将备份计划从默认计划更改为自定义计划 {#azure-changing-the-backup-schedule}

外部备份现在会按照默认计划写入你的 bucket。或者，
你也可以在 `Settings` 页面配置备份计划。如果配置了自定义计划，
则会使用该自定义计划将备份写入你的 bucket，而默认计划
（每 24 小时备份一次）会用于 ClickHouse Cloud 自有 bucket 中的备份。

##### 查看存储在 bucket 中的备份 {#azure-view-backups-stored-in-your-bucket}

`Backups` 页面应在一个单独的表格中显示存储在你的 bucket 中的这些备份，如下所示：

<Image img={view_backups_azure} alt="查看存储在 bucket 中的备份" size="md" />

</VerticalStepper>

### 从 Azure 恢复备份 {#azure-restore-steps}

要从 Azure 恢复备份，请按照以下步骤操作：

<VerticalStepper headerLevel="h5">

##### 创建一个用于恢复的新服务 {#azure-create-new-service-to-restore-to}

创建一个新服务用于恢复备份。目前，我们仅支持
将备份恢复到新服务中。

##### 获取用于恢复备份的 SQL 命令 {#azure-obtain-sql-command-to-restore-backup}

在 UI 中，点击备份列表上方的 `access or restore a backup` 链接，
以获取用于恢复备份的 SQL 命令。该命令应类似如下，
你可以从下拉列表中选择合适的备份，以获取该特定备份的
恢复命令。你需要在命令中添加 Azure 存储帐户的连接字符串。

<Image img={restore_backups_azure} alt="在 Azure 中恢复备份" size="md" />

:::warning 将备份移动到其他位置
如果你将备份移动到其他位置，则需要自定义恢复命令以引用新的位置。
:::

:::tip ASYNC 命令
对于 Restore 命令，你也可以在末尾可选地添加一个 `ASYNC` 命令来处理大规模恢复。
这允许恢复过程以异步方式进行，因此即使连接中断，恢复仍会继续运行。
需要注意的是，ASYNC 命令会立即返回成功状态。
这并不代表恢复已成功完成。
你需要监控 `system.backups` 表，以确认恢复是否已完成，以及是成功还是失败。
:::

##### 运行 SQL 命令以恢复备份 {#azure-run-sql-command-to-restore-backup}

在新创建的服务中，通过 SQL 控制台运行恢复命令，
以恢复该备份。

</VerticalStepper>
