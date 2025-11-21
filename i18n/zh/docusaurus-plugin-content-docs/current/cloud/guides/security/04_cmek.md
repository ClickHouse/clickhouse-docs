---
sidebar_label: '数据加密'
slug: /cloud/security/cmek
title: '数据加密'
description: '深入了解 ClickHouse Cloud 中的数据加密'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', '加密', 'CMEK', 'KMS key poller']
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import cmek_performance from '@site/static/images/_snippets/cmek-performance.png';


# 数据加密



## 存储级加密 {#storage-encryption}

ClickHouse Cloud 默认配置了静态数据加密,使用云服务商管理的 AES 256 密钥。更多信息请查阅:

- [AWS S3 服务器端加密](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingServerSideEncryption.html)
- [GCP 默认静态数据加密](https://cloud.google.com/docs/security/encryption/default-encryption)
- [Azure 静态数据存储加密](https://learn.microsoft.com/en-us/azure/storage/common/storage-service-encryption)


## 数据库级加密 {#database-encryption}

<EnterprisePlanFeatureBadge feature='Enhanced Encryption' />

静态数据默认使用云提供商管理的 AES 256 密钥进行加密。客户可以启用透明数据加密 (TDE) 为服务数据提供额外的保护层,或提供自己的密钥来为其服务实现客户管理的加密密钥 (CMEK)。

增强加密目前在 AWS 和 GCP 服务中可用。Azure 即将推出。

### 透明数据加密 (TDE) {#transparent-data-encryption-tde}

TDE 必须在创建服务时启用。现有服务在创建后无法加密。一旦启用 TDE,就无法禁用。服务中的所有数据将保持加密状态。如果您想在启用 TDE 后禁用它,必须创建新服务并将数据迁移到新服务。

1. 选择 `创建新服务`
2. 为服务命名
3. 从下拉菜单中选择 AWS 或 GCP 作为云提供商以及所需的区域
4. 点击企业功能下拉菜单并切换启用透明数据加密 (TDE)
5. 点击创建服务

### 客户管理的加密密钥 (CMEK) {#customer-managed-encryption-keys-cmek}

:::warning
删除用于加密 ClickHouse Cloud 服务的 KMS 密钥将导致您的 ClickHouse 服务停止,其数据将无法恢复,现有备份也将无法使用。为防止轮换密钥时意外丢失数据,您可能希望在删除之前保留旧 KMS 密钥一段时间。
:::

一旦服务使用 TDE 加密,客户可以更新密钥以启用 CMEK。更新 TDE 设置后,服务将自动重启。在此过程中,旧 KMS 密钥解密数据加密密钥 (DEK),新 KMS 密钥重新加密 DEK。这确保服务重启后将使用新 KMS 密钥进行后续加密操作。此过程可能需要几分钟时间。

<details>
    <summary>使用 AWS KMS 启用 CMEK</summary>
    
1. 在 ClickHouse Cloud 中,选择已加密的服务
2. 点击左侧的设置
3. 在屏幕底部,展开网络安全信息
4. 复制加密角色 ID (AWS) 或加密服务账户 (GCP) - 您将在后续步骤中需要此信息
5. [为 AWS 创建 KMS 密钥](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
6. 点击密钥
7. 按如下方式更新 AWS 密钥策略:
    
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
11. 复制密钥 ARN
12. 返回 ClickHouse Cloud 并将密钥 ARN 粘贴到服务设置的透明数据加密部分
13. 保存更改
    
</details>

<details>
    <summary>使用 GCP KMS 启用 CMEK</summary>

1. 在 ClickHouse Cloud 中,选择已加密的服务
2. 点击左侧的设置
3. 在屏幕底部,展开网络安全信息
4. 复制加密服务账户 (GCP) - 您将在后续步骤中需要此信息
5. [为 GCP 创建 KMS 密钥](https://cloud.google.com/kms/docs/create-key)
6. 点击密钥
7. 向上述步骤 4 中复制的 GCP 加密服务账户授予以下权限:
   - Cloud KMS CryptoKey Encrypter/Decrypter
   - Cloud KMS Viewer
8. 保存密钥权限
9. 复制密钥资源路径
10. 返回 ClickHouse Cloud 并将密钥资源路径粘贴到服务设置的透明数据加密部分
11. 保存更改

</details>

#### 密钥轮换 {#key-rotation}

设置 CMEK 后,按照上述创建新 KMS 密钥和授予权限的步骤轮换密钥。返回服务设置以粘贴新的 ARN (AWS) 或密钥资源路径 (GCP) 并保存设置。服务将重启以应用新密钥。

#### KMS 密钥轮询器 {#kms-key-poller}


使用 CMEK 时,系统每 10 分钟检查一次所提供 KMS 密钥的有效性。如果 KMS 密钥访问失效,ClickHouse 服务将停止运行。要恢复服务,请按照本指南中的步骤恢复 KMS 密钥访问权限,然后重启服务。

### 备份和恢复 {#backup-and-restore}

备份使用与关联服务相同的密钥进行加密。恢复加密备份时,将创建一个使用与原始实例相同 KMS 密钥的加密实例。如需要,可以在恢复后轮换 KMS 密钥;详情请参阅[密钥轮换](#key-rotation)。


## 性能 {#performance}

数据库加密利用 ClickHouse 内置的[数据加密虚拟文件系统功能](/operations/storing-data#encrypted-virtual-file-system)来加密和保护您的数据。该功能使用的加密算法为 `AES_256_CTR`,根据工作负载的不同,预计会带来 5-15% 的性能开销:

<Image img={cmek_performance} size='lg' alt='CMEK 性能开销' />
