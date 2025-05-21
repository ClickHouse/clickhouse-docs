---
sidebar_label: '強化された暗号化'
slug: /cloud/security/cmek
title: '顧客管理の暗号化キー (CMEK)'
description: '顧客管理の暗号化キーについて詳しく学ぶ'
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import cmek_performance from '@site/static/images/_snippets/cmek-performance.png';


# ClickHouse 強化された暗号化

<EnterprisePlanFeatureBadge feature="強化された暗号化"/>

静止データは、デフォルトでクラウドプロバイダーが管理する AES 256 キーを使用して暗号化されます。顧客は、サービスデータに追加の保護層を提供するために透過的データ暗号化 (TDE) を有効にするか、サービスのために顧客管理の暗号化キー (CMEK) を実装するために独自のキーを提供できます。

強化された暗号化は、現在 AWS および GCP サービスで利用可能です。Azure は近日中に対応予定です。

## 透過的データ暗号化 (TDE) {#transparent-data-encryption-tde}

TDE はサービスの作成時に有効にする必要があります。既存のサービスは、作成後に暗号化できません。

1. `新しいサービスを作成` を選択
2. サービスに名前を付ける
3. ドロップダウンからクラウドプロバイダーとして AWS または GCP を選択し、希望のリージョンを選択
4. エンタープライズ機能のドロップダウンをクリックし、透過的データ暗号化 (TDE) を有効にするを切り替え
5. サービスを作成をクリック

## 顧客管理の暗号化キー (CMEK) {#customer-managed-encryption-keys-cmek}

:::warning
ClickHouse Cloud サービスを暗号化するために使用される KMS キーを削除すると、ClickHouse サービスが停止し、そのデータが取得できなくなります。既存のバックアップも失われます。キーのローテーション時に誤ってデータが失われないようにするために、削除前に古い KMS キーを一定期間保持することをお勧めします。
:::

サービスが TDE で暗号化されると、顧客はキーを更新して CMEK を有効にできます。設定の更新後、サービスは自動的に再起動します。このプロセス中に、古い KMS キーがデータ暗号化キー (DEK) を復号化し、新しい KMS キーが DEK を再暗号化します。これにより、再起動時には新しい KMS キーが今後の暗号化操作に使用されます。このプロセスには数分かかることがあります。

<details>
    <summary>AWS KMS で CMEK を有効にする</summary>
    
1. ClickHouse Cloud で、暗号化されたサービスを選択
2. 左側の設定をクリック
3. 画面の下部で、ネットワークセキュリティ情報を展開
4. 暗号化ロール ID (AWS) または暗号化サービスアカウント (GCP) をコピー - 今後のステップで必要になります
5. [AWS 用の KMS キーを作成](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
6. キーをクリック
7. AWS キーポリシーを次のように更新:
    
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
    
10. キーポリシーを保存
11. キー ARN をコピー
12. ClickHouse Cloud に戻り、サービス設定の透過的データ暗号化セクションにキー ARN を貼り付け
13. 変更を保存
    
</details>

<details>
    <summary>GCP KMS で CMEK を有効にする</summary>

1. ClickHouse Cloud で、暗号化されたサービスを選択
2. 左側の設定をクリック
3. 画面の下部で、ネットワークセキュリティ情報を展開
4. 暗号化サービスアカウント (GCP) をコピー - 今後のステップで必要になります
5. [GCP 用の KMS キーを作成](https://cloud.google.com/kms/docs/create-key)
6. キーをクリック
7. 上記のステップ 4 でコピーした GCP 暗号化サービスアカウントに次の権限を付与します。
   - Cloud KMS CryptoKey Encrypter/Decrypter
   - Cloud KMS Viewer
10. キー権限を保存
11. キーリソースパスをコピー
12. ClickHouse Cloud に戻り、サービス設定の透過的データ暗号化セクションにキーリソースパスを貼り付け
13. 変更を保存
    
</details>

## キーローテーション {#key-rotation}

CMEK をセットアップしたら、新しい KMS キーを作成し、権限を付与する手順に従ってキーをローテーションします。サービス設定に戻り、新しい ARN (AWS) またはキーリソースパス (GCP) を貼り付けて設定を保存します。サービスは新しいキーを適用するために再起動します。

## バックアップと復元 {#backup-and-restore}

バックアップは、関連するサービスと同じキーを使用して暗号化されます。暗号化されたバックアップを復元すると、元のインスタンスと同じ KMS キーを使用する暗号化されたインスタンスが作成されます。必要に応じて、復元後に KMS キーをローテーションすることもできます。詳細については、[キーローテーション](#key-rotation)を参照してください。

## KMS キーポーラー {#kms-key-poller}

CMEK を使用している場合、提供された KMS キーの有効性は 10 分ごとにチェックされます。KMS キーへのアクセスが無効な場合、ClickHouse サービスは停止します。サービスを再開するには、このガイドの手順に従って KMS キーへのアクセスを復元し、その後、サービスを再起動します。

## パフォーマンス {#performance}

このページで指定されているように、私たちは ClickHouse の組み込みの [データ暗号化機能用の仮想ファイルシステム](/operations/storing-data#encrypted-virtual-file-system) を使用して、データを暗号化し保護します。

この機能で使用されるアルゴリズムは `AES_256_CTR` であり、ワークロードに応じて 5-15% のパフォーマンスペナルティが予想されます。

<Image img={cmek_performance} size="lg" alt="CMEK パフォーマンスペナルティ" />
