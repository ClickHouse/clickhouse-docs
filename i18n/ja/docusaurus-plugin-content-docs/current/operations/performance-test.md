---
slug: /operations/performance-test
sidebar_position: 54
sidebar_label: ハードウェアのテスト
title: "ClickHouseを使用したハードウェアテストの方法"
---

import SelfManaged from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouseパッケージをインストールせずに、任意のサーバー上で基本的なClickHouseパフォーマンステストを実行できます。


## 自動実行 {#automated-run}

シングルスクリプトでベンチマークを実行できます。

1. スクリプトをダウンロードします。
```bash
wget https://raw.githubusercontent.com/ClickHouse/ClickBench/main/hardware/hardware.sh
```

2. スクリプトを実行します。
```bash
chmod a+x ./hardware.sh
./hardware.sh
```

3. 出力結果をコピーして、feedback@clickhouse.comに送信します。

すべての結果はここに公開されています: https://clickhouse.com/benchmark/hardware/
