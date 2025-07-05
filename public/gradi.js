document.addEventListener("DOMContentLoaded", () => {
  const gradiBtn = document.getElementById("gradi");
  const gradijentTabla = document.createElement("div");
  gradijentTabla.id = "gradijent";
  gradijentTabla.style.display = "none";
  document.body.appendChild(gradijentTabla);

 const elementi = [
  "chatContainer", "toolbar", "chatInput", "guestList", "openModal", "smilesBtn", "GBtn", "sound",
];
const paket = ["openModal", "smilesBtn", "GBtn","sound"];

  const neonBoje = [
    "red", "yellow", "lime", "white", "blue", "gray", "pink", "purple",
    "orange", "cyan", "magenta", "turquoise", "gold", "silver", "navy", "teal",
    "darkred", "fuchsia", "orchid", "hotpink", "lightcoral", "plum",
    "+"
  ];

  gradiBtn.addEventListener("click", () => {
    if (gradijentTabla.style.display === "none") {
      prikaziPocetnuListu();
      Object.assign(gradijentTabla.style, {
        position: "fixed", top: "60px", left: "20px",
        background: "#000", color: "white", padding: "20px",
        border: "2px solid #fff", borderRadius: "10px",
        boxShadow: "0 0 15px #fff", fontFamily: "Arial, sans-serif",
        width: "200px", height: "600px", overflowY: "auto",
        zIndex: "99999"
      });
      gradijentTabla.style.display = "block";
    } else {
      gradijentTabla.style.display = "none";
    }
  });

  function prikaziPocetnuListu() {
    gradijentTabla.innerHTML = `
      <h3 style='margin-bottom:10px;'>Izaberi element</h3>
      <ul id='listaElem' style='list-style:none;padding:0;margin:0;'></ul>
      <button id="resetujSve" style="margin-top:10px; padding:5px 10px; cursor:pointer;">Resetuj sve</button>
    `;
    const lista = gradijentTabla.querySelector("#listaElem");

    elementi.forEach(id => {
      const el = document.createElement("li");
      el.textContent = `#${id}`;
      Object.assign(el.style, {
        cursor: "pointer", padding: "8px 12px", marginBottom: "4px",
        borderBottom: "1px solid yellow", fontWeight: "bold", fontStyle: "italic"
      });
      el.addEventListener("mouseover", () => el.style.background = "rgba(255,255,0,0.1)");
      el.addEventListener("mouseout", () => el.style.background = "transparent");
      el.addEventListener("click", () => prikaziBoje(id));
      lista.appendChild(el);
    });

    document.getElementById("resetujSve").addEventListener("click", () => {
      elementi.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.style.borderColor = "";
          if (id === "guestList") {
            document.querySelectorAll('.guest').forEach(gost => gost.style.borderBottomColor = "");
            const styleTag = document.getElementById('guestList-scrollbar-style');
            if (styleTag) styleTag.remove();
          }
        }
        socket.emit("promeniGradijent", { id: id, type: "border", gradijent: "" });
      });
      prikaziPocetnuListu();
    });
  }

  function prikaziBoje(id) {
    gradijentTabla.innerHTML = `
      <h3 style='margin-bottom:10px;'>Izaberi boju za <span style='color:yellow;'>#${id}</span></h3>
    `;

    neonBoje.forEach(boja => {
      const dugme = document.createElement("button");
      dugme.textContent = boja;
      Object.assign(dugme.style, {
        background: boja !== "+" ? boja : "black",
        color: boja !== "+" ? "black" : "yellow",
        margin: "5px",
        padding: "6px 10px",
        cursor: "pointer",
        border: boja === "+" ? "1px solid yellow" : "none"
      });

      if (boja === "+") {
        dugme.id = "kafa";
        dugme.addEventListener("click", () => {
          // Prikaz gradijenata iz diva #gradijent .gradijent-box
          const gradientBoxes = document.querySelectorAll("#gradijent .gradijent-box");
          gradijentTabla.innerHTML = `<h3 style='margin-bottom:10px;'>Gradijenti za <span style='color:yellow;'>#${id}</span></h3>`;
          gradientBoxes.forEach(box => {
            const gBtn = box.cloneNode(true);
            gBtn.style.width = "40px";
            gBtn.style.height = "40px";
            gBtn.style.margin = "5px";
            gBtn.addEventListener("click", () => {
              const style = window.getComputedStyle(box);
              const bg = style.backgroundImage;
              primeniBoju(id, bg);
            });
            gradijentTabla.appendChild(gBtn);
          });
          gradijentTabla.appendChild(createBackButton());
        });
      } else {
        dugme.addEventListener("click", () => primeniBoju(id, boja));
      }

      gradijentTabla.appendChild(dugme);
    });

    const defaultBtn = document.createElement("button");
    defaultBtn.textContent = "Default";
    Object.assign(defaultBtn.style, {
      marginTop: "15px", padding: "5px 10px", border: "1px solid yellow",
      backgroundColor: "black", color: "yellow", cursor: "pointer",
      borderRadius: "5px"
    });
    defaultBtn.addEventListener("click", () => {
      const el = document.getElementById(id);
      if (el) {
        el.style.borderColor = "";
        if (id === "guestList") {
          document.querySelectorAll('.guest').forEach(gost => gost.style.borderBottomColor = "");
          const styleTag = document.getElementById('guestList-scrollbar-style');
          if (styleTag) styleTag.remove();
        }
      }
      socket.emit("promeniGradijent", { id: id, type: "border", gradijent: "" });
      prikaziPocetnuListu();
    });
    gradijentTabla.appendChild(defaultBtn);

    gradijentTabla.appendChild(createBackButton());
  }

  function createBackButton() {
    const btn = document.createElement("button");
    btn.textContent = "Nazad";
    Object.assign(btn.style, {
      marginTop: "15px", padding: "5px 10px", border: "1px solid yellow",
      backgroundColor: "black", color: "yellow", cursor: "pointer",
      borderRadius: "5px"
    });
    btn.addEventListener("click", () => prikaziPocetnuListu());
    return btn;
  }

