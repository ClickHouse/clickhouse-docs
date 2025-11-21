---
sidebar_label: 'リファレンス'
description: 'サポートされるフォーマット、厳密な 1 回処理セマンティクス、ビュー対応、スケーリング、制限事項、オブジェクトストレージ ClickPipes を使用した認証の詳細'
slug: /integrations/clickpipes/object-storage/reference
sidebar_position: 1
title: 'リファレンス'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
keywords: ['clickpipes', 'object storage', 's3', 'data ingestion', 'batch loading']
---

import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
import Image from '@theme/IdealImage';


## サポートされているデータソース {#supported-data-sources}

| 名前                 | ロゴ                                                                                            | タイプ           | ステータス | 説明                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------- | -------------- | ------ | ------------------------------------------------------------------------- |
| Amazon S3            | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>             | オブジェクトストレージ | 安定版 | オブジェクトストレージから大量のデータを取り込むようにClickPipesを設定します。 |
| Google Cloud Storage | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/> | オブジェクトストレージ | 安定版 | オブジェクトストレージから大量のデータを取り込むようにClickPipesを設定します。 |
| DigitalOcean Spaces  | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/>         | オブジェクトストレージ | 安定版 | オブジェクトストレージから大量のデータを取り込むようにClickPipesを設定します。 |
| Azure Blob Storage   | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/>   | オブジェクトストレージ | 安定版 | オブジェクトストレージから大量のデータを取り込むようにClickPipesを設定します。 |

今後、ClickPipesにはさらに多くのコネクタが追加される予定です。詳細については[お問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。


## サポートされているデータ形式 {#supported-data-formats}

サポートされている形式は以下の通りです:

- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)


## Exactly-once semantics {#exactly-once-semantics}

大規模なデータセットの取り込み時には、さまざまな種類の障害が発生する可能性があり、部分的な挿入や重複データが生じることがあります。Object Storage ClickPipesは挿入の失敗に対して耐性があり、厳密に1回のセマンティクスを提供します。これは一時的な「ステージング」テーブルを使用することで実現されます。データはまずステージングテーブルに挿入されます。この挿入で問題が発生した場合、ステージングテーブルをトランケートして、クリーンな状態から挿入を再試行できます。挿入が完了し成功した場合にのみ、ステージングテーブル内のパーティションがターゲットテーブルに移動されます。この戦略の詳細については、[このブログ記事](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)をご覧ください。

### View support {#view-support}

ターゲットテーブル上のマテリアライズドビューもサポートされています。ClickPipesは、ターゲットテーブルだけでなく、依存するマテリアライズドビューに対してもステージングテーブルを作成します。

非マテリアライズドビューに対してはステージングテーブルを作成しません。つまり、1つ以上の下流のマテリアライズドビューを持つターゲットテーブルがある場合、それらのマテリアライズドビューはターゲットテーブルからビュー経由でデータを選択することを避ける必要があります。そうしないと、マテリアライズドビューでデータが欠落する可能性があります。


## スケーリング {#scaling}

