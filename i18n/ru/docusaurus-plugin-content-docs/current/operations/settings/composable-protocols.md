---
description: 'Композиционные протоколы обеспечивают более гибкую конфигурацию TCP-доступа
  к серверу ClickHouse.'
sidebar_label: 'Композиционные протоколы'
sidebar_position: 64
slug: /operations/settings/composable-protocols
title: 'Композиционные протоколы'
doc_type: 'reference'
---



# Составные протоколы



## Обзор {#overview}

Компонуемые протоколы позволяют более гибко настраивать доступ по TCP к 
серверу ClickHouse. Такая конфигурация может сосуществовать с традиционной 
или полностью её заменять.



## Настройка компонуемых протоколов

Компонуемые протоколы можно настраивать в XML-файле конфигурации. Раздел протоколов
задается тегами `protocols` в XML-файле конфигурации:

```xml
<protocols>

</protocols>
```

### Конфигурирование уровней протокола

Вы можете задавать уровни протокола с помощью базовых модулей. Например, чтобы задать
уровень HTTP, добавьте новый базовый модуль в раздел `protocols`:

```xml
<protocols>

  <!-- модуль plain_http -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```

Модули настраиваются с помощью следующих параметров:

* `plain_http` — имя, на которое может ссылаться другой слой
* `type` — обозначает обработчик протокола, который будет создан для обработки данных.
  Предусмотрен следующий набор предопределённых обработчиков протоколов:
  * `tcp` — нативный обработчик протокола ClickHouse
  * `http` — HTTP-обработчик протокола ClickHouse
  * `tls` — слой шифрования TLS
  * `proxy1` — слой PROXYv1
  * `mysql` — обработчик протокола совместимости с MySQL
  * `postgres` — обработчик протокола совместимости с PostgreSQL
  * `prometheus` — обработчик протокола Prometheus
  * `interserver` — межсерверный обработчик ClickHouse

:::note
Обработчик протокола `gRPC` не реализован для `Composable protocols`
:::

### Настройка конечных точек

Конечные точки (слушающие порты) задаются тегами `<port>` и необязательным тегом `<host>`.
Например, чтобы настроить конечную точку на ранее добавленном HTTP-слое, мы
можем изменить конфигурацию следующим образом:

```xml
<protocols>

  <plain_http>

    <type>http</type>
    <!-- эндпоинт -->
    <host>127.0.0.1</host>
    <port>8123</port>

  </plain_http>

</protocols>
```

Если тег `<host>` опущен, используется `<listen_host>` из корневой конфигурации.

### Настройка последовательностей слоёв

Последовательности слоёв задаются с помощью тега `<impl>`, который ссылается на другой
модуль. Например, чтобы настроить слой TLS поверх нашего модуля plain&#95;http,
мы можем дополнительно изменить конфигурацию следующим образом:

```xml
<protocols>

  <!-- модуль http -->
  <plain_http>
    <type>http</type>
  </plain_http>

  <!-- модуль https, настроенный как TLS-слой поверх модуля plain_http -->
  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```

### Привязка конечных точек к слоям

Конечные точки можно привязывать к любому слою. Например, можно задать конечные точки для HTTP (порт 8123) и HTTPS (порт 8443):

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

### Определение дополнительных конечных точек

Дополнительные конечные точки можно определить, указав любой модуль и опустив
тег `<type>`. Например, мы можем определить конечную точку `another_http` для модуля
`plain_http` следующим образом:

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
```


</protocols>
```

### Указание дополнительных параметров уровня {#some-modules-can-contain-specific-for-its-layer-parameters}

Некоторые модули могут содержать дополнительные параметры уровня. Например, уровень TLS
позволяет указать файл закрытого ключа (`privateKeyFile`) и файл сертификата (`certificateFile`)
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
