---
slug: /operations/performance-test
sidebar_position: 54
sidebar_label: ハードウェアのテスト
title: "ClickHouseでハードウェアをテストする方法"
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouseパッケージをインストールせずに、任意のサーバーで基本的なClickHouseパフォーマンステストを実行できます。


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

3. 結果をコピーして feedback@clickhouse.com に送信します。

すべての結果はここに公開されています: https://clickhouse.com/benchmark/hardware/