Object Storage ClickPipesは、[垂直自動スケーリング設定](/manage/scaling#configuring-vertical-auto-scaling)で決定されるClickHouseサービスの最小サイズに基づいてスケーリングされます。ClickPipeのサイズはパイプ作成時に決定されます。パイプ作成後のClickHouseサービス設定の変更は、ClickPipeのサイズに影響しません。

大規模なデータ取り込みジョブのスループットを向上させるには、ClickPipeを作成する前にClickHouseサービスをスケーリングすることを推奨します。


## 制限事項 {#limitations}

- 宛先テーブル、そのマテリアライズドビュー(カスケードマテリアライズドビューを含む)、またはマテリアライズドビューのターゲットテーブルへの変更は、再試行される一時的なエラーを引き起こす可能性があります。最良の結果を得るには、パイプを停止し、必要な変更を行った後、パイプを再起動して変更を適用し、エラーを回避することを推奨します。
- サポートされるビューの種類には制限があります。詳細については、[exactly-onceセマンティクス](#exactly-once-semantics)および[ビューのサポート](#view-support)のセクションを参照してください。
- GCPまたはAzureにデプロイされたClickHouse CloudインスタンスのS3 ClickPipesでは、ロール認証は利用できません。AWS ClickHouse Cloudインスタンスでのみサポートされています。
- ClickPipesは10GB以下のサイズのオブジェクトのみ取り込みを試みます。ファイルが10GBを超える場合、ClickPipes専用のエラーテーブルにエラーが記録されます。
- 10万ファイルを超えるコンテナで継続的な取り込みを行うAzure Blob Storageパイプは、新しいファイルの検出に約10〜15秒の遅延が発生します。遅延はファイル数に応じて増加します。
- Object Storage ClickPipesは、[S3テーブル関数](/sql-reference/table-functions/s3)とリスト構文を共有**しません**。また、Azureは[AzureBlobStorageテーブル関数](/sql-reference/table-functions/azureBlobStorage)と共有しません。
  - `?` - 任意の1文字に一致
  - `*` - `/`を除く任意の数の任意の文字に一致(空文字列を含む)
  - `**` - `/`を含む任意の数の任意の文字に一致(空文字列を含む)

:::note
これは有効なパス(S3用)です:

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz

これは有効なパスではありません。`{N..M}`はClickPipesでサポートされていません。

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::


## 継続的な取り込み {#continuous-ingest}

ClickPipesは、S3、GCS、Azure Blob Storage、およびDigitalOcean Spacesからの継続的なデータ取り込みをサポートしています。有効にすると、ClickPipesは指定されたパスから継続的にデータを取り込み、30秒ごとに新しいファイルをポーリングします。ただし、新しいファイルは最後に取り込まれたファイルよりも辞書順で後である必要があります。つまり、取り込み順序を定義するような命名規則に従う必要があります。例えば、`file1`、`file2`、`file3`などと名付けられたファイルは順次取り込まれます。`file0`のような名前の新しいファイルが追加された場合、最後に取り込まれたファイルよりも辞書順で後ではないため、ClickPipesはそれを取り込みません。


## 取り込み済みファイルの追跡 {#tracking-ingested-files}

取り込み済みのファイルを追跡するには、フィールドマッピングに`_file`[仮想カラム](/sql-reference/table-functions/s3#virtual-columns)を含めます。`_file`仮想カラムにはソースオブジェクトのファイル名が含まれているため、処理済みのファイルをクエリで簡単に特定できます。


## 認証 {#authentication}

### S3 {#s3}

パブリックアクセス可能なS3バケットと保護されたS3バケットの両方がサポートされています。

パブリックバケットは、ポリシーで`s3:GetObject`と`s3:ListBucket`の両方のアクションを許可する必要があります。

保護されたバケットには、[IAM認証情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または[IAMロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)のいずれかを使用してアクセスできます。
IAMロールを使用する場合は、[このガイド](/cloud/data-sources/secure-s3)で指定されているようにIAMロールを作成する必要があります。作成後、新しいIAMロールのARNをコピーし、ClickPipe設定に「IAM ARNロール」として貼り付けてください。

### GCS {#gcs}

S3と同様に、パブリックバケットには設定なしでアクセスでき、保護されたバケットにはAWS IAM認証情報の代わりに[HMACキー](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)を使用できます。Google Cloudの[キーの設定方法に関するガイド](https://cloud.google.com/storage/docs/authentication/hmackeys)を参照してください。

GCSのサービスアカウントは直接サポートされていません。非パブリックバケットで認証する場合は、HMAC(IAM)認証情報を使用する必要があります。
HMAC認証情報に関連付けられたサービスアカウントの権限は、`storage.objects.list`と`storage.objects.get`である必要があります。

### DigitalOcean Spaces {#dospaces}

現在、DigitalOcean Spacesでは保護されたバケットのみがサポートされています。バケットとそのファイルにアクセスするには、「アクセスキー」と「シークレットキー」が必要です。アクセスキーの作成方法については、[このガイド](https://docs.digitalocean.com/products/spaces/how-to/manage-access/)を参照してください。

### Azure Blob Storage {#azureblobstorage}

現在、Azure Blob Storageでは保護されたバケットのみがサポートされています。認証は接続文字列を介して行われ、アクセスキーと共有キーがサポートされています。詳細については、[このガイド](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string)を参照してください。
