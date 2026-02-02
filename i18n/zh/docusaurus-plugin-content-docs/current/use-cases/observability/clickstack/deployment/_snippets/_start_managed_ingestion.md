如果你有现有的应用程序或基础设施需要进行仪表化，请在 UI 中导航到链接的相关指南。

要对应用进行仪表化以收集 traces 和 logs，请使用[支持的语言 SDKs](/use-cases/observability/clickstack/sdks)，这些 SDKs 会将数据发送到你的 OpenTelemetry Collector，由其作为网关将数据摄取到托管版 ClickStack 中。

日志可以通过以 agent 模式运行的 [OpenTelemetry Collectors 收集](/use-cases/observability/clickstack/integrations/host-logs)，并将数据转发到同一个 Collector。对于 Kubernetes 监控，请参考[专门的指南](/use-cases/observability/clickstack/integrations/kubernetes)。对于其他集成，请参阅我们的[快速入门指南](/use-cases/observability/clickstack/integration-guides)。

### 演示数据 \{#demo-data\}

或者，如果你还没有现有数据，可以试用我们的示例数据集。

- [示例数据集](/use-cases/observability/clickstack/getting-started/sample-data) - 从我们的公共演示中加载一个示例数据集，用于诊断一个简单的故障。
- [本地文件和指标](/use-cases/observability/clickstack/getting-started/local-data) - 加载本地文件，并使用本地 OTel collector 在 OSX 或 Linux 上监控系统。