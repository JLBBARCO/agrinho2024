/* Refactored site script: modular, robust, accessible */

(function () {
  "use strict";

  const CONTACT_DATA_URL =
    "https://raw.githubusercontent.com/JLBBARCO/portfolio/refs/heads/main/src/json/areas/contact.json";
  const CONTACT_ICON_MAP = { email: "email" };

  function detectScriptBase() {
    if (document.currentScript && document.currentScript.src) {
      return new URL(".", document.currentScript.src).href;
    }
    const scripts = Array.from(document.getElementsByTagName("script"));
    const found = scripts.find(
      (s) => s.src && s.src.includes("/src/js/script.js"),
    );
    if (found && found.src) return new URL(".", found.src).href;
    return document.baseURI;
  }

  const SCRIPT_BASE = detectScriptBase();

  function resolveAssetUrl(relativePath) {
    return new URL(relativePath, SCRIPT_BASE).href;
  }

  const SVG_DATA_URL = resolveAssetUrl("../assets/json/svg.json");

  function createFooterStructure() {
    const footer = document.querySelector("footer");
    if (!footer) return null;

    let container = footer.querySelector("article.container");
    if (!container) {
      container = document.createElement("article");
      container.classList.add("container");
      footer.appendChild(container);
    }

    let propaganda = container.querySelector("#FAEP");
    if (!propaganda) {
      propaganda = document.createElement("div");
      propaganda.id = "FAEP";
      propaganda.classList.add("card");
      propaganda.style.backgroundColor = "grey";
      propaganda.style.padding = "20px";

      const linkFaep = document.createElement("a");
      linkFaep.href = "https://www.sistemafaep.org.br/agrinho/";
      linkFaep.target = "_blank";
      linkFaep.rel = "noopener noreferrer";

      const imgFaep = document.createElement("img");
      imgFaep.src =
        "https://www.sistemafaep.org.br/wp-content/uploads/2021/12/SistemaFaepSenarPR_logo_mini@2x.png";
      imgFaep.alt = "FAEP";
      imgFaep.classList.add("img-propaganda");

      linkFaep.appendChild(imgFaep);
      propaganda.appendChild(linkFaep);
      container.appendChild(propaganda);
    }

    let contatoCard = container.querySelector("#contato");
    if (!contatoCard) {
      contatoCard = document.createElement("div");
      contatoCard.id = "contato";
      contatoCard.classList.add("card");
      container.appendChild(contatoCard);
    }

    return contatoCard;
  }

  async function renderContatos() {
    const contatoCard = createFooterStructure();
    if (!contatoCard) return;

    contatoCard.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = "Contato";
    contatoCard.appendChild(title);

    const list = document.createElement("div");
    list.classList.add("contato-list");
    contatoCard.appendChild(list);

    try {
      const [contactResponse, svgResponse] = await Promise.all([
        fetch(CONTACT_DATA_URL),
        fetch(SVG_DATA_URL),
      ]);

      if (!contactResponse.ok) throw new Error("Falha ao carregar contatos");
      if (!svgResponse.ok) throw new Error("Falha ao carregar ícones");

      const contactData = await contactResponse.json();
      const svgData = await svgResponse.json();
      const contacts = Array.isArray(contactData.cards)
        ? contactData.cards
        : [];
      const icons =
        svgData && typeof svgData.icons === "object" ? svgData.icons : {};

      contacts.forEach((contact) => {
        const iconKey = CONTACT_ICON_MAP[contact.iconName] || contact.iconName;
        const iconMarkup = icons[iconKey] || icons[contact.iconName] || "";

        const link = document.createElement("a");
        link.href = contact.url;
        link.target = contact.url.startsWith("mailto:") ? "_self" : "_blank";
        link.rel = "noopener noreferrer";
        link.classList.add("contato-link");

        const iconWrap = document.createElement("span");
        iconWrap.classList.add("contato-icon");
        iconWrap.setAttribute("aria-hidden", "true");
        iconWrap.innerHTML = iconMarkup;
        iconWrap.title = contact.name;

        link.appendChild(iconWrap);
        list.appendChild(link);
      });
    } catch (err) {
      contatoCard.appendChild(
        Object.assign(document.createElement("p"), {
          textContent: "Não foi possível carregar os contatos.",
        }),
      );
      console.error(err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderContatos);
  } else {
    renderContatos();
  }
})();
