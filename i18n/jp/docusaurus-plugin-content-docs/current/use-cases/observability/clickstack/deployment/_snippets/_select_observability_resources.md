import Image from '@theme/IdealImage';
import provider_selection from '@site/static/images/clickstack/getting-started/provider_selection.png';
import advanced_resources from '@site/static/images/clickstack/getting-started/advanced_resources.png';
import service_provisioned from '@site/static/images/clickstack/getting-started/service_provisioned.png';

クラウドプロバイダ、デプロイするリージョン、および 1 か月あたりのデータ量を、&#39;Memory and Scaling&#39; ドロップダウンから選択します。

ここでは、圧縮前のログまたはトレースとして保持しているデータ量のおおよその値を入力してください。

<Image img={provider_selection} size="md" alt="リソースセレクタ" border />

この見積もりは、Managed ClickStack サービスを支えるコンピュートリソースの規模を決定するために使用されます。新しい組織はデフォルトで [Scale tier](/cloud/manage/cloud-tiers) に配置されます。Scale tier では [Vertical autoscaling](/manage/scaling#vertical-auto-scaling) がデフォルトで有効になっています。組織のティアは後から &#39;Plans&#39; ページで変更できます。

要件を十分に把握している上級ユーザは、&#39;Memory and Scaling&#39; ドロップダウンから &#39;Custom Configuration&#39; を選択することで、プロビジョニングされるリソース量やエンタープライズ機能を個別に指定することもできます。

<Image img={advanced_resources} size="md" alt="高度なリソースセレクタ" border />

要件を指定すると、Managed ClickStack サービスのプロビジョニングには数分かかります。プロビジョニングの完了は、続く &#39;ClickStack&#39; ページで確認できます。プロビジョニングを待つ間は、[ClickHouse Cloud コンソール](/cloud/overview) の他のセクションを参照してかまいません。

<Image img={service_provisioned} size="md" alt="サービスがプロビジョニング済み" border />

プロビジョニングが完了したら、&#39;Start Ingestion&#39; を選択します。
