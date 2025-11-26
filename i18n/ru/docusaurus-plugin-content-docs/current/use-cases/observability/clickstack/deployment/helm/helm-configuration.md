---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Конфигурация Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'Настройка ключей API, секретов и входного шлюза для развертываний ClickStack с помощью Helm'
doc_type: 'guide'
keywords: ['конфигурация ClickStack', 'секреты Helm', 'настройка ключей API', 'конфигурация входного шлюза', 'настройка TLS']
---

В этом руководстве рассматриваются варианты конфигурации для развертываний ClickStack с помощью Helm. Базовую установку см. в [основном руководстве по развертыванию с помощью Helm](/docs/use-cases/observability/clickstack/deployment/helm).



## Настройка ключа API

После успешного развертывания ClickStack настройте ключ API, чтобы включить сбор телеметрических данных:

1. **Откройте экземпляр HyperDX** через настроенный входной шлюз или конечную точку сервиса
2. **Войдите в панель управления HyperDX** и перейдите в раздел Team Settings, чтобы сгенерировать или получить ключ API
3. **Обновите развертывание**, указав ключ API одним из следующих способов:

### Способ 1: Обновление через helm upgrade с файлом values

Добавьте ключ API в `values.yaml`:

```yaml
hyperdx:
  apiKey: "your-api-key-here"
```

Затем обновите развертывание:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

### Метод 2: Обновление через `helm upgrade` с флагом `--set`

```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="ваш-api-ключ-здесь"
```

### Перезапустите поды, чтобы применить изменения

После обновления API-ключа перезапустите поды, чтобы они загрузили обновлённую конфигурацию:

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
Чарт автоматически создаёт секрет Kubernetes (`<release-name>-app-secrets`) с вашим API-ключом. Дополнительная конфигурация секрета не требуется, если только вы не планируете использовать внешний секрет.
:::


## Управление секретами

Для работы с конфиденциальными данными, такими как API-ключи или учетные данные базы данных, используйте секреты Kubernetes.

### Использование предварительно настроенных секретов

Helm-чарт включает шаблон секрета по умолчанию, расположенный по пути [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml). Этот файл задает базовую структуру для управления секретами.

Если вам нужно вручную применить секрет, измените и примените предоставленный шаблон `secrets.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: hyperdx-secret
  annotations:
    "helm.sh/resource-policy": keep
type: Opaque
data:
  API_KEY: <base64-encoded-api-key>
```

Примените секрет в кластере:

```shell
kubectl apply -f secrets.yaml
```

### Создание пользовательского секрета

Создайте вручную пользовательский секрет Kubernetes:

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

### Ссылка на секрет в файле values.yaml

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```


## Настройка входного шлюза

Чтобы открыть доступ к интерфейсу HyperDX и API через доменное имя, включите входной шлюз в файле `values.yaml`.

### Общая конфигурация входного шлюза

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # Должен совпадать с хостом входного шлюза
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note Важное замечание по конфигурации
`hyperdx.frontendUrl` должен соответствовать хосту Входного шлюза и включать протокол (например, `https://hyperdx.yourdomain.com`). Это обеспечивает корректную работу всех сгенерированных ссылок, файлов cookie и перенаправлений.
:::

### Включение TLS (HTTPS)

Чтобы защитить развертывание с помощью HTTPS:

**1. Создайте секрет TLS с вашим сертификатом и ключом:**

```shell
kubectl create secret tls hyperdx-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**2. Включите TLS в конфигурации Входного шлюза:**

```yaml
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
      tlsSecretName: "hyperdx-tls"
```

### Пример конфигурации входного шлюза

Для справки приведём пример того, как выглядит сгенерированный ресурс входного шлюза:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hyperdx-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$1
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  rules:
    - host: hyperdx.yourdomain.com
      http:
        paths:
          - path: /(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: my-clickstack-clickstack-app
                port:
                  number: 3000
  tls:
    - hosts:
        - hyperdx.yourdomain.com
      secretName: hyperdx-tls
```

### Распространённые подводные камни при настройке входного шлюза

**Настройка пути и перезаписи:**

