// ==================================================
// RECUÉRDAME - APP.JS
// ==================================================


// ==================================================
// CARGAR TAREAS
// ==================================================

let tareas =
    JSON.parse(
        localStorage.getItem("tareas")
    ) || [];


// ==================================================
// NORMALIZAR TAREAS ANTIGUAS
// ==================================================

tareas = tareas.map(function (tarea) {

    return {

        texto:
            tarea.texto || "",

        fecha:
            tarea.fecha || "",

        hora:
            tarea.hora || "",

        canal:
            tarea.canal || "app",

        completada:
            Boolean(tarea.completada),

        recordada:
            Boolean(tarea.recordada),

        recurrente:
            Boolean(tarea.recurrente),

        tipoRecurrencia:
            tarea.tipoRecurrencia || null,

        diaRecurrencia:
            tarea.diaRecurrencia ?? null

    };

});


// ==================================================
// GUARDAR TAREAS NORMALIZADAS
// ==================================================

localStorage.setItem(
    "tareas",
    JSON.stringify(tareas)
);


// ==================================================
// VARIABLES
// ==================================================

let tareaRecordatorioActual = null;

window.tareaInterpretada = null;


// ==================================================
// SERVIDOR
// ==================================================

// SERVIDOR ONLINE EN RENDER

const URL_SERVIDOR_PUSH =
    "https://recuerdame-backend.onrender.com";


// ==================================================
// CONVERTIR FECHA
// ==================================================

function convertirFecha(fecha) {

    return (
        fecha.getFullYear() +
        "-" +
        String(
            fecha.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            fecha.getDate()
        ).padStart(2, "0")
    );

}


// ==================================================
// FORMATEAR FECHA
// ==================================================

function formatearFecha(fecha) {

    if (!fecha) {
        return "Sin fecha";
    }

    const partes =
        fecha.split("-");

    const año =
        parseInt(partes[0]);

    const mes =
        parseInt(partes[1]) - 1;

    const dia =
        parseInt(partes[2]);

    const fechaObjeto =
        new Date(
            año,
            mes,
            dia
        );

    const hoy =
        new Date();

    const hoySoloFecha =
        new Date(
            hoy.getFullYear(),
            hoy.getMonth(),
            hoy.getDate()
        );

    const mañana =
        new Date(
            hoySoloFecha
        );

    mañana.setDate(
        mañana.getDate() + 1
    );

    if (
        fechaObjeto.getTime() ===
        hoySoloFecha.getTime()
    ) {

        return "Hoy";

    }

    if (
        fechaObjeto.getTime() ===
        mañana.getTime()
    ) {

        return "Mañana";

    }

    return fechaObjeto.toLocaleDateString(
        "es-EC",
        {
            weekday: "long",
            day: "numeric",
            month: "long"
        }
    );

}


// ==================================================
// TEXTO DE RECURRENCIA
// ==================================================

function obtenerTextoRecurrencia(tarea) {

    if (
        tarea.tipoRecurrencia ===
        "diaria"
    ) {

        return "Todos los días";

    }

    if (
        tarea.tipoRecurrencia ===
        "semanal"
    ) {

        const nombres = [

            "domingo",
            "lunes",
            "martes",
            "miércoles",
            "jueves",
            "viernes",
            "sábado"

        ];

        return (
            "Cada " +
            (
                nombres[
                    tarea.diaRecurrencia
                ] || "día"
            )
        );

    }

    return "Recurrente";

}


// ==================================================
// TEXTO DEL CANAL
// ==================================================

function obtenerTextoCanal(canal) {

    if (
        canal === "whatsapp"
    ) {

        return "💬 WhatsApp";

    }

    if (
        canal === "ambos"
    ) {

        return "🔔💬 Ambos";

    }

    return "🔔 App";

}


// ==================================================
// MOSTRAR TAREAS
// ==================================================

function mostrarTareas() {

    const lista =
        document.getElementById(
            "listaTareas"
        );

    if (!lista) {
        return;
    }

    lista.innerHTML = "";

    tareas.forEach(
        function(tarea, indice) {

            const nuevaTarea =
                document.createElement(
                    "div"
                );

            nuevaTarea.className =
                "tarea";

            const claseTexto =
                tarea.completada
                    ? "texto-tarea completada"
                    : "texto-tarea";

            const fechaTexto =
                tarea.fecha
                    ? "📅 " +
                      formatearFecha(
                          tarea.fecha
                      )
                    : "📅 Sin fecha";

            const horaTexto =
                tarea.hora
                    ? "🕐 " +
                      tarea.hora
                    : "🕐 Sin hora";

            const canalTexto =
                " · " +
                obtenerTextoCanal(
                    tarea.canal
                );

            const recurrenciaTexto =
                tarea.recurrente
                    ? " · 🔁 " +
                      obtenerTextoRecurrencia(
                          tarea
                      )
                    : "";

            nuevaTarea.innerHTML = `

                <span
                    class="${claseTexto}"
                    onclick="completarTarea(${indice})"
                >

                    ${
                        tarea.completada
                            ? "✅"
                            : "☐"
                    }

                    ${tarea.texto}

                </span>

                <small
                    class="informacion-tarea"
                >

                    ${fechaTexto}

                    ·

                    ${horaTexto}

                    ${canalTexto}

                    ${recurrenciaTexto}

                </small>

            `;

            lista.appendChild(
                nuevaTarea
            );

        }
    );

}


