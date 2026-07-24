"use strict";

(function initHeaderAccount(global) {
  const authLink = document.querySelector("#header-auth-link");
  if (!authLink) return;

  const LABELS = Object.freeze({
    login: "\uB85C\uADF8\uC778",
    account: "\uB0B4 \uACC4\uC815",
    signedIn: "\uB85C\uADF8\uC778\uB428",
    loginAccount: "\uB85C\uADF8\uC778 \uACC4\uC815",
    adminMenu: "\uAD00\uB9AC\uC790 \uBA54\uB274",
    profile: "\uB0B4 \uC815\uBCF4",
    logout: "\uB85C\uADF8\uC544\uC6C3",
    adminRole: "\uAD00\uB9AC\uC790",
    studentRole: "\uD559\uC0DD",
  });

  let authInitialized = false;

  function closeAccountMenu() {
    const menu = authLink.parentElement?.querySelector(".account-menu-popover");
    if (!menu) return;
    menu.hidden = true;
    authLink.setAttribute("aria-expanded", "false");
  }

  function setAuthLinkText(text) {
    const textNode = [...authLink.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (textNode) {
      textNode.textContent = text;
      return;
    }
    authLink.append(document.createTextNode(text));
  }

  function ensureAccountMenu() {
    let wrapper = authLink.closest(".account-menu");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "account-menu";
      authLink.parentNode.insertBefore(wrapper, authLink);
      wrapper.append(authLink);
    }

    let menu = wrapper.querySelector(".account-menu-popover");
    if (!menu) {
      menu = document.createElement("div");
      menu.className = "account-menu-popover";
      menu.id = authLink.getAttribute("aria-controls") || "header-account-menu";
      menu.hidden = true;
      menu.setAttribute("role", "menu");
      wrapper.append(menu);
    }

    authLink.setAttribute("aria-haspopup", "menu");
    authLink.setAttribute("aria-controls", menu.id);
    authLink.setAttribute("aria-expanded", "false");

    if (authLink.dataset.accountMenuBound !== "true") {
      authLink.dataset.accountMenuBound = "true";
      authLink.addEventListener("click", (event) => {
        if (authLink.dataset.accountMenu !== "enabled") return;
        event.preventDefault();
        const expanded = authLink.getAttribute("aria-expanded") === "true";
        menu.hidden = expanded;
        authLink.setAttribute("aria-expanded", String(!expanded));
      });

      document.addEventListener("click", (event) => {
        if (!wrapper.contains(event.target)) closeAccountMenu();
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeAccountMenu();
      });
    }

    return menu;
  }

  function createIcon(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("account-menu-icon");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("stroke-width", "1.9");

    const paths = {
      admin: ["M12 3l7 3v5c0 4.4-2.9 8.4-7 10-4.1-1.6-7-5.6-7-10V6l7-3z", "M9.5 12l1.8 1.8 3.7-4"],
      profile: ["M20 21a8 8 0 0 0-16 0", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
      logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
    }[name] || [];

    paths.forEach((pathData) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      svg.append(path);
    });
    return svg;
  }

  function createAccountMenuItem(element, iconName, text) {
    element.classList.add("account-menu-item");
    element.append(createIcon(iconName), document.createTextNode(text));
    element.setAttribute("role", "menuitem");
    return element;
  }

  function createMenuLink(href, text, iconName) {
    const link = document.createElement("a");
    link.href = href;
    return createAccountMenuItem(link, iconName, text);
  }

  function createAccountSummary(user, account) {
    const summary = document.createElement("div");
    const eyebrow = document.createElement("span");
    const email = document.createElement("strong");
    const badge = document.createElement("small");

    summary.className = "account-menu-summary";
    eyebrow.textContent = LABELS.loginAccount;
    email.textContent = user.email || LABELS.signedIn;
    badge.className = "account-menu-role-badge";
    badge.textContent = account?.isAdmin ? LABELS.adminRole : LABELS.studentRole;
    summary.append(eyebrow, email, badge);
    return summary;
  }

  function renderAccountMenu(user, account) {
    const menu = ensureAccountMenu();
    if (!menu) return;

    if (!user) {
      closeAccountMenu();
      authLink.dataset.accountMenu = "disabled";
      authLink.href = global.KANGNAM_ACCOUNT_ACCESS?.getLoginUrl() || "./login.html";
      setAuthLinkText(LABELS.login);
      menu.replaceChildren();
      return;
    }

    const isAdmin = Boolean(account?.isAdmin);
    authLink.dataset.accountMenu = "enabled";
    authLink.href = isAdmin ? "./admin.html" : "./profile.html";
    setAuthLinkText(LABELS.account);

    const summary = createAccountSummary(user, account);

    const menuItems = isAdmin
      ? [
          createMenuLink("./admin.html", LABELS.adminMenu, "admin"),
        ]
      : [
          createMenuLink("./profile.html", LABELS.profile, "profile"),
        ];

    const divider = document.createElement("div");
    divider.className = "account-menu-divider";
    divider.setAttribute("role", "separator");

    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.className = "account-menu-logout";
    createAccountMenuItem(logoutButton, "logout", LABELS.logout);
    logoutButton.addEventListener("click", async () => {
      const firebase = global.KANGNAM_FIREBASE;
      if (firebase) await firebase.signOut();
      closeAccountMenu();
      global.location.assign("./index.html");
    });

    menu.replaceChildren(summary, ...menuItems, divider, logoutButton);
  }

  function waitForFirebase() {
    if (global.KANGNAM_FIREBASE) return Promise.resolve(global.KANGNAM_FIREBASE);
    return new Promise((resolve) => {
      global.addEventListener("kangnam-firebase-ready", () => resolve(global.KANGNAM_FIREBASE), { once: true });
      global.setTimeout(() => resolve(global.KANGNAM_FIREBASE || null), 1200);
    });
  }

  async function initAuth() {
    if (authInitialized) return;
    authInitialized = true;
    ensureAccountMenu();

    const firebase = await waitForFirebase();
    if (!firebase?.onAuthStateChanged) {
      renderAccountMenu(null, null);
      return;
    }

    let updateId = 0;
    firebase.onAuthStateChanged(firebase.auth, async (user) => {
      const currentUpdateId = ++updateId;
      if (!user) {
        renderAccountMenu(null, null);
        return;
      }

      const account = await (global.KANGNAM_ACCOUNT_ACCESS?.resolveAccount(user)
        || Promise.resolve({ type: "student", role: "viewer", isAdmin: false }));
      if (currentUpdateId !== updateId) return;
      renderAccountMenu(user, account);
    });
  }

  initAuth();
})(window);
