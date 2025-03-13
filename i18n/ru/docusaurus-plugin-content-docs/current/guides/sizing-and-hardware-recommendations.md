---
slug: /guides/sizing-and-hardware-recommendations
sidebar_label: Рекомендации по размеру и оборудованию
sidebar_position: 4
---


# Рекомендации по размеру и оборудованию

Этот гид обсуждает наши общие рекомендации по аппаратному обеспечению, вычислениям, памяти и конфигурациям дисков для пользователей с открытым исходным кодом. Если вы хотите упростить свою настройку, мы рекомендуем использовать [ClickHouse Cloud](https://clickhouse.com/cloud), так как он автоматически масштабируется и адаптируется к вашим рабочим нагрузкам, минимизируя затраты на управление инфраструктурой.

Конфигурация вашего кластера ClickHouse сильно зависит от использования вашего приложения и паттернов рабочей нагрузки. При планировании вашей архитектуры вы должны учитывать следующие факторы:

- Конкурентность (запросы в секунду)
- Пропускная способность (строки, обрабатываемые в секунду)
- Объем данных
- Политика хранения данных
- Затраты на оборудование
- Затраты на обслуживание

## Диск {#disk}

Тип(ы) дисков, которые вы должны использовать с ClickHouse, зависят от объема данных, задержки или требований к пропускной способности.

### Оптимизация для производительности {#optimizing-for-performance}

Для максимизации производительности мы рекомендуем напрямую подключать [объемы SSD с предоставленным IOPS от AWS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/provisioned-iops.html) или аналогичное предложение от вашего облачного провайдера, что оптимизирует ввод-вывод.

### Оптимизация для снижения затрат на хранение {#optimizing-for-storage-costs}

Для снижения затрат вы можете использовать [объемы SSD EBS общего назначения](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose.html).

Вы также можете реализовать многослойное хранилище, используя SSD и HDD в архитектуре [горячего/теплого/холодного хранения](/guides/developer/ttl#implementing-a-hotwarmcold-architecture). Кроме того, возможно использование [AWS S3](https://aws.amazon.com/s3/) для хранения, чтобы разделить вычисления и хранение. Пожалуйста, ознакомьтесь с нашей инструкцией по использованию ClickHouse с открытым исходным кодом и разделением вычислений и хранения [здесь](/guides/separation-storage-compute). Разделение вычислений и хранения доступно по умолчанию в ClickHouse Cloud.

## CPU {#cpu}

### Какой CPU мне следует использовать? {#which-cpu-should-i-use}

Тип CPU, который вы должны использовать, зависит от вашего паттерна использования. В общем, однако, приложения с множеством частых конкурентных запросов, которые обрабатывают больше данных или используют ресурсоемкие UDF, потребуют больше ядер CPU.

**Приложения с низкой задержкой или интерфейсом для клиентов**

Для требований по задержке в десятках миллисекунд, таких как для задач, ориентированных на клиентов, мы рекомендуем серию EC2 [i3](https://aws.amazon.com/ec2/instance-types/i3/) или [i4i](https://aws.amazon.com/ec2/instance-types/i4i/) от AWS или аналогичные предложения от вашего облачного провайдера, которые оптимизированы для ввода-вывода.

**Приложения с высокой конкурентностью**

Для рабочих нагрузок, которым необходимо оптимизировать конкурентность (100+ запросов в секунду), мы рекомендуем серию [C, оптимизированную для вычислений](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized) от AWS или аналогичное предложение от вашего облачного провайдера.

**Случай использования хранения данных**

Для рабочих нагрузок по хранению данных и выборочных аналитических запросов мы рекомендуем серию [R, оптимизированную по памяти](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized) от AWS или аналогичное предложение от вашего облачного провайдера, так как они оптимизированы по памяти.

---

### Какова должна быть загрузка CPU? {#what-should-cpu-utilization-be}

Нет стандартной цели по загрузке CPU для ClickHouse. Используйте инструмент, такой как [iostat](https://linux.die.net/man/1/iostat), чтобы измерять среднее использование CPU, и соответственно настраивайте размер ваших серверов для управления неожиданными всплесками трафика. Однако для аналитических или хранилищевых случаев использования с выборочными запросами вы должны нацеливаться на 10-20% использования CPU.

### Сколько ядер CPU мне следует использовать? {#how-many-cpu-cores-should-i-use}

Количество CPU, которое вы должны использовать, зависит от вашей рабочей нагрузки. Тем не менее, мы в общем рекомендуем следующие соотношения оперативной памяти к ядрам CPU в зависимости от типа вашего CPU:

- **[M-type](https://aws.amazon.com/ec2/instance-types/) (случаи общего назначения):** 4:1 соотношение памяти к ядрам CPU
- **[R-type](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized) (случаи использования хранилищ данных):** 8:1 соотношение памяти к ядрам CPU
- **[C-type](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized) (случаи, оптимизированные для вычислений):** 2:1 соотношение памяти к ядрам CPU

Например, при использовании M-type CPU мы рекомендуем выделять 100 ГБ памяти на каждые 25 ядер CPU. Чтобы определить, сколько памяти подходит для вашего приложения, необходимо профилирование использования памяти. Вы можете прочитать [этот гид по отладке проблем с памятью](/guides/developer/debugging-memory-issues) или использовать [встроенную панель мониторинга](/operations/monitoring) для отслеживания ClickHouse.

## Память {#memory}

Как и ваш выбор CPU, ваше соотношение памяти к хранилищу и памяти к CPU зависит от вашего случая. В общем, однако, чем больше у вас памяти, тем быстрее будут выполняться ваши запросы. Если ваше применение чувствительно к цене, меньшие объемы памяти также подходят, так как возможно включение настроек ([max_bytes_before_external_group_by](/operations/settings/query-complexity#settings-max_bytes_before_external_group_by) и [max_bytes_before_external_sort](/operations/settings/query-complexity#settings-max_bytes_before_external_sort)), чтобы разрешить сброс данных на диск, но обратите внимание, что это может значительно повлиять на производительность запросов.

### Каково должно быть соотношение памяти к хранилищу? {#what-should-the-memory-to-storage-ratio-be}

Для малых объемов данных приемлемо соотношение памяти к хранилищу 1:1, но общая память не должна быть меньше 8 ГБ.

Для сценариев с длительными сроками хранения данных или с высокими объемами данных мы рекомендуем соотношение памяти к хранилищу от 1:100 до 1:130. Например, 100 ГБ ОЗУ на каждую реплику, если вы храните 10 ТБ данных.

Для сценариев с частым доступом, таких как рабочие нагрузки для клиентов, мы рекомендуем использовать больше памяти с соотношением от 1:30 до 1:50.

## Реплики {#replicas}

Мы рекомендуем иметь как минимум три реплики на шард (или две реплики с [Amazon EBS](https://aws.amazon.com/ebs/)). Кроме того, мы предлагаем вертикально масштабировать все реплики перед добавлением дополнительных реплик (горизонтальное масштабирование).

ClickHouse не выполняет автоматическое шардирование, и перешардинг вашего набора данных потребует значительных вычислительных ресурсов. Поэтому мы в общем рекомендуем использовать самый мощный сервер, доступный для предотвращения необходимости перешардинга ваших данных в будущем.

Рассмотрите возможность использования [ClickHouse Cloud](https://clickhouse.com/cloud), который автоматически масштабируется и позволяет вам легко контролировать количество реплик для вашего случая использования.

## Примерные конфигурации для крупных рабочих нагрузок {#example-configurations-for-large-workloads}

Конфигурации ClickHouse сильно зависят от конкретных требований вашего приложения. Пожалуйста, [свяжитесь с отделом продаж](https://clickhouse.com/company/contact?loc=docs-sizing-and-hardware-recommendations), если вы хотите, чтобы мы помогли оптимизировать вашу архитектуру по стоимости и производительности.

Чтобы предоставить руководство (а не рекомендации), следующие примеры конфигураций пользователей ClickHouse в производстве:

### Fortune 500 B2B SaaS {#fortune-500-b2b-saas}

<table>
    <tr>
        <td col="2"><strong><em>Хранение</em></strong></td>
    </tr>
    <tr>
        <td><strong>Объем новых данных в месяц</strong></td>
        <td>30TB</td>
    </tr>
    <tr>
        <td><strong>Общий объем хранения (сжатый)</strong></td>
        <td>540TB</td>
    </tr>
    <tr>
        <td><strong>Срок хранения данных</strong></td>
        <td>18 месяцев</td>
    </tr>
    <tr>
        <td><strong>Диск на узел</strong></td>
        <td>25TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>Конкурентность</strong></td>
        <td>200+ конкурентных запросов</td>
    </tr>
    <tr>
        <td><strong>Количество реплик (включая пару HA)</strong></td>
        <td>44</td>
    </tr>
    <tr>
        <td><strong>vCPU на узел</strong></td>
        <td>62</td>
    </tr>
    <tr>
        <td><strong>Общее количество vCPU</strong></td>
        <td>2700</td>
    </tr>
    <tr>
        <td col="2"><strong><em>Память</em></strong></td>
    </tr>
    <tr>
        <td><strong>Общая ОЗУ</strong></td>
        <td>11TB</td>
    </tr>
    <tr>
        <td><strong>ОЗУ на реплику</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>Соотношение ОЗУ к vCPU</strong></td>
        <td>4:1</td>
    </tr>
    <tr>
        <td><strong>Соотношение ОЗУ к диску</strong></td>
        <td>1:50</td>
    </tr>
</table>

### Fortune 500 Телеком Оператор для случая использования логирования {#fortune-500-telecom-operator-for-a-logging-use-case}

<table>
    <tr>
        <td col="2"><strong><em>Хранение</em></strong></td>
    </tr>
    <tr>
        <td><strong>Объем данных журналов в месяц</strong></td>
        <td>4860TB</td>
    </tr>
    <tr>
        <td><strong>Общий объем хранения (сжатый)</strong></td>
        <td>608TB</td>
    </tr>
    <tr>
        <td><strong>Срок хранения данных</strong></td>
        <td>30 дней</td>
    </tr>
    <tr>
        <td><strong>Диск на узел</strong></td>
        <td>13TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>Количество реплик (включая пару HA)</strong></td>
        <td>38</td>
    </tr>
    <tr>
        <td><strong>vCPU на узел</strong></td>
        <td>42</td>
    </tr>
    <tr>
        <td><strong>Общее количество vCPU</strong></td>
        <td>1600</td>
    </tr>
    <tr>
        <td col="2"><strong><em>Память</em></strong></td>
    </tr>
    <tr>
        <td><strong>Общая ОЗУ</strong></td>
        <td>10TB</td>
    </tr>
    <tr>
        <td><strong>ОЗУ на реплику</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>Соотношение ОЗУ к vCPU</strong></td>
        <td>6:1</td>
    </tr>
    <tr>
        <td><strong>Соотношение ОЗУ к диску</strong></td>
        <td>1:60</td>
    </tr>
</table>

## Дополнительное чтение {#further-reading}

Ниже приведены опубликованные блоги о архитектуре от компаний, использующих ClickHouse с открытым исходным кодом:

- [Cloudflare](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/?utm_source=linkedin&utm_medium=social&utm_campaign=blog)
- [eBay](https://innovation.ebayinc.com/tech/engineering/ou-online-analytical-processing/)
- [GitLab](https://handbook.gitlab.com/handbook/engineering/development/ops/monitor/observability/#clickhouse-datastore)
- [Lyft](https://eng.lyft.com/druid-deprecation-and-clickhouse-adoption-at-lyft-120af37651fd)
- [MessageBird](https://clickhouse.com/blog/how-messagebird-uses-clickhouse-to-monitor-the-delivery-of-billions-of-messages)
- [Microsoft](https://clickhouse.com/blog/self-service-data-analytics-for-microsofts-biggest-web-properties)
- [Uber](https://www.uber.com/en-ES/blog/logging/)
- [Zomato](https://blog.zomato.com/building-a-cost-effective-logging-platform-using-clickhouse-for-petabyte-scale)
