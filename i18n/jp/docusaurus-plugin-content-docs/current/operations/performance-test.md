---
'description': 'Guide to testing and benchmarking hardware performance with ClickHouse'
'sidebar_label': 'Testing Hardware'
'sidebar_position': 54
'slug': '/operations/performance-test'
'title': 'How to Test Your Hardware with ClickHouse'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouseの基本的なパフォーマンステストを、ClickHouseパッケージをインストールすることなく、任意のサーバーで実行できます。

## 自動実行 {#automated-run}

単一のスクリプトでベンチマークを実行できます。

1. スクリプトをダウンロードします。
```bash
wget https://raw.githubusercontent.com/ClickHouse/ClickBench/main/hardware/hardware.sh
```

2. スクリプトを実行します。
```bash
chmod a+x ./hardware.sh
./hardware.sh
```

3. 出力をコピーして、feedback@clickhouse.comに送信します。

すべての結果はここに公開されています: https://clickhouse.com/benchmark/hardware/
