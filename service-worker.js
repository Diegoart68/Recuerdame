// ==================================================
// SERVICE WORKER - RECUÉRDAME
// ==================================================


// ==================================================
// INSTALACIÓN
// ==================================================

self.addEventListener(
    "install",
    function(event) {

        console.log(
            "🟢 Service Worker instalado"
        );

        self.skipWaiting();

    }
);


// ==================================================
// ACTIVACIÓN
// ==================================================

self.addEventListener(
    "activate",
    function(event) {

        console.log(
            "🟢 Service Worker activado"
        );

        event.waitUntil(
            self.clients.claim()
        );

    }
);


// ==================================================
// RECIBIR NOTIFICACIÓN PUSH
// ==================================================

self.addEventListener(
    "push",
    function(event) {

        console.log(
            "📩 Push recibido"
        );


        let datos = {

            titulo:
                "🧠 Recuérdame",

            mensaje:
                "🔔 Tienes un recordatorio."

        };


        // ------------------------------------------
        // INTENTAR LEER LOS DATOS
        // ------------------------------------------

        if (
            event.data
        ) {

            try {

                datos =
                    event.data.json();

            }

            catch (error) {

                datos.mensaje =
                    event.data.text();

            }

        }


        // ------------------------------------------
        // MOSTRAR NOTIFICACIÓN
        // ------------------------------------------

        const opciones = {

            body:
                datos.mensaje ||
                "🔔 Tienes un recordatorio.",

            icon:
                "/icon.png",

            badge:
                "/icon.png",

            tag:
                "recuerdame",

            requireInteraction:
                true,

            data:
                datos

        };


        event.waitUntil(

            self.registration.showNotification(

                datos.titulo ||
                "🧠 Recuérdame",

                opciones

            )

        );

    }
);


// ==================================================
// CUANDO EL USUARIO HACE CLIC
// ==================================================

self.addEventListener(
    "notificationclick",
    function(event) {

        event.notification.close();


        event.waitUntil(

            clients.matchAll(
                {
                    type: "window",
                    includeUncontrolled: true
                }
            )
            .then(
                function(listaClientes) {

                    // ----------------------------------
                    // SI RECUÉRDAME YA ESTÁ ABIERTO
                    // ----------------------------------

                    for (
                        const cliente
                        of listaClientes
                    ) {

                        if (
                            "focus"
                            in cliente
                        ) {

                            return cliente.focus();

                        }

                    }


                    // ----------------------------------
                    // SI ESTÁ CERRADO
                    // ----------------------------------

                    if (
                        clients.openWindow
                    ) {

                        return clients.openWindow(
                            "/"
                        );

                    }

                }
            )

        );

    }
);