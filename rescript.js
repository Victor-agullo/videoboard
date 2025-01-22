const events = {
  flashcards: [
    {
      concept: "Tax Campaign",
      description:
        "Specific period during which tax returns are filed and processed by the Tax Agency.",
      time_interval: "00:01:21-00:01:24",
    },
  ],
  multiple_choice_questions: [
    {
      correct_answer: "A red pen",
      explanation:
        "The presenter states he uses a red pen to cross out the data he is going to fill in the tax form [00:57-01:01].",
      options: ["A pencil", "A blue pen", "A green pen", "A red pen"],
      question:
        "What kind of pen does the speaker use to cross out the data on the paper?",
      time_interval: "00:00:57-00:01:01",
    },
  ],
  open_ended_questions: [
    {
      question:
        "The video emphasizes the need for fiscal and activity data before beginning the online tax return. How might someone without these documents prepare or gain access to such information?",
      time_interval: "00:00:47-00:00:56",
    },
  ],
  summary: {
    summary:
      "This video is about submitting a tax return online using Renta Web, the Tax Agency tool...",
    time_interval: "0:15:30-00:15:54",
  },
};

const overlay = document.getElementById("overlay");
const videoElement = document.getElementById("player");
const player = new Plyr(videoElement);
let activeEvents = new Set(); // Guarda los tiempos que ya han sido activados

// Convierte tiempo en formato hh:mm:ss a segundos
function timeToSeconds(time) {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

// Obtener todos los eventos del JSON
function extractEvents(json) {
  const allEvents = [];
  Object.keys(json).forEach((category) => {
    if (Array.isArray(json[category])) {
      json[category].forEach((item) => {
        if (item.time_interval) {
          const [start] = item.time_interval.split("-").map(timeToSeconds);
          allEvents.push({ ...item, time: start });
        }
      });
    }
  });
  return allEvents;
}

const allEvents = extractEvents(events);

// Escucha el progreso del vídeo
player.on("timeupdate", () => {
  const currentTime = Math.floor(player.currentTime);

  // Busca si hay un evento en el tiempo actual
  const event = allEvents.find((e) => e.time === currentTime);

  // Si hay un evento y no ha sido activado antes, ejecútalo
  if (event && !activeEvents.has(event.time)) {
    activeEvents.add(event.time); // Marca el evento como mostrado
    overlay.style.pointerEvents = "auto"; // Activa el overlay
    player.pause(); // Pausa el vídeo
    showEvent(event); // Muestra el evento interactivo
  }
});

// Mostrar eventos interactivos
function showEvent(event) {
  overlay.style.display = "flex";
  overlay.innerHTML = "";

  const card = document.createElement("div");
  card.classList.add("card");

  if (event.concept) {
    showFlashCard(event.concept, event.description, card);
  } else if (event.question) {
    if (event.options) {
      showQuizz(event.question, event.options, event.correct_answer, card);
    } else {
      showOpenQuestion(event.question, card);
    }
  }

  overlay.appendChild(card);
}

// Mostrar un quizz
function showQuizz(question, options, correctAnswer, card) {
  card.innerHTML = `<p>${question}</p>`;

  options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.onclick = () => {
      if (option === correctAnswer) {
        closeOverlay();
      } else {
        alert("Respuesta incorrecta. Inténtalo de nuevo.");
      }
    };
    card.appendChild(button);
  });
}

// Mostrar una pregunta abierta
function showOpenQuestion(question, card) {
  card.innerHTML = `<p>${question}</p>`;

  const input = document.createElement("textarea");
  card.appendChild(input);

  const submitButton = document.createElement("button");
  submitButton.textContent = "Enviar";
  submitButton.onclick = closeOverlay;
  card.appendChild(submitButton);
}

// Mostrar una flashcard
function showFlashCard(prompt, answer, card) {
  card.innerHTML = `<p>${prompt}</p>`;

  const revealButton = document.createElement("button");
  revealButton.textContent = "Mostrar respuesta";
  card.appendChild(revealButton);

  const continueButton = document.createElement("button");
  continueButton.textContent = "Continuar";
  continueButton.onclick = closeOverlay;
  card.appendChild(continueButton);
    

  // Crear el contenedor para la respuesta (inicialmente oculto)
  const answerEl = document.createElement("p");
  answerEl.style.display = "none"; // Ocultar respuesta al inicio
  answerEl.textContent = answer;
  answerEl.classList.add("answer");
  card.appendChild(answerEl);
    
  // Evento para mostrar la respuesta
  revealButton.onclick = () => {
  answerEl.style.display = "block"; // Mostrar la respuesta
  revealButton.style.display = "none"; // Ocultar el botón después de usarlo
  continueButton.style.display = "block"; // Mostrar el botón de continuar
  };
}

// Cerrar el overlay y reanudar el vídeo
function closeOverlay() {
  overlay.style.display = "none";
  overlay.style.pointerEvents = "none"; // Desactiva el overlay
  player.play();
}

// Crear marcadores en la barra de progreso
function addCuesToProgressBar(player, events) {
  const progress = player.elements.progress;

  if (progress) {
    events.forEach((event) => {
      const cue = document.createElement("span");
      cue.classList.add("plyr__cue");
      cue.style.left = `${(event.time / player.duration) * 100}%`;

      progress.appendChild(cue);
    });
  }
}

// Llama a la función después de que el reproductor esté listo
player.on("ready", () => {
  addCuesToProgressBar(player, allEvents);
});

overlay.style.pointerEvents = "none";
