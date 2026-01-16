import Image from '@theme/IdealImage';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_step2.png';
import cp_step3_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_object_storage.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';

import S3DataSource from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/amazon-s3/_1-data-source.md';
import GCSSDataSource from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/google-cloud-storage/_1-data-source.md';
import ABSDataSource from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/azure-blob-storage/_1-data-source.md';

<VerticalStepper type="numbered" headerLevel="h2">

## データソースを選択する \\{#1-select-the-data-source\\}

**1.** ClickHouse Cloud のメインナビゲーションメニューで **Data sources** を選択し、**Create ClickPipe** をクリックします。

    <Image img={cp_step0} alt="インポートを選択" size="lg" border/>

{props.provider === 's3' && <S3DataSource />}
{props.provider === 'gcs' && <GCSSDataSource />}
{props.provider === 'abs' && <ABSDataSource />}

## ClickPipe 接続をセットアップする \\{#2-setup-your-clickpipe-connection\\}

**1.** 新しい ClickPipe をセットアップするには、オブジェクトストレージサービスへの接続方法と認証方法の詳細を指定する必要があります。

{props.provider === 's3' && <S3DataSource />}
{props.provider === 'gcs' && <GCSSDataSource />}
{props.provider === 'abs' && <ABSDataSource />}

**2.** **Incoming data** をクリックします。ClickPipes が次のステップのためにバケットからメタデータを取得します。

## データフォーマットを選択する \\{#3-select-data-format\\}

UI には、指定したバケット内のファイル一覧が表示されます。
データフォーマット（現在は ClickHouse フォーマットの一部のみをサポート）と、継続的なインジェストを有効にするかどうかを選択します。
詳細については、概要ページの「continuous ingest」セクションを参照してください。

<Image img={cp_step3_object_storage} alt="データフォーマットとトピックを設定" size="lg" border/>

## テーブル、スキーマ、設定を構成する \\{#5-configure-table-schema-settings\\}

次のステップでは、新しい ClickHouse テーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。
画面上の指示に従って、テーブル名、スキーマ、および設定を変更します。
上部のサンプルテーブルで、変更内容をリアルタイムにプレビューできます。

<Image img={cp_step4a} alt="テーブル、スキーマ、および設定を構成" size="lg" border/>

また、用意されているコントロールを使用して詳細設定をカスタマイズすることもできます。

<Image img={cp_step4a3} alt="詳細コントロールを設定" size="lg" border/>

あるいは、既存の ClickHouse テーブルにデータを取り込むこともできます。
その場合、UI でソースのフィールドと、選択した宛先テーブル内の ClickHouse フィールドをマッピングできるようになります。

<Image img={cp_step4b} alt="既存のテーブルを使用" size="lg" border/>

:::info
`_path` や `_size` などの[仮想カラム](/sql-reference/table-functions/s3#virtual-columns)をフィールドにマッピングすることもできます。
:::

## 権限を構成する \\{#6-configure-permissions\\}

最後に、内部 ClickPipes ユーザー用の権限を構成します。

**Permissions:** ClickPipes は、宛先テーブルにデータを書き込む専用ユーザーを作成します。カスタムロールまたは定義済みロールのいずれかを使用して、この内部ユーザーのロールを選択できます:
- `Full access`: クラスターへのフルアクセス権を持ちます。宛先テーブルで materialized view または Dictionary を使用する場合に必要です。
- `Only destination table`: 宛先テーブルに対する `INSERT` 権限のみを持ちます。

<Image img={cp_step5} alt="権限" size="lg" border/>

## セットアップを完了する \\{#7-complete-setup\\}

"Complete Setup" をクリックすると、システムは ClickPipe を登録し、概要テーブルに表示されるようになります。

<Image img={cp_success} alt="成功通知" size="sm" border/>

<Image img={cp_remove} alt="削除通知" size="lg" border/>

概要テーブルでは、ソースまたは ClickHouse の宛先テーブルからサンプルデータを表示するためのコントロールが提供されます。

<Image img={cp_destination} alt="宛先を表示" size="lg" border/>

また、ClickPipe を削除したり、インジェストジョブの概要を表示したりするためのコントロールも用意されています。

<Image img={cp_overview} alt="概要を表示" size="lg" border/>

**おめでとうございます！** これで最初の ClickPipe のセットアップが完了しました。
この ClickPipe が継続的なインジェスト用に構成されている場合は、リモートデータソースからリアルタイムでデータを継続的にインジェストし続けます。
それ以外の場合は、バッチをインジェストして完了します。

</VerticalStepper>