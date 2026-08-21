// ==========================================
// SERVICIO DE NOTIFICACIONES - RECUÉRDAME
// ==========================================


// ==========================================
// URL DEL SERVIDOR
// ==========================================


const SERVIDOR_NOTIFICACIONES =
    "https://recuerdame-backend.onrender.com";
// ==========================================
// COMPROBAR SOPORTE
// ==========================================

function soportaNotificaciones() {

    return (
        "Notification" in window
    );

}


// ==========================================
// CONVERTIR CLAVE BASE64
// ==========================================

function convertirClaveBase64(
    base64String
) {

    const padding =
        "=".repeat(
            (
                4 -
                base64String.length % 4
            ) % 4
        );


    const base64 =
        (
            base64String +
            padding
        )
        .replace(
            /-/g,
            "+"
        )
        .replace(
            /_/g,
            "/"
        );


    const rawData =
        window.atob(
            base64
        );


    const outputArray =
        new Uint8Array(
            rawData.length
        );


    for (
        let i = 0;
        i < rawData.length;
        i++
    ) {

        outputArray[i] =
            rawData.charCodeAt(i);

    }


    return outputArray;

}


// ==========================================
// OBTENER CLAVE PÚBLICA VAPID
// ==========================================

async function obtenerClavePublicaVAPID() {

    try {

        console.log(
            "📡 Obteniendo clave pública VAPID..."
        );


        const respuesta =
            await fetch(
                SERVIDOR_NOTIFICACIONES +
                "/clave-publica"
            );


        if (!respuesta.ok) {

            throw new Error(
                "Error del servidor: " +
                respuesta.status
            );

        }


        const datos =
            await respuesta.json();


        if (
            !datos.ok ||
            !datos.clavePublica
        ) {

            throw new Error(
                "El servidor no devolvió la clave pública VAPID."
            );

        }


        console.log(
            "🔑 Clave pública VAPID recibida."
        );


        return datos.clavePublica;

    }

    catch (error) {

        console.error(
            "❌ Error obteniendo clave VAPID:",
            error
        );

        return null;

    }

}


// ==========================================
// REGISTRAR SERVICE WORKER
// ==========================================

async function obtenerRegistroServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    ) {

        console.error(
            "❌ Este navegador no soporta Service Worker."
        );

        return null;

    }


    try {

        const registro =
            await navigator.serviceWorker.register(
                "/service-worker.js"
            );


        console.log(
            "🟢 Service Worker registrado."
        );


        await navigator.serviceWorker.ready;


        console.log(
            "🟢 Service Worker listo."
        );


        return registro;

    }

    catch (error) {

        console.error(
            "❌ Error registrando Service Worker:",
            error
        );

        return null;

    }

}


// ==========================================
// SUSCRIBIR NAVEGADOR A PUSH
// ==========================================

async function suscribirPush() {

    try {

        console.log(
            "🚀 Configurando Push..."
        );


        if (
            !("serviceWorker" in navigator)
        ) {

            console.error(
                "❌ Service Worker no disponible."
            );

            return false;

        }


        if (
            !("PushManager" in window)
        ) {

            console.error(
                "❌ Push API no disponible."
            );

            return false;

        }


        const registro =
            await navigator.serviceWorker.ready;


        console.log(
            "🟢 Service Worker preparado para Push."
        );


        const clavePublica =
            await obtenerClavePublicaVAPID();


        if (
            !clavePublica
        ) {

            return false;

        }


        let suscripcion =
            await registro.pushManager.getSubscription();


        // --------------------------------------
        // CREAR SUSCRIPCIÓN
        // --------------------------------------

        if (
            !suscripcion
        ) {

            console.log(
                "🔔 Creando suscripción Push..."
            );


            suscripcion =
                await registro.pushManager.subscribe({

                    userVisibleOnly:
                        true,

                    applicationServerKey:
                        convertirClaveBase64(
                            clavePublica
                        )

                });


            console.log(
                "✅ Suscripción Push creada."
            );

        }

        else {

            console.log(
                "🔔 Ya existe una suscripción Push."
            );

        }


        // --------------------------------------
        // ENVIAR AL SERVIDOR
        // --------------------------------------

        console.log(
            "📡 Enviando suscripción al servidor..."
        );


        const respuesta =
            await fetch(

                SERVIDOR_NOTIFICACIONES +
                "/suscripcion",

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            suscripcion
                        )

                }

            );


        if (
            !respuesta.ok
        ) {

            throw new Error(
                "El servidor respondió: " +
                respuesta.status
            );

        }


        const datos =
            await respuesta.json();


        if (
            !datos.ok
        ) {

            throw new Error(
                datos.mensaje ||
                "El servidor rechazó la suscripción."
            );

        }


        console.log(
            "✅ Suscripción Push enviada al servidor."
        );


        return true;

    }

    catch (error) {

        console.error(
            "❌ Error configurando Push:",
            error
        );

        return false;

    }

}


