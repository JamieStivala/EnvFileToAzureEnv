const fs = require('fs').promises;

async function loadFile(fileName){
    let file = await fs.readFile(fileName, "utf8");

    return file
        .split("\n")
        .map(line => line.split('#')[0].trim()) // Remove comments and trim whitespace
        .filter(line => line.length > 0) // Filter out blank lines
        .map(line => line.split(/=(.*)/s).slice(0, -1)); // Process remaining lines
}

async function getFileList(directory = "env/"){
    let files = await fs.readdir(directory);
    return files
        .filter(file => file.endsWith(".env"))
        .map(file => `${directory}${file}`);
}

async function processFiles(inputDirectory = "env/", output = "azure-environment.json"){
    let environmentFiles = await getFileList(inputDirectory);
    if(environmentFiles.length === 0) throw new Error("No files found in env/*.env.");

    let unloadedFiles = environmentFiles.map(loadFile);
    let loaded = (await Promise.all(unloadedFiles)).flat();
    if(loaded.length === 0) throw new Error("No environment variables found in env/*.env.");

    let azureEnvironment = loaded.map(line => ({ name: line[0], value: line[1], slotSetting: false }));
    await fs.writeFile(output, JSON.stringify(azureEnvironment, null, 2));
}


processFiles().then()


