document.addEventListener("DOMContentLoaded", () => {
  const baroBtn = document.getElementById("baro");
  let panel = null;

  const elementi = [
    "chatContainer", "toolbar", "chatInput", "guestList",
    "openModal", "smilesBtn", "GBtn", "sound"
  ];

  baroBtn.addEventListener("click", () => {
    if (panel && panel.style.display === "block") {
      panel.style.display = "none";
      return;
    }

    if (!panel) {
      panel = document.createElement("div");
      panel.id = "tulipe";
      Object.assign(panel.style, {
        position: "fixed",
        top: "60px",
        left: "20px",
        backgroundColor: "#000",
        color: "#fff",
        padding: "20px",
        border: "2px solid #fff",
        borderRadius: "10px",
        boxShadow: "0 0 15px #fff",
        fontFamily: "Arial, sans-serif",
        width: "350px",
        maxHeight: "80vh",
        overflowY: "auto",
        zIndex: "99999",
        display: "block"
      });
      document.body.appendChild(panel);
    } else {
      panel.style.display = "block";
      panel.innerHTML = "";
    }

    panel.innerHTML = `<h3 style="margin-bottom:15px;">Podesi border-width</h3>`;

    elementi.forEach(id => {
      const red = document.createElement("div");
      red.style.marginBottom = "12px";
      red.style.display = "flex";
      red.style.alignItems = "center";

      const label = document.createElement("span");
      label.textContent = `#${id}`;
      Object.assign(label.style, {
        width: "85px",
        color: "yellow",
        fontWeight: "bold",
        fontStyle: "italic"
      });
      red.appendChild(label);

      const inputFields = {};
      const pos = ["Top", "Right", "Bottom", "Left"];

      pos.forEach(strana => {
        const inp = document.createElement("input");
        inp.type = "number";
        inp.placeholder = strana[0];
        Object.assign(inp.style, {
          width: "36px",
          marginRight: "5px",
          padding: "2px",
          fontSize: "12px"
        });

        inp.addEventListener("input", () => {
          const vrednost = `${inputFields.Top.value || 0}px ${inputFields.Right.value || 0}px ${inputFields.Bottom.value || 0}px ${inputFields.Left.value || 0}px`;

          const el = document.getElementById(id);
          if (el) {
            el.style.borderWidth = vrednost;
            socket.emit("promeniSirinu", { id, borderWidth: vrednost });
          }
        });

        inputFields[strana] = inp;
        red.appendChild(inp);
      });

      // Reset dugme
      const resetBtn = document.createElement("button");
      resetBtn.textContent = "⭮";
      Object.assign(resetBtn.style, {
        padding: "2px 6px",
        cursor: "pointer",
        fontSize: "12px",
        backgroundColor: "black",
        color: "yellow",
        border: "1px solid yellow",
        borderRadius: "4px"
      });

      resetBtn.addEventListener("click", () => {
        const el = document.getElementById(id);
        if (el) el.style.borderWidth = "";
        socket.emit("promeniSirinu", { id, borderWidth: "" });
        pos.forEach(s => inputFields[s].value = "");
      });

      red.appendChild(resetBtn);
      panel.appendChild(red);
    });
  });

  socket.on("promeniSirinu", data => {
    setTimeout(() => {
      const el = document.getElementById(data.id);
      if (el) {
        el.style.borderWidth = data.borderWidth;
      }
    }, 5000);
  });

  socket.on("pocetnoStanjeSirina", stanje => {
    for (const id in stanje) {
      const el = document.getElementById(id);
      if (el) {
        el.style.borderWidth = stanje[id];
      }
    }
  });
});
