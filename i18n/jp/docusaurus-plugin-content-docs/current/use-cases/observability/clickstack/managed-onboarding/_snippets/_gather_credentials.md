import Image from '@theme/IdealImage';
import clickhouse_cloud_connection from '@site/static/images/use-cases/observability/clickstack-cloud-connect.png';

必要なもの:

* プロトコルとポートを含む ClickHouse Cloud サービスの HTTPS エンドポイント (例: `https://abc123xyz.us-central1.gcp.clickhouse.cloud:8443`) 。
* インジェスト用の ClickHouse のユーザー名とパスワード。

これらを控えていない場合は、[ClickHouse Cloud console](https://console.clickhouse.cloud) で対象のサービスを開き、**Connect** を選択します。表示されるダイアログにある URL を控えてください。インジェスト専用のユーザーは後ほど作成します。

<Image img={clickhouse_cloud_connection} size="lg" alt="HTTPS エンドポイントとパスワードが表示されたサービス接続パネル" border />