* Для Next.js и других SPA всегда используйте путь с регулярным выражением и аннотацию перезаписи, как показано выше
* Не используйте только `path: /` без перезаписи, так как это нарушит отдачу статических ресурсов

**Несоответствие `frontendUrl` и `ingress.host`:**

* Если они не совпадают, вы можете столкнуться с проблемами с cookie, перенаправлениями и загрузкой ресурсов

**Некорректная настройка TLS:**

* Убедитесь, что ваш секрет TLS действителен и корректно указан во входном шлюзе
* Браузеры могут блокировать небезопасный контент, если вы обращаетесь к приложению по HTTP при включённом TLS

**Версия контроллера входного шлюза:**

* Некоторые возможности (например, пути с регулярными выражениями и перезаписи) требуют более новых версий контроллера nginx ingress
* Проверьте свою версию с помощью:

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```


## Входной шлюз для OTel collector

Если вам нужно открыть конечные точки OTel collector (для трассировок, метрик, логов) через входной шлюз, используйте параметр конфигурации `additionalIngresses`. Это полезно для отправки телеметрических данных извне кластера или использования пользовательского домена для OTel collector.

```yaml
hyperdx:
  ingress:
    enabled: true
    additionalIngresses:
      - name: otel-collector
        annotations:
          nginx.ingress.kubernetes.io/ssl-redirect: "false"
          nginx.ingress.kubernetes.io/force-ssl-redirect: "false"
          nginx.ingress.kubernetes.io/use-regex: "true"
        ingressClassName: nginx
        hosts:
          - host: collector.yourdomain.com
            paths:
              - path: /v1/(traces|metrics|logs)
                pathType: Prefix
                port: 4318
                name: otel-collector
        tls:
          - hosts:
              - collector.yourdomain.com
            secretName: collector-tls
```

* Это создаёт отдельный ресурс входного шлюза для конечных точек OTel collector
* Вы можете использовать другой домен, настроить отдельные параметры TLS и задать пользовательские аннотации
* Правило пути с регулярным выражением позволяет маршрутизировать все сигналы OTLP (трейсы, метрики, логи) через одно правило

:::note
Если вам не нужно делать OTel collector доступным извне, вы можете пропустить эту конфигурацию. Для большинства пользователей достаточно общей настройки входного шлюза.
:::


## Устранение неполадок входного шлюза

**Проверьте ресурс входного шлюза:**

```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**Проверьте журналы контроллера входного шлюза:**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**Тестовые URL-адреса ресурсов:**


Используйте `curl`, чтобы проверить, что статические ресурсы отдаются в формате JS, а не HTML:

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Должен вернуть Content-Type: application/javascript
```

**Инструменты разработчика в браузере (DevTools):**

* Проверьте вкладку Network на наличие ответов 404 или ресурсов, которые возвращают HTML вместо JS
* Посмотрите, нет ли в консоли ошибок вида `Unexpected token <` (указывает на то, что для JS возвращается HTML)

**Проверьте перезапись путей:**

* Убедитесь, что входной шлюз не обрезает и не искажает пути к ресурсам при их перезаписи

**Очистите кэш браузера и CDN:**

* После внесения изменений очистите кэш браузера и кэш CDN/прокси, чтобы избежать использования устаревших версий ресурсов


## Настройка значений

Вы можете изменять настройки с помощью флагов `--set`:

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

В качестве альтернативы вы можете создать собственный `values.yaml`. Чтобы просмотреть значения по умолчанию:

```shell
helm show values clickstack/clickstack > values.yaml
```

Пример конфигурации:

```yaml
replicaCount: 2

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

hyperdx:
  ingress:
    enabled: true
    host: hyperdx.example.com
```

Примените свои пользовательские параметры:

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```


## Дальнейшие шаги {#next-steps}

- [Варианты развертывания](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) — внешние системы и минимальные развертывания
- [Облачные развертывания](/docs/use-cases/observability/clickstack/deployment/helm-cloud) — конфигурации GKE, EKS и AKS
- [Основное руководство по Helm](/docs/use-cases/observability/clickstack/deployment/helm) — базовая установка
