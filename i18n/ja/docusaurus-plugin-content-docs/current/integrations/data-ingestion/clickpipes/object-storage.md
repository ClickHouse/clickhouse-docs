---
sidebar_label: ClickPipes for Object Storage
description: ClickHouse Cloudへのオブジェクトストレージのシームレスな接続。
slug: /integrations/clickpipes/object-storage
---
import S3SVG from "../../images/logos/amazon_s3_logo.svg";
import GCSSVG from "../../images/logos/gcs.svg";

# ClickHouse Cloudとのオブジェクトストレージの統合
オブジェクトストレージのClickPipesは、Amazon S3およびGoogle Cloud StorageからClickHouse Cloudにデータを取り込むためのシンプルで耐障害性のある方法を提供します。 一回限りの取り込みと継続的な取り込みの両方が、厳密に一度だけのセマンティクスでサポートされています。

## 前提条件 {#prerequisite}
[ClickPipesのイントロ](./index.md)に目を通しておいてください。

## 最初のClickPipeを作成する {#creating-your-first-clickpipe}

1. クラウドコンソールで、左側のメニューから`Data Sources`ボタンを選択し、「ClickPipeを設定」をクリックします。

  ![選択したインポート](./images/cp_step0.png)

2. データソースを選択します。

  ![データソースのタイプを選択](./images/cp_step1.png)

