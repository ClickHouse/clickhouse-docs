import BetaBadge from '@theme/badges/BetaBadge';

## JSON 型サポート \{#json-type-support\}

<BetaBadge/>

:::warning ベータ機能 - 本番環境向けではありません
**ClickStack** における JSON 型サポートは **ベータ機能** です。JSON 型自体は ClickHouse 25.3+ では本番環境向けとして利用可能ですが、ClickStack との統合はまだ積極的に開発中であり、制限があったり、将来的に変更されたり、不具合を含む可能性があります。
:::

ClickStack では、バージョン `2.0.4` 以降で [JSON 型](/interfaces/formats/JSON) をベータ機能としてサポートしています。

この型の利点については [JSON 型の利点](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type) を参照してください。

JSON 型のサポートを有効にするには、以下の環境変数を設定する必要があります。

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` - OTel collector でのサポートを有効にし、スキーマが JSON 型を使用して作成されるようにします。
- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` - HyperDX アプリケーションでのサポートを有効にし、JSON データに対してクエリを実行できるようにします。