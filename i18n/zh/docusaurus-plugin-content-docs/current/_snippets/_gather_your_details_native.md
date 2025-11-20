import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

要通过原生 TCP 连接到 ClickHouse，你需要以下信息：

| 参数                      | 描述                                       |
| ----------------------- | ---------------------------------------- |
| `HOST` 和 `PORT`         | 通常在使用 TLS 时端口为 9440，不使用 TLS 时端口为 9000。   |
| `DATABASE NAME`         | 默认会提供一个名为 `default` 的数据库，请使用你希望连接的数据库名称。 |
| `USERNAME` 和 `PASSWORD` | 默认用户名为 `default`。请根据你的使用场景使用合适的用户名。      |

你的 ClickHouse Cloud 服务的详细信息可以在 ClickHouse Cloud 控制台中找到。
选择你要连接的服务并点击 **Connect**：

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud 服务 Connect 按钮" border />

选择 **Native**，即可在示例 `clickhouse-client` 命令中查看连接详细信息。

<Image img={connection_details_native} size="md" alt="ClickHouse Cloud 原生 TCP 连接详细信息" border />

如果你使用的是自管 ClickHouse，则连接详细信息由你的 ClickHouse 管理员进行配置。
