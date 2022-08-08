// systemDarkMode returns true if system-wide dark mode is enabled.
function systemDarkMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  // getDarkMode returns true if an override value is in localStorage or
  // system-wide dark mode is enabled.
  function getDarkMode() {
    const storedValue = localStorage.getItem('darkMode');
    if (storedValue !== undefined) {
      return storedValue !== 'false';
    }
  
    return systemDarkMode();
  }
  
  // toggleDarkMode toggles if dark mode is enabled and saves it in local storage.
  function toggleDarkMode() {
    const darkMode = getDarkMode();
    localStorage.setItem(
      'darkMode',
      darkMode ? 'false' : 'true',
    );
  
    updateDarkMode();
  }
  
  // updateDarkMode sets the proper classes on the body based on the current state
  function updateDarkMode() {
    if (getDarkMode()) {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  
    // We need a way to show/hide the reset button
    if (!localStorage.getItem('darkMode')) {
      document.body.classList.remove('dark-mode-value-set');
    } else {
      document.body.classList.add('dark-mode-value-set');
    }
  }
  
  // clearDarkMode removes the set value from localStorage and falls back to
  // whatever the OS says.
  function clearDarkMode() {
    localStorage.removeItem('darkMode');
    updateDarkMode();
  }
  
  // Ensure that if the value changes in another tab, all of them will update.
  window.addEventListener('storage', updateDarkMode);
  updateDarkMode();
  
  let element = document.getElementById('dark-mode-toggle');
  element.style.display = 'block';