import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

要通过原生 TCP 连接到 ClickHouse，您需要以下信息：

- 主机和端口：使用 TLS 时，端口通常为 9440，不使用 TLS 时，端口为 9000。

- 数据库名称：开箱即用时，有一个名为 `default` 的数据库，请使用您要连接的数据库名称。

- 用户名和密码：开箱即用时，用户名为 `default`。请使用适合您用例的用户名。

您 ClickHouse Cloud 服务的详细信息可以在 ClickHouse Cloud 控制台中找到。 选择您要连接的服务，然后点击 **Connect**：

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud service connect button" border/>

选择 **Native**，然后在示例 `clickhouse-client` 命令中可以找到详细信息。

<Image img={connection_details_native} size="md" alt="ClickHouse Cloud Native TCP connection details" border/>

如果您使用的是自管理的 ClickHouse，连接详细信息由您的 ClickHouse 管理员设置。
