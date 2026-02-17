import Image from '@theme/IdealImage';
import clickstack_managed_ui from '@site/static/images/clickstack/getting-started/clickstack_managed_ui.png';
import create_vector_datasource from '@site/static/images/clickstack/create-vector-datasource.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

&#39;Launch ClickStack&#39; を選択して ClickStack UI (HyperDX) にアクセスします。自動的に認証が行われ、リダイレクトされます。

<Tabs groupId="click-stackui-data-sources">
  <TabItem value="open-telemetry" label="OpenTelemetry" default>
    OpenTelemetry のデータについては、データソースがあらかじめ作成されています。

    <Image img={clickstack_managed_ui} size="lg" alt="ClickStack UI" />
  </TabItem>

  <TabItem value="vector" label="Vector" default>
    Vector を使用している場合は、データソースを自分で作成する必要があります。初回ログイン時にデータソース作成を促すメッセージが表示されます。以下に、ログ用データソースの設定例を示します。

    <Image img={create_vector_datasource} alt="Create datasource - vector" size="lg" />

    この設定は、タイムスタンプとして使用される `time_local` カラムを持つ Nginx 形式のスキーマを前提としています。可能であれば、これは PRIMARY KEY で定義されているタイムスタンプカラムであるべきです。**このカラムは必須です**。

    また、`Default SELECT` を更新し、ログビューで返されるカラムを明示的に指定することを推奨します。サービス名、ログレベル、または body カラムなどの追加フィールドがある場合は、それらも設定できます。テーブルの PRIMARY KEY で使用しているカラムと異なる場合は、表示用のタイムスタンプカラムも上書き設定できます。

    上記の例では、データに `Body` カラムは存在しません。その代わり、利用可能なフィールドから Nginx のログ行を再構築する SQL 式として定義しています。

    他に利用可能なオプションについては、[configuration reference](/use-cases/observability/clickstack/config) を参照してください。

    作成が完了すると、検索ビューに遷移し、すぐにデータの探索を開始できます。

    <Image img={clickstack_managed_ui} size="lg" alt="ClickStack UI" />
  </TabItem>
</Tabs>

<br />

以上で完了です。🎉

ClickStack を使って、ログやトレースの検索を開始し、ログ・トレース・メトリクスがリアルタイムにどのように相関付けられるかを確認し、ダッシュボードを構築し、サービスマップを探索し、イベントの差分やパターンを発見し、アラートを設定して問題を先回りで検知できるようにしましょう。
