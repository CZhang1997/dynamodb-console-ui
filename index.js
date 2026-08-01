const { app, BrowserWindow, ipcMain } = require("electron");
const AWS = require("aws-sdk");

let mainWindow;

console.log("starting app");

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  function retrieveAndSendCredentials() {
    AWS.config.credentials = new AWS.SharedIniFileCredentials({});

    AWS.config.credentials.get((err) => {
      if (err) {
        console.error("Error retrieving AWS credentials:", err);
      } else {
        const creds = {
          accessKeyId: AWS.config.credentials.accessKeyId,
          secretAccessKey: AWS.config.credentials.secretAccessKey,
        };
        // Send credentials to the mainWindow
        mainWindow.webContents.send("awsCredentials", creds);
      }
    });
  }
  console.log("loading app " + `${app.getAppPath()}/build/index.html`);
  mainWindow.loadURL(`file://${app.getAppPath()}/build/index.html`);

  // Call the function initially and then set an interval to refresh credentials
  retrieveAndSendCredentials();
  setInterval(retrieveAndSendCredentials, 3000);
});

ipcMain.on("number", (event, value) => {
  console.log(value);
});
