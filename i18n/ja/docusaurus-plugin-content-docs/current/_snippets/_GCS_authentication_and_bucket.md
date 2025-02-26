<details>
    <summary>GCSバケットとHMACキーを作成する</summary>

### ch_bucket_us_east1 {#ch_bucket_us_east1}

![バケットを追加](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/data-ingestion/s3/images/GCS-bucket-1.png)

### ch_bucket_us_east4 {#ch_bucket_us_east4}

![バケットを追加](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/data-ingestion/s3/images/GCS-bucket-2.png)

### アクセスキーを生成する {#generate-an-access-key}

### サービスアカウントのHMACキーとシークレットを作成する {#create-a-service-account-hmac-key-and-secret}

**Cloud Storage > 設定 > 相互運用性**を開き、既存の**アクセスキー**を選択するか、**サービスアカウントのキーを作成**を選択します。このガイドでは、新しいサービスアカウントの新しいキーを作成する手順を説明します。

![バケットを追加](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/data-ingestion/s3/images/GCS-create-a-service-account-key.png)

### 新しいサービスアカウントを追加する {#add-a-new-service-account}

既存のサービスアカウントがないプロジェクトの場合は、**新しいアカウントを作成**します。

![バケットを追加](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/data-ingestion/s3/images/GCS-create-service-account-0.png)

サービスアカウントを作成するには3つのステップがあります。第一ステップでは、アカウントに意味のある名前、ID、および説明を付けます。

![バケットを追加](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/data-ingestion/s3/images/GCS-create-service-account-a.png)

相互運用性設定ダイアログでは、IAMロールの**Storage Object Admin**ロールが推奨されます。第二ステップでそのロールを選択します。

![バケットを追加](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/data-ingestion/s3/images/GCS-create-service-account-2.png)

第三ステップはオプションであり、このガイドでは使用されません。ポリシーに基づいて、ユーザーにこれらの権限を付与することができます。

![バケットを追加](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/data-ingestion/s3/images/GCS-create-service-account-3.png)

サービスアカウントのHMACキーが表示されます。この情報はClickHouseの設定で使用されるため、保存しておいてください。

![バケットを追加](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/data-ingestion/s3/images/GCS-guide-key.png)

</details>