// ==========================================
// ACTIVAR NOTIFICACIONES
// ==========================================

async function activarNotificaciones() {

    if (
        !soportaNotificaciones()
    ) {

        alert(
            "Tu navegador no permite notificaciones."
        );

        return false;

    }


    try {

        // --------------------------------------
        // PEDIR PERMISO
        // --------------------------------------

        const permiso =
            await Notification.requestPermission();


        console.log(
            "🔔 Permiso:",
            permiso
        );


        if (
            permiso === "denied"
        ) {

            alert(
                "⚠️ Las notificaciones están bloqueadas en el navegador."
            );

            return false;

        }


        if (
            permiso !== "granted"
        ) {

            alert(
                "⚠️ No se permitieron las notificaciones."
            );

            return false;

        }


        console.log(
            "✅ Notificaciones activadas."
        );


        // --------------------------------------
        // SERVICE WORKER
        // --------------------------------------

        const registro =
            await obtenerRegistroServiceWorker();


        if (
            !registro
        ) {

            alert(
                "❌ No se pudo preparar el Service Worker."
            );

            return false;

        }


        // --------------------------------------
        // CREAR SUSCRIPCIÓN PUSH
        // --------------------------------------

        const pushActivado =
            await suscribirPush();


        if (
            !pushActivado
        ) {

            alert(
                "⚠️ Las notificaciones normales están activadas, pero no se pudo configurar Push."
            );

            return false;

        }


        alert(
            "✅ Notificaciones Push activadas correctamente."
        );


        return true;

    }

    catch (error) {

        console.error(
            "❌ Error activando notificaciones:",
            error
        );


        alert(
            "❌ Ocurrió un error activando las notificaciones."
        );


        return false;

    }

}


// ==========================================
// COMPROBAR SI ESTÁN ACTIVADAS
// ==========================================

function notificacionesActivadas() {

    if (
        !soportaNotificaciones()
    ) {

        return false;

    }


    return (
        Notification.permission ===
        "granted"
    );

}


// ==========================================
// ENVIAR NOTIFICACIÓN NORMAL
// ==========================================

function enviarNotificacion(
    titulo,
    mensaje
) {

    if (
        !soportaNotificaciones()
    ) {

        console.log(
            "❌ El navegador no soporta notificaciones."
        );

        return false;

    }


    if (
        Notification.permission !==
        "granted"
    ) {

        console.log(
            "⚠️ Las notificaciones no están permitidas."
        );

        return false;

    }


    try {

        const notificacion =
            new Notification(

                titulo,

                {

                    body:
                        mensaje,

                    icon:
                        "icon.png",

                    tag:
                        "recuerdame-recordatorio"

                }

            );


        notificacion.onclick =
            function() {

                window.focus();

                notificacion.close();

            };


        setTimeout(
            function() {

                try {

                    notificacion.close();

                }

                catch (error) {

                    console.log(
                        "No se pudo cerrar la notificación."
                    );

                }

            },
            10000
        );


        console.log(
            "🔔 Notificación enviada:",
            titulo,
            mensaje
        );


        return true;

    }

    catch (error) {

        console.error(
            "❌ Error enviando notificación:",
            error
        );

        return false;

    }

}


// ==========================================
// NOTIFICAR RECORDATORIO
// ==========================================

function notificarRecordatorio(
    tarea
) {

    if (!tarea) {

        console.log(
            "❌ No se recibió ninguna tarea."
        );

        return false;

    }


    console.log(
        "📢 Preparando notificación para:",
        tarea.texto
    );


    const titulo =
        "🧠 Recuérdame";


    const mensaje =
        "🔔 Es hora de: " +
        tarea.texto;


    return enviarNotificacion(
        titulo,
        mensaje
    );

}


// ==========================================
// PRUEBA DIRECTA
// ==========================================

function probarNotificacion() {

    if (
        !soportaNotificaciones()
    ) {

        alert(
            "Tu navegador no permite notificaciones."
        );

        return;

    }


    if (
        Notification.permission !==
        "granted"
    ) {

        alert(
            "Primero activa las notificaciones."
        );

        return;

    }


    enviarNotificacion(

        "🧠 Recuérdame",

        "✅ ¡Las notificaciones funcionan!"

    );

}


// ==========================================
// MOSTRAR ESTADO
// ==========================================

function mostrarEstadoNotificaciones() {

    if (
        !soportaNotificaciones()
    ) {

        console.log(
            "❌ Notificaciones no soportadas."
        );

        return;

    }


    console.log(
        "🔔 Estado de notificaciones:",
        Notification.permission
    );

}