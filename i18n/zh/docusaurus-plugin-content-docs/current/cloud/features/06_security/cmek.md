---
'sidebar_label': '增强加密'
'slug': '/cloud/security/cmek'
'title': '客户管理加密密钥 (CMEK)'
'description': '了解更多关于客户管理加密密钥的信息'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import cmek_performance from '@site/static/images/_snippets/cmek-performance.png';


# ClickHouse增强加密

<EnterprisePlanFeatureBadge feature="Enhanced Encryption"/>

静态数据默认使用云服务提供商管理的AES 256密钥进行加密。客户可以启用透明数据加密（TDE）来为服务数据提供额外的保护层，或提供自己的密钥以实现客户管理加密密钥（CMEK）。

增强加密当前可在AWS和GCP服务中使用。Azure即将推出。

## 透明数据加密（TDE） {#transparent-data-encryption-tde}

在创建服务时必须启用TDE。现有服务在创建后无法进行加密。一旦启用TDE，就无法禁用。服务中的所有数据将保持加密状态。如果您想在启用TDE后禁用它，必须创建新服务并将数据迁移到新服务中。

1. 选择 `创建新服务`
2. 命名服务
3. 从下拉菜单中选择AWS或GCP作为云服务提供商和所需的区域
4. 点击企业功能的下拉菜单并切换启用透明数据加密（TDE）
5. 点击创建服务

## 客户管理加密密钥（CMEK） {#customer-managed-encryption-keys-cmek}

:::warning
删除用于加密ClickHouse Cloud服务的KMS密钥将导致您的ClickHouse服务停止，并且其数据将不可恢复，包括现有备份。为了防止在旋转密钥时意外数据丢失，您可能希望在删除之前保留旧的KMS密钥一段时间。
:::

一旦服务使用TDE加密，客户可以更新密钥以启用CMEK。更新TDE设置后，服务将自动重启。在此过程中，旧的KMS密钥将解密数据加密密钥（DEK），新的KMS密钥将重新加密DEK。这确保服务在重启后将使用新的KMS密钥进行后续的加密操作。此过程可能需要几分钟。

<details>
    <summary>使用AWS KMS启用CMEK</summary>
    
1. 在ClickHouse Cloud中，选择加密服务
2. 点击左侧的设置
3. 在屏幕底部，展开网络安全信息
4. 复制加密角色ID（AWS）或加密服务账号（GCP） - 您将在将来的步骤中需要此信息
5. [为AWS创建KMS密钥](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
6. 点击该密钥
7. 按如下方式更新AWS密钥策略：
    
```json
{
    "Sid": "Allow ClickHouse Access",
    "Effect": "Allow",
    "Principal": {
        "AWS": [ "Encryption role ID " ]
    },
    "Action": [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:ReEncrypt*",
        "kms:DescribeKey"
    ],
    "Resource": "*"
}
```
    
10. 保存密钥策略
11. 复制密钥ARN
12. 返回ClickHouse Cloud并将密钥ARN粘贴到服务设置的透明数据加密部分
13. 保存更改
    
</details>

<details>
    <summary>使用GCP KMS启用CMEK</summary>

1. 在ClickHouse Cloud中，选择加密服务
2. 点击左侧的设置
3. 在屏幕底部，展开网络安全信息
4. 复制加密服务账号（GCP） - 您将在将来的步骤中需要此信息
5. [为GCP创建KMS密钥](https://cloud.google.com/kms/docs/create-key)
6. 点击该密钥
7. 向在步骤4中复制的GCP加密服务账号授予以下权限。
   - Cloud KMS CryptoKey Encrypter/Decrypter
   - Cloud KMS Viewer
10. 保存密钥权限
11. 复制密钥资源路径
12. 返回ClickHouse Cloud并将密钥资源路径粘贴到服务设置的透明数据加密部分
13. 保存更改
    
</details>

## 密钥轮换 {#key-rotation}

一旦您设置了CMEK，通过上述程序旋转密钥，创建新的KMS密钥并授予权限。返回服务设置以粘贴新的ARN（AWS）或密钥资源路径（GCP），并保存设置。服务将重启以应用新密钥。

## 备份和恢复 {#backup-and-restore}

备份使用与关联服务相同的密钥进行加密。当您恢复加密备份时，会创建一个加密实例，使用与原始实例相同的KMS密钥。如有需要，您可以在恢复后旋转KMS密钥；有关更多详细信息，请参见 [密钥轮换](#key-rotation)。

## KMS密钥轮询器 {#kms-key-poller}

使用CMEK时，每10分钟会检查提供的KMS密钥的有效性。如果对KMS密钥的访问无效，ClickHouse服务将停止。要恢复服务，请按照本指南中的步骤恢复对KMS密钥的访问，然后重启服务。

## 性能 {#performance}

如本页所述，我们使用ClickHouse内置的[数据加密虚拟文件系统功能](/operations/storing-data#encrypted-virtual-file-system)来加密和保护您的数据。

此功能所使用的算法为`AES_256_CTR`，预计根据工作负载性能损失为5-15%：

<Image img={cmek_performance} size="lg" alt="CMEK 性能损失" />
