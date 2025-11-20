---
sidebar_label: 'データ暗号化'
slug: /cloud/security/cmek
title: 'データ暗号化'
description: 'ClickHouse Cloud のデータ暗号化について詳しく学ぶ'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'encryption', 'CMEK', 'KMS key poller']
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import cmek_performance from '@site/static/images/_snippets/cmek-performance.png';


# データの暗号化



## ストレージレベルの暗号化 {#storage-encryption}

ClickHouse Cloudは、デフォルトでクラウドプロバイダー管理のAES 256キーを使用した保存時の暗号化が設定されています。詳細については、以下を参照してください:

- [S3のAWSサーバーサイド暗号化](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingServerSideEncryption.html)
- [GCPのデフォルト保存時暗号化](https://cloud.google.com/docs/security/encryption/default-encryption)
- [保存データ向けAzureストレージ暗号化](https://learn.microsoft.com/en-us/azure/storage/common/storage-service-encryption)


## データベースレベルの暗号化 {#database-encryption}

<EnterprisePlanFeatureBadge feature='Enhanced Encryption' />

保存データは、デフォルトでクラウドプロバイダー管理のAES 256キーを使用して暗号化されます。お客様は、Transparent Data Encryption (TDE) を有効にしてサービスデータに追加の保護層を提供するか、独自のキーを提供してサービスにCustomer Managed Encryption Keys (CMEK) を実装することができます。

拡張暗号化は現在、AWSおよびGCPサービスで利用可能です。Azureは近日対応予定です。

### Transparent Data Encryption (TDE) {#transparent-data-encryption-tde}

TDEはサービス作成時に有効化する必要があります。既存のサービスは作成後に暗号化することはできません。TDEを有効化すると、無効化することはできません。サービス内のすべてのデータは暗号化されたままになります。TDEを有効化した後に無効化したい場合は、新しいサービスを作成してデータを移行する必要があります。

1. `Create new service` を選択します
2. サービスに名前を付けます
3. クラウドプロバイダーとしてAWSまたはGCPを選択し、ドロップダウンから希望するリージョンを選択します
4. Enterprise featuresのドロップダウンをクリックし、Enable Transparent Data Encryption (TDE) を切り替えます
5. Create serviceをクリックします

### Customer Managed Encryption Keys (CMEK) {#customer-managed-encryption-keys-cmek}

:::warning
ClickHouse Cloudサービスの暗号化に使用されているKMSキーを削除すると、ClickHouseサービスが停止し、既存のバックアップとともにデータが復元不可能になります。キーのローテーション時に誤ってデータを失うことを防ぐため、削除前に一定期間古いKMSキーを保持することをお勧めします。
:::

サービスがTDEで暗号化されると、お客様はキーを更新してCMEKを有効化できます。TDE設定を更新すると、サービスは自動的に再起動します。このプロセス中、古いKMSキーがデータ暗号化キー (DEK) を復号化し、新しいKMSキーがDEKを再暗号化します。これにより、再起動後のサービスは今後の暗号化操作に新しいKMSキーを使用することが保証されます。このプロセスには数分かかる場合があります。

<details>
    <summary>AWS KMSでCMEKを有効化する</summary>
    
1. ClickHouse Cloudで、暗号化されたサービスを選択します
2. 左側のSettingsをクリックします
3. 画面下部のNetwork security informationを展開します
4. Encryption role ID (AWS) またはEncryption Service Account (GCP) をコピーします - これは後の手順で必要になります
5. [AWSのKMSキーを作成します](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
6. キーをクリックします
7. AWSキーポリシーを次のように更新します:
    
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
    
10. Key policyを保存します
11. Key ARNをコピーします
12. ClickHouse Cloudに戻り、Service SettingsのTransparent Data EncryptionセクションにKey ARNを貼り付けます
13. 変更を保存します
    
</details>

<details>
    <summary>GCP KMSでCMEKを有効化する</summary>

1. ClickHouse Cloudで、暗号化されたサービスを選択します
2. 左側のSettingsをクリックします
3. 画面下部のNetwork security informationを展開します
4. Encryption Service Account (GCP) をコピーします - これは後の手順で必要になります
5. [GCPのKMSキーを作成します](https://cloud.google.com/kms/docs/create-key)
6. キーをクリックします
7. 上記の手順4でコピーしたGCP Encryption Service Accountに次の権限を付与します。
   - Cloud KMS CryptoKey Encrypter/Decrypter
   - Cloud KMS Viewer
8. Key permissionを保存します
9. Key Resource Pathをコピーします
10. ClickHouse Cloudに戻り、Service SettingsのTransparent Data EncryptionセクションにKey Resource Pathを貼り付けます
11. 変更を保存します

</details>

#### キーのローテーション {#key-rotation}

CMEKを設定したら、上記の手順に従って新しいKMSキーを作成し権限を付与することでキーをローテーションします。サービス設定に戻り、新しいARN (AWS) またはKey Resource Path (GCP) を貼り付けて設定を保存します。新しいキーを適用するためにサービスが再起動します。

#### KMSキーポーラー {#kms-key-poller}


CMEKを使用している場合、提供されたKMSキーの有効性は10分ごとにチェックされます。KMSキーへのアクセスが無効になると、ClickHouseサービスは停止します。サービスを再開するには、本ガイドの手順に従ってKMSキーへのアクセスを復元した後、サービスを再起動してください。

### バックアップと復元 {#backup-and-restore}

バックアップは、関連付けられたサービスと同じキーを使用して暗号化されます。暗号化されたバックアップを復元すると、元のインスタンスと同じKMSキーを使用する暗号化されたインスタンスが作成されます。必要に応じて、復元後にKMSキーをローテーションすることができます。詳細については、[キーローテーション](#key-rotation)を参照してください。


## パフォーマンス {#performance}

データベース暗号化は、ClickHouseに組み込まれた[データ暗号化用仮想ファイルシステム機能](/operations/storing-data#encrypted-virtual-file-system)を利用してデータを暗号化し保護します。この機能で使用されるアルゴリズムは`AES_256_CTR`で、ワークロードに応じて5〜15%のパフォーマンス低下が見込まれます:

<Image img={cmek_performance} size='lg' alt='CMEKパフォーマンス低下' />
