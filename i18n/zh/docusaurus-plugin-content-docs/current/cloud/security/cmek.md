---
sidebar_label: '增强加密'
slug: '/cloud/security/cmek'
title: '客户管理加密密钥 (CMEK)'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import cmek_performance from '@site/static/images/_snippets/cmek-performance.png';


# ClickHouse 增强加密

<EnterprisePlanFeatureBadge feature="增强加密" support="true"/>

静态数据默认使用云服务提供商管理的 AES 256 密钥进行加密。客户可以启用透明数据加密 (TDE) 来为服务数据提供额外的保护层。此外，客户可以提供自己的密钥以实施客户管理加密密钥 (CMEK)。

目前，增强加密在 AWS 和 GCP 服务中可用。Azure 将很快推出。

## 透明数据加密 (TDE) {#transparent-data-encryption-tde}

TDE 必须在服务创建时启用。现有服务创建后无法加密。

1. 选择 `Create new service`
2. 输入服务名称
3. 从下拉菜单中选择 AWS 作为云服务提供商和所需的区域
4. 点击企业功能的下拉菜单并启用透明数据加密 (TDE)
5. 点击创建服务

## 客户管理加密密钥 (CMEK) {#customer-managed-encryption-keys-cmek}

:::warning
删除用于加密 ClickHouse Cloud 服务的 KMS 密钥将导致您的 ClickHouse 服务停止，并且其数据将无法恢复，现有备份也会消失。
:::

一旦服务使用 TDE 加密，客户可以更新密钥以启用 CMEK。更新透明数据加密设置后，服务将自动重新启动。在此过程中，旧的 KMS 密钥解密数据加密密钥 (DEK)，新的 KMS 密钥重新加密 DEK。这确保服务在重新启动后将使用新的 KMS 密钥进行加密操作。此过程可能需要几分钟。

### 使用 AWS KMS 的 CMEK {#cmek-with-aws-kms}

1. 在 ClickHouse Cloud 中，选择加密服务
2. 点击左侧的设置
3. 在屏幕底部，展开网络安全信息
4. 复制加密角色 ID (AWS) 或加密服务帐户 (GCP) - 这将在后续步骤中需要
5. [为 AWS 创建 KMS 密钥](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
6. 点击该密钥
7. 按如下方式更新 AWS 密钥策略：

    ```json
    {
        "Sid": "Allow ClickHouse Access",
            "Effect": "Allow",
            "Principal": {
                "AWS": "{ Encryption role ID }"
            },
            "Action": [
                "kms:Encrypt",
                "kms:Decrypt",
                "kms:ReEncrypt",
                "kms:DescribeKey"
            ],
            "Resource": "*"
    }
    ```

10. 保存密钥策略
11. 复制密钥 ARN
12. 返回到 ClickHouse Cloud，并将密钥 ARN 粘贴到服务设置的透明数据加密部分
13. 保存更改

### 使用 GCP KMS 的 CMEK {#cmek-with-gcp-kms}

1. 在 ClickHouse Cloud 中，选择加密服务
2. 点击左侧的设置
3. 在屏幕底部，展开网络安全信息
4. 复制加密服务帐户 (GCP) - 这将在后续步骤中需要
5. [为 GCP 创建 KMS 密钥](https://cloud.google.com/kms/docs/create-key)
6. 点击该密钥
7. 将以下权限授予在第 4 步中复制的 GCP 加密服务帐户。
   - Cloud KMS CryptoKey Encrypter/Decrypter
   - Cloud KMS Viewer
10. 保存密钥权限
11. 复制密钥资源路径
12. 返回到 ClickHouse Cloud，并将密钥资源路径粘贴到服务设置的透明数据加密部分
13. 保存更改

## 备份和恢复 {#backup-and-restore}

备份使用与相关服务相同的密钥进行加密。当您恢复加密备份时，它会创建一个使用与原始实例相同的 KMS 密钥的加密实例。如有需要，您可以轮换 KMS 密钥；有关更多详细信息，请参见 [密钥轮换](#key-rotation)。

## KMS 密钥轮询器 {#kms-key-poller}

在使用 CMEK 时，每 10 分钟检查一次所提供的 KMS 密钥的有效性。如果访问 KMS 密钥无效，则 ClickHouse 服务将停止。要恢复服务，请按照本指南中的步骤恢复对 KMS 密钥的访问，然后重启服务。

由于此功能的性质，删除 KMS 密钥后无法恢复 ClickHouse Cloud 服务。为了防止这种情况，大多数提供商不会立即删除密钥，而是将其计划为删除，请查看您的提供商文档。

## 密钥轮换 {#key-rotation}

由于此功能的性质，如果 KMS 密钥被删除，无法恢复 ClickHouse Cloud 服务。为了防止意外丢失，大多数提供商安排密钥删除，而不是立即删除。有关更多详细信息，请参见您的提供商文档。

## 性能 {#performance}

如本页所述，我们使用 ClickHouse 的内置 [用于数据加密的虚拟文件系统功能](/operations/storing-data#encrypted-virtual-file-system) 来加密和保护您的数据。

此功能所使用的算法为 `AES_256_CTR`，预计在工作负载的不同情况下会有 5-15% 的性能损失：

<img src={cmek_performance} class="image" alt="CMEK 性能损失" />
