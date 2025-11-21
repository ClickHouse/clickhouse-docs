import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

要通过原生 TCP 连接到 ClickHouse，您需要以下信息：

| Parameter(s)              | Description                               |
| ------------------------- | ----------------------------------------- |
| `HOST` and `PORT`         | 通常在使用 TLS 时端口为 9440，不使用 TLS 时端口为 9000。    |
| `DATABASE NAME`           | 默认情况下存在名为 `default` 的数据库，请使用您希望连接的数据库名称。  |
| `USERNAME` and `PASSWORD` | 默认情况下用户名为 `default`。请根据您的使用场景使用相应的用户名和密码。 |

您的 ClickHouse Cloud 服务的详细信息可在 ClickHouse Cloud 控制台中查看。
选择您要连接的服务并点击 **Connect**：

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud 服务 Connect 按钮" border />

选择 **Native**，然后可以在示例 `clickhouse-client` 命令中查看连接信息。

<Image img={connection_details_native} size="md" alt="ClickHouse Cloud 原生 TCP 连接信息" border />

如果您使用的是自托管 ClickHouse，则连接信息由您的 ClickHouse 管理员进行设置。
