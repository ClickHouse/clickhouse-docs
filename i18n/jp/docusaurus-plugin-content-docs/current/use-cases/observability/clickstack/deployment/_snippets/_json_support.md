import BetaBadge from '@theme/badges/BetaBadge';



## JSON 型サポート {#json-type-support}

<BetaBadge/>

:::warning ベータ機能 - 本番運用には未対応
**ClickStack** における JSON 型サポートは **ベータ機能** です。JSON 型自体は ClickHouse 25.3+ で本番運用可能な状態ですが、ClickStack への統合は現在も活発に開発が進められており、制限があったり、将来変更されたり、不具合を含む可能性があります。
:::

ClickStack はバージョン `2.0.4` から [JSON type](/interfaces/formats/JSON) のベータサポートを提供しています。

この型の利点については、[Benefits of the JSON type](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type) を参照してください。

JSON 型サポートを有効にするには、次の環境変数を設定する必要があります。

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` - OTel collector でのサポートを有効にし、スキーマが JSON 型を使用して作成されるようにします。
- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` - HyperDX アプリケーションでのサポートを有効にし、JSON データをクエリできるようにします。
