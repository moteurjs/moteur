import * as fs from "node:fs";
import * as path from "node:path";

function packageDist(packageName: string): string {
    return path.join("packages", packageName, "dist");
}

function createDist() {
    if (fs.existsSync("dist")) fs.rmSync("dist", { recursive: true });
}

function getFiles(nodePath: string): string[] {
    if (!fs.statSync(nodePath).isDirectory()) return [nodePath];

    return fs
        .readdirSync(nodePath)
        .flatMap((node) => getFiles(path.join(nodePath, node)));
}

function replaceAbsoluteInclude(relativePath: string, data: string): string {
    const fileDepth = relativePath.split("/").length;
    const relativeInclude = new Array(fileDepth).fill("..").join("/") + "/";

    return data.replaceAll("@moteur/", relativeInclude);
}

function copyJS(
    packageName: string,
    relativePath: string,
    srcPath: string,
    destPath: string,
) {
    let data = fs.readFileSync(srcPath).toString("utf8");
    data = replaceAbsoluteInclude(relativePath, data);

    fs.writeFileSync(destPath, data);

    srcPath = path.join(
        "packages",
        packageName,
        "src",
        relativePath.replace(/.js$/, ".ts"),
    );
    destPath = destPath.replace(/.js$/, ".ts");

    data = fs.readFileSync(srcPath).toString("utf8");
    data = replaceAbsoluteInclude(relativePath, data);

    fs.writeFileSync(destPath, data);
}

function copyDeclaration(
    relativePath: string,
    srcPath: string,
    destPath: string,
) {
    let data = fs.readFileSync(srcPath).toString("utf8");
    data = replaceAbsoluteInclude(relativePath, data);

    fs.writeFileSync(destPath, data);
}

function copyMap(srcPath: string, destPath: string) {
    let data = fs.readFileSync(srcPath).toString("utf8");
    let json = JSON.parse(data);
    json.sources = [path.basename(srcPath).replace(/.d.ts.map$/, ".ts")];

    fs.writeFileSync(destPath, JSON.stringify(json));
}

function copyFiles() {
    const packages = fs.readdirSync("packages");
    const packageFiles = packages.map(
        (pkg) =>
            [
                pkg,
                getFiles(packageDist(pkg)).map((filePath) =>
                    filePath.slice(packageDist(pkg).length + 1),
                ),
            ] as const,
    );

    packageFiles.forEach(([pkg, files]) => {
        files.forEach((filePath) => {
            console.info("[Pack]", pkg, ">", filePath);

            fs.mkdirSync(path.join("dist", pkg, path.dirname(filePath)), {
                recursive: true,
            });

            const srcPath = path.join(packageDist(pkg), filePath);
            const destPath = path.join("dist", pkg, filePath);

            if (srcPath.endsWith(".js")) {
                copyJS(pkg, filePath, srcPath, destPath);
            } else if (srcPath.endsWith(".d.ts")) {
                copyDeclaration(filePath, srcPath, destPath);
            } else if (srcPath.endsWith(".d.ts.map")) {
                copyMap(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    });
}

function copyPackageJson() {
    const packages = fs.readdirSync("packages");

    const packageJson = {
        ...JSON.parse(fs.readFileSync("package.json").toString("utf8")),
        engines: undefined,
        packageManager: undefined,
        scripts: undefined,
        devDependencies: undefined,
        files: [...packages, "README.md"],
    };

    fs.writeFileSync(
        "dist/package.json",
        JSON.stringify(packageJson, null, 2) + "\n",
    );
    console.info("[Pack] package.json");
}

function copyReadme() {
    fs.copyFileSync("README.md", "dist/README.md");
    console.info("[Pack] README.md");
}

function main() {
    createDist();
    copyFiles();
    copyReadme();
    copyPackageJson();
}

main();
