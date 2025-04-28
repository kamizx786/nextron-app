import path from "path";
import { app, ipcMain, Menu, dialog } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { spawn } from "child_process";
import fs from "fs";
import os from "os";

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();
  // // ✅ Check & Install VC++ before doing anything else
  // const vcrInstallerPath = isProd
  //   ? path.join(process.resourcesPath, "resources", "install_vcredist.bat")
  //   : path.join(process.cwd(), "resources", "install_vcredist.bat");
  // const systemDllPath = path.join(
  //   process.env["WINDIR"] || "C:\\Windows",
  //   "System32",
  //   "msvcp140.dll"
  // );

  // const systemDllPath1 = path.join(
  //   process.env["WINDIR"] || "C:\\Windows",
  //   "System32",
  //   "msvcp140_1.dll"
  // );

  // // Check if either of the required VC++ runtime DLLs exists
  // if (!fs.existsSync(systemDllPath) || !fs.existsSync(systemDllPath1)) {
  //   console.log("VC++ Runtime not found. Installing...");

  //   const installerProcess = spawn(vcrInstallerPath, [], {
  //     detached: true,
  //     shell: true,
  //     stdio: "ignore",
  //   });

  //   installerProcess.on("exit", (code) => {
  //     if (code === 0) {
  //       console.log("VC++ Runtime installation complete.");
  //     } else {
  //       console.error("VC++ Runtime installation failed with code:", code);
  //     }
  //   });

  //   installerProcess.unref(); // Let the process run in the background
  // } else {
  //   console.log("VC++ Runtime is already installed.");
  // }

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  const defaultMenu = Menu.getApplicationMenu();

  const updatedMenuTemplate = [];

  defaultMenu.items.forEach((item) => {
    if (item.label === 'Help') {
      updatedMenuTemplate.push({
        label: 'Help',
        submenu: [
          {
            label: '📘 Help & User Guide',
            click: () => {
              const message = `
1. Open the application by double-clicking the app icon.
2. Click on the "Upload Image" button to select a photo of a wheat leaf from your device.
3. After uploading, click "Detect Disease" to start the analysis.
4. Ensure only the leaf is visible, avoid backgrounds.
5. Avoid blurry or low-resolution photos.

Q: Can I use this on other crops?
A: This app is optimized for wheat leaves only.
              `;
              dialog.showMessageBox({
                type: 'info',
                title: 'Help & User Guide',
                message: 'How to Use the Application',
                detail: message,
              });
            },
          },
        ],
      });
    } else {
      // Push the existing menu item unchanged
      updatedMenuTemplate.push(item);
    }
  });

  const newMenu = Menu.buildFromTemplate(updatedMenuTemplate);
  Menu.setApplicationMenu(newMenu);

  if (isProd) {
    await mainWindow.loadURL("app://./home");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.on("message", async (event, arg) => {
  event.reply("message", `${arg} World!`);
});

ipcMain.handle("predict-image", async (event, { imageData, fileName }) => {
  try {
    // Get the path to the ONNX prediction executable
    const scriptPath = isProd
      ? path.join(process.resourcesPath, "resources", "app.exe")
      : path.join(process.cwd(), "resources", "app.exe");

    // Create a temporary directory for the image
    const tempDir = path.join(os.tmpdir(), "image-prediction");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save the image temporarily
    const tempImagePath = path.join(tempDir, fileName);
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    fs.writeFileSync(tempImagePath, Buffer.from(base64Data, "base64"));

    return new Promise((resolve, reject) => {
      let scriptOutput = "";
      let errorOutput = "";

      const process = spawn(scriptPath, [tempImagePath]);

      process.stdout.on("data", (data) => {
        scriptOutput += data.toString();
      });

      process.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      process.on("close", (code) => {
        // Clean up the temporary file
        try {
          fs.unlinkSync(tempImagePath);
        } catch (err) {
          // Silently handle cleanup errors
        }

        if (code === 0) {
          try {
            const predictedClass = scriptOutput;
            resolve(predictedClass);
          } catch (err) {
            reject(
              new Error("Failed to parse prediction output: " + err.message)
            );
          }
        } else {
          reject(
            new Error(
              `Prediction failed with code: ${code}\nError: ${errorOutput}`
            )
          );
        }
      });

      process.on("error", (err) => {
        // Clean up the temporary file in case of error
        try {
          fs.unlinkSync(tempImagePath);
        } catch (cleanupErr) {
          // Silently handle cleanup errors
        }
        reject(err);
      });
    });
  } catch (error) {
    throw error;
  }
});
