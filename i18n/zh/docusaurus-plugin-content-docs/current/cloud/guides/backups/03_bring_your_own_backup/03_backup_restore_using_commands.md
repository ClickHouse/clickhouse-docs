---
sidebar_label: '使用命令进行备份或恢复'
slug: /cloud/manage/backups/backup-restore-via-commands
title: '使用命令执行备份与恢复'
description: '介绍如何使用命令配合自有存储桶执行备份和恢复操作的页面'
sidebar_position: 3
doc_type: 'guide'
keywords: ['backups', 'disaster recovery', 'data protection', 'restore', 'cloud features']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 使用命令备份或恢复备份 \{#commands-experience\}

您可以使用 `BACKUP` 和 `RESTORE` 命令将备份导出到各自的存储桶中，
此外也可以通过[用户界面进行备份或恢复](/cloud/manage/backups/backup-restore-via-ui)。
本指南提供了针对三大云服务提供商（CSP）的相关命令。

## 要求 \{#requirements\}

要将备份导出到你自己的 CSP 存储 bucket 或从中恢复备份，你需要准备以下信息：

<Tabs>
  <TabItem value="AWS" label="AWS" default>
    1. AWS S3 endpoint，格式为：`s3://<bucket_name>.s3.amazonaws.com/<optional_directory>`
       例如：`s3://testchbackups.s3.amazonaws.com/`
       其中：
         * `testchbackups` 是用于导出备份的 S3 bucket 名称。
         * `backups` 是一个可选子目录。
    2. AWS access key 和 secret。也支持基于 AWS role 的身份验证，可按上文所述使用 role 替代 AWS access key 和 secret。
    <br/>
  </TabItem>
  <TabItem value="GCP" label="GCP">
   1.  GCS endpoint，格式为：`https://storage.googleapis.com/<bucket_name>/`
   2. 用于访问的 HMAC key 和 HMAC secret。
   <br/>
  </TabItem>
  <TabItem value="Azure" label="Azure">
    1. Azure 存储连接字符串。
    2. 存储帐户中的 Azure 容器名称。
    3. 容器中的 Azure Blob 对象。
    <br/>
  </TabItem>
</Tabs>

## 备份 / 恢复特定数据库 \{#backup_restore_db\}

此处演示如何对 *单个* 数据库进行备份和恢复。
完整的备份和恢复命令请参见[备份命令摘要](/operations/backup/overview#command-summary)。

### AWS S3 \{#aws-s3-bucket\}

<Tabs>
  <TabItem value="Backup" label="BACKUP" default>

```sql
BACKUP DATABASE test_backups 
TO S3(
  'https://testchbackups.s3.amazonaws.com/<uuid>',
  '<key id>',
  '<key secret>'
)
```

其中 `uuid` 是一个唯一标识符，用于区分一组备份。

:::note
您需要在该子目录中为每一次新的备份使用不同的 uuid，否则会收到 `BACKUP_ALREADY_EXISTS` 错误。
例如，如果您执行的是每日备份，则每天都需要使用新的 uuid。
:::
  </TabItem>
  <TabItem value="Restore" label="RESTORE" default>

```sql
RESTORE DATABASE test_backups
FROM S3(
  'https://testchbackups.s3.amazonaws.com/<uuid>',
  '<key id>',
  '<key secret>'
)
```
  </TabItem>
</Tabs>

### Google Cloud Storage (GCS) \{#google-cloud-storage\}

<Tabs>
  <TabItem value="Backup" label="BACKUP" default>
```sql
BACKUP DATABASE test_backups 
TO S3(
  'https://storage.googleapis.com/<bucket>/<uuid>',
  '<hmac-key>',
  '<hmac-secret>'
)
```

其中 `uuid` 是一个唯一标识符，用于标识该备份。

:::note
您需要在该子目录中为每一次新的备份使用不同的 uuid，否则会收到 `BACKUP_ALREADY_EXISTS` 错误。
例如，如果您执行的是每日备份，则每天都需要使用新的 uuid。
:::

  </TabItem>
  <TabItem value="Restore" label="RESTORE" default>
```sql
RESTORE DATABASE test_backups
FROM S3(
  'https://storage.googleapis.com/<bucket>/<uuid>',
  '<hmac-key>',
  '<hmac-secret>'
)
```
  </TabItem>
</Tabs>

### Azure Blob Storage \{#azure-blob-storage\}

<Tabs>
  <TabItem value="Backup" label="BACKUP" default>
```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage(
  '<AzureBlobStorage endpoint connection string>',
  '<container>',
  '<blob>/<>'
)
```

其中 `uuid` 是一个唯一标识符，用于标识该备份。

:::note
您需要在该子目录中为每一次新的备份使用不同的 uuid，否则会收到 `BACKUP_ALREADY_EXISTS` 错误。
例如，如果您执行的是每日备份，则每天都需要使用新的 uuid。
:::
</TabItem>
<TabItem value="Restore" label="RESTORE" default>
```sql
RESTORE DATABASE test_backups
FROM AzureBlobStorage(
  '<AzureBlobStorage endpoint connection string>',
  '<container>',
  '<blob>/<uuid>'
)
```
  </TabItem>
</Tabs>

## 备份 / 恢复整个服务 \{#backup_restore_entire_service\}

要备份整个服务，请使用以下命令。
该备份将包含已创建实体的所有用户数据和系统数据、设置配置文件、角色策略、配额和函数。
此处以 AWS S3 为例。
可以结合上文描述的语法，将这些命令用于 GCS 和 Azure Blob 存储的备份。

<Tabs>
<TabItem value="Backup" label="BACKUP" default>

```sql
BACKUP 
    TABLE system.users,
    TABLE system.roles,
    TABLE system.settings_profiles,
    TABLE system.row_policies,
    TABLE system.quotas,
    TABLE system.functions,
    ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
TO S3(
    'https://testchbackups.s3.amazonaws.com/<uuid>',
    '<key id>',
    '<key secret>'
)
```

其中 `uuid` 是用于标识该备份的唯一标识符。

</TabItem>
<TabItem value="Restore" label="RESTORE" default>

```sql
RESTORE ALL
FROM S3(
    'https://testchbackups.s3.amazonaws.com/<uuid>',
    '<key id>',
    '<key secret>'
)
```
</TabItem>
</Tabs>

## 常见问题解答 \{#backups-faq\}

<details>
<summary>我的云对象存储中的备份会怎样处理？ClickHouse 会在某个时间点自动清理它们吗？</summary>

我们支持将备份导出到您的存储桶（bucket），但在备份写入后，我们不会清理或删除任何备份。您需要自行管理存储桶中备份的生命周期，包括视需要删除、归档，或迁移到更低成本的存储以优化整体费用。

</details>

<details>
<summary>如果我将部分现有备份移动到另一个位置，恢复流程会受到怎样的影响？</summary>

如果有任何备份被移动到其他位置，您需要更新恢复命令，将其引用的位置修改为备份当前所在的新位置。

</details>

<details>
<summary>如果我更改了访问对象存储所需的凭证怎么办？</summary>

您需要在 UI 中更新已更改的凭证，之后备份才能再次成功执行。

</details>

<details>
<summary>如果我更改了导出外部备份的位置怎么办？</summary>

您需要在 UI 中更新新的位置，之后备份将开始写入新位置。旧的备份会继续保留在原始位置。

</details>

<details>
<summary>如何在某个已经启用外部备份的服务上禁用外部备份？</summary>

要为某个服务禁用外部备份，请进入该服务的设置界面，然后点击 Change external backup。在随后的界面中，点击 Remove setup 以禁用该服务的外部备份。

</details>