ClickHouseにネイティブTCPで接続するには、以下の情報が必要です：

- HOSTとPORT：通常、ポートはTLSを使用する場合は9440、使用しない場合は9000です。

- DATABASE NAME：デフォルトでは`default`というデータベースがあります。接続したいデータベースの名前を使用してください。

- USERNAMEとPASSWORD：デフォルトではユーザー名は`default`です。使用ケースに適したユーザー名を使用してください。

あなたのClickHouse Cloudサービスの詳細は、ClickHouse Cloudコンソールで確認できます。接続するサービスを選択し、**Connect**をクリックします：

![ClickHouse Cloudサービス接続ボタン](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/cloud-connect-button.png)

**Native**を選択すると、例として`clickhouse-client`コマンドの詳細が表示されます。

![ClickHouse CloudネイティブTCP接続詳細](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/connection-details-native.png)

セルフマネージドのClickHouseを使用している場合、接続詳細はあなたのClickHouse管理者によって設定されます。