// ==================================================
// SINCRONIZAR RECORDATORIO CON EL SERVIDOR
// ==================================================

async function sincronizarRecordatorioConServidor(
    tarea
) {

    if (!tarea) {

        console.log(
            "❌ No se recibió tarea para sincronizar."
        );

        return false;

    }

    if (!tarea.texto) {

        console.log(
            "❌ La tarea no tiene texto."
        );

        return false;

    }

    if (!tarea.fecha || !tarea.hora) {

        console.log(
            "ℹ️ Tarea sin fecha u hora. No se envía al servidor:",
            tarea.texto
        );

        return false;

    }

    try {

        console.log(
            "📡 Sincronizando recordatorio con servidor:",
            tarea.texto
        );

        const respuesta =
            await fetch(
                URL_SERVIDOR_PUSH +
                "/recordatorio",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            texto:
                                tarea.texto,

                            fecha:
                                tarea.fecha,

                            hora:
                                tarea.hora,

                            canal:
                                tarea.canal ||
                                "app"

                        })

                }
            );

        if (!respuesta.ok) {

            throw new Error(
                "El servidor respondió HTTP " +
                respuesta.status
            );

        }

        const datos =
            await respuesta.json();

        console.log(
            "📡 Respuesta del servidor:",
            datos
        );

        if (
            datos.ok
        ) {

            console.log(
                "🟢 Recordatorio sincronizado correctamente."
            );

            return true;

        }

        console.error(
            "❌ El servidor rechazó el recordatorio."
        );

        return false;

    }

    catch (error) {

        console.error(
            "❌ Error sincronizando recordatorio:",
            error
        );

        return false;

    }

}


// ==================================================
// AGREGAR TAREA NORMAL
// ==================================================

function agregarTarea() {

    const entrada =
        document.getElementById(
            "entradaTarea"
        );

    const fecha =
        document.getElementById(
            "fechaTarea"
        );

    const hora =
        document.getElementById(
            "horaTarea"
        );

    const canal =
        document.getElementById(
            "canalTarea"
        );

    if (!entrada) {

        console.error(
            "❌ No existe #entradaTarea."
        );

        return;

    }

    const texto =
        entrada.value.trim();

    if (
        texto === ""
    ) {

        alert(
            "Escribe una tarea primero."
        );

        return;

    }

    const nuevaTarea = {

        texto:
            texto,

        fecha:
            fecha
                ? fecha.value
                : "",

        hora:
            hora
                ? hora.value
                : "",

        canal:
            canal
                ? canal.value
                : "app",

        completada:
            false,

        recordada:
            false,

        recurrente:
            false,

        tipoRecurrencia:
            null,

        diaRecurrencia:
            null

    };

    tareas.push(
        nuevaTarea
    );

    guardarTareas();

    mostrarTareas();

    sincronizarRecordatorioConServidor(
        nuevaTarea
    );

    entrada.value = "";

    if (fecha) {
        fecha.value = "";
    }

    if (hora) {
        hora.value = "";
    }

    if (canal) {

        canal.value =
            "app";

    }

}


// ==================================================
// COMPLETAR TAREA
// ==================================================

function completarTarea(indice) {

    const tarea =
        tareas[indice];

    if (!tarea) {
        return;
    }

    tarea.completada =
        !tarea.completada;

    if (
        tarea.completada &&
        tarea.recurrente
    ) {

        crearSiguienteRecurrencia(
            tarea
        );

    }

    guardarTareas();

    mostrarTareas();

}


// ==================================================
// CREAR SIGUIENTE RECURRENCIA
// ==================================================

function crearSiguienteRecurrencia(
    tarea
) {

    if (!tarea.fecha) {
        return;
    }

    const fechaActual =
        new Date(
            tarea.fecha +
            "T00:00:00"
        );

    const siguienteFecha =
        new Date(
            fechaActual
        );

    if (
        tarea.tipoRecurrencia ===
        "diaria"
    ) {

        siguienteFecha.setDate(
            siguienteFecha.getDate() + 1
        );

    }

    else if (
        tarea.tipoRecurrencia ===
        "semanal"
    ) {

        siguienteFecha.setDate(
            siguienteFecha.getDate() + 7
        );

    }

    else {

        return;

    }

    const nuevaTarea = {

        texto:
            tarea.texto,

        fecha:
            convertirFecha(
                siguienteFecha
            ),

        hora:
            tarea.hora,

        canal:
            tarea.canal ||
            "app",

        completada:
            false,

        recordada:
            false,

        recurrente:
            true,

        tipoRecurrencia:
            tarea.tipoRecurrencia,

        diaRecurrencia:
            tarea.diaRecurrencia

    };

    tareas.push(
        nuevaTarea
    );

    guardarTareas();

    sincronizarRecordatorioConServidor(
        nuevaTarea
    );

}


