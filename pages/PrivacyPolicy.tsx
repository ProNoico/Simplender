
import React from 'react';

// TODO: Reemplazar los placeholders como [Fecha de Última Actualización] y [Correo Electrónico de Contacto] con la información real.

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="bg-white dark:bg-neutral-900">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="space-y-6 text-neutral-600 dark:text-neutral-300">
                    <h1 className="text-3xl font-bold text-center text-neutral-900 dark:text-neutral-100">Política de Privacidad de Simplender</h1>
                    <p className="text-sm text-center text-neutral-500 dark:text-neutral-400">Última actualización: [Fecha de Última Actualización]</p>

                    <p>En Simplender ("nosotros"), respetamos tu privacidad y nos comprometemos a proteger tus datos personales. Esta política explica cómo recopilamos, usamos y protegemos tu información cuando utilizas nuestra aplicación web ("la Aplicación").</p>

                    <h2 className="text-2xl font-semibold pt-4 text-neutral-800 dark:text-neutral-200">1. Información que Recopilamos</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong className="text-neutral-700 dark:text-neutral-200">Información de Cuenta:</strong> Al registrarte con Google, podemos recibir tu nombre, dirección de correo electrónico y URL de foto de perfil. También puedes proporcionar voluntariamente tu nombre completo, nombre comercial y número de teléfono en tu perfil.</li>
                        <li><strong className="text-neutral-700 dark:text-neutral-200">Datos del Negocio:</strong> Recopilamos y almacenamos la información que ingresas activamente en la Aplicación, como detalles de productos (nombre, precio, costo, stock), registros de ventas (producto, cliente, monto, método de pago), datos de clientes (nombre, teléfono, email), detalles de tareas y registros de gastos (descripción, monto, categoría, fecha).</li>
                        <li><strong className="text-neutral-700 dark:text-neutral-200">Imágenes:</strong> Si subes un avatar, almacenamos esa imagen.</li>
                        <li><strong className="text-neutral-700 dark:text-neutral-200">Datos de Uso (Potencial):</strong> Podríamos recopilar información sobre cómo interactúas con la Aplicación (ej. páginas visitadas, funciones utilizadas) para mejorar el servicio.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold pt-4 text-neutral-800 dark:text-neutral-200">2. Cómo Usamos tu Información</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Para proporcionar, mantener y mejorar la funcionalidad de la Aplicación.</li>
                        <li>Para autenticar tu acceso y gestionar tu cuenta.</li>
                        <li>Para procesar transacciones (registro de ventas y gastos).</li>
                        <li>Para calcular estadísticas y generar reportes sobre tu negocio (para tu uso).</li>
                        <li>Para comunicarnos contigo (soporte, notificaciones importantes).</li>
                        <li>Para cumplir con obligaciones legales.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold pt-4 text-neutral-800 dark:text-neutral-200">3. Cómo Compartimos tu Información</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong className="text-neutral-700 dark:text-neutral-200">Proveedores de Servicios:</strong> Utilizamos servicios de terceros como Supabase para alojar la aplicación, almacenar tus datos (incluyendo base de datos y almacenamiento de archivos como avatares) y gestionar la autenticación. Estos proveedores tienen acceso a tu información solo para realizar estas tareas en nuestro nombre y están obligados a no divulgarla ni usarla para otros fines.</li>
                        <li><strong className="text-neutral-700 dark:text-neutral-200">Requerimientos Legales:</strong> Podemos divulgar tu información si así lo exige la ley.</li>
                        <li><strong>No vendemos tu información personal a terceros.</strong></li>
                    </ul>

                    <h2 className="text-2xl font-semibold pt-4 text-neutral-800 dark:text-neutral-200">4. Seguridad de Datos</h2>
                    <p>Implementamos medidas de seguridad razonables (como el uso de HTTPS y las características de seguridad de Supabase) para proteger tu información. Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro.</p>

                    <h2 className="text-2xl font-semibold pt-4 text-neutral-800 dark:text-neutral-200">5. Retención de Datos</h2>
                    <p>Conservaremos tus datos mientras tu cuenta esté activa o según sea necesario para cumplir con nuestras obligaciones legales, resolver disputas y hacer cumplir nuestros acuerdos.</p>

                    <h2 className="text-2xl font-semibold pt-4 text-neutral-800 dark:text-neutral-200">6. Tus Derechos</h2>
                    <p>Tienes derecho a acceder, corregir o solicitar la eliminación de tus datos personales. Puedes gestionar gran parte de tu información directamente a través de la interfaz de la Aplicación (ej. Perfil, Productos, Clientes, etc.). Para otras solicitudes, contáctanos.</p>

                    <h2 className="text-2xl font-semibold pt-4 text-neutral-800 dark:text-neutral-200">7. Cookies</h2>
                    <p>Podemos utilizar cookies o tecnologías similares para mejorar la experiencia del usuario.</p>

                    <h2 className="text-2xl font-semibold pt-4 text-neutral-800 dark:text-neutral-200">8. Cambios a esta Política</h2>
                    <p>Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cualquier cambio publicando la nueva política en esta página.</p>

                    <h2 className="text-2xl font-semibold pt-4 text-neutral-800 dark:text-neutral-200">9. Contacto</h2>
                    <p>Si tienes preguntas sobre esta Política de Privacidad, contáctanos en [Correo Electrónico de Contacto].</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