3. フォームに記入し、ClickPipeに名前、説明（オプション）、IAMロールまたは資格情報、およびバケットURLを提供します。bashのようなワイルドカードを使って複数のファイルを指定することができます。詳細については、[パスでのワイルドカード使用に関するドキュメント](#limitations)を参照してください。

  ![接続詳細を記入](./images/cp_step2_object_storage.png)

4. UIは指定したバケット内のファイルのリストを表示します。データ形式を選択し（現在ClickHouse形式のサブセットのみをサポートしています）、継続的な取り込みを有効にするかどうかを選択します。[詳細は以下に](#continuous-ingest)を参照してください。

  ![データ形式とトピックを設定](./images/cp_step3_object_storage.png)

5. 次のステップでは、新しいClickHouseテーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従ってテーブル名、スキーマ、設定を変更します。サンプルテーブルで変更をリアルタイムでプレビューできます。

  ![テーブル、スキーマ、および設定を設定](./images/cp_step4a.png)

  提供されたコントロールを使用して高度な設定をカスタマイズすることもできます。

  ![高度なコントロールを設定](./images/cp_step4a3.png)

6. また、既存のClickHouseテーブルにデータを取り込むことを決定することもできます。その場合、UIはソースから選択したデスティネーションテーブル内のClickHouseフィールドへのフィールドのマッピングを許可します。

  ![既存のテーブルを使用](./images/cp_step4b.png)

:::info
`_path`や`_size`などの[仮想カラム](../../sql-reference/table-functions/s3#virtual-columns)をフィールドにマッピングすることもできます。
:::

7. 最後に、内部のClickPipesユーザーのための権限を設定できます。

  **権限:** ClickPipesは、デスティネーションテーブルにデータを書き込むための専用ユーザーを作成します。この内部ユーザーの役割をカスタムロールまたは事前定義されたロールの一つから選択できます：
    - `Full access`: クラスターへの完全なアクセス権。デスティネーションテーブルでマテリアライズドビューまたは辞書を使用する場合に必要です。
    - `Only destination table`: デスティネーションテーブルのみに`INSERT`権限があります。

  ![権限](./images/cp_step5.png)

8. 「設定を完了する」をクリックすると、システムはClickPipeを登録し、要約テーブルに表示されます。

  ![成功通知](./images/cp_success.png)

  ![削除通知](./images/cp_remove.png)

  要約テーブルは、ClickHouse内のソースまたはデスティネーションテーブルからサンプルデータを表示するための操作を提供します。

  ![デスティネーションを表示](./images/cp_destination.png)

  また、ClickPipeを削除し、取り込み作業の概要を表示するための操作も提供します。

  ![概要を表示](./images/cp_overview.png)

9. **おめでとうございます！** 最初のClickPipeが正常に設定されました。これはストリーミングClickPipeであれば、リモートデータソースからリアルタイムでデータを継続的に取り込みます。そうでなければ、バッチを取り込み、完了します。

## サポートされているデータソース {#supported-data-sources}

|名|ロゴ|タイプ|ステータス|説明|
|----|----|----|------|-----------|
|Amazon S3|<S3SVG style={{width: '3rem', height: 'auto'}} />|オブジェクトストレージ|ベータ|オブジェクトストレージから大規模なデータを取り込むためにClickPipesを設定します。|
|Google Cloud Storage|<GCSSVG style={{width: '3rem', height: 'auto'}} />|オブジェクトストレージ|ベータ|オブジェクトストレージから大規模なデータを取り込むためにClickPipesを設定します。|

より多くのコネクタがClickPipesに追加される予定です。詳細については、[お問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

## サポートされているデータフォーマット {#supported-data-formats}

サポートされているフォーマットは次の通りです：
- [JSON](../../../interfaces/formats.md/#json)
- [CSV](../../../interfaces/formats.md/#csv)
- [Parquet](../../../interfaces/formats.md/#parquet)

## 厳密に一度だけのセマンティクス {#exactly-once-semantics}

大規模なデータセットを取り込む際にさまざまなタイプの障害が発生する可能性があり、その結果、部分的な挿入や重複データが発生することがあります。オブジェクトストレージのClickPipesは、挿入の失敗に対して耐障害性があり、厳密に一度だけのセマンティクスを提供します。これは一時的な「ステージング」テーブルを使用することで実現されます。データは最初にステージングテーブルに挿入されます。この挿入に問題が発生した場合、ステージングテーブルをトランケートし、クリーンな状態から挿入を再試行できます。挿入が完了して成功したときのみ、ステージングテーブルのパーティションがターゲットテーブルに移動されます。この戦略について詳しくは、[このブログ記事](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)を参照してください。

### ビューサポート {#view-support}
ターゲットテーブル上のマテリアライズドビューもサポートされています。ClickPipesはターゲットテーブルだけでなく、依存するマテリアライズドビューのためにもステージングテーブルを作成します。

非マテリアライズドビューについてはステージングテーブルを作成しません。つまり、下流のマテリアライズドビューの1つ以上があるターゲットテーブルがある場合、それらのマテリアライズドビューはターゲットテーブルのビューを介してデータを選択することを避けるべきです。そうでない場合、マテリアライズドビューにデータが欠落することがあるかもしれません。

## スケーリング {#scaling}

オブジェクトストレージのClickPipesは、[構成された垂直自動スケーリング設定](/manage/scaling#configuring-vertical-auto-scaling)によって決定される最小のClickHouseサービスサイズに基づいてスケールされます。ClickPipeのサイズは、パイプが作成されるときに決定されます。その後のClickHouseサービスの設定の変更は、ClickPipeのサイズに影響を与えません。

大規模な取り込み作業のスループットを増やすために、ClickPipeを作成する前にClickHouseサービスをスケールすることをお勧めします。

## 制限事項 {#limitations}
- デスティネーションテーブル、マテリアライズドビュー（カスケードマテリアライズドビューを含む）、またはマテリアライズドビューのターゲットテーブルに対する変更は、パイプによって自動的に検出されず、エラーを引き起こす可能性があります。パイプを停止し、必要な変更を行ってから、パイプを再起動することで変更が検出され、再試行によるエラーおよび重複データを回避できます。
- サポートされているビューのタイプには制限があります。詳細については、[厳密に一度だけのセマンティクス](#exactly-once-semantics)および[ビューサポート](#view-support)に関するセクションをお読みください。
- GCPまたはAzureにデプロイされたClickHouse Cloudインスタンス用のS3 ClickPipesにはロール認証が利用できません。これはAWS ClickHouse Cloudインスタンスにのみサポートされています。
- ClickPipesは、サイズが10GB以下のオブジェクトのみを取り込もうとします。ファイルが10GBを超える場合、エラーがClickPipes専用のエラーテーブルに追加されます。
- S3 / GCS ClickPipesは、[S3テーブル関数](/sql-reference/table-functions/file#globs_in_path)とリスト構文を共有**しません**。
  - `?` — 任意の1文字を代替
  - `*` — 空の文字列を含む任意の文字の任意の数を代替
  - `**` — 空の文字列を含む任意の文字の任意の数を代替

:::note
これは有効なパスです：

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz


これは無効なパスです。`{N..M}`はClickPipesでサポートされていません。

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::

## 継続的取り込み {#continuous-ingest}
ClickPipesは、S3およびGCSからの継続的な取り込みをサポートしています。有効にすると、ClickPipesは指定されたパスから継続的にデータを取り込み、30秒ごとに新しいファイルをポーリングします。ただし、新しいファイルは最後に取り込まれたファイルよりも辞書的に大きい必要があります。つまり、取り込み順序を定義するようにファイル名を付ける必要があります。たとえば、`file1`、`file2`、`file3`などの名前のファイルは順次取り込まれます。`file0`のような名前の新しいファイルが追加されると、それは最後に取り込まれたファイルよりも辞書的に大きくないため、ClickPipesはそれを取り込みません。

## アーカイブテーブル {#archive-table}
ClickPipesは、デスティネーションテーブルの横に` s3_clickpipe_<clickpipe_id>_archive`という接尾辞を持つテーブルを作成します。このテーブルには、ClickPipeによって取り込まれたすべてのファイルのリストが含まれます。このテーブルは取り込み中のファイルを追跡するために使用され、取り込まれたファイルを検証するために使用できます。アーカイブテーブルには、[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)が7日間設定されています。

:::note
これらのテーブルはClickHouse Cloud SQLコンソールでは表示されず、外部クライアントを介してHTTPSまたはネイティブ接続を使用して接続して読み取る必要があります。
:::

## 認証 {#authentication}

### S3 {#s3}
公開バケットには構成なしでアクセスでき、保護されたバケットには[IAM資格情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または[IAMロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)を使用できます。データにアクセスするために必要な権限を理解するには、[このガイド]( /cloud/security/secure-s3)を参照してください。

### GCS {#gcs}
S3と同様に、公開バケットには構成なしでアクセスでき、保護されたバケットにはAWS IAM資格情報の代わりに[HMACキー](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)を使用できます。こうしたキーを設定する方法については、Google Cloudの[このガイド](https://cloud.google.com/storage/docs/authentication/hmackeys)をお読みください。

GCSのサービスアカウントは直接サポートされていません。非公開バケットで認証するときはHMAC（IAM）資格情報を使用する必要があります。HMAC資格情報に関連付けられたサービスアカウントの権限は`storage.objects.list`および`storage.objects.get`であるべきです。

## よくある質問 {#faq}

- **ClickPipesは`gs://`でプレフィックスされたGCSバケットをサポートしていますか？**

サポートしていません。相互運用性の理由から、`gs://`バケットプレフィックスを`https://storage.googleapis.com/`に置き換えるようにお願いします。

- **GCS公開バケットにはどのような権限が必要ですか？**

`allUsers`には適切な役割の割り当てが必要です。バケットレベルで`roles/storage.objectViewer`役割を付与する必要があります。この役割は、ClickPipesがバケット内のすべてのオブジェクトをリストするために必要な`storage.objects.list`権限を提供します。この役割には、バケット内の個々のオブジェクトを読み取るまたはダウンロードするために必要な`storage.objects.get`権限も含まれています。詳細については、[Google Cloudアクセス制御](https://cloud.google.com/storage/docs/access-control/iam-roles)をご覧ください。
