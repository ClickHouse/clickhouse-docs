---
{}
---

import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

要通过原生 TCP 连接到 ClickHouse，您需要以下信息：

- 主机 (HOST) 和端口 (PORT)：通常，当使用 TLS 时端口为 9440，不使用 TLS 时端口为 9000。

- 数据库名称 (DATABASE NAME)：默认情况下有一个名为 `default` 的数据库，请使用您想要连接的数据库名称。

- 用户名 (USERNAME) 和密码 (PASSWORD)：默认情况下，用户名为 `default`。请使用适合您用例的用户名。

您可以在 ClickHouse Cloud 控制台中找到您的 ClickHouse Cloud 服务的详细信息。选择您要连接的服务并点击 **连接**：

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud service connect button" border/>

选择 **原生**，详细信息将在示例 `clickhouse-client` 命令中提供。

<Image img={connection_details_native} size="md" alt="ClickHouse Cloud Native TCP connection details" border/>

如果您使用自管理的 ClickHouse，连接详细信息由您的 ClickHouse 管理员设置。
