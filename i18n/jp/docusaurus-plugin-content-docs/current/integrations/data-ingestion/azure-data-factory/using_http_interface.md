---
sidebar_label: 'HTTP インターフェイスの使用'
slug: /integrations/azure-data-factory/http-interface
description: 'ClickHouse の HTTP インターフェイスを使用して Azure Data Factory から ClickHouse にデータをインジェストする'
keywords: ['Azure Data Factory', 'Azure', 'Microsoft', 'データ', 'HTTP インターフェイス']
title: 'ClickHouse HTTP インターフェイスを使用して Azure のデータを ClickHouse にインジェストする'
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


# Azure Data Factory で ClickHouse の HTTP インターフェイスを使用する \{#using-clickhouse-http-interface-in-azure-data-factory\}

[`azureBlobStorage` Table Function](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
は、Azure Blob Storage から ClickHouse へデータを高速かつ便利に取り込むための手段です。
しかし、次のような理由から、常に適しているとは限りません:

- データが Azure Blob Storage に保存されていない場合があります。たとえば、Azure SQL Database、Microsoft SQL Server、Cosmos DB に保存されている場合です。
- セキュリティポリシーにより Blob Storage への外部アクセスが完全に禁止されている場合があります。たとえば、ストレージアカウントにパブリックエンドポイントがなく、ロックダウンされている場合です。

このようなシナリオでは、Azure Data Factory と
[ClickHouse HTTP interface](https://clickhouse.com/docs/interfaces/http)
を組み合わせて使用し、Azure の各種サービスから ClickHouse へデータを送信できます。

この方法ではデータフローの向きが逆になります。ClickHouse が Azure からデータを取得するのではなく、
Azure Data Factory が ClickHouse にデータをプッシュします。このアプローチでは、
一般的に ClickHouse インスタンスがパブリックインターネットからアクセス可能である必要があります。

:::info
Azure Data Factory の Self-hosted Integration Runtime を使用すれば、
ClickHouse インスタンスをインターネットに公開せずに済みます。この構成により、
プライベートネットワーク経由でデータを送信できます。ただし、このトピックは本記事の範囲外です。
詳細については公式ガイドを参照してください:
[Create and configure a self-hosted integration
runtime](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::

## ClickHouse を REST サービスとして利用する \{#turning-clickhouse-to-a-rest-service\}

Azure Data Factory は、HTTP 経由で JSON 形式のデータを外部システムへ送信することをサポートしています。この機能を利用して、[ClickHouse HTTP interface](https://clickhouse.com/docs/interfaces/http) を使い、ClickHouse に直接データを投入できます。
詳細については、[ClickHouse HTTP インターフェイスのドキュメント](https://clickhouse.com/docs/interfaces/http) を参照してください。

この例では、宛先テーブルを指定し、入力データ形式として JSON を指定し、さらにタイムスタンプをより柔軟にパースできるようにするためのオプションを含めるだけで済みます。

```sql
INSERT INTO my_table
SETTINGS 
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

このクエリを HTTP リクエストの一部として送信するには、URL エンコードした文字列として ClickHouse エンドポイントの `query` パラメーターに渡すだけです。

```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factory は組み込みの `encodeUriComponent` 関数を使ってこのエンコーディングを自動的に処理できるため、手動で行う必要はありません。
:::

これで、この URL に JSON 形式のデータを送信できるようになります。データは対象テーブルの構造に対応している必要があります。次は、`col_1`、`col_2`、`col_3` の 3 つのカラムを持つテーブルを想定した、curl を使った簡単な例です。

```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

オブジェクトの JSON 配列、あるいは JSON Lines（改行区切りの JSON オブジェクト）を送信することもできます。Azure Data Factory は JSON 配列形式を使用しており、ClickHouse の `JSONEachRow` 入力形式と完全に互換性があります。

ご覧のとおり、この手順では ClickHouse 側で特別な作業を行う必要はありません。HTTP インターフェイスが、REST 風のエンドポイントとして動作するために必要なものをすべてすでに提供しており、追加の設定は不要です。

ClickHouse を REST エンドポイントのように動作させられたので、次は Azure Data Factory をそれを利用するように構成します。

次の手順では、Azure Data Factory インスタンスを作成し、ClickHouse インスタンスへの Linked Service をセットアップし、
[REST sink](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest) 用の Dataset を定義し、
Azure から ClickHouse にデータを送信する Copy Data アクティビティを作成します。


## Azure Data Factory インスタンスの作成 \{#create-an-azure-data-factory-instance\}

このガイドでは、Microsoft Azure アカウントにアクセスでき、サブスクリプションとリソースグループがすでに構成されていることを前提とします。すでに Azure Data Factory が構成済みの場合は、この手順は省略し、既存のサービスを使用して次の手順に進んでかまいません。

1. [Microsoft Azure Portal](https://portal.azure.com/) にログインし、**Create a resource** をクリックします。
   <Image img={azureHomePage} size="lg" alt="Azure Portal ホーム ページ" border/>

2. 左側のカテゴリ ペインで **Analytics** を選択し、人気のサービス一覧から **Data Factory** をクリックします。
   <Image img={azureNewResourceAnalytics} size="lg" alt="Azure Portal 新規リソース" border/>

3. サブスクリプションとリソースグループを選択し、新しい Data Factory インスタンスの名前を入力して、リージョンを選択し、バージョンは V2 のままにします。
   <Image img={azureNewDataFactory} size="lg" alt="Azure Portal 新規 Data Factory" border/>

3. **Review + Create** をクリックし、続いて **Create** をクリックしてデプロイを開始します。
   <Image img={azureNewDataFactoryConfirm} size="lg" alt="Azure Portal 新規 Data Factory 確認" border/>

   <Image img={azureNewDataFactorySuccess} size="lg" alt="Azure Portal 新規 Data Factory 成功" border/>

デプロイが正常に完了したら、新しい Azure Data Factory インスタンスの使用を開始できます。

## 新しい REST ベースの Linked service を作成する \{#-creating-new-rest-based-linked-service\}

1. Microsoft Azure Portal にログインし、Data Factory インスタンスを開きます。
   <Image img={azureHomeWithDataFactory} size="lg" alt="Data Factory が表示された Azure Portal ホーム画面" border/>

2. Data Factory の概要ページで **Launch Studio** をクリックします。
   <Image img={azureDataFactoryPage} size="lg" alt="Azure Portal の Data Factory ページ" border/>

3. 左側のメニューで **Manage** を選択し、**Linked services** に移動して、
   新しい Linked service を作成するために **+ New** をクリックします。
   <Image img={adfCreateLinkedServiceButton} size="lg" alt="Azure Data Factory の New Linked Service ボタン" border/>

4. **New linked service search bar** で **REST** と入力し、**REST** を選択して **Continue** をクリックし、
   [REST connector](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)
   インスタンスを作成します。
   <Image img={adfNewLinkedServiceSearch} size="lg" alt="Azure Data Factory の New Linked Service 検索" border/>

5. Linked service の設定ペインで新しいサービスの名前を入力し、
   **Base URL** フィールドをクリックしてから **Add dynamic content** をクリックします
   （このリンクはフィールドを選択したときにのみ表示されます）。
   <Image img={adfNewLinedServicePane} size="lg" alt="New Linked Service ペイン" border/>

6. Dynamic content ペインでは、URL をパラメーター化できます。
   これにより、異なるテーブル向けのデータセットを作成する際にクエリを後から定義できるため、
   Linked service を再利用可能にできます。
   <Image img={adfNewLinkedServiceBaseUrlEmpty} size="lg" alt="Base URL が未入力の New Linked Service" border/>

7. フィルター入力欄の横にある **"+"** をクリックして新しいパラメーターを追加し、
   名前を `pQuery`、型を String、既定値を `SELECT 1` に設定します。
   **Save** をクリックします。
   <Image img={adfNewLinkedServiceParams} size="lg" alt="New Linked Service のパラメーター設定" border/>

8. Expression フィールドに次の内容を入力し、**OK** をクリックします。
   `your-clickhouse-url.com` を実際の ClickHouse インスタンスのアドレスに置き換えてください。
   ```text
   @{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
   ```
   <Image img={adfNewLinkedServiceExpressionFieldFilled} size="lg" alt="値が入力された New Linked Service の Expression フィールド" border/>

9. メインフォームに戻り、Basic authentication を選択し、
   ClickHouse HTTP インターフェイスへの接続に使用するユーザー名と
   パスワードを入力して、**Test connection** をクリックします。
   すべて正しく構成されていれば、成功メッセージが表示されます。
   <Image img={adfNewLinkedServiceCheckConnection} size="lg" alt="New Linked Service の接続テスト" border/>

10. **Create** をクリックしてセットアップを完了します。
    <Image img={adfLinkedServicesList} size="lg" alt="Linked Services の一覧" border/>

これで、新しく登録した REST ベースの Linked service が一覧に表示されるようになります。

## ClickHouse HTTP インターフェイス用の新しいデータセットを作成する \{#creating-a-new-dataset-for-the-clickhouse-http-interface\}

ClickHouse HTTP インターフェイス用のリンク サービスを構成したので、
Azure Data Factory が ClickHouse にデータを送信する際に使用する
データセットを作成します。

この例では、[Environmental Sensors
Data](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors) の一部を挿入します。

1. 任意の ClickHouse クエリコンソールを開きます。これは、
   ClickHouse Cloud の Web UI、CLI クライアント、またはクエリを実行するために
   使用しているその他のインターフェイスのいずれでも構いません。次にターゲットテーブルを作成します。
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

2. Azure Data Factory Studio で、左側のペインから Author を選択します。
   Dataset 項目にカーソルを合わせて三点リーダーのアイコンをクリックし、New dataset を選択します。
   <Image img={adfNewDatasetItem} size="lg" alt="新しいデータセット項目" border/>

3. 検索バーで **REST** と入力し、**REST** を選択して **Continue** をクリックします。
   データセット名を入力し、前の手順で作成した **linked service** を選択します。
   **OK** をクリックしてデータセットを作成します。
   <Image img={adfNewDatasetPage} size="lg" alt="新しいデータセットページ" border/>

4. 左側の Factory Resources ペインの Datasets セクションに、
   作成したデータセットが表示されているはずです。データセットを選択して
   プロパティを開きます。リンク サービスで定義した `pQuery` パラメータが表示されます。
   **Value** テキストフィールドをクリックし、続けて **Add dynamic**
   content をクリックします。
   <Image img={adfNewDatasetProperties} size="lg" alt="新しいデータセットプロパティ" border/>

5. 開いたペインに、次のクエリを貼り付けます。
   ```sql
   INSERT INTO sensors
   SETTINGS 
       date_time_input_format=''best_effort'', 
       input_format_json_read_objects_as_strings=1 
   FORMAT JSONEachRow
   ```

   :::danger
   クエリ内のすべての単一引用符 `'` は、2 つの単一引用符 `''` に置き換える必要があります。
   これは Azure Data Factory の式パーサーの要件です。エスケープしなかった場合、
   すぐにはエラーが表示されないかもしれませんが、データセットを使用または保存しようとしたときに
   後で失敗します。たとえば、`'best_effort'` は `''best_effort''` と記述しなければなりません。
   :::

   <Image img={adfNewDatasetQuery} size="xl" alt="新しいデータセットクエリ" border/>

6. OK をクリックして式を保存します。次に Test connection をクリックします。
   すべてが正しく構成されていれば、Connection successful というメッセージが表示されます。
   ページ上部の Publish all をクリックして、変更内容を保存します。
   <Image img={adfNewDatasetConnectionSuccessful} size="xl" alt="新しいデータセット接続成功" border/>

### サンプルデータセットの準備 \{#setting-up-an-example-dataset\}

この例では、Environmental Sensors Dataset 全体ではなく、
[Sensors Dataset Sample](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv)
で提供されている小規模なサブセットのみを使用します。

:::info
このガイドの焦点を絞るため、Azure Data Factory でソースデータセットを作成するための
詳細な手順には踏み込みません。サンプルデータは、任意のストレージサービスにアップロードできます。
たとえば、Azure Blob Storage、Microsoft SQL Server、あるいは Azure Data Factory でサポートされている
別のファイル形式でも構いません。
:::

データセットを Azure Blob Storage（または他に選択したストレージサービス）にアップロードします。
次に、Azure Data Factory Studio で Factory Resources ペインを開きます。
アップロードしたデータを参照する新しいデータセットを作成します。最後に「Publish all」をクリックして、
変更内容を公開します。

## ClickHouse にデータを転送する Copy Activity の作成 \{#creating-the-copy-activity-to-transfer-data-to-clickhouse\}

入力および出力データセットの両方を構成したので、サンプルデータセットから
ClickHouse の `sensors` テーブルにデータを転送する **Copy Data** アクティビティを
設定します。

1. **Azure Data Factory Studio** を開き、**Author タブ** に移動します。**Factory Resources**
   ペインで **Pipeline** の上にマウスカーソルを置き、三点アイコンをクリックして
   **New pipeline** を選択します。
   <Image img={adfNewPipelineItem} size="lg" alt="ADF での新規パイプライン項目" border/>

2. **Activities** ペインで **Move and transform** セクションを展開し、**Copy data**
   アクティビティをキャンバス上にドラッグします。
   <Image img={adfNewCopyDataItem} size="lg" alt="新しい Copy Data 項目" border/>

3. **Source** タブを選択し、先ほど作成したソースデータセットを選択します。
   <Image img={adfCopyDataSource} size="lg" alt="Copy Data のソース設定" border/>

4. **Sink** タブに移動し、`sensors` テーブル用に作成した ClickHouse データセットを
   選択します。**Request method** を POST に設定します。**HTTP compression type** が
   **None** になっていることを確認します。
   :::warning
   Azure Data Factory の Copy Data アクティビティでは HTTP 圧縮が正しく動作しません。
   有効化すると、Azure はゼロバイトのみから成るペイロードを送信します — サービス側の
   バグと思われます。必ず圧縮は無効のままにしてください。
   :::
   :::info
   デフォルトのバッチサイズ 10,000 を維持するか、さらに増やすことを推奨します。詳細は
   [Selecting an Insert Strategy / Batch inserts if synchronous](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)
   を参照してください。
   :::
   <Image img={adfCopyDataSinkSelectPost} size="lg" alt="Copy Data Sink で POST を選択している画面" border/>

5. キャンバス上部の **Debug** をクリックしてパイプラインを実行します。しばらく待つと、
   アクティビティはキューに投入されて実行されます。すべてが正しく構成されていれば、
   タスクは **Success** ステータスで終了します。
   <Image img={adfCopyDataDebugSuccess} size="lg" alt="Copy Data Debug の成功ステータス" border/>

6. 完了したら **Publish all** をクリックし、パイプラインとデータセットの変更を保存します。

## 追加リソース \{#additional-resources-1\}

- [HTTP インターフェイス](https://clickhouse.com/docs/interfaces/http)
- [Azure Data Factory を使用した REST エンドポイント間のデータのコピーと変換](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [挿入戦略の選択](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [セルフホスト型 Integration Runtime の作成と構成](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)