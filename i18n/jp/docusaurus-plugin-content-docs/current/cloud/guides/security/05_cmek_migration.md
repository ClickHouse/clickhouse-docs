---
sidebar_label: 'レガシー CMEK の移行'
slug: /cloud/security/cmek-migration
title: 'CMEK v1 から v2 への移行'
description: 'レガシー CMEK からバージョン 2 へ移行するための手順'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', '暗号化', 'CMEK']
---

ClickHouse では、Customer Managed Encryption Keys（CMEK）サービスのセキュリティを強化しています。すべてのサービスは、サービスごとに固有の AWS ロールを使用するように構成されており、これによりお客様のキーを使用してサービスの暗号化および復号を行うことが許可されます。この新しいロールは、サービス設定画面にのみ表示されます。

この新しいプロセスは、OpenAPI と Terraform の両方でサポートされています。詳細については、ドキュメント（[強化された暗号化](/docs/cloud/security/cmek)、[Cloud API](/docs/cloud/manage/api/api-overview)、[公式 Terraform Provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)）を参照してください。

## 手動での移行 {#manual-migration}

新しいプロセスに移行するには、次の手順を実行します。

1. [https://console.clickhouse.cloud](https://console.clickhouse.cloud) にサインインします
2. 暗号化対象のサービスをクリックします
3. 左側の Service Settings をクリックします
4. 画面の一番下までスクロールし、View service details を展開します
5. Encryption Role ID (IAM) をコピーします
6. AWS の KMS キーに移動し、次を追加するように Key Policy を更新します：

```json
{
   "Sid": "Allow ClickHouse Access",
   "Effect": "Allow",
   "Principal": {
       "AWS": ["Encryption role ID (ARN)"]
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

7. ClickHouse Cloud でサポートケースを作成し、新しい方式を有効化して問題ない旨をお知らせください。この変更にはサービスの再起動が必要です。サービスを再起動するのに最適な日付や時間帯があれば、併せてお知らせください。
8. サービスを再起動したら、AWS の KMS キーを開き、キーポリシーから次の設定を削除します。

```json
{
   "Sid": "Allow ClickHouse Access",
       "Effect": "Allow",
       "Principal": {
           "AWS": "arn:aws:iam::576599896960:role/prod-kms-request-role"
       },
       "Action": ["kms:GetPublicKey",
       "kms:Decrypt",
       "kms:GenerateDataKeyPair",
       "kms:Encrypt",
       "kms:GetKeyRotationStatus",
       "kms:GenerateDataKey",
       "kms:DescribeKey"],
       "Resource": "*"
}
```

9. 更新が完了しました！

## Terraform の移行 {#terraform-migration}

1. [Terraform バージョン 3.5.0 以降](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) にアップグレードします
2. 変更を加えずに Terraform を適用します。`transparent_data_encryption` 用の新しいフィールドが Terraform の state に追加されます。ここに表示される `role_id` を控えておきます。
3. AWS の KMS キーに移動し、キーポリシーを更新して次の内容を追加します:

```json
{
   "Sid": "Allow ClickHouse Access",
   "Effect": "Allow",
   "Principal": {
       "AWS": ["Encryption role ID (ARN)"]
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

4. ClickHouse Cloud でサポートケースを開き、ケースにサービス名を記載して、新しい方法を有効化してよいことをお知らせください。この変更にはサービスの再起動が必要なため、サービスを再起動するのに都合のよい日付と時間があればお知らせください。
5. サービスの再起動後、transparent&#95;data&#95;encryption.enabled の設定を「True」に更新し、Terraform で tier 設定を削除してから apply します。これを行っても実際の変更は発生しません。
6. AWS の KMS キーに移動し、キーポリシーから次の項目を削除します。

```json
{
   "Sid": "Allow ClickHouse Access",
       "Effect": "Allow",
       "Principal": {
           "AWS": "arn:aws:iam::576599896960:role/prod-kms-request-role"
       },
       "Action": ["kms:GetPublicKey",
       "kms:Decrypt",
       "kms:GenerateDataKeyPair",
       "kms:Encrypt",
       "kms:GetKeyRotationStatus",
       "kms:GenerateDataKey",
       "kms:DescribeKey"],
       "Resource": "*"
}
```

7. 更新が完了しました！
