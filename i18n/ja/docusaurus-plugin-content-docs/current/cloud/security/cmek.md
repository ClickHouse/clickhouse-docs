---
sidebar_label: 強化された暗号化
slug: /cloud/security/cmek
title: 顧客管理暗号鍵 (CMEK)
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge' 

# ClickHouse 強化された暗号化

<EnterprisePlanFeatureBadge feature="強化された暗号化" support="true"/>

データは、デフォルトでクラウドプロバイダが管理するAES 256鍵を使用して暗号化されます。顧客は、サービスデータに追加的な保護層を提供するために、透過的データ暗号化 (TDE) を有効にすることができます。さらに、顧客は独自の鍵を供給し、顧客管理暗号鍵 (CMEK) を実装することができます。

強化された暗号化は、現在AWSおよびGCPサービスで利用可能です。Azureは近日中に対応予定です。

## 透過的データ暗号化 (TDE) {#transparent-data-encryption-tde}

TDEは、サービス作成時に有効にする必要があります。既存のサービスは、作成後に暗号化することはできません。

1. `新しいサービスを作成` を選択
2. サービスに名前を付ける
3. クラウドプロバイダとしてAWSを選択し、ドロップダウンから希望のリージョンを選択
4. エンタープライズ機能のドロップダウンをクリックし、透過的データ暗号化 (TDE) を有効にする
5. サービスを作成をクリック

## 顧客管理暗号鍵 (CMEK) {#customer-managed-encryption-keys-cmek}

:::warning
ClickHouse Cloudサービスを暗号化するために使用されるKMS鍵を削除すると、ClickHouseサービスが停止し、そのデータは回復不可となり、既存のバックアップも失われます。
:::

一度サービスがTDEで暗号化されると、顧客は鍵を更新してCMEKを有効にすることができます。透過的データ暗号化設定を更新すると、サービスは自動的に再起動します。このプロセスでは、古いKMS鍵がデータ暗号鍵 (DEK) を復号し、新しいKMS鍵がDEKを再暗号化します。これにより、再起動後のサービスは、新しいKMS鍵を暗号化操作に使用します。このプロセスは数分かかる場合があります。

### AWS KMSを使用したCMEK {#cmek-with-aws-kms}

1. ClickHouse Cloudで暗号化されたサービスを選択
2. 左側の設定をクリック
3. 画面の下部で、ネットワークセキュリティ情報を展開
4. 暗号化ロールID (AWS) または暗号化サービスアカウント (GCP) をコピー - 将来のステップでこれが必要になります
5. [AWS用のKMS鍵を作成](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
6. 鍵をクリック
7. 以下のようにAWS鍵ポリシーを更新します:

    ```json
    {
        "Sid": "Allow ClickHouse Access",
            "Effect": "Allow",
            "Principal": {
                "AWS": "{暗号化ロールID}"
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

10. 鍵ポリシーを保存
11. 鍵ARNをコピー
12. ClickHouse Cloudに戻り、サービス設定の透過的データ暗号化セクションに鍵ARNを貼り付け
13. 変更を保存

### GCP KMSを使用したCMEK {#cmek-with-gcp-kms}

1. ClickHouse Cloudで暗号化されたサービスを選択
2. 左側の設定をクリック
3. 画面の下部で、ネットワークセキュリティ情報を展開
4. 暗号化サービスアカウント (GCP) をコピー - 将来のステップでこれが必要になります
5. [GCP用のKMS鍵を作成](https://cloud.google.com/kms/docs/create-key)
6. 鍵をクリック
7. 上記ステップ4でコピーしたGCP暗号化サービスアカウントに以下の権限を付与します。
   - Cloud KMS CryptoKey Encrypter/Decrypter
   - Cloud KMS Viewer
10. 鍵の権限を保存
11. 鍵リソースパスをコピー
12. ClickHouse Cloudに戻り、サービス設定の透過的データ暗号化セクションに鍵リソースパスを貼り付け
13. 変更を保存

## バックアップと復元 {#backup-and-restore}

バックアップは、関連するサービスと同じ鍵を使用して暗号化されます。暗号化されたバックアップを復元すると、元のインスタンスと同じKMS鍵を使用する暗号化されたインスタンスが作成されます。必要に応じて、KMS鍵をローテーションすることができます。詳細については、[鍵のローテーション](#key-rotation)を参照してください。

## KMS鍵ポーラー {#kms-key-poller}

CMEKを使用している場合、提供されたKMS鍵の有効性は10分ごとにチェックされます。KMS鍵へのアクセスが無効の場合、ClickHouseサービスは停止します。サービスを再開するには、このガイドの手順に従ってKMS鍵へのアクセスを回復し、その後サービスを再起動してください。

この機能の特性上、KMS鍵が削除された場合、ClickHouse Cloudサービスを回復することはできません。これを防ぐために、ほとんどのプロバイダは鍵をすぐに削除せず、削除を予定しますので、お使いのプロバイダのドキュメントを確認してください。

## 鍵のローテーション {#key-rotation}

この機能の特性上、KMS鍵が削除された場合、ClickHouse Cloudサービスを回復することはできません。 accidental lossを防ぐために、ほとんどのプロバイダは鍵の削除を予定し、即時に削除は行いません。詳細については、お使いのプロバイダのドキュメントを参照してください。

## パフォーマンス {#performance}

このページに記載されているように、私たちはClickHouseのビルトイン[データ暗号化用の仮想ファイルシステム機能](/operations/storing-data#encrypted-virtual-file-system)を使用して、データを暗号化および保護します。

この機能で使用されているアルゴリズムは`AES_256_CTR`であり、ワークロードに応じて5-15%のパフォーマンスペナルティが想定されます:

![CMEK パフォーマンスペナルティ](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/cmek-performance.png)
