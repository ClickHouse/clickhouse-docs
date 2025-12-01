---
sidebar_label: 'リファレンス'
description: 'サポートされるフォーマット、exactly-once セマンティクス、ビューのサポート、スケーリング、制限事項、オブジェクトストレージ向け ClickPipes における認証の詳細'
slug: /integrations/clickpipes/object-storage/reference
sidebar_position: 1
title: 'リファレンス'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
keywords: ['clickpipes', 'object storage', 's3', 'データインジェスト', 'バッチロード']
---

import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
import Image from '@theme/IdealImage';


## サポートされているデータソース {#supported-data-sources}

| Name                 |Logo|Type| Status          | Description                                                                                          |
|----------------------|----|----|-----------------|------------------------------------------------------------------------------------------------------|
| Amazon S3            |<S3svg class="image" alt="Amazon S3 ロゴ" style={{width: '3rem', height: 'auto'}}/>|オブジェクトストレージ| 安定版          | ClickPipes を使用して、オブジェクトストレージから大量のデータを取り込むように設定します。                            |
| Google Cloud Storage |<Gcssvg class="image" alt="Google Cloud Storage ロゴ" style={{width: '3rem', height: 'auto'}}/>|オブジェクトストレージ| 安定版          | ClickPipes を使用して、オブジェクトストレージから大量のデータを取り込むように設定します。                            |
| DigitalOcean Spaces | <DOsvg class="image" alt="Digital Ocean ロゴ" style={{width: '3rem', height: 'auto'}}/> | オブジェクトストレージ | 安定版 | ClickPipes を使用して、オブジェクトストレージから大量のデータを取り込むように設定します。 |
| Azure Blob Storage | <ABSsvg class="image" alt="Azure Blob Storage ロゴ" style={{width: '3rem', height: 'auto'}}/> | オブジェクトストレージ | 安定版 | ClickPipes を使用して、オブジェクトストレージから大量のデータを取り込むように設定します。 |

ClickPipes には今後さらに多くのコネクタが追加される予定です。詳細については[お問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。



## サポートされているデータ形式 {#supported-data-formats}

サポートされている形式は次のとおりです。
- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)



## Exactly-once セマンティクス {#exactly-once-semantics}

大規模なデータセットを取り込む際にはさまざまな種類の障害が発生し得るため、部分的な挿入や重複データが発生する可能性があります。Object Storage ClickPipes は挿入時の障害に対して堅牢であり、Exactly-once セマンティクスを提供します。これは一時的な「ステージング」テーブルを使用することで実現されています。データはまずステージングテーブルに挿入されます。この挿入で問題が発生した場合、ステージングテーブルを TRUNCATE してクリーンな状態から挿入を再試行できます。挿入が完了して正常に終了した場合にのみ、ステージングテーブル内のパーティションがターゲットテーブルに移動されます。この戦略の詳細については、[このブログ記事](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)を参照してください。

### View のサポート {#view-support}
ターゲットテーブル上のマテリアライズドビューもサポートされています。ClickPipes はターゲットテーブルだけでなく、それに依存するマテリアライズドビューに対してもステージングテーブルを作成します。

非マテリアライズドビューに対してはステージングテーブルを作成しません。つまり、ターゲットテーブルに 1 つ以上の下流のマテリアライズドビューがある場合、それらのマテリアライズドビューでは、ターゲットテーブルに対する SELECT をビュー経由で行うことは避ける必要があります。そうしないと、マテリアライズドビューでデータが欠落していることに気付く可能性があります。



## スケーリング {#scaling}

