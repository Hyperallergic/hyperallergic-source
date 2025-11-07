/* -----------------------------------------------------------------------------
 * Nested Dropdown Functionality (from Gazet theme)
 * Handles hierarchical navigation menus (items starting with "-" become nested)
 * ----------------------------------------------------------------------------- */

function initDropdown(el, dropdownClass) {
  // Get items
  const navItems = Array.from(el.querySelectorAll('li'));
  const subItems = Array.from(el.querySelectorAll('.is-subitem'));

  // Use DocumentFragment for better performance
  const fragment = document.createDocumentFragment();

  // Remove '-' signs
  subItems.forEach(item => {
    const itemName = item.querySelector('a span');
    if (itemName) {
      itemName.textContent = itemName.textContent.trim().slice(1);
    }
  });

  // Add subitems in place - cleaner logic
  let currentSubMenu = null;
  let currentMainItem = null;

  navItems.forEach((item, index) => {
    const isSubItem = item.classList.contains('is-subitem');
    if (item.classList.contains('is-subitem')) {
      item.setAttribute('role', 'menuitem');
    }

    if (isSubItem) {
      if (!currentSubMenu) {
        currentSubMenu = document.createElement('ul');
        currentSubMenu.setAttribute('data-submenu', '');
        currentSubMenu.setAttribute('id', currentMainItem.getAttribute('data-slug'));
        currentSubMenu.classList = dropdownClass;
        currentMainItem.appendChild(currentSubMenu);
      }
      currentSubMenu.appendChild(item);
    } else {
      currentMainItem = item;
      currentSubMenu = null;

      // Check if next item is subitem to set up main item
      if (navItems[index + 1]?.classList.contains('is-subitem')) {
        item.classList.add('is-mainitem');
      }
    }
  });

  const dropdownMenus = el.querySelectorAll('.is-mainitem')
  const toggle = document.querySelector('[data-dropdown-toggle-template]');

  if (!toggle) return;

  dropdownMenus.forEach(menu => {
    const toggleBtn = toggle.content.firstElementChild.cloneNode(true);
    const menuId = menu.getAttribute('data-slug');
    const submenu = menu.querySelector('ul');

    if (!submenu) return;

    // Enhanced accessibility attributes
    toggleBtn.setAttribute('aria-controls', menuId);
    toggleBtn.setAttribute('aria-label', 'Toggle submenu');
    toggleBtn.setAttribute('aria-haspopup', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');

    menu.setAttribute('aria-haspopup', 'true');
    submenu.setAttribute('role', 'menu');
    submenu.setAttribute('aria-labelledby', menuId);

    // Remove any inline onclick handler and add event listener
    toggleBtn.removeAttribute('onclick');
    toggleBtn.addEventListener('click', toggleDropdown);

    menu.insertBefore(toggleBtn, menu.children[1]);
  });

  // Clean up at the end
  el.appendChild(fragment);
  currentSubMenu = null;
  currentMainItem = null;
}

/* -----------------------------------------------------------------------------
* toggleDropdown
----------------------------------------------------------------------------- */
function toggleDropdown(e) {
  e.preventDefault();

  // Find the parent li element - could be clicked from link or button
  const parentElement = e.currentTarget.closest('li.is-mainitem') || e.currentTarget.parentNode;
  const subMenu = parentElement.querySelector('[data-submenu]');
  const toggle = parentElement.querySelector('button');

  if (!subMenu || !toggle) return;

  const isExpanded = parentElement.hasAttribute('data-dropdown-open');

  // Update parent state
  parentElement.toggleAttribute('data-dropdown-open');

  // Update toggle button state & submenu classes
  toggle.classList.toggle('is-rotated');
  toggle.setAttribute('aria-expanded', !isExpanded);
  subMenu.classList.toggle('is-open');
}

/* -----------------------------------------------------------------------------
* closeDropdowns
----------------------------------------------------------------------------- */
function closeDropdowns(e) {
  const currentMenu = e.target.closest('li.is-mainitem[data-slug]');
  const selector = currentMenu
    ? `[data-dropdown-open]:not([data-slug="${currentMenu.getAttribute('data-slug')}"])`
    : '[data-dropdown-open]';

  document.querySelectorAll(selector).forEach(menu => {
    const subMenu = menu.querySelector('[data-submenu]');
    const toggle = menu.querySelector('button');

    if (!subMenu || !toggle) return;

    // Remove dropdown open state
    menu.removeAttribute('data-dropdown-open');

    // Reset toggle button state
    toggle.classList.remove('is-rotated');
    toggle.setAttribute('aria-expanded', 'false');

    // Hide submenu
    subMenu.classList.remove('is-open');
  });
}

/* -----------------------------------------------------------------------------
 * Overflow Dropdown Functionality
 * Handles "More" menu for items that don't fit in the navigation
 * ----------------------------------------------------------------------------- */

function dropdown() {
    const mediaQuery = window.matchMedia('(max-width: 767px)');

    const head = document.querySelector('.gh-navigation');
    const menu = head.querySelector('.gh-navigation-menu');
    const nav = menu?.querySelector('.nav');
    if (!nav) return;

    const logo = document.querySelector('.gh-navigation-logo');
    const navHTML = nav.innerHTML;

    if (mediaQuery.matches) {
        const items = nav.querySelectorAll('li');
        items.forEach(function (item, index) {
            item.style.transitionDelay = `${0.03 * (index + 1)}s`;
        });
    }

    const makeDropdown = function () {
        if (mediaQuery.matches) return;
        const submenuItems = [];

        while ((nav.offsetWidth + 64) > menu.offsetWidth) {
            if (nav.lastElementChild) {
                submenuItems.unshift(nav.lastElementChild);
                nav.lastElementChild.remove();
            } else {
                break;
            }
        }

        if (!submenuItems.length) {
            head.classList.add('is-dropdown-loaded');
            return;
        }

        const toggle = document.createElement('button');
        toggle.setAttribute('class', 'gh-more-toggle gh-icon-button');
        toggle.setAttribute('aria-label', 'More');
        toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor"><path d="M21.333 16c0-1.473 1.194-2.667 2.667-2.667v0c1.473 0 2.667 1.194 2.667 2.667v0c0 1.473-1.194 2.667-2.667 2.667v0c-1.473 0-2.667-1.194-2.667-2.667v0zM13.333 16c0-1.473 1.194-2.667 2.667-2.667v0c1.473 0 2.667 1.194 2.667 2.667v0c0 1.473-1.194 2.667-2.667 2.667v0c-1.473 0-2.667-1.194-2.667-2.667v0zM5.333 16c0-1.473 1.194-2.667 2.667-2.667v0c1.473 0 2.667 1.194 2.667 2.667v0c0 1.473-1.194 2.667-2.667 2.667v0c-1.473 0-2.667-1.194-2.667-2.667v0z"></path></svg>';

        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'gh-dropdown');

        if (submenuItems.length >= 10) {
            head.classList.add('is-dropdown-mega');
            wrapper.style.gridTemplateRows = `repeat(${Math.ceil(submenuItems.length / 2)}, 1fr)`;
        } else {
            head.classList.remove('is-dropdown-mega');
        }

        submenuItems.forEach(function (child) {
            wrapper.appendChild(child);
        });

        toggle.appendChild(wrapper);
        nav.appendChild(toggle);

        const toggleRect = toggle.getBoundingClientRect();
        const documentCenter = window.innerWidth / 2;

        if (toggleRect.left < documentCenter) {
            wrapper.classList.add('is-left');
        }

        head.classList.add('is-dropdown-loaded');

        window.addEventListener('click', function (e) {
            if (head.classList.contains('is-dropdown-open')) {
                head.classList.remove('is-dropdown-open');
            } else if (toggle.contains(e.target)) {
                head.classList.add('is-dropdown-open');
            }
        });
    }

    imagesLoaded(logo, function () {
        makeDropdown();
    });

    window.addEventListener('load', function () {
        if (!logo) {
            makeDropdown();
        }
    });

    window.addEventListener('resize', function () {
        setTimeout(() => {
            nav.innerHTML = navHTML;
            makeDropdown();
        }, 1);
    });
}
