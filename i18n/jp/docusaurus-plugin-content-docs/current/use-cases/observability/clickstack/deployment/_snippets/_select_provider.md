import Image from '@theme/IdealImage';
import provider_selection from '@site/static/images/clickstack/getting-started/provider_selection.png';
import advanced_resources from '@site/static/images/clickstack/getting-started/advanced_resources.png';
import service_provisioned from '@site/static/images/clickstack/getting-started/service_provisioned.png';
import region_resources from '@site/static/images/clickstack/getting-started/region_resources.png';
import ResourceEstimation from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managing/_snippets/_resource_estimation.md';

:::note Scale vs Enterprise
ほとんどの ClickStack ワークロードには、この [Scale ティア](/cloud/manage/cloud-tiers) を推奨します。SAML、CMEK、HIPAA 準拠などの高度なセキュリティ機能が必要な場合は、Enterprise ティアを選択してください。Enterprise ティアでは、非常に大規模な ClickStack デプロイメント向けのカスタムハードウェアプロファイルも提供されます。そのような場合は、サポートまでお問い合わせください。
:::

Cloud プロバイダーとリージョンを選択します。

<Image img={region_resources} size="md" alt="リソースセレクター" border />

CPU とメモリを指定する際は、想定される ClickStack のインジェストスループットに基づいて見積もってください。以下の表は、これらのリソースのサイジングに関するガイドラインを示します。

<ResourceEstimation />

要件を指定すると、Managed ClickStack サービスのプロビジョニングに数分かかります。プロビジョニングを待つ間、[ClickHouse Cloud コンソール](/cloud/overview) の他の部分を自由に閲覧できます。

**プロビジョニングが完了すると、左側メニューの &#39;ClickStack&#39; オプションが有効になります。**
