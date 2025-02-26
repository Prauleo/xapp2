# Guía de Configuración de OpenAI

Esta guía te ayudará a configurar OpenAI para el proyecto de generación de contenido para Twitter.

## 1. Crear una Cuenta en OpenAI

1. Ve a [OpenAI](https://platform.openai.com/signup) y regístrate o inicia sesión.
2. Si es tu primera vez, es posible que debas verificar tu correo electrónico y completar algunos pasos adicionales.

## 2. Obtener una Clave de API

1. Una vez que hayas iniciado sesión, ve a la [página de API Keys](https://platform.openai.com/api-keys).
2. Haz clic en "Create new secret key".
3. Dale un nombre descriptivo a tu clave (por ejemplo, "AI Content Creator").
4. Haz clic en "Create secret key".
5. **¡IMPORTANTE!** Copia la clave generada y guárdala en un lugar seguro. No podrás verla de nuevo después de cerrar la ventana.

## 3. Configurar la Clave de API en tu Proyecto

1. Abre el archivo `.env.local` en la raíz de tu proyecto.
2. Añade la siguiente línea con tu clave de API:

```
NEXT_PUBLIC_OPENAI_API_KEY=tu_clave_de_api_de_openai
```

3. Guarda el archivo y reinicia tu servidor de desarrollo para que los cambios surtan efecto.

## 4. Configurar Límites de Uso (Opcional)

Para evitar gastos inesperados, puedes configurar límites de uso en tu cuenta de OpenAI:

1. Ve a la [página de Billing](https://platform.openai.com/account/billing/limits).
2. Haz clic en "Set limit".
3. Establece un límite mensual de gasto que se ajuste a tu presupuesto.
4. Haz clic en "Save".

## 5. Entender los Modelos y Costos

El proyecto utiliza el modelo `gpt-4o-mini` para la generación de contenido. Es importante entender los costos asociados:

- **gpt-4o-mini**: Es un modelo más económico que gpt-4 pero con capacidades similares.
- **Costos**: Los costos se calculan por token (aproximadamente 4 caracteres = 1 token).
  - Entrada (prompt): $0.15 por 1M de tokens
  - Salida (completion): $0.60 por 1M de tokens

Para estimar los costos:
- Un tweet típico (280 caracteres) son aproximadamente 70 tokens.
- Un prompt completo para generar tweets puede ser de 500-1000 tokens.
- La respuesta generada puede ser de 200-500 tokens.

Por lo tanto, cada generación de contenido puede costar aproximadamente $0.0005 - $0.001.

## 6. Probar la Conexión

Para verificar que la conexión con OpenAI funciona correctamente:

1. Asegúrate de que la clave de API esté configurada correctamente en `.env.local`.
2. Reinicia tu servidor de desarrollo.
3. Intenta generar contenido a través de la API.

## Solución de Problemas Comunes

### Error: "Invalid API key"

- Verifica que la clave de API en `.env.local` sea correcta.
- Asegúrate de que la clave no tenga espacios adicionales.
- Verifica que la clave no haya expirado o sido revocada.

### Error: "You exceeded your current quota"

- Verifica el estado de tu facturación en la [página de Billing](https://platform.openai.com/account/billing).
- Asegúrate de tener un método de pago válido configurado.
- Considera aumentar tu límite de gasto si es necesario.

### Error: "Rate limit exceeded"

- OpenAI tiene límites de tasa para prevenir abusos.
- Implementa una lógica de reintento con retroceso exponencial en tu código.
- Considera usar una cola de trabajos para manejar solicitudes de alta frecuencia.

## Mejores Prácticas

1. **Seguridad de la Clave de API**:
   - Nunca expongas tu clave de API en el código del lado del cliente.
   - Usa variables de entorno para almacenar la clave.
   - Considera usar un proxy de servidor para hacer solicitudes a OpenAI.

2. **Optimización de Costos**:
   - Sé específico en tus prompts para obtener respuestas más concisas.
   - Limita la longitud máxima de las respuestas cuando sea posible.
   - Considera cachear respuestas para prompts comunes.

3. **Manejo de Errores**:
   - Implementa una lógica de reintento para manejar errores temporales.
   - Proporciona mensajes de error claros a los usuarios.
   - Registra errores para su análisis posterior.

## Recursos Adicionales

- [Documentación de OpenAI](https://platform.openai.com/docs/introduction)
- [Guía de Mejores Prácticas](https://platform.openai.com/docs/guides/best-practices)
- [Información de Precios](https://openai.com/pricing)
- [Límites de Tasa](https://platform.openai.com/docs/guides/rate-limits)
