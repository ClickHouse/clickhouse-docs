---
'sidebar_label': 'HTTP インターフェースの利用'
'slug': '/integrations/azure-data-factory/http-interface'
'description': 'ClickHouse の HTTP インターフェースを使って Azure Data Factory から ClickHouse にデータを取り込む'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
- 'http interface'
'title': 'Using ClickHouse HTTP インターフェースを利用して Azure データを ClickHouse に取り込む'
'doc_type': 'guide'
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



# ClickHouseのHTTPインターフェースをAzure Data Factoryで使用する {#using-clickhouse-http-interface-in-azure-data-factory}

[`azureBlobStorage` テーブル関数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
は、Azure Blob StorageからClickHouseにデータを取り込むための迅速で便利な方法です。しかし、以下の理由から常に適しているわけではありません。

- あなたのデータがAzure Blob Storageに保存されていない場合 — 例えば、Azure SQL Database、Microsoft SQL Server、またはCosmos DBなどに保存されている可能性があります。
- セキュリティポリシーがBlob Storageへの外部アクセスを完全に防止している可能性がある — 例えば、ストレージアカウントがロックダウンされていて、公開エンドポイントがない場合などです。

そのようなシナリオでは、Azure Data Factoryを使用して
[ClickHouse HTTPインターフェース](https://clickhouse.com/docs/interfaces/http)
でAzureサービスからClickHouseにデータを送信できます。

この方法はフローを逆転させます: ClickHouseがAzureからデータを引き出すのではなく、Azure Data FactoryがデータをClickHouseにプッシュします。このアプローチは通常、あなたのClickHouseインスタンスがインターネットからアクセス可能であることを必要とします。

:::info
Azure Data Factoryのセルフホステッドインテグレーションランタイムを使用することで、ClickHouseインスタンスをインターネットに露出させることを避けることが可能です。この設定により、プライベートネットワーク経由でデータを送信できます。ただし、この記事の範囲を超えています。より詳しい情報は公式ガイドでご覧いただけます:
[セルフホステッドインテグレーションランタイムの作成と設定](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::

## ClickHouseをRESTサービスに変える {#turning-clickhouse-to-a-rest-service}

Azure Data FactoryはJSON形式でHTTPを介して外部システムにデータを送信することをサポートしています。この機能を使用して、[ClickHouse HTTPインターフェース](https://clickhouse.com/docs/interfaces/http)を介して直接ClickHouseにデータを挿入できます。詳細は[ClickHouse HTTPインターフェースドキュメント](https://clickhouse.com/docs/interfaces/http)を参照してください。

この例では、宛先テーブルを指定し、入力データ形式をJSONとして定義し、より柔軟なタイムスタンプ解析を可能にするオプションを含めるだけで済みます。

```sql
INSERT INTO my_table
SETTINGS 
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

このクエリをHTTPリクエストの一部として送信するには、クリックハウスエンドポイントのクエリパラメータにURLエンコードされた文字列として渡すだけです:
```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factoryは、組み込みの`encodeUriComponent`関数を使用してこのエンコーディングを自動的に処理できるため、手動で行う必要はありません。
:::

これで、JSON形式のデータをこのURLに送信できます。データはターゲットテーブルの構造に一致する必要があります。以下は、3つのカラム `col_1`、`col_2`、`col_3` を持つテーブルを想定したcurlを使用したシンプルな例です。
```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

また、オブジェクトのJSON配列またはJSON Lines（改行区切りのJSONオブジェクト）を送信することもできます。Azure Data FactoryはJSON配列形式を使用し、ClickHouseの`JSONEachRow`入力と完全に互換性があります。

このステップでは、ClickHouse側で特別な作業を行う必要はありません。HTTPインターフェースはRESTのようなエンドポイントとして機能するために必要なものをすでに提供しています — 追加の設定は不要です。

ClickHouseがRESTエンドポイントのように動作するようになったので、次にAzure Data Factoryがそれを使用するように設定します。

次のステップでは、Azure Data Factoryインスタンスを作成し、ClickHouseインスタンスへのリンクサービスを設定し、
[RESTシンク](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)
用のデータセットを定義し、AzureからClickHouseにデータを送信するためのCopy Dataアクティビティを作成します。

## Azure Data Factoryインスタンスの作成 {#create-an-azure-data-factory-instance}

このガイドは、Microsoft Azureアカウントにアクセスでき、サブスクリプションとリソースグループがすでに設定されていることを前提としています。すでにAzure Data Factoryが設定されている場合は、このステップをスキップし、既存のサービスを使用して次のステップに進むことができます。

1. [Microsoft Azureポータル](https://portal.azure.com/)にログインし、**リソースの作成**をクリックします。
   <Image img={azureHomePage} size="lg" alt="Azure Portal Home Page" border/>

2. 左のカテゴリペインで**分析**を選択し、人気のサービスリストから**Data Factory**をクリックします。
   <Image img={azureNewResourceAnalytics} size="lg" alt="Azure Portal New Resource" border/>

3. サブスクリプションとリソースグループを選択し、新しいData Factoryインスタンスの名前を入力し、リージョンを選択してバージョンをV2のままにします。
   <Image img={azureNewDataFactory} size="lg" alt="Azure Portal New Data Factory" border/>

3. **確認 + 作成**をクリックし、次に**作成**をクリックしてデプロイを開始します。
   <Image img={azureNewDataFactoryConfirm} size="lg" alt="Azure Portal New Data Factory Confirm" border/>

   <Image img={azureNewDataFactorySuccess} size="lg" alt="Azure Portal New Data Factory Success" border/>

デプロイが成功裏に完了すると、新しいAzure Data Factoryインスタンスを使用し始めることができます。

## 新しいRESTベースのリンクサービスの作成 {#-creating-new-rest-based-linked-service}

1. Microsoft Azureポータルにログインし、Data Factoryインスタンスを開きます。
   <Image img={azureHomeWithDataFactory} size="lg" alt="Azure Portal Home Page with Data Factory" border/>

2. Data Factoryの概要ページで、**スタジオを起動**をクリックします。
   <Image img={azureDataFactoryPage} size="lg" alt="Azure Portal Data Factory Page" border/>

3. 左側のメニューで**管理**を選択し、**リンクサービス**に移動して、**+ 新規**をクリックして新しいリンクサービスを作成します。
   <Image img={adfCreateLinkedServiceButton} size="lg" alt="Azure Data Factory New Linked Service Button" border/>

4. **新しいリンクサービス検索バー**に**REST**と入力し、**REST**を選択して**続行**をクリックして
   [RESTコネクタ](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)
   インスタンスを作成します。
   <Image img={adfNewLinkedServiceSearch} size="lg" alt="Azure Data Factory New Linked Service Search" border/>

5. リンクサービス構成ペインで、新しいサービスの名前を入力し、**基本URL**フィールドをクリックし、次に**動的コンテンツを追加**をクリックします（このリンクはフィールドが選択されている時のみ表示されます）。
   <Image img={adfNewLinedServicePane} size="lg" alt="New Lined Service Pane" border/>

6. 動的コンテンツペインで、パラメータ化されたURLを作成できます。これにより、異なるテーブルのデータセットを作成するときにクエリを後で定義できるので、リンクサービスが再利用できるようになります。
   <Image img={adfNewLinkedServiceBaseUrlEmpty} size="lg" alt="New Linked ServiceBase Url Empty" border/>

7. フィルタ入力の横にある**"+"**をクリックして新しいパラメータを追加し、名前を`pQuery`とし、タイプをStringに設定し、デフォルト値を`SELECT 1`に設定します。**保存**をクリックします。
   <Image img={adfNewLinkedServiceParams} size="lg" alt="New Linked Service Parameters" border/>

8. 式フィールドに以下を入力し、**OK**をクリックします。`your-clickhouse-url.com`を実際のClickHouseインスタンスのアドレスに置き換えてください。
```text
@{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
```
   <Image img={adfNewLinkedServiceExpressionFieldFilled} size="lg" alt="New Linked Service Expression Field Filled" border/>

9. メインフォームに戻り、基本認証を選択し、ClickHouse HTTPインターフェースに接続するために使用したユーザー名とパスワードを入力し、**接続をテスト**をクリックします。すべてが正しく構成されている場合、成功メッセージが表示されます。
   <Image img={adfNewLinkedServiceCheckConnection} size="lg" alt="New Linked Service Check Connection" border/>

10. **作成**をクリックして設定を完了します。
    <Image img={adfLinkedServicesList} size="lg" alt="Linked Services List" border/>

これで、新しく登録されたRESTベースのリンクサービスがリストに表示されるはずです。

## ClickHouse HTTPインターフェース用の新しいデータセットを作成する {#creating-a-new-dataset-for-the-clickhouse-http-interface}

ClickHouse HTTPインターフェース用にリンクサービスが設定されたので、Azure Data FactoryがClickHouseにデータを送信する際に使用するデータセットを作成できます。

この例では、[環境センサーのデータ](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)の一部を挿入します。

1. 選択したClickHouseクエリコンソールを開きます — これはClickHouse CloudのWeb UI、CLIクライアント、またはクエリを実行するために使用する他のインターフェースのいずれかです — そしてターゲットテーブルを作成します:
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

2. Azure Data Factory Studioで、左側のペインから「作成」を選択します。データセット項目の上にカーソルを合わせ、3点アイコンをクリックし、新しいデータセットを選択します。
   <Image img={adfNewDatasetItem} size="lg" alt="New Dataset Item" border/>

3. 検索バーに**REST**と入力し、**REST**を選択し、**続行**をクリックします。データセットの名前を入力し、前のステップで作成した**リンクサービス**を選択します。**OK**をクリックしてデータセットを作成します。
   <Image img={adfNewDatasetPage} size="lg" alt="New Dataset Page" border/>

4. これで、新しく作成したデータセットが左側のファクトリリソースペインのデータセットセクションに表示されます。データセットを選択してプロパティを開きます。リンクサービスで定義された`pQuery`パラメータが表示されます。**値**テキストフィールドをクリックし、次に**動的な**コンテンツを追加をクリックします。
   <Image img={adfNewDatasetProperties} size="lg" alt="New Dataset Properties" border/>

5. 開いたペインに、次のクエリを貼り付けます:
```sql
INSERT INTO sensors
SETTINGS 
    date_time_input_format=''best_effort'', 
    input_format_json_read_objects_as_strings=1 
FORMAT JSONEachRow
```

   :::danger
   クエリ内のすべてのシングルクォート `'` は二重のシングルクォート `''` に置き換える必要があります。これはAzure Data Factoryの式パーサーによって要求されます。エスケープしないと、すぐにはエラーが表示されない場合がありますが、データセットを使用または保存しようとするときに失敗します。例えば、`'best_effort'`は`''best_effort''`のように書く必要があります。
   :::

   <Image img={adfNewDatasetQuery} size="xl" alt="New Dataset Query" border/>

6. 式を保存するにはOKをクリックします。接続をテストをクリックします。すべてが正しく構成されていれば、接続成功メッセージが表示されます。ページの上部にある**すべて公開**をクリックして変更を保存します。
   <Image img={adfNewDatasetConnectionSuccessful} size="xl" alt="New Dataset Connection Successful" border/>

### サンプルデータセットの設定 {#setting-up-an-example-dataset}

この例では、完全な環境センサーのデータセットではなく、[センサーのデータセットサンプル](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv)の小さなサブセットを使用します。

:::info
このガイドを焦点を絞って保つために、Azure Data Factoryでのソースデータセットの作成手順については詳しく説明しません。サンプルデータをお好みのストレージサービスにアップロードできます — 例えば、Azure Blob Storage、Microsoft SQL Server、またはAzure Data Factoryがサポートする別のファイル形式などです。
:::

データセットをAzure Blob Storage（または別の好ましいストレージサービス）にアップロードします。その後、Azure Data Factory Studioでファクトリリソースペインに移動します。アップロードされたデータを指す新しいデータセットを作成します。**すべてを公開**をクリックして変更を保存します。

## ClickHouseにデータを転送するためのCopyアクティビティの作成 {#creating-the-copy-activity-to-transfer-data-to-clickhouse}

入力データセットと出力データセットの両方を構成したので、**Copy Data**アクティビティを設定して、サンプルデータセットからClickHouseの`sensors`テーブルにデータを転送できます。

1. **Azure Data Factory Studio**を開き、**作成タブ**に移動します。**ファクトリリソース**ペインで、**Pipeline**にカーソルを合わせ、3点アイコンをクリックして**新しいパイプライン**を選択します。
   <Image img={adfNewPipelineItem} size="lg" alt="ADF New Pipeline Item" border/>

2. **アクティビティ**ペインで、**移動と変換**セクションを展開し、**データのコピー**アクティビティをキャンバスにドラッグします。
   <Image img={adfNewCopyDataItem} size="lg" alt="New Copy DataItem" border/>

3. **ソース**タブを選択し、先ほど作成したソースデータセットを選択します。
   <Image img={adfCopyDataSource} size="lg" alt="Copy Data Source" border/>

4. **シンク**タブに移動し、センサー用のClickHouseデータセットを選択します。**リクエストメソッド**をPOSTに設定します。**HTTP圧縮タイプ**が**なし**に設定されていることを確認します。
   :::warning
   HTTP圧縮は、Azure Data FactoryのCopy Dataアクティビティでは正しく機能しません。有効にすると、Azureはゼロバイトのみのペイロードを送信します — サービスのバグの可能性があります。圧縮は無効のままにしておいてください。
   :::
   :::info
   バッチサイズは10,000のデフォルトを維持するか、さらなる増加をお勧めします。詳細については、
   [挿入戦略の選択 / 同期的な場合のバッチ挿入](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)
   をご覧ください。
   :::
   <Image img={adfCopyDataSinkSelectPost} size="lg" alt="Copy Data Sink Select Post" border/>

5. キャンバスの上部にある**デバッグ**をクリックしてパイプラインを実行します。少し待つと、アクティビティがキューに送信され実行されます。すべてが正しく構成されていれば、タスクは**成功**のステータスで終了するはずです。
   <Image img={adfCopyDataDebugSuccess} size="lg" alt="Copy Data Debug Success" border/>

6. 完了したら、**すべてを公開**をクリックしてパイプラインとデータセットの変更を保存します。

## 追加リソース {#additional-resources-1}
- [HTTPインターフェース](https://clickhouse.com/docs/interfaces/http)
- [Azure Data Factoryを使用してRESTエンドポイントからデータをコピーおよび変換する](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [挿入戦略の選択](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [セルフホステッドインテグレーションランタイムの作成と設定](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
