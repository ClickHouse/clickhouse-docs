import Image from '@theme/IdealImage';
import provider_selection from '@site/static/images/clickstack/getting-started/provider_selection.png';
import advanced_resources from '@site/static/images/clickstack/getting-started/advanced_resources.png';
import service_provisioned from '@site/static/images/clickstack/getting-started/service_provisioned.png';

使用するクラウドプロバイダー、デプロイしたいリージョン、および 1 か月あたりのデータ量を、&#39;Memory and Scaling&#39; ドロップダウンから選択します。

これは、圧縮されていない状態でのログまたはトレースなど、保有データ量のおおよその見積もりで構いません。

<Image img={provider_selection} size="md" alt="リソースセレクター" border />

この見積もりは、Managed ClickStack サービスを支える計算リソースのサイズ決定に使用されます。デフォルトでは、新しい組織は [Scale ティア](/cloud/manage/cloud-tiers) に配置されます。Scale ティアでは [Vertical autoscaling](/manage/scaling#vertical-auto-scaling) がデフォルトで有効になっています。組織のティアは後から &#39;Plans&#39; ページで変更できます。

要件を十分に理解している上級ユーザーは、&#39;Memory and Scaling&#39; ドロップダウンから &#39;Custom Configuration&#39; を選択することで、プロビジョニングされる正確なリソースやエンタープライズ機能を個別に指定することもできます。

<Image img={advanced_resources} size="md" alt="高度なリソースセレクター" border />

要件を指定すると、Managed ClickStack サービスのプロビジョニングに数分かかります。プロビジョニングの完了は、次の &#39;ClickStack&#39; ページで確認できます。プロビジョニングを待つ間、[ClickHouse Cloud コンソール](/cloud/overview) の他の機能を自由に参照してください。

<Image img={service_provisioned} size="md" alt="サービスがプロビジョニング済みの状態" border />

プロビジョニングが完了したら、&#39;Start Ingestion&#39; を選択します。