// ==================================================
// GUARDAR TAREAS
// ==================================================

function guardarTareas() {

    localStorage.setItem(
        "tareas",
        JSON.stringify(tareas)
    );

}


// ==================================================
// ENVIAR NOTIFICACIÓN SEGÚN CANAL
// ==================================================

function notificarSegunCanal(tarea) {

    const canal =
        tarea.canal || "app";

    if (
        canal === "app" ||
        canal === "ambos"
    ) {

        if (
            typeof notificarRecordatorio ===
            "function"
        ) {

            notificarRecordatorio(
                tarea
            );

        }

    }

    if (
        canal === "whatsapp" ||
        canal === "ambos"
    ) {

        if (
            typeof enviarRecordatorioWhatsApp ===
            "function"
        ) {

            enviarRecordatorioWhatsApp(
                tarea
            );

        }

    }

}


// ==================================================
// REVISAR RECORDATORIOS LOCALES
// ==================================================

function revisarRecordatorios() {

    const ahora =
        new Date();

    tareas.forEach(
        function(tarea, indice) {

            if (
                tarea.completada ||
                tarea.recordada ||
                !tarea.fecha ||
                !tarea.hora
            ) {

                return;

            }

            const fechaHoraTarea =
                new Date(
                    tarea.fecha +
                    "T" +
                    tarea.hora +
                    ":00"
                );

            if (
                fechaHoraTarea <=
                ahora
            ) {

                console.log(
                    "⏰ Recordatorio local activado:",
                    tarea.texto
                );

                mostrarModalRecordatorio(
                    indice
                );

                tarea.recordada =
                    true;

                guardarTareas();

                notificarSegunCanal(
                    tarea
                );

            }

        }
    );

}


// ==================================================
// MOSTRAR MODAL
// ==================================================

function mostrarModalRecordatorio(
    indice
) {

    tareaRecordatorioActual =
        indice;

    const tarea =
        tareas[indice];

    if (!tarea) {
        return;
    }

    const modal =
        document.getElementById(
            "modalRecordatorio"
        );

    const texto =
        document.getElementById(
            "textoRecordatorio"
        );

    if (
        !modal ||
        !texto
    ) {

        return;

    }

    texto.textContent =
        "Es hora de: " +
        tarea.texto;

    modal.style.display =
        "flex";

}


// ==================================================
// CERRAR MODAL
// ==================================================

function cerrarModalRecordatorio() {

    const modal =
        document.getElementById(
            "modalRecordatorio"
        );

    if (modal) {

        modal.style.display =
            "none";

    }

    tareaRecordatorioActual =
        null;

}


// ==================================================
// COMPLETAR DESDE RECORDATORIO
// ==================================================

function completarDesdeRecordatorio() {

    if (
        tareaRecordatorioActual ===
        null
    ) {

        return;

    }

    const tarea =
        tareas[
            tareaRecordatorioActual
        ];

    if (!tarea) {

        cerrarModalRecordatorio();

        return;

    }

    tarea.completada =
        true;

    if (
        tarea.recurrente
    ) {

        crearSiguienteRecurrencia(
            tarea
        );

    }

    guardarTareas();

    mostrarTareas();

    cerrarModalRecordatorio();

}


// ==================================================
// POSPONER X MINUTOS
// ==================================================

function posponerDesdeRecordatorio(
    minutos
) {

    if (
        tareaRecordatorioActual ===
        null
    ) {

        return;

    }

    const tarea =
        tareas[
            tareaRecordatorioActual
        ];

    if (!tarea) {

        cerrarModalRecordatorio();

        return;

    }

    const nuevaFechaHora =
        new Date();

    nuevaFechaHora.setMinutes(
        nuevaFechaHora.getMinutes() +
        minutos
    );

    tarea.fecha =
        convertirFecha(
            nuevaFechaHora
        );

    tarea.hora =
        String(
            nuevaFechaHora.getHours()
        ).padStart(2, "0") +
        ":" +
        String(
            nuevaFechaHora.getMinutes()
        ).padStart(2, "0");

    tarea.recordada =
        false;

    tarea.completada =
        false;

    guardarTareas();

    mostrarTareas();

    cerrarModalRecordatorio();

    sincronizarRecordatorioConServidor(
        tarea
    );

}


// ==================================================
// POSPONER PARA MAÑANA
// ==================================================

