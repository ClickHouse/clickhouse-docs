---
sidebar_label: 拡張暗号化
slug: /cloud/security/cmek
title: 顧客管理暗号化キー (CMEK)
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import cmek_performance from '@site/static/images/_snippets/cmek-performance.png';


# ClickHouse 拡張暗号化

<EnterprisePlanFeatureBadge feature="拡張暗号化" support="true"/>

静止データはデフォルトでクラウドプロバイダー管理のAES 256キーを使用して暗号化されます。顧客は、サービスデータに対して追加の保護層を提供するために、透過的データ暗号化 (TDE) を有効にすることができます。さらに、顧客は自分のキーを提供してサービスのために顧客管理暗号化キー (CMEK) を実装できます。

拡張暗号化は現在、AWSとGCPサービスで利用可能です。Azureは近日中に登場します。

## 透過的データ暗号化 (TDE) {#transparent-data-encryption-tde}

TDEはサービス作成時に有効にする必要があります。既存のサービスは作成後に暗号化することはできません。

1. `新しいサービスを作成`を選択
2. サービスの名前を入力
3. クラウドプロバイダーとしてAWSを選択し、ドロップダウンから希望するリージョンを選択
4. エンタープライズ機能のドロップダウンをクリックし、透過的データ暗号化 (TDE) を有効にするを切り替え
5. サービスを作成をクリック

## 顧客管理暗号化キー (CMEK) {#customer-managed-encryption-keys-cmek}

:::warning
ClickHouse Cloudサービスを暗号化するために使用されたKMSキーを削除すると、ClickHouseサービスが停止し、そのデータは回復できなくなります。既存のバックアップも同様です。
:::

サービスがTDEで暗号化されると、顧客はキーを更新してCMEKを有効にすることができます。透過的データ暗号化設定を更新した後、サービスは自動的に再起動します。このプロセス中、古いKMSキーがデータ暗号化キー (DEK) を復号化し、新しいKMSキーがDEKを再暗号化します。これにより、再起動時にサービスは今後の暗号化操作に新しいKMSキーを使用します。このプロセスには数分かかる場合があります。

### CMEK with AWS KMS {#cmek-with-aws-kms}

1. ClickHouse Cloudで暗号化されたサービスを選択
2. 左側の設定をクリック
3. 画面の下部でネットワークセキュリティ情報を展開
4. 暗号化ロールID (AWS) または暗号化サービスアカウント (GCP) をコピー - 後のステップで必要になります
5. [AWSのKMSキーを作成](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
6. キーをクリック
7. AWSキーのポリシーを次のように更新：

    ```json
    {
        "Sid": "ClickHouseへのアクセスを許可",
            "Effect": "Allow",
            "Principal": {
                "AWS": "{ 暗号化ロールID }"
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

10. キーポリシーを保存
11. キーARNをコピー
12. ClickHouse Cloudに戻り、サービス設定の透過的データ暗号化セクションにキーARNを貼り付け
13. 変更を保存

### CMEK with GCP KMS {#cmek-with-gcp-kms}

1. ClickHouse Cloudで暗号化されたサービスを選択
2. 左側の設定をクリック
3. 画面の下部でネットワークセキュリティ情報を展開
4. 暗号化サービスアカウント (GCP) をコピー - 後のステップで必要になります
5. [GCPのKMSキーを作成](https://cloud.google.com/kms/docs/create-key)
6. キーをクリック
7. 上記のステップ4でコピーしたGCP暗号化サービスアカウントに次の権限を付与します。
   - Cloud KMS CryptoKey Encrypter/Decrypter
   - Cloud KMS Viewer
10. キーの権限を保存
11. キーリソースパスをコピー
12. ClickHouse Cloudに戻り、サービス設定の透過的データ暗号化セクションにキーリソースパスを貼り付け
13. 変更を保存

## バックアップと復元 {#backup-and-restore}

バックアップは関連するサービスと同じキーを使用して暗号化されます。暗号化されたバックアップを復元すると、元のインスタンスと同じKMSキーを使用する暗号化インスタンスが作成されます。必要に応じてKMSキーをローテーションできます。詳細は[キーのローテーション](#key-rotation)を参照してください。

## KMSキーのポーラー {#kms-key-poller}

CMEKを使用する場合、提供されたKMSキーの有効性は10分ごとに確認されます。KMSキーへのアクセスが無効になると、ClickHouseサービスは停止します。サービスを再開するには、このガイドの手順に従ってKMSキーへのアクセスを復元し、その後サービスを再起動してください。

この機能の特性上、KMSキーが削除された後にClickHouse Cloudサービスを回復することはできません。これを防ぐために、ほとんどのプロバイダーはキーを即座に削除するのではなく、削除のスケジュールを設定します。ご利用のプロバイダーの文書を確認してください。

## キーのローテーション {#key-rotation}

この機能の特性上、KMSキーが削除された場合、ClickHouse Cloudサービスを回復することはできません。偶発的な損失を防ぐために、ほとんどのプロバイダーはキーの削除を即座に行うのではなく、削除のスケジュールを設定します。詳細については、プロバイダーの文書を参照してください。

## パフォーマンス {#performance}

このページに記載されているように、ClickHouseの組み込み[データ暗号化用バーチャルファイルシステム機能](/operations/storing-data#encrypted-virtual-file-system)を使用してデータを暗号化および保護します。

この機能で使用されるアルゴリズムは `AES_256_CTR` であり、ワークロードに応じて5〜15％のパフォーマンスペナルティが予想されます：

<img src={cmek_performance} class="image" alt="CMEKパフォーマンスペナルティ" />

