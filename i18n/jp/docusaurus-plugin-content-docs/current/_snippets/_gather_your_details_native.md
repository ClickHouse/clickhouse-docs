import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

ネイティブ TCP で ClickHouse に接続するには、次の情報が必要です。

| Parameter(s)              | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| `HOST` and `PORT`         | 通常、TLS を使用する場合はポート 9440、TLS を使用しない場合は 9000 です。             |
| `DATABASE NAME`           | デフォルトで `default` という名前のデータベースが用意されています。接続したいデータベース名を指定します。 |
| `USERNAME` and `PASSWORD` | デフォルトのユーザー名は `default` です。ユースケースに適したユーザー名を使用してください。        |

ClickHouse Cloud サービスの接続情報は、ClickHouse Cloud コンソールで確認できます。
接続するサービスを選択し、**Connect** をクリックします。

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud サービスの接続ボタン" border />

**Native** を選択すると、例として表示される `clickhouse-client` コマンド内に詳細が示されます。

<Image img={connection_details_native} size="md" alt="ClickHouse Cloud ネイティブ TCP 接続の詳細" border />

セルフマネージドな ClickHouse を使用している場合、接続情報は ClickHouse 管理者によって設定されます。