function posponerMañanaDesdeRecordatorio() {

    if (
        tareaRecordatorioActual ===
        null
    ) {

        return;

    }

    const tarea =
        tareas[
            tareaRecordatorioActual
        ];

    if (!tarea) {

        cerrarModalRecordatorio();

        return;

    }

    const mañana =
        new Date();

    mañana.setDate(
        mañana.getDate() + 1
    );

    tarea.fecha =
        convertirFecha(
            mañana
        );

    tarea.recordada =
        false;

    tarea.completada =
        false;

    guardarTareas();

    mostrarTareas();

    cerrarModalRecordatorio();

    sincronizarRecordatorioConServidor(
        tarea
    );

}


// ==================================================
// INTERPRETAR TAREA
// ==================================================

function interpretarTarea() {

    const entrada =
        document.getElementById(
            "entradaTarea"
        );

    if (!entrada) {
        return;
    }

    const textoOriginal =
        entrada.value.trim();

    if (
        textoOriginal === ""
    ) {

        alert(
            "Escribe primero lo que tienes que hacer."
        );

        return;

    }

    const texto =
        textoOriginal.toLowerCase();

    let fecha = "";

    let hora = "";

    let esRecurrente =
        false;

    let tipoRecurrencia =
        null;

    let diaRecurrencia =
        null;


    // ==========================================
    // RECURRENCIA DIARIA
    // ==========================================

    if (
        texto.includes(
            "todos los días"
        ) ||
        texto.includes(
            "cada día"
        )
    ) {

        esRecurrente =
            true;

        tipoRecurrencia =
            "diaria";

    }


    // ==========================================
    // DÍAS DE LA SEMANA
    // ==========================================

    const diasSemana = {

        domingo: 0,
        lunes: 1,
        martes: 2,
        miércoles: 3,
        jueves: 4,
        viernes: 5,
        sábado: 6

    };

    for (
        const dia in diasSemana
    ) {

        if (
            texto.includes(
                "todos los " +
                dia
            ) ||
            texto.includes(
                "cada " +
                dia
            )
        ) {

            esRecurrente =
                true;

            tipoRecurrencia =
                "semanal";

            diaRecurrencia =
                diasSemana[dia];

            break;

        }

    }


    // ==========================================
    // HOY
    // ==========================================

    if (
        texto.includes("hoy")
    ) {

        fecha =
            convertirFecha(
                new Date()
            );

    }


    // ==========================================
    // MAÑANA
    // ==========================================

    else if (
        texto.includes(
            "mañana"
        )
    ) {

        const mañana =
            new Date();

        mañana.setDate(
            mañana.getDate() + 1
        );

        fecha =
            convertirFecha(
                mañana
            );

    }


    // ==========================================
    // EN X DÍAS
    // ==========================================

    const diasDesdeAhora =
        texto.match(
            /\ben\s+(\d+)\s+d[ií]as?\b/i
        );

    if (
        diasDesdeAhora
    ) {

        const cantidadDias =
            parseInt(
                diasDesdeAhora[1]
            );

        const nuevaFecha =
            new Date();

        nuevaFecha.setDate(
            nuevaFecha.getDate() +
            cantidadDias
        );

        fecha =
            convertirFecha(
                nuevaFecha
            );

    }


    // ==========================================
    // EN X HORAS
    // ==========================================

    const horasDesdeAhora =
        texto.match(
            /\ben\s+(\d+)\s+horas?\b/i
        );

    if (
        horasDesdeAhora
    ) {

        const cantidadHoras =
            parseInt(
                horasDesdeAhora[1]
            );

        const nuevaFechaHora =
            new Date();

        nuevaFechaHora.setHours(
            nuevaFechaHora.getHours() +
            cantidadHoras
        );

        fecha =
            convertirFecha(
                nuevaFechaHora
            );

        hora =
            String(
                nuevaFechaHora.getHours()
            ).padStart(2, "0") +
            ":" +
            String(
                nuevaFechaHora.getMinutes()
            ).padStart(2, "0");

    }


    // ==========================================
    // EN X MINUTOS
    // ==========================================

    const minutosDesdeAhora =
        texto.match(
            /\ben\s+(\d+)\s+minutos?\b/i
        );

    if (
        minutosDesdeAhora
    ) {

        const cantidadMinutos =
            parseInt(
                minutosDesdeAhora[1]
            );

        const nuevaFechaHora =
            new Date();

        nuevaFechaHora.setMinutes(
            nuevaFechaHora.getMinutes() +
            cantidadMinutos
        );

        fecha =
            convertirFecha(
                nuevaFechaHora
            );

        hora =
            String(
                nuevaFechaHora.getHours()
            ).padStart(2, "0") +
            ":" +
            String(
                nuevaFechaHora.getMinutes()
            ).padStart(2, "0");

    }


    // ==========================================
    // RECURRENCIA DIARIA
    // ==========================================

    if (
        esRecurrente &&
        tipoRecurrencia ===
        "diaria"
    ) {

        const ahora =
            new Date();

        if (hora) {

            const partes =
                hora.split(":");

            const horaTarea =
                parseInt(
                    partes[0]
                );

            const minutosTarea =
                parseInt(
                    partes[1]
                );

            const momentoTarea =
                new Date(
                    ahora.getFullYear(),
                    ahora.getMonth(),
                    ahora.getDate(),
                    horaTarea,
                    minutosTarea,
                    0,
                    0
                );

            if (
                momentoTarea >
                ahora
            ) {

                fecha =
                    convertirFecha(
                        ahora
                    );

            }

            else {

                const siguiente =
                    new Date(
                        ahora
                    );

                siguiente.setDate(
                    siguiente.getDate() + 1
                );

                fecha =
                    convertirFecha(
                        siguiente
                    );

            }

        }

        else {

            fecha =
                convertirFecha(
                    ahora
                );

        }

    }


    // ==========================================
    // RECURRENCIA SEMANAL
    // ==========================================

    if (
        esRecurrente &&
        tipoRecurrencia ===
        "semanal" &&
        diaRecurrencia !== null
    ) {

        const hoy =
            new Date();

        const diaActual =
            hoy.getDay();

        let diferencia =
            diaRecurrencia -
            diaActual;

        if (
            diferencia <= 0
        ) {

            diferencia += 7;

        }

        const fechaObjetivo =
            new Date();

        fechaObjetivo.setDate(
            hoy.getDate() +
            diferencia
        );

        fecha =
            convertirFecha(
                fechaObjetivo
            );

    }


    // ==========================================
    // DETECTAR HORA NORMAL
    // ==========================================

    let coincidenciaHora =
        null;

    if (
        !horasDesdeAhora &&
        !minutosDesdeAhora
    ) {

        coincidenciaHora =
            texto.match(
                /\b(2[0-3]|1[0-9]|[0-9])(?::([0-5][0-9]))?\s*(am|pm)?\b/i
            );

    }

    if (
        coincidenciaHora
    ) {

        let horas =
            parseInt(
                coincidenciaHora[1]
            );

        const minutos =
            coincidenciaHora[2] ||
            "00";

        const periodo =
            coincidenciaHora[3]
                ? coincidenciaHora[3]
                    .toLowerCase()
                : "";

        if (
            periodo === "pm" &&
            horas < 12
        ) {

            horas += 12;

        }

        if (
            periodo === "am" &&
            horas === 12
        ) {

            horas = 0;

        }

        hora =
            String(
                horas
            ).padStart(
                2,
                "0"
            ) +
            ":" +
            minutos;

    }


    // ==========================================
    // DE LA TARDE
    // ==========================================

    if (
        hora &&
        texto.includes(
            "de la tarde"
        ) &&
        parseInt(
            hora.substring(
                0,
                2
            )
        ) < 12
    ) {

        const horas =
            parseInt(
                hora.substring(
                    0,
                    2
                )
            ) + 12;

        hora =
            String(
                horas
            ).padStart(
                2,
                "0"
            ) +
            ":" +
            hora.substring(3);

    }


    // ==========================================
    // DE LA NOCHE
    // ==========================================

    if (
        hora &&
        texto.includes(
            "de la noche"
        ) &&
        parseInt(
            hora.substring(
                0,
                2
            )
        ) < 12
    ) {

        const horas =
            parseInt(
                hora.substring(
                    0,
                    2
                )
            ) + 12;

        hora =
            String(
                horas
            ).padStart(
                2,
                "0"
            ) +
            ":" +
            hora.substring(3);

    }


    // ==========================================
    // LIMPIAR FRASE
    // ==========================================

    let tareaLimpia =
        textoOriginal

            .replace(
                /\b(hoy|mañana)\b/gi,
                ""
            )

            .replace(
                /\ben\s+\d+\s+d[ií]as?\b/gi,
                ""
            )

            .replace(
                /\ben\s+\d+\s+horas?\b/gi,
                ""
            )

            .replace(
                /\ben\s+\d+\s+minutos?\b/gi,
                ""
            )

            .replace(
                /\b(todos los días|cada día)\b/gi,
                ""
            )

            .replace(
                /\b(todos los|cada)\s+(lunes|martes|miércoles|jueves|viernes|sábado|domingo)\b/gi,
                ""
            )

            .replace(
                /\b(lunes|martes|miércoles|jueves|viernes|sábado|domingo)\b/gi,
                ""
            )

            .replace(
                /\ba\s+las?\b/gi,
                ""
            )

            .replace(
                /\bde\s+la\s+(mañana|tarde|noche)\b/gi,
                ""
            )

            .replace(
                /\b(am|pm)\b/gi,
                ""
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim();


    if (
        coincidenciaHora
    ) {

        tareaLimpia =
            tareaLimpia.replace(
                coincidenciaHora[0],
                ""
            );

    }


    tareaLimpia =
        tareaLimpia

            .replace(
                /^tengo que\s+/i,
                ""
            )

            .replace(
                /^debo\s+/i,
                ""
            )

            .replace(
                /^necesito\s+/i,
                ""
            )

            .replace(
                /^recuérdame\s+/i,
                ""
            )

            .replace(
                /^el\s+/i,
                ""
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim();


    if (
        tareaLimpia === ""
    ) {

        alert(
            "No pude identificar la tarea."
        );

        return;

    }


    // ==========================================
    // COLOCAR RESULTADOS
    // ==========================================

    const entradaTarea =
        document.getElementById(
            "entradaTarea"
        );

    const fechaTarea =
        document.getElementById(
            "fechaTarea"
        );

    const horaTarea =
        document.getElementById(
            "horaTarea"
        );

    if (entradaTarea) {

        entradaTarea.value =
            tareaLimpia;

    }

    if (fechaTarea) {

        fechaTarea.value =
            fecha;

    }

    if (horaTarea) {

        horaTarea.value =
            hora;

    }


    // ==========================================
    // MOSTRAR RESULTADO
    // ==========================================

    const resultado =
        document.getElementById(
            "resultadoIA"
        );

    const resultadoTexto =
        document.getElementById(
            "resultadoTexto"
        );

    if (
        resultado &&
        resultadoTexto
    ) {

        const textoFecha =
            fecha
                ? formatearFecha(
                    fecha
                )
                : "Sin fecha";

        let textoRecurrencia =
            "";

        if (
            esRecurrente
        ) {

            textoRecurrencia =
                "<br>🔁 " +

                (
                    tipoRecurrencia ===
                    "diaria"

                        ? "Todos los días"

                        : obtenerTextoRecurrencia(
                            {
                                tipoRecurrencia:
                                    tipoRecurrencia,

                                diaRecurrencia:
                                    diaRecurrencia
                            }
                        )
                );

        }

        resultadoTexto.innerHTML = `

            <strong>
                ${tareaLimpia}
            </strong>

            <br><br>

            📅 ${textoFecha}

            <br>

            🕐 ${
                hora ||
                "Sin hora"
            }

            ${textoRecurrencia}

        `;

        resultado.style.display =
            "block";

    }


    // ==========================================
    // GUARDAR INTERPRETACIÓN TEMPORAL
    // ==========================================

    window.tareaInterpretada = {

        texto:
            tareaLimpia,

        fecha:
            fecha,

        hora:
            hora,

        recurrente:
            esRecurrente,

        tipoRecurrencia:
            tipoRecurrencia,

        diaRecurrencia:
            diaRecurrencia,

        canal:
            "app"

    };

}


// ==================================================
// GUARDAR TAREA INTERPRETADA
// ==================================================

function guardarTareaInterpretada() {

    if (
        !window.tareaInterpretada
    ) {

        alert(
            "Primero interpreta una tarea."
        );

        return;

    }

    const datos =
        window.tareaInterpretada;

    const canal =
        document.getElementById(
            "canalTarea"
        );

    const nuevaTarea = {

        texto:
            datos.texto,

        fecha:
            datos.fecha,

        hora:
            datos.hora,

        canal:
            canal
                ? canal.value
                : "app",

        completada:
            false,

        recordada:
            false,

        recurrente:
            datos.recurrente,

        tipoRecurrencia:
            datos.tipoRecurrencia,

        diaRecurrencia:
            datos.diaRecurrencia

    };

    tareas.push(
        nuevaTarea
    );

    guardarTareas();

    mostrarTareas();

    sincronizarRecordatorioConServidor(
        nuevaTarea
    );

    const entrada =
        document.getElementById(
            "entradaTarea"
        );

    const fecha =
        document.getElementById(
            "fechaTarea"
        );

    const hora =
        document.getElementById(
            "horaTarea"
        );

    if (entrada) {
        entrada.value = "";
    }

    if (fecha) {
        fecha.value = "";
    }

    if (hora) {
        hora.value = "";
    }

    if (canal) {

        canal.value =
            "app";

    }

    const resultado =
        document.getElementById(
            "resultadoIA"
        );

    if (resultado) {

        resultado.style.display =
            "none";

    }

    window.tareaInterpretada =
        null;

}


// ==================================================
// RECONOCIMIENTO DE VOZ
// ==================================================

function iniciarVoz() {

    const ReconocimientoVoz =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (
        !ReconocimientoVoz
    ) {

        alert(
            "Tu navegador no permite reconocimiento de voz."
        );

        return;

    }

    const reconocimiento =
        new ReconocimientoVoz();

    reconocimiento.lang =
        "es-ES";

    reconocimiento.continuous =
        false;

    reconocimiento.interimResults =
        false;

    reconocimiento.onstart =
        function() {

            console.log(
                "🎤 Escuchando..."
            );

        };

    reconocimiento.onresult =
        function(event) {

            const texto =
                event.results[0][0]
                    .transcript;

            const entrada =
                document.getElementById(
                    "entradaTarea"
                );

            if (entrada) {

                entrada.value =
                    texto;

            }

            interpretarTarea();

        };

    reconocimiento.onerror =
        function(event) {

            console.log(
                "Error de voz:",
                event.error
            );

            alert(
                "No pude escuchar correctamente. Inténtalo otra vez."
            );

        };

    try {

        reconocimiento.start();

    }

    catch (error) {

        console.error(
            "❌ Error iniciando reconocimiento de voz:",
            error
        );

    }

}


// ==================================================
// CONECTAR CON SERVIDOR SSE
// ==================================================

function conectarServidorEventos() {

    try {

        console.log(
            "📡 Conectando SSE:",
            URL_SERVIDOR_PUSH +
            "/eventos"
        );

        const eventos =
            new EventSource(
                URL_SERVIDOR_PUSH +
                "/eventos"
            );

        eventos.onopen =
            function() {

                console.log(
                    "🟢 Conectado con el servidor"
                );

                console.log(
                    "📡 Sistema de eventos conectado"
                );

            };

        eventos.onmessage =
            function(evento) {

                console.log(
                    "📩 Evento recibido:",
                    evento.data
                );

                if (
                    evento.data ===
                    "conectado"
                ) {

                    return;

                }

                try {

                    const tarea =
                        JSON.parse(
                            evento.data
                        );

                    console.log(
                        "🚨 Recordatorio recibido:",
                        tarea
                    );

                    mostrarRecordatorioDesdeServidor(
                        tarea
                    );

                }

                catch (error) {

                    console.error(
                        "❌ Error leyendo evento:",
                        error
                    );

                }

            };

        eventos.onerror =
            function() {

                console.log(
                    "⚠️ Conexión SSE perdida. El navegador intentará reconectarse."
                );

            };

    }

    catch (error) {

        console.error(
            "❌ Error conectando con servidor:",
            error
        );

    }

}


// ==================================================
// MOSTRAR RECORDATORIO DEL SERVIDOR
// ==================================================

function mostrarRecordatorioDesdeServidor(
    tarea
) {

    if (!tarea) {
        return;
    }

    console.log(
        "🔔 Recordatorio del servidor:",
        tarea.texto
    );

    const indice =
        tareas.findIndex(
            function(tareaLocal) {

                return (

                    tareaLocal.texto ===
                    tarea.texto &&

                    tareaLocal.fecha ===
                    tarea.fecha &&

                    tareaLocal.hora ===
                    tarea.hora

                );

            }
        );

    if (
        indice !== -1
    ) {

        mostrarModalRecordatorio(
            indice
        );

    }

}


// ==================================================
// REGISTRAR SERVICE WORKER
// ==================================================

async function registrarServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    ) {

        console.log(
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
            "🟢 Service Worker registrado correctamente."
        );

        console.log(
            "📄 Scope:",
            registro.scope
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


// ==================================================
// OBTENER CLAVE PÚBLICA VAPID
// ==================================================

async function obtenerClavePublicaVAPID() {

    try {

        console.log(
            "📡 Obteniendo clave pública VAPID..."
        );

        const respuesta =
            await fetch(
                URL_SERVIDOR_PUSH +
                "/clave-publica"
            );

        if (!respuesta.ok) {

            throw new Error(
                "El servidor respondió con HTTP " +
                respuesta.status
            );

        }

        const datos =
            await respuesta.json();

        console.log(
            "📡 Respuesta VAPID:",
            datos
        );

        if (
            !datos.ok ||
            !datos.clavePublica
        ) {

            throw new Error(
                "No se recibió la clave pública VAPID."
            );

        }

        console.log(
            "🟢 Clave pública VAPID obtenida correctamente."
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


// ==================================================
// CONVERTIR CLAVE BASE64
// ==================================================

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
        ++i
    ) {

        outputArray[i] =
            rawData.charCodeAt(i);

    }

    return outputArray;

}


// ==================================================
// SUSCRIBIR NAVEGADOR A PUSH
// ==================================================

async function suscribirPush() {

    try {

        console.log(
            "🔔 Iniciando suscripción Push..."
        );

        if (
            !("serviceWorker" in navigator)
        ) {

            console.log(
                "❌ Service Worker no disponible."
            );

            return false;

        }

        if (
            !("PushManager" in window)
        ) {

            console.log(
                "❌ Push API no disponible."
            );

            return false;

        }

        if (
            !("Notification" in window)
        ) {

            console.log(
                "❌ Notification API no disponible."
            );

            return false;

        }

        if (
            Notification.permission !==
            "granted"
        ) {

            console.log(
                "⚠️ El permiso de notificaciones todavía no está concedido."
            );

            return false;

        }

        const registro =
            await navigator.serviceWorker.ready;

        console.log(
            "🟢 Service Worker listo para Push."
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

        if (
            suscripcion
        ) {

            console.log(
                "🔔 Ya existe una suscripción Push."
            );

        }

        else {

            console.log(
                "🔔 Creando nueva suscripción Push..."
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
                "🟢 Nueva suscripción Push creada."
            );

        }

        console.log(
            "📡 Enviando suscripción al servidor..."
        );

        const respuesta =
            await fetch(

                URL_SERVIDOR_PUSH +
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

        if (!respuesta.ok) {

            throw new Error(
                "El servidor respondió HTTP " +
                respuesta.status
            );

        }

        const datos =
            await respuesta.json();

        console.log(
            "📡 Respuesta del servidor:",
            datos
        );

        if (
            datos.ok
        ) {

            console.log(
                "✅ Suscripción Push enviada correctamente al servidor."
            );

            return true;

        }

        console.error(
            "❌ El servidor rechazó la suscripción."
        );

        return false;

    }

    catch (error) {

        console.error(
            "❌ Error configurando Push:",
            error
        );

        return false;

    }

}


// ==================================================
// INICIAR SISTEMA PUSH
// ==================================================

async function iniciarSistemaPush() {

    console.log(
        "🚀 Iniciando sistema Push..."
    );

    const registro =
        await registrarServiceWorker();

    if (
        !registro
    ) {

        return;

    }

    if (
        !("Notification" in window)
    ) {

        console.log(
            "❌ Este navegador no soporta notificaciones."
        );

        return;

    }

    console.log(
        "🔔 Estado actual de notificaciones:",
        Notification.permission
    );

    if (
        Notification.permission ===
        "denied"
    ) {

        console.log(
            "⚠️ Las notificaciones están bloqueadas para este sitio."
        );

        return;

    }

    if (
        Notification.permission ===
        "default"
    ) {

        console.log(
            "ℹ️ Push preparado. Pulsa el botón para activar las notificaciones."
        );

        return;

    }

    await suscribirPush();

}


// ==================================================
// ACTIVAR PUSH MANUALMENTE
// ==================================================

async function activarPush() {

    console.log(
        "🔔 Activando notificaciones..."
    );

    try {

        if (
            !("Notification" in window)
        ) {

            alert(
                "Tu navegador no soporta notificaciones."
            );

            return;

        }

        const registro =
            await registrarServiceWorker();

        if (
            !registro
        ) {

            alert(
                "❌ No se pudo registrar el Service Worker."
            );

            return;

        }

        const permiso =
            await Notification.requestPermission();

        console.log(
            "🔔 Permiso obtenido:",
            permiso
        );

        if (
            permiso !==
            "granted"
        ) {

            alert(
                "⚠️ No se permitieron las notificaciones."
            );

            return;

        }

        const resultado =
            await suscribirPush();

        if (
            resultado
        ) {

            alert(
                "✅ ¡Notificaciones Push activadas correctamente!"
            );

            console.log(
                "🎉 Push configurado correctamente."
            );

        }

        else {

            alert(
                "⚠️ El permiso fue concedido, pero no se pudo registrar Push en el servidor."
            );

        }

    }

    catch (error) {

        console.error(
            "❌ Error activando Push:",
            error
        );

        alert(
            "❌ Ocurrió un error activando las notificaciones."
        );

    }

}


// ==================================================
// COMPROBAR SUSCRIPCIÓN ACTUAL
// ==================================================

async function comprobarSuscripcionPush() {

    try {

        if (
            !("serviceWorker" in navigator) ||
            !("PushManager" in window)
        ) {

            return null;

        }

        const registro =
            await navigator.serviceWorker.ready;

        const suscripcion =
            await registro.pushManager.getSubscription();

        if (
            suscripcion
        ) {

            console.log(
                "🟢 El navegador tiene una suscripción Push."
            );

            return suscripcion;

        }

        console.log(
            "ℹ️ El navegador todavía no tiene una suscripción Push."
        );

        return null;

    }

    catch (error) {

        console.error(
            "❌ Error comprobando suscripción:",
            error
        );

        return null;

    }

}


// ==================================================
// INICIAR APP
// ==================================================

mostrarTareas();


// ==================================================
// REVISAR RECORDATORIOS LOCALES
// ==================================================

setInterval(
    revisarRecordatorios,
    10000
);


// ==================================================
// CONECTAR CON SERVIDOR SSE
// ==================================================

conectarServidorEventos();


// ==================================================
// INICIAR SERVICE WORKER Y PUSH
// ==================================================

iniciarSistemaPush();


// ==================================================
// EXPONER FUNCIONES PARA HTML
// ==================================================

window.activarPush =
    activarPush;

window.agregarTarea =
    agregarTarea;

window.completarTarea =
    completarTarea;

window.interpretarTarea =
    interpretarTarea;

window.guardarTareaInterpretada =
    guardarTareaInterpretada;

window.iniciarVoz =
    iniciarVoz;

window.completarDesdeRecordatorio =
    completarDesdeRecordatorio;

window.posponerDesdeRecordatorio =
    posponerDesdeRecordatorio;

window.posponerMañanaDesdeRecordatorio =
    posponerMañanaDesdeRecordatorio;

window.cerrarModalRecordatorio =
    cerrarModalRecordatorio;

window.comprobarSuscripcionPush =
    comprobarSuscripcionPush;