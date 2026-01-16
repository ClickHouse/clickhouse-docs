---
sidebar_label: '数据加密'
slug: /cloud/security/cmek
title: '数据加密'
description: '了解 ClickHouse Cloud 中的数据加密机制'
doc_type: '指南'
keywords: ['ClickHouse Cloud', '加密', 'CMEK', 'KMS 密钥轮询程序']
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import cmek_performance from '@site/static/images/_snippets/cmek-performance.png';

# 数据加密 \\{#data-encryption\\}

## 存储层加密 \\{#storage-encryption\\}

ClickHouse Cloud 默认启用静态数据加密，使用由云服务提供商管理的 AES-256 密钥。更多信息请参阅：
- [用于 S3 的 AWS 服务器端加密](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingServerSideEncryption.html)
- [GCP 默认静态数据加密](https://cloud.google.com/docs/security/encryption/default-encryption)
- [Azure 存储中静态数据的加密](https://learn.microsoft.com/en-us/azure/storage/common/storage-service-encryption)

## 数据库级加密 \\{#database-encryption\\}

<EnterprisePlanFeatureBadge feature="Enhanced Encryption"/>

静态存储的数据（data at rest）默认使用云提供商管理的 AES 256 密钥进行加密。客户可以启用透明数据加密（Transparent Data Encryption，TDE），为服务数据提供额外的保护层，或者提供自己的密钥，为其服务实现客户管理加密密钥（Customer Managed Encryption Keys，CMEK）。

增强加密目前适用于 AWS 和 GCP 服务。Azure 即将支持。

### 透明数据加密（TDE） \\{#transparent-data-encryption-tde\\}

TDE 必须在创建服务时启用。现有服务在创建后无法再启用加密。一旦启用 TDE，就无法禁用。服务中的所有数据将保持加密状态。如果希望在启用 TDE 后将其禁用，必须创建一个新服务并将数据迁移过去。

1. 选择 `Create new service`
2. 为服务命名
3. 选择 AWS 或 GCP 作为云提供商，并从下拉列表中选择所需区域
4. 点击 Enterprise features 的下拉列表，切换启用 Transparent Data Encryption (TDE)
5. 点击 `Create service`

### 客户管理加密密钥（CMEK） \\{#customer-managed-encryption-keys-cmek\\}

:::warning
删除用于为 ClickHouse Cloud 服务加密的 KMS 密钥将导致 ClickHouse 服务被停止，其数据以及现有备份将无法恢复。为防止在轮换密钥时意外丢失数据，建议在删除前的一段时间内保留旧的 KMS 密钥。 
:::

服务一旦使用 TDE 加密，客户即可更新密钥以启用 CMEK。更新 TDE 设置后，服务将自动重启。在此过程中，旧的 KMS 密钥会解密数据加密密钥（DEK），新的 KMS 密钥会重新加密 DEK。这样可以确保服务在重启后，在后续的加密操作中使用新的 KMS 密钥。此过程可能需要几分钟时间。

<details>
    <summary>使用 AWS KMS 启用 CMEK</summary>
    
1. 在 ClickHouse Cloud 中选择已加密的服务
2. 点击左侧的 Settings
3. 在页面底部展开 Network security 信息
4. 复制 Encryption role ID（AWS）或 Encryption Service Account（GCP）——后续步骤中会用到
5. [为 AWS 创建 KMS 密钥](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
6. 点击该密钥
7. 按如下方式更新 AWS 密钥策略：
    
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
    
10. 保存 Key policy
11. 复制 Key ARN
12. 返回 ClickHouse Cloud，将 Key ARN 粘贴到该服务 Service Settings 中的 Transparent Data Encryption 区域
13. 保存更改
    
</details>

<details>
    <summary>使用 GCP KMS 启用 CMEK</summary>

1. 在 ClickHouse Cloud 中选择已加密的服务
2. 点击左侧的 Settings
3. 在页面底部展开 Network security 信息
4. 复制 Encryption Service Account（GCP）——后续步骤中会用到
5. [为 GCP 创建 KMS 密钥](https://cloud.google.com/kms/docs/create-key)
6. 点击该密钥
7. 为在上面第 4 步复制的 GCP Encryption Service Account 授予以下权限：
   - Cloud KMS CryptoKey Encrypter/Decrypter
   - Cloud KMS Viewer
10. 保存 Key 权限设置
11. 复制 Key Resource Path
12. 返回 ClickHouse Cloud，将 Key Resource Path 粘贴到该服务 Service Settings 中的 Transparent Data Encryption 区域
13. 保存更改
    
</details>

#### 密钥轮换 \\{#key-rotation\\}

设置好 CMEK 之后，通过执行上述创建新 KMS 密钥并授予权限的流程来轮换密钥。然后返回服务设置页面，粘贴新的 ARN（AWS）或 Key Resource Path（GCP），并保存设置。服务将重启以应用新密钥。

#### KMS 密钥轮询器 \\{#kms-key-poller\\}

在使用 CMEK 时，系统每 10 分钟检查一次所提供的 KMS 密钥是否仍然有效。如果对该 KMS 密钥的访问权限失效，ClickHouse 服务将会停止运行。要恢复服务，请先按照本指南中的步骤恢复对 KMS 密钥的访问，然后重新启动服务。

### 备份和恢复 \\{#backup-and-restore\\}

备份会使用与关联服务相同的密钥进行加密。当你恢复一个已加密的备份时，会创建一个新的加密实例，并使用与原始实例相同的 KMS 密钥。如果需要，你可以在恢复后轮换 KMS 密钥；更多详情请参见 [密钥轮换](#key-rotation)。

## 性能 \\{#performance\\}

数据库加密功能使用 ClickHouse 内置的[用于数据加密的虚拟文件系统功能](/operations/storing-data#encrypted-virtual-file-system)来对数据进行加密和保护。该功能使用的算法为 `AES_256_CTR`，预计会根据具体工作负载带来 5–15% 的性能损耗：

<Image img={cmek_performance} size="lg" alt="CMEK 性能损耗" />
