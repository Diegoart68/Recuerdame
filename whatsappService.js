// ==========================================
// SERVICIO DE WHATSAPP
// ==========================================

// Esta es una primera versión de prueba.
// Todavía NO envía mensajes automáticamente.

// Más adelante conectaremos aquí
// la API oficial de WhatsApp.


function whatsappDisponible() {

    return true;

}


// ==========================================
// CREAR MENSAJE
// ==========================================

function crearMensajeWhatsApp(tarea) {

    if (!tarea) {
        return "";
    }


    return (
        "🧠 Recuérdame\n\n" +
        "🔔 Recordatorio:\n" +
        tarea.texto +
        "\n\n" +
        "📅 " +
        (tarea.fecha || "Sin fecha") +
        "\n" +
        "🕐 " +
        (tarea.hora || "Sin hora")
    );

}


// ==========================================
// ABRIR WHATSAPP CON EL MENSAJE
// ==========================================

function enviarRecordatorioWhatsApp(tarea) {

    if (!tarea) {

        return false;

    }


    const mensaje =
        crearMensajeWhatsApp(
            tarea
        );


    const mensajeCodificado =
        encodeURIComponent(
            mensaje
        );


    // Abrir WhatsApp Web con el mensaje preparado.
    //
    // Esto NO realiza un envío automático.
    // El usuario debe pulsar enviar.


    const url =
        "https://wa.me/?text=" +
        mensajeCodificado;


    window.open(
        url,
        "_blank"
    );


    return true;

}