const FILE_SYSTEM_ID = 'mastermine-drive-local';
const DISPLAY_NAME = 'MasterMine Drive';
const status = document.getElementById('status');
const mountButton = document.getElementById('mount');
const checkButton = document.getElementById('check');

async function getMount() {
  const mounts = await chrome.fileSystemProvider.getAll();
  return mounts.find(mount => mount.fileSystemId === FILE_SYSTEM_ID);
}

async function refreshStatus() {
  try {
    const mount = await getMount();
    status.textContent = mount
      ? 'Mounted as "' + mount.displayName + '". Open the Files app and look in the left sidebar.'
      : 'Not mounted yet. Select “Mount in Files”.';
  } catch (error) {
    status.textContent = 'This provider is only available on ChromeOS. ' + (error.message || '');
  }
}

mountButton.addEventListener('click', async () => {
  mountButton.disabled = true;
  try {
    const existing = await getMount();
    if (!existing) {
      await chrome.fileSystemProvider.mount({
        fileSystemId: FILE_SYSTEM_ID,
        displayName: DISPLAY_NAME,
        writable: true,
        persistent: true,
        openedFilesLimit: 20
      });
    }
    status.textContent = 'MasterMine Drive is mounted. Open the Files app and select it in the left sidebar.';
  } catch (error) {
    status.textContent = 'Could not mount MasterMine Drive: ' + (error.message || 'Unknown error');
  } finally {
    mountButton.disabled = false;
    await refreshStatus();
  }
});

checkButton.addEventListener('click', refreshStatus);
refreshStatus();