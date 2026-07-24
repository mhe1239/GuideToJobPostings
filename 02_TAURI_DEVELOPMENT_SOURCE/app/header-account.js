"use strict";

(function initHeaderAccount(global) {
  const authLink = document.querySelector("#header-auth-link");
  if (!authLink) return;

  const LABELS = Object.freeze({
    login: "\uB85C\uADF8\uC778",
    account: "\uB0B4 \uACC4\uC815",
    signedIn: "\uB85C\uADF8\uC778\uB428",
    adminMenu: "\uAD00\uB9AC\uC790 \uBA54\uB274",
    noticeList: "\uACF5\uACE0 \uBAA9\uB85D",
    profile: "\uB0B4 \uC815\uBCF4",
    logout: "\uB85C\uADF8\uC544\uC6C3",
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

  function createMenuLink(href, text) {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = text;
    link.setAttribute("role", "menuitem");
    return link;
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

    const email = document.createElement("p");
    email.className = "account-menu-email";
    email.textContent = user.email || LABELS.signedIn;

    const menuItems = isAdmin
      ? [
          createMenuLink("./admin.html", LABELS.adminMenu),
        ]
      : [
          createMenuLink("./profile.html", LABELS.profile),
          createMenuLink("./index.html", LABELS.noticeList),
        ];

    const divider = document.createElement("div");
    divider.className = "account-menu-divider";
    divider.setAttribute("role", "separator");

    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.textContent = LABELS.logout;
    logoutButton.setAttribute("role", "menuitem");
    logoutButton.addEventListener("click", async () => {
      const firebase = global.KANGNAM_FIREBASE;
      if (firebase) await firebase.signOut();
      closeAccountMenu();
      global.location.assign("./index.html");
    });

    menu.replaceChildren(email, ...menuItems, divider, logoutButton);
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
