---
'sidebar_label': 'Enhanced Encryption'
'slug': '/cloud/security/cmek'
'title': 'Customer Managed Encryption Keys (CMEK)'
'description': 'Learn more about customer managed encryption keys'
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import cmek_performance from '@site/static/images/_snippets/cmek-performance.png';


# ClickHouse 強化暗号化

<EnterprisePlanFeatureBadge feature="強化暗号化"/>

静止データは、クラウドプロバイダー管理の AES 256 キーを使用してデフォルトで暗号化されています。顧客は、サービスデータに対して追加の保護層を提供するために透過的データ暗号化 (TDE) を有効にするか、独自のキーを提供して顧客管理暗号化キー (CMEK) を実装することができます。

強化された暗号化は現在、AWS および GCP サービスで利用可能です。Azure は近日中に対応予定です。

## 透過的データ暗号化 (TDE) {#transparent-data-encryption-tde}

TDEは、サービス作成時に有効にしなければなりません。既存のサービスは作成後に暗号化することはできません。

1. `新しいサービスを作成` を選択します
2. サービスに名前を付けます
3. クラウドプロバイダーとして AWS または GCP を選択し、ドロップダウンから希望のリージョンを選択します
4. エンタープライズ機能のドロップダウンをクリックし、透過的データ暗号化 (TDE) を有効にします
5. サービスを作成をクリックします

## 顧客管理暗号化キー (CMEK) {#customer-managed-encryption-keys-cmek}

:::warning
ClickHouse Cloud サービスを暗号化するために使用される KMS キーを削除すると、ClickHouse サービスが停止し、そのデータは取得できなくなり、既存のバックアップも失われます。キーをローテーションする際に誤ってデータを失わないように、削除する前に古い KMS キーを一定期間維持することをお勧めします。
:::

サービスが TDE で暗号化されると、顧客はキーを更新して CMEK を有効にできます。TDE 設定を更新した後、サービスは自動的に再起動されます。このプロセス中、古い KMS キーがデータ暗号化キー (DEK) を復号し、新しい KMS キーが DEK を再暗号化します。これにより、再起動後のサービスは今後の暗号化操作に新しい KMS キーを使用します。このプロセスには数分かかることがあります。

<details>
    <summary>AWS KMS による CMEK の有効化</summary>
    
1. ClickHouse Cloud で暗号化されたサービスを選択します
2. 左側の設定をクリックします
3. 画面の下部で、ネットワークセキュリティ情報を展開します
4. 暗号化ロール ID (AWS) または暗号化サービスアカウント (GCP) をコピーします - 今後のステップで必要になります
5. [AWS 用の KMS キーを作成](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
6. キーをクリックします
7. 次のように AWS キー ポリシーを更新します:
    
    ```json
    {
        "Sid": "ClickHouse アクセスを許可",
        "Effect": "Allow",
        "Principal": {
            "AWS": "{ 暗号化ロール ID }"
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
11. キー ARN をコピーします
12. ClickHouse Cloud に戻り、サービス設定の透過的データ暗号化セクションにキー ARN を貼り付けます
13. 変更を保存します
    
</details>

<details>
    <summary>GCP KMS による CMEK の有効化</summary>

1. ClickHouse Cloud で暗号化されたサービスを選択します
2. 左側の設定をクリックします
3. 画面の下部で、ネットワークセキュリティ情報を展開します
4. 暗号化サービスアカウント (GCP) をコピーします - 今後のステップで必要になります
5. [GCP 用の KMS キーを作成](https://cloud.google.com/kms/docs/create-key)
6. キーをクリックします
7. 上記ステップ 4 でコピーした GCP 暗号化サービスアカウントに次の権限を付与します。
   - Cloud KMS CryptoKey Encrypter/Decrypter
   - Cloud KMS Viewer
10. キー権限を保存します
11. キーリソースパスをコピーします
12. ClickHouse Cloud に戻り、サービス設定の透過的データ暗号化セクションにキーリソースパスを貼り付けます
13. 変更を保存します
    
</details>

## キーローテーション {#key-rotation}

CMEK を設定した後は、上記の手順に従って新しい KMS キーを作成し、権限を付与してキーをローテーションします。サービス設定に戻り、新しい ARN (AWS) またはキーリソースパス (GCP) を貼り付けて設定を保存します。サービスは新しいキーを適用するために再起動します。

## バックアップと復元 {#backup-and-restore}

バックアップは、関連するサービスと同じキーを使用して暗号化されます。暗号化されたバックアップを復元すると、元のインスタンスと同じ KMS キーを使用する暗号化されたインスタンスが作成されます。必要に応じて、復元後に KMS キーをローテーションすることができます。詳細については、[キーローテーション](#key-rotation)を参照してください。

## KMS キーポーラー {#kms-key-poller}

CMEK を使用している場合、提供された KMS キーの有効性は 10 分ごとにチェックされます。KMS キーへのアクセスが無効になると、ClickHouse サービスは停止します。サービスを再開するには、このガイドの手順に従って KMS キーへのアクセスを復元し、その後サービスを再起動します。

## パフォーマンス {#performance}

このページに記載されているように、ClickHouse の組み込みの [データ暗号化機能のための仮想ファイルシステム](/operations/storing-data#encrypted-virtual-file-system) を使用してデータを暗号化および保護します。

この機能で使用されるアルゴリズムは `AES_256_CTR` であり、ワークロードに応じて 5 ～ 15% のパフォーマンスペナルティが期待されています：

<Image img={cmek_performance} size="lg" alt="CMEK パフォーマンスペナルティ" />
