const mutex = (() => {
  let isLocked = false;
  let unlockKey = Math.random();

  const lock = () => {
    if (isLocked)
      return false;

    isLocked = true;
    return unlockKey = Math.random();
  };

  const unlock = (key) => {
    if (key === unlockKey && isLocked) {
      return isLocked = false;
    }
    return true;
  };

  return {
    lock, unlock
  };
})();
exports.mutex = mutex;
