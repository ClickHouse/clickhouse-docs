

import BetaBadge from '@theme/badges/BetaBadge';

## JSONタイプサポート {#json-type-support}

<BetaBadge/>

ClickStackはバージョン `2.0.4` から [JSONタイプ](/interfaces/formats/JSON) に対するベータサポートを提供しています。

このタイプの利点については、[JSONタイプの利点](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type)を参照してください。

JSONタイプのサポートを有効にするためには、ユーザーは以下の環境変数を設定する必要があります：

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` - OTelコレクターでのサポートを有効にし、JSONタイプを使用してスキーマが作成されることを保証します。
- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` - HyperDXアプリケーションでのサポートを有効にし、JSONデータをクエリできるようにします。
