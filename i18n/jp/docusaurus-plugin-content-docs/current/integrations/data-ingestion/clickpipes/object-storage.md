---
sidebar_label: ClickPipes for Object Storage
description: ClickHouse Cloud にオブジェクトストレージをシームレスに接続します。
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


# Object Storage を ClickHouse Cloud に統合する
Object Storage ClickPipes は、Amazon S3 および Google Cloud Storage から ClickHouse Cloud へのデータ取り込みをシンプルかつ resilient（耐障害性）に行う方法を提供します。一度限りの取り込みと継続的な取り込みの両方が、正確に一度だけのセマンティクスでサポートされています。

## 前提条件 {#prerequisite}
[ClickPipes の紹介](./index.md)に目を通しておく必要があります。

## 最初の ClickPipe を作成する {#creating-your-first-clickpipe}

1. クラウドコンソールで、左側のメニューから `Data Sources` ボタンを選択し、「ClickPipe をセットアップ」をクリックします。

<img src={cp_step0} alt="インポートを選択" />

2. データソースを選択します。

<img src={cp_step1} alt="データソースのタイプを選択" />

3. フォームに必要事項を記入します。ClickPipe に名前、説明（任意）、IAM ロールまたは認証情報、バケット URL を提供します。bash のようなワイルドカードを使用して複数のファイルを指定できます。詳細については、[パスでのワイルドカードの使用に関するドキュメント](#limitations)を参照してください。

<img src={cp_step2_object_storage} alt="接続詳細を記入" />

4. UI には指定したバケット内のファイルのリストが表示されます。データ形式を選択し（現在、ClickHouse のサブセットの形式をサポートしています）、継続的な取り込みを有効にするかどうかを選択します。[詳細は以下](#continuous-ingest)を参照してください。

<img src={cp_step3_object_storage} alt="データ形式とトピックを設定" />

5. 次のステップでは、新しい ClickHouse テーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従い、テーブル名、スキーマ、および設定を変更してください。画面上部のサンプルテーブルで変更のリアルタイムプレビューを見ることができます。

<img src={cp_step4a} alt="テーブル、スキーマ、および設定を設定" />

  提供されたコントロールを使って詳細設定をカスタマイズすることができます。

<img src={cp_step4a3} alt="詳細設定コントロールを設定" />

6. あるいは、既存の ClickHouse テーブルにデータを取り込むことも決定できます。この場合、UI は、ソースから選択した宛先テーブル内の ClickHouse フィールドにフィールドをマッピングすることを許可します。

<img src={cp_step4b} alt="既存のテーブルを使用" />

:::info
`_path` や `_size` などの[仮想カラム](../../sql-reference/table-functions/s3#virtual-columns)をフィールドにマッピングすることもできます。
:::

7. 最後に、内部 ClickPipes ユーザーの権限を設定できます。

  **権限:** ClickPipes は、宛先テーブルにデータを書くための専用ユーザーを作成します。この内部ユーザーのロールをカスタムロールか、次のいずれかの事前定義されたロールから選択できます。
    - `Full access`: クラスタへの完全なアクセス権。宛先テーブルに Materialized View または Dictionary を使用する場合に必要です。
    - `Only destination table`: 宛先テーブルのみへの `INSERT` 権限。

<img src={cp_step5} alt="権限" />

8. 「設定を完了」をクリックすると、システムはあなたの ClickPipe を登録し、サマリーテーブルに表示されるようになります。

<img src={cp_success} alt="成功通知" />

<img src={cp_remove} alt="削除通知" />

  サマリーテーブルは、ソースまたは ClickHouse の宛先テーブルからのサンプルデータを表示するためのコントロールを提供します。

<img src={cp_destination} alt="宛先を表示" />

  また、ClickPipe を削除するためのコントロールや、取り込みジョブのサマリーを表示するためのコントロールもあります。

<img src={cp_overview} alt="概要を表示" />

9. **おめでとうございます！** 最初の ClickPipe を正常に設定しました。この ClickPipe がストリーミング ClickPipe の場合、リモートデータソースからリアルタイムでデータを継続的に取り込みます。そうでない場合は、バッチを取り込み、完了します。

## サポートされているデータソース {#supported-data-sources}

| 名称                  | ロゴ | タイプ           | ステータス        | 説明                                                                                              |
|-----------------------|------|------------------|-------------------|---------------------------------------------------------------------------------------------------|
| Amazon S3             |<S3svg class="image" alt="Amazon S3 ロゴ" style={{width: '3rem', height: 'auto'}}/>|オブジェクトストレージ| 安定           | ClickPipes を構成して、オブジェクトストレージから大量のデータを取り込みます。                       |
| Google Cloud Storage  |<Gcssvg class="image" alt="Google Cloud Storage ロゴ" style={{width: '3rem', height: 'auto'}}/>|オブジェクトストレージ| 安定           | ClickPipes を構成して、オブジェクトストレージから大量のデータを取り込みます。                       |

ClickPipes には他のコネクタが追加される予定です。詳細については、[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

## サポートされているデータ形式 {#supported-data-formats}

サポートされている形式は次のとおりです：
- [JSON](../../../interfaces/formats.md/#json)
- [CSV](../../../interfaces/formats.md/#csv)
- [Parquet](../../../interfaces/formats.md/#parquet)

## 正確に一度だけのセマンティクス {#exactly-once-semantics}

大規模データセットを取り込む際には、さまざまな種類の障害が発生する可能性があり、部分的な挿入や重複データが発生することがあります。Object Storage ClickPipes は、挿入の失敗に対して耐性があり、正確に一度だけのセマンティクスを提供します。これは、一時的な「ステージング」テーブルを使用することで実現されます。データは最初にステージングテーブルに挿入されます。この挿入に何か問題が発生した場合、ステージングテーブルをトランケートし、クリーンな状態からの再試行が可能です。挿入が完了し、成功した場合のみ、ステージングテーブルのパーティションがターゲットテーブルに移動されます。この戦略について詳しくは、[こちらのブログ記事](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)を参照してください。

### ビューサポート {#view-support}
ターゲットテーブルに対する物理的なビューもサポートされています。ClickPipes は、ターゲットテーブルだけでなく、依存する物理ビューにもステージングテーブルを作成します。

非物理ビューに対してはステージングテーブルを作成しません。これにより、ターゲットテーブルに対して1つ以上のダウンストリーム物理ビューがある場合、それらの物理ビューは、ターゲットテーブルのビューを介してデータを選択することを避けるべきです。そうでないと、物理ビューのデータが欠けることがあります。

## スケーリング {#scaling}

Object Storage ClickPipes は、[構成された垂直自動スケーリング設定](/manage/scaling#configuring-vertical-auto-scaling)によって決定される最小 ClickHouse サービスサイズに基づいてスケールされます。ClickPipe のサイズは、作成時に決定されます。その後の ClickHouse サービス設定の変更は、ClickPipe のサイズに影響しません。

大規模の取り込みジョブでスループットを増加させるには、ClickPipe を作成する前に ClickHouse サービスをスケールすることをお勧めします。

## 制限事項 {#limitations}
- 宛先テーブル、その物理ビュー（カスケード物理ビューを含む）、または物理ビューのターゲットテーブルへの変更は、パイプによって自動的に適用されず、エラーが発生する可能性があります。パイプを停止し、必要な変更を行い、変更が適用され、エラーや重複データが再試行によって生じないようにするためにパイプを再起動する必要があります。
- サポートされているビューの種類について制限があります。[正確に一度だけのセマンティクス](#exactly-once-semantics)および[ビューサポート](#view-support)のセクションをお読みください。
- GCP または Azure にデプロイされた ClickHouse Cloud インスタンスの S3 ClickPipes にはロール認証がサポートされていません。これは AWS ClickHouse Cloud インスタンスでのみサポートされています。
- ClickPipes は、サイズが 10GB 以下のオブジェクトのみを取り込むことを試みます。ファイルが 10GB を超える場合、ClickPipes 専用エラーテーブルにエラーが追加されます。
- S3 / GCS ClickPipes は、[S3 テーブル関数](/sql-reference/table-functions/file#globs_in_path)と同じリスティング構文を共有しません。
  - `?` — 任意の単一文字に置き換え
  - `*` — 任意の数の任意の文字に置き換えますが、空文字列を含む
  - `**` — 任意の数の任意の文字に置き換えますが、空文字列を含む

:::note
これは有効なパスです：

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz


これは無効なパスです。 `{N..M}` は ClickPipes でサポートされていません。

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::

## 継続的取り込み {#continuous-ingest}
ClickPipes は S3 と GCS の両方からの継続的取り込みをサポートしています。これを有効にすると、ClickPipes は指定されたパスから継続的にデータを取り込み、30 秒ごとに新しいファイルをポーリングします。ただし、新しいファイルは、最後に取り込まれたファイル名よりも辞書式に大きくなければなりません。つまり、取り込み順序を定義する方法で名前を付ける必要があります。たとえば、`file1`、`file2`、`file3` などと名付けられたファイルは、順次取り込まれます。新しいファイルが `file0` のような名前で追加された場合、ClickPipes はそれを取り込みません。なぜならそれは最後に取り込まれたファイル名よりも辞書式に大きくないからです。

## アーカイバーテーブル {#archive-table}
ClickPipes は、宛先テーブルの横に `s3_clickpipe_<clickpipe_id>_archive` の接尾辞を持つテーブルを作成します。このテーブルには、ClickPipe によって取り込まれたすべてのファイルのリストが含まれます。このテーブルは、取り込み中のファイルを追跡するために使用され、ファイルが取り込まれたことを確認するために使用できます。アーカイバーテーブルの[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)は 7 日です。

:::note
これらのテーブルは、ClickHouse Cloud SQL コンソールで表示できません。外部クライアントを介して HTTPS またはネイティブ接続を使用して接続する必要があります。
:::

## 認証 {#authentication}

### S3 {#s3}
パブリックバケットへのアクセスは構成なしで可能で、保護されたバケットについては [IAM 認証情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または [IAM ロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)を使用できます。データにアクセスするために必要な権限を理解するには、[このガイド](https://cloud/security/secure-s3)を参照してください。

### GCS {#gcs}
S3 と同様に、パブリックバケットへのアクセスは構成なしで可能で、保護されたバケットでは AWS IAM 認証情報の代わりに [HMAC キー](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)を使用できます。[そのようなキーの設定方法](https://cloud.google.com/storage/docs/authentication/hmackeys)については、Google Cloud のガイドをお読みください。

GCS のサービスアカウントは直接サポートされていません。非公開バケットで認証する際には HMAC（IAM）認証情報を使用する必要があります。HMAC 認証情報に関連付けられたサービスアカウントの権限は `storage.objects.list` と `storage.objects.get` である必要があります。

## F.A.Q. {#faq}

- **ClickPipes は `gs://` でプレフィックスされた GCS バケットをサポートしていますか？**

いいえ。相互運用性の理由から、`gs://` バケットプレフィックスを `https://storage.googleapis.com/` に置き換えることをお勧めします。

- **GCS パブリックバケットにはどのような権限が必要ですか？**

`allUsers` には適切なロールの割り当てが必要です。`roles/storage.objectViewer` ロールはバケットレベルで付与されなければなりません。このロールは、ClickPipes がバケット内のすべてのオブジェクトを一覧表示するために必要な `storage.objects.list` 権限を提供します。また、このロールにはバケット内の個々のオブジェクトを読み込んだりダウンロードしたりするのに必要な `storage.objects.get` 権限も含まれています。詳細については、[Google Cloud アクセス制御](https://cloud.google.com/storage/docs/access-control/iam-roles)を参照してください。

