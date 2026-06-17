(function () {
  "use strict";

  const STORAGE_USERS = "swoop_users";
  const STORAGE_CURRENT = "swoop_current_user";
  const STORAGE_MESSAGES = "swoop_messages";
  const STORAGE_COMMUNITIES = "swoop_communities";

  let loginScreen, registerScreen, mainScreen;
  let loginForm, registerForm;
  let loginEmail, loginPassword, loginEmailError, loginPasswordError;
  let regFirstName, regLastName, regCity, regUniversity, regEmail, regPassword;
  let regFirstNameError,
    regLastNameError,
    regCityError,
    regUniversityError,
    regEmailError,
    regPasswordError;
  let goToRegisterBtn, goToLoginBtn, logoutBtn;
  let sidebarTabs, contentArea;
  let profileTab,
    friendsTab,
    communitiesTab,
    messengerTab,
    settingsTab,
    friendProfileTab,
    adminTab;
  let activeChatUserId = null;
  let editProfileModal, createCommunityModal;
  let pendingAvatarBase64 = null;

  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showAlert(message, type) {
    const existing = document.querySelector(".custom-alert");
    if (existing) existing.remove();
    const alertDiv = document.createElement("div");
    alertDiv.className = "custom-alert custom-alert--" + (type || "info");
    alertDiv.textContent = message;
    const style = document.createElement("style");
    style.textContent = `
      .custom-alert {
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        padding: 1rem 1.5rem; border-radius: 12px; font-weight: 600;
        font-size: 0.95rem; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        animation: slideInAlert 0.3s ease; max-width: 400px; color: white;
      }
      .custom-alert--info { background: #3b82f6; }
      .custom-alert--error { background: #ef4444; }
      .custom-alert--success { background: #16a34a; }
      @keyframes slideInAlert { from { opacity:0; transform:translateX(50px); } to { opacity:1; transform:translateX(0); } }
      @keyframes slideOutAlert { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(50px); } }
    `;
    document.head.appendChild(style);
    document.body.appendChild(alertDiv);
    setTimeout(() => {
      alertDiv.style.animation = "slideOutAlert 0.3s ease forwards";
      setTimeout(() => {
        if (alertDiv.parentNode) alertDiv.remove();
        if (style.parentNode) style.remove();
      }, 300);
    }, 3000);
  }

  function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_USERS) || "{}");
  }
  function saveUsers(users) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
  }
  function getCurrentUserEmail() {
    return localStorage.getItem(STORAGE_CURRENT);
  }
  function setCurrentUserEmail(email) {
    localStorage.setItem(STORAGE_CURRENT, email);
  }
  function clearCurrentUserEmail() {
    localStorage.removeItem(STORAGE_CURRENT);
  }
  function getCurrentUser() {
    const email = getCurrentUserEmail();
    if (!email) return null;
    return getUsers()[email] || null;
  }
  function saveCurrentUser(user) {
    const email = getCurrentUserEmail();
    if (!email || !user) return;
    const users = getUsers();
    users[email] = user;
    saveUsers(users);
  }

  function getMessages() {
    return JSON.parse(localStorage.getItem(STORAGE_MESSAGES) || "[]");
  }
  function saveMessages(messages) {
    localStorage.setItem(STORAGE_MESSAGES, JSON.stringify(messages));
  }
  function getCommunities() {
    return JSON.parse(localStorage.getItem(STORAGE_COMMUNITIES) || "{}");
  }
  function saveCommunities(communities) {
    localStorage.setItem(STORAGE_COMMUNITIES, JSON.stringify(communities));
  }

  function initializeData() {
    if (!localStorage.getItem(STORAGE_USERS)) {
      const defaultUsers = {
        "test@mail.ru": {
          id: "1",
          email: "test@mail.ru",
          password: "123",
          firstName: "Юрий",
          lastName: "Саркисян",
          city: "Саратов",
          university: "СГТУ",
          phone: "+7 (999) 123-45-67",
          status: "Открыт к общению",
          interests: "Программирование, Веб-разработка, БЭМ, SCSS",
          avatar: "",
          role: "user",
          isBlocked: false,
          privacy: {
            posts: "all",
            friendsRequest: "all",
            viewEmail: "all",
            viewFriends: "all",
          },
          friends: [
            {
              id: "friend1",
              name: "Ольга Смирнова",
              avatar: "👩‍🦰",
              city: "Москва",
              university: "МГУ",
              posts: [
                {
                  id: "p_f1_1",
                  author: "Ольга Смирнова",
                  avatar: "ОС",
                  text: "Обожаю дизайн интерфейсов!",
                  date: "2 дня назад",
                  likes: 15,
                  liked: false,
                  comments: [],
                },
              ],
            },
            {
              id: "friend2",
              name: "Дмитрий Козлов",
              avatar: "🧔",
              city: "Санкт-Петербург",
              university: "Политех",
              posts: [],
            },
            {
              id: "friend3",
              name: "Анна Белова",
              avatar: "👩🏻",
              city: "Казань",
              university: "КФУ",
              posts: [],
            },
          ],
          communities: ["comm1", "comm2", "comm3"],
          posts: [
            {
              id: "p1",
              author: "Юрий Саркисян",
              avatar: "ЮС",
              text: "Привет, Swoop! Это мой первый пост.",
              date: "5 минут назад",
              likes: 24,
              liked: false,
              comments: [{ author: "Юрий", text: "Тестовый комментарий" }],
            },
            {
              id: "p2",
              author: "Ольга Смирнова",
              avatar: "ОС",
              text: "Новый дизайн-проект готов!",
              date: "1 час назад",
              likes: 47,
              liked: false,
              comments: [],
            },
          ],
          settings: {
            hideProfile: false,
            twoFactorAuth: true,
            showOnlineStatus: true,
            pushNotifications: true,
            emailNewsletter: false,
            messageSounds: true,
            birthdayNotifications: true,
          },
        },
        "admin@mail.ru": {
          id: "999",
          email: "admin@mail.ru",
          password: "admin",
          firstName: "Администратор",
          lastName: "Swoop",
          avatar: "https://cdn-icons-png.flaticon.com/512/2206/2206368.png",
          role: "admin",
          isBlocked: false,
          privacy: {
            posts: "all",
            friendsRequest: "all",
            viewEmail: "all",
            viewFriends: "all",
          },
          friends: [],
          communities: [],
          posts: [],
          settings: {
            hideProfile: false,
            twoFactorAuth: true,
            showOnlineStatus: true,
            pushNotifications: true,
            emailNewsletter: false,
            messageSounds: true,
            birthdayNotifications: true,
          },
        },
      };
      localStorage.setItem(STORAGE_USERS, JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem(STORAGE_COMMUNITIES)) {
      const communities = {
        comm1: {
          id: "comm1",
          name: "Стартап-тусовка",
          description: "Обсуждаем идеи, питчи и ищем инвесторов.",
          members: 142,
          creatorId: "1",
        },
        comm2: {
          id: "comm2",
          name: "Дизайн и UX",
          description: "Figma, исследования, портфолио.",
          members: 89,
          creatorId: "friend1",
        },
        comm3: {
          id: "comm3",
          name: "Киберспорт Swoop",
          description: "Турниры, команды, стримы.",
          members: 356,
          creatorId: "1",
        },
      };
      localStorage.setItem(STORAGE_COMMUNITIES, JSON.stringify(communities));
    }

    if (!localStorage.getItem(STORAGE_MESSAGES)) {
      const messages = [
        {
          id: "m1",
          from: "test@mail.ru",
          to: "friend1",
          text: "Привет, Оля! Как дела?",
          timestamp: Date.now() - 3600000,
        },
        {
          id: "m2",
          from: "friend1",
          to: "test@mail.ru",
          text: "Привет, Юра! Всё отлично.",
          timestamp: Date.now() - 3500000,
        },
        {
          id: "m3",
          from: "test@mail.ru",
          to: "friend1",
          text: "Отлично, давай встретимся!",
          timestamp: Date.now() - 3400000,
        },
      ];
      localStorage.setItem(STORAGE_MESSAGES, JSON.stringify(messages));
    }
  }

  function showScreen(screen) {
    loginScreen.classList.add("hidden");
    registerScreen.classList.add("hidden");
    mainScreen.classList.add("hidden");
    screen.classList.remove("hidden");
  }

  function showLoginScreen() {
    loginForm.reset();
    clearLoginErrors();
    showScreen(loginScreen);
  }
  function showRegisterScreen() {
    registerForm.reset();
    clearRegisterErrors();
    showScreen(registerScreen);
  }

  function showMainScreen() {
    if (!getCurrentUser()) {
      showLoginScreen();
      return;
    }
    showScreen(mainScreen);
    stylizeLogoutButton();
    updateAdminMenu();
    switchTab("profile");
  }

  function stylizeLogoutButton() {
    if (!logoutBtn) return;
    logoutBtn.innerHTML = "Выйти из аккаунта";
    logoutBtn.className = "btn btn--logout sidebar__logout";
  }

  function clearLoginErrors() {
    loginEmailError.textContent = "";
    loginPasswordError.textContent = "";
  }
  function clearRegisterErrors() {
    regFirstNameError.textContent = "";
    regLastNameError.textContent = "";
    regCityError.textContent = "";
    regUniversityError.textContent = "";
    regEmailError.textContent = "";
    regPasswordError.textContent = "";
  }

  function validateLoginForm() {
    clearLoginErrors();
    let valid = true;
    if (!loginEmail.value.trim()) {
      loginEmailError.textContent = "Введите email";
      valid = false;
    } else if (!loginEmail.value.includes("@")) {
      loginEmailError.textContent = "Некорректный email";
      valid = false;
    }
    if (!loginPassword.value.trim()) {
      loginPasswordError.textContent = "Введите пароль";
      valid = false;
    }
    return valid;
  }

  function validateRegisterForm() {
    clearRegisterErrors();
    let valid = true;
    const fields = [
      { el: regFirstName, err: regFirstNameError, msg: "Введите имя" },
      { el: regLastName, err: regLastNameError, msg: "Введите фамилию" },
      { el: regCity, err: regCityError, msg: "Введите город" },
      {
        el: regUniversity,
        err: regUniversityError,
        msg: "Введите учебное заведение",
      },
      { el: regEmail, err: regEmailError, msg: "Введите email" },
      {
        el: regPassword,
        err: regPasswordError,
        msg: "Введите пароль (мин. 3 символа)",
      },
    ];
    fields.forEach((f) => {
      if (!f.el.value.trim()) {
        f.err.textContent = f.msg;
        valid = false;
      }
    });
    if (valid && !regEmail.value.includes("@")) {
      regEmailError.textContent = "Некорректный email";
      valid = false;
    }
    if (valid && regPassword.value.trim().length < 3) {
      regPasswordError.textContent = "Пароль должен быть не менее 3 символов";
      valid = false;
    }
    return valid;
  }

  function login() {
    if (!validateLoginForm()) return;
    const email = loginEmail.value.trim().toLowerCase();
    const user = getUsers()[email];
    if (!user) {
      showAlert("Пользователь не найден", "error");
      return;
    }
    if (user.isBlocked) {
      showAlert("Ваш аккаунт заблокирован администратором!", "error");
      return;
    }
    if (user.password !== loginPassword.value.trim()) {
      showAlert("Неверный пароль", "error");
      return;
    }
    setCurrentUserEmail(email);
    loginForm.reset();
    clearLoginErrors();
    showMainScreen();
    showAlert("Добро пожаловать, " + user.firstName + "!", "success");
  }

  function register() {
    if (!validateRegisterForm()) return;
    const email = regEmail.value.trim().toLowerCase();
    if (getUsers()[email]) {
      showAlert("Пользователь уже существует", "error");
      return;
    }
    const newUser = {
      id: Date.now().toString(),
      email,
      password: regPassword.value.trim(),
      firstName: regFirstName.value.trim(),
      lastName: regLastName.value.trim(),
      city: regCity.value.trim(),
      university: regUniversity.value.trim(),
      phone: "",
      status: "Открыт к общению",
      interests: "Новые знакомства",
      avatar: "",
      role: "user",
      isBlocked: false,
      privacy: {
        posts: "all",
        friendsRequest: "all",
        viewEmail: "all",
        viewFriends: "all",
      },
      friends: [],
      communities: [],
      posts: [],
      settings: {
        hideProfile: false,
        twoFactorAuth: true,
        showOnlineStatus: true,
        pushNotifications: true,
        emailNewsletter: false,
        messageSounds: true,
        birthdayNotifications: true,
      },
    };
    const users = getUsers();
    users[email] = newUser;
    saveUsers(users);
    setCurrentUserEmail(email);
    registerForm.reset();
    clearRegisterErrors();
    showMainScreen();
    showAlert("Регистрация успешна!", "success");
  }

  function switchTab(tabName, extraParams = null) {
    profileTab.classList.add("hidden");
    friendsTab.classList.add("hidden");
    communitiesTab.classList.add("hidden");
    messengerTab.classList.add("hidden");
    settingsTab.classList.add("hidden");
    friendProfileTab.classList.add("hidden");
    if (adminTab) adminTab.classList.add("hidden");
    sidebarTabs.forEach((btn) => btn.classList.remove("sidebar__tab--active"));

    if (tabName === "friendProfile" && extraParams && extraParams.userId) {
      friendProfileTab.classList.remove("hidden");
      const btn = document.querySelector('.sidebar__tab[data-tab="friends"]');
      if (btn) btn.classList.add("sidebar__tab--active");
      renderFriendProfile(extraParams.userId);
      return;
    }
    if (
      tabName === "communityProfile" &&
      extraParams &&
      extraParams.communityId
    ) {
      communitiesTab.classList.remove("hidden");
      const btn = document.querySelector(
        '.sidebar__tab[data-tab="communities"]',
      );
      if (btn) btn.classList.add("sidebar__tab--active");
      renderCommunityProfile(extraParams.communityId);
      return;
    }

    const tabMap = {
      profile: profileTab,
      friends: friendsTab,
      communities: communitiesTab,
      messenger: messengerTab,
      settings: settingsTab,
      admin: adminTab,
    };
    if (tabMap[tabName]) {
      tabMap[tabName].classList.remove("hidden");
      const activeBtn = document.querySelector(
        '.sidebar__tab[data-tab="' + tabName + '"]',
      );
      if (activeBtn) activeBtn.classList.add("sidebar__tab--active");
      switch (tabName) {
        case "profile":
          renderMyProfile();
          break;
        case "friends":
          renderFriendsTab();
          break;
        case "communities":
          renderCommunitiesTab();
          break;
        case "messenger":
          renderMessengerTab();
          break;
        case "settings":
          renderSettingsTab();
          break;
        case "admin":
          renderAdminTab();
          break;
      }
    }
  }

  function renderMyProfile() {
    const user = getCurrentUser();
    if (!user) return;
    const initials = (
      user.firstName.charAt(0) + user.lastName.charAt(0)
    ).toUpperCase();
    const interestsArray = user.interests
      ? user.interests
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const avatarHTML = user.avatar
      ? `<img src="${escapeHtml(user.avatar)}" alt="Аватар" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">`
      : initials;
    profileTab.innerHTML = `
      <h2 class="tab__title">Мой профиль</h2>
      <div class="profile-card">
        <div class="profile-card__header">
          <div class="profile-card__avatar" id="my-profile-avatar">${avatarHTML}</div>
          <div class="profile-card__info">
            <h3 class="profile-card__name">${escapeHtml(user.firstName)} ${escapeHtml(user.lastName)}</h3>
            <span class="profile-card__status">${escapeHtml(user.status)}</span>
          </div>
          <button id="open-edit-modal-btn" class="profile-card__edit-btn btn btn--outline">✏️ Редактировать</button>
        </div>
        <div class="profile-card__details">
          <div class="profile-card__detail"><span>🏙️</span> Город: ${escapeHtml(user.city)}</div>
          <div class="profile-card__detail"><span>🎓</span> ВУЗ: ${escapeHtml(user.university)}</div>
          <div class="profile-card__detail"><span>✉️</span> ${escapeHtml(user.email)}</div>
          <div class="profile-card__detail"><span>📞</span> ${escapeHtml(user.phone || "Не указан")}</div>
        </div>
        <div class="profile-card__interests">
          <h4>Интересы</h4>
          <div class="profile-card__tags" id="interests-container">
            ${interestsArray.map((tag) => `<span class="interest-tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </div>
      </div>
      <div class="wall">
        <h3 class="wall__title">Стена</h3>
        <div class="wall__form">
          <textarea class="wall__textarea" id="postTextarea" placeholder="Что у вас нового?" rows="3"></textarea>
          <div class="wall__media-preview" id="postMediaPreview"></div>
          <div class="wall__form-actions">
            <div class="wall__form-buttons">
              <button type="button" id="uploadImageBtn" class="btn btn--outline wall__media-btn">📷 Фото</button>
              <button type="button" id="uploadVideoBtn" class="btn btn--outline wall__media-btn">🎥 Видео</button>
              <input type="file" id="post-file-image" accept="image/*" class="hidden">
              <input type="file" id="post-file-video" accept="video/*" class="hidden">
            </div>
            <button id="submitPostBtn" class="btn btn--primary">Опубликовать</button>
          </div>
        </div>
        <div class="wall__posts" id="postsList">${renderPostsHTML(user.posts || [], true)}</div>
      </div>
    `;
    document
      .getElementById("open-edit-modal-btn")
      .addEventListener("click", openEditProfileModal);
    document.getElementById("submitPostBtn").addEventListener("click", addPost);
    document
      .getElementById("uploadImageBtn")
      .addEventListener("click", () =>
        document.getElementById("post-file-image").click(),
      );
    document
      .getElementById("uploadVideoBtn")
      .addEventListener("click", () =>
        document.getElementById("post-file-video").click(),
      );

    const imageInput = document.getElementById("post-file-image");
    if (imageInput) {
      imageInput.addEventListener("change", function (e) {
        const file = e.target.files[0];
        const preview = document.getElementById("postMediaPreview");
        if (preview) {
          preview.innerHTML = "";
          if (file) {
            const reader = new FileReader();
            reader.onload = function (ev) {
              preview.innerHTML = `<img src="${ev.target.result}" style="max-width: 150px; border-radius: 8px; margin-top: 10px; display: block;">`;
            };
            reader.readAsDataURL(file);
          }
        }
      });
    }

    attachPostEvents();
  }

  function renderPostsHTML(posts, isOwner = false) {
    if (!posts || posts.length === 0) {
      return '<p style="color: #64748b; text-align: center; padding: 2rem;">Пока нет публикаций. Будьте первым!</p>';
    }
    const currentUser = getCurrentUser();
    const currentUserName = currentUser
      ? currentUser.firstName + " " + currentUser.lastName
      : "";
    const currentUserFirstName = currentUser ? currentUser.firstName : "";
    const isAdmin = currentUser && currentUser.role === "admin";
    return posts
      .map((post) => {
        const isMyPost = isOwner && post.author === currentUserName;
        const showDelete = isMyPost || isAdmin;
        const deleteBtnHTML = showDelete
          ? `<button class="btn btn--danger post__delete-btn" style="margin-left:auto; padding: 0.3rem 0.75rem; font-size: 0.8rem;">${isAdmin && !isMyPost ? "Удалить (Модерация)" : "🗑 Удалить"}</button>`
          : "";
        let mediaHTML = "";
        if (post.image) {
          mediaHTML = `<div class="post__content"><img src="${escapeHtml(post.image)}" class="post__img" alt="Изображение"></div>`;
        } else if (post.video) {
          mediaHTML = `<div class="post__content"><video src="${escapeHtml(post.video)}" controls class="post__video"></video></div>`;
        }
        return `
        <article class="post" data-post-id="${post.id}">
          <div class="post__header">
            <div class="post__avatar">${escapeHtml(post.avatar)}</div>
            <div class="post__author-info">
              <span class="post__author-name">${escapeHtml(post.author)}</span>
              <span class="post__date">${escapeHtml(post.date)}</span>
            </div>
            ${deleteBtnHTML}
          </div>
          <p class="post__text">${escapeHtml(post.text)}</p>
          ${mediaHTML}
          <div class="post__actions">
            <button class="btn--like post__like-btn ${post.liked ? "post__action-btn--liked" : ""}">
              <span class="post__action-icon">❤️</span>
              <span class="post__action-count">${post.likes}</span>
            </button>
            <button class="btn--comment post__comment-toggle-btn">
              <span class="post__action-icon">💬</span>
              <span class="post__action-label">Комментировать</span>
            </button>
          </div>
          <div class="post__comment-form hidden">
            <input type="text" class="post__comment-input" placeholder="Напишите комментарий...">
            <button class="btn btn--primary post__comment-submit-btn">Отправить</button>
          </div>
          <div class="post__comments" style="margin-top: 0.75rem;">
            ${(post.comments || [])
              .map(
                (c, idx) => `
              <div class="post__comment" data-comment-index="${idx}" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
                <span><strong>${escapeHtml(c.author)}:</strong> ${escapeHtml(c.text)}</span>
                ${c.author === currentUserFirstName || isMyPost || isAdmin ? `<button class="comment__delete-btn" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.85rem; padding: 0 0.25rem;" title="Удалить комментарий">✕</button>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        </article>
      `;
      })
      .join("");
  }

  function attachPostEvents() {
    document.querySelectorAll(".post__like-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const postId = e.currentTarget.closest(".post").dataset.postId;
        toggleLike(postId);
      });
    });
    document.querySelectorAll(".post__comment-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const post = e.currentTarget.closest(".post");
        const form = post.querySelector(".post__comment-form");
        if (form) form.classList.toggle("hidden");
      });
    });
    document.querySelectorAll(".post__comment-submit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const post = e.currentTarget.closest(".post");
        const postId = post.dataset.postId;
        const input = post.querySelector(".post__comment-input");
        if (input && input.value.trim()) {
          addComment(postId, input.value.trim());
          input.value = "";
        }
      });
    });
    document.querySelectorAll(".post__delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const postId = e.currentTarget.closest(".post").dataset.postId;
        deletePost(postId);
      });
    });
    document.querySelectorAll(".comment__delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const postElement = e.currentTarget.closest(".post");
        const postId = postElement.dataset.postId;
        const commentElement = e.currentTarget.closest(".post__comment");
        const commentIndex = parseInt(commentElement.dataset.commentIndex);
        deleteComment(postId, commentIndex);
      });
    });
  }

  function addPost() {
    const user = getCurrentUser();
    const textarea = document.getElementById("postTextarea");
    if (!textarea || !textarea.value.trim()) return;
    const imageFile = document.getElementById("post-file-image").files[0];
    const videoFile = document.getElementById("post-file-video").files[0];
    const newPost = {
      id: "p_" + Date.now(),
      author: user.firstName + " " + user.lastName,
      avatar: (
        user.firstName.charAt(0) + user.lastName.charAt(0)
      ).toUpperCase(),
      text: textarea.value.trim(),
      date: "Только что",
      likes: 0,
      liked: false,
      comments: [],
    };
    const processMedia = (file, typeKey) => {
      return new Promise((resolve) => {
        if (!file) {
          resolve();
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          newPost[typeKey] = e.target.result;
          resolve();
        };
        reader.readAsDataURL(file);
      });
    };
    Promise.all([
      processMedia(imageFile, "image"),
      processMedia(videoFile, "video"),
    ]).then(() => {
      user.posts.unshift(newPost);
      saveCurrentUser(user);
      document.getElementById("post-file-image").value = "";
      document.getElementById("post-file-video").value = "";
      const preview = document.getElementById("postMediaPreview");
      if (preview) preview.innerHTML = "";
      renderMyProfile();
      showAlert("Пост опубликован", "success");
    });
  }

  function deletePost(postId) {
    const user = getCurrentUser();
    if (user.role === "admin") {
      const allUsers = getUsers();
      for (let email in allUsers) {
        const u = allUsers[email];
        if (u.posts && u.posts.find((p) => p.id === postId)) {
          u.posts = u.posts.filter((p) => p.id !== postId);
          saveUsers(allUsers);
          if (email === user.email) {
            user.posts = u.posts;
          }
          break;
        }
      }
    } else {
      user.posts = user.posts.filter((p) => p.id !== postId);
      saveCurrentUser(user);
    }
    const activeTab = document.querySelector(".tab:not(.hidden)");
    if (activeTab) {
      if (activeTab.id === "profileTab") renderMyProfile();
      else if (activeTab.id === "friendProfileTab") {
        const userId = activeTab.dataset.userId;
        if (userId) renderFriendProfile(userId);
      } else if (activeTab.id === "adminTab") renderAdminTab();
    } else {
      renderMyProfile();
    }
    showAlert("Пост удалён", "info");
  }

  function deleteComment(postId, commentIndex) {
    const user = getCurrentUser();
    const post = (user.posts || []).find((p) => p.id === postId);
    if (post && post.comments && post.comments[commentIndex] !== undefined) {
      post.comments.splice(commentIndex, 1);
      saveCurrentUser(user);
      renderMyProfile();
      showAlert("Комментарий удалён", "info");
    }
  }

  function toggleLike(postId) {
    const user = getCurrentUser();
    const post = (user.posts || []).find((p) => p.id === postId);
    if (post) {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
      saveCurrentUser(user);
      renderMyProfile();
    }
  }

  function addComment(postId, text) {
    const user = getCurrentUser();
    const post = (user.posts || []).find((p) => p.id === postId);
    if (post) {
      post.comments.push({ author: user.firstName, text });
      saveCurrentUser(user);
      renderMyProfile();
    }
  }

  function openEditProfileModal() {
    const user = getCurrentUser();
    if (!user) return;
    document.getElementById("editFirstName").value = user.firstName;
    document.getElementById("editLastName").value = user.lastName;
    document.getElementById("editCity").value = user.city;
    document.getElementById("editUniversity").value = user.university;
    document.getElementById("editInterests").value = user.interests || "";
    pendingAvatarBase64 = null;

    let avatarInput = document.getElementById("edit-avatar-input");
    if (!avatarInput) {
      const modalContent = document.querySelector(
        "#editProfileModal .modal-content",
      );
      if (modalContent) {
        const field = document.createElement("div");
        field.className = "modal-field";
        field.innerHTML =
          '<label for="edit-avatar-input">Аватар</label><input type="file" id="edit-avatar-input" accept="image/*" class="modal-input">';
        modalContent.insertBefore(
          field,
          modalContent.querySelector(".modal-actions"),
        );
      }
    }
    avatarInput = document.getElementById("edit-avatar-input");
    if (avatarInput) {
      avatarInput.value = "";
      avatarInput.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (ev) {
          pendingAvatarBase64 = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    editProfileModal.classList.remove("hidden");
  }

  function closeEditProfileModal() {
    editProfileModal.classList.add("hidden");
  }

  function saveProfileChanges() {
    const user = getCurrentUser();
    user.firstName =
      document.getElementById("editFirstName").value.trim() || user.firstName;
    user.lastName =
      document.getElementById("editLastName").value.trim() || user.lastName;
    user.city = document.getElementById("editCity").value.trim() || user.city;
    user.university =
      document.getElementById("editUniversity").value.trim() || user.university;
    user.interests =
      document.getElementById("editInterests").value.trim() || user.interests;
    if (pendingAvatarBase64) {
      user.avatar = pendingAvatarBase64;
    }
    saveCurrentUser(user);
    closeEditProfileModal();
    renderMyProfile();
    showAlert("Профиль обновлён", "success");
  }

  function openCreateCommunityModal() {
    createCommunityModal.classList.remove("hidden");
  }
  function closeCreateCommunityModal() {
    createCommunityModal.classList.add("hidden");
  }

  function createCommunitySubmit() {
    const name = document.getElementById("communityName").value.trim();
    const description = document
      .getElementById("communityDescription")
      .value.trim();
    if (!name) {
      showAlert("Введите название", "error");
      return;
    }
    const communities = getCommunities();
    const newId = "comm_" + Date.now();
    const newCommunity = {
      id: newId,
      name,
      description,
      members: 1,
      creatorId: getCurrentUser().id,
    };
    communities[newId] = newCommunity;
    saveCommunities(communities);
    const user = getCurrentUser();
    user.communities = user.communities || [];
    user.communities.push(newId);
    saveCurrentUser(user);
    closeCreateCommunityModal();
    document.getElementById("communityName").value = "";
    document.getElementById("communityDescription").value = "";
    renderCommunitiesTab();
    showAlert("Сообщество создано!", "success");
  }

  function renderFriendsTab() {
    const user = getCurrentUser();
    const friends = user.friends || [];
    const recommendations = [
      {
        id: "rec1",
        name: "Екатерина Волкова",
        avatar: "👩‍💻",
        city: "Новосибирск",
        university: "НГУ",
      },
      {
        id: "rec2",
        name: "Алексей Новиков",
        avatar: "🧑‍🔬",
        city: "Екатеринбург",
        university: "УрФУ",
      },
      {
        id: "rec3",
        name: "Мария Соколова",
        avatar: "👩‍🎨",
        city: "Краснодар",
        university: "КубГУ",
      },
    ];
    friendsTab.innerHTML = `
      <h2 class="tab__title">Друзья</h2>
      <div class="friends-search">
        <input type="text" id="friendSearchInput" class="friends-search__input" placeholder="Поиск друзей...">
      </div>
      <div class="friends-section">
        <h3>Рекомендации</h3>
        <div class="grid">${recommendations
          .map(
            (r) => `
          <div class="friend-card" data-user-id="${r.id}">
            <div class="friend-card__avatar">${r.avatar}</div>
            <div class="friend-card__name">${r.name}</div>
            <div class="friend-card__mutual">Общий друг</div>
            <button class="btn btn--primary add-friend-btn">Добавить</button>
          </div>`,
          )
          .join("")}</div>
      </div>
      <div class="friends-section">
        <h3>Мои друзья (<span id="friendsCount">${friends.length}</span>)</h3>
        <div class="grid" id="friendsGrid">${friends
          .map(
            (f) => `
          <div class="friend-card" data-user-id="${f.id}">
            <div class="friend-card__avatar">${f.avatar}</div>
            <div class="friend-card__name" style="cursor:pointer;">${f.name}</div>
            <div class="friend-card__mutual">Друг</div>
            <button class="btn btn--danger remove-friend-btn">Удалить</button>
          </div>`,
          )
          .join("")}</div>
      </div>
    `;
    document
      .getElementById("friendSearchInput")
      .addEventListener("input", function (e) {
        const query = e.target.value.toLowerCase().trim();
        const cards = document.querySelectorAll("#friendsGrid .friend-card");
        let visibleCount = 0;
        cards.forEach((card) => {
          const name = card
            .querySelector(".friend-card__name")
            .textContent.toLowerCase();
          if (query === "" || name.includes(query)) {
            card.style.display = "";
            visibleCount++;
          } else {
            card.style.display = "none";
          }
        });
        document.getElementById("friendsCount").textContent = visibleCount;
      });
    document.querySelectorAll(".add-friend-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const userId = e.target.closest(".friend-card").dataset.userId;
        addFriend(userId);
      });
    });
    document.querySelectorAll(".remove-friend-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const userId = e.target.closest(".friend-card").dataset.userId;
        removeFriend(userId);
      });
    });
    document.querySelectorAll(".friend-card__name").forEach((nameEl) => {
      nameEl.addEventListener("click", (e) => {
        const userId = e.target.closest(".friend-card").dataset.userId;
        viewUserProfile(userId);
      });
    });
  }

  function addFriend(userId) {
    const user = getCurrentUser();
    const recs = [
      {
        id: "rec1",
        name: "Екатерина Волкова",
        avatar: "👩‍💻",
        city: "Новосибирск",
        university: "НГУ",
      },
      {
        id: "rec2",
        name: "Алексей Новиков",
        avatar: "🧑‍🔬",
        city: "Екатеринбург",
        university: "УрФУ",
      },
      {
        id: "rec3",
        name: "Мария Соколова",
        avatar: "👩‍🎨",
        city: "Краснодар",
        university: "КубГУ",
      },
    ];
    const friendData = recs.find((r) => r.id === userId);
    if (!friendData) return;
    if (user.friends.some((f) => f.id === userId)) {
      showAlert("Уже в друзьях", "info");
      return;
    }
    user.friends.push({
      id: userId,
      name: friendData.name,
      avatar: friendData.avatar,
      city: friendData.city,
      university: friendData.university,
      posts: [],
    });
    saveCurrentUser(user);
    renderFriendsTab();
    showAlert("Друг добавлен!", "success");
  }

  function removeFriend(userId) {
    const user = getCurrentUser();
    user.friends = user.friends.filter((f) => f.id !== userId);
    saveCurrentUser(user);
    renderFriendsTab();
    showAlert("Друг удалён", "info");
  }

  function viewUserProfile(userId) {
    switchTab("friendProfile", { userId });
  }

  function renderFriendProfile(userId) {
    const currentUser = getCurrentUser();
    const friend = currentUser.friends.find((f) => f.id === userId) || {};
    const allUsers = getUsers();
    const friendUser = allUsers[friend.id];
    const privacy = friendUser ? friendUser.privacy || {} : {};

    let emailDisplay = "";
    if (friendUser) {
      const viewEmail = privacy.viewEmail || "all";
      if (viewEmail === "me") {
        emailDisplay =
          '<div class="profile-card__detail"><span>✉️</span> [Скрыто настройками приватности]</div>';
      } else {
        emailDisplay = `<div class="profile-card__detail"><span>✉️</span> ${escapeHtml(friendUser.email)}</div>`;
      }
    }

    let postsToShow = friend.posts || [];
    if (
      friendUser &&
      privacy.posts === "me" &&
      friendUser.id !== currentUser.id
    ) {
      postsToShow = [];
    }

    friendProfileTab.innerHTML = `
      <button class="btn btn--outline" id="back-to-friends-btn" style="margin-bottom:1rem;">← Назад к друзьям</button>
      <div class="profile-card">
        <div class="profile-card__header">
          <div class="profile-card__avatar" id="view-friend-avatar">${friend.avatar || "👤"}</div>
          <div class="profile-card__info">
            <h3>${escapeHtml(friend.name || "Неизвестный")}</h3>
            <span class="profile-card__status">Не в сети</span>
          </div>
        </div>
        <div class="profile-card__details">
          <div class="profile-card__detail"><span>🏙️</span> Город: ${escapeHtml(friend.city || "—")}</div>
          <div class="profile-card__detail"><span>🎓</span> ВУЗ: ${escapeHtml(friend.university || "—")}</div>
          ${emailDisplay}
        </div>
      </div>
      <div class="wall" id="friend-wall">
        <h3>Стена</h3>
        <div class="wall__posts">${postsToShow.length ? renderPostsHTML(postsToShow, false) : '<p style="color: #64748b; text-align: center; padding: 2rem;">Публикации скрыты</p>'}</div>
      </div>
    `;
    document
      .getElementById("back-to-friends-btn")
      .addEventListener("click", () => switchTab("friends"));
  }

  function renderCommunitiesTab() {
    const user = getCurrentUser();
    const communities = getCommunities();
    const allComms = Object.values(communities);
    const userComms = user.communities || [];
    communitiesTab.innerHTML = `
      <h2 class="tab__title">Сообщества</h2>
      <button id="open-create-group-btn" class="btn btn--create">Создать сообщество</button>
      <div class="grid" style="margin-top:1.5rem;" id="communitiesGrid">
        ${allComms
          .map((comm) => {
            const isMember = userComms.includes(comm.id);
            const isCreator = comm.creatorId === user.id;
            let btnHTML = "";
            if (isCreator) {
              btnHTML = `<button class="btn btn--danger delete-community-btn" data-community-id="${comm.id}">Удалить</button>`;
            } else {
              btnHTML = `<button class="btn ${isMember ? "btn--outline" : "btn--primary"} toggle-community-btn" data-community-id="${comm.id}">${isMember ? "Покинуть" : "Вступить"}</button>`;
            }
            return `
            <div class="community-card" data-community-id="${comm.id}">
              <div class="community-card__header">
                <div class="community-card__icon">🌐</div>
                <h3 class="community-card__name">${escapeHtml(comm.name)}</h3>
              </div>
              <p class="community-card__description">${escapeHtml(comm.description)}</p>
              <div class="community-card__meta">
                <span class="community-card__members">👥 ${comm.members} участников</span>
              </div>
              ${btnHTML}
            </div>
          `;
          })
          .join("")}
      </div>
    `;
    document
      .getElementById("open-create-group-btn")
      .addEventListener("click", openCreateCommunityModal);
    document.querySelectorAll(".delete-community-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteCommunity(e.target.dataset.communityId);
      });
    });
    document.querySelectorAll(".toggle-community-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleCommunityMembership(e.target.dataset.communityId);
      });
    });
    document.querySelectorAll(".community-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (!e.target.classList.contains("btn")) {
          switchTab("communityProfile", {
            communityId: card.dataset.communityId,
          });
        }
      });
    });
  }

  function toggleCommunityMembership(commId) {
    const user = getCurrentUser();
    const communities = getCommunities();
    if (!user.communities) user.communities = [];
    const idx = user.communities.indexOf(commId);
    if (idx >= 0) {
      user.communities.splice(idx, 1);
      if (communities[commId])
        communities[commId].members = Math.max(
          0,
          communities[commId].members - 1,
        );
    } else {
      user.communities.push(commId);
      if (communities[commId]) communities[commId].members += 1;
    }
    saveCurrentUser(user);
    saveCommunities(communities);
    renderCommunitiesTab();
  }

  function deleteCommunity(commId) {
    const user = getCurrentUser();
    const communities = getCommunities();
    const comm = communities[commId];
    if (!comm) {
      showAlert("Сообщество не найдено", "error");
      return;
    }
    if (comm.creatorId !== user.id) {
      showAlert("Вы не можете удалить чужое сообщество", "error");
      return;
    }
    delete communities[commId];
    saveCommunities(communities);
    user.communities = user.communities.filter((id) => id !== commId);
    saveCurrentUser(user);
    renderCommunitiesTab();
    showAlert("Сообщество удалено", "info");
  }

  function renderCommunityProfile(communityId) {
    const comm = getCommunities()[communityId];
    if (!comm) {
      communitiesTab.innerHTML = "<p>Сообщество не найдено.</p>";
      return;
    }
    communitiesTab.innerHTML = `
      <button class="btn btn--outline" id="back-to-communities-btn">← Назад к сообществам</button>
      <div class="profile-card" style="margin-top:1rem;">
        <h2>${escapeHtml(comm.name)}</h2>
        <p>${escapeHtml(comm.description)}</p>
        <p>👥 Участников: ${comm.members}</p>
        <p>Создатель: ${comm.creatorId === getCurrentUser().id ? "Вы" : "Другой пользователь"}</p>
      </div>
    `;
    document
      .getElementById("back-to-communities-btn")
      .addEventListener("click", () => switchTab("communities"));
  }

  function renderMessengerTab() {
    const user = getCurrentUser();
    const friends = user.friends || [];
    const messages = getMessages();
    messengerTab.innerHTML = `
      <div class="messenger">
        <aside class="messenger__sidebar">
          <div class="messenger__search"><input class="messenger__search-input" placeholder="Поиск диалогов..."></div>
          <ul class="messenger__dialogs" id="dialogsList">
            ${friends
              .map((f) => {
                const msgs = messages.filter(
                  (m) =>
                    (m.from === user.email && m.to === f.id) ||
                    (m.from === f.id && m.to === user.email),
                );
                const last = msgs.sort((a, b) => b.timestamp - a.timestamp)[0];
                return `<li class="messenger__dialog ${activeChatUserId === f.id ? "messenger__dialog--active" : ""}" data-friend-id="${f.id}">
                <div class="messenger__dialog-avatar">${f.avatar}</div>
                <div class="messenger__dialog-info">
                  <span class="messenger__dialog-name">${escapeHtml(f.name)}</span>
                  <span class="messenger__dialog-lastmsg">${last ? escapeHtml(last.text.substring(0, 30)) : "Нет сообщений"}</span>
                </div>
              </li>`;
              })
              .join("")}
          </ul>
        </aside>
        <div class="messenger__chat" id="chatWindow">${activeChatUserId ? renderChatWindow(activeChatUserId) : '<p style="padding:2rem;">Выберите диалог</p>'}</div>
      </div>
    `;
    document.querySelectorAll(".messenger__dialog").forEach((d) =>
      d.addEventListener("click", () => {
        activeChatUserId = d.dataset.friendId;
        renderMessengerTab();
      }),
    );
    if (activeChatUserId) {
      document
        .getElementById("sendMessageBtn")
        ?.addEventListener("click", sendMessage);
      document
        .getElementById("messageInput")
        ?.addEventListener("keypress", (e) => {
          if (e.key === "Enter") sendMessage();
        });
    }
  }

  function renderChatWindow(friendId) {
    const user = getCurrentUser();
    const friend = user.friends.find((f) => f.id === friendId) || {
      name: "Неизвестный",
      avatar: "👤",
    };
    const msgs = getMessages().filter(
      (m) =>
        (m.from === user.email && m.to === friendId) ||
        (m.from === friendId && m.to === user.email),
    );
    return `
      <div class="messenger__chat-header"><div class="messenger__chat-avatar">${friend.avatar}</div><div><strong>${escapeHtml(friend.name)}</strong></div></div>
      <div class="messenger__messages" id="messagesContainer">${msgs
        .map(
          (m) => `
        <div class="messenger__message ${m.from === user.email ? "messenger__message--outgoing" : "messenger__message--incoming"}">
          <div class="messenger__message-bubble">${escapeHtml(m.text)}</div>
          <span class="messenger__message-time">${new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>`,
        )
        .join("")}
      </div>
      <div class="messenger__input-area">
        <div class="messenger__input-wrapper">
          <button class="messenger__attach-btn" title="Прикрепить файл">📎</button>
          <input type="text" class="messenger__input" id="messageInput" placeholder="Введите сообщение...">
          <button class="btn btn--primary messenger__send-btn" id="sendMessageBtn">Отправить</button>
        </div>
      </div>
    `;
  }

  function sendMessage() {
    const user = getCurrentUser();
    if (!user || !activeChatUserId) return;
    const input = document.getElementById("messageInput");
    if (!input || !input.value.trim()) return;
    const messages = getMessages();
    messages.push({
      id: "m_" + Date.now(),
      from: user.email,
      to: activeChatUserId,
      text: input.value.trim(),
      timestamp: Date.now(),
    });
    saveMessages(messages);
    input.value = "";
    document.getElementById("chatWindow").innerHTML =
      renderChatWindow(activeChatUserId);
    document
      .getElementById("sendMessageBtn")
      .addEventListener("click", sendMessage);
    document
      .getElementById("messageInput")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
      });
    const container = document.getElementById("messagesContainer");
    if (container) container.scrollTop = container.scrollHeight;
    const dialogsList = document.getElementById("dialogsList");
    if (dialogsList) {
      const friends = user.friends || [];
      const allMessages = getMessages();
      dialogsList.innerHTML = friends
        .map((f) => {
          const msgs = allMessages.filter(
            (m) =>
              (m.from === user.email && m.to === f.id) ||
              (m.from === f.id && m.to === user.email),
          );
          const last = msgs.sort((a, b) => b.timestamp - a.timestamp)[0];
          return `<li class="messenger__dialog ${activeChatUserId === f.id ? "messenger__dialog--active" : ""}" data-friend-id="${f.id}">
          <div class="messenger__dialog-avatar">${f.avatar}</div>
          <div class="messenger__dialog-info"><span class="messenger__dialog-name">${escapeHtml(f.name)}</span><span class="messenger__dialog-lastmsg">${last ? escapeHtml(last.text.substring(0, 30)) : "Нет сообщений"}</span></div>
        </li>`;
        })
        .join("");
      document.querySelectorAll(".messenger__dialog").forEach((d) =>
        d.addEventListener("click", () => {
          activeChatUserId = d.dataset.friendId;
          renderMessengerTab();
        }),
      );
    }
  }

  function renderSettingsTab() {
    const user = getCurrentUser();
    const s = user.settings || {};
    const p = user.privacy || {
      posts: "all",
      friendsRequest: "all",
      viewEmail: "all",
      viewFriends: "all",
    };
    settingsTab.innerHTML = `
      <h2 class="tab__title">Настройки</h2>
      <div class="settings-card">
        <h3>Конфиденциальность</h3>
        ${settingToggle("Скрыть профиль", "hideProfile", s.hideProfile)}
        ${settingToggle("Двухфакторная аутентификация (152-ФЗ)", "twoFactorAuth", s.twoFactorAuth !== false)}
        ${settingToggle("Онлайн-статус", "showOnlineStatus", s.showOnlineStatus !== false)}
      </div>
      <div class="settings-card">
        <h3>Уведомления</h3>
        ${settingToggle("Push", "pushNotifications", s.pushNotifications !== false)}
        ${settingToggle("Email-рассылка", "emailNewsletter", s.emailNewsletter)}
        ${settingToggle("Звуки", "messageSounds", s.messageSounds !== false)}
        ${settingToggle("Дни рождения", "birthdayNotifications", s.birthdayNotifications !== false)}
      </div>
      <div class="settings-card" id="privacy-settings-card">
        <h3>Приватность</h3>
        <div class="settings-card__item">
          <div><strong>Кто видит мои посты</strong></div>
          <select id="privacy-posts" class="modal-input">
            <option value="all" ${p.posts === "all" ? "selected" : ""}>Все</option>
            <option value="friends" ${p.posts === "friends" ? "selected" : ""}>Только друзья</option>
            <option value="me" ${p.posts === "me" ? "selected" : ""}>Только я</option>
          </select>
        </div>
        <div class="settings-card__item">
          <div><strong>Кто может отправлять заявки в друзья</strong></div>
          <select id="privacy-friendsRequest" class="modal-input">
            <option value="all" ${p.friendsRequest === "all" ? "selected" : ""}>Все</option>
            <option value="friends" ${p.friendsRequest === "friends" ? "selected" : ""}>Только друзья</option>
            <option value="me" ${p.friendsRequest === "me" ? "selected" : ""}>Только я</option>
          </select>
        </div>
        <div class="settings-card__item">
          <div><strong>Кто видит мой Email</strong></div>
          <select id="privacy-viewEmail" class="modal-input">
            <option value="all" ${p.viewEmail === "all" ? "selected" : ""}>Все</option>
            <option value="friends" ${p.viewEmail === "friends" ? "selected" : ""}>Только друзья</option>
            <option value="me" ${p.viewEmail === "me" ? "selected" : ""}>Только я</option>
          </select>
        </div>
        <div class="settings-card__item">
          <div><strong>Кто видит список моих друзей</strong></div>
          <select id="privacy-viewFriends" class="modal-input">
            <option value="all" ${p.viewFriends === "all" ? "selected" : ""}>Все</option>
            <option value="friends" ${p.viewFriends === "friends" ? "selected" : ""}>Только друзья</option>
            <option value="me" ${p.viewFriends === "me" ? "selected" : ""}>Только я</option>
          </select>
        </div>
      </div>
      <button class="btn btn--primary" id="saveSettingsBtn">Сохранить</button>
    `;
    document.getElementById("saveSettingsBtn").addEventListener("click", () => {
      document.querySelectorAll(".settings-toggle").forEach((t) => {
        user.settings[t.dataset.setting] = t.checked;
      });
      const privacyPosts = document.getElementById("privacy-posts");
      const privacyFriendsRequest = document.getElementById(
        "privacy-friendsRequest",
      );
      const privacyViewEmail = document.getElementById("privacy-viewEmail");
      const privacyViewFriends = document.getElementById("privacy-viewFriends");
      if (
        privacyPosts &&
        privacyFriendsRequest &&
        privacyViewEmail &&
        privacyViewFriends
      ) {
        user.privacy = {
          posts: privacyPosts.value,
          friendsRequest: privacyFriendsRequest.value,
          viewEmail: privacyViewEmail.value,
          viewFriends: privacyViewFriends.value,
        };
      }
      saveCurrentUser(user);
      showAlert("Настройки сохранены", "success");
    });
    document.querySelectorAll(".settings-toggle").forEach((t) =>
      t.addEventListener("change", (e) => {
        user.settings[e.target.dataset.setting] = e.target.checked;
        saveCurrentUser(user);
        if (
          e.target.dataset.setting === "twoFactorAuth" ||
          e.target.dataset.setting === "hideProfile"
        )
          showAlert("Настройки безопасности обновлены по 152-ФЗ", "success");
      }),
    );
  }

  function settingToggle(label, key, checked) {
    return `<div class="settings-card__item"><div><strong>${label}</strong></div><label class="toggle"><input type="checkbox" class="toggle__input settings-toggle" data-setting="${key}" ${checked ? "checked" : ""}><span class="toggle__slider"></span></label></div>`;
  }

  function updateAdminMenu() {
    const currentUser = getCurrentUser();
    const existingAdminBtn = document.querySelector(
      '.sidebar__tab[data-tab="admin"]',
    );
    if (currentUser && currentUser.role === "admin") {
      if (!existingAdminBtn) {
        const nav = document.querySelector(".sidebar__nav");
        const adminBtn = document.createElement("button");
        adminBtn.className = "sidebar__tab";
        adminBtn.setAttribute("data-tab", "admin");
        adminBtn.innerHTML =
          '<span class="sidebar__tab-icon">🛡️</span><span class="sidebar__tab-label">Админка</span>';
        nav.appendChild(adminBtn);
        adminBtn.addEventListener("click", () => switchTab("admin"));
      }
      if (!adminTab) {
        adminTab = document.createElement("div");
        adminTab.id = "adminTab";
        adminTab.className = "tab hidden";
        contentArea.appendChild(adminTab);
      }
    } else {
      if (existingAdminBtn) existingAdminBtn.remove();
      if (adminTab) {
        adminTab.remove();
        adminTab = null;
      }
    }
  }

  function renderAdminTab() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") return;
    const allUsers = getUsers();
    let usersHTML = "";
    for (let email in allUsers) {
      const user = allUsers[email];
      if (user.role === "admin") continue;
      usersHTML += `
        <div class="settings-card__item">
          <div>
            <strong>${escapeHtml(user.firstName)} ${escapeHtml(user.lastName)}</strong>
            <div style="font-size:0.85rem; color:#64748b;">${escapeHtml(email)}</div>
          </div>
          <button class="btn ${user.isBlocked ? "btn--primary" : "btn--danger"} toggle-block-btn" data-email="${email}">
            ${user.isBlocked ? "Разблокировать" : "Заблокировать"}
          </button>
        </div>
      `;
    }
    adminTab.innerHTML = `
      <h2 class="tab__title">Панель администратора</h2>
      <div class="settings-card">
        <h3>Пользователи</h3>
        ${usersHTML}
      </div>
    `;
    document.querySelectorAll(".toggle-block-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const email = e.target.dataset.email;
        const users = getUsers();
        if (users[email]) {
          users[email].isBlocked = !users[email].isBlocked;
          saveUsers(users);
          if (email === currentUser.email) {
            currentUser.isBlocked = users[email].isBlocked;
          }
          renderAdminTab();
          showAlert(
            users[email].isBlocked
              ? "Пользователь заблокирован"
              : "Пользователь разблокирован",
            "success",
          );
        }
      });
    });
  }

  function bindEvents() {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      login();
    });
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      register();
    });
    goToRegisterBtn.addEventListener("click", showRegisterScreen);
    goToLoginBtn.addEventListener("click", showLoginScreen);
    sidebarTabs.forEach((btn) =>
      btn.addEventListener("click", () => switchTab(btn.dataset.tab)),
    );
    logoutBtn.addEventListener("click", () => {
      clearCurrentUserEmail();
      showLoginScreen();
      showAlert("Вы вышли из аккаунта", "info");
    });
    document
      .getElementById("saveEditProfileBtn")
      .addEventListener("click", saveProfileChanges);
    document
      .getElementById("cancelEditProfileBtn")
      .addEventListener("click", closeEditProfileModal);
    document
      .getElementById("createCommunitySubmitBtn")
      .addEventListener("click", createCommunitySubmit);
    document
      .getElementById("cancelCreateCommunityBtn")
      .addEventListener("click", closeCreateCommunityModal);
  }

  function initApp() {
    loginScreen = document.getElementById("loginScreen");
    registerScreen = document.getElementById("registerScreen");
    mainScreen = document.getElementById("mainScreen");
    loginForm = document.getElementById("loginForm");
    registerForm = document.getElementById("registerForm");
    loginEmail = document.getElementById("loginEmail");
    loginPassword = document.getElementById("loginPassword");
    loginEmailError = document.getElementById("loginEmailError");
    loginPasswordError = document.getElementById("loginPasswordError");
    regFirstName = document.getElementById("regFirstName");
    regLastName = document.getElementById("regLastName");
    regCity = document.getElementById("regCity");
    regUniversity = document.getElementById("regUniversity");
    regEmail = document.getElementById("regEmail");
    regPassword = document.getElementById("regPassword");
    regFirstNameError = document.getElementById("regFirstNameError");
    regLastNameError = document.getElementById("regLastNameError");
    regCityError = document.getElementById("regCityError");
    regUniversityError = document.getElementById("regUniversityError");
    regEmailError = document.getElementById("regEmailError");
    regPasswordError = document.getElementById("regPasswordError");
    goToRegisterBtn = document.getElementById("goToRegisterBtn");
    goToLoginBtn = document.getElementById("goToLoginBtn");
    logoutBtn = document.getElementById("logoutBtn");
    sidebarTabs = document.querySelectorAll(".sidebar__tab");
    contentArea = document.getElementById("contentArea");
    profileTab = document.getElementById("profileTab");
    friendsTab = document.getElementById("friendsTab");
    communitiesTab = document.getElementById("communitiesTab");
    messengerTab = document.getElementById("messengerTab");
    settingsTab = document.getElementById("settingsTab");
    friendProfileTab = document.getElementById("friendProfileTab");
    editProfileModal = document.getElementById("editProfileModal");
    createCommunityModal = document.getElementById("createCommunityModal");

    adminTab = document.getElementById("adminTab");

    initializeData();
    bindEvents();

    if (getCurrentUserEmail()) {
      if (getCurrentUser()) showMainScreen();
      else {
        clearCurrentUserEmail();
        showLoginScreen();
      }
    } else {
      showLoginScreen();
    }
  }

  document.addEventListener("DOMContentLoaded", initApp);
})();
