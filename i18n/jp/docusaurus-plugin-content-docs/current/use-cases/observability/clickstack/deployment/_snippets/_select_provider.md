import Image from '@theme/IdealImage';
import provider_selection from '@site/static/images/clickstack/getting-started/provider_selection.png';
import advanced_resources from '@site/static/images/clickstack/getting-started/advanced_resources.png';
import service_provisioned from '@site/static/images/clickstack/getting-started/service_provisioned.png';
import region_resources from '@site/static/images/clickstack/getting-started/region_resources.png';

:::note Scale vs Enterprise
ほとんどの ClickStack ワークロードには、この [Scale ティア](/cloud/manage/cloud-tiers) を推奨します。SAML、CMEK、HIPAA 準拠などの高度なセキュリティ機能が必要な場合は、Enterprise ティアを選択してください。Enterprise ティアでは、非常に大規模な ClickStack デプロイメント向けのカスタムハードウェアプロファイルも提供されます。そのような場合は、サポートまでお問い合わせください。
:::

Cloud プロバイダーとリージョンを選択します。

<Image img={region_resources} size="md" alt="リソースセレクター" border />

CPU とメモリを指定する際は、想定される ClickStack のインジェストスループットに基づいて見積もってください。以下の表は、これらのリソースのサイジングに関するガイドラインを示します。

| Monthly ingest volume | Recommended compute  |
| --------------------- | -------------------- |
| &lt; 10 TB / month    | 2 vCPU × 3 replicas  |
| 10–50 TB / month      | 4 vCPU × 3 replicas  |
| 50–100 TB / month     | 8 vCPU × 3 replicas  |
| 100–500 TB / month    | 30 vCPU × 3 replicas |
| 1 PB+ / month         | 59 vCPU × 3 replicas |

これらの推奨値は、次の前提に基づいています。

* データ量は、月あたりの**非圧縮のインジェスト量**を指し、ログおよびトレースの両方に適用されます。
* クエリパターンはオブザーバビリティ用途として一般的なものであり、ほとんどのクエリは通常直近 24 時間のような**最新データ**を対象とします。
* インジェストは月全体で比較的**均一**であることを想定しています。バーストトラフィックやスパイクが見込まれる場合は、追加の余裕を見込んでプロビジョニングしてください。
* ストレージは ClickHouse Cloud のオブジェクトストレージによって個別に処理され、保持期間の制約要因にはなりません。長期間保持されるデータは、頻繁にはアクセスされないことを前提としています。

より長い期間にわたるクエリ、重い集約処理、大量の同時ユーザー数を定常的にサポートするアクセスパターンがある場合は、さらに多くのコンピュートリソースが必要になる可能性があります。

2 つのレプリカでも、特定のインジェストスループットに対する CPU およびメモリ要件を満たすことはできますが、可能であれば 3 つのレプリカを使用して同じ合計キャパシティを確保しつつ、サービスの冗長性を高めることを推奨します。

:::note
これらの値は**あくまで推定値**であり、初期のベースラインとして使用してください。実際の要件は、クエリの複雑さ、同時実行数、保持ポリシー、およびインジェストスループットの変動に依存します。常にリソース使用状況を監視し、必要に応じてスケールしてください。
:::

要件を指定すると、Managed ClickStack サービスのプロビジョニングに数分かかります。プロビジョニングを待つ間、[ClickHouse Cloud コンソール](/cloud/overview) の他の部分を自由に閲覧できます。

**プロビジョニングが完了すると、左側メニューの &#39;ClickStack&#39; オプションが有効になります。**
