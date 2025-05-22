---
'sidebar_label': '增强加密'
'slug': '/cloud/security/cmek'
'title': '客户管理的加密密钥 (CMEK)'
'description': '了解更多关于客户管理的加密密钥的内容'
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import cmek_performance from '@site/static/images/_snippets/cmek-performance.png';


# ClickHouse 增强加密

<EnterprisePlanFeatureBadge feature="Enhanced Encryption"/>

静态数据默认使用云服务提供商管理的 AES 256 密钥进行加密。客户可以启用透明数据加密 (TDE) 来为服务数据提供额外的保护层，或提供自己的密钥以实现客户管理的加密密钥 (CMEK)。

当前增强加密在 AWS 和 GCP 服务中可用。Azure 将很快推出。

## 透明数据加密 (TDE) {#transparent-data-encryption-tde}

在创建服务时必须启用 TDE。现有服务在创建后无法进行加密。

1. 选择 `创建新服务`
2. 命名服务
3. 从下拉菜单中选择 AWS 或 GCP 作为云提供商及所需区域
4. 点击企业功能下拉菜单，切换启用透明数据加密 (TDE)
5. 点击创建服务

## 客户管理的加密密钥 (CMEK) {#customer-managed-encryption-keys-cmek}

:::warning
删除用于加密 ClickHouse Cloud 服务的 KMS 密钥会导致您的 ClickHouse 服务停止，数据将无法恢复，现有备份也将丢失。为了防止轮换密钥时意外数据丢失，您可能希望在删除之前保留旧的 KMS 密钥一段时间。
:::

一旦服务使用 TDE 加密，客户可以更新密钥以启用 CMEK。更新 TDE 设置后，服务将自动重启。在此过程中，旧的 KMS 密钥将解密数据加密密钥 (DEK)，新的 KMS 密钥将重新加密 DEK。这确保了服务在重启后将使用新的 KMS 密钥进行加密操作。此过程可能需要几分钟。

<details>
    <summary>使用 AWS KMS 启用 CMEK</summary>
    
1. 在 ClickHouse Cloud 中，选择加密的服务
2. 点击左侧的设置
3. 在屏幕底部，展开网络安全信息
4. 复制加密角色 ID (AWS) 或加密服务账号 (GCP) - 您将在后续步骤中需要该信息
5. [为 AWS 创建一个 KMS 密钥](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
6. 点击密钥
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
        "kms:ReEncrypt*",
        "kms:DescribeKey"
    ],
    "Resource": "*"
}
```
    
10. 保存密钥策略
11. 复制密钥 ARN
12. 返回 ClickHouse Cloud，将密钥 ARN 粘贴到服务设置的透明数据加密部分
13. 保存更改
    
</details>

<details>
    <summary>使用 GCP KMS 启用 CMEK</summary>

1. 在 ClickHouse Cloud 中，选择加密的服务
2. 点击左侧的设置
3. 在屏幕底部，展开网络安全信息
4. 复制加密服务账号 (GCP) - 您将在后续步骤中需要该信息
5. [为 GCP 创建一个 KMS 密钥](https://cloud.google.com/kms/docs/create-key)
6. 点击密钥
7. 授予上述第 4 步中复制的 GCP 加密服务账号以下权限：
   - Cloud KMS CryptoKey Encrypter/Decrypter
   - Cloud KMS Viewer
10. 保存密钥权限
11. 复制密钥资源路径
12. 返回 ClickHouse Cloud，将密钥资源路径粘贴到服务设置的透明数据加密部分
13. 保存更改
    
</details>

## 密钥轮换 {#key-rotation}

一旦您设置了 CMEK，请按照上述创建新 KMS 密钥和授予权限的步骤轮换密钥。返回服务设置，将新的 ARN (AWS) 或密钥资源路径 (GCP) 粘贴并保存设置。服务将重启以应用新密钥。

## 备份和恢复 {#backup-and-restore}

备份使用与相关服务相同的密钥进行加密。当您恢复加密备份时，会创建一个加密实例，该实例使用与原始实例相同的 KMS 密钥。如果需要，您可以在恢复后轮换 KMS 密钥；有关详细信息，请参见 [密钥轮换](#key-rotation)。

## KMS 密钥轮询器 {#kms-key-poller}

使用 CMEK 时，将每 10 分钟检查一次所提供的 KMS 密钥的有效性。如果 KMS 密钥的访问权限无效，ClickHouse 服务将停止。要恢复服务，请按照本指南中的步骤恢复对 KMS 密钥的访问，然后重启服务。

## 性能 {#performance}

如本页所述，我们使用 ClickHouse 内置的 [数据加密虚拟文件系统功能](/operations/storing-data#encrypted-virtual-file-system) 来加密和保护您的数据。

此功能使用的算法是 `AES_256_CTR`，预计根据工作负载性能损失为 5-15%：

<Image img={cmek_performance} size="lg" alt="CMEK 性能损失" />
