
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

ClickHouse にネイティブ TCP で接続するには、以下の情報が必要です。

- HOST と PORT: 通常、ポートは TLS を使用する場合は 9440、TLS を使用しない場合は 9000 です。

- DATABASE NAME: 初期設定では `default` という名前のデータベースがあります。接続したいデータベースの名前を使用してください。

- USERNAME と PASSWORD: 初期設定ではユーザー名は `default` です。ユースケースに応じたユーザー名を使用してください。

あなたの ClickHouse Cloud サービスの詳細は、ClickHouse Cloud コンソールで確認できます。接続するサービスを選択し、**Connect** をクリックしてください。

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud service connect button" border/>

**Native** を選択すると、例の `clickhouse-client` コマンドで詳細が表示されます。

<Image img={connection_details_native} size="md" alt="ClickHouse Cloud Native TCP connection details" border/>

セルフマネージドの ClickHouse を使用している場合、接続詳細は ClickHouse 管理者によって設定されます。
```
