---
sidebar_label: 'ClickPipesによるオブジェクトストレージ'
description: 'あなたのオブジェクトストレージをClickHouse Cloudにシームレスに接続します。'
slug: /integrations/clickpipes/object-storage
title: 'ClickHouse Cloudとのオブジェクトストレージの統合'
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
Object Storage ClickPipesは、Amazon S3、Google Cloud Storage、Azure Blob Storage、およびDigitalOcean SpacesからClickHouse Cloudへのデータを取り込むためのシンプルで堅牢な方法を提供します。一回限りの取り込みと連続取り込みの両方が、正確に一度のセマンティクスでサポートされています。

## 前提条件 {#prerequisite}
[ClickPipesのイントロ](./index.md)に目を通しておきます。

## 初めてのClickPipeの作成 {#creating-your-first-clickpipe}

1. クラウドコンソールで、左側のメニューの `Data Sources` ボタンを選択し、「ClickPipeの設定」をクリックします。

<Image img={cp_step0} alt="インポートの選択" size="lg" border/>

2. データソースを選択します。

<Image img={cp_step1} alt="データソースの種類を選択" size="lg" border/>

3. フォームに、ClickPipeの名前、説明（オプション）、IAMロールまたは資格情報、およびバケットURLを入力します。bashライクなワイルドカードを使用して複数のファイルを指定することができます。詳細については、[パス内のワイルドカードの使用に関するドキュメント](#limitations)を参照してください。

<Image img={cp_step2_object_storage} alt="接続情報の入力" size="lg" border/>

4. UIは指定されたバケット内のファイルのリストを表示します。データフォーマットを選択します（現在、ClickHouseフォーマットのサブセットをサポートしています）および連続取り込みを有効にするかどうかを選択します。[詳細はこちら](#continuous-ingest)。

<Image img={cp_step3_object_storage} alt="データ形式とトピックを設定" size="lg" border/>

5. 次のステップでは、新しいClickHouseテーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。スクリーンの指示に従い、テーブル名、スキーマ、および設定を変更します。上部のサンプルテーブルで変更をリアルタイムでプレビューできます。

<Image img={cp_step4a} alt="テーブル、スキーマ、設定の設定" size="lg" border/>

  追加の設定を提供するコントロールを使って詳細設定をカスタマイズすることも可能です。

<Image img={cp_step4a3} alt="詳細設定の設定" size="lg" border/>

6. あるいは、既存のClickHouseテーブルにデータを取り込むことを選択することもできます。その場合、UIはソースから選択した宛先テーブル内のClickHouseフィールドにマップするフィールドを指定できるようにします。

<Image img={cp_step4b} alt="既存のテーブルを使用" size="lg" border/>

:::info
`_path`や`_size`などの[仮想カラム](../../sql-reference/table-functions/s3#virtual-columns)もフィールドにマップできます。
:::

7. 最後に、内部ClickPipesユーザーの権限を設定できます。

  **権限:** ClickPipesは、宛先テーブルにデータを書き込むための専用ユーザーを作成します。この内部ユーザーのロールをカスタムロールまたは次の既定のロールのいずれかから選択できます。
    - `フルアクセス`: クラスターにフルアクセスできます。宛先テーブルと共にMaterialized ViewまたはDictionaryを使用する場合に必要です。
    - `宛先テーブルのみ`: 宛先テーブルへの`INSERT`権限のみ。

<Image img={cp_step5} alt="権限" size="lg" border/>

8. 「設定の完了」をクリックすると、システムがClickPipeを登録し、サマリーテーブルに表示されるようになります。

<Image img={cp_success} alt="成功通知" size="sm" border/>

<Image img={cp_remove} alt="削除通知" size="lg" border/>

  サマリーテーブルは、ClickHouseでソースまたは宛先テーブルのサンプルデータを表示するためのコントロールを提供します。

<Image img={cp_destination} alt="宛先の表示" size="lg" border/>

  また、ClickPipeを削除し、取り込みジョブの概要を表示するためのコントロールも提供します。

<Image img={cp_overview} alt="概要の表示" size="lg" border/>

9. **おめでとうございます！** 初めてのClickPipeの設定が完了しました。これがストリーミングClickPipeであれば、リモートデータソースからリアルタイムでデータを継続的に取り込むことになります。そうでなければ、バッチを取り込み、完了します。

## サポートされるデータソース {#supported-data-sources}

| 名前                  | ロゴ | 種類          | ステータス         | 説明                                                                                      |
|----------------------|------|---------------|-------------------|---------------------------------------------------------------------------------------|
| Amazon S3            | <S3svg class="image" alt="Amazon S3ロゴ" style={{width: '3rem', height: 'auto'}}/> | オブジェクトストレージ | 安定          | ClickPipesを設定して、オブジェクトストレージから大量のデータを取り込むことができます。                          |
| Google Cloud Storage  | <Gcssvg class="image" alt="Google Cloud Storageロゴ" style={{width: '3rem', height: 'auto'}}/> | オブジェクトストレージ | 安定          | ClickPipesを設定して、オブジェクトストレージから大量のデータを取り込むことができます。                          |
| DigitalOcean Spaces   | <DOsvg class="image" alt="Digital Oceanロゴ" style={{width: '3rem', height: 'auto'}}/> | オブジェクトストレージ | 安定          | ClickPipesを設定して、オブジェクトストレージから大量のデータを取り込むことができます。                          |
| Azure Blob Storage   | <ABSsvg class="image" alt="Azure Blob Storageロゴ" style={{width: '3rem', height: 'auto'}}/> | オブジェクトストレージ | プライベートベータ | ClickPipesを設定して、オブジェクトストレージから大量のデータを取り込むことができます。                          |

さらなるコネクタがClickPipesに追加される予定です。詳細については[お問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

## サポートされるデータフォーマット {#supported-data-formats}

サポートされているフォーマットは以下の通りです：
- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## 正確に一度のセマンティクス {#exactly-once-semantics}

大規模データセットを取り込む際に様々なタイプの障害が発生し、部分的な挿入や重複データの原因となる可能性があります。Object Storage ClickPipesは挿入障害に対して堅牢で、正確に一度のセマンティクスを提供します。これは一時的な「ステージング」テーブルを使用することで実現されます。データは最初にステージングテーブルに挿入されます。この挿入に問題がある場合、ステージングテーブルを切り詰め、クリーンな状態から挿入を再試行できます。挿入が完了し成功した場合のみ、ステージングテーブル内のパーティションがターゲットテーブルに移動されます。この戦略の詳細については、[このブログ記事](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)を参照してください。

### ビューサポート {#view-support}
ターゲットテーブル上のMaterialized Viewもサポートされています。ClickPipesはターゲットテーブルだけでなく、依存するMaterialized Viewのためにもステージングテーブルを作成します。

非Materialized Viewのためのステージングテーブルは作成しません。これにより、ダウンストリームのMaterialized Viewが1つ以上あるターゲットテーブルを持つ場合、これらのMaterialized Viewはターゲットテーブルからのビューを介してデータを選択しないようにする必要があります。そうしないと、Materialized Viewにデータが欠落する可能性があります。

## スケーリング {#scaling}

Object Storage ClickPipesは、[設定された垂直自動スケーリング設定](/manage/scaling#configuring-vertical-auto-scaling)によって決定される最小のClickHouseサービスサイズに基づいてスケーリングされます。ClickPipeのサイズは、パイプが作成されたときに決定されます。その後のClickHouseサービス設定の変更は、ClickPipeサイズに影響を与えません。

大規模取り込みジョブのスループットを増やすには、ClickPipeを作成する前にClickHouseサービスをスケールアップすることをお勧めします。

## 制限事項 {#limitations}
- 宛先テーブル、そのMaterialized View（カスケードMaterialized Viewを含む）やMaterialized Viewのターゲットテーブルに対する変更は、自動的にパイプに反映されず、エラーを引き起こす可能性があります。パイプを停止し、必要な変更を加えた後、エラーや再試行による重複データを避けるためにパイプを再起動する必要があります。
- サポートされているビューの種類には制限があります。詳細については、[正確に一度のセマンティクス](#exactly-once-semantics)および[ビューサポート](#view-support)のセクションをお読みください。
- GCPやAzureにデプロイされたClickHouse CloudインスタンスのS3 ClickPipesではロール認証は利用できません。これはAWS ClickHouse Cloudインスタンスのみに対応しています。
- ClickPipesは10GB以下のサイズのオブジェクトのみを取り込もうとします。ファイルが10GBを超える場合、エラーがClickPipesの専用エラーテーブルに追加されます。
- S3 / GCS ClickPipes **は**、[S3 Table Function](/sql-reference/table-functions/s3)や、[AzureBlobStorage Table function](/sql-reference/table-functions/azureBlobStorage)とリスト構文を共有しません。
  - `?` — いずれかの単一文字と置き換え
  - `*` — 空の文字列を含む任意の文字の数と置き換え
  - `**` — 空の文字列を含む任意の文字を指定する個数と置き換え

:::note
これは有効なパス（S3)です：

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz

これは無効なパスです。`{N..M}`はClickPipesでサポートされていません。

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::

## 連続取り込み {#continuous-ingest}
ClickPipesは、S3、GCS、Azure Blob Storage、及びDigitalOcean Spacesからの連続取り込みをサポートしています。これを有効にすると、ClickPipesは指定されたパスからデータを継続的に取り込み、毎秒30回の頻度で新しいファイルをポーリングします。しかし、新しいファイルは前回の取り込まれたファイルよりも辞書式に大きくなければなりません。これにより、取り込み順が定義されます。例えば、`file1`、`file2`、`file3`などと名付けられたファイルは順次取り込まれます。`file0`のような名前の新しいファイルが追加されても、前回の取り込まれたファイルよりも辞書式に大きくないため、ClickPipesは取り込みません。

## アーカイブテーブル {#archive-table}
ClickPipesは、宛先テーブルの隣に`s3_clickpipe_<clickpipe_id>_archive`という接尾辞を持つテーブルを作成します。このテーブルには、ClickPipeによって取り込まれたすべてのファイルのリストが含まれます。このテーブルは取り込み中のファイルを追跡するために使用され、取り込まれたファイルを確認するのに役立ちます。アーカイブテーブルは、[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)が7日間です。

:::note
これらのテーブルはClickHouse Cloud SQL Consoleを使用しては表示できません。HTTPSまたはネイティブ接続を使用して外部クライアント経由で接続する必要があります。
:::

## 認証 {#authentication}

### S3 {#s3}
公開バケットには設定なしでアクセスでき、保護されたバケットには[IAM資格情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または[IAMロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)を使用できます。  
IAMロールを使用するには、[このガイド](/cloud/security/secure-s3)の指示に従ってIAMロールを作成する必要があります。作成後に新しいIAMロールArnをコピーし、ClickPipe設定に「IAM ARNロール」として貼り付けます。

### GCS {#gcs}
S3と同様に、公開バケットには設定なしでアクセスでき、保護されたバケットにはAWS IAM資格情報の代わりに[HMACキー](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)を使用できます。このようなキーの設定方法については、Google Cloudの[このガイド](https://cloud.google.com/storage/docs/authentication/hmackeys)をお読みください。

GCSのサービスアカウントは直接サポートされていません。非公開バケットに認証する際にはHMAC（IAM）資格情報を使用する必要があります。
HMAC資格情報に割り当てられたサービスアカウントの権限は`storage.objects.list`および`storage.objects.get`であるべきです。

### DigitalOcean Spaces {#dospaces}
現在、DigitalOcean Spacesでは保護されたバケットのみがサポートされています。バケットやそのファイルにアクセスするには「アクセスキー」と「シークレットキー」が必要です。アクセスキーの作成方法については[このガイド](https://docs.digitalocean.com/products/spaces/how-to/manage-access/)を参照してください。

### Azure Blob Storage {#azureblobstorage}
現在、Azure Blob Storageでは保護されたバケットのみがサポートされています。認証は接続文字列を介して行われ、アクセスキーと共有キーがサポートされます。詳細については、[このガイド](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string)をお読みください。

## よくある質問 {#faq}

- **ClickPipesは `gs://` で始まるGCSバケットをサポートしていますか？**

いいえ。互換性の理由から、`gs://`バケットプレフィックスを`https://storage.googleapis.com/`に置き換えるようにお願いします。

- **GCSの公開バケットにはどんな権限が必要ですか？**

`allUsers`には適切な役割割り当てが必要です。`roles/storage.objectViewer`の役割をバケットレベルで付与する必要があります。この役割は、ClickPipesがバケット内のすべてのオブジェクトをリストするために必要な`storage.objects.list`権限を提供します。この役割には、バケット内の個々のオブジェクトを読み取ったりダウンロードしたりするために必要な`storage.objects.get`権限も含まれています。詳細については、[Google Cloudのアクセス制御](https://cloud.google.com/storage/docs/access-control/iam-roles)をご覧ください。
