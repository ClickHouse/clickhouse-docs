---
'sidebar_label': '強化された暗号化'
'slug': '/cloud/security/cmek'
'title': '顧客管理の暗号化キー (CMEK)'
'description': '顧客管理の暗号化キーについてもっと学びましょう'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import cmek_performance from '@site/static/images/_snippets/cmek-performance.png';


# ClickHouse 強化暗号化

<EnterprisePlanFeatureBadge feature="Enhanced Encryption"/>

静止データは、デフォルトでクラウドプロバイダー管理の AES 256 キーを使用して暗号化されています。顧客は透明データ暗号化 (TDE) を有効にしてサービスデータに追加の保護層を提供したり、顧客管理の暗号化キー (CMEK) を実装するために独自のキーを提供することができます。

強化暗号化は現在、AWS および GCP サービスで利用可能です。Azure は近日中に利用可能になります。

## 透明データ暗号化 (TDE) {#transparent-data-encryption-tde}

TDE はサービス作成時に有効にする必要があります。既存のサービスは作成後に暗号化することはできません。TDE が有効になると、それを無効にすることはできません。サービス内のすべてのデータは暗号化されたままになります。TDE を有効にした後に無効にしたい場合は、新しいサービスを作成し、そこにデータを移行する必要があります。

1. `新しいサービスを作成` を選択
2. サービスに名前を付ける
3. ドロップダウンからクラウドプロバイダーとして AWS または GCP および希望のリージョンを選択
4. エンタープライズ機能のドロップダウンをクリックし、透明データ暗号化 (TDE) を有効にする
5. サービスを作成をクリック

## 顧客管理の暗号化キー (CMEK) {#customer-managed-encryption-keys-cmek}

:::warning
ClickHouse Cloud サービスを暗号化するために使用される KMS キーを削除すると、ClickHouse サービスが停止し、そのデータは復元できなくなり、既存のバックアップも失われます。キーをローテーションする際に偶発的なデータ損失を防ぐために、削除する前に古い KMS キーを一定期間保持することをお勧めします。 
:::

サービスが TDE で暗号化されると、顧客はキーを更新して CMEK を有効にできます。TDE 設定を更新すると、サービスは自動的に再起動します。このプロセス中、古い KMS キーがデータ暗号化キー (DEK) を復号化し、新しい KMS キーが DEK を再暗号化します。これにより、再起動後のサービスが今後の暗号化操作に新しい KMS キーを使用することが保証されます。このプロセスには数分かかる場合があります。

<details>
    <summary>AWS KMS を使用して CMEK を有効にする</summary>
    
1. ClickHouse Cloud で、暗号化されたサービスを選択
2. 左側の設定をクリック
3. 画面の下部で、ネットワークセキュリティ情報を展開
4. 暗号化ロール ID (AWS) または暗号化サービスアカウント (GCP) をコピー - 次のステップで必要になります
5. [AWS の KMS キーを作成](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
6. キーをクリック
7. AWS キーポリシーを次のように更新：
    
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
    
10. キーポリシーを保存
11. キー ARN をコピー
12. ClickHouse Cloud に戻り、サービス設定の透明データ暗号化セクションにキー ARN を貼り付ける
13. 変更を保存

</details>

<details>
    <summary>GCP KMS を使用して CMEK を有効にする</summary>

1. ClickHouse Cloud で、暗号化されたサービスを選択
2. 左側の設定をクリック
3. 画面の下部で、ネットワークセキュリティ情報を展開
4. 暗号化サービスアカウント (GCP) をコピー - 次のステップで必要になります
5. [GCP の KMS キーを作成](https://cloud.google.com/kms/docs/create-key)
6. キーをクリック
7. ステップ 4 でコピーした GCP 暗号化サービスアカウントに次の権限を付与：
   - Cloud KMS CryptoKey Encrypter/Decrypter
   - Cloud KMS Viewer
10. キーの権限を保存
11. キーリソースパスをコピー
12. ClickHouse Cloud に戻り、サービス設定の透明データ暗号化セクションにキーリソースパスを貼り付ける
13. 変更を保存

</details>

## キーのローテーション {#key-rotation}

CMEK を設定したら、新しい KMS キーを作成して権限を付与する手順に従ってキーをローテーションします。サービス設定に戻り、新しい ARN (AWS) またはキーリソースパス (GCP) を貼り付けて設定を保存します。サービスは新しいキーを適用するために再起動します。

## バックアップと復元 {#backup-and-restore}

バックアップは関連するサービスと同じキーを使用して暗号化されます。暗号化されたバックアップを復元すると、元のインスタンスと同じ KMS キーを使用する暗号化されたインスタンスが作成されます。必要に応じて、復元後に KMS キーをローテーションすることができます。詳細については [キーのローテーション](#key-rotation) を参照してください。

## KMS キーポーラー {#kms-key-poller}

CMEK を使用する場合は、提供された KMS キーの有効性が 10 分ごとにチェックされます。KMS キーへのアクセスが無効な場合、ClickHouse サービスは停止します。サービスを再開するには、このガイドの手順に従って KMS キーへのアクセスを復元し、その後サービスを再起動します。

## パフォーマンス {#performance}

このページに指定されているように、データを暗号化するために ClickHouse の組み込み [データ暗号化のための仮想ファイルシステム機能](/operations/storing-data#encrypted-virtual-file-system) を使用してデータを暗号化および保護します。

この機能で使用されるアルゴリズムは `AES_256_CTR` であり、ワークロードに応じて 5-15% のパフォーマンスペナルティが予想されます：

<Image img={cmek_performance} size="lg" alt="CMEK パフォーマンスペナルティ" />
