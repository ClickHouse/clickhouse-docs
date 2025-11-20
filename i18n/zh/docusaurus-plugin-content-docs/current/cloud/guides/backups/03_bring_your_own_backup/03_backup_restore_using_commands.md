---
sidebar_label: '使用命令进行备份或恢复'
slug: /cloud/manage/backups/backup-restore-via-commands
title: '使用命令创建或恢复备份'
description: '本页介绍如何使用您自己的 bucket，通过命令创建或恢复备份'
sidebar_position: 3
doc_type: 'guide'
keywords: ['backups', 'disaster recovery', 'data protection', 'restore', 'cloud features']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 使用命令备份或恢复 {#commands-experience}

用户可以使用 `BACKUP` 和 `RESTORE` 命令将备份导出到存储桶，也可以[通过用户界面](/cloud/manage/backups/backup-restore-via-ui)进行备份或恢复。本指南提供了所有三个云服务提供商（CSP）的相关命令。


## 要求 {#requirements}

要将备份导出/恢复到您自己的 CSP 存储桶,您需要以下信息:

<Tabs>
  <TabItem value="AWS" label="AWS" default>
    1. AWS S3 端点,格式为:`s3://<bucket_name>.s3.amazonaws.com/<optional_directory>`
       例如:`s3://testchbackups.s3.amazonaws.com/`
       其中:
         * `testchbackups` 是要导出备份的 S3 存储桶名称。
         * `backups` 是可选的子目录。
    2. AWS 访问密钥和密文。也支持基于 AWS 角色的身份验证,可以代替 AWS 访问密钥和密文使用,如上一节所述。
    <br/>
  </TabItem>
  <TabItem value="GCP" label="GCP">
   1.  GCS 端点,格式为:`https://storage.googleapis.com/<bucket_name>/`
   2. 访问 HMAC 密钥和 HMAC 密文。
   <br/>
  </TabItem>
  <TabItem value="Azure" label="Azure">
    1. Azure 存储连接字符串。
    2. 存储账户中的 Azure 容器名称。
    3. 容器内的 Azure Blob。
    <br/>
  </TabItem>
</Tabs>


## 备份/恢复特定数据库 {#backup_restore_db}

本节演示如何备份和恢复_单个_数据库。
完整的备份和恢复命令请参阅[备份命令摘要](/operations/backup#command-summary)。

### AWS S3 {#aws-s3-bucket}

<Tabs>
  <TabItem value="Backup" label="备份" default>

```sql
BACKUP DATABASE test_backups
TO S3(
  'https://testchbackups.s3.amazonaws.com/<uuid>',
  '<key id>',
  '<key secret>'
)
```

其中 `uuid` 是唯一标识符,用于区分不同的备份集。

:::note
在此子目录中,每次新备份都需要使用不同的 uuid,否则会出现 `BACKUP_ALREADY_EXISTS` 错误。
例如,如果您执行每日备份,则每天需要使用新的 uuid。
:::

  </TabItem>
  <TabItem value="Restore" label="恢复" default>

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

### Google Cloud Storage (GCS) {#google-cloud-storage}

<Tabs>
  <TabItem value="Backup" label="备份" default>
```sql
BACKUP DATABASE test_backups 
TO S3(
  'https://storage.googleapis.com/<bucket>/<uuid>',
  '<hmac-key>',
  '<hmac-secret>'
)
```

其中 `uuid` 是唯一标识符,用于标识该备份。

:::note
在此子目录中,每次新备份都需要使用不同的 uuid,否则会出现 `BACKUP_ALREADY_EXISTS` 错误。
例如,如果您执行每日备份,则每天需要使用新的 uuid。
:::

  </TabItem>
  <TabItem value="Restore" label="恢复" default>
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

### Azure Blob Storage {#azure-blob-storage}

<Tabs>
  <TabItem value="Backup" label="备份" default>
```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage(
  '<AzureBlobStorage endpoint connection string>',
  '<container>',
  '<blob>/<>'
)
```

其中 `uuid` 是唯一标识符,用于标识该备份。

:::note
在此子目录中,每次新备份都需要使用不同的 uuid,否则会出现 `BACKUP_ALREADY_EXISTS` 错误。
例如,如果您执行每日备份,则每天需要使用新的 uuid。
:::

</TabItem>
<TabItem value="Restore" label="恢复" default>
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


## 备份/恢复整个服务 {#backup_restore_entire_service}

要备份整个服务,请使用以下命令。
此备份将包含所有用户数据以及已创建实体的系统数据,包括设置配置文件、角色策略、配额和函数。
以下示例使用 AWS S3。
您可以使用上述语法将这些命令应用于 GCS 和 Azure Blob 存储的备份。

<Tabs>
<TabItem value="Backup" label="备份" default>

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

其中 `uuid` 是用于标识备份的唯一标识符。

</TabItem>
<TabItem value="Restore" label="恢复" default>

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


## 常见问题 {#backups-faq}

<details>
<summary>云对象存储中的备份会如何处理?ClickHouse 会在某个时候清理它们吗?</summary>

我们为您提供将备份导出到您的存储桶的功能,但是,一旦写入,我们不会清理或删除任何备份。您需要自行管理存储桶中备份的生命周期,包括根据需要删除、归档或移动到更低成本的存储以优化总体成本。

</details>

<details>
<summary>如果我将一些现有备份移动到另一个位置,恢复过程会受到什么影响?</summary>

如果任何备份被移动到另一个位置,则需要更新恢复命令以指向存储备份的新位置。

</details>

<details>
<summary>如果我更改了访问对象存储所需的凭据怎么办?</summary>

您需要在用户界面中更新已更改的凭据,以便备份能够再次成功执行。

</details>

<details>
<summary>如果我更改导出外部备份的位置怎么办?</summary>

您需要在用户界面中更新新位置,备份将开始写入到新位置。旧备份将保留在原始位置。

</details>

<details>
<summary>如何在已启用外部备份的服务上禁用外部备份?</summary>

要为服务禁用外部备份,请转到服务设置页面,然后单击"更改外部备份"。在随后的页面中,单击"删除设置"以禁用该服务的外部备份。

</details>
