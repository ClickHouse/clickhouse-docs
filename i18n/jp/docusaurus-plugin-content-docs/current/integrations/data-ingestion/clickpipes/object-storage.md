---
sidebar_label: オブジェクトストレージ向け ClickPipes
description: オブジェクトストレージを ClickHouse Cloud にシームレスに接続します。
slug: /integrations/clickpipes/object-storage
---
import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
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


# ClickHouse Cloud とオブジェクトストレージの統合
オブジェクトストレージ ClickPipes は、Amazon S3 と Google Cloud Storage から ClickHouse Cloud へのデータを簡単かつ堅牢に取り込む方法を提供します。一時的な取り込みと継続的な取り込みの両方がサポートされており、正確に一度のみのセマンティクスが保証されます。

## 前提条件 {#prerequisite}
[ClickPipes の紹介](./index.md)に目を通しておいてください。

## 最初の ClickPipe を作成します {#creating-your-first-clickpipe}

1. クラウドコンソールで、左側のメニューから `Data Sources` ボタンを選択し、「ClickPipe を設定」をクリックします。

<img src={cp_step0} alt="インポートの選択" />

2. データソースを選択します。

<img src={cp_step1} alt="データソースの種類を選択" />

3. ClickPipe に名前、説明（オプション）、IAM ロールまたは資格情報、バケット URL を提供してフォームに記入します。bash ライクなワイルドカードを使用して複数のファイルを指定できます。詳細については、[パスでのワイルドカード使用に関するドキュメンテーションを参照してください](#limitations)。

<img src={cp_step2_object_storage} alt="接続詳細の入力" />

4. UI には指定したバケット内のファイルのリストが表示されます。データ形式を選択します（現在、ClickHouse 形式のサブセットをサポートしています）し、継続的な取り込みを有効にするかどうかを選択します。[詳細はこちら](#continuous-ingest)。

<img src={cp_step3_object_storage} alt="データ形式とトピックの設定" />

5. 次のステップでは、データを新しい ClickHouse テーブルに取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従って、テーブル名、スキーマ、および設定を変更します。サンプルテーブルの上部で変更内容のリアルタイムプレビューを確認できます。

<img src={cp_step4a} alt="テーブル、スキーマ、および設定の設定" />

  提供されたコントロールを使用して、詳細設定をカスタマイズすることもできます。

<img src={cp_step4a3} alt="詳細設定の設定" />

6. または、既存の ClickHouse テーブルにデータを取り込むこともできます。その場合、UI は、ソースのフィールドを選択した宛先テーブルの ClickHouse フィールドにマッピングできるようにします。

<img src={cp_step4b} alt="既存のテーブルを使用" />

:::info
`_path` や `_size` など、[仮想カラム](../../sql-reference/table-functions/s3#virtual-columns)をフィールドにマッピングすることもできます。
:::

7. 最後に、内部 ClickPipes ユーザーの権限を設定できます。

  **権限:** ClickPipes は、宛先テーブルにデータを書き込むための専用ユーザーを作成します。この内部ユーザーには、カスタムロールまたは次のいずれかの事前定義されたロールからロールを選択できます：
    - `フルアクセス`: クラスターへのフルアクセス。宛先テーブルで Materialized View または Dictionary を使用する場合に必要です。
    - `宛先テーブルのみ`: 宛先テーブルに対する `INSERT` 権限のみ。

<img src={cp_step5} alt="権限" />

8. 「セットアップの完了」をクリックすることで、システムは ClickPipe を登録し、要約テーブルに表示されるようになります。

<img src={cp_success} alt="成功通知" />

<img src={cp_remove} alt="削除通知" />

  要約テーブルには、ClickHouse のソースまたは宛先テーブルのサンプルデータを表示するためのコントロールが提供されます。

<img src={cp_destination} alt="宛先の表示" />

  また、ClickPipe を削除するためのコントロールや取り込みジョブの概要を表示するためのコントロールもあります。

<img src={cp_overview} alt="概要の表示" />

9. **おめでとうございます！** 最初の ClickPipe の設定が完了しました。これがストリーミング ClickPipe である場合、リモートデータソースからのデータをリアルタイムに継続的に取り込むことになります。それ以外の場合は、バッチを取り込み、完了します。

## サポートされているデータソース {#supported-data-sources}

| 名称                   | ロゴ | 类型           | ステータス          | 説明                                                                                           |
|------------------------|------|----------------|---------------------|-----------------------------------------------------------------------------------------------|
| Amazon S3              |<S3svg class="image" alt="Amazon S3 ロゴ" style={{width: '3rem', height: 'auto'}}/>|オブジェクトストレージ | 安定             | オブジェクトストレージから大量のデータを取り込むために ClickPipes を構成します。                      |
| Google Cloud Storage    |<Gcssvg class="image" alt="Google Cloud Storage ロゴ" style={{width: '3rem', height: 'auto'}}/>|オブジェクトストレージ | 安定             | オブジェクトストレージから大量のデータを取り込むために ClickPipes を構成します。                      |

より多くのコネクタが ClickPipes に追加される予定です。詳しくは、[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes) にアクセスしてください。

## サポートされているデータ形式 {#supported-data-formats}

サポートされている形式は以下の通りです：
- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [Parquet](/interfaces/formats/Parquet)

## 正確に一度のみのセマンティクス {#exactly-once-semantics}

大規模データセットの取り込み中にさまざまな失敗が発生する可能性があり、これにより部分的な挿入や重複データが発生することがあります。オブジェクトストレージ ClickPipes は、挿入失敗に対して堅牢で、正確に一度のみのセマンティクスを提供します。これは、一時的な「ステージング」テーブルを使用することで実現されます。データは最初にステージングテーブルに挿入されます。この挿入に何らかの問題が発生した場合、ステージングテーブルをトランクすることができ、クリーンな状態から挿入を再試行できます。挿入が完了し、成功した場合にのみ、ステージングテーブルのパーティションがターゲットテーブルに移動されます。この戦略の詳細については、[こちらのブログ投稿](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)をご覧ください。

### ビューサポート {#view-support}
ターゲットテーブル上でのマテリアライズドビューもサポートされています。ClickPipes は、ターゲットテーブルだけでなく、依存するマテリアライズドビューのためにもステージングテーブルを作成します。

非マテリアライズドビュー用のステージングテーブルは作成しません。つまり、ターゲットテーブルに 1 つ以上の下流のマテリアライズドビューがある場合、これらのマテリアライズドビューはターゲットテーブルからのビューを介してデータを選択しないようにしてください。そうしないと、マテリアライズドビュー内のデータが欠落する可能性があります。

## スケーリング {#scaling}

オブジェクトストレージ ClickPipes のスケーリングは、[構成された垂直オートスケーリング設定](/manage/scaling#configuring-vertical-auto-scaling) によって決定される最小 ClickHouse サービスサイズに基づいて行われます。ClickPipe のサイズは、パイプが作成されたときに決定されます。ClickHouse サービス設定の後続の変更は、ClickPipe サイズに影響を及ぼしません。

大規模な取り込みジョブでスループットを増加させるには、ClickPipe を作成する前に ClickHouse サービスをスケールアップすることをお勧めします。

## 制限事項 {#limitations}
- 宛先テーブル、マテリアライズドビュー（カスケードマテリアライズドビューを含む）、またはマテリアライズドビューのターゲットテーブルに対する変更は、自動的にパイプによって反映されず、エラーを引き起こす可能性があります。パイプを停止し、必要な変更を加えた後、エラーや重複データの発生を避けるためにパイプを再起動する必要があります。
- サポートされているビュ―の種類には制限があります。詳細については、[正確に一度のみのセマンティクス](#exactly-once-semantics) および [ビューサポート](#view-support) のセクションをお読みください。
- S3 ClickPipes のロール認証は、GCP または Azure にデプロイされた ClickHouse Cloud インスタンスでは利用できません。これは、AWS ClickHouse Cloud インスタンスのみでサポートされます。
- ClickPipes は、サイズが 10GB またはそれ以下のオブジェクトの取り込みを試みます。10GB を超えるファイルがある場合、ClickPipes の専用エラーテーブルにエラーが追加されます。
- S3 / GCS ClickPipes は、[S3 テーブル関数](/sql-reference/table-functions/s3) とリスト構文を共有していません。
  - `?` — 任意の 1 文字に置き換えます。
  - `*` — 空文字を含む任意の数の任意の文字に置き換えます。
  - `**` — 空文字を含む任意の数の任意の文字に置き換えます。

:::note
これは有効なパスです：

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz


これは無効なパスです。`{N..M}` は ClickPipes ではサポートされていません。

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::

## 継続的取り込み {#continuous-ingest}
ClickPipes は、S3 と GCS の両方からの継続的な取り込みをサポートしています。これを有効にすると、ClickPipes は指定されたパスからデータを継続的に取り込み、30秒ごとに新しいファイルをポーリングします。ただし、新しいファイルは最後に取り込まれたファイルよりも辞書的に大きくなければならず、すなわち、取り込み順序を定義するように名前を付ける必要があります。たとえば、`file1`、`file2`、`file3` などと名付けられたファイルは、順次取り込まれます。`file0` という名前の新しいファイルが追加された場合、ClickPipes はそれを取り込みません。なぜなら、それは最後に取り込んだファイルよりも辞書的に大きくないからです。

## アーカイブテーブル {#archive-table}
ClickPipes は、宛先テーブルの隣に `s3_clickpipe_<clickpipe_id>_archive` という接尾辞を持つテーブルを作成します。このテーブルには、ClickPipe によって取り込まれたすべてのファイルのリストが含まれます。このテーブルは、取り込み中のファイルを追跡するために使用され、ファイルが正常に取り込まれたことを確認するためにも使用できます。アーカイブテーブルには 7 日の[有効期限 (TTL)](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)があります。

:::note
これらのテーブルは ClickHouse Cloud SQL コンソールからは表示されません。HTTPS またはネイティブコネクションを使用して外部クライアント経由で接続して読む必要があります。
:::

## 認証 {#authentication}

### S3 {#s3}
公開バケットには構成なしでアクセスできますが、保護されたバケットには [IAM 資格情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) または [IAM ロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)を使用できます。データにアクセスするために必要な権限を理解するには、[このガイドを参照してください](/cloud/security/secure-s3)。

### GCS {#gcs}
S3 と同様に、公開バケットには構成なしでアクセスできますが、保護されたバケットには AWS IAM 資格情報の代わりに [HMAC キー](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)を使用できます。非公開バケットに認証する際は、HMAC (IAM) 資格情報を使用する必要があります。HMAC 資格情報に付与されたサービスアカウントの権限は `storage.objects.list` および `storage.objects.get` である必要があります。

## F.A.Q. {#faq}

- **ClickPipes は `gs://` で始まる GCS バケットをサポートしていますか？**

いいえ。相互運用性の理由から、`gs://` バケットのプレフィックスを `https://storage.googleapis.com/` に置き換えることをお勧めします。

- **GCS 公開バケットにはどのような権限が必要ですか？**

`allUsers` には適切なロールの割り当てが必要です。`roles/storage.objectViewer` ロールはバケットレベルで付与されるべきです。このロールは、ClickPipes がオンボーディングと取り込みに必要なバケット内のすべてのオブジェクトを一覧表示できるようにする `storage.objects.list` 権限を提供します。このロールには、バケット内の個々のオブジェクトを読み取ったりダウンロードしたりするために必要な `storage.objects.get` 権限も含まれています。詳細については、[Google Cloud アクセス制御](https://cloud.google.com/storage/docs/access-control/iam-roles)を参照してください。
