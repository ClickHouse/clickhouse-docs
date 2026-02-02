---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Конфигурация Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'Настройка API-ключей, секретов и входного шлюза для развертываний ClickStack через Helm'
doc_type: 'guide'
keywords: ['Конфигурация ClickStack', 'Секреты Helm', 'Настройка API-ключа', 'Конфигурация входного шлюза', 'Настройка TLS']
---

В этом руководстве рассматриваются параметры конфигурации для развертываний ClickStack через Helm. Для базовой установки см. [основное руководство по развертыванию через Helm](/docs/use-cases/observability/clickstack/deployment/helm).

## Настройка API-ключа \{#api-key-setup\}

После успешного развертывания ClickStack настройте API-ключ, чтобы включить сбор телеметрических данных:

1. **Откройте ваш экземпляр HyperDX** через настроенный входной шлюз или конечную точку сервиса
2. **Войдите в панель управления HyperDX** и перейдите в Team settings, чтобы сгенерировать или получить ваш API-ключ
3. **Обновите конфигурацию развертывания**, указав API-ключ одним из следующих способов:

### Метод 1: обновление через `helm upgrade` с файлом values \{#api-key-values-file\}

Добавьте API‑ключ в файл `values.yaml`:

```yaml
hyperdx:
  apiKey: "your-api-key-here"
```

Затем обновите развертывание:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```


### Метод 2: обновление через команду helm upgrade с параметром --set \{#api-key-set-flag\}

```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="your-api-key-here"
```


### Перезапустите поды, чтобы применить изменения \{#restart-pods\}

После обновления ключа API перезапустите поды, чтобы они подхватили новую конфигурацию:

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
Чарт автоматически создаёт секрет в Kubernetes (`<release-name>-app-secrets`) с вашим API-ключом. Дополнительные настройки секрета не требуются, если только вы не хотите использовать внешний секрет.
:::


## Управление секретами \{#secret-management\}

Для работы с конфиденциальными данными, такими как API-ключи или учетные данные базы данных, используйте секреты Kubernetes.

### Использование предварительно настроенных секретов \{#using-pre-configured-secrets\}

Helm-чарт включает шаблон секрета по умолчанию, который находится по пути [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml). Этот файл задаёт базовую структуру для управления секретами.

Если вам нужно вручную применить секрет, отредактируйте и примените предоставленный шаблон `secrets.yaml`:

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

Примените секрет к кластеру:

```shell
kubectl apply -f secrets.yaml
```


### Создание собственного секрета \{#creating-a-custom-secret\}

Создайте собственный секрет Kubernetes вручную:

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```


### Использование секрета в values.yaml \{#referencing-a-secret\}

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```


## Настройка входного шлюза \{#ingress-setup\}

Чтобы открыть доступ к HyperDX UI и API через доменное имя, активируйте входной шлюз в вашем `values.yaml`.

### Общая конфигурация входного шлюза \{#general-ingress-configuration\}

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # Must match ingress host
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note Важное примечание по конфигурации
`hyperdx.frontendUrl` должен совпадать с хостом входного шлюза и включать протокол (например, `https://hyperdx.yourdomain.com`). Это обеспечивает корректную работу всех сгенерированных ссылок, файлов cookie и перенаправлений.
:::


### Включение TLS (HTTPS) \{#enabling-tls\}

Чтобы защитить развертывание с помощью HTTPS:

**1. Создайте секрет TLS с вашим сертификатом и закрытым ключом:**

```shell
kubectl create secret tls hyperdx-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**2. Включите TLS в конфигурации входного шлюза:**

```yaml
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
      tlsSecretName: "hyperdx-tls"
```


### Пример конфигурации входного шлюза \{#example-ingress-configuration\}

Для примера, вот как выглядит сгенерированный ресурс входного шлюза:

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


### Распространённые ошибки при настройке входного шлюза \{#common-ingress-pitfalls\}

**Конфигурация path и переписывания (rewrite):**

* Для Next.js и других SPA всегда используйте путь с регулярным выражением (regex) и аннотацию переписывания (rewrite), как показано выше
* Не используйте просто `path: /` без переписывания, так как это нарушит раздачу статических ресурсов

**Несоответствие `frontendUrl` и `ingress.host`:**

* Если они не совпадают, возможны проблемы с cookie, редиректами и загрузкой ресурсов

**Неправильная конфигурация TLS:**

* Убедитесь, что ваш секрет TLS действителен и корректно указан во входном шлюзе
* Браузеры могут блокировать небезопасный контент, если вы обращаетесь к приложению по HTTP при включённом TLS

**Версия контроллера входного шлюза:**

* Некоторые возможности (например, regex-пути и переписывания) требуют современных версий nginx Ingress Controller
* Проверьте свою версию командой:

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```


## Входной шлюз для OTel collector \{#otel-collector-ingress\}

Если вам нужно открыть доступ к конечным точкам вашего OTel collector (для трейсов, метрик и логов) через входной шлюз, используйте конфигурацию `additionalIngresses`. Это полезно для отправки телеметрических данных извне кластера или при использовании пользовательского домена для OTel collector.

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
* Вы можете использовать другой домен, настроить отдельные параметры TLS и применить пользовательские аннотации
* Правило пути с регулярным выражением позволяет маршрутизировать все сигналы OTLP (трейсы, метрики, логи) по одному правилу

:::note
Если вам не нужно публиковать OTel collector во внешнюю сеть, вы можете пропустить эту конфигурацию. Для большинства пользователей достаточно общей конфигурации входного шлюза.
:::


## Устранение неполадок входного шлюза \{#troubleshooting-ingress\}

**Проверьте ресурс входного шлюза:**

```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**Проверьте логи контроллера Входного шлюза:**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**Тестовые URL‑адреса статических ресурсов:**

Используйте `curl`, чтобы проверить, что статические ресурсы выдаются как JS, а не HTML:

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Should return Content-Type: application/javascript
```

**Инструменты разработчика браузера (DevTools):**

* Проверьте вкладку Network на наличие 404 или ресурсов, которые возвращают HTML вместо JS
* Найдите в консоли ошибки вроде `Unexpected token <` (указывает на возврат HTML вместо JS)

**Проверьте переписывание путей:**

* Убедитесь, что Входной шлюз не обрезает и не переписывает пути к ресурсам некорректно

**Очистите кэш браузера и CDN:**

* После внесённых изменений очистите кэш браузера и кэш CDN/прокси, чтобы избежать устаревших ресурсов


## Настройка значений \{#customizing-values\}

Вы можете настраивать эти значения с помощью флагов `--set`:

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

Кроме того, можно создать собственный `values.yaml`. Чтобы получить значения по умолчанию:

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

Примените свои пользовательские значения:

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```


## Дальнейшие шаги \{#next-steps\}

- [Варианты развертывания](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) — внешние системы и минимальные развертывания
- [Развертывания в Cloud](/docs/use-cases/observability/clickstack/deployment/helm-cloud) — конфигурации для GKE, EKS и AKS
- [Основное руководство по helm](/docs/use-cases/observability/clickstack/deployment/helm) — базовая установка