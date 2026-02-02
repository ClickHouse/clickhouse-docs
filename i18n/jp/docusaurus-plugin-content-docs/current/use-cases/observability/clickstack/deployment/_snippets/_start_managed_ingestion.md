既存のアプリケーションやインフラストラクチャを計測する場合は、UI からリンクされている該当ガイドを参照してください。 

アプリケーションを計測してトレースとログを収集するには、[サポート対象言語向け SDKs](/use-cases/observability/clickstack/sdks) を使用してください。これらはデータを OpenTelemetry Collector に送信し、Managed ClickStack へのインジェストのためのゲートウェイとして機能します。 

ログは、エージェントモードで動作し同じ Collector にデータを転送する [OpenTelemetry Collector を使用して収集](/use-cases/observability/clickstack/integrations/host-logs) できます。Kubernetes を監視するには、[専用ガイド](/use-cases/observability/clickstack/integrations/kubernetes) に従ってください。その他の連携については、[クイックスタートガイド](/use-cases/observability/clickstack/integration-guides) を参照してください。

### デモデータ \{#demo-data\}

まだデータがない場合は、代わりに次のサンプルデータセットのいずれかを試してください。

- [サンプルデータセット](/use-cases/observability/clickstack/getting-started/sample-data) - 公開デモからサンプルデータセットを読み込み、簡単な問題を診断します。
- [ローカルファイルとメトリクス](/use-cases/observability/clickstack/getting-started/local-data) - ローカルの OTel collector を使用して、OSX または Linux 上のローカルファイルを読み込み、システムを監視します。