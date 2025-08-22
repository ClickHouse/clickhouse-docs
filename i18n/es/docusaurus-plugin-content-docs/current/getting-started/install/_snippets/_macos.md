import Image from "@theme/IdealImage";
import dev_error from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/dev-verification-error.png";
import privacy_default from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-default-view.png";
import privacy_allow from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png";

# Instalar ClickHouse usando Homebrew

<VerticalStepper>

## Instalar usando la fórmula comunitaria de Homebrew {#install-using-community-homebrew-formula}

Para instalar ClickHouse en macOS usando [Homebrew](https://brew.sh/), puedes usar la fórmula comunitaria de ClickHouse para [Homebrew](https://formulae.brew.sh/cask/clickhouse).


```bash
brew install --cask clickhouse
```

## Solucionar el error de verificación del desarrollador en macOS {#fix-developer-verification-error-macos}

Si instalas ClickHouse usando `brew`, es posible que encuentres un error en macOS.  
Por defecto, macOS no ejecutará aplicaciones o herramientas creadas por un desarrollador que no pueda ser verificado.

Al intentar ejecutar cualquier comando de `clickhouse`, podrías ver el siguiente error:

<Image img={dev_error} size="sm" alt="MacOS developer verification error dialog" border />

Para evitar este error de verificación, debes eliminar la aplicación del estado de cuarentena de macOS.  
Puedes hacerlo buscando la configuración correspondiente en la ventana de Configuración del Sistema, usando la terminal o reinstalando ClickHouse.

### Proceso desde la Configuración del Sistema {#system-settings-process}

La forma más sencilla de eliminar el ejecutable `clickhouse` del estado de cuarentena es:

1. Abrir **Configuración del Sistema**.
2. Ir a **Privacidad y Seguridad**:


    <Image img={privacy_default} size="md" alt="MacOS Privacy & Security settings default view" border />

3. Desplázate hasta la parte inferior de la ventana para encontrar un mensaje que diga _"clickhouse-macos-aarch64" fue bloqueado porque no proviene de un desarrollador identificado_.
4. Haz clic en **Permitir de todos modos**.

    <Image img={privacy_allow} size="md" alt="MacOS Privacy & Security settings showing Allow Anyway button" border />

5. Ingresa la contraseña de tu usuario de MacOS.

Ahora deberías poder ejecutar comandos `clickhouse` en tu terminal.

### Proceso desde la terminal {#terminal-process}

A veces, presionar el botón **Allow Anyway** no soluciona el problema, en ese caso también puedes realizar este proceso desde la línea de comandos.  
O simplemente puedes preferir usar la terminal.

Primero, averigua dónde Homebrew instaló el ejecutable `clickhouse`:

```shell
which clickhouse
```

Esto debería mostrar una salida similar a:

```shell
/opt/homebrew/bin/clickhouse
```

Elimina `clickhouse` de la cuarentena ejecutando `xattr -d com.apple.quarantine` seguido de la ruta obtenida en el comando anterior:

```shell
xattr -d com.apple.quarantine /opt/homebrew/bin/clickhouse
```

Ahora deberías poder ejecutar el binario `clickhouse` sin problemas:

```shell
clickhouse
```

Esto debería mostrar algo como lo siguiente:

```bash
Use one of the following commands:
clickhouse local [args]
clickhouse client [args]
clickhouse benchmark [args]
...

## Fix the issue by reinstalling ClickHouse {#fix-issue}

Brew has a command-line option which avoids quarantining installed binaries in the first place.

First, uninstall ClickHouse:

```shell
brew uninstall clickhouse
```

Ahora reinstala ClickHouse con la opción `--no-quarantine`:

```shell
brew install --no-quarantine clickhouse
```
</VerticalStepper>
