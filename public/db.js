let db;

const request = indexedDB.open("BudgetDB", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;

  db.createObjectStore("Budget", {
    autoIncrement: true,
  });
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
  console.error(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["Budget"], "readwrite");
  const budgetStore = transaction.objectStore("Budget");

  budgetStore.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["Budget"], "readwrite");
  const budgetStore = transaction.objectStore("Budget");
  const getAll = budgetStore.getAll();
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          // access your pending object store
          // clear all items in your store
          const transaction = db.transaction(["Budget"], "readwrite");
          const budgetStore = transaction.objectStore("Budget");

          budgetStore.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
