import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

要通过原生 TCP 协议连接到 ClickHouse，需要以下信息：

| Parameter(s)              | Description                            |
| ------------------------- | -------------------------------------- |
| `HOST` and `PORT`         | 通常在使用 TLS 时端口为 9440，不使用 TLS 时端口为 9000。 |
| `DATABASE NAME`           | 默认提供名为 `default` 的数据库，请使用您要连接的数据库名称。   |
| `USERNAME` and `PASSWORD` | 默认用户名为 `default`。请根据您的使用场景选择合适的用户名。    |

ClickHouse Cloud 服务的详细信息可以在 ClickHouse Cloud 控制台中查看。
选择要连接的服务并点击 **Connect**：

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud service connect button" border />

选择 **Native**，示例 `clickhouse-client` 命令中会展示连接所需的详细信息。

<Image img={connection_details_native} size="md" alt="ClickHouse Cloud Native TCP connection details" border />

如果您使用的是自管的 ClickHouse，连接信息由 ClickHouse 管理员进行配置。
