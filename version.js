async function getVersion() {
  const response = await fetch('/version');
  const version = await response.text();
  document.querySelector('#versionEl').innerText = version;
}
