## schema の選択: Map vs JSON \{#schema-choice-map-vs-json\}

ClickStack では、デフォルトで属性を `Map(LowCardinality(String), String)` カラムに格納します。これはオブザーバビリティのワークロードに推奨される schema です。[バケット化された map のシリアライゼーション](/sql-reference/data-types/map#bucketed-map-serialization) と、map のキーおよび値に対するテキスト索引を組み合わせることで、動的な JSON subcolumns で発生するキーごとの取り込みオーバーヘッドなしに、必要な項目を選択的に検索できます。

`JSON` 型の schema は、属性キーの集合が小さく安定しているワークロードでの評価用として、ベータで利用できます。ただし、デフォルトとしては**推奨されません**。完全な比較と、JSON サポートを有効にするために必要な環境変数については、[Map vs JSON type](/use-cases/observability/clickstack/ingesting-data/schema/map-vs-json) を参照してください。