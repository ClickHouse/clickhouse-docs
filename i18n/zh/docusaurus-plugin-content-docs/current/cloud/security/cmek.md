import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import cmek_performance from '@site/static/images/_snippets/cmek-performance.png';

# ClickHouse 增强加密

<EnterprisePlanFeatureBadge feature="Enhanced Encryption"/>

静态数据默认使用云服务提供商管理的 AES 256 密钥进行加密。客户可以启用透明数据加密 (TDE) 以为服务数据提供额外的保护层，或提供自己的密钥以实现客户管理的加密密钥 (CMEK)。

增强加密目前在 AWS 和 GCP 服务中可用。Azure 即将推出。

## 透明数据加密 (TDE) {#transparent-data-encryption-tde}

TDE 必须在服务创建时启用。现有服务在创建后无法加密。

1. 选择 `Create new service`
2. 命名服务
3. 从下拉菜单中选择 AWS 或 GCP 作为云服务提供商以及所需的区域
4. 点击企业功能的下拉菜单并切换启用透明数据加密 (TDE)
5. 点击创建服务

## 客户管理的加密密钥 (CMEK) {#customer-managed-encryption-keys-cmek}

:::warning
删除用于加密 ClickHouse Cloud 服务的 KMS 密钥将导致您的 ClickHouse 服务停止，并且其数据将无法恢复，包括现有的备份。为了防止在轮换密钥时意外丢失数据，您可能希望在删除之前保留旧的 KMS 密钥一段时间。 
:::

一旦服务通过 TDE 加密，客户可以更新密钥以启用 CMEK。更新 TDE 设置后，服务将自动重启。在此过程中，旧 KMS 密钥解密数据加密密钥 (DEK)，新 KMS 密钥则重新加密 DEK。这确保服务在重启时将使用新 KMS 密钥进行加密操作。此过程可能需要几分钟。

<details>
    <summary>使用 AWS KMS 启用 CMEK</summary>
    
1. 在 ClickHouse Cloud 中，选择加密服务
2. 点击左侧的设置
3. 在屏幕底部展开网络安全信息
4. 复制加密角色 ID (AWS) 或加密服务帐户 (GCP) - 您将在后续步骤中需要此内容
5. [为 AWS 创建 KMS 密钥](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
6. 点击密钥
7. 根据以下内容更新 AWS 密钥策略：
    
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
12. 返回 ClickHouse Cloud，并将密钥 ARN 粘贴到服务设置的透明数据加密部分
13. 保存更改
    
</details>

<details>
    <summary>使用 GCP KMS 启用 CMEK</summary>

1. 在 ClickHouse Cloud 中，选择加密服务
2. 点击左侧的设置
3. 在屏幕底部展开网络安全信息
4. 复制加密服务帐户 (GCP) - 您将在后续步骤中需要此内容
5. [为 GCP 创建 KMS 密钥](https://cloud.google.com/kms/docs/create-key)
6. 点击密钥
7. 向上述步骤 4 中复制的 GCP 加密服务帐户授予以下权限：
   - Cloud KMS CryptoKey Encrypter/Decrypter
   - Cloud KMS Viewer
10. 保存密钥权限
11. 复制密钥资源路径
12. 返回 ClickHouse Cloud，并将密钥资源路径粘贴到服务设置的透明数据加密部分
13. 保存更改
    
</details>

## 密钥轮换 {#key-rotation}

一旦您设置了 CMEK，请通过遵循上述创建新 KMS 密钥和授予权限的步骤来轮换密钥。返回服务设置以粘贴新的 ARN (AWS) 或密钥资源路径 (GCP) 并保存设置。服务将重启以应用新密钥。

## 备份和恢复 {#backup-and-restore}

备份使用与相关服务相同的密钥进行加密。当您恢复加密备份时，它会创建一个加密实例，并使用与原始实例相同的 KMS 密钥。如果需要，您可以在恢复后轮换 KMS 密钥；有关更多详细信息，请参见 [密钥轮换](#key-rotation)。

## KMS 密钥轮询器 {#kms-key-poller}

使用 CMEK 时，每 10 分钟检查一次提供的 KMS 密钥的有效性。如果访问 KMS 密钥无效，ClickHouse 服务将停止。要恢复服务，请按照本指南中的步骤恢复对 KMS 密钥的访问，然后重启服务。

## 性能 {#performance}

如本页面所述，我们使用 ClickHouse 内置的 [数据加密虚拟文件系统功能](/operations/storing-data#encrypted-virtual-file-system) 来加密和保护您的数据。

此功能使用的算法是 `AES_256_CTR`，预计在工作负载的不同情况下有 5-15% 的性能损失：

<Image img={cmek_performance} size="lg" alt="CMEK 性能损失" />
