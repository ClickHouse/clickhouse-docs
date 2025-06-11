---
description: 'Руководство по тестированию и оценке производительности аппаратного обеспечения с помощью ClickHouse'
sidebar_label: 'Тестирование оборудования'
sidebar_position: 54
slug: /operations/performance-test
title: 'Как протестировать ваше оборудование с ClickHouse'
---

import SelfManaged from '@site/i18n/docusaurus-plugin-content-docs/ru/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

Вы можете запустить базовый тест производительности ClickHouse на любом сервере без установки пакетов ClickHouse.


## Автоматический запуск {#automated-run}

Вы можете запустить тест с помощью одного скрипта.

1. Скачайте скрипт.
```bash
wget https://raw.githubusercontent.com/ClickHouse/ClickBench/main/hardware/hardware.sh
```

2. Запустите скрипт.
```bash
chmod a+x ./hardware.sh
./hardware.sh
```

3. Скопируйте вывод и отправьте его на feedback@clickhouse.com

Все результаты публикуются здесь: https://clickhouse.com/benchmark/hardware/
