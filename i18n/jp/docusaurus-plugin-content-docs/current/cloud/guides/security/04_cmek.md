---
sidebar_label: 'データ暗号化'
slug: /cloud/security/cmek
title: 'データ暗号化'
description: 'ClickHouse Cloud におけるデータ暗号化について説明します'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', '暗号化', 'CMEK', 'KMS key poller']
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import cmek_performance from '@site/static/images/_snippets/cmek-performance.png';

# データの暗号化 {#data-encryption}

## ストレージレベルの暗号化 {#storage-encryption}

ClickHouse Cloud では、クラウドプロバイダー管理の AES 256 キーを利用した保存データの暗号化 (encryption at rest) がデフォルトで構成されています。詳細については、次を参照してください。
- [S3 向け AWS サーバーサイド暗号化](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingServerSideEncryption.html)
- [GCP におけるデフォルトの保存データ暗号化](https://cloud.google.com/docs/security/encryption/default-encryption)
- [保存データ向け Azure ストレージ暗号化](https://learn.microsoft.com/en-us/azure/storage/common/storage-service-encryption)

## データベースレベルの暗号化 {#database-encryption}

<EnterprisePlanFeatureBadge feature="Enhanced Encryption"/>

保存データはデフォルトで、クラウドプロバイダーが管理する AES 256 キーを用いて暗号化されます。利用者は Transparent Data Encryption (TDE) を有効にしてサービスデータへの追加の保護層を提供することも、自身のキーを提供してサービスに対して Customer Managed Encryption Keys (CMEK) を実装することもできます。

Enhanced Encryption は現在、AWS および GCP のサービスで利用可能です。Azure は近日対応予定です。

### Transparent Data Encryption (TDE) {#transparent-data-encryption-tde}

TDE はサービス作成時に有効にする必要があります。既存のサービスを作成後に暗号化することはできません。TDE を一度有効にすると、無効化することはできません。サービス内のすべてのデータは暗号化されたままになります。TDE を有効にした後で無効化したい場合は、新しいサービスを作成し、そこへデータを移行する必要があります。

1. `Create new service` を選択します
2. サービスに名前を付けます
3. クラウドプロバイダーとして AWS または GCP を選択し、ドロップダウンから希望するリージョンを選択します
4. Enterprise 機能のドロップダウンをクリックし、Enable Transparent Data Encryption (TDE) をオンにします
5. `Create service` をクリックします

### Customer Managed Encryption Keys (CMEK) {#customer-managed-encryption-keys-cmek}

:::warning
ClickHouse Cloud サービスの暗号化に使用されている KMS キーを削除すると、その ClickHouse サービスは停止され、既存のバックアップを含め、そのデータは復元不能になります。キーをローテーションする際の誤削除によるデータ損失を防ぐため、削除前に一定期間、古い KMS キーを保持しておくことを推奨します。 
:::

サービスが TDE で暗号化されると、利用者はキーを更新して CMEK を有効にできます。TDE 設定を更新すると、サービスは自動的に再起動します。この処理の間、旧 KMS キーがデータ暗号化キー (DEK) を復号し、新しい KMS キーが DEK を再暗号化します。これにより、再起動後のサービスは今後の暗号化処理に新しい KMS キーを使用することが保証されます。この処理には数分かかる場合があります。

<details>
    <summary>AWS KMS で CMEK を有効化する</summary>
    
1. ClickHouse Cloud で暗号化されたサービスを選択します
2. 画面左の Settings をクリックします
3. 画面下部の Network security information を展開します
4. Encryption role ID (AWS) または Encryption Service Account (GCP) をコピーします — これは後の手順で必要になります
5. [AWS 用の KMS キーを作成します](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
6. キーをクリックします
7. AWS キーポリシーを次のように更新します:
    
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
    
10. キーポリシーを保存します
11. Key ARN をコピーします
12. ClickHouse Cloud に戻り、Service Settings の Transparent Data Encryption セクションに Key ARN を貼り付けます
13. 変更を保存します
    
</details>

<details>
    <summary>GCP KMS で CMEK を有効化する</summary>

1. ClickHouse Cloud で暗号化されたサービスを選択します
2. 画面左の Settings をクリックします
3. 画面下部の Network security information を展開します
4. Encryption Service Account (GCP) をコピーします — これは後の手順で必要になります
5. [GCP 用の KMS キーを作成します](https://cloud.google.com/kms/docs/create-key)
6. キーをクリックします
7. 上記手順 4 でコピーした GCP Encryption Service Account に次の権限を付与します。
   - Cloud KMS CryptoKey Encrypter/Decrypter
   - Cloud KMS Viewer
10. キーの権限を保存します
11. Key Resource Path をコピーします
12. ClickHouse Cloud に戻り、Service Settings の Transparent Data Encryption セクションに Key Resource Path を貼り付けます
13. 変更を保存します
    
</details>

#### キーのローテーション {#key-rotation}

CMEK をセットアップしたら、新しい KMS キーを作成して権限を付与するために、上記の手順に従ってキーをローテーションします。サービス設定に戻り、新しい ARN (AWS) または Key Resource Path (GCP) を貼り付けて設定を保存します。サービスは新しいキーを適用するために再起動されます。

#### KMS キーポーラー {#kms-key-poller}

CMEK を使用している場合、指定された KMS キーが有効かどうかは 10 分ごとに検証されます。KMS キーへのアクセスができなくなった場合、ClickHouse サービスは停止します。サービスを再開するには、このガイドの手順に従って KMS キーへのアクセスを復旧し、その後サービスを再起動してください。

### バックアップと復元 {#backup-and-restore}

バックアップは、関連付けられたサービスと同じキーを使用して暗号化されます。暗号化されたバックアップを復元すると、元のインスタンスと同じ KMS キーを使用する暗号化されたインスタンスが作成されます。必要に応じて、復元後に KMS キーをローテーションすることもできます。詳細は [Key Rotation](#key-rotation) を参照してください。

## パフォーマンス {#performance}

データベース暗号化は、ClickHouse に組み込まれている [データ暗号化用仮想ファイルシステム機能](/operations/storing-data#encrypted-virtual-file-system) を利用して、データを暗号化し、保護します。この機能で使用されるアルゴリズムは `AES_256_CTR` であり、ワークロードに応じて 5～15% 程度のパフォーマンス低下（オーバーヘッド）が発生することが想定されています。

<Image img={cmek_performance} size="lg" alt="CMEK のパフォーマンス低下" />
