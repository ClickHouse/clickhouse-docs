import BetaBadge from '@theme/badges/BetaBadge';



## JSON型のサポート {#json-type-support}

<BetaBadge />

:::warning ベータ機能 - 本番環境では未対応
**ClickStack**におけるJSON型のサポートは**ベータ機能**です。JSON型自体はClickHouse 25.3以降で本番環境対応済みですが、ClickStack内での統合は現在も活発に開発中であり、制限事項がある場合や、将来的に変更される可能性、またはバグが含まれる可能性があります。
:::

ClickStackは、バージョン`2.0.4`から[JSON型](/interfaces/formats/JSON)のベータサポートを提供しています。

この型の利点については、[JSON型の利点](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type)を参照してください。

JSON型のサポートを有効にするには、以下の環境変数を設定する必要があります:

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` - OTelコレクターでのサポートを有効にし、JSON型を使用したスキーマの作成を保証します。
- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` - HyperDXアプリケーションでのサポートを有効にし、JSONデータへのクエリを可能にします。