function primeniBoju(id, boja) {
  const targetIds = paket.includes(id) ? paket : [id];
  targetIds.forEach(eid => {
    const el = document.getElementById(eid);
    if (el) {
      if (boja.includes("gradient")) {
        el.style.borderImage = boja;
        el.style.borderImageSlice = 1;
        el.style.borderColor = "";
      } else {
        el.style.borderImage = "";
        el.style.borderColor = boja;
      }

      if (eid === "guestList") {
        // Promena border-bottom za goste
        document.querySelectorAll('.guest, .virtual-guest').forEach(gost => {
          gost.style.borderBottom = boja.includes("gradient")
            ? "1px solid transparent"
            : `1px solid ${boja}`;
        });

        // Scrollbar stil
        const styleId = 'guestList-scrollbar-style';
        let styleTag = document.getElementById(styleId);
        if (!styleTag) {
          styleTag = document.createElement('style');
          styleTag.id = styleId;
          document.head.appendChild(styleTag);
        }
        styleTag.textContent = `
          #guestList::-webkit-scrollbar-thumb {
            background: ${boja};
            border-radius: 5px;
          }
        `;
      }
    }
    socket.emit("promeniGradijent", { id: eid, type: "border", gradijent: boja });
  });
}

  socket.on("promeniGradijent", (data) => {
    setTimeout(() => {
      const el = document.getElementById(data.id);
      if (el) {
        if (data.gradijent.includes("gradient")) {
          el.style.borderImage = data.gradijent;
          el.style.borderImageSlice = 1;
          el.style.borderColor = "";
        } else {
          el.style.borderImage = "";
          el.style.borderColor = data.gradijent;
        }
      }
    }, 5000);  // 5 sekundi čekanja
  });

  socket.on("pocetnoStanje", (stanje) => {
    for (const id in stanje) {
      const el = document.getElementById(id);
      if (el) {
        if (stanje[id].gradijent.includes("gradient")) {
          el.style.borderImage = stanje[id].gradijent;
          el.style.borderImageSlice = 1;
          el.style.borderColor = "";
        } else {
          el.style.borderImage = "";
          el.style.borderColor = stanje[id].gradijent;
        }
      }
    }
  });
});
