---
'sidebar_label': 'オブジェクトストレージのためのClickPipes'
'description': 'あなたのオブジェクトストレージをClickHouse Cloudにシームレスに接続します。'
'slug': '/integrations/clickpipes/object-storage'
'title': 'ClickHouse Cloudとオブジェクトストレージの統合'
'doc_type': 'guide'
---

import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2_object_storage.png';
import cp_step3_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_object_storage.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import Image from '@theme/IdealImage';


# ClickHouse Cloudとのオブジェクトストレージの統合
Object Storage ClickPipesは、Amazon S3、Google Cloud Storage、Azure Blob Storage、およびDigitalOcean SpacesからClickHouse Cloudへのデータの取り込みを簡単かつ頑健な方法で提供します。一度きりのデータ取り込みと継続的なデータ取り込みの両方が、正確に一度のセマンティクスを持ってサポートされています。

## 前提条件 {#prerequisite}
[ClickPipesのイントロ](./index.md)を理解している必要があります。

## 最初のClickPipeの作成 {#creating-your-first-clickpipe}

1. クラウドコンソールで、左側のメニューから`Data Sources`ボタンを選択し、「ClickPipeを設定」をクリックします。

<Image img={cp_step0} alt="インポートの選択" size="lg" border/>

2. データソースを選択します。

<Image img={cp_step1} alt="データソースのタイプの選択" size="lg" border/>