オブジェクトストレージ向け ClickPipes は、[垂直オートスケーリング設定](/manage/scaling#configuring-vertical-auto-scaling) で決定される最小の ClickHouse サービスサイズに基づいてスケールされます。ClickPipe のサイズは、パイプ作成時に決定されます。その後に ClickHouse サービス設定を変更しても、ClickPipe のサイズには影響しません。

大規模なデータ取り込みジョブのスループットを向上させるには、ClickPipe を作成する前に ClickHouse サービスをスケールアップすることを推奨します。



## 制限事項 {#limitations}
- 宛先テーブル、そのマテリアライズドビュー（カスケードするマテリアライズドビューを含む）、またはマテリアライズドビューの対象テーブルへの変更は、再試行される一時的なエラーを引き起こす可能性があります。最良の結果を得るには、パイプを停止し、必要な変更を加えてからパイプを再起動し、変更が取り込まれてエラーを回避できるようにすることを推奨します。
- サポートされるビューの種類には制限があります。詳細については、[exactly-once semantics](#exactly-once-semantics) と [view support](#view-support) のセクションを参照してください。
- GCP または Azure 上にデプロイされた ClickHouse Cloud インスタンス向けの S3 ClickPipes では、ロール認証は利用できません。ロール認証は AWS 上の ClickHouse Cloud インスタンスでのみサポートされます。
- ClickPipes が取り込もうと試みるオブジェクトは、サイズが 10GB 以下のものに限られます。ファイルが 10GB を超える場合は、ClickPipes 専用のエラーテーブルにエラーが追記されます。
- 10万個を超えるファイルを含むコンテナに対して継続的取り込みを行う Azure Blob Storage パイプでは、新しいファイルの検出に約 10〜15 秒のレイテンシーが発生します。レイテンシーはファイル数が増えるにつれて増加します。
- Object Storage ClickPipes は、[S3 Table Function](/sql-reference/table-functions/s3) および Azure の [AzureBlobStorage Table function](/sql-reference/table-functions/azureBlobStorage) のいずれともリスト構文を共有 **しません**。
  - `?` - 任意の 1 文字を置換
  - `*` - `/` を除く任意の文字列を任意の長さで置換（空文字列を含む）
  - `**` - `/` を含む任意の文字列を任意の長さで置換（空文字列を含む）

:::note
これは有効なパスです（S3 の場合）:

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz

これは有効なパスではありません。`{N..M}` は ClickPipes ではサポートされていません。

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::



## Continuous Ingest {#continuous-ingest}
ClickPipes は、S3、GCS、Azure Blob Storage、DigitalOcean Spaces からの継続的なインジェストをサポートします。有効化すると、ClickPipes は指定されたパスからデータを継続的にインジェストし、30 秒に 1 回の頻度で新しいファイルをポーリングします。ただし、新しいファイルは最後にインジェストされたファイルよりも辞書順で後ろである必要があります。つまり、インジェスト順序を定義できるような名前を付ける必要があります。たとえば、`file1`、`file2`、`file3` のように名前が付けられたファイルは順番にインジェストされます。`file0` のような名前の新しいファイルが追加された場合、最後にインジェストされたファイルより辞書順で後ろではないため、ClickPipes はそれをインジェストしません。



## 取り込まれたファイルの追跡 {#tracking-ingested-files}

どのファイルが取り込まれたかを追跡するには、フィールドマッピングに `_file` [仮想カラム](/sql-reference/table-functions/s3#virtual-columns) を含めます。`_file` 仮想カラムには元のオブジェクトのファイル名が含まれるため、どのファイルが処理済みかを簡単にクエリして特定できます。



## 認証 {#authentication}

### S3 {#s3}
公開アクセス可能な S3 バケットと保護された S3 バケットの両方がサポートされています。

公開バケットのポリシーでは、`s3:GetObject` と `s3:ListBucket` の両方のアクションを許可する必要があります。

保護されたバケットには、[IAM 認証情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または [IAM ロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)を使用してアクセスできます。
IAM ロールを使用するには、[このガイド](/cloud/data-sources/secure-s3)で説明されているとおりに IAM ロールを作成する必要があります。作成後に新しい IAM ロールの ARN をコピーし、ClickPipe の設定の "IAM ARN role" に貼り付けてください。

### GCS {#gcs}
S3 と同様に、公開バケットには設定なしでアクセスでき、保護されたバケットには AWS IAM 認証情報の代わりに [HMAC Keys](https://cloud.google.com/storage/docs/authentication/managing-hmackeys) を使用できます。これらのキーの設定方法については、Google Cloud の[このガイド](https://cloud.google.com/storage/docs/authentication/hmackeys)を参照してください。

GCS の Service Account は直接サポートされていません。非公開バケットに対して認証を行う場合は、HMAC (IAM) 認証情報を使用する必要があります。
HMAC 認証情報に紐づく Service Account には、`storage.objects.list` と `storage.objects.get` の権限が必要です。

### DigitalOcean Spaces {#dospaces}
現在、DigitalOcean Spaces では保護されたバケットのみサポートされています。バケットおよびそのファイルにアクセスするには、「Access Key」と「Secret Key」が必要です。アクセスキーの作成方法については、[このガイド](https://docs.digitalocean.com/products/spaces/how-to/manage-access/)を参照してください。

### Azure Blob Storage {#azureblobstorage}
現在、Azure Blob Storage では保護されたバケットのみサポートされています。認証は接続文字列を使用して行われ、アクセスキーおよび共有キーをサポートします。詳細については、[このガイド](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string)を参照してください。
