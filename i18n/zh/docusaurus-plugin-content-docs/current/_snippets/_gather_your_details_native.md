import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';

要通过原生 TCP 连接到 ClickHouse，您需要以下信息：

- 主机和端口：通常，当使用 TLS 时，端口为 9440；不使用 TLS 时，端口为 9000。

- 数据库名称：默认情况下，有一个名为 `default` 的数据库，请使用您要连接的数据库名称。

- 用户名和密码：默认情况下，用户名为 `default`。请使用适合您用例的用户名。

您 ClickHouse Cloud 服务的详细信息可以在 ClickHouse Cloud 控制台中找到。 选择您要连接的服务并点击 **Connect**：

<img src={cloud_connect_button} class="image" alt="ClickHouse Cloud service connect button" />

选择 **Native**，详细信息将在示例 `clickhouse-client` 命令中显示。

<img src={connection_details_native} class="image" alt="ClickHouse Cloud Native TCP connection details" />

如果您使用的是自管理的 ClickHouse，连接详细信息由您的 ClickHouse 管理员设置。

