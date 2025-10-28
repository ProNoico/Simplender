
import React from 'react';

// TODO: Reemplazar los placeholders como [Fecha de Última Actualización], [Nombre de tu Empresa/Proyecto], [Jurisdicción Legal], y [Correo Electrónico de Contacto] con la información real.

const TermsOfService: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-neutral-800 dark:text-neutral-200">
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-center">Términos y Condiciones de Uso de Simplender</h1>
                <p className="text-sm text-center text-neutral-500 dark:text-neutral-400">Última actualización: [Fecha de Última Actualización]</p>

                <p>Bienvenido/a a Simplender ("la Aplicación", "nosotros"). Al registrarte o utilizar nuestros servicios, aceptas cumplir y estar sujeto/a a los siguientes términos y condiciones ("Términos"). Si no estás de acuerdo, por favor no utilices la Aplicación.</p>

                <h2 className="text-2xl font-semibold pt-4">1. Descripción del Servicio</h2>
                <p>Simplender es una aplicación web diseñada para ayudar a emprendedoras a gestionar aspectos clave de su negocio, incluyendo inventario de productos, registro de ventas y gastos, gestión de clientes y seguimiento de tareas. El servicio se proporciona "tal cual".</p>

                <h2 className="text-2xl font-semibold pt-4">2. Cuentas de Usuario</h2>
                <p>Para usar Simplender, debes autenticarte a través de un proveedor externo (actualmente Google). Eres responsable de mantener la seguridad de tu cuenta y de toda la actividad que ocurra bajo ella. Debes proporcionar información precisa y actualizada en tu perfil.</p>

                <h2 className="text-2xl font-semibold pt-4">3. Uso Aceptable</h2>
                <p>Te comprometes a no utilizar la Aplicación para ningún propósito ilegal o no autorizado. Eres responsable de los datos que ingresas (productos, ventas, clientes, gastos, tareas) y de asegurar que tienes derecho a utilizarlos.</p>

                <h2 className="text-2xl font-semibold pt-4">4. Planes y Pagos</h2>
                <p>Simplender puede ofrecer planes gratuitos y de pago. Los planes gratuitos pueden tener limitaciones en cuanto a funcionalidad o cantidad de registros (ej. productos). Nos reservamos el derecho de modificar las características y precios de los planes en el futuro, notificando dichos cambios.</p>

                <h2 className="text-2xl font-semibold pt-4">5. Propiedad Intelectual</h2>
                <p>La Aplicación y su contenido original (excluyendo los datos ingresados por ti), características y funcionalidad son propiedad de [Nombre de tu Empresa/Proyecto] y están protegidos por leyes de propiedad intelectual. Los datos de tu negocio que ingresas en la aplicación te pertenecen.</p>

                <h2 className="text-2xl font-semibold pt-4">6. Limitación de Responsabilidad</h2>
                <p>No seremos responsables por pérdidas directas, indirectas, incidentales o consecuentes que resulten del uso o la imposibilidad de usar el servicio, incluyendo pérdida de datos o interrupción del negocio. Usas la aplicación bajo tu propio riesgo.</p>

                <h2 className="text-2xl font-semibold pt-4">7. Almacenamiento de Datos</h2>
                <p>Utilizamos proveedores externos (Supabase) para el hardware, software, redes, almacenamiento y tecnología relacionada necesaria para ejecutar el servicio. Si bien tomamos medidas razonables, no podemos garantizar la seguridad absoluta de tus datos.</p>

                <h2 className="text-2xl font-semibold pt-4">8. Modificaciones</h2>
                <p>Nos reservamos el derecho de modificar o discontinuar, temporal o permanentemente, el Servicio (o cualquier parte de él) con o sin previo aviso. También podemos modificar estos Términos ocasionalmente.</p>

                <h2 className="text-2xl font-semibold pt-4">9. Terminación</h2>
                <p>Podemos suspender o cancelar tu cuenta y el acceso al Servicio si incumples estos Términos.</p>

                <h2 className="text-2xl font-semibold pt-4">10. Legislación Aplicable</h2>
                <p>Estos Términos se regirán e interpretarán de acuerdo con las leyes de [Jurisdicción Legal, ej. la República Argentina].</p>

                <h2 className="text-2xl font-semibold pt-4">11. Contacto</h2>
                <p>Si tienes preguntas sobre estos Términos, contáctanos en [Correo Electrónico de Contacto].</p>
            </div>
        </div>
    );
};

export default TermsOfService;
