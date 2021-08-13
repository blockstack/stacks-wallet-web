function openNewTabWithWallet() {
  return chrome.tabs.create({ url: 'index.html' });
}

export function initContextMenuActions() {
  chrome.contextMenus.removeAll();

  chrome.contextMenus.create({
    title: 'Open Hiro Wallet in a new tab',
    contexts: ['browser_action'],
    async onclick() {
      await openNewTabWithWallet();
    },
  });
}
