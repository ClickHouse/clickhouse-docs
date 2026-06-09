import Image from '@theme/IdealImage';
import clickhouse_cloud_connection from '@site/static/images/use-cases/observability/clickstack-cloud-connect.png';

你需要准备：

* 你的 ClickHouse Cloud 服务的 HTTPS 端点，包括协议和端口，例如 `https://abc123xyz.us-central1.gcp.clickhouse.cloud:8443`。
* 用于摄取的 ClickHouse 用户名和密码。

如果你没有记下这些信息，请在 [ClickHouse Cloud 控制台](https://console.clickhouse.cloud) 中打开你的服务，然后选择 **Connect**。记下随后对话框中的 URL。下面我们会为摄取创建一个专用用户。

<Image img={clickhouse_cloud_connection} size="lg" alt="显示 HTTPS 端点和密码的服务连接面板" border />