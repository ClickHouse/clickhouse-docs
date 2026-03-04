---
description: 'Составные протоколы позволяют более гибко настраивать TCP-доступ
  к серверу ClickHouse.'
sidebar_label: 'Составные протоколы'
sidebar_position: 64
slug: /operations/settings/composable-protocols
title: 'Составные протоколы'
doc_type: 'reference'
---

# Компонуемые протоколы \{#composable-protocols\}

## Обзор \{#overview\}

Составные протоколы позволяют более гибко настраивать TCP‑доступ к
серверу ClickHouse. Эта конфигурация может использоваться параллельно с традиционной
конфигурацией или полностью её заменять.

## Настройка компонуемых протоколов \{#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml\}

Компонуемые протоколы настраиваются в конфигурационном XML-файле. Раздел протоколов
обозначается тегами `protocols` в XML-файле конфигурации:

```xml
<protocols>

</protocols>
```

### Настройка уровней протокола \{#basic-modules-define-protocol-layers\}

Вы можете задавать уровни протокола с помощью базовых модулей. Например, чтобы задать
уровень HTTP, вы можете добавить новый базовый модуль в раздел `protocols`:

```xml
<protocols>

  <!-- plain_http module -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```

Модули можно настраивать по следующим параметрам:

* `plain_http` - имя, на которое может ссылаться другой слой
* `type` - обозначает обработчик протокола, который будет создан для обработки данных.
  Поддерживаются следующие предопределённые обработчики протоколов:
  * `tcp` - собственный обработчик протокола ClickHouse
  * `http` - HTTP-обработчик протокола ClickHouse
  * `tls` - слой шифрования TLS
  * `proxy1` - слой PROXYv1
  * `mysql` - обработчик протокола совместимости с MySQL
  * `postgres` - обработчик протокола совместимости с PostgreSQL
  * `prometheus` - обработчик протокола Prometheus
  * `interserver` - межсерверный обработчик ClickHouse

:::note
Обработчик протокола `gRPC` не реализован для `Composable protocols`.
:::

### Настройка конечных точек \{#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags\}

Конечные точки (прослушивающие порты) задаются с помощью тегов `<port>` и
необязательного `<host>`.
Например, чтобы настроить конечную точку на ранее добавленном HTTP-слое, мы
можем изменить нашу конфигурацию следующим образом:

```xml
<protocols>

  <plain_http>

    <type>http</type>
    <!-- endpoint -->
    <host>127.0.0.1</host>
    <port>8123</port>

  </plain_http>

</protocols>
```

Если тег `<host>` опущен, используется `<listen_host>` из корневой конфигурации.

### Настройка последовательностей слоёв \{#layers-sequence-is-defined-by-impl-tag-referencing-another-module\}

Последовательности слоёв задаются с помощью тега `<impl>`, ссылающегося на другой
модуль. Например, чтобы настроить слой TLS поверх нашего модуля plain&#95;http,
мы могли бы дополнительно изменить конфигурацию следующим образом:

```xml
<protocols>

  <!-- http module -->
  <plain_http>
    <type>http</type>
  </plain_http>

  <!-- https module configured as a tls layer on top of plain_http module -->
  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```

### Привязка конечных точек к слоям \{#endpoint-can-be-attached-to-any-layer\}

Конечные точки можно привязывать к любому слою. Например, мы можем определить конечные точки для
HTTP (порт 8123) и HTTPS (порт 8443):

```xml
<protocols>

  <plain_http>
    <type>http</type>
    <host>127.0.0.1</host>
    <port>8123</port>
  </plain_http>

  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```

### Определение дополнительных конечных точек \{#additional-endpoints-can-be-defined-by-referencing-any-module-and-omitting-type-tag\}

Дополнительные конечные точки можно задать, ссылаясь на любой модуль и опуская
тег `<type>`. Например, мы можем задать конечную точку `another_http` для
модуля `plain_http` следующим образом:

```xml
<protocols>

  <plain_http>
    <type>http</type>
    <host>127.0.0.1</host>
    <port>8123</port>
  </plain_http>

  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

  <another_http>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8223</port>
  </another_http>

</protocols>
```

### Пользовательские HTTP‑обработчики для каждого endpoint \{#custom-http-handlers-per-endpoint\}

По умолчанию все записи протокола с `type=http` используют одну и ту же конфигурацию `<http_handlers>`. Это можно переопределить, добавив тег `<handlers>`, который указывает на другой конфигурационный раздел. Это позволяет каждому HTTP‑порту обслуживать свой собственный набор правил HTTP‑маршрутизации.

Например, чтобы запустить альтернативный HTTP API на порту 8124 с собственными обработчиками:

```xml
<protocols>

  <plain_http>
    <type>http</type>
    <host>127.0.0.1</host>
    <port>8123</port>
  </plain_http>

  <alt_http>
    <type>http</type>
    <host>127.0.0.1</host>
    <port>8124</port>
    <handlers>http_handlers_alt</handlers>
  </alt_http>

</protocols>

<!-- Default handlers used by plain_http (port 8123) -->
<http_handlers>
    <defaults/>
</http_handlers>

<!-- Alternative handlers used by alt_http (port 8124) -->
<http_handlers_alt>
    <rule>
        <url>/custom</url>
        <handler>
            <type>predefined_query_handler</type>
            <query>SELECT 'custom_endpoint'</query>
        </handler>
    </rule>
    <defaults/>
</http_handlers_alt>
```

В этом примере запросы к порту 8123 используют стандартные правила `<http_handlers>`,
в то время как запросы к порту 8124 используют правила `<http_handlers_alt>`. Если `<handlers>`
не указан, для конечной точки используется `<http_handlers>` по умолчанию.

Раздел пользовательских обработчиков имеет тот же формат, что и
[`<http_handlers>`](/docs/en/operations/server-configuration-parameters/settings#http_handlers).
Изменения в разделе пользовательских обработчиков обнаруживаются при перезагрузке конфигурации, и
соответствующая конечная точка автоматически перезапускается.

### Указание дополнительных параметров слоя \{#some-modules-can-contain-specific-for-its-layer-parameters\}

Некоторые модули могут иметь дополнительные параметры слоя. Например, слой TLS
позволяет задать закрытый ключ (`privateKeyFile`) и файлы сертификатов (`certificateFile`)
следующим образом:

```xml
<protocols>

  <plain_http>
    <type>http</type>
    <host>127.0.0.1</host>
    <port>8123</port>
  </plain_http>

  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
    <privateKeyFile>another_server.key</privateKeyFile>
    <certificateFile>another_server.crt</certificateFile>
  </https>

</protocols>
```
