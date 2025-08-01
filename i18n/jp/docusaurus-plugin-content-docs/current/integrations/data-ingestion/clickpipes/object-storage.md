---
sidebar_label: 'ClickPipes for Object Storage'
description: 'Seamlessly connect your object storage to ClickHouse Cloud.'
slug: '/integrations/clickpipes/object-storage'
title: 'Integrating Object Storage with ClickHouse Cloud'
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



# Object StorageをClickHouse Cloudと統合する
Object Storage ClickPipesは、Amazon S3、Google Cloud Storage、Azure Blob Storage、DigitalOcean SpacesからClickHouse Cloudにデータを取り込むためのシンプルで堅牢な方法を提供します。一次的および継続的な取り込みの両方がサポートされており、正確な一次のセマンティクスを実現しています。

## 前提条件 {#prerequisite}
[ClickPipesのイントロ](./index.md)に目を通していることが必要です。

## 最初のClickPipeを作成する {#creating-your-first-clickpipe}

1. クラウドコンソールで、左側のメニューから`Data Sources`ボタンを選択し、「ClickPipeの設定」をクリックします。

<Image img={cp_step0} alt="インポートの選択" size="lg" border/>

2. データソースを選択します。

<Image img={cp_step1} alt="データソースのタイプを選択" size="lg" border/>

