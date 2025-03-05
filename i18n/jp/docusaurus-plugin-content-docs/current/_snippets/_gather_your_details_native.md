
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';

ClickHouseにネイティブTCPで接続するには、以下の情報が必要です：

- HOSTとPORT：通常、TLSを使用する場合はポートが9440、TLSを使用しない場合は9000です。

- DATABASE NAME：デフォルトでは`default`というデータベースが存在します。接続したいデータベースの名前を使用してください。

- USERNAMEとPASSWORD：デフォルトではユーザー名が`default`です。使用ケースに応じたユーザー名を使用してください。

ClickHouse Cloudサービスの詳細は、ClickHouse Cloudコンソールで確認できます。接続するサービスを選択し、**Connect**をクリックしてください：

<img src={cloud_connect_button} class="image" alt="ClickHouse Cloudサービス接続ボタン" />

**Native**を選択すると、例の`clickhouse-client`コマンドで詳細が確認できます。

<img src={connection_details_native} class="image" alt="ClickHouse Cloud ネイティブTCP接続の詳細" />

セルフマネージドのClickHouseを使用している場合は、接続の詳細はClickHouse管理者によって設定されます。
```
