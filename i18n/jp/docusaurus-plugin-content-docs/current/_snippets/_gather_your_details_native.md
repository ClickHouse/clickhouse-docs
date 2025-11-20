import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

ネイティブ TCP で ClickHouse に接続するには、次の情報が必要です。

| Parameter(s)              | Description                                                 |
| ------------------------- | ----------------------------------------------------------- |
| `HOST` and `PORT`         | 通常、TLS を使用する場合のポートは 9440、TLS を使用しない場合のポートは 9000 です。         |
| `DATABASE NAME`           | 初期状態では `default` という名前のデータベースがあります。接続したいデータベースの名前を使用してください。 |
| `USERNAME` and `PASSWORD` | 初期状態ではユーザー名は `default` です。ユースケースに適したユーザー名を使用してください。         |

ClickHouse Cloud サービスの接続情報は、ClickHouse Cloud コンソールで確認できます。
接続するサービスを選択し、**Connect** をクリックします。

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud サービスの接続ボタン" border />

**Native** を選択すると、サンプルの `clickhouse-client` コマンド内に接続情報が表示されます。

<Image img={connection_details_native} size="md" alt="ClickHouse Cloud のネイティブ TCP 接続情報" border />

セルフマネージドの ClickHouse を使用している場合、接続情報は ClickHouse 管理者によって設定されます。
