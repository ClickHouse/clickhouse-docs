import tls_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/tls-settings.png';
import pipe_connection_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pipe-connection-settings.png';
import pipe_edit_connection from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pipe-edit-connection.png';
import Image from '@theme/IdealImage';

By default, your ClickPipe will be created with TLS enabled and certificate verification. These defaults can be modified upon ClickPipe creation:

<Image img={tls_settings} alt="TLS settings" size="lg" border/>

Or edited at the _Connection settings_ section of your paused ClickPipe _Settings_ tab:

<Image img={pipe_connection_settings} alt="Connection settings -> Edit Connection" size="lg" border/>

<Image img={pipe_edit_connection} alt="Edit Connection" size="lg" border/>

Where:

- `Disable TLS` toggles TLS for the connection on or off. Turning TLS off means data is sent as plaintext over the network, potentially including secrets and sensitive data.
- `Skip certificate verification` toggles on or off the verification of the certificate presented by the source database. Take into consideration the security implications of skipping certificate verification.
- `TLS Host` (optional, defaults to the source _Host_) is the hostname the certificate's CN must match when certificate verification is enabled.
- `Upload CA` can be used to provide a CA used when certificate verification is enabled.
