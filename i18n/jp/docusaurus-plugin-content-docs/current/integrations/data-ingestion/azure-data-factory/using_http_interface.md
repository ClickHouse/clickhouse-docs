---
sidebar_label: 'HTTP インターフェイスの使用'
slug: /integrations/azure-data-factory/http-interface
description: 'ClickHouse の HTTP インターフェイスを使用して Azure Data Factory から ClickHouse にデータを取り込む'
keywords: ['Azure Data Factory', 'Azure', 'Microsoft', 'データ', 'HTTP インターフェイス']
title: 'ClickHouse HTTP インターフェイスを使用して Azure のデータを ClickHouse に取り込む'
doc_type: 'guide'
integration:
   - support_level: 'core'
   - category: 'data_ingestion'
---

import Image from '@theme/IdealImage';

import azureHomePage                            from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-home-page.png';
import azureNewResourceAnalytics                from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-resource-analytics.png';
import azureNewDataFactory                      from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-data-factory.png';
import azureNewDataFactoryConfirm               from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-data-factory-confirm.png';
import azureNewDataFactorySuccess               from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-data-factory-success.png';
import azureHomeWithDataFactory                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-home-with-data-factory.png';
import azureDataFactoryPage                     from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-factory-page.png';
import adfCreateLinkedServiceButton             from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-create-linked-service-button.png';
import adfNewLinkedServiceSearch                from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-search.png';
import adfNewLinedServicePane                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-lined-service-pane.png';
import adfNewLinkedServiceBaseUrlEmpty          from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-base-url-empty.png';
import adfNewLinkedServiceParams                from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-params.png';
import adfNewLinkedServiceExpressionFieldFilled from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-expression-field-filled.png';
import adfNewLinkedServiceCheckConnection       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-check-connection.png';
import adfLinkedServicesList                    from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-linked-services-list.png';
import adfNewDatasetItem                        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-item.png';
import adfNewDatasetPage                        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-page.png';
import adfNewDatasetProperties                  from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-properties.png';
import adfNewDatasetQuery                       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-query.png';
import adfNewDatasetConnectionSuccessful        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-connection-successful.png';
import adfNewPipelineItem                       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-pipeline-item.png';
import adfNewCopyDataItem                       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-copy-data-item.png';
import adfCopyDataSource                        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-copy-data-source.png';
import adfCopyDataSinkSelectPost                from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-copy-data-sink-select-post.png';
import adfCopyDataDebugSuccess                  from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-copy-data-debug-success.png';

# Azure Data Factory で ClickHouse HTTP インターフェイスを使用する \{#using-clickhouse-http-interface-in-azure-data-factory\}

