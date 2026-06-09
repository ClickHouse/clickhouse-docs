import Image from '@theme/IdealImage';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-first-time.png';
import clickstack_start_ingestion from '@site/static/images/use-cases/observability/clickstack-start-ingestion.png';
import clickstack_start_exploring from '@site/static/images/use-cases/observability/clickstack-start-exploring.png';
import clickstack_search from '@site/static/images/use-cases/observability/clickstack-search.png';

[ClickHouse Cloud console](https://console.clickhouse.cloud)でサービスを開き、左側のメニューから **ClickStack** を選択し、続いて **Start Ingestion** を選択します。

<Image img={clickstack_cloud} size="lg" alt="ClickStack を起動" border />

次の手順は、collector をすでに設定しているため、スキップできます。続行するには **Launch ClickStack** をクリックします。

ClickStack が新しいタブで開き、自動的に **Getting Started** ページに移動します。移動しない場合は、左側のメニューから **Getting Started** を選択し、**Start Ingestion** をクリックしてから **Next** をクリックします。

<Image img={clickstack_start_ingestion} size="lg" alt="ClickStack Start Ingestion" border />

ClickStack はテーブルとテレメトリーデータを自動的に検出し、そのまま先に進めるはずです。トレースデータの確認を始めるには、**Start Exploring** を選択します。

<Image img={clickstack_start_exploring} size="lg" alt="ClickStack Start Exploring" border />

ログソースを `Logs` に切り替え、時間範囲を **Last 15 minutes** に設定します。`otelgen` による合成ログが数秒以内に表示されるはずです。

<Image img={clickstack_search} size="lg" alt="ログが表示されている ClickStack Search view" />

何も表示されない場合:

* `otelgen` に渡した認証ヘッダーの値が、collector が想定しているものと一致していることを確認します。
* collector のログを tail して、エクスポートエラーがないか確認します。
* collector に設定した ClickHouse エンドポイントに、プロトコルとポートの両方が含まれていることを確認します (`https://...:8443`)。