3. ClickPipeに名前、説明（オプション）、IAMロールまたは資格情報、バケットURLを提供してフォームに記入します。bashのようなワイルドカードを使用して複数のファイルを指定できます。詳細については、[パス内のワイルドカード使用に関するドキュメント](#limitations)を参照してください。

<Image img={cp_step2_object_storage} alt="接続詳細を記入" size="lg" border/>

4. UIに指定されたバケット内のファイルのリストが表示されます。データ形式を選択し（現在はClickHouse形式のサブセットをサポートしています）、継続的な取り込みを有効にするかどうかを選択します。[詳細はこちら](#continuous-ingest)。

<Image img={cp_step3_object_storage} alt="データ形式とトピックを設定" size="lg" border/>

5. 次のステップでは、新しいClickHouseテーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従って、テーブル名、スキーマ、および設定を変更します。変更内容のリアルタイムプレビューをサンプルテーブルの上部に表示します。

<Image img={cp_step4a} alt="テーブル、スキーマ、および設定を設定" size="lg" border/>

  提供されたコントロールを使用して高度な設定もカスタマイズできます。

<Image img={cp_step4a3} alt="高度なコントロールを設定" size="lg" border/>

6. 代わりに、既存のClickHouseテーブルにデータを取り込むこともできます。その場合、UIはソースから選択した宛先テーブルのClickHouseフィールドにマッピングするフィールドを指定できます。

<Image img={cp_step4b} alt="既存のテーブルを使用" size="lg" border/>

:::info
仮想カラムをフィールドにマッピングすることもできます。[仮想カラム](../../sql-reference/table-functions/s3#virtual-columns)のように、`_path`や`_size`などの。
:::

7. 最後に、内部ClickPipesユーザーのための権限を設定できます。

  **権限：** ClickPipesはデータを宛先テーブルに書き込むための専用ユーザーを作成します。この内部ユーザーの役割をカスタム役割または以下のいずれかの事前定義された役割から選択できます：
    - `完全なアクセス`：クラスターへの完全なアクセス権を持ちます。宛先テーブルでMaterialized ViewまたはDictionaryを使用する場合に必要です。
    - `宛先テーブルのみ`：宛先テーブルに対する`INSERT`権限のみを持ちます。

<Image img={cp_step5} alt="権限" size="lg" border/>

8. 「セットアップを完了」をクリックすると、システムがClickPipeを登録し、サマリーテーブルに表示されます。

<Image img={cp_success} alt="成功通知" size="sm" border/>

<Image img={cp_remove} alt="削除通知" size="lg" border/>

  サマリーテーブルには、ClickHouse内のソースまたは宛先テーブルからサンプルデータを表示するためのコントロールが提供されます。

<Image img={cp_destination} alt="宛先の表示" size="lg" border/>

  また、ClickPipeを削除したり、取り込みジョブの概要を表示するためのコントロールもあります。

<Image img={cp_overview} alt="概要の表示" size="lg" border/>

9. **おめでとうございます！** 最初のClickPipeを設定しました。これはストリーミングClickPipeであれば、リモートデータソースからリアルタイムでデータを継続的に取り込みます。さもなければ、バッチを取り込み、完了します。

## サポートされているデータソース {#supported-data-sources}

| 名前                 |ロゴ|タイプ| ステータス          | 説明                                                                                          |
|----------------------|----|----|-----------------|------------------------------------------------------------------------------------------------------|
| Amazon S3            |<S3svg class="image" alt="Amazon S3ロゴ" style={{width: '3rem', height: 'auto'}}/>|オブジェクトストレージ| 安定          | Object Storageからの大量データを取り込むためにClickPipesを構成します。                            |
| Google Cloud Storage |<Gcssvg class="image" alt="Google Cloud Storageロゴ" style={{width: '3rem', height: 'auto'}}/>|オブジェクトストレージ| 安定          | Object Storageからの大量データを取り込むためにClickPipesを構成します。                            |
| DigitalOcean Spaces | <DOsvg class="image" alt="Digital Oceanロゴ" style={{width: '3rem', height: 'auto'}}/> | オブジェクトストレージ | 安定 | Object Storageからの大量データを取り込むためにClickPipesを構成します。                           |
| Azure Blob Storage | <ABSsvg class="image" alt="Azure Blob Storageロゴ" style={{width: '3rem', height: 'auto'}}/> | オブジェクトストレージ | プライベートベータ | Object Storageからの大量データを取り込むためにClickPipesを構成します。                           |

今後、クリックパイプに新しいコネクタが追加される予定です。詳細については[お問合せ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

## サポートされているデータフォーマット {#supported-data-formats}

サポートされているフォーマットは：
- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## 正確な一次セマンティクス {#exactly-once-semantics}

大規模データセットを取り込む際、さまざまなタイプの障害が発生する可能性があり、部分的な挿入や重複データを生じることがあります。Object Storage ClickPipesは挿入失敗に耐性があり、正確な一次セマンティクスを提供します。これは、一時的な「ステージング」テーブルを使用することで実現されます。データは最初にステージングテーブルに挿入されます。この挿入に問題が発生した場合、ステージングテーブルを切り捨てることができ、挿入をクリーンな状態から再試行できます。挿入が完了し成功したときのみ、ステージングテーブルのパーティションはターゲットテーブルに移動されます。この戦略についての詳細は、[このブログ記事](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)を確認してください。

### ビューサポート {#view-support}
ターゲットテーブルでのMaterialized Viewもサポートされています。ClickPipesはターゲットテーブルだけでなく、依存するMaterialized Viewのためにもステージングテーブルを作成します。

非Materialized Viewについてはステージングテーブルは作成されません。これは、ターゲットテーブルにダウストリームのMaterialized Viewがある場合、これらのMaterialized Viewはターゲットテーブルからのビューを介してデータを選択することを避けるべきであることを意味します。そうでない場合、Materialized Viewにデータが欠落することがあります。

## スケーリング {#scaling}

Object Storage ClickPipesは、[設定された垂直自動スケーリング設定](/manage/scaling#configuring-vertical-auto-scaling)によって決定される最小ClickHouseサービスサイズに基づいてスケールされます。ClickPipeのサイズは、パイプが作成されたときに決定されます。ClickHouseサービス設定のその後の変更は、ClickPipeサイズに影響を与えません。

大規模な取り込みジョブのスループットを増加させるために、ClickPipeを作成する前にClickHouseサービスをスケーリングすることをお勧めします。

## 制限事項 {#limitations}
- 宛先テーブル、そこにあるMaterialized View（カスケードMaterialized Viewを含む）、またはMaterialized Viewのターゲットテーブルへの変更は、自動的にはパイプに反映されず、エラーが発生する可能性があります。パイプを停止し、必要な修正を行った後、変更を反映させてエラーや重複データを避けるために再起動する必要があります。
- サポートされているビューのタイプには制限があります。[正確な一次セマンティクス](#exactly-once-semantics)および[ビューサポート](#view-support)のセクションをお読みください。
- GCPまたはAzureにデプロイされたClickHouse CloudインスタンスのS3 ClickPipesではロール認証が利用できません。これはAWSのClickHouse Cloudインスタンスでのみサポートされています。
- ClickPipesは、サイズが10GB以下のオブジェクトのみを取り込むことを試みます。ファイルが10GBを超える場合、エラーがClickPipes専用のエラーテーブルに追加されます。
- S3 / GCS ClickPipesは、[S3テーブル関数](/sql-reference/table-functions/s3)とリストシンタックスを共有しませんし、Azureは[AzureBlobStorageテーブル関数](/sql-reference/table-functions/azureBlobStorage)とも共有しません。
  - `?` — 任意の単一の文字を置き換えます。
  - `*` — 空文字列を含め、任意の数の任意の文字を置き換えます。
  - `**` — 空文字列を含め、任意の数の任意の文字を置き換えます。

:::note
これは有効なパス（S3用）です：

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz


これは無効なパスです。`{N..M}`はClickPipesではサポートされていません。

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::

## 継続的取り込み {#continuous-ingest}
ClickPipesは、S3、GCS、Azure Blob Storage、DigitalOcean Spacesからの継続的な取り込みをサポートしています。有効にすると、ClickPipesは指定されたパスからデータを継続的に取り込み、30秒ごとに新しいファイルをポーリングします。ただし、新しいファイルは最後に取り込まれたファイルよりも辞書的に大きくなければなりません。つまり、取り込みの順序を定義する方法で名前が付けられている必要があります。たとえば、`file1`、`file2`、`file3`などのファイルは順に取り込まれます。`file0`のように名前が付けられた新しいファイルが追加された場合、ClickPipesはそれを取り込まず、最後に取り込まれたファイルよりも辞書的に大きくないためです。

## アーカイブテーブル {#archive-table}
ClickPipesは、宛先テーブルの隣に`s3_clickpipe_<clickpipe_id>_archive`という接尾辞のテーブルを作成します。このテーブルは、ClickPipeによって取り込まれたすべてのファイルのリストを含みます。このテーブルは取り込み中のファイルを追跡するために使用され、ファイルが取り込まれたかどうかを確認するために使用できます。アーカイブテーブルには、[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)が7日間設定されています。

:::note
これらのテーブルはClickHouse Cloud SQLコンソールでは表示されません。HTTPSまたはネイティブ接続を使用して外部クライアントから接続して読む必要があります。
:::

## 認証 {#authentication}

### S3 {#s3}
特別な設定なしでパブリックバケットにアクセスでき、保護されたバケットには[IAM資格情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または[IAMロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)を使用できます。
IAMロールを使用するには、[このガイド](/cloud/security/secure-s3)で指定されているようにIAMロールを作成する必要があります。作成後に新しいIAMロールArnをコピーし、それをClickPipeの設定に「IAM ARNロール」として貼り付けます。

### GCS {#gcs}
S3と同様に、設定なしでパブリックバケットにアクセスでき、保護されたバケットにはAWS IAM資格情報の代わりに[HMACキー](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)を使用できます。このキーのセットアップ方法に関するGoogle Cloudの[ガイド](https://cloud.google.com/storage/docs/authentication/hmackeys)を読むことができます。

GCSのサービスアカウントは直接サポートされていません。非公開バケットで認証する際にはHMAC（IAM）資格情報を使用する必要があります。
HMAC資格情報に付属するサービスアカウントの権限は`storage.objects.list`および`storage.objects.get`である必要があります。

### DigitalOcean Spaces {#dospaces}
現在、デジタルオーシャンスペースには保護されたバケットのみがサポートされています。バケットとそのファイルにアクセスするためには、「Access Key」と「Secret Key」が必要です。アクセストークンの作成方法については、[このガイド](https://docs.digitalocean.com/products/spaces/how-to/manage-access/)をお読みください。

### Azure Blob Storage {#azureblobstorage}
現在、Azure Blob Storageでは保護されたバケットのみがサポートされています。認証は接続文字列によって行われ、アクセスキーと共有キーをサポートします。詳細については、[このガイド](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string)をお読みください。

## よくある質問 {#faq}

- **ClickPipesは`gs://`でプレフィックスされたGCSバケットをサポートしていますか？**

サポートしていません。相互運用性の理由から、`gs://`バケットプレフィックスを`https://storage.googleapis.com/`に置き換えることをお勧めします。

- **GCSのパブリックバケットにはどのような権限が必要ですか？**

`allUsers`には適切な役割の割り当てが必要です。`roles/storage.objectViewer`の役割はバケットレベルで付与される必要があります。この役割により、ClickPipesがバケット内のすべてのオブジェクトをリスト化するために必要な`storage.objects.list`権限が提供されます。この役割には、バケット内の個々のオブジェクトを読み取るまたはダウンロードするために必要な`storage.objects.get`権限も含まれています。詳細情報については、[Google Cloudのアクセス制御](https://cloud.google.com/storage/docs/access-control/iam-roles)を参照してください。
