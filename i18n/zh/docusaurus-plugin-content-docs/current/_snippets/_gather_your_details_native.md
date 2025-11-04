import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

要通过原生 TCP 连接到 ClickHouse，您需要以下信息：

- 主机（HOST）和端口（PORT）：通常，当使用 TLS 时，端口为 9440，当不使用 TLS 时，端口为 9000。

- 数据库名称（DATABASE NAME）：开箱即用有一个名为 `default` 的数据库，使用您要连接的数据库的名称。

- 用户名（USERNAME）和密码（PASSWORD）：开箱即用时，用户名为 `default`。使用适合您用例的用户名。

您 ClickHouse Cloud 服务的详细信息可以在 ClickHouse Cloud 控制台中找到。选择您要连接的服务，然后单击 **Connect**：

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud 服务连接按钮" border/>

选择 **Native**，然后详细信息将在示例 `clickhouse-client` 命令中提供。

<Image img={connection_details_native} size="md" alt="ClickHouse Cloud 原生 TCP 连接详细信息" border/>

如果您使用的是自管理的 ClickHouse，连接详细信息由您的 ClickHouse 管理员设置。