[`azureBlobStorage` Table Function](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
は、Azure Blob Storage から ClickHouse にデータを取り込むための、高速かつ便利な方法です。
ただし、次のような理由から、常に適切とは限りません。

- データが Azure Blob Storage に保存されていない可能性があります。たとえば、Azure SQL Database、Microsoft SQL Server、Cosmos DB に保存されている場合があります。
- セキュリティポリシーにより、Blob Storage への外部アクセスが完全に禁止されている場合があります（たとえば、ストレージアカウントがパブリックエンドポイントなしでロックダウンされている場合）。

このようなシナリオでは、Azure Data Factory と
[ClickHouse HTTP interface](https://clickhouse.com/docs/interfaces/http)
を組み合わせて使用し、Azure の各種サービスから ClickHouse へデータを送信できます。

この方法ではデータフローの向きが逆転します。ClickHouse が Azure からデータをプルする代わりに、
Azure Data Factory が ClickHouse にデータをプッシュします。このアプローチでは、
一般的に ClickHouse インスタンスがパブリックインターネットから到達可能である必要があります。

:::info
Azure Data Factory の Self-hosted Integration Runtime を使用することで、
ClickHouse インスタンスをインターネットに公開せずに済ませることも可能です。
この構成により、プライベートネットワーク経由でデータを送信できます。
ただし、この内容は本記事の範囲外です。詳細については公式ガイドを参照してください:
[Create and configure a self-hosted integration
runtime](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::

## ClickHouse を REST サービスとして利用する \{#turning-clickhouse-to-a-rest-service\}

Azure Data Factory は、JSON 形式で HTTP 経由により外部システムへデータを送信することをサポートしています。この機能を利用して、[ClickHouse HTTP interface](https://clickhouse.com/docs/interfaces/http) を用い、データを直接 ClickHouse に挿入できます。
詳細については、[ClickHouse HTTP Interface documentation](https://clickhouse.com/docs/interfaces/http) を参照してください。

この例では、送信先テーブルを指定し、入力データ形式を JSON と定義し、タイムスタンプの解析をより柔軟に行えるようにするためのオプションを含めるだけで十分です。

```sql
INSERT INTO my_table
SETTINGS 
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

このクエリを HTTP リクエストの一部として送信するには、URL エンコードした文字列として ClickHouse エンドポイントの `query` パラメータに渡すだけです。

```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factory は、組み込みの `encodeUriComponent` 関数を使ってこのエンコードを自動的に処理できるため、自分でエンコード処理を行う必要はありません。
:::

これで、この URL に JSON 形式のデータを送信できるようになりました。データは、対象テーブルの構造と一致している必要があります。3 つのカラム `col_1`、`col_2`、`col_3` を持つテーブルを想定した、curl を使った簡単な例を次に示します。

```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

JSON オブジェクトの配列や、JSON Lines（改行区切りの JSON オブジェクト）を送信することもできます。Azure Data Factory は JSON 配列形式を使用しており、これは ClickHouse の `JSONEachRow` 入力で問題なく利用できます。

ご覧のとおり、このステップでは ClickHouse 側で特別なことを行う必要はありません。HTTP インターフェイスが、REST 風エンドポイントとして動作するために必要なすべてをすでに提供しており、追加の設定は不要です。

ClickHouse を REST エンドポイントのように動作させられたので、次は Azure Data Factory を ClickHouse を利用するように構成します。

次のステップでは、Azure Data Factory インスタンスを作成し、ClickHouse インスタンスへの Linked Service を設定し、
[REST sink](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest) 用の Dataset を定義し、
Azure から ClickHouse へデータを送信する Copy Data アクティビティを作成します。


## Azure Data Factory インスタンスの作成 \{#create-an-azure-data-factory-instance\}

このガイドでは、Microsoft Azure アカウントにアクセスでき、すでにサブスクリプションとリソース グループが設定済みであることを前提とします。すでに Azure Data Factory を構成済みの場合は、この手順は省略し、既存のサービスを使用して次のステップに進んで構いません。

1. [Microsoft Azure Portal](https://portal.azure.com/) にログインし、**Create a resource** をクリックします。
   <Image img={azureHomePage} size="lg" alt="Azure Portal ホーム ページ" border/>

2. 左側の Categories ペインで **Analytics** を選択し、人気のサービスの一覧から **Data Factory** をクリックします。
   <Image img={azureNewResourceAnalytics} size="lg" alt="Azure Portal 新規リソース" border/>

3. サブスクリプションとリソース グループを選択し、新しい Data Factory インスタンスの名前を入力し、リージョンを選択して、バージョンは V2 のままにします。
   <Image img={azureNewDataFactory} size="lg" alt="Azure Portal 新規 Data Factory" border/>

3. **Review + Create** をクリックし、その後 **Create** をクリックしてデプロイを開始します。
   <Image img={azureNewDataFactoryConfirm} size="lg" alt="Azure Portal 新規 Data Factory 確認" border/>

   <Image img={azureNewDataFactorySuccess} size="lg" alt="Azure Portal 新規 Data Factory 成功" border/>

デプロイが正常に完了したら、新しい Azure Data Factory インスタンスの利用を開始できます。

## 新しい REST ベースのリンク サービスを作成する \{#-creating-new-rest-based-linked-service\}

1. Microsoft Azure ポータルにログインし、Data Factory インスタンスを開きます。
   <Image img={azureHomeWithDataFactory} size="lg" alt="Data Factory が表示されている Azure ポータルのホーム ページ" border/>

2. Data Factory の概要ページで、**Launch Studio** をクリックします。
   <Image img={azureDataFactoryPage} size="lg" alt="Azure ポータルの Data Factory ページ" border/>

3. 左側のメニューで **Manage** を選択し、**Linked services** に移動して、
   新しいリンク サービスを作成するには **+ New** をクリックします。
   <Image img={adfCreateLinkedServiceButton} size="lg" alt="Azure Data Factory の新しい Linked Service ボタン" border/>

4. **New linked service** の検索バーに **REST** と入力し、**REST** を選択して **Continue** をクリックし、
   [REST コネクタ](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)
   インスタンスを作成します。
   <Image img={adfNewLinkedServiceSearch} size="lg" alt="Azure Data Factory の New Linked Service 検索" border/>

5. linked service の構成ペインで、新しいサービスの名前を入力し、
   **Base URL** フィールドをクリックしてから **Add dynamic content** をクリックします
   （このリンクはフィールドを選択したときのみ表示されます）。
   <Image img={adfNewLinedServicePane} size="lg" alt="新しい Linked Service ペイン" border/>

6. dynamic content ペインではパラメーター化された URL を作成できます。
   これにより、異なるテーブル用のデータセットを作成するときにクエリを後から定義でき、
   linked service を再利用できるようになります。
   <Image img={adfNewLinkedServiceBaseUrlEmpty} size="lg" alt="新しい Linked Service の Base URL（空）" border/>

7. フィルター入力欄の横にある **"+"** をクリックして新しいパラメーターを追加し、
   名前を `pQuery`、型を String、既定値を `SELECT 1` に設定します。
   **Save** をクリックします。
   <Image img={adfNewLinkedServiceParams} size="lg" alt="新しい Linked Service のパラメーター" border/>

8. expression フィールドに次を入力し、**OK** をクリックします。
   `your-clickhouse-url.com` を、実際の ClickHouse インスタンスのアドレスに置き換えます。
   ```text
   @{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
   ```
   <Image img={adfNewLinkedServiceExpressionFieldFilled} size="lg" alt="新しい Linked Service の Expression フィールド（入力済み）" border/>

9. メイン フォームに戻り、Basic authentication を選択し、
   ClickHouse の HTTP インターフェイスへの接続に使用するユーザー名とパスワードを入力して、
   **Test connection** をクリックします。すべて正しく構成されていれば、
   成功メッセージが表示されます。
   <Image img={adfNewLinkedServiceCheckConnection} size="lg" alt="新しい Linked Service の接続テスト" border/>

10. **Create** をクリックしてセットアップを完了します。
    <Image img={adfLinkedServicesList} size="lg" alt="Linked Services の一覧" border/>

これで、新しく登録した REST ベースのリンク サービスが一覧に表示されます。

## ClickHouse HTTP インターフェイス用の新しいデータセットを作成する \{#creating-a-new-dataset-for-the-clickhouse-http-interface\}

ClickHouse HTTP インターフェイス用のリンク済みサービスの設定が完了したので、
Azure Data Factory から ClickHouse にデータを送信するために使用する
データセットを作成します。

この例では、[Environmental Sensors
Data](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors) の一部のみを挿入します。

1. 任意の ClickHouse クエリコンソールを開きます。これは
   ClickHouse Cloud の Web UI、CLI クライアント、またはクエリ実行に使用している
   他の任意のインターフェイスでも構いません。次に、対象テーブルを作成します。
   ```sql
   CREATE TABLE sensors
   (
       sensor_id UInt16,
       lat Float32,
       lon Float32,
       timestamp DateTime,
       temperature Float32
   )
   ENGINE = MergeTree
   ORDER BY (timestamp, sensor_id);
   ```

2. Azure Data Factory Studio で、左ペインから Author を選択します。
   Dataset 項目にカーソルを合わせて三点リーダーアイコンをクリックし、New dataset を選択します。
   <Image img={adfNewDatasetItem} size="lg" alt="新規データセット項目" border/>

3. 検索バーに **REST** と入力し、**REST** を選択して **Continue** をクリックします。
   データセット名を入力し、前の手順で作成した **linked service** を選択します。
   **OK** をクリックしてデータセットを作成します。
   <Image img={adfNewDatasetPage} size="lg" alt="新規データセットページ" border/>

4. 左側の Factory Resources ペインの Datasets セクションに、新しく作成した
   データセットが表示されているはずです。データセットを選択して
   プロパティを開きます。リンク済みサービスで定義した `pQuery` パラメータが表示されます。
   **Value** テキストフィールドをクリックし、続いて **Add dynamic**
   content をクリックします。
   <Image img={adfNewDatasetProperties} size="lg" alt="新規データセットのプロパティ" border/>

5. 開いたペインに、次のクエリを貼り付けます。
   ```sql
   INSERT INTO sensors
   SETTINGS 
       date_time_input_format=''best_effort'', 
       input_format_json_read_objects_as_strings=1 
   FORMAT JSONEachRow
   ```

   :::danger
   クエリ内のすべてのシングルクォート `'` は、シングルクォート 2 つ
   `''` に置き換える必要があります。これは Azure Data Factory の式パーサーの要件です。
   エスケープしない場合、すぐにエラーが表示されない可能性がありますが、
   データセットを使用または保存しようとしたときに後で失敗します。
   たとえば、`'best_effort'` は `''best_effort''` と記述する必要があります。
   :::

   <Image img={adfNewDatasetQuery} size="xl" alt="新規データセットクエリ" border/>

6. OK をクリックして式を保存します。次に Test connection をクリックします。
   すべてが正しく構成されていれば、Connection successful というメッセージが表示されます。
   画面上部の Publish all をクリックして変更内容を保存します。
   <Image img={adfNewDatasetConnectionSuccessful} size="xl" alt="新規データセット接続成功" border/>

### サンプルデータセットのセットアップ \{#setting-up-an-example-dataset\}

この例では、Environmental Sensors Dataset 全体ではなく、
[Sensors Dataset Sample](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv)
として提供されている小さなサブセットのみを使用します。

:::info
本ガイドの焦点を絞るため、Azure Data Factory で
ソースデータセットを作成するための詳細な手順は扱いません。
サンプルデータは任意のストレージサービスにアップロードできます。
たとえば Azure Blob Storage、Microsoft SQL Server、あるいは
Azure Data Factory がサポートしている別のファイル形式などです。
:::

データセットを Azure Blob Storage（または他のお好みのストレージサービス）にアップロードします。
その後、Azure Data Factory Studio で Factory Resources ペインを開きます。
アップロードしたデータを参照する新しいデータセットを作成します。
最後に Publish all をクリックして変更内容を保存します。

## ClickHouse へデータを転送する Copy アクティビティの作成 \{#creating-the-copy-activity-to-transfer-data-to-clickhouse\}

入力データセットと出力データセットの両方の設定が完了したので、サンプルデータセットから ClickHouse の `sensors` テーブルへデータを転送する **Copy Data** アクティビティを作成します。

1. **Azure Data Factory Studio** を開き、**Author タブ** に移動します。**Factory Resources** ペインで **Pipeline** の上にマウスカーソルを合わせ、三点リーダーのアイコンをクリックして **New pipeline** を選択します。
   <Image img={adfNewPipelineItem} size="lg" alt="ADF 新規パイプライン項目" border/>

2. **Activities** ペインで **Move and transform** セクションを展開し、**Copy data** アクティビティをキャンバス上にドラッグ＆ドロップします。
   <Image img={adfNewCopyDataItem} size="lg" alt="新規 Copy Data 項目" border/>

3. **Source** タブを選択し、先ほど作成したソースデータセットを選択します。
   <Image img={adfCopyDataSource} size="lg" alt="Copy Data ソース" border/>

4. **Sink** タブに移動し、sensors テーブル用に作成した ClickHouse データセットを選択します。**Request method** を POST に設定します。**HTTP compression type** が **None** に設定されていることを確認します。
   :::warning
   Azure Data Factory の Copy Data アクティビティでは HTTP 圧縮が正しく動作しません。有効化すると、Azure は 0 バイトのみからなるペイロードを送信します — サービスのバグと思われます。必ず圧縮は無効のままにしておいてください。
   :::
   :::info
   デフォルトのバッチサイズ 10,000 を維持するか、さらに増やすことを推奨します。詳細については、
   [Selecting an Insert Strategy / Batch inserts if synchronous](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)
   を参照してください。
   :::
   <Image img={adfCopyDataSinkSelectPost} size="lg" alt="Copy Data Sink で POST を選択" border/>

5. キャンバス上部の **Debug** をクリックしてパイプラインを実行します。しばらく待つと、アクティビティがキューに入り実行されます。すべて正しく構成されていれば、タスクは **Success** ステータスで完了します。
   <Image img={adfCopyDataDebugSuccess} size="lg" alt="Copy Data デバッグ成功" border/>

6. 完了したら、**Publish all** をクリックして、パイプラインおよびデータセットの変更を保存します。

## 追加リソース \{#additional-resources-1\}

- [HTTP インターフェイス](https://clickhouse.com/docs/interfaces/http)
- [Azure Data Factory を使用して REST エンドポイントとの間でデータをコピーおよび変換する](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [挿入戦略の選択](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [セルフホスト型 Integration Runtime の作成と構成](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)