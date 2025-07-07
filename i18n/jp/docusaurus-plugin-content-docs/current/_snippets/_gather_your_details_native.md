---
{}
---

import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

ClickHouse にネイティブ TCP で接続するには、次の情報が必要です：

- HOST と PORT: 通常、TLS を使用する場合はポート 9440、TLS を使用しない場合は 9000 です。

- DATABASE NAME: デフォルトでは `default` というデータベースがあり、接続したいデータベースの名前を使用します。

- USERNAME と PASSWORD: デフォルトではユーザー名は `default` です。使用ケースに適したユーザー名を使用してください。

ClickHouse Cloud サービスの詳細は ClickHouse Cloud コンソールで確認できます。接続するサービスを選択し、**Connect** をクリックします：

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud service connect button" border/>

**Native** を選択すると、例の `clickhouse-client` コマンドで詳細が表示されます。

<Image img={connection_details_native} size="md" alt="ClickHouse Cloud Native TCP connection details" border/>

セルフマネージドの ClickHouse を使用している場合、接続の詳細は ClickHouse 管理者によって設定されます。