3. ClickPipeに名称、説明（オプション）、IAMロールまたは資格情報、バケットURLを提供してフォームに入力します。bashスタイルのワイルドカードを使用して複数のファイルを指定できます。詳細については、[パスでのワイルドカードの使用に関するドキュメントを参照してください](#limitations)。

<Image img={cp_step2_object_storage} alt="接続の詳細を入力" size="lg" border/>

4. UIに指定したバケット内のファイルのリストが表示されます。データ形式を選択します（現在、ClickHouseフォーマットのサブセットをサポートしています）および継続的なデータ取り込みを有効にしたい場合は[以下の詳細](#continuous-ingest)を確認してください。

<Image img={cp_step3_object_storage} alt="データ形式とトピックを設定" size="lg" border/>

5. 次のステップでは、新しいClickHouseテーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従って、テーブル名、スキーマ、および設定を変更します。変更内容はサンプルテーブルのリアルタイムプレビューで確認できます。

<Image img={cp_step4a} alt="テーブル、スキーマ、設定を設定" size="lg" border/>

  高度な設定をカスタマイズするために提供されたコントロールを使用することもできます。

<Image img={cp_step4a3} alt="高度なコントロールを設定" size="lg" border/>

6. あるいは、既存のClickHouseテーブルにデータを取り込むことを選択することもできます。その場合、UIはソースから選択した宛先テーブルのClickHouseフィールドにマッピングするフィールドを指定します。

<Image img={cp_step4b} alt="既存のテーブルを使用" size="lg" border/>

:::info
`_path`や`_size`のような[仮想カラム](../../sql-reference/table-functions/s3#virtual-columns)をフィールドにマッピングすることもできます。
:::

7. 最後に、内部ClickPipesユーザーの権限を設定できます。

  **権限:** ClickPipesは、宛先テーブルへのデータを書き込むための専用ユーザーを作成します。この内部ユーザーに対するロールをカスタムロールまたは定義済みのロールのいずれかから選択できます。
    - `フルアクセス`: クラスターへのフルアクセス。宛先テーブルにMaterialized ViewまたはDictionaryを使用する場合に必要です。
    - `宛先テーブルのみ`: 宛先テーブルへの`INSERT`権限のみ。

<Image img={cp_step5} alt="権限" size="lg" border/>

8. 「設定を完了」をクリックすると、システムがClickPipeを登録し、サマリーテーブルに表示されます。

<Image img={cp_success} alt="成功通知" size="sm" border/>

<Image img={cp_remove} alt="削除通知" size="lg" border/>

  サマリーテーブルには、ClickHouseのソースまたは宛先テーブルからのサンプルデータを表示するコントロールが提供されます。

<Image img={cp_destination} alt="宛先の表示" size="lg" border/>

  ClickPipeを削除し、データ取り込みジョブのサマリーを表示するためのコントロールもあります。

<Image img={cp_overview} alt="概要の表示" size="lg" border/>

9. **おめでとうございます！** これで最初のClickPipeを成功裏に設定できました。これはストリーミングClickPipeである場合、リモートデータソースからリアルタイムでデータを継続的に取り込み続けます。それ以外の場合は、バッチを取り込み、完了します。

## サポートされているデータソース {#supported-data-sources}

| 名前                  | ロゴ | タイプ          | ステータス   | 説明                                                                                             |
|-----------------------|------|-----------------|---------------|--------------------------------------------------------------------------------------------------|
| Amazon S3             | <S3svg class="image" alt="Amazon S3のロゴ" style={{width: '3rem', height: 'auto'}}/> | Object Storage | 安定         | オブジェクトストレージから大量のデータを取り込むためにClickPipesを構成します。                          |
| Google Cloud Storage  | <Gcssvg class="image" alt="Google Cloud Storageのロゴ" style={{width: '3rem', height: 'auto'}}/> | Object Storage | 安定         | オブジェクトストレージから大量のデータを取り込むためにClickPipesを構成します。                          |
| DigitalOcean Spaces   | <DOsvg class="image" alt="Digital Oceanのロゴ" style={{width: '3rem', height: 'auto'}}/> | Object Storage | 安定         | オブジェクトストレージから大量のデータを取り込むためにClickPipesを構成します。                          |
| Azure Blob Storage    | <ABSsvg class="image" alt="Azure Blob Storageのロゴ" style={{width: '3rem', height: 'auto'}}/> | Object Storage | 安定         | オブジェクトストレージから大量のデータを取り込むためにClickPipesを構成します。                          |

ClickPipesには、さらに接続用のコネクタが追加される予定です。詳細については[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

## サポートされているデータ形式 {#supported-data-formats}

サポートされている形式は以下の通りです：
- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## 正確に一度のセマンティクス {#exactly-once-semantics}

大規模なデータセットを取り込む際に発生するさまざまなタイプの障害があり、それが部分的な挿入や重複データを引き起こす可能性があります。Object Storage ClickPipesは挿入の失敗に強く、正確に一度のセマンティクスを提供します。これは、一時的な「ステージング」テーブルを使用して実現されます。データはまずステージングテーブルに挿入されます。この挿入で何か問題が発生した場合、ステージングテーブルはトランケートされ、クリーンな状態から挿入を再試行できます。挿入が完了し成功したときにのみ、ステージングテーブルのパーティションがターゲットテーブルに移動されます。この戦略について詳しく読むには、[このブログ投稿](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)をチェックしてください。

### ビューのサポート {#view-support}
ターゲットテーブルのMaterialized Viewもサポートされています。ClickPipesはターゲットテーブルだけでなく、依存するMaterialized Viewのためにもステージングテーブルを作成します。

非Materialized Viewのためのステージングテーブルは作成しません。これは、ターゲットテーブルに1つ以上の下流のMaterialized Viewがある場合、これらのMaterialized Viewがターゲットテーブルからのビューを通じてデータを選択しないようにすべきであることを意味します。そうしないと、Materialized View内にデータが欠落していることが判明するかもしれません。

## スケーリング {#scaling}

Object Storage ClickPipesは、[構成された垂直自動スケーリング設定](/manage/scaling#configuring-vertical-auto-scaling)によって決定される最小ClickHouseサービスサイズに基づいてスケールされます。ClickPipeのサイズは、パイプが作成されるときに決定されます。ClickHouseサービス設定に対するその後の変更は、ClickPipeのサイズには影響しません。

大規模な取り込みジョブのスループットを増加させるには、ClickPipeを作成する前にClickHouseサービスのスケーリングをお勧めします。

## 制限事項 {#limitations}
- 宛先テーブル、あるいはそのMaterialized View（カスケードMaterialized Viewを含む）やMaterialized Viewのターゲットテーブルへの変更は、一時的なエラーを引き起こし、それが再試行される可能性があります。最良の結果を得るためには、パイプを停止して必要な変更を行い、その後パイプを再起動して変更を反映させ、エラーを回避することをお勧めします。
- サポートされるビューの種類に制限があります。詳細については、[正確に一度のセマンティクス](#exactly-once-semantics)および[ビューのサポート](#view-support)に関するセクションを読んでください。
- S3 ClickPipesは、GCPまたはAzureにデプロイされたClickHouse Cloudインスタンスに対してロール認証がサポートされていません。AWS ClickHouse Cloudインスタンスにのみサポートされています。
- ClickPipesは、サイズが10GB以下のオブジェクトのみを取り込もうとします。ファイルが10GBを超える場合、ClickPipes専用のエラーテーブルにエラーが追加されます。
- 100kファイルを超えるコンテナのContinuous Ingestを持つAzure Blob Storageパイプは、新しいファイルを検出するのに約10–15秒の待機時間が発生します。ファイル数が増えると待機時間が増加します。
- Object Storage ClickPipesは、[S3テーブル関数](/sql-reference/table-functions/s3)やAzureの[AzureBlobStorageテーブル関数](/sql-reference/table-functions/azureBlobStorage)とリスティング構文を共有しません。
  - `?` — 任意の単一文字を代入
  - `*` — 空の文字列を含む、任意の数の任意の文字を代入
  - `**` — 空の文字列を含む、任意の数の任意の文字を代入

:::note
これは有効なパス（S3の場合）です：

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz

これは無効なパスです。 `{N..M}`はClickPipesではサポートされていません。

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::

## 継続的な取り込み {#continuous-ingest}
ClickPipesは、S3、GCS、Azure Blob Storage、DigitalOcean Spacesからの継続的なデータ取り込みをサポートしています。有効にすると、ClickPipesは指定されたパスからのデータを継続的に取り込み、毎秒30回の割合で新しいファイルをポーリングします。ただし、新しいファイルは、最後に取り込んだファイルよりも辞書的に大きくなければなりません。これは、それらが取り込み順序を定義する方法で名前を付けられている必要があることを意味します。たとえば、`file1`、`file2`、`file3`などと名付けられたファイルは、順次取り込まれます。`file0`のような名前の新しいファイルが追加されると、ClickPipesはそれを辞書的に最後の取り込んだファイルより大きくないため、取り込みません。

## アーカイブログ {#archive-table}
ClickPipesは、`s3_clickpipe_<clickpipe_id>_archive`という接尾辞を持つテーブルを宛先テーブルの隣に作成します。このテーブルには、ClickPipeが取り込んだすべてのファイルのリストが含まれます。このテーブルは取り込み中のファイルを追跡するために使用され、ファイルが取り込まれたかどうかを確認するためにも使用されます。アーカイブルは[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)が7日です。

:::note
これらのテーブルはClickHouse Cloud SQLコンソールを使用しては表示されず、HTTPSまたはネイティブ接続を使用して外部クライアント経由で接続する必要があります。
:::

## 認証 {#authentication}

### S3 {#s3}
公開アクセス可能なバケットと保護されたS3バケットの両方がサポートされています。

公開バケットは、ポリシーで`s3:GetObject`および`s3:ListBucket`アクションの両方を許可する必要があります。

保護されたバケットには、[IAM資格情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または[IAMロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)を使用してアクセスできます。
IAMロールを使用するには、[このガイド](/cloud/security/secure-s3)に指定のようにIAMロールを作成する必要があります。作成後に新しいIAMロールのArnをコピーし、「IAM ARNロール」としてClickPipeの設定に貼り付けます。

### GCS {#gcs}
S3と同様に、設定なしで公開バケットにアクセスでき、保護されたバケットにはAWS IAM資格情報の代わりに[HMACキー](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)を使用できます。このようなキーの設定方法については、Google Cloudの[このガイド](https://cloud.google.com/storage/docs/authentication/hmackeys)を参照してください。

GCS用のサービスアカウントは直接サポートされていません。非公開バケットと認証する際には、HMAC (IAM)資格情報を使用する必要があります。
HMAC資格情報に添付されたサービスアカウントの権限は、`storage.objects.list`および`storage.objects.get`である必要があります。

### DigitalOcean Spaces {#dospaces}
現在、DigitalOcean Spacesでは保護されたバケットのみがサポートされています。バケットとそのファイルにアクセスするには、「アクセスキー」と「シークレットキー」が必要です。アクセスキーの作成方法については、[このガイド](https://docs.digitalocean.com/products/spaces/how-to/manage-access/)を参照してください。

### Azure Blob Storage {#azureblobstorage}
現在、Azure Blob Storageでは保護されたバケットのみがサポートされています。認証は接続文字列を介して行われ、アクセスキーおよび共有キーをサポートしています。詳細については、[このガイド](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string)をお読みください。

## FAQ {#faq}

- **ClickPipesは`gs://`でプレフィックスされたGCSバケットをサポートしていますか？**

いいえ。相互運用性の理由から、`gs://`バケットプレフィックスを`https://storage.googleapis.com/`に置き換えるようお願いしています。

- **GCSの公開バケットにはどのような権限が必要ですか？**

`allUsers`には適切なロールの割り当てが必要です。`roles/storage.objectViewer`ロールはバケットレベルで付与する必要があります。このロールは`storage.objects.list`権限を提供し、ClickPipesがバケット内のすべてのオブジェクトをリストすることを許可します。これはオンボーディングと取り込みに必要です。このロールには`storage.objects.get`権限も含まれており、バケット内の個々のオブジェクトを読み取ったりダウンロードしたりするのに必要です。詳細については[Google Cloudアクセス制御](https://cloud.google.com/storage/docs/access-control/iam-roles)を参照してください。
